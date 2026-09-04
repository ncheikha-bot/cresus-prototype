export type UserRole = 'client' | 'admin' | 'bank' | 'accountant';

/** Formes juridiques gérées par le module Modifications.
 *  Réexporté ici parce que `src/data/accountingData.ts` importe ce type
 *  depuis `../types` alors qu'il est déclaré dans `../data/modificationsData`. */
export type { CompanyType } from '../data/modificationsData';

/** Espace applicatif affiché. `bank` existe dans les types mais n'a pas
 *  encore de branche dans App.tsx (voir les écrans Bank* non montés). */
export type ViewMode = 'mobile' | 'web' | 'admin' | 'accountant' | 'bank';

export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  bankId?: string; // Pour les utilisateurs de type 'bank'
  bankPassword?: string; // Pour l'authentification bancaire (demo)
  hasCompletedOnboarding?: boolean;
}

export interface Company {
  id: string;
  name: string;
  legalForm: string;
  activity: string;
  capital?: number;
  address?: string;
  clientId: string;
  userId?: string; // Alias pour clientId (pour compatibilité)
  /** `pending` et `in_progress` sont utilisés par les tableaux de bord
   *  (WebDashboard, WebTimeline) en plus des statuts du workflow. */
  status: 'draft' | 'submitted' | 'pending' | 'in_review' | 'in_progress' | 'documents_ready' | 'signed' | 'completed';
  createdAt: string;
  updatedAt: string;
  sector?: string; // Secteur d'activité (affiché dans « Mes sociétés »)
  type?: string; // Type de société utilisé par le module Comptabilité
  progress?: number; // Avancement en % (timeline)
  rccm?: string; // Numéro de registre du commerce (sociétés immatriculées)
  ninea?: string; // Numéro d'identification national des entreprises
  useHonorDeclaration?: boolean; // Si le client utilise une déclaration sur l'honneur au lieu du casier judiciaire
  currentStep?: number; // Étape actuelle (1-6)
  legalRepresentative?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  shareholders?: Associate[]; // Liste des associés
  documents?: Document[];
  /** Deux formes coexistent dans les données : le détail poste par poste
   *  (registrationFees, legalFees…) et la forme condensée `total` + `items`
   *  utilisée par les exemples de parcours de `src/data/mockData.ts`. */
  quote?: {
    id?: string;
    status: 'draft' | 'sent' | 'validated' | 'rejected';
    registrationFees?: number;
    legalFees?: number;
    publicationFees?: number;
    stampDuty?: number;
    adminFees?: number;
    total?: number;
    items?: { label: string; amount: number }[];
    notes?: string;
    /** Motif saisi par le client s'il refuse. Distinct de `notes`, qui appartient
     *  à l'administration : les écraser l'un par l'autre effaçait la seule
     *  explication dont chaque partie disposait. */
    rejectionReason?: string;
    createdAt?: string;
    sentAt?: string;
    validatedAt?: string;
    rejectedAt?: string;
  };
}

export interface DocumentVersion {
  versionNumber: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string; // admin user id
  comment?: string;
}

export interface DocumentReview {
  id: string;
  documentId: string;
  reviewedAt: string;
  status: 'validated' | 'rejected';
  comment?: string;
  reviewedBy: string; // user id
}

/** Vocabulaire complet des types de documents manipulés dans l'application :
 *  - MAJUSCULES : documents du parcours de création (statuts, RC, NINEA…) ;
 *  - minuscules : catégories utilisées par les jeux de données mock
 *    (`identity`, `address`, `capital`, `diploma`, `declaration`…) ;
 *  - codes `*_MODIFIE(S)` / `*_DRAFT` : livrables du module Modifications
 *    (cf. MODIFICATION_ADMIN_DOCUMENTS dans AdminModifications.tsx). */
export type DocumentType =
  | 'CNI'
  | 'CASIER'
  | 'JUSTIFICATIF'
  | 'STATUTS'
  | 'ATTESTATION'
  | 'CONTRAT'
  | 'RC'
  | 'NINEA'
  | 'PV_AG'
  | 'FORMULAIRE_M0'
  | 'DECLARATION_HONNEUR'
  | 'DECLARATION_HONNEUR_REQUEST'
  | 'identity'
  | 'address'
  | 'capital'
  | 'diploma'
  | 'declaration'
  | 'statuts'
  | 'rccm'
  | 'ninea'
  | 'STATUTS_MODIFIES_DRAFT'
  | 'STATUTS_MODIFIES_REVISED'
  | 'STATUTS_MODIFIES_FINAL'
  | 'PV_MODIFICATION'
  | 'ATTESTATION_MODIFICATION'
  | 'RC_MODIFIE'
  | 'NINEA_MODIFIE'
  | 'CERTIFICAT_MODIFICATION'
  | 'KBIS_MODIFIE';

