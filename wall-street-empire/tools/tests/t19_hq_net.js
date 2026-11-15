// Siège social (HQ) : sprite net, opaque, bien posé. Régression « siège flou / transparent » (passe 23 : aplats + quantification).
exports.name = 'Siège social : sprite net et opaque';

// Mesure sur le canevas de la carte (#view) : zone du corps du bâtiment au-dessus de la case avant du siège.
const BODY = `(() => {
  const W = window.WSE, cv = document.getElementById('view'), g = cv.getContext('2d'), k = cv.width / cv.getBoundingClientRect().width;
  const q = W.tileToScreen(window.__hq.x + 1, window.__hq.y + 1), q2 = W.tileToScreen(window.__hq.x + 2, window.__hq.y + 1), z = Math.abs(q2.x - q.x) / 66, r = cv.getBoundingClientRect();
  const x0 = Math.round((q.x - r.left - 36 * z) * k), x1 = Math.round((q.x - r.left + 36 * z) * k), y0 = Math.round((q.y - r.top - 230 * z) * k), y1 = Math.round((q.y - r.top - 70 * z) * k);
  const w = x1 - x0, h = y1 - y0, d = g.getImageData(x0, y0, w, h).data; return { w, h, d: Array.from(d), z, k, inside: x0 >= 0 && y0 >= 0 && x1 <= cv.width && y1 <= cv.height };
})()`;
const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

exports.run = async (t, L) => {
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const pg = await L.newPage({ ctx, wait: 800 }); await L.setup(pg, {}); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint{display:none!important}' });

  // 1. PNG embarqué : opaque sur son masque (la passe 23 le rendait translucide / bruité sur ses bords)
  const png = await pg.evaluate(async () => {
    const m = window.WSE.hq && window.WSE.hq.mid; if (!m) return null;
    const im = new Image(); im.src = m.src; await im.decode();
    const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data; let n = 0, s = 0, full = 0, g = 0, gn = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) { n++; s += d[i]; if (d[i] === 255) full++; }
    for (let y = 1; y < c.height - 1; y++) for (let xx = 1; xx < c.width - 1; xx++) { const i = (y * c.width + xx) * 4; if (d[i + 3] < 255) continue; const j = i + 4, l = a => 0.299 * d[a] + 0.587 * d[a + 1] + 0.114 * d[a + 2]; if (d[j + 3] < 255) continue; g += Math.abs(l(i) - l(j)); gn++; }
    return { w: c.width, h: c.height, meanA: s / n, fullFrac: full / n, grad: g / gn };
  });
  t.check('le PNG du siège est embarqué et lisible', !!png && png.w >= 400, JSON.stringify(png));
  t.check('PNG du siège : alpha moyen sur le masque >= 250 et >= 95 % des pixels du masque à alpha 255', png && png.meanA >= 250 && png.fullFrac >= 0.95, png && `${png.meanA.toFixed(1)} · ${(png.fullFrac * 100).toFixed(1)} %`);
  t.check('PNG du siège : détail conservé (gradient horizontal moyen >= 6)', png && png.grad >= 6, png && png.grad.toFixed(2));

  // 2. En jeu : on cherche un emplacement 2x2, on centre, on relève le fond, on construit, on relit
  const spot = await pg.evaluate(() => { const W = window.WSE, N = W.N; for (let y = 42; y >= 16; y--) for (let x = 42; x >= 16; x--) if (!W.footprintError(x, y, 'hq')) return { x, y }; return null; });
  t.check('un emplacement 2x2 est disponible pour le siège', !!spot);
  await pg.evaluate(s => { window.__hq = s; WSE.centerOn(s.x + 1, s.y + 1); }, spot);
  for (let i = 0; i < 2; i++) { await pg.click('#zin'); await pg.waitForTimeout(450); }
  await pg.evaluate(s => { WSE.centerOn(s.x + 1, s.y + 1); }, spot); await pg.waitForTimeout(500);
  const base = await pg.evaluate(BODY);
  const ok = await pg.evaluate(s => !!window.T.put('hq', s.x, s.x + 1, s.y, s.y + 1), spot);
  t.check('le siège se construit', ok);
  await pg.evaluate(s => { WSE.centerOn(s.x + 1, s.y + 1); WSE.S.cash = 5e9; }, spot); await pg.waitForTimeout(1500);
  const cur = await pg.evaluate(BODY); const hq = await pg.evaluate(s => { const c = WSE.S.grid[s.y * WSE.N + s.x]; return c && { t: c.t, conn: !!c.conn, a: c._top }; }, spot);
  t.check('la zone mesurée est dans le canevas et le siège existe', base.inside && hq && hq.t === 'hq', JSON.stringify({ inside: base.inside, hq }));
  const n = cur.w * cur.h; let diff = 0, gs = 0, gn = 0, vs = 0, mean = 0;
  for (let p = 0; p < n; p++) { const i = p * 4; if (Math.abs(cur.d[i] - base.d[i]) + Math.abs(cur.d[i + 1] - base.d[i + 1]) + Math.abs(cur.d[i + 2] - base.d[i + 2]) > 24) diff++; mean += lum(cur.d, i); }
  mean /= n;
  for (let y = 0; y < cur.h; y++) for (let x = 0; x < cur.w - 1; x++) { const i = (y * cur.w + x) * 4; gs += Math.abs(lum(cur.d, i) - lum(cur.d, i + 4)); gn++; const l = lum(cur.d, i) - mean; vs += l * l; }
  const grad = gs / gn, sd = Math.sqrt(vs / n);
  t.info(`corps du siège : ${(diff / n * 100).toFixed(1)} % de pixels masquant le fond, gradient ${grad.toFixed(2)}, écart-type luma ${sd.toFixed(1)}`);
  t.check('le corps du siège est opaque : >= 97 % des pixels diffèrent du fond d\'origine', diff / n >= 0.97, (diff / n * 100).toFixed(1) + ' %');
  t.check('le siège est net : gradient horizontal de luminance >= 5 (flou/aplats < 3)', grad >= 5, grad.toFixed(2));
  t.check('le siège a du relief (écart-type de luminance >= 18)', sd >= 18, sd.toFixed(1));

  // 3. L'alpha global ne fuit pas : après le dessin du siège, le contexte est repassé à 1
  const ga = await pg.evaluate(() => document.getElementById('view').getContext('2d').globalAlpha);
  t.check('globalAlpha du contexte de la carte revenu à 1 après le rendu', ga === 1, String(ga));
  t.check('aucune erreur de page (siège)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await b.close();
};
