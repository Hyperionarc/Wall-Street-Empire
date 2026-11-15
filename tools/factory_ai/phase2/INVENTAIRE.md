# Phase 2 : inventaire chiffré de la carte

Source : `wall-street-empire/game.template.html` (branche `ccr-d9ba3623-415kh0`), `assets/atlas.json`, `tools/build.py`.
Aucune image générée. Phase 1 (intérieur d'usine, vue Dessus) exclue.

## 1. Faits mesurés dans le code

| Fait | Valeur | Où |
|---|---|---|
| Carte | 96 x 96 cases | `N = 96` |
| Case (losange) | **132 x 66 px** (largeur x hauteur), sommet haut = `iso(x,y)`, centre = `iso(x+.5,y+.5)` | `TW`, `TH`, `iso()`, `tilePts()` |
| Étage d'immeuble | 32 px | `FH = 32` |
| Emprises | 1x1 (défaut), 2x1, 2x2, 3x2, 3x3, 3x4 (fermes) | `TYPES[].w/.h` |
| Largeur d'une emprise | `(w+h) x 66` px : 132 / 198 / 264 / 330 / 396 / 462 | losange d'emprise |
| Zones de sol | 0 campagne, 1 ville, 2 zone portuaire, 3 mer, 4 quai | `ZONE`, `buildZones()` |
| Niveaux d'amélioration | `lvl` 0 à 4 (`MAX_LVL = 4`) = 5 niveaux ; logements : 1 à 6 étages (`MAX_FLOORS = 6`) | `upgradeCost()` |
| Départ du joueur | case (74, 63) = **zone portuaire** (x 66-84, y 54-84), quai x 85-87, mer x >= 88 | `START`, `PORT`, `coastX()` |
| Orientation | une seule vue ; pas de rotation. Véhicules : 4 directions (NE, SE, SW, NW) | `drawCar()` |
| Atlas existant | **99 sprites**, tous issus de packs CC0 Kenney (aucun généré) | `atlas.json`, `build.py` |

Atlas : sol 1, routes 16 (`road0..15`), arbre 1, mines 2, maisons 24 (`hs0..23`, 128x128), logements 9 (`res0..8`, 99x85, empilés par étage), tours 2 (`tech0/1`), banques 2 (`bank0/1`), commerces 12 (`shop0..11`, 132x127), usines 6 (`fact0/1`, `fsmall0/1`, `oil0/1`), véhicules 24 (`veh_<modèle>_<dir>`, ~33x30).

## 2. Hypothèses de regroupement (à valider)

1. **3 niveaux visuels** au lieu de 5 : N1 = `lvl` 0, N2 = `lvl` 1-2, N3 = `lvl` 3-4. Le jeu ajoute 16 px par niveau aux usines (`ex = LV*16`), 2 étages par niveau aux tours (`lvFloors`), +12 % de hauteur aux commerces (`hs`) ; les étoiles restent un calque du jeu.
2. **Logements** : le jeu empile des sprites d'étage ; en HD, une image d'immeuble entier par niveau (N1 = 1-2 étages, N2 = 3-4, N3 = 5-6). Changement de rendu à faire côté intégrateur.
3. **Aucune image pour les calques** dessinés en code : cadres (sélection dorée, survol vert/rouge, non raccordé orange, non alimenté rouge), badge « ! » d'alerte, étoiles, enseignes texte (`sign()`), fumée, animations.
4. Pas de rotation : 1 orientation par bâtiment, hors routes (16 masques) et véhicules (4 directions).

## 3. Inventaire par famille

Images = variantes x niveaux x états. Taille : voir classes en section 4.

| # | Famille | Types / fonctions justifiant la ligne | Variantes | Niv x états | Images | Classe |
|---|---|---|---|---|---|---|
| 1 | **Sol** | `ground`, `ZONE_TINT`, `ZONE_COL`, `drawWater()` : herbe 6, ville 4, port 3, quai 3, eau (profonde, moyenne, bord) 3, rivage 1 (`ZONE[x-1] !== 3`) | 20 | 1 | **20** | T |
| 2 | **Gisements au sol** | `drawDeposit()` : oil, iron, coal, copper, gold, gravel, sand, limestone ; sol de forêt (`d.k==='wood'`) | 9 | 1 (épuisé = `alpha .35` en code) | **9** | T |
| 3 | **Routes** | `roadMask()` 16 masques : isolée 1, bouts 4, droites 2, coudes 4, T 4, croix 1 (`road0..15`). Ponts : **aucun dans le code** (0) | 16 | 1 | **16** | T |
| 4 | **Végétation** | `tree`, `makeDecor()` (20 % campagne, 10 % ville), `drawForest()` (1 à 5 arbres), `drawPark()` | arbres 6, buissons 2 | 1 | **8** | P |
| 5 | **Véhicules** | `CAR_MODELS` (6) x `drawCar()` 4 directions | 6 x 4 | 1 | **24** | P |
| 6 | **Port et quai** | `TYPES.port` 2x2 (3 niveaux), `drawContainers()` (piles, `CONT_COL` 7 couleurs : 6 piles), `drawCrane()` 2, `drawShip()` 3 | 14 | 1 | **14** | S/M |
| 7 | **Maisons** (ville existante) | `npc k:'house'`, `hs0..hs23`, repli `drawHouse()` | 24 | 1 | **24** | S |
| 8 | **Immeubles de logements** | `TYPES.res`, `res0..8`, `mkCell` | 9 | 3 | **27** | S |
| 9 | **Tours de la ville existante** | `drawTowerProc()` `TSTYLE` 6 styles x 2 hauteurs ; repères `a.lm` x 2 | 14 | 1 | **14** | S |
| 10 | **Équipement sportif** | `TYPES.sport` (réutilise `res`) | 2 | 3 | **6** | S |
| 11 | **Bureaux et services** | `tech` 2 var, `off` 1, `bank` 2, `rd` 1, `dc` 1 (x3 niv) = 21 ; **Médias** `tv` x3 = 3 ; **Direction** `hq` 2x2 x3 = 3 (`HQ_IMG` : seul `mid` existe) | 27 | 3 | **27** | S/M |
| 12 | **Monuments et parcs** | `drawMonument()` : stadium, stadium2, hall, telecom, hospital, police, fire, lycee, college, maternelle, garderie (11) ; `drawPark()` 2 | 13 | 1 | **13** | S |
| 13 | **Commerces** | `s1` 4 var, `s2` 2x1 2 var, `s3` 2x2 3 var, `s4` 3x3 1 var, `immo` 2 var ; `tileSprite()`, `shop0..11` | 12 | 3 | **36** | S/M/L |
| 14 | **Fermes et cultures** | `fwheat`, `fsugar`, `fcotton`, `frubber` (3x4) : hangar+silo 4 x 3 niv = 12 ; champs `drawField()` 4 cultures x **3 stades** x 2 = 24 ; clôtures 2 ; tracteurs 2 | 40 | | **40** | S/M |
| 15 | **Mines, puits, bois** | `miron`, `mcoal`, `mcopper`, `mgold` x 2 var (`mine0/1`) x 3 niv = 24 ; `well` (`drawPumpjack()`) 3 ; `logging` (`drawLoggingCamp()`) 3 | 30 | | **30** | S |
| 16 | **BTP** | `qgravel`, `qsand`, `qlime` (`drawQuarry()`) x 3 niv = 9 ; `btp` 2x1 (`drawTowerCrane()`) x 3 = 3 | 12 | | **12** | S/M |
| 17 | **Usines (extérieur)** | `drawIndustrial()` : `f1` 2 var, `f2` 2x1 2 var, `f3` 2x2 2 var, `f4` 3x3 1 var, `foundry` 1, `wh` 2 var ; x 3 niv. `WALLS` : couleurs de mur déclinées par code, pas par image | 10 | 3 | **30** | S/M/L |
| 18 | **Énergie et réseau** | `plant` 2x1, `solar` 2x2, `wind`, `nuclear` 3x2 (x3 niv = 12) ; `pylon` 2, `cable` 1, `pipeline` 6 pièces (droits 2, coudes 4 ; T et bouts composés en code) = 9 | | | **21** | S/M |
| 19 | **États** | chantier (`born`, anim 600 ms) : 5 emprises x 3 phases = 15 ; ruine / abandonné : 5 emprises (**non codé** : événements « incendies » seulement textuels) | | | **20** | S/M/L |
| | **Sous-total carte** | | | | **391** | |
| 20 | **Vitrines** | voir `VITRINES.md` | 9 | | **9** | V |
| | **TOTAL** | | | | **400** | |

Contrôle : 20+9+16+8+24+14 = 91 ; +24+27+14+6 = 162 ; +27 = 189 ; +13 = 202 ; +36 = 238 ; +40 = 278 ; +30 = 308 ; +12 = 320 ; +30 = 350 ; +21 = 371 ; +20 = 391 ; +9 = 400.

## 4. Tailles recommandées (échelle HD = 3 px par px du jeu)

| Classe | Objet | Sortie finale (px) | Génération (carré) |
|---|---|---|---|
| T | tuile 1x1 losange | 396 x 198 (route : 396 x 303) | 768 |
| S | bâtiment 1x1 | 396 de large, 450 à 700 de haut | 768 |
| M | 2x1 : 594 de large ; 2x2 : 792 | hauteur 500 à 900 | 1024 |
| L | 3x3 : 1188 ; 3x2 : 990 (f4, s4, nucléaire) | hauteur 800 à 1100 | 1280 (lent : 8 images seulement) |
| P | véhicule, arbre, grue | 100 à 200 | 512 |
| V | vitrine | 1920 x 1080 (cf. `VITRINES.md`) | 1536 x 864 puis agrandissement non génératif |

Les fermes 3x4 ne sont pas générées d'un bloc (462 x 3 = 1386 px) : hangar+silo (emprise 1x2) + champs de 1 case, assemblés par le jeu.

## 5. Écarts avec la cible 400-500

- **400 images retenues** (391 carte + 9 vitrines) : bas de la fourchette. Avec 20 à 25 % de rebuts (hypothèse, à remplacer par le taux mesuré en phase 1), il faut **environ 480 à 500 générations**.
- Marge pour monter vers 450 sans changer le plan : 2e variante de `s3` et `f4` (+6), 3 arbres de forêt (+3), 2 phases d'activité du puits (+6), nuit/éclairé (hors périmètre, non codé).
- **Non dessiné par le jeu, donc non inclus sauf mention** : ponts (0), stades de croissance des cultures (le code ne dessine qu'un champ statique : les 3 stades supposent un petit changement de code), états vide/plein, brûlé (seuls ruines et chantiers sont proposés), `HQ` small/large (une seule image `mid` aujourd'hui, repli du code).
- Marqués « non codé » : à confirmer avec l'intégrateur avant lancement du lot concerné (lots 4-5 chantiers, lot 20 ruines, lots 12-14 champs).
