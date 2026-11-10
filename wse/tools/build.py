#!/usr/bin/env python3
"""Assemble les sprites CC0 en un atlas et génère wse/city.html à partir du gabarit.

Usage : python3 wse/tools/build.py
Sorties : wse/assets/atlas.png, wse/assets/atlas.json, wse/city.html (atlas inclus en data URI)
"""
import base64, json, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'src')
KC = os.path.join(SRC, 'kenney-city')
KB = os.path.join(SRC, 'kenney-buildings')
KV = os.path.join(SRC, 'kenney-vehicles')

def load(p):
    return Image.open(p).convert('RGBA')

sprites = {}  # nom -> Image

# --- Sol et routes (Kenney City). Masque de connexions : SE=1 NW=2 SW=4 NE=8 (x+1, x-1, y+1, y-1)
sprites['ground'] = load(f'{KC}/cityTiles_072.png')
road_for_mask = {
    0: '081', 1: '104', 2: '111', 3: '073', 4: '110', 5: '113', 6: '118', 7: '096',
    8: '116', 9: '117', 10: '121', 11: '103', 12: '081', 13: '095', 14: '088', 15: '089',
}
for m, n in road_for_mask.items():
    sprites[f'road{m}'] = load(f'{KC}/cityTiles_{n}.png')
sprites['tree'] = load(f'{KC}/cityDetails_010.png')
# Entrées de mine (tunnels dans un bloc)
sprites['mine0'] = load(f'{KC}/cityTiles_033.png')
sprites['mine1'] = load(f'{KC}/cityTiles_026.png')

# --- Logements (sprites sans socle 99x85, empilables par étages), commerces (sprites avec socle)
for i, n in enumerate(['043', '044', '045', '047', '048', '049', '051', '052', '054']):
    sprites[f'res{i}'] = load(f'{KB}/buildingTiles_{n}.png')
for i, n in enumerate(['001', '003', '010', '017', '018', '020', '026', '123', '124', '100', '107', '108']):
    sprites[f'shop{i}'] = load(f'{KB}/buildingTiles_{n}.png')

# --- Usines : grand bloc (085) + toit industriel gris, centré sur le haut du bloc
def hall(roof):
    base = load(f'{KB}/buildingTiles_085.png')
    r = load(f'{KB}/buildingTiles_{roof}.png')
    base.alpha_composite(r, ((base.width - r.width) // 2, 0))
    return base
for i, roof in enumerate(['097', '104']):
    sprites[f'fact{i}'] = hall(roof)
for i, roof in enumerate(['105', '112']):
    sprites[f'oil{i}'] = hall(roof)
# Petite usine : bâtiment bas en brique + toit industriel
def small(base, roof):
    b = load(f'{KB}/buildingTiles_{base}.png')
    r = load(f'{KB}/buildingTiles_{roof}.png')
    b.alpha_composite(r, ((b.width - r.width) // 2, 0))
    return b
sprites['fsmall0'] = small('092', '104')
sprites['fsmall1'] = small('093', '112')

# --- Tours : sprites sans socle empilés par le jeu. Tech = verre teinté cyan, Banque = pierre claire
def tint(im, rgb, amt):
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = (round(r * (1 - amt) + rgb[0] * amt), round(g * (1 - amt) + rgb[1] * amt), round(b * (1 - amt) + rgb[2] * amt), a)
    return im
sprites['tech0'] = tint(load(f'{KB}/buildingTiles_056.png'), (70, 190, 235), 0.45)
sprites['tech1'] = tint(load(f'{KB}/buildingTiles_050.png'), (70, 190, 235), 0.45)
sprites['bank0'] = load(f'{KB}/buildingTiles_053.png')
sprites['bank1'] = tint(load(f'{KB}/buildingTiles_055.png'), (242, 184, 75), 0.25)

# --- Véhicules : 4 directions iso par modèle (indices de frames, voir DIR_FRAMES dans le jeu)
veh_dirs = {'SE': 0, 'NW': 0, 'SW': 0, 'NE': 0}  # remplacé ci-dessous
DIR_FRAMES = json.load(open(os.path.join(ROOT, 'tools', 'vehicle_frames.json')))  # {"SE": n, ...}
models = {'Red-Sedan1': 'carRed2', 'Blue-Sedan2': 'carBlue3', 'Green-Sedan3': 'carGreen4',
          'Black-Sedan4': 'carBlack5', 'Silver-Pick-up1': 'carSilver1', 'Black-Truck1': 'carBlack6'}
for folder in sorted(os.listdir(KV)):
    fp = os.path.join(KV, folder)
    if not os.path.isdir(fp):
        continue
    files = sorted(f for f in os.listdir(fp) if f.endswith('.png'))
    for d, idx in DIR_FRAMES.items():
        sprites[f'veh_{folder}_{d}'] = load(os.path.join(fp, files[idx]))

# --- Empaquetage (étagères) ---
PAD = 2
order = sorted(sprites.items(), key=lambda kv: (-kv[1].height, kv[0]))
ATLAS_W = 1024
x = y = row_h = 0
pos = {}
for name, im in order:
    if x + im.width + PAD > ATLAS_W:
        x, y, row_h = 0, y + row_h + PAD, 0
    pos[name] = [x, y, im.width, im.height]
    x += im.width + PAD
    row_h = max(row_h, im.height)
H = y + row_h
atlas = Image.new('RGBA', (ATLAS_W, H), (0, 0, 0, 0))
for name, (px, py, w, h) in pos.items():
    atlas.alpha_composite(sprites[name], (px, py))
os.makedirs(os.path.join(ROOT, 'assets'), exist_ok=True)
atlas.save(os.path.join(ROOT, 'assets', 'atlas.png'), optimize=True)
json.dump(pos, open(os.path.join(ROOT, 'assets', 'atlas.json'), 'w'), indent=0)
print(f'atlas {ATLAS_W}x{H}, {len(pos)} sprites')

# --- Génération de city.html ---
tpl = open(os.path.join(ROOT, 'game.template.html'), encoding='utf-8').read()
b64 = base64.b64encode(open(os.path.join(ROOT, 'assets', 'atlas.png'), 'rb').read()).decode()
out = tpl.replace('__ATLAS_DATA__', 'data:image/png;base64,' + b64).replace('__ATLAS_JSON__', json.dumps(pos, separators=(',', ':')))
open(os.path.join(ROOT, 'city.html'), 'w', encoding='utf-8').write(out)
print('city.html', round(len(out) / 1024), 'Ko')
