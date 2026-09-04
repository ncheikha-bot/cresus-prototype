import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Buildings,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  Circle,
  CircleDot,
  Clock,
  CreditCard,
  Crown,
  Download,
  Eye,
  FileText,
  FileCheck,
  Hash,
  HelpCircle,
  House,
  IdentificationCard,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  Users,
  Wifi,
  X,
  XCircle,
  Zap,
} from '../ui/icons';
import { mockDomiciliationOffers, getPeriodLabel, calculatePeriodPrice, type DomiciliationOffer, type PeriodType } from '../../data/domiciliationData';
import { SignaturePad } from '../mobile/SignaturePad';
import { useApp } from '../../context/AppContext';
import { getCompanyStatusLabel, getCompanyStatusColor } from '../../domain/companyStatus';

interface WebDomiciliationProps {
  onBack: () => void;
}

type Step = 'company-status' | 'company-select' | 'offers' | 'offer-details' | 'period' | 'documents' | 'company-info' | 'contract-review' | 'signature' | 'payment' | 'confirmation';

interface Associe {
  nom: string;
  pourcentage: string;
}

interface CompanyInfoForm {
  profession: string;
  telephone: string;
  email: string;
  formeJuridique: string;
  denomination: string;
  objetSocial: string;
  capitalSocial: string;
  associes: Associe[];
}

const FORMES_JURIDIQUES = ['SUARL', 'SARL', 'SAS', 'SA', 'SNC', 'Autre'];

const REJECTION_REASONS = [
  'Tarifs trop élevés',
  'Services insuffisants',
  'Localisation inadaptée',
  'Clauses contractuelles à revoir',
  'Besoin de plus d\'informations',
  'Autre (précisez)'
];

