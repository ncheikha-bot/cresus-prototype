import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Calendar,
  Upload,
  Download,
  Send,
  Edit,
  CheckCircle2,
  FileText,
  Save,
  FolderOpen,
  Clock,
  XCircle,
  CheckCheck,
  AlertCircle,
  User,
  Trash2,
  MoreVertical,
  Building2,
  Mail,
  Phone,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  X,
  Plus,
  ChevronRight,
  MessageSquare,
  History,
  Star,
  SortAsc,
} from '../ui/icons';
import {
  mockAccountingFolders,
  mockAccountingDocuments,
  mockTaxDeclarations,
  ACCOUNTING_PACKS,
  FISCAL_REGIMES,
  BUSINESS_SECTORS,
  DOCUMENT_TYPES,
  getMonthStatusLabel,
  getMonthStatusColor,
  getTaxStatusLabel,
  type AccountingFolder,
  type MonthStatus,
  type AccountingDocument,
  type DocumentStatus,
} from '../../data/accountingData';
import { toast } from 'sonner';

interface AccountantFoldersImprovedProps {
  onBack?: () => void;
}

type View = 'list' | 'detail' | 'monthly';
type SortBy = 'name' | 'status' | 'date' | 'priority';
type FilterStatus = 'all' | 'active' | 'waiting' | 'in_progress' | 'urgent';

