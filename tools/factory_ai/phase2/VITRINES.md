# Phase 2 : visuels vitrine (9 images, comptées dans les 400)

Ce sont des scènes, pas des sprites : plusieurs objets autorisés, rendu maquette identique (`CHARTE.md`), lumière haut-gauche, **toujours sans texte ni logo** (titres et boutons ajoutés par le jeu ou le site). Génération 1536 x 864 en rendu libre (`consigne_libre`, références = sprites validés des lots 1 à 9), puis agrandissement non génératif à 1920 x 1080 (Lanczos). Cadrage : vue isométrique 2:1, caméra 30 degrés, horizon peu visible, ciel d'un dégradé clair uni (seul cas où un fond n'est pas gris : à retirer ou garder selon l'usage).

Les scènes sont composées avec les mêmes familles que la carte : le plus sûr est de donner au modèle un montage des sprites validés comme gabarit d'édition (script d'assemblage à écrire côté producteur), puis de laisser le modèle unifier l'éclairage. Rang : fabriquer la vitrine 1 au lot L04, les autres au lot L20.

| # | Nom (`vitrines/...`) | Sujet | Cadrage | Taille finale | Usage |
|---|---|---|---|---|---|
| 1 | `accueil_port` | Zone portuaire au lever du jour : quai, grues rouges, 2 navires porte-conteneurs, piles de conteneurs, 2 entrepôts, une petite usine fumante au fond, routes et 3 camions ; c'est la vue du départ (`START` 74, 63) | plan large 3/4 haut, composition en diagonale, zone libre à gauche pour le titre | 1920 x 1080 | écran d'accueil (`#hint`, « Bienvenue à New Dollarton ») |
| 2 | `ville_ensemble` | Vue d'ensemble de New Dollarton : maisons au premier plan, immeubles, tours de verre au centre, port et mer à l'arrière-plan | plan très large, caméra haute, profondeur sur 3 plans | 1920 x 1080 | page de présentation, fond de menu |
| 3 | `centre_affaires` | Centre-ville d'affaires : siège social doré (`hq`), banque en pierre, 3 tours de verre (bleu, vert, sombre), avenue avec voitures | plan moyen, bâtiment principal à droite du tiers | 1920 x 1080 | catégories Bureaux, Direction |
| 4 | `zone_industrielle` | Quartier industriel : méga-usine `f4` niveau 3, grandes usines `f3`, cheminées, cuves, entrepôts, camions | plan moyen, `f4` au centre | 1920 x 1080 | catégorie Usines |
| 5 | `campagne_fermes` | Campagne : fermes de blé, canne, coton, hévéa (champs en 3 stades), hangars rouges, silos, tracteurs, route rurale | plan large, champs en bandes de couleur | 1920 x 1080 | catégorie Fermes (`agriculteur`) |
| 6 | `mines_et_puits` | Extraction : mine de fer et de charbon, puits de pétrole, mine d'or, tas de minerai, route d'accès | plan moyen, relief et roche visibles | 1920 x 1080 | catégories Énergie, Métaux |
| 7 | `port_et_logistique` | Terminal portuaire niveau 3 : grues, piles de conteneurs de 7 couleurs, navire à quai, entrepôt, camions en file | plan rapproché, grue en premier plan | 1920 x 1080 | catégorie Logistique |
| 8 | `energie_reseau` | Centrale à charbon, parc solaire, 3 éoliennes, centrale nucléaire, pylônes et lignes | plan large, éoliennes en fond | 1920 x 1080 | catégorie Centrales |
| 9 | `chaine_complete` | Chaîne de valeur : mine, camion, usine, entrepôt, supermarché, quartier de maisons, de gauche à droite, relié par une même route | bandeau panoramique 16:9, lecture gauche-droite | 1920 x 1080 | page « comment jouer », trailer |

Interdits propres aux vitrines : pas de personnages en gros plan, pas de panneaux lisibles, pas de marque réelle, pas d'interface de jeu (elle est ajoutée ensuite).