export const WebDomiciliation: React.FC<WebDomiciliationProps> = ({ onBack }) => {
  const { addDomiciliation, currentUser, companies } = useApp();

  /**
   * Sociétés du client, proposées à la domiciliation.
   *
   * L'adresse de domiciliation devient le siège statutaire : elle se rattache à
   * une société précise. Le parcours ne la demandait jamais, si bien que
   * l'administration recevait un contrat sans savoir quelle société domicilier.
   */
  const societesDuClient = companies.filter(
    // Le client vient de répondre « déjà immatriculée » : lui proposer un
    // dossier encore en révision contredirait sa réponse.
    c => c.userId === currentUser?.id && c.status === 'completed',
  );
  /** `null` : société non gérée sur Crésus — le contrat reste au nom du client. */
  const [societeADomicilier, setSocieteADomicilier] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('company-status');
  const [selectedOffer, setSelectedOffer] = useState<DomiciliationOffer | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [contractComments, setContractComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [companyRegistered, setCompanyRegistered] = useState<boolean | null>(null);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoForm>({
    profession: '',
    telephone: '',
    email: '',
    formeJuridique: '',
    denomination: '',
    objetSocial: '',
    capitalSocial: '',
    associes: [{ nom: '', pourcentage: '' }],
  });

  const requiredDocs = companyRegistered === true
    ? [
        { id: 'cni', label: 'Carte d\'identité (gérant/président)', icon: IdentificationCard, uploaded: uploadedDocs.includes('cni'), optional: false },
        { id: 'statuts', label: 'Statuts', icon: FileText, uploaded: uploadedDocs.includes('statuts'), optional: false },
        { id: 'rc', label: 'Registre de Commerce (RCCM)', icon: FileCheck, uploaded: uploadedDocs.includes('rc'), optional: false },
        { id: 'ninea', label: 'NINEA', icon: Buildings, uploaded: uploadedDocs.includes('ninea'), optional: false },
      ]
    : [
        { id: 'cni', label: 'CIN du représentant légal', icon: IdentificationCard, uploaded: uploadedDocs.includes('cni'), optional: false },
        { id: 'justificatif_domicile', label: 'Justificatif de domicile', icon: House, uploaded: uploadedDocs.includes('justificatif_domicile'), optional: true },
      ];

  const handleOfferSelect = (offer: DomiciliationOffer) => {
    setSelectedOffer(offer);
    setStep('offer-details');
  };

  const handlePeriodSelect = (period: PeriodType) => {
    setSelectedPeriod(period);
    setStep('documents');
  };

  const handleDocUpload = (docId: string) => {
    setUploadedDocs([...uploadedDocs, docId]);
  };

  const handleContractValidation = (action: 'validate' | 'reject') => {
    if (action === 'validate') {
      setStep('signature');
    } else {
      setShowRejectModal(true);
    }
  };

  const handleRejectSubmit = () => {
    const reason = selectedRejectionReason === 'Autre (précisez)' ? customRejectionReason : selectedRejectionReason;
    // Ici on enverrait la raison au backend
    console.log('Contrat rejeté:', reason, contractComments);
    setShowRejectModal(false);
    setContractAccepted(false);
    setStep('company-status');
  };

  const handleSignature = (signatureData: string) => {
    setSignature(signatureData);
    setStep('payment');
  };

  const handlePayment = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);

    // Le parcours annonçait « Votre domiciliation est active » sans rien
    // enregistrer : le contrat n'apparaissait ni dans « Mes domiciliations »,
    // ni côté administration.
    if (selectedOffer) {
      const debut = new Date();
      const mois = { monthly: 1, quarterly: 3, biannual: 6, yearly: 12 }[selectedPeriod];
      const fin = new Date(debut);
      fin.setMonth(fin.getMonth() + mois);
      addDomiciliation({
        offerId: selectedOffer.id,
        userId: currentUser?.id || '',
        status: 'active',
        period: selectedPeriod,
        startDate: debut.toISOString(),
        endDate: fin.toISOString(),
        monthlyAmount: selectedOffer.prices.monthly,
        totalAmount: calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod),
        autoRenewal: true,
        renewalNotice: 30,
        version: 1,
        signedAt: debut.toISOString(),
        comments: [],
        documents: [],
        // Ce que le client a déclaré et accepté en chemin.
        companyId: societeADomicilier ?? undefined,
        companyRegistered: companyRegistered ?? undefined,
        contractAccepted,
      });
    }

    setStep('confirmation');
  };

  const handleBack = () => {
    if (step === 'company-status') {
      onBack();
    } else if (step === 'company-select') {
      setStep('company-status');
    } else if (step === 'offers') {
      setStep(companyRegistered && societesDuClient.length > 0 ? 'company-select' : 'company-status');
    } else if (step === 'offer-details') {
      setStep('offers');
    } else if (step === 'period') {
      setStep('offer-details');
    } else if (step === 'documents') {
      setStep('period');
    } else if (step === 'company-info') {
      setStep('documents');
    } else if (step === 'contract-review') {
      setStep(companyRegistered === false ? 'company-info' : 'documents');
    } else if (step === 'signature') {
      setStep('contract-review');
    } else if (step === 'payment') {
      setStep('signature');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <motion.button aria-label="Retour"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
          </motion.button>
          <div>
            <h1 className="text-[#1A2753]">Domiciliation d'entreprise</h1>
            <p className="text-[#273A7A]/80">
              {step === 'company-status' && 'Statut de votre société'}
              {step === 'company-select' && 'Société à domicilier'}
              {step === 'offers' && 'Choisissez votre pack de domiciliation'}
              {step === 'offer-details' && 'Détails de l\'offre'}
              {step === 'period' && 'Période de paiement'}
              {step === 'documents' && 'Pièces justificatives'}
              {step === 'company-info' && 'Fiche de renseignements'}
              {step === 'contract-review' && 'Révision du contrat'}
              {step === 'signature' && 'Signature électronique'}
              {step === 'payment' && 'Paiement'}
              {step === 'confirmation' && 'Confirmation'}
            </p>
          </div>
        </div>

        {/* Progress */}
        {step !== 'confirmation' && (() => {
          // Le choix de la société n'existe que si le client en a une ici.
          const choixSociete: Step[] = companyRegistered && societesDuClient.length > 0 ? ['company-select'] : [];
          const allSteps: Step[] = companyRegistered === false
            ? ['company-status', 'offers', 'period', 'documents', 'company-info', 'contract-review', 'signature', 'payment']
            : ['company-status', ...choixSociete, 'offers', 'period', 'documents', 'contract-review', 'signature', 'payment'];
          const allStepsExpanded: Step[] = companyRegistered === false
            ? ['company-status', 'offers', 'offer-details', 'period', 'documents', 'company-info', 'contract-review', 'signature', 'payment']
            : ['company-status', ...choixSociete, 'offers', 'offer-details', 'period', 'documents', 'contract-review', 'signature', 'payment'];
          const currentIndex = allStepsExpanded.indexOf(step);
          return (
            <div className="flex items-center gap-3 max-w-3xl">
              {allSteps.map((s, index) => (
                <motion.div
                  key={s}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.08 }}
                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    currentIndex >= allSteps.indexOf(s) || (step === 'offer-details' && allSteps.indexOf(s) <= 1)
                      ? 'bg-[#D6A93A]'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          );
        })()}
      </div>

      {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
      <AnimatePresence mode="popLayout">
        {/* Step 0: Company Status */}
        {step === 'company-status' && (
          <motion.div
            key="company-status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#1A2753]/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Building2 className="w-8 h-8 text-[#1A2753]" />
              </div>
              <h2 className="text-[#1A2753] text-2xl mb-3">Votre société est-elle déjà immatriculée ?</h2>
              <p className="text-[#273A7A]/80 max-w-lg mx-auto">
                Selon le statut de votre société, les documents requis et le parcours seront différents.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Société immatriculée */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCompanyRegistered(true);
                  setUploadedDocs([]);
                  // Inutile de demander laquelle si le client n'en a aucune ici.
                  setStep(societesDuClient.length > 0 ? 'company-select' : 'offers');
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl ring-1 ring-gray-100 hover:ring-green-200 transition-all duration-300 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <BadgeCheck className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-[#1A2753] text-lg mb-2">Oui, elle est immatriculée</h3>
                <p className="text-[#273A7A]/80 text-sm mb-5">
                  Votre société dispose déjà d'un RCCM et d'un NINEA. Vous souhaitez obtenir une adresse de domiciliation.
                </p>
                <div className="space-y-2.5">
                  <p className="text-[#273A7A]/80 text-xs tracking-wide">DOCUMENTS REQUIS</p>
                  {['CIN du gérant/président', 'Statuts de la société', 'Registre de Commerce (RCCM)', 'NINEA'].map((doc) => (
                    <div key={doc} className="flex items-center gap-2 text-sm text-[#273A7A]/80">
                      <FileText className="w-3.5 h-3.5 text-green-500" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-green-600 text-sm group-hover:gap-3 transition-all">
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>

              {/* Société non immatriculée */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCompanyRegistered(false);
                  setUploadedDocs([]);
                  setStep('offers');
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl ring-1 ring-gray-100 hover:ring-[#D6A93A]/30 transition-all duration-300 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D6A93A] to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-14 h-14 bg-[#D6A93A]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <HelpCircle className="w-7 h-7 text-[#D6A93A]" />
                </div>
                <h3 className="text-[#1A2753] text-lg mb-2">Non / En cours de création</h3>
                <p className="text-[#273A7A]/80 text-sm mb-5">
                  Votre société n'est pas encore immatriculée ou la création est en cours. Vous avez besoin d'une adresse pour vos statuts.
                </p>
                <div className="space-y-2.5">
                  <p className="text-[#273A7A]/80 text-xs tracking-wide">DOCUMENTS REQUIS</p>
                  {[
                    { label: 'CIN du représentant légal', optional: false },
                    { label: 'Justificatif de domicile', optional: true },
                    { label: 'Fiche de renseignements (formulaire)', optional: false },
                  ].map((doc) => (
                    <div key={doc.label} className="flex items-center gap-2 text-sm text-[#273A7A]/80">
                      <FileText className="w-3.5 h-3.5 text-[#D6A93A]" />
                      <span>{doc.label}</span>
                      {doc.optional && (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-[#273A7A]/80 text-[10px] rounded">Optionnel</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-[#D6A93A] text-sm group-hover:gap-3 transition-all">
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Choix de la société à domicilier */}
        {step === 'company-select' && (
          <motion.div
            key="company-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#1A2753]/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Building2 className="w-8 h-8 text-[#1A2753]" />
              </div>
              <h2 className="text-[#1A2753] text-2xl mb-3">Quelle société souhaitez-vous domicilier ?</h2>
              <p className="text-[#273A7A]/80 max-w-lg mx-auto">
                L'adresse choisie deviendra le siège social de cette société.
              </p>
            </div>

            <div className="space-y-3">
              {societesDuClient.map(societe => (
                <motion.button
                  key={societe.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setSocieteADomicilier(societe.id);
                    setStep('offers');
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:ring-[#D6A93A]/40 hover:shadow-lg transition-all text-left flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-[#D6A93A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A2753] mb-1">{societe.name}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#273A7A]/80">{societe.legalForm}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getCompanyStatusColor(societe.status)}`}>
                        {getCompanyStatusLabel(societe.status)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#273A7A]/40 flex-shrink-0" />
                </motion.button>
              ))}

              {/* Une société créée ailleurs n'apparaît pas dans cette liste. */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setSocieteADomicilier(null);
                  setStep('offers');
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 hover:ring-[#1A2753]/20 hover:shadow-lg transition-all text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-[#F5F6FA] rounded-xl flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-[#273A7A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1A2753] mb-1">Une autre société</p>
                  <p className="text-[#273A7A]/80 text-sm">
                    Elle n'a pas été créée avec Crésus. Nous la rattacherons à partir de
                    vos pièces justificatives.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#273A7A]/40 flex-shrink-0" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 1: Packs Grid */}
        {step === 'offers' && (
          <motion.div
            key="offers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Intro */}
            <div className="text-center mb-10">
              <h2 className="text-[#1A2753] text-2xl mb-3">Choisissez votre pack de domiciliation</h2>
              <p className="text-[#273A7A]/80 max-w-2xl mx-auto">
                Tous les prix sont indiqués HTVA. Profitez de remises allant jusqu'à -12% pour un engagement annuel.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-start">
              {mockDomiciliationOffers.filter(o => o.status === 'published').map((offer, index) => {
                const offerTierConfigs = {
                  essentiel: { icon: Circle, gradient: 'from-[#273A7A] to-[#1A2753]', badge: null as string | null, ringColor: 'ring-[#273A7A]/10' },
                  business: { icon: CircleDot, gradient: 'from-[#D6A93A] to-amber-500', badge: 'Populaire' as string | null, ringColor: 'ring-[#D6A93A]/30' },
                  premium: { icon: BadgeCheck, gradient: 'from-[#1A2753] to-[#0f1a3a]', badge: 'Complet' as string | null, ringColor: 'ring-[#1A2753]/20' },
                };
                const tierConfig = offerTierConfigs[(offer as any).tier as keyof typeof offerTierConfigs] || offerTierConfigs.essentiel;
                const TierIcon = tierConfig.icon;

                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.12 }}
                    className={`relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ring-1 ${tierConfig.ringColor} ${
                      offer.popular ? 'md:-mt-4 md:mb-4 ring-2 ring-[#D6A93A]/40' : ''
                    }`}
                  >
                    {/* Popular badge */}
                    {tierConfig.badge && (
                      <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-xs text-white bg-gradient-to-r ${tierConfig.gradient}`}>
                        {tierConfig.badge}
                      </div>
                    )}

                    {/* Header */}
                    <div className={`bg-gradient-to-br ${tierConfig.gradient} p-6 text-white`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <TierIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white text-lg">{offer.name}</h3>
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-3xl text-white">{(offer.prices.monthly).toLocaleString('fr-FR')}</span>
                        <span className="text-white/70 text-sm">FCFA / mois</span>
                      </div>
                      <p className="text-white/70 text-xs">(HTVA)</p>
                    </div>

                    {/* Adresse */}
                    <div className="px-6 pt-5 pb-3">
                      <div className="flex items-center gap-2 text-[#273A7A]/80 text-sm mb-1">
                        <MapPin className="w-4 h-4 text-[#D6A93A]" />
                        <span className="text-[#1A2753]">Adresse{offer.tier === 'essentiel' ? 's' : ''} :</span>
                      </div>
                      <p className="text-[#273A7A]/80 text-sm ml-6 mb-4">{offer.zone}</p>
                    </div>

                    {/* Services inclus */}
                    <div className="px-6 pb-4">
                      <p className="text-[#1A2753] text-xs tracking-wide mb-3">INCLUS</p>
                      <div className="space-y-2.5">
                        {offer.services.map((service, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-[#273A7A]/80">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Services non inclus */}
                    {offer.notIncluded && offer.notIncluded.length > 0 && (
                      <div className="px-6 pb-4">
                        <p className="text-[#273A7A]/80 text-xs tracking-wide mb-3">NON INCLUS</p>
                        <div className="space-y-2">
                          {offer.notIncluded.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-sm">
                              <X className="w-4 h-4 text-[#273A7A]/25 flex-shrink-0 mt-0.5" />
                              <span className="text-[#273A7A]/80">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="px-6 pb-6 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOfferSelect(offer)}
                        className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                          offer.popular
                            ? 'bg-gradient-to-r from-[#D6A93A] to-amber-500 text-[#1A2753] shadow-lg shadow-[#D6A93A]/20'
                            : 'bg-[#1A2753] text-white hover:bg-[#273A7A]'
                        }`}
                      >
                        <span>Choisir ce pack</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Options de paiement */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-4.5 h-4.5 text-[#D6A93A]" />
                </div>
                <h3 className="text-[#1A2753]">Options de paiement</h3>
                <span className="text-[#273A7A]/80 text-xs">(prix HTVA)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Mensuel', desc: 'Paiement chaque mois', discount: null, tag: 'Flexible' },
                  { label: 'Trimestriel', desc: 'Tous les 3 mois', discount: '-5%', tag: null },
                  { label: 'Semestriel', desc: 'Tous les 6 mois', discount: '-8%', tag: null },
                  { label: 'Annuel', desc: '12 mois d\'avance', discount: '-12%', tag: 'Meilleur prix' },
                ].map((option, idx) => (
                  <div
                    key={idx}
                    className={`relative text-center p-4 rounded-xl border-2 transition-all ${
                      option.discount === '-12%' 
                        ? 'border-[#D6A93A]/30 bg-[#D6A93A]/5' 
                        : 'border-[#F5F6FA] bg-[#F5F6FA]/50'
                    }`}
                  >
                    {option.tag && (
                      <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] whitespace-nowrap ${
                        option.discount === '-12%'
                          ? 'bg-[#D6A93A] text-[#1A2753]'
                          : 'bg-[#273A7A] text-white'
                      }`}>
                        {option.tag}
                      </span>
                    )}
                    <p className="text-[#1A2753] text-sm mb-1">{option.label}</p>
                    <p className="text-[#273A7A]/80 text-xs mb-2">{option.desc}</p>
                    {option.discount && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        Remise {option.discount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mentions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-[#1A2753]/[0.03] rounded-xl p-5 border border-[#1A2753]/[0.06]"
            >
              <p className="text-[#273A7A]/80 text-xs tracking-wide mb-3">MENTIONS</p>
              <ul className="space-y-2">
                {[
                  'Prix HTVA — TVA en sus selon réglementation en vigueur.',
                  'Réexpédition : hors frais de coursier / transport.',
                  'Accès bureau / salle de réunion : sur réservation et selon disponibilité.',
                  'Courrier conservé 30 jours. Au-delà : frais de stockage ou destruction sur instruction du client.',
                ].map((mention, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[#273A7A]/80 text-xs">
                    <span className="mt-1 w-1 h-1 rounded-full bg-[#273A7A]/25 flex-shrink-0" />
                    <span>{mention}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}

        {/* Step 2: Offer Details */}
        {step === 'offer-details' && selectedOffer && (() => {
          const tierConfigs = {
            essentiel: { icon: Circle, gradient: 'from-[#273A7A] to-[#1A2753]', label: 'Essentiel' },
            business: { icon: CircleDot, gradient: 'from-[#D6A93A] to-amber-500', label: 'Business' },
            premium: { icon: BadgeCheck, gradient: 'from-[#1A2753] to-[#0f1a3a]', label: 'Premium' },
          };
          const tierConfig = tierConfigs[(selectedOffer as any).tier as keyof typeof tierConfigs] || tierConfigs.essentiel;
          const TierIcon = tierConfig.icon;

          return (
            <motion.div
              key="offer-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* Pack Header */}
              <div className={`bg-gradient-to-br ${tierConfig.gradient} rounded-2xl p-8 mb-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[60px] translate-x-20 -translate-y-10" />
                <div className="relative z-10 flex items-start gap-6">
                  <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10">
                    <TierIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-white text-2xl mb-2">{selectedOffer.name}</h2>
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedOffer.zone}, {selectedOffer.city}</span>
                    </div>
                    <p className="text-white/60 text-sm max-w-xl">{selectedOffer.description}</p>
                    <div className="flex items-baseline gap-2 mt-4">
                      <span className="text-3xl text-white">{selectedOffer.prices.monthly.toLocaleString('fr-FR')}</span>
                      <span className="text-white/60 text-sm">FCFA / mois (HTVA)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Services inclus */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Services inclus
                  </h3>
                  <div className="space-y-3">
                    {selectedOffer.services.map((service, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[#273A7A]/80">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Non inclus + Avantages */}
                <div className="space-y-6">
                  {selectedOffer.notIncluded && selectedOffer.notIncluded.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                        <X className="w-5 h-5 text-[#273A7A]/30" />
                        Non inclus
                      </h3>
                      <div className="space-y-2.5">
                        {selectedOffer.notIncluded.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm">
                            <X className="w-4 h-4 text-[#273A7A]/25 flex-shrink-0 mt-0.5" />
                            <span className="text-[#273A7A]/80">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#D6A93A]" />
                      Avantages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedOffer.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-[#D6A93A]/10 text-[#D6A93A] text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[#273A7A]/80 text-xs">Places disponibles</p>
                    <p className="text-[#1A2753] text-sm">{selectedOffer.available} / {selectedOffer.quota}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#D6A93A]" />
                  </div>
                  <div>
                    <p className="text-[#273A7A]/80 text-xs">Engagement annuel</p>
                    <p className="text-[#D6A93A] text-sm">{formatPrice(selectedOffer.prices.yearly)} (-12%)</p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('period')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 shadow-lg flex items-center justify-center gap-2"
              >
                <span>Choisir la période de paiement</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          );
        })()}

        {/* Step 3: Period Selection */}
        {step === 'period' && selectedOffer && (
          <motion.div
            key="period"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            {/* Breadcrumb */}
            <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-4 mb-6 border-l-4 border-[#D6A93A]">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#D6A93A]" />
                <div>
                  <p className="text-[#273A7A]/80 text-sm">Adresse sélectionnée</p>
                  <p className="text-[#1A2753]">{selectedOffer.name}</p>
                </div>
              </div>
            </div>

            <h2 className="text-[#1A2753] mb-6">Choisissez votre période de location</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['monthly', 'quarterly', 'biannual', 'yearly'] as PeriodType[]).map((period) => {
                const price = calculatePeriodPrice(selectedOffer.prices.monthly, period);
                const discount = period === 'quarterly' ? '5%' : period === 'biannual' ? '8%' : period === 'yearly' ? '12%' : null;
                
                return (
                  <motion.button
                    key={period}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePeriodSelect(period)}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center border-2 ${
                      selectedPeriod === period ? 'border-[#D6A93A]' : 'border-transparent'
                    } ${discount ? 'relative' : ''}`}
                  >
                    {discount && (
                      <span className="absolute top-3 right-3 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        -{discount}
                      </span>
                    )}
                    <h3 className="text-[#1A2753] mb-3">{getPeriodLabel(period)}</h3>
                    <p className="text-[#D6A93A] text-2xl mb-2">{formatPrice(price)}</p>
                    <p className="text-[#273A7A]/80 text-sm mb-4">
                      {period === 'monthly' && 'Paiement mensuel'}
                      {period === 'quarterly' && 'Paiement tous les 3 mois'}
                      {period === 'biannual' && 'Paiement tous les 6 mois'}
                      {period === 'yearly' && 'Paiement annuel'}
                    </p>
                    <div className="pt-4 border-t border-[#F5F6FA]">
                      <p className="text-[#273A7A]/80 text-xs">
                        Soit {formatPrice(price / (period === 'monthly' ? 1 : period === 'quarterly' ? 3 : period === 'biannual' ? 6 : 12))}/mois
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>


          </motion.div>
        )}

        {/* Step 4: Documents Upload */}
        {step === 'documents' && selectedOffer && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            {/* Breadcrumb */}
            <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-4 mb-6 border-l-4 border-[#D6A93A]">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#D6A93A]" />
                  <p className="text-[#1A2753] text-sm">{selectedOffer.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D6A93A]" />
                  <p className="text-[#1A2753] text-sm">{getPeriodLabel(selectedPeriod)}</p>
                </div>
              </div>
            </div>

            <h2 className="text-[#1A2753] mb-2">Pièces justificatives requises</h2>
            <p className="text-[#273A7A]/80 mb-6">
              Téléversez les documents nécessaires à la constitution de votre dossier
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {requiredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`bg-white rounded-xl p-6 shadow-sm transition-all duration-300 ${
                    doc.uploaded ? 'border-2 border-green-500' : 'border-2 border-transparent hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <doc.icon className="w-6 h-6 text-[#1A2753]/70 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[#1A2753]">{doc.label}</p>
                        {doc.optional && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            Optionnel
                          </span>
                        )}
                      </div>
                      {doc.uploaded ? (
                        <p className="text-green-600 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Document téléversé
                        </p>
                      ) : (
                        <p className="text-[#273A7A]/80 text-sm">En attente de téléversement</p>
                      )}
                    </div>
                  </div>
                  
                  {!doc.uploaded && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDocUpload(doc.id)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full mt-4 bg-[#D6A93A]/10 text-[#D6A93A] rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-[#D6A93A]/20 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Téléverser</span>
                    </motion.button>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-900 text-sm">
                {companyRegistered === true
                  ? 'Tous les documents sont obligatoires pour valider votre demande de domiciliation.'
                  : 'La CIN est obligatoire. Le justificatif de domicile est optionnel mais recommandé.'
                }
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(companyRegistered === false ? 'company-info' : 'contract-review')}
              disabled={
                companyRegistered === true
                  ? (!uploadedDocs.includes('cni') || !uploadedDocs.includes('statuts') || !uploadedDocs.includes('rc') || !uploadedDocs.includes('ninea'))
                  : !uploadedDocs.includes('cni')
              }
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 shadow-lg disabled:opacity-50"
            >
              {companyRegistered === false ? 'Continuer vers la fiche de renseignements' : 'Continuer vers le contrat'}
            </motion.button>
          </motion.div>
        )}

        {/* Step: Fiche de renseignements (société non immatriculée) */}
        {step === 'company-info' && selectedOffer && (
          <motion.div
            key="company-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            {/* Breadcrumb */}
            <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-4 mb-6 border-l-4 border-[#D6A93A]">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#D6A93A]" />
                  <p className="text-[#1A2753] text-sm">{selectedOffer.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D6A93A]" />
                  <p className="text-[#1A2753] text-sm">{getPeriodLabel(selectedPeriod)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#D6A93A]" />
                  <p className="text-[#1A2753] text-sm">Société en cours de création</p>
                </div>
              </div>
            </div>

            <h2 className="text-[#1A2753] mb-2">Fiche de renseignements</h2>
            <p className="text-[#273A7A]/80 mb-8">
              Ces informations nous permettent de préparer votre dossier de domiciliation avant l'immatriculation de votre société.
            </p>

            <div className="space-y-6">
              {/* Représentant légal */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-[#1A2753]/8 rounded-xl flex items-center justify-center">
                    <User className="w-4.5 h-4.5 text-[#1A2753]" />
                  </div>
                  <h3 className="text-[#1A2753]">Représentant légal</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#273A7A]/80 text-sm mb-1.5 block">Profession *</label>
                    <input
                      type="text"
                      value={companyInfo.profession}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, profession: e.target.value }))}
                      placeholder="Ex: Entrepreneur, Consultant..."
                      className="w-full bg-[#F5F6FA] rounded-xl px-4 py-3 text-[#1A2753] text-sm outline-none focus:ring-2 focus:ring-[#D6A93A]/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[#273A7A]/80 text-sm mb-1.5 block">Téléphone *</label>
                    <input
                      type="tel"
                      value={companyInfo.telephone}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, telephone: e.target.value }))}
                      placeholder="+221 7X XXX XX XX"
                      className="w-full bg-[#F5F6FA] rounded-xl px-4 py-3 text-[#1A2753] text-sm outline-none focus:ring-2 focus:ring-[#D6A93A]/30 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[#273A7A]/80 text-sm mb-1.5 block">Email *</label>
                    <input
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="votre@email.com"
                      className="w-full bg-[#F5F6FA] rounded-xl px-4 py-3 text-[#1A2753] text-sm outline-none focus:ring-2 focus:ring-[#D6A93A]/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Informations société */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-4.5 h-4.5 text-[#D6A93A]" />
                  </div>
                  <h3 className="text-[#1A2753]">Informations sur la société</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[#273A7A]/80 text-sm mb-1.5 block">Forme juridique envisagée *</label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {FORMES_JURIDIQUES.map((forme) => (
                        <motion.button
                          key={forme}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setCompanyInfo(prev => ({ ...prev, formeJuridique: forme }))}
                          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                            companyInfo.formeJuridique === forme
                              ? 'bg-[#1A2753] text-white shadow-md'
                              : 'bg-[#F5F6FA] text-[#273A7A]/80 hover:bg-[#1A2753]/10'
                          }`}
                        >
                          {forme}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[#273A7A]/80 text-sm mb-1.5 block">Dénomination de la société *</label>
                    <input
                      type="text"
                      value={companyInfo.denomination}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, denomination: e.target.value }))}
                      placeholder="Nom de votre future société"
                      className="w-full bg-[#F5F6FA] rounded-xl px-4 py-3 text-[#1A2753] text-sm outline-none focus:ring-2 focus:ring-[#D6A93A]/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[#273A7A]/80 text-sm mb-1.5 block">Objet social (activité de la société) *</label>
                    <textarea
                      value={companyInfo.objetSocial}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, objetSocial: e.target.value }))}
                      placeholder="Décrivez l'activité principale de votre société..."
                      rows={3}
                      className="w-full bg-[#F5F6FA] rounded-xl px-4 py-3 text-[#1A2753] text-sm outline-none focus:ring-2 focus:ring-[#D6A93A]/30 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Capital social */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Hash className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <h3 className="text-[#1A2753]">Capital social</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="text-[#273A7A]/80 text-sm mb-1.5 block">Montant du capital social (FCFA) *</label>
                    <input
                      type="text"
                      value={companyInfo.capitalSocial}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, capitalSocial: e.target.value }))}
                      placeholder="Ex: 1 000 000"
                      className="w-full bg-[#F5F6FA] rounded-xl px-4 py-3 text-[#1A2753] text-sm outline-none focus:ring-2 focus:ring-[#D6A93A]/30 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[#273A7A]/80 text-sm">Répartition entre associés *</label>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCompanyInfo(prev => ({
                          ...prev,
                          associes: [...prev.associes, { nom: '', pourcentage: '' }]
                        }))}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-1.5 text-[#D6A93A] text-sm hover:text-[#1A2753] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter un associé</span>
                      </motion.button>
                    </div>
                    <div className="space-y-3">
                      {companyInfo.associes.map((associe, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#F5F6FA] rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-[#273A7A]/80 text-xs">{index + 1}</span>
                          </div>
                          <input
                            type="text"
                            value={associe.nom}
                            onChange={(e) => {
                              const updated = [...companyInfo.associes];
                              updated[index] = { ...updated[index], nom: e.target.value };
                              setCompanyInfo(prev => ({ ...prev, associes: updated }));
                            }}
                            placeholder="Nom complet de l'associé"
                            className="flex-1 bg-[#F5F6FA] rounded-xl px-4 py-2.5 text-[#1A2753] text-sm outline-none focus:ring-2 focus:ring-[#D6A93A]/30 transition-all"
                          />
                          <div className="relative w-28 flex-shrink-0">
                            <input
                              type="text"
                              value={associe.pourcentage}
                              onChange={(e) => {
                                const updated = [...companyInfo.associes];
                                updated[index] = { ...updated[index], pourcentage: e.target.value };
                                setCompanyInfo(prev => ({ ...prev, associes: updated }));
                              }}
                              placeholder="Ex: 50"
                              className="w-full bg-[#F5F6FA] rounded-xl px-4 py-2.5 pr-8 text-[#1A2753] text-sm outline-none focus:ring-2 focus:ring-[#D6A93A]/30 transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#273A7A]/80 text-sm">%</span>
                          </div>
                          {companyInfo.associes.length > 1 && (
                            <motion.button aria-label="Supprimer l'associé"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                const updated = companyInfo.associes.filter((_, i) => i !== index);
                                setCompanyInfo(prev => ({ ...prev, associes: updated }));
                              }}
                              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </motion.button>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Total pourcentage */}
                    {(() => {
                      const total = companyInfo.associes.reduce((sum, a) => sum + (parseFloat(a.pourcentage) || 0), 0);
                      const isValid = total === 100;
                      return total > 0 ? (
                        <div className={`mt-3 flex items-center gap-2 text-sm ${isValid ? 'text-green-600' : 'text-amber-600'}`}>
                          {isValid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          <span>Total : {total}% {!isValid && '(doit être égal à 100%)'}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep('contract-review')}
              disabled={
                !companyInfo.profession.trim() ||
                !companyInfo.telephone.trim() ||
                !companyInfo.email.trim() ||
                !companyInfo.formeJuridique ||
                !companyInfo.denomination.trim() ||
                !companyInfo.objetSocial.trim() ||
                !companyInfo.capitalSocial.trim() ||
                companyInfo.associes.some(a => !a.nom.trim() || !a.pourcentage.trim()) ||
                companyInfo.associes.reduce((sum, a) => sum + (parseFloat(a.pourcentage) || 0), 0) !== 100
              }
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full mt-6 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>Continuer vers le contrat</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Step 5: Contract Review */}
        {step === 'contract-review' && selectedOffer && (
          <motion.div
            key="contract-review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-[#1A2753] mb-6">Révision du contrat de domiciliation</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#273A7A]/10 rounded-xl flex items-center justify-center">
                        <FileText className="w-7 h-7 text-[#273A7A]" />
                      </div>
                      <div>
                        <h3 className="text-[#1A2753]">Contrat de domiciliation</h3>
                        <p className="text-[#273A7A]/80 text-sm">Version 1.0 - {new Date().toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 bg-[#273A7A]/10 text-[#1A2753] rounded-lg flex items-center gap-2 hover:bg-[#273A7A]/20 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span>Télécharger</span>
                    </motion.button>
                  </div>

                  <div className="bg-[#F5F6FA] rounded-xl p-6 mb-6 max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none text-[#273A7A]/80">
                      <h4 className="text-[#1A2753] mb-3">CONTRAT DE DOMICILIATION COMMERCIALE</h4>
                      
                      <p className="mb-4">
                        Entre les soussignés :
                      </p>
                      
                      <p className="mb-4">
                        <strong>Le domiciliataire :</strong><br />
                        Crésus Services, société spécialisée dans la domiciliation d'entreprises,<br />
                        Siège social : {selectedOffer.address}, {selectedOffer.city}
                      </p>
                      
                      <p className="mb-4">
                        <strong>Le domicilié :</strong><br />
                        [Nom de votre société]<br />
                        Représenté par [Nom du représentant légal]
                      </p>
                      
                      <p className="text-[#273A7A]/80 text-sm mt-6">
                        [Contrat complet avec tous les articles - Cliquez sur "Voir le contrat complet" pour lire l'intégralité]
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowContractModal(true)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-[#D6A93A]/10 text-[#D6A93A] rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-[#D6A93A]/20 transition-colors mb-6"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Voir le contrat complet</span>
                  </motion.button>

                  <div>
                    <label className="text-[#1A2753] mb-2 block">
                      Vos commentaires ou questions (optionnel)
                    </label>
                    <textarea
                      value={contractComments}
                      onChange={(e) => setContractComments(e.target.value)}
                      placeholder="Ajoutez vos remarques concernant le contrat..."
                      className="w-full bg-[#F5F6FA] rounded-xl p-4 text-[#1A2753] outline-none resize-none"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Mentions contractuelles */}
                <div className="bg-[#1A2753]/[0.03] rounded-xl p-4 border border-[#1A2753]/[0.06] mb-4">
                  <ul className="space-y-1.5">
                    {[
                      'Prix HTVA — TVA en sus selon réglementation en vigueur.',
                      'Réexpédition : hors frais de coursier / transport.',
                      'Accès bureau / salle de réunion : sur réservation et selon disponibilité.',
                      'Courrier conservé 30 jours. Au-delà : frais de stockage ou destruction sur instruction du client.',
                    ].map((mention, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[#273A7A]/80 text-xs">
                        <span className="mt-1 w-1 h-1 rounded-full bg-[#273A7A]/25 flex-shrink-0" />
                        <span>{mention}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Acceptation */}
                <label className="flex items-start gap-3 bg-white rounded-xl p-4 border-2 border-[#F5F6FA] hover:border-[#D6A93A]/30 transition-colors cursor-pointer mb-5">
                  <input
                    type="checkbox"
                    checked={contractAccepted}
                    onChange={(e) => setContractAccepted(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#1A2753] accent-[#1A2753] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-[#273A7A]/80 text-sm">
                    J'ai lu et j'accepte les termes du contrat de domiciliation ainsi que les conditions générales associées.
                  </span>
                </label>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleContractValidation('reject')}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-white border-2 border-red-200 text-red-600 rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    <span>Rejeter le contrat</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: contractAccepted ? 1.01 : 1 }}
                    whileTap={{ scale: contractAccepted ? 0.98 : 1 }}
                    onClick={() => handleContractValidation('validate')}
                    disabled={!contractAccepted}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                    <span>Valider et continuer</span>
                  </motion.button>
                </div>
              </div>

              {/* Sidebar Summary */}
              <div>
                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
                  <h3 className="text-[#1A2753] mb-4">Récapitulatif</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-[#273A7A]/80 text-sm mb-1">Adresse</p>
                      <p className="text-[#1A2753] text-sm">{selectedOffer.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-[#273A7A]/80 text-sm mb-1">Période</p>
                      <p className="text-[#1A2753] text-sm">{getPeriodLabel(selectedPeriod)}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-[#F5F6FA]">
                      <p className="text-[#273A7A]/80 text-sm mb-1">Loyer</p>
                      <p className="text-[#1A2753]">
                        {formatPrice(calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod))}
                      </p>
                    </div>
                    
                    {selectedOffer.deposit && (
                      <div>
                        <p className="text-[#273A7A]/80 text-sm mb-1">Dépôt</p>
                        <p className="text-[#1A2753]">{formatPrice(selectedOffer.deposit)}</p>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-[#F5F6FA]">
                      <p className="text-[#273A7A]/80 text-sm mb-1">Total à payer</p>
                      <p className="text-[#D6A93A] text-xl">
                        {formatPrice(
                          calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod) +
                          (selectedOffer.deposit || 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 6: Signature */}
        {step === 'signature' && selectedOffer && (
          <motion.div
            key="signature"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-[#1A2753] mb-6">Signature électronique du contrat</h2>

            <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
              <h3 className="text-[#1A2753] mb-4">Récapitulatif</h3>
              
              <div className="space-y-3 pb-6 border-b border-[#F5F6FA]">
                <div className="flex justify-between">
                  <span className="text-[#273A7A]/80">Adresse</span>
                  <span className="text-[#1A2753]">{selectedOffer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#273A7A]/80">Période</span>
                  <span className="text-[#1A2753]">{getPeriodLabel(selectedPeriod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#273A7A]/80">Loyer</span>
                  <span className="text-[#1A2753]">
                    {formatPrice(calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod))}
                  </span>
                </div>
                {selectedOffer.deposit && (
                  <div className="flex justify-between">
                    <span className="text-[#273A7A]/80">Dépôt de garantie</span>
                    <span className="text-[#1A2753]">{formatPrice(selectedOffer.deposit)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-6">
                <span className="text-[#1A2753]">Total à payer</span>
                <span className="text-[#D6A93A] text-2xl">
                  {formatPrice(
                    calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod) +
                    (selectedOffer.deposit || 0)
                  )}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
              <h3 className="text-[#1A2753] mb-4">Signez le contrat</h3>
              <p className="text-[#273A7A]/80 text-sm mb-6">
                Signez électroniquement le contrat de domiciliation pour finaliser votre demande
              </p>
              
              <SignaturePad
                onSave={handleSignature}
              />
            </div>
          </motion.div>
        )}

        {/* Step 7: Payment */}
        {step === 'payment' && selectedOffer && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-[#1A2753] mb-6">Paiement et signature électronique</h2>

            <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
              <h3 className="text-[#1A2753] mb-4">Détails du paiement</h3>
              
              <div className="space-y-3 pb-6 border-b border-[#F5F6FA]">
                <div className="flex justify-between">
                  <span className="text-[#273A7A]/80">Loyer ({getPeriodLabel(selectedPeriod)})</span>
                  <span className="text-[#1A2753]">
                    {formatPrice(calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod))}
                  </span>
                </div>
                {selectedOffer.deposit && (
                  <div className="flex justify-between">
                    <span className="text-[#273A7A]/80">Dépôt de garantie</span>
                    <span className="text-[#1A2753]">{formatPrice(selectedOffer.deposit)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-6">
                <span className="text-[#1A2753]">Total à payer</span>
                <span className="text-[#D6A93A] text-2xl">
                  {formatPrice(
                    calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod) +
                    (selectedOffer.deposit || 0)
                  )}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-[#1A2753] mb-4">Méthode de paiement</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: 'orange', name: 'Orange Money', icon: Smartphone, color: 'from-orange-500 to-orange-600' },
                  { id: 'wave', name: 'Wave', icon: CreditCard, color: 'from-blue-500 to-blue-600' },
                  { id: 'card', name: 'Carte bancaire', icon: CreditCard, color: 'from-purple-500 to-purple-600' }
                ].map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center"
                  >
                    <div className="w-16 h-16 bg-[#F5F6FA] rounded-xl flex items-center justify-center mx-auto mb-3 border border-[#1A2753]/8">
                      <method.icon className="w-6 h-6 text-[#1A2753]" />
                    </div>
                    <p className="text-[#1A2753]">{method.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-[#D6A93A] flex-shrink-0" />
                <div>
                  <p className="text-[#1A2753] mb-2">Paiement sécurisé</p>
                  <p className="text-[#273A7A]/80 text-sm">
                    Après paiement, vous serez invité à signer électroniquement le contrat. 
                    Votre contrat sera actif immédiatement après signature.
                  </p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              disabled={isLoading}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Traitement du paiement...</span>
                </div>
              ) : (
                'Procéder au paiement et à la signature'
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Step 7: Confirmation */}
        {step === 'confirmation' && selectedOffer && (
          <motion.div
            key="confirmation"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle className="w-16 h-16 text-green-600" />
            </motion.div>

            <h2 className="text-[#1A2753] mb-4">Félicitations ! Votre domiciliation est active</h2>
            <p className="text-[#273A7A]/80 mb-8">
              Vous recevrez sous peu un email de confirmation avec tous les détails de votre contrat
            </p>

            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-left">
                  <p className="text-[#273A7A]/80 text-sm mb-1">Adresse de domiciliation</p>
                  <p className="text-[#1A2753]">{selectedOffer.name}</p>
                  <p className="text-[#273A7A]/80 text-sm">{selectedOffer.address}</p>
                </div>
                
                <div className="text-left">
                  <p className="text-[#273A7A]/80 text-sm mb-1">Référence contrat</p>
                  <p className="text-[#1A2753]">DOM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
                
                <div className="text-left">
                  <p className="text-[#273A7A]/80 text-sm mb-1">Période</p>
                  <p className="text-[#1A2753]">{getPeriodLabel(selectedPeriod)}</p>
                </div>
                
                <div className="text-left">
                  <p className="text-[#273A7A]/80 text-sm mb-1">Montant payé</p>
                  <p className="text-[#D6A93A]">
                    {formatPrice(
                      calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod) +
                      (selectedOffer.deposit || 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBack}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 shadow-lg"
              >
                Retour au tableau de bord
              </motion.button>

              <div className="grid grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-white border-2 border-[#273A7A]/20 rounded-xl py-3 flex flex-col items-center justify-center gap-2 text-[#1A2753] hover:border-[#D6A93A] transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-sm">Contrat</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-white border-2 border-[#273A7A]/20 rounded-xl py-3 flex flex-col items-center justify-center gap-2 text-[#1A2753] hover:border-[#D6A93A] transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-sm">Quittance</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-white border-2 border-[#273A7A]/20 rounded-xl py-3 flex flex-col items-center justify-center gap-2 text-[#1A2753] hover:border-[#D6A93A] transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">Support</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal - Visualisation complète du contrat */}
      <AnimatePresence>
        {showContractModal && selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowContractModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-[#1A2753]">Contrat de domiciliation</h2>
                  <p className="text-[#273A7A]/80 text-sm">Version 1.0 - Document complet</p>
                </div>
                <motion.button aria-label="Fermer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowContractModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              <div className="overflow-y-auto p-8">
                <div className="prose prose-sm max-w-none">
                  <div className="text-center mb-8">
                    <h2 className="text-[#1A2753] text-2xl mb-2">CONTRAT DE DOMICILIATION COMMERCIALE</h2>
                    <p className="text-[#273A7A]/80">N° DOM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-[#1A2753] mb-4">ENTRE LES SOUSSIGNÉS :</h3>
                    
                    <div className="bg-[#F5F6FA] rounded-xl p-6 mb-4">
                      <p className="text-[#1A2753] mb-3"><strong>Le domiciliataire :</strong></p>
                      <p className="text-[#273A7A]/80 leading-relaxed">
                        Crésus Services SARL<br />
                        Spécialisée dans la domiciliation d'entreprises<br />
                        Siège social : {selectedOffer.address}, {selectedOffer.city}<br />
                        RC: SN-DKR-2024-B-12345<br />
                        NINEA: 007123456
                      </p>
                    </div>

                    <div className="bg-[#F5F6FA] rounded-xl p-6">
                      <p className="text-[#1A2753] mb-3"><strong>Le domicilié :</strong></p>
                      <p className="text-[#273A7A]/80 leading-relaxed">
                        [Nom de votre société]<br />
                        Représenté par [Nom du représentant légal]<br />
                        En qualité de [Fonction]
                      </p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-[#1A2753] mb-4">ARTICLE 1 - OBJET DU CONTRAT</h3>
                    <p className="text-[#273A7A]/80 leading-relaxed mb-4">
                      Le présent contrat a pour objet la domiciliation de l'entreprise du domicilié à l'adresse suivante :
                    </p>
                    <div className="bg-[#D6A93A]/10 border-l-4 border-[#D6A93A] rounded p-4 mb-4">
                      <p className="text-[#1A2753]">{selectedOffer.name}</p>
                      <p className="text-[#273A7A]/80 text-sm">{selectedOffer.address}</p>
                      <p className="text-[#273A7A]/80 text-sm">{selectedOffer.postalCode} {selectedOffer.city}</p>
                    </div>
                    <p className="text-[#273A7A]/80 leading-relaxed">
                      Cette adresse servira de siège social pour l'immatriculation et l'exercice de l'activité de la société domiciliée, conformément aux dispositions légales en vigueur au Sénégal.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-[#1A2753] mb-4">ARTICLE 2 - DURÉE</h3>
                    <p className="text-[#273A7A]/80 leading-relaxed mb-3">
                      Le contrat est conclu pour une période de <strong>{getPeriodLabel(selectedPeriod)}</strong> à compter de la date de signature.
                    </p>
                    <p className="text-[#273A7A]/80 leading-relaxed">
                      Il pourra être renouvelé par tacite reconduction pour des périodes identiques, sauf dénonciation par l'une des parties moyennant un préavis de <strong>30 jours calendaires</strong> avant l'échéance, adressé par lettre recommandée avec accusé de réception ou par email avec confirmation.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-[#1A2753] mb-4">ARTICLE 3 - SERVICES INCLUS</h3>
                    <p className="text-[#273A7A]/80 leading-relaxed mb-4">
                      Dans le cadre de ce contrat, le domiciliataire s'engage à fournir les services suivants :
                    </p>
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                      <ul className="space-y-3">
                        {selectedOffer.services.map((service, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-[#273A7A]/80">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-[#1A2753] mb-4">ARTICLE 4 - CONDITIONS FINANCIÈRES</h3>
                    <p className="text-[#273A7A]/80 leading-relaxed mb-4">
                      Le tarif de la domiciliation s'élève à :
                    </p>
                    <div className="bg-[#F5F6FA] rounded-xl p-6 mb-4">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                        <span className="text-[#273A7A]/80">Période de facturation</span>
                        <span className="text-[#1A2753]">{getPeriodLabel(selectedPeriod)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[#273A7A]/80">Loyer</span>
                        <span className="text-[#1A2753]">{formatPrice(calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod))}</span>
                      </div>
                      {selectedOffer.deposit && (
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <span className="text-[#273A7A]/80">Dépôt de garantie (remboursable)</span>
                          <span className="text-[#1A2753]">{formatPrice(selectedOffer.deposit)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[#273A7A]/80 leading-relaxed mb-3">
                      Le paiement doit être effectué par virement bancaire, Orange Money, Wave ou carte bancaire dans un délai de <strong>7 jours</strong> suivant l'émission de la facture.
                    </p>
                    <p className="text-[#273A7A]/80 leading-relaxed">
                      Tout retard de paiement entraînera l'application de pénalités de retard au taux de <strong>2% par mois</strong>, ainsi qu'une indemnité forfaitaire de <strong>25 000 FCFA</strong> pour frais de recouvrement.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-[#1A2753] mb-4">ARTICLE 5 - OBLIGATIONS DU DOMICILIÉ</h3>
                    <p className="text-[#273A7A]/80 leading-relaxed mb-4">
                      Le domicilié s'engage à :
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Maintenir une activité effective et régulière</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>S'acquitter ponctuellement des loyers et charges</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Informer le domiciliataire de tout changement dans sa situation juridique</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Ne pas exercer d'activités contraires à la loi ou aux bonnes mœurs</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Retirer régulièrement son courrier (au minimum une fois par semaine)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-[#1A2753] mb-4">ARTICLE 6 - OBLIGATIONS DU DOMICILIATAIRE</h3>
                    <p className="text-[#273A7A]/80 leading-relaxed mb-4">
                      Le domiciliataire s'engage à :
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Mettre à disposition l'adresse de domiciliation convenue</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Assurer la réception et la conservation du courrier</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Fournir les services convenus dans les conditions définies</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Informer le domicilié en cas de changement d'adresse avec un préavis de 3 mois</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-[#1A2753] mb-4">ARTICLE 7 - RÉSILIATION</h3>
                    <p className="text-[#273A7A]/80 leading-relaxed mb-3">
                      Le contrat peut être résilié dans les cas suivants :
                    </p>
                    <ul className="space-y-3 mb-4">
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>À l'initiative de l'une ou l'autre des parties, moyennant un préavis de 30 jours</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>En cas de manquement grave aux obligations contractuelles</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#273A7A]/80">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>En cas de non-paiement après mise en demeure restée sans effet pendant 15 jours</span>
                      </li>
                    </ul>
                    <p className="text-[#273A7A]/80 leading-relaxed">
                      En cas de résiliation anticipée par le domicilié, les sommes déjà versées restent acquises au domiciliataire. Le dépôt de garantie sera restitué dans un délai de 30 jours après état des lieux.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-[#1A2753] mb-4">ARTICLE 8 - CONFIDENTIALITÉ</h3>
                    <p className="text-[#273A7A]/80 leading-relaxed">
                      Le domiciliataire s'engage à respecter la confidentialité de toutes les informations et documents relatifs au domicilié dont il pourrait avoir connaissance dans le cadre de l'exécution du présent contrat.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-[#1A2753] mb-4">ARTICLE 9 - LITIGES</h3>
                    <p className="text-[#273A7A]/80 leading-relaxed">
                      Tout litige relatif à l'interprétation ou à l'exécution du présent contrat sera soumis, à défaut d'accord amiable, aux tribunaux compétents de Dakar, Sénégal.
                    </p>
                  </div>

                  <div className="bg-[#F5F6FA] rounded-xl p-6 mt-10">
                    <p className="text-[#273A7A]/80 text-sm text-center">
                      Fait à Dakar, le {new Date().toLocaleDateString('fr-FR')}<br />
                      En deux exemplaires originaux
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="text-center">
                      <p className="text-[#1A2753] mb-6">Le domiciliataire</p>
                      <div className="border-t-2 border-dashed border-gray-300 pt-3">
                        <p className="text-[#273A7A]/80 text-sm">Signature</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[#1A2753] mb-6">Le domicilié</p>
                      <div className="border-t-2 border-dashed border-gray-300 pt-3">
                        <p className="text-[#273A7A]/80 text-sm">Signature</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-[#1A2753] text-white rounded-xl py-3 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Télécharger le contrat PDF</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal - Motifs de rejet */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2>Rejet du contrat</h2>
                    <p className="text-white/80 text-sm mt-1">Veuillez préciser le motif de votre rejet</p>
                  </div>
                  <motion.button aria-label="Fermer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowRejectModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="p-8">
                <p className="text-[#273A7A]/80 mb-6">
                  Sélectionnez le motif principal qui justifie le rejet de ce contrat
                </p>

                <div className="space-y-3 mb-6">
                  {REJECTION_REASONS.map((reason) => (
                    <motion.button
                      key={reason}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedRejectionReason(reason)}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedRejectionReason === reason
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedRejectionReason === reason
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedRejectionReason === reason && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-[#1A2753]">{reason}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence>
                  {selectedRejectionReason === 'Autre (précisez)' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <label className="text-[#1A2753] mb-2 block">
                        Précisez votre motif
                      </label>
                      <textarea
                        value={customRejectionReason}
                        onChange={(e) => setCustomRejectionReason(e.target.value)}
                        placeholder="Décrivez la raison de votre rejet..."
                        className="w-full bg-[#F5F6FA] rounded-xl p-4 text-[#1A2753] outline-none resize-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                        rows={4}
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {contractComments && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-blue-900 mb-2">Vos commentaires précédents :</p>
                    <p className="text-blue-700 text-sm italic">"{contractComments}"</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowRejectModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-white border-2 border-gray-300 text-[#1A2753] rounded-xl py-4 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleRejectSubmit}
                    disabled={!selectedRejectionReason || (selectedRejectionReason === 'Autre (précisez)' && !customRejectionReason.trim())}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Confirmer le rejet</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
