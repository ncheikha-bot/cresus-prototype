import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Download,
  Send,
  Edit,
  TrendingUp,
  Package,
  X,
  Check,
  Upload,
  History,
  AlertCircle,
  Settings,
  MapPin,
  DollarSign,
  UserCheck,
  Target,
  Calendar,
  Trash2,
  FilePlus,
  FileCheck,
  FileClock,
  FileX,
  Plus,
  MoreVertical,
  User,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Info,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import type { Modification, Document, DocumentReview, DocumentVersion } from '../../types';
import type { CompanyType } from '../../data/modificationsData';
import {
  getRequiredDocuments,
  getAvailableModifications,
  getRequiredInfo,
  getLibelleChoix,
} from '../../data/modificationsData';
import { ADMIN_MODIFICATION_PROCESS_STEPS } from '../../data/processSteps';
import { nouvelId } from '../../lib/id';

interface AdminModificationsProps {
  onBack: () => void;
}

// Documents que l'admin peut ajouter pendant le processus
const MODIFICATION_ADMIN_DOCUMENTS = [
  // Documents de modification (à valider par le client)
  { code: 'STATUTS_MODIFIES_DRAFT', label: 'Statuts modifiés (brouillon)', description: 'À valider par le client', category: 'process' },
  { code: 'STATUTS_MODIFIES_REVISED', label: 'Statuts modifiés (révisé)', description: 'Suite aux retours client', category: 'process' },
  { code: 'PV_MODIFICATION', label: 'PV de modification', description: 'À signer par le client', category: 'process' },
  { code: 'ATTESTATION_MODIFICATION', label: 'Attestation de modification', description: 'Document préparatoire', category: 'process' },
  
  // Documents officiels finaux (après signature)
  { code: 'STATUTS_MODIFIES_FINAL', label: 'Statuts modifiés signés', description: 'Document officiel', category: 'final' },
  { code: 'RC_MODIFIE', label: 'RC modifié', description: 'Nouveau registre de commerce', category: 'final' },
  { code: 'NINEA_MODIFIE', label: 'NINEA mis à jour', description: 'Numéro actualisé', category: 'final' },
  { code: 'CERTIFICAT_MODIFICATION', label: 'Certificat de modification', description: 'Document officiel APIX', category: 'final' },
  { code: 'KBIS_MODIFIE', label: 'Extrait KBIS actualisé', description: 'Nouvelle extraction', category: 'final' },
];

interface ModificationRequest extends Modification {
  company?: {
    name: string;
    legalForm: string;
    capital?: number;
  };
  clientName?: string;
  modificationLabel?: string;
  documentsUploaded?: number;
  documentsRequired?: number;
  quote?: Modification['quote'] & { validUntil?: string };
  clientComments?: string;
}

// Définir quels documents et actions sont pertinents pour chaque étape
const STEP_RELEVANT_ELEMENTS = {
  submitted: {
    documentsToShow: ['client'], // Documents soumis par le client
    adminDocumentsAllowed: false, // Pas encore de docs admin
    officialDocumentsAllowed: false,
    actions: ['review', 'message'],
    infoSections: ['company', 'modification', 'clientDocuments'],
  },
  waiting_quote: {
    documentsToShow: ['client'],
    adminDocumentsAllowed: false,
    officialDocumentsAllowed: false,
    actions: ['sendQuote', 'message'],
    infoSections: ['company', 'modification', 'clientDocuments'],
  },
  quote_sent: {
    documentsToShow: ['client'],
    adminDocumentsAllowed: false,
    officialDocumentsAllowed: false,
    actions: ['message'],
    infoSections: ['company', 'modification', 'quote', 'clientDocuments'],
    showQuoteInfo: true,
  },
  quote_validated: {
    documentsToShow: ['client', 'admin'],
    adminDocumentsAllowed: true,
    officialDocumentsAllowed: false,
    actions: ['uploadModificationDocs', 'message'],
    infoSections: ['company', 'modification', 'quote', 'clientDocuments'],
    showQuoteInfo: true,
  },
  quote_rejected: {
    documentsToShow: ['client'],
    adminDocumentsAllowed: false,
    officialDocumentsAllowed: false,
    actions: ['reviseQuote', 'message'],
    infoSections: ['company', 'modification', 'quote', 'clientDocuments', 'rejectionReason'],
    showQuoteInfo: true,
    showRejectionReason: true,
  },
  in_review: {
    documentsToShow: ['client', 'admin'],
    adminDocumentsAllowed: true,
    officialDocumentsAllowed: false,
    actions: ['uploadModificationDocs', 'review', 'message'],
    infoSections: ['company', 'modification', 'clientDocuments', 'adminDocuments'],
  },
  documents_ready: {
    documentsToShow: ['client', 'admin'],
    adminDocumentsAllowed: true,
    officialDocumentsAllowed: false,
    actions: ['uploadModificationDocs', 'message'],
    infoSections: ['company', 'modification', 'clientDocuments', 'adminDocuments'],
  },
  signed: {
    documentsToShow: ['client', 'admin', 'official'],
    adminDocumentsAllowed: true,
    officialDocumentsAllowed: true,
    actions: ['uploadOfficialDocs', 'message'],
    infoSections: ['company', 'modification', 'allDocuments'],
  },
  completed: {
    documentsToShow: ['all'],
    adminDocumentsAllowed: false,
    officialDocumentsAllowed: false,
    actions: ['message', 'viewHistory'],
    infoSections: ['company', 'modification', 'allDocuments', 'completionInfo'],
  },
};

// Fonction pour obtenir les éléments pertinents pour une étape
const getRelevantElements = (status: Modification['status']) => {
  return STEP_RELEVANT_ELEMENTS[status as keyof typeof STEP_RELEVANT_ELEMENTS] || STEP_RELEVANT_ELEMENTS.submitted;
}

