import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Building,
  CheckCircle,
  Download,
  Edit,
  MapPin,
  Palette,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  ChevronRight,
  Package,
  Shield,
  TrendingUp,
  Settings,
  History,
  Star,
  Eye,
  X,
  Info,
  Calculator,
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import type { Company } from '../../types';
import { formatFCFACompact } from '../../lib/format';
import { getCompanyStatusLabel, getCompanyStatusColor } from '../../domain/companyStatus';

interface WebMyCompaniesImprovedProps {
  onBack: () => void;
  onNavigate: (page: string, companyId?: string) => void;
}

const serviceCards = [
  {
    id: 'bank-account',
    title: 'Compte bancaire',
    description: 'Ouvrir un compte pro',
    icon: DollarSign,
    color: 'from-emerald-600 to-emerald-700',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    screen: 'bank-account',
  },
  {
    id: 'accounting',
    title: 'Comptabilité',
    description: 'Gestion comptable & fiscale',
    icon: Calculator,
    color: 'from-[#D6A93A] to-[#C09830]',
    bgColor: 'bg-[#D6A93A]/10',
    iconColor: 'text-[#D6A93A]',
    screen: 'accounting',
  },
  {
    id: 'modification',
    title: 'Modification',
    description: 'Capital, siège, gérant...',
    icon: Edit,
    color: 'from-blue-600 to-blue-700',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    screen: 'modification',
  },
  {
    id: 'domiciliation',
    title: 'Domiciliation',
    description: 'Domicilier à Dakar',
    icon: MapPin,
    color: 'from-purple-600 to-purple-700',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    screen: 'domiciliation',
  },
  {
    id: 'branding',
    title: 'Branding',
    description: 'Logo, site web...',
    icon: Palette,
    color: 'from-pink-600 to-pink-700',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
    screen: 'branding',
  },
];

