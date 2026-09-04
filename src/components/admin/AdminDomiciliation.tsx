import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  DollarSign,
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
  MoreVertical,
  Users,
  TrendingUp,
  CreditCard,
  Mail,
  Phone,
  X,
  Check,
  RefreshCw,
  Archive,
  Settings,
  Plus,
  Edit,
  Trash2,
  Home,
  Package,
  BarChart3,
  Percent,
  AlertCircle,
  MessageSquare,
  History,
  Upload,
  User,
  BadgeCheck,
  ShieldQuestion,
  Info,
  Briefcase,
  Tag,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { formatFCFACompact } from '../../lib/format';
import type {
  DomiciliationContract,
  DomiciliationOffer,
  DomiciliationPayment,
  ContractStatus,
  PaymentStatus,
  PeriodType,
} from '../../data/domiciliationData';
import {
  mockDomiciliationOffers,
  getContractStatusLabel,
  getContractStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getPeriodLabel,
} from '../../data/domiciliationData';
import { nouvelId } from '../../lib/id';

interface AdminDomiciliationProps {
  onBack: () => void;
}

// Extended contract type with registration & company info tracking
interface ExtendedContract extends DomiciliationContract {
  companyRegistered?: boolean;
  companyInfo?: {
    profession: string;
    telephone: string;
    email: string;
    formeJuridique: string;
    denomination: string;
    objetSocial: string;
    capitalSocial: string;
    associes: { nom: string; pourcentage: string }[];
  };
  contractAccepted?: boolean;
  tier?: 'essentiel' | 'business' | 'premium';
  deposit?: number; // Caution, reprise de l'offre de domiciliation
}

