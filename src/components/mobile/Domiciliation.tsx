import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
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
  Download,
  Eye,
  FileText,
  FileCheck,
  HelpCircle,
  House,
  IdentificationCard,
  Mail,
  MapPin,
  MessageSquare,
  Pen,
  Phone,
  Plus,
  Shield,
  Smartphone,
  Trash2,
  Upload,
  User,
  Wifi,
  X,
  XCircle,
} from '../ui/icons';
import { mockDomiciliationOffers, getPeriodLabel, calculatePeriodPrice, type DomiciliationOffer, type PeriodType } from '../../data/domiciliationData';
import { SignaturePad } from './SignaturePad';
import { useApp } from '../../context/AppContext';
import { getCompanyStatusLabel, getCompanyStatusColor } from '../../domain/companyStatus';

interface DomiciliationProps {
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

export const Domiciliation: React.FC<DomiciliationProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('company-status');
  const { addDomiciliation, currentUser, companies } = useApp();

  /** Sociétés immatriculées du client : celles qu'une adresse peut accueillir. */
  const societesDuClient = companies.filter(
    c => c.userId === currentUser?.id && c.status === 'completed',
  );
  /** `null` : société non gérée sur Crésus. */
  const [societeADomicilier, setSocieteADomicilier] = useState<string | null>(null);
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
    setStep('offers');
  };

  const handleSignature = (signatureData: string) => {
    setSignature(signatureData);
    setStep('payment');
  };

  const handlePayment = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);

    // Le parcours mobile annonçait « Votre domiciliation est active » sans rien
    // enregistrer : la souscription n'atteignait ni « Mes domiciliations », ni
    // l'administration. Le parcours web avait le même défaut, corrigé depuis.
    if (selectedOffer) {
      const debut = new Date();
      const mois = { monthly: 1, quarterly: 3, biannual: 6, yearly: 12 }[selectedPeriod];
      const fin = new Date(debut);
      fin.setMonth(fin.getMonth() + mois);
      addDomiciliation({
        offerId: selectedOffer.id,
        userId: currentUser?.id || '',
        companyId: societeADomicilier ?? undefined,
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
        companyRegistered: companyRegistered ?? undefined,
        contractAccepted,
      });
    }

    setStep('confirmation');
  };

  const handleDocsContinue = () => {
    if (companyRegistered === false) {
      setStep('company-info');
    } else {
      setStep('contract-review');
    }
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
      if (companyRegistered === false) {
        setStep('company-info');
      } else {
        setStep('documents');
      }
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
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2753] to-[#273A7A] text-white px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-7 rounded-b-[2rem] shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D6A93A]/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />

        <div className="relative flex items-center gap-3 mb-5">
          <motion.button aria-label="Retour"
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg">Domiciliation</h1>
            <p className="text-white/70 text-xs mt-0.5">
              {step === 'company-status' && 'Statut d\'immatriculation'}
              {step === 'company-select' && 'Société à domicilier'}
              {step === 'offers' && 'Choisissez votre adresse'}
              {step === 'offer-details' && 'Détails de l\'offre'}
              {step === 'period' && 'Période de location'}
              {step === 'documents' && 'Pièces justificatives'}
              {step === 'company-info' && 'Fiche de renseignements'}
              {step === 'contract-review' && 'Révision du contrat'}
              {step === 'signature' && 'Signature'}
              {step === 'payment' && 'Paiement'}
              {step === 'confirmation' && 'Confirmation'}
            </p>
          </div>
        </div>

        {/* Progress */}
        {step !== 'confirmation' && (
          <div className="relative flex items-center gap-1.5">
            {['company-status', 'offers', 'period', 'documents', 'contract-review', 'signature', 'payment'].map((s, index) => {
              const currentIdx = ['company-status', 'offers', 'offer-details', 'period', 'documents', 'company-info', 'contract-review', 'signature', 'payment'].indexOf(step);
              return (
                <motion.div
                  key={s}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.06 }}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    currentIdx > index ? 'bg-[#D6A93A]' : currentIdx === index ? 'bg-[#D6A93A]/60' : 'bg-white/10'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="px-5 mt-5">
        {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
        <AnimatePresence mode="popLayout">
          {/* Step 0: Statut d'immatriculation */}
          {step === 'company-status' && (
            <motion.div
              key="company-status"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-[#1A2753] mb-4">Votre société est-elle immatriculée ?</h2>

              <div className="space-y-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCompanyRegistered(true);
                    setStep(societesDuClient.length > 0 ? 'company-select' : 'offers');
                  }}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-5 shadow-sm text-left border-2 transition-all ${
                    companyRegistered === true ? 'border-green-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BadgeCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#1A2753] mb-1">Oui, ma société est immatriculée</h3>
                      <p className="text-[#273A7A]/80 text-sm">
                        J&apos;ai un RCCM, NINEA et des statuts enregistrés.
                      </p>
                      <p className="text-[#273A7A]/80 text-xs mt-2">
                        Documents requis : CNI, Statuts, RCCM, NINEA
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#273A7A]/40 flex-shrink-0 mt-2" />
                  </div>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setCompanyRegistered(false); setStep('offers'); }}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-5 shadow-sm text-left border-2 transition-all ${
                    companyRegistered === false ? 'border-orange-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#1A2753] mb-1">Non, pas encore immatriculée</h3>
                      <p className="text-[#273A7A]/80 text-sm">
                        Ma société est en cours de création ou pas encore enregistrée.
                      </p>
                      <p className="text-[#273A7A]/80 text-xs mt-2">
                        Documents requis : CIN du représentant + fiche de renseignements
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#273A7A]/40 flex-shrink-0 mt-2" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Liste des offres */}
          {step === 'company-select' && (
            <motion.div
              key="company-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-[#1A2753] mb-1">Quelle société domicilier ?</h2>
              <p className="text-[#273A7A]/80 text-sm mb-4">
                L'adresse choisie deviendra son siège social.
              </p>

              <div className="space-y-3">
                {societesDuClient.map(societe => (
                  <motion.button
                    key={societe.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSocieteADomicilier(societe.id);
                      setStep('offers');
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-4 shadow-sm text-left flex items-center gap-3"
                  >
                    <div className="w-11 h-11 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-[#D6A93A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1A2753] text-sm mb-0.5 truncate">{societe.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[#273A7A]/80 text-xs">{societe.legalForm}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${getCompanyStatusColor(societe.status)}`}>
                          {getCompanyStatusLabel(societe.status)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#273A7A]/40 flex-shrink-0" />
                  </motion.button>
                ))}

                {/* Une société créée ailleurs n'apparaît pas dans cette liste. */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSocieteADomicilier(null);
                    setStep('offers');
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-4 shadow-sm text-left flex items-center gap-3"
                >
                  <div className="w-11 h-11 bg-[#F5F6FA] rounded-xl flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-[#273A7A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A2753] text-sm mb-0.5">Une autre société</p>
                    <p className="text-[#273A7A]/80 text-xs">
                      Elle n'a pas été créée avec Crésus.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#273A7A]/40 flex-shrink-0" />
                </motion.button>
              </div>
            </motion.div>
          )}
          {step === 'offers' && (
            <motion.div
              key="offers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-[#1A2753] mb-4">Nos offres de domiciliation</h2>
              
              <div className="space-y-4">
                {mockDomiciliationOffers.filter(o => o.status === 'published').map((offer, index) => (
                  <motion.button
                    key={offer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOfferSelect(offer)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 text-left"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-[#273A7A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-[#273A7A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#1A2753] mb-1">{offer.name}</h3>
                        <div className="flex items-center gap-1 text-[#273A7A]/80 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{offer.zone}, {offer.city}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#273A7A]/40 flex-shrink-0" />
                    </div>

                    <p className="text-[#273A7A]/80 text-sm mb-3 line-clamp-2">
                      {offer.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#D6A93A] mb-1">
                          {formatPrice(offer.prices.monthly)}/mois
                        </p>
                        <p className="text-[#273A7A]/80 text-xs">
                          {offer.available}/{offer.quota} places disponibles
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Disponible</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Détails de l'offre */}
          {step === 'offer-details' && selectedOffer && (
            <motion.div
              key="offer-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-[#273A7A]/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-[#273A7A]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[#1A2753] mb-2">{selectedOffer.name}</h2>
                    <div className="flex items-center gap-2 text-[#273A7A]/80 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedOffer.address}, {selectedOffer.zone}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[#273A7A]/80 text-sm mb-4">
                  {selectedOffer.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-[#1A2753] text-sm mb-2">Services inclus</p>
                    <div className="space-y-2">
                      {selectedOffer.services.map((service, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[#273A7A]/80 text-sm">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[#1A2753] text-sm mb-2">Équipements</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedOffer.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[#D6A93A]/10 text-[#D6A93A] text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F5F6FA]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#273A7A]/80 text-sm">Capacité</span>
                      <span className="text-[#1A2753]">{selectedOffer.receptionCapacity} courriers/mois</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#273A7A]/80 text-sm">Disponibilité</span>
                      <span className="text-green-600">{selectedOffer.available} places</span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('period')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-2xl py-4 shadow-lg"
              >
                Continuer
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Choix de la période */}
          {step === 'period' && selectedOffer && (
            <motion.div
              key="period"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Breadcrumb */}
              <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-3 mb-4 border-l-4 border-[#D6A93A]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#D6A93A]" />
                  <div>
                    <p className="text-[#273A7A]/80 text-xs">Adresse sélectionnée</p>
                    <p className="text-[#1A2753] text-sm">{selectedOffer.name}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-[#1A2753] mb-4">Choisissez votre période</h2>

              <div className="space-y-3">
                {(['monthly', 'quarterly', 'biannual', 'yearly'] as PeriodType[]).map((period) => {
                  const price = calculatePeriodPrice(selectedOffer.prices.monthly, period);
                  const discount = period === 'quarterly' ? '5%' : period === 'biannual' ? '8%' : period === 'yearly' ? '12%' : null;
                  
                  return (
                    <motion.button
                      key={period}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePeriodSelect(period)}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 text-left border-2 ${
                        selectedPeriod === period ? 'border-[#D6A93A]' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[#1A2753]">{getPeriodLabel(period)}</p>
                            {discount && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                -{discount}
                              </span>
                            )}
                          </div>
                          <p className="text-[#D6A93A]">{formatPrice(price)}</p>
                          <p className="text-[#273A7A]/80 text-xs">
                            {period === 'monthly' && 'Paiement mensuel'}
                            {period === 'quarterly' && 'Paiement tous les 3 mois'}
                            {period === 'biannual' && 'Paiement tous les 6 mois'}
                            {period === 'yearly' && 'Paiement annuel'}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#273A7A]/40" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {selectedOffer.deposit && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-900 text-sm mb-1">Dépôt de garantie</p>
                      <p className="text-blue-700 text-xs">
                        Un dépôt de garantie de {formatPrice(selectedOffer.deposit)} sera requis
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Upload documents */}
          {step === 'documents' && selectedOffer && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Breadcrumb */}
              <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-3 mb-4 border-l-4 border-[#D6A93A]">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#D6A93A]" />
                    <p className="text-[#1A2753] text-sm">{selectedOffer.name}</p>
                  </div>
                  <div className="flex items-center gap-2 pl-1">
                    <Calendar className="w-4 h-4 text-[#D6A93A]" />
                    <p className="text-[#1A2753] text-xs">{getPeriodLabel(selectedPeriod)}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-[#1A2753] mb-2">Pièces justificatives</h2>
              <p className="text-[#273A7A]/80 text-sm mb-4">
                Téléversez les documents requis pour votre dossier
              </p>

              <div className="space-y-3">
                {requiredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={`bg-white rounded-xl p-4 shadow-sm ${
                      doc.uploaded ? 'border-2 border-green-500' : 'border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <doc.icon className="w-5 h-5 text-[#1A2753]/70" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[#1A2753] text-sm">{doc.label}</p>
                          {doc.optional && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              Optionnel
                            </span>
                          )}
                        </div>
                        {doc.uploaded ? (
                          <p className="text-green-600 text-xs flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Téléversé
                          </p>
                        ) : (
                          <p className="text-[#273A7A]/80 text-xs">En attente</p>
                        )}
                      </div>
                      {!doc.uploaded ? (
                        <motion.button aria-label="Téléverser le document"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDocUpload(doc.id)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-10 h-10 bg-[#D6A93A]/10 rounded-lg flex items-center justify-center"
                        >
                          <Upload className="w-5 h-5 text-[#D6A93A]" />
                        </motion.button>
                      ) : (
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleDocsContinue}
                disabled={!uploadedDocs.includes('cni') || (companyRegistered === true && (!uploadedDocs.includes('statuts') || !uploadedDocs.includes('rc') || !uploadedDocs.includes('ninea')))}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-2xl py-4 shadow-lg mt-6 disabled:opacity-50"
              >
                Continuer
              </motion.button>
            </motion.div>
          )}

          {/* Step 4b: Company Info (for non-registered companies) */}
          {step === 'company-info' && (
            <motion.div
              key="company-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-[#1A2753] mb-2">Fiche de renseignements</h2>
              <p className="text-[#273A7A]/80 text-sm mb-4">
                Veuillez renseigner les informations de votre société en cours de création.
              </p>

              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="block text-[#273A7A]/80 text-sm mb-2">Dénomination <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={companyInfo.denomination}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, denomination: e.target.value })}
                      placeholder="Nom de la société"
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#273A7A]/80 text-sm mb-2">Forme juridique <span className="text-red-500">*</span></label>
                    <select
                      value={companyInfo.formeJuridique}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, formeJuridique: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none"
                    >
                      <option value="">Sélectionner</option>
                      {FORMES_JURIDIQUES.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#273A7A]/80 text-sm mb-2">Objet social <span className="text-red-500">*</span></label>
                    <textarea
                      value={companyInfo.objetSocial}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, objetSocial: e.target.value })}
                      placeholder="Description de l'activité"
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-[#273A7A]/80 text-sm mb-2">Capital social (FCFA) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={companyInfo.capitalSocial}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, capitalSocial: e.target.value })}
                      placeholder="Ex: 1 000 000"
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#273A7A]/80 text-sm mb-2">Profession</label>
                    <input
                      type="text"
                      value={companyInfo.profession}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, profession: e.target.value })}
                      placeholder="Ex: Consultant"
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#273A7A]/80 text-sm mb-2">Téléphone <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        value={companyInfo.telephone}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, telephone: e.target.value })}
                        placeholder="+221 77..."
                        className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#273A7A]/80 text-sm mb-2">Email <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                        placeholder="email@exemple.sn"
                        className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Associés */}
                <div className="bg-white rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[#1A2753] flex items-center gap-2">
                      <User className="w-5 h-5 text-[#D6A93A]" />
                      Associés
                    </h3>
                    <button aria-label="Ajouter un associé"
                      onClick={() => setCompanyInfo({ ...companyInfo, associes: [...companyInfo.associes, { nom: '', pourcentage: '' }] })}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-8 h-8 bg-[#D6A93A]/10 rounded-lg flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 text-[#D6A93A]" />
                    </button>
                  </div>
                  {companyInfo.associes.map((associe, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={associe.nom}
                        onChange={(e) => {
                          const newAssocies = [...companyInfo.associes];
                          newAssocies[idx].nom = e.target.value;
                          setCompanyInfo({ ...companyInfo, associes: newAssocies });
                        }}
                        placeholder="Nom complet"
                        className="flex-1 px-3 py-2 bg-[#F5F6FA] rounded-lg text-[#1A2753] text-sm outline-none"
                      />
                      <input
                        type="text"
                        value={associe.pourcentage}
                        onChange={(e) => {
                          const newAssocies = [...companyInfo.associes];
                          newAssocies[idx].pourcentage = e.target.value;
                          setCompanyInfo({ ...companyInfo, associes: newAssocies });
                        }}
                        placeholder="%"
                        className="w-16 px-3 py-2 bg-[#F5F6FA] rounded-lg text-[#1A2753] text-sm text-center outline-none"
                      />
                      {companyInfo.associes.length > 1 && (
                        <button aria-label="Supprimer l'associé"
                          onClick={() => {
                            const newAssocies = companyInfo.associes.filter((_, i) => i !== idx);
                            setCompanyInfo({ ...companyInfo, associes: newAssocies });
                          }}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('contract-review')}
                  disabled={!companyInfo.denomination || !companyInfo.formeJuridique || !companyInfo.telephone || !companyInfo.email}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-2xl py-4 shadow-lg disabled:opacity-50"
                >
                  Continuer
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Contract Review */}
          {step === 'contract-review' && selectedOffer && (
            <motion.div
              key="contract-review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-[#1A2753] mb-4">Contrat de domiciliation</h2>

              <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#273A7A]/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#273A7A]" />
                  </div>
                  <div>
                    <p className="text-[#1A2753]">Contrat V1.0</p>
                    <p className="text-[#273A7A]/80 text-sm">Généré le {new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <div className="bg-[#F5F6FA] rounded-xl p-4 mb-4">
                  <p className="text-[#273A7A]/80 text-sm leading-relaxed line-clamp-6">
                    Ce contrat établit les conditions de domiciliation pour <strong>{selectedOffer.name}</strong>.
                    <br /><br />
                    • Période: {getPeriodLabel(selectedPeriod)}
                    <br />
                    • Montant: {formatPrice(calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod))}
                    <br />
                    • Services: {selectedOffer.services.join(', ')}
                    <br /><br />
                    Le présent contrat entre en vigueur à la date de signature et peut être renouvelé automatiquement...
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowContractModal(true)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-[#273A7A]/10 text-[#1A2753] rounded-xl py-3 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    <span className="text-sm">Voir</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-[#273A7A]/10 text-[#1A2753] rounded-xl py-3 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-sm">Télécharger</span>
                  </motion.button>
                </div>

                <div>
                  <label className="text-[#1A2753] text-sm mb-2 block">
                    Commentaires (optionnel)
                  </label>
                  <textarea
                    value={contractComments}
                    onChange={(e) => setContractComments(e.target.value)}
                    placeholder="Ajoutez vos questions ou remarques..."
                    className="w-full bg-[#F5F6FA] rounded-xl p-3 text-[#1A2753] text-sm outline-none resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Mentions légales checkbox */}
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="contractAccepted"
                    checked={contractAccepted}
                    onChange={(e) => setContractAccepted(e.target.checked)}
                    className="w-5 h-5 text-[#D6A93A] mt-0.5 flex-shrink-0"
                  />
                  <label htmlFor="contractAccepted" className="text-[#273A7A] text-xs leading-relaxed">
                    J&apos;accepte les conditions générales de domiciliation, les mentions légales et la politique de confidentialité de Crésus. Je reconnais avoir pris connaissance des obligations contractuelles et m&apos;engage à les respecter.
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContractValidation('reject')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-white border-2 border-red-200 text-red-600 rounded-xl py-4 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  <span>Rejeter</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContractValidation('validate')}
                  disabled={!contractAccepted}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  <span>Valider</span>
                </motion.button>
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
            >
              <h2 className="text-[#1A2753] mb-4">Signature du contrat</h2>

              <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                <div className="space-y-3 pb-4 border-b border-[#F5F6FA]">
                  <div className="flex justify-between">
                    <span className="text-[#273A7A]/80">Période</span>
                    <span className="text-[#1A2753]">{getPeriodLabel(selectedPeriod)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#273A7A]/80">Montant</span>
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
                
                <div className="flex justify-between pt-4">
                  <span className="text-[#1A2753]">Total à payer</span>
                  <span className="text-[#D6A93A]">
                    {formatPrice(
                      calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod) +
                      (selectedOffer.deposit || 0)
                    )}
                  </span>
                </div>
              </div>

              <SignaturePad
                onSave={handleSignature}
              />
            </motion.div>
          )}

          {/* Step 7: Paiement */}
          {step === 'payment' && selectedOffer && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-[#1A2753] mb-4">Paiement</h2>

              <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                <div className="space-y-3 pb-4 border-b border-[#F5F6FA]">
                  <div className="flex justify-between">
                    <span className="text-[#273A7A]/80">Période</span>
                    <span className="text-[#1A2753]">{getPeriodLabel(selectedPeriod)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#273A7A]/80">Montant</span>
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
                
                <div className="flex justify-between pt-4">
                  <span className="text-[#1A2753]">Total à payer</span>
                  <span className="text-[#D6A93A]">
                    {formatPrice(
                      calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod) +
                      (selectedOffer.deposit || 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-[#1A2753] text-sm">Choisissez votre méthode de paiement</p>
                
                {[
                  { id: 'orange', name: 'Orange Money', icon: Smartphone, color: 'from-orange-500 to-orange-600' },
                  { id: 'wave', name: 'Wave', icon: CreditCard, color: 'from-blue-500 to-blue-600' },
                  { id: 'card', name: 'Carte bancaire', icon: CreditCard, color: 'from-purple-500 to-purple-600' }
                ].map((method) => (
                  <motion.button
                    key={method.id}
                    whileTap={{ scale: 0.98 }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-[#F5F6FA] rounded-xl flex items-center justify-center border border-[#1A2753]/8">
                      <method.icon className="w-5 h-5 text-[#1A2753]" />
                    </div>
                    <span className="text-[#1A2753] flex-1 text-left">{method.name}</span>
                    <ChevronRight className="w-5 h-5 text-[#273A7A]/40" />
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                disabled={isLoading}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-2xl py-4 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Traitement...</span>
                  </div>
                ) : (
                  'Confirmer le paiement'
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Step 8: Confirmation */}
          {step === 'confirmation' && selectedOffer && (
            <motion.div
              key="confirmation"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>

              <h2 className="text-[#1A2753] mb-3">Domiciliation confirmée !</h2>
              <p className="text-[#273A7A]/80 mb-6">
                Votre contrat est actif et vous recevrez tous les détails par email
              </p>

              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F5F6FA]">
                    <span className="text-[#273A7A]/80 text-sm">Adresse</span>
                    <span className="text-[#1A2753] text-sm">{selectedOffer.name}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#F5F6FA]">
                    <span className="text-[#273A7A]/80 text-sm">Période</span>
                    <span className="text-[#1A2753] text-sm">{getPeriodLabel(selectedPeriod)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#273A7A]/80 text-sm">Montant</span>
                    <span className="text-[#D6A93A] text-sm">
                      {formatPrice(calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onBack}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-2xl py-4 shadow-lg"
                >
                  Retour au tableau de bord
                </motion.button>

                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-white border-2 border-[#273A7A]/20 rounded-xl py-3 flex items-center justify-center gap-2 text-[#1A2753]"
                  >
                    <Download className="w-5 h-5" />
                    <span>Contrat</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-white border-2 border-[#273A7A]/20 rounded-xl py-3 flex items-center justify-center gap-2 text-[#1A2753]"
                  >
                    <Download className="w-5 h-5" />
                    <span>Quittance</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal - Visualisation complète du contrat */}
      <AnimatePresence>
        {showContractModal && selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowContractModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-[#1A2753]">Contrat de domiciliation</h3>
                <motion.button aria-label="Fermer"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowContractModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              <div className="overflow-y-auto p-6 pb-24 max-h-[80vh]">
                <div className="prose prose-sm max-w-none">
                  <div className="text-center mb-6">
                    <h2 className="text-[#1A2753] mb-2">CONTRAT DE DOMICILIATION COMMERCIALE</h2>
                    <p className="text-[#273A7A]/80 text-sm">N° DOM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#1A2753] mb-3">ENTRE LES SOUSSIGNÉS :</h3>
                    
                    <div className="bg-[#F5F6FA] rounded-xl p-4 mb-3">
                      <p className="text-[#1A2753] mb-2"><strong>Le domiciliataire :</strong></p>
                      <p className="text-[#273A7A]/80 text-sm mb-1">
                        Crésus Services SARL<br />
                        Spécialisée dans la domiciliation d'entreprises<br />
                        Siège social : {selectedOffer.address}, {selectedOffer.city}<br />
                        RC: SN-DKR-2024-B-12345<br />
                        NINEA: 007123456
                      </p>
                    </div>

                    <div className="bg-[#F5F6FA] rounded-xl p-4">
                      <p className="text-[#1A2753] mb-2"><strong>Le domicilié :</strong></p>
                      <p className="text-[#273A7A]/80 text-sm">
                        [Nom de votre société]<br />
                        Représenté par [Nom du représentant légal]<br />
                        En qualité de [Fonction]
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#1A2753] mb-3">ARTICLE 1 - OBJET DU CONTRAT</h3>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed mb-3">
                      Le présent contrat a pour objet la domiciliation de l'entreprise du domicilié à l'adresse suivante :
                    </p>
                    <div className="bg-[#D6A93A]/10 border-l-4 border-[#D6A93A] rounded p-3 mb-3">
                      <p className="text-[#1A2753]">{selectedOffer.name}</p>
                      <p className="text-[#273A7A]/80 text-sm">{selectedOffer.address}</p>
                      <p className="text-[#273A7A]/80 text-sm">{selectedOffer.postalCode} {selectedOffer.city}</p>
                    </div>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed">
                      Cette adresse servira de siège social pour l'immatriculation et l'exercice de l'activité de la société domiciliée, conformément aux dispositions légales en vigueur au Sénégal.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#1A2753] mb-3">ARTICLE 2 - DURÉE</h3>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed mb-2">
                      Le contrat est conclu pour une période de <strong>{getPeriodLabel(selectedPeriod)}</strong> à compter de la date de signature.
                    </p>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed">
                      Il pourra être renouvelé par tacite reconduction pour des périodes identiques, sauf dénonciation par l'une des parties moyennant un préavis de <strong>30 jours calendaires</strong> avant l'échéance, adressé par lettre recommandée avec accusé de réception ou par email avec confirmation.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#1A2753] mb-3">ARTICLE 3 - SERVICES INCLUS</h3>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed mb-3">
                      Dans le cadre de ce contrat, le domiciliataire s'engage à fournir les services suivants :
                    </p>
                    <ul className="space-y-2">
                      {selectedOffer.services.map((service, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#1A2753] mb-3">ARTICLE 4 - CONDITIONS FINANCIÈRES</h3>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed mb-3">
                      Le tarif de la domiciliation s'élève à :
                    </p>
                    <div className="bg-[#F5F6FA] rounded-xl p-4 mb-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-[#273A7A]/80 text-sm">Période de facturation</span>
                        <span className="text-[#1A2753]">{getPeriodLabel(selectedPeriod)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[#273A7A]/80 text-sm">Loyer</span>
                        <span className="text-[#1A2753]">{formatPrice(calculatePeriodPrice(selectedOffer.prices.monthly, selectedPeriod))}</span>
                      </div>
                      {selectedOffer.deposit && (
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-[#273A7A]/80 text-sm">Dépôt de garantie (remboursable)</span>
                          <span className="text-[#1A2753]">{formatPrice(selectedOffer.deposit)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed mb-2">
                      Le paiement doit être effectué par virement bancaire, Orange Money, Wave ou carte bancaire dans un délai de <strong>7 jours</strong> suivant l'émission de la facture.
                    </p>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed">
                      Tout retard de paiement entraînera l'application de pénalités de retard au taux de <strong>2% par mois</strong>, ainsi qu'une indemnité forfaitaire de <strong>25 000 FCFA</strong> pour frais de recouvrement.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#1A2753] mb-3">ARTICLE 5 - OBLIGATIONS DU DOMICILIÉ</h3>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed mb-3">
                      Le domicilié s'engage à :
                    </p>
                    <ul className="space-y-2 mb-3">
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Maintenir une activité effective et régulière</span>
                      </li>
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>S'acquitter ponctuellement des loyers et charges</span>
                      </li>
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Informer le domiciliataire de tout changement dans sa situation juridique</span>
                      </li>
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Ne pas exercer d'activités contraires à la loi ou aux bonnes mœurs</span>
                      </li>
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Retirer régulièrement son courrier (au minimum une fois par semaine)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#1A2753] mb-3">ARTICLE 6 - OBLIGATIONS DU DOMICILIATAIRE</h3>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed mb-3">
                      Le domiciliataire s'engage à :
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Mettre à disposition l'adresse de domiciliation convenue</span>
                      </li>
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Assurer la réception et la conservation du courrier</span>
                      </li>
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Fournir les services convenus dans les conditions définies</span>
                      </li>
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>Informer le domicilié en cas de changement d'adresse avec un préavis de 3 mois</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#1A2753] mb-3">ARTICLE 7 - RÉSILIATION</h3>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed mb-2">
                      Le contrat peut être résilié dans les cas suivants :
                    </p>
                    <ul className="space-y-2 mb-3">
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>À l'initiative de l'une ou l'autre des parties, moyennant un préavis de 30 jours</span>
                      </li>
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>En cas de manquement grave aux obligations contractuelles</span>
                      </li>
                      <li className="flex items-start gap-2 text-[#273A7A]/80 text-sm">
                        <span className="text-[#D6A93A] flex-shrink-0">•</span>
                        <span>En cas de non-paiement après mise en demeure restée sans effet pendant 15 jours</span>
                      </li>
                    </ul>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed">
                      En cas de résiliation anticipée par le domicilié, les sommes déjà versées restent acquises au domiciliataire. Le dépôt de garantie sera restitué dans un délai de 30 jours après état des lieux.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#1A2753] mb-3">ARTICLE 8 - CONFIDENTIALITÉ</h3>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed">
                      Le domiciliataire s'engage à respecter la confidentialité de toutes les informations et documents relatifs au domicilié dont il pourrait avoir connaissance dans le cadre de l'exécution du présent contrat.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-[#1A2753] mb-3">ARTICLE 9 - LITIGES</h3>
                    <p className="text-[#273A7A]/80 text-sm leading-relaxed">
                      Tout litige relatif à l'interprétation ou à l'exécution du présent contrat sera soumis, à défaut d'accord amiable, aux tribunaux compétents de Dakar, Sénégal.
                    </p>
                  </div>

                  <div className="bg-[#F5F6FA] rounded-xl p-4 mt-8">
                    <p className="text-[#273A7A]/80 text-xs text-center">
                      Fait à Dakar, le {new Date().toLocaleDateString('fr-FR')}<br />
                      En deux exemplaires originaux
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <p className="text-[#1A2753] text-sm mb-4">Le domiciliataire</p>
                      <div className="border-t-2 border-dashed border-gray-300 pt-2">
                        <p className="text-[#273A7A]/80 text-xs">Signature</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[#1A2753] text-sm mb-4">Le domicilié</p>
                      <div className="border-t-2 border-dashed border-gray-300 pt-2">
                        <p className="text-[#273A7A]/80 text-xs">Signature</p>
                      </div>
                    </div>
                  </div>
                </div>
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-[#1A2753]">Motif de rejet</h3>
                <motion.button aria-label="Fermer"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowRejectModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              <div className="p-6 pb-24">
                <p className="text-[#273A7A]/80 text-sm mb-4">
                  Veuillez sélectionner le motif principal de votre rejet
                </p>

                <div className="space-y-2 mb-4">
                  {REJECTION_REASONS.map((reason) => (
                    <motion.button
                      key={reason}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRejectionReason(reason)}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedRejectionReason === reason
                          ? 'border-[#D6A93A] bg-[#D6A93A]/5'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedRejectionReason === reason
                            ? 'border-[#D6A93A] bg-[#D6A93A]'
                            : 'border-gray-300'
                        }`}>
                          {selectedRejectionReason === reason && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-[#1A2753] text-sm">{reason}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {selectedRejectionReason === 'Autre (précisez)' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <label className="text-[#1A2753] text-sm mb-2 block">
                      Précisez votre motif
                    </label>
                    <textarea
                      value={customRejectionReason}
                      onChange={(e) => setCustomRejectionReason(e.target.value)}
                      placeholder="Décrivez la raison de votre rejet..."
                      className="w-full bg-[#F5F6FA] rounded-xl p-3 text-[#1A2753] text-sm outline-none resize-none"
                      rows={4}
                    />
                  </motion.div>
                )}

                {contractComments && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                    <p className="text-blue-900 text-sm mb-2">Vos commentaires précédents :</p>
                    <p className="text-blue-700 text-xs italic">"{contractComments}"</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowRejectModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-white border-2 border-gray-200 text-[#1A2753] rounded-xl py-4"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRejectSubmit}
                    disabled={!selectedRejectionReason || (selectedRejectionReason === 'Autre (précisez)' && !customRejectionReason.trim())}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl py-4 disabled:opacity-50 flex items-center justify-center gap-2"
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