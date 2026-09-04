import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Download, Eye, CircleCheck, Clock, Building2, ChevronDown } from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { BottomBar } from './BottomBar';
import { getDocumentsClient, type DocumentClient } from '../../domain/clientDocuments';

interface DocumentsProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

type Document = DocumentClient;

export const Documents: React.FC<DocumentsProps> = ({ onBack, onNavigate }) => {
  const { companies, getCompanyProcess } = useApp();
  const [expandedCompany, setExpandedCompany] = useState<string | null>(companies[0]?.id || null);

  /** Pièces du dossier : celles déposées par le client, puis les officielles. */
  const getDocumentsByCompany = (companyId: string): Document[] => {
    const societe = companies.find(c => c.id === companyId);
    if (!societe) return [];
    const processus = getCompanyProcess(companyId);
    return getDocumentsClient(societe, processus.officialDocs, processus.documentDecisions);
  };

  const getDocumentColor = (type: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string } } = {
      'Statuts': { bg: 'bg-blue-500/8', text: 'text-blue-500', border: 'border-blue-500/10' },
      'Attestation': { bg: 'bg-emerald-500/8', text: 'text-emerald-500', border: 'border-emerald-500/10' },
      'Contrat': { bg: 'bg-purple-500/8', text: 'text-purple-500', border: 'border-purple-500/10' },
      'Certificat': { bg: 'bg-orange-500/8', text: 'text-orange-500', border: 'border-orange-500/10' },
    };
    return colors[type] || { bg: 'bg-gray-500/8', text: 'text-gray-500', border: 'border-gray-500/10' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F1F8] to-[#F5F6FA] pb-28">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2753] via-[#1E3068] to-[#273A7A] pt-[max(3rem,env(safe-area-inset-top))] pb-6 px-5 rounded-b-[2rem]">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#D6A93A]/8 rounded-full blur-[70px] -translate-y-1/3 translate-x-1/4" />
        <div className="relative">
          <button aria-label="Retour"
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] mb-5 w-10 h-10 icon-glass rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <h2 className="text-white text-lg mb-0.5">Mes documents</h2>
          <p className="text-white/70 text-xs">Statuts, contrats et attestations</p>
        </div>
      </div>

      {/* Documents by Company */}
      <div className="px-5 mt-5 space-y-3">
        {companies.map((company) => {
          const documents = getDocumentsByCompany(company.id);
          const isExpanded = expandedCompany === company.id;

          return (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              {/* Company Header */}
              <button
                onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 flex items-center justify-between active:bg-white/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D6A93A]/8 rounded-xl flex items-center justify-center border border-[#D6A93A]/10">
                    <Building2 className="w-5 h-5 text-[#D6A93A]" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[#1A2753] text-sm">{company.name}</h3>
                    <p className="text-[#273A7A]/80 text-xs">{documents.length} documents</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-[#273A7A]/25" />
                </motion.div>
              </button>

              {/* Documents List */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/30"
                >
                  <div className="p-3.5 space-y-2">
                    {documents.map((doc) => {
                      const color = getDocumentColor(doc.type);
                      const isCompleted = doc.status === 'completed';

                      return (
                        <motion.div
                          key={doc.id}
                          whileTap={{ scale: 0.99 }}
                          className="bg-[#F5F6FA]/60 rounded-xl p-3.5"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 ${color.bg} rounded-lg flex items-center justify-center flex-shrink-0 border ${color.border}`}>
                              <FileText className={`w-4 h-4 ${color.text}`} strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex-1">
                                  <p className="text-[#1A2753] text-sm mb-0.5">{doc.name}</p>
                                  <div className="flex items-center gap-2 text-xs text-[#273A7A]/80">
                                    <span>{[doc.type, doc.size].filter(Boolean).join(' • ')}</span>
                                  </div>
                                </div>
                                {isCompleted ? (
                                  <CircleCheck className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 ml-2" strokeWidth={1.8} />
                                ) : (
                                  <Clock className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 ml-2" strokeWidth={1.8} />
                                )}
                              </div>
                              <p className="text-[#273A7A]/80 text-[11px] mb-2.5">{doc.date}</p>

                              {/* Actions */}
                              {isCompleted && (
                                <div className="flex gap-2">
                                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-3 py-1.5 glass rounded-lg text-[#1A2753] text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                                    <Eye className="w-3.5 h-3.5" />
                                    Voir
                                  </button>
                                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-3 py-1.5 bg-[#D6A93A] rounded-lg text-[#1A2753] text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                                    <Download className="w-3.5 h-3.5" />
                                    Télécharger
                                  </button>
                                </div>
                              )}
                              {!isCompleted && (
                                <div className="px-3 py-1.5 glass-accent rounded-lg text-amber-600 text-[11px] text-center">
                                  En cours de validation
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {companies.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-[#F5F6FA]/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-[#273A7A]/20" strokeWidth={1.8} />
            </div>
            <p className="text-[#1A2753] text-sm mb-1">Aucun document</p>
            <p className="text-[#273A7A]/80 text-xs">
              Vos documents apparaîtront ici une fois votre première entreprise créée.
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-5 mt-5">
        <div className="glass-accent rounded-2xl p-4">
          <p className="text-[#1A2753] text-xs">
            Tous vos documents sont stockés de manière sécurisée et accessibles à tout moment.
          </p>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      {onNavigate && <BottomBar currentScreen="documents" onNavigate={onNavigate} />}
    </div>
  );
};
