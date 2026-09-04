import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, FileText, CreditCard, FileSignature, Building2, Edit, Palette, 
  Bell, User, LogOut, Menu, X, LayoutGrid, Clock, CalendarCheck, Building, FolderOpen, Calculator, TrendingUp, FolderClock
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import cresusLogo from 'figma:asset/ba7f806837c0b04d16ea0e06c3cf0d16e104e6a4.png';

interface WebLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

// Organisation des items en sections
const menuSections = [
  {
    title: 'Principal',
    items: [
      { id: 'dashboard', icon: Home, label: 'Accueil' },
      { id: 'my-companies', icon: Building, label: 'Mes sociétés' },
      { id: 'documents', icon: FolderOpen, label: 'Mes documents' },
    ]
  },
  {
    title: 'Services essentiels',
    items: [
      { id: 'create', icon: FileText, label: 'Créer entreprise' },
      { id: 'bank-account', icon: CreditCard, label: 'Compte bancaire' },
      { id: 'domiciliation', icon: Building2, label: 'Domiciliation' },
    ]
  },
  {
    title: 'Services complémentaires',
    items: [
      { id: 'modification', icon: Edit, label: 'Modifications' },
      { id: 'accounting', icon: TrendingUp, label: 'Comptabilité' },
      { id: 'branding', icon: Palette, label: 'Branding' },
    ]
  }
];

export const WebLayout: React.FC<WebLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { currentUser, notifications, setCurrentUser, setShowIntro } = useApp();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  /**
   * Seul un compte client est « connecté » ici.
   *
   * Les espaces administration et comptable connectent d'office leur propre
   * utilisateur ; depuis que la session survit au rechargement, y passer puis
   * revenir sur `/web` affichait le nom du comptable au-dessus d'un espace
   * client vide. Une session d'un autre rôle est traitée comme une absence de
   * connexion, état que cet espace sait déjà présenter.
   */
  const client = currentUser?.role === 'client' ? currentUser : null;

  const unreadCount = client
    ? notifications.filter(n => !n.read && n.userId === client.id).length 
    : 0;

  const handleLogin = () => {
    // Pour l'instant, on fait juste une connexion rapide démo
    // En production, cela ouvrirait une modale de connexion
    onNavigate('profile');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleBackToIntro = () => {
    setShowIntro(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-gradient-to-b from-[#1A2753] to-[#273A7A] text-white flex flex-col shadow-xl sticky top-0 h-screen overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <img src={cresusLogo} alt="Crésus" className="h-14 w-auto" />
                <div>
                  <h2 className="text-white">Crésus</h2>
                  <p className="text-white/60 text-xs">Espace Client</p>
                </div>
              </motion.div>
            )}
            {!sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex justify-center"
              >
                <img src={cresusLogo} alt="Crésus" className="h-10 w-auto" />
              </motion.div>
            )}
          </div>

          {/* Toggle button - moved below logo */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 mb-6"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Navigation par sections */}
          <nav className="space-y-6">
            {menuSections.map((section, sectionIndex) => (
              <div key={section.title}>
                {sidebarOpen && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/40 text-xs uppercase tracking-wider mb-2 px-2"
                  >
                    {section.title}
                  </motion.p>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
                          isActive
                            ? 'bg-[#D6A93A] text-[#1A2753]'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#1A2753]' : ''}`} />
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm font-medium"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Section - at bottom */}
        <div className="mt-auto p-6 border-t border-white/10">
          {client && (
            <button
              onClick={() => onNavigate('timeline')}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-xl transition-all duration-300"
            >
              <Clock className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm truncate">Timeline</span>}
            </button>
          )}

          <button
            onClick={handleBackToIntro}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-xl transition-all duration-300"
          >
            <LayoutGrid className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm truncate">Changer d'interface</span>}
          </button>
          
          {client ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-xl transition-all duration-300"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm truncate">Déconnexion</span>}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#D6A93A] text-[#1A2753] hover:bg-[#D6A93A]/90 rounded-xl transition-all duration-300"
            >
              <User className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm truncate">Se connecter</span>}
            </button>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[#F5F6FA] px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#1A2753]">
                {currentPage === 'dashboard' ? 'Tableau de bord' :
                 currentPage === 'my-companies' ? 'Mes sociétés' :
                 currentPage === 'create' ? 'Créer entreprise' :
                 currentPage === 'bank-account' ? 'Compte bancaire' :
                 currentPage === 'my-bank-requests' ? 'Mes demandes bancaires' :
                 currentPage === 'appointment' ? 'RDV Signature' :
                 currentPage === 'domiciliation' ? 'Domiciliation' :
                 currentPage === 'my-domiciliations' ? 'Mes domiciliations' :
                 currentPage === 'modification' ? 'Modifications' :
                 currentPage === 'accounting' ? 'Comptabilité' :
                 currentPage === 'branding' ? 'Branding' :
                 'Crésus'}
              </h1>
              <p className="text-[#273A7A]/60 text-sm">
                {client ? `Bienvenue, ${client.name}` : 'Explorez nos services'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {client && (
                <button
                  onClick={() => onNavigate('notifications')}
                  className="relative w-12 h-12 bg-[#F5F6FA] hover:bg-[#F5F6FA]/80 rounded-xl flex items-center justify-center transition-all duration-300"
                >
                  <Bell className="w-5 h-5 text-[#1A2753]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D6A93A] text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
              
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-3 px-4 py-2 bg-[#F5F6FA] hover:bg-[#F5F6FA]/80 rounded-xl transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                {client ? (
                  <div className="text-left hidden md:block">
                    <p className="text-[#1A2753] text-sm font-medium">{client.name}</p>
                    <p className="text-[#273A7A]/60 text-xs">{client.role}</p>
                  </div>
                ) : (
                  <span className="text-[#1A2753] text-sm hidden md:block">Se connecter</span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};