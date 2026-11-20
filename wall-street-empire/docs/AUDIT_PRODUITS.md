# Audit des images de produits et de biens

Généré par `tools/audit_produits.js` (inventaire automatique du jeu construit) ; la colonne fidélité est un jugement à l'œil sur les planches de contact (`tools/audit_produits_verdicts.json`).

- Produits finis : 95, dont 85 avec photo HD (assets/guide_hd), 10 avec visuel de lancement 16:9 (assets/products_hd).
- Biens et matières : 95, dont 85 avec photo HD.
- Sans photo HD (20) : repli vectoriel explicite : `eggs`, `chicken`, `porkmeat`, `lambmeat`, `sausage`, `tablewine`, `grandcru`, `tableoil`, `cornchips`, `biofuel`, `grapes`, `corn`, `rapeseed`, `egg`, `wine`, `cookoil`, `biodiesel`, `basic`, `std`, `lux`. Commande Cowork en fin de tools/factory_ai/RETOURS.md.
- Photo présente mais à refaire (14, mauvaise ou moyenne) : `tv`, `obesity`, `spirits`, `antibio`, `hygiene`, `jacket`, `ebike`, `lube`, `petfood`, `chrome`, `rubber`, `ingot`, `screen`, `silicon`.
- Corrigé par le code (passe 59) : whisky (photo à pseudo-texte remplacée par la carafe sans texte), pull/bœuf/lait (photos existantes fidèles réaffectées), carcasses et laine (animal HD sur fond studio), 10 nouveaux dessins de repli (œufs, poulet, porc, agneau, saucisson, pull, vin de table, grand cru, chips ; raisin, œufs en vrac, carcasses, laine, vin côté biens), et la photo HD des biens désormais affichée dans les rayons, fournisseurs, emplacements et bulles de la halle (avant : toujours le dessin vectoriel).

