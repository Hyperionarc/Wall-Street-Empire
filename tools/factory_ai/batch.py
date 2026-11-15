#!/usr/bin/env python3
"""Production en masse des sprites HD de l'usine avec mflux (FLUX.2 klein 4B) sur Mac Apple Silicon.

    .venv/bin/python batch.py --lot test            # 3 sprites d'essai
    .venv/bin/python batch.py --lot lot1            # les 29 sprites à gabarit
    .venv/bin/python batch.py --lot lot2 --limite 20
    .venv/bin/python batch.py --seul presse --forcer
    .venv/bin/python batch.py --planches            # assemble les planches d'ouvriers
    python3 batch.py --lot lot1 --simuler           # sans mflux : vérifie cadrage, ancres, planches

Chaîne par sprite : entrée (gabarit sur fond uni) -> mflux -> détourage -> recadrage sur l'ancre
-> ombre -> assets/factory_hd/<nom>.png + ombres/<nom>.png + ancres.json.
Reprise : un sprite déjà « ok » dans etat.json est sauté (sauf --forcer).
"""
import argparse, json, os, shutil, subprocess, sys, time
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.normpath(os.path.join(ICI, '..', '..'))
GAB = os.path.join(RACINE, 'assets', 'factory')          # gabarits procéduraux (lot 1 d'origine)
GABV = os.path.join(ICI, 'gabarits')                      # gabarits exportés du dessin vectoriel du jeu (export_gabarits.js)
OUT = os.path.join(RACINE, 'assets', 'factory_hd')       # sortie
TRAV = os.path.join(ICI, 'travail')                      # fichiers intermédiaires (non versionnés)
STYLE = os.path.join(ICI, 'style')                       # références de style validées (versionnées)
CFG = json.load(open(os.path.join(ICI, 'config.json')))
MAN = json.load(open(os.path.join(ICI, 'manifest.json')))
ETAT_F = os.path.join(ICI, 'etat.json')
FOND = (205, 205, 205)


def gab_png(nom, sous=''):
    """Chemin d'un gabarit : assets/factory (lot 1) puis tools/factory_ai/gabarits (export vectoriel)."""
    for d in (GAB, GABV):
        p = os.path.join(d, sous, nom + '.png')
        if os.path.exists(p):
            return p
    return os.path.join(GAB, sous, nom + '.png')


def charge(p, defaut):
    return json.load(open(p)) if os.path.exists(p) else defaut


def ecrit(p, o):
    json.dump(o, open(p, 'w'), indent=1, ensure_ascii=False)


def mkdir_pour(p):
    os.makedirs(os.path.dirname(p), exist_ok=True)


def sauve_png(img, p):
    """PNG en palette (config png_couleurs) pour limiter le poids embarqué dans city.html."""
    mkdir_pour(p)
    n = CFG.get('png_couleurs', 0)
    if n and img.mode == 'RGBA':
        img = img.quantize(colors=n, method=Image.Quantize.FASTOCTREE)
    img.save(p, optimize=True)
    return os.path.getsize(p)


def bbox_alpha(im, seuil=12):
    a = np.asarray(im.getchannel('A'))
    ys, xs = np.where(a > seuil)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


