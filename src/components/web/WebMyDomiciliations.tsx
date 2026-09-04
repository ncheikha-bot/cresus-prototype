import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Building2, Calendar, MapPin, Clock, 
  CheckCircle, AlertCircle, Download, FileText, 
  CreditCard, RefreshCw, XCircle, Phone, Mail,
  ChevronRight, Eye, Ban, Filter
} from '../ui/icons';
import { 
  mockDomiciliationContracts, 
  mockDomiciliationOffers,
  getContractStatusLabel,
  getContractStatusColor,
  getPeriodLabel,
  type DomiciliationContract,
  type ContractStatus 
} from '../../data/domiciliationData';

interface WebMyDomiciliationsProps {
  onBack: () => void;
}

type ViewMode = 'list' | 'details';

export const WebMyDomiciliations: React.FC<WebMyDomiciliationsProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedContract, setSelectedContract] = useState<DomiciliationContract | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ContractStatus | 'all'>('all');

  // Contrats réellement souscrits, puis le jeu de démonstration : l'écran
  // n'affichait que ce dernier, si bien qu'une souscription tout juste payée
  // restait invisible.
  const { domiciliations } = useApp();
  const userContracts = [...domiciliations, ...mockDomiciliationContracts];

  const filteredContracts = filterStatus === 'all' 
    ? userContracts 
    : userContracts.filter(c => c.status === filterStatus);

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

  // Liste des contrats (Desktop)
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-[#F5F6FA]">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1A2753] via-[#273A7A] to-[#1A2753] py-12">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center gap-4 mb-8">
              <button aria-label="Retour"
                onClick={handleBack}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div className="flex-1">
                <h1 className="text-white text-3xl mb-2">Mes domiciliations</h1>
                <p className="text-white/70">Gérez vos contrats de domiciliation</p>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#D6A93A]" />
                  <span className="text-white/70">Contrats actifs</span>
                </div>
                <span className="text-white text-3xl">{activeContracts.length}</span>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-[#D6A93A]" />
                  <span className="text-white/70">À renouveler</span>
                </div>
                <span className="text-white text-3xl">
                  {activeContracts.filter(c => getDaysUntilExpiry(c.endDate) <= 30).length}
                </span>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-[#D6A93A]" />
                  <span className="text-white/70">Total contrats</span>
                </div>
                <span className="text-white text-3xl">{userContracts.length}</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-[#D6A93A]" />
                  <span className="text-white/70">Montant mensuel total</span>
                </div>
                <span className="text-white text-2xl">
                  {formatPrice(activeContracts.reduce((sum, c) => sum + c.monthlyAmount, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Filtres */}
          <div className="bg-white rounded-xl p-4 mb-6 flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600">Filtrer par statut :</span>
            <div className="flex gap-2">
              {(['all', 'active', 'expired', 'terminated'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 rounded-lg transition-all ${
                    filterStatus === status
                      ? 'bg-[#1A2753] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'Tous' : getContractStatusLabel(status as ContractStatus)}
                </button>
              ))}
            </div>
          </div>

          {/* Contrats */}
          {filteredContracts.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center">
              <Building2 className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl text-gray-700 mb-2">Aucun contrat trouvé</h3>
              <p className="text-gray-500">
                {filterStatus === 'all' 
                  ? 'Commencez par souscrire à une offre de domiciliation'
                  : `Aucun contrat avec le statut "${getContractStatusLabel(filterStatus as ContractStatus)}"`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredContracts.map((contract) => {
                const offer = getOfferDetails(contract.offerId);
                const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                const isActive = contract.status === 'active';

                return (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${!isActive && 'opacity-60'}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-6 h-6 text-[#1A2753]" />
                          <h3 className="text-[#1A2753] text-xl">{offer?.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{offer?.zone}, {offer?.city}</span>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm ${getContractStatusColor(contract.status)}`}>
                        {getContractStatusLabel(contract.status)}
                      </span>
                    </div>

                    {/* Alertes */}
                    {isExpiringSoon && isActive && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
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

                    {/* Informations */}
                    <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Période</p>
                        <p className="text-[#1A2753]">{getPeriodLabel(contract.period)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Montant</p>
                        <p className="text-[#1A2753]">{formatPrice(contract.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Date de début</p>
                        <p className="text-[#1A2753] text-sm">{formatDate(contract.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Date de fin</p>
                        <p className="text-[#1A2753] text-sm">{formatDate(contract.endDate)}</p>
                      </div>
                    </div>

                    {/* Renouvellement auto */}
                    {contract.autoRenewal && isActive && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-green-600" />
                        <span className="text-green-800 text-sm">Renouvellement automatique activé</span>
                      </div>
                    )}

                    {/* Bouton détails */}
                    <button
                      onClick={() => handleViewDetails(contract)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-[#1A2753] text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#273A7A] transition-all"
                    >
                      <Eye className="w-5 h-5" />
                      Voir les détails
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Détails du contrat (Desktop)
  if (viewMode === 'details' && selectedContract) {
    const offer = getOfferDetails(selectedContract.offerId);
    const daysUntilExpiry = getDaysUntilExpiry(selectedContract.endDate);
    const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    const isActive = selectedContract.status === 'active';

    return (
      <div className="min-h-screen bg-[#F5F6FA]">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1A2753] via-[#273A7A] to-[#1A2753] py-12">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex items-center gap-4 mb-6">
              <button aria-label="Retour"
                onClick={handleBack}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div className="flex-1">
                <h1 className="text-white text-3xl mb-2">{offer?.name}</h1>
                <p className="text-white/70">{offer?.zone}, {offer?.city}</p>
              </div>
              <span className={`px-4 py-2 rounded-full ${getContractStatusColor(selectedContract.status)}`}>
                {getContractStatusLabel(selectedContract.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Alertes */}
              {isExpiringSoon && isActive && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-orange-800 text-lg mb-2">Contrat arrivant à expiration</h3>
                      <p className="text-orange-700 mb-4">
                        Votre contrat expire dans {daysUntilExpiry} jour{daysUntilExpiry > 1 ? 's' : ''}.
                        {!selectedContract.autoRenewal && ' Pensez à le renouveler pour continuer à bénéficier de nos services.'}
                      </p>
                      {!selectedContract.autoRenewal && (
                        <button
                          onClick={handleRenewal}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-all"
                        >
                          Renouveler maintenant
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Informations du contrat */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-[#1A2753] text-xl mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  Informations du contrat
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-500 text-sm">Numéro de contrat</span>
                      <p className="text-[#1A2753] mt-1">{selectedContract.id.toUpperCase()}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 text-sm">Période</span>
                      <p className="text-[#1A2753] mt-1">{getPeriodLabel(selectedContract.period)}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 text-sm">Date de début</span>
                      <p className="text-[#1A2753] mt-1">{formatDate(selectedContract.startDate)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-500 text-sm">Date de signature</span>
                      <p className="text-[#1A2753] mt-1">
                        {selectedContract.signedAt ? formatDate(selectedContract.signedAt) : 'Non signé'}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 text-sm">Montant mensuel</span>
                      <p className="text-[#1A2753] mt-1">{formatPrice(selectedContract.monthlyAmount)}</p>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 text-sm">Date de fin</span>
                      <p className="text-[#1A2753] mt-1">{formatDate(selectedContract.endDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Montant total de la période</span>
                    <span className="text-[#1A2753] text-2xl">{formatPrice(selectedContract.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Adresse de domiciliation */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-[#1A2753] text-xl mb-6 flex items-center gap-3">
                  <MapPin className="w-6 h-6" />
                  Adresse de domiciliation
                </h3>
                
                <div className="bg-[#F5F6FA] rounded-lg p-6">
                  <h4 className="text-[#1A2753] text-lg mb-2">{offer?.name}</h4>
                  <p className="text-gray-600 mb-1">{offer?.address}</p>
                  <p className="text-gray-600">{offer?.postalCode} {offer?.city}</p>
                </div>
              </div>

              {/* Services inclus */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-[#1A2753] text-xl mb-6">Services inclus</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {offer?.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#F5F6FA] rounded-lg">
                      <CheckCircle className="w-5 h-5 text-[#D6A93A] flex-shrink-0" />
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Colonne latérale */}
            <div className="space-y-6">
              {/* Actions rapides */}
              {isActive && (
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-[#1A2753] text-lg mb-4">Actions</h3>
                  
                  <div className="space-y-3">
                    {!selectedContract.autoRenewal && (
                      <button
                        onClick={handleRenewal}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-[#D6A93A] text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#c89830] transition-all"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Renouveler
                      </button>
                    )}
                    
                    <button
                      onClick={handleCancellation}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-red-50 text-red-600 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-100 transition-all border border-red-200"
                    >
                      <Ban className="w-5 h-5" />
                      Résilier
                    </button>
                  </div>
                </div>
              )}

              {/* Renouvellement automatique */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-[#1A2753] text-lg mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Renouvellement
                </h3>
                
                {selectedContract.autoRenewal ? (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-green-800 mb-1">Automatique activé</p>
                        <p className="text-green-700 text-sm">
                          Renouvellement {selectedContract.renewalNotice} jours avant la fin
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-800 mb-1">Désactivé</p>
                        <p className="text-gray-700 text-sm mb-3">
                          Renouvellement manuel requis
                        </p>
                        {isActive && (
                          <button
                            onClick={handleRenewal}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-[#1A2753] text-sm underline hover:text-[#273A7A]"
                          >
                            Activer le renouvellement auto
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-[#1A2753] text-lg mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Documents
                </h3>
                
                <div className="space-y-2">
                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full flex items-center justify-between p-3 bg-[#F5F6FA] rounded-lg hover:bg-gray-100 transition-all">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#1A2753]" />
                      <span className="text-[#1A2753] text-sm">Contrat</span>
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
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-[#1A2753] text-lg mb-4">Besoin d&apos;aide ?</h3>
                
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
            </div>
          </div>
        </div>

        {/* Modal de renouvellement */}
        <AnimatePresence>
          {showRenewalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8"
              onClick={() => setShowRenewalModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-[#D6A93A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-10 h-10 text-[#D6A93A]" />
                  </div>
                  <h3 className="text-[#1A2753] text-2xl mb-2">Renouveler le contrat</h3>
                  <p className="text-gray-600">
                    Choisissez la durée de renouvellement de votre contrat de domiciliation
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-5 bg-[#F5F6FA] rounded-xl text-left hover:bg-gray-100 transition-all hover:shadow-md">
                    <p className="text-[#1A2753] text-lg mb-1">Mensuel</p>
                    <p className="text-gray-600">{formatPrice(selectedContract.monthlyAmount)}/mois</p>
                  </button>
                  
                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-5 bg-[#F5F6FA] rounded-xl text-left hover:bg-gray-100 transition-all hover:shadow-md">
                    <p className="text-[#1A2753] text-lg mb-1">Trimestriel</p>
                    <p className="text-gray-600">
                      {formatPrice(selectedContract.monthlyAmount * 3 * 0.9)} <span className="text-green-600">(-10%)</span>
                    </p>
                  </button>

                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-5 bg-[#F5F6FA] rounded-xl text-left hover:bg-gray-100 transition-all hover:shadow-md">
                    <p className="text-[#1A2753] text-lg mb-1">Semestriel</p>
                    <p className="text-gray-600">
                      {formatPrice(selectedContract.monthlyAmount * 6 * 0.85)} <span className="text-green-600">(-15%)</span>
                    </p>
                  </button>

                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-5 bg-[#D6A93A]/10 border-2 border-[#D6A93A] rounded-xl text-left hover:bg-[#D6A93A]/20 transition-all hover:shadow-md">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[#1A2753] text-lg">Annuel</p>
                      <span className="px-2 py-0.5 bg-[#D6A93A] text-white text-xs rounded-full">
                        Recommandé
                      </span>
                    </div>
                    <p className="text-gray-500">
                      {formatPrice(selectedContract.monthlyAmount * 12 * 0.8)} <span className="text-green-600">(-20%)</span>
                    </p>
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
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8"
              onClick={() => setShowCancelModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ban className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-[#1A2753] text-2xl mb-2">Résilier le contrat</h3>
                  <p className="text-gray-600">
                    Êtes-vous sûr de vouloir résilier votre contrat de domiciliation ?
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <p className="text-orange-800">
                    La résiliation sera effective à la date de fin du contrat ({formatDate(selectedContract.endDate)}).
                    Vous continuerez à bénéficier des services jusqu&apos;à cette date.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    Annuler
                  </button>
                  
                  <button
                    onClick={() => {
                      // Logique de résiliation
                      setShowCancelModal(false);
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-all"
                  >
                    Confirmer la résiliation
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
