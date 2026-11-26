# Audit de jouabilité par caste (responsable Jouabilité & maîtrise de la supply chain)

Date : 26/11/2026. Branche de départ : `ccr-d9ba3623-415kh0` (dc21963). Journal : `docs/journal/jouabilite.md`.

## Méthode (reproductible)

- **Parcours joués sur le vrai build** (`city.html`) par l'IA testeuse `tools/qa_ai/parcours_castes.js` : chaque caste est jouée par le playbook de son métier (`tools/bot_lib.js`, profils de `tools/sim_batch.js`). Deux départs : « Ville de 100 000 habitants » (Round, 10 M$, `start: 'moyenne'`) et « de zéro » (Bourg, `start: 'zero'`). Graine `S.rs = 6100`, difficulté normale, événements actifs.
- **Durée** : 720 jours. Attention : **une année du jeu dure 120 jours** (`dateTxt`). 720 jours font donc 6 ans de jeu ; les « 2 à 3 ans » demandés correspondent aux jours 240 à 360, relevés dans le tableau.
- **Watchdog** à chaque point de contrôle (30 ou 60 jours) :
  - valeurs non finies dans l'état (NaN, Infinity) ;
  - stocks négatifs ;
  - erreurs de page et de console ;
  - textes suspects au HUD ;
  - jour simulé de plus de 400 ms ;
  - images par seconde de la carte.
- **Audit d'interface en fin de parcours** : chaque type de bâtiment possédé est ouvert. On contrôle le texte suspect et la croix de fermeture. Chaque bouton visible est cliqué : si le clic ne change ni la fiche, ni l'état, ni le journal, il est noté « inerte ». Le Guide du fabricant est ouvert puis refermé.
- **Parcours au clic réel** (souris, PC 1280×720, tablette, téléphone) : `tools/parcours_joueur.js`.
- **Sondes ciblées** : rentabilité d'une chaîne construite par le bouton « Fabriquer », économie d'une ferme selon sa surface, coût du devis. Les scripts sont dans le scratchpad de la session.

Commandes :
```
NODE_PATH=$(npm root -g) node wall-street-empire/tools/qa_ai/parcours_castes.js --days=720 --chk=60 --shots=<dossier> --out=<fichier.json>
NODE_PATH=$(npm root -g) node wall-street-empire/tools/tests/run.js t110      # 6 castes × 120 jours sous watchdog + boucle de maîtrise
```
Les captures se régénèrent avec `--shots`. Pour chaque caste et chaque départ, on obtient : `<caste>_<départ>_j0.png`, `_fin.png` et `_bat_<type>.png` (fiches).

## Synthèse chiffrée (valeur de l'entreprise en M$, départ 10 M$)

| Caste | Ville 100 000 : an 1 (j120) | an 3 (j360) | an 6 (j720) | De zéro : an 1 | an 3 | an 6 |
|---|---|---|---|---|---|---|
| Industriel | 13,6 | 24,6 | 46,2 | 10,3 | 9,6 | 14,4 |
| Promoteur | 30,0 | 28,2 | 124,0 | 12,9 | 9,6 | 25,0 |
| Banquier | 24,6 | 43,9 | 107,9 | 15,0 | 23,2 | 50,8 |
| Négociant | 19,3 | 37,9 | 123,7 | 10,3 | 10,0 | 13,5 |
| Agriculteur | 19,6 | 97,2 | 105,9 | 7,0 | −12,0 | **−38,3** |
| Innovateur | 24,2 | 50,1 | **220,4** | 16,0 | 22,3 | 82,1 |

Résultats du watchdog sur les 12 parcours de 720 jours :
- 0 erreur de page ou de console, 0 NaN ou Infinity, 0 stock négatif ;
- jour simulé de 20 à 45 ms, aucun au-delà de 400 ms ;
- toutes les fiches s'ouvrent et se ferment par leur croix ;
- carte : 16 à 35 images/s en rendu logiciel sans GPU, 47 images/s au parcours au clic réel sur PC.

## Constats transverses (gravité · état)

