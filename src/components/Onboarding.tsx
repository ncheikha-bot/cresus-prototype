import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, Sparkles, Check } from './ui/icons';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: React.ReactNode;
}

interface OnboardingProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ steps, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const step = steps[currentStep];
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        
        // Scroll to element
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTooltipPosition = () => {
    const step = steps[currentStep];
    const padding = 20;

    switch (step.position) {
      case 'top':
        return {
          top: targetPosition.top - padding,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: targetPosition.top + targetPosition.height + padding,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left - padding,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left + targetPosition.width + padding,
          transform: 'translateY(-50%)',
        };
      case 'center':
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onSkip}
        />

        {/* Highlight */}
        {step.targetSelector && targetPosition.width > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute pointer-events-none"
            style={{
              top: targetPosition.top - 8,
              left: targetPosition.left - 8,
              width: targetPosition.width + 16,
              height: targetPosition.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(214, 169, 58, 0.6)',
              borderRadius: '16px',
              border: '2px solid #D6A93A',
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="absolute bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
          style={getTooltipPosition()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-t-2xl p-6 text-white">
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3 mb-3">
              {step.icon || <Sparkles className="w-6 h-6 text-[#D6A93A]" />}
              <h3 className="text-white">{step.title}</h3>
            </div>
            
            <p className="text-white/80 text-sm">{step.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-[#D6A93A]' : 'bg-[#F5F6FA]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#273A7A]/60 text-sm">
                <span>{currentStep + 1} / {steps.length}</span>
              </div>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 text-[#273A7A] hover:bg-[#F5F6FA] rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Précédent
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Check className="w-4 h-4" />
                      Terminer
                    </>
                  ) : (
                    <>
                      Suivant
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Arrow indicator */}
          {step.targetSelector && step.position !== 'center' && (
            <div
              className="absolute w-4 h-4 bg-white transform rotate-45"
              style={{
                ...(step.position === 'top' && { bottom: -8, left: '50%', marginLeft: -8 }),
                ...(step.position === 'bottom' && { top: -8, left: '50%', marginLeft: -8 }),
                ...(step.position === 'left' && { right: -8, top: '50%', marginTop: -8 }),
                ...(step.position === 'right' && { left: -8, top: '50%', marginTop: -8 }),
              }}
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
