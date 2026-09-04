import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  Trash2,
  CheckCircle,
  Loader,
  AlertCircle,
  Package,
} from '../ui/icons';
import type { BrandingProject } from '../../data/brandingData';
import { nouvelId } from '../../lib/id';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
}

interface DeliverableUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BrandingProject;
  onUploadComplete: (deliverableName: string, description: string, files: File[]) => void;
}

export const DeliverableUploadModal: React.FC<DeliverableUploadModalProps> = ({
  isOpen,
  onClose,
  project,
  onUploadComplete,
}) => {
  const [deliverableName, setDeliverableName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculer la version suivante
  const nextVersion = Math.max(...project.deliverables.map(d => d.version), 0) + 1;

  // Gérer le drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  // Ajouter des fichiers
  const addFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: nouvelId('file'),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  // Gérer la sélection de fichiers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  // Supprimer un fichier
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return ImageIcon;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
      return FileText;
    }
    return File;
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Simuler l'upload avec progression
  const simulateUpload = (fileId: string): Promise<void> => {
    return new Promise((resolve) => {
      setFiles(prev =>
        prev.map(f => f.id === fileId ? { ...f, status: 'uploading' } : f)
      );

      // Progression cadencée sur le temps écoulé, et non sur le nombre de tics :
      // un navigateur ralentit les minuteurs d'un onglet en arrière-plan, et
      // l'envoi restait figé en chemin sans jamais se terminer.
      const DUREE_MS = 1000;
      const debut = Date.now();

      const interval = setInterval(() => {
        const ecoule = Date.now() - debut;
        const newProgress = Math.min(100, Math.round((ecoule / DUREE_MS) * 100));

        setFiles(prev => {
          const file = prev.find(f => f.id === fileId);
          if (!file) {
            clearInterval(interval);
            return prev;
          }

          return prev.map(f =>
            f.id === fileId ? { ...f, progress: newProgress } : f
          );
        });

        if (ecoule >= DUREE_MS) {
          clearInterval(interval);
          setTimeout(() => {
            setFiles(prev2 =>
              prev2.map(f => f.id === fileId ? { ...f, status: 'success' } : f)
            );
            resolve();
          }, 200);
        }
      }, 100);
    });
  };

  // Soumettre l'upload
  const handleSubmit = async () => {
    if (!deliverableName.trim() || files.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      // Simuler l'upload de chaque fichier
      for (const file of files) {
        if (file.status === 'pending') {
          await simulateUpload(file.id);
        }
      }

      // Attendre un peu pour l'effet visuel
      await new Promise(resolve => setTimeout(resolve, 500));

      // Appeler le callback avec les fichiers réels
      onUploadComplete(
        deliverableName,
        description,
        files.map(f => f.file)
      );

      // Réinitialiser le formulaire
      setDeliverableName('');
      setDescription('');
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Nettoyer les previews lors de la fermeture
  const handleClose = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setDeliverableName('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-start justify-between">
            <div>
              <h2 className="text-[#1A2753] mb-2">Téléverser un livrable</h2>
              <p className="text-[#273A7A]/80">
                Version {nextVersion} • {project.clientBrief.projectName}
              </p>
            </div>
            <button aria-label="Fermer"
              onClick={handleClose}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {/* Informations du livrable */}
            <div className="space-y-4">
              <div>
                <label className="block text-[#1A2753] mb-2">
                  Nom du livrable *
                </label>
                <input
                  type="text"
                  value={deliverableName}
                  onChange={(e) => setDeliverableName(e.target.value)}
                  placeholder="Ex: Propositions de logo - Phase 1"
                  className="w-full bg-[#F5F6FA] rounded-xl p-4 text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-[#1A2753] mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez brièvement le contenu de ce livrable..."
                  rows={3}
                  className="w-full bg-[#F5F6FA] rounded-xl p-4 text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors resize-none"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Zone de drop */}
            <div>
              <label className="block text-[#1A2753] mb-3">
                Fichiers * ({files.length})
              </label>

              <button type="button"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] block w-full 
                  border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                  transition-all duration-300
                  ${isDragging
                    ? 'border-[#D6A93A] bg-[#D6A93A]/5'
                    : 'border-gray-300 hover:border-[#D6A93A] hover:bg-[#F5F6FA]'
                  }
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-[#D6A93A]' : 'text-[#273A7A]/40'}`} />
                <p className="text-[#1A2753] mb-2">
                  {isDragging
                    ? 'Déposez vos fichiers ici'
                    : 'Glissez-déposez vos fichiers ou cliquez pour parcourir'
                  }
                </p>
                <p className="text-[#273A7A]/80 text-sm">
                  PDF, AI, PSD, PNG, JPG, ZIP... (max 50 MB par fichier)
                </p>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {/* Liste des fichiers */}
            {files.length > 0 && (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {files.map((file) => {
                    const Icon = getFileIcon(file.file.name);
                    
                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-[#F5F6FA] rounded-xl p-4"
                      >
                        <div className="flex items-start gap-4">
                          {/* Preview ou icône */}
                          {file.preview ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                              <Icon className="w-8 h-8 text-[#D6A93A]" />
                            </div>
                          )}

                          {/* Infos fichier */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[#1A2753] truncate mb-1">
                              {file.file.name}
                            </p>
                            <p className="text-[#273A7A]/80 text-sm">
                              {formatFileSize(file.file.size)}
                            </p>

                            {/* Barre de progression */}
                            {file.status === 'uploading' && (
                              <div className="mt-2">
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${file.progress}%` }}
                                    className="h-full bg-gradient-to-r from-[#1A2753] to-[#D6A93A]"
                                  />
                                </div>
                                <p className="text-xs text-[#273A7A]/80 mt-1">
                                  {file.progress}%
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Status et actions */}
                          <div className="flex items-center gap-2">
                            {file.status === 'pending' && !isUploading && (
                              <button aria-label="Retirer le fichier"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(file.id);
                                }}
                                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {file.status === 'uploading' && (
                              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Loader className="w-4 h-4 animate-spin" />
                              </div>
                            )}
                            {file.status === 'success' && (
                              <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            )}
                            {file.status === 'error' && (
                              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gray-100 text-[#1A2753] rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!deliverableName.trim() || files.length === 0 || isUploading}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Téléversement en cours...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Téléverser le livrable
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
