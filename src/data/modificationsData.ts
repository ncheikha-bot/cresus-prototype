import {
  Settings,
  Timer,
  ArrowsLeftRight,
  Ban,
  BarChart3,
  Briefcase,
  ClipboardList,
  Crown,
  DollarSign,
  Hash,
  LinkSimple,
  MapPin,
  Note,
  Edit,
  RefreshCw,
  Scales,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from '../components/ui/icons';
import type { IconeCresus } from '../components/ui/icons';
// Types de sociétés
export type CompanyType = 'SARL' | 'SUARL' | 'SA_CA' | 'SA_AG' | 'SAS' | 'SASU' | 'SCI';

// Types de modifications
export interface ModificationType {
  id: string;
  label: string;
  icon: IconeCresus;
  availableFor: CompanyType[];
}

// Documents requis
export interface RequiredDocument {
  id: string;
  label: string;
  required: boolean; // true = obligatoire, false = conditionnel
  condition?: string; // condition d'affichage
}

// Informations requises à renseigner
export interface RequiredInfo {
  id: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required: boolean;
  condition?: string;
}

/**
 * Choix proposés par les champs de type `select`.
 *
 * Ils étaient écrits en dur dans le JSX des deux écrans : le récapitulatif de
 * fin de parcours, qui ne lit que la valeur enregistrée, affichait « bail » là
 * où le client avait choisi « Bail commercial ».
 */
export const CHOIX_PAR_CHAMP: Record<string, { value: string; label: string }[]> = {
  type_local: [
    { value: 'propriete', label: 'Propriété' },
    { value: 'bail', label: 'Bail commercial' },
    { value: 'domiciliation', label: 'Domiciliation' },
  ],
  modalite: [
    { value: 'numeraire', label: 'Apport en numéraire' },
    { value: 'nature', label: 'Apport en nature' },
    { value: 'incorporation', label: 'Incorporation de réserves' },
  ],
  type_operation: [
    { value: 'nomination', label: 'Nomination' },
    { value: 'revocation', label: 'Révocation' },
    { value: 'renouvellement', label: 'Renouvellement' },
  ],
  forme_future: [
    { value: 'SARL', label: 'SARL' },
    { value: 'SA', label: 'SA' },
    { value: 'SAS', label: 'SAS' },
    { value: 'SCI', label: 'SCI' },
  ],
  fonction: [
    { value: 'dg', label: 'Directeur Général' },
    { value: 'pdg', label: 'Président Directeur Général' },
  ],
};

/** Libellé d'une valeur de liste ; la valeur brute si le champ n'est pas une liste. */
export const getLibelleChoix = (champId: string, valeur: string): string =>
  CHOIX_PAR_CHAMP[champId]?.find(c => c.value === valeur)?.label ?? valeur;

// Base de données des modifications possibles par type de société
export const modificationsDatabase: Record<CompanyType, ModificationType[]> = {
  SARL: [
    { id: 'denomination', label: 'Changement de dénomination sociale', icon: Edit, availableFor: ['SARL'] },
    { id: 'objet_social', label: 'Modification de l\'objet social', icon: Target, availableFor: ['SARL'] },
    { id: 'siege_social', label: 'Transfert du siège social', icon: MapPin, availableFor: ['SARL'] },
    { id: 'augmentation_capital', label: 'Augmentation du capital', icon: TrendingUp, availableFor: ['SARL'] },
    { id: 'reduction_capital', label: 'Réduction du capital social', icon: TrendingDown, availableFor: ['SARL'] },
    { id: 'gerant', label: 'Nomination / Révocation du gérant', icon: User, availableFor: ['SARL'] },
    { id: 'pouvoirs_gerant', label: 'Modification des pouvoirs du gérant', icon: Scales, availableFor: ['SARL'] },
    { id: 'cession_parts', label: 'Cession de parts sociales', icon: RefreshCw, availableFor: ['SARL'] },
    { id: 'transformation', label: 'Transformation de la société', icon: ArrowsLeftRight, availableFor: ['SARL'] },
    { id: 'duree', label: 'Prorogation / Réduction de la durée', icon: Timer, availableFor: ['SARL'] },
    { id: 'fusion_scission', label: 'Fusion / Scission / Apport partiel', icon: LinkSimple, availableFor: ['SARL'] },
    { id: 'dissolution', label: 'Dissolution anticipée', icon: Ban, availableFor: ['SARL'] },
    { id: 'repartition_benefices', label: 'Modification répartition des bénéfices', icon: DollarSign, availableFor: ['SARL'] },
  ],
  SUARL: [
    { id: 'denomination', label: 'Changement de dénomination sociale', icon: Edit, availableFor: ['SUARL'] },
    { id: 'objet_social', label: 'Modification de l\'objet social', icon: Target, availableFor: ['SUARL'] },
    { id: 'siege_social', label: 'Transfert du siège social', icon: MapPin, availableFor: ['SUARL'] },
    { id: 'augmentation_capital', label: 'Augmentation du capital', icon: TrendingUp, availableFor: ['SUARL'] },
    { id: 'reduction_capital', label: 'Réduction du capital social', icon: TrendingDown, availableFor: ['SUARL'] },
    { id: 'gerant', label: 'Nomination / Changement de gérant', icon: User, availableFor: ['SUARL'] },
    { id: 'cession_parts', label: 'Cession de parts', icon: RefreshCw, availableFor: ['SUARL'] },
    { id: 'transformation', label: 'Transformation en SARL, SA, SAS, SCI', icon: ArrowsLeftRight, availableFor: ['SUARL'] },
    { id: 'duree', label: 'Prorogation / Réduction de la durée', icon: Timer, availableFor: ['SUARL'] },
    { id: 'dissolution', label: 'Dissolution anticipée', icon: Ban, availableFor: ['SUARL'] },
  ],
  SA_CA: [
    { id: 'denomination', label: 'Changement de dénomination sociale', icon: Edit, availableFor: ['SA_CA'] },
    { id: 'objet_social', label: 'Modification de l\'objet social', icon: Target, availableFor: ['SA_CA'] },
    { id: 'siege_social', label: 'Transfert du siège social', icon: MapPin, availableFor: ['SA_CA'] },
    { id: 'augmentation_capital', label: 'Augmentation du capital', icon: TrendingUp, availableFor: ['SA_CA'] },
    { id: 'reduction_capital', label: 'Réduction du capital social', icon: TrendingDown, availableFor: ['SA_CA'] },
    { id: 'duree', label: 'Modification de la durée', icon: Timer, availableFor: ['SA_CA'] },
    { id: 'president_ca', label: 'Nomination / Révocation Président du CA', icon: Briefcase, availableFor: ['SA_CA'] },
    { id: 'administrateurs', label: 'Nomination / Révocation administrateurs', icon: Users, availableFor: ['SA_CA'] },
    { id: 'nombre_administrateurs', label: 'Modification nombre d\'administrateurs', icon: Hash, availableFor: ['SA_CA'] },
    { id: 'dg_pdg', label: 'Nomination / Révocation DG ou PDG', icon: Crown, availableFor: ['SA_CA'] },
    { id: 'transformation', label: 'Transformation de la société', icon: ArrowsLeftRight, availableFor: ['SA_CA'] },
    { id: 'fusion_scission', label: 'Fusion / Scission / Apport partiel', icon: LinkSimple, availableFor: ['SA_CA'] },
    { id: 'commissaire_comptes', label: 'Changement de commissaire aux comptes', icon: BarChart3, availableFor: ['SA_CA'] },
    { id: 'dissolution', label: 'Dissolution anticipée', icon: Ban, availableFor: ['SA_CA'] },
    { id: 'fonctionnement', label: 'Modification modalités de fonctionnement', icon: Settings, availableFor: ['SA_CA'] },
  ],
  SA_AG: [
    { id: 'denomination', label: 'Changement de dénomination sociale', icon: Edit, availableFor: ['SA_AG'] },
    { id: 'objet_social', label: 'Modification de l\'objet social', icon: Target, availableFor: ['SA_AG'] },
    { id: 'siege_social', label: 'Transfert du siège social', icon: MapPin, availableFor: ['SA_AG'] },
    { id: 'augmentation_capital', label: 'Augmentation du capital', icon: TrendingUp, availableFor: ['SA_AG'] },
    { id: 'reduction_capital', label: 'Réduction du capital social', icon: TrendingDown, availableFor: ['SA_AG'] },
    { id: 'duree', label: 'Modification de la durée', icon: Timer, availableFor: ['SA_AG'] },
    { id: 'admin_general', label: 'Nomination / Révocation Administrateur Général', icon: Briefcase, availableFor: ['SA_AG'] },
    { id: 'commissaire_comptes', label: 'Nomination / Révocation Commissaires aux comptes', icon: BarChart3, availableFor: ['SA_AG'] },
    { id: 'transformation', label: 'Transformation de la société', icon: ArrowsLeftRight, availableFor: ['SA_AG'] },
    { id: 'fusion_scission', label: 'Fusion / Scission', icon: LinkSimple, availableFor: ['SA_AG'] },
    { id: 'dissolution', label: 'Dissolution anticipée', icon: Ban, availableFor: ['SA_AG'] },
    { id: 'fonctionnement', label: 'Modification clauses de fonctionnement', icon: Settings, availableFor: ['SA_AG'] },
  ],
  SAS: [
    { id: 'denomination', label: 'Changement de dénomination sociale', icon: Edit, availableFor: ['SAS'] },
    { id: 'objet_social', label: 'Modification de l\'objet social', icon: Target, availableFor: ['SAS'] },
    { id: 'siege_social', label: 'Transfert du siège social', icon: MapPin, availableFor: ['SAS'] },
    { id: 'augmentation_capital', label: 'Augmentation du capital', icon: TrendingUp, availableFor: ['SAS'] },
    { id: 'reduction_capital', label: 'Réduction du capital social', icon: TrendingDown, availableFor: ['SAS'] },
    { id: 'president', label: 'Nomination / Révocation du Président', icon: Briefcase, availableFor: ['SAS'] },
    { id: 'dirigeants', label: 'Nomination / Révocation autres dirigeants', icon: Users, availableFor: ['SAS'] },
    { id: 'statuts', label: 'Modification des statuts', icon: ClipboardList, availableFor: ['SAS'] },
    { id: 'transformation', label: 'Transformation de la société', icon: ArrowsLeftRight, availableFor: ['SAS'] },
    { id: 'fusion_scission', label: 'Fusion / Scission', icon: LinkSimple, availableFor: ['SAS'] },
    { id: 'dissolution', label: 'Dissolution anticipée', icon: Ban, availableFor: ['SAS'] },
    { id: 'repartition_benefices', label: 'Modification répartition des bénéfices', icon: DollarSign, availableFor: ['SAS'] },
  ],
  SASU: [
    { id: 'denomination', label: 'Changement de dénomination sociale', icon: Edit, availableFor: ['SASU'] },
    { id: 'objet_social', label: 'Modification de l\'objet social', icon: Target, availableFor: ['SASU'] },
    { id: 'siege_social', label: 'Transfert du siège social', icon: MapPin, availableFor: ['SASU'] },
    { id: 'augmentation_capital', label: 'Augmentation du capital', icon: TrendingUp, availableFor: ['SASU'] },
    { id: 'reduction_capital', label: 'Réduction du capital social', icon: TrendingDown, availableFor: ['SASU'] },
    { id: 'president', label: 'Nomination / Changement de Président', icon: Briefcase, availableFor: ['SASU'] },
    { id: 'transformation', label: 'Transformation de la société', icon: ArrowsLeftRight, availableFor: ['SASU'] },
    { id: 'duree', label: 'Prorogation / Réduction de la durée', icon: Timer, availableFor: ['SASU'] },
    { id: 'fusion_scission', label: 'Fusion / Scission / TUP', icon: LinkSimple, availableFor: ['SASU'] },
    { id: 'dissolution', label: 'Dissolution anticipée', icon: Ban, availableFor: ['SASU'] },
  ],
  SCI: [
    { id: 'denomination', label: 'Changement de dénomination sociale', icon: Edit, availableFor: ['SCI'] },
    { id: 'objet_social', label: 'Modification de l\'objet social', icon: Target, availableFor: ['SCI'] },
    { id: 'siege_social', label: 'Transfert du siège social', icon: MapPin, availableFor: ['SCI'] },
    { id: 'augmentation_capital', label: 'Augmentation du capital', icon: TrendingUp, availableFor: ['SCI'] },
    { id: 'reduction_capital', label: 'Réduction du capital social', icon: TrendingDown, availableFor: ['SCI'] },
    { id: 'cession_parts', label: 'Cession de parts sociales', icon: RefreshCw, availableFor: ['SCI'] },
    { id: 'gerant', label: 'Nomination / Révocation du gérant', icon: User, availableFor: ['SCI'] },
    { id: 'duree', label: 'Modification de la durée', icon: Timer, availableFor: ['SCI'] },
    { id: 'transformation', label: 'Transformation en société commerciale', icon: ArrowsLeftRight, availableFor: ['SCI'] },
    { id: 'fusion_scission', label: 'Fusion / Scission', icon: LinkSimple, availableFor: ['SCI'] },
    { id: 'dissolution', label: 'Dissolution anticipée', icon: Ban, availableFor: ['SCI'] },
    { id: 'clauses_statutaires', label: 'Modification clauses statutaires', icon: Note, availableFor: ['SCI'] },
  ],
};

// Documents requis par type de modification
export const requiredDocumentsByModification: Record<string, RequiredDocument[]> = {
  // Documents communs à toutes les modifications
  common_all: [
    { id: 'statuts', label: 'Statuts actuels', required: true },
    { id: 'ninea', label: 'NINEA', required: true },
    { id: 'rccm', label: 'Extrait RCCM', required: true },
  ],
  
  // Documents spécifiques SARL/SUARL
  common_sarl_suarl: [
    { id: 'pv_age_sarl', label: 'PV de l\'AGE', required: true, condition: 'SARL' },
    { id: 'decision_associe_suarl', label: 'Décision de l\'associé unique', required: true, condition: 'SUARL' },
    { id: 'cni_gerant_sarl', label: 'CNI/Passeport des gérants', required: true },
  ],
  
  // Documents spécifiques SA
  common_sa: [
    { id: 'pv_age_sa', label: 'PV de l\'AGE', required: true },
    { id: 'pv_ca_sa', label: 'PV du Conseil d\'Administration', required: false, condition: 'Changement CA/Président' },
    { id: 'cni_dirigeants_sa', label: 'CNI/Passeport des administrateurs/Président/DG', required: true },
  ],
  
  // Documents spécifiques SAS/SASU
  common_sas_sasu: [
    { id: 'pv_age_sas', label: 'PV de l\'AGE', required: true, condition: 'SAS' },
    { id: 'decision_associe_sasu', label: 'Décision de l\'associé unique', required: true, condition: 'SASU' },
    { id: 'statuts_maj_sas', label: 'Statuts mis à jour', required: true },
    { id: 'cni_president_sas', label: 'CNI/Passeport du Président', required: true },
  ],
  
  // Documents spécifiques SCI
  common_sci: [
    { id: 'pv_age_sci', label: 'PV de l\'AGE', required: true },
    { id: 'cni_gerant_sci', label: 'CNI/Passeport du gérant/associés', required: true },
  ],
  
  // Documents conditionnels par type de modification
  siege_social: [
    { id: 'justificatif_siege', label: 'Justificatif du siège (bail, titre foncier, attestation)', required: true },
  ],
  
  augmentation_capital: [
    { id: 'attestation_depot', label: 'Attestation de dépôt des fonds', required: false, condition: 'Augmentation en numéraire' },
    { id: 'rapport_commissaire_apports', label: 'Rapport du commissaire aux apports', required: false, condition: 'Apports en nature' },
  ],
  
  reduction_capital: [],
  
  gerant: [
    { id: 'cni_nouveaux', label: 'CNI/Passeport des nouveaux gérants', required: true },
  ],
  
  cession_parts: [
    { id: 'cni_nouveaux_associes', label: 'CNI/Passeport des nouveaux associés', required: true },
    { id: 'bilan_dgid', label: 'Bilan société visé par la DGID', required: false, condition: 'Société existant depuis au moins 2 ans' },
  ],
  
  fusion_scission: [
    { id: 'rapport_commissaire_comptes', label: 'Rapport du commissaire aux comptes', required: true },
    { id: 'rapport_commissaire_apports', label: 'Rapport du commissaire aux apports', required: false, condition: 'Apports en nature' },
  ],
  
  transformation: [
    { id: 'cni_nouveaux_dirigeants', label: 'CNI/Passeport des nouveaux dirigeants', required: false, condition: 'Si changement de dirigeants' },
  ],
};

// Fonction pour obtenir les documents requis selon la forme juridique et le type de modification
export const getRequiredDocuments = (
  companyType: CompanyType,
  modificationType: string
): RequiredDocument[] => {
  const docs: RequiredDocument[] = [];
  
  // Documents communs à tous
  docs.push(...requiredDocumentsByModification.common_all);
  
  // Documents selon la forme juridique
  if (companyType === 'SARL' || companyType === 'SUARL') {
    docs.push(...requiredDocumentsByModification.common_sarl_suarl);
  } else if (companyType === 'SA_CA' || companyType === 'SA_AG') {
    docs.push(...requiredDocumentsByModification.common_sa);
  } else if (companyType === 'SAS' || companyType === 'SASU') {
    docs.push(...requiredDocumentsByModification.common_sas_sasu);
  } else if (companyType === 'SCI') {
    docs.push(...requiredDocumentsByModification.common_sci);
  }
  
  // Documents spécifiques au type de modification
  const specificDocs = requiredDocumentsByModification[modificationType];
  if (specificDocs) {
    docs.push(...specificDocs);
  }
  
  // Éliminer les doublons basés sur l'ID
  const uniqueDocs = docs.filter((doc, index, self) =>
    index === self.findIndex((d) => d.id === doc.id)
  );
  
  return uniqueDocs;
};

// Fonction pour obtenir les modifications disponibles selon la forme juridique
export const getAvailableModifications = (companyType: CompanyType): ModificationType[] => {
  return modificationsDatabase[companyType] || [];
};

// Fonction pour vérifier si le bilan DGID est requis pour une cession de parts
export const isBilanDGIDRequired = (
  modificationType: string,
  companyCreationDate?: string
): boolean => {
  // Le bilan DGID n'est requis QUE pour les cessions de parts
  if (modificationType !== 'cession_parts') {
    return false;
  }

  // Si pas de date de création fournie, on considère que ce n'est pas requis
  if (!companyCreationDate) {
    return false;
  }

  // Calculer l'ancienneté de la société (en années)
  const creationDate = new Date(companyCreationDate);
  const today = new Date();
  const ageInYears = (today.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  // Le bilan DGID est requis uniquement si la société existe depuis au moins 2 ans
  return ageInYears >= 2;
};

// Fonction pour obtenir les documents requis avec vérification dynamique du bilan DGID
export const getRequiredDocumentsWithBilanCheck = (
  companyType: CompanyType,
  modificationType: string,
  companyCreationDate?: string
): RequiredDocument[] => {
  let docs = getRequiredDocuments(companyType, modificationType);

  // Si c'est une cession de parts, ajuster le statut du bilan DGID
  if (modificationType === 'cession_parts') {
    const bilanRequired = isBilanDGIDRequired(modificationType, companyCreationDate);
    
    docs = docs.map(doc => {
      if (doc.id === 'bilan_dgid') {
        return {
          ...doc,
          required: bilanRequired,
          condition: bilanRequired 
            ? 'Obligatoire (société existant depuis au moins 2 ans)' 
            : 'Non requis (société existant depuis moins de 2 ans)'
        };
      }
      return doc;
    });
  }

  return docs;
};

// Informations requises à renseigner par type de modification
export const requiredInfoByModification: Record<string, RequiredInfo[]> = {
  denomination: [
    { id: 'nouvelle_denomination', label: 'Nouvelle dénomination sociale', type: 'text', placeholder: 'Ex: SARL NOUVELLE ENTREPRISE', required: true },
    { id: 'motif', label: 'Motif du changement', type: 'textarea', placeholder: 'Expliquez brièvement les raisons...', required: true },
  ],
  
  objet_social: [
    { id: 'nouvel_objet', label: 'Nouvel objet social', type: 'textarea', placeholder: 'Décrivez en détail les nouvelles activités...', required: true },
    { id: 'motif', label: 'Motif de la modification', type: 'textarea', placeholder: 'Justifiez cette modification...', required: true },
  ],
  
  siege_social: [
    { id: 'nouvelle_adresse', label: 'Nouvelle adresse complète du siège', type: 'textarea', placeholder: 'Ex: Villa n°25, Cité Keur Gorgui, Mermoz, Dakar', required: true },
    { id: 'date_transfert', label: 'Date effective du transfert', type: 'date', required: true },
    { id: 'type_local', label: 'Type de local', type: 'select', required: true },
    { id: 'commune', label: 'Commune/Département', type: 'text', placeholder: 'Ex: Dakar, Pikine, Thiès...', required: true },
  ],
  
  augmentation_capital: [
    { id: 'montant_actuel', label: 'Capital social actuel (FCFA)', type: 'number', placeholder: '1000000', required: true },
    { id: 'montant_augmentation', label: 'Montant de l\'augmentation (FCFA)', type: 'number', placeholder: '500000', required: true },
    { id: 'nouveau_capital', label: 'Nouveau capital social (FCFA)', type: 'number', placeholder: '1500000', required: true },
    { id: 'modalite', label: 'Modalité d\'augmentation', type: 'select', required: true },
  ],
  
  reduction_capital: [
    { id: 'montant_actuel', label: 'Capital social actuel (FCFA)', type: 'number', placeholder: '1000000', required: true },
    { id: 'montant_reduction', label: 'Montant de la réduction (FCFA)', type: 'number', placeholder: '300000', required: true },
    { id: 'nouveau_capital', label: 'Nouveau capital social (FCFA)', type: 'number', placeholder: '700000', required: true },
    { id: 'motif', label: 'Motif de la réduction', type: 'textarea', placeholder: 'Justifiez cette réduction...', required: true },
  ],
  
  gerant: [
    { id: 'type_operation', label: 'Type d\'opération', type: 'select', required: true },
    { id: 'nom_prenom_sortant', label: 'Nom et prénom du gérant sortant', type: 'text', required: false, condition: 'Si révocation' },
    { id: 'nom_prenom_entrant', label: 'Nom et prénom du nouveau gérant', type: 'text', placeholder: 'Ex: Mamadou DIOP', required: true },
    { id: 'cni_entrant', label: 'N° CNI/Passeport du nouveau gérant', type: 'text', placeholder: 'Ex: 1 234 567 890 123 4 (format CNI sénégalais)', required: true },
    { id: 'date_prise_fonction', label: 'Date de prise de fonction', type: 'date', required: true },
  ],
  
  pouvoirs_gerant: [
    { id: 'nom_prenom', label: 'Nom et prénom du gérant concerné', type: 'text', required: true },
    { id: 'nouveaux_pouvoirs', label: 'Description des nouveaux pouvoirs', type: 'textarea', placeholder: 'Décrivez en détail les pouvoirs modifiés...', required: true },
  ],
  
  cession_parts: [
    { id: 'cedant_nom', label: 'Nom et prénom du cédant', type: 'text', placeholder: 'Ex: Fatou SARR', required: true },
    { id: 'cessionnaire_nom', label: 'Nom et prénom du cessionnaire', type: 'text', placeholder: 'Ex: Ousmane KANE', required: true },
    { id: 'nombre_parts', label: 'Nombre de parts cédées', type: 'number', placeholder: '50', required: true },
    { id: 'prix_cession', label: 'Prix de cession (FCFA)', type: 'number', placeholder: '1000000', required: true },
    { id: 'date_cession', label: 'Date de cession', type: 'date', required: true },
  ],
  
  transformation: [
    { id: 'forme_actuelle', label: 'Forme juridique actuelle', type: 'text', required: true },
    { id: 'forme_future', label: 'Nouvelle forme juridique', type: 'select', required: true },
    { id: 'motif', label: 'Motif de la transformation', type: 'textarea', placeholder: 'Justifiez cette transformation...', required: true },
  ],
  
  duree: [
    { id: 'duree_actuelle', label: 'Durée actuelle (années)', type: 'number', placeholder: '99', required: true },
    { id: 'nouvelle_duree', label: 'Nouvelle durée (années)', type: 'number', placeholder: '50', required: true },
    { id: 'date_echeance', label: 'Nouvelle date d\'échéance', type: 'date', required: true },
  ],
  
  fusion_scission: [
    { id: 'type_operation', label: 'Type d\'opération', type: 'select', required: true },
    { id: 'societe_concernee', label: 'Société concernée par l\'opération', type: 'text', placeholder: 'Nom et RCCM', required: true },
    { id: 'date_operation', label: 'Date effective de l\'opération', type: 'date', required: true },
  ],
  
  dissolution: [
    { id: 'date_dissolution', label: 'Date de dissolution', type: 'date', required: true },
    { id: 'motif', label: 'Motif de la dissolution', type: 'textarea', placeholder: 'Expliquez les raisons de cette dissolution...', required: true },
    { id: 'liquidateur_nom', label: 'Nom et prénom du liquidateur', type: 'text', placeholder: 'Ex: Ibrahima NDIAYE', required: true },
  ],
  
  repartition_benefices: [
    { id: 'nouvelle_repartition', label: 'Nouvelle répartition des bénéfices', type: 'textarea', placeholder: 'Décrivez en détail la nouvelle clé de répartition...', required: true },
  ],
  
  president: [
    { id: 'type_operation', label: 'Type d\'opération', type: 'select', required: true },
    { id: 'nom_prenom_sortant', label: 'Nom et prénom du Président sortant', type: 'text', required: false, condition: 'Si révocation' },
    { id: 'nom_prenom_entrant', label: 'Nom et prénom du nouveau Président', type: 'text', placeholder: 'Ex: Awa DIALLO', required: true },
    { id: 'cni_entrant', label: 'N° CNI/Passeport du nouveau Président', type: 'text', placeholder: 'Ex: 1234567890123', required: true },
    { id: 'date_prise_fonction', label: 'Date de prise de fonction', type: 'date', required: true },
  ],
  
  president_ca: [
    { id: 'type_operation', label: 'Type d\'opération', type: 'select', required: true },
    { id: 'nom_prenom_sortant', label: 'Nom et prénom du Président du CA sortant', type: 'text', required: false, condition: 'Si révocation' },
    { id: 'nom_prenom_entrant', label: 'Nom et prénom du nouveau Président du CA', type: 'text', placeholder: 'Ex: Cheikh SY', required: true },
    { id: 'cni_entrant', label: 'N° CNI/Passeport du nouveau Président', type: 'text', required: true },
    { id: 'date_prise_fonction', label: 'Date de prise de fonction', type: 'date', required: true },
  ],
  
  administrateurs: [
    { id: 'type_operation', label: 'Type d\'opération', type: 'select', required: true },
    { id: 'administrateurs_sortants', label: 'Administrateurs sortants (noms)', type: 'textarea', required: false, condition: 'Si révocation' },
    { id: 'administrateurs_entrants', label: 'Nouveaux administrateurs (noms et CNI)', type: 'textarea', placeholder: 'Nom, Prénom, N° CNI de chaque administrateur...', required: true },
  ],
  
  nombre_administrateurs: [
    { id: 'nombre_actuel', label: 'Nombre actuel d\'administrateurs', type: 'number', placeholder: '3', required: true },
    { id: 'nouveau_nombre', label: 'Nouveau nombre d\'administrateurs', type: 'number', placeholder: '5', required: true },
  ],
  
  dg_pdg: [
    { id: 'fonction', label: 'Fonction', type: 'select', required: true },
    { id: 'nom_prenom_sortant', label: 'Nom et prénom du sortant', type: 'text', required: false, condition: 'Si révocation' },
    { id: 'nom_prenom_entrant', label: 'Nom et prénom du nouvel élu', type: 'text', placeholder: 'Ex: Moussa FALL', required: true },
    { id: 'cni_entrant', label: 'N° CNI/Passeport', type: 'text', required: true },
  ],
  
  admin_general: [
    { id: 'type_operation', label: 'Type d\'opération', type: 'select', required: true },
    { id: 'nom_prenom_sortant', label: 'Nom et prénom de l\'Administrateur Général sortant', type: 'text', required: false, condition: 'Si révocation' },
    { id: 'nom_prenom_entrant', label: 'Nom et prénom du nouvel Administrateur Général', type: 'text', required: true },
    { id: 'cni_entrant', label: 'N° CNI/Passeport', type: 'text', required: true },
  ],
  
  commissaire_comptes: [
    { id: 'type_operation', label: 'Type d\'opération', type: 'select', required: true },
    { id: 'nom_cabinet_sortant', label: 'Cabinet sortant', type: 'text', required: false, condition: 'Si changement' },
    { id: 'nom_cabinet_entrant', label: 'Nouveau cabinet de commissariat', type: 'text', placeholder: 'Nom du cabinet', required: true },
    { id: 'numero_inscription', label: 'N° d\'inscription à l\'ONECCA', type: 'text', required: true },
  ],
  
  dirigeants: [
    { id: 'type_operation', label: 'Type d\'opération', type: 'select', required: true },
    { id: 'dirigeants_sortants', label: 'Dirigeants sortants', type: 'textarea', required: false, condition: 'Si révocation' },
    { id: 'dirigeants_entrants', label: 'Nouveaux dirigeants (noms, fonctions, CNI)', type: 'textarea', placeholder: 'Détaillez chaque dirigeant...', required: true },
  ],
  
  statuts: [
    { id: 'articles_modifies', label: 'Articles des statuts modifiés', type: 'textarea', placeholder: 'Listez les numéros d\'articles concernés...', required: true },
    { id: 'nature_modifications', label: 'Nature des modifications', type: 'textarea', placeholder: 'Décrivez en détail les modifications apportées...', required: true },
  ],
  
  fonctionnement: [
    { id: 'clauses_modifiees', label: 'Clauses modifiées', type: 'textarea', placeholder: 'Listez les clauses concernées...', required: true },
    { id: 'nouvelles_modalites', label: 'Nouvelles modalités', type: 'textarea', placeholder: 'Décrivez les nouvelles modalités...', required: true },
  ],
  
  clauses_statutaires: [
    { id: 'clauses_modifiees', label: 'Clauses statutaires modifiées', type: 'textarea', placeholder: 'Listez les clauses concernées...', required: true },
    { id: 'nouvelles_clauses', label: 'Nouvelles dispositions', type: 'textarea', placeholder: 'Texte des nouvelles clauses...', required: true },
  ],
};

// Fonction pour obtenir les informations requises selon le type de modification
export const getRequiredInfo = (modificationType: string): RequiredInfo[] => {
  return requiredInfoByModification[modificationType] || [];
};