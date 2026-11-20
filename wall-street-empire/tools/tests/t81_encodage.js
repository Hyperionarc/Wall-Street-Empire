// Passe 78 : qualité d'encodage des sprites de la phase 2 (Rémy : « les toits s'effondrent comme du sucre qui a reçu de l'eau »).
// 8 sprites à grands toits plats sont rendus EN JEU (fonction de dessin du jeu, zoom 1,5 et 2,5, bâtiment isolé) avec l'image embarquée dans city.html, puis
// avec la source PNG pleine définition (même calage) ; écart mesuré sur les pixels opaques : SSIM (luminance, fenêtre 7×7), PSNR, et « taches » = part des
// pixels des zones lisses de la référence (écart type local < 3) dont l'erreur dépasse 6 niveaux (paliers, taches de palette). Contrôle : l'ancien encodage
// (×0,5 + palette 256 couleurs FASTOCTREE sans tramage), reproduit par python3/PIL, doit, lui, dépasser le seuil (le test sait voir l'artefact).
exports.name = 'Encodage des sprites (grands toits)';
const path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const SPR = { bat_supermarche_n2: [2, 2], bat_hypermarche_n2: [3, 3], bat_hypermarche_n3: [3, 3], usine_moyenne_f2: [2, 1], usine_grande_f3: [2, 2], entrepot: [1, 1], mega_centre_commercial: [2, 2], terminal_portuaire: [2, 2] };
const PY = `
import sys, json, io, os, base64, re
from PIL import Image
root, names = sys.argv[1], json.loads(sys.argv[2])
src = open(os.path.join(root, 'wall-street-empire', 'tools', 'build.py')).read()
flip = set(re.findall(r"'([a-z0-9_]+)'", re.search(r'P2_FLIP = \\{([^}]*)\\}', src).group(1)))
D = [os.path.join(root, 'wall-street-empire', 'assets', 'phase2_hd'), os.path.join(root, 'assets', 'phase2_hd'), os.path.join(root, 'assets', 'factory_hd')]
uri = lambda im, f='PNG': 'data:image/png;base64,' + base64.b64encode((lambda b: (im.save(b, f), b.getvalue())[1])(io.BytesIO())).decode()
out = {}
for n in names:
    f = next(os.path.join(d, n + '.png') for d in D if os.path.exists(os.path.join(d, n + '.png')))
    im = Image.open(f).convert('RGBA')
    if n in flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    old = im.resize((im.width // 2, im.height // 2), Image.LANCZOS).quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE)
    out[n] = {'src': uri(im), 'old': uri(old)}
print(json.dumps(out))
`;

function pageRender(o) {   // rend n avec l'image donnée (null = embarquée) à l'échelle s ; renvoie RGBA recadré sur le cadre box (calculé au 1er rendu)
  return (async () => {
    const W = window.WSE, A = W.audit, P = W.p2.img, TW = A.TW, TH = A.TH, e = P[o.n]; if (!e || !e.ok) return null;
    const orig = e.im; let im = orig; if (o.uri) { im = new Image(); im.src = o.uri; await im.decode(); }
    e.im = im; const [w, h] = o.fp, ax = 20, ay = 20, q = A.iso(ax + (w - 1) / 2, ay + (h - 1) / 2), c = { x: q.x, y: q.y + TH / 2 };
    const x0 = c.x - (w + h) * TW / 2 - 40, x1 = c.x + (w + h) * TW / 2 + 40, y0 = c.y - 900, y1 = c.y + (w + h) * TH / 2 + 40, s = o.s;
    const cv = document.createElement('canvas'); cv.width = Math.ceil((x1 - x0) * s); cv.height = Math.ceil((y1 - y0) * s);
    const g = cv.getContext('2d', { willReadFrequently: true }); g.setTransform(s, 0, 0, s, -x0 * s, -y0 * s); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    try { W.gfx.use(g, () => W.gfx.drawFlat(o.n, A.iso(ax + w - 1, ay + h - 1), Math.min(w, h), c, [w, h])); } finally { e.im = orig; }
    const d = g.getImageData(0, 0, cv.width, cv.height).data; let b = o.box;
    if (!b) { let a = 1e9, bb = 1e9, ee = -1, ff = -1; for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 8) { if (x < a) a = x; if (x > ee) ee = x; if (y < bb) bb = y; if (y > ff) ff = y; } b = [a, bb, ee + 1, ff + 1]; }
    const W2 = b[2] - b[0], H2 = b[3] - b[1], px = new Array(W2 * H2 * 4);
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) for (let k = 0; k < 4; k++) px[(y * W2 + x) * 4 + k] = d[((y + b[1]) * cv.width + x + b[0]) * 4 + k];
    return { box: b, w: W2, h: H2, px };
  })();
}
function compare(R, I) {   // métriques (référence R, image I) : mêmes dimensions
  const w = R.w, h = R.h, n = w * h, lr = new Float64Array(n), li = new Float64Array(n), m = new Uint8Array(n), err = new Float64Array(n); let se = 0, cnt = 0;
  for (let i = 0; i < n; i++) { const a = R.px, b = I.px, j = i * 4; m[i] = a[j + 3] > 200 && b[j + 3] > 200 ? 1 : 0; lr[i] = 0.299 * a[j] + 0.587 * a[j + 1] + 0.114 * a[j + 2]; li[i] = 0.299 * b[j] + 0.587 * b[j + 1] + 0.114 * b[j + 2];
    if (m[i]) { let mx = 0; for (let k = 0; k < 3; k++) { const dd = a[j + k] - b[j + k]; se += dd * dd; mx = Math.max(mx, Math.abs(dd)); } err[i] = mx; cnt++; } }
  const r = 3, C1 = (0.01 * 255) ** 2, C2 = (0.03 * 255) ** 2; let ss = 0, sn = 0, sm = 0, tach = 0;
  for (let y = r; y < h - r; y++) for (let x = r; x < w - r; x++) {
    let full = 1, s1 = 0, s2 = 0, q1 = 0, q2 = 0, x12 = 0;
    for (let dy = -r; dy <= r && full; dy++) for (let dx = -r; dx <= r; dx++) { const i = (y + dy) * w + x + dx; if (!m[i]) { full = 0; break; } s1 += lr[i]; s2 += li[i]; q1 += lr[i] * lr[i]; q2 += li[i] * li[i]; x12 += lr[i] * li[i]; }
    if (!full) continue; const N = 49, m1 = s1 / N, m2 = s2 / N, v1 = q1 / N - m1 * m1, v2 = q2 / N - m2 * m2, cv = x12 / N - m1 * m2;
    ss += ((2 * m1 * m2 + C1) * (2 * cv + C2)) / ((m1 * m1 + m2 * m2 + C1) * (v1 + v2 + C2)); sn++;
    if (Math.sqrt(Math.max(v1, 0)) < 3) { sm++; if (err[y * w + x] > 6) tach++; }
  }
  return { psnr: +(10 * Math.log10(255 * 255 / Math.max(1e-9, se / Math.max(1, cnt * 3)))).toFixed(2), ssim: +(ss / Math.max(1, sn)).toFixed(4), taches: +(sm > 50 ? tach / sm * 100 : 0).toFixed(2) };
}

