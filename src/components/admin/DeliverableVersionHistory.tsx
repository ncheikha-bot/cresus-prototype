import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Download,
  Eye
} from '../ui/icons';
import type { ProjectDeliverable } from '../../data/brandingData';
import { getDeliverableStatusLabel, getDeliverableStatusColor } from '../../data/brandingData';

interface DeliverableVersionHistoryProps {
  deliverables: ProjectDeliverable[];
  onViewVersion: (deliverable: ProjectDeliverable) => void;
}

export const DeliverableVersionHistory: React.FC<DeliverableVersionHistoryProps> = ({
  deliverables,
  onViewVersion,
}) => {
  // Grouper les livrables par nom (pour identifier les versions d'un même livrable)
  const groupedByName = deliverables.reduce((acc, deliverable) => {
    const baseName = deliverable.name.replace(/\s*-\s*v\d+$/i, '');
    if (!acc[baseName]) {
      acc[baseName] = [];
    }
    acc[baseName].push(deliverable);
    return acc;
  }, {} as Record<string, ProjectDeliverable[]>);

  // Trier chaque groupe par version décroissante
  Object.keys(groupedByName).forEach(key => {
    groupedByName[key].sort((a, b) => b.version - a.version);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedByName).map(([baseName, versions]) => {
        const latestVersion = versions[0];
        const hasMultipleVersions = versions.length > 1;

        return (
          <div key={baseName} className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
            {/* Dernière version */}
            <div className="p-5 bg-gradient-to-r from-[#F5F6FA] to-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-[#1A2753]">{latestVersion.name}</h4>
                    <span className="px-3 py-1 text-xs rounded-full bg-[#D6A93A] text-white">
                      Dernière version (v{latestVersion.version})
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full bg-${getDeliverableStatusColor(latestVersion.status)}-100 text-${getDeliverableStatusColor(latestVersion.status)}-700`}>
                      {getDeliverableStatusLabel(latestVersion.status)}
                    </span>
                  </div>
                  {latestVersion.description && (
                    <p className="text-[#273A7A]/80 text-sm mb-2">
                      {latestVersion.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-[#273A7A]/80">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(latestVersion.uploadedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {latestVersion.uploadedBy}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {latestVersion.files.length} fichier(s)
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onViewVersion(latestVersion)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-white text-[#1A2753] rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-sm border-2 border-gray-200"
                >
                  <Eye className="w-4 h-4" />
                  Voir
                </button>
              </div>

              {/* Feedback */}
              {latestVersion.feedback && (
                <div className={`mt-3 p-3 rounded-lg ${
                  latestVersion.feedback.approved 
                    ? 'bg-green-50 border-l-4 border-green-500' 
                    : 'bg-orange-50 border-l-4 border-orange-500'
                }`}>
                  <div className="flex items-start gap-2">
                    {latestVersion.feedback.approved ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-xs ${
                        latestVersion.feedback.approved ? 'text-green-700' : 'text-orange-700'
                      }`}>
                        {latestVersion.feedback.approved ? 'Approuvé par le client' : 'Révision demandée'}
                      </p>
                      {(latestVersion.feedback.comment || latestVersion.feedback.revisionNotes) && (
                        <p className="text-xs text-[#273A7A] mt-1">
                          {latestVersion.feedback.comment || latestVersion.feedback.revisionNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Versions précédentes */}
            {hasMultipleVersions && (
              <div className="border-t border-gray-200">
                <details className="group">
                  <summary className="px-5 py-3 cursor-pointer text-sm text-[#273A7A]/80 hover:bg-[#F5F6FA] transition-all flex items-center justify-between">
                    <span>Versions précédentes ({versions.length - 1})</span>
                    <svg 
                      className="w-4 h-4 transition-transform group-open:rotate-180" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  
                  <div className="px-5 pb-4 space-y-2">
                    {versions.slice(1).map((version, index) => (
                      <motion.div
                        key={version.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-[#F5F6FA] rounded-lg p-4 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 text-xs rounded bg-[#273A7A]/10 text-[#273A7A]">
                                v{version.version}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded bg-${getDeliverableStatusColor(version.status)}-100 text-${getDeliverableStatusColor(version.status)}-700`}>
                                {getDeliverableStatusLabel(version.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-[#273A7A]/80">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(version.uploadedAt).toLocaleDateString('fr-FR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {version.files.length} fichier(s)
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => onViewVersion(version)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1.5 bg-white text-[#273A7A] rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 text-xs"
                          >
                            <Eye className="w-3 h-3" />
                            Voir
                          </button>
                        </div>

                        {/* Feedback des versions précédentes */}
                        {version.feedback && (
                          <div className={`mt-2 p-2 rounded text-xs ${
                            version.feedback.approved 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-orange-50 text-orange-700'
                          }`}>
                            {version.feedback.approved ? 'Approuvé' : 'Révision demandée'}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
