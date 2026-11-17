#!/usr/bin/env python3
"""Routes : les 16 tuiles du réseau, dessinées par programme (bords exacts, raccord sans couture).
Chaque tuile est dessinée vue de dessus (carré), puis mise en losange 2:1 de 396x198 par batch_phase2.en_losange.
Branches : N = bord haut-droit (nord-est), E = bord bas-droit (sud-est), S = bord bas-gauche (sud-ouest), W = bord haut-gauche (nord-ouest).
Sortie : assets/phase2_hd/route_*.png
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
from batch_phase2 import en_losange  # noqa: E402

OUT = os.path.join(ICI, '..', '..', 'assets', 'phase2_hd')
S = 1188                      # carré de dessin
RW = 0.165                    # demi-largeur de chaussée (fraction du côté)
TROTTOIR = (214, 212, 204)
BORDURE = (176, 176, 170)
ASPHALTE = (84, 88, 96)
BLANC = (236, 236, 232)

NOMS = {
    'route_droite_ne': 'NS', 'route_droite_nw': 'WE', 'route_croix': 'NESW',
    'route_t_ne': 'ESW', 'route_t_se': 'NSW', 'route_t_sw': 'NEW', 'route_t_nw': 'NES',
    'route_coude_ne_se': 'NE', 'route_coude_se_sw': 'ES', 'route_coude_sw_nw': 'SW', 'route_coude_ne_nw': 'NW',
    'route_bout_ne': 'N', 'route_bout_se': 'E', 'route_bout_sw': 'S', 'route_bout_nw': 'W',
    'route_isolee': '',
}


def px(f):
    return round(f * S)


def tuile(arms):
    arms = set(arms)
    rng = np.random.default_rng(len(arms) * 7 + sum(ord(c) for c in arms))
    base = Image.new('RGB', (S, S), TROTTOIR)
    m = Image.new('L', (S, S), 0)
    d = ImageDraw.Draw(m)
    c = S // 2
    rw = px(RW)
    if 'N' in arms: d.rectangle([c - rw, 0, c + rw, c], fill=255)
    if 'S' in arms: d.rectangle([c - rw, c, c + rw, S], fill=255)
    if 'W' in arms: d.rectangle([0, c - rw, c, c + rw], fill=255)
    if 'E' in arms: d.rectangle([c, c - rw, S, c + rw], fill=255)
    n = len(arms)
    straight = arms in ({'N', 'S'}, {'W', 'E'})
    if n == 0:
        d.ellipse([c - rw * 1.3, c - rw * 1.3, c + rw * 1.3, c + rw * 1.3], fill=255)
    elif n == 1:                                   # cul-de-sac arrondi
        d.ellipse([c - rw, c - rw, c + rw, c + rw], fill=255)
    elif not straight:
        d.rectangle([c - rw, c - rw, c + rw, c + rw], fill=255)
        # congés aux angles rentrants (entre deux branches voisines)
        r = px(0.075)
        for (a, b, sx, sy) in [('N', 'E', 1, -1), ('E', 'S', 1, 1), ('S', 'W', -1, 1), ('W', 'N', -1, -1)]:
            if a in arms and b in arms:
                kx, ky = c + sx * rw, c + sy * rw
                d.rectangle([min(kx, kx + sx * r), min(ky, ky + sy * r), max(kx, kx + sx * r), max(ky, ky + sy * r)], fill=255)
                ox, oy = kx + sx * r, ky + sy * r
                d.ellipse([ox - r, oy - r, ox + r, oy + r], fill=0)
        # angles saillants de coude : arrondis
        for (a, b, sx, sy) in [('N', 'E', -1, 1), ('E', 'S', -1, -1), ('S', 'W', 1, -1), ('W', 'N', 1, 1)]:
            if arms == {a, b}:
                r2 = px(0.11)
                kx, ky = c + sx * rw, c + sy * rw
                d.rectangle([min(kx, kx - sx * r2), min(ky, ky - sy * r2), max(kx, kx - sx * r2), max(ky, ky - sy * r2)], fill=0)
                ox, oy = kx - sx * r2, ky - sy * r2
                d.ellipse([ox - r2, oy - r2, ox + r2, oy + r2], fill=255)
                # rectangle des deux bras recouvert à nouveau
                if 'N' in arms: d.rectangle([c - rw, 0, c + rw, c - r2 // 2], fill=255)
                if 'S' in arms: d.rectangle([c - rw, c + r2 // 2, c + rw, S], fill=255)
                if 'W' in arms: d.rectangle([0, c - rw, c - r2 // 2, c + rw], fill=255)
                if 'E' in arms: d.rectangle([c + r2 // 2, c - rw, S, c + rw], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(1.2)).point(lambda v: 255 if v > 127 else 0)
    # bordure : masque dilaté
    k = 2 * px(0.012) + 1
    mb = m.filter(ImageFilter.MaxFilter(k))
    img = base.copy()
    img.paste(Image.new('RGB', (S, S), BORDURE), mask=mb)
    asph = Image.new('RGB', (S, S), ASPHALTE)
    img.paste(asph, mask=m)
    d2 = ImageDraw.Draw(img)
    # marquages : tirets centraux sur les bras, passages piégons aux jonctions
    dash, gap, lw = px(0.045), px(0.04), max(3, px(0.008))
    def tirets(x0, y0, x1, y1):
        L = math_hypot(x1 - x0, y1 - y0); ux, uy = (x1 - x0) / L, (y1 - y0) / L; t = 0
        while t < L:
            e = min(L, t + dash)
            d2.line([(x0 + ux * t, y0 + uy * t), (x0 + ux * e, y0 + uy * e)], fill=BLANC, width=lw)
            t += dash + gap
    def math_hypot(a, b):
        return (a * a + b * b) ** 0.5
    marge = px(0.04)
    if n >= 2 and not (n == 2 and not straight):
        for a in arms:
            if a == 'N': tirets(c, 0, c, c - rw - marge)
            if a == 'S': tirets(c, S, c, c + rw + marge)
            if a == 'W': tirets(0, c, c - rw - marge, c)
            if a == 'E': tirets(S, c, c + rw + marge, c)
        if straight:
            if arms == {'N', 'S'}: tirets(c, 0, c, S)
            else: tirets(0, c, S, c)
    elif n == 2:
        # coude : tirets sur chaque bras jusqu'à l'arrondi
        for a in arms:
            if a == 'N': tirets(c, 0, c, c - rw)
            if a == 'S': tirets(c, S, c, c + rw)
            if a == 'W': tirets(0, c, c - rw, c)
            if a == 'E': tirets(S, c, c + rw, c)
    elif n == 1:
        a = next(iter(arms))
        if a == 'N': tirets(c, 0, c, c)
        if a == 'S': tirets(c, S, c, c)
        if a == 'W': tirets(0, c, c, c)
        if a == 'E': tirets(S, c, c, c)
    if n >= 3:                                     # passages piétons sur chaque bras
        zw = px(0.012); zl = px(0.06)
        for a in arms:
            off = rw + px(0.03)
            for i in range(-6, 7):
                t = i * px(0.022)
                if a == 'N': d2.rectangle([c + t - zw, c - off - zl, c + t + zw, c - off], fill=BLANC)
                if a == 'S': d2.rectangle([c + t - zw, c + off, c + t + zw, c + off + zl], fill=BLANC)
                if a == 'W': d2.rectangle([c - off - zl, c + t - zw, c - off, c + t + zw], fill=BLANC)
                if a == 'E': d2.rectangle([c + off, c + t - zw, c + off + zl, c + t + zw], fill=BLANC)
    # grain léger et éclairage doux (venant de la gauche)
    a = np.asarray(img).astype(np.float32)
    a += rng.normal(0, 3.2, a.shape[:2])[:, :, None]
    yy, xx = np.mgrid[0:S, 0:S]
    a *= (1.04 - 0.08 * (xx + yy) / (2 * S))[:, :, None]
    # joints de dalles sur le trottoir
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'), 'RGB')


def main():
    os.makedirs(OUT, exist_ok=True)
    for nom, arms in NOMS.items():
        en_losange(tuile(arms), 396, 198).save(os.path.join(OUT, nom + '.png'))
        print('ok', nom, arms)
    # planche de contrôle : un petit réseau
    print('fait')


if __name__ == '__main__':
    main()
