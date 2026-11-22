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
                _raw = open(os.path.join(_gd, _f), 'rb').read()
                try:   # vignettes du Guide : 288 px JPEG q78 suffisent (cartes ~120 px, fiche ~260 px) ; divise le poids par ~3
                    import io; from PIL import Image as _I
                    _im = _I.open(io.BytesIO(_raw)).convert('RGB'); _im.thumbnail((288, 288)); _bf = io.BytesIO(); _im.save(_bf, 'JPEG', quality=78, optimize=True); _raw = _bf.getvalue(); _m = 'image/jpeg'
                except Exception: pass
                guidehd[_b] = 'data:' + _m + ';base64,' + base64.b64encode(_raw).decode()
# Passe 59 (audit des produits, docs/AUDIT_PRODUITS.md) : corrections de branchement sans nouvelle image.
# GUIDE_SUBST : la photo propre au produit est mauvaise (pseudo-texte, sujet faux) et une photo existante convient mieux -> remplacée (retirer la ligne quand la commande Cowork est livrée).
# GUIDE_FILL : pas de photo pour la clé -> photo existante fidèle d'un bien voisin (ne s'applique pas si une photo propre arrive).
GUIDE_SUBST = {'whisky': 'spirit'}   # whisky.jpg : grande étiquette en pseudo-lettres ; spirit.jpg : carafe de spiritueux ambré, sans texte
GUIDE_FILL = {'sweater': 'jacket', 'beefmeat': 'meat', 'porkmeat': 'meat', 'drinkmilk': 'milk'}   # jacket.jpg montre un pull plié ; meat.jpg une pièce de viande rouge persillée sur planche (bœuf, et porc en attendant porkmeat.jpg, passe 18 d'audit) ; milk.jpg un pichet et un verre de lait
for _k, _s in GUIDE_SUBST.items():
    if _s in guidehd: guidehd[_k] = guidehd[_s]
for _k, _s in GUIDE_FILL.items():
    if _k not in guidehd and _s in guidehd: guidehd[_k] = guidehd[_s]
