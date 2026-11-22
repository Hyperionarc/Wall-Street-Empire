# Audit des images par produit : ce que le jeu affiche réellement

Généré par `tools/audit_images_produits.js` (inventaire du jeu construit + lecture de `tools/build.py` + inventaire des dossiers d'assets). Ne juge pas la ressemblance (voir `AUDIT_PRODUITS.md` et ses planches) : vérifie que chaque clé affiche la meilleure image existante et liste ce qui reste à commander.

- 192 clés (94 produits, 98 biens) : 161 photos HD propres, 1 substituées, 4 voisines, 5 composites, 18 replis vectoriels, 3 abstraites ; non branchées : 0 ; à commander : 28.
- Types d'image : **photo HD** = `assets/guide_hd/<clé>.jpg` (réduite à 288 px dans le jeu) ; **photo substituée / voisine** = `GUIDE_SUBST` / `GUIDE_FILL` de build.py (photo d'une autre clé, provisoire) ; **composite provisoire** = `GUIDE_COMPOSE` (animal HD posé sur fond studio) ; **repli vectoriel** = dessin du code sur fond sombre (`productSVG0` / `drawItem`), c'est ce que Rémy voit pour le vin de table, le vin de grande réserve et le saucisson ; **catégorie abstraite** = classes de gamme (base, manufacturé, luxe), sans objet à photographier.
- Dossiers d'assets examinés : assets/guide_hd, assets/guide_hd_256, assets/phase2_hd/guide, wall-street-empire/assets/guide_hd, wall-street-empire/assets/products_hd, assets/phase2_hd, assets/factory_hd. `assets/guide_hd_256` et `assets/phase2_hd/guide` sont des copies de `assets/guide_hd` (mêmes noms) : aucune photo cachée ailleurs. Aucune photo supprimée.
- Chemins d'affichage vérifiés dans `game.template.html` : `productSVG` (catalogue, fiche, rayons, Guide), `gThumb` (Guide), `compIcon` et `drawProd` (rayons, fournisseurs, emplacements, bulles de la halle) préfèrent tous la photo HD (`GUIDEHD`) au dessin ; aucun contournement trouvé. Le défaut vu par Rémy vient donc uniquement de l'absence de fichier, pas d'un mauvais branchement.

## Produits finis (94)

