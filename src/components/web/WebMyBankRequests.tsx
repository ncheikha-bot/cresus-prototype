import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Search,
  Filter,
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
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface WebMyBankRequestsProps {
  onBack: () => void;
  onViewRequest: (requestId: string) => void;
}

export const WebMyBankRequests: React.FC<WebMyBankRequestsProps> = ({
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
      label: 'Total des demandes',
      value: myRequests.length,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'En cours',
      value: myRequests.filter(
        (r) =>
          r.status !== 'completed' &&
          r.status !== 'rejected'
      ).length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Comptes créés',
      value: myRequests.filter((r) => r.status === 'completed').length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Nouveaux messages',
      value: myRequests.reduce(
        (acc, req) => acc + req.messages.filter((m) => !m.read && m.sender === 'bank').length,
        0
      ),
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button aria-label="Retour"
          onClick={onBack}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
        </button>
        <div>
          <h1 className="text-[#1A2753]">Mes demandes d'ouverture de compte</h1>
          <p className="text-gray-600">
            Suivez l'état de vos demandes auprès des banques partenaires
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl text-[#1A2753] mb-1">{stat.value}</p>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par société ou banque..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: 'all', label: 'Toutes' },
              { value: 'pending', label: 'En attente' },
              { value: 'documents_review', label: 'Vérification' },
              { value: 'approved', label: 'Approuvées' },
              { value: 'completed', label: 'Créées' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  filterStatus === filter.value
                    ? 'bg-[#D6A93A] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-[#1A2753] mb-2">Aucune demande trouvée</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterStatus !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Vous n\'avez pas encore fait de demande d\'ouverture de compte'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <button
              onClick={onBack}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all"
            >
              Faire une demande
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((request) => {
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
                whileHover={{ y: -4 }}
                onClick={() => onViewRequest(request.id)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-left bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer border-2 border-transparent hover:border-[#D6A93A]"
              >
                {/* Header Stripe */}
                <div className={`h-2 ${getStatusColor(request.status).replace('border-', 'bg-').split(' ')[0]}`} />

                <div className="p-6">
                  {/* Bank & Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {bank.logo.startsWith('http') ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                          <ImageWithFallback
                            src={bank.logo}
                            alt={bank.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {bank.logo}
                        </div>
                      )}
                      <div>
                        <h3 className="text-[#1A2753] mb-1">{bank.name}</h3>
                        <p className="text-sm text-gray-600">{company.name}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${getStatusColor(
                        request.status
                      )}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {getStatusLabel(request.status)}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span>
                        {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 text-gray-600" />
                      <span>{request.messages.length} messages</span>
                      {unreadMessages > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          {unreadMessages}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Appointment Info */}
                  {request.appointment && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-purple-800">
                        <Calendar className="w-4 h-4" />
                        <span>
                          RDV le{' '}
                          {new Date(request.appointment.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                          })}{' '}
                          à {request.appointment.time}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Completed Badge */}
                  {request.status === 'completed' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        <span>Compte créé avec succès</span>
                      </div>
                    </div>
                  )}

                  {/* Last Message Preview */}
                  {request.messages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Dernier message</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {request.messages[request.messages.length - 1].message}
                      </p>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};
