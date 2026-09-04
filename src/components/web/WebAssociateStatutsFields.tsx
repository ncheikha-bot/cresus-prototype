import React from 'react';
import { Users } from '../ui/icons';
import type { StatutsAssociate } from '../mobile/AssociateStatutsFields';

/**
 * État civil d'un associé, tel qu'il figure dans les statuts — version web.
 *
 * Même contenu que le bloc mobile ([AssociateStatutsFields]), mise en page
 * desktop : deux colonnes et champs plus hauts.
 */
interface WebAssociateStatutsFieldsProps {
  associate: StatutsAssociate;
  /** Remplace l'associé, champs liés compris (régime, conjoint). */
  onChange: (patch: Partial<StatutsAssociate>) => void;
}

const champ = 'w-full px-3 py-2 bg-white border border-transparent rounded-lg focus:outline-none focus:border-[#D6A93A] transition-all duration-300';
const libelle = 'block text-sm text-[#273A7A]/80 mb-2';

export const WebAssociateStatutsFields: React.FC<WebAssociateStatutsFieldsProps> = ({ associate, onChange }) => {
  const conjoint = associate.spouseInfo ?? { firstName: '', lastName: '', birthDate: '', profession: '' };
  const majConjoint = (patch: Partial<typeof conjoint>) => onChange({ spouseInfo: { ...conjoint, ...patch } });

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={libelle}>
            Profession <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={associate.profession || ''}
            onChange={(e) => onChange({ profession: e.target.value })}
            className={champ}
            placeholder="Ex: Commerçant, Consultant, etc."
          />
        </div>
        <div>
          <label className={libelle}>
            Situation matrimoniale <span className="text-red-500">*</span>
          </label>
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
      </div>

      {associate.maritalStatus === 'married' && (
        <div className="mt-4">
          <label className={libelle}>
            Régime matrimonial <span className="text-red-500">*</span>
          </label>
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
        <div className="mt-4 p-4 bg-[#D6A93A]/5 rounded-xl border border-[#D6A93A]/20">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-[#D6A93A]" />
            <span className="text-sm text-[#273A7A]">Informations du conjoint</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={libelle}>
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={conjoint.firstName}
                onChange={(e) => majConjoint({ firstName: e.target.value })}
                className={champ}
                placeholder="Awa"
              />
            </div>
            <div>
              <label className={libelle}>
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={conjoint.lastName}
                onChange={(e) => majConjoint({ lastName: e.target.value })}
                className={champ}
                placeholder="Ndiaye"
              />
            </div>
            <div>
              <label className={libelle}>
                Date de naissance <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={conjoint.birthDate}
                onChange={(e) => majConjoint({ birthDate: e.target.value })}
                className={champ}
              />
            </div>
            <div>
              <label className={libelle}>
                Profession <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={conjoint.profession}
                onChange={(e) => majConjoint({ profession: e.target.value })}
                className={champ}
                placeholder="Ex: Commerçant, Consultant, etc."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
