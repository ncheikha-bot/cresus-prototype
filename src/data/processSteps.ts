// Étapes du processus de création d'entreprise
// Utilisé par les clients (web et mobile) et l'admin

import type { IconeCresus } from '../components/ui/icons';
import { 
  FileText, 
  Eye, 
  FileCheck, 
  CheckCircle, 
  Building,
  Upload,
  PenTool,
  Package,
  DollarSign,
  Send,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Users,
} from '../components/ui/icons';

export interface ProcessStep {
  id: number;
  key: string;
  label: string;
  labelClient?: string; // Label spécifique pour le client
  description: string;
  descriptionClient?: string; // Description spécifique pour le client
  icon: IconeCresus;
  color?: string; // Classes Tailwind associées au statut (badge)
}

// Étapes du processus de création d'entreprise (côté admin)
export const ADMIN_CREATION_PROCESS_STEPS: ProcessStep[] = [
  { 
    id: 1, 
    key: 'submitted', 
    label: 'Dossier soumis', 
    labelClient: 'Dossier soumis',
    description: 'Informations reçues',
    descriptionClient: 'Votre demande a été envoyée',
    icon: FileText 
  },
  { 
    id: 2, 
    key: 'in_review', 
    label: 'En révision', 
    labelClient: 'Examen du dossier',
    description: 'Vérification en cours',
    descriptionClient: 'Vérification de vos documents',
    icon: Eye 
  },
  { 
    id: 3, 
    key: 'documents_ready', 
    label: 'Documents prêts', 
    labelClient: 'Documents disponibles',
    description: 'Documents générés',
    descriptionClient: 'Vos statuts sont prêts',
    icon: FileCheck 
  },
  { 
    id: 4, 
    key: 'signed', 
    label: 'Signé', 
    labelClient: 'Signature effectuée',
    description: 'Signatures obtenues',
    descriptionClient: 'Documents signés électroniquement',
    icon: PenTool 
  },
  { 
    id: 5, 
    key: 'completed', 
    label: 'Finalisé', 
    labelClient: 'Entreprise créée',
    description: 'Dossier terminé',
    descriptionClient: 'Votre entreprise est créée',
    icon: Building 
  },
];

// Étapes du processus de modification (côté admin)
export const ADMIN_MODIFICATION_PROCESS_STEPS: ProcessStep[] = [
  { 
    id: 1, 
    key: 'submitted', 
    label: 'Demande soumise', 
    labelClient: 'Demande envoyée',
    description: 'Documents reçus',
    descriptionClient: 'Votre demande a été envoyée',
    icon: FileText 
  },
  { 
    id: 2, 
    key: 'waiting_quote', 
    label: 'Établissement devis', 
    labelClient: 'En attente de devis',
    description: 'Analyse en cours',
    descriptionClient: 'Préparation de votre devis',
    icon: Clock 
  },
  { 
    id: 3, 
    key: 'quote_sent', 
    label: 'Devis envoyé', 
    labelClient: 'Devis reçu',
    description: 'Attente validation',
    descriptionClient: 'Veuillez valider le devis',
    icon: Send 
  },
  { 
    id: 4, 
    key: 'quote_validated', 
    label: 'Devis validé', 
    labelClient: 'Devis accepté',
    description: 'Traitement en cours',
    descriptionClient: 'Votre devis a été validé',
    icon: ThumbsUp 
  },
  { 
    id: 5, 
    key: 'in_review', 
    label: 'En révision', 
    labelClient: 'Examen en cours',
    description: 'Vérification documents',
    descriptionClient: 'Examen de votre demande',
    icon: Eye 
  },
  { 
    id: 6, 
    key: 'documents_ready', 
    label: 'Docs de modification prêts', 
    labelClient: 'Documents disponibles',
    description: 'Envoyés au client',
    descriptionClient: 'Documents à valider',
    icon: FileCheck 
  },
  { 
    id: 7, 
    key: 'signed', 
    label: 'Signé', 
    labelClient: 'Validation effectuée',
    description: 'Validé par le client',
    descriptionClient: 'Documents validés',
    icon: CheckCircle 
  },
  { 
    id: 8, 
    key: 'completed', 
    label: 'Finalisé', 
    labelClient: 'Modification complétée',
    description: 'Docs officiels envoyés',
    descriptionClient: 'Modification finalisée',
    icon: Building 
  },
];

