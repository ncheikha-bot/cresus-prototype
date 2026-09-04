import {
  Sparkles,
  BarChart3,
  BookmarkSimple,
  Briefcase,
  Building2,
  ClipboardList,
  Crown,
  FilmSlate,
  Laptop,
  Megaphone,
  Microphone,
  Palette,
  Phone,
  Printer,
  Rocket,
  ShoppingCart,
  Smartphone,
  Target,
  TrendingUp,
  Video,
  Wrench,
} from '../components/ui/icons';
import type { IconeCresus } from '../components/ui/icons';
export type ServiceCategory = 'identity' | 'social-media' | 'print' | 'content-video' | 'web' | 'administrative-services';
export type ProjectStatus = 'draft' | 'payment-pending' | 'in-progress' | 'in-review' | 'delivered' | 'cancelled';
export type DeliverableStatus = 'pending-review' | 'approved' | 'revision-requested';
export type MessageType = 'text' | 'delivery' | 'approval' | 'revision-request' | 'system';

// Descriptions et métadonnées des familles de services
export interface BrandingFamily {
  id: ServiceCategory;
  name: string;
  description: string;
  icon: IconeCresus;
}

export const BRANDING_FAMILIES: BrandingFamily[] = [
  {
    id: 'identity',
    name: 'Identité de marque',
    description: 'Tout ce qui construit l\'ADN visuel de l\'entreprise',
    icon: Palette,
  },
  {
    id: 'social-media',
    name: 'Réseaux Sociaux',
    description: 'Tout ce qui sert à publier, animer et convertir sur les plateformes sociales',
    icon: Smartphone,
  },
  {
    id: 'print',
    name: 'Support print',
    description: 'Tout ce qui est imprimé / usage terrain / corporate',
    icon: Printer,
  },
  {
    id: 'content-video',
    name: 'Contenu et vidéo',
    description: 'Tout ce qui produit des contenus média (vidéo, motion, voix-off)',
    icon: FilmSlate,
  },
  {
    id: 'web',
    name: 'Web',
    description: 'Tout ce qui concerne la présence digitale (sites / applications)',
    icon: Laptop,
  },
  {
    id: 'administrative-services',
    name: 'Services administratifs',
    description: 'Tout ce qui concerne la gestion administrative de votre entreprise',
    icon: ClipboardList,
  },
];

// Smart Packs
export interface BrandingPack {
  id: string;
  name: string;
  tagline: string;
  description: string;
  services: string[]; // service IDs included
  price: number;
  popular?: boolean;
  icon: IconeCresus;
  color: string;
}

export const BRANDING_PACKS: BrandingPack[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Une identité propre en quelques jours.',
    description: 'L\'essentiel pour démarrer avec une image professionnelle. Idéal pour les entrepreneurs qui lancent leur activité.',
    services: ['logo-design', 'business-cards', 'company-stamp'],
    price: 150000,
    icon: Rocket,
    color: '#273A7A',
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Une image cohérente et une présence crédible.',
    description: 'Pour les entreprises qui veulent asseoir leur crédibilité avec une identité complète et une présence en ligne.',
    services: ['brand-identity', 'business-cards', 'company-stamp', 'social-media-pack', 'print-pack'],
    price: 500000,
    popular: true,
    icon: Briefcase,
    color: '#D6A93A',
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Une marque forte pour convertir et grandir.',
    description: 'La solution complète pour les entreprises ambitieuses : identité, présence digitale, contenu vidéo et supports de communication.',
    services: ['brand-identity', 'business-cards', 'company-stamp', 'social-media-pack', 'print-pack', 'website-vitrine', 'video-promo', 'communication-support-pack'],
    price: 1500000,
    icon: Crown,
    color: '#1A2753',
  },
];

export interface BrandingService {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  icon: IconeCresus;
  features: string[];
  deliverables: string[];
  timeline: string;
  priceRange: {
    min: number;
    max: number;
  };
  price?: number; // Prix forfaitaire si fixe
  revisionsIncluded: number; // Nombre de révisions incluses
  popular?: boolean;
}

