#!/bin/bash
# Installe la dernière version stable de Blender (GPL, officielle) dans ~/Applications, sans droits administrateur.
set -euo pipefail
DEST="$HOME/Applications"
BIN="$DEST/Blender.app/Contents/MacOS/Blender"
mkdir -p "$DEST"
if [ -x "$BIN" ]; then echo "Déjà installé :"; "$BIN" --version | head -n 1; exit 0; fi
[ "$(uname -s)" = "Darwin" ] && [ "$(uname -m)" = "arm64" ] || { echo "Mac Apple Silicon requis"; exit 1; }
BASE="https://download.blender.org/release"
REP=$(curl -fsSL "$BASE/" | grep -o 'Blender[0-9]*\.[0-9]*/' | sort -uV | tail -n 1)
echo "Dossier de version : $REP"
FICHIER=$(curl -fsSL "$BASE/$REP" | grep -o 'blender-[0-9.]*-macos-arm64\.dmg' | sort -uV | tail -n 1)
[ -n "$FICHIER" ] || { echo "Aucun .dmg macOS arm64 trouvé dans $REP"; exit 1; }
echo "Fichier : $FICHIER"
TMP=$(mktemp -d)
curl -fL --progress-bar -o "$TMP/$FICHIER" "$BASE/$REP$FICHIER"
VERSION=$(echo "$FICHIER" | sed 's/^blender-\(.*\)-macos-arm64\.dmg$/\1/')
if curl -fsSL -o "$TMP/sum" "$BASE/$REP""blender-$VERSION.sha256"; then
  ATTENDU=$(grep "$FICHIER" "$TMP/sum" | awk '{print $1}')
  REEL=$(shasum -a 256 "$TMP/$FICHIER" | awk '{print $1}')
  [ -n "$ATTENDU" ] && [ "$ATTENDU" = "$REEL" ] || { echo "Somme de contrôle incorrecte, arrêt."; exit 1; }
  echo "Somme de contrôle vérifiée."
else
  echo "Somme de contrôle introuvable : arrêt par prudence."; exit 1
fi
MNT="$TMP/montage"; mkdir -p "$MNT"
hdiutil attach -nobrowse -readonly -mountpoint "$MNT" "$TMP/$FICHIER" >/dev/null
cp -R "$MNT/Blender.app" "$DEST/"
hdiutil detach "$MNT" >/dev/null
rm -rf "$TMP"
"$BIN" --version | head -n 1
echo "Blender installé dans $DEST"
