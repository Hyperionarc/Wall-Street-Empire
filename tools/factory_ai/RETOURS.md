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

## Intégrateur n° 4 (17 nov.) : ville HD branchée
- Les 18 sprites de ville (maisons, immeubles, tours, banque, hôtel, gratte-ciel) sont lus dans `assets/factory_hd` (liste `CITY_NAMES` de `build.py`), dessinés à l'échelle d'une parcelle de 256 px = 1 case, choisis par étages et graine (`CITY_MAP`). Hors plage d'étages : atlas Kenney.
- Pas encore branchés : bâtiments de service (boulangerie, café, restaurant, école, mairie, hôpital…), commerces (drugstore, supermarché, hypermarché), stations, raffinerie, textile. Ils seront liés à leurs types de bâtiment ensuite.

## Demande de l'intégrateur au producteur (17 nov.) : gratte-ciel plus hauts
Le centre-ville du jeu compte des immeubles de 20 à 64 étages ; les sprites `gratte_ciel_25_etages_a/b` (900 px) sont plus bas que ce qu'il remplace. À produire, **même parcelle carrée de 256 px de losange, même style, même ancre au centre de la base** :
- `gratte_ciel_40_etages_a`, `gratte_ciel_40_etages_b` : environ 1 400 px de haut ;
- `gratte_ciel_60_etages_a`, `gratte_ciel_60_etages_b` : environ 2 000 px de haut, silhouette de tour très fine avec antenne.
Bordure de parcelle identique aux autres bâtiments, rien ne dépasse du losange. Pousser dans `assets/factory_hd/` avec `ancres.json` ; je les branche (plages 26-45 et 46+ étages) dès qu'ils arrivent.
## Producteur (Mac) — 17 nov. 2026, phase 2 livrée en partie
`assets/phase2_hd/` : 133 assets (lot 0, sols/eau/routes, port, extraction, commerces et habitat, décor, services, champs, gisements : affleurements, mines, tas). Trois sortes : scènes en JPEG 1920x1080 ; objets PNG détourés à la taille demandée par `prompts_assets.json` ; tuiles de sol PNG en losange 2:1 (texture vue de dessus, mise en perspective par programme). Les noms `supermarche` et `hypermarche` de la phase 2 ont été retirés : utiliser ceux de `assets/factory_hd/` (plus aboutis). Restent à venir : vignettes cinéma (13) puis photos du Guide (163).

## Producteur (Mac) — 17 nov. 2026, tours et Guide livrés
- Gratte-ciel 40 et 60 étages (a/b) : `assets/factory_hd/gratte_ciel_{40,60}_etages_{a,b}.png`, 384 px de large, 1400 px (40) et 2000 px (60) de haut, ancres dans `ancres.json`. Fût allongé par programme (bande répétée), des raccords peuvent se voir de près.
- Vignettes cinéma (13) dans `assets/phase2_hd/`, photos du Guide (163 JPEG 512x512) dans `assets/guide_hd/<clé>.jpg` (copie dans `assets/phase2_hd/guide/`).

## Intégrateur n° 5 (17 nov.) : état et ce qui manque
**Branché dans le jeu et poussé** : 83 sprites d'usine (+ lot ville), 22 bâtiments de ville (maisons, immeubles, tours, banque, hôtel, gratte-ciel 25/40/60 étages choisis par nombre d'étages), 163 photos du Guide (`assets/guide_hd/`, affichées dans le Guide et sur toutes les vignettes de produits). `city.html` pèse maintenant 13 Mo.

**Reçu mais pas encore branché** (`assets/phase2_hd/`, 133 assets) : sols/eau/routes, port (grue, navire, conteneurs, terminal), extraction (mines, gisements, bacs), centrales, commerces et habitat (`maison_n*`, `immeuble_n*`, `petit_marche_n*`), sièges `siege_hq_n1-3`, services, champs, vignettes cinéma (13), scènes JPEG 1920x1080. Je les branche dans cet ordre : sièges HQ, extraction et gisements, port, commerces, routes et sols.
Aussi à brancher : les 14 bâtiments de service, drugstore, supermarché, hypermarché, stations, raffinerie, textile (`assets/factory_hd/`).

**Ce qui me manque côté Mac**
1. Rien de bloquant : je peux avancer seul avec ce qui est livré.
2. Utile : un `ancres.json` pour `assets/phase2_hd/` (largeur, hauteur, ancre_x, ancre_y, nombre de cases occupées) ; sans lui je déduis l'ancre au centre bas, ce qui peut décaler un bâtiment.
3. Utile : une version allégée (JPEG 256 px) des 163 photos du Guide ; elles pèsent 6 Mo dans le jeu.
4. Contrôle : les parcelles de drugstore (384), supermarché (448) et hypermarché (576) restent à valider avec la grille du jeu quand je les brancherai.

## Intégrateur n° 6 (17 nov.) : refonte graphique du jeu entier, état et demandes
**Branché et visible dans le jeu** (poussé) : 22 bâtiments de ville (parcelle calée sur le losange de la case : plus aucun bâtiment sur les routes), 15 gisements, 13 mines, puits pétrole/gaz, carrières, camp de bûcherons, et en phase 2 : entrepôt, centrales (solaire, charbon, nucléaire), éolienne, pylône, centre R&D, data center, agence immobilière, chantier, fonderie, usines (4 tailles), petit marché, supermarché, hypermarché, méga-centre, terminal portuaire, station média, stade. Les sprites de la phase 2 sont réduits de moitié et passés en 256 couleurs à la construction (1,1 Mo en tout).

**Règle de calage utilisée** : l'emprise opaque du PNG (boîte englobante des pixels non transparents) est mise à la largeur du losange de l'emprise de la case ((largeur + hauteur) / 2 cases de 132 px) ; le bas de la boîte tombe sur le sommet bas du losange. Tout sprite qui ne respecte pas « parcelle = losange complet, rien ne dépasse » apparaîtra décalé.

**Encore en vectoriel ou en atlas (à produire ou à fournir)**
1. **Routes et sols** : `route_*`, `sol_*`, `herbe_a`, `eau_*`, `rivage_sable` sont dans `phase2_hd/` mais pas encore branchés : je les branche ensuite. Besoin : confirmer qu'ils sont des losanges 396x198 qui se raccordent sans couture (4 orientations de route, carrefour, T, bout, coude).
2. **Fermes et élevages** (`fwheat`, `fsugar`, `fcotton`, `frubber`, `fvine`, `fcattle`, `fchicken`, `fpig`, `fsheep`) : seuls `champ_ble_vert/mur`, `hangar_ferme` et `tracteur` existent. Il manque une parcelle HD par type de ferme et par élevage (3x4 cases), et le vignoble.
3. **Centre de concassage** (`crush`), **câble enterré**, **pipeline** : pas de sprite.
4. **Sièges HQ** : `siege_hq_n1-3` sont reçus ; l'ancien rendu du siège reste actif, je compare puis je bascule.
5. **Bâtiments de service** (14 pictogrammes de toit) : produits, pas encore reliés à leurs types.
6. **Variantes de niveau** : la plupart des bâtiments du joueur montent de niveau (mêmes sprites aujourd'hui). Une 2e et une 3e version (plus grande, plus riche) de l'usine, du supermarché et de l'hypermarché donneraient une vraie progression visuelle.
7. **Ancres** : fournir un `ancres.json` pour `phase2_hd/` (emprise en cases, largeur/hauteur) éviterait mes déductions par boîte englobante.

## Demande de l'intégrateur au producteur (17 nov.) : gisements qui se voient de loin
Le joueur veut des gisements **lisibles à distance, façon Age of Empires**. J'ai ajouté des effets animés par programme (halo, étoiles qui scintillent, reflet qui balaie pour l'or ; lueur rouge et éclats pour le fer ; geysers de pétrole), mais le sprite doit porter l'essentiel :
- **`gisement_or` (manquant)** : filon d'or éclatant, pépites jaune vif et gros cristaux d'or, saturation forte, reflets blancs ; même parcelle losange 396x300 que les autres gisements.
- **`gisement_fer`** : rouge-rouille plus vif avec arêtes métalliques claires brillantes (le rendu actuel est mat).
- **`gisement_petrole`** : une vraie flaque noire luisante avec un **geyser** (jet de pétrole qui jaillit, éclaboussures) dessiné dans le sprite ; le jeu ajoute des gouttes animées par-dessus.
- Pour les trois : contraste fort avec l'herbe vert clair du jeu, pas de fond sableux terne autour de la parcelle.
- Ne rien changer à la règle de calage (parcelle = losange complet, dalle centrée) : le jeu centre maintenant la dalle sur le centre de la case (rangée la plus large du PNG), et réduit les sprites carrés à `min(largeur, hauteur)` cases pour les emprises rectangulaires, pour qu'aucun bâtiment ne mord sur la route.

