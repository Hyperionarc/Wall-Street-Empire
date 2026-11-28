# Journal du responsable Intérieur du Mall

Domaine : ce qu'on voit et ce qu'on fait quand on ENTRE dans le Mall central (`mallOpen`, `mallRender`, `mallAct`, bloc « Intérieur du Mall » de `game.template.html`). Hors domaine : l'extérieur du Mall sur la carte (Guggenheim, enseigne, parking), l'économie (trafic, pôle, loyers), le port.

## Verdict de Rémy (point de départ)
« Comme l'usine ou les commerces, quand on rentre dans le mall, on doit avoir une espèce de grand hall commercial. […] À l'intérieur, on peut cliquer sur des boutiques disponibles et y mettre la sienne. Et puis voir aussi les boutiques des concurrents. »
Avant : une fenêtre de cartes (TOI, MEGA MART, DISCOUNTCO…, bouton « Ouvrir ma boutique près du mall ») et quatre sections de statistiques (capture `captures/mall_avant_cartes.jpg`). Ce n'était pas un lieu.

## Indicateurs (t122_mall_interieur)
| Indicateur | Mesure | État |
|---|---|---|
| On entre dans un lieu, pas dans une fenêtre de cartes | clic réel sur le Mall : canvas du hall ≥ 600×350 px, aucune carte `.aslot`, moins de 400 caractères de texte à l'entrée | atteint (1182×604 px, 153 caractères) |
| Les rivaux sont visibles | une cellule par rival vivant (8 au plus), enseigne à son nom et à sa couleur ; survol : caste, rayons (Base/Manuf./Luxe), part du marché, prix pratiqués, produit phare | atteint (5/5) |
| On choisit un emplacement libre et on s'installe | clic réel sur une cellule LIBRE → barre d'installation dans le hall (10 formats avec leur coût) → « Petit marché » : bâtiment posé sur la case de la cellule, coût débité (égal au prix affiché), cellule devenue la tienne, bonus du Mall actif | atteint (136 573 $ affichés = 136 573 $ débités) |
| Ta boutique est dans le hall | tes boutiques à moins de 6 cases du Mall occupent des cellules dorées ; clic = fiche du magasin | atteint |
| Fermeture | Échap, grande croix de 44 px | atteint |
| Vivant et léger | 10 à 68 visiteurs selon la fréquentation ; une image = 1 ms (agencement en cache) | atteint (65 visiteurs, 0,97 ms) |
| Sauvegarde intacte | mêmes clés `wse-city-v8` avant/après ; boutique rechargée et retrouvée dans le hall ; anciennes sauvegardes (mall 2×2) : t44 vert | atteint |

