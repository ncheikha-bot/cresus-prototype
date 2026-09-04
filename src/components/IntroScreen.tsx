import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Shield, ArrowRight, Sparkles, Monitor, Building2, Calculator } from './ui/icons';
import cresusLogo from 'figma:asset/ba7f806837c0b04d16ea0e06c3cf0d16e104e6a4.png';

interface IntroScreenProps {
  onSelectMode: (mode: 'mobile' | 'admin' | 'web' | 'accountant') => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-12 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 bg-[#D6A93A]/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#1A2753]/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <motion.div
            className="inline-flex flex-col items-center mb-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img src={cresusLogo} alt="Crésus" className="h-24 md:h-32 w-auto" />
          </motion.div>
          
          <motion.h1
            className="text-black mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Bienvenue sur Crésus
          </motion.h1>
          
          <motion.p
            className="text-black/80 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Plateforme sénégalaise de création et gestion d'entreprise 100% en ligne.
            <br />
            Choisissez votre interface pour commencer.
          </motion.p>
        </motion.div>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
          {/* Client Mobile Card */}
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            onClick={() => onSelectMode('mobile')}
            className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl h-full flex text-left hover:shadow-[#D6A93A]/20 transition-all duration-500 overflow-hidden"
            whileHover={{ scale: 1.02, y: -8 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D6A93A]/0 to-[#D6A93A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            
            <div className="relative z-10 flex flex-col w-full">
              {/* Icon */}
              <motion.div
                className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-2xl shadow-lg"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Smartphone className="w-8 h-8 text-[#D6A93A]" />
              </motion.div>

              {/* Title */}
              <h3 className="text-[#1A2753] mb-2">App Mobile</h3>
              
              {/* Description */}
              <p className="text-[#273A7A]/70 text-sm mb-4">
                Expérience mobile optimisée pour smartphone et tablette
              </p>

              {/* CTA */}
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#F5F6FA]">
                <span className="text-[#1A2753] text-sm">Mobile First</span>
                <motion.div
                  className="w-8 h-8 bg-[#D6A93A] rounded-full flex items-center justify-center group-hover:bg-[#1A2753] transition-colors duration-300"
                  animate={{
                    x: [0, 5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </div>
          </motion.button>

          {/* Client Web Card */}
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            onClick={() => onSelectMode('web')}
            className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl h-full flex text-left hover:shadow-[#D6A93A]/20 transition-all duration-500 overflow-hidden"
            whileHover={{ scale: 1.02, y: -8 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D6A93A]/0 to-[#D6A93A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            
            <div className="relative z-10 flex flex-col w-full">
              {/* Icon */}
              <motion.div
                className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Monitor className="w-8 h-8 text-white" />
              </motion.div>

              {/* Title */}
              <h3 className="text-[#1A2753] mb-2">Interface Web</h3>
              
              {/* Description */}
              <p className="text-[#273A7A]/70 text-sm mb-4">
                Version desktop complète et responsive pour ordinateurs
              </p>

              {/* CTA */}
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#F5F6FA]">
                <span className="text-[#1A2753] text-sm">Bureau</span>
                <motion.div
                  className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors duration-300"
                  animate={{
                    x: [0, 5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </div>
          </motion.button>

          {/* Admin Dashboard Card */}
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            onClick={() => onSelectMode('admin')}
            className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl h-full flex text-left hover:shadow-[#D6A93A]/20 transition-all duration-500 overflow-hidden"
            whileHover={{ scale: 1.02, y: -8 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D6A93A]/0 to-[#D6A93A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            
            <div className="relative z-10 flex flex-col w-full">
              {/* Icon */}
              <motion.div
                className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#D6A93A] to-[#D6A93A]/80 rounded-2xl shadow-lg"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>

              {/* Title */}
              <h3 className="text-[#1A2753] mb-2">Admin Dashboard</h3>
              
              {/* Description */}
              <p className="text-[#273A7A]/70 text-sm mb-4">
                Interface d'administration pour gérer la plateforme
              </p>

              {/* CTA */}
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#F5F6FA]">
                <span className="text-[#1A2753] text-sm">Gestion</span>
                <motion.div
                  className="w-8 h-8 bg-[#D6A93A] rounded-full flex items-center justify-center group-hover:bg-[#1A2753] transition-colors duration-300"
                  animate={{
                    x: [0, 5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </div>
          </motion.button>

          {/* Accountant Partner Card */}
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            onClick={() => onSelectMode('accountant')}
            className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl h-full flex text-left hover:shadow-emerald-500/20 transition-all duration-500 overflow-hidden"
            whileHover={{ scale: 1.02, y: -8 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            
            <div className="relative z-10 flex flex-col w-full">
              {/* Icon */}
              <motion.div
                className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Calculator className="w-8 h-8 text-white" />
              </motion.div>

              {/* Title */}
              <h3 className="text-[#1A2753] mb-2">Espace Comptable</h3>
              
              {/* Description */}
              <p className="text-[#273A7A]/70 text-sm mb-4">
                Interface dédiée aux comptables partenaires
              </p>

              {/* CTA */}
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#F5F6FA]">
                <span className="text-[#1A2753] text-sm">Partenaire</span>
                <motion.div
                  className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-700 transition-colors duration-300"
                  animate={{
                    x: [0, 5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-center mt-12 text-black/60"
        >
          <p>© 2025 Crésus V2 - Propulsez votre entreprise au Sénégal</p>
        </motion.div>
      </div>
    </div>
  );
};