import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

import { WebLayout } from '../components/web/WebLayout';
import { WebDashboard } from '../components/web/WebDashboard';
import { WebMyCompanies } from '../components/web/WebMyCompanies';
import { WebCreateCompany } from '../components/web/WebCreateCompany';
import { WebDomiciliation } from '../components/web/WebDomiciliation';
import { WebMyDomiciliations } from '../components/web/WebMyDomiciliations';
import { WebBranding } from '../components/web/WebBranding';
import { WebAppointment } from '../components/web/WebAppointment';
import { WebTimeline } from '../components/web/WebTimeline';
import { WebDocuments } from '../components/web/WebDocuments';
import { WebNotifications } from '../components/web/WebNotifications';
import { WebProfile } from '../components/web/WebProfile';
import { OnboardingWeb } from '../components/web/OnboardingWeb';
import { WebBankAccountOpening } from '../components/web/WebBankAccountOpening';
import { WebBankAccountStatus } from '../components/web/WebBankAccountStatus';
import { WebMyBankRequests } from '../components/web/WebMyBankRequests';
import { WebModification } from '../components/web/WebModification';
import { WebAccounting } from '../components/web/WebAccounting';

/** Espace client web. La page courante vient de l'URL (`/web/<page>`). */
export default function WebSpace() {
  const params = useParams();
  const navigate = useNavigate();
  const { currentUser, showOnboarding, markOnboardingComplete } = useApp();

  const page = params['*'] || 'dashboard';
  const go = (destination: string) => navigate(`/web/${destination}`);
  const goDashboard = () => go('dashboard');

  const content = (() => {
    if (page.startsWith('create-draft-')) {
      return <WebCreateCompany onBack={goDashboard} draftId={page.replace('create-draft-', '')} />;
    }

    if (page.startsWith('bank-request-')) {
      return (
        <WebBankAccountStatus
          requestId={page.replace('bank-request-', '')}
          onBack={() => go('my-bank-requests')}
        />
      );
    }

    switch (page) {
      case 'my-companies':
        return <WebMyCompanies onBack={goDashboard} onNavigate={go} />;
      case 'create':
        return <WebCreateCompany onBack={goDashboard} />;
      case 'domiciliation':
        return <WebDomiciliation onBack={goDashboard} />;
      case 'my-domiciliations':
        return <WebMyDomiciliations onBack={goDashboard} />;
      case 'modification':
        return <WebModification onBack={goDashboard} />;
      case 'accounting':
        return <WebAccounting onBack={goDashboard} />;
      case 'branding':
        return <WebBranding onBack={goDashboard} />;
      case 'bank-account':
        return <WebBankAccountOpening onBack={goDashboard} />;
      case 'my-bank-requests':
        return (
          <WebMyBankRequests onBack={goDashboard} onViewRequest={id => go(`bank-request-${id}`)} />
        );
      case 'appointment':
        return <WebAppointment onBack={goDashboard} />;
      case 'timeline':
        return <WebTimeline onBack={goDashboard} />;
      case 'documents':
        return <WebDocuments onBack={goDashboard} />;
      case 'notifications':
        return <WebNotifications />;
      case 'profile':
        return <WebProfile />;
      default:
        return <WebDashboard onNavigate={go} />;
    }
  })();

  return (
    <>
      <WebLayout currentPage={page} onNavigate={go}>
        {content}
      </WebLayout>
      {showOnboarding && currentUser && page === 'dashboard' && (
        <OnboardingWeb onComplete={markOnboardingComplete} onSkip={markOnboardingComplete} />
      )}
    </>
  );
}
