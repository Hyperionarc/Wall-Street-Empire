# Phase 2 : gabarits (forme, emprise, échelle, ancre fixés pour le modèle)

Principe (identique à la phase 1) : chaque image est un re-rendu guidé par un gabarit (`mflux-generate-flux2-edit`, consigne `consigne_gabarit`). Le gabarit fixe l'emprise, l'angle 2:1 et l'ancre ; le modèle ne fait que le rendu maquette. Sans gabarit : rendu libre guidé par les références de style (`consigne_libre`), seulement pour les petits objets.

## 1. Convention d'emprise et d'ancre (toutes familles)

- Gabarit exporté à l'échelle HD (x3) sur fond gris uni, même taille que la sortie finale (cf. `INVENTAIRE.md` section 4).
- **Ancre** = centre du losange d'emprise = `iso(x + w/2, y + h/2)` ; pour 1x1 : (largeur/2, y du centre du losange). Le losange d'emprise a pour sommets `iso(x,y)` (haut), `iso(x+w,y)` (droite), `iso(x+w,y+h)` (bas), `iso(x,y+h)` (gauche), soit `(w+h) x 66` px de large et `(w+h) x 33` de haut dans le jeu.
- L'export écrit `gabarits/<famille>/<nom>.png` + `ancres.json` (`ancre_x`, `ancre_y`, `largeur`, `hauteur`, `echelle_px_par_m` de la phase 1 remplacé par `echelle_hd: 3`).

## 2. Ce qui existe déjà (atlas : réutilisable comme gabarit après agrandissement x3)

L'atlas est en pixel art 132 px : bon pour la forme et l'emprise, pas pour le détail. Fichiers : `wall-street-empire/assets/atlas.png` + `atlas.json` ; sources unitaires dans `assets/src/`.

| Famille (INVENTAIRE) | Sprites d'atlas | Taille source | Couverture |
|---|---|---|---|
| 1 Sol | `ground` | 132x99 | 1 des 20 images (herbe) ; zones port/quai/ville = teintes `ZONE_TINT` sur `ground` |
| 3 Routes | `road0..road15` | 132x101 | **16/16** (masque identique à `roadMask()`) |
| 4 Végétation | `tree` | 32x45 | 1 des 8 |
| 5 Véhicules | `veh_<modèle>_<NE/SE/SW/NW>` | ~33x30 | **24/24** |
| 7 Maisons | `hs0..hs23` | 128x128 | **24/24** |
| 8 Immeubles res | `res0..res8` (un étage, sans socle) | 99x85 | 9 variantes ; N1..N3 = empilement x2, x4, x6 (à exporter en composition) |
| 11 Bureaux | `tech0/1`, `bank0/1` (étages empilés) | 100x85 | tech 2, bank 2 ; `off`, `dc`, `rd`, `tv` réutilisent `tech0/1` |
| 13 Commerces | `shop0..11` (s1 : 0,4,5,6 ; s2 : 7,8 ; s3 : 9,10,11,1 ; immo : 1,3,4,5) | 132x127 | s1, s2, s3, immo ; **s4 : aucun** |
| 15 Mines | `mine0/1` | 133x133 | 2 variantes (+ tas de minerai en code) |
| 17 Usines | `fact0/1` (f2, f3, plant, btp), `fsmall0/1` (f1, wh), `oil0/1` (fonderie) | 133x127 | f1, f2, f3, wh, foundry (1 niveau) ; **f4 : aucun** |
| 9 Tours NPC | `res`, `tech0/1`, `bank0` empilés (`a.floors`) | | repli pour les hauteurs |

Phase 1 : `assets/factory/` (arbre, buisson, sol béton) reste réservé à l'usine, ne pas réutiliser.

## 3. Ce qui doit être exporté du vectoriel (aucun sprite)

