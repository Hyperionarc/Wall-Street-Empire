#!/usr/bin/env node
// Audit de cohérence esthétique des bâtiments (responsable de la cohérence esthétique, docs/STYLE_BATIMENTS.md).
// Chaque bâtiment affichable (joueur à plusieurs niveaux, équipements publics, services de quartier, chaque sprite réellement dessiné par la ville au démarrage,
// mall, aéroport, stations) est rendu SEUL dans un canevas hors écran (drawImage instrumenté) à l'échelle du zoom proche, puis mesuré :
//   - rendu : sprite HD (nom), atlas Kenney ou repli vectoriel (dessin du code) ;
//   - définition : px source par px écran en vue rapprochée (zoom 1,4 × dpr 2) ; < 0,6 = image agrandie plus de 1,7 fois, floue (sous-définition) ;
//   - calage : débordement de la silhouette hors de la colonne de l'emprise (% de largeur), remplissage de l'emprise (largeur de la silhouette / largeur du losange),
//     écart vertical entre le bas de la silhouette et le sommet avant du losange (en fraction de TH) ;
//   - détail : densité d'arêtes (part des pixels opaques à fort gradient de luminance) et part d'aplats (blocs 6 × 6 sans variation) : « aplat sans détail » si
//     densité d’arêtes < 0,1 ET aplats > 0,55 (prisme lisse, cube jouet) ;
//   - charte : part de pixels vifs (S > 0,6, V > 0,45, hors teintes de terre 5-45° : brique, tuile, bois) ; la charte tolère 15 % (une seule couleur vive) ;
//   - échelle : hauteur dessinée par étage des immeubles de la ville (écart à la médiane > 45 % = hors échelle).
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/audit_esthetique.js [--md]   (--md : écrit docs/AUDIT_ESTHETIQUE.md et les vignettes des cas critiques
//   dans docs/audit_esthetique/) ; WSE_URL pour auditer un autre city.html. Module : require('./audit_esthetique.js').audit(page) -> { rows, scale } (tests/t125_esthetique.js).
const fs = require('fs'), path = require('path');
const DOCS = path.resolve(__dirname, '..', 'docs');

const PAGE = (opt) => {
  const W = window.WSE, G = W.gfx, S = W.S, N = W.N, now = 1000, TW = 132, TH = 66, ZREF = 1.4 * 2, K = 2;   // K : échelle de rendu (zoom 1 en dpr 2)
  const nm = new Map(), dimOf = {};
  Object.keys(G.P2_IMG).forEach(n => { const e = G.P2_IMG[n]; if (e && e.im) { nm.set(e.im, n); const d = G.P2DIM[n]; if (d) dimOf[n] = d; } });
  Object.keys(G.CITY_IMG).forEach(n => { nm.set(G.CITY_IMG[n].im, 'city:' + n); });
  Object.keys(G.FAC_IMG || {}).forEach(n => { const e = G.FAC_IMG[n]; if (e && e.im) nm.set(e.im, 'fac:' + n); });
  Object.keys(G.HQ_IMG || {}).forEach(n => { const e = G.HQ_IMG[n]; if (e && e.img) nm.set(e.img, 'hq:' + n); });
  const P = CanvasRenderingContext2D.prototype, rows = [], thumbs = {};
  function render(fn, foot) {   // foot = { x, y, w, h } emprise en cases ; renvoie pixels + instrumentation
    const L = G.iso(foot.x, foot.y + foot.h), R = G.iso(foot.x + foot.w, foot.y), T = G.iso(foot.x, foot.y), Bt = G.iso(foot.x + foot.w, foot.y + foot.h);
    const span = (R.x - L.x) * K, cw = Math.ceil(span + 120), ch = Math.ceil(span * 1.9 + 120), ox = cw / 2 - (L.x + R.x) / 2 * K, oy = ch - 40 - Bt.y * K;
    const c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d', { willReadFrequently: true });
    const st = { names: {}, atlas: 0, ops: 0, srcScale: [] };
    g.drawImage = function (s, ...a) { const n = nm.get(s); if (n) { st.names[n] = 1; const dw = a.length >= 8 ? a[6] : a[2], sw = a.length >= 8 ? a[2] : (s.naturalWidth || s.width); if (dw > 0 && sw > 0) { const m = g.getTransform(); st.srcScale.push([n, sw / (dw * m.a), dw * m.a]); } }
      else if (s === G.ATLAS) st.atlas++; else if (s instanceof HTMLCanvasElement && s._hd) st.names[s._hd + ' (dérivé)'] = 1; return P.drawImage.call(this, s, ...a); };
    ['fill', 'stroke', 'fillRect'].forEach(k => { g[k] = function (...a) { st.ops++; return P[k].apply(this, a); }; });
    g.setTransform(K, 0, 0, K, ox, oy); let err = null; try { G.use(g, fn); } catch (e) { err = (e && e.message) || String(e); }
    g.setTransform(1, 0, 0, 1, 0, 0);
    const img = g.getImageData(0, 0, cw, ch), d = img.data, X = v => v * K + ox, Y = v => v * K + oy;
    return { c, g, d, cw, ch, st, err, dia: { l: X(L.x), r: X(R.x), t: Y(T.y), b: Y(Bt.y), bx: X(Bt.x), ly: Y(L.y), ry: Y(R.y), cx: X((L.x + R.x) / 2), cy: Y((T.y + Bt.y) / 2) } };
  }
  function measure(A) {
    const { d, cw, ch, dia } = A; let n = 0, edge = 0, sat = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const Lum = new Float32Array(cw * ch);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) { if (d[i + 3] < 200) { Lum[p] = -1; continue; } const r = d[i], g = d[i + 1], b = d[i + 2]; Lum[p] = 0.299 * r + 0.587 * g + 0.114 * b; n++;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx > 115 && (mx - mn) / mx > 0.6) { const hu = mx === r ? ((g - b) / (mx - mn) * 60 + 360) % 360 : mx === g ? (b - r) / (mx - mn) * 60 + 120 : (r - g) / (mx - mn) * 60 + 240; if (!(hu >= 5 && hu <= 45 && mx < 230)) sat++; /* vif hors teintes de terre (brique, tuile, bois) */ } const x = p % cw, y = (p / cw) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    for (let y = 1; y < ch - 1; y++) for (let x = 1; x < cw - 1; x++) { const p = y * cw + x; if (Lum[p] < 0 || Lum[p + 1] < 0 || Lum[p + cw] < 0) continue; if (Math.abs(Lum[p + 1] - Lum[p]) + Math.abs(Lum[p + cw] - Lum[p]) > 14) edge++; }
    let blk = 0, flat = 0; const B = 6;
    for (let by = 0; by + B <= ch; by += B) for (let bx = 0; bx + B <= cw; bx += B) { let s = 0, s2 = 0, ok = true; for (let j = 0; j < B && ok; j++) for (let i = 0; i < B; i++) { const v = Lum[(by + j) * cw + bx + i]; if (v < 0) { ok = false; break; } s += v; s2 += v * v; }
      if (!ok) continue; blk++; const m = s / (B * B); if (s2 / (B * B) - m * m < 2.5) flat++; }
    // calage : colonne de l'emprise (losange prolongé vers le haut), bas de la silhouette au droit du sommet avant
    const hw = (dia.r - dia.l) / 2; let over = 0, colB = -1; for (let p = 0; p < cw * ch; p++) { if (Lum[p] < 0) continue; const x = p % cw, y = (p / cw) | 0, dx = Math.abs(x - dia.cx);
      if (dx > hw + 2) over++; else { const eb = x < dia.bx ? dia.ly + (dia.b - dia.ly) * (x - dia.l) / Math.max(1, dia.bx - dia.l) : dia.b + (dia.ry - dia.b) * (x - dia.bx) / Math.max(1, dia.r - dia.bx); if (y > eb + 0.12 * TH * K + 4) over++; } }
    for (let y = ch - 1; y >= 0 && colB < 0; y--) for (let x = Math.round(dia.bx) - 3; x <= Math.round(dia.bx) + 3; x++) if (Lum[y * cw + x] >= 0) { colB = y; break; }
    const hgt = n ? (dia.b - y0) / K : 0;
    return { px: n, edge: n ? +(edge / n).toFixed(3) : 0, flat: blk ? +(flat / blk).toFixed(2) : 0, sat: n ? +(sat / n).toFixed(3) : 0, over: n ? +(over / n).toFixed(3) : 0,
      fill: n ? +((x1 - x0 + 1) / (dia.r - dia.l)).toFixed(2) : 0, dyB: colB >= 0 ? +((colB - dia.b) / (TH * K)).toFixed(2) : null, h: +hgt.toFixed(0) };
  }
  function probe(fam, id, label, fn, foot, extra) {
    const A = render(fn, foot), M = measure(A), st = A.st, names = Object.keys(st.names), big = names.filter(n => !/^(veh_|voiture_|camion|poses\/|animal_|fermier|arbre|buisson|fac:|vendang|vigneron)/.test(n));
    const mode = A.err ? 'erreur' : !M.px ? 'invisible' : big.length ? 'HD' : st.atlas ? 'atlas Kenney' : 'VECTORIEL';
    const sc = st.srcScale.filter(s => big.includes(s[0]) && s[2] > 40), def = sc.length ? +Math.min(...sc.map(s => s[1] * K / ZREF)).toFixed(2) : null;   // px source par px écran au zoom proche
    const r = Object.assign({ fam, id, label, mode, spr: big.join(', '), def, err: A.err, w: foot.w, h: foot.h }, M, extra || {});
    r.aplat = M.px > 400 && M.edge < 0.1 && M.flat > 0.55; r.flou = def != null && def < 0.6; r.cale = M.over > 0.06 || (M.dyB != null && Math.abs(M.dyB) > 0.3) || (M.fill < 0.55 && foot.w * foot.h === 1 && !/park|parc/.test(id)); r.sature = M.sat > 0.15;
    r.critique = mode === 'VECTORIEL' || mode === 'atlas Kenney' || r.aplat || r.flou || r.cale || mode === 'erreur'; r.surveiller = !r.critique && r.sature;   // couleurs vives : à surveiller (verre bleuté, champ de colza, bois rouge scandinave sont réalistes)
    if ((r.critique || opt.all) && opt.thumbs) { const g = A.g, D = A.dia; g.strokeStyle = 'rgba(255,0,80,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(D.l, D.ly); g.lineTo(D.bx, D.b); g.lineTo(D.r, D.ry); g.stroke(); thumbs[id] = A.c.toDataURL('image/png'); }
    rows.push(r); return r;
  }
  const tiles = (a, w, h, x0, y0) => () => { for (let s = 0; s <= w + h - 2; s++) for (let ox = 0; ox < w; ox++) { const oy = s - ox; if (oy < 0 || oy >= h) continue; G.tile(a, x0 + ox, y0 + oy, ox, oy, { now }); } if (a.t !== 'npc') G.overlay(a, { now }); };
  const X0 = 40, Y0 = 40;
  // 1. bâtiments du joueur (niveaux 0, 2, 4 pour ceux qui changent d'image)
  const LV = { s1: 1, s2: 1, s3: 1, s4: 1, res: 1, hq: 1, tech: 1, bank: 1, off: 1, mcopper: 1, dc: 1 }, SKIP = { road: 1, npc: 1, part: 1, cable: 1, pipeline: 1 };
  Object.keys(W.TYPES).forEach(k => { if (SKIP[k]) return; (LV[k] ? [0, 2, 4] : [0]).forEach(lv => {
    let a; try { a = G.mkCell(k, 0.37); } catch (e) { return; } a.x = X0; a.y = Y0; a.born = null; a.conn = true; a.lvl = lv; if (k === 'dc') a.lg = lv >= 2; if (k === 'res') a.floors = [1, 4, 14][lv / 2];
    probe('Bâtiments du joueur', k + (LV[k] ? ':n' + lv : ''), W.TYPES[k].name + (LV[k] ? ' (niveau ' + lv + ')' : ''), tiles(a, a.w, a.h, X0, Y0), { x: X0, y: Y0, w: a.w, h: a.h }); }); });
  // 2. équipements publics à la taille du barème
  const FP = (W.fp && W.fp.MON_FP) || {};
  ['hospital', 'lycee', 'college', 'maternelle', 'garderie', 'police', 'fire', 'hall', 'telecom', 'stadium', 'stadium2'].forEach(m => {
    const f = FP[m] || [1, 1], a = { t: 'npc', k: 'mon', m, seed: 0.37, floors: 2, lvl: 0, w: 1, h: 1, x: X0, y: Y0, conn: true }; if (f[0] * f[1] > 1) Object.assign(a, { mx: X0, my: Y0, mw: f[0], mh: f[1] });
    probe('Équipements publics', 'mon:' + m, (W.PUB && W.PUB[m] ? W.PUB[m][0] : m), tiles(a, f[0], f[1], X0, Y0), { x: X0, y: Y0, w: f[0], h: f[1] }); });
  // 3. services de quartier (sprite propre au service)
  Object.keys(W.vv.SVC).forEach(n => { const p = G.iso(X0, Y0), s = (W.vv.SPR || {})[n] || n; probe('Services de quartier', 'sv:' + n, W.vv.SVC[n][0], () => G.drawFlat(s, p, 1, null, [1, 1]), { x: X0, y: Y0, w: 1, h: 1 }); });
  ['station_service', 'station_recharge_electrique'].forEach(n => { const p = G.iso(X0, Y0); probe('Services de quartier', 'sv:' + n, n, () => G.drawFlat(n, p, 1, null, [1, 1]), { x: X0, y: Y0, w: 1, h: 1 }); });
  // 4. ville au démarrage : chaque sprite (ou repli) réellement dessiné, une case représentative, + échelle des étages
  const sample = {}, perFloor = [];
  for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (!c || c.t !== 'npc' || c.x + c.y * N !== i || c.k === 'mon') continue;
    const A = render(tiles(c, 1, 1, c.x, c.y), { x: c.x, y: c.y, w: 1, h: 1 }), nms = Object.keys(A.st.names), key = nms.join('+') || (A.st.atlas ? 'atlas' : 'vectoriel');
    const M = measure(A); if (c.k !== 'park' && c.k !== 'house' && c.floors >= 2 && M.px) perFloor.push([key, c.floors, M.h / c.floors, c.x, c.y]);
    (sample[key] = sample[key] || []).push(c); }
  Object.keys(sample).sort().forEach(key => { const c = sample[key][0]; probe('Ville (PNJ) au démarrage', 'npc:' + key, key + ' (' + c.k + (c.floors ? ', ' + c.floors + ' ét.' : '') + ') × ' + sample[key].length, tiles(c, 1, 1, c.x, c.y), { x: c.x, y: c.y, w: 1, h: 1 }, { n: sample[key].length, at: [c.x, c.y] }); });
  // 5. mall et aéroport (dessinés une fois depuis la case avant)
  ['mall', 'air'].forEach(m => { const L = []; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.m === m) L.push(c); } if (!L.length) return; L.sort((a, b) => a.x + a.y - b.x - b.y);
    const xs = L.map(c => c.x), ys = L.map(c => c.y), f = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs) + 1, h: Math.max(...ys) - Math.min(...ys) + 1 };
    probe('Grands équipements', 'mon:' + m, m === 'mall' ? 'Mall central' : 'Aéroport', () => L.forEach(c => G.tile(c, c.x, c.y, 0, 0, { now })), f); });
  // échelle : hauteur par étage, écart à la médiane par sorte de sprite
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : 0; }, m0 = med(perFloor.map(p => p[2]));
  const byK = {}; perFloor.forEach(p => (byK[p[0]] = byK[p[0]] || []).push(p)); const scale = Object.keys(byK).map(k => { const v = med(byK[k].map(p => p[2])); return { spr: k, n: byK[k].length, pxEtage: +v.toFixed(1), ecart: +(v / m0 - 1).toFixed(2) }; });
  return { rows, scale, med: +m0.toFixed(1), thumbs };
};

