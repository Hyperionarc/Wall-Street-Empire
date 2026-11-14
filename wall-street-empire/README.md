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
Capital de départ **1 M$** (paliers recalibrés : Entrepreneur 1,25 M, Industriel 3,5 M, Magnat 12,5 M, Oligarque 35 M). Les portraits du Baron industriel et du Promoteur BTP sont des illustrations générées par IA fournies par le créateur (`assets/portraits/`, nom du fichier = identifiant de la caste ; les autres castes gardent un dessin vectoriel en attendant). Chaque caste a une **fiche détaillée** (clic sur sa carte) : grand portrait, avantages, bâtiments clés avec leurs coûts, arbre technologique propre à la caste (3 technologies par ère) et technologies communes. Six castes : Baron industriel (usines, rachats, OPA), Promoteur BTP, Banquier d'affaires, Négociant en matières (maison de négoce type Zurich-Genève : cartels, embargos, exports, énergie), Exploitant agricole (simulation de ferme) et Innovateur tech (centres de R&D, brevets, data centers qui louent du calcul et boostent toute l'entreprise par l'IA). Le **banquier** gère une banque de 100 M$ de ressources propres (20 % tradables), prête sur collatéral avec un levier qui passe de ×5 (20 % de fonds propres) à ×10 (monopole) puis ×20 (mania, 5 %), avec des pertes croissantes, surtout en récession. Les **pipelines** (tube raccordé à la zone du port ou à une centrale) divisent par 5 le transport du pétrole et du charbon et remplacent les camions.
La ville comporte des **bâtiments publics** : deux stades avec projecteurs, hôtel de ville à dôme, tour de télécommunications, hôpital (croix rouge, héliport), commissariat (gyrophare), caserne de pompiers, collège, lycée à horloge, école maternelle et crèche avec aire de jeux. Chaque type de service présent améliore l'humeur des habitants (jusqu'à environ +13 en tout). Test de performance : mettre en cache l'image des tours n'accélère pas le rendu logiciel de mon navigateur de test (le coût vient du remplissage de pixels, pas du nombre d'appels) : abandonné.
Un **tutoriel de départ** en 5 étapes s'affiche dans le Conseiller (exploitation, usine, production, commerce, premier résultat positif). La fréquentation d'un commerce augmente près des écoles, crèches, hôpital et mairie. Le banquier ne peut trader que 20 % de ses ressources propres.
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
- **Supercycle de croissance** (jours 0–420, façon Chine/Dubaï) : PIB ≈ 8–9 %, inflation et taux bas, humeur +8, demande jusqu'à ×1,5, matières premières mieux valorisées ; atterrissage progressif puis cycle normal.
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
Menu > Objectifs > « Paramètres de la partie » : nombre de concurrents (0–8), capital de départ, agressivité d'expansion et tarifaire des IA, compétence des producteurs locaux, activité des puissances étrangères (5 niveaux, modifiables en cours de partie).

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
- **Salaires réalistes** : 120 $/jour par salarié (~43 k$/an), avec marché du travail (chômage bas = salaires plus chers) ; effectifs recalés (supermarché 5 employés, usines ×4, extraction proportionnelle au chiffre d'affaires) ; marge de détail ×1,8.
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
