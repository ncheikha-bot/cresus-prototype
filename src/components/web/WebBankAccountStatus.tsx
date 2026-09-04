import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  DollarSign,
  Download,
  MapPin,
  Check,
  Paperclip,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface WebBankAccountStatusProps {
  requestId: string;
  onBack: () => void;
}

export const WebBankAccountStatus: React.FC<WebBankAccountStatusProps> = ({
  requestId,
  onBack,
}) => {
  const {
    bankAccountRequests,
    companies,
    banks,
    currentUser,
    sendBankMessage,
  } = useApp();

  const [message, setMessage] = useState('');

  const request = bankAccountRequests.find((r) => r.id === requestId);
  const company = request ? companies.find((c) => c.id === request.companyId) : null;
  const bank = request ? banks.find((b) => b.id === request.bankId) : null;

  if (!request || !company || !bank) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-[#1A2753] mb-2">Demande introuvable</h3>
          <p className="text-gray-600 mb-6">
            Cette demande n'existe pas ou a été supprimée.
          </p>
          <button
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all"
          >
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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'documents_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'appointment_scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente de traitement';
      case 'documents_review':
        return 'Vérification des documents';
      case 'approved':
        return 'Demande approuvée';
      case 'appointment_scheduled':
        return 'Rendez-vous programmé';
      case 'completed':
        return 'Compte créé avec succès';
      case 'rejected':
        return 'Demande rejetée';
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

  const StatusIcon = getStatusIcon(request.status);

  // Documents finaux disponibles quand le compte est créé
  const finalDocuments = request.status === 'completed' ? [
    { name: 'Contrat d\'ouverture de compte', type: 'PDF', size: '1.2 MB' },
    { name: 'RIB de l\'entreprise', type: 'PDF', size: '245 KB' },
    { name: 'Conditions générales', type: 'PDF', size: '856 KB' },
    { name: 'Carte bancaire virtuelle', type: 'PDF', size: '312 KB' },
  ] : [];

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
        <div className="flex items-center gap-4 flex-1">
          {bank.logo.startsWith('http') ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm">
              <ImageWithFallback
                src={bank.logo}
                alt={bank.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-3xl">
              {bank.logo}
            </div>
          )}
          <div>
            <h2 className="text-[#1A2753]">Demande d'ouverture de compte</h2>
            <p className="text-gray-600">{bank.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Status & Messages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${getStatusColor(
              request.status
            )} rounded-2xl p-6 border-2 shadow-sm`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center">
                <StatusIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl mb-1">{getStatusLabel(request.status)}</h3>
                <p className="text-sm opacity-80">
                  Mise à jour :{' '}
                  {new Date(request.updatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {request.status === 'completed' && (
              <div className="mt-4 p-4 bg-white/50 rounded-xl">
                <p className="flex items-center gap-2">
                  <span className="text-2xl"></span>
                  <span>
                    Votre compte bancaire est maintenant actif ! Téléchargez vos documents
                    ci-dessous.
                  </span>
                </p>
              </div>
            )}

            {request.status === 'rejected' && (
              <div className="mt-4 p-4 bg-white/50 rounded-xl">
                <p>
                  Consultez les messages de la banque pour comprendre la raison du rejet
                  et les démarches à suivre.
                </p>
              </div>
            )}

            {request.status === 'approved' && !request.appointment && (
              <div className="mt-4 p-4 bg-white/50 rounded-xl">
                <p>
                  Votre demande a été approuvée ! La banque vous contactera
                  prochainement pour planifier un rendez-vous.
                </p>
              </div>
            )}
          </motion.div>

          {/* Progress Steps */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-6">Suivi de votre demande</h3>
            <div className="space-y-4">
              {[
                { key: 'pending', label: 'Demande envoyée', icon: Send },
                { key: 'documents_review', label: 'Vérification documents', icon: FileText },
                { key: 'approved', label: 'Demande approuvée', icon: CheckCircle },
                { key: 'appointment_scheduled', label: 'Rendez-vous confirmé', icon: Calendar },
                { key: 'completed', label: 'Compte créé', icon: CheckCircle },
              ].map((step, index) => {
                const statusOrder = [
                  'pending',
                  'documents_review',
                  'approved',
                  'appointment_scheduled',
                  'completed',
                ];
                const currentIndex = statusOrder.indexOf(request.status);
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-[#D6A93A] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {isActive ? (
                        <step.icon className="w-5 h-5" />
                      ) : (
                        <span className="text-sm">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`${
                          isCurrent ? 'text-[#1A2753]' : 'text-gray-600'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                    {isActive && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-[#1A2753] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#D6A93A]" />
                Échanges avec la banque
              </h3>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto bg-[#F5F6FA]">
              {request.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === 'client' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${
                    msg.sender === 'client' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-4 ${
                      msg.sender === 'client'
                        ? 'bg-[#1A2753] text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.sender === 'client'
                            ? 'bg-[#D6A93A]'
                            : 'bg-emerald-600'
                        }`}
                      >
                        {msg.sender === 'client' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Building2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            msg.sender === 'client' ? 'text-white' : 'text-[#1A2753]'
                          }`}
                        >
                          {msg.senderName}
                        </p>
                        <p
                          className={`text-xs ${
                            msg.sender === 'client'
                              ? 'text-white/70'
                              : 'text-gray-600'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm ${
                        msg.sender === 'client' ? 'text-white/90' : 'text-gray-700'
                      }`}
                    >
                      {msg.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            {request.status !== 'completed' && request.status !== 'rejected' && (
              <div className="p-6 bg-white border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <button aria-label="Joindre un fichier" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Votre message..."
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#D6A93A] focus:outline-none"
                  />
                  <button aria-label="Envoyer le message"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-10 h-10 bg-[#D6A93A] rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-[#b8902f] transition-colors"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-4">Entreprise concernée</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-[#D6A93A] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Nom</p>
                  <p className="text-[#1A2753]">{company.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-[#D6A93A] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Forme juridique</p>
                  <p className="text-[#1A2753]">{company.legalForm}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-[#D6A93A] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Capital</p>
                  <p className="text-[#1A2753]">
                    {company.capital.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment if scheduled */}
          {request.appointment && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-purple-900">Votre rendez-vous</h3>
              </div>
              <div className="space-y-3 text-sm">
                <p className="text-purple-800">
                  <span>Date :</span>{' '}
                  <span className="ml-2">
                    {new Date(request.appointment.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </p>
                <p className="text-purple-800">
                  <span>Heure :</span>{' '}
                  <span className="ml-2">{request.appointment.time}</span>
                </p>
                <p className="text-purple-800 flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{request.appointment.location}</span>
                </p>
              </div>
            </div>
          )}

          {/* Final Documents */}
          {finalDocuments.length > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-green-900">Documents disponibles</h3>
              </div>
              <div className="space-y-2">
                {finalDocuments.map((doc, index) => (
                  <button
                    key={index}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full flex items-center justify-between p-3 bg-white rounded-xl hover:bg-green-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-[#1A2753]">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.type} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-green-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bank Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-4">Informations banque</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Banque</p>
                <p className="text-[#1A2753]">{bank.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Délai de traitement</p>
                <p className="text-[#1A2753]">{bank.processingTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Frais</p>
                <p className="text-[#1A2753]">{bank.fees.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
