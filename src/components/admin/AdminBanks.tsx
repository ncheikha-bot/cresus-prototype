import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Plus, Edit, Trash2, Eye, EyeOff, Mail, Phone,
  User, Star, Clock, DollarSign, CheckCircle, XCircle, Search, Filter, X
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { BankPartner } from '../../types';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useConfirm } from '../ui/confirm-dialog';
import { nouvelId } from '../../lib/id';

export const AdminBanks: React.FC = () => {
  const confirm = useConfirm();
  const { banks, addBank, updateBank, deleteBank, users } = useApp();
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [editingBank, setEditingBank] = useState<BankPartner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: '',
    email: '',
    contactPerson: '',
    contactPhone: '',
    processingTime: '3-5 jours',
    rating: 4.5,
    color: 'from-emerald-500 to-emerald-600',
    services: [] as string[],
    requirements: [] as string[],
  });

  const [newService, setNewService] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const handleSubmit = () => {
    if (!formData.name || !formData.email) return;

    const bankData: BankPartner = {
      id: editingBank?.id || nouvelId('bank'),
      name: formData.name,
      logo: formData.logo,
      description: formData.description,
      email: formData.email,
      contactPerson: formData.contactPerson,
      contactPhone: formData.contactPhone,
      services: formData.services,
      processingTime: formData.processingTime,
      requirements: formData.requirements,
      rating: formData.rating,
      color: formData.color,
      active: true,
      createdAt: editingBank?.createdAt || new Date().toISOString(),
    };

    if (editingBank) {
      updateBank(bankData);
    } else {
      addBank(bankData);
      // Générer un mot de passe pour la démo
      const password = formData.name.toLowerCase().substring(0, 3) + '123';
      setGeneratedPassword(password);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      description: '',
      email: '',
      contactPerson: '',
      contactPhone: '',
      processingTime: '3-5 jours',
      rating: 4.5,
      color: 'from-emerald-500 to-emerald-600',
      services: [],
      requirements: [],
    });
    setNewService('');
    setNewRequirement('');
    setIsAddingBank(false);
    setEditingBank(null);
    setGeneratedPassword('');
  };

  const handleEdit = (bank: BankPartner) => {
    setEditingBank(bank);
    setFormData({
      name: bank.name,
      logo: bank.logo,
      description: bank.description,
      email: bank.email || '',
      contactPerson: bank.contactPerson || '',
      contactPhone: bank.contactPhone || '',
      processingTime: bank.processingTime,
      rating: bank.rating,
      color: bank.color,
      services: [...bank.services],
      requirements: [...bank.requirements],
    });
    setIsAddingBank(true);
  };

  const handleDelete = async (bankId: string) => {
    if (
      await confirm({
        title: 'Êtes-vous sûr de vouloir supprimer cette banque ?',
        description: 'Cette action est irréversible.',
        confirmLabel: 'Supprimer',
        variant: 'destructive',
      })
    ) {
      deleteBank(bankId);
    }
  };

  const handleToggleStatus = (bank: BankPartner) => {
    updateBank({ ...bank, active: !bank.active });
  };

  const addService = () => {
    if (newService && !formData.services.includes(newService)) {
      setFormData({ ...formData, services: [...formData.services, newService] });
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setFormData({ ...formData, services: formData.services.filter(s => s !== service) });
  };

  const addRequirement = () => {
    if (newRequirement && !formData.requirements.includes(newRequirement)) {
      setFormData({ ...formData, requirements: [...formData.requirements, newRequirement] });
      setNewRequirement('');
    }
  };

  const removeRequirement = (req: string) => {
    setFormData({ ...formData, requirements: formData.requirements.filter(r => r !== req) });
  };

  const filteredBanks = banks.filter(bank => {
    const matchesSearch = bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bank.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && bank.active) ||
                         (filterStatus === 'inactive' && !bank.active);
    return matchesSearch && matchesStatus;
  });

  const bankUsers = users.filter(u => u.role === 'bank');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#1A2753] mb-2">Gestion des Banques Partenaires</h2>
          <p className="text-gray-600">
            Gérez les banques partenaires et leurs accès à la plateforme
          </p>
        </div>
        <button
          onClick={() => setIsAddingBank(true)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Ajouter une banque
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">{banks.length}</p>
          <p className="text-gray-600 text-sm">Banques totales</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">
            {banks.filter(b => b.active).length}
          </p>
          <p className="text-gray-600 text-sm">Banques actives</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">
            {banks.filter(b => !b.active).length}
          </p>
          <p className="text-gray-600 text-sm">Banques inactives</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] mb-1">{bankUsers.length}</p>
          <p className="text-gray-600 text-sm">Comptes banque</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une banque..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  filterStatus === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Toutes' : status === 'active' ? 'Actives' : 'Inactives'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Banks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBanks.map((bank) => (
          <motion.div
            key={bank.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className={`h-2 bg-gradient-to-r ${bank.color}`} />
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {bank.logo.startsWith('http') ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-200">
                      <ImageWithFallback
                        src={bank.logo}
                        alt={bank.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`w-16 h-16 bg-gradient-to-br ${bank.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                      {bank.logo}
                    </div>
                  )}
                  <div>
                    <h3 className="text-[#1A2753] mb-1">{bank.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-600">{bank.rating}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bank.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {bank.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button aria-label="Modifier"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(bank);
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(bank);
                    }}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm ${
                      bank.active
                        ? 'bg-red-50 hover:bg-red-100'
                        : 'bg-green-50 hover:bg-green-100'
                    }`}
                    title={bank.active ? 'Désactiver' : 'Activer'}
                  >
                    {bank.active ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                  <button aria-label="Supprimer"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(bank.id);
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{bank.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span>{bank.processingTime}</span>
                </div>
                {bank.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span className="truncate">{bank.email}</span>
                  </div>
                )}
                {bank.contactPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span>{bank.contactPhone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Services ({bank.services.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {bank.services.slice(0, 3).map((service, idx) => (
                      <span key={idx} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg">
                        {service}
                      </span>
                    ))}
                    {bank.services.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                        +{bank.services.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAddingBank && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-[#1A2753]">
                  {editingBank ? 'Modifier la banque' : 'Ajouter une banque partenaire'}
                </h3>
                <button
                  onClick={resetForm}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Informations générales */}
                <div>
                  <h4 className="text-[#1A2753] mb-4">Informations générales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Nom de la banque *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Bank of Africa"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Logo (Emoji ou URL)</label>
                      <input
                        type="text"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        placeholder="Initiales ou https://..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-2 text-sm">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description de la banque..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-[#1A2753] mb-4">Informations de contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@banque.sn"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Téléphone</label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="+221 XX XXX XX XX"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-700 mb-2 text-sm">Personne de contact</label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Nom du contact"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Délais & Notation */}
                <div>
                  <h4 className="text-[#1A2753] mb-4">Délais & Notation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Délai de traitement</label>
                      <input
                        type="text"
                        value={formData.processingTime}
                        onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                        placeholder="3-5 jours"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 text-sm">Note (sur 5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                        placeholder="4.5"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h4 className="text-[#1A2753] mb-4">Services proposés</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addService()}
                        placeholder="Ajouter un service..."
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                      />
                      <button aria-label="Ajouter le service"
                        type="button"
                        onClick={addService}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.services.map((service, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() => removeService(service)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] hover:text-emerald-900"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Documents requis */}
                <div>
                  <h4 className="text-[#1A2753] mb-4">Documents requis</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                        placeholder="Ajouter un document..."
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                      />
                      <button aria-label="Ajouter le prérequis"
                        type="button"
                        onClick={addRequirement}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requirements.map((req, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg"
                        >
                          {req}
                          <button
                            type="button"
                            onClick={() => removeRequirement(req)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] hover:text-blue-900"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generated Password Display */}
                {generatedPassword && !editingBank && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-green-900 mb-2">Banque créée avec succès !</h4>
                        <p className="text-green-700 text-sm mb-3">
                          Mot de passe de connexion généré (à communiquer à la banque) :
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-4 py-2 bg-white rounded-lg text-green-900">
                            {showPassword ? generatedPassword : '••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-2 bg-white rounded-lg hover:bg-green-100 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.email}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingBank ? 'Mettre à jour' : 'Créer la banque'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};