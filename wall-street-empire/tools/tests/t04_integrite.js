// Intégrité de la simulation : bot aléatoire (pas de NaN/Infinity/stock négatif), usine vide, auto-production.
exports.name = 'Intégrité de la simulation';
exports.run = async (t, L) => {
  // 1. Bot aléatoire déterministe (générateur du bot) sur 600 jours, contrôles tous les 50 jours
  let pg = await L.newPage({ wait: 800 }); await L.setup(pg, { cash: 3e9 }); await L.inject(pg);
  const log = [];
  for (let day = 0; day < 600; day += 50) {
    const r = await pg.evaluate(n => {
      const W = window.WSE, S = W.S, T = window.T, B = T; const R = T.R;
      const types = ['res', 'res', 's1', 's1', 's2', 's3', 's3', 'f1', 'f1', 'f2', 'f3', 'f4', 'foundry', 'wh', 'port', 'tech', 'bank', 'rd', 'dc', 'hq', 'btp', 'immo', 'plant', 'wind', 'solar', 'nuclear'];
      for (let d = 0; d < n; d++) {
        if (S.cash < 5e8) S.cash = 2e9;
        if (d % 2 === 0) B.build(types[Math.floor(R() * types.length)]);
        if (d % 5 === 0) { const e = Object.keys(B.EXT); const k = e[Math.floor(R() * e.length)]; B.depBuild(k, B.EXT[k]); }
        if (d % 6 === 0) ['pylon', 'cable'].forEach(k => B.build(k));
        if (d % 7 === 0) { const o = B.owned(); if (o.length) { const c = o[Math.floor(R() * o.length)]; W.place(c.x, c.y, 'up'); } }
        if (d % 9 === 0) B.owned().forEach(c => { if (W.TYPES[c.t].ret && R() < 0.3) { c.pf = 0.7 + R() * 0.7; c.pk = c.pk || {}; c.pk.g_basic = 0.8 + R() * 0.6; c.pk.g_std = 0.8 + R() * 0.6; } });
        if (d % 13 === 0) { const pk = Object.keys(W.PRODUCTS); const k = pk[Math.floor(R() * pk.length)]; if (S.prod[k].st === 'locked') W.launchProduct(k); else if (S.prod[k].st === 'on') W.assignProduct(k, 2); }
        if (d % 17 === 0) { const rk = Object.keys(W.RECIPES); W.assignRecipe(rk[Math.floor(R() * rk.length)], 2); }
        const evb = document.querySelector('#evcard:not([hidden]) [data-ev]'); if (evb) { const bs = document.querySelectorAll('#evcard [data-ev]'); bs[Math.floor(R() * bs.length)].click(); }
        W.step();
      }
      const neg = []; ['stock', 'price'].forEach(k => Object.keys(S[k]).forEach(g => { if (S[k][g] < 0) neg.push(k + '.' + g + '=' + S[k][g]); })); if (S.pop < 0) neg.push('pop'); if (S.loan < 0) neg.push('loan');
      Object.keys(S.prod).forEach(pk => { ['stock', 'sold'].forEach(f => { if (S.prod[pk][f] < 0) neg.push('prod.' + pk + '.' + f); }); });
      return { day: S.day, nb: B.owned().length, nan: T.scan(), neg };
    }, 50);
    log.push(r);
  }
  const last = log[log.length - 1];
  t.check(`bot aléatoire ${last.day} jours (${last.nb} bâtiments) : aucun NaN/Infinity dans S`, log.every(r => r.nan.length === 0), log.flatMap(r => r.nan).slice(0, 3).join(' ; '));
  t.check('bot aléatoire : aucun stock / prix / population négatif', log.every(r => r.neg.length === 0), log.flatMap(r => r.neg).slice(0, 3).join(' ; '));
  t.check('bot aléatoire : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // 2. Usine vide : une usine sans produit ne fabrique rien
  pg = await L.newPage({ wait: 600 }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const e = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T; const o = {};
    const fs = ['f1', 'f2', 'f3', 'f4'].map(k => [k, T.inP(k)]); T.inP('port'); for (let i = 0; i < 6; i++) T.inC('res'); T.stepN(40, true);
    fs.forEach(([k, c]) => { o[k] = c ? { out: c.out || 0, pRev: c.pRev || 0, limit: c.limit || '', prod: c.prod || null } : null; });
    return o;
  });
  Object.keys(e).forEach(k => t.check(`usine vide ${k} : production 0 et CA 0`, e[k] && e[k].out === 0 && e[k].pRev === 0 && !e[k].prod, JSON.stringify(e[k])));
  await pg.context().close();

  // 3. Auto-production : choisir un produit sélectionne des sources et fait produire
  pg = await L.newPage({ wait: 600 }); await L.setup(pg, { cash: 5e9, caste: 'industriel' }); await L.inject(pg);
  const a = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T; T.inC('s3'); for (let i = 0; i < 6; i++) T.inC('res');
    const f = T.inP('f2'); T.inP('miron'); T.onDep('miron', 'iron'); T.onDep('mcoal', 'coal'); T.onDep('well', 'oil'); T.inP('port'); T.stepN(5, true);
    const k = Object.keys(W.RECIPES).find(k => W.RECIPES[k].lvl <= 2 && Object.keys(W.RECIPES[k].in).some(i => W.RECIPES[i])) || 'api';
    f.prod = k; W.openBuilding(f.x, f.y); W.bAct('recipe:' + k); T.stepN(60, true);
    return { prod: k, nsrc: Object.keys(f.src || {}).length, src: JSON.stringify(f.src || {}).slice(0, 120), out: f.out || 0, limit: f.limit || '' };
  });
  t.check(`auto-production (${a.prod}) : des sources sont sélectionnées`, a.nsrc > 0, `${a.nsrc} entrée(s) : ${a.src}`);
  t.check('auto-production : l\'usine produit (out > 0) ou signale un goulot lisible', a.out > 0 || /\S/.test(a.limit), `out ${a.out.toFixed(1)}, limite « ${a.limit} »`);
  t.check('usines : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();
};