| # | Constat (reproduction) | Gravité | État |
|---|---|---|---|
| T1 | **« Fabriquer » posait les fermes et les mines au coin de la carte, hors réseau.** `placeAuto` prenait la première case libre en (0, 0). Sonde : ville de 100 000 habitants, industriel, `askProduce('bread')` confirmé. La ferme de blé était limitée par `link` (rendement 65 %) et perdait 20 000 $/j ; le poulet menait à la faillite en 180 jours (trésorerie −4,6 M$). | Critique (boucle de maîtrise) | **Corrigé** : `rawSpot` et `placeRaw` prennent le gisement ou la terre le plus proche du port, puis tracent la route (`autoConnect`) ; le devis est calculé sur le même site (`siteCost`). |
| T2 | **Le devis du pain coûtait 13,3 M$, plus que les 10 M$ du départ.** Le pain demande des emballages, donc du plastique, donc un puits de pétrole à 6,4 M$. Le bouton restait grisé au début de partie. | Majeur (début accueillant) | **Corrigé** : trois périmètres dans le devis. **Usine seule** : 1,06 M$. **Chaîne principale** : 4,15 M$ ; ce sont les ingrédients principaux, l'emballage n'en fait jamais partie. **Chaîne complète** : 13,3 M$. Par défaut, le devis propose la chaîne principale si la trésorerie le permet, sinon l'usine seule. |
| T3 | **Une ferme posée à sa taille de base est sous son seuil de rentabilité.** Mesure : blé 3×3 à −13 700 $/j, poulets 2×2 à −12 900 $/j. Il faut environ 16 cases pour le blé sur le site le plus proche du port. Une ferme agrandie à 55 cases mais non irriguée et sans caste agriculteur perd encore de l'argent. | Majeur | **Signalé dans le devis** : ligne « seuil de rentabilité ≈ N cases, posée à 9 » ; la case « extracteurs » n'est plus cochée d'office et le devis explique pourquoi. Reste : proposer l'agrandissement dans le devis (voir « Ce qui reste »). |
| T4 | **Boutons en apparence inertes.** Un refus `info` ou `warn` émis par le clic partait au journal seul : depuis la passe 99, seul `bad` s'affiche. Exemple : « Agrandir · 78 090 $ » sur un immeuble en chantier, bouton actif mais sans effet visible (fuzz des fiches, banquier et innovateur, ville de 100 000). | Majeur | **Corrigé** : le bouton devient « Chantier en cours · livré dans N j » (désactivé). Un `warn` émis pendant le geste du joueur s'affiche environ 2 s ; les `warn` de la simulation restent au journal, sans bruit. |
| T5 | **Main-d'œuvre au départ de zéro.** Dans le bourg de 600 habitants, les fermes et usines des castes productives tournent sous la limite `staff`. L'agriculteur de zéro perd environ 70 000 $/j pendant 2 ans, jusqu'à une trésorerie de −50 M$. L'industriel et le négociant stagnent à 10 M$ pendant 3 ans de jeu. Rien ne le signalait à la pose. | Majeur | **Corrigé (information)** : à la pose par le joueur, si le bâtiment cherche plus d'employés que la ville n'a de chômeurs, le message « Main-d'œuvre : … » s'affiche. Le playbook de bot ne lit pas ce signal (voir « Ce qui reste »). |
| T6 | **L'emballage coûte plus que l'ingrédient.** Valeur des intrants par cycle : pain = farine 596 $ + emballage 705 $ ; œufs = œufs 1 200 $ + emballage 705 $. | Moyen (calibrage) | À arbitrer par le responsable Économie (`PACK[..].per`). |
| T7 | **L'arbre du pain perd ses emballages après le lancement du produit.** L'arbre passe de 6 maillons (farine, blé, emballage, plastique, pétrole, bois) à 2 (farine, blé). La gamme ou l'emballage changent au lancement. La chaîne complète construit donc un puits de pétrole devenu inutile. | Moyen | Signalé (à vérifier avec Chaîne & Commerce : `launchProduct`, `ps.pack`). |
| T8 | **Trésorerie négative sans fin de partie.** Agriculteur de zéro : −50 M$. Le découvert est facturé au taux + 12 points. C'est un choix documenté (« pas de défaite automatique »), mais l'indicateur Économie « la vente à perte mène à la faillite » n'est pas tenu pour le joueur. | Moyen | Signalé au responsable Économie. |
| T9 | **Le coach donne une prime en argent.** La mission « Ouvrir un petit marché en ville » rapporte +200 000 $, plus que le prix du marché : la pose rapporte +63 434 $. La passe 83 dit « aucune prime en argent ». | Mineur | Signalé. |
| T10 | **`parcours_joueur.js` est obsolète sur 4 étapes.** Un simple clic ouvre désormais une bulle « Ouvrir » ; le bouton du catalogue a été renommé ; `W.fac.advice` est appelé sans carnet ; la case de la ferme est occupée. Ce sont des erreurs du script, pas du jeu. | Info | Script à mettre à jour (domaine QA). |
| T11 | **Déséquilibre des castes.** Ville de 100 000 à 6 ans : l'innovateur atteint 220 M$, l'industriel 46 M$. Le saut de l'innovateur (50 → 102 M$ entre les jours 360 et 420) vient du campus de données. Au départ de zéro, l'agriculteur est négatif et l'industriel et le négociant stagnent. | Majeur (équilibre) | Causes en partie dans les bots (épargne de 40 jours, aucune lecture de la main-d'œuvre). Mesures fournies au responsable Économie. |

