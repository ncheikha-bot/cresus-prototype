/**
 * Synchronisation du stockage local avec l'API.
 *
 * Le contexte de l'application range chaque famille de données sous une clé
 * du stockage local, sous forme de liste (ou de table indexée pour
 * l'avancement des dossiers). Ce module observe ces écritures, en déduit les
 * entités réellement modifiées et les envoie une à une : deux personnes qui
 * travaillent sur des dossiers différents ne s'écrasent jamais, ce qu'une
 * synchronisation par liste entière n'aurait pas garanti.
 *
 * Dans l'autre sens, il charge l'état du serveur à l'ouverture de session et
 * applique en direct les écritures des autres postes. Le stockage local
 * devient un cache : l'application continue de le lire comme avant.
 */
import { adresseFlux, apiActive, appeler, ErreurApi, fermerSession, jetonCourant, ouvrirSession } from './api';

type Forme = 'liste' | 'carte';
type Donnees = Record<string, unknown>;

interface Famille {
  collection: string;
  forme: Forme;
  /** Clé du stockage local… */
  cle?: string;
  /** …ou préfixe, pour les familles rangées par utilisateur (`cresus_drafts_<id>`). */
  prefixe?: string;
}

/** L'ordre compte : une société doit exister avant ce qui s'y rattache. */
const FAMILLES: Famille[] = [
  { cle: 'cresus_companies', collection: 'companies', forme: 'liste' },
  { cle: 'cresus_company_processes', collection: 'company-processes', forme: 'carte' },
  { prefixe: 'cresus_drafts_', collection: 'drafts', forme: 'liste' },
  { cle: 'cresus_notifications', collection: 'notifications', forme: 'liste' },
  { cle: 'cresus_appointments', collection: 'appointments', forme: 'liste' },
  { cle: 'cresus_bank_requests', collection: 'bank-requests', forme: 'liste' },
  { cle: 'cresus_modifications', collection: 'modifications', forme: 'liste' },
  { cle: 'cresus_domiciliations', collection: 'domiciliations', forme: 'liste' },
  { cle: 'cresus_branding_projects', collection: 'branding-orders', forme: 'liste' },
];

const familleDe = (cle: string): Famille | undefined =>
  FAMILLES.find(f => f.cle === cle || (f.prefixe !== undefined && cle.startsWith(f.prefixe)));

const rang = (collection: string) => FAMILLES.findIndex(f => f.collection === collection);

/**
 * Sérialisation à clés triées.
 *
 * PostgreSQL range les clés d'un objet JSON à sa façon : sans tri, un objet
 * revenu du serveur paraîtrait différent de celui envoyé, et serait renvoyé
 * à l'infini.
 */
const trier = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(trier);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.keys(v as Donnees).sort().map(k => [k, trier((v as Donnees)[k])]),
    );
  }
  return v;
};
const canonique = (v: unknown) => JSON.stringify(trier(v));

const entrees = (f: Famille, valeur: unknown): Array<[string, Donnees]> => {
  if (f.forme === 'carte') {
    return valeur && typeof valeur === 'object' && !Array.isArray(valeur)
      ? (Object.entries(valeur as Record<string, Donnees>) as Array<[string, Donnees]>)
      : [];
  }
  return Array.isArray(valeur)
    ? (valeur as Donnees[]).filter(e => e && typeof e.id === 'string').map(e => [e.id as string, e])
    : [];
};

const lireLocal = (cle: string): unknown => {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? JSON.parse(brut) : undefined;
  } catch {
    return undefined;
  }
};

const ecrireLocal = (cle: string, valeur: unknown) => {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    /* cache local indisponible : l'état reste celui de la mémoire */
  }
};

const clesLocales = (prefixe: string): string[] => {
  try {
    return Object.keys(localStorage).filter(k => k.startsWith(prefixe));
  } catch {
    return [];
  }
};

// ── Ce que le serveur est réputé connaître ─────────────────────────────────
//
// Pour chaque clé locale, l'empreinte de chaque entité telle qu'on la sait
// enregistrée. Une écriture locale n'envoie que les entités dont l'empreinte
// a changé.

const reference = new Map<string, Map<string, string>>();

const empreintes = (f: Famille, valeur: unknown) =>
  new Map(entrees(f, valeur).map(([id, d]) => [id, canonique(d)]));

/**
 * Prend le cache local comme point de départ.
 *
 * Sans cela, la première écriture après connexion enverrait tout le cache —
 * y compris des copies périmées, qui écraseraient des versions plus récentes
 * enregistrées depuis un autre poste. Seules les modifications faites à
 * partir de maintenant partent au serveur ; l'hydratation remplace ensuite
 * le cache par l'état réel.
 */
const photographierCache = () => {
  reference.clear();
  for (const f of FAMILLES) {
    const cles = f.prefixe ? clesLocales(f.prefixe) : [f.cle!];
    for (const cle of cles) reference.set(cle, empreintes(f, lireLocal(cle)));
  }
};

