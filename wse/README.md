# Wall Street Empire — prototype jouable (V0.4)

Ville isométrique de 64×64 cases avec réseau de rues, gisements, chaîne de production complète et **fiches produits**, jouable dans le navigateur
(téléphone ou ordinateur). Ouvrir `city.html` : un seul fichier, sans serveur, sprites inclus.

## Ce que fait le jeu

**Une ville déjà viabilisée** : la ville fournit un réseau de rues qui court jusqu'aux bords de la carte (une rue toutes les 4 cases, blocs de 3×3).
Le joueur est un promoteur : il construit à côté des rues, sans en tracer. Un bâtiment doit toucher une rue.

**Gisements** : pétrole, fer, charbon, cuivre et or, dans des blocs de la carte, avec une réserve limitée par case.

**Chaîne de production** (cartographiée dans la fiche de chaque produit) :

```
Gisements ─▶ Puits / Mines ─▶ matières premières ─▶ Fonderie d'or / Usines ─▶ composants ─▶ produit fini + emballage ─▶ Commerces ─▶ Habitants
```

| Niveau | Bâtiments |
|---|---|
| Extraction | Puits de pétrole, mines de fer, de charbon, de cuivre, d'or (à poser sur un gisement du bon type) |
| Fonderie | Fonderie d'or : or brut ➜ lingots |
| Usines (niveau d'atelier) | Petite (1×1, niveau 1), Moyenne (2×1, niveau 2), Grande (2×2, niveau 3). Chaque usine fabrique un composant ou un produit affecté, sinon une marchandise générique |
| Commerces | Petit marché (1×1), Supermarché (2×1), Hypermarché (2×2) : chacun ne vend que ses catégories |
| Ville | Logements (étages), Tour Tech, Banque |

**Composants** (9) : acier, plastique, câbles de cuivre, emballages (niveau 1) ; moteurs, batteries, cartes électroniques, boîtiers en or (niveau 2) ; écrans (niveau 3).
Chacun a un prix de marché qui varie avec l'offre et la demande, comme les matières premières et les marchandises (18 au total).

**Fiche produit** (vue Produits) : visuel du produit, choix de la **gamme** (Premier prix, Premium, Haut de gamme : qualité, prix de référence, intrants et R&D différents),
choix de l'**emballage** (vrac, carton, coffret premium : consomme le composant « Emballages »), liste des **éléments nécessaires** par cycle, caractéristiques (coût des composants, marge),
**arbre de la chaîne d'approvisionnement** avec les maillons manquants en rouge, tableau des capacités requises, et configuration automatique de la chaîne.
7 produits : ustensiles de cuisine, jouets, vélo, lave-linge (acier, moteur, plastique, carte électronique), téléviseur, smartphone, montre de luxe.
Les habitants répartissent leur demande entre la marchandise générique, les produits lancés et des marques rivales, selon qualité, prix, emballage et notoriété.

**Économie de la ville** : emplois (55 % des habitants travaillent), humeur, impôt réglable, banque qui dope les entreprises, amélioration des bâtiments, événements (goulots, boom boursier). La saison est fixée à l'été.

**Paliers** (sur la capitalisation) : Citoyen, Entrepreneur (40 k$), Industriel (150 k$), Magnat (500 k$), Oligarque (1,5 M$), avec des missions.

## Commandes

| Action | Tactile | Souris / clavier |
|---|---|---|
| Construire | choisir une catégorie puis un outil, toucher une case | clic |
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

Pour régénérer : `python3 wse/tools/build.py` (nécessite Python 3 et Pillow).
Les visuels des produits sont des illustrations vectorielles dessinées dans le code (pas des photos).

## Vérifications

- Chaîne du lave-linge testée en navigateur : composants (acier, plastique, câbles, emballages, moteurs, cartes électroniques) puis produit fini.
- Réseau de rues : construction refusée sur une rue ou un gisement.
- Un joueur automatique tient 600 jours sans valeur aberrante.

## Limites connues et pistes

- Un seul joueur contre l'économie : pas encore de multijoueur (cartel, Conseil, OPA du pitch).
- Les rivaux sont une pression abstraite par catégorie, pas des entreprises simulées.
- Les prix et rendements sont des premières valeurs, pas un équilibrage final.
- Le rendu reste stylisé (sprites Kenney) : pas de rendu photoréaliste.
