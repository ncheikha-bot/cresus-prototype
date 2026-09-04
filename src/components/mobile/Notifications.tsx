import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BellDot, CircleCheck, Info, TriangleAlert, CircleX, BellOff } from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { BottomBar } from './BottomBar';

interface NotificationsProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ onBack, onNavigate }) => {
  const { notifications, markNotificationRead, currentUser } = useApp();
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CircleCheck;
      case 'error': return CircleX;
      case 'warning': return TriangleAlert;
      default: return Info;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return { bg: 'bg-emerald-500/8', text: 'text-emerald-500', border: 'border-emerald-500/10' };
      case 'error': return { bg: 'bg-red-500/8', text: 'text-red-500', border: 'border-red-500/10' };
      case 'warning': return { bg: 'bg-amber-500/8', text: 'text-amber-500', border: 'border-amber-500/10' };
      default: return { bg: 'bg-blue-500/8', text: 'text-blue-500', border: 'border-blue-500/10' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F1F8] to-[#F5F6FA] pb-28">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2753] via-[#1E3068] to-[#273A7A] pt-[max(3rem,env(safe-area-inset-top))] pb-6 px-5">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#D6A93A]/8 rounded-full blur-[70px] -translate-y-1/3 translate-x-1/4" />

        <div className="relative">
          <button aria-label="Retour"
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] mb-5 w-10 h-10 icon-glass rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-white text-xl mb-0.5">Notifications</h2>
              <p className="text-white/70 text-xs">{userNotifications.length} notification(s)</p>
            </div>
            {unreadCount > 0 && (
              <span className="text-[#D6A93A] text-[11px] bg-[#D6A93A]/8 px-3 py-1 rounded-full border border-[#D6A93A]/10 mb-0.5">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-5 mt-5 space-y-2.5">
        {userNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-10 text-center"
          >
            <div className="w-14 h-14 bg-[#F5F6FA]/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-6 h-6 text-[#273A7A]/20" />
            </div>
            <p className="text-[#1A2753] text-sm mb-1">Aucune notification</p>
            <p className="text-[#273A7A]/80 text-xs">Vous êtes à jour !</p>
          </motion.div>
        ) : (
          userNotifications.map((notification, index) => {
            const Icon = getIcon(notification.type);
            const colors = getIconColor(notification.type);

            return (
              <motion.button
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => markNotificationRead(notification.id)}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full glass-card rounded-2xl p-4 text-left ${
                  !notification.read ? 'border-l-[3px] !border-l-[#D6A93A]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 border ${colors.border}`}>
                    <Icon className={`w-4.5 h-4.5 ${colors.text}`} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="text-[#1A2753] text-sm">{notification.title}</p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#D6A93A] rounded-full flex-shrink-0 mt-1.5 shadow-sm shadow-[#D6A93A]/30" />
                      )}
                    </div>
                    <p className="text-[#273A7A]/80 text-xs mb-1.5 line-clamp-2">{notification.message}</p>
                    <p className="text-[#273A7A]/80 text-[10px]">
                      {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>

    </div>
  );
};
