import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, MessageSquare, CheckCircle, Upload, X, Download, Calendar, 
  Clock, FileText, Package, AlertCircle, DollarSign, User, Plus,
  ArrowLeft, Image as ImageIcon, File, Settings, Sparkles, Edit2, Trash2, Star
} from '../ui/icons';
import { 
  mockBrandingProjects,
  mockBrandingServices,
  formatPrice,
  getStatusLabel,
  getStatusColor,
  getDeliverableStatusLabel,
  getDeliverableStatusColor,
  type BrandingProject,
  type ProjectDeliverable,
  type BrandingService,
  type ServiceCategory,
  type ProjectStatus,
} from '../../data/brandingData';
import { DeliverableUploadModal } from './DeliverableUploadModal';
import { DeliverableVersionHistory } from './DeliverableVersionHistory';
import { QuickUploadZone } from './QuickUploadZone';
import { useConfirm } from '../ui/confirm-dialog';
import { useApp } from '../../context/AppContext';
import type { BrandingOrder } from '../../context/AppContext';
import { getStatutProjet } from '../../domain/brandingStatus';


export const AdminBranding: React.FC = () => {
  const confirm = useConfirm();
  const { brandingOrders, updateBrandingOrder, users, addNotification } = useApp();
  const [selectedProject, setSelectedProject] = useState<BrandingProject | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<ProjectDeliverable | null>(null);
  const [view, setView] = useState<'projects' | 'services'>('projects');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<BrandingService | null>(null);

  // Form state for new/edit service
  const [serviceForm, setServiceForm] = useState<Partial<BrandingService>>({
    category: 'identity',
    revisionsIncluded: 2,
  });

  /**
   * Commandes réellement passées par les clients, mises à la forme des projets.
   *
   * Cet écran ne connaissait que `mockBrandingProjects` : une commande passée
   * depuis l'espace client n'atteignait jamais l'administration.
   */
  const projetsClients: BrandingProject[] = brandingOrders.map(commande => {
    const service = mockBrandingServices.find(s => s.id === commande.serviceId) ?? mockBrandingServices[0];
    const client = users.find(u => u.id === commande.clientId);
    return {
      id: commande.id,
      service,
      status: getStatutProjet(commande.status),
      clientBrief: {
        projectName: commande.projectName,
        description: commande.description,
        targetAudience: commande.targetAudience,
        preferredColors: commande.preferredColors,
        additionalNotes: commande.additionalNotes,
      },
      clientName: client?.name,
      payment: { amount: commande.amount, status: 'pending' as const },
      deliverables: [],
      messages: [],
      createdAt: new Date(commande.createdAt),
      updatedAt: new Date(commande.createdAt),
    } as unknown as BrandingProject;
  });

  const tousLesProjets = [...projetsClients, ...mockBrandingProjects];

  const filteredProjects = filterStatus === 'all'
    ? tousLesProjets
    : tousLesProjets.filter(p => p.status === filterStatus);

  /** Une commande réelle est écrite dans le référentiel ; un exemple ne l'est pas. */
  const majProjet = (id: string, status: BrandingOrder['status']) => {
    if (brandingOrders.some(c => c.id === id)) updateBrandingOrder(id, { status });
  };

  // Gérer l'upload de livrable
  const handleUploadComplete = (deliverableName: string, description: string, files: File[]) => {
    // Ici vous intégreriez avec votre backend
    // Pour la démo, on simule juste la fermeture
    setShowUploadModal(false);
  };

  // Gérer la vue d'une version de livrable
  const handleViewVersion = (deliverable: ProjectDeliverable) => {
    setSelectedDeliverable(deliverable);
  };

  // Vérifier si le projet peut recevoir un upload
  const canUpload = (project: BrandingProject | null) => {
    return project && ['in-progress', 'in-review'].includes(project.status);
  };

  // Gérer l'ajout/modification d'un service
  const handleAddEditService = () => {
    // Ici vous intégreriez avec votre backend
    setShowServiceModal(false);
    setServiceForm({ category: 'identity', revisionsIncluded: 2 });
  };

  const getCategoryLabel = (category: ServiceCategory) => {
    const labels: Record<ServiceCategory, string> = {
      'identity': 'Identité de marque',
      'social-media': 'Réseaux Sociaux',
      'print': 'Support print',
      'content-video': 'Contenu et vidéo',
      'web': 'Web',
      'administrative-services': 'Services administratifs'
    };
    return labels[category];
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#1A2753]">
            {view === 'projects' ? 'Projets Branding & Communication' : 'Gestion des Services'}
          </h2>
          <p className="text-[#273A7A]/80">
            {view === 'projects' 
              ? `${tousLesProjets.length} projet(s) actif(s)` 
              : `${mockBrandingServices.length} service(s) disponible(s)`
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Tabs */}
          <div className="flex gap-2 mr-4">
            <button
              onClick={() => setView('projects')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 rounded-xl transition-all duration-300 ${
                view === 'projects'
                  ? 'bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white shadow-lg'
                  : 'bg-white text-[#1A2753] hover:bg-gray-50'
              }`}
            >
              Projets
            </button>
            <button
              onClick={() => setView('services')}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                view === 'services'
                  ? 'bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white shadow-lg'
                  : 'bg-white text-[#1A2753] hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Services
            </button>
          </div>

          {view === 'services' ? (
            <button
              onClick={() => {
                setEditingService(null);
                setServiceForm({ category: 'identity', revisionsIncluded: 2 });
                setShowServiceModal(true);
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau service
            </button>
          ) : (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl outline-none focus:border-[#D6A93A] transition-colors"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="payment-pending">En attente de paiement</option>
              <option value="in-progress">En cours</option>
              <option value="in-review">En révision</option>
              <option value="delivered">Livré</option>
              <option value="cancelled">Annulé</option>
            </select>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {view === 'projects' && (
        <>
          <div className="grid grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-start justify-between mb-4">
                  <project.service.icon className="w-8 h-8 text-[#1A2753]" />
                  <span className={`px-3 py-1 text-xs rounded-full bg-${getStatusColor(project.status)}-100 text-${getStatusColor(project.status)}-700`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                <h3 className="text-[#1A2753] mb-1">{project.clientBrief.projectName}</h3>
                <p className="text-[#273A7A]/80 text-sm mb-4">{project.service.name}</p>

                <div className="space-y-2 text-xs text-[#273A7A]/80">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {project.quote && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3" />
                      <span>{formatPrice(project.quote.amount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(project);
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-2 bg-[#F5F6FA] hover:bg-[#D6A93A]/10 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-[#1A2753]"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
                  </button>
                  <button aria-label="Envoyer un message" 
                    onClick={(e) => e.stopPropagation()}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all duration-300"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 text-[#273A7A]/20 mx-auto mb-4" />
              <p className="text-[#273A7A]/80">Aucun projet avec ce statut</p>
            </div>
          )}
        </>
      )}

      {/* Services Grid */}
      {view === 'services' && (
        <>
          <div className="grid grid-cols-3 gap-6">
            {mockBrandingServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <service.icon className="w-8 h-8 text-[#1A2753]" />
                </div>

                <h3 className="text-[#1A2753] mb-1">{service.name}</h3>
                <p className="text-[#273A7A]/80 text-sm mb-4">{getCategoryLabel(service.category)}</p>

                <div className="space-y-2 text-xs text-[#273A7A]/80 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3" />
                    <span>{formatPrice(service.priceRange.min)} - {formatPrice(service.priceRange.max)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>{service.timeline}</span>
                  </div>
                  {service.popular && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#D6A93A]/10 text-[#D6A93A] rounded-full text-xs">
                      <Star className="w-3 h-3" aria-hidden="true" />
                      Populaire
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // View service details
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-4 py-2 bg-[#F5F6FA] hover:bg-[#D6A93A]/10 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-[#1A2753]"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
                  </button>
                  <button aria-label="Modifier le service"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingService(service);
                      setServiceForm({ 
                        ...service,
                        priceRange: service.priceRange
                      });
                      setShowServiceModal(true);
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all duration-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button aria-label="Supprimer le service"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (
                        await confirm({
                          title: `Voulez-vous vraiment supprimer le service "${service.name}" ?`,
                          confirmLabel: 'Supprimer',
                          variant: 'destructive',
                        })
                      ) {
                        // Ici vous intégreriez avec votre backend
                      }
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {mockBrandingServices.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 text-[#273A7A]/20 mx-auto mb-4" />
              <p className="text-[#273A7A]/80">Aucun service disponible</p>
            </div>
          )}
        </>
      )}

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <selectedProject.service.icon className="w-10 h-10 text-[#1A2753]" />
                  <div>
                    <h2 className="text-[#1A2753] mb-2">{selectedProject.clientBrief.projectName}</h2>
                    <p className="text-[#273A7A]/80 mb-3">{selectedProject.service.name}</p>
                    <span className={`inline-block px-4 py-2 text-sm rounded-full bg-${getStatusColor(selectedProject.status)}-100 text-${getStatusColor(selectedProject.status)}-700`}>
                      {getStatusLabel(selectedProject.status)}
                    </span>
                  </div>
                </div>
                <button aria-label="Fermer"
                  onClick={() => setSelectedProject(null)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Client Brief */}
                <div>
                  <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#D6A93A]" />
                    Brief du client
                  </h3>
                  <div className="bg-[#F5F6FA] rounded-xl p-6 space-y-3 text-sm">
                    <div>
                      <span className="text-[#273A7A]/80">Description:</span>
                      <p className="text-[#1A2753] mt-1">{selectedProject.clientBrief.description}</p>
                    </div>
                    <div>
                      <span className="text-[#273A7A]/80">Public cible:</span>
                      <p className="text-[#1A2753] mt-1">{selectedProject.clientBrief.targetAudience}</p>
                    </div>
                    {selectedProject.clientBrief.preferredColors && (
                      <div>
                        <span className="text-[#273A7A]/80">Couleurs préférées:</span>
                        <p className="text-[#1A2753] mt-1">{selectedProject.clientBrief.preferredColors}</p>
                      </div>
                    )}
                    {selectedProject.clientBrief.additionalNotes && (
                      <div>
                        <span className="text-[#273A7A]/80">Notes additionnelles:</span>
                        <p className="text-[#1A2753] mt-1">{selectedProject.clientBrief.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Avancement d'une commande client.
                    L'écran ne proposait aucune action sur les commandes réelles :
                    l'administration ne pouvait ni les prendre en charge, ni les
                    livrer. Les projets d'exemple, eux, restent en lecture. */}
                {brandingOrders.some(c => c.id === selectedProject.id) && (() => {
                  const commande = brandingOrders.find(c => c.id === selectedProject.id)!;
                  const suite: Record<BrandingOrder['status'], { etat: BrandingOrder['status']; libelle: string } | null> = {
                    submitted: { etat: 'in_progress', libelle: 'Prendre en charge' },
                    quote_sent: { etat: 'in_progress', libelle: 'Prendre en charge' },
                    in_progress: { etat: 'delivered', libelle: 'Marquer comme livré' },
                    delivered: { etat: 'completed', libelle: 'Clôturer le projet' },
                    completed: null,
                  };
                  const prochaine = suite[commande.status];
                  return (
                    <div>
                      <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-[#D6A93A]" />
                        Avancement
                      </h3>
                      <div className="bg-[#F5F6FA] rounded-xl p-6 flex items-center justify-between gap-4">
                        <p className="text-sm text-[#273A7A]/80">
                          {commande.status === 'completed'
                            ? 'Projet clôturé.'
                            : 'Faites avancer le projet ; le client en est averti.'}
                        </p>
                        {prochaine && (
                          <button
                            onClick={() => {
                              majProjet(commande.id, prochaine.etat);
                              addNotification({
                                userId: commande.clientId || '1',
                                title: 'Projet branding',
                                message: `${commande.projectName} : ${prochaine.libelle.toLowerCase()}.`,
                                type: 'info',
                                read: false,
                              });
                              setSelectedProject(null);
                            }}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-gradient-to-r from-[#D6A93A] to-[#b8902f] text-white rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
                          >
                            {prochaine.libelle}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Quote Section */}
                {selectedProject.quote && (
                  <div>
                    <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#D6A93A]" />
                      Devis
                    </h3>
                    <div className="bg-[#D6A93A]/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[#1A2753]">Montant proposé</span>
                        <span className="text-2xl text-[#D6A93A]">{formatPrice(selectedProject.quote.amount)}</span>
                      </div>
                      <p className="text-[#273A7A]/80 mb-3">{selectedProject.quote.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#273A7A]/80">
                          Valide jusqu'au {new Date(selectedProject.quote.validUntil).toLocaleDateString('fr-FR')}
                        </span>
                        <span className={`px-3 py-1 rounded-full ${
                          selectedProject.quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          selectedProject.quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {selectedProject.quote.status === 'accepted' ? 'Accepté' :
                           selectedProject.quote.status === 'rejected' ? 'Refusé' :
                           'En attente'}
                        </span>
                      </div>

                      {selectedProject.quote.status === 'pending' && (
                        <div className="flex gap-3 mt-4">
                          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 bg-white text-[#1A2753] rounded-lg py-2 hover:bg-gray-50 transition-all">
                            Modifier le devis
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div>
                  <h3 className="text-[#1A2753] mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#D6A93A]" />
                    Discussion ({selectedProject.messages.length})
                  </h3>
                  <div className="bg-[#F5F6FA] rounded-xl p-6 max-h-64 overflow-y-auto space-y-3">
                    {selectedProject.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.author === 'client' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[80%] rounded-xl p-4 ${
                          message.author === 'client'
                            ? 'bg-white text-[#1A2753]'
                            : 'bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white'
                        }`}>
                          <p className="text-xs mb-1 opacity-70">{message.authorName}</p>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-50">
                            {new Date(message.timestamp).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      placeholder="Répondre au client..."
                      className="flex-1 bg-[#F5F6FA] rounded-xl p-3 text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                    />
                    <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all">
                      Envoyer
                    </button>
                  </div>
                </div>

                {/* Deliverables avec historique de versions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#1A2753] flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#D6A93A]" />
                      Livrables ({selectedProject.deliverables.length})
                    </h3>
                    {canUpload(selectedProject) && (
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-4 py-2 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Uploader un livrable
                      </button>
                    )}
                  </div>
                  
                  {selectedProject.deliverables.length > 0 ? (
                    <DeliverableVersionHistory 
                      deliverables={selectedProject.deliverables}
                      onViewVersion={handleViewVersion}
                    />
                  ) : (
                    <div className="bg-[#F5F6FA] rounded-xl p-12 text-center">
                      <Package className="w-16 h-16 text-[#273A7A]/20 mx-auto mb-4" />
                      <p className="text-[#273A7A]/80 mb-1">Aucun livrable pour le moment</p>
                      <p className="text-[#273A7A]/80 text-sm mb-6">
                        Uploadez les premiers livrables pour ce projet
                      </p>
                      {canUpload(selectedProject) && (
                        <button 
                          onClick={() => setShowUploadModal(true)}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-6 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2"
                        >
                          <Upload className="w-5 h-5" />
                          Téléverser un fichier
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                    Marquer en cours
                  </button>
                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all">
                    Marquer comme livré
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deliverable Detail Modal */}
      <AnimatePresence>
        {selectedDeliverable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={() => setSelectedDeliverable(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <button aria-label="Retour"
                      onClick={() => setSelectedDeliverable(null)}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all"
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <h2 className="text-[#1A2753]">{selectedDeliverable.name}</h2>
                  </div>
                  <div className="flex items-center gap-2 ml-11">
                    <span className="px-3 py-1 text-xs rounded-full bg-[#D6A93A] text-white">
                      Version {selectedDeliverable.version}
                    </span>
                    <span className={`px-3 py-1 text-xs rounded-full bg-${getDeliverableStatusColor(selectedDeliverable.status)}-100 text-${getDeliverableStatusColor(selectedDeliverable.status)}-700`}>
                      {getDeliverableStatusLabel(selectedDeliverable.status)}
                    </span>
                  </div>
                </div>
                <button aria-label="Fermer"
                  onClick={() => setSelectedDeliverable(null)}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Description */}
                {selectedDeliverable.description && (
                  <div>
                    <label className="text-[#273A7A]/80 text-sm">Description</label>
                    <p className="text-[#1A2753] mt-1">{selectedDeliverable.description}</p>
                  </div>
                )}

                {/* Métadonnées */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#273A7A]/80 text-sm">Uploadé par</label>
                    <p className="text-[#1A2753] mt-1 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedDeliverable.uploadedBy}
                    </p>
                  </div>
                  <div>
                    <label className="text-[#273A7A]/80 text-sm">Date d'upload</label>
                    <p className="text-[#1A2753] mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(selectedDeliverable.uploadedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Feedback du client */}
                {selectedDeliverable.feedback && (
                  <div className={`p-4 rounded-xl border-2 ${
                    selectedDeliverable.feedback.approved 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {selectedDeliverable.feedback.approved ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm mb-1 ${
                          selectedDeliverable.feedback.approved ? 'text-green-700' : 'text-orange-700'
                        }`}>
                          {selectedDeliverable.feedback.approved ? 'Livrable approuvé par le client' : 'Révision demandée par le client'}
                        </p>
                        {(selectedDeliverable.feedback.comment || selectedDeliverable.feedback.revisionNotes) && (
                          <p className="text-[#273A7A] text-sm mt-2">
                            {selectedDeliverable.feedback.comment || selectedDeliverable.feedback.revisionNotes}
                          </p>
                        )}
                        <p className="text-xs text-[#273A7A]/80 mt-2">
                          {new Date(selectedDeliverable.feedback.timestamp).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fichiers */}
                <div>
                  <h3 className="text-[#1A2753] mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#D6A93A]" />
                    Fichiers ({selectedDeliverable.files.length})
                  </h3>
                  <div className="grid gap-3">
                    {selectedDeliverable.files.map((file) => {
                      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(
                        file.type.toLowerCase()
                      );
                      
                      return (
                        <div
                          key={file.id}
                          className="bg-[#F5F6FA] rounded-xl p-4 flex items-center gap-4 hover:bg-gray-100 transition-all"
                        >
                          <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                            {isImage ? (
                              <ImageIcon className="w-6 h-6 text-[#D6A93A]" />
                            ) : (
                              <File className="w-6 h-6 text-[#D6A93A]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#1A2753] truncate">{file.name}</p>
                            <p className="text-[#273A7A]/80 text-sm">{file.size}</p>
                          </div>
                          <button aria-label="Télécharger le fichier" 
                            onClick={() => {
                              // Download file handler
                            }}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-[#D6A93A]/10 rounded-lg flex items-center justify-center hover:bg-[#D6A93A]/20 transition-all flex-shrink-0"
                          >
                            <Download className="w-5 h-5 text-[#D6A93A]" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedDeliverable(null)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gray-100 text-[#1A2753] rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Fermer
                  </button>
                  <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Tout télécharger
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      {selectedProject && (
        <DeliverableUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          project={selectedProject}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Quick Upload Zone (drag & drop global) */}
      <QuickUploadZone
        isVisible={!!selectedProject && canUpload(selectedProject)}
        onUpload={() => setShowUploadModal(true)}
      />

      {/* Floating Upload Button */}
      <AnimatePresence>
        {selectedProject && canUpload(selectedProject) && !showUploadModal && (
          <motion.button aria-label="Ajouter un livrable"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUploadModal(true)}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-full shadow-2xl flex items-center justify-center z-30 hover:shadow-3xl transition-all"
          >
            <Plus className="w-8 h-8" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Add/Edit Service Modal */}
      <AnimatePresence>
        {showServiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={() => setShowServiceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    editingService 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-br from-[#D6A93A] to-[#D6A93A]/80'
                  }`}>
                    {editingService ? <Edit2 className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-[#1A2753]">
                      {editingService ? 'Modifier le service' : 'Nouveau Service'}
                    </h2>
                    <p className="text-[#273A7A]/80 text-sm">
                      {editingService ? 'Modifiez les informations du service' : 'Ajoutez un nouveau service de branding'}
                    </p>
                  </div>
                </div>
                <button aria-label="Fermer"
                  onClick={() => {
                    setShowServiceModal(false);
                    setEditingService(null);
                    setServiceForm({ category: 'identity', revisionsIncluded: 2 });
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Catégorie */}
                <div>
                  <label className="block text-[#1A2753] mb-2">Catégorie *</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value as ServiceCategory })}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  >
                    <option value="identity">Identité de marque</option>
                    <option value="social-media">Réseaux Sociaux</option>
                    <option value="print">Support print</option>
                    <option value="content-video">Contenu et vidéo</option>
                    <option value="web">Web</option>
                    <option value="administrative-services">Services administratifs</option>
                  </select>
                </div>

                {/* Nom du service */}
                <div>
                  <label className="block text-[#1A2753] mb-2">Nom du service *</label>
                  <input
                    type="text"
                    value={serviceForm.name || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    placeholder="Ex: Logo professionnel"
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  />
                </div>

                {/* Icon emoji */}
                <div>
                  <label className="block text-[#1A2753] mb-2">Icône (emoji) *</label>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[#1A2753] mb-2">Description *</label>
                  <textarea
                    value={serviceForm.description || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    placeholder="Description du service"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors resize-none"
                  />
                </div>

                {/* Prix */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#1A2753] mb-2">Prix minimum (FCFA) *</label>
                    <input
                      type="number"
                      value={serviceForm.priceRange?.min || ''}
                      onChange={(e) => setServiceForm({ 
                        ...serviceForm, 
                        priceRange: { ...serviceForm.priceRange!, min: parseInt(e.target.value) || 0 } 
                      })}
                      placeholder="Ex: 50000"
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#1A2753] mb-2">Prix maximum (FCFA) *</label>
                    <input
                      type="number"
                      value={serviceForm.priceRange?.max || ''}
                      onChange={(e) => setServiceForm({ 
                        ...serviceForm, 
                        priceRange: { ...serviceForm.priceRange!, max: parseInt(e.target.value) || 0 } 
                      })}
                      placeholder="Ex: 150000"
                      className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-[#1A2753] mb-2">Délai de réalisation *</label>
                  <input
                    type="text"
                    value={serviceForm.timeline || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, timeline: e.target.value })}
                    placeholder="Ex: 5-7 jours ouvrés"
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  />
                </div>

                {/* Révisions incluses */}
                <div>
                  <label className="block text-[#1A2753] mb-2">Nombre de révisions incluses *</label>
                  <input
                    type="number"
                    value={serviceForm.revisionsIncluded || 2}
                    onChange={(e) => setServiceForm({ ...serviceForm, revisionsIncluded: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-[#1A2753] outline-none border-2 border-transparent focus:border-[#D6A93A] transition-colors"
                  />
                </div>

                {/* Service populaire */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={serviceForm.popular || false}
                    onChange={(e) => setServiceForm({ ...serviceForm, popular: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-[#D6A93A] focus:ring-[#D6A93A]"
                  />
                  <label htmlFor="popular" className="text-[#1A2753] cursor-pointer">
                    Marquer comme service populaire
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowServiceModal(false);
                      setEditingService(null);
                      setServiceForm({ category: 'identity', revisionsIncluded: 2 });
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 bg-gray-100 text-[#1A2753] rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddEditService}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] flex-1 px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                      editingService
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-r from-[#D6A93A] to-[#D6A93A]/80 text-white'
                    }`}
                  >
                    {editingService ? (
                      <>
                        <Edit2 className="w-5 h-5" />
                        Enregistrer les modifications
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Créer le service
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};