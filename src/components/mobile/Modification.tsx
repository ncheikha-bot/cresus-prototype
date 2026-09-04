import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bank,
  Building2,
  Buildings,
  CheckCircle2,
  Download,
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
  type ModificationType as ModificationTypeData,
  type RequiredDocument,
  getRequiredInfo,
  CHOIX_PAR_CHAMP,
  getLibelleChoix,
} from '../../data/modificationsData';
import { nouvelId } from '../../lib/id';
import { getCompanyStatusLabel, getCompanyStatusColor } from '../../domain/companyStatus';

interface ModificationProps {
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

export const Modification: React.FC<ModificationProps> = ({ onBack }) => {
  const [step, setStep] = useState<'company' | 'type' | 'origin' | 'select-company' | 'info' | 'upload' | 'confirm' | 'tracking'>('company');
  /** Demande suivie, retrouvée dans le référentiel partagé. */
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  /**
   * Informations propres au type de modification.
   *
   * L'écran mobile passait de la sélection de la société directement à la
   * confirmation : un transfert de siège partait sans sa nouvelle adresse,
   * une augmentation de capital sans son montant. L'administration recevait
   * une demande vide.
   */
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedCompanyType, setSelectedCompanyType] = useState<CompanyType | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [companyOrigin, setCompanyOrigin] = useState<CompanyOrigin>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocument[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ModificationRequest | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationAction, setValidationAction] = useState<'validate' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [selectedDocToSign, setSelectedDocToSign] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteAction, setQuoteAction] = useState<'validate' | 'reject' | null>(null);
  const [quoteComments, setQuoteComments] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { companies, modifications, addModification, updateModification, addNotification, currentUser } = useApp();

  // Obtenir les modifications disponibles selon le type de société
  const availableModifications = selectedCompanyType 
    ? getAvailableModifications(selectedCompanyType) 
    : [];

  // Simuler une demande en cours (pour la démo)
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
      {
        id: 'doc1',
        name: 'Procès-verbal AGE',
        type: 'PV',
        uploadedAt: '2025-11-01',
      },
      {
        id: 'doc2',
        name: 'Statuts modifiés',
        type: 'Statuts',
        uploadedAt: '2025-11-01',
      },
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


  const handleCompanyTypeSelect = (type: CompanyType) => {
    setSelectedCompanyType(type);
    setTimeout(() => setStep('type'), 150);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    // Calculer les documents requis
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

    const newRequest: ModificationRequest = {
      id: demande.id,
      type: selectedType!,
      companyOrigin: companyOrigin!,
      companyId: companyOrigin === 'cresus' ? selectedCompany! : undefined,
      companyType: selectedCompanyType!,
      uploadedDocs: uploadedDocs,
      requiredDocs: requiredDocs,
      status: 'waiting_quote',
    };

    setCurrentRequest(newRequest);
    addNotification({
      userId: currentUser?.id || '',
      title: 'Demande soumise',
      message: 'Votre demande de modification a été envoyée. Un devis vous sera envoyé prochainement.',
      type: 'success',
      read: false,
    });
    setStep('tracking');
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

  // Signature functions
  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = '#1A2753';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

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
    }
    setSelectedDocToSign(null);
    clearSignature();
  };

  const getSelectedTypeInfo = (): ModificationTypeData | undefined => {
    return availableModifications.find(t => t.id === selectedType);
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

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2753] to-[#273A7A] pt-[max(3rem,env(safe-area-inset-top))] pb-6 px-5 rounded-b-3xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D6A93A]/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="relative">
          <button aria-label="Retour"
            onClick={() => {
              if (step !== 'company' && step !== 'tracking') {
                if (step === 'type') setStep('company');
                else if (step === 'origin') setStep('type');
                else if (step === 'select-company') setStep('origin');
                else if (step === 'info') setStep(companyOrigin === 'cresus' ? 'select-company' : 'origin');
                else if (step === 'upload') setStep('info');
                else if (step === 'confirm') {
                  if (companyOrigin === 'cresus') setStep('select-company');
                  else setStep('upload');
                }
              } else {
                onBack();
              }
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] mb-5 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-white text-lg mb-0.5">Modification post-statutaire</h2>
          <p className="text-white/70 text-xs">
            {step === 'company' && 'Type de société'}
            {step === 'type' && 'Choisissez le type de modification'}
            {step === 'origin' && 'Origine de votre société'}
            {step === 'select-company' && 'Sélectionnez votre société'}
            {step === 'info' && 'Informations requises'}
            {step === 'upload' && 'Documents justificatifs'}
            {step === 'confirm' && 'Confirmation de la demande'}
            {step === 'tracking' && 'Suivi de votre demande'}
          </p>
        </div>
      </div>

      <div className="px-5 mt-5">
        {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
        <AnimatePresence mode="popLayout">
          {/* Step: Select company type */}
          {step === 'company' && (
            <motion.div
              key="company"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-3"
            >
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[#1A2753] mb-4"
              >
                Quelle est la forme juridique de votre société ?
              </motion.p>
              
              <div className="space-y-2">
                {companyTypes.map((type, index) => (
                  <motion.button
                    key={type.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCompanyTypeSelect(type.id)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-transparent hover:border-[#D6A93A]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#D6A93A]/10 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                        <type.icone className="w-5 h-5 text-[#1A2753]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[#1A2753]">{type.label}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#273A7A]/40" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Option to view tracking if there's a mock request */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 pt-4 border-t-2 border-[#F5F6FA]"
              >
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentRequest(mockRequest);
                    setStep('tracking');
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-xl p-4 text-[#1A2753] hover:bg-[#D6A93A]/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg"></span>
                    <span>Voir mes demandes en cours</span>
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Step: Select modification type */}
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-3"
            >
              {/* Breadcrumb / Choix précédents */}
              <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-3 mb-4 border-l-4 border-[#D6A93A]"
              >
                <div className="flex items-center gap-2">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-base"
                  >
                    {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                  </motion.div>
                  <div>
                    <p className="text-[#273A7A]/80 text-xs">Forme juridique</p>
                    <p className="text-[#1A2753] text-sm">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                  </div>
                </div>
              </motion.div>

              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-[#1A2753] mb-3"
              >
                Choisissez le type de modification :
              </motion.p>

              <div className="space-y-2">
                {availableModifications.map((type, index) => (
                  <motion.button
                    key={type.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTypeSelect(type.id)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-transparent hover:border-blue-500"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                        <type.icon className="w-5 h-5 text-[#1A2753]" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[#1A2753] text-sm">{type.label}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#273A7A]/40" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step: Select company origin */}
          {step === 'origin' && (
            <motion.div
              key="origin"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-4"
            >
              {/* Breadcrumb / Choix précédents */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-3 mb-4 border-l-4 border-[#D6A93A]"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs">
                      {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-xs">Forme juridique</p>
                      <p className="text-[#1A2753] text-sm">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-1">
                    <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center text-xs">
                      {(() => { const I = getSelectedTypeInfo()?.icon; return I ? <I className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-xs">Modification</p>
                      <p className="text-[#1A2753] text-xs">{getSelectedTypeInfo()?.label}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[#1A2753] mb-3"
              >
                Votre société est-elle déjà sur Crésus ?
              </motion.p>

              <motion.button
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOriginSelect('cresus')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <div className="flex-1 text-left">
                    <p className="text-[#1A2753] mb-1">Société déjà sur Crésus</p>
                    <p className="text-[#273A7A]/80 text-sm">Vos documents sont déjà accessibles</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#273A7A]/40" />
                </div>
              </motion.button>

              <motion.button
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOriginSelect('externe')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center"
                  >
                    <Upload className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <div className="flex-1 text-left">
                    <p className="text-[#1A2753] mb-1">Société créée ailleurs</p>
                    <p className="text-[#273A7A]/80 text-sm">Vous devrez fournir les documents</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#273A7A]/40" />
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Step: Select company from Cresus */}
          {step === 'select-company' && (
            <motion.div
              key="select-company"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-4"
            >
              {/* Breadcrumb / Choix précédents */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-3 mb-4 border-l-4 border-[#D6A93A]"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs">
                      {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-xs">Forme juridique</p>
                      <p className="text-[#1A2753] text-sm">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-1">
                    <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center text-xs">
                      {(() => { const I = getSelectedTypeInfo()?.icon; return I ? <I className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-xs">Modification</p>
                      <p className="text-[#1A2753] text-xs">{getSelectedTypeInfo()?.label}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[#1A2753] mb-3"
              >
                Sélectionnez la société à modifier :
              </motion.p>

              {companies.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 text-center"
                >
                  <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                  <p className="text-[#1A2753] mb-2">Aucune société trouvée</p>
                  <p className="text-[#273A7A]/80 text-sm">Vous n'avez pas encore créé de société sur Crésus.</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {companies.map((company, index) => (
                    <motion.button
                      key={company.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCompanySelect(company.id)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-[#D6A93A]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-[#D6A93A]" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[#1A2753] font-medium mb-1">{company.name}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                              {company.legalForm}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getCompanyStatusColor(company.status)}`}>
                              {getCompanyStatusLabel(company.status)}
                            </span>
                            {company.createdAt && (
                              <span className="text-[#273A7A]/80 text-xs">
                                Créée le {new Date(company.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#273A7A]/40 flex-shrink-0" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Info box */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-4"
              >
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#1A2753] text-sm font-medium mb-1">Documents automatiques</p>
                    <p className="text-[#273A7A]/80 text-xs">
                      Les documents de votre société seront automatiquement chargés depuis votre dossier Crésus. 
                      Vous n'aurez pas besoin de les télécharger à nouveau.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step: Upload documents (external company) */}
          {/* Step: Informations propres au type de modification */}
          {step === 'info' && selectedType && (
            <motion.div
              key="info"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-4"
            >
              <div className="bg-[#D6A93A]/10 border border-[#D6A93A]/30 rounded-2xl p-4">
                <p className="text-[#1A2753] text-sm">
                  Ces informations serviront à rédiger les actes de votre modification.
                </p>
              </div>

              {(() => {
                const requiredInfo = getRequiredInfo(selectedType);
                const requiredFields = requiredInfo.filter(info => info.required);
                const filledRequired = requiredFields.filter(info => formData[info.id]?.trim()).length;
                const complet = filledRequired >= requiredFields.length;

                return (
                  <>
                    {requiredInfo.map((info, index) => (
                      <motion.div
                        key={info.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="bg-white rounded-2xl p-4 shadow-sm"
                      >
                        <label className="block">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-[#1A2753] text-sm">{info.label}</span>
                            {info.required && <span className="text-red-500">*</span>}
                          </div>

                          {info.condition && (
                            <p className="text-[#273A7A]/80 text-xs mb-2 italic">{info.condition}</p>
                          )}

                          {info.type === 'textarea' ? (
                            <textarea
                              value={formData[info.id] || ''}
                              onChange={(e) => setFormData({ ...formData, [info.id]: e.target.value })}
                              placeholder={info.placeholder}
                              rows={3}
                              className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#D6A93A] focus:outline-none transition-colors"
                            />
                          ) : info.type === 'select' ? (
                            <select
                              value={formData[info.id] || ''}
                              onChange={(e) => setFormData({ ...formData, [info.id]: e.target.value })}
                              className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#D6A93A] focus:outline-none transition-colors"
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
                              className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#D6A93A] focus:outline-none transition-colors"
                            />
                          )}
                        </label>
                      </motion.div>
                    ))}

                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                      <p className="text-[#1A2753] text-xs">
                        {filledRequired} / {requiredFields.length} information
                        {requiredFields.length > 1 ? 's' : ''} obligatoire
                        {requiredFields.length > 1 ? 's' : ''} renseignée
                        {requiredFields.length > 1 ? 's' : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => setStep(companyOrigin === 'externe' ? 'upload' : 'confirm')}
                      disabled={!complet}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full px-6 py-3.5 rounded-2xl transition-all duration-300 ${
                        complet
                          ? 'bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Continuer
                    </button>
                  </>
                );
              })()}
            </motion.div>
          )}

          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-4"
            >
              {/* Breadcrumb / Choix précédents */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-3 mb-4 border-l-4 border-[#D6A93A]"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs">
                      {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <p className="text-[#1A2753] text-sm">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                  </div>
                  <div className="flex items-center gap-2 pl-1">
                    <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center text-xs">
                      {(() => { const I = getSelectedTypeInfo()?.icon; return I ? <I className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <p className="text-[#1A2753] text-xs">{getSelectedTypeInfo()?.label}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-xl p-3 mb-4"
              >
                <p className="text-[#1A2753] text-sm">
                  Veuillez fournir les documents suivants pour traiter votre demande
                </p>
              </motion.div>

              {/* Documents obligatoires */}
              {requiredDocs.filter(doc => doc.required).map((doc, index) => (
                <motion.div 
                  key={`required-${doc.id}`} 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        animate={uploadingDoc === doc.id ? { rotate: 360 } : {}}
                        transition={{ duration: 0.8, ease: "linear" }}
                        className="w-10 h-10 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center"
                      >
                        <FileText className="w-5 h-5 text-[#D6A93A]" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[#1A2753] text-sm">{doc.label}</p>
                          <span className="text-red-500 text-xs">*</span>
                        </div>
                        <AnimatePresence>
                          {uploadedDocs.includes(doc.id) && (
                            <motion.p 
                              initial={{ y: -5, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="text-green-600 text-sm flex items-center gap-1 mt-1"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Téléversé
                            </motion.p>
                          )}
                        </AnimatePresence>
                        {uploadingDoc === doc.id && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-blue-600 text-sm mt-1"
                          >
                            Chargement...
                          </motion.p>
                        )}
                        {doc.condition && (
                          <p className="text-[#273A7A]/80 text-xs mt-1">
                            {doc.condition}
                          </p>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={!uploadedDocs.includes(doc.id) && !uploadingDoc ? { scale: 1.05 } : {}}
                      whileTap={!uploadedDocs.includes(doc.id) && !uploadingDoc ? { scale: 0.95 } : {}}
                      onClick={() => {
                        if (!uploadedDocs.includes(doc.id) && !uploadingDoc) {
                          handleUploadDoc(doc.id);
                        }
                      }}
                      disabled={uploadedDocs.includes(doc.id) || uploadingDoc === doc.id}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                        uploadedDocs.includes(doc.id)
                          ? 'bg-green-100 text-green-600 cursor-not-allowed'
                          : uploadingDoc === doc.id
                          ? 'bg-blue-100 text-blue-600 cursor-wait'
                          : 'bg-[#273A7A] text-white hover:bg-[#1A2753]'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {uploadedDocs.includes(doc.id) ? 'OK' : uploadingDoc === doc.id ? '...' : 'Choisir'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}

              {/* Documents conditionnels */}
              {requiredDocs.filter(doc => !doc.required).length > 0 && (
                <>
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#1A2753] text-sm mb-1">Documents conditionnels</p>
                        <p className="text-[#273A7A]/80 text-xs">
                          Ces documents peuvent être requis selon votre situation
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {requiredDocs.filter(doc => !doc.required).map((doc, index) => (
                    <motion.div 
                      key={`optional-${doc.id}`} 
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.35 + (0.05 * index) }}
                      className="bg-white rounded-2xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            animate={uploadingDoc === doc.id ? { rotate: 360 } : {}}
                            transition={{ duration: 0.8, ease: "linear" }}
                            className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"
                          >
                            <FileText className="w-5 h-5 text-blue-600" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="text-[#1A2753] text-sm">{doc.label}</p>
                            <AnimatePresence>
                              {uploadedDocs.includes(doc.id) && (
                                <motion.p 
                                  initial={{ y: -5, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  className="text-green-600 text-sm flex items-center gap-1 mt-1"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Téléversé
                                </motion.p>
                              )}
                            </AnimatePresence>
                            {uploadingDoc === doc.id && (
                              <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-blue-600 text-sm mt-1"
                              >
                                Chargement...
                              </motion.p>
                            )}
                            {doc.condition && (
                              <p className="text-[#273A7A]/80 text-xs mt-1">
                                {doc.condition}
                              </p>
                            )}
                          </div>
                        </div>
                        <motion.button
                          whileHover={!uploadedDocs.includes(doc.id) && !uploadingDoc ? { scale: 1.05 } : {}}
                          whileTap={!uploadedDocs.includes(doc.id) && !uploadingDoc ? { scale: 0.95 } : {}}
                          onClick={() => {
                            if (!uploadedDocs.includes(doc.id) && !uploadingDoc) {
                              handleUploadDoc(doc.id);
                            }
                          }}
                          disabled={uploadedDocs.includes(doc.id) || uploadingDoc === doc.id}
                          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                            uploadedDocs.includes(doc.id)
                              ? 'bg-green-100 text-green-600 cursor-not-allowed'
                              : uploadingDoc === doc.id
                              ? 'bg-blue-100 text-blue-600 cursor-wait'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <Upload className="w-4 h-4" />
                          {uploadedDocs.includes(doc.id) ? 'OK' : uploadingDoc === doc.id ? '...' : 'Choisir'}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={!requiredDocs.filter(doc => doc.required).some(doc => !uploadedDocs.includes(doc.id)) ? { scale: 1.02 } : {}}
                whileTap={!requiredDocs.filter(doc => doc.required).some(doc => !uploadedDocs.includes(doc.id)) ? { scale: 0.98 } : {}}
                onClick={() => setStep('confirm')}
                disabled={requiredDocs.filter(doc => doc.required).some(doc => !uploadedDocs.includes(doc.id)) || uploadingDoc !== null}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${
                  requiredDocs.filter(doc => doc.required).some(doc => !uploadedDocs.includes(doc.id)) || uploadingDoc !== null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white hover:shadow-lg'
                }`}
              >
                Suivant
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step: Confirm request */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-4"
            >
              {/* Breadcrumb / Choix précédents */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-3 mb-4 border-l-4 border-[#D6A93A]"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs">
                      {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <p className="text-[#1A2753] text-sm">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                  </div>
                  <div className="flex items-center gap-2 pl-1">
                    <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center text-xs">
                      {(() => { const I = getSelectedTypeInfo()?.icon; return I ? <I className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <p className="text-[#1A2753] text-xs">{getSelectedTypeInfo()?.label}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-[#1A2753] mb-4">Récapitulatif de la demande</h3>
                <div className="space-y-3">
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-start gap-3 pb-3 border-b border-[#F5F6FA]"
                  >
                    <div className="w-10 h-10 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                      {(() => { const T = companyTypes.find(t => t.id === selectedCompanyType)?.icone; return T ? <T className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-sm">Forme juridique</p>
                      <p className="text-[#1A2753]">{companyTypes.find(t => t.id === selectedCompanyType)?.label}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-3 pb-3 border-b border-[#F5F6FA]"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                      {(() => { const I = getSelectedTypeInfo()?.icon; return I ? <I className="w-5 h-5 text-[#1A2753]" /> : null; })()}
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-sm">Type de modification</p>
                      <p className="text-[#1A2753]">{getSelectedTypeInfo()?.label}</p>
                    </div>
                  </motion.div>

                  {companyOrigin === 'cresus' && selectedCompany && (
                    <>
                      <motion.div 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="flex items-start gap-3 pb-3 border-b border-[#F5F6FA]"
                      >
                        <Building2 className="w-10 h-10 bg-[#D6A93A]/10 rounded-xl p-2 text-[#D6A93A] flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-[#273A7A]/80 text-sm">Société concernée</p>
                          <p className="text-[#1A2753] font-medium">
                            {companies.find(c => c.id === selectedCompany)?.name}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                              Documents chargés automatiquement
                            </span>
                          </div>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-start gap-3 pb-3 border-b border-[#F5F6FA]"
                      >
                        <CheckCircle2 className="w-10 h-10 bg-green-50 rounded-xl p-2 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-[#273A7A]/80 text-sm">Documents du dossier</p>
                          <p className="text-[#1A2753]">
                            {uploadedDocs.length} document(s) chargé(s)
                          </p>
                          <p className="text-[#273A7A]/80 text-xs mt-1">
                            Depuis le dossier Crésus
                          </p>
                        </div>
                      </motion.div>
                    </>
                  )}

                  {companyOrigin === 'externe' && (
                    <motion.div 
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="flex items-start gap-3"
                    >
                      <FileText className="w-10 h-10 bg-[#D6A93A]/10 rounded-xl p-2 text-[#D6A93A] flex-shrink-0" />
                      <div>
                        <p className="text-[#273A7A]/80 text-sm">Documents fournis</p>
                        <p className="text-[#1A2753]">
                          {uploadedDocs.length} / {requiredDocs.filter(d => d.required).length} obligatoires
                        </p>
                        {uploadedDocs.length > requiredDocs.filter(d => d.required).length && (
                          <p className="text-[#273A7A]/80 text-xs mt-1">
                            + {uploadedDocs.length - requiredDocs.filter(d => d.required).length} conditionnel(s)
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {companyOrigin === 'cresus' && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4"
                >
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
                </motion.div>
              )}

              {/* Informations saisies : elles doivent être relues avant l'envoi. */}
              {selectedType && Object.keys(formData).length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <p className="text-[#273A7A]/80 text-xs mb-3">Informations renseignées</p>
                  <div className="space-y-2.5">
                    {getRequiredInfo(selectedType).map(info => {
                      const valeur = formData[info.id];
                      if (!valeur) return null;
                      return (
                        <div key={`recap-${info.id}`} className="border-l-2 border-[#D6A93A] pl-3">
                          <p className="text-[#273A7A]/80 text-[11px] mb-0.5">{info.label}</p>
                          <p className="text-[#1A2753] text-sm">
                            {info.type === 'date'
                              ? new Date(valeur).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : getLibelleChoix(info.id, valeur)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-2xl p-4"
              >
                <p className="text-[#1A2753] text-sm">
                  Crésus examinera votre demande et vous enverra un devis détaillé
                </p>
              </motion.div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitRequest}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Soumettre la demande
              </motion.button>
            </motion.div>
          )}

          {/* Step: Tracking */}
          {step === 'tracking' && (currentRequest || mockRequest) && (
            <motion.div
              key="tracking"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              {/* Request header */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[#273A7A]/80 text-sm mb-1">Demande #{mockRequest.id}</p>
                    <h3 className="text-[#1A2753]">
                      {mockRequest.companyType && getAvailableModifications(mockRequest.companyType).find(t => t.id === mockRequest.type)?.label}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(mockRequest.status).color}`}>
                    {getStatusBadge(mockRequest.status).label}
                  </span>
                </div>

                {mockRequest.companyId && (
                  <div className="flex items-center gap-2 text-[#273A7A]/80 text-sm">
                    <Building2 className="w-4 h-4" />
                    {companies.find(c => c.id === mockRequest.companyId)?.name}
                  </div>
                )}
              </div>

              {/* Pending admin */}
              {mockRequest.status === 'pending_admin' && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-[#1A2753] mb-2">Demande en attente</p>
                  <p className="text-[#273A7A]/80 text-sm">
                    L'administrateur examine votre demande et prépare les documents nécessaires.
                  </p>
                </div>
              )}

              {/* Waiting quote */}
              {mockRequest.status === 'waiting_quote' && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-[#1A2753] mb-2">En attente du devis</p>
                  <p className="text-[#273A7A]/80 text-sm">
                    L'administrateur examine votre demande et établit un devis personnalisé pour votre modification.
                  </p>
                </div>
              )}

              {/* Quote sent - Validation devis */}
              {mockRequest.status === 'quote_sent' && mockRequest.quote && (
                <>
                  <div className="bg-gradient-to-br from-[#D6A93A]/10 to-[#273A7A]/10 rounded-2xl p-6 border-2 border-[#D6A93A]/30">
                    <div className="flex items-start gap-3 mb-4">
                      <Info className="w-5 h-5 text-[#D6A93A] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#1A2753] mb-1">
                          <strong>Devis établi</strong>
                        </p>
                        <p className="text-[#273A7A]/80 text-sm">
                          L'administrateur a établi un devis pour votre demande de modification. Veuillez le consulter et le valider pour continuer.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <p className="text-[#273A7A]/80 text-sm mb-4">Devis de modification</p>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline justify-between mb-4">
                        <span className="text-[#273A7A]/80">Montant total</span>
                        <div className="text-right">
                          <span className="text-2xl text-[#1A2753] font-bold">
                            {mockRequest.quote.amount.toLocaleString('fr-FR')}
                          </span>
                          <span className="text-[#273A7A]/80 ml-1">FCFA</span>
                        </div>
                      </div>

                      <div className="bg-[#F5F6FA] rounded-xl p-4">
                        <p className="text-xs text-[#273A7A]/80 mb-2">Détails :</p>
                        <p className="text-sm text-[#1A2753]">{mockRequest.quote.details}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-[#273A7A]/80">
                        <span>Créé le : {new Date(mockRequest.quote.createdAt).toLocaleDateString('fr-FR')}</span>
                        {mockRequest.quote.validUntil && (
                          <span>
                            Valide jusqu'au :{' '}
                            {new Date(mockRequest.quote.validUntil).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleRejectQuote}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-4 bg-red-100 text-red-700 rounded-2xl hover:bg-red-200 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Rejeter
                      </button>
                      <button
                        onClick={handleValidateQuote}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-4 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Valider le devis
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Quote validated */}
              {mockRequest.status === 'quote_validated' && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-[#1A2753] mb-2">Devis validé</p>
                  <p className="text-[#273A7A]/80 text-sm">
                    Votre devis a été validé. L'administrateur va procéder à la préparation des documents nécessaires pour votre modification.
                  </p>
                </div>
              )}

              {/* Quote rejected */}
              {mockRequest.status === 'quote_rejected' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-[#1A2753] text-center mb-2">Devis rejeté</p>
                  <p className="text-[#273A7A]/80 text-sm text-center mb-4">
                    Vous avez rejeté le devis. L'administrateur a été notifié et pourra vous proposer un nouveau devis.
                  </p>
                  {mockRequest.clientComments && (
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-xs text-[#273A7A]/80 mb-2">Vos commentaires :</p>
                      <p className="text-sm text-[#1A2753]">{mockRequest.clientComments}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Documents ready for review */}
              {mockRequest.status === 'documents_ready' && mockRequest.adminDocuments && (
                <>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4">
                    <p className="text-[#1A2753] text-sm">
                      Les documents sont prêts. Veuillez les consulter et les valider ou les rejeter.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[#1A2753]">Documents préparés</p>
                    {mockRequest.adminDocuments.map((doc) => (
                      <div key={`admin-ready-${doc.id}`} className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[#1A2753]">{doc.name}</p>
                            <p className="text-[#273A7A]/80 text-sm">{doc.type}</p>
                          </div>
                          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-3 py-2 bg-[#F5F6FA] text-[#1A2753] rounded-lg hover:bg-[#273A7A] hover:text-white transition-all duration-300 flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            Voir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleRejectDocuments}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-4 bg-red-100 text-red-700 rounded-2xl hover:bg-red-200 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Rejeter
                    </button>
                    <button
                      onClick={handleValidateDocuments}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Valider
                    </button>
                  </div>
                </>
              )}

              {/* Rejected */}
              {mockRequest.status === 'rejected' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-[#1A2753]">Documents rejetés</p>
                      <p className="text-[#273A7A]/80 text-sm">En attente de corrections</p>
                    </div>
                  </div>
                  {mockRequest.clientComments && (
                    <div className="bg-white rounded-xl p-3 mt-3">
                      <p className="text-[#273A7A]/80 text-sm mb-1">Vos commentaires:</p>
                      <p className="text-[#1A2753] text-sm">{mockRequest.clientComments}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Validated - ready to sign */}
              {mockRequest.status === 'validated' && mockRequest.adminDocuments && (
                <>
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-4">
                    <p className="text-[#1A2753] text-sm">
                      Documents validés. Veuillez procéder à la signature électronique.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[#1A2753]">Documents à signer</p>
                    {mockRequest.adminDocuments.map((doc, index) => {
                      const isSigned = mockRequest.signedDocs?.includes(doc.id);
                      return (
                        <div key={`sign-${doc.id}`} className="bg-white rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSigned ? 'bg-green-100' : 'bg-purple-100'
                              }`}>
                                {isSigned ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <PenTool className="w-5 h-5 text-purple-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-[#1A2753]">{doc.name}</p>
                                <p className="text-[#273A7A]/80 text-sm">{doc.type}</p>
                              </div>
                            </div>
                            {!isSigned ? (
                              <button
                                onClick={() => setSelectedDocToSign(doc.id)}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 bg-[#273A7A] text-white rounded-xl hover:bg-[#1A2753] transition-all duration-300 flex items-center gap-2"
                              >
                                <PenTool className="w-4 h-4" />
                                Signer
                              </button>
                            ) : (
                              <span className="text-green-600 text-sm flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Signé
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Signed - waiting for final docs */}
              {mockRequest.status === 'signed' && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PenTool className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-[#1A2753] mb-2">Documents signés</p>
                  <p className="text-[#273A7A]/80 text-sm">
                    L'administrateur finalise votre dossier et prépare les documents officiels.
                  </p>
                </div>
              )}

              {/* Completed */}
              {mockRequest.status === 'completed' && mockRequest.finalDocuments && (
                <>
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center mb-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-[#1A2753] mb-2">Modification finalisée !</p>
                    <p className="text-[#273A7A]/80 text-sm">
                      Vos nouveaux documents officiels sont disponibles ci-dessous.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[#1A2753]">Documents officiels mis à jour</p>
                    {mockRequest.finalDocuments.map((doc) => (
                      <div key={`final-${doc.id}`} className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[#1A2753]">{doc.name}</p>
                            <p className="text-[#273A7A]/80 text-sm">{doc.uploadedAt}</p>
                          </div>
                          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-3 py-2 bg-[#D6A93A] text-[#1A2753] rounded-lg hover:bg-[#D6A93A]/80 transition-all duration-300 flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            Télécharger
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={onBack}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300"
                  >
                    Retour au tableau de bord
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation/Rejection Modal */}
      <AnimatePresence>
        {showValidationModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => setShowValidationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A2753]">
                  {validationAction === 'validate' ? 'Valider les documents' : 'Rejeter les documents'}
                </h3>
                <motion.button aria-label="Fermer"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowValidationModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-8 h-8 bg-[#F5F6FA] rounded-full flex items-center justify-center hover:bg-[#F5F6FA]/80 transition-all duration-300"
                >
                  <X className="w-5 h-5 text-[#1A2753]" />
                </motion.button>
              </div>

            {validationAction === 'reject' && (
              <div className="mb-4">
                <label className="block text-[#1A2753] mb-2">
                  Commentaires (obligatoire)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Expliquez pourquoi vous rejetez ces documents..."
                  className="w-full h-32 px-4 py-3 bg-[#F5F6FA] rounded-xl outline-none focus:ring-2 focus:ring-[#D6A93A] transition-all duration-300 resize-none"
                />
              </div>
            )}

            {validationAction === 'validate' && (
              <p className="text-[#273A7A]/80 text-sm mb-4">
                Confirmez-vous que vous avez bien lu et approuvé tous les documents préparés ?
              </p>
            )}

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowValidationModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-3 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#F5F6FA]/80 transition-all duration-300"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={!(validationAction === 'reject' && !comments.trim()) ? { scale: 1.02 } : {}}
                  whileTap={!(validationAction === 'reject' && !comments.trim()) ? { scale: 0.98 } : {}}
                  onClick={submitValidation}
                  disabled={validationAction === 'reject' && !comments.trim()}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-3 rounded-xl transition-all duration-300 ${
                    validationAction === 'reject' && !comments.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : validationAction === 'validate'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg'
                  }`}
                >
                  Confirmer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signature Modal */}
      <AnimatePresence>
        {selectedDocToSign && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedDocToSign(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A2753]">Signer le document</h3>
                <motion.button aria-label="Fermer"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDocToSign(null)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-8 h-8 bg-[#F5F6FA] rounded-full flex items-center justify-center hover:bg-[#F5F6FA]/80 transition-all duration-300"
                >
                  <X className="w-5 h-5 text-[#1A2753]" />
                </motion.button>
              </div>
            
            <p className="text-[#273A7A]/80 text-sm mb-4">
              {mockRequest.adminDocuments?.find(d => d.id === selectedDocToSign)?.name}
            </p>

            <div className="border-2 border-dashed border-[#D6A93A]/30 rounded-xl p-4 mb-4 bg-[#F5F6FA]">
              <p className="text-[#273A7A]/80 text-sm text-center mb-3">
                Dessinez votre signature ci-dessous
              </p>
              <canvas
                ref={canvasRef}
                width={300}
                height={150}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full bg-white rounded-lg border border-[#D6A93A]/20 touch-none"
              />
            </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearSignature}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-3 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#F5F6FA]/80 transition-all duration-300"
                >
                  Effacer
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveSignature}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Valider
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Validation/Rejection Modal */}
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
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A2753]">
                  {quoteAction === 'validate' ? 'Valider le devis' : 'Rejeter le devis'}
                </h3>
                <motion.button aria-label="Fermer"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowQuoteModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-8 h-8 bg-[#F5F6FA] rounded-full flex items-center justify-center hover:bg-[#F5F6FA]/80 transition-all duration-300"
                >
                  <X className="w-5 h-5 text-[#1A2753]" />
                </motion.button>
              </div>

              {quoteAction === 'reject' && (
                <div className="mb-4">
                  <label className="block text-[#1A2753] mb-2">
                    Commentaires (optionnel)
                  </label>
                  <textarea
                    value={quoteComments}
                    onChange={(e) => setQuoteComments(e.target.value)}
                    placeholder="Expliquez pourquoi vous rejetez ce devis..."
                    className="w-full h-32 px-4 py-3 bg-[#F5F6FA] rounded-xl outline-none focus:ring-2 focus:ring-[#D6A93A] transition-all duration-300 resize-none"
                  />
                </div>
              )}

              {quoteAction === 'validate' && (
                <div className="mb-4">
                  <p className="text-[#273A7A]/80 text-sm mb-3">
                    Confirmez-vous que vous acceptez le devis de <strong>{mockRequest.quote?.amount.toLocaleString('fr-FR')} FCFA</strong> pour cette modification ?
                  </p>
                  <div className="bg-[#F5F6FA] rounded-xl p-4">
                    <p className="text-xs text-[#273A7A]/80 mb-1">Prochaines étapes :</p>
                    <ul className="text-xs text-[#1A2753] space-y-1 ml-3">
                      <li>• Crésus préparera les documents nécessaires</li>
                      <li>• Vous recevrez une notification quand ils seront prêts</li>
                      <li>• Vous pourrez les consulter, signer et finaliser</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQuoteModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-3 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#F5F6FA]/80 transition-all duration-300"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submitQuoteAction}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-3 rounded-xl transition-all duration-300 ${
                    quoteAction === 'validate'
                      ? 'bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white hover:shadow-lg'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg'
                  }`}
                >
                  Confirmer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
