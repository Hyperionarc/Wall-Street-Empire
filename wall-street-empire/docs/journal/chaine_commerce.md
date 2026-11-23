# Journal du responsable Chaîne et commerce

## Spécification adoptée : le modèle d'interaction de Capitalism Lab (précision de Rémy)

Un bâtiment (commerce, usine, ferme, mine) est une grille d'emplacements.

1. Un clic sur un emplacement (par exemple le n° 3 d'un magasin) le sélectionne. La fiche propose aussitôt, au même endroit, ce qu'on peut y mettre : n'importe quel produit vendable de la ville, biens de première nécessité compris. Pas seulement les « produits lancés », ni la seule famille du magasin.
2. Une fois le produit choisi, la même fiche propose le fournisseur. Ce sont des cartes (prix livré, qualité, délai, capacité) : tes usines, fermes et mines, les grossistes et concurrents, et l'import par le port. Le port est un fournisseur comme un autre, disponible dès le jour 1. Un clic relie le fournisseur et l'emplacement vend.
3. Le même modèle vaut pour les usines (emplacement d'achat d'un intrant ← fournisseur ; sortie vendue aux magasins ou exportée), pour les fermes et pour les mines.
4. Le prix de vente se règle sur l'emplacement, avec le nom du produit.
5. La publicité se relie à ce produit (fait en passe 96).

Interdits : écran intermédiaire, « famille à vendre », produit à développer avant de pouvoir vendre un bien du marché, fenêtre flottante mal placée.

Ajouts tirés du site officiel (synthèse reformulée, pages dans le scratchpad `caplab/pages`) :
- **changement de fournisseur en lot** (« Batch » : même produit ou même fournisseur) ;
- **Clear Stock** : solder l'ancien stock pour mettre tout de suite le nouveau produit en rayon ;
- **mise en place automatique d'une usine ou d'une ferme à partir du produit** : une coche indique que la matière est disponible sur le marché, un panneau stop qu'elle ne l'est pas.

## Constats (diagnostic, branche de départ ccr-d9ba3623-415kh0)

Mesure faite avec une sonde : Round dans une « Ville de 100 000 habitants », 10 M$, petit marché posé près du mall.
- **L'îlot.** Le magasin ne proposait qu'**un seul** article, « Biens de base (marché local) » (`g_basic`), un panier abstrait. Les 3 autres emplacements restaient vides et rien ne pouvait y aller.
  - Il y avait pourtant des œufs, du poulet et du lait dans le catalogue, mais tous les produits étaient `locked`.
  - Un produit n'arrivait en rayon qu'une fois « lancé » (R&D ou licence) puis fabriqué.
  - L'achat pour revente (`mkBuy`, `mkOffers`) n'existait qu'en « marché mûr » (`S.mat`, mode Libre). Dans le Round, `mkOffers` renvoyait une liste vide.
- **Les familles.** `shelfItems` et `shopCands` ne présentaient que les classes du type de magasin (`ret.sells`). Les spécialistes, eux, étaient limités à leur famille (`specShelfOk`).
- **La R&D obligatoire.** Poulet, viandes, huile, fromages, biscuits… exigeaient une R&D de 4 à 6 jours (gamme « premium » par défaut). Seuls quelques produits étaient `free`.
- **Le pain.** Blé → farine → pain marchait déjà avec `easyLaunch` (le moulin était affecté seul et les sources étaient automatiques). En revanche, le pain n'occupait qu'un emplacement à côté de `g_basic`.
- **Le port.** Il importait les biens intermédiaires des usines (`runRecipe`, mode « auto »), jamais les produits finis des magasins.

## Décisions (lot 1, commit « passe 102 »)

| Décision | Ce qui est supprimé ou simplifié | Où |
|---|---|---|
| **Réseau d'approvisionnement commun** : chaque produit (hors immobilier et créations du joueur) a deux offres permanentes dès le jour 1. **Import par le port** : qualité 55, sans marque, prix de gros × `impRate` (droits + fret), capacité illimitée, délai 2 j. **Grossiste de la ville** : qualité 50, marge de 5 à 9 %, capacité ≈ 60 % de la demande, délai 1 j. | Le verrou « marché mûr » sur l'achat pour revente. `mkBuy` marche dans tous les modes ; le port s'ajoute aussi aux offres du marché mûr. | `netOffers`, `mkOffers`, `mkBuy` |
| **Relier en un clic** (`netActivate`) : le produit devient vendable sans fabrication (`mkSetResale`). Un premier lot arrive tout de suite, puis l'achat est automatique : la quantité suit les ventes lissées, ou la demande adressée en cas de rupture. Ta production entre dans le même stock, donc l'achat ne comble que le manque. | La quantité fixe choisie à l'achat (en mode auto). | `netActivate`, `netQty`, `mkStepBuy` |
| **Commerce posé = commerce approvisionné** : à la pose, les emplacements se remplissent de tes produits puis des produits les plus demandés du réseau. Un emplacement reste libre pour ton choix. « Remplissage automatique » remplit tout. | Le magasin vide qui ne vend qu'un panier abstrait. `g_basic` reste proposé (sauvegardes, rivaux, calibrations) mais n'est plus mis d'office. | `netAutoFill`, `place`, action `autoslots` |
| **Plus de famille** : un magasin peut présenter n'importe quel produit. Ceux de son type passent en tête, les plus demandés d'abord. « Tous les produits de la ville » déplie le reste. La capacité de rayon pour une classe hors type se calcule au prorata des emplacements. Le bonus des spécialistes reste réservé à leur famille. | Le filtre `ret.sells` et `fam` sur les produits, et `specShelfOk` pour les produits. | `shopCands`, `sellsC`, `c._xc`, `specShelfOk` |
| **Fournisseur choisi sur l'emplacement** : sous le prix, des cartes « Tes usines » ou « Fabriquer chez toi » (affecte une usine libre au produit), le grossiste et le port. Un clic change le fournisseur du produit pour tous les magasins, puisque le stock est commun : c'est le « Batch – même produit » de CapLab, sans écran supplémentaire. | Le texte figé « Fournisseur : ta propre production ». | `netSupHTML`, actions `sup:`, `mkmake:` |
| **Vider le stock** (Clear Stock) : le stock du produit est soldé à 40 % du prix de gros. | — | action `clrstk:` |
| **Biens de base sans R&D** : tout produit de classe « base » est `free` et se fabrique tout de suite. La R&D reste le chemin de la qualité et de la marque (changement de gamme). | La R&D obligatoire sur le poulet, les viandes, l'huile, les fromages, les biscuits, etc. | après `PKEYS` |
| Coût d'achat affiché juste : pour un produit acheté, c'est le prix livré de l'offre, et non ses intrants. | — | `slotEcon` |

L'économie libérale est respectée :
- les prix de rayon restent libres ;
- l'achat au port coûte ≈ 1,33 × le prix de gros, contre ≈ 1,76 × au rayon : la marge est réelle mais mince, et vendre sous le coût mène à la perte ;
- une marque propre et une usine restent plus rentables.

Aucun `rnd()` n'a été ajouté (offres calculées par `hash`). Côté sauvegarde, seuls des champs facultatifs ont été ajoutés : `ps.buy.auto`, `ps._se`, `c._xc` (ce dernier n'est pas utile au rechargement).

