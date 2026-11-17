"""Pose un motif dessiné (texte ou croix) sur le toit plat d'un sprite, en perspective isométrique.
Usage : python3 pose_toit.py <nom> croix|texte [MOT]   (les originaux sont sauvegardés dans travail/archives/)"""
import sys, shutil, os, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from scipy import ndimage as ndi
H = '../../assets/factory_hd/'
POLICE = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'

def toit(a):
    ys0, xs0 = np.nonzero(a[..., 3] > 200); top = ys0.min()
    cx = int(np.median(xs0[ys0 < top + 40])); cy = top + int((ys0.max() - top) * 0.22)
    ref = a[cy - 3:cy + 4, cx - 3:cx + 4, :3].reshape(-1, 3).mean(0)
    m = (np.abs(a[..., :3] - ref).max(axis=2) < 16) & (a[..., 3] > 200)
    m = ndi.binary_opening(m, iterations=2)
    lab, n = ndi.label(m)
    return ndi.binary_fill_holes(lab == lab[cy, cx])

def pose(nom, mode, mot=None):
    src = f'travail/archives/{nom}_avant_toit.png'
    if not os.path.exists(src): shutil.copy(H + nom + '.png', src)
    im = Image.open(src).convert('RGBA'); a = np.asarray(im).astype(int); W, Hh = im.size
    r = toit(a); ys, xs = np.nonzero(r)
    c = np.array([(xs.min(), ys[xs == xs.min()].mean()), (xs[ys == ys.min()].mean(), ys.min()),
                  (xs.max(), ys[xs == xs.max()].mean()), (xs[ys == ys.max()].mean(), ys.max())], float)
    ctr = c.mean(0); q = ctr + (c - ctr) * 0.80; qb = ctr + (c - ctr) * 0.86
    S = 1000; fond = tuple(int(v) for v in a[r][:, :3].mean(0))
    tex = Image.new('RGB', (S, S), fond); d = ImageDraw.Draw(tex)
    if mode == 'croix':
        g = (30, 170, 50); e, t, o = 150, 115, S // 2
        d.rectangle((o - t // 2, o - e, o + t // 2, o + e), fill=g); d.rectangle((o - e, o - t // 2, o + e, o + t // 2), fill=g)
        d.rounded_rectangle((170, 170, S - 170, S - 170), 40, outline=g, width=16)
    else:
        col = tuple(int(v) for v in os.environ.get('COUL','0,70,170').split(','))
        d.rounded_rectangle((90, 300, S - 90, 700), 40, fill=col)
        size = 200
        while True:
            f = ImageFont.truetype(POLICE, size)
            if d.textlength(mot, font=f) <= S - 260: break
            size -= 4
        bb = d.textbbox((0, 0), mot, font=f)
        d.text(((S - (bb[2] - bb[0])) / 2 - bb[0], 500 - (bb[1] + bb[3]) / 2), mot, font=f, fill=(255, 255, 255))
    sq = np.array([(0, 0), (S, 0), (S, S), (0, S)], float); A = []; b = []
    for (x, y), (u, v) in zip(qb, sq):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    co = np.linalg.solve(np.array(A), np.array(b))
    warp = tex.transform((W, Hh), Image.PERSPECTIVE, tuple(co), Image.BICUBIC).convert('RGBA')
    mk = Image.new('L', (W, Hh), 0); ImageDraw.Draw(mk).polygon([tuple(p) for p in q], fill=255)
    mk = mk.filter(ImageFilter.GaussianBlur(0.8))
    out = Image.composite(warp, im, mk); out.putalpha(im.getchannel('A')); out.save(H + nom + '.png')
    print(nom, 'toit', int(r.sum()), 'px, coins', c.round().tolist())

if __name__ == '__main__':
    pose(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