// ── Envoi ──────────────────────────────────────────────────────────────────

interface Operation {
  collection: string;
  id: string;
  /** `null` : suppression. */
  data: Donnees | null;
}

const enAttente = new Map<string, Operation>();
let minuterie: ReturnType<typeof setTimeout> | null = null;
let envoiEnCours = false;
let sessionActive = false;

const planifier = (delai = 80) => {
  if (minuterie) return;
  minuterie = setTimeout(() => {
    minuterie = null;
    void envoyer();
  }, delai);
};

const envoyer = async () => {
  if (envoiEnCours) return;
  // Sans jeton, inutile d'essuyer des refus : on attend la fin de la connexion.
  if (!jetonCourant()) {
    if (enAttente.size) planifier(1000);
    return;
  }
  envoiEnCours = true;
  try {
    while (enAttente.size) {
      // Créations et mises à jour d'abord, dans l'ordre des familles ; les
      // suppressions ensuite.
      const lot = [...enAttente.values()].sort(
        (a, b) => Number(a.data === null) - Number(b.data === null) || rang(a.collection) - rang(b.collection),
      );
      enAttente.clear();

      for (const [rangDansLot, op] of lot.entries()) {
        const chemin = `/collections/${op.collection}/${encodeURIComponent(op.id)}`;
        try {
          await (op.data
            ? appeler(chemin, { method: 'PUT', body: JSON.stringify({ data: op.data }) })
            : appeler(chemin, { method: 'DELETE' }));
        } catch (erreur) {
          if (erreur instanceof ErreurApi && erreur.statut >= 400 && erreur.statut < 500 && erreur.statut !== 401) {
            // Refus définitif (droits, données invalides) : réessayer n'y changerait rien.
            console.warn(`Écriture refusée par le serveur : ${op.collection}/${op.id}`, erreur.message);
            continue;
          }
          // Réseau coupé, serveur qui démarre, jeton à renouveler : on remet le
          // reste du lot en file, sans écraser ce qui a été modifié entre-temps.
          for (const reste of lot.slice(rangDansLot)) {
            const cle = `${reste.collection}/${reste.id}`;
            if (!enAttente.has(cle)) enAttente.set(cle, reste);
          }
          planifier(3000);
          return;
        }
      }
    }
  } finally {
    envoiEnCours = false;
  }
};

/**
 * Appelée par `storage.ts` à chaque écriture locale.
 *
 * Compare la nouvelle valeur à ce que le serveur connaît et met en file les
 * entités créées, modifiées ou retirées.
 */
export const signalerEcriture = (cle: string, valeur: unknown): void => {
  if (!apiActive || !sessionActive) return;
  const f = familleDe(cle);
  if (!f) return;

  const avant = reference.get(cle) ?? new Map<string, string>();
  const apres = new Map<string, string>();
  for (const [id, data] of entrees(f, valeur)) {
    const empreinte = canonique(data);
    apres.set(id, empreinte);
    if (avant.get(id) !== empreinte) enAttente.set(`${f.collection}/${id}`, { collection: f.collection, id, data });
  }
  for (const id of avant.keys()) {
    if (!apres.has(id)) enAttente.set(`${f.collection}/${id}`, { collection: f.collection, id, data: null });
  }
  reference.set(cle, apres);
  if (enAttente.size) planifier();
};

// ── Réception ──────────────────────────────────────────────────────────────

const abonnes = new Set<(cle: string) => void>();

/** Prévient quand une clé locale a été réécrite depuis le serveur. */
export const surChangement = (rappel: (cle: string) => void): (() => void) => {
  abonnes.add(rappel);
  return () => abonnes.delete(rappel);
};

const notifier = (cle: string) => abonnes.forEach(rappel => rappel(cle));

/** Remplace le cache local par l'état du serveur. */
export const hydrater = async (): Promise<void> => {
  const tout = await appeler<Record<string, Array<{ id: string; data: Donnees }>>>('/collections');

  for (const f of FAMILLES) {
    const lignes = tout[f.collection] ?? [];

    if (f.prefixe) {
      // Les brouillons se rangent par auteur ; une clé locale sans
      // équivalent serveur est un reste de cache, vidé.
      const parCle = new Map<string, Donnees[]>(clesLocales(f.prefixe).map(c => [c, []]));
      for (const { id, data } of lignes) {
        if (typeof data.userId !== 'string') continue;
        const cle = f.prefixe + data.userId;
        parCle.set(cle, [...(parCle.get(cle) ?? []), { ...data, id }]);
      }
      for (const [cle, liste] of parCle) {
        ecrireLocal(cle, liste);
        reference.set(cle, empreintes(f, liste));
        notifier(cle);
      }
      continue;
    }

    const valeur =
      f.forme === 'carte'
        ? Object.fromEntries(lignes.map(l => [l.id, l.data]))
        : lignes.map(l => ({ ...l.data, id: l.id }));
    ecrireLocal(f.cle!, valeur);
    reference.set(f.cle!, empreintes(f, valeur));
    notifier(f.cle!);
  }
};

