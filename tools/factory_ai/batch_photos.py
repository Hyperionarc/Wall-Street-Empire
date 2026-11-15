#!/usr/bin/env python3
"""Photos des cartes du Guide du fabricant : JPEG carré 512x512 dans assets/guide_hd/<clé>.jpg (le jeu les embarque, build.py).
FLUX.2 klein 4B via mflux, sur le Mac. Liste des clés et sujets : photos_guide.json (le lot « essai » = 10 produits les plus vus).

  .venv/bin/python batch_photos.py --lot essai            # les 10 photos d'essai
  .venv/bin/python batch_photos.py --seul bread --seul car --forcer
Les clés absentes de `sujets` sont refusées (compléter photos_guide.json et pousser avant de les demander)."""
import argparse, json, os, sys, time
from PIL import Image

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
from batch_scenes import mflux, planche, journal, CFG   # génération, planche de contact, journal

RACINE = os.path.normpath(os.path.join(ICI, '..', '..'))
OUT = os.path.join(RACINE, 'assets', 'guide_hd')
TRAV = os.path.join(ICI, 'travail', 'photos')
P = json.load(open(os.path.join(ICI, 'photos_guide.json')))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--lot', choices=['essai'])
    ap.add_argument('--seul', action='append')
    ap.add_argument('--forcer', action='store_true')
    a = ap.parse_args()
    cles = P['essai'] if a.lot == 'essai' else (a.seul or [])
    inconnues = [k for k in cles if k not in P['sujets']]
    if inconnues:
        print('clés sans sujet dans photos_guide.json :', inconnues); return 1
    t0, faits, echecs = time.time(), [], []
    os.makedirs(OUT, exist_ok=True)
    for i, k in enumerate(cles):
        dst = os.path.join(OUT, k + '.jpg')
        if os.path.exists(dst) and not a.forcer:
            print(f'[{i + 1}/{len(cles)}] {k} : déjà fait'); faits.append(dst); continue
        t = time.time(); prompt = P['consigne'].format(sujet=P['sujets'][k]); brut = os.path.join(TRAV, k + '.png')
        ok, err = mflux(prompt, CFG['seed'], P['taille_generation'], P['taille_generation'], brut)
        if not ok:
            print(f'[{i + 1}/{len(cles)}] {k} : échec', err[-200:]); echecs.append(k); continue
        Image.open(brut).convert('RGB').resize((P['taille_finale'], P['taille_finale']), Image.LANCZOS).save(dst, quality=92, optimize=True)
        faits.append(dst); print(f'[{i + 1}/{len(cles)}] {k} : ok {time.time() - t:.1f}')
    if faits:
        planche(faits, os.path.join(OUT, '_apercus', f'photos_{time.strftime("%Y%m%d_%H%M%S")}.jpg'), cols=5, largeur=300)
    journal(f'photos du guide : {len(faits)} ok, échecs : {echecs or "aucun"}, {(time.time() - t0) / 60:.0f} min')
    return 0 if faits else 1


if __name__ == '__main__':
    sys.exit(main())
