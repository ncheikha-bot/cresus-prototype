import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
  Send,
  Calendar,
  FileText,
  Star,
  ChevronRight,
  X,
  AlertCircle,
  Check,
  MapPin,
  Paperclip,
  ShieldCheck,
  CircleDot,
  DollarSign,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { bankPartners } from '../../data/bankData';
import {
  getRequiredDocuments,
  getDocumentCategories,
  categoryLabels,
} from '../../data/bankRequirements';
import type { BankPartner, Company, BankAccountRequest } from '../../types';
import { nouvelId } from '../../lib/id';

interface WebBankAccountOpeningProps {
  onBack: () => void;
  companyId?: string;
}

export const WebBankAccountOpening: React.FC<WebBankAccountOpeningProps> = ({
  onBack,
  companyId,
}) => {
  const { companies, bankRequests, addBankRequest, sendBankMessage, updateBankRequest } =
    useApp();
  const [step, setStep] = useState<'select' | 'details' | 'chat'>('select');
  const [selectedBank, setSelectedBank] = useState<BankPartner | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(
    companyId ? companies.find((c) => c.id === companyId) || null : null
  );
  const [message, setMessage] = useState('');
  const [currentRequest, setCurrentRequest] = useState<BankAccountRequest | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  // Filtrer uniquement les sociétés complétées
  const completedCompanies = companies.filter((c) => c.status === 'completed');

  // Vérifier si la société a déjà une demande en cours
  const hasExistingRequest = (company: Company) => {
    return bankRequests.some(
      (req) =>
        req.companyId === company.id &&
        req.status !== 'completed' &&
        req.status !== 'rejected'
    );
  };

  const handleSelectBank = (bank: BankPartner) => {
    setSelectedBank(bank);
    setStep('details');
  };

  const handleSubmitRequest = () => {
    if (!selectedBank || !selectedCompany) return;

    const request: Omit<BankAccountRequest, 'id' | 'createdAt' | 'updatedAt'> = {
      companyId: selectedCompany.id,
      bankId: selectedBank.id,
      status: 'pending',
      documentsTransferred: true,
      messages: [
        {
          id: nouvelId('msg'),
          requestId: '',
          sender: 'bank',
          senderName: `Conseiller ${selectedBank.name}`,
          message: `Bonjour ! Nous avons bien reçu votre demande d'ouverture de compte pour ${selectedCompany.name}. Vos documents sont en cours de vérification.`,
          timestamp: new Date().toISOString(),
          read: false,
        },
      ],
    };

    const newRequest = addBankRequest(request);
    setCurrentRequest(newRequest);
    setStep('chat');
  };

  const handleSendMessage = () => {
    if (!message.trim() || !currentRequest) return;

    sendBankMessage(currentRequest.id, {
      sender: 'client',
      senderName: 'Vous',
      message: message.trim(),
    });

    setMessage('');

    // Simulation d'une réponse automatique après 2 secondes
    setTimeout(() => {
      const responses = [
        'Merci pour votre message. Un conseiller vous répondra dans les plus brefs délais.',
        'Nous avons bien reçu votre question. Notre équipe y répondra sous 24h.',
        'Votre message a été transmis à votre conseiller dédié.',
      ];
      sendBankMessage(currentRequest.id, {
        sender: 'bank',
        senderName: `Conseiller ${selectedBank?.name || ''}`,
        message: responses[Math.floor(Math.random() * responses.length)],
      });
    }, 2000);
  };

  const handleScheduleAppointment = () => {
    if (!appointmentDate || !appointmentTime || !currentRequest) return;

    updateBankRequest(currentRequest.id, {
      status: 'appointment_scheduled',
      appointment: {
        date: appointmentDate,
        time: appointmentTime,
        location: selectedBank?.name || '',
        type: 'signature',
        status: 'confirmed',
      },
    });

    setShowAppointmentModal(false);

    sendBankMessage(currentRequest.id, {
      sender: 'bank',
      senderName: `Conseiller ${selectedBank?.name || ''}`,
      message: `Votre rendez-vous a été confirmé pour le ${new Date(
        appointmentDate
      ).toLocaleDateString('fr-FR')} à ${appointmentTime}. Nous vous attendons à notre agence pour finaliser l'ouverture de votre compte.`,
    });
  };

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

  // ========== ÉTAPE 1 : SÉLECTION DE LA BANQUE ==========
  if (step === 'select') {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button aria-label="Retour"
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-white/80 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
          </button>
          <div>
            <h1 className="text-[#1A2753]">Ouverture de compte bancaire</h1>
            <p className="text-[#273A7A]/80">Sélectionnez votre banque partenaire</p>
          </div>
        </div>

        {/* Company Selection */}
        {!companyId && (
          <div className="mb-8">
            <h3 className="text-[#1A2753] mb-4">Pour quelle société ?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedCompanies.map((company) => (
                <motion.button
                  key={company.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCompany(company)}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-white rounded-2xl p-4 flex items-center gap-4 transition-all shadow-sm hover:shadow-md ${
                    selectedCompany?.id === company.id
                      ? 'ring-2 ring-[#D6A93A]'
                      : ''
                  } ${hasExistingRequest(company) ? 'opacity-50' : ''}`}
                  disabled={hasExistingRequest(company)}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[#1A2753]">{company.name}</p>
                    <p className="text-sm text-[#273A7A]/80">{company.legalForm}</p>
                  </div>
                  {selectedCompany?.id === company.id && (
                    <CheckCircle className="w-6 h-6 text-[#D6A93A]" />
                  )}
                  {hasExistingRequest(company) && (
                    <span className="text-xs text-orange-600">Demande en cours</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Banks Grid */}
        {selectedCompany && (
          <div>
            <h3 className="text-[#1A2753] mb-4">Choisissez votre banque</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankPartners.map((bank) => (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleSelectBank(bank)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#D6A93A]"
                >
                  {/* Bank Header */}
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={bank.logo}
                          alt={bank.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-[#1A2753]">{bank.name}</h3>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 text-[#D6A93A] fill-[#D6A93A]" />
                          <span className="text-sm text-[#273A7A]/80">{bank.rating}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-[#273A7A]/80 mb-4 line-clamp-2">
                      {bank.description}
                    </p>

                    {/* Avantages/Services */}
                    <div className="bg-[#F5F6FA] rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="w-4 h-4 text-[#D6A93A]" />
                        <p className="text-sm text-[#1A2753]">Services inclus</p>
                      </div>
                      <div className="space-y-2">
                        {bank.services.map((service, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-[#273A7A]/80 leading-relaxed">
                              {service}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-blue-900/60">Délai</p>
                        </div>
                        <p className="text-sm text-blue-900 font-medium">{bank.processingTime}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <p className="text-xs text-green-900/60">Frais</p>
                        </div>
                        <p className="text-sm text-green-900 font-medium">
                          {bank.fees.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>

                    <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                      <span>Sélectionner</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== ÉTAPE 2 : DÉTAILS ET CONFIRMATION ==========
  if (step === 'details' && selectedBank && selectedCompany) {
    // Obtenir les documents requis selon la banque et la forme juridique
    const requiredDocuments = getRequiredDocuments(selectedBank.id, selectedCompany.legalForm);
    const categorizedDocs = getDocumentCategories(requiredDocuments);

    return (
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button aria-label="Retour"
            onClick={() => setStep('select')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-white/80 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
          </button>
          <div>
            <h1 className="text-[#1A2753]">{selectedBank.name}</h1>
            <p className="text-[#273A7A]/80">Détails de votre demande</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D6A93A]" />
                Société concernée
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#273A7A]/80">Nom</span>
                  <span className="text-sm text-[#1A2753]">{selectedCompany.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#273A7A]/80">Forme juridique</span>
                  <span className="text-sm text-[#1A2753]">
                    {selectedCompany.legalForm}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#273A7A]/80">Capital</span>
                  <span className="text-sm text-[#1A2753]">
                    {selectedCompany.capital?.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Services */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A2753] mb-4">Services inclus</h3>
              <div className="space-y-2">
                {selectedBank.services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-[#273A7A]/80">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents Checklist - Organized by Category */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck className="w-6 h-6 text-[#D6A93A]" />
                <div className="flex-1">
                  <h3 className="text-[#1A2753]">Pièces exigées par {selectedBank.name}</h3>
                  <p className="text-sm text-[#273A7A]/80">
                    Pour une {selectedCompany.legalForm} • {requiredDocuments.filter(d => d.mandatory).length} obligatoires
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {Object.entries(categorizedDocs).map(
                  ([category, docs]) =>
                    docs.length > 0 && (
                      <div key={category}>
                        <h4 className="text-sm text-[#1A2753] mb-3 flex items-center gap-2">
                          <span className="w-1.5 h-5 bg-[#D6A93A] rounded-full"></span>
                          {categoryLabels[category]}
                        </h4>
                        <div className="space-y-3">
                          {docs.map((doc) => (
                            <div
                              key={doc.id}
                              className="bg-[#F5F6FA] rounded-xl p-4 border border-transparent hover:border-[#D6A93A]/30 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                {doc.mandatory ? (
                                  <CircleDot className="w-5 h-5 text-[#D6A93A] flex-shrink-0 mt-0.5" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-[#273A7A]/30 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm text-[#1A2753]">{doc.name}</p>
                                    {doc.mandatory && (
                                      <span className="text-xs bg-[#D6A93A] text-white px-2 py-0.5 rounded">
                                        Obligatoire
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#273A7A]/80 leading-relaxed">
                                    {doc.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>

              {/* Info Note */}
              <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900">
                    Les documents marqués comme obligatoires doivent être fournis pour que votre demande soit traitée. 
                    Les documents optionnels peuvent accélérer le traitement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Processing Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <Clock className="w-8 h-8 text-[#D6A93A] mx-auto mb-2" />
              <p className="text-xs text-[#273A7A]/80 mb-1">Délai de traitement</p>
              <p className="text-sm text-[#1A2753]">{selectedBank.processingTime}</p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitRequest}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white py-4 rounded-2xl hover:shadow-lg transition-all duration-300"
            >
              Soumettre la demande
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== ÉTAPE 3 : CHAT ET SUIVI ==========
  if (step === 'chat' && currentRequest && selectedBank) {
    const messages = currentRequest.messages;

    return (
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button aria-label="Retour"
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-white/80 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
          </button>
          <div className="w-14 h-14 rounded-xl overflow-hidden">
            <img
              src={selectedBank.logo}
              alt={selectedBank.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-[#1A2753]">{selectedBank.name}</h2>
            <span
              className={`inline-block px-3 py-1 rounded-lg text-sm ${getStatusColor(
                currentRequest.status
              )}`}
            >
              {getStatusLabel(currentRequest.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
              {/* Status Progress */}
              <div className="bg-white p-6 border-b border-[#F5F6FA]">
                <div className="flex items-center justify-between mb-2">
                  {['pending', 'documents_review', 'approved', 'appointment_scheduled'].map(
                    (status, index) => (
                      <div key={status} className="flex items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            [
                              'pending',
                              'documents_review',
                              'approved',
                              'appointment_scheduled',
                            ].indexOf(currentRequest.status) >= index
                              ? 'bg-[#D6A93A] text-white'
                              : 'bg-[#F5F6FA] text-[#273A7A]/80'
                          }`}
                        >
                          {[
                            'pending',
                            'documents_review',
                            'approved',
                            'appointment_scheduled',
                          ].indexOf(currentRequest.status) > index ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <span className="text-sm">{index + 1}</span>
                          )}
                        </div>
                        {index < 3 && (
                          <div
                            className={`flex-1 h-1 ${
                              [
                                'pending',
                                'documents_review',
                                'approved',
                                'appointment_scheduled',
                              ].indexOf(currentRequest.status) > index
                                ? 'bg-[#D6A93A]'
                                : 'bg-[#F5F6FA]'
                            }`}
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1 text-xs text-center text-[#273A7A]/80">
                  <span>En attente</span>
                  <span>Vérification</span>
                  <span>Approuvé</span>
                  <span>RDV</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F5F6FA]">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.sender === 'client' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 ${
                        msg.sender === 'client'
                          ? 'bg-[#D6A93A] text-white'
                          : 'bg-white border border-[#E5E6EB]'
                      }`}
                    >
                      {msg.sender === 'bank' && (
                        <p className="text-xs text-[#273A7A]/80 mb-1">{msg.senderName}</p>
                      )}
                      <p
                        className={`text-sm ${
                          msg.sender === 'client' ? 'text-white' : 'text-[#1A2753]'
                        }`}
                      >
                        {msg.message}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === 'client' ? 'text-white/70' : 'text-[#273A7A]/80'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-[#F5F6FA] p-4">
                <div className="flex items-center gap-3">
                  <button aria-label="Joindre un fichier" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-10 h-10 bg-[#F5F6FA] rounded-full flex items-center justify-center hover:bg-[#E5E6EB] transition-colors">
                    <Paperclip className="w-5 h-5 text-[#273A7A]/80" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Votre message..."
                    className="flex-1 px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A93A]"
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Appointment Info */}
            {currentRequest.appointment && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#1A2753] mb-2">Rendez-vous confirmé</h3>
                    <p className="text-sm text-[#273A7A]/80 mb-2">
                      {new Date(currentRequest.appointment.date).toLocaleDateString(
                        'fr-FR',
                        {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                      {' à '}
                      {currentRequest.appointment.time}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-[#273A7A]/80">
                      <MapPin className="w-4 h-4" />
                      <span>{currentRequest.appointment.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {currentRequest.status === 'approved' && !currentRequest.appointment && (
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <Calendar className="w-5 h-5" />
                Prendre rendez-vous
              </button>
            )}

            {/* Bank Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#1A2753] mb-4">Informations</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#273A7A]/80 mb-1">Banque</p>
                  <p className="text-sm text-[#1A2753]">{selectedBank.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#273A7A]/80 mb-1">Société</p>
                  <p className="text-sm text-[#1A2753]">{selectedCompany?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#273A7A]/80 mb-1">Délai</p>
                  <p className="text-sm text-[#1A2753]">{selectedBank.processingTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Modal */}
        <AnimatePresence>
          {showAppointmentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAppointmentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-md p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#1A2753]">Prendre rendez-vous</h3>
                  <button aria-label="Fermer"
                    onClick={() => setShowAppointmentModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-10 h-10 bg-[#F5F6FA] rounded-full flex items-center justify-center hover:bg-[#E5E6EB] transition-colors"
                  >
                    <X className="w-5 h-5 text-[#1A2753]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#273A7A]/80 mb-2 block">Date</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D6A93A]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#273A7A]/80 mb-2 block">Heure</label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D6A93A]"
                    >
                      <option value="">Sélectionner une heure</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </div>

                  <button
                    onClick={handleScheduleAppointment}
                    disabled={!appointmentDate || !appointmentTime}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white py-3 rounded-2xl disabled:opacity-50 hover:shadow-lg transition-all"
                  >
                    Confirmer le rendez-vous
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};