export interface DeliverableFile {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface DeliverableFeedback {
  approved: boolean;
  comment?: string;
  revisionNotes?: string;
  timestamp: Date;
}

export interface ProjectDeliverable {
  id: string;
  name: string;
  description: string;
  version: number;
  files: DeliverableFile[];
  status: DeliverableStatus;
  uploadedAt: Date;
  uploadedBy: string;
  feedback?: DeliverableFeedback;
}

export interface ProjectMessage {
  id: string;
  type: MessageType;
  author: 'client' | 'team';
  authorName: string;
  content: string;
  timestamp: Date;
  attachments?: string[];
  deliverableId?: string; // Lien vers un livrable si applicable
  metadata?: Record<string, any>; // Métadonnées additionnelles
}

export interface BrandingProject {
  id: string;
  service: BrandingService;
  status: ProjectStatus;
  clientBrief: {
    projectName: string;
    description: string;
    targetAudience: string;
    preferredColors?: string;
    references?: string[];
    additionalNotes?: string;
  };
  payment: {
    amount: number;
    status: 'pending' | 'completed' | 'refunded';
    paidAt?: Date;
    method?: string;
  };
  quote?: {
    amount: number;
    description: string;
    status: 'pending' | 'accepted' | 'rejected';
    validUntil: Date;
  };
  appointment?: {
    date: Date;
    time: string;
    type: 'online' | 'physical';
    participant: string;
    meetingLink?: string;
  };
  messages: ProjectMessage[];
  deliverables: ProjectDeliverable[];
  revisionsUsed: number; // Nombre de révisions déjà utilisées
  createdAt: Date;
  updatedAt: Date;
}

export const mockBrandingServices: BrandingService[] = [
  {
    id: 'logo-design',
    category: 'identity',
    name: 'Création de logo',
    description: 'Logo professionnel unique avec plusieurs propositions',
    icon: Palette,
    features: [
      '3 propositions de concepts différents',
      '2 révisions incluses',
      'Fichiers vectoriels (AI, SVG, EPS)',
      'Versions couleur et noir & blanc',
      'Guide d\'utilisation',
    ],
    deliverables: ['Logo vectoriel', 'Déclinaisons PNG/JPG', 'Guide d\'utilisation'],
    timeline: '5-7 jours ouvrés',
    priceRange: { min: 75000, max: 250000 },
    revisionsIncluded: 2,
    popular: true,
  },
  {
    id: 'brand-identity',
    category: 'identity',
    name: 'Identité visuelle complète',
    description: 'Charte graphique complète pour votre entreprise',
    icon: Target,
    features: [
      'Logo principal + déclinaisons',
      'Palette de couleurs',
      'Typographies',
      'Guide de style complet (20-30 pages)',
      'Templates : carte de visite, en-tête, footer email',
      'Mockups de présentation',
    ],
    deliverables: ['Charte graphique PDF', 'Fichiers sources', 'Templates éditables'],
    timeline: '10-15 jours ouvrés',
    priceRange: { min: 300000, max: 750000 },
    revisionsIncluded: 3,
    popular: true,
  },
  {
    id: 'website-vitrine',
    category: 'web',
    name: 'Site web vitrine',
    description: 'Site web moderne et responsive pour présenter votre activité',
    icon: Laptop,
    features: [
      'Design sur mesure (5-7 pages)',
      'Responsive (mobile, tablette, desktop)',
      'Optimisé SEO',
      'Formulaire de contact',
      'Hébergement 1 an inclus',
      'Formation à la gestion',
    ],
    deliverables: ['Site web en ligne', 'Accès admin', 'Documentation'],
    timeline: '3-4 semaines',
    priceRange: { min: 400000, max: 1200000 },
    revisionsIncluded: 2,
  },
  {
    id: 'website-ecommerce',
    category: 'web',
    name: 'Site e-commerce',
    description: 'Boutique en ligne complète avec paiement intégré',
    icon: ShoppingCart,
    features: [
      'Catalogue produits illimité',
      'Panier et checkout sécurisé',
      'Paiement mobile (Orange Money, Wave)',
      'Gestion des stocks',
      'Tableau de bord administrateur',
      'Hébergement 1 an inclus',
      'Formation complète',
    ],
    deliverables: ['Boutique en ligne', 'Panel admin', 'Documentation technique'],
    timeline: '5-8 semaines',
    priceRange: { min: 1500000, max: 4000000 },
    revisionsIncluded: 3,
    popular: true,
  },
  {
    id: 'mobile-app-android',
    category: 'web',
    name: 'Application Android',
    description: 'Application mobile native pour Android',
    icon: Smartphone,
    features: [
      'Design UI/UX moderne',
      'Développement natif Android',
      'Jusqu\'à 10 écrans',
      'Intégration API',
      'Publication sur Google Play',
      'Support technique 3 mois',
    ],
    deliverables: ['Application Android', 'Code source', 'Documentation'],
    timeline: '6-10 semaines',
    priceRange: { min: 2000000, max: 5000000 },
    revisionsIncluded: 2,
  },
  {
    id: 'mobile-app-cross',
    category: 'web',
    name: 'Application iOS & Android',
    description: 'Application cross-platform pour iOS et Android',
    icon: Smartphone,
    features: [
      'Design UI/UX premium',
      'Développement React Native',
      'Jusqu\'à 15 écrans',
      'Backend avec API',
      'Publication iOS + Android',
      'Support technique 6 mois',
    ],
    deliverables: ['Apps iOS & Android', 'Code source', 'Backend', 'Documentation'],
    timeline: '8-12 semaines',
    priceRange: { min: 3500000, max: 8000000 },
    revisionsIncluded: 3,
    popular: true,
  },
  {
    id: 'social-media-pack',
    category: 'social-media',
    name: 'Pack réseaux sociaux',
    description: 'Kit complet pour vos communications digitales',
    icon: Megaphone,
    features: [
      '20 visuels pour posts (Instagram, Facebook, LinkedIn)',
      'Templates stories',
      'Bannières profils réseaux sociaux',
      'Calendrier éditorial 1 mois',
      'Formats adaptés à chaque plateforme',
    ],
    deliverables: ['Visuels PNG/JPG', 'Templates PSD/Canva', 'Calendrier'],
    timeline: '7-10 jours ouvrés',
    priceRange: { min: 150000, max: 400000 },
    revisionsIncluded: 2,
  },
  {
    id: 'print-pack',
    category: 'print',
    name: 'Pack print & communication',
    description: 'Supports print professionnels pour votre communication',
    icon: Printer,
    features: [
      'Cartes de visite (recto-verso)',
      'Flyers A5 (2 modèles)',
      'Brochure A4 (8 pages)',
      'Roll-up / kakémono',
      'Fichiers prêts à imprimer (PDF haute résolution)',
    ],
    deliverables: ['Fichiers print-ready', 'Sources éditables', 'Guide impression'],
    timeline: '7-10 jours ouvrés',
    priceRange: { min: 200000, max: 500000 },
    revisionsIncluded: 2,
  },
  {
    id: 'video-promo',
    category: 'content-video',
    name: 'Vidéo promotionnelle',
    description: 'Vidéo animée professionnelle pour présenter votre activité',
    icon: FilmSlate,
    features: [
      'Vidéo motion design 30-60 secondes',
      'Scénario et storyboard inclus',
      'Animation 2D professionnelle',
      'Voix-off en français (facultatif)',
      'Musique libre de droits',
      '2 révisions incluses',
    ],
    deliverables: ['Vidéo HD (MP4)', 'Version carrée réseaux sociaux', 'Fichiers sources'],
    timeline: '2-3 semaines',
    priceRange: { min: 300000, max: 800000 },
    revisionsIncluded: 2,
    popular: true,
  },
  {
    id: 'presentation-deck',
    category: 'content-video',
    name: 'Présentation PowerPoint/Keynote',
    description: 'Présentation professionnelle pour vos pitchs et réunions',
    icon: BarChart3,
    features: [
      'Design sur mesure (15-25 slides)',
      'Templates réutilisables',
      'Infographies et graphiques',
      'Animation fluide',
      'Format PowerPoint + PDF',
    ],
    deliverables: ['Présentation PPTX/KEY', 'PDF', 'Guide d\'utilisation'],
    timeline: '5-7 jours ouvrés',
    priceRange: { min: 100000, max: 300000 },
    revisionsIncluded: 2,
  },
  {
    id: 'reels-pack',
    category: 'content-video',
    name: 'Pack Reels / vidéos courtes',
    description: 'Pack de 3 vidéos courtes optimisées pour Instagram Reels, TikTok et Shorts',
    icon: Video,
    features: [
      '3 vidéos courtes (15-30 secondes chacune)',
      'Montage dynamique et tendance',
      'Sous-titres animés inclus',
      'Musique tendance libre de droits',
      'Formats optimisés (9:16, 1:1)',
      'Livraison prête à publier',
    ],
    deliverables: ['3 vidéos MP4 HD', 'Versions avec/sans sous-titres', 'Miniatures'],
    timeline: '5-7 jours ouvrés',
    priceRange: { min: 150000, max: 350000 },
    revisionsIncluded: 2,
    popular: true,
  },
  {
    id: 'motion-design',
    category: 'content-video',
    name: 'Motion design (animé)',
    description: 'Animation graphique professionnelle pour vos contenus visuels',
    icon: Sparkles,
    features: [
      'Animation 2D sur mesure (30-90 secondes)',
      'Storyboard et direction artistique',
      'Transitions fluides et effets visuels',
      'Export multi-formats (web, réseaux sociaux, présentation)',
      'Musique et sound design',
      'Fichiers sources After Effects',
    ],
    deliverables: ['Vidéo animée HD', 'GIF animé', 'Fichiers sources AE'],
    timeline: '2-3 semaines',
    priceRange: { min: 250000, max: 700000 },
    revisionsIncluded: 2,
  },
  {
    id: 'script-voiceover',
    category: 'content-video',
    name: 'Script + voix-off',
    description: 'Rédaction de script professionnel avec enregistrement voix-off studio',
    icon: Microphone,
    features: [
      'Script professionnel sur mesure',
      'Enregistrement voix-off studio (français / wolof)',
      'Direction artistique vocale',
      'Mixage et mastering audio',
      'Livraison multi-formats (WAV, MP3)',
      'Possibilité de plusieurs langues',
    ],
    deliverables: ['Script écrit', 'Fichier audio WAV/MP3', 'Versions courtes'],
    timeline: '5-7 jours ouvrés',
    priceRange: { min: 75000, max: 200000 },
    revisionsIncluded: 1,
  },
  {
    id: 'website-maintenance',
    category: 'web',
    name: 'Maintenance / mise à jour site',
    description: 'Service de maintenance et mises à jour régulières de votre site web',
    icon: Wrench,
    features: [
      'Mises à jour de sécurité mensuelles',
      'Sauvegarde automatique hebdomadaire',
      'Corrections de bugs',
      'Ajout de contenu (jusqu\'à 5 pages/mois)',
      'Monitoring de performance',
      'Support technique par email/téléphone',
    ],
    deliverables: ['Rapport mensuel', 'Accès dashboard monitoring', 'Support prioritaire'],
    timeline: 'Abonnement mensuel',
    priceRange: { min: 50000, max: 150000 },
    revisionsIncluded: 0,
  },
  {
    id: 'business-cards',
    category: 'print',
    name: 'Cartes de visite',
    description: 'Cartes de visite professionnelles pour votre entreprise',
    icon: Briefcase,
    features: [
      'Design recto-verso personnalisé',
      'Plusieurs propositions de mise en page',
      'Format standard (85x55mm)',
      'Fichiers prêts pour impression',
      'Version digitale incluse',
      '2 révisions incluses',
    ],
    deliverables: ['Fichiers PDF print-ready', 'Version digitale PNG', 'Sources éditables'],
    timeline: '3-5 jours ouvrés',
    priceRange: { min: 25000, max: 75000 },
    revisionsIncluded: 2,
    popular: true,
  },
  {
    id: 'company-stamp',
    category: 'print',
    name: 'Cachet d\'entreprise',
    description: 'Design de cachet officiel pour votre entreprise',
    icon: BookmarkSimple,
    features: [
      'Design professionnel du cachet',
      'Conforme aux normes sénégalaises',
      'Plusieurs formats (rond, rectangulaire)',
      'Fichiers vectoriels haute résolution',
      'Guide de fabrication inclus',
    ],
    deliverables: ['Design du cachet vectoriel', 'Fichiers PDF', 'Coordonnées fournisseurs'],
    timeline: '2-3 jours ouvrés',
    priceRange: { min: 15000, max: 40000 },
    revisionsIncluded: 1,
  },
  {
    id: 'business-plan',
    category: 'administrative-services',
    name: 'Business Plan',
    description: 'Business plan professionnel pour convaincre investisseurs et banques',
    icon: TrendingUp,
    features: [
      'Étude de marché approfondie',
      'Analyse concurrentielle',
      'Projections financières (3-5 ans)',
      'Stratégie marketing et commerciale',
      'Plan opérationnel détaillé',
      'Design professionnel (30-50 pages)',
      'Présentation PowerPoint incluse',
    ],
    deliverables: ['Business plan PDF', 'Fichier Word éditable', 'Présentation PowerPoint', 'Tableur financier'],
    timeline: '2-3 semaines',
    priceRange: { min: 500000, max: 1500000 },
    revisionsIncluded: 3,
    popular: true,
  },
  {
    id: 'virtual-office',
    category: 'administrative-services',
    name: 'Bureau virtuel',
    description: 'Service de domiciliation et gestion de courrier professionnel',
    icon: Building2,
    features: [
      'Adresse commerciale prestigieuse à Dakar',
      'Réception et gestion du courrier',
      'Scan et envoi digital des documents',
      'Numéro de téléphone professionnel',
      'Transfert d\'appels',
      'Accès salle de réunion (4h/mois)',
    ],
    deliverables: ['Contrat de domiciliation', 'Attestation mensuelle', 'Accès plateforme web'],
    timeline: 'Immédiat',
    price: 50000, // Prix mensuel
    priceRange: { min: 50000, max: 150000 },
    revisionsIncluded: 0,
    popular: true,
  },
  {
    id: 'secretariat-service',
    category: 'administrative-services',
    name: 'Secrétariat externalisé',
    description: 'Service de secrétariat à temps partiel pour votre entreprise',
    icon: Phone,
    features: [
      'Gestion des appels et emails',
      'Prise de rendez-vous',
      'Rédaction de courriers et documents',
      'Gestion de l\'agenda',
      'Suivi administratif',
      'Disponible du lundi au vendredi (9h-18h)',
    ],
    deliverables: ['Rapport d\'activité hebdomadaire', 'Accès plateforme collaborative'],
    timeline: 'Sur abonnement',
    priceRange: { min: 150000, max: 500000 }, // Prix mensuel
    revisionsIncluded: 0,
  },
  {
    id: 'admin-assistance',
    category: 'administrative-services',
    name: 'Assistance administrative',
    description: 'Accompagnement pour vos démarches administratives',
    icon: ClipboardList,
    features: [
      'Rédaction de documents officiels',
      'Préparation de dossiers administratifs',
      'Aide aux déclarations fiscales',
      'Suivi des obligations légales',
      'Rappels des échéances importantes',
      'Support personnalisé',
    ],
    deliverables: ['Documents rédigés', 'Dossiers complets', 'Calendrier des obligations'],
    timeline: 'Variable selon besoin',
    priceRange: { min: 75000, max: 300000 },
    revisionsIncluded: 2,
  },
  {
    id: 'communication-support-pack',
    category: 'social-media',
    name: 'Pack supports de communication',
    description: 'Ensemble complet de supports pour votre communication',
    icon: Megaphone,
    features: [
      'Plaquette commerciale (8 pages)',
      'Dépliant 3 volets',
      'Affiche A3',
      'Signature email professionnelle',
      'Templates de documents (facture, devis, lettre)',
      'Bannières web et réseaux sociaux',
    ],
    deliverables: ['Fichiers print-ready', 'Templates éditables', 'Kit digital'],
    timeline: '10-14 jours ouvrés',
    priceRange: { min: 250000, max: 600000 },
    revisionsIncluded: 2,
    popular: true,
  },
];

export const getServicesByCategory = (category: ServiceCategory) => {
  return mockBrandingServices.filter(service => service.category === category);
};

export const getServiceById = (id: string) => {
  return mockBrandingServices.find(service => service.id === id);
};

export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('fr-FR')} FCFA`;
};

export const getStatusLabel = (status: ProjectStatus): string => {
  const labels: Record<ProjectStatus, string> = {
    'draft': 'Brouillon',
    'payment-pending': 'En attente de paiement',
    'in-progress': 'En cours',
    'in-review': 'En révision',
    'delivered': 'Livré',
    'cancelled': 'Annulé',
  };
  return labels[status];
};

export const getStatusColor = (status: ProjectStatus): string => {
  const colors: Record<ProjectStatus, string> = {
    'draft': 'gray',
    'payment-pending': 'orange',
    'in-progress': 'purple',
    'in-review': 'amber',
    'delivered': 'green',
    'cancelled': 'red',
  };
  return colors[status];
};

export const getDeliverableStatusLabel = (status: DeliverableStatus): string => {
  const labels: Record<DeliverableStatus, string> = {
    'pending-review': 'En attente de validation',
    'approved': 'Approuvé',
    'revision-requested': 'Révision demandée',
  };
  return labels[status];
};

export const getDeliverableStatusColor = (status: DeliverableStatus): 'blue' | 'green' | 'orange' => {
  const colors: Record<DeliverableStatus, 'blue' | 'green' | 'orange'> = {
    'pending-review': 'blue',
    'approved': 'green',
    'revision-requested': 'orange',
  };
  return colors[status];
};

// Mock projects pour la démo
export const mockBrandingProjects: BrandingProject[] = [
  // Vidé : l'application démarre sans dossier fabriqué. Chaque visiteur
  // construit sa propre démonstration ; le catalogue, lui, reste intact.
];