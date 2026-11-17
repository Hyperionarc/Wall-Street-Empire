#!/usr/bin/env python3
"""Phase 2 : produit les ~310 assets manquants listés dans phase2/prompts_assets.json (FLUX.2 klein 4B via mflux).
Quatre sortes d'assets, déduites du groupe et de la taille :
  scene  : 1920x1080 (scènes, vignettes cinéma)  -> JPEG q93, pas de détourage
  tuile  : 396x198 « ground tile »                -> texture vue de dessus, déformée en losange 2:1 (déterministe)
  photo  : guide_hd/...                           -> carré 768 redimensionné à 512, fond gris conservé
  objet  : tout le reste                          -> détourage BiRefNet, recadré, mis à la taille demandée (contain, bas-centre)
Sortie : assets/phase2_hd/<nom>.png|jpg ; aperçu : assets/phase2_hd/_apercus/<lot>.png ; état : travail/etat_phase2.json
Usage : .venv/bin/python batch_phase2.py --lot lot0 [--seul nom] [--limite N] [--forcer]
Lots : lot0, a_sol, a_port, b_extraction, b_commerces, b_decor, c_services, c_champs, c_vignettes, g_affleurements, g_mines, g_tas, guide
"""
import argparse, json, os, re, sys, time, subprocess
import numpy as np
from PIL import Image, ImageDraw

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.normpath(os.path.join(ICI, '..', '..'))
OUT = os.path.join(RACINE, 'assets', 'phase2_hd')
TRAV = os.path.join(ICI, 'travail', 'phase2')
ETAT = os.path.join(ICI, 'travail', 'etat_phase2.json')
CFG = json.load(open(os.path.join(ICI, 'config.json')))
EXE = os.path.join(ICI, '.venv', 'bin')
LOTS = {'lot0': 'Lot 0', 'a_sol': 'A · sol', 'a_port': 'A · port', 'b_extraction': 'B · extraction', 'b_commerces': 'B · commerces',
        'b_decor': 'B · décor', 'c_services': 'C · services', 'c_champs': 'C · champs', 'c_vignettes': 'C · vignettes',
        'g_affleurements': 'Gisements · affleurements', 'g_mines': 'Gisements · mines', 'g_tas': 'Gisements · tas', 'guide': 'Photos du Guide'}


def dims(t):
    m = re.match(r'(\d+)(?:x(\d+))?', t)
    w = int(m.group(1)); h = int(m.group(2) or w)
    return w, h


def sorte(a):
    w, h = dims(a['taille'])
    if a['groupe'].startswith('Photos'):
        return 'photo'
    if (w, h) == (1920, 1080):
        return 'scene'
    if (w, h) == (396, 198) and 'ground tile' in a['prompt']:
        return 'tuile'
    return 'objet'


def m16(v):
    return max(256, int(round(v / 16.0)) * 16)


def mflux(prompt, seed, w, h, sortie):
    base = [os.path.join(EXE, 'mflux-generate-flux2'), '--model', CFG['modele'], '--prompt', prompt, '--steps', str(CFG['steps']),
            '--seed', str(seed), '--output', sortie]
    opt = ['--width', str(w), '--height', str(h), '-q', str(CFG['quantize'])]
    os.makedirs(os.path.dirname(sortie), exist_ok=True)
    if os.path.exists(sortie):
        os.remove(sortie)
    r = subprocess.run(base + opt, capture_output=True, text=True)
    return (r.returncode == 0 and os.path.exists(sortie)), (r.stderr or r.stdout)[-600:]


_S = {}


def detoure(im):
    from rembg import remove, new_session
    if 's' not in _S:
        _S['s'] = new_session(CFG.get('detourage', 'birefnet-general'))
    return remove(im, session=_S['s']).convert('RGBA')


def prompt_tuile(a):
    p = a['prompt']
    p = re.sub(r'isometric 2:1 seamless ground tile seen from above at 30 degrees', 'flat top-down seamless ground texture, orthographic view straight from above, no perspective, no objects standing up', p)
    p = re.sub(r'diamond shaped tile filling the frame edge to edge', 'texture filling the whole square frame edge to edge', p)
    return p


def en_losange(img, w, h):
    """Carré vu de dessus -> losange 2:1 (haut, droite, bas, gauche) sur fond transparent."""
    S = img.width
    big = (w * 4, h * 4)
    src = np.array([(0, 0), (S, 0), (S, S), (0, S)], float)
    dst = np.array([(big[0] / 2, 0), (big[0], big[1] / 2), (big[0] / 2, big[1]), (0, big[1] / 2)], float)
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    co = np.linalg.solve(np.array(A), np.array(b))
    out = img.convert('RGBA').transform(big, Image.PERSPECTIVE, tuple(co), Image.BICUBIC)
    m = Image.new('L', big, 0)
    ImageDraw.Draw(m).polygon([(big[0] / 2, 0), (big[0] - 1, big[1] / 2), (big[0] / 2, big[1] - 1), (0, big[1] / 2)], fill=255)
    out.putalpha(m)
    return out.resize((w, h), Image.LANCZOS)