| clé et nom | genre · famille | image affichée | fichier HD disponible ? | action |
|---|---|---|---|---|
| `utensils` Ustensiles de cuisine | produit · Maison et meubles | photo HD : assets/guide_hd/utensils.jpg 512×512 | oui | — |
| `bread` Pain | produit · Alimentation | photo HD : assets/guide_hd/bread.jpg 512×512 · hero 16:9 | oui | — |
| `biscuits` Biscuits | produit · Alimentation | photo HD : assets/guide_hd/biscuits.jpg 512×512 | oui | — |
| `candy` Bonbons | produit · Alimentation | photo HD : assets/guide_hd/candy.jpg 512×512 | oui | — |
| `tshirt` T-shirts | produit · Mode | photo HD : assets/guide_hd/tshirt.jpg 512×512 | oui | — |
| `jeans` Jeans | produit · Mode | photo HD : assets/guide_hd/jeans.jpg 512×512 | oui | — |
| `sneakers` Baskets | produit · Mode | photo HD : assets/guide_hd/sneakers.jpg 512×512 · hero 16:9 | oui | — |
| `tyres` Pneus automobiles | produit · Auto et outils | photo HD : assets/guide_hd/tyres.jpg 512×512 | oui | — |
| `mattress` Matelas | produit · Maison et meubles | photo HD : assets/guide_hd/mattress.jpg 512×512 | oui | — |
| `toys` Jouets en plastique | produit · Jouets et sport | photo HD : assets/guide_hd/toys.jpg 512×512 · hero 16:9 | oui | — |
| `woodtoys` Jouets en bois | produit · Jouets et sport | photo HD : assets/guide_hd/woodtoys.jpg 512×512 | oui | — |
| `chair` Chaise | produit · Maison et meubles | photo HD : assets/guide_hd/chair.jpg 512×512 | oui | — |
| `bed` Lit | produit · Maison et meubles | photo HD : assets/guide_hd/bed.jpg 512×512 | oui | — |
| `house_wood` Maison à ossature bois | produit · Immobilier | photo HD : assets/guide_hd/house_wood.jpg 512×512 | oui | — |
| `house_concrete` Maison en béton | produit · Immobilier | photo HD : assets/guide_hd/house_concrete.jpg 512×512 | oui | — |
| `bike` Vélo | produit · Jouets et sport | photo HD : assets/guide_hd/bike.jpg 512×512 | oui | — |
| `washer` Lave-linge | produit · Électroménager | photo HD : assets/guide_hd/washer.jpg 512×512 | oui | — |
| `tv` Téléviseur | produit · Électronique | photo HD : assets/guide_hd/tv.jpg 512×512 · hero 16:9 | oui | — |
| `phone` Smartphone | produit · Électronique | photo HD : assets/guide_hd/phone.jpg 512×512 · hero 16:9 | oui | — |
| `headache` Pilules contre le mal de tête | produit · Santé et beauté | photo HD : assets/guide_hd/headache.jpg 512×512 | oui | — |
| `cough` Sirop contre la toux | produit · Santé et beauté | photo HD : assets/guide_hd/cough.jpg 512×512 | oui | — |
| `obesity` Pilules contre l'obésité | produit · Santé et beauté | photo HD : assets/guide_hd/obesity.jpg 512×512 · hero 16:9 | oui | — |
| `watch` Montre de luxe | produit · Mode | photo HD : assets/guide_hd/watch.jpg 512×512 · hero 16:9 | oui | — |
| `soap` Savons et détergents | produit · Santé et beauté | photo HD : assets/guide_hd/soap.jpg 512×512 | oui | — |
| `glassware` Verrerie et bocaux | produit · Maison et meubles | photo HD : assets/guide_hd/glassware.jpg 512×512 | oui | — |
| `cream` Crèmes et soins | produit · Santé et beauté | photo HD : assets/guide_hd/cream.jpg 512×512 | oui | — |
| `blender` Petit électroménager | produit · Électroménager | photo HD : assets/guide_hd/blender.jpg 512×512 | oui | — |
| `fridge` Réfrigérateur | produit · Électroménager | photo HD : assets/guide_hd/fridge.jpg 512×512 | oui | — |
| `jewelry` Bijoux en or | produit · Mode | photo HD : assets/guide_hd/jewelry.jpg 512×512 | oui | — |
| `perfume` Parfum de luxe | produit · Santé et beauté | photo HD : assets/guide_hd/perfume.jpg 512×512 · hero 16:9 | oui | — |
| `skincare` Soins de luxe | produit · Santé et beauté | photo HD : assets/guide_hd/skincare.jpg 512×512 | oui | — |
| `handbag` Sac de créateur | produit · Mode | photo HD : assets/guide_hd/handbag.jpg 512×512 | oui | — |
| `tablet` Tablette tactile | produit · Électronique | photo HD : assets/guide_hd/tablet.jpg 512×512 | oui | — |
| `laptop` Ordinateur portable | produit · Électronique | photo HD : assets/guide_hd/laptop.jpg 512×512 · hero 16:9 | oui | — |
| `console` Console de jeux | produit · Électronique | photo HD : assets/guide_hd/console.jpg 512×512 | oui | — |
| `yogurt` Yaourts | produit · Alimentation | photo HD : assets/guide_hd/yogurt.jpg 512×512 | oui | — |
| `cheese` Fromages | produit · Alimentation | photo HD : assets/guide_hd/cheese.jpg 512×512 | oui | — |
| `pasta` Pâtes alimentaires | produit · Alimentation | photo HD : assets/guide_hd/pasta.jpg 512×512 | oui | — |
| `chocolate` Chocolat | produit · Alimentation | photo HD : assets/guide_hd/chocolate.jpg 512×512 | oui | — |
| `readymeal` Plats cuisinés | produit · Alimentation | photo HD : assets/guide_hd/readymeal.jpg 512×512 | oui | — |
| `soda` Sodas | produit · Boissons | photo HD : assets/guide_hd/soda.jpg 512×512 | oui | — |
| `beer` Bière | produit · Boissons | photo HD : assets/guide_hd/beer.jpg 512×512 | oui | — |
| `spirits` Spiritueux | produit · Boissons | photo HD : assets/guide_hd/spirits.jpg 512×512 | oui | — |
| `whisky` Whisky de luxe | produit · Boissons | photo substituée : assets/guide_hd/spirit.jpg (GUIDE_SUBST ← spirit) | oui | commande : whisky.jpg propre (la photo whisky.jpg est jugée mauvaise) |
| `vitamins` Compléments alimentaires | produit · Santé et beauté | photo HD : assets/guide_hd/vitamins.jpg 512×512 | oui | — |
| `antibio` Antibiotiques | produit · Santé et beauté | photo HD : assets/guide_hd/antibio.jpg 512×512 | oui | — |
| `shampoo` Shampooings | produit · Santé et beauté | photo HD : assets/guide_hd/shampoo.jpg 512×512 | oui | — |
| `toothpaste` Dentifrice | produit · Santé et beauté | photo HD : assets/guide_hd/toothpaste.jpg 512×512 | oui | — |
| `makeup` Maquillage | produit · Santé et beauté | photo HD : assets/guide_hd/makeup.jpg 512×512 | oui | — |
| `hygiene` Couches et hygiène | produit · Santé et beauté | photo HD : assets/guide_hd/hygiene.jpg 512×512 | oui | — |
| `jacket` Vestes | produit · Mode | photo HD : assets/guide_hd/jacket.jpg 512×512 | oui | — |
| `leathershoes` Chaussures en cuir | produit · Mode | photo HD : assets/guide_hd/leathershoes.jpg 512×512 | oui | — |
| `dress` Robes | produit · Mode | photo HD : assets/guide_hd/dress.jpg 512×512 | oui | — |
| `socks` Chaussettes et sous-vêtements | produit · Mode | photo HD : assets/guide_hd/socks.jpg 512×512 | oui | — |
| `bag` Sacs en cuir | produit · Mode | photo HD : assets/guide_hd/bag.jpg 512×512 | oui | — |
| `couture` Haute couture | produit · Mode | photo HD : assets/guide_hd/couture.jpg 512×512 | oui | — |
| `camera` Appareils photo | produit · Électronique | photo HD : assets/guide_hd/camera.jpg 512×512 | oui | — |
| `smartwatch` Montres connectées | produit · Électronique | photo HD : assets/guide_hd/smartwatch.jpg 512×512 | oui | — |
| `headphones` Casques audio | produit · Électronique | photo HD : assets/guide_hd/headphones.jpg 512×512 | oui | — |
| `microwave` Fours micro-ondes | produit · Électroménager | photo HD : assets/guide_hd/microwave.jpg 512×512 | oui | — |
| `vacuum` Aspirateurs | produit · Électroménager | photo HD : assets/guide_hd/vacuum.jpg 512×512 | oui | — |
| `lamp` Luminaires LED | produit · Électronique | photo HD : assets/guide_hd/lamp.jpg 512×512 | oui | — |
| `desktop` Ordinateurs de bureau | produit · Électronique | photo HD : assets/guide_hd/desktop.jpg 512×512 | oui | — |
| `solarpanel` Panneaux solaires | produit · Électroménager | photo HD : assets/guide_hd/solarpanel.jpg 512×512 | oui | — |
| `sofa` Canapés | produit · Maison et meubles | photo HD : assets/guide_hd/sofa.jpg 512×512 | oui | — |
| `table` Tables | produit · Maison et meubles | photo HD : assets/guide_hd/table.jpg 512×512 | oui | — |
| `wardrobe` Armoires | produit · Maison et meubles | photo HD : assets/guide_hd/wardrobe.jpg 512×512 | oui | — |
| `tableware` Vaisselle en céramique | produit · Maison et meubles | photo HD : assets/guide_hd/tableware.jpg 512×512 | oui | — |
| `books` Livres et cahiers | produit · Maison et meubles | photo HD : assets/guide_hd/books.jpg 512×512 | oui | — |
| `sportswear` Vêtements de sport | produit · Jouets et sport | photo HD : assets/guide_hd/sportswear.jpg 512×512 | oui | — |
| `tent` Tentes et camping | produit · Jouets et sport | photo HD : assets/guide_hd/tent.jpg 512×512 | oui | — |
| `ebike` Vélos électriques | produit · Jouets et sport | photo HD : assets/guide_hd/ebike.jpg 512×512 | oui | — |
| `dolls` Poupées et peluches | produit · Jouets et sport | photo HD : assets/guide_hd/dolls.jpg 512×512 | oui | — |
| `etoys` Jouets électroniques | produit · Jouets et sport | photo HD : assets/guide_hd/etoys.jpg 512×512 | oui | — |
| `car` Voitures | produit · Auto et outils | photo HD : assets/guide_hd/car.jpg 512×512 · hero 16:9 | oui | — |
| `car_alu` Voitures en aluminium | produit · Auto et outils | photo HD : assets/guide_hd/car_alu.jpg 512×512 | oui | — |
| `cookware` Casseroles et couverts inox | produit · Maison et meubles | photo HD : assets/guide_hd/cookware.jpg 512×512 | oui | — |
| `scooter` Scooters | produit · Auto et outils | photo HD : assets/guide_hd/scooter.jpg 512×512 | oui | — |
| `lube` Lubrifiants et carburants | produit · Auto et outils | photo HD : assets/guide_hd/lube.jpg 512×512 | oui | — |
| `handtools` Outillage à main | produit · Auto et outils | photo HD : assets/guide_hd/handtools.jpg 512×512 | oui | — |
| `powertools` Outillage électroportatif | produit · Auto et outils | photo HD : assets/guide_hd/powertools.jpg 512×512 | oui | — |
| `drinkmilk` Lait de consommation | produit · Alimentation | photo voisine (provisoire) : assets/guide_hd/milk.jpg (GUIDE_FILL ← milk) | oui | commande : drinkmilk.jpg propre |
| `eggs` Œufs | produit · Alimentation | repli vectoriel (fond sombre) | non | commande : eggs.jpg propre |
| `beefmeat` Viande de bœuf | produit · Alimentation | photo voisine (provisoire) : assets/guide_hd/meat.jpg (GUIDE_FILL ← meat) | oui | commande : beefmeat.jpg propre |
| `chicken` Poulet | produit · Alimentation | repli vectoriel (fond sombre) | non | commande : chicken.jpg propre |
| `porkmeat` Viande de porc | produit · Alimentation | photo voisine (provisoire) : assets/guide_hd/meat.jpg (GUIDE_FILL ← meat) | oui | commande : porkmeat.jpg propre |
| `lambmeat` Agneau | produit · Alimentation | repli vectoriel (fond sombre) | non | commande : lambmeat.jpg propre |
| `sausage` Saucisson et charcuterie | produit · Alimentation | repli vectoriel (fond sombre) | non | commande : sausage.jpg propre |
| `sweater` Pulls en laine | produit · Mode | photo voisine (provisoire) : assets/guide_hd/jacket.jpg (GUIDE_FILL ← jacket) | oui | commande : sweater.jpg propre |
| `tablewine` Vin de table | produit · Boissons | repli vectoriel (fond sombre) | non | commande : tablewine.jpg propre |
| `grandcru` Vin de grande réserve | produit · Boissons | repli vectoriel (fond sombre) | non | commande : grandcru.jpg propre |
| `petfood` Aliments pour animaux | produit · Alimentation | photo HD : assets/guide_hd/petfood.jpg 512×512 | oui | — |
| `tableoil` Huile de table | produit · Alimentation | repli vectoriel (fond sombre) | non | commande : tableoil.jpg propre |
| `biofuel` Biocarburant en bidons | produit · Auto et outils | repli vectoriel (fond sombre) | non | commande : biofuel.jpg propre |

