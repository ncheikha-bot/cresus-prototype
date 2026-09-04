import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Circle, Clock, FileText, Users, Upload, DollarSign, Landmark, AlertCircle, Eye, ChevronRight, FileCheck, AlertTriangle, XCircle, Calendar, Building } from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { buildSteps, getStepColor, type Step } from './company-steps/stepDefinitions';
import { StatutsUploadModal } from './company-steps/StatutsUploadModal';
import { AppointmentValidationModal } from './company-steps/AppointmentValidationModal';
import { OfficialDocsModal } from './company-steps/OfficialDocsModal';
import { QuoteFormModal } from './company-steps/QuoteFormModal';
import { DocumentPreviewModal, type AdminDocument } from './company-steps/DocumentPreviewModal';
import { DocumentsValidationModal } from './company-steps/DocumentsValidationModal';
import { CompanyDetailsModal } from './company-steps/CompanyDetailsModal';
import { HonorDeclarationPreview } from './HonorDeclarationPreview';
import { QuotePreview } from './QuotePreview';
import type { Company, DocumentReview, DocumentVersion } from '../../types';

interface AdminCompanyStepsProps {
  company: Company;
}

export const AdminCompanySteps: React.FC<AdminCompanyStepsProps> = ({ company }) => {
  const {
    addNotification,
    getCompanyProcess,
    updateCompanyProcess,
    updateCompanyStep,
    updateCompanyQuote,
    updateCompanyStatus,
  } = useApp();

  // Avancement du dossier : lu et écrit dans le contexte partagé, pour que le
  // client voie ce que l'admin fait. Seuls les états d'interface (ouverture de
  // modale, saisie en cours) restent locaux.
  const processus = getCompanyProcess(company.id);
  const {
    honorDeclarationSent,
    statutsSent,
    statutsVersion,
    statutsValidatedByClient,
    statutsRejectedByClient,
    clientRejectionReason,
    appointmentRequest,
    onlineSignatureCompleted,
    signedDocuments,
    officialDocs,
    companyFinalized,
  } = processus;

  /** Raccourci : applique un correctif à l'avancement de CETTE société. */
  const majProcessus = (patch: Partial<typeof processus>) =>
    updateCompanyProcess(company.id, patch);

  // États existants
  const [showHonorDeclaration, setShowHonorDeclaration] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    registrationFees: 75000,
    legalFees: 50000,
    publicationFees: 25000,
    stampDuty: 30000,
    adminFees: 20000,
    notes: '',
  });

  // **NOUVEAUX ÉTATS - Étape 3 : Validation documents**
  const [showDocumentsValidation, setShowDocumentsValidation] = useState(false);
  // Les decisions de validation vivent dans le contexte ; la liste affichee en
  // est la projection, pour que le client voie immediatement l'avis de l'admin.
  const documentsToValidate: AdminDocument[] = (company.documents || []).map(doc => {
    const decision = processus.documentDecisions[doc.id];
    return decision ? { ...doc, ...decision } : doc;
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDocForRejection, setSelectedDocForRejection] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<AdminDocument | null>(null);
  const [documentComment, setDocumentComment] = useState<{ [key: string]: string }>({});

  const [showStatutsUpload, setShowStatutsUpload] = useState(false);
  const [showAppointmentValidation, setShowAppointmentValidation] = useState(false);

  // **NOUVEAUX ÉTATS - Étape 1 : Dossier soumis**
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);

  // **Étape 7 : Documents officiels** (officialDocs et companyFinalized
  // viennent du contexte, voir plus haut)
  const [showOfficialDocsUpload, setShowOfficialDocsUpload] = useState(false);

  // Détecter si le devis a été envoyé
  const quoteSent = company.quote?.status === 'sent' || company.quote?.status === 'validated';

  // Détecter si le devis a été validé par le client
  const quoteValidated = company.quote?.status === 'validated';

  // Refus du client : c'est le seul état qui appelle une action de l'admin et
  // qui n'apparaissait nulle part dans cet écran.
  const quoteRejected = company.quote?.status === 'rejected';

  // Vérifier si tous les documents sont validés
  const allDocumentsValidated = documentsToValidate.every(doc => doc.status === 'validated');

  // Définition des étapes : construite par le module dédié, à partir de la
  // société et de son avancement partagé.
  const steps = buildSteps(company, {
    process: processus,
    allDocumentsValidated,
    hasDocuments: documentsToValidate.length > 0,
  });

  /**
   * Passage à l'étape suivante du workflow.
   *
   * Rien ne faisait avancer `currentStep` : le dossier restait indéfiniment à
   * « Dossier soumis », et l'administration ne pouvait donc jamais atteindre la
   * rédaction des statuts que le client attend.
   */
  const etapeCourante = company.currentStep || 1;
  const etapeSuivante = steps.find(s => s.number === etapeCourante + 1);

  /**
   * Ce que l'étape courante attend encore de l'administration.
   *
   * Chaque action vit sur son étape : dépasser « Devis d'immatriculation » sans
   * avoir envoyé le devis, ou « Validation statuts » sans avoir envoyé les
   * statuts, rendait l'action inatteignable et laissait le client attendre
   * quelque chose que plus personne ne pouvait produire. On ne quitte donc pas
   * une étape dont le travail n'est pas fait — et « Étape précédente » reste là
   * pour rattraper les dossiers déjà partis trop loin.
   */
  const travailEnAttente = (): string | null => {
    if (etapeCourante === 3 && !quoteSent) return "le devis n'a pas encore été envoyé";
    if (etapeCourante === 6) {
      if (company.useHonorDeclaration && !honorDeclarationSent) {
        return "la déclaration sur l'honneur n'a pas encore été envoyée";
      }
      if (!statutsSent) return "les statuts n'ont pas encore été envoyés";
    }
    return null;
  };

  const enAttente = travailEnAttente();
  const peutAvancer =
    Boolean(etapeSuivante) && etapeSuivante?.status !== 'blocked' && enAttente === null;

  const passerEtapeSuivante = () => {
    if (!peutAvancer) return;
    updateCompanyStep(company.id, etapeCourante + 1);
  };

  /**
   * Retour à l'étape précédente.
   *
   * Le parcours n'allait que dans un sens : une étape franchie par mégarde était
   * définitive, et les actions qui y vivent — envoyer les statuts, par exemple —
   * devenaient inaccessibles, laissant le client attendre indéfiniment.
   */
  const revenirEtapePrecedente = () => {
    if (etapeCourante <= 1) return;
    updateCompanyStep(company.id, etapeCourante - 1);
  };

  // **Handlers étape 3 : Validation documents**
  const handleValidateDocument = (docId: string) => {
    majProcessus({
      documentDecisions: { ...processus.documentDecisions, [docId]: { status: 'validated' } },
    });
    addNotification({
      userId: company.clientId,
      type: 'success',
      title: 'Document validé',
      message: 'Votre document a été vérifié et accepté.',
      read: false,
    });
  };

  const handleRejectDocument = () => {
    if (!selectedDocForRejection || !rejectionReason.trim()) {
      addNotification({
        userId: company.clientId,
        type: 'warning',
        title: 'Motif requis',
        message: 'Veuillez indiquer le motif du rejet',
        read: false,
      });
      return;
    }

    majProcessus({
      documentDecisions: {
        ...processus.documentDecisions,
        [selectedDocForRejection]: { status: 'rejected', rejectionReason },
      },
    });
    addNotification({
      userId: company.clientId,
      type: 'info',
      title: 'Document à corriger',
      message: `Votre document doit être redéposé : ${rejectionReason}`,
      read: false,
    });
    
    setSelectedDocForRejection(null);
    setRejectionReason('');
  };

  const totalFees =
    quoteForm.registrationFees +
    quoteForm.legalFees +
    quoteForm.publicationFees +
    quoteForm.stampDuty +
    quoteForm.adminFees;

  // **Handlers étape 4 : Devis**
  const handleSendHonorDeclaration = () => {
    // La déclaration rejoint le dossier partagé : le client la voit arriver
    // dans les documents à signer, là où elle n'existait que dans cet écran.
    majProcessus({ honorDeclarationSent: true });
    setShowHonorDeclaration(false);
    addNotification({
      userId: company.clientId,
      type: 'success',
      title: 'Déclaration reçue',
      message: `La déclaration sur l'honneur vous attend pour signature.`,
      read: false,
    });
  };

  const handleSendQuote = () => {
    // Le devis est porté par la fiche société : c'est ainsi que le client le
    // reçoit, au lieu de se le fabriquer lui-même dans son tunnel.
    updateCompanyQuote(company.id, {
      status: 'sent',
      registrationFees: quoteForm.registrationFees,
      legalFees: quoteForm.legalFees,
      publicationFees: quoteForm.publicationFees,
      stampDuty: quoteForm.stampDuty,
      adminFees: quoteForm.adminFees,
      total: totalFees,
      notes: quoteForm.notes,
      // Un renvoi solde le refus précédent : sans cela le motif resterait
      // affiché sur un devis qui vient d'être corrigé.
      rejectionReason: '',
      sentAt: new Date().toISOString(),
    });
    setShowQuote(false);
    setShowQuoteForm(false);
    addNotification({
      userId: company.clientId,
      type: 'success',
      title: 'Devis reçu',
      message: `Votre devis d'immatriculation est disponible. Consultez-le pour le valider.`,
      read: false,
    });
  };

  // **Handlers étape 6 : Statuts**
  const handleSendStatuts = () => {
    majProcessus({ statutsSent: true });
    setShowStatutsUpload(false);
    addNotification({
      userId: company.clientId,
      type: 'success',
      title: 'Statuts reçus',
      message: `Vos statuts (version ${statutsVersion}) sont prêts. Relisez-les pour les valider.`,
      read: false,
    });
  };

  const handleResendStatuts = () => {
    majProcessus({ statutsVersion: statutsVersion + 1 });
    majProcessus({ statutsRejectedByClient: false });
    majProcessus({ statutsSent: true });
    setShowStatutsUpload(false);
    addNotification({
      userId: company.clientId,
      type: 'success',
      title: 'Statuts corrigés',
      message: `Vos statuts (version ${statutsVersion + 1}) ont été corrigés. Relisez-les pour les valider.`,
      read: false,
    });
  };

  // Handler RV
  const handleConfirmAppointment = () => {
    if (appointmentRequest) {
      majProcessus({ appointmentRequest: { ...appointmentRequest, status: 'confirmed' } });
      setShowAppointmentValidation(false);
      addNotification({
        userId: company.clientId,
        type: 'success',
        title: 'Rendez-vous confirmé',
        message: 'Votre créneau est confirmé. Retrouvez-en le détail dans votre dossier.',
        read: false,
      });
    }
  };

  const handleRejectAppointment = () => {
    if (appointmentRequest) {
      majProcessus({ appointmentRequest: { ...appointmentRequest, status: 'rejected' } });
      setShowAppointmentValidation(false);
      addNotification({
        userId: company.clientId,
        type: 'info',
        title: 'Créneau indisponible',
        message: 'Le créneau demandé n\'est pas disponible. Merci d\'en choisir un autre.',
        read: false,
      });
    }
  };

  // **Handlers étape 7 : Finalisation**
  const handleFinalizeCompany = () => {
    majProcessus({ companyFinalized: true });
    // La fiche société portait encore « Signé » une fois le dossier clos : le
    // client lisait un dossier en cours là où son entreprise était immatriculée.
    updateCompanyStatus(company.id, 'completed');
    setShowOfficialDocsUpload(false);
    addNotification({
      userId: company.clientId,
      type: 'success',
      title: 'Société créée',
      message: 'Votre société est immatriculée. Vos documents officiels sont disponibles.',
      read: false,
    });
  };

  const handleUploadOfficialDoc = (docName: string) => {
    majProcessus({ officialDocs: [...officialDocs, { name: docName, uploadedAt: new Date().toISOString() }] });
    addNotification({
      userId: company.clientId,
      type: 'success',
      title: 'Document uploadé',
      message: `${docName} a été ajouté aux documents officiels`,
      read: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header avec barre de progression */}
      <div className="bg-gradient-to-r from-[#1A2753] to-[#273A7A] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white text-xl mb-2">Workflow de traitement du dossier</h3>
            <p className="text-white/70 text-sm">
              Étape {company.currentStep || 1}/7 - {steps.find(s => s.number === (company.currentStep || 1))?.title}
            </p>
            <p className="text-white/70 text-xs mt-1">
              Dossier soumis le {new Date(company.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
            <p className="text-white/70 text-sm">Progression</p>
            <p className="text-white text-3xl">{Math.round(((company.currentStep || 1) / 7) * 100)}%</p>
          </div>
        </div>

        {/* Barre de progression des étapes */}
        <div className="bg-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const colors = getStepColor(step.status);
              const StepIcon = step.icon;
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';
              const isBlocked = step.status === 'blocked';

              return (
                <div key={`progress-step-${step.number}`} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isCompleted
                          ? 'bg-green-500'
                          : isCurrent
                          ? 'bg-[#D6A93A] shadow-lg shadow-[#D6A93A]/50'
                          : isBlocked
                          ? 'bg-red-500/50'
                          : 'bg-white/10'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <StepIcon className={`w-6 h-6 ${
                          isCurrent || isCompleted ? 'text-white' : 'text-white/70'
                        }`} />
                      )}
                      {isCurrent && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-[#D6A93A]/30 rounded-full"
                        />
                      )}
                    </motion.div>
                    <p className={`text-xs text-center max-w-[80px] ${
                      isCompleted || isCurrent ? 'text-white font-medium' : 'text-white/70'
                    }`}>
                      {step.title}
                    </p>
                    {isBlocked && (
                      <span className="text-[10px] text-red-300 mt-1 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                        Bloqué
                      </span>
                    )}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-2 mt-[-20px] rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-green-500 w-full' : 'bg-transparent w-0'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Une seule étape est rendue à la fois : l'enveloppe AnimatePresence
          n'apportait qu'une animation de sortie, et cette sortie ne s'achève
          jamais dans un onglet en arrière-plan — les cartes s'accumulaient
          alors dans la page, jusqu'à sept à la fois. */}
        {steps.map((step) => {
          if (step.number !== (company.currentStep || 1)) return null;

          const colors = getStepColor(step.status);
          const StepIcon = step.icon;
          const StatusIcon =
            step.status === 'completed'
              ? CheckCircle
              : step.status === 'current'
              ? Clock
              : step.status === 'blocked'
              ? AlertTriangle
              : Circle;

          return (
            <motion.div
              key={`current-step-${step.number}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* En-tête de l'étape */}
              <div className={`bg-white rounded-2xl border-2 ${colors.border} overflow-hidden shadow-lg`}>
                <div className={`${colors.bg} px-6 py-5 border-b-2 ${colors.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center shadow-md`}>
                        <StepIcon className={`w-8 h-8 ${colors.icon}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs ${colors.text} opacity-60 font-medium`}>ÉTAPE {step.number}/7</span>
                          <ChevronRight className="w-4 h-4 opacity-40" />
                          <h4 className={`text-xl ${colors.text} font-semibold`}>{step.title}</h4>
                        </div>
                        <p className="text-[#273A7A]/80">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Bouton Consulter le dossier complet - Toujours visible */}
                      <button
                        onClick={() => setShowCompanyDetails(true)}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white px-4 py-2.5 bg-white/80 hover:bg-white border border-[#273A7A]/20 hover:border-[#273A7A]/40 text-[#1A2753] rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="font-medium text-sm">Dossier complet</span>
                      </button>

                      {etapeCourante > 1 && (
                        <button
                          onClick={revenirEtapePrecedente}
                          title={`Revenir à : ${steps.find(s => s.number === etapeCourante - 1)?.title}`}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white px-4 py-2.5 bg-white/80 hover:bg-white border border-[#273A7A]/20 hover:border-[#273A7A]/40 text-[#1A2753] rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                          <span className="font-medium text-sm">Étape précédente</span>
                        </button>
                      )}

                      {etapeSuivante && (
                        <button
                          onClick={passerEtapeSuivante}
                          disabled={!peutAvancer}
                          title={
                            peutAvancer
                              ? `Passer à : ${etapeSuivante.title}`
                              : enAttente
                                ? `Impossible : ${enAttente}`
                                : `${etapeSuivante.title} est bloquée`
                          }
                          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm ${
                            peutAvancer
                              ? 'bg-[#1A2753] text-white hover:shadow-md'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <span className="font-medium text-sm">Étape suivante</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      
                      <div className={`px-5 py-3 ${colors.iconBg} rounded-xl shadow-sm`}>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-5 h-5 ${colors.icon}`} />
                          <p className={`text-sm font-medium ${colors.text}`}>
                            {step.status === 'completed' && 'Terminé'}
                            {step.status === 'current' && 'En cours'}
                            {step.status === 'pending' && 'En attente'}
                            {step.status === 'blocked' && 'Bloqué'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Action client */}
                    {step.clientAction && (
                      <div className="bg-[#F5F6FA] rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Users className="w-5 h-5 text-[#273A7A]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-[#273A7A]/80 mb-2 uppercase tracking-wide">Côté client</p>
                            <p className="text-[#1A2753] font-medium">{step.clientAction}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action admin */}
                    {step.adminAction && (
                      <div className="bg-gradient-to-br from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-4 border border-[#D6A93A]/20">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#D6A93A]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-[#D6A93A]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-[#D6A93A] mb-2 uppercase tracking-wide font-medium">Action requise</p>
                            <p className="text-[#1A2753] font-medium mb-3">{step.adminAction}</p>
                            
                            {/* Boutons d'action - Étapes 1-2 : Validation des documents */}
                            {(step.number === 1 || step.number === 2) && !allDocumentsValidated && documentsToValidate.length > 0 && (
                              <button
                                onClick={() => setShowDocumentsValidation(true)}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                <FileCheck className="w-5 h-5" />
                                <span className="font-medium">
                                  {step.number === 1 ? 'Examiner et valider les documents' : 'Valider les documents'}
                                </span>
                              </button>
                            )}
                            
                            {/* Message si tous les documents sont validés */}
                            {(step.number === 1 || step.number === 2) && allDocumentsValidated && documentsToValidate.length > 0 && (
                              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-green-700">Tous les documents ont été validés</p>
                              </div>
                            )}

                            {/* Boutons d'action - Étape 3 : Devis d'immatriculation */}
                            {step.number === 3 && !quoteSent && (
                              <button
                                onClick={() => setShowQuoteForm(true)}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-4 py-3 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                <DollarSign className="w-5 h-5" />
                                <span className="font-medium">Créer le devis</span>
                              </button>
                            )}

                            {/* Déclaration sur l'honneur : demandée par le client à la
                                place du casier judiciaire, elle se signe avec les statuts.
                                Aucun écran ne permettait de la produire. */}
                            {step.number === 6 && company.useHonorDeclaration && !honorDeclarationSent && (
                              <button
                                onClick={() => setShowHonorDeclaration(true)}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full mb-3 px-4 py-3 bg-white border-2 border-[#1A2753]/20 text-[#1A2753] rounded-xl hover:border-[#1A2753]/40 transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                <FileText className="w-5 h-5" />
                                <span className="font-medium">Générer la déclaration sur l'honneur</span>
                              </button>
                            )}

                            {step.number === 6 && company.useHonorDeclaration && honorDeclarationSent && (
                              <p className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                Déclaration sur l'honneur envoyée
                              </p>
                            )}

                            {/* Boutons d'action - Étape 6 */}
                            {step.number === 6 && !statutsSent && !statutsRejectedByClient && (
                              <button
                                onClick={() => setShowStatutsUpload(true)}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-4 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                <Upload className="w-5 h-5" />
                                <span className="font-medium">Générer les statuts V{statutsVersion}</span>
                              </button>
                            )}

                            {step.number === 6 && statutsRejectedByClient && (
                              <button
                                onClick={() => setShowStatutsUpload(true)}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                <Upload className="w-5 h-5" />
                                <span className="font-medium">Corriger et envoyer V{statutsVersion + 1}</span>
                              </button>
                            )}

                            {step.number === 7 && appointmentRequest && appointmentRequest.status === 'pending' && (
                              <button
                                onClick={() => setShowAppointmentValidation(true)}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                <Calendar className="w-5 h-5" />
                                <span className="font-medium">Valider le RV</span>
                              </button>
                            )}

                            {/* Boutons d'action - Étape 7 */}
                            {step.number === 7 && !companyFinalized && (appointmentRequest?.status === 'confirmed' || onlineSignatureCompleted) && (
                              <button
                                onClick={() => setShowOfficialDocsUpload(true)}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                <Building className="w-5 h-5" />
                                <span className="font-medium">Finaliser la société</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Alertes spécifiques */}
                  {step.number === 4 && step.status === 'blocked' && (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-orange-800 font-semibold mb-1">
                          En attente du client
                        </p>
                        <p className="text-sm text-orange-700">
                          Le client doit valider le devis pour débloquer les étapes suivantes.
                        </p>
                      </div>
                    </div>
                  )}

                  {step.number === 5 && step.status === 'blocked' && (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-orange-800 font-semibold mb-1">
                          En attente du client
                        </p>
                        <p className="text-sm text-orange-700">
                          Le client doit d'abord valider le devis pour accéder à la libération du capital.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Alerte rejet statuts */}
                  {step.number === 6 && statutsRejectedByClient && (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                      <p className="text-orange-800 font-semibold mb-2">
                        Statuts rejetés par le client
                      </p>
                      <p className="text-sm text-orange-700 mb-2">
                        <strong>Motif :</strong> {clientRejectionReason}
                      </p>
                      <p className="text-xs text-orange-600">
                        Veuillez corriger les statuts et envoyer la version {statutsVersion + 1}
                      </p>
                    </div>
                  )}

                  {/* Demande de rendez-vous en attente.
                      Elle s'affichait à l'étape 6 alors que le client ne la
                      formule qu'à sa dernière étape, l'administration étant
                      alors passée à l'étape 7 : personne ne pouvait la confirmer
                      et le dossier restait bloqué des deux côtés. */}
                  {step.number === 7 && appointmentRequest && appointmentRequest.status === 'pending' && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <p className="text-blue-800 font-semibold mb-2">
                        Demande de rendez-vous reçue
                      </p>
                      <p className="text-sm text-blue-700 mb-2">
                        <strong>Date :</strong> {new Date(appointmentRequest.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Créneau :</strong> {appointmentRequest.timeSlot}
                      </p>
                    </div>
                  )}

                  {/* Alerte signature en ligne */}
                  {step.number === 7 && onlineSignatureCompleted && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <p className="text-green-800 font-semibold mb-2">
                        Signature électronique reçue
                      </p>
                      <p className="text-sm text-green-700">
                        Documents signés : {signedDocuments.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* État des documents pour l'étape 2 */}
                  {step.number === 2 && (
                    <div className="bg-[#F5F6FA] rounded-xl p-4">
                      <h4 className="text-[#1A2753] font-semibold mb-3 flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-[#D6A93A]" />
                        État des documents
                      </h4>
                      <div className="space-y-2">
                        {documentsToValidate.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-[#273A7A]" />
                              <span className="text-sm text-[#1A2753]">{doc.name}</span>
                            </div>
                            {doc.status === 'validated' && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-medium inline-flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                                Validé
                              </span>
                            )}
                            {doc.status === 'rejected' && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-medium inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3" aria-hidden="true" />
                                Rejeté
                              </span>
                            )}
                            {doc.status === 'pending' && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                                En attente
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Refus du client, à l'étape 3 : le motif et la suite à donner */}
                  {step.number === 3 && quoteRejected && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-800 font-semibold mb-1">
                            Devis refusé par le client
                          </p>
                          {company.quote?.rejectionReason && (
                            <p className="text-sm text-red-700 mb-2">
                              Motif : {company.quote.rejectionReason}
                            </p>
                          )}
                          <p className="text-sm text-red-700 mb-2">
                            Reprenez le devis et renvoyez-le : le client attend une
                            nouvelle proposition.
                          </p>
                          <button
                            onClick={() => setShowQuoteForm(true)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-sm text-red-700 hover:text-red-800 underline font-medium"
                          >
                            Corriger le devis
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Récap du devis pour l'étape 3 */}
                  {step.number === 3 && quoteSent && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-green-800 font-semibold mb-1">
                            Devis envoyé avec succès
                          </p>
                          <p className="text-sm text-green-700 mb-2">
                            Le devis a été envoyé au client et est en attente de validation.
                          </p>
                          <button
                            onClick={() => setShowQuote(true)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-sm text-green-700 hover:text-green-800 underline font-medium"
                          >
                            Voir le devis envoyé
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info validation devis - Étape 4 */}
                  {step.number === 4 && quoteValidated && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-green-800 font-semibold mb-1">
                            Devis validé par le client
                          </p>
                          <p className="text-sm text-green-700">
                            Le client a accepté le devis. Vous pouvez passer à l'étape suivante.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info libération capital - Étape 5 */}
                  {step.number === 5 && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Landmark className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-blue-800 font-semibold mb-1">
                            Libération du capital
                          </p>
                          <p className="text-sm text-blue-700 mb-2">
                            Capital à libérer : <strong>{company.capital?.toLocaleString('fr-FR')} FCFA</strong>
                          </p>
                          <p className="text-xs text-blue-600">
                            Le client doit effectuer le versement du capital social à la banque.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info statuts - Étape 6 */}
                  {step.number === 6 && statutsSent && !statutsValidatedByClient && !statutsRejectedByClient && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-blue-800 font-semibold mb-1">
                            Statuts envoyés - En attente de validation
                          </p>
                          <p className="text-sm text-blue-700">
                            Les statuts V{statutsVersion} ont été envoyés au client pour validation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.number === 6 && statutsValidatedByClient && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-green-800 font-semibold mb-1">
                            Statuts validés par le client
                          </p>
                          <p className="text-sm text-green-700">
                            Le client a validé les statuts et va choisir son mode de signature.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info finalisation - Étape 7 */}
                  {step.number === 7 && companyFinalized && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-green-800 font-semibold mb-1">
                            Société finalisée
                          </p>
                          <p className="text-sm text-green-700">
                            Tous les documents officiels ont été uploadés. Le dossier est complet.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

      {/* MODALES */}
      <AnimatePresence>
        {showCompanyDetails && (
          <CompanyDetailsModal
            company={company}
            documents={documentsToValidate}
            onClose={() => setShowCompanyDetails(false)}
          />
        )}


        {showDocumentsValidation && (
          <DocumentsValidationModal
            onClose={() => setShowDocumentsValidation(false)}
            documents={documentsToValidate}
            selectedDocId={selectedDocForRejection}
            rejectionReason={rejectionReason}
            onRejectionReasonChange={setRejectionReason}
            onSelectForRejection={setSelectedDocForRejection}
            onValidate={handleValidateDocument}
            onReject={handleRejectDocument}
            onPreview={setPreviewDocument}
          />
        )}


        {previewDocument && (
          <DocumentPreviewModal
            document={previewDocument}
            onClose={() => setPreviewDocument(null)}
            onValidate={handleValidateDocument}
            onStartRejection={setSelectedDocForRejection}
          />
        )}


        {showQuoteForm && (
          <QuoteFormModal
            onClose={() => setShowQuoteForm(false)}
            form={quoteForm}
            onChange={setQuoteForm}
            totalFees={totalFees}
            onSend={handleSendQuote}
          />
        )}


        {showHonorDeclaration && (
          <HonorDeclarationPreview
            company={{
              name: company.name,
              legalForm: company.legalForm,
              address: company.address || '',
            }}
            client={{
              firstName: company.legalRepresentative?.firstName || company.shareholders?.[0]?.firstName || '',
              lastName: company.legalRepresentative?.lastName || company.shareholders?.[0]?.lastName || '',
              address: company.legalRepresentative?.address || company.shareholders?.[0]?.address || '',
            }}
            onClose={() => setShowHonorDeclaration(false)}
            onSend={handleSendHonorDeclaration}
          />
        )}

        {showStatutsUpload && (
          <StatutsUploadModal
            onClose={() => setShowStatutsUpload(false)}
            rejectedByClient={statutsRejectedByClient}
            version={statutsVersion}
            rejectionReason={clientRejectionReason}
            onSend={handleSendStatuts}
            onResend={handleResendStatuts}
          />
        )}


        {showAppointmentValidation && appointmentRequest && (
          <AppointmentValidationModal
            onClose={() => setShowAppointmentValidation(false)}
            request={appointmentRequest}
            onConfirm={handleConfirmAppointment}
            onReject={handleRejectAppointment}
          />
        )}


        {showOfficialDocsUpload && (
          <OfficialDocsModal
            onClose={() => setShowOfficialDocsUpload(false)}
            uploadedDocs={officialDocs}
            onUpload={handleUploadOfficialDoc}
            onFinalize={handleFinalizeCompany}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
