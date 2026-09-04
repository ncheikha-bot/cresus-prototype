import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Buildings,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Plus,
  SunHorizon,
  Trash2,
  X,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { nouvelId } from '../../lib/id';

interface AppointmentProps {
  onBack: () => void;
}

interface AppointmentData {
  id: string;
  companyId: string;
  companyName: string;
  companyType: string;
  date: Date;
  time: string;
  location: string;
  locationName: string;
  locationAddress: string;
  status: 'upcoming' | 'past' | 'cancelled';
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const timeSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '10:00', available: true },
  { time: '11:00', available: false },
  { time: '14:00', available: true },
  { time: '15:00', available: true },
  { time: '16:00', available: true },
  { time: '17:00', available: false }
];

const locations = [
  {
    id: 'plateau',
    name: 'Bureau Plateau',
    address: 'Avenue Léopold Sédar Senghor, Plateau, Dakar',
    icon: Buildings
  },
  {
    id: 'almadies',
    name: 'Bureau Almadies',
    address: 'Route des Almadies, Dakar',
    icon: SunHorizon
  }
];

// Mock data - RDV existants
const mockAppointments: AppointmentData[] = [
  {
    id: '1',
    companyId: 'comp1',
    companyName: 'Tech Innovations SARL',
    companyType: 'SARL',
    
    date: new Date(2025, 11, 15, 10, 0), // 15 décembre 2025 à 10h
    time: '10:00',
    location: 'plateau',
    locationName: 'Bureau Plateau',
    locationAddress: 'Avenue Léopold Sédar Senghor, Plateau, Dakar',
    status: 'upcoming'
  },
  {
    id: '2',
    companyId: 'comp2',
    companyName: 'Digital Services SA',
    companyType: 'SA',
    
    date: new Date(2025, 11, 20, 14, 0), // 20 décembre 2025 à 14h
    time: '14:00',
    location: 'almadies',
    locationName: 'Bureau Almadies',
    locationAddress: 'Route des Almadies, Dakar',
    status: 'upcoming'
  }
];

