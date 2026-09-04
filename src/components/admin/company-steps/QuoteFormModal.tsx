import React from 'react';
import { DollarSign, Send } from '../../ui/icons';
import { ModalShell } from './ModalShell';
import { formatFCFA } from '../../../lib/format';

export interface QuoteForm {
  registrationFees: number;
  legalFees: number;
  publicationFees: number;
  stampDuty: number;
  adminFees: number;
  notes: string;
}

/** Postes du devis, dans l'ordre d'affichage. */
const POSTES: { cle: keyof Omit<QuoteForm, 'notes'>; libelle: string }[] = [
  { cle: 'registrationFees', libelle: "Frais d'immatriculation RCCM" },
  { cle: 'legalFees', libelle: 'Honoraires juridiques' },
  { cle: 'publicationFees', libelle: 'Frais de publication légale' },
  { cle: 'stampDuty', libelle: 'Droits de timbre' },
  { cle: 'adminFees', libelle: 'Frais administratifs Crésus' },
];

const TAUX_TVA = 0.18;

interface QuoteFormModalProps {
  onClose: () => void;
  form: QuoteForm;
  onChange: (form: QuoteForm) => void;
  totalFees: number;
  onSend: () => void;
}

/** Saisie et envoi du devis d'immatriculation. */
export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
  onClose,
  form,
  onChange,
  totalFees,
  onSend,
}) => (
  <ModalShell
    animationKey="quote-form-modal"
    title="Créer le devis d'immatriculation"
    icon={DollarSign}
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
          onClick={onSend}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Envoyer au client
        </button>
      </>
    }
  >
    <div className="p-6 space-y-4">
      <div className="space-y-4">
        {POSTES.map(({ cle, libelle }) => (
          <div key={cle}>
            {/* Libellé lié au champ : le formulaire n'en avait aucun. */}
            <label htmlFor={`devis-${cle}`} className="text-sm text-[#273A7A] mb-2 block">
              {libelle}
            </label>
            <input
              id={`devis-${cle}`}
              type="number"
              inputMode="numeric"
              value={form[cle]}
              onChange={e => onChange({ ...form, [cle]: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-[#F5F6FA] border-2 border-gray-200 rounded-xl focus:border-[#D6A93A] focus:outline-none"
            />
          </div>
        ))}

        <div>
          <label htmlFor="devis-notes" className="text-sm text-[#273A7A] mb-2 block">
            Notes additionnelles (optionnel)
          </label>
          <textarea
            id="devis-notes"
            value={form.notes}
            onChange={e => onChange({ ...form, notes: e.target.value })}
            placeholder="Ajouter des notes ou précisions..."
            className="w-full px-4 py-2 bg-[#F5F6FA] border-2 border-gray-200 rounded-xl focus:border-[#D6A93A] focus:outline-none resize-none"
            rows={3}
          />
        </div>
      </div>

      <div className="bg-[#F5F6FA] rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#273A7A]">Total HT</span>
          <span className="text-[#1A2753] font-bold">{formatFCFA(totalFees)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#273A7A]">TVA (18%)</span>
          <span className="text-[#1A2753] font-bold">{formatFCFA(totalFees * TAUX_TVA)}</span>
        </div>
        <div className="border-t border-[#273A7A]/20 mt-2 pt-2 flex items-center justify-between">
          <span className="text-[#1A2753] font-bold">Total TTC</span>
          <span className="text-[#D6A93A] text-xl font-bold">{formatFCFA(totalFees * (1 + TAUX_TVA))}</span>
        </div>
      </div>
    </div>
  </ModalShell>
);