# ---------------------------------------------------------------- entrée
def prepare_entree(sp):
    """Pose le gabarit, agrandi, au centre d'un carré à fond uni."""
    T = CFG['taille']
    g = Image.open(gab_png(sp['gabarit'])).convert('RGBA')
    g = g.crop(bbox_alpha(g))
    k = (T * 0.8) / max(g.size)
    g = g.resize((max(1, round(g.width * k)), max(1, round(g.height * k))), Image.LANCZOS)
    fond = Image.new('RGBA', (T, T), FOND + (255,))
    fond.alpha_composite(g, ((T - g.width) // 2, (T - g.height) // 2))
    p = os.path.join(TRAV, 'entree', sp['nom'] + '.png')
    mkdir_pour(p)
    fond.convert('RGB').save(p)
    return p


def refs_style(maxi=2):
    if not os.path.isdir(STYLE):
        return []
    return [os.path.join(STYLE, f) for f in sorted(os.listdir(STYLE)) if f.endswith('.png')][:maxi]


def prompt_pour(sp):
    style = CFG['style'].format(fond=CFG['fond'])
    tete = CFG['consigne_gabarit'] if sp['gabarit'] else (CFG['consigne_libre'] if refs_style() else '')
    return tete.format(sujet=sp['sujet']) + (sp['sujet'] + ', ' if not tete else '') + style


# ---------------------------------------------------------------- génération
def mflux(sp, seed, brut):
    exe = os.path.join(ICI, '.venv', 'bin')
    refs = ([prepare_entree(sp)] if sp['gabarit'] else []) + refs_style()
    base = ['--model', CFG['modele'], '--prompt', prompt_pour(sp), '--steps', str(CFG['steps']),
            '--seed', str(seed), '--output', brut]
    opt = ['--width', str(CFG['taille']), '--height', str(CFG['taille']), '-q', str(CFG['quantize'])]
    if refs:
        cmd = [os.path.join(exe, 'mflux-generate-flux2-edit')] + base + ['--image-paths'] + refs
    else:
        cmd = [os.path.join(exe, 'mflux-generate-flux2')] + base
    # Les options facultatives sont retirées une à une si cette version de mflux les refuse.
    for essai in (opt, opt[:4], []):
        r = subprocess.run(cmd + essai, capture_output=True, text=True)
        if r.returncode == 0 and os.path.exists(brut):
            return True, ''
        if 'unrecognized arguments' not in r.stderr and 'invalid choice' not in r.stderr:
            break
    return False, (r.stderr or r.stdout)[-1500:]


# ---------------------------------------------------------------- détourage
def detoure_cle(im, tol=26):
    """Repli sans rembg : supprime le fond uni relié aux bords."""
    rgb = np.asarray(im.convert('RGB')).astype(int)
    bord = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    ref = np.median(bord, axis=0)
    proche = (np.abs(rgb - ref).max(axis=2) < tol)
    m = Image.new('L', (rgb.shape[1], rgb.shape[0]))
    m.putdata((proche * 255).astype('uint8').ravel().tolist())
    w, h = m.size
    for x in range(0, w, 8):
        for y in (0, h - 1):
            if m.getpixel((x, y)) == 255:
                ImageDraw.floodfill(m, (x, y), 128)
    for y in range(0, h, 8):
        for x in (0, w - 1):
            if m.getpixel((x, y)) == 255:
                ImageDraw.floodfill(m, (x, y), 128)
    a = Image.fromarray(((np.asarray(m) != 128) * 255).astype('uint8'))
    a = a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    out = im.convert('RGBA')
    out.putalpha(a)
    return out


def detoure(im, simuler):
    if not simuler:
        try:
            from rembg import remove
            return remove(im).convert('RGBA')
        except Exception as e:                      # rembg absent ou en échec : repli
            print('   (rembg indisponible, repli sur la clé de fond :', str(e)[:80], ')')
    return detoure_cle(im)


def controle(decoupe, T):
    """Refuse un rendu vide, plein cadre ou coupé par le bord."""
    bb = bbox_alpha(decoupe)
    if bb is None:
        return 'vide'
    a = np.asarray(decoupe.getchannel('A')) > 12
    part = a.mean()
    if part < 0.02:
        return f'objet trop petit ({part:.1%})'
    if part > 0.85:
        return f'fond non retiré ({part:.1%})'
    if bb[0] <= 1 or bb[1] <= 1 or bb[2] >= T - 1 or bb[3] >= T - 1:
        return 'objet coupé par le bord'
    return None


# ---------------------------------------------------------------- cadrage, ancre, ombre
def ombre_auto(spr, ancre):
    """Ombre portée vers le bas-droite déduite de la silhouette (sprites sans gabarit)."""
    a = spr.getchannel('A')
    w, h = a.size
    k = 0.42
    hh = max(1, round(h * k))
    plat = a.resize((w, hh), Image.BILINEAR)
    marge = round(h * 0.45)
    toile = Image.new('L', (w + marge, h), 0)
    cis = plat.transform((w + marge, hh), Image.AFFINE, (1, 0.95, -marge * 0.98, 0, 1, 0), Image.BILINEAR)
    toile.paste(cis, (0, ancre[1] - hh + 4))
    toile = toile.crop((0, 0, w, h)).filter(ImageFilter.GaussianBlur(3))
    z = np.zeros((h, w), 'uint8')
    return Image.fromarray(np.dstack([z, z, z, (np.asarray(toile) * 0.42).astype('uint8')]), 'RGBA')


def cadre(sp, decoupe, ancres_gab):
    obj = decoupe.crop(bbox_alpha(decoupe))
    if sp['gabarit']:
        ref = Image.open(gab_png(sp['gabarit'])).convert('RGBA')
        bb = bbox_alpha(ref)
        k = (bb[2] - bb[0]) / obj.width
        obj = obj.resize((bb[2] - bb[0], max(1, round(obj.height * k))), Image.LANCZOS)
        haut = max(0, obj.height - (bb[3] - bb[1]))          # si le rendu est plus haut, on agrandit vers le haut
        spr = Image.new('RGBA', (ref.width, ref.height + haut), (0, 0, 0, 0))
        spr.alpha_composite(obj, (bb[0], bb[3] + haut - obj.height))
        info = dict(ancres_gab.get(sp['gabarit'] + '.png', {}))
        info.update(largeur=spr.width, hauteur=spr.height, ancre_y=info.get('ancre_y', bb[3]) + haut)
        omb = Image.new('RGBA', spr.size, (0, 0, 0, 0))
        po = gab_png(sp['gabarit'], 'ombres')
        if os.path.exists(po):
            omb.alpha_composite(Image.open(po).convert('RGBA'), (0, haut))
        else:                                                   # gabarit vectoriel : pas d'ombre dessinée, on la déduit de la silhouette
            omb = ombre_auto(spr, (int(info.get('ancre_x', spr.width // 2)), int(info['ancre_y'])))
        return spr, omb, info
    L = sp['largeur']
    if sp.get('ajuster') == 'hauteur':
        k = sp['contenu_px'] / obj.height
    else:
        k = sp['contenu_px'] / obj.width
    obj = obj.resize((max(1, round(obj.width * k)), max(1, round(obj.height * k))), Image.LANCZOS)
    H = sp.get('hauteur') or obj.height + 3 + max(14, round(obj.height * 0.2))
    bas = (H - 24) if sp.get('hauteur') else obj.height + 3
    spr = Image.new('RGBA', (L, H), (0, 0, 0, 0))
    spr.alpha_composite(obj, ((L - obj.width) // 2, max(0, bas - obj.height)))
    ancre = (L // 2, bas)
    info = {'largeur': L, 'hauteur': H, 'ancre_x': ancre[0], 'ancre_y': ancre[1], 'echelle_px_par_m': sp['echelle_px_par_m']}
    return spr, ombre_auto(spr, ancre), info


# ---------------------------------------------------------------- planches et aperçus
def planches(ancres):
    for nom, poses in MAN.get('planches', {}).items():
        fichiers = [os.path.join(OUT, p + '.png') for p in poses]
        if not all(os.path.exists(f) for f in fichiers):
            continue
        for sous in ('', 'ombres'):
            S = Image.new('RGBA', (128 * len(poses), 200), (0, 0, 0, 0))
            for i, p in enumerate(poses):
                S.paste(Image.open(os.path.join(OUT, sous, p + '.png')).convert('RGBA'), (128 * i, 0))
            sauve_png(S, os.path.join(OUT, sous, nom + '.png'))
        a = ancres[poses[0] + '.png']
        ancres[nom + '.png'] = {'largeur': 128 * len(poses), 'hauteur': 200, 'ancre_x': a['ancre_x'], 'ancre_y': a['ancre_y'],
                                'planche': f'{len(poses)} vignettes de 128x200 : marche, porte_carton, machine, debout', 'ancre': 'par vignette'}
        print('planche', nom)


def apercu(noms, chemin, cols=5):
    """Planche de contrôle : à gauche le gabarit (s'il existe), à droite le rendu, sur fond vert."""
    cw, ch = 560, 330
    rows = (len(noms) + cols - 1) // cols
    im = Image.new('RGBA', (cols * cw, rows * ch), (120, 150, 110, 255))
    d = ImageDraw.Draw(im)
    par_nom = {s['nom']: s for s in MAN['sprites']}

    def pose(p, x, y, po=None):
        s = Image.open(p).convert('RGBA')
        k = min(1.0, 270 / s.width, 290 / s.height)
        t = (max(1, round(s.width * k)), max(1, round(s.height * k)))
        if po and os.path.exists(po):
            im.alpha_composite(Image.open(po).convert('RGBA').resize(t, Image.LANCZOS), (x + (275 - t[0]) // 2, y + ch - 18 - t[1]))
        im.alpha_composite(s.resize(t, Image.LANCZOS), (x + (275 - t[0]) // 2, y + ch - 18 - t[1]))

    for i, nom in enumerate(noms):
        x, y = (i % cols) * cw, (i // cols) * ch
        gab = par_nom[nom]['gabarit']
        if gab:
            pose(gab_png(gab), x, y)
        pose(os.path.join(OUT, nom + '.png'), x + 280, y, os.path.join(OUT, 'ombres', nom + '.png'))
        d.text((x + 6, y + 4), nom, fill=(255, 255, 255))
        d.line([(x, y), (x, y + ch)], fill=(90, 115, 85))
    mkdir_pour(chemin)
    im.convert('RGB').save(chemin)
    print('aperçu ->', os.path.relpath(chemin, RACINE))


# ---------------------------------------------------------------- boucle
def ollama_residents():
    if not shutil.which('ollama'):
        return []
    r = subprocess.run(['ollama', 'ps'], capture_output=True, text=True)
    return [l.split()[0] for l in r.stdout.strip().splitlines()[1:] if l.strip()]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--lot', default=None, help='test, lot1, lot2, phase1 (lot1 + lot2), optionnel ou tout')
    ap.add_argument('--seul', action='append', help='nom exact d\'un sprite (répétable)')
    ap.add_argument('--limite', type=int, default=0)
    ap.add_argument('--forcer', action='store_true')
    ap.add_argument('--simuler', action='store_true', help='sans mflux : le gabarit sert de rendu')
    ap.add_argument('--planches', action='store_true')
    ap.add_argument('--arreter-ollama', action='store_true', help='décharge les modèles Ollama résidents avant le lot')
    a = ap.parse_args()

    etat = charge(ETAT_F, {})
    ancres = charge(os.path.join(OUT, 'ancres.json'), {})
    ancres_gab = dict(charge(os.path.join(GABV, 'ancres.json'), {}), **charge(os.path.join(GAB, 'ancres.json'), {}))
    os.makedirs(OUT, exist_ok=True)

    if a.seul:
        cibles = [s for s in MAN['sprites'] if s['nom'] in a.seul]
    elif a.lot == 'test':
        cibles = [s for s in MAN['sprites'] if s['nom'] in MAN['test']]
    elif a.lot == 'phase1':          # tout l'usine, dans l'ordre du manifeste, sans les sprites optionnels
        cibles = [s for s in MAN['sprites'] if s['lot'] in ('lot1', 'lot2')]
    elif a.lot:
        cibles = [s for s in MAN['sprites'] if a.lot == 'tout' or s['lot'] == a.lot]
    else:
        cibles = []
    if a.simuler:
        cibles = [s for s in cibles if s['gabarit']]
    if not a.forcer:
        cibles = [s for s in cibles if etat.get(s['nom'], {}).get('statut') != 'ok']
    if a.limite:
        cibles = cibles[:a.limite]

    if cibles and not a.simuler:
        res = ollama_residents()
        if res and a.arreter_ollama:
            for m in res:
                subprocess.run(['ollama', 'stop', m])
            print('Ollama : modèles déchargés :', ', '.join(res))
        elif res:
            print('ATTENTION : modèle(s) Ollama en mémoire :', ', '.join(res), '- relancer avec --arreter-ollama si la génération rame.')

    faits, t_lot = [], time.time()
    for i, sp in enumerate(cibles):
        nom, t0, raison = sp['nom'], time.time(), ''
        for essai in range(CFG['essais_max']):
            seed = CFG['seed'] + essai * 101
            brut = os.path.join(TRAV, 'brut', f'{nom}__{seed}.png')
            mkdir_pour(brut)
            if a.simuler:
                shutil.copy(prepare_entree(sp), brut)
                ok, raison = True, ''
            else:
                ok, raison = mflux(sp, seed, brut)
            if not ok:
                if 'Repository Not Found' in raison or '401' in raison or 'gated' in raison.lower():
                    CFG['modele'] = CFG['modele_secours']        # poids d'origine inaccessibles : dépôt de secours
                continue
            im = Image.open(brut)
            dec = detoure(im, a.simuler)
            raison = controle(dec, im.width)
            if raison is None:
                spr, omb, info = cadre(sp, dec, ancres_gab)
                assert omb.size == spr.size
                poids = sauve_png(spr, os.path.join(OUT, nom + '.png'))
                sauve_png(omb, os.path.join(OUT, 'ombres', nom + '.png'))
                if poids > 150_000:
                    print(f'   ! {nom}.png pèse {poids // 1000} Ko (> 150 Ko) : à signaler dans JOURNAL.md')
                ancres[nom + '.png'] = info
                etat[nom] = {'statut': 'ok', 'seed': seed, 'essais': essai + 1, 'secondes': round(time.time() - t0, 1), 'simule': a.simuler}
                faits.append(nom)
                break
        else:
            etat[nom] = {'statut': 'echec', 'raison': str(raison)[-400:], 'essais': CFG['essais_max']}
        print(f'[{i + 1}/{len(cibles)}] {nom} : {etat[nom]["statut"]}', etat[nom].get('secondes', etat[nom].get('raison', '')))
        ecrit(ETAT_F, etat)
        ecrit(os.path.join(OUT, 'ancres.json'), ancres)

    if a.planches or faits:
        planches(ancres)
        ecrit(os.path.join(OUT, 'ancres.json'), ancres)
    n = CFG['taille_lot_apercu']
    for j in range(0, len(faits), n):
        horo = time.strftime('%Y%m%d_%H%M%S')
        apercu(faits[j:j + n], os.path.join(OUT, '_apercus', f'{a.lot or "seul"}_{horo}_{j // n + 1:02d}.png'))
    if faits and not a.simuler:   # journal automatique : une ligne par exécution
        sec = [etat[n]['secondes'] for n in faits if 'secondes' in etat[n]]
        with open(os.path.join(ICI, 'JOURNAL.md'), 'a', encoding='utf-8') as jf:
            jf.write(f"- {time.strftime('%Y-%m-%d %H:%M')} · lot {a.lot or 'seul'} · {len(faits)} produits · échecs : {', '.join(n for n, v in etat.items() if v['statut'] == 'echec') or 'aucun'} · {sum(sec) / max(1, len(sec)):.0f} s par image · poids max {max((os.path.getsize(os.path.join(OUT, n + '.png')) for n in faits), default=0) // 1000} Ko\n")
    ok = sum(1 for v in etat.values() if v['statut'] == 'ok')
    ko = [k for k, v in etat.items() if v['statut'] == 'echec']
    print(f'Terminé : {len(faits)} produits en {time.time() - t_lot:.0f} s. Total ok : {ok}/{len(MAN["sprites"])}. Échecs : {ko or "aucun"}')
    return 1 if (cibles and not faits) else 0


if __name__ == '__main__':
    sys.exit(main())
