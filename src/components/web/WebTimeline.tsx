import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, Clock, Circle, CreditCard, FileText, Building, FileCheck, Package, PenTool } from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { MOBILE_TIMELINE_STEPS } from '../../data/processSteps';
import { getStepStatuses } from '../../domain/companySteps';

interface WebTimelineProps {
  onBack: () => void;
}

export const WebTimeline: React.FC<WebTimelineProps> = ({ onBack }) => {
  const { companies, currentUser, getCompanyProcess } = useApp();
  const userCompanies = companies.filter(c => c.userId === currentUser?.id);

  // Le suivi porte sur le dossier en cours ; a defaut, la societe la plus recente.
  const dossier = userCompanies.find(c => c.status !== 'completed') ?? userCompanies[0];
  const processus = getCompanyProcess(dossier?.id ?? '');
  // Statuts deduits de l'etat reel du dossier, la ou ils etaient ecrits en dur.
  const statuts = dossier
    ? getStepStatuses(dossier, processus)
    : MOBILE_TIMELINE_STEPS.map(() => 'pending' as const);

  // Une entrée par étape de COMPANY_CREATION_STEPS, dans le même ordre :
  // `statuts[index]` ne vaut que si les deux listes restent alignées.
  const timelineEvents = MOBILE_TIMELINE_STEPS.map((step, index) => {
    const statut = statuts[index];
    const dates = [
      '10 Déc 2025',  // Étape 1
      '10 Déc 2025',  // Étape 2
      '10 Déc 2025',  // Étape 3
      '11 Déc 2025',  // Étape 4
      '12 Déc 2025',  // Étape 5
      '15 Déc 2025',  // Étape 6
      '-',            // Étape 7
      '-'             // Étape 8
    ];

    const descriptions = [
      'Informations de base et forme juridique renseignées',
      'Répartition du capital social entre les associés',
      'Adresse, profession et état civil de chaque associé',
      'Pièces justificatives transmises et validées',
      'Devis d\'immatriculation accepté',
      'Paiement du capital social effectué',
      'Statuts générés et en attente de validation',
      'Signature électronique ou rendez-vous physique'
    ];

    // Déterminer la couleur selon le statut
    let color = 'text-gray-600';
    let bgColor = 'bg-gray-50';
    
    if (statut === 'completed') {
      color = 'text-green-600';
      bgColor = 'bg-green-50';
    } else if (statut === 'active') {
      color = 'text-orange-600';
      bgColor = 'bg-orange-50';
    }

    return {
      id: step.id,
      title: step.label,
      description: descriptions[index],
      status: statut,
      icon: step.icon,
      color,
      bgColor,
      date: dates[index]
    };
  });

  /** Avancement d'un dossier, sur la même base que la timeline ci-contre. */
  const avancement = (societe: typeof userCompanies[number]): number => {
    const etapes = getStepStatuses(societe, getCompanyProcess(societe.id));
    return Math.round((etapes.filter(e => e === 'completed').length / etapes.length) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'active':
        return <Clock className="w-6 h-6 text-orange-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-600" />;
    }
  };

  // Calculer la progression
  const completedSteps = timelineEvents.filter(e => e.status === 'completed').length;
  const totalSteps = timelineEvents.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  const activeSteps = timelineEvents.filter(e => e.status === 'active').length;
  const pendingSteps = timelineEvents.filter(e => e.status === 'pending').length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button aria-label="Retour"
          onClick={onBack}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-white/80 transition-all duration-300 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-[#1A2753]" />
        </button>
        <div>
          <h1 className="text-[#1A2753]">Timeline de vos dossiers</h1>
          <p className="text-[#273A7A]/80">Suivez l'avancement de vos démarches</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-[#1A2753] mb-8">Historique des événements</h3>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#F5F6FA]" />
              
              <div className="space-y-8">
                {timelineEvents.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-20"
                    >
                      {/* Icon */}
                      <div className={`absolute left-0 w-16 h-16 ${event.bgColor} rounded-2xl flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-7 h-7 ${event.color}`} />
                      </div>

                      {/* Status Indicator */}
                      <div className="absolute left-8 -translate-x-1/2 w-4 h-4 bg-white border-2 rounded-full z-10"
                        style={{
                          borderColor: 
                            event.status === 'completed' ? '#22c55e' :
                            event.status === 'active' ? '#f97316' :
                            '#d1d5db'
                        }}
                      />

                      {/* Content */}
                      <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        event.status === 'completed' ? 'border-green-100 bg-green-50/50' :
                        event.status === 'active' ? 'border-orange-100 bg-orange-50/50' :
                        'border-[#F5F6FA] bg-white'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-[#1A2753]">{event.title}</h4>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(event.status)}
                              </div>
                            </div>
                            <p className="text-[#273A7A]/80 text-sm">{event.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#273A7A]/80">
                          <Clock className="w-3 h-3" />
                          <span>{event.date}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Stats & Info */}
        <div className="space-y-6">
          {/* Progress Summary */}
          <div className="bg-gradient-to-br from-[#1A2753] to-[#273A7A] rounded-2xl p-6 text-white shadow-sm">
            <h3 className="text-white mb-6">Progression globale</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Avancement</span>
                  <span className="text-white">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-[#D6A93A] h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl text-white mb-1">{completedSteps}</div>
                  <div className="text-white/60 text-xs">Complétées</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-[#D6A93A] mb-1">{activeSteps}</div>
                  <div className="text-white/60 text-xs">En cours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-white/60 mb-1">{pendingSteps}</div>
                  <div className="text-white/60 text-xs">À venir</div>
                </div>
              </div>
            </div>
          </div>

          {/* My Companies */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#1A2753] mb-4">Mes entreprises</h3>
            
            {userCompanies.length > 0 ? (
              <div className="space-y-3">
                {userCompanies.map((company) => (
                  <div key={company.id} className="p-4 bg-[#F5F6FA] rounded-xl">
                    <p className="text-[#1A2753] mb-1">{company.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#273A7A]/80 text-xs">{company.legalForm}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        company.status === 'completed' ? 'bg-green-100 text-green-700' :
                        company.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {avancement(company)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#273A7A]/80 text-sm text-center py-4">
                Aucune entreprise enregistrée
              </p>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="text-blue-900 mb-3">Prochaines étapes</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Compléter la signature des statuts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Finaliser la domiciliation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Attendre l'immatriculation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};