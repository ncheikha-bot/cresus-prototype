# 📄 Guide des Documents Bancaires - Crésus V2

## Vue d'ensemble

Le système de demande d'ouverture de compte bancaire de Crésus V2 transmet automatiquement tous les documents officiels requis aux banques partenaires. Ce guide détaille les documents transmis et leur gestion.

## Documents transmis automatiquement

### Documents communs à toutes les formes juridiques

1. **Statuts de la société**
   - Type : `statuts`
   - Contenu : Statuts signés et enregistrés
   - Référence : Numéro d'enregistrement des statuts

2. **Registre de Commerce et du Crédit Mobilier (RCCM)**
   - Type : `rccm`
   - Contenu : Extrait RCCM officiel
   - Référence : Numéro RCCM (format: SN-DKR-YYYY-B-XXXXX)

3. **NINEA**
   - Type : `ninea`
   - Contenu : Numéro d'Identification National des Entreprises et Associations
   - Référence : Numéro NINEA (10 chiffres)

4. **Procès-Verbal d'Assemblée Générale Constitutive**
   - Type : `pv_ag`
   - Contenu : PV de l'AG constitutive signée
   - Date d'émission : Date de constitution

5. **CNI du Gérant/Représentant légal**
   - Type : `cni_gerant`
   - Contenu : Copie carte nationale d'identité en cours de validité
   - Référence : Numéro CNI (13 chiffres)

6. **Certificat de Dépôt de Capital**
   - Type : `certificat_capital`
   - Contenu : Attestation de libération du capital
   - Référence : Numéro de certificat

7. **Justificatif de Domiciliation**
   - Type : `justificatif_domiciliation`
   - Contenu : Contrat de domiciliation ou bail commercial
   - Référence : Référence domiciliation

8. **Déclaration de Conformité**
   - Type : `declaration_conformite`
   - Contenu : Déclaration de conformité fiscale
   - Date d'émission : Date de déclaration

### Documents spécifiques selon la forme juridique

#### SA (Société Anonyme) et SAS (Société par Actions Simplifiée)

9. **Liste des Actionnaires**
   - Type : `liste_actionnaires`
   - Contenu : Liste complète avec répartition du capital
   - Date : Date de l'AG constitutive

10. **Attestation Fiscale**
    - Type : `attestation_fiscale`
    - Contenu : Attestation fiscale en cours de validité
    - Référence : Numéro d'attestation

#### SCI (Société Civile Immobilière)

9. **Liste des Associés**
   - Type : `liste_actionnaires`
   - Contenu : Liste des associés avec parts sociales
   - Date : Date de constitution

## Structure des données

### Interface TransferredDocument

```typescript
interface TransferredDocument {
  id: string;                    // Identifiant unique du document
  name: string;                  // Nom descriptif du document
  type: DocumentType;            // Type du document (voir ci-dessous)
  size: string;                  // Taille du fichier (ex: "2.4 MB")
  uploadedAt: string;            // Date/heure de transmission (ISO 8601)
  issuedDate?: string;           // Date d'émission du document officiel
  referenceNumber?: string;      // Numéro de référence (RCCM, NINEA, etc.)
  url?: string;                  // URL du document (optionnel)
}
```

### Types de documents

```typescript
type DocumentType = 
  | 'statuts'
  | 'rccm'
  | 'ninea'
  | 'pv_ag'
  | 'cni_gerant'
  | 'certificat_capital'
  | 'justificatif_domiciliation'
  | 'liste_actionnaires'
  | 'attestation_fiscale'
  | 'declaration_conformite';
```

## Exemples de données

### Exemple 1 : SARL (8 documents)

```typescript
{
  id: 'bank-req-1',
  companyId: '1',
  documents: [
    {
      id: 'doc-1-1',
      name: 'Statuts de la société Teranga Digital SARL',
      type: 'statuts',
      size: '2.4 MB',
      uploadedAt: '2025-11-04T08:45:00Z',
      issuedDate: '2024-03-15',
      referenceNumber: 'STAT-2024-TER-001',
    },
    // ... 7 autres documents
  ]
}
```

