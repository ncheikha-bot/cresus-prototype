import {
  BadgeCheck,
  BarChart3,
  Building2,
  TrendingUp,
} from '../components/ui/icons';
import type { IconeCresus } from '../components/ui/icons';
import type { CompanyType } from '../types';

export type AccountingPackType = 'essentiel' | 'standard' | 'business' | 'premium';
export type AccountingStatus = 'setup' | 'active' | 'suspended' | 'closed';
export type MonthStatus = 'waiting_documents' | 'in_progress' | 'validation' | 'completed';
export type TaxDeclarationStatus = 'to_prepare' | 'in_progress' | 'declared' | 'paid';
export type DocumentStatus = 'pending' | 'validated' | 'rejected' | 'received' | 'processing' | 'integrated';

export interface AccountingPack {
  id: AccountingPackType;
  name: string;
  description: string;
  price: number;
  emoji: IconeCresus;
  features: string[];
  included: string[];
}

export interface AccountingFolder {
  id: string;
  companyId: string;
  companyName: string;
  pack: AccountingPackType;
  status: AccountingStatus;
  createdAt: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  sector: string;
  taxRegime: string;
  vatSubject: boolean;
  vatPeriod?: 'monthly' | 'quarterly';
  employeeCount: number;
  monthlyInvoiceCount: string;
  mandateSigned: boolean;
  currentMonth?: MonthlyAccountingData;
  activatedAt?: string; // Date d'activation du dossier (tri « date » côté comptable)
}

export interface MonthlyAccountingData {
  month: string;
  status: MonthStatus;
  deadline?: string; // Échéance de clôture du mois (calcul d'urgence)
  revenue?: number;
  expenses?: number;
  result?: number;
  vatCollected?: number;
  vatDeductible?: number;
  vatToPay?: number;
  missingDocuments: string[];
  documentsCount: {
    received: number;
    processed: number;
    total: number;
    validated?: number;
    rejected?: number;
  };
}

export interface TaxDeclaration {
  id: string;
  folderId: string;
  type: string;
  name?: string; // Libellé affiché (tableau de bord comptable mobile)
  frequency?: string; // Périodicité affichée (mensuelle, trimestrielle…)
  nextDeadline?: string; // Prochaine échéance affichée
  dueDate: string;
  status: TaxDeclarationStatus;
  estimatedAmount?: number;
  finalAmount?: number;
  filingDate?: string;
  receiptUrl?: string;
  description: string;
}

export interface AccountingDocument {
  id: string;
  folderId: string;
  month: string;
  type: 'invoice' | 'receipt' | 'bank_statement' | 'payroll' | 'other';
  name: string;
  fileName?: string; // Nom du fichier d'origine
  uploadedAt: string;
  uploadedBy: 'client' | 'admin';
  status: DocumentStatus;
  amount?: number;
  notes?: string;
  validatedAt?: string;
  validatedBy?: string;
  rejectionReason?: string;
}

export interface AnnualClosing {
  id: string;
  folderId: string;
  year: string;
  status: 'preparation' | 'closing' | 'tax_filing' | 'assembly' | 'completed';
  documents: {
    balance?: string;
    income_statement?: string;
    tax_return?: string;
    assembly_minutes?: string;
  };
  completedAt?: string;
}

