// Passe 77 : enseignes FAÇADE (demande de Rémy : « pharmacie : il faut que ce soit écrit dessus, sur une façade »). Le nom n'est plus seulement une plaque flottante
// au-dessus du toit : dès qu'il est lisible (≥ 9 px), il est peint par le code sur le mur avant du sprite, cisaillé en isométrie 2:1 (pente ±0,5 selon la face),
// réduit pour tenir dans la largeur du mur. En dessous (zoom faible), masqué par un bâtiment de devant, ou sans mesure pour le sprite : plaque flottante d'origine.
// Vérifie la pharmacie (rectangle du texte dans le sprite, transformé, pixels réellement peints), les autres commerces et équipements, l'absence de
// chevauchement (la façade compte comme une plaque), le survol, la performance (< 0,3 ms par image) et l'écran de téléphone (390 × 844).
exports.name = 'Enseignes sur la façade (passe 77)';
const SHOTS = process.env.WSE_SHOTS || '/tmp';
const KEYS = ['spharma', 's1', 'smode', 'slux', 'shome', 'sauto'];
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const finite = d => d.every(s => [s.x, s.y, s.w, s.h, s.fs, s.al].every(Number.isFinite) && s.w > 0 && s.h > 0 && s.txt && !/NaN|undefined/.test(s.txt) && (!s.quad || s.quad.every(q => q.every(Number.isFinite))));
// Pose chaque magasin sur une case dégagée (immeubles PNJ voisins retirés pour la vue), loin du mall
async function studio(pg, L, keys) {
  await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  return pg.evaluate(keys => { const W = window.WSE, S = W.S, N = W.N, placed = {}, M = W.mall.pos(), mc = [M.x + M.w / 2, M.y + M.h / 2], mine = [], cells = [];
    ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    for (let y = 13; y < 48; y++) for (let x = 13; x < 48; x++) cells.push([x, y]);
    cells.sort((a, b) => (Math.abs(b[0] - mc[0]) + Math.abs(b[1] - mc[1])) - (Math.abs(a[0] - mc[0]) + Math.abs(a[1] - mc[1])) || a[1] - b[1] || a[0] - b[0]);
    const clear = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (x < 0 || y < 0 || x >= N || y >= N) continue; const c = S.grid[y * N + x]; if (c && c.t === 'npc' && c.k !== 'mon' && (c.w || 1) === 1 && (c.h || 1) === 1 && !c.lm) S.grid[y * N + x] = null; } };
    const nearMon = (x, y) => { for (let j = y - 3; j <= y + 4; j++) for (let i = x - 3; i <= x + 4; i++) { const c = i >= 0 && j >= 0 && i < N && j < N && S.grid[j * N + i]; if (c && c.t === 'npc' && c.k === 'mon') return true; } return false; };   // case dégagée : pas d'équipement public voisin (urbanisme : les écoles sont aux angles de la ville)
    keys.forEach(k => { for (const [x, y] of cells) { if (mine.some(m => Math.abs(m[0] - x) < 5 && Math.abs(m[1] - y) < 5) || nearMon(x, y)) continue; clear(x - 1, y - 1, x + 3, y + 3);
      if (W.footprintError(x, y, k)) continue; if (W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) {} const c = S.grid[y * N + x]; placed[k] = [c.x, c.y, c.w || 1, c.h || 1]; mine.push([x, y]); break; } } });
    W.setTool('view'); return placed; }, keys);
}
async function look(pg, P, zz) {
  await pg.evaluate(a => { ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    [...document.querySelectorAll('button')].filter(b => /Continuer à jouer/.test(b.textContent) && b.offsetParent).forEach(b => b.click());
    const W = window.WSE; W.view.setZ(a[2]); W.centerOn(a[0] + (a[3] - 1) / 2, a[1] + (a[4] - 1) / 2); }, [P[0], P[1], zz, P[2] || 1, P[3] || 1]);
  await pg.waitForTimeout(420);
  return pg.evaluate(() => { const G = window.WSE.sign; return { d: G.drawn, faces: G.faces, z: window.WSE.view.z, dpr: window.WSE.view.dpr }; });
}
const inside = (s, m) => s.quad.every(q => q[0] >= s.spr[0] - m && q[0] <= s.spr[2] + m && q[1] >= s.spr[1] - m && q[1] <= s.spr[3] + m);
const slope = s => (s.quad[1][1] - s.quad[0][1]) / (s.quad[1][0] - s.quad[0][0]);

exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 2600, w: 1280, h: 720 });
  await pg.evaluate(() => { window.WSE.startMode('free'); });
  // ---- 1. Table
  const tb = await pg.evaluate(() => { const G = window.WSE.sign, F = G.FACE, bad = [];
    Object.keys(F).forEach(k => { if (!G.SIGN[k]) bad.push(k + ' sans SIGN'); Object.keys(F[k]).forEach(n => { const f = F[k][n]; if (!/^[LR]$/.test(f.face) || ![f.ax, f.ay, f.w, f.h].every(v => Number.isFinite(v) && v > 0 && v < 1) || f.ax - f.w / 2 < 0 || f.ax + f.w / 2 > 1) bad.push(k + '/' + n); }); });
    return { bad, n: Object.keys(F).length, ph: F.spharma && F.spharma.pharmacie_quartier, min: G.FACE_MIN }; });
  t.check('table SIGN_FACE[type][sprite] : face L/R, ancrage et tailles en fractions du sprite, bandeau dans la largeur de l\'image', !tb.bad.length && tb.n >= 12, tb.bad.join(', ') || `${tb.n} types`);
  t.check('pharmacie : mesure sur le sprite pharmacie_quartier.png (bandeau vierge au-dessus des vitrines, façade avant-gauche ; cohérence esthétique), seuil de lisibilité 9 px', !!tb.ph && tb.ph.face === 'L' && tb.min === 9, JSON.stringify(tb.ph));

  // ---- 2. La pharmacie : nom peint sur la façade aux zooms rapprochés
  const P0 = await studio(pg, L, KEYS), PH = P0.spharma;
  t.check('studio : pharmacie et 5 autres commerces posés sur des cases dégagées', !!PH && Object.keys(P0).length >= 5, Object.keys(P0).join(','));
  let ph18 = null;
  for (const zz of [1.2, 1.5, 1.8]) {
    const r = await look(pg, PH, zz), s = r.d.find(q => q.key === 'spharma');
    if (zz === 1.8) { ph18 = s; await pg.screenshot({ path: SHOTS + '/t77_pharmacie_z18.png', clip: { x: 440, y: 230, width: 400, height: 300 } }).catch(() => {}); }
    if (zz === 1.2) await pg.screenshot({ path: SHOTS + '/t77_pharmacie_z12.png', clip: { x: 490, y: 260, width: 300, height: 220 } }).catch(() => {});
    t.check(`zoom ${zz} : « PHARMACIE » écrit sur la façade avant-gauche (texte cisaillé pente +0,5, dans le cadre du sprite, ≥ 9 px)`,
      !!s && s.face === 'L' && s.txt === 'PHARMACIE' && s.fs >= 9 && inside(s, 1) && Math.abs(slope(s) - 0.5) < 0.03 && finite([s]),
      s ? `${s.face || 'plaque'} ${s.fs.toFixed(1)} px · pente ${s.quad ? slope(s).toFixed(3) : '-'} · ${s.quad ? 'quad ' + s.quad.map(q => q.map(Math.round).join(',')).join(' ') + ' · sprite ' + s.spr.map(Math.round).join(',') : ''}` : 'absente');
  }
  if (ph18) {
    const W0 = ph18.spr[2] - ph18.spr[0], bw = ph18.quad[1][0] - ph18.quad[0][0], cy = (ph18.quad[0][1] + ph18.quad[2][1]) / 2, ry = (cy - ph18.spr[1]) / (ph18.spr[3] - ph18.spr[1]);
    t.check('bon endroit et bonne taille : bandeau sur la moitié gauche de la façade, à mi-hauteur (frise du rez-de-chaussée), large de 25 à 40 % du sprite', ph18.quad[1][0] <= ph18.spr[0] + W0 * 0.52 && bw / W0 > 0.25 && bw / W0 < 0.4 && ry > 0.45 && ry < 0.7, `largeur ${(100 * bw / W0).toFixed(0)} % · hauteur relative ${ry.toFixed(2)}`);
    t.check('positions en pixels physiques entiers (texte net)', Math.abs(ph18.x - Math.round(ph18.x)) < 1e-6 && Math.abs(ph18.y - Math.round(ph18.y)) < 1e-6, `${ph18.x},${ph18.y}`);
    // pixels réellement peints : capture du cadre de l'enseigne avec et sans les enseignes
    const clip = { x: Math.floor(ph18.x), y: Math.floor(ph18.y), width: Math.ceil(ph18.w), height: Math.ceil(ph18.h) };
    const a = await pg.screenshot({ clip }); await pg.evaluate(() => { window.WSE.sign.on = false; }); await pg.waitForTimeout(150); const b = await pg.screenshot({ clip }); await pg.evaluate(() => { window.WSE.sign.on = true; }); await pg.waitForTimeout(150);
    const diff = await pg.evaluate(async ([A, B]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
      const [ia, ib] = await Promise.all([ld(A), ld(B)]), c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height; const g = c.getContext('2d');
      g.drawImage(ia, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data; g.clearRect(0, 0, c.width, c.height); g.drawImage(ib, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data;
      let n = 0, lum = 0; for (let i = 0; i < da.length; i += 4) { const d = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]); if (d > 60) n++; const L0 = da[i] + da[i + 1] + da[i + 2]; if (L0 > 600) lum++; }
      return { r: n / (da.length / 4), light: lum }; }, [a.toString('base64'), b.toString('base64')]);
    t.check('bandeau réellement peint sur le mur (≥ 25 % des pixels du cadre changent) avec un lettrage clair contrasté', diff.r > 0.25 && diff.light >= 20, `${(100 * diff.r).toFixed(0)} % · ${diff.light} px clairs`);
  }
  // zoom faible : façade illisible, la plaque flottante reprend la main
  let r = await look(pg, PH, 0.7), s = r.d.find(q => q.key === 'spharma');
  t.check('zoom 0,7 : texte de façade illisible (< 9 px) → plaque flottante d\'origine au-dessus du toit', !!s && !s.face && s.fs >= 9, s ? `${s.fs.toFixed(1)} px ${s.face || 'plaque'}` : 'absente');
  r = await look(pg, PH, 0.25); t.check('zoom 0,25 : aucune enseigne de façade', !r.d.some(q => q.face), `${r.d.length} plaques`);

  // ---- 3. Survol au zoom rapproché : l'enseigne reste visible
  await look(pg, PH, 1.5);
  const q = await pg.evaluate(p => window.WSE.tileToScreen(p[0], p[1]), PH); await pg.mouse.move(q.x, q.y); await pg.waitForTimeout(350);
  let d = await pg.evaluate(() => window.WSE.sign.drawn); const f = d.find(x => x.key === 'spharma');
  t.check('survol de la pharmacie : son enseigne reste affichée (façade ou plaque), lisible', !!f && f.fs >= 9, f ? `${f.face || 'plaque'} ${f.fs.toFixed(0)} px foc=${f.foc}` : d.map(x => x.txt).join(', '));
  await pg.mouse.move(5, 360); await pg.waitForTimeout(150);

  // ---- 4. Autres commerces et équipements publics
  const got = {};
  for (const k of Object.keys(P0)) { if (k === 'spharma') continue; r = await look(pg, P0[k], 1.8); const e = r.d.find(x => x.key === k); got[k] = e ? (e.face ? e.face + ':' + e.txt + ' ' + e.fs.toFixed(0) + 'px' + (inside(e, 2) ? '' : ' HORS') : 'plaque') : '-';
    if (k === 'smode' || k === 's1') await pg.screenshot({ path: SHOTS + `/t77_${k}_z18.png`, clip: { x: 440, y: 230, width: 400, height: 300 } }).catch(() => {}); }
  const mon = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, o = {}; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'mon' && (c.m === 'hall' || c.m === 'college') && !o[c.m]) o[c.m] = [c.mx, c.my, c.mw, c.mh]; } return o; });
  for (const m of Object.keys(mon)) { r = await look(pg, mon[m], 1.8); const e = r.d.find(x => x.key === 'mon:' + m); got['mon:' + m] = e ? (e.face ? e.face + ':' + e.txt + ' ' + e.fs.toFixed(0) + 'px' + (inside(e, 2) ? '' : ' HORS') : 'plaque') : '-';
    if (m === 'hall') await pg.screenshot({ path: SHOTS + '/t77_mairie_z18.png', clip: { x: 390, y: 160, width: 500, height: 400 } }).catch(() => {}); }
  const nf = Object.values(got).filter(v => /^[LR]:/.test(v) && !/HORS/.test(v)).length;
  t.check('zoom 1,8 : au moins 5 autres bâtiments (petit marché, mode, luxe, déco, concession, mairie, collège…) portent leur nom sur la façade, dans leur sprite', nf >= 5 && !Object.values(got).some(v => /HORS/.test(v)), Object.entries(got).map(e => e.join('=')).join(' · '));

  // ---- 6. Performance au zoom rapproché (façades en cache)
  const pv = await look(pg, PH, 1.6); t.info('vue de mesure : ' + pv.d.map(x => x.txt + (x.face ? '(' + x.face + ')' : '')).join(', '));
  const perf = await pg.evaluate(async () => { const G = window.WSE.sign, v = []; let nf = 0; for (let i = 0; i < 40; i++) { await new Promise(r => requestAnimationFrame(r)); v.push(G.ms); nf = Math.max(nf, G.drawn.filter(x => x.face).length); } v.sort((a, b) => a - b); return { med: v[20], p90: v[36], cache: G.cacheN, faces: nf }; });
  t.check('performance : enseignes < 0,3 ms par image (médiane) avec façades, cache borné', perf.med < 0.3 && perf.cache <= 500 && perf.faces >= 1, `médiane ${perf.med.toFixed(3)} ms · p90 ${perf.p90.toFixed(3)} ms · ${perf.faces} façades · ${perf.cache} en cache`);
  // ---- 5. Vue de ville dense : aucun chevauchement (façades comprises), aucun NaN
  const C = await pg.evaluate(() => { const T = window.T, o = {}; ['s2', 'stech', 'ssport', 'smode', 'spharma', 's1', 'slux'].forEach(k => { const c = T.inC(k); if (c) o[k] = [c.x, c.y, 1, 1]; }); return o; });
  let coll = [], nan = 0, tf = 0;
  for (const k of Object.keys(C)) for (const zz of [1.1, 1.4, 1.8]) { r = await look(pg, C[k], zz); tf += r.d.filter(x => x.face).length; if (!finite(r.d)) nan++;
    for (let i = 0; i < r.d.length; i++) for (let j = i + 1; j < r.d.length; j++) if (hit(r.d[i], r.d[j])) coll.push(r.d[i].txt + '/' + r.d[j].txt + '@' + zz); }
  t.check('ville dense, 3 zooms rapprochés : aucune enseigne (façade ou plaque) n\'en chevauche une autre, aucun NaN', !coll.length && !nan, coll.slice(0, 4).join(' ') || `${tf} façades vues`);

  t.check('aucune erreur de page', !pg.errs.length, pg.errs.slice(0, 3).join(' | '));
  await pg.close();

  // ---- 7. Téléphone 390 × 844
  const mp = await L.newPage({ wait: 2600, w: 390, h: 844 });
  await mp.evaluate(() => { window.WSE.startMode('free'); });
  const P1 = await studio(mp, L, ['spharma']);
  r = await look(mp, P1.spharma, 1.8); s = r.d.find(x => x.key === 'spharma');
  t.check('mobile 390×844 : « PHARMACIE » sur la façade, dans le sprite, lisible, plus étroite que l\'écran, sans NaN', !!s && s.face === 'L' && s.fs >= 9 && inside(s, 1) && s.w < 390 && finite(r.d), s ? `${s.face || 'plaque'} ${s.fs.toFixed(1)} px · ${s.w.toFixed(0)} px de large` : r.d.map(x => x.txt).join(', '));
  await mp.screenshot({ path: SHOTS + '/t77_mobile.png' }).catch(() => {});
  t.check('mobile : aucune erreur de page', !mp.errs.length, mp.errs.slice(0, 3).join(' | '));
  await mp.close();
};