exports.run = async (t, L) => {
  const V = JSON.parse(execFileSync('python3', ['-c', PY, ROOT, JSON.stringify(Object.keys(SPR))], { maxBuffer: 1 << 28 }).toString());
  const pg = await L.newPage({ wait: 3000 }); await L.setup(pg);
  const enc = await pg.evaluate(n => n.map(k => (window.WSE.p2.img[k] && window.WSE.p2.img[k].im.src || '').slice(0, 15)), Object.keys(SPR));
  t.check('sprites de la phase 2 embarqués en WebP (plus de palette 256 couleurs)', enc.every(s => s === 'data:image/webp'), enc.join(','));
  const rows = [];
  for (const n of Object.keys(SPR)) for (const s of [1.5, 2.5]) {
    const R = await pg.evaluate(pageRender, { n, fp: SPR[n], s, uri: V[n].src, box: null }); if (!R) { rows.push({ n, s, miss: 1 }); continue; }
    const C = await pg.evaluate(pageRender, { n, fp: SPR[n], s, uri: null, box: R.box }), O = await pg.evaluate(pageRender, { n, fp: SPR[n], s, uri: V[n].old, box: R.box });
    rows.push({ n, s, cur: compare(R, C), old: compare(R, O) });
  }
  const ok = rows.filter(r => !r.miss);
  t.check('les 8 sprites à grands toits sont rendus en jeu (zoom 1,5 et 2,5)', ok.length === 16, rows.filter(r => r.miss).map(r => r.n).join(','));
  const badT = ok.filter(r => r.cur.taches > 2.5), badS = ok.filter(r => r.cur.ssim < 0.96);
  t.check('rendu en jeu ≈ source : taches (zones lisses s\'écartant de plus de 6 niveaux) ≤ 2,5 % sur chaque sprite et chaque zoom', !badT.length, badT.map(r => `${r.n}@${r.s} ${r.cur.taches}%`).join(', '));
  t.check('rendu en jeu ≈ source : SSIM ≥ 0,96 sur chaque sprite et chaque zoom', !badS.length, badS.map(r => `${r.n}@${r.s} ${r.cur.ssim}`).join(', '));
  const avg = (k, f) => ok.reduce((a, r) => a + r[k][f], 0) / ok.length;
  t.check('contrôle : l\'ancien encodage (×0,5 + 256 couleurs) laisse nettement plus de taches que le nouveau (au moins 3 fois, et > 3 % en moyenne)', avg('old', 'taches') > 3 && avg('old', 'taches') >= 3 * avg('cur', 'taches'), `ancien ${avg('old', 'taches').toFixed(2)} % · nouveau ${avg('cur', 'taches').toFixed(2)} % · SSIM ${avg('old', 'ssim').toFixed(4)} → ${avg('cur', 'ssim').toFixed(4)}`);
  ok.forEach(r => t.info(`${r.n}@${r.s} : nouveau PSNR ${r.cur.psnr} SSIM ${r.cur.ssim} taches ${r.cur.taches}% | ancien PSNR ${r.old.psnr} SSIM ${r.old.ssim} taches ${r.old.taches}%`));
  const kb = require('fs').statSync(path.resolve(__dirname, '..', '..', 'city.html')).size / 1048576;
  t.check('poids de city.html raisonnable (≤ 25 Mo)', kb <= 25, kb.toFixed(1) + ' Mo');
  t.check('0 erreur de page', !pg.errs.length, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
