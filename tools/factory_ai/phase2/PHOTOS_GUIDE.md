# Photos du Guide du fabricant

Le Guide du fabricant (écran « Manufacturer's Guide » à la Capitalism Lab) affiche une carte par matière, composant et produit. Chaque carte peut recevoir une **photo** : le jeu embarque `assets/guide_hd/<clé>.jpg` (voir `tools/build.py`, jeton `__GUIDEHD_JSON__`) et retombe sur la vignette vectorielle s'il n'y en a pas.

**Format** : JPEG carré 512×512, fond clair neutre, objet seul centré, éclairage studio doux (haut-gauche), photo réaliste de catalogue, **sans texte, sans logo, sans marque**. Nom du fichier = clé du jeu (colonne « clé »).

**Consigne type** (modèle FLUX.2 klein 4B, à compléter par le nom) : `studio product photograph of {sujet}, single object centered on a plain light grey seamless background, soft daylight from the upper left, sharp focus, realistic materials, no text, no logo, no brand`

## Matières premières (27)

| Clé | Nom du jeu |
|---|---|
| `oil` | Pétrole |
| `iron` | Minerai de fer |
| `coal` | Charbon |
| `copper` | Cuivre |
| `gold` | Or brut |
| `wood` | Bois |
| `gravel` | Gravier |
| `sand` | Sable |
| `limestone` | Calcaire |
| `nickel` | Nickel |
| `chrome` | Chrome |
| `bauxite` | Bauxite |
| `lithium` | Lithium |
| `silica` | Silice pure |
| `salt` | Sel gemme |
| `sulfur` | Soufre |
| `phosphate` | Phosphate |
| `gas` | Gaz naturel |
| `rare` | Terres rares |
| `zinc` | Zinc |
| `clay` | Argile et kaolin |
| `potash` | Potasse |
| `graphite` | Graphite |
| `wheat` | Blé |
| `sugar` | Canne à sucre |
| `cotton` | Coton |
| `rubber` | Caoutchouc naturel |

## Composants (50)

| Clé | Nom du jeu |
|---|---|
| `flour` | Farine |
| `fabric` | Tissu |
| `tire` | Pneus |
| `ingot` | Lingots d'or |
| `steel` | Acier |
| `plank` | Planches |
| `stud` | Montants d'ossature bois |
| `osb` | Panneaux OSB |
| `cement` | Ciment |
| `concrete` | Béton |
| `chem` | Produits chimiques |
| `api` | Principes actifs |
| `plastic` | Plastique |
| `wire` | Câbles de cuivre |
| `pack` | Emballages |
| `motor` | Moteurs électriques |
| `battery` | Batteries |
| `circuit` | Cartes électroniques |
| `gcase` | Boîtiers en or |
| `screen` | Écrans |
| `glass` | Verre |
| `silicon` | Silicium |
| `essence` | Essences et arômes |
| `paper` | Papier et carton |
| `milk` | Lait |
| `meat` | Viandes |
| `spirit` | Alcools et ferments |
| `ceramic` | Céramique |
| `hardware` | Fermetures et quincaillerie |
| `case` | Boîtiers et coques |
| `foam` | Mousse et rembourrage |
| `paint` | Peintures et vernis |
| `rubberp` | Pièces en caoutchouc |
| `leather` | Cuir |
| `tfabric` | Textiles techniques |
| `led` | Éclairage LED |
| `engine` | Moteurs thermiques |
| `chassis` | Châssis et carrosserie |
| `sensor` | Capteurs et optiques |
| `pv` | Cellules photovoltaïques |
| `stainless` | Acier inoxydable |
| `galva` | Acier galvanisé |
| `brass` | Laiton |
| `alumina` | Alumine |
| `aluminium` | Aluminium |
| `magnet` | Aimants permanents |
| `fert` | Engrais |
| `brick` | Briques |
| `porcelain` | Porcelaine |
| `chassisal` | Châssis en aluminium |

## Produits (82)

| Clé | Nom du jeu |
|---|---|
| `utensils` | Ustensiles de cuisine |
| `bread` | Pain |
| `biscuits` | Biscuits |
| `candy` | Bonbons |
| `tshirt` | T-shirts |
| `jeans` | Jeans |
| `sneakers` | Baskets |
| `tyres` | Pneus automobiles |
| `mattress` | Matelas |
| `toys` | Jouets en plastique |
| `woodtoys` | Jouets en bois |
| `chair` | Chaise |
| `bed` | Lit |
| `house_wood` | Maison à ossature bois |
| `house_concrete` | Maison en béton |
| `bike` | Vélo |
| `washer` | Lave-linge |
| `tv` | Téléviseur |
| `phone` | Smartphone |
| `headache` | Pilules contre le mal de tête |
| `cough` | Sirop contre la toux |
| `obesity` | Pilules contre l'obésité |
| `watch` | Montre de luxe |
| `soap` | Savons et détergents |
| `glassware` | Verrerie et bocaux |
| `cream` | Crèmes et soins |
| `blender` | Petit électroménager |
| `fridge` | Réfrigérateur |
| `jewelry` | Bijoux en or |
| `perfume` | Parfum de luxe |
| `skincare` | Soins de luxe |
| `handbag` | Sac de créateur |
| `tablet` | Tablette tactile |
| `laptop` | Ordinateur portable |
| `console` | Console de jeux |
| `yogurt` | Yaourts |
| `cheese` | Fromages |
| `pasta` | Pâtes alimentaires |
| `chocolate` | Chocolat |
| `readymeal` | Plats cuisinés |
| `soda` | Sodas |
| `beer` | Bière |
| `spirits` | Spiritueux |
| `whisky` | Whisky de luxe |
| `vitamins` | Compléments alimentaires |
| `antibio` | Antibiotiques |
| `shampoo` | Shampooings |
| `toothpaste` | Dentifrice |
| `makeup` | Maquillage |
| `hygiene` | Couches et hygiène |
| `jacket` | Vestes |
| `leathershoes` | Chaussures en cuir |
| `dress` | Robes |
| `socks` | Chaussettes et sous-vêtements |
| `bag` | Sacs en cuir |
| `couture` | Haute couture |
| `camera` | Appareils photo |
| `smartwatch` | Montres connectées |
| `headphones` | Casques audio |
| `microwave` | Fours micro-ondes |
| `vacuum` | Aspirateurs |
| `lamp` | Luminaires LED |
| `desktop` | Ordinateurs de bureau |
| `solarpanel` | Panneaux solaires |
| `sofa` | Canapés |
| `table` | Tables |
| `wardrobe` | Armoires |
| `tableware` | Vaisselle en céramique |
| `books` | Livres et cahiers |
| `sportswear` | Vêtements de sport |
| `tent` | Tentes et camping |
| `ebike` | Vélos électriques |
| `dolls` | Poupées et peluches |
| `etoys` | Jouets électroniques |
| `car` | Voitures |
| `car_alu` | Voitures en aluminium |
| `cookware` | Casseroles et couverts inox |
| `scooter` | Scooters |
| `lube` | Lubrifiants et carburants |
| `handtools` | Outillage à main |
| `powertools` | Outillage électroportatif |
| `petfood` | Aliments pour animaux |

**Total : 159 photos.** Ordre conseillé : produits les plus vus d'abord (pain, voiture, smartphone, téléviseur, médicaments), puis matières premières, puis composants.
