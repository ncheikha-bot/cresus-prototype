import React from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Receipt,
  Clock,
  ArrowRight,
  Download,
  Eye,
  BarChart3,
  DollarSign,
  Zap,
} from '../ui/icons';
import type { AccountingFolder } from '../../data/accountingData';
import { getMonthStatusColor, getMonthStatusLabel, mockTaxDeclarations } from '../../data/accountingData';
import { getEcheanceFiscale, getProchainesEcheances } from '../../domain/taxDeadlines';

interface Props {
  activeFolder: AccountingFolder;
  onSendDocuments: () => void;
}

export const AccountingDashboardImproved: React.FC<Props> = ({ activeFolder, onSendDocuments }) => {
  const documentsProgress =
    ((activeFolder.currentMonth?.documentsCount.received || 0) /
      (activeFolder.currentMonth?.documentsCount.total || 1)) *
    100;

  const validatedProgress =
    ((activeFolder.currentMonth?.documentsCount.validated || 0) /
      (activeFolder.currentMonth?.documentsCount.received || 1)) *
    100;

  return (
    <div className="space-y-4">
      {/* Hero Card - Status du mois */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-3xl p-6 text-white relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm mb-1">Mois en cours</p>
              <h2 className="text-2xl">Novembre 2025</h2>
            </div>
            <div
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: getMonthStatusColor(activeFolder.currentMonth!.status) }}
            >
              {getMonthStatusLabel(activeFolder.currentMonth!.status)}
            </div>
          </div>

          {/* Progress Circle */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#D6A93A"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - documentsProgress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{Math.round(documentsProgress)}%</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/70">Documents reçus</span>
                    <span className="font-medium">
                      {activeFolder.currentMonth!.documentsCount.received} /{' '}
                      {activeFolder.currentMonth!.documentsCount.total}
                    </span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${documentsProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-[#D6A93A] rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/70">Validés</span>
                    <span className="font-medium text-green-400">
                      {activeFolder.currentMonth!.documentsCount.validated}
                    </span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${validatedProgress}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                      className="h-full bg-green-400 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onSendDocuments}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-full mt-6 py-4 bg-[#D6A93A] text-white rounded-2xl hover:bg-[#C09830] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Envoyer des documents</span>
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4"
        >
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl text-[#1A2753] mb-1">
            {activeFolder.currentMonth!.documentsCount.validated}
          </p>
          <p className="text-sm text-gray-600">Documents validés</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4"
        >
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-2xl text-[#1A2753] mb-1">
            {activeFolder.currentMonth!.documentsCount.received -
              activeFolder.currentMonth!.documentsCount.validated}
          </p>
          <p className="text-sm text-gray-600">En traitement</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4"
        >
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-2xl text-[#1A2753] mb-1">
            {activeFolder.currentMonth!.documentsCount.rejected || 0}
          </p>
          <p className="text-sm text-gray-600">Documents rejetés</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-4"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl text-[#1A2753] mb-1">
            {activeFolder.currentMonth!.documentsCount.total -
              activeFolder.currentMonth!.documentsCount.received}
          </p>
          <p className="text-sm text-gray-600">Manquants</p>
        </motion.div>
      </div>

      {/* Prochaines échéances */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#1A2753] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D6A93A]" />
            Prochaines échéances
          </h3>
          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-[#D6A93A] text-sm flex items-center gap-1">
            Tout voir
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {getProchainesEcheances(mockTaxDeclarations, 3).map((tax, index) => {
            const echeance = getEcheanceFiscale(tax);
            return (
            <motion.div
              key={tax.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#F5F6FA] to-white rounded-xl"
            >
              <div className="w-12 h-12 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Receipt className="w-6 h-6 text-[#D6A93A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1A2753] text-sm font-medium truncate">{echeance.libelle}</p>
                <p className="text-gray-500 text-xs">{echeance.impot}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[#1A2753] text-sm font-medium">{echeance.date}</p>
                <p className={`text-xs ${echeance.enRetard ? 'text-red-600' : 'text-orange-600'}`}>
                  {echeance.delai}
                </p>
              </div>
            </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Actions rapides */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-5"
      >
        <h3 className="text-[#1A2753] mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl text-left hover:shadow-md transition-all active:scale-95">
            <Download className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-sm text-[#1A2753] font-medium">Télécharger</p>
            <p className="text-xs text-gray-600">Mes documents</p>
          </button>

          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl text-left hover:shadow-md transition-all active:scale-95">
            <Eye className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-sm text-[#1A2753] font-medium">Consulter</p>
            <p className="text-xs text-gray-600">États financiers</p>
          </button>

          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl text-left hover:shadow-md transition-all active:scale-95">
            <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-sm text-[#1A2753] font-medium">Tableaux</p>
            <p className="text-xs text-gray-600">De bord</p>
          </button>

          <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl text-left hover:shadow-md transition-all active:scale-95">
            <DollarSign className="w-6 h-6 text-orange-600 mb-2" />
            <p className="text-sm text-[#1A2753] font-medium">Paiements</p>
            <p className="text-xs text-gray-600">Mes factures</p>
          </button>
        </div>
      </motion.div>

      {/* Infos comptable */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="bg-gradient-to-br from-[#D6A93A]/10 to-[#D6A93A]/5 rounded-2xl p-5 border border-[#D6A93A]/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#D6A93A] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">CD</span>
          </div>
          <div className="flex-1">
            <p className="text-[#1A2753] font-medium mb-1">Votre expert-comptable</p>
            <p className="text-sm text-gray-600 mb-3">Cheikh Diop - Expert comptable diplômé</p>
            <div className="flex gap-2">
              <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-3 py-2 bg-white rounded-lg text-sm text-[#1A2753] hover:shadow-md transition-all active:scale-95">
                Contacter
              </button>
              <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 flex-1 px-3 py-2 bg-[#D6A93A] text-white rounded-lg text-sm hover:bg-[#C09830] transition-all active:scale-95">
                Message
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
