// Coûts de formation et de R&D / amélioration de qualité calés sur une économie États-Unis / Europe.
exports.name = 'Coûts de formation et de R&D réalistes';
const SETUP = `(() => {
  const W = window.WSE, S = W.S, N = W.N; const m = S.macro; m.boom = 0; m.phase = Math.PI; m.gdp = 0.03; m.infl = 0.02; m.rate = 0.04;
  const put = (k, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } };
  const f = put('f2', 66, 84, 54, 84); put('port', 66, 84, 54, 84); for (let i = 0; i < 40; i++) put('res', 14, 44, 14, 44); put('s2', 14, 44, 14, 44);
  W.assignRecipe('steel', 2); f.src = { iron: 'local', coal: 'local' }; f.wage = 2;
  const pre = () => { S.macro.phase = Math.PI; S.macro.boom = 0; S.cash = Math.max(S.cash, 5e9); ['iron', 'coal'].forEach(g => { S.stock[g] = 1e9; S.price[g] = W.GOODS[g].base * (S.cpi || 1); }); };
  window.B = { W, S, f, pre };
  for (let i = 0; i < 25; i++) { pre(); W.step(); }
})()`;
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP);
  const r = await pg.evaluate(() => { const { W, f } = window.B, C = W.costs, pay = C.payYear(f), o = { pay: Math.round(pay), fx: C.fxTrainCost(f, 0), dept: [0, 1, 2].map(l => { f.train = { prod: l }; return C.trainCost(f, 'prod'); }), bad: [] };
    Object.keys(W.PRODUCTS).forEach(k => { const pr = W.PRODUCTS[k], mk = (C.DEMAND_PC[k] || 0.1) * C.RND_POP * (pr.ref || 1); if (pr.rnd > mk * 0.91) o.bad.push(k + ':' + pr.rnd + '>' + Math.round(mk)); });
    return o; });
  t.check('formation d\'un ouvrier de l\'atelier : au plus 3 % de la masse salariale annuelle du bâtiment par pas (≈ 5 % du salaire d\'un employé formé)', r.fx > 0 && r.fx <= 0.03 * r.pay, JSON.stringify({ fx: r.fx, pay: r.pay }));
  t.check('programme de formation d\'un service : 4 % / 8 % / 12 % de la masse salariale annuelle', r.dept.every((v, i) => Math.abs(v - 0.04 * r.pay * (1 + i)) <= 2), JSON.stringify(r.dept) + ' pay ' + r.pay);
  t.check('la R&D d\'un produit ne dépasse jamais 90 % de son marché annuel (25 % hors développements longs)', r.bad.length === 0, r.bad.slice(0, 5).join(' | '));
  t.check('aucune erreur de page (coûts)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