## Références consultées (principes, rien de copié)
Recherches publiques sur Westfield La Part-Dieu (rénovation MVRDV 2018-2021 : nouveaux escaliers mécaniques, niveaux repérés par couleur, installations sous la verrière), Dubai Mall (atriums « collecteurs sociaux » d'où l'on voit les boutiques des autres étages, lumière diffuse et filtrée, escaliers mécaniques et ascenseurs nombreux), Mall of America et grands centres européens. Aucune image téléchargée ni intégrée.
Principes retenus : atrium sous verrière, galerie haute en balcon avec garde-corps vitré d'où l'on voit l'étage du dessous, vitrines alignées en cellules de largeurs variées, sol clair et brillant, kiosque central, bancs et plantes, aire de restauration, grand écran, ascenseur vitré, ligne lumineuse colorée par niveau.
Conçu en propre : tout est dessiné par le code (isoP, quad, sbox, person : la grammaire des intérieurs de magasins et d'usines) ; enseignes écrites par le code (nom du rival, « LIBRE », ton format de boutique, commerce de quartier) ; aucune marque réelle, aucun logo, aucun texte dans une image.

## Ce qui est livré
- **Vue** (`#mallp.hall`, canvas `#mhcv`) : atrium isométrique de 22 × 12 cases, deux murs de fond, rez-de-chaussée + galerie haute (dalle, ligne lumineuse, garde-corps vitré), deux escaliers mécaniques animés (marches qui défilent, passagers), ascenseur vitré dont la cabine monte et descend, kiosque à auvent rayé et guirlande, rosace de marbre, bancs, jardinières, trois tables à parasols avec clients assis, mur végétal, grand écran animé (couleurs seulement), puits de lumière de la verrière, suspensions.
- **16 cellules** (8 en bas, 8 à la galerie) de largeurs variées, affectées sans aléa (`mhCells`) :
  1. tes boutiques posées à moins de `MALL_R` cases du Mall (celles installées depuis le hall gardent leur cellule pendant la session : `MH.pin`) ;
  2. un rival vivant par cellule (données de `mallData`, la même source que l'ancien panneau : parts cohérentes avec `S.mkt`) ;
  3. jusqu'à 3 commerces de quartier réels autour du Mall (`VV.list` : boulangerie, café, restaurant), en lecture ;
  4. les autres cellules = cases libres réelles près du Mall (`mhFreeTiles` : même règle que `mallSpot`, à ≤ 6 cases du bord, espacées d'au moins 2 cases) ; sans case libre, la cellule est « en travaux ».
- **Installer sa boutique** : clic sur une cellule LIBRE → barre en bas du hall (pas de fenêtre en plus) : formats Petit marché, Supermarché, Mode, Pharmacie, Luxe, Numérique, Maison, Sport, Brico, Concession (ceux que `toolLocked` autorise), avec le coût réel (construction × caste × inflation + terrain + défrichage + desserte) ; « Sur la carte » mène à la case avec l'outil petit marché (l'ancien parcours). Pose par `playerPlace` + `autoConnect` : aucune règle économique nouvelle.
- **Survol** : étiquettes courtes (rival : caste, rayons, part, prix ×, produit phare ; toi : case, distance, fréquentation ; libre : case, distance, coût d'un petit marché, fréquentation). Rien sur la chaîne d'approvisionnement des rivaux.
- **Pied du panneau** : Voir les produits · Aéroport · Importer depuis le port · Chiffres du marché (tiroir à droite avec la note pédagogique et les quatre sections d'avant : demande, qui vend quoi, plus demandés, pôle).
- **Caméra** : cadrage plein panneau, molette = zoom (×1 à ×2,6), glisser = déplacement ; sur téléphone le hall est cadré à la hauteur et se parcourt au doigt.
- **Ambiance** : nombre de visiteurs = 10 + 58 × activité, activité = fréquentation moyenne aux quatre bords du Mall (`trafficAt`) × (0,55 + 0,45 × taille de la ville) ; les visiteurs vont surtout vers les vitrines des rivaux à forte part et vers les tiennes, entrent dans les boutiques et ressortent avec un sac à la couleur de l'enseigne, s'assoient sur les bancs, prennent les escaliers mécaniques et changent de coursive par l'angle de la galerie.
- **Conseiller** : le jalon « Ouvre ta boutique près du mall » renvoie maintenant aux cellules LIBRE ; `mallAct('shop')` sélectionne la cellule libre la plus proche.
- **API de test** : `WSE.mall.hall` (cells, pts, sel, select, install, act, people, traffic, view, frame, tip).

## Captures (deviceScaleFactor 2, `docs/journal/captures/`)
- `mall_hall.jpg` (1280×800) : le hall à l'entrée. À gauche l'escalier mécanique double qui monte à la galerie devant le mur végétal, l'ascenseur vitré dans l'angle ; au mur de droite, au rez-de-chaussée : LIBRE, MEGA MART (orange), SUPERMARCHÉ (ta boutique, enseigne dorée), LIBRE, DISCOUNTCO (bleu), LIBRE, LIBRE ; à la galerie : LIBRE, NOVATEK LABS (violet), LIBRE, CAFÉ DE QUARTIER, LUXOR & FILS (rose), LIBRE ; au mur de gauche : BOULANGERIE en bas, ATLAS PROMOTION (rouge) et RESTAURANT EN TERRASSE en haut, grand écran. Au centre le kiosque rayé sur sa rosace, les parasols, ≈ 65 visiteurs. Chaque cellule libre porte un « + » orange qui respire et un liseré pointillé.
- `mall_survol_rival.jpg` : étiquette de Mega Mart (exploitant agricole, Base · Manuf., part 6 %, prix ×0,97 / ×1,01, 3 % moins cher que toi, produit phare).
- `mall_cellule_libre.jpg` : cellule libre sélectionnée (cadre orange) et barre d'installation : dix formats avec leur prix (Petit marché 136 581 $ … Concession), « Sur la carte », croix.
- `mall_boutique_installee.jpg` : après « Boutique de mode » : la cellule devient BOUTIQUE DE MODE, enseigne dorée, rayons colorés ; le bandeau passe à « 2 boutiques à toi · 6 cellules libres » et la trésorerie a baissé du prix affiché.
- `mall_mobile.jpg`, `mall_mobile_libre.jpg` (390×844) : le hall cadré à la hauteur (on glisse pour voir le reste), barre d'installation sous le hall, pied à 4 boutons de 44 px.
- `mall_avant_cartes.jpg` : l'ancienne fenêtre de cartes, pour comparaison.

## Tests
- Nouveau `t122_mall_interieur` : 20 contrôles (ouverture au clic réel, 16 cellules sur deux niveaux, rivaux, ta cellule, cellules libres réelles, visiteurs, peu de texte, survol, barre d'installation sans pop-up, coût débité = prix affiché, déterminisme, clic sur ta cellule = fiche, Échap, croix, tiroir, sauvegarde/rechargement sans clé ajoutée, 1 ms par image, mobile, aucune erreur).
- Adaptés (changement volontaire de l'interface) : `t44_mall` (les chiffres sont lus après ouverture du tiroir ; « Ouvrir ma boutique » = cellule libre puis « Sur la carte » ; le contrôle des boutons vise produits/port/tiroir + présence de cellules libres) ; `t94_aeroport_interaction` (contrôle du Mall : grand hall avec rivaux et cellules libres visibles au lieu des cartes `.mconc`).
- Lancés un par un après le lot : t122 20/20, t44 45/45, t94 24/24, t01 7/7, t05 6/6, t96 19/19, t98 30/30, t53 26/26, t52 20/20, t50 20/20, t46 21/21, t61 24/24, t77 18/18, t64 28/28, t87 18/18.
- Échecs étrangers au Mall : t45 (`M.Pg is not a function` : `multiplayer.js` remplace `WSE.mp` du pouvoir de marché ; fichier non modifié ici, domaine Architecture/multijoueur), t26 (deux récaps macro/événement, déjà signalés en échec sur la branche de départ dans `journal/interface.md`).
- Partie en marche (vitesse 3, 10 jours, hall ouvert) : aucune erreur, 2,7 ms par image du hall, 67 visiteurs ; l'agencement (mallData) est recalculé au plus deux fois par seconde quand le HUD se rafraîchit.

## Ce qui reste imparfait / à décider
- **Nombre de cellules** : le jeu ne connaît pas de « cellules » à l'intérieur du Mall : une boutique se pose sur une case de la ville près du Mall. Le hall en montre 16 ; au-delà de 8 boutiques à toi près du Mall, les suivantes ne sont comptées que dans le bandeau (« N boutiques à toi »). Les cellules libres sont les 16 − (toi + rivaux + ville) cases libres les plus proches ; il y en a beaucoup plus autour du Mall.
- **Rivaux** : leur présence au Mall est celle du marché (parts par rayon), pas un bâtiment posé : une cellule par rival, quelle que soit sa taille. Une cellule plus large pour un rival dominant serait possible ; non fait pour ne pas laisser croire à une surface réelle.
- **Pas de loyer** : le jeu n'a pas de loyer de cellule pour un commerce (on achète le terrain) ; le survol affiche donc le coût d'installation terrain compris et la fréquentation, pas un loyer.
- La cellule choisie pour une boutique installée depuis le hall n'est pas sauvegardée (pour ne pas ajouter de clé) : après rechargement, ta boutique reprend une cellule « à toi » selon l'ordre fixe.
- Escaliers mécaniques et ascenseur : décor animé, pas de parcours entre étages ; quelques visiteurs peuvent frôler une jardinière.
- Pas de version nuit / éclairage selon l'heure.
