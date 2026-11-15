import math, random
import numpy as np
from PIL import Image, ImageDraw
from engine import *
from objs1 import *


def rL(sc, y, x0, z0, x1, z1, c, edge=None, alpha=255, raw=False):
    sc.poly([(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], c if raw else lit(c, (0, 1, 0)), edge, alpha=alpha)


def rR(sc, x, y0, z0, y1, z1, c, edge=None, alpha=255, raw=False):
    sc.poly([(x, y0, z0), (x, y1, z0), (x, y1, z1), (x, y0, z1)], c if raw else lit(c, (1, 0, 0)), edge, alpha=alpha)


def rT(sc, z, x0, y0, x1, y1, c, edge=None, alpha=255, raw=False):
    sc.poly([(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)], c if raw else lit(c, (0, 0, 1)), edge, alpha=alpha)


def carton(sc, x0, y0, z0, x1, y1, z1, col=KRAFT):
    sc.box(x0, y0, z0, x1, y1, z1, col)
    tp = mix(col, (236, 222, 190), 0.55); ym = (y0 + y1) / 2
    rT(sc, z1, x0, ym - 0.03, x1, ym + 0.03, tp)
    rR(sc, x1, ym - 0.03, z1 - 0.1, ym + 0.03, z1, tp)


# ------------------------------------------------------------------ convoyeurs (tuile 2 m)
def convoyeur_droit(sc):
    ya, yb = 0.55, 1.45
    for x in (0.14, 1.78):
        for y in (ya + 0.04, yb - 0.12):
            sc.box(x, y, 0, x + 0.08, y + 0.08, 0.62, GRAYM)
            sc.box(x - 0.03, y - 0.03, 0, x + 0.11, y + 0.11, 0.03, GRAYD)
        sc.box(x + 0.01, ya + 0.1, 0.22, x + 0.07, yb - 0.1, 0.28, GRAYM)
    sc.box(0, ya, 0.58, 2, ya + 0.07, 0.86, GRAYL)
    sc.box(0, yb - 0.07, 0.58, 2, yb, 0.86, GRAYL)
    sc.box(0, ya + 0.07, 0.6, 2, yb - 0.07, 0.74, BELT)
    for x in np.arange(0.06, 2, 0.12):
        sc.line([(x, ya + 0.08, 0.74), (x, yb - 0.08, 0.74)], (88, 92, 102), 0.6)
    sc.box(0, ya, 0.74, 2, ya + 0.07, 0.86, GRAYL)
    carton(sc, 0.3, 0.8, 0.74, 0.74, 1.2, 1.08)
    carton(sc, 1.15, 0.76, 0.74, 1.67, 1.24, 1.02, (210, 166, 106))
    sc.box(0, yb - 0.07, 0.58, 2, yb, 0.86, GRAYL)
    sc.line([(0.02, yb + 0.002, 0.8), (1.98, yb + 0.002, 0.8)], YELLOW, 1.4)
    for x in np.arange(0.25, 2, 0.5):
        sc.disk(x, yb - 0.035, 0.861, 0.014, GRAYD, edge=False)
    sc.box(0.72, yb, 0.3, 1.08, yb + 0.24, 0.58, BLUE)
    sc.cyl((0.9, yb + 0.24, 0.44), 'y', 0.14, 0.1, GRAYD)
    sc.sh_box(0, ya, 2, yb, 0.86, z0=0.5)
    for x in (0.14, 1.78):
        sc.sh_box(x, ya, x + 0.1, yb, 0.6)


def convoyeur_coin(sc):
    cx, cy = 0.0, 2.0
    def pt(R, ph): return (cx + R * math.sin(ph), cy - R * math.cos(ph))
    n = 16
    phs = [math.pi / 2 * i / n for i in range(n + 1)]
    def seg(Ra, Rb, i): return [pt(Ra, phs[i]), pt(Rb, phs[i]), pt(Rb, phs[i + 1]), pt(Ra, phs[i + 1])]
    def dep(p): return sum(q[0] + q[1] for q in p) / len(p)
    for ph in (0.22, math.pi / 2 - 0.22):
        for R in (0.64, 1.36):
            x, y = pt(R, ph)
            sc.box(x - 0.04, y - 0.04, 0, x + 0.04, y + 0.04, 0.62, GRAYM)
            sc.box(x - 0.07, y - 0.07, 0, x + 0.07, y + 0.07, 0.03, GRAYD)
    rl = [seg(0.55, 0.62, i) for i in range(n)] + [seg(1.38, 1.45, i) for i in range(n)]
    for p in sorted(rl, key=dep):
        sc.prism(p, 0.58, 0.86, GRAYL, edge=False)
    for i in range(n):
        sc.prism(seg(0.62, 1.38, i), 0.6, 0.74, BELT, edge=False)
    for ph in np.linspace(0, math.pi / 2, 22):
        a, b = pt(0.63, ph), pt(1.37, ph)
        sc.line([(a[0], a[1], 0.74), (b[0], b[1], 0.74)], (88, 92, 102), 0.6)
    items = [(dep(p), 'r', p) for p in rl]
    x, y = pt(1.0, 0.85)
    items.append((x + y + 0.25, 'c', (x, y)))
    for _, k, p in sorted(items, key=lambda t: t[0]):
        if k == 'r':
            sc.prism(p, 0.74, 0.86, GRAYL, edge=False)
        else:
            sc.rbox(p[0], p[1], 0.46, 0.42, 0.85, 0.74, 1.1, KRAFT)
    e = edge_of(GRAYL)
    for R in (0.55, 0.62, 1.38, 1.45):
        sc.line([(pt(R, ph)[0], pt(R, ph)[1], 0.86) for ph in phs], e, 0.9)
    for R in (0.55, 1.45):
        sc.line([(pt(R, ph)[0], pt(R, ph)[1], 0.58) for ph in phs[n // 2:]], e, 0.9)
    sc.line([(pt(1.452, ph)[0], pt(1.452, ph)[1], 0.8) for ph in phs[n // 2 + 1:]], YELLOW, 1.4)
    sc.line([(0, 0.55, 0.58), (0, 0.55, 0.86)], e, 0.9)
    for i in range(n):
        sc.sh_pts([(q[0], q[1], z) for q in seg(0.55, 1.45, i) for z in (0.5, 0.86)])


# ------------------------------------------------------------------ machines
def screen(sc, y, x0, z0, x1, z1):
    rL(sc, y, x0, z0, x1, z1, (20, 30, 48), GRAYD, raw=True)
    w, h = x1 - x0, z1 - z0
    pts = [(x0 + w * (0.08 + 0.1 * i), y, z0 + h * (0.5 + 0.3 * v)) for i, v in enumerate((0.2, 0.6, 0.35, 0.9, 0.7, 1.0))]
    sc.line(pts, (70, 220, 140), 1.0)
    for i, v in enumerate((0.5, 0.8, 0.35, 0.65)):
        xa = x0 + w * (0.68 + 0.07 * i)
        rL(sc, y, xa, z0 + h * 0.5, xa + w * 0.045, z0 + h * (0.5 + 0.38 * v), (80, 170, 240), raw=True)
    for i, c in enumerate(((240, 170, 40), (80, 170, 240), (70, 220, 140))):
        rL(sc, y, x0 + w * (0.08 + 0.3 * i), z0 + h * 0.12, x0 + w * (0.3 + 0.3 * i), z0 + h * 0.34, c, raw=True)


def machine_assemblage(sc):
    X, Y = 2.4, 1.8
    sc.box(0, 0, 0, X, Y, 0.5, GRAYM)
    rL(sc, Y, 0, 0, X, 0.07, GRAYD); rR(sc, X, 0, 0, Y, 0.07, GRAYD)
    sc.box(0.03, 0.03, 0.5, X - 0.03, Y - 0.03, 2.0, WHITE)
    y = Y - 0.03
    # fenetre vitree
    with sc.clip([(0.2, y, 0.85), (1.45, y, 0.85), (1.45, y, 1.82), (0.2, y, 1.82)]):
        rL(sc, y, 0.2, 0.85, 1.45, 1.82, (46, 76, 112), raw=True)
        rL(sc, y, 0.2, 0.85, 1.45, 1.05, (88, 96, 110), raw=True)
        sc.beam((0.5, y, 1.75), (0.75, y, 1.4), 0.05, 0.05, (120, 132, 150))
        sc.beam((0.75, y, 1.4), (0.95, y, 1.15), 0.04, 0.04, (150, 160, 176))
        sc.box(0.85, y - 0.2, 1.05, 1.15, y, 1.12, (230, 150, 50))
        sc.poly([(0.3, y, 0.85), (0.55, y, 0.85), (0.95, y, 1.82), (0.7, y, 1.82)], (255, 255, 255), alpha=50)
        sc.poly([(0.68, y, 0.85), (0.76, y, 0.85), (1.16, y, 1.82), (1.08, y, 1.82)], (255, 255, 255), alpha=40)
    sc.line([(0.2, y, 0.85), (1.45, y, 0.85), (1.45, y, 1.82), (0.2, y, 1.82), (0.2, y, 0.85)], GRAYD, 1.6)
    sc.line([(0.825, y, 0.85), (0.825, y, 1.82)], GRAYD, 1.2)
    for z in (0.58, 0.64, 0.7):
        sc.line([(0.3, y, z), (1.3, y, z)], GRAYM, 0.8)
    # pupitre + ecran
    sc.box(1.62, y, 0.9, 2.26, y + 0.14, 1.82, GRAYL)
    screen(sc, y + 0.14, 1.68, 1.28, 2.2, 1.76)
    for i, c in enumerate((RED, (60, 190, 90), YELLOW, GRAYD)):
        rL(sc, y + 0.14, 1.7 + i * 0.13, 1.0, 1.79 + i * 0.13, 1.1, c, edge_of(c), raw=True)
    # face +x : trappe + sortie convoyeur
    x = X - 0.03
    rR(sc, x, 0.25, 1.12, 1.52, 1.85, (226, 229, 232), GRAYM)
    sc.line([(x, 0.4, 1.45), (x, 0.4, 1.6)], GRAYD, 1.6)
    for z in (1.2, 1.26, 1.32):
        sc.line([(x, 0.9, z), (x, 1.4, z)], GRAYM, 0.8)
    rR(sc, x, 0.45, 0.58, 1.3, 1.0, (30, 34, 44), GRAYD, raw=True)
    sc.box(X - 0.03, 0.5, 0.5, X + 0.5, 1.25, 0.62, GRAYL)
    rT(sc, 0.621, X - 0.03, 0.56, X + 0.5, 1.19, BELT)
    sc.box(X + 0.1, 0.72, 0.62, X + 0.4, 1.02, 0.8, (60, 130, 200))
    # toit
    sc.box(0, 0, 2.0, X, Y, 2.1, GRAYL)
    sc.box(1.3, 0.3, 2.1, 2.1, 1.1, 2.3, GRAYM)
    for xx in np.arange(1.4, 2.1, 0.1):
        sc.line([(xx, 1.1, 2.14), (xx, 1.1, 2.27)], GRAYD, 0.8)
    sc.cyl((0.3, 0.35, 2.1), 'z', 0.14, 0.03, GRAYD)
    for i, c in enumerate(((60, 200, 90), (250, 190, 30), (225, 50, 45))):
        sc.cyl((0.3, 0.35, 2.24 + i * 0.1), 'z', 0.1, 0.055, c, spec=0.4)
    sc.sh_box(0, 0, X, Y, 2.1); sc.sh_box(X, 0.5, X + 0.5, 1.25, 0.8)


def robot_6_axes(sc):
    sc.box(-0.5, -0.5, 0, 0.5, 0.5, 0.06, GRAYD)
    for a, b in ((-0.42, -0.42), (0.42, -0.42), (-0.42, 0.42), (0.42, 0.42)):
        sc.disk(a, b, 0.061, 0.035, GRAYL)
    sc.cyl((0, 0, 0.06), 'z', 0.3, 0.38, GRAYM)
    sc.cyl((0, 0, 0.36), 'z', 0.34, 0.31, ORANGE, spec=0.25)
    sc.cyl((0, 0, 0.44), 'z', 0.07, 0.315, TURQ, edge=False)
    # moteur + coude arriere
    sc.cyl((0, -0.27, 0.9), 'y', 0.38, 0.2, ORANGE, spec=0.25)
    sc.cyl((-0.22, -0.02, 2.02), 'x', 0.5, 0.1, TURQ, spec=0.3)
    sc.cyl((0.3, -0.14, 1.97), 'y', 0.26, 0.17, ORANGE, spec=0.25)
    sc.beam((0.3, 0.0, 1.97), (1.22, 0.0, 1.72), 0.095, 0.1, ORANGE, side=(0, 1, 0))
    sc.cyl((0.62, -0.1, 1.885), 'y', 0.2, 0.06, TURQ, edge=False)
    # bras inferieur (cote camera)
    sc.cyl((0, 0.1, 0.9), 'y', 0.2, 0.18, ORANGE, spec=0.25)
    sc.beam((0, 0.2, 0.9), (0.3, 0.2, 1.97), 0.1, 0.125, ORANGE, side=(0, 1, 0))
    sc.cyl((0.3, 0.1, 1.97), 'y', 0.2, 0.17, ORANGE, spec=0.25)
    sc.cyl((0, 0.3, 0.9), 'y', 0.03, 0.12, TURQ)
    sc.cyl((0.3, 0.3, 1.97), 'y', 0.03, 0.11, TURQ)
    # poignet + pince
    sc.sphere((1.24, 0, 1.71), 0.12, TURQ, spec=0.4)
    sc.cyl((1.26, 0, 1.38), 'z', 0.26, 0.06, GRAYM, spec=0.4)
    sc.box(1.12, -0.16, 1.32, 1.4, 0.16, 1.38, GRAYD)
    sc.box(1.2, -0.16, 1.1, 1.32, -0.1, 1.32, GRAYL)
    sc.box(1.2, 0.1, 1.1, 1.32, 0.16, 1.32, GRAYL)
    sc.sh_box(-0.5, -0.5, 0.5, 0.5, 0.75)
    sc.sh_pts([(0, 0.1, 0.9), (0, 0.3, 0.9), (0.3, 0.1, 2.1), (0.3, 0.3, 2.1)])
    sc.sh_pts([(0.3, -0.1, 1.9), (0.3, 0.1, 2.1), (1.4, -0.16, 1.2), (1.4, 0.16, 1.8)])


def presse(sc):
    PB = (48, 96, 160)
    X, Y = 2.2, 1.8
    sc.box(0, 0, 0, X, Y, 0.55, PB)
    n = 14
    for i in range(n):   # bandes de securite
        xa = X * i / n; xb = X * (i + 1) / n
        sc.poly([(xa, Y, 0), (xb, Y, 0), (min(X, xb + 0.08), Y, 0.14), (min(X, xa + 0.08), Y, 0.14)], YELLOW if i % 2 else BLACK)
    sc.box(0.35, 0.25, 0.55, 1.85, 1.55, 0.68, GRAYL)
    sc.box(0.6, 0.5, 0.68, 1.6, 1.3, 0.95, STEEL)
    sc.box(0.5, 0.42, 0.95, 1.7, 1.38, 0.975, (214, 220, 230))
    col = lambda x, y: sc.cyl((x, y, 0.55), 'z', 1.95, 0.1, STEEL, spec=0.8)
    col(0.17, 0.2)
    sc.box(0.65, 0.55, 1.3, 1.55, 1.25, 1.5, STEEL)
    sc.box(0.3, 0.3, 1.5, 1.9, 1.5, 1.8, PB)
    sc.cyl((1.1, 0.9, 1.8), 'z', 0.7, 0.17, STEEL, spec=0.8)
    col(2.03, 0.2); col(0.17, 1.6); col(2.03, 1.6)
    for x, y in ((0.17, 1.6), (2.03, 1.6), (2.03, 0.2)):
        sc.cyl((x, y, 1.52), 'z', 0.26, 0.14, shade(PB, 0.85))
    sc.box(0, 0, 2.5, X, Y, 3.0, PB)
    rL(sc, Y, 0.3, 2.62, 1.9, 2.88, YELLOW, edge_of(YELLOW))
    for i in range(8):
        xa = 0.3 + 0.2 * i
        if i % 2 == 0:
            sc.poly([(xa, Y, 2.62), (xa + 0.2, Y, 2.62), (xa + 0.3, Y, 2.88), (xa + 0.1, Y, 2.88)], BLACK)
    sc.cyl((1.1, 0.9, 3.0), 'z', 0.5, 0.42, ORANGE, spec=0.35, rings=(0.15, 0.85))
    sc.cyl((1.1, 0.9, 3.5), 'z', 0.1, 0.2, GRAYD)
    sc.box(0.3, 0.2, 3.0, 0.6, 0.6, 3.25, GRAYM)
    # pupitre
    sc.box(2.3, 0.1, 0, 2.62, 0.5, 1.15, GRAYL)
    screen(sc, 0.5, 2.33, 0.78, 2.59, 1.08)
    sc.cyl((2.46, 0.5, 0.62), 'y', 0.04, 0.05, RED)
    sc.sh_box(0, 0, X, Y, 3.0); sc.sh_box(2.3, 0.1, 2.62, 0.5, 1.15); sc.sh_disk(1.1, 0.9, 0.42, 3.5, 3.0)


# ------------------------------------------------------------------ camions
def camion(sc, col, cabc, stripe, ouvert=False):
    X0, X1, Wt, ZB, ZT = 1.35, 4.4, 2.2, 0.95, 3.3
    R = 0.46
    def wheel(x, y):
        sc.cyl((x, y, R), 'y', 0.32, R, BLACK)
        for rr, c in ((0.27, GRAYL), (0.2, GRAYM), (0.08, GRAYD)):
            sc.poly([(x + rr * math.sin(t), y + 0.322, R + rr * math.cos(t)) for t in np.linspace(0, 6.283, 28, endpoint=False)], lit(c, (0, 1, 0)), edge_of(c))
    axles = (0.45, 1.6, 3.5)
    for x in axles:
        wheel(x, 0.0)
    sc.box(0.1, 0.35, 0.5, X1 - 0.05, Wt - 0.35, 0.8, GRAYD)
    # cabine
    sc.box(0, 0.1, 0.55, 1.25, 2.1, 2.75, cabc)
    rL(sc, 2.1, 0, 0.55, 1.25, 0.85, GRAYD)
    rL(sc, 2.1, 0.28, 1.7, 1.02, 2.45, (58, 94, 134), GRAYD, raw=True)
    sc.poly([(0.36, 2.1, 1.7), (0.52, 2.1, 1.7), (0.82, 2.1, 2.45), (0.66, 2.1, 2.45)], (255, 255, 255), alpha=60)
    sc.line([(0.2, 2.1, 0.9), (0.2, 2.1, 2.6), (1.1, 2.1, 2.6), (1.1, 2.1, 0.9)], edge_of(cabc), 0.8)
    sc.line([(0.95, 2.1, 1.5), (1.05, 2.1, 1.5)], GRAYD, 1.6)
    sc.box(0.14, 2.1, 1.95, 0.22, 2.3, 2.45, BLACK)
    sc.box(0.25, 0.2, 2.75, 1.22, 2.0, 3.22, cabc)
    sc.cyl((1.31, 1.98, 0.8), 'z', 2.5, 0.06, STEEL, spec=0.8)
    # remorque
    sc.box(X0, 0, ZB, X1, Wt, ZT, col)
    rL(sc, Wt, X0, ZB + 0.5, X1, ZB + 0.86, stripe)
    rL(sc, Wt, X0, ZB, X1, ZB + 0.09, GRAYD)
    for x in np.arange(X0 + 0.3, X1 - 0.05, 0.3):
        sc.line([(x, Wt, ZB + 0.1), (x, Wt, ZT - 0.04)], shade(lit(col, (0, 1, 0)), 0.86), 0.7)
    sc.line([(X0, Wt, ZT - 0.05), (X1, Wt, ZT - 0.05)], shade(lit(col, (0, 1, 0)), 0.8), 0.9)
    sc.box(2.25, Wt - 0.06, 0.6, 2.72, Wt - 0.02, 0.68, GRAYL)
    # face arriere
    O = [(X1, 0.1, ZB + 0.08), (X1, Wt - 0.1, ZB + 0.08), (X1, Wt - 0.1, ZT - 0.08), (X1, 0.1, ZT - 0.08)]
    rR(sc, X1, 0, ZB, Wt, ZB + 0.09, GRAYD)
    if ouvert:
        zf = ZB + 0.08
        with sc.clip(O):
            sc.poly(O, (26, 28, 36))
            sc.poly([(X0 + 0.1, 0.1, zf), (X1, 0.1, zf), (X1, 0.1, ZT), (X0 + 0.1, 0.1, ZT)], lit((196, 200, 206), (0, 1, 0)))
            for x in np.arange(X0 + 0.3, X1, 0.3):
                sc.line([(x, 0.1, zf), (x, 0.1, ZT)], (140, 146, 156), 0.7)
            sc.poly([(X0 + 0.1, 0.1, zf), (X0 + 0.1, Wt - 0.1, zf), (X0 + 0.1, Wt - 0.1, ZT), (X0 + 0.1, 0.1, ZT)], lit((170, 174, 182), (1, 0, 0)))
            sc.poly([(X0 + 0.1, 0.1, zf), (X1, 0.1, zf), (X1, Wt - 0.1, zf), (X0 + 0.1, Wt - 0.1, zf)], lit((168, 140, 104), (0, 0, 1)))
            for x in np.arange(X0 + 0.25, X1, 0.25):
                sc.line([(x, 0.1, zf), (x, Wt - 0.1, zf)], (126, 102, 74), 0.6)
            for (px, py, ly, sd) in ((X0 + 0.15, 0.14, 3, 1), (X0 + 1.4, 0.14, 2, 2), (X0 + 0.15, 1.12, 2, 3), (X0 + 1.4, 1.12, 3, 5)):
                zt = pallet(sc, px, py, zf)
                cartons(sc, px, py, zt, layers=ly, wrap=False, seed=sd, h=0.4)
            sc.poly(O, (10, 14, 30), alpha=70)
        sc.line(O + [O[0]], GRAYD, 1.6)
    else:
        dc = shade(col, 0.97)
        rR(sc, X1, 0.08, ZB + 0.1, 1.09, ZT - 0.07, dc, edge_of(col))
        rR(sc, X1, 1.11, ZB + 0.1, Wt - 0.08, ZT - 0.07, dc, edge_of(col))
        for y in (0.36, 0.84, 1.36, 1.84):
            sc.line([(X1, y, ZB + 0.12), (X1, y, ZT - 0.09)], (190, 196, 206), 1.2)
            sc.line([(X1, y - 0.1, ZB + 0.75), (X1, y + 0.02, ZB + 0.75)], GRAYD, 1.6)
        for y in (0.1, Wt - 0.1):
            for z in (ZB + 0.4, ZB + 1.2, ZT - 0.4):
                sc.line([(X1, y - 0.03, z), (X1, y + 0.03, z)], GRAYD, 2.0)
    # pare-chocs, feux, bavettes
    for y in (0.03, Wt - 0.37):
        rR(sc, X1 - 0.15, y, 0.12, y + 0.34, 0.6, (40, 42, 50), raw=True)
    sc.box(X1 - 0.1, 0.12, 0.5, X1 + 0.06, Wt - 0.12, 0.66, GRAYD)
    for y in (0.16, Wt - 0.42):
        rR(sc, X1 + 0.06, y, 0.52, y + 0.26, 0.64, (230, 40, 40), (120, 20, 20), raw=True)
    rR(sc, X1 + 0.06, 0.85, 0.52, 1.35, 0.64, (238, 238, 232), GRAYD, raw=True)
    for x in axles:
        wheel(x, Wt - 0.32)
    if ouvert:
        sc.box(X1 - 1.05, Wt, ZB + 0.1, X1, Wt + 0.05, ZT - 0.07, (214, 217, 222))
        for z in np.arange(ZB + 0.5, ZT - 0.1, 0.45):
            sc.line([(X1 - 1.02, Wt + 0.05, z), (X1 - 0.03, Wt + 0.05, z)], GRAYM, 0.8)
    sc.sh_box(0, 0.1, 1.25, 2.1, 3.0); sc.sh_box(X0, 0, X1, Wt, ZT)


CAM = {'blanc': (WHITE, WHITE, (150, 158, 170)), 'rouge': (WHITE, (206, 44, 40), (206, 44, 40)),
       'bleu': (WHITE, (40, 98, 190), (40, 98, 190))}


# ------------------------------------------------------------------ quai
def quai_chargement(sc):
    WC = (212, 216, 220); CO = (188, 186, 178)
    x = 0.35; ya, yb = 0.9, 3.1; zd, zt = 1.2, 3.6
    sc.box(0, 0, 0, x, 4.0, 4.2, WC)
    rR(sc, x, 0, 0, 4.0, zd, CO)
    for z in np.arange(zd + 0.3, 4.2, 0.3):
        sc.line([(x, 0, z), (x, 4.0, z)], shade(lit(WC, (1, 0, 0)), 0.88), 0.7)
    rR(sc, x, 0, 3.95, 4.0, 4.2, (60, 110, 190))
    O = [(x, ya, zd), (x, yb, zd), (x, yb, zt), (x, ya, zt)]
    zo = 2.25
    with sc.clip([(x, ya, zd), (x, yb, zd), (x, yb, zo), (x, ya, zo)]):
        sc.poly(O, (24, 26, 34))
        sc.poly([(-4, ya, zd), (x, ya, zd), (x, ya, zt), (-4, ya, zt)], lit((150, 154, 160), (0, 1, 0)))
        sc.poly([(-4, ya, zd), (x, ya, zd), (x, yb, zd), (-4, yb, zd)], lit((176, 176, 172), (0, 0, 1)))
        zp = pallet(sc, -1.3, 1.5, zd)
        cartons(sc, -1.3, 1.5, zp, layers=2, wrap=False, seed=3)
        sc.poly(O, (10, 14, 30), alpha=80)
    dc = (176, 182, 190)
    rR(sc, x, ya, zo, yb, zt, dc)
    for z in np.arange(zo, zt, 0.34):
        sc.line([(x, ya, z), (x, yb, z)], shade(lit(dc, (1, 0, 0)), 0.7), 1.0)
    for y in np.arange(ya + 0.2, yb - 0.3, 0.5):
        rR(sc, x, y, zo + 0.42, y + 0.3, zo + 0.6, (60, 90, 130), GRAYD, raw=True)
    rR(sc, x, ya, zo - 0.05, yb, zo + 0.03, BLACK, raw=True)
    sc.line(O + [O[0]], GRAYD, 1.8)
    # feux de quai
    rR(sc, x, 3.38, 2.2, 3.62, 2.75, (36, 38, 46), GRAYD, raw=True)
    for z, c in ((2.6, (230, 50, 45)), (2.33, (60, 210, 100))):
        sc.poly([(x, 3.5 + 0.08 * math.cos(t), z + 0.08 * math.sin(t)) for t in np.linspace(0, 6.283, 20, endpoint=False)], c, (20, 20, 24))
    # sas d'etancheite, niveleur, butoirs
    SH = (52, 54, 64)
    sc.box(x, ya - 0.14, zd, x + 0.4, ya, zt, SH)
    for y in (0.62, 3.22):
        sc.box(x, y, 0.75, x + 0.14, y + 0.16, 1.25, BLACK)
    lip = [(x, ya + 0.05, zd), (x + 0.95, ya + 0.05, zd - 0.14), (x + 0.95, yb - 0.05, zd - 0.14), (x, yb - 0.05, zd)]
    sc.poly([(x + 0.95, ya + 0.05, zd - 0.2), (x + 0.95, yb - 0.05, zd - 0.2), (x + 0.95, yb - 0.05, zd - 0.14), (x + 0.95, ya + 0.05, zd - 0.14)], lit(YELLOW, (1, 0, 0)), edge_of(YELLOW))
    sc.poly([(x, yb - 0.05, zd - 0.06), (x + 0.95, yb - 0.05, zd - 0.2), (x + 0.95, yb - 0.05, zd - 0.14), (x, yb - 0.05, zd)], lit(GRAYD, (0, 1, 0)), edge_of(GRAYD))
    sc.poly(lip, lit((120, 126, 136), (0.1, 0, 1)), edge_of(GRAYM))
    for u in np.arange(0.12, 0.95, 0.12):
        sc.line([(x + u, ya + 0.08, zd - 0.14 * u / 0.95), (x + u, yb - 0.08, zd - 0.14 * u / 0.95)], (96, 102, 112), 0.6)
    sc.line([(x + 0.9, ya + 0.05, zd - 0.132), (x + 0.9, yb - 0.05, zd - 0.132)], YELLOW, 1.6)
    sc.box(x, yb, zd, x + 0.4, yb + 0.14, zt, SH)
    sc.box(x, ya - 0.14, zt, x + 0.45, yb + 0.14, zt + 0.3, SH)
    rR(sc, x + 0.45, ya - 0.1, zt + 0.02, yb + 0.1, zt + 0.1, YELLOW, raw=False)
    for y in (0.55, 3.45):
        sc.cyl((1.75, y, 0), 'z', 1.0, 0.07, YELLOW, spec=0.3, rings=(0.72, 0.86), ringc=BLACK)
        sc.sh_disk(1.75, y, 0.07, 1.0)
    sc.sh_box(0, 0, x, 4.0, 4.2); sc.sh_box(x, ya - 0.14, x + 0.45, yb + 0.14, zt + 0.3)
    sc.sh_pts([(x, ya, 0.9), (x + 0.95, ya, 1.0), (x + 0.95, yb, 1.0), (x, yb, 0.9)])


# ------------------------------------------------------------------ chariot elevateur
def chariot_elevateur(sc):
    CY = YELLOW
    def wheel(x, y, r, ln):
        sc.cyl((x, y, r), 'y', ln, r, BLACK)
        for rr, c in ((r * 0.55, CY), (r * 0.2, GRAYD)):
            sc.poly([(x + rr * math.sin(t), y + ln + 0.002, r + rr * math.cos(t)) for t in np.linspace(0, 6.283, 24, endpoint=False)], lit(c, (0, 1, 0)), edge_of(c))
    wheel(0.38, 0.0, 0.24, 0.2); wheel(1.5, 0.0, 0.33, 0.24)
    sc.box(0.15, 0.08, 0.2, 1.9, 1.02, 0.75, CY)
    sc.box(0, 0.05, 0.25, 0.55, 1.05, 1.08, shade(CY, 0.94))
    for i in range(5):
        xa = 0.02 + i * 0.105
        if i % 2 == 0:
            sc.poly([(xa, 1.05, 0.25), (xa + 0.1, 1.05, 0.25), (xa + 0.18, 1.05, 0.45), (xa + 0.08, 1.05, 0.45)], BLACK)
    sc.box(0.55, 0.12, 0.75, 1.2, 0.98, 0.98, CY)
    post = lambda x, y, z0: sc.box(x, y, z0, x + 0.06, y + 0.06, 2.1, GRAYD)
    post(0.5, 0.1, 1.08); post(1.76, 0.1, 0.75)
    sc.box(0.62, 0.3, 0.98, 1.08, 0.8, 1.08, BLACK)
    sc.box(0.58, 0.3, 1.08, 0.7, 0.8, 1.56, BLACK)
    sc.box(1.5, 0.15, 0.75, 1.86, 0.95, 1.12, GRAYD)
    sc.beam((1.58, 0.55, 1.12), (1.42, 0.55, 1.36), 0.02, 0.02, BLACK)
    sc.cyl((1.4, 0.55, 1.35), 'z', 0.03, 0.15, BLACK)
    sc.beam((1.75, 0.8, 1.12), (1.75, 0.8, 1.32), 0.012, 0.012, GRAYL)
    post(0.5, 0.92, 1.08); post(1.76, 0.92, 0.75)
    sc.box(0.44, 0.06, 2.1, 1.86, 1.04, 2.16, GRAYD)
    for y in np.arange(0.2, 1.0, 0.14):
        sc.line([(0.5, y, 2.161), (1.8, y, 2.161)], (110, 116, 128), 0.9)
    sc.cyl((0.6, 0.2, 2.16), 'z', 0.1, 0.05, ORANGE, spec=0.5)
    wheel(0.38, 0.9, 0.24, 0.2); wheel(1.5, 0.84, 0.33, 0.24)
    # mat
    sc.box(1.92, 0.2, 0.08, 2.04, 0.3, 2.3, GRAYD)
    sc.cyl((1.98, 0.55, 0.3), 'z', 1.7, 0.04, STEEL, spec=0.8)
    for z in (1.15, 2.2):
        sc.box(1.94, 0.3, z, 2.02, 0.8, z + 0.08, GRAYD)
    sc.box(1.92, 0.8, 0.08, 2.04, 0.9, 2.3, GRAYD)
    sc.box(2.04, 0.12, 0.22, 2.1, 0.98, 0.34, BLACK)
    sc.box(2.04, 0.12, 0.62, 2.1, 0.98, 0.72, BLACK)
    for y in (0.14, 0.35, 0.55, 0.75, 0.92):
        sc.box(2.05, y, 0.72, 2.09, y + 0.04, 1.25, BLACK)
    sc.box(2.04, 0.12, 1.25, 2.1, 0.98, 1.31, BLACK)
    for y in (0.2, 0.78):
        sc.box(2.1, y, 0.04, 2.16, y + 0.12, 0.66, GRAYM)
        sc.box(2.1, y, 0.04, 3.0, y + 0.12, 0.09, GRAYM)
    sc.sh_box(0, 0.05, 1.9, 1.05, 1.0); sc.sh_box(0.44, 0.06, 1.86, 1.04, 2.16, z0=2.0)
    sc.sh_box(1.92, 0.2, 2.1, 0.9, 2.3); sc.sh_box(2.1, 0.2, 3.0, 0.9, 0.09)


# ------------------------------------------------------------------ personnages
_ST_LEG = ((0, 0.9), (0.01, 0.5), (0, 0.09)); _ST_ARM = ((0.0, 0.27, 1.14), (0.03, 0.27, 0.88))
POSES = {
    'debout': {'leg': {1: _ST_LEG, -1: _ST_LEG}, 'arm': {1: _ST_ARM, -1: _ST_ARM}},
    'marche': {'leg': {1: ((0, 0.9), (0.17, 0.52), (0.3, 0.1)), -1: ((0, 0.9), (-0.05, 0.5), (-0.3, 0.17))},
               'arm': {1: ((-0.1, 0.27, 1.15), (-0.17, 0.27, 0.92)), -1: ((0.12, 0.27, 1.16), (0.28, 0.25, 1.02))}},
    'porte_carton': {'leg': {1: _ST_LEG, -1: _ST_LEG},
                     'arm': {1: ((0.1, 0.27, 1.14), (0.36, 0.22, 1.12)), -1: ((0.1, 0.27, 1.14), (0.36, 0.22, 1.12))}},
    'machine': {'leg': {1: _ST_LEG, -1: _ST_LEG},
                'arm': {1: ((0.16, 0.25, 1.2), (0.44, 0.17, 1.08)), -1: ((0.14, 0.25, 1.17), (0.42, 0.15, 1.08))}},
    'pointe': {'leg': {1: _ST_LEG, -1: _ST_LEG}, 'arm': {1: ((0.14, 0.27, 1.38), (0.36, 0.22, 1.64)), -1: _ST_ARM}},
    'assis': {'hip': 0.5, 'sh': 1.02, 'leg': {s: ((0, 0.5), (0.4, 0.5), (0.4, 0.09)) for s in (1, -1)},
              'arm': {s: ((0.14, 0.25, 0.8), (0.4, 0.16, 0.8)) for s in (1, -1)}},
}


def worker(sc, pos, ang, pose, vest=None, helmet=True, shirt=(96, 106, 124), pants=(46, 56, 88),
           hair=(60, 44, 34), skin=(234, 188, 152)):
    fx, fy = math.cos(ang), math.sin(ang); sx_, sy_ = -fy, fx
    def W(f, s, z): return (pos[0] + f * fx + s * sx_, pos[1] + f * fy + s * sy_, pos[2] + z)
    sv = (sx_, sy_, 0)
    near = 1 if (sx_ + sy_) > 0 else -1
    fdep = fx + fy
    Pz = POSES[pose]
    hz, sz = Pz.get('hip', 0.9), Pz.get('sh', 1.42)

    def leg(s):
        hip, knee, ank = Pz['leg'][s]
        a, b, c = W(hip[0], s * 0.09, hip[1]), W(knee[0], s * 0.095, knee[1]), W(ank[0], s * 0.1, ank[1])
        sc.beam(a, b, 0.078, 0.088, pants, side=sv); sc.beam(b, c, 0.066, 0.072, pants, side=sv)
        sc.beam(W(ank[0] - 0.07, s * 0.1, ank[1] - 0.045), W(ank[0] + 0.17, s * 0.1, ank[1] - 0.045), 0.062, 0.045, (54, 46, 42), side=sv)

    def arm(s):
        el, ha = Pz['arm'][s]
        a, b, c = W(0, s * 0.25, sz), W(el[0], s * el[1], el[2]), W(ha[0], s * ha[1], ha[2])
        sc.beam(a, b, 0.052, 0.058, shirt, side=sv); sc.beam(b, c, 0.046, 0.05, shirt, side=sv)
        sc.sphere(c, 0.052, skin, spec=0)

    def item():
        if pose == 'porte_carton':
            x, y, _ = W(0.46, 0, 0)
            sc.rbox(x, y, 0.4, 0.5, ang, 0.98, 1.3, KRAFT)
            a, b, c, d = W(0.26, -0.03, 1.301), W(0.66, -0.03, 1.301), W(0.66, 0.03, 1.301), W(0.26, 0.03, 1.301)
            sc.poly([a, b, c, d], lit(mix(KRAFT, (236, 222, 190), 0.55), (0, 0, 1)))
        elif pose == 'machine':
            x, y, _ = W(0.7, 0, 0)
            sc.rbox(x, y, 0.38, 0.62, ang, 0, 0.96, GRAYL)
            sc.rbox(x, y, 0.42, 0.66, ang, 0, 0.06, GRAYD)
            sc.poly([W(0.55, -0.27, 0.962), W(0.85, -0.27, 0.962), W(0.85, 0.08, 0.962), W(0.55, 0.08, 0.962)], (22, 32, 50), GRAYD)
            sc.line([W(0.6, -0.22, 0.963), W(0.68, -0.14, 0.963), W(0.64, -0.05, 0.963), W(0.8, 0.04, 0.963)], (70, 220, 140), 1.0)
            for i, c in enumerate((RED, (60, 190, 90), YELLOW)):
                xx, yy, _ = W(0.6 + 0.1 * i, 0.2, 0)
                sc.cyl((xx, yy, 0.96), 'z', 0.03, 0.035, c)

    if fdep <= 0:
        item()
    leg(-near); leg(near); arm(-near)
    body = vest or shirt
    sc.beam(W(0, 0, hz - 0.04), W(0, 0, sz + 0.06), 0.2, 0.115, body, side=sv)
    if vest:
        for z in (hz + 0.13, hz + 0.31):
            sc.beam(W(0, 0, z), W(0, 0, z + 0.04), 0.203, 0.118, (236, 238, 226), side=sv, edge=False)
        for s in (-1, 1):
            sc.beam(W(0, s * 0.12, hz + 0.35), W(0, s * 0.12, sz + 0.06), 0.016, 0.118, (236, 238, 226), side=sv, edge=False)
    sc.beam(W(0, 0, sz + 0.05), W(0, 0, sz + 0.13), 0.05, 0.05, shade(skin, 0.9), side=sv, edge=False)
    hc = W(0.01, 0, sz + 0.235); r = 0.118
    sc.sphere(hc, r, skin, spec=0)
    if fx * VIEW[0] + fy * VIEW[1] > 0.2:
        for s in (-1, 1):
            e = W(0.01 + r * 0.86, s * 0.045, sz + 0.25)
            sc.line([(e[0], e[1], e[2] - 0.014), (e[0], e[1], e[2] + 0.014)], (40, 30, 28), 1.3)
    if helmet:
        hatc = (250, 206, 20)
        b = W(0.035, 0, 0)
        sc.disk(b[0], b[1], hc[2] + 0.04, r * 1.36, hatc)
        sc.sphere((hc[0], hc[1], hc[2] + 0.03), r * 1.16, hatc, cutz=hc[2] + 0.04, cutr=r * 1.16, spec=0.4)
    else:
        sc.sphere((hc[0], hc[1], hc[2] + 0.02), r * 1.07, hair, cutz=hc[2] + 0.035, cutr=r * 1.07, spec=0.05)
    if fdep > 0:
        item()
    arm(near)


def ouvriers(color):
    vest = {'orange': (255, 116, 8), 'bleu': (34, 104, 226)}[color]
    def fn(name, save, anchors):
        from engine import downsample
        frames = []
        for pose in ('marche', 'porte_carton', 'machine', 'debout'):
            sc = Scene(1.0, W=128, H=200, ox=48, oy=152)
            worker(sc, (0, 0, 0), 0.0, pose, vest=vest)
            sc.sh_disk(0, 0, 0.2, 0.9)
            if pose == 'machine':
                sc.sh_box(0.5, -0.32, 0.9, 0.32, 0.5)
            spr, sh = downsample(sc)
            save(f'poses/{name}_{pose}', spr, sh, (48, 152), anchors)
            frames.append((spr, sh))
        S1 = Image.new('RGBA', (512, 200), (0, 0, 0, 0)); S2 = S1.copy()
        for i, (a, b) in enumerate(frames):
            S1.paste(a, (128 * i, 0)); S2.paste(b, (128 * i, 0))
        save(name, S1, S2, (48, 152), anchors)
        anchors[name + '.png'].update({'planche': '4 poses de 128x200 : marche, porte_carton, machine, debout', 'ancre': 'par vignette'})
    return fn


# ------------------------------------------------------------------ bureau vitre
def bureau_vitre(sc):
    A = 3.2; Hh = 2.45
    sc.box(0, 0, 0, A, A, 0.06, (208, 210, 214))
    rT(sc, 0.061, 0.95, 0.75, 3.0, 3.0, (118, 140, 172))
    sc.box(0, 0, 0.06, 0.08, A, Hh, WHITE); sc.box(0, 0, 0.06, A, 0.08, Hh, WHITE)
    # tableau blanc
    y = 0.085
    rL(sc, y, 1.15, 1.0, 2.75, 2.0, (252, 252, 252), GRAYM, raw=True)
    sc.line([(1.3, y, 1.25), (1.5, y, 1.5), (1.7, y, 1.4), (1.95, y, 1.8)], (40, 100, 220), 1.4)
    sc.line([(1.3, y, 1.2), (2.0, y, 1.2)], (60, 60, 70), 1.0); sc.line([(1.3, y, 1.2), (1.3, y, 1.85)], (60, 60, 70), 1.0)
    for i, c in enumerate(((220, 60, 50), (50, 170, 90), (240, 170, 40))):
        rL(sc, y, 2.15 + i * 0.17, 1.2, 2.27 + i * 0.17, 1.35 + 0.2 * i, c, raw=True)
    sc.line([(2.15, y, 1.85), (2.6, y, 1.85)], (220, 60, 50), 1.2); sc.line([(2.15, y, 1.75), (2.45, y, 1.75)], (60, 60, 70), 1.0)
    sc.box(1.3, y, 0.97, 2.6, y + 0.05, 1.0, GRAYL)
    DK = (216, 186, 142)
    # bureau le long du mur gauche
    sc.box(0.12, 0.95, 0.06, 0.8, 0.99, 0.74, GRAYL); sc.box(0.12, 2.86, 0.06, 0.8, 2.9, 0.74, GRAYL)
    sc.box(0.12, 0.9, 0.74, 0.84, 2.95, 0.78, DK)
    for ym in (1.5, 2.4):
        sc.box(0.26, ym - 0.05, 0.78, 0.34, ym + 0.05, 0.95, GRAYD)
        sc.box(0.28, ym - 0.3, 0.93, 0.31, ym + 0.3, 1.3, BLACK)
        rR(sc, 0.311, ym - 0.28, 0.95, ym + 0.28, 1.28, (46, 84, 140), raw=True)
        sc.line([(0.312, ym - 0.2, 1.02), (0.312, ym - 0.05, 1.15), (0.312, ym + 0.08, 1.08), (0.312, ym + 0.22, 1.22)], (110, 230, 160), 0.9)
        sc.box(0.52, ym - 0.2, 0.78, 0.66, ym + 0.2, 0.795, (60, 62, 70))
    def chair(x, y, ang):
        sc.disk(x, y, 0.07, 0.24, GRAYD)
        sc.cyl((x, y, 0.07), 'z', 0.36, 0.03, GRAYM)
        sc.rbox(x, y, 0.46, 0.46, ang, 0.43, 0.49, (56, 60, 72))
    def chairback(x, y, ang):
        bx, by = x - 0.24 * math.cos(ang), y - 0.24 * math.sin(ang)
        sc.rbox(bx, by, 0.06, 0.42, ang, 0.49, 0.98, (56, 60, 72))
    def seated(x, y, ang, shirt, hair, skin=(234, 188, 152)):
        chair(x, y, ang)
        back_first = (math.cos(ang) + math.sin(ang)) > 0
        if back_first:
            chairback(x, y, ang)
        worker(sc, (x - 0.05 * math.cos(ang), y - 0.05 * math.sin(ang), 0.0), ang, 'assis', helmet=False, shirt=shirt, hair=hair, skin=skin)
        if not back_first:
            chairback(x, y, ang)
    worker(sc, (1.75, 0.62, 0.06), -math.pi / 2, 'pointe', helmet=False, shirt=(250, 250, 250), hair=(40, 34, 30), pants=(40, 44, 56))
    seated(1.22, 1.5, math.pi, (70, 130, 210), (90, 60, 36))
    seated(1.22, 2.4, math.pi, (226, 96, 110), (30, 26, 26), (196, 150, 118))
    # table ronde
    sc.cyl((2.35, 1.85, 0.06), 'z', 0.66, 0.05, GRAYM)
    sc.cyl((2.35, 1.85, 0.72), 'z', 0.04, 0.48, DK)
    sc.box(2.2, 1.75, 0.76, 2.5, 1.97, 0.775, (70, 72, 82))
    seated(2.35, 2.62, -math.pi / 2, (70, 170, 120), (150, 100, 50))
    # parois vitrees avant
    G = (176, 218, 238); FR = (120, 128, 140)
    rR(sc, A, 0, 0.06, A, Hh, G, alpha=58, raw=True); rL(sc, A, 0, 0.06, A, Hh, G, alpha=72, raw=True)
    for a, w in ((0.1, 0.12), (0.55, 0.06)):
        sc.poly([(A * a, A, 0.06), (A * (a + w), A, 0.06), (A * (a + w) + 0.9, A, Hh), (A * a + 0.9, A, Hh)], (255, 255, 255), alpha=46)
        sc.poly([(A, A * a, 0.06), (A, A * (a + w), 0.06), (A, A * (a + w) + 0.9, Hh), (A, A * a + 0.9, Hh)], (255, 255, 255), alpha=36)
    for t in (0, A / 3, 2 * A / 3, A):
        sc.line([(A, t, 0.06), (A, t, Hh)], FR, 1.8); sc.line([(t, A, 0.06), (t, A, Hh)], FR, 1.8)
    for z in (0.06, 1.0, Hh):
        sc.line([(A, 0, z), (A, A, z)], FR, 1.8 if z != 1.0 else 1.0); sc.line([(0, A, z), (A, A, z)], FR, 1.8 if z != 1.0 else 1.0)
    sc.line([(0, 0, Hh), (A, 0, Hh)], FR, 1.4); sc.line([(0, 0, Hh), (0, A, Hh)], FR, 1.4)
    sc.line([(A / 3 + 0.12, A, 1.05), (A / 3 + 0.12, A, 1.25)], GRAYD, 2.2)   # poignee de porte
    sc.sh_box(0, 0, A, 0.08, Hh); sc.sh_box(0, 0, 0.08, A, Hh); sc.sh_box(0, 0, A, A, 0.3)


# ------------------------------------------------------------------ vegetation
def arbre(sc):
    sc.cyl((0, 0, 0), 'z', 1.9, 0.2, (126, 88, 54), r1=0.13)
    sc.beam((0, 0, 1.4), (0.45, 0.1, 2.0), 0.05, 0.05, (126, 88, 54))
    sc.beam((0, 0, 1.3), (-0.3, 0.35, 1.9), 0.05, 0.05, (126, 88, 54))
    G = ((70, 150, 56), (88, 168, 62), (58, 134, 52), (100, 178, 70))
    balls = [(0, 0, 2.7, 1.05), (0.7, 0.05, 2.35, 0.72), (-0.55, 0.35, 2.4, 0.76), (0.05, -0.7, 2.45, 0.74), (0.2, 0.65, 2.25, 0.72),
             (0.05, 0, 3.55, 0.8), (-0.4, -0.35, 3.1, 0.72), (0.5, 0.35, 3.15, 0.7), (-0.2, 0.5, 3.0, 0.62)]
    for i, (x, y, z, r) in sorted(enumerate(balls), key=lambda t: t[1][0] * VIEW[0] + t[1][1] * VIEW[1] + t[1][2] * VIEW[2]):
        sc.sphere((x, y, z), r, G[i % 4], tex=0.42, seed=i, spec=0.0)
    sc.sh_box(-0.15, -0.15, 0.15, 0.15, 2.2)
    cx, cy = SHK * 2.6, -0.06 * 2.6
    sc.sd.polygon([sc.P(cx + 1.45 * math.cos(t), cy + 1.3 * math.sin(t), 0) for t in np.linspace(0, 6.283, 40)], fill=255)


def buisson(sc):
    G = ((62, 140, 54), (80, 160, 60), (54, 126, 50), (92, 170, 66))
    balls = [(0, 0, 0.34, 0.38), (0.36, 0.08, 0.27, 0.3), (-0.3, 0.16, 0.26, 0.29), (0.06, 0.36, 0.23, 0.26), (0.1, -0.26, 0.3, 0.3)]
    for i, (x, y, z, r) in sorted(enumerate(balls), key=lambda t: t[1][0] * VIEW[0] + t[1][1] * VIEW[1] + t[1][2] * VIEW[2]):
        sc.sphere((x, y, z), r, G[i % 4], tex=0.45, seed=20 + i, spec=0.0)
    sc.sh_disk(0.03, 0.05, 0.5, 0.5)


# ------------------------------------------------------------------ murs (tuile 2 m)
def _mur(sc, side):
    WC = (214, 218, 224); CUT = (96, 100, 112); DR = (52, 104, 172); T = 0.16; Hh = 1.15
    if side == 'g':      # le long du bord arriere-gauche (x = 0)
        sc.box(0, 0, 0, T, 2, Hh, WC, ct=CUT)
        rR(sc, T, 0, 0, 2, 0.14, GRAYM)
        for y in np.arange(0.125, 2, 0.125):
            sc.line([(T, y, 0.14), (T, y, Hh)], shade(lit(WC, (1, 0, 0)), 0.9), 0.7)
        rR(sc, T, 0.5, 0, 1.5, Hh, GRAYD); rR(sc, T, 0.56, 0, 1.44, Hh, DR, edge_of(DR))
        rR(sc, T, 0.56, 0, 1.44, 0.2, GRAYM)
        rT(sc, Hh, 0.03, 0.56, T - 0.05, 1.44, shade(DR, 0.6), raw=True)
        sc.box(T, 1.3, 0.92, T + 0.05, 1.38, 0.98, GRAYL)
        sc.line([(T, 0, 0.9), (T, 0.5, 0.9)], YELLOW, 1.6); sc.line([(T, 1.5, 0.9), (T, 2, 0.9)], YELLOW, 1.6)
        sc.sh_box(0, 0, T, 2, Hh)
    else:                # le long du bord arriere-droit (y = 0)
        sc.box(0, 0, 0, 2, T, Hh, WC, ct=CUT)
        rL(sc, T, 0, 0, 2, 0.14, GRAYM)
        for x in np.arange(0.125, 2, 0.125):
            sc.line([(x, T, 0.14), (x, T, Hh)], shade(lit(WC, (0, 1, 0)), 0.9), 0.7)
        rL(sc, T, 0.5, 0, 1.5, Hh, GRAYD); rL(sc, T, 0.56, 0, 1.44, Hh, DR, edge_of(DR))
        rL(sc, T, 0.56, 0, 1.44, 0.2, GRAYM)
        rT(sc, Hh, 0.56, 0.03, 1.44, T - 0.05, shade(DR, 0.6), raw=True)
        sc.box(1.3, T, 0.92, 1.38, T + 0.05, 0.98, GRAYL)
        sc.line([(0, T, 0.9), (0.5, T, 0.9)], YELLOW, 1.6); sc.line([(1.5, T, 0.9), (2, T, 0.9)], YELLOW, 1.6)
        sc.sh_box(0, 0, 2, T, Hh)


def mur_bas_gauche(sc): _mur(sc, 'g')
def mur_bas_droite(sc): _mur(sc, 'd')


# ------------------------------------------------------------------ tuiles de sol raccordables
def _sample(tex):
    N = tex.shape[0]
    j, i = np.mgrid[0:128, 0:256].astype(float)
    a = (i + 0.5 - 128) / 128; b = (j + 0.5) / 64
    u = (a + b) / 2; v = (b - a) / 2
    mask = (np.abs(a) + np.abs(b - 1)) < 1
    fu = (u * N) % N; fv = (v * N) % N
    u0 = np.floor(fu).astype(int) % N; v0 = np.floor(fv).astype(int) % N
    du = (fu - np.floor(fu))[..., None]; dv = (fv - np.floor(fv))[..., None]
    u1 = (u0 + 1) % N; v1 = (v0 + 1) % N
    c = tex[v0, u0] * (1 - du) * (1 - dv) + tex[v0, u1] * du * (1 - dv) + tex[v1, u0] * (1 - du) * dv + tex[v1, u1] * du * dv
    out = np.dstack([np.clip(c, 0, 255), mask * 255.0]).astype('uint8')
    return Image.fromarray(out, 'RGBA')


def _pnoise(N, rng, octs):
    yy, xx = np.mgrid[0:N, 0:N] / N
    n = np.zeros((N, N))
    for fmax, amp, cnt in octs:
        for _ in range(cnt):
            k, l = rng.integers(-fmax, fmax + 1, 2)
            n += amp * np.sin(2 * np.pi * (k * xx + l * yy) + rng.random() * 6.283)
    return n


def _wrapblur(a, r):
    out = np.zeros_like(a); cnt = 0
    for dx in range(-r, r + 1):
        for dy in range(-r, r + 1):
            out += np.roll(np.roll(a, dx, 1), dy, 0); cnt += 1
    return out / cnt


def tuile(kind):
    def fn(name, save, anchors):
        N = 512; rng = np.random.default_rng(5 if kind == 'herbe' else 9)
        if kind == 'herbe':
            n = _pnoise(N, rng, ((2, 5.0, 5), (5, 3.0, 8), (11, 1.6, 10)))
            fine = _wrapblur(rng.random((N, N)), 1) - 0.5
            base = np.array([98, 166, 66], float)
            tex = base[None, None, :] + n[..., None] * np.array([0.9, 1.25, 0.6]) + fine[..., None] * 60 * np.array([0.8, 1.0, 0.5])
            im = Image.fromarray(np.clip(tex, 0, 255).astype('uint8')); d = ImageDraw.Draw(im)
            r2 = random.Random(3)
            for _ in range(1500):       # brins d'herbe, dessines avec repetition pour le raccord
                x, y = r2.random() * N, r2.random() * N
                L = 3 + r2.random() * 5; dx = r2.uniform(-1.5, 1.5)
                c = r2.choice(((126, 190, 84), (78, 146, 56), (140, 200, 96), (70, 136, 52)))
                for ox in (-N, 0, N):
                    for oy in (-N, 0, N):
                        d.line([(x + ox, y + oy), (x + ox - L * 0.7 + dx, y + oy - L * 0.7)], fill=c, width=1)
            tex = np.asarray(im, float)
        else:
            n = _pnoise(N, rng, ((2, 1.6, 5), (6, 1.0, 8)))
            fine = _wrapblur(rng.random((N, N)), 1) - 0.5
            g = 197 + n + fine * 26
            sp = rng.random((N, N))
            g = np.where(sp > 0.994, g - 26, g); g = np.where(sp < 0.004, g + 14, g)
            tex = np.dstack([g * 1.0, g * 1.0, g * 0.985])
            for k in range(3):          # joints de dalle sur le pourtour de la tuile
                f = (0.80, 0.90, 0.96)[k]
                for idx in (k, N - 1 - k):
                    tex[idx, :, :] *= f; tex[:, idx, :] *= f
        spr = _sample(tex)
        empty = Image.new('RGBA', spr.size, (0, 0, 0, 0))
        save(name, spr, empty, (128, 128), anchors)
        anchors[name + '.png']['raccordable'] = True
    return fn


def register(reg):
    reg('convoyeur_droit', convoyeur_droit, 'tile'); reg('convoyeur_coin', convoyeur_coin, 'tile')
    reg('machine_assemblage', machine_assemblage); reg('robot_6_axes', robot_6_axes); reg('presse', presse)
    for k, (c, cb, st) in CAM.items():
        reg(f'camion_{k}', (lambda sc, c=c, cb=cb, st=st: camion(sc, c, cb, st, False)))
        reg(f'camion_{k}_ouvert', (lambda sc, c=c, cb=cb, st=st: camion(sc, c, cb, st, True)))
    reg('quai_chargement', quai_chargement); reg('chariot_elevateur', chariot_elevateur)
    reg('ouvrier_gilet_orange', ouvriers('orange'), 'custom'); reg('ouvrier_gilet_bleu', ouvriers('bleu'), 'custom')
    reg('bureau_vitre', bureau_vitre); reg('arbre', arbre); reg('buisson', buisson, 'free', 128)
    reg('herbe_tuile', tuile('herbe'), 'custom'); reg('sol_beton_tuile', tuile('beton'), 'custom')
    reg('mur_bas_gauche', mur_bas_gauche, 'tile'); reg('mur_bas_droite', mur_bas_droite, 'tile')