export const Appointment: React.FC<AppointmentProps> = ({ onBack }) => {
  const { currentUser, companies, addAppointment } = useApp();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [step, setStep] = useState<'date' | 'time' | 'location' | 'confirm' | 'success'>('date');
  const [appointments, setAppointments] = useState<AppointmentData[]>(mockAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  // Filtrer les RDV à venir
  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming' && apt.date > new Date());

  const handleCreateNew = () => {
    setView('create');
    setStep('date');
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedLocation(null);
    // Sélectionner automatiquement la première société de l'utilisateur
    if (companies.length > 0) {
      setSelectedCompany(companies[0]);
    }
  };

  const handleEdit = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setSelectedDate(appointment.date);
    setSelectedTime(appointment.time);
    setSelectedLocation(appointment.location);
    setView('edit');
    setStep('date');
  };

  const handleCancelRequest = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = () => {
    if (appointmentToCancel) {
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentToCancel ? { ...apt, status: 'cancelled' as const } : apt
      ));
      setShowCancelModal(false);
      setAppointmentToCancel(null);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('location');
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (view === 'edit' && selectedAppointment) {
      // Modifier le RDV existant
      setAppointments(prev => prev.map(apt => 
        apt.id === selectedAppointment.id 
          ? {
              ...apt,
              date: selectedDate!,
              time: selectedTime!,
              location: selectedLocation!,
              locationName: locations.find(l => l.id === selectedLocation)?.name || '',
              locationAddress: locations.find(l => l.id === selectedLocation)?.address || ''
            }
          : apt
      ));
    } else {
      // Créer un nouveau RDV
      const newAppointment: AppointmentData = {
        id: nouvelId('apt'),
        companyId: selectedCompany?.id || '',
        companyName: selectedCompany?.name || '',
        companyType: selectedCompany?.legalForm || '',
        
        date: selectedDate!,
        time: selectedTime!,
        location: selectedLocation!,
        locationName: locations.find(l => l.id === selectedLocation)?.name || '',
        locationAddress: locations.find(l => l.id === selectedLocation)?.address || '',
        status: 'upcoming'
      };
      setAppointments(prev => [...prev, newAppointment]);

      // Le rendez-vous entre aussi dans le referentiel partage, sans quoi il
      // resterait invisible pour l'admin qui doit le traiter.
      addAppointment({
        clientId: currentUser?.id || '',
        type: `Rendez-vous ${selectedCompany?.name || ''}`.trim(),
        date: new Date(
          `${selectedDate!.toISOString().slice(0, 10)}T${selectedTime}:00`,
        ).toISOString(),
        location: locations.find(l => l.id === selectedLocation)?.name || '',
        status: 'pending',
      });
    }
    
    setIsLoading(false);
    setStep('success');
  };

  const handleBack = () => {
    if (view === 'list') {
      onBack();
    } else if (step === 'date') {
      setView('list');
    } else if (step === 'time') {
      setStep('date');
    } else if (step === 'location') {
      setStep('time');
    } else if (step === 'confirm') {
      setStep('location');
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedAppointment(null);
  };

  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2753] to-[#273A7A] text-white px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-7 rounded-b-[2rem]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D6A93A]/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="relative flex items-center gap-3 mb-5">
          <motion.button aria-label="Retour"
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-lg">
              {view === 'list' ? 'Mes rendez-vous' : view === 'edit' ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
            </h1>
            <p className="text-white/70 text-xs mt-0.5">
              {view === 'list' ? 'Signature des statuts' : 'Sélectionnez date et heure'}
            </p>
          </div>
        </div>

        {/* Progress indicator - seulement pour create/edit */}
        {view !== 'list' && step !== 'success' && (
          <div className="relative flex items-center gap-1.5">
            {['date', 'time', 'location', 'confirm'].map((s, index) => (
              <div key={s} className="flex items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'bg-[#D6A93A] scale-150'
                      : s === 'date' && ['time', 'location', 'confirm'].includes(step as string) ||
                        s === 'time' && ['location', 'confirm'].includes(step as string) ||
                        s === 'location' && step === 'confirm'
                      ? 'bg-[#D6A93A]'
                      : 'bg-white/20'
                  }`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 mt-6">
        {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
        <AnimatePresence mode="popLayout">
          {/* Liste des RDV */}
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Bouton Nouveau RDV */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateNew}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-2xl p-4 shadow-lg mb-6 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nouveau rendez-vous
              </motion.button>

              {/* Liste des RDV à venir */}
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-[#1A2753] mb-3">Rendez-vous à venir</h2>
                  {upcomingAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-[#D6A93A]"
                    >
                      {/* Société */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5F6FA]">
                        <div className="w-12 h-12 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center">
                          <Buildings className="w-5 h-5 text-[#D6A93A]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[#1A2753]">{appointment.companyName}</p>
                          <p className="text-[#273A7A]/80 text-sm">{appointment.companyType}</p>
                        </div>
                      </div>

                      {/* Date et heure */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-[#273A7A]/80">Date</p>
                            <p className="text-[#1A2753] text-sm">{formatFullDate(appointment.date)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-[#273A7A]/80">Heure</p>
                            <p className="text-[#1A2753] text-sm">{appointment.time}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs text-[#273A7A]/80">Lieu</p>
                            <p className="text-[#1A2753] text-sm">{appointment.locationName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-2.5 bg-[#273A7A]/10 text-[#273A7A] rounded-xl hover:bg-[#273A7A]/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleCancelRequest(appointment.id)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Annuler
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-2xl p-8 text-center"
                >
                  <div className="w-16 h-16 bg-[#273A7A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-[#273A7A]/40" />
                  </div>
                  <p className="text-[#1A2753] mb-2">Aucun rendez-vous</p>
                  <p className="text-[#273A7A]/80 text-sm">
                    Vous n'avez pas encore de rendez-vous planifié
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Sélection de date */}
          {(view === 'create' || view === 'edit') && step === 'date' && (
            <motion.div
              key="date"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {view === 'edit' && selectedAppointment && (
                <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-3 mb-4 border-l-4 border-[#D6A93A]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <Buildings className="w-4 h-4 text-[#1A2753]" />
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-xs">Modification du RDV</p>
                      <p className="text-[#1A2753] text-sm">{selectedAppointment.companyName}</p>
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-[#1A2753] mb-4">Choisissez une date</h2>

              <div className="grid grid-cols-4 gap-2">
                {dates.map((date, index) => {
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  return (
                    <motion.button
                      key={date.toISOString()}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.03 * index }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isWeekend}
                      onClick={() => handleDateSelect(date)}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 aspect-square rounded-xl p-2 transition-all duration-300 ${
                        isWeekend
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#D6A93A] text-white shadow-lg'
                          : 'bg-white shadow-sm hover:shadow-md hover:border-[#D6A93A] border-2 border-transparent'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className={`text-xs mb-1 ${isSelected ? 'text-white/80' : 'text-[#273A7A]/80'}`}>
                          {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </p>
                        <p className={`text-sm ${isSelected ? 'text-white' : 'text-[#1A2753]'}`}>
                          {date.getDate()}
                        </p>
                        <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-[#273A7A]/80'}`}>
                          {date.toLocaleDateString('fr-FR', { month: 'short' })}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Sélection d'heure */}
          {(view === 'create' || view === 'edit') && step === 'time' && selectedDate && (
            <motion.div
              key="time"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-3 mb-4 border-l-4 border-[#D6A93A]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D6A93A]" />
                  <p className="text-[#1A2753] text-sm">{formatFullDate(selectedDate)}</p>
                </div>
              </div>

              <h2 className="text-[#1A2753] mb-4">Sélectionnez un créneau</h2>

              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot, index) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <motion.button
                      key={slot.time}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05 * index }}
                      whileTap={{ scale: slot.available ? 0.95 : 1 }}
                      disabled={!slot.available}
                      onClick={() => handleTimeSelect(slot.time)}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-4 rounded-xl transition-all duration-300 ${
                        !slot.available
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#D6A93A] text-white shadow-lg'
                          : 'bg-white shadow-sm hover:shadow-md hover:border-[#D6A93A] border-2 border-transparent'
                      }`}
                    >
                      <Clock className={`w-5 h-5 mx-auto mb-1 ${!slot.available ? 'text-gray-600' : isSelected ? 'text-white' : 'text-[#D6A93A]'}`} />
                      <p className={`text-sm ${!slot.available ? 'text-gray-600' : isSelected ? 'text-white' : 'text-[#1A2753]'}`}>
                        {slot.time}
                      </p>
                      {!slot.available && (
                        <p className="text-xs text-gray-600 mt-1">Complet</p>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Sélection du lieu */}
          {(view === 'create' || view === 'edit') && step === 'location' && (
            <motion.div
              key="location"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-3 mb-4 border-l-4 border-[#D6A93A]">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#D6A93A]" />
                    <p className="text-[#1A2753] text-xs">{selectedDate && formatDate(selectedDate)}</p>
                    <Clock className="w-4 h-4 text-[#D6A93A] ml-2" />
                    <p className="text-[#1A2753] text-xs">{selectedTime}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-[#1A2753] mb-4">Choisissez le lieu</h2>

              <div className="space-y-3">
                {locations.map((location, index) => {
                  const isSelected = selectedLocation === location.id;
                  return (
                    <motion.button
                      key={location.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLocationSelect(location.id)}
                      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full rounded-xl p-4 shadow-sm transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#D6A93A]/10 border-2 border-[#D6A93A]'
                          : 'bg-white hover:shadow-md border-2 border-transparent hover:border-[#D6A93A]/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-[#273A7A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <location.icon className="w-5 h-5 text-[#1A2753]" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[#1A2753] mb-1">{location.name}</p>
                          <div className="flex items-start gap-1">
                            <MapPin className="w-4 h-4 text-[#273A7A]/40 flex-shrink-0 mt-0.5" />
                            <p className="text-[#273A7A]/80 text-sm">{location.address}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-[#D6A93A] flex-shrink-0" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Confirmation */}
          {(view === 'create' || view === 'edit') && step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <h2 className="text-[#1A2753] mb-4">
                {view === 'edit' ? 'Confirmer les modifications' : 'Confirmer le rendez-vous'}
              </h2>

              <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-3 border-b border-[#F5F6FA]">
                    <div className="w-10 h-10 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center">
                      <Buildings className="w-5 h-5 text-[#D6A93A]" />
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-sm">Société</p>
                      <p className="text-[#1A2753]">
                        {view === 'edit' ? selectedAppointment?.companyName : selectedCompany?.name}
                      </p>
                      <p className="text-[#273A7A]/80 text-sm">
                        {view === 'edit' ? selectedAppointment?.companyType : selectedCompany?.legalForm}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-3 border-b border-[#F5F6FA]">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-sm">Date et heure</p>
                      <p className="text-[#1A2753]">{selectedDate && formatFullDate(selectedDate)}</p>
                      <p className="text-[#1A2753]">{selectedTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[#273A7A]/80 text-sm">Lieu</p>
                      <p className="text-[#1A2753]">
                        {locations.find(l => l.id === selectedLocation)?.name}
                      </p>
                      <p className="text-[#273A7A]/80 text-sm">
                        {locations.find(l => l.id === selectedLocation)?.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#D6A93A]/10 border-2 border-[#D6A93A]/30 rounded-xl p-4 mb-4">
                <p className="text-[#1A2753] text-sm mb-2">
                  Documents à apporter
                </p>
                <ul className="text-[#273A7A]/80 text-sm space-y-1">
                  <li>• Pièce d'identité originale</li>
                  <li>• Copie des statuts (fournie sur place)</li>
                  <li>• Toute procuration si nécessaire</li>
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={isLoading}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-2xl py-4 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Confirmation...</span>
                  </div>
                ) : (
                  view === 'edit' ? 'Confirmer les modifications' : 'Confirmer le rendez-vous'
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Succès */}
          {(view === 'create' || view === 'edit') && step === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-12 h-12 text-green-600" />
              </motion.div>

              <h2 className="text-[#1A2753] mb-3">
                {view === 'edit' ? 'Rendez-vous modifié !' : 'Rendez-vous confirmé !'}
              </h2>
              <p className="text-[#273A7A]/80 mb-6">
                Vous recevrez une confirmation par email et SMS
              </p>

              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 justify-center pb-3 border-b border-[#F5F6FA]">
                    <Calendar className="w-5 h-5 text-[#D6A93A]" />
                    <p className="text-[#1A2753]">{selectedDate && formatFullDate(selectedDate)}</p>
                  </div>
                  <div className="flex items-center gap-3 justify-center pb-3 border-b border-[#F5F6FA]">
                    <Clock className="w-5 h-5 text-[#D6A93A]" />
                    <p className="text-[#1A2753]">{selectedTime}</p>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <MapPin className="w-5 h-5 text-[#D6A93A]" />
                    <p className="text-[#1A2753]">
                      {locations.find(l => l.id === selectedLocation)?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBackToList}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-2xl py-4 shadow-lg"
                >
                  Retour à mes rendez-vous
                </motion.button>

                <div className="flex gap-2">
                  <motion.a
                    href="tel:+221338231212"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-white border-2 border-[#273A7A]/20 rounded-xl py-3 flex items-center justify-center gap-2 text-[#1A2753]"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Appeler</span>
                  </motion.a>
                  <motion.a
                    href="mailto:contact@cresus.sn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-white border-2 border-[#273A7A]/20 rounded-xl py-3 flex items-center justify-center gap-2 text-[#1A2753]"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Email</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal d'annulation */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>

              <h2 className="text-[#1A2753] text-center mb-2">Annuler ce rendez-vous ?</h2>
              <p className="text-[#273A7A]/80 text-sm text-center mb-6">
                Cette action est irréversible. Vous devrez reprendre un nouveau rendez-vous si nécessaire.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-3 bg-[#F5F6FA] text-[#273A7A] rounded-xl hover:bg-[#F5F6FA]/80 transition-all"
                >
                  Non, garder
                </button>
                <button
                  onClick={handleCancelConfirm}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                >
                  Oui, annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};