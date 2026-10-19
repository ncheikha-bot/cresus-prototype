import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Bell, User, LogOut, Settings, 
  CreditCard, Calendar, Palette, Building2, Landmark, Calculator,
  Smartphone, LayoutGrid, ChevronLeft, ChevronRight, Banknote, RotateCcw
} from '../ui/icons';
import { useConfirm } from '../ui/confirm-dialog';
import { appeler } from '../../lib/api';
import { partageActif } from '../../lib/sync';
import { useApp } from '../../context/AppContext';
import cresusLogo from 'figma:asset/ba7f806837c0b04d16ea0e06c3cf0d16e104e6a4.png';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuSections = [
  {
    title: 'Vue d\'ensemble',
    items: [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null }
    ]
  },
  {
    title: 'Gestion des dossiers',
    items: [
      { id: 'dossiers', icon: FileText, label: 'Dossiers entreprises', badge: null },
      { id: 'banks', icon: Landmark, label: 'Banques partenaires', badge: null },
      { id: 'bank-requests', icon: Banknote, label: 'Demandes bancaires', badge: null },
      { id: 'payments', icon: CreditCard, label: 'Paiements', badge: 'new' },
    ]
  },
  {
    title: 'Services & Modules',
    items: [
      { id: 'accounting', icon: Calculator, label: 'Comptabilité', badge: null },
      { id: 'domiciliation', icon: Building2, label: 'Domiciliation', badge: null },
      { id: 'modifications', icon: Settings, label: 'Modifications', badge: null },
      { id: 'branding', icon: Palette, label: 'Branding', badge: null },
    ]
  },
  {
    title: 'Planning',
    items: [
      { id: 'appointments', icon: Calendar, label: 'Rendez-vous', badge: null },
    ]
  }
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { notifications, setCurrentUser, setViewMode, companies } = useApp();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const unreadCount = notifications.filter(n => !n.read && n.userId === '2').length;
  const pendingCompanies = companies.filter(c => c.status === 'in_review').length;

  const handleSwitchToMobile = () => {
    setViewMode('mobile');
  };

  /** Voir le commentaire de WebLayout : l'accueil est une route. */
  const handleBackToIntro = () => {
    navigate('/');
  };

  const confirm = useConfirm();

  /**
   * Remise à zéro de la démonstration, pour tout le monde.
   *
   * Avec une base partagée, les essais de chaque visiteur s'accumulent ; le
   * bouton de l'accueil n'efface que le navigateur. Celui-ci vide le serveur,
   * et chaque poste ouvert vide son cache à la réception de l'événement.
   */
  const reinitialiserPourTous = async () => {
    const ok = await confirm({
      title: 'Effacer toute la démonstration ?',
      description:
        'Sociétés, dossiers, notifications, demandes et contrats seront supprimés pour tous les participants. Les comptes de démonstration sont conservés.',
      confirmLabel: 'Tout effacer',
      cancelLabel: 'Annuler',
      variant: 'destructive',
    });
    if (!ok) return;
    try {
      await appeler('/admin/reinitialiser', { method: 'POST' });
    } catch (erreur) {
      console.warn('Réinitialisation refusée', erreur);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const getCurrentPageTitle = () => {
    for (const section of menuSections) {
      const item = section.items.find(i => i.id === currentPage);
      if (item) return item.label;
    }
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-[#1A2753] to-[#273A7A] text-white flex flex-col transition-all duration-300 shadow-xl`}>
        <div className="p-6">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} mb-8`}>
            <img src={cresusLogo} alt="Crésus" className={`${sidebarCollapsed ? 'h-10' : 'h-14'} w-auto transition-all duration-300`} />
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-white text-lg font-semibold">Crésus V2</h2>
                <p className="text-white/60 text-xs">Administration</p>
              </div>
            )}
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full mb-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 flex items-center justify-center"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>

          <nav className="space-y-6 overflow-y-auto max-h-[calc(100vh-350px)]">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-1">
                {!sidebarCollapsed && (
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-4 mb-3">
                    {section.title}
                  </p>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                        isActive
                          ? 'bg-[#D6A93A] text-[#1A2753] shadow-lg'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                          {item.badge === 'new' && (
                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                              New
                            </span>
                          )}
                          {item.id === 'dossiers' && pendingCompanies > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                              {pendingCompanies}
                            </span>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && item.id === 'dossiers' && pendingCompanies > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {pendingCompanies}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-2 border-t border-white/10">
          <button
            onClick={handleSwitchToMobile}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300`}
            title={sidebarCollapsed ? 'Vue mobile' : undefined}
          >
            <Smartphone className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm">Vue mobile</span>}
          </button>
          
          <button
            onClick={handleBackToIntro}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300`}
            title={sidebarCollapsed ? 'Changer d\'interface' : undefined}
          >
            <LayoutGrid className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm">Changer d'interface</span>}
          </button>
          
          {partageActif && (
            <button
              onClick={reinitialiserPourTous}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-300`}
              title={sidebarCollapsed ? 'Réinitialiser la démonstration' : undefined}
            >
              <RotateCcw className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm">Réinitialiser la démo</span>}
            </button>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-all duration-300`}
            title={sidebarCollapsed ? 'Déconnexion' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="text-sm">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-8 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#1A2753] text-2xl font-semibold mb-1">
                {getCurrentPageTitle()}
              </h1>
              <p className="text-[#273A7A]/60 text-sm">Gestion et suivi administratif de la plateforme Crésus</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('notifications')}
                className="relative w-12 h-12 bg-[#F5F6FA] hover:bg-[#E5E7EB] rounded-xl flex items-center justify-center transition-all duration-300 group"
              >
                <Bell className="w-5 h-5 text-[#1A2753] group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#D6A93A] text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-[#1A2753] to-[#273A7A] rounded-xl">
                <div className="w-9 h-9 bg-[#D6A93A] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#1A2753]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Admin Crésus</p>
                  <p className="text-white/60 text-xs">Administrateur</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 bg-[#F5F6FA]">
          {children}
        </div>
      </main>
    </div>
  );
};