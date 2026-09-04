// Types pour le module de domiciliation
export type PeriodType = 'monthly' | 'quarterly' | 'biannual' | 'yearly';
export type ContractStatus = 'draft' | 'sent' | 'validated' | 'signed' | 'active' | 'suspended' | 'terminated' | 'expired';
export type PaymentStatus = 'to_issue' | 'issued' | 'paid' | 'late' | 'partial' | 'cancelled';
export type AddressStatus = 'draft' | 'published' | 'suspended';

export interface DomiciliationOffer {
  id: string;
  name: string;
  address: string;
  zone: string;
  city: string;
  postalCode: string;
  description: string;
  services: string[];
  notIncluded?: string[];
  receptionCapacity: number;
  prices: {
    monthly: number;
    quarterly: number;
    biannual: number;
    yearly: number;
  };
  deposit?: number;
  quota: number;
  available: number;
  status: AddressStatus;
  features: string[];
  tier: 'essentiel' | 'business' | 'premium';
  popular?: boolean;
  images?: string[];
}

export interface DomiciliationContract {
  id: string;
  offerId: string;
  userId: string;
  companyId?: string;
  status: ContractStatus;
  period: PeriodType;
  startDate: string;
  endDate: string;
  monthlyAmount: number;
  totalAmount: number;
  autoRenewal: boolean;
  renewalNotice: number; // days
  contractUrl?: string;
  version: number;
  signedAt?: string;
  signedBy?: string[];
  comments: ContractComment[];
  documents: ContractDocument[];
  /** Société déjà immatriculée au moment de la souscription. */
  companyRegistered?: boolean;
  /** Conditions générales acceptées par le client. */
  contractAccepted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContractComment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface ContractDocument {
  id: string;
  type: 'CNI' | 'STATUTS' | 'RC' | 'NINEA' | 'JUSTIFICATIF_ADRESSE' | 'CONTRACT' | 'QUITTANCE' | 'OTHER';
  name: string;
  url: string;
  required: boolean;
  validated: boolean;
  uploadedAt: string;
  validatedAt?: string;
  validatedBy?: string;
}

export interface DomiciliationPayment {
  id: string;
  contractId: string;
  userId: string;
  type: 'deposit' | 'rent' | 'penalty';
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  method?: 'orange_money' | 'wave' | 'card';
  transactionId?: string;
  receiptUrl?: string;
  reminders: PaymentReminder[];
}

export interface PaymentReminder {
  id: string;
  type: 'email' | 'sms' | 'whatsapp';
  sentAt: string;
  status: 'sent' | 'failed';
}

export interface AuditLog {
  id: string;
  contractId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

// Mock data pour les offres de domiciliation
export const mockDomiciliationOffers: DomiciliationOffer[] = [
  {
    id: 'dom-essentiel',
    name: 'Pack ESSENTIEL',
    address: 'Bourguiba / Mermoz / Almadies',
    zone: 'Bourguiba, Mermoz ou Almadies',
    city: 'Dakar',
    postalCode: 'BP 1234',
    description: 'L\'essentiel pour domicilier votre entreprise : attestation, réception du courrier et notifications en temps réel.',
    services: [
      'Attestation de domiciliation',
      'Réception du courrier (lettres simples & recommandés)',
      'Notification à réception (WhatsApp/email)',
      'Conservation du courrier : 30 jours',
    ],
    notIncluded: [
      'Accueil client (en option)',
      'Coworking (en option)',
      'Salle de réunion (en option)',
      'Scan du courrier (en option)',
    ],
    receptionCapacity: 30,
    prices: {
      monthly: 25000,
      quarterly: 25000 * 3 * 0.95,
      biannual: 25000 * 6 * 0.92,
      yearly: 25000 * 12 * 0.88,
    },
    quota: 200,
    available: 142,
    status: 'published',
    features: [
      'Choix de l\'adresse : Bourguiba, Mermoz ou Almadies',
      'Notification WhatsApp/email instantanée',
      'Conservation courrier 30 jours',
    ],
    tier: 'essentiel',
  },
  {
    id: 'dom-business',
    name: 'Pack BUSINESS',
    address: 'Immeuble Bourguiba, Avenue Habib Bourguiba, Plateau',
    zone: 'Bourguiba (Business Center)',
    city: 'Dakar',
    postalCode: 'BP 1234',
    description: 'L\'offre idéale pour les entrepreneurs actifs : accueil professionnel, coworking et scan du courrier inclus.',
    services: [
      'Tout le Pack Essentiel inclus',
      'Accueil & remise du courrier sur place',
      'Accès coworking (sur réservation)',
      'Scan du courrier (quota à définir)',
      'Réexpédition Dakar : 1 fois / mois (hors coursier)',
    ],
    notIncluded: [],
    receptionCapacity: 60,
    prices: {
      monthly: 50000,
      quarterly: 50000 * 3 * 0.95,
      biannual: 50000 * 6 * 0.92,
      yearly: 50000 * 12 * 0.88,
    },
    quota: 100,
    available: 67,
    status: 'published',
    features: [
      'Accueil professionnel en Business Center',
      'Espace coworking sur réservation',
      'Scan & envoi du courrier',
      'Réexpédition mensuelle Dakar',
    ],
    tier: 'business',
    popular: true,
  },
  {
    id: 'dom-premium',
    name: 'Pack PREMIUM',
    address: 'Immeuble Bourguiba, Avenue Habib Bourguiba, Plateau',
    zone: 'Bourguiba',
    city: 'Dakar',
    postalCode: 'BP 1234',
    description: 'L\'offre la plus complète : salle de réunion, assistance admin renforcée et traitement prioritaire de tout votre courrier.',
    services: [
      'Tout le Pack Business inclus',
      'Accès coworking (sur réservation)',
      'Salle de réunion (sur réservation)',
      'Scan du courrier (quota à définir)',
      'Dépôt/récupération de documents (sur consigne, hors frais)',
      'Réexpédition du courrier (hors coursier)',
      'Priorité traitement courrier',
      'Assistance admin renforcée : tri/préparation + dépôt/retrait (sur consigne)',
    ],
    notIncluded: [],
    receptionCapacity: 100,
    prices: {
      monthly: 100000,
      quarterly: 100000 * 3 * 0.95,
      biannual: 100000 * 6 * 0.92,
      yearly: 100000 * 12 * 0.88,
    },
    quota: 50,
    available: 28,
    status: 'published',
    features: [
      'Salle de réunion sur réservation',
      'Assistance administrative renforcée',
      'Traitement prioritaire du courrier',
      'Dépôt & récupération de documents',
      'Réexpédition courrier illimitée',
    ],
    tier: 'premium',
  }
];

// Document checklist par type de société
export const documentChecklistBySocietyType: Record<string, ContractDocument[]> = {
  'SARL': [
    {
      id: 'sarl-doc-1',
      type: 'CNI',
      name: 'Carte d\'identité du gérant',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    },
    {
      id: 'sarl-doc-2',
      type: 'STATUTS',
      name: 'Statuts de la société',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    },
    {
      id: 'sarl-doc-3',
      type: 'RC',
      name: 'Registre de Commerce',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    },
    {
      id: 'sarl-doc-4',
      type: 'NINEA',
      name: 'NINEA',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    }
  ],
  'SA': [
    {
      id: 'sa-doc-1',
      type: 'CNI',
      name: 'Carte d\'identité du DG',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    },
    {
      id: 'sa-doc-2',
      type: 'STATUTS',
      name: 'Statuts de la société',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    },
    {
      id: 'sa-doc-3',
      type: 'RC',
      name: 'Registre de Commerce',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    },
    {
      id: 'sa-doc-4',
      type: 'NINEA',
      name: 'NINEA',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    }
  ],
  'SAS': [
    {
      id: 'sas-doc-1',
      type: 'CNI',
      name: 'Carte d\'identité du président',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    },
    {
      id: 'sas-doc-2',
      type: 'STATUTS',
      name: 'Statuts de la société',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    },
    {
      id: 'sas-doc-3',
      type: 'RC',
      name: 'Registre de Commerce',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    },
    {
      id: 'sas-doc-4',
      type: 'NINEA',
      name: 'NINEA',
      url: '',
      required: true,
      validated: false,
      uploadedAt: ''
    }
  ]
};

// Helper functions
export const calculatePeriodPrice = (monthlyPrice: number, period: PeriodType): number => {
  switch (period) {
    case 'monthly':
      return monthlyPrice;
    case 'quarterly':
      return monthlyPrice * 3 * 0.95; // -5%
    case 'biannual':
      return monthlyPrice * 6 * 0.92; // -8%
    case 'yearly':
      return monthlyPrice * 12 * 0.88; // -12%
    default:
      return monthlyPrice;
  }
};

export const getPeriodLabel = (period: PeriodType): string => {
  switch (period) {
    case 'monthly':
      return 'Mensuel';
    case 'quarterly':
      return 'Trimestriel';
    case 'biannual':
      return 'Semestriel';
    case 'yearly':
      return 'Annuel';
    default:
      return period;
  }
};

export const getPeriodDuration = (period: PeriodType): number => {
  switch (period) {
    case 'monthly':
      return 1;
    case 'quarterly':
      return 3;
    case 'biannual':
      return 6;
    case 'yearly':
      return 12;
    default:
      return 1;
  }
};

export const getContractStatusLabel = (status: ContractStatus): string => {
  const labels: Record<ContractStatus, string> = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    validated: 'Validé',
    signed: 'Signé',
    active: 'Actif',
    suspended: 'Suspendu',
    terminated: 'Résilié',
    expired: 'Expiré'
  };
  return labels[status];
};

export const getContractStatusColor = (status: ContractStatus): string => {
  const colors: Record<ContractStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    validated: 'bg-purple-100 text-purple-700',
    signed: 'bg-indigo-100 text-indigo-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-orange-100 text-orange-700',
    terminated: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-700'
  };
  return colors[status];
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  const labels: Record<PaymentStatus, string> = {
    to_issue: 'À émettre',
    issued: 'Émise',
    paid: 'Payée',
    late: 'En retard',
    partial: 'Partielle',
    cancelled: 'Annulée'
  };
  return labels[status];
};

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  const colors: Record<PaymentStatus, string> = {
    to_issue: 'bg-gray-100 text-gray-700',
    issued: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    late: 'bg-red-100 text-red-700',
    partial: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-gray-100 text-gray-700'
  };
  return colors[status];
};

