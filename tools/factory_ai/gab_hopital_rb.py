"""Gabarits isométriques exacts (plan symétrique) pour l'hôpital rouge/blanc et la pharmacie.
Chaque case de la grille est un cube ; le plan est donc parfaitement centré."""
from PIL import Image, ImageDraw
W, H = 2000, 1440
S = 62          # demi-largeur d'une case (px)
ZF = 58         # hauteur d'un étage (px)

def mk(N, hmap, roof, wall_l, wall_r, glass_ground, win, slab, ox=1000, oy=300, extra=None):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    def P(u, v, z): return (ox + (u - v) * S, oy + (u + v) * S / 2 - z * ZF)
    # dalle
    a = slab
    d.polygon([P(-a, -a, 0), P(N + a, -a, 0), P(N + a, N + a, 0), P(-a, N + a, 0)], fill=(112, 168, 84))
    d.polygon([P(-a, N + a, 0), P(N + a, N + a, 0), P(N + a, N + a, -.35), P(-a, N + a, -.35)], fill=(200, 202, 210))
    d.polygon([P(N + a, -a, 0), P(N + a, N + a, 0), P(N + a, N + a, -.35), P(N + a, -a, -.35)], fill=(150, 152, 162))
    # allée d'entrée
    cells = sorted([(u, v) for u in range(N) for v in range(N) if hmap(u, v) > 0], key=lambda c: (c[0] + c[1], c[0]))
    for (u, v) in cells:
        h = hmap(u, v)
        hl = hmap(u, v + 1); hr = hmap(u + 1, v)
        if h > hl:   # face gauche (+v)
            quad = [P(u, v + 1, hl), P(u + 1, v + 1, hl), P(u + 1, v + 1, h), P(u, v + 1, h)]
            d.polygon(quad, fill=wall_l)
            for f in range(int(hl), int(h)):
                if f == 0 and glass_ground(u, v, 'l'):
                    d.polygon([P(u + .08, v + 1, .1), P(u + .92, v + 1, .1), P(u + .92, v + 1, .92), P(u + .08, v + 1, .92)], fill=(150, 190, 215))
                else:
                    d.polygon([P(u + .14, v + 1, f + .3), P(u + .86, v + 1, f + .3), P(u + .86, v + 1, f + .72), P(u + .14, v + 1, f + .72)], fill=win)
        if h > hr:   # face droite (+u)
            quad = [P(u + 1, v + 1, hr), P(u + 1, v, hr), P(u + 1, v, h), P(u + 1, v + 1, h)]
            d.polygon(quad, fill=wall_r)
            for f in range(int(hr), int(h)):
                if f == 0 and glass_ground(u, v, 'r'):
                    d.polygon([P(u + 1, v + .08, .1), P(u + 1, v + .92, .1), P(u + 1, v + .92, .92), P(u + 1, v + .08, .92)], fill=(130, 170, 195))
                else:
                    d.polygon([P(u + 1, v + .14, f + .3), P(u + 1, v + .86, f + .3), P(u + 1, v + .86, f + .72), P(u + 1, v + .14, f + .72)], fill=(95, 125, 150))
        d.polygon([P(u, v, h), P(u + 1, v, h), P(u + 1, v + 1, h), P(u, v + 1, h)], fill=roof(u, v))
    if extra: extra(d, P)
    # arbres simples
    bb = im.getbbox(); return im.crop((bb[0] - 20, bb[1] - 20, bb[2] + 20, bb[3] + 20))

# ---- hôpital : H parfait, pont centré (cases v 4..7 sur 12), murs blancs, toits rouges
def h_h(u, v):
    if not (0 <= u < 12 and 0 <= v < 12): return 0
    if u <= 2 or u >= 9: return 5
    if 4 <= v <= 7: return 5
    return 0
hop = mk(12, h_h, lambda u, v: (196, 32, 38), (250, 250, 250), (214, 216, 222),
         lambda u, v, s: s == 'l' and 4 <= u <= 8 or (s == 'l' and (u <= 2 or u >= 9)), (125, 155, 180), slab=1.2)
hop.save('gabarits/gab_hopital_rb.png')

# ---- pharmacie : plan en croix 9x9, deux étages, croix verte posée sur le toit
def p_h(u, v):
    if not (0 <= u < 9 and 0 <= v < 9): return 0
    return 2 if (3 <= u <= 5 or 3 <= v <= 5) else 0
def p_roof(u, v): return (206, 208, 212)
def p_extra(d, P):
    cr = [(4, v) for v in range(2, 7)] + [(u, 4) for u in range(2, 7) if u != 4]
    for (u, v) in sorted(cr, key=lambda c: (c[0] + c[1])):
        z0, z1 = 2, 2.45
        d.polygon([P(u, v + 1, z0), P(u + 1, v + 1, z0), P(u + 1, v + 1, z1), P(u, v + 1, z1)], fill=(40, 150, 60))
        d.polygon([P(u + 1, v + 1, z0), P(u + 1, v, z0), P(u + 1, v, z1), P(u + 1, v + 1, z1)], fill=(28, 110, 45))
        d.polygon([P(u, v, z1), P(u + 1, v, z1), P(u + 1, v + 1, z1), P(u, v + 1, z1)], fill=(60, 180, 80))
pha = mk(9, p_h, p_roof, (250, 250, 250), (214, 216, 222), lambda u, v, s: True, (150, 190, 215), slab=1.2, extra=p_extra)
pha.save('gabarits/gab_pharmacie_rb.png')
print(hop.size, pha.size)
