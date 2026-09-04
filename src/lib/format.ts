/**
 * Formatage des montants en francs CFA.
 *
 * Source unique : le projet comptait trois rendus concurrents de la même
 * devise (`1 000 000 FCFA`, `1 000 000 F CFA` via `Intl` avec `currency: 'XOF'`,
 * et des montants bruts `1000000 FCFA`), plus huit `formatPrice`/`formatAmount`
 * redéfinis localement en trois implémentations différentes.
 */

/** Espace insécable : évite qu'un montant soit coupé en fin de ligne. */
const NBSP = ' ';

/** Sépare les milliers sans coller la devise. `1000000` → `1 000 000`. */
export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('fr-FR').format(Math.round(value)).replace(/ |\s/g, NBSP);

/** Montant complet avec devise. `1000000` → `1 000 000 FCFA`. */
export const formatFCFA = (value: number | string | null | undefined): string => {
  const n = typeof value === 'number' ? value : parseAmount(String(value ?? ''));
  return `${formatNumber(n)}${NBSP}FCFA`;
};

/**
 * Forme abrégée pour les tuiles de tableau de bord, où la place manque.
 * `10200000` → `10,2 M FCFA` (et non `10200.0k FCFA`, qui mélangeait
 * notation anglo-saxonne et devise locale).
 */
export const formatFCFACompact = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const millions = value / 1_000_000;
    // Pas de décimale inutile : 6 M plutôt que 6,0 M.
    const rendu = Number.isInteger(millions) ? String(millions) : millions.toFixed(1).replace('.', ',');
    return `${rendu}${NBSP}M${NBSP}FCFA`;
  }
  if (abs >= 1_000) {
    return `${formatNumber(value / 1_000)}${NBSP}k${NBSP}FCFA`;
  }
  return formatFCFA(value);
};

/**
 * Lit un montant saisi par l'utilisateur, quelle que soit sa mise en forme.
 * Tolère les espaces (dont insécables) et les séparateurs de milliers.
 */
export const parseAmount = (value: string): number => {
  if (!value) return 0;
  const nettoye = value.replace(/[\s  ]/g, '').replace(/,/g, '.');
  return parseFloat(nettoye) || 0;
};

/**
 * Masque de saisie : reformate au fil de la frappe en conservant uniquement
 * les chiffres. Utilisé sur les champs monétaires, dont le capital social —
 * le champ le plus sensible du tunnel, qui affichait jusqu'ici `1000000`
 * sous un placeholder promettant `1 000 000`.
 */
export const formatAmountInput = (value: string): string => {
  const chiffres = value.replace(/\D/g, '');
  if (!chiffres) return '';
  return formatNumber(parseInt(chiffres, 10));
};