export const WebMyCompaniesImproved: React.FC<WebMyCompaniesImprovedProps> = ({
  onBack,
  onNavigate,
}) => {
  const { companies, currentUser } = useApp();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Guard
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D6A93A] mx-auto mb-4"></div>
          <p className="text-[#273A7A]">Chargement...</p>
        </div>
      </div>
    );
  }

  const userCompanies = companies.filter(
    (c) => c.userId === currentUser?.id || c.clientId === currentUser?.id
  );

  const filteredCompanies = userCompanies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && company.status === 'completed') ||
      (filterStatus === 'pending' && company.status !== 'completed');
    return matchesSearch && matchesStatus;
  });

  const completedCompanies = filteredCompanies.filter((c) => c.status === 'completed');
  const pendingCompanies = filteredCompanies.filter((c) => c.status !== 'completed');

  const getCompanyTypeLabel = (legalForm: string) => {
    const labels: Record<string, string> = {
      SARL: 'SARL',
      SUARL: 'SUARL',
      SA: 'SA',
      SAS: 'SAS',
      SNC: 'SNC',
      SCI: 'SCI',
    };
    return labels[legalForm] || legalForm;
  };

  const getCompanyTypeColor = (legalForm: string) => {
    const colors: Record<string, string> = {
      SARL: 'bg-blue-100 text-blue-700',
      SUARL: 'bg-green-100 text-green-700',
      SA: 'bg-purple-100 text-purple-700',
      SAS: 'bg-orange-100 text-orange-700',
      SNC: 'bg-pink-100 text-pink-700',
      SCI: 'bg-indigo-100 text-indigo-700',
    };
    return colors[legalForm] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = getCompanyStatusLabel;
  const getStatusColor = getCompanyStatusColor;

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button aria-label="Retour"
                onClick={onBack}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-gray-600 hover:text-[#1A2753] transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl text-[#1A2753]">Mes Sociétés</h1>
                <p className="text-sm text-gray-500">{userCompanies.length} sociétés</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('create')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouvelle société
            </button>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                placeholder="Rechercher une société..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button aria-label="Affichage en grille"
                onClick={() => setViewMode('grid')}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-3 rounded-xl border-2 transition-all ${
                  viewMode === 'grid'
                    ? 'border-[#D6A93A] bg-[#D6A93A]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button aria-label="Affichage en liste"
                onClick={() => setViewMode('list')}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-3 rounded-xl border-2 transition-all ${
                  viewMode === 'list'
                    ? 'border-[#D6A93A] bg-[#D6A93A]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats et filtres */}
          <div className="flex gap-3">
            <button
              onClick={() => setFilterStatus('all')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 rounded-xl border-2 transition-all ${
                filterStatus === 'all'
                  ? 'border-[#D6A93A] bg-[#D6A93A]/5 text-[#D6A93A]'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="text-center">
                <p className="text-2xl font-bold">{userCompanies.length}</p>
                <p className="text-xs">Toutes</p>
              </div>
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 rounded-xl border-2 transition-all ${
                filterStatus === 'completed'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="text-center">
                <p className="text-2xl font-bold">{completedCompanies.length}</p>
                <p className="text-xs">Actives</p>
              </div>
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 rounded-xl border-2 transition-all ${
                filterStatus === 'pending'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="text-center">
                <p className="text-2xl font-bold">{pendingCompanies.length}</p>
                <p className="text-xs">En cours</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des sociétés */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Building className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-6">
              {searchQuery
                ? 'Aucune société trouvée'
                : userCompanies.length === 0
                ? "Vous n'avez pas encore de société"
                : 'Aucune société dans cette catégorie'}
            </p>
            {userCompanies.length === 0 && (
              <button
                onClick={() => onNavigate('create')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-8 py-4 bg-[#D6A93A] text-white rounded-xl font-medium hover:bg-[#C09830] transition-all"
              >
                Créer ma première société
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredCompanies.map((company, index) => (
              <motion.button type="button"
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCompanyClick(company)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-left bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-[#D6A93A]"
              >
                <div className={viewMode === 'grid' ? 'space-y-4' : 'flex items-center gap-6'}>
                  <div
                    className={`bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-2xl flex items-center justify-center ${
                      viewMode === 'grid' ? 'w-16 h-16' : 'w-20 h-20 flex-shrink-0'
                    }`}
                  >
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#1A2753] font-medium text-lg mb-2 truncate">
                      {company.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${getCompanyTypeColor(
                          company.legalForm
                        )}`}
                      >
                        {getCompanyTypeLabel(company.legalForm)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                          company.status
                        )}`}
                      >
                        {getStatusLabel(company.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {company.capital && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatFCFACompact(company.capital ?? 0)}</span>
                        </div>
                      )}
                      {company.createdAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(company.createdAt).toLocaleDateString('fr-FR', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-[#D6A93A] group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Modal détails */}
      <AnimatePresence>
        {showDetailsModal && selectedCompany && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1A2753] to-[#273A7A] p-6 rounded-t-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white text-2xl font-medium mb-2">
                        {selectedCompany.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getCompanyTypeColor(
                            selectedCompany.legalForm
                          )}`}
                        >
                          {getCompanyTypeLabel(selectedCompany.legalForm)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            selectedCompany.status
                          )}`}
                        >
                          {getStatusLabel(selectedCompany.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button aria-label="Fermer"
                    onClick={() => setShowDetailsModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Infos */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-[#1A2753] font-medium mb-4">Informations</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Date de création</p>
                      <p className="text-[#1A2753] font-medium">
                        {selectedCompany.createdAt &&
                          new Date(selectedCompany.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {selectedCompany.capital && (
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Capital social</p>
                        <p className="text-[#1A2753] font-medium">
                          {selectedCompany.capital.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    )}
                    {selectedCompany.sector && (
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Secteur d'activité</p>
                        <p className="text-[#1A2753] font-medium">{selectedCompany.sector}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h3 className="text-[#1A2753] font-medium mb-4">Services disponibles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {serviceCards.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setShowDetailsModal(false);
                          onNavigate(service.screen, selectedCompany.id);
                        }}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                      >
                        <div
                          className={`w-12 h-12 ${service.bgColor} rounded-xl flex items-center justify-center`}
                        >
                          <service.icon className={`w-6 h-6 ${service.iconColor}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[#1A2753] font-medium">{service.title}</p>
                          <p className="text-gray-500 text-sm">{service.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#D6A93A] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 bg-white border-2 border-[#D6A93A] text-[#D6A93A] rounded-xl font-medium hover:bg-[#D6A93A] hover:text-white transition-all">
                    Modifier les informations
                  </button>
                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 bg-[#1A2753] text-white rounded-xl font-medium hover:bg-[#273A7A] transition-all">
                    Voir les documents
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
