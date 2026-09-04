# Le dossier naît à l'étape 4 — 6 août 2026

Suite de [TEST_MULTI_ONGLETS.md](TEST_MULTI_ONGLETS.md), où la dernière simulation restante
était l'arrivée automatique des statuts. `tsc --noEmit` : 0 erreur. `npm run build` : vert.

---

## Le changement de séquence

Le dossier était créé à la toute fin du tunnel, après la signature. Pendant les étapes 5 à 8,
le client n'avait donc personne en face de lui : les statuts « arrivaient » par une minuterie,
le rendez-vous se confirmait tout seul au bout de deux secondes.

Il est désormais créé **dès que les pièces sont fournies**, à la sortie de l'étape 4 :

| | Avant | Après |
|---|---|---|
| Naissance du dossier | Étape 8, après signature | **Étape 4**, dès les pièces déposées |
| Statuts | Minuterie de 1,5 s dans le tunnel | Rédigés et envoyés par l'administration |
| Rendez-vous | Confirmé seul après 2 s | Demandé par le client, confirmé par l'administration |
| Validation des statuts | État local du tunnel | Écrite dans le dossier partagé |
| Soumission finale | Créait la société | Enregistre la signature sur le dossier existant |

Le tunnel retient l'identifiant du dossier (`companyId`), enregistré avec le brouillon : une
reprise retrouve l'avancement réel de l'administration, et non un état figé.

## Ce qu'il a fallu débloquer en chemin

Brancher les statuts a fait apparaître quatre points d'arrêt, chacun invisible tant que le
client et l'administration ne travaillaient pas vraiment ensemble.

**1. L'administration ne pouvait pas faire avancer un dossier.** `currentStep` n'était écrit
nulle part : tout dossier restait à « Dossier soumis », donc hors d'atteinte de l'étape des
statuts. Une action « Étape suivante » a été ajoutée à l'en-tête du dossier, désactivée quand
l'étape suivante est bloquée, avec `updateCompanyStep` dans le contexte.

**2. Le devis validé restait chez le client.** L'administration bloque « Validation devis » et
« Libération du capital » tant que `company.quote` n'est pas validé. Le tunnel gardait cette
validation en mémoire : le dossier ne pouvait pas atteindre la rédaction des statuts.
`updateCompanyQuote` la reporte sur la fiche.

**3. Le dossier ouvert était une copie.** L'écran d'administration retenait l'objet société
choisi dans la liste ; toute évolution — la sienne comme celle de l'autre onglet — restait
invisible jusqu'à la fermeture du dossier. Il retient maintenant l'identifiant et relit la
société dans le référentiel.

**4. Les deux onglets se réécrivaient mutuellement.** Chacun renvoyait dans le stockage l'état
qu'il venait de recevoir de l'autre, écrasant au passage une modification plus récente : les
étapes semblaient revenir en arrière. Les écritures partagées passent par
`writeJSONIfChanged`, qui compare avant d'écrire — l'aller-retour s'arrête de lui-même.

**Au passage** : la carte d'étape de l'administration s'animait en `mode="wait"`, dont la
transition ne s'achève pas dans un onglet en arrière-plan — c'est-à-dire dans le second onglet
du test. Le workflow paraissait bloqué alors qu'il avançait. Passée en `popLayout`, comme les
quinze autres corrigées auparavant.

## Le circuit, vérifié à deux onglets

1. **Client** — dossier « CIRCUIT REEL SARL » saisi jusqu'à l'étape 4 ; à la sortie de
   l'étape, la société apparaît dans `cresus_companies`.
2. **Administration**, sans rechargement — le dossier est dans la liste ; ses trois pièces sont
   validées, puis « Étape suivante » le conduit jusqu'à « Validation statuts ».
3. **Administration** — « Générer les statuts V1 » puis « Envoyer au client » :
   `statutsSent: true` dans l'avancement partagé.
4. **Client** — l'étape 7 affichait « Statuts en préparation » ; elle affiche maintenant
   « Statuts de la société V1 — Consulter / Télécharger » et propose de les valider ou de
   demander une correction.
5. **Client** — validation des statuts → `statutsValidatedByClient: true`.
6. **Administration**, sans rechargement — la validation est visible, l'action « Finaliser la
   société » s'ouvre.
7. **Client** — signature électronique des deux documents et soumission : le dossier passe en
   `signed`, `onlineSignatureCompleted: true`, et **aucune seconde société n'est créée**.

## Ce qui restait à brancher

Traité depuis : [DEVIS_ET_DECLARATION_BRANCHES.md](DEVIS_ET_DECLARATION_BRANCHES.md).

- ~~**Le devis** est encore établi par le tunnel lui-même~~ — il est désormais saisi et envoyé
  par l'administration, validé ou refusé par le client.
- ~~**La déclaration sur l'honneur** suit le même schéma~~ — l'administration la génère et
  l'envoie ; elle n'apparaît dans les documents à signer que si elle a été demandée et
  produite.
