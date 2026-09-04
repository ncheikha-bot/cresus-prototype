import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CircleCheck, Clock } from '../ui/icons';
import { useApp } from '../../context/AppContext';
import { BottomBar } from './BottomBar';
import { MOBILE_TIMELINE_STEPS } from '../../data/processSteps';
import { getStepStatuses } from '../../domain/companySteps';

interface TimelineProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ onBack, onNavigate }) => {
  const { companies, currentUser, getCompanyProcess } = useApp();

  // Les sociétés de l'utilisateur, et elles seules : l'écran listait `companies`
  // en entier, donc les dossiers des autres clients.
  const mesSocietes = companies.filter(c => c.userId === currentUser?.id || c.clientId === currentUser?.id);

  /**
   * Avancement propre à chaque société.
   *
   * Les statuts étaient calculés une fois, sur le premier dossier en cours, puis
   * appliqués à toutes les cartes : deux sociétés à des stades différents
   * affichaient la même progression.
   */
  const etapesDe = (company: (typeof mesSocietes)[number]) => {
    const statuts = getStepStatuses(company, getCompanyProcess(company.id));
    return MOBILE_TIMELINE_STEPS.map((step, index) => ({
      ...step,
      status: statuts[index],
      date: '-',
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F1F8] to-[#F5F6FA] pb-28">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1A2753] via-[#1E3068] to-[#273A7A] pt-[max(3rem,env(safe-area-inset-top))] pb-6 px-5">
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#D6A93A]/8 rounded-full blur-[70px] -translate-y-1/3 translate-x-1/4" />
        <div className="relative">
          <button aria-label="Retour"
            onClick={onBack}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2753] mb-5 w-10 h-10 icon-glass rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <h2 className="text-white text-lg mb-0.5">Suivi de mes dossiers</h2>
          <p className="text-white/70 text-xs">Timeline interactive</p>
        </div>
      </div>

      {/* Companies */}
      <div className="px-5 mt-5 space-y-4">
        {/* Sans dossier, l'écran se réduisait à son bandeau : rien n'indiquait
            s'il fallait patienter ou créer une société. */}
        {mesSocietes.length === 0 && (
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-[#F5F6FA] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-[#273A7A]/40" />
            </div>
            <p className="text-[#1A2753] text-sm mb-1">Aucun dossier en cours</p>
            <p className="text-[#273A7A]/80 text-xs mb-4">
              Vos démarches apparaîtront ici dès la première société créée.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('create')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2753] focus-visible:ring-offset-2 px-5 min-h-[44px] bg-[#1A2753] text-white text-sm rounded-2xl active:scale-[0.98] transition-transform"
              >
                Créer une entreprise
              </button>
            )}
          </div>
        )}

        {mesSocietes.map((company) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="mb-5">
              <h3 className="text-[#1A2753] text-sm mb-0.5">{company.name}</h3>
              <p className="text-[#273A7A]/80 text-xs">{company.legalForm} - {company.activity}</p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {etapesDe(company).map((step, index, etapes) => {
                const isCompleted = step.status === 'completed';
                const isActive = step.status === 'active';
                const Icon = step.icon;

                return (
                  <div key={step.id} className="relative pb-7 last:pb-0">
                    {/* Connector line */}
                    {index < etapes.length - 1 && (
                      <div
                        className={`absolute left-[17px] top-9 w-[2px] h-full ${
                          isCompleted ? 'bg-emerald-400' : 'bg-[#F5F6FA]'
                        }`}
                      />
                    )}

                    {/* Step */}
                    <div className="flex items-start gap-3.5">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.06 }}
                        className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/15'
                            : isActive
                            ? 'bg-[#D6A93A]/10 border-[#D6A93A]/15'
                            : 'bg-[#F5F6FA]/80 border-[#F5F6FA]'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isCompleted ? 'text-emerald-500' : isActive ? 'text-[#D6A93A]' : 'text-[#273A7A]/25'
                          }`}
                          strokeWidth={1.8}
                        />
                        {isActive && (
                          <motion.div
                            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-[#D6A93A] rounded-xl"
                          />
                        )}
                      </motion.div>

                      <div className="flex-1 pt-0.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p
                              className={`text-sm ${
                                isCompleted || isActive ? 'text-[#1A2753]' : 'text-[#273A7A]/80'
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="text-[#273A7A]/80 text-[11px] mt-0.5">{step.date}</p>
                          </div>
                          {isActive && (
                            <span className="px-2.5 py-0.5 bg-[#D6A93A]/8 text-[#D6A93A] text-[10px] rounded-full border border-[#D6A93A]/10">
                              En cours
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info */}
      <div className="px-5 mt-5">
        <div className="glass-accent rounded-2xl p-4">
          <p className="text-[#1A2753] text-xs">
            Vous recevrez une notification WhatsApp à chaque étape importante.
          </p>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      {onNavigate && <BottomBar currentScreen="timeline" onNavigate={onNavigate} />}
    </div>
  );
};
