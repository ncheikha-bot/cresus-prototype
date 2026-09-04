import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Search,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  XCircle,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  ArrowLeft,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';

interface MyBankRequestsProps {
  onBack: () => void;
  onViewRequest: (requestId: string) => void;
}

export const MyBankRequests: React.FC<MyBankRequestsProps> = ({
  onBack,
  onViewRequest,
}) => {
  const { bankAccountRequests, companies, banks, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filtrer les demandes de l'utilisateur actuel
  const userCompanyIds = companies
    .filter((c) => c.clientId === currentUser?.id)
    .map((c) => c.id);

  const myRequests = bankAccountRequests.filter((req) =>
    userCompanyIds.includes(req.companyId)
  );

  // Appliquer les filtres
  const filteredRequests = myRequests.filter((request) => {
    const company = companies.find((c) => c.id === request.companyId);
    const bank = banks.find((b) => b.id === request.bankId);

    const matchesSearch =
      company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || request.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'documents_review':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'appointment_scheduled':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'documents_review':
        return 'Vérification';
      case 'approved':
        return 'Approuvé';
      case 'appointment_scheduled':
        return 'RDV programmé';
      case 'completed':
        return 'Compte créé';
      case 'rejected':
        return 'Rejeté';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'documents_review':
        return FileText;
      case 'approved':
        return CheckCircle;
      case 'appointment_scheduled':
        return Calendar;
      case 'completed':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      default:
        return FileText;
    }
  };

  // Statistiques
  const stats = [
    {
      label: 'Total',
      value: myRequests.length,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'En cours',
      value: myRequests.filter(
        (r) => r.status !== 'completed' && r.status !== 'rejected'
      ).length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Créés',
      value: myRequests.filter((r) => r.status === 'completed').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Messages',
      value: myRequests.reduce(
        (acc, req) =>
          acc + req.messages.filter((m) => !m.read && m.sender === 'bank').length,
        0
      ),
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2753] to-[#273A7A] pt-[max(3rem,env(safe-area-inset-top))] pb-6 px-5">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D6A93A]/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="relative">
          <button aria-label="Retour"
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="mb-5">
            <h2 className="text-white text-lg mb-0.5">Mes demandes de compte</h2>
            <p className="text-white/70 text-xs">
              Suivez vos demandes auprès des banques
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3"
              >
                <div
                  className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center mb-2`}
                >
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-2xl text-white mb-0.5">{stat.value}</p>
                <p className="text-white/70 text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-6 -mt-4 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] focus:outline-none text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { value: 'all', label: 'Toutes' },
              { value: 'pending', label: 'En attente' },
              { value: 'approved', label: 'Approuvées' },
              { value: 'completed', label: 'Créées' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  filterStatus === filter.value
                    ? 'bg-[#D6A93A] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="px-6 space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-[#1A2753] mb-2">Aucune demande trouvée</h3>
            <p className="text-gray-600 text-sm px-6 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Vous n\'avez pas encore fait de demande d\'ouverture de compte'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={onBack}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl"
              >
                Faire une demande
              </button>
            )}
          </div>
        ) : (
          filteredRequests.map((request) => {
            const company = companies.find((c) => c.id === request.companyId);
            const bank = banks.find((b) => b.id === request.bankId);
            const StatusIcon = getStatusIcon(request.status);
            const unreadMessages = request.messages.filter(
              (m) => !m.read && m.sender === 'bank'
            ).length;

            if (!company || !bank) return null;

            return (
              <motion.button type="button"
                key={request.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewRequest(request.id)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-left bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Header Stripe */}
                <div
                  className={`h-1.5 ${getStatusColor(request.status).replace(
                    'border-',
                    'bg-'
                  ).split(' ')[0]}`}
                />

                <div className="p-4">
                  {/* Bank & Company */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {bank.logo.startsWith('http') ? bank.name.slice(0, 2).toUpperCase() : bank.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#1A2753] mb-0.5 truncate">{bank.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{company.name}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${getStatusColor(
                        request.status
                      )}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {getStatusLabel(request.status)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-600" />
                      <span>
                        {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-600" />
                      <span>{request.messages.length}</span>
                      {unreadMessages > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          {unreadMessages}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Appointment or Completed Badge */}
                  {request.appointment && (
                    <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-purple-800">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          RDV le{' '}
                          {new Date(request.appointment.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          à {request.appointment.time}
                        </span>
                      </div>
                    </div>
                  )}

                  {request.status === 'completed' && (
                    <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-green-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Compte créé avec succès</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
};