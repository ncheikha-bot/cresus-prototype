import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Building,
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  AlertCircle,
  History,
  X,
  User,
  Calendar,
  Send,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  AlertTriangle,
  Check,
  Loader2,
  Search,
  Filter,
  ChevronRight,
  Info,
  DollarSign,
  FileCheck,
  FileClock,
  FileX,
  Paperclip,
  MoreVertical,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import type { Company, Document, DocumentReview, DocumentVersion } from '../../types';
import { ADMIN_CREATION_PROCESS_STEPS } from '../../data/processSteps';
import { getDocumentStatus } from '../../domain/companySteps';
import { AdminCompanySteps } from './AdminCompanySteps';
import { AdminCompanyProcessStepByStep } from './AdminCompanyProcessStepByStep';

interface AdminCompanyProcessProps {
  onBack: () => void;
}

export const AdminCompanyProcess: React.FC<AdminCompanyProcessProps> = ({ onBack }) => {
  const { companies: mockCompanies, getCompanyProcess } = useApp();
  const [view, setView] = useState<'list' | 'details'>('list');
  /**
   * Dossier ouvert, désigné par son identifiant.
   *
   * La sélection retenait une *copie* de la société : toute évolution du
   * référentiel — avancement d'étape, décision de l'autre onglet — restait
   * invisible tant qu'on ne refermait pas le dossier.
   */
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const PROCESS_STEPS = ADMIN_CREATION_PROCESS_STEPS;
  const companies = mockCompanies || [];

  // Filtrage des entreprises
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.legalForm.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Fonction pour obtenir la couleur selon le statut
  const getStatusColor = (status: string) => {
    const step = PROCESS_STEPS.find(s => s.key === status);
    return step?.color || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Décompte des pièces réellement déposées, au statut que l'admin leur a donné.
  const getDocumentStats = (companyId: string) => {
    const pieces = companies.find(c => c.id === companyId)?.documents ?? [];
    const { documentDecisions } = getCompanyProcess(companyId);
    const statuts = pieces.map(piece => getDocumentStatus(piece, documentDecisions));
    return {
      total: statuts.length,
      validated: statuts.filter(s => s === 'validated').length,
      awaiting: statuts.filter(s => s === 'pending').length,
      toCorrect: statuts.filter(s => s === 'rejected').length,
    };
  };

  // ========== VUE DÉTAILS DU DOSSIER ==========
  const selectedCompany = companies.find(c => c.id === selectedCompanyId) ?? null;

  if (view === 'details' && selectedCompany) {
    return (
      <AdminCompanyProcessStepByStep 
        company={selectedCompany}
        onBack={() => {
          setView('list');
          setSelectedCompanyId(null);
        }}
      />
    );
  }

  // ========== VUE LISTE DES DOSSIERS ==========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1A2753] mb-2">Dossiers de création</h1>
          <p className="text-[#273A7A]/80">Suivi complet du processus de création d'entreprise</p>
        </div>
        <button
          onClick={onBack}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-white hover:bg-[#F5F6FA] rounded-xl transition-all duration-300 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-[#1A2753]" />
          Retour
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#273A7A]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou forme juridique..."
              className="w-full pl-12 pr-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] focus:bg-white outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#273A7A]/80" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-[#F5F6FA] rounded-xl border-2 border-transparent focus:border-[#D6A93A] outline-none transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="submitted">Soumis</option>
              <option value="in_review">En révision</option>
              <option value="documents_ready">Documents prêts</option>
              <option value="signed">Signé</option>
              <option value="completed">Finalisé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-5 gap-4">
        {PROCESS_STEPS.map((step) => {
          const count = companies.filter(c => c.status === step.key).length;
          const StepIcon = step.icon;

          return (
            <button type="button"
              key={step.key}
              onClick={() => setFilterStatus(step.key as any)}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full text-left p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                filterStatus === step.key
                  ? 'bg-gradient-to-br from-[#1A2753] to-[#273A7A] text-white shadow-lg'
                  : 'bg-white hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <StepIcon className={`w-5 h-5 ${
                  filterStatus === step.key ? 'text-[#D6A93A]' : 'text-[#273A7A]/80'
                }`} />
                <span className={`text-2xl font-bold ${
                  filterStatus === step.key ? 'text-white' : 'text-[#1A2753]'
                }`}>{count}</span>
              </div>
              <p className={`text-sm ${
                filterStatus === step.key ? 'text-white/90' : 'text-[#273A7A]/80'
              }`}>{step.label}</p>
            </button>
          );
        })}
      </div>

      {/* Liste des dossiers */}
      <div className="space-y-3">
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Building className="w-16 h-16 text-[#273A7A]/30 mx-auto mb-4" />
            <h3 className="text-[#1A2753] mb-2">Aucun dossier trouvé</h3>
            <p className="text-[#273A7A]/80">Aucun dossier ne correspond à vos critères de recherche</p>
          </div>
        ) : (
          <>
            {filteredCompanies.map((company) => {
              const currentStepIndex = PROCESS_STEPS.findIndex(s => s.key === company.status);
              const currentStep = PROCESS_STEPS[currentStepIndex];
              const StepIcon = currentStep.icon;
              const progress = ((currentStepIndex + 1) / PROCESS_STEPS.length) * 100;
              const stats = getDocumentStats(company.id);

              return (
                <motion.div
                  key={company.id}
                  layout
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#D6A93A]/20"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-xl flex items-center justify-center flex-shrink-0">
                      <StepIcon className="w-7 h-7 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-[#1A2753] mb-1">{company.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-[#273A7A]/80">
                            <span>{company.legalForm}</span>
                            <span>•</span>
                            <span>{company.activity}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg border text-sm ${getStatusColor(company.status)}`}>
                          {currentStep.label}
                        </span>
                      </div>

                      {/* Barre de progression */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-[#273A7A]/80">Progression</span>
                          <span className="text-[#1A2753] font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-[#F5F6FA] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[#D6A93A] to-[#b8902f]"
                          />
                        </div>
                      </div>

                      {/* Stats documents */}
                      <div className="flex items-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#273A7A]/80" />
                          <span className="text-[#273A7A]/80">
                            {stats.total === 0
                              ? 'Aucun document'
                              : `${stats.total} document${stats.total > 1 ? 's' : ''}`}
                          </span>
                        </div>
                        {stats.validated > 0 && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">{stats.validated} validés</span>
                          </div>
                        )}
                        {stats.awaiting > 0 && (
                          <div className="flex items-center gap-1.5">
                            <FileClock className="w-4 h-4 text-purple-600" />
                            <span className="text-purple-600">{stats.awaiting} en attente</span>
                          </div>
                        )}
                        {stats.toCorrect > 0 && (
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-600">{stats.toCorrect} à corriger</span>
                          </div>
                        )}
                      </div>

                      {/* Bouton harmonisé */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCompanyId(company.id);
                          setView('details');
                        }}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-4 py-2.5 bg-white hover:bg-[#F5F6FA] border border-[#273A7A]/20 hover:border-[#273A7A]/40 text-[#1A2753] rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="font-medium text-sm">Consulter le dossier complet</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};