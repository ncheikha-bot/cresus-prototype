# Troisième recette complète — 6 août 2026

Reprise intégrale après la persistance des sociétés et l'unification du compte de
démonstration ([note précédente](PERSISTANCE_SOCIETES_ET_COMPTE_DEMO.md)).
`tsc --noEmit` : 0 erreur. `npm run build` : vert.

---

## Couverture

| Espace | Écrans | Résultat |
|---|---|---|
| Client mobile (`/app`) | 16 | Rendus, 0 erreur console |
| Client web (`/web`) | 12 vérifiés sur 15 | Rendus, 0 erreur console |
| Administration (`/admin`) | 11 | Rendus, 0 erreur console |
| Comptable (`/comptable`) | 5 | Rendus, 0 erreur console |

**Parcours joués** : deux créations d'entreprise complètes — dont une avec un associé marié
en communauté de biens, pour dérouler le bloc conjoint — chacune menée de l'étape 1 à la
soumission signatures comprises ; validation des pièces côté administration ; rechargements
complets ; connexion par les quatre portes d'entrée.

## Un défaut trouvé et corrigé

### Le dossier soumis arrivait sans ses pièces

Le tunnel range les fichiers par catégorie — `{ cni_gerant: [...], casier: [...] }` — alors
que le dossier transmis à l'administration attend une liste de documents. Cette conversion
n'existait pas : `addCompany` ne recevait pas les pièces du tout.

Conséquence, invisible tant qu'on ne poussait pas jusqu'au bout : une société fraîchement
soumise arrivait **sans aucun document**. L'administration affichait « Action requise —
Examiner et valider les documents soumis » … sans rien à examiner et, surtout, **sans le
bouton pour le faire**, celui-ci ne s'affichant que s'il y a des pièces. Le dossier restait
donc bloqué à la première étape du workflow, définitivement. Les dossiers de démonstration,
eux, portaient leurs documents en dur — d'où un défaut qui ne se voyait qu'en créant une
société pour de vrai.

`toDocumentsSoumis()` ([companyValidation.ts](src/domain/companyValidation.ts)) met les pièces
à plat et traduit la catégorie du tunnel en type de document (`cni_gerant` → `identity`,
`casier` → `declaration`). Les deux tunnels la passent à `addCompany`.

**Vérifié** de bout en bout : après création de PIECES SARL, l'administration ouvre le dossier
à l'étape 1, le bouton est là, la modale liste les trois pièces avec leur type et leur date
(« CNI du gérant — Type : identity — Uploadé le 06/08/2026 »), et leur validation se propage
au client — la timeline de PIECES SARL passe à quatre étapes terminées, « Validation du
devis » devenant l'étape en cours.

## Ce que la recette a confirmé

- **Tunnel complet, deux fois** : blocages explicités à chaque arrêt (deux associés requis,
  parts à répartir, coordonnées manquantes, devis à valider, état civil pour les statuts),
  bloc conjoint déplié pour un associé marié en communauté, paiement, statuts, signatures,
  soumission.
- **Persistance** : la société créée se retrouve après rechargement complet, côté client
  (« Toutes (11) · Actives (3) · En cours (8) ») comme côté administration.
- **Compte de démonstration unique** : les quatre portes d'entrée — écran d'accueil, Splash
  mobile, connexion mobile, profil web — ouvrent la même session sur un espace peuplé.
- **Filtrage de session** : avec une session administration, l'espace web se présente comme
  déconnecté et le formulaire de connexion permet de repasser en client (3 créées / 8 en
  cours, 11 sociétés).
- **Écran de lancement** : plus de blocage sur « Chargement de votre plateforme… ».
- **Console vide** sur les 44 écrans parcourus.

## Ce qui restait ouvert

Les deux réserves ont été levées : [DERNIERES_RESERVES.md](DERNIERES_RESERVES.md).

- ~~**Les modifications portant sur les sociétés de démonstration** ne survivent pas au
  rechargement.~~ Tout ce qui s'écarte des données de référence est désormais enregistré.
- ~~**Trois écrans web** (`my-domiciliations`, `my-bank-requests`, `modification`) n'ont pas
  été rouverts dans cette passe.~~ Parcourus depuis — un défaut y a été trouvé et corrigé.
