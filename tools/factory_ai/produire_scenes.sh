#!/bin/bash
# Scènes haute définition sur le Mac : pull, brouillons (ou finale), commit, push. Voir SCENES.md.
# Usage : ./produire_scenes.sh brouillons [minutes]            -> planches de contact à regarder
#         ./produire_scenes.sh finale nom:graine [nom:graine…]  -> image finale (le plus grand format possible)
set -e
cd "$(dirname "$0")"
BRANCHE=assets/factory-sprites
[ "$(uname -sm)" = "Darwin arm64" ] || { echo "Ce script ne tourne que sur le Mac Apple Silicon."; exit 1; }
git checkout "$BRANCHE" && git pull --rebase origin "$BRANCHE"
[ -d .venv ] || ./install.sh
PHASE="${1:-brouillons}"; shift || true
if [ "$PHASE" = "brouillons" ]; then
  .venv/bin/python batch_scenes.py --phase brouillons --budget-min "${1:-45}"
else
  ARGS=(); for r in "$@"; do ARGS+=(--retenir "$r"); done
  .venv/bin/python batch_scenes.py --phase finale --budget-min 60 "${ARGS[@]}"
fi
cd ../..
git add assets/scenes_hd tools/factory_ai/JOURNAL.md
git commit -m "Scènes HD : $PHASE" || { echo "rien à committer"; exit 0; }
git push origin "$BRANCHE"
