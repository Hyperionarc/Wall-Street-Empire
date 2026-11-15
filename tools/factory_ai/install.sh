#!/usr/bin/env bash
# Installe le générateur local (mflux + FLUX.2 klein 4B, Apache 2.0) sur un Mac Apple Silicon.
set -euo pipefail
cd "$(dirname "$0")"
if [[ "$(uname -s)" != "Darwin" || "$(uname -m)" != "arm64" ]]; then
  echo "ERREUR : mflux exige un Mac Apple Silicon. Ici : $(uname -sm). Voir AGENT.md, rôle INTÉGRATEUR." >&2; exit 2
fi
# macOS livre Python 3.9 ; mflux exige 3.10+. uv installe son propre Python 3.12 sans toucher au système.
export PATH="$HOME/.local/bin:$PATH"
if ! command -v uv >/dev/null 2>&1; then
  echo "uv absent : installation (script officiel astral.sh, dans ~/.local/bin)..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi
command -v uv >/dev/null 2>&1 || { echo "ERREUR : uv n'a pas pu être installé. Message ci-dessus à transmettre." >&2; exit 3; }
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -U mflux "rembg[cpu]" pillow numpy
.venv/bin/mflux-generate-flux2 --help >/dev/null && echo "OK : mflux installé. Essai : .venv/bin/python batch.py --lot test"
