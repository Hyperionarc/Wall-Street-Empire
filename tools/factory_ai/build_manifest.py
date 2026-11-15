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


def gg(nom, gabarit, sujet, lot='lot2'):
    """Sprite du lot 2 qui réutilise un gabarit existant (même orientation) : cadrage et ancre exacts."""
    M.append({'nom': nom, 'lot': lot, 'gabarit': gabarit, 'sujet': sujet})


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
# Convoyeurs : tuile 2 m = 256 px. Orientations : voir ORIENTATIONS.md (directions d'écran).
AXE = {'nord_est': 'running diagonally from the lower left to the upper right of the image',
       'sud_est': 'running diagonally from the upper left to the lower right of the image'}
COIN = {'ne': 'joining the upper right edge and the lower right edge of the tile, bending around the right corner',
        'se': 'joining the lower right edge and the lower left edge of the tile, bending around the bottom corner',
        'sw': 'joining the lower left edge and the upper left edge of the tile, bending around the left corner',
        'nw': 'joining the upper left edge and the upper right edge of the tile, bending around the top corner'}
R = 'grey industrial roller conveyor with side rails'
# Le jeu pose les pièces VIDES et anime lui-même les cartons par-dessus : les pièces chargées sont optionnelles (lot « optionnel »).
gg('convoyeur_droit_sud_est', 'convoyeur_droit', f'straight section of {R}, one cardboard box on it', lot='optionnel')
gg('convoyeur_vide_droit_sud_est', 'gab_conv_sud_est', f'straight section of {R}, completely empty, no box')
gg('convoyeur_droit_nord_est', 'gab_conv_nord_est', f'straight section of {R}, one cardboard box on it', lot='optionnel')
gg('convoyeur_vide_droit_nord_est', 'gab_conv_nord_est', f'straight section of {R}, completely empty, no box')
gg('convoyeur_coin_sw', 'convoyeur_coin', f'90 degree curved section of {R}, one cardboard box on it', lot='optionnel')
gg('convoyeur_vide_coin_sw', 'gab_conv_coin_sw', f'90 degree corner section of {R}, completely empty, no box')
for o in ('ne', 'se', 'nw'):
    gg(f'convoyeur_coin_{o}', f'gab_conv_coin_{o}', f'90 degree corner section of {R}, one cardboard box on it', lot='optionnel')
    gg(f'convoyeur_vide_coin_{o}', f'gab_conv_coin_{o}', f'90 degree corner section of {R}, completely empty, no box')
# Machines
gg('four_industriel', 'gab_four', 'industrial mould furnace with a heavy door, short chimney and orange glow inside')
gg('cuve_inox', 'gab_reacteur', 'stainless steel cylindrical tanks with pipes and valves')
gg('reacteur_chimique', 'gab_reacteur', 'vertical chemical reactor vessels with ladder and walkway platform')
gg('machine_decoupe_laser', 'gab_assemblage', 'white and grey industrial laser cutting machine with control screen')
gg('machine_injection_plastique', 'gab_presse', 'white and grey plastic injection moulding machine with control screen')
# machines par filière du jeu (facKind) : saw, kiln, mixer, spool, pack n'ont pas de dessin propre dans le jeu, le gabarit de la famille voisine fixe l'emprise
gg('scie_industrielle', 'gab_presse', 'industrial sawmill machine with a large circular saw blade and a timber feed table')
gg('four_rotatif_ciment', 'gab_four', 'cement kiln, short rotary kiln with a refractory door and a tall chimney')
gg('malaxeur_industriel', 'gab_reacteur', 'industrial dough and concrete mixer, large stainless steel mixing drums with a hopper')
gg('bobineuse_filature', 'gab_assemblage', 'industrial spinning and winding machine with many thread spools')
gg('ligne_conditionnement', 'gab_assemblage', 'industrial packaging machine with a hopper and a conveyor outlet, wrapping products in cartons')
n('robot_6_axes_bras_1', 'six-axis industrial robot arm, orange with turquoise joints, arm raised high')
n('robot_6_axes_bras_2', 'six-axis industrial robot arm, orange with turquoise joints, arm half extended')
n('robot_6_axes_bras_3', 'six-axis industrial robot arm, orange with turquoise joints, arm lowered gripping a cardboard box')
# Camions : semi-remorque 12 m, échelle commune 64 px/m -> sprite large
for c, en in (('blanc', 'white'), ('rouge', 'red'), ('bleu', 'blue')):
    gg(f'camion_{c}_face', 'gab_camion_face', f'articulated semi-trailer truck, {en} cab, long white trailer, rear doors closed')
    n(f'camion_{c}_dos', f'articulated semi-trailer truck lying along the upper-left to lower-right diagonal, cab at the upper left end, rear at the lower right end facing the viewer, {en} cab, long white trailer, rear doors open showing cardboard boxes inside', largeur=1024, contenu=980, lot='optionnel')