export const ACCOUNTING_PACKS: AccountingPack[] = [
  {
    id: 'essentiel',
    name: 'Pack Essentiel',
    description: 'Pour les structures en démarrage ou à faible volume',
    price: 80000,
    emoji: BarChart3,
    features: [
      'Tenue comptable mensuelle',
      'Classement et organisation des pièces (physique/numérique)',
      'Déclarations fiscales périodiques applicables (TVA, retenues, taxes selon régime)',
      'Suivi mensuel de conformité (pièces manquantes, cohérence facturation/banque)',
      'Assistance courante (questions, points de situation)',
      'Paie & déclarations sociales : jusqu\'à 3 salariés inclus',
    ],
    included: [
      'Saisie des écritures courantes',
      'Rapprochement bancaire',
      'Déclarations fiscales obligatoires',
      'Au-delà (effectif/volume/complexité) : avenant / devis',
    ],
  },
  {
    id: 'standard',
    name: 'Pack Standard',
    description: 'Pour PME classiques avec suivi renforcé',
    price: 100000,
    emoji: TrendingUp,
    features: [
      'Tout le Pack Essentiel',
      'Suivi mensuel plus détaillé (mini-reporting : synthèse encaissements/dépenses + alertes)',
      'Conseil fiscal courant (optimisation basique, choix pratiques)',
      'Paie : quota inclus supérieur à Essentiel',
    ],
    included: [
      'Mini-reporting mensuel',
      'Alertes de conformité',
      'Optimisation fiscale basique',
      'Au-delà (effectif/volume/complexité) : avenant / devis',
    ],
  },
  {
    id: 'business',
    name: 'Pack Business',
    description: 'Pour entreprises avec besoins de conformité élargie',
    price: 150000,
    emoji: Building2,
    features: [
      'Tout le Pack Standard',
      'Revue mensuelle renforcée (contrôles + recommandations)',
      'Préparation en cas de demandes DGID / contrôles simples (pré-dossier, réponses, pièces)',
      'Assistance conformité élargie (échéancier + suivi plus serré)',
    ],
    included: [
      'Revue mensuelle renforcée',
      'Pré-dossier contrôles DGID',
      'Échéancier de conformité',
      'Au-delà (effectif/volume/complexité) : avenant / devis',
    ],
  },
  {
    id: 'premium',
    name: 'Pack Premium',
    description: 'Pour structures complexes avec accompagnement stratégique',
    price: 200000,
    emoji: BadgeCheck,
    features: [
      'Tout le Pack Business',
      'Accompagnement stratégique mensuel (réunion/visio)',
      'Assistance contrôle fiscal renforcée (préparation + coordination)',
      'Organisation process (workflow pièces, standards internes, reporting)',
    ],
    included: [
      'Réunion stratégique mensuelle',
      'Coordination contrôle fiscal',
      'Mise en place process internes',
      'Au-delà (effectif/volume/complexité) : avenant / devis',
    ],
  },
];

export const FISCAL_REGIMES = [
  { id: 'reel_normal', label: 'Régime réel normal' },
  { id: 'reel_simplifie', label: 'Régime réel simplifié' },
  { id: 'forfait', label: 'Régime du forfait' },
  { id: 'cgu', label: 'CGU (Centre de Gestion Agréé)' },
];

export const BUSINESS_SECTORS = [
  { id: 'commerce', label: 'Commerce général' },
  { id: 'services', label: 'Prestation de services' },
  { id: 'industrie', label: 'Industrie / Production' },
  { id: 'btp', label: 'BTP / Construction' },
  { id: 'transport', label: 'Transport / Logistique' },
  { id: 'restauration', label: 'Restauration / Hôtellerie' },
  { id: 'immobilier', label: 'Immobilier' },
  { id: 'digital', label: 'Digital / Tech' },
  { id: 'consulting', label: 'Conseil / Formation' },
  { id: 'agriculture', label: 'Agriculture / Élevage' },
];

export const TAX_TYPES = [
  { id: 'tva', label: 'TVA', description: 'Taxe sur la Valeur Ajoutée', frequency: 'monthly' },
  { id: 'is', label: 'IS', description: 'Impôt sur les Sociétés', frequency: 'annual' },
  { id: 'ir', label: 'IR', description: 'Impôt sur le Revenu', frequency: 'annual' },
  { id: 'patente', label: 'Patente', description: 'Contribution des patentes', frequency: 'annual' },
  { id: 'cfce', label: 'CFCE', description: 'Contribution Forfaitaire à la Charge de l\'Employeur', frequency: 'annual' },
  { id: 'retenues', label: 'Retenues', description: 'Retenues à la source (salaires, BNC, loyers)', frequency: 'monthly' },
  { id: 'cel', label: 'CEL', description: 'Contribution Économique Locale', frequency: 'annual' },
];