# GUIDE_COMPOSE : matières animales sans photo -> l'animal HD existant (assets/phase2_hd/animal_*.png) posé sur le fond studio gris clair des photos du Guide (repli provisoire, commande Cowork en cours)
GUIDE_COMPOSE = {'beef': 'animal_vache', 'pork': 'animal_cochon', 'poultry': 'animal_poule', 'lamb': 'animal_mouton', 'wool': 'animal_mouton'}
def _studio(src):
    import io
    from PIL import Image as _I, ImageDraw as _D, ImageFilter as _F
    S_ = 288; bg = _I.new('RGB', (S_, S_)); px = bg.load()
    for y in range(S_):
        for x in range(S_):
            v = int(226 - 22 * y / S_ - 10 * (((x - S_ / 2) / S_) ** 2 + ((y - S_ * 0.4) / S_) ** 2)); px[x, y] = (v, v, min(255, v + 3))
    a = _I.open(src).convert('RGBA'); a = a.crop(a.getbbox()); k = min(S_ * 0.78 / a.width, S_ * 0.70 / a.height); a = a.resize((max(1, round(a.width * k)), max(1, round(a.height * k))), _I.LANCZOS)
    ox, oy = (S_ - a.width) // 2, int(S_ * 0.86) - a.height
    sh = _I.new('L', (S_, S_), 0); _D.Draw(sh).ellipse((ox + a.width * 0.08, oy + a.height - 10, ox + a.width * 0.92, oy + a.height + 12), fill=90); sh = sh.filter(_F.GaussianBlur(7))
    bg.paste((150, 150, 156), (0, 0), sh); bg.paste(a, (ox, oy), a); bf = io.BytesIO(); bg.save(bf, 'JPEG', quality=80, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(bf.getvalue()).decode()
for _k, _n in GUIDE_COMPOSE.items():
    _p = os.path.join(ROOT, '..', 'assets', 'phase2_hd', _n + '.png')
    if _k not in guidehd and os.path.exists(_p):
        try: guidehd[_k] = _studio(_p)
        except Exception as _e: print('composition', _k, _e)
print('photos du guide :', len(guidehd))

def _diamond(_im):
    """Losange de la parcelle : (xg, xd, ym) = extrémités gauche/droite de la rangée la plus large (sommets gauche et droit de la dalle), ym = hauteur de cette rangée ; le centre de la case est le centre de cette rangée."""
    a = _im.getchannel('A').point(lambda v: 255 if v > 40 else 0); w, h = a.size; px = a.load(); best = (0, 0, 0, 0)
    ext = []
    for y in range(h):
        xs = [x for x in range(0, w, 2) if px[x, y]]
        ext.append((min(xs), max(xs)) if xs else None)
    mw = max((e[1] - e[0]) for e in ext if e); ys = [y for y, e in enumerate(ext) if e and (e[1] - e[0]) >= mw - 3]
    ym = sum(ys) / len(ys); xl = min(ext[y][0] for y in ys); xr = max(ext[y][1] for y in ys)
    return [xl, xr, round(ym, 1)]
import sys as _sys
_sys.path.insert(0, os.path.join(ROOT, '..', 'tools', 'factory_ai'))
try:
    import asset_qa as _qa
except Exception: _qa = None
def _sy(path):
    """Écrasement vertical d'un sprite dont la parcelle est vue plus relevée que la grille 2:1 du jeu (pente des arêtes basses > 0,5) : on ramène la dalle sur le losange de la case."""
    try:
        r = _qa.analyse(path) if _qa else None
        if r and r['pente'] and 0.52 < float(r['pente']) < 0.9: return round(0.5 / float(r['pente']), 3)
    except Exception: pass
    return 1.0
# Bâtiments de la ville en HD : assets/city_hd/<nom>.png (+ ancres.json : largeur, hauteur, ancre_x, ancre_y, emprise_px) ; vide = atlas Kenney
CITY_NAMES = ['maison_moderne_cubique', 'maison_de_ville_briques', 'pavillon_banlieue', 'brownstone_new_yorkais', 'immeuble_londonien_briques', 'immeuble_haussmannien', 'immeuble_art_deco', 'immeuble_residentiel_6_etages_a', 'immeuble_residentiel_6_etages_b', 'immeuble_residentiel_moderne', 'tour_de_verre', 'immeuble_bureaux_vitre', 'tour_bureaux_12_etages_a', 'tour_bureaux_12_etages_b', 'banque_neoclassique', 'hotel_de_luxe', 'gratte_ciel_25_etages_a', 'gratte_ciel_25_etages_b', 'gratte_ciel_40_etages_a', 'gratte_ciel_40_etages_b', 'gratte_ciel_60_etages_a', 'gratte_ciel_60_etages_b', 'chalet_savoyard', 'maison_japonaise', 'villa_mediterraneenne', 'maison_bois_nordique', 'immeuble_residentiel_6_etages_b']
cityhd = {}; cityanch = {}; CITY_DEFRINGE = []
for _cd in (os.path.join(ROOT, 'assets', 'city_hd'), os.path.join(ROOT, '..', 'assets', 'city_hd')):
    if os.path.isdir(_cd):
        _aj = os.path.join(_cd, 'ancres.json')
        if os.path.exists(_aj):
            for _k, _v in json.load(open(_aj)).items(): cityanch.setdefault(_k.replace('.png', ''), _v)
        for _f in sorted(os.listdir(_cd)):
            _b, _e = os.path.splitext(_f)
            if _e.lower() == '.png' and _b not in cityhd: cityhd[_b] = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(_cd, _f), 'rb').read()).decode()
for _n in CITY_NAMES:   # les bâtiments produits par le Mac sont dans assets/factory_hd (même dossier que les sprites d'usine)
    _f = os.path.join(_hd_dir, _n + '.png')
    if _n not in cityhd and os.path.exists(_f):
        cityhd[_n] = 'data:image/png;base64,' + base64.b64encode(open(_f, 'rb').read()).decode()
        CITY_DEFRINGE.append(_n)   # passe 99 : liseré sombre corrigé plus bas (_defringe, défini avec les sprites de la phase 2)
        _aa = json.load(open(os.path.join(_hd_dir, 'ancres.json'))).get(_n + '.png')
        if _aa and _n not in cityanch: cityanch[_n] = _aa
        try:   # emprise réelle (pixels opaques) : la parcelle du sprite est calée sur le losange de la case, pas sur l'ancre approximative
            from PIL import Image as _I
            _im = _I.open(_f).convert('RGBA'); _bb = _im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
            if _bb: cityanch[_n] = dict(cityanch.get(_n) or {}, bb=list(_bb), dm=_diamond(_im), sy=_sy(_f))
        except Exception: pass
