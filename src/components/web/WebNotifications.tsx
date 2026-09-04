import React from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle, AlertCircle, Info, XCircle, Check } from '../ui/icons';
import { useApp } from '../../context/AppContext';

export const WebNotifications: React.FC = () => {
  const { notifications, currentUser, markNotificationRead } = useApp();
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadNotifications = userNotifications.filter(n => !n.read);
  const readNotifications = userNotifications.filter(n => n.read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-orange-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#1A2753] mb-2">Notifications</h2>
          <p className="text-[#273A7A]/80">
            {unreadNotifications.length} notification{unreadNotifications.length !== 1 ? 's' : ''} non lue{unreadNotifications.length !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <button
            onClick={() => unreadNotifications.forEach(n => markNotificationRead(n.id))}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 bg-[#D6A93A] text-white rounded-xl hover:bg-[#D6A93A]/90 transition-all duration-300 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[#1A2753]">Non lues</h3>
          {unreadNotifications.map((notif, index) => (
            <motion.button type="button"
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-left ${getBgColor(notif.type)} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer`}
              onClick={() => markNotificationRead(notif.id)}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="text-[#1A2753]">{notif.title}</h4>
                    <span className="px-2 py-1 bg-white rounded-lg text-xs text-[#273A7A]/80 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-[#273A7A]/80">{notif.message}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[#1A2753]">Lues</h3>
          {readNotifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm opacity-60"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="text-[#1A2753]">{notif.title}</h4>
                    <span className="px-2 py-1 bg-[#F5F6FA] rounded-lg text-xs text-[#273A7A]/80 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-[#273A7A]/80">{notif.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {userNotifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-12 text-center"
        >
          <div className="w-24 h-24 bg-[#F5F6FA] rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-12 h-12 text-[#273A7A]/40" />
          </div>
          <h3 className="text-[#1A2753] mb-2">Aucune notification</h3>
          <p className="text-[#273A7A]/80">
            Vous n'avez pas encore de notifications
          </p>
        </motion.div>
      )}
    </div>
  );
};
