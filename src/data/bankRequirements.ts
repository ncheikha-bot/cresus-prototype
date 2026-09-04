// Documents requis par les banques selon la forme juridique

export interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  mandatory: boolean;
  category: 'identity' | 'legal' | 'fiscal' | 'financial' | 'governance';
}

export interface BankRequirementsByLegalForm {
  [bankId: string]: {
    [legalForm: string]: RequiredDocument[];
  };
}

// Documents communs à toutes les formes juridiques
const commonDocuments: RequiredDocument[] = [
  {
    id: 'statuts',
    name: 'Statuts signés et enregistrés',
    description: 'Statuts de la société dûment signés par tous les associés et enregistrés',
    mandatory: true,
    category: 'legal',
  },
  {
    id: 'rccm',
    name: 'RCCM (RC)',
    description: 'Extrait du Registre du Commerce et du Crédit Mobilier',
    mandatory: true,
    category: 'legal',
  },
  {
    id: 'ninea',
    name: 'NINEA',
    description: 'Numéro d\'Identification National des Entreprises et Associations',
    mandatory: true,
    category: 'fiscal',
  },
  {
    id: 'cni_gerant',
    name: 'CNI du représentant légal',
    description: 'Copie certifiée de la carte nationale d\'identité du gérant ou président',
    mandatory: true,
    category: 'identity',
  },
  {
    id: 'justificatif_domicile',
    name: 'Justificatif de domiciliation',
    description: 'Attestation de domiciliation ou bail commercial du siège social',
    mandatory: true,
    category: 'legal',
  },
];

// Documents spécifiques par forme juridique
const specificDocumentsByLegalForm: { [legalForm: string]: RequiredDocument[] } = {
  SARL: [
    {
      id: 'pv_nomination_gerant',
      name: 'PV de nomination du gérant',
      description: 'Procès-verbal de l\'assemblée générale désignant le gérant',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'liste_associes',
      name: 'Liste des associés',
      description: 'Liste complète des associés avec leurs parts sociales respectives',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'certificat_liberation',
      name: 'Certificat de libération du capital',
      description: 'Attestation de dépôt du capital social',
      mandatory: true,
      category: 'financial',
    },
  ],
  SAS: [
    {
      id: 'pv_nomination_president',
      name: 'PV de nomination du président',
      description: 'Procès-verbal de l\'assemblée générale désignant le président',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'liste_actionnaires',
      name: 'Liste des actionnaires',
      description: 'Liste complète des actionnaires avec leurs actions respectives',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'certificat_liberation',
      name: 'Certificat de libération du capital',
      description: 'Attestation de dépôt du capital social (minimum 50%)',
      mandatory: true,
      category: 'financial',
    },
    {
      id: 'pacte_actionnaires',
      name: 'Pacte d\'actionnaires',
      description: 'Document régissant les relations entre actionnaires (si applicable)',
      mandatory: false,
      category: 'governance',
    },
  ],
  SASU: [
    {
      id: 'declaration_actionnaire_unique',
      name: 'Déclaration d\'actionnaire unique',
      description: 'Document attestant de l\'actionnaire unique de la société',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'decision_president',
      name: 'Décision du président',
      description: 'Décisions unilatérales du président concernant la gestion',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'certificat_liberation',
      name: 'Certificat de libération du capital',
      description: 'Attestation de dépôt du capital social (minimum 50%)',
      mandatory: true,
      category: 'financial',
    },
  ],
  SA: [
    {
      id: 'pv_conseil_admin',
      name: 'PV du conseil d\'administration',
      description: 'Procès-verbal du conseil d\'administration',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'liste_administrateurs',
      name: 'Liste des administrateurs',
      description: 'Liste complète des membres du conseil d\'administration',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'liste_actionnaires',
      name: 'Liste des actionnaires',
      description: 'Liste des actionnaires avec répartition du capital',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'certificat_liberation',
      name: 'Certificat de libération du capital',
      description: 'Attestation de dépôt du capital social (minimum 25%)',
      mandatory: true,
      category: 'financial',
    },
    {
      id: 'rapport_commissaire',
      name: 'Rapport du commissaire aux comptes',
      description: 'Désignation du commissaire aux comptes',
      mandatory: true,
      category: 'governance',
    },
  ],
  SNC: [
    {
      id: 'liste_associes',
      name: 'Liste des associés',
      description: 'Liste complète des associés avec leurs parts sociales',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'engagement_solidaire',
      name: 'Engagement solidaire des associés',
      description: 'Document attestant de la responsabilité solidaire et indéfinie',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'cni_associes',
      name: 'CNI de tous les associés',
      description: 'Copies certifiées des CNI de tous les associés gérants',
      mandatory: true,
      category: 'identity',
    },
  ],
  SUARL: [
    {
      id: 'declaration_associe_unique',
      name: 'Déclaration d\'associé unique',
      description: 'Document attestant de l\'associé unique de la SARL',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'decision_gerant',
      name: 'Décisions du gérant unique',
      description: 'Décisions unilatérales du gérant concernant la gestion',
      mandatory: true,
      category: 'governance',
    },
    {
      id: 'certificat_liberation',
      name: 'Certificat de libération du capital',
      description: 'Attestation de dépôt du capital social',
      mandatory: true,
      category: 'financial',
    },
  ],
  'Entreprise Individuelle': [
    {
      id: 'declaration_activite',
      name: 'Déclaration d\'activité',
      description: 'Formulaire de déclaration d\'activité dûment rempli',
      mandatory: true,
      category: 'legal',
    },
    {
      id: 'justificatif_qualification',
      name: 'Justificatif de qualification',
      description: 'Diplômes ou attestations de qualification professionnelle (si applicable)',
      mandatory: false,
      category: 'identity',
    },
  ],
};