export const DOCUMENT_TYPES = [
  { id: 'invoice', label: 'Facture', icon: 'FileText' },
  { id: 'receipt', label: 'Reçu / Ticket', icon: 'Receipt' },
  { id: 'bank_statement', label: 'Relevé bancaire', icon: 'CreditCard' },
  { id: 'payroll', label: 'Bulletin de paie', icon: 'Users' },
  { id: 'other', label: 'Autre document', icon: 'File' },
];

// Mock data pour les tests
export const mockAccountingFolders: AccountingFolder[] = [
  {
    id: 'ACC-001',
    companyId: 'cmp-1',
    companyName: 'Tech Solutions SARL',
    pack: 'standard',
    status: 'active',
    createdAt: '2025-01-15',
    fiscalYearStart: '01-01',
    fiscalYearEnd: '31-12',
    sector: 'digital',
    taxRegime: 'reel_normal',
    vatSubject: true,
    vatPeriod: 'monthly',
    employeeCount: 8,
    monthlyInvoiceCount: '20-50',
    mandateSigned: true,
    currentMonth: {
      month: '2024-12',
      status: 'in_progress',
      revenue: 12500000,
      expenses: 7800000,
      result: 4700000,
      vatCollected: 2375000,
      vatDeductible: 1482000,
      vatToPay: 893000,
      missingDocuments: ['Relevé bancaire décembre', 'Facture fournisseur XYZ'],
      documentsCount: {
        received: 32,
        processed: 25,
        total: 45,
      },
    },
  },
  {
    id: 'ACC-002',
    companyId: 'cmp-2',
    companyName: 'Commerce Plus SA',
    pack: 'premium',
    status: 'active',
    createdAt: '2024-09-20',
    fiscalYearStart: '01-01',
    fiscalYearEnd: '31-12',
    sector: 'commerce',
    taxRegime: 'reel_normal',
    vatSubject: true,
    vatPeriod: 'monthly',
    employeeCount: 25,
    monthlyInvoiceCount: '100+',
    mandateSigned: true,
    currentMonth: {
      month: '2024-12',
      status: 'validation',
      revenue: 45000000,
      expenses: 32000000,
      result: 13000000,
      vatCollected: 8100000,
      vatDeductible: 5760000,
      vatToPay: 2340000,
      missingDocuments: [],
      documentsCount: {
        received: 125,
        processed: 125,
        total: 125,
      },
    },
  },
  {
    id: 'ACC-003',
    companyId: 'cmp-3',
    companyName: 'Services Conseils SUARL',
    pack: 'essentiel',
    status: 'active',
    createdAt: '2024-11-10',
    fiscalYearStart: '01-01',
    fiscalYearEnd: '31-12',
    sector: 'consulting',
    taxRegime: 'reel_simplifie',
    vatSubject: true,
    vatPeriod: 'monthly',
    employeeCount: 3,
    monthlyInvoiceCount: '10-20',
    mandateSigned: true,
    currentMonth: {
      month: '2024-12',
      status: 'waiting_documents',
      missingDocuments: [
        'Factures clients décembre',
        'Relevé bancaire décembre',
        'Factures fournisseurs décembre',
        'Notes de frais',
      ],
      documentsCount: {
        received: 5,
        processed: 5,
        total: 18,
      },
    },
  },
  {
    id: 'ACC-004',
    companyId: 'cmp-4',
    companyName: 'Import Export SARL',
    pack: 'standard',
    status: 'active',
    createdAt: '2024-06-15',
    fiscalYearStart: '01-01',
    fiscalYearEnd: '31-12',
    sector: 'commerce',
    taxRegime: 'reel_normal',
    vatSubject: true,
    vatPeriod: 'monthly',
    employeeCount: 12,
    monthlyInvoiceCount: '50-100',
    mandateSigned: true,
    currentMonth: {
      month: '2024-11',
      status: 'completed',
      revenue: 28000000,
      expenses: 22000000,
      result: 6000000,
      vatCollected: 5040000,
      vatDeductible: 3960000,
      vatToPay: 1080000,
      missingDocuments: [],
      documentsCount: {
        received: 78,
        processed: 78,
        total: 78,
      },
    },
  },
  {
    id: 'ACC-005',
    companyId: 'cmp-5',
    companyName: 'BTP Construction SA',
    pack: 'premium',
    status: 'active',
    createdAt: '2024-03-01',
    fiscalYearStart: '01-01',
    fiscalYearEnd: '31-12',
    sector: 'btp',
    taxRegime: 'reel_normal',
    vatSubject: true,
    vatPeriod: 'monthly',
    employeeCount: 45,
    monthlyInvoiceCount: '50-100',
    mandateSigned: true,
    currentMonth: {
      month: '2024-12',
      status: 'in_progress',
      revenue: 85000000,
      expenses: 65000000,
      result: 20000000,
      missingDocuments: ['Bulletins de paie décembre', 'Facture sous-traitant ABC'],
      documentsCount: {
        received: 65,
        processed: 58,
        total: 82,
      },
    },
  },
];

