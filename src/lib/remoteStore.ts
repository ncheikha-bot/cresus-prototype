/**
 * Miroir distant de l'état partagé.
 *
 * Le prototype rangeait tout dans le `localStorage` : chaque navigateur avait sa
 * propre copie, et la boucle client ↔ administration ne fonctionnait qu'entre
 * deux onglets d'une même machine. Pour une démonstration à plusieurs — le
 * client saisit sur son téléphone, l'administration traite depuis son poste — il
 * faut un dépôt commun.
 *
 * Le contrat reste celui du stockage local : une clé, une valeur JSON. Une seule
 * table suffit donc, et les écrans n'ont rien à savoir de tout cela.
 *
 * **Sans configuration, le miroir se désactive** et l'application retrouve
 * exactement son comportement d'origine : c'est ce qui permet de la faire
 * tourner en local, ou de publier une version sans base.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Table du dépôt commun : `cle` (clé primaire), `valeur` (jsonb), `maj_le`. */
const TABLE = 'etat_partage';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const cle = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Vrai si une base est configurée. Lisible par les écrans qui l'annoncent. */
export const partageActif = Boolean(url && cle);

const client: SupabaseClient | null = partageActif
  ? createClient(url!, cle!, { auth: { persistSession: false } })
  : null;

/**
 * Écritures venues du réseau, à ne pas renvoyer au réseau.
 *
 * Sans cette marque, recevoir une valeur la ferait aussitôt réémettre : deux
 * navigateurs se renverraient leurs écritures indéfiniment.
 */
const recuesDuReseau = new Set<string>();

/** Lit tout le dépôt commun. Tableau vide si la base est absente ou injoignable. */
export const chargerEtatDistant = async (): Promise<{ cle: string; valeur: unknown }[]> => {
  if (!client) return [];
  try {
    const { data, error } = await client.from(TABLE).select('cle, valeur');
    if (error) throw error;
    return (data ?? []) as { cle: string; valeur: unknown }[];
  } catch (erreur) {
    // Une base injoignable ne doit pas empêcher l'application de démarrer :
    // elle repart alors sur son stockage local.
    console.warn('État partagé indisponible, reprise sur le stockage local.', erreur);
    return [];
  }
};

/** Publie une valeur. Sans effet si l'écriture vient elle-même du réseau. */
export const pousserEtatDistant = (nom: string, valeur: unknown): void => {
  if (!client) return;
  if (recuesDuReseau.has(nom)) {
    recuesDuReseau.delete(nom);
    return;
  }
  void client
    .from(TABLE)
    .upsert({ cle: nom, valeur, maj_le: new Date().toISOString() }, { onConflict: 'cle' })
    .then(({ error }) => {
      if (error) console.warn(`Écriture partagée refusée pour « ${nom} ».`, error);
    });
};

/**
 * S'abonne aux écritures des autres postes.
 *
 * `auChangement` reçoit la clé et sa nouvelle valeur, exactement comme le
 * mécanisme inter-onglets : les deux chemins se rejoignent, et l'application ne
 * distingue pas un autre onglet d'un autre appareil.
 */
export const souscrireEtatDistant = (
  auChangement: (nom: string, valeur: unknown) => void,
): (() => void) => {
  if (!client) return () => {};

  const canal = client
    .channel('etat-partage')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      charge => {
        const ligne = charge.new as { cle?: string; valeur?: unknown } | null;
        if (!ligne?.cle) return;
        recuesDuReseau.add(ligne.cle);
        auChangement(ligne.cle, ligne.valeur);
      },
    )
    .subscribe();

  return () => {
    void client.removeChannel(canal);
  };
};
