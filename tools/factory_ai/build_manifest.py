#!/usr/bin/env python3
"""Construit manifest.json : la liste des sprites à produire (nom, sujet, gabarit, taille, lot).

- lot1 : les 29 sprites du premier lot, re-rendus à partir de leur gabarit procédural
         (assets/factory/<nom>.png) : forme, angle, échelle et ancre sont conservés.
- lot2 : les nouveaux sprites, sans gabarit : rendu libre guidé par les références de style
         (tools/factory_ai/style/*.png, alimenté par les sprites validés du lot1).
Pour ajouter un sprite : ajouter une ligne ci-dessous, relancer ce script, committer.
"""
import json, os

ICI = os.path.dirname(os.path.abspath(__file__))
M = []


def g(nom, sujet, lot='lot1'):
    """Sprite avec gabarit : mêmes nom, cadrage, ancre et ombre que assets/factory/<nom>.png."""
    M.append({'nom': nom, 'lot': lot, 'gabarit': nom, 'sujet': sujet})


def n(nom, sujet, largeur=256, contenu=None, ajuster='largeur', echelle=64.0, hauteur=None, lot='lot2'):
    """Sprite sans gabarit. contenu = taille en px de l'objet (largeur ou hauteur selon `ajuster`)."""
    M.append({'nom': nom, 'lot': lot, 'gabarit': None, 'sujet': sujet, 'largeur': largeur,
              'contenu_px': contenu or largeur - 8, 'ajuster': ajuster, 'echelle_px_par_m': echelle,
              **({'hauteur': hauteur} if hauteur else {})})


# ------------------------------------------------------------------ lot 1 (gabarits existants)
g('bobine_acier', 'shiny coil of steel sheet standing on a wooden pallet')
g('bobine_cuivre', 'large wooden cable drum wound with bright orange copper cable, on a wooden pallet')
g('plaques_acier', 'stack of steel plates strapped on a wooden pallet')
g('palette_cartons', 'wooden pallet stacked with kraft cardboard boxes wrapped in clear stretch film')
g('palette_vide', 'empty wooden EUR pallet')
g('rack_stockage', 'industrial pallet rack, blue uprights and orange beams, 3 levels loaded with pallets of boxes')
g('rack_vide', 'empty industrial pallet rack, blue uprights and orange beams, 3 levels')
g('convoyeur_droit', 'straight section of grey industrial belt conveyor carrying cardboard boxes')
g('convoyeur_coin', '90 degree curved section of grey industrial belt conveyor carrying a cardboard box')
g('machine_assemblage', 'white and grey industrial assembly machine with glass window, control screen and signal tower light')
g('robot_6_axes', 'six-axis industrial robot arm, orange with turquoise joints, on a round base plate')
g('presse', 'blue four-column industrial hydraulic press with yellow and black hazard stripes')
for c, en in (('blanc', 'white'), ('rouge', 'red'), ('bleu', 'blue')):
    g(f'camion_{c}', f'box truck seen from the rear left, {en} cab, white cargo box, rear doors closed')
    g(f'camion_{c}_ouvert', f'box truck seen from the rear left, {en} cab, white cargo box, rear door open showing pallets of cardboard boxes inside')
g('quai_chargement', 'factory loading dock: grey sectional door half open, black dock shelter, steel dock leveller ramp, yellow bollards')
g('chariot_elevateur', 'yellow forklift truck with black mast and grey forks')
for c, en in (('orange', 'orange'), ('bleu', 'blue')):
    for p, en_p in (('marche', 'walking'), ('porte_carton', 'carrying a cardboard box'),
                    ('machine', 'operating a small control console'), ('debout', 'standing')):
        g(f'poses/ouvrier_gilet_{c}_{p}', f'factory worker, yellow hard hat, {en} high-visibility vest with reflective stripes, {en_p}')
g('bureau_vitre', 'small glass-walled office cubicle seen from above with 4 employees, desks, computer screens and a whiteboard')
g('arbre', 'green leafy garden tree')
g('buisson', 'round green garden bush')
g('mur_bas_gauche', 'low cut section of light grey factory wall with a blue door')
g('mur_bas_droite', 'low cut section of light grey factory wall with a blue door')
# herbe_tuile et sol_beton_tuile restent procéduraux (raccord exact entre tuiles).

# ------------------------------------------------------------------ lot 2 (nouveaux, rendu libre)
# Convoyeurs : tuile 2 m = 256 px
for o in ('nord_est', 'sud_est'):
    n(f'convoyeur_droit_{o}', f'straight section of grey industrial roller conveyor with side rails, one cardboard box on it, running towards the {o.replace("_", "-")} of the isometric grid')
    n(f'convoyeur_vide_droit_{o}', f'straight section of grey industrial roller conveyor with side rails, empty, running towards the {o.replace("_", "-")} of the isometric grid')
for o in ('ne', 'nw', 'se', 'sw'):
    n(f'convoyeur_coin_{o}', f'90 degree corner of grey industrial roller conveyor with side rails, one cardboard box on it, corner oriented {o.upper()}')
    n(f'convoyeur_vide_coin_{o}', f'90 degree corner of grey industrial roller conveyor with side rails, empty, corner oriented {o.upper()}')
