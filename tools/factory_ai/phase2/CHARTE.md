# Phase 2 : charte graphique (1 page)

Style : maquette 3D réaliste (miniature photographiée), vue isométrique 2:1, caméra à 30 degrés. Modèle : FLUX.2 klein 4B uniquement (licence Apache 2.0). Texte de style de base : `config.json` > `style`.

## Lumière et ombres

- Lumière du jour **venant du haut-gauche**. Comme dans le code (`pPrism`) : face avant-gauche = teinte x 0,82, face droite = x 0,62, dessus = x 1,08. La face gauche est donc la plus claire des deux faces verticales.
- **Pas d'ombre au sol dans l'image** (`no ground shadow`) : l'ombre est un calque séparé (`ombres/<nom>.png`, vers le bas-droite, comme en phase 1). Pas de reflet de sol.
- Lumière neutre, légèrement chaude ; pas de nuit, pas de brume, pas de contre-jour.

## Palette par famille (valeurs du code)

| Famille | Teintes dominantes | Source |
|---|---|---|
| Sol campagne | herbe `#a9b98c`, teinte `#70bc5c`, `#3a5c42` | fond de carte, `ZONE_TINT[0]`, `ZONE_COL[0]` |
| Sol ville | pavé gris-bleu `#cdd0de`, `#60647d` | `ZONE_TINT[1]`, `ZONE_COL[1]` |
| Zone portuaire | béton gris `#807a82`, `#605a62` | `ZONE_TINT[2]`, `ZONE_COL[2]` |
| Quai | `#52566a`, `#606676` | `ZONE_COL[4]` |
| Eau | `#4a9ad4` (bord) à `#1e5a98` (profond), écume `#ffffff` | `drawWater()` |
| Routes | asphalte gris moyen, marquage blanc ; pas de teinte du jeu (sprites Kenney) | `road0..15` |
| Habitat | murs `#e9dcc0`, `#d9e3ee`, `#f2d9c4`, `#cfe0c8`, `#efe8d6`, `#f3c9c9` ; toits `#b5483a`, `#4a5a7a`, `#8a4a32`, `#5a6a4a`, `#3f4a62`, `#7a3a4a` ; jardin `#7fae5a` | `HCOL`, `drawHouse()` |
| Immeubles (accent logement) | `#7f96ff` | `TYPES.res.color` |
| Tours et bureaux | verre bleu `#5f8fc4`/`#7fb2dc`, verre vert `#4fa08a`/`#7fd0b4`, pierre `#cfc4a8`, brique `#a84e3a`, art déco `#d8d2c0` ; accent tech `#3fd8ff` | `TSTYLE`, `TYPES.tech.color` |
| Banque, direction | pierre claire + dorures `#f2b84b`, `#ffd76a` | `TYPES.bank`, `TYPES.hq` |
| Médias | accent `#ff9bd0` ; mât rouge/blanc `#ff5a5f`, `#e9edff` | `TYPES.tv`, `chimney()` |
| Commerces | s1 accent `#46d39a`, s2 `#7f96ff`, s3 `#ff4fa3`, s4 `#ff7ad0`, immo `#ffb347` (bandeau coloré, sans texte) | `CLS`, `TYPES.s*` |
| Usines | murs `#d8c9a8`, `#c9d2dc`, `#d4a98f`, `#bfd0c0` (f1) ; `#b9c6d6`, `#c5ccb4`, `#cdbba6` (f2) ; `#a9b4c6`, `#b9bfc9` (f3) ; `#aeb9cc`, `#c4c9d4`, `#b5c2bb` (f4) ; toit `#7d8599` ; cheminée brique `#9a6a52` ; cuves `#cfd5e6` ; porte `#e0a03a` | `WALLS`, `drawIndustrial()` |
| Fermes | hangar `#b5483a`, toit `#7a2f26`, silo `#cfd5e6`, clôture `#8a6a3a`, tracteur `#2f9a4a` ; cultures blé `#d9c25a`, canne `#7fcf6a`, coton `#86b861` avec fleur `#ffffff`, hévéa `#2f8a4a` | `CROP_COL`, `drawField()` |
| Mines et gisements | fer `#8a4630`/`#b4614a`, charbon `#1d1f2b`/`#3a3d52`, cuivre `#1f8f7d`/`#46d3bb`, or `#c9972f`/`#ffec96`, pétrole `#241a3d`/`#4b3b78`, gravier `#6f6f78`/`#9d9da8`, sable `#cdb877`/`#ecdca6`, calcaire `#cfcab8`/`#f3f0e4` | `drawDeposit()` |
| Puits | base `#2a3150`, balancier `#ffb15c`, tête `#ff8a3d`, contrepoids `#ff5a5f` | `drawPumpjack()` |
| Bois | cabane `#d0a064`, toit `#c0453a`, grumes `#e2b678` | `drawLoggingCamp()` |
| BTP | pelle `#f2b84b`/`#ffd56a`, grue `#ffb347`, tas gravier `#8e8e98`, sable `#e0c98a`, calcaire `#ebe7da` | `drawQuarry()`, `drawTowerCrane()` |
| Port | coque `#3a456f`, liseré `#c0392b`, cabine `#f3f4f8`, grue `#ff5a5f`/`#ffb347`, conteneurs `#ff5a5f #3fd8ff #f2b84b #46d39a #7f96ff #ff8a3d #e9edff` | `drawShip()`, `CONT_COL` |
| Énergie | centrale accent `#ffd43b`, nucléaire `#cfd3de` + voyant `#c3ff6b`, éolienne `#e9edff`, pylône `#3a3f58` | `TYPES`, `drawIndustrial()` |
| Monuments | hôpital `#f2f5fa` + croix `#e03a3a`, police `#6f86b8`, pompiers `#c2403a`, lycée `#d9b184`, collège `#e0a070`, mairie `#e0d2b0` + dôme `#d4af37`, stade `#cfd2de`, pelouse `#3f8a3f` | `drawMonument()` |
| Véhicules | rouge, bleu, vert, noir, argent, camion noir | `CAR_MODELS` |

