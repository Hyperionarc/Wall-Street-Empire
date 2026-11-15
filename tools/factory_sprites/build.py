import sys, os, json
import numpy as np
from PIL import Image
from engine import Scene, finalize
import objs1

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'factory')
REG = []   # (nom, fonction, mode, largeur)


def reg(name, fn, mode='free', W=256):
    REG.append((name, fn, mode, W))


for n in ('bobine_acier', 'bobine_cuivre', 'plaques_acier', 'palette_cartons', 'palette_vide'):
    reg(n, getattr(objs1, n), 'free', 128)
reg('rack_stockage', objs1.rack_stockage); reg('rack_vide', objs1.rack_vide)
import objs2
objs2.register(reg)


def save(name, spr, sh, anchor, anchors):
    os.makedirs(os.path.dirname(f'{OUT}/{name}'), exist_ok=True); os.makedirs(os.path.dirname(f'{OUT}/ombres/{name}'), exist_ok=True)
    spr.save(f'{OUT}/{name}.png'); sh.save(f'{OUT}/ombres/{name}.png')
    anchors[name + '.png'] = {'largeur': spr.width, 'hauteur': spr.height, 'ancre_x': int(anchor[0]), 'ancre_y': int(anchor[1])}


def sheet(names, path, cols=6, cell=(264, 400), bg=(120, 150, 110)):
    rows = (len(names) + cols - 1) // cols
    im = Image.new('RGBA', (cols * cell[0], rows * cell[1]), bg + (255,))
    for i, n in enumerate(names):
        spr = Image.open(f'{OUT}/{n}.png'); sh = Image.open(f'{OUT}/ombres/{n}.png')
        x = (i % cols) * cell[0] + (cell[0] - spr.width) // 2
        y = (i // cols) * cell[1] + cell[1] - spr.height - 4
        im.alpha_composite(sh, (x, y)); im.alpha_composite(spr, (x, y))
    im.convert('RGB').save(path)


if __name__ == '__main__':
    only = sys.argv[1:]
    anchors = {}
    if os.path.exists(OUT + '/ancres.json'):
        anchors = json.load(open(OUT + '/ancres.json'))
    done = []
    for name, fn, mode, W in REG:
        if only and not any(name.startswith(o) for o in only):
            continue
        if mode == 'custom':
            fn(name, save, anchors)
        else:
            zoom = 1.0
            for _ in range(2):
                sc = Scene(zoom)
                fn(sc)
                spr, sh, anchor = finalize(sc, mode, W, margin=14 if W > 128 else 10)
                wpx = getattr(finalize, 'width', 0)
                if mode == 'tile' or wpx <= W - 4:
                    break
                zoom = zoom * (W - 6) / wpx
            save(name, spr, sh, anchor, anchors)
            anchors[name + '.png']['echelle_px_par_m'] = float(round(64 * zoom, 1))
        done.append(name)
        print(name, anchors.get(name + '.png'))
    json.dump(anchors, open(OUT + '/ancres.json', 'w'), indent=1, ensure_ascii=False)
    sheet([d for d in done if os.path.exists(f'{OUT}/ombres/{d}.png')], os.path.join(OUT, '_planche_brute.png'))
