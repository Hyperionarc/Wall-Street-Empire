# RETOURS de l'intégrateur (session cloud) au producteur

Intégration faite sur la branche `ccr-d9ba3623-415kh0` (pas dans master) : `tools/build.py` lit `assets/factory_hd/` en priorité, `assets/factory/` en repli (embarqué aussi, utilisé si le PNG HD est illisible), puis le vectoriel. Les noms du lot 2 sont reconnus. Test : `wall-street-empire/tools/tests/t15_sprites_hd.js`.
Aucun sprite HD n'existe encore : les points ci-dessous viennent de la lecture du manifeste et du code, pas d'un rendu observé. Je les vérifierai sur les vrais PNG.

## À corriger côté producteur

1. **Planches d'ouvriers du lot 1 jamais assemblées.** `manifest.json` ne déclare dans `planches` que `ouvrier_h1 … ouvrier_f3` (lot 2). Or le jeu charge `ouvrier_gilet_orange.png` et `ouvrier_gilet_bleu.png` (planches de 4 vignettes 128x200, ordre marche, porte_carton, machine, debout). Les poses lot 1 `poses/ouvrier_gilet_*_*` seraient produites, mais aucune planche portant ce nom : le jeu ne verrait jamais les ouvriers HD. Ajouter ces deux entrées dans `planches` (dans `build_manifest.py` aussi, pour qu'elles survivent à une régénération).
2. **Orientation des noms du lot 2.** `nord_est`, `sud_est`, `ne`, `nw`, `se`, `sw`, `face`, `dos` ne disent pas quelle direction d'écran ils désignent. Dans le jeu, l'axe x va vers le bas-droite de l'écran et l'axe y vers le bas-gauche. Écrire dans `manifest.json` (ou `config.json`) la correspondance exacte, par exemple « nord_est = vers le haut-droite de l'écran » : sans elle, je risque de poser les convoyeurs et murs à l'envers.
3. **Pas de miroir côté jeu pour le lot 2.** Le jeu sait retourner un sprite autour de son ancre (`fl`), mais je ne l'utiliserai pas pour fabriquer une orientation manquante : chaque orientation du lot 2 doit être un sprite à part (c'est déjà le cas dans le manifeste), avec la même ancre au sol.

## Points à surveiller à la première planche

