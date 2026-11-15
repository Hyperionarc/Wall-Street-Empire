"""Voiture de dessin original (coupé miniature) en 3D, rendue en tournant autour : 36 images à fond transparent.
Lancer : Blender --background --python voiture_originale.py -- --angles 36 [--taille 640]
Aucune marque, aucun emblème."""
import bpy, math, os, sys
from mathutils import Vector

a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def opt(nom, defaut):
    return type(defaut)(a[a.index(nom) + 1]) if nom in a else defaut
N = opt('--angles', 36)
T = opt('--taille', 640)
ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(os.path.dirname(ICI), 'travail', 'blender', 'voiture_originale')
os.makedirs(SORTIE, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def matiere(nom, couleur, metal=0.0, rugo=0.4, coat=0.0, emission=None):
    m = bpy.data.materials.new(nom); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = couleur
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rugo
    for cle in ('Coat Weight', 'Clearcoat'):
        if cle in b.inputs: b.inputs[cle].default_value = coat; break
    if emission:
        for cle in ('Emission Color', 'Emission'):
            if cle in b.inputs: b.inputs[cle].default_value = emission; break
        if 'Emission Strength' in b.inputs: b.inputs['Emission Strength'].default_value = 4.0
    return m

bleu = matiere('carrosserie', (0.02, 0.18, 0.75, 1), 0.55, 0.22, 1.0)
noir = matiere('noir', (0.01, 0.01, 0.012, 1), 0.0, 0.5)
jante = matiere('jante', (0.7, 0.72, 0.75, 1), 1.0, 0.25)
verre = matiere('vitre', (0.02, 0.04, 0.06, 1), 0.0, 0.05)
feu = matiere('feu', (1, 1, 1, 1), 0, 0.2, emission=(1, 1, 0.9, 1))

def forme(nom, ou, echelle, mat, arrondi=0.25, niveaux=3):
    bpy.ops.mesh.primitive_cube_add(location=ou)
    o = bpy.context.object; o.name = nom; o.scale = echelle
    bpy.ops.object.transform_apply(scale=True)
    bv = o.modifiers.new('bv', 'BEVEL'); bv.width = arrondi; bv.segments = 6; bv.limit_method = 'NONE'
    sd = o.modifiers.new('sd', 'SUBSURF'); sd.levels = niveaux; sd.render_levels = niveaux
    bpy.ops.object.shade_smooth()
    o.data.materials.append(mat); return o

# Caisse basse et large, habitacle fuyant, aile avant plongeante
forme('caisse', (0, 0, 0.62), (2.25, 0.95, 0.30), bleu, 0.22)
forme('capot', (1.35, 0, 0.78), (1.05, 0.88, 0.16), bleu, 0.15)
forme('habitacle', (-0.30, 0, 1.08), (1.05, 0.78, 0.27), verre, 0.20)
forme('toit', (-0.30, 0, 1.30), (0.80, 0.72, 0.06), bleu, 0.05)
forme('aileron', (-2.10, 0, 1.05), (0.12, 0.85, 0.05), noir, 0.02, 1)
forme('bas_de_caisse', (0, 0, 0.36), (2.15, 1.00, 0.06), noir, 0.04, 1)
forme('calandre', (2.30, 0, 0.55), (0.04, 0.55, 0.10), noir, 0.02, 1)
for s in (-1, 1):
    forme(f'phare_{s}', (2.28, s * 0.62, 0.74), (0.05, 0.22, 0.04), feu, 0.02, 1)
    forme(f'feu_arriere_{s}', (-2.28, s * 0.65, 0.72), (0.04, 0.25, 0.04), feu, 0.01, 1)
for x in (-1.45, 1.45):
    for s in (-1, 1):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.36, location=(x, s * 0.98, 0.42), rotation=(math.pi / 2, 0, 0))
        r = bpy.context.object; r.name = 'roue'; bpy.ops.object.shade_smooth(); r.data.materials.append(noir)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.27, depth=0.38, location=(x, s * 0.98, 0.42), rotation=(math.pi / 2, 0, 0))
        j = bpy.context.object; j.name = 'jante'; bpy.ops.object.shade_smooth(); j.data.materials.append(jante)

# Sol qui ne reçoit que l'ombre (fond transparent)
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
sol = bpy.context.object; sol.is_shadow_catcher = True

# Lumières : un grand panneau doux en haut à gauche + un ciel clair
bpy.ops.object.light_add(type='AREA', location=(-5, 5, 8)); L = bpy.context.object
L.data.energy = 900; L.data.size = 8
L.rotation_euler = (math.radians(35), math.radians(-30), math.radians(-40))
sc.world = bpy.data.worlds.new('ciel'); sc.world.use_nodes = True
fond = sc.world.node_tree.nodes['Background']; fond.inputs[0].default_value = (0.85, 0.88, 0.95, 1); fond.inputs[1].default_value = 0.8

# Caméra qui tourne autour
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 50
cible = bpy.data.objects.new('cible', None); sc.collection.objects.link(cible); cible.location = (0, 0, 0.6)
tc = cam.constraints.new('TRACK_TO'); tc.target = cible; tc.track_axis = 'TRACK_NEGATIVE_Z'; tc.up_axis = 'UP_Y'

sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 48
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.render.resolution_x = T; sc.render.resolution_y = int(T * 0.75)
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'

for i in range(N):
    ang = 2 * math.pi * i / N
    cam.location = Vector((9.5 * math.cos(ang), 9.5 * math.sin(ang), 3.4))
    sc.render.filepath = os.path.join(SORTIE, f'angle_{i:02d}.png')
    bpy.ops.render.render(write_still=True)
    print(f'angle {i + 1}/{N} ok', flush=True)