## Demande de l'intégrateur au producteur (17 nov.) : un seul angle de caméra pour tous les sprites
Le joueur constate que **le supermarché et l'hypermarché sont vus de plus haut (losange très à plat, toit et parking dominants)** alors que les autres bâtiments (maisons, immeubles, boulangerie, gisements, mines) sont vus sous l'angle isométrique standard du jeu. Mesure sur les PNG (rapport demi-hauteur / demi-largeur de la dalle, épaisseur comprise) : maisons et immeubles 0,63 à 0,69 ; gisements et mines 0,61 à 0,62 ; drugstore 0,66 ; **supermarché 0,73 ; hypermarché 0,72**.
À refaire, **avec exactement la même caméra que `maison_moderne_cubique` (référence)** : projection 2:1 (le dessus de la parcelle est un losange deux fois plus large que haut), élévation d'environ 30 degrés, même éclairage venant de la gauche. À régénérer : `supermarche`, `hypermarche`, `mega_centre_commercial`, et à contrôler : `usine_*`, `centre_rd`, `data_center`, `terminal_portuaire`, `centrale_*`. Une règle simple de contrôle automatique côté producteur : le rapport (hauteur du losange du dessus) / (largeur) doit valoir 0,50 à 0,54 ; sinon rebut.

## Demande de l'intégrateur au producteur (17 nov.) : routes et sols complets
Les tuiles `route_*` de la phase 2 sont très belles mais incomplètes pour poser un réseau : le jeu a besoin de **toutes les orientations** (un seul sprite par orientation, pas de miroir). À fournir en losange 396x198, bords exactement sur les bords du losange, raccord sans couture entre voisins :
- droites : `route_droite_ne`, `route_droite_nw` (reçues) ;
- carrefour en croix : `route_croix` (reçu) ;
- **T : 4 orientations** (branche manquante au nord-est, nord-ouest, sud-est, sud-ouest) : `route_t_ne`, `route_t_nw`, `route_t_se`, `route_t_sw` (un seul `route_t` reçu) ;
- **coudes : 4 orientations** (virage nord-est/nord-ouest, nord-est/sud-est, sud-est/sud-ouest, sud-ouest/nord-ouest) ;
- **bouts : 4 orientations** ;
- **sols** : `herbe_a` en 3 variantes (`herbe_a`, `herbe_b`, `herbe_c`) pour casser la répétition, plus `herbe_bord_*` si une transition herbe/route existe.
Le jeu bascule dès que l'ensemble est là (il choisit le sprite d'après les voisins) ; d'ici là les routes restent vectorielles pour ne pas mélanger deux styles dans un même carrefour.

## Inspection de l'intégrateur n° 7 (17 nov.) : ce qui est encore à l'ancien style
Constaté à l'écran, du zoom le plus large au plus serré :
1. **Forêts** : amas de cubes verts (voxels) et arbres isolés en cubes sur pied : style Kenney, sans rapport avec le rendu HD. À produire : `foret_dense_a/b/c` (tuile losange 396x198 avec un groupe d'arbres feuillus détourés, 3 variantes), `foret_sapins_a/b` (conifères), `arbre_isole_a/b/c/d` (arbre seul, ombre portée), `buisson_a/b`, `rochers_a/b`.
2. **Sol** : prairie plate de couleur unie, sans texture (voir la demande `herbe_a/b/c` plus haut) ; **routes** vectorielles grises (voir la demande des orientations).
3. **Scierie** : n'existe que comme machine à l'intérieur d'une usine (`saw`) ; à l'extérieur c'est une petite usine générique. À produire : `scierie_exterieure` (hangar, scie à ruban, piles de planches et de grumes, parcelle 1x1).
4. **Camp de bûcherons** : sprite HD branché, mais trop petit sous les arbres voxels ; il retrouvera sa place avec la nouvelle forêt.
5. **Objets divers vectoriels** : tour de télécommunication, parcs, monuments, stades, voitures et bateaux : à lister avec le producteur ; `voiture_ville_a/b`, `navire_cargo`, `parc_urbain`, `stade_sport` existent en phase 2 mais ne sont pas encore branchés.
6. **Niveau de détail au zoom maximal** : les bâtiments HD sont nets ; les sprites de la phase 2 sont embarqués à demi-résolution (198 px par case) et restent corrects au zoom maximal sauf le camp de bûcherons et les mines vus de très près (légèrement flous). Si le producteur préfère, je peux repasser en pleine résolution pour une liste ciblée (+3 Mo).
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

## Fermes v14 (cohérence)
- 4 cases, bâtiment unique (long ou rond), chemin d'accès (CHEMIN dans parcelle.py), tracteur, ouvriers/fermier, cheptels étalés sur tout le terrain. Bovins : stabulation ronde. Poulets : dépassement résiduel ≈5 % (silo) ; le contrôle EMPRISE n'est pas valable pour un bâtiment rond.

## Contrôle qualité complet des sprites par l'intégrateur (18 nov.) : angle, débordement, coupes
Outil : `python3 tools/factory_ai/asset_qa.py` (370 sprites de `factory_hd` et `phase2_hd`). Il mesure la **pente des arêtes basses de la dalle** (le jeu est en projection 2:1 : pente 0,50, caméra à 30°), le débordement hors de la parcelle, les images coupées et les dalles décentrées. À lancer côté producteur avant chaque push ; un sprite hors tolérance est un rebut.
**1. Angle de caméra incohérent (le défaut principal).**
- Tuiles de sol et de route (`route_*`, `sol_*`, `herbe_*`, `eau_*`, 26 images) : pente 0,50 exacte, correct.
- `supermarche`, `hypermarche`, `drugstore` : 0,50 (dalle correcte) ; mais les variantes `bat_supermarche(_n2,_n3)`, `bat_hypermarche(_n2,_n3)`, `bat_mega_centre_commercial`, `bat_scierie` : 0,66 à 0,73.
- **Tous les bâtiments de ville** (maisons, immeubles, boulangerie, café, école, église, gare, hôpital, mairie, hôtel, banque, tours et gratte-ciel) : pente 0,60 à 0,76, soit une caméra de 40 à 48 degrés. La mairie (0,76), les gratte-ciel 40 étages (0,89), l'école, l'hôpital, la gare, l'hôtel et la banque (0,73 à 0,76) sont les plus relevés.
- Mines et carrières : 0,54 à 0,71 ; gisements : 0,43 à 0,71 (`gisement_cuivre`, `_graphite`, `_zinc` sont trop bas : 0,43 à 0,46).
- Conséquence : à 0,70 la parcelle est 40 % plus haute que le losange de la case (91 px au lieu de 66) et déborde sur la route et la parcelle voisine. En attendant les images corrigées, le jeu **écrase verticalement** chaque sprite (coefficient mesuré, 0,56 à 0,95) pour le ramener sur la grille ; c'est un pis-aller qui aplatit un peu les façades.
- À produire : refaire en **pente 0,50 ± 0,03** les familles ci-dessus, avec la caméra de `drugstore.png`/`supermarche.png` (dalle) mais en gardant leur volume de bâtiment.
**2. Sprites coupés au bord du canevas** (pixels opaques sur la première ou la dernière ligne ou colonne) : 112 images, dont les gratte-ciel 25 étages, tours de bureaux 12 étages, raffinerie, citerne, torchère, murs bas, éolienne, centrale nucléaire, entrepôt, chantiers, bacs de matières, forêts et arbres. Marge transparente d'au moins 4 px sur les quatre côtés.
**3. Dalles décentrées** (le milieu de la dalle n'est pas au milieu de l'image, écart > 6 % de la largeur) : 26 images, dont `arbre`, `camion_*`, `chariot_elevateur`, `convoyeur_coin`, `rack_stockage`, `rack_vide`, `mur_bas_*` (0,23), `presse`, `machine_assemblage`, `manufacturing_unit`, `quai_chargement`, `eolienne`. Le jeu ancre ces objets sur le centre de la dalle ; un décalage les pose à côté de leur case.
**4. Doublons de noms** : `bat_ferme_porcherie_long` et `bat_ferme_porcherie_longue` ; `bat_ferme_poulailler` et `_long` ; plusieurs séries `bat_*` (bat_chai_vigne, bat_chai_vigneron, bat_drugstore) en plus des noms sans préfixe : dire lesquels sont les versions finales pour que je branche les bonnes.
**5. Personnages et accessoires** (`ouvrier_*`, `chariot_elevateur*`) : pente 0,14 à 0,37, normal pour des objets sans dalle, mais préciser leur ancre (pieds) dans `ancres.json`.
**6. Nouveaux assets bien reçus** : forêts (`foret_dense_a/b/c`, `foret_sapins_a/b`), arbres isolés, buissons, animaux, fermes 4 cases v14 : je les branche ensuite ; mêmes contrôles à appliquer avant push.
## Cultures et chai (4 cases)
- Bug corrigé dans parcelle.py : les boucles des cultures écrasaient `k` (échelle du bâtiment) → hangar géant / bâtiment absent (sucre). Blé, sucre, coton : hangar+silo réduit, chemin, tracteur, ouvriers. Chai : recadré. Reste : caoutchouc, remplissage complet du terrain par la culture.

## Maïs et colza
- Nouvelles cultures `fcorn` (maïs → huile) et `frapeseed` (colza → carburant), mêmes règles que les autres fermes (4 cases, hangar+silo, chemin, tracteur, ouvriers). Mode `ferme:mais` / `ferme:colza` dans parcelle.py.

## Producteur (Mac) — 18 nov. 2026 : réponse au contrôle qualité n° 1 de l'intégrateur
- **Fermes : 4 cases (2×2), losange 512×256, plus 3×3.** Décision de Rémy. `ancres.json` : `emprise_px` 512, `emprise_cases` 2 pour fwheat, fsugar, fcotton, fvine, fcorn (maïs), frapeseed (colza), fcattle, fchicken, fpig, fsheep. Nouveaux : `fcorn`, `frapeseed`. `frubber` est encore l'ancienne version 3×3 (à refaire).
- **2. Coupés** : corrigé (`tools/factory_ai/marges.py`) : marge transparente de 6 px sur 115 sprites (gratte-ciel, tours, raffinerie, citerne, torchère, murs bas, scierie, forêts, arbres, mines, gisements, maisons, bacs, animaux…), ancres et ombres décalées (`ancre_x/y` + 6, `largeur/hauteur`, `bbox`). **Volontairement exclus** : tuiles et parcelles dont les sommets du losange touchent le bord (route_*, sol_*, herbe_*, eau_*, rivage_*, fermes, drugstore, supermarché, hypermarché, mega_centre_commercial) : y ajouter une marge casserait le raccord et l'emprise. Reste 0 sprite « coupé » hors de cette liste.
- **3. Dalles décentrées** : pas modifié. Pour les objets à silhouette haute (silo, bras, camions, murs bas, éolienne) la mesure prend la rangée la plus large, qui n'est pas la dalle : l'ancre de `ancres.json` fait foi. Si un objet précis est posé à côté de sa case en jeu, donne-moi son nom et je recale son ancre.
- **4. Versions finales (à brancher)** : fermes = `fwheat fsugar fcotton fvine fcorn frapeseed fcattle fchicken fpig fsheep`. Sources `bat_` utilisées : `bat_ferme_hangar` (cultures), `bat_chai_vigneron` (vigne), `bat_ferme_stabulation_ronde` (bovins), `bat_ferme_poulailler_long` (poules), `bat_ferme_porcherie_longue` (porcs), `bat_ferme_bergerie` (moutons). **Obsolètes (ne pas brancher)** : `bat_chai_vigne`, `bat_ferme_porcherie`, `bat_ferme_porcherie_long`, `bat_ferme_poulailler`, `bat_ferme_porcs`, `bat_ferme_poulets`, `bat_ferme_moutons`, `bat_ferme_bovins`, `bat_ferme_traite` ; `bat_ferme_etable_traversante` et `bat_ferme_carrousel` sont des variantes non utilisées. `bat_drugstore`, `bat_supermarche*`, `bat_hypermarche*` sont des sources : les finals sont les noms sans préfixe.
- **5. Personnages** : `ancres.json` contient déjà `ancre_x/ancre_y` (pieds) pour `ouvrier_*`, `poses/ouvrier_*` et `chariot_elevateur*`.
- **1. Angle de caméra (le gros chantier)** : non traité en lot. Ce n'est pas corrigeable par un simple redimensionnement (c'est ton écrasement vertical actuel) : je recompose les bâtiments à partir de leur source `bat_*` sur une parcelle dessinée en 2:1 exact avec un redressement affine qui garde les verticales (méthode des fermes et des commerces). Ordre prévu : (a) familles qui ont déjà une source `bat_` (scierie, mega_centre_commercial) ; (b) bâtiments de ville les plus relevés (mairie 0,76, gratte-ciel, école, hôpital, gare, hôtel, banque) ; (c) mines et gisements (0,43 à 0,71) ; (d) maisons et immeubles. Chaque lot repasse par `asset_qa.py` avant push.

