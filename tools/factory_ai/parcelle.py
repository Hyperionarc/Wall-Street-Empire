#!/usr/bin/env python3
"""Compose un bâtiment seul (assets/factory_hd/bat_<nom>.png) sur une parcelle dessinée en vrai 2:1.

Usage : python3 parcelle.py <nom> <cases> <v0> <v1> [graine]
  nom   : drugstore | supermarche | hypermarche (lit bat_<nom>.png, écrit <nom>.png, ombres/, ancres.json)
  cases : côté de la parcelle en cases (losange de cases*256 x cases*128, rapport exactement 2:1)
  v0 v1 : bande occupée par le bâtiment, en fraction du côté (0 = coin haut)
"""
import math
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
    mode = sys.argv[6] if len(sys.argv) > 6 else 'parking'
    sortie = sys.argv[7] if len(sys.argv) > 7 else nom
    dossier_sortie = os.path.join(ICI, '..', '..', 'assets', 'phase2_hd') if len(sys.argv) > 8 and sys.argv[8] == 'phase2' else D
    rnd = random.Random(graine)
    bat = Image.open(os.path.join(D, 'bat_' + nom + '.png')).convert('RGBA')
    bb = bat.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
    bat = bat.crop(bb)
    if os.environ.get('BAT_FLIP') == '1':
        bat = bat.transpose(Image.FLIP_LEFT_RIGHT)
    # redressement affine : les verticales restent verticales, les deux axes du sol passent à ±0,5 (losange 2:1)
    _a = np.asarray(bat.getchannel('A')) > 40
    _cols = np.nonzero(_a.any(axis=0))[0]
    _yb = np.array([np.nonzero(_a[:, c])[0].max() for c in _cols], float)
    if os.environ.get('BAT_COIN') == '1':
        _i = int(np.argmax(_yb)); _lowx = _cols[_i]
        _lo = [c for c in _cols if _yb[c - _cols[0]] >= _yb.max() - 3]
        _lowx = int(np.median(_lo))
        def _fit(c0, c1):
            m_ = (_cols >= c0) & (_cols <= c1)
            return float(np.polyfit(_cols[m_].astype(float), _yb[m_], 1)[0]) if m_.sum() > 6 else None
        _L = _lowx - _cols[0]; _R = _cols[-1] - _lowx
        _su = _fit(_cols[0] + 0.12 * _L, _lowx - 0.12 * _L)            # arête longue (descend vers la droite)
        _sr = _fit(_lowx + 0.12 * _R, _cols[-1] - 0.12 * _R)           # arête courte (remonte vers la droite)
        _su = abs(_su) if _su is not None else 0.5
        _sv = abs(_sr) if _sr is not None else 0.5
        _al_ = max(0.6, min(1.6, _su + _sv)); _be = 0.5 * _al_ - _su
        _w0, _h0 = bat.size; _oy = max(0.0, -_be * _w0)
        _nw = int(np.ceil(_al_ * _w0)); _nh = int(np.ceil(_h0 + abs(_be) * _w0)) + 2
        bat = bat.transform((_nw, _nh), Image.AFFINE, (1 / _al_, 0, 0, -_be / _al_, 1, -_oy), Image.BICUBIC)
        _bb = bat.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox(); bat = bat.crop(_bb)
        print('affine : pente longue %.2f courte %.2f -> alpha %.2f beta %.2f' % (_su, _sv, _al_, _be))
    else:
        _n = len(_cols); _l = slice(int(_n * 0.08), int(_n * 0.40)); _r = slice(int(_n * 0.60), int(_n * 0.92))
        def _pente(sl):
            xx, yy = _cols[sl].astype(float), _yb[sl]
            return abs(np.polyfit(xx, yy, 1)[0]) if len(xx) > 4 else 0.5
        _m = max(0.2, (_pente(_l) + _pente(_r)) / 2)
        _f = min(1.0, max(0.6, 0.5 / _m)) if os.environ.get('BAT_RAIDIR', '1') == '1' else 1.0
        if _f < 0.995:
            bat = bat.resize((bat.width, max(1, round(bat.height * _f))), Image.LANCZOS)
        print('pente base', round(_m, 2), 'redressement y x', round(_f, 2))
    _a2 = np.asarray(bat.getchannel('A')) > 40
    _yb2 = np.array([np.nonzero(_a2[:, c])[0].max() if _a2[:, c].any() else -1 for c in range(_a2.shape[1])])
    _lx = float(np.median(np.nonzero(_yb2 >= _yb2.max() - 2)[0]))
    COIN = os.environ.get('BAT_COIN') == '1'

    Wd, Hd = cases * CASE_W, cases * CASE_W // 2          # losange exact 2:1
    T = 14                                                # épaisseur de la dalle
    u0, u1 = 0.05, 0.95
    # largeur écran de l'emprise du bâtiment : (du + dv) * Wd / 2
    fw = ((u1 - u0) + (v1 - v0)) * Wd / 2
    kf = float(sys.argv[9]) if len(sys.argv) > 9 else 0.86
    k = fw * kf / bat.width
    if COIN:
        NB = int(os.environ.get('BAT_N', '1'))
        k = (u1 - u0) * (Wd / 2) * kf / max(1.0, _lx) / NB            # NB bâtiments bout à bout couvrent tout le bord nord→est
        if os.environ.get('BAT_AUTOV') == '1':                          # la profondeur de la bande = celle du bâtiment
            v1 = v0 + ((bat.width - _lx) * k) / (Wd / 2) + 0.012
            print('bande v1 auto', round(v1, 3))
    _Cx, _Dx = Wd / 2 + (u1 - v1) * Wd / 2, Wd / 2 + (u0 - v1) * Wd / 2
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
    poly(d, [P(m, m), P(1 - m, m), P(1 - m, 1 - m), P(m, 1 - m)], (74, 78, 86, 255) if mode == 'parking' else (128, 124, 116, 255))
    # liseré de bordure
    for (a, b) in [((0, 0), (1, 0)), ((1, 0), (1, 1)), ((1, 1), (0, 1)), ((0, 1), (0, 0))]:
        d.line([P(*a), P(*b)], fill=(236, 236, 230, 255), width=3 * SS)

    ferme = mode.startswith('ferme')
    kind = mode.split(':')[1] if ':' in mode else ''
    if ferme:
        poly(d, [L, B, dn(B), dn(L)], (112, 84, 56, 255)); poly(d, [B, R, dn(R), dn(B)], (90, 66, 44, 255))
        poly(d, [P(0, 0), P(1, 0), P(1, 1), P(0, 1)], (92, 150, 70, 255))
        rr = random.Random(graine + 3)
        for _ in range(90):                                    # grandes plaques jaune-vert / vert profond
            uu, vv = rr.uniform(0.10, 0.90), rr.uniform(0.10, 0.90)
            x, y = P(uu, vv)
            g = rr.choice([(108, 160, 74), (96, 152, 68), (118, 166, 76), (104, 156, 70)])
            r_ = rr.uniform(12, 22) * SS
            d.ellipse([x - r_, y - r_ / 2, x + r_, y + r_ / 2], fill=g + (255,))
        for _ in range(900):                                   # texture d'herbe
            uu, vv = rr.random(), rr.random()
            x, y = P(uu, vv)
            g = rr.choice([(104, 164, 80), (80, 136, 62), (118, 176, 90)])
            d.ellipse([x - 3 * SS, y - 1.5 * SS, x + 3 * SS, y + 1.5 * SS], fill=g + (255,))
        va_, vb_ = v1 + 0.03, 0.95
        ua_, ub_ = 0.05, 0.95
        sol = {'ble': (150, 112, 52), 'sucre': (118, 82, 52), 'coton': (126, 92, 60), 'caoutchouc': (112, 84, 56), 'vigne': (112, 84, 56)}
        if kind in sol:
            poly(d, [P(ua_, va_), P(ub_, va_), P(ub_, vb_), P(ua_, vb_)], sol[kind] + (255,))
            nrow = 14 if kind != 'caoutchouc' else 6
            for i in range(nrow):
                vv = va_ + (i + 0.5) * (vb_ - va_) / nrow
                if kind == 'ble':
                    d.line([P(ua_ + 0.01, vv), P(ub_ - 0.01, vv)], fill=(224, 186, 70, 255), width=7 * SS)
                    d.line([P(ua_ + 0.01, vv - 0.004), P(ub_ - 0.01, vv - 0.004)], fill=(240, 208, 104, 255), width=2 * SS)
                elif kind in ('sucre', 'coton'):
                    # sillon : crête claire + creux sombre
                    d.line([P(ua_ + 0.01, vv + 0.012), P(ub_ - 0.01, vv + 0.012)], fill=(92, 62, 36, 255), width=4 * SS)
                    d.line([P(ua_ + 0.01, vv - 0.006), P(ub_ - 0.01, vv - 0.006)], fill=(150, 108, 66, 255), width=3 * SS)
                    for j in range(21):
                        uu = ua_ + 0.03 + j * (ub_ - ua_ - 0.06) / 20 + rr.uniform(-0.004, 0.004)
                        x, y = P(uu, vv)
                        d.ellipse([x - 2 * SS, y - 1 * SS, x + 13 * SS, y + 4 * SS], fill=(40, 30, 20, 150))      # ombre portée
                        if kind == 'sucre':
                            for k in range(7):
                                ang = k * 0.9 + rr.uniform(-0.2, 0.2)
                                lx, ly = x + math.cos(ang) * 7 * SS, y - 6 * SS + math.sin(ang) * 3.5 * SS
                                g = rr.choice([(58, 130, 46), (76, 154, 56), (96, 176, 66)])
                                d.ellipse([lx - 4.5 * SS, ly - 4 * SS, lx + 4.5 * SS, ly + 3 * SS], fill=g + (255,))
                            d.ellipse([x - 3 * SS, y - 9 * SS, x + 3 * SS, y - 4 * SS], fill=(122, 190, 78, 255))
                        else:
                            for k in range(6):
                                ang = k * 1.05 + rr.uniform(-0.2, 0.2)
                                lx, ly = x + math.cos(ang) * 6 * SS, y - 7 * SS + math.sin(ang) * 3 * SS
                                d.ellipse([lx - 4 * SS, ly - 3.5 * SS, lx + 4 * SS, ly + 3 * SS], fill=rr.choice([(52, 118, 48), (70, 140, 58)]) + (255,))
                            for k in range(2):
                                bx, by = x + rr.uniform(-5, 5) * SS, y - rr.uniform(7, 12) * SS
                                d.ellipse([bx - 2.2 * SS, by - 2.2 * SS, bx + 2.2 * SS, by + 1.9 * SS], fill=(252, 252, 246, 255))
                                d.ellipse([bx - 1.4 * SS, by - 1.6 * SS, bx + 0.6 * SS, by + 0.2 * SS], fill=(255, 255, 255, 255))
                elif kind == 'vigne':
                    d.line([P(ua_ + 0.01, vv + 0.014), P(ub_ - 0.01, vv + 0.014)], fill=(100, 138, 62, 255), width=5 * SS)   # enherbement entre rangs
                    d.line([P(ua_ + 0.01, vv - 0.006), P(ub_ - 0.01, vv - 0.006)], fill=(80, 54, 34, 255), width=2 * SS)
                    for j in range(22):
                        uu = ua_ + 0.03 + j * (ub_ - ua_ - 0.06) / 21 + rr.uniform(-0.003, 0.003)
                        x, y = P(uu, vv)
                        d.ellipse([x - 3 * SS, y - 1 * SS, x + 12 * SS, y + 3.5 * SS], fill=(36, 40, 22, 140))
                        d.line([(x, y), (x, y - 16 * SS)], fill=(96, 68, 44, 255), width=2 * SS)
                        for k in range(7):
                            lx, ly = x + rr.uniform(-6.5, 6.5) * SS, y - rr.uniform(6, 17) * SS
                            d.ellipse([lx - 4.2 * SS, ly - 3.4 * SS, lx + 4.2 * SS, ly + 3.2 * SS], fill=rr.choice([(52, 120, 46), (70, 142, 54), (92, 164, 60), (120, 170, 60)]) + (255,))
                        for k in range(2):
                            gx, gy = x + rr.uniform(-4, 4) * SS, y - rr.uniform(3, 8) * SS
                            for m_ in range(4):
                                ox_ = rr.uniform(-1.5, 1.5) * SS
                                d.ellipse([gx + ox_ - 1.7 * SS, gy + m_ * 1.6 * SS - 1.7 * SS, gx + ox_ + 1.7 * SS, gy + m_ * 1.6 * SS + 1.7 * SS], fill=rr.choice([(92, 44, 112), (110, 54, 130), (70, 34, 96)]) + (255,))
                elif kind == 'caoutchouc':
                    pass
            if kind == 'ble':
                poly(d, [P(ua_, va_), P(ub_, va_), P(ub_, vb_), P(ua_, vb_)], (120, 84, 38, 255))
                tiges = []
                for _ in range(26000):
                    uu, vv = rr.uniform(ua_ + 0.035, ub_ - 0.03), rr.uniform(va_ + 0.045, vb_ - 0.03)
                    if abs(vv - (va_ + (vb_ - va_) * (0.62 + 0.10 * math.sin(uu * 7)))) < 0.018:
                        continue                            # sentier tondu dans le champ
                    tiges.append((vv, uu))
                tiges.sort()
                for vv, uu in tiges:
                    w = math.sin(uu * 9.0 + vv * 5.0) + 0.6 * math.sin(uu * 21.0 - vv * 13.0) + 0.3 * math.sin(uu * 47.0 + vv * 31.0)
                    haut = rr.uniform(15, 21) * SS
                    x, y = P(uu, vv)
                    lx = (w * 4.5 + rr.uniform(-1.2, 1.2)) * SS
                    cr = max(0.0, min(1.0, 0.5 + 0.36 * w))
                    ombre = 0.80 + 0.20 * min(1.0, (vv - va_) / (vb_ - va_) + 0.2)
                    c1 = tuple(int((a + (b - a) * cr) * ombre) for a, b in zip((150, 106, 40), (232, 188, 88)))
                    c2 = tuple(int((a + (b - a) * cr) * ombre) for a, b in zip((206, 156, 58), (255, 226, 130)))
                    d.line([(x, y), (x + lx * 0.5, y - haut * 0.55), (x + lx, y - haut)], fill=c1 + (255,), width=max(1, int(1.6 * SS)))
                    ex, ey = x + lx, y - haut
                    d.line([(ex, ey), (ex + lx * 0.18 + 1.5 * SS, ey - 7 * SS)], fill=c2 + (255,), width=max(1, int(3.2 * SS)))
                    if rr.random() < 0.012:
                        d.ellipse([x - 2 * SS, y - 12 * SS, x + 2 * SS, y - 8 * SS], fill=(200, 34, 24, 255))
            if kind == 'caoutchouc':
                for i in range(nrow):
                    vv = va_ + (i + 0.5) * (vb_ - va_) / nrow
                    for j in range(8):
                        uu = ua_ + 0.06 + j * (ub_ - ua_ - 0.12) / 7
                        x, y = P(uu, vv, 0)
                        d.rectangle([x - 2 * SS, y - 20 * SS, x + 2 * SS, y], fill=(112, 88, 66, 255))
                        for dx, dy, r_, c_ in [(-5, -26, 11, (52, 124, 60)), (5, -28, 10, (62, 140, 68)), (0, -36, 9, (78, 156, 78))]:
                            d.ellipse([x + (dx - r_) * SS, y + (dy - r_) * SS, x + (dx + r_) * SS, y + (dy + r_) * SS], fill=c_ + (255,))
        else:
            enclos = {'bovins': (112, 176, 84), 'moutons': (122, 182, 92), 'poulets': (150, 150, 84), 'porcs': (122, 92, 62)}[kind]
            poly(d, [P(ua_, va_), P(ub_, va_), P(ub_, vb_), P(ua_, vb_)], enclos + (255,))
            if kind == 'porcs':
                for _ in range(10):
                    uu, vv = rr.uniform(ua_ + 0.1, ub_ - 0.1), rr.uniform(va_ + 0.05, vb_ - 0.05)
                    x, y = P(uu, vv); d.ellipse([x - 22 * SS, y - 8 * SS, x + 22 * SS, y + 8 * SS], fill=(92, 66, 44, 255))

    # zone de stationnement : v de v1+marge à 1-m
    va, vb = v1 + 0.05, 1 - m - 0.025
    ua, ub = u0, u1
    bay = 0.20 / cases
    car_l = 0.34 / cases                  # longueur d'une place en unités v
    aisle = 0.36 / cases
    # rangées : [rang de places][allée][rang de places] répétées
    rows = []
    v = va
    while mode == 'parking' and v + car_l <= vb:
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
    for uc in ((0.30, 0.70) if mode == 'parking' else ()):
        for j in range(5):
            vv = v1 + 0.005 + j * 0.008
            d.line([P(uc - 0.03, vv), P(uc + 0.03, vv)], fill=(230, 230, 224, 255), width=2 * SS)

    # ombre portée du bâtiment (sur la chaussée)
    # (l'ombre finale est calculée à part)

    # bâtiment : base posée au centre de l'emprise
    fx = cx + ((u0 + u1) / 2 - (v0 + v1) / 2) * Wd / 2
    fy = yt + (u1 + v1) * Hd / 2 - 4
    bx, by = round(fx - bat.width / 2), round(fy - bat.height)
    if COIN: bx = round(_Cx - _lx * k)
    img_b = Image.new('RGBA', img.size, (0, 0, 0, 0))
    _batS = bat.resize((bat.width * SS, bat.height * SS), Image.LANCZOS)
    for _j in range((NB if COIN else 1) - 1, -1, -1):                  # le plus au fond d'abord
        _dx = round(_j * _lx * k * SS); img_b.alpha_composite(_batS, (bx * SS - _dx, by * SS - _dx // 2)) if COIN else img_b.alpha_composite(_batS, (bx * SS, by * SS))
    # --- contrôle d'emprise : le bâtiment doit rester dans sa bande (u0..u1 x v0..v1) extrudée vers le haut
    _A, _B, _C, _D = [tuple(c / SS for c in P(u_, v_)) for (u_, v_) in [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]]
    _al = np.asarray(img_b.getchannel('A').resize((W, H), Image.BILINEAR)) > 40
    _ys, _xs = np.nonzero(_al)
    def _interp(xv, p, q):
        return p[1] + (q[1] - p[1]) * (xv - p[0]) / (q[0] - p[0] + 1e-9)
    _low = np.where(_xs <= _C[0], _interp(_xs, _D, _C), _interp(_xs, _C, _B))
    _up = np.where(_xs <= _A[0], _interp(_xs, _D, _A), _interp(_xs, _A, _B))
    _hb = max(0.0, bat.height - 0.5 * bat.width)                       # hauteur réelle du bâtiment au-dessus de son empreinte
    _bad = (_xs < _D[0] - 1) | (_xs > _B[0] + 1) | (_ys > _low + 2) | (_ys < _up - _hb - 2)
    print('EMPRISE depassement %.2f%%' % (100.0 * _bad.sum() / max(1, len(_xs))))
    print('detail gauche %d droite %d bas %d haut %d  hb %.0f' % (((_xs < _D[0] - 1)).sum(), ((_xs > _B[0] + 1)).sum(), ((_ys > _low + 2)).sum(), ((_ys < _up - _hb - 2)).sum(), _hb), 'D', _D, 'C', _C, 'B', _B, 'A', _A, 'bat', bat.size, 'bx', bx, 'lx', round(_lx * k))

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
    if ferme: pts = []
    pts.sort(key=lambda p: p[0] + p[1])
    for (u, v) in pts:
        arbre(u, v)
    # lampadaires
    for (u, v) in ([] if ferme else [(0.5, 0.985), (0.985, 0.5)]):
        x, y = P(u, v, 0)
        dc.line([(x, y), (x, y - 50 * SS)], fill=(70, 74, 82, 255), width=3 * SS)
        dc.ellipse([x - 5 * SS, y - 56 * SS, x + 5 * SS, y - 46 * SS], fill=(250, 240, 190, 255))

    if ferme:
        # animaux (sprites générés), puis clôture avant
        an = {'bovins': ('animal_vache', 7), 'moutons': ('animal_mouton', 9), 'poulets': ('animal_poule', 12), 'porcs': ('animal_cochon', 8)}.get(kind)
        if an:
            ap = os.path.join(ICI, '..', '..', 'assets', 'phase2_hd', an[0] + '.png')
            if os.path.exists(ap):
                sp = Image.open(ap).convert('RGBA'); sp = sp.crop(sp.getchannel('A').getbbox())
                hh = {'bovins': 34, 'moutons': 22, 'porcs': 22, 'poulets': 15}[kind]
                sp = sp.resize((max(1, round(sp.width * hh / sp.height)), hh), Image.LANCZOS)
                pos = []
                nb_ = {'bovins': 55, 'moutons': 220, 'poulets': 260, 'porcs': 170}[kind]
                centres = [(rr.uniform(0.2, 0.8), rr.uniform(v1 + 0.15, 0.85)) for _ in range(6)]
                for _ in range(nb_):
                    for _try in range(120):
                        c_ = rr.choice(centres)
                        uu, vv = rr.gauss(c_[0], 0.18), rr.gauss(c_[1], 0.16)
                        if 0.10 < uu < 0.90 and v1 + 0.08 < vv < 0.90 and all(abs(uu - a) + abs(vv - b) > {'bovins': 0.075, 'moutons': 0.035, 'porcs': 0.045, 'poulets': 0.028}[kind] for a, b, _f in pos):
                            pos.append((uu, vv, rr.random() < 0.5)); break
                pos.sort(key=lambda p: p[0] + p[1])
                for (uu, vv, fl) in pos:
                    x, y = P(uu, vv); x, y = x / SS, y / SS
                    sp2 = sp.transpose(Image.FLIP_LEFT_RIGHT) if fl else sp
                    f_ = rr.uniform(0.92, 1.1); sp2 = sp2.resize((round(sp2.width * f_), round(sp2.height * f_)), Image.LANCZOS)
                    sh = Image.new('RGBA', img.size, (0, 0, 0, 0))
                    ImageDraw.Draw(sh).ellipse([(x - sp2.width * 0.4) * SS, (y - 3) * SS, (x + sp2.width * 0.4) * SS, (y + 4) * SS], fill=(30, 40, 20, 110))
                    img_c.alpha_composite(sh)
                    img_c.alpha_composite(sp2.resize((sp2.width * SS, sp2.height * SS), Image.LANCZOS), (round((x - sp2.width / 2) * SS), round((y - sp2.height + 4) * SS)))
        def clot(a, b, z):
            dc.line([P(*a, z), P(*b, z)], fill=(190, 150, 100, 255) if kind != 'poulets' else (170, 170, 170, 255), width=2 * SS)
        for (a, b) in [((0.04, 0.96), (0.96, 0.96)), ((0.96, 0.04), (0.96, 0.96))]:
            n_p = 14
            for i in range(n_p + 1):
                t = i / n_p; q = (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
                x, y = P(*q, 0); dc.line([(x, y), (x, y - 20 * SS)], fill=(120, 88, 56, 255), width=3 * SS)
            clot(a, b, 10); clot(a, b, 18)

    # décor posé à la main : "nom:u:v:hauteur_px[:miroir],..." (objets de assets/phase2_hd)
    if len(sys.argv) > 10 and sys.argv[10] not in ('', '-'):
        P2 = os.path.join(ICI, '..', '..', 'assets', 'phase2_hd')
        deco = []
        for it in sys.argv[10].split(','):
            q = it.split(':')
            deco.append((float(q[1]) + float(q[2]), q))
        for _, q in sorted(deco, key=lambda t: t[0]):
            sp = Image.open(os.path.join(P2, q[0] + '.png')).convert('RGBA'); sp = sp.crop(sp.getchannel('A').getbbox())
            if len(q) > 4 and q[4] == 'm': sp = sp.transpose(Image.FLIP_LEFT_RIGHT)
            hh_ = float(q[3]); sp = sp.resize((max(1, round(sp.width * hh_ / sp.height)), round(hh_)), Image.LANCZOS)
            x, y = P(float(q[1]), float(q[2])); x, y = x / SS, y / SS
            sh = Image.new('RGBA', img.size, (0, 0, 0, 0))
            ImageDraw.Draw(sh).ellipse([(x - sp.width * 0.42) * SS, (y - 3) * SS, (x + sp.width * 0.42) * SS, (y + 5) * SS], fill=(30, 36, 18, 110))
            img_c.alpha_composite(sh)
            img_c.alpha_composite(sp.resize((sp.width * SS, sp.height * SS), Image.LANCZOS), (round((x - sp.width / 2) * SS), round((y - sp.height + 4) * SS)))

    out = img.copy()
    out.alpha_composite(img_b)
    out.alpha_composite(img_c)
    out = out.resize((W, H), Image.LANCZOS)

    # recadrage sur le contenu en gardant le centre du losange comme ancre
    ancre = (W / 2, yt + Hd / 2)
    a = out.getchannel('A').getbbox()
    out = out.crop((0, a[1], W, a[3]))
    ancre = (ancre[0], ancre[1] - a[1])
    out.save(os.path.join(dossier_sortie, sortie + '.png'), optimize=True)

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
    os.makedirs(os.path.join(D, 'ombres'), exist_ok=True); om.save(os.path.join(D, 'ombres', sortie + '.png'))

    A = json.load(open(os.path.join(D, 'ancres.json')))
    A[sortie + '.png'] = {'largeur': w, 'hauteur': h, 'ancre_x': round(ancre[0]), 'ancre_y': round(ancre[1]),
              'echelle_px_par_m': 64.0, 'emprise_px': Wd, 'emprise_cases': cases}
    json.dump(A, open(os.path.join(D, 'ancres.json'), 'w'), indent=1)
    print(nom, 'ok', (w, h), 'losange', (Wd, Hd), 'ancre', ancre)


if __name__ == '__main__':
    main()
