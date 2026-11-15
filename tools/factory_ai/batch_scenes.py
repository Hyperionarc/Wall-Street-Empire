#!/usr/bin/env python3
"""Scènes haute définition (fonds d'écran du jeu : centre de R&D, labo...) avec FLUX.2 klein 4B via mflux. À lancer sur le Mac Apple Silicon.

Deux phases, pour mettre le temps où il compte (le modèle est distillé : plus de pas n'améliore guère ; ce qui paie, ce sont les graines et la résolution) :
  1. brouillons : N graines par scène en 1024x576 (rapide) -> planche de contact dans assets/scenes_hd/_apercus/
  2. finale     : pour la graine retenue, régénération puis raffinage à la plus grande taille que la mémoire accepte
                  (2048x1152, sinon 1792x1008, sinon 1536x864), plusieurs essais, JPEG qualité 93 dans assets/scenes_hd/

Usage :
  .venv/bin/python batch_scenes.py --phase brouillons [--scene rd_garage_voiture] [--budget-min 60]
  .venv/bin/python batch_scenes.py --phase finale --retenir rd_garage_voiture:1234 [--retenir autre:77] [--budget-min 60]
--budget-min : arrête proprement après ce nombre de minutes (les graines des brouillons s'enchaînent tant qu'il reste du temps).
"""
import argparse, json, os, shutil, subprocess, sys, time
from PIL import Image, ImageDraw

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.normpath(os.path.join(ICI, '..', '..'))
OUT = os.path.join(RACINE, 'assets', 'scenes_hd')
TRAV = os.path.join(ICI, 'travail', 'scenes')
CFG = json.load(open(os.path.join(ICI, 'config.json')))
SC = json.load(open(os.path.join(ICI, 'scenes.json')))
EXE = os.path.join(ICI, '.venv', 'bin')


def prompt(s):
    return f"{s['sujet']}, {SC['style']}"


def mflux(prompt_txt, seed, w, h, sortie, refs=None):
    base = ['--model', CFG['modele'], '--prompt', prompt_txt, '--steps', str(CFG['steps']), '--seed', str(seed), '--output', sortie]
    opt = ['--width', str(w), '--height', str(h), '-q', str(CFG['quantize'])]
    cmd = ([os.path.join(EXE, 'mflux-generate-flux2-edit')] + base + ['--image-paths'] + refs) if refs else ([os.path.join(EXE, 'mflux-generate-flux2')] + base)
    os.makedirs(os.path.dirname(sortie), exist_ok=True)
    for essai in (opt, opt[:4], []):                     # options refusées par cette version de mflux : retirées une à une
        r = subprocess.run(cmd + essai, capture_output=True, text=True)
        if r.returncode == 0 and os.path.exists(sortie):
            return True, ''
        if 'unrecognized arguments' not in r.stderr and 'invalid choice' not in r.stderr:
            break
    return False, (r.stderr or r.stdout)[-800:]


def planche(fichiers, chemin, cols=4, largeur=480):
    h = round(largeur * 9 / 16)
    rows = (len(fichiers) + cols - 1) // cols
    im = Image.new('RGB', (cols * largeur, rows * (h + 18)), (20, 22, 34))
    d = ImageDraw.Draw(im)
    for i, f in enumerate(fichiers):
        x, y = (i % cols) * largeur, (i // cols) * (h + 18)
        im.paste(Image.open(f).convert('RGB').resize((largeur, h), Image.LANCZOS), (x, y + 18))
        d.text((x + 4, y + 3), os.path.basename(f)[:-4], fill=(255, 255, 255))
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    im.save(chemin, quality=88)
    print('planche ->', os.path.relpath(chemin, RACINE))


def journal(ligne):
    with open(os.path.join(ICI, 'JOURNAL.md'), 'a', encoding='utf-8') as f:
        f.write(f"- {time.strftime('%Y-%m-%d %H:%M')} · scènes · {ligne}\n")


def brouillons(a, t0):
    B = SC['brouillon']
    scenes = [s for s in SC['scenes'] if not a.scene or s['nom'] in a.scene]
    faits = []
    for k in range(B['seeds']):                         # on tourne par graine : toutes les scènes ont des brouillons même si le budget s'épuise
        for s in scenes:
            if a.budget_min and (time.time() - t0) / 60 > a.budget_min:
                print('budget atteint'); break
            seed = CFG['seed'] + 7 * k
            f = os.path.join(TRAV, 'brouillons', f"{s['nom']}__{seed}.png")
            if os.path.exists(f) and not a.forcer:
                faits.append(f); continue
            t = time.time(); ok, err = mflux(prompt(s), seed, B['largeur'], B['hauteur'], f)
            print(f"[{s['nom']} seed {seed}]", 'ok' if ok else 'échec ' + err[-200:], f'{time.time() - t:.0f} s')
            if ok:
                faits.append(f)
    if faits:
        for s in scenes:
            fs = sorted(f for f in faits if os.path.basename(f).startswith(s['nom'] + '__'))
            if fs:
                planche(fs, os.path.join(OUT, '_apercus', f"brouillons_{s['nom']}.jpg"))
    journal(f"brouillons : {len(faits)} images en {(time.time() - t0) / 60:.0f} min")


def finale(a, t0):
    F = SC['finale']
    for r in a.retenir:
        nom, seed = r.split(':'); seed = int(seed)
        s = next(x for x in SC['scenes'] if x['nom'] == nom)
        brouillon = os.path.join(TRAV, 'brouillons', f'{nom}__{seed}.png')
        if not os.path.exists(brouillon):
            print('brouillon introuvable :', brouillon); continue
        meilleur = None
        for essai in range(F['essais_par_scene']):
            if a.budget_min and (time.time() - t0) / 60 > a.budget_min:
                print('budget atteint'); break
            for L in F['largeurs']:                       # plus grande taille acceptée par la mémoire
                H = round(L * 9 / 16 / 16) * 16
                f = os.path.join(TRAV, 'finales', f'{nom}__{seed}__{L}__{essai}.png')
                t = time.time(); ok, err = mflux(SC['refine'] + prompt(s), seed + 101 * essai, L, H, f, refs=[brouillon])
                print(f'[{nom} essai {essai} {L}x{H}]', 'ok' if ok else 'échec ' + err[-200:], f'{time.time() - t:.0f} s')
                if ok:
                    meilleur = f; break
        if meilleur:
            dst = os.path.join(OUT, nom + '.jpg'); os.makedirs(OUT, exist_ok=True)
            Image.open(meilleur).convert('RGB').save(dst, quality=93, optimize=True)
            print('final ->', os.path.relpath(dst, RACINE), Image.open(dst).size, os.path.getsize(dst) // 1000, 'Ko')
            finales = sorted(os.path.join(TRAV, 'finales', x) for x in os.listdir(os.path.join(TRAV, 'finales')) if x.startswith(nom + '__'))
            planche(finales, os.path.join(OUT, '_apercus', f'finales_{nom}.jpg'), cols=3, largeur=640)
    journal(f"finale : {', '.join(a.retenir)} en {(time.time() - t0) / 60:.0f} min")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--phase', choices=['brouillons', 'finale'], required=True)
    ap.add_argument('--scene', action='append')
    ap.add_argument('--retenir', action='append', default=[], help='nom:graine (phase finale)')
    ap.add_argument('--budget-min', type=float, default=0)
    ap.add_argument('--forcer', action='store_true')
    a = ap.parse_args()
    t0 = time.time()
    (brouillons if a.phase == 'brouillons' else finale)(a, t0)


if __name__ == '__main__':
    sys.exit(main())
