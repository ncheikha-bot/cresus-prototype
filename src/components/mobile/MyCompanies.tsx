import React, { useState } from 'react';
import { MyCompaniesImproved } from './MyCompaniesImproved';

interface MyCompaniesProps {
  onBack: () => void;
  onNavigate: (screen: string, companyId?: string) => void;
}

export const MyCompanies: React.FC<MyCompaniesProps> = ({ onBack, onNavigate }) => {
  // Utiliser le composant amélioré
  return <MyCompaniesImproved onBack={onBack} onNavigate={onNavigate} />;
};