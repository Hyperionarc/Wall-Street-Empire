// Sauvegarde v8 (aller-retour identique) et déterminisme (deux parties identiques donnent le même état).
exports.name = 'Sauvegarde et déterminisme';

// Joue une partie scriptée (bot aléatoire à graine fixe) ; s'arrête juste après une sauvegarde (jour multiple de 5).
const PLAY = days => `(() => { const W = window.WSE, S = W.S, T = window.T, B = T, R = T.R;
  const types = ['res','res','s1','s2','s3','s3','f1','f2','f3','foundry','wh','port','tech','bank','rd','dc','hq','btp','immo','plant','wind'];
  for (let d = 0; d < ${days}; d++) {
    if (S.cash < 5e8) S.cash = 2e9;
    if (d % 2 === 0) B.build(types[Math.floor(R() * types.length)]);
    if (d % 5 === 0) { const e = Object.keys(B.EXT); const k = e[Math.floor(R() * e.length)]; B.depBuild(k, B.EXT[k]); }
    if (d % 6 === 0) ['pylon','cable'].forEach(k => B.build(k));
    if (d % 7 === 0) { const o = B.owned(); if (o.length) { const c = o[Math.floor(R() * o.length)]; W.place(c.x, c.y, 'up'); } }
    if (d % 9 === 0) B.owned().forEach(c => { if (W.TYPES[c.t].ret && R() < 0.3) { c.pf = 0.7 + R() * 0.7; c.pk = c.pk || {}; c.pk.g_basic = 0.8 + R() * 0.6; c.pk.g_std = 0.8 + R() * 0.6; } });
    if (d % 13 === 0) { const pk = Object.keys(W.PRODUCTS); const k = pk[Math.floor(R() * pk.length)]; if (S.prod[k].st === 'locked') W.launchProduct(k); else if (S.prod[k].st === 'on') W.assignProduct(k, 2); }
    if (d % 17 === 0) { const rk = Object.keys(W.RECIPES); W.assignRecipe(rk[Math.floor(R() * rk.length)], 2); }
    if (d % 11 === 0) B.owned().forEach(c => { if (R() < 0.15) { c.crew = 1 + (R() < 0.5 ? 1 : 0); c.wage = Math.floor(R() * 3); } });
    W.step();
  }
  while (S.day % 5 !== 0) W.step();
})()`;

// Instantané comparable (champs de cellule enregistrés + agrégats de S)
const SNAP = `(() => { const W = window.WSE, S = W.S, N = W.N; const F = ['t','x','y','lvl','floors','prod','crew','wage','qual','eff','pf','irr','src','haul','imp','train','cfg','slots'];
  const cells = S.grid.map(c => { if (!c || c.t === 'npc') return null; const o = {}; const DEF = { pf: 1, floors: 1, crew: 1, wage: 1, qual: 0, eff: 0, irr: 0, haul: 0, lvl: 0, imp: true }; F.forEach(f => { let v = c[f]; if (v === undefined || v === null || v === DEF[f] || (typeof v === 'object' && Object.values(v).every(x => !x))) return; o[f] = v; }); if (c.pk) o.pk = c.pk; return o; });
  return { day: S.day, cash: S.cash, pop: S.pop, loan: S.loan || 0, stock: S.stock, price: S.price, tax: S.tax, tech: S.tech, prod: S.prod, caste: S.caste, m30: S.m30, nb: cells.filter(Boolean).length, cells }; })()`;

function diff(a, b, p, out, tol) {
  if (typeof a === 'number' && typeof b === 'number') { if (Math.abs(a - b) > Math.max(1, Math.abs(a) * tol)) out.push(`${p}: ${a} -> ${b}`); return; }
  if (a === b) return;
  if (a && b && typeof a === 'object' && typeof b === 'object') { new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => diff(a[k], b[k], p + '.' + k, out, tol)); return; }
  if ((a == null || a === 0 || a === false) && (b == null || b === 0 || b === false)) return;
  out.push(`${p}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`);
}

exports.run = async (t, L) => {
  const W_N = 96;
  // 1. Aller-retour sauvegarde
  const ctx = await (await L.browser()).newContext({ viewport: { width: 1280, height: 900 } });
  let pg = await L.newPage({ ctx, wait: 700 }); await L.setup(pg, { cash: 3e9 }); await L.inject(pg);
  await pg.evaluate(PLAY(250));
  const snapA = await pg.evaluate(SNAP);
  const raw = await pg.evaluate(() => localStorage.getItem('wse-city-v8'));
  const sv = raw ? JSON.parse(raw) : null;
  t.check('sauvegarde présente, version 8, grille complète', !!sv && sv.v === 8 && Array.isArray(sv.g) && sv.g.length === W_N * W_N, sv ? `v${sv.v}, ${sv.g.length} cases, ${(raw.length / 1024).toFixed(0)} ko` : 'absente');
  await pg.close();
  pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message));
  await pg.goto(L.URL);                                // restaure la sauvegarde ; pas d'attente pour que le temps réel n'avance pas
  const snapB = await pg.evaluate(SNAP);
  const d = []; diff(snapA, snapB, 'S', d, 0.01);
  t.check('aller-retour sauvegarde : état identique (tolérance 1 %)', d.length === 0 && snapA.nb > 50, `${snapA.nb} bâtiments, jour ${snapA.day}->${snapB.day}${d.length ? ' ; ' + d.slice(0, 3).join(' | ') : ''}`);
  t.check('aller-retour : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(';'));
  await pg.evaluate(() => window.WSE.setSpeed(0)); await L.inject(pg);
  const after = await pg.evaluate(() => { const T = window.T; T.stepN(30); return T.scan(); });
  t.check('partie rechargée : 30 jours simulés sans NaN', after.length === 0, after.slice(0, 3).join(' ; '));
  await ctx.close();

  // 2. Déterminisme : deux parties identiques, état final identique
  async function game() { const p = await L.newPage({ wait: 600 }); await L.setup(p, { cash: 3e9 }); await L.inject(p); await p.evaluate(PLAY(250)); const s = await p.evaluate(`(() => { const S = window.WSE.S; return JSON.stringify({ day: S.day, cash: S.cash, pop: S.pop, loan: S.loan, stock: S.stock, price: S.price, prod: S.prod, fin: S.fin, stats: S.stats, rs: S.rs, cells: S.grid.map(c => c && c.t !== 'npc' ? [c.t, c.pRev, c.profit, c.out] : 0) }); })()`); const e = p.errs.length; await p.context().close(); return { s, e }; }
  const [g1, g2] = await Promise.all([game(), game()]);
  t.check('déterminisme : deux parties identiques de 250 jours donnent le même état (S, finances, cellules)', g1.s === g2.s, g1.s === g2.s ? `${(g1.s.length / 1024).toFixed(0)} ko comparés` : 'états différents');
  t.check('déterminisme : 0 pageerror', g1.e + g2.e === 0, '');
};