/** Les champs `companyId`, `url`, `currentVersion`, `versions` et `reviews`
 *  sont optionnels : les documents imbriqués dans `Company.documents`
 *  (cf. `src/data/mockData.ts`) n'utilisent qu'une forme allégée
 *  `{ id, name, type, uploadedAt, status }`. */
export interface Document {
  id: string;
  companyId?: string; // Lié à la société
  name: string;
  type: DocumentType;
  url?: string;
  status: 'pending' | 'signed' | 'awaiting_validation' | 'validated' | 'rejected' | 'under_revision';
  uploadedAt: string;
  uploadedBy?: string; // 'admin' | 'client' | id utilisateur, selon le module
  signedAt?: string;
  currentVersion?: number;
  versions?: DocumentVersion[];
  reviews?: DocumentReview[];
  size?: string;
  pages?: number;
  description?: string; // Description du document
  isOfficial?: boolean; // Document officiel final (module Modifications)
}

export interface Payment {
  id: string;
  companyId: string;
  amount: number;
  method: 'orange_money' | 'wave' | 'card';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  receipt?: string;
}

export interface Domiciliation {
  id: string;
  clientId: string;
  companyId: string;
  address: DomiciliationAddress;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  monthlyFee: number;
}

export interface DomiciliationAddress {
  id: string;
  name: string;
  address: string;
  zone: string;
  price: number;
  services: string[];
  available: boolean;
}

export interface Modification {
  id: string;
  companyId: string;
  /** Type de modification, tel que le catalogue le nomme (`siege_social`…). */
  type: string;
  description: string;
  status: 'submitted' | 'pending' | 'waiting_quote' | 'quote_sent' | 'quote_validated' | 'quote_rejected' | 'in_review' | 'documents_ready' | 'signed' | 'completed';
  documents: Document[];
  createdAt: string;
  /** Client à l'origine de la demande. */
  clientId?: string;
  /** Forme juridique choisie au premier écran. */
  companyType?: string;
  /** Société déjà chez Crésus, ou créée ailleurs. */
  companyOrigin?: 'cresus' | 'externe';
  /**
   * Informations propres au type de modification — nouvelle adresse, montant du
   * capital, nom du gérant… Elles étaient saisies puis perdues : la demande
   * partait sans son contenu.
   */
  informations?: Record<string, string>;
  /** Identifiants des pièces justificatives déposées. */
  uploadedDocs?: string[];
  quote?: {
    amount: number;
    details?: string;
    status: 'sent' | 'validated' | 'rejected';
    sentAt?: string;
    /** Fin de validité de l'offre. */
    validUntil?: string;
    rejectionReason?: string;
  };
}

