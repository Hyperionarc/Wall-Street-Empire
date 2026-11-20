# Revue de tous les bâtiments (passe 78)

Déclencheur : retour de Rémy — « les usines : la moyenne est OK, mais la petite et la grande c'est n'importe quoi ; la petite n'est ni faite ni à faire. Les supermarchés et hypermarchés : l'angle isométrique est toujours COMPLÈTEMENT INVERSÉ par rapport aux autres bâtiments, et les toits sont en train de s'effondrer comme du sucre qui a reçu de l'eau. »

Planches : `docs/revue_batiments/` (avant/après en jeu, toits avant/après, une planche de contact par famille avec la note, éclairage avant/après miroir).
Tests : `tools/tests/t80_orientation.js` (convention d'éclairage), `tools/tests/t81_encodage.js` (qualité d'encodage mesurée en jeu).

## 1. Diagnostic mesuré : l'artefact de compression est PROUVÉ

Méthode : chaque sprite de bâtiment de la phase 2 (85 sprites : usines, commerces, logistique, énergie, services, tours, logements, extraction) est rendu **en jeu**, avec la fonction de dessin du jeu (`vvDraw` / `p2Draw` + recalage `p2Fit`), isolé, aux zooms 1,5 et 2,5, trois fois : avec l'image réellement embarquée dans `city.html`, avec la source réduite ×0,5 **sans** palette, et avec la source PNG pleine définition (référence). Écart mesuré sur les pixels opaques : PSNR, SSIM (luminance, fenêtre 7×7) et « taches » = part des pixels des zones lisses de la référence (écart type local < 3 : toits plats, murs, vitrages) dont l'erreur dépasse 6 niveaux.

| Moyenne des 85 sprites | PSNR z1,5 | SSIM z1,5 | taches z1,5 | PSNR z2,5 | SSIM z2,5 | taches z2,5 |
|---|---|---|---|---|---|---|
| Ancien encodage (×0,5 + palette 256 couleurs FASTOCTREE, sans tramage) | 32,4 dB | 0,956 | **9,8 %** | 31,2 dB | 0,931 | **13,2 %** |
| Même réduction ×0,5, sans palette (contrôle) | 36,6 dB | 0,972 | 0,04 % | 33,7 dB | 0,951 | 0,11 % |
| **Nouvel encodage** (WebP pleine définition, alpha sans perte) | 37,3 dB | 0,986 | **0,18 %** | 37,6 dB | 0,990 | **0,37 %** |

