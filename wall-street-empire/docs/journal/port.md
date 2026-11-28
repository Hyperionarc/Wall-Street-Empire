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

---

# Passe 2 : port constructible, isométrique, escales animées (branche `port-parcelles`)

## Constat (Rémy et chef de projet, en jouant)
- Le parc à conteneurs décoratif remplissait 10 blocs entiers (x 73-83) et le fond du port les 5 autres : sur 15 blocs du terre-plein, **aucun** ne paraissait libre.
  Le joueur ne voyait plus où bâtir, alors que la règle est « on construit où on veut, la subvention incite ».
- « Plein de problèmes isométriques » : objets du fond trop petits (0,76 à 0,85 case de large dans une case), flottant 7 px monde au-dessus du coin avant ;
  sprites `port_entrepot_a` (pente du bord droit 0,78 au lieu de 0,5) et `port_reservoirs` (demi-hauteur 185 px pour 150 attendus) qui ne sont pas en 2:1 ;
  portique = grue grise à flèche (`port_portique_quai`), sprite de 170 px posé sur une case de bord.
- Spécification (Rémy) : « une PETITE BANDE derrière le quai où tu alignes des conteneurs sur toute la longueur du port ; pas 5 × 2 = 10 blocs complets ».
- Ajout (Rémy) : « voir les conteneurs se remplir sur les bateaux, en animation ».

Captures avant : `captures/port2_avant_z0.35.jpg`, `port2_avant_z0.7.jpg`, `port2_avant_z1.2.jpg`.

## Livré
- **Bande de conteneurs** : colonne x = 83 (dernière colonne du terre-plein, juste derrière l'avenue du quai x = 84), sur toutes les rangées hors avenues de y 55 à 83
  (25 cases, toute la longueur du port). Par case : 5 conteneurs posés **en travers** (axe long perpendiculaire au quai, u 0,14-0,90, largeur 0,16), 2 à 4 niveaux
  réguliers (pile parfois entamée), liseré blanc d'allée côté terre, ombre portée dans la case. Rien ne déborde sur l'avenue.
- **Parcelles libres** : 14 blocs sur 15 (93 %) sans décor, béton clair, contour en pointillé gris et équerres jaunes aux 4 coins (au sol, avant le bâti ;
  le bloc du bord garde 4 colonnes, la bande est hors parcelle). Survol (étiquette discrète existante, aucun pop-up) :
  « **Terrain portuaire · subvention 40 %** » puis « Parcelle libre · usines, hangars, entrepôts » (taux `znRate('indus')`, celui que `znBuildAid` applique en zone 2) ;
  la bande se dit « Parc à conteneurs · constructible », les avenues « Route ».
- **Fond du port** : un seul bloc (sud-ouest, x 67-71, y 79-83), 4 objets de **2 × 2 cases** exactes (silos, hangar, hangar, silos) séparés par des allées,
  dessinés en vectoriel isométrique (plus de sprite hors 2:1), chacun à sa case avant. Un bâtiment posé dans ce bloc efface tout le décor du bloc.
- **Portiques de quai** (vectoriel pré-rendu, une image par résolution) : jambes en caissons blancs de part et d'autre de la voie du quai (x 85,15 et 86,85 ;
  la voie x 86 passe entre), bogies sur le quai, traverse et croix de Saint-André, flèche en treillis rouge (membrures et diagonales) de x 84,3 (arrière-flèche,
  salle des machines) à x 90,6 (au-dessus du navire, bord extérieur 89,9), chevalet et haubans ; chariot, câbles, palonnier jaune, conteneur suspendu.
  Plus de sprite de grue grise ; la commande d'asset n° 22 de `tools/factory_ai/RETOURS.md` n'est plus nécessaire pour le jeu (non recopiée).
- **Escales animées** (fonction pure du temps et du poste, `pyCycle`, escale de 150 s) : arrivée proue en avant (le navire descend le quai vers +y, proue en bas à gauche,
  comme `navire_cargo` dans `mouvements.md`), accostage, **déchargement** (le pont se vide conteneur par conteneur), escale, **chargement** (le pont se remplit),
  appareillage, départ proue en avant vers +y. Pont = grille 8 baies × 4 rangées × 3 niveaux (96 conteneurs), 3 portiques en parallèle (une section de baies chacun),
  chargement niveau par niveau. Mouvement d'un conteneur : descente du palonnier, levée, translation du chariot le long de la flèche, pose (et l'inverse) ;
  le portique se décale d'une baie à l'autre en douceur. Camion sous le portique (voie du quai à sens unique +y, sprite dans son sens) : il arrive chargé et repart vide
  au chargement, arrive vide et repart chargé au déchargement.
  Cargaison proportionnelle aux échanges réels : remplissage 0,55 à 1 selon import + export des 30 jours par navire, partage import (débarqué) / export (embarqué).
  Couleurs variées par escale (hash). Le nombre de navires suit toujours `PY_SHIP_T` (inchangé).
- **Profondeur** : liseré et bollards du quai dessinés au sol avant les navires (le château passe devant) ; navires avant le bâti ; portiques et palonniers à la rangée
  de leur axe (après le navire : la flèche passe au-dessus du pont) ; camions à la rangée de leur position ; objets du fond à leur case avant.
