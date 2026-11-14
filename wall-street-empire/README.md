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
Chaque magasin choisit ses **marchandises vendues** (génériques et produits lancés). Quand le stock du joueur est vide, le **port importe** les biens de base au prix du marché +4 % (surcote réduite de 1 point par terminal portuaire, jusqu'à 0), ce qui permet de démarrer par le commerce ; la rupture de stock est signalée comme goulot. Trois **concurrents IA** (Mega Mart, Luxor & Fils, DiscountCo) investissent selon leurs ventes, peuvent faire faillite ou être rachetés ; leurs parts de marché apparaissent dans le panneau Ville.
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
| Usines | Petite (1×1), Moyenne (2×1), Grande (2×2), **Méga-usine** (3×3, palier Magnat : recettes de la grande usine, capacité ×8, tour étagée et trois cheminées), toutes dans la zone du port. Chacune fabrique un composant ou un produit affecté, sinon une marchandise générique |
| Commerces | Petit marché (1×1), Supermarché (2×1), Hypermarché (2×2), **Méga-centre commercial** (3×3, palier Magnat : base + manufacturé + luxe, capacité ×4), en ville : chacun ne vend que ses catégories |
| Niveaux | « Améliorer » : 5 niveaux L1 à L5 (capacité et effectifs ×1 / 1,6 / 2,4 / 3,2 / 4, coût 0,7 à 1,5 × le capex) ; le bâtiment grandit (étages d'usine, tours +2 étages par niveau). Les tours de bureaux PNJ gagnent des étages quand la ville prospère. |
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
- Ventes de magasin : élasticité-prix réelle et indice client sur le volume ; capacité répartie **par classe** (s2 62 % base / 38 % manufacturé ; s3 45/35/20) ; tes produits passent avant les marchandises génériques ; import du détaillant ×1,25 ; marge de détail ×2,2.
- Capital de départ 600 k$ ; rivaux à l'échelle (cash ×30) avec réapparition tous les 45 jours ; courbe de difficulté repartie de 600 k$ (×e^(0,0016 j)) ; prix plancher/plafond ×0,7 / ×1,9 ; services moins généreux (banque 260 $/emp., hors fonds empruntés) ; or ÷3 ; usines à leurs effectifs de base.
- Bot « retail pur + réinvestissement » (pf 1,15) : fortune ≈ 1,1 M$ à 1 an, 1,7 M$ à 2 ans, 5,7 M$ à 5 ans (CA ≈ 15 M$/an).

## Passe 4 : chaînes industrielles, pharma, migration
- **Calibrage automatique de la valeur ajoutée** (`applyScale`) : chaque usine-jour crée ≈ 2× ses salaires (composants, marchandises, produits finis). Chaîne pétrole → chimie → principes actifs → pilules → supermarchés testée : chaque maillon est rentable (pilules ≈ +5,8 k$/j ≈ 2 M$/an avec une seule usine).
- **Rayons** : tes produits sont servis avant les marchandises génériques (les pilules se vendent désormais en magasin).
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
- **Marque, qualité et publicité par produit** : ce sont les produits qui ont une marque, pas le magasin. Chaque produit fini a sa notoriété, sa fidélité et sa perception de qualité (`S.prod[pk].brand/loy/rt`) et son budget publicitaire par canal (télé, radio, presse, internet, influenceurs, boutons − / +, dans la fiche produit du magasin et dans Menu > Produits). La notoriété monte avec la puissance publicitaire, la perception vient de la gamme, de la presse et des influenceurs (risque de bad buzz), la fidélité de la qualité, du prix et de la disponibilité. Les marchandises génériques n'ont pas de marque. La note globale d'un produit n'utilise que sa propre marque ; le magasin garde sa notoriété (onglet Publicité) pour l'affluence seulement. Le prix affiché en fiche est le prix en rayon (gros × marge de distribution × curseur) et la marge unitaire est calculée contre le coût réel d'approvisionnement.
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
- Usines génériques : plancher de prix = coût réel des intrants + 8 %, ventes en magasin et exports comptés dans la demande, EBITDA cible relevé pour f1/f2 (≈ 13 %) ; la grande usine (f3) utilise peu de lingots et beaucoup de main-d'œuvre (marge brute ≈ 56 %), mines d'or plus productives.
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
Sauvegarde v8 rétro-compatible (champs `rw`, `exp`, `ps.tc`, `ps.obs` avec valeurs par défaut). Marges s1-s4 inchangées sur le banc générique.

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
