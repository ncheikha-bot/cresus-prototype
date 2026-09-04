import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

import { Splash } from '../components/mobile/Splash';
import { Auth } from '../components/mobile/Auth';
import { Dashboard } from '../components/mobile/Dashboard';
import { MyCompanies } from '../components/mobile/MyCompanies';
import { CreateCompany } from '../components/mobile/CreateCompany';
import { CapitalPayment } from '../components/mobile/CapitalPayment';
import { Domiciliation } from '../components/mobile/Domiciliation';
import { MyDomiciliations } from '../components/mobile/MyDomiciliations';
import { Branding } from '../components/mobile/Branding';
import { Appointment } from '../components/mobile/Appointment';
import { Timeline } from '../components/mobile/Timeline';
import { Documents } from '../components/mobile/Documents';
import { Notifications } from '../components/mobile/Notifications';
import { Profile } from '../components/mobile/Profile';
import { OnboardingMobile } from '../components/mobile/OnboardingMobile';
import { OnboardingSlides } from '../components/mobile/OnboardingSlides';
import { BankAccountOpening } from '../components/mobile/BankAccountOpening';
import { BankAccountStatus } from '../components/mobile/BankAccountStatus';
import { MyBankRequests } from '../components/mobile/MyBankRequests';
import { Modification } from '../components/mobile/Modification';
import { Accounting } from '../components/mobile/Accounting';

/**
 * Espace client mobile.
 *
 * L'écran courant vient de l'URL (`/app/<écran>`) et non plus d'un `useState` :
 * l'adresse est partageable, le bouton retour du navigateur fonctionne, et un
 * rafraîchissement ne renvoie plus au splash.
 */
export default function MobileSpace() {
  const params = useParams();
  const navigate = useNavigate();
  const { currentUser, showOnboarding, showOnboardingSlides, markOnboardingComplete } = useApp();

  const screen = params['*'] || 'dashboard';
  const go = (destination: string) => navigate(`/app/${destination}`);
  const goDashboard = () => go('dashboard');

  if (currentUser && showOnboardingSlides) {
    return <OnboardingSlides onComplete={markOnboardingComplete} />;
  }

  // L'espace client demande un compte client. Les espaces admin et comptable
  // connectent d'office leur propre utilisateur ; depuis que la session survit
  // au rechargement, y passer laissait l'application ouverte ici sur un compte
  // sans dossier, sans jamais reproposer la connexion.
  if (!currentUser || currentUser.role !== 'client') {
    if (screen === 'splash') return <Splash onContinue={() => go('auth')} />;
    return <Auth onAuthenticated={goDashboard} />;
  }

  const content = (() => {
    // Reprise d'un brouillon : /app/create-draft-<id>
    if (screen.startsWith('create-draft-')) {
      return <CreateCompany onBack={goDashboard} draftId={screen.replace('create-draft-', '')} />;
    }

    // Détail d'une demande bancaire : /app/bank-request-<id>
    if (screen.startsWith('bank-request-')) {
      return (
        <BankAccountStatus
          requestId={screen.replace('bank-request-', '')}
          onBack={() => go('my-bank-requests')}
        />
      );
    }

    switch (screen) {
      case 'companies':
        return <MyCompanies onBack={goDashboard} onNavigate={go} />;
      case 'create':
        return <CreateCompany onBack={goDashboard} />;
      case 'capital':
        return <CapitalPayment onBack={goDashboard} />;
      case 'domiciliation':
        return <Domiciliation onBack={goDashboard} />;
      case 'my-domiciliations':
        return <MyDomiciliations onBack={goDashboard} />;
      case 'branding':
        return <Branding onBack={goDashboard} />;
      case 'bank-account':
        return <BankAccountOpening onBack={goDashboard} />;
      case 'my-bank-requests':
        return (
          <MyBankRequests onBack={goDashboard} onViewRequest={id => go(`bank-request-${id}`)} />
        );
      case 'appointment':
        return <Appointment onBack={goDashboard} />;
      case 'timeline':
        return <Timeline onBack={goDashboard} onNavigate={go} />;
      case 'documents':
        return <Documents onBack={goDashboard} onNavigate={go} />;
      case 'notifications':
        return <Notifications onBack={goDashboard} onNavigate={go} />;
      case 'profile':
        return <Profile onBack={goDashboard} onNavigate={go} />;
      case 'modification':
        return <Modification onBack={goDashboard} />;
      case 'accounting':
        return <Accounting onBack={goDashboard} />;
      default:
        return <Dashboard onNavigate={go} />;
    }
  })();

  return (
    <>
      {content}
      {showOnboarding && screen === 'dashboard' && (
        <OnboardingMobile onComplete={markOnboardingComplete} onSkip={markOnboardingComplete} />
      )}
    </>
  );
}
