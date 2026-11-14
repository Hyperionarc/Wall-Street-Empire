import math, random
import numpy as np
from engine import *

WOOD = (204, 158, 98); KRAFT = (198, 150, 90); STEEL = (176, 186, 198); COPPER = (226, 122, 44)
YELLOW = (248, 198, 22); ORANGE = (242, 112, 24); TURQ = (0, 172, 178)
GRAYD = (72, 77, 88); GRAYM = (142, 148, 158); GRAYL = (200, 205, 212); WHITE = (238, 240, 242)
BLUE = (38, 92, 178); RED = (206, 44, 40); BELT = (64, 68, 76); BLACK = (34, 36, 42)


def pallet(sc, x, y, z=0.0, L=1.2, Wd=0.8, c=WOOD):
    for xa in (0.0, (L - 0.1) / 2, L - 0.1):
        sc.box(x + xa, y, z, x + xa + 0.1, y + Wd, z + 0.022, c)
    for ya in (0.0, (Wd - 0.1) / 2, Wd - 0.1):
        sc.box(x, y + ya, z + 0.022, x + L, y + ya + 0.1, z + 0.122, shade(c, 0.9))
    n, gap = 7, 0.03
    b = (L - (n - 1) * gap) / n
    for i in range(n):
        xa = i * (b + gap)
        sc.box(x + xa, y, z + 0.122, x + xa + b, y + Wd, z + 0.144, c)
    return z + 0.144


def cartons(sc, x, y, z, layers=2, c=KRAFT, wrap=True, seed=0, lx=1.2, ly=0.8, h=0.36, nx=2, ny=2):
    rng = random.Random(seed)
    m = 0.02
    tape = mix(c, (236, 222, 190), 0.55)
    for l in range(layers):
        z0 = z + l * h; z1 = z0 + h - 0.006
        for i, j in sorted(((i, j) for i in range(nx) for j in range(ny)), key=lambda t: t[0] + t[1]):
            bx0 = x + m + i * (lx - 2 * m) / nx; bx1 = x + m + (i + 1) * (lx - 2 * m) / nx - 0.008
            by0 = y + m + j * (ly - 2 * m) / ny; by1 = y + m + (j + 1) * (ly - 2 * m) / ny - 0.008
            cc = shade(c, 0.95 + rng.random() * 0.1)
            sc.box(bx0, by0, z0, bx1, by1, z1, cc)
            ym = (by0 + by1) / 2
            sc.poly([(bx0, ym - 0.03, z1), (bx1, ym - 0.03, z1), (bx1, ym + 0.03, z1), (bx0, ym + 0.03, z1)], lit(tape, (0, 0, 1)))
            sc.poly([(bx1, ym - 0.03, z1 - 0.12), (bx1, ym + 0.03, z1 - 0.12), (bx1, ym + 0.03, z1), (bx1, ym - 0.03, z1)], lit(tape, (1, 0, 0)))
            if j == ny - 1 and rng.random() < 0.7:   # etiquette blanche (sans texte)
                xa = bx0 + 0.08
                sc.poly([(xa, by1, z0 + 0.1), (xa + 0.16, by1, z0 + 0.1), (xa + 0.16, by1, z0 + 0.22), (xa, by1, z0 + 0.22)], (236, 236, 230))
    if wrap:
        zt = z + layers * h
        film = (225, 240, 250)
        sc.poly([(x + lx, y, z), (x + lx, y + ly, z), (x + lx, y + ly, zt), (x + lx, y, zt)], film, alpha=34)
        sc.poly([(x, y + ly, z), (x + lx, y + ly, z), (x + lx, y + ly, zt), (x, y + ly, zt)], film, alpha=46)
        sc.poly([(x, y, zt), (x + lx, y, zt), (x + lx, y + ly, zt), (x, y + ly, zt)], film, alpha=40)
        for a, w in ((0.15, 0.1), (0.55, 0.05)):
            sc.poly([(x + lx * a, y + ly, z), (x + lx * (a + w), y + ly, z), (x + lx * (a + w + 0.25), y + ly, zt), (x + lx * (a + 0.25), y + ly, zt)], (255, 255, 255), alpha=60)
    return z + layers * h


