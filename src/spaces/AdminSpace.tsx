import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminDossiers } from '../components/admin/AdminDossiers';
import { AdminPayments } from '../components/admin/AdminPayments';
import { AdminBranding } from '../components/admin/AdminBranding';
import { AdminAppointments } from '../components/admin/AdminAppointments';
import { AdminDomiciliation } from '../components/admin/AdminDomiciliation';
import { AdminModifications } from '../components/admin/AdminModifications';
import { AdminBanks } from '../components/admin/AdminBanks';
import { AdminBankRequests } from '../components/admin/AdminBankRequests';
import { AdminAccountingMonitoring } from '../components/admin/AdminAccountingMonitoring';

/** Espace d'administration. La page courante vient de l'URL (`/admin/<page>`). */
export default function AdminSpace() {
  const params = useParams();
  const navigate = useNavigate();

  const page = params['*'] || 'dashboard';
  const go = (destination: string) => navigate(`/admin/${destination}`);
  const goDashboard = () => go('dashboard');

  return (
    <AdminLayout currentPage={page} onNavigate={go}>
      {page === 'dossiers' && <AdminDossiers />}
      {page === 'banks' && <AdminBanks />}
      {page === 'bank-requests' && <AdminBankRequests />}
      {page === 'payments' && <AdminPayments />}
      {page === 'accounting' && <AdminAccountingMonitoring />}
      {page === 'branding' && <AdminBranding />}
      {page === 'appointments' && <AdminAppointments />}
      {page === 'domiciliation' && <AdminDomiciliation onBack={goDashboard} />}
      {page === 'modifications' && <AdminModifications onBack={goDashboard} />}
      {page === 'notifications' && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h3 className="text-[#1A2753] mb-2">Centre de notifications</h3>
            <p className="text-[#273A7A]/80">Interface en cours de développement</p>
          </div>
        </div>
      )}
      {/* Le tableau de bord est aussi la page par défaut. */}
      {!['dossiers', 'banks', 'bank-requests', 'payments', 'accounting', 'branding',
         'appointments', 'domiciliation', 'modifications', 'notifications'].includes(page) && (
        <AdminDashboard onNavigate={go} />
      )}
    </AdminLayout>
  );
}