print('batiments HD de la ville :', len(cityhd))
# Gisements et extracteurs HD (phase 2) : assets/phase2_hd/<nom>.png ; réduits de moitié et passés en palette 256 couleurs pour limiter le poids ; l'ancre est le sommet bas de la parcelle (bas de l'image), la largeur d'origine donne l'emprise (396 px par case)
P2_NAMES = ['gisement_argile', 'gisement_bauxite', 'gisement_charbon', 'gisement_cuivre', 'gisement_fer', 'gisement_gaz', 'gisement_graphite', 'gisement_lithium', 'gisement_nickel_chrome', 'gisement_petrole', 'gisement_phosphate', 'gisement_potasse', 'gisement_sel', 'gisement_silice', 'gisement_zinc',
            'herbe_a', 'herbe_b', 'herbe_c', 'herbe_d', 'terre_a', 'terre_b', 'terre_c', 'terre_d', 'sol_ville_pave', 'sol_port_asphalte', 'sol_quai_beton_a', 'sol_quai_beton_b', 'eau_calme', 'eau_rivage_quai', 'rivage_sable',
            'route_droite_ne', 'route_droite_nw', 'route_croix', 'route_t_ne', 'route_t_nw', 'route_t_se', 'route_t_sw', 'route_coude_ne_nw', 'route_coude_ne_se', 'route_coude_se_sw', 'route_coude_sw_nw', 'route_bout_ne', 'route_bout_nw', 'route_bout_se', 'route_bout_sw', 'route_isolee',
            'mine_bauxite', 'mine_charbon', 'mine_cuivre', 'mine_cuivre_niveau3', 'mine_fer', 'mine_graphite', 'mine_lithium', 'mine_nickel_chrome', 'mine_or', 'mine_phosphate', 'mine_potasse', 'mine_sel', 'mine_zinc', 'puits_gaz', 'puits_petrole', 'carriere', 'carriere_argile', 'carriere_silice', 'camp_bucherons',
            'fcorn', 'frapeseed', 'entrepot', 'centrale_solaire', 'eolienne', 'centrale_charbon', 'centrale_nucleaire', 'pylone_electrique', 'centre_rd', 'data_center', 'chantier_moyen', 'agence_immo', 'fonderie', 'usine_petite_f1', 'usine_moyenne_f2', 'usine_grande_f3', 'usine_f4_mega', 'petit_marche_n1', 'petit_marche_n2', 'mega_centre_commercial', 'terminal_portuaire', 'station_tv', 'stade_sport', 'supermarche', 'hypermarche', 'fwheat', 'fsugar', 'fcotton', 'frubber', 'fvine', 'fcattle', 'fchicken', 'fpig', 'fsheep', 'foret_dense_a', 'foret_dense_b', 'foret_dense_c', 'foret_sapins_a', 'foret_sapins_b', 'arbre_isole_a', 'arbre_isole_b', 'arbre_isole_c', 'arbre_isole_d', 'buisson_a', 'buisson_b', 'arbre_ville',
            # passe 46 : magasins spécialisés (boutique de mode, pharmacie-drugstore) et voitures exposées par la concession et garées devant les boutiques
            'boutique_mode', 'drugstore', 'concession_auto', 'boutique_high_tech', 'boutique_luxe', 'boutique_mode_luxe', 'maison_deco', 'sport_loisirs', 'pharmacie', 'brico_outillage', 'voiture_ville_a', 'voiture_ville_b', 'veh_noir', 'veh_argent', 'veh_blanc', 'veh_rouge']
# Ville vivante (intégrateur n° 9) : services de quartier, véhicules, navire, port, détails de ferme, niveaux, décor ; même chaîne que la phase 2 (moitié de la taille, palette 256 couleurs)
VV_NAMES = ['boulangerie', 'boutique_mode', 'cafe_de_quartier', 'restaurant_terrasse', 'ecole', 'hopital', 'gare_ferroviaire', 'eglise_de_village', 'station_service', 'station_recharge_electrique', 'drugstore', 'barre_hlm', 'immeuble_en_construction', 'mairie',
            'veh_argent', 'veh_blanc', 'veh_bleu', 'veh_camionnette', 'veh_jaune', 'veh_noir', 'veh_orange', 'veh_pickup', 'veh_rouge', 'veh_vert', 'voiture_ville_a', 'voiture_ville_b', 'camion_ville', 'navire_cargo',
            'grue_portique', 'conteneur_bleu', 'conteneur_rouge', 'conteneur_pile', 'bac_argile', 'bac_bauxite', 'bac_chrome', 'bac_graphite', 'bac_lithium', 'bac_nickel', 'bac_phosphate', 'bac_potasse', 'bac_sel', 'bac_silice', 'bac_soufre', 'bac_terres_rares', 'bac_zinc', 'lingots_aluminium', 'lingots_laiton', 'sacs_alumine', 'sacs_engrais', 'barres_galva', 'barres_inox', 'briques_palette', 'futs_gaz', 'porcelaine_caisses', 'chassis_aluminium', 'aimants_terres_rares', 'maison_pnj_a', 'maison_pnj_b', 'maison_pnj_c', 'immeuble_pnj_a', 'immeuble_pnj_b',
            'animal_vache', 'animal_mouton', 'animal_poule', 'animal_cochon', 'auge_foin', 'balles_foin', 'meule_foin', 'fermier_seau', 'vendangeur', 'vigneron_hotte', 'champ_ble_vert', 'champ_ble_mur',
            'maison_n1', 'maison_n2', 'maison_n3', 'immeuble_n1', 'immeuble_n2', 'tour_bureaux', 'tour_logements', 'tour_tech', 'tour_pnj_a', 'tour_pnj_b', 'siege_hq_n1', 'siege_hq_n2', 'siege_hq_n3', 'supermarche_n2', 'supermarche_n3', 'hypermarche_n2', 'hypermarche_n3',
            'parc_urbain', 'rochers_a', 'rochers_b', 'gisement_or', 'batiment_abandonne', 'chantier_petit',
            # passe 78 : supermarché et hypermarché, bâtiment seul occupant la parcelle (assets/factory_hd/bat_*)
            'bat_supermarche', 'bat_supermarche_n2', 'bat_supermarche_n3', 'bat_hypermarche', 'bat_hypermarche_n2', 'bat_hypermarche_n3',
            # passe 87 : annexes des fermes agrandies (granges, silos, chais, étables, bergeries, porcheries, poulaillers ; assets/factory_hd/bat_*)
            'bat_ferme_hangar', 'bat_ferme_bovins', 'bat_chai_vigne', 'bat_chai_vigneron', 'bat_ferme_stabulation_ronde', 'bat_ferme_etable_traversante', 'bat_ferme_traite', 'bat_ferme_bergerie', 'bat_ferme_moutons', 'bat_ferme_porcherie', 'bat_ferme_porcs', 'bat_ferme_poulailler', 'bat_ferme_poulets']
