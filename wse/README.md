# Wall Street Empire — prototype jouable (V0.3)

Ville isométrique de 64×64 cases avec gisements, extraction, industrie, commerces et **produits finis**, jouable dans le navigateur
(téléphone ou ordinateur). Ouvrir `city.html` : un seul fichier, sans serveur, sprites inclus.

## Ce que fait le jeu

**Carte** : 64×64 = 4 096 cases (SimCity 2000 en proposait 128×128). Des gisements de pétrole, fer, charbon, cuivre et or sont répartis sur la carte, avec une réserve limitée
par case. Une minimap permet de naviguer.

**Chaîne de production**

```
Gisements ─▶ Puits / Mines ─▶ matières premières ─▶ Fonderie / Usines ─▶ marchandises ou produits finis ─▶ Commerces ─▶ Habitants ─▶ travail et impôts
```

| Catégorie | Bâtiments | Notes |
|---|---|---|
| Extraction | Puits de pétrole, mines de fer, de charbon, de cuivre, d'or | à poser sur un gisement du bon type ; la réserve s'épuise |
| Fonderie | Fonderie d'or | or brut ➜ lingots (palier Entrepreneur) |
| Usines | Petite (1×1), Moyenne (2×1), Grande (2×2) | biens de base, manufacturés, de luxe ; recettes à plusieurs intrants |
| Commerces | Petit marché (1×1), Supermarché (2×1), Hypermarché (2×2) | chaque type ne vend que ses catégories |
| Ville | Logements (étages), Tour Tech, Banque | paliers Entrepreneur et Industriel |

**Marchandises** (9, avec prix variables selon l'offre et la demande) : pétrole, fer, charbon, cuivre, or brut, lingots d'or, biens de base, biens manufacturés, produits de luxe.

**Vue Produits** (comme dans Capitalism Lab) : 7 produits finis à développer (ustensiles, jouets, vélo, lave-linge, téléviseur, smartphone, montre de luxe).
- Choisir un niveau de qualité (économique, standard, premium), payer la R&D, attendre le lancement.
- Affecter des usines compatibles au produit, fixer le prix (60 à 160 % du prix de référence), régler la publicité.
- Les habitants répartissent leur demande entre la marchandise générique, vos produits et des marques rivales, selon la qualité, le prix et la notoriété.
- Suivre part de marché, notoriété, ventes, production, stock et chiffre d'affaires de chaque produit.

**Économie de la ville** : emplois (55 % des habitants travaillent), humeur (biens disponibles, chômage, pollution, impôt), impôt réglable, banque qui dope les entreprises,
amélioration des bâtiments, événements (goulots, boom boursier). La saison est fixée à l'été.

**Paliers** (sur la capitalisation) : Citoyen, Entrepreneur (40 k$), Industriel (150 k$), Magnat (500 k$), Oligarque (1,5 M$). Dix-neuf missions guident la progression.

## Commandes

| Action | Tactile | Souris / clavier |
|---|---|---|
| Construire | choisir une catégorie puis un outil, toucher une case | clic |
| Tracer des routes | outil Route, glisser : le tracé reste en ligne droite sur l'axe choisi | clic maintenu |
| Raccorder un bâtiment | outil Relier, toucher le bâtiment : route par le plus court chemin | clic |
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
| `tools/vehicle_frames.json` | numéro d'image de chaque direction des véhicules |
| `assets/` | sprites sources (CC0), atlas généré, `CREDITS.md` |

Pour régénérer : `python3 wse/tools/build.py` (nécessite Python 3 et Pillow).

## Vérifications

- Un joueur automatique tient 600 jours sans valeur aberrante ni effondrement (les gisements s'épuisent vers le jour 500).
- Le flux produit (développement, affectation, ventes, part de marché) est testé en navigateur.
- Les gestes tactiles (poser, tracer, démolir, déplacer, zoomer) fonctionnent sur téléphone.

## Limites connues et pistes

- Un seul joueur contre l'économie : pas encore de multijoueur, de cartel, de Conseil ni d'OPA (voir le pitch).
- Les rivaux sont une pression abstraite par catégorie, pas des entreprises simulées.
- Les prix et rendements sont des premières valeurs, pas un équilibrage final.
- Les véhicules ne sont pas toujours parfaitement orientés selon leur sens de marche.
- Le rendu reste stylisé (sprites Kenney) : pas de rendu photoréaliste.