## Par caste

### Industriel (Baron : usines −12 %, production +5 %, OPA dès 10 %)
- **10 premières minutes** : la barre d'objectif propose le Mall puis un petit marché. Mission i1 : « Construis ta première usine ». Le Guide du fabricant et « Fabriquer » sont la porte d'entrée naturelle. Avant correctif, « Fabriquer le pain » était grisé (T2) ; ensuite, le devis s'ouvre à 4,15 M$ en chaîne principale, avec la ferme signalée sous son seuil (T3).
- **Rentabilité du début** : c'est la plus faible des 6 castes. Ville de 100 000 : 13,6 M$ en an 1 et 24,6 M$ en an 3. De zéro : 10 M$ à plat pendant 3 ans de jeu. Trois causes :
  1. chaîne automatique déficitaire (T1, T3) ;
  2. surproduction : la boulangerie sort 3 718 u/j et un supermarché en vend 167 ; le reste part à l'export avec une marge réduite ;
  3. le playbook épargne 40 jours pour la chaîne suivante sans rien construire, ce qui fait des **moments sans rien à faire**.
- **Avantages utilisés** : coût des usines (−12 %) ; la production +5 % joue peu, puisque l'aval est le goulot.
- **Blocages** : T1, T2 et T3, corrigés ou signalés. Aucun cadenas inerte (t104 vert).
- **Captures** : `industriel_moyenne_fin.png`, `industriel_moyenne_bat_s2.png` ; Guide : `guide_pain_avant.png`, `devis_pain.png`, `guide_pain_allume.png`.

### Promoteur (constructions −15 %, rachats −8 %, ventes +10 %)
- **10 premières minutes** : missions p1 (logements) et p2 (commerce au pied des immeubles), claires. Croissance la plus rapide en an 1 dans la ville de 100 000 (30 M$).
- **Courbe très heurtée** :
  - ville de 100 000 : 42,5 → 25,0 M$ entre les jours 240 et 300, puis 103 → 90 M$ ;
  - de zéro : 49,4 → 25,0 M$ entre les jours 600 et 720.

  Ce sont les cycles immobiliers (bulle, levier de 65 %). Ils sont voulus, mais la chute de moitié en 120 jours est brutale pour un joueur moyen.
