# Scènes haute définition : consignes pour le Claude Code du Mac

But : produire les plus belles images possibles (rendu de jeu 3D réaliste, 16:9, sans texte ni logo) pour les écrans immersifs du jeu : centre de R&D avec une voiture au centre (référence : un garage de jeu de course, sol mouillé, néons, briques), halle de robots, labo de smartphone, atelier de jouets. Temps autorisé : jusqu'à une heure par exécution. Modèle imposé : FLUX.2 klein 4B (Apache 2.0). Rien dans `master`.

Pourquoi deux phases : le modèle est distillé (4 pas). Plus de pas n'améliore guère ; ce qui améliore le résultat, ce sont **les graines** (tirer beaucoup de variantes pas chères, garder la meilleure) puis **la résolution** (raffiner la gagnante à la plus grande taille que la mémoire accepte).

## Marche à suivre

1. `git checkout assets/factory-sprites && git pull`, lire `RETOURS.md`.
2. **Brouillons** : `tools/factory_ai/produire_scenes.sh brouillons 45` (45 minutes de budget, 8 graines par scène en 1024x576). Il pousse les planches de contact `assets/scenes_hd/_apercus/brouillons_<scène>.jpg`.
3. **Choisir** : ouvrir chaque planche (tu sais lire les images) et retenir, par scène, la graine qui respecte : sujet reconnaissable (pour `rd_garage_voiture` : une voiture entière et bien dessinée au centre, sur la plateforme lumineuse), lumière cohérente, **aucun texte, chiffre, logo ni écriture parasite**, mains et visages propres, pas de membre ou de roue en trop, composition aérée. Note la graine : elle est dans le nom du fichier (`<scène>__<graine>.png`).
4. **Finale** : `tools/factory_ai/produire_scenes.sh finale rd_garage_voiture:<graine> [autre:<graine>…]`. Le script raffine la gagnante en 2048x1152 (repli 1792x1008 puis 1536x864 si la mémoire refuse), 3 essais, JPEG qualité 93 dans `assets/scenes_hd/<scène>.jpg`, et pousse avec une planche des finales.
5. Relire les finales. Si une est ratée : relancer avec une autre graine retenue (`finale scène:<autre graine>`), ou ajuster le sujet dans `scenes.json` et relancer les brouillons de cette scène (`--scene`, option `--forcer`).
6. Consigner dans `JOURNAL.md` (le script ajoute une ligne) : temps par image, taille atteinte, graines retenues, ce qui a marché dans la consigne (ex. « platform light strip » donne bien la plateforme), ce qui a échoué.

## Réglages à essayer si le rendu est décevant (noter chaque changement dans `JOURNAL.md`)
- Ajouter des détails au `sujet` : matière du sol (« wet polished concrete with reflections »), type de voiture, angle (« three quarter front view, low camera »), éclairage (« neon strip lights, volumetric haze »).
- Augmenter `brouillon.seeds` (16) pour la scène principale : c'est là que le temps rapporte.
- `config.json` : `quantize` 8 → 4 plus rapide mais moins fin ; essayer 8 sans changer les pas.
- Ne pas changer de modèle (licences non commerciales exclues : FLUX.2 dev, klein 9B, Qwen-Image 2.x).

## Où ça sert
`assets/scenes_hd/rd_garage_voiture.jpg` est le décor du Studio R&D : fond de la vue de customisation (voiture au centre, onglets et fiche posés par le jeu en HTML par-dessus : pas de texte dans l'image). Les autres servent de fonds de famille (smartphone, jouet) et d'écrans de présentation.
