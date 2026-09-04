import { FileText, Eye, DollarSign, ClipboardCheck, Landmark, FileCheck, PenTool } from '../../ui/icons';
import type { Company, CompanyProcessState } from '../../../types';

/**
 * Définition des 7 étapes du dossier vues côté administration.
 *
 * Séparé du rendu : le libellé de chaque étape dépend de l'état du dossier
 * (statuts envoyés, rendez-vous confirmé, société finalisée…), et cette logique
 * représentait 100 lignes au milieu d'un composant de 2 000.
 */
export interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'completed' | 'current' | 'pending' | 'blocked';
  adminAction?: string;
  clientAction?: string;
}

/** Ce dont la construction des étapes a besoin, en plus de la société. */
export interface StepContext {
  process: CompanyProcessState;
  /** Tous les documents fournis par le client ont été validés. */
  allDocumentsValidated: boolean;
  /** Au moins un document a été soumis. */
  hasDocuments: boolean;
}

const statusFromCurrentStep = (stepNumber: number, currentStep: number): Step['status'] => {
  if (stepNumber < currentStep) return 'completed';
  if (stepNumber === currentStep) return 'current';
  return 'pending';
};

/** Libellé de l'action admin attendue à l'étape 6, la plus ramifiée. */
const adminActionStatuts = (p: CompanyProcessState): string => {
  if (p.statutsValidatedByClient) {
    if (p.appointmentRequest) {
      return p.appointmentRequest.status === 'confirmed' ? 'RV confirmé' : 'Valider le RV';
    }
    return p.onlineSignatureCompleted ? 'Signatures reçues' : 'En attente de signature';
  }
  if (p.statutsRejectedByClient) return `Corriger et envoyer V${p.statutsVersion + 1}`;
  if (p.statutsSent) return `Statuts V${p.statutsVersion} envoyés`;
  return 'Générer et envoyer les statuts';
};

const clientActionStatuts = (p: CompanyProcessState): string => {
  if (p.statutsValidatedByClient) return 'Statuts validés';
  if (p.statutsRejectedByClient) return 'Statuts rejetés, en attente de correction';
  if (p.statutsSent) return 'En attente de validation client';
  return 'En attente des statuts';
};

export const buildSteps = (company: Company, ctx: StepContext): Step[] => {
  const { process: p, allDocumentsValidated, hasDocuments } = ctx;
  const currentStep = company.currentStep || 1;
  const statut = (n: number) => statusFromCurrentStep(n, currentStep);

  const quoteSent = company.quote?.status === 'sent' || company.quote?.status === 'validated';
  const quoteValidated = company.quote?.status === 'validated';
  // Un devis refusé disparaissait de l'écran d'administration : l'étape 3
  // réaffichait « En attente du devis », comme si rien n'avait été envoyé, et
  // le motif du client n'apparaissait nulle part.
  const quoteRejected = company.quote?.status === 'rejected';
  const signatureFaite = p.appointmentRequest?.status === 'confirmed' || p.onlineSignatureCompleted;
  // Créneau réservé par le client, que l'administration doit confirmer.
  const rendezVousAConfirmer = p.appointmentRequest?.status === 'pending';

  return [
    {
      number: 1,
      title: 'Dossier soumis',
      description: 'Informations complètes reçues du client',
      icon: FileText,
      status: statut(1),
      clientAction: 'Formulaire et documents soumis',
      adminAction:
        allDocumentsValidated && hasDocuments
          ? 'Documents validés'
          : 'Examiner et valider les documents soumis',
    },
    {
      number: 2,
      title: 'Examen du dossier',
      description: 'Vérification et validation des documents',
      icon: Eye,
      status: statut(2),
      clientAction: 'En attente de validation',
      adminAction: allDocumentsValidated ? 'Documents validés' : 'Valider les documents',
    },
    {
      number: 3,
      title: "Devis d'immatriculation",
      description: 'Création et envoi du devis',
      icon: DollarSign,
      status: statut(3),
      clientAction: quoteValidated
        ? 'Devis validé'
        : quoteRejected
          ? 'Devis refusé par le client'
          : quoteSent
            ? 'Devis reçu'
            : 'En attente du devis',
      adminAction: quoteValidated
        ? 'Devis envoyé'
        : quoteRejected
          ? 'Corriger et renvoyer le devis'
          : quoteSent
            ? 'Devis envoyé'
            : 'Créer et envoyer le devis',
    },
    {
      number: 4,
      title: 'Validation devis',
      description: 'Validation du devis par le client',
      icon: ClipboardCheck,
      // Tant que le client n'a pas validé, l'étape reste bloquée.
      status: quoteValidated ? statut(4) : 'blocked',
      clientAction: quoteValidated
        ? 'Devis validé'
        : quoteRejected
          ? 'Devis refusé'
          : 'En attente de validation',
      adminAction: quoteValidated
        ? 'Devis validé par le client'
        : quoteRejected
          ? 'Le client attend un devis corrigé'
          : 'En attente du client',
    },
    {
      number: 5,
      title: 'Libération du capital',
      description: 'Versement du capital social',
      icon: Landmark,
      status: quoteValidated ? statut(5) : 'blocked',
      clientAction: 'Paiement en attente',
      adminAction: 'Attendre la confirmation de paiement',
    },
    {
      number: 6,
      title: 'Validation statuts',
      description: 'Génération et validation des statuts',
      icon: FileCheck,
      status: statut(6),
      clientAction: clientActionStatuts(p),
      adminAction: adminActionStatuts(p),
    },
    {
      number: 7,
      title: 'Signature et finalisation',
      description: 'Signature finale et documents officiels',
      icon: PenTool,
      status: statut(7),
      clientAction: p.companyFinalized
        ? 'Société créée'
        : rendezVousAConfirmer
          ? 'Créneau demandé, en attente de confirmation'
          : 'En attente de finalisation',
      adminAction: p.companyFinalized
        ? 'Documents officiels uploadés'
        : signatureFaite
          ? 'Finaliser et uploader documents officiels'
          : rendezVousAConfirmer
            ? 'Confirmer le rendez-vous de signature'
            : 'En attente de signature',
    },
  ];
};

/** Palette associée au statut d'une étape. */
export const getStepColor = (status: Step['status']) => {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600',
        iconBg: 'bg-green-100',
      };
    case 'current':
      return {
        bg: 'bg-[#D6A93A]/10',
        border: 'border-[#D6A93A]/30',
        text: 'text-[#1A2753]',
        icon: 'text-[#D6A93A]',
        iconBg: 'bg-[#D6A93A]/20',
      };
    case 'blocked':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: 'text-red-600',
        iconBg: 'bg-red-100',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: 'text-gray-600',
        iconBg: 'bg-gray-100',
      };
  }
};
