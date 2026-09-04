import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, UserCircle2, Smartphone, AtSign, FileStack, Wallet,
  Settings2, Moon, Sun, LogOut, BellRing, MessageCircle, LayoutGrid,
  CircleHelp, ChevronRight, ShieldCheck, ScanFace, Fingerprint, Lock, X, Check
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { BottomBar } from './BottomBar';

interface ProfileProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onBack, onNavigate }) => {
  const { currentUser, darkMode, setDarkMode, setCurrentUser, setViewMode, setShowOnboarding, setShowOnboardingSlides } = useApp();

  // Biometric states
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<'faceid' | 'touchid'>('faceid');
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricStep, setBiometricStep] = useState<'choose' | 'scanning' | 'success'>('choose');
  const [loginWithBiometric, setLoginWithBiometric] = useState(false);
  const [paymentWithBiometric, setPaymentWithBiometric] = useState(false);

  const handleSwitchToAdmin = () => {
    setViewMode('admin');
  };

  const navigate = useNavigate();

  /** Voir le commentaire de WebLayout : l'accueil est une route. */
  const handleBackToIntro = () => {
    navigate('/');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleEnableBiometric = (type: 'faceid' | 'touchid') => {
    setBiometricType(type);
    setBiometricStep('scanning');

    // Simulate biometric scan
    setTimeout(() => {
      setBiometricStep('success');
      setTimeout(() => {
        setBiometricEnabled(true);
        setLoginWithBiometric(true);
        setShowBiometricModal(false);
        setBiometricStep('choose');
      }, 1800);
    }, 2500);
  };

  const handleToggleBiometric = () => {
    if (biometricEnabled) {
      setBiometricEnabled(false);
      setLoginWithBiometric(false);
      setPaymentWithBiometric(false);
    } else {
      setShowBiometricModal(true);
      setBiometricStep('choose');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F1F8] to-[#F5F6FA] pb-28">
      {/* Header with avatar */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2753] via-[#1E3068] to-[#273A7A] pt-[max(3rem,env(safe-area-inset-top))] pb-10 px-5">
        <div className="absolute top-0 right-0 w-52 h-52 bg-[#D6A93A]/8 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-[#4A5FBD]/15 rounded-full blur-[50px]" />

        <div className="relative">
          <button aria-label="Retour"
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] mb-6 w-10 h-10 icon-glass rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D6A93A] to-[#C49530] rounded-2xl flex items-center justify-center fab-glass">
                <UserCircle2 className="w-8 h-8 text-[#1A2753]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#273A7A] flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-white text-xl mb-0.5">{currentUser?.name}</h2>
              <p className="text-white/70 text-sm">{currentUser?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-3.5">
        {/* Info cards - Glass */}
        <div className="glass-card rounded-2xl divide-y divide-white/30">
          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D6A93A]/8 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D6A93A]/10">
              <Smartphone className="w-4 h-4 text-[#D6A93A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#273A7A]/80 text-[11px] tracking-wide">Téléphone</p>
              <p className="text-[#1A2753] text-sm">{currentUser?.phone}</p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D6A93A]/8 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D6A93A]/10">
              <AtSign className="w-4 h-4 text-[#D6A93A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#273A7A]/80 text-[11px] tracking-wide">Email</p>
              <p className="text-[#1A2753] text-sm truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Glass */}
        <div>
          <p className="text-[#273A7A]/80 text-[11px] tracking-wide mb-2 ml-1">Actions rapides</p>
          <div className="glass-card rounded-2xl divide-y divide-white/30">
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 flex items-center gap-3 active:bg-white/30 transition-colors rounded-t-2xl">
              <div className="w-9 h-9 bg-blue-500/8 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/10">
                <FileStack className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[#1A2753] text-sm">Mes documents</p>
                <p className="text-[#273A7A]/80 text-xs">Statuts, attestations, contrats</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#273A7A]/15 flex-shrink-0" />
            </button>
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 flex items-center gap-3 active:bg-white/30 transition-colors rounded-b-2xl">
              <div className="w-9 h-9 bg-emerald-500/8 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/10">
                <Wallet className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[#1A2753] text-sm">Mes paiements</p>
                <p className="text-[#273A7A]/80 text-xs">Historique et reçus</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#273A7A]/15 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* ===== Sécurité & Biométrie - Glass ===== */}
        <div>
          <p className="text-[#273A7A]/80 text-[11px] tracking-wide mb-2 ml-1">Sécurité & Biométrie</p>
          <div className="glass-card rounded-2xl divide-y divide-white/30">
            {/* Face ID / Touch ID toggle principal */}
            <div className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors duration-300 ${
                biometricEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/15'
                  : 'bg-cyan-500/8 border-cyan-500/10'
              }`}>
                {biometricType === 'faceid' ? (
                  <ScanFace className={`w-4 h-4 transition-colors duration-300 ${biometricEnabled ? 'text-emerald-500' : 'text-cyan-500'}`} strokeWidth={1.8} />
                ) : (
                  <Fingerprint className={`w-4 h-4 transition-colors duration-300 ${biometricEnabled ? 'text-emerald-500' : 'text-cyan-500'}`} strokeWidth={1.8} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[#1A2753] text-sm">Face ID / Touch ID</p>
                  {biometricEnabled && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] rounded-full border border-emerald-500/15"
                    >
                      Actif
                    </motion.span>
                  )}
                </div>
                <p className="text-[#273A7A]/80 text-xs">
                  {biometricEnabled ? 'Authentification biométrique activée' : 'Déverrouiller avec vos données biométriques'}
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricEnabled}
                  onChange={handleToggleBiometric}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#F5F6FA] peer-checked:bg-[#D6A93A] rounded-full transition-colors duration-200 after:content-[''] after:absolute after:left-[3px] after:top-[3px] after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
              </label>
            </div>

            {/* Sub-options when biometric is enabled */}
            <AnimatePresence>
              {biometricEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {/* Connexion avec biométrie */}
                  <div className="p-4 flex items-center gap-3 pl-14">
                    <div className="flex-1">
                      <p className="text-[#1A2753] text-sm">Connexion rapide</p>
                      <p className="text-[#273A7A]/80 text-xs">Se connecter avec {biometricType === 'faceid' ? 'Face ID' : 'Touch ID'}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer">
                      <input
                        type="checkbox"
                        checked={loginWithBiometric}
                        onChange={() => setLoginWithBiometric(!loginWithBiometric)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#F5F6FA] peer-checked:bg-[#D6A93A] rounded-full transition-colors duration-200 after:content-[''] after:absolute after:left-[3px] after:top-[3px] after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  {/* Paiement avec biométrie */}
                  <div className="p-4 flex items-center gap-3 pl-14 border-t border-white/20">
                    <div className="flex-1">
                      <p className="text-[#1A2753] text-sm">Confirmer les paiements</p>
                      <p className="text-[#273A7A]/80 text-xs">Valider via {biometricType === 'faceid' ? 'Face ID' : 'Touch ID'}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentWithBiometric}
                        onChange={() => setPaymentWithBiometric(!paymentWithBiometric)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#F5F6FA] peer-checked:bg-[#D6A93A] rounded-full transition-colors duration-200 after:content-[''] after:absolute after:left-[3px] after:top-[3px] after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  {/* Changer le type biométrique */}
                  <button
                    onClick={() => {
                      setBiometricType(biometricType === 'faceid' ? 'touchid' : 'faceid');
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 pl-14 flex items-center gap-3 active:bg-white/30 transition-colors border-t border-white/20"
                  >
                    <div className="flex-1 text-left">
                      <p className="text-[#1A2753] text-sm">
                        Basculer vers {biometricType === 'faceid' ? 'Touch ID' : 'Face ID'}
                      </p>
                      <p className="text-[#273A7A]/80 text-xs">
                        Utiliser {biometricType === 'faceid' ? "l'empreinte digitale" : 'la reconnaissance faciale'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#273A7A]/15 flex-shrink-0" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Code PIN de secours */}
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 flex items-center gap-3 active:bg-white/30 transition-colors rounded-b-2xl">
              <div className="w-9 h-9 bg-rose-500/8 rounded-xl flex items-center justify-center flex-shrink-0 border border-rose-500/10">
                <Lock className="w-4 h-4 text-rose-500" strokeWidth={1.8} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[#1A2753] text-sm">Code PIN de secours</p>
                <p className="text-[#273A7A]/80 text-xs">En cas d'échec biométrique</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#273A7A]/15 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Paramètres - Glass */}
        <div>
          <p className="text-[#273A7A]/80 text-[11px] tracking-wide mb-2 ml-1">Paramètres</p>
          <div className="glass-card rounded-2xl divide-y divide-white/30">
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-500/8 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/10">
                <BellRing className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-[#1A2753] text-sm">Notifications WhatsApp</p>
                <p className="text-[#273A7A]/80 text-xs">Recevoir les mises à jour</p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[#F5F6FA] peer-checked:bg-[#D6A93A] rounded-full transition-colors duration-200 after:content-[''] after:absolute after:left-[3px] after:top-[3px] after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
              </label>
            </div>

            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-500/8 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-500/10">
                <MessageCircle className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex-1">
                <p className="text-[#1A2753] text-sm">Notifications Email</p>
                <p className="text-[#273A7A]/80 text-xs">Recevoir par email</p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-[#F5F6FA] peer-checked:bg-[#D6A93A] rounded-full transition-colors duration-200 after:content-[''] after:absolute after:left-[3px] after:top-[3px] after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
              </label>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 flex items-center gap-3 active:bg-white/30 transition-colors rounded-b-2xl"
            >
              <div className="w-9 h-9 bg-gray-500/8 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-500/10">
                {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-gray-600" />}
              </div>
              <div className="flex-1 text-left">
                <p className="text-[#1A2753] text-sm">Mode sombre</p>
                <p className="text-[#273A7A]/80 text-xs">{darkMode ? 'Activé' : 'Désactivé'}</p>
              </div>
              <label className="relative inline-flex cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#F5F6FA] peer-checked:bg-[#D6A93A] rounded-full transition-colors duration-200 after:content-[''] after:absolute after:left-[3px] after:top-[3px] after:w-[18px] after:h-[18px] after:bg-white after:rounded-full after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
              </label>
            </button>
          </div>
        </div>

        {/* Admin Access */}
        {currentUser?.role === 'admin' && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSwitchToAdmin}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#D6A93A] to-[#C49530] text-[#1A2753] py-3.5 rounded-2xl fab-glass flex items-center justify-center gap-2"
          >
            <Settings2 className="w-5 h-5" />
            <span className="text-sm">Accéder au dashboard admin</span>
          </motion.button>
        )}

        {/* Guide & Interface - Glass */}
        <div className="glass-card rounded-2xl divide-y divide-white/30">
          <button
            onClick={() => setShowOnboardingSlides(true)}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 flex items-center gap-3 active:bg-white/30 transition-colors rounded-t-2xl"
          >
            <div className="w-9 h-9 bg-[#D6A93A]/8 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D6A93A]/10">
              <CircleHelp className="w-4 h-4 text-[#D6A93A]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[#1A2753] text-sm">Guide découverte</p>
              <p className="text-[#273A7A]/80 text-xs">Relancer le tutoriel</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#273A7A]/15 flex-shrink-0" />
          </button>
          <button
            onClick={handleBackToIntro}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full p-4 flex items-center gap-3 active:bg-white/30 transition-colors rounded-b-2xl"
          >
            <div className="w-9 h-9 bg-[#273A7A]/6 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#273A7A]/8">
              <LayoutGrid className="w-4 h-4 text-[#273A7A]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[#1A2753] text-sm">Changer d'interface</p>
              <p className="text-[#273A7A]/80 text-xs">Mobile, web ou admin</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#273A7A]/15 flex-shrink-0" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-red-50/80 backdrop-blur-sm border border-red-100/50 text-red-500 py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Se déconnecter</span>
        </button>

        {/* Footer padding */}
        <div className="h-2" />
      </div>

      {/* ===== Biometric Setup Modal ===== */}
      <AnimatePresence>
        {showBiometricModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1A2753]/60 backdrop-blur-sm"
              onClick={() => {
                if (biometricStep === 'choose') {
                  setShowBiometricModal(false);
                }
              }}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-t-[28px] overflow-hidden pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Close button */}
              {biometricStep === 'choose' && (
                <button aria-label="Fermer"
                  onClick={() => setShowBiometricModal(false)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}

              {/* Step: Choose biometric type */}
              {biometricStep === 'choose' && (
                <div className="px-6 pt-2 pb-4">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/10">
                      <ShieldCheck className="w-8 h-8 text-cyan-600" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[#1A2753] text-lg mb-1">Activer la biométrie</h3>
                    <p className="text-[#273A7A]/80 text-sm">
                      Sécurisez votre compte avec la reconnaissance biométrique
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Face ID option */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEnableBiometric('faceid')}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full glass-card rounded-2xl p-4 flex items-center gap-4 group"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <ScanFace className="w-7 h-7 text-white" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[#1A2753] text-sm mb-0.5">Face ID</p>
                        <p className="text-[#273A7A]/80 text-xs">Reconnaissance faciale</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#273A7A]/15 group-hover:text-cyan-500 transition-colors" />
                    </motion.button>

                    {/* Touch ID option */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEnableBiometric('touchid')}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full glass-card rounded-2xl p-4 flex items-center gap-4 group"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                        <Fingerprint className="w-7 h-7 text-white" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[#1A2753] text-sm mb-0.5">Touch ID</p>
                        <p className="text-[#273A7A]/80 text-xs">Empreinte digitale</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#273A7A]/15 group-hover:text-rose-500 transition-colors" />
                    </motion.button>
                  </div>

                  <p className="text-center text-[#273A7A]/80 text-[10px] mt-5 px-4">
                    Vos données biométriques sont traitées localement sur votre appareil et ne sont jamais envoyées à nos serveurs.
                  </p>
                </div>
              )}

              {/* Step: Scanning */}
              {biometricStep === 'scanning' && (
                <div className="px-6 pt-4 pb-8">
                  <div className="text-center">
                    <div className="relative w-28 h-28 mx-auto mb-6">
                      {/* Outer pulse ring */}
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0, 0.15] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        className={`absolute inset-0 rounded-3xl ${biometricType === 'faceid' ? 'bg-cyan-500' : 'bg-rose-500'}`}
                      />
                      {/* Middle pulse ring */}
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0, 0.1] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                        className={`absolute inset-2 rounded-2xl ${biometricType === 'faceid' ? 'bg-cyan-500' : 'bg-rose-500'}`}
                      />
                      {/* Icon container */}
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        className={`absolute inset-4 rounded-2xl flex items-center justify-center ${
                          biometricType === 'faceid'
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30'
                            : 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30'
                        }`}
                      >
                        {biometricType === 'faceid' ? (
                          <ScanFace className="w-10 h-10 text-white" strokeWidth={1.3} />
                        ) : (
                          <Fingerprint className="w-10 h-10 text-white" strokeWidth={1.3} />
                        )}
                      </motion.div>
                      {/* Scanning line */}
                      <motion.div
                        animate={{ y: [0, 80, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className={`absolute left-4 right-4 h-[2px] top-4 rounded-full ${
                          biometricType === 'faceid' ? 'bg-cyan-400/60' : 'bg-rose-400/60'
                        }`}
                        style={{ boxShadow: biometricType === 'faceid' ? '0 0 12px rgba(6,182,212,0.4)' : '0 0 12px rgba(244,63,94,0.4)' }}
                      />
                    </div>

                    <h3 className="text-[#1A2753] text-lg mb-1">
                      {biometricType === 'faceid' ? 'Regardez la caméra' : 'Posez votre doigt'}
                    </h3>
                    <p className="text-[#273A7A]/80 text-sm">
                      {biometricType === 'faceid'
                        ? 'Scan facial en cours...'
                        : 'Lecture d\'empreinte en cours...'}
                    </p>

                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-2 mt-5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                          className={`w-2 h-2 rounded-full ${
                            biometricType === 'faceid' ? 'bg-cyan-500' : 'bg-rose-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Success */}
              {biometricStep === 'success' && (
                <div className="px-6 pt-4 pb-8">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                      className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25"
                    >
                      <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-[#1A2753] text-lg mb-1"
                    >
                      {biometricType === 'faceid' ? 'Face ID activé' : 'Touch ID activé'} !
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-[#273A7A]/80 text-sm"
                    >
                      Votre compte est désormais protégé
                    </motion.p>

                    {/* Shield animation */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center justify-center gap-1.5 mt-4 px-4 py-2 bg-emerald-50 rounded-xl mx-auto w-fit"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 text-xs">Protection biométrique active</span>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
