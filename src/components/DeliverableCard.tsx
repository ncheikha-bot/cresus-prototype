import React from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
} from './ui/icons';
import {
  type ProjectDeliverable,
  getDeliverableStatusLabel,
  getDeliverableStatusColor,
} from '../data/brandingData';

interface DeliverableCardProps {
  deliverable: ProjectDeliverable;
  onReview?: (deliverable: ProjectDeliverable) => void;
  onDownloadFile?: (fileId: string, fileName: string) => void;
  onDownloadAll?: (deliverable: ProjectDeliverable) => void;
  mode?: 'mobile' | 'desktop';
}

export const DeliverableCard: React.FC<DeliverableCardProps> = ({
  deliverable,
  onReview,
  onDownloadFile,
  onDownloadAll,
  mode = 'mobile',
}) => {
  const statusColor = getDeliverableStatusColor(deliverable.status);
  const statusLabel = getDeliverableStatusLabel(deliverable.status);

  const getStatusIcon = () => {
    switch (deliverable.status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'revision-requested':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'pending-review':
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusBg = () => {
    switch (statusColor) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'orange':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const isMobile = mode === 'mobile';

  return (
    <div className="bg-white rounded-2xl border-2 border-[#F5F6FA] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-[#D6A93A]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[#1A2753] font-medium mb-1">
              {deliverable.name}
            </h4>
            <p className="text-[#273A7A]/60 text-sm">
              {deliverable.description}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusBg()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{statusLabel}</span>
      </div>

      {/* Files */}
      <div className="space-y-2">
        <p className="text-[#273A7A]/60 text-xs">
          {deliverable.files.length} fichier(s) • Version {deliverable.version}
        </p>
        <div className="space-y-2">
          {deliverable.files.map((file) => (
            <motion.button
              key={file.id}
              whileHover={!isMobile ? { scale: 1.01 } : {}}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDownloadFile?.(file.id, file.name)}
              className="w-full flex items-center gap-3 bg-[#F5F6FA] hover:bg-[#F5F6FA]/70 rounded-lg p-3 transition-colors"
            >
              <FileText className="w-5 h-5 text-[#273A7A]/60 flex-shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[#1A2753] text-sm font-medium truncate">
                  {file.name}
                </p>
                <p className="text-[#273A7A]/60 text-xs">
                  {file.type} • {file.size}
                </p>
              </div>
              <Download className="w-5 h-5 text-[#273A7A]/60 flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-[#273A7A]/60 pt-2 border-t border-[#F5F6FA]">
        <span>
          Envoyé par {deliverable.uploadedBy}
        </span>
        <span>•</span>
        <span>
          {new Date(deliverable.uploadedAt).toLocaleDateString('fr-FR')}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {deliverable.files.length > 1 && (
          <motion.button
            whileHover={!isMobile ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDownloadAll?.(deliverable)}
            className="flex-1 bg-[#273A7A]/10 text-[#273A7A] rounded-lg py-2.5 px-3 text-sm font-medium hover:bg-[#273A7A]/20 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Tout télécharger
          </motion.button>
        )}

        {deliverable.status === 'pending-review' && onReview && (
          <motion.button
            whileHover={!isMobile ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
            onClick={() => onReview(deliverable)}
            className="flex-1 bg-[#D6A93A] text-white rounded-lg py-2.5 px-3 text-sm font-medium hover:bg-[#D6A93A]/90 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Donner mon avis
          </motion.button>
        )}
      </div>

      {/* Feedback (if reviewed) */}
      {deliverable.feedback && (
        <div className={`rounded-xl p-3 ${
          deliverable.feedback.approved
            ? 'bg-green-50 border border-green-200'
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <div className="flex items-start gap-2">
            {deliverable.feedback.approved ? (
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${
                deliverable.feedback.approved ? 'text-green-900' : 'text-orange-900'
              }`}>
                {deliverable.feedback.approved ? 'Approuvé' : 'Révision demandée'}
              </p>
              {deliverable.feedback.comment && (
                <p className={`text-sm ${
                  deliverable.feedback.approved ? 'text-green-800' : 'text-orange-800'
                }`}>
                  {deliverable.feedback.comment}
                </p>
              )}
              {deliverable.feedback.revisionNotes && (
                <p className="text-sm text-orange-800 mt-1">
                  {deliverable.feedback.revisionNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