P2_NAMES += [_n for _n in VV_NAMES if _n not in P2_NAMES]
P2_NAMES += ['aeroport_terminal']   # passe 94 : aérogare HD (commande 55-4), visuel d'en-tête de la vue intérieure de l'aéroport (la carte garde le dessin animé : avions fixes et socle épais dans l'image)
P2_NAMES += ['concasseur_recyclage']   # passe 79 : carrière de granulats dont le gisement est épuisé et qui vit de son concasseur (livré pour la commande 55-1)
# Passe 99 (audit de couverture HD, docs/AUDIT_HD_COUVERTURE.md) : PNG HD livrés mais jamais branchés. Équipements publics (caserne, commissariat), banque du joueur,
# campus du data center (5×4), méga-centre commercial seul sur sa dalle, port (navires, phare, voilier, remorqueur, portique de quai, piles de conteneurs, engins, réservoirs, vrac),
# et personnages HD (poses de marche et debout de assets/factory_hd/poses) pour les clients et commerçants du mall central.
P2_NAMES += ['caserne_pompiers', 'commissariat', 'banque', 'data_center_campus', 'bat_mega_centre_commercial',
             'port_navire_cargo_ne', 'port_navire_cargo_se', 'port_navire_petrolier', 'port_navire_vraquier', 'port_ferry', 'port_remorqueur_ne', 'port_voilier', 'port_bateau_peche', 'port_phare',
             'port_portique_quai', 'port_piles_conteneurs_a', 'port_piles_conteneurs_b', 'port_reach_stacker', 'port_cavalier_straddle', 'port_reservoirs', 'port_terminal_vrac', 'port_entrepot_a']
