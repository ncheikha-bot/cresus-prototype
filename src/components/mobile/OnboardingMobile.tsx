import React from 'react';
import { FileText, CreditCard, Pen, Building2, Palette, Bell, User } from '../ui/icons';
import { Onboarding } from '../Onboarding';

interface OnboardingMobileProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingMobile: React.FC<OnboardingMobileProps> = ({ onComplete, onSkip }) => {
  const steps = [
    {
      id: 'welcome',
      title: 'Bienvenue sur Crésus !',
      description: 'Créez et gérez votre entreprise 100% en ligne au Sénégal. Laissez-nous vous faire visiter.',
      position: 'center' as const,
    },
    {
      id: 'services',
      title: 'Nos services',
      description: 'Accédez à tous nos services : création d\'entreprise, libération du capital, signature électronique et plus encore.',
      targetSelector: '[data-onboarding="services"]',
      position: 'bottom' as const,
      icon: <FileText className="w-6 h-6 text-[#D6A93A]" />,
    },
    {
      id: 'companies',
      title: 'Vos entreprises',
      description: 'Suivez l\'état d\'avancement de vos dossiers et gérez toutes vos entreprises en un seul endroit.',
      targetSelector: '[data-onboarding="companies"]',
      position: 'top' as const,
      icon: <Building2 className="w-6 h-6 text-[#D6A93A]" />,
    },
    {
      id: 'timeline',
      title: 'Timeline',
      description: 'Consultez l\'historique complet de toutes vos actions et suivez l\'avancement en temps réel.',
      targetSelector: '[data-onboarding="timeline"]',
      position: 'left' as const,
      icon: <Bell className="w-6 h-6 text-[#D6A93A]" />,
    },
    {
      id: 'profile',
      title: 'Votre profil',
      description: 'Accédez à vos paramètres, notifications et informations personnelles.',
      targetSelector: '[data-onboarding="profile"]',
      position: 'left' as const,
      icon: <User className="w-6 h-6 text-[#D6A93A]" />,
    },
    {
      id: 'complete',
      title: 'C\'est parti !',
      description: 'Vous êtes prêt à créer votre entreprise. Commencez dès maintenant votre aventure entrepreneuriale.',
      position: 'center' as const,
    },
  ];

  return <Onboarding steps={steps} onComplete={onComplete} onSkip={onSkip} />;
};
