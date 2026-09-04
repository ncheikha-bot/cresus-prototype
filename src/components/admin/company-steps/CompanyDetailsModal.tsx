import React from 'react';
import { Building, Clock, Download, FileText, Info, Upload, Users } from '../../ui/icons';
import { ModalShell } from './ModalShell';
import type { Company } from '../../../types';
import type { AdminDocument } from './DocumentPreviewModal';

interface CompanyDetailsModalProps {
  company: Company;
  documents: AdminDocument[];
  onClose: () => void;
}

/** Récapitulatif complet du dossier soumis par le client. */
export const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
  company,
  documents,
  onClose,
}) => (
  <ModalShell
    animationKey="company-details-modal"
    title={`Dossier — ${company.name}`}
    icon={Building}
    onClose={onClose}
    maxWidth="max-w-4xl"
    footer={
      <>
      <button
        onClick={() => onClose()}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] w-full px-6 py-3 bg-gradient-to-r from-[#1A2753] to-[#273A7A] text-white rounded-xl hover:shadow-lg transition-all duration-300"
      >
        Fermer
      </button>
      </>
    }
  >
    <div className="p-6">
      {/* Informations de l'entreprise */}
      <div className="bg-[#F5F6FA] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-[#D6A93A]" />
          <h3 className="text-[#1A2753] font-semibold">Informations de l'entreprise</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#273A7A]/80 mb-1">Dénomination sociale</p>
            <p className="text-sm text-[#1A2753] font-medium">{company.name}</p>
          </div>
          <div>
            <p className="text-xs text-[#273A7A]/80 mb-1">Forme juridique</p>
            <p className="text-sm text-[#1A2753] font-medium">{company.legalForm}</p>
          </div>
          <div>
            <p className="text-xs text-[#273A7A]/80 mb-1">Secteur d'activité</p>
            <p className="text-sm text-[#1A2753] font-medium">{company.activity}</p>
          </div>
          <div>
            <p className="text-xs text-[#273A7A]/80 mb-1">Capital social</p>
            <p className="text-sm text-[#1A2753] font-medium">
              {company.capital?.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-[#273A7A]/80 mb-1">Siège social</p>
            <p className="text-sm text-[#1A2753] font-medium">{company.address || 'Non renseigné'}</p>
          </div>
        </div>
      </div>

      {/* Représentant légal */}
      {company.legalRepresentative && (
        <div className="bg-[#F5F6FA] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#D6A93A]" />
            <h3 className="text-[#1A2753] font-semibold">Représentant légal</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#273A7A]/80 mb-1">Prénom</p>
              <p className="text-sm text-[#1A2753] font-medium">{company.legalRepresentative.firstName}</p>
            </div>
            <div>
              <p className="text-xs text-[#273A7A]/80 mb-1">Nom</p>
              <p className="text-sm text-[#1A2753] font-medium">{company.legalRepresentative.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-[#273A7A]/80 mb-1">Email</p>
              <p className="text-sm text-[#1A2753] font-medium">{company.legalRepresentative.email}</p>
            </div>
            <div>
              <p className="text-xs text-[#273A7A]/80 mb-1">Téléphone</p>
              <p className="text-sm text-[#1A2753] font-medium">{company.legalRepresentative.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-[#273A7A]/80 mb-1">Adresse</p>
              <p className="text-sm text-[#1A2753] font-medium">{company.legalRepresentative.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Associés / Actionnaires */}
      {company.shareholders && company.shareholders.length > 0 && (
        <div className="bg-[#F5F6FA] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D6A93A]" />
              <h3 className="text-[#1A2753] font-semibold">Associés ({company.shareholders.length})</h3>
            </div>
            <div className="px-3 py-1 bg-[#D6A93A]/10 rounded-lg">
              <p className="text-xs text-[#D6A93A] font-medium">
                Capital total : {company.capital?.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {company.shareholders.map((shareholder) => (
              <div key={shareholder.id} className="bg-white rounded-xl p-4 border-2 border-[#273A7A]/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[#1A2753] font-semibold">
                        {shareholder.firstName} {shareholder.lastName}
                      </p>
                      {shareholder.isManager && (
                        <span className="px-2 py-0.5 bg-[#D6A93A] text-white text-[10px] rounded-full font-medium">
                          GÉRANT
                        </span>
                      )}
                    </div>
                    {shareholder.profession && (
                      <p className="text-xs text-[#273A7A]/80">{shareholder.profession}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#D6A93A] font-bold">{shareholder.percentage}%</p>
                    <p className="text-xs text-[#273A7A]/80">{parseInt(shareholder.amount).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {shareholder.email && (
                    <div>
                      <p className="text-[10px] text-[#273A7A]/80 mb-0.5">Email</p>
                      <p className="text-xs text-[#1A2753]">{shareholder.email}</p>
                    </div>
                  )}
                  {shareholder.phone && (
                    <div>
                      <p className="text-[10px] text-[#273A7A]/80 mb-0.5">Téléphone</p>
                      <p className="text-xs text-[#1A2753]">{shareholder.phone}</p>
                    </div>
                  )}
                  {shareholder.address && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-[#273A7A]/80 mb-0.5">Adresse</p>
                      <p className="text-xs text-[#1A2753]">{shareholder.address}</p>
                    </div>
                  )}
                  {shareholder.maritalStatus && (
                    <div>
                      <p className="text-[10px] text-[#273A7A]/80 mb-0.5">Situation matrimoniale</p>
                      <p className="text-xs text-[#1A2753]">
                        {shareholder.maritalStatus === 'single' && 'Célibataire'}
                        {shareholder.maritalStatus === 'married' && 'Marié(e)'}
                        {shareholder.maritalStatus === 'divorced' && 'Divorcé(e)'}
                        {shareholder.maritalStatus === 'widowed' && 'Veuf(ve)'}
                      </p>
                    </div>
                  )}
                  {shareholder.matrimonialRegime && (
                    <div>
                      <p className="text-[10px] text-[#273A7A]/80 mb-0.5">Régime matrimonial</p>
                      <p className="text-xs text-[#1A2753]">
                        {shareholder.matrimonialRegime === 'community' ? 'Communauté de biens' : 'Séparation de biens'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Info conjoint si marié */}
                {shareholder.spouseInfo && (
                  <div className="mt-3 pt-3 border-t border-[#273A7A]/10">
                    <p className="text-xs text-[#273A7A]/80 mb-2 font-medium">Informations du conjoint</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] text-[#273A7A]/80 mb-0.5">Nom complet</p>
                        <p className="text-xs text-[#1A2753]">
                          {shareholder.spouseInfo.firstName} {shareholder.spouseInfo.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#273A7A]/80 mb-0.5">Date de naissance</p>
                        <p className="text-xs text-[#1A2753]">
                          {new Date(shareholder.spouseInfo.birthDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-[#273A7A]/80 mb-0.5">Profession</p>
                        <p className="text-xs text-[#1A2753]">{shareholder.spouseInfo.profession}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Récapitulatif du capital */}
          <div className="mt-4 bg-gradient-to-r from-[#1A2753] to-[#273A7A] rounded-xl p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-xs text-white/70 mb-1">Répartition du capital</p>
                <p className="text-sm">
                  {company.shareholders.length} associé{company.shareholders.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70 mb-1">Total</p>
                <p className="text-lg font-bold text-[#D6A93A]">
                  {company.shareholders.reduce((sum, s) => sum + parseInt(s.amount), 0).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents soumis */}
      <div className="bg-[#F5F6FA] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-[#D6A93A]" />
          <h3 className="text-[#1A2753] font-semibold">Documents justificatifs</h3>
        </div>
        {company.documents && company.documents.length > 0 ? (
          <div className="space-y-2">
            {company.documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#273A7A]" />
                  <div>
                    <p className="text-sm text-[#1A2753] font-medium">{doc.name}</p>
                    <p className="text-xs text-[#273A7A]/80">
                      Type : {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A2753] px-3 py-1.5 bg-[#273A7A] text-white text-xs rounded-lg hover:bg-[#1A2753] transition-all flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  Télécharger
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <FileText className="w-10 h-10 text-[#273A7A]/30 mx-auto mb-2" />
            <p className="text-sm text-[#273A7A]/80">Aucun document soumis pour le moment</p>
          </div>
        )}
      </div>

      {/* Déclaration sur l'honneur */}
      {company.useHonorDeclaration && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                Déclaration sur l'honneur
              </p>
              <p className="text-xs text-blue-700">
                Le client a choisi d'utiliser une déclaration sur l'honneur au lieu du casier judiciaire.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dates importantes */}
      <div className="bg-[#F5F6FA] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#D6A93A]" />
          <h3 className="text-[#1A2753] font-semibold">Chronologie</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#273A7A]">Date de création du dossier</p>
            <p className="text-sm text-[#1A2753] font-medium">
              {new Date(company.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#273A7A]">Dernière mise à jour</p>
            <p className="text-sm text-[#1A2753] font-medium">
              {new Date(company.updatedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  </ModalShell>
);
