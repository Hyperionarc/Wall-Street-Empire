# Passe 60 : des villes de plusieurs millions d'habitants (priorité 3 de Rémy)

Objectif : une trajectoire crédible vers **1 million d'habitants vers le jour 5 000 sans rien faire** et **3 à 5 millions et plus en jeu actif**, avec des emplois et des services
proportionnés, sans dégrader la fluidité ni la sauvegarde. Test : `t34_ville_croissance.js`. Outils : `tools/city_growth.js` (courbe de population), `tools/city_perf.js` (performances
d'une très grande ville).

## 1. Mesure de départ et diagnostic des freins

Mesures faites avec `tools/city_growth.js` sur la version d'avant (commit `f2f6100`), mode Round, caste industriel, 1 worker.

| Jour | Passif avant | Actif (bot riche) avant |
|---:|---:|---:|
| 360 | 71 k | 75 k |
| 1 080 | 84 k | 98 k |
| 1 800 | 94 k | 126 k |
| 3 600 | 124 k | 238 k |
| 5 400 | 160 k | 441 k |
| 7 200 | 206 k | 730 k |
| 10 800 | 344 k | – |

Freins relevés, du plus fort au plus faible :

1. **La carte ne pouvait presque pas accueillir la ville.** Un bloc n'était viabilisé que s'il ne contenait **aucun** gisement (champ, bois, minerai). Or presque tous les blocs voisins en
   ont : sur les 72 blocs autorisés (colonnes 1 à 9, lignes 1 à 8), seuls 5 étaient extensibles. En jeu actif, la ville a ajouté 5 blocs puis a eu **0 lot libre dès le jour 5 760** (777 lots).
2. **Le rythme** : `r0 = 5,6e-5` par jour, soit environ ×3,4 en 20 ans en passif ; un **plafond logistique à 1 million** (`1 / (1 + (pop / 1 M)^4)`) bloquait toute ville au-delà.
3. **Hauteur** : la hauteur maximale suit la population (`Fmax = 10 × (pop / 100 000)^0,95`) ; ce n'était pas un frein en soi (14 étages à 200 000 habitants), mais au-delà de 99 étages le
   dessin retombe sur l'empilement étage par étage (les sprites HD s'arrêtent à 99).
4. **Emplois** : les bureaux suivent bien le rapport emplois / actifs visé (0,88) ; mais les actifs étaient calculés sur `habitants × 2,83` (bassin régional) quelle que soit la taille :
   une ville de 5 millions aurait demandé les emplois de 14 millions d'habitants.
5. **Services publics** : 11 équipements fixes, quelle que soit la population (un hôpital pour 5 millions).
6. **Équipements multi-cases au centre** : hôpital 3×3, lycée 3×2, collège, mairie, stades 2×2 occupent environ 36 lots centraux parmi les mieux placés ; mesuré lors du barème des tailles
   (le plus haut immeuble passif était passé de 16 à 14 étages). Ils restent en place (identité de la ville) ; les nouveaux équipements sont posés hors du centre.
7. **Valeur du sol par usage** : la hauteur visée ne dépend que de la distance au centre (`cityLV`) ; les bureaux visent plus haut que les logements à valeur égale (exposant 1,25 contre 1,6).
   Inchangé.

## 2. Règle de croissance (passe 60)

- **Niveaux de ville** (`CITY_TIER`) : Bourg, Petite ville (40 000), Ville (150 000), Grande ville (300 000), Métropole (500 000), Mégalopole (1 million), Mégapole (2,5 millions),
  Mégapole mondiale (5 millions). Chaque niveau a un rythme relatif (1 ; 1 ; 1,06 ; 1,12 ; 1,12 ; 0,9 ; 0,62 ; 0,45), interpolé sur l'échelle logarithmique (`cityTierR`) :
  effet d'agglomération jusqu'à la métropole, puis croissance relative plus lente des très grandes villes.
