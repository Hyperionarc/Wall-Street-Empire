"""Moteur de rendu isometrique 2:1 (camera a 30 deg, lumiere haut-gauche)."""
import math
from contextlib import contextmanager
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

S = 3                      # sur-echantillonnage
SX, SY, SZ = 64.0, 32.0, 78.4   # px par metre a l'echelle 1 (tuile 2 m = 256x128 px)
MPX = 90.5                # px par metre "vrai" (spheres)
VIEW = np.array([0.612, 0.612, 0.5]); VIEW /= np.linalg.norm(VIEW)
LIGHT = np.array([-0.45, 0.38, 0.8]); LIGHT /= np.linalg.norm(LIGHT)
HALF = LIGHT + VIEW; HALF /= np.linalg.norm(HALF)
SHK = 0.42                 # longueur d'ombre par metre de hauteur (vers +x = bas-droite)


def dot(a, b):
    return float(a[0] * b[0] + a[1] * b[1] + a[2] * b[2])


def shade(c, f):
    cool = (10, 16, 38)
    return tuple(int(max(0, min(255, c[i] * f + (1 - f) * cool[i] * 0.6))) for i in range(3))


def mix(a, b, t):
    return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))


def lit(c, n, amb=0.58, gain=0.52):
    return shade(c, amb + gain * max(0.0, dot(n, LIGHT)))


def edge_of(c):
    return shade(c, 0.42)


def hull(pts):
    pts = sorted(set((round(x, 4), round(y, 4)) for x, y in pts))
    if len(pts) < 3:
        return pts
    def cr(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo = []
    for p in pts:
        while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0:
            lo.pop()
        lo.append(p)
    up = []
    for p in reversed(pts):
        while len(up) >= 2 and cr(up[-2], up[-1], p) <= 0:
            up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]


