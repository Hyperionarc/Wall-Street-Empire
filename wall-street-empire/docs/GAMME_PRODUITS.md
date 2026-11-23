# Gamme de produits : audit de dérivation et propositions (passe 75)

Demande de Rémy : « Revoir les 95 produits finis. Plutôt que de vendre du mouton, il faut vendre que de l'AGNEAU. Essaie de diminuer aussi et d'éviter de trop t'embêter à en produire beaucoup trop (images à produire). Notamment les chips de maïs, ça ne fait pas de sens d'autant dériver de choses. Autant se centrer sur l'huile de table, c'est une bonne idée. »

Ce document sépare ce qui est **appliqué** (décidé par Rémy) de ce qui est **proposé** (à trancher). Rien n'a été supprimé à l'aveugle : chaque proposition donne la raison et l'impact sur les familles de magasin (`PRODUCT_FAMILY`), les chaînes, les castes, les scénarios, les missions, le Guide, les classements, les tests et les images.

## 1. Appliqué dans le jeu

| produit | raison | impact |
|---|---|---|
| `cornchips` Chips de maïs (supprimé) | Décision de Rémy : dérivé de dérivé (maïs + huile de cuisine + sel) qui n'apporte rien au gameplay ; l'huile de table suffit comme débouché du maïs et du colza. Pas de photo : une image de moins à produire. | 95 → **94 produits finis**. Famille `food` : 21 → 20 produits. Le maïs n'entre plus que dans l'huile de cuisine, l'huile de cuisine que dans l'huile de table ; le sel perd 1 recette (reste chimie et saucisson). Anciennes sauvegardes migrées (voir § 4). Tests adaptés : t10 (94 produits), t51 (chaîne maïs/colza sans chips), t59 (liste des replis), nouveau t78. Photo retirée de la commande Cowork (RETOURS.md, photos_guide.json). |
| `lambmeat` Agneau (renommé) | Ovin = agneau seul. Il n'existait déjà qu'un produit de viande ovine ; son libellé « Viande d'agneau » devient **« Agneau »** (gigots, carrés, côtelettes), sans aucune mention de mouton côté consommateur. | Aucun impact économique (recette, prix, demande inchangés). La laine (`wool`) reste un coproduit de l'élevage `fsheep` (« Élevage de moutons » est le bâtiment, pas un produit vendu) et alimente les pulls en laine. Sujet photo « carré et gigot d'agneau » ajouté à `photos_guide.json`. |

`tableoil` (huile de table) est conservée et devient **le** produit dérivé du maïs et du colza.

## 2. Méthode de l'audit

