import React, { useState } from 'react';
import { WebMyCompaniesImproved } from './WebMyCompaniesImproved';

interface WebMyCompaniesProps {
  onBack: () => void;
  onNavigate: (screen: string, companyId?: string) => void;
}

export const WebMyCompanies: React.FC<WebMyCompaniesProps> = ({ onBack, onNavigate }) => {
  // Utiliser le composant amélioré
  return <WebMyCompaniesImproved onBack={onBack} onNavigate={onNavigate} />;
};