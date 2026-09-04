import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatFCFACompact } from '../../lib/format';
import {
  ArrowLeft, Search, Filter, Eye, Calendar, TrendingUp,
  Users, CheckCircle2, Clock, AlertCircle, Download,
  FileText, DollarSign, BarChart3, ExternalLink,
  Package, Zap, Shield, Star, Info, Receipt
} from '../ui/icons';
import {
  mockAccountingFolders,
  ACCOUNTING_PACKS,
  BUSINESS_SECTORS,
  getMonthStatusLabel,
  getMonthStatusColor,
  type AccountingFolder,
} from '../../data/accountingData';

interface AdminAccountingMonitoringProps {
  onBack?: () => void;
}

type View = 'overview' | 'clients' | 'detail' | 'packs';

export const AdminAccountingMonitoring: React.FC<AdminAccountingMonitoringProps> = ({ onBack }) => {
  const [view, setView] = useState<View>('overview');
  const [selectedFolder, setSelectedFolder] = useState<AccountingFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Forfait de démarrage
  const FORFAIT_DEMARRAGE = 150000; // FCFA HTVA

  // Simulation tracking (mock data)
  const simulationStats = {
    totalSimulations: 42,
    devisRequests: 8,
    avgScore: 6.2,
    conversionRate: 71,
    byPack: {
      essentiel: 15,
      standard: 14,
      business: 9,
      premium: 4,
    }
  };

  const folders = mockAccountingFolders;

  // Statistiques globales
  const totalClients = folders.length;
  const activeClients = folders.filter(f => f.status === 'active').length;
  const suspendedClients = folders.filter(f => f.status === 'suspended').length;
  
  // Répartition par pack
  const packDistribution = ACCOUNTING_PACKS.map(pack => ({
    pack: pack.name,
    count: folders.filter(f => f.pack === pack.id).length,
    revenue: folders.filter(f => f.pack === pack.id).length * pack.price
  }));

  // Revenus mensuels
  const monthlyRevenue = folders.reduce((sum, f) => {
    const pack = ACCOUNTING_PACKS.find(p => p.id === f.pack);
    return sum + (pack?.price || 0);
  }, 0);

  // Statuts des mois en cours
  const monthStatusStats = {
    waiting: folders.filter(f => f.currentMonth?.status === 'waiting_documents').length,
    inProgress: folders.filter(f => f.currentMonth?.status === 'in_progress').length,
    validation: folders.filter(f => f.currentMonth?.status === 'validation').length,
    completed: folders.filter(f => f.currentMonth?.status === 'completed').length,
  };

  const filteredFolders = folders.filter(folder => {
    const matchesSearch = folder.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         folder.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || folder.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (folder: AccountingFolder) => {
    setSelectedFolder(folder);
    setView('detail');
  };

  return (
    <div className="p-8">
      {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
      <AnimatePresence mode="popLayout">
        {/* Vue d'ensemble */}
        {view === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-[#1A2753] mb-2">Suivi Comptabilité & Fiscalité</h1>
                <p className="text-[#273A7A]/80">Supervision des clients ayant souscrit au service</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setView('packs')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-white border-2 border-[#D6A93A] text-[#D6A93A] rounded-xl hover:bg-[#D6A93A] hover:text-white transition-all flex items-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Voir les packs
                </button>
                <button
                  onClick={() => setView('clients')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all"
                >
                  Voir tous les clients
                </button>
              </div>
            </div>

            {/* KPIs principaux */}
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[#D6A93A] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl text-[#1A2753]">{totalClients}</span>
                </div>
                <p className="text-[#273A7A]/80 text-sm">Clients total</p>
                <p className="text-green-600 text-xs mt-1">{activeClients} actifs</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[#D6A93A] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl text-[#1A2753]">
                    {formatFCFACompact(monthlyRevenue)}
                  </span>
                </div>
                <p className="text-[#273A7A]/80 text-sm">CA mensuel</p>
                <p className="text-green-600 text-xs mt-1">FCFA / mois</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[#D6A93A] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-2xl text-[#1A2753]">{monthStatusStats.waiting}</span>
                </div>
                <p className="text-[#273A7A]/80 text-sm">En attente docs</p>
                <p className="text-orange-600 text-xs mt-1">Attente client</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 border-2 border-transparent hover:border-[#D6A93A] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl text-[#1A2753]">{monthStatusStats.inProgress}</span>
                </div>
                <p className="text-[#273A7A]/80 text-sm">En traitement</p>
                <p className="text-purple-600 text-xs mt-1">Par comptables</p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Répartition par pack */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#1A2753]">Répartition par pack</h2>
                  <BarChart3 className="w-5 h-5 text-[#273A7A]/40" />
                </div>

                <div className="space-y-3">
                  {packDistribution.map((item, index) => {
                    const pack = ACCOUNTING_PACKS[index];
                    return (
                      <div key={index} className="p-4 bg-[#F5F6FA] rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {pack?.emoji ? <pack.emoji className="w-4 h-4 text-[#1A2753]" /> : null}
                            <span className="text-[#1A2753]">{item.pack}</span>
                          </div>
                          <span className="text-[#273A7A]/80 text-sm">{item.count} clients</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 h-2 bg-white rounded-full overflow-hidden mr-3">
                            <div
                              className="h-full bg-[#D6A93A] rounded-full transition-all"
                              style={{ width: `${totalClients > 0 ? (item.count / totalClients) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[#D6A93A] text-sm">
                            {formatFCFACompact(item.revenue)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Forfait de démarrage */}
                <div className="mt-4 p-4 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-xl text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-[#D6A93A]" />
                    <span>Forfait de démarrage</span>
                  </div>
                  <p className="text-2xl mb-1">{FORFAIT_DEMARRAGE.toLocaleString()} FCFA <span className="text-sm opacity-70">HTVA</span></p>
                  <p className="text-xs opacity-70">Obligatoire pour tout nouveau client (setup + paramétrage)</p>
                </div>
              </div>

              {/* État des mois en cours */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#1A2753]">État des mois en cours</h2>
                  <Calendar className="w-5 h-5 text-[#273A7A]/40" />
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <span className="text-[#1A2753]">En attente de pièces</span>
                      </div>
                      <span className="text-2xl text-orange-600">{monthStatusStats.waiting}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-[#1A2753]">Comptabilité en cours</span>
                      </div>
                      <span className="text-2xl text-blue-600">{monthStatusStats.inProgress}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-purple-600" />
                        <span className="text-[#1A2753]">En validation</span>
                      </div>
                      <span className="text-2xl text-purple-600">{monthStatusStats.validation}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-[#1A2753]">Mois clôturés</span>
                      </div>
                      <span className="text-2xl text-green-600">{monthStatusStats.completed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suivi des simulations & devis */}
            <div className="bg-white rounded-2xl p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#1A2753]">Simulations & Demandes de devis</h2>
                <Receipt className="w-5 h-5 text-[#273A7A]/40" />
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">Simulations totales</p>
                  <p className="text-2xl text-[#1A2753]">{simulationStats.totalSimulations}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-xs text-orange-600 mb-1">Demandes de devis</p>
                  <p className="text-2xl text-[#1A2753]">{simulationStats.devisRequests}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-xs text-purple-600 mb-1">Score moyen</p>
                  <p className="text-2xl text-[#1A2753]">{simulationStats.avgScore}/10</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs text-green-600 mb-1">Taux de conversion</p>
                  <p className="text-2xl text-[#1A2753]">{simulationStats.conversionRate}%</p>
                </div>
              </div>

              <div className="p-4 bg-[#F5F6FA] rounded-xl">
                <p className="text-sm text-[#273A7A]/80 mb-3">Répartition des recommandations par pack :</p>
                <div className="grid grid-cols-4 gap-3">
                  {ACCOUNTING_PACKS.map((pack) => (
                    <div key={pack.id} className="text-center">
                      <p className="text-lg text-[#1A2753]">{simulationStats.byPack[pack.id as keyof typeof simulationStats.byPack] ?? 0}</p>
                      <p className="text-xs text-[#273A7A]/80">{pack.name.replace('Pack ', '')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#1A2753]">Clause de révision</p>
                  <p className="text-xs text-[#273A7A]/80 mt-1">
                    Tous les packs incluent une clause de révision après 3 mois de collaboration.
                    Au-delà des seuils (effectif/volume/complexité) : avenant ou devis personnalisé.
                  </p>
                </div>
              </div>
            </div>

            {/* Clients récents */}
            <div className="bg-white rounded-2xl p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#1A2753]">Derniers clients inscrits</h2>
                <button
                  onClick={() => setView('clients')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-[#D6A93A] text-sm hover:underline"
                >
                  Voir tout
                </button>
              </div>

              <div className="space-y-3">
                {folders.slice(0, 5).map((folder) => (
                  <button type="button"
                    key={folder.id}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] block w-full text-left p-4 bg-[#F5F6FA] rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                    onClick={() => handleViewDetail(folder)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-[#1A2753]">{folder.companyName}</p>
                          <span className="text-xs px-2 py-1 bg-white rounded-full text-[#273A7A]">
                            {folder.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#273A7A]/80">
                          <span>{ACCOUNTING_PACKS.find(p => p.id === folder.pack)?.name}</span>
                          <span>•</span>
                          <span>{new Date(folder.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {folder.currentMonth && (
                          <span
                            className="px-3 py-1 rounded-full text-xs"
                            style={{
                              backgroundColor: getMonthStatusColor(folder.currentMonth.status) + '20',
                              color: getMonthStatusColor(folder.currentMonth.status)
                            }}
                          >
                            {getMonthStatusLabel(folder.currentMonth.status)}
                          </span>
                        )}
                        <Eye className="w-5 h-5 text-[#273A7A]/40" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Liste complète des clients */}
        {view === 'clients' && (
          <motion.div
            key="clients"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-6">
              <button
                onClick={() => setView('overview')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex items-center gap-2 text-[#273A7A] hover:text-[#1A2753] transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour au tableau de bord</span>
              </button>
              <h1 className="text-[#1A2753]">Tous les clients comptabilité</h1>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-2xl p-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-[#273A7A]/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un client..."
                    className="w-full pl-12 pr-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-6 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="suspended">Suspendus</option>
                </select>
                <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Exporter
                </button>
              </div>
            </div>

            {/* Liste */}
            <div className="space-y-4">
              {filteredFolders.map((folder) => (
                <motion.button type="button"
                  key={folder.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] block w-full text-left bg-white rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#D6A93A]"
                  onClick={() => handleViewDetail(folder)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-[#1A2753]">{folder.companyName}</h3>
                        <span className="text-xs px-3 py-1 bg-[#F5F6FA] rounded-full text-[#273A7A]">
                          {folder.id}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            folder.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {folder.status === 'active' ? 'Actif' : 'Suspendu'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#273A7A]/80">
                        <span>Pack {ACCOUNTING_PACKS.find(p => p.id === folder.pack)?.name}</span>
                        <span>•</span>
                        <span>Depuis {new Date(folder.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#D6A93A] mb-1">
                        {ACCOUNTING_PACKS.find(p => p.id === folder.pack)?.price.toLocaleString()} FCFA/mois
                      </p>
                      {folder.currentMonth && (
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: getMonthStatusColor(folder.currentMonth.status) + '20',
                            color: getMonthStatusColor(folder.currentMonth.status)
                          }}
                        >
                          {getMonthStatusLabel(folder.currentMonth.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Détail d'un client */}
        {view === 'detail' && selectedFolder && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-6">
              <button
                onClick={() => setView('clients')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex items-center gap-2 text-[#273A7A] hover:text-[#1A2753] transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour à la liste</span>
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[#1A2753] mb-1">{selectedFolder.companyName}</h1>
                  <p className="text-[#273A7A]/80">{selectedFolder.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-xl text-sm ${
                      selectedFolder.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {selectedFolder.status === 'active' ? 'Actif' : 'Suspendu'}
                  </span>
                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Voir dans espace comptable
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Informations générales */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-[#1A2753] mb-4">Informations générales</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#F5F6FA]">
                    <span className="text-[#273A7A]/80">Pack souscrit</span>
                    <span className="text-[#1A2753]">{ACCOUNTING_PACKS.find(p => p.id === selectedFolder.pack)?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#F5F6FA]">
                    <span className="text-[#273A7A]/80">Tarif mensuel</span>
                    <span className="text-[#D6A93A]">
                      {ACCOUNTING_PACKS.find(p => p.id === selectedFolder.pack)?.price.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#F5F6FA]">
                    <span className="text-[#273A7A]/80">Date souscription</span>
                    <span className="text-[#1A2753]">
                      {new Date(selectedFolder.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#F5F6FA]">
                    <span className="text-[#273A7A]/80">Secteur activité</span>
                    <span className="text-[#1A2753]">
                      {BUSINESS_SECTORS.find(s => s.id === selectedFolder.sector)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#273A7A]/80">TVA</span>
                    <span className="text-[#1A2753]">
                      {selectedFolder.vatSubject ? 'Oui' : 'Non'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Suivi du mois en cours */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-[#1A2753] mb-4">Mois en cours</h3>
                {selectedFolder.currentMonth ? (
                  <div className="space-y-4">
                    <div
                      className="p-4 rounded-xl border-2"
                      style={{
                        backgroundColor: getMonthStatusColor(selectedFolder.currentMonth.status) + '10',
                        borderColor: getMonthStatusColor(selectedFolder.currentMonth.status) + '40'
                      }}
                    >
                      <p className="text-[#273A7A]/80 text-xs mb-1">Statut</p>
                      <p className="text-[#1A2753]">
                        {getMonthStatusLabel(selectedFolder.currentMonth.status)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#F5F6FA] rounded-xl">
                        <p className="text-[#273A7A]/80 text-xs mb-1">Documents</p>
                        <p className="text-[#1A2753] text-lg">
                          {selectedFolder.currentMonth.documentsCount.received}/{selectedFolder.currentMonth.documentsCount.total}
                        </p>
                      </div>
                      <div className="p-3 bg-[#F5F6FA] rounded-xl">
                        <p className="text-[#273A7A]/80 text-xs mb-1">Traités</p>
                        <p className="text-[#1A2753] text-lg">
                          {selectedFolder.currentMonth.documentsCount.processed}
                        </p>
                      </div>
                    </div>

                    {selectedFolder.currentMonth.revenue && (
                      <div className="pt-4 border-t border-[#F5F6FA] space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#273A7A]/80">CA du mois</span>
                          <span className="text-[#1A2753]">
                            {selectedFolder.currentMonth.revenue.toLocaleString()} FCFA
                          </span>
                        </div>
                        {selectedFolder.currentMonth.expenses && (
                          <div className="flex justify-between">
                            <span className="text-[#273A7A]/80">Charges</span>
                            <span className="text-[#1A2753]">
                              {selectedFolder.currentMonth.expenses.toLocaleString()} FCFA
                            </span>
                          </div>
                        )}
                        {selectedFolder.currentMonth.result && (
                          <div className="flex justify-between pt-2 border-t border-[#F5F6FA]">
                            <span className="text-[#273A7A]/80">Résultat</span>
                            <span className="text-[#D6A93A]">
                              {selectedFolder.currentMonth.result.toLocaleString()} FCFA
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#273A7A]/80">
                    Aucun mois en cours
                  </div>
                )}
              </div>
            </div>

            {/* Historique des paiements */}
            <div className="bg-white rounded-2xl p-6 mt-6">
              <h3 className="text-[#1A2753] mb-4">Historique des paiements</h3>
              <div className="space-y-3">
                {[...Array(6)].map((_, index) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - index);
                  const pack = ACCOUNTING_PACKS.find(p => p.id === selectedFolder.pack);
                  
                  return (
                    <div key={index} className="p-4 bg-[#F5F6FA] rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-[#1A2753] text-sm">
                            {date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-[#273A7A]/80 text-xs">Pack {pack?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#D6A93A]">{pack?.price.toLocaleString()} FCFA</p>
                        <p className="text-green-600 text-xs">Payé</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Liste des packs */}
        {view === 'packs' && (
          <motion.div
            key="packs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-6">
              <button
                onClick={() => setView('overview')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex items-center gap-2 text-[#273A7A] hover:text-[#1A2753] transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour au tableau de bord</span>
              </button>
              <h1 className="text-[#1A2753]">Liste des packs comptabilité</h1>
            </div>

            {/* Liste */}
            <div className="space-y-4">
              {ACCOUNTING_PACKS.map((pack) => (
                <motion.div
                  key={pack.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#D6A93A]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-[#1A2753]">{pack.name}</h3>
                        <span className="text-xs px-3 py-1 bg-[#F5F6FA] rounded-full text-[#273A7A]">
                          {pack.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#273A7A]/80">
                        <span>Prix mensuel : {pack.price.toLocaleString()} FCFA</span>
                        <span>•</span>
                        <span>Nombre de clients : {packDistribution.find(p => p.pack === pack.name)?.count ?? 0}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#D6A93A] mb-1">
                        {pack.price.toLocaleString()} FCFA/mois
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};