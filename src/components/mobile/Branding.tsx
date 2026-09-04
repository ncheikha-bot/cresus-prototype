import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, CheckCircle, Calendar, Upload, Download, MessageSquare, 
  ChevronRight, Clock, Send, Paperclip, Eye, FileText, Image as ImageIcon,
  Video, Package, Check, X, Filter, Search, Star, TrendingUp, AlertCircle
} from '../ui/icons';
import { 
  mockBrandingServices, 
  mockBrandingProjects,
  BRANDING_FAMILIES,
  BRANDING_PACKS,
  formatPrice, 
  getStatusLabel, 
  getStatusColor,
  getServiceById,
  type BrandingService,
  type BrandingProject,
  type ServiceCategory,
  type ProjectMessage,
  type ProjectDeliverable
} from '../../data/brandingData';
import { DeliverableCard } from '../DeliverableCard';
import { DeliverableReviewModal } from '../modals/DeliverableModals';
import { useDeliverableActions } from '../../hooks/useDeliverableActions';
import { toast } from 'sonner';
import { nouvelId } from '../../lib/id';

interface BrandingProps {
  onBack: () => void;
}

type View = 'catalog' | 'service-details' | 'brief' | 'confirmation' | 'projects' | 'project-details';
type CategoryFilter = 'all' | ServiceCategory;

