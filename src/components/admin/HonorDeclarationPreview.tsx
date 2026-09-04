import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X, Download, Send, FileText, CheckCircle } from '../ui/icons';
import cresusLogo from 'figma:asset/ba7f806837c0b04d16ea0e06c3cf0d16e104e6a4.png';
import { toast } from 'sonner';
import { referenceCourte } from '../../lib/id';

interface HonorDeclarationPreviewProps {
  company: {
    name: string;
    legalForm: string;
    address: string;
  };
  client: {
    firstName: string;
    lastName: string;
    address: string;
  };
  onClose: () => void;
  onSend: () => void;
}

export const HonorDeclarationPreview: React.FC<HonorDeclarationPreviewProps> = ({
  company,
  client,
  onClose,
  onSend,
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleDownload = () => {
    // Simulation du téléchargement
    toast.info('Téléchargement de la déclaration sur l\'honneur…', {
      description: 'Dans une version de production, ce document serait généré en PDF.',
    });
  };

  return (
    <motion.div
      key="honor-declaration-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A2753] to-[#273A7A] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#D6A93A]" />
            <h2 className="text-white text-xl">Déclaration sur l'honneur</h2>
          </div>
          <button aria-label="Fermer"
            onClick={onClose}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div
            ref={documentRef}
            className="bg-white border-2 border-[#F5F6FA] rounded-xl p-12 mx-auto"
            style={{ maxWidth: '800px' }}
          >
            {/* En-tête du document */}
            <div className="flex items-start justify-between mb-12">
              <div>
                <img src={cresusLogo} alt="Crésus" className="h-16 mb-4" />
                <p className="text-[#273A7A]/80 text-sm">
                  Plateforme de création d'entreprise
                </p>
                <p className="text-[#273A7A]/80 text-sm">Dakar, Sénégal</p>
                <p className="text-[#273A7A]/80 text-sm">contact@cresus.sn</p>
              </div>
              <div className="text-right">
                <p className="text-[#273A7A]/80 text-sm">Document N°</p>
                <p className="text-[#1A2753] mb-2">{referenceCourte('DH', `${company.name}|${client.lastName}`)}</p>
                <p className="text-[#273A7A]/80 text-sm">Date d'émission</p>
                <p className="text-[#1A2753]">{today}</p>
              </div>
            </div>

            {/* Titre principal */}
            <div className="text-center mb-8">
              <h1 className="text-[#1A2753] text-3xl mb-2">
                DÉCLARATION SUR L'HONNEUR
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] mx-auto mb-6"></div>
              <p className="text-[#273A7A] text-sm italic">
                Concernant l'absence de casier judiciaire
              </p>
            </div>

            {/* Identité du déclarant */}
            <div className="mb-8 bg-[#F5F6FA] rounded-xl p-6">
              <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#D6A93A] rounded-full"></div>
                Identité du déclarant
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#273A7A]/80 mb-1">Nom et Prénom(s)</p>
                  <p className="text-[#1A2753]">
                    {client.firstName} {client.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[#273A7A]/80 mb-1">Adresse</p>
                  <p className="text-[#1A2753]">{client.address}</p>
                </div>
              </div>
            </div>

            {/* Corps de la déclaration */}
            <div className="mb-8 space-y-6 text-[#273A7A] leading-relaxed">
              <p className="text-justify">
                Je soussigné(e), <strong className="text-[#1A2753]">{client.firstName} {client.lastName}</strong>,
                agissant en qualité de représentant légal pour la création de la société :
              </p>

              <div className="bg-gradient-to-br from-[#D6A93A]/10 to-[#273A7A]/10 rounded-xl p-6 border-l-4 border-[#D6A93A]">
                <p className="text-[#1A2753] mb-1">
                  <strong>{company.name}</strong>
                </p>
                <p className="text-sm text-[#273A7A]/80">
                  Forme juridique : {company.legalForm}
                </p>
                <p className="text-sm text-[#273A7A]/80">
                  Siège social : {company.address}
                </p>
              </div>

              <p className="text-justify">
                <strong className="text-[#1A2753]">DÉCLARE SUR L'HONNEUR :</strong>
              </p>

              <div className="bg-white border-2 border-[#273A7A]/20 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-justify">
                    Ne pas avoir fait l'objet de condamnations pénales inscrites au Bulletin n°3 
                    du casier judiciaire national ;
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-justify">
                    Ne faire l'objet d'aucune interdiction de gérer ou d'administrer une entreprise ;
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-justify">
                    Ne pas avoir été déclaré(e) en faillite personnelle ou en liquidation judiciaire ;
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-justify">
                    Être en pleine capacité juridique pour exercer les fonctions de dirigeant(e) 
                    d'entreprise.
                  </p>
                </div>
              </div>

              <p className="text-justify">
                Je m'engage à fournir, sur demande des autorités compétentes, un bulletin n°3 
                du casier judiciaire datant de moins de trois mois si cela s'avérait nécessaire 
                pour l'instruction du dossier d'immatriculation.
              </p>

              <p className="text-justify">
                Je reconnais être pleinement informé(e) que toute fausse déclaration m'expose 
                à des sanctions pénales prévues par les articles 441-6 et 441-7 du Code pénal, 
                pouvant aller jusqu'à trois ans d'emprisonnement et 45 000 euros d'amende.
              </p>
            </div>

            {/* Engagement */}
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm text-center">
                <strong>Fait pour servir et valoir ce que de droit.</strong>
              </p>
            </div>

            {/* Signature */}
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div>
                <p className="text-[#273A7A]/80 text-sm mb-1">Fait à</p>
                <p className="text-[#1A2753] mb-4">Dakar</p>
                <p className="text-[#273A7A]/80 text-sm mb-1">Le</p>
                <p className="text-[#1A2753]">{today}</p>
              </div>
              <div>
                <p className="text-[#273A7A]/80 text-sm mb-4">Signature du déclarant</p>
                <div className="border-2 border-dashed border-[#D6A93A] rounded-xl h-32 flex items-center justify-center">
                  <p className="text-[#273A7A]/80 text-sm italic">
                    Zone de signature électronique
                  </p>
                </div>
              </div>
            </div>

            {/* Mentions légales */}
            <div className="mt-12 pt-6 border-t border-[#F5F6FA]">
              <p className="text-[#273A7A]/80 text-xs text-center italic">
                Ce document est généré électroniquement par la plateforme Crésus et doit être signé électroniquement 
                pour avoir valeur légale. Toute falsification est passible de poursuites judiciaires.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#F5F6FA] px-6 py-4 bg-[#F5F6FA]/50 flex items-center justify-between">
          <button
            onClick={handleDownload}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-2.5 bg-white border-2 border-[#273A7A] text-[#273A7A] rounded-xl hover:bg-[#273A7A]/5 transition-all duration-300 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Télécharger PDF
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-2.5 bg-white border border-[#F5F6FA] text-[#273A7A] rounded-xl hover:bg-[#F5F6FA] transition-all duration-300"
            >
              Annuler
            </button>
            <button
              onClick={onSend}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-2.5 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer au client
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
