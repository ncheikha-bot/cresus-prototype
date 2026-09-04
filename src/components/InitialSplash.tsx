import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import cresusLogo from 'figma:asset/ba7f806837c0b04d16ea0e06c3cf0d16e104e6a4.png';

interface InitialSplashProps {
  onComplete: () => void;
}

export const InitialSplash: React.FC<InitialSplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    /**
     * Progression cadencée sur le temps écoulé.
     *
     * Elle avançait de deux points par tic de 30 ms. Or un navigateur ralentit
     * fortement les minuteurs d'un onglet en arrière-plan : l'utilisateur qui
     * change d'application pendant le lancement retrouvait « Chargement de votre
     * plateforme… » figé, parfois plusieurs minutes. En repartant de l'horloge,
     * un tic tardif termine le chargement au lieu de l'avancer d'un cran.
     */
    const DUREE_MS = 1500;
    const debut = Date.now();

    const interval = setInterval(() => {
      const ecoule = Date.now() - debut;
      setProgress(Math.min(100, Math.round((ecoule / DUREE_MS) * 100)));

      if (ecoule >= DUREE_MS) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-gradient-to-br from-[#1A2753] via-[#273A7A] to-[#1A2753]"
      >
        {/* Animated background circles */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-64 h-64 bg-[#D6A93A] rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-[#D6A93A] rounded-full blur-3xl"
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="mb-12"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src={cresusLogo} 
                alt="Crésus" 
                className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl" 
              />
            </motion.div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-64 md:w-80"
          >
            <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 rounded-full relative"
              >
                <motion.div
                  animate={{ 
                    x: [0, 100, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
              </motion.div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/60 text-center mt-6 text-sm"
            >
              Chargement de votre plateforme...
            </motion.p>
          </motion.div>
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0,
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight - 100,
                Math.random() * window.innerHeight,
              ],
            }}
            transition={{ 
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-[#D6A93A] rounded-full"
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