/** Libellé d'un type de modification, quelle que soit la forme juridique. */
const getModificationLabel = (typeId: string): string => {
  const formes: CompanyType[] = ['SARL', 'SUARL', 'SA_CA', 'SA_AG', 'SAS', 'SASU', 'SCI'];
  for (const forme of formes) {
    const trouve = getAvailableModifications(forme).find(m => m.id === typeId);
    if (trouve) return trouve.label;
  }
  return typeId;
};

export const AdminModifications: React.FC<AdminModificationsProps> = ({ onBack }) => {
  const { companies, modifications, updateModification, addNotification } = useApp();

  const [view, setView] = useState<'overview' | 'requests' | 'details'>('overview');
  const [selectedRequest, setSelectedRequest] = useState<ModificationRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | Modification['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // States
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploadDocType, setUploadDocType] = useState('');
  const [uploadComment, setUploadComment] = useState('');
  const [messageText, setMessageText] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [docFilter, setDocFilter] = useState<'all' | 'client' | 'admin' | 'official'>('all');
  /** Saisie du devis de modification : l'écran faisait avancer l'étape
   *  « Devis envoyé » sans qu'aucun montant n'ait jamais été chiffré. */
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDetails, setQuoteDetails] = useState('');

  // Mock modification requests data
  /**
   * Demandes d'exemple, conservées pour peupler l'écran.
   *
   * Les demandes réelles arrivent du référentiel partagé : cet écran ne
   * voyait auparavant que ces exemples, si bien qu'une demande soumise par
   * un client n'atteignait jamais l'administration.
   */
  const [demandesExemple, setDemandesExemple] = useState<ModificationRequest[]>([
    // Vidé : plus aucun dossier fabriqué. L'écran se remplit de ce que les
    // clients soumettent réellement.
  ]);

  /** Demandes réelles, mises à la forme attendue par cet écran. */
  const demandesClients: ModificationRequest[] = modifications.map(m => {
    const societe = companies.find(c => c.id === m.companyId);
    return {
      ...m,
      company: societe
        ? { name: societe.name, legalForm: societe.legalForm, capital: societe.capital }
        : undefined,
      clientName: societe?.legalRepresentative
        ? `${societe.legalRepresentative.firstName} ${societe.legalRepresentative.lastName}`
        : undefined,
      // Le libellé nomme la modification ; la description situe la société.
      // Les confondre affichait deux fois la même ligne sur la carte.
      modificationLabel: getModificationLabel(m.type),
      documentsUploaded: m.uploadedDocs?.length ?? 0,
      documentsRequired: m.uploadedDocs?.length ?? 0,
    };
  });

  const modificationRequests = [...demandesClients, ...demandesExemple];

  /** Une demande réelle est écrite dans le référentiel ; un exemple reste local. */
  const majDemande = (id: string, updates: Partial<ModificationRequest>) => {
    if (modifications.some(m => m.id === id)) updateModification(id, updates);
    else setDemandesExemple(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  // Mock documents
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc-mod-1',
      companyId: '1',
      name: 'Statuts modifiés - Nouveau siège',
      type: 'STATUTS_MODIFIES_DRAFT',
      url: '#',
      status: 'awaiting_validation',
      uploadedAt: '2024-11-02',
      uploadedBy: 'admin',
      currentVersion: 1,
      versions: [
        { versionNumber: 1, url: '#', uploadedAt: '2024-11-02T10:00:00Z', uploadedBy: 'admin1' }
      ],
      reviews: [],
      size: '256 KB',
      pages: 15,
    },
    {
      id: 'doc-mod-2',
      companyId: '1',
      name: 'PV AGE - Transfert siège',
      type: 'PV_MODIFICATION',
      url: '#',
      status: 'awaiting_validation',
      uploadedAt: '2024-11-02',
      uploadedBy: 'admin',
      currentVersion: 1,
      versions: [
        { versionNumber: 1, url: '#', uploadedAt: '2024-11-02T10:15:00Z', uploadedBy: 'admin1' }
      ],
      reviews: [],
      size: '128 KB',
      pages: 3,
    },
    {
      id: 'doc-mod-3',
      companyId: '1',
      name: 'CNI du nouveau gérant',
      type: 'CNI',
      url: '#',
      status: 'validated',
      uploadedAt: '2024-11-01',
      uploadedBy: 'client',
      currentVersion: 1,
      versions: [
        { versionNumber: 1, url: '#', uploadedAt: '2024-11-01T14:30:00Z', uploadedBy: 'client1' }
      ],
      reviews: [
        {
          id: 'r1',
          documentId: 'doc-mod-3',
          reviewedAt: '2024-11-01T16:00:00',
          status: 'validated',
          reviewedBy: 'admin1',
          comment: 'Document conforme',
        }
      ],
      size: '198 KB',
      pages: 2,
    },
    {
      id: 'doc-mod-4',
      companyId: '2',
      name: 'RC modifié',
      type: 'RC_MODIFIE',
      url: '#',
      status: 'validated',
      uploadedAt: '2024-10-30',
      uploadedBy: 'admin',
      currentVersion: 1,
      versions: [
        { versionNumber: 1, url: '#', uploadedAt: '2024-10-30T10:00:00Z', uploadedBy: 'admin1' }
      ],
      reviews: [],
      size: '512 KB',
      pages: 2,
      isOfficial: true,
    },
    {
      id: 'doc-mod-5',
      companyId: '2',
      name: 'NINEA mis à jour',
      type: 'NINEA_MODIFIE',
      url: '#',
      status: 'validated',
      uploadedAt: '2024-10-30',
      uploadedBy: 'admin',
      currentVersion: 1,
      versions: [
        { versionNumber: 1, url: '#', uploadedAt: '2024-10-30T10:30:00Z', uploadedBy: 'admin1' }
      ],
      reviews: [],
      size: '256 KB',
      pages: 1,
      isOfficial: true,
    },
  ]);

  const getStatusLabel = (status: Modification['status']): string => {
    const labels: Record<Modification['status'], string> = {
      pending: 'En attente',
      submitted: 'Soumis',
      waiting_quote: 'Attente devis',
      quote_sent: 'Devis envoyé',
      quote_validated: 'Devis validé',
      quote_rejected: 'Devis rejeté',
      in_review: 'En révision',
      documents_ready: 'Docs prêts',
      signed: 'Signé',
      completed: 'Complété',
    };
    return labels[status];
  };

  const getStatusColor = (status: Modification['status']): string => {
    const colors: Record<Modification['status'], string> = {
      pending: 'bg-gray-100 text-gray-700 border-gray-200',
      submitted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      waiting_quote: 'bg-orange-100 text-orange-700 border-orange-200',
      quote_sent: 'bg-blue-100 text-blue-700 border-blue-200',
      quote_validated: 'bg-green-100 text-green-700 border-green-200',
      quote_rejected: 'bg-red-100 text-red-700 border-red-200',
      in_review: 'bg-purple-100 text-purple-700 border-purple-200',
      documents_ready: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      signed: 'bg-teal-100 text-teal-700 border-teal-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return colors[status];
  };

  const getDocumentStatusConfig = (status: Document['status']) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'En attente', 
          color: 'text-gray-600', 
          bg: 'bg-gray-50', 
          border: 'border-gray-200', 
          icon: Clock,
          badgeBg: 'bg-gray-100'
        };
      case 'awaiting_validation':
        return { 
          label: 'À valider client', 
          color: 'text-purple-600', 
          bg: 'bg-purple-50', 
          border: 'border-purple-200', 
          icon: FileClock,
          badgeBg: 'bg-purple-100'
        };
      case 'validated':
        return { 
          label: 'Validé', 
          color: 'text-green-600', 
          bg: 'bg-green-50', 
          border: 'border-green-200', 
          icon: CheckCircle,
          badgeBg: 'bg-green-100'
        };
      case 'under_revision':
        return { 
          label: 'À corriger', 
          color: 'text-red-600', 
          bg: 'bg-red-50', 
          border: 'border-red-200', 
          icon: FileX,
          badgeBg: 'bg-red-100'
        };
      case 'signed':
        return { 
          label: 'Signé', 
          color: 'text-blue-600', 
          bg: 'bg-blue-50', 
          border: 'border-blue-200', 
          icon: FileCheck,
          badgeBg: 'bg-blue-100'
        };
      default:
        return { 
          label: 'Inconnu', 
          color: 'text-gray-600', 
          bg: 'bg-gray-50', 
          border: 'border-gray-200', 
          icon: FileText,
          badgeBg: 'bg-gray-100'
        };
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      siege: <MapPin className="w-5 h-5" />,
      capital: <DollarSign className="w-5 h-5" />,
      gerant: <UserCheck className="w-5 h-5" />,
      objet_social: <Target className="w-5 h-5" />,
    };
    return icons[type] || <FileText className="w-5 h-5" />;
  };

  /** Ce qui manque pour franchir l'étape ; `null` si la voie est libre. */
  const travailEnAttente = (request: ModificationRequest): string | null => {
    if (request.status === 'waiting_quote' && !request.quote) {
      return "le devis n'a pas encore été chiffré";
    }
    if (request.status === 'quote_sent') {
      return "le client n'a pas encore validé le devis";
    }
    return null;
  };

  const handleSendQuote = () => {
    if (!selectedRequest) return;
    const montant = Number(quoteAmount.replace(/\s/g, ''));
    if (!Number.isFinite(montant) || montant <= 0) return;

    const maintenant = new Date();
    // Un devis sans date de fin s'affichait « Valide jusqu'au : Invalid Date ».
    const finValidite = new Date(maintenant.getTime() + 30 * 24 * 60 * 60 * 1000);
    const devis = {
      amount: montant,
      details: quoteDetails,
      status: 'sent' as const,
      sentAt: maintenant.toISOString(),
      validUntil: finValidite.toISOString(),
    };
    majDemande(selectedRequest.id, { quote: devis, status: 'quote_sent' });
    setSelectedRequest({ ...selectedRequest, quote: devis, status: 'quote_sent' });
    setShowQuoteModal(false);
    setQuoteAmount('');
    setQuoteDetails('');

    addNotification({
      userId: selectedRequest.clientId || '1',
      title: 'Devis reçu',
      message: `Le devis de votre modification s'élève à ${montant.toLocaleString('fr-FR')} FCFA. Consultez-le pour le valider.`,
      type: 'success',
      read: false,
    });
  };

  const handleAdvanceStatus = (request: ModificationRequest) => {
    const blocage = travailEnAttente(request);
    if (blocage) {
      addNotification({
        userId: '2',
        title: 'Étape non franchissable',
        message: `Impossible : ${blocage}.`,
        type: 'warning',
        read: false,
      });
      return;
    }
    const currentStepIndex = ADMIN_MODIFICATION_PROCESS_STEPS.findIndex(s => s.key === request.status);
    if (currentStepIndex < ADMIN_MODIFICATION_PROCESS_STEPS.length - 1) {
      const nextStatus = ADMIN_MODIFICATION_PROCESS_STEPS[currentStepIndex + 1].key as Modification['status'];
      const nextStep = ADMIN_MODIFICATION_PROCESS_STEPS[currentStepIndex + 1];
      
      majDemande(request.id, { status: nextStatus });
      
      if (selectedRequest?.id === request.id) {
        setSelectedRequest({ ...request, status: nextStatus });
      }

      addNotification({
        userId: '1',
        title: 'Mise à jour de votre modification',
        message: `Le statut de votre demande de modification "${request.modificationLabel}" a été mis à jour : ${nextStep.labelClient || nextStep.label}`,
        type: 'info',
        read: false,
      });
    }
  };

  const handleAddNewDocument = () => {
    if (!selectedRequest || !uploadDocType) return;

    const docInfo = MODIFICATION_ADMIN_DOCUMENTS.find(d => d.code === uploadDocType);
    if (!docInfo) return;

    const newDoc: Document = {
      id: nouvelId('doc'),
      companyId: selectedRequest.companyId,
      name: docInfo.label,
      // Le select n'expose que les codes de MODIFICATION_ADMIN_DOCUMENTS,
      // tous présents dans DocumentType : l'état reste un `string`.
      type: uploadDocType as Document['type'],
      url: '#',
      status: docInfo.category === 'process' ? 'awaiting_validation' : 'validated',
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'admin',
      currentVersion: 1,
      versions: [
        {
          versionNumber: 1,
          url: '#',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'admin_current',
          comment: uploadComment || undefined,
        }
      ],
      reviews: [],
      size: '0 KB',
      pages: 1,
      isOfficial: docInfo.category === 'final',
    };

    setDocuments(docs => [...docs, newDoc]);

    const notificationMessage = docInfo.category === 'process'
      ? `Le document "${newDoc.name}" a été ajouté à votre dossier de modification et attend votre validation.`
      : `Votre document officiel "${newDoc.name}" est disponible.`;

    addNotification({
      userId: '1',
      title: docInfo.category === 'process' ? 'Nouveau document à valider' : 'Document officiel disponible',
      message: notificationMessage,
      type: docInfo.category === 'process' ? 'info' : 'success',
      read: false,
    });

    setShowUploadModal(false);
    setUploadDocType('');
    setUploadComment('');
  };

  const handleUploadNewVersion = () => {
    if (!selectedDoc) return;

    const newVersion: DocumentVersion = {
      versionNumber: selectedDoc.currentVersion + 1,
      url: '#',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'admin_current',
      comment: uploadComment || undefined,
    };

    setDocuments(docs => docs.map(d =>
      d.id === selectedDoc.id
        ? {
            ...d,
            currentVersion: newVersion.versionNumber,
            versions: [...d.versions, newVersion],
            status: 'awaiting_validation' as const,
          }
        : d
    ));

    if (selectedRequest) {
      addNotification({
        userId: '1',
        title: 'Document mis à jour',
        message: `Une nouvelle version de "${selectedDoc.name}" a été uploadée et attend votre validation.`,
        type: 'info',
        read: false,
      });
    }

    setShowUploadModal(false);
    setUploadComment('');
    setSelectedDoc(null);
  };

  const handleReviewDocument = () => {
    if (!selectedDoc || !reviewAction) return;

    const review: DocumentReview = {
      id: nouvelId('review'),
      documentId: selectedDoc.id,
      reviewedAt: new Date().toISOString(),
      status: reviewAction === 'approve' ? 'validated' : 'rejected',
      reviewedBy: 'admin_current',
      comment: reviewComment || undefined,
    };

    setDocuments(docs => docs.map(d =>
      d.id === selectedDoc.id
        ? {
            ...d,
            status: reviewAction === 'approve' ? 'validated' : 'under_revision',
            reviews: [...(d.reviews || []), review],
          }
        : d
    ));

    if (selectedRequest) {
      addNotification({
        userId: '1',
        title: reviewAction === 'approve' ? 'Document validé' : 'Document à corriger',
        message: reviewAction === 'approve' 
          ? `Votre document "${selectedDoc.name}" a été validé.`
          : `Votre document "${selectedDoc.name}" nécessite des corrections : ${reviewComment}`,
        type: reviewAction === 'approve' ? 'success' : 'warning',
        read: false,
      });
    }

    setShowReviewModal(false);
    setReviewAction(null);
    setReviewComment('');
    setSelectedDoc(null);
  };

  const handleSendMessage = () => {
    if (!selectedRequest || !messageText.trim()) return;

    addNotification({
      userId: '1',
      title: 'Message concernant votre modification',
      message: messageText,
      type: 'info',
      read: false,
    });

    setMessageText('');
    setShowMessageModal(false);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(docs => docs.filter(d => d.id !== docId));
  };

  const filteredRequests = modificationRequests.filter((request) => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch =
      request.company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.modificationLabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: modificationRequests.length,
    submitted: modificationRequests.filter((r) => r.status === 'submitted').length,
    waiting_quote: modificationRequests.filter((r) => r.status === 'waiting_quote').length,
    quote_sent: modificationRequests.filter((r) => r.status === 'quote_sent').length,
    quote_validated: modificationRequests.filter((r) => r.status === 'quote_validated').length,
    quote_rejected: modificationRequests.filter((r) => r.status === 'quote_rejected').length,
    in_review: modificationRequests.filter((r) => r.status === 'in_review').length,
    documents_ready: modificationRequests.filter((r) => r.status === 'documents_ready').length,
    signed: modificationRequests.filter((r) => r.status === 'signed').length,
    completed: modificationRequests.filter((r) => r.status === 'completed').length,
    pending: modificationRequests.filter((r) => ['submitted', 'waiting_quote', 'quote_sent', 'in_review'].includes(r.status)).length,
  };

  // ========== VUE OVERVIEW ==========
  if (view === 'overview') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button aria-label="Retour"
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-white hover:bg-[#F5F6FA] rounded-xl flex items-center justify-center transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
          </button>
          <div>
            <h2 className="text-[#1A2753]">Modifications post-statutaires</h2>
            <p className="text-sm text-[#273A7A]/80 mt-1">
              Gérer les demandes de modification des entreprises
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-3xl mb-1">{stats.total}</p>
                <p className="text-sm opacity-80">Demandes totales</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <TrendingUp className="w-4 h-4" />
              <span>Ce mois-ci</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[#D6A93A] to-[#b8902f] rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-3xl mb-1">{stats.submitted + stats.in_review}</p>
                <p className="text-sm opacity-80">En attente</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <AlertTriangle className="w-4 h-4" />
              <span>À traiter</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 border-2 border-[#F5F6FA]"
          >
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-purple-600" />
              <div className="text-right">
                <p className="text-[#1A2753] text-3xl mb-1">{stats.documents_ready}</p>
                <p className="text-sm text-[#273A7A]/80">Docs prêts</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#273A7A]/80">
              <CheckCircle className="w-4 h-4" />
              <span>À valider client</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 border-2 border-[#F5F6FA]"
          >
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="text-right">
                <p className="text-[#1A2753] text-3xl mb-1">{stats.signed + stats.completed}</p>
                <p className="text-sm text-[#273A7A]/80">Finalisés</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#273A7A]/80">
              <TrendingUp className="w-4 h-4" />
              <span>Signés/Complétés</span>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setView('requests')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-white rounded-2xl p-6 border-2 border-[#F5F6FA] hover:border-[#D6A93A] transition-all duration-300 text-left group"
          >
            <FileText className="w-8 h-8 text-[#D6A93A] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-[#1A2753] mb-2">Gérer les demandes</h3>
            <p className="text-sm text-[#273A7A]/80">
              Examiner et valider les demandes de modification
            </p>
          </button>

          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-white rounded-2xl p-6 border-2 border-[#F5F6FA] hover:border-[#D6A93A] transition-all duration-300 text-left group">
            <Settings className="w-8 h-8 text-[#D6A93A] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-[#1A2753] mb-2">Types de modifications</h3>
            <p className="text-sm text-[#273A7A]/80">
              Configurer les types de modifications disponibles
            </p>
          </button>

          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-white rounded-2xl p-6 border-2 border-[#F5F6FA] hover:border-[#D6A93A] transition-all duration-300 text-left group">
            <History className="w-8 h-8 text-[#D6A93A] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-[#1A2753] mb-2">Historique</h3>
            <p className="text-sm text-[#273A7A]/80">
              Consulter l'historique des modifications complétées
            </p>
          </button>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#1A2753]">Demandes récentes</h3>
            <button
              onClick={() => setView('requests')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-sm text-[#D6A93A] hover:underline"
            >
              Voir tout
            </button>
          </div>

          <div className="space-y-3">
            {modificationRequests.slice(0, 5).map((request) => {
              const statusColor = getStatusColor(request.status);

              return (
                <button type="button"
                  key={request.id}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] block w-full text-left p-4 rounded-xl border-2 border-[#F5F6FA] hover:border-[#D6A93A] transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedRequest(request);
                    setView('details');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#F5F6FA] rounded-xl flex items-center justify-center text-[#1A2753]">
                        {getTypeIcon(request.type)}
                      </div>
                      <div>
                        <h4 className="text-[#1A2753]">{request.company?.name}</h4>
                        <p className="text-sm text-[#273A7A]/80 mt-1">
                          {request.modificationLabel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[#1A2753] text-sm">
                          {request.documentsUploaded}/{request.documentsRequired} documents
                        </p>
                        <p className="text-xs text-[#273A7A]/80 mt-1">
                          {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-sm border-2 ${statusColor}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ========== VUE REQUESTS ==========
  if (view === 'requests') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button aria-label="Retour"
            onClick={() => setView('overview')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-white hover:bg-[#F5F6FA] rounded-xl flex items-center justify-center transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
          </button>
          <div>
            <h2 className="text-[#1A2753]">Demandes de modification</h2>
            <p className="text-sm text-[#273A7A]/80 mt-1">
              {filteredRequests.length} demande(s)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#273A7A]/40" />
              <input
                type="text"
                placeholder="Rechercher par entreprise, type ou ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#273A7A]/80" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] outline-none transition-all"
              >
                <option value="all">Tous les statuts</option>
                <option value="submitted">Soumis</option>
                <option value="in_review">En révision</option>
                <option value="documents_ready">Docs prêts</option>
                <option value="signed">Signé</option>
                <option value="completed">Complété</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-[#273A7A]/30 mx-auto mb-4" />
              <p className="text-[#273A7A]/80">Aucune demande trouvée</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const statusColor = getStatusColor(request.status);
              const progressPercentage =
                ((request.documentsUploaded || 0) / (request.documentsRequired || 1)) * 100;

              return (
                <motion.button type="button"
                  key={request.id}
                  layout
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] block w-full text-left bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-[#D6A93A] transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedRequest(request);
                    setView('details');
                  }}
                >
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        request.status === 'completed' || request.status === 'signed'
                          ? 'bg-green-50 text-green-600'
                          : request.status === 'documents_ready'
                          ? 'bg-purple-50 text-purple-600'
                          : request.status === 'in_review'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-yellow-50 text-yellow-600'
                      }`}
                    >
                      {getTypeIcon(request.type)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-[#1A2753]">{request.company?.name}</h3>
                            <span className="px-2 py-0.5 bg-[#F5F6FA] text-xs text-[#273A7A] rounded">
                              {request.company?.legalForm}
                            </span>
                          </div>
                          <p className="text-[#273A7A]/80 mb-2">{request.modificationLabel}</p>
                          <p className="text-sm text-[#273A7A]/80">{request.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-lg text-sm border-2 ${statusColor}`}>
                            {getStatusLabel(request.status)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div className="bg-[#F5F6FA] rounded-xl p-3">
                          <p className="text-xs text-[#273A7A]/80 mb-1">Client</p>
                          <p className="text-[#1A2753] text-sm">{request.clientName}</p>
                        </div>
                        <div className="bg-[#F5F6FA] rounded-xl p-3">
                          <p className="text-xs text-[#273A7A]/80 mb-1">Date de demande</p>
                          <p className="text-[#1A2753] text-sm">
                            {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="bg-[#F5F6FA] rounded-xl p-3">
                          <p className="text-xs text-[#273A7A]/80 mb-1">Documents client</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[#1A2753] text-sm">
                              {request.documentsUploaded}/{request.documentsRequired}
                            </p>
                            <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#D6A93A] to-[#b8902f]"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#F5F6FA] rounded-xl p-3">
                          <p className="text-xs text-[#273A7A]/80 mb-1">ID</p>
                          <p className="text-[#1A2753] text-sm font-mono">{request.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ========== VUE DETAILS ==========
  if (view === 'details' && selectedRequest) {
    const statusColor = getStatusColor(selectedRequest.status);
    const requiredDocs = getRequiredDocuments(
      selectedRequest.company?.legalForm as CompanyType,
      selectedRequest.type
    );

    const requestDocs = documents.filter(d => d.companyId === selectedRequest.companyId);
    const clientDocs = requestDocs.filter(d => d.uploadedBy === 'client');
    const adminDocs = requestDocs.filter(d => d.uploadedBy === 'admin' && !d.isOfficial);
    const officialDocs = requestDocs.filter(d => d.isOfficial);

    // Obtenir les éléments pertinents pour l'étape actuelle
    const relevantElements = getRelevantElements(selectedRequest.status);

    // Filtrer les documents selon l'étape actuelle et le filtre utilisateur
    const getStepFilteredDocs = () => {
      let docs = requestDocs;
      
      // Filtrage selon l'étape
      const { documentsToShow } = relevantElements;
      if (!documentsToShow.includes('all')) {
        docs = docs.filter(doc => {
          if (documentsToShow.includes('client') && doc.uploadedBy === 'client') return true;
          if (documentsToShow.includes('admin') && doc.uploadedBy === 'admin' && !doc.isOfficial) return true;
          if (documentsToShow.includes('official') && doc.isOfficial) return true;
          return false;
        });
      }

      // Filtrage selon le filtre utilisateur
      if (docFilter !== 'all') {
        docs = docs.filter(doc => {
          if (docFilter === 'client') return doc.uploadedBy === 'client';
          if (docFilter === 'admin') return doc.uploadedBy === 'admin' && !doc.isOfficial;
          if (docFilter === 'official') return doc.isOfficial;
          return true;
        });
      }

      return docs;
    };

    const filteredDocs = getStepFilteredDocs();

    const currentStepIndex = ADMIN_MODIFICATION_PROCESS_STEPS.findIndex(s => s.key === selectedRequest.status);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button aria-label="Retour"
            onClick={() => {
              setSelectedRequest(null);
              setView('requests');
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-white hover:bg-[#F5F6FA] rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-[#1A2753]">{selectedRequest.company?.name}</h2>
              <span className={`px-3 py-1 rounded-lg text-sm border-2 ${statusColor}`}>
                {getStatusLabel(selectedRequest.status)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#273A7A]/80">
              <span className="flex items-center gap-1">
                {getTypeIcon(selectedRequest.type)}
                {selectedRequest.modificationLabel}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(selectedRequest.createdAt).toLocaleDateString('fr-FR')}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Demande #{selectedRequest.id}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMessageModal(true)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-white border-2 border-[#F5F6FA] text-[#1A2753] rounded-xl hover:border-[#D6A93A] transition-all duration-300 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Message
            </button>
            {selectedRequest.status === 'waiting_quote' && (
              <button
                onClick={() => setShowQuoteModal(true)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-white border-2 border-[#D6A93A] text-[#1A2753] rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                {selectedRequest.quote ? 'Modifier le devis' : 'Chiffrer le devis'}
              </button>
            )}
            {currentStepIndex < ADMIN_MODIFICATION_PROCESS_STEPS.length - 1 && (
              <button
                onClick={() => handleAdvanceStatus(selectedRequest)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Passer à l'étape suivante
              </button>
            )}
          </div>
        </div>

        {/* Process Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-[#D6A93A]" />
            Processus de modification
          </h3>
          <div className="flex items-center justify-between">
            {ADMIN_MODIFICATION_PROCESS_STEPS.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
                        isActive
                          ? isCurrent
                            ? 'bg-[#D6A93A] text-white shadow-lg scale-110'
                            : 'bg-green-100 text-green-600'
                          : 'bg-[#F5F6FA] text-[#273A7A]/40'
                      }`}
                    >
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <p className={`text-sm text-center mb-1 ${isActive ? 'text-[#1A2753]' : 'text-[#273A7A]/80'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-[#273A7A]/80 text-center">{step.description}</p>
                  </div>
                  {index < ADMIN_MODIFICATION_PROCESS_STEPS.length - 1 && (
                    <div className={`h-1 flex-1 mx-4 rounded-full ${isActive ? 'bg-green-200' : 'bg-[#F5F6FA]'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          index < currentStepIndex ? 'bg-green-500 w-full' : 'bg-transparent w-0'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Company & Modification Info */}
        <div className="grid grid-cols-3 gap-6">
          {/* Company Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#D6A93A]" />
              Informations entreprise
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Nom de l'entreprise</p>
                <p className="text-[#1A2753]">{selectedRequest.company?.name}</p>
              </div>
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Forme juridique</p>
                <p className="text-[#1A2753]">{selectedRequest.company?.legalForm}</p>
              </div>
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Capital social</p>
                <p className="text-[#1A2753]">
                  {selectedRequest.company?.capital?.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Client</p>
                <p className="text-[#1A2753]">{selectedRequest.clientName}</p>
              </div>
            </div>
          </div>

          {/* Modification Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#D6A93A]" />
              Détails modification
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Type de modification</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#F5F6FA] rounded-lg flex items-center justify-center text-[#1A2753]">
                    {getTypeIcon(selectedRequest.type)}
                  </div>
                  <p className="text-[#1A2753]">{selectedRequest.modificationLabel}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Description</p>
                <p className="text-[#1A2753]">{selectedRequest.description}</p>
              </div>
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Date de demande</p>
                <p className="text-[#1A2753]">
                  {new Date(selectedRequest.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Informations saisies par le client.
                  Elles sont la matière même de l'acte à rédiger — nouvelle
                  adresse, montant du capital, identité du gérant — et
                  n'apparaissaient nulle part dans cet écran. */}
              {selectedRequest.informations &&
                Object.keys(selectedRequest.informations).length > 0 && (
                  <div className="pt-4 border-t border-[#F5F6FA]">
                    <p className="text-sm text-[#273A7A]/80 mb-3">
                      Informations transmises par le client
                    </p>
                    <div className="space-y-3">
                      {getRequiredInfo(selectedRequest.type).map(info => {
                        const valeur = selectedRequest.informations?.[info.id];
                        if (!valeur) return null;
                        return (
                          <div key={`info-${info.id}`} className="border-l-2 border-[#D6A93A] pl-3">
                            <p className="text-xs text-[#273A7A]/80 mb-0.5">{info.label}</p>
                            <p className="text-[#1A2753] text-sm">
                              {info.type === 'date'
                                ? new Date(valeur).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })
                                : getLibelleChoix(info.id, valeur)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#D6A93A]" />
              Statistiques
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <span className="text-sm text-[#273A7A]/80">Documents client</span>
                <span className="text-[#1A2753]">{clientDocs.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <span className="text-sm text-[#273A7A]/80">Docs de modification</span>
                <span className="text-[#1A2753]">{adminDocs.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-[#273A7A]/80">Docs officiels</span>
                <span className="text-[#1A2753]">{officialDocs.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                <span className="text-sm text-[#273A7A]/80">À valider</span>
                <span className="text-[#1A2753]">
                  {requestDocs.filter(d => d.status === 'awaiting_validation').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-[#1A2753] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D6A93A]" />
                Documents ({filteredDocs.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDocFilter('all')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1.5 rounded-lg text-sm transition-all ${
                    docFilter === 'all'
                      ? 'bg-[#D6A93A] text-white'
                      : 'bg-[#F5F6FA] text-[#273A7A] hover:bg-[#E5E6EB]'
                  }`}
                >
                  Tous ({requestDocs.length})
                </button>
                <button
                  onClick={() => setDocFilter('client')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1.5 rounded-lg text-sm transition-all ${
                    docFilter === 'client'
                      ? 'bg-[#D6A93A] text-white'
                      : 'bg-[#F5F6FA] text-[#273A7A] hover:bg-[#E5E6EB]'
                  }`}
                >
                  Client ({clientDocs.length})
                </button>
                <button
                  onClick={() => setDocFilter('admin')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1.5 rounded-lg text-sm transition-all ${
                    docFilter === 'admin'
                      ? 'bg-[#D6A93A] text-white'
                      : 'bg-[#F5F6FA] text-[#273A7A] hover:bg-[#E5E6EB]'
                  }`}
                >
                  Modification ({adminDocs.length})
                </button>
                <button
                  onClick={() => setDocFilter('official')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1.5 rounded-lg text-sm transition-all ${
                    docFilter === 'official'
                      ? 'bg-[#D6A93A] text-white'
                      : 'bg-[#F5F6FA] text-[#273A7A] hover:bg-[#E5E6EB]'
                  }`}
                >
                  Officiels ({officialDocs.length})
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedDoc(null);
                setShowUploadModal(true);
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un document
            </button>
          </div>

          <div className="space-y-3">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-[#273A7A]/30 mx-auto mb-4" />
                <p className="text-[#273A7A]/80">Aucun document dans cette catégorie</p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const statusConfig = getDocumentStatusConfig(doc.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${statusConfig.border} ${statusConfig.bg}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${statusConfig.bg}`}>
                          <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-[#1A2753]">{doc.name}</h4>
                            {doc.isOfficial && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Officiel
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs rounded ${statusConfig.badgeBg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#273A7A]/80">
                            <span>v{doc.currentVersion}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{doc.pages} page(s)</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</span>
                            <span>•</span>
                            <span className={doc.uploadedBy === 'admin' ? 'text-purple-600' : 'text-blue-600'}>
                              {doc.uploadedBy === 'admin' ? 'Par admin' : 'Par client'}
                            </span>
                          </div>
                          {doc.reviews && doc.reviews.length > 0 && (
                            <div className="mt-2 p-2 bg-white rounded-lg">
                              <p className="text-xs text-[#273A7A]/80">
                                Dernier avis: {doc.reviews[doc.reviews.length - 1].comment}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button aria-label="Voir l’historique des versions"
                          onClick={() => setShowHistoryModal(true)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-9 h-9 bg-white hover:bg-[#F5F6FA] rounded-lg flex items-center justify-center transition-all"
                        >
                          <History className="w-4 h-4 text-[#1A2753]" />
                        </button>
                        <button aria-label="Prévisualiser le document" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-9 h-9 bg-white hover:bg-[#F5F6FA] rounded-lg flex items-center justify-center transition-all">
                          <Eye className="w-4 h-4 text-[#1A2753]" />
                        </button>
                        <button aria-label="Télécharger le document" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-9 h-9 bg-white hover:bg-[#F5F6FA] rounded-lg flex items-center justify-center transition-all">
                          <Download className="w-4 h-4 text-[#1A2753]" />
                        </button>
                        {doc.uploadedBy === 'client' && doc.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowReviewModal(true);
                            }}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1.5 bg-[#D6A93A] text-white rounded-lg hover:bg-[#b8902f] transition-all text-sm"
                          >
                            Examiner
                          </button>
                        )}
                        {doc.uploadedBy === 'admin' && !doc.isOfficial && (
                          <button
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowUploadModal(true);
                            }}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm"
                          >
                            Nouvelle version
                          </button>
                        )}
                        <button aria-label="Supprimer le document"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-9 h-9 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowUploadModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-lg w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#1A2753]">
                    {selectedDoc ? 'Nouvelle version du document' : 'Ajouter un document'}
                  </h3>
                  <button aria-label="Fermer"
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedDoc(null);
                      setUploadDocType('');
                      setUploadComment('');
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 bg-[#F5F6FA] hover:bg-[#E5E6EB] rounded-lg flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4 text-[#1A2753]" />
                  </button>
                </div>

                <div className="space-y-4">
                  {!selectedDoc && (
                    <div>
                      <label className="block text-sm text-[#1A2753] mb-2">Type de document</label>
                      <select
                        value={uploadDocType}
                        onChange={(e) => setUploadDocType(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                      >
                        <option value="">Sélectionner un type</option>
                        <optgroup label="Documents de modification (à valider)">
                          {MODIFICATION_ADMIN_DOCUMENTS.filter(d => d.category === 'process').map(doc => (
                            <option key={doc.code} value={doc.code}>{doc.label}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Documents officiels finaux">
                          {MODIFICATION_ADMIN_DOCUMENTS.filter(d => d.category === 'final').map(doc => (
                            <option key={doc.code} value={doc.code}>{doc.label}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-[#1A2753] mb-2">
                      Commentaire {selectedDoc ? '(optionnel)' : ''}
                    </label>
                    <textarea
                      value={uploadComment}
                      onChange={(e) => setUploadComment(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all resize-none"
                      rows={3}
                      placeholder="Ajoutez un commentaire..."
                    />
                  </div>

                  <div className="border-2 border-dashed border-[#D6A93A] rounded-xl p-8 text-center bg-[#FFF9F0]">
                    <Upload className="w-12 h-12 text-[#D6A93A] mx-auto mb-3" />
                    <p className="text-[#1A2753] mb-1">Glissez-déposez votre fichier ici</p>
                    <p className="text-sm text-[#273A7A]/80 mb-3">ou cliquez pour parcourir</p>
                    <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-[#D6A93A] text-white rounded-xl hover:bg-[#b8902f] transition-all">
                      Parcourir
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setSelectedDoc(null);
                        setUploadDocType('');
                        setUploadComment('');
                      }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#E5E6EB] transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={selectedDoc ? handleUploadNewVersion : handleAddNewDocument}
                      disabled={!selectedDoc && !uploadDocType}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-5 h-5" />
                      {selectedDoc ? 'Uploader nouvelle version' : 'Ajouter le document'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review Modal */}
        <AnimatePresence>
          {showReviewModal && selectedDoc && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowReviewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-lg w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#1A2753]">Examiner le document</h3>
                  <button aria-label="Fermer"
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedDoc(null);
                      setReviewAction(null);
                      setReviewComment('');
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 bg-[#F5F6FA] hover:bg-[#E5E6EB] rounded-lg flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4 text-[#1A2753]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#F5F6FA] rounded-xl">
                    <p className="text-sm text-[#273A7A]/80 mb-1">Document</p>
                    <p className="text-[#1A2753]">{selectedDoc.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-[#1A2753] mb-2">Commentaire</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all resize-none"
                      rows={4}
                      placeholder="Ajoutez votre commentaire..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setReviewAction('reject');
                        handleReviewDocument();
                      }}
                      disabled={!reviewComment.trim()}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                      Refuser
                    </button>
                    <button
                      onClick={() => {
                        setReviewAction('approve');
                        handleReviewDocument();
                      }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Valider
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chiffrage du devis de modification */}
        <AnimatePresence>
          {showQuoteModal && selectedRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowQuoteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-6 border-b border-[#F5F6FA] flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#D6A93A]" />
                  </div>
                  <div>
                    <h3 className="text-[#1A2753]">Devis de modification</h3>
                    <p className="text-sm text-[#273A7A]/80">{selectedRequest.modificationLabel}</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <label className="block">
                    <span className="text-sm text-[#1A2753]">Montant total (FCFA)</span>
                    <input
                      type="number"
                      value={quoteAmount}
                      onChange={e => setQuoteAmount(e.target.value)}
                      placeholder="85000"
                      className="mt-2 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D6A93A] focus:outline-none transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-[#1A2753]">Détail des prestations</span>
                    <textarea
                      value={quoteDetails}
                      onChange={e => setQuoteDetails(e.target.value)}
                      rows={3}
                      placeholder="Rédaction du PV, formalités APIX, publication légale…"
                      className="mt-2 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D6A93A] focus:outline-none transition-colors"
                    />
                  </label>
                </div>

                <div className="p-6 border-t border-[#F5F6FA] flex gap-3">
                  <button
                    onClick={() => setShowQuoteModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gray-100 text-[#1A2753] rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSendQuote}
                    disabled={!quoteAmount.trim()}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Envoyer au client
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Modal */}
        <AnimatePresence>
          {showMessageModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowMessageModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-lg w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#1A2753]">Envoyer un message au client</h3>
                  <button aria-label="Fermer"
                    onClick={() => setShowMessageModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 bg-[#F5F6FA] hover:bg-[#E5E6EB] rounded-lg flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4 text-[#1A2753]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#1A2753] mb-2">Message</label>
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all resize-none"
                      rows={5}
                      placeholder="Écrivez votre message ici..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowMessageModal(false);
                        setMessageText('');
                      }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#E5E6EB] transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      Envoyer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};