// Contrats de démonstration du suivi client.
// Leurs `offerId` doivent exister dans `mockDomiciliationOffers` : sans cela, la
// carte s'affiche sans nom d'offre ni adresse, et les montants ne correspondent
// à aucune grille tarifaire.
export const mockDomiciliationContracts: DomiciliationContract[] = [
  {
    id: 'contract-1',
    offerId: 'dom-business',
    userId: '1',
    companyId: '1',
    status: 'active',
    period: 'yearly',
    startDate: '2024-01-15',
    endDate: '2025-01-14',
    monthlyAmount: 50000,
    totalAmount: 528000,
    autoRenewal: true,
    renewalNotice: 30,
    contractUrl: '/contracts/contract-1.pdf',
    version: 1,
    signedAt: '2024-01-15T10:30:00',
    signedBy: ['1', 'admin-1'],
    comments: [],
    documents: [],
    createdAt: '2024-01-10T14:20:00',
    updatedAt: '2024-01-15T10:30:00'
  },
  {
    id: 'contract-2',
    offerId: 'dom-essentiel',
    userId: '1',
    companyId: '2',
    status: 'active',
    period: 'quarterly',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    monthlyAmount: 25000,
    totalAmount: 71250,
    autoRenewal: false,
    renewalNotice: 30,
    contractUrl: '/contracts/contract-2.pdf',
    version: 1,
    signedAt: '2024-09-28T09:15:00',
    signedBy: ['1', 'admin-1'],
    comments: [],
    documents: [],
    createdAt: '2024-09-25T11:00:00',
    updatedAt: '2024-09-28T09:15:00'
  }
];