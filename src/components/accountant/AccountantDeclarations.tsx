import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Calendar,
  Building2,
  Search,
  Filter,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Eye,
  X,
  Calculator,
  TrendingUp,
  Percent,
  DollarSign,
  Users,
  FileCheck,
  AlertCircle,
  CalendarDays,
  Send,
  CreditCard,
} from '../ui/icons';
import { toast } from 'sonner';
import { useConfirm } from '../ui/confirm-dialog';
import { nouvelId } from '../../lib/id';

interface Declaration {
  id: string;
  companyId: string;
  companyName: string;
  type: 'tva' | 'ir' | 'is' | 'css' | 'cfce' | 'acompte' | 'patente' | 'retenue_source';
  period: string;
  dueDate: string;
  status: 'a_preparer' | 'en_cours' | 'declare' | 'paye';
  estimatedAmount?: number;
  finalAmount?: number;
  createdDate: string;
  inProgressDate?: string;
  declaredDate?: string;
  paidDate?: string;
  notes?: string;
  depositProof?: string;
  paymentReceipt?: string;
}

const mockDeclarations: Declaration[] = [
  {
    id: 'decl-1',
    companyId: 'company-1',
    companyName: 'Tech Solutions SARL',
    type: 'tva',
    period: 'Novembre 2024',
    dueDate: '2024-12-15',
    status: 'a_preparer',
    estimatedAmount: 2450000,
    createdDate: '2024-12-01',
    notes: 'TVA collectée sur prestations de services',
  },
  {
    id: 'decl-2',
    companyId: 'company-2',
    companyName: 'Commerce Plus SA',
    type: 'tva',
    period: 'Novembre 2024',
    dueDate: '2024-12-15',
    status: 'declare',
    estimatedAmount: 5780000,
    finalAmount: 5780000,
    createdDate: '2024-11-28',
    inProgressDate: '2024-12-03',
    declaredDate: '2024-12-07',
    depositProof: 'preuve_depot_tva_nov_2024.pdf',
  },
  {
    id: 'decl-3',
    companyId: 'company-1',
    companyName: 'Tech Solutions SARL',
    type: 'ir',
    period: 'Novembre 2024',
    dueDate: '2024-12-10',
    status: 'paye',
    estimatedAmount: 1250000,
    finalAmount: 1250000,
    createdDate: '2024-11-25',
    inProgressDate: '2024-12-01',
    declaredDate: '2024-12-03',
    paidDate: '2024-12-05',
    depositProof: 'preuve_depot_ir_nov_2024.pdf',
    paymentReceipt: 'recu_paiement_ir_nov_2024.pdf',
  },
  {
    id: 'decl-4',
    companyId: 'company-3',
    companyName: 'Services Conseils SUARL',
    type: 'css',
    period: 'T3 2024',
    dueDate: '2024-10-15',
    status: 'a_preparer',
    estimatedAmount: 3200000,
    createdDate: '2024-10-01',
  },
  {
    id: 'decl-5',
    companyId: 'company-1',
    companyName: 'Tech Solutions SARL',
    type: 'is',
    period: 'Exercice 2024',
    dueDate: '2025-04-30',
    status: 'en_cours',
    estimatedAmount: 15000000,
    createdDate: '2024-12-08',
    inProgressDate: '2024-12-10',
  },
  {
    id: 'decl-6',
    companyId: 'company-1',
    companyName: 'Tech Solutions SARL',
    type: 'patente',
    period: '2025',
    dueDate: '2025-06-30',
    status: 'a_preparer',
    estimatedAmount: 850000,
    createdDate: '2024-12-01',
  },
  {
    id: 'decl-7',
    companyId: 'company-2',
    companyName: 'Commerce Plus SA',
    type: 'retenue_source',
    period: 'Novembre 2024',
    dueDate: '2024-12-10',
    status: 'declare',
    estimatedAmount: 450000,
    finalAmount: 450000,
    createdDate: '2024-11-28',
    inProgressDate: '2024-12-02',
    declaredDate: '2024-12-05',
    depositProof: 'preuve_depot_retenue_nov_2024.pdf',
  },
  {
    id: 'decl-8',
    companyId: 'company-2',
    companyName: 'Commerce Plus SA',
    type: 'ir',
    period: 'Décembre 2024',
    dueDate: '2024-12-31',
    status: 'en_cours',
    estimatedAmount: 3200000,
    createdDate: '2024-12-05',
    inProgressDate: '2024-12-09',
    notes: 'Retenues sur salaires + charges sociales',
  },
  {
    id: 'decl-9',
    companyId: 'company-3',
    companyName: 'Services Conseils SUARL',
    type: 'tva',
    period: 'Octobre 2024',
    dueDate: '2024-11-15',
    status: 'paye',
    estimatedAmount: 1890000,
    finalAmount: 1890000,
    createdDate: '2024-10-28',
    inProgressDate: '2024-11-02',
    declaredDate: '2024-11-08',
    paidDate: '2024-11-12',
    depositProof: 'preuve_depot_tva_oct_2024.pdf',
    paymentReceipt: 'recu_paiement_tva_oct_2024.pdf',
  },
  {
    id: 'decl-10',
    companyId: 'company-4',
    companyName: 'Import Export SARL',
    type: 'cfce',
    period: 'T4 2024',
    dueDate: '2025-01-31',
    status: 'a_preparer',
    estimatedAmount: 4500000,
    createdDate: '2024-12-10',
    notes: 'Contribution forfaitaire sur les entreprises',
  },
  {
    id: 'decl-11',
    companyId: 'company-4',
    companyName: 'Import Export SARL',
    type: 'tva',
    period: 'Décembre 2024',
    dueDate: '2025-01-15',
    status: 'a_preparer',
    estimatedAmount: 8900000,
    createdDate: '2024-12-08',
  },
  {
    id: 'decl-12',
    companyId: 'company-1',
    companyName: 'Tech Solutions SARL',
    type: 'acompte',
    period: 'Acompte 1/4 - 2025',
    dueDate: '2025-02-28',
    status: 'a_preparer',
    estimatedAmount: 3750000,
    createdDate: '2024-12-01',
    notes: 'Premier acompte provisionnel IS 2025',
  },
  {
    id: 'decl-13',
    companyId: 'company-3',
    companyName: 'Services Conseils SUARL',
    type: 'ir',
    period: 'Octobre 2024',
    dueDate: '2024-11-10',
    status: 'paye',
    estimatedAmount: 2100000,
    finalAmount: 2100000,
    createdDate: '2024-10-25',
    inProgressDate: '2024-10-30',
    declaredDate: '2024-11-04',
    paidDate: '2024-11-08',
    depositProof: 'preuve_depot_ir_oct_2024.pdf',
    paymentReceipt: 'recu_paiement_ir_oct_2024.pdf',
  },
  {
    id: 'decl-14',
    companyId: 'company-5',
    companyName: 'BTP Construction SA',
    type: 'retenue_source',
    period: 'Novembre 2024',
    dueDate: '2024-12-15',
    status: 'declare',
    estimatedAmount: 1250000,
    finalAmount: 1320000,
    createdDate: '2024-11-28',
    inProgressDate: '2024-12-02',
    declaredDate: '2024-12-08',
    depositProof: 'preuve_depot_retenue_btp_nov_2024.pdf',
    notes: 'Retenues à la source sur prestataires',
  },
  {
    id: 'decl-15',
    companyId: 'company-5',
    companyName: 'BTP Construction SA',
    type: 'tva',
    period: 'Novembre 2024',
    dueDate: '2024-12-15',
    status: 'en_cours',
    estimatedAmount: 12500000,
    createdDate: '2024-12-01',
    inProgressDate: '2024-12-06',
  },
  {
    id: 'decl-16',
    companyId: 'company-2',
    companyName: 'Commerce Plus SA',
    type: 'css',
    period: 'T4 2024',
    dueDate: '2025-01-15',
    status: 'a_preparer',
    estimatedAmount: 4200000,
    createdDate: '2024-12-05',
    notes: 'Cotisations sociales trimestrielles',
  },
  {
    id: 'decl-17',
    companyId: 'company-4',
    companyName: 'Import Export SARL',
    type: 'is',
    period: 'Exercice 2024',
    dueDate: '2025-04-30',
    status: 'a_preparer',
    estimatedAmount: 22000000,
    createdDate: '2024-12-01',
    notes: 'Impôt sur les sociétés - Clôture 31/12/2024',
  },
  {
    id: 'decl-18',
    companyId: 'company-5',
    companyName: 'BTP Construction SA',
    type: 'patente',
    period: '2024',
    dueDate: '2024-12-31',
    status: 'declare',
    estimatedAmount: 1500000,
    finalAmount: 1500000,
    createdDate: '2024-11-15',
    inProgressDate: '2024-11-20',
    declaredDate: '2024-12-05',
    depositProof: 'preuve_depot_patente_btp_2024.pdf',
  },
  {
    id: 'decl-19',
    companyId: 'company-3',
    companyName: 'Services Conseils SUARL',
    type: 'tva',
    period: 'Décembre 2024',
    dueDate: '2025-01-15',
    status: 'a_preparer',
    estimatedAmount: 1950000,
    createdDate: '2024-12-08',
  },
  {
    id: 'decl-20',
    companyId: 'company-1',
    companyName: 'Tech Solutions SARL',
    type: 'tva',
    period: 'Octobre 2024',
    dueDate: '2024-11-15',
    status: 'paye',
    estimatedAmount: 2100000,
    finalAmount: 2100000,
    createdDate: '2024-10-28',
    inProgressDate: '2024-11-01',
    declaredDate: '2024-11-06',
    paidDate: '2024-11-10',
    depositProof: 'preuve_depot_tva_tech_oct_2024.pdf',
    paymentReceipt: 'recu_paiement_tva_tech_oct_2024.pdf',
  },
];

