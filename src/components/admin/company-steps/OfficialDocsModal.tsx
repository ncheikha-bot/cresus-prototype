import React from 'react';
import { Building, CheckCircle, Plus } from '../../ui/icons';
import { ModalShell } from './ModalShell';

/** Documents officiels remis en fin de parcours. */
const DOCUMENTS_OFFICIELS = ['RCCM', 'NINEA', 'Statuts signés', 'Attestation capital'] as const;

interface OfficialDocsModalProps {
  onClose: () => void;
  uploadedDocs: { name: string; uploadedAt: string }[];
  onUpload: (docName: string) => void;
  onFinalize: () => void;
}

/** Dépôt des documents officiels et clôture du dossier. */
export const OfficialDocsModal: React.FC<OfficialDocsModalProps> = ({
  onClose,
  uploadedDocs,
  onUpload,
  onFinalize,
}) => (
  <ModalShell
    animationKey="official-docs-upload-modal"
    title="Finaliser la création de société"
    icon={Building}
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
          onClick={onFinalize}
          // La clôture exige au moins un document officiel.
          disabled={uploadedDocs.length === 0}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-5 h-5" />
          Finaliser la création
        </button>
      </>
    }
  >
    <div className="p-6 space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Documents officiels à uploader :</strong>
        </p>
        <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1">
          <li>• RCCM (Registre du Commerce)</li>
          <li>• NINEA (Numéro d&apos;Identification Nationale)</li>
          <li>• Statuts signés et enregistrés</li>
          <li>• Attestation de dépôt de capital</li>
        </ul>
      </div>

      {uploadedDocs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[#1A2753] font-semibold">Documents uploadés :</h4>
          {uploadedDocs.map((doc, index) => (
            <div
              key={`official-doc-${index}`}
              className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-[#1A2753]">{doc.name}</span>
              </div>
              <span className="text-xs text-green-600">
                {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
      )}

      <div>
        <h4 className="text-[#1A2753] font-semibold mb-3">Ajouter des documents :</h4>
        <div className="grid grid-cols-2 gap-3">
          {DOCUMENTS_OFFICIELS.map(nom => (
            <button
              key={nom}
              onClick={() => onUpload(nom)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-4 border-2 border-dashed border-[#D6A93A]/30 rounded-xl hover:bg-[#F5F6FA] transition-all text-sm text-[#1A2753] flex flex-col items-center gap-2"
            >
              <Plus className="w-6 h-6 text-[#D6A93A]" />
              {nom}
            </button>
          ))}
        </div>
      </div>
    </div>
  </ModalShell>
);
