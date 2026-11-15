# Nouveaux sprites : gisements industriels (passe 33)

Liste à générer par le modèle d'images (aucune image n'est produite par cette passe : le jeu dessine ces objets en vectoriel tant que les PNG n'existent pas). Même gabarit et même échelle que `TOP100.md` (case de 132×66 px, génération à l'échelle ×3). Les noms suivent la convention du lot B (`gisement_<x>`, `mine_<x>`) et celle des bacs de matière (`bac_<x>`, `lingots_<x>`, `barres_<x>`).

Géologie simplifiée : **11 gisements et 11 mines**. Le chrome sort de la mine de nickel-chrome, le soufre du puits de gaz, les terres rares des grosses mines de cuivre et de lithium (donc pas de sprite de gisement ni de mine pour ces trois matières, seulement un tas de matière).

Bâtiments : `mnicr`, `mbauxite`, `mlithium`, `mzinc`, `mgraphite`, `gwell`, `qsilica`, `qclay`, `qsalt`, `mphos`, `mpotash`.

## 1. Affleurements sur le sol (11 × 396×300)
Une case de gisement vue du dessus, fond transparent, bord irrégulier pour se raccorder aux cases voisines.

| Nom | Taille | Sujet |
|---|---|---|
| `gisement_nickel_chrome` | 396×300 | Roche verdâtre veinée de vert pâle (nickel) avec veines noires à reflets bleu acier (chrome), éclats métalliques |
| `gisement_bauxite` | 396×300 | Terre rouge-brun, nodules rouille (latérite) |
| `gisement_lithium` | 396×300 | Salar : croûte blanche craquelée, flaques turquoise |
| `gisement_silice` | 396×300 | Sable blanc-bleuté et blocs de quartz translucides |
| `gisement_sel` | 396×300 | Dôme de sel blanc, cristaux cubiques |
| `gisement_phosphate` | 396×300 | Roche sédimentaire brun-olive, strates |
| `gisement_gaz` | 396×300 | Sol sombre, bulles claires, torchère éteinte au loin (variante du suintement de pétrole) |
| `gisement_zinc` | 396×300 | Roche gris-bleu, cristaux de sphalérite sombres |
| `gisement_argile` | 396×300 | Berge d'argile ocre-terracotta, flaque d'eau lisse |
| `gisement_potasse` | 396×300 | Roche rose saumon, strates blanches de sel |
| `gisement_graphite` | 396×300 | Roche gris anthracite à reflet gras, paillettes |

## 2. Mines et carrières (11 × 792×500)
Bâtiment 1×1, vue iso à 30°, une variante « à l'arrêt » (même image, sans lumière ni fumée) sera tirée de la même scène.

| Nom | Taille | Sujet |
|---|---|---|
| `mine_nickel_chrome` | 792×500 | Mine à ciel ouvert en gradins, deux tas côte à côte : vert pâle (nickel, 60 %) et noir bleuté (chrome, 40 %), camions bennes |
| `mine_bauxite` | 792×500 | Carrière rouge, bande transporteuse vers un tas rouille |
| `mine_lithium` | 792×500 | Bassins d'évaporation turquoise en damier, petite usine de pompage (variante « grosse mine » : un petit tas violet de terres rares en plus) |
| `mine_zinc` | 792×500 | Galerie et chevalement, wagons de minerai gris-bleu |
| `mine_graphite` | 792×500 | Carrière noire, concasseur, sacs de paillettes |
| `puits_gaz` | 792×500 | Tête de puits, arbre de Noël bleu, torchère, conduite vers le pipeline, cuve de soufre jaune au pied (coproduit) |
| `carriere_silice` | 792×500 | Sablière blanche, pelle mécanique, crible, tas clair |
| `carriere_argile` | 792×500 | Fosse d'argile ocre, draglines, briqueterie en fond |
| `mine_sel` | 792×500 | Puits de mine de sel, convoyeur, tas blanc brillant |
| `mine_phosphate` | 792×500 | Carrière en strates brun-olive, camions, silo de chargement |
| `mine_potasse` | 792×500 | Chevalement, convoyeur, tas rose et blanc |
| `mine_cuivre_niveau3` | 792×500 | Variante de la mine de cuivre existante, niveau 3 et plus : usine de traitement et petit tas violet de terres rares (coproduit) |

## 3. Tas de matière brute à l'écran d'usine et à l'entrepôt (14 × 396×300)
Palette de 2,2 × 2,2 cases, ancre au centre, fond transparent. Même rôle que `bac_minerai_fer`, `bac_charbon`, `bac_calcaire`. Les matières coproduites (chrome, soufre, terres rares) ont chacune leur tas.

| Nom | Taille | Sujet |
|---|---|---|
| `bac_nickel` | 396×300 | Bac de minerai vert pâle |
| `bac_chrome` | 396×300 | Bac de minerai noir bleuté |
| `bac_bauxite` | 396×300 | Bac de bauxite rouge |
| `bac_lithium` | 396×300 | Bac de carbonate de lithium blanc, sacs |
| `bac_silice` | 396×300 | Bac de sable de quartz clair |
| `bac_sel` | 396×300 | Bac de sel gemme |
| `bac_soufre` | 396×300 | Bac de soufre jaune |
| `bac_phosphate` | 396×300 | Bac de phosphate brun |
| `futs_gaz` | 396×300 | Bouteilles et cuve de gaz bleu pâle |
| `bac_terres_rares` | 396×300 | Fûts scellés et poudre violette |
| `bac_zinc` | 396×300 | Bac de concentré gris-bleu |
| `bac_argile` | 396×300 | Bac d'argile ocre |
| `bac_potasse` | 396×300 | Bac de potasse rose |
| `bac_graphite` | 396×300 | Bac de graphite noir |

## 4. Composants issus de ces chaînes (10 × 396×300)
Pour l'intérieur d'usine (palettes et bobines), même rôle que `barres_acier`, `lingots_acier`, `sacs_ciment`.

| Nom | Taille | Sujet |
|---|---|---|
| `barres_inox` | 396×300 | Barres d'acier inoxydable brillantes |
| `barres_galva` | 396×300 | Poutrelles d'acier galvanisé, reflet moiré |
| `lingots_laiton` | 396×300 | Lingots de laiton jaune |
| `sacs_alumine` | 396×300 | Sacs et big-bags d'alumine blanche |
| `lingots_aluminium` | 396×300 | Lingots d'aluminium argenté |
| `aimants_terres_rares` | 396×300 | Cartons d'aimants argentés, un aimant en U |
| `sacs_engrais` | 396×300 | Sacs d'engrais verts |
| `briques_palette` | 396×300 | Palette de briques rouges filmée |
| `porcelaine_caisses` | 396×300 | Caisses de porcelaine blanche calée en paille |
| `chassis_aluminium` | 396×300 | Châssis de voiture en aluminium nu sur chariot |

Total : 47 sprites (11 + 12 + 14 + 10, dont la variante `mine_cuivre_niveau3`). Priorité de production : mine nickel-chrome, mine de lithium, mine de cuivre niveau 3, bauxite, puis silice, sel, argile, puis le reste.
