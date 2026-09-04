import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Building2, Calendar, MapPin, Clock, 
  CheckCircle, AlertCircle, Download, FileText, 
  CreditCard, RefreshCw, XCircle, Phone, Mail,
  ChevronRight, Eye, Ban
} from '../ui/icons';
import { 
  mockDomiciliationContracts, 
  mockDomiciliationOffers,
  getContractStatusLabel,
  getContractStatusColor,
  getPeriodLabel,
  type DomiciliationContract 
} from '../../data/domiciliationData';

interface MyDomiciliationsProps {
  onBack: () => void;
}

type ViewMode = 'list' | 'details';

export const MyDomiciliations: React.FC<MyDomiciliationsProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedContract, setSelectedContract] = useState<DomiciliationContract | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Contrats réellement souscrits, puis le jeu de démonstration : l'écran
  // n'affichait que ce dernier, si bien qu'une souscription tout juste payée
  // restait invisible.
  const { domiciliations } = useApp();
  const userContracts = [...domiciliations, ...mockDomiciliationContracts];

  const activeContracts = userContracts.filter(c => c.status === 'active');
  const expiredContracts = userContracts.filter(c => c.status === 'expired' || c.status === 'terminated');

  const getOfferDetails = (offerId: string) => {
    return mockDomiciliationOffers.find(o => o.id === offerId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDetails = (contract: DomiciliationContract) => {
    setSelectedContract(contract);
    setViewMode('details');
  };

  const handleRenewal = () => {
    setShowRenewalModal(true);
  };

  const handleCancellation = () => {
    setShowCancelModal(true);
  };

  const handleBack = () => {
    if (viewMode === 'details') {
      setViewMode('list');
      setSelectedContract(null);
    } else {
      onBack();
    }
  };

  // Liste des contrats
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-[#F5F6FA] pb-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1A2753] via-[#273A7A] to-[#1A2753] pt-12 pb-8 px-6 rounded-b-3xl">
          <div className="flex items-center gap-4 mb-6">
            <button aria-label="Retour"
              onClick={handleBack}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white text-xl">Mes domiciliations</h1>
              <p className="text-white/70 text-sm">Gérez vos contrats de domiciliation</p>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-[#D6A93A]" />
                <span className="text-white/70 text-sm">Contrats actifs</span>
              </div>
              <span className="text-white text-2xl">{activeContracts.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#D6A93A]" />
                <span className="text-white/70 text-sm">À renouveler</span>
              </div>
              <span className="text-white text-2xl">
                {activeContracts.filter(c => getDaysUntilExpiry(c.endDate) <= 30).length}
              </span>
            </div>
          </div>
        </div>

        {/* Contrats actifs */}
        <div className="px-6 mt-6">
          <h2 className="text-[#1A2753] mb-4">Contrats actifs</h2>
          
          {activeContracts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Aucun contrat actif</p>
              <p className="text-gray-600 text-sm">Commencez par souscrire à une offre de domiciliation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeContracts.map((contract) => {
                const offer = getOfferDetails(contract.offerId);
                const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                return (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-5 h-5 text-[#1A2753]" />
                          <h3 className="text-[#1A2753]">{offer?.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{offer?.zone}, {offer?.city}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${getContractStatusColor(contract.status)}`}>
                        {getContractStatusLabel(contract.status)}
                      </span>
                    </div>

                    {/* Période et montant */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                      <div>
                        <p className="text-gray-600 text-sm">Période</p>
                        <p className="text-[#1A2753]">{getPeriodLabel(contract.period)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 text-sm">Montant</p>
                        <p className="text-[#1A2753]">{formatPrice(contract.totalAmount)}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600 text-sm">
                        Du {formatDate(contract.startDate)} au {formatDate(contract.endDate)}
                      </span>
                    </div>

                    {/* Alerte expiration */}
                    {isExpiringSoon && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-orange-800 text-sm">
                            Expire dans {daysUntilExpiry} jour{daysUntilExpiry > 1 ? 's' : ''}
                          </p>
                          {!contract.autoRenewal && (
                            <p className="text-orange-600 text-xs mt-1">
                              Renouvellement automatique désactivé
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Renouvellement auto */}
                    {contract.autoRenewal && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-green-600" />
                        <span className="text-green-800 text-sm">
                          Renouvellement automatique activé
                        </span>
                      </div>
                    )}

                    {/* Bouton détails */}
                    <button
                      onClick={() => handleViewDetails(contract)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-[#1A2753] text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#273A7A] transition-all active:scale-98"
                    >
                      <Eye className="w-4 h-4" />
                      Voir les détails
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contrats expirés/résiliés */}
        {expiredContracts.length > 0 && (
          <div className="px-6 mt-8">
            <h2 className="text-[#1A2753] mb-4">Historique</h2>
            <div className="space-y-3">
              {expiredContracts.map((contract) => {
                const offer = getOfferDetails(contract.offerId);
                
                return (
                  <div
                    key={contract.id}
                    className="bg-white rounded-xl p-4 shadow-sm opacity-60"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-5 h-5 text-gray-500" />
                          <h3 className="text-gray-700">{offer?.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>Terminé le {formatDate(contract.endDate)}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${getContractStatusColor(contract.status)}`}>
                        {getContractStatusLabel(contract.status)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Détails du contrat
  if (viewMode === 'details' && selectedContract) {
    const offer = getOfferDetails(selectedContract.offerId);
    const daysUntilExpiry = getDaysUntilExpiry(selectedContract.endDate);
    const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

    return (
      <div className="min-h-screen bg-[#F5F6FA] pb-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1A2753] via-[#273A7A] to-[#1A2753] pt-12 pb-8 px-6 rounded-b-3xl">
          <div className="flex items-center gap-4 mb-6">
            <button aria-label="Retour"
              onClick={handleBack}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white text-xl">{offer?.name}</h1>
              <p className="text-white/70 text-sm">{offer?.zone}, {offer?.city}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs ${getContractStatusColor(selectedContract.status)}`}>
              {getContractStatusLabel(selectedContract.status)}
            </span>
          </div>
        </div>

        <div className="px-6 mt-6 space-y-4">
          {/* Alertes */}
          {isExpiringSoon && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-orange-800 mb-1">Contrat arrivant à expiration</h3>
                  <p className="text-orange-700 text-sm mb-3">
                    Votre contrat expire dans {daysUntilExpiry} jour{daysUntilExpiry > 1 ? 's' : ''}.
                    {!selectedContract.autoRenewal && ' Pensez à le renouveler pour continuer à bénéficier de nos services.'}
                  </p>
                  {!selectedContract.autoRenewal && (
                    <button
                      onClick={handleRenewal}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-orange-600 text-white py-2 rounded-lg text-sm hover:bg-orange-700 transition-all"
                    >
                      Renouveler maintenant
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informations du contrat */}
          <div className="bg-white rounded-xl p-5">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informations du contrat
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Numéro de contrat</span>
                <span className="text-[#1A2753]">{selectedContract.id.toUpperCase()}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Période</span>
                <span className="text-[#1A2753]">{getPeriodLabel(selectedContract.period)}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Date de début</span>
                <span className="text-[#1A2753]">{formatDate(selectedContract.startDate)}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Date de fin</span>
                <span className="text-[#1A2753]">{formatDate(selectedContract.endDate)}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Montant mensuel</span>
                <span className="text-[#1A2753]">{formatPrice(selectedContract.monthlyAmount)}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500">Montant total</span>
                <span className="text-[#1A2753]">{formatPrice(selectedContract.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Adresse de domiciliation */}
          <div className="bg-white rounded-xl p-5">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Adresse de domiciliation
            </h3>
            
            <div className="bg-[#F5F6FA] rounded-lg p-4">
              <p className="text-[#1A2753] mb-1">{offer?.name}</p>
              <p className="text-gray-600 text-sm mb-2">{offer?.address}</p>
              <p className="text-gray-600 text-sm">{offer?.postalCode} {offer?.city}</p>
            </div>
          </div>

          {/* Services inclus */}
          <div className="bg-white rounded-xl p-5">
            <h3 className="text-[#1A2753] mb-4">Services inclus</h3>
            
            <div className="space-y-2">
              {offer?.services.map((service, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#D6A93A] flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Renouvellement automatique */}
          <div className="bg-white rounded-xl p-5">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Renouvellement automatique
            </h3>
            
            {selectedContract.autoRenewal ? (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 mb-1">Activé</p>
                    <p className="text-green-700 text-sm">
                      Votre contrat sera automatiquement renouvelé {selectedContract.renewalNotice} jours avant la fin.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <XCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-800 mb-1">Désactivé</p>
                    <p className="text-gray-700 text-sm mb-3">
                      Vous devrez renouveler manuellement votre contrat avant la date d'expiration.
                    </p>
                    <button
                      onClick={handleRenewal}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-[#1A2753] text-sm underline hover:text-[#273A7A]"
                    >
                      Activer le renouvellement automatique
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl p-5">
            <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Documents
            </h3>
            
            <div className="space-y-2">
              <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full flex items-center justify-between p-3 bg-[#F5F6FA] rounded-lg hover:bg-gray-100 transition-all">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#1A2753]" />
                  <span className="text-[#1A2753] text-sm">Contrat de domiciliation</span>
                </div>
                <Download className="w-4 h-4 text-gray-600" />
              </button>
              
              <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full flex items-center justify-between p-3 bg-[#F5F6FA] rounded-lg hover:bg-gray-100 transition-all">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#1A2753]" />
                  <span className="text-[#1A2753] text-sm">Dernière facture</span>
                </div>
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl p-5">
            <h3 className="text-[#1A2753] mb-4">Besoin d&apos;aide ?</h3>
            
            <div className="space-y-2">
              <a
                href="tel:+221338234567"
                className="w-full flex items-center gap-3 p-3 bg-[#F5F6FA] rounded-lg hover:bg-gray-100 transition-all"
              >
                <Phone className="w-5 h-5 text-[#1A2753]" />
                <span className="text-[#1A2753] text-sm">+221 33 823 45 67</span>
              </a>
              
              <a
                href="mailto:domiciliation@cresus.sn"
                className="w-full flex items-center gap-3 p-3 bg-[#F5F6FA] rounded-lg hover:bg-gray-100 transition-all"
              >
                <Mail className="w-5 h-5 text-[#1A2753]" />
                <span className="text-[#1A2753] text-sm">domiciliation@cresus.sn</span>
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            {!selectedContract.autoRenewal && selectedContract.status === 'active' && (
              <button
                onClick={handleRenewal}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-[#D6A93A] text-white py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#c89830] transition-all active:scale-98"
              >
                <RefreshCw className="w-5 h-5" />
                Renouveler le contrat
              </button>
            )}
            
            {selectedContract.status === 'active' && (
              <button
                onClick={handleCancellation}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-red-50 text-red-600 py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-98 border border-red-200"
              >
                <Ban className="w-5 h-5" />
                Résilier le contrat
              </button>
            )}
          </div>
        </div>

        {/* Modal de renouvellement */}
        <AnimatePresence>
          {showRenewalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-6"
              onClick={() => setShowRenewalModal(false)}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#D6A93A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-8 h-8 text-[#D6A93A]" />
                  </div>
                  <h3 className="text-[#1A2753] text-xl mb-2">Renouveler le contrat</h3>
                  <p className="text-gray-600 text-sm">
                    Choisissez la durée de renouvellement de votre contrat de domiciliation
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 bg-[#F5F6FA] rounded-xl text-left hover:bg-gray-100 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#1A2753]">Mensuel</p>
                        <p className="text-gray-600 text-sm">{formatPrice(selectedContract.monthlyAmount)}/mois</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </button>
                  
                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 bg-[#F5F6FA] rounded-xl text-left hover:bg-gray-100 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#1A2753]">Trimestriel</p>
                        <p className="text-gray-600 text-sm">
                          {formatPrice(selectedContract.monthlyAmount * 3 * 0.9)} <span className="text-green-600">(-10%)</span>
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </button>

                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 bg-[#F5F6FA] rounded-xl text-left hover:bg-gray-100 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#1A2753]">Semestriel</p>
                        <p className="text-gray-600 text-sm">
                          {formatPrice(selectedContract.monthlyAmount * 6 * 0.85)} <span className="text-green-600">(-15%)</span>
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </button>

                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 bg-[#D6A93A]/10 border-2 border-[#D6A93A] rounded-xl text-left hover:bg-[#D6A93A]/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[#1A2753]">Annuel</p>
                          <span className="px-2 py-0.5 bg-[#D6A93A] text-white text-xs rounded-full">
                            Recommandé
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                          {formatPrice(selectedContract.monthlyAmount * 12 * 0.8)} <span className="text-green-600">(-20%)</span>
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#D6A93A]" />
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowRenewalModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de résiliation */}
        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-6"
              onClick={() => setShowCancelModal(false)}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ban className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-[#1A2753] text-xl mb-2">Résilier le contrat</h3>
                  <p className="text-gray-600 text-sm">
                    Êtes-vous sûr de vouloir résilier votre contrat de domiciliation ?
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <p className="text-orange-800 text-sm">
                    La résiliation sera effective à la date de fin du contrat ({formatDate(selectedContract.endDate)}).
                    Vous continuerez à bénéficier des services jusqu&apos;à cette date.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      // Logique de résiliation
                      setShowCancelModal(false);
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-all"
                  >
                    Confirmer la résiliation
                  </button>
                  
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Annuler
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
