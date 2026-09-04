import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X, Download, Send, FileText, DollarSign, Calendar, Building, CheckCircle, Info } from '../ui/icons';
import cresusLogo from 'figma:asset/ba7f806837c0b04d16ea0e06c3cf0d16e104e6a4.png';
import { formatFCFA } from '../../lib/format';
import { referenceCourte } from '../../lib/id';
import { toast } from 'sonner';

interface QuotePreviewProps {
  company: {
    name: string;
    legalForm: string;
    capital: string;
    address: string;
  };
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  quote: {
    registrationFees: number;
    legalFees: number;
    publicationFees: number;
    stampDuty: number;
    adminFees: number;
    notes?: string;
  };
  onClose: () => void;
  onSend: () => void;
}

export const QuotePreview: React.FC<QuotePreviewProps> = ({
  company,
  client,
  quote,
  onClose,
  onSend,
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);
  const validUntilStr = validUntil.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalFees = 
    quote.registrationFees +
    quote.legalFees +
    quote.publicationFees +
    quote.stampDuty +
    quote.adminFees;

  const capitalNum = parseInt(company.capital.replace(/\s/g, ''));
  const scenario = capitalNum >= totalFees
    ? {
        type: 'deduction',
        capitalNet: capitalNum - totalFees,
        amountToPay: capitalNum,
      }
    : {
        type: 'addition',
        capitalNet: capitalNum,
        amountToPay: capitalNum + totalFees,
      };

  const handleDownload = () => {
    toast.info('Téléchargement du devis…', {
      description: 'Dans une version de production, ce document serait généré en PDF.',
    });
  };

  return (
    <motion.div
      key="quote-preview-modal"
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
            <DollarSign className="w-6 h-6 text-[#D6A93A]" />
            <h2 className="text-white text-xl">Devis d'immatriculation</h2>
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
            <div className="flex items-start justify-between mb-8">
              <div>
                <img src={cresusLogo} alt="Crésus" className="h-16 mb-4" />
                <p className="text-[#273A7A]/80 text-sm">
                  Plateforme de création d'entreprise
                </p>
                <p className="text-[#273A7A]/80 text-sm">Dakar, Sénégal</p>
                <p className="text-[#273A7A]/80 text-sm">+221 33 XXX XX XX</p>
                <p className="text-[#273A7A]/80 text-sm">contact@cresus.sn</p>
              </div>
              <div className="text-right">
                <div className="bg-gradient-to-br from-[#D6A93A] to-[#b8902f] text-white px-4 py-2 rounded-xl mb-4">
                  <p className="text-sm opacity-90">Devis N°</p>
                  <p className="text-xl">{referenceCourte('DEV', `${company.name}|${client.email}`)}</p>
                </div>
                <p className="text-[#273A7A]/80 text-sm">Date d'émission</p>
                <p className="text-[#1A2753] mb-2">{today}</p>
                <p className="text-[#273A7A]/80 text-sm">Valable jusqu'au</p>
                <p className="text-[#1A2753]">{validUntilStr}</p>
              </div>
            </div>

            {/* Titre */}
            <div className="mb-8">
              <h1 className="text-[#1A2753] text-3xl mb-2">DEVIS</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-[#D6A93A] to-[#b8902f]"></div>
              <p className="text-[#273A7A] mt-2">
                Frais d'immatriculation et de création d'entreprise
              </p>
            </div>

            {/* Client Info */}
            <div className="mb-8 bg-[#F5F6FA] rounded-xl p-6">
              <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#D6A93A] rounded-full"></div>
                Informations client
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#273A7A]/80 mb-1">Nom complet</p>
                  <p className="text-[#1A2753]">
                    {client.firstName} {client.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[#273A7A]/80 mb-1">Email</p>
                  <p className="text-[#1A2753]">{client.email}</p>
                </div>
                <div>
                  <p className="text-[#273A7A]/80 mb-1">Téléphone</p>
                  <p className="text-[#1A2753]">{client.phone}</p>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="mb-8 bg-gradient-to-br from-[#D6A93A]/10 to-[#273A7A]/10 rounded-xl p-6 border-l-4 border-[#D6A93A]">
              <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#D6A93A]" />
                Projet de création
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#273A7A]/80 mb-1">Dénomination sociale</p>
                  <p className="text-[#1A2753]">{company.name}</p>
                </div>
                <div>
                  <p className="text-[#273A7A]/80 mb-1">Forme juridique</p>
                  <p className="text-[#1A2753]">{company.legalForm}</p>
                </div>
                <div>
                  <p className="text-[#273A7A]/80 mb-1">Capital social</p>
                  <p className="text-[#1A2753]">{formatFCFA(company.capital ?? 0)}</p>
                </div>
                <div>
                  <p className="text-[#273A7A]/80 mb-1">Siège social</p>
                  <p className="text-[#1A2753]">{company.address}</p>
                </div>
              </div>
            </div>

            {/* Détail des frais */}
            <div className="mb-8">
              <h3 className="text-[#1A2753] mb-4">Détail des frais</h3>
              <div className="border-2 border-[#F5F6FA] rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white px-6 py-3 grid grid-cols-2 text-sm">
                  <div>Désignation</div>
                  <div className="text-right">Montant (FCFA)</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-[#F5F6FA]">
                  <div className="px-6 py-4 grid grid-cols-2 hover:bg-[#F5F6FA]/50 transition-colors">
                    <div className="text-[#273A7A]">Frais d'enregistrement</div>
                    <div className="text-right text-[#1A2753]">
                      {quote.registrationFees.toLocaleString()}
                    </div>
                  </div>
                  <div className="px-6 py-4 grid grid-cols-2 hover:bg-[#F5F6FA]/50 transition-colors">
                    <div className="text-[#273A7A]">Frais juridiques (rédaction statuts)</div>
                    <div className="text-right text-[#1A2753]">
                      {quote.legalFees.toLocaleString()}
                    </div>
                  </div>
                  <div className="px-6 py-4 grid grid-cols-2 hover:bg-[#F5F6FA]/50 transition-colors">
                    <div className="text-[#273A7A]">Frais de publication (journal d'annonces légales)</div>
                    <div className="text-right text-[#1A2753]">
                      {quote.publicationFees.toLocaleString()}
                    </div>
                  </div>
                  <div className="px-6 py-4 grid grid-cols-2 hover:bg-[#F5F6FA]/50 transition-colors">
                    <div className="text-[#273A7A]">Droits de timbre</div>
                    <div className="text-right text-[#1A2753]">
                      {quote.stampDuty.toLocaleString()}
                    </div>
                  </div>
                  <div className="px-6 py-4 grid grid-cols-2 hover:bg-[#F5F6FA]/50 transition-colors">
                    <div className="text-[#273A7A]">Frais administratifs et de dossier</div>
                    <div className="text-right text-[#1A2753]">
                      {quote.adminFees.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-[#D6A93A]/20 to-[#b8902f]/20 px-6 py-4 grid grid-cols-2 border-t-2 border-[#D6A93A]">
                  <div className="text-[#1A2753]">
                    <strong>TOTAL DES FRAIS D'IMMATRICULATION</strong>
                  </div>
                  <div className="text-right text-[#D6A93A] text-xl">
                    <strong>{totalFees.toLocaleString()} FCFA</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation de paiement */}
            <div className="mb-8">
              <h3 className="text-[#1A2753] mb-4">Simulation de paiement</h3>
              <div
                className={`rounded-xl p-6 ${
                  scenario.type === 'deduction'
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200'
                    : 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <Info className={`w-6 h-6 flex-shrink-0 ${
                    scenario.type === 'deduction' ? 'text-blue-600' : 'text-amber-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-[#1A2753] mb-2">
                      <strong>
                        {scenario.type === 'deduction'
                          ? 'Capital suffisant - Frais déduits du capital'
                          : 'Capital insuffisant - Frais ajoutés au capital'}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#273A7A]/80">Capital social déclaré :</span>
                    <span className="text-[#1A2753]">
                      {capitalNum.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#273A7A]/80">Frais d'immatriculation :</span>
                    <span className={scenario.type === 'deduction' ? 'text-red-600' : 'text-amber-600'}>
                      {scenario.type === 'deduction' ? '- ' : '+ '}
                      {totalFees.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="h-px bg-[#F5F6FA]"></div>
                  <div className="flex justify-between pt-2">
                    <span className="text-[#1A2753]">
                      <strong>
                        {scenario.type === 'deduction'
                          ? 'Capital net à libérer :'
                          : 'Montant total à verser :'}
                      </strong>
                    </span>
                    <span className={`text-xl ${
                      scenario.type === 'deduction' ? 'text-green-600' : 'text-[#D6A93A]'
                    }`}>
                      <strong>
                        {(scenario.type === 'deduction'
                          ? scenario.capitalNet
                          : scenario.amountToPay
                        ).toLocaleString()}{' '}
                        FCFA
                      </strong>
                    </span>
                  </div>
                </div>

                {scenario.type === 'addition' && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">
                      Vous devrez verser <strong>{totalFees.toLocaleString()} FCFA</strong> en 
                      plus de votre capital social de <strong>{capitalNum.toLocaleString()} FCFA</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <div className="mb-8 bg-[#F5F6FA] rounded-xl p-6">
                <h3 className="text-[#1A2753] mb-3">Notes et précisions</h3>
                <p className="text-[#273A7A] text-sm whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}

            {/* Conditions */}
            <div className="mb-8 border-2 border-[#273A7A]/20 rounded-xl p-6">
              <h3 className="text-[#1A2753] mb-4">Conditions générales</h3>
              <div className="space-y-3 text-sm text-[#273A7A]">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Ce devis est valable pendant 30 jours à compter de sa date d'émission.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>
                    L'acceptation de ce devis entraîne le démarrage des démarches d'immatriculation.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Les frais sont payables avant le dépôt du dossier auprès des autorités compétentes.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Crésus s'engage à accompagner votre projet jusqu'à l'obtention de tous les documents officiels.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Le délai moyen d'immatriculation est de 7 à 15 jours ouvrés après validation du dossier complet.
                  </p>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#F5F6FA]">
              <div>
                <p className="text-[#273A7A]/80 text-sm mb-2">Pour Crésus</p>
                <div className="border-2 border-[#D6A93A] rounded-xl p-4 bg-gradient-to-br from-[#D6A93A]/5 to-transparent">
                  <p className="text-[#1A2753] mb-1">Équipe Crésus</p>
                  <p className="text-[#273A7A]/80 text-sm">Service Création d'Entreprise</p>
                </div>
              </div>
              <div>
                <p className="text-[#273A7A]/80 text-sm mb-4">Acceptation client</p>
                <div className="border-2 border-dashed border-[#273A7A] rounded-xl h-24 flex items-center justify-center">
                  <p className="text-[#273A7A]/80 text-sm italic">
                    Signature électronique requise
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[#F5F6FA]">
              <p className="text-[#273A7A]/80 text-xs text-center">
                Crésus - Plateforme de création d'entreprise • Dakar, Sénégal<br />
                NINEA : XXX XXX XXX • RC : SN-DKR-XXXX-X-XXXX<br />
                Ce document est généré électroniquement et n'a de valeur qu'après acceptation par le client.
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
