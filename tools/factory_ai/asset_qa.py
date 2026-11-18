#!/usr/bin/env python3
"""Contrôle qualité des sprites isométriques : angle de caméra (pente des arêtes basses du losange, attendue 0,5 en projection 2:1),
débordement hors de la parcelle (pixels opaques hors du losange élargi de l'épaisseur de dalle), image coupée au bord, parcelle non centrée.
Usage : python3 tools/factory_ai/asset_qa.py [dossier ...]   (défaut : assets/factory_hd assets/phase2_hd)  ->  tableau + JSON dans stdout / --json fichier"""
import sys, os, json
from PIL import Image
import numpy as np

def analyse(path):
    im = Image.open(path).convert('RGBA'); a = np.array(im.getchannel('A')) > 40; h, w = a.shape
    if a.sum() < 50: return None
    ys, xs = np.where(a); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    ext = np.full((h, 2), -1)
    for y in range(h):
        r = np.where(a[y])[0]
        if len(r): ext[y] = (r.min(), r.max())
    wid = ext[:, 1] - ext[:, 0]; wid[ext[:, 0] < 0] = 0; mw = wid.max(); rows = np.where(wid >= mw - 3)[0]; ym = rows.mean(); xl = ext[rows, 0].min(); xr = ext[rows, 1].max()
    # pente des arêtes basses : régression x(y) sur le tiers central de la demi-hauteur basse
    yb = y1; span = yb - ym
    sel = [y for y in range(int(ym + 0.25 * span), int(ym + 0.7 * span)) if wid[y] > 0]
    slope = None
    if len(sel) > 6:
        yy = np.array(sel, float); L = ext[sel, 0].astype(float); R = ext[sel, 1].astype(float)
        sl = abs(np.polyfit(L, yy, 1)[0]); sr = abs(np.polyfit(R, yy, 1)[0]); slope = (sl + sr) / 2
    # débordement : pixels opaques sous la rangée la plus large hors du losange (demi-largeur décroissante avec pente 0,5) élargi de 6 % de la largeur
    tol = 0.06 * mw; over = 0; tot = 0
    for y in range(int(ym) + 1, h):
        r = np.where(a[y])[0]
        if not len(r): continue
        half = mw / 2 - (y - ym) * 2 + tol * 2
        tot += len(r); over += int(((r < (xl + xr) / 2 - half) | (r > (xl + xr) / 2 + half)).sum())
    cut = bool(a[0].any() or a[-1].any() or a[:, 0].any() or a[:, -1].any())
    cx = (xl + xr) / 2; off = (cx - w / 2) / w
    return dict(w=w, h=h, largeur_dalle=int(mw), pente=None if slope is None else round(slope, 3), debord=round(over / max(1, tot), 3), coupe=cut, decentre=round(off, 3), epaisseur=int(y1 - ym - (mw / 4)))

if __name__ == '__main__':
    jf = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
    args = [x for x in sys.argv[1:] if not x.startswith('--') and x != jf]; dirs = args or ['assets/factory_hd', 'assets/phase2_hd']; res = {}
    for d in dirs:
        for f in sorted(os.listdir(d)):
            if f.lower().endswith('.png'):
                try:
                    r = analyse(os.path.join(d, f))
                    if r: res[d.split('/')[-1] + '/' + f] = r
                except Exception as e: res[f] = {'erreur': str(e)}
    bad = {}
    for k, r in res.items():
        if 'erreur' in r: continue
        pr = []
        if r['pente'] is not None and not (0.44 <= r['pente'] <= 0.58): pr.append(f"angle (pente {r['pente']}, attendu 0,5)")
        if r['debord'] > 0.03: pr.append(f"déborde de la parcelle ({int(r['debord'] * 100)} % des pixels du bas)")
        if r['coupe']: pr.append('image coupée au bord')
        if abs(r['decentre']) > 0.08: pr.append(f"dalle décentrée ({r['decentre']})")
        if pr: bad[k] = pr
    if jf: json.dump({'mesures': res, 'problemes': bad}, open(jf, 'w'), indent=1, ensure_ascii=False)
    print(len(res), 'sprites analysés ;', len(bad), 'avec au moins un problème\n')
    for k, v in bad.items(): print(f'{k:55s} ' + ' | '.join(v))
