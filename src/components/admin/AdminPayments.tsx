import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, X, FileText, TrendingUp } from '../ui/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockPayments, mockCompanies } from '../../data/mockData';
import { formatFCFACompact } from '../../lib/format';

const monthlyRevenue = [
  { month: 'Juil', revenue: 15000000 },
  { month: 'Août', revenue: 22000000 },
  { month: 'Sept', revenue: 18000000 },
  { month: 'Oct', revenue: 30000000 },
  { month: 'Nov', revenue: 10000000 },
];

export const AdminPayments: React.FC = () => {
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'orange_money': return 'Orange Money';
      case 'wave': return 'Wave';
      case 'card': return 'Carte bancaire';
      default: return method;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'orange_money': return 'bg-orange-100 text-orange-700';
      case 'wave': return 'bg-blue-100 text-blue-700';
      case 'card': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalRevenue = mockPayments.reduce((sum, p) => p.status === 'completed' ? sum + p.amount : sum, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#273A7A]/80 text-sm mb-1">Revenu total</p>
          <p className="text-[#1A2753]">{formatFCFACompact(totalRevenue)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#273A7A]/80 text-sm mb-1">Paiements validés</p>
          <p className="text-[#1A2753]">{mockPayments.filter(p => p.status === 'completed').length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#273A7A]/80 text-sm mb-1">Transactions ce mois</p>
          <p className="text-[#1A2753]">{mockPayments.length}</p>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-[#1A2753] mb-4">Revenu mensuel (FCFA)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F6FA" />
            <XAxis dataKey="month" stroke="#273A7A" />
            <YAxis stroke="#273A7A" />
            <Tooltip formatter={(value) => formatFCFACompact(Number(value))} />
            <Bar dataKey="revenue" fill="#D6A93A" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#F5F6FA]">
          <h3 className="text-[#1A2753]">Transactions récentes</h3>
        </div>
        <table className="w-full">
          <thead className="bg-[#F5F6FA]">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-[#1A2753]">Société</th>
              <th scope="col" className="px-6 py-4 text-left text-[#1A2753]">Montant</th>
              <th scope="col" className="px-6 py-4 text-left text-[#1A2753]">Canal</th>
              <th scope="col" className="px-6 py-4 text-left text-[#1A2753]">Statut</th>
              <th scope="col" className="px-6 py-4 text-left text-[#1A2753]">Date</th>
              <th scope="col" className="px-6 py-4 text-left text-[#1A2753]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockPayments.map((payment) => {
              const company = mockCompanies.find(c => c.id === payment.companyId);
              return (
                <tr key={payment.id} className="border-t border-[#F5F6FA] hover:bg-[#F5F6FA]/50 transition-all duration-300">
                  <td className="px-6 py-4 text-[#1A2753]">{company?.name}</td>
                  <td className="px-6 py-4 text-[#1A2753]">{payment.amount.toLocaleString()} FCFA</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${getPaymentMethodColor(payment.method)}`}>
                      {getPaymentMethodLabel(payment.method)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {payment.status === 'completed' ? 'Validé' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#273A7A]/80">
                    {new Date(payment.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {payment.status === 'pending' && (
                        <>
                          <button aria-label="Confirmer" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-green-50 rounded-lg transition-all duration-300" title="Confirmer">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </button>
                          <button aria-label="Annuler" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-red-50 rounded-lg transition-all duration-300" title="Annuler">
                            <X className="w-5 h-5 text-red-600" />
                          </button>
                        </>
                      )}
                      {payment.status === 'completed' && (
                        <button aria-label="Reçu" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] p-2 hover:bg-blue-50 rounded-lg transition-all duration-300" title="Reçu">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
