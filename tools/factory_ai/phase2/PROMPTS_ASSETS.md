# Prompts des assets manquants (images à générer)

Un prompt par asset, prêt pour FLUX.2 klein 4B. Le `prompt` complet = sujet + style du groupe (déjà concaténé dans `prompts_assets.json`). Tailles = taille de génération recommandée (échelle ×3 de la case de 132×66 px). Aucun texte, aucun logo.


## Lot 0 · valider le style

| Nom | Taille | Sujet |
|---|---|---|
| `scene_rd_garage_voiture` | 1920x1080 | dark industrial car R&D garage at night, polished wet concrete floor with a glowing rectangular light strip platform in the center, a sleek blue electric sports coupe on the platform in three quarter front view, brick and corrugated steel walls, ceiling strip lights, red tool chests, colorful abstract mural, technician in a pink t-shirt |
| `hero_voiture` | 1920x1080 | cinematic hero shot of a sleek modern blue car on a dark reflective floor, low camera angle, rim lighting, soft haze, shallow depth of field |
| `vitrine_accueil` | 1920x1080 | container port at night with a cargo ship at the quay, tall gantry cranes, stacked colorful containers, a small city skyline in the background, warm lights |
| `vue_ville_ensemble` | 1920x1080 | aerial panorama of a small modern city at golden hour, low rise districts and a few taller buildings, a port and river on one side |
| `siege_hq_n2` | 1280 | corporate headquarters tower, glass and steel facade, 12 floors, plaza at the base |
| `navire_cargo` | 1280x640 | container cargo ship seen at 30 degrees, stacked colorful containers on deck, white bridge at the stern |

## A · sol et quai

| Nom | Taille | Sujet |
|---|---|---|
| `sol_quai_beton_a` | 396x198 | pale concrete quay slab with fine expansion joints |
| `sol_quai_beton_b` | 396x198 | pale concrete quay slab with a worn yellow safety line along one edge |
| `sol_port_asphalte` | 396x198 | dark asphalt port ground with white painted lane markings |
| `eau_calme` | 396x198 | calm turquoise harbor water with soft ripples |
| `eau_rivage_quai` | 396x198 | harbor water meeting a concrete quay edge with a small foam line |
| `rivage_sable` | 396x198 | sandy shoreline meeting shallow water |
| `route_droite_ne` | 396x198 | straight two lane road running toward the upper right, white dashed center line, light sidewalks |
| `route_droite_nw` | 396x198 | straight two lane road running toward the upper left, white dashed center line, light sidewalks |
| `route_croix` | 396x198 | four way road intersection with crosswalks |
| `route_t` | 396x198 | T junction road intersection with crosswalks |
| `route_coude` | 396x198 | 90 degree road bend with sidewalks |
| `route_bout` | 396x198 | dead end road with a turning circle |

## A · port, chantiers, véhicules

| Nom | Taille | Sujet |
|---|---|---|
| `conteneur_bleu` | 396x300 | blue shipping container, corrugated sides, closed doors |
| `conteneur_rouge` | 396x300 | red shipping container, corrugated sides, closed doors |
| `conteneur_pile` | 396x420 | stack of three colorful shipping containers |
| `grue_portique` | 792x700 | tall blue and white quay gantry crane on rails |
| `terminal_portuaire` | 792x500 | small port terminal building with offices and a loading apron |
| `chantier_petit` | 396x300 | small construction site with scaffolding, a concrete foundation and a few materials |
| `chantier_moyen` | 792x500 | medium construction site, a rising concrete frame, scaffolding and a small yellow crane |
| `camion_ville` | 396x300 | white delivery box truck, three quarter view |
| `voiture_ville_a` | 300x200 | small red city hatchback car |
| `voiture_ville_b` | 300x200 | small blue sedan car |

## B · extraction

