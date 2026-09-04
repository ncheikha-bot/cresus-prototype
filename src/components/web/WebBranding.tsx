import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, CheckCircle, Calendar, Upload, Download, MessageSquare, 
  ChevronRight, Clock, Send, Paperclip, Eye, FileText, Image as ImageIcon,
  Video, Package, Check, X, Filter, Search, Star, TrendingUp, AlertCircle,
  Play, Pause
} from '../ui/icons';
import { 
  mockBrandingServices, 
  mockBrandingProjects,
  type ProjectStatus,
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
import { nouvelId } from '../../lib/id';
import { useApp } from '../../context/AppContext';
import { getStatutProjet } from '../../domain/brandingStatus';

interface WebBrandingProps {
  onBack: () => void;
}

type View = 'catalog' | 'service-details' | 'brief' | 'confirmation' | 'projects' | 'project-details';
type CategoryFilter = 'all' | ServiceCategory;

export const WebBranding: React.FC<WebBrandingProps> = ({ onBack }) => {
  const { addBrandingOrder, brandingOrders, currentUser } = useApp();

  /**
   * Projets affichés : les commandes réellement passées, puis les exemples.
   * L'onglet ne montrait que ces derniers — une commande venait d'être payée
   * qu'elle n'y figurait déjà plus.
   */
  const projetsClient = brandingOrders.map(commande => ({
    id: commande.id,
    service: mockBrandingServices.find(s => s.id === commande.serviceId) ?? mockBrandingServices[0],
    status: getStatutProjet(commande.status),
    clientBrief: {
      projectName: commande.projectName,
      description: commande.description,
      targetAudience: commande.targetAudience,
      preferredColors: commande.preferredColors,
      additionalNotes: commande.additionalNotes,
    },
    payment: { amount: commande.amount, status: 'pending' as const },
    deliverables: [],
    messages: [],
    createdAt: new Date(commande.createdAt),
    updatedAt: new Date(commande.createdAt),
  })) as unknown as BrandingProject[];

  const projetsAffiches = [...projetsClient, ...mockBrandingProjects];
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
  
  // Deliverable review
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<ProjectDeliverable | null>(null);

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
    if (!selectedService) return;
    // La commande n'existait que dans une trace de console : elle disparaissait
    // dès qu'on quittait l'écran et n'atteignait jamais l'administration.
    addBrandingOrder({
      clientId: currentUser?.id,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      projectName,
      description: projectDescription,
      targetAudience,
      preferredColors,
      additionalNotes,
      amount: selectedService.priceRange.min,
      status: 'submitted',
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

  const handleReviewDeliverable = (deliverable: ProjectDeliverable) => {
    setSelectedDeliverable(deliverable);
    setShowReviewModal(true);
  };

  const handleApproveDeliverable = (comment?: string) => {
    if (!selectedDeliverable || !selectedProject) return;

    console.log('Deliverable approved:', {
      deliverableId: selectedDeliverable.id,
      comment,
      approvedAt: new Date(),
    });

    const message: ProjectMessage = {
      id: nouvelId('msg'),
      type: 'approval',
      author: 'client',
      authorName: 'Vous',
      content: comment || `J'ai approuvé le livrable "${selectedDeliverable.name}". Excellent travail ! `,
      timestamp: new Date(),
      deliverableId: selectedDeliverable.id,
    };

    setMessages([...messages, message]);
    setShowReviewModal(false);
    setSelectedDeliverable(null);
  };

  const handleRequestRevision = (notes: string) => {
    if (!selectedDeliverable || !selectedProject) return;

    console.log('Revision requested:', {
      deliverableId: selectedDeliverable.id,
      revisionNotes: notes,
      requestedAt: new Date(),
    });

    const message: ProjectMessage = {
      id: nouvelId('msg'),
      type: 'revision-request',
      author: 'client',
      authorName: 'Vous',
      content: `Modifications demandées pour "${selectedDeliverable.name}":\n\n${notes}`,
      timestamp: new Date(),
      deliverableId: selectedDeliverable.id,
    };

    setMessages([...messages, message]);
    setShowReviewModal(false);
    setSelectedDeliverable(null);
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.button aria-label="Retour"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (view === 'catalog' || view === 'projects') {
                onBack();
              } else if (view === 'project-details') {
                setView('projects');
              } else {
                setView('catalog');
              }
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
          </motion.button>
          <div>
            <h1 className="text-[#1A2753]">Branding & Communication</h1>
            <p className="text-[#273A7A]/80">
              {view === 'catalog' && 'Donnez vie à votre identité de marque'}
              {view === 'service-details' && selectedService?.name}
              {view === 'brief' && 'Partagez votre vision créative'}
              {view === 'confirmation' && 'Commande envoyée avec succès'}
              {view === 'projects' && 'Tous vos projets créatifs'}
              {view === 'project-details' && 'Suivi détaillé du projet'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        {(view === 'catalog' || view === 'projects') && (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('catalog')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                view === 'catalog'
                  ? 'bg-[#D6A93A] text-white shadow-lg'
                  : 'bg-white text-[#273A7A] border-2 border-gray-200'
              }`}
            >
              Catalogue
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('projects')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                view === 'projects'
                  ? 'bg-[#D6A93A] text-white shadow-lg'
                  : 'bg-white text-[#273A7A] border-2 border-gray-200'
              }`}
            >
              Mes projets
              <span className="w-6 h-6 bg-white/20 rounded-full text-sm flex items-center justify-center">
                {projetsAffiches.length}
              </span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Content */}
      {/* popLayout et non "wait" : avec plusieurs enfants conditionnels freres, "wait" attend une sortie qui ne se termine jamais et l'etape suivante n'est jamais montee — le parcours se bloque. */}
      <AnimatePresence mode="popLayout">
        {/* View: Catalog */}
        {view === 'catalog' && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Category filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCategoryFilter('all')}
                className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 rounded-xl text-sm transition-all duration-300 ${
                  categoryFilter === 'all'
                    ? 'bg-[#D6A93A] text-white shadow-lg'
                    : 'bg-white text-[#273A7A] border-2 border-gray-200 hover:border-[#D6A93A]'
                }`}
              >
                Tous les services
              </motion.button>
              {BRANDING_FAMILIES.filter(f => f.id !== 'administrative-services').map((family) => (
                <motion.button
                  key={family.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCategoryFilter(family.id)}
                  className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-3 rounded-xl text-sm flex items-center gap-2 transition-all duration-300 ${
                    categoryFilter === family.id
                      ? 'bg-[#D6A93A] text-white shadow-lg'
                      : 'bg-white text-[#273A7A] border-2 border-gray-200 hover:border-[#D6A93A]'
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
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <div className="bg-gradient-to-r from-[#1A2753]/5 to-[#273A7A]/5 border-l-4 border-[#D6A93A] rounded-xl p-5 flex items-start gap-4">
                    <family.icon className="w-7 h-7 text-[#1A2753]" />
                    <div>
                      <h3 className="text-[#1A2753] mb-1">{family.name}</h3>
                      <p className="text-[#273A7A]/80 text-sm">{family.description}</p>
                      <p className="text-[#273A7A]/80 text-xs mt-2">
                        {filteredServices.length} service(s) dans cette famille
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Smart Packs section - only when showing all */}
            {categoryFilter === 'all' && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D6A93A] to-[#D6A93A]/70 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[#1A2753]">Packs intelligents</h2>
                    <p className="text-[#273A7A]/80 text-sm">Choisissez le pack adapté à votre ambition</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {BRANDING_PACKS.map((pack, idx) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -8 }}
                      className={`relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                        pack.popular ? 'ring-2 ring-[#D6A93A]' : ''
                      }`}
                    >
                      {pack.popular && (
                        <div className="absolute top-0 left-0 right-0 bg-[#D6A93A] text-white text-center py-1.5 text-xs">
                          Recommandé
                        </div>
                      )}
                      <div className={`bg-white p-6 ${pack.popular ? 'pt-10' : ''}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <pack.icon className="w-7 h-7 text-[#1A2753]" />
                          <div>
                            <h3 className="text-[#1A2753]">Pack {pack.name}</h3>
                          </div>
                        </div>
                        <p className="text-[#D6A93A] text-sm mb-2">{pack.tagline}</p>
                        <p className="text-[#273A7A]/80 text-sm mb-4">{pack.description}</p>
                        
                        <div className="mb-4">
                          <span className="text-[#273A7A]/80 text-xs">À partir de</span>
                          <div className="text-2xl text-[#1A2753]">{formatPrice(pack.price)}</div>
                        </div>

                        <div className="space-y-2 mb-6">
                          {pack.services.map((serviceId) => {
                            const service = getServiceById(serviceId);
                            if (!service) return null;
                            return (
                              <div key={serviceId} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-[#273A7A]/80 text-sm">{service.name}</span>
                              </div>
                            );
                          })}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            // Sélectionner le premier service du pack pour le brief
                            const firstService = getServiceById(pack.services[0]);
                            if (firstService) {
                              setSelectedService(firstService);
                              setProjectName(`Pack ${pack.name}`);
                              setView('brief');
                            }
                          }}
                          className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full rounded-xl py-3 flex items-center justify-center gap-2 transition-all duration-300 ${
                            pack.popular
                              ? 'bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-white shadow-lg'
                              : 'bg-[#F5F6FA] hover:bg-[#1A2753] text-[#1A2753] hover:text-white'
                          }`}
                        >
                          <span>Choisir ce pack</span>
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 border-t border-gray-100 pt-6">
                  <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#D6A93A]" />
                    Explorer par famille
                  </h3>
                </div>
              </div>
            )}

            {/* Services grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden cursor-pointer"
                  onClick={() => handleServiceSelect(service)}
                >
                  {service.popular && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Populaire</span>
                    </div>
                  )}
                  
                  <service.icon className="w-10 h-10 mb-4 text-[#1A2753]" />
                  <h3 className="text-[#1A2753] mb-2">{service.name}</h3>
                  <p className="text-[#273A7A]/80 text-sm mb-4 h-10">{service.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#273A7A]/80 text-sm">À partir de</span>
                      <span className="text-[#D6A93A]">{formatPrice(service.priceRange.min)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#273A7A]/80 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{service.timeline}</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceSelect(service);
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-[#F5F6FA] hover:bg-[#D6A93A] text-[#1A2753] hover:text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <span>Voir les détails</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* View: Service Details */}
        {view === 'service-details' && selectedService && (
          <motion.div
            key="service-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-start gap-6 mb-6">
                  <selectedService.icon className="w-12 h-12 text-[#1A2753]" />
                  <div className="flex-1">
                    <h2 className="text-[#1A2753] mb-2">{selectedService.name}</h2>
                    <p className="text-[#273A7A]/80 mb-4">{selectedService.description}</p>
                    <div className="flex items-center gap-2 text-[#273A7A]/80">
                      <Clock className="w-5 h-5" />
                      <span>Délai de livraison: {selectedService.timeline}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-[#1A2753] mb-4">Ce qui est inclus</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedService.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-[#273A7A]/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-[#1A2753] mb-4">Livrables finaux</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.deliverables.map((deliverable, idx) => (
                      <span key={idx} className="px-4 py-2 bg-[#F5F6FA] text-[#273A7A]/80 rounded-lg">
                        {deliverable}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#D6A93A] to-[#D6A93A]/80 rounded-2xl p-6 text-white shadow-lg sticky top-6">
                <h3 className="mb-4">Tarification</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-white/80">À partir de</span>
                    <span className="text-2xl">{formatPrice(selectedService.priceRange.min)}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-white/80">Jusqu'à</span>
                    <span className="text-2xl">{formatPrice(selectedService.priceRange.max)}</span>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                  <p className="text-white/90 text-sm">
                    Le devis final sera calculé en fonction de vos besoins spécifiques
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('brief')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-white text-[#1A2753] rounded-xl py-4 shadow-lg hover:shadow-xl transition-all"
                >
                  Commander ce service
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* View: Brief Form */}
        {view === 'brief' && selectedService && (
          <motion.div
            key="brief"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-xl p-6 mb-6 border-l-4 border-[#D6A93A]">
              <div className="flex items-center gap-4">
                <selectedService.icon className="w-8 h-8 text-[#1A2753]" />
                <div>
                  <p className="text-[#1A2753]">Service sélectionné</p>
                  <p className="text-[#273A7A]/80">{selectedService.name}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-[#1A2753] mb-6">Partagez votre vision créative</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[#1A2753] mb-2 block">
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ex: Logo pour ma boutique en ligne"
                    className="w-full bg-[#F5F6FA] rounded-xl p-4 text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[#1A2753] mb-2 block">
                    Description détaillée du projet *
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Décrivez votre projet, vos objectifs, votre vision, le message que vous voulez transmettre..."
                    className="w-full bg-[#F5F6FA] rounded-xl p-4 text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors resize-none"
                    rows={6}
                  />
                </div>

                <div>
                  <label className="text-[#1A2753] mb-2 block">
                    Public cible *
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ex: Professionnels 25-40 ans, urbains"
                    className="w-full bg-[#F5F6FA] rounded-xl p-4 text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[#1A2753] mb-2 block">
                    Couleurs préférées (optionnel)
                  </label>
                  <input
                    type="text"
                    value={preferredColors}
                    onChange={(e) => setPreferredColors(e.target.value)}
                    placeholder="Ex: Bleu marine, doré, blanc"
                    className="w-full bg-[#F5F6FA] rounded-xl p-4 text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[#1A2753] mb-2 block">
                    Notes additionnelles (optionnel)
                  </label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Styles que vous aimez, références, ce qu'il faut éviter, délai spécifique..."
                    className="w-full bg-[#F5F6FA] rounded-xl p-4 text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors resize-none"
                    rows={4}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[#1A2753] mb-3 block">
                    Fichiers de référence (optionnel)
                  </label>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-[#F5F6FA] rounded-xl p-4">
                          <FileText className="w-6 h-6 text-[#D6A93A]" />
                          <div className="flex-1">
                            <p className="text-[#1A2753] text-sm">{file}</p>
                            <p className="text-[#273A7A]/80 text-xs">Document téléversé</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      ))}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleFileUpload(`reference_${uploadedFiles.length + 1}.jpg`)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full bg-[#D6A93A]/10 text-[#D6A93A] rounded-xl py-6 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#D6A93A]/30 hover:bg-[#D6A93A]/20 hover:border-[#D6A93A] transition-all"
                  >
                    <Upload className="w-8 h-8" />
                    <div>
                      <p>Cliquez pour téléverser vos fichiers</p>
                      <p className="text-sm text-[#273A7A]/80 mt-1">Images, PDF, documents (max 10MB)</p>
                    </div>
                  </motion.button>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setView('service-details')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-6 py-4 bg-white border-2 border-gray-300 text-[#1A2753] rounded-xl hover:bg-gray-50 transition-all"
                >
                  Retour
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleSubmitOrder}
                  disabled={!projectName || !projectDescription || !targetAudience}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Soumettre ma commande
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* View: Confirmation */}
        {view === 'confirmation' && selectedService && (
          <motion.div
            key="confirmation"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle className="w-16 h-16 text-green-600" />
            </motion.div>

            <h2 className="text-[#1A2753] mb-4">Commande envoyée avec succès !</h2>
            <p className="text-[#273A7A]/80 mb-8">
              Notre équipe créative va étudier votre projet et vous envoyer un devis personnalisé sous <strong>24-48 heures</strong>
            </p>

            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8 text-left">
              <p className="text-[#273A7A]/80 text-sm mb-4">Récapitulatif de votre commande</p>
              <div className="flex items-start gap-6">
                <selectedService.icon className="w-10 h-10 text-[#1A2753]" />
                <div className="flex-1">
                  <h3 className="text-[#1A2753] mb-2">{selectedService.name}</h3>
                  <p className="text-[#273A7A]/80 mb-4">{projectName}</p>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="bg-[#F5F6FA] rounded-lg p-3">
                      <p className="text-[#273A7A]/80 text-sm">
                        {uploadedFiles.length} fichier(s) de référence joint(s)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-blue-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Prochaines étapes
              </h3>
              <div className="space-y-2 text-left text-blue-800 text-sm">
                <p>1. Réception et analyse de votre brief par notre équipe</p>
                <p>2. Envoi d'un devis personnalisé sous 24-48h</p>
                <p>3. Validation du devis et démarrage du projet</p>
                <p>4. Livraison selon le délai convenu</p>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setView('projects')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl py-4 shadow-lg"
              >
                Voir mes projets
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setView('catalog');
                  setProjectName('');
                  setProjectDescription('');
                  setTargetAudience('');
                  setPreferredColors('');
                  setAdditionalNotes('');
                  setUploadedFiles([]);
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-white border-2 border-gray-300 text-[#1A2753] rounded-xl py-4 hover:bg-gray-50 transition-all"
              >
                Nouvelle commande
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
            {projetsAffiches.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 shadow-sm text-center">
                <div className="w-24 h-24 bg-[#F5F6FA] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-[#273A7A]/40" />
                </div>
                <h2 className="text-[#1A2753] mb-3">Aucun projet en cours</h2>
                <p className="text-[#273A7A]/80 mb-8">
                  Lancez votre premier projet de branding dès maintenant
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView('catalog')}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-8 py-4 bg-[#D6A93A] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Explorer les services
                </motion.button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projetsAffiches.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -5 }}
                    onClick={() => {
                      setSelectedProject(project);
                      setMessages(project.messages);
                      setView('project-details');
                    }}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <project.service.icon className="w-8 h-8 text-[#1A2753]" />
                      <div className="flex-1">
                        <h3 className="text-[#1A2753] mb-1">{project.clientBrief.projectName}</h3>
                        <p className="text-[#273A7A]/80 text-sm">{project.service.name}</p>
                      </div>
                    </div>

                    <span className={`inline-block px-3 py-1 text-xs rounded-full mb-4 bg-${getStatusColor(project.status)}-100 text-${getStatusColor(project.status)}-700`}>
                      {getStatusLabel(project.status)}
                    </span>

                    <div className="space-y-2 text-sm text-[#273A7A]/80">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {project.messages.length > 0 && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>{project.messages.length} message(s)</span>
                        </div>
                      )}
                      {project.deliverables.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>{project.deliverables.length} livrable(s)</span>
                        </div>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full mt-4 bg-[#F5F6FA] hover:bg-[#D6A93A] text-[#1A2753] hover:text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Voir les détails</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
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
            className="grid md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-2 space-y-6">
              {/* Project info */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-start gap-6 mb-6">
                  <selectedProject.service.icon className="w-10 h-10 text-[#1A2753]" />
                  <div className="flex-1">
                    <h2 className="text-[#1A2753] mb-2">{selectedProject.clientBrief.projectName}</h2>
                    <p className="text-[#273A7A]/80 mb-4">{selectedProject.service.name}</p>
                    <span className={`inline-block px-4 py-2 text-sm rounded-full bg-${getStatusColor(selectedProject.status)}-100 text-${getStatusColor(selectedProject.status)}-700`}>
                      {getStatusLabel(selectedProject.status)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-[#1A2753] mb-4">Brief du client</h3>
                  <div className="space-y-3 text-[#273A7A]/80">
                    <p><strong>Description:</strong> {selectedProject.clientBrief.description}</p>
                    <p><strong>Public cible:</strong> {selectedProject.clientBrief.targetAudience}</p>
                    {selectedProject.clientBrief.preferredColors && (
                      <p><strong>Couleurs préférées:</strong> {selectedProject.clientBrief.preferredColors}</p>
                    )}
                    {selectedProject.clientBrief.additionalNotes && (
                      <p><strong>Notes:</strong> {selectedProject.clientBrief.additionalNotes}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quote */}
              {selectedProject.quote && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#D6A93A]" />
                    Devis
                  </h3>
                  
                  <div className="bg-[#D6A93A]/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[#1A2753]">Montant total</span>
                      <span className="text-2xl text-[#D6A93A]">{formatPrice(selectedProject.quote.amount)}</span>
                    </div>
                    <p className="text-[#273A7A]/80 mb-4">{selectedProject.quote.description}</p>
                    <p className="text-[#273A7A]/80 text-sm">
                      Valide jusqu'au {new Date(selectedProject.quote.validUntil).toLocaleDateString('fr-FR')}
                    </p>

                    {selectedProject.quote.status === 'pending' && (
                      <div className="flex gap-3 mt-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-green-600 text-white rounded-xl py-3 hover:bg-green-700 transition-all"
                        >
                          Accepter le devis
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 bg-red-600 text-white rounded-xl py-3 hover:bg-red-700 transition-all"
                        >
                          Refuser
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Deliverables */}
              {selectedProject.deliverables.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[#1A2753] flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#D6A93A]" />
                      Livrables ({selectedProject.deliverables.length})
                    </h3>
                    <div className="text-sm text-[#273A7A]/80">
                      {getRemainingRevisions()} révision(s) restante(s)
                    </div>
                  </div>
                  
                  {/* Livrable groupé par nom (versions) */}
                  <div className="space-y-4">
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
                          <div key={baseName} className="border-2 border-gray-100 rounded-xl overflow-hidden">
                            {/* Dernière version */}
                            <div className="p-4">
                              <DeliverableCard
                                deliverable={latestVersion}
                                onReview={handleReviewDeliverable}
                                onDownloadFile={(fileId, fileName) => console.log('Download file:', fileId, fileName)}
                                onDownloadAll={(deliverable) => console.log('Download all:', deliverable)}
                                mode="desktop"
                              />
                            </div>

                            {/* Versions précédentes */}
                            {hasMultipleVersions && (
                              <details className="group border-t border-gray-100">
                                <summary className="px-4 py-3 cursor-pointer text-sm text-[#273A7A]/80 hover:bg-[#F5F6FA] transition-all flex items-center justify-between">
                                  <span>Versions précédentes ({versions.length - 1})</span>
                                  <svg 
                                    className="w-4 h-4 transition-transform group-open:rotate-180" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </summary>
                                
                                <div className="px-4 pb-4 space-y-3 bg-[#F5F6FA]/30">
                                  {versions.slice(1).map((version, index) => (
                                    <motion.div
                                      key={version.id}
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <DeliverableCard
                                        deliverable={version}
                                        onDownloadFile={(fileId, fileName) => console.log('Download file:', fileId, fileName)}
                                        onDownloadAll={(deliverable) => console.log('Download all:', deliverable)}
                                        mode="desktop"
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
            </div>

            {/* Messages sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
                <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#D6A93A]" />
                  Discussion
                </h3>
                
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.author === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-4 ${
                        message.author === 'client'
                          ? 'bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white'
                          : 'bg-[#F5F6FA] text-[#1A2753]'
                      }`}>
                        <p className={`text-xs mb-2 ${message.author === 'client' ? 'text-white/70' : 'text-[#273A7A]/80'}`}>
                          {message.authorName}
                        </p>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-2 ${message.author === 'client' ? 'text-white/70' : 'text-[#273A7A]/80'}`}>
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
                    className="flex-1 bg-[#F5F6FA] rounded-xl p-3 text-[#1A2753] text-sm outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  />
                  <motion.button aria-label="Envoyer le message"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-12 h-12 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl flex items-center justify-center disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deliverable Review Modal */}
      <DeliverableReviewModal
        show={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedDeliverable(null);
        }}
        deliverable={selectedDeliverable}
        onApprove={handleApproveDeliverable}
        onRequestRevision={handleRequestRevision}
        mode="desktop"
        revisionsRemaining={getRemainingRevisions()}
      />
    </div>
  );
};