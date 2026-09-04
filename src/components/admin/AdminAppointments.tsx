import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  MapPin,
  CheckCircle,
  X,
  Clock,
  Plus,
  Ban,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  Filter,
  Download,
  Search,
  Users as UsersIcon,
} from '../ui/icons';
import { toast } from 'sonner';
import { mockUsers } from '../../data/mockData';
import { useConfirm } from '../ui/confirm-dialog';
import { useApp } from '../../context/AppContext';

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  isBlocked: boolean;
  blockedReason?: string;
  appointmentId?: string;
}

type CalendarView = 'month' | 'week' | 'day';

export const AdminAppointments: React.FC = () => {
  const { appointments } = useApp();
  const confirm = useConfirm();
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // Novembre 2025
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showBlockSlotsModal, setShowBlockSlotsModal] = useState(false);
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mode de sélection client
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Formulaire nouveau RDV
  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    type: 'signature',
    date: '',
    time: '',
    location: 'Bureau Crésus - Plateau',
    notes: '',
  });

  // Formulaire blocage de créneaux
  const [blockSlots, setBlockSlots] = useState({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    reason: '',
    blockAllDay: false,
  });

  const appointmentTypes = [
    { value: 'signature', label: 'Signature documents' },
    { value: 'consultation', label: 'Consultation initiale' },
    { value: 'suivi', label: 'Suivi de dossier' },
    { value: 'remise_docs', label: 'Remise de documents' },
    { value: 'autre', label: 'Autre' },
  ];

  const locations = [
    'Bureau Crésus - Plateau',
    'Bureau Crésus - Almadies',
    'Visioconférence',
    'Autre',
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCreateAppointment = () => {
    // Validation selon le mode
    const clientNameValid = clientMode === 'existing' ? selectedClientId !== '' : newAppointment.clientName.trim() !== '';
    
    if (!clientNameValid || !newAppointment.date || !newAppointment.time) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const clientInfo = clientMode === 'existing' 
      ? mockUsers.find(u => u.id === selectedClientId)
      : { name: newAppointment.clientName, email: newAppointment.clientEmail, phone: newAppointment.clientPhone };

    toast.success('Rendez-vous créé', {
      description: (
        <span className="block whitespace-pre-line">
          {`Client : ${clientInfo?.name}\nType : ${appointmentTypes.find((t) => t.value === newAppointment.type)?.label}\nDate : ${newAppointment.date} à ${newAppointment.time}\nLieu : ${newAppointment.location}\n\nUne notification a été envoyée au client.`}
        </span>
      ),
      duration: 6000,
    });
    setShowNewAppointmentModal(false);
    setNewAppointment({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      type: 'signature',
      date: '',
      time: '',
      location: 'Bureau Crésus - Plateau',
      notes: '',
    });
    setSelectedClientId('');
    setClientMode('existing');
    setClientSearchQuery('');
  };

  const handleBlockSlots = () => {
    if (!blockSlots.startDate || !blockSlots.endDate) {
      toast.error('Veuillez sélectionner les dates de début et fin');
      return;
    }
    toast.success('Créneaux bloqués', {
      description: (
        <span className="block whitespace-pre-line">
          {`Du : ${blockSlots.startDate}\nAu : ${blockSlots.endDate}\nHoraires : ${blockSlots.blockAllDay ? 'Journée complète' : `${blockSlots.startTime} - ${blockSlots.endTime}`}\nRaison : ${blockSlots.reason || 'Non spécifiée'}\n\nCes créneaux ne seront plus disponibles pour les clients.`}
        </span>
      ),
      duration: 6000,
    });
    setShowBlockSlotsModal(false);
    setBlockSlots({
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '18:00',
      reason: '',
      blockAllDay: false,
    });
  };

  const handleConfirmAppointment = (id: string) => {
    toast.success(`Rendez-vous ${id} confirmé`, {
      description: 'Le client recevra une notification.',
    });
  };

  const handleCancelAppointment = async (id: string) => {
    if (
      await confirm({
        title: 'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
        description: 'Le client sera notifié de l’annulation.',
        confirmLabel: 'Annuler le rendez-vous',
        cancelLabel: 'Conserver',
        variant: 'destructive',
      })
    ) {
      toast.success(`Rendez-vous ${id} annulé`, {
        description: 'Le client sera notifié.',
      });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (
      await confirm({
        title: 'Supprimer définitivement ce rendez-vous ?',
        description: 'Cette action est irréversible.',
        confirmLabel: 'Supprimer',
        variant: 'destructive',
      })
    ) {
      toast.success(`Rendez-vous ${id} supprimé`);
      setShowAppointmentDetail(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Jours du mois précédent
    for (let i = firstDay === 0 ? 6 : firstDay - 1; i > 0; i--) {
      const prevMonthDays = new Date(year, month, 0).getDate();
      days.push({ day: prevMonthDays - i + 1, isCurrentMonth: false });
    }
    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    // Jours du mois suivant
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter((apt) => apt.date.startsWith(dateStr));
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      searchQuery === '' ||
      apt.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#1A2753]">Gestion des rendez-vous</h2>
            <p className="text-[#273A7A]/80">{stats.total} rendez-vous au total</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBlockSlotsModal(true)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all flex items-center gap-2"
            >
              <Ban className="w-5 h-5" />
              Bloquer des créneaux
            </button>
            <button
              onClick={() => setShowNewAppointmentModal(true)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouveau rendez-vous
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-blue-900/60 text-sm mb-1">Total</p>
            <p className="text-blue-900 text-2xl">{stats.total}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-green-900/60 text-sm mb-1">Confirmés</p>
            <p className="text-green-900 text-2xl">{stats.confirmed}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-orange-900/60 text-sm mb-1">En attente</p>
            <p className="text-orange-900 text-2xl">{stats.pending}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-red-900/60 text-sm mb-1">Annulés</p>
            <p className="text-red-900 text-2xl">{stats.cancelled}</p>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button aria-label="Mois précédent"
              onClick={handlePreviousMonth}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-[#F5F6FA] rounded-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-[#273A7A]" />
            </button>
            <h3 className="text-[#1A2753] text-xl min-w-[200px] text-center">
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
            <button aria-label="Mois suivant" onClick={handleNextMonth} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-[#F5F6FA] rounded-lg transition-all">
              <ChevronRight className="w-5 h-5 text-[#273A7A]" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setView('day')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 rounded-lg transition-all ${
                view === 'day'
                  ? 'bg-[#1A2753] text-white'
                  : 'bg-[#F5F6FA] text-[#1A2753] hover:bg-gray-200'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setView('week')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 rounded-lg transition-all ${
                view === 'week'
                  ? 'bg-[#1A2753] text-white'
                  : 'bg-[#F5F6FA] text-[#1A2753] hover:bg-gray-200'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setView('month')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 rounded-lg transition-all ${
                view === 'month'
                  ? 'bg-[#1A2753] text-white'
                  : 'bg-[#F5F6FA] text-[#1A2753] hover:bg-gray-200'
              }`}
            >
              Mois
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Headers */}
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="text-center text-[#273A7A]/80 text-sm py-2 font-medium">
              {day}
            </div>
          ))}

          {/* Days */}
          {getDaysInMonth().map((dayInfo, index) => {
            const appointments = dayInfo.isCurrentMonth ? getAppointmentsForDay(dayInfo.day) : [];
            const isToday =
              dayInfo.isCurrentMonth &&
              dayInfo.day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <button
                key={index}
                onClick={() => {
                  if (dayInfo.isCurrentMonth) {
                    setSelectedDate(
                      new Date(currentDate.getFullYear(), currentDate.getMonth(), dayInfo.day)
                    );
                  }
                }}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] min-h-[100px] p-2 rounded-xl border-2 transition-all text-left relative ${
                  dayInfo.isCurrentMonth
                    ? isToday
                      ? 'bg-[#D6A93A]/10 border-[#D6A93A] hover:border-[#D6A93A]'
                      : 'bg-white border-gray-200 hover:border-[#273A7A] hover:shadow-md'
                    : 'bg-[#F5F6FA]/50 border-transparent opacity-50'
                }`}
              >
                <div
                  className={`text-sm mb-1 ${
                    dayInfo.isCurrentMonth
                      ? isToday
                        ? 'text-[#D6A93A] font-bold'
                        : 'text-[#1A2753]'
                      : 'text-[#273A7A]/80'
                  }`}
                >
                  {dayInfo.day}
                </div>

                {/* Appointments indicators */}
                {appointments.length > 0 && (
                  <div className="space-y-1">
                    {appointments.slice(0, 2).map((apt) => (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(apt);
                          setShowAppointmentDetail(true);
                        }}
                        className={`text-xs px-2 py-1 rounded ${
                          apt.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : apt.status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        } truncate cursor-pointer hover:opacity-80`}
                      >
                        {new Date(apt.date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    ))}
                    {appointments.length > 2 && (
                      <div className="text-xs text-[#273A7A]/80 px-2">+{appointments.length - 2}</div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1A2753]">Liste des rendez-vous</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-5 h-5 text-[#273A7A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 bg-[#F5F6FA] rounded-lg text-[#1A2753] text-sm outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#F5F6FA] rounded-lg text-[#1A2753] text-sm outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="confirmed">Confirmés</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulés</option>
            </select>
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-[#F5F6FA] rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2">
              <Download className="w-4 h-4 text-[#273A7A]" />
              <span className="text-sm text-[#1A2753]">Exporter</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#F5F6FA] rounded-xl p-5 hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-[#D6A93A] cursor-pointer"
              onClick={() => {
                setSelectedAppointment(appointment);
                setShowAppointmentDetail(true);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                  {getStatusLabel(appointment.status)}
                </span>
                {appointment.status === 'pending' && (
                  <div className="flex gap-2">
                    <button aria-label="Confirmer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmAppointment(appointment.id);
                      }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-green-50 rounded-lg transition-all duration-300"
                      title="Confirmer"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </button>
                    <button aria-label="Annuler"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelAppointment(appointment.id);
                      }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-red-50 rounded-lg transition-all duration-300"
                      title="Annuler"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-[#1A2753] mb-3">{appointment.type}</h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#273A7A]/80 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(appointment.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#273A7A]/80 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{appointment.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[#273A7A]/80 text-sm">
                  <User className="w-4 h-4" />
                  <span>Client #{appointment.clientId}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12 text-[#273A7A]/80">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun rendez-vous trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Nouveau Rendez-vous */}
      {showNewAppointmentModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewAppointmentModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1A2753] text-xl">Créer un nouveau rendez-vous</h3>
              <button aria-label="Fermer"
                onClick={() => setShowNewAppointmentModal(false)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-[#F5F6FA] rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-[#273A7A]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Toggle Client Existant / Nouveau */}
              <div className="mb-4">
                <div className="flex gap-2 p-1 bg-[#F5F6FA] rounded-xl">
                  <button
                    onClick={() => {
                      setClientMode('existing');
                      setSelectedClientId('');
                    }}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      clientMode === 'existing'
                        ? 'bg-white text-[#1A2753] shadow-sm'
                        : 'text-[#273A7A]/80 hover:text-[#273A7A]'
                    }`}
                  >
                    <UsersIcon className="w-4 h-4" />
                    <span className="text-sm">Client existant</span>
                  </button>
                  <button
                    onClick={() => {
                      setClientMode('new');
                      setNewAppointment({
                        ...newAppointment,
                        clientName: '',
                        clientEmail: '',
                        clientPhone: '',
                      });
                    }}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      clientMode === 'new'
                        ? 'bg-white text-[#1A2753] shadow-sm'
                        : 'text-[#273A7A]/80 hover:text-[#273A7A]'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Nouveau client</span>
                  </button>
                </div>
              </div>

              {/* Sélection client existant */}
              {clientMode === 'existing' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[#273A7A] text-sm mb-2">
                      Sélectionner un client <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="w-5 h-5 text-[#273A7A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={clientSearchQuery}
                        onChange={(e) => setClientSearchQuery(e.target.value)}
                        placeholder="Rechercher un client..."
                        className="w-full pl-10 pr-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                      />
                    </div>
                  </div>

                  <div className="max-h-[200px] overflow-y-auto space-y-2 border border-[#F5F6FA] rounded-xl p-2">
                    {mockUsers
                      .filter((u) => u.role === 'client')
                      .filter(
                        (u) =>
                          clientSearchQuery === '' ||
                          u.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(clientSearchQuery.toLowerCase())
                      )
                      .map((client) => (
                        <button
                          key={client.id}
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setNewAppointment({
                              ...newAppointment,
                              clientName: client.name,
                              clientEmail: client.email || '',
                              clientPhone: client.phone || '',
                            });
                          }}
                          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full p-3 rounded-xl text-left transition-all ${
                            selectedClientId === client.id
                              ? 'bg-[#D6A93A]/10 border-2 border-[#D6A93A]'
                              : 'bg-[#F5F6FA] hover:bg-gray-200 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[#1A2753] font-medium">{client.name}</p>
                              <p className="text-[#273A7A]/80 text-xs">{client.email}</p>
                              {client.phone && (
                                <p className="text-[#273A7A]/80 text-xs">{client.phone}</p>
                              )}
                            </div>
                            {selectedClientId === client.id && (
                              <CheckCircle className="w-5 h-5 text-[#D6A93A]" />
                            )}
                          </div>
                        </button>
                      ))}
                  </div>

                  {selectedClientId && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-800 text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Client sélectionné : {newAppointment.clientName}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Formulaire nouveau client */}
              {clientMode === 'new' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#273A7A] text-sm mb-2">
                        Nom du client <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAppointment.clientName}
                        onChange={(e) => setNewAppointment({ ...newAppointment, clientName: e.target.value })}
                        placeholder="Ex: Amadou Diallo"
                        className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[#273A7A] text-sm mb-2">Email</label>
                      <input
                        type="email"
                        value={newAppointment.clientEmail}
                        onChange={(e) =>
                          setNewAppointment({ ...newAppointment, clientEmail: e.target.value })
                        }
                        placeholder="client@example.com"
                        className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#273A7A] text-sm mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={newAppointment.clientPhone}
                      onChange={(e) => setNewAppointment({ ...newAppointment, clientPhone: e.target.value })}
                      placeholder="+221 77 123 45 67"
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[#273A7A] text-sm mb-2">
                  Type de rendez-vous <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAppointment.type}
                  onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                >
                  {appointmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#273A7A] text-sm mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                  />
                </div>

                <div>
                  <label className="block text-[#273A7A] text-sm mb-2">
                    Heure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#273A7A] text-sm mb-2">Lieu</label>
                <select
                  value={newAppointment.location}
                  onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#273A7A] text-sm mb-2">Notes</label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  placeholder="Ajoutez des notes sur ce rendez-vous..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] resize-none outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewAppointmentModal(false)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 text-[#273A7A] hover:bg-[#F5F6FA] rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateAppointment}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all"
              >
                Créer le rendez-vous
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Bloquer des créneaux */}
      {showBlockSlotsModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowBlockSlotsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-[#1A2753] text-xl">Bloquer des créneaux</h3>
              </div>
              <button aria-label="Fermer"
                onClick={() => setShowBlockSlotsModal(false)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-[#F5F6FA] rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-[#273A7A]" />
              </button>
            </div>

            <p className="text-[#273A7A]/80 text-sm mb-6">
              Les créneaux bloqués ne seront plus disponibles à la réservation pour les clients.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#273A7A] text-sm mb-2">
                    Date de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={blockSlots.startDate}
                    onChange={(e) => setBlockSlots({ ...blockSlots, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                  />
                </div>

                <div>
                  <label className="block text-[#273A7A] text-sm mb-2">
                    Date de fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={blockSlots.endDate}
                    onChange={(e) => setBlockSlots({ ...blockSlots, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blockSlots.blockAllDay}
                    onChange={(e) => setBlockSlots({ ...blockSlots, blockAllDay: e.target.checked })}
                    className="w-4 h-4 rounded text-[#D6A93A]"
                  />
                  <span className="text-[#273A7A] text-sm">Bloquer toute la journée</span>
                </label>
              </div>

              {!blockSlots.blockAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#273A7A] text-sm mb-2">Heure de début</label>
                    <input
                      type="time"
                      value={blockSlots.startTime}
                      onChange={(e) => setBlockSlots({ ...blockSlots, startTime: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[#273A7A] text-sm mb-2">Heure de fin</label>
                    <input
                      type="time"
                      value={blockSlots.endTime}
                      onChange={(e) => setBlockSlots({ ...blockSlots, endTime: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#273A7A] text-sm mb-2">Raison du blocage (optionnel)</label>
                <textarea
                  value={blockSlots.reason}
                  onChange={(e) => setBlockSlots({ ...blockSlots, reason: e.target.value })}
                  placeholder="Ex: Congés annuels, formation, fermeture exceptionnelle..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] resize-none outline-none focus:ring-2 focus:ring-[#D6A93A]/50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBlockSlotsModal(false)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 text-[#273A7A] hover:bg-[#F5F6FA] rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleBlockSlots}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
              >
                Bloquer les créneaux
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Détail Rendez-vous */}
      {showAppointmentDetail && selectedAppointment && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAppointmentDetail(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1A2753] text-xl">Détails du rendez-vous</h3>
              <button aria-label="Fermer"
                onClick={() => setShowAppointmentDetail(false)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-[#F5F6FA] rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-[#273A7A]" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-[#F5F6FA] rounded-xl">
                <span className="text-[#273A7A]/80 text-sm">Statut</span>
                <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                  {getStatusLabel(selectedAppointment.status)}
                </span>
              </div>

              <div className="p-4 bg-[#F5F6FA] rounded-xl">
                <p className="text-[#273A7A]/80 text-sm mb-1">Type</p>
                <p className="text-[#1A2753]">{selectedAppointment.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F5F6FA] rounded-xl">
                  <p className="text-[#273A7A]/80 text-sm mb-1">Date et heure</p>
                  <p className="text-[#1A2753]">
                    {new Date(selectedAppointment.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-[#D6A93A] text-sm">
                    {new Date(selectedAppointment.date).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="p-4 bg-[#F5F6FA] rounded-xl">
                  <p className="text-[#273A7A]/80 text-sm mb-1">Lieu</p>
                  <p className="text-[#1A2753] text-sm">{selectedAppointment.location}</p>
                </div>
              </div>

              <div className="p-4 bg-[#F5F6FA] rounded-xl">
                <p className="text-[#273A7A]/80 text-sm mb-1">Client</p>
                <p className="text-[#1A2753]">ID: {selectedAppointment.clientId}</p>
              </div>
            </div>

            <div className="flex gap-3">
              {selectedAppointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleConfirmAppointment(selectedAppointment.id)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirmer
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Annuler
                  </button>
                </>
              )}

              {selectedAppointment.status === 'confirmed' && (
                <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-[#1A2753] text-white rounded-xl hover:bg-[#273A7A] transition-all flex items-center justify-center gap-2">
                  <Edit className="w-5 h-5" />
                  Modifier
                </button>
              )}

              <button
                onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};