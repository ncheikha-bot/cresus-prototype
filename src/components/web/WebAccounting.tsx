import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boat,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Crown,
  DollarSign,
  Download,
  FileText,
  Folder,
  HardHat,
  Info,
  Mail,
  Phone,
  Plus,
  Receipt,
  Send,
  Settings,
  Shield,
  Sparkles,
  Star,
  Storefront,
  TrendingUp,
  Upload,
  Users,
  X,
  Zap,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import {
  ACCOUNTING_PACKS,
  BUSINESS_SECTORS,
  TAX_TYPES,
  DOCUMENT_TYPES,
  mockTaxDeclarations,
  getMonthStatusLabel,
  getMonthStatusColor,
  getTaxStatusLabel,
  calculatePackPrice,
  type AccountingPackType,
  type AccountingFolder,
  type MonthlyAccountingData,
} from '../../data/accountingData';
import { WebSendAccountingDocuments } from './WebSendAccountingDocuments';
import { WebAccountingDashboardImproved } from './WebAccountingDashboardImproved';
import { toast } from 'sonner';

interface WebAccountingProps {
  onBack: () => void;
}

type Step = 'questionnaire' | 'formalites' | 'result' | 'setup' | 'mandate' | 'collection' | 'dashboard';

type ActivityType = 'service' | 'commerce' | 'btp' | 'import-export' | 'autre' | '';
type EmployeeRange = '' | '0' | '1-5' | '6-20' | '21-50' | '51+';
type VolumeLevel = '' | 'faible' | 'moyen' | 'eleve';

interface SimulationData {
  activite: ActivityType;
  tva: boolean | null;
  tvaFrequence: 'mensuelle' | 'trimestrielle';
  salaries: EmployeeRange;
  volume: VolumeLevel;
  multiSites: boolean | null;
  multiActivites: boolean | null;
  paie: boolean | null;
  paieSalaries: string;
}

const FORFAIT_DEMARRAGE = 150000;

function getRecommendedPack(data: SimulationData): { pack: AccountingPackType; needsDevis: boolean; score: number } {
  let score = 0;
  const actScores: Record<string, number> = { service: 1, commerce: 2, btp: 3, 'import-export': 3, autre: 2 };
  score += actScores[data.activite] || 0;
  if (data.tva) score += data.tvaFrequence === 'mensuelle' ? 2 : 1;
  const empScores: Record<string, number> = { '0': 0, '1-5': 1, '6-20': 2, '21-50': 3, '51+': 5 };
  score += empScores[data.salaries] || 0;
  const volScores: Record<string, number> = { faible: 0, moyen: 1, eleve: 3 };
  score += volScores[data.volume] || 0;
  if (data.multiSites) score += 2;
  if (data.multiActivites) score += 2;
  if (data.paie) score += 2;
  if (score >= 15) return { pack: 'premium', needsDevis: true, score };
  if (score >= 11) return { pack: 'premium', needsDevis: false, score };
  if (score >= 8) return { pack: 'business', needsDevis: false, score };
  if (score >= 5) return { pack: 'standard', needsDevis: false, score };
  return { pack: 'essentiel', needsDevis: false, score };
}

