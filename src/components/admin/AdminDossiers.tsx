import React from 'react';
import { AdminCompanyProcess } from './AdminCompanyProcess';

/**
 * AdminDossiers - Point d'entrée pour la gestion des dossiers de création d'entreprise
 * 
 * Ce composant utilise AdminCompanyProcess qui unifie :
 * - La gestion des dossiers de création
 * - La gestion et validation des documents
 * - Les échanges avec le client (upload, validation, versionnage)
 * - Le suivi du processus en 5 étapes
 */
export const AdminDossiers: React.FC = () => {
  return <AdminCompanyProcess onBack={() => window.history.back()} />;
};