## Biens, matières et composants (98)

| clé et nom | genre · famille | image affichée | fichier HD disponible ? | action |
|---|---|---|---|---|
| `oil` Pétrole | bien · raw | photo HD : assets/guide_hd/oil.jpg 512×512 | oui | — |
| `iron` Minerai de fer | bien · raw | photo HD : assets/guide_hd/iron.jpg 512×512 | oui | — |
| `coal` Charbon | bien · raw | photo HD : assets/guide_hd/coal.jpg 512×512 | oui | — |
| `copper` Cuivre | bien · raw | photo HD : assets/guide_hd/copper.jpg 512×512 | oui | — |
| `gold` Or brut | bien · raw | photo HD : assets/guide_hd/gold.jpg 512×512 | oui | — |
| `wood` Bois | bien · raw | photo HD : assets/guide_hd/wood.jpg 512×512 | oui | — |
| `gravel` Gravier | bien · raw | photo HD : assets/guide_hd/gravel.jpg 512×512 | oui | — |
| `sand` Sable | bien · raw | photo HD : assets/guide_hd/sand.jpg 512×512 | oui | — |
| `limestone` Calcaire | bien · raw | photo HD : assets/guide_hd/limestone.jpg 512×512 | oui | — |
| `nickel` Nickel | bien · raw | photo HD : assets/guide_hd/nickel.jpg 512×512 | oui | — |
| `chrome` Chrome | bien · raw | photo HD : assets/guide_hd/chrome.jpg 512×512 | oui | — |
| `bauxite` Bauxite | bien · raw | photo HD : assets/guide_hd/bauxite.jpg 512×512 | oui | — |
| `lithium` Lithium | bien · raw | photo HD : assets/guide_hd/lithium.jpg 512×512 | oui | — |
| `silica` Silice pure | bien · raw | photo HD : assets/guide_hd/silica.jpg 512×512 | oui | — |
| `salt` Sel gemme | bien · raw | photo HD : assets/guide_hd/salt.jpg 512×512 | oui | — |
| `sulfur` Soufre | bien · raw | photo HD : assets/guide_hd/sulfur.jpg 512×512 | oui | — |
| `phosphate` Phosphate | bien · raw | photo HD : assets/guide_hd/phosphate.jpg 512×512 | oui | — |
| `gas` Gaz naturel | bien · raw | photo HD : assets/guide_hd/gas.jpg 512×512 | oui | — |
| `rare` Terres rares | bien · raw | photo HD : assets/guide_hd/rare.jpg 512×512 | oui | — |
| `zinc` Zinc | bien · raw | photo HD : assets/guide_hd/zinc.jpg 512×512 | oui | — |
| `clay` Argile et kaolin | bien · raw | photo HD : assets/guide_hd/clay.jpg 512×512 | oui | — |
| `potash` Potasse | bien · raw | photo HD : assets/guide_hd/potash.jpg 512×512 | oui | — |
| `graphite` Graphite | bien · raw | photo HD : assets/guide_hd/graphite.jpg 512×512 | oui | — |
| `wheat` Blé | bien · raw | photo HD : assets/guide_hd/wheat.jpg 512×512 | oui | — |
| `sugar` Canne à sucre | bien · raw | photo HD : assets/guide_hd/sugar.jpg 512×512 | oui | — |
| `cotton` Coton | bien · raw | photo HD : assets/guide_hd/cotton.jpg 512×512 | oui | — |
| `rubber` Caoutchouc naturel | bien · raw | photo HD : assets/guide_hd/rubber.jpg 512×512 | oui | — |
| `grapes` Raisin | bien · raw | repli vectoriel (fond sombre) | non | commande : grapes.jpg propre |
| `corn` Maïs | bien · raw | repli vectoriel (fond sombre) | non | commande : corn.jpg propre |
| `rapeseed` Colza (graines) | bien · raw | repli vectoriel (fond sombre) | non | commande : rapeseed.jpg propre |
| `milk` Lait cru | bien · raw | photo HD : assets/guide_hd/milk.jpg 512×512 | oui | — |
| `egg` Œufs en vrac | bien · raw | repli vectoriel (fond sombre) | non | commande : egg.jpg propre |
| `beef` Bœuf (carcasses) | bien · raw | composite provisoire : assets/phase2_hd/animal_vache.png sur fond studio (GUIDE_COMPOSE) | non | commande : beef.jpg propre |
| `pork` Porc (carcasses) | bien · raw | composite provisoire : assets/phase2_hd/animal_cochon.png sur fond studio (GUIDE_COMPOSE) | non | commande : pork.jpg propre |
| `poultry` Volaille (carcasses) | bien · raw | composite provisoire : assets/phase2_hd/animal_poule.png sur fond studio (GUIDE_COMPOSE) | non | commande : poultry.jpg propre |
| `lamb` Agneau (carcasses) | bien · raw | composite provisoire : assets/phase2_hd/animal_mouton.png sur fond studio (GUIDE_COMPOSE) | non | commande : lamb.jpg propre |
| `wool` Laine brute | bien · raw | composite provisoire : assets/phase2_hd/animal_mouton.png sur fond studio (GUIDE_COMPOSE) | non | commande : wool.jpg propre |
| `leather` Cuir brut | bien · raw | photo HD : assets/guide_hd/leather.jpg 512×512 | oui | — |
| `flour` Farine | bien · comp | photo HD : assets/guide_hd/flour.jpg 512×512 | oui | — |
| `fabric` Tissu | bien · comp | photo HD : assets/guide_hd/fabric.jpg 512×512 | oui | — |
| `tire` Pneus | bien · comp | photo HD : assets/guide_hd/tire.jpg 512×512 | oui | — |
| `ingot` Lingots d'or | bien · comp | photo HD : assets/guide_hd/ingot.jpg 512×512 | oui | — |
| `steel` Acier | bien · comp | photo HD : assets/guide_hd/steel.jpg 512×512 | oui | — |
| `plank` Planches | bien · comp | photo HD : assets/guide_hd/plank.jpg 512×512 | oui | — |
| `stud` Montants d'ossature bois | bien · comp | photo HD : assets/guide_hd/stud.jpg 512×512 | oui | — |
| `osb` Panneaux OSB | bien · comp | photo HD : assets/guide_hd/osb.jpg 512×512 | oui | — |
| `cement` Ciment | bien · comp | photo HD : assets/guide_hd/cement.jpg 512×512 | oui | — |
| `concrete` Béton | bien · comp | photo HD : assets/guide_hd/concrete.jpg 512×512 | oui | — |
| `chem` Produits chimiques | bien · comp | photo HD : assets/guide_hd/chem.jpg 512×512 | oui | — |
| `api` Principes actifs | bien · comp | photo HD : assets/guide_hd/api.jpg 512×512 | oui | — |
| `plastic` Plastique | bien · comp | photo HD : assets/guide_hd/plastic.jpg 512×512 | oui | — |
| `wire` Câbles de cuivre | bien · comp | photo HD : assets/guide_hd/wire.jpg 512×512 | oui | — |
| `pack` Emballages | bien · comp | photo HD : assets/guide_hd/pack.jpg 512×512 | oui | — |
| `motor` Moteurs électriques | bien · comp | photo HD : assets/guide_hd/motor.jpg 512×512 | oui | — |
| `battery` Batteries | bien · comp | photo HD : assets/guide_hd/battery.jpg 512×512 | oui | — |
| `circuit` Cartes électroniques | bien · comp | photo HD : assets/guide_hd/circuit.jpg 512×512 | oui | — |
| `gcase` Boîtiers en or | bien · comp | photo HD : assets/guide_hd/gcase.jpg 512×512 | oui | — |
| `screen` Écrans | bien · comp | photo HD : assets/guide_hd/screen.jpg 512×512 | oui | — |
| `glass` Verre | bien · comp | photo HD : assets/guide_hd/glass.jpg 512×512 | oui | — |
| `silicon` Silicium | bien · comp | photo HD : assets/guide_hd/silicon.jpg 512×512 | oui | — |
| `essence` Essences et arômes | bien · comp | photo HD : assets/guide_hd/essence.jpg 512×512 | oui | — |
| `rweld` Robot de soudure | bien · comp | photo HD : assets/guide_hd/rweld.jpg 512×512 | oui | — |
| `rpaint` Robot de peinture | bien · comp | photo HD : assets/guide_hd/rpaint.jpg 512×512 | oui | — |
| `rasm` Robot d'assemblage | bien · comp | photo HD : assets/guide_hd/rasm.jpg 512×512 | oui | — |
| `r6` Robot 6 axes | bien · comp | photo HD : assets/guide_hd/r6.jpg 512×512 | oui | — |
| `paper` Papier et carton | bien · comp | photo HD : assets/guide_hd/paper.jpg 512×512 | oui | — |
| `meat` Viandes (abattoir) | bien · comp | photo HD : assets/guide_hd/meat.jpg 512×512 | oui | — |
| `wine` Vin | bien · comp | repli vectoriel (fond sombre) | non | commande : wine.jpg propre |
| `ceramic` Céramique | bien · comp | photo HD : assets/guide_hd/ceramic.jpg 512×512 | oui | — |
| `hardware` Fermetures et quincaillerie | bien · comp | photo HD : assets/guide_hd/hardware.jpg 512×512 | oui | — |
| `case` Boîtiers et coques | bien · comp | photo HD : assets/guide_hd/case.jpg 512×512 | oui | — |
| `foam` Mousse et rembourrage | bien · comp | photo HD : assets/guide_hd/foam.jpg 512×512 | oui | — |
| `paint` Peintures et vernis | bien · comp | photo HD : assets/guide_hd/paint.jpg 512×512 | oui | — |
| `rubberp` Pièces en caoutchouc | bien · comp | photo HD : assets/guide_hd/rubberp.jpg 512×512 | oui | — |
| `tfabric` Textiles techniques | bien · comp | photo HD : assets/guide_hd/tfabric.jpg 512×512 | oui | — |
| `led` Éclairage LED | bien · comp | photo HD : assets/guide_hd/led.jpg 512×512 | oui | — |
| `engine` Moteurs thermiques | bien · comp | photo HD : assets/guide_hd/engine.jpg 512×512 | oui | — |
| `chassis` Châssis et carrosserie | bien · comp | photo HD : assets/guide_hd/chassis.jpg 512×512 | oui | — |
| `sensor` Capteurs et optiques | bien · comp | photo HD : assets/guide_hd/sensor.jpg 512×512 | oui | — |
| `cpu` Processeurs | bien · comp | repli vectoriel (fond sombre) | non | commande : cpu.jpg propre |
| `dram` Mémoire DRAM | bien · comp | repli vectoriel (fond sombre) | non | commande : dram.jpg propre |
| `gpu` Cartes graphiques et accélérateurs IA | bien · comp | repli vectoriel (fond sombre) | non | commande : gpu.jpg propre |
| `pv` Cellules photovoltaïques | bien · comp | photo HD : assets/guide_hd/pv.jpg 512×512 | oui | — |
| `stainless` Acier inoxydable | bien · comp | photo HD : assets/guide_hd/stainless.jpg 512×512 | oui | — |
| `galva` Acier galvanisé | bien · comp | photo HD : assets/guide_hd/galva.jpg 512×512 | oui | — |
| `brass` Laiton | bien · comp | photo HD : assets/guide_hd/brass.jpg 512×512 | oui | — |
| `alumina` Alumine | bien · comp | photo HD : assets/guide_hd/alumina.jpg 512×512 | oui | — |
| `aluminium` Aluminium | bien · comp | photo HD : assets/guide_hd/aluminium.jpg 512×512 | oui | — |
| `magnet` Aimants permanents | bien · comp | photo HD : assets/guide_hd/magnet.jpg 512×512 | oui | — |
| `fert` Engrais | bien · comp | photo HD : assets/guide_hd/fert.jpg 512×512 | oui | — |
| `brick` Briques | bien · comp | photo HD : assets/guide_hd/brick.jpg 512×512 | oui | — |
| `porcelain` Porcelaine | bien · comp | photo HD : assets/guide_hd/porcelain.jpg 512×512 | oui | — |
| `chassisal` Châssis en aluminium | bien · comp | photo HD : assets/guide_hd/chassisal.jpg 512×512 | oui | — |
| `cookoil` Huile de cuisine | bien · comp | repli vectoriel (fond sombre) | non | commande : cookoil.jpg propre |
| `biodiesel` Biodiesel | bien · comp | repli vectoriel (fond sombre) | non | commande : biodiesel.jpg propre |
| `basic` Biens de base | bien · goods | catégorie abstraite | non | aucune (pas un objet) |
| `std` Biens manufacturés | bien · goods | catégorie abstraite | non | aucune (pas un objet) |
| `lux` Produits de luxe | bien · goods | catégorie abstraite | non | aucune (pas un objet) |