export const WebAccounting: React.FC<WebAccountingProps> = ({ onBack }) => {
  const { companies } = useApp();
  const [step, setStep] = useState<Step>('questionnaire');
  const [selectedPack, setSelectedPack] = useState<AccountingPackType | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [showSendDocuments, setShowSendDocuments] = useState(false);

  const [simulation, setSimulation] = useState<SimulationData>({
    activite: '',
    tva: null,
    tvaFrequence: 'mensuelle',
    salaries: '',
    volume: '',
    multiSites: null,
    multiActivites: null,
    paie: null,
    paieSalaries: '',
  });
  const [formalitesDone, setFormalitesDone] = useState<boolean | null>(null);
  const [devisRequested, setDevisRequested] = useState(false);
  
  const [setupData, setSetupData] = useState({
    fiscalYearStart: '01-01',
    fiscalYearEnd: '31-12',
    sector: '',
    taxRegime: '',
    vatSubject: false,
    vatPeriod: 'monthly' as 'monthly' | 'quarterly',
    employeeCount: 0,
    monthlyInvoiceCount: '0-10',
    hasCashRegister: false,
    bankName: '',
    accountNumber: '',
  });

  const [transmissionChannels, setTransmissionChannels] = useState({
    platform: true,
    email: false,
    physical: false,
  });

  const [mandateAccepted, setMandateAccepted] = useState(false);
  
  // Simulation d'un dossier comptable actif - CRÉÉ AUTOMATIQUEMENT POUR DÉMO
  const [activeFolder, setActiveFolder] = useState<AccountingFolder | null>({
    id: 'demo-folder-1',
    companyId: companies[0]?.id || 'company-1',
    companyName: companies[0]?.name || 'Entreprise Démo',
    pack: 'essentiel',
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0],
    fiscalYearStart: '01-01',
    fiscalYearEnd: '31-12',
    sector: 'commerce',
    taxRegime: 'reel_simplifie',
    vatSubject: true,
    vatPeriod: 'monthly',
    employeeCount: 5,
    monthlyInvoiceCount: '0-10',
    mandateSigned: true,
    currentMonth: {
      month: '2025-11',
      status: 'in_progress',
      missingDocuments: [],
      documentsCount: {
        total: 50,
        received: 32,
        processed: 28,
        validated: 28,
        rejected: 2,
      },
    },
  });

  // Sous-menu du dashboard
  const [dashboardView, setDashboardView] = useState<'overview' | 'documents' | 'taxes' | 'reports' | 'settings'>('overview');

  // Si un dossier actif existe, aller directement au dashboard
  React.useEffect(() => {
    if (activeFolder && step === 'questionnaire') {
      setStep('dashboard');
    }
  }, []);

  const selectedCompanyData = companies.find(c => c.id === selectedCompany);
  const estimatedPrice = selectedPack ? calculatePackPrice(
    selectedPack,
    setupData.employeeCount,
    setupData.monthlyInvoiceCount
  ) : 0;

  const handlePackSelect = (packId: AccountingPackType) => {
    setSelectedPack(packId);
    setStep('setup');
  };

  const isSimulationComplete = simulation.activite !== '' && simulation.tva !== null && simulation.salaries !== '' && simulation.volume !== '' && simulation.multiSites !== null && simulation.multiActivites !== null && simulation.paie !== null;

  const recommendation = isSimulationComplete ? getRecommendedPack(simulation) : null;

  const handleSetupComplete = () => {
    if (!selectedCompany || !setupData.sector) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setStep('mandate');
  };

  const handleMandateSign = () => {
    if (!mandateAccepted) {
      toast.error('Veuillez accepter le mandat pour continuer');
      return;
    }
    setStep('collection');
  };

  const handleActivateService = () => {
    const newFolder: AccountingFolder = {
      id: 'ACC-NEW',
      companyId: selectedCompany,
      companyName: selectedCompanyData?.name || '',
      pack: selectedPack!,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      fiscalYearStart: setupData.fiscalYearStart,
      fiscalYearEnd: setupData.fiscalYearEnd,
      sector: setupData.sector,
      taxRegime: setupData.taxRegime,
      vatSubject: setupData.vatSubject,
      vatPeriod: setupData.vatPeriod,
      employeeCount: setupData.employeeCount,
      monthlyInvoiceCount: setupData.monthlyInvoiceCount,
      mandateSigned: true,
      currentMonth: {
        month: new Date().toISOString().substring(0, 7),
        status: 'waiting_documents',
        missingDocuments: [],
        documentsCount: {
          received: 0,
          processed: 0,
          total: 0,
        },
      },
    };
    setActiveFolder(newFolder);
    setStep('dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={
            step === 'dashboard' && activeFolder ? () => setStep('questionnaire') :
            step === 'formalites' ? () => setStep('questionnaire') :
            step === 'result' ? () => setStep('formalites') :
            step === 'setup' ? () => setStep('result') :
            step === 'mandate' ? () => setStep('setup') :
            step === 'collection' ? () => setStep('mandate') :
            onBack
          }
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-2 text-[#273A7A] hover:text-[#1A2753] transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D6A93A] to-[#C09830] rounded-2xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-[#1A2753] flex-1">
            {step === 'questionnaire' && 'Simulation Comptabilité & Fiscalité'}
            {step === 'formalites' && 'Formalités post-constitution'}
            {step === 'result' && 'Votre pack recommandé'}
            {step === 'setup' && 'Paramétrage du dossier'}
            {step === 'mandate' && 'Mandats & autorisations'}
            {step === 'collection' && 'Collecte des pièces'}
            {step === 'dashboard' && 'Tableau de bord comptable'}
          </h1>
          {/* Bouton Nouveau dossier dans le dashboard */}
          {step === 'dashboard' && (
            <button
              onClick={() => {
                setActiveFolder(null);
                setStep('questionnaire');
                setSelectedPack(null);
                setSelectedCompany('');
                setSimulation({ activite: '', tva: null, tvaFrequence: 'mensuelle', salaries: '', volume: '', multiSites: null, multiActivites: null, paie: null, paieSalaries: '' });
                setFormalitesDone(null);
                setDevisRequested(false);
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau dossier</span>
            </button>
          )}
        </div>

        {/* Progress bar */}
        {step !== 'dashboard' && (
          <div className="flex items-center gap-4 mt-6">
            {['questionnaire', 'formalites', 'result', 'setup', 'mandate', 'collection'].map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex-1 h-1 bg-gradient-to-r from-transparent to-[#F5F6FA] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-[#D6A93A] to-[#C09830] transition-all duration-500 ${
                      ['questionnaire', 'formalites', 'result', 'setup', 'mandate', 'collection'].indexOf(step) >= i ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
                {i < 5 && <div className="w-4" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
      <AnimatePresence mode="popLayout">
        {/* Étape 1: Questionnaire de simulation */}
        {step === 'questionnaire' && (
          <motion.div
            key="questionnaire"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-[#1A2753] to-[#273A7A] rounded-2xl p-6 mb-8 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-6 h-6 text-[#D6A93A]" />
                </div>
                <div>
                  <h2 className="text-white mb-1">Simulez votre offre comptable</h2>
                  <p className="text-white/60 text-sm">
                    Répondez à ces quelques questions pour recevoir une recommandation de pack adaptée à votre activité.
                  </p>
                </div>
              </div>
            </div>

            {/* Forfait de démarrage obligatoire */}
            <div className="bg-[#D6A93A]/8 border-2 border-[#D6A93A]/20 rounded-2xl p-5 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#D6A93A]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-[#D6A93A]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-[#1A2753]">Forfait de démarrage</p>
                      <p className="text-[#273A7A]/80 text-sm">Paramétrage + lancement des obligations comptables et fiscales</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#D6A93A] text-2xl">{FORFAIT_DEMARRAGE.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span></p>
                      <p className="text-[#273A7A]/80 text-xs">HTVA — obligatoire au démarrage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* 1. Activité */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="text-[#1A2753] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1A2753] text-white rounded-lg flex items-center justify-center text-sm">1</span>
                  Quel est votre secteur d&apos;activité ?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  {([
                    { id: 'service', label: 'Service', icon: Briefcase },
                    { id: 'commerce', label: 'Commerce', icon: Storefront },
                    { id: 'btp', label: 'BTP', icon: HardHat },
                    { id: 'import-export', label: 'Import / Export', icon: Boat },
                    { id: 'autre', label: 'Autre', icon: Briefcase },
                  ] as const).map(opt => (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSimulation(prev => ({ ...prev, activite: opt.id }))}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-4 rounded-xl border-2 transition-all text-center ${
                        simulation.activite === opt.id
                          ? 'border-[#D6A93A] bg-[#D6A93A]/8 shadow-md'
                          : 'border-[#F5F6FA] bg-[#F5F6FA] hover:border-[#D6A93A]/30'
                      }`}
                    >
                      {opt.icon && <opt.icon className="w-6 h-6 mb-2 text-[#1A2753]" />}
                      <span className="text-[#1A2753] text-sm">{opt.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 2. TVA */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="text-[#1A2753] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1A2753] text-white rounded-lg flex items-center justify-center text-sm">2</span>
                  Êtes-vous assujetti à la TVA ?
                </label>
                <div className="flex gap-3 mt-4">
                  {[true, false].map(val => (
                    <motion.button
                      key={String(val)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSimulation(prev => ({ ...prev, tva: val }))}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 rounded-xl border-2 transition-all ${
                        simulation.tva === val
                          ? 'border-[#D6A93A] bg-[#D6A93A]/8'
                          : 'border-[#F5F6FA] bg-[#F5F6FA]'
                      }`}
                    >
                      <span className="text-[#1A2753]">{val ? 'Oui' : 'Non'}</span>
                    </motion.button>
                  ))}
                </div>
                {simulation.tva && (
                  <div className="mt-4">
                    <p className="text-[#273A7A]/80 text-sm mb-2">Fréquence de déclaration</p>
                    <div className="flex gap-3">
                      {(['mensuelle', 'trimestrielle'] as const).map(freq => (
                        <motion.button
                          key={freq}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSimulation(prev => ({ ...prev, tvaFrequence: freq }))}
                          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 rounded-xl border-2 transition-all text-sm ${
                            simulation.tvaFrequence === freq
                              ? 'border-[#1A2753] bg-[#1A2753]/5'
                              : 'border-[#F5F6FA] bg-[#F5F6FA]'
                          }`}
                        >
                          <span className="text-[#1A2753] capitalize">{freq}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Nombre de salariés */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="text-[#1A2753] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1A2753] text-white rounded-lg flex items-center justify-center text-sm">3</span>
                  Nombre de salariés
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                  {(['0', '1-5', '6-20', '21-50', '51+'] as EmployeeRange[]).map(range => (
                    <motion.button
                      key={range}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSimulation(prev => ({ ...prev, salaries: range }))}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 py-3 rounded-xl border-2 transition-all ${
                        simulation.salaries === range
                          ? 'border-[#D6A93A] bg-[#D6A93A]/8'
                          : 'border-[#F5F6FA] bg-[#F5F6FA]'
                      }`}
                    >
                      <span className="text-[#1A2753] text-sm">{range}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 4. Volume mensuel */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="text-[#1A2753] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1A2753] text-white rounded-lg flex items-center justify-center text-sm">4</span>
                  Volume mensuel de factures
                </label>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {([
                    { id: 'faible', label: 'Faible', desc: '< 20 factures' },
                    { id: 'moyen', label: 'Moyen', desc: '20 – 80 factures' },
                    { id: 'eleve', label: 'Élevé', desc: '80+ factures' },
                  ] as const).map(opt => (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSimulation(prev => ({ ...prev, volume: opt.id }))}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 py-4 rounded-xl border-2 transition-all ${
                        simulation.volume === opt.id
                          ? 'border-[#D6A93A] bg-[#D6A93A]/8'
                          : 'border-[#F5F6FA] bg-[#F5F6FA]'
                      }`}
                    >
                      <span className="text-[#1A2753] text-sm block">{opt.label}</span>
                      <span className="text-[#273A7A]/80 text-xs">{opt.desc}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 5. Multi-sites & Multi-activités */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="text-[#1A2753] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1A2753] text-white rounded-lg flex items-center justify-center text-sm">5</span>
                  Organisation
                </label>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[#273A7A]/80 text-sm mb-2">Multi-sites ?</p>
                    <div className="flex gap-3">
                      {[true, false].map(val => (
                        <motion.button
                          key={`ms-${val}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSimulation(prev => ({ ...prev, multiSites: val }))}
                          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 rounded-xl border-2 transition-all ${
                            simulation.multiSites === val
                              ? 'border-[#D6A93A] bg-[#D6A93A]/8'
                              : 'border-[#F5F6FA] bg-[#F5F6FA]'
                          }`}
                        >
                          <span className="text-[#1A2753] text-sm">{val ? 'Oui' : 'Non'}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[#273A7A]/80 text-sm mb-2">Multi-activités ?</p>
                    <div className="flex gap-3">
                      {[true, false].map(val => (
                        <motion.button
                          key={`ma-${val}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSimulation(prev => ({ ...prev, multiActivites: val }))}
                          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 rounded-xl border-2 transition-all ${
                            simulation.multiActivites === val
                              ? 'border-[#D6A93A] bg-[#D6A93A]/8'
                              : 'border-[#F5F6FA] bg-[#F5F6FA]'
                          }`}
                        >
                          <span className="text-[#1A2753] text-sm">{val ? 'Oui' : 'Non'}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Paie */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="text-[#1A2753] mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#1A2753] text-white rounded-lg flex items-center justify-center text-sm">6</span>
                  Gestion de la paie à confier ?
                </label>
                <div className="flex gap-3 mt-4">
                  {[true, false].map(val => (
                    <motion.button
                      key={`paie-${val}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSimulation(prev => ({ ...prev, paie: val }))}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 rounded-xl border-2 transition-all ${
                        simulation.paie === val
                          ? 'border-[#D6A93A] bg-[#D6A93A]/8'
                          : 'border-[#F5F6FA] bg-[#F5F6FA]'
                      }`}
                    >
                      <span className="text-[#1A2753]">{val ? 'Oui' : 'Non'}</span>
                    </motion.button>
                  ))}
                </div>
                {simulation.paie && (
                  <div className="mt-4">
                    <p className="text-[#273A7A]/80 text-sm mb-2">Nombre de salariés concernés</p>
                    <input
                      type="text"
                      value={simulation.paieSalaries}
                      onChange={(e) => setSimulation(prev => ({ ...prev, paieSalaries: e.target.value }))}
                      placeholder="Ex: 5"
                      className="w-full max-w-xs px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/30"
                    />
                  </div>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: isSimulationComplete ? 1.01 : 1 }}
              whileTap={{ scale: isSimulationComplete ? 0.98 : 1 }}
              onClick={() => setStep('formalites')}
              disabled={!isSimulationComplete}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full mt-8 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Continuer</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Étape 2: Formalités post-constitution */}
        {step === 'formalites' && (
          <motion.div
            key="formalites"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#1A2753]/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <FileText className="w-8 h-8 text-[#1A2753]" />
              </div>
              <h2 className="text-[#1A2753] text-2xl mb-3">Formalités post-constitution</h2>
              <p className="text-[#273A7A]/80 max-w-lg mx-auto">
                Les formalités post-constitution (COFI, DGID, certificat d&apos;existence, démarrage d&apos;activités) ont-elles été réalisées ?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormalitesDone(true)}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all text-left relative overflow-hidden ring-1 ${
                  formalitesDone === true ? 'ring-green-400 ring-2 bg-green-50/30' : 'ring-gray-100 hover:ring-green-200'
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-5">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-[#1A2753] text-lg mb-2">Oui, tout est fait</h3>
                <p className="text-[#273A7A]/80 text-sm mb-4">
                  COFI, déclaration DGID, certificat d&apos;existence et démarrage d&apos;activités sont effectués.
                </p>
                <p className="text-[#273A7A]/80 text-xs">
                  Le forfait de démarrage couvre uniquement le paramétrage comptable.
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormalitesDone(false)}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all text-left relative overflow-hidden ring-1 ${
                  formalitesDone === false ? 'ring-[#D6A93A] ring-2 bg-[#D6A93A]/5' : 'ring-gray-100 hover:ring-[#D6A93A]/30'
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D6A93A] to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-14 h-14 bg-[#D6A93A]/10 rounded-2xl flex items-center justify-center mb-5">
                  <AlertCircle className="w-7 h-7 text-[#D6A93A]" />
                </div>
                <h3 className="text-[#1A2753] text-lg mb-2">Non / Pas encore</h3>
                <p className="text-[#273A7A]/80 text-sm mb-4">
                  Une ou plusieurs formalités (COFI, DGID, existence, démarrage) restent à effectuer.
                </p>
                <p className="text-[#273A7A]/80 text-xs">
                  Le forfait de démarrage inclura l&apos;accompagnement sur ces formalités.
                </p>
              </motion.button>
            </div>

            {formalitesDone !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {!formalitesDone && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-900 text-sm mb-2">
                          Pas d&apos;inquiétude ! Le forfait de démarrage de <strong>{FORFAIT_DEMARRAGE.toLocaleString('fr-FR')} FCFA HTVA</strong> inclut l&apos;accompagnement pour :
                        </p>
                        <ul className="space-y-1">
                          {['COFI (Centre de Formalités des Impôts)', 'Déclaration DGID', 'Certificat d\'existence', 'Déclaration de démarrage d\'activités'].map(item => (
                            <li key={item} className="flex items-center gap-2 text-blue-800 text-xs">
                              <Check className="w-3.5 h-3.5 text-blue-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('result')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Voir ma recommandation</span>
                  <Sparkles className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Étape 3: Résultat / Pack recommandé */}
        {step === 'result' && recommendation && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            {(() => {
              const reco = recommendation;
              const pack = ACCOUNTING_PACKS.find(p => p.id === reco.pack)!;
              const packIcons: Record<string, typeof Zap> = { essentiel: Zap, standard: Star, business: Briefcase, premium: Crown };
              const packGradients: Record<string, string> = {
                essentiel: 'from-[#273A7A] to-[#1A2753]',
                standard: 'from-[#D6A93A] to-amber-500',
                business: 'from-[#1A2753] to-[#273A7A]',
                premium: 'from-[#0f1a3a] to-[#1A2753]',
              };
              const PackIcon = packIcons[reco.pack] || Zap;

              return (
                <>
                  {/* Pack recommandé */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
                  >
                    <div className={`bg-gradient-to-r ${packGradients[reco.pack]} p-8 text-white`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <PackIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Pack recommandé pour vous</p>
                          <h2 className="text-white text-2xl">{pack.name}</h2>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-white text-sm">À partir de</span>
                        <span className="text-4xl text-white">{pack.price.toLocaleString('fr-FR')}</span>
                        <span className="text-white/70">FCFA / mois HTVA</span>
                      </div>
                    </div>

                    <div className="p-8">
                      <p className="text-[#273A7A]/80 text-sm mb-5">{pack.description}</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {pack.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-sm">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-[#273A7A]">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Forfait de démarrage */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-[#D6A93A]/8 border-2 border-[#D6A93A]/20 rounded-2xl p-6 mb-6"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#D6A93A]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="w-5 h-5 text-[#D6A93A]" />
                        </div>
                        <div>
                          <p className="text-[#1A2753]">Forfait de démarrage <span className="text-[#D6A93A] text-xs ml-1">OBLIGATOIRE</span></p>
                          <p className="text-[#273A7A]/80 text-sm">
                            Paramétrage + lancement des obligations
                            {!formalitesDone && ' + formalités post-constitution (COFI, DGID, existence, démarrage)'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#D6A93A] text-2xl">{FORFAIT_DEMARRAGE.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span></p>
                        <p className="text-[#273A7A]/80 text-xs">HTVA — paiement unique</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Résumé simulation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="bg-white rounded-2xl p-6 shadow-sm mb-6"
                  >
                    <h3 className="text-[#1A2753] mb-4">Résumé de votre profil</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {[
                        { label: 'Activité', value: simulation.activite === 'import-export' ? 'Import / Export' : (simulation.activite.charAt(0).toUpperCase() + simulation.activite.slice(1)) },
                        { label: 'TVA', value: simulation.tva ? `Oui (${simulation.tvaFrequence})` : 'Non' },
                        { label: 'Salariés', value: simulation.salaries },
                        { label: 'Volume mensuel', value: simulation.volume.charAt(0).toUpperCase() + simulation.volume.slice(1) },
                        { label: 'Multi-sites', value: simulation.multiSites ? 'Oui' : 'Non' },
                        { label: 'Multi-activités', value: simulation.multiActivites ? 'Oui' : 'Non' },
                        { label: 'Paie', value: simulation.paie ? `Oui (${simulation.paieSalaries || '?'} sal.)` : 'Non' },
                        { label: 'Formalités post-constitution', value: formalitesDone ? 'Déjà faites' : 'À réaliser' },
                      ].map(item => (
                        <div key={item.label} className="bg-[#F5F6FA] rounded-xl p-3">
                          <p className="text-[#273A7A]/80 text-xs mb-1">{item.label}</p>
                          <p className="text-[#1A2753]">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Clause de révision */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#F5F6FA] rounded-xl p-4 mb-6"
                  >
                    <div className="flex items-start gap-3">
                      <Info className="w-4 h-4 text-[#273A7A]/50 flex-shrink-0 mt-0.5" />
                      <p className="text-[#273A7A]/80 text-xs">
                        <span className="text-[#1A2753]">Clause de révision :</span> Révision possible après 3 mois selon le volume réel, l'effectif et la complexité de votre activité.
                      </p>
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    {reco.needsDevis ? (
                      <>
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-blue-900 text-sm">
                              Votre profil dépasse les seuils standards du Pack Premium. Nous vous recommandons un devis personnalisé.
                            </p>
                          </div>
                        </div>
                        {!devisRequested ? (
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDevisRequested(true)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#D6A93A] to-amber-500 text-white rounded-xl py-4 shadow-lg flex items-center justify-center gap-2"
                          >
                            <Send className="w-5 h-5" />
                            <span>Demander un devis personnalisé</span>
                          </motion.button>
                        ) : (
                          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 text-center">
                            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                            <p className="text-green-900 mb-1">Demande de devis envoyée !</p>
                            <p className="text-green-700/70 text-sm">Notre équipe vous contactera sous 24h avec une proposition sur mesure.</p>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            handlePackSelect(reco.pack);
                          }}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-[#273A7A] bg-white border-2 border-[#F5F6FA] rounded-xl py-4 hover:border-[#D6A93A]/30 transition-all text-sm"
                        >
                          Continuer avec le {pack.name} en attendant
                        </button>
                      </>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          handlePackSelect(reco.pack);
                        }}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>Souscrire au {pack.name}</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    )}

                    {/* Choisir un autre pack */}
                    <div className="pt-4 border-t border-[#F5F6FA]">
                      <p className="text-[#273A7A]/80 text-xs text-center mb-3">Vous pouvez aussi choisir un autre pack :</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {ACCOUNTING_PACKS.map(p => (
                          <button
                            key={p.id}
                            onClick={() => handlePackSelect(p.id)}
                            className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 py-3 px-4 rounded-xl border-2 text-sm transition-all ${
                              p.id === reco.pack
                                ? 'border-[#D6A93A] bg-[#D6A93A]/8 text-[#1A2753]'
                                : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]/80 hover:border-[#D6A93A]/30'
                            }`}
                          >
                            <p.emoji className="w-4 h-4 text-[#1A2753]" />
                            <span className="ml-2">{p.name}</span>
                            <p className="text-xs text-[#273A7A]/80 mt-1">{p.price.toLocaleString()} FCFA/mois</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </>
              );
            })()}
          </motion.div>
        )}

        {/* Étape 2: Paramétrage */}
        {step === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Société */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-[#1A2753] mb-4">Société concernée</h3>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] border-2 border-transparent focus:border-[#D6A93A] outline-none"
                >
                  <option value="">Sélectionner une société</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>

                {selectedCompanyData && (
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-[#F5F6FA]">
                      <span className="text-[#273A7A]/80">Forme juridique</span>
                      <span className="text-[#1A2753]">{selectedCompanyData.type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#F5F6FA]">
                      <span className="text-[#273A7A]/80">RCCM</span>
                      <span className="text-[#1A2753]">SN-DKR-2024-A-12345</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[#273A7A]/80">NINEA</span>
                      <span className="text-[#1A2753]">123456789</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Paramétrage comptable */}
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <h3 className="text-[#1A2753] flex items-center gap-2 mb-4">
                  <Calculator className="w-5 h-5 text-[#D6A93A]" />
                  Paramétrage comptable
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#273A7A]/80 text-sm mb-2">Début d&apos;exercice</label>
                    <input
                      type="text"
                      value={setupData.fiscalYearStart}
                      onChange={(e) => setSetupData({ ...setupData, fiscalYearStart: e.target.value })}
                      placeholder="01-01"
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#273A7A]/80 text-sm mb-2">Clôture</label>
                    <input
                      type="text"
                      value={setupData.fiscalYearEnd}
                      onChange={(e) => setSetupData({ ...setupData, fiscalYearEnd: e.target.value })}
                      placeholder="31-12"
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#273A7A]/80 text-sm mb-2">
                    Secteur d&apos;activité <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={setupData.sector}
                    onChange={(e) => setSetupData({ ...setupData, sector: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753]"
                  >
                    <option value="">Sélectionner</option>
                    {BUSINESS_SECTORS.map(sector => (
                      <option key={sector.id} value={sector.id}>{sector.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#F5F6FA] rounded-xl">
                  <input
                    type="checkbox"
                    id="vatSubject"
                    checked={setupData.vatSubject}
                    onChange={(e) => setSetupData({ ...setupData, vatSubject: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label htmlFor="vatSubject" className="text-[#1A2753] text-sm">
                    Assujetti à la TVA
                  </label>
                </div>

                {setupData.vatSubject && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSetupData({ ...setupData, vatPeriod: 'monthly' })}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        setupData.vatPeriod === 'monthly'
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                          : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                      }`}
                    >
                      Mensuelle
                    </button>
                    <button
                      onClick={() => setSetupData({ ...setupData, vatPeriod: 'quarterly' })}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        setupData.vatPeriod === 'quarterly'
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                          : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                      }`}
                    >
                      Trimestrielle
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Volume d'activité */}
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-[#1A2753] flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#D6A93A]" />
                Volume d&apos;activité
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#273A7A]/80 text-sm mb-2">Nombre de salariés</label>
                  <input
                    type="number"
                    value={setupData.employeeCount}
                    onChange={(e) => setSetupData({ ...setupData, employeeCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753]"
                  />
                </div>

                <div>
                  <label className="block text-[#273A7A]/80 text-sm mb-2">Factures par mois</label>
                  <select
                    value={setupData.monthlyInvoiceCount}
                    onChange={(e) => setSetupData({ ...setupData, monthlyInvoiceCount: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753]"
                  >
                    <option value="0-10">0 à 10</option>
                    <option value="10-20">10 à 20</option>
                    <option value="20-50">20 à 50</option>
                    <option value="50-100">50 à 100</option>
                    <option value="100+">Plus de 100</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Estimation du prix */}
            <div className="bg-gradient-to-r from-[#D6A93A]/10 to-blue-50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#273A7A] mb-1">Tarif mensuel estimé</p>
                  <p className="text-[#D6A93A] text-4xl">
                    {estimatedPrice.toLocaleString()} <span className="text-xl">FCFA</span>
                  </p>
                </div>
                <Calculator className="w-16 h-16 text-[#D6A93A]/20" />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSetupComplete}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-8 py-4 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all"
              >
                Continuer
              </button>
            </div>
          </motion.div>
        )}

        {/* Étape 3: Mandats */}
        {step === 'mandate' && (
          <motion.div
            key="mandate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
              <p className="text-[#273A7A]">
                Pour assurer une gestion optimale, nous avons besoin de votre autorisation formelle.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 space-y-6">
              <h3 className="text-[#1A2753] flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#D6A93A]" />
                Mandat de gestion comptable et fiscale
              </h3>

              <div className="bg-[#F5F6FA] rounded-xl p-6 space-y-4 text-[#273A7A] max-h-[500px] overflow-y-auto">
                <div>
                  <p className="text-[#1A2753] mb-2"><strong>Article 1 : Objet</strong></p>
                  <p className="text-sm">
                    Le mandant confie au mandataire (Crésus) la tenue de sa comptabilité et la préparation 
                    de ses déclarations fiscales conformément à la réglementation en vigueur.
                  </p>
                </div>

                <div>
                  <p className="text-[#1A2753] mb-2"><strong>Article 2 : Obligations du mandataire</strong></p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Tenir la comptabilité selon les normes OHADA</li>
                    <li>Préparer et déposer les déclarations fiscales dans les délais</li>
                    <li>Établir les états financiers annuels</li>
                    <li>Conseiller le mandant en matière fiscale et comptable</li>
                  </ul>
                </div>

                <div>
                  <p className="text-[#1A2753] mb-2"><strong>Article 3 : Obligations du mandant</strong></p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Transmettre toutes les pièces comptables dans les délais convenus</li>
                    <li>Fournir les informations nécessaires à la tenue de la comptabilité</li>
                    <li>Payer les honoraires convenus</li>
                    <li>Régler les impôts et taxes dans les délais légaux</li>
                  </ul>
                </div>

                <div>
                  <p className="text-[#1A2753] mb-2"><strong>Article 4 : Confidentialité</strong></p>
                  <p className="text-sm">
                    Le mandataire s&apos;engage à respecter la confidentialité de toutes les informations 
                    transmises par le mandant.
                  </p>
                </div>

                <div>
                  <p className="text-[#1A2753] mb-2"><strong>Article 5 : Durée</strong></p>
                  <p className="text-sm">
                    Le présent mandat est conclu pour une durée d&apos;un an renouvelable tacitement, 
                    sauf résiliation par l&apos;une des parties avec un préavis de 3 mois.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-[#F5F6FA] rounded-xl">
                <input
                  type="checkbox"
                  id="mandate"
                  checked={mandateAccepted}
                  onChange={(e) => setMandateAccepted(e.target.checked)}
                  className="w-5 h-5 mt-0.5"
                />
                <label htmlFor="mandate" className="text-[#1A2753] text-sm">
                  J&apos;accepte les termes du mandat de gestion comptable et fiscale et autorise 
                  Crésus à agir en mon nom pour toutes les démarches comptables et fiscales.
                </label>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setStep('setup')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 text-[#273A7A] hover:bg-[#F5F6FA] rounded-xl transition-all"
                >
                  Retour
                </button>
                <button
                  onClick={handleMandateSign}
                  disabled={!mandateAccepted}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-8 py-3 rounded-xl transition-all ${
                    mandateAccepted
                      ? 'bg-[#D6A93A] text-white hover:bg-[#C09830]'
                      : 'bg-[#F5F6FA] text-[#273A7A]/40 cursor-not-allowed'
                  }`}
                >
                  Signer le mandat
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Étape 4: Collecte */}
        {step === 'collection' && (
          <motion.div
            key="collection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <p className="text-[#273A7A]">
                Choisissez comment vous souhaitez nous transmettre vos pièces comptables.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 space-y-4">
              <h3 className="text-[#1A2753] mb-4">Canaux de transmission</h3>

              <button
                onClick={() => setTransmissionChannels({ ...transmissionChannels, platform: !transmissionChannels.platform })}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-5 rounded-xl border-2 transition-all text-left ${
                  transmissionChannels.platform
                    ? 'border-[#D6A93A] bg-[#D6A93A]/5'
                    : 'border-[#F5F6FA] bg-[#F5F6FA]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                    transmissionChannels.platform ? 'border-[#D6A93A] bg-[#D6A93A]' : 'border-[#273A7A]/40'
                  }`}>
                    {transmissionChannels.platform && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-5 h-5 text-[#D6A93A]" />
                      <span className="text-[#1A2753]">Téléversement direct</span>
                    </div>
                    <p className="text-[#273A7A]/80 text-sm">
                      Uploadez vos pièces (photos, PDF, Excel) directement sur la plateforme
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setTransmissionChannels({ ...transmissionChannels, email: !transmissionChannels.email })}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-5 rounded-xl border-2 transition-all text-left ${
                  transmissionChannels.email
                    ? 'border-[#D6A93A] bg-[#D6A93A]/5'
                    : 'border-[#F5F6FA] bg-[#F5F6FA]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                    transmissionChannels.email ? 'border-[#D6A93A] bg-[#D6A93A]' : 'border-[#273A7A]/40'
                  }`}>
                    {transmissionChannels.email && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-5 h-5 text-[#D6A93A]" />
                      <span className="text-[#1A2753]">Email dédié</span>
                    </div>
                    <p className="text-[#273A7A]/80 text-sm mb-2">
                      Envoyez vos pièces par email
                    </p>
                    {transmissionChannels.email && (
                      <div className="bg-white rounded-lg p-3 text-sm text-[#D6A93A] border border-[#D6A93A]/20">
                        compta-{selectedCompanyData?.name.toLowerCase().replace(/\s/g, '-')}@cresus.sn
                      </div>
                    )}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setTransmissionChannels({ ...transmissionChannels, physical: !transmissionChannels.physical })}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-5 rounded-xl border-2 transition-all text-left ${
                  transmissionChannels.physical
                    ? 'border-[#D6A93A] bg-[#D6A93A]/5'
                    : 'border-[#F5F6FA] bg-[#F5F6FA]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                    transmissionChannels.physical ? 'border-[#D6A93A] bg-[#D6A93A]' : 'border-[#273A7A]/40'
                  }`}>
                    {transmissionChannels.physical && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-[#D6A93A]" />
                      <span className="text-[#1A2753]">Dépôt physique</span>
                    </div>
                    <p className="text-[#273A7A]/80 text-sm">
                      Déposez vos documents à nos bureaux (nous les scannerons)
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-[#1A2753] mb-4">Fréquence d&apos;envoi recommandée</h3>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#1A2753] mb-1">Envoi mensuel le 5 du mois</p>
                  <p className="text-[#273A7A]/80 text-sm">
                    Pour une comptabilité à jour, nous vous recommandons de nous envoyer vos pièces 
                    le 5 de chaque mois pour le mois précédent.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setStep('mandate')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 text-[#273A7A] hover:bg-[#F5F6FA] rounded-xl transition-all"
              >
                Retour
              </button>
              <button
                onClick={handleActivateService}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-8 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all"
              >
                Activer le service
              </button>
            </div>
          </motion.div>
        )}

        {/* Dashboard */}
        {step === 'dashboard' && activeFolder && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Info dossier */}
            <div className="bg-gradient-to-r from-[#1A2753] to-[#273A7A] rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/70 text-sm mb-1">Dossier comptable</p>
                  <h2 className="text-2xl">{activeFolder.companyName}</h2>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm mb-1">Pack {ACCOUNTING_PACKS.find(p => p.id === activeFolder.pack)?.name}</p>
                  <p className="text-[#D6A93A]">{estimatedPrice.toLocaleString()} FCFA/mois</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-white/60 text-xs mb-1">Exercice</p>
                  <p className="text-sm">{activeFolder.fiscalYearStart} → {activeFolder.fiscalYearEnd}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">TVA</p>
                  <p className="text-sm">{activeFolder.vatSubject ? `Oui (${activeFolder.vatPeriod === 'monthly' ? 'Mensuelle' : 'Trimestrielle'})` : 'Non'}</p>
                </div>
              </div>
            </div>

            {/* Navigation du dashboard */}
            <div className="bg-white rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDashboardView('overview')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    dashboardView === 'overview'
                      ? 'bg-[#D6A93A] text-white shadow-lg'
                      : 'text-[#273A7A] hover:bg-[#F5F6FA]'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Synthèse</span>
                </button>
                <button
                  onClick={() => setDashboardView('documents')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    dashboardView === 'documents'
                      ? 'bg-[#D6A93A] text-white shadow-lg'
                      : 'text-[#273A7A] hover:bg-[#F5F6FA]'
                  }`}
                >
                  <Folder className="w-5 h-5" />
                  <span>Documents</span>
                </button>
                <button
                  onClick={() => setDashboardView('taxes')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    dashboardView === 'taxes'
                      ? 'bg-[#D6A93A] text-white shadow-lg'
                      : 'text-[#273A7A] hover:bg-[#F5F6FA]'
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                  <span>Impôts</span>
                </button>
                <button
                  onClick={() => setDashboardView('reports')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    dashboardView === 'reports'
                      ? 'bg-[#D6A93A] text-white shadow-lg'
                      : 'text-[#273A7A] hover:bg-[#F5F6FA]'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Rapports</span>
                </button>
                <button
                  onClick={() => setDashboardView('settings')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    dashboardView === 'settings'
                      ? 'bg-[#D6A93A] text-white shadow-lg'
                      : 'text-[#273A7A] hover:bg-[#F5F6FA]'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Réglages</span>
                </button>
              </div>
            </div>

            {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
            <AnimatePresence mode="popLayout">
              {/* Vue Synthèse */}
              {dashboardView === 'overview' && (
                // Enveloppe keyee : `popLayout` mesure l'enfant sortant via une
                // ref, qu'un composant fonction ne peut pas recevoir.
                <motion.div key="overview">
                  <WebAccountingDashboardImproved
                    activeFolder={activeFolder}
                    onSendDocuments={() => setShowSendDocuments(true)}
                  />
                </motion.div>
              )}

              {/* Vue Documents */}
              {dashboardView === 'documents' && (
                <motion.div
                  key="documents"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[#1A2753]">Mes documents comptables</h3>
                      <button 
                        onClick={() => setShowSendDocuments(true)}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all flex items-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        Envoyer des pièces
                      </button>
                    </div>

                    <div className="text-center py-12">
                      <Folder className="w-20 h-20 text-[#D6A93A]/40 mx-auto mb-4" />
                      <p className="text-[#273A7A]/80 mb-2">Aucun document envoyé pour le moment</p>
                      <p className="text-[#273A7A]/80 text-sm">Vos documents apparaîtront ici une fois envoyés</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Vue Impôts */}
              {dashboardView === 'taxes' && (
                <motion.div
                  key="taxes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl p-6">
                    <h3 className="text-[#1A2753] mb-6">Toutes mes obligations fiscales</h3>
                    
                    <div className="space-y-4">
                      {mockTaxDeclarations.map((tax) => (
                        <div key={tax.id} className="p-5 bg-[#F5F6FA] rounded-xl hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Receipt className="w-5 h-5 text-[#D6A93A]" />
                                <p className="text-[#1A2753]">{tax.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-[#273A7A]/80 mb-1">Période</p>
                                  <p className="text-[#1A2753]">{tax.description}</p>
                                </div>
                                <div>
                                  <p className="text-[#273A7A]/80 mb-1">Échéance</p>
                                  <p className="text-[#1A2753]">{new Date(tax.dueDate).toLocaleDateString('fr-FR')}</p>
                                </div>
                              </div>
                            </div>
                            <span 
                              className={`px-4 py-2 rounded-full text-sm flex-shrink-0 ${
                                tax.status === 'paid' ? 'bg-green-100 text-green-700' :
                                tax.status === 'declared' ? 'bg-blue-100 text-blue-700' :
                                tax.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {getTaxStatusLabel(tax.status)}
                            </span>
                          </div>
                          
                          {tax.estimatedAmount && (
                            <div className="flex items-center justify-between pt-3 border-t border-white">
                              <span className="text-[#273A7A]/80 text-sm">Montant</span>
                              <span className="text-[#D6A93A] text-lg">
                                {tax.finalAmount || tax.estimatedAmount ? (tax.finalAmount || tax.estimatedAmount)!.toLocaleString() : '-'} FCFA
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Vue Rapports */}
              {dashboardView === 'reports' && (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl p-6">
                    <h3 className="text-[#1A2753] mb-6">États financiers et rapports</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-6 bg-[#F5F6FA] rounded-xl hover:bg-gray-100 transition-all text-left group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <FileText className="w-7 h-7 text-[#D6A93A]" />
                            </div>
                            <div>
                              <p className="text-[#1A2753] mb-1">Bilan 2024</p>
                              <p className="text-[#273A7A]/80 text-sm">Exercice fiscal 2024</p>
                              <p className="text-[#273A7A]/80 text-xs mt-1">Dernière mise à jour : 10 déc. 2024</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-[#273A7A]/40 group-hover:text-[#D6A93A] transition-colors" />
                        </div>
                      </button>

                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-6 bg-[#F5F6FA] rounded-xl hover:bg-gray-100 transition-all text-left group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <TrendingUp className="w-7 h-7 text-[#D6A93A]" />
                            </div>
                            <div>
                              <p className="text-[#1A2753] mb-1">Compte de résultat 2024</p>
                              <p className="text-[#273A7A]/80 text-sm">Résultats annuels</p>
                              <p className="text-[#273A7A]/80 text-xs mt-1">Dernière mise à jour : 10 déc. 2024</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-[#273A7A]/40 group-hover:text-[#D6A93A] transition-colors" />
                        </div>
                      </button>

                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-6 bg-[#F5F6FA] rounded-xl hover:bg-gray-100 transition-all text-left group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <BarChart3 className="w-7 h-7 text-[#D6A93A]" />
                            </div>
                            <div>
                              <p className="text-[#1A2753] mb-1">Tableau de bord Nov. 2024</p>
                              <p className="text-[#273A7A]/80 text-sm">Synthèse mensuelle</p>
                              <p className="text-[#273A7A]/80 text-xs mt-1">Dernière mise à jour : 05 déc. 2024</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-[#273A7A]/40 group-hover:text-[#D6A93A] transition-colors" />
                        </div>
                      </button>

                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-6 bg-[#F5F6FA] rounded-xl hover:bg-gray-100 transition-all text-left group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <DollarSign className="w-7 h-7 text-[#D6A93A]" />
                            </div>
                            <div>
                              <p className="text-[#1A2753] mb-1">Grand livre 2024</p>
                              <p className="text-[#273A7A]/80 text-sm">Toutes les écritures comptables</p>
                              <p className="text-[#273A7A]/80 text-xs mt-1">Dernière mise à jour : 10 déc. 2024</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-[#273A7A]/40 group-hover:text-[#D6A93A] transition-colors" />
                        </div>
                      </button>

                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-6 bg-[#F5F6FA] rounded-xl hover:bg-gray-100 transition-all text-left group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <FileText className="w-7 h-7 text-[#D6A93A]" />
                            </div>
                            <div>
                              <p className="text-[#1A2753] mb-1">Balance générale 2024</p>
                              <p className="text-[#273A7A]/80 text-sm">Balance des comptes</p>
                              <p className="text-[#273A7A]/80 text-xs mt-1">Dernière mise à jour : 10 déc. 2024</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-[#273A7A]/40 group-hover:text-[#D6A93A] transition-colors" />
                        </div>
                      </button>

                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-6 bg-[#F5F6FA] rounded-xl hover:bg-gray-100 transition-all text-left group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Receipt className="w-7 h-7 text-[#D6A93A]" />
                            </div>
                            <div>
                              <p className="text-[#1A2753] mb-1">Déclarations fiscales 2024</p>
                              <p className="text-[#273A7A]/80 text-sm">Toutes les déclarations</p>
                              <p className="text-[#273A7A]/80 text-xs mt-1">Dernière mise à jour : 30 nov. 2024</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-[#273A7A]/40 group-hover:text-[#D6A93A] transition-colors" />
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Vue Réglages */}
              {dashboardView === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl p-6">
                    <h3 className="text-[#1A2753] mb-6">Paramètres du dossier comptable</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[#273A7A]/80 text-sm mb-2">Pack souscrit</label>
                        <div className="p-4 bg-[#F5F6FA] rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[#1A2753]">
                              {ACCOUNTING_PACKS.find(p => p.id === activeFolder.pack)?.name}
                            </span>
                            <p className="text-[#273A7A]/80 text-sm mt-1">
                              {ACCOUNTING_PACKS.find(p => p.id === activeFolder.pack)?.description}
                            </p>
                          </div>
                          <span className="text-[#D6A93A]">{estimatedPrice.toLocaleString()} FCFA/mois</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#273A7A]/80 text-sm mb-2">Exercice fiscal</label>
                        <div className="p-4 bg-[#F5F6FA] rounded-xl">
                          <p className="text-[#1A2753]">
                            Du {activeFolder.fiscalYearStart} au {activeFolder.fiscalYearEnd}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#273A7A]/80 text-sm mb-2">Secteur d&apos;activité</label>
                        <div className="p-4 bg-[#F5F6FA] rounded-xl text-[#1A2753]">
                          {BUSINESS_SECTORS.find(s => s.id === activeFolder.sector)?.label}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#273A7A]/80 text-sm mb-2">Assujettissement TVA</label>
                        <div className="p-4 bg-[#F5F6FA] rounded-xl text-[#1A2753]">
                          {activeFolder.vatSubject 
                            ? `Assujetti - Déclaration ${activeFolder.vatPeriod === 'monthly' ? 'mensuelle' : 'trimestrielle'}` 
                            : 'Non assujetti à la TVA'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#273A7A]/80 text-sm mb-2">Nombre d&apos;employés</label>
                        <div className="p-4 bg-[#F5F6FA] rounded-xl text-[#1A2753]">
                          {activeFolder.employeeCount} salarié{activeFolder.employeeCount > 1 ? 's' : ''}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#273A7A]/80 text-sm mb-2">Volume de factures/mois</label>
                        <div className="p-4 bg-[#F5F6FA] rounded-xl text-[#1A2753]">
                          {activeFolder.monthlyInvoiceCount} factures
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#273A7A]/80 text-sm mb-2">Date d&apos;activation</label>
                        <div className="p-4 bg-[#F5F6FA] rounded-xl text-[#1A2753]">
                          {new Date(activeFolder.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-4 bg-[#273A7A] text-white rounded-xl hover:bg-[#1A2753] transition-all">
                        Modifier les paramètres
                      </button>
                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-4 border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition-all">
                        Suspendre le service
                      </button>
                    </div>
                  </div>

                  {/* Informations de contact */}
                  <div className="bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-2xl p-6 text-white">
                    <h3 className="mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Besoin d&apos;aide ?
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all flex items-center gap-3">
                        <Phone className="w-5 h-5" />
                        <div className="text-left">
                          <p className="text-sm">Appeler mon comptable</p>
                          <p className="text-xs text-white/60">+221 33 XXX XX XX</p>
                        </div>
                      </button>
                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all flex items-center gap-3">
                        <Mail className="w-5 h-5" />
                        <div className="text-left">
                          <p className="text-sm">Envoyer un message</p>
                          <p className="text-xs text-white/60">comptabilite@cresus.sn</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Documents Modal */}
      {showSendDocuments && (
        <WebSendAccountingDocuments
          onClose={() => setShowSendDocuments(false)}
          folder={activeFolder!}
        />
      )}
    </div>
  );
};