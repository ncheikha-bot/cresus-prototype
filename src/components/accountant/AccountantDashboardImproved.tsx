import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Building2,
  Package,
  Receipt,
  ArrowRight,
  Eye,
  Zap,
  Activity,
  DollarSign,
  Plus,
} from '../ui/icons';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import { formatFCFACompact } from '../../lib/format';

interface AccountantDashboardImprovedProps {
  onNavigate?: (page: string) => void;
}

export const AccountantDashboardImproved: React.FC<AccountantDashboardImprovedProps> = ({ onNavigate }) => {
  const { companies } = useApp();

  // Stats globales
  const stats = {
    totalClients: 18,
    activeClients: 15,
    pendingTasks: 12,
    documentsToProcess: 47,
    documentsProcessed: 156,
    monthlyRevenue: 2850000,
    upcomingDeadlines: 5,
  };

  // Clients nécessitant attention
  const urgentClients = [
    {
      id: '1',
      name: 'Moussa Kane',
      company: 'Import Export SA',
      issue: '4 documents manquants',
      priority: 'high',
      deadline: '2026-02-15',
    },
    {
      id: '2',
      name: 'Fatou Ndoye',
      company: 'Services Plus',
      issue: 'Validation TVA en attente',
      priority: 'medium',
      deadline: '2026-02-18',
    },
    {
      id: '3',
      name: 'Omar Sy',
      company: 'Construction SARL',
      issue: 'Déclaration fiscale',
      priority: 'high',
      deadline: '2026-02-20',
    },
  ];

  // Tâches du jour
  const todayTasks = [
    { id: '1', title: 'Valider factures - Tech Solutions', time: '09:00', done: true },
    { id: '2', title: 'Déclaration TVA - Diop Commerce', time: '11:00', done: true },
    { id: '3', title: 'Appel client - Import Export', time: '14:00', done: false },
    { id: '4', title: 'Rapport mensuel - Services Plus', time: '16:00', done: false },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Clients Card - Cliquable */}
        <motion.button
          onClick={() => onNavigate?.('folders')}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Users className="w-7 h-7" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12%</span>
              </div>
            </div>
          </div>
          <p className="text-4xl font-bold mb-2">{stats.totalClients}</p>
          <p className="text-white/80 text-sm mb-3">Clients totaux</p>
          <div className="pt-3 border-t border-white/20">
            <p className="text-sm">
              <span className="font-medium">{stats.activeClients} actifs</span>
              <span className="text-white/60"> • {stats.totalClients - stats.activeClients} inactifs</span>
            </p>
          </div>
        </motion.button>

        {/* Documents à traiter - Cliquable */}
        <motion.button
          onClick={() => onNavigate?.('folders')}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Clock className="w-7 h-7" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+8</span>
              </div>
            </div>
          </div>
          <p className="text-4xl font-bold mb-2">{stats.documentsToProcess}</p>
          <p className="text-white/80 text-sm mb-3">À traiter</p>
          <div className="pt-3 border-t border-white/20">
            <p className="text-sm">
              <span className="font-medium">{stats.pendingTasks} tâches</span>
              <span className="text-white/60"> en attente</span>
            </p>
          </div>
        </motion.button>

        {/* Documents traités - Cliquable */}
        <motion.button
          onClick={() => onNavigate?.('folders')}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+24%</span>
              </div>
            </div>
          </div>
          <p className="text-4xl font-bold mb-2">{stats.documentsProcessed}</p>
          <p className="text-white/80 text-sm mb-3">Traités ce mois</p>
          <div className="pt-3 border-t border-white/20">
            <p className="text-sm">
              <span className="font-medium">93% validés</span>
              <span className="text-white/60"> • 7% rejetés</span>
            </p>
          </div>
        </motion.button>

        {/* Revenus - Cliquable */}
        <motion.button
          onClick={() => onNavigate?.('reports')}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-gradient-to-br from-[#D6A93A] to-[#b8902f] rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <DollarSign className="w-7 h-7" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+15%</span>
              </div>
            </div>
          </div>
          <p className="text-4xl font-bold mb-2">{formatFCFACompact(stats.monthlyRevenue)}</p>
          <p className="text-white/80 text-sm mb-3">CA mensuel</p>
          <div className="pt-3 border-t border-white/20">
            <p className="text-sm">
              <span className="font-medium">FCFA</span>
              <span className="text-white/60"> • Objectif: 3M</span>
            </p>
          </div>
        </motion.button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients urgents - 2 colonnes */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#1A2753] flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Clients nécessitant attention
            </h3>
            <button 
              onClick={() => onNavigate?.('folders')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-[#D6A93A] text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {urgentClients.map((client, index) => (
              <motion.button type="button"
                key={client.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                onClick={() => onNavigate?.('folders')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] block w-full text-left p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">
                      {client.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[#1A2753] font-medium">{client.name}</p>
                        <p className="text-gray-500 text-sm">{client.company}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          client.priority
                        )}`}
                      >
                        {client.priority === 'high' ? 'Urgent' : 'Moyen'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        {client.issue}
                      </p>
                      <p className="text-xs text-gray-500">
                        Échéance: {new Date(client.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <span
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-[#D6A93A] text-white rounded-xl text-sm hover:bg-[#C09830]"
                  >
                    Traiter
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tâches du jour */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-3xl p-6 shadow-lg"
        >
          <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#D6A93A]" />
            Tâches du jour
          </h3>

          <div className="space-y-3">
            {todayTasks.map((task, index) => (
              <motion.button
                key={task.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                onClick={() => {
                  // Toggle task done status
                  toast.success(`Tâche ${task.done ? 'réouverte' : 'marquée comme terminée'}`);
                }}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full p-3 rounded-xl border-2 transition-all text-left ${
                  task.done
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-[#D6A93A]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        task.done ? 'text-gray-500 line-through' : 'text-[#1A2753]'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{task.time}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <button 
            onClick={() => toast.info('Fonctionnalité d\'ajout de tâche à venir')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full mt-4 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter une tâche
          </button>
        </motion.div>
      </div>

      {/* Bottom Grid - Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.button
          onClick={() => onNavigate?.('folders')}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl text-left hover:shadow-xl transition-all group hover:scale-105"
        >
          <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-7 h-7 text-white" />
          </div>
          <p className="text-[#1A2753] font-medium mb-1">Gérer clients</p>
          <p className="text-sm text-gray-600">Voir tous les dossiers</p>
        </motion.button>

        <motion.button
          onClick={() => onNavigate?.('folders')}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl text-left hover:shadow-xl transition-all group hover:scale-105"
        >
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <p className="text-[#1A2753] font-medium mb-1">Documents</p>
          <p className="text-sm text-gray-600">Traiter les pièces</p>
        </motion.button>

        <motion.button
          onClick={() => onNavigate?.('reports')}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl text-left hover:shadow-xl transition-all group hover:scale-105"
        >
          <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <p className="text-[#1A2753] font-medium mb-1">Rapports</p>
          <p className="text-sm text-gray-600">Voir l'activité</p>
        </motion.button>

        <motion.button
          onClick={() => onNavigate?.('declarations')}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl text-left hover:shadow-xl transition-all group hover:scale-105"
        >
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Receipt className="w-7 h-7 text-white" />
          </div>
          <p className="text-[#1A2753] font-medium mb-1">Déclarations</p>
          <p className="text-sm text-gray-600">Échéances fiscales</p>
        </motion.button>
      </div>

      {/* Performance mensuelle - Cliquable pour voir rapports */}
      <motion.button
        onClick={() => onNavigate?.('reports')}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all w-full text-left group"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1A2753] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#D6A93A]" />
            Performance mensuelle
          </h3>
          <ArrowRight className="w-5 h-5 text-[#D6A93A] group-hover:translate-x-1 transition-transform" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-600 text-sm">Taux de traitement</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-[#1A2753] mb-2">87%</p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '87%' }}
                transition={{ duration: 1, delay: 0.7 }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-green-50 to-green-100/30 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-600 text-sm">Satisfaction client</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-[#1A2753] mb-2">94%</p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '94%' }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-full bg-green-500 rounded-full"
              />
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100/30 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-600 text-sm">Délais respectés</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-[#1A2753] mb-2">91%</p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '91%' }}
                transition={{ duration: 1, delay: 0.9 }}
                className="h-full bg-orange-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  );
};