def bobine_acier(sc):
    zt = pallet(sc, 0, 0)
    sc.cyl((0.6, 0.4, zt), 'z', 0.55, 0.39, STEEL, spec=0.75, rings=(0.25, 0.75), ringc=(60, 70, 96), hole=0.13, capc=(196, 204, 214))
    for k, rr in enumerate(np.arange(0.17, 0.38, 0.03)):
        pts = [(0.6 + rr * math.cos(t), 0.4 + rr * math.sin(t), zt + 0.55) for t in np.linspace(0, 6.283, 40)]
        sc.line(pts, (150, 160, 174) if k % 2 else (226, 232, 240), 0.5)
    # reflet sur le dessus
    sc.poly([(0.6 + 0.16 * math.cos(t), 0.4 + 0.16 * math.sin(t), zt + 0.55) for t in (3.3, 3.7)] +
            [(0.6 + 0.37 * math.cos(t), 0.4 + 0.37 * math.sin(t), zt + 0.55) for t in (3.8, 3.2)], (255, 255, 255), alpha=110)
    sc.sh_box(0, 0, 1.2, 0.8, 0.14); sc.sh_disk(0.6, 0.4, 0.39, zt + 0.55)


def bobine_cuivre(sc):
    zt = pallet(sc, 0, 0)
    R, cz = 0.5, zt + 0.5
    fl = (150, 108, 66)
    sc.cyl((0.6, 0.06, cz), 'y', 0.05, R, fl)
    sc.cyl((0.6, 0.11, cz), 'y', 0.58, 0.42, COPPER, spec=0.55, rings=[i / 15 for i in range(1, 15)], ringc=(170, 78, 22), edge=False)
    sc.cyl((0.6, 0.69, cz), 'y', 0.05, R, fl)
    c = (0.6, 0.745, cz)
    def ring(r, col, e=True):
        sc.poly([(c[0] + r * math.sin(t), c[1], c[2] + r * math.cos(t)) for t in np.linspace(0, 6.283, 36, endpoint=False)], lit(col, (0, 1, 0)), edge_of(col) if e else None)
    ring(0.2, shade(fl, 0.8)); ring(0.07, (40, 40, 46))
    for t in np.linspace(0, 6.283, 6, endpoint=False):
        sc.line([(c[0] + 0.22 * math.sin(t), c[1], c[2] + 0.22 * math.cos(t)), (c[0] + 0.47 * math.sin(t), c[1], c[2] + 0.47 * math.cos(t))], shade(fl, 0.5), 0.7)
    sc.sh_box(0, 0, 1.2, 0.8, 0.14); sc.sh_box(0.15, 0.06, 1.05, 0.74, zt + 0.95, z0=0.2)


def plaques_acier(sc):
    zt = pallet(sc, 0, 0)
    x0, y0, x1, y1 = 0.05, 0.05, 1.15, 0.75
    n, t = 9, 0.045
    z1 = zt + n * t
    c = (160, 170, 184)
    sc.box(x0, y0, zt, x1, y1, z1, c)
    for i in range(1, n):
        z = zt + i * t
        sc.line([(x0, y1, z), (x1, y1, z)], shade(c, 0.5), 0.6)
        sc.line([(x1, y0, z), (x1, y1, z)], shade(c, 0.38), 0.6)
    for a, w in ((0.1, 0.16), (0.42, 0.06), (0.6, 0.2)):
        sc.poly([(x0 + 1.1 * a, y1, z1), (x0 + 1.1 * (a + w), y1, z1), (x0 + 1.1 * (a + w) + 0.25, y0, z1), (x0 + 1.1 * a + 0.25, y0, z1)], (255, 255, 255), alpha=85)
    st = (40, 60, 120)
    for xa in (0.3, 0.86):
        sc.poly([(xa, y0, z1 + .002), (xa + 0.04, y0, z1 + .002), (xa + 0.04, y1, z1 + .002), (xa, y1, z1 + .002)], lit(st, (0, 0, 1)))
        sc.poly([(xa, y1 + .002, zt), (xa + 0.04, y1 + .002, zt), (xa + 0.04, y1 + .002, z1), (xa, y1 + .002, z1)], lit(st, (0, 1, 0)))
    sc.sh_box(0, 0, 1.2, 0.8, z1)


def palette_cartons(sc):
    zt = pallet(sc, 0, 0)
    zt = cartons(sc, 0, 0, zt, layers=3, seed=4)
    sc.sh_box(0, 0, 1.2, 0.8, zt)


def palette_vide(sc):
    zt = pallet(sc, 0, 0)
    sc.sh_box(0, 0, 1.2, 0.8, zt)