| Nom | Taille | Sujet |
|---|---|---|
| `gisement_fer` | 396x300 | outcrop of rust red iron ore rocks on bare earth |
| `gisement_charbon` | 396x300 | outcrop of shiny black coal seam on bare earth |
| `gisement_cuivre` | 396x300 | outcrop of green blue copper ore rocks |
| `gisement_petrole` | 396x300 | dark oil seep with glossy black pools on sandy ground |
| `puits_petrole` | 396x500 | oil derrick with a pumpjack and storage tank |
| `mine_fer` | 792x500 | open pit iron mine with a gantry and ore wagons |
| `mine_charbon` | 792x500 | coal mine with a headframe, conveyor and a black coal heap |
| `mine_cuivre` | 792x500 | copper mine with a headframe and green blue ore heap |
| `camp_bucherons` | 792x500 | lumberjack camp with log piles, a sawmill shed and a small crane |
| `carriere` | 792x500 | stone quarry with terraces, an excavator and a gravel heap |

## B · commerces et habitat

| Nom | Taille | Sujet |
|---|---|---|
| `petit_marche_n1` | 396x400 | small neighborhood grocery store, one floor, striped awning |
| `petit_marche_n2` | 396x450 | corner market with two floors and apartments above |
| `supermarche` | 792x500 | supermarket with a large parking lot and a glass entrance |
| `hypermarche` | 792x600 | hypermarket, big box building with a large car park and a tall sign pylon without text |
| `maison_n1` | 396x400 | small detached family house, red tiled roof, tiny garden |
| `maison_n2` | 396x450 | two story family house, garage and garden |
| `maison_n3` | 396x500 | modern three story townhouse with balconies |
| `immeuble_n1` | 396x650 | four story apartment building, brick facade, flat roof |
| `immeuble_n2` | 396x800 | eight story apartment building, light concrete facade with balconies |
| `tour_logements` | 396x1000 | residential tower, 20 floors, glass and concrete |
| `usine_petite_f1` | 792x500 | small factory building with a sawtooth roof and a loading door |
| `usine_moyenne_f2` | 792x600 | medium factory, large hall, two chimneys and a loading dock |
| `entrepot` | 792x500 | warehouse with several loading bays and a flat roof |
| `fonderie` | 792x600 | steel foundry with tall chimneys, glowing furnace door and a crane |
| `maison_pnj_a` | 396x400 | townhouse with a gabled roof |
| `maison_pnj_b` | 396x400 | suburban house with a garage |
| `maison_pnj_c` | 396x400 | cottage with a chimney |
| `immeuble_pnj_a` | 396x650 | six story apartment block, beige facade |
| `immeuble_pnj_b` | 396x650 | five story building with shops on the ground floor |
| `tour_pnj_a` | 396x1000 | glass office tower, 25 floors |
| `tour_pnj_b` | 396x1000 | stepped modern office tower, 30 floors |
| `arbre_ville` | 200x300 | street tree with a rounded green crown |

## B · décor de ville

| Nom | Taille | Sujet |
|---|---|---|
| `sol_ville_pave` | 396x198 | paved city plaza with sidewalk curbs |
| `parc_urbain` | 396x300 | small city park with lawn, paths and a few trees |
| `herbe_a` | 396x198 | fresh green lawn |

## C · services, énergie, agriculture

| Nom | Taille | Sujet |
|---|---|---|
| `siege_hq_n1` | 1280 | small corporate office building, 4 floors, glass entrance |
| `siege_hq_n3` | 1280 | skyscraper headquarters, 45 floors, glass crown |
| `tour_tech` | 396x1000 | high tech tower with blue glass and rooftop antennas |
| `data_center` | 792x500 | data center, windowless grey building with cooling units on the roof |
| `banque` | 792x700 | classical stone bank building with columns |
| `tour_bureaux` | 396x1000 | mid rise office tower with a reflective glass facade |
| `centre_rd` | 792x600 | research and development center, white laboratory building with glass atrium and a rooftop dish |
| `station_tv` | 792x600 | television station with a tall broadcast antenna and a studio building |
| `stade_sport` | 792x500 | small sports stadium with a green pitch and stands |
| `agence_immo` | 396x450 | real estate agency, glass storefront, two floors |
| `usine_grande_f3` | 1188x700 | large modern factory complex with several halls and chimneys |
| `usine_f4_mega` | 1188x800 | mega factory complex, huge halls, conveyor bridges, silos and tall chimneys |
| `mega_centre_commercial` | 1188x700 | shopping mall with a glass roof atrium and a large car park |
| `centrale_charbon` | 792x700 | coal power plant, cooling towers and a tall chimney |
| `centrale_solaire` | 792x400 | field of blue solar panels in rows |
| `eolienne` | 300x600 | white three blade wind turbine |
| `centrale_nucleaire` | 1188x800 | nuclear power plant with two cooling towers and a dome reactor |
| `pylone_electrique` | 200x500 | steel electricity pylon with cables |
| `hangar_ferme` | 792x500 | red barn farm shed with a silo |
| `tracteur` | 300x200 | green farm tractor |
| `mine_or` | 792x500 | gold mine entrance with a headframe and a small heap of golden ore |
| `batiment_abandonne` | 396x450 | abandoned ruined building with broken windows |

