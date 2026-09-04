import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from '../ui/icons';
import { useApp } from '../../context/AppContext';
import cresusLogo from 'figma:asset/ba7f806837c0b04d16ea0e06c3cf0d16e104e6a4.png';
import { mockUsers } from '../../data/mockData';

interface SplashProps {
  onContinue: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onContinue }) => {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();

  const handleDemoMode = () => {
    // Le compte de démonstration des données de référence, comme sur l'écran de
    // connexion et dans l'espace web. Cet écran en composait un troisième à la
    // main — l'identifiant de l'un, le nom et l'email d'un autre.
    setCurrentUser(mockUsers[0]);
    onContinue();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#1A2753] via-[#1e3068] to-[#1A2753] relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#D6A93A] rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 right-0 w-[250px] h-[250px] bg-[#273A7A] rounded-full blur-[80px]"
      />

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => navigate('/')}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] absolute top-[max(1.5rem,env(safe-area-inset-top))] left-6 flex items-center gap-2 text-white/70 hover:text-white/80 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">Retour</span>
      </motion.button>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center relative z-10"
      >
        <div className="mb-10 relative">
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl shadow-black/20">
            <img src={cresusLogo} alt="Crésus" className="w-36 h-36 mx-auto object-contain" />
          </div>
        </div>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-[#D6A93A] text-xl mb-1"
        >
          Créez votre entreprise,
        </motion.p>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-white/70 mb-12"
        >
          sans vous déplacer.
        </motion.p>

        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          <motion.button
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] bg-[#D6A93A] text-[#1A2753] px-12 py-4 rounded-2xl shadow-lg shadow-[#D6A93A]/25 transition-all duration-300 w-full"
          >
            Se connecter
          </motion.button>

          <motion.button
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDemoMode}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] bg-white/[0.06] border border-white/10 text-white/70 px-12 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300 w-full hover:bg-white/[0.1]"
          >
            Mode démo
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] text-white/70 text-xs tracking-wider"
      >
        Propulsé par Crésus © 2026
      </motion.div>
    </div>
  );
};