n('remorque_pleine', 'long white semi-trailer alone lying along the upper-left to lower-right diagonal, rear at the lower right end, rear doors open, full of pallets of cardboard boxes', largeur=1024, contenu=900, lot='optionnel')
n('remorque_vide', 'long white semi-trailer alone lying along the upper-left to lower-right diagonal, rear at the lower right end, rear doors open, empty inside', largeur=1024, contenu=900, lot='optionnel')
# Murs
BORD = {'ne': 'standing along the upper right edge of the isometric tile, running from the top corner to the right corner',
        'nw': 'standing along the upper left edge of the isometric tile, running from the left corner to the top corner'}
for o in ('ne', 'nw'):
    gg(f'mur_bas_{o}', f'gab_mur_{o}', 'low cut section of light grey factory wall, no door')
    gg(f'mur_bas_ouverture_{o}', f'gab_mur_ouverture_{o}', 'low cut section of light grey factory wall with an empty doorway opening, no door leaf')
SOMMET = {'n': 'top', 'e': 'right', 's': 'bottom', 'w': 'left'}
for o in ('n', 'e', 's', 'w'):
    gg(f'coin_mur_{o}', f'gab_coin_{o}', 'low cut L-shaped corner piece of light grey factory wall')
# Matières premières (petits objets 128 px)
P = dict(largeur=128)
# La forme, l'emprise et l'échelle viennent du dessin du jeu (facDrawMat) : un gabarit par famille de forme.
MAT = (  # nom, gabarit, sujet
    ('bobine_acier_couchee', 'coil', 'four shiny steel sheet coils standing on a wooden pallet'),
    ('bobine_cuivre_couchee', 'coil', 'four orange copper sheet coils standing on a wooden pallet'),
    ('bobine_fil', 'coil', 'four spools of thin copper wire on a wooden pallet'),
    ('rouleaux_tissu', 'coil', 'four large rolls of colorful fabric on a wooden pallet'),
    ('rouleaux_caoutchouc', 'coil', 'four large rolls of black rubber sheet on a wooden pallet'),
    ('lingots_or', 'ingot', 'stack of shiny gold ingots on a wooden pallet'),
    ('lingots_cuivre', 'ingot', 'stack of copper ingots on a wooden pallet'),
    ('lingots_acier', 'ingot', 'stack of grey steel ingots on a wooden pallet'),
    ('barres_acier', 'bar', 'bundles of steel bars strapped on a wooden pallet'),
    ('futs_petrole', 'barrel', 'wooden pallet with 4 dark blue steel oil drums'),
    ('futs_plastique', 'barrel', 'wooden pallet with 4 white plastic granule drums'),
    ('sacs_farine', 'sack', 'wooden pallet stacked with white flour sacks'),
    ('sacs_sucre', 'sack', 'wooden pallet stacked with light brown sugar sacks'),
    ('sacs_ciment', 'sack', 'wooden pallet stacked with grey cement bags'),
    ('sacs_ble', 'sack', 'wooden pallet stacked with beige burlap sacks of wheat grain'),
    ('sacs_coton', 'sack', 'wooden pallet stacked with white cotton bales'),
    ('sacs_beton', 'sack', 'wooden pallet stacked with dark grey concrete mix bags'),
    ('bac_minerai_fer', 'ore', 'steel bin filled with rust-red iron ore'),
    ('bac_minerai_cuivre', 'ore', 'steel bin filled with green-blue copper ore'),
    ('bac_charbon', 'ore', 'steel bin filled with black coal'),
    ('bac_calcaire', 'ore', 'steel bin filled with pale limestone rocks'),
    ('bac_sable', 'ore', 'steel bin filled with yellow sand'),
    ('bac_gravier', 'ore', 'steel bin filled with grey gravel'),
    ('planches_bois', 'plank', 'stack of timber planks strapped on a wooden pallet'),
    ('panneaux_osb', 'sheet', 'stack of OSB wood panels on a wooden pallet'),
    ('caisse_verre', 'sheet', 'wooden crates holding glass panes on a wooden pallet'),
    ('pneus_empiles', 'ring', 'four stacks of black car tyres on a wooden pallet'),
)
for nom, forme, sujet in MAT:
    gg(nom, f'gab_mat_{forme}', sujet)
