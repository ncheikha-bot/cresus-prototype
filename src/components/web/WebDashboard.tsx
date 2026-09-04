import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  Building2,
  Buildings,
  CheckCircle,
  ChevronRight,
  CircleDot,
  Clock,
  CreditCard,
  Edit,
  FileText,
  FolderOpen,
  Layers,
  Palette,
  Plus,
  Rocket,
  Settings,
  Sparkles,
  Timer,
  Zap,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { TOTAL_CREATION_STEPS, getCreationProgress } from '../../domain/companySteps';
import { getClientCounters } from '../../domain/clientDashboard';
import { getServiceLabel } from '../../domain/servicePricing';

interface WebDashboardProps {
  onNavigate: (page: string) => void;
}

export const WebDashboard: React.FC<WebDashboardProps> = ({ onNavigate }) => {
  const appContext = useApp();
  const { companies, notifications, currentUser, bankAccountRequests } = appContext;
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  
  const userCompanies = currentUser 
    ? companies.filter(c => c.clientId === currentUser.id) 
    : [];
  const userDrafts = currentUser && appContext.getDraftsByUser ? appContext.getDraftsByUser(currentUser.id) : [];
  
  const userCompanyIds = userCompanies.map(c => c.id);
  const userBankRequests = bankAccountRequests.filter(req => userCompanyIds.includes(req.companyId));
  const pendingBankRequests = userBankRequests.filter(req => 
    req.status !== 'completed' && req.status !== 'rejected'
  );
  // Compteurs partages avec le tableau de bord mobile.
  const compteurs = getClientCounters(companies, currentUser?.id, userDrafts.length);
  const completedCompanies = userCompanies.filter(c => c.status === 'completed');
  const inProgressCompanies = userCompanies.filter(c => c.status !== 'completed');
  const pendingActions = userCompanies.filter(c => c.status === 'pending');
  const unreadNotifs = currentUser
    ? notifications.filter(n => n.userId === currentUser.id && !n.read).length
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // Services par phase
  const serviceCategories = [
    {
      phase: 'Lancer',
      phaseLabel: 'Lancer votre entreprise',
      phaseIcon: Buildings,
      phaseColor: '#D6A93A',
      phaseNumber: '01',
      services: [
        {
          id: 'create',
          icon: FileText,
          title: 'Création d\'entreprise',
          description: 'Créez votre société en ligne de A à Z : rédaction des statuts, signature électronique et libération du capital — tout est inclus dans un parcours 100% digital.',
          gradient: 'from-[#1A2753] via-[#273A7A] to-[#1A2753]',
          iconBg: 'bg-[#1A2753]',
          lightBg: 'bg-[#1A2753]/5',
          accentColor: '#1A2753',
          badge: userDrafts.length > 0 ? userDrafts.length : undefined,
          priority: true,
          features: ['100% en ligne', 'Accompagnement inclus', '48h en moyenne', 'Signature électronique']
        },
        {
          id: 'domiciliation',
          icon: Building2,
          title: 'Domiciliation',
          description: 'Obtenez une adresse professionnelle prestigieuse pour le siège social de votre entreprise.',
          gradient: 'from-[#D6A93A] to-amber-500',
          iconBg: 'bg-[#D6A93A]',
          lightBg: 'bg-[#D6A93A]/5',
          accentColor: '#D6A93A',
          features: ['Adresse premium', 'Réception courrier'],
          subActions: [
            { id: 'domiciliation', label: 'Nouvelle demande', icon: Plus },
            { id: 'my-domiciliations', label: 'Mes domiciliations', icon: FolderOpen }
          ]
        },
      ]
    },
    {
      phase: 'Gérer',
      phaseLabel: 'Gérer votre activité',
      phaseIcon: Settings,
      phaseColor: '#273A7A',
      phaseNumber: '02',
      services: [
        {
          id: 'bank-account',
          icon: CreditCard,
          title: 'Compte bancaire',
          description: 'Ouvrez un compte professionnel auprès de nos banques partenaires sénégalaises en quelques clics.',
          gradient: 'from-emerald-500 to-emerald-600',
          iconBg: 'bg-emerald-500',
          lightBg: 'bg-emerald-50',
          accentColor: '#10B981',
          features: ['Banques partenaires', 'Ouverture rapide'],
          badge: pendingBankRequests.length > 0 ? pendingBankRequests.length : undefined,
          subActions: [
            { id: 'bank-account', label: 'Nouvelle demande', icon: Plus },
            { id: 'my-bank-requests', label: 'Mes demandes', icon: FolderOpen }
          ]
        },
        {
          id: 'accounting',
          icon: BarChart3,
          title: 'Comptabilité & Fiscalité',
          description: 'Suivez votre comptabilité et gérez vos obligations fiscales et déclarations en temps réel.',
          gradient: 'from-violet-500 to-purple-600',
          iconBg: 'bg-violet-500',
          lightBg: 'bg-violet-50',
          accentColor: '#8B5CF6',
          features: ['Suivi en temps réel', 'Déclarations'],
        },
        {
          id: 'modification',
          icon: Edit,
          title: 'Modifications statutaires',
          description: 'Changement de dénomination, siège social, gérant, augmentation de capital, et plus encore.',
          gradient: 'from-indigo-500 to-indigo-600',
          iconBg: 'bg-indigo-500',
          lightBg: 'bg-indigo-50',
          accentColor: '#6366F1',
          features: ['Procédure simplifiée', 'Suivi en ligne'],
        },
      ]
    },
    {
      phase: 'Développer',
      phaseLabel: 'Développer votre image',
      phaseIcon: Award,
      phaseColor: '#EC4899',
      phaseNumber: '03',
      services: [
        {
          id: 'branding',
          icon: Palette,
          title: 'Branding & Communication',
          description: 'Créez une identité visuelle forte : logo professionnel, charte graphique, cartes de visite, supports marketing et communication digitale.',
          gradient: 'from-pink-500 to-rose-500',
          iconBg: 'bg-pink-500',
          lightBg: 'bg-pink-50',
          accentColor: '#EC4899',
          features: ['Logo & Charte', 'Supports marketing', 'Communication digitale'],
        }
      ]
    }
  ];

  const stats = [
    {
      label: 'Sociétés créées',
      value: compteurs.created,
      icon: CheckCircle,
      color: '#10B981',
      bgColor: 'bg-emerald-50',
      ringColor: 'ring-emerald-100',
      trend: '+2 ce mois',
      onClick: () => onNavigate('my-companies')
    },
    {
      label: 'En cours de création',
      value: compteurs.inProgress,
      icon: Timer,
      color: '#3B82F6',
      bgColor: 'bg-blue-50',
      ringColor: 'ring-blue-100',
      trend: 'Traitement rapide',
    },
    {
      label: 'Actions requises',
      value: pendingActions.length,
      icon: AlertCircle,
      color: '#F59E0B',
      bgColor: 'bg-amber-50',
      ringColor: 'ring-amber-100',
      trend: pendingActions.length > 0 ? 'À traiter' : 'Tout est à jour',
    },
    {
      label: 'Notifications',
      value: unreadNotifs,
      icon: Bell,
      color: '#8B5CF6',
      bgColor: 'bg-violet-50',
      ringColor: 'ring-violet-100',
      trend: unreadNotifs > 0 ? `${unreadNotifs} non lue${unreadNotifs > 1 ? 's' : ''}` : 'Aucune nouvelle',
      onClick: () => onNavigate('notifications')
    },
  ];

  // Quick actions (sans RDV)
  const quickActions = [
    { id: 'create', icon: Plus, label: 'Créer une entreprise' },
    { id: 'my-companies', icon: Buildings, label: 'Mes entreprises' },
    { id: 'documents', icon: FileText, label: 'Mes documents' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* ═══ WELCOME HERO ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2753] via-[#1e2f63] to-[#273A7A]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D6A93A]/8 rounded-full blur-[100px] translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#273A7A]/40 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-[#D6A93A]/10 rounded-full blur-[40px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <div className="relative z-10 p-8 lg:p-10">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-[#D6A93A]/15 backdrop-blur-sm border border-[#D6A93A]/20 rounded-full px-4 py-1.5 mb-5"
              >
                <span className="text-[#D6A93A] text-xs tracking-wide">Espace Client Crésus</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-white text-3xl lg:text-4xl mb-3"
              >
                {getGreeting()},{' '}
                <span className="bg-gradient-to-r from-[#D6A93A] to-amber-400 bg-clip-text text-transparent">
                  {currentUser?.name?.split(' ')[0] || 'Entrepreneur'}
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/60 text-sm max-w-lg mb-8"
              >
                Créez, gérez et développez votre entreprise au Sénégal. Tout est centralisé ici, en toute simplicité.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap gap-3"
              >
                {quickActions.map((action, i) => {
                  const ActionIcon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onNavigate(action.id)}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] flex items-center gap-2.5 ${
                        i === 0 
                          ? 'bg-[#D6A93A] text-[#1A2753] shadow-lg shadow-[#D6A93A]/20' 
                          : 'bg-white/10 text-white/90 backdrop-blur-sm border border-white/10 hover:bg-white/15'
                      } px-5 py-2.5 rounded-xl transition-all duration-300`}
                    >
                      <ActionIcon className="w-4 h-4" />
                      <span className="text-sm">{action.label}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>

            {/* Mini stats summary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden xl:flex flex-col gap-3 min-w-[200px]"
            >
              <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-white/70 text-xs tracking-wide">
                  <span>Aperçu rapide</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Entreprises</span>
                    <span className="text-white text-sm tabular-nums">{compteurs.created}</span>
                  </div>
                  <div className="w-full h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">En cours</span>
                    <span className="text-white text-sm tabular-nums">{compteurs.inProgress}</span>
                  </div>
                  <div className="w-full h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Brouillons</span>
                    <span className="text-[#D6A93A] text-sm tabular-nums">{userDrafts.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ═══ STATS GRID ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-onboarding="stats">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.button type="button" disabled={!stat.onClick}
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.06 }}
              onClick={stat.onClick}
              whileHover={stat.onClick ? { y: -3, scale: 1.01 } : {}}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-left bg-white rounded-2xl p-5 ring-1 ${stat.ringColor} shadow-sm hover:shadow-md transition-all duration-300 ${
                stat.onClick ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                {stat.onClick && (
                  <ArrowUpRight className="w-4 h-4 text-[#273A7A]/30" />
                )}
              </div>
              <p className="text-2xl text-[#1A2753] tabular-nums mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {stat.value}
              </p>
              <p className="text-[#273A7A]/80 text-xs mb-2">{stat.label}</p>
              <div className="flex items-center gap-1.5">
                <CircleDot className="w-3 h-3" style={{ color: stat.color }} />
                <span className="text-xs" style={{ color: stat.color }}>{stat.trend}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ═══ SERVICES — FULL WIDTH ═══ */}
      <div className="space-y-12" data-onboarding="services-section">
        {serviceCategories.map((category, catIndex) => {
          const PhaseIcon = category.phaseIcon;
          return (
            <motion.div
              key={category.phase}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + catIndex * 0.12 }}
            >
              {/* Phase Header */}
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${category.phaseColor}12` }}
                >
                  <PhaseIcon className="w-5 h-5" style={{ color: category.phaseColor }} />
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-[#273A7A]/80 text-xs tracking-[0.2em]">{category.phaseNumber}</span>
                  <h2 className="text-[#1A2753] text-lg">{category.phaseLabel}</h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-[#F5F6FA] to-transparent" />
              </div>

              {/* Services */}
              <div className="space-y-5">
                {category.services.map((service, index) => {
                  const Icon = service.icon;
                  const isPriority = (service as any).priority;
                  const isHovered = hoveredService === service.id;
                  const features = (service as any).features;
                  
                  // ── PRIORITY HERO CARD (Création d'entreprise) ──
                  if (isPriority) {
                    return (
                      <motion.button type="button"
                        key={service.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: catIndex * 0.12 + index * 0.06 }}
                        onMouseEnter={() => setHoveredService(service.id)}
                        onMouseLeave={() => setHoveredService(null)}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-left relative group rounded-3xl overflow-hidden cursor-pointer"
                        onClick={() => onNavigate(service.id)}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} transition-all duration-500`} />
                        <div className="absolute inset-0 opacity-[0.04]" style={{
                          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                        }} />
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[80px] translate-x-40 -translate-y-20" />
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#D6A93A]/5 rounded-full blur-[60px] -translate-x-20 translate-y-10" />

                        <div className="relative z-10 p-8 lg:p-10">
                          {service.badge && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-6 right-6 flex items-center gap-1.5 bg-[#D6A93A] text-[#1A2753] px-3.5 py-1.5 rounded-full shadow-lg"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="text-xs">{service.badge} brouillon{(service.badge as number) > 1 ? 's' : ''}</span>
                            </motion.div>
                          )}
                          
                          <div className="flex items-start gap-6">
                            <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white text-xl lg:text-2xl mb-2">{service.title}</h3>
                              <p className="text-white/70 text-sm mb-2 max-w-xl leading-relaxed">{service.description}</p>
                            {/* Prix et delai des la carte : ils n'apparaissaient
                                qu'apres plusieurs etapes du parcours. */}
                            {getServiceLabel(service.id) && (
                              <p className="text-[#D6A93A] text-sm mb-6">{getServiceLabel(service.id)}</p>
                            )}
                              
                              {features && (
                                <div className="flex flex-wrap gap-2.5 mb-6">
                                  {features.map((feat: string) => (
                                    <span key={feat} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-xs px-3.5 py-2 rounded-xl border border-white/5">
                                      <CheckCircle className="w-3.5 h-3.5 text-[#D6A93A]" />
                                      {feat}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <motion.div
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2.5 bg-[#D6A93A] text-[#1A2753] rounded-xl px-7 py-3.5 text-sm shadow-lg shadow-[#D6A93A]/25 hover:shadow-xl hover:shadow-[#D6A93A]/35 transition-all duration-300"
                              >
                                <Plus className="w-4.5 h-4.5" />
                                <span>Démarrer la création</span>
                                <ArrowRight className="w-4.5 h-4.5" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  }

                  // ── REGULAR SERVICE CARD (full width, horizontal) ──
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.12 + index * 0.06 }}
                      onMouseEnter={() => setHoveredService(service.id)}
                      onMouseLeave={() => setHoveredService(null)}
                      className="group bg-white rounded-2xl ring-1 ring-gray-100 hover:ring-0 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Top accent on hover */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: `linear-gradient(90deg, ${service.accentColor}, ${service.accentColor}60, transparent)` }}
                      />

                      <div className="p-6 lg:p-7 flex flex-col md:flex-row md:items-center gap-5">
                        {/* Icon */}
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg"
                          style={{ 
                            backgroundColor: isHovered ? service.accentColor : `${service.accentColor}10`,
                          }}
                        >
                          <Icon className="w-6 h-6 transition-colors duration-300" style={{ 
                            color: isHovered ? '#fff' : service.accentColor 
                          }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-1.5">
                            <h4 className="text-[#1A2753] text-base">{service.title}</h4>
                            {service.badge && (
                              <span className="flex items-center gap-1 bg-[#D6A93A]/10 text-[#D6A93A] px-2.5 py-0.5 rounded-full text-xs flex-shrink-0">
                                {service.badge} en cours
                              </span>
                            )}
                          </div>
                          <p className="text-[#273A7A]/80 text-sm mb-1 max-w-2xl">{service.description}</p>
                          {getServiceLabel(service.id) && (
                            <p className="text-[#8A6A17] text-sm mb-3">{getServiceLabel(service.id)}</p>
                          )}

                          {/* Feature pills */}
                          {features && (
                            <div className="flex flex-wrap gap-2 mb-0 md:mb-0">
                              {features.map((feat: string) => (
                                <span 
                                  key={feat} 
                                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
                                  style={{ backgroundColor: `${service.accentColor}08`, color: service.accentColor }}
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  {feat}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex gap-2.5 md:flex-col lg:flex-row">
                          {service.subActions ? (
                            service.subActions.map((action) => {
                              const ActionIcon = action.icon;
                              const isPrimary = action.icon === Plus;
                              return (
                                <motion.button
                                  key={action.id}
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={(e) => { e.stopPropagation(); onNavigate(action.id); }}
                                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm transition-all duration-300 whitespace-nowrap ${
                                    isPrimary
                                      ? 'text-white shadow-md hover:shadow-lg'
                                      : 'hover:shadow-sm'
                                  }`}
                                  style={isPrimary ? { 
                                    background: `linear-gradient(135deg, ${service.accentColor}, ${service.accentColor}cc)` 
                                  } : {
                                    backgroundColor: `${service.accentColor}08`,
                                    color: service.accentColor
                                  }}
                                >
                                  <ActionIcon className="w-4 h-4" />
                                  <span>{action.label}</span>
                                </motion.button>
                              );
                            })
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={() => onNavigate(service.id)}
                              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm text-white shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                              style={{ background: `linear-gradient(135deg, ${service.accentColor}, ${service.accentColor}cc)` }}
                            >
                              <span>Découvrir</span>
                              <ArrowRight className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ═══ BANK REQUESTS ═══ */}
      {pendingBankRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-[#1A2753]">Demandes bancaires en cours</h3>
            </div>
            <button
              onClick={() => onNavigate('my-bank-requests')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-[#D6A93A] text-xs flex items-center gap-1 hover:gap-2 transition-all"
            >
              Voir tout
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingBankRequests.slice(0, 3).map((request, index) => {
              const company = companies.find(c => c.id === request.companyId);
              const unreadMessages = request.messages.filter(m => !m.read && m.sender === 'bank').length;
              
              return (
                <motion.button
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  onClick={() => onNavigate(`bank-request-${request.id}`)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 group bg-white rounded-2xl p-5 ring-1 ring-emerald-100 hover:shadow-lg hover:ring-0 transition-all duration-300 text-left"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[#1A2753] text-sm mb-1 truncate">{company?.name}</h4>
                      <p className="text-[#273A7A]/80 text-xs">
                        {request.status === 'pending' && 'En attente de traitement'}
                        {request.status === 'documents_review' && 'Vérification en cours'}
                        {request.status === 'approved' && 'Demande approuvée'}
                        {request.status === 'appointment_scheduled' && 'RDV programmé'}
                      </p>
                    </div>
                    {unreadMessages > 0 && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                        <span className="text-white text-[10px]">{unreadMessages}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#273A7A]/80">{request.messages.length} messages</span>
                    <div className="flex items-center gap-1.5 text-emerald-600 group-hover:gap-2.5 transition-all">
                      <span>Détails</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ DRAFTS ═══ */}
      {userDrafts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#273A7A]/8 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#273A7A]" />
            </div>
            {/* Le compte figure ici : les brouillons ne sont plus fondus dans
                « En cours de création », où ils creaient un ecart avec la liste des societes. */}
            <h3 className="text-[#1A2753]">Brouillons en cours ({compteurs.drafts})</h3>
            <span className="bg-[#D6A93A]/10 text-[#D6A93A] text-xs px-2.5 py-0.5 rounded-full">{userDrafts.length}</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDrafts.map((draft, index) => (
              <motion.button
                key={draft.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + index * 0.06 }}
                onClick={() => onNavigate(`create-draft-${draft.id}`)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 group bg-white rounded-2xl p-5 ring-1 ring-[#273A7A]/10 hover:shadow-lg hover:ring-0 transition-all duration-300 text-left"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[#1A2753] text-sm mb-1 truncate">
                      {draft.formData.name || 'Brouillon sans nom'}
                    </h4>
                    <p className="text-[#273A7A]/80 text-xs">
                      {draft.formData.legalForm} • Étape {draft.currentStep}/{TOTAL_CREATION_STEPS}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="w-full h-1.5 bg-[#F5F6FA] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getCreationProgress(draft.currentStep)}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-[#D6A93A] to-amber-400 rounded-full"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#273A7A]/80">
                    {new Date(draft.updatedAt).toLocaleDateString('fr-FR')}
                  </span>
                  <div className="flex items-center gap-1.5 text-[#D6A93A] group-hover:gap-2.5 transition-all">
                    <span>Reprendre</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ COMPANIES LIST ═══ */}
      {userCompanies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1A2753]/8 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#1A2753]" />
              </div>
              <h3 className="text-[#1A2753]">Mes entreprises</h3>
              <span className="bg-[#273A7A]/8 text-[#273A7A]/80 text-xs px-2.5 py-0.5 rounded-full">{userCompanies.length}</span>
            </div>
            <button
              onClick={() => onNavigate('my-companies')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-[#D6A93A] text-xs flex items-center gap-1 hover:gap-2 transition-all"
            >
              Voir tout
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {userCompanies.slice(0, 3).map((company, index) => {
              const progress = company.status === 'completed' ? 100 :
                company.status === 'signed' ? 80 :
                company.status === 'documents_ready' ? 60 :
                company.status === 'in_review' ? 40 :
                company.status === 'submitted' ? 20 : 10;

              const statusConfig = {
                completed: { label: 'Complété', color: '#10B981', bg: 'bg-emerald-50' },
                in_progress: { label: 'En cours', color: '#3B82F6', bg: 'bg-blue-50' },
                pending: { label: 'En attente', color: '#F59E0B', bg: 'bg-amber-50' },
              }[company.status] || { label: 'Brouillon', color: '#94A3B8', bg: 'bg-gray-50' };

              return (
                <motion.button type="button"
                  key={company.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + index * 0.08 }}
                  whileHover={{ y: -3 }}
                  onClick={() => onNavigate('my-companies')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full text-left bg-white rounded-2xl p-5 ring-1 ring-gray-100 hover:ring-0 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[#1A2753] text-sm mb-1 truncate">{company.name}</h4>
                      <p className="text-[#273A7A]/80 text-xs">{company.legalForm}</p>
                    </div>
                    <span 
                      className={`${statusConfig.bg} text-xs px-2.5 py-1 rounded-lg flex-shrink-0`}
                      style={{ color: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#273A7A]/80">Activité</span>
                      <span className="text-[#1A2753] truncate ml-2 max-w-[60%] text-right">{company.activity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#273A7A]/80">Créée le</span>
                      <span className="text-[#1A2753]">
                        {new Date(company.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F5F6FA]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#273A7A]/80">Progression</span>
                      <span className="text-[#1A2753] tabular-nums">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F5F6FA] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${statusConfig.color}, ${statusConfig.color}aa)` }}
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
