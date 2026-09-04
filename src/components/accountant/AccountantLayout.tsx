import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, FileText, Upload, Calendar, TrendingUp, Bell, User, LogOut, Settings, Download, LayoutGrid } from '../ui/icons';
import { useApp } from '../../context/AppContext';
import cresusLogo from 'figma:asset/ba7f806837c0b04d16ea0e06c3cf0d16e104e6a4.png';

interface AccountantLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { id: 'folders', icon: FolderOpen, label: 'Mes dossiers' },
  { id: 'declarations', icon: Upload, label: 'Déclarations fiscales' },
  { id: 'calendar', icon: Calendar, label: 'Échéancier fiscal' },
  { id: 'reports', icon: TrendingUp, label: 'Rapports' },
];

export const AccountantLayout: React.FC<AccountantLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { notifications, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read && n.userId === '3').length;

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#F5F6FA]">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#1A2753] to-[#273A7A] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <img src={cresusLogo} alt="Crésus" className="h-8 mb-2" />
          <p className="text-white/60 text-sm">Espace Comptable</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentPage === item.id
                    ? 'bg-[#D6A93A] text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#D6A93A] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">Amadou Diop</p>
              <p className="text-white/60 text-xs">Expert-comptable</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-full flex items-center gap-2 px-4 py-2 text-white/70 hover:bg-white/10 rounded-xl transition-all text-sm"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Changer d'interface</span>
          </button>
          <button
            onClick={handleLogout}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-full flex items-center gap-2 px-4 py-2 text-white/70 hover:bg-white/10 rounded-xl transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#1A2753] text-xl">
                {menuItems.find(item => item.id === currentPage)?.label || 'Tableau de bord'}
              </h1>
              <p className="text-[#273A7A]/60 text-sm">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition-all">
                <Bell className="w-6 h-6 text-[#273A7A]" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-[#D6A93A] text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-all">
                <Settings className="w-6 h-6 text-[#273A7A]" />
              </button>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};