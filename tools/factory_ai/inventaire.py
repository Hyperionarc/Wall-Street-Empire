#!/usr/bin/env python3
"""Inventaire des sprites livrés et de leur branchement dans le jeu : génère wall-street-empire/docs/INTEGRATION_ASSETS.md.
Un nom est « référencé » s'il apparaît dans game.template.html ou tools/build.py. Usage : python3 tools/factory_ai/inventaire.py"""
import os, re, datetime
R = os.path.join(os.path.dirname(__file__), '..', '..')
s = open(os.path.join(R, 'wall-street-empire/game.template.html')).read() + open(os.path.join(R, 'wall-street-empire/tools/build.py')).read()
ref = lambda n: re.search(r'\b' + re.escape(n) + r'\b', s) is not None
out = [f'# Inventaire d\'intégration des sprites ({datetime.date.today()})\n', 'Généré par `tools/factory_ai/inventaire.py`. « Non branché » = le nom n\'apparaît nulle part dans le jeu.\n']
fam = {'routes': r'^route_', 'sol et eau': r'^(herbe|terre|eau|rivage|sol_)', 'véhicules': r'^(veh_|voiture|camion|navire)', 'animaux et ferme': r'^(animal_|auge|balles|meule|fermier|vendangeur|vigneron|hangar_ferme|champ_|bat_ferme|bat_chai|ferme_|fcorn|frapeseed)', 'bâtiments de service': r'^(boulangerie|boutique|cafe|restaurant|ecole|hopital|gare|eglise|mairie|station_|drugstore|bat_drugstore|bat_supermarche|bat_hypermarche|supermarche_n|hypermarche_n|bat_mega)', 'bâtiments PNJ': r'^(maison_|immeuble_|tour_|siege_hq)', 'port et industrie': r'^(grue|conteneur|raffinerie|reservoir|torchere|cuve|bac_|barres|lingots|sacs|briques|chassis|futs|porcelaine|aimants|machine|poste|unite|table|mannequin|portant|peaux|robot|mur_|coin_mur|convoyeur|transpalette|extincteur|armoire|panneau|scierie)', 'personnages': r'^(ouvrier|chariot)', 'décor': r'^(rochers|parc|batiment_abandonne|chantier|gisement_or)'}
for d in ['assets/factory_hd', 'assets/phase2_hd']:
    names = sorted(f[:-4] for f in os.listdir(os.path.join(R, d)) if f.endswith('.png') and not f.startswith('_'))
    nb = [n for n in names if not ref(n)]
    out.append(f'\n## {d} : {len(names)} sprites, {len(names) - len(nb)} branchés, {len(nb)} non branchés\n')
    done = set()
    for k, rx in fam.items():
        g = [n for n in nb if re.search(rx, n) and n not in done]; done.update(g)
        if g: out.append(f'- **{k}** ({len(g)}) : ' + ', '.join(g))
    rest = [n for n in nb if n not in done]
    if rest: out.append(f'- **autres** ({len(rest)}) : ' + ', '.join(rest))
open(os.path.join(R, 'wall-street-empire/docs/INTEGRATION_ASSETS.md'), 'w').write('\n'.join(out) + '\n'); print('ok')
