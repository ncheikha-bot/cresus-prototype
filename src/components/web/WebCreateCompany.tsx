import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  DeviceMobile,
  DollarSign,
  Download,
  FileText,
  HelpCircle,
  Info,
  Landmark,
  MapPin,
  Pen,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  Wallet,
  X,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { WebAssociateStatutsFields } from './WebAssociateStatutsFields';
import { DocumentUploadManager } from './DocumentUploadManager';
import { ClientHonorDeclarationStep } from './ClientHonorDeclarationStep';
import { ClientQuoteValidationStep } from './ClientQuoteValidationStep';
import {
  legalFormInfo,
  getLegalFormInfo,
  getDirectorTitle as getDirectorTitleFor,
  type LegalFormInfo,
} from '../../domain/legalForms';
import {
  REGISTRATION_FEES,
  getTotalRegistrationFees as computeTotalFees,
  getPaymentAmount as computePaymentAmount,
  getNetCapital as computeNetCapital,
  getLiberatedAmount as computeLiberatedAmount,
  getRemainingAmount as computeRemainingAmount,
} from '../../domain/pricing';
import {
  getCapitalNumber as parseCapital,
  isCapitalValid as checkCapital,
  isAssociatesCountValid as checkAssociatesCount,
  isCapitalDistributionValid as checkDistribution,
  getRequiredDocuments as buildRequiredDocuments,
  validateStep1,
  getStep2BlockingReason,
  validateStep2,
  validateStep3,
  validateStatutsInfo,
  toDocumentsSoumis,
} from '../../domain/companyValidation';
import { COMPANY_CREATION_STEPS } from '../../domain/companySteps';
import { formatAmountInput, formatFCFA } from '../../lib/format';
import { FormField } from '../ui/form-field';
import { toast } from 'sonner';
import { useConfirm } from '../ui/confirm-dialog';

interface WebCreateCompanyProps {
  onBack: () => void;
  /** Brouillon à reprendre. Transmis par App.tsx mais pas encore exploité :
   *  la reprise de brouillon reste à implémenter (voir handleSaveAndQuit). */
  draftId?: string;
}

/** Titres et numerotation viennent du domaine ; seules les icones sont locales. */
const STEP_ICONS = [Building2, Users, MapPin, FileText, DollarSign, CreditCard, FileText, CheckCircle2];
const steps = COMPANY_CREATION_STEPS.map((step, i) => ({ ...step, icon: STEP_ICONS[i] }));

const paymentMethods = [
  { 
    id: 'orange_money', 
    name: 'Orange Money', 
    icon: DeviceMobile,

    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Paiement instantané'
  },
  { 
    id: 'wave', 
    name: 'Wave', 
    icon: DeviceMobile,

    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Paiement instantané'
  },
  { 
    id: 'cheque_cash', 
    name: 'Chèque/Espèces', 
    icon: Wallet,

    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    description: 'Paiement en agence'
  },
  { 
    id: 'bank_transfer', 
    name: 'Virement bancaire', 
    icon: Landmark,

    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Avec preuve de paiement'
  },
];

const STATUTS_A_SIGNER = { id: '1', name: 'Statuts de la société', type: 'Statuts', pages: 12 };
const DECLARATION_A_SIGNER = { id: '2', name: 'Déclaration sur l\'honneur', type: 'Déclaration', pages: 1 };


interface Associate {
  id: string;
  firstName: string;
  lastName: string;
  percentage: string;
  amount: string;
  // Optionnels : les associés créés lors d'un changement de forme juridique
  // ne sont initialisés qu'avec l'identité et la répartition du capital.
  address?: string;
  profession?: string;
  phone?: string;
  email?: string;
  isManager?: boolean; // Si c'est le gérant/président
  maritalStatus?: 'single' | 'married' | 'widowed' | 'divorced'; // Situation matrimoniale
  matrimonialRegime?: 'community' | 'separation'; // Régime matrimonial (si marié)
  spouseInfo?: {
    firstName: string;
    lastName: string;
    birthDate: string;
    profession: string;
  }; // Informations du conjoint (si marié en communauté de biens)
}

interface DocumentToUpload {
  id: string;
  name: string;
  description: string;
  required: boolean;
  maxFiles?: number;
}