export interface BrandingProject {
  id: string;
  clientId: string;
  companyId: string;
  type: 'logo' | 'website' | 'charte' | 'video' | 'social_media';
  status: 'submitted' | 'in_progress' | 'revision' | 'delivered' | 'completed';
  brief: string;
  assignedTo?: string;
  deliverables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  type: string;
  date: string;
  location: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface Associate {
  id: string;
  firstName: string;
  lastName: string;
  percentage: string;
  amount: string;
  address?: string;
  profession?: string;
  phone?: string;
  email?: string;
  isManager?: boolean;
  maritalStatus?: 'single' | 'married' | 'widowed' | 'divorced';
  matrimonialRegime?: 'community' | 'separation';
  spouseInfo?: {
    firstName: string;
    lastName: string;
    birthDate: string;
    profession: string;
  };
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: 'pending' | 'awaiting_validation' | 'validated' | 'rejected' | 'under_revision';
  version: number;
  rejectionReason?: string;
  versions?: Array<{
    version: number;
    uploadedAt: string;
    status: 'pending' | 'awaiting_validation' | 'validated' | 'rejected';
    comment?: string;
  }>;
}

/**
 * Avancement d'un dossier de création, partagé entre l'admin qui le pilote et
 * le client qui le suit.
 *
 * Ces informations vivaient dans 25 `useState` locaux à `AdminCompanySteps` :
 * une validation admin n'avait aucun effet visible côté client et disparaissait
 * au démontage du composant.
 */
export interface CompanyProcessState {
  /** Déclaration sur l'honneur générée par l'administration, à signer avec les statuts. */
  honorDeclarationSent: boolean;
  /** Statuts constitutifs rédigés puis envoyés au client. */
  statutsSent: boolean;
  statutsVersion: number;
  statutsValidatedByClient: boolean;
  statutsRejectedByClient: boolean;
  clientRejectionReason: string;
  /** Rendez-vous de signature demandé par le client. */
  appointmentRequest: {
    date: string;
    timeSlot: string;
    status: 'pending' | 'confirmed' | 'rejected';
  } | null;
  /** Signature électronique. */
  onlineSignatureCompleted: boolean;
  signedDocuments: string[];
  /** Documents officiels remis en fin de parcours (RCCM, NINEA…). */
  officialDocs: { name: string; uploadedAt: string }[];
  /** Dossier clos : la société est immatriculée. */
  companyFinalized: boolean;
  /** Décisions de l'admin sur les documents fournis par le client, par identifiant. */
  documentDecisions: Record<string, { status: 'validated' | 'rejected'; rejectionReason?: string }>;
}

export const EMPTY_COMPANY_PROCESS: CompanyProcessState = {
  honorDeclarationSent: false,
  statutsSent: false,
  statutsVersion: 1,
  statutsValidatedByClient: false,
  statutsRejectedByClient: false,
  clientRejectionReason: '',
  appointmentRequest: null,
  onlineSignatureCompleted: false,
  signedDocuments: [],
  officialDocs: [],
  companyFinalized: false,
  documentDecisions: {},
};

export interface CompanyDraft {
  id: string;
  userId: string;
  formData: {
    name: string;
    legalForm: string;
    activity: string;
    capital: string;
    address: string;
  };
  associates: Associate[];
  uploadedFiles: Record<string, UploadedDocument[]>;
  currentStep: number;
  selectedPaymentMethod: string | null;
  phoneNumber: string;
  signedDocs: string[];
  liberationType: 'total' | 'partial';
  liberationMethod: 'amount' | 'percentage';
  liberationValue: string;
  paymentCompleted: boolean;
  // Avancement du dossier au-delà de la saisie. Sans ces champs, reprendre un
  // brouillon arrêté après le devis rouvrait un tunnel remis à zéro : devis à
  // établir, statuts en attente, mode de signature oublié — donc un écran vide
  // à la dernière étape. Optionnels : les brouillons antérieurs restent lisibles.
  /** Dossier créé à l'étape 4 : la reprise retrouve l'avancement de l'admin. */
  companyId?: string;
  comanagement?: boolean;
  useHonorDeclaration?: boolean;
  devisStatus?: 'waiting' | 'created' | 'validated';
  quote?: {
    status: 'pending' | 'validated' | 'rejected';
    validatedAt: string | null;
    rejectionReason: string;
  };
  statuts?: {
    version: number;
    documentUrl: string;
    sentAt: string | null;
    status: 'waiting' | 'sent' | 'validated' | 'rejected';
  };
  signatureChoice?: 'online' | 'appointment' | null;
  appointment?: {
    date: string | null;
    timeSlot: string | null;
    status: 'pending' | 'confirmed' | 'rejected';
  };
  createdAt: string;
  updatedAt: string;
}

export interface BankPartner {
  id: string;
  name: string;
  logo: string;
  description: string;
  services: string[];
  processingTime: string;
  fees?: number; // Non saisi depuis le formulaire d'administration des banques
  requirements: string[];
  rating: number;
  color: string;
  email?: string; // Email de connexion pour la banque
  active?: boolean; // Statut actif/inactif
  createdAt?: string;
  contactPerson?: string; // Personne de contact à la banque
  contactPhone?: string; // Téléphone de contact
}

export interface BankMessage {
  id: string;
  requestId: string;
  sender: 'bank' | 'client' | 'admin';
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface TransferredDocument {
  id: string;
  name: string;
  type: 'statuts' | 'rccm' | 'ninea' | 'pv_ag' | 'cni_gerant' | 'certificat_capital' | 'justificatif_domiciliation' | 'liste_actionnaires' | 'attestation_fiscale' | 'declaration_conformite';
  size: string;
  uploadedAt: string;
  issuedDate?: string; // Date d'émission du document officiel
  referenceNumber?: string; // Numéro de référence (ex: numéro RCCM, NINEA, etc.)
  url?: string;
}

export interface BankAccountRequest {
  id: string;
  companyId: string;
  bankId: string;
  status: 'pending' | 'documents_review' | 'approved' | 'appointment_scheduled' | 'completed' | 'rejected';
  documentsTransferred: boolean;
  documents?: TransferredDocument[]; // Documents officiels transmis automatiquement (absents à la création de la demande)
  messages: BankMessage[];
  appointment?: {
    date: string;
    time: string;
    location: string;
    type: 'signature' | 'consultation';
    status: 'confirmed' | 'pending' | 'cancelled';
  };
  createdAt: string;
  updatedAt: string;
}