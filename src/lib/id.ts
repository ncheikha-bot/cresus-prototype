/**
 * Identifiants uniques pour les entités créées côté client.
 *
 * `Date.now()` seul ne suffit pas : deux notifications émises dans la même
 * milliseconde — ce qui arrive à chaque enchaînement du tunnel, « devis validé »
 * puis « statuts reçus » — recevaient le même identifiant. React signalait deux
 * enfants de même clé, et marquer l'une comme lue marquait l'autre.
 */
let compteur = 0;

export const nouvelId = (prefixe: string): string =>
  `${prefixe}-${Date.now().toString(36)}-${(compteur++).toString(36)}`;

/**
 * Référence courte à afficher (devis, déclaration, paiement).
 *
 * Ces numéros étaient calculés en plein rendu, à partir de l'horloge : ils
 * changeaient à chaque re-rendu du composant, sous les yeux de l'utilisateur,
 * et deux ouvertures du même devis donnaient deux numéros. Dérivée d'une graine
 * stable — nom de la société, identifiant du dossier — la référence ne bouge
 * plus.
 */
export const referenceCourte = (prefixe: string, graine: string): string => {
  let empreinte = 0;
  for (let i = 0; i < graine.length; i++) {
    empreinte = (empreinte * 31 + graine.charCodeAt(i)) % 1_000_000;
  }
  return `${prefixe}-${String(empreinte).padStart(6, '0')}`;
};
