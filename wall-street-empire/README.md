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
