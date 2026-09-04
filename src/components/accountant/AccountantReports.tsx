import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  Eye,
  Building2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Folder,
  Upload,
  Send,
  Package,
} from '../ui/icons';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';

type Period = 'week' | 'month' | 'quarter' | 'year';

interface ClientActivity {
  clientId: string;
  clientName: string;
  companyName: string;
  documentsReceived: number;
  documentsProcessed: number;
  documentsPending: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'alert';
}

export const AccountantReports: React.FC = () => {
  const { companies } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'alert'>('all');

  // Données d'activité clients
  const clientActivities: ClientActivity[] = [
    {
      clientId: '1',
      clientName: 'Cheikh Diop',
      companyName: companies[0]?.name || 'Tech Solutions SARL',
      documentsReceived: 45,
      documentsProcessed: 42,
      documentsPending: 3,
      lastActivity: '2026-02-10',
      status: 'active',
    },
    {
      clientId: '2',
      clientName: 'Aminata Sow',
      companyName: companies[1]?.name || 'Diop Commerce',
      documentsReceived: 28,
      documentsProcessed: 25,
      documentsPending: 3,
      lastActivity: '2026-02-09',
      status: 'active',
    },
    {
      clientId: '3',
      clientName: 'Moussa Kane',
      companyName: 'Import Export SA',
      documentsReceived: 12,
      documentsProcessed: 8,
      documentsPending: 4,
      lastActivity: '2026-01-25',
      status: 'alert',
    },
    {
      clientId: '4',
      clientName: 'Fatou Ndoye',
      companyName: 'Services Plus',
      documentsReceived: 18,
      documentsProcessed: 18,
      documentsPending: 0,
      lastActivity: '2026-02-08',
      status: 'active',
    },
    {
      clientId: '5',
      clientName: 'Omar Sy',
      companyName: 'Construction SARL',
      documentsReceived: 6,
      documentsProcessed: 6,
      documentsPending: 0,
      lastActivity: '2025-12-15',
      status: 'inactive',
    },
  ];

  const stats = {
    totalClients: clientActivities.length,
    activeClients: clientActivities.filter((c) => c.status === 'active').length,
    totalDocuments: clientActivities.reduce((sum, c) => sum + c.documentsReceived, 0),
    pendingDocuments: clientActivities.reduce((sum, c) => sum + c.documentsPending, 0),
    processedDocuments: clientActivities.reduce((sum, c) => sum + c.documentsProcessed, 0),
    alertClients: clientActivities.filter((c) => c.status === 'alert').length,
  };

  const getStatusBadge = (status: ClientActivity['status']) => {
    switch (status) {
      case 'active':
        return { label: 'Actif', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'inactive':
        return { label: 'Inactif', color: 'bg-gray-100 text-gray-700', icon: Clock };
      case 'alert':
        return { label: 'Attention requise', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle };
    }
  };

  const filteredActivities = clientActivities.filter((activity) => {
    if (selectedFilter === 'all') return true;
    return activity.status === selectedFilter;
  });

  const getPeriodLabel = (period: Period) => {
    switch (period) {
      case 'week':
        return 'Cette semaine';
      case 'month':
        return 'Ce mois';
      case 'quarter':
        return 'Ce trimestre';
      case 'year':
        return 'Cette année';
    }
  };

  const handleExportReport = () => {
    toast.info(`Export du rapport d'activité pour ${getPeriodLabel(selectedPeriod)}`, {
      description: 'Format : PDF + Excel',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#1A2753] mb-2">Rapport d'activité</h2>
          <p className="text-gray-600">Suivi de l'activité de vos clients</p>
        </div>
        <button
          onClick={handleExportReport}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Download className="w-5 h-5" />
          Exporter le rapport
        </button>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-gray-600">Période :</span>
          <div className="flex gap-2">
            {(['week', 'month', 'quarter', 'year'] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 rounded-lg text-sm transition-all ${
                  selectedPeriod === period
                    ? 'bg-[#1A2753] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getPeriodLabel(period)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">{stats.totalClients}</p>
          <p className="text-gray-600 text-sm">Clients totaux</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="text-green-600 font-medium">{stats.activeClients} actifs</span> • {stats.totalClients - stats.activeClients} inactifs
            </p>
          </div>
        </div>

        {/* Documents reçus */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+8%</span>
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">{stats.totalDocuments}</p>
          <p className="text-gray-600 text-sm">Documents reçus</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Pour {getPeriodLabel(selectedPeriod).toLowerCase()}</p>
          </div>
        </div>

        {/* Documents traités */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+15%</span>
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">{stats.processedDocuments}</p>
          <p className="text-gray-600 text-sm">Documents traités</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Taux de traitement : {Math.round((stats.processedDocuments / stats.totalDocuments) * 100)}%
            </p>
          </div>
        </div>

        {/* Documents en attente */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>+3</span>
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">{stats.pendingDocuments}</p>
          <p className="text-gray-600 text-sm">En attente</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-orange-600 font-medium">{stats.alertClients} clients nécessitent attention</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-gray-600">Filtrer :</span>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Tous', count: clientActivities.length },
              { value: 'active', label: 'Actifs', count: stats.activeClients },
              { value: 'inactive', label: 'Inactifs', count: clientActivities.length - stats.activeClients - stats.alertClients },
              { value: 'alert', label: 'Attention', count: stats.alertClients },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value as any)}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 rounded-lg text-sm transition-all ${
                  selectedFilter === filter.value
                    ? 'bg-[#D6A93A] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents par statut */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#D6A93A]" />
            Documents par statut
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Documents traités</span>
                <span className="text-sm font-medium text-[#1A2753]">{stats.processedDocuments}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${(stats.processedDocuments / stats.totalDocuments) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Documents en attente</span>
                <span className="text-sm font-medium text-[#1A2753]">{stats.pendingDocuments}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all"
                  style={{ width: `${(stats.pendingDocuments / stats.totalDocuments) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total reçu</span>
                <span className="text-sm font-medium text-[#1A2753]">{stats.totalDocuments}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Activité clients */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-[#1A2753] mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#D6A93A]" />
            Activité clients
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clients actifs</p>
                  <p className="text-xl text-[#1A2753] font-medium">{stats.activeClients}</p>
                </div>
              </div>
              <span className="text-green-600 text-sm">
                {Math.round((stats.activeClients / stats.totalClients) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nécessitent attention</p>
                  <p className="text-xl text-[#1A2753] font-medium">{stats.alertClients}</p>
                </div>
              </div>
              <span className="text-orange-600 text-sm">
                {Math.round((stats.alertClients / stats.totalClients) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clients inactifs</p>
                  <p className="text-xl text-[#1A2753] font-medium">
                    {stats.totalClients - stats.activeClients - stats.alertClients}
                  </p>
                </div>
              </div>
              <span className="text-gray-600 text-sm">
                {Math.round(((stats.totalClients - stats.activeClients - stats.alertClients) / stats.totalClients) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Client Activities List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-[#1A2753] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D6A93A]" />
            Détail par client
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-600">Client / Société</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-600">Documents reçus</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-600">Traités</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-600">En attente</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-600">Dernière activité</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-600">Statut</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredActivities.map((activity) => {
                const statusBadge = getStatusBadge(activity.status);
                const StatusIcon = statusBadge.icon;
                const completionRate = Math.round((activity.documentsProcessed / activity.documentsReceived) * 100);

                return (
                  <tr key={activity.clientId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#D6A93A]/10 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[#D6A93A]" />
                        </div>
                        <div>
                          <p className="text-sm text-[#1A2753] font-medium">{activity.clientName}</p>
                          <p className="text-xs text-gray-500">{activity.companyName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#1A2753]">{activity.documentsReceived}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">{activity.documentsProcessed}</span>
                        <span className="text-xs text-gray-600">({completionRate}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm ${
                          activity.documentsPending > 0 ? 'text-orange-600 font-medium' : 'text-gray-600'
                        }`}
                      >
                        {activity.documentsPending}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(activity.lastActivity).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${statusBadge.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-[#D6A93A] hover:text-[#b8902f] text-sm flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        Voir détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-[#1A2753] mb-2">Aucune activité trouvée</h3>
          <p className="text-gray-600">Aucun client ne correspond aux filtres sélectionnés</p>
        </div>
      )}
    </div>
  );
};
