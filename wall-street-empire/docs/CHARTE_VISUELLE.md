# Charte visuelle — Wall Street Empire

Objectif : une ville **lisible et sobre** (références : Capitalism Lab, SimCity), jamais bariolée.

## Structure de couleurs
- **Sol / nature** : verts désaturés (saturation HSV ≤ 0.45), un seul vert de base + 2 variantes de luminosité. Terre : bruns neutres.
- **Bâtiments** : murs en neutres chauds/froids (béton, brique pâle, verre bleuté). Une seule teinte d'accent par famille (commerce = bleu, industrie = gris-acier, services = blanc + accent discret).
- **Toits** : gris / terre cuite / ardoise. Pas de primaires saturées. Pictogrammes de service : petits, saturation ≤ 0.6.
- **Véhicules** : blanc, gris, noir, 1 accent sobre ; angle isométrique 2:1 identique aux bâtiments.
- **Eau** : bleu-gris profond, pas de cyan fluo.
- **Règle d'or** : max 1 couleur saturée par sprite, et jamais plus de 15 % de sa surface.

## Géométrie
- Pente des arêtes de dalle 0,50 (2:1) ± 0,03 ; mesure via `tools/factory_ai/asset_qa.py`.
- Éclairage identique partout : lumière haut-gauche, ombre bas-droite ; flanc gauche (face sud-ouest) clair, flanc droit (face sud-est) sombre. Vérifié par `tools/tests/t80_orientation.js` ; les sprites rendus lumière à droite et sans texte sont retournés au build (`P2_FLIP`, passe 78).
- Routes : bitume + trottoirs (les pièces à centre transparent exigent un fond d'asphalte).
- Variantes d'un même sol (herbe, terre) : visiblement distinctes mais de même teinte.

## Barre de qualité
Pas de bords crénelés ni de halo, ancrage correct, empreinte = cases du jeu, détails lisibles à zoom 1.
Encodage : pas de palette réduite (taches sur les toits plats, passe 78) — WebP pleine définition, contrôlé par `tools/tests/t81_encodage.js`.
Le build applique un gradeur de saturation doux pour garantir l'unité même si un rendu dérive.