## À commander (28)

- `whisky.jpg` Whisky de luxe (photo substituée)
- `drinkmilk.jpg` Lait de consommation (photo voisine (provisoire))
- `eggs.jpg` Œufs (repli vectoriel (fond sombre))
- `beefmeat.jpg` Viande de bœuf (photo voisine (provisoire))
- `chicken.jpg` Poulet (repli vectoriel (fond sombre))
- `porkmeat.jpg` Viande de porc (photo voisine (provisoire))
- `lambmeat.jpg` Agneau (repli vectoriel (fond sombre))
- `sausage.jpg` Saucisson et charcuterie (repli vectoriel (fond sombre))
- `sweater.jpg` Pulls en laine (photo voisine (provisoire))
- `tablewine.jpg` Vin de table (repli vectoriel (fond sombre))
- `grandcru.jpg` Vin de grande réserve (repli vectoriel (fond sombre))
- `tableoil.jpg` Huile de table (repli vectoriel (fond sombre))
- `biofuel.jpg` Biocarburant en bidons (repli vectoriel (fond sombre))
- `grapes.jpg` Raisin (repli vectoriel (fond sombre))
- `corn.jpg` Maïs (repli vectoriel (fond sombre))
- `rapeseed.jpg` Colza (graines) (repli vectoriel (fond sombre))
- `egg.jpg` Œufs en vrac (repli vectoriel (fond sombre))
- `beef.jpg` Bœuf (carcasses) (composite provisoire)
- `pork.jpg` Porc (carcasses) (composite provisoire)
- `poultry.jpg` Volaille (carcasses) (composite provisoire)
- `lamb.jpg` Agneau (carcasses) (composite provisoire)
- `wool.jpg` Laine brute (composite provisoire)
- `wine.jpg` Vin (repli vectoriel (fond sombre))
- `cpu.jpg` Processeurs (repli vectoriel (fond sombre))
- `dram.jpg` Mémoire DRAM (repli vectoriel (fond sombre))
- `gpu.jpg` Cartes graphiques et accélérateurs IA (repli vectoriel (fond sombre))
- `cookoil.jpg` Huile de cuisine (repli vectoriel (fond sombre))
- `biodiesel.jpg` Biodiesel (repli vectoriel (fond sombre))