P2_POSES = ['poses/ouvrier_%s_%s' % (w, p) for w in ('h1', 'h2', 'h3', 'f1', 'f2', 'f3') for p in ('marche', 'debout')]
P2_NAMES += P2_POSES
p2hd = {}; p2dim = {}
# Sol et routes (losanges 396x198 sans couture) : pas de palette 256 couleurs (bandes visibles sur l'herbe) mais un JPEG de qualité ;
# le pourtour transparent est rempli par extension des couleurs du bord (aucun liseré sombre quand le jeu découpe le losange avec 1 px de recouvrement).
GROUND_TILES = set(n for n in P2_NAMES if n.startswith(('herbe_', 'terre_', 'sol_', 'eau_', 'rivage_', 'route_')))
GROUND_PX = (264, 132)
def _ground_tile(name, im, path=None):
    import numpy as np
    from PIL import ImageFilter as _F
    a = np.asarray(im, dtype=np.float32) / 255.0
    rgb, al = a[..., :3], a[..., 3:4]
    fill = np.zeros_like(rgb); have = np.zeros(al.shape, bool)
    for r in (1, 3, 8, 20):   # extension des couleurs du bord vers l'extérieur du losange (push-pull)
        pm = Image.fromarray(np.uint8(np.clip(rgb * al * 255, 0, 255))).filter(_F.GaussianBlur(r))
        pa = np.asarray(Image.fromarray(np.uint8(np.clip(al[..., 0] * 255, 0, 255))).filter(_F.GaussianBlur(r)), dtype=np.float32)[..., None] / 255.0
        f = np.clip(np.asarray(pm, dtype=np.float32) / 255.0 / np.maximum(pa, 1e-3), 0, 1)
        m = (~have) & (pa > 0.02); fill = np.where(m, f, fill); have |= m
    out = rgb * al + fill * (1 - al)
    img = Image.fromarray(np.uint8(np.clip(out * 255, 0, 255)), 'RGB')
    if name in ('eau_calme', 'rivage_sable', 'sol_port_asphalte', 'sol_ville_pave'):   # éclairage propre à chaque tuile (dégradé, vignette) : coutures visibles en mosaïque ; on retire la basse fréquence (filtre passe-haut) et on garde les vaguelettes
        lo = np.asarray(img.filter(_F.GaussianBlur(28)), dtype=np.float32); hi = np.asarray(img, dtype=np.float32)
        m = (al[..., 0] > 0.5); mean = hi[m].mean(axis=0)
        img = Image.fromarray(np.uint8(np.clip(hi - lo + mean, 0, 255)), 'RGB')
    if name == 'eau_calme':   # l'eau livrée n'est pas périodique : décalage d'une demi-case et fondu (au bord seule la copie décalée reste) -> raccord exact entre cases
        t = np.asarray(img, dtype=np.float32); H, W = t.shape[:2]
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); s = (yy + 0.5) / (H / 2); d = (xx + 0.5 - W / 2) / (W / 2); u = (s + d) / 2; v = (s - d) / 2
        u2, v2 = (u + 0.5) % 1.0, (v + 0.5) % 1.0
        sx = np.clip(W / 2 + (u2 - v2) * W / 2, 0, W - 1).astype(int); sy = np.clip((u2 + v2) * H / 2, 0, H - 1).astype(int)
        wgt = np.clip(np.sin(np.pi * np.clip(u, 0, 1)) * np.sin(np.pi * np.clip(v, 0, 1)), 0, 1)[..., None] ** 0.7
        img = Image.fromarray(np.uint8(np.clip(t * wgt + t[sy, sx] * (1 - wgt), 0, 255)), 'RGB')
    if name == 'eau_rivage_quai':   # l'eau de cette tuile est plus foncée et plus bleue que eau_calme : on ramène les pixels d'eau (bleu dominant) à la moyenne et à l'écart type de eau_calme
        try:
            ref = np.asarray(Image.open(os.path.join(os.path.dirname(path), 'eau_calme.png')).convert('RGB'), dtype=np.float32) if path else None
        except Exception: ref = None
        if ref is not None:
            t = np.asarray(img, dtype=np.float32); wm = (t[..., 2] > t[..., 0] + 25) & (al[..., 0] > 0.5); rm = ref[(ref[..., 2] > ref[..., 0] + 25)]
            if wm.sum() > 100 and len(rm) > 100:
                mu, sd, mr, sr = t[wm].mean(0), t[wm].std(0) + 1e-3, rm.mean(0), rm.std(0)
                t2 = t.copy(); t2[wm] = (t[wm] - mu) / sd * sr + mr; img = Image.fromarray(np.uint8(np.clip(t2, 0, 255)), 'RGB')
    if name in ('eau_calme', 'eau_rivage_quai'):   # charte : eau bleu-gris profond, pas de cyan vif (teinte vers le bleu, saturation -28 %, luminosité -22 %) ; sur le quai, seuls les pixels d'eau changent
        t = np.asarray(img, dtype=np.float32); hsv = np.asarray(img.convert('HSV'), dtype=np.float32)
        hsv[..., 0] = np.clip(hsv[..., 0] + 14, 0, 255); hsv[..., 1] *= 0.72; hsv[..., 2] *= 0.78
        g = np.asarray(Image.fromarray(np.uint8(np.clip(hsv, 0, 255)), 'HSV').convert('RGB'), dtype=np.float32)
        wm = (t[..., 2] > t[..., 0] + 25)[..., None] if name == 'eau_rivage_quai' else np.ones(t.shape[:2] + (1,), bool)
        img = Image.fromarray(np.uint8(np.where(wm, g, t)), 'RGB')
    if name.startswith('herbe_'):   # charte : herbe moins saturée (-25 %) et teinte décalée vers le jaune-vert doux
        h, s, v = img.convert('HSV').split()
        h = h.point(lambda x: max(0, x - 3)); s = s.point(lambda x: int(x * 0.75))
        img = Image.merge('HSV', (h, s, v)).convert('RGB')
    return img.resize(GROUND_PX, Image.LANCZOS)
