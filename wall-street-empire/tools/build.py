#!/usr/bin/env python3
"""Assemble les sprites CC0 en un atlas et génère wall-street-empire/city.html à partir du gabarit.

Usage : python3 wall-street-empire/tools/build.py
Sorties : wall-street-empire/assets/atlas.png, wall-street-empire/assets/atlas.json, wall-street-empire/city.html (atlas inclus en data URI)
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

KH = os.path.join(SRC, 'isometric-houses')
for i in range(24):
    fp = os.path.join(KH, 'house%02d.png' % i)
    if os.path.exists(fp):
        sprites['hs%d' % i] = load(fp)

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
pj = {}
PD = os.path.join(ROOT, 'assets', 'portraits')
if os.path.isdir(PD):
    for f in sorted(os.listdir(PD)):
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            mt = 'image/png' if f.lower().endswith('.png') else 'image/webp' if f.lower().endswith('.webp') else 'image/jpeg'
            pj[os.path.splitext(f)[0]] = 'data:%s;base64,' % mt + base64.b64encode(open(os.path.join(PD, f), 'rb').read()).decode()
hq = {}
_hp = os.path.join(ROOT, 'assets', 'hq')
if os.path.exists(os.path.join(_hp, 'meta.json')):
    _hm = json.load(open(os.path.join(_hp, 'meta.json')))
    for _k, _m in _hm.items():
        _f = os.path.join(_hp, f'hq_{_k}.png')
        if os.path.exists(_f):
            _m = dict(_m); _m['src'] = 'data:image/png;base64,' + base64.b64encode(open(_f, 'rb').read()).decode(); hq[_k] = _m
# Sprites facultatifs de l'usine (Passe 30) : assets/factory/<nom>.png (+ ombres/<nom>.png, ancres.json) -> data URI ; un PNG présent remplace le dessin vectoriel du même nom
fac, facsh, facanch, facbase, facextra = {}, {}, {}, {}, []
FAC_NAMES = ['arbre', 'bobine_acier', 'bobine_cuivre', 'buisson', 'bureau_vitre', 'camion_blanc', 'camion_rouge', 'camion_bleu', 'camion_blanc_ouvert', 'camion_rouge_ouvert', 'camion_bleu_ouvert', 'chariot_elevateur', 'convoyeur_coin', 'convoyeur_droit', 'herbe_tuile', 'machine_assemblage', 'mur_bas_droite', 'mur_bas_gauche', 'ouvrier_gilet_bleu', 'ouvrier_gilet_orange', 'palette_cartons', 'palette_vide', 'plaques_acier', 'presse', 'quai_chargement', 'rack_stockage', 'rack_vide', 'robot_6_axes', 'sol_beton_tuile']
# Emplacements du lot 2 (tools/factory_ai/manifest.json) : noms reconnus par le chargeur des qu'un PNG existe dans assets/factory_hd/ ; aucun poids tant qu'il n'y en a pas
_mf = os.path.join(ROOT, '..', 'tools', 'factory_ai', 'manifest.json')
if os.path.exists(_mf):
    _m = json.load(open(_mf))
    for _s in _m.get('sprites', []):
        if _s.get('lot') == 'lot2' and not _s['nom'].startswith('poses/') and _s['nom'] not in FAC_NAMES and _s['nom'] not in facextra:
            facextra.append(_s['nom'])
    for _pl in _m.get('planches', {}):
        if _pl not in FAC_NAMES and _pl not in facextra:
            facextra.append(_pl)
def _uri(f):
    return 'data:image/png;base64,' + base64.b64encode(open(f, 'rb').read()).decode()
def _lire(d):   # dossier de sprites -> (png, ombres, ancres) ; assets/factory = gabarits, assets/factory_hd = rendus HD (prioritaires)
    r = {'png': {}, 'sh': {}, 'anch': {}}
    if not os.path.isdir(d):
        return r
    _af = os.path.join(d, 'ancres.json')
    _anch = json.load(open(_af)) if os.path.exists(_af) else {}
    for _n in FAC_NAMES + facextra:
        _f = os.path.join(d, _n + '.png')
        if os.path.exists(_f):
            r['png'][_n] = _f
            _s = os.path.join(d, 'ombres', _n + '.png')
            if os.path.exists(_s):
                r['sh'][_n] = _s
            if _n + '.png' in _anch:
                r['anch'][_n + '.png'] = _anch[_n + '.png']
    return r
_hd_dirs = [os.environ.get('WSE_HD_DIR')] if os.environ.get('WSE_HD_DIR') else [os.path.join(ROOT, 'assets', 'factory_hd'), os.path.join(ROOT, '..', 'assets', 'factory_hd')]   # le poste de production (Mac) écrit à la racine du dépôt (assets/factory_hd) ; copie locale facultative dans wall-street-empire/assets/factory_hd
_hd_dir = next((d for d in _hd_dirs if d and os.path.isdir(d) and os.path.exists(os.path.join(d, 'ancres.json'))), _hd_dirs[0])
_base, _hd = _lire(os.path.join(ROOT, 'assets', 'factory')), _lire(_hd_dir)
for _n in list(_base['png']) + [k for k in _hd['png'] if k not in _base['png']]:
    if _n in _hd['png']:   # HD d'abord ; le gabarit reste embarque en repli (si le PNG HD ne charge pas)
        fac[_n] = _uri(_hd['png'][_n]); facanch[_n + '.png'] = _hd['anch'].get(_n + '.png') or _base['anch'].get(_n + '.png')
        if _n in _hd['sh']: facsh[_n] = _uri(_hd['sh'][_n])
        if _n in _base['png']:
            facbase[_n] = {'src': _uri(_base['png'][_n]), 'sh': _uri(_base['sh'][_n]) if _n in _base['sh'] else None, 'a': _base['anch'].get(_n + '.png')}
    else:
        fac[_n] = _uri(_base['png'][_n]); facanch[_n + '.png'] = _base['anch'].get(_n + '.png')
        if _n in _base['sh']: facsh[_n] = _uri(_base['sh'][_n])
facanch = {k: v for k, v in facanch.items() if v}
# Visuels HD des produits (révélation cinéma) : assets/products_hd/<clé produit>.jpg ; aucun poids tant que le dossier est vide, repli sur la vignette SVG
prodhd = {}
_phd = os.path.join(ROOT, 'assets', 'products_hd')
if os.path.isdir(_phd):
    for _f in sorted(os.listdir(_phd)):
        _b, _e = os.path.splitext(_f)
        if _e.lower() in ('.jpg', '.jpeg', '.png', '.webp'):
            _m = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}[_e.lower()]
            prodhd[_b] = 'data:' + _m + ';base64,' + base64.b64encode(open(os.path.join(_phd, _f), 'rb').read()).decode()
print('visuels HD produits :', len(prodhd))
# Photos du Guide du fabricant : assets/guide_hd/<clé de bien ou de produit>.jpg (carte carrée) ; aucun poids tant que le dossier est vide, repli sur la vignette vectorielle
guidehd = {}
for _gd in (os.path.join(ROOT, 'assets', 'guide_hd'), os.path.join(ROOT, '..', 'assets', 'guide_hd')):
    if os.path.isdir(_gd):
        for _f in sorted(os.listdir(_gd)):
            _b, _e = os.path.splitext(_f)
            if _e.lower() in ('.jpg', '.jpeg', '.png', '.webp') and _b not in guidehd:
                _m = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}[_e.lower()]
                guidehd[_b] = 'data:' + _m + ';base64,' + base64.b64encode(open(os.path.join(_gd, _f), 'rb').read()).decode()
print('photos du guide :', len(guidehd))
# Bâtiments de la ville en HD : assets/city_hd/<nom>.png (+ ancres.json : largeur, hauteur, ancre_x, ancre_y, emprise_px) ; vide = atlas Kenney
cityhd = {}; cityanch = {}
for _cd in (os.path.join(ROOT, 'assets', 'city_hd'), os.path.join(ROOT, '..', 'assets', 'city_hd')):
    if os.path.isdir(_cd):
        _aj = os.path.join(_cd, 'ancres.json')
        if os.path.exists(_aj):
            for _k, _v in json.load(open(_aj)).items(): cityanch.setdefault(_k.replace('.png', ''), _v)
        for _f in sorted(os.listdir(_cd)):
            _b, _e = os.path.splitext(_f)
            if _e.lower() == '.png' and _b not in cityhd: cityhd[_b] = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(_cd, _f), 'rb').read()).decode()
print('batiments HD de la ville :', len(cityhd))
print('sprites usine :', len(fac), 'sur', len(FAC_NAMES) + len(facextra), '(dont HD :', len(_hd['png']), ')', '(repli vectoriel pour les autres)')
out = tpl.replace('__FAC_JSON__', json.dumps(fac)).replace('__FACSH_JSON__', json.dumps(facsh)).replace('__FACANCH_JSON__', json.dumps(facanch)).replace('__FACBASE_JSON__', json.dumps(facbase)).replace('__FACX_JSON__', json.dumps(facextra)).replace('__GUIDEHD_JSON__', json.dumps(guidehd)).replace('__PRODHD_JSON__', json.dumps(prodhd)).replace('__CITYHD_JSON__', json.dumps(cityhd)).replace('__CITYANCH_JSON__', json.dumps(cityanch)).replace('__HQ_JSON__', json.dumps(hq)).replace('__PORTRAITS_JSON__', json.dumps(pj)).replace('__ATLAS_DATA__', 'data:image/png;base64,' + b64).replace('__ATLAS_JSON__', json.dumps(pos, separators=(',', ':')))
open(os.environ.get('WSE_OUT') or os.path.join(ROOT, 'city.html'), 'w', encoding='utf-8').write(out)
print('city.html', round(len(out) / 1024), 'Ko')
