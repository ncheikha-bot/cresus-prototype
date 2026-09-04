import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, ArrowLeft, ArrowRight, Check, ShieldCheck } from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { mockUsers } from '../../data/mockData';
import cresusLogo from 'figma:asset/ba7f806837c0b04d16ea0e06c3cf0d16e104e6a4.png';

interface AuthProps {
  onAuthenticated: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+221771234567');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useApp();

  const handleSendOTP = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    if (newOtp.every(digit => digit !== '') && index === 3) {
      handleVerifyOTP();
    }
  };

  const handleVerifyOTP = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrentUser(mockUsers[0]);
      onAuthenticated();
    }, 1000);
  };

  const handleDemoMode = () => {
    setCurrentUser(mockUsers[0]);
    onAuthenticated();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F5F6FA] to-white">
      {/* Top decorative area */}
      <div className="relative pt-[max(3.5rem,env(safe-area-inset-top))] pb-6 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#D6A93A]/5 rounded-full blur-3xl -translate-y-1/2" />

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative"
        >
          <div className="mb-8 flex justify-center">
            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(26,39,83,0.08)]">
              <img src={cresusLogo} alt="Crésus" className="h-16 w-auto" />
            </div>
          </div>
          <h2 className="text-[#1A2753] text-center text-2xl mb-1">
            {step === 'phone' ? 'Connexion' : 'Vérification'}
          </h2>
          <p className="text-[#273A7A]/80 text-center text-sm max-w-xs mx-auto">
            {step === 'phone'
              ? 'Entrez votre numéro WhatsApp pour recevoir un code de vérification'
              : 'Saisissez le code à 4 chiffres reçu sur WhatsApp'}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex-1 px-6"
      >
        {step === 'phone' ? (
          <div className="space-y-5">
            <div>
              <label className="block text-[#1A2753] text-sm mb-2 ml-1">
                Numéro WhatsApp
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#1A2753]/5 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-[#273A7A]/80" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-white border border-[#273A7A]/10 rounded-2xl focus:border-[#D6A93A] focus:ring-2 focus:ring-[#D6A93A]/10 outline-none transition-all duration-300 text-[#1A2753]"
                  placeholder="+221 77 123 45 67"
                />
              </div>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-[#1A2753] text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#273A7A] transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#1A2753]/15 active:scale-[0.98]"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Recevoir le code
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center text-xs text-[#273A7A]/80">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Connexion sécurisée par WhatsApp</span>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-[#D6A93A]/5 border border-[#D6A93A]/15 rounded-2xl p-4">
              <p className="text-[#1A2753] text-sm text-center">
                Code envoyé au <span className="text-[#D6A93A]">{phone}</span>
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-16 h-16 text-center text-xl bg-white border-2 border-[#273A7A]/10 rounded-2xl focus:border-[#D6A93A] focus:ring-2 focus:ring-[#D6A93A]/10 outline-none transition-all duration-200 text-[#1A2753]"
                />
              ))}
            </div>

            {loading && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-2 text-green-600"
              >
                <Check className="w-5 h-5" />
                <span className="text-sm">Vérification...</span>
              </motion.div>
            )}

            <button
              onClick={() => setStep('phone')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-[#273A7A]/80 py-2 text-center text-sm hover:text-[#1A2753] transition-colors"
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Modifier le numéro
              </span>
            </button>
          </div>
        )}

        {/* Demo Mode Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleDemoMode}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full mt-8 py-4 border border-[#D6A93A]/30 text-[#D6A93A] rounded-2xl hover:bg-[#D6A93A]/5 transition-all duration-300 active:scale-[0.98]"
        >
          Continuer en mode démo
        </motion.button>
      </motion.div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-[#273A7A]/80 text-xs">Propulsé par Crésus © 2026</p>
      </div>
    </div>
  );
};