# Passe 78 (revue des bâtiments, docs/REVUE_BATIMENTS.md) : encodage des sprites de la phase 2.
# Avant : réduction ×0,5 puis palette 256 couleurs FASTOCTREE sans tramage -> paliers et taches sur les dégradés lisses (toits plats, murs, ciel des vitrages) :
# mesuré en jeu (zoom 1,5 et 2,5) contre la source pleine définition, 10 à 13 % des pixels des zones lisses s'écartaient de plus de 6 niveaux (0,1 % sans la palette).
# Maintenant : WebP, alpha sans perte, couleur qualité 90, aucune palette, PLEINE définition (396 px par case pour la plupart) : une réduction préalable
# (×0,5 ou ×0,66) suivie de la réduction du jeu fait deux rééchantillonnages et coûte plus en SSIM que l'encodage lui-même (mesuré : SSIM 0,964 à ×0,66 contre 0,997 en pleine définition).
# Seules les sources au-delà de 480 px par case sont ramenées à 400 px par case. WSE_P2_ENC=png256 rétablit l'ancien encodage (comparaisons, tools/tests/t81_encodage.js).
P2_ENC = os.environ.get('WSE_P2_ENC', 'webp')
P2_PXCASE = 400   # px source par case au-delà de 480 px par case (largeur de la dalle / nombre de cases de large)
P2_FP = {'aeroport_terminal': 2, 'supermarche': 2, 'supermarche_n2': 2, 'supermarche_n3': 2, 'hypermarche': 3, 'hypermarche_n2': 3, 'hypermarche_n3': 3, 'bat_supermarche': 2, 'bat_supermarche_n2': 2, 'bat_supermarche_n3': 2,
         'bat_hypermarche': 3, 'bat_hypermarche_n2': 3, 'bat_hypermarche_n3': 3, 'usine_moyenne_f2': 1.5, 'usine_grande_f3': 2, 'usine_f4_mega': 3, 'mega_centre_commercial': 2, 'terminal_portuaire': 2,
         'centrale_nucleaire': 3, 'centrale_solaire': 4.5, 'data_center': 4.5, 'concession_auto': 2, 'boutique_high_tech': 1.5, 'maison_deco': 1.5, 'sport_loisirs': 1.5, 'chantier_moyen': 1.5,
         'centrale_charbon': 1.5, 'bat_mega_centre_commercial': 3, 'data_center_campus': 4.5, 'port_navire_cargo_ne': 2, 'port_navire_cargo_se': 2, 'port_navire_petrolier': 2, 'port_navire_vraquier': 2, 'port_ferry': 2, 'port_portique_quai': 2, 'siege_hq_n2': 2, 'siege_hq_n3': 2, 'fwheat': 3, 'fsugar': 3, 'fcotton': 3, 'frubber': 3, 'fvine': 3, 'fcorn': 3, 'frapeseed': 3, 'fcattle': 2, 'fchicken': 2, 'fpig': 2, 'fsheep': 2}
# Passe 78 : éclairage. Convention du jeu (mesurée sur maisons, immeubles, tours, usine moyenne, boutiques v2, dalle commune des commerces) : lumière haut-gauche,
# flanc gauche (face sud-ouest) clair, flanc droit (face sud-est) sombre. Ces sprites sont rendus avec la lumière à DROITE (flancs de dalle et murs gauche
# nettement plus sombres que les droits, voir tools/tests/t80_orientation.js) et n'ont ni texte ni façade orientée par le jeu : un miroir horizontal remet
# la lumière à gauche sans rien casser (le miroir est fait ici, avant toute mesure : dimensions, losange, ancres et profils restent cohérents).
P2_FLIP = {'entrepot', 'terminal_portuaire', 'centrale_nucleaire', 'data_center', 'chantier_moyen', 'stade_sport', 'eolienne', 'puits_petrole', 'puits_gaz', 'mine_fer', 'mine_charbon', 'mine_cuivre', 'mine_or',
           'mine_nickel_chrome', 'mine_bauxite', 'mine_lithium', 'mine_zinc', 'mine_graphite', 'mine_phosphate', 'mine_potasse', 'mine_sel', 'mine_cuivre_niveau3', 'carriere', 'carriere_argile', 'carriere_silice', 'camp_bucherons'}
