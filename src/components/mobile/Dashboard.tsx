import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  BellDot,
  Briefcase,
  Brush,
  Building2,
  Buildings,
  ChevronRight,
  CreditCard,
  FileSignature,
  FileText,
  Landmark,
  Layers3,
  MapPin,
  PenLine,
  PieChart,
  Sparkles,
  TrendingUp,
  UserCircle2,
  Zap,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { BottomBar } from './BottomBar';
import { TOTAL_CREATION_STEPS, getCreationProgress } from '../../domain/companySteps';
import { getClientCounters } from '../../domain/clientDashboard';
import { getServiceLabel } from '../../domain/servicePricing';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

const primaryServices = [
  {
    id: 'create',
    icon: Buildings,
    label: 'Créer une entreprise',
    description: 'Votre projet commence ici',
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    id: 'bank-account',
    icon: Landmark,
    label: 'Compte bancaire',
    description: 'Ouvrez votre compte pro',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  {
    id: 'domiciliation',
    icon: MapPin,
    label: 'Domiciliation',
    description: 'Siège social pour votre société',
    gradient: 'from-orange-500 to-amber-600',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
];

const additionalServices = [
  {
    id: 'modification',
    icon: PenLine,
    label: 'Modifications',
    description: 'Post-statutaires',
    gradient: 'from-indigo-500 to-violet-600',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
  },
  {
    id: 'accounting',
    icon: PieChart,
    label: 'Comptabilité',
    description: 'Gestion fiscale',
    gradient: 'from-purple-500 to-fuchsia-600',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    id: 'branding',
    icon: Brush,
    label: 'Branding',
    description: 'Identité visuelle',
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
  },
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const appContext = useApp();
  const { currentUser, notifications, bankAccountRequests, companies } = appContext;
  const unreadCount = notifications.filter(n => !n.read && n.userId === currentUser?.id).length;
  const userDrafts = currentUser && appContext.getDraftsByUser ? appContext.getDraftsByUser(currentUser.id) : [];

  const userCompanyIds = companies.filter(c => c.clientId === currentUser?.id).map(c => c.id);
  const userBankRequests = bankAccountRequests.filter(req => userCompanyIds.includes(req.companyId));
  const pendingBankRequests = userBankRequests.filter(req =>
    req.status !== 'completed' && req.status !== 'rejected'
  );

  // Compteurs partages avec le tableau de bord web : les deux affichaient
  // des chiffres differents pour les memes libelles.
  const compteurs = getClientCounters(companies, currentUser?.id, userDrafts.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F1F8] to-[#F5F6FA] pb-28">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2753] via-[#1E3068] to-[#273A7A] pt-[max(3rem,env(safe-area-inset-top))] pb-8 px-5">
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-52 h-52 bg-[#D6A93A]/8 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#4A5FBD]/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-[#D6A93A]/5 rounded-full blur-2xl" />

        <div className="relative flex items-center justify-between mb-7">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/70 text-xs tracking-wide"
            >
              Bonjour
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-white text-2xl"
            >
              {currentUser?.name?.split(' ')[0]}
            </motion.h2>
          </div>
          <div className="flex gap-2.5">
            <motion.button aria-label="Notifications"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate('notifications')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] relative w-11 h-11 icon-glass rounded-2xl flex items-center justify-center"
              data-onboarding="timeline"
            >
              <BellDot className="w-[18px] h-[18px] text-white/80" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-[#D6A93A] text-[#1A2753] text-[10px] rounded-full flex items-center justify-center shadow-lg shadow-[#D6A93A]/30"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Stats cards - Liquid Glass */}
        <div className="relative grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('companies')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] glass-dark rounded-2xl p-4 text-left glass-shimmer"
            data-onboarding="companies"
          >
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 icon-glass rounded-lg flex items-center justify-center">
                  <Layers3 className="w-3.5 h-3.5 text-[#D6A93A]" />
                </div>
                <p className="text-white/70 text-[11px] tracking-wide">Mes sociétés</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-white text-3xl tabular-nums">{compteurs.created}</span>
                <span className="text-[#D6A93A] text-[10px] px-2 py-0.5 bg-[#D6A93A]/8 rounded-full border border-[#D6A93A]/10 mb-1">
                  créées
                </span>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('timeline')}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] glass-dark rounded-2xl p-4 text-left glass-shimmer"
          >
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 icon-glass rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-white/70 text-[11px] tracking-wide">Dossiers actifs</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-white text-3xl tabular-nums">{compteurs.inProgress}</span>
                <span className="text-emerald-400 text-[10px] px-2 py-0.5 bg-emerald-400/8 rounded-full border border-emerald-400/10 mb-1">
                  en cours
                </span>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Services essentiels */}
      <div className="px-5 mt-6">
        <div className="flex items-center gap-2 mb-3.5">
          <h3 className="text-[#1A2753] text-[13px] tracking-wide">Services essentiels</h3>
        </div>
        <div className="space-y-2.5">
          {primaryServices.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * index }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(item.id)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full glass-card rounded-2xl p-4 flex items-center gap-3.5 group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconBg} border border-white/50`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} strokeWidth={1.8} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[#1A2753] text-sm mb-0.5">{item.label}</p>
                <p className="text-[#273A7A]/80 text-xs truncate">{item.description}</p>
                {/* Prix et délai dès la carte : ils n'apparaissaient qu'après
                    plusieurs étapes, une fois l'utilisateur déjà engagé. */}
                {getServiceLabel(item.id) && (
                  <p className="text-[#8A6A17] text-[11px] mt-1">{getServiceLabel(item.id)}</p>
                )}
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#F5F6FA]/80 flex items-center justify-center group-hover:bg-[#D6A93A]/10 transition-colors">
                <ChevronRight className="w-4 h-4 text-[#273A7A]/20 group-hover:text-[#D6A93A] transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Services complémentaires */}
      <div className="px-5 mt-6" data-onboarding="services">
        <div className="flex items-center gap-2 mb-3.5">
          <h3 className="text-[#1A2753] text-[13px] tracking-wide">Services complémentaires</h3>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {additionalServices.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * index }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onNavigate(item.id)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 glass-card rounded-2xl p-3.5 text-center group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2.5 ${item.iconBg} border border-white/50`}>
                <item.icon className={`w-5 h-5 ${item.iconColor}`} strokeWidth={1.8} />
              </div>
              <p className="text-[#1A2753] text-xs mb-0.5">{item.label}</p>
              <p className="text-[#273A7A]/80 text-[10px] leading-tight">{item.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Brouillons en cours */}
      {userDrafts.length > 0 && (
        <div className="px-5 mt-6">
          {/* Le compte figure ici : les brouillons ne sont plus fondus dans
              « Dossiers actifs », où ils creaient un ecart avec l'ecran des societes. */}
          <h3 className="text-[#1A2753] text-[13px] mb-3">Brouillons en cours ({compteurs.drafts})</h3>
          <div className="space-y-2.5">
            {userDrafts.map((draft) => (
              <motion.button
                key={draft.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(`create-draft-${draft.id}`)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full glass-card rounded-2xl p-4"
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[#1A2753] text-sm truncate">
                      {draft.formData.name || 'Brouillon sans nom'}
                    </p>
                    <p className="text-[#273A7A]/80 text-xs">
                      {draft.formData.legalForm} • Étape {draft.currentStep}/{TOTAL_CREATION_STEPS}
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="h-1.5 bg-[#F5F6FA] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getCreationProgress(draft.currentStep)}%` }}
                        className="h-full bg-gradient-to-r from-[#D6A93A] to-amber-400 rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-[#D6A93A] flex items-center gap-0.5">
                    Reprendre <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Demandes bancaires en cours */}
      {pendingBankRequests.length > 0 && (
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#1A2753] text-[13px]">Demandes bancaires</h3>
            <button
              onClick={() => onNavigate('my-bank-requests')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-[#D6A93A] text-xs flex items-center gap-0.5"
            >
              Voir tout <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {pendingBankRequests.slice(0, 2).map((request) => {
              const company = companies.find(c => c.id === request.companyId);
              const unreadMessages = request.messages.filter(m => !m.read && m.sender === 'bank').length;

              return (
                <motion.button
                  key={request.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(`bank-request-${request.id}`)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full glass-card rounded-2xl p-4 border-emerald-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Landmark className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[#1A2753] text-sm truncate">{company?.name}</p>
                      <p className="text-[#273A7A]/80 text-xs">
                        {request.status === 'pending' && 'En attente'}
                        {request.status === 'documents_review' && 'En vérification'}
                        {request.status === 'approved' && 'Approuvé'}
                        {request.status === 'appointment_scheduled' && 'RDV programmé'}
                      </p>
                    </div>
                    {unreadMessages > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm"
                      >
                        <span className="text-white text-[10px]">{unreadMessages}</span>
                      </motion.div>
                    )}
                    <ChevronRight className="w-4 h-4 text-emerald-500/30 flex-shrink-0" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <BottomBar currentScreen="dashboard" onNavigate={onNavigate} />
    </div>
  );
};