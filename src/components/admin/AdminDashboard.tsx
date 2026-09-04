import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, CreditCard, Building2, Settings, Palette, TrendingUp, TrendingDown,
  Users, CheckCircle, Calculator, DollarSign, Clock, Eye, ChevronRight, 
  AlertCircle, ArrowUpRight, ArrowDownRight, Activity, Calendar, Bell,
  PenTool, Home, Edit3, Megaphone, Briefcase, BadgeCheck, FileSignature
} from '../ui/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useApp } from '../../context/AppContext';
import { mockPayments, mockBrandingProjects, mockModifications } from '../../data/mockData';
import { mockAccountingFolders } from '../../data/accountingData';
import { formatFCFACompact } from '../../lib/format';

const monthlyData = [
  { month: 'Juin', demandes: 8, completed: 5 },
  { month: 'Juil', demandes: 12, completed: 9 },
  { month: 'Août', demandes: 19, completed: 15 },
  { month: 'Sept', demandes: 15, completed: 12 },
  { month: 'Oct', demandes: 25, completed: 20 },
  { month: 'Nov', demandes: 22, completed: 18 },
];

const revenueData = [
  { month: 'Juin', revenue: 4500 },
  { month: 'Juil', revenue: 6200 },
  { month: 'Août', revenue: 8900 },
  { month: 'Sept', revenue: 7100 },
  { month: 'Oct', revenue: 11500 },
  { month: 'Nov', revenue: 10200 },
];

const paymentData = [
  { name: 'Orange Money', value: 45, color: '#F97316' },
  { name: 'Wave', value: 35, color: '#3B82F6' },
  { name: 'Carte bancaire', value: 20, color: '#8B5CF6' },
];

// Données pour revenus par service
const revenueByServiceData = [
  { month: 'Juin', creation: 1200, domiciliation: 800, branding: 1500, compta: 1000 },
  { month: 'Juil', creation: 1600, domiciliation: 900, branding: 2100, compta: 1600 },
  { month: 'Août', creation: 2200, domiciliation: 1200, branding: 3100, compta: 2400 },
  { month: 'Sept', creation: 1800, domiciliation: 1000, branding: 2400, compta: 1900 },
  { month: 'Oct', creation: 2800, domiciliation: 1400, branding: 4200, compta: 3100 },
  { month: 'Nov', creation: 2450, domiciliation: 1800, branding: 3150, compta: 2800 },
];

// Données pour nouveaux clients
const newClientsData = [
  { week: 'S1', clients: 12, objectif: 15 },
  { week: 'S2', clients: 18, objectif: 15 },
  { week: 'S3', clients: 15, objectif: 15 },
  { week: 'S4', clients: 22, objectif: 15 },
];

// Données pour distribution géographique
const geoData = [
  { region: 'Dakar', value: 45, color: '#D6A93A' },
  { region: 'Thiès', value: 20, color: '#1A2753' },
  { region: 'Saint-Louis', value: 15, color: '#273A7A' },
  { region: 'Kaolack', value: 12, color: '#3B82F6' },
  { region: 'Autres', value: 8, color: '#94A3B8' },
];

// Données pour activité hebdomadaire
const weeklyActivityData = [
  { day: 'Lun', visites: 145, conversions: 32 },
  { day: 'Mar', visites: 178, conversions: 45 },
  { day: 'Mer', visites: 192, conversions: 52 },
  { day: 'Jeu', visites: 165, conversions: 38 },
  { day: 'Ven', visites: 210, conversions: 68 },
  { day: 'Sam', visites: 98, conversions: 18 },
  { day: 'Dim', visites: 76, conversions: 12 },
];

// Données pour statuts de dossiers
const statusDistributionData = [
  { name: 'Complétés', value: 35, color: '#10B981' },
  { name: 'En cours', value: 42, color: '#F59E0B' },
  { name: 'En attente', value: 18, color: '#EF4444' },
  { name: 'Signés', value: 25, color: '#3B82F6' },
];

