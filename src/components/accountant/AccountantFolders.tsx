import React, { useState } from 'react';
import { AccountantFoldersImproved } from './AccountantFoldersImproved';

interface AccountantFoldersProps {
  onBack?: () => void;
}

type View = 'list' | 'detail' | 'monthly';

export const AccountantFolders: React.FC<AccountantFoldersProps> = ({ onBack }) => {
  // Utiliser le nouveau composant amélioré
  return <AccountantFoldersImproved onBack={onBack} />;
};