# Journal du responsable Port (rendu du terminal portuaire)

## Mission (Rémy)
« Ça ressemble à rien ton port. » Référence : photo aérienne d'un terminal à conteneurs (type Dunkerque) : grand porte-conteneurs à quai, portiques alignés, terre-plein clair, conteneurs en rangées ordonnées séparées par des allées, engins dans les allées, silos et hangars au fond.

## Avant (captures `captures/port_avant_large.jpg`, `port_avant_moyen.jpg`, `port_avant_proche.jpg`)
- Zone portuaire (x 66-84, y 54-84) : immense aplat d'asphalte sombre, vide.
- Quai (3 cases) : conteneurs, grues bleues, bacs de matières, réservoirs et trémies posés au hasard (hash par case) ; aucun front de quai lisible ; aucun navire à quai (les navires passent au large).

## Après (captures `captures/port_apres_large_1navire.jpg`, `port_apres_large_4navires.jpg`, `port_apres_moyen.jpg`, `port_apres_proche.jpg`)
- **Sol** : `sol_terminal`, l'asphalte du port remappé en béton clair (même mécanisme `P2_RECOL` que les gisements dérivés), marquages au sol conservés.
- **Parc à conteneurs** (deux colonnes de blocs côté quai, x 73-83) : par case, 3 rangées parallèles au quai, 2 conteneurs par rangée, hauteur régulière par rangée (2 à 4 niveaux, parfois une pile entamée), palette sobre dominée par bleus, rouges, marron et gris ; allée marquée (bord blanc, axe en tirets jaunes) entre les blocs ; cavaliers et chariots dans les allées.
- **Quai** : rangée de conteneurs bas, voie de circulation (tirets, cavaliers, camions), bord de quai avec liseré jaune, bollards et **portiques alignés face aux postes** (un toutes les 2 cases quand un navire est à quai, un seul sinon) ; flèche du portique au-dessus du pont du navire (navires dessinés avant le bâti).
- **Navires à quai** : 4 postes (y 66, 74, 58, 81). Le nombre suit l'activité réelle : import + export des 30 derniers jours (`finM()` : `imports + revExport`) ; 1 navire au départ (le port public importe pour la ville), 2 dès 20 000 $/jour, 3 dès 150 000 $/jour, 4 dès 600 000 $/jour (4e poste : vraquier).
- **Fond du port** (x 67-71) : par bloc, 4 grands bâtiments espacés : silos blancs, hangars, terminal vrac, hangars, silos (du nord au sud).
- Le phare reste à la pointe du quai.

## Règles respectées
- Décor pur : rien n'est sauvegardé ; une case bâtie (joueur ou rival) cache son décor ; usine posée sur le parc et port posé sur le quai vérifiés (t119). `ZONE_NEED`, `footprintError`, `zoneErr`, `znBuildAid`, `EXP_PORT` et les chaînes d'import / export inchangés.
- Aucun texte dans les images, aucun `rnd()` (agencement par `hash()`).
- Sprites réutilisés (atlas phase 2 et `factory_hd/port_*`) : `navire_cargo`, `port_navire_vraquier`, `port_portique_quai` (en miroir, flèche vers le navire), `port_cavalier_straddle`, `port_reach_stacker`, `camion_ville`, `port_reservoirs`, `port_entrepot_a`, `port_terminal_vrac`, `port_phare`. Les conteneurs du parc sont dessinés en vectoriel (style du jeu) et pré-rendus.

## Performance
- Chaque case de parc est une image pré-rendue (12 variantes × 2 sortes × résolution la plus proche de z × dpr, cache borné à 144 images) ; les sprites du port sont mis à l'échelle une fois (`pySpr`) au lieu d'être rééchantillonnés à chaque image.
- Mesure `tools/port_perf.js` (Chromium sans GPU, zoom 0,55, médiane de l'intervalle entre images) : 42,5 ms avant, 44,9 ms après ; décor du port 1 à 2 ms par image dans t119 (3 zooms). La première version, sans cache des sprites, coûtait 59 ms de décor par image : corrigée.

## Emprunté (principe) / conçu
Principe d'un terminal réel : séparation quai / parc / arrière-port, rangées parallèles au quai, portiques face aux postes. Agencement, palette, règle du nombre de navires et code conçus pour le jeu.

## Reste imparfait
- Les portiques réutilisent `port_portique_quai` (grue à flèche grise) : un vrai portique à conteneurs blanc et rouge (STS) serait plus juste. Commande d'asset notée dans `tools/factory_ai/RETOURS.md`.
- Le chariot `port_reach_stacker` n'a qu'une orientation : il se présente parfois de biais dans l'allée.
- Le navire du couloir de passage (x 91) peut croiser le 4e poste au sud.
- En rendu logiciel (sans GPU), les blocs de sol se cuisent lentement : une capture prise trop tôt montre des blocs en aplat (déjà le cas avant).