interface UploadedDocument {
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

export const WebCreateCompany: React.FC<WebCreateCompanyProps> = ({ onBack, draftId }) => {
  const {
    addNotification,
    currentUser,
    companies,
    addCompany,
    updateCompanyStatus,
    updateCompanyQuote,
    getCompanyProcess,
    updateCompanyProcess,
    saveDraft,
    getDraftById,
    deleteDraft,
  } = useApp();
  const confirm = useConfirm();
  const [currentStep, setCurrentStep] = useState(1);
  /** Brouillon de ce tunnel : repris s'il en vient un, créé au premier enregistrement. */
  const [idBrouillon, setIdBrouillon] = useState<string | undefined>(draftId);
  /** Dossier créé à l'étape 4, sur lequel l'administration travaille. */
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    legalForm: 'SARL',
    activity: '',
    capital: formatAmountInput('1000000'),
    address: '',
  });
  const [associates, setAssociates] = useState<Associate[]>([
    { 
      id: '1', 
      firstName: '', 
      lastName: '', 
      percentage: '', 
      amount: '',
      address: '',
      profession: '',
      phone: '',
      email: '',
      isManager: false,
      maritalStatus: '' as any, // Chaîne vide pour input contrôlé mais non sélectionné
      matrimonialRegime: undefined,
      spouseInfo: undefined
    }
  ]);
  const [comanagement, setComanagement] = useState(false); // Cogérance
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedDocument[]>>({});
  const [useHonorDeclaration, setUseHonorDeclaration] = useState(false);
  // L'envoi de la déclaration est décidé par l'administration : il est lu
  // dans l'avancement partagé (`processus.honorDeclarationSent`).
  const [honorDeclarationSigned, setHonorDeclarationSigned] = useState(false); // Client a signé
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedDocToSign, setSelectedDocToSign] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signedDocs, setSignedDocs] = useState<string[]>([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showLegalFormInfo, setShowLegalFormInfo] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [liberationType, setLiberationType] = useState<'total' | 'partial'>('total');
  const [liberationMethod, setLiberationMethod] = useState<'amount' | 'percentage'>('percentage');
  const [liberationValue, setLiberationValue] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // États pour le devis d'immatriculation
  /**
   * Devis, tel que l'administration l'a établi.
   *
   * Le tunnel se le fabriquait lui-même — il s'envoyait la notification « Devis
   * créé par l'admin » — alors que l'administration dispose de son propre
   * formulaire. Il est désormais porté par la fiche société ; seul le motif de
   * refus, saisi ici, reste local le temps de la saisie.
   */
  const societeDuDossier = companies.find(c => c.id === companyId);
  const devisPartage = societeDuDossier?.quote;
  const [rejectionReason, setRejectionReason] = useState('');

  const quote = {
    ...REGISTRATION_FEES,
    registrationFees: devisPartage?.registrationFees ?? REGISTRATION_FEES.registrationFees,
    legalFees: devisPartage?.legalFees ?? REGISTRATION_FEES.legalFees,
    publicationFees: devisPartage?.publicationFees ?? REGISTRATION_FEES.publicationFees,
    stampDuty: devisPartage?.stampDuty ?? REGISTRATION_FEES.stampDuty,
    adminFees: devisPartage?.adminFees ?? REGISTRATION_FEES.adminFees,
    status: (devisPartage?.status === 'validated'
      ? 'validated'
      : devisPartage?.status === 'rejected'
        ? 'rejected'
        : 'pending') as 'pending' | 'validated' | 'rejected',
    validatedAt: devisPartage?.validatedAt ?? null,
    notes: devisPartage?.notes ?? '',
    rejectionReason: devisPartage?.rejectionReason ?? rejectionReason,
  };
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  /** Le devis n'existe pour le client qu'une fois envoyé par l'administration. */
  const devisStatus: 'waiting' | 'created' | 'validated' =
    devisPartage?.status === 'validated'
      ? 'validated'
      : devisPartage?.status === 'sent' || devisPartage?.status === 'rejected'
        ? 'created'
        : 'waiting';

  // États pour la validation des statuts (Étape 6)
  /**
   * Statuts et rendez-vous, tels que l'administration les fait avancer.
   *
   * C'était un état local du tunnel, alimenté par une minuterie qui « simulait
   * l'envoi des statuts par l'admin ». Le dossier étant désormais créé dès
   * l'étape 4, les deux rôles partagent le même avancement.
   */
  const processus = getCompanyProcess(companyId ?? '');

  const statutsStatus: 'waiting' | 'sent' | 'validated' | 'rejected' =
    processus.statutsValidatedByClient
      ? 'validated'
      : processus.statutsRejectedByClient
        ? 'rejected'
        : processus.statutsSent
          ? 'sent'
          : 'waiting';
  const statuts = { version: processus.statutsVersion || 1, status: statutsStatus };

  /**
   * Documents à signer.
   *
   * La déclaration sur l'honneur figurait toujours dans la liste, y compris
   * quand le client n'en demandait pas — et même avant que l'administration ne
   * l'ait rédigée. Elle n'apparaît maintenant que si le client l'a demandée et
   * que l'administration l'a envoyée.
   */
  const documentsToSign = useHonorDeclaration && processus.honorDeclarationSent
    ? [STATUTS_A_SIGNER, DECLARATION_A_SIGNER]
    : [STATUTS_A_SIGNER];
  const [statutsRejectionReason, setStatutsRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [signatureChoice, setSignatureChoice] = useState<'online' | 'appointment' | null>(null);

  // États pour les rendez-vous de signature
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const appointmentStatus = processus.appointmentRequest?.status ?? 'pending';
  /** Créneau tel qu'il est enregistré sur le dossier, saisie locale en secours. */
  const rendezVousConfirme = processus.appointmentRequest
    ?? { date: selectedDate, timeSlot: selectedTimeSlot };

  const serviceFee = 15000;
  
  // État pour les erreurs de validation
  const [errors, setErrors] = useState<{
    step1?: string[];
    step2?: string[];
    step3?: string[];
    [key: string]: string[] | undefined;
  }>({});

  // Réinitialiser les erreurs quand on change d'étape
  useEffect(() => {
    setErrors({});
  }, [currentStep]);

  // Erreurs par champ pour l'etape 1 : le message s'affiche sous le champ
  // concerne, au lieu d'une liste globale en haut de formulaire.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

  /** Efface l'erreur d'un champ des que l'utilisateur le corrige. */
  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => {
      if (!prev[field]) return prev;
      const suivant = { ...prev };
      delete suivant[field];
      return suivant;
    });
  };

  // Motif du blocage de l'etape 2, affiche pres du bouton « Suivant ».
  const blocageEtape2 = getStep2BlockingReason(associates, formData.capital, formData.legalForm);
  // Meme principe a l'etape 3 : on dit ce qui manque plutot que de griser le bouton.
  const blocageEtape3 = validateStep3(associates)[0] ?? null;
  // Etape 5 : le devis doit etre valide, et l'etat civil complete pour les statuts.
  const blocageEtape5 = quote.status !== 'validated'
    ? 'Validez le devis pour continuer.'
    : validateStatutsInfo(associates)[0] ?? null;

  /** Place le focus sur le premier champ en erreur et l'amene a l'ecran. */
  const focusFirstError = (errors: Record<string, string>) => {
    const premier = ['name', 'legalForm', 'capital', 'activity', 'address'].find(f => errors[f]);
    if (!premier) return;
    const el = fieldRefs.current[premier];
    if (el) {
      el.focus();
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  };

  // Reprise d'un brouillon : `draftId` etait passe par App.tsx mais n'etait
  // exploite nulle part, ce qui rendait toute la branche « reprendre plus
  // tard » inoperante.
  useEffect(() => {
    if (!draftId || !currentUser) return;
    const draft = getDraftById(currentUser.id, draftId);
    if (!draft) return;

    setFormData(draft.formData);
    setAssociates(draft.associates || []);
    setUploadedFiles(draft.uploadedFiles || {});
    setCurrentStep(draft.currentStep || 1);
    setSelectedPaymentMethod(draft.selectedPaymentMethod ?? null);
    setPhoneNumber(draft.phoneNumber || '');
    setSignedDocs(draft.signedDocs || []);
    setLiberationType(draft.liberationType || 'total');
    setLiberationMethod(draft.liberationMethod || 'percentage');
    setLiberationValue(draft.liberationValue || '');
    setPaymentCompleted(Boolean(draft.paymentCompleted));
    // Avancement du dossier. Les brouillons enregistrés avant l'ajout de ces
    // champs n'en portent aucun : chacun garde alors sa valeur initiale.
    setComanagement(Boolean(draft.comanagement));
    setUseHonorDeclaration(Boolean(draft.useHonorDeclaration));
    setSignatureChoice(draft.signatureChoice ?? null);
    if (draft.appointment) {
      setSelectedDate(draft.appointment.date);
      setSelectedTimeSlot(draft.appointment.timeSlot);
    }
    // Statuts et statut du rendez-vous viennent du dossier partagé.
    setCompanyId(draft.companyId ?? null);
    // Volontairement sans dependance sur getDraftById : on ne restaure qu'au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, currentUser?.id]);

  /**
   * Enregistrement automatique à chaque étape franchie.
   *
   * `enregistrerBrouillon` est défini plus bas dans le composant : la référence
   * lue ici est celle du rendu courant, donc à jour. La sauvegarde ne démarre
   * qu'une fois l'entreprise nommée, pour ne pas semer des brouillons vides.
   */
  useEffect(() => {
    if (currentStep === 1 || !formData.name.trim()) return;
    enregistrerBrouillon();
    // Le contenu du brouillon suit l'étape ; le déclencheur est le franchissement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, companyId]);

  // Créneaux horaires disponibles pour les RV
  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
  ];

  // Obtenir les jours disponibles (7 prochains jours ouvrés)
  const getAvailableDates = () => {
    const dates = [];
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1); // Commencer demain
    
    while (dates.length < 7) {
      const dayOfWeek = currentDate.getDay();
      // Exclure samedi (6) et dimanche (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  // Fonction de réservation du RV
  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTimeSlot) {
      addNotification({
        userId: currentUser?.id || '',
        title: 'Sélection incomplète',
        message: 'Veuillez choisir une date et un créneau horaire',
        type: 'warning',
        read: false,
        createdAt: new Date().toISOString()
      });
      return;
    }

    if (companyId) {
      updateCompanyProcess(companyId, {
        appointmentRequest: { date: selectedDate, timeSlot: selectedTimeSlot, status: 'pending' },
      });
    }
    if (currentUser) {
      addNotification({
        userId: currentUser.id,
        title: 'Rendez-vous réservé',
        message: `Votre demande de RV pour le ${new Date(selectedDate).toLocaleDateString('fr-FR')} à ${selectedTimeSlot} a été envoyée à l'administrateur pour validation.`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    // La confirmation vient de l'administration, qui voit la demande arriver
    // dans le dossier.
  };
  
  // Obtenir les infos de la forme juridique sélectionnée
  const currentLegalFormInfo = getLegalFormInfo(formData.legalForm);

  // Auto-notification supprimée - Le devis est maintenant créé quand on clique sur "Suivant" à l'étape 4

  const getCapitalNumber = () => parseCapital(formData.capital);

  const getLiberatedAmount = () =>
    computeLiberatedAmount(getCapitalNumber(), liberationType, liberationMethod, liberationValue);

  const getRemainingAmount = () =>
    computeRemainingAmount(getCapitalNumber(), liberationType, liberationMethod, liberationValue);

  // Calculs pour le devis d'immatriculation
  const getTotalRegistrationFees = () => computeTotalFees(quote);

  const getPaymentAmount = () => computePaymentAmount(getCapitalNumber(), quote);

  const getNetCapital = () => computeNetCapital(getCapitalNumber(), quote);

  const handleValidateQuote = async () => {
    const totalFees = getTotalRegistrationFees();
    const capital = getCapitalNumber();
    
    // Si le capital est inférieur aux frais, demander confirmation
    if (capital < totalFees) {
      const additionalAmount = totalFees - capital;
      const confirmed = await confirm({
        title: 'Le capital ne couvre pas les frais',
        description: (
          <>
            Capital social : {formatFCFA(capital)}
            <br />
            Frais d&apos;immatriculation : {formatFCFA(totalFees)}
            <br />
            <br />
            Il vous faudra verser {formatFCFA(additionalAmount)} de plus, soit{' '}
            {formatFCFA(capital + totalFees)} au total. En validant ce devis, vous vous
            engagez sur ce montant.
            <br />
            <br />
            Vous pouvez aussi revenir à l&apos;étape 1 et porter votre capital à{' '}
            {formatFCFA(totalFees)} ou plus pour éviter ce supplément.
          </>
        ),
        confirmLabel: 'Continuer avec ce devis',
        cancelLabel: 'Revoir mon capital',
      });

      if (!confirmed) {
        toast.info('Validation annulée', {
          description: 'Vous pouvez modifier votre capital ou revoir le devis.',
        });
        return;
      }
    }
    
    // Le devis validé est reporté sur le dossier : sans cela,
    // l'administration reste bloquée avant la rédaction des statuts.
    if (companyId) {
      updateCompanyQuote(companyId, { status: 'validated', validatedAt: new Date().toISOString() });
    }
    addNotification({
      userId: currentUser?.id || '',
      title: 'Devis validé',
      message: capital >= totalFees 
        ? 'Vous pouvez maintenant procéder au versement du capital'
        : `Montant total à verser : ${getPaymentAmount().toLocaleString()} FCFA (capital + frais supplémentaires)`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    });
    
    // Sauf si l'état civil des associés reste à compléter : il se saisit sur
    // cette même étape, et une avance automatique le sauterait.
    if (validateStatutsInfo(associates).length === 0) {
      setTimeout(() => {
        setCurrentStep(6);
      }, 1000);
    }
  };

  const handleSignHonorDeclaration = () => {
    setHonorDeclarationSigned(true);
    addNotification({
      userId: currentUser?.id || '',
      title: 'Déclaration signée',
      message: 'Votre déclaration sur l\'honneur a été signée avec succès',
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    });

    // Les statuts sont rédigés et envoyés par l'administration, depuis son
    // propre espace : le tunnel ne les fabrique plus.
  };

  const handleRejectQuote = (reason: string) => {
    // Le refus et son motif partent vers l'administration, qui corrigera le devis.
    setRejectionReason(reason);
    if (companyId) {
      updateCompanyQuote(companyId, {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
      });
    }
    
    addNotification({
      userId: currentUser?.id || '',
      title: 'Devis refusé',
      message: 'L\'administrateur a été notifié de votre refus',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    });
  };

  // Obtenir le terme de dirigeant selon la forme juridique
  const getDirectorTitle = (legalForm: string): string => getDirectorTitleFor(legalForm);

  // Obtenir les documents requis selon la forme juridique
  const getRequiredDocuments = (): DocumentToUpload[] =>
    buildRequiredDocuments(formData.legalForm, associates.length, useHonorDeclaration);

  // Validation capital minimum
  const isCapitalValid = () => checkCapital(formData.capital, formData.legalForm);

  // Validation nombre d'associés
  const isAssociatesCountValid = () =>
    checkAssociatesCount(associates.length, formData.legalForm);

  // Validation répartition du capital
  const isCapitalDistributionValid = () => checkDistribution(associates, formData.capital);

  // Handler pour l'upload de la preuve de paiement
  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Fichier trop volumineux', { description: 'La taille maximale est de 5 MB' });
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format non supporté', { description: 'Formats acceptés : JPG, PNG, PDF' });
        return;
      }

      setPaymentProof(file);
      
      // Créer une preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      addNotification({
        userId: currentUser?.id || '',
        title: 'Preuve ajoutée',
        message: `${file.name} a été téléversé avec succès`,
        type: 'success',
        read: false,
      });
    }
  };

  const handleNext = () => {
    // Validation étape 1
    if (currentStep === 1) {
      // Validation par champ : le message est rattache au champ fautif et le
      // focus y est place. Plus de notification persistante pour une simple
      // erreur de saisie — c'est un feedback transitoire, pas un evenement metier.
      const erreurs = validateStep1(formData);
      if (Object.keys(erreurs).length > 0) {
        setFieldErrors(erreurs);
        focusFirstError(erreurs);
        return;
      }
      setFieldErrors({});
    }

    // Validation étape 2
    // Etape 2 : identite des associes et repartition du capital.
    if (currentStep === 2) {
      const erreurs = validateStep2(associates, formData.capital, formData.legalForm);
      if (erreurs.length > 0) {
        setErrors({ step2: erreurs });
        toast.error('Répartition incomplète', { description: erreurs.join(' • ') });
        return;
      }
    }

    // Etape 3 : coordonnees administratives, necessaires aux statuts.
    if (currentStep === 3) {
      const erreurs = validateStep3(associates);
      if (erreurs.length > 0) {
        setErrors({ step3: erreurs });
        toast.error('Informations manquantes', { description: erreurs.join(' • ') });
        return;
      }
    }

    // Validation étape 4 (Documents)
    if (currentStep === 4) {
      const step4Errors: string[] = [];
      
      const requiredDocs = getRequiredDocuments().filter(doc => {
        // Si c'est le casier et qu'on utilise la déclaration sur l'honneur, ne pas le considérer comme requis
        if (doc.id === 'casier' && useHonorDeclaration) {
          return false;
        }
        return doc.required;
      });
      
      const missingDocs = requiredDocs.filter(doc => 
        !uploadedFiles[doc.id] || uploadedFiles[doc.id].length === 0
      );
      
      if (missingDocs.length > 0) {
        step4Errors.push(`Documents manquants : ${missingDocs.map(d => d.name).join(', ')}`);
      }

      // Check for rejected documents
      const rejectedDocs = Object.values(uploadedFiles)
        .flat()
        .filter(doc => doc.status === 'rejected');
      
      if (rejectedDocs.length > 0) {
        step4Errors.push(`Certains documents ont été rejetés. Veuillez les corriger : ${rejectedDocs.map(d => d.name).join(', ')}`);
      }
      
      if (step4Errors.length > 0) {
        setErrors({ step4: step4Errors });
        toast.error('Documents incomplets', { description: step4Errors.join(' • ') });
        return;
      }

      // Le dossier entre dans le référentiel partagé dès que les pièces sont
      // fournies, et non à la toute fin : l'administration peut ainsi les
      // examiner, établir le devis puis rédiger les statuts pendant que le
      // client poursuit son parcours.
      creerDossier();

      // Si le devis a été créé mais pas encore validé par le client
      if (devisStatus === 'created' && quote.status === 'pending') {
        // Permettre de passer à l'étape 5 pour valider le devis
      }
    }

    // Validation étape 5 (Validation devis + état civil pour les statuts)
    if (currentStep === 5) {
      if (quote.status !== 'validated') {
        toast.error('Devis non validé', { description: 'Veuillez valider le devis avant de continuer' });
        return;
      }
      const erreurs = validateStatutsInfo(associates);
      if (erreurs.length > 0) {
        setErrors({ step5: erreurs });
        toast.error('Informations manquantes', { description: erreurs.join(' • ') });
        return;
      }
    }

    // Étape paiement : traiter le paiement (étape 6)
    if (currentStep === 6 && !paymentCompleted) {
      if (!selectedPaymentMethod || !phoneNumber) {
        toast.error('Informations de paiement manquantes', { description: 'Veuillez sélectionner un mode de paiement et entrer votre numéro' });
        return;
      }

      // Validation spécifique pour les SA : minimum 25% de libération
      if (formData.legalForm === 'SA') {
        const capitalNum = getCapitalNumber();
        const liberatedAmount = getLiberatedAmount();
        const liberationPercentage = (liberatedAmount / capitalNum) * 100;
        
        if (liberationPercentage < 25) {
          toast.error('Libération du capital insuffisante', { description: `Pour une SA, vous devez libérer au minimum 25% du capital social (actuellement: ${liberationPercentage.toFixed(2)}%). Montant minimum requis: ${Math.ceil(capitalNum * 0.25).toLocaleString()} FCFA` });
          return;
        }
      }

      // Vérifier la preuve de paiement pour virement bancaire
      if (selectedPaymentMethod === 'bank_transfer' && !paymentProof) {
        toast.error('Preuve de paiement requise', { description: 'Veuillez téléverser la preuve de votre virement bancaire' });
        return;
      }

      // Pour chèque/espèces, afficher un message différent
      if (selectedPaymentMethod === 'cheque_cash') {
        toast.error('Paiement en attente', { description: 'Votre dossier sera activé dès réception du paiement en agence' });
      }
      setPaymentProcessing(true);
      setTimeout(() => {
        setPaymentProcessing(false);
        setPaymentCompleted(true);
        if (currentUser) {
          addNotification({
            userId: currentUser.id,
            title: 'Paiement validé',
            message: `Votre dépôt de capital de ${getLiberatedAmount().toLocaleString()} FCFA a été validé avec succès.`,
            type: 'success',
            read: false,
          });
        }
        setTimeout(() => setCurrentStep(currentStep + 1), 1500);
      }, 2000);
      return;
    }

    // Validation étape 7 (Validation des statuts)
    if (currentStep === 7) {
      if (statuts.status !== 'validated') {
        toast.error('Statuts non validés', { description: 'Veuillez valider les statuts avant de passer à la signature' });
        return;
      }
      if (!signatureChoice) {
        toast.error('Choix requis', { description: 'Veuillez choisir votre mode de signature' });
        return;
      }
      setCurrentStep(currentStep + 1);
      return;
    }

    // Validation étape 8 (Signature électronique)
    if (currentStep === 8) {
      if (signatureChoice === 'online' && signedDocs.length !== documentsToSign.length) {
        toast.error('Signature incomplète', { description: 'Veuillez signer tous les documents avant de finaliser' });
        return;
      }
      handleSubmit();
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      // Reset payment state if going back from step 8
      if (currentStep === 8) {
        setPaymentCompleted(false);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  // Fonctions pour la validation des statuts (Étape 7)
  const handleValidateStatuts = () => {
    if (companyId) {
      updateCompanyProcess(companyId, {
        statutsValidatedByClient: true,
        statutsRejectedByClient: false,
      });
    }
    if (currentUser) {
      addNotification({
        userId: currentUser.id,
        title: 'Statuts validés',
        message: `Vous avez validé les statuts V${statuts.version}. Veuillez choisir votre mode de signature.`,
        type: 'success',
        read: false,
      });
    }
  };

  const handleRejectStatuts = () => {
    if (!statutsRejectionReason.trim()) {
      toast.error('Motif requis', { description: 'Veuillez indiquer les motifs de rejet' });
      return;
    }

    if (companyId) {
      updateCompanyProcess(companyId, {
        statutsRejectedByClient: true,
        statutsValidatedByClient: false,
        clientRejectionReason: statutsRejectionReason,
      });
    }
    setShowRejectionForm(false);
    setStatutsRejectionReason('');
    
    if (currentUser) {
      addNotification({
        userId: currentUser.id,
        title: 'Statuts rejetés',
        message: `Votre demande de correction des statuts (version ${statuts.version}) est transmise à Crésus.`,
        type: 'info',
        read: false,
      });
    }

    // La version corrigée viendra de l'administration, prévenue par la
    // notification ci-dessus.
  };

  /**
   * Crée le dossier côté administration, une fois les pièces fournies.
   *
   * Il naissait à la toute dernière étape, après la signature : pendant les
   * étapes 5 à 8, le client n'avait personne en face de lui, d'où les statuts
   * fabriqués par une minuterie. Créé ici, le dossier est examinable pendant
   * que le client poursuit.
   */
  const creerDossier = (): string | null => {
    if (!currentUser || companyId) return companyId;

    const societe = addCompany({
      name: formData.name,
      legalForm: formData.legalForm,
      activity: formData.activity,
      capital: getCapitalNumber(),
      address: formData.address,
      clientId: currentUser.id,
      userId: currentUser.id,
      status: 'submitted',
      // Le dossier entre au debut du workflow d'administration, qui a sa propre
      // numerotation (Dossier soumis, Examen, Devis...) : y reporter l'etape du
      // tunnel client marquerait toutes les etapes admin comme terminees.
      currentStep: 1,
      useHonorDeclaration,
      shareholders: associates,
      // Les pièces téléversées suivent le dossier : sans elles, l'administration
      // n'avait rien à examiner à sa première étape.
      documents: toDocumentsSoumis(uploadedFiles),
    });
    setCompanyId(societe.id);
    return societe.id;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!currentUser) return;

    // Le dossier existe depuis l'étape 4 : la soumission finale enregistre la
    // signature plutôt que de créer une seconde société.
    const id = companyId ?? creerDossier();
    if (id) {
      updateCompanyStatus(id, 'signed');
      if (signatureChoice === 'online') {
        updateCompanyProcess(id, {
          onlineSignatureCompleted: true,
          signedDocuments: documentsToSign.map(d => d.name),
        });
      }
    }

    // Le dossier est soumis : le brouillon correspondant n'a plus lieu d'etre.
    if (idBrouillon) deleteDraft(currentUser.id, idBrouillon);

    addNotification({
      userId: currentUser.id,
      title: 'Dossier complet soumis',
      message: `${formData.name} - Votre dossier est complet. Crésus finalise votre création d'entreprise.`,
      type: 'success',
      read: false,
    });
  };

  // Fonction pour sauvegarder le brouillon
  /**
   * Enregistrement du brouillon.
   *
   * Il n'avait lieu que sur « Enregistrer et quitter ». Un dossier créé à
   * l'étape 4 puis abandonné restait donc visible dans « Mes sociétés »
   * sans qu'aucun chemin ne ramène au tunnel pour valider le devis, verser
   * le capital ou signer.
   */
  const enregistrerBrouillon = () => {
    if (!currentUser) return undefined;
    const id = saveDraft(currentUser.id, {
      id: idBrouillon,
      userId: currentUser.id,
      formData,
      associates,
      uploadedFiles,
      currentStep,
      selectedPaymentMethod,
      phoneNumber,
      signedDocs,
      liberationType,
      liberationMethod,
      liberationValue,
      paymentCompleted,
      // Avancement du dossier : sans lui, la reprise repartait d'un devis à
      // établir et d'un mode de signature oublié.
      comanagement,
      useHonorDeclaration,
      devisStatus,
      quote: {
        status: quote.status,
        validatedAt: quote.validatedAt,
        rejectionReason: quote.rejectionReason,
      },
      companyId: companyId ?? undefined,
      signatureChoice,
      appointment: {
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        status: appointmentStatus,
      },
    });
    if (id !== idBrouillon) setIdBrouillon(id);
    return id;
  };

  const handleSaveAndQuit = () => {
    if (!currentUser) {
      onBack();
      return;
    }

    enregistrerBrouillon();

    addNotification({
      userId: currentUser.id,
      title: 'Brouillon enregistré',
      message: 'Votre progression a été enregistrée. Vous pouvez reprendre plus tard.',
      type: 'success',
      read: false,
    });

    onBack();
  };

  // Signature functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    ctx.lineJoin = 'round';
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
    if (selectedDocToSign && !signedDocs.includes(selectedDocToSign)) {
      setSignedDocs([...signedDocs, selectedDocToSign]);
      if (currentUser) {
        addNotification({
          userId: currentUser.id,
          title: 'Document signé',
          message: `${documentsToSign.find(d => d.id === selectedDocToSign)?.name} a été signé avec succès.`,
          type: 'success',
          read: false,
        });
      }
    }
    setShowSignatureModal(false);
    setSelectedDocToSign(null);
    clearSignature();
  };

  const handleSignClick = (docId: string) => {
    if (!signedDocs.includes(docId)) {
      setSelectedDocToSign(docId);
      setShowSignatureModal(true);
    }
  };

  // Gestion des associés
  const addAssociate = () => {
    const newId = (Math.max(...associates.map(a => parseInt(a.id))) + 1).toString();
    setAssociates([...associates, { 
      id: newId, 
      firstName: '', 
      lastName: '', 
      percentage: '', 
      amount: '',
      address: '',
      profession: '',
      phone: '',
      email: '',
      isManager: false,
      maritalStatus: '' as any, // Chaîne vide pour input contrôlé mais non sélectionné
      matrimonialRegime: undefined,
      spouseInfo: undefined
    }]);
  };

  const removeAssociate = (id: string) => {
    if (associates.length > currentLegalFormInfo.associesMin) {
      setAssociates(associates.filter(a => a.id !== id));
    } else {
      toast.error('Impossible de retirer', { description: `Une ${formData.legalForm} doit avoir au minimum ${currentLegalFormInfo.associesMin} associé(s)` });
    }
  };

  const updateAssociate = (id: string, field: keyof Associate, value: string | boolean | undefined | Associate['spouseInfo']) => {
    setAssociates(associates.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: value };
        
        // Auto-calcul si on change le pourcentage
        if (field === 'percentage' && typeof value === 'string' && value && formData.capital) {
          const percentage = parseFloat(value) || 0;
          const capitalNum = parseFloat(formData.capital.replace(/\s/g, '')) || 0;
          updated.amount = formatAmountInput(String(Math.round((capitalNum * percentage) / 100)));
        }
        
        // Auto-calcul si on change le montant
        if (field === 'amount' && typeof value === 'string' && value && formData.capital) {
          const amount = parseFloat(value.replace(/\s/g, '')) || 0;
          const capitalNum = parseFloat(formData.capital.replace(/\s/g, '')) || 0;
          if (capitalNum > 0) {
            updated.percentage = ((amount / capitalNum) * 100).toFixed(2);
          }
        }
        
        return updated;
      }
      return a;
    }));
  };

  const getTotalPercentage = () => {
    return associates.reduce((sum, a) => sum + (parseFloat(a.percentage) || 0), 0);
  };

  const getTotalAmount = () => {
    return associates.reduce((sum, a) => sum + (parseFloat(a.amount.replace(/\s/g, '')) || 0), 0);
  };

  // Écran de succès final
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto min-h-[600px] flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center w-full"
        >
          <h2 className="text-[#1A2753] mb-3">Création d&apos;entreprise finalisée !</h2>
          <p className="text-[#273A7A]/80 mb-8 max-w-md mx-auto">
            Votre dossier complet a été soumis. Crésus finalise votre création d&apos;entreprise.
          </p>

          <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
            <h3 className="text-[#1A2753] mb-4">Récapitulatif</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#F5F6FA]">
                <span className="text-[#273A7A]/80 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Entreprise
                </span>
                <span className="text-[#1A2753]">{formData.name}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F5F6FA]">
                <span className="text-[#273A7A]/80 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Forme juridique
                </span>
                <span className="text-[#1A2753]">{formData.legalForm}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F5F6FA]">
                <span className="text-[#273A7A]/80 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Associés
                </span>
                <span className="text-[#1A2753]">{associates.length}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F5F6FA]">
                <span className="text-[#273A7A]/80 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Capital social
                </span>
                <span className="text-[#1A2753]">
                  {getCapitalNumber().toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F5F6FA]">
                <span className="text-[#273A7A]/80 text-sm">
                  Capital libéré
                </span>
                <span className="text-green-600 flex items-center gap-1 text-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  {getLiberatedAmount().toLocaleString()} FCFA
                </span>
              </div>
              {liberationType === 'partial' && (
                <div className="flex items-center justify-between pb-3 border-b border-[#F5F6FA]">
                  <span className="text-[#273A7A]/80 text-sm">
                    Solde à libérer
                  </span>
                  <span className="text-[#273A7A] text-sm">
                    {getRemainingAmount().toLocaleString()} FCFA
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[#273A7A]/80 flex items-center gap-2">
                  <Pen className="w-4 h-4" />
                  Signature
                </span>
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {signatureChoice === 'appointment'
                    ? 'Au rendez-vous'
                    : `${signedDocs.length}/${documentsToSign.length} document${documentsToSign.length > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#D6A93A]/10 border border-[#D6A93A]/30 rounded-xl p-4 mb-8">
            <p className="text-[#1A2753] text-sm">
              Vous recevrez une notification WhatsApp dans les prochaines heures
            </p>
          </div>

          <button
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Retour au tableau de bord
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button aria-label="Retour"
          onClick={onBack}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-white/80 transition-all duration-300 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
        </button>
        <div>
          <h1 className="text-[#1A2753]">Création d&apos;entreprise</h1>
          <p className="text-[#273A7A]/80">Étape {currentStep} sur {steps.length}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            
            return (
              <div key={step.id} className="contents">
                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' :
                    isActive ? 'bg-gradient-to-br from-[#D6A93A] to-[#D6A93A]/80' :
                    'bg-[#F5F6FA]'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-7 h-7 text-white" />
                    ) : (
                      <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-[#273A7A]/40'}`} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm ${isActive ? 'text-[#1A2753]' : 'text-[#273A7A]/80'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-4 rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-green-500' : 'bg-[#F5F6FA]'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl p-8 shadow-sm min-h-[500px]">
        {/* Pas d'AnimatePresence ici : l'etape sortante est demontee
            immediatement et l'entrante montee avec sa seule animation d'entree.
            Faire dependre l'affichage d'une animation de sortie rendait le
            tunnel inaccessible des que celle-ci ne se terminait pas. */}
        <motion.div
          key={currentStep}
          initial={{ x: 16 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* ÉTAPE 1: Informations entreprise */}
          {currentStep === 1 && (
            <motion.div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#1A2753]">Informations générales</h2>
                <div className="flex items-center gap-2 text-[#D6A93A]">
                  <Building2 className="w-5 h-5" />
                  <span className="text-sm">Étape {currentStep}/{steps.length}</span>
                </div>
              </div>

              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    id="company-name"
                    label="Nom de l'entreprise"
                    required
                    value={formData.name}
                    onChange={value => updateField('name', value)}
                    error={fieldErrors.name}
                    placeholder="Ex: Teranga Digital SARL"
                    inputRef={el => { fieldRefs.current.name = el; }}
                  />
                  <p className="text-xs text-[#273A7A]/80 mt-1">
                    Le nom doit être unique et refléter votre activité
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[#1A2753] flex items-center gap-2">
                      Forme juridique
                      <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLegalFormInfo(!showLegalFormInfo)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-2 px-3 py-1 bg-[#D6A93A]/10 text-[#D6A93A] rounded-lg hover:bg-[#D6A93A]/20 transition-all duration-300"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span className="text-sm">Aide au choix</span>
                    </button>
                  </div>
                  <select
                    value={formData.legalForm}
                    onChange={(e) => {
                      setFormData({ ...formData, legalForm: e.target.value });
                      // Désactiver la cogérance pour SUARL
                      if (e.target.value === 'SUARL' && comanagement) {
                        setComanagement(false);
                      }
                      // Ajuster le nombre d'associés selon la forme
                      const newFormInfo = legalFormInfo[e.target.value];
                      if (newFormInfo.associesMax === 1 && associates.length > 1) {
                        setAssociates([associates[0]]);
                      } else if (associates.length < newFormInfo.associesMin) {
                        const toAdd = newFormInfo.associesMin - associates.length;
                        const newAssociates = [...associates];
                        for (let i = 0; i < toAdd; i++) {
                          const newId = (Math.max(...newAssociates.map(a => parseInt(a.id))) + 1).toString();
                          newAssociates.push({ id: newId, firstName: '', lastName: '', percentage: '', amount: '' });
                        }
                        setAssociates(newAssociates);
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#F5F6FA] border border-transparent rounded-xl focus:outline-none focus:border-[#D6A93A] transition-all duration-300"
                  >
                    <option value="SARL">SARL</option>
                    <option value="SUARL">SUARL</option>
                    <option value="SA">SA</option>
                    <option value="SAS">SAS</option>
                    <option value="SASU">SASU</option>
                    <option value="SNC">SNC</option>
                    <option value="SCI">SCI</option>
                  </select>
                  <div className="mt-2 p-3 bg-[#D6A93A]/5 rounded-lg">
                    <p className="text-xs text-[#273A7A]">
                      <Info className="w-3 h-3 inline mr-1" />
                      {currentLegalFormInfo.recommandation}
                    </p>
                  </div>
                </div>

                <div>
                  <FormField
                    id="company-capital"
                    label="Capital social (FCFA)"
                    required
                    inputMode="numeric"
                    value={formData.capital}
                    onChange={value => updateField('capital', formatAmountInput(value))}
                    error={fieldErrors.capital}
                    placeholder="1 000 000"
                    inputRef={el => { fieldRefs.current.capital = el; }}
                  />
                  <div className="mt-2 flex items-start gap-2">
                    {isCapitalValid() ? (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="w-3 h-3" />
                        Capital valide
                      </div>
                    ) : (
                      <div className="flex items-start gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>Minimum {currentLegalFormInfo.capitalMin.toLocaleString()} FCFA pour une {formData.legalForm}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <FormField
                    id="company-activity"
                    label="Activité principale"
                    required
                    value={formData.activity}
                    onChange={value => updateField('activity', value)}
                    error={fieldErrors.activity}
                    placeholder="Ex: Services numériques"
                    inputRef={el => { fieldRefs.current.activity = el; }}
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    id="company-address"
                    label="Adresse du siège social"
                    required
                    value={formData.address}
                    onChange={value => updateField('address', value)}
                    error={fieldErrors.address}
                    placeholder="Ex: Rue 10, Plateau, Dakar"
                    inputRef={el => { fieldRefs.current.address = el; }}
                  />
                  <p className="text-xs text-[#273A7A]/80 mt-1">
                    Vous pouvez utiliser notre service de domiciliation à l&apos;étape suivante
                  </p>
                </div>
              </div>

              {/* Info box forme juridique */}
              <AnimatePresence>
                {showLegalFormInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-2xl p-6 text-white">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="mb-2">{currentLegalFormInfo.name}</h3>
                          <p className="text-white/80 text-sm">{currentLegalFormInfo.description}</p>
                        </div>
                        <button aria-label="Fermer"
                          onClick={() => setShowLegalFormInfo(false)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] text-white/60 hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white/10 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-[#D6A93A]" />
                            <p className="text-sm text-white/70">Capital minimum</p>
                          </div>
                          <p>{currentLegalFormInfo.capital}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-[#D6A93A]" />
                            <p className="text-sm text-white/70">Nombre d&apos;associés</p>
                          </div>
                          <p>{currentLegalFormInfo.associes}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <p>Avantages</p>
                          </div>
                          <ul className="space-y-2">
                            {currentLegalFormInfo.avantages.map((avantage, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                                <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>{avantage}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <p>Points d&apos;attention</p>
                          </div>
                          <ul className="space-y-2">
                            {currentLegalFormInfo.inconvenients.map((inconvenient, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                                <span className="text-red-400 flex-shrink-0">•</span>
                                <span>{inconvenient}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ÉTAPE 2: Répartition du capital */}
          {(currentStep === 2 || currentStep === 3) && (
            <motion.div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[#1A2753] mb-2">
                    {currentStep === 2 ? 'Répartition du capital' : 'Coordonnées des associés'}
                  </h2>
                  <p className="text-[#273A7A]/80 text-sm">
                    {currentStep === 2
                      ? 'Définissez la répartition des parts entre les associés'
                      : 'Renseignez les informations de chaque associé'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#D6A93A]">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Étape {currentStep}/{steps.length}</span>
                </div>
              </div>

              {/* Affichage des erreurs */}
              {currentStep === 2 && errors.step2 && errors.step2.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-red-800 font-medium mb-2">Informations incomplètes</h3>
                      <ul className="space-y-1">
                        {errors.step2.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Info associés requis : la regle porte sur la composition, donc sur
                  l'etape 2 ; a l'etape 3 les associes sont deja arretes. */}
              {currentStep === 2 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-900 text-sm mb-1">
                      Une <strong>{formData.legalForm}</strong> requiert {currentLegalFormInfo.associes.toLowerCase()}
                    </p>
                    <p className="text-blue-700 text-xs">
                      Vous avez actuellement {associates.length} associé{associates.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              )}

              <div className="bg-white rounded-2xl border-2 border-[#F5F6FA] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D6A93A]" />
                    <h3 className="text-[#1A2753]">Associés</h3>
                  </div>
                  {currentStep === 2 && (currentLegalFormInfo.associesMax === null || associates.length < currentLegalFormInfo.associesMax) && (
                    <button
                      type="button"
                      onClick={addAssociate}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-2 px-4 py-2 bg-[#D6A93A] text-white rounded-xl hover:bg-[#D6A93A]/80 transition-all duration-300"
                    >
                      <UserPlus className="w-4 h-4" />
                      Ajouter un associé
                    </button>
                  )}
                </div>

                {/* Cogerance : releve de la repartition, pas des coordonnees. */}
                {currentStep === 2 && formData.legalForm !== 'SUARL' && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-[#273A7A]/5 to-[#D6A93A]/5 rounded-xl border-2 border-[#D6A93A]/20">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={comanagement}
                        onChange={(e) => {
                          setComanagement(e.target.checked);
                          // Si désactivation de la cogérance, garder seulement le premier gérant
                          if (!e.target.checked) {
                            const firstManagerId = associates.find(a => a.isManager)?.id;
                            setAssociates(associates.map(a => ({
                              ...a,
                              isManager: a.id === firstManagerId
                            })));
                          }
                        }}
                        className="w-5 h-5 text-[#D6A93A] rounded focus:ring-[#D6A93A]"
                      />
                      <div className="flex-1">
                        <span className="text-[#1A2753] font-medium">Activer la cogérance</span>
                        <p className="text-xs text-[#273A7A]/80 mt-1">
                          {comanagement 
                            ? "Vous pouvez désigner plusieurs gérants" 
                            : "Un seul gérant peut être désigné"}
                        </p>
                      </div>
                      {comanagement && (
                        <span className="px-3 py-1 bg-[#D6A93A] text-white text-xs rounded-full">
                          Activé
                        </span>
                      )}
                    </label>
                  </div>
                )}

                <div className="space-y-4">
                  {associates.map((associate, index) => (
                    <motion.div
                      key={associate.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#F5F6FA] rounded-xl p-5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#D6A93A] to-[#b8902f] rounded-full flex items-center justify-center text-white">
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-[#273A7A]">Associé {index + 1}</h4>
                            {associate.isManager && (
                              <span className="px-3 py-1 bg-[#D6A93A] text-white text-xs rounded-full">
                                {comanagement ? 'Co-gérant' : 'Gérant'}
                              </span>
                            )}
                          </div>
                        </div>
                        {associates.length > currentLegalFormInfo.associesMin && (
                          <button
                            type="button"
                            onClick={() => removeAssociate(associate.id)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                            Retirer
                          </button>
                        )}
                      </div>

                      {/* Etape 2 : qui participe et pour combien. */}
                      {currentStep === 2 && (
                        <>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm text-[#273A7A]/80 mb-2">
                            Prénom <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={associate.firstName || ''}
                            onChange={(e) => updateAssociate(associate.id, 'firstName', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-transparent rounded-lg focus:outline-none focus:border-[#D6A93A] transition-all duration-300"
                            placeholder="Amadou"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#273A7A]/80 mb-2">
                            Nom <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={associate.lastName || ''}
                            onChange={(e) => updateAssociate(associate.id, 'lastName', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-transparent rounded-lg focus:outline-none focus:border-[#D6A93A] transition-all duration-300"
                            placeholder="Diallo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#273A7A]/80 mb-2">
                            Parts (%) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={associate.percentage || ''}
                            onChange={(e) => updateAssociate(associate.id, 'percentage', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-transparent rounded-lg focus:outline-none focus:border-[#D6A93A] transition-all duration-300"
                            placeholder="25.00"
                            step="0.01"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#273A7A]/80 mb-2">
                            Montant (FCFA) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={associate.amount || ''}
                            onChange={(e) => updateAssociate(associate.id, 'amount', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-transparent rounded-lg focus:outline-none focus:border-[#D6A93A] transition-all duration-300"
                            placeholder="250 000"
                          />
                        </div>
                      </div>

                        </>
                      )}

                      {/* Etape 3 : coordonnees administratives de chaque associe. */}
                      {currentStep === 3 && (
                        <>
                      {/* Une adresse tient mal sur une demi-largeur : elle occupe la ligne. */}
                      <div className="mt-4">
                        <label className="block text-sm text-[#273A7A]/80 mb-2">
                          Adresse personnelle <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={associate.address || ''}
                          onChange={(e) => updateAssociate(associate.id, 'address', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-transparent rounded-lg focus:outline-none focus:border-[#D6A93A] transition-all duration-300"
                          placeholder="Ex: Cité Keur Gorgui, Dakar"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm text-[#273A7A]/80 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={associate.email || ''}
                            onChange={(e) => updateAssociate(associate.id, 'email', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-transparent rounded-lg focus:outline-none focus:border-[#D6A93A] transition-all duration-300"
                            placeholder="email@exemple.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#273A7A]/80 mb-2">
                            Téléphone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={associate.phone || ''}
                            onChange={(e) => updateAssociate(associate.id, 'phone', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-transparent rounded-lg focus:outline-none focus:border-[#D6A93A] transition-all duration-300"
                            placeholder="+221 77 123 45 67"
                          />
                        </div>
                      </div>

                        </>
                      )}

                      {/* Le gérant se désigne au moment de la répartition. */}
                      {currentStep === 2 && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-[#D6A93A]/20">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={associate.isManager}
                            onChange={(e) => {
                              if (comanagement) {
                                // En mode cogérance, permettre plusieurs gérants
                                updateAssociate(associate.id, 'isManager', e.target.checked);
                              } else {
                                // En mode normal, s'assurer qu'un seul gérant est sélectionné
                                if (e.target.checked) {
                                  setAssociates(associates.map(a => ({
                                    ...a,
                                    isManager: a.id === associate.id
                                  })));
                                } else {
                                  updateAssociate(associate.id, 'isManager', false);
                                }
                              }
                            }}
                            className="w-5 h-5 text-[#D6A93A] rounded focus:ring-[#D6A93A]"
                          />
                          <span className="text-sm text-[#273A7A]">
                            Désigner comme {comanagement ? 'Co-gérant' : 'Gérant'}{formData.legalForm === 'SA' ? ' / Président' : ''}
                            {associate.isManager && (
                              <span className="ml-2 text-xs text-[#D6A93A]">(Téléphone obligatoire)</span>
                            )}
                          </span>
                        </label>
                      </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Récapitulatif : sans objet à l'étape des coordonnées. */}
                {currentStep === 2 && (
                <div className={`mt-6 p-5 rounded-xl border-2 transition-all duration-300 ${
                  isCapitalDistributionValid() 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-amber-50 border-amber-500'
                }`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#273A7A]/80 mb-1">Total des parts</p>
                      <p className={`text-2xl ${
                        Math.abs(getTotalPercentage() - 100) < 0.01 ? 'text-green-700' : 'text-amber-700'
                      }`}>
                        {getTotalPercentage().toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#273A7A]/80 mb-1">Total du capital</p>
                      <p className={`text-2xl ${
                        Math.abs(getTotalAmount() - getCapitalNumber()) < 1 
                          ? 'text-green-700' 
                          : 'text-amber-700'
                      }`}>
                        {getTotalAmount().toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                  {!isCapitalDistributionValid() && (
                    <div className="mt-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">
                        Le total des parts doit être de 100% et le total des montants doit correspondre exactement au capital social ({getCapitalNumber().toLocaleString()} FCFA)
                      </p>
                    </div>
                  )}
                  {isCapitalDistributionValid() && (
                    <div className="mt-3 flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700">
                        La répartition du capital est correcte
                      </p>
                    </div>
                  )}
                </div>
                )}

                {/* Info Gérant */}
                {associates.some(a => a.isManager) && (
                  <div className="mt-4 p-4 bg-[#D6A93A]/10 rounded-xl border border-[#D6A93A]/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#D6A93A] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#273A7A]">
                          <span className="font-medium">Gérant désigné :</span> {associates.find(a => a.isManager)?.firstName} {associates.find(a => a.isManager)?.lastName}
                        </p>
                        {associates.find(a => a.isManager)?.phone && (
                          <p className="text-sm text-[#273A7A]/80 mt-1">
                            {associates.find(a => a.isManager)?.phone}
                          </p>
                        )}
                        {associates.find(a => a.isManager)?.email && (
                          <p className="text-sm text-[#273A7A]/80 mt-1">
                            {associates.find(a => a.isManager)?.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Le gerant se designe a l'etape 2, avec la repartition. */}
                {currentStep === 2 && !associates.some(a => a.isManager) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">
                        Vous pouvez désigner un Gérant ou Président parmi les associés (optionnel)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 4: Documents */}
          {currentStep === 4 && (
            <motion.div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[#1A2753] mb-2">Documents requis</h2>
                  <p className="text-[#273A7A]/80 text-sm">
                    Téléversez les documents nécessaires pour votre {formData.legalForm}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#D6A93A]">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">Étape {currentStep}/{steps.length}</span>
                </div>
              </div>

              {/* Affichage des erreurs */}
              {errors.step4 && errors.step4.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-red-800 font-medium mb-2">Documents incomplets</h3>
                      <ul className="space-y-1">
                        {errors.step4.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-900 text-sm mb-1">
                      Les documents doivent être au format PDF ou image (JPG, PNG) et ne pas dépasser 5 Mo.
                    </p>
                    <p className="text-blue-700 text-xs">
                      Vous pouvez téléverser plusieurs fichiers par document si nécessaire. Chaque document sera validé par notre équipe.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option déclaration sur l'honneur */}
              <div className="bg-white border-2 border-[#273A7A]/20 rounded-xl p-5 mb-6">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useHonorDeclaration}
                    onChange={(e) => {
                      setUseHonorDeclaration(e.target.checked);
                      // Si on coche la déclaration sur l'honneur, supprimer les fichiers du casier
                      if (e.target.checked && uploadedFiles['casier']) {
                        const newFiles = { ...uploadedFiles };
                        delete newFiles['casier'];
                        setUploadedFiles(newFiles);
                      }
                    }}
                    className="mt-1 w-5 h-5 text-[#D6A93A] rounded focus:ring-2 focus:ring-[#D6A93A]"
                  />
                  <div className="flex-1">
                    <p className="text-[#1A2753] mb-2">
                      Je ne dispose pas de casier judiciaire
                    </p>
                    <p className="text-[#273A7A]/80 text-sm">
                      En cochant cette case, une <strong>déclaration sur l&apos;honneur</strong> sera générée et devra être signée avec les statuts. Cette déclaration attestant que vous n&apos;avez pas de casier judiciaire sera soumise par l&apos;administrateur lors de l&apos;envoi des statuts.
                    </p>
                  </div>
                </label>
              </div>

              {/* Déclaration sur l'honneur - État client */}
              {useHonorDeclaration && (
                <ClientHonorDeclarationStep
                  companyData={{
                    name: formData.name,
                    legalForm: formData.legalForm,
                    address: formData.address,
                  }}
                  clientData={{
                    firstName: currentUser?.firstName || '',
                    lastName: currentUser?.lastName || '',
                    address: formData.address,
                  }}
                  declarationSent={processus.honorDeclarationSent}
                  declarationSigned={honorDeclarationSigned}
                  onSign={handleSignHonorDeclaration}
                />
              )}
              
              <div className="space-y-4">
                {getRequiredDocuments().filter(doc => {
                  // Ne pas afficher le casier judiciaire si déclaration sur l'honneur est cochée
                  if (doc.id === 'casier' && useHonorDeclaration) {
                    return false;
                  }
                  return true;
                }).map((doc) => (
                  <DocumentUploadManager
                    key={doc.id}
                    documentType={doc}
                    onFilesChange={(files) => {
                      setUploadedFiles(prev => ({
                        ...prev,
                        [doc.id]: files
                      }));
                    }}
                    companyId={formData.name}
                  />
                ))}
              </div>

              {/* Progression */}
              <div className="bg-white border-2 border-[#F5F6FA] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#273A7A]/80 text-sm">Progression</span>
                  <span className="text-[#1A2753]">
                    {Object.values(uploadedFiles).filter(files => files && files.length > 0).length}/{getRequiredDocuments().length} catégories complétées
                  </span>
                </div>
                <div className="h-2 bg-[#F5F6FA] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(Object.values(uploadedFiles).filter(files => files && files.length > 0).length / getRequiredDocuments().length) * 100}%` 
                    }}
                    className="h-full bg-gradient-to-r from-[#D6A93A] to-[#b8902f] transition-all duration-500"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[#273A7A]/80">
                    {Object.values(uploadedFiles).flat().filter(doc => doc?.status === 'validated').length} documents validés
                  </span>
                  <span className="text-[#273A7A]/80">
                    {Object.values(uploadedFiles).flat().filter(doc => doc?.status === 'awaiting_validation').length} en attente
                  </span>
                  <span className="text-[#273A7A]/80">
                    {Object.values(uploadedFiles).flat().filter(doc => doc?.status === 'rejected').length} rejetés
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 5: Validation devis */}
          {currentStep === 5 && (
            <motion.div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[#1A2753] mb-2">Validation du devis</h2>
                  <p className="text-[#273A7A]/80 text-sm">
                    Consultez et validez le devis d'immatriculation de votre société
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#D6A93A]">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm">Étape {currentStep}/{steps.length}</span>
                </div>
              </div>

              {/* Écran d'attente si le devis n'a pas encore été créé */}
              {devisStatus === 'waiting' && (
                <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-2xl shadow-sm">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D6A93A]/20 to-[#273A7A]/20 flex items-center justify-center mb-6 animate-pulse">
                    <DollarSign className="w-12 h-12 text-[#D6A93A]" />
                  </div>
                  
                  <h3 className="text-[#1A2753] text-2xl text-center mb-3">
                    Devis en cours d'établissement
                  </h3>
                  
                  <p className="text-[#273A7A]/80 text-center text-sm mb-8 max-w-2xl">
                    Votre dossier a été soumis avec succès. Un administrateur est en train d'établir un devis personnalisé pour les frais d'immatriculation de votre société.
                  </p>

                  <div className="bg-gradient-to-br from-[#D6A93A]/10 to-[#273A7A]/10 rounded-2xl p-8 border-2 border-[#D6A93A]/30 max-w-2xl w-full">
                    <div className="flex items-start gap-4 mb-6">
                      <Info className="w-6 h-6 text-[#D6A93A] flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-[#1A2753] mb-3">
                          <strong>Prochaines étapes :</strong>
                        </p>
                        <ul className="text-[#273A7A]/80 text-sm space-y-3">
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Un devis détaillé sera établi par l'administrateur</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Vous recevrez une notification dès que le devis sera disponible</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Vous pourrez alors valider le devis et poursuivre la création</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>


                </div>
              )}

              {/* Affichage du devis une fois créé */}
              {devisStatus === 'created' && (
                <ClientQuoteValidationStep
                  companyData={{
                    name: formData.name,
                    legalForm: formData.legalForm,
                    capital: getCapitalNumber(),
                  }}
                  quote={{
                    registrationFees: quote.registrationFees,
                    legalFees: quote.legalFees,
                    publicationFees: quote.publicationFees,
                    stampDuty: quote.stampDuty,
                    adminFees: quote.adminFees,
                    notes: quote.notes,
                    status: quote.status,
                  }}
                  onValidate={handleValidateQuote}
                  onReject={handleRejectQuote}
                />
              )}

              {/* État civil des associés : demandé ici plutôt qu'à la saisie des
                  associés, où il barrait l'accès au devis. Le temps d'attente du
                  devis est mis à profit. */}
              <div className="bg-white rounded-2xl border-2 border-[#F5F6FA] p-6">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5 text-[#D6A93A]" />
                  <h3 className="text-[#1A2753]">Informations pour les statuts</h3>
                </div>
                <p className="text-sm text-[#273A7A]/80 mb-6">
                  Ces mentions figureront dans vos statuts. Elles sont nécessaires avant le
                  versement du capital.
                </p>

                <div className="space-y-6">
                  {associates.map((associate, index) => (
                    <div key={associate.id} className="bg-[#F5F6FA] rounded-xl p-4">
                      <p className="text-[#1A2753] mb-4">
                        {[associate.firstName, associate.lastName].filter(Boolean).join(' ') || `Associé ${index + 1}`}
                      </p>
                      <WebAssociateStatutsFields
                        associate={associate}
                        onChange={(patch) => setAssociates(prev => prev.map(a => (a.id === associate.id ? { ...a, ...patch } : a)))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 6: Versement du capital */}
          {currentStep === 6 && (
            <motion.div className="space-y-6">
              {paymentCompleted ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  <h3 className="text-[#1A2753] text-2xl mb-3">Paiement réussi !</h3>
                  <p className="text-[#273A7A]/80 mb-4">
                    Votre dépôt de capital de <strong>{getLiberatedAmount().toLocaleString()} FCFA</strong> a été validé.
                  </p>
                  {liberationType === 'partial' && (
                    <p className="text-[#273A7A]/80 text-sm">
                      Solde restant: {getRemainingAmount().toLocaleString()} FCFA
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* Type de libération */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5F6FA]">
                    <label className="block text-[#1A2753] text-lg mb-4">Type de libération</label>
                    
                    {/* Message d'information pour les SA */}
                    {formData.legalForm === 'SA' && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-blue-900 font-medium mb-1">
                            Restriction SA
                          </p>
                          <p className="text-blue-700">
                            Pour une SA, vous devez libérer au minimum <strong>25% du capital social</strong> soit {Math.ceil(getCapitalNumber() * 0.25).toLocaleString()} FCFA.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setLiberationType('total')}
                        className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-6 rounded-xl border-2 transition-all duration-300 ${liberationType === 'total'
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10'
                          : 'border-gray-200 hover:border-[#D6A93A]/50'
                        }`}
                      >
                        <div className="text-left">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[#1A2753] font-medium">Libération totale</p>
                            {liberationType === 'total' && (
                              <CheckCircle2 className="w-6 h-6 text-[#D6A93A]" />
                            )}
                          </div>
                          <p className="text-[#273A7A]/80 text-sm">Versement intégral du capital</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setLiberationType('partial')}
                        className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-6 rounded-xl border-2 transition-all duration-300 ${liberationType === 'partial'
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10'
                          : 'border-gray-200 hover:border-[#D6A93A]/50'
                        }`}
                      >
                        <div className="text-left">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[#1A2753] font-medium">Libération partielle</p>
                            {liberationType === 'partial' && (
                              <CheckCircle2 className="w-6 h-6 text-[#D6A93A]" />
                            )}
                          </div>
                          <p className="text-[#273A7A]/80 text-sm">Versement d&apos;une partie du capital</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Libération partielle - Choix du mode */}
                  {liberationType === 'partial' && (
                    <>
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5F6FA]">
                        <label className="block text-[#1A2753] text-lg mb-4">Mode de calcul</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <button
                            onClick={() => setLiberationMethod('percentage')}
                            className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 py-3 px-4 rounded-lg border-2 transition-all duration-300 ${
                              liberationMethod === 'percentage'
                                ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                                : 'border-gray-200 text-[#273A7A]/80 hover:border-[#D6A93A]/50'
                            }`}
                          >
                            Pourcentage
                          </button>
                          <button
                            onClick={() => setLiberationMethod('amount')}
                            className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 py-3 px-4 rounded-lg border-2 transition-all duration-300 ${
                              liberationMethod === 'amount'
                                ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                                : 'border-gray-200 text-[#273A7A]/80 hover:border-[#D6A93A]/50'
                            }`}
                          >
                            Montant fixe
                          </button>
                        </div>

                        {/* Boutons rapides pour SA et SARL */}
                        {(formData.legalForm === 'SA' || formData.legalForm === 'SARL') && (
                          <div className="space-y-2">
                            <label className="block text-[#273A7A]/80 text-sm">
                              Libération rapide
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setLiberationMethod('percentage');
                                  setLiberationValue('25');
                                }}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 py-2.5 px-3 rounded-lg border-2 border-[#273A7A]/20 bg-white text-[#273A7A] hover:border-[#D6A93A] hover:bg-[#D6A93A]/5 transition-all duration-300 text-sm font-medium"
                              >
                                Le quart (25%)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setLiberationMethod('percentage');
                                  setLiberationValue('50');
                                }}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 py-2.5 px-3 rounded-lg border-2 border-[#273A7A]/20 bg-white text-[#273A7A] hover:border-[#D6A93A] hover:bg-[#D6A93A]/5 transition-all duration-300 text-sm font-medium"
                              >
                                La moitié (50%)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setLiberationMethod('percentage');
                                  setLiberationValue('100');
                                }}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 py-2.5 px-3 rounded-lg border-2 border-[#D6A93A]/40 bg-[#D6A93A]/5 text-[#1A2753] hover:border-[#D6A93A] hover:bg-[#D6A93A]/10 transition-all duration-300 text-sm font-medium"
                              >
                                Totalité (100%)
                              </button>
                            </div>
                          </div>
                        )}

                        {liberationMethod === 'percentage' ? (
                          <div>
                            <label className="block text-[#273A7A]/80 text-sm mb-2">
                              Pourcentage à libérer (%)
                            </label>
                            <input
                              type="number"
                              value={liberationValue}
                              onChange={(e) => setLiberationValue(e.target.value)}
                              className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl outline-none focus:ring-2 focus:ring-[#D6A93A] transition-all duration-300"
                              placeholder={formData.legalForm === 'SA' ? "Min: 25" : "Ex: 25"}
                              min={formData.legalForm === 'SA' ? "25" : "1"}
                              max="99"
                            />
                            {formData.legalForm === 'SA' && liberationValue && parseFloat(liberationValue) < 25 && (
                              <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>
                                  Le pourcentage doit être d'au moins 25% pour une SA (minimum: {Math.ceil(getCapitalNumber() * 0.25).toLocaleString()} FCFA)
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[#273A7A]/80 text-sm mb-2">
                              Montant à libérer (FCFA)
                            </label>
                            <input
                              type="text"
                              value={liberationValue}
                              onChange={(e) => setLiberationValue(e.target.value)}
                              className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl outline-none focus:ring-2 focus:ring-[#D6A93A] transition-all duration-300"
                              placeholder="Ex: 250000"
                            />
                            {formData.legalForm === 'SA' && liberationValue && (
                              (() => {
                                const amount = parseFloat(liberationValue.replace(/\s/g, '')) || 0;
                                const minAmount = Math.ceil(getCapitalNumber() * 0.25);
                                return amount > 0 && amount < minAmount ? (
                                  <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <p>
                                      Le montant doit être d'au moins {minAmount.toLocaleString()} FCFA (25% du capital social) pour une SA
                                    </p>
                                  </div>
                                ) : null;
                              })()
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Résumé montant */}
                  <div className="bg-gradient-to-br from-[#D6A93A] to-[#b8902f] rounded-2xl p-6 shadow-lg">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-white/90 pb-3 border-b border-white/20">
                        <span>Capital social</span>
                        <span>{getCapitalNumber().toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex items-center justify-between text-white">
                        <span className="text-lg">Montant à libérer</span>
                        <span className="text-2xl">{getLiberatedAmount().toLocaleString()} FCFA</span>
                      </div>
                      {liberationType === 'partial' && (
                        <div className="flex items-center justify-between text-white/80 pt-3 border-t border-white/20">
                          <span>Solde restant</span>
                          <span>{getRemainingAmount().toLocaleString()} FCFA</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Numéro de téléphone */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5F6FA]">
                    <label className="block text-[#1A2753] text-lg mb-3">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl outline-none focus:ring-2 focus:ring-[#D6A93A] transition-all duration-300"
                      placeholder="Ex: 77 123 45 67"
                    />
                  </div>

                  {/* Méthodes de paiement */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5F6FA]">
                    <p className="text-[#1A2753] text-lg mb-4">Choisissez votre méthode de paiement</p>
                    <div className="grid gap-4">
                      {paymentMethods.map((method) => (
                        <motion.button
                          key={method.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-white rounded-xl p-4 border-2 transition-all duration-300 ${
                            selectedPaymentMethod === method.id
                              ? 'border-[#D6A93A] shadow-md'
                              : 'border-gray-200 hover:border-[#D6A93A]/50 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 ${method.bgColor} rounded-xl flex items-center justify-center border border-[#1A2753]/8`}>
                              <method.icon className="w-6 h-6 text-[#1A2753]" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-[#1A2753] font-medium">{method.name}</p>
                              <p className="text-[#273A7A]/80 text-sm">{method.description}</p>
                            </div>
                            {selectedPaymentMethod === method.id && (
                              <CheckCircle2 className="w-6 h-6 text-[#D6A93A]" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Upload de preuve pour virement bancaire */}
                  {selectedPaymentMethod === 'bank_transfer' && !paymentProcessing && !paymentCompleted && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5F6FA]">
                      <label className="block text-[#1A2753] text-lg mb-4">
                        Preuve de paiement <span className="text-red-500">*</span>
                        <span className="text-[#273A7A]/80 text-sm ml-2">(JPG, PNG ou PDF - Max 5MB)</span>
                      </label>
                      
                      <input
                        type="file"
                        id="payment-proof-upload-web"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={handlePaymentProofUpload}
                        className="hidden"
                      />
                      
                      {!paymentProof ? (
                        <label
                          htmlFor="payment-proof-upload-web"
                          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#D6A93A]/30 rounded-xl cursor-pointer hover:border-[#D6A93A] hover:bg-[#D6A93A]/5 transition-all duration-300"
                        >
                          <Upload className="w-12 h-12 text-[#D6A93A] mb-3" />
                          <p className="text-[#1A2753] mb-1">Cliquez pour téléverser</p>
                          <p className="text-[#273A7A]/80 text-sm">ou glissez-déposez votre fichier ici</p>
                        </label>
                      ) : (
                        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[#1A2753] truncate">{paymentProof.name}</p>
                            <p className="text-[#273A7A]/80 text-sm">
                              {(paymentProof.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <button aria-label="Supprimer le justificatif de paiement"
                            onClick={() => {
                              setPaymentProof(null);
                              setPaymentProofPreview(null);
                            }}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      )}

                      {/* Instructions pour le virement */}
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-900 mb-3">
                          <strong>Coordonnées bancaires Crésus :</strong>
                        </p>
                        <div className="space-y-1.5 text-sm text-blue-800">
                          <p>• Banque : BICIS - Dakar Plateau</p>
                          <p>• IBAN : SN08 SN012 01013 123456789012 34</p>
                          <p>• Titulaire : CRESUS SARL</p>
                          <p>• Montant : <strong>{getLiberatedAmount().toLocaleString()} FCFA</strong></p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructions pour Chèque/Espèces */}
                  {selectedPaymentMethod === 'cheque_cash' && !paymentProcessing && !paymentCompleted && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5F6FA]">
                      <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="flex items-start gap-4">
                          <Info className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[#1A2753] mb-3">
                              <strong>Dépôt en agence</strong>
                            </p>
                            <div className="space-y-2 text-sm text-amber-800">
                              <p>• Rendez-vous dans une agence Crésus</p>
                              <p>• Présentez votre pièce d&apos;identité</p>
                              <p>• Effectuez le paiement de <strong>{getLiberatedAmount().toLocaleString()} FCFA</strong></p>
                              <p>• Un reçu vous sera remis sur place</p>
                            </div>
                            <p className="text-sm text-amber-700 mt-4 italic">
                              Votre dossier sera activé dès réception du paiement
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentProcessing && (
                    <div className="bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-2xl p-8 text-center">
                      <div className="w-16 h-16 border-4 border-[#D6A93A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-[#1A2753] text-lg">Traitement du paiement en cours...</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ÉTAPE 7: Validation des statuts */}
          {currentStep === 7 && (
            <motion.div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[#1A2753] mb-2">Validation des statuts</h2>
                  <p className="text-[#273A7A]/80 text-sm">
                    Version {statuts.version} • {statuts.status === 'validated' ? 'Validé' : 'En attente'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#D6A93A]">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">Étape {currentStep}/{steps.length}</span>
                </div>
              </div>

              {/* Statuts pas encore envoyés */}
              {statuts.status === 'waiting' && (
                <div className="bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-2xl p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-[#D6A93A] mx-auto mb-4" />
                  <p className="text-[#1A2753] text-lg mb-2">Statuts en préparation</p>
                  <p className="text-[#273A7A]/80">
                    Crésus rédige vos statuts à partir des informations transmises.
                    Vous serez prévenu dès qu'ils seront prêts à être relus.
                  </p>
                </div>
              )}

              {/* Statuts reçus */}
              {(statuts.status === 'sent' || statuts.status === 'validated' || statuts.status === 'rejected') && (
                <div className="space-y-6">
                  {/* Document des statuts */}
                  <div className="bg-white border-2 border-[#F5F6FA] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FileText className={`w-8 h-8 ${statuts.status === 'validated' ? 'text-green-600' : 'text-[#D6A93A]'}`} />
                        <div>
                          <h4 className="text-[#1A2753]">Statuts de la société V{statuts.version}</h4>
                          <p className="text-[#273A7A]/80 text-sm">PDF • 12 pages</p>
                        </div>
                      </div>
                      {statuts.status === 'validated' && (
                        <span className="text-green-600 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Validé
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-2 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#F5F6FA]/80 transition-all duration-300 flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4" />
                        Consulter
                      </button>
                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-2 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#F5F6FA]/80 transition-all duration-300 flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    </div>
                  </div>

                  {/* Actions Valider/Rejeter */}
                  {statuts.status === 'sent' && !showRejectionForm && (
                    <div className="bg-white border-2 border-[#F5F6FA] rounded-xl p-6 space-y-4">
                      <p className="text-[#1A2753] text-center text-lg mb-4">
                        Avez-vous consulté et validé les statuts ?
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={handleValidateStatuts}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Valider les statuts
                        </button>
                        <button
                          onClick={() => setShowRejectionForm(true)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          Rejeter
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Formulaire de rejet */}
                  {showRejectionForm && (
                    <div className="bg-white border-2 border-[#F5F6FA] rounded-xl p-6 space-y-4">
                      <h4 className="text-[#1A2753] text-lg">Motifs de rejet</h4>
                      <textarea
                        value={statutsRejectionReason}
                        onChange={(e) => setStatutsRejectionReason(e.target.value)}
                        placeholder="Expliquez les raisons du rejet et les corrections à apporter..."
                        className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl outline-none focus:ring-2 focus:ring-[#D6A93A] transition-all duration-300 min-h-[120px] resize-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowRejectionForm(false);
                            setStatutsRejectionReason('');
                          }}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-3 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#F5F6FA]/80 transition-all duration-300"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleRejectStatuts}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                        >
                          Confirmer le rejet
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Choix du mode de signature après validation */}
                  {statuts.status === 'validated' && (
                    <div className="bg-white border-2 border-[#F5F6FA] rounded-xl p-6 space-y-4">
                      <h4 className="text-[#1A2753] text-lg">Mode de signature</h4>
                      <p className="text-[#273A7A]/80">
                        Choisissez comment vous souhaitez signer vos documents
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setSignatureChoice('online')}
                          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-6 rounded-xl border-2 transition-all duration-300 ${
                            signatureChoice === 'online'
                              ? 'border-[#D6A93A] bg-[#D6A93A]/5'
                              : 'border-[#F5F6FA] hover:border-[#D6A93A]/30'
                          }`}
                        >
                          <Pen className={`w-8 h-8 mx-auto mb-3 ${signatureChoice === 'online' ? 'text-[#D6A93A]' : 'text-[#273A7A]'}`} />
                          <p className="text-[#1A2753]">Signature électronique</p>
                          <p className="text-[#273A7A]/80 text-sm mt-1">Signez en ligne instantanément</p>
                        </button>

                        <button
                          onClick={() => setSignatureChoice('appointment')}
                          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-6 rounded-xl border-2 transition-all duration-300 ${
                            signatureChoice === 'appointment'
                              ? 'border-[#D6A93A] bg-[#D6A93A]/5'
                              : 'border-[#F5F6FA] hover:border-[#D6A93A]/30'
                          }`}
                        >
                          <Users className={`w-8 h-8 mx-auto mb-3 ${signatureChoice === 'appointment' ? 'text-[#D6A93A]' : 'text-[#273A7A]'}`} />
                          <p className="text-[#1A2753]">Rendez-vous physique</p>
                          <p className="text-[#273A7A]/80 text-sm mt-1">Signature avec notaire</p>
                        </button>
                      </div>

                      {signatureChoice && (
                        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
                          <p className="text-green-700 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            {signatureChoice === 'online' 
                              ? 'Vous allez signer électroniquement vos documents à l\'étape suivante'
                              : 'Un rendez-vous sera planifié pour la signature physique'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message si rejet en cours */}
                  {statuts.status === 'rejected' && (
                    <div className="bg-orange-50 border-2 border-orange-500 rounded-xl p-6">
                      <p className="text-orange-700 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Votre demande de correction est transmise. Crésus vous enverra une version corrigée.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ÉTAPE 8: Signature */}
          {currentStep === 8 && (
            <motion.div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[#1A2753] mb-2">Signature</h2>
                  <p className="text-[#273A7A]/80 text-sm">
                    {signatureChoice === 'online' ? 'Signature électronique des documents' : 'Planification du rendez-vous'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#D6A93A]">
                  <Pen className="w-5 h-5" />
                  <span className="text-sm">Étape {currentStep}/{steps.length}</span>
                </div>
              </div>

              {/* Signature en ligne */}
              {signatureChoice === 'online' && (

                <div className="space-y-4">
                  {documentsToSign.map((doc) => {
                    const isSigned = signedDocs.includes(doc.id);
                    return (
                      <div key={doc.id} className="bg-white border-2 border-[#F5F6FA] rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-[#D6A93A]" />
                            <div>
                              <h4 className="text-[#1A2753]">{doc.name}</h4>
                              <p className="text-[#273A7A]/80 text-sm">{doc.pages} pages</p>
                            </div>
                          </div>
                          {isSigned ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedDocToSign(doc.id);
                                setShowSignatureModal(true);
                              }}
                              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all"
                            >
                              Signer
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Signature par rendez-vous */}
              {signatureChoice === 'appointment' && (
                <div className="space-y-6">
                  <div className="bg-white border-2 border-[#F5F6FA] rounded-xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <Users className="w-12 h-12 text-[#273A7A]" />
                      <div>
                        <h3 className="text-[#1A2753] text-lg">Rendez-vous de signature</h3>
                        <p className="text-[#273A7A]/80">Choisissez votre créneau</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Sélection de date */}
                      <div>
                        <p className="text-[#1A2753] mb-4">Choisissez une date :</p>
                        <div className="grid grid-cols-2 gap-3">
                          {availableDates.map((date) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const isSelected = selectedDate === dateStr;
                            return (
                              <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                                  isSelected
                                    ? 'border-[#D6A93A] bg-[#D6A93A]/10'
                                    : 'border-[#F5F6FA] hover:border-[#D6A93A]/30'
                                }`}
                              >
                                <p className={`${isSelected ? 'text-[#D6A93A]' : 'text-[#1A2753]'}`}>
                                  {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                                </p>
                                <p className={`text-sm ${isSelected ? 'text-[#D6A93A]' : 'text-[#273A7A]/80'}`}>
                                  {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sélection de créneau */}
                      <div>
                        <p className="text-[#1A2753] mb-4">Choisissez un créneau :</p>
                        {!selectedDate ? (
                          <div className="text-center p-8 bg-[#F5F6FA] rounded-xl">
                            <p className="text-[#273A7A]/80">Sélectionnez d'abord une date</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map((slot) => {
                              const isSelected = selectedTimeSlot === slot;
                              return (
                                <button
                                  key={slot}
                                  onClick={() => setSelectedTimeSlot(slot)}
                                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                                    isSelected
                                      ? 'border-[#D6A93A] bg-[#D6A93A]/10'
                                      : 'border-[#F5F6FA] hover:border-[#D6A93A]/30'
                                  }`}
                                >
                                  <p className={`${isSelected ? 'text-[#D6A93A]' : 'text-[#1A2753]'}`}>
                                    {slot}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bouton réserver */}
                    {selectedDate && selectedTimeSlot && appointmentStatus === 'pending' && (
                      <button
                        onClick={handleBookAppointment}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full mt-6 py-4 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Réserver ce créneau
                      </button>
                    )}
                  </div>

                  {/* RV en attente de confirmation */}
                  {appointmentStatus === 'pending' && selectedDate && selectedTimeSlot && (
                    <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6">
                      <p className="text-blue-700 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Demande envoyée. Crésus vous confirmera ce créneau.
                      </p>
                    </div>
                  )}

                  {/* RV confirmé */}
                  {appointmentStatus === 'confirmed' && (
                    <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                        <div>
                          <p className="text-green-900 text-lg font-medium">Rendez-vous confirmé !</p>
                          <p className="text-green-700">
                            {new Date(rendezVousConfirme.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à{' '}
                            {rendezVousConfirme.timeSlot}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-6">
                        <p className="text-[#273A7A] mb-4">
                          <strong>Informations importantes :</strong>
                        </p>
                        <ul className="text-[#273A7A]/80 space-y-2 ml-4">
                          <li>• La signature aura lieu en présence d'un notaire</li>
                          <li>• Tous les associés doivent être présents</li>
                          <li>• Munissez-vous de vos pièces d'identité</li>
                          <li>• Adresse : Bureau Crésus, Dakar Plateau</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        {currentStep < 8 && !submitted && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
            {/* Motif du blocage, juste au-dessus du bouton concerné : un bouton grisé
                sans explication laissait l'utilisateur deviner ce qui manquait. */}
            {((currentStep === 2 && blocageEtape2) || (currentStep === 3 && blocageEtape3) || (currentStep === 5 && blocageEtape5)) && (
              <p className="mb-4 flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{currentStep === 2 ? blocageEtape2 : currentStep === 3 ? blocageEtape3 : blocageEtape5}</span>
              </p>
            )}

            {/* Bouton "Enregistrer et quitter" */}
            <button
              onClick={handleSaveAndQuit}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full mb-4 py-3 text-[#273A7A] hover:text-[#1A2753] transition-all duration-300 flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Enregistrer et quitter
            </button>
            
            {/* Boutons de navigation */}
            <div className="flex gap-4">
              {currentStep > 1 && !paymentProcessing && !paymentCompleted && (
                <button
                  onClick={handlePrevious}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-8 py-4 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#F5F6FA]/80 transition-all duration-300 flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Précédent
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 2 && !isCapitalDistributionValid()) ||
                  (currentStep === 5 && quote.status !== 'validated') ||
                  (currentStep === 6 && !selectedPaymentMethod && !paymentCompleted) ||
                  (currentStep === 6 && !phoneNumber && !paymentCompleted) ||
                  (currentStep === 6 && selectedPaymentMethod === 'bank_transfer' && !paymentProof && !paymentCompleted) ||
                  (currentStep === 7 && (statuts.status !== 'validated' || !signatureChoice)) ||
                  paymentProcessing
                }
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                  (currentStep === 2 && !isCapitalDistributionValid()) ||
                  (currentStep === 5 && quote.status !== 'validated') ||
                  (currentStep === 6 && (
                    !selectedPaymentMethod || 
                    !phoneNumber || 
                    (selectedPaymentMethod === 'bank_transfer' && !paymentProof)
                  ) && !paymentCompleted) ||
                  (currentStep === 7 && (statuts.status !== 'validated' || !signatureChoice)) ||
                  paymentProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white hover:shadow-lg'
                }`}
              >
                {currentStep === 5 ? (
                  <>
                    <Check className="w-5 h-5" />
                    Continuer
                  </>
                ) : currentStep === 6 && !paymentCompleted ? (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {paymentProcessing ? 'Traitement...' : 'Payer'}
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Bouton Soumettre pour l'étape 8 */}
        {currentStep === 8 && !submitted && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
            <button
              onClick={handleSubmit}
              disabled={
                (signatureChoice === 'online' && signedDocs.length < documentsToSign.length) ||
                (signatureChoice === 'appointment' && appointmentStatus !== 'confirmed')
              }
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                (signatureChoice === 'online' && signedDocs.length < documentsToSign.length) ||
                (signatureChoice === 'appointment' && appointmentStatus !== 'confirmed')
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
              }`}
            >
              <Check className="w-5 h-5" />
              {signatureChoice === 'appointment' && appointmentStatus === 'confirmed' ? 'Finaliser le dossier' : signatureChoice === 'appointment' ? 'En attente RV' : 'Soumettre le dossier'}
            </button>
          </div>
        )}
      </div>

      {/* Pavé de signature.
          `showSignatureModal` était bien levé par le bouton « Signer », mais rien
          ne l'écoutait : le client web ne pouvait pas signer, et le dossier
          restait bloqué à la dernière étape. */}
      {showSignatureModal && selectedDocToSign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1A2753]">Signer le document</h3>
              <button
                aria-label="Fermer"
                onClick={() => {
                  setShowSignatureModal(false);
                  setSelectedDocToSign(null);
                  clearSignature();
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-9 h-9 bg-[#F5F6FA] rounded-full flex items-center justify-center hover:bg-[#F5F6FA]/80 transition-all duration-300"
              >
                <X className="w-5 h-5 text-[#1A2753]" />
              </button>
            </div>

            <p className="text-[#273A7A]/80 text-sm mb-5">
              {documentsToSign.find(d => d.id === selectedDocToSign)?.name}
            </p>

            <div className="border-2 border-dashed border-[#D6A93A]/30 rounded-xl p-4 mb-5 bg-[#F5F6FA]">
              <p className="text-[#273A7A]/80 text-sm text-center mb-3">
                Tracez votre signature ci-dessous
              </p>
              <canvas
                ref={canvasRef}
                width={440}
                height={180}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full bg-white rounded-lg border border-[#D6A93A]/20 cursor-crosshair"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearSignature}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-3 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#F5F6FA]/80 transition-all duration-300"
              >
                Effacer
              </button>
              <button
                onClick={saveSignature}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Valider la signature
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};