Pour chacun des 94 produits restants, on a regardé : la recette (intrants, niveau d'usine), la famille de vente (`PRODUCT_FAMILY`) et d'affichage (`FAM`), un « jumeau » éventuel (même consommateur, même rayon, recette voisine), le rôle dans une chaîne (seul débouché d'un bien intermédiaire ?), les références hors tables (missions, Guide, castes, succession, tests) et l'état de l'image (photo HD fidèle, à refaire, ou repli vectoriel à produire). Les 23 produits d'origine (pain, jeans, télé, pilules, montre, maison bois…) portent les témoins d'équilibre (`BASE_EB` de t10), les technologies d'origine (`PROD_TECH`) et la mission « produit en bois » ou « lave-linge » : ils sont conservés d'office.

Critère de suppression « sans ambiguïté » (appliquée sans attendre) : doublon strict (même recette et même rayon, ou produit qui n'est qu'un reconditionnement) **sans** effet sur une chaîne, une caste, une mission ou un test. Hors chips de maïs, **aucun produit ne remplit ce critère** : chaque candidat ci-dessous touche au moins une famille de magasin, un test d'équilibre ou une chaîne. Ils sont donc proposés à Rémy.

## 3. Propositions à trancher (de 94 à 83 produits, 82 avec l'option)

| produit | raison | impact |
|---|---|---|
| `biofuel` Biocarburant en bidons | Le jeu n'a aucune consommation de carburant (ni véhicules ni engins qui en brûlent) : le biodiesel en bidons est vendu « aux automobilistes » sans mécanique derrière. Doublon fonctionnel de `lube` (Lubrifiants et carburants, même rayon Auto). Repli vectoriel : une photo de moins à produire. | Famille `auto` 7 → 6. Le biodiesel (`biodiesel`) perd son seul débouché : soit on le garde comme marchandise vendue au marché et au port (comme l'engrais), soit on le supprime aussi (le colza garde l'huile de cuisine). Remplaçant pour les sauvegardes : `lube`. Tests : t51 (chaîne colza → biodiesel → biocarburant), t59. Castes, missions, Guide : aucun lien. |
| `car_alu` Voitures en aluminium | Quasi-jumeau de `car` : même moteur, mêmes pneus, mêmes puces ; seule la caisse change. Ce serait plutôt une option de gamme (qualité) de la voiture qu'un produit. | Famille `auto` −1. Le châssis en aluminium (`chassisal`) n'a plus de débouché (à supprimer avec, −1 bien) ; l'aluminium reste utilisé (ordinateur portable, vélo électrique). Remplaçant : `car`. Tests : t30 (rentabilité et chaîne bauxite → voiture alu), t73. Photo existante (pas de gain d'image). |
| `cookware` Casseroles et couverts inox | Doublon de `utensils` (Ustensiles de cuisine), même rayon Maison, même usage. | Famille `home` 16 → 15. L'inox reste utilisé par le lave-linge, le réfrigérateur, le petit électroménager et le micro-ondes. Remplaçant : `utensils` (on peut y mettre un peu d'inox). Tests : t30 (chaîne nickel-chrome → inox → casseroles, à reporter sur le lave-linge). Photo existante. |
| `sausage` Saucisson et charcuterie | Deuxième produit du porc, dérivé du même bien (`pork` + sel) que `porkmeat`, même rayon : la boucherie suffit (bœuf, porc, poulet, agneau). Repli vectoriel : une photo de moins à produire. | Famille `food` −1. Le porc garde la viande de porc et les viandes d'abattoir ; le sel perd une recette (reste la chimie). Remplaçant : `porkmeat`. Tests : t38 (liste des produits d'élevage), t59. |
| `dolls` Poupées et peluches | Quatrième jouet (plastique, bois, électronique, poupées) : recette tissu + plastique, très proche des jouets en plastique. | Famille `sport` 8 → 7. Remplaçant : `toys`. Aucun test, mission ni caste. Photo existante. |
| `skincare` Soins de luxe | Doublon de `cream` (Crèmes et soins) en version luxe, et voisin du parfum de luxe (mêmes intrants : essences, verre, chimie). | Famille `luxury` 9 → 8. Remplaçant : `perfume` (même classe luxe). Test : t68 (liste de produits d'un bot de caste, à ajuster). Photo existante. |
| `bag` Sacs en cuir | Doublon de `handbag` (Sac de créateur) : même objet, version courante et version luxe. | Famille `fashion` 9 → 8. Le cuir reste utilisé (vestes, chaussures, haute couture). Remplaçant : `leathershoes` (même classe). Aucun test ni mission. Photo existante. |
| `desktop` Ordinateurs de bureau | Déjà programmé pour être remplacé par l'ordinateur portable (`SUCC.desktop` : succession vers `laptop`) ; mêmes composants (CPU, DRAM, GPU, écran). | Famille `tech` 9 → 8. Les puces gardent leurs débouchés (portable, tablette, console, téléphone, télé). Remplaçant : `laptop`. Test : t73 (liste des produits à puces). Photo existante. |
| `spirits` Spiritueux | Eau-de-vie de vin, coincée entre le vin de table, le grand cru et le whisky de luxe (4 alcools dont 3 du raisin) ; photo à refaire (pseudo-lettres) : une commande d'image de moins. | Famille `luxury` −1. Le vin garde le vin de table et le grand cru. Remplaçant : `tablewine` (classe différente : le produit phare d'un rival est alors retiré). Aucun test ni mission. |
| `shampoo` Shampooings | Troisième produit d'hygiène à base de chimie + arômes (savon, shampooing, dentifrice) : se fond dans « Savons et détergents ». | Famille `health` 11 → 10. Remplaçant : `soap`. Aucun test ni mission. Photo existante. |
| `microwave` Fours micro-ondes | Recouvre « Petit électroménager » (`blender`) ; recette inox + cartes + puces proche du réfrigérateur. | Famille `home` −1. Remplaçant : `blender`. Aucun test ni mission. Photo existante. |
| `petfood` Aliments pour animaux *(option)* | Recette strictement identique aux plats cuisinés (viandes + farine) ; photo moyenne à refaire. | Famille `food` −1. Les viandes d'abattoir ne servent plus qu'aux plats cuisinés (chaîne courte mais saine). Remplaçant : `readymeal`. Nécessité élevée (65) : la demande des habitants baisse un peu. À ne retenir que si Rémy veut descendre sous 83. |

**Biens intermédiaires associés** (à supprimer seulement avec leur produit) : `chassisal` (avec `car_alu`), `biodiesel` (avec `biofuel`, ou à garder comme marchandise). Les autres biens gardent au moins un débouché.

### Examinés et conservés

