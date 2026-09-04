import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Building2,
  CircleCheck,
  Download,
  PenLine,
  MapPin,
  Brush,
  FileStack,
  CalendarDays,
  Landmark,
  Clock,
  ChevronRight,
  Package,
  ShieldCheck,
  TrendingUp,
  Settings2,
  History,
  Star,
  Eye,
  X,
  Info,
  PieChart,
  Plus,
  Search,
  Filter,
  DollarSign,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { BottomBar } from './BottomBar';
import type { Company } from '../../types';
import { formatFCFACompact } from '../../lib/format';
import { getCompanyStatusLabel, getCompanyStatusColor } from '../../domain/companyStatus';

interface MyCompaniesImprovedProps {
  onBack: () => void;
  onNavigate: (screen: string, companyId?: string) => void;
}

const serviceCards = [
  {
    id: 'bank-account',
    title: 'Compte bancaire',
    description: 'Ouvrir un compte pro',
    icon: Landmark,
    color: 'from-emerald-600 to-emerald-700',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    screen: 'bank-account',
  },
  {
    id: 'accounting',
    title: 'Comptabilité',
    description: 'Gestion comptable & fiscale',
    icon: PieChart,
    color: 'from-[#D6A93A] to-[#C09830]',
    bgColor: 'bg-[#D6A93A]/10',
    iconColor: 'text-[#D6A93A]',
    screen: 'accounting',
  },
  {
    id: 'modification',
    title: 'Modification',
    description: 'Capital, siège, gérant...',
    icon: PenLine,
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
    icon: Brush,
    color: 'from-pink-600 to-pink-700',
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-600',
    screen: 'branding',
  },
];

