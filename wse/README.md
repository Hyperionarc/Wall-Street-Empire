# Wall Street Empire — prototype jouable (V0.4)

Ville isométrique de 64×64 cases avec campagne et gisements, gisements, chaîne de production complète et **fiches produits**, jouable dans le navigateur
(téléphone ou ordinateur). Ouvrir `city.html` : un seul fichier, sans serveur, sprites inclus.

## Ce que fait le jeu

**Ville et campagne** : la mairie quadrille la ville (zone centrale de 33×33 cases : une rue toutes les 4 cases, blocs de 3×3) et paie les rues.
Le promoteur y construit à côté d'une rue ; tout bâtiment (hors extraction) doit être dans la ville et toucher une rue.
Hors de la ville, il n'y a aucune route : puits et mines se posent sur les gisements en pleine campagne et fonctionnent sans route, mais à **65 %** de rendement.
En les reliant au réseau urbain par **ses propres routes** (outil Route ou outil Relier, 120 $ par tronçon, 0,4 $ par jour d'entretien), le rendement passe à **100 %**.
L'outil Relier trace automatiquement le plus court chemin, en réutilisant les routes déjà posées. Les rues de la ville ne peuvent ni être construites ni démolies par le joueur.

**Gisements** : pétrole, fer, charbon, cuivre et or. Trois blocs sont dans la ville de départ, les autres sont des amas irréguliers dans la campagne, avec une réserve limitée par case.

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

Pour régénérer : `python3 wse/tools/build.py` (nécessite Python 3 et Pillow).
Les visuels des produits sont des illustrations vectorielles dessinées dans le code (pas des photos).

## Vérifications

- Chaîne du lave-linge testée en navigateur : composants (acier, plastique, câbles, emballages, moteurs, cartes électroniques) puis produit fini.
- Ville et campagne : construction refusée hors de la ville (hors mines) et sur une rue ; une mine rurale passe de 65 % à 100 % une fois reliée.
- Un joueur automatique tient 600 jours sans valeur aberrante.

## Limites connues et pistes

- Un seul joueur contre l'économie : pas encore de multijoueur (cartel, Conseil, OPA du pitch).
- Les rivaux sont une pression abstraite par catégorie, pas des entreprises simulées.
- Les prix et rendements sont des premières valeurs, pas un équilibrage final.
- Le rendu reste stylisé (sprites Kenney) : pas de rendu photoréaliste.
