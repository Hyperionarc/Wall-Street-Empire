#!/bin/sh
# Version publiable (< 16 Mo) : WebP qualité 80 + PNG intégrés recompressés en WebP. Usage : tools/build_pub.sh <sortie.html>
set -e
OUT="$1"; TMP="$(mktemp)"
WSE_P2_Q=${WSE_PUB_Q:-80} WSE_OUT="$TMP" python3 "$(dirname "$0")/build.py" >/dev/null
python3 - "$TMP" "$OUT" <<'PY'
import re,base64,io,sys
from PIL import Image
s=open(sys.argv[1],encoding='utf-8').read()
def f(m):
    raw=base64.b64decode(m.group(1))
    if len(raw)<3000: return m.group(0)
    im=Image.open(io.BytesIO(raw))
    if im.mode=='P': im=im.convert('RGBA')
    bf=io.BytesIO()
    if len(raw)<80000: im.save(bf,'WEBP',lossless=True,method=4)
    else: im.save(bf,'WEBP',quality=int(__import__('os').environ.get('WSE_PUB_PQ','88')),alpha_quality=100,method=4)
    o='data:image/webp;base64,'+base64.b64encode(bf.getvalue()).decode()
    return o if len(o)<len(m.group(0)) else m.group(0)
s=re.sub(r'data:image/png;base64,([A-Za-z0-9+/=]+)',f,s)
def g(m):   # tuiles de sol en JPEG : qualité réduite pour la version publiable
    raw=base64.b64decode(m.group(1)); im=Image.open(io.BytesIO(raw)).convert('RGB'); bf=io.BytesIO(); im.save(bf,'JPEG',quality=int(__import__('os').environ.get('WSE_PUB_JQ','68')),optimize=True)
    o='data:image/jpeg;base64,'+base64.b64encode(bf.getvalue()).decode(); return o if len(o)<len(m.group(0)) else m.group(0)
s=re.sub(r'data:image/jpeg;base64,([A-Za-z0-9+/=]+)',g,s)
open(sys.argv[2],'w',encoding='utf-8').write(s); print(len(s))
PY
rm -f "$TMP"
