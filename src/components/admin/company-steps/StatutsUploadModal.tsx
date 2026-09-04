import React from 'react';
import { FileText, Upload, Send } from '../../ui/icons';
import { ModalShell } from './ModalShell';

interface StatutsUploadModalProps {
  onClose: () => void;
  /** Une version précédente a été rejetée : on corrige au lieu de générer. */
  rejectedByClient: boolean;
  version: number;
  rejectionReason: string;
  onSend: () => void;
  onResend: () => void;
}

/** Génération ou correction des statuts, avant envoi au client. */
export const StatutsUploadModal: React.FC<StatutsUploadModalProps> = ({
  onClose,
  rejectedByClient,
  version,
  rejectionReason,
  onSend,
  onResend,
}) => (
  <ModalShell
    animationKey="statuts-upload-modal"
    title={rejectedByClient ? `Corriger les statuts V${version + 1}` : `Générer les statuts V${version}`}
    icon={FileText}
    onClose={onClose}
    footer={
      <>
        <button
          onClick={onClose}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300"
        >
          Annuler
        </button>
        <button
          onClick={rejectedByClient ? onResend : onSend}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {rejectedByClient ? 'Envoyer la nouvelle version' : 'Envoyer au client'}
        </button>
      </>
    }
  >
    <div className="p-6 space-y-4">
      {rejectedByClient && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm text-orange-800 mb-2">
            <strong>Motif du rejet :</strong>
          </p>
          <p className="text-sm text-orange-700">{rejectionReason}</p>
        </div>
      )}

      <div>
        <h3 className="text-[#1A2753] mb-3">Statuts de la société</h3>
        <div className="border-2 border-dashed border-[#D6A93A]/30 rounded-xl p-6 text-center">
          <Upload className="w-10 h-10 text-[#D6A93A] mx-auto mb-3" />
          <p className="text-[#1A2753] mb-2 text-sm">
            Uploader les statuts {rejectedByClient ? 'corrigés' : ''}
          </p>
          <p className="text-xs text-[#273A7A]/80 mb-3">Format PDF uniquement • Max 10 Mo</p>
          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-[#273A7A] text-white rounded-lg hover:bg-[#1A2753] transition-all text-sm">
            Sélectionner le fichier
          </button>
        </div>
      </div>
    </div>
  </ModalShell>
);