### Exemple 2 : SA (9 documents)

```typescript
{
  id: 'bank-req-2',
  companyId: '2',
  documents: [
    // 8 documents communs
    {
      id: 'doc-2-8',
      name: 'Liste des Actionnaires',
      type: 'liste_actionnaires',
      size: '856 KB',
      uploadedAt: '2025-11-03T10:15:00Z',
      issuedDate: '2023-06-01',
    },
    {
      id: 'doc-2-9',
      name: 'Attestation Fiscale',
      type: 'attestation_fiscale',
      size: '634 KB',
      uploadedAt: '2025-11-03T10:15:00Z',
      issuedDate: '2023-06-08',
      referenceNumber: 'ATT-FISC-2023-5678',
    },
  ]
}
```

## Affichage dans l'interface

### Vue Mobile (BankRequestDetail.tsx)

- Section dédiée "Documents officiels transmis"
- Badge avec le nombre de documents
- Liste scrollable avec animations
- Icônes et métadonnées pour chaque document
- Bouton de téléchargement

### Vue Web (WebBankRequestDetail.tsx)

- Panneau dans la colonne de gauche
- Affichage compact avec scroll
- Effets hover pour les interactions
- Téléchargement au survol
- Affichage optimisé avec groupement visuel

## Validation et contrôles

### Côté client

✅ Tous les documents sont générés automatiquement lors de la création de l'entreprise
✅ Les références officielles (RCCM, NINEA) sont validées avant transmission
✅ Les CNI doivent être en cours de validité
✅ Les statuts doivent être signés

### Côté banque

Les banques peuvent :
- Consulter tous les documents transmis
- Télécharger les documents individuellement
- Demander des documents complémentaires via la messagerie
- Valider ou rejeter le dossier selon la conformité

## Cas d'usage

### Demande complète (approuvée)

```
1. Client soumet une demande
2. Documents transmis automatiquement (documentsTransferred: true)
3. Banque examine les documents
4. Si conformes → Statut: 'approved'
5. Programmation d'un rendez-vous
6. Finalisation du compte
```

### Demande incomplète (rejetée)

```
1. Client soumet une demande
2. Documents transmis mais certains non conformes
3. Banque demande des clarifications (status: 'documents_review')
4. Si problème persistant → Statut: 'rejected' avec raison
5. Client peut soumettre une nouvelle demande avec documents à jour
```

## Notifications

Les clients reçoivent des notifications automatiques à chaque étape :

- ✅ Documents transmis avec succès
- 🔍 Documents en cours d'examen
- ⚠️ Documents complémentaires requis
- ✅ Dossier approuvé
- 📅 Rendez-vous programmé
- 🎉 Compte bancaire actif

## Sécurité et confidentialité

- ✅ Transmission sécurisée via Crésus
- ✅ Accès restreint aux banques partenaires authentifiées
- ✅ Traçabilité complète (dates, références)
- ✅ Conformité RGPD et réglementations sénégalaises
- ⚠️ Pas de stockage de données sensibles (PII) sans consentement

## Améliorations futures

### Court terme
- [ ] Téléchargement PDF réel des documents
- [ ] Prévisualisation en ligne
- [ ] Signatures électroniques intégrées

### Moyen terme
- [ ] OCR automatique pour validation
- [ ] Vérification automatique des références officielles
- [ ] API intégration avec registres officiels (APIX, DGI)

### Long terme
- [ ] Blockchain pour traçabilité
- [ ] IA pour détection de fraude
- [ ] Intégration bancaire temps réel

## Support

Pour toute question concernant les documents transmis :
- Email : support@cresus.sn
- Téléphone : +221 XX XXX XX XX
- Chat en ligne : disponible 24/7

---

**Date de mise à jour** : 5 novembre 2025
**Version** : 2.0
**Auteur** : Équipe Crésus