| produit | pourquoi on le garde |
|---|---|
| `tyres` Pneus automobiles | Simple reconditionnement du composant « Pneus », mais produit d'origine (technologies, part de marché d'origine, scénarios) : le retirer change l'équilibre d'origine. |
| `woodtoys`, `chair`, `bed` | Mission « Lancer un produit en bois » (`mwp`). |
| `washer` | Mission « Fabriquer un lave-linge complet » (`mw`). |
| `cream`, `perfume`, `fridge`, `bike`, `house_wood`… | Témoins d'équilibre de t10 (`BASE_EB`). |
| `tablewine`, `grandcru` | Rémy veut un vin de table et un vin haut de gamme (commande n° 13). |
| `beefmeat`, `porkmeat`, `chicken`, `lambmeat`, `eggs`, `drinkmilk` | Biens de première nécessité des élevages, un par animal. |
| `tableware`, `glassware` | Seuls débouchés de la céramique / porcelaine et du verre courant. |
| `house_wood`, `house_concrete` | Toute la famille Immobilier (agences, promoteur). |
| `ebike`, `scooter` | Débouchés des batteries et des moteurs pour la mobilité ; famille Auto déjà réduite. |

### Gamme cible si toutes les propositions (hors option) sont retenues

| famille de magasin | aujourd'hui | proposé |
|---|---|---|
| `food` Alimentation et boissons | 20 | 19 |
| `health` Santé et beauté | 11 | 10 |
| `fashion` Mode | 9 | 8 |
| `luxury` Luxe | 9 | 7 |
| `tech` High-tech | 9 | 8 |
| `auto` Automobile et mobilité | 7 | 5 |
| `home` Maison et déco | 16 | 14 |
| `sport` Sport et loisirs | 8 | 7 |
| `diy` Bricolage | 3 | 3 |
| `estate` Immobilier | 2 | 2 |
| **Total** | **94** | **83** |

Aucune famille ne se vide ; chaque magasin spécialisé garde au moins 2 produits. Images : 3 photos de moins à produire (`biofuel`, `sausage`, `spirits` à refaire), en plus des chips déjà retirées.

## 4. Migration des sauvegardes (`wse-city-v8`)

Le mécanisme est générique : un produit retiré est déclaré dans `PROD_RETIRED` (`game.template.html`) avec sa recette au moment du retrait et un remplaçant ; `retiredMigrate` le traite au chargement, avant toute lecture :

- stock en entrepôt (`prod[k].stock`) et en rayon des magasins (`inv`) revendu au **coût de revient historique** (intrants au prix de base ; ≈ 2,75 $/u pour les chips) et crédité en trésorerie ;
- usines qui le fabriquaient remises « sans produit » (le joueur en choisit un autre) ;
- rayons désactivés, prix de magasin, ventes lissées, boutique duty free, offre e-commerce, brevets, classements (`S.rk`), pédagogie : clé retirée ;
- rivaux : produit phare et usines reportés sur le remplaçant s'il est de la même classe, sinon retirés ;
- un message au démarrage annonce le retrait et le montant crédité. Migration pure (aucun tirage aléatoire) et idempotente.

Pour appliquer une proposition : retirer le produit des tables (`P25` ou `PRODUCTS`, `PROD_W`, `NECESS`, `DEMAND_PC`, `MEGA_OF`, `OBSO`, `PROD_TECH`/`TECH_SHARE`, `FAM`, `PRODUCT_FAMILY`, `GLY`), l'ajouter à `PROD_RETIRED` avec sa recette et son remplaçant, puis mettre à jour les tests cités et les documents (`AUDIT_PRODUITS.md`, `CATALOGUE.*`, `RETOURS.md`). Test de non-régression : `tools/tests/t78_gamme.js` (fixture réelle `fixtures/save_v8_avec_cornchips.json`, produite par l'ancien build).

## 5. Gamme disponible au jour 1 (passe 102, décision de Rémy)

| Disponible au départ (réseau : grossiste, port, concurrents) | À constituer par les joueurs |
|---|---|
| Pain, pâtes, œufs, poulet, viande de bœuf, viande de porc, agneau, charcuterie, lait, yaourts, fromages, huile de table | Médicaments (R&D obligatoire, brevets), électronique, électroménager |
| Savon, dentifrice, shampooing, couches et hygiène | Mode travaillée (jeans, cuir, sacs), luxe, voitures, meubles |
| T-shirts, chaussettes | Jouets, boissons, confiseries, vins et spiritueux, livres… |

Un bien « à constituer » apparaît sur le marché (grossiste, port, concurrents) dès qu'un producteur existe (tes usines, une IA qui le fabrique), en marché mûr, ou, pour un bien de base non médical, quand la région dépasse 250 000 habitants (`NET_START`, `netAvail` dans `game.template.html`). Tous les biens de base non médicaux se fabriquent sans R&D.