- **Ancre et échelle :** un sprite du lot 1 doit tomber à 1 px du gabarit (`largeur`, `hauteur`, `ancre_x`, `ancre_y`, `echelle_px_par_m` identiques ou très proches). Le jeu s'en sert tels quels : une dérive de l'ancre décale l'objet sur sa case.
- **Poids :** `build.py` embarque chaque PNG en base64 dans `city.html` (3,7 Mo aujourd'hui avec les 29 gabarits). 119 sprites HD, dont des camions de 1024 px, peuvent doubler le fichier. Passer les PNG par une quantification (palette 256 couleurs) ou `oxipng` avant de pousser, et dire si un sprite dépasse 150 Ko.
- **Ombres :** `ombres/<nom>.png` doit avoir la même taille que le sprite ; sinon elle est dessinée décalée.

## Réponses (15 nov., auteur du kit)

1. **Planches du lot 1 : corrigé.** `ouvrier_gilet_orange` et `ouvrier_gilet_bleu` sont déclarées dans `planches` (`build_manifest.py` et `manifest.json`) et assemblées à la fin de chaque lot.
2. **Orientations : écrites dans `ORIENTATIONS.md`**, en directions d'écran et dans le repère du jeu. Les consignes du manifeste reprennent ces directions.
3. **Pas de miroir : confirmé.** Chaque orientation est un sprite à part. Quatre d'entre elles réutilisent un gabarit du lot 1 ; les autres n'ont pas de gabarit et sont à vérifier à la première planche.
4. **Poids : PNG en palette 256 couleurs** (`png_couleurs` dans `config.json`), sprites et ombres. `batch.py` signale tout fichier de plus de 150 Ko et vérifie que l'ombre a la taille du sprite.

## Retours de l'intégrateur n° 2 (15 nov.)

Vérification de `ORIENTATIONS.md` contre le code du jeu (`game.template.html`, vue Dessus). Aucun sprite HD n'existe : tout vient de la lecture du code, pas de rendus.

1. **Camions : le tableau est cohérent, mais les gabarits du lot 1 sont à l'envers pour les quais.** Les quais de vente sont sur le mur x = 27, camion couché selon x au-delà du mur ; les quais d'achat sont sur le mur y = 21, camion couché selon y. Un camion doit présenter son **arrière au quai**. Les gabarits du lot 1 (`camion_*`, cabine côté x = min) mettent la cabine côté quai : c'est le défaut « camion posé nez au quai » vu dans le jeu. Le jeu utilise donc maintenant `camion_<couleur>_face` (arrière côté x = min, cabine côté x = max) : tel quel pour les quais de vente, **en miroir horizontal** pour les quais d'achat (le miroir d'un sprite couché selon x donne un sprite couché selon y, cabine côté y = max). Tant que `camion_*_face` n'existe pas, le jeu retombe sur son camion vectoriel, bien orienté. **À produire en priorité : `camion_blanc_face`, `camion_rouge_face`, `camion_bleu_face`.** Ancre : centre du camion, au sol, même repère que `camion_*` du lot 1.
2. **Le miroir existe bien côté jeu, pour une seule raison** : les quais d'achat (axe y) réutilisent le sprite de l'axe x, retourné. Cela ne contredit pas « pas de miroir pour la génération » ; cela veut dire que `camion_*_dos` ne sert à rien tant qu'on n'affiche pas de camion qui repart ou qui arrive à reculons. Inutile de le produire avant le reste.
3. **Pas de variante « ouvert » pour `_face`.** Avec l'arrière contre le quai, les portes ouvertes sont cachées derrière la caisse ; le jeu affiche le niveau de chargement par une jauge au-dessus du camion. `camion_*_ouvert` du lot 1 n'est plus utilisé.
4. **Convoyeurs :** `convoyeur_droit_nord_est` (axe y) est exactement le miroir de `convoyeur_droit` du lot 1 que le jeu applique aujourd'hui. Le jeu utilisera le sprite du lot 2 s'il existe, sinon le miroir : aucun écart.
5. **Murs :** le jeu dessine ses murs en vectoriel ; rien ne contredit le tableau, mais je ne peux rien vérifier avant un premier PNG.
6. **PNG palette 256 couleurs (mode P, transparence tRNS) :** testés dans `t15_sprites_hd.js` (build, chargeur, transparence du fond et couleur conservées). Aucun changement nécessaire.
7. **À vérifier sur les vrais fichiers, à la première planche :** ancre et échelle des trois `camion_*_face` (ils doivent s'asseoir contre le mur du quai sans le traverser), taille de chaque `ombres/<nom>.png` égale à celle du sprite.

## Retours de l'intégrateur n° 3 (15 nov.) : phase 1, assemblage

1. **Échelle : « 64 px par mètre » ne correspond pas au dessin du jeu.** Dans le jeu, une case mesure environ 2 m et son losange 128 px de large à l'échelle 1 ; un camion vectoriel fait 5,6 cases et 496 px de large, pas 1024. Un camion de 1024 px à 64 px/m serait dessiné deux fois trop grand. **La référence d'échelle est donc le gabarit exporté** (`gabarits/gab_*.png`, `ancres.json`) : `batch.py` garde la taille et l'ancre du gabarit. Les entrées de camions `largeur=1024` ne servent plus (camions de face = gabarit ; dos et remorques = lot `optionnel`).
2. **Gabarits vectoriels** : machines (`gab_four`, `gab_reacteur`, `gab_presse`, `gab_assemblage`), marchandises (`gab_mat_*`, 9 formes), camion de face, convoyeurs (2 axes, 4 coudes), murs et coins. Ancre = centre de l'emprise au sol. Le dessin du jeu n'a que 4 formes de machine : scie, four à ciment, malaxeur, bobineuse et conditionnement empruntent la forme voisine ; leur sujet les distingue.
3. **Convoyeurs** : le jeu pose les pièces vides et anime les cartons lui-même ; seules les pièces `convoyeur_vide_*` sont nécessaires (4 coudes + 2 droits). Une pièce droite fait 2,6 cases, un coude 2,6 x 2,6 cases centré sur l'angle du tracé : **les bords de pièce doivent être sur les bords du losange, sans débord**, sinon la boucle ne se ferme pas.
4. **Marchandises** : un sprite par bien (27 entrées, palette de 2,2 x 2,2 cases). La couleur doit être celle du bien : fer rouille, charbon noir, sable jaune, calcaire clair, gravier gris, tissu multicolore, caoutchouc noir.
5. **Ouvriers du lot 2** : leurs gabarits sont désormais les poses du lot 1 (même silhouette, mêmes ancres) ; seuls la peau, le genre, le gilet et le casque changent dans le sujet.
6. **Ce qui n'est pas encore branché dans le jeu** : murs et coins de mur, ouvriers HD du lot 2, bras de robot, employés de bureau, accessoires. Ils le seront après la première planche validée. Ne pas les produire en premier.
7. **Ordre de production conseillé** : `test` (3 sprites) → validation du style → machines (7) → marchandises (27) → convoyeurs vides (6) → camions de face (3) → reste du `lot1` → murs/coins → personnages → accessoires.

## Demande urgente de l'intégrateur au producteur (15 nov.)

**Les sprites déjà générés ne sont pas dans le dépôt.** J'ai parcouru toutes les branches distantes : aucun PNG dans `assets/factory_hd/` (0 fichier), et le dernier commit de `assets/factory-sprites` ne contient que le kit (BiRefNet, worker, style Manufacturing Unit). Le jeu ne peut donc charger aucun sprite HD.

À faire sur le Mac, dans cet ordre, sans rien décider :
1. `git pull` puis vérifier ce que contient `assets/factory_hd/` (PNG, `ombres/`, `ancres.json`).
2. **Pousser immédiatement tout ce qui existe** : `git add assets/factory_hd tools/factory_ai/etat.json tools/factory_ai/JOURNAL.md && git commit -m "Sprites HD usine : lots produits" && git push origin assets/factory-sprites`. Si des fichiers sont ailleurs (dossier Cowork, `travail/brut/`), les copier dans `assets/factory_hd/<nom>.png` avec leur ombre et ancre avant de pousser. Pousser à chaque planche de 20, pas seulement à la fin.
3. Priorité de production si le lot n'est pas fini : `machine_assemblage`, machines par filière (`four_industriel`, `reacteur_chimique`, `presse`, `scie_industrielle`, `malaxeur_industriel`, `four_rotatif_ciment`, `bobineuse_filature`, `ligne_conditionnement`), convoyeurs vides (`convoyeur_vide_droit_sud_est`, `..._nord_est`, 4 coudes `convoyeur_vide_coin_*`), `camion_blanc_face`, `camion_rouge_face`, `camion_bleu_face`, marchandises, puis `rack_stockage`, `rack_vide`, `palette_cartons`, `chariot_elevateur`, ouvriers.
4. Écrire dans `JOURNAL.md` la liste des noms produits et des rebuts.

Dès que les PNG sont poussés, je les intègre (chargement HD > gabarit > vectoriel déjà en place) et je consigne ici les écarts d'ancre, d'échelle et d'ombre. Aucun agent ne génère ni ne recrée d'image côté cloud.

## Producteur (Mac) — 15 nov., 19 h : sprites poussés

Poussé sur `assets/factory-sprites` (commit 89f2108) : tout `assets/factory_hd/` tel qu'il existe à cet instant (sprites, `ombres/`, `poses/`, `ancres.json`, planches `_apercus/`, `etat.json`). Le lot phase1 continue de tourner : d'autres fichiers suivront à chaque pousse. Le style de référence est `tools/factory_ai/style/manufacturing_unit.png` ; `machine_assemblage` est la machine type. Comptage exact : voir `etat.json` (statut `ok` par sprite). Les sprites sortent de BiRefNet (fond transparent), PNG palette 256 couleurs. Vérifier ancres et ombres à la première planche, comme demandé.

## Retour du producteur (Mac) — 17 nov. 2026
Poussé sur `assets/factory-sprites` : tout est dans **`assets/factory_hd/`** (il n'y a pas de `city_hd/`) avec ombres et `ancres.json` à jour.
- **Ville** : maisons, immeubles, 14 bâtiments de service (pictogramme dessiné sur le toit), 6 gros immeubles (6, 12, 25 étages), stations essence et recharge électrique, raffinerie (4), textile (12), usine (machines revues ; `manufacturing_unit` enregistré comme asset standard).
- **Commerces** : `drugstore`, `supermarche` (bleu, texte SUPERMARKET), `hypermarche` (parking très grand, texte HYPERMARKET), un seul de chaque, toits plats avec motif posé par `pose_toit.py`. L'ancienne `pharmacie` est supprimée.
- **Hôpital** : toit rouge, croix + texte HOSPITAL dessinés.
- **Phase 2** : `batch_phase2.py` + commande `{"type":"phase2","lot":"lot0"}` (sortie `assets/phase2_hd/`). Les photos du Guide passent par `batch_photos.py` (commande `photos`) comme tu l'as prévu.
- Les tailles de parcelle (384 / 448 / 576 px de large pour drugstore / supermarché / hypermarché) sont des estimations à valider avec la grille.
- Un bâtiment = une parcelle carrée complète avec bordure : rien ne doit dépasser ; un contrôle automatique des débordements reste à faire côté producteur.

## Producteur (Mac) — 17 nov. 2026, phase 2 livrée en partie
`assets/phase2_hd/` : 133 assets (lot 0, sols/eau/routes, port, extraction, commerces et habitat, décor, services, champs, gisements : affleurements, mines, tas). Trois sortes : scènes en JPEG 1920x1080 ; objets PNG détourés à la taille demandée par `prompts_assets.json` ; tuiles de sol PNG en losange 2:1 (texture vue de dessus, mise en perspective par programme). Les noms `supermarche` et `hypermarche` de la phase 2 ont été retirés : utiliser ceux de `assets/factory_hd/` (plus aboutis). Restent à venir : vignettes cinéma (13) puis photos du Guide (163).

## Producteur (Mac) — 17 nov. 2026, tours et Guide livrés
- Gratte-ciel 40 et 60 étages (a/b) : `assets/factory_hd/gratte_ciel_{40,60}_etages_{a,b}.png`, 384 px de large, 1400 px (40) et 2000 px (60) de haut, ancres dans `ancres.json`. Fût allongé par programme (bande répétée), des raccords peuvent se voir de près.
- Vignettes cinéma (13) dans `assets/phase2_hd/`, photos du Guide (163 JPEG 512x512) dans `assets/guide_hd/<clé>.jpg` (copie dans `assets/phase2_hd/guide/`).

## Producteur (Mac) — 17 nov. 2026, soir : commerces recalés sur la grille 2:1
Problème constaté en jeu : le losange au sol de `supermarche` et `hypermarche` penchait à environ 0,78 (au lieu de 0,5) et ne suivait pas les routes. Corrigé : le bâtiment est généré seul (`bat_*.png`), puis posé par `parcelle.py` sur une parcelle dessinée par programme, **exactement 2:1** (parking, places, voitures, arbres, trottoir).
- `drugstore` : parcelle de **2x2 cases**, losange 512 x 256 px, image 512 x ~480.
- `supermarche` : **2x2 cases**, losange 512 x 256 px.
- `hypermarche` : **3x3 cases**, losange 768 x 384 px.
- `ancres.json` : `ancre_x/ancre_y` = centre du losange au sol ; nouveaux champs `emprise_px` (largeur du losange) et `emprise_cases`. Pour poser : échelle = (cases x largeur d'une case en jeu) / `emprise_px`.
- Hypothèse : une case = 256 px de large en HD (comme la ville). À confirmer ; si la case HD est 396 px, c'est le facteur d'échelle qui change, pas les images.
- Mesure sur les autres sprites de la ville : la pente du losange au sol est de 0,6 à 0,8 (cible 0,5) pour la plupart des maisons et immeubles (angle de caméra d'environ 35 degrés au lieu de 30). Les dalles vertes des maisons masquent l'écart, mais dis-moi si tu vois des décalages : je peux les redresser en lot.

## Producteur (Mac) — 17 nov. 2026, soir : refonte graphique (réponse aux demandes n° 6 et 7)
Tout est poussé sur `assets/factory-sprites`.
- **Routes (16)** dessinées par programme : bords exacts, raccord sans couture vérifié sur un petit réseau. `assets/phase2_hd/` : `route_droite_ne` (axe NE-SW), `route_droite_nw` (axe NW-SE), `route_croix`, `route_t_{ne,se,sw,nw}` (le suffixe = côté sans branche), `route_coude_ne_se`, `route_coude_se_sw`, `route_coude_sw_nw`, `route_coude_ne_nw`, `route_bout_{ne,se,sw,nw}` (le suffixe = côté où la route arrive), `route_isolee`. Les anciens `route_t`, `route_coude`, `route_bout` sont supprimés (ils étaient incohérents entre eux). Losange 396x198, trottoir sur les bords. Script : `routes.py`.
- **Sols** : `herbe_a`, `herbe_b`, `herbe_c` (3 variantes de pelouse).
- **Végétation** : `foret_dense_a/b/c`, `foret_sapins_a/b` (groupes d'arbres sur dalle), `arbre_isole_a/b/c/d`, `buisson_a/b`, `rochers_a/b`.
- **Gisements** : `gisement_or` (nouveau, doré saturé), `gisement_fer` (rouge vif, arêtes métalliques), `gisement_petrole` (flaque noire avec geyser).
- **Scierie** : `assets/factory_hd/scierie_exterieure.png` (parcelle 1x1 : 256x128 de losange).
- **Caméra / losange 2:1** : `mega_centre_commercial` (`phase2_hd`, 3x3 cases) refait avec la parcelle dessinée en 2:1 exact comme `supermarche`, `hypermarche`, `drugstore`. Contrôles `usine_*`, `centre_rd`, `data_center`, `terminal_portuaire`, `centrales` : non refaits, à signaler si un décalage se voit en jeu.
- **Fermes et élevages (3x3 cases, 768x384 de losange, parcelle 2:1 exacte)** dans `assets/factory_hd/` : `fwheat`, `fsugar`, `fcotton`, `frubber`, `fvine`, `fcattle`, `fchicken`, `fpig`, `fsheep`. Rappel : 3x3 pour une emprise 3x4 (règle de ton calage).
- **Ancres** : `assets/phase2_hd/ancres.json` (158 entrées, ancre et emprise déduites de la boîte englobante, comme ta règle). Les sprites générés par `parcelle.py` ont `emprise_px` et `emprise_cases` dans `assets/factory_hd/ancres.json`.
- **Guide léger** : `assets/guide_hd_256/<clé>.jpg` (256 px, 1,3 Mo pour les 163).
- Pas encore fait : niveaux 2 et 3 (usine, supermarché, hypermarché), câble enterré, pipeline, concasseur (`crush`). Je continue dans cet ordre.

## Niveaux 2 et 3 des commerces (Mac → intégrateur)
- Ajoutés : `supermarche_n2`, `supermarche_n3` (512×~342, 2×2), `hypermarche_n2`, `hypermarche_n3` (768×~496, 3×3), dans assets/factory_hd, même losange 2:1 exact et mêmes ancres que le niveau 1 (ancre = centre du losange, voir ancres.json). Bâtiments seuls : `bat_*_n2/n3`.
- Non vérifié en jeu.

## Refonte réaliste (référence : Age of Empires Mobile)
- Blé (`fwheat`) : champ dense d'épis dorés avec vagues de vent et sentier. `fsugar`, `fcotton` : plants individuels sur sillons, avec ombres. `fvine` : chai en pierre (cuves inox, tonneaux), ceps avec grappes, vendangeurs.
- Élevages refaits selon le métier : `fcattle` (salle de traite, foin, meules, sans silo), `fsheep` (bergerie avec tonte et traite), `fpig` (long hangar à auges), `fchicken` (long poulailler, caisses d'œufs). Même losange 2:1 (3×3, 768 px), mêmes ancres.
- Animaux phase 2 régénérés en 240×195 (réalistes, en chair) : animal_vache/cochon/mouton/poule. Nouveaux objets : meule_foin, balles_foin, auge_foin, vendangeur, vigneron_hotte, fermier_seau.
- Nature régénérée : herbe_a/b/c, arbre_isole_a–d, buisson_a/b, foret_dense_a–c, foret_sapins_a/b. Véhicules `veh_*` (10) générés, pas encore posés dans les parkings.
- Non vérifié en jeu. `frubber` (caoutchouc) pas encore refait.

## Élevages recadrés (corrige la version précédente)
- `fcattle`, `fsheep`, `fpig`, `fchicken` : les longs bâtiments sont maintenant posés le long du bord nord→est (pointe haute → pointe est), deux bâtiments bout à bout, chacun par son coin avant sur l'arête du losange. Pente du sol ramenée à 2:1 par affine (verticales conservées). Dépassement hors bande mesuré ≈ 3 % (bouts de toit seulement).
- Cheptels visibles : 55 vaches, 220 moutons, 170 cochons, 260 poules ; meules, auges, soigneurs.
- Outils : `parcelle.py` (variables BAT_FLIP, BAT_COIN, BAT_AUTOV, BAT_N), `ferme_cadre.py`, `emprise_check.py`. Même emprise 3×3 (768 px), mêmes ancres.
- Pas vérifié en jeu. Cultures (blé, sucre, coton, vigne) gardent leur hangar : non recadrées avec cette méthode.

## Fermes recadrées (4 cases, un seul bâtiment)
- Poulets, porcs (mare), moutons : une ferme de 4 cases, un seul bâtiment le long du bord nord→est, cheptels aérés dont l'effectif suit la surface (agrandissements). Consignes dans `CONSIGNES_FERMES.md`.
- Nouveaux sprites : stabulation ronde, étable traversante, carrousel de traite, poulailler/porcherie longs (vaches pas encore recomposées).
- Dépassement résiduel : poulets ≈4,6 % (silo en bout), porcs ≈1,6 %, moutons ≈0,2 %.
