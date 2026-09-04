import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  DollarSign,
  Building2,
  FileText,
  Users,
  TrendingUp,
  Eye,
  Filter,
  Bell,
  CalendarDays,
  ArrowRight,
  Info,
  X,
} from '../ui/icons';

interface FiscalDeadline {
  id: string;
  companyId: string;
  companyName: string;
  type: 'tva' | 'ir' | 'is' | 'css' | 'cfce' | 'acompte' | 'patente' | 'retenue_source';
  period: string;
  dueDate: string;
  status: 'a_preparer' | 'en_cours' | 'declare' | 'paye';
  estimatedAmount?: number;
  notes?: string;
  recurrence?: 'mensuelle' | 'trimestrielle' | 'annuelle';
}

const mockDeadlines: FiscalDeadline[] = [
  // Mars 2026
  { id: 'fd-1', companyId: 'c1', companyName: 'Tech Solutions SARL', type: 'tva', period: 'Fevrier 2026', dueDate: '2026-03-15', status: 'a_preparer', estimatedAmount: 2450000, recurrence: 'mensuelle' },
  { id: 'fd-2', companyId: 'c2', companyName: 'Commerce Plus SA', type: 'tva', period: 'Fevrier 2026', dueDate: '2026-03-15', status: 'en_cours', estimatedAmount: 5780000, recurrence: 'mensuelle' },
  { id: 'fd-3', companyId: 'c1', companyName: 'Tech Solutions SARL', type: 'ir', period: 'Fevrier 2026', dueDate: '2026-03-10', status: 'declare', estimatedAmount: 1250000, recurrence: 'mensuelle' },
  { id: 'fd-4', companyId: 'c5', companyName: 'BTP Construction SA', type: 'retenue_source', period: 'Fevrier 2026', dueDate: '2026-03-10', status: 'paye', estimatedAmount: 1320000, recurrence: 'mensuelle' },
  { id: 'fd-5', companyId: 'c3', companyName: 'Services Conseils SUARL', type: 'tva', period: 'Fevrier 2026', dueDate: '2026-03-15', status: 'a_preparer', estimatedAmount: 1950000, recurrence: 'mensuelle' },
  { id: 'fd-6', companyId: 'c4', companyName: 'Import Export SARL', type: 'tva', period: 'Fevrier 2026', dueDate: '2026-03-15', status: 'a_preparer', estimatedAmount: 8900000, recurrence: 'mensuelle' },
  { id: 'fd-7', companyId: 'c2', companyName: 'Commerce Plus SA', type: 'ir', period: 'Fevrier 2026', dueDate: '2026-03-10', status: 'en_cours', estimatedAmount: 3200000, recurrence: 'mensuelle' },
  { id: 'fd-8', companyId: 'c5', companyName: 'BTP Construction SA', type: 'tva', period: 'Fevrier 2026', dueDate: '2026-03-15', status: 'en_cours', estimatedAmount: 12500000, recurrence: 'mensuelle' },
  // Fin Mars
  { id: 'fd-9', companyId: 'c1', companyName: 'Tech Solutions SARL', type: 'css', period: 'T1 2026', dueDate: '2026-03-31', status: 'a_preparer', estimatedAmount: 3500000, recurrence: 'trimestrielle' },
  { id: 'fd-10', companyId: 'c2', companyName: 'Commerce Plus SA', type: 'css', period: 'T1 2026', dueDate: '2026-03-31', status: 'a_preparer', estimatedAmount: 4200000, recurrence: 'trimestrielle' },
  // Avril 2026
  { id: 'fd-11', companyId: 'c1', companyName: 'Tech Solutions SARL', type: 'is', period: 'Exercice 2025', dueDate: '2026-04-30', status: 'a_preparer', estimatedAmount: 15000000, recurrence: 'annuelle', notes: 'Clôture 31/12/2025' },
  { id: 'fd-12', companyId: 'c4', companyName: 'Import Export SARL', type: 'is', period: 'Exercice 2025', dueDate: '2026-04-30', status: 'a_preparer', estimatedAmount: 22000000, recurrence: 'annuelle' },
  { id: 'fd-13', companyId: 'c1', companyName: 'Tech Solutions SARL', type: 'tva', period: 'Mars 2026', dueDate: '2026-04-15', status: 'a_preparer', estimatedAmount: 2600000, recurrence: 'mensuelle' },
  { id: 'fd-14', companyId: 'c2', companyName: 'Commerce Plus SA', type: 'tva', period: 'Mars 2026', dueDate: '2026-04-15', status: 'a_preparer', estimatedAmount: 6100000, recurrence: 'mensuelle' },
  { id: 'fd-15', companyId: 'c3', companyName: 'Services Conseils SUARL', type: 'tva', period: 'Mars 2026', dueDate: '2026-04-15', status: 'a_preparer', estimatedAmount: 2100000, recurrence: 'mensuelle' },
  // Mai 2026
  { id: 'fd-16', companyId: 'c5', companyName: 'BTP Construction SA', type: 'is', period: 'Exercice 2025', dueDate: '2026-04-30', status: 'a_preparer', estimatedAmount: 35000000, recurrence: 'annuelle' },
  // Juin 2026
  { id: 'fd-17', companyId: 'c1', companyName: 'Tech Solutions SARL', type: 'patente', period: '2026', dueDate: '2026-06-30', status: 'a_preparer', estimatedAmount: 850000, recurrence: 'annuelle' },
  { id: 'fd-18', companyId: 'c5', companyName: 'BTP Construction SA', type: 'patente', period: '2026', dueDate: '2026-06-30', status: 'a_preparer', estimatedAmount: 1500000, recurrence: 'annuelle' },
  { id: 'fd-19', companyId: 'c2', companyName: 'Commerce Plus SA', type: 'cfce', period: '2026', dueDate: '2026-06-30', status: 'a_preparer', estimatedAmount: 4500000, recurrence: 'annuelle' },
];

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const AccountantCalendar: React.FC = () => {
  const today = new Date(2026, 2, 3); // March 3, 2026
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [filterType, setFilterType] = useState<string>('tous');
  const [filterCompany, setFilterCompany] = useState<string>('tous');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<FiscalDeadline | null>(null);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      tva: 'TVA',
      ir: 'IR (Salaires)',
      is: 'IS (Impôt sociétés)',
      css: 'CSS',
      cfce: 'CFCE',
      acompte: 'Acompte IS',
      patente: 'Patente',
      retenue_source: 'Retenue source',
    };
    return labels[type] || type.toUpperCase();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      tva: 'bg-blue-100 text-blue-700 border-blue-200',
      ir: 'bg-purple-100 text-purple-700 border-purple-200',
      is: 'bg-red-100 text-red-700 border-red-200',
      css: 'bg-teal-100 text-teal-700 border-teal-200',
      cfce: 'bg-orange-100 text-orange-700 border-orange-200',
      acompte: 'bg-amber-100 text-amber-700 border-amber-200',
      patente: 'bg-green-100 text-green-700 border-green-200',
      retenue_source: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getTypeDotColor = (type: string) => {
    const colors: Record<string, string> = {
      tva: 'bg-blue-500',
      ir: 'bg-purple-500',
      is: 'bg-red-500',
      css: 'bg-teal-500',
      cfce: 'bg-orange-500',
      acompte: 'bg-amber-500',
      patente: 'bg-green-500',
      retenue_source: 'bg-indigo-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      a_preparer: 'bg-orange-100 text-orange-700',
      en_cours: 'bg-blue-100 text-blue-700',
      declare: 'bg-purple-100 text-purple-700',
      paye: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      a_preparer: 'A préparer',
      en_cours: 'En cours',
      declare: 'Déclarée',
      paye: 'Payée',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'a_preparer': return <Clock className="w-4 h-4" />;
      case 'en_cours': return <Send className="w-4 h-4" />;
      case 'declare': return <FileText className="w-4 h-4" />;
      case 'paye': return <CheckCircle2 className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calendar helpers
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday = 0
  };

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
  };

  const companies = useMemo(() => {
    const unique = [...new Set(mockDeadlines.map(d => d.companyName))];
    return unique.sort();
  }, []);

  const filteredDeadlines = useMemo(() => {
    return mockDeadlines.filter(d => {
      if (filterType !== 'tous' && d.type !== filterType) return false;
      if (filterCompany !== 'tous' && d.companyName !== filterCompany) return false;
      return true;
    });
  }, [filterType, filterCompany]);

  const getDeadlinesForDate = (dateStr: string) => {
    return filteredDeadlines.filter(d => d.dueDate === dateStr);
  };

  const getDeadlinesForMonth = (month: number, year: number) => {
    return filteredDeadlines.filter(d => {
      const date = new Date(d.dueDate);
      return date.getMonth() === month && date.getFullYear() === year;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const monthDeadlines = getDeadlinesForMonth(currentMonth, currentYear);

  // Stats for the month
  const monthStats = useMemo(() => {
    const deadlines = getDeadlinesForMonth(currentMonth, currentYear);
    return {
      total: deadlines.length,
      aPreparer: deadlines.filter(d => d.status === 'a_preparer').length,
      enCours: deadlines.filter(d => d.status === 'en_cours').length,
      declare: deadlines.filter(d => d.status === 'declare').length,
      paye: deadlines.filter(d => d.status === 'paye').length,
      totalAmount: deadlines.reduce((sum, d) => sum + (d.estimatedAmount || 0), 0),
    };
  }, [currentMonth, currentYear, filterType, filterCompany]);

  // Upcoming 7 days
  const upcomingDeadlines = useMemo(() => {
    return filteredDeadlines
      .filter(d => {
        const days = getDaysUntilDue(d.dueDate);
        return days >= 0 && days <= 14 && d.status !== 'paye';
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [filterType, filterCompany]);

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const cells: React.ReactNode[] = [];

    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-28 bg-gray-50/50 rounded-lg" />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const deadlines = getDeadlinesForDate(dateStr);
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      const isSelected = selectedDate === dateStr;
      const hasDeadlines = deadlines.length > 0;
      const hasUrgent = deadlines.some(d => d.status === 'a_preparer' || d.status === 'en_cours');

      cells.push(
        <button type="button"
          key={day}
          onClick={() => hasDeadlines ? setSelectedDate(isSelected ? null : dateStr) : null}
          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full text-left h-28 rounded-lg border transition-all relative overflow-hidden ${
            isSelected
              ? 'border-[#D6A93A] bg-[#D6A93A]/5 ring-2 ring-[#D6A93A]/20'
              : isToday
              ? 'border-[#273A7A] bg-[#273A7A]/5'
              : hasDeadlines
              ? 'border-gray-200 bg-white hover:border-[#D6A93A]/50 cursor-pointer'
              : 'border-gray-100 bg-white'
          }`}
        >
          <div className="p-2">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm ${
                isToday ? 'text-white bg-[#273A7A] w-7 h-7 rounded-full flex items-center justify-center' :
                'text-[#273A7A]/80'
              }`}>
                {day}
              </span>
              {hasDeadlines && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  hasUrgent ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                  {deadlines.length}
                </span>
              )}
            </div>
            <div className="space-y-1">
              {deadlines.slice(0, 2).map(d => (
                <div
                  key={d.id}
                  className="flex items-center gap-1 text-xs truncate"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getTypeDotColor(d.type)}`} />
                  <span className="truncate text-[#273A7A]/80">{getTypeLabel(d.type)}</span>
                </div>
              ))}
              {deadlines.length > 2 && (
                <span className="text-xs text-[#D6A93A]">+{deadlines.length - 2} autres</span>
              )}
            </div>
          </div>
        </button>
      );
    }

    return cells;
  };

  const selectedDateDeadlines = selectedDate ? getDeadlinesForDate(selectedDate) : [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#1A2753] mb-2">Échéancier fiscal</h1>
          <p className="text-[#273A7A]/80">
            Calendrier des obligations fiscales de vos clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 rounded-lg text-sm transition-all ${
                viewMode === 'calendar'
                  ? 'bg-[#1A2753] text-white'
                  : 'text-[#273A7A]/80 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Calendrier
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 rounded-lg text-sm transition-all ${
                viewMode === 'timeline'
                  ? 'bg-[#1A2753] text-white'
                  : 'text-[#273A7A]/80 hover:bg-gray-50'
              }`}
            >
              <CalendarDays className="w-4 h-4 inline mr-2" />
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Alerts */}
      {upcomingDeadlines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#1A2753] mb-3">
                Prochaines échéances ({upcomingDeadlines.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {upcomingDeadlines.slice(0, 4).map(d => {
                  const days = getDaysUntilDue(d.dueDate);
                  return (
                    <button type="button"
                      key={d.id}
                      onClick={() => { setSelectedDeadline(d); setShowDetailModal(true); }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full text-left bg-white rounded-lg p-3 flex items-center justify-between cursor-pointer hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${getTypeDotColor(d.type)}`} />
                        <div>
                          <p className="text-sm text-[#1A2753]">
                            {getTypeLabel(d.type)} - {d.companyName}
                          </p>
                          <p className="text-xs text-[#273A7A]/80">{d.period}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${days <= 3 ? 'text-red-600' : days <= 7 ? 'text-orange-600' : 'text-[#273A7A]/80'}`}>
                          {days === 0 ? "Aujourd'hui" : days === 1 ? 'Demain' : `J-${days}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {upcomingDeadlines.length > 4 && (
                <p className="text-sm text-orange-600 mt-2 text-center">
                  +{upcomingDeadlines.length - 4} autres échéances à venir
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats for current month */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total', value: monthStats.total, icon: FileText, color: 'text-[#1A2753]', bg: 'bg-[#F5F6FA]' },
          { label: 'A préparer', value: monthStats.aPreparer, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'En cours', value: monthStats.enCours, icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Déclarées', value: monthStats.declare, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Payées', value: monthStats.paye, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Montant est.', value: null, icon: DollarSign, color: 'text-[#D6A93A]', bg: 'bg-amber-50', amount: monthStats.totalAmount },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-xl ${stat.color}`}>
              {stat.amount !== undefined ? formatAmount(stat.amount) : stat.value}
            </p>
            <p className="text-xs text-[#273A7A]/80 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 flex flex-wrap gap-4 items-center">
        <Filter className="w-5 h-5 text-[#273A7A]/40" />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A93A] bg-white"
        >
          <option value="tous">Tous types</option>
          <option value="tva">TVA</option>
          <option value="ir">IR (Salaires)</option>
          <option value="is">IS</option>
          <option value="css">CSS</option>
          <option value="cfce">CFCE</option>
          <option value="acompte">Acompte IS</option>
          <option value="patente">Patente</option>
          <option value="retenue_source">Retenue source</option>
        </select>
        <select
          value={filterCompany}
          onChange={e => setFilterCompany(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D6A93A] bg-white"
        >
          <option value="tous">Toutes les entreprises</option>
          {companies.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {/* Legend */}
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-xs text-[#273A7A]/80">
          {['tva', 'ir', 'is', 'patente', 'css'].map(type => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded-full ${getTypeDotColor(type)}`} />
              <span>{getTypeLabel(type)}</span>
            </div>
          ))}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Month Navigation */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <button aria-label="Mois précédent"
                  onClick={() => navigateMonth(-1)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#273A7A]" />
                </button>
                <h2 className="text-[#1A2753]">
                  {MONTHS_FR[currentMonth]} {currentYear}
                </h2>
                <button aria-label="Mois suivant"
                  onClick={() => navigateMonth(1)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-[#273A7A]" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 px-4 pt-4">
                {DAYS_FR.map(day => (
                  <div key={day} className="text-center text-xs text-[#273A7A]/80 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 p-4">
                {renderCalendarGrid()}
              </div>
            </div>
          </div>

          {/* Side Panel - Selected date or month summary */}
          <div>
            <AnimatePresence mode="wait">
              {selectedDate && selectedDateDeadlines.length > 0 ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl border border-gray-100 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#1A2753]">
                      {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    <button aria-label="Fermer le détail du jour"
                      onClick={() => setSelectedDate(null)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedDateDeadlines.map(d => (
                      <button type="button"
                        key={d.id}
                        onClick={() => { setSelectedDeadline(d); setShowDetailModal(true); }}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] block w-full text-left p-4 bg-[#F5F6FA] rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${getTypeColor(d.type)}`}>
                            {getTypeLabel(d.type)}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(d.status)}`}>
                            {getStatusLabel(d.status)}
                          </span>
                        </div>
                        <p className="text-sm text-[#1A2753] mb-1">{d.companyName}</p>
                        <p className="text-xs text-[#273A7A]/80 mb-2">{d.period}</p>
                        {d.estimatedAmount && (
                          <p className="text-sm text-[#D6A93A]">{formatAmount(d.estimatedAmount)}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl border border-gray-100 p-6"
                >
                  <h3 className="text-[#1A2753] mb-4">
                    {MONTHS_FR[currentMonth]} {currentYear}
                  </h3>
                  {monthDeadlines.length > 0 ? (
                    <div className="space-y-3">
                      {monthDeadlines.map(d => {
                        const days = getDaysUntilDue(d.dueDate);
                        return (
                          <button type="button"
                            key={d.id}
                            onClick={() => { setSelectedDeadline(d); setShowDetailModal(true); }}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-[#F5F6FA] cursor-pointer transition-colors"
                          >
                            <div className={`w-1.5 h-10 rounded-full ${getTypeDotColor(d.type)}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-[#1A2753] truncate">{getTypeLabel(d.type)}</p>
                                <span className={`flex-shrink-0 px-1.5 py-0.5 text-xs rounded-full ${getStatusColor(d.status)}`}>
                                  {getStatusLabel(d.status)}
                                </span>
                              </div>
                              <p className="text-xs text-[#273A7A]/80 truncate">{d.companyName}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-[#273A7A]/80">
                                {new Date(d.dueDate).getDate()}/{currentMonth + 1}
                              </p>
                              {d.estimatedAmount && (
                                <p className="text-xs text-[#D6A93A]">{formatAmount(d.estimatedAmount)}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-[#273A7A]/20 mx-auto mb-3" />
                      <p className="text-[#273A7A]/80 text-sm">Aucune échéance ce mois</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <button aria-label="Mois précédent" onClick={() => navigateMonth(-1)} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-[#273A7A]" />
              </button>
              <h2 className="text-[#1A2753]">
                {MONTHS_FR[currentMonth]} {currentYear}
              </h2>
              <button aria-label="Mois suivant" onClick={() => navigateMonth(1)} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-[#273A7A]" />
              </button>
            </div>
            <p className="text-sm text-[#273A7A]/80">
              {monthDeadlines.length} échéance{monthDeadlines.length > 1 ? 's' : ''}
            </p>
          </div>

          {monthDeadlines.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {(() => {
                let currentDate = '';
                return monthDeadlines.map(d => {
                  const showDateHeader = d.dueDate !== currentDate;
                  currentDate = d.dueDate;
                  const days = getDaysUntilDue(d.dueDate);
                  const isUrgent = days >= 0 && days <= 7 && d.status !== 'paye';
                  const isOverdue = days < 0 && d.status !== 'paye';

                  return (
                    <div key={d.id}>
                      {showDateHeader && (
                        <div className={`px-6 py-2 flex items-center gap-3 ${
                          isOverdue ? 'bg-red-50' : isUrgent ? 'bg-orange-50/50' : 'bg-gray-50/50'
                        }`}>
                          <CalendarDays className={`w-4 h-4 ${
                            isOverdue ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-[#273A7A]/40'
                          }`} />
                          <span className={`text-sm ${
                            isOverdue ? 'text-red-700' : isUrgent ? 'text-orange-700' : 'text-[#273A7A]/80'
                          }`}>
                            {new Date(d.dueDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          {isOverdue && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">En retard</span>}
                          {isUrgent && <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">J-{days}</span>}
                        </div>
                      )}
                      <button type="button"
                        onClick={() => { setSelectedDeadline(d); setShowDetailModal(true); }}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-[#F5F6FA]/50 cursor-pointer transition-colors"
                      >
                        <div className={`w-1.5 h-12 rounded-full ${getTypeDotColor(d.type)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${getTypeColor(d.type)}`}>
                              {getTypeLabel(d.type)}
                            </span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${getStatusColor(d.status)}`}>
                              {getStatusIcon(d.status)}
                              {getStatusLabel(d.status)}
                            </span>
                            {d.recurrence && (
                              <span className="text-xs text-[#273A7A]/80">
                                ({d.recurrence})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#273A7A]/40" />
                              <span className="text-sm text-[#1A2753]">{d.companyName}</span>
                            </div>
                            <span className="text-sm text-[#273A7A]/80">{d.period}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {d.estimatedAmount && (
                            <p className="text-sm text-[#D6A93A]">{formatAmount(d.estimatedAmount)}</p>
                          )}
                        </div>
                        <Eye className="w-4 h-4 text-[#273A7A]/30" />
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-[#273A7A]/20 mx-auto mb-4" />
              <p className="text-[#273A7A]/80">Aucune échéance fiscale pour ce mois</p>
            </div>
          )}
        </div>
      )}

      {/* Rappel réglementaire */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="mb-1"><strong>Rappel des échéances DGID :</strong></p>
            <ul className="space-y-0.5 text-xs text-blue-700">
              <li>- TVA / Retenues source : 15 du mois suivant</li>
              <li>- IR (salaires) : 10 du mois suivant</li>
              <li>- CSS (trimestrielle) : fin du mois suivant le trimestre</li>
              <li>- IS (annuel) : 30 avril de l'année suivante</li>
              <li>- Patente : 30 juin de l'année en cours</li>
              <li>- CFCE : 30 juin de l'année en cours</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedDeadline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#1A2753]">Détail de l'échéance</h3>
                  <button aria-label="Fermer"
                    onClick={() => setShowDetailModal(false)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-sm rounded-full border ${getTypeColor(selectedDeadline.type)}`}>
                    {getTypeLabel(selectedDeadline.type)}
                  </span>
                  <span className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-full ${getStatusColor(selectedDeadline.status)}`}>
                    {getStatusIcon(selectedDeadline.status)}
                    {getStatusLabel(selectedDeadline.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F5F6FA] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-[#273A7A]/80" />
                      <span className="text-xs text-[#273A7A]/80">Entreprise</span>
                    </div>
                    <p className="text-sm text-[#1A2753]">{selectedDeadline.companyName}</p>
                  </div>
                  <div className="bg-[#F5F6FA] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-[#273A7A]/80" />
                      <span className="text-xs text-[#273A7A]/80">Période</span>
                    </div>
                    <p className="text-sm text-[#1A2753]">{selectedDeadline.period}</p>
                  </div>
                  <div className="bg-[#F5F6FA] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-[#273A7A]/80" />
                      <span className="text-xs text-[#273A7A]/80">Date limite</span>
                    </div>
                    <p className="text-sm text-[#1A2753]">
                      {new Date(selectedDeadline.dueDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {(() => {
                      const days = getDaysUntilDue(selectedDeadline.dueDate);
                      if (days < 0 && selectedDeadline.status !== 'paye') return <p className="text-xs text-red-600 mt-1">En retard de {Math.abs(days)} jour(s)</p>;
                      if (days <= 7 && selectedDeadline.status !== 'paye') return <p className="text-xs text-orange-600 mt-1">Dans {days} jour(s)</p>;
                      return null;
                    })()}
                  </div>
                  <div className="bg-[#F5F6FA] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-[#273A7A]/80" />
                      <span className="text-xs text-[#273A7A]/80">Montant estimé</span>
                    </div>
                    <p className="text-sm text-[#D6A93A]">{formatAmount(selectedDeadline.estimatedAmount)}</p>
                  </div>
                </div>

                {selectedDeadline.recurrence && (
                  <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      Récurrence : {selectedDeadline.recurrence}
                    </span>
                  </div>
                )}

                {selectedDeadline.notes && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm text-amber-800">{selectedDeadline.notes}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 text-sm text-[#273A7A]/80 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Fermer
                </button>
                <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 text-sm bg-[#D6A93A] text-white rounded-lg hover:bg-[#C09830] transition-colors">
                  Voir déclarations
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