export const AdminDashboard: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const { companies, notifications } = useApp();
  
  const completedCompanies = companies.filter(c => c.status === 'completed').length;
  const inReviewCompanies = companies.filter(c => c.status === 'in_review').length;
  const totalRevenue = mockPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const monthlyRevenue = revenueData[revenueData.length - 1].revenue * 1000;
  
  const stats = [
    { 
      label: 'Dossiers actifs', 
      value: companies.length, 
      trend: 'up',
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Paiements validés', 
      value: formatFCFACompact(totalRevenue), 
      trend: 'up',
      icon: DollarSign, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    { 
      label: 'En révision', 
      value: inReviewCompanies, 
      trend: 'down',
      icon: AlertCircle, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    { 
      label: 'Taux de complétion', 
      value: `${Math.round((completedCompanies / companies.length) * 100)}%`, 
      trend: 'up',
      icon: Activity, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
  ];

  const quickActions = [
    { label: 'Nouveau dossier', page: 'dossiers', icon: FileText, color: 'bg-blue-500' },
    { label: 'Rendez-vous', page: 'appointments', icon: Calendar, color: 'bg-purple-500' },
    { label: 'Paiements', page: 'payments', icon: CreditCard, color: 'bg-emerald-500' },
    { label: 'Banques', page: 'banks', icon: Building2, color: 'bg-orange-500' },
  ];

  // Statistiques par service
  const serviceStats = [
    {
      title: 'Création d\'entreprise',
      icon: Briefcase,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      total: companies.length,
      enCours: companies.filter(c => c.status === 'in_review').length,
      completed: completedCompanies,
      revenue: formatFCFACompact(2_450_000),
      page: 'dossiers'
    },
    {
      title: 'Domiciliation',
      icon: Home,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      total: 18,
      enCours: 5,
      completed: 13,
      revenue: formatFCFACompact(1_800_000),
      page: 'domiciliation'
    },
    {
      title: 'Modifications',
      icon: Edit3,
      color: 'bg-cyan-500',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      total: mockModifications.length,
      enCours: mockModifications.filter(m => m.status === 'pending').length,
      completed: mockModifications.filter(m => m.status === 'completed').length,
      revenue: formatFCFACompact(920_000),
      page: 'modifications'
    },
    {
      title: 'Branding & Communication',
      icon: Megaphone,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      total: mockBrandingProjects.length,
      enCours: mockBrandingProjects.filter(p => p.status === 'in_progress').length,
      completed: mockBrandingProjects.filter(p => p.status === 'completed').length,
      revenue: formatFCFACompact(3_150_000),
      page: 'branding'
    },
    {
      title: 'Comptabilité',
      icon: Calculator,
      color: 'bg-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      total: mockAccountingFolders.length,
      enCours: mockAccountingFolders.filter(f => f.status === 'active').length,
      completed: mockAccountingFolders.filter(f => f.currentMonth?.status === 'completed').length,
      revenue: formatFCFACompact(4_500_000),
      page: 'accounting'
    },
    {
      title: 'Rendez-vous',
      icon: Calendar,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      total: 42,
      enCours: 8,
      completed: 34,
      revenue: 'Gratuit',
      page: 'appointments'
    },
  ];

  // Métriques avancées
  const advancedMetrics = [
    {
      label: 'Taux de conversion',
      value: '68%',
      trend: 'up',
      description: 'Visiteurs → Clients',
      icon: TrendingUp,
      color: 'emerald'
    },
    {
      label: 'Satisfaction client',
      value: '4.8/5',
      trend: 'up',
      description: 'Note moyenne globale',
      icon: Users,
      color: 'purple'
    },
    {
      label: 'Temps moyen traitement',
      value: '3.2 jours',
      trend: 'up',
      description: 'Création d\'entreprise',
      icon: Clock,
      color: 'blue'
    },
    {
      label: 'Taux de rétention',
      value: '85%',
      trend: 'up',
      description: 'Clients récurrents',
      icon: Activity,
      color: 'orange'
    },
  ];

  // Données pour graphique de performance par service
  const servicePerformanceData = [
    { service: 'Création', score: 92, satisfaction: 4.7 },
    { service: 'Domiciliation', score: 88, satisfaction: 4.5 },
    { service: 'Modifications', score: 85, satisfaction: 4.4 },
    { service: 'Branding', score: 95, satisfaction: 4.9 },
    { service: 'Comptabilité', score: 90, satisfaction: 4.6 },
    { service: 'RDV', score: 87, satisfaction: 4.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#1A2753] via-[#273A7A] to-[#1A2753] rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Bienvenue sur votre Dashboard</h2>
            <p className="text-white/80">Voici un aperçu de l'activité de la plateforme Crésus</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm mb-1">Date du jour</p>
            <p className="text-xl font-semibold">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#D6A93A]/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${stat.textColor}`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[#273A7A]/80 text-sm mb-2">{stat.label}</p>
              <p className="text-[#1A2753] text-2xl font-bold">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              onClick={() => onNavigate && onNavigate(action.page)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] bg-white hover:bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-3 border border-gray-100 hover:border-[#D6A93A]/30"
            >
              <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#1A2753] font-medium text-sm">{action.label}</span>
              <ChevronRight className="w-4 h-4 text-[#273A7A]/40 ml-auto" />
            </motion.button>
          );
        })}
      </div>

      {/* Advanced Metrics - NEW */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border-2 border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[#1A2753] text-lg font-semibold mb-1">Métriques avancées</h3>
            <p className="text-[#273A7A]/80 text-sm">Indicateurs de performance clés de la plateforme</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advancedMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const colorClasses = {
              emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500/20' },
              purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-500/20' },
              blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-500/20' },
              orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-500/20' },
            };
            const colors = colorClasses[metric.color as keyof typeof colorClasses];
            
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="relative bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-[#D6A93A]/40 group"
              >
                {/* Icône animée */}
                <div className={`absolute -top-4 -right-4 w-20 h-20 ${colors.light} rounded-full opacity-50 blur-2xl group-hover:opacity-70 transition-opacity`} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${colors.light} w-12 h-12 rounded-lg flex items-center justify-center ring-4 ${colors.ring} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${colors.light}`}>
                      {metric.trend === 'up' && <TrendingUp className={`w-3 h-3 ${colors.text}`} />}

                    </div>
                  </div>
                  
                  <p className="text-[#273A7A]/80 text-xs mb-1">{metric.label}</p>
                  <p className={`text-3xl font-bold mb-2 ${colors.text}`}>{metric.value}</p>
                  <p className="text-[#273A7A]/80 text-xs">{metric.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Larger */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[#1A2753] text-lg font-semibold mb-1">Chiffre d'affaires mensuel</h3>
              <p className="text-[#273A7A]/80 text-sm">Évolution des revenus sur 6 mois</p>
            </div>
            <div className="text-right">
              <p className="text-[#273A7A]/80 text-xs mb-1">Ce mois</p>
              <p className="text-emerald-600 text-2xl font-bold">{formatFCFACompact(monthlyRevenue)}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F6FA" />
              <XAxis dataKey="month" stroke="#273A7A" fontSize={12} />
              <YAxis stroke="#273A7A" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-[#1A2753] text-lg font-semibold mb-6">Modes de paiement</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {paymentData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[#1A2753] text-sm font-medium">{entry.name}</span>
                </div>
                <span className="text-[#273A7A] font-semibold">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart - Full Width */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[#1A2753] text-lg font-semibold mb-1">Activité des dossiers</h3>
            <p className="text-[#273A7A]/80 text-sm">Demandes créées vs complétées</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F6FA" />
            <XAxis dataKey="month" stroke="#273A7A" fontSize={12} />
            <YAxis stroke="#273A7A" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Bar dataKey="demandes" fill="#D6A93A" radius={[8, 8, 0, 0]} name="Demandes" />
            <Bar dataKey="completed" fill="#10B981" radius={[8, 8, 0, 0]} name="Complétées" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Services Statistics - NEW SECTION */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[#1A2753] text-lg font-semibold mb-1">Statistiques par service</h3>
            <p className="text-[#273A7A]/80 text-sm">Vue d'ensemble de tous les modules de la plateforme</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {serviceStats.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.button type="button"
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onNavigate && onNavigate(service.page)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full text-left group cursor-pointer bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-[#D6A93A]/50 rounded-xl p-5 transition-all duration-300 hover:shadow-xl"
              >
                {/* Header avec icône */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`${service.bgColor} w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${service.textColor}`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#D6A93A] transition-colors" />
                </div>

                {/* Titre */}
                <h4 className="text-[#1A2753] font-semibold mb-3 text-sm leading-tight">
                  {service.title}
                </h4>

                {/* Stats */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#273A7A]/80">Total</span>
                    <span className="text-sm font-bold text-[#1A2753]">{service.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-orange-600">En cours</span>
                    <span className="text-sm font-semibold text-orange-600">{service.enCours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">Complétés</span>
                    <span className="text-sm font-semibold text-green-600">{service.completed}</span>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full ${service.color} transition-all duration-500`}
                    style={{ width: `${(service.completed / service.total) * 100}%` }}
                  />
                </div>

                {/* Revenue */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#273A7A]/80">Revenus</span>
                    <span className={`text-xs font-bold ${service.textColor}`}>{service.revenue}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Service Performance Chart */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-[#1A2753] font-semibold mb-4">Performance et satisfaction par service</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={servicePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="service" stroke="#273A7A" fontSize={11} />
              <YAxis stroke="#273A7A" fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="score" fill="#D6A93A" radius={[8, 8, 0, 0]} name="Score %" />
              <Bar dataKey="satisfaction" fill="#10B981" radius={[8, 8, 0, 0]} name="Satisfaction /5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NEW GRAPHS SECTION */}
      {/* Revenue by Service - Stacked Area */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[#1A2753] text-lg font-semibold mb-1">Revenus par service</h3>
            <p className="text-[#273A7A]/80 text-sm">Détail des revenus mensuels par module</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueByServiceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#273A7A" fontSize={11} />
            <YAxis stroke="#273A7A" fontSize={11} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Bar dataKey="creation" stackId="a" fill="#3B82F6" name="Création" radius={[0, 0, 0, 0]} />
            <Bar dataKey="domiciliation" stackId="a" fill="#F97316" name="Domiciliation" radius={[0, 0, 0, 0]} />
            <Bar dataKey="branding" stackId="a" fill="#EC4899" name="Branding" radius={[0, 0, 0, 0]} />
            <Bar dataKey="compta" stackId="a" fill="#10B981" name="Comptabilité" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* New Clients & Geographical Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* New Clients Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[#1A2753] text-lg font-semibold mb-1">Nouveaux clients</h3>
              <p className="text-[#273A7A]/80 text-sm">Performance hebdomadaire</p>
            </div>
            <div className="text-right">
              <p className="text-[#273A7A]/80 text-xs mb-1">Cette semaine</p>
              <p className="text-emerald-600 text-xl font-bold">22 clients</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={newClientsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F6FA" />
              <XAxis dataKey="week" stroke="#273A7A" fontSize={12} />
              <YAxis stroke="#273A7A" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Bar dataKey="objectif" fill="#E5E7EB" radius={[8, 8, 0, 0]} name="Objectif" />
              <Bar dataKey="clients" fill="#D6A93A" radius={[8, 8, 0, 0]} name="Clients" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Geographical Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-[#1A2753] text-lg font-semibold mb-6">Répartition géographique</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={geoData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => `${entry.value}%`}
              >
                {geoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {geoData.map((entry) => (
              <div key={entry.region} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[#1A2753] text-xs font-medium">{entry.region}</span>
                <span className="text-[#273A7A]/80 text-xs ml-auto">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Activity & Status Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[#1A2753] text-lg font-semibold mb-1">Activité hebdomadaire</h3>
              <p className="text-[#273A7A]/80 text-sm">Visites et conversions par jour</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F6FA" />
              <XAxis dataKey="day" stroke="#273A7A" fontSize={12} />
              <YAxis stroke="#273A7A" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="visites" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 4 }}
                name="Visites"
              />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="#D6A93A" 
                strokeWidth={3}
                dot={{ fill: '#D6A93A', r: 4 }}
                name="Conversions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-[#1A2753] text-lg font-semibold mb-6">Statut des dossiers</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {statusDistributionData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[#1A2753] text-sm font-medium">{entry.name}</span>
                </div>
                <span className="text-[#273A7A] font-semibold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Dossiers récents */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#1A2753] text-lg font-semibold">Dossiers récents</h3>
            <button
              onClick={() => onNavigate && onNavigate('dossiers')}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] text-[#D6A93A] hover:text-[#1A2753] text-sm font-medium flex items-center gap-1 transition-colors"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {companies.slice(0, 4).map((company) => (
              <div key={company.id} className="p-4 bg-[#F5F6FA] rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#D6A93A]/30 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-[#D6A93A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#1A2753] font-semibold">{company.name}</p>
                      <p className="text-[#273A7A]/80 text-sm">{company.legalForm}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${
                    company.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    company.status === 'signed' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {company.status === 'in_review' ? 'En cours' :
                     company.status === 'signed' ? 'Signé' : 
                     company.status === 'completed' ? 'Terminé' : company.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};