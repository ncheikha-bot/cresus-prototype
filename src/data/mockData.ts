import {
  BadgeCheck,
  BookOpen,
  FilmSlate,
  Globe,
  Palette,
  Smartphone,
} from '../components/ui/icons';
import type { User, Company, DomiciliationAddress, BrandingProject, Modification, Payment, Notification, Appointment, BankAccountRequest } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Cheikh Diop',
    email: 'cheikh@example.com',
    phone: '+221771234567',
    role: 'client',
  },
  {
    id: '2',
    name: 'Admin Crésus',
    email: 'admin@cresus.sn',
    phone: '+221771111111',
    role: 'admin',
  },
  // Utilisateurs banques
  {
    id: 'bank-user-boa',
    name: 'Bank of Africa',
    firstName: 'BOA',
    lastName: 'Banque',
    email: 'boa@bank.sn',
    phone: '+221771234000',
    role: 'bank',
    bankId: 'boa',
    bankPassword: 'boa123',
    hasCompletedOnboarding: true,
  },
  {
    id: 'bank-user-sgbs',
    name: 'SGBS Banque',
    firstName: 'SGBS',
    lastName: 'Banque',
    email: 'sgbs@bank.sn',
    phone: '+221771234001',
    role: 'bank',
    bankId: 'sgbs',
    bankPassword: 'sgbs123',
    hasCompletedOnboarding: true,
  },
  {
    id: 'bank-user-ecobank',
    name: 'Ecobank',
    firstName: 'Ecobank',
    lastName: 'Banque',
    email: 'eco@bank.sn',
    phone: '+221771234002',
    role: 'bank',
    bankId: 'ecobank',
    bankPassword: 'eco123',
    hasCompletedOnboarding: true,
  },
];

export const mockCompanies: Company[] = [
  // Vidé : l'application démarre sans dossier fabriqué. Chaque visiteur
  // construit sa propre démonstration ; le catalogue, lui, reste intact.
];

export const mockDomiciliationAddresses: DomiciliationAddress[] = [
  {
    id: '1',
    name: 'Plateau - Immeuble Fahd',
    address: 'Avenue Léopold Sédar Senghor, Dakar',
    zone: 'Plateau',
    price: 50000,
    services: ['Adresse fiscale', 'Réception courrier', 'Salle de réunion 2h/mois'],
    available: true,
  },
  {
    id: '2',
    name: 'Almadies - Résidence Atlantic',
    address: 'Route des Almadies, Dakar',
    zone: 'Almadies',
    price: 75000,
    services: ['Adresse fiscale', 'Réception courrier', 'Salle de réunion 4h/mois', 'Bureau partagé'],
    available: true,
  },
  {
    id: '3',
    name: 'Mermoz - Centre Affaires',
    address: 'Rue ME-38, Mermoz, Dakar',
    zone: 'Mermoz',
    price: 60000,
    services: ['Adresse fiscale', 'Réception courrier', 'Salle de réunion 3h/mois'],
    available: true,
  },
];

export const mockModifications: Modification[] = [
  // Vidé : l'application démarre sans dossier fabriqué. Chaque visiteur
  // construit sa propre démonstration ; le catalogue, lui, reste intact.
];

export const mockBrandingProjects: BrandingProject[] = [
  // Vidé : l'application démarre sans dossier fabriqué. Chaque visiteur
  // construit sa propre démonstration ; le catalogue, lui, reste intact.
];

export const mockPayments: Payment[] = [
  // Vidé : l'application démarre sans dossier fabriqué. Chaque visiteur
  // construit sa propre démonstration ; le catalogue, lui, reste intact.
];

export const mockNotifications: Notification[] = [
  // Vidé : l'application démarre sans dossier fabriqué. Chaque visiteur
  // construit sa propre démonstration ; le catalogue, lui, reste intact.
];

export const mockAppointments: Appointment[] = [
  // Vidé : l'application démarre sans dossier fabriqué. Chaque visiteur
  // construit sa propre démonstration ; le catalogue, lui, reste intact.
];

export const brandingServices = [
  {
    id: 'logo',
    name: 'Création Logo',
    description: 'Logo professionnel avec 3 propositions',
    price: 150000,
    duration: '7 jours',
    icon: Palette,
  },
  {
    id: 'website',
    name: 'Site Web',
    description: 'Site vitrine responsive avec CMS',
    price: 500000,
    duration: '21 jours',
    icon: Globe,
  },
  {
    id: 'charte',
    name: 'Charte Graphique',
    description: 'Guide complet de votre identité visuelle',
    price: 200000,
    duration: '10 jours',
    icon: BookOpen,
  },
  {
    id: 'video',
    name: 'Vidéo Présentation',
    description: 'Vidéo promotionnelle 60-90 secondes',
    price: 300000,
    duration: '14 jours',
    icon: FilmSlate,
  },
  {
    id: 'social_media',
    name: 'Pack Social Media',
    description: '20 visuels pour réseaux sociaux',
    price: 100000,
    duration: '7 jours',
    icon: Smartphone,
  },
  {
    id: 'complete',
    name: 'Pack Complet',
    description: 'Logo + Site + Charte + Social Media',
    price: 800000,
    duration: '30 jours',
    icon: BadgeCheck,
  },
];

// Demandes d'ouverture de compte bancaire - Exemples de test
export const mockBankRequests: BankAccountRequest[] = [
  // Vidé : l'application démarre sans dossier fabriqué. Chaque visiteur
  // construit sa propre démonstration ; le catalogue, lui, reste intact.
];