// Exigences spécifiques par banque (en plus des documents standard et spécifiques)
export const bankSpecificRequirements: BankRequirementsByLegalForm = {
  boa: {
    SARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SARL,
      {
        id: 'attestation_fiscale',
        name: 'Attestation fiscale',
        description: 'Attestation de régularité fiscale',
        mandatory: false,
        category: 'fiscal',
      },
    ],
    SAS: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SAS,
      {
        id: 'business_plan',
        name: 'Business plan',
        description: 'Plan d\'affaires détaillé (recommandé pour les startups)',
        mandatory: false,
        category: 'financial',
      },
    ],
    SASU: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SASU,
    ],
    SA: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SA,
      {
        id: 'previsionnel_activite',
        name: 'Prévisionnel d\'activité',
        description: 'Prévisions financières sur 3 ans',
        mandatory: true,
        category: 'financial',
      },
    ],
    SNC: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SNC,
    ],
    SUARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SUARL,
    ],
    'Entreprise Individuelle': [
      ...commonDocuments,
      ...specificDocumentsByLegalForm['Entreprise Individuelle'],
    ],
  },
  sgbs: {
    SARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SARL,
      {
        id: 'declaration_fiscale',
        name: 'Déclaration fiscale',
        description: 'Dernière déclaration fiscale (si entreprise existante)',
        mandatory: false,
        category: 'fiscal',
      },
      {
        id: 'extrait_casier',
        name: 'Extrait de casier judiciaire',
        description: 'Casier judiciaire du gérant (moins de 3 mois)',
        mandatory: true,
        category: 'identity',
      },
    ],
    SAS: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SAS,
      {
        id: 'extrait_casier',
        name: 'Extrait de casier judiciaire',
        description: 'Casier judiciaire du président (moins de 3 mois)',
        mandatory: true,
        category: 'identity',
      },
    ],
    SASU: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SASU,
      {
        id: 'extrait_casier',
        name: 'Extrait de casier judiciaire',
        description: 'Casier judiciaire du président (moins de 3 mois)',
        mandatory: true,
        category: 'identity',
      },
    ],
    SA: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SA,
    ],
    SNC: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SNC,
    ],
    SUARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SUARL,
    ],
    'Entreprise Individuelle': [
      ...commonDocuments,
      ...specificDocumentsByLegalForm['Entreprise Individuelle'],
    ],
  },
  ecobank: {
    SARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SARL,
    ],
    SAS: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SAS,
    ],
    SASU: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SASU,
    ],
    SA: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SA,
    ],
    SNC: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SNC,
    ],
    SUARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SUARL,
    ],
    'Entreprise Individuelle': [
      ...commonDocuments,
      ...specificDocumentsByLegalForm['Entreprise Individuelle'],
    ],
  },
  cbao: {
    SARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SARL,
      {
        id: 'previsionnel_activite',
        name: 'Prévisionnel d\'activité',
        description: 'Prévisions d\'activité et de trésorerie',
        mandatory: true,
        category: 'financial',
      },
    ],
    SAS: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SAS,
      {
        id: 'previsionnel_activite',
        name: 'Prévisionnel d\'activité',
        description: 'Prévisions d\'activité et de trésorerie',
        mandatory: true,
        category: 'financial',
      },
    ],
    SASU: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SASU,
    ],
    SA: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SA,
    ],
    SNC: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SNC,
    ],
    SUARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SUARL,
    ],
    'Entreprise Individuelle': [
      ...commonDocuments,
      ...specificDocumentsByLegalForm['Entreprise Individuelle'],
    ],
  },
  uba: {
    SARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SARL,
    ],
    SAS: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SAS,
    ],
    SASU: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SASU,
    ],
    SA: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SA,
    ],
    SNC: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SNC,
    ],
    SUARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SUARL,
    ],
    'Entreprise Individuelle': [
      ...commonDocuments,
      ...specificDocumentsByLegalForm['Entreprise Individuelle'],
    ],
  },
  bicis: {
    SARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SARL,
      {
        id: 'business_plan',
        name: 'Business plan complet',
        description: 'Plan d\'affaires détaillé avec projections financières',
        mandatory: true,
        category: 'financial',
      },
      {
        id: 'garanties',
        name: 'Garanties éventuelles',
        description: 'Documents relatifs aux garanties proposées (si applicable)',
        mandatory: false,
        category: 'financial',
      },
    ],
    SAS: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SAS,
      {
        id: 'business_plan',
        name: 'Business plan complet',
        description: 'Plan d\'affaires détaillé avec projections financières',
        mandatory: true,
        category: 'financial',
      },
    ],
    SASU: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SASU,
      {
        id: 'business_plan',
        name: 'Business plan',
        description: 'Plan d\'affaires simplifié',
        mandatory: true,
        category: 'financial',
      },
    ],
    SA: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SA,
      {
        id: 'references_bancaires',
        name: 'Références bancaires',
        description: 'Références bancaires des principaux actionnaires',
        mandatory: true,
        category: 'financial',
      },
    ],
    SNC: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SNC,
    ],
    SUARL: [
      ...commonDocuments,
      ...specificDocumentsByLegalForm.SUARL,
    ],
    'Entreprise Individuelle': [
      ...commonDocuments,
      ...specificDocumentsByLegalForm['Entreprise Individuelle'],
    ],
  },
};

// Fonction pour obtenir les documents requis selon la banque et la forme juridique
export const getRequiredDocuments = (bankId: string, legalForm: string): RequiredDocument[] => {
  const requirements = bankSpecificRequirements[bankId];
  if (!requirements) {
    return [...commonDocuments];
  }
  
  return requirements[legalForm] || [...commonDocuments];
};

// Fonction pour obtenir les catégories de documents
export const getDocumentCategories = (documents: RequiredDocument[]) => {
  const categories: { [key: string]: RequiredDocument[] } = {
    identity: [],
    legal: [],
    fiscal: [],
    financial: [],
    governance: [],
  };

  documents.forEach((doc) => {
    categories[doc.category].push(doc);
  });

  return categories;
};

// Labels des catégories en français
export const categoryLabels: { [key: string]: string } = {
  identity: 'Pièces d\'identité',
  legal: 'Documents juridiques',
  fiscal: 'Documents fiscaux',
  financial: 'Documents financiers',
  governance: 'Documents de gouvernance',
};