export const mockTaxDeclarations: TaxDeclaration[] = [
  {
    id: 'TAX-001',
    folderId: 'ACC-001',
    type: 'tva',
    dueDate: '2025-12-15',
    status: 'paid',
    estimatedAmount: 893000,
    finalAmount: 893000,
    filingDate: '2025-12-10',
    description: 'TVA Novembre 2025',
  },
  {
    id: 'TAX-002',
    folderId: 'ACC-001',
    type: 'is',
    dueDate: '2026-04-30',
    status: 'to_prepare',
    estimatedAmount: 15000000,
    description: 'Impôt sur les Sociétés 2025',
  },
  {
    id: 'TAX-003',
    folderId: 'ACC-001',
    type: 'patente',
    dueDate: '2026-06-30',
    status: 'to_prepare',
    description: 'Contribution des patentes 2026',
  },
  {
    id: 'TAX-004',
    folderId: 'ACC-001',
    type: 'tva',
    dueDate: '2026-09-15',
    status: 'to_prepare',
    estimatedAmount: 1150000,
    description: 'TVA Août 2026',
  },
  {
    id: 'TAX-005',
    folderId: 'ACC-001',
    type: 'tva',
    dueDate: '2026-10-15',
    status: 'to_prepare',
    description: 'TVA Septembre 2026',
  },
];

