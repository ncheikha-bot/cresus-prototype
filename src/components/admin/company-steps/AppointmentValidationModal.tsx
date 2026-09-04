import React from 'react';
import { Calendar, Check } from '../../ui/icons';
import { ModalShell } from './ModalShell';

interface AppointmentValidationModalProps {
  onClose: () => void;
  /** Créneau demandé par le client pour signer en personne. */
  request: { date: string; timeSlot: string };
  onConfirm: () => void;
  onReject: () => void;
}

/** Validation par l'admin du rendez-vous de signature demandé par le client. */
export const AppointmentValidationModal: React.FC<AppointmentValidationModalProps> = ({
  onClose,
  request,
  onConfirm,
  onReject,
}) => (
  <ModalShell
    animationKey="appointment-validation-modal"
    title="Demande de rendez-vous"
    icon={Calendar}
    onClose={onClose}
    maxWidth="max-w-md"
    footer={
      <>
        <button
          onClick={onReject}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-300"
        >
          Refuser
        </button>
        <button
          onClick={onConfirm}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Confirmer
        </button>
      </>
    }
  >
    <div className="p-6 space-y-4">
      <div className="bg-[#F5F6FA] rounded-xl p-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[#273A7A]/80 mb-1">Date demandée</p>
            <p className="text-[#1A2753] font-medium">
              {new Date(request.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#273A7A]/80 mb-1">Créneau horaire</p>
            <p className="text-[#1A2753] font-medium">{request.timeSlot}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-xs text-blue-700">
          Le client souhaite signer les documents en personne lors de ce rendez-vous.
        </p>
      </div>
    </div>
  </ModalShell>
);
