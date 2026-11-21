# Recolore le grand champ de blé 3x3 en colza (jaune fleuri) et maïs (vert-or) : masque par teinte, grange/silo/tracteur/herbe/dalle intacts
import sys, numpy as np
from PIL import Image, ImageFilter
src, out, kind = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert('RGBA'); a = np.asarray(im).astype(np.float32)
rgb = a[..., :3] / 255.0
hsv = np.asarray(im.convert('RGB').convert('HSV')).astype(np.float32)
H, S, V = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
m = (a[..., 3] > 200) & (H > 33.5) & (H < 56) & (S > 0.22) & (V > 0.5)
mf = np.asarray(Image.fromarray(np.uint8(m * 255)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255.0
L = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
lo, hi = np.percentile(L[m], 3), np.percentile(L[m], 97); t = np.clip((L - lo) / (hi - lo), 0, 1)
hh, ww = L.shape; yy, xx = np.mgrid[0:hh, 0:ww]
rng = np.random.default_rng(7); n1 = rng.random((hh, ww)).astype(np.float32)
nb = np.asarray(Image.fromarray(np.uint8(n1 * 255)).filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255.0
nb = (nb - nb.min()) / (nb.max() - nb.min() + 1e-6)
def lerp(c0, c1, k):
    c0 = np.array(c0, np.float32) / 255; c1 = np.array(c1, np.float32) / 255; return c0 + (c1 - c0) * k[..., None]
if kind == 'colza':
    k = np.clip(t * 1.3 + 0.08, 0, 1) ** 0.7
    col = lerp((58, 98, 30), (252, 226, 40), k)
    fl = (n1 > 0.80) & (t > 0.25)   # fleurs vives éparses
    col[fl] = col[fl] * 0.4 + np.array([1.0, 0.95, 0.35]) * 0.6
    st = (n1 < 0.07) & (t < 0.6)    # tiges vertes visibles dans l'ombre
    col[st] = col[st] * 0.5 + np.array([0.25, 0.45, 0.15]) * 0.5
else:   # maïs : vert profond, feuilles plus claires, panicules or sur les crêtes
    k = np.clip(t, 0, 1)
    col = lerp((34, 70, 22), (118, 158, 52), np.clip(k * 1.15, 0, 1))
    band = (np.sin((xx * 0.5 + yy * 1.0) * 0.55) * 0.5 + 0.5)   # rangs obliques (axe iso)
    col *= (0.92 + 0.08 * band)[..., None]
    g = (np.clip((k - 0.68) / 0.32, 0, 1) * np.clip((nb - 0.45) * 4, 0, 1) * 0.7)[..., None]
    col = col * (1 - g) + np.array([0.86, 0.76, 0.36]) * g
col = np.clip(col, 0, 1) * 255
res = a.copy(); res[..., :3] = a[..., :3] * (1 - mf[..., None]) + col * mf[..., None]
Image.fromarray(np.uint8(np.clip(res, 0, 255)), 'RGBA').save(out, optimize=True)
print(out, 'pixels champ', int(m.sum()))