## Réponse de l'intégrateur au producteur (18 nov.) : oui, lance les lots maintenant, avec un ordre modifié
**Décision : commence tout de suite, sans attendre. Une correction par lot, qui remplace l'image de même nom ; le jeu reste cohérent entre deux lots.**
1. **Ordre recommandé (impact visible)** : (a) `bat_scierie` et `mega_centre_commercial` (sources déjà là, rapide) ; (b) **maisons et immeubles résidentiels en premier** (`maison_*`, `pavillon_banlieue`, `chalet_savoyard`, `villa_mediterraneenne`, `brownstone_new_yorkais`, `immeuble_londonien_briques`, `immeuble_haussmannien`, `immeuble_art_deco`, `immeuble_residentiel_*`, `barre_hlm`) : ce sont des centaines d'instances à l'écran, donc c'est là que le défaut se voit le plus ; (c) tours de bureaux et gratte-ciel (`tour_de_verre`, `immeuble_bureaux_vitre`, `tour_bureaux_12_*`, `gratte_ciel_25/40/60_*`) : la silhouette du centre-ville ; (d) bâtiments uniques : mairie, école, hôpital, gare, hôtel, banque, église, boulangerie, café, boutique ; (e) mines et gisements.
2. **Critère d'acceptation** : `python3 tools/factory_ai/asset_qa.py` doit donner une pente de 0,47 à 0,53 sur la dalle, aucun débordement hors de la parcelle (moins de 3 % des pixels du bas), marge transparente d'au moins 6 px (sauf tuiles), dalle centrée. Un sprite hors tolérance est rebuté avant le push.
3. **Compatibilité** : garder exactement les mêmes noms de fichiers. Le jeu mesure lui-même l'écrasement à appliquer (pente 0,50 = aucun écrasement) : un sprite corrigé s'affiche tel quel, un sprite ancien reste écrasé ; il n'y a rien à faire côté jeu entre deux lots.
4. **Pousser par lot**, avec la liste des noms remplacés et le résultat de `asset_qa.py` dans `RETOURS.md`.
5. **Pour les bâtiments sans source `bat_*`** : les régénérer, oui, en commençant par le lot (b). Si le calcul est le facteur limitant, s'arrêter après le lot (c) et me dire ce qu'il reste : (d) et (e) sont rares à l'écran et peuvent attendre.
6. **Reçu** : fermes en 2×2 (branchées dans le jeu), `fcorn`/`frapeseed` (je crée les deux cultures et leurs produits côté jeu), forêts et arbres isolés (branchés : rendu excellent). Non fait côté jeu pour l'instant : le sol (herbe a/b/c) ; demande : une version `herbe_*` avec **bordures qui se raccordent** (le losange doit se répéter sans couture visible) et 4 variantes de terre/sable pour les chemins.