| Famille | Fonction(s) de dessin à exporter | Paramètres du gabarit |
|---|---|---|
| 1 Sol (port, quai, eau, rivage) | `drawWater(p,now,x,y)`, `blit('ground')` + `ZONE_TINT[2]`, `[4]` | un losange 1x1 ; eau : x - `coastX(y)` = 0, 3, 6 |
| 2 Gisements | `drawDeposit(p,d,now,x,y)` pour chaque `d.k` ; forêt : `ZONE_TINT` bois | `d = {k, r: 1}` |
| 6 Port | `drawContainers(p,seed,tall)`, `drawCrane()`, `drawShip(px,py,seed)`, `drawTileOf` pour `a.t==='port'` | seeds 0 à 5 ; navire : axe y de la carte |
| 9 Tours NPC | `drawTowerProc(a,p,now)` | `a.floors` 8-20 / 21+ ; `TSTYLE` via `a.seed` |
| 12 Monuments, parcs | `drawMonument(a,now)` (11 `a.m`), `drawPark(a,now)` | `a = {m, x, y, seed}` |
| 14 Fermes | `drawIndustrial` branche `CROPS[...]` (hangar, silo, clôture), `drawField(p,d,x,y)` | `d.k` x 4 ; stades : faire varier la hauteur des plants dans `drawField` (3 hauteurs : 4, 10, 18 px) |
| 15 Puits, bois | `drawPumpjack()`, `drawLoggingCamp()`, `drawPile()` | balancier `ang` = 0 |
| 16 BTP | `drawQuarry(p,now,seed,active,kind)`, `drawTowerCrane()` | `kind` qgravel/qsand/qlime |
| 17 Usines | `drawIndustrial(a,now,grow)` : `f1`, `f2`, `f3`, `f4`, `wh`, `foundry` + `chimney()` de `drawOverlay` | `a.lvl` 0 / 2 / 4 pour N1 / N2 / N3 ; `grow = 1` |
| 18 Énergie et réseau | `drawIndustrial` : `plant`, `solar`, `wind`, `nuclear`, `pylon`, `cable`, `pipeline` | `wind` : `S.wind` fixe |
| 19 États | chantier : `drawTileOf` avec `born`, `grow` = 0,3 / 0,6 / 0,9 ; ruine : sans fonction (gabarit = bâtiment de même emprise, consigne « ruined, burnt ») | |
| 11 Direction (hq) | `HQ_IMG.mid` (PNG `assets/hq/hq_mid.png`, 480x669) : déjà une image, gabarit direct | |

## 4. Méthode d'export : `tools/factory_ai/export_gabarits.js` (à écrire, hors périmètre de cette préparation)

Playwright (Chromium), page = `wall-street-empire/city.html` générée par `python3 wall-street-empire/tools/build.py` (l'atlas y est embarqué ; `game.template.html` seul n'a pas ses sprites).

1. `page.addInitScript` : neutraliser `requestAnimationFrame` après le premier appel (la boucle `frame()` redessinerait le canevas), fixer `Math.random`.
2. `page.evaluate` : lancer une nouvelle partie (`newCity()` puis `S` existe), puis surcharger `sign = () => {}` et les `ctx.fillText` d'enseigne (la charte interdit tout texte) ; fixer `now = 0`.
3. Pour chaque ligne du manifeste : redimensionner `cvs` à (largeur x hauteur HD), `ctx.setTransform(3,0,0,3,ox,oy)` avec `(ox,oy)` calés sur l'ancre, effacer en transparent, créer `a = mkCell(type, seed)` (c'est ce que fait le jeu pour le fantôme), poser `a.x, a.y, a.lvl, a.floors`, appeler `drawTileOf(a,x,y,ox,oy,{now:0})` pour chaque case de l'emprise puis `drawOverlay(a,{now:0})` (cheminées, grues ; `a.lvl = 0` pour ne pas dessiner les étoiles, qui sont un calque).
4. Fonctions sans cellule (`drawWater`, `drawDeposit`, `drawContainers`, `drawCrane`, `drawShip`, `drawField`, `drawPumpjack`...) : appel direct avec `p = iso(x,y)`.
5. `cvs.toDataURL('image/png')` -> PNG alpha ; remplacer le fond transparent par le gris uni de `config.json` pour l'entrée du modèle ; rogner à l'emprise ; écrire `ancres.json`.
6. Sorties : un gabarit par ligne du manifeste (`gabarit.fichier`). Pour les familles sur atlas : copie x3 (Lanczos) depuis `atlas.png` selon `atlas.json`, sans passer par le navigateur.
7. Contrôle : planche d'aperçu des gabarits (grille de 20) relue avant tout lot ; refuser tout gabarit avec texte, cadre de sélection ou fumée animée.

## 5. Récapitulatif

| Source du gabarit | Images couvertes | Part |
|---|---|---|
| Atlas (agrandi x3) | routes 16, véhicules 24, maisons 24, immeubles 27, commerces 33 (hors s4), mines 24, usines f1-f3/wh/foundry 24, bureaux 21, ground 1, arbre 1 | ~195 |
| Vectoriel exporté | sol port/quai/eau 12, gisements 9, port 14, tours NPC 14, monuments 13, fermes 40, puits/bois 6, BTP 12, f4/s4 6, énergie/réseau 21, chantiers/ruines 20, sport 6, tv/hq/rd/dc 12 | ~185 |
| Sans gabarit (rendu libre) | herbe 5, arbres 5, buissons 2, vitrines 9 | ~20 |
