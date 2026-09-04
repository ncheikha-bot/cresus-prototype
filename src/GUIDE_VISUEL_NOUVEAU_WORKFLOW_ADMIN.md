# Guide Visuel : Nouveau Workflow Admin Aligné sur le Client

## 🔄 Vue d'ensemble du parcours complet

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW COMPLET CLIENT + ADMIN                       │
└─────────────────────────────────────────────────────────────────────────┘

CÔTÉ CLIENT (WebCreateCompany)                  CÔTÉ ADMIN (AdminCompanySteps)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Étape 1: Informations entreprise
   ↓ (Formulaire complété)
👥 Étape 2: Répartition du capital
   ↓ (Associés ajoutés)
📄 Étape 3: Documents
   ↓ (Documents uploadés)
   ↓
   ↓ ═══════════════════════════════════════════════════════════════════════
   ↓                     SOUMISSION DU DOSSIER COMPLET                      
   ↓ ═══════════════════════════════════════════════════════════════════════
   ↓                                                   ↓
   ↓                                          📋 Étape 1: Dossier soumis
   ↓                                                   ↓ (Admin consulte les infos)
   ↓                                          👁️ Étape 2: Examen du dossier
   ↓                                                   ↓ (Admin valide les documents)
   ↓                                          💰 Étape 3: Devis d'immatriculation
   ↓                                                   ↓ (Admin crée et envoie le devis)
   ↓                                                   ↓
💳 Étape 4: Validation devis                          ↓
   ↓ ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ┘
   ↓ (Client valide le devis)                ✅ Étape 4: Validation devis
   ↓                                                   ↓ (Admin attend validation client)
   ↓ ═══════════════════════════════════════════════════════════════════════
   ↓                      DEVIS VALIDÉ - DÉBLOCAGE                          
   ↓ ═══════════════════════════════════════════════════════════════════════
   ↓                                                   ↓
💵 Étape 5: Versement capital                 🏦 Étape 5: Libération du capital
   ↓ (Client effectue le paiement)                    ↓ (Admin attend confirmation)
   ↓                                                   ↓
📑 Étape 6: Validation statuts                📑 Étape 6: Validation statuts
   ↓ ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ┘
   ↓ (Client valide les statuts)                      ↓ (Admin génère et envoie les statuts)
   ↓                                                   ↓
✍️ Étape 7: Signature                         ✍️ Étape 7: Signature et finalisation
   ↓ (Client signe électroniquement                   ↓ (Admin upload documents officiels
   ↓  ou en rendez-vous physique)                     ↓  et finalise la société)
   ↓                                                   ↓