- Outils : `tools/port_shots.js` (captures dpr 2 à plusieurs zooms ; `PORT_SEQ=0.05,0.2,…` séquence d'escale à horloge figée ; `PORT_BUILD=1` avec bâtiments posés).
  `WSE.port` expose `blocks`, `cycle`, `crane`, `cargo`, `setClock`, `built`, `dbg` (audit et tests).

## Audit isométrique (mesuré dans t119 : empreinte dessinée vs empreinte logique)
| Objet | Avant | Après |
|---|---|---|
| Hangar (fond) | sprite `port_entrepot_a` 112 px = 0,85 case dans une case, base 7 px au-dessus du coin avant, pente 0,78 (non 2:1) | 2 × 2 cases, vectoriel, largeur ±124,3 px (emprise inscrite ±124), 0 pixel hors colonne, contact au sol 3,8 px (marge d'emprise 0,06 case) |
| Silos (fond) | sprite `port_reservoirs` 100 px = 0,76 case, flottant 7 px, demi-hauteur 1,24 × l'isométrie | 2 × 2 cases, ±124 px, 0 pixel hors colonne, contact 3,8 px |
| Terminal vrac (« concasseur ») | sprite 0,76 case, flottant 7 px | retiré du décor |
| Case de bande | (parc : 10 blocs entiers) | 0 pixel hors colonne, contact 4,5 px |
| Case de quai | 0 pixel hors colonne | 0 pixel hors colonne |
| Portique | sprite 170 px (1,29 case) sur une case de bord, flèche grise | jambes au sol sur le quai (85,08-86,92), voie entre les jambes, flèche au-dessus du navire |
| Avenue x 84 | conteneurs du parc jusqu'au bord de l'allée | centre de chaque case d'avenue mesurée en bitume gris sur la capture |
| Décor sur les avenues | 0 | 0 |

## Captures après
- `captures/port2_apres_z0.35.jpg`, `port2_apres_z0.7.jpg`, `port2_apres_z1.2.jpg` (port vierge, jour 1).
- `captures/port2_apres_bati_z0.55.jpg` : deux usines et un entrepôt posés dans trois parcelles : bâtiments nets, parcelles voisines lisibles.
- Séquence d'escale (zoom 1, poste y 66) : `captures/port2_escale_t0.05.jpg` (arrivée, 53 conteneurs à bord), `t0.2` (déchargement, 42), `t0.3` (26), `t0.45` (3),
  `t0.6` (chargement, 5), `t0.75` (14), `t0.85` (19), `t0.95` (départ, 22).

## Performance (Chromium sans GPU, 1280 × 800, zoom 0,8 centré x 82 y 66, horloge figée, médiane sur 30 images)
- Avant (city.html de la branche de départ) : décor du port 27,7 ms, intervalle entre images 72 ms. Après : 19,2 ms et 40 ms (le parc de 10 blocs coûtait plus que
  la bande, les portiques et les navires réunis). Mesures bruitées (autre agent sur la machine), ordre de grandeur stable.
- Pré-rendu : cases de bande et de quai (12 variantes), portique, silos, hangar (une image par résolution, cache borné à 174) ; pont d'un navire re-rendu
  seulement quand son nombre de conteneurs change (une fois par mouvement, environ 1,5 s).

## Règles respectées
`EXP_PORT`, chaînes d'import / export, `PY_SHIP_T`, `ZONE`, `footprintError`, `znBuildAid` inchangés ; sauvegarde `wse-city-v8` inchangée (rien de nouveau n'est
sauvegardé) ; agencement et couleurs par `hash()`, aucun `rnd()` ; aucun texte dans les images ; Mall non touché.

## Emprunté (principe) / conçu
Principe d'un terminal réel : portique à jambes enjambant la voie, flèche au-dessus du navire, chargement par niveaux, camions sous le portique. Conçus pour le jeu :
bande unique derrière le quai, parcelles marquées et subvention au survol, escale à phases, cargaison liée aux échanges, dessin vectoriel.

## Tests (lancés un par un, branche `port-parcelles`)
t119 20 PASS (refait : bande sur toute la longueur, 14/15 blocs libres, survol avec le taux réel, audit isométrique, escale qui se vide / se remplit sans saut,
cargaison selon les échanges, avenue en bitume, construire en parcelle / bande / fond / quai, décor non sauvegardé ; décor 0,5 / 30,9 / 16,3 ms aux 3 zooms en logiciel) ·
t01 7 · t05 6 · t44 45 · t49 8 · t53 26 · t120 20 (0 FAIL). t119 n'a été adapté que pour la densité voulue du décor (parc 10 blocs → bande) et les ajouts demandés.

## Reste imparfait
- Les navires à quai sont en vectoriel (coque, château, pont) : plus sobres que les sprites HD des navires de passage.
- La bande est une colonne du dernier bloc (ses cases restent constructibles, le décor s'efface sous le bâtiment) ; le bloc du bord compte 4 colonnes de parcelle.
- Les cavaliers et chariots du parc ont disparu avec lui (les camions sous les portiques les remplacent) ; pas encore de navette continue quai → bande.
- Le chronomètre de l'escale suit le temps réel (animation), pas la vitesse de jeu.
