import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Building2, Calendar, Clock, FileText, 
  MessageSquare, Send, CheckCircle, XCircle, AlertCircle,
  User, Briefcase, DollarSign
} from '../ui/icons';
import { useApp } from '../../context/AppContext';

interface BankAccountStatusProps {
  requestId: string;
  onBack: () => void;
}

export const BankAccountStatus: React.FC<BankAccountStatusProps> = ({ requestId, onBack }) => {
  const { 
    bankAccountRequests, 
    companies, 
    banks,
    currentUser, 
    sendBankMessage,
  } = useApp();
  
  const [message, setMessage] = useState('');

  const request = bankAccountRequests.find(r => r.id === requestId);
  const company = request ? companies.find(c => c.id === request.companyId) : null;
  const bank = request ? banks.find(b => b.id === request.bankId) : null;

  if (!request || !company || !bank) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Demande introuvable</p>
          <button onClick={onBack} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 mt-4 text-[#D6A93A]">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendBankMessage(requestId, {
      sender: 'client',
      senderName: currentUser?.name || 'Client',
      message: message.trim(),
    });
    
    setMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'documents_review': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'appointment_scheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente de traitement';
      case 'documents_review': return 'Vérification en cours';
      case 'approved': return 'Approuvé';
      case 'appointment_scheduled': return 'RDV programmé';
      case 'completed': return 'Compte créé';
      case 'rejected': return 'Demande rejetée';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'documents_review': return FileText;
      case 'approved': return CheckCircle;
      case 'appointment_scheduled': return Calendar;
      case 'completed': return CheckCircle;
      case 'rejected': return XCircle;
      default: return FileText;
    }
  };

  const StatusIcon = getStatusIcon(request.status);

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

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-white text-lg">Demande ouverture compte</h2>
              <p className="text-white/70 text-xs">{bank.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="px-6 -mt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${getStatusColor(request.status)} rounded-2xl p-4 border shadow-sm`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
              <StatusIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1">{getStatusLabel(request.status)}</h3>
              <p className="text-sm opacity-80">
                Mise à jour : {new Date(request.updatedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          
          {request.status === 'completed' && (
            <div className="mt-3 p-3 bg-white/30 rounded-xl">
              <p className="text-sm">Votre compte bancaire est actif ! Consultez le dernier message pour les détails.</p>
            </div>
          )}
          
          {request.status === 'rejected' && (
            <div className="mt-3 p-3 bg-white/30 rounded-xl">
              <p className="text-sm">Consultez les messages pour comprendre la raison du rejet.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Company Info */}
      <div className="px-6 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <h3 className="text-[#1A2753] mb-3">Entreprise concernée</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#D6A93A] mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Nom</p>
                <p className="text-[#1A2753]">{company.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-[#D6A93A] mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Forme juridique</p>
                <p className="text-[#1A2753]">{company.legalForm}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-[#D6A93A] mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Capital</p>
                <p className="text-[#1A2753]">{company.capital.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Appointment if scheduled */}
      {request.appointment && (
        <div className="px-6 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-purple-50 border border-purple-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="text-purple-900">Votre rendez-vous</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-purple-800">
                <span className="font-medium">Date :</span> {new Date(request.appointment.date).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-purple-800">
                <span className="font-medium">Heure :</span> {request.appointment.time}
              </p>
              <p className="text-purple-800">
                <span className="font-medium">Lieu :</span> {request.appointment.location}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Messages */}
      <div className="px-6 mt-6">
        <h3 className="text-[#1A2753] mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#D6A93A]" />
          Échanges avec la banque
        </h3>

        <div className="space-y-3 mb-4">
          {request.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.sender === 'client' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${
                msg.sender === 'client'
                  ? 'ml-8 bg-[#1A2753] text-white'
                  : 'mr-8 bg-white border-gray-200 border'
              } rounded-2xl p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.sender === 'client' ? 'bg-[#D6A93A]' : 'bg-emerald-600'
                }`}>
                  {msg.sender === 'client' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Building2 className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${msg.sender === 'client' ? 'text-white' : 'text-[#1A2753]'}`}>
                    {msg.senderName}
                  </p>
                  <p className={`text-xs ${msg.sender === 'client' ? 'text-white/70' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              <p className={`text-sm ${msg.sender === 'client' ? 'text-white/90' : 'text-gray-700'}`}>
                {msg.message}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Message Input */}
        {request.status !== 'completed' && request.status !== 'rejected' && (
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Envoyer un message à la banque..."
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#D6A93A] focus:outline-none resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 mt-2 w-full py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};