Conclusion : les taches et paliers venaient de la **palette 256 couleurs** (la réduction ×0,5 seule ne fait presque aucune tache). Pires cas avant : puits de gaz 51 %, immeuble PNJ b 41 %, fonderie 43 %, bâtiment abandonné 40 %, tours 26-30 %, usine grande 21 %, usine moyenne 16 %. Les supermarchés étaient moins touchés par les taches (1-4 %) mais plus par la définition : leur source n'a que 256 px par case, et la réduction ×0,5 les laissait à 128 px par case, agrandis ×1,5 à ×2,5 en jeu (flou « fondu »).
Planche : `revue_batiments/avant_apres_toits.jpg` (source | ancien | nouveau, zoom 2,5, agrandi ×2 : paliers visibles sur la tour de bureaux, la cheminée de l'usine moyenne, la mine de phosphate).

## 2. Pipeline corrigé (`tools/build.py`, `_p2enc`)

- Plus de palette : **WebP, couleur qualité 90, alpha sans perte, pleine définition** (seules les sources au-delà de 480 px par case sont ramenées à 400 px par case). Mesuré : une réduction préalable ×0,66 coûtait plus (SSIM 0,964) que l'encodage lui-même (0,997 en pleine définition) — double rééchantillonnage.
- Poids : sprites de la phase 2 3,2 Mo → 7,1 Mo ; `city.html` 15,2 → **19,6 Mo** (≤ 25 Mo). PNG-24 ×0,5 aurait coûté 14 Mo, PNG-24 ×0,75 29 Mo.
- Chargement : `new Image()` + data URI WebP (Chromium, Firefox, Safari ≥ 14) ; `img.decode()` vérifié par t80/t81, aucune erreur de page sur t01, t05, t15, t17, t44, t50, t54, t55, t57, t58, t60, t64, t80, t81 (tous verts).
- `WSE_P2_ENC=png256 python3 tools/build.py` rétablit l'ancien encodage pour comparer.
- Limite connue : la mémoire décodée des sprites de la phase 2 est ~4× plus grande qu'avant (pleine définition) ; aucun souci mesuré sur les tests (t64 mobile : 28/28), mais pas de mesure sur un vrai téléphone.

## 3. Orientation et éclairage

**Convention du jeu** (mesurée sur les références : maisons, immeubles, tours, usine moyenne, boutiques v2, dalle commune des commerces) : lumière haut-gauche, **flanc gauche (face sud-ouest) clair, flanc droit (face sud-est) sombre**, dalle 2:1. Mesure automatique : luminance médiane de la bande d'épaisseur au-dessus de l'arête basse gauche de la silhouette (flanc gauche de la dalle) contre l'arête basse droite ; ratio gauche/droite (référence : 1,2 à 2,9). Une seconde mesure (murs de part et d'autre de l'arête verticale avant) est trop sensible aux matériaux (vitrage sombre d'un côté, enduit blanc de l'autre) pour décider seule ; elle a servi de confirmation, avec un contrôle visuel de chaque cas (`revue_batiments/planche_eclairage_miroir.jpg`).

**Sprites rendus avec la lumière à droite** (ratio 0,36 à 0,76) : toute la famille extraction (puits, mines, carrières, camp de bûcherons : même kit Blender), entrepôt, terminal portuaire, centrale nucléaire, data center (bloc), chantier BTP, stade, éolienne. Ils n'ont ni texte ni enseigne de façade : un **miroir horizontal au build** (`P2_FLIP`, fait avant toute mesure, donc dimensions, losange, ancres et profils restent cohérents) remet la lumière à gauche **sans rien inverser d'autre** (géométrie symétrique ou sans façade orientée par le jeu). Après miroir, ratio 1,23 à 2,74.

**Supermarché / hypermarché** : la dalle commune des commerces est bien éclairée à gauche (1,26), mais la composition était fausse : un petit cube posé dans le **coin est** (sommet droit) d'un grand parking, façade tournée vers le bas-gauche, voitures criardes, cartouche « SUPERMARKET » sur le toit. Ce n'est pas un problème que le miroir corrige (le miroir aurait aussi inversé la dalle, donc la lumière). Correction par le code : le jeu dessine désormais **le bâtiment seul sur sa dalle** (`assets/factory_hd/bat_supermarche*`, `bat_hypermarche*`, éclairage gauche 1,19 à 1,53, déjà livrés mais inutilisés), sur **toute la parcelle** 2×2 / 3×3 ; le cartouche de toit des niveaux 1 est effacé au build (`P2_UNLABEL` : le toit y est reconstruit par un plan ajusté sur le toit nu voisin). Façade vitrée côté bas-gauche, quai côté bas-droit : les deux faces visibles portent une fonction. Le nom reste affiché par la plaque du jeu.

Exceptions justifiées (t80) : `usine_petite_f1` (0,44, plus dessinée), anciens `supermarche`/`hypermarche` (plus dessinés). Cas proches de 1 laissés tels quels : `usine_moyenne_f2` 1,03 (référence de Rémy), `fonderie` 1,01, `maison_n1` 0,98, `maison_pnj_c` 0,97.

## 4. Usines petite et grande (en attendant Cowork, commande n° 14)

- **f1** : le hangar à toit de bardeaux sans dalle (débordement de 60 % hors de la parcelle mesuré par asset_qa) n'est plus dessiné : repli **usine moyenne à 80 %** sur sa case (brique, tôle, cheminée, portes de quai, dalle béton). Propre et cohérent, mais identique à f2 en plus petit.
- **f3** : les halls aux toits confus sont remplacés par **deux halls de l'usine moyenne** sur les deux rangées de l'emprise 2×2 (`drawF3Duo`). Cohérent avec f2, mais répétitif.
- Ces deux replis se retirent en une ligne (`P2_REPLI`, `P2_F3_DUO` dans `game.template.html`) dès la livraison.

## 5. Notes par bâtiment (catalogue, tableau 2)

A bon · B moyen (utilisable, défaut nommé) · C à refaire. Rendu en jeu après la passe 78.

### Usines (`revue_batiments/planche_usines.jpg`)
| Bâtiment | Sprite | Note | Raisons |
|---|---|---|---|
| Petite usine `f1` | usine_petite_f1 → repli f2 | **C** (sprite) / B (repli) | sprite : abri de jardin (bardeaux, pas de dalle 2:1, pente 0,68, déborde de 60 %), lumière à droite ; repli propre mais simple copie de f2 → commande n° 14 |
| Usine moyenne `f2` | usine_moyenne_f2 | **A** | brique + tôle ondulée, cheminée, quai, dalle béton ; référence de style (pente 0,67 ramenée à 2:1 par le build) |
| Grande usine `f3` | usine_grande_f3 → 2 × f2 | **C** (sprite) / B (repli) | sprite : bloc gris de halls emboîtés, toits illisibles, style différent de f2 ; repli cohérent mais répétitif → commande n° 14 |
| Méga-usine `f4` | usine_f4_mega | B | raffinerie lisible, éclairage gauche ; gris uniforme, style « usine chimique » plus que « usine » |
| Fonderie d'or `foundry` | fonderie | B | four orange lisible ; éclairage neutre (1,01) |

### Extraction (`planche_extraction.jpg`)
| Bâtiment | Note | Raisons |
|---|---|---|
| Puits pétrole `well`, gaz `gwell` | B | lisibles ; vanne bleue saturée (gaz) ; lumière remise à gauche par miroir |
| Mines fer, charbon, cuivre, or, nickel-chrome, bauxite, zinc, graphite, phosphate, sel `miron…qsalt` | B | dioramas lisibles sur socle épais (style « maquette » différent des bâtiments de ville), lumière remise à gauche par miroir |
| Mine de lithium `mlithium` | B | bassins cyan vifs (charte : 1 couleur saturée ≤ 15 %) |
| Mine de potasse `mpotash` | **C** | sol rose fuchsia : hors charte |
| Carrières silice, argile, gravier, sable, calcaire `qsilica qclay qgravel qsand qlime` | B | gravier, sable et calcaire partagent le même sprite (fonction peu distincte) |
| Centre de concassage `crush` | C | reprend la carrière (commande n° 55-1 toujours ouverte) |
| Camp de bûcherons `logging` | B | lisible ; lumière remise à gauche |

### Énergie et logistique (`planche_energie_logistique.jpg`)
| Bâtiment | Note | Raisons |
|---|---|---|
| Centrale électrique `plant` | B | petite pour 2×1, cheminée rouge vif |
| Centrale solaire `solar`, éolienne `wind`, pylône `pylon` | A | nets, cohérents |
| Centrale nucléaire `nuclear` | A | lisible ; lumière remise à gauche |
| Entrepôt `wh` | A | après miroir |
| Entrepôt en ligne `ewh` | B | même sprite que l'entrepôt, agrandi : aucune lecture « e-commerce » |
| Terminal portuaire `port` | B | petit bureau sur une grande dalle vide (grue et quai dessinés à côté par le décor du port) |

### Commerces (`planche_commerces.jpg`)
| Bâtiment | Note | Raisons |
|---|---|---|
| Petit marché `s1` | B | kiosque lisible, store rayé saturé |
| Supermarché `s2` (3 niveaux), hypermarché `s3` (3 niveaux) | B | désormais bâtiment occupant la parcelle, éclairage gauche, plus de texte ni de voitures criardes ; reste : bleu vif, toit plat nu (sans attiques techniques), définition source faible (224-256 px/case) → commande n° 14 |
| Méga-centre `s4` | **C** | même défaut que l'ancien supermarché : petit immeuble au fond d'un grand parking aux voitures multicolores |
| Concession auto `sauto` | B | parking justifié (voitures exposées) mais bâtiment petit |
| Maison du Numérique `stech` | B | pavillon ouvert, peu de lecture « électronique » |
| Maison de luxe `slux`, boutique de mode `smode`, maison et déco `shome`, sport et loisirs `ssport` | A | magasins v2, cohérents |
| Pharmacie `spharma` | B | croix verte fluo (choix de Rémy) très saturée |
| Brico `sbrico` | B | composition en code ; pas de sprite HD |
| Agence immobilière `immo` | **C** | cube gris vitré sans dalle ni enseigne, fonction illisible |

### Ville, services, tours (`planche_ville_services.jpg`, `planche_ville_pnj.jpg`)
| Bâtiment | Note | Raisons |
|---|---|---|
| Centre de R&D `rd`, siège `hq` (3 niveaux), tour tech `tech`, tour de location `off`, équipement sportif `sport`, logements `res` | A | nets, éclairage gauche |
| Data center `dc` | B | campus composé en code (le sprite `data_center` bloc n'est pas utilisé pour le 5×4) |
| Banque `bank` | B | pièce d'or géante sur le toit (pictogramme saturé) |
| Station média `tv` | B | petit bâtiment pour la fonction |
| BTP `btp` | B | chantier lisible ; lumière remise à gauche |
| PNJ : maisons, immeubles, barre HLM, tours PNJ, bâtiment abandonné, chantiers, mairie, église | A | cohérents |
| PNJ : boulangerie, café, restaurant, école, hôpital, station-service, recharge | B | pictogrammes géants sur les toits / couleurs vives (jaune, rouge) |

### Fermes (`planche_fermes.jpg`)
Blé, canne, coton, vigne, maïs, élevages : **A** (parcelles nettes). Hévéas, colza : B (grange rouge vif répétée, colza jaune saturé). Éclairage des fermes non mesuré (parcelles, pas des bâtiments).

## 6. Ce qui dépend de Cowork
Commande n° 14 (`tools/factory_ai/RETOURS.md`) : petite usine f1, grande usine f3, supermarché 2×2 et hypermarché 3×3 (3 niveaux chacun) ; à suivre ensuite : méga-centre `s4` et agence immobilière `immo` (C), mine de potasse (teinte).
