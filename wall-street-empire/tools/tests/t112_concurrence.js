// Économie de marché, lot 3 (retour de Rémy : le faucon et les colombes). Même ville de 100 000 habitants, joueur intégré (blé, moulins, trois boulangeries, trois magasins).
//  A. entrée d'un acteur intégré au prix standard : il prend des parts sans dumping (prix ≥ coût de revient, marge positive) ;
//  B. guerre des prix (pain à 60 % du prix standard, sous le coût, jours 40 à 120) : parts en hausse ET pertes ; les rivaux répliquent (leurs prix baissent) ;
//  C. retour au prix standard : les parts reviennent près de l'équilibre de A ;
//  D. un rival « colombe » à court de trésorerie ne suit pas : il cède des parts (ferme des rayons) au lieu de se ruiner ;
//  E. profils : l'agressivité (faucon / colombe) dépend de la caste et monte avec la concurrence ; la marque protège (attrait relatif plus haut au même prix).
exports.name = 'Concurrence : faucon, colombes, guerre des prix, retour à l\'équilibre';
const SETUP = `const W = window.WSE; W.startMode('round', { start: 'moyenne' }); const S = W.S; S.rs = 7001; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); S.cash = 6e7;
  const T = window.T, N = W.N; T.onDep('fwheat', 'wheat'); T.onDep('fwheat', 'wheat'); T.onDep('fwheat', 'wheat'); const bak = T.inP('f1'); for (let i = 0; i < 3; i++) T.inP('f1'); const bak2 = T.inP('f1'), bak3 = T.inP('f1'); [bak, bak2, bak3].forEach(f => W.easyLaunch(f, 'bread'));
  const shops = []; const near = t => { for (let r = 0; r < 16; r++) for (let y = 23 - r; y <= 37 + r; y++) for (let x = 23 - r; x <= 37 + r; x++) if (!W.footprintError(x, y, t) && W.place(x, y, t)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } return null; };
  ['s3', 's2', 's2'].forEach(t => { const c = near(t); if (c) { W.shopUI.act(c, 'put:0:bread'); shops.push(c); } }); window.__sc = { shops };`;
const DAYS = 150;
async function run(L, plan) {
  const pg = await L.newPage({ wait: 600 }); await L.inject(pg);
  const r = await pg.evaluate(({ SETUP, DAYS, plan }) => {
    new Function(SETUP)(); const W = window.WSE, S = W.S, sc = window.__sc, at = {}; let rev = 0, cost = 0;
    for (let d = 1; d <= DAYS; d++) {
      if (plan.war && d === plan.war[0]) { S.prod.bread.pf = 0.6; if (plan.poor) { const t = S.rivals.find(x => x.name === plan.poor); if (t) t.cash = 0.01 * W.riv.value(t); } }
      if (plan.war && d === plan.war[1]) S.prod.bread.pf = 1;
      W.step();
      const ps = S.prod.bread, D = S._nd.D.bread, shelf = sc.shops.reduce((a, c) => a + ((c.sales && c.sales.bread) || 0), 0), mc = W.mk.makeCost('bread').unit;
      if (d > 40 && d <= 120) { rev += ps.rev + (ps.b2bV || 0); cost += (shelf + (ps.b2b || 0)) * mc; }
      if (d === 30 || d === 110 || d === 150) at[d] = { me: (shelf + (ps.b2b || 0)) / D, px: W.prodPrice('bread'), mc, rpx: S.rivals.filter(x => !x.sub).map(x => (x.px && x.px.basic) || 1), att: Object.fromEntries(S.rivals.map(x => [x.name, x.att.basic])) };
    }
    return { at, mrg: rev - cost, cede: (S.rv && S.rv.cede) || 0 };
  }, { SETUP, DAYS, plan });
  r.errs = pg.errs.slice(0, 3); await pg.context().close(); return r;
}
exports.run = async (t, L) => {
  const A = await run(L, {}), B = await run(L, { war: [40, 120] }), D = await run(L, { war: [40, 9999], poor: 'Mega Mart' });
  const pct = v => (100 * v).toFixed(1) + ' %';
  t.check('A. acteur intégré au prix standard : prix ≥ coût de revient, marge positive, part significative de la ville', A.at[110].px >= A.at[110].mc && A.mrg > 0 && A.at[110].me > 0.1, `part ${pct(A.at[110].me)}, prix ${A.at[110].px.toFixed(3)} / coût ${A.at[110].mc.toFixed(3)}, marge ${Math.round(A.mrg)} $`);
  t.check('A. coût de revient intégré inférieur au prix standard du marché', A.at[110].mc < 0.9 * B.at[30].px, `${A.at[110].mc.toFixed(3)} contre ${B.at[30].px.toFixed(3)}`);
  t.check('B. guerre des prix : le faucon prend des parts (≥ +5 points) …', B.at[110].me >= A.at[110].me + 0.05, `${pct(B.at[110].me)} contre ${pct(A.at[110].me)}`);
  t.check('B. … et la paie : vente sous le coût, marge négative sur la période', B.at[110].px < B.at[110].mc && B.mrg < 0, `prix ${B.at[110].px.toFixed(3)} / coût ${B.at[110].mc.toFixed(3)}, marge ${Math.round(B.mrg)} $`);
  const rA = A.at[110].rpx, rB = B.at[110].rpx, cut = rB.filter((p, i) => p < rA[i] - 0.01).length;
  t.check('B. les rivaux répliquent : au moins un baisse ses prix de base face au faucon', cut >= 1, `${rA.map(x => x.toFixed(3)).join(' ')} → ${rB.map(x => x.toFixed(3)).join(' ')}`);
  t.check('C. retour au prix standard : la part revient vers l\'équilibre (± 15 points 30 jours après ; les rivaux remontent leurs prix lentement)', Math.abs(B.at[150].me - A.at[150].me) < 0.15, `${pct(B.at[150].me)} contre ${pct(A.at[150].me)}`);
  t.check('D. une colombe sans trésorerie cède des parts (ferme des rayons) au lieu de suivre', D.cede >= 1 && D.at[150].att['Mega Mart'] < A.at[150].att['Mega Mart'], `cessions ${D.cede}, attrait ${D.at[150].att['Mega Mart'].toFixed(3)} contre ${A.at[150].att['Mega Mart'].toFixed(3)}`);
  const pg = await L.newPage({ wait: 600 }); await L.setup(pg, { cash: 5e8 });
  const E = await pg.evaluate(() => { const W = window.WSE, S = W.S, E = W.eco, rs = S.rivals.filter(x => !x.sub), h = Object.fromEntries(rs.map(r => [r.name, E.hawk(r)]));
    W.netActivate ? 0 : 0; const ps = S.prod.bread; ps.st = 'on'; const a0 = E.attractiveness('bread') / E.npcA('bread'); ps.brand = 80; ps.loy = 80; const a1 = E.attractiveness('bread') / E.npcA('bread');
    return { h, a0, a1 }; });
  t.check('E. profils : DiscountCo (négoce, prix cassés) plus faucon que Luxor & Fils (luxe)', E.h['DiscountCo'] > E.h['Luxor & Fils'], JSON.stringify(E.h));
  t.check('E. la marque et la fidélité protègent : attrait relatif plus haut au même prix', E.a1 > 1.15 * E.a0, `${E.a0.toFixed(2)} → ${E.a1.toFixed(2)}`);
  const errs = [A, B, D].reduce((a, x) => a.concat(x.errs), pg.errs);
  t.check('0 erreur de page', errs.length === 0, errs.slice(0, 3).join(' | '));
  await pg.context().close();
};