export const AdminDomiciliation: React.FC<AdminDomiciliationProps> = ({ onBack }) => {
  const { companies, domiciliations, updateDomiciliation, users, addNotification } = useApp();

  /**
   * Nom porté par un contrat : la société si elle est connue, sinon le client.
   * Un contrat souscrit avant l'immatriculation n'a pas de société, et l'écran
   * affichait alors le mot « Entreprise » pour tout le monde.
   */
  const titulaireDuContrat = (contrat: DomiciliationContract): string => {
    const societe = companies.find(c => c.id === contrat.companyId);
    if (societe) return societe.name;
    const client = users.find(u => u.id === contrat.userId);
    return client ? client.name : 'Client';
  };
  
  const [view, setView] = useState<'overview' | 'contracts' | 'offers' | 'details' | 'add-address' | 'edit-address'>('overview');
  const [selectedContract, setSelectedContract] = useState<ExtendedContract | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<DomiciliationOffer | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ContractStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'terminate' | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  // États pour le formulaire d'ajout/modification d'adresse
  const [addressForm, setAddressForm] = useState({
    name: '',
    address: '',
    zone: '',
    city: 'Dakar',
    postalCode: '',
    description: '',
    services: [] as string[],
    features: [] as string[],
    receptionCapacity: 50,
    quota: 100,
    available: 100,
    status: 'published' as 'draft' | 'published' | 'suspended',
    tier: 'essentiel' as 'essentiel' | 'business' | 'premium',
    prices: {
      monthly: 0,
      quarterly: 0,
      biannual: 0,
      yearly: 0
    }
  });
  const [newService, setNewService] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [offers, setOffers] = useState<DomiciliationOffer[]>(mockDomiciliationOffers);

  // Mock contracts data (updated to match new offer IDs)
  /**
   * Contrats d'exemple, conservés pour peupler l'écran.
   *
   * Les souscriptions réelles arrivent du référentiel partagé : cet écran ne
   * voyait que ces exemples, si bien qu'un contrat payé par un client
   * n'atteignait jamais l'administration.
   */
  const [contratsExemple, setContratsExemple] = useState<ExtendedContract[]>([
    {
      id: 'cont-1',
      offerId: 'dom-business',
      userId: '1',
      companyId: '1',
      status: 'active',
      period: 'yearly',
      startDate: '2024-01-15',
      endDate: '2025-01-14',
      monthlyAmount: 50000,
      totalAmount: Math.round(50000 * 12 * 0.88),
      autoRenewal: true,
      renewalNotice: 30,
      version: 1,
      signedAt: '2024-01-10',
      signedBy: ['user-1'],
      comments: [],
      documents: [],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-15',
      companyRegistered: true,
      contractAccepted: true,
      tier: 'business',
    },
    {
      id: 'cont-2',
      offerId: 'dom-premium',
      userId: '2',
      companyId: '2',
      status: 'sent',
      period: 'quarterly',
      startDate: '2024-11-01',
      endDate: '2025-01-31',
      monthlyAmount: 100000,
      totalAmount: Math.round(100000 * 3 * 0.95),
      autoRenewal: false,
      renewalNotice: 30,
      version: 1,
      comments: [],
      documents: [],
      createdAt: '2024-10-25',
      updatedAt: '2024-10-25',
      companyRegistered: true,
      contractAccepted: true,
      tier: 'premium',
    },
    {
      id: 'cont-3',
      offerId: 'dom-essentiel',
      userId: '3',
      companyId: '3',
      status: 'validated',
      period: 'monthly',
      startDate: '2024-11-10',
      endDate: '2024-12-09',
      monthlyAmount: 25000,
      totalAmount: 25000,
      autoRenewal: true,
      renewalNotice: 15,
      version: 1,
      comments: [],
      documents: [],
      createdAt: '2024-11-03',
      updatedAt: '2024-11-05',
      companyRegistered: false,
      companyInfo: {
        profession: 'Consultant',
        telephone: '+221 77 123 45 67',
        email: 'info@consulting-suarl.sn',
        formeJuridique: 'SUARL',
        denomination: 'Services Conseils SUARL',
        objetSocial: 'Conseil en gestion et formation',
        capitalSocial: '1 000 000',
        associes: [{ nom: 'Moussa Diop', pourcentage: '100' }],
      },
      contractAccepted: true,
      tier: 'essentiel',
    },
  ]);

  /** Souscriptions réelles d'abord : ce sont elles qui appellent une décision. */
  const contracts: ExtendedContract[] = [...domiciliations, ...contratsExemple];

  /** Un contrat réel est écrit dans le référentiel ; un exemple reste local. */
  const majContrat = (id: string, updates: Partial<ExtendedContract>) => {
    if (domiciliations.some(c => c.id === id)) updateDomiciliation(id, updates);
    else setContratsExemple(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Mock payments data
  const [payments] = useState<DomiciliationPayment[]>([
    {
      id: 'pay-1',
      contractId: 'cont-1',
      userId: '1',
      type: 'rent',
      amount: 480000,
      dueDate: '2024-01-15',
      paidDate: '2024-01-12',
      status: 'paid',
      method: 'orange_money',
      transactionId: 'OM123456',
      reminders: [],
    },
    {
      id: 'pay-3',
      contractId: 'cont-3',
      userId: '3',
      type: 'rent',
      amount: 60000,
      dueDate: '2024-11-10',
      status: 'late',
      reminders: [
        {
          id: 'rem-1',
          type: 'email',
          sentAt: '2024-11-11',
          status: 'sent',
        },
      ],
    },
  ]);

  const getOfferById = (offerId: string) => {
    return mockDomiciliationOffers.find(o => o.id === offerId);
  };

  const getCompanyById = (companyId?: string) => {
    return companies.find(c => c.id === companyId);
  };

  const getContractPayments = (contractId: string) => {
    return payments.filter(p => p.contractId === contractId);
  };

  const handleContractAction = (action: 'approve' | 'reject' | 'suspend' | 'terminate') => {
    if (!selectedContract) return;

    let newStatus: ContractStatus = selectedContract.status;
    let notificationTitle = '';
    let notificationMessage = '';

    switch (action) {
      case 'approve':
        newStatus = 'validated';
        notificationTitle = 'Demande de domiciliation approuvée';
        notificationMessage = 'Votre demande de domiciliation a été approuvée. Veuillez signer le contrat.';
        break;
      case 'reject':
        newStatus = 'terminated';
        notificationTitle = 'Demande de domiciliation rejetée';
        notificationMessage = actionComment || 'Votre demande de domiciliation a été rejetée.';
        break;
      case 'suspend':
        newStatus = 'suspended';
        notificationTitle = 'Contrat de domiciliation suspendu';
        notificationMessage = actionComment || 'Votre contrat de domiciliation a été suspendu.';
        break;
      case 'terminate':
        newStatus = 'terminated';
        notificationTitle = 'Contrat de domiciliation résilié';
        notificationMessage = actionComment || 'Votre contrat de domiciliation a été résilié.';
        break;
    }

    majContrat(selectedContract.id, { status: newStatus, updatedAt: new Date().toISOString() });
    setSelectedContract({ ...selectedContract, status: newStatus });

    addNotification({
      userId: selectedContract.userId,
      title: notificationTitle,
      message: notificationMessage,
      type: action === 'approve' ? 'success' : 'warning',
      read: false,
    });

    setShowActionModal(false);
    setActionType(null);
    setActionComment('');
  };

  const handleSendMessage = () => {
    if (!selectedContract || !messageText.trim()) return;

    addNotification({
      userId: selectedContract.userId,
      title: 'Message concernant votre domiciliation',
      message: messageText,
      type: 'info',
      read: false,
    });

    setMessageText('');
    setShowMessageModal(false);
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    const company = getCompanyById(contract.companyId);
    const offer = getOfferById(contract.offerId);
    const matchesSearch =
      company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    pending: contracts.filter(c => c.status === 'sent' || c.status === 'validated').length,
    suspended: contracts.filter(c => c.status === 'suspended').length,
    revenue: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    latePay: payments.filter(p => p.status === 'late').length,
    occupancy: mockDomiciliationOffers.reduce((sum, o) => sum + (o.quota - o.available), 0),
    capacity: mockDomiciliationOffers.reduce((sum, o) => sum + o.quota, 0),
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
            <h2 className="text-[#1A2753]">Gestion de la domiciliation</h2>
            <p className="text-sm text-[#273A7A]/80 mt-1">
              Gérer les contrats, adresses et paiements
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
              <Building className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-3xl mb-1">{stats.active}</p>
                <p className="text-sm opacity-80">Contrats actifs</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <TrendingUp className="w-4 h-4" />
              <span>{stats.total} contrats au total</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[#D6A93A] to-[#b8902f] rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-3xl mb-1">{formatFCFACompact(stats.revenue)}</p>
                <p className="text-sm opacity-80">Revenus FCFA</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <CreditCard className="w-4 h-4" />
              <span>{payments.filter(p => p.status === 'paid').length} paiements reçus</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 border-2 border-[#F5F6FA]"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="text-right">
                <p className="text-[#1A2753] text-3xl mb-1">{stats.pending}</p>
                <p className="text-sm text-[#273A7A]/80">En attente</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#273A7A]/80">
              <AlertTriangle className="w-4 h-4" />
              <span>{stats.latePay} paiements en retard</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 border-2 border-[#F5F6FA]"
          >
            <div className="flex items-center justify-between mb-4">
              <Home className="w-8 h-8 text-purple-600" />
              <div className="text-right">
                <p className="text-[#1A2753] text-3xl mb-1">{Math.round((stats.occupancy / stats.capacity) * 100)}%</p>
                <p className="text-sm text-[#273A7A]/80">Taux d'occupation</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#273A7A]/80">
              <Package className="w-4 h-4" />
              <span>{stats.occupancy}/{stats.capacity} places</span>
            </div>
          </motion.div>
        </div>

        {/* Packs Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1A2753] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#D6A93A]" />
              Packs de domiciliation
            </h3>
            <div className="flex items-center gap-2 text-xs text-[#273A7A]/80">
              <Info className="w-4 h-4" />
              Remises : -5% (trim.), -8% (sem.), -12% (annuel)
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {mockDomiciliationOffers.map((offer) => {
              const tierContracts = contracts.filter(c => c.offerId === offer.id);
              return (
                <div key={offer.id} className={`p-4 rounded-xl border-2 ${offer.popular ? 'border-[#D6A93A] bg-[#D6A93A]/5' : 'border-[#F5F6FA]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#1A2753]">{offer.name}</span>
                    {offer.popular && <span className="text-xs bg-[#D6A93A] text-white px-2 py-0.5 rounded-full">Populaire</span>}
                  </div>
                  <p className="text-xl text-[#D6A93A] mb-1">{offer.prices.monthly.toLocaleString()} FCFA<span className="text-sm text-[#273A7A]/80">/mois</span></p>
                  <p className="text-xs text-[#273A7A]/80 mb-3">{offer.description.substring(0, 60)}...</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#273A7A]/80">{tierContracts.length} contrat(s)</span>
                    <span className="text-[#273A7A]/80">{offer.available}/{offer.quota} places</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setView('contracts')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-white rounded-2xl p-6 border-2 border-[#F5F6FA] hover:border-[#D6A93A] transition-all duration-300 text-left group"
          >
            <FileText className="w-8 h-8 text-[#D6A93A] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-[#1A2753] mb-2">Gérer les contrats</h3>
            <p className="text-sm text-[#273A7A]/80">
              Approuver, modifier ou résilier les contrats de domiciliation
            </p>
          </button>

          <button
            onClick={() => setView('offers')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-white rounded-2xl p-6 border-2 border-[#F5F6FA] hover:border-[#D6A93A] transition-all duration-300 text-left group"
          >
            <MapPin className="w-8 h-8 text-[#D6A93A] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-[#1A2753] mb-2">Gérer les adresses</h3>
            <p className="text-sm text-[#273A7A]/80">
              Ajouter, modifier ou suspendre les adresses de domiciliation
            </p>
          </button>

          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-white rounded-2xl p-6 border-2 border-[#F5F6FA] hover:border-[#D6A93A] transition-all duration-300 text-left group">
            <BarChart3 className="w-8 h-8 text-[#D6A93A] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-[#1A2753] mb-2">Rapports & Analytics</h3>
            <p className="text-sm text-[#273A7A]/80">
              Consulter les statistiques et les rapports financiers
            </p>
          </button>
        </div>

        {/* Recent Contracts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#1A2753]">Derniers contrats</h3>
            <button
              onClick={() => setView('contracts')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-sm text-[#D6A93A] hover:underline"
            >
              Voir tout
            </button>
          </div>

          <div className="space-y-3">
            {contracts.slice(0, 5).map((contract) => {
              const offer = getOfferById(contract.offerId);
              const company = getCompanyById(contract.companyId);
              const statusColor = getContractStatusColor(contract.status);

              return (
                <button type="button"
                  key={contract.id}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] block w-full text-left p-4 rounded-xl border-2 border-[#F5F6FA] hover:border-[#D6A93A] transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedContract(contract);
                    setView('details');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#F5F6FA] rounded-xl flex items-center justify-center">
                        <Building className="w-6 h-6 text-[#1A2753]" />
                      </div>
                      <div>
                        <h4 className="text-[#1A2753]">{titulaireDuContrat(contract)}</h4>
                        <p className="text-sm text-[#273A7A]/80 flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4" />
                          {offer?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[#1A2753]">{contract.totalAmount.toLocaleString()} FCFA</p>
                        <p className="text-sm text-[#273A7A]/80">{getPeriodLabel(contract.period)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-sm ${statusColor}`}>
                        {getContractStatusLabel(contract.status)}
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

  // ========== VUE CONTRACTS ==========
  if (view === 'contracts') {
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
            <h2 className="text-[#1A2753]">Contrats de domiciliation</h2>
            <p className="text-sm text-[#273A7A]/80 mt-1">
              {filteredContracts.length} contrat(s)
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
                placeholder="Rechercher par entreprise, adresse ou ID..."
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
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="validated">Validé</option>
                <option value="signed">Signé</option>
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                <option value="terminated">Résilié</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contracts List */}
        <div className="space-y-3">
          {filteredContracts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-[#273A7A]/30 mx-auto mb-4" />
              <p className="text-[#273A7A]/80">Aucun contrat trouvé</p>
            </div>
          ) : (
            filteredContracts.map((contract) => {
              const offer = getOfferById(contract.offerId);
              const company = getCompanyById(contract.companyId);
              const statusColor = getContractStatusColor(contract.status);
              const contractPayments = getContractPayments(contract.id);
              const hasLatePay = contractPayments.some(p => p.status === 'late');

              return (
                <motion.button type="button"
                  key={contract.id}
                  layout
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] block w-full text-left bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-[#D6A93A] transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedContract(contract);
                    setView('details');
                  }}
                >
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      contract.status === 'active' ? 'bg-green-50' :
                      contract.status === 'suspended' ? 'bg-orange-50' :
                      contract.status === 'terminated' || contract.status === 'expired' ? 'bg-red-50' :
                      'bg-blue-50'
                    }`}>
                      <Building className={`w-8 h-8 ${
                        contract.status === 'active' ? 'text-green-600' :
                        contract.status === 'suspended' ? 'text-orange-600' :
                        contract.status === 'terminated' || contract.status === 'expired' ? 'text-red-600' :
                        'text-blue-600'
                      }`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-[#1A2753] mb-1">{titulaireDuContrat(contract)}</h3>
                          <div className="flex items-center gap-4 text-sm text-[#273A7A]/80">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {offer?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(contract.startDate).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {getPeriodLabel(contract.period)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {contract.companyRegistered === false && (
                            <div className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs flex items-center gap-1">
                              <ShieldQuestion className="w-3.5 h-3.5" />
                              Non immat.
                            </div>
                          )}
                          {hasLatePay && (
                            <div className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              Retard
                            </div>
                          )}
                          <span className={`px-3 py-1 rounded-lg text-sm ${statusColor}`}>
                            {getContractStatusLabel(contract.status)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-[#F5F6FA] rounded-xl p-3">
                          <p className="text-xs text-[#273A7A]/80 mb-1">Montant mensuel</p>
                          <p className="text-[#1A2753]">{contract.monthlyAmount.toLocaleString()} FCFA</p>
                        </div>
                        <div className="bg-[#F5F6FA] rounded-xl p-3">
                          <p className="text-xs text-[#273A7A]/80 mb-1">Montant total</p>
                          <p className="text-[#1A2753]">{contract.totalAmount.toLocaleString()} FCFA</p>
                        </div>
                        <div className="bg-[#F5F6FA] rounded-xl p-3">
                          <p className="text-xs text-[#273A7A]/80 mb-1">Date de fin</p>
                          <p className="text-[#1A2753]">{new Date(contract.endDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="bg-[#F5F6FA] rounded-xl p-3">
                          <p className="text-xs text-[#273A7A]/80 mb-1">Renouvellement</p>
                          <p className="text-[#1A2753]">{contract.autoRenewal ? 'Automatique' : 'Manuel'}</p>
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

  // ========== VUE OFFERS ==========
  if (view === 'offers') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button aria-label="Retour"
              onClick={() => setView('overview')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-white hover:bg-[#F5F6FA] rounded-xl flex items-center justify-center transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
            </button>
            <div>
              <h2 className="text-[#1A2753]">Adresses de domiciliation</h2>
              <p className="text-sm text-[#273A7A]/80 mt-1">
                {mockDomiciliationOffers.length} adresse(s) disponible(s)
              </p>
            </div>
          </div>
          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            onClick={() => {
              // Réinitialiser le formulaire
              setAddressForm({
                name: '',
                address: '',
                zone: '',
                city: 'Dakar',
                postalCode: '',
                description: '',
                services: [],
                features: [],
                receptionCapacity: 50,
                quota: 100,
                available: 100,
                status: 'published',
                tier: 'essentiel',
                prices: {
                  monthly: 0,
                  quarterly: 0,
                  biannual: 0,
                  yearly: 0
                }
              });
              setView('add-address');
            }}
          >
            <Plus className="w-4 h-4" />
            Ajouter une adresse
          </button>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-2 gap-6">
          {mockDomiciliationOffers.map((offer) => {
            const occupancyRate = ((offer.quota - offer.available) / offer.quota) * 100;
            const contractsCount = contracts.filter(c => c.offerId === offer.id).length;

            return (
              <motion.div
                key={offer.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[#F5F6FA] hover:border-[#D6A93A] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[#1A2753] mb-2">{offer.name}</h3>
                    <p className="text-sm text-[#273A7A]/80 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {offer.zone}, {offer.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button aria-label="Modifier l’offre" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOffer(offer);
                        setAddressForm({
                          name: offer.name,
                          address: offer.address,
                          zone: offer.zone,
                          city: offer.city,
                          postalCode: offer.postalCode,
                          description: offer.description,
                          services: offer.services,
                          features: offer.features,
                          receptionCapacity: offer.receptionCapacity,
                          quota: offer.quota,
                          available: offer.available,
                          status: offer.status,
                          tier: offer.tier || 'essentiel',
                          prices: offer.prices
                        });
                        setView('edit-address');
                      }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 bg-[#F5F6FA] hover:bg-[#E5E6EB] rounded-lg flex items-center justify-center transition-all"
                    >
                      <Edit className="w-4 h-4 text-[#1A2753]" />
                    </button>
                    <button aria-label="Configurer l’offre" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOffer(offer);
                        setAddressForm({
                          name: offer.name,
                          address: offer.address,
                          zone: offer.zone,
                          city: offer.city,
                          postalCode: offer.postalCode,
                          description: offer.description,
                          services: offer.services,
                          features: offer.features,
                          receptionCapacity: offer.receptionCapacity,
                          quota: offer.quota,
                          available: offer.available,
                          status: offer.status,
                          tier: offer.tier || 'essentiel',
                          prices: offer.prices
                        });
                        setView('edit-address');
                      }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 bg-[#F5F6FA] hover:bg-[#E5E6EB] rounded-lg flex items-center justify-center transition-all"
                    >
                      <Settings className="w-4 h-4 text-[#1A2753]" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-[#273A7A]/80 mb-4 line-clamp-2">
                  {offer.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#F5F6FA] rounded-xl p-3">
                    <p className="text-xs text-[#273A7A]/80 mb-1">Occupation</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[#1A2753]">{occupancyRate.toFixed(0)}%</p>
                      <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D6A93A] to-[#b8902f]"
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#F5F6FA] rounded-xl p-3">
                    <p className="text-xs text-[#273A7A]/80 mb-1">Contrats actifs</p>
                    <p className="text-[#1A2753]">{contractsCount}</p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-xl p-4 text-white">
                  <p className="text-sm opacity-80 mb-2">À partir de</p>
                  <p className="text-2xl mb-1">{offer.prices.monthly.toLocaleString()} FCFA</p>
                  <p className="text-sm opacity-80">par mois</p>
                </div>

                {/* Services */}
                <div className="mt-4">
                  <p className="text-sm text-[#273A7A]/80 mb-2">Services inclus :</p>
                  <div className="flex flex-wrap gap-2">
                    {offer.services.slice(0, 3).map((service, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#F5F6FA] text-xs text-[#1A2753] rounded-lg"
                      >
                        {service}
                      </span>
                    ))}
                    {offer.services.length > 3 && (
                      <span className="px-2 py-1 bg-[#F5F6FA] text-xs text-[#273A7A]/80 rounded-lg">
                        +{offer.services.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ========== VUE DETAILS ==========
  if (view === 'details' && selectedContract) {
    const offer = getOfferById(selectedContract.offerId);
    const company = getCompanyById(selectedContract.companyId);
    const contractPayments = getContractPayments(selectedContract.id);
    const statusColor = getContractStatusColor(selectedContract.status);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button aria-label="Retour"
            onClick={() => {
              setSelectedContract(null);
              setView('contracts');
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-white hover:bg-[#F5F6FA] rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-[#1A2753]">{titulaireDuContrat(selectedContract)}</h2>
              <span className={`px-3 py-1 rounded-lg text-sm ${statusColor}`}>
                {getContractStatusLabel(selectedContract.status)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#273A7A]/80">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {offer?.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Du {new Date(selectedContract.startDate).toLocaleDateString('fr-FR')} au{' '}
                {new Date(selectedContract.endDate).toLocaleDateString('fr-FR')}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Contrat #{selectedContract.id}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMessageModal(true)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-white border-2 border-[#F5F6FA] text-[#1A2753] rounded-xl hover:border-[#D6A93A] transition-all duration-300 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Contacter
            </button>
            {selectedContract.status === 'sent' && (
              <>
                <button
                  onClick={() => {
                    setActionType('approve');
                    setShowActionModal(true);
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approuver
                </button>
                <button
                  onClick={() => {
                    setActionType('reject');
                    setShowActionModal(true);
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter
                </button>
              </>
            )}
            {selectedContract.status === 'active' && (
              <button
                onClick={() => {
                  setActionType('suspend');
                  setShowActionModal(true);
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Suspendre
              </button>
            )}
          </div>
        </div>

        {/* Registration Status & Contract Acceptance */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              {selectedContract.companyRegistered ? (
                <BadgeCheck className="w-5 h-5 text-green-600" />
              ) : (
                <ShieldQuestion className="w-5 h-5 text-orange-600" />
              )}
              Statut d'immatriculation
            </h3>
            <div className={`p-4 rounded-xl border-2 ${
              selectedContract.companyRegistered
                ? 'bg-green-50 border-green-200'
                : 'bg-orange-50 border-orange-200'
            }`}>
              <p className="text-[#1A2753] mb-1">
                {selectedContract.companyRegistered
                  ? 'Société immatriculée'
                  : 'Société non immatriculée'}
              </p>
              <p className="text-xs text-[#273A7A]/80">
                {selectedContract.companyRegistered
                  ? 'Documents requis : CNI, Statuts, RCCM, NINEA'
                  : 'Documents requis : CIN du représentant + fiche de renseignements'}
              </p>
            </div>
            {selectedContract.tier && (
              <div className="mt-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#D6A93A]" />
                <span className="text-sm text-[#1A2753]">
                  Pack {selectedContract.tier?.charAt(0).toUpperCase()}{selectedContract.tier?.slice(1)}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D6A93A]" />
              Acceptation du contrat
            </h3>
            <div className={`p-4 rounded-xl border-2 ${
              selectedContract.contractAccepted
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                {selectedContract.contractAccepted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <p className="text-[#1A2753] text-sm">
                    {selectedContract.contractAccepted
                      ? 'Mentions légales acceptées'
                      : 'En attente d\'acceptation'}
                  </p>
                  <p className="text-xs text-[#273A7A]/80 mt-1">
                    Checkbox de validation des conditions générales et mentions légales
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-[#F5F6FA] rounded-xl">
              <p className="text-xs text-[#273A7A]/80">
                <Info className="w-3.5 h-3.5 inline mr-1" />
                Le client doit cocher la case d'acceptation des mentions légales et conditions du contrat avant signature.
              </p>
            </div>
          </div>
        </div>

        {/* Company Info (for non-registered companies) */}
        {!selectedContract.companyRegistered && selectedContract.companyInfo && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#D6A93A]" />
              Fiche de renseignements (société non immatriculée)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-[#F5F6FA] rounded-xl">
                <p className="text-xs text-[#273A7A]/80 mb-1">Dénomination</p>
                <p className="text-[#1A2753] text-sm">{selectedContract.companyInfo!.denomination}</p>
              </div>
              <div className="p-3 bg-[#F5F6FA] rounded-xl">
                <p className="text-xs text-[#273A7A]/80 mb-1">Forme juridique</p>
                <p className="text-[#1A2753] text-sm">{selectedContract.companyInfo!.formeJuridique}</p>
              </div>
              <div className="p-3 bg-[#F5F6FA] rounded-xl">
                <p className="text-xs text-[#273A7A]/80 mb-1">Capital social</p>
                <p className="text-[#1A2753] text-sm">{selectedContract.companyInfo!.capitalSocial} FCFA</p>
              </div>
              <div className="p-3 bg-[#F5F6FA] rounded-xl">
                <p className="text-xs text-[#273A7A]/80 mb-1">Objet social</p>
                <p className="text-[#1A2753] text-sm">{selectedContract.companyInfo!.objetSocial}</p>
              </div>
              <div className="p-3 bg-[#F5F6FA] rounded-xl">
                <p className="text-xs text-[#273A7A]/80 mb-1">Profession</p>
                <p className="text-[#1A2753] text-sm">{selectedContract.companyInfo!.profession}</p>
              </div>
              <div className="p-3 bg-[#F5F6FA] rounded-xl">
                <p className="text-xs text-[#273A7A]/80 mb-1">Contact</p>
                <p className="text-[#1A2753] text-sm">{selectedContract.companyInfo!.telephone}</p>
                <p className="text-[#1A2753] text-xs">{selectedContract.companyInfo!.email}</p>
              </div>
            </div>
            {selectedContract.companyInfo!.associes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-[#273A7A]/80 mb-2">Associés :</p>
                <div className="space-y-2">
                  {selectedContract.companyInfo!.associes.map((associe, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#F5F6FA] rounded-xl">
                      <span className="text-[#1A2753] text-sm">{associe.nom}</span>
                      <span className="text-[#D6A93A] text-sm">{associe.pourcentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contract Details */}
        <div className="grid grid-cols-3 gap-6">
          {/* Column 1: Financial Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#D6A93A]" />
              Informations financières
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Période</p>
                <p className="text-[#1A2753]">{getPeriodLabel(selectedContract.period)}</p>
              </div>
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Remise appliquée</p>
                <p className="text-[#D6A93A]">
                  {selectedContract.period === 'monthly' ? 'Aucune' :
                   selectedContract.period === 'quarterly' ? '-5%' :
                   selectedContract.period === 'biannual' ? '-8%' :
                   '-12%'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Montant mensuel</p>
                <p className="text-[#1A2753] text-xl">{selectedContract.monthlyAmount.toLocaleString()} FCFA</p>
              </div>
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Montant total</p>
                <p className="text-[#1A2753] text-xl">{selectedContract.totalAmount.toLocaleString()} FCFA</p>
              </div>
              {selectedContract.deposit && (
                <div>
                  <p className="text-sm text-[#273A7A]/80 mb-1">Caution</p>
                  <p className="text-[#1A2753]">{selectedContract.deposit.toLocaleString()} FCFA</p>
                </div>
              )}
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Renouvellement</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedContract.autoRenewal ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <p className="text-[#1A2753]">{selectedContract.autoRenewal ? 'Automatique' : 'Manuel'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Contract Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D6A93A]" />
              Informations du contrat
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Date de début</p>
                <p className="text-[#1A2753]">
                  {new Date(selectedContract.startDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Date de fin</p>
                <p className="text-[#1A2753]">
                  {new Date(selectedContract.endDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Version du contrat</p>
                <p className="text-[#1A2753]">Version {selectedContract.version}</p>
              </div>
              {selectedContract.signedAt && (
                <div>
                  <p className="text-sm text-[#273A7A]/80 mb-1">Signé le</p>
                  <p className="text-[#1A2753]">
                    {new Date(selectedContract.signedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-[#273A7A]/80 mb-1">Préavis de résiliation</p>
                <p className="text-[#1A2753]">{selectedContract.renewalNotice} jours</p>
              </div>
            </div>
          </div>

          {/* Column 3: Offer Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D6A93A]" />
              Adresse de domiciliation
            </h3>
            {offer && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#273A7A]/80 mb-1">Nom</p>
                  <p className="text-[#1A2753]">{offer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[#273A7A]/80 mb-1">Adresse complète</p>
                  <p className="text-[#1A2753]">
                    {offer.address}
                    <br />
                    {offer.zone}, {offer.city}
                    <br />
                    {offer.postalCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#273A7A]/80 mb-2">Services inclus</p>
                  <div className="space-y-2">
                    {offer.services.map((service, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-[#1A2753]">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#D6A93A]" />
            Paiements ({contractPayments.length})
          </h3>
          <div className="space-y-3">
            {contractPayments.length === 0 ? (
              <div className="text-center py-8 bg-[#F5F6FA] rounded-xl">
                <CreditCard className="w-12 h-12 text-[#273A7A]/30 mx-auto mb-3" />
                <p className="text-[#273A7A]/80">Aucun paiement enregistré</p>
              </div>
            ) : (
              contractPayments.map((payment) => {
                const paymentStatusColor = getPaymentStatusColor(payment.status);
                const isLate = payment.status === 'late';

                return (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-xl border-2 ${
                      isLate ? 'bg-red-50/50 border-red-200' : 'border-[#F5F6FA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          payment.status === 'paid' ? 'bg-green-100' :
                          isLate ? 'bg-red-100' :
                          'bg-blue-100'
                        }`}>
                          <CreditCard className={`w-6 h-6 ${
                            payment.status === 'paid' ? 'text-green-600' :
                            isLate ? 'text-red-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="text-[#1A2753] mb-1">
                            {payment.type === 'rent' ? 'Loyer' : 'Pénalité'}
                          </h4>
                          <p className="text-sm text-[#273A7A]/80">
                            Échéance: {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                            {payment.paidDate && (
                              <> • Payé le {new Date(payment.paidDate).toLocaleDateString('fr-FR')}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[#1A2753] text-lg">{payment.amount.toLocaleString()} FCFA</p>
                          {payment.method && (
                            <p className="text-xs text-[#273A7A]/80">
                              {payment.method === 'orange_money' ? 'Orange Money' :
                               payment.method === 'wave' ? 'Wave' :
                               'Carte bancaire'}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-sm ${paymentStatusColor}`}>
                          {getPaymentStatusLabel(payment.status)}
                        </span>
                      </div>
                    </div>
                    {isLate && payment.reminders.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-xs text-red-700">
                          {payment.reminders.length} rappel(s) envoyé(s)
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D6A93A]" />
            Documents ({selectedContract.documents.length})
          </h3>
          {selectedContract.documents.length === 0 ? (
            <div className="text-center py-8 bg-[#F5F6FA] rounded-xl">
              <FileText className="w-12 h-12 text-[#273A7A]/30 mx-auto mb-3" />
              <p className="text-[#273A7A]/80">Aucun document téléversé</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {selectedContract.documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl border-2 ${
                    doc.validated ? 'border-green-200 bg-green-50/50' : 'border-[#F5F6FA]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-5 h-5 ${doc.validated ? 'text-green-600' : 'text-[#273A7A]'}`} />
                      <div>
                        <h4 className="text-[#1A2753] text-sm">{doc.name}</h4>
                        <p className="text-xs text-[#273A7A]/80 mt-1">
                          {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    {doc.validated && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-3 py-1.5 bg-[#F5F6FA] text-[#1A2753] rounded-lg hover:bg-[#E5E6EB] transition-all text-sm flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      Voir
                    </button>
                    <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-3 py-1.5 bg-[#F5F6FA] text-[#1A2753] rounded-lg hover:bg-[#E5E6EB] transition-all text-sm flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Modal */}
        <AnimatePresence>
          {showActionModal && actionType && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowActionModal(false)}
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
                    {actionType === 'approve' && 'Approuver la demande'}
                    {actionType === 'reject' && 'Rejeter la demande'}
                    {actionType === 'suspend' && 'Suspendre le contrat'}
                    {actionType === 'terminate' && 'Résilier le contrat'}
                  </h3>
                  <button aria-label="Fermer"
                    onClick={() => setShowActionModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 bg-[#F5F6FA] hover:bg-[#E5E6EB] rounded-lg flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4 text-[#1A2753]" />
                  </button>
                </div>

                <div className="space-y-4">
                  {actionType !== 'approve' && (
                    <div>
                      <label className="block text-sm text-[#1A2753] mb-2">
                        {/* Branche inatteignable : le bloc parent exclut déjà
                            'approve'. Cast en `string` pour éviter le TS2367. */}
                        Motif {(actionType as string) === 'approve' ? '(optionnel)' : '(obligatoire)'}
                      </label>
                      <textarea
                        value={actionComment}
                        onChange={(e) => setActionComment(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all resize-none"
                        rows={4}
                        placeholder="Expliquez la raison de cette action..."
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowActionModal(false);
                        setActionComment('');
                      }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#E5E6EB] transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleContractAction(actionType)}
                      disabled={actionType !== 'approve' && !actionComment.trim()}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 rounded-xl text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        actionType === 'approve'
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg'
                          : 'bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg'
                      }`}
                    >
                      {actionType === 'approve' && <CheckCircle className="w-5 h-5" />}
                      {actionType === 'reject' && <XCircle className="w-5 h-5" />}
                      {actionType === 'suspend' && <AlertCircle className="w-5 h-5" />}
                      {actionType === 'terminate' && <XCircle className="w-5 h-5" />}
                      Confirmer
                    </button>
                  </div>
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

  // ========== VUE ADD/EDIT ADDRESS ==========
  if (view === 'add-address' || view === 'edit-address') {
    const isEdit = view === 'edit-address';
    
    const handleSaveAddress = () => {
      const monthly = addressForm.prices.monthly;
      const newAddress: DomiciliationOffer = {
        id: isEdit && selectedOffer ? selectedOffer.id : nouvelId('dom'),
        name: addressForm.name,
        address: addressForm.address,
        zone: addressForm.zone,
        city: addressForm.city,
        postalCode: addressForm.postalCode,
        description: addressForm.description,
        services: addressForm.services,
        features: addressForm.features,
        receptionCapacity: addressForm.receptionCapacity,
        quota: addressForm.quota,
        available: isEdit && selectedOffer ? selectedOffer.available : addressForm.available,
        status: addressForm.status,
        tier: addressForm.tier,
        prices: {
          monthly: monthly,
          quarterly: Math.round(monthly * 3 * 0.95),
          biannual: Math.round(monthly * 6 * 0.92),
          yearly: Math.round(monthly * 12 * 0.88),
        }
      };

      if (isEdit) {
        setOffers(offers.map(o => o.id === newAddress.id ? newAddress : o));
      } else {
        setOffers([...offers, newAddress]);
      }

      setView('offers');
      setSelectedOffer(null);
    };

    const addService = () => {
      if (newService.trim() && !addressForm.services.includes(newService.trim())) {
        setAddressForm({...addressForm, services: [...addressForm.services, newService.trim()]});
        setNewService('');
      }
    };

    const removeService = (index: number) => {
      setAddressForm({...addressForm, services: addressForm.services.filter((_, i) => i !== index)});
    };

    const addFeature = () => {
      if (newFeature.trim() && !addressForm.features.includes(newFeature.trim())) {
        setAddressForm({...addressForm, features: [...addressForm.features, newFeature.trim()]});
        setNewFeature('');
      }
    };

    const removeFeature = (index: number) => {
      setAddressForm({...addressForm, features: addressForm.features.filter((_, i) => i !== index)});
    };

    const canSave = addressForm.name && addressForm.address && addressForm.zone && 
                    addressForm.description && addressForm.prices.monthly > 0 &&
                    addressForm.services.length > 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button aria-label="Retour"
            onClick={() => {
              setView('offers');
              setSelectedOffer(null);
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-white hover:bg-[#F5F6FA] rounded-xl flex items-center justify-center transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
          </button>
          <div>
            <h2 className="text-[#1A2753]">{isEdit ? 'Modifier l\'adresse' : 'Nouvelle adresse de domiciliation'}</h2>
            <p className="text-sm text-[#273A7A]/80 mt-1">
              {isEdit ? 'Modifiez les informations de l\'adresse' : 'Ajoutez une nouvelle adresse pour la domiciliation'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-3 gap-6">
          {/* Column 1: Informations générales */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#D6A93A]" />
                Informations générales
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#1A2753] mb-2">Nom de l'adresse *</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                    placeholder="Ex: Crésus Business Center – Immeuble Bourguiba"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#1A2753] mb-2">Zone *</label>
                    <input
                      type="text"
                      value={addressForm.zone}
                      onChange={(e) => setAddressForm({ ...addressForm, zone: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                      placeholder="Ex: Plateau, Mermoz..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#1A2753] mb-2">Ville *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                      placeholder="Dakar"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#1A2753] mb-2">Adresse complète *</label>
                  <input
                    type="text"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                    placeholder="Ex: Immeuble Bourguiba, Avenue Habib Bourguiba, Plateau"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#1A2753] mb-2">Code postal</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                    placeholder="Ex: BP 1234"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#1A2753] mb-2">Description *</label>
                  <textarea
                    value={addressForm.description}
                    onChange={(e) => setAddressForm({ ...addressForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Décrivez brièvement cette adresse de domiciliation..."
                  />
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#D6A93A]" />
                Services inclus *
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addService()}
                    className="flex-1 px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                    placeholder="Ajouter un service (ex: Réception du courrier)"
                  />
                  <button
                    onClick={addService}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {addressForm.services.map((service, index) => (
                    <div
                      key={index}
                      className="bg-[#F5F6FA] px-4 py-2 rounded-xl flex items-center gap-2 group"
                    >
                      <span className="text-sm text-[#1A2753]">{service}</span>
                      <button aria-label="Supprimer le service"
                        onClick={() => removeService(index)}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {addressForm.services.length === 0 && (
                    <p className="text-sm text-[#273A7A]/80">Aucun service ajouté</p>
                  )}
                </div>
              </div>
            </div>

            {/* Équipements & Avantages */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D6A93A]" />
                Équipements & Avantages
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    className="flex-1 px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                    placeholder="Ajouter un équipement (ex: Wifi haut débit)"
                  />
                  <button
                    onClick={addFeature}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {addressForm.features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-[#F5F6FA] px-4 py-2 rounded-xl flex items-center gap-2 group"
                    >
                      <span className="text-sm text-[#1A2753]">{feature}</span>
                      <button aria-label="Supprimer la caractéristique"
                        onClick={() => removeFeature(index)}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {addressForm.features.length === 0 && (
                    <p className="text-sm text-[#273A7A]/80">Aucun équipement ajouté</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Paramètres & Tarifs */}
          <div className="space-y-6">
            {/* Tier du pack */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#D6A93A]" />
                Niveau du pack
              </h3>
              <div className="space-y-2">
                {(['essentiel', 'business', 'premium'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setAddressForm({ ...addressForm, tier })}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full p-3 rounded-xl border-2 transition-all text-left ${
                      addressForm.tier === tier
                        ? 'border-[#D6A93A] bg-[#D6A93A]/5'
                        : 'border-[#F5F6FA] hover:border-[#D6A93A]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        addressForm.tier === tier ? 'border-[#D6A93A] bg-[#D6A93A]' : 'border-[#273A7A]/20'
                      }`}>
                        {addressForm.tier === tier && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-[#1A2753] text-sm capitalize">{tier}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tarification */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#D6A93A]" />
                Tarification
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#1A2753] mb-2">Prix mensuel (FCFA) *</label>
                  <input
                    type="number"
                    value={addressForm.prices.monthly || ''}
                    onChange={(e) => setAddressForm({
                      ...addressForm,
                      prices: { ...addressForm.prices, monthly: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                    placeholder="75000"
                  />
                </div>
                {addressForm.prices.monthly > 0 && (
                  <div className="bg-[#F5F6FA] rounded-xl p-4 space-y-2">
                    <p className="text-sm text-[#273A7A]/80">Tarifs automatiques avec remises :</p>
                    <div className="text-sm text-[#1A2753] space-y-1">
                      <p>• Trimestriel: {Math.round(addressForm.prices.monthly * 3 * 0.95).toLocaleString()} FCFA (-5%)</p>
                      <p>• Semestriel: {Math.round(addressForm.prices.monthly * 6 * 0.92).toLocaleString()} FCFA (-8%)</p>
                      <p>• Annuel: {Math.round(addressForm.prices.monthly * 12 * 0.88).toLocaleString()} FCFA (-12%)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Capacité */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D6A93A]" />
                Capacité
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#1A2753] mb-2">Quota total</label>
                  <input
                    type="number"
                    value={addressForm.quota}
                    onChange={(e) => setAddressForm({ ...addressForm, quota: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#1A2753] mb-2">Places disponibles</label>
                  <input
                    type="number"
                    value={addressForm.available}
                    onChange={(e) => setAddressForm({ ...addressForm, available: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#1A2753] mb-2">Capacité de réception</label>
                  <input
                    type="number"
                    value={addressForm.receptionCapacity}
                    onChange={(e) => setAddressForm({ ...addressForm, receptionCapacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
                    placeholder="50"
                  />
                  <p className="text-xs text-[#273A7A]/80 mt-2">Nombre de courriers/colis par mois</p>
                </div>
              </div>
            </div>

            {/* Statut */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#D6A93A]" />
                Statut de publication
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setAddressForm({ ...addressForm, status: 'published' })}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full p-4 rounded-xl border-2 transition-all text-left ${
                    addressForm.status === 'published'
                      ? 'border-green-500 bg-green-50'
                      : 'border-[#F5F6FA] hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      addressForm.status === 'published' ? 'border-green-500 bg-green-500' : 'border-[#273A7A]/20'
                    }`}>
                      {addressForm.status === 'published' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#1A2753]">Publiée</p>
                      <p className="text-xs text-[#273A7A]/80 mt-1">Visible pour les clients</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setAddressForm({ ...addressForm, status: 'draft' })}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full p-4 rounded-xl border-2 transition-all text-left ${
                    addressForm.status === 'draft'
                      ? 'border-gray-500 bg-gray-50'
                      : 'border-[#F5F6FA] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      addressForm.status === 'draft' ? 'border-gray-500 bg-gray-500' : 'border-[#273A7A]/20'
                    }`}>
                      {addressForm.status === 'draft' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#1A2753]">Brouillon</p>
                      <p className="text-xs text-[#273A7A]/80 mt-1">Non visible pour les clients</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setAddressForm({ ...addressForm, status: 'suspended' })}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full p-4 rounded-xl border-2 transition-all text-left ${
                    addressForm.status === 'suspended'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-[#F5F6FA] hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      addressForm.status === 'suspended' ? 'border-orange-500 bg-orange-500' : 'border-[#273A7A]/20'
                    }`}>
                      {addressForm.status === 'suspended' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#1A2753]">Suspendue</p>
                      <p className="text-xs text-[#273A7A]/80 mt-1">Temporairement indisponible</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm sticky bottom-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setView('offers');
                setSelectedOffer(null);
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-[#E5E6EB] transition-all flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <div className="flex items-center gap-3">
              {!canSave && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Veuillez remplir tous les champs obligatoires (*)
                </p>
              )}
              <button
                onClick={handleSaveAddress}
                disabled={!canSave}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {isEdit ? 'Enregistrer les modifications' : 'Créer l\'adresse'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};