export const AccountantDeclarations: React.FC = () => {
  const [declarations, setDeclarations] = useState<Declaration[]>(mockDeclarations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('tous');
  const [selectedStatus, setSelectedStatus] = useState<string>('tous');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const declarationTypes = [
    { value: 'tous', label: 'Tous les types', icon: FileText },
    { value: 'tva', label: 'TVA', icon: Percent },
    { value: 'ir', label: 'IR (Salaires)', icon: Users },
    { value: 'is', label: 'IS (Impôt sociétés)', icon: Building2 },
    { value: 'css', label: 'CSS', icon: FileCheck },
    { value: 'cfce', label: 'CFCE', icon: TrendingUp },
    { value: 'acompte', label: 'Acompte IS', icon: DollarSign },
    { value: 'patente', label: 'Patente', icon: FileCheck },
    { value: 'retenue_source', label: 'Retenue source', icon: FileCheck },
  ];

  const declarationStatuses = [
    { value: 'tous', label: 'Tous les statuts' },
    { value: 'a_preparer', label: 'À préparer' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'declare', label: 'Déclarée' },
    { value: 'paye', label: 'Payée' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'a_preparer':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'en_cours':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'declare':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'paye':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'a_preparer':
        return <Clock className="w-4 h-4" />;
      case 'en_cours':
        return <Upload className="w-4 h-4" />;
      case 'declare':
        return <Send className="w-4 h-4" />;
      case 'paye':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'a_preparer':
        return 'À préparer';
      case 'en_cours':
        return 'En cours';
      case 'declare':
        return 'Déclarée';
      case 'paye':
        return 'Payée';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    const found = declarationTypes.find((t) => t.value === type);
    return found ? found.label : type.toUpperCase();
  };

  const getTypeIcon = (type: string) => {
    const found = declarationTypes.find((t) => t.value === type);
    const IconComponent = found?.icon || FileText;
    return <IconComponent className="w-5 h-5" />;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredDeclarations = declarations.filter((decl) => {
    const matchesSearch =
      decl.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decl.period.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'tous' || decl.type === selectedType;
    const matchesStatus = selectedStatus === 'tous' || decl.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: declarations.length,
    aTraiter: declarations.filter((d) => d.status === 'a_preparer').length,
    uploadee: declarations.filter((d) => d.status === 'en_cours').length,
    aVenir: declarations.filter((d) => {
      const daysUntil = getDaysUntilDue(d.dueDate);
      return daysUntil <= 7 && daysUntil > 0 && d.status !== 'paye';
    }).length,
    enRetard: declarations.filter((d) => {
      const daysUntil = getDaysUntilDue(d.dueDate);
      return daysUntil < 0 && d.status !== 'paye';
    }).length,
  };

  // Déclarations urgentes (échéance < 7 jours)
  const urgentDeclarations = declarations.filter((d) => {
    const daysUntil = getDaysUntilDue(d.dueDate);
    return daysUntil <= 7 && daysUntil > 0 && d.status !== 'paye';
  });

  const formatAmount = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleViewDeclaration = (decl: Declaration) => {
    setSelectedDeclaration(decl);
    setShowDetailModal(true);
  };

  const handleUploadClick = (decl: Declaration) => {
    setSelectedDeclaration(decl);
    setShowUploadModal(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#1A2753] mb-2">Déclarations fiscales</h1>
          <p className="text-[#273A7A]/80">
            Suivi des échéances fiscales de vos clients
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-gradient-to-r from-[#D6A93A] to-[#C09830] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle échéance
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-[#F5F6FA]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#273A7A]/80 text-sm">Total</p>
              <p className="text-2xl text-[#1A2753] mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-[#F5F6FA] rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#1A2753]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-orange-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#273A7A]/80 text-sm">À préparer</p>
              <p className="text-2xl text-orange-600 mt-1">{stats.aTraiter}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-blue-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#273A7A]/80 text-sm">En cours</p>
              <p className="text-2xl text-blue-600 mt-1">{stats.uploadee}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 border border-purple-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#273A7A]/80 text-sm">À venir (7j)</p>
              <p className="text-2xl text-purple-600 mt-1">{stats.aVenir}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 border border-red-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#273A7A]/80 text-sm">En retard</p>
              <p className="text-2xl text-red-600 mt-1">{stats.enRetard}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Urgent Declarations Alert */}
      {urgentDeclarations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-5 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#1A2753] mb-2">
                Échéances urgentes ({urgentDeclarations.length})
              </h3>
              <div className="space-y-2">
                {urgentDeclarations.map((decl) => {
                  const daysUntil = getDaysUntilDue(decl.dueDate);
                  return (
                    <div
                      key={decl.id}
                      className="bg-white rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getTypeIcon(decl.type)}</div>
                        <div>
                          <p className="text-[#1A2753]">
                            {getTypeLabel(decl.type)} - {decl.companyName}
                          </p>
                          <p className="text-sm text-[#273A7A]/80">
                            Période : {decl.period}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-red-600">
                            {daysUntil === 0
                              ? "Aujourd'hui"
                              : daysUntil === 1
                              ? 'Demain'
                              : `Dans ${daysUntil} jours`}
                          </p>
                          <p className="text-xs text-[#273A7A]/80">
                            {formatDate(decl.dueDate)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewDeclaration(decl)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-[#D6A93A] text-white rounded-lg hover:bg-[#C09830] transition-colors"
                        >
                          Traiter
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reminder Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 text-sm">
              <span className="font-medium">Rappel :</span> Utilisez votre logiciel comptable pour générer les déclarations. 
              Cette interface sert uniquement au suivi des échéances et à la mise à disposition des documents pour vos clients.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 mb-6 border border-[#F5F6FA]">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#273A7A]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une entreprise ou période..."
              className="w-full pl-10 pr-4 py-2.5 border border-[#F5F6FA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A93A] focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 border border-[#F5F6FA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A93A] bg-white"
          >
            {declarationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-[#F5F6FA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A93A] bg-white"
          >
            {declarationStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Declarations List */}
      <div className="bg-white rounded-xl border border-[#F5F6FA] divide-y divide-[#F5F6FA]">
        {filteredDeclarations.length > 0 ? (
          filteredDeclarations.map((decl) => {
            const daysUntil = getDaysUntilDue(decl.dueDate);
            const isUrgent = daysUntil <= 7 && daysUntil > 0;
            const isOverdue = daysUntil < 0 && decl.status !== 'paye';

            return (
              <div
                key={decl.id}
                className={`p-4 hover:bg-[#F5F6FA]/50 transition-colors group ${
                  isUrgent ? 'bg-orange-50/30' : ''
                } ${isOverdue ? 'bg-red-50/30' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Type Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#F5F6FA] rounded-lg flex items-center justify-center">
                      {getTypeIcon(decl.type)}
                    </div>
                  </div>

                  {/* Declaration Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[#1A2753]">
                            {getTypeLabel(decl.type)} - {decl.period}
                          </p>
                          {isUrgent && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                              Urgent
                            </span>
                          )}
                          {isOverdue && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                              En retard
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#273A7A]/80">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {decl.companyName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Échéance : {formatDate(decl.dueDate)}
                          </span>
                          {decl.estimatedAmount && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5" />
                                {formatAmount(decl.estimatedAmount)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${getStatusColor(
                          decl.status
                        )}`}
                      >
                        {getStatusIcon(decl.status)}
                        {getStatusLabel(decl.status)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button aria-label="Voir détails"
                      onClick={() => handleViewDeclaration(decl)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-white rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="w-5 h-5 text-[#273A7A]" />
                    </button>
                    {decl.status === 'a_preparer' && (
                      <button aria-label="Uploader la déclaration"
                        onClick={() => handleUploadClick(decl)}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Uploader la déclaration"
                      >
                        <Upload className="w-5 h-5 text-blue-600" />
                      </button>
                    )}
                    {decl.depositProof && (
                      <button aria-label="Télécharger"
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-green-50 rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-5 h-5 text-green-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-[#273A7A]/20 mx-auto mb-4" />
            <h3 className="text-[#1A2753] mb-2">Aucune déclaration trouvée</h3>
            <p className="text-[#273A7A]/80">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* Create Declaration Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateDeclarationModal
            onClose={() => setShowCreateModal(false)}
            onSave={(newDecl) => {
              setDeclarations([...declarations, newDecl]);
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && selectedDeclaration && (
          <UploadDeclarationModal
            declaration={selectedDeclaration}
            onClose={() => {
              setShowUploadModal(false);
              setSelectedDeclaration(null);
            }}
            onUpload={(id, file) => {
              setDeclarations(
                declarations.map((d) =>
                  d.id === id
                    ? {
                        ...d,
                        status: 'en_cours',
                        inProgressDate: new Date().toISOString().split('T')[0],
                        depositProof: file,
                      }
                    : d
                )
              );
              setShowUploadModal(false);
              setSelectedDeclaration(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedDeclaration && (
          <DeclarationDetailModal
            declaration={selectedDeclaration}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedDeclaration(null);
            }}
            onUpdateStatus={(id, newStatus, additionalData) => {
              setDeclarations(
                declarations.map((d) =>
                  d.id === id ? { ...d, status: newStatus, ...additionalData } : d
                )
              );
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Create Declaration Modal
interface CreateDeclarationModalProps {
  onClose: () => void;
  onSave: (declaration: Declaration) => void;
}

const CreateDeclarationModal: React.FC<CreateDeclarationModalProps> = ({
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    companyId: '',
    companyName: '',
    type: 'tva' as Declaration['type'],
    period: '',
    dueDate: '',
    amount: '',
  });

  const companies = [
    { id: 'company-1', name: 'Tech Solutions SARL' },
    { id: 'company-2', name: 'Commerce Plus SA' },
    { id: 'company-3', name: 'Services Conseils SUARL' },
    { id: 'company-4', name: 'Import Export SARL' },
    { id: 'company-5', name: 'BTP Construction SA' },
  ];

  const handleSubmit = () => {
    const newDeclaration: Declaration = {
      id: nouvelId('decl'),
      companyId: formData.companyId,
      companyName: formData.companyName,
      type: formData.type,
      period: formData.period,
      dueDate: formData.dueDate,
      status: 'a_preparer',
      estimatedAmount: formData.amount ? parseFloat(formData.amount) : undefined,
      createdDate: new Date().toISOString().split('T')[0],
    };
    onSave(newDeclaration);
  };

  const isValid =
    formData.companyId && formData.type && formData.period && formData.dueDate;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[#1A2753] mb-1">Nouvelle échéance fiscale</h3>
            <p className="text-[#273A7A]/80 text-sm">Créez un rappel pour une obligation fiscale</p>
          </div>
          <button aria-label="Fermer"
            onClick={onClose}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F6FA] transition-colors"
          >
            <X className="w-5 h-5 text-[#273A7A]" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Company */}
          <div>
            <label className="block text-[#1A2753] text-sm mb-2">
              Entreprise *
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => {
                const company = companies.find((c) => c.id === e.target.value);
                setFormData({
                  ...formData,
                  companyId: e.target.value,
                  companyName: company?.name || '',
                });
              }}
              className="w-full px-4 py-3 border border-[#F5F6FA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A93A]"
            >
              <option value="">Sélectionner une entreprise</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[#1A2753] text-sm mb-2">
              Type de déclaration *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as Declaration['type'],
                })
              }
              className="w-full px-4 py-3 border border-[#F5F6FA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A93A]"
            >
              <option value="tva">TVA</option>
              <option value="ir">IR (Salaires)</option>
              <option value="is">IS (Impôt sur les sociétés)</option>
              <option value="css">CSS (Cotisations sociales)</option>
              <option value="cfce">CFCE</option>
              <option value="acompte">Acompte IS</option>
              <option value="patente">Patente</option>
              <option value="retenue_source">Retenue source</option>
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="block text-[#1A2753] text-sm mb-2">
              Période *
            </label>
            <input
              type="text"
              value={formData.period}
              onChange={(e) =>
                setFormData({ ...formData, period: e.target.value })
              }
              placeholder="Ex: Novembre 2024, T4 2024"
              className="w-full px-4 py-3 border border-[#F5F6FA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A93A]"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-[#1A2753] text-sm mb-2">
              Date d'échéance *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full px-4 py-3 border border-[#F5F6FA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A93A]"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[#1A2753] text-sm mb-2">
              Montant estimé (optionnel)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0"
                className="w-full px-4 py-3 border border-[#F5F6FA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A93A]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#273A7A]/80">
                FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 border border-[#F5F6FA] text-[#1A2753] rounded-lg hover:bg-[#F5F6FA] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gradient-to-r from-[#D6A93A] to-[#C09830] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Créer l'échéance
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Upload Declaration Modal
interface UploadDeclarationModalProps {
  declaration: Declaration;
  onClose: () => void;
  onUpload: (id: string, fileName: string) => void;
}

const UploadDeclarationModal: React.FC<UploadDeclarationModalProps> = ({
  declaration,
  onClose,
  onUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  const handleUpload = () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }
    toast.success(`Déclaration "${file.name}" uploadée avec succès`, {
      description: 'Le client peut maintenant la consulter.',
    });
    onUpload(declaration.id, file.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[#1A2753] mb-1">Upload déclaration</h3>
            <p className="text-[#273A7A]/80 text-sm">
              {declaration.type.toUpperCase()} - {declaration.companyName}
            </p>
          </div>
          <button aria-label="Fermer"
            onClick={onClose}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F6FA] transition-colors"
          >
            <X className="w-5 h-5 text-[#273A7A]" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[#273A7A]/80 text-sm mb-2">Fichier de déclaration</label>
            <input
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#D6A93A] file:text-white file:cursor-pointer hover:file:bg-[#C09830]"
            />
            {file && (
              <p className="text-sm text-green-600 mt-2">{file.name}</p>
            )}
          </div>

          <div>
            <label className="block text-[#273A7A]/80 text-sm mb-2">Note pour le client (optionnel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Déclaration TVA novembre 2024 déposée..."
              className="w-full h-24 p-4 bg-[#F5F6FA] rounded-xl text-[#1A2753] resize-none outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 text-[#273A7A] hover:bg-[#F5F6FA] rounded-xl transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all"
          >
            Uploader
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Declaration Detail Modal
interface DeclarationDetailModalProps {
  declaration: Declaration;
  onClose: () => void;
  onUpdateStatus: (
    id: string,
    status: Declaration['status'],
    additionalData?: Partial<Declaration>
  ) => void;
}

const DeclarationDetailModal: React.FC<DeclarationDetailModalProps> = ({
  declaration,
  onClose,
  onUpdateStatus,
}) => {
  const confirm = useConfirm();
  const [showUploadProof, setShowUploadProof] = useState(false);
  const [showUploadReceipt, setShowUploadReceipt] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [finalAmount, setFinalAmount] = useState(declaration.finalAmount?.toString() || '');

  const formatAmount = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleUploadProof = () => {
    if (!proofFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }
    onUpdateStatus(declaration.id, 'declare', {
      declaredDate: new Date().toISOString().split('T')[0],
      depositProof: proofFile.name,
      finalAmount: finalAmount ? parseFloat(finalAmount) : declaration.estimatedAmount,
    });
    toast.success(`Preuve de dépôt "${proofFile.name}" uploadée`, {
      description: 'Le client est notifié.',
    });
    setShowUploadProof(false);
    onClose();
  };

  const handleUploadReceipt = () => {
    if (!receiptFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }
    onUpdateStatus(declaration.id, 'paye', {
      paidDate: new Date().toISOString().split('T')[0],
      paymentReceipt: receiptFile.name,
    });
    toast.success(`Reçu de paiement "${receiptFile.name}" uploadé`, {
      description: 'Le client est notifié.',
    });
    setShowUploadReceipt(false);
    onClose();
  };

  const handleMarkAsInProgress = async () => {
    if (
      await confirm({
        title: 'Marquer cette déclaration comme en cours de préparation ?',
        confirmLabel: 'Marquer en cours',
      })
    ) {
      onUpdateStatus(declaration.id, 'en_cours', {
        inProgressDate: new Date().toISOString().split('T')[0],
      });
      toast.success('Statut mis à jour : En cours', {
        description: 'Le client est notifié.',
      });
      onClose();
    }
  };

  const handleMarkAsDeclared = async () => {
    if (
      await confirm({
        title: 'Marquer cette déclaration comme déposée (sans preuve) ?',
        confirmLabel: 'Marquer déposée',
      })
    ) {
      onUpdateStatus(declaration.id, 'declare', {
        declaredDate: new Date().toISOString().split('T')[0],
        finalAmount: finalAmount ? parseFloat(finalAmount) : declaration.estimatedAmount,
      });
      toast.success('Statut mis à jour : Déclarée', {
        description: 'Pensez à uploader la preuve plus tard.',
      });
      onClose();
    }
  };

  const handleMarkAsPaid = async () => {
    if (
      await confirm({
        title: 'Marquer cette déclaration comme payée (sans reçu) ?',
        confirmLabel: 'Marquer payée',
      })
    ) {
      onUpdateStatus(declaration.id, 'paye', {
        paidDate: new Date().toISOString().split('T')[0],
      });
      toast.success('Statut mis à jour : Payée', {
        description: 'Pensez à uploader le reçu plus tard.',
      });
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-[#1A2753] mb-1">Détails de l'échéance fiscale</h3>
            <p className="text-[#273A7A]/80">{declaration.id}</p>
          </div>
          <button aria-label="Fermer"
            onClick={onClose}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F6FA] transition-colors"
          >
            <X className="w-5 h-5 text-[#273A7A]" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#F5F6FA] rounded-xl p-4">
            <p className="text-sm text-[#273A7A]/80 mb-1">Entreprise</p>
            <p className="text-[#1A2753]">{declaration.companyName}</p>
          </div>
          <div className="bg-[#F5F6FA] rounded-xl p-4">
            <p className="text-sm text-[#273A7A]/80 mb-1">Type</p>
            <p className="text-[#1A2753]">
              {declaration.type.toUpperCase()}
            </p>
          </div>
          <div className="bg-[#F5F6FA] rounded-xl p-4">
            <p className="text-sm text-[#273A7A]/80 mb-1">Période</p>
            <p className="text-[#1A2753]">{declaration.period}</p>
          </div>
          <div className="bg-[#F5F6FA] rounded-xl p-4">
            <p className="text-sm text-[#273A7A]/80 mb-1">Échéance</p>
            <p className="text-[#1A2753]">{formatDate(declaration.dueDate)}</p>
          </div>
          {declaration.estimatedAmount && (
            <div className="bg-[#F5F6FA] rounded-xl p-4">
              <p className="text-sm text-[#273A7A]/80 mb-1">Montant estimé</p>
              <p className="text-[#1A2753]">
                {formatAmount(declaration.estimatedAmount)}
              </p>
            </div>
          )}
          {declaration.finalAmount && (
            <div className="bg-[#F5F6FA] rounded-xl p-4">
              <p className="text-sm text-[#273A7A]/80 mb-1">Montant final</p>
              <p className="text-[#1A2753]">
                {formatAmount(declaration.finalAmount)}
              </p>
            </div>
          )}
          <div className="bg-[#F5F6FA] rounded-xl p-4">
            <p className="text-sm text-[#273A7A]/80 mb-1">Statut</p>
            <p className="text-[#1A2753]">{getStatusLabel(declaration.status)}</p>
          </div>
        </div>

        {/* Timeline */}
        {(declaration.inProgressDate || declaration.declaredDate || declaration.paidDate) && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#273A7A]/80 mb-3">Historique</p>
            <div className="space-y-2 text-sm">
              {declaration.inProgressDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="text-[#1A2753]">
                    Déclaration uploadée le {formatDate(declaration.inProgressDate)}
                  </span>
                </div>
              )}
              {declaration.declaredDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span className="text-[#1A2753]">
                    Déposée le {formatDate(declaration.declaredDate)}
                  </span>
                </div>
              )}
              {declaration.paidDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-[#1A2753]">
                    Payée le {formatDate(declaration.paidDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {declaration.notes && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#273A7A]/80 mb-2">Notes</p>
            <p className="text-[#1A2753]">{declaration.notes}</p>
          </div>
        )}

        {/* Documents section */}
        {(declaration.depositProof || declaration.paymentReceipt) && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#273A7A]/80 mb-3">Documents uploadés</p>
            <div className="space-y-2">
              {declaration.depositProof && (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-[#1A2753] text-sm">Preuve de dépôt</p>
                      <p className="text-[#273A7A]/80 text-xs">{declaration.depositProof}</p>
                    </div>
                  </div>
                  <button aria-label="Télécharger la preuve de dépôt" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
              {declaration.paymentReceipt && (
                <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-[#1A2753] text-sm">Reçu de paiement</p>
                      <p className="text-[#273A7A]/80 text-xs">{declaration.paymentReceipt}</p>
                    </div>
                  </div>
                  <button aria-label="Télécharger le reçu de paiement" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Proof Modal */}
        {showUploadProof && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowUploadProof(false)}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-[#1A2753] mb-4">Upload preuve de dépôt</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#273A7A]/80 text-sm mb-2">Montant définitif (FCFA)</label>
                  <input
                    type="number"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(e.target.value)}
                    placeholder={declaration.estimatedAmount?.toString()}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                  />
                </div>
                <div>
                  <label className="block text-[#273A7A]/80 text-sm mb-2">Fichier de preuve</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#D6A93A] file:text-white file:cursor-pointer hover:file:bg-[#C09830]"
                  />
                  {proofFile && (
                    <p className="text-sm text-green-600 mt-2">{proofFile.name}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUploadProof(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 text-[#273A7A] hover:bg-[#F5F6FA] rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUploadProof}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                >
                  Uploader
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Receipt Modal */}
        {showUploadReceipt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowUploadReceipt(false)}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-[#1A2753] mb-4">Upload reçu de paiement</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#273A7A]/80 text-sm mb-2">Fichier de reçu</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#D6A93A] file:text-white file:cursor-pointer hover:file:bg-[#C09830]"
                  />
                  {receiptFile && (
                    <p className="text-sm text-green-600 mt-2">{receiptFile.name}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUploadReceipt(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 text-[#273A7A] hover:bg-[#F5F6FA] rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUploadReceipt}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                >
                  Uploader
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Primary actions based on status */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 border border-[#F5F6FA] text-[#1A2753] rounded-lg hover:bg-[#F5F6FA] transition-colors"
            >
              Fermer
            </button>
            {declaration.status === 'a_preparer' && (
              <button
                onClick={handleMarkAsInProgress}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Marquer comme en cours
              </button>
            )}
            {declaration.status === 'en_cours' && (
              <>
                <button
                  onClick={handleMarkAsDeclared}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Marquer comme déposée
                </button>
                <button
                  onClick={() => setShowUploadProof(true)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gradient-to-r from-[#D6A93A] to-[#C09830] text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload preuve de dépôt
                </button>
              </>
            )}
            {declaration.status === 'declare' && (
              <>
                <button
                  onClick={handleMarkAsPaid}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Marquer comme payée
                </button>
                {!declaration.paymentReceipt && (
                  <button
                    onClick={() => setShowUploadReceipt(true)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gradient-to-r from-[#D6A93A] to-[#C09830] text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload reçu de paiement
                  </button>
                )}
              </>
            )}
          </div>

          {/* Secondary actions - Upload missing documents */}
          {((declaration.status === 'declare' || declaration.status === 'paye') && !declaration.depositProof) && (
            <button
              onClick={() => setShowUploadProof(true)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 border border-purple-200"
            >
              <Upload className="w-4 h-4" />
              Ajouter preuve de dépôt manquante
            </button>
          )}
          {declaration.status === 'paye' && !declaration.paymentReceipt && (
            <button
              onClick={() => setShowUploadReceipt(true)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2 border border-green-200"
            >
              <Upload className="w-4 h-4" />
              Ajouter reçu de paiement manquant
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

function getStatusLabel(status: string): string {
  switch (status) {
    case 'a_preparer':
      return 'À préparer';
    case 'en_cours':
      return 'En cours';
    case 'declare':
      return 'Déclarée';
    case 'paye':
      return 'Payée';
    default:
      return status;
  }
}