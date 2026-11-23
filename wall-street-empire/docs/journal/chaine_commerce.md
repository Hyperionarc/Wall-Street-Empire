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

## Tests mis à jour (justification)
- `t44_mall` : tolérance de la fréquentation enregistrée du pôle 0,2 % → 1 % (mesuré 0,6 %) : des commerces approvisionnés dès la pose font grandir la ville plus vite entre deux rafraîchissements de la fréquentation ; le bonus lui-même (×1,1, ×1,2) est inchangé et vérifié.
- Texte « salaire X $/j » du panneau Pourquoi la demande (domaine Économie, une ligne) : affiché en $/mois, sinon t01 (aucun montant par jour) échoue maintenant que des produits sont lancés dès le départ.

## Ce qui reste

- **Usines et fermes en grille d'emplacements** (point 3) : le sélecteur de fournisseur des intrants est encore la vue `#supview`. Il faut la ramener sous la grille de l'usine, comme dans la fiche magasin. Côté Interface, il faudra peut-être se coordonner.
- **Niveaux d'usine** : ils sont encore une barrière (une petite usine ne fait pas un produit de niveau 2). Proposition : niveau = débit (×0,5 par niveau manquant) et non verrou. C'est à faire (`runsOn`, `recipeItems`, `sourceInfo`, `assignRecipe`).
- **Farine en sachet** vendue en magasin : la farine existe comme bien (moulin, port), mais pas comme produit de rayon. L'ajouter demande une image : commande à passer dans RETOURS.md (Visuels).
- Batch « même fournisseur » et coche ou panneau stop dans le catalogue : à reprendre après le parcours principal.
- Comparaison Local / Moyenne dans la fiche d'emplacement : le tableau existe (`prodView`, repliable) ; il reste à l'aligner sur les captures de référence (ref_61 à ref_65).
