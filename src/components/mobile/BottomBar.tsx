import React from 'react';
import { motion } from 'motion/react';
import { Home, Building2, FolderKanban, FileStack, UserCircle } from '../ui/icons';

interface BottomBarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Accueil' },
  { id: 'companies', icon: Building2, label: 'Sociétés' },
  { id: 'timeline', icon: FolderKanban, label: 'Dossiers' },
  { id: 'documents', icon: FileStack, label: 'Documents' },
  { id: 'profile', icon: UserCircle, label: 'Profil' },
];

export const BottomBar: React.FC<BottomBarProps> = ({ currentScreen, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {/* Gradient fade behind the bar */}
      <div className="absolute inset-x-0 -top-8 h-12 bg-gradient-to-t from-[#F5F6FA] to-transparent pointer-events-none" />

      <div className="relative glass-strong rounded-[20px] overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 glass-shimmer pointer-events-none" />

        <div className="relative flex items-center justify-around py-2.5 px-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.85 }}
                onClick={() => onNavigate(item.id)}
                className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[54px] min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2"
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active glow background */}
                {isActive && (
                  <motion.div
                    layoutId="bottomBarGlow"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'radial-gradient(ellipse at center, rgba(214, 169, 58, 0.12) 0%, transparent 70%)',
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="bottomBarDot"
                    className="absolute -top-0.5 w-1 h-1 bg-[#D6A93A] rounded-full shadow-[0_0_6px_rgba(214,169,58,0.5)]"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}

                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon
                    className={`w-[21px] h-[21px] transition-all duration-300 ${
                      isActive ? 'text-[#1A2753] drop-shadow-sm' : 'text-[#273A7A]/80'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.6}
                  />
                </motion.div>

                <motion.span
                  className={`text-[11px] mt-1 tracking-tight transition-colors duration-300 ${
                    isActive ? 'text-[#1A2753]' : 'text-[#273A7A]/80'
                  }`}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
