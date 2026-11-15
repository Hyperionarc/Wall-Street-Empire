#!/usr/bin/env bash
# Installe le générateur local (mflux + FLUX.2 klein 4B, Apache 2.0) sur un Mac Apple Silicon.
set -euo pipefail
cd "$(dirname "$0")"
if [[ "$(uname -s)" != "Darwin" || "$(uname -m)" != "arm64" ]]; then
  echo "ERREUR : mflux exige un Mac Apple Silicon. Ici : $(uname -sm). Voir AGENT.md, rôle INTÉGRATEUR." >&2; exit 2
fi
if command -v uv >/dev/null 2>&1; then
  uv venv --python 3.12 .venv
  uv pip install --python .venv/bin/python -U mflux "rembg[cpu]" pillow numpy
else
  PY=""; for c in python3.12 python3.11 python3.10 python3; do
    if command -v $c >/dev/null 2>&1 && $c -c 'import sys; sys.exit(0 if sys.version_info>=(3,10) else 1)'; then PY=$c; break; fi; done
  [[ -n "$PY" ]] || { echo "ERREUR : Python >= 3.10 introuvable. Installer uv (brew install uv) puis relancer." >&2; exit 3; }
  $PY -m venv .venv
  .venv/bin/pip install -U pip
  .venv/bin/pip install -U mflux "rembg[cpu]" pillow numpy
fi
.venv/bin/mflux-generate-flux2 --help >/dev/null && echo "OK : mflux installé. Essai : .venv/bin/python batch.py --lot test"