## Mesures

Petit marché seul près du mall (graine 7001) :
- jour 1 : pain 23, lait 30, œufs 26 unités vendues ;
- à 30 jours : 92 unités/j, CA 1,8 k$/j, bénéfice ≈ 790 $/j ;
- stock tampon ≈ 4 à 5 jours de ventes.

## Tests

- `t102_parcours_chaine` (nouveau) : 19 PASS. Contre le build de départ, il échoue (magasin à `g_basic` seul, puis aucun produit à choisir, d'où un délai dépassé).
- Après les lots 1 à 3 : t102 21 PASS ; t01 t05 t44 t96 t97 t98 t94 t95 t100 verts ; t02 t09 t22 t37 t60 t61 verts.
- Échecs constatés à l'identique sur le build de départ (pas de mon fait) : t08 « chaîne bread bien construite » (EBITDA −10 % au départ, −4 % maintenant), t89 (temps d'image d'une grande ferme, cours local du blé 100 → 400 cases), t10 (témoins obesity et perfume).
- Remplissage automatique : quotas par classe selon le mélange du magasin (hypermarché : 45 % base, 35 % courant, 20 % luxe). Sans eux, l'hypermarché ne prenait que des biens de base très demandés et perdait le luxe : t02 le mettait à −1 % d'EBITDA. Avec les quotas, t02 repasse au-dessus de 12 %.

## Lot 2 : niveaux d'usine = capacité
- `lvlK(c, k)` : une usine sous le niveau de la recette la fabrique quand même, à débit ÷ 2 par niveau manquant (une petite usine fait des jeans à 50 %). Supprimés : le refus « Usine moyenne requise » du catalogue, le filtre de niveau de `recOf`, `runsOn`, `sourceInfo`, `unitsOn`, `facCounts` (une usine inférieure qui fabrique compte à son débit). Gardé : l'affectation automatique préfère une usine du bon niveau ; le palier (`tier`) des produits non basiques reste (progression).

## Lot 3 : emplacements d'achat de l'usine
- `facBuyHTML` : sous « Production actuelle », une grille d'emplacements d'achat (un par intrant : besoin/j, stock, source). Clic = sélection ; dessous, les fournisseurs en cartes (Automatique, ton réseau, groupe, compagnies, négociant, import par le port : prix livré, qualité, délai, offre suffisante ou courte) ; un clic relie (`c.src`). Plus besoin d'ouvrir la vue flottante `#supview` (gardée pour les liens existants : alertes, goulots).

## Lot 4 : changement de fournisseur en lot
- Produit de rayon : le fournisseur est celui du PRODUIT (stock commun), donc un clic sur un emplacement relie tous les magasins qui le vendent (« Batch – même produit »).
- Intrant d'usine : bouton « Même source pour mes N autres usines qui achètent X » sous les cartes fournisseurs (`fbatch:`).

## Tests mis à jour (justification)
- `t44_mall` : tolérance de la fréquentation enregistrée du pôle 0,2 % → 1 % (mesuré 0,6 %) : des commerces approvisionnés dès la pose font grandir la ville plus vite entre deux rafraîchissements de la fréquentation ; le bonus lui-même (×1,1, ×1,2) est inchangé et vérifié.
- Texte « salaire X $/j » du panneau Pourquoi la demande (domaine Économie, une ligne) : affiché en $/mois, sinon t01 (aucun montant par jour) échoue maintenant que des produits sont lancés dès le départ.

## Lot 5 (retours de Rémy après la v8-9)
- **Emplacements vides à la pose** : un magasin posé par le joueur (`playerPlace`, clic sur la carte) a tous ses emplacements vides ; c'est au joueur de choisir. Le remplissage automatique à la pose est retiré ; « Remplir » reste un bouton. Les poses par l'API (tests, bots) gardent l'ancien rayon par défaut.
- **Fournisseurs réels pour toutes les marchandises** : un emplacement « Biens de base / manufacturés / luxe » affiche en cartes : Automatique, ton stock, groupe, compagnies, négociant, import par le port (prix livré, qualité, délai, fret ; `genSupHTML`, `gsup:`). Le coût de vente suit la source choisie (import et groupe compris). Les produits ont aussi les sociétés concurrentes de la ville comme fournisseurs (`netOffers`, type `riv` : le concurrent encaisse sa marge, somme positive).
- **Publicité en encart** : en haut à droite du panneau d'emplacement, « Augmenter les ventes : faire de la publicité » (support, budget, effet attendu) à côté du prix.
- **Mise en page** : sur grand écran, grille compacte à gauche, panneau d'action à droite ; ordre du panneau : services → fournisseur → prix et publicité → liste de produits. Captures 1280×800 : produit, services, fournisseurs, prix, encart publicité visibles sans défiler ; 900×800 : grille, en-tête et services visibles, fournisseurs et prix juste en dessous (la fenêtre n'a que 470 px de haut entre le tableau de bord et la barre d'outils).

## Gamme disponible au jour 1 (retour de Rémy)
Disponibles au départ sur le réseau (grossiste, port, concurrents) : pain, pâtes, œufs, poulet, viande de bœuf, de porc, agneau, charcuterie, lait, yaourts, fromages, huile de table, savon, dentifrice, shampooing, couches et hygiène, t-shirts, chaussettes (`NET_START`).
À constituer (absents du choix et du port au départ) : médicaments (barrière : R&D obligatoire même pour les classes de base), électronique, électroménager, mode travaillée (jeans, cuir, sacs), luxe, voitures, meubles, jouets, boissons et confiseries…
Mécanisme libéral (`netAvail`) : un produit apparaît sur le marché quand un producteur existe (tes usines, une IA qui le fabrique : `r.fab`), en marché mûr, ou, pour un bien de base non médical, quand la région dépasse 250 000 habitants. Les produits de marque restent possibles (R&D, fabrication).

## Lot 6 : trois départements du commerce, ruptures
Idée de conception de Rémy (pas une copie) : fournisseur → **Achats** → **Stock** → **Vente (rayon)** → client. Les services existants sont réutilisés : effectif (`c.dept`, `deptMult`) et formation 0-3 (`c.train`, `trainCost`).
- Achats : unités commandées par jour = capacité du rayon × 1,2 × (1 + 0,5 × formation) × service Achats, partagée entre les produits du magasin (`shopBuyCap`, `netCaps`).
- Stock (arrière-boutique) : capacité × 6 × (1 + 0,5 × formation) × service Stock (`shopStkCap`) ; le stock visé = (délai fournisseur + couverture de sécurité 4 j) × ventes potentielles, borné par cette réserve.
- Vente : capacité du rayon (`c._capNom`) × service Vente × (1 + 0,25 × formation) (avant : service Stock).
- Commande : suit les ventes POTENTIELLES lissées (demande adressée bornée par le rayon), donc une rupture ne fait pas baisser la commande ; une hausse brutale crée un retard (délai + plafond des Achats). Stock nul : la vente est perdue (`c._lostU`, `ps._lost`), la disponibilité du magasin baisse (`c._av`) et la notoriété aussi.
- Fiche : bandeau des trois services (charge/capacité, formation ●○○, bouton « Former » avec coût) et diagnostic du goulot.
- Tests (t102) : équilibre sans rupture ; Achats vidés + prix des œufs baissés → 6 jours de rupture, former les Achats les supprime, former le Stock non ; rayon vidé → former la Vente double les ventes, former les Achats non.

## Lot 7 : finances de l'emplacement (lecture seule)
Carte : prix · ventes/j · couverture (vert, ambre > 15 j, rouge < 1,5 j). Panneau « Finances de l'emplacement » (`slotFinHTML`) :
- marge commerciale = prix de vente − coût d'achat livré ($ et %) ;
- couverture = stock ÷ ventes potentielles/j ; taux d'écoulement = ventes ÷ stock ; rotation = 365 × ventes ÷ stock ;
- BFR = stock × coût livré (créances et dettes fournisseurs nulles : paiement comptant), en $ et en jours de ventes ; coût d'immobilisation = BFR × taux d'emprunt ÷ 12 ;
- CA et marge brute sur 30 j (`c.sm`), part de marché, ventes perdues/j.
Le stock d'un produit est commun à tes magasins : couverture et BFR sont ceux du produit. Reste : total du BFR par magasin et par société dans Finances.

## Lot 8 : notoriété du magasin
Cause du « 0 % » : la notoriété (`c.aw`) ne visait que la publicité du magasin. Maintenant `adTarget` = publicité du magasin + 40 % de l'effet des campagnes par produit + bouche-à-oreille (`awOrganic` : 45 points au plus selon la clientèle servie cumulée `c._cust`, × disponibilité² × qualité des services Stock et Vente). Info-bulle explicative. Sauvegarde : `cu` (clientèle) et `xo` (emplacements d'usine achetés), champs facultatifs.

