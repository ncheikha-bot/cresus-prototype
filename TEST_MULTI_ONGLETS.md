# Test de bout en bout à plusieurs onglets — 6 août 2026

Le prototype se prête désormais au test réel : le client dans un onglet, l'administration
dans un autre, sur le même navigateur. `tsc --noEmit` : 0 erreur. `npm run build` : vert.

---

## 1. La session appartient à l'onglet, les données au navigateur

**Le problème.** La session vivait dans le `localStorage`, commun à tous les onglets. Ouvrir
l'administration dans un second onglet remplaçait donc la session cliente du premier — soit
exactement ce qu'on veut éviter quand on cherche à dérouler un dossier à deux rôles.

**Ce qui change.** La session passe dans le `sessionStorage`, propre à chaque onglet : elle
survit toujours au rechargement de *cet* onglet, mais n'écrase plus celle d'à côté. Les
données métier, elles, restent dans le `localStorage`, partagé.

## 2. Les onglets se tiennent au courant

**Le problème.** Chaque onglet gardait sa copie en mémoire. L'administration validait des
pièces que le client ne voyait qu'après un rechargement manuel — et, plus grave, le dernier
onglet à écrire écrasait le travail de l'autre, puisqu'il réenregistrait son propre état
complet.

**Ce qui change.** Le contexte écoute l'événement `storage`, émis par le navigateur dans les
*autres* onglets à chaque écriture. Cinq jeux de données sont relus à la volée :

| Donnée | Qui écrit | Qui lit |
|---|---|---|
| `cresus_companies` | Client (création) | Administration |
| `cresus_company_processes` | Administration (validations, statuts, RV) | Client |
| `cresus_notifications` | Les deux | Les deux |
| `cresus_appointments` | Client (demande) | Administration (confirmation) |
| `cresus_bank_requests` | Client (demande) | Administration et banques |

Notifications, rendez-vous et demandes bancaires n'étaient d'ailleurs pas persistés du tout :
ils repartaient des données de démonstration à chaque rechargement.

**Vérifié, deux onglets ouverts côte à côte** :

1. Onglet client — dossier « DEUX ONGLETS SARL » créé de l'étape 1 à la soumission.
2. Onglet administration, **sans rechargement** : le dossier apparaît dans la liste, à
   « Dossier soumis ».
3. Onglet administration — les trois pièces sont validées.
4. Onglet client, **sans rechargement** : la timeline du dossier passe à quatre étapes
   terminées, « Validation du devis » devient l'étape en cours, et les notifications
   « Document validé » émises par l'administration apparaissent dans le centre du client.
5. Rechargement complet de l'onglet client : session, dossier et avancement sont intacts.

## 3. Les boutons de simulation sont retirés

| Emplacement | Ce qui a été retiré |
|---|---|
| Détail d'un dossier (administration) | Le panneau jaune « 🔧 Mode développement — Simulations » et ses quatre boutons : *Client valide statuts*, *Client rejette statuts*, *Client demande RV*, *Client signe en ligne*, ainsi que leurs quatre gestionnaires |
| Tunnel de création (web), étape 7 | Le bouton « [DEMO] Simuler réception statuts » |

Ces raccourcis faisaient jouer à l'administration le rôle du client. Ils n'ont plus lieu
d'être : les deux rôles se pilotent maintenant chacun depuis son onglet. La validation du
rendez-vous, elle, reste accessible par son chemin normal — seul le raccourci qui *fabriquait*
la demande a disparu.

Ce qui porte encore le mot « simulation » relève du produit ou de l'infrastructure, non du
mode développement : le simulateur d'offre comptable, la simulation de paiement du devis
(qui explique au client comment les frais sont prélevés) et les barres de progression des
téléversements.

---

## Ce qui restait simulé

Traité depuis : [DOSSIER_CREE_ETAPE_4.md](DOSSIER_CREE_ETAPE_4.md). Le dossier est créé dès
l'étape 4, et les statuts viennent de l'administration.

### ~~L'arrivée automatique des statuts~~

Dans le tunnel de création, **les statuts arrivent automatiquement** une seconde et demie
après la validation du devis (« Simuler l'envoi des statuts par l'admin »). Ce n'est plus un
bouton, mais cela reste une simulation — et je ne l'ai pas retirée, car rien ne la remplace
encore : le dossier n'existe pour l'administration qu'**au moment de la soumission finale**,
donc pendant les étapes 5 à 8 le client n'a personne en face de lui.

Brancher réellement cette étape suppose de créer le dossier plus tôt — à l'envoi des documents
(étape 4) plutôt qu'à la signature — pour que l'administration puisse produire les statuts
pendant que le client attend. C'est un changement de séquence du parcours, pas un correctif :
je préfère le proposer plutôt que le décider.
