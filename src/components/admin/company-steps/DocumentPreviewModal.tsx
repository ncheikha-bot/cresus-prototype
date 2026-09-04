import React from 'react';
import { FileText, Download, Check, X } from '../../ui/icons';
import { ModalShell } from './ModalShell';

/** Forme du document telle que consommée par cet écran. */
export interface AdminDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: 'pending' | 'signed' | 'awaiting_validation' | 'validated' | 'rejected' | 'under_revision';
  rejectionReason?: string;
  currentVersion?: number;
  /** Historique des versions déposées, affiché dans la revue documentaire. */
  versions?: { versionNumber: number; uploadedAt: string; comment?: string }[];
  /** Avis successifs de l'admin sur ce document. */
  reviews?: { id: string; reviewedAt: string; status: 'validated' | 'rejected'; comment?: string }[];
  size?: string;
  pages?: number;
}

const LIBELLE_STATUT: Partial<Record<AdminDocument['status'], string>> = {
  validated: 'Validé',
  rejected: 'Rejeté',
};

const COULEUR_STATUT: Partial<Record<AdminDocument['status'], string>> = {
  validated: 'text-green-600',
  rejected: 'text-red-600',
};

interface DocumentPreviewModalProps {
  document: AdminDocument;
  onClose: () => void;
  onValidate: (docId: string) => void;
  onStartRejection: (docId: string) => void;
}

/** Aperçu d'un document fourni par le client, avec validation rapide. */
export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onValidate,
  onStartRejection,
}) => (
  <ModalShell
    animationKey="document-preview-modal"
    title={document.name}
    icon={FileText}
    onClose={onClose}
    maxWidth="max-w-3xl"
    footer={
      <button
        onClick={onClose}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-6 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all duration-300"
      >
        Fermer l&apos;aperçu
      </button>
    }
  >
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#F5F6FA] rounded-xl p-4">
          <p className="text-xs text-[#273A7A]/80 mb-1">Date d&apos;upload</p>
          <p className="text-[#1A2753] font-medium">
            {new Date(document.uploadedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="bg-[#F5F6FA] rounded-xl p-4">
          <p className="text-xs text-[#273A7A]/80 mb-1">Statut</p>
          <p className={`font-medium ${COULEUR_STATUT[document.status] ?? 'text-orange-600'}`}>
            {LIBELLE_STATUT[document.status] ?? 'En attente de validation'}
          </p>
        </div>
        {document.size && (
          <div className="bg-[#F5F6FA] rounded-xl p-4">
            <p className="text-xs text-[#273A7A]/80 mb-1">Taille</p>
            <p className="text-[#1A2753] font-medium">{document.size}</p>
          </div>
        )}
        {document.pages && (
          <div className="bg-[#F5F6FA] rounded-xl p-4">
            <p className="text-xs text-[#273A7A]/80 mb-1">Nombre de pages</p>
            <p className="text-[#1A2753] font-medium">{document.pages}</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-[#F5F6FA] to-white rounded-2xl border-2 border-[#273A7A]/10 p-8 mb-6">
        <div className="aspect-[3/4] bg-white rounded-lg shadow-lg flex items-center justify-center border border-gray-200">
          <div className="text-center p-8">
            <FileText className="w-20 h-20 text-[#D6A93A]/40 mx-auto mb-4" />
            <p className="text-[#1A2753] font-medium mb-2">Aperçu du document</p>
            <p className="text-sm text-[#273A7A]/80 mb-4">{document.name}</p>
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-[#D6A93A] text-white rounded-lg hover:bg-[#C09830] transition-all flex items-center gap-2 mx-auto">
              <Download className="w-4 h-4" />
              Télécharger
            </button>
          </div>
        </div>
      </div>

      {document.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => {
              onValidate(document.id);
              onClose();
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Valider ce document
          </button>
          <button
            onClick={() => {
              onStartRejection(document.id);
              onClose();
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Rejeter ce document
          </button>
        </div>
      )}
    </div>
  </ModalShell>
);