async function audit(pg, o = {}) {
  await pg.evaluate(() => { const W = window.WSE; if (W.S && W.S.grid && W.S.day > 0) return; try { W.showModes(); W.startMode('round', { start: 'moyenne' }); } catch (e) {} W.S.noEv = true; W.setSpeed(0); W.step(); });
  await pg.waitForTimeout(o.wait || 2500);
  return pg.evaluate(PAGE, { thumbs: !!o.thumbs, all: !!o.all });
}
module.exports = { audit };

if (require.main === module) (async () => {
  const L = require('./tests/lib.js'), md = process.argv.includes('--md');
  const pg = await L.newPage({ wait: 1500 }); await pg.addStyleTag({ content: '#modesel{display:none !important}' });
  const R = await audit(pg, { thumbs: md || !!process.env.AUDIT_THUMBS, all: !!process.env.AUDIT_THUMBS }); const rows = R.rows, crit = rows.filter(r => r.critique);
  const why = r => [r.mode === 'VECTORIEL' && 'repli vectoriel', r.mode === 'atlas Kenney' && 'atlas basse définition', r.aplat && 'aplat sans détail', r.flou && 'sous-défini (' + r.def + ')', r.sature && 'saturé ' + Math.round(r.sat * 100) + ' %', r.cale && ('calage (débord ' + Math.round(r.over * 100) + ' %, remplissage ' + r.fill + ', Δbas ' + r.dyB + ' TH)'), r.err && 'erreur'].filter(Boolean).join(' ; ');
  console.log(rows.length, 'éléments,', crit.length, 'critiques'); crit.forEach(r => console.log(' CRITIQUE', r.id, '—', why(r), r.spr ? '[' + r.spr + ']' : ''));
  console.log('hauteur médiane par étage', R.med, 'px ; hors échelle :', R.scale.filter(s => Math.abs(s.ecart) > 0.45).map(s => s.spr + ' ' + s.ecart).join(', ') || 'aucun');
  if (pg.errs.length) console.log('erreurs de page :', pg.errs.slice(0, 3));
  if (process.env.AUDIT_THUMBS) { fs.mkdirSync(process.env.AUDIT_THUMBS, { recursive: true }); Object.entries(R.thumbs).forEach(([id, uri]) => fs.writeFileSync(path.join(process.env.AUDIT_THUMBS, id.replace(/[^a-z0-9_]+/gi, '_') + '.png'), Buffer.from(uri.split(',')[1], 'base64'))); }
  if (md) {
    const TD = path.join(DOCS, 'audit_esthetique'); fs.mkdirSync(TD, { recursive: true });
    Object.entries(R.thumbs).forEach(([id, uri]) => fs.writeFileSync(path.join(TD, 'crit_' + id.replace(/[^a-z0-9_]+/gi, '_') + '.png'), Buffer.from(uri.split(',')[1], 'base64')));
    const fam = [...new Set(rows.map(r => r.fam))], pct = v => Math.round(v * 100) + ' %';
    let s = '# Audit de cohérence esthétique des bâtiments\n\nGénéré par `tools/audit_esthetique.js --md` (charte : `docs/STYLE_BATIMENTS.md`). Chaque bâtiment est rendu seul (zoom 1, dpr 2) dans un canevas instrumenté et mesuré :\n' +
      '**Déf.** = px source par px écran au zoom proche (zoom 1,4 × dpr 2, vue rapprochée du centre ; < 0,6 = image agrandie plus de 1,7 fois, floue) ; **Arêtes** = part des pixels à fort gradient (détail) ; **Aplats** = part des blocs 6 × 6 sans variation ; ' +
      '**Sat.** = part de pixels vifs (saturation > 0,6, hors teintes de terre : brique, tuile, bois ; charte ≤ 15 %) ; **Débord** = part de la silhouette hors de la colonne de l\'emprise ; **Rempl.** = largeur de la silhouette / largeur du losange ; **Δbas** = bas de la silhouette au droit du sommet avant, en TH.\n' +
      'Critique = repli vectoriel ou atlas, aplat sans détail (arêtes < 0,1 et aplats > 55 %), sous-définition, saturation > 15 %, débord > 6 %, bas de la silhouette à plus de 0,3 TH du sommet avant de l\'emprise, ou case 1 × 1 remplie à moins de 55 %.\n\n';
    s += `Bilan : ${rows.length} éléments, **${crit.length} critiques**. Hauteur médiane d'un étage (immeubles de la ville) : ${R.med} px monde ×2.\n\n`;
    if (crit.length) { s += '## Cas critiques\n\n| Élément | Rendu | Sprite | Motif | Vignette |\n|---|---|---|---|---|\n'; crit.forEach(r => { s += `| ${r.label} (\`${r.id}\`) | ${r.mode} | ${r.spr || ''} | ${why(r)} | ![](audit_esthetique/crit_${r.id.replace(/[^a-z0-9_]+/gi, '_')}.png) |\n`; }); s += '\n'; }
    fam.forEach(f => { s += `## ${f}\n\n| Élément | Rendu | Sprite | Déf. | Arêtes | Aplats | Sat. | Débord | Rempl. | Δbas | État |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
      rows.filter(r => r.fam === f).forEach(r => { s += `| ${r.label} (\`${r.id}\`) | ${r.mode} | ${r.spr || ''} | ${r.def == null ? '' : r.def} | ${r.edge} | ${pct(r.flat)} | ${pct(r.sat)} | ${pct(r.over)} | ${r.fill} | ${r.dyB == null ? '' : r.dyB} | ${r.critique ? '**' + why(r) + '**' : 'ok'} |\n`; }); s += '\n'; });
    s += '## Échelle des étages (immeubles de la ville au démarrage)\n\n| Sprite | Cases | px par étage (zoom 1, dpr 2) | Écart à la médiane |\n|---|---|---|---|\n';
    R.scale.sort((a, b) => b.n - a.n).forEach(x => { s += `| ${x.spr} | ${x.n} | ${x.pxEtage} | ${Math.round(x.ecart * 100)} %${Math.abs(x.ecart) > 0.45 ? ' **hors échelle**' : ''} |\n`; });
    s += '\nL\'écart d\'échelle compare la hauteur dessinée au nombre d\'étages *logiques* de la case (économie) : un sprite fixe (maison de ville, immeuble de 6 étages) posé sur une case de 3 ou 12 étages s\'écarte mécaniquement ; seuls les écarts > 45 % sont signalés.\n';
    s += '\nOrdre de profondeur : vérifié par `tests/t57_overlap.js` et `tests/t100_occlusion.js` (non répété ici).\n';
    fs.writeFileSync(path.join(DOCS, 'AUDIT_ESTHETIQUE.md'), s); console.log('écrit docs/AUDIT_ESTHETIQUE.md et', Object.keys(R.thumbs).length, 'vignettes');
  }
  await L.closeBrowser();
})();
