import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { mockUsers } from './data/mockData';
import type { ViewMode } from './types';

// Couche de dialogues applicatifs : remplace alert() / confirm() / prompt()
import { Toaster } from './components/ui/sonner';
import { ConfirmDialogProvider } from './components/ui/confirm-dialog';
import { PromptDialogProvider } from './components/ui/prompt-dialog';

import { IntroScreen } from './components/IntroScreen';
import { InitialSplash } from './components/InitialSplash';

// Chargement différé : chaque espace forme son propre morceau de bundle.
// Auparavant les 4 espaces étaient importés statiquement, si bien qu'un client
// mobile téléchargeait aussi tout l'admin et tout l'espace comptable.
const MobileSpace = lazy(() => import('./spaces/MobileSpace'));
const WebSpace = lazy(() => import('./spaces/WebSpace'));
const AdminSpace = lazy(() => import('./spaces/AdminSpace'));
const AccountantSpace = lazy(() => import('./spaces/AccountantSpace'));

/** Chemin de base de chaque espace. */
const ROUTE_BY_MODE: Record<ViewMode, string> = {
  mobile: '/app',
  web: '/web',
  admin: '/admin',
  accountant: '/comptable',
  bank: '/web', // pas d'espace banque monté : on retombe sur le web
};

function EcranDeChargement() {
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
      <div
        className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D6A93A]"
        role="status"
        aria-label="Chargement"
      />
    </div>
  );
}

/** Écran d'accueil : splash puis choix de l'espace. */
function Accueil() {
  const navigate = useNavigate();
  const { setCurrentUser, setViewMode, showInitialSplash, setShowInitialSplash } = useApp();

  if (showInitialSplash) {
    return <InitialSplash onComplete={() => setShowInitialSplash(false)} />;
  }

  return (
    <IntroScreen
      onSelectMode={mode => {
        setViewMode(mode);

        // Le prototype connecte automatiquement le client de démonstration —
        // celui des données de référence, comme les autres points d'entrée.
        if (mode === 'mobile' || mode === 'web') {
          setCurrentUser(mockUsers[0]);
        }

        navigate(`${ROUTE_BY_MODE[mode]}/dashboard`);
      }}
    />
  );
}

/**
 * Garde le `viewMode` du contexte aligné sur l'URL.
 *
 * Nécessaire parce que l'utilisateur peut arriver directement sur `/admin/...`
 * par un lien ou un rafraîchissement, sans passer par l'écran de choix.
 */
function SynchronisationViewMode() {
  const { pathname } = useLocation();
  const { viewMode, setViewMode } = useApp();

  useEffect(() => {
    const modeDeLUrl = (Object.entries(ROUTE_BY_MODE) as [ViewMode, string][]).find(
      ([mode, base]) => mode !== 'bank' && pathname.startsWith(base),
    )?.[0];
    if (modeDeLUrl && modeDeLUrl !== viewMode) setViewMode(modeDeLUrl);
  }, [pathname, viewMode, setViewMode]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <SynchronisationViewMode />
      <Suspense fallback={<EcranDeChargement />}>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/app/*" element={<MobileSpace />} />
          <Route path="/web/*" element={<WebSpace />} />
          <Route path="/admin/*" element={<AdminSpace />} />
          <Route path="/comptable/*" element={<AccountantSpace />} />
          {/* URL inconnue : on ramène à l'accueil plutôt que d'afficher une page vide. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    // Le routeur doit connaître le même préfixe que la construction : publié
    // sous /<depot>/, il prendrait sinon ce segment pour une route inconnue.
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProvider>
        {/* Les providers de dialogues et le Toaster couvrent les quatre espaces. */}
        <ConfirmDialogProvider>
          <PromptDialogProvider>
            <AppRoutes />
            <Toaster />
          </PromptDialogProvider>
        </ConfirmDialogProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