## COMMANDE DE L'INTÉGRATEUR AU PRODUCTEUR n° 8 (18 nov.) : à produire maintenant, dans cet ordre
Règles communes : mêmes noms de fichiers pour les remplacements, un push par lot avec la liste des noms et la sortie de `python3 tools/factory_ai/asset_qa.py` dans RETOURS.md ; **dalle en projection 2:1 exacte (pente 0,47 à 0,53)**, marge transparente de 6 px (sauf tuiles), parcelle losange complète centrée ; pas de texte ni de logo dans les images sauf enseigne explicitement demandée ; modèles à licence commerciale uniquement.
**Lot A : remplacer les angles de caméra (déjà accepté)** : ordre : scierie et méga-centre ; maisons et immeubles résidentiels (le plus visible) ; tours de bureaux et gratte-ciel ; bâtiments uniques ; mines et gisements.
**Lot B : nouveaux éléments demandés par les évolutions du jeu**
1. `mall_central` : le grand centre commercial du départ (parcelle 2×2 cases, 512 px de losange, parking, enseigne « MALL CENTRAL » lisible, verrière centrale, quelques voitures) ; version `mall_central_nuit` (fenêtres éclairées).
2. `scene_mall_interieur.jpg` (1920×1080) : galerie marchande animée vue de l'intérieur (vitrines de boutiques variées, passants), sans texte lisible ; sert d'arrière-plan du panneau « Le Mall ».
3. `scene_bureau_banquier.jpg` (1920×1080) : le bureau du banquier d'affaires Lazare (costume sombre, bureau en bois, baie vitrée sur une skyline, dossiers) ; le portrait existant (`CASTE_IMG.banquier`, Hazard Bank) sert de référence de personnage.
4. `scene_salle_conseil.jpg` (1920×1080) : salle du Conseil de sécurité économique : table holographique avec globe, cinq sièges ; sert de futur écran de statut.
5. Herbes et chemins pour le sol : `herbe_a/b/c` sans couture entre voisins (le losange doit se répéter sans trame visible), `terre_a/b`, `chemin_terre_*` (4 orientations droites, 4 coins), `herbe_bord_*` (transition herbe vers route).
6. Routes complètes (voir la demande précédente) : T, coudes, bouts, 4 orientations chacun.
**Lot C : avatars du Réseau (petits portraits carrés 128×128, sans texte, style cohérent avec les portraits de caste)** : 24 visages variés (hommes, femmes, âges, origines) nommés `avatar_reseau_01` à `avatar_reseau_24` ; ils servent aux publications et au salon.
**Lot D : variantes de niveau des commerces et usines** : `usine_petite_f1_n2/n3`, `usine_moyenne_f2_n2/n3`, `usine_grande_f3_n2/n3` (plus grandes, plus riches, même parcelle), `petit_marche_n3`, `supermarche_n3`, `hypermarche_n3` (existent en `bat_*_n2/n3` : confirmer lesquels sont finaux).
**Lot E : vignettes produits restantes** : vignettes de produits finis encore sans photo dans `assets/guide_hd` (liste des clés manquantes : comparer avec `PRODUCTS` dans le jeu ; me dire lesquelles manquent) ; 10 `hero_*` existent, viser 30 au total (voiture, ordinateur, télévision, smartphone, vélo électrique, réfrigérateur, machine à laver, robot, montre, sac, baskets, parfum, chocolat, pain, fromage, vin, bière, jouet, console, casque…).
**Ce que le jeu a déjà branché (inutile de refaire)** : forêts, arbres isolés, fermes 2×2, gisements, mines, centrales, entrepôt, usines, commerces. **Pas encore branché de mon côté** : maïs et colza (je crée les cultures et leurs produits plus tard), sol, routes, `voiture_ville_*`, `navire_cargo`, `parc_urbain`, `stade_sport`.
**Questions** : (1) quelles images de la phase 2 sont déjà aux normes `asset_qa` (liste) ? (2) quel est ton débit réel (images par heure) pour que je priorise l'ordre ?

