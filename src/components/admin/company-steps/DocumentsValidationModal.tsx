import React from 'react';
import { motion } from 'motion/react';
import { FileCheck, FileText, Check, X, Eye, Clock, AlertCircle, CheckCircle, History } from '../../ui/icons';
import { ModalShell } from './ModalShell';
import type { AdminDocument } from './DocumentPreviewModal';

interface DocumentsValidationModalProps {
  onClose: () => void;
  documents: AdminDocument[];
  /** Document dont le rejet est en cours de motivation. */
  selectedDocId: string | null;
  rejectionReason: string;
  onRejectionReasonChange: (reason: string) => void;
  onSelectForRejection: (docId: string | null) => void;
  onValidate: (docId: string) => void;
  onReject: () => void;
  onPreview: (doc: AdminDocument | null) => void;
}

/** Revue des documents fournis par le client : validation ou rejet motivé. */
export const DocumentsValidationModal: React.FC<DocumentsValidationModalProps> = ({
  onClose,
  documents,
  selectedDocId,
  rejectionReason,
  onRejectionReasonChange,
  onSelectForRejection,
  onValidate,
  onReject,
  onPreview,
}) => (
  <ModalShell
    animationKey="documents-validation-modal"
    title="Validation des documents"
    icon={FileCheck}
    onClose={onClose}
    maxWidth="max-w-3xl"
    footer={
      <>
      <button
        onClick={() => onClose()}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-6 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all duration-300"
      >
        Fermer
      </button>
      </>
    }
  >
    <div className="p-6">
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-[#273A7A]/30 mx-auto mb-4" />
          <p className="text-[#273A7A]/80">Aucun document soumis pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map(doc => (
            <div key={doc.id} className={`border-2 rounded-xl overflow-hidden transition-all ${
              doc.status === 'validated' ? 'border-green-200 bg-green-50/50' :
              doc.status === 'rejected' ? 'border-red-200 bg-red-50/50' :
              'border-[#273A7A]/20 bg-white hover:border-[#D6A93A]/40 hover:shadow-md'
            }`}>
              {/* En-tête du document */}
              <div className="p-4 bg-gradient-to-r from-[#F5F6FA] to-white">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      doc.status === 'validated' ? 'bg-green-100' :
                      doc.status === 'rejected' ? 'bg-red-100' :
                      'bg-[#D6A93A]/10'
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        doc.status === 'validated' ? 'text-green-600' :
                        doc.status === 'rejected' ? 'text-red-600' :
                        'text-[#D6A93A]'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#1A2753] font-medium mb-1">{doc.name}</p>
                      <div className="flex items-center gap-3 text-xs text-[#273A7A]/80">
                        <span>Type : {doc.type}</span>
                        <span>•</span>
                        <span>Uploadé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</span>
                        {doc.versions && doc.versions.length > 1 && (
                          <>
                            <span>•</span>
                            <span className="text-[#D6A93A]">Version {doc.currentVersion || 1}</span>
                          </>
                        )}
                      </div>
                      {/* Métadonnées supplémentaires */}
                      {(doc.size || doc.pages) && (
                        <div className="flex items-center gap-3 text-xs text-[#273A7A]/80 mt-1">
                          {doc.size && <span>{doc.size}</span>}
                          {doc.size && doc.pages && <span>•</span>}
                          {doc.pages && <span>{doc.pages} page{doc.pages > 1 ? 's' : ''}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === 'validated' && (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Validé
                      </span>
                    )}
                    {doc.status === 'rejected' && (
                      <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Rejeté
                      </span>
                    )}
                    {doc.status === 'pending' && (
                      <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs rounded-lg font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        En attente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Corps du document */}
              <div className="p-4 space-y-3">
                {/* Historique des versions si multiple */}
                {doc.versions && doc.versions.length > 1 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-medium mb-2 flex items-center gap-2">
                      <History className="w-3.5 h-3.5" />
                      Historique des versions ({doc.versions.length})
                    </p>
                    <div className="space-y-1.5">
                      {doc.versions.map((version) => (
                        <div key={version.versionNumber} className="flex items-center justify-between text-xs">
                          <span className="text-blue-700">
                            Version {version.versionNumber}
                            {version.versionNumber === doc.currentVersion && ' (actuelle)'}
                          </span>
                          <span className="text-blue-600">
                            {new Date(version.uploadedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews si présents */}
                {doc.reviews && doc.reviews.length > 0 && (
                  <div className="bg-[#F5F6FA] rounded-lg p-3">
                    <p className="text-xs text-[#1A2753] font-medium mb-2">Historique des validations</p>
                    <div className="space-y-1.5">
                      {doc.reviews.map((review) => (
                        <div key={review.id} className="flex items-center justify-between text-xs">
                          <span className={review.status === 'validated' ? 'text-green-600' : 'text-red-600'}>
                            {review.status === 'validated' ? 'Validé' : 'Rejeté'}
                          </span>
                          <span className="text-[#273A7A]/80">
                            {new Date(review.reviewedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motif de rejet si document rejeté */}
                {doc.status === 'rejected' && doc.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-800 font-medium mb-1.5 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Motif du rejet
                    </p>
                    <p className="text-xs text-red-700">{doc.rejectionReason}</p>
                  </div>
                )}

                {/* Aperçu et actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onPreview(doc)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-2 bg-[#F5F6FA] hover:bg-[#273A7A]/10 text-[#1A2753] rounded-lg transition-all flex items-center justify-center gap-2 text-sm border border-[#273A7A]/10"
                  >
                    <Eye className="w-4 h-4" />
                    Aperçu
                  </button>
                  {doc.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onValidate(doc.id)}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Check className="w-4 h-4" />
                        Valider
                      </button>
                      <button
                        onClick={() => onSelectForRejection(doc.id)}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Rejeter
                      </button>
                    </>
                  )}
                </div>

                {/* Formulaire de rejet */}
                {selectedDocId === doc.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-3 border-t border-[#273A7A]/10"
                  >
                    <div>
                      <label className="text-xs text-[#273A7A] mb-1.5 block font-medium">
                        Motif du rejet *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => onRejectionReasonChange(e.target.value)}
                        placeholder="Décrivez précisément le problème (ex: document illisible, informations manquantes, document expiré...)"
                        className="w-full px-3 py-2 bg-white border-2 border-red-300 rounded-lg focus:border-red-500 focus:outline-none resize-none text-sm"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onSelectForRejection(null);
                          onRejectionReasonChange('');
                        }}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={onReject}
                        disabled={!rejectionReason.trim()}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirmer le rejet
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </ModalShell>
);
