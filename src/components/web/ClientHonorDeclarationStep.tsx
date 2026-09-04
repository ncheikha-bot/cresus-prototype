import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  Check,
  Clock,
  Download,
  PenTool,
  Info,
  X,
} from '../ui/icons';

interface ClientHonorDeclarationStepProps {
  companyData: {
    name: string;
    legalForm: string;
    address: string;
  };
  clientData: {
    firstName: string;
    lastName: string;
    address: string;
  };
  declarationSent: boolean;
  declarationSigned: boolean;
  onSign: () => void;
}

export const ClientHonorDeclarationStep: React.FC<ClientHonorDeclarationStepProps> = ({
  companyData,
  clientData,
  declarationSent,
  declarationSigned,
  onSign,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  if (!declarationSent) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-blue-900 mb-2">Déclaration sur l'honneur en préparation</h4>
            <p className="text-blue-700 text-sm mb-4">
              Vous avez indiqué ne pas disposer de casier judiciaire. Notre équipe prépare une déclaration
              sur l'honneur que vous devrez signer électroniquement.
            </p>
            <div className="bg-white rounded-xl p-4">
              <p className="text-sm text-[#273A7A] mb-2">
                <strong>Prochaines étapes :</strong>
              </p>
              <ul className="text-sm text-[#273A7A]/80 space-y-1 ml-4">
                <li>• L'administrateur génère votre déclaration</li>
                <li>• Vous recevrez une notification</li>
                <li>• Vous pourrez la consulter et la signer ici</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (declarationSigned) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-green-900 mb-2">Déclaration sur l'honneur signée</h4>
            <p className="text-green-700 text-sm mb-4">
              Votre déclaration sur l'honneur a été signée avec succès le{' '}
              {new Date().toLocaleDateString('fr-FR')}.
            </p>
            <button
              onClick={() => setShowPreview(true)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              <Eye className="w-4 h-4" />
              Voir la déclaration signée
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-[#D6A93A]/10 to-[#273A7A]/10 border-2 border-[#D6A93A]/30 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-[#D6A93A] rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-[#1A2753] mb-2">Déclaration sur l'honneur prête à signer</h4>
            <p className="text-[#273A7A] text-sm">
              Votre déclaration sur l'honneur a été générée et est prête pour votre signature électronique.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-[#273A7A] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#1A2753] text-sm mb-2">
                <strong>Qu'est-ce qu'une déclaration sur l'honneur ?</strong>
              </p>
              <p className="text-[#273A7A]/80 text-sm">
                Ce document atteste que vous n'avez jamais fait l'objet d'une condamnation pénale.
                Elle remplace temporairement le casier judiciaire dans votre dossier d'immatriculation.
              </p>
            </div>
          </div>

          <div className="bg-[#F5F6FA] rounded-lg p-4">
            <p className="text-xs text-[#273A7A]/80 mb-3">
              <strong>Informations du document :</strong>
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#273A7A]/80 text-xs mb-1">Déclarant</p>
                <p className="text-[#1A2753]">
                  {clientData.firstName} {clientData.lastName}
                </p>
              </div>
              <div>
                <p className="text-[#273A7A]/80 text-xs mb-1">Société</p>
                <p className="text-[#1A2753]">{companyData.name}</p>
              </div>
              <div>
                <p className="text-[#273A7A]/80 text-xs mb-1">Forme juridique</p>
                <p className="text-[#1A2753]">{companyData.legalForm}</p>
              </div>
              <div>
                <p className="text-[#273A7A]/80 text-xs mb-1">Date de génération</p>
                <p className="text-[#1A2753]">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-5 py-3 bg-white border-2 border-[#273A7A] text-[#273A7A] rounded-xl hover:bg-[#273A7A]/5 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Lire la déclaration
          </button>
          <button
            onClick={onSign}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-5 py-3 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <PenTool className="w-5 h-5" />
            Signer électroniquement
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs text-[#273A7A]/80">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            En signant cette déclaration, vous attestez sur l'honneur de l'exactitude des informations
            fournies. Toute fausse déclaration peut entraîner des sanctions pénales.
          </p>
        </div>
      </div>

      {/* Modal de prévisualisation */}
      <AnimatePresence>
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
                  <FileText className="w-6 h-6 text-[#D6A93A]" />
                  <h2 className="text-white text-xl">Déclaration sur l'honneur</h2>
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
                  {/* En-tête du document */}
                  <div className="text-center border-b-2 border-[#D6A93A] pb-6">
                    <h3 className="text-[#1A2753] text-2xl mb-2">DÉCLARATION SUR L'HONNEUR</h3>
                    <p className="text-[#273A7A]/80 text-sm">
                      Remplaçant l'extrait de casier judiciaire
                    </p>
                  </div>

                  {/* Corps du document */}
                  <div className="space-y-6 text-[#273A7A]">
                    <div>
                      <p className="mb-3">Je soussigné(e),</p>
                      <div className="bg-[#F5F6FA] rounded-lg p-4 space-y-2">
                        <p>
                          <strong>Nom et Prénom :</strong> {clientData.firstName} {clientData.lastName}
                        </p>
                        <p>
                          <strong>Adresse :</strong> {clientData.address}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3">
                        Agissant en qualité de représentant légal de la société en cours de création :
                      </p>
                      <div className="bg-[#F5F6FA] rounded-lg p-4 space-y-2">
                        <p>
                          <strong>Dénomination sociale :</strong> {companyData.name}
                        </p>
                        <p>
                          <strong>Forme juridique :</strong> {companyData.legalForm}
                        </p>
                        <p>
                          <strong>Siège social :</strong> {companyData.address}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-4">
                      <p className="text-[#1A2753]">
                        <strong>DÉCLARE SUR L'HONNEUR :</strong>
                      </p>
                      <ul className="mt-3 space-y-2 text-sm">
                        <li>
                          • N'avoir jamais fait l'objet d'une condamnation pénale, civile ou commerciale
                        </li>
                        <li>
                          • Ne pas être en situation d'interdiction de gérer ou d'administrer une entreprise
                        </li>
                        <li>
                          • Ne pas avoir fait l'objet d'une faillite personnelle ou d'une liquidation
                          judiciaire
                        </li>
                        <li>• Jouir de l'ensemble de mes droits civils et civiques</li>
                      </ul>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
                      <p className="text-sm text-[#273A7A]">
                        <strong>Avertissement :</strong>
                      </p>
                      <p className="text-sm text-[#273A7A]/80 mt-2">
                        Je reconnais être informé(e) que toute fausse déclaration m'expose à des sanctions
                        pénales et civiles conformément aux articles 88 et suivants du Code pénal sénégalais,
                        ainsi qu'à la nullité de l'immatriculation de la société.
                      </p>
                    </div>

                    <div className="pt-6">
                      <p className="text-sm mb-6">
                        Fait à Dakar, le {new Date().toLocaleDateString('fr-FR', { 
                          day: 'numeric',
                          month: 'long', 
                          year: 'numeric'
                        })}
                      </p>
                      <div className="border-t-2 border-dashed border-[#D6A93A] pt-4">
                        <p className="text-sm text-[#273A7A]/80 mb-2">Signature électronique :</p>
                        {declarationSigned ? (
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-green-700 text-sm">
                              Document signé électroniquement le{' '}
                              {new Date().toLocaleDateString('fr-FR', { 
                                day: 'numeric',
                                month: 'long', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-[#F5F6FA] border-2 border-dashed border-[#273A7A]/30 rounded-lg p-8 text-center">
                            <PenTool className="w-12 h-12 text-[#273A7A]/40 mx-auto mb-2" />
                            <p className="text-[#273A7A]/80 text-sm">
                              En attente de signature électronique
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
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
                {!declarationSigned && (
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      onSign();
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-2.5 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <PenTool className="w-4 h-4" />
                    Signer maintenant
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
