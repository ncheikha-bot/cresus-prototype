/**
 * Formes juridiques OHADA gérées par la plateforme.
 *
 * Source unique : ce bloc était dupliqué à l'identique dans
 * `components/mobile/CreateCompany.tsx` et `components/web/WebCreateCompany.tsx`,
 * et les deux copies avaient déjà commencé à diverger.
 */

export interface LegalFormInfo {
  name: string;
  description: string;
  capital: string;
  capitalMin: number;
  associes: string;
  associesMin: number;
  associesMax: number | null;
  avantages: string[];
  inconvenients: string[];
  recommandation: string;
}

export const legalFormInfo: Record<string, LegalFormInfo> = {
  SARL: {
    name: 'SARL - Société à Responsabilité Limitée',
    description: 'La forme la plus courante pour les PME au Sénégal. Idéale pour les entrepreneurs qui souhaitent limiter leur responsabilité.',
    capital: 'Minimum 100 000 FCFA',
    capitalMin: 100000,
    associes: '2 à 50 associés maximum',
    associesMin: 2,
    associesMax: 50,
    avantages: [
      'Responsabilité limitée aux apports',
      'Gérant obligatoire',
      'Capital minimum accessible (100 000 FCFA)',
      'Adapté aux PME et structures familiales'
    ],
    inconvenients: [
      'Cessions de parts encadrées',
      'Maximum 50 associés',
      'Obligations comptables strictes'
    ],
    recommandation: 'Idéale pour les PME et projets familiaux'
  },
  SA: {
    name: 'SA - Société Anonyme',
    description: 'Structure adaptée aux grandes entreprises et projets d\'envergure. Nécessite un PDG et un Conseil d\'administration.',
    capital: 'Minimum 10 000 000 FCFA',
    capitalMin: 10000000,
    associes: 'Minimum 2 associés',
    associesMin: 2,
    associesMax: null,
    avantages: [
      'Crédibilité élevée',
      'Facilite la levée de fonds',
      'PDG + Conseil d\'administration',
      'Peut être cotée en bourse'
    ],
    inconvenients: [
      'Capital minimum très élevé (10M FCFA)',
      'Structure de gouvernance complexe',
      'Coûts de gestion importants',
      'Contrôle strict'
    ],
    recommandation: 'Pour les grands projets et entreprises d\'envergure'
  },
  SAS: {
    name: 'SAS - Société par Actions Simplifiée',
    description: 'Forme moderne et flexible, idéale pour les startups. Capital librement fixé et statuts sur mesure.',
    capital: 'Capital libre (pas de minimum)',
    capitalMin: 0,
    associes: '1 actionnaire minimum',
    associesMin: 1,
    associesMax: null,
    avantages: [
      'Capital libre, pas de minimum',
      'Grande liberté statutaire',
      'Président obligatoire',
      'Facilite l\'entrée d\'investisseurs'
    ],
    inconvenients: [
      'Rédaction des statuts complexe',
      'Coûts de création plus élevés',
      'Nécessite conseil juridique'
    ],
    recommandation: 'Parfaite pour les startups et projets innovants'
  },
  SASU: {
    name: 'SASU - Société par Actions Simplifiée Unipersonnelle',
    description: 'Version unipersonnelle de la SAS. Capital libre et grande flexibilité pour l\'entrepreneur solo.',
    capital: 'Capital libre (pas de minimum)',
    capitalMin: 0,
    associes: '1 seul associé unique',
    associesMin: 1,
    associesMax: 1,
    avantages: [
      'Capital libre, pas de minimum',
      'Contrôle total de l\'entreprise',
      'Grande liberté statutaire',
      'Président obligatoire'
    ],
    inconvenients: [
      'Rédaction des statuts complexe',
      'Coûts de création élevés',
      'Nécessite conseil juridique'
    ],
    recommandation: 'Idéale pour l\'entrepreneur solo innovant'
  },
  SUARL: {
    name: 'SUARL - Société Unipersonnelle à Responsabilité Limitée',
    description: 'Version unipersonnelle de la SARL, parfaite pour l\'entrepreneur solo qui veut limiter sa responsabilité.',
    capital: 'Minimum 100 000 FCFA',
    capitalMin: 100000,
    associes: '1 seul associé unique',
    associesMin: 1,
    associesMax: 1,
    avantages: [
      'Contrôle total de l\'entreprise',
      'Responsabilité limitée aux apports',
      'Gérant obligatoire',
      'Capital accessible (100 000 FCFA)'
    ],
    inconvenients: [
      'Transformation nécessaire si nouveaux associés',
      'Moins de flexibilité que SASU',
      'Capital minimum imposé'
    ],
    recommandation: 'Idéale pour l\'entrepreneur solo classique'
  },
  SNC: {
    name: 'SNC - Société en Nom Collectif',
    description: 'Société de personnes où tous les associés ont la qualité de commerçant. Responsabilité illimitée et solidaire.',
    capital: 'Capital libre (pas de minimum)',
    capitalMin: 0,
    associes: 'Minimum 2 associés',
    associesMin: 2,
    associesMax: null,
    avantages: [
      'Simplicité de constitution',
      'Capital libre, pas de minimum',
      'Grande liberté contractuelle',
      'Gérant associé obligatoire'
    ],
    inconvenients: [
      'Responsabilité illimitée et solidaire',
      'Risque personnel très élevé',
      'Cession de parts très encadrée',
      'Difficultés en cas de mésentente'
    ],
    recommandation: 'Réservée aux associés qui se connaissent très bien'
  },
  SCI: {
    name: 'SCI - Société Civile Immobilière',
    description: 'Société civile dédiée à la gestion immobilière. Objet exclusivement immobilier, régime IR avec option IS.',
    capital: 'Capital libre (pas de minimum)',
    capitalMin: 0,
    associes: 'Minimum 2 associés',
    associesMin: 2,
    associesMax: null,
    avantages: [
      'Capital libre, pas de minimum',
      'Optimisation fiscale (IR avec option IS)',
      'Gestion facilitée du patrimoine immobilier',
      'Transmission simplifiée'
    ],
    inconvenients: [
      'Objet strictement immobilier',
      'Interdiction d\'activité commerciale',
      'Revenus imposés à l\'IR (sauf option IS)',
      'Formalités de gestion'
    ],
    recommandation: 'Exclusivement pour la gestion immobilière'
  }
};

/** Codes des formes juridiques, dans l'ordre d'affichage du sélecteur. */
export const LEGAL_FORM_CODES = Object.keys(legalFormInfo);

/** Retombe sur la SARL pour un code inconnu, comme le faisaient les deux tunnels. */
export const getLegalFormInfo = (legalForm: string): LegalFormInfo =>
  legalFormInfo[legalForm] || legalFormInfo.SARL;

/** Titre du dirigeant selon la forme juridique (gérant, président…). */
export const getDirectorTitle = (legalForm: string): string => {
  const titles: Record<string, string> = {
    SARL: 'gérant',
    SA: "président du Conseil d'Administration",
    SAS: 'président',
    SASU: 'président',
    SUARL: 'gérant unique',
    SNC: 'gérant',
    SCI: 'gérant',
  };
  return titles[legalForm] || 'dirigeant';
};
