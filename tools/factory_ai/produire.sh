#!/bin/bash
# Un lot de production sur le Mac : pull, génération, commit, push. Aucune décision à prendre.
# Usage : ./produire.sh [lot] [nombre d'images]      (défaut : phase1, 20 images ; relancer pour enchaîner : les sprites déjà produits sont sautés)
set -e
cd "$(dirname "$0")"
BRANCHE=assets/factory-sprites
[ "$(uname -sm)" = "Darwin arm64" ] || { echo "Ce script ne tourne que sur le Mac Apple Silicon."; exit 1; }
git checkout "$BRANCHE" && git pull --rebase origin "$BRANCHE"
[ -d .venv ] || ./install.sh
[ -f RETOURS.md ] && echo "--- RETOURS.md (à appliquer avant de produire) ---" && tail -n 40 RETOURS.md
.venv/bin/python batch.py --lot "${1:-phase1}" --limite "${2:-20}" --arreter-ollama
cd ../..
git add assets/factory_hd tools/factory_ai/etat.json tools/factory_ai/JOURNAL.md
git commit -m "Sprites HD usine : lot ${1:-phase1}, ${2:-20} images" || { echo "rien à committer"; exit 0; }
git push origin "$BRANCHE"