## Correctif à la commande n° 8, lot B1 : le mall central (direction artistique du producteur)
Le mall occupe **un bloc complet de 10×10 cases, au centre de la ville** (losange de 1 320 px de large à l'échelle du jeu ; produire en 2 560 px de large, emprise 10 cases). Style visé : **grand centre commercial asiatique, chinois ou thaïlandais, façon MBK Center de Bangkok** : bâtiment massif de 8 à 10 étages, longues façades en bandes de fenêtres, écrans LED et enseignes lumineuses géantes sur toute la façade, auvents colorés, grandes entrées couvertes, passerelles aériennes, tour de parking à rampes accolée, enseigne « MALL CENTRAL » lisible sur le toit. Autour, au pied du bâtiment : marché de rue dense (étals, scooters, tuk-tuk, parasols, passants, arbres en bacs). À produire : `mall_central` (jour) et `mall_central_nuit` (néons allumés), et des éléments détachés réutilisables : `etal_marche_a/b/c`, `scooter_a/b`, `tuk_tuk_a/b`, `parasol_a/b`, `enseigne_neon_a/b/c` (sans texte lisible), `passerelle_aerienne`, `tour_parking`. Dalle 2:1 exacte, marge de 6 px. En attendant, le jeu compose le mall avec ses propres primitives.
## Sol : herbe sans couture et terre (18 nov., soir)
- `herbe_a/b/c` remplacées et `herbe_d` ajoutée ; `terre_a/b/c/d` (chemins, terre battue) nouvelles. Losange 396×198, ancre (198,99), emprise 396.
- Raccord sans couture garanti par construction (`tools/factory_ai/sol.py`) : bruit périodique dans l'espace monde, période 1 par case, **même base pour toutes les variantes** ; seules des touches intérieures (fondues vers 0 aux bords) les distinguent. N'importe quelle herbe se raccorde à n'importe quelle autre, idem pour la terre. Herbe/terre côte à côte : bord net, pas de transition (`herbe_bord_*` pas faits).
- Rendu : herbe mouchetée jaune-vert avec plaques de terre claire (référence Age of Empires de Rémy).
- Lot maisons/immeubles : sources `bat_maison_*`, `bat_immeuble_*`, `bat_tour_logements` générées côté producteur mais **non poussées** : la recomposition sur sol 2:1 donne la bonne pente mais des maisons moins soignées que les originaux. Décision de Rémy en attente.

## Réponse de l'intégrateur (19 nov., nuit) : lot maisons/immeubles recomposés + état du branchement
1. **Lot maisons et immeubles recomposés (`bat_maison_*`, `bat_immeuble_*`, `bat_tour_logements`) : pousse-les dans un dossier de candidats** `assets/factory_hd_candidats/` (pas à la place des originaux). Je les compare en jeu à côté des originaux écrasés. **Règle de décision proposée à Rémy (il tranche)** : un candidat remplace l'original seulement s'il est au moins aussi soigné ; sinon on garde l'original écrasé tant que la version 2:1 n'est pas au même niveau de finition. Ne remplace rien sans cette comparaison.
2. **Branchement en cours cette nuit (trois agents)** : sol, routes (15 orientations) et eau ; ville vivante (services, véhicules, port, détails de ferme, niveaux) ; maïs et colza (cultures et produits). Chaque agent écrit ici « Retour de l'intégrateur n° 9 » avec les défauts d'images qu'il rencontre : traite-les dès qu'ils apparaissent.
3. **Reçu et utile** : routes complètes, sol (herbe a-d, terre a-d), eau, véhicules `veh_*`, animaux, services. Inventaire à jour dans `wall-street-empire/docs/INTEGRATION_ASSETS.md` (généré par `tools/factory_ai/inventaire.py`).
4. **Toujours à produire** (commande n° 8) : mall architectural moderne (le rendu actuel est calculé par le jeu faute d'image : « Guggenheim / Dubaï », sans arc-en-ciel), scènes banquier et Conseil, avatars du Réseau, niveaux n3, vignettes de produits manquantes, supermarché et hypermarché à la bonne caméra.

## COMMANDE DE L'INTÉGRATEUR AU PRODUCTEUR n° 9 (19 nov.) : magasins spécialisés (à la Capitalism Lab)
Le joueur veut étendre sa surface commerciale par des **magasins spécialisés liés aux familles de produits**. Le jeu les ajoute (concession, high-tech, luxe, mode, pharmacie, maison et déco, sport et loisirs) avec des bâtiments provisoires composés par le code ; il faut de VRAIS sprites HD. Règles communes : parcelle losange complète, **dalle 2:1 exacte (pente 0,47 à 0,53)**, marge transparente de 6 px, enseigne ou texte seulement si indiqué, style cohérent avec `drugstore.png` / `boulangerie.png` (matériaux réalistes, éclairage de gauche), modèles à licence commerciale. Un push par lot avec la sortie de `asset_qa.py`.
1. `concession_auto` (emprise 2×2) : grande vitrine vitrée, 3 à 4 voitures exposées visibles à travers le verre et sur un parvis, enseigne sans texte lisible, petit parking client. Variante `concession_auto_n2` (plus grande).
2. `boutique_high_tech` (emprise 1×1 ou 2×1) : **magasin d'informatique de style Apple Store** : cube de verre épuré, étage de bois clair, grande enseigne lumineuse sans logo ni pomme, tables d'exposition d'ordinateurs et de téléphones visibles. Nom en jeu : « Maison du Numérique ». Variante `_n2`.
3. `boutique_luxe` (1×1) : façade de pierre sombre et laiton doré, grandes vitrines éclairées, portier, enseigne dorée sans texte lisible ; `boutique_mode_luxe` (1×1) : couturier, vitrines de mannequins, auvent noir et or.
4. `pharmacie` (1×1) : croix verte lumineuse (pictogramme seulement), façade claire, vitrines de santé et beauté ; `drugstore` existe : dire s'il est réutilisable comme variante.
5. `maison_deco` (2×1) : magasin de meubles et décoration : grandes vitrines de canapés, lampes, literie ; `sport_loisirs` (2×1) : magasin de sport, vélos et tentes devant, grande enseigne colorée sans texte.
6. Niveaux : variantes `_n2` et `_n3` plus riches pour `boutique_mode`, `boulangerie`, `cafe_de_quartier` (mêmes noms de base).
7. Rappels de la commande n° 8 toujours en attente : supermarché/hypermarché à la bonne caméra, mall architectural, scènes, avatars.

---
## Revue qualité n°1 (intégrateur → Cowork) — exigence : plus haute qualité, palette unifiée

Voir `wall-street-empire/docs/CHARTE_VISUELLE.md` (nouvelle). Résumé par famille :
- **Fermes** : meilleur lot à ce jour (2:1 exact, cohérent). À corriger : verts trop saturés, grange rouge répétée (varier toit/teinte), animaux minuscules, colza trop proche du blé et trop vif.
- **Routes route_*** : trottoirs à centre transparent → base asphalte intégrée nécessaire.
- **Herbe / terre** : variantes quasi identiques et sur-saturées → désaturer, varier la texture.
- **Véhicules** : angle trop raide (non 2:1), primaires criardes → neutres + 1 accent.
- **Services** : pictogrammes de toit trop saturés ; gare : icône voiture mal placée.
- **Supermarché / hypermarché** : voitures et bâtiment trop petits, angle à régénérer.
- **Centrales** : respecter l'échelle (nucléaire 3×3 < solaire 5×4).
Merci de re-livrer ces familles pour une revue n°2. Le build corrigera les dérives de saturation, mais la source doit déjà être sobre.
## Retour de l'intégrateur n° 9 (ville vivante) — 19 nov. 2026
Branchés dans le jeu (même chaîne que la phase 2 : moitié de la taille, palette 256 couleurs ; dalle calée sur le losange de la case, pente écrasée par `sy` mesuré ; objets posés sur l'ancre d'`ancres.json`) : services de quartier, équipements publics (hôpital, écoles, mairie, stades), véhicules, navire, grues, conteneurs et marchandises des quais, détails des fermes, niveaux du joueur, parcs, rochers, gisement d'or, chantiers. Défauts relevés en jeu, à corriger sous le même nom de fichier :
- **`grue_portique`** : c'est une grue à tour (mât en treillis, flèche, contrepoids), pas un portique à conteneurs. Demande : vrai portique de quai (deux paires de jambes sur rails, poutre en porte-à-faux au-dessus de l'eau, chariot), axe parallèle au quai (axe y de la carte, du haut à droite vers le bas à gauche), ancre au pied côté quai.
- **Véhicules (`veh_*`, `voiture_ville_a/b`, `camion_ville`) et `navire_cargo`** : une seule vue (trois-quarts avant). Le jeu retourne l'image pour l'autre axe, donc sur deux des quatre sens les voitures (et le navire qui remonte vers le nord-est) roulent visuellement en marche arrière. Demande : une vue trois-quarts arrière de chacun, suffixe `_ar` (`veh_rouge_ar`, `navire_cargo_ar`…). Orientation hétérogène : avant en bas à droite pour `veh_argent, veh_blanc, veh_bleu, veh_camionnette, veh_jaune, veh_noir, veh_pickup, veh_vert` ; en bas à gauche pour `veh_orange, veh_rouge, voiture_ville_a, voiture_ville_b, camion_ville` : uniformiser (avant en bas à droite) pour les prochains. `navire_cargo` : une tour blanche (phare) plantée sur la proue, à retirer.
- **`siege_hq_n1`** : pas de parvis ni de dalle, trois étages qui remplissent seuls l'emprise 2×2 (étages géants à côté des maisons) et silhouette qui touche le haut de l'image (y0 = 1 px, coupée ?). Le jeu le pose réduit au centre de l'emprise en attendant. Demande : même composition que `siege_hq_n2/n3` (parvis, abords, bâtiment plus petit). `siege_hq_n2` touche aussi le haut (y0 = 2 px).
- **`supermarche_n2/n3`, `hypermarche_n2/n3`** : le magasin rétrécit d'un niveau à l'autre (petit bâtiment dans le coin, parking plus grand) : en jeu, l'amélioration se lit comme une régression. Demande : le bâtiment grandit (plus large, plus haut, verrière) et le parking garde sa taille. Texte anglais « SUPERMARKET / HYPERMARKET » sur les façades (consigne : pas de texte).
- **`hopital`** : texte anglais « HOSPITAL » sur le toit ; **`boulangerie`, `cafe_de_quartier`, `restaurant_terrasse`, `boutique_mode`, `ecole`, `gare_ferroviaire`, `station_service`, `station_recharge_electrique`** : pictogramme géant peint sur tout le toit (pain, tasse, couverts, cintre, cahier, train, pompe, éclair) ; lisible de loin, mais style « icône » à côté des maisons réalistes : à confirmer avec Rémy (sinon enseigne en façade).
- **`gare_ferroviaire`** : bâtiment petit au milieu d'une grande dalle (moins haut qu'un pavillon voisin) ; quais et voies trop courts pour une gare. **`drugstore`** : composition 2×2 avec parking, utilisée sur une case (tout est réduit de moitié) : une version 1 case sans parking serait plus lisible.
- **Pentes hors tolérance (`asset_qa`, attendu 0,47-0,53)** : `barre_hlm` 0,83, `immeuble_en_construction` 0,84, `chantier_petit` 0,87, `gisement_or` 0,87, `boulangerie` 0,68, `ecole` 0,68, `hopital` 0,70, `gare_ferroviaire` 0,68, `eglise_de_village` 0,69, `mairie` 0,66, `parc_urbain` 0,64, `maison_n1` 0,65, `maison_n2` 0,63, `tour_*` 0,60-0,81, `immeuble_n1/n2` 0,74-0,75 (le jeu écrase ; refaire en 2:1 dans le lot A).
- **Bâtiments sans dalle** (`maison_n3`, `immeuble_n1`, `immeuble_n2`, `tour_*`, `siege_hq_n1`, `batiment_abandonne`) : la rangée la plus large n'est pas la parcelle, le jeu les pose par le sommet bas de la silhouette. Demande : dalle ou trottoir sous chacun, comme `maison_n1/n2`. `batiment_abandonne` touche le haut et les bords (marges 0 à 2 px) : coupé.
- **`animal_vache`, `animal_mouton`, `animal_poule`, `animal_cochon`** : silhouette collée à gauche (boîte 25-147 px sur 252 de large, 40 % de vide à droite) : recentrer. **`auge_foin`, `balles_foin`, `meule_foin`, `fermier_seau`, `vendangeur`, `vigneron_hotte`** : absents d'`ancres.json` (pas d'ancre aux pieds).
- **`gisement_or`** : socle brun arrondi et brillant (on dirait un gâteau au chocolat) : style différent des autres gisements (dalle de terrain avec affleurement) ; les effets de brillance du jeu restent dessinés par-dessus.
- **Non branchés, et pourquoi** : `station_recharge_rapide_autoroute` (pas d'autoroute dans le jeu) ; `camion_*_face` (vue de face, pas isométrique) ; `hangar_ferme` (les fermes 2×2 sont déjà composées) ; routes, sol, eau (autre intégrateur) ; personnages et machines d'usine (vue immersive de l'usine, hors ville) ; sources `bat_*`. `tour_bureaux`, `tour_logements`, `tour_tech`, `tour_pnj_a/b` ne sont pas une série de niveaux : utilisés comme tours du joueur (bureaux, logements à 13 étages et plus, tech niveau 3 et plus) et tours PNJ de 12 à 30 étages.
## Retour de l'intégrateur n° 9 (maïs et colza)
**Branché dans le jeu** : `fcorn` (Culture de maïs) et `frapeseed` (Culture de colza) sont deux vraies fermes 2×2 du menu Agriculture (famille Cultures), avec zones fertiles de maïs et de colza sur la carte ; les sprites `assets/factory_hd/fcorn.png` et `frapeseed.png` sont embarqués par le build (`P2_NAMES`) et calés sur le losange de 2 cases exactement comme `fwheat` (losange mesuré 512 px, ancre de `ancres.json`). Plus de « pas dans le jeu ».
Nouveaux biens : `corn` (Maïs, brut), `rapeseed` (Colza en graines, brut), `cookoil` (Huile de cuisine = maïs + colza, intermédiaire), `biodiesel` (Biodiesel = colza + produits chimiques, intermédiaire). Nouveaux produits finis : `tableoil` (Huile de table, première nécessité), `cornchips` (Chips de maïs), `biofuel` (Biocarburant en bidons, rayon Auto et outils).
**Attend une image du Mac** (le jeu retombe sur la vignette vectorielle en attendant ; sujets décrits dans `tools/factory_ai/photos_guide.json`, même consigne que les autres) :
1. Photos du Guide du fabricant, `assets/guide_hd/<clé>.jpg` (512×512) : produits `tableoil`, `cornchips`, `biofuel` ; biens `corn`, `rapeseed`, `cookoil`, `biodiesel`.
2. Vignettes produits (lot E, `hero_*` facultatif) : `tableoil`, `cornchips`, `biofuel`.
3. Marchandises sur palette (sprites `MAT_SPR`, 2,2 × 2,2 cases, ancre au centre), facultatif : `sacs_mais`, `sacs_colza`, `futs_huile`, `futs_biodiesel` ; en attendant, sacs et fûts vectoriels.
4. Gisement (facultatif) : une parcelle de champ fertile « maïs » et « colza » au repos (losange 1 case, comme les autres gisements de la phase 2) ; en attendant, champ vectoriel jaune.
## Commande de l'intégrateur n° 9 (magasins spécialisés, 18 nov.)
Le jeu ajoute 8 magasins spécialisés (menu Commerce > Magasins spécialisés). Ils sont dessinés pour l'instant avec les primitives du jeu (verre bleu-gris, acier, pierre claire, accents dorés pour le luxe) ; la boutique de mode et la pharmacie réutilisent `boutique_mode` et `drugstore` (déjà livrés), la concession pose les voitures `veh_noir`, `veh_argent`, `veh_blanc`, `veh_rouge`, `voiture_ville_a/b`. Il faut maintenant de vrais sprites HD. **Règles communes** : dalle en projection 2:1 exacte (**pente 0,47 à 0,53**, vérifiée par `python3 tools/factory_ai/asset_qa.py`), **marge transparente de 6 px**, parcelle losange complète centrée (396 px de losange par case, soit 792 px pour 2 cases de large), même caméra que les commerces recalés du 17 nov. ; style sobre et élégant, **pas d'arc-en-ciel**, enseigne seulement si indiquée, aucune marque réelle (ni pomme, ni logo existant) ; modèles à licence commerciale. Versions `_nuit` facultatives (vitrines éclairées).
- `concession_auto` (2×2 cases) : grand showroom vitré (façade de verre bleu-gris sur deux côtés, toiture plate en acier avec liseré doré), 2 voitures visibles derrière la vitre, parvis pavé avec 4 à 6 voitures neuves exposées en épi, totem sombre avec l'enseigne « AUTOMOBILES », quelques places de parking marquées au sol.
- `boutique_high_tech` (2×1 cases) : « Maison du Numérique », cube blanc mat à façade entièrement vitrée sur la longueur, longues tables claires et éclairées visibles à l'intérieur, toit plat, enseigne discrète « MAISON DU NUMÉRIQUE » en lettres grises ; aucune pomme ni logo existant.
- `boutique_luxe` (1×1 case) : joaillier-horloger de prestige : pierre claire, corniche, deux hautes vitrines sombres encadrées de laiton doré, auvent noir à liseré doré, enseigne « MAISON » dorée, petit tapis devant l'entrée.
- `boutique_mode_luxe` (1×1 case) : boutique de prêt-à-porter haut de gamme (remplacera `boutique_mode`, dont le toit rose vif ne convient plus) : façade claire, grandes vitrines avec mannequins, auvent gris rosé, enseigne « MODE ».
- `maison_deco` (2×1 cases) : grande surface meubles et décoration : volume clair, bardage bois sur une partie de la façade, vitrine d'entrée avec canapé et luminaires, bandeau brun « MAISON & DÉCO », une voiture garée.
- `sport_loisirs` (2×1 cases) : magasin de sport : volume gris acier, bandeau vert sombre « SPORT & LOISIRS », vitrine avec vélos et tentes, entrée vitrée.
- `pharmacie` (1×1 case) : pharmacie-drugstore de quartier (remplacera `drugstore`, dont le parking déborde d'une case) : façade blanche, croix verte lumineuse, vitrine de produits, petit auvent vert ; sans parking.
- (facultatif) `brico_outillage` (2×1 cases) : magasin de bricolage : volume entrepôt clair, bandeau brun orangé « BRICO », porte sectionnelle, palettes de bois devant.
Branchement côté jeu : `P2_TYPE` (game.template.html) et `P2_NAMES` (tools/build.py) ; un nom livré remplace aussitôt la composition provisoire. Merci de joindre la sortie d'`asset_qa.py` pour ces fichiers.
## Retour de l'intégrateur n° 9 (sol et routes)
Branché dans le jeu : les 16 `route_*` (choisies d'après les voisins, toutes orientations vérifiées), `herbe_a/b/c/d`, `terre_a/b/c/d` (clairières aux bords fondus), `sol_ville_pave`, `sol_port_asphalte`, `sol_quai_beton_a/b`, `eau_calme`, `eau_rivage_quai`, `rivage_sable`. Le build les encode en JPEG 264×132 et le jeu les découpe sur le losange. Défauts constatés en mosaïque (captures à plusieurs zooms), à corriger à la source :
- **Routes (16)** : bonnes. Losange exact, chaussée opaque, raccords exacts entre voisines. Rien à reprendre. (Dans les fichiers de la branche, le milieu de la chaussée est opaque, gris 84,88,96 ; le jeu pose quand même une sous-couche d'asphalte dessous.)
- **`herbe_a/b/c/d`** : raccord parfait, mais les 4 variantes sont presque identiques (mêmes plaques au même endroit) : la répétition se voit en diagonale dès le zoom moyen. Vert trop saturé pour la charte (S moyen ≈ 0,59) : le build retire 25 % de saturation et décale la teinte vers le jaune-vert. Demande : 4 vraies variantes (plaques et touffes à des endroits différents, la base périodique peut rester commune), saturation plus douce à la source.
- **`terre_a/b/c/d`** : même remarque (variantes quasi identiques). Le jeu les utilise en taches fondues, donc moins visible. Manquent toujours les transitions `herbe_bord_*` / `chemin_terre_*`.
- **`eau_calme`** : **pas sans couture** : chaque tuile a son propre éclairage (plus clair en haut à gauche, vignette) et les vaguelettes ne se raccordent pas : en mosaïque on voit une grille de losanges. Le build compense (passe-haut + décalage d'une demi-case et fondu) ; il faut une eau périodique comme l'herbe (bruit dans l'espace monde, période 1 case).
- **`eau_rivage_quai`** : (1) l'eau est nettement plus foncée et plus bleue que `eau_calme` (le build ramène sa couleur à celle de `eau_calme`) ; (2) le quai est le long du bord bas-droit (SE) avec de l'eau des deux côtés ; dans le jeu la mer est au SE et le quai au NW : il faut la bande de quai **collée au bord haut-gauche (NW)**, eau seule vers le SE ; le jeu la tourne de 180° en attendant ; (3) la bande de béton ne rejoint pas les deux coins NE et SW de la case : entre deux tuiles voisines le long du quai, la bande est coupée (dents de scie). Demande : bande continue d'un coin à l'autre, à la même distance du bord.
- **`rivage_sable`** : l'écume est près du coin haut (N), pas le long d'un bord ; elle doit suivre **le bord bas-droit (SE)**, côté mer (le jeu tourne la tuile de 180° : l'écume tombe au coin bas). Léger dégradé propre à chaque tuile (retiré au build). Manquent les variantes de coin (mer au SE et au SW, mer au SE et au NE) pour une côte qui tourne.
- **`sol_ville_pave`** : chaque tuile a un cadre biseauté (bordure claire + ombre) : en mosaïque la ville devient un damier de dalles encadrées. Acceptable comme trottoir de lot, mais une variante **sans cadre** (pavés continus) serait meilleure pour les places et les rues piétonnes.
- **`sol_port_asphalte`** : vignette sombre et double ligne blanche sur tout le pourtour : damier de parkings en mosaïque. Demande : asphalte périodique sans cadre, marquages en option dans une variante `sol_port_asphalte_marquage`.
- **`sol_quai_beton_a/b`** : dalle surélevée avec une ombre portée sur les bords bas : les quais en mosaïque montrent une grille de dalles en relief. Demande : béton à plat, joints fins seulement.
## COMMANDE DE L'INTÉGRATEUR AU PRODUCTEUR n° 10 (19 nov.) : l'aéroport
Le jeu ajoute un **aéroport** unique (emprise **6×4 cases**, en périphérie sud, contre une route) avec un centre commercial duty free. Il est dessiné pour l'instant par le code (piste, terminal, tour) ; il faut un vrai sprite HD. Règles communes : dalle en projection 2:1 exacte (**pente 0,47 à 0,53**, vérifiée par `asset_qa.py`), marge transparente de 6 px, parcelle losange complète de 6×4 cases, même caméra que les commerces recalés, lumière haut-gauche, palette sobre (`docs/CHARTE_VISUELLE.md` : béton, verre bleuté, herbe rase désaturée, une seule couleur d'accent), aucune marque ni compagnie réelle.
- `aeroport` (6×4) : à l'arrière (côté haut de l'image) une **piste** d'asphalte sur toute la longueur avec axe pointillé blanc et seuils ; une bretelle vers une **aire de stationnement** en béton clair avec un avion de ligne blanc (dérive bleu-gris sans logo) relié par une passerelle ; à l'avant un **terminal** long et bas, façade vitrée bleutée, toiture claire débordante, enseigne sobre « AÉROPORT » ; à droite une **tour de contrôle** (fût clair, vigie vitrée, toit sombre). Herbe rase autour de la piste, quelques voitures sur un parking devant le terminal.
- Facultatif : `avion_ligne` (objet seul, trois-quarts avant, avant en bas à droite, et sa vue `_ar`) pour l'avion qui roule et décolle (aujourd'hui dessiné en primitives) ; `aeroport_nuit` (terminal éclairé, balisage de piste).
Branchement côté jeu : `drawAirport` (game.template.html) et `P2_NAMES` (tools/build.py). Joindre la sortie d'`asset_qa.py`.
## Producteur — candidats maisons/immeubles (19 nov.)
- 11 candidats recomposés sur parcelle 2:1 (1 case, 256 px, jardin) dans `assets/factory_hd_candidats/` : maison_n1/n2/n3, maison_pnj_a/b/c, immeuble_n1/n2, immeuble_pnj_a/b, tour_logements. Originaux non touchés ; à Rémy de trancher (remplacer seulement si au moins aussi soigné).
- Commande n°9 (magasins) en production sur le Mac : lot15 + mall_moderne (rendu architectural sans arc-en-ciel). Composition + QA ensuite.
## Producteur — lot commande n°9 + mall (19 nov.)
Livrés dans assets/factory_hd (parcelle 2:1, marge 6 px, QA asset_qa : pente 0,50, débordement 0 %, centré, aucun signalement) :
- concession_auto, concession_auto_n2 (2×2, 524×274/287 ; showroom vitré, voitures, petit parking client)
- boutique_high_tech, boutique_high_tech_n2 (1×1 ; cube vitré, étage bois clair, enseigne lumineuse sans logo)
- boutique_luxe (1×1 ; pierre sombre, laiton doré, portier), boutique_mode_luxe (1×1 ; store noir et or, mannequins)
- pharmacie (1×1 ; croix verte seule). drugstore.png reste utilisable pour une épicerie/drugstore, mais pharmacie est dédiée.
- maison_deco, sport_loisirs (parcelle 2×2 de 512 px, bâtiment en bande 2×1 ; vélos et tentes devant pour sport_loisirs)
- mall_central (10×10, 2572×1665, emprise 10, style MBK Bangkok ; passerelle, tour parking, étals) et mall_central_moderne (10×10, rendu architectural sans arc-en-ciel, alternative à la version calculée par le jeu). `mall_central_nuit` : pas encore.
- Sources bat_* conservées. Pas encore produits : niveaux _n2/_n3 de boutique_mode/boulangerie/cafe_de_quartier, scènes 1920×1080, avatars, n3, vignettes.
- Ombres (ombres/*.png) non poussées pour ce lot, à régénérer si nécessaire.
## Revue qualité n°2 (intégrateur → Cowork) : commande n°9 reçue et branchée
Reçu et branché : concession_auto (+n2), boutique_high_tech (+n2), boutique_luxe, boutique_mode_luxe, pharmacie, maison_deco, sport_loisirs. Mall : mall_central_moderne examiné.
- **Très bien** : pente 2:1, parcelle propre, palette sobre cohérente (blanc/pierre/bois/laiton), vrai progrès sur la charte. Les boutiques luxe et mode luxe sont les meilleures.
- **À corriger** : (1) texte illisible généré sur les enseignes (« CNEME » sur high-tech, texte déformé sur le mall moderne et sport_loisirs) → enseigne sans lettres (bandeau lumineux uni) ou texte net court ; (2) sport_loisirs : enseigne multicolore criarde, à ramener à 1 accent ; (3) maison_deco et sport_loisirs : grand parking gris vide, bâtiment petit par rapport à la parcelle ; (4) pharmacie : croix vert fluo, désaturer légèrement ; (5) mall_central_moderne : très beau volume, mais l'enseigne « MALL CENTRAL » est dessinée par le jeu, donc la retirer du sprite.
Prochaine livraison souhaitée : niveaux n2/n3 des boutiques, grange de ferme variée, véhicules (vues arrière), aéroport (commande n°10).

## Revue qualité n°3 (intégrateur → Cowork) : retour direct de Rémy sur la commande n°9 — EXIGENCE RÉHAUSSÉE
Rémy a regardé les livrables : « beaucoup d'erreurs ». À reprendre en priorité, dans l'ordre :
1. **mall_central_moderne : géométrie incohérente (déformée)**. L'idée architecturale plaît (volume courbe, bandeaux ondulés), mais les plans ne se raccordent pas (façades, toit, tour latérale). Refaire avec UN volume cohérent, mêmes arêtes 2:1 sur toutes les faces. **Il doit être plus gros** : remplir réellement les 10×10 cases (aujourd'hui il paraît petit sur sa dalle).
2. **Parking à étages** : bien visible d'un côté du mall (tour de parking de 4-5 niveaux, rampes, voitures sur les dalles), relié par passerelle.
3. **Vie sur la place** : il manque du monde. Parvis dense avec flux d'allers-retours de gens, **caddies**, sacs de courses, familles, livreurs, étals : l'impression d'une foule qui entre et sort en continu. (Le jeu ajoute déjà des passants animés ; le sprite doit déjà donner une place vivante.)
4. **Boutiques spécialisées : on ne voit pas ce qu'il y a à l'intérieur.** Vitrines larges et ouvertes, intérieur lisible (rayons, mannequins, voitures, produits), vue en coupe partielle si besoin.
5. **Titres lisibles** : la plupart ne le sont pas (texte généré déformé). Soit enseigne SANS lettres, soit un nom net, court, grand, en capitales, contraste fort. Alternative que le jeu peut faire : le jeu superpose lui-même le titre en texte net ; dans ce cas, livrer l'enseigne vide (bandeau uni).
6. **Une statue / un logo emblématique par type de magasin**, bien visible depuis la rue : mode = grand mannequin ou silhouette de mode sur le toit ou devant ; **concession auto = voiture exposée sur le toit ou sur un socle, ou carrousel tournant sur le toit, ou grand parking à voitures mises en valeur** ; high-tech = grand écran/pomme-like sans marque ; luxe = sculpture dorée ; pharmacie = croix lumineuse ; sport = grande silhouette de coureur/vélo ; déco = lustre/fauteuil géant.
Rappel palette : sobre, une couleur d'accent par sprite (docs/CHARTE_VISUELLE.md). Merci de livrer ces corrections AVANT les nouveaux types.

## Revue qualité n°4 (intégrateur → Cowork) : un magasin n'est PAS une machine d'usine — direction artistique de Rémy
**Problème de fond** : plusieurs magasins livrés reprennent le gabarit des usines/machines (entrée de matières d'un côté, produit fini qui « sort » de l'autre). La pharmacie montre un artefact qui sort du bâtiment, comme un drive. **Interdit** pour tout commerce : aucun tuyau, convoyeur, sas, goulotte, caisse qui sort. Un magasin est un bâtiment de ville avec façade, vitrine, entrée piétonne et clients.
**Pharmacie (et hôpital) : un bâtiment graphique, lisible du ciel.**
- Pharmacie : le **plan en croix** (un « + » vert). Un cube central avec quatre ailes courtes formant une croix vue du dessus, **la croix verte vue d'en haut est le bâtiment lui-même** (toit vert, ou toit clair avec croix verte géante incrustée sur toute sa surface). La croix doit être **grosse**, occuper l'essentiel du toit, pas un petit pictogramme.
- Hôpital : même logique avec un **plan en H** (deux grandes ailes parallèles reliées par un corps central), toit clair, croix/H marqués, héliport optionnel.
- Dans les creux entre les branches de la croix : parvis, arbres, quelques voitures et piétons. Le tout reste inscrit dans un cube/une parcelle 2:1 ; la silhouette « qui donne envie de la croquer ».
- Palette sobre : blanc cassé, un seul vert pharmacie net, pas de fluo.
**Règle générale pour tous les magasins spécialisés** : silhouette propre à leur métier lisible de loin (voir revue n°3 : mannequin, voiture sur le toit, etc.), vitrines ouvertes, clients visibles, jamais de motif industriel.
Merci de refaire d'abord la pharmacie selon ce plan en croix, puis l'hôpital en H, et de corriger les autres magasins qui ont le même défaut « machine ».

## INSTRUCTION PERMANENTE (Rémy, 19 nov.) : plus AUCUN texte dans les assets
**Tous les assets, sans exception** (bâtiments, magasins, mall, aéroport, hôpital, véhicules, panneaux, caisses, palettes, produits, scènes, logos) : **n'écrivez plus jamais aucune lettre, mot, chiffre ou logo de marque dans une image.** Le texte généré est systématiquement déformé et illisible. Le jeu affiche lui-même tous les titres et noms **par le code** (texte net, police du jeu, langue du joueur).
- Là où il faut une enseigne : **bandeau, caisson ou panneau UNI** (couleur sobre, léger éclairage), sans glyphes, ni pseudo-lettres, ni symboles inventés.
- Les **statues et emblèmes** restent permis (mannequin, voiture sur le toit, croix, silhouette de vélo, lustre…) : ce sont des formes, pas du texte.
- Les sprites déjà livrés avec du texte (mall moderne, high-tech, sport/loisirs, hôpital « HOSPITAL », supermarché/hypermarché, etc.) sont à régénérer sans texte ; en attendant, le jeu masquera/recouvrira leurs enseignes.

## Commande n°55 (intégrateur → Cowork) : audit visuel complet de la carte — sprites encore manquants
L'audit automatisé (`wall-street-empire/tools/audit_visuel.js`, rapport `wall-street-empire/docs/AUDIT_VISUEL.md`) a recensé chaque élément de la carte. Ce qui n'avait pas de sprite HD est désormais couvert par un sprite HD voisin recoloré ou par un repli procédural sobre ; les sprites ci-dessous restent à produire pour remplacer ces solutions d'attente. **Règles communes** : aucun texte, aucune lettre, aucun chiffre, aucun logo ; vue isométrique 2:1 (pente 0,50 ± 0,03), lumière haut-gauche, ombre bas-droite ; palette désaturée de la charte (`docs/CHARTE_VISUELLE.md`, au plus une couleur saturée et ≤ 15 % de la surface) ; fond transparent, parcelle propre, marge 6 px ; même modelé « dalle épaisse » que les gisements existants (`assets/phase2_hd/gisement_*.png`, 408×312) pour les gisements.
1. **55-1 `concasseur_recyclage.png`** (assets/phase2_hd, emprise 1×1, ~792×500 comme `carriere.png`) : centre de concassage de gravats — trémie d'alimentation, concasseur à mâchoires sur châssis, convoyeur incliné vers deux tas (gravier gris, sable beige), tas de gravats de béton cassé avec ferrailles, petite chargeuse. Gris béton, acier gris, un seul accent jaune engin. Aujourd'hui : reprend `carriere.png`.
2. **55-2 `caserne_pompiers.png`** (phase2_hd, 1×1, ~408×312) : caserne de pompiers de ville — bâtiment en brique patinée, deux grandes portes de remise ouvertes avec un camion visible (rouge sombre, désaturé), tour de séchage des tuyaux, toit plat gris. Aujourd'hui : composition iso procédurale sobre (drawMonument).
3. **55-3 `commissariat.png`** (phase2_hd, 1×1, ~408×312) : commissariat — bâtiment administratif en pierre grise, toit ardoise, auvent d'entrée, deux voitures de patrouille garées (blanc/gris, liseré bleu discret), mât de drapeau sans motif lisible. Aujourd'hui : composition iso procédurale sobre.
4. **55-4 `aeroport_terminal.png`** (assets/factory_hd, emprise de l'aéroport du jeu, voir commande n°10) : aérogare vitrée, tour de contrôle, passerelles, deux avions de ligne blancs, tarmac gris ; marquages au sol en lignes simples (pas de chiffres ni de lettres sur la piste). Aujourd'hui : composition procédurale (drawAirport, passe 49).
5. **55-5 `gisement_gravier.png`, `gisement_sable.png`, `gisement_calcaire.png`** (phase2_hd, 1×1, 408×312, même cadrage que `gisement_bauxite.png`) : dalle de sol épaisse aux bords arrondis, gravier = galets et graviers gris mêlés ; sable = sable beige ridé, quelques galets ; calcaire = bancs de calcaire crème stratifiés et fissurés. Aujourd'hui : `gisement_bauxite` / `gisement_potasse` recolorés en jeu (P2_RECOL).
6. **55-6 `champ_mais.png`, `champ_colza.png`, `champ_canne.png`, `champ_coton.png`, `champ_hevea.png`, `champ_vigne.png`** (phase2_hd, 1×1, 408×210, même cadrage que `champ_ble_mur.png`) : parcelle cultivée en rangs — maïs (tiges hautes vert franc, panicules beiges) ; colza en fleur (jaune doux désaturé, pas fluo) ; canne (hautes tiges vert clair) ; coton (buissons verts ponctués de capsules blanches) ; hévéas (petits arbres alignés, sol ombragé) ; vigne (rangs de ceps sur fils, sol brun clair). Aujourd'hui : champ de blé recoloré.
7. **55-7 `brico_outillage.png`** (factory_hd, 1×1) : déjà commandé (commande n°9, magasin bricolage) — rappel : le jeu le compose encore en primitives (drawSpecShop).
En attendant chaque livraison, le jeu garde le repli indiqué : aucun élément n'affiche plus le disque beige à losanges blancs.
## Commande n°11 (intégrateur → Cowork, 19 nov.) : campus data center 5×4, SANS AUCUN TEXTE
Le data center (`dc`) n'est plus une tour de ville : c'est un **campus hyperscale de 5×4 cases** (20 cases), construit en zone industrielle ou en campagne (passe 55). Le jeu le dessine aujourd'hui en procédural sobre (`drawDcCampus`) ; le sprite HD le remplacera. L'ancien `data_center.png` (1 case) reste réservé aux anciens data centers des vieilles sauvegardes.
- **Fichier** : `assets/phase2_hd/data_center_campus.png` (+ `ombres/data_center_campus.png`, même taille). Parcelle 2:1 de **5×4 cases** (losange ≈ 576 px de large à l'échelle 1, 128 px par case), marge 6 px, ancre = coin avant de l'emprise, pente 0,50.
- **Contenu, de l'arrière vers l'avant** : trois **grands halls techniques** longs, parallèles à l'axe x (toits plats gris clair couverts de groupes de climatisation alignés, façades sans fenêtres avec bandeau sombre et petits voyants verts) ; à droite, un bloc de **tours de refroidissement** carrées (6 aérorefroidisseurs, ventilateurs visibles au sommet, légère vapeur) ; devant les halls, une rangée de **groupes électrogènes** (5 conteneurs vert sombre, cheminées courtes) ; coin avant droit, un **poste de transformation** (2 transformateurs, portiques et départ de ligne haute tension) ; coin avant gauche, un **parking de sécurité** (places marquées, 6 à 8 voitures sobres, guérite) ; **clôture** de sécurité continue et bande de pelouse en ceinture.
- **Palette** : gris béton et blanc cassé, un seul accent (vert des voyants ou bleu froid très discret). Pas de néon, pas d'arc-en-ciel.
- **INTERDIT** : aucune lettre, aucun chiffre, aucun logo ni pseudo-logo, aucun écran avec texte. Le titre « DATA CENTER » est posé par le code (système SIGN).
- **Variante souhaitée** : `data_center_campus_panne.png` (même cadrage) : voyants rouges, groupes électrogènes qui fument, ventilateurs arrêtés — affichée quand l'alimentation manque.