export const Branding: React.FC<BrandingProps> = ({ onBack }) => {
  const [view, setView] = useState<View>('catalog');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedService, setSelectedService] = useState<BrandingService | null>(null);
  const [selectedProject, setSelectedProject] = useState<BrandingProject | null>(null);
  
  // Brief form
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [preferredColors, setPreferredColors] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  
  // Messages
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  
  // Hook de gestion des livrables
  const deliverableActions = useDeliverableActions(
    selectedProject,
    messages,
    setMessages,
    {
      onSuccess: () => {
        console.log('Action sur livrable réussie');
      },
      onError: (error) => {
        console.error('Erreur :', error);
        toast.error(error);
      }
    }
  );

  const filteredServices = categoryFilter === 'all' 
    ? mockBrandingServices 
    : mockBrandingServices.filter(s => s.category === categoryFilter);

  const handleServiceSelect = (service: BrandingService) => {
    setSelectedService(service);
    setView('service-details');
  };

  const handleFileUpload = (fileName: string) => {
    setUploadedFiles([...uploadedFiles, fileName]);
  };

  const handleSubmitOrder = () => {
    // Ici on enverrait la commande au backend
    console.log('Commande soumise:', {
      service: selectedService,
      brief: {
        projectName,
        projectDescription,
        targetAudience,
        preferredColors,
        additionalNotes,
      },
      files: uploadedFiles
    });
    setView('confirmation');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedProject) return;
    
    const message: ProjectMessage = {
      id: nouvelId('msg'),
      type: 'text',
      author: 'client',
      authorName: 'Vous',
      content: newMessage,
      timestamp: new Date(),
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const getRemainingRevisions = () => {
    if (!selectedProject) return 0;
    return selectedProject.service.revisionsIncluded - selectedProject.revisionsUsed;
  };

  const getCategoryIcon = (category: ServiceCategory) => {
    const family = BRANDING_FAMILIES.find(f => f.id === category);
    return family?.icon || '';
  };

  const getCategoryLabel = (category: ServiceCategory) => {
    const family = BRANDING_FAMILIES.find(f => f.id === category);
    return family?.name || category;
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-24">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2753] via-[#273A7A] to-[#1A2753] pt-[max(3rem,env(safe-area-inset-top))] pb-5 px-5">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D6A93A]/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />

        <button aria-label="Retour"
          onClick={() => {
            if (view === 'catalog' || view === 'projects') {
              onBack();
            } else if (view === 'project-details') {
              setView('projects');
            } else {
              setView('catalog');
            }
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] relative mb-5 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        
        <h2 className="relative text-white text-lg mb-1">Branding & Communication</h2>
        <p className="relative text-white/70 text-xs">
          {view === 'catalog' && 'Créez votre identité de marque'}
          {view === 'service-details' && selectedService?.name}
          {view === 'brief' && 'Décrivez votre projet'}
          {view === 'confirmation' && 'Commande confirmée'}
          {view === 'projects' && 'Suivi de vos projets'}
          {view === 'project-details' && 'Détails du projet'}
        </p>

        {/* Tabs */}
        {(view === 'catalog' || view === 'projects') && (
          <div className="mt-4 flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('catalog')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                view === 'catalog'
                  ? 'bg-[#D6A93A] text-[#1A2753]'
                  : 'bg-white/10 text-white'
              }`}
            >
              Catalogue
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('projects')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] px-4 py-2 rounded-full text-sm transition-all duration-300 flex items-center gap-2 ${
                view === 'projects'
                  ? 'bg-[#D6A93A] text-[#1A2753]'
                  : 'bg-white/10 text-white'
              }`}
            >
              Mes projets
              <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                {mockBrandingProjects.length}
              </span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
        <AnimatePresence mode="popLayout">
          {/* Step 1: Catalogue */}
          {view === 'catalog' && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Category filters */}
              <div className="flex gap-2 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide mb-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategoryFilter('all')}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                    categoryFilter === 'all'
                      ? 'bg-[#D6A93A] text-[#1A2753]'
                      : 'bg-white text-[#273A7A] border-2 border-gray-200'
                  }`}
                >
                  Tous
                </motion.button>
                {BRANDING_FAMILIES.filter(f => f.id !== 'administrative-services').map((family) => (
                  <motion.button
                    key={family.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategoryFilter(family.id)}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-4 py-2 rounded-full text-sm whitespace-nowrap flex items-center gap-2 transition-all duration-300 ${
                      categoryFilter === family.id
                        ? 'bg-[#D6A93A] text-[#1A2753]'
                        : 'bg-white text-[#273A7A] border-2 border-gray-200'
                    }`}
                  >
                    <family.icon className="w-4 h-4 text-[#1A2753]" />
                    <span>{family.name}</span>
                  </motion.button>
                ))}
              </div>

              {/* Selected category description */}
              {categoryFilter !== 'all' && (() => {
                const family = BRANDING_FAMILIES.find(f => f.id === categoryFilter);
                if (!family) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4"
                  >
                    <div className="bg-gradient-to-r from-[#1A2753]/5 to-[#273A7A]/5 border-l-4 border-[#D6A93A] rounded-xl p-4 flex items-start gap-3">
                      <family.icon className="w-6 h-6 text-[#1A2753]" />
                      <div>
                        <p className="text-[#1A2753] text-sm">{family.name}</p>
                        <p className="text-[#273A7A]/80 text-xs">{family.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {/* Smart Packs - only when showing all */}
              {categoryFilter === 'all' && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-[#D6A93A]" />
                    <p className="text-[#1A2753] text-sm">Packs intelligents</p>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-3 -mx-6 px-6 scrollbar-hide">
                    {BRANDING_PACKS.map((pack) => (
                      <motion.div
                        key={pack.id}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-shrink-0 w-72 bg-white rounded-2xl p-4 shadow-sm relative overflow-hidden ${
                          pack.popular ? 'ring-2 ring-[#D6A93A]' : ''
                        }`}
                      >
                        {pack.popular && (
                          <div className="absolute top-0 left-0 right-0 bg-[#D6A93A] text-white text-center py-1 text-xs">
                            Recommandé
                          </div>
                        )}
                        <div className={pack.popular ? 'pt-4' : ''}>
                          <div className="flex items-center gap-2 mb-2">
                            <pack.icon className="w-6 h-6 text-[#1A2753]" />
                            <p className="text-[#1A2753]">Pack {pack.name}</p>
                          </div>
                          <p className="text-[#D6A93A] text-xs mb-1">{pack.tagline}</p>
                          <p className="text-[#273A7A]/80 text-xs mb-3">{pack.description}</p>
                          
                          <div className="mb-3">
                            <span className="text-[#273A7A]/80 text-xs">À partir de</span>
                            <p className="text-[#1A2753]">{formatPrice(pack.price)}</p>
                          </div>

                          <div className="space-y-1.5 mb-4">
                            {pack.services.slice(0, 4).map((serviceId) => {
                              const service = getServiceById(serviceId);
                              if (!service) return null;
                              return (
                                <div key={serviceId} className="flex items-center gap-1.5">
                                  <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                                  <span className="text-[#273A7A]/80 text-xs">{service.name}</span>
                                </div>
                              );
                            })}
                            {pack.services.length > 4 && (
                              <p className="text-[#273A7A]/80 text-xs ml-5">+{pack.services.length - 4} services</p>
                            )}
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              const firstService = getServiceById(pack.services[0]);
                              if (firstService) {
                                setSelectedService(firstService);
                                setProjectName(`Pack ${pack.name}`);
                                setView('brief');
                              }
                            }}
                            className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full rounded-xl py-2.5 text-sm flex items-center justify-center gap-1.5 transition-all ${
                              pack.popular
                                ? 'bg-[#D6A93A] text-white'
                                : 'bg-[#F5F6FA] text-[#1A2753]'
                            }`}
                          >
                            <span>Choisir</span>
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services grid */}
              <div className="space-y-3">
                {filteredServices.map((service) => (
                  <motion.button
                    key={service.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleServiceSelect(service)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-4 shadow-sm text-left relative overflow-hidden"
                  >
                    {service.popular && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Populaire</span>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <service.icon className="w-8 h-8 text-[#1A2753]" />
                      <div className="flex-1 pr-20">
                        <h3 className="text-[#1A2753] mb-1">{service.name}</h3>
                        <p className="text-[#273A7A]/80 text-sm mb-3">{service.description}</p>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-[#D6A93A]">
                            <span className="text-sm">À partir de</span>
                            <span>{formatPrice(service.priceRange.min)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#273A7A]/80 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{service.timeline}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#273A7A]/40 absolute right-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Service Details */}
          {view === 'service-details' && selectedService && (
            <motion.div
              key="service-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                <selectedService.icon className="w-10 h-10 mb-4 text-[#1A2753]" />
                <h3 className="text-[#1A2753] mb-2">{selectedService.name}</h3>
                <p className="text-[#273A7A]/80 mb-4">{selectedService.description}</p>
                
                <div className="bg-[#D6A93A]/10 rounded-xl p-4 mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[#273A7A]/80 text-sm">À partir de</span>
                    <span className="text-[#1A2753]">{formatPrice(selectedService.priceRange.min)}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#273A7A]/80 text-sm">Jusqu'à</span>
                    <span className="text-[#1A2753]">{formatPrice(selectedService.priceRange.max)}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#D6A93A]" />
                    <span className="text-[#273A7A]/80 text-sm">Délai: {selectedService.timeline}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-[#1A2753] mb-3">Ce qui est inclus :</p>
                  <div className="space-y-2">
                    {selectedService.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-[#273A7A]/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 mt-4">
                  <p className="text-[#1A2753] mb-3">Livrables :</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.deliverables.map((deliverable, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#F5F6FA] text-[#273A7A]/80 text-sm rounded-full">
                        {deliverable}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('brief')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-2xl py-4 shadow-lg"
              >
                Commander ce service
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Brief & Upload */}
          {view === 'brief' && selectedService && (
            <motion.div
              key="brief"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-4 mb-4 border-l-4 border-[#D6A93A]">
                <p className="text-[#1A2753] mb-1">Service sélectionné</p>
                <p className="text-[#273A7A]/80 text-sm">{selectedService.name}</p>
              </div>

              <h3 className="text-[#1A2753] mb-4">Décrivez votre projet</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[#1A2753] text-sm mb-2 block">
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ex: Logo pour ma boutique"
                    className="w-full bg-white rounded-xl p-3 text-[#1A2753] text-sm outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[#1A2753] text-sm mb-2 block">
                    Description du projet *
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Décrivez votre projet, vos objectifs, votre vision..."
                    className="w-full bg-white rounded-xl p-3 text-[#1A2753] text-sm outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-[#1A2753] text-sm mb-2 block">
                    Public cible *
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ex: Jeunes professionnels 25-35 ans"
                    className="w-full bg-white rounded-xl p-3 text-[#1A2753] text-sm outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[#1A2753] text-sm mb-2 block">
                    Couleurs préférées (optionnel)
                  </label>
                  <input
                    type="text"
                    value={preferredColors}
                    onChange={(e) => setPreferredColors(e.target.value)}
                    placeholder="Ex: Bleu marine, doré, blanc"
                    className="w-full bg-white rounded-xl p-3 text-[#1A2753] text-sm outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[#1A2753] text-sm mb-2 block">
                    Notes additionnelles (optionnel)
                  </label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Exemples, inspirations, informations complémentaires..."
                    className="w-full bg-white rounded-xl p-3 text-[#1A2753] text-sm outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors resize-none"
                    rows={3}
                  />
                </div>

                {/* File upload */}
                <div className="bg-white rounded-xl p-4">
                  <label className="text-[#1A2753] text-sm mb-3 block">
                    Fichiers de référence (optionnel)
                  </label>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-[#F5F6FA] rounded-lg p-3">
                          <FileText className="w-5 h-5 text-[#D6A93A]" />
                          <span className="text-[#1A2753] text-sm flex-1">{file}</span>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      ))}
                    </div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFileUpload(`reference_${uploadedFiles.length + 1}.jpg`)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-[#D6A93A]/10 text-[#D6A93A] rounded-xl py-3 flex items-center justify-center gap-2 border-2 border-dashed border-[#D6A93A]/30"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Téléverser un fichier</span>
                  </motion.button>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitOrder}
                disabled={!projectName || !projectDescription || !targetAudience}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-2xl py-4 shadow-lg mt-6 disabled:opacity-50"
              >
                Soumettre la commande
              </motion.button>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {view === 'confirmation' && selectedService && (
            <motion.div
              key="confirmation"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>

              <h2 className="text-[#1A2753] mb-3">Commande envoyée !</h2>
              <p className="text-[#273A7A]/80 mb-8">
                Notre équipe va étudier votre projet et vous envoyer un devis personnalisé sous 24-48h
              </p>

              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-left">
                <p className="text-[#273A7A]/80 text-sm mb-3">Récapitulatif</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <selectedService.icon className="w-7 h-7 text-[#1A2753]" />
                    <div>
                      <p className="text-[#1A2753]">{selectedService.name}</p>
                      <p className="text-[#273A7A]/80 text-sm">{projectName}</p>
                    </div>
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-[#273A7A]/80 text-sm mb-2">{uploadedFiles.length} fichier(s) joint(s)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('projects')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-2xl py-4 shadow-lg"
                >
                  Voir mes projets
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setView('catalog');
                    setProjectName('');
                    setProjectDescription('');
                    setTargetAudience('');
                    setPreferredColors('');
                    setAdditionalNotes('');
                    setUploadedFiles([]);
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white border-2 border-[#273A7A]/20 text-[#1A2753] rounded-2xl py-4"
                >
                  Retour au catalogue
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* View: Projects List */}
          {view === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {mockBrandingProjects.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                  <div className="w-20 h-20 bg-[#F5F6FA] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-10 h-10 text-[#273A7A]/40" />
                  </div>
                  <h3 className="text-[#1A2753] mb-2">Aucun projet en cours</h3>
                  <p className="text-[#273A7A]/80 text-sm mb-6">
                    Commandez votre premier service de branding
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView('catalog')}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 bg-[#D6A93A] text-[#1A2753] rounded-xl"
                  >
                    Découvrir les services
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockBrandingProjects.map((project) => (
                    <motion.button
                      key={project.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedProject(project);
                        setMessages(project.messages);
                        setView('project-details');
                      }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white rounded-2xl p-4 shadow-sm text-left"
                    >
                      <div className="flex items-start gap-4">
                        <project.service.icon className="w-7 h-7 text-[#1A2753]" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-[#1A2753]">{project.clientBrief.projectName}</p>
                              <p className="text-[#273A7A]/80 text-sm">{project.service.name}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs rounded-full bg-${getStatusColor(project.status)}-100 text-${getStatusColor(project.status)}-700`}>
                              {getStatusLabel(project.status)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-[#273A7A]/80">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                            {project.messages.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {project.messages.length} messages
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#273A7A]/40" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* View: Project Details */}
          {view === 'project-details' && selectedProject && (
            <motion.div
              key="project-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Project info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                <div className="flex items-start gap-4 mb-4">
                  <selectedProject.service.icon className="w-8 h-8 text-[#1A2753]" />
                  <div className="flex-1">
                    <h3 className="text-[#1A2753] mb-1">{selectedProject.clientBrief.projectName}</h3>
                    <p className="text-[#273A7A]/80 text-sm mb-3">{selectedProject.service.name}</p>
                    <span className={`inline-block px-3 py-1 text-xs rounded-full bg-${getStatusColor(selectedProject.status)}-100 text-${getStatusColor(selectedProject.status)}-700`}>
                      {getStatusLabel(selectedProject.status)}
                    </span>
                  </div>
                </div>

                {selectedProject.quote && (
                  <div className="bg-[#D6A93A]/10 rounded-xl p-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#1A2753]">Devis</span>
                      <span className="text-[#D6A93A]">{formatPrice(selectedProject.quote.amount)}</span>
                    </div>
                    <p className="text-[#273A7A]/80 text-sm">{selectedProject.quote.description}</p>
                    {selectedProject.quote.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-green-600 text-white rounded-lg py-2 text-sm">
                          Accepter
                        </button>
                        <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-red-600 text-white rounded-lg py-2 text-sm">
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Deliverables */}
              {selectedProject.deliverables.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[#1A2753] flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#D6A93A]" />
                      Livrables ({selectedProject.deliverables.length})
                    </h4>
                    <div className="text-xs text-[#273A7A]/80">
                      {getRemainingRevisions()} révision(s)
                    </div>
                  </div>
                  
                  {/* Livrable groupé par nom (versions) */}
                  <div className="space-y-3">
                    {(() => {
                      // Grouper par nom de livrable
                      const grouped = selectedProject.deliverables.reduce((acc, deliverable) => {
                        const baseName = deliverable.name.replace(/\s*-\s*v\d+$/i, '');
                        if (!acc[baseName]) {
                          acc[baseName] = [];
                        }
                        acc[baseName].push(deliverable);
                        return acc;
                      }, {} as Record<string, ProjectDeliverable[]>);

                      // Trier chaque groupe par version décroissante
                      Object.keys(grouped).forEach(key => {
                        grouped[key].sort((a, b) => b.version - a.version);
                      });

                      return Object.entries(grouped).map(([baseName, versions]) => {
                        const latestVersion = versions[0];
                        const hasMultipleVersions = versions.length > 1;

                        return (
                          <div key={baseName}>
                            {/* Dernière version */}
                            <DeliverableCard
                              deliverable={latestVersion}
                              onReview={deliverableActions.openReviewModal}
                              onDownloadFile={deliverableActions.handleDownloadFile}
                              onDownloadAll={deliverableActions.handleDownloadAll}
                              mode="mobile"
                            />

                            {/* Versions précédentes */}
                            {hasMultipleVersions && (
                              <details className="group mt-2">
                                <summary className="px-3 py-2 cursor-pointer text-xs text-[#273A7A]/80 bg-[#F5F6FA] rounded-lg flex items-center justify-between">
                                  <span>Versions précédentes ({versions.length - 1})</span>
                                  <svg 
                                    className="w-3 h-3 transition-transform group-open:rotate-180" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </summary>
                                
                                <div className="mt-2 space-y-2">
                                  {versions.slice(1).map((version, index) => (
                                    <motion.div
                                      key={version.id}
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <DeliverableCard
                                        deliverable={version}
                                        onDownloadFile={deliverableActions.handleDownloadFile}
                                        onDownloadAll={deliverableActions.handleDownloadAll}
                                        mode="mobile"
                                      />
                                    </motion.div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h4 className="text-[#1A2753] mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#D6A93A]" />
                  Discussion
                </h4>
                
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.author === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-3 ${
                        message.author === 'client'
                          ? 'bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white'
                          : 'bg-[#F5F6FA] text-[#1A2753]'
                      }`}>
                        <p className={`text-xs mb-1 ${message.author === 'client' ? 'text-white/70' : 'text-[#273A7A]/80'}`}>
                          {message.authorName}
                        </p>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.author === 'client' ? 'text-white/70' : 'text-[#273A7A]/80'}`}>
                          {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Votre message..."
                    className="flex-1 bg-[#F5F6FA] rounded-xl p-3 text-[#1A2753] text-sm outline-none"
                  />
                  <motion.button aria-label="Envoyer le message"
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-12 h-12 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl flex items-center justify-center disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Deliverable Review Modal */}
      <DeliverableReviewModal
        show={deliverableActions.showReviewModal}
        onClose={deliverableActions.closeReviewModal}
        deliverable={deliverableActions.selectedDeliverable}
        onApprove={deliverableActions.handleApproveDeliverable}
        onRequestRevision={deliverableActions.handleRequestRevision}
        mode="mobile"
        revisionsRemaining={deliverableActions.revisionsRemaining}
      />
    </div>
  );
};