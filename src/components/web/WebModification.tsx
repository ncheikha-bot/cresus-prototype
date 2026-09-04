import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  Bank,
  Building2,
  Buildings,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  FileText,
  House,
  Info,
  PenTool,
  Upload,
  User,
  X,
} from '../ui/icons';
import type { IconeCresus } from '../ui/icons';
import { useApp } from '../../context/AppContext';
import type { Modification as ModificationPartagee } from '../../types';
import { 
  type CompanyType, 
  getAvailableModifications, 
  getRequiredDocuments,
  getRequiredDocumentsWithBilanCheck,
  getRequiredInfo,
  CHOIX_PAR_CHAMP,
  getLibelleChoix,
  type ModificationType as ModificationTypeData,
  type RequiredDocument,
  type RequiredInfo
} from '../../data/modificationsData';
import { getCompanyStatusLabel, getCompanyStatusColor } from '../../domain/companyStatus';

interface WebModificationProps {
  onBack: () => void;
}

type CompanyOrigin = 'cresus' | 'externe' | null;
type RequestStatus = 'draft' | 'pending_admin' | 'waiting_quote' | 'quote_sent' | 'quote_validated' | 'quote_rejected' | 'documents_ready' | 'validated' | 'rejected' | 'signed' | 'completed';

interface ModificationRequest {
  id: string;
  type: string;
  companyOrigin: CompanyOrigin;
  companyId?: string;
  companyType?: CompanyType;
  uploadedDocs: string[];
  requiredDocs: RequiredDocument[];
  status: RequestStatus;
  quote?: {
    amount: number;
    details: string;
    validUntil: string;
    createdAt: string;
  };
  adminDocuments?: {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
  }[];
  clientComments?: string;
  signedDocs?: string[];
  finalDocuments?: {
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
  }[];
}