## C · champs

| Nom | Taille | Sujet |
|---|---|---|
| `champ_ble_vert` | 396x198 | field of young green wheat in rows |
| `champ_ble_mur` | 396x198 | field of ripe golden wheat in rows |

## C · vignettes cinéma de produits

| Nom | Taille | Sujet |
|---|---|---|
| `hero_smartphone` | 1920x1080 | cinematic hero shot of a modern smartphone floating above a dark glossy surface, rim light, soft glow |
| `hero_tv` | 1920x1080 | cinematic hero shot of a modern flat television in a dark room, screen showing a colorful abstract landscape |
| `hero_montre_luxe` | 1920x1080 | cinematic macro of a luxury steel wristwatch with a dark blue dial on black velvet, dramatic lighting |
| `hero_pain` | 1920x1080 | cinematic shot of fresh golden baguettes on a wooden board, steam, warm bakery light |
| `hero_pilules` | 1920x1080 | cinematic clean shot of a pill blister pack and a bottle, bright pharmaceutical light |
| `hero_jouet` | 1920x1080 | cinematic shot of colorful plastic toys on a playroom floor, warm light |
| `hero_portable` | 1920x1080 | cinematic shot of a slim silver laptop open on a dark desk, soft screen glow |
| `hero_parfum` | 1920x1080 | cinematic shot of an elegant glass perfume bottle with a gold cap, soft bokeh |
| `hero_sneakers` | 1920x1080 | cinematic shot of white sneakers with teal details floating over a dark reflective floor |
| `scene_rd_halle_robots` | 1920x1080 | large R&D prototype hall, orange six axis robot arms around a car body on a test bench, a blue hydraulic press, skylights, engineers in white coats |
| `scene_labo_smartphone` | 1920x1080 | clean electronics lab, a premium smartphone floating above a lit pedestal with exploded components in a ring |
| `scene_atelier_jouets` | 1920x1080 | warm colorful toy design workshop, workbenches covered with prototype toys, plastic moulds, plush toys on shelves |
| `scene_rd_garage_moteur` | 1920x1080 | dark engineering garage, a car on a lift with the hood open and an engine hanging from an overhead gantry crane, holographic blueprint panels without text |

## Gisements · affleurements

| Nom | Taille | Sujet |
|---|---|---|
| `gisement_nickel_chrome` | 396x300 | mineral outcrop on bare ground, pale green rock veined with bluish black chrome streaks and metallic flakes |
| `gisement_bauxite` | 396x300 | mineral outcrop on bare ground, red brown earth with rust colored nodules |
| `gisement_lithium` | 396x300 | mineral outcrop on bare ground, white cracked salt crust with turquoise brine pools |
| `gisement_silice` | 396x300 | mineral outcrop on bare ground, bluish white sand and translucent quartz blocks |
| `gisement_sel` | 396x300 | mineral outcrop on bare ground, white salt dome with cubic crystals |
| `gisement_phosphate` | 396x300 | mineral outcrop on bare ground, olive brown layered sedimentary rock |
| `gisement_gaz` | 396x300 | mineral outcrop on bare ground, dark ground with clear bubbles and an extinguished flare stack in the distance |
| `gisement_zinc` | 396x300 | mineral outcrop on bare ground, blue grey rock with dark sphalerite crystals |
| `gisement_argile` | 396x300 | mineral outcrop on bare ground, ochre terracotta clay bank with a flat puddle |
| `gisement_potasse` | 396x300 | mineral outcrop on bare ground, salmon pink rock with white salt layers |
| `gisement_graphite` | 396x300 | mineral outcrop on bare ground, anthracite grey rock with a greasy sheen and flakes |

