# Sprites à générer : élevages, vignoble et caves (passe 38)

Liste seulement : aucune image n'est générée par ce commit. Le jeu dessine pour l'instant ces bâtiments en vectoriel (prismes isométriques, icône SVG, couleur propre) ; chaque sprite ci-dessous remplacera ce dessin. Même format que les autres sprites de bâtiments : PNG transparent, vue isométrique 2:1, éclairage venant du haut gauche, ombre portée douce, empreinte au sol de la case du jeu.

## Bâtiments (empreinte 3 x 4 cases sauf mention)

| Clé du jeu | Nom | Contenu du sprite |
|---|---|---|
| `fcattle` | Élevage de bovins | étable rouge à deux pans, silo à grain, prairie clôturée, abreuvoir, 6 à 8 vaches (blanches et noires, brunes) dispersées, tracteur avec remorque à fourrage, tank à lait chromé contre l'étable |
| `fchicken` (3 x 3) | Élevage de poulets | long poulailler bas à toit de tôle, enclos grillagé avec poules (blanches, rousses), mangeoires rondes, silo à grain, caisses d'œufs empilées devant la porte |
| `fpig` | Élevage de porcs | porcherie en briques à toit plat, enclos boueux, 6 porcs roses, auges, citerne à lisier, silo à grain |
| `fsheep` | Élevage de moutons | bergerie en bois, pré vallonné clos de muret, 8 moutons laineux, balles de foin, tondeuse/tonte au portail |
| `fvine` | Vignoble | rangées de vignes palissadées sur fils (vert, grappes violettes), petit chai en pierre avec toit de tuiles, cuve inox visible, tracteur enjambeur |

## Caves et usines (réutilisent les usines f1 à f3 aujourd'hui)

| Usage | Contenu du sprite |
|---|---|
| Cave (recette Vin, f1) | bâtiment de pierre bas, cuves inox et foudres en bois, pressoir, palettes de bouteilles |
| Chai de vieillissement (grande réserve) | long hangar semi-enterré, rangées de barriques, éclairage tamisé |
| Laiterie (yaourts, fromages, lait de consommation) | usine blanche, citerne de réception, camion-citerne, cave d'affinage pour les fromages |
| Abattoir et découpe (recette Viandes) | bâtiment bas carrelé, quai de réception du bétail, chambres froides, camion frigorifique |

## Animaux (sprites unitaires pour la scène du bâtiment, 4 orientations, 2 images de marche)

vache (blanche/noire), vache (brune), veau, poule, coq, poussin, porc, truie, mouton, agneau, chien de berger.

## Enclos, décors et accessoires

- clôture de bois (droite, angle, portail ouvert et fermé), clôture grillagée pour la basse-cour ;
- abreuvoir, auge, mangeoire ronde, râtelier à foin, balle de foin ronde et carrée ;
- silo à grain (haut, métal galvanisé), silo-tour béton, tank à lait chromé, citerne à lisier ;
- tracteur avec remorque à fourrage, camion de ramassage du lait, camion à bétail ;
- caisse d'œufs, palette de bouteilles de vin, foudre, barrique, cuve inox ;
- étiquettes d'état en scène : épizootie (croix rouge sur l'enclos), alimentation insuffisante (auge vide).

## Marchandises (sprites de stock pour entrepôts, quais et camions : 64 x 64)

Matières brutes : bidon de lait cru, plateau d'œufs en vrac, demi-carcasses (bœuf, porc, volaille, agneau), balle de laine, rouleau de cuir brut, caisse de raisin.
Composants : caisse de viandes découpées, fût de vin.
Produits finis : brique de lait, boîte d'œufs, barquette de viande de bœuf, poulet, barquette de porc, gigot d'agneau, saucisson, pull en laine, bouteille de vin de table, bouteille de vin de grande réserve.
