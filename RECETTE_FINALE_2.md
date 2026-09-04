# Seconde recette complète — 6 août 2026

Reprise intégrale après les dix correctifs de la
[première recette](RECETTE_FINALE.md). `tsc --noEmit` : 0 erreur. `npm run build` : vert.

---

## Couverture

| Espace | Écrans | Résultat |
|---|---|---|
| Client mobile (`/app`) | 16 | Rendus, 0 erreur console |
| Client web (`/web`) | 15 | Rendus, 0 erreur console |
| Administration (`/admin`) | 11 | Rendus, 0 erreur console |
| Comptable (`/comptable`) | 5 | Rendus, 0 erreur console |

**Parcours joués intégralement, sans raccourci** : création d'entreprise **de l'étape 1 à la
soumission finale** — y compris les deux signatures manuscrites tracées sur le canevas —
domiciliation, modification post-statutaire, ouverture de compte bancaire, enregistrement et
reprise de brouillon (mobile et web), connexion / déconnexion / rechargement, et côté
administration l'ouverture d'un dossier.

## Trois défauts trouvés et corrigés

### 1. L'application restait bloquée sur son écran de lancement

La recette a buté dès la première seconde : « Chargement de votre plateforme… » ne passait
plus. `InitialSplash` avançait de deux points par tic de 30 ms — exactement le motif corrigé
la veille sur les téléversements, mais cette fois sur **l'écran d'accueil de l'application**.
Un navigateur ralentit les minuteurs d'un onglet en arrière-plan : l'utilisateur qui lance
Crésus puis change d'application le temps d'un message revenait sur un écran de chargement
figé, parfois plusieurs minutes.

La progression se déduit désormais du temps écoulé. **Vérifié** : l'écran de choix
d'interface s'affiche normalement, onglet en arrière-plan.

### 2. L'espace web ne filtrait pas la session

Correctif jumeau du n° 5 de la première recette, que je n'avais appliqué qu'au mobile. Les
espaces administration et comptable connectent d'office leur propre utilisateur ; en revenant
sur `/web`, l'en-tête affichait « Bienvenue, Amadou Diop » et le rôle « accountant » au-dessus
d'un espace client vide, et l'écran de profil, se croyant connecté, ne proposait plus de se
reconnecter — impasse.

`WebLayout` et `WebProfile` ne considèrent connecté qu'un **compte client** ; toute autre
session est traitée comme une absence de connexion, état que cet espace sait déjà présenter.
**Vérifié** : avec une session comptable, l'espace web affiche « Se connecter » ; le formulaire
de connexion revient et permet de repasser en client.

### 3. Le compte de démonstration web n'avait aucune donnée

« Accès rapide démo → Mode Client » ouvrait une session sur `client@cresus.sn`, qui ne possède
aucune société : la démonstration web s'ouvrait sur un espace vide, tableau de bord à zéro.
Le bouton pointe désormais sur le même compte que l'application mobile.

**Vérifié** : la démonstration web ouvre sur **3 sociétés créées / 7 en cours** et « 10
sociétés », comme le mobile.

## Ce que la recette a confirmé

- **Tunnel de création, bout en bout** : 8 étapes, blocages explicités à chaque arrêt
  (associés manquants, parts à répartir, coordonnées, état civil pour les statuts), paiement,
  validation des statuts, **signature des deux documents** et soumission — « Création
  finalisée ! 🎉 ».
- **Entrée du dossier dans l'administration** : la société soumise arrive bien à
  « Étape 1/7 — Dossier soumis », et non à la fin d'un workflow réputé terminé.
- **Compteurs cohérents** : après création, le tableau de bord affiche 3 créées / 8 en cours
  et l'écran des sociétés « Toutes (11) · Actives (3) · En cours (8) ».
- **Timeline** : le nouveau dossier apparaît avec trois étapes terminées et « Documents
  justificatifs » en cours ; progression continue, sans dents de scie.
- **Téléversements** : les trois pièces obligatoires arrivent à « 1 téléversé » chacune,
  onglet en arrière-plan.
- **Brouillons** : enregistrement à l'étape 5 avec devis validé, documents et état civil ;
  réouverture à l'identique.
- **Session** : rechargement direct sur `/web/my-companies` sans repasser par la connexion.
- **Identifiants** : aucun avertissement React de clé dupliquée sur l'ensemble du parcours.

## Ce qui restait ouvert

Les deux points ont été traités depuis :
[PERSISTANCE_SOCIETES_ET_COMPTE_DEMO.md](PERSISTANCE_SOCIETES_ET_COMPTE_DEMO.md).

- ~~**Les sociétés créées ne survivent pas au rechargement**~~ : seules les données de
  démonstration, les brouillons et l'avancement des dossiers sont persistés. Une société
  soumise pendant la session disparaît au rafraîchissement. C'est cohérent avec l'état du
  prototype — la persistance a été ajoutée là où l'absence était visible — mais ce sera le
  prochain écart à combler.
- ~~**Deux comptes de démonstration coexistent**~~ (`cheikh@example.com`, qui porte les données,
  et `client@cresus.sn`, vide). Le second ne sert plus à rien depuis ce correctif ; autant le
  retirer ou lui donner des données.
