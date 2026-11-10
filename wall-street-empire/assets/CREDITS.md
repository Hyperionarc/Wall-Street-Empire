# Crédits des assets graphiques

Tous les sprites utilisés sont sous licence **CC0 (domaine public)**, téléchargés depuis OpenGameArt.org.
Les crédits ne sont pas obligatoires, mais ils sont donnés par courtoisie.

| Pack | Auteur | Source | Usage dans le jeu |
|---|---|---|---|
| Isometric City | Kenney (kenney.nl) | https://opengameart.org/content/isometric-city | sol, routes (auto-raccordement), arbres |
| Isometric Buildings #1 | Kenney (kenney.nl) | https://opengameart.org/content/isometric-buildings-1 | logements et tours (étages empilés par le jeu), commerces, usine et raffinerie (bloc + toit industriel assemblés) |
| Isometric Vehicles #1 | Kenney (kenney.nl) | https://opengameart.org/content/isometric-vehicles-1 | voitures et camions de la circulation |

Les fichiers d'origine retenus sont dans `assets/src/`, avec les fichiers `License.txt` des packs Kenney.
`tools/build.py` assemble ces sprites en un atlas (`atlas.png` + `atlas.json`) puis génère `city.html`.

Un autre pack a été repéré mais non utilisé : le site kenney.nl refuse les accès automatisés, les packs ont donc été
récupérés via les pages OpenGameArt correspondantes.
Aucun pack libre d'usine isométrique n'a été trouvé : les usines sont assemblées à partir d'un grand bloc et
d'un toit industriel Kenney.