export const AccountantFoldersImproved: React.FC<AccountantFoldersImprovedProps> = ({ onBack }) => {
  const [view, setView] = useState<View>('list');
  const [selectedFolder, setSelectedFolder] = useState<AccountingFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [showFilters, setShowFilters] = useState(false);
  const [docFilter, setDocFilter] = useState<DocumentStatus | 'all'>('all');
  const [showRequestMissingDocs, setShowRequestMissingDocs] = useState(false);
  const [missingDocMessage, setMissingDocMessage] = useState('');
  const [showDocDetail, setShowDocDetail] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<AccountingDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [monthlyData, setMonthlyData] = useState({
    revenue: '',
    expenses: '',
    vatCollected: '',
    vatDeductible: '',
    notes: '',
  });
  const [documentStatuses, setDocumentStatuses] = useState<Record<string, DocumentStatus>>({});

  const folders = mockAccountingFolders;
  const documents = mockAccountingDocuments;

  // Initialiser les statuts des documents
  useEffect(() => {
    const initialStatuses: Record<string, DocumentStatus> = {};
    documents.forEach((doc) => {
      initialStatuses[doc.id] = doc.status;
    });
    setDocumentStatuses(initialStatuses);
  }, []);

  // Statistiques globales
  const stats = {
    total: folders.length,
    active: folders.filter((f) => f.status === 'active').length,
    waiting: folders.filter((f) => f.currentMonth?.status === 'waiting_documents').length,
    urgent: folders.filter(
      (f) =>
        f.currentMonth?.status === 'waiting_documents' ||
        (f.currentMonth?.deadline &&
          new Date(f.currentMonth.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
    ).length,
  };

  // Filtrage et tri
  const getFilteredAndSortedFolders = () => {
    let filtered = folders.filter((folder) => {
      const matchesSearch =
        folder.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folder.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && folder.status === 'active') ||
        (filterStatus === 'waiting' && folder.currentMonth?.status === 'waiting_documents') ||
        (filterStatus === 'in_progress' && folder.currentMonth?.status === 'in_progress') ||
        (filterStatus === 'urgent' &&
          (folder.currentMonth?.status === 'waiting_documents' ||
            (folder.currentMonth?.deadline &&
              new Date(folder.currentMonth.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))));

      return matchesSearch && matchesStatus;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.companyName.localeCompare(b.companyName);
        case 'status':
          return (a.currentMonth?.status || '').localeCompare(b.currentMonth?.status || '');
        case 'date':
          return new Date(b.activatedAt || 0).getTime() - new Date(a.activatedAt || 0).getTime();
        case 'priority':
        default:
          // Urgent d'abord
          const aUrgent =
            a.currentMonth?.status === 'waiting_documents' ||
            (a.currentMonth?.deadline &&
              new Date(a.currentMonth.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
          const bUrgent =
            b.currentMonth?.status === 'waiting_documents' ||
            (b.currentMonth?.deadline &&
              new Date(b.currentMonth.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
          if (aUrgent && !bUrgent) return -1;
          if (!aUrgent && bUrgent) return 1;
          return 0;
      }
    });

    return filtered;
  };

  const filteredFolders = getFilteredAndSortedFolders();

  const getFolderDocuments = (folderId: string) => {
    const folderDocs = documents.filter((d) => d.folderId === folderId).map((doc) => ({
      ...doc,
      status: documentStatuses[doc.id] || doc.status,
    }));
    if (docFilter === 'all') return folderDocs;
    return folderDocs.filter((d) => (documentStatuses[d.id] || d.status) === docFilter);
  };

  const handleSelectFolder = (folder: AccountingFolder) => {
    setSelectedFolder(folder);
    setView('detail');
  };

  const handleValidateDocument = (doc: AccountingDocument) => {
    setDocumentStatuses((prev) => ({
      ...prev,
      [doc.id]: 'validated',
    }));
    toast.success(`Document "${doc.fileName}" validé avec succès`);
  };

  const handleRejectDocument = (doc: AccountingDocument, reason: string) => {
    if (!reason.trim()) {
      toast.error('Veuillez indiquer la raison du rejet');
      return;
    }
    setDocumentStatuses((prev) => ({
      ...prev,
      [doc.id]: 'rejected',
    }));
    toast.success(`Document "${doc.fileName}" rejeté`, {
      description: `Raison : ${reason}`,
    });
    setShowDocDetail(false);
    setSelectedDoc(null);
    setRejectionReason('');
  };

  const getPriorityBadge = (folder: AccountingFolder) => {
    const isUrgent =
      folder.currentMonth?.status === 'waiting_documents' ||
      (folder.currentMonth?.deadline &&
        new Date(folder.currentMonth.deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));

    if (isUrgent) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
          Urgent
        </span>
      );
    }
    return null;
  };

  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {onBack && (
                  <button aria-label="Retour"
                    onClick={onBack}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-gray-600 hover:text-[#1A2753] transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl text-[#1A2753]">Gestion des dossiers</h1>
                  <p className="text-sm text-gray-500">{filteredFolders.length} dossiers</p>
                </div>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <motion.button
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setFilterStatus('all')}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-4 rounded-xl border-2 transition-all ${
                  filterStatus === 'all'
                    ? 'border-[#D6A93A] bg-[#D6A93A]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-2xl font-bold text-[#1A2753]">{stats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </motion.button>

              <motion.button
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05 }}
                onClick={() => setFilterStatus('active')}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-4 rounded-xl border-2 transition-all ${
                  filterStatus === 'active'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-sm text-gray-600">Actifs</p>
              </motion.button>

              <motion.button
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                onClick={() => setFilterStatus('waiting')}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-4 rounded-xl border-2 transition-all ${
                  filterStatus === 'waiting'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-2xl font-bold text-orange-600">{stats.waiting}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </motion.button>

              <motion.button
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 }}
                onClick={() => setFilterStatus('urgent')}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-4 rounded-xl border-2 transition-all ${
                  filterStatus === 'urgent'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                <p className="text-sm text-gray-600">Urgents</p>
              </motion.button>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Rechercher un dossier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] outline-none"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                <span>Filtres</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <option value="priority">Par priorité</option>
                <option value="name">Par nom</option>
                <option value="status">Par statut</option>
                <option value="date">Par date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des dossiers */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid gap-4">
            {filteredFolders.map((folder, index) => (
              <motion.button type="button"
                key={folder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectFolder(folder)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] block w-full text-left bg-white rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-[#D6A93A] group"
              >
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">
                      {folder.companyName
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                  </div>

                  {/* Info principale */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[#1A2753] font-medium text-lg">
                            {folder.companyName}
                          </h3>
                          {getPriorityBadge(folder)}
                        </div>
                        <p className="text-gray-500 text-sm">Dossier #{folder.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-4 py-2 rounded-xl text-sm font-medium"
                          style={{
                            backgroundColor: getMonthStatusColor(folder.currentMonth?.status || 'waiting_documents') + '20',
                            color: getMonthStatusColor(folder.currentMonth?.status || 'waiting_documents'),
                          }}
                        >
                          {getMonthStatusLabel(folder.currentMonth?.status || 'waiting_documents')}
                        </span>
                      </div>
                    </div>

                    {/* Stats mini */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <p className="text-xs text-gray-600">Documents</p>
                        </div>
                        <p className="text-lg font-bold text-[#1A2753]">
                          {folder.currentMonth?.documentsCount?.received || 0}/
                          {folder.currentMonth?.documentsCount?.total || 0}
                        </p>
                      </div>

                      <div className="p-3 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <p className="text-xs text-gray-600">Validés</p>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          {folder.currentMonth?.documentsCount?.validated || 0}
                        </p>
                      </div>

                      <div className="p-3 bg-orange-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <p className="text-xs text-gray-600">En cours</p>
                        </div>
                        <p className="text-lg font-bold text-orange-600">
                          {(folder.currentMonth?.documentsCount?.received || 0) -
                            (folder.currentMonth?.documentsCount?.validated || 0)}
                        </p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-blue-500" />
                          <p className="text-xs text-gray-600">Forfait</p>
                        </div>
                        <p className="text-sm font-medium text-blue-600">
                          {ACCOUNTING_PACKS.find((p) => p.id === folder.pack)?.name || folder.pack}
                        </p>
                      </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {folder.currentMonth?.deadline && (
                          <span>
                            Échéance:{' '}
                            {new Date(folder.currentMonth.deadline).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        )}
                      </div>
                      <span className="px-4 py-2 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2">
                        Ouvrir
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {filteredFolders.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">Aucun dossier trouvé</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vue détail d'un dossier
  if (view === 'detail' && selectedFolder) {
    const folderDocs = getFolderDocuments(selectedFolder.id);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4 mb-4">
              <button aria-label="Retour"
                onClick={() => {
                  setView('list');
                  setSelectedFolder(null);
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-gray-600 hover:text-[#1A2753] transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl text-[#1A2753]">{selectedFolder.companyName}</h1>
                <p className="text-sm text-gray-500">Dossier #{selectedFolder.id}</p>
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Contacter le client
              </button>
            </div>

            {/* Onglets */}
            <div className="flex gap-2">
              <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-[#D6A93A] text-white rounded-lg">
                Documents
              </button>
              <button
                onClick={() => setView('monthly')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Données mensuelles
              </button>
              <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Historique
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar - Infos dossier */}
            <div className="space-y-4">
              {/* Statut */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-[#1A2753] mb-4">Statut du mois</h3>
                <div
                  className="p-4 rounded-xl text-center mb-4"
                  style={{
                    backgroundColor:
                      getMonthStatusColor(selectedFolder.currentMonth?.status || 'waiting_documents') + '20',
                  }}
                >
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{
                      color: getMonthStatusColor(selectedFolder.currentMonth?.status || 'waiting_documents'),
                    }}
                  >
                    {getMonthStatusLabel(selectedFolder.currentMonth?.status || 'waiting_documents')}
                  </p>
                  {selectedFolder.currentMonth?.deadline && (
                    <p className="text-sm text-gray-600">
                      Échéance:{' '}
                      {new Date(selectedFolder.currentMonth.deadline).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setShowValidateModal(true)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marquer comme validé
                  </button>
                  <button
                    onClick={() => setShowRequestMissingDocs(true)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-4 py-2 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Relancer le client
                  </button>
                </div>
              </div>

              {/* Infos client */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-[#1A2753] mb-4">Informations</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Forfait:</span>
                    <span className="text-[#1A2753] font-medium">
                      {ACCOUNTING_PACKS.find((p) => p.id === selectedFolder.pack)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Secteur:</span>
                    <span className="text-[#1A2753]">
                      {BUSINESS_SECTORS.find((s) => s.id === selectedFolder.sector)?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Régime:</span>
                    <span className="text-[#1A2753]">
                      {FISCAL_REGIMES.find((r) => r.id === selectedFolder.taxRegime)?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">Employés:</span>
                    <span className="text-[#1A2753]">{selectedFolder.employeeCount}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-2xl p-6 text-white">
                <h3 className="mb-4">Progression</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Documents reçus</span>
                      <span>
                        {selectedFolder.currentMonth?.documentsCount?.received || 0}/
                        {selectedFolder.currentMonth?.documentsCount?.total || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D6A93A] rounded-full"
                        style={{
                          width: `${
                            ((selectedFolder.currentMonth?.documentsCount?.received || 0) /
                              (selectedFolder.currentMonth?.documentsCount?.total || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Validés</span>
                      <span>{selectedFolder.currentMonth?.documentsCount?.validated || 0}</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full"
                        style={{
                          width: `${
                            ((selectedFolder.currentMonth?.documentsCount?.validated || 0) /
                              (selectedFolder.currentMonth?.documentsCount?.received || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des documents */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#1A2753]">Documents ({folderDocs.length})</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDocFilter('all')}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1 rounded-lg text-sm ${
                        docFilter === 'all'
                          ? 'bg-[#D6A93A] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setDocFilter('pending')}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1 rounded-lg text-sm ${
                        docFilter === 'pending'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      À traiter
                    </button>
                    <button
                      onClick={() => setDocFilter('validated')}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1 rounded-lg text-sm ${
                        docFilter === 'validated'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Validés
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {folderDocs.map((doc) => {
                    const currentStatus = documentStatuses[doc.id] || doc.status;
                    // Traiter 'received' et 'processing' comme 'pending'
                    const isPending = currentStatus === 'pending' || currentStatus === 'received' || currentStatus === 'processing';
                    const isValidated = currentStatus === 'validated' || currentStatus === 'integrated';
                    const isRejected = currentStatus === 'rejected';
                    
                    return (
                      <div
                        key={doc.id}
                        className="p-4 border-2 border-gray-100 rounded-xl hover:border-[#D6A93A] transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              isValidated
                                ? 'bg-green-100'
                                : isRejected
                                ? 'bg-red-100'
                                : 'bg-orange-100'
                            }`}
                          >
                            <FileText
                              className={`w-6 h-6 ${
                                isValidated
                                  ? 'text-green-600'
                                  : isRejected
                                  ? 'text-red-600'
                                  : 'text-orange-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#1A2753] font-medium truncate">{doc.name}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>{doc.type}</span>
                              <span>•</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</span>
                              <span>•</span>
                              <span
                                className={`font-medium ${
                                  isValidated
                                    ? 'text-green-600'
                                    : isRejected
                                    ? 'text-red-600'
                                    : 'text-orange-600'
                                }`}
                              >
                                {isValidated
                                  ? 'Validé'
                                  : isRejected
                                  ? 'Rejeté'
                                  : 'En attente'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPending && (
                              <>
                                <button aria-label="Valider"
                                  onClick={() => handleValidateDocument(doc)}
                                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                                  title="Valider"
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                </button>
                                <button aria-label="Rejeter"
                                  onClick={() => {
                                    setSelectedDoc(doc);
                                    setShowDocDetail(true);
                                  }}
                                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                                  title="Rejeter"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {isValidated && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-700 font-medium">Validé</span>
                              </div>
                            )}
                            {isRejected && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-600" />
                                <span className="text-sm text-red-700 font-medium">Rejeté</span>
                              </div>
                            )}
                            <button aria-label="Visualiser"
                              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                              title="Visualiser"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal relance client */}
        {showRequestMissingDocs && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A2753] text-lg">Relancer le client</h3>
                <button aria-label="Fermer"
                  onClick={() => setShowRequestMissingDocs(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-gray-600 hover:text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <textarea
                value={missingDocMessage}
                onChange={(e) => setMissingDocMessage(e.target.value)}
                placeholder="Message à envoyer au client..."
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] outline-none mb-4"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestMissingDocs(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    toast.success('Message envoyé', { description: missingDocMessage });
                    setShowRequestMissingDocs(false);
                    setMissingDocMessage('');
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830]"
                >
                  Envoyer
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal rejet document */}
        {showDocDetail && selectedDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A2753] text-lg">Rejeter le document</h3>
                <button aria-label="Fermer"
                  onClick={() => {
                    setShowDocDetail(false);
                    setSelectedDoc(null);
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-gray-600 hover:text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">Document : {selectedDoc.fileName}</p>
              <textarea
                placeholder="Raison du rejet..."
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] outline-none mb-4"
                rows={4}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDocDetail(false);
                    setSelectedDoc(null);
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleRejectDocument(selectedDoc, rejectionReason)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
                >
                  Rejeter
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal contact client */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A2753] text-lg">Contacter le client</h3>
                <button aria-label="Fermer"
                  onClick={() => setShowContactModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-gray-600 hover:text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Message à envoyer au client..."
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] outline-none mb-4"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    toast.success('Message envoyé', { description: contactMessage });
                    setShowContactModal(false);
                    setContactMessage('');
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830]"
                >
                  Envoyer
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal validation dossier */}
        {showValidateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A2753] text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Valider le dossier
                </h3>
                <button aria-label="Fermer"
                  onClick={() => setShowValidateModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-gray-600 hover:text-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir marquer ce dossier comme validé pour le mois en cours ?
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Entreprise :</strong> {selectedFolder?.companyName}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Documents validés :</strong> {selectedFolder?.currentMonth?.documentsCount?.validated || 0}/
                  {selectedFolder?.currentMonth?.documentsCount?.total || 0}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowValidateModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    toast.success('Dossier validé avec succès');
                    setShowValidateModal(false);
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Valider
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Vue mensuelle
  if (view === 'monthly' && selectedFolder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button aria-label="Retour"
                onClick={() => setView('detail')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-gray-600 hover:text-[#1A2753] transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl text-[#1A2753]">Données mensuelles</h1>
                <p className="text-sm text-gray-500">{selectedFolder.companyName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="bg-white rounded-2xl p-6">
            <h3 className="text-[#1A2753] mb-6">Saisie des données</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Chiffre d'affaires (FCFA)</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-2">Charges (FCFA)</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] outline-none"
                  />
                </div>
              </div>

              {selectedFolder.vatSubject && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">TVA collectée (FCFA)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">TVA déductible (FCFA)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 text-sm mb-2">Notes et observations</label>
                <textarea
                  rows={4}
                  placeholder="Ajouter des notes..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setView('detail')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    toast.success('Données enregistrées');
                    setView('detail');
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Enregistrer et envoyer au client
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};