# Passe 78 : supermarché et hypermarché = bâtiment seul sur sa dalle (assets/factory_hd/bat_*), qui occupe la parcelle (au lieu d'un petit cube au fond d'un
# grand parking de voitures criardes). Les niveaux 1 portent un cartouche « SUPERMARKET » / « HYPERMARKET » sur le toit (texte interdit dans les assets) :
# il est effacé ici (cartouche bleu + lettres, cadre en px de l'image d'origine) et le toit y est reconstruit (plan ajusté sur le toit nu voisin, garde le dégradé).
P2_UNLABEL = {'bat_supermarche': (131, 60, 314, 171), 'bat_hypermarche': (184, 75, 400, 212)}
def _unlabel(im, box):
    import numpy as np
    from PIL import ImageFilter as _F
    a = np.asarray(im, np.float32); x0, y0, x1, y1 = box
    blue = (a[..., 2] > a[..., 0] + 70) & (a[..., 3] > 200); m = np.zeros(blue.shape, bool); m[y0:y1 + 1, x0:x1 + 1] = blue[y0:y1 + 1, x0:x1 + 1]
    ys, xs = np.where(m)
    for y in range(y0, y1 + 1):   # lettres blanches dans le cartouche : entre le premier et le dernier pixel bleu de la ligne
        r = xs[ys == y]
        if len(r): m[y, r.min():r.max() + 1] = True
    # le cartouche laisse aussi un reflet bleuté et une ombre ovale autour de lui : la zone remplacée suit sa forme, élargie de 25 px, limitée au toit
    # (pixels proches de la teinte du toit nu) ; le toit y est reconstruit par un plan ajusté sur le toit nu voisin (moindres carrés), fondu sur les bords.
    def dil(b, k): return np.asarray(Image.fromarray(np.uint8(b * 255)).filter(_F.MaxFilter(k))) > 0
    L = a[..., :3] @ np.array([0.299, 0.587, 0.114], np.float32); d = a[..., 2] - a[..., 0]; op = a[..., 3] > 200
    ring = dil(m, 121) & ~dil(m, 61) & op & (np.abs(d - 16) < 4)
    ref = np.median(L[ring]); roof = op & (np.abs(L - ref) < 28) & (d < 50)
    Z = (dil(m, 51) & roof) | dil(m, 7)
    ys, xs = np.where(ring); X = np.stack([xs, ys, np.ones_like(xs)], 1).astype(np.float32)
    H, W = m.shape; gy, gx = np.mgrid[0:H, 0:W].astype(np.float32); plane = np.zeros((H, W, 3), np.float32)
    for c in range(3):
        co = np.linalg.lstsq(X, a[ys, xs, c], rcond=None)[0]; plane[..., c] = gx * co[0] + gy * co[1] + co[2]
    wgt = np.asarray(Image.fromarray(np.uint8(Z * 255)).filter(_F.GaussianBlur(3)), np.float32)[..., None] / 255.0 * Z[..., None]
    wgt = np.maximum(wgt, dil(m, 21)[..., None].astype(np.float32))
    out = a.copy(); out[..., :3] = a[..., :3] * (1 - wgt) + plane * wgt
    return Image.fromarray(np.uint8(np.clip(out, 0, 255)), 'RGBA')
# Passe 99 (artefacts, Rémy : « plein d'artefacts sur les images ») : liseré sombre autour des sprites. Les rendus livrés ont un bord semi-transparent de 1-2 px dont la couleur
# a été mélangée au fond noir du rendu (couleur prémultipliée laissée en alpha droit) : -90 à -120 niveaux de luminance contre le pixel opaque voisin sur centre_rd, stade,
# bat_mega_centre_commercial, tours, banque… -> halo sombre autour de chaque bâtiment, surtout sur le sol clair. Correction : sur ce seul liseré (pixel semi-transparent qui touche à
# la fois l'objet opaque et le vide, à 2 px près) et seulement s'il est nettement plus sombre que l'objet, la couleur est remplacée par celle des pixels opaques voisins
# (moyenne pondérée) ; l'alpha ne change pas. Les ombres portées (larges zones semi-transparentes) et les vitrages ne sont pas touchés.
def _defringe(im):
    import numpy as np
    from PIL import ImageFilter as _F
    a = np.asarray(im, np.float32); al = a[..., 3]
    op = al >= 250; tr = al < 10
    mx = lambda m: np.asarray(Image.fromarray(np.uint8(m * 255)).filter(_F.MaxFilter(5))) > 0
    fr = (al >= 10) & (al < 250) & mx(op) & mx(tr)
    if not fr.any(): return im, 0
    bl = lambda x: np.asarray(Image.fromarray(np.uint8(np.clip(x, 0, 255))).filter(_F.GaussianBlur(1.6)), np.float32)
    w = bl(op * 255.0) / 255.0; C = np.stack([bl(a[..., c] * op) for c in range(3)], -1) / np.maximum(w, 1e-3)[..., None]
    L = lambda x: x[..., :3] @ np.array([0.299, 0.587, 0.114], np.float32)
    fix = fr & (w > 0.04) & (L(a) < L(C) - 30)
    if not fix.any(): return im, 0
    out = a.copy(); out[fix, :3] = C[fix]
    return Image.fromarray(np.uint8(np.clip(out, 0, 255)), 'RGBA'), int(fix.sum())
