#!/bin/bash
# Pousse vers GitHub les sprites HD déjà produits (à lancer via le poste : {"type": "pousser"}).
set -e
cd "$(dirname "$0")/../.."
git add .gitignore assets/factory_hd assets/scenes_hd assets/guide_hd tools/factory_ai/etat.json tools/factory_ai/JOURNAL.md 2>/dev/null || true
if git diff --cached --quiet; then
  echo "Rien de nouveau à commiter."
else
  git commit -q -m "Sprites HD : nouveaux fichiers produits sur le Mac

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GArnKYW6kkDaRqVDc5pfp5"
fi
git pull --rebase origin assets/factory-sprites
git push origin assets/factory-sprites
echo "Poussé."
