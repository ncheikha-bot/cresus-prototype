import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign,
  CheckCircle,
  X,
  Eye,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Info,
  FileText,
  Clock,
  Check,
  AlertTriangle,
} from '../ui/icons';

interface ClientQuoteValidationStepProps {
  companyData: {
    name: string;
    legalForm: string;
    capital: number;
  };
  quote: {
    registrationFees: number;
    legalFees: number;
    publicationFees: number;
    stampDuty: number;
    adminFees: number;
    notes?: string;
    status: 'pending' | 'validated' | 'rejected';
  };
  onValidate: () => void;
  onReject: (reason: string) => void;
}

export const ClientQuoteValidationStep: React.FC<ClientQuoteValidationStepProps> = ({
  companyData,
  quote,
  onValidate,
  onReject,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const totalFees = 
    quote.registrationFees +
    quote.legalFees +
    quote.publicationFees +
    quote.stampDuty +
    quote.adminFees;

  const capitalSufficient = companyData.capital >= totalFees;
  const netCapital = capitalSufficient ? companyData.capital - totalFees : companyData.capital;
  const totalToPay = capitalSufficient ? companyData.capital : companyData.capital + totalFees;
  const additionalFees = capitalSufficient ? 0 : totalFees;

  if (quote.status === 'validated') {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-green-900 mb-2">Devis validé</h4>
            {/* Les informations pour les statuts se saisissent sous ce bloc : le
                versement ne vient qu'après. */}
            <p className="text-green-700 text-sm mb-4">
              Vous avez validé le devis d'immatriculation le {new Date().toLocaleDateString('fr-FR')}.
              Complétez les informations pour les statuts ci-dessous pour passer au versement
              du capital.
            </p>
            <div className="bg-white rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#273A7A]/80 mb-1">Total frais</p>
                  <p className="text-[#1A2753] text-lg">{totalFees.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-[#273A7A]/80 mb-1">Montant à verser</p>
                  <p className="text-green-600 text-lg">{totalToPay.toLocaleString()} FCFA</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(true)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 mt-4 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              <Eye className="w-4 h-4" />
              Revoir le devis
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quote.status === 'rejected') {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-red-900 mb-2">Devis refusé</h4>
            <p className="text-red-700 text-sm mb-4">
              Vous avez refusé ce devis. L'administrateur a été notifié et vous contactera pour discuter
              d'une nouvelle proposition.
            </p>
            {rejectionReason && (
              <div className="bg-white rounded-xl p-4 mb-4">
                <p className="text-sm text-[#273A7A]/80 mb-1">Motif du refus :</p>
                <p className="text-sm text-[#1A2753]">{rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Bannière d'information */}
        <div className="bg-gradient-to-br from-[#D6A93A]/10 to-[#273A7A]/10 rounded-2xl p-6 border-2 border-[#D6A93A]/30">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-[#D6A93A] flex-shrink-0 mt-1" />
            <div>
              <p className="text-[#1A2753] mb-2">
                <strong>Devis d'immatriculation</strong>
              </p>
              <p className="text-[#273A7A] text-sm">
                L'administrateur a établi un devis pour les frais d'immatriculation de votre société.
                Veuillez le valider pour continuer vers l'étape de paiement.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Carte résumé du devis */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F5F6FA]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1A2753] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D6A93A]" />
                Détails du devis
              </h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-[#273A7A] text-sm underline hover:text-[#1A2753]"
              >
                {showDetails ? 'Masquer' : 'Voir détails'}
              </button>
            </div>

            {showDetails && (
              <div className="space-y-3 mb-6 pb-6 border-b border-[#F5F6FA]">
                <div className="flex justify-between">
                  <span className="text-[#273A7A]/80 text-sm">Frais d'enregistrement</span>
                  <span className="text-[#1A2753]">{quote.registrationFees.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#273A7A]/80 text-sm">Frais juridiques</span>
                  <span className="text-[#1A2753]">{quote.legalFees.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#273A7A]/80 text-sm">Frais de publication</span>
                  <span className="text-[#1A2753]">{quote.publicationFees.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#273A7A]/80 text-sm">Droits de timbre</span>
                  <span className="text-[#1A2753]">{quote.stampDuty.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#273A7A]/80 text-sm">Frais administratifs</span>
                  <span className="text-[#1A2753]">{quote.adminFees.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#F5F6FA]">
              <span className="text-[#1A2753]">Total frais d'immatriculation</span>
              <span className="text-[#D6A93A] text-2xl">{totalFees.toLocaleString()} FCFA</span>
            </div>

            {quote.notes && (
              <div className="bg-[#F5F6FA] rounded-xl p-4 mb-6">
                <p className="text-sm text-[#273A7A]/80 mb-2">Notes de l'administrateur :</p>
                <p className="text-sm text-[#1A2753]">{quote.notes}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <button
                onClick={onValidate}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                  capitalSufficient
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
                }`}
              >
                <Check className="w-5 h-5" />
                Valider le devis
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-5 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Refuser
              </button>
            </div>
          </div>

          {/* Carte simulation paiement */}
          <div className="space-y-4">
            <div
              className={`p-6 rounded-2xl ${
                capitalSufficient
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200'
                  : 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {capitalSufficient ? (
                  <>
                    <TrendingDown className="w-6 h-6 text-green-600" />
                    <h4 className="text-green-900">Capital suffisant</h4>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                    <h4 className="text-amber-900">Frais supplémentaires</h4>
                  </>
                )}
              </div>

              <p className="text-sm mb-4 text-[#273A7A]">
                {capitalSufficient
                  ? 'Votre capital social couvre les frais d\'immatriculation.'
                  : 'Votre capital social ne couvre pas entièrement les frais.'}
              </p>

              <div className="bg-white rounded-xl p-4 space-y-2 shadow-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-[#273A7A]/80">Capital social :</span>
                  <span className="text-[#1A2753]">{companyData.capital.toLocaleString()} FCFA</span>
                </div>
                {capitalSufficient ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#273A7A]/80">Frais déduits :</span>
                      <span className="text-red-600">- {totalFees.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-[#F5F6FA]">
                      <span className="text-[#1A2753]">Capital net :</span>
                      <span className="text-green-600 text-lg">{netCapital.toLocaleString()} FCFA</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#273A7A]/80">Frais à ajouter :</span>
                      <span className="text-amber-600">+ {totalFees.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-[#F5F6FA]">
                      <span className="text-[#1A2753]">Total à verser :</span>
                      <span className="text-amber-600 text-lg">{totalToPay.toLocaleString()} FCFA</span>
                    </div>
                  </>
                )}
              </div>

              {!capitalSufficient && (
                <div className="mt-4 bg-white/50 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Vous devrez verser {additionalFees.toLocaleString()} FCFA en plus de votre capital lors du paiement.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowPreview(true)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full px-5 py-3 bg-white border-2 border-[#273A7A]/20 text-[#273A7A] rounded-xl hover:border-[#273A7A] hover:bg-[#F5F6FA] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Prévisualiser le devis complet
            </button>
          </div>
        </div>
      </div>

      {/* Modal de refus */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-[#1A2753] text-xl mb-4">Refuser le devis</h3>
                <p className="text-[#273A7A] text-sm mb-4">
                  Veuillez indiquer la raison du refus pour que l'administrateur puisse vous proposer une
                  nouvelle offre.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#F5F6FA] border-2 border-[#F5F6FA] rounded-xl focus:border-[#D6A93A] focus:outline-none resize-none mb-4"
                  placeholder="Exemple : Les frais me semblent trop élevés..."
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-5 py-3 bg-[#F5F6FA] text-[#273A7A] rounded-xl hover:bg-[#e8e9ed] transition-all duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      if (rejectionReason.trim()) {
                        onReject(rejectionReason);
                        setShowRejectModal(false);
                      }
                    }}
                    disabled={!rejectionReason.trim()}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmer le refus
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal de prévisualisation */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1A2753] to-[#273A7A] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-[#D6A93A]" />
                  <h2 className="text-white text-xl">Devis d'immatriculation</h2>
                </div>
                <button aria-label="Fermer l'aperçu"
                  onClick={() => setShowPreview(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* En-tête */}
                  <div className="text-center border-b-2 border-[#D6A93A] pb-6">
                    <h3 className="text-[#1A2753] text-2xl mb-2">DEVIS D'IMMATRICULATION</h3>
                    <p className="text-[#273A7A]/80 text-sm">
                      N° {Math.random().toString(36).substring(7).toUpperCase()}
                    </p>
                  </div>

                  {/* Informations société */}
                  <div className="bg-[#F5F6FA] rounded-xl p-5">
                    <p className="text-sm text-[#273A7A]/80 mb-3">Société concernée :</p>
                    <div className="space-y-2">
                      <p className="text-[#1A2753]">
                        <strong>{companyData.name}</strong>
                      </p>
                      <p className="text-sm text-[#273A7A]">Forme juridique : {companyData.legalForm}</p>
                      <p className="text-sm text-[#273A7A]">
                        Capital social : {companyData.capital.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>

                  {/* Détail des frais */}
                  <div>
                    <h4 className="text-[#1A2753] mb-4">Détail des frais</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-[#F5F6FA]">
                        <span className="text-[#273A7A]">Frais d'enregistrement</span>
                        <span className="text-[#1A2753]">{quote.registrationFees.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#F5F6FA]">
                        <span className="text-[#273A7A]">Frais juridiques - Rédaction statuts</span>
                        <span className="text-[#1A2753]">{quote.legalFees.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#F5F6FA]">
                        <span className="text-[#273A7A]">Frais de publication</span>
                        <span className="text-[#1A2753]">{quote.publicationFees.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#F5F6FA]">
                        <span className="text-[#273A7A]">Droits de timbre</span>
                        <span className="text-[#1A2753]">{quote.stampDuty.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#F5F6FA]">
                        <span className="text-[#273A7A]">Frais administratifs</span>
                        <span className="text-[#1A2753]">{quote.adminFees.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-r from-[#D6A93A]/20 to-[#b8902f]/20 rounded-xl p-5">
                    <div className="flex justify-between items-center">
                      <span className="text-[#1A2753] text-lg">TOTAL</span>
                      <span className="text-[#D6A93A] text-3xl">{totalFees.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  {/* Simulation */}
                  <div className={`rounded-xl p-5 ${
                    capitalSufficient 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'bg-amber-50 border-2 border-amber-200'
                  }`}>
                    <h4 className={`mb-4 ${
                      capitalSufficient ? 'text-green-900' : 'text-amber-900'
                    }`}>
                      Simulation de paiement
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#273A7A]">Capital social</span>
                        <span className="text-[#1A2753]">{companyData.capital.toLocaleString()} FCFA</span>
                      </div>
                      {capitalSufficient ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-[#273A7A]">Frais déduits</span>
                            <span className="text-red-600">- {totalFees.toLocaleString()} FCFA</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t-2 border-green-300">
                            <span className="text-green-900">Capital net</span>
                            <span className="text-green-600 text-xl">{netCapital.toLocaleString()} FCFA</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-[#273A7A]">Frais à ajouter</span>
                            <span className="text-amber-600">+ {totalFees.toLocaleString()} FCFA</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t-2 border-amber-300">
                            <span className="text-amber-900">Total à verser</span>
                            <span className="text-amber-600 text-xl">{totalToPay.toLocaleString()} FCFA</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {quote.notes && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                      <p className="text-sm text-[#273A7A]/80 mb-2">Notes :</p>
                      <p className="text-sm text-[#1A2753]">{quote.notes}</p>
                    </div>
                  )}

                  <div className="text-center text-sm text-[#273A7A]/80 pt-6 border-t border-[#F5F6FA]">
                    <p>Devis valable 30 jours</p>
                    <p>Établi le {new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#F5F6FA] px-6 py-4 bg-[#F5F6FA]/50 flex items-center justify-between">
                <button
                  onClick={() => setShowPreview(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-2.5 bg-white border border-[#F5F6FA] text-[#273A7A] rounded-xl hover:bg-[#F5F6FA] transition-all duration-300"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    onValidate();
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-2.5 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Valider le devis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
