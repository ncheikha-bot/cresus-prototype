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
  TrendingDown,
  Users,
  Package,
  Mail,
  Phone,
} from '../ui/icons';
import type { AccountingFolder } from '../../data/accountingData';
import { getMonthStatusColor, getMonthStatusLabel, mockTaxDeclarations } from '../../data/accountingData';
import { getEcheanceFiscale, getProchainesEcheances } from '../../domain/taxDeadlines';

interface Props {
  activeFolder: AccountingFolder;
  onSendDocuments: () => void;
}

export const WebAccountingDashboardImproved: React.FC<Props> = ({ activeFolder, onSendDocuments }) => {
  const documentsProgress =
    ((activeFolder.currentMonth?.documentsCount.received || 0) /
      (activeFolder.currentMonth?.documentsCount.total || 1)) *
    100;

  const validatedProgress =
    ((activeFolder.currentMonth?.documentsCount.validated || 0) /
      (activeFolder.currentMonth?.documentsCount.received || 1)) *
    100;

  return (
    <div className="space-y-6">
      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="lg:col-span-2 bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-3xl p-8 text-white relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-white/70 mb-2">Mois en cours</p>
                <h2 className="text-3xl mb-1">Novembre 2025</h2>
                <p className="text-white/80 text-sm">{activeFolder.companyName}</p>
              </div>
              <div
                className="px-5 py-2.5 rounded-full text-sm font-medium"
                style={{ backgroundColor: getMonthStatusColor(activeFolder.currentMonth!.status) }}
              >
                {getMonthStatusLabel(activeFolder.currentMonth!.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-white/70 text-sm mb-3">Documents reçus</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-bold">
                    {activeFolder.currentMonth!.documentsCount.received}
                  </p>
                  <p className="text-white/70 text-xl mb-1">
                    / {activeFolder.currentMonth!.documentsCount.total}
                  </p>
                </div>
                <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${documentsProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-[#D6A93A] rounded-full"
                  />
                </div>
                <p className="text-white/70 text-sm mt-2">{Math.round(documentsProgress)}% complété</p>
              </div>

              <div>
                <p className="text-white/70 text-sm mb-3">Documents validés</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-bold text-green-400">
                    {activeFolder.currentMonth!.documentsCount.validated ?? 0}
                  </p>
                  <p className="text-white/70 text-xl mb-1">
                    / {activeFolder.currentMonth!.documentsCount.received}
                  </p>
                </div>
                <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${validatedProgress}%` }}
                    transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                    className="h-full bg-green-400 rounded-full"
                  />
                </div>
                <p className="text-white/70 text-sm mt-2">{Math.round(validatedProgress)}% validé</p>
              </div>
            </div>

            <button
              onClick={onSendDocuments}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] w-full py-4 bg-[#D6A93A] text-white rounded-2xl hover:bg-[#C09830] transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium text-lg">Envoyer des documents</span>
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Expert-comptable Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <h3 className="text-[#1A2753] mb-6">Votre expert-comptable</h3>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#D6A93A] to-[#b8902f] rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">CD</span>
            </div>
            <p className="text-[#1A2753] font-medium mb-1">Cheikh Diop</p>
            <p className="text-sm text-gray-600 mb-1">Expert comptable diplômé</p>
            <div className="flex items-center gap-1 text-[#D6A93A] text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Vérifié</span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>c.diop@cresus.sn</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>+221 77 123 45 67</span>
            </div>
          </div>

          <div className="space-y-2">
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full px-4 py-3 bg-[#D6A93A] text-white rounded-xl hover:bg-[#C09830] transition-all">
              Envoyer un message
            </button>
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-full px-4 py-3 bg-[#F5F6FA] text-[#1A2753] rounded-xl hover:bg-gray-200 transition-all">
              Planifier un appel
            </button>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <div className="text-green-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>+12%</span>
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] font-bold mb-1">
            {activeFolder.currentMonth!.documentsCount.validated ?? 0}
          </p>
          <p className="text-gray-600 text-sm">Documents validés</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center">
              <Clock className="w-7 h-7 text-orange-600" />
            </div>
            <div className="text-orange-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>+5%</span>
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] font-bold mb-1">
            {(activeFolder.currentMonth!.documentsCount.received) -
              (activeFolder.currentMonth!.documentsCount.validated ?? 0)}
          </p>
          <p className="text-gray-600 text-sm">En traitement</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>
            <div className="text-green-600 text-sm flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              <span>-8%</span>
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] font-bold mb-1">
            {activeFolder.currentMonth!.documentsCount.rejected || 0}
          </p>
          <p className="text-gray-600 text-sm">Documents rejetés</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <div className="text-red-600 text-sm flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              <span>-3</span>
            </div>
          </div>
          <p className="text-3xl text-[#1A2753] font-bold mb-1">
            {activeFolder.currentMonth!.documentsCount.total -
              activeFolder.currentMonth!.documentsCount.received}
          </p>
          <p className="text-gray-600 text-sm">Documents manquants</p>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prochaines échéances */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#1A2753] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#D6A93A]" />
              Prochaines échéances fiscales
            </h3>
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 text-[#D6A93A] text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Tout voir
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {getProchainesEcheances(mockTaxDeclarations, 4).map((tax, index) => {
              const echeance = getEcheanceFiscale(tax);
              return (
              <motion.div
                key={tax.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#F5F6FA] to-white rounded-xl hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 bg-[#D6A93A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-7 h-7 text-[#D6A93A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1A2753] font-medium truncate">{echeance.libelle}</p>
                  <p className="text-gray-500 text-sm">{echeance.impot}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#1A2753] font-medium">{echeance.date}</p>
                  <p className={`text-sm ${echeance.enRetard ? 'text-red-600' : 'text-orange-600'}`}>
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
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-[#1A2753] mb-6">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl text-left hover:shadow-lg transition-all active:scale-95 group">
              <Download className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-[#1A2753] font-medium mb-1">Télécharger</p>
              <p className="text-sm text-gray-600">Mes documents</p>
            </button>

            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl text-left hover:shadow-lg transition-all active:scale-95 group">
              <Eye className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-[#1A2753] font-medium mb-1">Consulter</p>
              <p className="text-sm text-gray-600">États financiers</p>
            </button>

            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl text-left hover:shadow-lg transition-all active:scale-95 group">
              <BarChart3 className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-[#1A2753] font-medium mb-1">Tableaux</p>
              <p className="text-sm text-gray-600">De bord</p>
            </button>

            <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl text-left hover:shadow-lg transition-all active:scale-95 group">
              <DollarSign className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-[#1A2753] font-medium mb-1">Paiements</p>
              <p className="text-sm text-gray-600">Mes factures</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};