Où l'image s'affiche : produits = `productSVG` (catalogue, fiche produit, paliers, rayons de magasin, Guide, vignettes de l'usine, cinéma de lancement en repli du hero) ; biens = `gThumb` (Guide) et `compIcon`/`drawProd` (rayons, fournisseurs, emplacements d'usine, bulles d'intrants) qui prennent la photo HD si elle existe, sinon le dessin vectoriel. Les palettes et caisses de la halle restent des formes (carton/caisse/sac) colorées : pas de photo collée sur un volume 3D.

| produit | famille | image | fidélité | action |
|---|---|---|---|---|
| `utensils` Ustensiles de cuisine | Maison et meubles | `assets/guide_hd/utensils.jpg` 512×512 | fidèle | — |
| `bread` Pain | Alimentation | `assets/guide_hd/bread.jpg` 512×512 · hero `wall-street-empire/assets/products_hd/bread.jpg` 1280×720 | fidèle | — |
| `biscuits` Biscuits | Alimentation | `assets/guide_hd/biscuits.jpg` 512×512 | fidèle | — |
| `candy` Bonbons | Alimentation | `assets/guide_hd/candy.jpg` 512×512 | fidèle | — |
| `tshirt` T-shirts | Mode | `assets/guide_hd/tshirt.jpg` 512×512 | fidèle | — |
| `jeans` Jeans | Mode | `assets/guide_hd/jeans.jpg` 512×512 | fidèle | — |
| `sneakers` Baskets | Mode | `assets/guide_hd/sneakers.jpg` 512×512 · hero `wall-street-empire/assets/products_hd/sneakers.jpg` 1280×720 | fidèle | — |
| `tyres` Pneus automobiles | Auto et outils | `assets/guide_hd/tyres.jpg` 512×512 | fidèle | — |
| `mattress` Matelas | Maison et meubles | `assets/guide_hd/mattress.jpg` 512×512 | fidèle | — |
| `toys` Jouets en plastique | Jouets et sport | `assets/guide_hd/toys.jpg` 512×512 · hero `wall-street-empire/assets/products_hd/toys.jpg` 1280×720 | fidèle | — |
| `woodtoys` Jouets en bois | Jouets et sport | `assets/guide_hd/woodtoys.jpg` 512×512 | fidèle | — |
| `chair` Chaise | Maison et meubles | `assets/guide_hd/chair.jpg` 512×512 | fidèle | — |
| `bed` Lit | Maison et meubles | `assets/guide_hd/bed.jpg` 512×512 | fidèle | — |
| `house_wood` Maison à ossature bois | Immobilier | `assets/guide_hd/house_wood.jpg` 512×512 | approchant : maquette d'ossature bois (lisible) | — |
| `house_concrete` Maison en béton | Immobilier | `assets/guide_hd/house_concrete.jpg` 512×512 | approchant : maquette grise de maison en béton | — |
| `bike` Vélo | Jouets et sport | `assets/guide_hd/bike.jpg` 512×512 | fidèle | — |
| `washer` Lave-linge | Électroménager | `assets/guide_hd/washer.jpg` 512×512 | fidèle | — |
| `tv` Téléviseur | Électronique | `assets/guide_hd/tv.jpg` 512×512 · hero `wall-street-empire/assets/products_hd/tv.jpg` 1280×720 | moyen : téléviseur réaliste mais écran noir éteint, peu parlant | commande Cowork tv.jpg (écran allumé, image abstraite) |
| `phone` Smartphone | Électronique | `assets/guide_hd/phone.jpg` 512×512 · hero `wall-street-empire/assets/products_hd/phone.jpg` 1280×720 | fidèle | — |
| `headache` Pilules contre le mal de tête | Santé et beauté | `assets/guide_hd/headache.jpg` 512×512 | fidèle | — |
| `cough` Sirop contre la toux | Santé et beauté | `assets/guide_hd/cough.jpg` 512×512 | fidèle | — |
| `obesity` Pilules contre l'obésité | Santé et beauté | `assets/guide_hd/obesity.jpg` 512×512 · hero `wall-street-empire/assets/products_hd/obesity.jpg` 1280×720 | mauvais : boîte avec pseudo-texte « WEIGHT LOSS » et seringue | commande Cowork obesity.jpg (pilulier + gélules, sans texte) |
| `watch` Montre de luxe | Mode | `assets/guide_hd/watch.jpg` 512×512 · hero `wall-street-empire/assets/products_hd/watch.jpg` 1280×720 | fidèle | — |
| `soap` Savons et détergents | Santé et beauté | `assets/guide_hd/soap.jpg` 512×512 | fidèle | — |
| `glassware` Verrerie et bocaux | Maison et meubles | `assets/guide_hd/glassware.jpg` 512×512 | fidèle | — |
| `cream` Crèmes et soins | Santé et beauté | `assets/guide_hd/cream.jpg` 512×512 | fidèle | — |
| `blender` Petit électroménager | Électroménager | `assets/guide_hd/blender.jpg` 512×512 | fidèle | — |
| `fridge` Réfrigérateur | Électroménager | `assets/guide_hd/fridge.jpg` 512×512 | fidèle | — |
| `jewelry` Bijoux en or | Mode | `assets/guide_hd/jewelry.jpg` 512×512 | fidèle | — |
| `perfume` Parfum de luxe | Santé et beauté | `assets/guide_hd/perfume.jpg` 512×512 · hero `wall-street-empire/assets/products_hd/perfume.jpg` 1280×720 | fidèle | — |
| `skincare` Soins de luxe | Santé et beauté | `assets/guide_hd/skincare.jpg` 512×512 | fidèle | — |
| `handbag` Sac de créateur | Mode | `assets/guide_hd/handbag.jpg` 512×512 | fidèle | — |
| `tablet` Tablette tactile | Électronique | `assets/guide_hd/tablet.jpg` 512×512 | fidèle | — |
| `laptop` Ordinateur portable | Électronique | `assets/guide_hd/laptop.jpg` 512×512 · hero `wall-street-empire/assets/products_hd/laptop.jpg` 1280×720 | fidèle | — |
| `console` Console de jeux | Électronique | `assets/guide_hd/console.jpg` 512×512 | fidèle | — |
| `yogurt` Yaourts | Alimentation | `assets/guide_hd/yogurt.jpg` 512×512 | fidèle | — |
| `cheese` Fromages | Alimentation | `assets/guide_hd/cheese.jpg` 512×512 | fidèle | — |
| `pasta` Pâtes alimentaires | Alimentation | `assets/guide_hd/pasta.jpg` 512×512 | fidèle | — |
| `chocolate` Chocolat | Alimentation | `assets/guide_hd/chocolate.jpg` 512×512 | fidèle | — |
| `readymeal` Plats cuisinés | Alimentation | `assets/guide_hd/readymeal.jpg` 512×512 | fidèle | — |
| `soda` Sodas | Boissons | `assets/guide_hd/soda.jpg` 512×512 | fidèle | — |
| `beer` Bière | Boissons | `assets/guide_hd/beer.jpg` 512×512 | fidèle | — |
| `spirits` Spiritueux | Boissons | `assets/guide_hd/spirits.jpg` 512×512 | moyen : bouteille de spiritueux juste, étiquette en pseudo-lettres | commande Cowork spirits.jpg (étiquette unie) |
| `whisky` Whisky de luxe | Boissons | `assets/guide_hd/spirit.jpg` 512×512 (GUIDE_SUBST) | corrigé : whisky.jpg avait une grande étiquette en pseudo-lettres (« LOQALS ») ; remplacé par la carafe ambrée spirit.jpg, sans texte | code : GUIDE_SUBST (build.py) ; commande Cowork whisky.jpg (bouteille de luxe, étiquette unie) |
| `vitamins` Compléments alimentaires | Santé et beauté | `assets/guide_hd/vitamins.jpg` 512×512 | fidèle | — |
| `antibio` Antibiotiques | Santé et beauté | `assets/guide_hd/antibio.jpg` 512×512 | mauvais : boîte blanche vide, pseudo-texte sur le dessus, on ne voit aucun médicament | commande Cowork antibio.jpg |
| `shampoo` Shampooings | Santé et beauté | `assets/guide_hd/shampoo.jpg` 512×512 | fidèle | — |
| `toothpaste` Dentifrice | Santé et beauté | `assets/guide_hd/toothpaste.jpg` 512×512 | fidèle | — |
| `makeup` Maquillage | Santé et beauté | `assets/guide_hd/makeup.jpg` 512×512 | fidèle | — |
| `hygiene` Couches et hygiène | Santé et beauté | `assets/guide_hd/hygiene.jpg` 512×512 | moyen : paquet de couches reconnaissable mais couvert de pseudo-texte | commande Cowork hygiene.jpg (paquet uni) |
| `jacket` Vestes | Mode | `assets/guide_hd/jacket.jpg` 512×512 | mauvais : la photo montre un pull plié, pas une veste | photo réaffectée au pull ; commande Cowork jacket.jpg (veste) |
| `leathershoes` Chaussures en cuir | Mode | `assets/guide_hd/leathershoes.jpg` 512×512 | fidèle | — |
| `dress` Robes | Mode | `assets/guide_hd/dress.jpg` 512×512 | fidèle | — |
| `socks` Chaussettes et sous-vêtements | Mode | `assets/guide_hd/socks.jpg` 512×512 | fidèle | — |
| `bag` Sacs en cuir | Mode | `assets/guide_hd/bag.jpg` 512×512 | fidèle | — |
| `couture` Haute couture | Mode | `assets/guide_hd/couture.jpg` 512×512 | fidèle | — |
| `camera` Appareils photo | Électronique | `assets/guide_hd/camera.jpg` 512×512 | fidèle | — |
| `smartwatch` Montres connectées | Électronique | `assets/guide_hd/smartwatch.jpg` 512×512 | fidèle | — |
| `headphones` Casques audio | Électronique | `assets/guide_hd/headphones.jpg` 512×512 | fidèle | — |
| `microwave` Fours micro-ondes | Électroménager | `assets/guide_hd/microwave.jpg` 512×512 | fidèle | — |
| `vacuum` Aspirateurs | Électroménager | `assets/guide_hd/vacuum.jpg` 512×512 | fidèle | — |
| `lamp` Luminaires LED | Électronique | `assets/guide_hd/lamp.jpg` 512×512 | fidèle | — |
| `desktop` Ordinateurs de bureau | Électronique | `assets/guide_hd/desktop.jpg` 512×512 | fidèle | — |
| `solarpanel` Panneaux solaires | Électroménager | `assets/guide_hd/solarpanel.jpg` 512×512 | fidèle | — |
| `sofa` Canapés | Maison et meubles | `assets/guide_hd/sofa.jpg` 512×512 | fidèle | — |
| `table` Tables | Maison et meubles | `assets/guide_hd/table.jpg` 512×512 | fidèle | — |
| `wardrobe` Armoires | Maison et meubles | `assets/guide_hd/wardrobe.jpg` 512×512 | fidèle | — |
| `tableware` Vaisselle en céramique | Maison et meubles | `assets/guide_hd/tableware.jpg` 512×512 | fidèle | — |
| `books` Livres et cahiers | Maison et meubles | `assets/guide_hd/books.jpg` 512×512 | fidèle | — |
| `sportswear` Vêtements de sport | Jouets et sport | `assets/guide_hd/sportswear.jpg` 512×512 | fidèle | — |
| `tent` Tentes et camping | Jouets et sport | `assets/guide_hd/tent.jpg` 512×512 | fidèle | — |
| `ebike` Vélos électriques | Jouets et sport | `assets/guide_hd/ebike.jpg` 512×512 | moyen : vélo de ville, aucune batterie visible (se confond avec bike) | commande Cowork ebike.jpg |
| `dolls` Poupées et peluches | Jouets et sport | `assets/guide_hd/dolls.jpg` 512×512 | fidèle | — |
| `etoys` Jouets électroniques | Jouets et sport | `assets/guide_hd/etoys.jpg` 512×512 | fidèle | — |
| `car` Voitures | Auto et outils | `assets/guide_hd/car.jpg` 512×512 · hero `wall-street-empire/assets/products_hd/car.jpg` 1280×720 | fidèle | — |
| `car_alu` Voitures en aluminium | Auto et outils | `assets/guide_hd/car_alu.jpg` 512×512 | fidèle | — |
| `cookware` Casseroles et couverts inox | Maison et meubles | `assets/guide_hd/cookware.jpg` 512×512 | fidèle | — |
| `scooter` Scooters | Auto et outils | `assets/guide_hd/scooter.jpg` 512×512 | fidèle | — |
| `lube` Lubrifiants et carburants | Auto et outils | `assets/guide_hd/lube.jpg` 512×512 | mauvais : bidon couvert de pseudo-texte « MOTFARH » | commande Cowork lube.jpg |
| `handtools` Outillage à main | Auto et outils | `assets/guide_hd/handtools.jpg` 512×512 | fidèle | — |
| `powertools` Outillage électroportatif | Auto et outils | `assets/guide_hd/powertools.jpg` 512×512 | fidèle | — |
| `drinkmilk` Lait de consommation | Alimentation | `assets/guide_hd/milk.jpg` 512×512 (GUIDE_FILL) | approchant : pichet et verre de lait (photo du lait cru), pas la brique ou la bouteille du commerce | code : GUIDE_FILL drinkmilk ← milk.jpg ; commande Cowork drinkmilk.jpg |
| `eggs` Œufs | Alimentation | **repli vectoriel** (productSVG0) | repli propre : boîte d'œufs ouverte (dessin vectoriel `eggbox`), remplace un pot de yaourt | commande Cowork eggs.jpg |
| `beefmeat` Viande de bœuf | Alimentation | `assets/guide_hd/meat.jpg` 512×512 (GUIDE_FILL) | fidèle : pièce de bœuf persillée sur planche (photo des viandes d'abattoir) | code : GUIDE_FILL beefmeat ← meat.jpg ; commande Cowork beefmeat.jpg (barquette de steaks) pour la distinguer |
| `chicken` Poulet | Alimentation | **repli vectoriel** (productSVG0) | repli propre : poulet entier cru sur barquette (`chicken`), remplace le plateau-repas générique | commande Cowork chicken.jpg |
| `porkmeat` Viande de porc | Alimentation | **repli vectoriel** (productSVG0) | repli propre : côte de porc avec os (`chop`), remplace le plateau-repas | commande Cowork porkmeat.jpg |
| `lambmeat` Viande d'agneau | Alimentation | **repli vectoriel** (productSVG0) | repli propre : carré d'agneau, 3 côtes manchonnées (`rack`), remplace le plateau-repas | commande Cowork lambmeat.jpg |
| `sausage` Saucisson et charcuterie | Alimentation | **repli vectoriel** (productSVG0) | repli propre : saucisson fleuri ficelé et rondelles (`saucisson`), remplace une tablette de chocolat | commande Cowork sausage.jpg |
| `sweater` Pulls en laine | Mode | `assets/guide_hd/jacket.jpg` 512×512 (GUIDE_FILL) | approchant : pull col montant plié (jersey uni plutôt que grosse maille) | code : GUIDE_FILL sweater ← jacket.jpg ; commande Cowork sweater.jpg (pull en laine torsadée) |
| `tablewine` Vin de table | Boissons | **repli vectoriel** (productSVG0) | repli propre : litre de verre vert, étiquette unie à bande bordeaux, verre de rouge (`tablewine`) ; distinct du grand cru | commande Cowork tablewine.jpg |
| `grandcru` Vin de grande réserve | Boissons | **repli vectoriel** (productSVG0) | repli propre : bouteille bordelaise très sombre, capsule or longue, étiquette crème à double filet doré et gravure de château (forme, sans texte), cachet de cire, caisse en bois (`grandcru`) | commande Cowork grandcru.jpg |
| `petfood` Aliments pour animaux | Alimentation | `assets/guide_hd/petfood.jpg` 512×512 | moyen : sachet de croquettes juste, petit pseudo-texte | commande Cowork facultative |
| `tableoil` Huile de table | Alimentation | **repli vectoriel** (productSVG0) | repli correct : bouteille d'huile dorée bouchon vert (`bottle`) | commande Cowork tableoil.jpg (sujet déjà dans photos_guide.json) |
| `cornchips` Chips de maïs | Alimentation | **repli vectoriel** (productSVG0) | repli propre : sachet doré et chips triangulaires (`chips`) | commande Cowork cornchips.jpg (sujet déjà dans photos_guide.json) |
| `biofuel` Biocarburant en bidons | Auto et outils | **repli vectoriel** (productSVG0) | repli correct : jerrican vert (`oilcan`) | commande Cowork biofuel.jpg (sujet déjà dans photos_guide.json) |
| `oil` Pétrole | raw | `assets/guide_hd/oil.jpg` 512×512 | fidèle | — |
| `iron` Minerai de fer | raw | `assets/guide_hd/iron.jpg` 512×512 | fidèle | — |
| `coal` Charbon | raw | `assets/guide_hd/coal.jpg` 512×512 | fidèle | — |
| `copper` Cuivre | raw | `assets/guide_hd/copper.jpg` 512×512 | fidèle | — |
| `gold` Or brut | raw | `assets/guide_hd/gold.jpg` 512×512 | fidèle | — |
| `wood` Bois | raw | `assets/guide_hd/wood.jpg` 512×512 | fidèle | — |
| `gravel` Gravier | raw | `assets/guide_hd/gravel.jpg` 512×512 | fidèle | — |
| `sand` Sable | raw | `assets/guide_hd/sand.jpg` 512×512 | fidèle | — |
| `limestone` Calcaire | raw | `assets/guide_hd/limestone.jpg` 512×512 | fidèle | — |
| `nickel` Nickel | raw | `assets/guide_hd/nickel.jpg` 512×512 | fidèle | — |
| `chrome` Chrome | raw | `assets/guide_hd/chrome.jpg` 512×512 | moyen : roche bleu foncé, peu caractéristique | facultatif |
| `bauxite` Bauxite | raw | `assets/guide_hd/bauxite.jpg` 512×512 | fidèle | — |
| `lithium` Lithium | raw | `assets/guide_hd/lithium.jpg` 512×512 | fidèle | — |
| `silica` Silice pure | raw | `assets/guide_hd/silica.jpg` 512×512 | fidèle | — |
| `salt` Sel gemme | raw | `assets/guide_hd/salt.jpg` 512×512 | fidèle | — |
| `sulfur` Soufre | raw | `assets/guide_hd/sulfur.jpg` 512×512 | fidèle | — |
| `phosphate` Phosphate | raw | `assets/guide_hd/phosphate.jpg` 512×512 | fidèle | — |
| `gas` Gaz naturel | raw | `assets/guide_hd/gas.jpg` 512×512 | fidèle | — |
| `rare` Terres rares | raw | `assets/guide_hd/rare.jpg` 512×512 | fidèle | — |
| `zinc` Zinc | raw | `assets/guide_hd/zinc.jpg` 512×512 | fidèle | — |
| `clay` Argile et kaolin | raw | `assets/guide_hd/clay.jpg` 512×512 | fidèle | — |
| `potash` Potasse | raw | `assets/guide_hd/potash.jpg` 512×512 | fidèle | — |
| `graphite` Graphite | raw | `assets/guide_hd/graphite.jpg` 512×512 | fidèle | — |
| `wheat` Blé | raw | `assets/guide_hd/wheat.jpg` 512×512 | fidèle | — |
| `sugar` Canne à sucre | raw | `assets/guide_hd/sugar.jpg` 512×512 | approchant : brin de canne qui évoque un bambou | facultatif |
| `cotton` Coton | raw | `assets/guide_hd/cotton.jpg` 512×512 | fidèle | — |
| `rubber` Caoutchouc naturel | raw | `assets/guide_hd/rubber.jpg` 512×512 | moyen : boule brune (ressemble à une noix de coco) et gobelet blanc | commande Cowork rubber.jpg (feuille de latex / balles de caoutchouc) |
| `grapes` Raisin | raw | **repli vectoriel** (drawItem) | repli propre : grappe de raisin violet (dessin vectoriel), remplace le tas de rochers par défaut | commande Cowork grapes.jpg |
| `corn` Maïs | raw | **repli vectoriel** (drawItem) | repli correct : épi de maïs vectoriel | commande Cowork corn.jpg (sujet déjà dans photos_guide.json) |
| `rapeseed` Colza (graines) | raw | **repli vectoriel** (drawItem) | repli correct : brin de colza en fleurs et graines (vectoriel) | commande Cowork rapeseed.jpg (sujet déjà dans photos_guide.json) |
| `milk` Lait cru | raw | `assets/guide_hd/milk.jpg` 512×512 | fidèle | — |
| `egg` Œufs en vrac | raw | **repli vectoriel** (drawItem) | repli propre : œufs sur plateau (vectoriel), remplace le tas de rochers | commande Cowork egg.jpg |
| `beef` Bœuf (carcasses) | raw | composé au build depuis `assets/phase2_hd/animal_vache.png` (GUIDE_COMPOSE) | provisoire : vache HD (animal_vache) sur fond studio, pas une carcasse | code : GUIDE_COMPOSE ; commande Cowork beef.jpg |
| `pork` Porc (carcasses) | raw | composé depuis `assets/phase2_hd/animal_cochon.png` | provisoire : cochon HD sur fond studio, pas une carcasse | code : GUIDE_COMPOSE ; commande Cowork pork.jpg |
| `poultry` Volaille (carcasses) | raw | composé depuis `assets/phase2_hd/animal_poule.png` | provisoire : poule HD sur fond studio | code : GUIDE_COMPOSE ; commande Cowork poultry.jpg |
| `lamb` Agneau (carcasses) | raw | composé depuis `assets/phase2_hd/animal_mouton.png` | provisoire : mouton HD sur fond studio (même image que la laine) | code : GUIDE_COMPOSE ; commande Cowork lamb.jpg |
| `wool` Laine brute | raw | composé depuis `assets/phase2_hd/animal_mouton.png` | approchant : mouton HD sur fond studio (la laine sur pied) | code : GUIDE_COMPOSE ; commande Cowork wool.jpg (toison / écheveaux) |
| `leather` Cuir brut | raw | `assets/guide_hd/leather.jpg` 512×512 | fidèle | — |
| `flour` Farine | comp | `assets/guide_hd/flour.jpg` 512×512 | fidèle | — |
| `fabric` Tissu | comp | `assets/guide_hd/fabric.jpg` 512×512 | fidèle | — |
| `tire` Pneus | comp | `assets/guide_hd/tire.jpg` 512×512 | fidèle | — |
| `ingot` Lingots d'or | comp | `assets/guide_hd/ingot.jpg` 512×512 | moyen : palet doré rond, pas un lingot | commande Cowork ingot.jpg (lingot trapézoïdal) |
| `steel` Acier | comp | `assets/guide_hd/steel.jpg` 512×512 | fidèle | — |
| `plank` Planches | comp | `assets/guide_hd/plank.jpg` 512×512 | fidèle | — |
| `stud` Montants d'ossature bois | comp | `assets/guide_hd/stud.jpg` 512×512 | fidèle | — |
| `osb` Panneaux OSB | comp | `assets/guide_hd/osb.jpg` 512×512 | fidèle | — |
| `cement` Ciment | comp | `assets/guide_hd/cement.jpg` 512×512 | fidèle | — |
| `concrete` Béton | comp | `assets/guide_hd/concrete.jpg` 512×512 | fidèle | — |
| `chem` Produits chimiques | comp | `assets/guide_hd/chem.jpg` 512×512 | fidèle | — |
| `api` Principes actifs | comp | `assets/guide_hd/api.jpg` 512×512 | fidèle | — |
| `plastic` Plastique | comp | `assets/guide_hd/plastic.jpg` 512×512 | fidèle | — |
| `wire` Câbles de cuivre | comp | `assets/guide_hd/wire.jpg` 512×512 | fidèle | — |
| `pack` Emballages | comp | `assets/guide_hd/pack.jpg` 512×512 | fidèle | — |
| `motor` Moteurs électriques | comp | `assets/guide_hd/motor.jpg` 512×512 | fidèle | — |
| `battery` Batteries | comp | `assets/guide_hd/battery.jpg` 512×512 | fidèle | — |
| `circuit` Cartes électroniques | comp | `assets/guide_hd/circuit.jpg` 512×512 | fidèle | — |
| `gcase` Boîtiers en or | comp | `assets/guide_hd/gcase.jpg` 512×512 | fidèle | — |
| `screen` Écrans | comp | `assets/guide_hd/screen.jpg` 512×512 | mauvais : carré blanc uni, on ne lit pas un écran | commande Cowork screen.jpg (dalle d'écran nue, bord noir) |
| `glass` Verre | comp | `assets/guide_hd/glass.jpg` 512×512 | fidèle | — |
| `silicon` Silicium | comp | `assets/guide_hd/silicon.jpg` 512×512 | moyen : disque blanc mat, une plaquette de silicium est gris miroir | commande Cowork silicon.jpg |
| `essence` Essences et arômes | comp | `assets/guide_hd/essence.jpg` 512×512 | fidèle | — |
| `rweld` Robot de soudure | comp | `assets/guide_hd/rweld.jpg` 512×512 | fidèle | — |
| `rpaint` Robot de peinture | comp | `assets/guide_hd/rpaint.jpg` 512×512 | fidèle | — |
| `rasm` Robot d'assemblage | comp | `assets/guide_hd/rasm.jpg` 512×512 | fidèle | — |
| `r6` Robot 6 axes | comp | `assets/guide_hd/r6.jpg` 512×512 | fidèle | — |
| `paper` Papier et carton | comp | `assets/guide_hd/paper.jpg` 512×512 | fidèle | — |
| `meat` Viandes (abattoir) | comp | `assets/guide_hd/meat.jpg` 512×512 | fidèle | — |
| `wine` Vin | comp | **repli vectoriel** (drawItem) | repli propre : tonneau de vin (vectoriel), remplace un rectangle bordeaux | commande Cowork wine.jpg |
| `ceramic` Céramique | comp | `assets/guide_hd/ceramic.jpg` 512×512 | fidèle | — |
| `hardware` Fermetures et quincaillerie | comp | `assets/guide_hd/hardware.jpg` 512×512 | fidèle | — |
| `case` Boîtiers et coques | comp | `assets/guide_hd/case.jpg` 512×512 | fidèle | — |
| `foam` Mousse et rembourrage | comp | `assets/guide_hd/foam.jpg` 512×512 | fidèle | — |
| `paint` Peintures et vernis | comp | `assets/guide_hd/paint.jpg` 512×512 | fidèle : pot de peinture et pinceau (petite étiquette) | — |
| `rubberp` Pièces en caoutchouc | comp | `assets/guide_hd/rubberp.jpg` 512×512 | fidèle | — |
| `tfabric` Textiles techniques | comp | `assets/guide_hd/tfabric.jpg` 512×512 | fidèle | — |
| `led` Éclairage LED | comp | `assets/guide_hd/led.jpg` 512×512 | fidèle | — |
| `engine` Moteurs thermiques | comp | `assets/guide_hd/engine.jpg` 512×512 | fidèle | — |
| `chassis` Châssis et carrosserie | comp | `assets/guide_hd/chassis.jpg` 512×512 | fidèle | — |
| `sensor` Capteurs et optiques | comp | `assets/guide_hd/sensor.jpg` 512×512 | fidèle | — |
| `pv` Cellules photovoltaïques | comp | `assets/guide_hd/pv.jpg` 512×512 | fidèle | — |
| `cpu` Processeurs | comp | repli vectoriel (puce sur support, sans texte) | provisoire | photo commandée (RETOURS.md n° 12, `cpu.jpg`) |
| `dram` Mémoire DRAM | comp | repli vectoriel (barrette, sans texte) | provisoire | photo commandée (RETOURS.md n° 12, `dram.jpg`) |
| `gpu` Cartes graphiques et accélérateurs IA | comp | repli vectoriel (carte à deux ventilateurs, sans texte) | provisoire | photo commandée (RETOURS.md n° 12, `gpu.jpg`) |
| `stainless` Acier inoxydable | comp | `assets/guide_hd/stainless.jpg` 512×512 | fidèle | — |
| `galva` Acier galvanisé | comp | `assets/guide_hd/galva.jpg` 512×512 | fidèle | — |
| `brass` Laiton | comp | `assets/guide_hd/brass.jpg` 512×512 | fidèle | — |
| `alumina` Alumine | comp | `assets/guide_hd/alumina.jpg` 512×512 | fidèle | — |
| `aluminium` Aluminium | comp | `assets/guide_hd/aluminium.jpg` 512×512 | fidèle | — |
| `magnet` Aimants permanents | comp | `assets/guide_hd/magnet.jpg` 512×512 | fidèle | — |
| `fert` Engrais | comp | `assets/guide_hd/fert.jpg` 512×512 | fidèle | — |
| `brick` Briques | comp | `assets/guide_hd/brick.jpg` 512×512 | fidèle | — |
| `porcelain` Porcelaine | comp | `assets/guide_hd/porcelain.jpg` 512×512 | fidèle | — |
| `chassisal` Châssis en aluminium | comp | `assets/guide_hd/chassisal.jpg` 512×512 | fidèle | — |
| `cookoil` Huile de cuisine | comp | **repli vectoriel** (drawItem) | repli correct : bidon d'huile doré (vectoriel) | commande Cowork cookoil.jpg (sujet déjà dans photos_guide.json) |
| `biodiesel` Biodiesel | comp | **repli vectoriel** (drawItem) | repli correct : fût vert (vectoriel) | commande Cowork biodiesel.jpg (sujet déjà dans photos_guide.json) |
| `basic` Biens de base | goods | **repli vectoriel** (drawItem) | repli définitif : catégorie abstraite (carton de biens de base) | aucune photo nécessaire |
| `std` Biens manufacturés | goods | **repli vectoriel** (drawItem) | repli définitif : catégorie abstraite (biens manufacturés) | aucune photo nécessaire |
| `lux` Produits de luxe | goods | **repli vectoriel** (drawItem) | repli définitif : catégorie abstraite (coffret de luxe) | aucune photo nécessaire |

## Fermes (captures `tools/capture_fermes.js`, 3 zooms)

| ferme | avant (sprite HD seul) | passe 59 (code, par-dessus le sprite) | reste à faire (Cowork n° 11) |
|---|---|---|---|
| `fwheat` blé | tapis doré plat qui évoque du chaume, meules et figurines au milieu, aucun mouvement | blé dense (≈1 200 tiges au zoom rapproché) aux épis dorés, vagues de vent qui traversent le champ avec reflets clairs (effet « Gladiator »), meules retirées du champ | `fwheat_sol.png` (zone cultivée nue, sans figurines) |
| `frapeseed` colza | jaune vif lisible mais figé | tapis de fleurs jaune vif sur tiges vertes, ondulation | `frapeseed_sol.png` |
| `fcorn` maïs | rangs verts courts, ressemble à une jeune culture | rangées de hautes tiges (27-34 px), feuilles en arc, panicules et épis jaunes, sillons, balancement | `fcorn_sol.png` |
| `fsugar` canne | aplat vert | rangées serrées de tiges hautes vert clair, feuilles en lanières, balancement | `fsugar_sol.png` |
| `fcotton` coton | bourres blanches lisibles | inchangé (déjà fidèle) | — |
| `frubber` hévéa | rangs d'arbres ronds, lisible | inchangé | — |
| `fvine` vigne | quelques rangs peints, chai dominant | rangs palissés (piquets, fil, ceps, haie de feuillage), grappes noires de juillet à octobre, feuillage roux en automne, maigre l'hiver (taillé) | `fvine_sol.png` |
| `fcattle` bovins | vaches peintes petites et figées | 6 vaches HD plus grandes qui se promènent dans le pré (allure variable, se retournent), ombre au sol | `fcattle_pre.png`, cycles de marche |
| `fsheep` moutons | troupeau peint figé | 10 moutons animés | `fsheep_pre.png`, cycles de marche |
| `fpig` porcs | porcs roses peints figés | 8 porcs animés | `fpig_pre.png`, cycles de marche |
| `fchicken` poules | poules peintes minuscules | 14 poules animées qui picorent (sautillent) | `fchicken_pre.png`, cycles de marche |

Sous le zoom 0,4 le sprite seul est affiché (aucun coût). Effectifs proportionnels à la surface (consignes fermes). Tout est visuel et déterministe (rien en sauvegarde). Défaut honnête : les bêtes peintes du sprite restent visibles sous les bêtes animées (deux échelles) tant que les prés vides ne sont pas livrés ; à la vue normale (zlv[1]) les champs restent petits et le vent se voit peu, l'effet est net à partir du zoom rapproché.