P = dict(largeur=128)
gg('caisses_composants', 'palette_cartons', 'wooden pallet stacked with plain cardboard boxes of electronic components, no text')
# Personnages : vignette 128x200, 1,75 m = 137 px de haut
V = dict(largeur=128, hauteur=200, contenu=140, ajuster='hauteur')
OUV = (('h1', 'man, light skin', 'orange', 'yellow'), ('f1', 'woman, dark skin', 'orange', 'white'),
       ('h2', 'man, dark skin', 'blue', 'white'), ('f2', 'woman, light skin', 'blue', 'yellow'),
       ('h3', 'man, olive skin', 'green', 'yellow'), ('f3', 'woman, east asian', 'green', 'white'))
PLANCHES = {f'ouvrier_gilet_{c}': [f'poses/ouvrier_gilet_{c}_{p}' for p in ('marche', 'porte_carton', 'machine', 'debout')]
            for c in ('orange', 'bleu')}
for code, qui, gilet, casque in OUV:
    noms = []
    for p, en_p in (('marche', 'walking'), ('porte_carton', 'carrying a cardboard box'),
                    ('machine', 'operating a small control console'), ('debout', 'standing')):
        nom = f'poses/ouvrier_{code}_{p}'
        gc = 'bleu' if gilet == 'blue' else 'orange'   # silhouette et cadrage du gabarit lot 1 de la même pose : échelle et ancre identiques pour tous les ouvriers
        gg(nom, f'poses/ouvrier_gilet_{gc}_{p}', f'factory worker, {qui}, {casque} hard hat, {gilet} high-visibility vest, {en_p}')
        noms.append(nom)
    PLANCHES[f'ouvrier_{code}'] = noms
for i, d in ((1, 'man in a blue shirt'), (2, 'woman in a red blouse'), (3, 'man in a green sweater')):
    for f, en_f in ((1, 'hands on the keyboard'), (2, 'one hand raised above the keyboard')):
        n(f'poses/employe_bureau_{i}_{f}', f'office employee, {d}, seated on an office chair typing at a desk with a computer, {en_f}', **V)
n('poses/ingenieur_tablette', 'engineer in a white lab coat holding a tablet, full body, standing', **V)
# Divers
gg('chariot_elevateur_charge', 'chariot_elevateur', 'yellow forklift truck carrying a pallet of cardboard boxes on its forks')
n('transpalette', 'red hand pallet truck', **P)
n('extincteur', 'red fire extinguisher on a floor stand', largeur=128, contenu=40)
n('armoire_electrique', 'grey electrical cabinet with warning sign and indicator lights', largeur=128, contenu=80)
n('panneau_securite', 'yellow triangular safety warning sign on a post, pictogram only', largeur=128, contenu=50)
n('lampe_plafond_suspendue', 'industrial pendant ceiling lamp hanging from a cable, lit', largeur=128, contenu=90)

json.dump({'sprites': M, 'planches': PLANCHES,
           'test': ['camion_rouge_ouvert', 'machine_assemblage', 'poses/ouvrier_gilet_orange_porte_carton']},
          open(os.path.join(ICI, 'manifest.json'), 'w'), indent=1, ensure_ascii=False)
print(len(M), 'sprites :', sum(1 for m in M if m['lot'] == 'lot1'), 'lot1,', sum(1 for m in M if m['lot'] == 'lot2'), 'lot2')
