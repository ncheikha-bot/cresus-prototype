import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Smartphone,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { formatFCFA } from '../../lib/format';
import { nouvelId, referenceCourte } from '../../lib/id';

interface CapitalPaymentProps {
  onBack: () => void;
}

const paymentMethods = [
  { id: 'orange_money', name: 'Orange Money', icon: Smartphone, color: 'from-orange-500 to-orange-600' },
  { id: 'wave', name: 'Wave', icon: Smartphone, color: 'from-blue-500 to-blue-600' },
  { id: 'card', name: 'Carte bancaire', icon: CreditCard, color: 'from-purple-500 to-purple-600' },
];

export const CapitalPayment: React.FC<CapitalPaymentProps> = ({ onBack }) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  // Fixée au montage : recalculée à chaque rendu, la référence du paiement
  // changeait sous les yeux de l'utilisateur.
  const [reference] = useState(() => referenceCourte('PAY', nouvelId('paiement')));
  const { addNotification, currentUser } = useApp();
  const amount = '1 000 000';

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
      addNotification({
        userId: currentUser?.id || '',
        title: 'Paiement validé',
        message: 'Votre dépôt de capital a été validé avec succès.',
        type: 'success',
        read: false,
      });
    }, 2000);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-[#1A2753] mb-3">Paiement réussi !</h2>
          <p className="text-[#273A7A]/80 mb-6 max-w-sm">
            Votre dépôt de capital de <strong>{formatFCFA(amount)}</strong> a été validé.
          </p>

          <div className="bg-white rounded-2xl p-6 mb-6 max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#273A7A]/80">Montant</span>
              <span className="text-[#1A2753]">{formatFCFA(amount)}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#273A7A]/80">Méthode</span>
              <span className="text-[#1A2753]">
                {paymentMethods.find(m => m.id === selectedMethod)?.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#273A7A]/80">Référence</span>
              <span className="text-[#1A2753]">{reference}</span>
            </div>
          </div>

          <button
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300"
          >
            Retour au tableau de bord
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2753] to-[#273A7A] pt-[max(3rem,env(safe-area-inset-top))] pb-6 px-5">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D6A93A]/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="relative">
          <button aria-label="Retour"
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] mb-5 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-white text-lg mb-0.5">Libération du capital</h2>
          <p className="text-white/70 text-xs">Effectuez votre dépôt de capital</p>
        </div>
      </div>

      {/* Amount */}
      <div className="px-5 mt-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <p className="text-[#273A7A]/80 text-sm mb-2">Montant à payer</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[#1A2753]">{amount}</span>
            <span className="text-[#273A7A]/80">FCFA</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <p className="text-[#1A2753] mb-3">Choisir un mode de paiement</p>
          {paymentMethods.map((method) => (
            <motion.button
              key={method.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMethod(method.id)}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-4 shadow-sm transition-all duration-300 ${
                selectedMethod === method.id
                  ? 'ring-2 ring-[#D6A93A] shadow-md'
                  : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F5F6FA] rounded-xl flex items-center justify-center border border-[#1A2753]/8">
                  <method.icon className="w-5 h-5 text-[#1A2753]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[#1A2753]">{method.name}</p>
                  <p className="text-[#273A7A]/80 text-sm">Paiement instantané</p>
                </div>
                {selectedMethod === method.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-[#D6A93A] rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-2xl p-4">
          <p className="text-[#1A2753] text-sm">
            Le dépôt de capital sera effectué sur un compte séquestre sécurisé.
          </p>
        </div>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F5F6FA] p-6">
        <button
          onClick={handlePayment}
          disabled={!selectedMethod || processing}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white py-4 rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
              Traitement en cours...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Payer {formatFCFA(amount)}
            </>
          )}
        </button>
      </div>
    </div>
  );
};