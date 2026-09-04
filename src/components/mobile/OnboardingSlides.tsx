import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { ArrowLeft, ArrowRight, ChevronRight, X, FileText, CreditCard, Building2, Settings, Palette, Sparkles } from '../ui/icons';
import cresusLogo from 'figma:asset/ba7f806837c0b04d16ea0e06c3cf0d16e104e6a4.png';

interface OnboardingSlidesProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 'welcome',
    title: 'Bienvenue sur Crésus',
    subtitle: 'La plateforme sénégalaise de création d\'entreprise 100% en ligne',
    icon: null,
    image: cresusLogo,
    gradient: 'from-[#1A2753] to-[#273A7A]',
    description: 'Créez et gérez votre entreprise sans vous déplacer. Simple, rapide et sécurisé.',
  },
  {
    id: 'create',
    title: 'Création d\'entreprise',
    subtitle: 'En quelques clics seulement',
    icon: FileText,
    gradient: 'from-blue-500 to-blue-600',
    description: 'Créez votre SARL, SAS, SASU, SA, SCI ou SUARL 100% en ligne. Nous gérons toutes les formalités.',
    features: ['Formulaire simplifié', 'Validation en temps réel', 'Suivi de dossier'],
  },
  {
    id: 'capital',
    title: 'Libération du capital',
    subtitle: 'Paiement sécurisé',
    icon: CreditCard,
    gradient: 'from-emerald-500 to-emerald-600',
    description: 'Libérez votre capital social en toute sécurité avec nos solutions de paiement mobile.',
    features: ['Orange Money', 'Wave', 'Virement bancaire'],
  },
  {
    id: 'domiciliation',
    title: 'Domiciliation',
    subtitle: 'Adresse professionnelle',
    icon: Building2,
    gradient: 'from-orange-500 to-orange-600',
    description: 'Obtenez une adresse commerciale prestigieuse pour votre entreprise à Dakar.',
    features: ['Adresse professionnelle', 'Gestion du courrier', 'Salle de réunion'],
  },
  {
    id: 'branding',
    title: 'Branding & Communication',
    subtitle: 'Démarquez-vous',
    icon: Palette,
    gradient: 'from-pink-500 to-pink-600',
    description: 'Créez votre identité visuelle et vos supports de communication professionnels.',
    features: ['Logo professionnel', 'Carte de visite', 'Site web'],
  },
  {
    id: 'ready',
    title: 'Prêt à commencer ?',
    subtitle: 'Votre aventure entrepreneuriale commence maintenant',
    icon: null,
    gradient: 'from-[#1A2753] to-[#273A7A]',
    description: 'Créez votre première entreprise en quelques minutes. Nous sommes là pour vous accompagner à chaque étape.',
    image: cresusLogo,
  },
];

export const OnboardingSlides: React.FC<OnboardingSlidesProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const x = useMotionValue(0);
  const xInput = [-100, 0, 100];
  const opacity = useTransform(x, xInput, [0, 1, 0]);
  const rotate = useTransform(x, xInput, [-10, 0, 10]);

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    if (currentIndex + newDirection >= 0 && currentIndex + newDirection < slides.length) {
      setDirection(newDirection);
      setCurrentIndex(currentIndex + newDirection);
    } else if (currentIndex + newDirection >= slides.length) {
      onComplete();
    }
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  const currentSlide = slides[currentIndex];
  const Icon = currentSlide.icon;
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A2753] via-[#273A7A] to-[#1A2753] flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-white/60 text-sm"
        >
          {currentIndex + 1} / {slides.length}
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onComplete}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] flex items-center gap-2 text-white/80 hover:text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full transition-colors"
        >
          <span className="text-sm">Passer</span>
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Floating particles for last slide */}
      {isLastSlide && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#D6A93A] rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: -20,
                opacity: 0 
              }}
              animate={{ 
                y: window.innerHeight + 20,
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32 pt-20">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="w-full max-w-md"
          >
            {/* Icon/Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8 flex justify-center"
            >
              {currentSlide.image ? (
                <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-black/20">
                  <img 
                    src={currentSlide.image} 
                    alt="Crésus" 
                    className="w-28 h-28 object-contain"
                  />
                </div>
              ) : Icon ? (
                <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${currentSlide.gradient} flex items-center justify-center shadow-2xl shadow-black/20`}>
                  <Icon className="w-14 h-14 text-white" />
                </div>
              ) : null}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white text-center mb-3"
            >
              {currentSlide.title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[#D6A93A] text-center mb-6"
            >
              {currentSlide.subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-center mb-8 leading-relaxed"
            >
              {currentSlide.description}
            </motion.p>

            {/* Features */}
            {currentSlide.features && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3 w-full"
              >
                {currentSlide.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#D6A93A]" />
                    <span className="text-white/90">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1A2753] to-transparent pt-20">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <motion.button aria-label={`Aller à l'écran ${index + 1}`}
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] relative"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#D6A93A] w-8'
                    : 'bg-white/30 w-2'
                }`}
              />
            </motion.button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {!isFirstSlide && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => paginate(-1)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] flex-1 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition-all duration-300"
            >
              Précédent
            </motion.button>
          )}
          
          <motion.button
            onClick={() => paginate(1)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={isLastSlide ? {
              boxShadow: [
                '0 0 0 0 rgba(214, 169, 58, 0)',
                '0 0 0 10px rgba(214, 169, 58, 0.2)',
                '0 0 0 0 rgba(214, 169, 58, 0)',
              ]
            } : {}}
            transition={isLastSlide ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : {}}
            className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${
              isFirstSlide ? 'flex-1' : 'flex-1'
            } ${
              isLastSlide
                ? 'bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-[#1A2753] shadow-lg'
                : 'bg-[#D6A93A] text-[#1A2753]'
            }`}
          >
            {isLastSlide && <Sparkles className="w-5 h-5" />}
            <span>{isLastSlide ? 'Commencer maintenant' : 'Suivant'}</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Swipe Hint */}
        {currentIndex === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex items-center justify-center gap-2 text-white/70 text-sm mt-4"
          >
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </motion.span>
            <span>Glissez pour naviguer</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </motion.span>
          </motion.div>
        )}
      </div>
    </div>
  );
};