## Matériaux

Béton lisse et brique pour l'habitat ; verre teinté et acier brossé pour les tours ; tôle ondulée peinte et béton pour les usines ; bois, tôle rouge et toile pour les fermes ; roche brute et terre pour les mines ; acier, peinture usée et conteneurs rouillés légers pour le port. Aspect « maquette » : petits défauts, bords nets, saturation haute (`saturated colors`).

## Niveaux : ce qui distingue N1, N2 et N3

| | N1 (`lvl` 0) | N2 (`lvl` 1-2) | N3 (`lvl` 3-4) |
|---|---|---|---|
| Hauteur | de base (usine f1 : 1 hall) | +1 étage / +16 px de jeu par niveau (`ex`) ; tours +2 étages | +2 étages ; cheminée ou antenne plus haute |
| Matériaux | enduit, tôle simple | enduit propre, bardage, vitrage plus grand | verre et métal, toits techniques, façade soignée |
| Détails | peu d'équipements, 1 cheminée | + annexe, + cuves, + véhicules de service | + passerelles, + panneaux solaires de toit, parking, balisage |
| Logements | 1-2 étages, toit simple | 3-4 étages, balcons | 5-6 étages, terrasse de toit |
| Commerces | enseigne basse | +12 % de hauteur, vitrines | +24 %, auvent, parking |

Le même bâtiment doit rester reconnaissable d'un niveau à l'autre (mêmes proportions de base et couleurs, hauteur et détails en plus) ; N2 et N3 sont générés à partir du gabarit exporté pour `lvl` 2 et 4.

## Interdits

- **Pas de texte, pas de lettres, pas de chiffres, pas de logo, pas de marque** (le jeu ajoute ses enseignes : `USINE`, `SUPER`, `IMMO`, `BTP`, `HQ`, `$` sont des calques).
- **Fond gris clair uni** (`plain uniform light grey background`), rien d'autre dans le cadre.
- **Un seul objet isolé**, centré, entièrement visible, sans sol décoratif ni bordure sauf pour les tuiles de sol.
- Pas de personnes lisibles (silhouettes lointaines tolérées sur le port), pas de ciel, pas de brouillard, pas de fumée dense (la fumée est un calque).
- Angle strictement 2:1 / 30 degrés ; pas de perspective forte, pas de vue de face ou de dessus.
- Pas d'effets (flou, grain, vignette, bloom) ; pas d'étoiles de niveau ni de bulle d'alerte dessinées.

## Leçons de la phase 1

(À compléter avant tout lancement de la phase 2.)

- Rebuts (taux mesuré, causes principales) : 
- Réglages qui marchent (`steps`, `taille`, `quantize`, `seed`, mode gabarit vs libre) : 
- Secondes par image, par classe de taille : 
- Consignes de sujet qui marchent / à éviter : 
- Références de style retenues (`style/`) : 
- Problèmes d'ancre, d'échelle ou d'orientation relevés par l'intégrateur : 
