import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Building,
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
  Plus,
  Users,
  MapPin,
  Check,
  Info,
  DollarSign,
  FileCheck,
  Landmark,
  PenTool,
  Calendar,
  AlertCircle,
  ChevronRight,
} from '../ui/icons';
import { useApp } from '../../context/AppContext';
import type { Company } from '../../types';
import { AdminCompanySteps } from './AdminCompanySteps';

interface AdminCompanyProcessStepByStepProps {
  company: Company;
  onBack: () => void;
}

export const AdminCompanyProcessStepByStep: React.FC<AdminCompanyProcessStepByStepProps> = ({ 
  company, 
  onBack 
}) => {
  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button aria-label="Retour"
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-10 h-10 bg-white hover:bg-[#F5F6FA] rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
          </button>
          <div>
            <h1 className="text-[#1A2753] mb-1">{company.name}</h1>
            <p className="text-[#273A7A]/80">{company.legalForm} • {company.activity}</p>
          </div>
        </div>
      </div>

      {/* Workflow complet */}
      <AdminCompanySteps company={company} />
    </div>
  );
};