export const WebModification: React.FC<WebModificationProps> = ({ onBack }) => {
  const [step, setStep] = useState<'company' | 'type' | 'origin' | 'select-company' | 'info' | 'upload' | 'confirm' | 'tracking'>('company');
  /** Demande en cours de suivi, retrouvée dans le référentiel partagé. */
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [selectedCompanyType, setSelectedCompanyType] = useState<CompanyType | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [companyOrigin, setCompanyOrigin] = useState<CompanyOrigin>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationAction, setValidationAction] = useState<'validate' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [selectedDocToSign, setSelectedDocToSign] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [expandedModificationType, setExpandedModificationType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteAction, setQuoteAction] = useState<'validate' | 'reject' | null>(null);
  const [quoteComments, setQuoteComments] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { companies, modifications, addModification, updateModification, addNotification, currentUser } = useApp();

  const availableModifications = selectedCompanyType 
    ? getAvailableModifications(selectedCompanyType) 
    : [];

  const [demandeDemo, setDemandeDemo] = useState<ModificationRequest>({
    id: 'MOD-001',
    type: 'gerant',
    companyOrigin: 'cresus',
    companyId: companies[0]?.id,
    companyType: 'SARL',
    uploadedDocs: [],
    requiredDocs: getRequiredDocuments('SARL', 'gerant'),
    status: 'quote_sent',
    quote: {
      amount: 85000,
      details: 'Modification du gérant - Frais administratifs, rédaction PV, mise à jour au RCCM, publication au journal officiel',
      validUntil: '2025-12-15',
      createdAt: '2025-11-01',
    },
    adminDocuments: [
      { id: 'doc1', name: 'Procès-verbal AGE', type: 'PV', uploadedAt: '2025-11-01' },
      { id: 'doc2', name: 'Statuts modifiés', type: 'Statuts', uploadedAt: '2025-11-01' },
    ],
  });

  /**
   * Demande suivie.
   *
   * L'écran de suivi lisait un exemple figé — une nomination de gérant à
   * 85 000 FCFA — quelle que soit la demande réellement soumise : le client ne
   * pouvait pas suivre la sienne. La demande réelle l'emporte dès qu'elle
   * existe ; l'exemple ne sert plus qu'à peupler l'écran avant toute demande.
   */
  const demandeReelle = modifications.find(m => m.id === currentRequestId)
    ?? modifications.find(m => m.clientId === currentUser?.id);

  const mockRequest: ModificationRequest = demandeReelle
    ? {
        ...demandeDemo,
        id: demandeReelle.id,
        type: demandeReelle.type,
        companyId: demandeReelle.companyId,
        companyType: (demandeReelle.companyType as CompanyType) ?? demandeDemo.companyType,
        companyOrigin: demandeReelle.companyOrigin ?? demandeDemo.companyOrigin,
        status: demandeReelle.status as ModificationRequest['status'],
        uploadedDocs: demandeReelle.uploadedDocs ?? [],
        requiredDocs: getRequiredDocuments(
          (demandeReelle.companyType as CompanyType) ?? 'SARL',
          demandeReelle.type,
        ),
        quote: demandeReelle.quote
          ? {
              amount: demandeReelle.quote.amount,
              details: demandeReelle.quote.details ?? '',
              validUntil: demandeReelle.quote.validUntil ?? '',
              createdAt: demandeReelle.quote.sentAt ?? '',
            }
          : demandeDemo.quote,
      }
    : demandeDemo;

  /** Une demande réelle est écrite dans le référentiel ; l'exemple reste local. */
  const setMockRequest = (
    suivant: ModificationRequest | ((prec: ModificationRequest) => ModificationRequest),
  ) => {
    const valeur = typeof suivant === 'function' ? suivant(mockRequest) : suivant;
    if (demandeReelle) {
      updateModification(demandeReelle.id, {
        status: valeur.status as ModificationPartagee['status'],
      });
    } else {
      setDemandeDemo(valeur);
    }
  };


  const companyTypes: { id: CompanyType; label: string; icone: IconeCresus }[] = [
    { id: 'SARL', label: 'SARL', icone: Buildings },
    { id: 'SUARL', label: 'SUARL', icone: User },
    { id: 'SA_CA', label: 'SA (Conseil d\'Administration)', icone: Bank },
    { id: 'SA_AG', label: 'SA (Administrateur Général)', icone: Bank },
    { id: 'SAS', label: 'SAS', icone: Buildings },
    { id: 'SASU', label: 'SASU', icone: User },
    { id: 'SCI', label: 'SCI', icone: House },
  ];

  const handleCompanyTypeSelect = (type: CompanyType) => {
    setSelectedCompanyType(type);
    setTimeout(() => setStep('type'), 150);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    if (selectedCompanyType) {
      // Récupérer la date de création de l'entreprise sélectionnée
      const selectedCompanyData = companies.find(c => c.id === selectedCompany);
      const companyCreationDate = selectedCompanyData?.createdAt;
      
      // Utiliser la nouvelle fonction avec vérification du bilan DGID
      const docs = getRequiredDocumentsWithBilanCheck(selectedCompanyType, type, companyCreationDate);
      setRequiredDocs(docs);
    }
    setTimeout(() => setStep('origin'), 150);
  };

  const handleOriginSelect = (origin: CompanyOrigin) => {
    setCompanyOrigin(origin);
    if (origin === 'cresus' && companies.length > 0) {
      // Afficher la liste des sociétés pour sélection
      setTimeout(() => setStep('select-company'), 150);
    } else {
      setTimeout(() => setStep('info'), 150);
    }
  };

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
    // Charger les documents de la société sélectionnée
    const selectedCompanyData = companies.find(c => c.id === companyId);
    if (selectedCompanyData) {
      // Marquer automatiquement les documents existants comme uploadés
      const existingDocs = requiredDocs.map(doc => doc.id);
      setUploadedDocs(existingDocs);
      
      addNotification({
        userId: currentUser?.id || '',
        title: 'Documents chargés',
        message: `Les documents de ${selectedCompanyData.name} ont été chargés automatiquement.`,
        type: 'success',
        read: false,
      });
    }
    setTimeout(() => setStep('info'), 150);
  };

  const handleUploadDoc = (docId: string) => {
    setUploadingDoc(docId);
    setTimeout(() => {
      setUploadedDocs([...uploadedDocs, docId]);
      setUploadingDoc(null);
    }, 800);
  };

  const handleSubmitRequest = () => {
    // La demande rejoint le référentiel partagé : sans cela elle ne survivait
    // pas à la fermeture de l'onglet et n'atteignait jamais l'administration.
    const societe = companies.find(c => c.id === selectedCompany);
    const libelle = getSelectedTypeInfo()?.label ?? selectedType ?? 'Modification';
    const demande = addModification({
      companyId: selectedCompany || '',
      clientId: currentUser?.id,
      type: selectedType || '',
      description: societe ? `${libelle} — ${societe.name}` : libelle,
      status: 'waiting_quote',
      documents: [],
      companyType: selectedCompanyType || undefined,
      companyOrigin: companyOrigin || undefined,
      informations: formData,
      uploadedDocs,
    });
    setCurrentRequestId(demande.id);

    setStep('tracking');
    addNotification({
      userId: currentUser?.id || '',
      title: 'Demande soumise',
      message: 'Votre demande de modification a été envoyée. Un devis vous sera envoyé prochainement.',
      type: 'success',
      read: false,
    });
  };

  const getSelectedTypeInfo = (): ModificationTypeData | undefined => {
    return availableModifications.find(t => t.id === selectedType);
  };

  const getStatusBadge = (status: RequestStatus) => {
    const badges = {
      draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
      pending_admin: { label: 'En attente admin', color: 'bg-yellow-100 text-yellow-700' },
      waiting_quote: { label: 'En attente devis', color: 'bg-orange-100 text-orange-700' },
      quote_sent: { label: 'Devis envoyé', color: 'bg-blue-100 text-blue-700' },
      quote_validated: { label: 'Devis validé', color: 'bg-green-100 text-green-700' },
      quote_rejected: { label: 'Devis rejeté', color: 'bg-red-100 text-red-700' },
      documents_ready: { label: 'Documents prêts', color: 'bg-blue-100 text-blue-700' },
      validated: { label: 'Validé', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700' },
      signed: { label: 'Signé', color: 'bg-purple-100 text-purple-700' },
      completed: { label: 'Finalisé', color: 'bg-emerald-100 text-emerald-700' },
    };
    return badges[status];
  };

  // Signature functions
  const startDrawing = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = '#1A2753';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    if (selectedDocToSign) {
      const newSignedDocs = [...(mockRequest.signedDocs || []), selectedDocToSign];
      setMockRequest({ 
        ...mockRequest, 
        signedDocs: newSignedDocs,
        status: newSignedDocs.length === (mockRequest.adminDocuments?.length || 0) ? 'signed' : mockRequest.status
      });
      
      addNotification({
        userId: currentUser?.id || '',
        title: 'Document signé',
        message: `Document signé avec succès.`,
        type: 'success',
        read: false,
      });
      
      if (newSignedDocs.length === (mockRequest.adminDocuments?.length || 0)) {
        // Simuler l'upload des documents finaux par l'admin
        setTimeout(() => {
          setMockRequest(prev => ({
            ...prev!,
            status: 'completed',
            finalDocuments: [
              { id: 'final1', name: 'Statuts actualisés', type: 'Statuts', uploadedAt: '2025-11-03' },
              { id: 'final2', name: 'Extrait RC mis à jour', type: 'RC', uploadedAt: '2025-11-03' },
              { id: 'final3', name: 'NINEA mis à jour', type: 'NINEA', uploadedAt: '2025-11-03' },
            ]
          }));
          addNotification({
            userId: currentUser?.id || '',
            title: 'Modification finalisée',
            message: 'Vos nouveaux documents officiels sont disponibles.',
            type: 'success',
            read: false,
          });
        }, 2000);
      }
      
      setSelectedDocToSign(null);
      clearSignature();
    }
  };

  const handleValidateQuote = () => {
    setQuoteAction('validate');
    setShowQuoteModal(true);
  };

  const handleRejectQuote = () => {
    setQuoteAction('reject');
    setShowQuoteModal(true);
  };

  const submitQuoteAction = () => {
    if (quoteAction === 'validate') {
      setMockRequest({ ...mockRequest, status: 'quote_validated' });
      addNotification({
        userId: currentUser?.id || '',
        title: 'Devis validé',
        message: 'Le devis a été validé. L\'admin va procéder à la préparation des documents.',
        type: 'success',
        read: false,
      });
    } else {
      setMockRequest({ 
        ...mockRequest, 
        status: 'quote_rejected',
        clientComments: quoteComments 
      });
      addNotification({
        userId: currentUser?.id || '',
        title: 'Devis rejeté',
        message: 'Vos commentaires ont été envoyés à l\'administrateur.',
        type: 'info',
        read: false,
      });
    }
    setShowQuoteModal(false);
    setQuoteComments('');
  };

  const handleValidateDocuments = () => {
    setValidationAction('validate');
    setShowValidationModal(true);
  };

  const handleRejectDocuments = () => {
    setValidationAction('reject');
    setShowValidationModal(true);
  };

  const submitValidation = () => {
    if (validationAction === 'validate') {
      setMockRequest({ ...mockRequest, status: 'validated' });
      addNotification({
        userId: currentUser?.id || '',
        title: 'Documents validés',
        message: 'Vous pouvez maintenant procéder à la signature électronique.',
        type: 'success',
        read: false,
      });
    } else {
      setMockRequest({ 
        ...mockRequest, 
        status: 'rejected',
        clientComments: comments 
      });
      addNotification({
        userId: currentUser?.id || '',
        title: 'Documents rejetés',
        message: 'Vos commentaires ont été envoyés à l\'administrateur.',
        type: 'info',
        read: false,
      });
    }
    setShowValidationModal(false);
    setComments('');
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A2753] to-[#273A7A] py-8">
        <div className="max-w-6xl mx-auto px-8">
          <button
            onClick={() => {
              if (step !== 'company' && step !== 'tracking') {
                if (step === 'type') setStep('company');
                else if (step === 'origin') setStep('type');
                else if (step === 'select-company') setStep('origin');
                else if (step === 'info') {
                  if (companyOrigin === 'cresus') setStep('select-company');
                  else setStep('origin');
                }
                else if (step === 'upload') setStep('info');
                else if (step === 'confirm') {
                  if (companyOrigin === 'cresus') setStep('info');
                  else setStep('upload');
                }
              } else {
                onBack();
              }
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl flex items-center gap-2 hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
            <span className="text-white">Retour</span>
          </button>
          <h1 className="text-white text-2xl mb-2">Modification post-statutaire</h1>
          <p className="text-white/70">
            {step === 'company' && 'Sélectionnez la forme juridique de votre société'}
            {step === 'type' && 'Choisissez le type de modification'}
            {step === 'origin' && 'Origine de votre société'}
            {step === 'select-company' && 'Sélectionnez votre société'}
            {step === 'info' && 'Renseignez les informations requises'}
            {step === 'upload' && 'Documents justificatifs requis'}
            {step === 'confirm' && 'Vérifiez et confirmez votre demande'}
            {step === 'tracking' && 'Suivi de votre demande de modification'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
        <AnimatePresence mode="popLayout">
          {/* Step: Select company type */}
          {step === 'company' && (
            <motion.div
              key="company"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <h3 className="text-[#1A2753] mb-4">Sélectionnez la forme juridique</h3>
              
              <div className="space-y-2">
                {companyTypes.map((type, index) => (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCompanyTypeSelect(type.id)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-transparent hover:border-[#D6A93A]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#D6A93A]/10 rounded-lg flex items-center justify-center text-2xl">
                        <type.icone className="w-5 h-5 text-[#1A2753]" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-[#1A2753]">{type.label}</h3>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#273A7A]/40" />
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('tracking')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full mt-6 bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-xl p-4 hover:bg-[#D6A93A]/20 transition-all duration-300"
              >
                <p className="text-[#1A2753]">Voir mes demandes en cours</p>
              </motion.button>
            </motion.div>
          )}

          {/* Step: Select modification type */}
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Breadcrumb / Choix précédents */}
              <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-4 mb-6 border-l-4 border-[#D6A93A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl">
                    {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                  </div>
                  <div>
                    <p className="text-[#273A7A]/80 text-sm">Forme juridique</p>
                    <p className="text-[#1A2753]">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                  </div>
                </div>
              </div>

              <h3 className="text-[#1A2753] mb-4">Sélectionnez le type de modification</h3>

              <div className="space-y-3">
                {availableModifications.map((type, index) => {
                  const previewDocs = selectedCompanyType 
                    ? getRequiredDocuments(selectedCompanyType, type.id)
                    : [];
                  const previewInfo = getRequiredInfo(type.id);
                  const isExpanded = expandedModificationType === type.id;
                  
                  return (
                    <motion.div
                      key={type.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-transparent hover:border-blue-500 overflow-hidden"
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-xl shrink-0">
                          <type.icon className="w-5 h-5 text-[#1A2753]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[#1A2753] mb-1">{type.label}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedModificationType(isExpanded ? null : type.id);
                            }}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-[#D6A93A] text-sm flex items-center gap-1 hover:underline"
                          >
                            <Info className="w-3 h-3" />
                            {previewDocs.filter(d => d.required).length} documents • {previewInfo.filter(i => i.required).length} informations
                            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleTypeSelect(type.id)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 bg-[#D6A93A] text-white rounded-lg hover:bg-[#D6A93A]/90 transition-all flex items-center gap-2 shrink-0"
                        >
                          Choisir
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-100"
                          >
                            <div className="p-4 bg-[#F5F6FA]/50 space-y-4">
                              {/* Documents requis */}
                              <div>
                                <p className="text-[#273A7A]/80 text-sm mb-3 font-medium">
                                  Documents à fournir :
                                </p>
                                <div className="space-y-2">
                                  {previewDocs.map((doc, docIndex) => (
                                    <div key={`preview-doc-${type.id}-${docIndex}`} className="flex items-start gap-2 text-sm">
                                      <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${doc.required ? 'text-red-500' : 'text-blue-500'}`} />
                                      <div className="flex-1">
                                        <span className={doc.required ? 'text-[#1A2753]' : 'text-[#273A7A]/80'}>
                                          {doc.label}
                                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                                        </span>
                                        {doc.condition && (
                                          <p className="text-[#273A7A]/80 text-xs mt-0.5 italic">
                                            {doc.condition}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Informations requises */}
                              {previewInfo.length > 0 && (
                                <div className="pt-3 border-t border-gray-200">
                                  <p className="text-[#273A7A]/80 text-sm mb-3 font-medium">
                                    Informations à renseigner :
                                  </p>
                                  <div className="space-y-2">
                                    {previewInfo.map((info, infoIndex) => (
                                      <div key={`preview-info-${type.id}-${infoIndex}`} className="flex items-start gap-2 text-sm">
                                        <Edit3 className={`w-4 h-4 mt-0.5 shrink-0 ${info.required ? 'text-red-500' : 'text-blue-500'}`} />
                                        <div className="flex-1">
                                          <span className={info.required ? 'text-[#1A2753]' : 'text-[#273A7A]/80'}>
                                            {info.label}
                                            {info.required && <span className="text-red-500 ml-1">*</span>}
                                          </span>
                                          {info.condition && (
                                            <p className="text-[#273A7A]/80 text-xs mt-0.5 italic">
                                              {info.condition}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <p className="text-[#273A7A]/80 text-xs italic pt-2 border-t border-gray-200">
                                * = Obligatoire
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step: Select company origin */}
          {step === 'origin' && (
            <motion.div
              key="origin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Breadcrumb */}
              <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-4 mb-6 border-l-4 border-[#D6A93A]">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-base">
                      {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-xs">Forme juridique</p>
                      <p className="text-[#1A2753] text-sm">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-sm">
                      {(() => { const I = getSelectedTypeInfo()?.icon; return I ? <I className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-xs">Modification</p>
                      <p className="text-[#1A2753] text-sm">{getSelectedTypeInfo()?.label}</p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-[#1A2753] mb-4">Votre société est-elle déjà sur Crésus ?</h3>

              <div className="space-y-3">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOriginSelect('cresus')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-green-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-9 h-9 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[#1A2753] mb-1">Oui, société déjà sur Crésus</p>
                      <p className="text-[#273A7A]/80 text-sm">Vos documents sont déjà accessibles, processus simplifié</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#273A7A]/40" />
                  </div>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOriginSelect('externe')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-blue-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Upload className="w-9 h-9 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[#1A2753] mb-1">Non, société créée ailleurs</p>
                      <p className="text-[#273A7A]/80 text-sm">Vous devrez fournir les documents justificatifs</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#273A7A]/40" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step: Select company from Cresus */}
          {step === 'select-company' && (
            <motion.div
              key="select-company"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Breadcrumb */}
              <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-4 mb-6 border-l-4 border-[#D6A93A]">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-base">
                      {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-xs">Forme juridique</p>
                      <p className="text-[#1A2753] text-sm">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-sm">
                      {(() => { const I = getSelectedTypeInfo()?.icon; return I ? <I className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-xs">Modification</p>
                      <p className="text-[#1A2753] text-sm">{getSelectedTypeInfo()?.label}</p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-[#1A2753] mb-6">Sélectionnez la société à modifier</h3>

              {companies.length === 0 ? (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h4 className="text-[#1A2753] text-lg mb-2">Aucune société trouvée</h4>
                  <p className="text-[#273A7A]/80">Vous n'avez pas encore créé de société sur Crésus.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {companies.map((company, index) => (
                    <motion.button
                      key={company.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCompanySelect(company.id)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#D6A93A] text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-7 h-7 text-[#D6A93A]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#1A2753] font-semibold mb-2 truncate">{company.name}</p>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                              {company.legalForm}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCompanyStatusColor(company.status)}`}>
                              {getCompanyStatusLabel(company.status)}
                            </span>
                          </div>
                          {company.createdAt && (
                            <p className="text-[#273A7A]/80 text-xs">
                              Créée le {new Date(company.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#273A7A]/40 flex-shrink-0 mt-1" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Info box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mt-6"
              >
                <div className="flex gap-4">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#1A2753] font-semibold mb-2">Documents automatiques</p>
                    <p className="text-[#273A7A]/80 text-sm">
                      Les documents de votre société seront automatiquement chargés depuis votre dossier Crésus. 
                      Vous n'aurez pas besoin de les télécharger à nouveau.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step: Fill required information */}
          {step === 'info' && selectedType && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Breadcrumb */}
              <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-4 mb-6 border-l-4 border-[#D6A93A]">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-sm">
                      {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <p className="text-[#1A2753] text-sm">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-xs">
                      {(() => { const I = getSelectedTypeInfo()?.icon; return I ? <I className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <p className="text-[#1A2753] text-sm">{getSelectedTypeInfo()?.label}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-xl p-4 mb-6">
                <p className="text-[#1A2753]">
                  Veuillez remplir les informations suivantes pour traiter votre demande
                </p>
              </div>

              {(() => {
                const requiredInfo = getRequiredInfo(selectedType);
                const requiredFields = requiredInfo.filter(info => info.required);
                const filledRequired = requiredFields.filter(info => formData[info.id]?.trim()).length;
                
                return (
                  <>
                    <div className="space-y-4">
                      {requiredInfo.map((info, index) => (
                        <motion.div
                          key={info.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="bg-white rounded-xl p-5 shadow-sm"
                        >
                          <label className="block">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[#1A2753] font-medium">
                                {info.label}
                              </span>
                              {info.required && <span className="text-red-500">*</span>}
                            </div>
                            
                            {info.condition && (
                              <p className="text-[#273A7A]/80 text-sm mb-3 italic">
                                {info.condition}
                              </p>
                            )}

                            {info.type === 'textarea' ? (
                              <textarea
                                value={formData[info.id] || ''}
                                onChange={(e) => setFormData({ ...formData, [info.id]: e.target.value })}
                                placeholder={info.placeholder}
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#D6A93A] focus:outline-none transition-colors"
                              />
                            ) : info.type === 'select' ? (
                              <select
                                value={formData[info.id] || ''}
                                onChange={(e) => setFormData({ ...formData, [info.id]: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#D6A93A] focus:outline-none transition-colors"
                              >
<option value="">Sélectionnez...</option>
{(CHOIX_PAR_CHAMP[info.id] ?? []).map(choix => (
  <option key={choix.value} value={choix.value}>{choix.label}</option>
))}
</select>
                            ) : (
                              <input
                                type={info.type}
                                value={formData[info.id] || ''}
                                onChange={(e) => setFormData({ ...formData, [info.id]: e.target.value })}
                                placeholder={info.placeholder}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#D6A93A] focus:outline-none transition-colors"
                              />
                            )}
                          </label>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <p className="text-[#1A2753] text-sm">
                        Progression : {filledRequired} / {requiredFields.length} informations obligatoires renseignées
                      </p>
                    </div>

                    <motion.button
                      whileHover={filledRequired >= requiredFields.length ? { scale: 1.01 } : {}}
                      whileTap={filledRequired >= requiredFields.length ? { scale: 0.98 } : {}}
                      onClick={() => {
                        if (companyOrigin === 'externe') {
                          setStep('upload');
                        } else {
                          setStep('confirm');
                        }
                      }}
                      disabled={filledRequired < requiredFields.length}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full mt-6 px-8 py-4 rounded-xl transition-all duration-300 ${
                        filledRequired >= requiredFields.length
                          ? 'bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-white hover:shadow-lg'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Continuer
                    </motion.button>
                  </>
                );
              })()}
            </motion.div>
          )}

          {/* Step: Upload documents (external company) */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Breadcrumb */}
              <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-4 mb-6 border-l-4 border-[#D6A93A]">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-sm">
                      {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <p className="text-[#1A2753] text-sm">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-xs">
                      {(() => { const I = getSelectedTypeInfo()?.icon; return I ? <I className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <p className="text-[#1A2753] text-sm">{getSelectedTypeInfo()?.label}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-xl p-4 mb-6">
                <p className="text-[#1A2753]">
                  Veuillez fournir les documents suivants pour traiter votre demande
                </p>
              </div>

              <div className="space-y-3">
                {requiredDocs.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="bg-white rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          uploadedDocs.includes(doc.id) ? 'bg-green-100' : 'bg-[#D6A93A]/10'
                        }`}>
                          {uploadedDocs.includes(doc.id) ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <FileText className="w-6 h-6 text-[#D6A93A]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[#1A2753]">{doc.label}</p>
                            {doc.required && <span className="text-red-500 text-sm">*</span>}
                          </div>
                          {uploadedDocs.includes(doc.id) && (
                            <p className="text-green-600 text-sm flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Document téléversé
                            </p>
                          )}
                          {uploadingDoc === doc.id && (
                            <p className="text-blue-600 text-sm">Chargement...</p>
                          )}
                          {doc.condition && (
                            <p className="text-[#273A7A]/80 text-sm mt-1">{doc.condition}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUploadDoc(doc.id)}
                        disabled={uploadedDocs.includes(doc.id) || uploadingDoc === doc.id}
                        className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-5 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                          uploadedDocs.includes(doc.id)
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : uploadingDoc === doc.id
                            ? 'bg-blue-100 text-blue-700 cursor-wait'
                            : 'bg-[#D6A93A] text-white hover:bg-[#D6A93A]/90'
                        }`}
                      >
                        {uploadedDocs.includes(doc.id) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Téléversé
                          </>
                        ) : uploadingDoc === doc.id ? (
                          'Chargement...'
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Téléverser
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-[#1A2753] text-sm">
                  Progression : {uploadedDocs.length} / {requiredDocs.filter(d => d.required).length} documents obligatoires
                </p>
              </div>

              <motion.button
                whileHover={uploadedDocs.length >= requiredDocs.filter(d => d.required).length ? { scale: 1.01 } : {}}
                whileTap={uploadedDocs.length >= requiredDocs.filter(d => d.required).length ? { scale: 0.98 } : {}}
                onClick={() => setStep('confirm')}
                disabled={uploadedDocs.length < requiredDocs.filter(d => d.required).length}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full mt-6 px-8 py-4 rounded-xl transition-all duration-300 ${
                  uploadedDocs.length >= requiredDocs.filter(d => d.required).length
                    ? 'bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continuer
              </motion.button>
            </motion.div>
          )}

          {/* Step: Confirm request */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-[#1A2753] text-xl mb-6">Récapitulatif de votre demande</h3>

                <div className="space-y-4 mb-8">
                  {/* Type de société */}
                  <div className="flex items-center justify-between p-4 bg-[#F5F6FA] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#D6A93A]/10 rounded-lg flex items-center justify-center text-lg">
                        {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                      </div>
                      <div>
                        <p className="text-[#273A7A]/80 text-sm">Forme juridique</p>
                        <p className="text-[#1A2753]">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                      </div>
                    </div>
                  </div>

                  {/* Type de modification */}
                  <div className="flex items-center justify-between p-4 bg-[#F5F6FA] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                        {(() => { const I = getSelectedTypeInfo()?.icon; return I ? <I className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                      </div>
                      <div>
                        <p className="text-[#273A7A]/80 text-sm">Type de modification</p>
                        <p className="text-[#1A2753]">{getSelectedTypeInfo()?.label}</p>
                      </div>
                    </div>
                  </div>

                  {/* Origine */}
                  <div className="flex items-center justify-between p-4 bg-[#F5F6FA] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        companyOrigin === 'cresus' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {companyOrigin === 'cresus' ? (
                          <Building2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Upload className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-[#273A7A]/80 text-sm">Origine de la société</p>
                        <p className="text-[#1A2753]">
                          {companyOrigin === 'cresus' ? 'Société sur Crésus' : 'Société externe'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Société sélectionnée (si Crésus) */}
                  {companyOrigin === 'cresus' && selectedCompany && (
                    <>
                      <div className="flex items-center justify-between p-4 bg-[#F5F6FA] rounded-xl">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-[#D6A93A]/10 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-[#D6A93A]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[#273A7A]/80 text-sm">Société concernée</p>
                            <p className="text-[#1A2753] font-medium">{companies.find(c => c.id === selectedCompany)?.name}</p>
                            <div className="mt-1">
                              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                                Documents chargés automatiquement
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#F5F6FA] rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-[#273A7A]/80 text-sm">Documents du dossier</p>
                            <p className="text-[#1A2753]">{uploadedDocs.length} document(s) chargé(s)</p>
                            <p className="text-[#273A7A]/80 text-xs mt-1">Depuis le dossier Crésus</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex gap-3">
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[#1A2753] text-sm font-medium mb-1">Documents déjà disponibles</p>
                            <p className="text-[#273A7A]/80 text-xs">
                              Les documents officiels de votre société ({companies.find(c => c.id === selectedCompany)?.name}) 
                              seront automatiquement utilisés pour cette modification. Pas besoin de les télécharger à nouveau.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Documents uploadés (si externe) */}
                  {companyOrigin === 'externe' && uploadedDocs.length > 0 && (
                    <div className="p-4 bg-[#F5F6FA] rounded-xl">
                      <p className="text-[#273A7A]/80 text-sm mb-3">Documents fournis</p>
                      <div className="space-y-2">
                        {requiredDocs.filter(doc => uploadedDocs.includes(doc.id)).map((doc) => (
                          <div key={`confirm-uploaded-${doc.id}`} className="flex items-center gap-2 text-[#1A2753]">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{doc.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Informations saisies */}
                  {selectedType && Object.keys(formData).length > 0 && (
                    <div className="p-4 bg-[#F5F6FA] rounded-xl">
                      <p className="text-[#273A7A]/80 text-sm mb-3">Informations renseignées</p>
                      <div className="space-y-3">
                        {getRequiredInfo(selectedType).map((info) => {
                          const value = formData[info.id];
                          if (!value) return null;
                          
                          return (
                            <div key={`confirm-info-${info.id}`} className="border-l-2 border-[#D6A93A] pl-3">
                              <p className="text-[#273A7A]/80 text-xs mb-1">{info.label}</p>
                              <p className="text-[#1A2753] text-sm">
                                {info.type === 'date' && value 
                                  ? new Date(value).toLocaleDateString('fr-FR', { 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })
                                  : getLibelleChoix(info.id, value)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-xl p-4 mb-6">
                  <p className="text-[#1A2753] text-sm">
                    Après soumission, notre équipe examinera votre demande et préparera les documents nécessaires. 
                    Vous recevrez une notification dès qu'ils seront prêts.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      if (companyOrigin === 'cresus') {
                        setStep('info');
                      } else {
                        setStep('upload');
                      }
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-3 bg-[#F5F6FA] text-[#273A7A] rounded-xl hover:bg-[#273A7A]/10 transition-all duration-300"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-3 bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    Soumettre la demande
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'tracking' && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                {/* Header demande */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-[#F5F6FA]">
                  <div>
                    <p className="text-[#273A7A]/80 text-sm mb-1">Demande #{mockRequest.id}</p>
                    <h2 className="text-[#1A2753] text-2xl">
                      {mockRequest.companyType && getAvailableModifications(mockRequest.companyType).find(t => t.id === mockRequest.type)?.label}
                    </h2>
                  </div>
                  <span className={`px-6 py-3 rounded-xl ${getStatusBadge(mockRequest.status).color}`}>
                    {getStatusBadge(mockRequest.status).label}
                  </span>
                </div>

                {/* État: En attente admin */}
                {mockRequest.status === 'pending_admin' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 flex items-start gap-4">
                      <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-[#1A2753] mb-2">Demande en cours de traitement</p>
                        <p className="text-[#273A7A]/80 text-sm">
                          Notre équipe examine votre demande et prépare les documents nécessaires. 
                          Vous recevrez une notification dès que les documents seront prêts.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-6 bg-[#F5F6FA] rounded-xl">
                      <p className="text-[#1A2753] mb-3">Documents fournis :</p>
                      <div className="space-y-2">
                        {mockRequest.requiredDocs.filter(doc => mockRequest.uploadedDocs.includes(doc.id)).map((doc) => (
                          <div key={`tracking-pending-${doc.id}`} className="flex items-center gap-2 text-[#273A7A]">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{doc.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* État: En attente devis */}
                {mockRequest.status === 'waiting_quote' && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-[#1A2753] mb-2">En attente du devis</p>
                      <p className="text-[#273A7A]/80 text-sm">
                        Notre équipe examine votre demande et établit un devis personnalisé pour votre modification. 
                        Vous recevrez une notification dès que le devis sera disponible.
                      </p>
                    </div>
                  </div>
                )}

                {/* État: Devis envoyé - Validation client */}
                {mockRequest.status === 'quote_sent' && mockRequest.quote && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#D6A93A]/10 to-[#273A7A]/10 rounded-2xl p-6 border-2 border-[#D6A93A]/30">
                      <div className="flex items-start gap-4">
                        <Info className="w-6 h-6 text-[#D6A93A] flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-[#1A2753] mb-2">
                            <strong>Devis établi pour votre modification</strong>
                          </p>
                          <p className="text-[#273A7A]/80 text-sm">
                            L'administrateur a établi un devis détaillé pour votre demande de modification. 
                            Veuillez le consulter et le valider pour continuer le processus.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-[#F5F6FA] rounded-2xl p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-[#F5F6FA]">
                        <h3 className="text-[#1A2753] text-xl">Devis de modification</h3>
                        <div className="text-right">
                          <p className="text-sm text-[#273A7A]/80">Montant total</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl text-[#1A2753] font-bold">
                              {mockRequest.quote.amount.toLocaleString('fr-FR')}
                            </span>
                            <span className="text-[#273A7A]/80">FCFA</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-sm text-[#273A7A]/80 mb-3">Détails du devis :</p>
                        <div className="bg-[#F5F6FA] rounded-xl p-5">
                          <p className="text-[#1A2753]">{mockRequest.quote.details}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-[#273A7A]/80 mb-6">
                        <span>Créé le : {new Date(mockRequest.quote.createdAt).toLocaleDateString('fr-FR')}</span>
                        {mockRequest.quote.validUntil && (
                          <span>
                            Valide jusqu'au :{' '}
                            {new Date(mockRequest.quote.validUntil).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={handleRejectQuote}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-4 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all duration-300 flex items-center justify-center gap-2 border-2 border-red-200"
                        >
                          <X className="w-5 h-5" />
                          Rejeter le devis
                        </button>
                        <button
                          onClick={handleValidateQuote}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-4 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Valider le devis
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* État: Devis validé */}
                {mockRequest.status === 'quote_validated' && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-[#1A2753] mb-2">Devis validé avec succès</p>
                      <p className="text-[#273A7A]/80 text-sm">
                        Votre devis a été validé. Notre équipe va maintenant procéder à la préparation des documents 
                        nécessaires pour votre modification. Vous recevrez une notification dès qu'ils seront prêts.
                      </p>
                    </div>
                  </div>
                )}

                {/* État: Devis rejeté */}
                {mockRequest.status === 'quote_rejected' && (
                  <div className="space-y-4">
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-4">
                      <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-[#1A2753] mb-2">Devis rejeté</p>
                        <p className="text-[#273A7A]/80 text-sm">
                          Vous avez rejeté le devis. L'administrateur a été notifié et pourra vous proposer 
                          un nouveau devis adapté à vos besoins.
                        </p>
                      </div>
                    </div>
                    
                    {mockRequest.clientComments && (
                      <div className="bg-white border-2 border-[#F5F6FA] rounded-xl p-6">
                        <p className="text-sm text-[#273A7A]/80 mb-3">Vos commentaires :</p>
                        <div className="bg-[#F5F6FA] rounded-xl p-4">
                          <p className="text-[#1A2753]">{mockRequest.clientComments}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* État: Documents prêts - Validation client */}
                {mockRequest.status === 'documents_ready' && mockRequest.adminDocuments && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 flex items-start gap-4">
                      <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-[#1A2753] mb-2">Documents prêts pour validation</p>
                        <p className="text-[#273A7A]/80 text-sm">
                          Veuillez consulter les documents préparés par notre équipe et les valider ou demander des corrections.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {mockRequest.adminDocuments.map((doc) => (
                        <div key={`admin-doc-ready-${doc.id}`} className="flex items-center justify-between p-5 bg-[#F5F6FA] rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-[#1A2753]">{doc.name}</p>
                              <p className="text-[#273A7A]/80 text-sm">{doc.type} • {doc.uploadedAt}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 bg-[#273A7A] text-white rounded-lg hover:bg-[#1A2753] transition-all duration-300 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Consulter
                            </button>
                            <button aria-label="Télécharger le document" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-2 bg-[#D6A93A]/10 text-[#D6A93A] rounded-lg hover:bg-[#D6A93A]/20 transition-all duration-300">
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={handleRejectDocuments}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-4 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all duration-300 flex items-center justify-center gap-2 border-2 border-red-200"
                      >
                        <X className="w-5 h-5" />
                        Demander des corrections
                      </button>
                      <button 
                        onClick={handleValidateDocuments}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Valider les documents
                      </button>
                    </div>
                  </div>
                )}

                {/* État: Rejeté - En attente de corrections */}
                {mockRequest.status === 'rejected' && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 flex items-start gap-4">
                      <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-[#1A2753] mb-2">Documents en cours de correction</p>
                        <p className="text-[#273A7A]/80 text-sm">
                          Notre équipe prend en compte vos commentaires et prépare une nouvelle version des documents.
                        </p>
                      </div>
                    </div>

                    {mockRequest.clientComments && (
                      <div className="p-6 bg-[#F5F6FA] rounded-xl">
                        <p className="text-[#1A2753] mb-2 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-[#D6A93A]" />
                          Vos commentaires :
                        </p>
                        <p className="text-[#273A7A] text-sm italic bg-white p-4 rounded-lg border-l-4 border-[#D6A93A]">
                          "{mockRequest.clientComments}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* État: Validé - Prêt pour signature */}
                {mockRequest.status === 'validated' && mockRequest.adminDocuments && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-[#1A2753] mb-2">Documents validés - Signature requise</p>
                        <p className="text-[#273A7A]/80 text-sm">
                          Vous avez validé les documents. Veuillez maintenant les signer électroniquement pour finaliser la démarche.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {mockRequest.adminDocuments.map((doc) => (
                        <div key={`sign-doc-${doc.id}`} className="flex items-center justify-between p-5 bg-[#F5F6FA] rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                              <PenTool className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-[#1A2753]">{doc.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {mockRequest.signedDocs?.includes(doc.id) ? (
                                  <span className="text-green-600 text-sm flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Signé
                                  </span>
                                ) : (
                                  <span className="text-orange-600 text-sm">En attente de signature</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {!mockRequest.signedDocs?.includes(doc.id) && (
                            <button 
                              onClick={() => setSelectedDocToSign(doc.id)}
                              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                            >
                              <PenTool className="w-4 h-4" />
                              Signer
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-xl p-4 mt-4">
                      <p className="text-[#1A2753] text-sm">
                        Tous les documents doivent être signés pour passer à l'étape suivante
                      </p>
                    </div>
                  </div>
                )}

                {/* État: Signé - En attente documents finaux */}
                {mockRequest.status === 'signed' && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-[#1A2753] mb-2">Documents signés avec succès</p>
                        <p className="text-[#273A7A]/80 text-sm">
                          Tous les documents ont été signés. Notre équipe prépare les documents officiels mis à jour 
                          (Extrait RC, NINEA, etc.). Vous recevrez une notification dès qu'ils seront disponibles.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <FileText className="w-8 h-8 text-purple-600" />
                        </motion.div>
                        <p className="text-[#273A7A]">Préparation des documents officiels en cours...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* État: Complété - Documents finaux disponibles */}
                {mockRequest.status === 'completed' && mockRequest.finalDocuments && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6 flex items-start gap-4">
                      <CheckCircle2 className="w-7 h-7 flex-shrink-0 mt-1" />
                      <div>
                        <p className="mb-2 text-lg">Modification finalisée avec succès !</p>
                        <p className="text-white/90 text-sm">
                          Tous vos documents officiels mis à jour sont maintenant disponibles au téléchargement.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[#1A2753] mb-4">Vos nouveaux documents officiels</h3>
                      <div className="space-y-3">
                        {mockRequest.finalDocuments.map((doc) => (
                          <div key={`final-doc-${doc.id}`} className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-[#1A2753]">{doc.name}</p>
                                <p className="text-[#273A7A]/80 text-sm">{doc.type} • Mis à jour le {doc.uploadedAt}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Voir
                              </button>
                              <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 bg-[#D6A93A] text-white rounded-lg hover:bg-[#D6A93A]/90 transition-all duration-300 flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Télécharger
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={onBack}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full mt-6 px-6 py-4 bg-[#1A2753] text-white rounded-xl hover:bg-[#273A7A] transition-all duration-300"
                    >
                      Retour au tableau de bord
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de signature */}
        <AnimatePresence>
            {selectedDocToSign && (
              <motion.div
                key="signature-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedDocToSign(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[#1A2753] text-xl">Signature électronique</h3>
                    <button aria-label="Fermer"
                      onClick={() => setSelectedDocToSign(null)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-10 h-10 bg-[#F5F6FA] rounded-lg flex items-center justify-center hover:bg-[#273A7A]/10 transition-all"
                    >
                      <X className="w-5 h-5 text-[#273A7A]" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="text-[#273A7A] mb-4">
                      Signez dans le cadre ci-dessous pour valider le document.
                    </p>
                    <div className="bg-[#F5F6FA] rounded-xl p-4 border-2 border-[#D6A93A]/30">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        className="w-full border-2 border-dashed border-[#273A7A]/20 rounded-lg bg-white cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={clearSignature}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-3 bg-[#F5F6FA] text-[#273A7A] rounded-xl hover:bg-[#273A7A]/10 transition-all duration-300"
                    >
                      Effacer
                    </button>
                    <button
                      onClick={saveSignature}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-3 bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      Valider la signature
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal de validation/rejet */}
          <AnimatePresence>
            {showValidationModal && (
              <motion.div
                key="validation-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowValidationModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white rounded-2xl p-8 max-w-lg w-full"
                >
                  <h3 className="text-[#1A2753] text-xl mb-4">
                    {validationAction === 'validate' ? 'Valider les documents' : 'Demander des corrections'}
                  </h3>
                  <p className="text-[#273A7A] mb-6">
                    {validationAction === 'validate' 
                      ? 'Confirmez que vous avez consulté tous les documents et qu\'ils sont conformes à votre demande.'
                      : 'Décrivez les corrections à apporter aux documents.'}
                  </p>

                  {validationAction === 'reject' && (
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Précisez les corrections nécessaires..."
                      className="w-full p-4 border-2 border-[#273A7A]/20 rounded-xl mb-6 min-h-[120px] focus:outline-none focus:border-[#D6A93A] transition-colors"
                    />
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowValidationModal(false)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-3 bg-[#F5F6FA] text-[#273A7A] rounded-xl hover:bg-[#273A7A]/10 transition-all duration-300"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={submitValidation}
                      disabled={validationAction === 'reject' && !comments.trim()}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-3 text-white rounded-xl transition-all duration-300 ${
                        validationAction === 'validate'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg'
                          : comments.trim()
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Confirmer
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        {/* Modal de validation/rejet du devis */}
        <AnimatePresence>
          {showQuoteModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
              onClick={() => setShowQuoteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#1A2753] text-2xl">
                    {quoteAction === 'validate' ? 'Valider le devis' : 'Rejeter le devis'}
                  </h3>
                  <button aria-label="Fermer"
                    onClick={() => setShowQuoteModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-10 h-10 bg-[#F5F6FA] rounded-full flex items-center justify-center hover:bg-[#F5F6FA]/80 transition-all duration-300"
                  >
                    <X className="w-5 h-5 text-[#1A2753]" />
                  </button>
                </div>

                {quoteAction === 'reject' && (
                  <div className="mb-6">
                    <label className="block text-[#1A2753] mb-2">
                      Commentaires (optionnel)
                    </label>
                    <textarea
                      value={quoteComments}
                      onChange={(e) => setQuoteComments(e.target.value)}
                      placeholder="Expliquez pourquoi vous rejetez ce devis (par exemple, montant trop élevé, délais trop longs, etc.)..."
                      className="w-full h-32 px-4 py-3 bg-[#F5F6FA] rounded-xl outline-none focus:ring-2 focus:ring-[#D6A93A] transition-all duration-300 resize-none"
                    />
                  </div>
                )}

                {quoteAction === 'validate' && mockRequest.quote && (
                  <div className="mb-6">
                    <div className="bg-gradient-to-br from-[#D6A93A]/10 to-[#273A7A]/10 rounded-xl p-6 border-2 border-[#D6A93A]/20 mb-4">
                      <p className="text-[#1A2753] mb-3">
                        Vous êtes sur le point de valider un devis de <strong className="text-[#D6A93A]">{mockRequest.quote.amount.toLocaleString('fr-FR')} FCFA</strong>.
                      </p>
                      <p className="text-[#273A7A]/80 text-sm">
                        Une fois validé, notre équipe commencera la préparation des documents pour votre modification.
                      </p>
                    </div>
                    
                    <div className="bg-[#F5F6FA] rounded-xl p-5">
                      <p className="text-xs text-[#273A7A]/80 mb-3">Prochaines étapes après validation :</p>
                      <ul className="text-sm text-[#1A2753] space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>L'administrateur préparera tous les documents nécessaires</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Vous recevrez une notification quand les documents seront prêts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Vous pourrez consulter, signer et finaliser votre modification</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowQuoteModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-3 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#F5F6FA]/80 transition-all duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={submitQuoteAction}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      quoteAction === 'validate'
                        ? 'bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white hover:shadow-lg'
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {quoteAction === 'validate' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    Confirmer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
