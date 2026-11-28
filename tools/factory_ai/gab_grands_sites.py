"""Gabarits isométriques exacts : hypermarché 10x10 et centrale solaire 12x12 (S = 128 px par unité de case pour la dalle de 10)."""
import random
from PIL import Image, ImageDraw
random.seed(7)

def projeteur(N, hmax, marge=24):
    S = 128 * 10 / N * (N / 10)  # 1 case = 256 px de large de losange -> S = 128
    S = 128
    W = int(2 * N * S + 2 * marge); H = int(N * S + hmax + 2 * marge)
    ox = W / 2; oy = marge + hmax
    return S, W, H, (lambda u, v, z=0: ((u - v) * S + ox, (u + v) * S / 2 - z + oy))

def quad(d, P, pts, fill, out=None):
    d.polygon([P(*p) for p in pts], fill=fill, outline=out)

def boite(d, P, u0, u1, v0, v1, h, ct, cf, cd, z0=0):
    quad(d, P, [(u0, v1, z0), (u1, v1, z0), (u1, v1, h), (u0, v1, h)], cf)   # face v1 (bas-gauche)
    quad(d, P, [(u1, v0, z0), (u1, v1, z0), (u1, v1, h), (u1, v0, h)], cd)   # face u1 (bas-droite)
    quad(d, P, [(u0, v0, h), (u1, v0, h), (u1, v1, h), (u0, v1, h)], ct)     # toit

def hyper():
    N = 10; HB = 300
    S, W, H, P = projeteur(N, HB + 20)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    quad(d, P, [(0, 0), (N, 0), (N, N), (0, N)], (203, 200, 193, 255))
    quad(d, P, [(0, 4.3), (N, 4.3), (N, N), (0, N)], (96, 98, 102, 255))             # parking
    quad(d, P, [(7.3, 0), (N, 0), (N, 4.3), (7.3, 4.3)], (110, 112, 115, 255))        # cour de livraison
    cols = [(180, 40, 40), (40, 70, 140), (225, 225, 225), (30, 30, 30), (120, 125, 130), (200, 170, 60)]
    for b0 in (4.7, 6.2, 7.7, 9.2):                                                     # deux rangées dos à dos
        for v0 in (b0, b0 + 0.45):
            if v0 + 0.45 > N + 0.01: continue
            u = 0.2
            while u + 0.24 < N - 0.1:
                quad(d, P, [(u, v0), (u, v0 + 0.45)] * 1 + [(u, v0 + 0.45), (u, v0)][:0], (255, 255, 255, 255)) if False else None
                d.line([P(u, v0), P(u, v0 + 0.45)], fill=(235, 235, 235, 255), width=3)
                if False:
                    boite(d, P, u + 0.04, u + 0.2, v0 + 0.04, v0 + 0.4, 40, (*random.choice(cols), 255), (*[int(c * .8) for c in random.choice(cols)], 255), (*[int(c * .65) for c in random.choice(cols)], 255))
                u += 0.24
    boite(d, P, 0, 7.0, 0, 4.0, HB, (166, 169, 173, 255), (226, 226, 222, 255), (188, 188, 186, 255))   # bâtiment
    quad(d, P, [(0.3, 4.0, 40), (6.7, 4.0, 40), (6.7, 4.0, 150), (0.3, 4.0, 150)], (110, 140, 165, 255))  # vitrage
    boite(d, P, 2.8, 4.2, 4.0, 4.6, 190, (240, 240, 240, 255), (205, 205, 205, 255), (180, 180, 180, 255), z0=150)  # auvent d'entrée
    for v0 in (0.5, 1.6, 2.7):                                                          # semi-remorques à quai
        boite(d, P, 7.0, 9.4, v0, v0 + 0.55, 90, (240, 240, 240, 255), (215, 215, 215, 255), (190, 190, 190, 255), z0=12)
        boite(d, P, 9.4, 9.8, v0 + 0.05, v0 + 0.5, 60, (60, 70, 120, 255), (50, 58, 100, 255), (40, 46, 85, 255), z0=12)
    im.save('gabarits/gab_hyper_10x10.png'); print('hyper', im.size, im.getbbox())

def solaire():
    N = 12; HB = 70
    S, W, H, P = projeteur(N, HB + 120)
    S = 128 * 10 / 10
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    quad(d, P, [(0, 0), (N, 0), (N, N), (0, N)], (196, 192, 184, 255))
    u = 0.35
    while u < N - 0.35:                                   # rangées continues de panneaux, sans route
        if int((u - 0.35) / 1.2) % 5 != 4 or True:
            boite(d, P, u, u + 0.7, 0.4, N - 3.0 if u > N - 4.2 else N - 0.4, 38, (30, 52, 105, 255), (22, 40, 85, 255), (18, 32, 70, 255), z0=8)
        u += 0.9
    boite(d, P, N - 3.6, N - 0.4, N - 2.6, N - 0.4, 90, (200, 200, 200, 255), (225, 225, 220, 255), (190, 190, 186, 255))  # local de contrôle
    im.save('gabarits/gab_solaire_12x12.png'); print('solaire', im.size, im.getbbox())



def rack(d, P, u, v, long_u=0.9, w=0.28, h=34):
    boite(d, P, u, u + long_u, v, v + w, h, (150, 154, 158, 255), (120, 124, 128, 255), (100, 104, 108, 255))
    for k in range(1, 6):
        d.line([P(u + k * long_u / 6, v + w, 0), P(u + k * long_u / 6, v + w, h)], fill=(70, 72, 75, 255), width=2)