export const mockAccountingDocuments: AccountingDocument[] = [
  // ACC-001 - Tech Solutions SARL (Décembre 2024)
  {
    id: 'DOC-001',
    folderId: 'ACC-001',
    month: '2024-12',
    type: 'invoice',
    name: 'Facture FAC-2024-156 - Client ABC Corp.pdf',
    uploadedAt: '2024-12-05 10:30',
    uploadedBy: 'client',
    status: 'integrated',
    amount: 2500000,
    validatedAt: '2024-12-06 14:20',
    validatedBy: 'Mamadou Diop',
  },
  {
    id: 'DOC-002',
    folderId: 'ACC-001',
    month: '2024-12',
    type: 'invoice',
    name: 'Facture FAC-2024-157 - Client Tech Partners.pdf',
    uploadedAt: '2024-12-06 09:15',
    uploadedBy: 'client',
    status: 'processing',
    amount: 4200000,
    notes: 'En cours de vérification',
  },
  {
    id: 'DOC-003',
    folderId: 'ACC-001',
    month: '2024-12',
    type: 'receipt',
    name: 'Reçu achat fournitures.jpg',
    uploadedAt: '2024-12-07 16:45',
    uploadedBy: 'client',
    status: 'rejected',
    amount: 35000,
    rejectionReason: 'Document illisible. Merci de télécharger une version plus claire ou le PDF original.',
  },
  {
    id: 'DOC-004',
    folderId: 'ACC-001',
    month: '2024-12',
    type: 'bank_statement',
    name: 'Relevé bancaire SGBS - Décembre 2024.pdf',
    uploadedAt: '2024-12-08 11:00',
    uploadedBy: 'client',
    status: 'received',
    notes: 'Document reçu, en attente de traitement',
  },
  {
    id: 'DOC-005',
    folderId: 'ACC-001',
    month: '2024-12',
    type: 'payroll',
    name: 'Bulletins paie décembre 2024.zip',
    uploadedAt: '2024-12-09 14:30',
    uploadedBy: 'client',
    status: 'received',
  },

  // ACC-002 - Commerce Plus SA (Décembre 2024)
  {
    id: 'DOC-006',
    folderId: 'ACC-002',
    month: '2024-12',
    type: 'invoice',
    name: 'Facture vente lot marchandises - Dec 2024.pdf',
    uploadedAt: '2024-12-02 08:20',
    uploadedBy: 'client',
    status: 'integrated',
    amount: 15000000,
    validatedAt: '2024-12-03 10:15',
    validatedBy: 'Fatou Sall',
  },
  {
    id: 'DOC-007',
    folderId: 'ACC-002',
    month: '2024-12',
    type: 'invoice',
    name: 'Facture import conteneur Chine.pdf',
    uploadedAt: '2024-12-03 15:30',
    uploadedBy: 'client',
    status: 'integrated',
    amount: 22000000,
    validatedAt: '2024-12-04 09:00',
    validatedBy: 'Fatou Sall',
  },
  {
    id: 'DOC-008',
    folderId: 'ACC-002',
    month: '2024-12',
    type: 'bank_statement',
    name: 'Relevés bancaires décembre - Tous comptes.pdf',
    uploadedAt: '2024-12-04 12:00',
    uploadedBy: 'client',
    status: 'integrated',
    validatedAt: '2024-12-05 16:30',
    validatedBy: 'Fatou Sall',
  },
  {
    id: 'DOC-009',
    folderId: 'ACC-002',
    month: '2024-12',
    type: 'payroll',
    name: 'Paie décembre 2024 - 25 salariés.xlsx',
    uploadedAt: '2024-12-05 10:45',
    uploadedBy: 'client',
    status: 'integrated',
    validatedAt: '2024-12-06 11:20',
    validatedBy: 'Fatou Sall',
  },
  {
    id: 'DOC-010',
    folderId: 'ACC-002',
    month: '2024-12',
    type: 'other',
    name: 'Déclarations douanières import.pdf',
    uploadedAt: '2024-12-06 14:00',
    uploadedBy: 'client',
    status: 'integrated',
    validatedAt: '2024-12-07 09:45',
    validatedBy: 'Fatou Sall',
  },

  // ACC-003 - Services Conseils SUARL (Décembre 2024)
  {
    id: 'DOC-011',
    folderId: 'ACC-003',
    month: '2024-12',
    type: 'invoice',
    name: 'Facture mission consulting.pdf',
    uploadedAt: '2024-12-03 09:00',
    uploadedBy: 'client',
    status: 'received',
  },
  {
    id: 'DOC-012',
    folderId: 'ACC-003',
    month: '2024-12',
    type: 'receipt',
    name: 'Reçu taxi mission client.jpg',
    uploadedAt: '2024-12-04 11:30',
    uploadedBy: 'client',
    status: 'rejected',
    amount: 12500,
    rejectionReason: 'Reçu incomplet : date et numéro de course manquants.',
  },
  {
    id: 'DOC-013',
    folderId: 'ACC-003',
    month: '2024-12',
    type: 'invoice',
    name: 'Facture loyer bureau.pdf',
    uploadedAt: '2024-12-05 14:15',
    uploadedBy: 'client',
    status: 'processing',
    amount: 450000,
  },

  // ACC-004 - Import Export SARL (Novembre 2024 - Clôturé)
  {
    id: 'DOC-014',
    folderId: 'ACC-004',
    month: '2024-11',
    type: 'invoice',
    name: 'Factures export conteneurs - Novembre.pdf',
    uploadedAt: '2024-11-28 16:00',
    uploadedBy: 'client',
    status: 'integrated',
    amount: 18000000,
    validatedAt: '2024-11-29 10:30',
    validatedBy: 'Abdou Kane',
  },
  {
    id: 'DOC-015',
    folderId: 'ACC-004',
    month: '2024-11',
    type: 'bank_statement',
    name: 'Relevé bancaire novembre 2024.pdf',
    uploadedAt: '2024-11-30 09:00',
    uploadedBy: 'client',
    status: 'integrated',
    validatedAt: '2024-12-01 14:00',
    validatedBy: 'Abdou Kane',
  },
  {
    id: 'DOC-016',
    folderId: 'ACC-004',
    month: '2024-11',
    type: 'other',
    name: 'Documents douaniers novembre.zip',
    uploadedAt: '2024-11-30 11:45',
    uploadedBy: 'client',
    status: 'integrated',
    validatedAt: '2024-12-01 16:20',
    validatedBy: 'Abdou Kane',
  },

  // ACC-005 - BTP Construction SA (Décembre 2024)
  {
    id: 'DOC-017',
    folderId: 'ACC-005',
    month: '2024-12',
    type: 'invoice',
    name: 'Facture chantier Almadies - Situation 3.pdf',
    uploadedAt: '2024-12-02 10:00',
    uploadedBy: 'client',
    status: 'integrated',
    amount: 45000000,
    validatedAt: '2024-12-03 15:30',
    validatedBy: 'Awa Ndiaye',
  },
  {
    id: 'DOC-018',
    folderId: 'ACC-005',
    month: '2024-12',
    type: 'invoice',
    name: 'Facture chantier Plateau - Avancement.pdf',
    uploadedAt: '2024-12-04 08:30',
    uploadedBy: 'client',
    status: 'integrated',
    amount: 32000000,
    validatedAt: '2024-12-05 11:00',
    validatedBy: 'Awa Ndiaye',
  },
  {
    id: 'DOC-019',
    folderId: 'ACC-005',
    month: '2024-12',
    type: 'receipt',
    name: 'Facture achat ciment - Stock.pdf',
    uploadedAt: '2024-12-05 13:45',
    uploadedBy: 'client',
    status: 'processing',
    amount: 8500000,
  },
  {
    id: 'DOC-020',
    folderId: 'ACC-005',
    month: '2024-12',
    type: 'bank_statement',
    name: 'Relevé compte professionnel déc 2024.pdf',
    uploadedAt: '2024-12-06 09:30',
    uploadedBy: 'client',
    status: 'received',
  },
  {
    id: 'DOC-021',
    folderId: 'ACC-005',
    month: '2024-12',
    type: 'other',
    name: 'Contrat sous-traitant électricité.pdf',
    uploadedAt: '2024-12-07 10:15',
    uploadedBy: 'client',
    status: 'rejected',
    rejectionReason: 'Document à envoyer en original signé et scanné (signature manquante).',
  },
  {
    id: 'DOC-022',
    folderId: 'ACC-005',
    month: '2024-12',
    type: 'invoice',
    name: 'Facture location engins de chantier.pdf',
    uploadedAt: '2024-12-08 14:00',
    uploadedBy: 'client',
    status: 'processing',
    amount: 4200000,
  },
];

