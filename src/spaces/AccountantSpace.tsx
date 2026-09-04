import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

import { AccountantLayout } from '../components/accountant/AccountantLayout';
import { AccountantDashboard } from '../components/accountant/AccountantDashboard';
import { AccountantFolders } from '../components/accountant/AccountantFolders';
import { AccountantDeclarations } from '../components/accountant/AccountantDeclarations';
import { AccountantReports } from '../components/accountant/AccountantReports';
import { AccountantCalendar } from '../components/accountant/AccountantCalendar';

/** Espace comptable partenaire. La page courante vient de l'URL (`/comptable/<page>`). */
export default function AccountantSpace() {
  const params = useParams();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useApp();

  const page = params['*'] || 'dashboard';
  const go = (destination: string) => navigate(`/comptable/${destination}`);

  // Connexion automatique du comptable (le prototype ne demande pas d'identifiants).
  // C'était un setTimeout appelé pendant le rendu, ce qui déclenchait une mise à
  // jour d'état hors cycle React ; un effet fait le même travail proprement.
  const estConnecte = currentUser?.role === 'accountant';
  useEffect(() => {
    if (estConnecte) return;
    setCurrentUser({
      id: '3',
      email: 'comptable@cresus.sn',
      name: 'Amadou Diop',
      role: 'accountant',
    });
  }, [estConnecte, setCurrentUser]);

  if (!estConnecte) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D6A93A] mx-auto mb-4"
            role="status"
            aria-label="Connexion en cours"
          />
          <p className="text-[#273A7A]">Connexion en cours…</p>
        </div>
      </div>
    );
  }

  return (
    <AccountantLayout currentPage={page} onNavigate={go}>
      {page === 'folders' && <AccountantFolders />}
      {page === 'declarations' && <AccountantDeclarations />}
      {page === 'calendar' && <AccountantCalendar />}
      {page === 'reports' && <AccountantReports />}
      {!['folders', 'declarations', 'calendar', 'reports'].includes(page) && (
        <AccountantDashboard onNavigate={go} />
      )}
    </AccountantLayout>
  );
}
