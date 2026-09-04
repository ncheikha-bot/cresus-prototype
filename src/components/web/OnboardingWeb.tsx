import React from 'react';
import { FileText, CreditCard, Pen, Building2, Palette, Bell, User, LayoutGrid } from '../ui/icons';
import { Onboarding } from '../Onboarding';

interface OnboardingWebProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingWeb: React.FC<OnboardingWebProps> = ({ onComplete, onSkip }) => {
  const steps = [
    {
      id: 'welcome',
      title: 'Bienvenue sur Crésus !',
      description: 'Créez et gérez votre entreprise 100% en ligne au Sénégal. Découvrez toutes les fonctionnalités de la plateforme.',
      position: 'center' as const,
    },
    {
      id: 'navigation',
      title: 'Menu de navigation',
      description: 'Accédez rapidement à tous les services via le menu latéral. Vous pouvez le replier pour gagner de l\'espace.',
      targetSelector: 'aside',
      position: 'right' as const,
      icon: <LayoutGrid className="w-6 h-6 text-[#D6A93A]" />,
    },
    {
      id: 'services',
      title: 'Nos services',
      description: 'Tous les services dont vous avez besoin pour créer et gérer votre entreprise : création, capital, signature, domiciliation...',
      targetSelector: '[data-onboarding="services-section"]',
      position: 'top' as const,
      icon: <FileText className="w-6 h-6 text-[#D6A93A]" />,
    },
    {
      id: 'stats',
      title: 'Tableau de bord',
      description: 'Visualisez vos statistiques en un coup d\'œil : dossiers en cours, complétés et actions requises.',
      targetSelector: '[data-onboarding="stats"]',
      position: 'bottom' as const,
      icon: <Building2 className="w-6 h-6 text-[#D6A93A]" />,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Restez informé de toutes les mises à jour importantes concernant vos dossiers.',
      targetSelector: 'header button',
      position: 'bottom' as const,
      icon: <Bell className="w-6 h-6 text-[#D6A93A]" />,
    },
    {
      id: 'profile',
      title: 'Votre profil',
      description: 'Gérez vos informations personnelles, préférences et paramètres de sécurité.',
      targetSelector: 'header button:last-child',
      position: 'bottom' as const,
      icon: <User className="w-6 h-6 text-[#D6A93A]" />,
    },
    {
      id: 'complete',
      title: 'Vous êtes prêt !',
      description: 'Explorez la plateforme et commencez à créer votre première entreprise. Bonne chance dans votre aventure entrepreneuriale !',
      position: 'center' as const,
    },
  ];

  return <Onboarding steps={steps} onComplete={onComplete} onSkip={onSkip} />;
};
