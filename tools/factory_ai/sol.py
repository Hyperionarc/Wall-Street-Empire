#!/usr/bin/env python3
"""Tuiles de sol sans couture (losange 396x198) : bruit périodique dans l'espace monde (u,v), période 1 par case.
Toutes les variantes partagent la même base périodique ; seules des touches intérieures (fondues vers 0 aux bords) les distinguent,
donc n'importe quelle variante se raccorde à n'importe quelle autre. Usage : python3 sol.py [dossier_sortie]"""
import sys, os
import numpy as np
from PIL import Image
W, H, SS = 396, 198, 3
N = 512
out = sys.argv[1] if len(sys.argv) > 1 else '../../assets/phase2_hd'

def pnoise(seed, sigma):
    r = np.random.RandomState(seed).randn(N, N)
    fx = np.fft.fftfreq(N)[:, None]; fy = np.fft.fftfreq(N)[None, :]
    g = np.exp(-(fx ** 2 + fy ** 2) * (2 * np.pi * sigma) ** 2 / 2)
    a = np.real(np.fft.ifft2(np.fft.fft2(r) * g)); a -= a.mean(); return a / (a.std() + 1e-9)

def world(ss=SS):
    w, h = W * ss, H * ss
    x = (np.arange(w)[None, :] + 0.5) / ss; y = (np.arange(h)[:, None] + 0.5) / ss
    s = (y / (H / 2)) ; d = (x - W / 2) / (W / 2)
    u = (s + d) / 2; v = (s - d) / 2
    return u, v

def samp(a, u, v):
    return a[(np.floor(v * N).astype(int)) % N, (np.floor(u * N).astype(int)) % N]

def lerp(c1, c2, t):
    return np.array(c1)[None, None, :] * (1 - t[..., None]) + np.array(c2)[None, None, :] * t[..., None]

def bump(u, v, m=0.12):
    f = lambda t: np.clip(np.minimum(t, 1 - t) / m, 0, 1)
    b = f(u) * f(v); return b * b * (3 - 2 * b)

def herbe(variante):
    u, v = world(); sh = u.shape
    big, mid, fin, blad = pnoise(1, 38), pnoise(2, 14), pnoise(3, 4.5), pnoise(4, 1.6)
    t1 = np.clip(0.5 + 0.30 * samp(big, u, v) + 0.18 * samp(mid, u, v), 0, 1)
    col = lerp((88, 140, 56), (150, 168, 62), t1)                     # vert franc -> vert jaune
    tt = np.clip(0.5 + 0.8 * samp(mid, u, v) * samp(big, u, v), 0, 1) ** 3
    col = col * (1 - 0.55 * tt[..., None]) + np.array((140, 112, 66))[None, None, :] * 0.55 * tt[..., None]   # plaques de terre claire
    col *= (1 + 0.10 * samp(fin, u, v) + 0.07 * samp(blad, u, v))[..., None]
    rs = np.random.RandomState(100 + variante); b = bump(u, v)
    for _ in range(26):                                                # touches propres à la variante (intérieur seulement)
        cu, cv = rs.uniform(0.12, 0.88, 2); r = rs.uniform(0.04, 0.09); c = rs.choice(3)
        d = np.sqrt((u - cu) ** 2 + (v - cv) ** 2) / r
        k = np.clip(1 - d, 0, 1) ** 1.5 * b
        tone = [(52, 100, 40), (176, 190, 76), (206, 190, 70)][c]
        col = col * (1 - 0.5 * k[..., None]) + np.array(tone)[None, None, :] * 0.5 * k[..., None]
    for _ in range(40):                                                # fleurs / brins clairs
        cu, cv = rs.uniform(0.1, 0.9, 2); d = np.sqrt((u - cu) ** 2 + (v - cv) ** 2)
        k = (d < 0.0045) * b; col = col * (1 - k[..., None]) + np.array((236, 230, 150) if rs.rand() < 0.5 else (240, 240, 236))[None, None, :] * k[..., None]
    return col

def terre(variante):
    u, v = world()
    big, mid, fin = pnoise(11, 30), pnoise(12, 9), pnoise(13, 2.5)
    pal = [((120, 88, 58), (160, 124, 86)), ((136, 104, 70), (178, 146, 104)), ((150, 118, 80), (196, 168, 122)), ((104, 76, 50), (140, 104, 72))][0]
    t = np.clip(0.5 + 0.30 * samp(big, u, v) + 0.25 * samp(mid, u, v), 0, 1)
    col = lerp(pal[0], pal[1], t) * (1 + 0.09 * samp(fin, u, v))[..., None]
    rs = np.random.RandomState(200 + variante); b = bump(u, v)
    for _ in range(70):                                                # cailloux et ornières
        cu, cv = rs.uniform(0.08, 0.92, 2); r = rs.uniform(0.005, 0.014)
        d = np.sqrt((u - cu) ** 2 + (v - cv) ** 2) / r; k = np.clip(1 - d, 0, 1) * b
        col = col * (1 - 0.6 * k[..., None]) + np.array((92, 72, 56) if rs.rand() < 0.5 else (196, 184, 160))[None, None, :] * 0.6 * k[..., None]
    return col

def save(col, name):
    u, v = world(); m = ((u >= 0) & (u <= 1) & (v >= 0) & (v <= 1)).astype(float)
    img = np.dstack([np.clip(col, 0, 255), m * 255]).astype(np.uint8)
    Image.fromarray(img, 'RGBA').resize((W, H), Image.LANCZOS).save(os.path.join(out, name + '.png'))
    print('ok', name)

for i, n in enumerate(['herbe_a', 'herbe_b', 'herbe_c', 'herbe_d']): save(herbe(i), n)
for i, n in enumerate(['terre_a', 'terre_b', 'terre_c', 'terre_d']): save(terre(i), n)