def hyper14():
    N = 14; HB = 340
    S, W, H, P = projeteur(N, HB + 20)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    quad(d, P, [(0, 0), (N, 0), (N, N), (0, N)], (203, 200, 193, 255))
    quad(d, P, [(0, 6.8), (10, 6.8), (10, N), (0, N)], (96, 98, 102, 255))              # parking (même taille qu'avant)
    quad(d, P, [(10.5, 0), (N, 0), (N, 6.8), (10.5, 6.8)], (110, 112, 115, 255))        # cour de livraison
    for b0 in (7.2, 8.7, 10.2, 11.7):
        for v0 in (b0, b0 + 0.45):
            u = 0.2
            while u + 0.24 < 9.9:
                d.line([P(u, v0), P(u, v0 + 0.45)], fill=(235, 235, 235, 255), width=3); u += 0.24
    boite(d, P, 0, 10.5, 0, 6.5, HB, (166, 169, 173, 255), (226, 226, 222, 255), (188, 188, 186, 255))
    quad(d, P, [(0.5, 6.5, 40), (10.0, 6.5, 40), (10.0, 6.5, 160), (0.5, 6.5, 160)], (110, 140, 165, 255))
    boite(d, P, 4.2, 6.4, 6.5, 7.1, 200, (240, 240, 240, 255), (205, 205, 205, 255), (180, 180, 180, 255), z0=160)
    for (u, v) in ((3.2, 6.9), (6.9, 6.9), (0.6, 7.0), (9.0, 7.0)):                     # abris à caddies (racks)
        rack(d, P, u, v)
    for v0 in (0.7, 2.6, 4.5):                                                          # semi-remorques : UNE cabine, à l'avant
        boite(d, P, 10.5, 13.1, v0, v0 + 0.7, 100, (240, 240, 240, 255), (215, 215, 215, 255), (190, 190, 190, 255), z0=14)
        boite(d, P, 13.1, 13.7, v0 + 0.05, v0 + 0.65, 110, (60, 70, 120, 255), (50, 58, 100, 255), (40, 46, 85, 255), z0=14)
    im.save('gabarits/gab_hyper_14x14.png'); print('hyper14', im.size, im.getbbox())

def super4b():
    N = 4; HB = 150
    S, W, H, P = projeteur(N, HB + 20)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    quad(d, P, [(0, 0), (N, 0), (N, N), (0, N)], (203, 200, 193, 255))
    quad(d, P, [(0, 2.0), (N, 2.0), (N, N), (0, N)], (96, 98, 102, 255))
    for b0 in (2.3, 3.0):
        u = 0.15
        while u + 0.24 < N - 0.1:
            d.line([P(u, b0), P(u, b0 + 0.45)], fill=(235, 235, 235, 255), width=3); u += 0.24
    boite(d, P, 0.2, 3.4, 0.2, 1.7, HB, (45, 90, 170, 255), (232, 232, 228, 255), (30, 70, 150, 255))
    boite(d, P, 0.2, 3.4, 0.2, 1.7, HB + 8, (45, 90, 170, 255), (45, 90, 170, 255), (45, 90, 170, 255), z0=HB)
    quad(d, P, [(0.5, 1.7, 30), (3.1, 1.7, 30), (3.1, 1.7, 100), (0.5, 1.7, 100)], (110, 140, 165, 255))
    for (u, v) in ((0.25, 1.78), (2.6, 1.78), (3.0, 3.6), (0.2, 3.6)):                  # racks à caddies, plus d'arbres
        rack(d, P, u, v, 0.7, 0.24, 30)
    im.save('gabarits/gab_super_4x4b.png'); print('super4b', im.size)

def solaire2():
    N = 12; HB = 120
    S, W, H, P = projeteur(N, HB)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    quad(d, P, [(0, 0), (N, 0), (N, N), (0, N)], (196, 192, 184, 255))
    u = 0.35
    while u + 0.6 < N - 0.3:                    # rangées orientées plein sud-est : face inclinée vers +u (la droite)
        v1 = 9.6 if u > 9.6 else N - 0.4
        dp = 0.62
        quad(d, P, [(u, 0.4, 0), (u, v1, 0), (u, v1, 78), (u, 0.4, 78)], (40, 44, 52, 255))
        quad(d, P, [(u, v1, 0), (u + dp, v1, 0), (u + dp, v1, 16), (u, v1, 78)], (28, 36, 60, 255))     # tranche visible
        quad(d, P, [(u, 0.4, 78), (u, v1, 78), (u + dp, v1, 16), (u + dp, 0.4, 16)], (34, 62, 130, 255))   # face inclinée
        u += 1.0
    boite(d, P, 10.2, 11.7, 10.0, 11.6, 120, (245, 245, 245, 255), (230, 230, 228, 255), (205, 205, 203, 255))   # conteneur blanc
    quad(d, P, [(10.95, 10.35, 120), (11.35, 10.35, 120), (11.05, 10.8, 120), (11.4, 10.8, 120), (10.8, 11.4, 120), (10.95, 10.95, 120), (10.65, 10.95, 120)], (20, 110, 235, 255))  # éclair
    im.save('gabarits/gab_solaire_12x12b.png'); print('solaire2', im.size, im.getbbox())

hyper14(); super4b(); solaire2()