export const MyCompaniesImproved: React.FC<MyCompaniesImprovedProps> = ({ onBack, onNavigate }) => {
  const { companies, currentUser } = useApp();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  // Guard: si pas d'utilisateur connecté
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D6A93A] mx-auto mb-4"></div>
          <p className="text-[#273A7A]">Chargement...</p>
        </div>
      </div>
    );
  }

  // Filtrer TOUTES les sociétés de l'utilisateur
  const userCompanies = companies.filter(
    (c) => c.userId === currentUser?.id || c.clientId === currentUser?.id
  );

  // Filtrage
  const filteredCompanies = userCompanies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && company.status === 'completed') ||
      (filterStatus === 'pending' && company.status !== 'completed');
    return matchesSearch && matchesStatus;
  });

  // Séparer les sociétés
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

  // Modal détails
  if (showDetailsModal && selectedCompany) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] pb-20">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1A2753] to-[#273A7A] px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-7">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#D6A93A]/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="relative">
            <button aria-label="Retour" onClick={() => setShowDetailsModal(false)} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] mb-5 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-white text-lg mb-1.5">{selectedCompany.name}</h1>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] ${getCompanyTypeColor(
                      selectedCompany.legalForm
                    )}`}
                  >
                    {getCompanyTypeLabel(selectedCompany.legalForm)}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] ${getStatusColor(
                      selectedCompany.status
                    )}`}
                  >
                    {getStatusLabel(selectedCompany.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 -mt-3 space-y-3">
          {/* Infos principales */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,83,0.06)]">
            <h3 className="text-[#1A2753] text-sm mb-3">Informations</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-2 border-b border-[#F5F6FA]">
                <span className="text-[#273A7A]/80 text-xs">Date de création</span>
                <span className="text-[#1A2753] text-xs">
                  {selectedCompany.createdAt &&
                    new Date(selectedCompany.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              {selectedCompany.capital && (
                <div className="flex items-center justify-between py-2 border-b border-[#F5F6FA]">
                  <span className="text-[#273A7A]/80 text-xs">Capital</span>
                  <span className="text-[#1A2753] text-xs">
                    {selectedCompany.capital.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              )}
              {selectedCompany.sector && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#273A7A]/80 text-xs">Secteur</span>
                  <span className="text-[#1A2753] text-xs">
                    {selectedCompany.sector}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Services disponibles */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(26,39,83,0.06)]">
            <h3 className="text-[#1A2753] text-sm mb-3">Services disponibles</h3>
            <div className="space-y-2">
              {serviceCards.map((service) => (
                <motion.button
                  key={service.id}
                  onClick={() => {
                    setShowDetailsModal(false);
                    onNavigate(service.screen, selectedCompany.id);
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full flex items-center gap-3 p-3 bg-[#F5F6FA] rounded-xl active:bg-[#F5F6FA]/70 transition-colors group"
                >
                  <div className={`w-10 h-10 ${service.bgColor} rounded-xl flex items-center justify-center`}>
                    <service.icon className={`w-5 h-5 ${service.iconColor}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[#1A2753] text-sm">{service.title}</p>
                    <p className="text-[#273A7A]/80 text-xs">{service.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#273A7A]/20 group-hover:text-[#D6A93A] transition-colors" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-2 gap-2.5">
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 py-3 bg-white border border-[#D6A93A]/30 text-[#D6A93A] rounded-xl text-sm active:scale-[0.98] transition-transform">
              Modifier
            </button>
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 py-3 bg-[#1A2753] text-white rounded-xl text-sm active:scale-[0.98] transition-transform">
              Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1A2753] to-[#273A7A] px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-7">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D6A93A]/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="relative">
          <button aria-label="Retour" onClick={onBack} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] mb-5 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-white text-lg mb-0.5">Mes Sociétés</h1>
              <p className="text-white/70 text-xs">{userCompanies.length} sociétés</p>
            </div>
            <motion.button aria-label="Créer une société"
              onClick={() => onNavigate('create')}
              whileTap={{ scale: 0.92 }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-11 h-11 bg-[#D6A93A] rounded-xl flex items-center justify-center shadow-lg shadow-[#D6A93A]/20"
            >
              <Plus className="w-5 h-5 text-[#1A2753]" />
            </motion.button>
          </div>

          {/* Recherche */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              placeholder="Rechercher une société..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.08] backdrop-blur-sm border border-white/[0.06] rounded-xl text-white text-sm placeholder-white/30 focus:bg-white/[0.12] focus:outline-none"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2 scrollbar-hide overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] px-3.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                filterStatus === 'all'
                  ? 'bg-white text-[#1A2753]'
                  : 'bg-white/[0.08] text-white/60'
              }`}
            >
              Toutes ({userCompanies.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] px-3.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                filterStatus === 'completed'
                  ? 'bg-white text-[#1A2753]'
                  : 'bg-white/[0.08] text-white/60'
              }`}
            >
              Actives ({completedCompanies.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] px-3.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                filterStatus === 'pending'
                  ? 'bg-white text-[#1A2753]'
                  : 'bg-white/[0.08] text-white/60'
              }`}
            >
              En cours ({pendingCompanies.length})
            </button>
          </div>
        </div>
      </div>

      {/* Liste des sociétés */}
      <div className="px-5 -mt-3 space-y-2.5 pb-6">
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-[0_2px_8px_rgba(26,39,83,0.06)]">
            <Building2 className="w-12 h-12 text-[#273A7A]/15 mx-auto mb-4" />
            <p className="text-[#273A7A]/80 text-sm mb-5">
              {searchQuery
                ? 'Aucune société trouvée'
                : userCompanies.length === 0
                ? 'Vous n\'avez pas encore de société'
                : 'Aucune société dans cette catégorie'}
            </p>
            {userCompanies.length === 0 && (
              <button
                onClick={() => onNavigate('create')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 bg-[#D6A93A] text-[#1A2753] rounded-xl text-sm active:scale-[0.98] transition-transform"
              >
                Créer ma première société
              </button>
            )}
          </div>
        ) : (
          filteredCompanies.map((company, index) => (
            <motion.button type="button"
              key={company.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => handleCompanyClick(company)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-left bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(26,39,83,0.06)] active:scale-[0.99] transition-transform cursor-pointer group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#1A2753] text-sm truncate mb-1">
                        {company.name}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] ${getCompanyTypeColor(
                            company.legalForm
                          )}`}
                        >
                          {getCompanyTypeLabel(company.legalForm)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] ${getStatusColor(
                            company.status
                          )}`}
                        >
                          {getStatusLabel(company.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#273A7A]/80 mt-2">
                    {company.capital && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{formatFCFACompact(company.capital ?? 0)}</span>
                      </div>
                    )}
                    {company.createdAt && (
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
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
                <ChevronRight className="w-4 h-4 text-[#273A7A]/15 group-hover:text-[#D6A93A] transition-colors flex-shrink-0 mt-1" />
              </div>
            </motion.button>
          ))
        )}
      </div>

      <BottomBar currentScreen="companies" onNavigate={onNavigate} />
    </div>
  );
};