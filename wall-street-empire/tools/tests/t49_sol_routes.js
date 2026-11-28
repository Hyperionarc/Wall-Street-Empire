// Sol texturé et routes en sprites (intégrateur n° 9) : sprites de sol et de route chargés, sprite de route choisi d'après les voisins (16 masques),
// tuiles de sol par zone (herbe, terre, pavé, asphalte, quai, eau, rivage), cache par blocs reconstruit quand une route est posée ou détruite,
// aucune erreur de page, fluidité : images par seconde avec le sol texturé >= 80 % de l'ancien rendu (200 images par mode, mesures entrelacées).
exports.name = 'Sol texturé et routes en sprites';
// Nom attendu, recalculé ici indépendamment du jeu : branches NE (y-1), SE (x+1), SW (y+1), NW (x-1)
function expected(m) {
  const a = { se: !!(m & 1), nw: !!(m & 2), sw: !!(m & 4), ne: !!(m & 8) }, on = ['ne', 'se', 'sw', 'nw'].filter(k => a[k]), off = ['ne', 'se', 'sw', 'nw'].filter(k => !a[k]);
  if (on.length === 0) return 'route_isolee';
  if (on.length === 4) return 'route_croix';
  if (on.length === 1) return 'route_bout_' + on[0];
  if (on.length === 3) return 'route_t_' + off[0];
  if (a.ne && a.sw) return 'route_droite_ne';
  if (a.nw && a.se) return 'route_droite_nw';
  const C = { 'ne,se': 'ne_se', 'se,sw': 'se_sw', 'sw,nw': 'sw_nw', 'ne,nw': 'ne_nw' };
  return 'route_coude_' + C[on.join(',')];
}
exports.run = async (t, L) => {
  const pg = await L.newPage({ w: 1280, h: 800, wait: 1500 }); await L.setup(pg, {});
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint{display:none!important}' });
  const a = await pg.evaluate(() => {
    const W = window.WSE, G = W.ground, img = W.p2.img;
    const missing = G.GT_NAMES.filter(n => !(img[n] && img[n].ok && img[n].im.naturalWidth > 0));
    const dims = G.GT_NAMES.map(n => img[n] && img[n].im.naturalWidth + 'x' + img[n].im.naturalHeight);
    return { n: G.GT_NAMES.length, missing, dims: [...new Set(dims)], active: G.active() };
  });
  t.check('les 31 sprites de sol, d\'eau et de route sont chargés (losange 2:1)', a.n === 31 && a.missing.length === 0 && a.dims.every(d => { const [w, h] = d.split('x').map(Number); return w === 2 * h; }) && a.active, JSON.stringify(a));
  // 16 masques : zone de campagne libre, chaque motif posé autour d'une case centrale (cases écrites directement puis effacées)
  const r = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, G = W.ground, res = [];
    const free = (x, y) => !S.grid[y * N + x] && W.ZONE[(y) * N + (x)] === 0;
    let base = null;
    for (let y = 60; y < 90 && !base; y++) for (let x = 2; x < 40 && !base; x++) { let ok = true; for (let dy = -2; dy <= 2 && ok; dy++) for (let dx = -2; dx <= 2 && ok; dx++) ok = free(x + dx, y + dy); if (ok) base = [x, y]; }
    if (!base) return { err: 'pas de zone libre' };
    const [cx, cy] = base, nb = [[1, 0, 1], [-1, 0, 2], [0, 1, 4], [0, -1, 8]];
    for (let m = 0; m < 16; m++) {
      const cells = [[cx, cy]].concat(nb.filter(d => m & d[2]).map(d => [cx + d[0], cy + d[1]]));
      cells.forEach(c => { S.grid[c[1] * N + c[0]] = { t: 'road', x: c[0], y: c[1] }; });
      res.push([m, G.roadSpr(cx, cy), G.kind(cx, cy)[0]]);
      cells.forEach(c => { S.grid[c[1] * N + c[0]] = null; });
    }
    return { base, res };
  });
  const bad = (r.res || []).filter(q => q[1] !== expected(q[0]) || q[2] !== expected(q[0]));
  t.check('le sprite de route suit les voisins dans les 16 cas (4 bouts, 2 droites, 4 coudes, 4 T, croix, isolée)', r.res && r.res.length === 16 && !bad.length, bad.length ? JSON.stringify(bad) : 'case ' + r.base);
  const k = await pg.evaluate(() => {
    const W = window.WSE, G = W.ground, N = W.N, cnt = {};
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const n = G.kind(x, y)[0].replace(/_[a-d]$/, '').replace(/^route_.*/, 'route'); cnt[n] = (cnt[n] || 0) + 1; }
    const zk = (x, y) => G.kind(x, y)[0];
    let coast = null; for (let x = 60; x < N - 1 && !coast; x++) if (W.ZONE[(20) * N + (x)] !== 3 && W.ZONE[(20) * N + (x + 1)] === 3) coast = zk(x, 20);
    return { cnt, city: zk(13, 13), port: zk(70, 58), sea: zk(94, 30), coast, det: zk(5, 5) === zk(5, 5) && G.kind(7, 9)[0] === G.kind(7, 9)[0] };
  });
  const c = k.cnt;
  t.check('tuiles de sol par zone : herbe (4 variantes), clairières de terre, pavé en ville, terre-plein clair du terminal au port (asphalte remappé, t119), béton des quais, eau, rivage', c.herbe > 1000 && c.sol_ville_pave > 300 && c.sol_terminal > 100 && c.sol_quai_beton > 30 && c.eau_calme > 300 && c.rivage_sable > 20 && c.route > 200 && k.coast === 'rivage_sable', JSON.stringify(k));
  const cl = await pg.evaluate(() => { const W = window.WSE, N = W.N; let n = 0, z0 = 0; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (W.ZONE[(y) * N + (x)] === 0) { z0++; if (W.ground.clearing(x, y)) n++; } return { n, z0 }; });
  t.range('clairières de terre en campagne (part des cases)', 100 * cl.n / cl.z0, 2, 20, ' %');
  // cache : bloc cuit, puis rebâti quand une route est posée puis démolie
  const ca = await pg.evaluate(async () => {
    const W = window.WSE, S = W.S, N = W.N, G = W.ground.GT, raf = () => new Promise(r => requestAnimationFrame(r));
    let sp = null; for (let y = 64; y < 90 && !sp; y++) for (let x = 4; x < 40 && !sp; x++) if (!S.grid[y * N + x] && !S.dep[y * N + x] && W.ZONE[(y) * N + (x)] === 0) sp = [x, y];
    if (!sp) return { err: 'aucune case libre' };
    W.view.setZ(0.8); W.view.centerOn(sp[0], sp[1]);
    for (let i = 0; i < 400; i++) { await raf(); if (G.stat.drawn > 0 && G.stat.direct === 0 && i > 3) { const b = G.stat.baked; await raf(); await raf(); if (G.stat.baked === b) break; } }
    const b0 = G.stat.baked, put = W.place(sp[0], sp[1], 'road'); await raf(); await raf(); const b1 = G.stat.baked, kind = W.ground.kind(sp[0], sp[1])[0];
    const del = W.place(sp[0], sp[1], 'bull'); await raf(); await raf(); const b2 = G.stat.baked;
    return { sp, put: !!put, del: !!del, kind, b0, b1, b2, after: W.ground.kind(sp[0], sp[1])[0], chunks: G.cache.size, mpx: Math.round(G.px / 1e5) / 10 };
  });
  t.check('route posée puis démolie par le joueur : le bloc de sol est rebâti (sprite de route puis herbe)', ca.put && ca.del && ca.b1 > ca.b0 && ca.b2 > ca.b1 && /^route_/.test(ca.kind) && !/^route_/.test(ca.after), JSON.stringify(ca));
  // fluidité : 200 images par mode, en blocs de 25 alternés (ancien rendu vectoriel GT.off / sol texturé), après cuisson des blocs visibles
  const f = await pg.evaluate(async () => {
    const W = window.WSE, G = W.ground.GT, raf = () => new Promise(r => requestAnimationFrame(r)), out = [];
    for (const v of [[30, 30, 0.55], [62, 46, 0.25]]) {
      W.view.setZ(v[2]); W.view.centerOn(v[0], v[1]); G.off = false;
      for (let i = 0; i < 600; i++) { await raf(); if (i > 3 && G.stat.direct === 0) { const b = G.stat.baked; await raf(); await raf(); if (G.stat.baked === b) break; } }
      const tm = { on: 0, off: 0 }, fr = { on: 0, off: 0 };
      for (let blk = 0; blk < 16; blk++) { const md = blk % 2 ? 'off' : 'on'; G.off = md === 'off'; await raf(); await raf(); const t0 = performance.now(); for (let i = 0; i < 25; i++) await raf(); tm[md] += performance.now() - t0; fr[md] += 25; }
      G.off = false; out.push({ v, on: +(1000 * fr.on / tm.on).toFixed(1), off: +(1000 * fr.off / tm.off).toFixed(1), n: fr.on });
    }
    return out;
  });
  f.forEach(q => t.check(`fluidité au zoom ${q.v[2]} : ${q.on} i/s avec le sol texturé contre ${q.off} i/s avant (200 images par mode)`, q.on >= 0.8 * q.off, JSON.stringify(q)));
  t.check('aucune erreur de page (sol et routes)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
