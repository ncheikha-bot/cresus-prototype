# Schéma Visuel ASCII : Nouveau Workflow Admin

```
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║                        🏢 CRÉSUS V2 - WORKFLOW ADMIN ALIGNÉ                          ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│                         📥 CLIENT SOUMET LE DOSSIER COMPLET                        │
│                                                                                     │
│         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│         │  Infos entreprise │  │  Associés/Capital │  │    Documents     │         │
│         │    (Étape 1)      │  │    (Étape 2)      │  │    (Étape 3)     │         │
│         └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        ↓
                                        ↓
╔═════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                     ║
║                         🚀 WORKFLOW ADMIN DÉMARRE ICI                              ║
║                                                                                     ║
╚═════════════════════════════════════════════════════════════════════════════════════╝


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ÉTAPE 1 : 📋 DOSSIER SOUMIS                                                      ┃
┃  ────────────────────────────────────────────────────────────────────────────────  ┃
┃  Description : Informations complètes reçues du client                            ┃
┃  Icône       : 📄 FileText                                                        ┃
┃  Statut      : ✅ Complété automatiquement                                        ┃
┃                                                                                    ┃
┃  👤 Côté client : Formulaire et documents soumis                                  ┃
┃  ⚙️  Action admin : [Consulter le dossier complet] ← BOUTON PRINCIPAL             ┃
┃                                                                                    ┃
┃  💡 Fonctionnalité :                                                               ┃
┃     → Modale avec toutes les infos (entreprise, représentant, documents)          ┃
┃     → Permet à l'admin de voir TOUT avant de commencer                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                        ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ÉTAPE 2 : 👁️  EXAMEN DU DOSSIER                                                  ┃
┃  ────────────────────────────────────────────────────────────────────────────────  ┃
┃  Description : Vérification et validation des documents                           ┃
┃  Icône       : 👁️ Eye                                                             ┃
┃  Statut      : 🔄 En cours                                                        ┃
┃                                                                                    ┃
┃  👤 Côté client : En attente de validation                                        ┃
┃  ⚙️  Action admin : [Valider les documents] ← VALIDATION REQUISE                  ┃
┃                                                                                    ┃
┃  💡 Fonctionnalité :                                                               ┃
┃     → Interface de validation/rejet de chaque document                            ┃
┃     → ✅ Valider ou ❌ Rejeter avec motif                                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                        ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ÉTAPE 3 : 💰 DEVIS D'IMMATRICULATION                                             ┃
┃  ────────────────────────────────────────────────────────────────────────────────  ┃
┃  Description : Création et envoi du devis                                         ┃
┃  Icône       : 💰 DollarSign                                                      ┃
┃  Statut      : 🔄 En cours                                                        ┃
┃                                                                                    ┃
┃  👤 Côté client : En attente du devis / Devis reçu / Devis validé ✓              ┃
┃  ⚙️  Action admin : [Créer et envoyer le devis] ← CRÉATION DEVIS                  ┃
┃                                                                                    ┃
┃  💡 Fonctionnalité :                                                               ┃
┃     → Formulaire avec frais (enregistrement, juridique, publication...)          ┃
┃     → Calcul automatique du total                                                 ┃
┃     → Envoi au client pour validation                                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                        ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ÉTAPE 4 : ✅ VALIDATION DEVIS                                                    ┃
┃  ────────────────────────────────────────────────────────────────────────────────  ┃
┃  Description : Validation du devis par le client                                  ┃
┃  Icône       : ✅ ClipboardCheck                                                  ┃
┃  Statut      : 🚫 BLOQUÉE (orange) → jusqu'à validation du client                ┃
┃                                                                                    ┃
┃  👤 Côté client : En attente de validation / Devis validé ✓                       ┃
┃  ⚙️  Action admin : En attente du client                                          ┃
┃                                                                                    ┃
┃  ⚠️  ÉTAPE CRITIQUE :                                                              ┃
┃     → 🔒 BLOQUE les étapes 5 et 6 tant que le client ne valide pas               ┃
┃     → 🟠 Alerte orange : "En attente du client"                                   ┃
┃     → ⏸️  Pas d'action admin possible (attente passive)                           ┃
┃     → ✅ Dès validation : déblocage automatique                                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                        ↓
                            ⚠️  VALIDATION CLIENT REQUISE
                                        ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ÉTAPE 5 : 🏦 LIBÉRATION DU CAPITAL                                               ┃
┃  ────────────────────────────────────────────────────────────────────────────────  ┃
┃  Description : Versement du capital social                                        ┃
┃  Icône       : 🏦 Landmark                                                        ┃
┃  Statut      : 🚫 BLOQUÉE si devis non validé → 🔄 En attente après validation   ┃
┃                                                                                    ┃
┃  👤 Côté client : Paiement en attente                                             ┃
┃  ⚙️  Action admin : Attendre la confirmation de paiement                          ┃
┃                                                                                    ┃
┃  💡 Fonctionnalité :                                                               ┃
┃     → Étape débloquée dès validation du devis                                     ┃
┃     → Admin attend la confirmation de paiement du client                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                        ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ÉTAPE 6 : 📑 VALIDATION STATUTS                                                  ┃
┃  ────────────────────────────────────────────────────────────────────────────────  ┃
┃  Description : Génération et validation des statuts                               ┃
┃  Icône       : 📑 FileCheck                                                       ┃
┃  Statut      : 🔄 En cours                                                        ┃
┃                                                                                    ┃
┃  👤 Côté client : En attente des statuts / Statuts validés ✓ / Statuts rejetés   ┃
┃  ⚙️  Action admin : [Générer et envoyer les statuts V1]                           ┃
┃                    [Corriger et envoyer V2] si rejet                              ┃
┃                    [Valider le RV] si demande de rendez-vous                      ┃
┃                                                                                    ┃
┃  💡 Fonctionnalités :                                                              ┃
┃     → Upload des statuts PDF + déclaration sur l'honneur                          ┃
┃     → Gestion des versions (V1, V2, V3...)                                        ┃
┃     → Validation ou rejet par le client                                           ┃
┃     → Choix de signature : 📅 RV physique OU 💻 Signature électronique            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                        ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ÉTAPE 7 : ✍️  SIGNATURE ET FINALISATION                                          ┃
┃  ────────────────────────────────────────────────────────────────────────────────  ┃
┃  Description : Signature finale et documents officiels                            ┃
┃  Icône       : ✍️ PenTool                                                         ┃
┃  Statut      : 🔄 En cours → ✅ Société finalisée                                 ┃
┃                                                                                    ┃
┃  👤 Côté client : En attente de finalisation / Société créée ✓                    ┃
┃  ⚙️  Action admin : [Finaliser et uploader documents officiels]                   ┃
┃                                                                                    ┃
┃  💡 Fonctionnalités :                                                              ┃
┃     → Upload des 4 documents officiels :                                          ┃
┃       • 🏛️ Certificat RCCM                                                        ┃
┃       • 📜 Statuts signés                                                          ┃
┃       • 🆔 Attestation NINEA                                                       ┃
┃       • 💰 Attestation dépôt capital                                              ┃
┃     → [Finaliser la société] → 🎉 Création terminée !                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                        ↓
╔═════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                     ║
║                         🎉 ENTREPRISE CRÉÉE ET FINALISÉE                           ║
║                                                                                     ║
╚═════════════════════════════════════════════════════════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│                           📊 LÉGENDE DES STATUTS                                   │
│                                                                                     │
│   ✅ COMPLÉTÉ       → Vert    (bg-green-50, border-green-200)                      │
│   🔄 EN COURS       → Bleu    (bg-blue-50, border-blue-200)                        │
│   ⏸️  EN ATTENTE     → Gris    (bg-gray-50, border-gray-200)                        │
│   🚫 BLOQUÉ         → Orange  (bg-orange-50, border-orange-200)                    │
│   ❌ REJETÉ         → Rouge   (bg-red-50, border-red-200)                          │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│                     🔄 COMPARAISON WORKFLOW CLIENT / ADMIN                         │
│                                                                                     │
│   CLIENT (WebCreateCompany)           ADMIN (AdminCompanySteps)                    │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━       ━━━━━━━━━━━━━━━━━━━━━━━━━━                  │
│                                                                                     │
│   1. Informations entreprise ✏️                                                    │
│   2. Répartition du capital ✏️                                                     │
│   3. Documents ✏️                                                                   │
│                                       1. 📋 Dossier soumis 👁️                      │
│   ════════════════════════════        ════════════════════════                     │
│      SOUMISSION COMPLÈTE                WORKFLOW ADMIN DÉMARRE                     │
│   ════════════════════════════        ════════════════════════                     │
│                                       2. 👁️ Examen du dossier ✅                   │
│                                       3. 💰 Devis d'immatriculation 📝             │
│   4. Validation devis ✅              4. ✅ Validation devis ⏸️                     │
│   5. Versement capital 💰             5. 🏦 Libération du capital ⏸️               │
│   6. Validation statuts ✅            6. 📑 Validation statuts 📄                  │
│   7. Signature ✍️                     7. ✍️ Signature et finalisation ✅           │
│                                                                                     │
│   ✅ = Client agit                    👁️ = Admin consulte                          │
│   ✏️ = Client remplit                 ✅ = Admin valide                             │
│   💰 = Client paie                    📝 = Admin crée                              │
│   ✍️ = Client signe                   ⏸️ = Admin attend                            │
│                                       📄 = Admin génère                            │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                     ║
║                          ⚠️  POINTS CRITIQUES À RETENIR                             ║
║                                                                                     ║
║  1. L'admin commence son workflow APRÈS la soumission complète du client          ║
║     → Étapes 1-3 client = préparation du dossier                                  ║
║     → Étape 1 admin = dossier complet reçu                                        ║
║                                                                                     ║
║  2. L'étape 4 "Validation devis" est BLOQUANTE                                    ║
║     → Couleur orange (pas rouge)                                                  ║
║     → Bloque les étapes 5 et 6                                                    ║
║     → Déblocage automatique dès validation du client                              ║
║                                                                                     ║
║  3. Séparation claire des responsabilités                                          ║
║     → Étapes 1-3 admin : L'admin agit                                             ║
║     → Étape 4 : Le client agit (étape bloquante)                                  ║
║     → Étapes 5-7 : Alternance admin/client                                        ║
║                                                                                     ║
║  4. Nomenclature alignée                                                           ║
║     → Les noms d'étapes correspondent entre client et admin                       ║
║     → Facilite la communication et le suivi                                       ║
║                                                                                     ║
╚═════════════════════════════════════════════════════════════════════════════════════╝


╔═════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                     ║
║                      📁 FICHIERS CRÉÉS ET MODIFIÉS                                 ║
║                                                                                     ║
║  ✅ MODIFIÉ                                                                         ║
║     └─ /components/admin/AdminCompanySteps.tsx                                    ║
║                                                                                     ║
║  📝 DOCUMENTATION CRÉÉE                                                             ║
║     ├─ /CHANGELOG_ADMIN_WORKFLOW_CLIENT_ALIGNMENT.md (Documentation complète)    ║
║     ├─ /GUIDE_VISUEL_NOUVEAU_WORKFLOW_ADMIN.md (Guide visuel détaillé)           ║
║     ├─ /TESTS_NOUVEAU_WORKFLOW_ADMIN.md (Guide de test complet)                  ║
║     ├─ /README_NOUVEAU_WORKFLOW_ADMIN.md (Démarrage rapide)                      ║
║     └─ /SCHEMA_ASCII_WORKFLOW_ADMIN.md (Ce fichier - Schéma visuel)              ║
║                                                                                     ║
╚═════════════════════════════════════════════════════════════════════════════════════╝


                               🚀 Prêt à tester ! 🚀

                  👉 Voir README_NOUVEAU_WORKFLOW_ADMIN.md pour démarrer
```
