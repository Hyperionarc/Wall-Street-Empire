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
   jure avec ses voisins, ou est orienté autrement que ne le dit `ORIENTATIONS.md`. Trois essais ratés : laisse-le, liste-le dans `JOURNAL.md`.
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
| `config.json` | modèle, taille, steps, texte du style, palette PNG |
| `ORIENTATIONS.md` | sens exact de chaque suffixe (nord_est, coin_ne, face, dos…) |
| `batch.py` | génération, détourage, cadrage sur l'ancre, ombre, planches, reprise |
| `etat.json` | avancement (créé au premier lot) |
| `style/` | 1 à 2 références de style validées |


## Phase 1 : l'usine, banc d'essai complet (état au 15 nov.)

Objectif : valider la vue Dessus de la méga-usine entièrement assemblée, pas des sprites isolés. Aucune image hors usine n'est générée avant le « oui » de Rémy.

- **Manifeste** : 139 entrées. `phase1` = `lot1` (33, gabarits procéduraux) + `lot2` (95) ; `optionnel` (11) : camions de dos, remorques, convoyeurs chargés (le jeu pose des pièces vides et anime les cartons lui-même). Ne pas les produire sans demande.
- **Gabarits** : tout sprite du lot 2 qui a un dessin dans le jeu part d'un gabarit exporté du vectoriel (`gabarits/gab_*.png`, ancre = centre de l'emprise au sol, 64 px par mètre dans la convention du jeu). Seuls restent libres : bras de robot, employés de bureau, ingénieur, petits accessoires. Si le jeu change un dessin : `python3 wall-street-empire/tools/build.py` puis `NODE_PATH=$(npm root -g) node tools/factory_ai/export_gabarits.js`, puis committer `gabarits/`.
- **PRODUCTEUR (Mac)** : `./produire.sh` (pull, lot suivant de 20 images, commit, push). `./produire.sh phase1 20` fait la même chose ; relancer enchaîne le lot suivant (les sprites `ok` sont sautés). Le script affiche `RETOURS.md` : appliquer ce qui y est écrit avant de produire. Premier lancement : `./produire.sh test` (3 sprites) et s'arrêter pour validation du style.
- **Contrôle de rendu** (chaque planche d'aperçu, avant de pousser) : même angle que le gabarit, objet entier et centré, pas de fond, pas de texte ni de logo, couleur de la marchandise reconnaissable (fer rouille, charbon noir, sable jaune...), style homogène avec les voisins. Refaire avec `--seul <nom> --forcer` (autre `seed`) ; trois échecs : lister dans `JOURNAL.md`.
- **INTÉGRATEUR (cloud)** : assemble la vue (`WSE_HD_DIR=<dossier> python3 wall-street-empire/tools/build.py`), contrôle ordre d'affichage, ancres, échelles, boucle de convoyeurs, camions au quai, ombres ; consigne les écarts dans `RETOURS.md` et la liste des images à refaire.
- Le jeu pose déjà les sprites HD de : machines par filière (`four_industriel`, `four_rotatif_ciment`, `reacteur_chimique`, `malaxeur_industriel`, `scie_industrielle`, `bobineuse_filature`, `ligne_conditionnement`), marchandises (une par bien), convoyeurs vides et coudes, camions `_face`. Murs, coins de mur, ouvriers HD, bras de robot, employés et accessoires seront branchés après la première planche validée.


## Scènes haute définition (centre de R&D, écrans immersifs)
Voir `SCENES.md` : `./produire_scenes.sh brouillons 45` puis choix de la graine sur la planche de contact, puis `./produire_scenes.sh finale <scène>:<graine>`. Jusqu'à une heure de calcul autorisée ; sortie `assets/scenes_hd/<scène>.jpg`.
