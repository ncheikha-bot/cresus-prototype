import React from 'react';
import { motion } from 'motion/react';
import { 
  FolderOpen, AlertCircle, CheckCircle2, Clock, 
  TrendingUp, Users, FileText, Calendar 
} from '../ui/icons';
import { mockAccountingFolders, getMonthStatusLabel, getMonthStatusColor } from '../../data/accountingData';
import { AccountantDashboardImproved } from './AccountantDashboardImproved';

interface AccountantDashboardProps {
  onNavigate: (page: string) => void;
}

export const AccountantDashboard: React.FC<AccountantDashboardProps> = ({ onNavigate }) => {
  // Utiliser le nouveau dashboard amélioré avec navigation
  return <AccountantDashboardImproved onNavigate={onNavigate} />;
};