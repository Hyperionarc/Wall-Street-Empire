#!/usr/bin/env python3
"""Détoure les images du siège (fond damier JPEG incrusté) -> PNG RGBA rogné + ancre (pointe basse du losange)."""
import sys, json, os
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
from collections import deque
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def stylize(im, lift=1.25, sat=1.7):
    """Éclaircit et sature l'illustration (encre sombre) pour l'accorder à la palette claire de la ville."""
    x = im.convert('RGB').filter(ImageFilter.MedianFilter(3)); arr = np.array(x).astype(float) / 255
    arr = (0.10 + 0.90 * arr) ** (1 / lift)
    x = Image.fromarray((arr * 255).astype('uint8')); x = ImageEnhance.Color(x).enhance(sat)
    return ImageEnhance.Contrast(x).enhance(0.95)
# Palette de la ville (aplats pastel des immeubles Kenney) : verre bleu clair, pierre beige, ombre bleutée
GLASS = np.array([160, 196, 230]) / 255; STONE = np.array([222, 214, 196]) / 255; INK = np.array([88, 108, 140]) / 255
def flatten(im, ncol=20):
    """Aplats façon sprites de la ville : lissage fort, quantification en peu de teintes, encre noire -> bleu-gris doux."""
    w, h = im.size
    x = im.convert('RGB').resize((800, round(h * 800 / w)), Image.BOX).filter(ImageFilter.MedianFilter(3))
    x = x.quantize(colors=ncol, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB').filter(ImageFilter.ModeFilter(5))
    a = np.array(x).astype(float) / 255
    lum = a @ np.array([0.299, 0.587, 0.114]); blu = (a[..., 2] - a[..., 0]) > 0.04
    t = np.clip((lum - 0.15) / 0.55, 0, 1)[..., None]
    base = np.where(blu[..., None], GLASS, STONE)
    out = INK + (base - INK) * t ** 0.7
    out = np.clip(out * 1.04 + 0.02, 0, 1)
    return Image.fromarray((out * 255).astype('uint8')).resize((w, h), Image.LANCZOS)
def shade(img, tipx, k_right=0.86):
    """Éclairage de la ville : faces de droite assombries, faces de gauche inchangées."""
    a = np.array(img).astype(float); a[:, int(tipx):, :3] *= k_right; return Image.fromarray(np.clip(a, 0, 255).astype('uint8'), 'RGBA')
def process(src, dst, width=480):
    im = Image.open(src).convert('RGB'); a = np.array(im).astype(int); H, W = a.shape[:2]
    mx, mn = a.max(axis=2), a.min(axis=2)
    light = (mn > 178) & ((mx - mn) < 14)           # blanc / gris clair du damier, peu saturé
    bg = np.zeros((H, W), bool); q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if light[y, x]: bg[y, x] = True; q.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if light[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and light[ny, nx] and not bg[ny, nx]: bg[ny, nx] = True; q.append((ny, nx))
    alpha = Image.fromarray(((~bg) * 255).astype('uint8'))
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))   # érosion 1 px + adoucissement
    out = flatten(im).convert('RGBA'); out.putalpha(alpha)
    bbox = out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox(); out = out.crop(bbox)
    s = width / out.width; out = out.resize((width, round(out.height * s)), Image.LANCZOS)
    al = np.array(out.getchannel('A')); ys, xs = np.where(al > 128)
    low = ys.max(); row = np.where(al[max(0, low - 6):low + 1] > 128)[1]
    out = shade(out, row.mean())
    meta = {'w': out.width, 'h': out.height, 'tipx': int(row.mean()), 'tipy': int(low), 'left': int(xs.min()), 'right': int(xs.max())}
    out.quantize(colors=200, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(dst, optimize=True); return meta
if __name__ == '__main__':
    name = sys.argv[1] if len(sys.argv) > 1 else 'mid'
    m = process(os.path.join(ROOT, 'assets/src/hq', f'hq_{name}_src.jpg'), os.path.join(ROOT, 'assets/hq', f'hq_{name}.png'))
    mp = os.path.join(ROOT, 'assets/hq/meta.json'); d = json.load(open(mp)) if os.path.exists(mp) else {}; d[name] = m; json.dump(d, open(mp, 'w'))
    print(name, json.dumps(m))
