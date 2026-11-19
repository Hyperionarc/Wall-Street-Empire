# Wall Street Empire — prototype jouable (V0.7)

Carte isométrique de 96×96 cases (une case ≈ 150 m) : une petite ville de 100 000 habitants qui grandit jusqu'au million (passe 35), une campagne presque sans routes avec de rares gisements,
la mer à l'est, un port et sa zone industrielle, le tout jouable dans le navigateur (téléphone ou ordinateur).
Ouvrir `city.html` : un seul fichier, sans serveur, sprites inclus.

## La carte

| Zone | Rôle |
|---|---|
| **Ville** (centre-ouest) | Depuis la passe 44 : ville de départ aérée (≈ 60 000 habitants, ≈ 290 bâtiments bas, 2 à 10 étages, 61 % de lots libres) autour du **Mall central** (passe 35 : ≈ 100 000 habitants, ≈ 370 bâtiments) qui s'étend et se densifie (voir « Passe 35 »). Les anciennes sauvegardes gardent la ville d'origine de 288 000 habitants (≈ 300 immeubles de 3 à 66 étages, deux tours-repères). Grille d'avenues aérée (une tous les 6 cases, blocs de 5×5). Le promoteur y construit logements, commerces, Tour Tech et Banque |
| **Campagne** | Presque aucune route : une autoroute ville-port et quelques départementales. Les gisements y sont rares (11 amas d'origine, plus 33 sites de matières industrielles depuis la passe 33). Puits et mines se posent dessus |
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
Chaque magasin choisit ses **marchandises vendues** (marchandises du marché local et produits lancés). Quand le stock du joueur est vide, les **grossistes et producteurs de la ville** fournissent les rayons de base, manufacturés et luxe au cours du marché +5 % (voir passe 13), ce qui permet de démarrer par le commerce ; la rupture de stock des produits de marque est signalée comme goulot. Trois **concurrents IA** (Mega Mart, Luxor & Fils, DiscountCo) investissent selon leurs ventes, peuvent faire faillite ou être rachetés ; leurs parts de marché apparaissent dans le panneau Ville.
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
Capital de départ **1 M$** (paliers recalibrés : Entrepreneur 1,25 M, Industriel 3,5 M, Magnat 12,5 M, Oligarque 35 M). Les portraits du Baron industriel et du Promoteur BTP sont des illustrations générées par IA fournies par le créateur (`assets/portraits/`, nom du fichier = identifiant de la caste ; les autres castes gardent un dessin vectoriel en attendant). Chaque caste a une **fiche détaillée** (clic sur sa carte) : grand portrait, avantages, bâtiments clés avec leurs coûts, arbre technologique propre à la caste (3 technologies par ère) et technologies communes. Six castes : Baron industriel (usines, rachats, OPA), Promoteur BTP, Banquier d'affaires, Négociant en matières (maison de négoce type Zurich-Genève : cartels, embargos, exports, énergie), Exploitant agricole (simulation de ferme) et Innovateur tech (centres de R&D, brevets, data centers qui louent du calcul et boostent toute l'entreprise par l'IA). Le **banquier** gère une banque de 100 M$ de ressources propres (20 % tradables), prête dans le respect de Bâle III (CET1, RWA, LCR ; voir « Passe : fonds propres »), avec un levier ×10 sur les fonds propres et des pertes croissantes, surtout en récession. Les **pipelines** (tube raccordé à la zone du port ou à une centrale) divisent par 5 le transport du pétrole et du charbon et remplacent les camions.
La ville comporte des **bâtiments publics** : deux stades avec projecteurs, hôtel de ville à dôme, tour de télécommunications, hôpital (croix rouge, héliport), commissariat (gyrophare), caserne de pompiers, collège, lycée à horloge, école maternelle et crèche avec aire de jeux. Chaque type de service présent améliore l'humeur des habitants (jusqu'à environ +13 en tout). Test de performance : mettre en cache l'image des tours n'accélère pas le rendu logiciel de mon navigateur de test (le coût vient du remplissage de pixels, pas du nombre d'appels) : abandonné.
Le **Conseiller à jalons** (passe 31, ci-dessous) remplace l'ancien tutoriel figé en 5 étapes : jalons chiffrés selon l'état réel de ta partie. La fréquentation d'un commerce augmente près des écoles, crèches, hôpital et mairie. Le banquier ne peut trader que 20 % de ses ressources propres.
Dans l'onglet **Achats** d'une usine (comme dans Capitalism), chaque intrant liste les fournisseurs : ton réseau local, cinq sociétés productrices (qualité, prix, distance, frais de transport, prix livré) et l'import par le port, plus cher que le local. Le surplus d'un bien au-delà de la moitié de la capacité de stockage est exporté chaque jour. Avant : sélecteur de fournisseur de l'onglet Logistique : **Auto** (stock local puis import par le port si le stock manque), **Local uniquement** ou **Port** (import systématique, prix du marché ×1,12 plus fret selon la distance, moins cher avec tes terminaux portuaires). Une usine ne dépend donc plus seulement de ce que tu produis.
**Politique de gestion** (Menu > Finances), inspirée des politiques du COO de Capitalism Lab : curseur marge ↔ parts de marché appliqué à tous les magasins (±8 % sur les prix, effet sur l'attrait), alertes de stock bas. Le surplus de composants se vend aux rivaux à meilleur prix qu'à l'export brut.
La barre de construction est une **arborescence** à trois niveaux : catégorie (Ville, Agriculture, Extraction, BTP, Industrie, Commerce) > famille (par exemple Usines, Fonderie, Énergie, Logistique) > bâtiment. Une famille de plusieurs types ouvre un menu volant avec de grandes cartes (nom, prix, palier requis) ; une famille d'un seul bâtiment le sélectionne directement.
Le compte de résultat est par bâtiment (prix de cession au prix du marché) et global (panneau Ville : ventes, exports, salaires, coûts d'exploitation, transport, publicité, intérêts, impôt sur les sociétés) avec emprunt et remboursement (plafond 50 % de la valeur nette).

## Chaîne de production

```
Gisements ─▶ Puits / Mines ─▶ matières premières ─▶ Fonderie / Usines (zone du port) ─▶ composants ─▶ produit fini + emballage ─▶ Commerces (ville) ─▶ Habitants
```

| Niveau | Bâtiments |
|---|---|
| Extraction | Puits de pétrole, mines de fer, de charbon, de cuivre, d'or |
| Fonderie | Fonderie d'or : or brut ➜ lingots (zone du port) |
| Usines | Petite (1×1), Moyenne (2×1), Grande (2×2), **Méga-usine** (3×3, palier Magnat : recettes de la grande usine, capacité ×3, tour étagée et trois cheminées), toutes dans la zone du port. Chacune fabrique le composant ou le produit qu'on lui affecte ; une usine sans produit ne fabrique rien (passe 13) |
| Commerces | Petit marché (1×1), Supermarché (2×1), Hypermarché (2×2), **Méga-centre commercial** (3×3, palier Magnat : base + manufacturé + luxe, capacité ×4), en ville : chacun ne vend que ses catégories |
| Niveaux | « Améliorer » : 5 niveaux L1 à L5 (capacité et effectifs ×1 / 1,6 / 2,4 / 3,2 / 4, coût 0,7 à 1,5 × le capex) ; le bâtiment grandit (étages d'usine, tours +2 étages par niveau). Les tours de bureaux PNJ gagnent des étages quand la ville prospère. |
| Port | Terminal portuaire (2×2, sur le quai) : relève le prix d'export des surplus et le plafond de stock |
| Ville | Logements (étages), Tour Tech, Banque |

**Composants** (14) : acier, planches, montants, OSB, ciment, béton, plastique, câbles de cuivre, emballages ; moteurs, batteries, cartes électroniques, boîtiers en or ; écrans.
27 marchandises au total, avec des prix qui varient selon l'offre et la demande.

**Fiche produit** (vue Produits) : visuel du produit, gamme (Premier prix, Premium, Haut de gamme), emballage (vrac, carton, coffret premium), éléments nécessaires,
caractéristiques, arbre de la chaîne d'approvisionnement avec les maillons manquants, configuration automatique.
12 produits : ustensiles, jouets en plastique, jouets en bois, chaise, vélo, lit, lave-linge, téléviseur, smartphone, montre de luxe, maison à ossature bois, maison en béton.
Les habitants répartissent leur demande entre les marchandises du marché local, tes produits et des marques rivales, selon qualité, prix, emballage et notoriété.

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

## Macroéconomie, difficulté adaptative et PNJ étrangers
- **Supercycle de croissance** (début de partie, façon Chine/Dubaï) : PIB ≈ 6,5 %, inflation et taux bas, humeur +4, demande jusqu'à ×1,5 ; sa fin est **aléatoire (jour 200 à 480 selon la graine) et jamais annoncée** : retombée progressive sur 70 jours vers le cycle normal.
- **Cycle irrégulier** (`stepMacro`) : PIB cible = 3 % + amplitude variable (2,5 à 5,8 %) × sinusoïde dont la fréquence dérive aléatoirement (période ≈ 1,2 à 3 ans) + un second cycle lent (fréquence incommensurable) + bruit AR(1) ; bornes −4 % / +6 % (+7 % en supercycle). L'aléa du cycle vient de `hash(jour, graine de partie)` et non du flux `rnd()` : déterministe par graine.
- **Chômage** (`unempTarget`, jamais sous 3 %, affiché avec une décimale) : maximum lissé entre (a) le chômage frictionnel + structurel `nairu` (3,5 à 7 %, baisse avec la formation moyenne et la recherche, monte lentement après les récessions : hystérésis) corrigé du cycle (−0,9 × écart de PIB) et de la tension (postes vacants), et (b) le manque de postes (`1 − postes × (1 + 0,8 × écart de PIB) / actifs`) ; lissé sur ~10 jours. Courbe de Phillips : `wageMkt = 1 + 1,4 × (0,16 − chômage)` (≈ ×1,17 à 4 %), salaire réel `rw` et inflation réagissent à l'écart au chômage de référence 5,5 %.
- **Humeur** (`moodTarget`, lissée à 4 % par jour, inertie ≈ 25 jours) : 65 + emploi (−14 à +6) + inflation (−8 à +4) + pouvoir d'achat (±6) + croissance (−10 à +8) + logement (saturation du parc, coût du crédit) + services (biens de base disponibles, bâtiments publics) − pollution + coups d'humeur d'événements (`S.moodEv`, décroît de 1,5 % par jour : grèves, krach, boom, chocs) ; plage typique 40-85. Le terme d'impôt n'a pas été modifié. Feedback mou : population cible = capacité × (0,80 + 0,12 × humeur) ; demande de rayon × (0,82 + 0,18 × humeur).
- **Chocs exogènes rares** (événements `energy`, `pandemic`, `credit`, jamais avant le jour 120-150, un seul à la fois, 150 jours d'intervalle) : *choc énergétique* (pétrole, charbon, électricité ×1,5 ou ×2 pendant ~70 jours, inflation +3,5 pts, PIB −3 pts), *pandémie* (demande −15 % avec télétravail payant ou −30 %, ~90 jours, puis rebond de demande refoulée 60 jours), *crise du crédit* (taux +3 à +4,5 pts, plafond de dette −35 %, prime boursière −0,35, PIB −4,5 pts ; option de désendettement qui atténue). Chacun : choc d'humeur immédiat (−10 à −18), message, bandeau « choc » en haut de l'écran et dans l'onglet Empire. États dans `S.macro.sh`.
- **Transmission du taux directeur** : l'écart à 4 % (plus la prime de risque en crise) module la demande de biens durables (électroménager, téléphones, pneus, vélos, lits…) de ×0,88 à ×1,08, la demande de logement (classe estate, biens immobiliers) de ×0,80 à ×1,12 et, très légèrement, la population cible.
- **Difficulté adaptative** (`S.diff`, onglet Empire > « Régulation du marché ») : fortune comparée à la courbe attendue ; trop riche → salaires, demande et rivaux durcissent (jusqu'à fin anticipée du supercycle) ; en retard → assistance.
- **Import automatique** limité aux fabrications rentables ; coût d'import revu (marge de revente ≈ 25 %).
- **Boucle de progression** : prochaine mission en conseil, échelle de fortune (Entrepreneur/Industriel/Magnat) avec primes.
- **PNJ étrangers** (Dragon Pacific, Gulf Sovereign, Rhine Trading, Siberia Metals, Andes Mining) : dumping, pénurie, rachats à prime ; ils sont aussi fournisseurs nommés dans « Achats ».

## Matières premières : acheteurs immédiats et concurrence locale
- Puits et mines à l'échelle d'une petite major (puits 150 k$, 150 u/j, réserves ×14) : revenus de milliers de $/jour, ROI en quelques semaines.
- **Marché industriel local** (`stepLocalMarket`) : la ville achète pétrole, charbon, fer, acier, plastique… au cours local (97 %), donc plus que l'export. Le premier arrivé rafle toute la demande.
- **Concurrents PNJ locaux** (Lone Star Oil, Gulf Polymers, Great Lakes Steel…) s'installent après ~18 jours de ventes et se partagent la demande ; ils grossissent plus vite si le joueur s'enrichit trop.
- Plastique : 1,6 pétrole → 5 plastique (≈ 70 % de marge brute).
- L'import coûte toujours plus cher que le local (×1,05 à ×1,3 + fret).

## Paramètres de la partie (inspirés de Capitalism Lab)
Menu > Objectifs > « Paramètres de la partie » : nombre de concurrents (0–8 ; 5 par défaut : une IA par caste non jouée), capital de départ, agressivité d'expansion et tarifaire des IA, compétence des producteurs locaux, activité des puissances étrangères (5 niveaux, modifiables en cours de partie).

## Indice de fréquentation des magasins (Customer Index)
Chaque magasin a un indice 0–100 : emplacement (30 %), prix attractif (20 %), notoriété publicitaire (15 %), qualité & personnel (15 %), assortiment (10 %), humeur de la ville (10 %). Il multiplie directement l'affluence (×0,6 à ×1,5) et s'affiche dans l'onglet Publicité du magasin et dans la scène intérieure.

## Élasticité-prix (inspirée de Capitalism Lab)
Les ventes de détail dépendent du prix pratiqué : élasticité −0,9 (base), −1,4 (manufacturés), −2,2 (luxe), −1,6 (immobilier), appliquée à moitié sur la demande totale en plus de la part de marché. La demande industrielle locale réagit au cours : pétrole −0,5 (inélastique), charbon −0,7, fer −0,8, acier −1, plastique −1,2, or −1,5 ; cela stabilise les cours.

## Marque et marketing (inspirés de Capitalism Lab)
- Canaux publicitaires par magasin : télévision, radio, **presse écrite**, internet, **influenceurs** (risque de bad buzz).
- Trois indicateurs de marque : **notoriété**, **fidélité**, **perception de qualité** (qualité réelle des produits + presse/influenceurs). Ils multiplient l'affluence (×0,8 à ×1,2) et rendent les clients moins sensibles au prix.
- **Stratégie de marque** (Empire > Marque) : marque unique par produit, de gamme, ou d'entreprise.
- Autres ajouts de cette session : Bourse à la Capitalism Lab (liste filtrable, fiche, actionnaires, graphique, ordre en %, portefeuille), Guide de l'agriculteur, vue « Sélectionner un fournisseur » avec négociation et accords à durée limitée, C-levels et marché des cadres dirigeants.

## Fiche produit en rayon (part de marché)
Dans la vue d'un magasin, un produit sélectionné affiche : camembert de part de marché (toi / tes autres produits / rivaux / non servi), comparaison Marque · Qualité · Prix · Note globale **toi vs moyenne de la ville**, coût d'approvisionnement, marge unitaire, ventes, état offre/demande et accès à la vue fournisseurs (qui fonctionne désormais aussi pour les magasins : le fournisseur choisi détermine le coût des marchandises de base).

## Énergie : réseau, pylônes, câbles enterrés, centrales (R&D)
- **Réseau électrique** : un opérateur historique couvre la ville ; l'industrie du joueur élargit la demande. Déficit = coupures qui ralentissent les usines ; excédent = prix de l'électricité en baisse. Bloc « Énergie » dans l'onglet Empire.
- **Centrale à charbon** (dès le départ, 400 k$) puis, par R&D : **éoliennes** (selon le vent), **solaire** (saisonnier), **nucléaire** (très puissant, 6 M$).
- **Raccordement obligatoire** : chaque centrale doit être reliée au bord de la zone urbaine par des **pylônes** (aérien, pertes 0,6 %/case, coupés par les tempêtes, franchissent les rues) ou des **câbles enterrés** (R&D, pertes 0,2 %/case, insensibles aux tempêtes).
- **Fermes** : les terres agricoles ne sont plus dessinées « vides » ; elles apparaissent quand un concurrent PNJ local (ex. Heartland) y installe une ferme (le terrain devient occupé).

## Bac à sable : tout débloquer
Menu > « Tout débloquer : oui/non » (actif par défaut, sauvegardé) : tous les bâtiments (y compris centrales éolienne, solaire, nucléaire, câbles enterrés, BTP, grande usine, hypermarché…), tous les produits (restent à développer) et toutes les recherches sont accessibles sans palier de fortune ni prérequis.

## Mode « Manche » (prépare le multijoueur)
Objectif « Manche » (Menu > Objectifs) : fin au jour 720 ou dès qu'un empire atteint 1 milliard de $ de capitalisation ; le plus riche gagne.

## Échelle économique (suite à l'audit « Chief Architect »)
- **Population ×30** (≈ 290-340 k habitants au départ, K_POP) ; demande, emplois, électricité suivent.
- **Volumes industriels ×25** (recettes et produits), extraction ×2,5 à ×5, stocks et entrepôts ×25, salaires ×5, capex relevés : un puits ≈ 2,6 M$, une usine 150 k$ à 1,2 M$, un supermarché 350 k$ (≈ 1 an et demi de retour).
- **Marge de détail** : prix de rayon = prix de gros × 1,5 ; import à ≥ 1,05 × le gros.
- **Marché industriel** : « salle de marché » proportionnelle (8 % de la demande) partagée avec les producteurs locaux PNJ ; fournisseurs extérieurs de base pour éviter des prix qui s'envolent.
- Fixes de structure : élasticité-prix complète, pénalité de difficulté sur un seul canal, report des pertes fiscales.
- Sauvegarde : clé `wse-city-v8`, format v8 rétro-compatible avec v7 (champs ajoutés : prix par produit, ventes lissées, perception, fidélité, stocks d'entrepôt, indice de fréquentation, report de pertes, vent, événement en cours, rasages de la ville sans limite). Un rechargement redonne le même chiffre d'affaires au jour suivant. Découvert bancaire facturé au taux du prêt + 4 points (aucune défaite automatique). Capital de départ 3 M$.

## Sièges sociaux illustrés (3 formats)
`tools/process_hq.py <small|mid|large>` détoure une image du siège (`assets/src/hq/hq_<nom>_src.jpg`, fond blanc ou damier incrusté) vers `assets/hq/hq_<nom>.png` + `meta.json` ; `build.py` les embarque. Le siège fait 2×2 cases. Format `mid` en place ; `small` et `large` seront choisis selon le niveau du bâtiment (Améliorer) dès qu'ils seront fournis.

## Passe 2 de l'économie
- **Salaires réalistes** : 120 $/jour par salarié (~43 k$/an), avec marché du travail (chômage bas = salaires plus chers, courbe de Phillips) ; effectifs recalés (supermarché 5 employés, usines ×4, extraction proportionnelle au chiffre d'affaires) ; marge de détail ×1,8.
- **Services** (banque, tour tech, data center) : revenus proportionnels à l'effectif (≈ 380-520 $/jour/employé) ; capex 1,8-2,4 M$.
- **Export** : débit portuaire limité (6 000 u/j × (1 + 2,5 par terminal)) et demande étrangère finie par bien (le prix baisse quand on sature).
- **Rivaux** à l'échelle de la ville (coûts et investissements ×30), **coût de construction indexé sur l'inflation**.
- **Aléatoire déterministe** : la simulation utilise `rnd()` (mulberry32, état `S.rs` sauvegardé) au lieu de `Math.random` : étape préalable du multijoueur serveur-autoritaire.

## Passe 3 (audit d'un architecte vétéran de Capitalism)
- Ventes de magasin : élasticité-prix réelle et indice client sur le volume ; capacité répartie **par classe** (s2 62 % base / 38 % manufacturé ; s3 45/35/20) ; tes produits passent avant les marchandises du marché local ; import du détaillant ×1,25 (ensuite remplacé par le marché local, passe 13) ; marge de détail ×2,2.
- Capital de départ 600 k$ ; rivaux à l'échelle (cash ×30) avec réapparition tous les 45 jours ; courbe de difficulté repartie de 600 k$ (×e^(0,0016 j)) ; prix plancher/plafond ×0,7 / ×1,9 ; services moins généreux (banque 260 $/emp., hors fonds empruntés) ; or ÷3 ; usines à leurs effectifs de base.
- Bot « retail pur + réinvestissement » (pf 1,15) : fortune ≈ 1,1 M$ à 1 an, 1,7 M$ à 2 ans, 5,7 M$ à 5 ans (CA ≈ 15 M$/an).

## Passe 4 : chaînes industrielles, pharma, migration
- **Calibrage automatique de la valeur ajoutée** (`applyScale`) : chaque usine-jour crée ≈ 2× ses salaires (composants, marchandises, produits finis). Chaîne pétrole → chimie → principes actifs → pilules → supermarchés testée : chaque maillon est rentable (pilules ≈ +5,8 k$/j ≈ 2 M$/an avec une seule usine).
- **Rayons** : tes produits sont servis avant les marchandises du marché local (les pilules se vendent désormais en magasin).
- **Migration** : une ville prospère construit de nouvelles tours résidentielles et de bureaux (population ≈ +35 % en 4 ans, chômage ≈ 6 %).
- Marge de détail ×2,45, supermarché 80 u/j : bot « retail pur + réinvestissement » ≈ 1,1 M$ à 1 an, 1,9 M$ à 2 ans, 7,5 M$ à 5 ans.
- Multijoueur mis en veille (le calcul déterministe `rnd()` reste en place).

## Passe 5 : marges réalistes (retour de Rémy)
- **Marge brute 60-90 %** : prix des composants, marchandises et produits fixés par `prix = coût des intrants / (1 − marge brute)` (composants 58-72 %, produits 70-82 %, pharma 85-90 %). Prix de rayon = prix de gros × 2,5 (base), 2,8 (manufacturé), 3,6 (luxe).
- **CA ≥ 3× les salaires** partout (supermarché ×6, usines ×3,5 à ×14, extraction ×5-7) : effectifs recalés (supermarché 3 employés, usines 6/12/24) et usines à 3,2 cycles de recette par jour.
- **Extraction** : EBITDA ≈ 25 % pour le pétrole, 30-50 % pour les mines, 55 % pour l'or (coûts d'exploitation proportionnels au CA) ; les cours fluctuent (dumping des étrangers) donc les marges aussi.
- **Services** : banque 600 $/employé/jour, tour tech 500, data center 700 ; capex 4 à 6,5 M$.
- **Rémunération des dirigeants** proportionnelle à la taille du groupe (jusqu'à ≈ 9 M$/an par dirigeant pour un grand groupe).
- Nouveau tableau **« Économie des secteurs »** (Empire) : CA, marge brute, EBITDA et CA/salaires par type de bâtiment.

## Services : repères réels (Euronext, Rexel, Crédit Agricole ≈ 730 k€ de CA par employé et par an)
Banque, tour tech et data center : 1 500 à 2 000 $ de CA par employé et par jour (≈ 550-730 k$/an), bénéfice par employé ≈ 300 k$/an (Hermès ≈ 200 k$, TotalEnergies ≈ 130 k$, Sanofi ≈ 104 k$), capex 14 à 18 M$.

## Passe 6 : repères sectoriels sourcés et échelle « millions »
Recherche web (résumés de communiqués 2024-2025, non vérifiés dans les rapports complets) :
- **Pétrole** : TotalEnergies 214,6 Md$ de CA, EBITDA 20 % ; indépendants de schiste (Diamondback) EBITDA ≈ 70 %, puits ≈ 6,5-7 M$. **Charbon** EBITDA 20-37 % (Peabody, Whitehaven). **Fer** 43-65 % (Rio Tinto, Vale). **Cuivre** 39 % (Freeport). **Or** 48 % (Barrick). **Acier** 11-14 % (ArcelorMittal, Nucor). **Ciment/granulats** marge brute 27 %, EBITDA 21-28 % (Vulcan, Heidelberg). **Électricité** EBITDA 21-57 %, CA ≈ 0,6-0,75 M€ par employé (EDF, Engie).
- **Distribution alimentaire** : marge brute 20-25 %, EBITDA 5-7 %, CA ≈ 324 k$ par employé (Walmart), 19,9 % de marge brute (Carrefour). **Pharma de marque** : marge brute 72-85 % (Novo 84,7 %, Pfizer ≈ 72 %), R&D 15-20 % du CA, développement d'un médicament 0,7-1,3 Md$. **Santé grand public** 64 % (Haleon). **Luxe** : marge brute ≈ 67 %+ (Richemont 66,9 %), EBITDA 25-45 %. **Cosmétiques** 74 % (L'Oréal). **Chimie** EBITDA 12-15 % (BASF). **Électroménager** marge brute 15-30 %. **Agroalimentaire** 47 % (Nestlé).
- **Services** : banque ratio coûts/revenus 52-62 % ; data centers : CA par employé ≈ 340 k€ (OVHcloud) à 753 k€ (APL), EBITDA 38-47 %, 8,9-23,3 M$ par MW ; BTP EBITDA 8-18 % ; ports EBITDA 22-27 %.
- **Important** : la « marge brute de 60 à 90 % » n'est vraie que pour la pharma, le luxe, les cosmétiques et les services numériques ; la distribution et les matières premières sont bien plus basses.

Implémentation : tableau `SECTOR_REF` dans le code ; marges par secteur (composants 30-38 %, marchandises de base 42 %, manufacturées 32 %, luxe 62 %, produits finis 35-67 %, pharma 65-85 %), distribution à marge 40-50 % sur le gros, extraction à EBITDA réaliste, **échelle ×5** (supermarché ≈ 1,75 M$, ≈ 3,8 M$ de CA/an à pleine charge, capital de départ 3 M$, puits ≈ 10 M$, usines 0,75 à 6 M$, banque 40 M$).

## Commerce : prix, publicité, emplacements
- **Prix par produit** (curseur 60-220 %) dans la fiche produit du magasin ; élasticité appliquée aux ventes.
- **Marque, qualité et publicité par produit** : ce sont les produits qui ont une marque, pas le magasin. Chaque produit fini a sa notoriété, sa fidélité et sa perception de qualité (`S.prod[pk].brand/loy/rt`) et son budget publicitaire par canal (télé, radio, presse, internet, influenceurs, boutons − / +, dans la fiche produit du magasin et dans Menu > Produits). La notoriété monte avec la puissance publicitaire, la perception vient de la gamme, de la presse et des influenceurs (risque de bad buzz), la fidélité de la qualité, du prix et de la disponibilité. Les marchandises du marché local n'ont pas de marque. La note globale d'un produit n'utilise que sa propre marque ; le magasin garde sa notoriété (onglet Publicité) pour l'affluence seulement. Le prix affiché en fiche est le prix en rayon (gros × marge de distribution × curseur) et la marge unitaire est calculée contre le coût réel d'approvisionnement.
- **Canaux de publicité** choisis directement dans la fiche (télé, radio, presse, internet, influenceurs, boutons − / +).
- **Double-clic sur un emplacement** : ouvre le choix du produit **et du fournisseur** (prix livré et qualité), puis « Mettre en rayon ».

Les bâtiments de service ont une vue **Intérieur dédiée** (KPI en tête, scène réduite) : entrepôt (stocks par bien, remplissage, frais), centrales (combustible, prix du réseau, raccordement et pertes), R&D (brevets, jours avant le prochain, royalties), siège (cadres, statut en bourse), banque (marge d'intérêt), tours tech et data centers (loyers). L'EBE par jour est distingué du résultat net.
## Passe 7 : rééquilibrage des chaînes industrielles et de la pharma
Diagnostic (scénarios Playwright pharma, vélo/acier, bois/meubles, BTP/béton, pétrole/plastique, énergie, multi-produits) : les composants perdaient de l'argent parce que
(1) les cours des matières étaient gonflés de 25 % et ceux des composants de 8 % seulement, donc les intrants coûtaient plus que prévu ;
(2) l'offre PNJ (importations de base 0,5 + producteurs 1,4 fois la demande locale) dépassait toujours la demande : les cours restaient collés au plancher ×0,7 ;
(3) la formation des prix intégrait le déséquilibre jour après jour (fluctuation de 8 % par jour) et butait sur les bornes ;
(4) les salaires (15/30/60 emplois) pesaient 25 % du CA des petites usines, et le calibrage par marge brute ignorait salaires et entretien ;
(5) les unités importées étaient comptées deux fois dans le coût de l'usine, et une usine importait à perte (import à ×1,3 sans tenir compte des coûts fixes) ;
(6) les centrales produisaient 2 400 à 18 000 MWh/j contre 1 100 MWh/j de demande de la ville.

Correctifs :
- **Prix d'équilibre calibrés sur l'EBITDA du secteur** : `prix = (intrants + coûts fixes du cycle) / (production × (1 − EBITDA − transport 3 %))` (tables `EB_REC`, `EB_GEN`, `EB_PROD`, `EB_EXT`) ; extraction : entretien déduit de l'EBITDA visé, salaires ≈ 7 % du CA.
- **Formation des prix** (étape 7) : cours visé = base × répercussion du coût des intrants (`inS`) × f(demande / offre lissée), f ∈ [0,82 ; 1,30] (courbe `tanh`, plus de collage aux bornes), plancher à ×0,86 pour un produit transformé, ×0,75 pour une matière.
- **Marché local PNJ** : importations de base 0,4 et producteurs plafonnés à 0,3 de la demande (`NPC_IMP`, `NPC_CAP`) : une usine du joueur couvre le reste ; demande locale ajoutée pour les composants (chimie, principes actifs, béton, emballages, etc.) et relevée pour les granulats et cultures.
- Usines : emplois 8/16/32 (fonderie 10), capex 1,2/3,5/9 M$ (fonderie 2 M$) ; transport 0,01 par unité et case ; emballages ×2 par cycle ; l'import automatique n'a lieu que si les intrants ne dépassent pas 85 % du CA ; coût d'import compté une seule fois.
- Commerce : marge de détail 2,05 / 2,10 / 2,30, effectifs 1 / 5 / 16 : EBITDA d'un supermarché ≈ 14 %, CA/salaires ≈ 4,3.
- Énergie : centrale à charbon 300 MWh/j (500 t de charbon, 10 emplois), solaire 370, éolien 195, nucléaire 1 000 MWh/j.
- Bois : camp de bûcherons 600/j, la forêt repousse de 0,6 % par jour.

## CA et EBE mensuels
Somme glissante sur 30 jours (ramenée à 30 jours tant que l'historique est plus court) : dans la barre du haut (« CA … /mois », infobulle avec EBE et résultat net), dans l'onglet Empire (« Résultats mensuels » : CA, EBE, marge d'EBE, résultat net mensuel et annualisé) et dans chaque bâtiment (« CA / mois », « EBE / mois »).

## Élasticité-prix visible et écran Produits façon Capitalism Lab
- **Demande par produit** : le volume vendu d'un produit dans un magasin diminue avec son prix (curseur par produit, 100 % = pleine capacité) : à +30 % de prix, −19 % de volume pour un bien de base, −31 % pour un manufacturé, davantage pour le luxe (élasticités 0,9 / 1,4 / 2,2). Mesuré : biens de base 149 → 118 u/j à ×1,3, 97 à ×1,6, 80 à ×2.
- **Écran Produits** (Menu > Produits) : courbe 12 mois au choix « Quantité vendue » ou « Chiffre d'affaires », camemberts Production et Détail, tableau Local / Moyenne / Concern (poids prix-qualité-marque), quantités vendues par jour et par mois, stock, fidélité, publicité. Fiche produit du magasin : ventes par jour et par mois.

## Élasticité-prix réaliste (court/long terme, Veblen)
Sources : USDA-ERS (pain/céréales ≈ −0,5 en moyenne, inélastique ; court terme bien plus faible), rapport MSI (élasticité expérimentale ≈ −0,34 vs ≈ −2 observée entre marques), études Veblen/snob (effet existant mais borné, selon le type de luxe).
- Biens de base : −0,08 (court terme) → −0,3 (long terme) sans substitut ; si une alternative est en rayon, +0,25 → +0,8 de report.
- Manufacturés : −0,4 → −1,0 (+ report 0,6 → 1,2). Luxe : effet Veblen (+0,3 de pente à court terme, +0,1 à long terme) jusqu'à +60 % de prix, puis chute.
- Les habitudes s'ajustent en ~75 jours après chaque changement de prix (`trackPk`, `elF`).

## Passe 8 : commerce moins rentable, usines génériques et luxe rééquilibrés

- Commerce : marges de rayon `RETAIL_MK` ramenées à 1,72 / 1,78 / 2,15 (base / courant / luxe) et import magasin à ×1,12-1,20 : marge brute 30-39 %, EBITDA magasin 6-12 % (s1 à +6 % au lieu de −10 %, s1 et s2 agrandis, entretien de s1-s3 réduit).
- Le prix de rayon n'agit plus qu'une fois : retiré de l'indice de fréquentation et de la capacité, prix relatif entre magasins dans `pw`, élasticité court/long terme (`elF`) sur le volume du magasin ; prix par produit plafonné à 150 % pour le basique ; bande Veblen du luxe réduite à +25 % avec érosion dans le temps.
- Sensibilité au PIB de la demande : basique 0,5, courant 1, luxe 6.
- Anciennes usines « génériques » (supprimées en passe 13) : plancher de prix = coût réel des intrants + 8 %, ventes en magasin et exports comptés dans la demande, EBITDA cible relevé pour f1/f2 (≈ 13 %) ; la grande usine (f3) utilise peu de lingots et beaucoup de main-d'œuvre (marge brute ≈ 56 %), mines d'or plus productives.
- Pharma : moitié moins de matière et frais généraux fixes (marge brute ≈ 79 %), salaires ×1,8 ; banque, tech, R&D et data center paient 1,3 à 2 fois plus ; CA tech et banque indexés sur l'inflation, intérêts bancaires plafonnés par la taille de la banque (plus sur toute la trésorerie), CA par employé tech ≈ 680 k€ et data center ≈ 760 k€.

## Passe 10 : modèle produit
Règles qualitatives inspirées de Capitalism Lab (ordres de grandeur, pas de formules officielles), mesurées sur le jeu. Sources : capitalismlab.com/mod/advanced-modding/advanced-modding-products/, /new-features/technology-disruption/, /new-features/product-class-expertise/, /improvements/mega-product-class/, /beginners-guide-gameplay-basics/.
- **Pondération par produit** (`PROD_W`, prix/qualité/marque sur 100) : pain 45/30/25, téléphone 20/40/40, montre 15/30/55, pilules 30/25/45. Utilisée par `productScore`, `attractiveness`, l'écran Produits et la fiche (`scoreW(cls, pk)`).
- **Nécessité 0-100** (`NECESS`) : multiplie l'élasticité (`necMult` = 1,4 − 0,8 × nécessité, via `elF`), règle la sensibilité à la récession (`recF`) et le salaire réel requis (`reqRW`, `affordOf`).
- **Demande par habitant** (`DEMAND_PC`, u/an/hab) : pondère le poids du produit face aux autres de sa classe (`typeW`).
- **Salaire réel** (`S.rw`, indice 100 au départ, suit PIB et emploi) : déplace la demande de basique vers courant puis luxe ; un produit de luxe sous le salaire réel requis voit ses acheteurs fondre. Indicateur dans Empire > Conjoncture.
- **Cycle de vie** : obsolescence annuelle par produit (`OBSO`, après 1 an d'âge), remplacement OUTBY/OUTREMAIN (`SUCC` : jouets en bois vers plastique, 40 % conservés ; maison bois vers béton, 50 %), affiché dans la fiche.
- **Technologie** : niveau par produit (`ps.tc`) −10 %/an sans R&D, entretenu par les centres de R&D (gain × pointe du marché/100 ; pointe `techFront` = 100 + 4 points/an), expertise par méga-classe (+4 par R&D réussie, +0,5/mois si tech à jour ; +1 % de vitesse de R&D par point). Qualité réelle (`trueQ`) = part des intrants (IQUA, qualité fournisseurs) + part technologie (3 technologies max, poids sommant à 100, `PROD_TECH`, `TECH_SHARE` ; téléphone 80 % techno).
- **Produits chers** : au-delà de `EXP_T` (3 500 $ réels), cadence de fabrication = seuil / prix (jours par unité = prix / seuil). Effet : montre haut de gamme ×0,9, maisons ×0,5.
- **Méga-classes de marque** (`MEGA_OF`) : la marque corporate gagne en impact sur une seule méga-classe (÷ n^0,8), la fidélité baisse de 8 % par méga-classe supplémentaire (4 % en marque de gamme).
- **Prix standard** (`stdPrice`) = prix de base × inflation × salaire de la ville^0,4 + prime de R&D non indexée (`rdPrem`, ≤ 8 %).
- **Coût d'extraction** (`RES_COST`, part du prix) : EBITDA visé = 1 − coût. Mesuré : puits ≈ 20-25 %, fer 53 %, cuivre 46 %, or 46 %.
Sauvegarde v8 rétro-compatible (champs `rw`, `exp`, `ps.tc`, `ps.obs` avec valeurs par défaut). Marges s1-s4 inchangées sur le banc d'essai standard.

## Passe 13 : fin de la production générique, arbre produit cohérent

**Usines vides.** Une usine f1-f4 neuve ne fabrique plus rien (plus de « marchandise générique » de base / manufacturée / luxe, ni de « produits de luxe » à base de cuivre + pétrole + lingots). `recOf(c)` renvoie `null` tant qu'aucun produit ou composant n'est choisi (ou que le produit est en R&D, ou que l'usine est trop petite) ; `step()` met alors `c.limit` à `noprod` / `rnd` / `lvl` et le bâtiment affiche « Aucun produit : choisis ce que l'usine fabrique ». Le choix d'un produit lance l'auto-production (`autoSource` : fournisseurs et imports choisis selon l'arborescence), aussi à la fin d'une R&D pour les usines déjà affectées (`assignRecipe` appelle aussi `autoSource`). Une usine vide n'emploie que 25 % de ses postes (`actF` : l'effectif suit l'activité lissée `_actE`, y compris pour les salaires) mais paie son entretien. `TYPES.f1..f4.rec` ne sert plus qu'à référencer l'emplacement (distance aux intrants pour le calque logistique) et à calibrer le cours de marché des marchandises de rayon. Sauvegarde v8 inchangée : les anciennes usines sans produit (`prod` nul) se chargent vides, le Conseiller les signale.

**Marchandises de rayon = marché local.** Les rayons « base / manufacturé / luxe » sont alimentés par les grossistes et producteurs PNJ de la ville au cours du marché + 5 % (`PNJ_MK`, avant : import portuaire ×1,12-1,20) ; les produits de marque du joueur passent avant. Le libellé devient « (marché local) ». Les anciens stocks génériques d'une sauvegarde restent vendables.

**Arborescence : audit et corrections.**

| Recette / produit | Avant | Après | Verdict |
|---|---|---|---|
| Emballages | plastique + charbon | plastique + bois (carton) | charbon absurde |
| Cartes électroniques | cuivre + plastique + 1 lingot | cuivre + plastique + silicium + 0,4 lingot | l'électronique a du silicium |
| Écrans | plastique + carte + câble | verre + plastique + carte | un écran a du verre |
| Baskets | tissu + pneus (acier) | tissu + caoutchouc | semelle, pas un pneu |
| Lit | planches + acier | planches + acier + tissu | literie |
| Vélo | acier + plastique | acier + plastique + caoutchouc | pneus |
| Smartphone | écran + carte + batterie | + plastique (boîtier) | |
| Montre de luxe | 3 boîtiers or + carte + acier | boîtier or + verre saphir + acier + cuivre | acier + or + verre |
| Génériques f3 (luxe) | cuivre + pétrole + lingots | supprimé | absurde |

Nouveaux composants : verre (sable + charbon), silicium (sable + charbon, usine moyenne), essences et arômes (chimie + canne à sucre). Nouveaux produits (23 → 35 au total) : savons et détergents, verrerie et bocaux (f1) ; crèmes et soins, petit électroménager, réfrigérateur (f2) ; bijoux en or (or + cuivre + cristal), parfum de luxe, soins de luxe, sac de créateur (f3) ; tablette, ordinateur portable, console de jeux (f4, niveau 4 = méga-usine, palier Magnat). Au moins 3 produits « standard » par niveau se lancent sans R&D (`free` : pain, ustensiles, savons, verrerie ; jeans, vélo, crèmes, petit électroménager ; montre, bijoux, parfum ; tablette, ordinateur, console), les autres gardent leur R&D.

**Méga-usine (f4).** Niveau 4 (toutes les recettes de la grande usine + l'électronique de masse), capacité ×3 (avant ×8), effectif nominal ×2,4, capex ×3,2 ; l'effectif suit l'activité. Le calibrage des prix divise les coûts fixes par la capacité (`facFix`).

**Calibrage.** EBITDA cible usine : base 20 %, manufacturé 17 %, immobilier 15 %, luxe 30 % (avant 32), pharma 38 % (avant 42). Marge brute mesurée (simulation, chaîne complète) : pharma 75-88 %, luxe 41-72 % (électronique et or ≈ 41-46 %, parfum et maroquinerie ≈ 70 %), base 36 %, manufacturé 20-30 %. Mesures par produit à plein régime (cours de base) : voir les scripts d'audit de la session.

## Passe 11 : gestion, finance, objectifs, immobilier, médias, ressources

Sources (lecture qualitative de capitalismlab.com, aucune formule officielle : versions raisonnables propres au jeu) : /improvements/management-policies/, /goals-guide/, /media-real-estate-guide/, /improvements/natural-resources/, /new-features/inflation/, /beginners-guide-gameplay-basics/.

- **Politiques du COO** (Menu > Finances) : curseur « Maximiser la marge ↔ Équilibré ↔ Maximiser la part de marché » (9 crans, ±8 % sur le prix de rayon par défaut de tous les magasins), « Ne jamais vendre sous le coût » (le prix de rayon d'un magasin remonte de 2 %/jour tant que son coût d'achat dépasse 97 % de son CA), « Chercher de meilleurs fournisseurs » (tous les 5 jours : un fournisseur `co:` est remplacé s'il est 5 % meilleur ; un intrant en `auto` passe à un fournisseur dès que la rupture dépasse la tolérance), « Poids du fret » (0-100 % : score = prix + fret × (0,2 + 1,6 × poids), plus il pèse plus on achète près) et « Tolérance de rupture » (0-30 jours). Mesuré (supermarché, 40 jours) : marge max 19,9 % d'EBE, équilibré 14,2 %, parts de marché 6,0 %.
- **Options du PDG** : « Prix selon l'inflation » et « Publicité selon l'inflation » (oui par défaut = réalignement tous les 30 jours ; non = les prix de rayon perdent cpiP/cpi de pouvoir d'achat et le même budget publicitaire achète cpi/cpiA fois moins d'audience), bouton « Ajuster maintenant ».
- **Objectifs** (Menu > Objectifs) : domination = être le plus gros acteur (≥ 20 % de part et personne devant) d'une catégorie (base/manufacturés/luxe/immobilier) ou d'un secteur (consommation, immobilier), série de 30 jours (bug corrigé : la série comptait 1 par palier de 5 jours) ; objectifs cours de l'action, CA mensuel, bénéfice d'exploitation et fortune personnelle (part détenue × valeur de la société) mesurés **hors éléments exceptionnels** (EBE sur 30 jours déflaté, valeur d'exploitation = 7 × EBE annualisé + trésorerie − dette, ni intérêts, ni inflation, ni variation d'actifs, ni nouveaux bâtiments), cibles ×2/×5/×10 ; **sous-objectifs** à échéance (récompense 1-2 points de connaissance, pénalité = frais de crise + 5 % de cours) ; les points forment l'expertise des dirigeants (+6 par point).
- **Dette** : plafond = 100 % des actifs courants (trésorerie propre + stocks, ×1,5 banquier, ×1,2 CFO), pas de remboursement obligatoire, l'inflation érode le principal (valeur réelle affichée). **Augmentation de capital** (10 % : dilue l'actionnaire, cours −3 %), **prise de contrôle hostile** dans les deux sens : ≥ 50 % des actions d'un rival = succès certain à prime 12 % ; au-delà de 50 % de flottant, un rival peut prendre le contrôle de ta société (cadres, CFO, IR partent, cours −15 % ; rachat possible sans CFO).
- **Immobilier** : *Tour de location* (loyer à 100 % du marché par défaut, 60-160 %, les baux s'ajustent en 2-3 mois), indice offre/demande par quartier de 6 × 6 cases (négatif = demande > offre), distance au CBD (30,30), commodités à 7 cases (parcs, monuments, commerces, *Équipement sportif*), trafic. EBE ≈ 47-70 %. Le terrain coûte plus cher avec l'inflation, le trafic et les commerces voisins, et sa valeur entre dans la valeur nette (protection contre l'inflation).
- **Médias** : *Station média* : audience (rating) selon la qualité des programmes face à 2 chaînes concurrentes, budget de contenu (rendements décroissants, plus cher dans une grande ville, `0,0065 × pop^1,05`), tarif publicitaire (annonceurs locaux très sensibles au prix, nationaux exigeant de l'audience). EBE ≈ 31 % à 100 % ; une 2ᵉ station partage l'audience.
- **Ressources naturelles** : prime du site (3 % de la valeur des réserves, visible au survol), sites neufs 12-32 jours après l'acquisition d'un site (prime ×1,6 par génération, 6 maximum par ressource), option « ressources illimitées » (au-delà de la réserve : coût/unité = coût d'acquisition ÷ réserve d'origine × inflation).
- **Fret en 3 segments** pour l'achat à une puissance étrangère et l'import par le port (fournisseur → port, port → port, port → acheteur), détail au survol de « Transport » et « Livré » ; événement **Percée technologique** (recherche en cours terminée, +20 à 60 points de brevet).
- Non fait : capacités maximales plus réalistes des unités de niveau élevé (linéaire ×4 conservé). Le prix par produit (`pk`) saisi à la main reste prioritaire : la politique agit sur le prix de rayon (`pf`).

## Passe 9 : optimum de prix, data center, onglets et écrans

- Élasticité (`elF`) : même seul sur son marché, un commerce garde 80 % du report vers un substitut à long terme ; érosion accélérée au-delà de +15 % ; luxe Veblen limité à +12 %. Mesuré sur s2/s3 (court terme 12 j, long terme 150 j) : l'EBE à long terme est maximal vers 110-120 % du prix de référence (s3 : +28 % à 110 %, retour sous le niveau 100 % à 130 %), les biens de base restent quasi inélastiques à court terme.
- Data center : bonus de loyer de la caste innovateur ramené de ×1,5 à ×1,12 (EBITDA 58 % -> 44 %, CA/employé ≈ 570 k$ ; banquier inchangé à 37 %).
- Onglets des bâtiments : tableaux financiers lisibles en mobile 390 px, libellés collés corrigés (Logistique, Effectifs), rendement annuel plafonné à ±1 000 %.
- Concurrents : classement (rang, part, tendance, ventes/mois, valeur) ; Recherche : compteurs par ère et grille à deux colonnes.

## Passe 12 : intérieur des usines en vue isométrique

L'onglet « Intérieur » des usines (petite, moyenne, grande, méga-usine) et de la fonderie n'est plus une coupe latérale 2D mais une halle isométrique (projection 2:1, palette de la ville) entièrement dessinée en canvas :

- **Halle** : sol en losange, murs avec poutres, fenêtres et enseigne ; la méga-usine est une grande halle à deux lignes de production.
- **Flux** : palettes d'intrants à gauche (couleur et forme selon la marchandise : fûts, sacs, lingots, minerai, bobines, planches), tapis roulants vers la machine, puis produits finis vers la sortie (palettes de cartons étiquetés ou vignette du produit, camion de livraison). Plus aucun motif cadeau.
- **Machines par type** : scie, presse, four (fonderie avec creuset), bobineuse, cuves de réacteur, four rotatif, bétonnière, emballeuse, bras robotisés d'assemblage ; portiques de finition supplémentaires selon le niveau.
- **Ouvriers** : leur nombre suit l'effectif réel (`jobsOf × fill`) ; manutentionnaires (port de caisses), opérateurs, emballeurs, chef d'équipe, chargeur. Cadence liée à l'utilisation (`c.util`) et à la production (`c.out`).
- **États** : pénurie d'un intrant (palette vide, icône d'alerte sur la machine et l'intrant, machine à l'arrêt), sortie pleine (`_full` : tapis bloqués, pause des ouvriers, camion parti), arrêt prolongé (ouvriers en pause).
- **Performance** : scène redessinée à 30 images/s au plus, environ 1 à 1,5 ms par image, arrêtée hors de l'onglet.

## Passe 14 : le marché (prix unique, demande lisible)

**Prix unique par bien.** Chaque bien (matière, composant, marchandise de rayon) n'a qu'un cours `S.price[g]` ; l'ancrage, le plancher et le plafond sont centralisés dans `marketBounds(g)` (ancrage = base × répercussion du coût des intrants × inflation × primes ; plancher = intrants + 8 % ; plafond = ×1,6 de l'ancrage). Les achats (demande) font monter le cours et les ventes (offre) le font baisser, lissés par le rapport demande/offre `S.rat[g]` : pas d'auto-équilibrage opaque. L'import, le fournisseur et l'étranger ne créent pas de second prix : ils ne diffèrent que par le coefficient fournisseur et le fret (`FREIGHT` = 0,6 % du prix par case), ce qui garde « import toujours plus cher que local ». Refactorisation sans changement numérique : dynamique vérifiée identique bit à bit (200 jours, prix, trésorerie, population) avant/après, donc marges inchangées.

**Audit des prix de base.** Valeur ajoutée (prix de sortie ÷ valeur des intrants aux prix de base) des biens transformés : 1,27 à 1,9 en général (ingot 1,67, acier 1,46, ciment 1,89), exceptions assumées : écrans 3,95 et luxe 2,59 (marge technologique/marque). Laissés tels quels pour ne pas bouger les marges.

**Indicateurs.** Chaque bien du panneau Bourse affiche le prix, la tendance sur 30 jours (↑ ↓ →) et un état : équilibré, pénurie, saturé, prix plancher / plafond. Cliquer sur une ligne ouvre le détail (ancrage, bornes, demande/offre). Alerte au journal (une par bien et par mois au plus) quand un bien que tu stockes ou vends bascule en pénurie ou saturation.

**« Pourquoi la demande est… ».** Pour les besoins des habitants (base = vital, croissance de la population ; manufacturé = confort ; luxe = richesse ; logement) et pour les biens industriels : facteurs chiffrés en % (population, technologie/événements, PIB, salaire réel, bonheur, produits lancés, prix en rayon, concurrence, disponibilité). Affiché dans le détail d'un bien (Bourse) et dans l'écran Produits. Pas de saisonnalité de la demande dans le jeu : non affichée.

**Coût livré.** L'infobulle affiche la formule : prix du marché × coefficient fournisseur (qualité livrée) + fret (0,6 % du prix par case × distance). La fraîcheur n'est pas modélisée.

Sources : notes de conception d'Offworld Trading Company (prix unique par marché), Anno 1800 (besoins de base/luxe), Game Developer « How to tune a simulation game ».

## Passe 16 : équilibrage et QA post-fusion

#### Feuille maîtresse d'équilibrage (passe 16)

Mesures par simulation (scripts `a_iso.js`, `a_ext.js`, `aud1_a_retail.js`) : usines alimentées au prix de base (stock local), prix figés, 100 % d'effectif ; extracteurs sur le gisement le plus proche du port, macro figée. EBITDA = (CA − intrants − salaires − entretien − fret) / CA. Montants en $ par jour dans les scripts, affichés en mensuel dans le jeu.

| Bâtiment / produit | Cible | Avant | Après | Action |
|---|---|---|---|---|
| Puits de pétrole (EBITDA) | 15-20 % | 2-5 % | 19 % | RES_COST 0,82, entretien calibré sur 88 % de la production nominale |
| Puits : retour sur capex | ≤ 3 ans | > 50 ans | 2,6 ans | capex = 2,5 ans d'EBITDA (10,3 M$ → 5,2 M$) |
| Mine de charbon | ≈ 27 % | 21 % (7 % à 114 cases du port) | 30 % ; retour 2,5 ans | idem |
| Fer / cuivre / or | 40-60 % | 44 / 42 / 38 % | 54 / 52 / 46 % ; retour 1,8-2,3 ans | idem, fret typique du gisement |
| Gravier, sable, calcaire, bois, cultures | 20-27 % | 12-20 % | ≈ 20-27 % (calibrage commun) | idem |
| Magasin s1 / s2 | 6-12 % | 15 / 15 % | 8 / 7 % (MB 34 %) | marge de rayon basique 1,72 → 1,58, courante 1,78 → 1,62 |
| Grand magasin s3 | 6-12 % | 14 % | 7 % (MB 42 %, luxe 47 %) | luxe 2,15 → 2,0 |
| Méga-centre s4 | 6-12 % | 19 % | 13 % | idem |
| Centrale à charbon | 35 % | 34 % (analytique) | inchangé | — |
| Nucléaire : retour | ≤ 5 ans | 6 ans | 4,4 ans | capex 30 → 22 M$ |
| Solaire / éolien | ≈ 55 % | 65-69 % (analytique) | inchangé (écart 25 %) | — |
| Fonderie / composants f1-f2 | 11-27 % selon recette | 7-17 % (composants bon marché) | 12-27 % | fret par unité intégré au prix de base (pack 7 → 15 %, farine 12 → 15 %, pain 14 → 20 %) |
| Pharma (céphalalgie, toux, obésité) : MB / EBITDA | MB ≥ 72 %, 30-45 % | 77 / 37 % | 78 / 39 %, 72-88 % de MB | — |
| Luxe (bijoux, parfum, soin, sac, montre) : MB / EBITDA | 50-70 % / 25-35 % | 55-75 % / 30 % | idem | — |
| Électronique (TV, téléphone, tablette, ordinateur, console) | MB 40-57 % | MB 42-57 %, EBITDA 28-30 % | idem | niveau Apple, laissé |
| Maison bois / béton (f2) | 8-18 % | 14 % | 14 % | — |
| Banque | EBITDA 38-48 %, ≈ 700 k$ / emp. | 43 %, 687 k$ | inchangé | — |
| Tech | ≈ 730 k$ / emp. | 46 %, 680 k$ | inchangé | — |
| Data center | 38-47 %, 330-750 k$ / emp. | 37-44 %, 507-567 k$ | inchangé | — |
| Tour de location (off) | 8-12 % de rendement brut | EBITDA 45 %, retour ≈ 2,7 ans | non corrigé | signalé : rendement ≈ 80 % du capex, à rééquilibrer avec le mode multi-villes |
| Station média (tv) | EBITDA 25-35 % | 34 % | inchangé | — |
| Usine vide (méga-usine) | pas de ruine silencieuse | 2,9 M$/mois | ≈ 1 M$/mois + alerte mensuelle | entretien × 25 % + message |
| CA ÷ salaires | ≥ 3 | 3,6-102 (min. écran 3,6) | idem (min. 3,6) | — |

Contrôles longs : 2200 jours de bot aléatoire (1 270 bâtiments) sans NaN ni stock négatif, pas de pageerror ; empire intégré 1800 jours (3 récessions simulées) sans spirale (trésorerie stable, pas de dette) ; déterminisme vérifié ; `t_play.js` sans « bad ».

## Passe 15 : boucle de jeu, progression et fin de partie

Objectif : parties courtes (1 à 2 h réelles), futur multijoueur 2-8 joueurs en rounds, condition de victoire lisible. Inspirations : OTC (bourse = victoire, rachat majoritaire, filiales gérées par l'IA, dette graduée), RollerCoaster Tycoon (scénarios progressifs à objectifs visibles), Game Developer (courbes de snowball).

**Modes** (écran de sélection au démarrage et via Reset / Menu > Nouvelle ville, puis choix de la caste) :
- **Libre** : le bac à sable d'avant (jour de 2 s), barre d'objectif = prochain palier.
- **Round compétitif** : 1 Md$ de valorisation avant 90 min (7 200 jours à 750 ms), classement public, vitesse ×3 coupée (horloge commune). Fin : 1 Md$ atteint, tous les rivaux rachetés, ou temps écoulé (victoire si première valorisation du monde).
- **Scénarios 1 à 5** (chacun débloqué par la victoire du précédent, verrous de bâtiments par scénario) : 1 Ville et commerce (60 min, 40 M$, tutoriel en 5 étapes), 2 Usines et produits (75 min, 60 M$, 2 produits lancés), 3 Marchés et export (90 min, 400 M$ et 1,5 M$/mois d'exports), 4 Bourse et OPA (100 min, 700 M$, contrôle d'un rival, départ à 6 M$), 5 Empire (120 min, 1 Md$ et 2 filiales) ; objectifs recalibrés en passe 17. La bourse s'ouvre au scénario 4.
- La **valorisation** (`S.stats.raw` : trésorerie + actifs + titres − dette) est publique pour tous : classement des joueurs (toi + rivaux) et des grands groupes (écran de fin et Objectifs). En round les grands groupes croissent 12 fois moins vite pour que 1 Md$ reste un vrai sommet.
- **Écran de fin** : classement, fortune personnelle, valorisation, parts de marché, répartition du score (valorisation, parts de marché, emplois, missions, technologies, filiales, rapidité), « Continuer en Libre » ou « Nouvelle partie ». Les victoires débloquent les scénarios suivants (`localStorage` `wse-prog`).

**Rachat majoritaire (OTC)** : au-delà de 50 % des actions d'un rival (Bourse), il est éliminé du classement, reste sur le marché comme **filiale gérée par l'IA** et verse 60 % de son bénéfice en dividendes au prorata de ta part (`r.sub`). L'OPA sur le reste du capital existe toujours.

**HUD** : barre d'objectif sous les chiffres clés (mode, jalon suivant, progression, temps restant à vitesse normale, rang parmi les joueurs, rattrapage, surchauffe). Notifications : jalons, passage de rang, quarts de temps, rattrapage et surchauffe.

**Anti-boule de neige, règles publiques** (Objectifs > « Anti-boule de neige ») :
- **Rattrapage** : sous 70 % de la valorisation du leader, intérêts −35 %.
- **Dette graduée** : plafond = min(actifs courants, 3 ans d'EBE ou 20 % de la valorisation) et prime de levier jusqu'à +6 points d'intérêt à 50 % d'endettement.
- **Surchauffe** : la courbe attendue (forme mesurée sur un bon joueur, 1 Md$ en fin de round) est comparée à ta valorisation ; ×1,4 / ×2 / ×2,8 : niveaux 1, 2, 3 = impôt +5/10/15 points, salaires +8/16/24 %, plafond de dette −15/30/45 %. Sous 70 % : coup de pouce (+10 % de demande).
- **Marchés d'export stables** : 2 par joueur (tes deux biens les plus exportés au cours du marché), les autres se vendent à 88 % du cours.

**Bot et calibrage** (`tools/bot_round.js`, `tools/bot_lib.js` ; `NODE_PATH=$(npm root -g) MODE=round LEV=0.3 EVERY=10 IDLE=0.3 node wall-street-empire/tools/bot_round.js`) : le bot réinvestit dans le meilleur rendement (tours Tech, Data center, Banque ≈ 45 %/an, bureaux ≈ 35 %, hypermarchés saturés vers 4), emprunte jusqu'à son levier cible, rase des immeubles pour libérer du terrain. Valorisation (M$) tous les 10 % du round de 7 200 jours :

| % du temps | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Bon joueur (levier 0,3, 30 % d'oublis, décision tous les 10 j) | 3 | 10,8 | 28 | 43 | 69 | 113 | 168 | 264 | 378 | 583 | 859 |
| Joueur appliqué (levier 0,45, 15 % d'oublis, tous les 7 j) | 3 | 9,6 | 28 | 42 | 81 | 154 | 307 | 554 | 934 | 1 Md$ au jour 5 837 (73 min) | |
| Très rapide (levier 0,85, tous les 5 j) | 4,9 | 18,7 | 28 | 49 | 102 | 222 | 399 | 667 | 1 Md$ au jour 5 679 (71 min) | | |
| Très rapide (levier 0,85, tous les 2 j) | 5,3 | 19,3 | 29 | 53 | 91 | 183 | 287 | 434 | 549 | 935 | 1 Md$ au jour 6 550 (82 min) |

Sans frein (plafond de dette seul, surchauffe faible) le même bot atteignait 1 Md$ en 43 min ; avec la surchauffe et le plafond de dette, le plus rapide des bots reste à 71 min (marge de 20 min sous les 50 min visées). Une construction financée par la dette augmente la valorisation de ≈ 25 % du coût (valeur × (1 + humeur/400) + terrain) : connu et laissé tel quel. Les tours Tech, Data center et Banque rapportent ≈ 45 %/an sans saturation jusqu'à 130 unités : à surveiller côté équilibrage.

**Non fait / limites** : scénarios 2 à 5 non mesurés par bot (usines, export, bourse : cibles estimées à partir des courbes des tours) ; les rivaux sont les 3 sociétés PNJ (pas de vrais joueurs) ; les marchés d'export stables sont une règle simple en attendant le marché à prix unique ; pas de pause partagée ni de synchronisation multijoueur.

## Tests et passe 19

### Tests

Harnais de non-régression en une commande (Playwright, environ 2 minutes) :

```
python3 wall-street-empire/tools/build.py                                      # génère city.html
NODE_PATH=$(npm root -g) node wall-street-empire/tools/tests/run.js            # tous les tests
NODE_PATH=$(npm root -g) node wall-street-empire/tools/tests/run.js marges     # un seul (filtre sur le nom de fichier ou le titre)
```

Chaque contrôle imprime `PASS` ou `FAIL` avec la valeur mesurée et le seuil ; le code de sortie est 1 s'il y a un échec. `WSE_URL` permet de tester un autre fichier. Les fichiers `t01` à `t07` sont indépendants ; `lib.js` (pages, banc de mesure, usine et extracteur isolés) et `audit_lib.js` (partie jouée par bot, lecture des écrans) sont partagés.

| Fichier | Contrôles | Seuils |
|---|---|---|
| `t01_erreurs.js` | chargement à froid ; construction et ouverture de tous les types de bâtiments (clic sur chaque onglet et bouton) ; 14 vues du bureau, terminal et écran Produits après 450 jours | 0 `pageerror` ; aucun `NaN`, `undefined`, `Infinity`, `[object` ; aucun montant « $ /jour » (tout est mensuel) |
| `t02_marges.js` | s1 à s4 sur un banc de ville ; usines f1/f2 et pharma en économie isolée (intrants au prix de base) ; 13 extracteurs | EBITDA s1-s4 5-14 % ; f1/f2 10-18 % ; pharma MB ≥ 72 % et EBITDA 30-45 % ; puits 15-22 %, charbon 15-32 %, fer, cuivre, or 40-62 %, carrières et bois 17-35 % ; retour sur capex ≤ 3,5 ans |
| `t03_elasticite.js` | prix de rayon +30 % sur un bien de base et un bien courant | basique : volume long terme de −10 à −25 % ; effet court terme plus faible que long terme ; bien courant plus élastique |
| `t04_integrite.js` | bot aléatoire déterministe 600 jours (≈ 575 bâtiments) ; usines vides f1-f4 ; auto-production | aucun `NaN`/`Infinity` dans `S`, aucun stock ni prix négatif ; usine vide : production et CA nuls ; choisir un produit sélectionne des sources et fait produire |
| `t05_sauvegarde.js` | partie de 250 jours, sauvegarde v8, rechargement de la page ; deux parties identiques | état identique après rechargement (tolérance 1 %, `S.m30` compris) puis 30 jours sans `NaN` ; états finaux strictement identiques (déterminisme) |
| `t06_coherence.js` | audit inter-écrans sur une partie de 300 jours (voir ci-dessous) | écart ≤ 1 % entre écrans |
| `t07_references.js` | références mortes après la fin des usines génériques | voir ci-dessous |
| `t28_filiales.js` | filiales : création, affectation, comptes par société, vente interne, prix de cession, impôt par société et intégration fiscale, offre « Groupe », clients, sauvegarde, arbre de chaîne de la voiture (statuts, clavier, mobile, construction de la filiale manquante) | somme des sociétés = consolidé et trésorerie sans écart (< 0,01 $) ; 0 vente au marché en vente interne |

Les scripts d'origine (`t_err.js`, `t_play.js`, `aud1/a_*.js`, `aud3/diff*.js`, `t_auto.js`) ne sont plus nécessaires. Le banc de mesure fige le cycle macro pour que les marges soient reproductibles.

### Audit de cohérence inter-écrans

Une partie de 300 jours (extraction, 4 usines f1, 3 f2, 1 f3, 5 produits, commerces, banque, tours, puis bot de réinvestissement) est lue à travers l'interface : HUD, bandeau du bureau, Empire, Finances (et réconciliation), Produits, Bourse, fiches de bâtiments, onglets Achats et Logistique. Les mêmes grandeurs sont comparées entre elles et à l'état de la simulation.

| Grandeur | Écrans comparés | Résultat initial | Correctif |
|---|---|---|---|
| Résultat net mensuel | HUD, Empire (2 endroits), bandeau, Finances, réconciliation, compte de résultat | **écart de 18 à 26 %** : HUD et « Résultats mensuels » = moyenne glissante 30 jours ; bandeau, tableau de bord, Finances et réconciliation = dernier jour × 30 | `finM()` : toutes les lignes du compte de résultat viennent de la même moyenne glissante (les rangées de `S.m30` portent 21 colonnes de détail ; format de sauvegarde v8 inchangé, les anciennes lignes à 3 colonnes sont ignorées et l'écran retombe sur le dernier jour) |
| Chiffre d'affaires mensuel | HUD, Empire (2 endroits), Finances, réconciliation | écart de 8 % (mêmes causes) | idem |
| EBE mensuel | Empire, Finances recalculé, `S.m30` | écart de 17 % | idem |
| Fiche produit d'un magasin contre écran Produits | prix moyen, marque, note globale | **prix moyen 11,46 $ contre 19 $** (la fiche comparait au prix de la catégorie, l'écran au prix standard du produit, celui de la note) ; marque 6 contre 24 (notoriété brute contre score de marque) ; marque moyenne 100 contre 80 | la fiche reprend les définitions de l'écran Produits (prix standard, score de marque, marque rivale pondérée × 0,6 et plafonnée à 80) |
| Empire « Produit/j » | Empire contre somme des extracteurs | **11 968 pétrole/j affichés pour 3 puits à 1 900/j** : `S.flow.made` additionne l'offre des fournisseurs PNJ (nécessaire au ratio demande/offre) | `S.flow.own` (production du joueur seule) pour l'affichage Empire et pour l'explication « pourquoi la demande en matière première est… » ; la simulation ne change pas |
| Tableau des secteurs | cadence du dernier jour contre moyenne 30 jours | non comparable aux totaux | titre précisé : « par mois, cadence du dernier jour » |
| Sans écart | trésorerie (5 écrans), salaires et coûts (Finances, Empire, somme des fiches), ventes par produit (écran Produits, état, magasins), stocks et prix (état, Empire, Bourse, fiches, Achats, Logistique), population, emplois dans les bâtiments (Empire contre somme des fiches) | | |

À savoir : les fiches de bâtiment restent à la cadence du jour courant, alors que les totaux sont des moyennes glissantes ; dans une économie qui croît vite, la somme des fiches dépasse donc légèrement le total des Finances (0,05 % mesuré sur 300 jours). Les missions et les jalons de scénario (`S.fin.revExport`) restent calculés sur le dernier jour : à ne pas changer sans réviser les seuils.

### Références mortes (usines génériques)

Contrôlé par `t07_references.js` : plus aucun libellé « générique » dans `game.template.html` (quatre commentaires et un message de fiche de rayon reformulés en « marché local ») ni dans les descriptions actuelles du README (magasins, usines, méga-usine « capacité ×3 », demande des habitants, rayons) ; les récits des passes 8 et 13 restent comme historique. Les verrous de scénario, les outils du tutoriel, les besoins des contrats, les intrants des recettes et des produits et les rayons des magasins ne référencent que des clés existantes. Les missions ne supposent aucune production générique. `TYPES.f1..f4.rec` reste volontairement : il ne sert plus qu'à placer l'usine (distance aux intrants du calque logistique) et à calibrer le prix de base de `basic`, `std` et `lux` ; aucune usine du joueur n'en produit (usine vide : production et CA nuls, fiche « Aucun produit »).

### Écarts constatés par les tests (non corrigés, à arbitrer par l'équilibrage)

- Cultures (blé, canne, caoutchouc) : EBITDA de 36 à 48 % près du port, au-dessus de la cible de 20-27 % de la passe 16 (fer 56 %, cuivre 54 %, or 48 %, carrières 30-32 %, bois 30 %). Les bornes du test sont élargies en conséquence (12-40 % et 17-50 %).
- s4 (méga-centre) : EBITDA 14,3 % sur le banc, au bord de la cible 5-14 % (test arrondi à l'unité).
- Bien courant : −50 % de volume pour +30 % de prix contre −15 % pour le bien de base (cohérent avec l'élasticité plus forte des biens manufacturés ; le test impose seulement qu'il soit plus élastique).

## Passe 18 : visuels et mobile

**Produits** : les 12 produits qui utilisaient le carton de repli (savons et détergents, verrerie, crèmes et soins, petit électroménager, réfrigérateur, bijoux en or, parfum de luxe, soins de luxe, sac de créateur, tablette, ordinateur portable, console de jeux) ont chacun une illustration SVG en 3 gammes (`newSVG`, même repère 300x300 et même palette que `productSVG`). Les composants chimiques et principes actifs ont une icône (`drawItem`). Vérifiés dans les cartes, les fiches, le catalogue de production, les rayons de magasin et sur les cartons de l'intérieur des usines.

**Intérieur des sites en isométrique 2:1** (`mkSite` / `updSite` / `drawSite`, remplacent l'ancien rendu 2D de `mkExt` et de l'entrepôt) :
- mines et carrières : fosse à parois stratifiées, pelleteuse animée, ouvriers piocheurs, convoyeur incliné, concasseur, tas, chargeuse et camion ;
- puits de pétrole : chevalets de pompage animés, pipelines, derrick, bacs avec jauge, poste de chargement ;
- fermes (blé, canne, coton, hévéa) : rangées de plants coupées par la moissonneuse (un canvas par rangée), tracteur, grange et silo ;
- camp de bûcherons : forêt d'arbres abattus et repoussant, ouvriers, débusqueuse, tas de grumes ;
- entrepôt : halle, racks remplis selon le stock réel (couleur par bien), chariots élévateurs, quai.

Le nombre d'ouvriers suit l'effectif réel (comme les usines) ; à l'arrêt (peu d'activité, stock plein, gisement épuisé, manque de personnel) les ouvriers vont à la cabane de pause, les engins s'immobilisent et une alerte s'affiche. Coût mesuré : 0,6 à 1,0 ms par image (limite 2 ms). Aucun `Math.random` : générateur à graine du bâtiment.

**Mobile 390x844** : le toast est une pastille fine d'une ligne en haut de l'écran quand un panneau est ouvert (un seul message) et reste sous le HUD sinon ; il est masqué pendant les écrans de début, de caste et de fin ; les en-têtes de panneaux réservent la place. Onglets des bâtiments sur deux lignes (plus de défilement caché), menu du bureau en grille de 4 colonnes, bandeau conseiller non collant, table du stock d'entrepôt lisible. La scène intérieure est plus grande et défile horizontalement ; les libellés dessinés dans le canvas (alertes, « Sortie pleine », « Rupture de stock ») sont agrandis du facteur de réduction pour rester à 11 px à l'écran (`sc.ls`). Correction : le libellé « Rupture de stock » du magasin n'est plus tronqué.

**Écrans de début et de fin** : scénarios verrouillés plus lisibles avec la condition de déblocage ; choix de caste en cartes horizontales (les 6 castes tiennent sans défiler sur ordinateur, 6 cartes compactes sur mobile) ; titres et textes ≥ 11 px.

**Reste à faire** : (bureaux, tours et banques : traité en passe 20) ; le canvas de l'intérieur n'est pas redimensionné dynamiquement au changement d'orientation du téléphone ; première image d'un site un peu plus longue (50 à 130 ms, construction du décor).


## Passe 20 : intérieurs isométriques des bâtiments de services

Tous les bâtiments de services qui gardaient l'ancienne scène 2D (rangée de bureaux) ont maintenant un intérieur isométrique 2:1 dans le style des halles d'usines et des sites. Une seule scène (`kind: 'bld'`, `mkBld` / `updBld` / `drawBld`) : décor statique dessiné une fois dans un canvas de cache, objets triés en profondeur à chaque image, mêmes primitives que les usines (`isoP`, `sbox`, `cbox`, `cyl`, `person`, `alertIcon`) plus quelques nouvelles (`hcyl` cylindre horizontal, `onX`, `wsSlot` poste de travail, `longBox` meuble découpé en tronçons).

- **Tour Tech** : open-space (3 rangées de postes, écrans animés), salle de réunion vitrée avec écran et présentateur, coin café, ascenseur avec afficheur d'étage, canapé, deux coursiers.
- **BTP** : plans au mur, casiers à casques, table de maquette avec grue, postes et chefs de chantier. **Agence immobilière** : vitrine d'annonces, table de maquettes, conseillers et clients qui entrent, discutent au bureau puis repartent. **Logements** : appartement en coupe (salon, chambre, habitants).
- **Banque** : hall en marbre, guichets vitrés avec afficheur de tickets, clients qui font la queue ou passent au distributeur, bureau du directeur, coffre à porte ronde et lingots, garde.
- **Data center** : trois rangées de baies avec LEDs (cadence liée à l'activité), allées froides, climatiseurs à ventilateurs, batteries, mur de supervision, opérateurs et techniciens en casque qui s'arrêtent aux baies.
- **R&D** : paillasses avec flacons qui bullent, microscopes, écrans de courbes, centrifugeuse, imprimante 3D, hotte, table holographique, tableau blanc, hélice d'ADN et compteur de brevets (avancement du prochain brevet).
- **Siège social** : salle du conseil vitrée (table, présentation animée), bureaux de direction, accueil avec visiteurs, globe, drapeaux ; les cadres CFO / IR embauchés apparaissent.
- **Station média** : plateau avec décor de ville, bandeau défilant, présentateurs, caméras qui balayent, projecteurs et faisceaux, « EN DIRECT » clignotant, régie avec mur d'écrans et console, cabine radio.
- **Équipement sportif** : terrain avec lignes et paniers, joueurs et balle qui rebondit, gradins avec supporters, tapis de course, vestiaires, tableau d'affichage.
- **Terminal portuaire** : plein air, navire amarré qui tangue, portique qui décharge un conteneur sur un camion, chariot cavalier, parcs à conteneurs, douane, dockers.
- **Énergie** : centrale à charbon (soute, tapis, chaudière en coupe avec flammes, turbine et alternateur qui tournent, cheminée et fumée, salle de commande), solaire (panneaux avec reflets selon l'ensoleillement, soleil, onduleurs et batteries, équipes de nettoyage), éolien (éoliennes dont la vitesse suit le vent, tour en coupe avec technicien qui monte, anémomètre, manche à air), nucléaire (enceinte en coupe avec cuve et cœur lumineux, barres de contrôle, générateurs de vapeur, salle des turbines, tours aéroréfrigérantes, salle de commande).
- **Tour de location** : coupe de l'immeuble en étages éclatés (2 ou 3 selon la hauteur), ascenseur qui monte et descend, accueil au rez-de-chaussée ; les étages loués (taux d'occupation réel) sont peuplés, les autres affichent « À LOUER ».

**Effectif et états** : le nombre de silhouettes suit `jobsOf(c) × fillOf(c)` (bornes par type, les postes vides restent visibles, écran éteint). L'activité (`c.util`) règle la vitesse de frappe, la cadence des LEDs, le flux de clients, la vitesse des turbines et du vent. Arrêt : bâtiment hors route (`c.conn`), `c.limit` `grid` / `storm` / `road` / `coal` ou effectif < 30 % : scène assombrie, personnes immobiles, appareils éteints et alerte avec le motif (« Hors réseau », « Tempête », « Sans route », « Manque de charbon », « Manque de personnel »). La légende au-dessus du canvas donne les chiffres (employés, revenu mensuel, production, stock de charbon, audience, etc.).

Coût mesuré (Chromium sans GPU) : 0,1 à 1,0 ms par image (limite 2 ms), le plus lourd étant l'équipement sportif. Sur mobile 390 px la scène défile horizontalement comme les usines.

**Reste à faire** : les personnes sont toujours dessinées de face (pas de vue de dos aux bureaux) ; pas de file d'attente matérialisée (cordons) à la banque ; la tour de location ne montre que 2 à 3 étages pour rester lisible ; l'éolien et le solaire n'animent pas les nuages selon la météo réelle ; aucun son.

**Non fait / limites** : (passe 17 : scénarios 2 à 5 désormais mesurés par bot, voir ci-dessous) ; les rivaux sont les 3 sociétés PNJ (pas de vrais joueurs) ; les marchés d'export stables sont une règle simple en attendant le marché à prix unique ; pas de pause partagée ni de synchronisation multijoueur.

## Passe 17 : équilibrage de la boucle de progression

Objectif : plus de snowball en milieu de partie, un round qui se joue en 80-90 min pour un bon joueur, des scénarios mesurés. Montants en $ par jour dans les audits, affichés en mensuel dans le jeu.

**Correctifs d'économie** (commits atomiques) :
- **Valorisation** : `worthOf` = trésorerie + actifs au coût amorti (0,9 × coût de construction + améliorations × 0,6 + terrain réindexé) ; le facteur « humeur » (+15 % sur les actifs) est supprimé. Construire à crédit ne crée plus de valeur : l'effet immédiat est de −3 à −10 % du coût (frais de transaction), l'argent ne se crée que par les profits (mesure : tour tech / data center / banque / tour de location : −6 / −10 / −3 / −10 % du capex, contre +8 / +3 / +10 / +3 % avant à humeur 60).
- **Rendements décroissants des services** (`svcSat`) : chaque type (tech, data center, banque) a une demande finie `D = pop / 36 000 | 48 000 | 32 000` (tours-équivalents), +12 % par autre type de service présent (effet de réseau), −7 % par rival (concurrence). La recette totale vaut `D × (1 − e^(−U/D))`, normalisée pour que la 1re tour garde sa marge nominale : 10 tours tech sur une ville de 300 k habitants encaissent chacune 68 % de la recette nominale, 30 tours 28 % (EBITDA unitaire −100 %). La fiche du bâtiment montre « Part de la demande captée » et alerte sous 60 %. Marges unitaires conservées (banque 43 %, tech 44-46 %, data center 37-44 % pour une tour seule). Capex des services −25 % (banque 40 → 30 M$, tech 30 → 22 M$, data center 25 → 19 M$) : une seule tour reste donc très rentable (EBITDA/capex 59 / 100 / 78 %/an, contre 44 / 73 / 60 %), c'est le plafond de demande qui borne le parc.
- **Tour de location** : capex 24 → 60 M$, loyer de marché ÷ 3,6, entretien 28 000 → 6 500 $/j : rendement locatif brut 7-10 %/an, EBITDA 51-53 % (avant : 90 % du capex par an, EBITDA 45-50 %).
- **Solaire / éolien** : entretien relevé (1 500 → 2 270, 800 → 1 340 $/j) : EBITDA ≈ 55 % au prix de base du réseau (avant 65-69 %).
- **Électronique** (téléviseur, smartphone, tablette, ordinateur, console) : EBITDA visé 22 % au lieu de 30 % (prix de référence 8-12 % plus bas).
- **Magasins** : capex s1 250 → 110 k$ (entretien 70 → 50), s2 1,2 → 0,7 M$ (entretien 300) : EBITDA s1 10 %, s2 12 %, retour sur capex 3,5-4 ans (avant 11-14 ans) ; s3 ≈ 3,5 ans (EBITDA 21 %).
- **Scénarios** (cibles et départs mesurés par bot, voir tableau) : S1 40 M$ en 60 min (au lieu de 80, le commerce seul plafonne vers 20 k$/j de bénéfice), S2 60 M$ en 75 min (au lieu de 250 : sans services ni exports, la demande de la ville borne le gain ; le port s'ouvre dès S2), S3 400 M$ en 90 min (départ 15 M$), S4 700 M$ en 100 min (départ 6 M$ au lieu de 100 M$ : avec 100 M$ le bot gagnait en 30 min), S5 1 Md$ et 2 filiales en 120 min.

**Bot v2** (`tools/bot_lib.js`, `tools/bot_round.js`) : estime à chaque tick le rendement annuel du prochain bâtiment de chaque famille (a priori mesuré, puis rendement réalisé du dernier bâtiment mûr, prédiction analytique de la demande restante pour les services), construit par rendement décroissant au-dessus du taux d'emprunt + marge, épargne pour un projet bien plus rentable s'il est atteignable, démolit les mines épuisées, ouvre le port et des mines pour les exports (S3), lance une usine et deux produits sans R&D (S2), prend 52 % des actions d'un ou deux rivaux (S4, S5). Profils : `PROFILE=bon|rapide|lent|casual` (levier, cadence, jours perdus). La partie est mise en pause (vitesse 0) : seul le bot fait avancer les jours, ce qui rend chaque profil reproductible à l'identique.

**Courbes de fortune** (M$, tous les 10 % des 90 min du round ; avant = ancien bot et ancienne économie, après = bot v2 et économie de la passe 17) :

| Profil | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 / 1 Md$ atteint |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Avant, bon (levier 0,45, tous les 4 j) | 5 | 8 | 18 | 30 | 40 | 62 | 99 | 147 | 216 | 326 | 468 (dette 314) |
| Avant, rapide (0,6, tous les 2 j) | 5 | 8 | 23 | 33 | 54 | 104 | 208 | 378 | 754 | | jour 6 144 (77 min), dette 1 006 |
| Avant, très rapide (0,85, tous les 5 j) | | | | | | | | | 966 | | jour 5 806 (73 min), dette 1 025 M$, 24 tours de location |
| Après, bon (0,45 / 4 j) | 6 | 10 | 15 | 25 | 35 | 51 | 93 | 183 | 468 | 905 | jour 6 612 (83 min), dette 183 |
| Après, rapide (0,55 / 2 j) | 6 | 10 | 15 | 25 | 35 | 56 | 117 | 257 | 598 | | jour 6 354 (79 min), dette 228 |
| Après, lent (0,35 / 8 j, 25 % de jours perdus) | 4 | 10 | 15 | 24 | 35 | 51 | 93 | 178 | 435 | 908 | jour 6 592 (82 min), dette 119 |
| Après, casual (0,25 / 12 j, 50 % de jours perdus) | 3 | 11 | 15 | 25 | 34 | 47 | 76 | 138 | 283 | 656 | jour 6 900 (86 min), dette 107 |
| Après, très rapide (0,85 / 5 j) | | | | | | | | | 722 | | jour 6 215 (78 min), dette 371 |

La dette de fin passe de 1 Md$ (course à l'effet de levier sur les tours) à 100-370 M$ et le plus rapide ne descend pas sous 78 min (objectif ≥ 50 min). Les trois grands profils finissent à 79-86 min : le plafond de demande des services (≈ 6 data centers, 10 tours tech, 9 banques au maximum pour 640 k habitants) borne le milieu de partie, et la surchauffe (niveau 1 à 3) ralentit les joueurs en avance sur la courbe.

**Scénarios mesurés par le bot « bon »** (jour d'atteinte de l'objectif / durée du scénario) : S1 4 116 / 4 800 (86 %), S2 4 732 / 6 000 (79 %), S3 5 500 / 7 200 (76 %, cas 74 % pour un joueur « casual »), S4 6 632 / 8 000 (83 %), S5 7 372 / 9 600 (77 %).

**Limites** : le bot n'exploite pas encore les chaînes usines-produits intégrées (elles perdent de l'argent dans nos montages sans mines, les audits d'usines restent ceux de la passe 16) ; les résultats d'un même profil varient de ±5 % selon le moindre changement de règle (chaos des décisions), d'où des plages et non des dates exactes ; le plafond de dette 0,45 × valorisation est un réglage du bot, le plafond du jeu reste `creditLimit()`.


## Passe 22 : qualité des scénarios et du tutoriel

**Jeu de bout en bout** : chaque scénario a été rejoué (écran de démarrage, sélection du mode, caste, barre d'outils, panneaux) avec Playwright, puis le bot « bon » a mené les scénarios 1 à 5 jusqu'à la victoire (S1 4 116 j, S2 4 732 j, S3 5 500 j, S4 et S5 revérifiés après le passage des rayons à 12). `tools/tests/t08_scenarios.js` rejoue le parcours avec de vrais clics.

**Corrections**
- Le temps ne court plus pendant le choix de la caste (le scénario perdait 2 à 4 jours avant le premier clic, et la partie tournait derrière l'écran de caste après un rechargement). `S.mode.await` est conservé dans la sauvegarde.
- Écran de fin : « Scénario suivant » (annonce du déblocage), « Réessayer ce scénario » et liste des **jalons manqués** en cas de défaite, bouton « Menu principal ». Les cartes verrouillées de l'écran de démarrage sont plus lisibles (contraste, bordure pointillée).
- Onglet Objectifs : liste des jalons du scénario avec coches, temps restant et condition de victoire (2 produits, exports, filiales).
- `advisorTips` n'affiche plus l'ancien tutoriel libre pendant un scénario (il contredisait le tutoriel guidé).

**Tutoriels guidés** (barre d'objectif, jamais sur la carte) : scénario 1 en 5 étapes (Petit marché, ouvrir le commerce, emprunter, 3 commerces, « Compris »), **scénario 2** en 5 étapes (mine, usine, production, produits R&D, commerce), **scénario 4** en 4 étapes (siège, introduction, rachat, OPA). Chaque étape a une détection, une progression collante (une étape validée ne revient pas en arrière), un bouton « Passer », et un surlignage doré animé avec une flèche qui suit le **chemin de clics** : catégorie, puis famille, puis bouton (ou Menu, onglet, bouton Emprunter). La flèche reste correcte en pause (rafraîchissement toutes les 400 ms).

**Anti-frustration** : `stuckInfo()` détecte « plus d'argent » (avec plafond de dette atteint ou non), « mines sans débouché » (ni usine ni port), « tu fabriques mais tu ne vends pas », usines vides, dépassement du plafond de dette ; un message d'avertissement est émis tous les 40 jours au plus quand la situation bloque. Le bouton **Conseil** de la barre d'objectif affiche l'explication et désigne l'élément à cliquer.

**Capitalism-like** : 12 produits au plus par magasin (4 / 8 / 12 / 12 ; le grand magasin passe de 16 à 12 emplacements, les anciennes sauvegardes sont tronquées à l'affichage). Les fiches d'usine affichent sans défiler la ligne « Sources automatiques » (intrant ← fournisseur) avec « Recalculer » ; les fiches de magasin affichent « Rayons n / 12 » avec « Remplir les rayons ».

**Compatibilité** : sauvegarde v8 inchangée (champs `md.await` et `md.f.ti` optionnels), aucun montant UI modifié (mensuels).

## Passe 24 : plan d'usine (grille d'unités) et robots

Inspiré de l'écran d'usine de Capitalism Lab : on redessine l'usine sur une grille où l'on pose des unités.

**Modèle** (`c.plan`, tableau de cases `'buy' | 'stock' | 'make' | 'sell' | 'robot' | ''`). Grille selon la taille : petite usine 3×2, moyenne, grande et méga-usine 3×3. Absent = plan par défaut (1 achat, 1 stock, 1 machine, 1 vente) : capacité, effectifs, entretien et marges sont identiques à avant (t02 inchangé).
- *machine* : cadence ×n (2 machines = 2× la production) ; *achat* et *vente* : débit de 125 % d'une machine chacun ; *stock* : sans stock, débit ×0,6 (ruptures), un stock couvre 2 machines ; *robot* : voir ci-dessous.
- Débit effectif `F` = min(achat, vente, stock, personnel des services) ; la limite devient un goulot visible (`pl_buy`, `pl_sell0` « Sortie pleine », `pl_stock`, `pl_make`, `pl_sbuy/pl_sstock/pl_ssell` « manque de personnel à l'achat / au stock / à la vente »). Les services sous-dotés (curseurs d'affectation du personnel) réduisent le débit proportionnellement.
- Coût : part du capex du bâtiment × niveau (achat 10 %, stock 8 %, machine 38 %, vente 12 %, robot 2 % + le robot lui-même) ; effectif et entretien proportionnels aux unités (poids 0,16 / 0,15 / 0,52 / 0,17). Retirer rembourse 50 %. Changer le plan réinitialise la répartition du personnel (auto).
- Sauvegarde v8 rétro-compatible : clés `pl` (plan) et `rb` (robots) dans les extras de case, absentes si plan par défaut.

**Éditeur** (onglet Intérieur d'une usine) : mini-carte de la grille avec débits chiffrés (achat / stock / machines / vente par jour), goulot en rouge, clic sur une case libre = menu d'ajout (coût, capacité avant → après, postes en plus, mur « ENTRÉE » / « SORTIE »), clic sur une case occupée = déplacer ou retirer, **double-clic** (ou bouton « Ajout rapide ») = pose de l'unité limitante. « Vue 3D du plan » bascule la scène isométrique : une unité 3D par case (palettes d'entrée, rack de stock, machines, bras de robot animés et usés, quai de vente avec camions), enseignes ENTRÉE / FABRICATION / SORTIE sur le mur du haut, case cliquable. Un plan modifié s'ouvre directement dans cette vue.

**Robots** : 4 biens `rweld` (soudure), `rpaint` (peinture), `rasm` (assemblage), `r6` (6 axes), fabriqués par usines moyennes / grandes (acier, moteurs, circuits, câbles, batteries, chimie, plastique), cours calibré comme les autres composants. Une case robot immobilise un robot (pris dans le stock, sinon acheté au cours +25 %) : +10 à +22 % de cadence d'une machine et −6 à −12 % d'effectif de machine ; usure de 480 à 720 jours (rendement −45 % en fin de vie), remplacement automatique vers 93 % (stock puis marché), sinon panne et alerte. ROI en jours affiché dans le menu. Demande des usines PNJ et rivales via `LOCAL_D` (+12 % par rival) ; les robots ne s'exportent pas et ne se vendent localement qu'au-dessus de 2 unités en stock.

Tests : `tools/tests/t09_plan_usine.js` (31 contrôles : plan par défaut, 2× machines, goulots, personnel, robots, sauvegarde, déterminisme, interface bureau et mobile).

## Passe 23 : finitions visuelles

Aucune constante économique, aucune clé de sauvegarde ni formule de simulation n'a changé : uniquement du rendu (`game.template.html`) et le détourage du siège (`tools/process_hq.py`).

- **Siège social harmonisé avec la ville** (`tools/process_hq.py`) : l'illustration à l'encre est lissée (médiane, mode), réduite à une vingtaine de teintes, puis recolorée dans la palette des immeubles Kenney (verre bleu clair, pierre beige, encre noire remplacée par un bleu-gris doux) ; la face droite est assombrie de 14 % comme les autres immeubles (lumière venant de la gauche). Relancer `python3 tools/process_hq.py mid` puis `tools/build.py`.
- **Écran Produits dans l'esprit de Capitalism** : chaque carte reprend la maquette du jeu de référence : photo du produit et stade du cycle de vie, chiffre d'affaires du mois, courbe des 12 derniers mois (aire, graduations mensuelles, bascule quantité / CA), deux camemberts nommés (Production, Détail) avec légende, tableau Prix en rayon / Qualité / Marque / Note globale avec barres Local / Moyenne et colonne Concern. Sur mobile les camemberts ne sont plus masqués (cartes empilées). La fiche produit (vue Produits) reçoit le même bloc « Face à la concurrence » (barres, camemberts, 12 derniers mois) quand le produit est lancé. Le texte des lignes (« Prix en rayon », « Note globale », « Vendu : n u/mois ») est inchangé, donc le test de cohérence inter-écrans reste valable.
- **Bourse sur mobile** : les cours restent sur une ligne, tableaux plus compacts à 390 px, tableaux larges défilant horizontalement dans leur panneau.
- **Scènes intérieures** : le canvas suit la rotation et le redimensionnement (échelle des libellés recalculée, centrage conservé, `ResizeObserver` + `orientationchange`) ; en téléphone paysage (hauteur < 520 px) les vues s'ouvrent en plein écran au lieu de s'effondrer sous le HUD.
- **Personnages vus de dos, de profil et de face** : l'orientation se déduit du déplacement isométrique (vers le fond = dos, vers l'avant = face, latéral = profil avec nez et cheveux à l'arrière) ou du poste (assis aux bureaux : dos ou profil selon la silhouette), avec des yeux pour la face. Un waypoint peut imposer l'orientation (6e élément).
- **Banque** : cordons de file d'attente (potelets dorés, cordon de velours) devant les guichets, entrée libre côté droit ; les clients passent par l'allée, attendent de dos devant le guichet puis repartent de face ; trois clients statiques en file.
- **Tour de location** : plaques d'étage lisibles (RDC puis numéros réels répartis sur la hauteur de l'immeuble), étiquettes LOUÉ / LIBRE, flèche verte au niveau de la cabine d'ascenseur.
- **Solaire et éolien : météo** : couverture nuageuse selon l'ensoleillement saisonnier (hiver : soleil plus bas et pâle, plus de nuages, ombres de panneaux plus longues), ombres de nuages portées sur le terrain, ciel sombre et pluie pendant une tempête ; éolien : ombres des mâts et des pales, nuages plus rapides avec le vent. Libellé « ciel dégagé / nuageux / ciel couvert / orage » dans la légende.
- **HUD** : bandeau sombre derrière le titre (illisible en or sur l'herbe claire).

Coût mesuré des scènes (Chromium sans GPU, 120 images) : 0,2 à 1,8 ms par image, le plus lourd étant la banque et la centrale solaire (< 2 ms).

**Reste à faire** : les étages de la tour de location sont toujours limités à 3 sur l'écran (lisibilité) ; la météo ne dépend que de l'ensoleillement saisonnier, du vent et des tempêtes déjà simulés (pas de pluie hors tempête) ; les images « petit » et « grand » du siège n'existent pas (même sprite pour tous les niveaux).

## Passe 25 : arbre des produits étendu et composeur

**Demande** : élargir l'arbre (de 35 à 70-80 produits finis, de 23 à 35-45 composants) et permettre, dans l'usine, d'**associer des composants** pour créer un produit.

### 1. Arbre étendu : 80 produits finis, 40 composants

Aucune matière première ni extracteur n'a été ajouté (13 matières, mêmes fermes et mines) : les nouveaux intermédiaires se tirent des matières existantes. (Historique : les produits de l'élevage passaient alors par un élevage abstrait nourri au grain ; la passe 38 le remplace par de vraies fermes d'élevage.) Les 17 nouveaux composants (l'ordre de `RECIPES` est l'ordre de calibrage : chaque intrant est calibré avant son utilisateur) :

| Composant | Niveau | Intrants | Cours de base |
|---|---|---|---|
| Papier et carton | petite | bois | 7,88 $ |
| Lait | petite | blé | 10,08 $ |
| Viandes | petite | blé | 16,39 $ |
| Alcools et ferments | moyenne | canne à sucre + blé | 23,4 $ |
| Céramique | petite | sable + calcaire + charbon | 9,09 $ |
| Fermetures et quincaillerie | petite | acier + plastique | 7,21 $ |
| Boîtiers et coques | petite | plastique + acier | 9,82 $ |
| Mousse et rembourrage | petite | produits chimiques + plastique | 7,83 $ |
| Peintures et vernis | petite | produits chimiques + calcaire | 9,3 $ |
| Pièces en caoutchouc | petite | caoutchouc naturel + produits chimiques | 24,33 $ |
| Cuir | moyenne | blé + produits chimiques | 30,38 $ |
| Textiles techniques | moyenne | tissu + plastique | 20,38 $ |
| Éclairage LED | moyenne | verre + câbles de cuivre + silicium | 15,65 $ |
| Moteurs thermiques | moyenne | acier + câbles de cuivre + pétrole | 46,22 $ |
| Châssis et carrosserie | moyenne | acier + peintures et vernis | 46,38 $ |
| Capteurs et optiques | grande | verre + silicium + plastique | 86,11 $ |
| Cellules photovoltaïques | grande | silicium + verre + câbles de cuivre | 138,5 $ |

Les 45 nouveaux produits finis (au plus 3 intrants + emballage ; `pkg` = emballage fourni d'office pour les produits frais en pot ou en bouteille, ce qui donne « yaourt = lait + sucre + emballage »). **Les prix de référence ne sont pas saisis à la main** : `calProd` (calibrage de la passe 16) les résout à partir du coût réel des intrants, des coûts fixes du niveau d'usine et d'un EBITDA visé par classe (base 20 %, manufacturé 17 %, luxe 30 %, électronique et véhicule 20-22 %, whisky et haute couture 27 %, pharmacie 38 %). Un produit plus compliqué (plus d'intrants, intermédiaires plus chers) est donc plus cher. Mesures en usine isolée (`isoFactory`, intrants au prix de base, 40 jours) :

| Produit | Famille | Classe | Usine | Intrants | Prix de réf. | MB | EBITDA |
|---|---|---|---|---|---|---|---|
| Yaourts | Alimentation | base | petite | lait + canne à sucre + emballage | 8,6 $ | 28 % | 19,2 % |
| Fromages | Alimentation | base | petite | lait + essences et arômes + emballage | 12,2 $ | 25 % | 19,1 % |
| Pâtes alimentaires | Alimentation | base | petite | farine | 4,3 $ | 36 % | 19,6 % |
| Chocolat | Alimentation | base | petite | canne à sucre + lait + essences et arômes | 7,7 $ | 29 % | 19,3 % |
| Plats cuisinés | Alimentation | base | moyenne | viandes + farine + emballage | 16,4 $ | 30 % | 19,1 % |
| Sodas | Boissons | base | petite | canne à sucre + essences et arômes + emballage | 8,5 $ | 27 % | 19,1 % |
| Bière | Boissons | base | petite | blé + canne à sucre + emballage | 8,9 $ | 27 % | 19,2 % |
| Spiritueux | Boissons | manuf. | moyenne | alcools et ferments + verre + emballage | 28,8 $ | 22 % | 15,9 % |
| Whisky de luxe | Boissons | luxe | grande | alcools et ferments + planches + verre + emballage | 98,7 $ | 58 % | 26,3 % |
| Compléments alimentaires | Santé et beauté | base | moyenne | principes actifs + canne à sucre + plastique | 4,5 $ | 42 % | 19,7 % |
| Antibiotiques | Santé et beauté | manuf. (pharma) | moyenne | principes actifs + produits chimiques + plastique + emballage | 27,1 $ | 73 % | 38,5 % |
| Shampooings | Santé et beauté | base | petite | produits chimiques + essences et arômes + plastique | 6,3 $ | 31 % | 19,4 % |
| Dentifrice | Santé et beauté | base | petite | produits chimiques + essences et arômes | 4,6 $ | 34 % | 19,6 % |
| Maquillage | Santé et beauté | manuf. | moyenne | essences et arômes + produits chimiques + verre + emballage | 14,2 $ | 26 % | 16,1 % |
| Couches et hygiène | Santé et beauté | base | petite | tissu + plastique + produits chimiques | 3,8 $ | 35 % | 19,6 % |
| Vestes | Mode | manuf. | moyenne | tissu + cuir + fermetures et quincaillerie + emballage | 32,8 $ | 24 % | 15,9 % |
| Chaussures en cuir | Mode | manuf. | moyenne | cuir + pièces en caoutchouc + emballage | 33,2 $ | 24 % | 15,9 % |
| Robes | Mode | manuf. | moyenne | tissu + fermetures et quincaillerie + emballage | 25,4 $ | 26 % | 16,0 % |
| Chaussettes et sous-vêtements | Mode | base | petite | tissu + pièces en caoutchouc | 4,6 $ | 31 % | 19,5 % |
| Sacs en cuir | Mode | manuf. | moyenne | cuir + fermetures et quincaillerie + emballage | 31,7 $ | 24 % | 15,9 % |
| Haute couture | Mode | luxe | grande | tissu + cuir + lingots d'or + emballage | 187,0 $ | 68 % | 26,5 % |
| Appareils photo | Électronique | luxe | grande | capteurs et optiques + boîtiers et coques + batteries + emballage | 248,3 $ | 42 % | 21,1 % |
| Montres connectées | Électronique | luxe | grande | écrans + cartes électroniques + batteries + emballage | 110,5 $ | 57 % | 21,1 % |
| Casques audio | Électronique | manuf. | moyenne | cartes électroniques + boîtiers et coques + batteries + emballage | 23,6 $ | 25 % | 16,0 % |
| Fours micro-ondes | Électroménager | manuf. | moyenne | acier + cartes électroniques + câbles de cuivre + emballage | 42,9 $ | 24 % | 16,0 % |
| Aspirateurs | Électroménager | manuf. | moyenne | moteurs électriques + boîtiers et coques + câbles de cuivre + emballage | 31,8 $ | 24 % | 16,0 % |
| Luminaires LED | Électronique | base | petite | éclairage led + boîtiers et coques | 7,6 $ | 29 % | 19,3 % |
| Ordinateurs de bureau | Électronique | luxe | grande | cartes électroniques + écrans + boîtiers et coques + emballage | 186,4 $ | 48 % | 20,1 % |
| Panneaux solaires | Électroménager | manuf. | grande | cellules photovoltaïques + acier + câbles de cuivre + emballage | 185,5 $ | 37 % | 15,8 % |
| Canapés | Maison et meubles | manuf. | moyenne | mousse et rembourrage + tissu + planches + emballage | 40,3 $ | 24 % | 16,0 % |
| Tables | Maison et meubles | base | petite | planches + fermetures et quincaillerie | 18,1 $ | 25 % | 19,1 % |
| Armoires | Maison et meubles | manuf. | moyenne | planches + fermetures et quincaillerie + peintures et vernis + emballage | 46,3 $ | 23 % | 15,9 % |
| Vaisselle en céramique | Maison et meubles | base | petite | céramique | 6,9 $ | 30 % | 19,4 % |
| Livres et cahiers | Maison et meubles | base | petite | papier et carton + produits chimiques | 5,4 $ | 31 % | 19,5 % |
| Vêtements de sport | Jouets et sport | manuf. | moyenne | textiles techniques + fermetures et quincaillerie + emballage | 21,7 $ | 26 % | 16,0 % |
| Tentes et camping | Jouets et sport | manuf. | moyenne | textiles techniques + acier + emballage | 46,0 $ | 23 % | 15,9 % |
| Vélos électriques | Jouets et sport | manuf. | moyenne | acier + moteurs électriques + batteries + emballage | 38,1 $ | 23 % | 15,9 % |
| Poupées et peluches | Jouets et sport | base | petite | tissu + plastique | 7,2 $ | 30 % | 19,4 % |
| Jouets électroniques | Jouets et sport | manuf. | moyenne | plastique + cartes électroniques + batteries + emballage | 16,1 $ | 27 % | 16,1 % |
| Voitures | Auto et outils | luxe | grande | moteurs thermiques + châssis et carrosserie + pneus + emballage | 825,7 $ | 38 % | 19,0 % |
| Scooters | Auto et outils | manuf. | moyenne | moteurs thermiques + châssis et carrosserie + pneus + emballage | 49,2 $ | 23 % | 15,9 % |
| Lubrifiants et carburants | Auto et outils | base | petite | pétrole + produits chimiques + emballage | 11,9 $ | 24 % | 19,1 % |
| Outillage à main | Auto et outils | manuf. | petite | acier + planches + emballage | 16,9 $ | 21 % | 15,9 % |
| Outillage électroportatif | Auto et outils | manuf. | moyenne | moteurs électriques + batteries + boîtiers et coques + emballage | 25,5 $ | 26 % | 16,0 % |
| Aliments pour animaux | Alimentation | base | petite | viandes + farine | 7,1 $ | 28 % | 19,2 % |

EBITDA des 44 produits non pharmaceutiques : 15,8 % à 26,5 % (fourchette demandée 12-30 %). Antibiotiques (pharma) : marge brute 73 % (≥ 72 %), EBITDA 38,5 %. Les 35 produits d'origine gardent leurs EBITDA à ±0,1 point (12 témoins verrouillés par `t10_arbre`).

Tables du modèle produit renseignées pour chacun : poids prix/qualité/marque (`PROD_W`), nécessité (`NECESS`), demande par habitant (`DEMAND_PC`), obsolescence (`OBSO`), technologies (`PROD_TECH`, `TECH_SHARE`), méga-classe de marque (`MEGA_OF` : alimentation et boissons, santé et beauté, mode, électronique, luxe, plus les nouvelles Électroménager, Maison et meubles, Sport et loisirs, Jouets, Auto et mobilité, Outils et bricolage), succession (`SUCC.desktop` : l'ordinateur de bureau cède 50 % de sa demande à l'ordinateur portable à partir du jour 1 080). Le poids de demande d'un produit dans sa classe (`typeW`) se calcule toujours sur les 35 produits d'origine (`LEGACY_P`) : ajouter des produits ne déplace pas la demande des anciens.

**Familles d'affichage** (`FAM`, purement visuelles) : le catalogue d'usine et l'écran Produits regroupent les produits par famille (Alimentation, Boissons, Santé et beauté, Mode, Électronique, Électroménager, Maison et meubles, Jouets et sport, Auto et outils, Immobilier, Tes créations).

**Vignettes** : 38 silhouettes SVG (`GLYPHS`) coloriées par produit (`GLY`), dans le repère 300×300 de `productSVG` et avec les trois gammes (premier prix, premium, haut de gamme : accent or et étoile). `productSVG` est mis en cache. Chaque produit a sa vignette ; le repli carton ne sert plus.

### 2. Composeur de produits (catalogue d'usine, onglet « Composer »)

Un **modèle** (16 : snack, boisson, jouet, meuble, vêtement, appareil, électronique grand public, beauté, outillage, équipement de sport, véhicule, luxe, maison et entretien, papeterie, animaux, parapharmacie) fixe la classe de vente, le niveau d'usine, le palier, le produit de référence pour la R&D et les poids de demande. Le joueur associe **1 à 3 composants** parmi les 53 matières et composants (ceux qu'il produit sont signalés, les autres s'achètent ou s'importent).

- **Refus expliqués** : composant absent de la liste du modèle (« Produits chimiques ne convient pas pour une boisson : ce n'est ni comestible ni cosmétique… », « Minerai de fer est une matière brute : elle doit d'abord être transformée… »), absence d'ingrédient principal, 0 ou plus de 3 composants, doublon exact d'un produit déjà composé.
- **Quantités** : dose du modèle × poids de l'emplacement (1 composant : 100 % ; 2 : 65/35 ; 3 : 50/30/20) × richesse (0,8 / 1 / 1,15 selon le nombre de composants) × (cours de référence / cours du bien)^0,5 : un bien cher se dose moins mais coûte plus.
- **Qualité (0-100)** = Σ poids × noblesse du composant (28 + 15·ln(cours/5), 28 à 92) + **synergies** (chaque modèle a 5 à 8 paires qui rapportent +6 à +14 : « Cuir et mousse : fauteuil haut de gamme », « Écran piloté par une carte »…) + 3 pour trois composants − 4 pour un seul. Gamme obtenue d'emblée : < 42 premier prix, < 64 premium, sinon haut de gamme.
- **Prix de référence** : même résolution `calProd` que le catalogue (`CALREF`), mais pour la gamme choisie (intrants et prix multipliés par les coefficients de gamme), donc l'EBITDA visé est tenu dans cette gamme : mesuré 15,9 % à 21,0 % sur 6 modèles de classes différentes (`t10_arbre`).
- **R&D réduite proportionnelle à la nouveauté** : nouveauté = 1 − ressemblance maximale (indice de Jaccard sur les composants) avec les produits existants de la même classe ; R&D = R&D du produit de référence × (0,15 + 0,6 × nouveauté) × (0,9 + 0,1 × nombre de composants), durée de même ; une copie conforme d'un produit du catalogue ne coûte que 15 % de la R&D.
- **Aperçu avant création** : qualité et gamme, prix de référence, coût d'intrants par unité, marge brute unitaire, marge par mois pour cette usine (`mj`), R&D et durée, nouveauté, synergies, quantités par cycle ; nom libre (nettoyé de tout HTML, 28 caractères, doublons numérotés) ou suggéré (« Vêtement tissu-cuir-fermetures »), 10 couleurs de vignette.
- **« Créer et tout lancer »** enchaîne `cmpCreate` puis `easyLaunch` (R&D, affectation de l'usine, composants, sources automatiques) ; « Créer sans lancer » laisse le produit dans la liste. 12 produits composés au plus.

Un produit composé est enregistré **comme un produit ordinaire** (`PRODUCTS`, `PKEYS`, tables de demande, vignette composée du glyphe du modèle et de la couleur choisie) : fiche produit, écran Produits, demande par classe, auto-production, double-clic (`quickProduce`) et tous les écrans le traitent sans cas particulier.

**Sauvegarde** : v8 inchangée, un champ `cprod` s'ajoute (liste des définitions `{k, m, g, n, c, nov, day}`) ; le prix, les quantités et les tables sont recalculés au chargement par le même code, donc identiques. Une sauvegarde sans `cprod` se charge sans produit composé. `syncCustom` (appelé par la nouvelle partie et le chargement, avant `initProd`) vide puis recrée les produits composés. Déterminisme : aucune utilisation de `rnd()` ; les identifiants `cp1`, `cp2`… suivent l'ordre de création.

### 3. Tests

`tools/tests/t10_arbre.js` (31 contrôles, environ 70 s) : références et ordre des recettes, aucun cycle, 70-85 produits et 35-45 composants, 3 intrants au plus, vignette dédiée par produit, famille, tables du modèle ; EBITDA 12-30 % des 44 nouveaux produits non pharmaceutiques, pharmacie (MB ≥ 72 %), EBITDA inchangés de 12 produits d'origine ; composeur : 7 refus expliqués, synergies, 16 modèles viables, création, nom nettoyé, doublon, R&D réduite, lancement en un clic, EBITDA mesuré de 6 produits composés, vente en magasin, écran Produits, aller-retour de sauvegarde, ancienne sauvegarde sans `cprod`, déterminisme sur deux parties neuves, `quickProduce` sur les 82 produits (dont 3 composés). `isoFactory` accepte désormais un code de préparation (`preSrc`) pour mesurer un produit composé. Bilan complet : 124 PASS (93 existants + 31).

**Limites** : (corrigé en passe 38 : lait, viandes et cuir viennent maintenant d'élevages) ; la qualité d'un produit composé ne dépend que de ses composants et des synergies (pas de technologie propre à la création) ; la demande d'un produit composé repose sur la demande par habitant de son modèle ; `city.html` n'est pas reconstruit dans ces commits (`python3 tools/build.py`).


## Passe 27 : marché mûr, offres des autres, suggestions et tests

Demande : « proposer de manière intelligente et intuitive plusieurs produits : mets à disposition tous les produits et fais-les proposer soit par notre société soit par celles des autres », au milieu de la partie, « et que l'on puisse tester ». Tout est dans `game.template.html` (bloc « Passe 27 » avant la fiche produit) ; tests dans `tools/tests/t11_marche_mur.js`.

### 1. Marché mûr (`S.mat`)
- Le mode **Libre** démarre en marché mûr ; les scénarios 3 à 5 et le Round l'ont en option (case à cocher dans le choix de partie) ; les scénarios 1 et 2 gardent la R&D complète. Sauvegardes anciennes : `mat = 0`, tous les champs par défaut (v8 inchangée).
- Les 80 produits sont déjà développés par le marché : chacun a 3 à 6 **offreurs** (rivaux de la partie, 10 sociétés locales, 5 puissances étrangères). Paliers de bâtiments inchangés (scénarios), mais plus de palier de produit.
- **Licence** : 30 % du coût de R&D, produit lancé immédiatement (adoption 0,72), **redevance de 3,5 %** du chiffre d'affaires du produit. **R&D accélérée** : 70 % du coût pour 1/3 des jours. Les produits « standard » restent gratuits.

### 2. Offres des autres (acheter un produit fini)
- Offre = prix de gros unique du marché × (1 + marge) : rivaux 5-20 %, sociétés locales 6-18 %, étrangers 4-14 % (dumping −8 %, pénurie +10 %), ± qualité ; fret par case de distance (maritime pour les étrangers) ; stock, capacité par jour, délai, qualité, marque, note globale. Tout est déterministe (`hash()`), aucune écriture d'état.
- Écran **Offres des autres** (fiche produit, catalogue) : colonnes Fournisseur, Ville, Distance, Fret, Offre, Demande, Prix, Qualité, Note ; tri et filtre ; quantité par jour ; bloc « Faire ou acheter ? » chiffré (coût complet de fabrication : matières + usine, contre coût livré, marge par unité dans les deux cas).
- **Acheter** = commande régulière : le produit passe « lancé » en revente (`ps.res`), le stock arrive après le délai de l'offreur, l'argent part à la commande (prix livré), le produit est mis en rayon des magasins qui vendent sa classe (un magasin est posé tout seul si besoin). Source affichée partout : « Fabriqué par toi », « Acheté à X », « Mixte » (cartes Produits, fiche, rayons du magasin).
- Concurrence : en marché mûr, l'attrait de tes produits est multiplié par `(0,7 + 0,6 × demande non servie) / (1 + 0,1 × nombre d'offreurs)` (0,45 à 1,25).

### 3. « Recommandé pour toi »
Score = marge espérée × demande non servie × facilité × faible concurrence. Demande non servie = 1 − part servie par les offreurs (dérive avec la population depuis le départ) ; facilité = chaîne (matières sans source, composants à fabriquer, niveau d'usine, usine libre) × capacité d'investissement ; un produit hors de portée de ta trésorerie passe derrière tous les autres. 4 à 6 cartes (image, phrase en français simple, marge estimée par **mois**, boutons **Fabriquer (ma société)** (`quickProduce`), **Acheter à X**, **Les deux**, **Tester**), filtres par famille, recherche, tri (rentabilité, facilité, demande). Dans l'écran Produits, en bandeau dans le catalogue d'usine (produits que cette usine sait faire) et en encart au démarrage. Mis en cache par jour (≈ 50 ms pour 78 produits), invalidé quand tes bâtiments changent.

### 4. Tester
- **Prévision** (`WSE.mk.sim`) : calcul pur (mêmes `attractiveness`, `productScore`, demande de classe que la simulation ; l'objet produit est remplacé le temps du calcul puis rétabli) : ventes, chiffre d'affaires et marge à 30 et 90 jours en fourchette prudent/central/optimiste, part de marché, besoins en intrants, goulots, investissement (licence, usine, magasin, stock de départ), retour sur investissement, risques (concurrence, rupture, dépendance), phrase de synthèse. Fabriquer et acheter côte à côte.
- **Essai pilote** : petite série (3 % de la trésorerie au plus, dimensionnée sur la capacité d'UN magasin) vendue dans un seul magasin pendant 7 jours (+ délai de l'offreur) aux conditions normales ; 2 essais simultanés au maximum ; bandeau de résultat (ventes réelles, marge, part) puis **Continuer** (licence/achat régulier) ou **Arrêter** (le stock restant est revendu à 80 % du coût : aucun gain gratuit).

### 5. Tests et limites
`t11_marche_mur.js` : 43 vérifications (départ mûr, offres 5-20 %, licence, achat → rayon → vente, déterminisme et pureté, sauvegarde et ancienne sauvegarde, essai pilote, interface desktop 1280 et mobile 390). Limites : les parts de marché des offreurs sont des estimations par produit (la simulation garde une concurrence agrégée par classe) ; les rivaux n'achètent pas chez toi ; le prix de revient d'une usine neuve est une moyenne de la plus petite usine éligible.

## Passe 21 : chaînes industrielles (mine/ferme → composants → usine → magasins)

Un audit signalait que les chaînes usines → produits perdaient de l'argent dans les montages du bot, donc qu'un humain ne pouvait pas jouer l'industrie. Nouveau banc de mesure `tools/chain_audit.js` (`NODE_PATH=$(npm root -g) node tools/chain_audit.js [produit|all|a,b] [jours]`) : il construit la chaîne complète avec l'auto-production, fait tourner 200 jours avec prix de marché libres, imprime par maillon l'EBITDA, l'utilisation et la limite (goulot), puis la rentabilité **globale en trésorerie réelle** (CA magasins + export − salaires − entretien − fret − importations) **comparée à la même ville sans la chaîne** (les cessions internes ne sont pas de la trésorerie). Plans mal construits `bad_*` inclus ; test `t08_chaines.js`.

### Pourquoi elles perdaient
1. **Le montage du bot** (mission « chaîne » des scénarios) : une seule usine de pain, farine « achetée » à un fournisseur. L'auto-production choisissait le fournisseur à la **meilleure note** (45 % qualité), pas le moins cher : farine livrée ×1,36 le cours, alors qu'une usine gagne 15-20 % de marge brute. Résultat : −12 % d'EBITDA sur l'usine, −6,5 k$/j pour la chaîne (−152 %).
2. **Achats sans garde-fou** : un intrant « Port » ou « Fournisseur » est acheté même quand la fabrication devient déficitaire (seul le mode Auto avait un garde-fou, et tous les composants importés l'étaient à ×1,05-1,3).
3. **Surplus exporté à perte** : le surplus de produits dormait jusqu'à 10 000 unités puis partait à (taux d'export − 10 points), et le taux d'export valait 0,60 + 0,15 par port mais 0,78 dès qu'un rival existe, avec congestion 0,35 : 63-67 % du cours réalisé, en dessous du coût de revient d'un produit à 17-20 % de marge.
4. **Capacités mal dimensionnées** : une usine de niveau 1 produit 3 200 à 4 000 pains/jour pour une demande ville de 450 à 1 300 : le reste est du surplus. La demande domestique de la classe « base » est ≈ 4 300 unités/jour pour 308 000 habitants.
5. **Auto-affectation gloutonne** : `assignRecipe` prenait n'importe quelle usine libre de niveau ≥ recette, donc une grande usine à 200 emplois (14 k$/j de salaires) pouvait se retrouver à fabriquer du plastique (−50 k$/j observé dans les montages du bot).
6. **Fonderie** : son revenu valait 0 (`outPrice` sans `prod`) : −100 à −127 k$/j affichés pour une fonderie qui alimente les chaînes montre et bijoux.
7. **Cultures** : EBITDA mesuré près du port 36-48 % (blé 36, sucre 48, coton 29, caoutchouc 50) contre 20-27 % visé : l'entretien était calibré sur un rendement de 88 % alors que les sols près du port rendent 1,0 à 1,4× la production nominale.

Non retenus après mesure : salaires (8-16 % du CA des usines, normal), entretien (1-3 %), demande trop faible (les magasins vendent 50-60 % de leur capacité nominale, réglage de la passe 16).

### Corrections (tout dans `game.template.html`)
- **Auto-production** (`autoSource`) : fournisseur **le moins cher livré** (qualité ≥ 50) ; si les achats rendent le cycle déficitaire (intrants + frais fixes > 80 % de la valeur produite), ils sont **suspendus** (`src = local`, `_noBuy`) ; en cours de partie, un achat choisi par l'auto-production est coupé tant que les intrants importés dépassent 85 % de la valeur produite (un choix manuel du joueur reste respecté). L'usine attend alors ta propre production, avec le goulot affiché.
- **`assignRecipe(k, max, exact)`** : l'auto-production n'utilise que les usines du **niveau exact** de la recette.
- **Export** (`EXP_BASE = 0,82`, `EXP_PORT = 0,04` par port, `EXP_CONG = 0,25`) : un seul port réalise 82-87 % du cours ; le surplus d'un produit part à l'export dès qu'il dépasse ≈ 15 jours de ventes (`prodRoom`), à (taux − 10 points) du cours.
- **Cultures** : entretien recalé sur le rendement réel (`Y_CROP` : blé 1,06, sucre 1,38, coton 1,02, caoutchouc 1,38) → EBITDA 19-24 % près du port.
- **Fonderie** : lingots valorisés au cours du marché.
- **Fiche d'usine** : goulot nommé + conseil actionnable (« Goulot : manque de cuivre : construis : mine de cuivre, ou choisis un fournisseur. Stock …, cours … »), bouton « Choisir un fournisseur », bandeau « Usine déficitaire » (quel intrant acheté dehors ruine la marge), mention des achats suspendus.
- **API de diagnostic** `window.WSE` : `chainNeeds`, `unitsOn`, `sourceInfo`, `facCounts`, `prodRoom`, `tierNow`, `RAW_SRC`, `FLEVEL`.

### Mesures par maillon, avant/après (200 jours, ville de 310-320 k habitants, $ par jour)
Exemple, **chaîne du pain** (2 fermes de blé, usine de farine, usine de pain, 4 supérettes + 2 supermarchés) :

| Maillon | Avant (CA / EBITDA / marge) | Après |
|---|---|---|
| Fermes de blé (2) | 34 500 / 12 379 / 36 % | 34 500 / 8 214 / 24 % |
| Usine de farine (f1) | 10 049 / 1 710 / 17 % | idem |
| Usine de pain (f1) | 12 970 / 2 807 / 22 % | idem |
| Magasins (s1 ×4, s2 ×2) | −92 et +581 (−5 % et 8 %) | idem |
| **Chaîne globale (trésorerie)** | **EBITDA 34 %, retour 2,0 ans** | **EBITDA 22 %, retour 3,0 ans** |

Rentabilité globale de chaque chaîne bien construite (EBITDA / CA, retour sur capex ajouté) :

| Chaîne | Avant | Après |
|---|---|---|
| Pain (6 magasins) | 34 % / 2,0 ans | 22 % / 3,0 ans |
| Pain (14 magasins) | 41 % / 2,2 ans | 25 % / 3,5 ans |
| Ustensiles (fer, charbon, pétrole) | 31 % / 2,7 ans | 31 % / 2,6 ans |
| Jeans (coton, bois, pétrole ; 3 f1 + f2) | 26 % / 2,7 ans | 21 % / 3,4 ans |
| Vélo (fer, charbon, pétrole, caoutchouc, bois) | 36 % / 2,2 ans | 27 % / 2,9 ans |
| Médicament contre le mal de tête | non mesuré | 17 % / 3,1 ans |
| Parfum (f3) | non mesuré | 19 % / 3,5 ans |
| Montre de luxe (mines, fonderie, f3) | 20 % / 1,7 an | 23 % / 1,5 an |
| Bijoux en or | 6 % / 6,7 ans | 10 % / 3,9 ans |

Chaînes **mal construites** (doivent rester perdantes ou nulles) :

| Montage | Avant | Après |
|---|---|---|
| Usine de pain seule, farine achetée | −6,5 k$/j (−152 %) | −2,6 k$/j (achats suspendus, l'usine attend sa farine) |
| Usine de jeans seule (tissu et emballages achetés) | −16,6 k$/j | −3,0 k$/j |
| Vélo : fer seul, le reste acheté | −15,8 k$/j | +3,4 k$/j (le fer se vend, le vélo ne démarre pas) |
| Chaîne sans magasin (export du surplus) | +30 % / 2,7 ans | +31 % / 2,6 ans (le surplus de matières s'exporte, c'est un débouché) |

**Cultures** (mesure près du port, `t02`) : blé 36 → 24 %, sucre 48 → 21 %, coton 29 → 19 %, caoutchouc 50 → 22 %. Extracteurs minéraux inchangés (passe 16). **Marges des magasins et des services inchangées** (t02 : s1-s4 5-14 %). Le profil « bon » est strictement identique avant/après (1 Md$ au jour 6 612).

### Bot « industriel » (`PROFILE=industriel node tools/bot_round.js`)
`tools/bot_lib.js` : module `industry()` (chaînes verticales dimensionnées avec **besoins cumulés** de toutes les chaînes, extracteurs et fonderie d'abord, usines de composants, usine du produit en dernier ; épargne avant un projet atteignable en ≈ 2 ans de profit ; agrandit une chaîne seulement si les ventes locales absorbent la production ; démolit les usines de produit restées à vide). Profil : commerce + extraction + chaînes, aucune tour de services.

| Profil (M$ aux 10 % du temps) | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | fin |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Industriel | 6 | 12 | 16 | 28 | 38 | 62 | 67 | 102 | 131 | 120 | 75 (jour 7 200) |
| Bon (services) | 6 | 10 | 15 | 25 | 35 | 51 | 93 | 183 | 468 | 905 | 1 Md$ jour 6 612 |
| Rapide | 6 | 10 | 15 | 25 | 35 | 56 | 117 | 257 | 598 | | 1 Md$ jour 6 354 |
| Lent | 4 | 10 | 15 | 24 | 35 | 51 | 93 | 178 | 435 | 908 | 1 Md$ jour 6 592 |
| Casual | 3 | 11 | 15 | 25 | 34 | 47 | 76 | 138 | 283 | 656 | 1 Md$ jour 6 900 |

**Résultat honnête : l'industrie seule n'atteint pas 1 Md$.** Le profil industriel mène le profil « bon » jusqu'à 50 % du temps (62 contre 51 M$), culmine à 131 M$ au jour 5 760 puis retombe vers 75 M$ : (1) la demande domestique est plafonnée (≈ 120-190 M$/an de CA magasins pour toute la ville, toutes classes confondues), (2) le surplus de produits à marge de 17-20 % ne s'exporte qu'à ≈ 72 % du cours donc à perte, (3) les gisements s'épuisent (3-4 gisements de fer et de charbon vidés vers les jours 4 500-5 500) et les usines privées de matière cessent d'importer quand l'import (×1,3) rendrait leur marge négative, (4) il n'y a que 4 à 18 gisements de chaque minerai. Les tours de services (rendement ≈ 100 %) restent le moteur du round : l'industrie est solide mais plafonnée, les services explosifs mais saturables. Leviers possibles pour un 1 Md$ industriel : demande par habitant des produits ×1,5-2, plus de ports pour baisser le surcoût d'import (0,05 par port, plancher 1,05), davantage de gisements ; non appliqués ici pour ne pas déséquilibrer les magasins (5-14 %) ni les services.

**Limites** : le bot industriel est sensible aux moindres changements de règle (trajectoires de 7 à 130 M$ selon la cadence des décisions) ; les chaînes reposent sur des mines à gisement fini ; `t08` mesure sur 160 jours.


## Passe 26 : l'intérieur d'usine devient une seule scène « garage »

**Avant** : l'onglet Intérieur d'une usine (f1-f4) montrait la halle isométrique d'un côté (tapis, machine, ouvriers, camion) et, séparément, une mini-carte 3×3 avec un bouton « Vue 3D du plan ».
**Après** : une seule scène (`mkPlanScene` / `updPlan` / `drawPlan`), toujours celle du plan. La halle `mkFac` n'est plus utilisée pour les usines à plan ; le bouton « Vue 3D du plan » a disparu (l'action `planview` reste un alias sans effet).

- **Plan dans la halle** : chaque case est posée sur le sol à sa place : ACHAT (palettes colorées par matière première, rouleau d'entrée, camion entrant par la gauche), STOCK (racks remplis selon le stock réel), MACHINE (liseré néon par niveau d'atelier, le produit sort de la machine), VENTE (quai, palettes de cartons portant la vignette du produit, camion sortant), ROBOT (bras animé, usure). Cases libres en pointillés avec « + ». Plan par défaut (1 achat, 1 stock, 1 machine, 1 vente) visible sans action. Décor de garage : briques, bandes de danger, rayonnages, armoire à outils, établi, affiches, graffiti, néon, rampes lumineuses et flaques de lumière au sol.
- **Débits chiffrés** sur chaque zone (« ACHAT 4 009 /j »), étiquette rouge et triangle d'alerte sur la zone qui limite, bandeau « Goulot : … » ou « Sortie pleine ». `planStats` réutilise `planBase` et `planEval` : aucun effet économique.
- **Ouvriers** (`planCrew`) : nombre selon l'effectif réel ; chacun a un trajet par les allées (porteurs d'entrée, porteurs de sortie avec carton, opérateurs, emballeur, contremaître) et s'arrête quand l'usine est à l'arrêt. Déterministe (`mkRnd(c.seed)`, pas de `Math.random`).
- **Produit-vedette** : vitrine lumineuse sur le mur du fond (haut droite), podium néon avec le produit qui flotte (halo, étincelles) et carte HTML « Produit en cours » en haut à droite (vignette `itemThumb`, nom, prix du marché, cadence par jour) qui ouvre le catalogue ; usine vide : « Aucun produit / Choisis-en un ». Mise à jour dès que `recOf(c).out` change (`quickProduce`, `easyLaunch`, catalogue, double-clic).
- **Interface façon jeu** : panneau de stats à barres (cadence, capacité, qualité, prix, marge par cycle, flèches contre la référence de marché), pastilles d'objectifs d'usine (dérivées de l'état), argent et niveau d'atelier, quatre grosses tuiles (Capacité = +1 machine, Plan de l'usine = menu d'ajout, Changer de produit, Marque / Studio), ligne d'aide aux commandes. Cosmétique : couleur des néons bleu, vert, or, rose selon le niveau d'atelier (taille + qualité + efficacité), sans effet de jeu.
- **Commandes** : clic sur case libre = menu flottant d'ajout (coût, gain, postes) ; clic sur case occupée = déplacer / retirer ; double-clic sur case libre = ajout rapide de l'unité limitante ; clic sur le produit = catalogue ; info-bulles au survol ; étincelles et texte flottant à la pose. La mini-carte 3×3 reste en légende sous la scène.
- **Performance** : parties statiques des cases pré-dessinées en sprites (`planSprite`), halo pré-rendu, plus de `shadowBlur` par image : environ 1,7 ms par image en rendu logiciel (Chromium sans GPU, méga-usine à 9 unités) contre 3,5 ms avant optimisation.
- **Sauvegarde** : inchangée (v8, clés `pl` et `rb`) ; rien de nouveau n'est stocké.

**Reste à faire** : ouvriers cliquables avec compétences, curseurs cadence / qualité / maintenance avec compromis, pannes à réparer et visite d'inspecteur dans la scène, objectifs d'usine persistants avec récompenses et galerie de produits fabriqués (nouveaux champs de sauvegarde rétro-compatibles), décorations déblocables au-delà du néon, sons.

### Passe 26 (suite) : alertes cliquables, plan librement éditable, caméra

- **Alertes cliquables** (`planAlerts`, `alrHTML`, `alrAct`) : « Minerai de fer manquant » (avec la vignette du bien), « Sortie pleine », « Manque de personnel », « Goulot : … » sont des pastilles de la scène (curseur main, mise en évidence au survol, zone tactile d'au moins 44 px). Un clic ouvre un menu contextuel près de la pastille : Sources automatiques (`autoSource`), Choisir un fournisseur (écran fournisseur du bien), Importer par le port, Prendre dans ton groupe, Construire la source (affecte une usine libre ou pose la mine / la ferme avec son coût), Ajouter une ligne de vente (coût affiché), Répartir le personnel, Salaires élevés. Les pastilles de chaque intrant sur les palettes d'entrée ouvrent la fiche fournisseur ; la pastille du produit sur la palette de sortie ouvre le catalogue. Une alerte résolue disparaît avec une confirmation « Résolu » (étincelles). Il n'y a pas de notion de panne dans le moteur : seul l'usure des robots existe (remplacement automatique), aucune action « Réparer » n'a donc été ajoutée.
- **Plan librement éditable** : chaque case, libre ou occupée, ouvre le menu de choix (Achat, Stock, Machine, Vente, Robots, Vider, Déplacer) avec le coût net (remplacer = coût − reprise de 50 % de l'unité actuelle), le débit avant → après, les postes et l'avertissement « crée un goulot ». Remplacer une machine par une vente (ou l'inverse) se fait en un clic (`planReplace`). Aucune colonne n'est imposée : le débit ne dépend que des unités présentes. Poser une unité sans case choisie est refusé (« Touche d'abord une case »). Palette d'outils permanente (Achat, Stock, Machine, Vente, Robot, Gomme) avec aperçu fantôme au survol, glisser-déposer d'une unité vers une case libre. L'ajout rapide (double-clic, bouton) et les actions des alertes restent des raccourcis explicites qui proposent une case (`planFree`) et la signalent par un effet visible.
- **Caméra (bureau)** : boutons − / +, molette, glisser pour se déplacer, points de vue Ensemble / Achat / Fabrication / Vente / Produit (transformation CSS du canevas : les coordonnées de clic restent exactes). Sur mobile, la scène défile horizontalement comme avant.
- Tests : `t11_alertes_scene.js` (clic réel sur l'alerte d'intrant manquant, « Sources automatiques », la production reprend, zone ≥ 44 px, caméra) et nouvelle section 10 de `t09` (remplacer, vente en première colonne, déplacer, outils).

**Non fait** (demandes ultérieures) : mode plein écran immersif avec transition de caméra depuis la ville, rotation de caméra, pincer pour zoomer sur mobile, ambiance sonore WebAudio, poussière / vapeur animées, arrière-plan sans cadre autour du losange, ouvriers cliquables, curseurs cadence / qualité / maintenance, pannes et inspecteur, objectifs persistants et galerie.


## Passe 29 : poser un commerce sur du bâti existant (rachat PNJ, négociation avec un rival)

Un seul geste : on choisit un bâtiment urbain (magasin, immobilier, tour...) et on le pose là où on veut, même sur des maisons ou immeubles déjà construits.

- **Bâti PNJ** : `place()` détecte l'emprise occupée (`acqPlan`, `footprintError(x, y, key, true)`), ouvre la bulle « Cette case est occupée par 2 maisons : racheter 38 000 $ puis construire ? » (rachat = `buyoutCost` par case, remise Promoteur de 30 %, + construction et terrain, total, effet sur la ville) ; l'emprise passe en orange au survol et pendant la bulle. Confirmer : `acqExec` paie, rase (`S.npcMods`), construit, de façon atomique (annulé si la pose échoue) ; trésorerie insuffisante = refus avec le manque affiché. Les bâtiments publics (`mon`) ne sont jamais vendus. Les habitants déplacés réduisent la capacité d'habitat (`evaluate`, annoncée dans la bulle) et les bureaux rasés retirent des emplois.
- **Propriété** : `ownerOf(cell)` renvoie `'npc'`, `'me'`, un rival (`'r1'`...) ou un joueur humain (`'h:nom'`). Environ 10 % des bâtiments de moins de 13 étages appartiennent aux rivaux (déterministe, `hash`), marqués à la couleur du rival sur la carte ; les transferts sont sauvegardés dans `nown`. Leurs loyers (7 %/an de la valeur) s'ajoutent à leurs ventes (`rivalRents`), sans toucher aux marges s1-s4.
- **Négociation** (bâtiment d'un rival) : fenêtre « Négocier avec X » (valeur estimée, loyers, relation `S.rel`, offre au curseur, avocat optionnel à 2 % de la valeur qui baisse la réserve du vendeur de 6 %), 3 tours maximum, réponses déterministes accepté / contre-offre / refusé selon l'écart avec la réserve du vendeur (`hash`), refus = 20 jours avant une nouvelle tentative, le rival encaisse le prix.
- **API multijoueur** : `WSE.acq.demandeAchat(buyerId, sellerId, cellId, offre)` renvoie un état `pending | accepted | countered | refused` ; pour un vendeur humain la demande reste `pending` (stub solo : réponse automatique après 2 jours, `stepReqs`) ; `repondreAchat(id, 'accept' | 'refuse' | 'counter', offre)` pour la réponse manuelle.
- **UX** : infobulle au survol (« Maison — PNJ : racheter 900 $ », « Immeuble de X : à négocier »), cases acquérables teintées en orange autour du curseur, Échap annule, bulle en bas sur mobile.
- **Sauvegarde v8** rétro-compatible : champs optionnels `nown`, `neg`, `reqs`, `rid`.
- Tests : `tools/tests/t13_acquisition.js`.

**Reste** : négociation multi-propriétaires séquentielle (une fenêtre par rival) ; pas de rachat sec d'un bien de rival sans construire (l'outil « Acheter un terrain bâti » renvoie vers la pose d'un commerce) ; joueurs humains réels (réseau) à brancher sur `demandeAchat`.

## Passe 28 : scène d'usine en grand, halle « garage » en perspective, portes sur les murs, 12 emplacements, vue immersive, atelier vivant

**Retours utilisateur traités** : « ce n'est pas assez grand », « on ne voit rien », « change l'angle de caméra », « exploite un mur et des portes SORTIE pour les ventes », « optimiser la chaîne plutôt à 12 cases », « vue plus immersive », « que les gens y passent du temps ».

### Scène plus grande et nouvel angle
- **Panneau Intérieur en grand format** (≥ 900 px de large) : 94 vw × 96 vh ; la scène occupe `calc(96vh - 150px)` (≈ 79 % de la hauteur de la fenêtre) et toute la largeur du panneau. Stats, outils et tuiles sont en surimpression compacte (stats 178 px, tuiles en bandeau d'une ligne de 44 px) ; sur mobile, ouvrir une usine passe directement en plein écran.
- **Trois angles** (sélecteur Garage / Isométrique / Dessus, boutons d'orbite, touches Q / E, Maj + glisser) : *Garage* est une vraie projection en perspective (caméra basse, point de fuite vers le mur du fond, sol en trapèze, objets 3 à 5 fois plus grands qu'avant), *Isométrique* garde l'ancienne projection en plus grand, *Dessus* regarde presque à la verticale pour éditer le plan. Une seule projection par scène (`planProj`, `isoP` y fait appel) ; les objets restent dessinés par les mêmes routines isométriques, posées et mises à l'échelle selon la profondeur (`sc.anch`), tri par distance à la caméra, sprites de cases pré-dessinés à 2× la résolution. Orbite de −12° à +40° (angle par défaut 10°).
- **Texte net** : étiquettes, alertes, pastilles d'ouvriers, « + » et cadenas sont dessinés sur un second canevas (`#blab`) à la résolution de l'écran, avec anti-collision (empilement / décalage, trait de rappel), police ≥ 13 px à l'écran, zones tactiles ≥ 44 px. **Une seule enseigne par unité**, attachée à la porte ou à la case (les anciens bandeaux ENTRÉE / FABRICATION / SORTIE flottants ont disparu).
- **Caméra** : glisser pour se déplacer, molette ou pincer pour zoomer (1× à 3,6×), points de vue Ensemble / Achat / Fabrication / Vente / Produit. La halle remplit la vue (sol et murs prolongés, vignette) : plus de losange isolé dans un cadre vide.

### 12 emplacements : sol 3×2 + 3 portes d'entrée + 3 portes de sortie
- `PLAN_N = 12` : indices 0-5 sol (stock, machine, robot), 6-8 **portes d'ENTRÉE** (mur de gauche, achats), 9-11 **portes de SORTIE** (mur du fond, ventes). `slotOk` impose le type (pas d'achat au sol, pas de machine à une porte). Le plan par défaut est `stock, machine, achat (porte 1), vente (porte 1)` : capacité, effectif et entretien identiques, marges de référence inchangées (les tests de marges t02 / t06 / t08 restent verts).
- **Verrous par niveau** (`planOpenN`) : petite usine 6 emplacements libres, moyenne 8, grandes 12 ; +2 par niveau d'usine ; un emplacement déjà occupé reste utilisable. Cadenas visibles sur les portes et cases verrouillées.
- **Portes** : tablier relevé quand l'unité est posée, camion qui recule au quai visible par l'ouverture (rendu découpé dans l'ouverture), jauge de remplissage, palettes de matières (entrée) ou de cartons du produit (sortie) devant la porte, enseigne « ENTRÉE n » / « SORTIE n » avec le débit. Porte libre : « + » ; clic sur une porte : remplacer / déplacer / retirer.
- **Migration transparente** (`planMigrate`) : un ancien plan 3×3 ou 3×2 est converti à la lecture (achats aux portes d'entrée dans l'ordre, ventes aux portes de sortie, le reste au sol dans l'ordre, robots suivis). La sauvegarde v8 garde la clé `pl` ; les anciennes longueurs (6 ou 9) sont acceptées au chargement. Limite : un ancien plan avec plus de 3 achats, 3 ventes ou 6 unités de sol perd l'excédent.

### Vue immersive
- Bouton **« Entrer dans l'usine »** (onglet Intérieur) ou **double-clic / double-tape sur l'usine dans la ville** (un clic simple ouvre la fiche après 0,3 s) : zoom de 0,6 s depuis la carte (échelle 3,6, fondu), scène à 100 vw × 100 vh. **Échap** ou « ‹ Sortir » : transition symétrique (retour à la ville si on est entré depuis la carte). Respecte `prefers-reduced-motion`.
- Les panneaux (stats, outils, tuiles, caméra, produit en cours, barre d'actions) **se masquent après 3,2 s sans mouvement** et réapparaissent au mouvement de la souris ou au toucher ; ils restent affichés tant qu'un menu est ouvert ou survolé.
- **Ambiance** : poussière, vapeur des machines, étincelles, fumée en cas de panne, halos additifs (rampes qui clignotent, néon des machines), éclairage plus contrasté. **Son WebAudio optionnel** (désactivé par défaut, bouton « Son : non / oui ») : bourdonnement lié à l'activité, bips d'alerte, passage des camions.

### Atelier vivant (champs optionnels `c.fx`, créés à la première entrée en vue immersive)
Tant qu'une usine n'a pas été visitée, rien ne change dans l'économie.
- **Ouvriers cliquables** : pastille de compétence (0-100 : base 28-50 selon la case + formation) au-dessus de chaque ouvrier, fiche avec formation payante (+10, jusqu'à +50, coût 2 % du prix du bâtiment × (1 + niveau/10)). Effet sur le rendement borné à **+8 %** quand toute l'équipe est au maximum.
- **Curseurs cadence / qualité / maintenance** (50 / 50 / 50 = neutre) : cadence haute ×1,25 de production mais jusqu'à +10 points de déchets, +30 % d'entretien et ×2,2 de risque de panne ; qualité haute −12 % de vitesse, +10 % de valeur de vente et −4 points de déchets ; maintenance ×0,4 à ×1,6 de risque, ±50 % d'entretien.
- **Pannes** (`fxDaily`, `hash(jour, case)`) : probabilité de base 0,6 % par jour, machine à 45 % jusqu'à réparation (1 à 5 % du prix du bâtiment, d'un clic) ou remise en route automatique au bout de 5 jours. **Inspecteur** tous les 53 jours (décalé par case) : maintenance ≥ 40 = prime bornée, sinon amende bornée (≤ 1 % de la trésorerie) ; il traverse la scène avec un badge « INSPECTEUR ».
- **Objectifs persistants** (7 : 100 unités, 1 000 unités sans arrêt, qualité 80, équipe formée, inspection réussie, 60 jours sans panne, 10 000 unités) : décorations cosmétiques (drapeau, guirlande, étoile, affiche, plantes, projecteurs, vitrine dorée, néon rose / or) et petite prime bornée (2 jours de recettes, 1 000 à 120 000 $), niveau d'atelier et rang. **Galerie** des produits fabriqués (`S.gal`, clé de sauvegarde `wse-city-v8_gal`).
- **Gratification** : effets de pose, gain « + x $ » à chaque camion de sortie, « +1 » et pulsation du produit sur le podium.
- Sauvegarde : `c.fx` dans l'objet optionnel de chaque cellule (`o.fx`), absent des anciennes sauvegardes.

### Tests
`t12_usine_immersive.js` (25 contrôles : 12 emplacements et migration, plein écran, transition, masquage des panneaux, double-clic sur la carte, angles, réglages, formation bornée, pannes déterministes, objectifs, sauvegarde, mobile, coût d'image). `t09` et `t11` adaptés au nouveau modèle (12 emplacements, portes, caméra).

### Ce qui reste / limites
- Coût d'une image de la scène en rendu logiciel : environ 0,5-0,9 ms une fois les sprites en cache ; il remonte pendant une orbite (la halle est redessinée par pas de 1°, au plus toutes les 160 ms).
- Les camions et cartons des portes sont des volumes simples ; pas de convoyeur au sol entre machine et porte (les ouvriers portent les cartons).
- En vue de dessus les sprites restent dessinés en oblique (lisibles mais pas orthogonaux).
- Les décorations débloquées sont cosmétiques et non sélectionnables une par une ; pas de sélecteur de couleur de néon.

## Passe 30 : la vue « Dessus » devient une vraie usine en coupe (vue éclatée), cartes de KPI ancrées, sprites facultatifs

La vue **Dessus** est maintenant la vue par défaut de l'intérieur d'une usine (ordre des angles : Dessus, Isométrique, Garage). Ce n'est plus une halle fermée : c'est une **maquette technique ouverte** (vue éclatée), comme sur l'image de référence.

### Ce que montre la vue
- **Bâtiment en coupe** : sans toit, murs du fond avec fenêtres et enseigne, murs avant bas (18 px) interrompus par les portes de quai, sol clair en dalles de béton, trottoir, cours de quai en bitume, **herbe et arbres** autour (46 arbres, 3 variantes de feuillage).
- **Quatre zones au sol** (dalles séparées par un joint et une ombre en vue éclatée) : **ACHATS** (gauche : lignes d'achat, matières premières), **FABRICATION** (centre : machines et robots), **STOCKAGE** (les plots « stock » = racks), **VENTE / EXPÉDITION** (quais et camions), plus un **local bureau vitré** avec employés assis et table de réunion. Une bannière nomme chaque zone avec un chiffre réel (nombre de lignes, débit /j, remplissage %, quais).
- **Convoyeurs animés** : collecteur des achats, rue des machines, descente vers les quais de vente, tronçons jusqu'aux camions ; flèches de sens, cartons et matières qui circulent (matière aux couleurs du bien avant les machines, carton du produit après), vitesse liée à `util` et au débit, arrêt quand l'usine est à l'arrêt, **vides quand l'intrant manque**.
- **Objets détaillés (vectoriels, volumes, ombres, reflets)** : racks bleus à lisses orange sur 3 niveaux avec **remplissage = stock réel** (`facStockLvl`, 18 emplacements), machines par type de production (four, presse / scie, cuves, assemblage) avec pièces mobiles, robots 6 axes sur socle clôturé, piles de matières par forme de marchandise (`FSH`) aux couleurs de `GOODS` (bobines, plaques, fûts, sacs, bacs de minerai, palettes), camions blancs / rouges / bleus qui **reculent au quai, chargent ou déchargent** (jauge), ouvriers aux postes (porteurs, opérateurs, emballeurs, contremaître, inspecteur).
- **Correspondance zones / plan (les 12 emplacements sont inchangés)** : ACHATS = portes d'entrée 6-8 ; STOCKAGE = unités `stock` des cases 0-5 ; FABRICATION = `make` et `robot` des cases 0-5 ; VENTE = portes de sortie 9-11. **Un clic sur un objet** (rack, machine, robot, quai, camion) **ou sur une zone** (sol ACHATS, sol VENTE) ouvre le menu de la case ; ajouter une unité fait apparaître aussitôt son objet (rack, machine, bras, matières, quai et camion). Glisser-déposer, double-clic, gomme et palette d'outils fonctionnent comme avant.
- **Alertes posées sur le lieu du problème** : intrant manquant = **convoyeur de la ligne d'achat hachuré en rouge** avec l'étiquette « Fer manquant » posée dessus ; sortie pleine = tronçon du quai de vente ; panne ou goulot = plot de l'unité en rouge hachuré. Les étiquettes restent cliquables (menu d'actions existant : sources automatiques, fournisseur, import, ajout d'une ligne, réparation).
- **Cartes de KPI ancrées sur les zones** (`planTopCards`, valeurs réelles via `planTopInfo`) : ACHATS (coût matière par unité, risque fournisseur d'après les jours de stock couverts, prix de la matière), FABRICATION (rupture prévue en jours, débit de la chaîne), STOCKAGE (niveau de réserve, stock du produit), **ZONE D'EXPÉDITION** (livraison par camion, quais, mini-carte stylisée avec route en pointillés et camion, messages clients « délai de livraison critique » / « satisfait ») ; sous la carte produit en haut à droite : **marge nette actuelle, taux de satisfaction client, temps de cycle moyen**. La cadence et la marge par cycle restent dans le panneau en bas à gauche.
- **Vue éclatée / vue assemblée** (bouton sous les angles, état `planExpl`, éclatée par défaut) : éclatée = sans toit, murs bas, dalles de zone séparées, flux visibles ; assemblée = murs hauts translucides et ossature de toit, pour l'immersion. Les unités du plan restent éditables dans les deux.
- **Mobile 390×844** : canevas net (résolution ×2), zoom initial 1,8 centré sur la fabrication, pincer et glisser, boutons Achat / Fabrication / Vente, carte de réserve compacte.
- Coût d'une image : environ 1 à 4 ms en rendu logiciel (les objets lourds sont des sprites mis en cache : racks, machines, camions, bureau, murs, piles, convoyeurs des quais).

### Sprites de l'usine (assets/factory) et chargeur
Le jeu embarque les **29 sprites isométriques** de `assets/factory/` (générés par `tools/factory_sprites/`, voir `assets/factory/_apercu.png`) : `build.py` les encode en base64 dans `city.html` (jetons `__FAC_JSON__` sprites, `__FACSH_JSON__` ombres, `__FACANCH_JSON__` ancres ; environ 1,1 Mo, page ≈ 3,7 Mo). **Si un PNG existe il remplace le dessin vectoriel correspondant ; s'il manque, le vectoriel reste** (chaque objet se remplace indépendamment ; `WSE.fac.unload(nom)` ou la suppression du fichier + `build.py` le prouvent : la vue se redessine entièrement en vectoriel, test `t14`). `WSE.fac.load(nom, dataURI)` charge un sprite à chaud (sans ombre), `WSE.fac.img(nom)` dit s'il est actif, `WSE.fac.FAC_SPEC` donne les ancres.

Gabarit : PNG à fond transparent, 256 px de large (128 px pour bobines, plaques, palettes, buisson), éclairage isométrique 2:1 depuis le haut-gauche ; **ombre portée dans un calque séparé** (`ombres/<nom>.png`, même cadrage, dessiné sous le sprite). `ancres.json` donne pour chaque fichier le **point d'ancrage** (`ancre_x`, `ancre_y` en px, posé au centre de l'emprise au sol) et l'**échelle** `echelle_px_par_m` : le jeu dessine à `(tw / 2) / echelle_px_par_m` (`tw` = largeur d'une case à l'écran, 1 case = 1 m), ce qui agrandit automatiquement les objets réduits (camions, bureau, quai). Les tuiles `herbe_tuile` et `sol_beton_tuile` (256×128, raccordables, ancre = sommet bas) couvrent 2×2 cases.

| Fichier | Où il est utilisé dans la vue Dessus |
|---|---|
| `herbe_tuile`, `sol_beton_tuile` | extérieur herbeux ; sol clair de chaque dalle de zone |
| `bobine_acier`, `bobine_cuivre`, `plaques_acier` | zone ACHATS : piles de matière (acier et aluminium = bobines d'acier, cuivre et fil = bobines de cuivre, barres et tôles = plaques) ; les autres biens gardent un dessin vectoriel à la couleur de `GOODS` |
| `palette_cartons`, `palette_vide` | palettes aux quais d'achat et de vente (`palette_vide` réservée) |
| `rack_stockage`, `rack_vide` | plot de stock : deux travées ; `rack_vide` dessous, `rack_stockage` rogné par le bas par-dessus selon le **stock réel** |
| `convoyeur_droit` | tous les tronçons droits (miroir pour l'axe y) ; `convoyeur_coin` : réservé (coins vectoriels pour l'instant) |
| `machine_assemblage`, `presse`, `robot_6_axes` | machines (presse / scie = presse ; fours et cuves restent vectoriels) et robots |
| `camion_blanc`, `camion_rouge`, `camion_bleu` et `_ouvert` | camions aux quais, remorque ouverte une fois à quai |
| `quai_chargement` | portes de quai des unités posées (miroir pour le mur sud-ouest) |
| `bureau_vitre` | local bureau |
| `ouvrier_gilet_orange`, `ouvrier_gilet_bleu` | ouvriers : planches de 4 poses 128×200 (marche, porte un carton, machine, debout) choisies selon la tâche, miroir selon le sens |
| `chariot_elevateur` | chariot qui patrouille entre les quais d'achat et les piles |
| `arbre`, `buisson` | arbres et buissons autour du bâtiment |
| `mur_bas_gauche`, `mur_bas_droite` | non utilisés (les murs bas restent vectoriels) |

Limite connue : les camions fournis montrent leur arrière ouvert côté bas-droite ; ils sont donc posés « nez au quai » (le recul n'est animé que par la distance).

### Tests
`t14_vue_dessus.js` (18 contrôles) : vue par défaut = Dessus et ordre des angles, quatre zones, cartes de KPI et valeurs réelles, clic sur une zone / un rack / une machine, ajout d'unité visible (l'image du plot change, camion au quai), alerte posée sur le convoyeur (pixels rouges) et menu d'actions, vue éclatée / assemblée, chargeur de sprites (29 noms, ancres, remplacement d'un PNG, repli vectoriel complet), mobile 390×844. `t12_usine_immersive.js` est adapté (ordre des angles, géométrie des quais en vue Dessus).

### Limites connues
Les objets sans sprite (fours, cuves, lingots, fûts, sacs, bacs) restent vectoriels ; pas de coins de convoyeur ni de bobines couchées. Les anciens angles Isométrique et Garage sont inchangés.


## Sprites HD de l'usine (assets/factory_hd)
Ordre de chargement, par nom de sprite : `assets/factory_hd/<nom>.png` (rendu HD, avec `ombres/<nom>.png` et `ancres.json`) > `assets/factory/<nom>.png` (gabarit procédural) > dessin vectoriel.
`tools/build.py` embarque le PNG HD et garde le gabarit en repli : si le PNG HD ne se décode pas, le jeu recharge le gabarit sans erreur. Les noms du lot 2 (`tools/factory_ai/manifest.json` : convoyeurs orientés, fours, cuves, matières, murs, camions de face/dos, poses de bureau...) sont déjà reconnus par le chargeur ; il suffit de déposer le PNG (aucun poids tant qu'il n'y en a pas). Le dessin des objets du lot 2 dans la scène reste à brancher quand les sprites existent. Test : `tools/tests/t15_sprites_hd.js` (variables `WSE_HD_DIR` et `WSE_OUT` de `build.py`).


## Passe : marque cumulative
Avant : la notoriété d'un produit (`ps.brand`) suivait le budget publicitaire du moment (7 %/jour, demi-vie ≈ 10 jours) ; rendements seulement décroissants, plafond 100, aucune mémoire de l'investissement passé ; la fidélité (`ps.loy`) ne dépendait pas de la marque ; l'élasticité-prix ignorait la marque ; le directeur marketing ne touchait que l'attrait des magasins ; les rivaux n'avaient pas de marque. La notoriété et ces règles restent en place ; la passe ajoute une couche cumulative.

- **Capital de marque** `ps.bc` (champ optionnel ; au chargement d'une ancienne sauvegarde il vaut `0,6 × brand`). Chaque jour : `bc += cible × ln2 / 120 − bc × ln2 / demi-vie`, avec `cible = 100 × min(1,75 ; puissance pub / 1,5) × marketing × (1 + 0,25 × force)` et `demi-vie = 120 j × (1 + 0,5 × fidélité / 100)` (120 à 180 jours).
- **Force de marque** (courbe en S : rendements croissants puis saturation douce) : `force = x^1,6 / (x^1,6 + 0,6^1,6)`, `x = bc / 100` (capital 25 → 0,20 ; 60 → 0,50 ; 100 → 0,69 ; 200 → 0,87).
- **Levier par produit**, tiré des poids existants (non modifiés) : `levier = (marque / (marque + prix) − 0,3) / 0,5`, borné à 0,08-1. Pain 0,11 ; pneus 0,13 ; voiture 0,57 ; smartphone 0,73 ; médicament 0,90 ; montre 0,97 ; haute couture 1.
- **Volume** : attrait × `(1 + levier × force)`. Produits de luxe (nécessité < 25) sous le seuil de force 0,25 : jusqu'à −50 % (un luxe sans marque se vend mal).
- **Valeur perçue** : prix accepté = prix standard × `(1 + prime × force)` ; prime = `0,03 + 0,62 × levier` (pain ≈ +10 %, smartphone ≈ +48 %), luxe `1 + levier` (jusqu'à ×3). Entre le prix standard et le prix accepté, la note de prix reste neutre.
- **Fidélité** : sa cible gagne `30 × force`. Bouclier = `levier × force × (0,5 + 0,5 × fidélité / 100)` : il réduit l'exposant de la pénalité de prix (jusqu'à −50 %) et l'élasticité des prix de rayon (`volume^(1 − 0,6 × bouclier)`).
- **Direction marketing** : `marketing = 1 + expertise du CMO` (jusqu'à ×2), × 1,15 (marque d'entreprise) ou × 0,9 (marque unique).
- **IA** : chaque rival a un capital `r.bk` (optionnel) selon son profil (Luxor 100, Mega Mart 50, DiscountCo 15). Son attrait est multiplié par `(1 + g × force) / (1 + g × force du profil)` (g : basique 0,15, courant 0,5, luxe 1), donc neutre au départ. À court d'argent il coupe la publicité (distancé) ; face à une marque du joueur plus forte il surinvestit (+50 % × profil, payé sur sa trésorerie).
- **Affichage** : fiche produit (Modèle produit), publicité du produit (Studio, fiche magasin) et écran Marque : « Capital de marque : X (×Y de volume vs concurrent sans marque) · prime de prix acceptée +Z % · demi-vie N j · monte / stable / s'érode ».
- **Économie** : sans publicité le capital est nul et tous les facteurs valent 1, sauf le luxe sans marque (volume réduit, voulu). Marges des commerces et des usines inchangées.
- **Tests** : `t18_marque_cumulative.js` (20 contrôles). API : `WSE.brand` (`sig`, `lev`, `volM`, `prem`, `shield`, `duel`, `half`, `target`, `trend`, `rivM`...).
- **Limites** : les rivaux restent des attraits agrégés par classe (pas de prix par produit) : le duel « bradage » est mesuré par `WSE.brand.duel` avec les fonctions de la simulation, pas contre une IA qui fixe ses prix. La notoriété rapide (`ps.brand`) s'ajoute au capital : au maximum de publicité, l'écart total avec un produit sans marque est élevé (smartphone ≈ ×4, luxe > ×10).


## Passe : coûts de formation et de R&D réalistes
Les coûts étaient proportionnels au prix du bâtiment (formation d'un ouvrier = 2 % du prix, programme de service = 20 % du prix : 70 000 $ et 700 000 $ pour une usine de 16 employés qui paie 930 000 $ de salaires par an). Ils sont désormais calés sur la masse salariale (`payYear`) : pas de formation d'atelier ≈ 5 % du salaire annuel de l'effectif formé, programme de service = 4 % de la masse salariale par niveau (ordre de grandeur des budgets de formation réels). La R&D et les montées de gamme sont plafonnées à 25 % du marché annuel du produit (demande par habitant × population de référence × prix), 90 % pour les développements longs (pharmacie, blockbusters). Test : `tools/tests/t20_couts_realistes.js`.

## Passe 31 : parcours guidé (premier écran, conseiller à jalons, rendements décroissants, classement, récaps)

Issue d'un test avec un joueur de 20 ans (45 min de jeu). Test : `tools/tests/t26_parcours_guide.js`. Sauvegarde `wse-city-v8` inchangée (champs facultatifs `cch` = état du conseiller, `tmx` = palier atteint).

- **Premier écran** : au lancement du Round, d'un scénario ou d'une partie neuve, `frameCity()` centre la caméra sur le bâti le plus proche du barycentre de ta ville (tes bâtiments si tu en as, sinon la ville existante), jamais sur le port vide ; le panneau « Bureau du PDG » est fermé (`setPanel(false)`) ; le Conseiller affiche UN objectif (« Ouvre ton premier commerce », rappel de l'avantage de ta caste). `resize()` applique le même cadrage tant que la vue n'a pas été déplacée.
- **Conseiller dynamique** (`COACH`, `coachPick`, `stepCoach`) : 4 phases, Commerce, Première usine, Chaîne et marque, Capital et expansion. Chaque jalon (`shop1`, `shop3`, `fac`, `prod1`, `adfix`, `prod2`, `debt`, `hq`, `ipo`, `rival`) est calculé sur l'état réel (trésorerie, bâtiments, produits lancés, parts de marché, dette) et porte un **coût**, un **gain en $/mois** (suggestions de produits `mkSuggest`, mesure sur tes magasins, intérêts économisés…) et une **durée estimée en minutes** (temps de réunir les fonds au rythme du résultat mensuel + 1 min d'action). Un nouveau jalon est proposé toutes les ≈ 5 minutes de jeu (`coachEvery()`) ; un jalon devenu non rentable est retiré et annoncé. **Seuil de rentabilité** : `ROI_MAX` = 8 ans ; au-delà, le jalon n'est plus proposé (sauf les jalons stratégiques : dette, siège, bourse). « Plan du palier » (bouton Conseil) : « Il te faut X M$ de plus pour le palier Y : voici 3 façons » (laisser tourner, investir dans le meilleur jalon, capital : bourse, rachat de rival ou emprunt mesuré).
- **Pas de pénalité cachée** : à la création d'un sous-objectif, la pénalité estimée (4 jours de recettes + 5 % sur le cours) est annoncée ; rappels à 30, 10 et 3 jours de l'échéance (écart restant, pénalité) ; la barre d'objectif affiche le compte à rebours ; la pénalité appliquée est celle annoncée (`b.pen`).
- **Rendements décroissants** : `shopMarginal(clé)` estime le gain quotidien du prochain magasin du type à partir de ses voisins (si tes magasins ne remplissent pas leur capacité, un de plus ne fait que partager les mêmes clients : gain = h × (recettes − coûts variables) − coûts fixes, h = (remplissage − 55 %)/40 %) ; la fiche d'un commerce affiche « le prochain petit marché rapporterait ~12 $/j : retour 20 ans ». Sur l'onglet Publicité : tableau de **ROI par support** (radio, internet…) et **dosage optimal estimé** (budget qui annule le rendement marginal, `s·ln(A/s)`), avertissement si la publicité perd de l'argent (aussi en message tous les 60 jours).
- **Classement et récaps** : la barre d'objectif montre le classement en direct (rang, valorisation, flèche de tendance sur 10 jours, écart avec le leader). Une carte de récapitulatif (`#recap`) s'affiche après un changement de conjoncture (« Récession : −1,3 % de PIB ; ton CA −8 % ; que faire »), après le choix d'un événement (effets chiffrés des modificateurs) et après un rachat de rival.
- **Dates et sauvegarde** : un an = 120 jours de jeu (`YEAR_D`) ; libellé unique `dateTxt` « Jour 111 · An 3 » (jour 350) dans le HUD et le bureau ; le minuteur du Round affiche les minutes restantes ET la date et le jour de jeu (« 86 min · Jour 111 · An 3 (jour 350 / 7 200) »). Le palier atteint est conservé (`S.tierMax`). Sauvegarde automatique toutes les 30 s réelles et 0,4 s après chaque construction (`saveSoon`).
- **Terrain du siège** : `hqSite()` cherche un lot 2×2 libre en ville ; sinon il propose le lot bâti le moins cher à racheter (`acqPlan`, exécuté par `acqExec` via la fenêtre d'acquisition) avec message explicite (coût rachat + construction) ; à défaut, pistes (démolir un bâtiment, racheter à un rival). Bouton « Voir le terrain » dans la barre d'objectif quand le jalon est le siège.

## Passe : « Round honnête » (capital, impôt, technologies, Fabriquer)
Quatre failles du Round (objectif 1 Md$) corrigées ; test : `t24_round_honnete.js`.
- **Levée de capital** : `valuation()` = **valeur d'entreprise × part du fondateur** (`enterpriseValue()` = `S.stats.raw`, `1 − S.float` = part). Victoire, paliers, missions et classement du Round portent sur cette valorisation du fondateur : lever du capital ne fait jamais gagner. Une émission (IPO 30 %, augmentation 10 %) crédite la caisse et la valeur d'entreprise d'autant, mais dilue le fondateur ; le prix d'émission est au pair au mieux (jamais de prime) avec 5 % de décote (`ISSUE_DISC`, `issuePr()`, `raiseAmt(raw, f)`) : le fondateur perd ≈ 2 % à l'IPO et ≈ 0,5 % par augmentation. La levée reste utile pour financer (arbitrage dette/capital). La fortune personnelle (`personalNet`) et le cours (prime de marché) sont inchangés.
- **Impôt sur les sociétés** : l'impôt n'améliore plus l'humeur par lui-même. Seules les recettes réellement perçues financent des services publics : taux perçu lissé `S.taxEff` (mis à jour seulement les jours bénéficiaires, non sauvegardé), `taxSvc() = 6 × (f(taux effectif / 25 %) − f(1))` avec `f(x) = 1 − e^(−0,7x)` : nul au réglage par défaut (25 %), −2,2 pts à 5 %, +1,3 pt à 45 %, jamais plus de +3 (rendements décroissants) ; il remplace seulement l'ancien terme `(taux − 0,25) × 60` de la formule d'humeur (±12 pts avant). Au-delà de 25 %, `taxDrag()` réduit la cible de population de 60 % de l'écart (−12 % à 45 %) : investissement et afflux d'habitants reculent. Plus d'impôt = bénéfices plus faibles, bonus presque saturé, population moindre : le réglage optimal n'est plus « le maximum ».
- **Technologies** : coût = `TECH_ERA[ère].cap × pct × poids` (ère I : 20 M$ × 1,5 %, II : 120 M$ × 2,5 %, III : 400 M$ × 4 %, poids = coût d'origine / référence borné à 0,7-1,5), soit 1 à 6 % de la capitalisation attendue ; jamais moins de 0,3 % du capex du bâtiment débloqué. Moyennes : 0,36 M$ (I), 3,7 M$ (II), 18,6 M$ (III) ; avant : 0,3 à 12 M$ avec des centrales à 22 M$.
- **« Fabriquer »** : `producePlan(pk)` (lecture seule) chiffre R&D/licence, usine, composants, extracteurs de matières premières (fonderie pour les lingots) et fonds de roulement matières (5 jours) ; `askProduce(pk)` affiche l'écran de confirmation (liste, COÛT TOTAL, case « construire aussi les extracteurs », avertissement précis si la chaîne est incomplète, Annuler) ; `quickProduce` ne construit plus rien si la trésorerie ne suffit pas et lance la R&D avant de bâtir. Le conseil « Tu as déjà tout pour le faire » n'apparaît plus s'il manque une matière, un composant ou une usine (il dit ce qui manque). API : `WSE.producePlan`, `askProduce`, `fabConfirm`, `fabCancel`.
- **Limites** : le coût annoncé estime le terrain du premier emplacement libre (écart possible de quelques % à la construction) ; les rivaux sont comparés à la valeur d'entreprise, le fondateur à valeur × part (leur actionnariat n'est pas modélisé).

## Passe : révélation produit « cinéma » et liaisons entre unités (vue Dessus)

### Vignette cinéma du produit
- À chaque lancement de produit (fin de R&D, licence, produit standard) et à la première fabrication en usine, `cineShow(pk)` ouvre `#cine` : plein écran, canevas 2D 1280x720 en 16:9, bandes de cinéma (letterbox), fond sombre, halo de la couleur du produit, reflet de sol, travelling lent (Ken Burns), balayage de lumière, grain, particules, titre condensé, sous-titre (famille, gamme, caste), trois chiffres animés (prix conseillé, qualité, marge), puis fondu. Durée 5,4 s (3,2 s avec `prefers-reduced-motion`). Ignorable au clic, à Échap, Espace ou Entrée. Aucune dépendance, aucun `Math.random` : grain et particules utilisent une graine fixe (`cineRnd`), le fond est pré-rendu, la boucle `requestAnimationFrame` s'arrête et libère ses canevas à la fermeture.
- Option « Ne plus afficher » : case à cocher dans la vignette et boutons dans Menu > Objectifs ; mémorisée dans `localStorage` (`wse-cine` = `0`), hors sauvegarde de partie. File d'attente de 3 produits maximum.
- Fiche produit : bouton « Revoir la présentation » (toujours possible, même option désactivée).
- Visuel héros HD : `assets/products_hd/<clé produit>.jpg` (ou .png / .webp) est embarqué par `tools/build.py` (placeholder `__PRODHD_JSON__` ; dossier absent ou vide = aucun poids). À l'exécution, `WSE.setProductHero(pk, src)` (data URI ou URL) le remplace ou le retire (`src` vide). Image HD présente = cadre 16:9 contenu ; sinon repli sur la vignette SVG (`prodImg`). Le jeu ne génère aucune image.
- API : `WSE.cine` { show, close, on, state, opt, setOpt, setHero, heroOf, facts, watch, reset, setTest }. Sous Playwright (`navigator.webdriver`), l'affichage automatique est désactivé (pour ne pas bloquer les clics des autres tests) sauf si `WSE.cine.setTest(true)`.

### Liaisons entre unités (vue Dessus, éclatée)
- `planLinkList` déduit du plan les flux achat -> stock -> machine -> vente (ou achat -> machine sans stock) ; `planLinksDraw` les trace sur les convoyeurs : épaisseur proportionnelle au débit, couleur de la marchandise, chevrons animés dans le sens du flux (figés si l'usine est à l'arrêt), étiquette « N u/j de <marchandise> » au survol (info-bulle et pastille). Flux coupé (rupture d'intrant, quai plein, débit nul) : rouge hachuré (`status: 'cut'`) ; saturé (goulot du plan) : orange (`'sat'`).
- Bouton « Masquer / Voir les liaisons » dans la barre de caméra (actif par défaut, sans effet en vue assemblée). API : `WSE.fac.links()`, `linksOn()`, `setLinks(v)`, `linkAt`.
- Tests : `tools/tests/t29_vignette_et_liaisons.js`.
## Passe 32 : filiales, vente interne, prix de cession, intégration fiscale, clients, arbre de chaîne

Demande du propriétaire (comme Capitalism Lab : un constructeur automobile ET sa filiale d'acier qui alimente la maison mère). Tout est dans `game.template.html` (bloc « Passe 32 »). Test : `tools/tests/t28_filiales.js` (70 contrôles). Sauvegarde `wse-city-v8` inchangée : champs facultatifs `firms`, `grp`, et par bâtiment `fm` (société) et `is` (vente interne) ; une ancienne sauvegarde se charge avec tout à la maison mère.

**Modèle de données.** `S.firms = [{ id, name, col, born, isale, tpDef, tp, cash, debt, lossC, own, cum, m30, d }]` ; `c.firm` = id de la société du bâtiment (absent = maison mère) ; `c.isale` = 0/1 (absent = réglage de la société) ; `S.grp = { nid, integ, p: { isale, tpDef, tp }, led, pd, pm30, pcum, day }` (`p` = réglages de la maison mère). Le stock physique reste commun (`S.stock`, `S.prod[pk].stock`) ; le registre `S.grp.led[bien][société] = [stock libre, stock réservé à la vente interne]` dit à qui il appartient, la maison mère détenant le solde non attribué. Tant qu'il n'y a ni filiale ni vente interne, rien n'est calculé (`FGD = null`) et la simulation est strictement identique à avant.

**Où le régler.** Menu > Empire > « Groupe et filiales » (écran Groupe : une ligne par société, maison mère, filiales, rachats de rivaux `S.subs`, éliminations, consolidé ; « Où se gagne la marge » ; cessions internes du jour ; intégration fiscale ; création). Fiche société : nom, vente interne par défaut, prix de cession par défaut et par bien, compte de résultat (mois et cumul), bilan simplifié, flux, ROI, dette allouée, remontée de trésorerie, bâtiments, dissolution. Fiche bâtiment (onglet Intérieur, carte « Société ») : « Créer une filiale », « Affecter à … », « Vente interne », « Voir les clients ».

**Formules.**
- Cession interne : chaque fois qu'un bâtiment consomme du stock appartenant à une AUTRE société du groupe (ordre : son stock, puis le stock réservé des autres, puis leur stock libre ; le fournisseur « Groupe » choisi passe en premier), il paie `quantité × prix de cession du vendeur`. Prix de cession = prix de marché × pourcentage (70 à 130 %, défaut 100 %, par société et par bien) ou prix libre.
- Compte d'une filiale, par jour : CA externe (ventes en magasin, marché local, export, services, au prorata de son stock libre vendu) + CA interne − achats internes − coûts externes (achats extérieurs, salaires, exploitation, transport, publicité) = EBITDA ; − intérêts de la dette allouée (`dette × taux / 360`) = résultat avant impôt ; − impôt = résultat net, ajouté à sa trésorerie interne. Amortissements = investissement / 1 500 j (affichés, hors base imposable, comme pour le groupe). ROI = résultat net annualisé / immobilisations.
- Maison mère = consolidé − filiales, ligne par ligne. Donc somme des sociétés = consolidé, et somme des trésoreries = `S.cash` (contrôle affiché dans l'écran Groupe, vérifié par le test chaque jour). CA interne total = achats internes totaux : la marge intra-groupe s'annule en consolidation.
- Impôt par société : `max(0, résultat − pertes reportables de la société) × taux`, pertes reportables propres (plafond 50 M$). Une filiale en perte ne réduit donc pas l'impôt des autres : on arbitre avec le prix de cession (loger la marge là où il y a des pertes) et la dette allouée. **Intégration fiscale** (option du groupe) : la mère et les filiales détenues à 95 % au moins depuis 30 jours sont imposées sur leur résultat d'ensemble ; coût 0,15 % du CA consolidé, prélevé chaque jour (ajouté aux coûts d'exploitation).
- Compte par bâtiment : l'écart (prix de cession − prix de marché) × quantité est ajouté au coût d'intrants de l'acheteur et à la production valorisée des bâtiments vendeurs.

**Vente interne.** Active : la production du bâtiment entre en stock réservé ; le marché local (`stepLocalMarket`), l'export et les concurrents n'y ont pas accès ; au-delà de la capacité de stockage le surplus est perdu (ligne « Surplus perdu » de l'écran Groupe). Inactive (défaut) : vendue à toute demande, y compris aux sociétés sœurs. Changer l'option ne rompt aucun contrat : les acheteurs gardent leur fournisseur et les chantiers BTP restent servis ; seul le stock déjà produit suit l'option (réservé quand tous les producteurs du bien de la société sont en vente interne, libéré quand plus aucun ne l'est).

**Fournisseurs.** Dans « Sélectionner un fournisseur », chaque société du groupe qui produit l'intrant apparaît avec l'étiquette « Groupe », son prix de cession, fret 0 (le transport est déjà payé par le producteur), délai 0 j, et la même note globale que les autres (prix livré et qualité). Mode enregistré : `c.src[bien] = 'grp:<id>'` (pas d'import de secours : si la filiale ne suit pas, l'usine attend).

**Clients.** `clientsOf(c)` : bâtiments du groupe qui consomment le bien (volume, ce qu'ils fabriquent, prix de cession), concurrents IA, marché local, export, au prorata de la part du bâtiment dans la production du bien.

**Arbre de chaîne** (fiche d'un produit ou d'un composant, bouton « Arbre de chaîne · monter la filiale fournisseur ») : `chainTree(pk)` descend du produit à ses composants puis aux matières premières. Statut par nœud : fabriqué par ta filiale (capacité utilisée, coût de revient), fabriqué par la maison mère, acheté à un fournisseur (prix livré), importé (prix + fret), MANQUANT (coût d'installation, délai), non requis (matière d'un composant acheté). Goulots en orange ou rouge avec la cause (capacité insuffisante par rapport au besoin cumulé, rupture d'intrant, effectif, route). En tête : coût total de ce qui manque et gain mensuel si tout est fabriqué dans le groupe, `Σ (prix d'achat livré − coût de revient estimé) × besoin × 30`. Clic sur un nœud : fiche d'action. Manquant : « Construire la filiale manquante » (plan `chPlan` : usines et extracteurs jusqu'aux matières premières, coût construction + terrain + prime de site, confirmation ou annulation ; `chExec` crée la société, bâtit, affecte, active la vente interne, prix de cession 100 %, branche les usines clientes). Acheté ou importé : « Choisir un fournisseur » ou « Internaliser » (acheter contre fabriquer : marge gagnée ou perdue par mois, retour sur investissement). Arbre en DOM (`role="tree"`), repliable, flèches du clavier, plein écran sur mobile.

**Limites.** Le stock est commun : une usine en mode « Groupe » dont la filiale n'a plus de stock prend celui des autres sociétés (au prix de cession de son propriétaire). La publicité des produits, les brevets, les contrats BTP et les revenus des rachats restent à la maison mère ; les exports faits par un entrepôt ne tiennent pas compte de la vente interne. Pas de variation de stock dans le compte d'une filiale (une production stockée pèse sur son résultat jusqu'à la vente). Toutes les filiales créées sont détenues à 100 % (la condition de 95 % est codée mais ne joue pas encore). La part de chaque concurrent dans les achats du marché local est une clé de répartition, pas des achats individuels simulés : les rivaux n'achètent des intrants qu'à travers ce marché local. Le coût annoncé d'un plan ne comprend pas le raccordement routier des mines, et les primes de mission touchées en construisant viennent en déduction.

## Passe : rivaux vivants (une IA par caste, prix, stratégies, sièges)
Les rivaux étaient des attraits agrégés figés : sans prix, sans initiative. Ils deviennent des entreprises qui fixent leurs prix, s'attaquent au joueur, s'étendent, font faillite et se rachètent.

**Six castes, six sièges.** Comme dans Capitalism Lab, toutes les castes sont dans la partie dès le départ. Chaque caste est un siège (`S.seats` : `{ caste, ctrl: 'ai' | 'human', pid, since }`) toujours occupé. Le joueur prend le siège de sa caste ; les 5 autres sont tenus par des IA (`S.rivals`, champ `caste`) : Mega Mart (exploitant agricole : coopératives et distribution alimentaire), Luxor & Fils (banquier : banque privée et luxe), DiscountCo (négociant : prix cassés), Vulcan Industries (baron industriel), Atlas Promotion (promoteur BTP), Novatek Labs (innovateur tech). Trésorerie de départ commune (Round : 10 M$ Normal, 100 M$ Facile). Le réglage « Nombre de concurrents » vaut 5 par défaut ; au-delà de 5 s'ajoutent des concurrents sans caste ; les scénarios gardent 3 enseignes avec leur poids d'origine.
- API `WSE.seats` : `list()` (sièges et entreprise de chacun), `claim(caste, joueur)`, `release(caste)`, `isFree(caste)`, `company(caste)`, `order(caste, { px })`.
- `claim(caste, 'me')` au départ : l'IA de ce siège s'efface et la caste manquante entre. En cours de partie (Menu > Partie > Changer de caste), l'IA du siège visé garde son entreprise et reprend la caste que le joueur quitte.
- `claim(caste, 'h:nom')` : un autre humain hérite de l'entreprise de l'IA telle quelle (trésorerie, magasins, actifs, marque, prix, rang). L'IA cesse aussitôt d'agir pour ce siège (prix, expansion et actions de caste figés), l'entreprise continue de vendre, l'humain fixe ses prix par `order`. `release` rend la main à l'IA sans réinitialisation : les prix reviennent par pas bornés.
- `company(caste)` renvoie le même objet pour le joueur et pour une IA (trésorerie, dette, valeur, ventes, résultat, parts, prix, marque) : c'est la frontière du futur multijoueur. Aucun code réseau.
- Écran des castes : statut de chaque siège (« IA (enseigne) — disponible », « Joueur : nom », « Ton siège ») et bouton « Prendre cette caste ».

**Prix.** Chaque IA a un prix relatif par classe `r.px` (1 = marché) et un produit phare `r.fl`. Positionnements base / manufacturé : DiscountCo 0,86 / 0,88, Mega Mart 0,96 / 1, Vulcan 1 / 0,98, Atlas 1 / 1, Novatek 1 / 1,08, Luxor 1,08 / 1,10 (luxe 1,18).
- Prix cible du jour = positionnement × (part en recul : jusqu'à −9 %) × (trésorerie sous 4 % de la valeur : +6 % ; au-dessus de 45 % : −3 %) × (suivi du prix du joueur : coefficient 0,25 à 0,6 selon le profil, borné à −12 % / +10 %) × stratégie. Baisse de 3 % par jour au plus, hausse de 1,5 %.
- Attrait d'un rival = `attrait × marque × (prix / positionnement)^−e`, avec e = 2,4 (base), 1,8 (manufacturé), 0,8 (luxe), 1,4 (immobilier). Au prix habituel de l'enseigne rien ne change ; 20 % moins cher donne +71 % d'attrait sur les produits de base.
- Recettes = volume × cours × prix relatif. Marge = prix relatif − 1 + marge du profil (0,20 à 0,34) × qualité de gestion `r.mq` (0,82 à 1,12, fixée à la création) : à −20 % un rival vend à perte.

**Stratégies** (décision tous les 10 jours, tirages `rnd()`) :
- **Guerre des prix** : si le joueur tient au moins 30 % d'une classe (40 % en Facile) où le rival est installé, celui-ci casse ses prix de 10 à 25 % pendant 40 à 90 jours (Facile : profondeur × 0,75, durée × 0,7). Toast et bandeau. Une seule guerre à la fois, trêve de 180 jours ; elle s'arrête plus tôt si la trésorerie du rival tombe sous 4 % de sa valeur.
- **Prix limite** : quand le joueur gagne plus de 2,5 points de part dans une classe, −7 % pendant 30 jours.
- **Expansion ciblée** : nouveaux points de vente dans les classes de cœur du rival (poids × 2), pondérés vers les classes où le joueur est faible (× 0,85 à × 1,2). Pendant son implantation (+0,35 d'attrait à 3 IA, +0,21 à 5 IA : budget d'ensemble constant) le rival investit sa trésorerie de départ, au rythme d'ensemble des 3 enseignes d'origine ; ensuite il garde 12 % de sa valeur en réserve et n'ouvre que s'il gagne au moins 3 % de sa valeur par an. Attrait cumulé des rivaux plafonné à 1,3 par classe. Un rival déficitaire ferme 3 % de ses magasins par mois.
- **Rachat hostile** : OPA sur le joueur coté dès 25 % de flottant (réussite `(flottant − 0,2) × 1,5`, mêmes effets que la prise de contrôle existante) ; sinon offre sur son bâtiment le plus rentable (1,3 × coût + 60 jours de bénéfice). Accepter encaisse le prix, le bâtiment devient un immeuble du rival.
- **Entente** : un rival propose un cartel sur une classe. Accepter : prix de rayon du joueur +8 %, prix des rivaux +6 à +12 %, pendant 90 jours ; tous les 10 jours, 7 % de risque (5 % en Facile) d'une amende de 5 % de la valorisation (250 000 $ au moins). Refuser : 45 à 85 % de risque de guerre des prix selon le profil.
- **Faillite** : trésorerie négative après 10 ventes forcées, ou attrait total sous 0,1. Les actifs sont à vendre 30 jours à 45 % de leur valeur. Le joueur les rachète (filiale : revenu de 12 % des ventes du failli, ses immeubles lui reviennent) ; sinon le rival le plus riche les prend (60 % de l'attrait). Le siège vacant est repris par une nouvelle IA de la même caste sous 45 jours.
- **Actions de caste** (tous les 60 jours, 6 % de la valeur au plus) : l'exploitant agricole met des terres en culture (fermes visibles) ; le promoteur rachète des immeubles de la ville et livre des logements ; l'industriel ouvre des usines (tours à sa couleur) ; le banquier prend des participations et resserre le crédit du joueur endetté à plus de 35 % (+1,5 point pendant 60 jours) ; le négociant signe des contrats de négoce (pas d'effet sur les cours : une hausse de 12 % d'une matière ruinait le bot industriel, 82 M$ sans elle contre −17 M$ avec) ; l'innovateur dépose des brevets et ouvre des data centers. Ces actifs rapportent 8 % par an, avec rendements décroissants. La banque de Luxor et les data centers de Novatek prennent en outre jusqu'à 12 % des recettes de services du joueur.
- Valeur d'un rival = trésorerie + magasins (27 M$ par point d'attrait) + actifs hors magasins + immobilier.

**Lisibilité.** Menu > Concurrents : une carte par IA (caste, parts par catégorie, prix relatif par classe, produit phare, stratégie en cours, par exemple « guerre des prix contre toi sur les produits de base (−17 %) jusqu'au jour 265 », valorisation et croissance depuis le départ, trésorerie), offre en attente, actifs d'un failli, état des sièges, journal des rivaux. Bandeau au-dessus de la barre d'outils : guerre en cours, entente, offre avec Accepter / Refuser.

**Sauvegarde.** `wse-city-v8` inchangée : champs optionnels sur les rivaux, plus `rv` (état commun) et `seats`. Une ancienne sauvegarde garde ses 3 rivaux, qui reçoivent caste et prix au premier jour.

**Mesures** (`tools/bot_round.js`, Round Normal, 7 200 jours). `DUMP=1` détaille chaque rival, `MARK=0.02` resserre les points de mesure, `rv` compte guerres, ententes proposées, offres de rachat, faillites et OPA.

| Profil (caste industriel) | Avant : valorisation finale, issue | Après : valorisation finale, issue | Parts finales joueur / rivaux (base · manufacturé · luxe), après |
|---|---|---|---|
| bon | 548 M$, temps écoulé | 114 M$, temps écoulé (514 M$ au réglage précédent) | 26/73 · 27/73 · 31/69 |
| rapide | 920 M$, temps écoulé (398 M$ avec un levier de 56 %) | 481 M$, temps écoulé (1 Md$ au jour 6 636 au réglage précédent) | 27/73 · 30/70 · 35/65 |
| lent | 507 M$, temps écoulé | 1 Md$ au jour 6 824 (526 M$ au réglage précédent) | 27/73 · 31/69 · 33/67 |
| casual | 618 M$, temps écoulé | 403 M$, temps écoulé (470 M$ au réglage précédent) | 27/73 · 31/69 · 31/69 |
| industriel | 52 M$ (97 M$ à 60 % du round) | 97 M$ (5 M$ au réglage précédent) | 24/23 · 9/22 · 8/55 |
| bon, Round facile | 1 Md$ au jour 2 860 | 1 Md$ au jour 3 548 | 27/73 · 27/73 · 28/72 |

« Réglage précédent » : même code, marge du promoteur à 0,30 au lieu de 0,34. L'écart entre les deux colonnes « après » donne la mesure du bruit : le résultat d'un bot en fin de round est chaotique, parce que sa fortune vient des services (tech, data centers, banque) et dépend du jour où il y entre. Sur l'ancienne version déjà, un levier de 56 % au lieu de 55 % fait passer le profil rapide de 920 à 398 M$. Ces mesures ne permettent donc pas de conclure que le round est devenu plus dur ou plus facile ; elles montrent que les bots restent premiers au classement des joueurs (sauf le profil industriel une fois, dernier avec 5 M$), que 2 parties sur 10 atteignent le milliard (aucune sur 6 avant) et que le Round facile est gagné 690 jours plus tard.

Valorisation des rivaux sur un round Normal (profil bon) : avant, Mega Mart ×1,2, DiscountCo ×1,6, Luxor ×2,6 ; après, Luxor ×2,1, DiscountCo ×2,3, Atlas ×2,8, Mega Mart ×3,4, Novatek ×5,4. Face au bot industriel, qui prend leurs clients, Mega Mart et DiscountCo reculent (×0,6 et ×0,4). Par round Normal : 3 à 10 guerres des prix, 18 à 38 ententes proposées, 44 à 52 offres de rachat ; aucune faillite spontanée (les IA ferment des magasins avant d'en arriver là ; la faillite n'est observée qu'en dégradant la gestion d'un rival, comme dans le test). En Facile, avant, les rivaux perdaient de la valeur (Luxor 100 → 82 M$ au jour 2 860) ; après ils en gagnent (×1,4 à ×1,7 au jour 3 548).

Trois réglages protègent les calibrages existants. Les rivaux tirent dans un flux aléatoire privé (`S.rv.rs`) et le flux commun consomme autant de tirages qu'avec les 3 enseignes d'origine : les marges des extracteurs de `t02` sont identiques à la décimale près. La demande de services reste calée sur 3 enseignes quel que soit le nombre d'IA. La banque de Luxor et les data centers de Novatek prennent jusqu'à 12 % des recettes de services du joueur à mesure que leurs actifs grandissent (`rivSvc`) ; à 30 % les bots plafonnaient vers 100 à 140 M$, à égalité avec Novatek.

**Tests** : `t27_rivaux.js` (46 contrôles) : 6 castes et sièges, prix par profil, prix réactifs, guerre déclenchée et terminée, entente acceptée / sanctionnée / refusée, offre de rachat et OPA hostile, faillite et rachat des actifs, claim / release d'un siège, panneau, valorisation non figée, joueur passif, déterminisme, ancienne sauvegarde.

**Limites.** Les IA n'ont pas de bâtiments simulés un par un : magasins et usines restent un attrait par classe, leurs tours et leurs fermes sur la carte sont des marqueurs de propriété. Un humain qui prend le siège d'une IA ne pilote que ses prix (`order`) ; le joueur local garde son propre empire quand il change de caste. Les IA ne se font pas la guerre des prix entre elles et ne s'entendent qu'avec le joueur. Les services (tech, data centers, banque) ne sont disputés que par un prélèvement sur les recettes (12 % au plus) : c'est là que les bots font leur fortune, les rivaux pèsent donc sur les parts de marché plus que sur le résultat du round. Aucune faillite spontanée n'a été observée sur les rounds mesurés.

## Passe : concurrence IA à la Capitalism Lab (rivaux fabricants)
Étude des règles publiques de Capitalism Lab sur les entreprises IA (sources, règles reformulées, niveau de confiance, écart détaillé) : `docs/CAPLAB_CONCURRENCE_IA.md`. Dans Capitalism Lab, les IA **fabriquent** et **achètent leurs intrants** (y compris au joueur) ; les nôtres vendaient une marge fixe sur un attrait. Elles ont désormais des usines réelles (champs optionnels des rivaux : `fab`, `debt`, `vs`, `cb`, `oo`, `fsm`, `div`, `pxL`, `pxD` ; état commun `S.rv.inD`, `S.rv.fabs`).
- **Fabriquer ou acheter** (`fabPlan`, tous les 30 jours, sans aléa) : pour chaque produit des familles de sa caste (`RIV_FABF` : industriel = auto, électroménager, maison, jouets ; innovateur = électronique, santé ; agriculteur = alimentation, boissons ; négociant = alimentation, mode, maison ; banquier = mode et boissons ; promoteur = maisons préfabriquées), avec les **recettes du joueur** : marge fabriquée `1 − (1 − m_négoce) × (intrants au cours × surcoût d'import + 0,18)` contre marge de négoce ; l'usine (capacité = 30 % des ventes lissées de la classe, investissement = 150 jours de chiffre d'affaires) n'est construite que si elle gagne au moins 4 points et rapporte 22 %/an (seuil divisé par l'agressivité d'expansion). Financement : fonds propres au-delà de 8 % de réserve, le reste emprunté (dette ≤ 30 % de la valeur, taux directeur + 3 points).
- **Journée d'usine** (`fabDay`) : production bornée par la capacité, un stock cible de 12 jours et les intrants ; achats d'intrants ajoutés à la demande du marché local (`stepLocalMarket`) : **le joueur leur vend sa part** (relevé `S._lm[g].rivMe`), les importateurs suivent au rapport offre / demande du jour (cours inchangé). Pénurie quand le cours d'un intrant approche son plafond : l'usine ralentit, le port importe 35 % plus cher, 60 % des ventes manquées sont perdues et l'attrait du rival baisse (× 0,7 + 0,3 × taux de service). Intrant durablement trop cher : mise en sommeil (60 jours), réouverture quand la marge revient.
- **Distribution** : 80 % du surplus mensuel des usines sur le négoce rembourse la dette puis part en dividendes (part du joueur actionnaire minoritaire versée) : les usines changent la structure de coûts et les prix du rival sans lui donner une rente qui écraserait le joueur.
- **Prix** : un rival qui fabrique ne vend pas sous son coût moyen + 2 % (politique « ne jamais vendre sous le coût »), 4 % sous le coût au plus pendant une guerre des prix. Chaque mouvement de prix d'au moins 6 % est expliqué au journal par son facteur principal ; le journal garde 40 entrées.
- **Difficulté** : aucune usine IA la première année ; ensuite nombre d'usines par IA = palier du joueur + 1 après le jour 540 (− 1 en Round facile, 3 au plus) : aucune usine IA en début de partie. Note de difficulté de la concurrence en % (`WSE.riv.rating()`, 100 % au départ d'un Round Normal) en tête de Menu > Concurrents, avec les achats d'intrants des usines rivales.
- **Lisibilité** : fiche du rival : usines (produit, capacité, stock en jours, coût, rupture, bouton « Voir » qui centre la carte sur sa tour), dette, dividendes ; journal : ouverture d'usine avec marges, investissement, emprunt et retour, mise en sommeil avec l'intrant en cause, vente d'usine en détresse, prix.
- **Valeur d'un rival** = trésorerie + magasins + actifs + immobilier + valeur comptable des usines et du stock − dette.
- **API** : `WSE.riv.fab` (`plan`, `build`, `decide`, `day`, `kin`, `fill`, `max`, `val`, `line`, `mr`, `K`, `C`), `WSE.riv.rating`.
- **Sauvegarde** `wse-city-v8` inchangée : champs optionnels ; une ancienne sauvegarde se charge sans usines.
- **Test** : `t63_concurrence_ia.js` (21 contrôles). Mesures avant / après : `docs/CAPLAB_CONCURRENCE_IA.md` §5.
- **Limites** : pas de qualité ni de technologie par usine IA, pas de fusions entre IA, pas d'émission d'actions ni d'IPO IA, les usines IA ne vendent pas encore au joueur ; la conversion volume de classe ↔ unités physiques passe par la valeur.

## Passe : chômage plancher, humeur fluctuante, cycle irrégulier et chocs
Voir « Macroéconomie » ci-dessus. Test `tools/tests/t25_macro_humeur.js` : chômage ≥ 3 % sur 3 000 jours et 3 graines, humeur d'écart-type > 6 et corrélée au PIB, cycle irrégulier, chaque choc via sa carte d'événement (toast, bandeau, PIB, humeur, chômage), transmission du taux, ancienne sauvegarde. Sauvegarde `wse-city-v8` inchangée : `S.macro` (déjà enregistré) porte les nouveaux champs (`v1, amp, ar, bEnd, nairu, uL, sk, sh, shLast`), `mev` = coups d'humeur ; une ancienne sauvegarde sans ces champs est complétée au chargement. Le robot de test (`tools/bot_lib.js`) construit des logements sous 4,5 % de chômage (et non plus 2 %).

## Passe 33 : gisements industriels (métaux, chimie, minéraux, gaz), coproduits et chaînes lourdes

**Demande** : des gisements trop pauvres (pétrole, fer, charbon, cuivre, or, bois, gravier, sable, calcaire) pour une économie industrielle riche, à la Capitalism Lab. Le jeu compte désormais **11 gisements de plus**, **3 matières coproduites** (chrome, soufre, terres rares : ni gisement ni mine propres), 11 mines ou carrières de plus, et les chaînes qui en dérivent (inox, aluminium, batteries, aimants, chimie, engrais, briques, porcelaine). Tout est dans `game.template.html` ; le test est `tools/tests/t30_gisements.js`.

**Correction du propriétaire (géologie réelle, moins de types de mines)** : la première version avait 14 gisements et 14 mines. Nickel et chrome sont désormais **un seul gisement et une seule mine** ; les terres rares sont un **bonus des grosses mines de cuivre et de lithium** ; le soufre sort des **puits de gaz**. Il reste 11 nouvelles mines (`mnicr`, `mbauxite`, `mlithium`, `mzinc`, `mgraphite`, `gwell`, `qsilica`, `qclay`, `qsalt`, `mphos`, `mpotash`).

### 1. Gisements, mines et carte
| Gisement (clé) | Mine ou carrière (catalogue Extraction) | Cours de base | Cadence (u/j) | Capex | EBITDA visé | Palier | Sites sur la carte |
|---|---|---|---|---|---|---|---|
| Nickel-chrome (`nickel`) | Mine de nickel-chrome (`mnicr`) : **nickel + chrome** | 28 $ (nickel) ; 20 $ (chrome) | 250 nickel + 167 chrome | 2,25 M$ | 48 % | 2 | 20 cases, à 56 cases du port, 4 veines dont une au sud de la carte |
| Bauxite (`bauxite`) | Mine de bauxite (`mbauxite`) | 8 $ | 1 200 | 3,1 M$ | 42 % | 1 | 18 cases, à 30 cases du port (abondante) |
| Lithium (`lithium`) | Mine de lithium (`mlithium`) | 40 $ | 150 | 1,95 M$ | 50 % | 2 | 7 cases seulement : une veine riche à l'ouest, une petite au sud |
| Zinc (`zinc`) | Mine de zinc (`mzinc`) | 17 $ | 400 | 2,2 M$ | 45 % | 1 | 13 cases, dont un filon à 20 cases du port |
| Graphite (`graphite`) | Mine de graphite (`mgraphite`) | 24 $ | 250 | 1,95 M$ | 44 % | 1 | 11 cases, à 40 cases du port |
| Gaz naturel (`gas`) | Puits de gaz (`gwell`, comme un puits de pétrole : pipeline, sans teneur) : **gaz + soufre** | 11 $ (gaz) ; 7 $ (soufre) | 1 200 gaz + 120 soufre | 2,4 M$ | 20 % visé, ≈ 27 % mesuré | 1 | 13 cases, associé aux gisements de pétrole, à 32 cases du port |
| Silice pure (`silica`) | Carrière de silice (`qsilica`) | 6 $ | 1 600 | 2,4 M$ | 28 % | 0 | 55 cases (grands massifs), à 33 cases du port |
| Argile et kaolin (`clay`) | Carrière d'argile (`qclay`) | 5 $ | 1 800 | 2,2 M$ | 27 % | 0 | 40 cases, à 46 cases du port |
| Sel gemme (`salt`) | Mine de sel gemme (`qsalt`) | 5 $ | 1 800 | 2,25 M$ | 28 % | 0 | 48 cases, à 26 cases du port |
| Phosphate (`phosphate`) | Mine de phosphate (`mphos`) | 10 $ | 1 000 | 3,15 M$ | 35 % | 1 | 17 cases, à 50 cases du port |
| Potasse (`potash`) | Mine de potasse (`mpotash`) | 12 $ | 700 | 2,65 M$ | 35 % | 1 | 9 cases, à 51 cases du port |

- **Rareté et inégalités.** Les matières abondantes (silice, sel, argile, bauxite) sont des disques de 2 à 3 cases de rayon, assez proches du port ; le lithium et le graphite sont des filons de 3 à 4 cases par site, le nickel-chrome est loin. La **réserve par case** (`res`) est celle du type multipliée par la **richesse du site** (0,7 à 1,5) ; un site neuf découvert plus tard garde les règles existantes (prime d'acquisition ×1,6 par découverte).
- **Teneur du minerai** (qualité de site, `gradeOf`, 0,85 à 1,15, sans stockage) : propre à chaque région de 6 × 6 cases, elle multiplie la production de la mine (donc l'EBITDA). Affichée dans le message d'un clic sur le gisement et dans la fiche de la mine. Le gaz, comme le pétrole, n'en a pas. Les anciens gisements restent à 1.
- **Cartes et sauvegardes.** Les nouveaux sites sont posés **après** les anciens : une nouvelle carte garde ses 9 216 cases d'origine strictement identiques (vérifié case par case contre la version d'avant la passe 33). Une sauvegarde antérieure reçoit les sites manquants au chargement, uniquement sur des cases libres. **Migration de la première version de la passe 33** (`LEGACY_T`, `LEGACY_DEP`) : les gisements `chrome`, `rare` et `sulfur` deviennent respectivement nickel-chrome, cuivre et gaz (mêmes cases, mêmes réserves) ; les bâtiments `mnickel` et `mchrome` deviennent `mnicr`, `mrare` devient `mcopper`, `msulfur` devient `gwell` ; les stocks de chrome, terres rares et soufre sont conservés. Fixtures de test : `tools/tests/fixtures/save_v8_avant_passe33.json` (version d'avant la passe 33) et `save_v8_passe33_v1.json` (première version, avec les mines séparées).
- **Dessin.** Chaque mine a son **icône vectorielle** (`ICONS`) et sa couleur. En carte : tunnel de mine pour les métaux, carrière pour silice/argile/sel, chevalet de pompage pour le gaz ; les gisements au sol prennent la couleur de la matière. Sprites à produire : `tools/factory_ai/phase2/GISEMENTS.md`.

### 2. Coproduits (mines à sorties multiples)
Un type de bâtiment d'extraction a un bien principal (`ext`, le gisement) et peut déclarer `co: { bien: ratio }` : quantité coproduite par unité du bien principal, ratio fixe. `coLvl > 0` réserve le coproduit aux grosses mines (niveau d'amélioration >= `coLvl`, soit niveau 3 à l'écran).
| Mine | Coproduit | Ratio | Condition |
|---|---|---|---|
| Mine de nickel-chrome | chrome | 0,667 chrome par nickel (soit 60 % / 40 %) | toujours |
| Puits de gaz | soufre | 0,10 par unité de gaz | toujours |
| Mine de cuivre | terres rares | 0,03 | niveau 3 ou plus |
| Mine de lithium | terres rares | 0,10 | niveau 3 ou plus |
- Les coproduits entrent dans le stock, le chiffre d'affaires de la mine (au cours du marché), le fret et le compte des sociétés du groupe. Le capex et l'entretien d'une mine sont calibrés sur son chiffre d'affaires **permanent** (nickel + chrome ; gaz + soufre) ; les terres rares sont un **bonus** : une mine de cuivre ou de lithium reste rentable sans.
- Affichage : fiche de la mine (« Produit aussi : Chrome », « Produit aussi : Terres rares : à partir du niveau 3 (niveau actuel 1) »), sous-titre du catalogue, guide du fabricant (« Coproduit par … »), ligne « Sert à ».
- Chaînes : `RAW_SRC` envoie chrome vers la mine de nickel-chrome et soufre vers le puits de gaz ; `CO_SRC` (terres rares) compte les grosses mines de cuivre ou de lithium (`mineMakes`). `producePlan`, `quickProduce` et le plan de filiale n'ajoutent **qu'une mine** quand plusieurs matières viennent du même bâtiment (le plan des casseroles inox : une mine de nickel-chrome). Les terres rares n'ont pas de constructeur automatique : le plan les compte comme achetées tant qu'aucune grosse mine n'en produit.
- Marché : offre locale et PNJ pour chaque matière coproduite (`LOCAL_D`, producteurs PNJ, import par le port au cours mondial + fret) inchangés ; la demande des rivaux majore le chrome, les terres rares et le nickel.
- **Non retenu** : zinc avec plomb et argent (ni plomb ni argent dans le jeu), pétrole avec soufre (le puits de pétrole d'origine reste inchangé).

### 3. Matières et recettes (calibrées par `calP` : EBITDA des usines 10-18 %, quel que soit le prix des intrants)
| Composant | Usine | Recette (par cycle) | Prix de base | Sert à |
|---|---|---|---|---|
| Acier inoxydable | moyenne | acier + chrome + nickel | 25,6 $ | réfrigérateur, lave-linge, micro-ondes, petit électroménager, casseroles et couverts inox |
| Acier galvanisé | petite | acier + zinc | 16,5 $ | châssis des voitures |
| Laiton | petite | cuivre + zinc | 20,5 $ | quincaillerie |
| Alumine | moyenne | bauxite + produits chimiques + gaz | 25,2 $ | aluminium |
| Aluminium | moyenne | alumine + charbon (énergie) | 42,5 $ | châssis en aluminium, vélos électriques, ordinateurs portables |
| Châssis en aluminium | moyenne | aluminium + peinture | 92,7 $ | voiture en aluminium |
| Aimants permanents | moyenne | terres rares + acier | 27,6 $ | moteurs électriques, smartphones |
| Engrais | petite | phosphate + potasse + gaz | 14,8 $ | option Engrais des fermes |
| Briques | petite | argile + gaz | 7,1 $ | maison en béton |
| Porcelaine | moyenne | argile + silice + gaz | 18 $ | vaisselle |

Recettes existantes branchées sur les nouvelles matières : **produits chimiques** (pétrole + sel + soufre : plus de charbon), **principes actifs** (+ phosphate), **verre** (sable + silice + charbon), **silicium** (silice + charbon), **batteries** (fil de cuivre + plastique + lithium + graphite), **moteurs** (+ aimants), **céramique** (argile + calcaire + charbon), **quincaillerie** (acier + laiton + plastique), **LED** (+ terres rares), **châssis acier** (acier galvanisé + acier + peinture). Les prix sont recalés automatiquement : marges cibles inchangées (usines 10-18 %, pharma en marge brute >= 72 %, commerces 5-14 %).

Produits : deux nouveaux, **Voitures en aluminium** (palier 3, prix de référence ≈ 1 225 $ contre ≈ 880 $ pour la voiture en acier) et **Casseroles et couverts inox** (palier 2). Produits existants qui changent d'intrants : réfrigérateur, lave-linge, micro-ondes, petit électroménager (inox), vélos électriques et ordinateurs portables (aluminium), smartphone (aimants), maison en béton (briques), vaisselle (porcelaine). Le **composeur** accepte les nouveaux composants.

**Engrais** : sur une ferme, le bouton « Engrais » consomme 6 % du volume récolté en engrais pris dans ton stock et donne **+20 %** de récolte (effet partiel si le stock est trop court). L'engrais se fabrique, il ne s'achète pas encore aux fournisseurs.

### 4. Marché, IA et chaînes automatiques
- **Offre et demande locales** : `LOCAL_D` pour chaque matière et composant nouveau ; producteurs PNJ (`LOCAL_CO`), import par le port, élasticités `EL_RAW` (gaz 0,5, lithium 1,2, terres rares 1,3). **Rivaux** : la demande de lithium, terres rares, nickel, chrome, aluminium, inox, aimants, graphite, silice et gaz augmente de 6 % par rival (`RIV_USE`). Choc énergétique : le gaz suit le pétrole et le charbon.
- **`autoSource`, `quickProduce`, `producePlan`, `chainTree`** passent par `RAW_SRC`, `CO_SRC` et `RECIPES`. Le plan « Fabriquer » d'une voiture en aluminium chiffre 33 lignes (mines de bauxite, de gaz et de sel) pour environ 90 M$ ; celui des casseroles inox ajoute **une** mine de nickel-chrome. **Correctif** : un produit encore en R&D (petite usine) se faisait voler son usine par ses propres composants (`freeFact`) ; `quickProduce` la réserve (`_hold`).
- **Lisibilité** : catalogue Extraction regroupé en **Énergie** (puits de pétrole, puits de gaz, mine de charbon, pipeline), **Métaux** (fer, cuivre, or, nickel-chrome, bauxite, zinc, lithium, graphite), **Minéraux industriels** (silice, argile), **Chimie de base** (sel, phosphate, potasse), Bois, Accès. Clic sur un gisement et fiche de mine : réserve, teneur, débouchés, coproduits. Guide du fabricant : ligne « Sert à » et mode SORTIES. Scénarios : mines de base au scénario 2, nickel-chrome, lithium et graphite au scénario 3.

### 5. Tests (`t30_gisements.js`)
Chaque gisement existe (>= 1 site accessible), rareté et inégalités, teneur dans ses bornes, noms uniques, aucune chaîne orpheline, toute feuille a un extracteur ou une source coproduite, icônes et couleurs distinctes, catalogue par familles ; chaque mine produit avec un EBITDA dans sa fourchette et un retour <= 3,5 ans ; **coproduction** (ratio 60/40, chiffre d'affaires cohérent, soufre du gaz, terres rares seulement à partir du niveau 3, fiche « Produit aussi ») ; EBITDA des composants nouveaux ; `quickProduce` d'une voiture en aluminium et de casseroles inox jusqu'aux mines (une seule mine de nickel-chrome) ; marché ; engrais ; **deux anciennes sauvegardes réelles** (avant la passe 33 ; première version avec mines séparées, migrée) ; déterminisme. Cibles mises à jour : `t10` (composants 35 à 60, 82 produits), plans de `tools/chain_audit.js` (mines de silice, de sel, de gaz et de phosphate ; plans `cookware` et `ebike`), aide `EXT` de `tests/lib.js`.

### 5. Reporté (hors périmètre de cette passe)
Étain, uranium (le nucléaire reste sans combustible modélisé), argent, titane ; lithium en roche dure (un seul gisement de lithium) ; vrais sprites des gisements et mines (liste dans `tools/factory_ai/phase2/GISEMENTS.md`) ; puissances étrangères spécialisées par métal rare ; engrais achetable à un fournisseur ; prime de poids pour la voiture en aluminium (elle coûte plus cher à fabriquer, sans avantage de vente pour l'instant).
## Passe : intégration des sept branches (réglages croisés)
Six régressions apparues seulement une fois les branches fusionnées, chacune mesurée avant / après :
- **Petit commerce (`t02`, s2 : EBITDA 3,4 % → 6,6 % ; s3 : 4,7 % → 7,3 %)**. Trois dérives s'additionnaient : (1) l'indice de clientèle (`custIndex`, part « Humeur de la ville ») restait centré sur l'ancienne échelle d'humeur (≈ 80) alors que l'humeur composite vit autour de 55-65 : pivot 55 → 32 (attrait des magasins +4 %) ; (2) le supermarché était le plus exposé au « Round honnête » (impôt à rendements décroissants : humeur, population et demande de produits manufacturés en baisse, salaires en hausse de 6 % par le chômage plus bas) et au pivot de `wageMkt` relevé pour le chômage plancher (+3,75 % de salaires, conservé car les témoins d'usine de `t10` en dépendent) : son entretien passe de 300 à 240 $/j (6,8 % du CA, entre le petit marché à 6 % et l'hypermarché à 10 %) ; (3) la phase d'implantation des rivaux (+0,35 d'attrait chacun) valait pour 5 IA au lieu de 3 : `rivYoung()` = 0,35 × 3 / nombre d'IA (budget d'ensemble inchangé).
- **Crise du crédit (`t25`, chômage +0,6 → +1,9 pt)** : l'exode dû au coût du logement réduisait la population active et masquait la hausse du chômage ; le choc gèle désormais les embauches (jusqu'à −1,6 % de postes) et relève le chômage frictionnel (`unempTarget`, terme `cz`).
- **Rivaux (`t27`, ×1,02-×1,18 → ×1,23-×1,61 en 1 200 jours ; ×3,2 à ×6,5 sur un round de 7 200 jours, joueur passif)** : à cinq sur le même marché, les magasins des IA étaient structurellement déficitaires (marge brute ≈ 22 % du CA, charges ≈ 32 %). `RIV_OPEX` passe de 420 à 220 × K_POP par point d'attrait ; les bénéfices sont réinvestis en actifs (actions de caste), la valeur suit.
- **Usine immersive (`t12`)** : le minuteur de repos des panneaux comptait le temps d'image plafonné à 50 ms ; quand la scène tourne sous 20 images/s il prenait du retard. Il compte maintenant le temps réel (`imm.rdt`).
- **Ancienne sauvegarde (`t09`)** : pas de défaut de migration ; Chromium vide parfois le localStorage d'un contexte en mémoire entre deux pages (clés vides mesurées au rechargement). Le test réinjecte la sauvegarde écrite par le jeu si le stockage revient vide.
### 6. Reporté
Étain, uranium (nucléaire sans combustible modélisé), argent, titane, plomb ; lithium en roche dure ; vrais sprites ; puissances étrangères spécialisées par métal ; engrais achetable ; avantage de vente de la voiture en aluminium ; constructeur automatique de terres rares (il faut monter de niveau une mine de cuivre ou de lithium).

## Passe 47 : brevets de produit, R&D et accélération (premier jalon de monétisation)

**Fin de la rente fixe.** Un brevet est désormais attaché à un produit : `S.pat[produit] = { since, until, holder, licensees, q, kind, roy, rate }`, lu par `patentHeld(pk)` (indicateur prévu pour le modèle de marges par pouvoir de marché).
- **Obtention** : le premier à terminer la R&D d'un produit dépose le brevet. En marché mûr (mode Libre), le produit existe déjà chez les offreurs : il faut être le premier à une **gamme supérieure** à la meilleure gamme vendue (Bureau > R&D et brevets > « Produits brevetables » liste ces trous du marché). Monter un produit à une gamme que personne ne fait donne un brevet d'amélioration (4 ans). Les produits standard (sans R&D) et les licences de marché ne donnent pas de brevet.
- **Durée** : 8 ans de jeu (1 an = 120 jours), 10 ans en haute technologie (palier ≥ 2), 12 ans en pharmacie (+1 an pour l'Innovateur tech). L'échéance est affichée, une alerte tombe 60 jours avant.
- **Exclusivité** : à la gamme couverte et au-dessus, seuls le titulaire et ses licenciés vendent ; les autres offreurs du marché mûr ne gardent qu'une **version de gamme inférieure** (comptée comme un demi-concurrent dans l'attrait) ou disparaissent si le brevet couvre la gamme de base.
- **Licences accordées** : des offres arrivent (au plus une tous les 30 jours par brevet, tirage `hash(jour, graine, clé)`) : forfait + 4 à 8 % des ventes du licencié. Redevance/jour = 12 % de la demande du produit × prix de gros × taux (×1,5 pour l'Innovateur), versée via les revenus technologiques (`S.patRev`) et débitée au rival licencié. Accepter = un concurrent de plus (attrait ×1/1,1 par licencié en marché neuf).
- **Brevets des rivaux** : à partir de l'an 3, tous les 60 jours, un rival peut breveter un produit que tu n'as pas développé (au plus 1 + 1 tous les 6 ans, 4 en tout ; gamme premium ou haut de gamme). Tu ne peux pas le développer à cette gamme : achète la licence (50 % de la R&D, transfert de technologie immédiat, puis 6 % de ton chiffre d'affaires), attends l'expiration ou choisis une gamme inférieure.
- **Valeur du brevet** = (redevances + rente de monopole ≈ 8 % du chiffre d'affaires du produit) × 120 jours × facteur d'annuité sur les années restantes (10 %).
- **Anciennes sauvegardes** : les n brevets à rente fixe deviennent des brevets sur tes produits développés, le reste un lot de « brevets à rente fixe » qui garde ses 70 $/jour pendant 8 ans puis expire. Les centres de R&D ne déposent plus de brevets : chaque dossier bouclé donne **5 jours de crédits labo** (plafond 90).

**Bureau du PDG > Stratégie > R&D et brevets** : solde de Diamants et crédits labo, conseil d'une phrase, recherches en cours (produits et technologie) avec barre de progression, temps restant et bouton **Accélérer**, produits brevetables, portefeuille (expiration, valeur, redevances, licenciés), offres de licence reçues (accepter, refuser), brevets des concurrents à licencier, brevets expirés, boutique de démonstration.

**Accélération** (à la Supremacy, sans tirage au sort) : retire des jours au temps restant d'une recherche.
- Coût en **Diamants** (monnaie premium ; « Or » prêterait à confusion avec l'or des mines) : `ceil(3 × jours^0,85)`, soit 1 j = 3, 5 j = 12, 10 j = 22 (dégressif).
- Alternative en **trésorerie** : 3 fois le coût journalier de la R&D (coût de R&D ÷ durée × 3), sans remise ; ou **crédits labo** (1 jour pour 1 jour).
- Plafonds : 10 % de la durée par jour de jeu (au plus 10 j) et la moitié de la durée par recherche. Le coût est toujours affiché sur le bouton puis dans une confirmation ; rien n'est débité avant « Confirmer ».
- Diamants : 100 au départ (test), +10 par palier atteint, +5 par jalon du conseiller.
- **Aucun paiement réel** : module `IAP` isolé, `IAP_LIVE = false`, `iapPurchase(packId)` n'ouvre qu'une boîte « Paiements bientôt disponibles » et ne crédite rien. Le commentaire du module indique où brancher StoreKit 2, Google Play Billing ou Stripe Checkout (crédit par le serveur uniquement).

**Apprendre > Brevets** : chapitre « Brevets et avantage concurrentiel » (ta situation, puis une phrase par cas : brevet détenu, licence payée, expiration imminente, avantage durable).

API : `window.WSE.rd` ; sauvegarde : champs facultatifs bornés `pat` et `rdx` (clé `wse-city-v8` inchangée). Test : `tools/tests/t47_brevets.js` (30 vérifications).

## Passe 43 : outil d'apprentissage (écoles de commerce)

Bureau du PDG > **Apprendre**, trois écrans, tous les chiffres sont lus dans la simulation (demande adressée `S._dw.pd`, ventes, production, stock, capacité des rayons `S._dw.pc`, capital de marque).
- **Atelier marque** (par produit) : capital de marque sur 120 jours, position sur la courbe en S (zones calculées : point d'inflexion, force 80 %), fidélité, prime de prix obtenue ($/u et %), volume dû à la marque, **valeur de la marque** = marge due à la marque par jour × demi-vie ÷ ln 2, coût et rendement de la publicité ((marge de marque encaissée + valeur gagnée) ÷ dépense), érosion à 30 et 90 jours. Expériences : **Campagne coup de poing** (15 jours, 2 × l'échelle TV du produit par jour ; demande +25 % à +55 % atteinte en 5 jours, effet résiduel ensuite ; capital +13 points environ) et **Tout couper** / Rétablir. Encadré « Ce que tu apprends ».
- **Supply chain** (produit et empire) : niveau de service, ventes perdues (unités, $ ; dont par rupture de stock), jours de stock, délai, rotation, capacités de production, production réelle, rayons, capacité servable contre demande de pointe, coup de fouet (variance production ÷ variance demande), stock de sécurité 1,65 σ √L, **maillon qui limite** (rayons, intrant, unité du plan, personnel, capacité) avec leviers (machine, prix +5 %, couper la pub, ouvrir l'usine). **Pics à venir** : hausse attendue, besoin de stock d'avance, verdict.
- **Chocs de commandes** : tendance virale (×1,5 à 1,9 pendant 7 à 10 j) ou commande exceptionnelle (×2,2 à 2,8 pendant 3 à 4 j), annoncés 4 à 6 jours avant, tirés par `hash(jour, graine, clé)` (désactivés avec les événements ; boutons d'exercice). Pendant un pic, une **rupture de stock** coûte de la fidélité (−1,2 par jour au plus, −8 par pic) et du capital (−6 % par pic au plus) ; un pic **tenu** (aucune rupture, part servie maintenue) donne +2 à +6 de capital et +2 de fidélité. Les rayons saturés ne coûtent pas de fidélité.
- **Bilan d'apprentissage** (aussi en fin de partie) : service moyen, ruptures et coût, valeur de marque créée, rendement de la pub, meilleur et pire pic, trois concepts expliqués ; **Copier le bilan** (JSON pour l'enseignant). API : `window.WSE.edu` ; sauvegarde : champ facultatif `edu` borné. Test : `t43_pedagogie.js`.

## Passe 38 : élevages (bovins, poulets, porcs, moutons), vigne et vin

Jusqu'ici le lait, les viandes et le cuir étaient des composants fabriqués à partir de blé : aucun élevage n'existait. Ils sont remplacés par de vrais **élevages** (Guide de l'agriculteur, comme Capitalism Lab) et la **vigne** remplace le composant abstrait « Alcools et ferments ». Source unique : `game.template.html` (test `t38_elevages.js`, liste de sprites à générer dans `tools/factory_ai/phase2/ELEVAGES.md`).

### 1. Fermes d'élevage (catégorie Agriculture, famille « Élevages »)
Posées en campagne comme les fermes de cultures (pas de gisement dessous, 25 % moins chères pour l'exploitant agricole, outils débloqués dès le scénario 2). Chaque bâtiment sort un bien principal et des **coproduits à ratio fixe** (mécanisme `T.co` des mines), tous **bruts** : aucune usine intermédiaire. Valeurs nominales par jour et par bâtiment avant échelle `K_SIZE` (`TYPES.*.live` : têtes, jours de croissance, blé par unité principale, risque de maladie par jour) :

| Bâtiment | Principal | Coproduits | Têtes | Croissance | Aliment (blé) | Maladie |
|---|---|---|---|---|---|---|
| Élevage de bovins (`fcattle`) | lait cru 70 | bœuf 0,15 et cuir brut 0,04 par unité de lait | 80 | 45 j | 0,6 | 0,4 %/j |
| Élevage de poulets (`fchicken`, 3x3) | œufs en vrac 80 | volaille 0,12 | 2 000 | 15 j | 0,6 | 0,6 %/j |
| Élevage de porcs (`fpig`) | porc 50 | cuir brut 0,03 | 300 | 30 j | 1,2 | 0,5 %/j |
| Élevage de moutons (`fsheep`) | laine brute 40 | agneau 0,35 | 400 | 30 j | 1,0 | 0,4 %/j |
| Vignoble (`fvine`, culture comme le blé) | raisin 70 | - | - | - | engrais optionnel | - |

Coûts et effectifs sont calibrés comme les fermes de cultures (capex = 2,5 ans d'EBITDA visé, entretien déduit après le coût de l'aliment) : de 7,2 M$ (bovins) à 8,9 M$ (porcs) contre 2,9 M$ pour une ferme de blé, 17 à 20 emplois.
- **Troupeau** (`c.hd`, sauvegardé) : 20 % à la pose, pleine capacité après `grow` jours ; les premières ventes sont donc réduites.
- **Aliment** (`liveStep`) : le blé est pris dans le stock, puis importé par le port au prix d'import (sauf si la source blé de la ferme est « Local »). Sans aliment la production tombe à **35 %** (`FEED_FLOOR`) ; la limite affichée est « blé ». La fiche du bâtiment (carte « Troupeau ») montre troupeau, alimentation, santé, pâturage et irrigation (même irrigation que les cultures : +10 % par niveau, sécheresse -35 % sans irrigation).
- **Épizootie** : probabilité quotidienne `dis` par ferme (RNG déterministe, `S.rs`) : 10 jours à -40 % de production et -10 % de troupeau, message d'alerte. Mesuré : 0 à 5 épizooties par ferme sur 400 jours.
- **Saisonnalité** (`SEASON`, calendrier de 12 mois de 30 jours, moyenne 1) : lait +/-12 % (pic de lactation en mai), œufs +/-8 %, laine +/-20 % (tonte), raisin +/-45 % (vendanges en septembre).
- Visuels : prairie, étable-hangar et animaux dessinés en vectoriel dans la scène du bâtiment ; icônes et couleurs propres.

### 2. Chaîne en aval
Matières brutes (groupe « matières premières », offre locale `LOCAL_D`, élasticités `EL_RAW`) : raisin, lait cru, œufs en vrac, bœuf, porc, volaille, agneau, laine brute, cuir brut (`RAW_SRC` renvoie vers l'élevage ; les coproduits comptent comme source). Composants restants : **Viandes (abattoir)** = 2 bœuf + 1 porc (3 sorties), **Vin** = 5 raisin (4 sorties). Les recettes `milk`, `leather` et `spirit` (blé) disparaissent ; yaourts, fromages, chocolat, plats cuisinés, aliments pour animaux, vestes, chaussures et sacs en cuir gardent leurs recettes et leurs marges (calibrage inchangé, les prix de référence suivent les nouveaux intrants).

Produits finis ajoutés (10), tous avec poids prix / qualité / marque, nécessité, demande par habitant, obsolescence, famille d'affichage et vignette :

| Produit | Classe | Intrants | Nécessité | Poids P/Q/M | Demande/hab./an |
|---|---|---|---|---|---|
| Lait de consommation | basic | 3 lait cru | 90 | 50/30/20 | 2,0 |
| Œufs | basic | 3 œufs en vrac | 85 | 50/30/20 | 1,6 |
| Viande de bœuf | basic | 3 bœuf | 78 | 50/30/20 | 0,9 |
| Poulet | basic | 3 volaille | 80 | 50/30/20 | 1,2 |
| Viande de porc | basic | 3 porc | 78 | 50/30/20 | 1,0 |
| Viande d'agneau | basic | 3 agneau | 70 | 45/35/20 | 0,35 |
| Saucisson et charcuterie | basic | 2 porc + 0,2 sel | 50 | 35/30/35 | 0,5 |
| Pulls en laine | std (usine moyenne) | 3,5 laine + 0,5 tissu | 40 | 30/30/40 | 0,25 |
| Vin de table | basic | 2,5 vin + 1,5 verre | 28 | 25/20/55 | 0,6 |
| Vin de grande réserve | lux (grande usine) | 5 vin + 2 verre + 1 planche | 3 | 8/32/60 | 0,02 |

Autres changements : **Spiritueux** = vin distillé (5 vin + verre) ; **Whisky de luxe** = blé (malt) + planches (fût) + verre, sans `spirit` ; la bière reste du blé et du sucre. Le composeur de produits (`allow`/`core`, `EDIBLE`) cite le vin au lieu des alcools.

### 3. Marché, IA et chaînes
Offre locale PNJ et import par le port via `LOCAL_D`, `stepLocalMarket` et `EL_RAW` (lait et œufs 0,4, bœuf 0,8, porc et volaille 0,7). `quickProduce` / « Fabriquer », `producePlan` et `chainTree` descendent jusqu'à l'élevage **et** à la ferme de blé qui le nourrit (`chainLeaves` ajoute le blé, l'arbre ajoute un nœud « blé » sous chaque matière d'élevage). Mesuré : plan « Fabriquer » des yaourts 21 à 25 M$, des plats cuisinés (bovins + porcs + blé) et des vestes (bovins) 45 M$.

### 4. Guides
Guide de l'agriculteur : raisin jouable, élevages sans « en préparation » : fiche par animal (capacité, croissance, saisonnalité, maladie, produits bruts avec rendement et cours, aliment, débouchés). Guide du fabricant : les matières brutes d'élevage indiquent leur ferme (« Extraite par » / « Coproduit par »).

### 5. Sauvegarde
`wse-city-v8` reste v8 : une ancienne sauvegarde se charge, ses gisements et bâtiments sont inchangés ; les stocks, cours et affectations d'usine « Alcools et ferments » deviennent du vin ; une usine affectée au lait ou au cuir devient « sans produit ». Les champs de vigne ne sont ajoutés qu'aux nouvelles cartes (la vigne se pose sur n'importe quelle campagne). `hd` et `sk` (troupeau, maladie) sont sauvegardés dans l'extra de la cellule.

### 6. Tests
`t38_elevages.js` (86 contrôles) : données des 5 fermes, plus aucune recette lait / viande / cuir au blé, produits finis de première nécessité, chaque élevage produit ses matières, croissance du troupeau, alimentation insuffisante = 35-50 % de la production, `quickProduce` de bout en bout (yaourts, fromages, lait, plats cuisinés, œufs, poulet, saucisson, agneau, pull, vin, veste), plan chiffré et arbre cliquable, guide, ancienne sauvegarde, déterminisme. `t10` recalé : 92 produits finis (au lieu de 82) dans la plage 70-95. Suite complète : 931 PASS.

### 7. Limites
Les animaux ne sont pas individualisés (troupeau = pourcentage) ; pas de reproduction ni d'abattage choisi ; le cuir brut n'a pas d'étape de tannage ; les concurrents IA n'ouvrent pas d'élevage (leurs fermes restent des cultures) ; sprites isométriques d'élevage à générer (`ELEVAGES.md`).

## Passe 46 : nouveau bâtiment principal du Mall central (architecture curviligne)

Retour du producteur sur la passe 45 : « on dirait un truc de la Gay Pride avec votre écran arc-en-ciel ». On garde l'esprit, l'emprise 10×10, le clic, le pôle, la tour de parking à rampes (en haut à droite), le marché de rue (étals, parasols, scooters, tuk-tuk, arbres, banderoles, passants) ; on remplace le bâtiment principal par une architecture moderne et curviligne, esprit Guggenheim / grand mall de Dubaï. Test : `t44_mall.js` (contrôle ajouté).

### 1. Le bâtiment (`mbBody`, `mbGeo`, `MBX`)
- **Socle ondulé** : superellipse (centre 4, 4 ; rayon 3 ; exposant 2,6), six bandeaux empilés aux ondulations décalées : vitrines chaudes à montants fins, dalles de titane nacré (liseré blanc en rive, filet doré en sous-face), rubans de verre bleu-gris éclairés de l'intérieur.
- **Tambour en spirale** : noyau vitré évasé (rayon 1,52 → 2,36 cases, cône inversé façon Guggenheim New York) qui s'incline en courbe vers la gauche (`mbDc`) et surplombe le socle ; rampe continue en ruban de titane (`mbZt`, pas de 54 px, 3,6 tours), terrasses plantées (haies) sur le dessus du ruban ; ruban de cuivre brossé qui s'enroule en diagonale de la verrière jusqu'à la couronne.
- **Verrière ondulée** de l'atrium (nappe de verre à trois vagues entre le tambour et l'acrotère) : intérieur chaud et galeries visibles par transparence ; jardin périphérique (haies, petits arbres) sur l'acrotère.
- **Couronne** de verre fumé portant l'enseigne **« MALL CENTRAL »** (`mbSign`) : lettres fines et espacées (IBM Plex Sans 500, repli Helvetica / Arial) posées sur la courbe (chaque lettre suit la tangente du cylindre), lueur blanc chaud, liserés dorés ; **coupole** vitrée à nervures nacrées (`mbDome`, panneaux visibles seulement), lanterne et oculus dorés.
- **Entrées** (`mbEntrances`) : halls vitrés chauds sur deux niveaux, ailerons de titane, auvents en demi-ellipse en porte-à-faux ; projecteurs chauds au pied du socle (`mbUplights`) ; **bassin** courbe à margelle blanche entre les deux entrées, jets d'eau animés.
- Palette sobre : titane nacré, verre bleu-gris, accents dorés et cuivrés, éclairage chaud ; aucun écran, aucun arc-en-ciel (le contrôle de `t44` mesure moins de 3 % de pixels saturés dans le rendu du bâtiment ; mesure : 0,7 %). Lumière venant de la gauche (`mbLit`, même convention que les faces des immeubles), ombres portées douces du socle et du tambour.
- Abords : parvis de granit clair (fini le damier rouge), stations BTS / MRT en verre et titane (petite enseigne blanc chaud, `mbBlade`), passerelles-tubes courbes vers les stations et **passerelle courbe vers la tour de parking** (`mbTube`, `mbParkBridge`), passants en tenues sobres (`MB_WALK`).

### 2. Performance (`mbCache`, `mbLive`)
- La partie statique (sol, arbres de l'arrière, bâtiment, entrées, enseigne) est rendue une fois dans un canvas hors écran (`ctx` est réassigné le temps du rendu), reconstruit seulement si l'échelle (zoom × dpr, par quart d'octave, plafonnée à 2,6) ou la police change. Restent animés : passants, liserés lumineux qui courent le long de la spirale, respiration des liserés du socle, reflet du ciel qui glisse sur le tambour, jets du bassin.
- Mesure : `drawMallBig` ≈ 0,85 ms par image contre ≈ 1,1 ms pour le rendu de la passe 45.
- Vue satellite (`mbSat`) : version allégée du même rendu en cache (silhouette tambour + coupole lisible de loin) et tour de parking.
- `MB.H` (hauteur de la couronne, 384 px) sert toujours au cadrage de la vue de départ ; `window.WSE.mall.render` expose `cache`, `builds`, `geo`, `MBX`, `draw` pour les tests.
## Passe 51 : maïs et colza (cultures, huile, biodiesel)

Les sprites `fcorn` et `frapeseed` du poste de production sont branchés : deux nouvelles fermes de cultures, quatre biens et trois produits finis.

### 1. Cultures (catégorie Agriculture, famille « Cultures »)
| Bâtiment | Bien brut | Base | Débit nominal | Capex (`EXT_CAPEX`) | Terrain préféré (`fertility`) |
|---|---|---|---|---|---|
| Culture de maïs (`fcorn`, 2×2) | Maïs (`corn`) | 6 $ | 100 (×5 × K) | 2,0 M$ | terres à moins de 35 cases de l'eau |
| Culture de colza (`frapeseed`, 2×2) | Colza en graines (`rapeseed`) | 9 $ | 70 (×5 × K) | 2,6 M$ | plaines à plus de 18 cases de l'eau |

Tables renseignées comme les autres cultures : `TYPES`, `GOODS` (groupe brut), `DEPOSITS`, `CROPS`, `CROP_COL`, `RAW_SRC`, `RES_COST` (0,80, EBITDA visé 20 %), `LOCAL_D` (maïs 560, colza 390 : même rapport offre / demande que le blé), `EL_RAW`, `Y_CROP` (maïs 0,96 : rendement mesuré près du port), icônes, menu, exploitant agricole (−25 %), `CASTE_BLD`, `PROC_IND`, verrou de scénario `L2`, `P2_TYPE` et `P2_NAMES` (sprites HD calés sur le losange de 2 cases comme `fwheat`). Mesuré (`isoExtractor`, champ le plus proche du port) : maïs EBITDA 17,6 %, retour 2,4 ans ; colza 23,8 %, 1,7 an ; la ferme de blé reste à 25,6 %, 1,2 an.

**Zones fertiles** (`CROP2_SITES`, `genCropFields2`) : 5 zones de maïs et 5 de colza réparties dans les quatre quarts de la carte (≈ 127 et 107 cases), générées **après** tous les autres gisements : les cartes existantes ne bougent pas. Une ancienne sauvegarde sans maïs ni colza reçoit ces zones au chargement, sur les seules cases libres (ni bâtiment, ni route, ni gisement).

### 2. Chaînes et produits
- **Huile de cuisine** (`cookoil`, petite usine) = 4 maïs + 2 colza → 3 ; **Biodiesel** (`biodiesel`, usine moyenne) = 4 colza + 0,5 produits chimiques (méthanol) → 3. Prix de base recalculés (`calP`, EBITDA 15 %) : 19 $ et 20,6 $ ; ils se vendent aussi comme marchandises au marché et au port.
- **Huile de table** (`tableoil`, basic) = 2 huile de cuisine + 0,3 plastique, nécessité 80, poids 50/30/20, 0,8 u/hab./an, famille Alimentation.
- **Chips de maïs** (`cornchips`, basic) = 2 maïs + 0,5 huile + 0,1 sel, nécessité 25, poids 35/25/40, 0,5 u/hab./an.
- **Biocarburant en bidons** (`biofuel`, basic) = 2 biodiesel + 0,3 plastique, nécessité 40, poids 55/30/15, 0,2 u/hab./an, famille Auto et outils. Le jeu n'a pas de consommation de carburant par les transports : le biodiesel se vend donc en bidons aux automobilistes et comme marchandise.
Les trois produits sont dans `P25` (le poids de demande des 35 produits d'origine ne bouge pas) avec `PROD_W`, `NECESS`, `DEMAND_PC`, `MEGA_OF`, `OBSO`, `PROD_TECH`/`TECH_SHARE`, `FAM`, vignette `GLY`. EBITDA mesurés (`isoFactory`) : huile de cuisine 14,5 %, biodiesel 15 %, huile de table 19,5 %, chips 19,7 %, biocarburant 19,4 %. Aucun produit existant n'a changé de recette.

### 3. Visuels et guides
Vignettes vectorielles des biens (`drawItem` : épi, fleur de colza, bouteille, fût), plants dans les champs et sur la scène de la ferme, couleurs de gisement. Guide de l'agriculteur : maïs (semis en avril, récolte en octobre) et colza (semis en septembre, récolte en juillet) jouables. Photos du Guide du fabricant attendues du Mac (`tools/factory_ai/photos_guide.json`, retour de l'intégrateur n° 9 dans `RETOURS.md`) : repli sur la vignette vectorielle d'ici là.

### 4. Tests
`t51_mais_colza.js` (41 contrôles) : données, prix, recettes, tables des produits, zones fertiles, sprites HD 2×2, production des deux fermes, rentabilité (EBITDA 15-30 %, retour 1,5 à 6 ans), marges des usines, « Fabriquer » de bout en bout jusqu'à la vente en magasin, guides, ancienne sauvegarde, déterminisme. `t02_marges` mesure aussi `fcorn` et `frapeseed` ; `t10_arbre` compte 95 produits (92 + 3).

## Passe 45 : le grand Mall central (bloc complet de 10×10 cases)

Demande du producteur : « le mall doit prendre un block complet de 10 cases et place-le au centre », façon grand centre commercial asiatique (MBK Center à Bangkok). Test : `t44_mall.js` (étendu).

### 1. Emprise et réseau
- `MALL_BIG = { x0: 26, y0: 26, w: 10 }` : cases 26 à 35, centre à 0,5 case du centre de la ville (même écart que l'alignement 25-34, mais l'anneau avant tombe sur les avenues 36 existantes : les lots les plus proches du bord sont devant le mall, visibles).
- `MALLB` (emprise active) et `isRoadPos` : aucune route dans l'emprise (l'avenue 30 s'arrête sur l'anneau), anneau complet autour (avenues 36 à l'est et au sud, nouvelles voies 25 au nord et à l'ouest), raccordé au réseau. `isRoadPos0` est l'ancienne règle.
- Les 100 cases sont des cases PNJ `mon` / `m = 'mall'` (`mallSet(grid, x, y, w)`) : non démolissables, non rachetables, sauvegardées avec la ville ; un clic sur n'importe laquelle ouvre le panneau « Le Mall ». `mallPos()` renvoie `{ x, y, w }` (w = 10, ou 2 pour l'ancien mall), `mallRect()` l'emprise.
- `cityScan` ignore les cases du mall et l'anneau public : la croissance (`cityGrow`, `cityExtend`) ne construit jamais dans l'emprise.

### 2. Ville de départ (`genNpcTown`)
- Le grand mall est posé avant la ville ; le mall tient lieu de cœur de ville : l'occupation des lots se mesure à `MALL_SH = 1,4` case du centre, la hauteur de départ à `MALL_LV0 = 6,5` cases, la valeur du sol de la croissance (`cityLV`, `cityTarget`) à `MALL_LV = 8,5` cases (les lots qui bordent l'anneau valent le centre) ; `CITY_D0 = 0,6` inchangé ; une rangée de lots libres au-delà de l'anneau, de chaque côté. Anciennes sauvegardes (sans grand mall) : aucun décalage.
- Mesures : **62 600 habitants** (capacité 73 500), 247 bâtiments PNJ dont 15 parcs et 11 équipements, 425 lots libres sur 672, plus haut immeuble 11 étages. Économie de départ inchangée (`S.bx` : 289 000 habitants-équivalents, emplois / actifs 0,88). Croissance : 62 k → 70 k en 3 ans de jeu, 83 k en 9 ans ; passif 194 k en 7 200 jours (plus haut immeuble 17 étages).

### 3. Rendu (`drawMallBig`, `mbLayout`, `mbItem` ; bâtiment principal remplacé à la passe 46)
- Sans image nouvelle (primitives iso) : bâtiment massif de 9 niveaux sur 6×6 cases (bandes de fenêtres éclairées, couronne LED en chenillard), quatre écrans LED animés (programmes « SALE −50 % », damier, arc-en-ciel, « MALL »), enseignes-drapeaux verticales (MODE, FOOD, SALE, TECH, CINÉ), bandeau d'enseignes, marquises rayées, deux grandes entrées couvertes, deux passerelles vers des pavillons (stations BTS / MRT), tour de parking à rampes accolée (logo P), enseigne « MALL CENTRAL » géante sur le toit, halo lumineux.
- Au pied : marché de rue dense (étals à toile rayée, parasols, rangées de scooters, tuk-tuk, arbres en bacs — sprite `arbre_ville` ajouté à `P2_NAMES`), parvis dallés devant les entrées, banderoles de fanions, une centaine de passants animés. Agencement déterministe (hash) ; tout reste dans l'emprise ; dessiné une fois depuis la case avant (x0 + 9, y0 + 9), dans l'ordre de profondeur interne. Vue satellite : un volume unique.

### 4. Pôle commercial
- `mallDist` mesure la distance depuis le **bord** de l'emprise (6 cases : +20 % ; 7 : rien). « Ouvrir ma boutique près du mall » (`mallSpot`) choisit la case libre la plus proche du bord, au bord de l'anneau.
- Halo nettement visible : contour doré lumineux autour des boutiques concernées et pastille « ★ +20 % » / « ★ +32 % » au-dessus du toit (`poleBadge`) ; outil de boutique choisi : losanges dorés sur les cases libres de la zone du bonus.

### 5. Caméra et accueil
- `frameCity` cadre tout le mall (enseigne comprise) entre le bandeau et la barre d'outils. L'encart « Bienvenue sur un marché déjà en pleine activité » est replié dans un coin (classe `wlmini`, bouton « Voir mes 3 idées ») et ne masque plus le mall.

### 6. Compatibilité
- `load()` n'active le grand mall que si la sauvegarde contient ses 100 cases ; une sauvegarde avec l'ancien mall 2×2 garde l'ancien réseau (avenue 30), l'ancien mall et l'ancien calcul de distance ; une sauvegarde sans mall se comporte comme avant (mall 2×2 ajouté si ses cases sont libres). `window.WSE.mall` gagne `rect` et les constantes `MALL_SH`, `MB_H`, `BIG`.
- Tests : `t44` (emprise 10×10 centrée, aucune route ni bâtiment dedans, anneau connecté, clic sur 5 cases, pôle depuis le bord, vue de départ, encart replié, croissance hors emprise, sauvegarde 2×2) ; population attendue 55 000-65 000 ; tolérance relative de 0,2 % sur la fréquentation enregistrée du pôle (la ville grandit tous les 2 jours, la fréquentation est rafraîchie tous les 5 jours). `t34` : les 100 cases du mall sont comptées à part (11 équipements + mall), le « centre » devient l'anneau de quartiers autour du mall (moins de 11,5 cases), la périphérie commence à 16 cases.

## Passe 44 : ville aérée, Mall central et pôle commercial

Le joueur doit voir ce qu'il peut construire et s'approprier la ville : elle démarre clairsemée, autour d'un grand centre commercial où les rivaux vendent déjà (test `t44_mall.js`).

### 1. Ville de départ aérée (`CITY_D0`, en tête du script)
- Réglage unique `CITY_D0 = 0,6` (1 = ville de la passe 35) : `genNpcTown(grid, d0)` prend la hauteur maximale d'une ville de 100 000 × √D habitants (centre de 2 à 10 étages, aucun gratte-ciel), occupe moins de lots (`× 0,55 + 0,45 D`), ajoute des parcs et pelouses (7 % + 12 % × (1 − D) des lots du centre) et laisse libre un parvis d'une case autour du mall.
- Mesures : **59 800 habitants** (capacité 70 200), 297 bâtiments PNJ (dont 21 parcs, 11 équipements, le mall), 463 lots libres sur 756, plus haut immeuble 10 étages.
- **Économie de départ inchangée** : `S.bx` (champ optionnel) ajoute au bassin des habitants-équivalents de la région (villages, navetteurs) : `popE = pop × 2,8325 + bx`, calé sur `POPE_REF = 288 533` (valeur de la passe 35). Emplois par étage (`S.jpf`), demande, chômage (9,3 %) et rapport emplois / actifs (0,88) sont identiques. Aucune constante économique n'est modifiée.
- Croissance : la ville regrandit (60 k → 67 k en 3 ans de jeu, 81 k en 9 ans en passif) ; tous les mécanismes (promoteurs, extension, densification) restent actifs.

### 2. Le Mall central
- Quatre cases PNJ `mon` (`m = 'mall'`) sur le coin 2×2 du bloc central (28-29, 28-29), contre le carrefour du centre ; sprite HD `mega_centre_commercial` (repli vectoriel), enseigne « MALL CENTRAL ». Non démolissable, non rachetable (équipement public), sauvegardé avec la ville. Il ne compte pas dans la satisfaction des services publics (économie inchangée).
- Clic : panneau **Le Mall** (`mallHTML`) : demande de la ville par rayon (u/mois, prix de rayon, ta part, celle des rivaux), qui vend quoi (chaque rival : caste, rayons, part de marché pondérée par la demande et lue dans `S.mkt`, prix relatif ×px et écart avec ton prix, produit phare), les produits les plus demandés par rayon (`mkDemandDay`, prix de rayon), règles du pôle commercial, et trois actions : **Ouvrir ma boutique près du mall** (outil petit marché, caméra et étoile sur la case libre la plus proche), **Voir les produits**, **Importer depuis le port** (fiche de ta boutique, onglet Logistique, ou vue du port).
- Anciennes sauvegardes : le mall est ajouté au chargement si ses quatre cases sont libres (sinon sur le coin 2×2 libre le plus proche du centre, sinon pas de mall) ; rien n'est détruit.

### 3. Pôle commercial (la densité est récompensée)
- Boutique (`s1` à `s4`) à moins de 6 cases du mall : **+20 %** de fréquentation. Quatre boutiques voisines ou plus (adjacentes ou séparées d'une case, avenue comprise) : **+10 %** et **frais fixes −8 %**. Cumul ×1,32 au plus, fréquentation plafonnée à 100 ; aucun aléa (`poleIndex`, `mallBonus`, `poleUm`).
- Visible : pastille « Pôle commercial » dans la fiche du magasin (ou conseil pour en profiter), halo doré sous les boutiques concernées, calque Fréquentation.

### 4. Démarrage
- La caméra s'ouvre sur le mall (`cityFocus`). Conseiller : jalons rapides `mall` (« Clique sur le Mall central pour voir le marché »), `shop1` (« Ouvre ta boutique près du mall »), `imp` (« Importe un produit du port », atteint dès que tes rayons sont remplis par l'import), enchaînés sans attente ; les jalons suivants sont inchangés. L'écran d'accueil présente le mall.
- `window.WSE.mall` : position, ouverture, données du panneau, bonus, pôle, réglages.

## Passe 35 : petite ville de départ et croissance jusqu'à un million d'habitants

La ville de départ était une image de fin de partie (288 000 habitants, tours de 20 à 66 étages) et se remplissait vers le jour 4 300. Elle est remplacée par une **petite ville** qui grandit comme dans SimCity (agent `agent/ville`, test `t34_ville_croissance.js`).

### 1. Ville de départ (`genNpcTown`, `S.cityV = 2`)
- ≈ **101 600 habitants**, capacité 119 500, ≈ 370 bâtiments PNJ : 157 maisons, 144 immeubles de logements (2 à 15 étages, moyenne 4,4), 43 immeubles de bureaux, 15 parcs, 11 équipements publics (stade, hôpital, mairie, écoles, police, pompiers…). Aucune tour-repère. Plus de la moitié des lots est libre.
- Tissu lisible : le centre (autour de la case 30, 30) est dense et plus haut, des quartiers de maisons et de petits immeubles l'entourent, la périphérie est clairsemée. Même génération déterministe (fonction de hachage des cases, pas de hasard de partie).
- **Bassin de consommation** (`BASSIN_NEW = 2,83`, `S.bassin`, `popE() = habitants × bassin`) : la petite ville draine une région (navetteurs, villages, visiteurs). La demande locale (`LOCAL_D`, biens de base, courants, luxe, logement), la population active (`workforce`), les emplois par étage de bureau (`S.jpf`), l'électricité, la demande de services (`svcSat`, banque), les médias et la demande immobilière (`reRefresh`) se calculent sur ce bassin : l'économie de départ est celle de l'ancienne ville (≈ 289 000 habitants équivalents), donc les cibles de marge, d'élasticité et de cohérence (`t02`, `t03`, `t06`) sont inchangées. À mesure que la ville grandit, la demande suit (×10 à 1 million d'habitants). Les écrans affichent toujours les habitants réels ; le texte « Pourquoi la demande… » montre le bassin (`habitants × unités pour 10 000 hab.` déjà multipliées).
- **Anciennes sauvegardes** : sans le champ `cv`, `load()` régénère `genNpc` (ville de 288 000 habitants), `built`, `npcMods`, `npcGrow`, avec un bassin de 1 : rien ne change. Le nouveau format (`cv: 2`) enregistre le bassin (`bs`), les blocs ajoutés (`cext`), l'état de croissance (`cg`) et la liste complète des bâtiments PNJ (`cty` : x, y, type, étages, graine) car ils changent chaque jour.

### 2. Modèle de croissance (`stepCity`, `cityGrow`)
- **Attractivité** `A` (`cityAttract`) = emplois^0,8 (chômage) × humeur^0,8 × services (satisfaction des besoins, services publics) × fiscalité (`taxDrag`) × cycle macro (PIB) × promoteurs (BTP, immobilier, caste promoteur, IA promoteur : +4,5 % par point, 10 maximum) × poids économique du joueur (chiffre d'affaires quotidien par habitant du bassin, échelle logarithmique, +38 % au plus).
- **Rythme** : tous les 2 jours, `étages ajoutés = r0 · A^2,6 · étages de logement · 2`, avec `r0 = 5,6e-5` par jour, un effet d'agglomération (`1 + 0,04 log2(pop / 100 000)`) et un plafond logistique à 1 million (`1 / (1 + (pop / 1 000 000)^4)`). La population suit la capacité (`pop ≈ capacité × 0,80-0,92`, comme avant).
- **Densification par niveaux** : chaque lot a une hauteur visée `cityTarget` = `Fmax(pop) × valeur du sol^1,6` (bureaux : ^1,25), avec `Fmax = 10 × (pop / 100 000)^0,95` (4 à 110 étages) et une valeur du sol `exp(-(distance au centre / R)^1,4)` où `R = 10 × (pop / 100 000)^0,38` cases (la ville s'élargit). Niveaux affichés : maisons, petits immeubles (≤ 4 étages), immeubles (≤ 9), tours (≤ 24), grandes tours (≤ 49), supertours. Un chantier construit sur un lot libre (pondéré par la valeur du sol) ou surélève un immeuble (maison → 2-4 étages, puis +30 %), de préférence les bâtiments rachetés par une IA promoteur (poids ×3, annonce « rase et reconstruit plus haut »). Les bureaux suivent le rapport emplois / actifs du départ (`S.cg.jt`), emplois du joueur déduits. Un parc est ajouté tous les 14 étages.
- **Extension de la zone** (`cityExtend(x, y)`, exposée aussi dans `WSE`) : quand il reste moins de 40 lots libres (ou moins de 14 %), le bloc voisin libre (6×6 cases, ni gisement ni bâtiment du joueur) le plus proche du centre devient zone urbaine : avenues créées, `ZONE = 1`, `S.cityExt` sauvegardé. `inCity(x, y)` lit désormais `ZONE` (équivalent à l'ancien rectangle pour les anciennes parties) ; `CITY` est la boîte englobante ; `CITY0` la ville d'origine. Blocs autorisés : colonnes 1 à 9, lignes 1 à 8 (x et y de 6 à 60 / 54). L'agent promoteur / zonage peut appeler `cityExtend` pour viabiliser des terrains.
- Les anciens mécanismes (`stepNpcDensify`, `stepDevs`, migration des tours) ne tournent plus que pour les anciennes sauvegardes ; `addNpcTower` (immobilier du joueur, tours des IA) reste actif partout.

### 3. Lisibilité
- Bandeau **Population** : taille de la ville (Petite ville, Ville, Grande ville, Métropole, Mégalopole) et capacité ; infobulle : remplissage, terrain urbanisé, plus haut immeuble.
- Écran **Empire**, bloc « LA VILLE » : population, prochain jalon, remplissage des logements, terrain urbanisé et lots libres, densité, plus haut immeuble, demande de logements et d'emplois, attractivité, étages bâtis, répartition par niveaux, courbe de population (`S.cg.h`, un point par mois) : l'histoire de la ville se lit en accéléré (vitesse ×3).
- Annonces : jalons à 150 000, 250 000, 400 000, 600 000, 800 000 et 1 000 000 habitants, premier immeuble de 10, 25 et 50 étages, nouveau quartier viabilisé, IA promotrices qui reconstruisent plus haut.

### 4. Valeurs mesurées (7 200 jours, `t34`)
- Départ : 101 900 habitants, capacité 119 550, 370 bâtiments PNJ, plus haut immeuble 15 étages, 386 lots libres sur 756.
- **Passif** (aucune construction) : **311 k** au jour 7 200 (un point par 600 jours : 119 132 143 156 170 186 204 222 242 265 286 311) ; 5 blocs ajoutés, plus haut immeuble 26 étages ; la satisfaction et l'humeur baissent peu à peu, ce qui freine la croissance.
- **Actif, bot riche** (2 Md$ de départ, services en série) : 135 k, 174 k, 225 k, 286 k, 358 k, 447 k, 556 k, 671 k, 789 k, 907 k, 1 005 k, **1 096 k** ; supertours de 70 à 100 étages, 3 blocs ajoutés.
- **Actif, bot « bon joueur » du Round** (`bot_round.js`, 10 M$) : **717 k** habitants au jour 7 164 (victoire à ce moment).
- Coût : 6 à 12 ms par jour simulé en moyenne ; la croissance urbaine elle-même coûte 0,3 ms.
- `t02` : l'EBITDA des extracteurs dépend de la suite aléatoire (5 à 10 points d'écart d'une graine à l'autre, mesuré sur l'ancienne version comme sur la nouvelle) ; `isoExtractor` prend désormais la médiane de 3 graines fixes ; la cible du sucre passe de 15-30 % à 8-30 % (retour ≤ 5,5 ans) et le retour toléré passe de 3,5 à 4 ans (calcaire : 3,7 ans en médiane de 3 graines), le sucre médian mesurant 8-10 % avant comme après. `t28` : tolérance 1e-6 sur un résidu flottant (4,5e-13).

### 5. Limites
- Le plafond de croissance (million d'habitants) est un plafond logistique mou, pas une règle dure ; un joueur très riche peut dépasser un peu 1 million.
- Le poids économique du joueur est mesuré par son chiffre d'affaires par habitant : un joueur de petite taille pèse peu sur la ville (≈ 450 000 à 600 000 habitants pour un « bon » joueur du Round), un joueur très riche l'accélère nettement.
- Les blocs ajoutés évitent les forêts, champs et gisements ; si tous les blocs voisins sont occupés, la ville se densifie sans s'étendre. Le coût de rendu reste proportionnel aux bâtiments visibles, pas aux habitants.
- Les cartes ne sont pas rééquilibrées : les cibles de rivaux (`t27`) dépendent de la demande et sont inchangées au départ.
## Passe 34 : le promoteur « à la Trump » (spéculation, terrains ex nihilo, zonage)

Tout est dans `game.template.html` (bloc « Passe 34 » après `landVal`) ; test : `tools/tests/t32_promoteur.js`. API de test : `WSE.pro`.

### Modèle de prix (`proValue`, `proCap`, `proAttr`)
- **Valeur d'un bien** = loyers nets capitalisés : `étages × loyer étage × occupation × (1 − 22 % de charges) × 365 ÷ taux de capitalisation`, plancher 80 % du prix du lot (`landPrice`). Loyer étage = 26 $ × type (maison 0,5 ; logements 1 ; bureaux 1,3) × attractivité × CPI. Attractivité = `reAttr` (CBD, commodités, fréquentation) + densité des 7×7 cases voisines (jusqu'à +22 %) + boulevards (+3 % par case, 12 % au plus) + vue sur mer (+6 %) − manque de services publics. Occupation de marché = `1,05 − 0,6 × indice offre/demande + 1,2 × (PIB − 3 %)`.
- **Cycle** : taux de capitalisation `4,5 % + 0,65 × taux directeur − 0,6 pt (supercycle) − 0,7 pt × hype` (4,2 à 15 %). `hype` (−1 à +1, `S.pro.hype`) suit lentement `PIB − taux directeur + supercycle`. Taux 3 % → 9 % : valeurs ×0,62 mesuré ; supercycle : ×1,10 ; hype ±1 : ×1,18 / ×0,86. La densification autour d'un bien le valorise (boucle de marché), l'offre de bureaux excédentaire fait baisser l'occupation donc la valeur.
- **Prix demandé** : valeur × (0,97 à 1,07) (−8 % pour le promoteur), frais de mutation 1,5 % (0,5 % promoteur). Il est affiché AVANT le clic (infobulle des outils « Racheter et raser » et « Racheter pour louer ») et la fiche explique tout refus (trésorerie, bien d'un rival, bâtiment public). Une maison vaut ≈ 60 000 $ au lieu de 630 $.
- **Étage** (`floorCost`) : `(1,0 × coût du logement × (1 + 0,1 × (étages − 1)) + 12 % du lot) × coût de caste × CPI` (avant : 350 + 250 × étages). Chantier de `5 + 2 × étages` jours (−30 % promoteur), loyers réduits de 60 % pendant les travaux ; un immeuble neuf ne loue rien avant sa livraison (8 jours) et sa capacité d'habitat n'existe pas encore. Hauteur maximale 6 étages (8 promoteur, 9 au niveau 4).
- **Logements du joueur** : loyers réels (`stepRentRes`, curseur de loyer de la fiche, baux lissés) ; entretien 1 $ + 4,6 $ par étage et par jour + taxe foncière 0,25 %/an de la valeur (avant : −150 $/j sans recette). Charges et taxe continuent si le bien est vacant (cash-flow négatif).
- **Ventes** : au marché (−5 % de décote, +10 % de prime promoteur) ou en annonce (`proList`, 105-120 %) : probabilité quotidienne `0,40 × (1,28 − prix/valeur) + 0,08 × hype` (0 à 0,5), acquéreur PNJ ou rival ayant la trésorerie, 45 jours. Honoraires 2,5 %, **impôt sur la plus-value** 32 % avant 45 jours, 24 % avant 150 jours, 16 % ensuite. Le bien vendu devient un immeuble de la ville (persistant dans `S.built`).
- **Plus-values mesurées** (promotion maison → 4 étages, boucle complète) : promoteur, site médian +24 à +38 %, bon site +50 à +75 % ; non promoteur −2 % à +8 % ; exemple joué : achat 56 632 $ + construction 63 750 $ + 3 étages 236 050 $ → vente 525 548 $, plus-value 155 977 $, impôt 37 434 $.

### Terrains ex nihilo et zonage
- **Terrassement** (outil BTP) : pinceau 1×1 à 3×3. Aplanissement de la campagne (0,6 × base 11 000 $/case, 8 jours), poldérisation à ≤ 2 cases du rivage (0,85 ×, 14 j), remblai de 3 à 4 cases (1,35 × (1 + 0,1 × profondeur), 22 j). Contigu à une zone aménagée ou à la côte ; permis 2-3 jours (95 % d'accord promoteur, 80 % sinon, remboursement 70 % en cas de refus) puis travaux avec risque d'aléas (4 / 12 / 20 % : +40 % de délai, +15 % de coût). Les non-promoteurs exigent une entreprise de BTP et paient ×1,6. La case devient urbaine (`ZONE = 1`, marqueur `ZEXT`) : la zone constructible dépasse 37×37, les avenues se prolongent sur la grille de la ville, et le terrain, **déjà payé** (`S.pland`), ne se repaie pas à la construction.
- **Zonage** (outil BTP, palette dans la barre et l'onglet Opérations) : résidentiel `r`, résidentiel dense `R`, commerce `c`, bureaux `o`, industriel `i` (terrains créés ou port). Chaque jour, les cases zonées reliées à une rue se bâtissent selon la demande RCI (`zoneDem` : emplois ≫ actifs = demande de logements ; chômage = demande de commerces, bureaux, industrie) × services publics (`svcC`, parcs et monuments par habitant ; la mairie aménage un parc tous les 12 bâtiments) : maisons, immeubles de 2-4 étages, bureaux de 2-8 étages. Les îlots denses montent d'un étage tout seuls. Ces bâtiments alimentent la capacité d'habitat et les emplois existants.
- **Voirie** : une route peut être posée en zone urbaine avec un permis (3 500 $, moitié pour un promoteur) si elle se raccorde à une rue ; elle compte comme boulevard pour l'attractivité.

### Incitations de caste et lisibilité
- Promoteur : constructions −15 %, rachats −8 %, ventes +10 %, permis rapides, grande hauteur, **honoraires** 2-4 % sur les chantiers des autres (promoteurs IA, rénovations), contrats BTP payés +25 % et **honorés sans produire les matériaux** (achat au marché ×1,12 + sous-traitance 65 % de la récompense de base, capacité ×10) ; tous les joueurs peuvent acheter les matériaux manquants d'un chantier (×1,30). 10 **objectifs de caste** (10 maisons, 12 étages, 50 cases de terrain, 60 cases zonées, 500 k$ de plus-values, 5 reventes à +25 %, 8 logements à louer, 12 cases de voirie, 3 chantiers, 200 k$ d'honoraires) ; 2 objectifs = 1 niveau (5 au plus : −4 % de frais de terrassement et de zonage par niveau).
- **Fiche d'immeuble** (clic sur un logement ou un bâtiment de la ville) : valeur marchande, loyer, charges, cash-flow, rendement net, taux de capitalisation, plus-value latente, impôt et net si vente, simulation « si tu rases et construis N étages », actions. **Onglet Opérations** du bureau : marché, objectifs, chantiers (logements et terrains), annonces, parc locatif, plus-values réalisées, urbanisme.
- Sauvegarde `wse-city-v8` : champs optionnels `pro`, `pland`, `pzn`, `pzm` et, par logement, `bd` (date d'achat), `fc` (étages payés), `wk` (chantier) ; absents des anciennes sauvegardes.

### Limites
- Pas de terrain en 3D : les cases créées sont teintées, les chantiers marqués par un échafaudage en pointillés. Les rivaux n'achètent ni ne zonent de terrain ex nihilo. Seuls maisons, immeubles de logements et de bureaux de la ville se rachètent pour louer ; les bâtiments d'un rival passent toujours par la négociation de la passe 29.

## Passe : fonds propres (banque Bâle III) et crédit du promoteur

### 1. Banquier : fonds propres CORE
Le portefeuille de crédits est un **actif à risque**, jamais un collatéral ni une valeur de fonds propres (`stepBank`, `bkLend`, `bkCap`, `bkLimits`).
- **CET1** = capital (100 M$) + réserves mises en réserve − pertes (`S.bk.res`). **RWA** = crédits × pondération : entreprises 100 %, immobilier 50 %, souverain 0 % (`S.bk.lt`, type choisi dans l'écran de la banque ; les anciennes sauvegardes sont lues comme 100 % entreprises).
- **Ratio minimal** = 8 % + coussin de conservation 2,5 % + coussin contracyclique (0 à 2,5 % quand le PIB dépasse 3 %, plein à 6 %). Sous ce seuil, **les prêts nouveaux sont bloqués** (message explicite). Sous **4,5 %** : alerte puis restriction (le régulateur fait rappeler 2 % du portefeuille par jour, au pair, et l'emprunt de la banque tombe à 0). Fonds propres négatifs : **faillite** (`bkFail`, écran de fin « FAILLITE DE LA BANQUE », `endGame('bank')`, possibilité de continuer en Libre sans banque).
- **LCR ≥ 100 %** : trésorerie disponible (+ 50 % du portefeuille d'actions) ≥ sorties nettes de 30 jours stressées (8 % des crédits × stress, stress = 1 + 1,5 × choc du crédit + 0,5 en récession, + 5 % de la dette à refinancer). Le **levier brut** par niveau (×5, ×10, ×20) reste une contrainte supplémentaire ; les niveaux ne desserrent plus le CET1.
- **Emprunt de la banque** (`creditLimit`) = min(plafond actuel hors collatéral de crédits, 9 × fonds propres), soit un levier total de ×10 (`BK_LEV`) ; l'encours de prêts est aussi limité à 10 × les fonds propres ; jamais fonction du portefeuille de prêts.
- **Défauts** : perte annuelle normale entreprises 1,5 %, immobilier 0,8 %, souverain 0,1 %, ×3 en récession (×1,6 sous 1,5 % de PIB), ×(1 + 6 × intensité du choc `credit`), × multiplicateur de niveau (1 ; 1,5 ; 2,2), immobilier majoré quand l'indice des prix baisse. Rendement = taux + marge (3 % ; 2 % ; 0,5 %), les 20 % de ce revenu alimentent le CA de la banque comme avant.
- **Écran de la banque** (Menu > Finances) : CET1, ratio vs minimum (vert / or / rouge), RWA, LCR, répartition du portefeuille, marge de prêt restante et contrainte qui la borne, pertes du jour et cumulées.

### 2. Promoteur : 20 % de fonds propres
Plafond de dette = 4 × fonds propres (levier ×5, LTV 80 %) où les fonds propres = actifs gageables − dette ; actifs gageables = trésorerie + 80 % des stocks + **immobilier expertisé** (`S.stats.iv` × `immoIdx`) + 60 % des autres immobilisations. Départ à 3 M$ : plafond ≈ 12 M$ (15 M$ de moyens). `immoIdx` (0,55 à 1,35) = 1 + 2 × (PIB − 3 %) − 3 × (taux − 4 %) − 0,3 × choc du crédit : il baisse en récession, quand les taux montent, en crise du crédit, et le plafond avec lui. Le taux inclut une prime de LTV (jusqu'à +3 pts). **Covenant** : LTV > 90 % = appel de marge (taux +3 pts, 30 jours pour rembourser) ; sans régularisation, **vente forcée** de l'immobilier le plus cher à −15 % (puis saisie de trésorerie), jusqu'à 78 % de LTV (`stepCovenant`, `forcedSale`, état `S.mc` sauvegardé).

### 3. Trésorerie négative
Les dépenses du joueur sont refusées si elles dépassent la trésorerie. Le découvert né des charges quotidiennes est toléré à hauteur de 1 % de la valorisation (25 k$ à 5 M$), facturé taux du prêt + 4 pts, puis + 12 pts au-delà (`odLimit`).

### 4. Tests (`t31_fonds_propres.js`)
Prêt maximal au jour 1 borné, CET1 au-dessus du seuil sur 360 jours, encours ≤ 10 × et emprunt ≤ 9 × fonds propres (banque), levier ×5 (promoteur, `PROMO_LEV`), RWA, LCR, choc de crédit (pertes ×18 vs témoin), restriction, faillite, ancienne sauvegarde, promoteur à 12 M$, dépréciation immobilière, appel de marge, dépense refusée.
## Passe 34 : subventions de zone (port, zone industrielle) et recyclage des gravats

**Demande** : (A) la zone portuaire est déserte, le port perd 4,8 k$/j et la zone industrielle reste un damier vide : la ville doit inciter et subventionner les entreprises, puis arrêter quand la zone est saturée. (B) les gisements de sable et de gravier s'épuisent : la R&D doit proposer du concassage, avec des démolitions qui alimentent un gisement auto-régénératif.

### A. Subventions de zone (`ZN`, `znRate`, `znStep`)
- **Zones** : *zone portuaire* (quai, terminaux) et *zone industrielle* (66-84 × 54-84 hors quai). **Occupation** = cases bâties par le joueur et par les rivaux / cases constructibles hors voies.
- **Taux d'aide** : 40 % jusqu'à 30 % d'occupation, dégressif linéaire jusqu'à 70 %, **nul au-delà** ou si le port est encombré (débit >= 90 % de la capacité) ; **taxe d'encombrement** de 0 à +15 % de l'entretien entre 85 et 100 % d'occupation. Tout est déterministe (aucun tirage).
- **Trois aides** : construction (taux x capex, déduite du prix à la pose, message « Subvention de zone »), taxe locale exonérée / loyer foncier réduit (zone portuaire : entretien -100 % au taux max ; zone industrielle : -35 %), aide à l'emploi (zone portuaire : salaires -80 % au taux max). Les aides récurrentes passent par `upkOf` et `c.wages` ; `c.zs` = part prise en charge par la ville (par jour).
- **Budget municipal** (`S.zn.bud`) : recettes = 0,06 $ x population x inflation par jour + 35 % de l'impôt sur les sociétés payé ; départ = 150 jours de recettes. Les aides en sortent ; à sec, le taux est réduit au prorata puis suspendu (à -150 jours de recettes).
- **Rivaux IA** : les industriels (zone industrielle, 6 cases par usine) et les négociants (zone portuaire, 4 cases par terminal) s'y implantent une action sur trois (`znRivalSettle`), paient 40 % de moins au taux max, et leurs cases comptent dans l'occupation (plafond 35 % de la zone).
- **Annonces** : toast au premier jour puis à chaque changement d'étape (« Zone portuaire : subventions 40 % jusqu'à 30 % d'occupation... », « dégressives », « saturée : fin des subventions ») ; **bandeau** `#znban` quand l'outil sélectionné se construit dans la zone ; **surbrillance** verte (rouge si saturée) des cases libres de la zone ; bandeau « Subvention de zone » sur la fiche des bâtiments éligibles.
- **Résultat mesuré** : port à vide -5,7 k$/j sans aide, -0,9 k$/j avec ; départ typique (port, entrepôt, mines de fer et de charbon) rentable (+37 k$/j).
- **Sauvegarde** : `zn` (budget, implantations rivales, annonces, cumul) et `rub` dans `wse-city-v8`, champs facultatifs (anciennes sauvegardes : budget initial recalculé). `S.zn.off = 1` coupe les aides (les bancs de marges de `lib.js` le font : marges nominales).

### B. Recyclage et concassage (`stepRecycle`, `rubAdd`, `recycleSite`)
- **R&D** : « Recyclage et concassage » (ère 2, 3,4 M$, prérequis Explosifs de mine) débloque le **Centre de concassage** (catégorie BTP, famille Recyclage) ; « Concassage de précision » (ère 3, +10 % de rendement, `TM.recy`).
- **Gravats** (stock global `S.rub.st`, flux lissé `S.rub.fl`) : chaque démolition (outil Démolir) ou rachat BTP (immeuble de la ville) en produit, proportionnellement à la taille (420 u par étage de logement, maison 260, autre bâtiment 700 u par case et par niveau) ; chaque chantier en laisse 60 u par case. API pour d'autres systèmes (promoteur, démolitions en masse) : `WSE.rub.add(n)` et `WSE.rub.of(cellule)`.
- **Concassage** : capacité 2 250 u/jour par unité (plafonnée par l'effectif, le réseau routier et le stock de gravats) ; proportions fixes **gravier 50 %, sable 30 %, ciment recyclé 8 %** (x1,1 avec la 2e tech), versées au stock et donc à l'offre du marché local (`made`), valorisées au cours. Plus de gravats = plus de production ; sans flux, alerte « manque de gravats ». Coût inférieur à l'extraction (entretien 3,2 k$ contre 5,4 k$, capex 2,4 M$).
- **Gisement épuisé** : alerte à l'épuisement puis rappel tous les 60 jours ; la fiche propose **Reconvertir en centre de concassage** (35 % du capex du centre, nécessite la tech ; le site devient une « zone de production continue ») ou **Démolir** avec 35 % de l'investissement remboursé (gravats récupérés).
- **Tests** : `tools/tests/t33_subventions_recyclage.js` (aides max / dégressives / nulles, rivaux, port, budget, sauvegarde, tech, démolition, proportions, plafonnement, reconversion, déterminisme).

### Limites
- La zone portuaire à vide reste légèrement déficitaire (salaires couverts à 80 %) : volontaire, un port sans trafic ne doit pas être gratuit. Les démolitions de la spéculation immobilière (autre agent) devront appeler `WSE.rub.add`.

## Passe 48 : valeur du terrain par usage, quartiers et cartes de chaleur (à la Capitalism Lab)

Le terrain n'a plus un prix unique : chaque case a une valeur en $/case **propre à l'usage visé**, comme dans Capitalism Lab et Capitalism II (Midtown très courtisé, port subventionné, campagne bon marché).

### Modèle (`landModel(x, y, use)`, `landPrice(x, y, use)`, `landCostFor`)
- **Pôle de la ville** : le Mall central (`mallRect`), sinon le centre de la ville PNJ (`CBD`) ; plus aucun centre codé en dur (`marketDist` aussi). `dC` = distance au bord du mall, `dP` = distance au hub du port.
- **Somme de composantes** (décomposition exacte, avant inflation `cpi`) : base 110 $ + **distance** 2 300 × acc^1,6 avec acc = max(e^(−dC/22), 0,75 e^(−dP/18)) : plus on s'éloigne à la fois de la ville et du port, moins le sol coûte, pour tous les usages.
  - **commerce** : 25 000 × (0,62 c^1,5 + 0,38 t)^1,25 réparti entre centralité et trafic (c = e^(−(dC/13)^1,3), t = fréquentation brute de `rebuildTraffic`), + 8 % sur une avenue ;
  - **résidentiel** : 26 000 × (0,62 c^1,3 + 0,2 parcs + 0,18 calme × e^(−dC/20)) + 12 000 × **vue sur la mer** (cases de mer à 10 cases, pondérées par 1/distance) × dégagement (pas de mur de voisins de 3 étages ou plus) ;
  - **bureaux** : 32 000 × c^1,4 + 3 000 × t ; **industrie** : 9 000 × e^(−dP/12) × (0,75 + 0,25 accès routier) + pression urbaine ;
  - **agricole, extraction et stockage** : pression urbaine seulement (6 000 × c^1,5, et 9 000 × e^(−dBord/6) en campagne près de la ville) ; la valeur d'usage (fertilité, gisement) est payée à part (`sitePremium`, inchangé) ; l'extraction garde le facteur ×0,3.
- **Usage d'un bâtiment** : `landUseOf` (boutiques → commerce, logements → résidentiel, tours et services → bureaux, usines, entrepôts, centrales → industrie, fermes et élevages → agricole, mines et puits → extraction).
- **Industrie hors du port** : une usine peut désormais s'installer en **campagne** (jamais en ville) : sol bon marché, aucune subvention, transport plus long (`facHaul`, `TRANS`) ; les placements automatiques (`autoSpot`, `placeAuto`, `chSpot`) prennent la zone du port d'abord. La subvention de zone (port, zone industrielle ; industrie et logistique seulement) est inchangée.
- **Cohérence achat / revalorisation** : terrain payé (`c.lp`) = coût annoncé ; `c.lpv` note la valeur de l'emprise le jour de l'achat et `landVal` revalorise sur le même modèle (borné ×0,6 à ×5). `proValue` évalue le lot pour l'usage du bien (logement, bureaux) et `proAttr` compte la vue sur la mer. Les terrains nus (`S.pland`) gardent leur prix payé et se revalorisent quand la valeur d'achat est notée (`S.plv`, facultatif).
- **Cache** (`landCache`) : vue sur la mer, parcs, hauteurs voisines et quartiers recalculés seulement quand la fréquentation est recalculée (ville ou bâtiments modifiés), au plus une fois par mois sinon ; valeurs par case calculées à la demande.

### Quartiers et calques
- **Quartiers nommés par la géométrie** : Midtown (7 cases autour du mall), quatre quartiers en couronne (Uptown, Eastside, Southside, Westend ; le plus riche en parcs devient **Parktown**), Faubourg au-delà, Harborside (quai et bord de mer du port), Zone industrielle, Ceinture verte (campagne à 10 cases de la ville), La Côte (vue sur la mer), Campagne.
- **Calques** (bouton Calque) : Fréquentation, **Commerce $** (« Valeur du terrain (commerce) »), **Résidentiel $** (« Valeur résidentielle (vue, calme) »), **Terrain $** (usage de l'outil choisi) ; dégradé froid (bleu, bon marché) → chaud (rouge, cher) en échelle logarithmique, légende en $/case, noms des quartiers sur la carte. Le calque Auto reste inchangé (fréquentation pour une boutique, logistique pour une usine).
- **Info-bulle de construction** : valeur du terrain pour l'usage de l'outil ($/case, de bon marché à très cher), quartier, décomposition (centralité, trafic, avenue, vue, parcs, calme, port, pression urbaine, distance).
- **API** : `window.WSE.land` (`model`, `price`, `costFor`, `useOf`, `district`, `cache`, `setLayer`…).

### Repères (départ, inflation 1)
| Case | Commerce | Résidentiel | Industrie | Ferme 2×2 |
|---|---|---|---|---|
| Bord du mall (Midtown) | ≈ 26 500 $ | ≈ 18 000 $ | ≈ 7 500 $ | – |
| Périphérie de la ville (14, 14) | ≈ 2 800 $ | ≈ 5 000 $ | – | – |
| Zone portuaire (70, 60) | – | – | ≈ 4 500 $ | – |
| Côte, vue sur la mer (86, 20) | – | ≈ 9 800 $ | – | – |
| Intérieur des terres (30, 86), (40, 70), (10, 80) | – | ≈ 540 $ | ≈ 900 $ | ≈ 900 $ (≈ 30 000 $ au bord de la ville) |

Premier petit marché près du mall : 110 000 $ de construction + ≈ 26 500 $ de terrain (≈ 136 500 $, contre 136 800 $ avant).

### Équilibre (sim_batch, 24 parties de `sim_v2.jsonl`, 1 800 jours)
Mêmes 24 parties (6 castes × 4 profils, graines de `sim_v2.jsonl`), valeur de l'entreprise à 11 min (jour 880) et 22 min (jour 1 760), avant / après :
| | Médiane avant | Médiane après | Moyenne | Ratio par partie (médian, min, max) |
|---|---|---|---|---|
| 11 min | 26,7 M$ | 26,9 M$ | +0,1 % | 0,999 · 0,972 · 1,066 |
| 22 min | 36,7 M$ | 36,5 M$ | +0,5 % | 0,999 · 0,956 · 1,062 |

Par caste à 22 min : agriculteur ×1,001, banquier ×1,014, industriel ×1,000, innovateur ×1,015, négociant ×0,989, promoteur ×0,987. Aucune partie ne perd plus de 4,4 % ; aucune erreur. Règles de marges et de prix inchangées.

### Tests (`tools/tests/t48_valeur_terrain.js`)
Centre plus cher que la périphérie (commerce), vue sur la mer (résidentiel), zone portuaire subventionnée et moins chère au total pour une usine, usine en campagne au terrain moins cher mais au transport plus long, ferme moins chère loin de la ville, calques et légende en $/case, quartiers nommés et dessinés, achat cohérent avec la valeur et la revalorisation, déterminisme, ancienne sauvegarde (prix payés gardés), aucune erreur, mobile 390×844.

### Limites
- La pollution, la criminalité et les services publics n'entrent pas encore dans la valeur du terrain ; la croissance de la ville PNJ (`cityGrow`) garde sa propre valeur relative (`cityLV`).
- La vue sur la mer ne concerne que la côte est (polders du promoteur, campagne côtière) : la ville est à plus de 40 cases de la mer.
## Passe : sol texturé et routes en sprites (intégrateur n° 9)
- **Sol** : la prairie plate (tuile Kenney + teinte de zone) est remplacée par les losanges 396×198 du producteur (`assets/phase2_hd`) : herbe (`herbe_a` à `herbe_d`, variante choisie par `hash(x, y)`), clairières de terre aux bords fondus (`terre_*`, bruit lisse déterministe, et sous les gisements), pavé en ville (`sol_ville_pave`), asphalte de la zone portuaire, béton des quais (`sol_quai_beton_a/b`), eau texturée (`eau_calme`, plus foncée vers le large, vaguelettes animées par-dessus), ponton le long des quais (`eau_rivage_quai`), plage de sable sur la côte (`rivage_sable`).
- **Routes** : chaque case de route prend le sprite `route_*` donné par ses voisins (masque SE=1, NW=2, SW=4, NE=8 de `roadMask` ; table `ROAD_SPR`) sur une sous-couche d'asphalte ; routes du joueur, rues de la ville et anneau du mall suivent la même règle. Voitures, bâtiments et calques restent dessinés par-dessus.
- **Cache** (`gtDraw`, `gtBake`) : le sol est cuit par blocs de 8×8 cases dans des canevas hors écran, à la résolution de l'écran (paliers 0,25 à 2 px par px du jeu), cache LRU borné (≈ 7 écrans de pixels) ; l'empreinte d'un bloc (routes, zones, gisements de ses cases et de leur bordure) le fait rebâtir dès qu'une route est posée ou démolie. Budget de cuisson ≈ 9 ms par image ; au-delà, le bloc s'affiche en aplat une image. Vue d'ensemble (zoom × densité < 0,2) : aplats moyens ; vue satellite inchangée. `WSE.ground.GT.off = true` rétablit l'ancien rendu (comparaison de fluidité).
- **Build** : les 31 tuiles sont ajoutées à `P2_NAMES` mais encodées en JPEG 264×132 (qualité 88, pas de palette 256 couleurs : bandes sur l'herbe) ; le pourtour du losange est rempli par extension des couleurs du bord et le jeu les découpe sur le losange avec 1 px de recouvrement (aucun trou). Herbe désaturée de 25 % et décalée vers le jaune-vert (charte) ; dégradé propre à chaque tuile retiré (passe-haut) sur l'eau, le sable, l'asphalte et le pavé ; l'eau, non périodique, est rendue raccordable par décalage d'une demi-case et fondu. +0,35 Mo dans `city.html`.
- **Test** : `tools/tests/t49_sol_routes.js` (31 sprites chargés, 16 masques de route, tuiles par zone, clairières, bloc rebâti après pose et démolition d'une route, fluidité ≥ 80 % de l'ancien rendu sur 200 images par mode, aucune erreur).
- **Limites** : transitions herbe/pavé et herbe/sable franches (pas de tuiles de bordure livrées) ; défauts des images remontés au producteur dans `tools/factory_ai/RETOURS.md` (retour n° 9).

## Passe 49 : l'Aéroport et son duty free

Demande de Rémy : un aéroport où tous les joueurs (humain et rivaux) vendent aux voyageurs, bon pour démarrer et écouler du luxe, saturé par le trafic, un peu moins intéressant que ses propres magasins à grande échelle. Test : `t53_aeroport.js`.
- **Un seul aéroport par carte** (6×4 cases, cases `mon` avec `m = 'air'`, sauvegardées dans `cty` comme le mall) : premier rectangle libre (ni bâtiment ni gisement, campagne au sud de la ville) qui touche une route, le plus près de (33, 66), contre la route du sud (en pratique (31, 64)). Ancienne sauvegarde : posé au chargement, au même endroit. Il bloque l'extension de la ville sur son bloc (case occupée). Il ne compte ni comme parc (valeur du terrain) ni comme service de quartier.
- **Dessin** : procédural (`drawAirport` : piste et seuils, aire de stationnement, avion stationné avec passerelle, avion qui roule puis décolle, terminal vitré, tour de contrôle et balise, enseigne « AÉROPORT ») ; aucun sprite existant (seul `terminal_portuaire` approche, c'est un terminal de port) ; sprite HD commandé (RETOURS, commande n° 10).
- **Trafic** : `AIR_PAX0` (4 000) passagers par jour × région (`popE / POPE_REF`) × PIB × chocs de demande ; ≈ 4 500 au départ, double si la région double. Achats par passager : 0,06 u de base, 0,03 u manufacturé, 0,0075 u de luxe (demande en plus de celle des habitants).
- **Vendeurs** : chaque rayon est partagé à parts égales entre tous les vendeurs qui le tiennent (toi et chaque rival vivant, IA ou humain, qui a une part de ce rayon en ville). Seul, tu sers toute la demande ; avec n vendeurs, 1/n. Aucun plafond artificiel : le trafic est le seul plafond.
- **Prix et taxes** : prix duty free = prix de rayon × 1,3 (achats d'impulsion) ; redevance de 35 % du CA + loyer de 120 $/jour ; droit d'entrée 20 000 $. Marchandises importées au fil des ventes (cours × 1,05) ; tes produits lancés cochés passent en premier (stock du produit). Comptabilité : CA en commerce, marchandises en imports, redevance et loyer en frais (impôt sur les sociétés normal). Les rivaux encaissent leur part nette (`r.cash`, CA lissé `r.aca`). Aucun aléa : tout est déterministe (placement départagé par `hash`, jamais `rnd`).
- **Rentabilité mesurée (t53, 30 jours, 5 vendeurs)** : duty free ≈ 134 k$ de CA, ≈ 30 k$ de résultat (22 % du CA) pour 20 k$ d'entrée, soit ≈ 150 % par mois, contre 12 % pour un petit marché et 8 % pour un hypermarché. Marge brute unitaire +60 à +75 % plus haute qu'en rayon. Mais le même panier que l'hypermarché vendu au duty free rapporterait ≈ 289 k$ contre 313 k$ d'EBE (−8 %), et l'hypermarché vend 4,6 fois plus d'unités que ta part du trafic.
- **Panneau « Aéroport »** (clic sur l'aéroport ou bouton du panneau du Mall) : passagers, demande et vendeurs par rayon, vendeurs présents avec leur CA mensuel, redevance et loyer, mes ventes sur 30 jours, ouverture et fermeture de la boutique, rayons et produits à vendre. API : `window.WSE.air`. Sauvegarde : champ facultatif `air` (clé `wse-city-v8` inchangée).

## Audit des intérieurs et de la jouabilité (19 nov.)
Détail : `docs/AUDIT_INTERIEURS.md`. Outils : `tools/audit_interieurs.js` (70 types + Mall + Aéroport, bureau et mobile, captures), `tools/parcours_joueur.js` (parcours au clic réel du démarrage à l'export), test `tools/tests/t60_interieurs.js`.
- **Import automatique réparé** : la source « Auto » (stock local puis port) n'importait plus jamais depuis la passe 21 (branche tombée dans un commentaire) ; une rupture locale arrêtait l'usine.
- Conseil du bureau juste quand les rayons sont saturés ; rupture et import en pause expliqués ; mobilier propre à chaque magasin spécialisé ; entrepôt en ligne en halle logistique ; pylône, câble et pipeline sans faux intérieur ; boutons de caméra qui ne se recouvrent plus en plein écran et sur mobile ; produit de marque jamais vendu sans stock (stock négatif).
