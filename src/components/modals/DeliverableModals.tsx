import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Download,
  ThumbsUp,
  MessageSquare,
  RefreshCw
} from '../ui/icons';
import {
  type ProjectDeliverable,
  getDeliverableStatusLabel,
  getDeliverableStatusColor,
} from '../../data/brandingData';

interface DeliverableReviewModalProps {
  show: boolean;
  onClose: () => void;
  deliverable: ProjectDeliverable | null;
  onApprove: (comment?: string) => void;
  onRequestRevision: (notes: string) => void;
  mode?: 'mobile' | 'desktop';
  revisionsRemaining: number;
}

export const DeliverableReviewModal: React.FC<DeliverableReviewModalProps> = ({
  show,
  onClose,
  deliverable,
  onApprove,
  onRequestRevision,
  mode = 'mobile',
  revisionsRemaining,
}) => {
  const [reviewType, setReviewType] = useState<'approve' | 'revision' | null>(null);
  const [comment, setComment] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');

  const isMobile = mode === 'mobile';

  const handleSubmit = () => {
    if (reviewType === 'approve') {
      onApprove(comment || undefined);
    } else if (reviewType === 'revision' && revisionNotes.trim()) {
      onRequestRevision(revisionNotes);
    }
    
    // Reset
    setReviewType(null);
    setComment('');
    setRevisionNotes('');
  };

  const isValid = 
    reviewType === 'approve' || 
    (reviewType === 'revision' && revisionNotes.trim().length > 0);

  if (!deliverable) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={isMobile ? { y: "100%" } : { scale: 0.9, y: 20 }}
            animate={isMobile ? { y: 0 } : { scale: 1, y: 0 }}
            exit={isMobile ? { y: "100%" } : { scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className={`bg-white w-full max-w-2xl ${
              isMobile ? 'rounded-t-3xl max-h-[90vh]' : 'rounded-2xl max-h-[85vh]'
            } overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {isMobile && (
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-[#1A2753] mb-2">{deliverable.name}</h3>
                  <p className="text-[#273A7A]/60 text-sm">
                    Version {deliverable.version} • {deliverable.files.length} fichier(s)
                  </p>
                </div>
                {!isMobile && (
                  <button
                    onClick={onClose}
                    className="text-[#273A7A]/40 hover:text-[#273A7A]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Files List */}
              <div className="bg-[#F5F6FA] rounded-xl p-4 mb-6">
                <p className="text-[#1A2753] text-sm font-medium mb-3">Fichiers livrés</p>
                <div className="space-y-2">
                  {deliverable.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 bg-white rounded-lg p-3"
                    >
                      <FileText className="w-5 h-5 text-[#D6A93A]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1A2753] text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-[#273A7A]/60 text-xs">
                          {file.type} • {file.size}
                        </p>
                      </div>
                      <button className="text-[#273A7A] hover:text-[#D6A93A] transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Options */}
              {!reviewType && (
                <>
                  <p className="text-[#1A2753] font-medium mb-4 text-center">
                    Que pensez-vous de ce livrable ?
                  </p>

                  <div className="space-y-3 mb-6">
                    {/* Approve Option */}
                    <motion.button
                      whileHover={!isMobile ? { scale: 1.01 } : {}}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setReviewType('approve')}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <ThumbsUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[#1A2753] font-medium">J'approuve ce livrable</p>
                        <p className="text-[#273A7A]/60 text-sm">
                          Le travail correspond à mes attentes
                        </p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </motion.button>

                    {/* Revision Option */}
                    <motion.button
                      whileHover={!isMobile ? { scale: 1.01 } : {}}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setReviewType('revision')}
                      disabled={revisionsRemaining === 0}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[#1A2753] font-medium">Demander des modifications</p>
                        <p className="text-[#273A7A]/60 text-sm">
                          {revisionsRemaining > 0 
                            ? `${revisionsRemaining} révision(s) restante(s)`
                            : 'Aucune révision restante'
                          }
                        </p>
                      </div>
                      <MessageSquare className="w-6 h-6 text-orange-600" />
                    </motion.button>
                  </div>

                  {revisionsRemaining === 0 && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-amber-900 text-sm">
                          Vous avez utilisé toutes vos révisions incluses. Pour toute modification supplémentaire, 
                          contactez notre support.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Approve Form */}
              {reviewType === 'approve' && (
                <div className="space-y-4 mb-6">
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <p className="text-green-900 font-medium">Approuver ce livrable</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[#1A2753] text-sm block mb-2">
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Partagez vos impressions positives..."
                      className="w-full bg-[#F5F6FA] rounded-xl p-3 text-[#1A2753] text-sm outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors resize-none"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Revision Form */}
              {reviewType === 'revision' && (
                <div className="space-y-4 mb-6">
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <RefreshCw className="w-6 h-6 text-orange-600" />
                      <p className="text-orange-900 font-medium">Demander des modifications</p>
                    </div>
                    <p className="text-orange-800 text-sm">
                      {revisionsRemaining} révision(s) restante(s)
                    </p>
                  </div>

                  <div>
                    <label className="text-[#1A2753] text-sm block mb-2">
                      Quelles modifications souhaitez-vous ? *
                    </label>
                    <textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      placeholder="Décrivez précisément les changements souhaités..."
                      className="w-full bg-[#F5F6FA] rounded-xl p-3 text-[#1A2753] text-sm outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors resize-none"
                      rows={5}
                    />
                    <p className="text-[#273A7A]/60 text-xs mt-2">
                      Plus vous serez précis, plus vite nous pourrons apporter les corrections.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={!isMobile ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (reviewType) {
                      setReviewType(null);
                      setComment('');
                      setRevisionNotes('');
                    } else {
                      onClose();
                    }
                  }}
                  className="flex-1 bg-gray-200 text-[#1A2753] rounded-xl py-4 text-center font-medium"
                >
                  {reviewType ? 'Retour' : 'Fermer'}
                </motion.button>

                {reviewType && (
                  <motion.button
                    whileHover={!isMobile ? { scale: 1.02 } : {}}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className={`flex-1 rounded-xl py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                      reviewType === 'approve'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {reviewType === 'approve' ? (
                      <>
                        <ThumbsUp className="w-5 h-5" />
                        Approuver
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-5 h-5" />
                        Demander révision
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