# Machines
n('four_industriel', 'industrial mould furnace with a heavy door, short chimney and orange glow inside')
n('cuve_inox', 'stainless steel cylindrical tank with pipes and valves')
n('reacteur_chimique', 'vertical chemical reactor vessel with ladder and walkway platform')
n('machine_decoupe_laser', 'white and grey industrial laser cutting machine with control screen')
n('machine_injection_plastique', 'white and grey plastic injection moulding machine with control screen')
n('robot_6_axes_bras_1', 'six-axis industrial robot arm, orange with turquoise joints, arm raised high')
n('robot_6_axes_bras_2', 'six-axis industrial robot arm, orange with turquoise joints, arm half extended')
n('robot_6_axes_bras_3', 'six-axis industrial robot arm, orange with turquoise joints, arm lowered gripping a cardboard box')
# Camions : semi-remorque 12 m, échelle commune 64 px/m -> sprite large
for c, en in (('blanc', 'white'), ('rouge', 'red'), ('bleu', 'blue')):
    n(f'camion_{c}_face', f'articulated semi-trailer truck seen from the front, cab facing bottom right, {en} cab, long white trailer', largeur=1024, contenu=980)
    n(f'camion_{c}_dos', f'articulated semi-trailer truck seen from the rear, {en} cab, long white trailer, rear doors open showing cardboard boxes inside', largeur=1024, contenu=980)
n('remorque_pleine', 'long white semi-trailer alone, rear doors open, full of pallets of cardboard boxes', largeur=1024, contenu=900)
n('remorque_vide', 'long white semi-trailer alone, rear doors open, empty inside', largeur=1024, contenu=900)
# Murs
for o in ('ne', 'nw'):
    n(f'mur_bas_{o}', f'low cut section of light grey factory wall, no door, running along the {o.upper()} edge of an isometric tile')
    n(f'mur_bas_ouverture_{o}', f'low cut section of light grey factory wall with an empty doorway opening, no door, along the {o.upper()} edge of an isometric tile')
for o in ('n', 'e', 's', 'w'):
    n(f'coin_mur_{o}', f'low cut corner piece of light grey factory wall, corner pointing {o.upper()}')
# Matières premières (petits objets 128 px)
P = dict(largeur=128)
n('bobine_acier_couchee', 'shiny steel sheet coil lying on its side on a wooden cradle', **P)
n('bobine_cuivre_couchee', 'shiny copper sheet coil lying on its side on a wooden cradle', **P)
n('lingots_or', 'stack of gold ingots on a wooden pallet', **P)
n('futs_petrole', 'wooden pallet with 4 blue steel oil drums', **P)
n('sacs_farine', 'wooden pallet stacked with white flour sacks', **P)
n('sacs_sucre', 'wooden pallet stacked with light brown sugar sacks', **P)
n('bac_minerai_fer', 'steel bin filled with rust-red iron ore', **P)
n('bac_minerai_cuivre', 'steel bin filled with green-blue copper ore', **P)
n('bac_charbon', 'steel bin filled with black coal', **P)
n('rouleaux_tissu', 'wooden pallet with colorful fabric rolls', **P)
n('planches_bois', 'stack of timber planks strapped on a wooden pallet', **P)
n('sacs_ciment', 'wooden pallet stacked with grey cement bags', **P)
n('caisse_verre', 'wooden crate holding glass panes', **P)
# Personnages : vignette 128x200, 1,75 m = 137 px de haut
V = dict(largeur=128, hauteur=200, contenu=140, ajuster='hauteur')
OUV = (('h1', 'man, light skin', 'orange', 'yellow'), ('f1', 'woman, dark skin', 'orange', 'white'),
       ('h2', 'man, dark skin', 'blue', 'white'), ('f2', 'woman, light skin', 'blue', 'yellow'),
       ('h3', 'man, olive skin', 'green', 'yellow'), ('f3', 'woman, east asian', 'green', 'white'))
PLANCHES = {}
for code, qui, gilet, casque in OUV:
    noms = []
    for p, en_p in (('marche', 'walking'), ('porte_carton', 'carrying a cardboard box'),
                    ('machine', 'operating a small control console'), ('debout', 'standing')):
        nom = f'poses/ouvrier_{code}_{p}'
        n(nom, f'factory worker, {qui}, {casque} hard hat, {gilet} high-visibility vest, full body, {en_p}', **V)
        noms.append(nom)
    PLANCHES[f'ouvrier_{code}'] = noms
for i, d in ((1, 'man in a blue shirt'), (2, 'woman in a red blouse'), (3, 'man in a green sweater')):
    for f, en_f in ((1, 'hands on the keyboard'), (2, 'one hand raised above the keyboard')):
        n(f'poses/employe_bureau_{i}_{f}', f'office employee, {d}, seated on an office chair typing at a desk with a computer, {en_f}', **V)
n('poses/ingenieur_tablette', 'engineer in a white lab coat holding a tablet, full body, standing', **V)
# Divers
n('chariot_elevateur_charge', 'yellow forklift truck carrying a pallet of cardboard boxes on its forks')
n('transpalette', 'red hand pallet truck', **P)
n('extincteur', 'red fire extinguisher on a floor stand', largeur=128, contenu=40)
n('armoire_electrique', 'grey electrical cabinet with warning sign and indicator lights', largeur=128, contenu=80)
n('panneau_securite', 'yellow triangular safety warning sign on a post, pictogram only', largeur=128, contenu=50)
n('lampe_plafond_suspendue', 'industrial pendant ceiling lamp hanging from a cable, lit', largeur=128, contenu=90)

json.dump({'sprites': M, 'planches': PLANCHES,
           'test': ['camion_rouge_ouvert', 'machine_assemblage', 'poses/ouvrier_gilet_orange_porte_carton']},
          open(os.path.join(ICI, 'manifest.json'), 'w'), indent=1, ensure_ascii=False)
print(len(M), 'sprites :', sum(1 for m in M if m['lot'] == 'lot1'), 'lot1,', sum(1 for m in M if m['lot'] == 'lot2'), 'lot2')
