# RETOURS de l'intégrateur (session cloud) au producteur

Intégration faite sur la branche `ccr-d9ba3623-415kh0` (pas dans master) : `tools/build.py` lit `assets/factory_hd/` en priorité, `assets/factory/` en repli (embarqué aussi, utilisé si le PNG HD est illisible), puis le vectoriel. Les noms du lot 2 sont reconnus. Test : `wall-street-empire/tools/tests/t15_sprites_hd.js`.
Aucun sprite HD n'existe encore : les points ci-dessous viennent de la lecture du manifeste et du code, pas d'un rendu observé. Je les vérifierai sur les vrais PNG.

## À corriger côté producteur

1. **Planches d'ouvriers du lot 1 jamais assemblées.** `manifest.json` ne déclare dans `planches` que `ouvrier_h1 … ouvrier_f3` (lot 2). Or le jeu charge `ouvrier_gilet_orange.png` et `ouvrier_gilet_bleu.png` (planches de 4 vignettes 128x200, ordre marche, porte_carton, machine, debout). Les poses lot 1 `poses/ouvrier_gilet_*_*` seraient produites, mais aucune planche portant ce nom : le jeu ne verrait jamais les ouvriers HD. Ajouter ces deux entrées dans `planches` (dans `build_manifest.py` aussi, pour qu'elles survivent à une régénération).
2. **Orientation des noms du lot 2.** `nord_est`, `sud_est`, `ne`, `nw`, `se`, `sw`, `face`, `dos` ne disent pas quelle direction d'écran ils désignent. Dans le jeu, l'axe x va vers le bas-droite de l'écran et l'axe y vers le bas-gauche. Écrire dans `manifest.json` (ou `config.json`) la correspondance exacte, par exemple « nord_est = vers le haut-droite de l'écran » : sans elle, je risque de poser les convoyeurs et murs à l'envers.
3. **Pas de miroir côté jeu pour le lot 2.** Le jeu sait retourner un sprite autour de son ancre (`fl`), mais je ne l'utiliserai pas pour fabriquer une orientation manquante : chaque orientation du lot 2 doit être un sprite à part (c'est déjà le cas dans le manifeste), avec la même ancre au sol.

## Points à surveiller à la première planche

- **Ancre et échelle :** un sprite du lot 1 doit tomber à 1 px du gabarit (`largeur`, `hauteur`, `ancre_x`, `ancre_y`, `echelle_px_par_m` identiques ou très proches). Le jeu s'en sert tels quels : une dérive de l'ancre décale l'objet sur sa case.
- **Poids :** `build.py` embarque chaque PNG en base64 dans `city.html` (3,7 Mo aujourd'hui avec les 29 gabarits). 119 sprites HD, dont des camions de 1024 px, peuvent doubler le fichier. Passer les PNG par une quantification (palette 256 couleurs) ou `oxipng` avant de pousser, et dire si un sprite dépasse 150 Ko.
- **Ombres :** `ombres/<nom>.png` doit avoir la même taille que le sprite ; sinon elle est dessinée décalée.

## Réponses (15 nov., auteur du kit)

1. **Planches du lot 1 : corrigé.** `ouvrier_gilet_orange` et `ouvrier_gilet_bleu` sont déclarées dans `planches` (`build_manifest.py` et `manifest.json`) et assemblées à la fin de chaque lot.
2. **Orientations : écrites dans `ORIENTATIONS.md`**, en directions d'écran et dans le repère du jeu. Les consignes du manifeste reprennent ces directions.
3. **Pas de miroir : confirmé.** Chaque orientation est un sprite à part. Quatre d'entre elles réutilisent un gabarit du lot 1 ; les autres n'ont pas de gabarit et sont à vérifier à la première planche.
4. **Poids : PNG en palette 256 couleurs** (`png_couleurs` dans `config.json`), sprites et ombres. `batch.py` signale tout fichier de plus de 150 Ko et vérifie que l'ombre a la taille du sprite.
