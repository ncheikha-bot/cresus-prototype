import React from 'react';
import { Users } from '../ui/icons';

/**
 * État civil d'un associé, tel qu'il figure dans les statuts.
 *
 * Ces champs vivaient au milieu de la saisie des associés, où ils bloquaient
 * l'accès au devis : un client connaît rarement de tête la profession exacte de
 * son associé ou la date de naissance de son conjoint. Ils sont demandés une
 * fois le devis présenté, d'où ce bloc autonome.
 */
export interface StatutsAssociate {
  id: string;
  firstName: string;
  lastName: string;
  profession?: string;
  maritalStatus?: 'single' | 'married' | 'widowed' | 'divorced';
  matrimonialRegime?: 'community' | 'separation';
  spouseInfo?: {
    firstName: string;
    lastName: string;
    birthDate: string;
    profession: string;
  };
}

interface AssociateStatutsFieldsProps {
  associate: StatutsAssociate;
  /** Remplace l'associé, champs liés compris (régime, conjoint). */
  onChange: (patch: Partial<StatutsAssociate>) => void;
}

const champ = 'w-full px-3 py-2 bg-white rounded-lg outline-none focus:ring-2 focus:ring-[#D6A93A] transition-all duration-300 text-sm';
const libelle = 'text-xs text-[#273A7A]/80 mb-1 block';

export const AssociateStatutsFields: React.FC<AssociateStatutsFieldsProps> = ({ associate, onChange }) => {
  const conjoint = associate.spouseInfo ?? { firstName: '', lastName: '', birthDate: '', profession: '' };
  const majConjoint = (patch: Partial<typeof conjoint>) => onChange({ spouseInfo: { ...conjoint, ...patch } });

  return (
    <div className="space-y-3">
      <div>
        <label className={libelle}>Profession *</label>
        <input
          type="text"
          value={associate.profession || ''}
          onChange={(e) => onChange({ profession: e.target.value })}
          className={champ}
          placeholder="Ex: Commerçant, Consultant, etc."
        />
      </div>

      <div>
        <label className={libelle}>Situation matrimoniale *</label>
        <select
          value={associate.maritalStatus || ''}
          onChange={(e) => {
            const valeur = e.target.value;
            onChange({
              maritalStatus: valeur === '' ? undefined : (valeur as StatutsAssociate['maritalStatus']),
              // Les champs dépendants n'ont plus lieu d'être si l'associé n'est pas marié.
              matrimonialRegime: valeur === 'married' ? associate.matrimonialRegime : undefined,
              spouseInfo: valeur === 'married' ? associate.spouseInfo : undefined,
            });
          }}
          className={champ}
        >
          <option value="">Sélectionner...</option>
          <option value="single">Célibataire</option>
          <option value="married">Marié(e)</option>
          <option value="widowed">Veuf/Veuve</option>
          <option value="divorced">Divorcé(e)</option>
        </select>
      </div>

      {associate.maritalStatus === 'married' && (
        <div>
          <label className={libelle}>Régime matrimonial *</label>
          <select
            value={associate.matrimonialRegime || ''}
            onChange={(e) => {
              const valeur = e.target.value;
              onChange({
                matrimonialRegime: valeur === '' ? undefined : (valeur as StatutsAssociate['matrimonialRegime']),
                spouseInfo: valeur === 'community' ? associate.spouseInfo : undefined,
              });
            }}
            className={champ}
          >
            <option value="">Sélectionner...</option>
            <option value="community">Communauté de biens</option>
            <option value="separation">Séparation de biens</option>
          </select>
        </div>
      )}

      {/* En communauté de biens, le conjoint est partie prenante des statuts. */}
      {associate.maritalStatus === 'married' && associate.matrimonialRegime === 'community' && (
        <div className="space-y-2 p-3 bg-[#D6A93A]/5 rounded-lg border border-[#D6A93A]/20">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#D6A93A]" />
            <span className="text-xs text-[#273A7A]">Informations du conjoint</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={libelle}>Prénom *</label>
              <input
                type="text"
                value={conjoint.firstName}
                onChange={(e) => majConjoint({ firstName: e.target.value })}
                className={champ}
                placeholder="Awa"
              />
            </div>
            <div>
              <label className={libelle}>Nom *</label>
              <input
                type="text"
                value={conjoint.lastName}
                onChange={(e) => majConjoint({ lastName: e.target.value })}
                className={champ}
                placeholder="Ndiaye"
              />
            </div>
          </div>

          <div>
            <label className={libelle}>Date de naissance *</label>
            <input
              type="date"
              value={conjoint.birthDate}
              onChange={(e) => majConjoint({ birthDate: e.target.value })}
              className={champ}
            />
          </div>

          <div>
            <label className={libelle}>Profession *</label>
            <input
              type="text"
              value={conjoint.profession}
              onChange={(e) => majConjoint({ profession: e.target.value })}
              className={champ}
              placeholder="Ex: Commerçant, Consultant, etc."
            />
          </div>
        </div>
      )}
    </div>
  );
};