- **Rythme** : `étages ajoutés tous les 2 jours = CG_R0 × A^2,6 × rythme du niveau × plafond × étages de logement × 2` avec `CG_R0 = 2e-4` (au lieu de 5,6e-5) et un plafond logistique
  à `CG_CAP = 5 millions` (au lieu de 1). Réserve de chantiers et nombre de chantiers par pas proportionnés à la ville (80 logements, 30 bureaux au plus par pas). `WSE.cityTune`
  règle aussi `TIER` (0 = ancien effet d'agglomération).
- **Densification verticale** : `Fmax` plafonné à 90 étages et hauteur visée d'un lot plafonnée à `CITY_FTOP = 96` étages : tours de 60 à 96 étages au centre (couvertes par les sprites HD).
- **Extension à la périphérie** : toute la terre ferme de la carte (blocs 0 à 14, sauf port, quais et mer) ; contrôle tous les 20 jours (40 avant), deux blocs à la fois au-delà d'un
  million d'habitants. Un bloc est refusé s'il contient un bâtiment d'un joueur ou d'un rival (aéroport compris), une ferme d'un rival, un terrain acheté, plus de 8 cases de minerai ou
  d'énergie, ou plus de 24 cases sur 49 de champs, bois et gisements (`CITY_RURAL` : les grands massifs et les grandes exploitations restent à la campagne). Les champs et les bois d'un bloc
  viabilisé sont urbanisés (jamais le dernier gisement de sa sorte), les minerais restent en place, les gisements sous les nouvelles avenues sont retirés. À distance égale, les blocs les
  moins agricoles passent d'abord.
- **Emplois proportionnés** : au-delà de 300 000 habitants, la part régionale du bassin devient `(2,83 − 1) × √(300 000 × habitants)` (`bassin()`) : une mégapole draine surtout ses
  propres habitants. Sans effet sous 300 000 habitants (économie de départ et des premières années identique) ni sur les anciennes sauvegardes (bassin 1). Les bureaux de la ville suivent
  le rapport emplois / actifs visé : 0,88 à 0,90 mesuré jusqu'à 5 millions.
- **Services publics proportionnés** (`CITY_SVC`) : un hôpital par 600 000 habitants, un lycée par 450 000, un collège par 350 000, une école maternelle par 280 000, une crèche par
  450 000, un commissariat par 600 000, une caserne par 700 000 (au moins celui de départ). Tous les 30 jours, la ville pose jusqu'à 3 équipements, le plus en retard d'abord
  (`citySvcGrow`), à l'emprise du barème, sur des lots libres loin des équipements de la même sorte et hors du cœur de ville (valeur du sol ≤ 0,85). Quand la ville est pleine, la mairie
  rachète et rase des immeubles de 30 étages au plus (jamais un repère ni un bâtiment racheté par un joueur ou un rival), là où il y a le moins d'étages à démolir. Sans ce rachat, la
  couverture tombait à 38 % dans une ville active de 6 millions ; avec, elle reste à 100 %. Noms `hospital_2`, `lycee_3`… (même sprite, même catégorie, nom « Hôpital
  n° 2 »), sauvegardés avec la ville (`cty`) et reliés au chargement (`monLink`, `monFpOf`). La couverture (moyenne des rapports équipements / besoin) entre dans l'attractivité :
  `aQ = 0,9 + 0,1 × couverture` (1 tant que la ville en a assez). Écran Empire : ligne « Services publics ».
- **Jalons** ajoutés à la fin : 1,5 million, 2,5 millions (mégapole), 4 millions, 5 millions (mégapole mondiale).

## 3. Courbes avant / après

`tools/city_growth.js '{}' passif|bot 7200 360`, même scénario avant et après (population en milliers d'habitants).

| Jour | Passif avant | Passif après | Actif avant | Actif après |
|---:|---:|---:|---:|---:|
| 360 | 71 | 83 | 75 | 95 |
| 720 | 77 | 100 | 86 | 139 |
| 1 080 | 84 | 120 | 98 | 186 |
| 1 440 | – | 150 | 110 | 287 |
| 1 800 | 94 | 189 | 126 | 410 |
| 2 520 | – | 295 | 161 | 789 |
| 2 880 | – | 360 | 184 | 1 013 |
| 3 600 | 124 | 561 | 238 | 1 730 |
| 4 320 | – | 808 | 305 | 2 528 |
| 4 680 | – | 952 | 348 | 2 962 |
| 5 040 | – | 1 091 | 388 | 3 362 |
| 5 400 | 160 | 1 283 | 441 | 3 805 |
| 6 120 | – | 1 652 | 551 | 4 561 |
| 7 200 | 206 | 2 268 | 730 | 5 423 |

- **Passif** : le million vers le jour 4 850, 2,27 millions au jour 7 200 ; 86 blocs ajoutés, 2 431 lots ; plus haut immeuble 90 étages ; niveaux 0 / 51 / 263 / 515 / 185 / 40
  (maisons / petits immeubles / immeubles / tours / grandes tours / supertours) ; 44 équipements publics distincts ; emplois / actifs 0,89.
- **Actif** (bot riche, 2 Md$, services en série) : le million vers le jour 2 870, 3,4 millions au jour 5 040, **5,4 millions** au jour 7 200 ; la carte est pleine (2 520 lots, 91 blocs)
  vers le jour 5 400 : la ville ne grandit plus ensuite qu'en hauteur ; plus haut immeuble 96 étages, 330 supertours ; 93 équipements ; emplois / actifs 0,88.
- Chômage : 9 à 17 % selon la phase du cycle, comme avant (15,7 % au jour 7 200 avant, 17 % après).

### Test `t34` (scénario du test : caste industriel, 5 Md$ en passif, bot du test en actif)

| Jour | 600 | 1 200 | 1 800 | 2 400 | 3 000 | 3 600 | 4 200 | 4 800 | 5 400 | 6 000 | 6 600 | 7 200 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Passif (k) | 90 | 125 | 172 | 231 | 307 | 414 | 562 | 740 | 953 | 1 204 | 1 470 | 1 771 |
| Actif (k) | 153 | 408 | 988 | 1 717 | 2 497 | 3 346 | 4 158 | 4 803 | 5 345 | 5 819 | 6 187 | 6 549 |

Avant la passe, le même test mesurait ≈ 190 k en passif et ≈ 860 k en actif au jour 7 200. Passif au jour 7 200 : plus haut immeuble 81 étages, 34 équipements, couverture 100 %,
emplois / actifs 0,89, bassin effectif 1,82 ; actif : 549 supertours, plus haut 96 étages, 105 équipements, couverture 100 %, 18 ms par jour simulé (4 jours + un tour de bot).
Bornes mises à jour : passif 0,6 à 1,5 M au jour 4 800 et 1,2 à 3,2 M au jour 7 200 ; actif 3 à 7,5 M au jour 7 200.

### Trois parties bot de 1 800 jours (`tools/sim_batch.js --workers 1 --seeds 1 --days 1800 --profiles bon`)

| Caste | Population avant (j 600 / 1 200 / 1 800) | Après | Valorisation au jour 1 800 avant → après | Erreurs |
|---|---|---|---|---|
| Industriel | 80 k / 99 k / 121 k | 116 k / 209 k / 404 k | 84 → 115 M$ | 0 |
| Promoteur | 81 k / 101 k / 128 k | 134 k / 293 k / 659 k | 82 → 171 M$ | 0 |
| Agriculteur | 84 k / 104 k / 126 k | 139 k / 259 k / 513 k | 76 → 119 M$ | 0 |

Effet de bord à surveiller (priorité 2, économie) : une ville qui grandit 3 à 5 fois plus vite élargit le marché ; la valorisation d'un bon joueur au jour 1 800 monte de 35 à 110 %
(le promoteur profite le plus : la croissance urbaine est son marché). La ville de départ est identique (les cibles de marges, d'élasticité et de cohérence se mesurent au départ),
mais elle grandit plus vite dès la première année (83 k au lieu de 71 k au jour 360 en passif) ; le bassin n'est modifié qu'au-delà de 300 000 habitants.

## 4. Performance et carte

`tools/city_perf.js 4.5e6` : la ville est poussée à 4,5 millions par un réglage accéléré (`R0 = 9e-4`, joueur passif), puis on mesure. Rendu headless logiciel (sans GPU) sur une machine
partagée et chargée : les temps d'image sont à comparer entre eux, pas en absolu.

| | Départ (61 600 hab.) | 4,55 millions |
|---|---:|---:|
| Bâtiments de la ville | 389 | 2 611 (2 478 lots, 89 blocs ajoutés) |
| Appels de dessin par image, zoom 0,55 / 0,25 / 0,13 | 2 120 / 4 400 / 4 890 | 3 590 / 6 310 / 6 820 |
| Temps médian d'une image (headless logiciel), zoom 0,55 / 0,25 / 0,13 | 34 / 32 / 43 ms (29 / 31 / 23 i/s) | 58 / 57 / 60 ms (17 / 18 / 17 i/s) |
| Jour simulé, joueur passif (moyenne / médiane) | 19 / 4,4 ms (version d'avant, même machine) | 20 / 6,2 ms |
| Sauvegarde (`wse-city-v8`) | 104 Ko (jour 0), 248 Ko (jour 60, version d'avant) | 317 Ko |

- Le nombre d'objets dessinés est **borné par les lots** (≈ 2 500 à 2 900 sur la carte), pas par la population : une ville de 4,5 millions coûte ≈ 1,4 à 1,8 fois le rendu de départ
  (17 images par seconde en rendu logiciel sans GPU ; un navigateur avec accélération graphique dessine ces 3 600 à 6 800 appels bien plus vite).
  Les tours de 60 à 96 étages sont un seul sprite HD chacune (jamais plus de 99 étages, au-delà le dessin étage par étage coûterait cher).
- Coûts de simulation corrigés pendant la passe : le champ de trafic (`rebuildTraffic`) répand chaque source sur son voisinage au lieu de sommer toutes les sources pour chaque case
  (≈ 15 fois moins de calcul à 4,5 millions, même champ au cumul flottant près) et n'est recalculé qu'une fois tous les 10 jours au-delà d'un million d'habitants ; le masque des
  routes reliées (`linkedMask`) est gardé tant que les routes ne changent pas ; `eachBiz` parcourt les bâtiments des joueurs sans les milliers d'immeubles de la ville (magasins, usines,
  sources de production). Avant ces corrections, un jour simulé avec le bot coûtait ≈ 3 fois plus à 4,5 millions qu'au départ. Après : 28 ms par jour en moyenne sur toute la partie
  active de 7 200 jours (`city_growth.js`, 4 jours + un tour de bot), 18 ms dans `t34` (seuil 40 ms inchangé), contre 37 ms mesurés avant la passe pour une ville de 730 000 habitants
  (machine plus chargée à ce moment-là).
- Essai écarté : des copies réduites des sprites (mipmaps sur canvas, puis ImageBitmap) pour le dézoom ; en rendu logiciel elles étaient plus lentes ou sans gain mesurable : retirées.
- Carte : 96×96 cases, terre ferme ≈ 150 blocs de 6×6 ; avec la règle des blocs ruraux, la ville peut couvrir ≈ 91 blocs (2 520 lots) ; capacité de logement mesurée ≈ 6,3 millions
  d'habitants au jour 7 200 en jeu actif (`city_growth.js`) ; le bot de `t34`, plus actif, atteint 6,5 millions d'habitants ; plafond physique vers 7 à 8 millions à 96 étages.

## 5. Compatibilité

- Sauvegarde `wse-city-v8` inchangée : les équipements ajoutés sont des cases « mon » ordinaires de `cty` (nom `sorte_n`), les gisements urbanisés disparaissent de `dep`, `cg.trfD`
  (dernier recalcul du trafic) s'ajoute à `cg`. Une sauvegarde d'avant se charge et continue de grandir avec les nouvelles règles ; une ancienne ville (`cv` absent) ne grandit pas.
- Déterminisme : aucun appel à `Math.random` ; l'aléa de la ville reste `crnd()` (sa propre suite) et `hash()`.

## 6. Limites

- Au-delà de ≈ 5 millions, la carte est pleine : la ville ne grandit plus qu'en hauteur jusqu'à 96 étages.
- Les emplois de la ville restent des bureaux (pas de commerces ni d'usines de ville propres) : les commerces et les usines sont ceux des joueurs et des rivaux.
- En jeu très actif, la ville urbanise une grande partie des champs et bois proches (les grands massifs restent) : l'agriculteur doit s'installer plus loin.