## Gisements · mines

| Nom | Taille | Sujet |
|---|---|---|
| `mine_nickel_chrome` | 792x500 | open pit terraced mine with two heaps side by side, pale green nickel ore and bluish black chrome ore, dump trucks |
| `mine_bauxite` | 792x500 | red open pit quarry with a conveyor belt to a rust colored heap |
| `mine_lithium` | 792x500 | turquoise evaporation ponds in a checkerboard with a small pumping plant |
| `mine_zinc` | 792x500 | mine shaft with a headframe and wagons of blue grey ore |
| `mine_graphite` | 792x500 | black quarry with a crusher and bags of graphite flakes |
| `puits_gaz` | 792x500 | gas wellhead with a blue christmas tree, a flare stack, a pipe to a pipeline and a yellow sulfur tank at the foot |
| `carriere_silice` | 792x500 | white sand quarry with an excavator, a screen and a pale heap |
| `carriere_argile` | 792x500 | ochre clay pit with draglines and a brick factory in the background |
| `mine_sel` | 792x500 | salt mine shaft with a conveyor and a bright white heap |
| `mine_phosphate` | 792x500 | olive brown layered quarry with trucks and a loading silo |
| `mine_potasse` | 792x500 | headframe with a conveyor and a pink and white heap |
| `mine_cuivre_niveau3` | 792x500 | large copper mine with a processing plant and a small violet heap of rare earths |

## Gisements · tas et composants

| Nom | Taille | Sujet |
|---|---|---|
| `bac_nickel` | 396x300 | steel bin full of pale green ore |
| `bac_chrome` | 396x300 | steel bin full of bluish black ore |
| `bac_bauxite` | 396x300 | steel bin full of red bauxite |
| `bac_lithium` | 396x300 | steel bin of white lithium carbonate with sacks |
| `bac_silice` | 396x300 | steel bin of clear quartz sand |
| `bac_sel` | 396x300 | steel bin of rock salt |
| `bac_soufre` | 396x300 | steel bin of yellow sulfur |
| `bac_phosphate` | 396x300 | steel bin of brown phosphate |
| `futs_gaz` | 396x300 | gas cylinders and a pale blue tank |
| `bac_terres_rares` | 396x300 | sealed drums and violet powder |
| `bac_zinc` | 396x300 | steel bin of blue grey concentrate |
| `bac_argile` | 396x300 | steel bin of ochre clay |
| `bac_potasse` | 396x300 | steel bin of pink potash |
| `bac_graphite` | 396x300 | steel bin of black graphite |
| `barres_inox` | 396x300 | bundle of shiny stainless steel bars on a pallet |
| `barres_galva` | 396x300 | galvanized steel beams with a moire reflection on a pallet |
| `lingots_laiton` | 396x300 | stack of yellow brass ingots on a pallet |
| `sacs_alumine` | 396x300 | pallet of white alumina big bags |
| `lingots_aluminium` | 396x300 | stack of silver aluminium ingots on a pallet |
| `aimants_terres_rares` | 396x300 | cartons of silver magnets with one horseshoe magnet |
| `sacs_engrais` | 396x300 | pallet of green fertilizer sacks |
| `briques_palette` | 396x300 | pallet of red bricks wrapped in film |
| `porcelaine_caisses` | 396x300 | crates of white porcelain packed in straw |
| `chassis_aluminium` | 396x300 | bare aluminium car chassis on a trolley |

## Photos du Guide du fabricant (512×512, nom de fichier = clé du jeu)