✅ ENTREPRISE CRÉÉE                           ✅ SOCIÉTÉ FINALISÉE
```

## 📊 Détail des 7 étapes Admin

### Étape 1 : 📋 Dossier soumis

**Description :** Informations complètes reçues du client

**Côté client :** Formulaire et documents soumis

**Action admin :** Consulter le dossier complet

**Fonctionnalités :**
- 👁️ Bouton "Consulter le dossier complet"
- Affiche dans une modale :
  - 🏢 Informations entreprise (nom, forme juridique, activité, capital, siège)
  - 👤 Représentant légal (nom, prénom, email, téléphone, adresse)
  - 📄 Documents justificatifs uploadés
  - 🗓️ Chronologie du dossier

**Statut :** ✅ Complété automatiquement (dossier soumis)

---

### Étape 2 : 👁️ Examen du dossier

**Description :** Vérification et validation des documents

**Côté client :** En attente de validation

**Action admin :** Valider les documents

**Fonctionnalités :**
- 📋 Interface de validation des documents
- ✅ Bouton "Valider" pour chaque document
- ❌ Bouton "Rejeter" avec motif de rejet
- 📝 Notification envoyée au client en cas de rejet

**Statut :** 🔄 En cours jusqu'à validation de tous les documents

---

### Étape 3 : 💰 Devis d'immatriculation

**Description :** Création et envoi du devis

**Côté client :** En attente du devis / Devis reçu / Devis validé ✓

**Action admin :** Créer et envoyer le devis / Devis envoyé ✓

**Fonctionnalités :**
- 📝 Formulaire de création du devis
  - Frais d'enregistrement
  - Frais juridiques
  - Frais de publication
  - Droits de timbre
  - Frais administratifs
- 🧮 Calcul automatique du total
- 📧 Envoi au client pour validation

**Statut :** 🔄 En cours jusqu'à envoi du devis

---

### Étape 4 : ✅ Validation devis

**Description :** Validation du devis par le client

**Côté client :** En attente de validation / Devis validé ✓

**Action admin :** En attente du client / Devis validé par le client ✓

**Fonctionnalités :**
- ⏸️ Étape en attente passive (c'est au client d'agir)
- 🚫 **BLOQUÉE** tant que le client n'a pas validé le devis
- ⚠️ Alerte orange : "En attente du client"

**Statut :** ⏸️ Bloquée → ✅ Débloquée dès validation du devis

---

### Étape 5 : 🏦 Libération du capital

**Description :** Versement du capital social

**Côté client :** Paiement en attente

**Action admin :** Attendre la confirmation de paiement

**Fonctionnalités :**
- ⏸️ Étape en attente passive
- 🚫 **BLOQUÉE** tant que le devis n'est pas validé
- 💳 Confirmation du paiement par le client

**Statut :** ⏸️ Bloquée → 🔄 En attente → ✅ Complétée

---

### Étape 6 : 📑 Validation statuts

**Description :** Génération et validation des statuts

**Côté client :** 
- En attente des statuts
- En attente de validation client
- Statuts rejetés - V{X} à envoyer
- Statuts validés ✓

**Action admin :** 
- Générer et envoyer les statuts
- Statuts V{X} envoyés
- Corriger et envoyer V{X+1}
- En attente de signature

**Fonctionnalités :**
- 📄 Upload des statuts PDF
- ✍️ Génération automatique de la déclaration sur l'honneur
- 📧 Envoi simultané au client
- 🔄 Gestion des versions (V1, V2, V3...)
- ✅ Validation ou ❌ Rejet par le client avec motif
- 📅 Validation du rendez-vous physique OU
- 💻 Réception de la signature électronique

**Statut :** 🔄 En cours jusqu'à validation client et signature

---

### Étape 7 : ✍️ Signature et finalisation

**Description :** Signature finale et documents officiels

**Côté client :** En attente de finalisation / Société créée ✓

**Action admin :** 
- En attente de signature
- Finaliser et uploader documents officiels
- Documents officiels uploadés ✓

**Fonctionnalités :**
- 📄 Upload des documents officiels :
  - 🏛️ Certificat d'immatriculation RCCM
  - 📜 Statuts signés et enregistrés
  - 🆔 Attestation NINEA
  - 💰 Attestation de dépôt de capital
- ✅ Bouton "Finaliser la société"
- 🎉 Notification au client : "Votre entreprise est créée !"

**Statut :** 🔄 En cours → ✅ Société finalisée

---

## 🎨 Codes couleurs des statuts

```
✅ COMPLÉTÉ      → Vert   (bg-green-50, border-green-200)
🔄 EN COURS      → Bleu   (bg-blue-50, border-blue-200)
⏸️ EN ATTENTE    → Gris   (bg-gray-50, border-gray-200)
🚫 BLOQUÉ        → Orange (bg-orange-50, border-orange-200)
❌ REJETÉ        → Rouge  (bg-red-50, border-red-200)
```

## 📱 Interface utilisateur

### Carte d'étape
```
┌────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────┐     │
│ │  [ICÔNE]  Étape X : Titre de l'étape         [⏱]   │
│ │           Description de l'étape                    │
│ └────────────────────────────────────────────────┘     │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────────┐       │
│  │  👥 Côté client  │  │  ⚠️ Action requise   │       │
│  │  Status client   │  │  Action admin        │       │
│  │                  │  │  [BOUTON D'ACTION]   │       │
│  └──────────────────┘  └──────────────────────┘       │
│                                                         │
│  ⚠️ [Alertes et notifications si nécessaire]          │
└────────────────────────────────────────────────────────┘
```

### Modale "Dossier soumis" (Étape 1)
```
┌─────────────────────────────────────────────────────┐
│  📋 Dossier soumis - Nom de l'entreprise        [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🏢 Informations de l'entreprise                   │
│  ┌─────────────────────────────────────────────┐   │
│  │ • Dénomination sociale : ...                │   │
│  │ • Forme juridique : ...                     │   │
│  │ • Secteur d'activité : ...                  │   │
│  │ • Capital social : ...                      │   │
│  │ • Siège social : ...                        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  👤 Représentant légal                             │
│  ┌─────────────────────────────────────────────┐   │
│  │ • Prénom : ...         • Nom : ...          │   │
│  │ • Email : ...          • Téléphone : ...    │   │
│  │ • Adresse : ...                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  📄 Documents justificatifs                        │
│  ┌─────────────────────────────────────────────┐   │
│  │ [📄] CNI du gérant           [Télécharger] │   │
│  │ [📄] Casier judiciaire       [Télécharger] │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  🗓️ Chronologie                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Date de création : ...                      │   │
│  │ Dernière mise à jour : ...                  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│              [FERMER LE DOSSIER]                    │
└─────────────────────────────────────────────────────┘
```

## 🎯 Points clés à retenir

1. **Le workflow admin commence après la soumission complète du dossier client**
   - Le client soumet : Infos entreprise + Associés + Documents (étapes 1-3)
   - L'admin reçoit un dossier complet et peut commencer le traitement

2. **Étape 1 = Point de départ de l'admin**
   - Toutes les informations sont accessibles via le bouton "Consulter le dossier complet"
   - L'admin a une vue complète avant de commencer l'examen

3. **Séparation claire des responsabilités**
   - Étapes 1-3 admin : L'admin agit (examen, création devis)
   - Étape 4 : Le client valide (étape bloquante)
   - Étapes 5-7 : Alternance admin/client

4. **Blocages logiques**
   - Étape 4 et 5 bloquées si le devis n'est pas validé
   - Impossible de passer à la libération du capital sans validation du devis

5. **Communication bidirectionnelle**
   - Chaque étape affiche ce que fait le client ET ce que fait l'admin
   - Visibilité totale sur l'état d'avancement

## 📚 Références

- Fichier principal : `/components/admin/AdminCompanySteps.tsx`
- Documentation complète : `/CHANGELOG_ADMIN_WORKFLOW_CLIENT_ALIGNMENT.md`
- Types TypeScript : `/types/index.ts`
- Workflow client : `/components/web/WebCreateCompany.tsx`
