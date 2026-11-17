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


def n(nom, sujet, largeur=256, contenu=None, ajuster='largeur', echelle=64.0, hauteur=None, lot='lot2', gen=None, hobj=None):
    """Sprite sans gabarit. contenu = taille en px de l'objet (largeur ou hauteur selon `ajuster`)."""
    M.append({'nom': nom, 'lot': lot, 'gabarit': None, 'sujet': sujet, 'largeur': largeur,
              'contenu_px': contenu or largeur - 8, 'ajuster': ajuster, 'echelle_px_par_m': echelle,
              **({'hauteur': hauteur} if hauteur else {}), **({'gen_w': gen[0], 'gen_h': gen[1]} if gen else {}), **({'hauteur_objet': hobj} if hobj else {})})


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
n('machine_injection_plastique', 'large plastic injection moulding machine: a long horizontal white and grey machine body with an orange heated barrel, a tall steel funnel hopper on top filled with small white plastic pellets feeding the barrel, and at the front a heavy two-part steel mould clamping unit with a hot glowing mould, small control screen, coloured moulded plastic parts dropping into a bin, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=407, contenu=400)
# machines par filière du jeu (facKind) : saw, kiln, mixer, spool, pack n'ont pas de dessin propre dans le jeu, le gabarit de la famille voisine fixe l'emprise
n('scie_industrielle', 'industrial sawmill line: a log feed table carrying tree trunks, a large band saw with a big steel blade in a heavy frame cutting a log, a roller conveyor carrying freshly cut planks and square timber beams, a neat stack of planks and beams at the output, a little sawdust, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=407, contenu=400)
n('four_rotatif_ciment', 'cement rotary kiln: a long thick slightly inclined orange-red rotating steel drum resting on two heavy support roller stations, a tall preheater tower with pipes at the upper end, a burner housing at the lower end, a tall chimney, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=407, contenu=400)
n('malaxeur_industriel', 'industrial mixer: a large horizontal stainless steel drum mixer with a loading hopper on top, a bucket elevator, an open hatch showing mixing paddles and mixed material, a control cabinet, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=407, contenu=400)
n('bobineuse_filature', 'industrial yarn spinning and winding machine: a long machine with a row of many cones of coloured thread on spindles, threads running down to winding bobbins, a control panel at the end, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=407, contenu=400)
n('ligne_conditionnement', 'industrial packaging line: a product feeding conveyor, a hopper, a cartoning machine with a glass cover, closed cardboard boxes sliding out on an output conveyor, a stack of finished cartons, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=407, contenu=400)
n('robot_6_axes_bras_1', 'six-axis industrial robot arm, orange with turquoise joints, arm raised high')
n('robot_6_axes_bras_2', 'six-axis industrial robot arm, orange with turquoise joints, arm half extended')
n('robot_6_axes_bras_3', 'six-axis industrial robot arm, orange with turquoise joints, arm lowered gripping a cardboard box')
# Camions : semi-remorque 12 m, échelle commune 64 px/m -> sprite large
for c, en in (('blanc', 'white'), ('rouge', 'red'), ('bleu', 'blue')):
    gg(f'camion_{c}_face', 'gab_camion_face', f'articulated semi-trailer truck, ONE single cab at the front end only (bottom-right of the image), the long box trailer extends to the top-left and ends with a flat closed rear door, the rear end has no cab, no windshield, no grille, no headlights; {en} cab, long white trailer')
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

# ------------------------------------------------------------------ lot 3 (textile et maroquinerie)
n('machine_a_coudre_industrielle', 'industrial sewing machine on a sturdy grey work table with a foot pedal, a bobbin of thread and a piece of blue fabric under the needle, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=160, contenu=150, lot='lot3')
n('poste_couture_ouvriere_1', 'a woman worker with a headscarf-free ponytail, light skin, seated at an industrial sewing machine on a work table, sewing blue fabric, grey work apron, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=160, contenu=150, lot='lot3')
n('poste_couture_ouvriere_2', 'a dark-skinned man worker seated at an industrial sewing machine on a work table, sewing a red garment, green work apron, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=160, contenu=150, lot='lot3')
n('poste_couture_ouvriere_3', 'an older woman worker with glasses and grey hair seated at an industrial sewing machine on a work table, sewing a yellow fabric, orange work apron, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=160, contenu=150, lot='lot3')
n('table_de_coupe_tissu', 'long cutting table covered with several layers of coloured fabric, fabric shears and a paper pattern on top, a roll of fabric at one end, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=256, contenu=240, lot='lot3')
n('rouleaux_tissu', 'wooden pallet stacked with large rolls of fabric in many colours (red, blue, yellow, green), smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=128, contenu=118, lot='lot3')
n('peaux_cuir', 'stack of tanned brown leather hides folded on a wooden pallet, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=128, contenu=118, lot='lot3')
n('machine_a_coudre_cuir', 'heavy industrial leather sewing machine on a table with a brown leather bag under the needle and leather offcuts, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=160, contenu=150, lot='lot3')
n('mannequin_couture', "tailor's dressmaker mannequin in a half-finished white jacket with pins, smooth glossy toy-like 3D miniature, strong readable silhouette", largeur=96, contenu=80, lot='lot3')
n('portant_vetements', 'rolling clothing rack with several finished garments on hangers in different colours, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=128, contenu=118, lot='lot3')
n('unite_couture', 'textile and clothing production unit: four industrial sewing stations in a row with seated workers, a cutting table with fabric, rolls of fabric and a clothing rack, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=407, contenu=400, lot='lot3')
n('unite_maroquinerie', 'leather goods workshop unit: a cutting table with brown leather hides, a leather sewing machine with a seated worker, a press, finished bags on a shelf, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette', largeur=407, contenu=400, lot='lot3')

# ------------------------------------------------------------------ lot 4 (ville : maisons, immeubles, commerces, services)
n('pavillon_banlieue', 'suburban detached house with red tiled roof, small garage and a tree, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=256, contenu=248, lot='lot4')
n('maison_de_ville_briques', 'narrow brick town house with three floors, white window frames and a small front stoop, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=256, contenu=248, lot='lot4')
n('chalet_savoyard', 'alpine wooden chalet with a wide overhanging roof, balconies and stacked firewood, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=256, contenu=248, lot='lot4')
n('villa_mediterraneenne', 'mediterranean villa with white walls, terracotta roof, a terrace with a pergola and a small swimming pool, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=320, contenu=312, lot='lot4')
n('ferme_traditionnelle', 'traditional farmhouse with stone walls, a barn attached, a hay loft and a hay bale, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=320, contenu=312, lot='lot4')
n('maison_bois_nordique', 'scandinavian wooden house painted red with white trim, steep roof and a small sauna hut, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=256, contenu=248, lot='lot4')
n('maison_japonaise', 'traditional japanese house with a curved grey tiled roof, wooden veranda and a small garden, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=256, contenu=248, lot='lot4')
n('maison_moderne_cubique', 'modern minimalist cubic house with flat roof, large glass facade, concrete and wood cladding, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=256, contenu=248, lot='lot4')
n('immeuble_haussmannien', 'parisian haussmann apartment building, cream stone facade, wrought iron balconies, grey mansard zinc roof with chimneys, six floors, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=320, contenu=312, lot='lot4')
n('immeuble_residentiel_moderne', 'modern residential apartment block with balconies, white and wood facade, flat roof with solar panels, five floors, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=320, contenu=312, lot='lot4')
n('immeuble_bureaux_vitre', 'modern glass office building with blue reflective windows and a lobby entrance, eight floors, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=320, contenu=312, lot='lot4')
n('tour_de_verre', 'tall slim glass skyscraper with a crown at the top, twenty floors, steel frame, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=256, contenu=248, lot='lot4')
n('barre_hlm', 'long concrete social housing block from the nineteen seventies with regular windows and balconies, painted in pale colours, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=384, contenu=376, lot='lot4')
n('brownstone_new_yorkais', 'new york brownstone row building in reddish brown stone with a front stoop and fire escape, four floors, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=256, contenu=248, lot='lot4')
n('immeuble_londonien_briques', 'london red brick terraced apartment building with white sash windows and a black door, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=256, contenu=248, lot='lot4')
n('immeuble_art_deco', 'art deco building with a stepped cream and gold facade, vertical fins and a decorated entrance, ten floors, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering', largeur=256, contenu=248, lot='lot4')
n('hotel_de_luxe', 'luxury hotel with a grand entrance canopy and many balconies, the flat roof is painted dark blue and carries ONE big simple white painted bed pictogram seen from above (rectangle with a pillow) with a gold five-pointed star next to it, whole building standing alone on a small square plot with a little pavement, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no other lettering, no flags', largeur=320, contenu=312, lot='lot4')
n('boulangerie', 'french bakery shop with a pitched terracotta tile roof and a striped awning, the roof carries a gigantic painted pictogram of a golden baguette and a croissant, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above, the roof carries a HUGE flat pictogram painted on the roof covering most of the roof surface so the building type is understandable from far away, no other lettering, no flags', largeur=256, contenu=248, lot='lot4')
n('restaurant_terrasse', 'restaurant with a terrace, umbrellas and tables, the roof carries a gigantic painted pictogram of a fork and a knife crossed on a dark red roof, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above, the roof carries a HUGE flat pictogram painted on the roof covering most of the roof surface so the building type is understandable from far away, no other lettering, no flags', largeur=256, contenu=248, lot='lot4')
n('cafe_de_quartier', 'corner cafe with big windows, striped awning and small round tables, the roof carries a gigantic painted pictogram of a steaming coffee cup on a brown roof, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above, the roof carries a HUGE flat pictogram painted on the roof covering most of the roof surface so the building type is understandable from far away, no other lettering, no flags', largeur=256, contenu=248, lot='lot4')
n('banque_neoclassique', 'bank building with stone columns and steps, the roof carries a gigantic painted golden coin pictogram with a dollar sign on a dark roof, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above, the roof carries a HUGE flat pictogram painted on the roof covering most of the roof surface so the building type is understandable from far away, no other lettering, no flags', largeur=320, contenu=312, lot='lot4')
n('boutique_mode', 'fashion boutique with large display windows and mannequins, the roof carries a gigantic painted pictogram of a clothes hanger on a pink roof, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above, the roof carries a HUGE flat pictogram painted on the roof covering most of the roof surface so the building type is understandable from far away, no other lettering, no flags', largeur=256, contenu=248, lot='lot4')
n('mairie', 'town hall with a clock tower, symmetrical stone facade and steps, plain neutral flag poles with plain blue flags, the roof carries a gigantic painted pictogram of a building with columns, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above, the roof carries a HUGE flat pictogram painted on the roof covering most of the roof surface so the building type is understandable from far away, no other lettering, no flags', largeur=320, contenu=312, lot='lot4')
n('ecole', 'primary school building with a playground and colourful windows, the roof carries a gigantic painted pictogram of an open book and a pencil on a blue roof, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above, the roof carries a HUGE flat pictogram painted on the roof covering most of the roof surface so the building type is understandable from far away, no other lettering, no flags', largeur=320, contenu=312, lot='lot4')
n('hopital', 'modern hospital building with ambulance bay, six floors, the flat roof is painted solid blue and carries one giant white capital letter H: two thick vertical white bars joined by one thick horizontal white bar in the middle, exactly like the letter H of a helipad, nothing else on the roof, whole building standing alone on a small square plot with a little pavement, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no other lettering, no flags', largeur=320, contenu=312, lot='lot4')
n('gare_ferroviaire', 'railway station building with a glass roof hall, a clock tower and a platform with a train at the side, the roof carries a gigantic bold pictogram of a front view blue and white train painted across the whole main roof, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above, the roof carries a HUGE flat pictogram painted on the roof covering most of the roof surface so the building type is understandable from far away, no other lettering, no flags', largeur=384, contenu=376, lot='lot4')
n('eglise_de_village', 'stone village church with a bell tower and a grey slate pitched roof, small cemetery wall, a small simple white cross on top of the bell tower only, the slate roof is plain with no painting, whole building standing alone on a small square plot with a little pavement, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no other lettering, no flags', largeur=256, contenu=248, lot='lot4')
n('station_service', 'petrol station with a flat yellow canopy, two blue fuel pumps and a small shop, the canopy roof carries ONE big simple painted white fuel pump pictogram (a rectangle pump body with a nozzle hose on the side) on the yellow roof, whole building standing alone on a small square plot with a little pavement, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no other lettering, no flags', largeur=256, contenu=248, lot='lot4')
n('immeuble_en_construction', "apartment building under construction with a tower crane, scaffolding, concrete floors and a builder's hut, whole building standing alone on a small square plot with a little pavement and garden, smooth glossy toy-like 3D miniature, strong readable silhouette, no lettering", largeur=320, contenu=312, lot='lot4')

# ------------------------------------------------------------------ lot 5 (gros immeubles : 6, 12 et 25 étages)
n('immeuble_residentiel_6_etages_a', 'residential apartment building with exactly six floors, cream plaster facade, regular windows with small balconies, a ground floor with a shop and an entrance door, flat roof with a roof terrace, whole building standing alone on a small square plot with pavement and a few trees at its base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=380, ajuster='hauteur', hauteur=420, lot='lot5')
n('immeuble_residentiel_6_etages_b', 'residential apartment building with exactly six floors, red brick and white stone facade, bay windows and balconies, a pitched grey roof with dormer windows, an entrance with steps, whole building standing alone on a small square plot with pavement and a few trees at its base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=380, ajuster='hauteur', hauteur=420, lot='lot5')
n('tour_bureaux_12_etages_a', 'office tower with exactly twelve floors, blue tinted glass curtain wall with grey horizontal bands, a lobby entrance with a canopy, mechanical equipment on a flat roof, whole building standing alone on a small square plot with pavement and a few trees at its base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=560, ajuster='hauteur', hauteur=600, lot='lot5')
n('tour_bureaux_12_etages_b', 'office tower with exactly twelve floors, white concrete and green tinted glass facade with vertical fins, a wide glass lobby, a rooftop garden, whole building standing alone on a small square plot with pavement and a few trees at its base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=560, ajuster='hauteur', hauteur=600, lot='lot5')
n('gratte_ciel_25_etages_a', 'tall office skyscraper with twenty five floors, silver and blue reflective glass facade, a stepped setback near the top, a large lobby with a canopy, an antenna spire, whole building standing alone on a small square plot with pavement and a few trees at its base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=860, ajuster='hauteur', hauteur=900, lot='lot5')
n('gratte_ciel_25_etages_b', 'tall office skyscraper with twenty five floors, dark grey steel and glass facade with gold accents, two setbacks, a helipad on the roof, a grand lobby, whole building standing alone on a small square plot with pavement and a few trees at its base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=860, ajuster='hauteur', hauteur=900, lot='lot5')

# ------------------------------------------------------------------ lot 5b (énergie : recharge électrique)
n('station_recharge_electrique', 'electric vehicle charging station: a flat canopy with solar panels on top, four modern white and green charging posts with coiled cables, two electric cars plugged in, a small glass kiosk, the canopy roof carries a gigantic painted pictogram of a green lightning bolt inside a plug on a white roof, whole building standing alone on a small square plot with a little pavement, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, the canopy roof carries a HUGE flat painted pictogram covering most of the roof so the type is understandable from far away, no other lettering, no flags', largeur=256, contenu=248, lot='lot5')
n('station_recharge_rapide_autoroute', 'large fast electric charging hub: a long wide canopy with solar panels, eight tall white and blue ultra-fast chargers with thick cables, several electric cars and a small electric truck charging, a modern glass service building, the canopy roof carries a gigantic painted pictogram of a blue lightning bolt on a white roof, whole building standing alone on a small square plot with a little pavement, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, the canopy roof carries a HUGE flat painted pictogram covering most of the roof so the type is understandable from far away, no other lettering, no flags', largeur=384, contenu=376, lot='lot5')

# ------------------------------------------------------------------ lot 6 (industrie : raffinerie)
n('raffinerie_petrole', 'oil refinery complex: a tall steel distillation column with ladders and platforms, several smaller columns, a cluster of white spherical and cylindrical storage tanks, a network of silver pipes with orange valves, a flare stack with a small flame, a pipe rack, a small control building, a tanker truck loading at a gantry, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering', largeur=407, contenu=400, lot='lot6')
n('raffinerie_unite_distillation', 'oil refinery distillation unit: one very tall central distillation tower with ladders, two shorter reactor towers, heat exchangers, a dense network of silver pipes and a furnace with a chimney, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering', largeur=320, contenu=320, lot='lot6')
n('reservoir_stockage_petrole', 'oil storage tank farm: three large white cylindrical floating roof storage tanks with spiral stairs, a bund wall around them, pipes and a pump house, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering', largeur=320, contenu=320, lot='lot6')
n('torchere_raffinerie', 'tall flare stack of a refinery with a lit orange flame at the top, a base with pipes and a small fence, standing on a square dark grey base platform with yellow and black hazard edge stripes, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering', largeur=128, contenu=160, lot='lot6')

# ------------------------------------------------------------------ lot 7 (drugstore / parapharmacie)
n('drugstore', 'large modern drugstore and health superstore selling medicines and food supplements: a wide two-storey white and green building with a huge glass storefront showing shelves of colourful vitamin boxes, a green plus-shaped cross sign on the facade, an entrance with a green canopy, a modern single-pitch (mono-pitch) roof made of one plain smooth light grey plane that slopes gently upward from the front corner at the bottom of the image towards the back corner at the top of the image, a clean overhanging roof edge, nothing on the roof, the building takes about half of the plot and a paved car park with marked bays and a few cars takes the other half, the ENTIRE site is one perfect square plot with a thin light grey kerb border around all four sides, fully visible and complete, everything stays strictly inside the square plot, nothing sticks out beyond the kerb, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=376, lot='lot8')

# ------------------------------------------------------------------ lot 8 (supermarchés et hypermarchés avec parking proportionnel)
n('supermarche', 'large modern supermarket in the style of a big American discount retail chain: a wide building with blue and white facade, a big glass entrance with a canopy and a trolley shelter, a modern single-pitch (mono-pitch) roof made of one plain smooth light grey plane that slopes gently upward from the front corner at the bottom of the image towards the back corner at the top of the image, a clean overhanging roof edge, nothing on the roof, a car park taking about half of the plot with about 30 marked bays and many cars of different colours, the ENTIRE site is one perfect square plot with a thin light grey kerb border around all four sides, fully visible and complete, everything stays strictly inside the square plot, nothing sticks out beyond the kerb, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=448, contenu=440, lot='lot8')
n('hypermarche', 'huge modern hypermarket in the style of a big European hypermarket chain: a very large blue and white building with a wide glass entrance hall, a loading dock with a truck on one side, a modern single-pitch (mono-pitch) roof made of one plain smooth light grey plane that slopes gently upward from the front corner at the bottom of the image towards the back corner at the top of the image, a clean overhanging roof edge, nothing on the roof, the building takes only about a quarter of the plot and an enormous car park takes the other three quarters, with about 150 marked bays in long rows, a very large number of cars of different colours, trolley shelters and a few trees along the kerb, the ENTIRE site is one perfect square plot with a thin light grey kerb border around all four sides, fully visible and complete, everything stays strictly inside the square plot, nothing sticks out beyond the kerb, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=576, contenu=568, lot='lot8')

# ------------------------------------------------------------------ lot 9 (gratte-ciel de 40 et 60 étages, demande de l'intégrateur)
n('gratte_ciel_40_etages_a', 'very tall office skyscraper with forty floors, a slender rectangular tower of silver and blue reflective glass, two setbacks, a large lobby with a canopy, a crown with a small antenna, whole building standing alone on a small square plot with pavement and a few trees at its base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=376, hauteur=1400, hobj=1360, lot='lot9', gen=(448, 1600))
n('gratte_ciel_40_etages_b', 'very tall office skyscraper with forty floors, a slender tower of dark steel and glass with gold accents, a stepped crown with a helipad, a grand lobby, whole building standing alone on a small square plot with pavement and a few trees at its base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=376, hauteur=1400, hobj=1360, lot='lot9', gen=(448, 1600))
n('gratte_ciel_60_etages_a', 'extremely tall and very slim supertall skyscraper with sixty floors, a thin needle-like tower of white and blue glass, tapering upward, topped with a tall antenna spire, a large lobby at the base, whole building standing alone on a small square plot with pavement and a few trees at its base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=376, hauteur=2000, hobj=1960, lot='lot9', gen=(352, 1840))
n('gratte_ciel_60_etages_b', 'extremely tall and very slim supertall skyscraper with sixty floors, a thin elegant tower of graphite glass with silver bands, tapering upward, topped with a very tall antenna mast, a grand lobby at the base, whole building standing alone on a small square plot with pavement and a few trees at its base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=376, hauteur=2000, hobj=1960, lot='lot9', gen=(352, 1840))


# ------------------------------------------------------------------ lot 10 : bâtiments seuls (la parcelle 2:1 est dessinée par parcelle.py)
n('bat_drugstore', 'large modern drugstore and health superstore selling medicines and food supplements: a wide two-storey white and green rectangular building with a huge glass storefront showing shelves of colourful vitamin boxes, a green plus-shaped cross sign on the facade, an entrance with a green canopy, a modern single-pitch (mono-pitch) roof made of one plain smooth light grey plane that slopes gently upward from the front corner at the bottom of the image towards the back corner at the top of the image, a clean overhanging roof edge, nothing on the roof, no ground, no plot, no car park, no cars, no trees, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=370, lot='lot10')
n('bat_supermarche', 'large modern supermarket in the style of a big American discount retail chain: a wide rectangular building with blue and white facade, a big glass entrance with a canopy and a trolley shelter, a modern single-pitch (mono-pitch) roof made of one plain smooth light grey plane that slopes gently upward from the front corner at the bottom of the image towards the back corner at the top of the image, a clean overhanging roof edge, nothing on the roof, no ground, no plot, no car park, no cars, no trees, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=448, contenu=436, lot='lot10')
n('bat_hypermarche', 'huge modern hypermarket in the style of a big European hypermarket chain: a very large rectangular blue and white building with a wide glass entrance hall and a loading dock with a truck on one side, a modern single-pitch (mono-pitch) roof made of one plain smooth light grey plane that slopes gently upward from the front corner at the bottom of the image towards the back corner at the top of the image, a clean overhanging roof edge, nothing on the roof, no ground, no plot, no car park, no cars, no trees, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=576, contenu=560, lot='lot10')


n('bat_scierie', 'compact sawmill: a long low timber-framed shed with a corrugated metal roof and an open side showing a band saw, big stacks of fresh planks and piles of round logs against the walls, a small conveyor, no ground, no plot, no car park, no cars, no trees, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=320, contenu=310, lot='lot10')
n('bat_mega_centre_commercial', 'huge shopping mall: a very wide two-storey rectangular building with a curved glass roof atrium in the middle, white and warm beige facade with large glass windows and a big entrance canopy, modern flat roof, no ground, no plot, no car park, no cars, no trees, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=640, contenu=620, lot='lot10')


n('bat_ferme_hangar', 'farm hangar: a large barn with a red wooden wall and a grey metal gabled roof, a tall galvanised grain silo beside it, a farm tractor parked at the side, no fields, no ground, no plot, no fence, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=370, lot='lot10')
n('bat_ferme_bovins', 'cattle farm: a big red cow barn with a two-sided roof, a tall grain silo, a shiny steel milk tank against the barn, a hay bale stack, no fields, no ground, no plot, no fence, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=370, lot='lot10')
n('bat_ferme_poulets', 'chicken farm: a long low white poultry house with a corrugated metal roof, two feed silos at one end, stacked egg crates by the door, no fields, no ground, no plot, no fence, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=370, lot='lot10')
n('bat_ferme_porcs', 'pig farm: a brick pig house with a flat roof and a row of small doors, a feed silo and a round slurry tank beside it, no fields, no ground, no plot, no fence, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=370, lot='lot10')
n('bat_ferme_moutons', 'sheep farm: a wooden sheep barn with a low pitched roof, round hay bales stacked beside it, a small shearing shed, no fields, no ground, no plot, no fence, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=370, lot='lot10')
n('bat_chai_vigne', 'winery: a small stone cellar building with a clay tile roof, stainless steel fermentation tanks visible beside it, wooden wine barrels stacked outside, no fields, no ground, no plot, no fence, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=384, contenu=370, lot='lot10')

n('bat_supermarche_n2', 'larger modern supermarket in the style of a big American discount retail chain, upgraded version: a wider two-storey rectangular building with blue and white facade, a big glass entrance with a long canopy, an attached garden centre with a glass greenhouse roof on one side, a modern single-pitch (mono-pitch) roof made of one plain smooth light grey plane that slopes gently upward from the front corner at the bottom of the image towards the back corner at the top of the image, a clean overhanging roof edge, nothing on the roof, no ground, no plot, no car park, no cars, no trees, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=512, contenu=500, lot='lot10')
n('bat_supermarche_n3', 'flagship supermarket, top upgrade: a very wide two-storey rectangular building with blue and white facade, large glass curtain wall, a long canopy, a glass greenhouse garden centre and a small fuel station canopy attached on one side, rooftop solar panels on part of the roof, a modern single-pitch (mono-pitch) roof made of one plain smooth light grey plane that slopes gently upward from the front corner at the bottom of the image towards the back corner at the top of the image, a clean overhanging roof edge, nothing on the roof, no ground, no plot, no car park, no cars, no trees, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=576, contenu=560, lot='lot10')
n('bat_hypermarche_n2', 'larger hypermarket in the style of a big European hypermarket chain, upgraded version: an even bigger rectangular blue and white building with two glass entrance halls, a loading dock with two trucks, an attached tyre and auto centre, a modern single-pitch (mono-pitch) roof made of one plain smooth light grey plane that slopes gently upward from the front corner at the bottom of the image towards the back corner at the top of the image, a clean overhanging roof edge, nothing on the roof, no ground, no plot, no car park, no cars, no trees, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=640, contenu=620, lot='lot10')
n('bat_hypermarche_n3', 'flagship hypermarket, top upgrade: a huge rectangular blue and white building with a tall glass entrance tower, three loading docks with trucks, an attached garden centre with glass roof and an auto centre, rooftop solar panels on half of the roof, a modern single-pitch (mono-pitch) roof made of one plain smooth light grey plane that slopes gently upward from the front corner at the bottom of the image towards the back corner at the top of the image, a clean overhanging roof edge, nothing on the roof, no ground, no plot, no car park, no cars, no trees, nothing around it, only the building itself with a flat plain base, smooth glossy toy-like 3D miniature, strong readable silhouette, seen from high above in isometric view, no lettering, no flags', largeur=704, contenu=680, lot='lot10')

json.dump({'sprites': M, 'planches': PLANCHES,
           'test': ['camion_rouge_ouvert', 'machine_assemblage', 'poses/ouvrier_gilet_orange_porte_carton']},
          open(os.path.join(ICI, 'manifest.json'), 'w'), indent=1, ensure_ascii=False)
print(len(M), 'sprites :', sum(1 for m in M if m['lot'] == 'lot1'), 'lot1,', sum(1 for m in M if m['lot'] == 'lot2'), 'lot2')
