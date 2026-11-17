# Référence de style : « Manufacturing Unit »

`manufacturing_unit.png` est le rendu validé par Rémy le 15 novembre 2026 (machine d'assemblage, FLUX.2 klein 4B, graine 42).
C'est la base standard de toutes les usines du jeu : miniature 3D lisse, aspect jouet, lumière douce venant du haut-gauche,
couleurs franches, fond gris uni, aucun texte.

- Sprites avec gabarit : le style sort déjà ainsi, la référence n'est pas passée au modèle (elle risquerait de déformer la silhouette).
- Sprites sans gabarit : `batch.py` passe cette image au modèle comme référence de style.
- Ne pas mettre plus de 2 images dans ce dossier.

## Asset « manufacturing_unit »
`assets/factory_hd/manufacturing_unit.png` (avec `ombres/manufacturing_unit.png` et son ancre dans `ancres.json`) est la machine type validée, enregistrée comme asset sous le nom Manufacturing Unit. C'est l'unité standard à déployer partout. Les machines des autres filières reprennent sa base (plateforme grise, liserés jaune et noir) et son style, avec une forme propre à leur métier.
