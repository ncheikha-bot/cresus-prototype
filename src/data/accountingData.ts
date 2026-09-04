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
  // Vidé : l'application démarre sans dossier fabriqué. Chaque visiteur
  // construit sa propre démonstration ; le catalogue, lui, reste intact.
];

export const mockTaxDeclarations: TaxDeclaration[] = [
  // Vidé : l'application démarre sans dossier fabriqué. Chaque visiteur
  // construit sa propre démonstration ; le catalogue, lui, reste intact.
];

export const mockAccountingDocuments: AccountingDocument[] = [
  // Vidé : l'application démarre sans dossier fabriqué. Chaque visiteur
  // construit sa propre démonstration ; le catalogue, lui, reste intact.
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