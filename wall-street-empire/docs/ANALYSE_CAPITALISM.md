# Wall Street Empire face à Capitalism Lab : analyse de conception

*Regard de concepteur de jeux de gestion (posture « Trevor Chan », auteur de Capitalism / Capitalism Lab). Document d'analyse : aucun code n'a été modifié. Les références `l.NNNN` renvoient à `wall-street-empire/game.template.html` tel que lu le 17/11/2026.*

---

## 0. En une phrase

La vue d'usine est **plus belle que celle de Capitalism**, mais l'économie qu'elle montre est **plus pauvre et en partie décorative**. Le plan à 12 emplacements ne fixe qu'un plafond de débit. La sortie de l'usine part dans un stock commun à tout l'empire. Aucune usine n'a de clients ni de carnet de commandes. Plusieurs cartes de KPI affichent des chiffres qui ne sortent pas de la simulation. Le chantier prioritaire n'est donc pas d'ajouter des machines : il faut **que ce que l'on voit soit vrai, et qu'une usine ait une demande à servir**.

---

## 1. Rétro-ingénierie : d'où viennent le plaisir et la profondeur de Capitalism Lab

### 1.1 La grille d'unités (le cœur)

Dans Capitalism (1995), Capitalism II puis Capitalism Lab, chaque entreprise (usine, magasin, ferme, mine, entrepôt) est une **grille de 3×3 unités**. Le joueur pose des unités et **trace des liens** entre elles. Dans une usine, les types sont : **Achat** (purchasing), **Fabrication** (manufacturing), **Vente** (sales), **Stock** (inventory), plus Publicité, Formation et R&D selon le type d'entreprise. Un magasin compte Achat, Vente et Publicité. L'entrepôt de Capitalism Lab compte Entrée, Stockage et Sortie, avec chaque unité à **3 fois la capacité et le débit** de son équivalent d'usine, plus une unité optionnelle « marque de distributeur » ([capitalismlab.com, Warehouse](https://www.capitalismlab.com/new-content/warehouse/)).

Ce système est profond pour cinq raisons :