P2_DEFRINGE = {}
def _p2enc(name, im, dim):
    import io
    if P2_ENC == 'png256':
        sm = im.resize((max(1, im.width // 2), max(1, im.height // 2)), Image.LANCZOS).quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE)
        bf = io.BytesIO(); sm.save(bf, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(bf.getvalue()).decode()
    dw = max(1.0, float(dim[7]) - float(dim[6])) if len(dim) > 7 else im.width
    pc = dw / P2_FP.get(name, 1); k = 1.0 if pc <= 480 else P2_PXCASE / pc
    sm = im if k > 0.97 else im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    bf = io.BytesIO(); sm.save(bf, 'WEBP', quality=int(os.environ.get('WSE_P2_Q', '90')), alpha_quality=100, method=4); return 'data:image/webp;base64,' + base64.b64encode(bf.getvalue()).decode()
for _d in (os.path.join(ROOT, 'assets', 'phase2_hd'), os.path.join(ROOT, '..', 'assets', 'phase2_hd'), os.path.join(ROOT, '..', 'assets', 'factory_hd')):
    _aj = os.path.join(_d, 'ancres.json'); _anc = json.load(open(_aj)) if os.path.exists(_aj) else {}
    for _n in P2_NAMES:
        _f = os.path.join(_d, _n + '.png')
        if _n in p2hd or not os.path.exists(_f): continue
        try:
            import io; from PIL import Image as _I
            _im = _I.open(_f).convert('RGBA')
            if _n in P2_FLIP: _im = _im.transpose(_I.FLIP_LEFT_RIGHT)
            if _n in P2_UNLABEL: _im = _unlabel(_im, P2_UNLABEL[_n])
            if _n not in GROUND_TILES and os.environ.get('WSE_DEFRINGE', '1') != '0': _im, P2_DEFRINGE[_n] = _defringe(_im)
            p2dim[_n] = [_im.width, _im.height] + list(_im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox() or (0, 0, _im.width, _im.height)) + _diamond(_im) + [_sy(_f)]
            _a = _anc.get(_n + '.png')   # indices 10 et 11 : ancre (pieds, contact au sol) d'ancres.json, -1 si absente ; sert aux objets posés (véhicules, animaux, personnages, grue, navire)
            p2dim[_n] += [(_im.width - _a['ancre_x']) if _n in P2_FLIP else _a['ancre_x'], _a['ancre_y']] if _a and 'ancre_x' in _a and 'ancre_y' in _a else [-1, -1]
            if _n in GROUND_TILES:   # tuiles de sol et de route : JPEG 264x132 (2 px par px du jeu à zoom 1), le jeu les découpe sur le losange
                _bf = io.BytesIO(); _ground_tile(_n, _im, _f).save(_bf, 'JPEG', quality=88, optimize=True, subsampling=0); p2hd[_n] = 'data:image/jpeg;base64,' + base64.b64encode(_bf.getvalue()).decode(); continue
            p2hd[_n] = _p2enc(_n, _im, p2dim[_n])
        except Exception as _e: print('phase2 ignoré', _n, _e)
for _n in CITY_DEFRINGE:
    try:
        import io
        _im, _k = _defringe(Image.open(os.path.join(_hd_dir, _n + '.png')).convert('RGBA'))
        if _k: _bf = io.BytesIO(); _im.save(_bf, 'WEBP', quality=92, alpha_quality=100, method=4); cityhd[_n] = 'data:image/webp;base64,' + base64.b64encode(_bf.getvalue()).decode(); P2_DEFRINGE['city:' + _n] = _k
    except Exception as _e: print('liseré', _n, _e)
print('liseré sombre corrigé :', sum(1 for v in P2_DEFRINGE.values() if v), 'sprites,', sum(P2_DEFRINGE.values()), 'px')
print('sprites phase 2 :', len(p2hd), ' poids', sum(len(v) for v in p2hd.values()) // 1024, 'Ko')
print('sprites usine :', len(fac), 'sur', len(FAC_NAMES) + len(facextra), '(dont HD :', len(_hd['png']), ')', '(repli vectoriel pour les autres)')
out = tpl.replace('__FAC_JSON__', json.dumps(fac)).replace('__FACSH_JSON__', json.dumps(facsh)).replace('__FACANCH_JSON__', json.dumps(facanch)).replace('__FACBASE_JSON__', json.dumps(facbase)).replace('__FACX_JSON__', json.dumps(facextra)).replace('__GUIDEHD_JSON__', json.dumps(guidehd)).replace('__PRODHD_JSON__', json.dumps(prodhd)).replace('__CITYHD_JSON__', json.dumps(cityhd)).replace('__P2HD_JSON__', json.dumps(p2hd)).replace('__P2DIM_JSON__', json.dumps(p2dim)).replace('__CITYANCH_JSON__', json.dumps(cityanch)).replace('__HQ_JSON__', json.dumps(hq)).replace('__PORTRAITS_JSON__', json.dumps(pj)).replace('__ATLAS_DATA__', 'data:image/png;base64,' + b64).replace('__ATLAS_JSON__', json.dumps(pos, separators=(',', ':')))
open(os.environ.get('WSE_OUT') or os.path.join(ROOT, 'city.html'), 'w', encoding='utf-8').write(out)
print('city.html', round(len(out) / 1024), 'Ko')
