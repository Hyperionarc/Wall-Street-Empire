# Wall Street Empire — prototype jouable (V0.7)

Carte isométrique de 96×96 cases (une case ≈ 150 m) : une grande ville de gratte-ciel, une campagne presque sans routes avec de rares gisements,
la mer à l'est, un port et sa zone industrielle, le tout jouable dans le navigateur (téléphone ou ordinateur).
Ouvrir `city.html` : un seul fichier, sans serveur, sprites inclus.

## La carte

| Zone | Rôle |
|---|---|
| **Ville** (centre-ouest) | Ville existante : environ 300 immeubles (bureaux et résidences), de 3 à 24 étages, avec deux tours-repères de plus de 30 étages. Environ 10 000 habitants. Grille d'avenues aérée (une tous les 6 cases, blocs de 5×5). Le promoteur y construit logements, commerces, Tour Tech et Banque |
| **Campagne** | Presque aucune route : une autoroute ville-port et quelques départementales. Les gisements y sont rares (11 amas). Puits et mines se posent dessus |
| **Zone du port** (est, à 6-9 km de la ville) | Pré-zone industrielle quadrillée : usines et fonderie d'or |
| **Quai et mer** | Terminal portuaire (grues, conteneurs, navire à quai). Navires animés en mer |

Les rues de la ville et du port appartiennent à la mairie : elles sont gratuites et on ne peut pas les modifier.
Les mines et puits fonctionnent sans route à **65 %** ; reliés au réseau public par tes propres routes de campagne (outils Route ou Relier, 120 $ le tronçon, 0,4 $ par jour d'entretien), ils atteignent **100 %**.

## Forêts et BTP (bâtiment et travaux publics)

**Forêts** : de grands massifs en campagne, qui **repoussent lentement** (8 unités de bois par jour et par case). Un **camp de bûcherons** se pose sur une case de forêt et produit du **bois** ;
comme une mine, il tourne à 65 % sans route et à 100 % une fois relié au réseau. Le bois donne des **planches**, des **montants d'ossature bois** et des **panneaux OSB**.
Produits en bois : jouets en bois, chaise, lit.

**Carrières** (catégorie BTP) : gravier, sable (surtout près de la côte) et calcaire, des gisements plus fréquents que les métaux.
**Ciment** = calcaire + charbon (usine moyenne) ; **béton** = ciment + sable + gravier (petite usine).

**Vente de maisons** : maison à ossature bois (montants, OSB, béton, planches, acier) et maison en béton. Ce sont des produits de la classe *Immobilier*, vendus par des **agences immobilières** en ville.
Chaque maison vendue ajoute 4 places de logement, et 8 maisons font apparaître un petit immeuble supplémentaire en ville.

**Chantiers pour les entreprises** : une **entreprise de BTP** (en ville) permet d'accepter des appels d'offres (entrepôt, résidence, immeuble de bureaux, tour de 20 étages).
Chaque chantier réclame des matériaux (béton, acier, OSB, planches, montants), une échéance et rapporte une somme à la livraison (pénalité de 10 % si abandon ou retard).
L'immeuble livré **apparaît dans la ville**, qui s'agrandit (plus d'emplois ou de logements).

## Vue intérieure d'un bâtiment (V0.7)

Avec l'outil **Main**, un clic sur un de tes bâtiments ouvre sa vue intérieure : indicateurs (production, utilisation, effectif, recettes, coûts, profit), schéma intrants, atelier, sorties, bannière de **goulot** (pénurie d'un intrant, stock plein, hors réseau, manque de personnel, demande, capacité) avec action rapide, et leviers : agrandir, recruter, salaires (attractivité contre coût), qualité, efficacité, relier au réseau, réaffecter la recette d'une usine (réorganiser la chaîne), démolir.
La vue a quatre onglets : **Intérieur** (scène animée selon le bâtiment : caisse humaine et libre-service avec clients dans les magasins, bûcherons et camion en forêt, mineurs, pompes à pétrole, chaîne de production avec voyant rouge en cas de goulot, bureaux), **Compte de résultat**, **Bilan** et **Flux de trésorerie** du bâtiment (amortissement sur 1 500 jours, rendement, retour sur investissement).
Dans les magasins, le cinquième onglet **Publicité** permet de relier la télévision, la radio et internet avec un budget quotidien par canal. La notoriété du magasin monte progressivement (et retombe si on coupe), attire plus de clients et réduit la part des rivaux ; le coût apparaît dans le compte de résultat. Les magasins s'affichent en vue isométrique (rayons en 3D, caisses à tapis fixe, caisses libre-service, clients avec paniers et chariots, employés qui remplissent les rayons).
Chaque magasin choisit ses **marchandises vendues** (génériques et produits lancés). Quand le stock du joueur est vide, le **port importe** les biens de base au prix du marché moins 15 % (moins cher avec tes terminaux portuaires), ce qui permet de démarrer par le commerce ; la rupture de stock est signalée comme goulot. Trois **concurrents IA** (Mega Mart, Luxor & Fils, DiscountCo) investissent selon leurs ventes, peuvent faire faillite ou être rachetés ; leurs parts de marché apparaissent dans le panneau Ville.
Chaque magasin fixe son **prix de vente** (70 à 140 % du marché : bas, il attire plus de clients ; haut, il gagne plus par vente). À partir de 250 000 $ de capitalisation, tu peux **entrer en bourse** (30 % du capital cédé, levée de fonds, dividendes réglables, cours de l'action, rachat de capital).
Le bouton **Menu** ouvre un panneau à onglets (Ville, Marché, Concurrents, Finances, Bourse, Partie). Le zoom a **5 niveaux** pilotés par une loupe avec − et + (molette et pincement aussi) : du plan rapproché jusqu'à une **vue satellite** de toute la carte, où les bâtiments sont extrudés en blocs. L'onglet **Bourse** liste les sociétés cotées (ta société, Mega Mart, Luxor & Fils, DiscountCo) avec cours et courbes, ta propre mise en bourse, puis les cours des matières premières ; l'onglet **Concurrents** détaille chaque société (parts par catégorie, trésorerie, rachat). Le **Siège social** (un seul) accueille un directeur financier (dividendes, rachats d'actions par 5 %, crédit moins cher) et un directeur des relations investisseurs (événements boursiers : communiqué, journée investisseurs, plan de rachat) ; l'introduction en bourse exige un siège.
Dans chaque usine, la carte **Que fabriquer ici ?** propose une recette : composants (acier, planches, montants, béton...) et produits finis, avec pastilles de disponibilité des intrants, marge par cycle, proposition automatique et lancement de la R&D d'un produit directement depuis l'usine.
L'intérieur d'une usine est un **atelier animé selon la recette** : scie circulaire et sciure pour les planches, scies multiples pour les montants d'ossature, presse hydraulique pour les panneaux OSB, four pour l'acier, bobineuse pour les câbles, réacteur pour le plastique, four rotatif pour le ciment, malaxeur pour le béton, plieuse d'emballages, et bras robotisé qui assemble le produit fini (image du produit en cours de fabrication). Une vitrine à droite montre le produit et son stock de sortie. Les illustrations sont dessinées dans le jeu (aucune photo externe).
La ville existante a un **Manhattan** central (tours de 20 à 66 étages), des immeubles moyens autour, puis de petits immeubles et des **maisons** en périphérie. Dans une usine, le gros bouton **Choisir la production** ouvre un **catalogue** inspiré de Capitalism : liste des composants et produits (cours, marge), fiche détaillée avec intrants, emballages, chaîne d'approvisionnement jusqu'aux matières premières, points de vente, et lancement de la R&D pour les produits nouveaux.
**Tableau de bord Empire** (Menu, premier onglet, ou clic sur la capitalisation) : cours de ton action, bilan consolidé, compte de résultat du jour, production et stocks de chaque bien, tes meilleurs et pires bâtiments. Dans chaque bâtiment : onglet **Logistique** (silos d'entrée et de sortie, autonomie en jours, fournisseurs et débouchés, camions, pertes) et onglet **Effectifs** (répartition de l'effectif entre production, achats, stock et ventes, avec formation par service). Menu, onglet **Recherche** : arbre de 15 technologies en 3 ères. Des **événements** (grève, krach, incendie, boom...) demandent une décision tous les 20 à 35 jours.
Un magasin présente un nombre limité de produits selon sa taille : **4 emplacements** (petit marché, agence), **8** (supermarché), **12** (hypermarché) ; un bandeau d'emplacements avec photo, prix, stock et ventes permet de choisir le produit de chaque rayon (remplissage automatique possible). Le **Guide du fabricant** (Menu > Guide) montre, comme dans Capitalism Lab, les entrées d'un produit, la qualité, et en mode SORTIES où il est utilisé ; l'onglet **Produits** du Menu compare prix, qualité et notoriété au marché avec la part de marché.
La **note produit** pondère prix, qualité et marque selon la catégorie (base 45/30/25, manufacturés 33/40/27, luxe 15/35/50, immobilier 40/45/15 ; poids visibles dans Menu > Produits). Une **conjoncture** (PIB, inflation, taux, indice des prix) suit un cycle : elle module la demande, les salaires, loyers et prix, le coût des emprunts et la prime boursière. L'**Entrepôt** (zone du port) ajoute 200 unités de stock par bien ; le surplus est vendu aux concurrents à 78 % du cours.
L'**Entrepôt** stocke les biens hors des usines (surplus mis de côté, restitués quand les producteurs baissent), importe par le port jusqu'à un niveau cible, exporte au-dessus d'un seuil ; frais de stockage quotidiens. La **vue d'ensemble de la chaîne** (Menu > Chaîne) montre extraction, transformation, entrepôts et distribution avec flux animés, efficacité, nœuds actifs, goulots quantifiés et délai moyen, avec accès direct aux bâtiments en alerte (inspirée du « Supply Chain Engine » du pitch).
Le **terminal financier** (Menu > Bourse) reprend le pitch : Global Trading Index en chandeliers avec volumes, carnet d'ordres (écart et profondeur) pour acheter ou vendre des actions des sociétés rivales, quatre indices sectoriels (pétrole, or, tech, commerce de détail), portefeuille avec gains, et **actions financières** : OPA hostile (20 % du capital minimum, prime de 35 %, chances selon la participation, la cible devient une filiale rentable), cartel sur une matière première (+18 % du cours cible pendant 20 jours) et embargo sur un rival (son attractivité est divisée par deux pendant 6 jours).
Le **Menu** est un vrai bureau du PDG en grand format : barre de navigation latérale groupée (Mon entreprise, Marchés, Stratégie, Monde), bandeau permanent de trésorerie, capitalisation, résultat et date, **conseiller** qui signale les priorités (trésorerie, goulots, chômage, points de connaissance...), listes triables. L'onglet **Objectifs** regroupe objectif de partie (bac à sable, course à la fortune, monopole), score, classement des empires et compétences du PDG.
Les **usines** (petite, moyenne, grande), l'**entrepôt** et la **fonderie** sont désormais dessinés procéduralement en isométrique (halls à toits en dents de scie, cheminées qui fument quand la production tourne, silos, tour de refroidissement, portes de quai, conteneurs, four incandescent) avec des variantes de couleurs ; les tours reçoivent des **toits variés** (antennes, réservoirs, climatiseurs, couronnes et flèches pour les plus hautes).
**Agriculture** : fermes de blé, plantations de canne à sucre, de coton et d'hévéas sur des terres agricoles (rendement lié au sol et au climat, sol qui se renouvelle) ; farine, tissu, pneus ; pain, biscuits, bonbons, T-shirts, jeans, baskets, pneus automobiles, matelas. **Analyse d'emplacement** : avant de construire, une fiche affiche coût du terrain, fréquentation (calque de chaleur) et concurrence pour un commerce ; distance de transport, perte de rendement, coût sur un an et meilleur emplacement proche (★) pour une usine ; bouton Calque pour la valeur du terrain. Les **maisons** sont dessinées procéduralement (toits à deux pans, piscines, arbres).
Le centre-ville mélange des **tours procédurales** (verre bleu, vert ou sombre à reflets, pierre, brique, art déco à retraits successifs) et les sprites d'origine, avec des **parcs** (allées, fontaines, arbres) dans les blocs.
Une **ferme** occupe un grand champ clôturé de 3 × 4 cases (12 cases) avec, d'un côté, un hangar rouge, un silo et deux tracteurs dont un qui travaille dans les rangs ; les anciennes fermes d'une case d'une sauvegarde précédente sont à reconstruire. Les **fermes** se posent sur n'importe quelle terre de campagne ; dans la vue du bâtiment on choisit la culture (blé, canne, coton, hévéas, 400 $ pour en changer), on voit la **fertilité** de la parcelle (sol, climat, proximité de l'eau) et on peut **irriguer** (3 niveaux, +10 % de rendement chacun, protège de la sécheresse du cycle climatique).
Au démarrage, on choisit sa **caste** (portrait et couleur propres) : Baron industriel, Promoteur BTP, Banquier d'affaires, Magnat de l'énergie ou Tycoon, avec bonus et coûts différents (changeable dans Menu > Partie). L'outil **Racheter** (Ville) rase un immeuble de la ville existante pour reconstruire à la place (la population et l'emploi baissent), des **promoteurs IA** rénovent des îlots en hauteur, et la **centrale électrique** transforme le charbon en revenus.
Capital de départ **1 M$** (paliers recalibrés : Entrepreneur 1,25 M, Industriel 3,5 M, Magnat 12,5 M, Oligarque 35 M). Les portraits du Baron industriel et du Promoteur BTP sont des illustrations générées par IA fournies par le créateur (`assets/portraits/`, nom du fichier = identifiant de la caste ; les autres castes gardent un dessin vectoriel en attendant). Chaque caste a une **fiche détaillée** (clic sur sa carte) : grand portrait, avantages, bâtiments clés avec leurs coûts, arbre technologique propre à la caste (3 technologies par ère) et technologies communes. Six castes : Baron industriel (usines, rachats, OPA), Promoteur BTP, Banquier d'affaires, Négociant en matières (maison de négoce type Zurich-Genève : cartels, embargos, exports, énergie), Exploitant agricole (simulation de ferme) et Innovateur tech (centres de R&D, brevets, data centers qui louent du calcul et boostent toute l'entreprise par l'IA). Le **banquier** gère une banque de 100 M$ de ressources propres (20 % tradables), prête sur collatéral avec un levier qui passe de ×5 (20 % de fonds propres) à ×10 (monopole) puis ×20 (mania, 5 %), avec des pertes croissantes, surtout en récession. Les **pipelines** (tube raccordé à la zone du port ou à une centrale) divisent par 5 le transport du pétrole et du charbon et remplacent les camions.
La ville comporte des **bâtiments publics** : deux stades avec projecteurs, hôtel de ville à dôme, tour de télécommunications, hôpital (croix rouge, héliport), commissariat (gyrophare), caserne de pompiers, collège, lycée à horloge, école maternelle et crèche avec aire de jeux. Chaque type de service présent améliore l'humeur des habitants (jusqu'à environ +13 en tout). Test de performance : mettre en cache l'image des tours n'accélère pas le rendu logiciel de mon navigateur de test (le coût vient du remplissage de pixels, pas du nombre d'appels) : abandonné.
Un **tutoriel de départ** en 5 étapes s'affiche dans le Conseiller (exploitation, usine, production, commerce, premier résultat positif). La fréquentation d'un commerce augmente près des écoles, crèches, hôpital et mairie. Le banquier ne peut trader que 20 % de ses ressources propres.
Dans l'onglet **Achats** d'une usine (comme dans Capitalism), chaque intrant liste les fournisseurs : ton réseau local, cinq sociétés productrices (qualité, prix, distance, frais de transport, prix livré) et l'import par le port, plus cher que le local. Le surplus d'un bien au-delà de la moitié de la capacité de stockage est exporté chaque jour. Avant : sélecteur de fournisseur de l'onglet Logistique : **Auto** (stock local puis import par le port si le stock manque), **Local uniquement** ou **Port** (import systématique, prix du marché ×1,12 plus fret selon la distance, moins cher avec tes terminaux portuaires). Une usine ne dépend donc plus seulement de ce que tu produis.
**Politique de gestion** (Menu > Finances), inspirée des politiques du COO de Capitalism Lab : curseur marge ↔ parts de marché appliqué à tous les magasins (±8 % sur les prix, effet sur l'attrait), alertes de stock bas. Le surplus de composants se vend aux rivaux à meilleur prix qu'à l'export brut.
Le compte de résultat est par bâtiment (prix de cession au prix du marché) et global (panneau Ville : ventes, exports, salaires, entretien, transport, publicité, intérêts, impôt sur les sociétés) avec emprunt et remboursement (plafond 50 % de la valeur nette).

## Chaîne de production

```
Gisements ─▶ Puits / Mines ─▶ matières premières ─▶ Fonderie / Usines (zone du port) ─▶ composants ─▶ produit fini + emballage ─▶ Commerces (ville) ─▶ Habitants
```

| Niveau | Bâtiments |
|---|---|
| Extraction | Puits de pétrole, mines de fer, de charbon, de cuivre, d'or |
| Fonderie | Fonderie d'or : or brut ➜ lingots (zone du port) |
| Usines | Petite (1×1), Moyenne (2×1), Grande (2×2), toutes dans la zone du port. Chacune fabrique un composant ou un produit affecté, sinon une marchandise générique |
| Commerces | Petit marché (1×1), Supermarché (2×1), Hypermarché (2×2), en ville : chacun ne vend que ses catégories |
| Port | Terminal portuaire (2×2, sur le quai) : relève le prix d'export des surplus et le plafond de stock |
| Ville | Logements (étages), Tour Tech, Banque |

**Composants** (14) : acier, planches, montants, OSB, ciment, béton, plastique, câbles de cuivre, emballages ; moteurs, batteries, cartes électroniques, boîtiers en or ; écrans.
27 marchandises au total, avec des prix qui varient selon l'offre et la demande.

**Fiche produit** (vue Produits) : visuel du produit, gamme (Premier prix, Premium, Haut de gamme), emballage (vrac, carton, coffret premium), éléments nécessaires,
caractéristiques, arbre de la chaîne d'approvisionnement avec les maillons manquants, configuration automatique.
12 produits : ustensiles, jouets en plastique, jouets en bois, chaise, vélo, lit, lave-linge, téléviseur, smartphone, montre de luxe, maison à ossature bois, maison en béton.
Les habitants répartissent leur demande entre la marchandise générique, tes produits et des marques rivales, selon qualité, prix, emballage et notoriété.

**Économie** : la ville emploie déjà la majorité de ses actifs ; tes entreprises recrutent le reste (au-delà, la main-d'œuvre manque). Humeur, impôt réglable, banque qui dope les entreprises,
amélioration des bâtiments, événements (goulots, boom boursier). Saison fixée à l'été.
Paliers (sur la capitalisation) : Citoyen, Entrepreneur (250 k$), Industriel (700 k$), Magnat (2,5 M$), Oligarque (7 M$), avec une vingtaine de missions.

## Commandes

| Action | Tactile | Souris / clavier |
|---|---|---|
| Construire | choisir une catégorie puis un outil, toucher une case | clic |
| Route de desserte (campagne) | catégorie Extraction, outil Route, glisser en ligne droite ; ou outil Relier sur une mine | clic maintenu |
| Déplacer la vue | outil Main, glisser ; ou toucher la minimap | glisser, clic droit, flèches |
| Inspecter | outil Main, toucher une case | clic (outil Main) |
| Zoom | deux doigts, boutons + et − | molette |
| Raccourcis | | 1 à 9 pour les outils, Échap pour la main |

## Fichiers

| Fichier | Rôle |
|---|---|
| `city.html` | le jeu complet, généré (atlas de sprites intégré) |
| `game.template.html` | source du jeu (à modifier) |
| `tools/build.py` | assemble l'atlas à partir de `assets/src/` et génère `city.html` |
| `assets/` | sprites sources (CC0), atlas généré, `CREDITS.md` |

Pour régénérer : `python3 wall-street-empire/tools/build.py` (nécessite Python 3 et Pillow).
Les visuels des produits, la mer, le port, les grues et les navires sont dessinés dans le code (pas des photos).

## Vérifications

- Chaîne du lave-linge testée en navigateur : composants (acier, plastique, câbles, emballages, moteurs, cartes électroniques) puis produit fini.
- Zones : logements et commerces refusés hors de la ville, usines refusées hors de la zone du port, terminal refusé hors du quai ; une mine rurale passe de 65 % à 100 % une fois reliée.
- Un joueur automatique tient 600 jours sans valeur aberrante.

## Limites connues et pistes

- Un seul joueur contre l'économie : pas encore de multijoueur (cartel, Conseil, OPA du pitch).
- Les rivaux sont une pression abstraite par catégorie, pas des entreprises simulées.
- Les prix et rendements sont des premières valeurs, pas un équilibrage final.
- Le rendu reste stylisé (sprites Kenney) : pas de rendu photoréaliste.
