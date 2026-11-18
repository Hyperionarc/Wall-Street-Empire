"""Mesure les dépassements d'un sprite de parcelle hors de son losange 2:1.
Règle iso : en dessous du bord avant (bas-gauche / bas-droit, + épaisseur de dalle) ou au-delà des pointes gauche/droite = dépassement.
Au-dessus, le bâtiment peut monter librement. Usage : python3 emprise_check.py fichier.png cases"""
import sys, json, os
import numpy as np
from PIL import Image
def depassement(chemin, cases, T=14):
    im = Image.open(chemin).convert('RGBA'); a = np.asarray(im.getchannel('A')) > 40
    A = json.load(open(os.path.join(os.path.dirname(chemin), 'ancres.json')))[os.path.basename(chemin)]
    Wd = cases * 256; Hd = Wd // 2; cx, cy = A['ancre_x'], A['ancre_y']
    h, w = a.shape
    ys, xs = np.nonzero(a)
    bas = cy + (Hd / 2) * (1 - np.abs(xs - cx) / (Wd / 2)) + T + 3
    hors = (ys > bas) | (np.abs(xs - cx) > Wd / 2 + 2)
    return int(hors.sum()), int(a.sum())
if __name__ == '__main__':
    n, t = depassement(sys.argv[1], int(sys.argv[2]))
    print(os.path.basename(sys.argv[1]), 'dépassement', n, 'px sur', t, '=', round(100 * n / t, 2), '%')