def rack(sc, loaded=True):
    L, Wd, Hh = 2.74, 1.1, 3.75
    UP = (36, 84, 168); BM = (240, 120, 24)
    levels = (0.0, 1.25, 2.5)
    xs = (0.0, 2.66)
    u = 0.08
    def upright(x, y):
        sc.box(x, y, 0, x + u, y + u, Hh, UP)
        sc.box(x - 0.03, y - 0.03, 0, x + u + 0.03, y + u + 0.03, 0.02, GRAYD)
    def endframe(x):
        for z in (0.3, 1.3, 2.3, 3.3):
            sc.box(x + 0.02, u, z, x + 0.06, Wd - u, z + 0.04, shade(UP, 0.9))
        for za, zb in ((0.3, 1.3), (1.3, 2.3), (2.3, 3.3)):
            sc.beam((x + 0.04, u, za), (x + 0.04, Wd - u, zb), 0.018, 0.018, shade(UP, 0.9))
    # fond
    endframe(xs[0])
    for x in xs:
        upright(x, 0)
    for z in levels[1:]:
        sc.box(0, 0.01, z - 0.12, L, 0.06, z, BM)
    # marchandises
    if loaded:
        rng = random.Random(7)
        kinds = [(KRAFT, True), ((228, 226, 218), True), (KRAFT, False), ((70, 120, 190), False), (KRAFT, True), ((214, 190, 150), True)]
        for li, z in enumerate(levels):
            for b in range(1):
                for p in range(2):
                    px = xs[b] + u + 0.07 + p * 1.27
                    zt = pallet(sc, px, 0.15, z)
                    col, wr = kinds[rng.randrange(len(kinds))]
                    cartons(sc, px, 0.15, zt, layers=rng.choice((2, 2, 3)) if li < 2 else 2, c=col, wrap=wr, seed=rng.randrange(99), h=0.33)
    # avant
    for z in levels[1:]:
        sc.box(0, Wd - 0.06, z - 0.12, L, Wd - 0.01, z, BM)
    for x in xs:
        upright(x, Wd - u)
    endframe(xs[1])
    # protections jaunes au pied
    for x in xs:
        sc.box(x - 0.02, Wd - 0.01, 0, x + u + 0.02, Wd + 0.03, 0.4, YELLOW)
    sc.sh_box(0, 0, L, Wd, Hh if loaded else 0.05)
    if not loaded:
        for x in xs:
            sc.sh_box(x, 0, x + u, Wd, Hh)
        for z in levels[1:]:
            sc.sh_pts([(0, 0, z), (L, 0, z), (L, Wd, z), (0, Wd, z), (0, 0, z - .12), (L, Wd, z - .12)])


def rack_stockage(sc): rack(sc, True)
def rack_vide(sc): rack(sc, False)


def convoyeur_droit(sc):
    ya, yb = 1.5, 2.5
    for x in (0.3, 1.96, 3.62):
        for y in (ya + 0.04, yb - 0.12):
            sc.box(x, y, 0, x + 0.08, y + 0.08, 0.62, GRAYM)
            sc.box(x - 0.03, y - 0.03, 0, x + 0.11, y + 0.11, 0.03, GRAYD)
        sc.box(x + 0.01, ya + 0.1, 0.22, x + 0.07, yb - 0.1, 0.28, GRAYM)
    def rails(z0, which=(0, 1)):
        if 0 in which:
            sc.box(0, ya, z0, 4, ya + 0.07, 0.86, GRAYL)
        if 1 in which:
            sc.box(0, yb - 0.07, z0, 4, yb, 0.86, GRAYL)
    rails(0.58)
    sc.box(0, ya + 0.07, 0.6, 4, yb - 0.07, 0.74, BELT)
    for x in np.arange(0.12, 4, 0.16):
        sc.line([(x, ya + 0.08, 0.74), (x, yb - 0.08, 0.74)], (84, 88, 98), 0.5)
    rails(0.74, (0,))
    for x, lx, ly, h, col in ((0.75, 0.5, 0.42, 0.36, KRAFT), (2.0, 0.62, 0.5, 0.3, (208, 164, 104)), (3.2, 0.44, 0.44, 0.44, KRAFT)):
        sc.box(x - lx / 2, 2 - ly / 2, 0.74, x + lx / 2, 2 + ly / 2, 0.74 + h, col)
        tp = mix(col, (236, 222, 190), 0.55); z = 0.74 + h
        sc.poly([(x - lx / 2, 1.97, z), (x + lx / 2, 1.97, z), (x + lx / 2, 2.03, z), (x - lx / 2, 2.03, z)], lit(tp, (0, 0, 1)))
        sc.poly([(x + lx / 2, 1.97, z - 0.1), (x + lx / 2, 2.03, z - 0.1), (x + lx / 2, 2.03, z), (x + lx / 2, 1.97, z)], lit(tp, (1, 0, 0)))
    rails(0.58, (1,))
    sc.line([(0.02, yb + 0.002, 0.8), (3.98, yb + 0.002, 0.8)], YELLOW, 1.0)
    # motoreducteur
    sc.box(1.2, yb, 0.3, 1.62, yb + 0.26, 0.58, BLUE)
    sc.cyl((1.41, yb + 0.26, 0.44), 'y', 0.16, 0.1, GRAYD)
    sc.sh_box(0, ya, 4, yb, 0.86, z0=0.5)
    for x in (0.3, 1.96, 3.62):
        sc.sh_box(x, ya, x + 0.1, yb, 0.6)


