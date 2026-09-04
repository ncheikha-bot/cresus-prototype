import type { Company } from '../types';

/**
 * Compteurs du tableau de bord client.
 *
 * Les deux interfaces calculaient les mêmes libellés différemment : « Mes
 * sociétés » comptait *toutes* les sociétés sur mobile mais seulement les
 * sociétés immatriculées sur le web, et « en cours » additionnait les
 * brouillons et les demandes bancaires d'un côté, les dossiers non terminés
 * de l'autre. Le même utilisateur voyait 10 et 3, 4 et 7.
 */
export interface ClientCounters {
  /** Sociétés effectivement immatriculées. */
  created: number;
  /** Dossiers soumis et non terminés. Les brouillons sont comptés à part. */
  inProgress: number;
  /** Brouillons non soumis. */
  drafts: number;
}

export const getClientCounters = (
  companies: Company[],
  clientId: string | undefined,
  draftsCount: number,
): ClientCounters => {
  if (!clientId) return { created: 0, inProgress: 0, drafts: draftsCount };

  const miennes = companies.filter(c => c.clientId === clientId || c.userId === clientId);
  const created = miennes.filter(c => c.status === 'completed').length;

  return {
    created,
    // Les brouillons ont leur propre section et leur propre compte : les ajouter
    // ici donnait « 8 en cours » au tableau de bord contre « En cours (7) » sur
    // l'écran des sociétés, pour la même notion.
    inProgress: miennes.length - created,
    drafts: draftsCount,
  };
};