1. **Chaque unité a sa capacité, son niveau (1 à 9) et sa formation.** Le niveau monte avec la formation et l'expérience, et augmente le débit et la productivité ([tutoriel Capitalism 1995](https://discmaster.textfiles.com/view/22564/GAMBLERCD27B.BIN/TUTORIAL/T_FACT.TUT) ; [guide débutant Capitalism Lab](https://www.capitalismlab.com/beginners-guide-gameplay-basics/)). Le joueur n'a pas seulement « plus d'unités » : il a « de meilleures unités ».
2. **Les liens sont des choix.** Une unité de fabrication reçoit 1 à 4 achats. Une unité d'achat peut servir deux machines. Deux machines peuvent fabriquer **deux produits différents** dans la même usine. La topologie est une décision : sur une grille de 9, chaque case coûte une autre case.
3. **Chaque unité affiche ses barres d'offre et de demande.** Le manuel le dit : si la barre d'offre (jaune) dépasse nettement la barre de demande (orange), l'usine ou ses fournisseurs sont surdimensionnés, ou les magasins n'écoulent pas. Si les ventes ne suivent pas, il faut plus de magasins ou une unité de vente mieux formée. Le diagnostic se lit **par unité**, et c'est cette lecture locale qui fait le jeu.
4. **Le stock est physique et local.** « Les usines continuent de produire et les achats continuent d'acheter tant qu'il reste de la place en stock. » La demande lue n'apparaît donc vraiment qu'une fois le stock plein ([guide débutant](https://www.capitalismlab.com/beginners-guide-gameplay-basics/)). Chaque entreprise a ses propres réserves : le stock **tamponne**, et l'écart offre/demande apparaît **avec retard**. C'est le « lag » qui oblige à anticiper.
5. **La vente est une relation client.** L'unité de vente d'une usine vend à des magasins ou à d'autres usines (les tiennes, celles des concurrents ou des grossistes). Chaque client choisit son fournisseur sur un **classement** : prix, qualité, marque et distance. Si l'usine perd ce classement, elle perd ses clients.

### 1.2 Les autres ressorts

| Ressort | Comment Capitalism le fait | Pourquoi ça marche |
|---|---|---|
| **Note produit** | Prix, qualité et marque, avec des poids par produit (cigarettes : marque 60 %, qualité 15 %, prix 25 % ; viande surgelée : 20/40/40) ; la qualité dépend de la technologie, des intrants et du niveau des unités | Plusieurs façons de gagner un même marché |
| **Offre et demande par ville et par produit** | Demande totale par produit, partagée entre les offreurs selon leur note ; importations et concurrents locaux | Chaque produit a sa propre « histoire » |
| **Chaîne d'approvisionnement** | Ferme ou mine, puis usine de composants, usine d'assemblage, magasin ; chaque maillon est une entreprise avec son stock | Les ruptures se propagent visiblement : on « remonte » la chaîne |
| **Filiales et prix de cession** | Les filiales vendent à la maison mère ; le prix interne déplace la marge et l'impôt | Une profondeur financière sans nouvel écran de production |
| **Directeur des opérations (COO)** | Automatise la gestion de l'existant | Le joueur garde les décisions stratégiques ; la micro-gestion est optionnelle |
| **Entrepôt** | Tampon et spéculation, par exemple stocker du pétrole avant une hausse | Arbitrage temporel, outil de lissage |

### 1.3 Ce qu'on retient des autres jeux

| Jeu | Mécanique à retenir | Leçon pour WSE |
|---|---|---|
| **Factorio / Satisfactory** | Le goulot se **voit** : tapis vide en aval, tapis plein en amont, machine immobile. Le ratio est simple (3 machines A pour 2 B) | Le flux physique doit **refléter la vérité** de la simulation : pas d'animation décorative |
| **Offworld Trading Company** | Un prix unique par ressource, qui bouge visiblement à chaque achat ou vente ; pénurie et saturation se lisent sur une courbe | WSE l'a déjà (passe 14, `S.price`). L'étendre aux produits finis du joueur |
| **Big Pharma** | Une usine est un puzzle spatial de machines et de convoyeurs sur une petite grille ; la contrainte d'espace crée l'optimisation | La grille 12 emplacements de WSE est le bon gabarit ; il lui manque des choix *non dominants* |
| **Production Line** | Chaque poste affiche son temps de cycle et son taux d'occupation ; le poste le plus lent est surligné | Une pastille de goulot par unité, pas seulement par usine |
| **Software Inc.** | Un carnet de commandes et des contrats, avec pénalités de retard | Le carnet donne une **raison** de produire plus ou moins |
| **Transport Fever** | La demande des villes attend la desserte ; une ligne saturée se voit (passagers qui attendent) | « Clients qui attendent » = file d'attente visible devant le quai de sortie |
| **Capitalism II / Industry Giant** | Industry Giant : le magasin a un stock en rayon qui se vide, le camion qui ne vient pas se voit | Le stock **local** est la base de toute lecture de goulot |

**Synthèse du concepteur.** La profondeur de Capitalism ne vient pas du nombre de bâtiments. Elle vient de **trois quantités locales et visibles par entreprise** : *ce que je peux faire* (capacité), *ce qu'on me demande* (demande ou commandes) et *ce que j'ai en réserve* (stock). Elle vient aussi d'un **classement concurrentiel** qui décide qui sert la demande. Tout le reste en découle.

---

## 2. Diagnostic de l'existant (lecture de `game.template.html`)

### 2.1 Ce qui existe et qui est bon

- **Le plan d'usine à 12 emplacements** (passes 24, 28 et 30) : 6 cases au sol (stock, machine, robot), 3 portes d'ENTRÉE (achat) et 3 portes de SORTIE (vente). L'emplacement de chaque type est imposé (`slotOk`), les verrous se lèvent avec le niveau (`planOpenN`), les robots s'usent (`planDaily`, l.4152) et `robotRoi` donne leur rentabilité. C'est **déjà l'équivalent de la grille 3×3 de Capitalism**, avec une mise en scène supérieure.
- **Les codes de goulot** (`c.limit`) et la fonction `bottleneck(c)` (l.8521) donnent des messages clairs, avec des **actions en un clic** : ajouter une ligne de vente, choisir un fournisseur, sources automatiques, salaires.
- **Les alertes posées sur le lieu du problème** en vue Dessus : convoyeur hachuré rouge pour un intrant manquant, et liaisons `planLinkList` dont l'épaisseur suit le débit.
- **Le marché** : un prix unique par bien (`S.price`), un rapport demande/offre `S.rat` et des états (pénurie, saturation). La demande par classe tient compte du PIB, du salaire réel et du bonheur (l.4958-4962). L'élasticité-prix est à court et long terme (`elF`), la note produit pondère prix, qualité et marque (`productScore`, l.2285) et l'adoption suit un modèle de Bass. Tout cela est **plus riche que Capitalism** sur la demande.
- **Les fournisseurs** (`supOffer`, `bestOffer`, `stepProcure` l.3973) : changement automatique en cas de rupture. Les **filiales et prix de cession** (passe 32) sont très proches de Capitalism Lab.
- **L'outil « Tester »** (`mkSim`, essai pilote) : une idée excellente que Capitalism n'a pas.

### 2.2 Ce qui manque

| Manque | Constat dans le code | Conséquence en jeu |
|---|---|---|
| **Stock local par usine** | `runRecipe` (l.4911) puise les intrants dans `S.stock[g]`, **commun à tout l'empire**, et y verse la production (`S.stock` ou `S.prod[pk].stock`). L'usine n'a pas de réserve propre | Impossible de dire « cette usine a 3 jours de fer ». Pas de tampon, pas de lag local, pas de logistique réelle |
| **Unité Stock réelle** | Dans `planEval` (l.4121), l'unité stock n'est qu'un **facteur de débit** : `f.stock = 0,6 + 0,8 × nStock / machines` | Un rack n'est pas une réserve : c'est un multiplicateur. Le joueur ne gère pas de niveau de stock |
| **Clients de l'usine** | La porte SORTIE (`sell`) n'est qu'un plafond (`n.sell × 1,25` machine). Elle ne vend à personne : les magasins vendent depuis le stock commun (l.4990-5030) | L'usine ne « perd » jamais de client : pas de classement, pas de commande, pas de concurrence au niveau de l'usine |
| **Carnet de commandes** | Aucune notion de commande, de retard ou d'annulation (aucune occurrence de « carnet » ou « commande client ») | Pas de pression temporelle, pas de raison de surdimensionner ou de sous-dimensionner |
| **Niveau ou formation par unité** | Les unités n'ont ni niveau ni expérience ; les seuls leviers sont le nombre d'unités, le niveau du bâtiment et les curseurs `c.fx` | Une seule façon de croître (ajouter). L'empan de décision reste étroit |
| **Plusieurs produits par usine** | Une recette par usine (`recOf(c)`) | Pas d'arbitrage de ligne. Acceptable pour rester simple (voir §3.5) |
| **Entrepôt physique** | `stepWarehouses` (l.3342) : l'inventaire de l'entrepôt est une **répartition comptable** du surplus du stock commun au-dessus de `SOFT_STOCK = 36`, plus import et export à seuil | L'entrepôt ajoute de la place et règle des seuils, mais il ne tamponne rien entre deux bâtiments et n'a pas de débit |

### 2.3 Ce qui est trompeur (à corriger en priorité)

1. **La « satisfaction client » de la carte d'expédition est inventée.** `planTopInfo` (l.11136) la calcule ainsi : `sat = 0,55 × (capacité des quais ÷ machines) + 0,45 × qualité − 0,25 si stock plein`. Elle ne dépend ni de la demande, ni des ventes, ni des retards. Avec 3 quais, une usine dont personne n'achète le produit est « satisfaite à 90 % ».
2. **« Livraison : X $ par camion »** = `c.pRev / 8`, une valeur sans unité de temps réelle. La **mini-carte de route** est tirée au hasard (`hash(c.x, c.y)`) et ne correspond à aucun client.
3. **« Niveau de réserve » et « % plein »** (`facStockLvl`, l.11135) = **stock commun de l'empire ÷ 2 500**, et non le stock de l'usine. Deux usines voisines affichent la même réserve.
4. **Le « temps de cycle »** = `24 / (débit ÷ quantité ÷ machines)` : c'est une conversion d'unités, pas une mesure.
5. **Deux demandes différentes pour un même produit.** `mkDemandDay` (l.7429), utilisée par les suggestions et la prévision, découpe la demande de la classe par poids du produit (au plus 60 %). La simulation, elle (l.4990), partage la demande **de la classe** entre marchandises génériques, produits du joueur et un concurrent agrégé (`rivalAttr`). La prévision et la réalité peuvent donc diverger sans que le joueur sache pourquoi.
6. **Les « offreurs » concurrents** (`mkOffers`, l.7452) sont générés par hachage : marge, qualité, distance et stock. Ils ne produisent ni ne vendent dans la simulation, où la concurrence est **agrégée par classe**. Les afficher comme des acteurs est acceptable, mais leurs prix ne réagissent pas à ceux du joueur.
7. **La surproduction est presque indolore.** Au-delà de ~15 jours de ventes (`PROD_COVER = 15`, `prodRoom`), le surplus de produit part **automatiquement à l'export** au cours × (`EXP_BASE` 0,82 − 0,10 + bonus de port) (l.5060). Le joueur ne voit jamais « je produis trop ». Il perd environ 25 % de marge en silence. C'est l'exact opposé du signal de Capitalism (stock plein, barre d'offre au-dessus de la barre de demande).
8. **La porte SORTIE pleine** (`pl_sell0`) bloque la production parce qu'il n'y a « pas de quai ». Or le vrai problème d'un fabricant est presque toujours l'**absence d'acheteurs**, qui ne déclenche aucune alerte côté usine.

**Verdict.** L'usine est un **multiplicateur de débit habillé en usine**. Le joueur optimise des ratios achat/machine/vente (1,25/1/1,25) qui sont toujours les mêmes. Une fois appris (1 achat et 1 vente pour 1 à 1,25 machine), il n'y a plus de décision. C'est le défaut classique qu'on corrige en rendant **la demande locale** et **le stock physique**.

---

## 3. Proposition (sans code)

### 3.1 Les cases d'usine façon Capitalism, sur la base des 12 emplacements actuels

Il ne faut **pas** revenir à une grille 3×3 abstraite : les 12 emplacements (3 entrées, 6 sols, 3 sorties) sont lisibles et déjà mis en scène. On garde la géométrie et on donne à chaque rôle **une quantité qui lui est propre**.

| Rôle | Ce que l'unité **possède** (nouveau) | Le réglage unique du joueur | Ce qu'elle affiche |
|---|---|---|---|
| **ACHAT** (porte d'entrée) | Un fournisseur attitré par porte (déjà `c.src`) et un débit d'arrivée par jour | Le fournisseur (auto par défaut) | Barre « arrivé / demandé », prix livré, délai |
| **STOCK** (rack au sol) | Une **réserve physique locale** : entrée (intrants) et sortie (produits finis), capacité en unités | La **cible en jours** (3, 7 ou 15), auto = 7 | Jauge en **jours de couverture**, pas en % |
| **FABRICATION** (machine) | Cadence et **niveau** (1 à 5) | Rien (ou cadence via `c.fx`, qui existe déjà) | Taux d'occupation et cause d'arrêt |
| **VENTE** (porte de sortie) | Des **clients** et une **file de commandes** | Le **prix départ usine** (−20 % à +20 % du cours), auto = cours | Commandes/jour, retard moyen, clients perdus |

**Règles du débit (simples)** :

- Production du jour = min(cadence des machines, intrants **en stock local**, place en stock de sortie).
- Expédition du jour = min(capacité des quais, stock de sortie, **commandes en attente**).
- Réception du jour = min(capacité des portes d'achat, offre du fournisseur, place en stock d'entrée).
- Sans unité STOCK, la réserve de base vaut 1 jour de production (comme un petit tampon de ligne). Chaque rack ajoute ~5 jours de production d'une machine. **Le stock devient une vraie variable d'état** et non plus un facteur 0,6.

**Augmenter l'empan d'optimisation sans multiplier les écrans** :

- **Niveaux d'unité 1 à 5** (au lieu de 1 à 9 dans Capitalism, pour une partie de 90 min). Le niveau monte par **expérience**, c'est-à-dire avec les jours de marche, ou par **formation payante** (le coût et la formule de `fxTrain` existent déjà). Effets : machine +12 % de cadence et +3 points de qualité par niveau ; achat et vente +15 % de débit par niveau. Le joueur choisit alors entre *ajouter une unité* (case consommée, effet immédiat) et *former* (pas de case, effet lent). C'est **le** compromis central de Capitalism.
- **Robots = amélioration d'une machine**, et non une case. Aujourd'hui un robot occupe un emplacement au sol. Mieux vaut l'**attacher à une machine** (un emplacement de machine reçoit 0 ou 1 robot), ce qui libère la grille pour du stock. Le robot garde son usure et son retour sur investissement. Le compromis devient lisible : robot = cadence + moins de salariés, contre usure et achat de robots (et c'est un débouché pour l'usine de robots du joueur).
- **Entrepôt = vraie entreprise tampon**, sur le même gabarit : portes d'ENTRÉE, racks, portes de SORTIE. Ses unités ont **3 fois** la capacité d'une unité d'usine, comme dans Capitalism Lab. Il a un rôle unique : il **sert de fournisseur** (pour les usines) et de **client** (pour les usines amont) dans les listes de fournisseurs, avec son propre stock. Les seuils d'import et d'export actuels (`whCfg`) deviennent ses deux réglages. C'est l'outil de spéculation et de lissage.
- **Améliorations d'usine** (le « niveau » actuel L1 à L5) : elles déverrouillent des emplacements, comme `planOpenN` le fait déjà. Rien à changer.

### 3.2 Le « bureau de l'usine » cliquable : un carnet de commandes lisible

Le local bureau vitré existe déjà dans la vue Dessus (`facDrawOffice`, l.11342). Un clic ouvre **un seul panneau**, organisé en six tuiles. Ce panneau est l'équivalent des barres offre/demande de Capitalism, en mieux.

```
┌─ BUREAU · Usine de vélos (Moyenne, L2) ─────────────────────────────┐
│ ① MARCHÉ DU PRODUIT      ② MON OFFRE          ③ ÉCART (lag)        │
│ Demande ville 1 240 /j   Production 820 /j    -420 /j  ▼ manque    │
│ dont servie par moi 61 % Expédié 760 /j       Carnet 3,4 jours ⚠   │
│ ~~courbe 30 j~~          ~~courbe 30 j~~      Annulations 38 /j    │
│                                                                     │
│ ④ STOCKS                 ⑤ GOULOT             ⑥ CONCURRENTS        │
│ Intrants : acier 2,1 j ⚠ Ligne d'achat acier  Toi 312 $ Q62 M40    │
│ Produits : 0,4 j         (débit 84 %)         Velox 298 $ Q70 M55  │
│                          [Ajouter achat 42k$] Import 335 $ Q50     │
│                                                                     │
│ CONSEIL DU CONTREMAÎTRE : « On refuse 38 commandes par jour faute   │
│ d'acier. Une 2e ligne d'achat (42 k$) rapporte ≈ 210 k$/mois. »     │
│                         [Appliquer]  [Voir les clients]             │
└─────────────────────────────────────────────────────────────────────┘
```

Définitions, toutes tirées de la simulation (aucune valeur cosmétique) :

- **① Demande du marché** : la demande **réelle** que la simulation adresse au produit, avec la même formule que la vente (part de la classe selon l'attrait). On supprime l'écart avec `mkDemandDay` : **une seule fonction de demande**, utilisée par le jeu, la prévision et les suggestions.
- **② Offre** : production et expéditions du jour et moyenne sur 30 jours, avec la part de cette usine si plusieurs usines fabriquent le produit.
- **③ Écart et lag** : commandes reçues − expédiées ; **carnet = commandes en attente, exprimé en jours** ; annulations du jour. Seuils : vert sous 1 jour, orange de 1 à 5 jours, rouge au-delà.
- **④ Stocks** : la couverture **en jours** de chaque intrant et du produit fini, dans le stock **local**.
- **⑤ Goulot** : le code `c.limit` existant, accompagné de l'**action chiffrée** (coût, gain par mois, retour sur investissement : `robotRoi` et `planPreview` savent déjà le calculer).
- **⑥ Concurrents** : prix, qualité et marque des 2 ou 3 meilleurs offreurs, comparés au joueur, avec la **note globale** de chacun. Cela suppose que les offreurs aient un prix qui réagit (§3.6).
- **Conseil du contremaître** : **une** phrase et **un** bouton. Il réutilise `planNext` et `bottleneck`, et ordonne les conseils par gain par mois.

**Fonctionnement du carnet de commandes (modèle minimal)** :

1. Chaque jour, la demande servie par les magasins et la demande industrielle (usines clientes, rivaux via `LOCAL_D`, contrats) **deviennent des commandes** adressées aux producteurs du bien, au prorata de leur note : prix livré, qualité, marque, délai.
2. Une usine expédie dans l'ordre d'arrivée des commandes. Ce qui n'est pas expédié reste au carnet.
3. Une commande **vieillit** : au-delà de 5 jours elle est annulée, et le client baisse sa note de cette usine (fidélité −). Le délai moyen du carnet entre dans la note de l'offreur. Un fournisseur lent perd donc ses clients, comme dans Capitalism.
4. Inversement, si les commandes sont inférieures à la production, le **stock de sortie monte**. Une fois plein, la production s'arrête, comme dans Capitalism. **On supprime l'export automatique silencieux** du surplus de produit (l.5060), ou on le rend explicite : « Écouler le surplus à l'export (−28 %) », en réglage de la porte de sortie, désactivé par défaut et affiché en orange.

### 3.3 Faire **voir** les problèmes

Une grammaire visuelle unique, dans la ville, dans l'usine et dans les menus :

| Signal | Où | Règle |
|---|---|---|
| **Couleur d'état** | Contour de chaque unité, liaison et carte | Vert = OK ; orange = sous 80 % ou couverture sous 3 j ; rouge = arrêt ou carnet au-delà de 5 j. **Une seule source** : le même calcul que `c.limit` |
| **Flèches de flux** | Convoyeurs (`planLinksDraw` existe) | Épaisseur = débit **réel** du jour ; chevrons arrêtés = rien ne passe ; flux vide avant le goulot, flux plein après |
| **Pastille de goulot** | Sur **l'unité** qui limite (et non sur l'usine) | Un seul triangle rouge par usine, sur l'unité dont le débit est minimal (logique « Production Line ») |
| **File d'attente** | Devant les portes de SORTIE | Camions clients qui attendent : leur nombre = carnet en jours (0 à 5 camions). Un coup d'œil suffit |
| **Racks** | Racks 3D | Le remplissage = stock **local** réel en jours (et non le stock commun ÷ 2 500) |
| **Courbes simples** | Bureau, fiche produit | **Deux lignes et une aire** sur 30 jours : demande (orange), production (jaune, les couleurs de Capitalism), stock (aire grise). Pas plus |
| **Sur la carte de la ville** | Icône au-dessus de l'usine | Pastille seulement si rouge ou orange, avec un mot : « Acier », « Clients », « Quai » |

Règle d'or : **aucune animation ne doit contredire la simulation**. Un camion qui charge alors que rien n'est expédié est un mensonge visuel. La mini-carte au trajet aléatoire et la « satisfaction » doivent être remplacées par des grandeurs vraies, ou supprimées.

### 3.4 Boucles de décision pour un round de 90 minutes

Une bonne boucle se joue en **moins de 30 secondes**, revient toutes les **5 à 15 minutes** et offre au moins **deux bonnes réponses**.

1. **« Je manque de X »** (rupture d'intrant) : acheter ailleurs (plus cher, immédiat), construire la source (cher, lent, marge durable) ou poser un rack de stock (tamponne les à-coups). *Vu sur : convoyeur rouge, ④.*
2. **« Le carnet gonfle »** (demande supérieure à l'offre) : ajouter une machine (case), former (lent, sans case), monter le prix départ usine pour **trier** la demande (marge plutôt que volume) ou ouvrir une 2e usine. *Vu sur : camions qui attendent, ③.*
3. **« Le stock de sortie monte »** (offre supérieure à la demande) : baisser le prix, faire de la publicité, ouvrir des magasins, exporter à perte ou réaffecter l'usine. *Vu sur : racks pleins, ③ en vert négatif.*
4. **Faire ou acheter** (déjà présent avec « Faire ou acheter ? », `mkSim`) : on le relie au carnet. Acheter chez un offreur pour honorer les commandes pendant la montée en cadence.
5. **Ajouter ou former** : une case de plus maintenant, ou +12 % dans 20 jours sans case. C'est le choix sous contrainte d'espace des 12 emplacements.
6. **Robot ou salariés** : en période de pénurie de main-d'œuvre (`fillOf` bas), le robot devient rentable. C'est un lien naturel avec la macroéconomie, qui existe déjà.
7. **Spéculer avec l'entrepôt** : stocker la matière quand `S.rat` annonce une pénurie, revendre au pic. C'est le moment OTC de la partie.
8. **Prix de cession et filiale** (déjà présent) : loger la marge dans la filiale déficitaire. On le relie au bureau, ligne « Clients : maison mère 60 % ».
9. **Guerre de prix avec un rival** : un rival baisse son prix départ usine, mes commandes baissent et ⑥ le montre. Le joueur suit le prix, mise sur la qualité ou la marque, ou laisse filer.
10. **Qualité contre cadence** (curseurs `c.fx` existants) : on les relie à la note de l'offreur pour que le choix ait un effet commercial, et pas seulement un effet de rendement.

Rythme cible sur 90 min : 0-15 min, boucles 1 et 4 (démarrer) ; 15-45 min, boucles 2, 3 et 5 (dimensionner) ; 45-75 min, 6, 7 et 9 (optimiser et combattre) ; 75-90 min, 8 et rachats (finance).

### 3.5 Éviter la complication

- **Un réglage par unité, au plus.** Fournisseur (achat), jours cibles (stock), prix départ (vente). Les machines n'en ont pas, ou seulement les curseurs `c.fx` existants, cachés derrière « Avancé ».
- **Tout est en automatique par défaut**, avec un « contremaître » qui joue le rôle du COO de Capitalism : il choisit les fournisseurs, fixe la cible de stock à 7 jours et le prix au cours. Le joueur **reprend la main** unité par unité (un cadenas indique « réglé à la main »).
- **Une recette par usine**, comme aujourd'hui. Le multi-produit de Capitalism n'apporte pas assez sur 90 minutes pour justifier son coût cognitif.
- **Pas de liens tracés à la main.** La topologie reste implicite (achat, stock, machine, vente), comme aujourd'hui. Seules les quantités deviennent locales. On garde la richesse de Capitalism (stock, demande, classement) sans son irritant majeur, le traçage des liens.
- **Révélation progressive** : le carnet et les jours de stock n'apparaissent qu'au premier problème (« Ta première commande en retard ! »). Le niveau d'unité n'apparaît qu'au premier passage au niveau 2.
- **Trois alertes au plus** à l'écran, triées par perte en $ par mois. Tout le reste reste dans le bureau.
- **Vocabulaire constant** : « jours de stock », « commandes en attente », « clients perdus ». Pas de pourcentage d'utilisation sans référence.
- **Ne pas tout simuler par agent** : les commandes sont des **flux agrégés par bien et par jour**, partagés au prorata des notes, et non des milliers de commandes individuelles. C'est déterministe et peu coûteux.

### 3.6 Points d'architecture à trancher (sans coder)

- **Stock local contre stock commun.** On propose un **registre par bâtiment**, sur le modèle du registre `S.grp.led` des filiales, qui ventile déjà le stock commun par société. On l'étend : stock commun = Σ des stocks locaux + stock « marché ». La conservation des unités devient testable.
- **Offreurs réactifs** : `mkOffers` est déterministe et ne réagit pas. Il suffit d'ajouter un **ajustement de prix des offreurs** proportionnel à l'écart offre/demande du produit (comme le cours `S.price`). Le joueur voit alors les concurrents bouger.
- **Compatibilité** : comme dans les passes 24 à 32, tous les nouveaux champs sont **facultatifs** (absents = ancien comportement), et la sauvegarde v8 reste lisible.

---

## 4. Feuille de route en trois lots livrables

### Lot 1 : « Ce que tu vois est vrai » (effort **M**, environ 1 semaine)

*But : supprimer le trompeur et ouvrir le bureau en lecture seule, sans toucher à l'économie.*

- Remplacer les KPI inventés de `planTopInfo` (satisfaction, livraison par camion, mini-carte, temps de cycle) par des grandeurs réelles : ventes du produit, part de marché `ps.share`, jours de couverture, surplus exporté du jour (`ps.exp`) et sa perte de marge.
- **Une seule fonction de demande par produit**, partagée par la simulation, `mkSim` et les suggestions. On la place à côté du calcul de la l.4990 et on la mémorise par jour.
- Rendre la surproduction **visible** : alerte orange « Tu produis plus que tu ne vends : X unités par jour exportées à −28 % ».
- **Bureau de l'usine** (clic sur le local vitré), avec les tuiles ①②③④⑤⑥ alimentées par l'existant (③ = production − ventes faute de carnet ; ⑥ = `mkOffers`). Courbes sur 30 jours de demande, production et stock (nouveau tampon circulaire de 30 valeurs par produit).
- Pastille de goulot posée sur **l'unité** limitante, et couleurs d'état unifiées.

*Tests à écrire* (`tools/tests/t39_bureau_verite.js`) :
- Chaque valeur affichée dans les cartes et le bureau est égale (à 1e-6 près) à la grandeur de la simulation (ventes, `ps.share`, `ps.exp`, `c.limit`).
- Aucune valeur affichée ne dépend de `hash()` (comparer deux usines identiques à des coordonnées différentes).
- `mkSim` et la simulation donnent les mêmes ventes à J+30 en l'absence de choc (tolérance 5 %).
- L'alerte de surproduction apparaît si et seulement si `ps.exp > 0`.
- Ouverture du bureau en clic réel, sur ordinateur (1280) et sur mobile (390×844). `t02_marges`, `t09_plan_usine` et `t14_vue_dessus` restent verts : aucune régression d'économie.

### Lot 2 : « Le carnet et le stock local » (effort **L**, environ 2 à 3 semaines)

*But : faire de l'usine une entreprise avec des réserves et des clients, comme dans Capitalism.*

- Registre de **stock local** par bâtiment (entrée et sortie), avec un stock commun dérivé. Les unités STOCK deviennent des capacités en jours. Les racks 3D affichent le stock local.
- **Commandes agrégées** par bien et par jour, réparties entre producteurs au prorata de leur note (prix livré, qualité, marque, délai). Le carnet vieillit, les annulations surviennent au-delà de 5 jours et la fidélité du client baisse.
- **Prix départ usine** sur la porte de SORTIE. L'export du surplus devient un réglage explicite, désactivé par défaut.
- File de camions clients devant les portes de sortie = carnet en jours.
- Conseil du contremaître classé par gain par mois.

*Tests à écrire* (`t40_carnet_stock_local.js`) :
- **Conservation** : Σ stocks locaux + expédié + consommé = production + achats, chaque jour, sur 200 jours.
- Usine sans client : le stock de sortie monte, la production s'arrête à stock plein, `c.limit` est sur la sortie (et non plus `pl_sell0`).
- Demande supérieure à la capacité : le carnet monte, des annulations apparaissent au-delà de 5 jours, et la part de marché baisse au profit d'un offreur.
- Deux usines du même produit : la moins chère et la plus rapide reçoit plus de commandes.
- Rétrocompatibilité : une ancienne sauvegarde se charge, et l'absence des nouveaux champs reproduit les marges de référence (`t02` et `t06`). Déterminisme bit à bit sur deux exécutions.
- Bot round (`tools/bot_round.js`) : la courbe de valorisation reste dans ±20 % du tableau de la passe 15, sinon on rééquilibre.

### Lot 3 : « L'empan du joueur » (effort **M**, environ 1 à 2 semaines)

*But : multiplier les bonnes décisions sans ajouter d'écran.*

- **Niveaux d'unité 1 à 5** (expérience et formation payante), effets bornés, affichés sur l'unité (étoiles).
- **Robot = amélioration d'une machine** (et non plus une case). L'ancienne case robot migre vers la machine voisine, sur le modèle de `planMigrate`.
- **Entrepôt sur le gabarit d'usine** (entrée, racks, sortie, ×3), présent comme fournisseur et comme client dans les listes. Spéculation possible.
- **Offreurs réactifs** : leur prix suit l'écart offre/demande. Les rivaux peuvent lancer une guerre de prix visible en ⑥.
- Contremaître (COO) automatique par défaut, avec reprise en main unité par unité.

*Tests à écrire* (`t41_empan.js`) :
- Former une unité de vente du niveau 1 au niveau 3 augmente l'expédition de +30 % (±1 %), sans case supplémentaire.
- Robot attaché : mêmes gains qu'avant la migration (comparaison `robotRoi` avant et après).
- Un entrepôt entre une ferme irrégulière et une usine réduit la variance des intrants livrés (écart-type sur 120 jours divisé par au moins 2).
- La guerre de prix d'un rival fait baisser les commandes du joueur, puis les fait remonter quand il s'aligne.
- Mode contremaître : une usine laissée en automatique 300 jours ne reste jamais plus de 10 jours en rupture si une source existe.

**Ordre recommandé : 1, puis 2, puis 3.** Le lot 1 est sans risque et change déjà la perception de Rémy (« je comprends ce qui se passe »). Le lot 2 est le vrai saut de profondeur. Le lot 3 est du confort de maîtrise. Chaque lot est jouable seul.

---

## 5. Sources

- [Capitalism Lab : Beginner's Guide, Gameplay Basics](https://www.capitalismlab.com/beginners-guide-gameplay-basics/) (barres offre/demande, niveaux d'unité 1 à 9, poids prix/qualité/marque par produit, comportement du stock)
- [Capitalism Lab : Warehouse](https://www.capitalismlab.com/new-content/warehouse/) (unités Entrée/Stockage/Sortie, ×3 par rapport à l'usine, spéculation)
- [Tutoriel usine de Capitalism (1995)](https://discmaster.textfiles.com/view/22564/GAMBLERCD27B.BIN/TUTORIAL/T_FACT.TUT) (liens achat → fabrication → vente, niveaux d'unité)
- [Capitalism Lab : Advanced Modding, Manufacturing](https://www.capitalismlab.com/?p=1129) (Manufacturer's Guide, recettes)
- [Capitalism Lab : export strategy](https://www.capitalismlab.com/export-strategy/)
- [Manuel de Capitalism II](https://manualmachine.com/gamespc/capitalismii/1119360-user-manual)
- Connaissance de conception de Factorio, Satisfactory, Offworld Trading Company, Big Pharma, Production Line, Software Inc., Transport Fever et Industry Giant (mécaniques publiques, non vérifiées en ligne pour ce rapport).
- Code : `wall-street-empire/game.template.html` (`planEval` l.4121, `runRecipe` l.4911, vente en magasin l.4967-5040, export du surplus l.5060, `stepWarehouses` l.3342, `mkDemandDay` l.7429, `mkOffers` l.7452, `bottleneck` l.8521, `planTopInfo` l.11136, `planTopCards` l.11366) ; `README.md` (passes 14, 15, 24, 26, 27, 28, 30, 32).
