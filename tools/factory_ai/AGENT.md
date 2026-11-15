# Sprites HD de l'usine : consignes pour Claude Code

Ce dossier produit les sprites « rendu maquette 3D » du jeu avec un modèle d'images local,
FLUX.2 [klein] 4B (licence Apache 2.0, usage commercial permis) piloté par mflux.
Deux rôles. Commence par déterminer le tien : `uname -sm`.

- `Darwin arm64` (le MacBook de Rémy) : tu es le **PRODUCTEUR**.
- Autre chose (session cloud, Linux) : tu es l'**INTÉGRATEUR**. mflux ne tourne pas chez toi,
  n'essaie pas de l'installer.

Le lien entre les agents est le dépôt, branche `assets/factory-sprites`. Personne ne copie-colle.
Fais `git pull` avant chaque lot et lis `RETOURS.md` s'il existe : il contient les corrections à appliquer.

## Ce que tu as le droit de faire sans demander

- Tout dans `tools/factory_ai/` et `assets/factory_hd/` : installer, générer, relancer, corriger les
  scripts, committer et pousser sur `assets/factory-sprites`.
- Ajuster `config.json` (taille, steps, quantize, texte du style) et les sujets dans `build_manifest.py`
  quand un rendu est raté. Note chaque changement dans `JOURNAL.md`.
- Décharger un modèle Ollama resté en mémoire (`--arreter-ollama`) si la génération dépasse 60 s par image.

## Ce que tu ne fais pas

- Ne modifie pas `assets/factory/` (gabarits procéduraux : ils fixent forme, angle, ancre, ombre).
- Ne touche pas au reste du dépôt, ne fusionne pas dans `master`.
- Ne change pas de modèle pour un modèle à licence non commerciale (FLUX.2 dev, klein 9B, Qwen-Image 2.x).
- Ne committe ni `.venv/` ni `travail/`.

## PRODUCTEUR : marche à suivre

1. `cd tools/factory_ai && ./install.sh` (premier lancement : téléchargement des poids, plusieurs Go).
2. Essai : `.venv/bin/python batch.py --lot test` (3 sprites). Ouvre la planche dans
   `assets/factory_hd/_apercus/` : à gauche le gabarit, à droite le rendu.
   - Si mflux refuse une option, `batch.py` la retire tout seul. Si une commande échoue encore,
     lis `mflux-generate-flux2-edit --help`, corrige `batch.py`, note-le dans `JOURNAL.md`.
   - Note dans `JOURNAL.md` les secondes par image (champ `secondes` de `etat.json`).
3. Committe et pousse l'essai, puis **arrête-toi** : Rémy valide le style sur la planche.
4. Après validation : copie 1 ou 2 rendus bruts réussis (`travail/brut/*.png`) dans `style/`,
   puis `.venv/bin/python batch.py --lot lot1`, ensuite `--lot lot2`.
   Committe et pousse après chaque planche d'aperçu (20 sprites).
5. Pour chaque lot, relis les planches toi-même. Refais (`--seul <nom> --forcer`, en changeant `seed`
   ou le sujet) tout sprite qui : change d'angle, sort du cadre, garde du fond, porte du texte ou un logo,
   ou jure avec ses voisins. Trois essais ratés : laisse-le, liste-le dans `JOURNAL.md`.
6. Les variantes de couleur ne se génèrent pas : elles se déclinent par code à partir d'un sprite validé.

Fin de lot : `JOURNAL.md` contient date, lot, nombre produit, échecs, secondes par image, changements faits.

## INTÉGRATEUR : marche à suivre

- Les sprites HD arrivent dans `assets/factory_hd/` avec le même contrat que `assets/factory/` :
  `<nom>.png`, `ombres/<nom>.png`, `ancres.json` (mêmes champs). Pour un sprite du lot 1, nom, cadrage
  et ancre sont ceux du gabarit à 1 px près : il se substitue sans retouche.
- Charge `assets/factory_hd/<nom>.png` s'il existe, sinon `assets/factory/<nom>.png`, sinon le vectoriel.
- Les sprites du lot 2 sont à l'échelle commune de 64 px par mètre ; certains dépassent 256 px
  (camions de 12 m : 1024 px), `ancres.json` donne la largeur réelle.
- Si un sprite pose un problème d'intégration (ancre, échelle, orientation), écris-le dans `RETOURS.md`
  à la racine de ce dossier, committe, pousse : le PRODUCTEUR le lira au prochain `git pull`.

## Fichiers

| Fichier | Rôle |
|---|---|
| `install.sh` | installe mflux, rembg, Pillow dans `.venv/` |
| `build_manifest.py` → `manifest.json` | liste des sprites : nom, sujet, gabarit, taille, lot |
| `config.json` | modèle, taille, steps, texte du style |
| `batch.py` | génération, détourage, cadrage sur l'ancre, ombre, planches, reprise |
| `etat.json` | avancement (créé au premier lot) |
| `style/` | 1 à 2 références de style validées |