export function getMonthStatusLabel(status: MonthStatus): string {
  const labels = {
    waiting_documents: 'En attente de pièces',
    in_progress: 'Comptabilité en cours',
    validation: 'En validation',
    completed: 'Mois clôturé',
  };
  return labels[status];
}

export function getMonthStatusColor(status: MonthStatus): string {
  const colors = {
    waiting_documents: '#9CA3AF',
    in_progress: '#F59E0B',
    validation: '#3B82F6',
    completed: '#10B981',
  };
  return colors[status];
}

export function getTaxStatusLabel(status: TaxDeclarationStatus): string {
  const labels = {
    to_prepare: 'À préparer',
    in_progress: 'En cours',
    declared: 'Déclaré',
    paid: 'Payé',
  };
  return labels[status];
}

export function calculatePackPrice(
  pack: AccountingPackType,
  employeeCount: number,
  invoiceCount: string
): number {
  const basePack = ACCOUNTING_PACKS.find(p => p.id === pack);
  if (!basePack) return 0;

  let price = basePack.price;

  // Ajustement selon nombre de salariés (pour Standard et Premium)
  if (pack !== 'essentiel' && employeeCount > 10) {
    price += (employeeCount - 10) * 5000;
  }

  // Ajustement selon volume de factures
  const volumeMultiplier: Record<string, number> = {
    '0-10': 1,
    '10-20': 1.1,
    '20-50': 1.2,
    '50-100': 1.3,
    '100+': 1.5,
  };

  price *= volumeMultiplier[invoiceCount] || 1;

  return Math.round(price);
}