def contenir(spr, w, h):
    bb = spr.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
    spr = spr.crop(bb) if bb else spr
    k = min(w / spr.width, h / spr.height)
    spr = spr.resize((max(1, round(spr.width * k)), max(1, round(spr.height * k))), Image.LANCZOS)
    f = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    f.paste(spr, ((w - spr.width) // 2, h - spr.height), spr)
    return f


def produire(a, seed):
    nom = a['nom'].split('/')[-1]; k = sorte(a); w, h = dims(a['taille'])
    brut = os.path.join(TRAV, nom + '.png')
    if k == 'scene':
        ok, err = mflux(a['prompt'], seed, 1920, 1088, brut)
        if not ok:
            ok, err = mflux(a['prompt'], seed, 1536, 864, brut)
        if not ok: return False, err
        im = Image.open(brut).convert('RGB')
        im = im.crop((0, 0, im.width, round(im.width * 9 / 16))) if im.height > round(im.width * 9 / 16) else im
        im = im.resize((1920, 1080), Image.LANCZOS) if im.width != 1920 else im
        p = os.path.join(OUT, nom + '.jpg'); os.makedirs(OUT, exist_ok=True); im.save(p, quality=93); return True, p
    if k == 'photo':
        ok, err = mflux(a['prompt'], seed, 768, 768, brut)
        if not ok: return False, err
        p = os.path.join(OUT, 'guide', nom + '.jpg'); os.makedirs(os.path.dirname(p), exist_ok=True)
        Image.open(brut).convert('RGB').resize((512, 512), Image.LANCZOS).save(p, quality=90); return True, p
    if k == 'tuile':
        ok, err = mflux(prompt_tuile(a), seed, 768, 768, brut)
        if not ok: return False, err
        p = os.path.join(OUT, nom + '.png'); os.makedirs(OUT, exist_ok=True)
        en_losange(Image.open(brut).convert('RGB'), w, h).save(p); return True, p
    # objet : on génère à ~1024 de grand côté, au format demandé
    e = 1024.0 / max(w, h) if max(w, h) < 1024 else 1.0
    gw, gh = m16(w * e), m16(h * e)
    ok, err = mflux(a['prompt'], seed, gw, gh, brut)
    if not ok: return False, err
    spr = detoure(Image.open(brut).convert('RGB'))
    p = os.path.join(OUT, nom + '.png'); os.makedirs(OUT, exist_ok=True)
    contenir(spr, w, h).save(p); return True, p


def apercu(noms, chemin):
    ims = []
    for n in noms:
        for ext in ('.png', '.jpg'):
            p = os.path.join(OUT, n + ext) if os.path.exists(os.path.join(OUT, n + ext)) else os.path.join(OUT, 'guide', n + ext)
            if os.path.exists(p):
                ims.append((n, Image.open(p).convert('RGBA'))); break
    if not ims: return
    cell = 360; cols = min(4, len(ims)); rows = (len(ims) + cols - 1) // cols
    pl = Image.new('RGB', (cols * cell, rows * (cell + 16)), (122, 150, 110)); d = ImageDraw.Draw(pl)
    for i, (n, im) in enumerate(ims):
        k = min((cell - 8) / im.width, (cell - 8) / im.height); t = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.LANCZOS)
        x, y = (i % cols) * cell, (i // cols) * (cell + 16); pl.paste(t, (x + 4, y + 16 + (cell - t.height) // 2), t); d.text((x + 4, y + 2), n, fill=(255, 255, 255))
    os.makedirs(os.path.dirname(chemin), exist_ok=True); pl.save(chemin)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--lot'); ap.add_argument('--seul', action='append', default=[])
    ap.add_argument('--limite', type=int); ap.add_argument('--forcer', action='store_true'); o = ap.parse_args()
    data = json.load(open(os.path.join(ICI, 'phase2', 'prompts_assets.json')))
    sel = [a for a in data if (not o.lot or a['groupe'].startswith(LOTS[o.lot]))]
    if o.seul: sel = [a for a in data if a['nom'].split('/')[-1] in o.seul]
    etat = json.load(open(ETAT)) if os.path.exists(ETAT) else {}
    fait = []; t0 = time.time(); n = 0
    for a in sel:
        nom = a['nom'].split('/')[-1]
        if not o.forcer and etat.get(nom, {}).get('ok'): continue
        if o.limite and n >= o.limite: break
        t1 = time.time(); ok, info = produire(a, CFG['seed']); n += 1
        etat[nom] = {'ok': ok, 'sorte': sorte(a), 'sec': round(time.time() - t1), 'info': info if not ok else os.path.relpath(info, RACINE)}
        json.dump(etat, open(ETAT, 'w'), indent=1, ensure_ascii=False)
        print(('OK ' if ok else 'ECHEC ') + nom, sorte(a), round(time.time() - t1), 's', '' if ok else info[-200:], flush=True)
        if ok: fait.append(nom)
    if fait: apercu(fait, os.path.join(OUT, '_apercus', (o.lot or 'seul') + '.png'))
    print('Terminé :', len(fait), 'produits en', round(time.time() - t0), 's'); 


if __name__ == '__main__':
    main()
