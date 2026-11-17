#!/usr/bin/env python3
"""Compose un bâtiment seul (assets/factory_hd/bat_<nom>.png) sur une parcelle dessinée en vrai 2:1.

Usage : python3 parcelle.py <nom> <cases> <v0> <v1> [graine]
  nom   : drugstore | supermarche | hypermarche (lit bat_<nom>.png, écrit <nom>.png, ombres/, ancres.json)
  cases : côté de la parcelle en cases (losange de cases*256 x cases*128, rapport exactement 2:1)
  v0 v1 : bande occupée par le bâtiment, en fraction du côté (0 = coin haut)
"""
import sys, os, json, random, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ICI = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(ICI, '..', '..', 'assets', 'factory_hd')
CASE_W = 256          # largeur d'une case (losange 2:1, comme la ville)
SS = 2                # suréchantillonnage pour des bords nets


def main():
    nom, cases, v0, v1 = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
    graine = int(sys.argv[5]) if len(sys.argv) > 5 else 7
    rnd = random.Random(graine)
    bat = Image.open(os.path.join(D, 'bat_' + nom + '.png')).convert('RGBA')
    bb = bat.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
    bat = bat.crop(bb)

    Wd, Hd = cases * CASE_W, cases * CASE_W // 2          # losange exact 2:1
    T = 14                                                # épaisseur de la dalle
    u0, u1 = 0.05, 0.95
    # largeur écran de l'emprise du bâtiment : (du + dv) * Wd / 2
    fw = ((u1 - u0) + (v1 - v0)) * Wd / 2
    k = fw * 0.86 / bat.width
    bat = bat.resize((max(1, round(bat.width * k)), max(1, round(bat.height * k))), Image.LANCZOS)
    haut = bat.height + 20                                # marge au-dessus du losange pour le bâtiment
    W = Wd
    H = int(haut + Hd + T)
    yt = haut                                             # sommet haut du losange dans l'image
    cx = W / 2

    def P(u, v, z=0):
        return ((cx + (u - v) * Wd / 2) * SS, (yt + (u + v) * Hd / 2 - z) * SS)

    def poly(d, pts, fill, outline=None):
        d.polygon(pts, fill=fill, outline=outline)

    img = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # dalle : flancs (bas-gauche et bas-droit)
    L, B, R = P(0, 1), P(1, 1), P(1, 0)
    dn = lambda p, t=T: (p[0], p[1] + t * SS)
    poly(d, [L, B, dn(B), dn(L)], (150, 152, 158, 255))
    poly(d, [B, R, dn(R), dn(B)], (118, 120, 128, 255))

    # trottoir (bordure) puis chaussée
    poly(d, [P(0, 0), P(1, 0), P(1, 1), P(0, 1)], (206, 206, 200, 255))
    m = 0.035
    poly(d, [P(m, m), P(1 - m, m), P(1 - m, 1 - m), P(m, 1 - m)], (74, 78, 86, 255))
    # liseré de bordure
    for (a, b) in [((0, 0), (1, 0)), ((1, 0), (1, 1)), ((1, 1), (0, 1)), ((0, 1), (0, 0))]:
        d.line([P(*a), P(*b)], fill=(236, 236, 230, 255), width=3 * SS)

    # zone de stationnement : v de v1+marge à 1-m
    va, vb = v1 + 0.05, 1 - m - 0.025
    ua, ub = u0, u1
    bay = 0.20 / cases
    car_l = 0.34 / cases                  # longueur d'une place en unités v
    aisle = 0.36 / cases
    # rangées : [rang de places][allée][rang de places] répétées
    rows = []
    v = va
    while v + car_l <= vb:
        rows.append(v)
        v += car_l
        if len(rows) % 2 == 0:
            v += aisle
    # lignes de places
    wl = (236, 236, 236, 255)
    nb = int((ub - ua) / bay)
    ua = ua + ((ub - ua) - nb * bay) / 2
    for vr in rows:
        for i in range(nb + 1):
            u = ua + i * bay
            d.line([P(u, vr), P(u, vr + car_l)], fill=wl, width=2 * SS)
        d.line([P(ua, vr + car_l), P(ua + nb * bay, vr + car_l)], fill=wl, width=2 * SS)
    # passages piétons vers le bâtiment (bandes blanches)
    for uc in (0.30, 0.70):
        for j in range(5):
            vv = v1 + 0.005 + j * 0.008
            d.line([P(uc - 0.03, vv), P(uc + 0.03, vv)], fill=(230, 230, 224, 255), width=2 * SS)

    # ombre portée du bâtiment (sur la chaussée)
    # (l'ombre finale est calculée à part)

    # bâtiment : base posée au centre de l'emprise
    fx = cx + ((u0 + u1) / 2 - (v0 + v1) / 2) * Wd / 2
    fy = yt + (u1 + v1) * Hd / 2 - 4
    bx, by = round(fx - bat.width / 2), round(fy - bat.height)
    img_b = Image.new('RGBA', img.size, (0, 0, 0, 0))
    img_b.alpha_composite(bat.resize((bat.width * SS, bat.height * SS), Image.LANCZOS), (bx * SS, by * SS))

    # voitures (cubes iso), triées par profondeur
    pal = [(236, 236, 236), (30, 32, 38), (140, 144, 152), (190, 40, 40), (40, 80, 170), (220, 190, 50),
           (60, 130, 80), (200, 200, 205), (110, 60, 40), (240, 120, 40)]
    cars = []
    for vr in rows:
        for i in range(nb):
            if rnd.random() < 0.72:
                cars.append((ua + i * bay + bay * 0.5, vr + car_l * 0.5, rnd.choice(pal)))
    cars.sort(key=lambda c: c[0] + c[1])
    img_c = Image.new('RGBA', img.size, (0, 0, 0, 0))
    dc = ImageDraw.Draw(img_c)

    def shade(c, f):
        return tuple(max(0, min(255, int(x * f))) for x in c) + (255,)

    def box(u, v, du, dv, z0, z1, col):
        a0, a1, b0, b1 = u - du / 2, u + du / 2, v - dv / 2, v + dv / 2
        # faces visibles : dessus, face u max (bas-droite), face v max (bas-gauche)
        poly(dc, [P(a1, b0, z0), P(a1, b1, z0), P(a1, b1, z1), P(a1, b0, z1)], shade(col, 0.72))
        poly(dc, [P(a0, b1, z0), P(a1, b1, z0), P(a1, b1, z1), P(a0, b1, z1)], shade(col, 0.88))
        poly(dc, [P(a0, b0, z1), P(a1, b0, z1), P(a1, b1, z1), P(a0, b1, z1)], shade(col, 1.0))

    gl = (150, 190, 215)
    for (u, v, col) in cars:
        box(u, v, bay * 0.62, car_l * 0.78, 0, 7, col)
        box(u, v + 0.0, bay * 0.56, car_l * 0.40, 7, 13, gl if rnd.random() < 0.5 else col)

    # arbres le long du trottoir
    def arbre(u, v, r=9):
        x, y = P(u, v, 0)
        dc.ellipse([x - r * SS * 0.9, y - r * SS * 0.35, x + r * SS * 0.9, y + r * SS * 0.5], fill=(40, 50, 40, 140))
        dc.rectangle([x - 1.5 * SS, y - 11 * SS, x + 1.5 * SS, y], fill=(96, 70, 48, 255))
        for dx, dy, rr, c in [(-3, -18, r, (58, 140, 62)), (4, -20, r - 1, (70, 156, 70)), (0, -27, r - 2, (84, 170, 80))]:
            dc.ellipse([x + (dx - rr) * SS, y + (dy - rr) * SS, x + (dx + rr) * SS, y + (dy + rr) * SS], fill=c + (255,))

    pts = []
    n_arb = 2 * cases + 2
    for i in range(n_arb):
        t = 0.08 + 0.84 * i / max(1, n_arb - 1)
        pts.append((t, 0.985))      # bord bas-gauche  (v ~ 1)
        pts.append((0.985, t))      # bord bas-droit   (u ~ 1)
    pts += [(0.985, 0.02), (0.02, 0.985)]
    pts.sort(key=lambda p: p[0] + p[1])
    for (u, v) in pts:
        arbre(u, v)
    # lampadaires
    for (u, v) in [(0.5, 0.985), (0.985, 0.5)]:
        x, y = P(u, v, 0)
        dc.line([(x, y), (x, y - 50 * SS)], fill=(70, 74, 82, 255), width=3 * SS)
        dc.ellipse([x - 5 * SS, y - 56 * SS, x + 5 * SS, y - 46 * SS], fill=(250, 240, 190, 255))

    out = img.copy()
    out.alpha_composite(img_b)
    out.alpha_composite(img_c)
    out = out.resize((W, H), Image.LANCZOS)

    # recadrage sur le contenu en gardant le centre du losange comme ancre
    ancre = (W / 2, yt + Hd / 2)
    a = out.getchannel('A').getbbox()
    out = out.crop((0, a[1], W, a[3]))
    ancre = (ancre[0], ancre[1] - a[1])
    out.save(os.path.join(D, nom + '.png'), optimize=True)

    # ombre portée (même méthode que batch.ombre_auto)
    sys.path.insert(0, os.path.join(ICI))
    spr = out
    w, h = spr.size
    al = spr.getchannel('A')
    hh = max(1, round(h * 0.42))
    plat = al.resize((w, hh), Image.BILINEAR)
    marge = round(h * 0.45)
    toile = Image.new('L', (w + marge, h), 0)
    cis = plat.transform((w + marge, hh), Image.AFFINE, (1, 0.95, -marge * 0.98, 0, 1, 0), Image.BILINEAR)
    toile.paste(cis, (0, round(ancre[1]) - hh + 4))
    toile = toile.crop((0, 0, w, h)).filter(ImageFilter.GaussianBlur(3))
    z = np.zeros((h, w), 'uint8')
    om = Image.fromarray(np.dstack([z, z, z, (np.asarray(toile) * 0.42).astype('uint8')]), 'RGBA')
    om.save(os.path.join(D, 'ombres', nom + '.png'))

    A = json.load(open(os.path.join(D, 'ancres.json')))
    A[nom + '.png'] = {'largeur': w, 'hauteur': h, 'ancre_x': round(ancre[0]), 'ancre_y': round(ancre[1]),
              'echelle_px_par_m': 64.0, 'emprise_px': Wd, 'emprise_cases': cases}
    json.dump(A, open(os.path.join(D, 'ancres.json'), 'w'), indent=1)
    print(nom, 'ok', (w, h), 'losange', (Wd, Hd), 'ancre', ancre)


if __name__ == '__main__':
    main()