def convoyeur_coin(sc):
    cx, cy = 0.0, 4.0
    def pt(R, ph): return (cx + R * math.sin(ph), cy - R * math.cos(ph))
    n = 14
    phs = [math.pi / 2 * i / n for i in range(n + 1)]
    def seg(Ra, Rb, i): return [pt(Ra, phs[i]), pt(Rb, phs[i]), pt(Rb, phs[i + 1]), pt(Ra, phs[i + 1])]
    def dep(p): return sum(q[0] + q[1] for q in p) / len(p)
    for ph in (0.16, math.pi / 4, math.pi / 2 - 0.16):
        for R in (1.58, 2.42):
            x, y = pt(R, ph)
            sc.box(x - 0.04, y - 0.04, 0, x + 0.04, y + 0.04, 0.62, GRAYM)
            sc.box(x - 0.07, y - 0.07, 0, x + 0.07, y + 0.07, 0.03, GRAYD)
    rl = [seg(1.5, 1.57, i) for i in range(n)] + [seg(2.43, 2.5, i) for i in range(n)]
    for p in sorted(rl, key=dep):
        sc.prism(p, 0.58, 0.86, GRAYL, edge=False)
    for i in range(n):
        sc.prism(seg(1.57, 2.43, i), 0.6, 0.74, BELT, edge=False)
    for ph in np.linspace(0, math.pi / 2, 30):
        a, b = pt(1.58, ph), pt(2.42, ph)
        sc.line([(a[0], a[1], 0.74), (b[0], b[1], 0.74)], (84, 88, 98), 0.5)
    items = [(dep(p), 'r', p) for p in rl]
    for ph, lx, ly, h, col in ((0.42, 0.5, 0.42, 0.36, KRAFT), (1.2, 0.46, 0.46, 0.42, (208, 164, 104))):
        x, y = pt(2.0, ph)
        items.append((x + y + 0.3, 'c', (x, y, lx, ly, ph, h, col)))
    for _, k, p in sorted(items, key=lambda t: t[0]):
        if k == 'r':
            sc.prism(p, 0.74, 0.86, GRAYL, edge=False)
        else:
            x, y, lx, ly, ph, h, col = p
            sc.rbox(x, y, lx, ly, ph, 0.74, 0.74 + h, col)
    for R in (1.5, 1.57, 2.43, 2.5):
        sc.line([(pt(R, ph)[0], pt(R, ph)[1], 0.86) for ph in phs], edge_of(GRAYL), 0.8)
    sc.line([(pt(2.5, ph)[0], pt(2.5, ph)[1], 0.58) for ph in phs[n // 2:]], edge_of(GRAYL), 0.8)
    sc.line([(pt(1.5, ph)[0], pt(1.5, ph)[1], 0.58) for ph in phs[n // 2:]], edge_of(GRAYL), 0.8)
    sc.line([(pt(2.502, ph)[0], pt(2.502, ph)[1], 0.8) for ph in phs[n // 2 + 1:]], YELLOW, 1.0)
    sc.sh_pts([(pt(R, ph)[0], pt(R, ph)[1], z) for R in (1.5, 2.5) for ph in phs for z in (0.5, 0.86)][:0] or [(0, 0, 0)])
    for i in range(n):
        p = seg(1.5, 2.5, i)
        sc.sh_pts([(q[0], q[1], z) for q in p for z in (0.5, 0.86)])
