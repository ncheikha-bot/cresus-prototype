import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, Check, X, FileText, AlertCircle, CheckCircle2,
  Clock, XCircle, RefreshCw, Eye, Download, MessageSquare,
  ChevronDown, ChevronUp, History
} from '../ui/icons';
import { nouvelId } from '../../lib/id';

interface DocumentFile {
  id: string;
  file: File;
  progress: number;
  uploaded: boolean;
}

interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: 'pending' | 'awaiting_validation' | 'validated' | 'rejected' | 'under_revision';
  version: number;
  rejectionReason?: string;
  versions?: DocumentVersionHistory[];
}

interface DocumentVersionHistory {
  version: number;
  uploadedAt: string;
  status: 'pending' | 'awaiting_validation' | 'validated' | 'rejected';
  comment?: string;
}

interface DocumentUploadManagerProps {
  documentType: {
    id: string;
    name: string;
    description: string;
    required: boolean;
    maxFiles?: number;
  };
  onFilesChange: (files: UploadedDocument[]) => void;
  companyId?: string;
}

export const DocumentUploadManager: React.FC<DocumentUploadManagerProps> = ({
  documentType,
  onFilesChange,
  companyId
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<DocumentFile[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null);

  const maxFiles = documentType.maxFiles || 1;
  const canUploadMore = uploadedFiles.length < maxFiles;

  // Notify parent when uploadedFiles changes
  useEffect(() => {
    onFilesChange(uploadedFiles);
  }, [uploadedFiles]);

  const getStatusColor = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'validated':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'awaiting_validation':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'under_revision':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'validated':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'awaiting_validation':
        return <Clock className="w-4 h-4" />;
      case 'under_revision':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'validated':
        return 'Validé';
      case 'rejected':
        return 'Rejeté';
      case 'awaiting_validation':
        return 'En validation';
      case 'under_revision':
        return 'En révision';
      default:
        return 'En attente';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxFiles - uploadedFiles.length;
    const filesToUpload = files.slice(0, remainingSlots);

    // Create uploading file objects
    const newUploadingFiles: DocumentFile[] = filesToUpload.map(file => ({
      id: nouvelId('file'),
      file,
      progress: 0,
      uploaded: false,
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Simulate upload progress
    newUploadingFiles.forEach(uploadFile => {
      simulateUpload(uploadFile);
    });
  };

  /**
   * Téléversement simulé, cadencé sur le temps écoulé.
   *
   * La progression avançait d'un pas par tic. Or un navigateur ralentit les
   * minuteurs d'un onglet passé en arrière-plan — ce que fait tout utilisateur
   * qui change d'application pendant l'envoi : le téléversement se figeait en
   * cours de route et le fichier n'arrivait jamais. En repartant de l'horloge,
   * un tic tardif termine l'envoi au lieu de le faire avancer d'un cran.
   */
  const simulateUpload = (uploadFile: DocumentFile) => {
    const DUREE_MS = 1000;
    const debut = Date.now();

    const interval = setInterval(() => {
      const ecoule = Date.now() - debut;
      const progress = Math.min(100, Math.round((ecoule / DUREE_MS) * 100));
      setUploadingFiles(prev =>
        prev.map(f => (f.id === uploadFile.id ? { ...f, progress } : f))
      );

      if (ecoule >= DUREE_MS) {
        clearInterval(interval);
        completeUpload(uploadFile);
      }
    }, 100);
  };

  const completeUpload = (uploadFile: DocumentFile) => {
    const newDocument: UploadedDocument = {
      id: uploadFile.id,
      name: uploadFile.file.name,
      size: formatFileSize(uploadFile.file.size),
      uploadedAt: new Date().toISOString(),
      status: 'awaiting_validation',
      version: 1,
      versions: [
        {
          version: 1,
          uploadedAt: new Date().toISOString(),
          status: 'awaiting_validation',
        }
      ]
    };

    setUploadedFiles(prev => [...prev, newDocument]);
    setUploadingFiles(prev => prev.filter(f => f.id !== uploadFile.id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleReupload = (documentId: string) => {
    // Find the document and mark it as under revision
    setUploadedFiles(prev =>
      prev.map(doc =>
        doc.id === documentId
          ? { ...doc, status: 'under_revision' as const, version: doc.version + 1 }
          : doc
      )
    );
  };

  const removeFile = (documentId: string) => {
    setUploadedFiles(prev => prev.filter(doc => doc.id !== documentId));
  };

  const allFilesValidated = uploadedFiles.length > 0 && uploadedFiles.every(f => f.status === 'validated');
  const hasRejectedFiles = uploadedFiles.some(f => f.status === 'rejected');
  const hasFilesInValidation = uploadedFiles.some(f => f.status === 'awaiting_validation');

  return (
    <div className="bg-[#F5F6FA] rounded-xl p-5 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              allFilesValidated
                ? 'bg-green-100'
                : hasRejectedFiles
                ? 'bg-red-100'
                : hasFilesInValidation
                ? 'bg-orange-100'
                : 'bg-[#D6A93A]/10'
            }`}>
              {allFilesValidated ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : hasRejectedFiles ? (
                <XCircle className="w-5 h-5 text-red-600" />
              ) : hasFilesInValidation ? (
                <Clock className="w-5 h-5 text-orange-600" />
              ) : (
                <FileText className="w-5 h-5 text-[#D6A93A]" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[#1A2753]">{documentType.name}</p>
                {documentType.required && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                    Obligatoire
                  </span>
                )}
              </div>
              <p className="text-[#273A7A]/80 text-sm">{documentType.description}</p>
              {maxFiles > 1 && (
                <p className="text-xs text-[#273A7A]/80 mt-1">
                  Maximum {maxFiles} fichiers • {uploadedFiles.length} téléversé{uploadedFiles.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {uploadedFiles.length > 0 && (
            <button aria-label={expanded ? 'Réduire la liste des fichiers' : 'Afficher la liste des fichiers'}
              onClick={() => setExpanded(!expanded)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-2 text-[#273A7A]/80 hover:text-[#1A2753] transition-colors"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
          {canUploadMore && (
            <label className="cursor-pointer">
              <input
                type="file"
                onChange={handleFileSelect}
                multiple={maxFiles > 1}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <div className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                uploadedFiles.length === 0
                  ? 'bg-[#273A7A] text-white hover:bg-[#1A2753]'
                  : 'bg-white text-[#273A7A] border border-[#273A7A]/20 hover:border-[#273A7A]'
              }`}>
                <Upload className="w-4 h-4" />
                <span className="text-sm">
                  {uploadedFiles.length === 0 ? 'Choisir' : 'Ajouter'}
                </span>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Uploading files progress */}
      <AnimatePresence>
        {uploadingFiles.map(uploadFile => (
          <motion.div
            key={uploadFile.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-3 bg-white rounded-lg border border-[#D6A93A]/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-4 h-4 text-[#D6A93A]" />
              <span className="text-sm text-[#273A7A] flex-1 truncate">{uploadFile.file.name}</span>
              <span className="text-xs text-[#273A7A]/80">{uploadFile.progress}%</span>
            </div>
            <div className="h-1.5 bg-[#F5F6FA] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadFile.progress}%` }}
                className="h-full bg-gradient-to-r from-[#D6A93A] to-[#b8902f]"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Uploaded files list */}
      <AnimatePresence>
        {expanded && uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 mt-3"
          >
            {uploadedFiles.map(doc => (
              <div key={doc.id} className="bg-white rounded-lg p-4 border-2 border-transparent hover:border-[#D6A93A]/20 transition-all">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[#273A7A] flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A2753] truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-[#273A7A]/80 mt-1">
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>v{doc.version}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        <span>{getStatusLabel(doc.status)}</span>
                      </div>
                    </div>

                    {/* Rejection reason */}
                    {doc.status === 'rejected' && doc.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-red-900 mb-1">Motif de rejet :</p>
                            <p className="text-sm text-red-700">{doc.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-1 px-3 py-1.5 text-xs text-[#273A7A] hover:text-[#1A2753] transition-colors">
                        <Eye className="w-3 h-3" />
                        Voir
                      </button>
                      <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-1 px-3 py-1.5 text-xs text-[#273A7A] hover:text-[#1A2753] transition-colors">
                        <Download className="w-3 h-3" />
                        Télécharger
                      </button>
                      {doc.versions && doc.versions.length > 1 && (
                        <button
                          onClick={() => setShowVersionHistory(showVersionHistory === doc.id ? null : doc.id)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-1 px-3 py-1.5 text-xs text-[#273A7A] hover:text-[#1A2753] transition-colors"
                        >
                          <History className="w-3 h-3" />
                          Historique ({doc.versions.length})
                        </button>
                      )}
                      {doc.status === 'rejected' && (
                        <button
                          onClick={() => handleReupload(doc.id)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Recharger
                        </button>
                      )}
                      {doc.status !== 'validated' && (
                        <button
                          onClick={() => removeFile(doc.id)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 transition-colors ml-auto"
                        >
                          <X className="w-3 h-3" />
                          Supprimer
                        </button>
                      )}
                    </div>

                    {/* Version history */}
                    <AnimatePresence>
                      {showVersionHistory === doc.id && doc.versions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-gray-200"
                        >
                          <p className="text-xs text-[#273A7A]/80 mb-2">Historique des versions</p>
                          <div className="space-y-2">
                            {doc.versions.slice().reverse().map((version) => (
                              <div
                                key={version.version}
                                className="flex items-center gap-3 text-xs bg-[#F5F6FA] rounded p-2"
                              >
                                <span className="text-[#273A7A] px-2 py-0.5 bg-white rounded">
                                  v{version.version}
                                </span>
                                <span className="text-[#273A7A]/80">
                                  {new Date(version.uploadedAt).toLocaleString('fr-FR')}
                                </span>
                                <span className={`ml-auto px-2 py-0.5 rounded ${getStatusColor(version.status)}`}>
                                  {getStatusLabel(version.status)}
                                </span>
                                {version.comment && (
                                  <span className="text-[#273A7A]/80 italic">
                                    {version.comment}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary when collapsed */}
      {!expanded && uploadedFiles.length > 0 && (
        <div className="flex items-center gap-3 text-sm">
          {allFilesValidated ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              {uploadedFiles.length} document{uploadedFiles.length > 1 ? 's validés' : ' validé'}
            </span>
          ) : hasFilesInValidation ? (
            <span className="flex items-center gap-1 text-orange-600">
              <Clock className="w-4 h-4" />
              {uploadedFiles.filter(f => f.status === 'awaiting_validation').length} en attente de validation
            </span>
          ) : hasRejectedFiles ? (
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="w-4 h-4" />
              {uploadedFiles.filter(f => f.status === 'rejected').length} document{uploadedFiles.filter(f => f.status === 'rejected').length > 1 ? 's rejetés' : ' rejeté'}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};
