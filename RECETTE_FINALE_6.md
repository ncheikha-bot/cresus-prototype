# Recette — sixième passage — 7 août 2026

Passage complet après le nettoyage des pictogrammes
([NETTOYAGE_PICTOGRAMMES.md](NETTOYAGE_PICTOGRAMMES.md)). Le parcours a été joué de
bout en bout sur un dossier réel, en empruntant cette fois les **branches jamais
testées** : refus du devis, rejet des statuts, libération partielle du capital,
signature par rendez-vous physique.

`tsc --noEmit` : 0 erreur. `npm run build` : vert.

---

## Le parcours, par ses chemins de traverse

`RECETTE 6 SARL`, deux associés (60 / 40 %), dont un marié — ce qui déclenche le
régime matrimonial et les informations du conjoint.

| Étape | Ce qui a été éprouvé |
|---|---|
| 1 → 4 | Saisie, répartition, coordonnées, 3 pièces → **dossier créé** |
| Admin 2 | Les 3 pièces validées |
| Admin 3 | Devis 200 000 FCFA envoyé, **avec des notes** |
| Client 5 | Devis reçu en direct → **refusé**, avec motif |
| Admin 3 | Refus reçu, devis corrigé à 185 000 FCFA, renvoyé |
| Client 5 | Devis corrigé reçu → validé ; conjoint et régime renseignés |
| Client 6 | **Libération partielle** : la moitié du capital, par Wave |
| Admin 6 | Statuts V1 envoyés |
| Client 7 | Statuts **rejetés**, avec motif |
| Admin 6 | Motif reçu, statuts V2 envoyés |
| Client 7 | V2 validée |
| Client 8 | **Rendez-vous physique** : créneau du 11 août réservé |
| Admin 7 | Créneau confirmé |
| Client 8 | Dossier finalisé |
| Admin 7 | 4 documents officiels déposés, société clôturée |

Console vide sur toute la séquence.

## Dix défauts trouvés et corrigés

### 1. Le refus d'un devis n'existait pas pour l'administration

Le client refuse, motif à l'appui, et lit « L'administrateur a été notifié ». L'écran
d'administration affichait alors **« En attente du devis — Créer et envoyer le devis »**,
exactement comme si rien n'avait jamais été envoyé. Ni le refus, ni le motif, nulle part.
Le dossier était mort : le client attendait une correction que rien ne réclamait.

L'étape 3 reconnaît maintenant l'état « refusé », affiche le motif et propose
« Corriger le devis » ; l'étape 4 dit « Le client attend un devis corrigé ».

### 2. …et le motif du client écrasait les notes de l'administration

Les deux étaient écrits dans le même champ `notes`. Le motif de refus a désormais le
sien, et un renvoi de devis le solde.

### 3. Le rendez-vous de signature ne pouvait pas être confirmé

Le client réserve son créneau à sa dernière étape ; l'administration en est alors à
l'étape 7. Or la demande de rendez-vous et son bouton « Valider le RV » étaient
accrochés à **l'étape 6**. Résultat : le client attendait une confirmation que
personne ne pouvait donner, sans qu'aucun écran ne signale l'attente. Déplacés à
l'étape 7, avec un libellé qui nomme l'attente des deux côtés.

### 4. Le rendez-vous confirmé s'affichait au 1ᵉʳ janvier 1970

La confirmation lisait la date dans l'état local du tunnel, vidé dès qu'on reprend un
brouillon ou que la page est rechargée. Elle vient maintenant du dossier partagé,
comme le statut qu'elle accompagne.

### 5. « Mes documents » montrait cinq documents fictifs pour toute société

La fonction ignorait l'identifiant reçu et renvoyait toujours les mêmes cinq pièces —
mêmes noms, mêmes tailles, mêmes dates d'octobre 2025. Un dossier créé le jour même
affichait des statuts antérieurs à sa propre existence. Les deux écrans lisent
maintenant les pièces réellement déposées et les documents officiels remis
([`clientDocuments.ts`](src/domain/clientDocuments.ts)).

### 6. …et les aurait montrées « en cours de génération »

Même dualité de source que pour le compteur de l'administration corrigé au passage
précédent : la pièce reste `pending` sur le dossier, la décision vit dans le
processus. Le statut effectif est résolu par la règle partagée, et une pièce déposée
est « en cours de validation », pas « en cours de génération ».

### 7. La comptabilité mobile affichait « Invalid Date — Dans NaN jours »

L'écran lisait `nextDeadline`, `name` et `frequency` : trois champs optionnels
qu'**aucune** déclaration ne porte. Le web lisait les bons champs mais annonçait
« Dans 0 jours » pour une échéance dépassée. Une échéance commune
([`taxDeadlines.ts`](src/domain/taxDeadlines.ts)) sert désormais les deux, et sait
dire « Demain », « Aujourd'hui » ou « En retard de 38 jours ».

### 8. « Prochaines échéances » ne listait que des échéances passées

Les deux tableaux de bord prenaient les trois premières déclarations de la liste,
sans trier ni filtrer — dont une déjà payée. Le tri place les retards en tête, puis
les échéances à venir, et écarte ce qui est réglé. Le calendrier de démonstration,
qui s'arrêtait en juin, a été prolongé.

### 9. Quatre messages parlaient d'« admin » au client

« En attente de confirmation par l'admin », « L'admin va vous envoyer une version
corrigée », « L'admin préparera les documents ». Le client ne connaît pas d'admin, il
connaît Crésus. Le bandeau d'administration annonçait par ailleurs « Statuts rejetés —
V1 à envoyer » quand l'action attendue était d'envoyer la V2.

### 10. Le récapitulatif final comptait « Documents signés 0/1 »

Sur un dossier signé au rendez-vous, rien n'est signé en ligne : le compte à zéro se
lisait comme un échec. La ligne dit maintenant « Signature — Au rendez-vous ».

## Couverture

**46 écrans** parcourus — 15 client web, 16 client mobile, 10 administration,
5 comptabilité — sans erreur console, sans emoji, sans clé technique, sans
`undefined`, `NaN` ni `Invalid Date`.

Il ne reste dans tout `src/` que 59 caractères non-ASCII, tous légitimes :
séparateurs `═` `─` de commentaires, flèches d'intervalles de dates, `©`, et les
espaces insécables de la typographie française des montants.

## Réserve d'environnement

**Le volet de prévisualisation reste masqué** (0 × 0 px) : les animations de sortie
ne s'y jouent jamais, une modale fermée reste montée et bloque la suivante. Cinq fois
durant ce passage, ce symptôme a été distingué d'un vrai défaut en rejouant la
séquence dans un onglet rechargé — où elle passe.

## Données de recette

Le dossier `RECETTE 6 SARL` et son brouillon ont été retirés. L'application repart
sur son jeu de démonstration.
