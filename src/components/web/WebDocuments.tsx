import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Download, Eye, CheckCircle, Clock, Building2, ChevronDown, ChevronUp, Search } from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { getDocumentsClient, type DocumentClient } from '../../domain/clientDocuments';

interface WebDocumentsProps {
  onBack: () => void;
}

type Document = DocumentClient;

export const WebDocuments: React.FC<WebDocumentsProps> = ({ onBack }) => {
  const { companies, getCompanyProcess } = useApp();
  const [expandedCompany, setExpandedCompany] = useState<string | null>(companies[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  /** Pièces du dossier : celles déposées par le client, puis les officielles. */
  const getDocumentsByCompany = (companyId: string): Document[] => {
    const societe = companies.find(c => c.id === companyId);
    if (!societe) return [];
    const processus = getCompanyProcess(companyId);
    return getDocumentsClient(societe, processus.officialDocs, processus.documentDecisions);
  };

  const getDocumentIcon = (type: string) => {
    return FileText;
  };

  const getDocumentColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Statuts': 'from-blue-500 to-blue-600',
      'Attestation': 'from-emerald-500 to-emerald-600',
      'Contrat': 'from-purple-500 to-purple-600',
      'Certificat': 'from-orange-500 to-orange-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="flex-1">
          <h1 className="text-[#1A2753]">Mes documents</h1>
          <p className="text-[#273A7A]/80">Statuts, contrats et attestations</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une société..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-[#D6A93A] focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Documents by Company */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCompanies.map((company) => {
          const documents = getDocumentsByCompany(company.id);
          const isExpanded = expandedCompany === company.id;

          return (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Company Header */}
              <button
                onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-6 flex items-center justify-between hover:bg-[#F5F6FA] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-[#D6A93A]" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[#1A2753] mb-1">{company.name}</h3>
                    <p className="text-[#273A7A]/80 text-sm">{documents.length} documents disponibles</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-[#273A7A]/80">
                      {documents.filter(d => d.status === 'completed').length} complétés
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-[#273A7A]" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-[#273A7A]" />
                  )}
                </div>
              </button>

              {/* Documents List */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[#F5F6FA]"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map((doc) => {
                        const Icon = getDocumentIcon(doc.type);
                        const color = getDocumentColor(doc.type);
                        const isCompleted = doc.status === 'completed';

                        return (
                          <motion.div
                            key={doc.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-[#F5F6FA] rounded-xl p-5"
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <p className="text-[#1A2753] mb-1">{doc.name}</p>
                                    <div className="flex items-center gap-2 text-sm text-[#273A7A]/80">
                                      <span>
                                        {[doc.type, doc.size, doc.date].filter(Boolean).join(' • ')}
                                      </span>
                                    </div>
                                  </div>
                                  {isCompleted ? (
                                    <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 ml-3" />
                                  ) : (
                                    <Clock className="w-6 h-6 text-orange-500 flex-shrink-0 ml-3" />
                                  )}
                                </div>
                                
                                {/* Actions */}
                                {isCompleted && (
                                  <div className="flex gap-3 mt-3">
                                    <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-2 bg-white rounded-lg text-[#1A2753] text-sm flex items-center justify-center gap-2 hover:bg-[#1A2753] hover:text-white transition-all duration-300 shadow-sm">
                                      <Eye className="w-4 h-4" />
                                      Voir
                                    </button>
                                    <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-2 bg-[#D6A93A] rounded-lg text-white text-sm flex items-center justify-center gap-2 hover:bg-[#b8902f] transition-all duration-300 shadow-sm">
                                      <Download className="w-4 h-4" />
                                      Télécharger
                                    </button>
                                  </div>
                                )}
                                {!isCompleted && (
                                  <div className="mt-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 text-sm text-center">
                                    En cours de validation
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {filteredCompanies.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <div className="w-20 h-20 bg-[#F5F6FA] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-[#273A7A]/40" />
            </div>
            <h3 className="text-[#1A2753] mb-2">Aucun document trouvé</h3>
            <p className="text-[#273A7A]/80">
              {searchQuery 
                ? 'Essayez une autre recherche' 
                : 'Vos documents apparaîtront ici une fois votre première entreprise créée.'}
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-[#1A2753] mb-1">Stockage sécurisé</h4>
              <p className="text-[#273A7A]/80 text-sm">
                Tous vos documents sont stockés de manière sécurisée et accessibles à tout moment. Vous pouvez les télécharger ou les consulter en ligne.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