| Clé | Sujet |
|---|---|
| `utensils` | a set of stainless steel kitchen utensils |
| `bread` | a golden baguette and a round loaf of bread |
| `biscuits` | a stack of round butter biscuits |
| `candy` | colorful wrapped candies |
| `tshirt` | a folded plain white t-shirt |
| `jeans` | folded blue denim jeans |
| `sneakers` | a pair of white sneakers with teal details |
| `tyres` | a black car tyre |
| `mattress` | a white quilted mattress |
| `toys` | colorful plastic toys |
| `woodtoys` | natural wooden toy blocks and a wooden train |
| `chair` | a simple wooden chair |
| `bed` | a wooden bed with white bedding |
| `house_wood` | a small timber frame house model |
| `house_concrete` | a small concrete modern house model |
| `bike` | a city bicycle |
| `washer` | a white front loading washing machine |
| `tv` | a modern flat screen television |
| `phone` | a modern black smartphone with a lit screen |
| `headache` | a blister pack of white tablets and a small pill box |
| `cough` | a bottle of cough syrup with a measuring cup |
| `obesity` | a pen injector and a box of weight loss medication |
| `watch` | a luxury steel wristwatch with a dark blue dial |
| `soap` | a bar of soap and a bottle of liquid detergent |
| `glassware` | clear glass jars and bottles |
| `cream` | a jar of face cream and a tube |
| `blender` | a small kitchen blender |
| `fridge` | a stainless steel refrigerator |
| `jewelry` | a gold necklace and ring |
| `perfume` | an elegant glass perfume bottle with a gold cap |
| `skincare` | a luxury skincare serum bottle and jar |
| `handbag` | a leather designer handbag |
| `tablet` | a thin tablet computer showing a colorful screen |
| `laptop` | a slim silver laptop, open |
| `console` | a modern game console with a controller |
| `yogurt` | a cup of yogurt with a spoon |
| `cheese` | a wheel of cheese with a wedge cut out |
| `pasta` | a bowl of dry pasta shapes |
| `chocolate` | a bar of chocolate partially unwrapped |
| `readymeal` | a ready meal tray with a cooked dish |
| `soda` | a bottle and a can of soda |
| `beer` | a glass of beer next to a bottle |
| `spirits` | a bottle of brandy and a small glass |
| `whisky` | a bottle of premium whisky and a glass |
| `vitamins` | a jar of vitamin capsules |
| `antibio` | a box of antibiotic capsules |
| `shampoo` | a bottle of shampoo |
| `toothpaste` | a tube of toothpaste and a toothbrush |
| `makeup` | lipstick and a makeup palette |
| `hygiene` | a pack of diapers and hygiene products |
| `jacket` | a folded jacket |
| `leathershoes` | a pair of brown leather shoes |
| `dress` | a hanging summer dress |
| `socks` | folded socks and underwear |
| `bag` | a leather backpack |
| `couture` | an elegant couture evening gown on a mannequin |
| `camera` | a mirrorless camera with a lens |
| `smartwatch` | a smartwatch with a lit screen |
| `headphones` | over ear headphones |
| `microwave` | a microwave oven |
| `vacuum` | a vacuum cleaner |
| `lamp` | an LED desk lamp |
| `desktop` | a desktop computer with a monitor and keyboard |
| `solarpanel` | a solar panel |
| `sofa` | a grey fabric sofa |
| `table` | a wooden dining table |
| `wardrobe` | a wooden wardrobe |
| `tableware` | a ceramic dinner set |
| `books` | a stack of books and notebooks |
| `sportswear` | folded sportswear in bright colors |
| `tent` | a camping tent |
| `ebike` | an electric bicycle |
| `dolls` | a doll and a plush teddy bear |
| `etoys` | an electronic toy robot |
| `car` | a modern blue compact car |
| `car_alu` | a sleek silver aluminium bodied sports car |
| `cookware` | stainless steel pots and cutlery |
| `scooter` | a motor scooter |
| `lube` | a can of motor oil and a fuel can |
| `handtools` | a hammer, screwdrivers and pliers |
| `powertools` | a cordless power drill and a circular saw |
| `petfood` | a bag of pet food and a bowl |
| `oil` | an oil drum and a puddle of black crude oil |
| `iron` | rust red iron ore rocks |
| `coal` | shiny black coal lumps |
| `copper` | raw green blue copper ore rocks |
| `gold` | raw gold nuggets |
| `wood` | a stack of logs |
| `gravel` | a pile of grey gravel |
| `sand` | a pile of yellow sand |
| `limestone` | pale limestone rocks |
| `nickel` | pale green nickel ore |
| `chrome` | bluish black chromite ore |
| `bauxite` | red bauxite rocks |
| `lithium` | white lithium carbonate powder in a bowl |
| `silica` | clear quartz crystals and sand |
| `salt` | chunks of rock salt |
| `sulfur` | bright yellow sulfur crystals |
| `phosphate` | brown phosphate rock |
| `gas` | a blue gas cylinder |
| `rare` | violet rare earth powder in a glass dish |
| `zinc` | blue grey zinc ore |
| `clay` | a lump of ochre clay |
| `potash` | pink potash crystals |
| `graphite` | black graphite flakes |
| `wheat` | a bundle of golden wheat ears |
| `sugar` | sugar cane stalks |
| `cotton` | a white cotton boll |
| `rubber` | a lump of natural rubber and a latex cup |
| `flour` | a paper sack of white flour |
| `fabric` | a roll of colorful fabric |
| `tire` | a stack of black tyres |
| `ingot` | a gold ingot |
| `steel` | a bundle of steel bars |
| `plank` | a stack of wooden planks |
| `stud` | wooden framing studs |
| `osb` | a stack of OSB wood panels |
| `cement` | a grey cement bag |
| `concrete` | a pile of wet grey concrete |
| `chem` | blue chemical drums |
| `api` | white pharmaceutical powder in a glass dish |
| `plastic` | plastic granules in a bin |
| `wire` | a spool of copper cable |
| `pack` | flat cardboard boxes |
| `motor` | an electric motor |
| `battery` | a lithium battery pack |
| `circuit` | a green electronic circuit board |
| `gcase` | a gold watch case |
| `screen` | a thin display panel |
| `glass` | sheets of glass |
| `silicon` | a silicon wafer |
| `essence` | small bottles of fragrance essences |
| `rweld` | an orange welding robot arm |
| `rpaint` | a pink painting robot arm |
| `rasm` | a turquoise assembly robot arm |
| `r6` | a blue six axis robot arm |
| `paper` | rolls of paper and cardboard |
| `milk` | a milk churn and a glass of milk |
| `meat` | cuts of raw meat on a board |
| `spirit` | a glass demijohn of fermented alcohol |
| `ceramic` | white ceramic tiles |
| `hardware` | zippers, buttons and metal fittings |
| `case` | plastic device casings |
| `foam` | blocks of foam padding |
| `paint` | cans of paint and a brush |
| `rubberp` | black rubber parts |
| `leather` | a roll of brown leather |
| `tfabric` | technical fabric roll with a mesh weave |
| `led` | LED lighting modules |
| `engine` | a car combustion engine |
| `chassis` | a bare car body shell |
| `sensor` | optical sensors and lenses |
| `pv` | photovoltaic cells |
| `stainless` | stainless steel bars |
| `galva` | galvanized steel beams |
| `brass` | brass ingots |
| `alumina` | a white alumina powder sack |
| `aluminium` | silver aluminium ingots |
| `magnet` | silver permanent magnets |
| `fert` | a green fertilizer sack |
| `brick` | a stack of red bricks |
| `porcelain` | white porcelain plates |
| `chassisal` | a bare aluminium car chassis |

## Styles communs (à ajouter après chaque sujet)

- **Objets isométriques** : isometric 2:1 game asset, camera 30 degrees above, smooth realistic 3D miniature render in the 'Manufacturing Unit' toy-like style, soft daylight from the upper left, crisp edges, one single isolated object centered, plain uniform light grey background, no text, no logo, no brand, no ground shadow
- **Tuiles de sol** : isometric 2:1 seamless ground tile seen from above at 30 degrees, smooth realistic 3D miniature render, soft daylight from the upper left, diamond shaped tile filling the frame edge to edge, no text, no logo
- **Scènes et vignettes** : ultra detailed photorealistic 3D game render, cinematic lighting, volumetric light, crisp sharp focus, rich materials, 16:9 wide composition, no text, no letters, no numbers, no logo, no watermark
- **Photos du Guide** : studio product photograph, single object centered on a plain light grey seamless background, soft daylight from the upper left, sharp focus, realistic materials, subtle soft shadow, square composition, no text, no letters, no logo, no brand, no watermark
