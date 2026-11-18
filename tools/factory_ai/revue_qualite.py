#!/usr/bin/env python3
"""Revue qualité des sprites : saturation, teinte, netteté, liseré de détourage, angle ; planches de contact par famille.
Usage : python3 tools/factory_ai/revue_qualite.py <dossier-de-sortie>   -> planches PNG + resume.json"""
import os, sys, re, json, colorsys, warnings
import numpy as np
from PIL import Image, ImageDraw, ImageFont
warnings.filterwarnings('ignore')
sys.path.insert(0, os.path.dirname(__file__)); import asset_qa as q
R = os.path.join(os.path.dirname(__file__), '..', '..'); OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/revue'; os.makedirs(OUT, exist_ok=True)
FAM = {'fermes': r'^(fwheat|fsugar|fcotton|frubber|fvine|fcattle|fchicken|fpig|fsheep|fcorn|frapeseed|ferme_|hangar_ferme|champ_|bat_ferme|bat_chai)', 'routes': r'^route_', 'sol et eau': r'^(herbe|terre|eau|rivage|sol_)', 'maisons': r'^(maison|pavillon|chalet|villa|brownstone)', 'immeubles et tours': r'^(immeuble|tour|gratte|barre|hotel|banque|siege)', 'services': r'^(boulangerie|boutique|cafe|restaurant|ecole|hopital|gare|eglise|mairie|station_|drugstore)', 'commerces': r'^(supermarche|hypermarche|bat_super|bat_hyper|bat_mega|mega_|petit_marche|centre_)', 'extraction': r'^(gisement|mine|puits|carriere|camp)', 'industrie': r'^(usine|centrale|fonderie|entrepot|data|terminal|eolienne|pylone|centre_rd|scierie|bat_scierie|raffinerie|reservoir|torchere|four|reacteur|presse|machine|robot)', 'vehicules': r'^(veh_|voiture|camion|navire|chariot)', 'nature': r'^(foret|arbre|buisson|rochers|parc)', 'matieres': r'^(bac_|lingots|barres|sacs|briques|chassis|futs|porcelaine|bobine|planches|plaques|peaux|rouleaux|conteneur)'}
def metrics(path):
    im = Image.open(path).convert('RGBA'); a = np.array(im); al = a[..., 3] > 40
    if al.sum() < 100: return None
    rgb = a[..., :3][al].astype(float) / 255; mx = rgb.max(1); mn = rgb.min(1); sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0); val = mx
    hsv = np.array([colorsys.rgb_to_hsv(*p) for p in rgb[::max(1, len(rgb) // 4000)]]); hue = hsv[:, 0]; w = hsv[:, 1] * hsv[:, 2]
    hist = np.histogram(hue, bins=12, range=(0, 1), weights=w)[0]; hist = hist / max(1e-6, hist.sum())
    g = np.array(im.convert('L'), float); lap = g[1:-1, 1:-1] * 4 - g[:-2, 1:-1] - g[2:, 1:-1] - g[1:-1, :-2] - g[1:-1, 2:]; sharp = float(lap[al[1:-1, 1:-1]].var())
    A = a[..., 3]; edge = (A > 5) & (A < 250); fr = a[..., :3][edge].astype(float) / 255 if edge.sum() else np.zeros((0, 3)); halo = float(((fr.min(1) > 0.85) | (fr.max(1) < 0.1)).mean()) if len(fr) else 0.0
    r = q.analyse(path) or {}
    return dict(sat=round(float(sat.mean()), 3), sat90=round(float(np.percentile(sat, 90)), 3), vif=round(float((sat > 0.75).mean()), 3), val=round(float(val.mean()), 3), nette=round(sharp, 1), halo=round(halo, 3), pente=r.get('pente'), hues=[round(float(x), 2) for x in hist], teinte=int(np.argmax(hist)))
res = {}
for d in ['assets/factory_hd', 'assets/phase2_hd']:
    for f in sorted(os.listdir(os.path.join(R, d))):
        if f.endswith('.png') and not f.startswith('_'):
            try: m = metrics(os.path.join(R, d, f))
            except Exception as e: m = None
            if m: res[f[:-4]] = dict(m, dossier=d.split('/')[-1])
json.dump(res, open(os.path.join(OUT, 'resume.json'), 'w'), ensure_ascii=False, indent=1)
try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
except Exception: FONT = ImageFont.load_default()
def sheet(name, items, cols=6, cell=190):
    rows = (len(items) + cols - 1) // cols; W = Image.new('RGB', (cols * cell, rows * (cell + 34)), (84, 88, 96)); d = ImageDraw.Draw(W)
    for i, n in enumerate(items):
        m = res[n]; p = os.path.join(R, 'assets', m['dossier'], n + '.png'); im = Image.open(p).convert('RGBA'); im.thumbnail((cell - 8, cell - 8)); x, y = (i % cols) * cell, (i // cols) * (cell + 34)
        W.paste(im, (x + (cell - im.width) // 2, y + 4 + (cell - 8 - im.height) // 2), im)
        flag = '!' if (m['sat90'] > 0.85 or (m['pente'] and not 0.46 <= m['pente'] <= 0.56 and m['sat'] > 0)) else ' '
        d.text((x + 4, y + cell - 4), n[:30], fill=(255, 255, 255), font=FONT); d.text((x + 4, y + cell + 10), f"sat {m['sat']:.2f}/{m['sat90']:.2f} pente {m['pente']} {flag}", fill=(255, 220, 120), font=FONT)
    W.save(os.path.join(OUT, name + '.png'))
famsel = {}
for n in res:
    for k, rx in FAM.items():
        if re.search(rx, n): famsel.setdefault(k, []).append(n); break
    else: famsel.setdefault('autres', []).append(n)
for k, items in famsel.items():
    for j in range(0, len(items), 30): sheet(f"{k.replace(' ', '_')}_{j // 30 + 1}", items[j:j + 30])
print({k: len(v) for k, v in famsel.items()})