## Lot 9 : cadenas de l'usine
Cause : un emplacement verrouillé n'avait aucune action (texte « agrandis l'usine »). Maintenant (`planUnlock`, `unlockCost` ≈ 12 % du prix du bâtiment) : clic sur un cadenas = achat immédiat s'il coûte ≤ 5 % de la trésorerie, sinon bouton « Débloquer et équiper · coût » dans le panneau ; une porte achetée reçoit son unité (achat à l'entrée, vente à la sortie) ; son « caisse », effet visuel, message avec le débit avant/après ; refus expliqué si les fonds manquent. Test t103 (aucun cadenas inerte, achat, refus, sauvegarde).

## Principes empruntés / conçu en propre
Emprunté comme principe : emplacements d'un bâtiment reliés à des fournisseurs, goulots et ruptures, services d'un commerce (idée de Rémy), changement de source en lot, solder un stock. Conçu en propre : réseau commun port + grossiste + concurrents avec gamme de départ, noms et interactions (« Remplir », « Solder le stock », « Même source pour mes autres usines », cartes fournisseurs dans le panneau), formules de capacité, notoriété organique, cadenas achetables par emplacement, finances de l'emplacement.

## Ce qui reste

- **Dimensionnement réaliste** (cheptel × cycle = débit, ventes par habitant) : non fait. Constat : une petite usine sort ≈ 3 000 u/j quand un petit marché vend ≈ 30 u/j par produit ; il faut redéfinir l'unité (lot) ou réduire les débits d'usine et relever la demande par habitant, ce qui touche toutes les calibrations (t02, t10, t97). À traiter avec le responsable Économie.
- **Vues de l'usine** (dessus détaillé / isométrique animée, retrait du Garage et de la vue éclatée, chevauchements) et **lignes parallèles par variante** (abattoir porc / bœuf / volaille) : non commencés.
- Défis supplémentaires (fournisseurs qui font défaut, liens cassés, entrepôts tampons des récoltes) : non commencés.
- **Farine en sachet** vendue en magasin : la farine existe comme bien (moulin, port), mais pas comme produit de rayon. L'ajouter demande une image : commande à passer dans RETOURS.md (Visuels).
- Batch « même fournisseur » (tous ceux qui achètent chez X, quel que soit le produit) : non fait ; la coche « matière disponible » est implicite (tout s'importe au port), le panneau stop n'a plus lieu d'être.
- Surproduction : une petite usine de poulet sort ≈ 3 000 u/j pour 30 ventes/j d'un petit marché ; le surplus part à l'export (domaine Économie : congestion des produits finis, G15).
- Comparaison Local / Moyenne dans la fiche d'emplacement : le tableau existe (`prodView`, repliable) ; il reste à l'aligner sur les captures de référence (ref_61 à ref_65).
