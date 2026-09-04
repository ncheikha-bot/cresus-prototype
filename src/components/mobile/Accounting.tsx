import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Calculator, FileText, Upload, Calendar, 
  CheckCircle2, AlertCircle, TrendingUp, DollarSign,
  Users, Building2, Shield, Check, X, Download,
  ChevronRight, Clock, Phone, Mail, BarChart3, Settings,
  Folder, Receipt, Plus, Zap, Star, Crown, Briefcase,
  Sparkles, ArrowRight, Info, ClipboardList, CheckCircle
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
import { SendAccountingDocuments } from './SendAccountingDocuments';
import { AccountingDashboardImproved } from './AccountingDashboardImproved';
import { toast } from 'sonner';

interface AccountingProps {
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

export const Accounting: React.FC<AccountingProps> = ({ onBack }) => {
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
  
  // Données du formulaire de paramétrage
  const [setupData, setSetupData] = useState({
    fiscalYearStart: '01-01',
    fiscalYearEnd: '31-12',
    sector: '',
    vatSubject: false,
    vatPeriod: 'monthly' as 'monthly' | 'quarterly',
    employeeCount: 0,
    monthlyInvoiceCount: '0-10',
    hasCashRegister: false,
    bankName: '',
    accountNumber: '',
  });

  // Choix des canaux de transmission
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
    createdAt: new Date().toISOString(),
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
      month: 'novembre-2025',
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
  useEffect(() => {
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

  const isSimulationComplete = simulation.activite !== '' && simulation.tva !== null && simulation.salaries !== '' && simulation.volume !== '' && simulation.multiSites !== null && simulation.multiActivites !== null && simulation.paie !== null;

  const recommendation = isSimulationComplete ? getRecommendedPack(simulation) : null;

  const handlePackSelect = (packId: AccountingPackType) => {
    setSelectedPack(packId);
    setStep('setup');
  };

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
    // Simuler l'activation du service
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
      taxRegime: '',
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

  const getStepTitle = () => {
    switch (step) {
      case 'questionnaire': return 'Simulation Comptabilité';
      case 'formalites': return 'Formalités post-constitution';
      case 'result': return 'Pack recommandé';
      case 'setup': return 'Paramétrage du dossier';
      case 'mandate': return 'Mandats & autorisations';
      case 'collection': return 'Collecte des pièces';
      case 'dashboard': return 'Tableau de bord comptable';
      default: return '';
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'questionnaire': onBack(); break;
      case 'formalites': setStep('questionnaire'); break;
      case 'result': setStep('formalites'); break;
      case 'setup': setStep('result'); break;
      case 'mandate': setStep('setup'); break;
      case 'collection': setStep('mandate'); break;
      case 'dashboard': setStep('questionnaire'); break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A2753] via-[#273A7A] to-[#1A2753] pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#1A2753] px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-5 sticky top-0 z-50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D6A93A]/5 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-3 mb-3">
          <button aria-label="Retour"
            onClick={handleBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] text-white/60 hover:text-white transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#D6A93A]" />
              <h1 className="text-white text-lg">{getStepTitle()}</h1>
            </div>
          </div>
          {step === 'dashboard' && (
            <button
              onClick={() => {
                setActiveFolder(null);
                setStep('questionnaire');
                setSelectedPack(null);
                setSelectedCompany('');
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] px-3.5 py-2 bg-[#D6A93A] text-[#1A2753] rounded-xl active:scale-95 transition-all flex items-center gap-1.5 shadow-lg shadow-[#D6A93A]/20"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs">Nouveau</span>
            </button>
          )}
        </div>

        {step !== 'dashboard' && (
          <div className="relative flex items-center gap-1.5 mt-2">
            {['questionnaire', 'formalites', 'result', 'setup', 'mandate', 'collection'].map((s, i) => {
              const currentIdx = ['questionnaire', 'formalites', 'result', 'setup', 'mandate', 'collection'].indexOf(step);
              return (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    currentIdx > i ? 'bg-[#D6A93A]' : currentIdx === i ? 'bg-[#D6A93A]/60' : 'bg-white/10'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="px-5 mt-5 space-y-4">
        {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
        <AnimatePresence mode="popLayout">
          {/* Étape 1: Simulation */}
          {step === 'questionnaire' && (
            <motion.div
              key="questionnaire"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/90 text-sm leading-relaxed">
                  Confiez-nous votre comptabilité et vos impôts. Vous n&apos;avez qu&apos;à nous envoyer vos pièces, nous gérons tout le reste.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-2xl p-5">
                  <label className="block text-[#1A2753] mb-2">
                    Activité principale <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={simulation.activite}
                    onChange={(e) => setSimulation({ ...simulation, activite: e.target.value as ActivityType })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] border-2 border-transparent focus:border-[#D6A93A] outline-none"
                  >
                    <option value="">Sélectionner</option>
                    {BUSINESS_SECTORS.map(sector => (
                      <option key={sector.id} value={sector.id}>{sector.label}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white rounded-2xl p-5">
                  <label className="block text-[#1A2753] mb-2">
                    Assujetti à la TVA <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSimulation({ ...simulation, tva: true })}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        simulation.tva === true
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                          : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => setSimulation({ ...simulation, tva: false })}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        simulation.tva === false
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                          : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                {simulation.tva && (
                  <div className="bg-white rounded-2xl p-5">
                    <label className="block text-[#1A2753] mb-2">
                      Périodicité TVA <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSimulation({ ...simulation, tvaFrequence: 'mensuelle' })}
                        className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                          simulation.tvaFrequence === 'mensuelle'
                            ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                            : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                        }`}
                      >
                        Mensuelle
                      </button>
                      <button
                        onClick={() => setSimulation({ ...simulation, tvaFrequence: 'trimestrielle' })}
                        className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                          simulation.tvaFrequence === 'trimestrielle'
                            ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                            : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                        }`}
                      >
                        Trimestrielle
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-5">
                  <label className="block text-[#1A2753] mb-2">
                    Nombre de salariés <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={simulation.salaries}
                    onChange={(e) => setSimulation({ ...simulation, salaries: e.target.value as EmployeeRange })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] border-2 border-transparent focus:border-[#D6A93A] outline-none"
                  >
                    <option value="">Sélectionner</option>
                    <option value="0">0</option>
                    <option value="1-5">1 à 5</option>
                    <option value="6-20">6 à 20</option>
                    <option value="21-50">21 à 50</option>
                    <option value="51+">51 et plus</option>
                  </select>
                </div>

                <div className="bg-white rounded-2xl p-5">
                  <label className="block text-[#1A2753] mb-2">
                    Volume d&apos;activité <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={simulation.volume}
                    onChange={(e) => setSimulation({ ...simulation, volume: e.target.value as VolumeLevel })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] border-2 border-transparent focus:border-[#D6A93A] outline-none"
                  >
                    <option value="">Sélectionner</option>
                    <option value="faible">Faible</option>
                    <option value="moyen">Moyen</option>
                    <option value="eleve">Élevé</option>
                  </select>
                </div>

                <div className="bg-white rounded-2xl p-5">
                  <label className="block text-[#1A2753] mb-2">
                    Plusieurs sites <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSimulation({ ...simulation, multiSites: true })}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        simulation.multiSites === true
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                          : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => setSimulation({ ...simulation, multiSites: false })}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        simulation.multiSites === false
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                          : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5">
                  <label className="block text-[#1A2753] mb-2">
                    Plusieurs activités <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSimulation({ ...simulation, multiActivites: true })}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        simulation.multiActivites === true
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                          : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => setSimulation({ ...simulation, multiActivites: false })}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        simulation.multiActivites === false
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                          : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5">
                  <label className="block text-[#1A2753] mb-2">
                    Paie <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSimulation({ ...simulation, paie: true })}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        simulation.paie === true
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                          : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                      }`}
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => setSimulation({ ...simulation, paie: false })}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        simulation.paie === false
                          ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-[#1A2753]'
                          : 'border-[#F5F6FA] bg-[#F5F6FA] text-[#273A7A]'
                      }`}
                    >
                      Non
                    </button>
                  </div>
                </div>

                {simulation.paie && (
                  <div className="bg-white rounded-2xl p-5">
                    <label className="block text-[#1A2753] mb-2">
                      Nombre de salariés paies <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={simulation.paieSalaries}
                      onChange={(e) => setSimulation({ ...simulation, paieSalaries: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] border-2 border-transparent focus:border-[#D6A93A] outline-none"
                    />
                  </div>
                )}
              </div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={() => setStep('formalites')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] fixed bottom-6 left-5 right-5 bg-[#D6A93A] text-[#1A2753] py-4 rounded-2xl shadow-xl shadow-[#D6A93A]/25 active:scale-[0.98] transition-transform z-50"
              >
                Continuer
              </motion.button>
            </motion.div>
          )}

          {/* Étape 2: Formalités post-constitution */}
          {step === 'formalites' && (
            <motion.div
              key="formalites"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4 pb-24"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/90 text-sm">
                  Veuillez vérifier que vous avez bien effectué les formalités post-constitution.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-[#1A2753] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#D6A93A]" />
                  Formalités post-constitution
                </h3>

                <div className="bg-[#F5F6FA] rounded-xl p-4 space-y-3 text-sm text-[#273A7A] max-h-96 overflow-y-auto">
                  <p><strong>Article 1 : Objet</strong></p>
                  <p>
                    Le mandant confie au mandataire (Crésus) la tenue de sa comptabilité et la préparation 
                    de ses déclarations fiscales conformément à la réglementation en vigueur.
                  </p>

                  <p><strong>Article 2 : Obligations du mandataire</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Tenir la comptabilité selon les normes OHADA</li>
                    <li>Préparer et déposer les déclarations fiscales dans les délais</li>
                    <li>Établir les états financiers annuels</li>
                    <li>Conseiller le mandant en matière fiscale et comptable</li>
                  </ul>

                  <p><strong>Article 3 : Obligations du mandant</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Transmettre toutes les pièces comptables dans les délais convenus</li>
                    <li>Fournir les informations nécessaires à la tenue de la comptabilité</li>
                    <li>Payer les honoraires convenus</li>
                    <li>Régler les impôts et taxes dans les délais légaux</li>
                  </ul>

                  <p><strong>Article 4 : Confidentialité</strong></p>
                  <p>
                    Le mandataire s&apos;engage à respecter la confidentialité de toutes les informations 
                    transmises par le mandant.
                  </p>

                  <p><strong>Article 5 : Durée</strong></p>
                  <p>
                    Le présent mandat est conclu pour une durée d&apos;un an renouvelable tacitement, 
                    sauf résiliation par l&apos;une des parties avec un préavis de 3 mois.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#F5F6FA] rounded-xl">
                  <input
                    type="checkbox"
                    id="formalites"
                    checked={formalitesDone === true}
                    onChange={(e) => setFormalitesDone(e.target.checked)}
                    className="w-5 h-5 text-[#D6A93A] mt-0.5"
                  />
                  <label htmlFor="formalites" className="text-[#1A2753] text-sm">
                    J&apos;ai effectué les formalités post-constitution.
                  </label>
                </div>

                <button
                  onClick={() => setStep('result')}
                  disabled={formalitesDone !== true}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full py-4 rounded-xl transition-all ${
                    formalitesDone === true
                      ? 'bg-[#D6A93A] text-white hover:bg-[#C09830]'
                      : 'bg-[#F5F6FA] text-[#273A7A]/40 cursor-not-allowed'
                  }`}
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          )}

          {/* Étape 3: Pack recommandé */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4 pb-24"
            >
              {recommendation && (() => {
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
                    {/* Pack recommandé - Card principale */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                      <div className={`bg-gradient-to-r ${packGradients[reco.pack]} p-5 text-white`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <PackIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white/60 text-xs">Pack recommandé pour vous</p>
                            <h2 className="text-white text-xl">{pack.name}</h2>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-white/70 text-xs">À partir de</span>
                          <span className="text-2xl text-white">{pack.price.toLocaleString('fr-FR')}</span>
                          <span className="text-white/60 text-xs">FCFA / mois HTVA</span>
                        </div>
                      </div>

                      <div className="p-5">
                        <p className="text-[#273A7A]/80 text-sm mb-4">{pack.description}</p>
                        <div className="space-y-2">
                          {pack.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
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
                      transition={{ delay: 0.3 }}
                      className="bg-[#D6A93A]/8 border-2 border-[#D6A93A]/20 rounded-2xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#D6A93A]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="w-5 h-5 text-[#D6A93A]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[#1A2753] text-sm">Forfait de démarrage</p>
                            <span className="text-[#D6A93A] text-[10px] px-1.5 py-0.5 bg-[#D6A93A]/10 rounded">OBLIGATOIRE</span>
                          </div>
                          <p className="text-[#273A7A]/80 text-xs">
                            Paramétrage + lancement des obligations
                            {!formalitesDone && ' + formalités post-constitution (COFI, DGID, existence, démarrage)'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right mt-2">
                        <p className="text-[#D6A93A] text-xl">{FORFAIT_DEMARRAGE.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span></p>
                        <p className="text-[#273A7A]/80 text-[10px]">HTVA — paiement unique</p>
                      </div>
                    </motion.div>

                    {/* Résumé simulation */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-2xl p-5"
                    >
                      <h3 className="text-[#1A2753] text-sm mb-3">Résumé de votre profil</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { label: 'Activité', value: simulation.activite === 'import-export' ? 'Import / Export' : (simulation.activite.charAt(0).toUpperCase() + simulation.activite.slice(1)) },
                          { label: 'TVA', value: simulation.tva ? `Oui (${simulation.tvaFrequence})` : 'Non' },
                          { label: 'Salariés', value: simulation.salaries },
                          { label: 'Volume', value: simulation.volume.charAt(0).toUpperCase() + simulation.volume.slice(1) },
                          { label: 'Multi-sites', value: simulation.multiSites ? 'Oui' : 'Non' },
                          { label: 'Paie', value: simulation.paie ? `Oui (${simulation.paieSalaries || '?'} sal.)` : 'Non' },
                        ].map(item => (
                          <div key={item.label} className="bg-[#F5F6FA] rounded-lg p-2">
                            <p className="text-[#273A7A]/80 text-[10px] mb-0.5">{item.label}</p>
                            <p className="text-[#1A2753]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Clause de révision + Au-delà */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-2"
                    >
                      <div className="bg-[#F5F6FA] rounded-xl p-3">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-[#273A7A]/50 flex-shrink-0 mt-0.5" />
                          <p className="text-[#273A7A]/80 text-xs">
                            <span className="text-[#1A2753]">Clause de révision :</span> Révision possible après 3 mois selon le volume réel, l&apos;effectif et la complexité de votre activité.
                          </p>
                        </div>
                      </div>
                      <div className="bg-[#F5F6FA] rounded-xl p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-[#273A7A]/50 flex-shrink-0 mt-0.5" />
                          <p className="text-[#273A7A]/80 text-xs">
                            <span className="text-[#1A2753]">Au-delà :</span> Toute prestation non couverte par le pack donnera lieu à un avenant ou un devis complémentaire.
                          </p>
                        </div>
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
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                            <div className="flex items-start gap-2">
                              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <p className="text-blue-900 text-xs">
                                Votre profil dépasse les seuils standards du Pack Premium. Nous vous recommandons un devis personnalisé.
                              </p>
                            </div>
                          </div>
                          {!devisRequested ? (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setDevisRequested(true)}
                              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-full bg-gradient-to-r from-[#D6A93A] to-amber-500 text-white rounded-xl py-4 shadow-lg flex items-center justify-center gap-2 active:scale-95"
                            >
                              <ClipboardList className="w-5 h-5" />
                              <span>Demander un devis personnalisé</span>
                            </motion.button>
                          ) : (
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                              <p className="text-green-900 text-sm mb-1">Demande de devis envoyée !</p>
                              <p className="text-green-700/70 text-xs">Notre équipe vous contactera sous 24h.</p>
                            </div>
                          )}
                          <button
                            onClick={() => handlePackSelect(reco.pack)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-full text-[#273A7A] bg-white border-2 border-[#F5F6FA] rounded-xl py-3 text-sm"
                          >
                            Continuer avec le {pack.name} en attendant
                          </button>
                        </>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePackSelect(reco.pack)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 shadow-lg flex items-center justify-center gap-2 active:scale-95"
                        >
                          <span>Souscrire au {pack.name}</span>
                          <ArrowRight className="w-5 h-5" />
                        </motion.button>
                      )}

                      {/* Choisir un autre pack */}
                      <div className="pt-3 border-t border-white/20">
                        <p className="text-white/70 text-xs text-center mb-3">Vous pouvez aussi choisir un autre pack :</p>
                        <div className="grid grid-cols-2 gap-2">
                          {ACCOUNTING_PACKS.map(p => (
                            <button
                              key={p.id}
                              onClick={() => handlePackSelect(p.id)}
                              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] py-2.5 px-3 rounded-xl border-2 text-xs transition-all ${
                                p.id === reco.pack
                                  ? 'border-[#D6A93A] bg-[#D6A93A]/10 text-white'
                                  : 'border-white/10 bg-white/5 text-white/70'
                              }`}
                            >
                              <p.emoji className="w-4 h-4 text-[#1A2753]" />
                              <span className="ml-1.5">{p.name}</span>
                              <p className="text-white/70 mt-0.5">{p.price.toLocaleString()} FCFA/mois</p>
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

          {/* Étape 4: Paramétrage */}
          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4 pb-24"
            >
              {/* Choix de la société */}
              <div className="bg-white rounded-2xl p-5">
                <label className="block text-[#1A2753] mb-2">
                  Société concernée <span className="text-red-500">*</span>
                </label>
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
              </div>

              {/* Infos juridiques */}
              <div className="bg-white rounded-2xl p-5">
                <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#D6A93A]" />
                  Informations juridiques
                </h3>
                {selectedCompanyData && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#273A7A]/80">Forme juridique</span>
                      <span className="text-[#1A2753]">{selectedCompanyData.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#273A7A]/80">RCCM</span>
                      <span className="text-[#1A2753]">SN-DKR-2024-A-12345</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#273A7A]/80">NINEA</span>
                      <span className="text-[#1A2753]">123456789</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Paramétrage comptable */}
              <div className="bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-[#1A2753] flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#D6A93A]" />
                  Paramétrage comptable
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#273A7A]/80 text-sm mb-2">Début d&apos;exercice</label>
                    <input
                      type="text"
                      value={setupData.fiscalYearStart}
                      onChange={(e) => setSetupData({ ...setupData, fiscalYearStart: e.target.value })}
                      placeholder="01-01"
                      className="w-full px-3 py-2 bg-[#F5F6FA] rounded-xl text-[#1A2753] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[#273A7A]/80 text-sm mb-2">Clôture</label>
                    <input
                      type="text"
                      value={setupData.fiscalYearEnd}
                      onChange={(e) => setSetupData({ ...setupData, fiscalYearEnd: e.target.value })}
                      placeholder="31-12"
                      className="w-full px-3 py-2 bg-[#F5F6FA] rounded-xl text-[#1A2753] text-sm"
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
                    className="w-5 h-5 text-[#D6A93A]"
                  />
                  <label htmlFor="vatSubject" className="text-[#1A2753] text-sm">
                    Assujetti à la TVA
                  </label>
                </div>

                {setupData.vatSubject && (
                  <div>
                    <label className="block text-[#273A7A]/80 text-sm mb-2">Périodicité TVA</label>
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
                  </div>
                )}
              </div>

              {/* Volume estimé */}
              <div className="bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-[#1A2753] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#D6A93A]" />
                  Volume d&apos;activité
                </h3>

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

              {/* Estimation du prix */}
              <div className="bg-white rounded-2xl p-5 border border-[#D6A93A]/15 shadow-[0_2px_8px_rgba(214,169,58,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#273A7A]/80 text-xs mb-1">Tarif mensuel estimé</p>
                    <p className="text-[#1A2753] text-2xl">
                      {estimatedPrice.toLocaleString()} <span className="text-sm text-[#273A7A]/80">FCFA/mois</span>
                    </p>
                    <p className="text-[#273A7A]/80 text-[10px] mt-0.5">HTVA</p>
                  </div>
                  <div className="w-12 h-12 bg-[#D6A93A]/8 rounded-xl flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-[#D6A93A]" />
                  </div>
                </div>
              </div>

              {/* Bouton suivant */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={handleSetupComplete}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] fixed bottom-6 left-5 right-5 bg-[#D6A93A] text-[#1A2753] py-4 rounded-2xl shadow-xl shadow-[#D6A93A]/25 active:scale-[0.98] transition-transform z-50"
              >
                Continuer
              </motion.button>
            </motion.div>
          )}

          {/* Étape 5: Mandats */}
          {step === 'mandate' && (
            <motion.div
              key="mandate"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4 pb-24"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/90 text-sm">
                  Pour assurer une gestion optimale, nous avons besoin de votre autorisation formelle.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-[#1A2753] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#D6A93A]" />
                  Mandat de gestion comptable et fiscale
                </h3>

                <div className="bg-[#F5F6FA] rounded-xl p-4 space-y-3 text-sm text-[#273A7A] max-h-96 overflow-y-auto">
                  <p><strong>Article 1 : Objet</strong></p>
                  <p>
                    Le mandant confie au mandataire (Crésus) la tenue de sa comptabilité et la préparation 
                    de ses déclarations fiscales conformément à la réglementation en vigueur.
                  </p>

                  <p><strong>Article 2 : Obligations du mandataire</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Tenir la comptabilité selon les normes OHADA</li>
                    <li>Préparer et déposer les déclarations fiscales dans les délais</li>
                    <li>Établir les états financiers annuels</li>
                    <li>Conseiller le mandant en matière fiscale et comptable</li>
                  </ul>

                  <p><strong>Article 3 : Obligations du mandant</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Transmettre toutes les pièces comptables dans les délais convenus</li>
                    <li>Fournir les informations nécessaires à la tenue de la comptabilité</li>
                    <li>Payer les honoraires convenus</li>
                    <li>Régler les impôts et taxes dans les délais légaux</li>
                  </ul>

                  <p><strong>Article 4 : Confidentialité</strong></p>
                  <p>
                    Le mandataire s&apos;engage à respecter la confidentialité de toutes les informations 
                    transmises par le mandant.
                  </p>

                  <p><strong>Article 5 : Durée</strong></p>
                  <p>
                    Le présent mandat est conclu pour une durée d&apos;un an renouvelable tacitement, 
                    sauf résiliation par l&apos;une des parties avec un préavis de 3 mois.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#F5F6FA] rounded-xl">
                  <input
                    type="checkbox"
                    id="mandate"
                    checked={mandateAccepted}
                    onChange={(e) => setMandateAccepted(e.target.checked)}
                    className="w-5 h-5 text-[#D6A93A] mt-0.5"
                  />
                  <label htmlFor="mandate" className="text-[#1A2753] text-sm">
                    J&apos;accepte les termes du mandat de gestion comptable et fiscale et autorise 
                    Crésus à agir en mon nom pour toutes les démarches comptables et fiscales.
                  </label>
                </div>

                <button
                  onClick={handleMandateSign}
                  disabled={!mandateAccepted}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full py-4 rounded-xl transition-all ${
                    mandateAccepted
                      ? 'bg-[#D6A93A] text-white hover:bg-[#C09830]'
                      : 'bg-[#F5F6FA] text-[#273A7A]/40 cursor-not-allowed'
                  }`}
                >
                  Signer le mandat
                </button>
              </div>
            </motion.div>
          )}

          {/* Étape 6: Collecte des pièces */}
          {step === 'collection' && (
            <motion.div
              key="collection"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4 pb-24"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/90 text-sm">
                  Choisissez comment vous souhaitez nous transmettre vos pièces comptables.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 space-y-4">
                <h3 className="text-[#1A2753] mb-4">Canaux de transmission</h3>

                <button
                  onClick={() => setTransmissionChannels({ ...transmissionChannels, platform: !transmissionChannels.platform })}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 rounded-xl border-2 transition-all text-left ${
                    transmissionChannels.platform
                      ? 'border-[#D6A93A] bg-[#D6A93A]/10'
                      : 'border-[#F5F6FA] bg-[#F5F6FA]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      transmissionChannels.platform ? 'border-[#D6A93A] bg-[#D6A93A]' : 'border-[#273A7A]/40'
                    }`}>
                      {transmissionChannels.platform && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 rounded-xl border-2 transition-all text-left ${
                    transmissionChannels.email
                      ? 'border-[#D6A93A] bg-[#D6A93A]/10'
                      : 'border-[#F5F6FA] bg-[#F5F6FA]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      transmissionChannels.email ? 'border-[#D6A93A] bg-[#D6A93A]' : 'border-[#273A7A]/40'
                    }`}>
                      {transmissionChannels.email && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-5 h-5 text-[#D6A93A]" />
                        <span className="text-[#1A2753]">Email dédié</span>
                      </div>
                      <p className="text-[#273A7A]/80 text-sm mb-2">
                        Envoyez vos pièces par email
                      </p>
                      {transmissionChannels.email && (
                        <div className="bg-white rounded-lg p-2 text-xs text-[#D6A93A]">
                          compta-{selectedCompanyData?.name.toLowerCase().replace(/\s/g, '-')}@cresus.sn
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setTransmissionChannels({ ...transmissionChannels, physical: !transmissionChannels.physical })}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 rounded-xl border-2 transition-all text-left ${
                    transmissionChannels.physical
                      ? 'border-[#D6A93A] bg-[#D6A93A]/10'
                      : 'border-[#F5F6FA] bg-[#F5F6FA]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      transmissionChannels.physical ? 'border-[#D6A93A] bg-[#D6A93A]' : 'border-[#273A7A]/40'
                    }`}>
                      {transmissionChannels.physical && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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

              <div className="bg-white rounded-2xl p-5">
                <h3 className="text-[#1A2753] mb-4">Fréquence d&apos;envoi recommandée</h3>
                <div className="flex items-start gap-3 p-4 bg-[#F5F6FA] rounded-xl">
                  <Clock className="w-5 h-5 text-[#D6A93A] flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-[#1A2753] mb-1">
                      <strong>Tous les 5 du mois</strong>
                    </p>
                    <p className="text-[#273A7A]/80">
                      Envoyez vos pièces du mois précédent avant le 5 pour un traitement optimal 
                      et le respect des échéances fiscales.
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={handleActivateService}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] fixed bottom-6 left-5 right-5 bg-[#D6A93A] text-[#1A2753] py-4 rounded-2xl shadow-xl shadow-[#D6A93A]/25 active:scale-[0.98] transition-transform z-50"
              >
                Activer le service
              </motion.button>
            </motion.div>
          )}

          {/* Étape 7: Dashboard */}
          {step === 'dashboard' && activeFolder && (
            <motion.div
              key="dashboard"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4 pb-6"
            >
              {/* Navigation du dashboard */}
              <div className="bg-white rounded-2xl p-2 grid grid-cols-5 gap-1">
                <button
                  onClick={() => setDashboardView('overview')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-3 rounded-xl transition-all ${
                    dashboardView === 'overview'
                      ? 'bg-[#D6A93A] text-white'
                      : 'text-[#273A7A] hover:bg-[#F5F6FA]'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs block">Synthèse</span>
                </button>
                <button
                  onClick={() => setDashboardView('documents')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-3 rounded-xl transition-all ${
                    dashboardView === 'documents'
                      ? 'bg-[#D6A93A] text-white'
                      : 'text-[#273A7A] hover:bg-[#F5F6FA]'
                  }`}
                >
                  <Folder className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs block">Documents</span>
                </button>
                <button
                  onClick={() => setDashboardView('taxes')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-3 rounded-xl transition-all ${
                    dashboardView === 'taxes'
                      ? 'bg-[#D6A93A] text-white'
                      : 'text-[#273A7A] hover:bg-[#F5F6FA]'
                  }`}
                >
                  <Receipt className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs block">Impôts</span>
                </button>
                <button
                  onClick={() => setDashboardView('reports')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-3 rounded-xl transition-all ${
                    dashboardView === 'reports'
                      ? 'bg-[#D6A93A] text-white'
                      : 'text-[#273A7A] hover:bg-[#F5F6FA]'
                  }`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs block">Rapports</span>
                </button>
                <button
                  onClick={() => setDashboardView('settings')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-3 rounded-xl transition-all ${
                    dashboardView === 'settings'
                      ? 'bg-[#D6A93A] text-white'
                      : 'text-[#273A7A] hover:bg-[#F5F6FA]'
                  }`}
                >
                  <Settings className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs block">Réglages</span>
                </button>
              </div>

              {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
              <AnimatePresence mode="popLayout">
                {/* Vue Synthèse */}
                {dashboardView === 'overview' && (
                  // Enveloppe keyee : `popLayout` mesure l'enfant sortant via une
                  // ref, qu'un composant fonction ne peut pas recevoir.
                  <motion.div key="overview">
                    <AccountingDashboardImproved
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
                    className="space-y-4"
                  >
                    <div className="bg-white rounded-2xl p-5">
                      <h3 className="text-[#1A2753] mb-4">Mes documents comptables</h3>
                      <div className="text-center py-8">
                        <Folder className="w-16 h-16 text-[#D6A93A]/40 mx-auto mb-3" />
                        <p className="text-[#273A7A]/80 mb-4">Aucun document envoyé pour le moment</p>
                        <button 
                          onClick={() => setShowSendDocuments(true)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all"
                        >
                          Envoyer des pièces
                        </button>
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
                    className="space-y-4"
                  >
                    <div className="bg-white rounded-2xl p-5">
                      <h3 className="text-[#1A2753] mb-4">Obligations fiscales</h3>
                      <div className="space-y-3">
                        {mockTaxDeclarations.map((tax) => (
                          <div key={tax.id} className="p-4 bg-[#F5F6FA] rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-[#1A2753] mb-1">{tax.description}</p>
                                <p className="text-[#273A7A]/80 text-xs">
                                  Échéance : {new Date(tax.dueDate).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${
                                tax.status === 'paid'
                                  ? 'bg-green-100 text-green-700'
                                  : tax.status === 'declared'
                                  ? 'bg-blue-100 text-blue-700'
                                  : tax.status === 'in_progress'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {getTaxStatusLabel(tax.status)}
                              </span>
                            </div>
                            {tax.estimatedAmount && (
                              <p className="text-[#D6A93A]">
                                {tax.finalAmount || tax.estimatedAmount ? (tax.finalAmount || tax.estimatedAmount)!.toLocaleString() : '-'} FCFA
                              </p>
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
                    className="space-y-4"
                  >
                    <div className="bg-white rounded-2xl p-5">
                      <h3 className="text-[#1A2753] mb-4">États financiers</h3>
                      <div className="space-y-3">
                        <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 bg-[#F5F6FA] rounded-xl hover:bg-gray-100 transition-all text-left flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-[#D6A93A]" />
                            </div>
                            <div>
                              <p className="text-[#1A2753]">Bilan 2024</p>
                              <p className="text-[#273A7A]/80 text-xs">Exercice fiscal 2024</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-[#273A7A]/40" />
                        </button>

                        <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 bg-[#F5F6FA] rounded-xl hover:bg-gray-100 transition-all text-left flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-[#D6A93A]" />
                            </div>
                            <div>
                              <p className="text-[#1A2753]">Compte de résultat 2024</p>
                              <p className="text-[#273A7A]/80 text-xs">Résultats annuels</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-[#273A7A]/40" />
                        </button>

                        <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 bg-[#F5F6FA] rounded-xl hover:bg-gray-100 transition-all text-left flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-5 h-5 text-[#D6A93A]" />
                            </div>
                            <div>
                              <p className="text-[#1A2753]">Tableau de bord Nov. 2025</p>
                              <p className="text-[#273A7A]/80 text-xs">Synthèse mensuelle</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-[#273A7A]/40" />
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
                    className="space-y-4"
                  >
                    <div className="bg-white rounded-2xl p-5">
                      <h3 className="text-[#1A2753] mb-4">Paramètres du dossier</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[#273A7A]/80 text-sm mb-2">Pack souscrit</label>
                          <div className="p-3 bg-[#F5F6FA] rounded-xl flex items-center justify-between">
                            <span className="text-[#1A2753]">
                              {ACCOUNTING_PACKS.find(p => p.id === activeFolder.pack)?.name}
                            </span>
                            <span className="text-[#D6A93A]">{estimatedPrice.toLocaleString()} FCFA/mois</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[#273A7A]/80 text-sm mb-2">Exercice fiscal</label>
                          <div className="p-3 bg-[#F5F6FA] rounded-xl text-[#1A2753]">
                            {activeFolder.fiscalYearStart} → {activeFolder.fiscalYearEnd}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[#273A7A]/80 text-sm mb-2">Secteur d&apos;activité</label>
                          <div className="p-3 bg-[#F5F6FA] rounded-xl text-[#1A2753]">
                            {BUSINESS_SECTORS.find(s => s.id === activeFolder.sector)?.label}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[#273A7A]/80 text-sm mb-2">TVA</label>
                          <div className="p-3 bg-[#F5F6FA] rounded-xl text-[#1A2753]">
                            {activeFolder.vatSubject 
                              ? `Assujetti - ${activeFolder.vatPeriod === 'monthly' ? 'Mensuelle' : 'Trimestrielle'}` 
                              : 'Non assujetti'}
                          </div>
                        </div>

                        <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full py-3 bg-[#273A7A] text-white rounded-xl hover:bg-[#1A2753] transition-all mt-6">
                          Modifier les paramètres
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal d'envoi de documents */}
      {showSendDocuments && activeFolder && (
        <SendAccountingDocuments
          folder={activeFolder}
          onClose={() => setShowSendDocuments(false)}
        />
      )}
    </div>
  );
};