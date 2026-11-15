"""Planche de contact des rendus d'une scène Blender : travail/blender/<scene>_planche.jpg"""
import glob, os, sys
from PIL import Image
scene = sys.argv[1]
ici = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dossier = os.path.join(ici, 'travail', 'blender', scene)
fichiers = sorted(glob.glob(os.path.join(dossier, '*.png')))
if not fichiers: sys.exit('aucun rendu')
w = 320; cols = 6
ims = []
for f in fichiers:
    im = Image.open(f).convert('RGBA'); h = int(im.height * w / im.width); im = im.resize((w, h))
    fond = Image.new('RGBA', im.size, (200, 205, 212, 255)); fond.alpha_composite(im); ims.append(fond.convert('RGB'))
h = ims[0].height; lignes = (len(ims) + cols - 1) // cols
pl = Image.new('RGB', (cols * w, lignes * h), (30, 30, 36))
for k, im in enumerate(ims): pl.paste(im, ((k % cols) * w, (k // cols) * h))
sortie = os.path.join(ici, 'travail', 'blender', scene + '_planche.jpg'); pl.save(sortie, quality=90); print('planche ->', sortie)