class Scene:
    def __init__(s, zoom=1.0, W=900, H=900, ox=450, oy=560):
        s.W, s.H, s.ox, s.oy, s.z = W, H, ox, oy, zoom
        s.img = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
        s.d = ImageDraw.Draw(s.img)
        s.sh = Image.new('L', (W * S, H * S), 0)
        s.sd = ImageDraw.Draw(s.sh)

    def P(s, x, y, z=0.0):
        return ((s.ox + SX * s.z * (x - y)) * S, (s.oy + (SY * (x + y) - SZ * z) * s.z) * S)

    # ---------- primitives 2D projetees
    def poly(s, pts, fill, edge=None, w=1.0, alpha=255):
        p = [s.P(*q) for q in pts]
        lw = max(1, int(round(w * S)))
        if alpha >= 255:
            s.d.polygon(p, fill=tuple(fill) + (255,))
            if edge:
                s.d.line(p + [p[0]], fill=tuple(edge) + (255,), width=lw, joint='curve')
            return
        xs = [q[0] for q in p]; ys = [q[1] for q in p]
        x0, y0 = int(max(0, min(xs) - 4)), int(max(0, min(ys) - 4))
        x1, y1 = int(min(s.img.width, max(xs) + 5)), int(min(s.img.height, max(ys) + 5))
        if x1 <= x0 or y1 <= y0:
            return
        lay = Image.new('RGBA', (x1 - x0, y1 - y0), (0, 0, 0, 0))
        ld = ImageDraw.Draw(lay)
        q = [(a - x0, b - y0) for a, b in p]
        ld.polygon(q, fill=tuple(fill) + (alpha,))
        if edge:
            ld.line(q + [q[0]], fill=tuple(edge) + (min(255, alpha + 90),), width=lw, joint='curve')
        s.img.alpha_composite(lay, (x0, y0))

    def line(s, pts, color, w=1.0):
        p = [s.P(*q) for q in pts]
        s.d.line(p, fill=tuple(color) + (255,), width=max(1, int(round(w * S))), joint='curve')

    @contextmanager
    def clip(s, pts):
        saved = s.img
        s.img = Image.new('RGBA', saved.size, (0, 0, 0, 0)); s.d = ImageDraw.Draw(s.img)
        yield
        mask = Image.new('L', saved.size, 0)
        ImageDraw.Draw(mask).polygon([s.P(*q) for q in pts], fill=255)
        lay = s.img
        lay.putalpha(ImageChops.multiply(lay.getchannel('A'), mask))
        s.img = saved
        s.img.alpha_composite(lay)
        s.d = ImageDraw.Draw(s.img)

    # ---------- solides
    def box(s, x0, y0, z0, x1, y1, z1, c, faces='TLR', edge=True, ct=None):
        e = edge_of(c) if edge else None
        if 'R' in faces:
            s.poly([(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)], lit(c, (1, 0, 0)), e)
        if 'L' in faces:
            s.poly([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], lit(c, (0, 1, 0)), e)
        if 'T' in faces:
            s.poly([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], lit(ct or c, (0, 0, 1)), e)

    def prism(s, pts, z0, z1, c, edge=True, top=True, ct=None):
        n = len(pts)
        area = sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1] for i in range(n))
        sg = 1 if area > 0 else -1
        e = edge_of(c) if edge else None
        sides = []
        for i in range(n):
            p, q = pts[i], pts[(i + 1) % n]
            dx, dy = q[0] - p[0], q[1] - p[1]
            L = math.hypot(dx, dy) or 1
            nx, ny = sg * dy / L, -sg * dx / L
            if nx * VIEW[0] + ny * VIEW[1] > 1e-3:
                sides.append(((p[0] + q[0] + p[1] + q[1]), p, q, (nx, ny, 0)))
        for _, p, q, nn in sorted(sides, key=lambda t: t[0]):
            s.poly([(p[0], p[1], z0), (q[0], q[1], z0), (q[0], q[1], z1), (p[0], p[1], z1)], lit(c, nn), e)
        if top:
            s.poly([(p[0], p[1], z1) for p in pts], lit(ct or c, (0, 0, 1)), e)

    def rbox(s, cx, cy, lx, ly, ang, z0, z1, c, **kw):
        ca, sa = math.cos(ang), math.sin(ang)
        pts = [(cx + ca * a - sa * b, cy + sa * a + ca * b)
               for a, b in ((-lx / 2, -ly / 2), (lx / 2, -ly / 2), (lx / 2, ly / 2), (-lx / 2, ly / 2))]
        s.prism(pts, z0, z1, c, **kw)

    def beam(s, p0, p1, w, h=None, c=(200, 200, 200), side=None, edge=True):
        h = h or w
        p0 = np.array(p0, float); p1 = np.array(p1, float)
        a = p1 - p0; a /= (np.linalg.norm(a) or 1)
        if side is None:
            up = np.array([0, 0, 1.0])
            if abs(a[2]) > 0.95:
                up = np.array([1.0, 0, 0])
            sd = np.cross(a, up)
        else:
            sd = np.array(side, float); sd = sd - a * float(np.dot(sd, a))
        sd /= np.linalg.norm(sd)
        t = np.cross(sd, a); t /= np.linalg.norm(t)
        sg = ((-1, -1), (1, -1), (1, 1), (-1, 1))
        A = [p0 + sd * w * i + t * h * j for i, j in sg]
        B = [p1 + sd * w * i + t * h * j for i, j in sg]
        nrm = [-t, sd, t, -sd]
        e = edge_of(c) if edge else None
        for k in range(4):
            if float(np.dot(nrm[k], VIEW)) > 1e-3:
                s.poly([tuple(A[k]), tuple(A[(k + 1) % 4]), tuple(B[(k + 1) % 4]), tuple(B[k])], lit(c, nrm[k]), e)
        if float(np.dot(a, VIEW)) > 1e-3:
            s.poly([tuple(q) for q in B], lit(c, a), e)
        elif float(np.dot(-a, VIEW)) > 1e-3:
            s.poly([tuple(q) for q in A], lit(c, -a), e)

    def cyl(s, c0, axis, length, r, c, spec=0.0, r1=None, edge=True, rings=(), ringc=None,
            hole=0.0, capc=None, N=48):
        a, u, v = {'z': ((0, 0, 1), (1, 0, 0), (0, 1, 0)),
                   'x': ((1, 0, 0), (0, 1, 0), (0, 0, 1)),
                   'y': ((0, 1, 0), (0, 0, 1), (1, 0, 0))}[axis]
        a, u, v = np.array(a, float), np.array(u, float), np.array(v, float)
        c0 = np.array(c0, float)
        r1 = r if r1 is None else r1

        def pt(t, sv, rr=None):
            rad = (r + (r1 - r) * sv) if rr is None else rr
            return tuple(c0 + a * length * sv + rad * (math.cos(t) * u + math.sin(t) * v))
        ts = [2 * math.pi * i / N for i in range(N + 1)]
        vis = []
        hmax = math.sqrt(max(1e-6, 1 - float(np.dot(a, HALF)) ** 2))
        for i in range(N):
            tm = (ts[i] + ts[i + 1]) / 2
            n = math.cos(tm) * u + math.sin(tm) * v
            ok = float(np.dot(n, VIEW)) > 0
            vis.append(ok)
            if ok:
                col = lit(c, n)
                if spec:
                    sp = max(0.0, float(np.dot(n, HALF)) / hmax) ** 14 * spec
                    sp += 0.35 * spec * max(0.0, float(np.dot(n, HALF)) / hmax) ** 3
                    col = mix(col, (255, 255, 255), min(0.9, sp))
                s.poly([pt(ts[i], 0), pt(ts[i + 1], 0), pt(ts[i + 1], 1), pt(ts[i], 1)], col, col, 0.34)
        e = edge_of(c)
        cap_s = 1 if float(np.dot(a, VIEW)) > 0 else 0
        far_s = 1 - cap_s
        for sv in rings:
            for i in range(N):
                if vis[i]:
                    s.line([pt(ts[i], sv), pt(ts[i + 1], sv)], ringc or e, 0.8)
        if edge:
            for i in range(N):
                if vis[i]:
                    s.line([pt(ts[i], far_s), pt(ts[i + 1], far_s)], e, 1.0)
                    if not vis[i - 1]:
                        s.line([pt(ts[i], 0), pt(ts[i], 1)], e, 1.0)
                    if not vis[(i + 1) % N]:
                        s.line([pt(ts[i + 1], 0), pt(ts[i + 1], 1)], e, 1.0)
        capn = a if cap_s == 1 else -a
        s.poly([pt(t, cap_s) for t in ts[:-1]], lit(capc or c, capn), e if edge else None)
        if hole:
            s.poly([pt(t, cap_s, hole) for t in ts[:-1]], shade(c, 0.22), e)

    def disk(s, cx, cy, z, r, c, edge=True, ry=None, alpha=255):
        ry = ry or r
        pts = [(cx + r * math.cos(t), cy + ry * math.sin(t), z) for t in np.linspace(0, 2 * math.pi, 40, endpoint=False)]
        s.poly(pts, lit(c, (0, 0, 1)), edge_of(c) if edge else None, alpha=alpha)

    def sphere(s, c, R, color, tex=0.0, seed=0, cutz=None, cutr=None, spec=0.15, edge=True):
        cx, cy = s.P(*c)
        r = R * MPX * S * s.z
        x0, y0 = int(cx - r - 3), int(cy - r - 3)
        w = int(2 * r + 7)
        ys, xs = np.mgrid[0:w, 0:w].astype(float)
        ax, ay = xs + x0 + 0.5, ys + y0 + 0.5
        dx, dy = (ax - cx) / r, (ay - cy) / r
        rr = dx * dx + dy * dy
        m = rr <= 1.0
        nz = np.sqrt(np.clip(1 - rr, 0, 1))
        L = np.array([-0.52, -0.62, 0.58]); L /= np.linalg.norm(L)
        lam = np.clip(dx * L[0] + dy * L[1] + nz * L[2], 0, 1)
        f = 0.50 + 0.62 * lam
        if tex:
            rng = np.random.default_rng(seed)
            for div, amp in ((7, 1.0), (3, 0.7)):
                g = max(3, int(w / (div * S)) + 2)
                nimg = Image.fromarray((rng.random((g, g)) * 255).astype('uint8')).resize((w, w), Image.BICUBIC)
                f = f * (1 + tex * amp * (np.asarray(nimg, float) / 255 - 0.5))
        Hh = L + np.array([0, 0, 1.0]); Hh /= np.linalg.norm(Hh)
        sp = np.clip(dx * Hh[0] + dy * Hh[1] + nz * Hh[2], 0, 1) ** 24 * spec
        base = np.array(color, float)
        cool = np.array([10, 16, 38]) * 0.6
        col = base[None, None, :] * f[..., None] + (1 - f)[..., None] * cool
        col = col * (1 - sp[..., None]) + 255 * sp[..., None]
        if cutz is not None:
            ecx, ecy = s.P(c[0], c[1], cutz)
            erx = cutr * MPX * S * s.z; ery = erx * 0.5
            t = np.clip(1 - ((ax - ecx) / erx) ** 2, 0, 1)
            lim = ecy + ery * np.sqrt(t)
            m = m & (ay < lim)
        mi = Image.fromarray((m * 255).astype('uint8'))
        if edge:
            er = mi.filter(ImageFilter.MinFilter(2 * (S // 2 + 1) + 1))
            em = (np.asarray(mi) > 0) & (np.asarray(er) == 0)
            col[em] = np.array(shade(color, 0.42))
        arr = np.dstack([np.clip(col, 0, 255).astype('uint8'), (m * 255).astype('uint8')])
        patch = Image.fromarray(arr, 'RGBA')
        dx0, dy0 = max(0, x0), max(0, y0)
        patch = patch.crop((dx0 - x0, dy0 - y0, w, w))
        s.img.alpha_composite(patch, (dx0, dy0))

    # ---------- ombres (calque separe)
    def sh_pts(s, pts3, k=SHK):
        g = [(x, y) for x, y, z in pts3] + [(x + k * z, y - 0.06 * z) for x, y, z in pts3]
        h = hull(g)
        if len(h) >= 3:
            s.sd.polygon([s.P(x, y, 0) for x, y in h], fill=255)

    def sh_box(s, x0, y0, x1, y1, h, z0=0.0):
        s.sh_pts([(x, y, z) for x in (x0, x1) for y in (y0, y1) for z in (z0, h)])

    def sh_disk(s, cx, cy, r, h, z0=0.0):
        s.sh_pts([(cx + r * math.cos(t), cy + r * math.sin(t), z) for t in np.linspace(0, 6.283, 24) for z in (z0, h)])


def downsample(sc):
    spr = sc.img.resize((sc.W, sc.H), Image.LANCZOS)
    sh = sc.sh.filter(ImageFilter.GaussianBlur(S * 2.2)).resize((sc.W, sc.H), Image.LANCZOS)
    a = (np.asarray(sh, float) * 0.42).astype('uint8')
    z = np.zeros_like(a)
    shadow = Image.fromarray(np.dstack([z, z, z, a]), 'RGBA')
    return spr, shadow


def finalize(sc, mode, W=256, margin=14):
    """mode 'free': ancre = milieu du bas de l'objet ; 'tile': cadre de tuile 256 px, ancre = coin avant de la tuile."""
    spr, shadow = downsample(sc)
    a = np.asarray(spr)[..., 3]
    ys, xs = np.where(a > 12)
    bx0, bx1, by0, by1 = xs.min(), xs.max(), ys.min(), ys.max()
    if mode == 'tile':
        x0 = sc.ox - 128; y1 = sc.oy + 128; y0 = min(by0 - 3, sc.oy)
        W = 256
        anchor = (128, y1 - y0)
        if bx0 < x0 or bx1 >= x0 + W or by1 >= y1:
            print('   ! depasse le cadre de tuile', bx0 - x0, bx1 - x0, by1 - y1)
    else:
        sa = np.asarray(shadow)[..., 3]
        sy_, sx_ = np.where(sa > 6)
        ux0, ux1 = min(bx0, sx_.min()), max(bx1, sx_.max())
        uy1 = max(by1, sy_.max())
        x0 = int(round((ux0 + ux1 + 1) / 2)) - W // 2; y0 = by0 - 3; y1 = uy1 + 3
        anchor = (int(round((bx0 + bx1) / 2)) - x0, by1 + 1 - y0)
        finalize.width = ux1 - ux0 + 1
    box = (int(x0), int(y0), int(x0 + W), int(y1))
    return spr.crop(box), shadow.crop(box), anchor
