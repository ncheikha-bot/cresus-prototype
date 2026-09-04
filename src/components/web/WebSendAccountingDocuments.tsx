import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Upload, FileText, Receipt, CreditCard, Users, File,
  Check, AlertCircle, Calendar, Image as ImageIcon, Folder,
  CheckCircle2, Clock, XCircle, ArrowLeft, Trash2, Camera,
  Download
} from '../ui/icons';
import type { AccountingFolder, AccountingDocument } from '../../data/accountingData';
import { DOCUMENT_TYPES } from '../../data/accountingData';
import { toast } from 'sonner';
import { nouvelId } from '../../lib/id';

interface WebSendAccountingDocumentsProps {
  onClose: () => void;
  folder: AccountingFolder;
}

interface UploadedFile {
  id: string;
  file: File;
  type: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
  preview?: string;
}

export const WebSendAccountingDocuments: React.FC<WebSendAccountingDocumentsProps> = ({
  onClose,
  folder
}) => {
  const [step, setStep] = useState<'upload' | 'history'>('upload');
  const [selectedType, setSelectedType] = useState<string>('invoice');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Mock historique
  const [documentHistory] = useState<AccountingDocument[]>([
    {
      id: 'DOC-001',
      folderId: folder.id,
      month: '2025-11',
      type: 'invoice',
      name: 'Facture #2025-11-023.pdf',
      uploadedAt: '2025-11-28T14:30:00',
      uploadedBy: 'client',
      status: 'integrated',
      amount: 250000,
    },
    {
      id: 'DOC-002',
      folderId: folder.id,
      month: '2025-11',
      type: 'bank_statement',
      name: 'Relevé BOA Novembre.pdf',
      uploadedAt: '2025-11-28T10:15:00',
      uploadedBy: 'client',
      status: 'integrated',
    },
    {
      id: 'DOC-003',
      folderId: folder.id,
      month: '2025-11',
      type: 'receipt',
      name: 'Reçus déplacements.jpg',
      uploadedAt: '2025-11-27T16:45:00',
      uploadedBy: 'client',
      status: 'processing',
    },
    {
      id: 'DOC-004',
      folderId: folder.id,
      month: '2025-10',
      type: 'invoice',
      name: 'Facture loyer octobre.pdf',
      uploadedAt: '2025-10-05T09:20:00',
      uploadedBy: 'client',
      status: 'integrated',
      amount: 500000,
    },
    {
      id: 'DOC-005',
      folderId: folder.id,
      month: '2025-10',
      type: 'payroll',
      name: 'Bulletins paie octobre.xlsx',
      uploadedAt: '2025-10-05T09:22:00',
      uploadedBy: 'client',
      status: 'integrated',
    },
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (selectedFiles: File[]) => {
    const newFiles: UploadedFile[] = selectedFiles.map((file) => {
      const isImage = file.type.startsWith('image/');
      const preview = isImage ? URL.createObjectURL(file) : undefined;
      
      return {
        id: nouvelId('file'),
        file,
        type: selectedType,
        status: 'pending' as const,
        progress: 0,
        preview,
      };
    });

    setFiles([...files, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast.error('Veuillez sélectionner au moins un fichier');
      return;
    }

    // Simuler l'upload
    files.forEach((file, index) => {
      setTimeout(() => {
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id ? { ...f, status: 'uploading' as const } : f
          )
        );

        // Progression cadencée sur le temps écoulé : un onglet en arrière-plan
        // voit ses minuteurs ralentis, et l'envoi restait figé en chemin.
        const DUREE_MS = 1500;
        const debut = Date.now();
        const interval = setInterval(() => {
          const ecoule = Date.now() - debut;
          const progress = Math.min(100, Math.round((ecoule / DUREE_MS) * 100));
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.id === file.id ? { ...f, progress } : f
            )
          );

          if (ecoule >= DUREE_MS) {
            clearInterval(interval);
            setFiles(prevFiles => 
              prevFiles.map(f => 
                f.id === file.id ? { ...f, status: 'uploaded' as const } : f
              )
            );
          }
        }, 300);
      }, index * 200);
    });

    // Après 3 secondes, afficher le message de succès
    setTimeout(() => {
      toast.success('Documents envoyés avec succès');
      setFiles([]);
      setNotes('');
    }, 3000);
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'invoice': return FileText;
      case 'receipt': return Receipt;
      case 'bank_statement': return CreditCard;
      case 'payroll': return Users;
      default: return File;
    }
  };

  const getStatusColor = (status: AccountingDocument['status']) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-orange-100 text-orange-700';
      case 'integrated': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: AccountingDocument['status']) => {
    switch (status) {
      case 'received': return 'Reçu';
      case 'processing': return 'En traitement';
      case 'integrated': return 'Intégré';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getStatusIcon = (status: AccountingDocument['status']) => {
    switch (status) {
      case 'received': return Clock;
      case 'processing': return AlertCircle;
      case 'integrated': return CheckCircle2;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A2753] to-[#273A7A] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#D6A93A]" />
            </div>
            <div>
              <h2 className="text-white text-xl">Pièces comptables</h2>
              <p className="text-white/60 text-sm">{folder.companyName}</p>
            </div>
          </div>
          <button aria-label="Fermer" 
            onClick={onClose}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setStep('upload')}
            className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-4 transition-all ${
              step === 'upload'
                ? 'text-[#1A2753] bg-white border-b-2 border-[#D6A93A]'
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Envoyer des documents
          </button>
          <button
            onClick={() => setStep('history')}
            className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-6 py-4 transition-all ${
              step === 'history'
                ? 'text-[#1A2753] bg-white border-b-2 border-[#D6A93A]'
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            <Folder className="w-4 h-4 inline mr-2" />
            Historique ({documentHistory.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
          <AnimatePresence mode="popLayout">
            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Colonne gauche - Configuration */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Type de document */}
                    <div>
                      <label className="block text-[#1A2753] mb-3">
                        Type de document
                      </label>
                      <div className="space-y-2">
                        {DOCUMENT_TYPES.map((type) => {
                          const Icon = getDocumentIcon(type.id);
                          return (
                            <button
                              key={type.id}
                              onClick={() => setSelectedType(type.id)}
                              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                                selectedType === type.id
                                  ? 'border-[#D6A93A] bg-[#D6A93A]/10'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${
                                selectedType === type.id ? 'text-[#D6A93A]' : 'text-gray-600'
                              }`} />
                              <span className={`text-sm ${
                                selectedType === type.id ? 'text-[#1A2753]' : 'text-gray-600'
                              }`}>
                                {type.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-[#1A2753] mb-2">
                        Notes (optionnel)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ajouter une note pour votre comptable..."
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D6A93A] outline-none resize-none"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Colonne droite - Upload */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Zone d'upload */}
                    <div>
                      <label className="block text-[#1A2753] mb-3">
                        Fichiers à envoyer
                      </label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                          isDragging
                            ? 'border-[#D6A93A] bg-[#D6A93A]/10'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Upload className={`w-16 h-16 mx-auto mb-4 ${
                          isDragging ? 'text-[#D6A93A]' : 'text-gray-600'
                        }`} />
                        <p className="text-[#1A2753] mb-2">
                          Glissez-déposez vos fichiers ici
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                          ou
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-8 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all"
                        >
                          Parcourir les fichiers
                        </button>
                        <p className="text-gray-600 text-xs mt-4">
                          PDF, JPG, PNG, Excel, Word (max 10 Mo par fichier)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.xlsx,.xls,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Liste des fichiers */}
                    {files.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-[#1A2753]">
                          Fichiers sélectionnés ({files.length})
                        </h3>
                        <div className="space-y-2">
                          {files.map((file) => {
                            const Icon = getDocumentIcon(file.type);
                            return (
                              <div
                                key={file.id}
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                              >
                                {file.preview ? (
                                  <img
                                    src={file.preview}
                                    alt={file.file.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-gray-600" />
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-[#1A2753] text-sm truncate">
                                    {file.file.name}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-gray-500 text-xs">
                                      {(file.file.size / 1024 / 1024).toFixed(2)} Mo
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs text-[#273A7A]/80">
                                      {DOCUMENT_TYPES.find(t => t.id === file.type)?.label}
                                    </span>
                                  </div>
                                  
                                  {file.status === 'uploading' && (
                                    <div className="mt-2">
                                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-[#D6A93A] transition-all duration-300"
                                          style={{ width: `${file.progress}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {file.status === 'pending' && (
                                    <button aria-label="Supprimer le fichier"
                                      onClick={() => removeFile(file.id)}
                                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-gray-600 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  )}
                                  {file.status === 'uploading' && (
                                    <Clock className="w-5 h-5 text-orange-500 animate-spin" />
                                  )}
                                  {file.status === 'uploaded' && (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton d'envoi */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleUpload}
                    disabled={files.length === 0 || files.some(f => f.status === 'uploading')}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full py-4 rounded-xl transition-all text-lg ${
                      files.length > 0 && !files.some(f => f.status === 'uploading')
                        ? 'bg-[#D6A93A] text-white hover:bg-[#C09830] shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {files.some(f => f.status === 'uploading')
                      ? 'Envoi en cours...'
                      : `Envoyer ${files.length} document${files.length > 1 ? 's' : ''}`
                    }
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-[#1A2753] text-xl">
                      Documents envoyés
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {documentHistory.length} document{documentHistory.length > 1 ? 's' : ''} au total
                    </p>
                  </div>
                  <select className="px-4 py-2 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-[#D6A93A] outline-none">
                    <option>Tous les mois</option>
                    <option>Novembre 2025</option>
                    <option>Octobre 2025</option>
                    <option>Septembre 2025</option>
                  </select>
                </div>

                {documentHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <Folder className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">Aucun document envoyé</p>
                    <p className="text-gray-600 text-sm">Vos documents envoyés apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documentHistory.map((doc) => {
                      const Icon = getDocumentIcon(doc.type);
                      const StatusIcon = getStatusIcon(doc.status);
                      
                      return (
                        <div
                          key={doc.id}
                          className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Icon className="w-6 h-6 text-[#273A7A]" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <p className="text-[#1A2753] truncate">
                                  {doc.name}
                                </p>
                                <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 flex items-center gap-1 ${getStatusColor(doc.status)}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {getStatusLabel(doc.status)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(doc.uploadedAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {doc.amount && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-[#D6A93A]">
                                      {doc.amount.toLocaleString()} FCFA
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <button aria-label="Télécharger le document" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-2 text-gray-600 hover:text-[#273A7A] hover:bg-white rounded-lg transition-colors">
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
