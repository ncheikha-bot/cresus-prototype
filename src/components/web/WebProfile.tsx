import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Settings, Moon, Sun, Bell, MessageSquare, Lock, Eye, EyeOff, ArrowRight } from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { mockUsers } from '../../data/mockData';

export const WebProfile: React.FC = () => {
  const { currentUser, darkMode, setDarkMode, setCurrentUser } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleQuickLogin = (userEmail: string) => {
    const user = mockUsers.find(u => u.email === userEmail);
    if (user) {
      setCurrentUser(user);
    }
  };

  // Formulaire de connexion tant qu'aucun compte client n'est connecté. Une
  // session d'administration ou de comptabilité, ouverte d'office par son propre
  // espace, ne doit pas passer pour une session cliente : sans cela, on ne
  // pouvait plus se reconnecter ici.
  if (currentUser?.role !== 'client') {
    return (
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-lg"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-[#1A2753] mb-2">
              {isLogin ? 'Connexion' : 'Inscription'}
            </h2>
            <p className="text-[#273A7A]/80">
              {isLogin ? 'Accédez à votre compte' : 'Créez votre compte'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-[#1A2753] mb-2 text-sm">Nom complet</label>
                <input
                  type="text"
                  placeholder="Amadou Diallo"
                  className="w-full px-4 py-3 bg-[#F5F6FA] border border-transparent rounded-xl focus:outline-none focus:border-[#D6A93A] transition-all duration-300"
                />
              </div>
            )}

            <div>
              <label className="block text-[#1A2753] mb-2 text-sm">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#273A7A]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-[#F5F6FA] border border-transparent rounded-xl focus:outline-none focus:border-[#D6A93A] transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#1A2753] mb-2 text-sm">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#273A7A]/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-[#F5F6FA] border border-transparent rounded-xl focus:outline-none focus:border-[#D6A93A] transition-all duration-300"
                />
                <button aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 absolute right-4 top-1/2 -translate-y-1/2 text-[#273A7A]/80 hover:text-[#273A7A] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded accent-[#D6A93A]" />
                  <span className="text-[#273A7A]/80">Se souvenir de moi</span>
                </label>
                <button type="button" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-[#D6A93A] hover:underline">
                  Mot de passe oublié?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white py-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>{isLogin ? 'Se connecter' : 'Créer un compte'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-[#273A7A]/80 hover:text-[#1A2753] transition-colors text-sm"
            >
              {isLogin ? "Pas encore de compte? S'inscrire" : 'Déjà un compte? Se connecter'}
            </button>
          </div>

          {/* Quick Login for Demo */}
          <div className="mt-8 pt-8 border-t border-[#F5F6FA]">
            <p className="text-[#273A7A]/80 text-sm mb-4 text-center">Accès rapide démo</p>
            <div className="space-y-3">
              {/* Le même compte de démonstration que l'application mobile : celui
                  de `client@cresus.sn` n'a aucune société, l'espace s'ouvrait vide. */}
              <button
                onClick={() => handleQuickLogin('cheikh@example.com')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full px-4 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#D6A93A]/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
              >
                Mode Client
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-3xl p-8 text-white"
      >
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-[#D6A93A] rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-[#1A2753]" />
          </div>
          <div className="flex-1">
            <h2 className="text-white mb-2">{currentUser?.name}</h2>
            <p className="text-white/80 mb-4">{currentUser?.email}</p>
            <div className="flex gap-2">
              {/* Passé le garde ci-dessus, seul un compte client parvient ici. */}
              <span className="px-4 py-1.5 bg-[#D6A93A] text-[#1A2753] rounded-full text-sm">
                Client
              </span>
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-sm">
                Compte vérifié
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm space-y-4"
        >
          <h3 className="text-[#1A2753] mb-4">Informations personnelles</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#F5F6FA] rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[#273A7A]/80 text-sm">Email</p>
                <p className="text-[#1A2753]">{currentUser?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#F5F6FA] rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-[#273A7A]/80 text-sm">Téléphone</p>
                <p className="text-[#1A2753]">+221 77 123 45 67</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#F5F6FA] rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-[#273A7A]/80 text-sm">Adresse</p>
                <p className="text-[#1A2753]">Dakar, Sénégal</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#F5F6FA] rounded-xl">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-[#273A7A]/80 text-sm">Membre depuis</p>
                <p className="text-[#1A2753]">Janvier 2025</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-[#1A2753] mb-4">Préférences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F5F6FA] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    {darkMode ? <Sun className="w-5 h-5 text-gray-600" /> : <Moon className="w-5 h-5 text-gray-600" />}
                  </div>
                  <div>
                    <p className="text-[#1A2753]">Mode sombre</p>
                    <p className="text-[#273A7A]/80 text-sm">{darkMode ? 'Activé' : 'Désactivé'}</p>
                  </div>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    className="opacity-0 w-0 h-0 peer"
                  />
                  <span className="absolute inset-0 bg-[#F5F6FA] rounded-full cursor-pointer transition-all duration-300 peer-checked:bg-[#D6A93A]">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-6" />
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F5F6FA] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[#1A2753]">Notifications WhatsApp</p>
                    <p className="text-[#273A7A]/80 text-sm">Recevoir les mises à jour</p>
                  </div>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                  <span className="absolute inset-0 bg-[#F5F6FA] rounded-full cursor-pointer transition-all duration-300 peer-checked:bg-[#D6A93A]">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-6" />
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#F5F6FA] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[#1A2753]">Notifications Email</p>
                    <p className="text-[#273A7A]/80 text-sm">Recevoir par email</p>
                  </div>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                  <span className="absolute inset-0 bg-[#F5F6FA] rounded-full cursor-pointer transition-all duration-300 peer-checked:bg-[#D6A93A]">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-6" />
                  </span>
                </label>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-[#1A2753] mb-4">Sécurité</h3>
            
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full flex items-center gap-4 p-4 bg-[#F5F6FA] rounded-xl hover:bg-[#F5F6FA]/80 transition-all duration-300">
              <div className="w-10 h-10 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#D6A93A]" />
              </div>
              <div className="text-left flex-1">
                <p className="text-[#1A2753]">Changer le mot de passe</p>
                <p className="text-[#273A7A]/80 text-sm">Dernière modification il y a 30 jours</p>
              </div>
              <Settings className="w-5 h-5 text-[#273A7A]/40" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