type Evenement =
  | { type: 'upsert' | 'delete'; collection: string; id: string; data?: Donnees }
  | { type: 'reset' };

/** Clé locale qui contient déjà une entité (pour les familles par auteur). */
const cleContenant = (f: Famille, id: string): string | undefined =>
  [...reference.entries()].find(([cle, ids]) => cle.startsWith(f.prefixe!) && ids.has(id))?.[0];

const appliquer = (evenement: Evenement) => {
  if (evenement.type === 'reset') {
    // L'administration a remis la démonstration à zéro : le cache suit.
    for (const f of FAMILLES) {
      const cles = f.prefixe ? clesLocales(f.prefixe) : [f.cle!];
      for (const cle of cles) {
        const vide = f.forme === 'carte' ? {} : [];
        ecrireLocal(cle, vide);
        reference.set(cle, new Map());
        notifier(cle);
      }
    }
    enAttente.clear();
    return;
  }

  const f = FAMILLES.find(x => x.collection === evenement.collection);
  if (!f) return;
  const cle = f.prefixe
    ? typeof evenement.data?.userId === 'string'
      ? f.prefixe + evenement.data.userId
      : cleContenant(f, evenement.id)
    : f.cle!;
  if (!cle) return;

  const actuel = lireLocal(cle);
  let suivant: unknown;
  if (f.forme === 'carte') {
    const table = { ...((actuel as Record<string, Donnees>) ?? {}) };
    if (evenement.type === 'delete') delete table[evenement.id];
    else table[evenement.id] = evenement.data ?? {};
    suivant = table;
  } else {
    const liste = Array.isArray(actuel) ? (actuel as Donnees[]) : [];
    if (evenement.type === 'delete') {
      suivant = liste.filter(e => e?.id !== evenement.id);
    } else {
      const entite = { ...evenement.data, id: evenement.id };
      const rangActuel = liste.findIndex(e => e?.id === evenement.id);
      suivant =
        rangActuel >= 0 ? liste.map((e, k) => (k === rangActuel ? entite : e)) : [entite, ...liste];
    }
  }

  // Seule l'entité reçue change de statut : les autres peuvent porter des
  // modifications locales pas encore envoyées, qu'il ne faut pas marquer
  // comme connues du serveur.
  const ids = reference.get(cle) ?? new Map<string, string>();
  if (evenement.type === 'delete') ids.delete(evenement.id);
  else ids.set(evenement.id, canonique(f.forme === 'carte' ? evenement.data ?? {} : { ...evenement.data, id: evenement.id }));
  reference.set(cle, ids);

  // L'écho de sa propre écriture ne change rien : inutile de réveiller l'écran.
  if (canonique(suivant) === canonique(actuel)) return;
  ecrireLocal(cle, suivant);
  notifier(cle);
};

let flux: EventSource | null = null;

const ouvrirFlux = () => {
  flux?.close();
  const adresse = adresseFlux();
  if (!adresse || typeof EventSource === 'undefined') return;

  let coupe = false;
  flux = new EventSource(adresse);
  flux.onmessage = message => {
    try {
      appliquer(JSON.parse(message.data) as Evenement);
    } catch {
      /* message illisible : ignoré */
    }
  };
  // EventSource se reconnecte seul ; ce qui s'est écrit pendant la coupure
  // n'a pas été reçu, d'où une relecture complète au retour.
  flux.onerror = () => {
    coupe = true;
  };
  flux.onopen = () => {
    if (coupe) {
      coupe = false;
      void hydrater().catch(() => {});
    }
  };
};

// ── Session ────────────────────────────────────────────────────────────────

/** Vrai si un serveur est configuré : les données sont alors partagées. */
export const partageActif = apiActive;

/**
 * Ouvre la synchronisation pour l'utilisateur connecté.
 *
 * Appelée à chaque changement d'utilisateur de l'onglet : le passage du
 * client à l'administration recharge ce que l'administration a le droit de
 * voir, et inversement.
 */
export const demarrerSession = async (utilisateurId: string): Promise<void> => {
  if (!apiActive) return;
  photographierCache();
  sessionActive = true;

  await ouvrirSession(utilisateurId);
  try {
    await hydrater();
  } catch (erreur) {
    // Jeton de l'onglet expiré : on en redemande un, une fois.
    if (!(erreur instanceof ErreurApi) || erreur.statut !== 401) throw erreur;
    fermerSession();
    await ouvrirSession(utilisateurId);
    await hydrater();
  }
  ouvrirFlux();
  if (enAttente.size) planifier();
};

export const terminerSession = (): void => {
  flux?.close();
  flux = null;
  sessionActive = false;
  fermerSession();
};