- **Blocages** : T4 (« Agrandir » d'un immeuble en chantier), corrigé.
- **Captures** : `promoteur_moyenne_bat_res.png`, `promoteur_zero_fin.png`.

### Banquier (banque de 100 M$ CET1, Bâle III)
- **10 premières minutes** : b1 « Ouvre ton premier commerce » puis b2 « Accorde des prêts ». La banque est un menu, pas un bâtiment : il faut savoir l'ouvrir.
- **Rentabilité** : croissance régulière et sûre (24,6 M$ en an 1 ; 107,9 M$ à 6 ans). La trésorerie dormante est très élevée (102 M$ pour 108 M$ de valeur) : peu de décisions à prendre, d'où des **moments sans rien à faire**.
- **Blocages** : T4 sur ses immeubles, corrigé. Aucune erreur.
- **Captures** : `banquier_moyenne_bat_tech.png`.

### Négociant (exportations +15 %, centrales −20 %, électricité +30 %)
- **10 premières minutes** : n1 « Ouvre ton terminal portuaire ». La boucle est claire : port, mine, export, centrale.
- **Rentabilité** :
  - ville de 100 000 : bonne (123,7 M$ à 6 ans, 253 bâtiments dont 94 pipelines) ;
  - de zéro : stagnation à 10 M$ pendant 5 ans, par manque de main-d'œuvre (T5).
- **Exploit possible** : aucun relevé. Le volume de pipelines (94) gonfle le nombre de bâtiments sans gêner la performance (42 ms/j).
- **Captures** : `negociant_moyenne_bat_plant.png`, centrale lisible (EBE +240 927 $/mois).

### Agriculteur (fermes −25 %, rendement +15 %, irrigation −30 %)
- **10 premières minutes** : a1 « Pose ta première ferme ». Le Guide de l'agriculteur est complet (calendrier, débouchés).
- **Rentabilité** :
  - ville de 100 000 : la meilleure de l'an 3 (97 M$), puis un plateau de 106 à 112 M$ et une trésorerie à −4,1 M$ à 6 ans (endettement) ;
  - de zéro : **faillite lente** jusqu'à −38 M$, causée par T5, T8 et T3. Des fermes 3×3 irriguées au maximum dans un bourg sans main-d'œuvre perdent 10 000 à 16 000 $/j chacune.
- **Déséquilibre** : la rentabilité d'une ferme dépend énormément de sa surface et de la caste (seuil de rentabilité, irrigation). Pour une autre caste, une ferme de blé reste déficitaire même à 55 cases, sur le site le plus proche du port, au cours de la ville de 100 000.
- **Captures** : `agriculteur_zero_fin.png` (HUD −50 261 369 $, −1 453 811 $/mois), `agriculteur_moyenne_bat_fsugar.png`.

### Innovateur (R&D −20 % et +30 % de vitesse, monopole)
- **10 premières minutes** : v1 « Lance une recherche de produit » ; le monopole est bien expliqué.
- **Rentabilité** : la plus forte (220 M$ à 6 ans dans la ville de 100 000 ; 82 M$ de zéro). Saut entre les jours 360 et 420 (campus de données) : **déséquilibre** à surveiller (T11).
- **Captures** : `innovateur_moyenne_bat_tech.png`, `innovateur_zero_bat_rd.png`.

## Boucle de maîtrise de la chaîne : état après ce lot

1. **Découvrir ce qu'on peut fabriquer.** Le Guide du fabricant reçoit un encart « Ta chaîne » :
   - l'arbre complet en cascade, avec les quantités par unité de produit ;
   - la source de chaque maillon : ✓ chez toi, ou ⚓ au port avec sa majoration (+30 %) ;
   - le rappel « qualité : 30 % technologie, 70 % matières » ;
   - deux boutons : « Construire cette chaîne · devis » et « Diagnostic par maillon ».

   La coche ✓ de la liste existait déjà (passe 103).
2. **Relier** (existant, vérifié) : cartes fournisseurs sur chaque emplacement, changement de fournisseur en lot, « Réparer les liens (N) » quand un fournisseur fait défaut, complément automatique au port quand un fournisseur est à court.
3. **Construire de A à Z** :
   - devis en trois périmètres (usine seule, chaîne principale, chaîne complète) ;
   - fermes et mines posées près du port et raccordées ;
   - seuil de rentabilité de la ferme signalé ;
   - diagnostic par maillon (capacité contre besoin, ruptures, coût de ce qui manque) depuis le Guide.
4. **Optimiser** (existant) : formation des services, lignes parallèles, cadenas d'usine, choix de fournisseur, prix de cession, qualité et marque.
5. **Satisfaction visible** :
   - l'encart du Guide « s'allume » (cadre vert lumineux) quand chaque maillon est à toi ;
   - jalons « Première chaîne complète », « Trois produits fabriqués de bout en bout » et « Indépendant du port » (30 jours sans import d'usine), avec Diamants, crédits labo, titre « Maître de la chaîne » et confiance du banquier ;
   - aucune prime en argent (somme positive, économie intacte).

## Ce qui reste (proposé)
- **Agrandir la ferme jusqu'à son seuil, dans le devis** : une ligne « agrandissement jusqu'à N cases · coût » (`farmGrowPlan`), quand la trésorerie le permet.
- **Résultat mensuel attendu par périmètre dans le devis.** Le gain « fabriquer ou acheter » existe déjà dans l'arbre de chaîne (`chainTree().gain`) ; il reste à l'afficher pour chacun des trois périmètres.
- **Taille de l'usine adaptée aux débouchés.** La petite boulangerie produit 20 fois les ventes d'un supermarché ; voir le lot 14 du journal Chaîne & Commerce sur le dimensionnement.
- **Entrepôts tampons des récoltes reliés aux magasins** (déjà dans « Reste » de Chaîne & Commerce).
- **Lecture de la main-d'œuvre par les playbooks de bot** (`farmer`, `trader`, `baron`) avant de construire au départ de zéro.
- **Mise à jour de `parcours_joueur.js`** (T10).
