#!/usr/bin/env python3
"""Ajoute une marge transparente (>= M px) autour des sprites coupés au bord du canevas et décale les ancres.
Usage : python3 tools/factory_ai/marges.py [--ecrire]   (par défaut : liste seulement)"""
import os, sys, json
from PIL import Image
import numpy as np
M = 6
# tuiles/parcelles dont les sommets du losange touchent légitimement le bord : on n'y touche pas
EXCL = ('route_', 'sol_', 'herbe_', 'eau_', 'rivage_', 'fwheat', 'fsugar', 'fcotton', 'frubber', 'fvine', 'fcattle', 'fsheep', 'fpig', 'fchicken', 'fcorn', 'frapeseed', 'drugstore', 'supermarche', 'hypermarche', 'mega_centre', 'zz_')
ecrire = '--ecrire' in sys.argv
for d in ['assets/factory_hd', 'assets/phase2_hd']:
    ap = os.path.join(d, 'ancres.json'); anc = json.load(open(ap)) if os.path.exists(ap) else {}
    n = 0
    for f in sorted(os.listdir(d)):
        if not f.endswith('.png') or f.startswith(EXCL) or f.endswith('_apercu.png'): continue
        im = Image.open(os.path.join(d, f)).convert('RGBA'); a = np.array(im.getchannel('A')) > 40
        if not (a[0].any() or a[-1].any() or a[:, 0].any() or a[:, -1].any()): continue
        n += 1
        if not ecrire: print('coupé :', d, f); continue
        c = Image.new('RGBA', (im.width + 2 * M, im.height + 2 * M), (0, 0, 0, 0)); c.alpha_composite(im, (M, M)); c.save(os.path.join(d, f))
        if f in anc:
            e = anc[f]; e['largeur'] = c.width; e['hauteur'] = c.height
            for k in ('ancre_x', 'ancre_y'):
                if k in e: e[k] += M
            if 'bbox' in e: e['bbox'] = [e['bbox'][0] + M, e['bbox'][1] + M, e['bbox'][2] + M, e['bbox'][3] + M]
        # ombre associée
        sp = os.path.join(d, 'ombres', f)
        if os.path.exists(sp):
            s = Image.open(sp).convert('RGBA'); t = Image.new('RGBA', (s.width + 2 * M, s.height + 2 * M), (0, 0, 0, 0)); t.alpha_composite(s, (M, M)); t.save(sp)
    if ecrire and n: json.dump(anc, open(ap, 'w'), indent=1, ensure_ascii=False)
    print(d, n, 'sprites coupés', '(corrigés)' if ecrire else '')
