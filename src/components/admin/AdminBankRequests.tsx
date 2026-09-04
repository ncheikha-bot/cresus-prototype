import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Search,
  Filter,
  Eye,
  Download,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  X,
  Check,
  MapPin,
} from '../ui/icons';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import type { BankAccountRequest, Company } from '../../types';

export const AdminBankRequests: React.FC = () => {
  const { bankRequests, companies, banks, sendBankMessage, updateBankRequest } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | BankAccountRequest['status']>('all');
  const [selectedRequest, setSelectedRequest] = useState<BankAccountRequest | null>(null);
  const [message, setMessage] = useState('');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const getStatusColor = (status: BankAccountRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'documents_review':
        return 'bg-blue-100 text-blue-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'appointment_scheduled':
        return 'bg-purple-100 text-purple-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: BankAccountRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'documents_review':
        return 'Vérification documents';
      case 'approved':
        return 'Approuvé';
      case 'appointment_scheduled':
        return 'RDV programmé';
      case 'completed':
        return 'Compte ouvert';
      case 'rejected':
        return 'Rejeté';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: BankAccountRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'documents_review':
        return <FileText className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'appointment_scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredRequests = bankRequests.filter((request) => {
    const company = companies.find((c) => c.id === request.companyId);
    const bank = banks.find((b) => b.id === request.bankId);

    const matchesSearch =
      company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bank?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bankRequests.length,
    pending: bankRequests.filter((r) => r.status === 'pending').length,
    approved: bankRequests.filter((r) => r.status === 'approved').length,
    completed: bankRequests.filter((r) => r.status === 'completed').length,
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedRequest) return;

    sendBankMessage(selectedRequest.id, {
      sender: 'admin',
      senderName: 'Admin Crésus',
      message: message.trim(),
    });

    setMessage('');
  };

  const handleStatusUpdate = (status: BankAccountRequest['status']) => {
    if (!selectedRequest) return;

    updateBankRequest(selectedRequest.id, { status });

    // Envoyer un message automatique
    const messages: Record<BankAccountRequest['status'], string> = {
      pending: 'Votre demande est en attente de traitement.',
      documents_review: 'Vos documents sont en cours de vérification.',
      approved: 'Votre demande a été approuvée ! Nous vous contacterons prochainement.',
      appointment_scheduled: 'Un rendez-vous a été programmé pour finaliser l\'ouverture de compte.',
      completed: 'Votre compte bancaire a été ouvert avec succès !',
      rejected: 'Votre demande a été rejetée. Veuillez nous contacter pour plus d\'informations.',
    };

    sendBankMessage(selectedRequest.id, {
      sender: 'admin',
      senderName: 'Admin Crésus',
      message: messages[status],
    });
  };

  const handleScheduleAppointment = () => {
    if (!appointmentDate || !appointmentTime || !selectedRequest) return;

    const bank = banks.find((b) => b.id === selectedRequest.bankId);

    updateBankRequest(selectedRequest.id, {
      status: 'appointment_scheduled',
      appointment: {
        date: appointmentDate,
        time: appointmentTime,
        location: bank?.name || '',
        type: 'signature',
        status: 'confirmed',
      },
    });

    setShowAppointmentModal(false);
    setAppointmentDate('');
    setAppointmentTime('');

    sendBankMessage(selectedRequest.id, {
      sender: 'admin',
      senderName: 'Admin Crésus',
      message: `Votre rendez-vous a été confirmé pour le ${new Date(appointmentDate).toLocaleDateString('fr-FR')} à ${appointmentTime}. Nous vous attendons à ${bank?.name || 'l\'agence'}.`,
    });
  };

  const downloadDocuments = (request: BankAccountRequest) => {
    const company = companies.find((c) => c.id === request.companyId);
    const bank = banks.find((b) => b.id === request.bankId);

    // Simuler le téléchargement
    toast.info('Téléchargement des documents', {
      description: (
        <span className="block whitespace-pre-line">
          {`Société : ${company?.name}\nBanque : ${bank?.name}\n\nDocuments inclus :\n- RC et NINEA\n- Statuts signés\n- Pièce d'identité du gérant\n- Justificatif de domicile`}
        </span>
      ),
      duration: 6000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[#1A2753] mb-2">Demandes d'ouverture de compte bancaire</h2>
        <p className="text-gray-600">Gérez les demandes d'ouverture de compte des clients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">{stats.total}</p>
          <p className="text-gray-600 text-sm">Demandes totales</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">{stats.pending}</p>
          <p className="text-gray-600 text-sm">En attente</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">{stats.approved}</p>
          <p className="text-gray-600 text-sm">Approuvées</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">{stats.completed}</p>
          <p className="text-gray-600 text-sm">Comptes ouverts</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
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
              { value: 'completed', label: 'Complétées' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value as any)}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRequests.map((request) => {
          const company = companies.find((c) => c.id === request.companyId);
          const bank = banks.find((b) => b.id === request.bankId);

          return (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelectedRequest(request)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
            >
              {/* Status Bar */}
              <div className={`h-2 ${getStatusColor(request.status).replace('text-', 'bg-').replace('100', '500')}`} />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-[#1A2753] mb-1">{company?.name}</h3>
                    <p className="text-sm text-gray-600">{bank?.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {getStatusLabel(request.status)}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-600" />
                    <span>{company?.legalForm}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span>{new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {request.appointment && (
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <MapPin className="w-4 h-4" />
                      <span>RDV: {new Date(request.appointment.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadDocuments(request);
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Documents</span>
                  </button>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#D6A93A]/10 text-[#D6A93A] rounded-xl hover:bg-[#D6A93A]/20 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Détails</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-[#1A2753] mb-2">Aucune demande trouvée</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Essayez une autre recherche' : 'Les demandes d\'ouverture de compte apparaîtront ici'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1A2753] to-[#273A7A] px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-white mb-1">
                    {companies.find((c) => c.id === selectedRequest.companyId)?.name}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {banks.find((b) => b.id === selectedRequest.bankId)?.name}
                  </p>
                </div>
                <button aria-label="Fermer"
                  onClick={() => setSelectedRequest(null)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-3">Statut actuel</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                    <button
                      onClick={() => downloadDocuments(selectedRequest)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger les documents
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStatusUpdate('documents_review')}
                    disabled={selectedRequest.status === 'documents_review'}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    <FileText className="w-5 h-5" />
                    Vérifier documents
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={selectedRequest.status === 'approved'}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approuver
                  </button>
                  <button
                    onClick={() => setShowAppointmentModal(true)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    <Calendar className="w-5 h-5" />
                    Programmer RDV
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={selectedRequest.status === 'completed'}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex items-center justify-center gap-2 px-4 py-3 bg-[#D6A93A]/10 text-[#D6A93A] rounded-xl hover:bg-[#D6A93A]/20 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Marquer comme ouvert
                  </button>
                </div>

                {/* Messages */}
                <div>
                  <h4 className="text-[#1A2753] mb-3">Conversation</h4>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto space-y-3 mb-3">
                    {selectedRequest.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-xl px-4 py-2 ${
                            msg.sender === 'client'
                              ? 'bg-[#D6A93A] text-white'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <p className={`text-xs mb-1 ${msg.sender === 'client' ? 'text-white/70' : 'text-gray-500'}`}>
                            {msg.senderName}
                          </p>
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.sender === 'client' ? 'text-white/70' : 'text-gray-600'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Écrire un message..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#D6A93A] focus:outline-none"
                    />
                    <button aria-label="Envoyer le message"
                      onClick={handleSendMessage}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#b8902f] transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointment Modal */}
      <AnimatePresence>
        {showAppointmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowAppointmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <h3 className="text-[#1A2753] mb-4">Programmer un rendez-vous</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#D6A93A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Heure</label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#D6A93A] focus:outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAppointmentModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleScheduleAppointment}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#b8902f] transition-colors"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