// Timeline détaillée pour les clients (création d'entreprise)
export const CLIENT_CREATION_TIMELINE_EVENTS = [
  {
    id: '1',
    title: 'Dossier créé',
    description: 'Votre dossier de création d\'entreprise a été initialisé',
    status: 'completed',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: '2',
    title: 'Documents soumis',
    description: 'Tous les documents requis ont été téléchargés',
    status: 'completed',
    icon: Upload,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: '3',
    title: 'Examen par Crésus',
    description: 'Notre équipe vérifie votre dossier',
    status: 'in_progress',
    icon: Eye,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: '4',
    title: 'Documents prêts',
    description: 'Vos statuts et documents sont générés',
    status: 'pending',
    icon: FileCheck,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  {
    id: '5',
    title: 'Signature électronique',
    description: 'Signez vos documents en ligne',
    status: 'pending',
    icon: PenTool,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  {
    id: '6',
    title: 'Documents officiels',
    description: 'Réception de vos documents officiels',
    status: 'pending',
    icon: Package,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  {
    id: '7',
    title: 'Entreprise créée',
    description: 'Votre entreprise est officiellement enregistrée',
    status: 'pending',
    icon: Building,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
];

// Timeline de suivi affichée au client (mobile et web).
//
// L'ordre suit COMPANY_CREATION_STEPS : les deux timelines lisent les statuts
// renvoyés par getStepStatuses en s'alignant sur l'index, donc toute étape
// ajoutée au tunnel doit l'être ici, à la même position.
export const MOBILE_TIMELINE_STEPS = [
  {
    id: '1',
    label: 'Informations générales',
    status: 'completed',
    icon: FileText,
  },
  {
    id: '2',
    label: 'Répartition du capital',
    status: 'completed',
    icon: Building,
  },
  {
    id: '3',
    label: 'Coordonnées des associés',
    status: 'completed',
    icon: Users,
  },
  {
    id: '4',
    label: 'Documents justificatifs',
    status: 'completed',
    icon: FileCheck,
  },
  {
    id: '5',
    label: 'Validation du devis',
    status: 'completed',
    icon: CheckCircle,
  },
  {
    id: '6',
    label: 'Libération du capital',
    status: 'active',
    icon: Package,
  },
  {
    id: '7',
    label: 'Validation des statuts',
    status: 'pending',
    icon: FileCheck,
  },
  {
    id: '8',
    label: 'Signature des documents',
    status: 'pending',
    icon: PenTool,
  },
];

// Helper pour obtenir les labels côté client
export const getClientLabel = (step: ProcessStep): string => {
  return step.labelClient || step.label;
};

export const getClientDescription = (step: ProcessStep): string => {
  return step.descriptionClient || step.description;
};

// Helper pour trouver l'étape courante
export const getCurrentStepIndex = (steps: ProcessStep[], currentKey: string): number => {
  return steps.findIndex(s => s.key === currentKey);
};

// Helper pour déterminer si une étape est complétée
export const isStepCompleted = (steps: ProcessStep[], stepIndex: number, currentKey: string): boolean => {
  const currentIndex = getCurrentStepIndex(steps, currentKey);
  return stepIndex < currentIndex;
};

// Helper pour déterminer si une étape est active
export const isStepActive = (steps: ProcessStep[], stepIndex: number, currentKey: string): boolean => {
  const currentIndex = getCurrentStepIndex(steps, currentKey);
  return stepIndex === currentIndex;
};