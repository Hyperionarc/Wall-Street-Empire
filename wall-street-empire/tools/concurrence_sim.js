// Économie de marché, lot 3 : scénarios de concurrence (faucon et colombes), joués sur le vrai build.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/concurrence_sim.js [--days=240] [--seed=7001] [--out=fichier.json]
// Quatre situations, même ville de 100 000 habitants (Round, industriel, événements coupés) :
//   A. entrée d'un acteur intégré (trois fermes de blé, trois moulins, trois boulangeries, trois magasins, publicité) au prix standard : parts gagnées sans dumping, coût de revient plus bas ;
//   B. guerre des prix : le même acteur vend son pain à 60 % du prix standard (sous son coût) des jours 60 à 150 : parts, pertes, réponse des rivaux (faucons, colombes) ;
//   C. retour à l'équilibre : prix standard à partir du jour 150 (mesure de l'hystérésis : fidélité et marque gagnées) ;
//   D. faillite d'un perdant : la même guerre contre un rival de la grande distribution dont la trésorerie est presque vide.
// Chaque relevé (tous les 10 jours) : part de ta production de pain dans la ville (rayons + gros), parts des commerces de la ville et des rivaux, prix, résultat du pain, trésorerie et attrait des rivaux.
const L = require('./tests/lib.js');
const A = process.argv.slice(2), arg = (k, d) => { const a = A.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const DAYS = +arg('days', 240), SEED = +arg('seed', 7001), OUT = arg('out', '');
const SETUP = `
  const W = window.WSE; W.startMode('round', { start: 'moyenne' }); const S = W.S; S.rs = SEED; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); S.cash = 6e7;
  const T = window.T, N = W.N; T.onDep('fwheat', 'wheat'); T.onDep('fwheat', 'wheat'); T.onDep('fwheat', 'wheat'); const bak = T.inP('f1'); for (let i = 0; i < 3; i++) T.inP('f1'); const bak2 = T.inP('f1'), bak3 = T.inP('f1'); [bak, bak2, bak3].forEach(f => W.easyLaunch(f, 'bread'));   // trois boulangeries (≈ 60 000 baguettes/j) : capacité au-delà de ce que la ville t'achète au prix standard
  const shops = []; const near = t => { for (let r = 0; r < 16; r++) for (let y = 23 - r; y <= 37 + r; y++) for (let x = 23 - r; x <= 37 + r; x++) if (!W.footprintError(x, y, t) && W.place(x, y, t)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } return null; };
  ['s3', 's2', 's2'].forEach(t => { const c = near(t); if (c) { W.shopUI.act(c, 'put:0:bread'); c.ad = { tv: 0, radio: 120, net: 120 }; shops.push(c); } });
  window.__sc = { bak, shops };`;
async function run(name, plan) {
  const pg = await L.newPage({ wait: 600 }); await L.inject(pg);
  const r = await pg.evaluate(({ SETUP, SEED, DAYS, plan }) => {
    new Function('SEED', SETUP)(SEED); const W = window.WSE, S = W.S, sc = window.__sc, rows = []; let acc = { rev: 0, cost: 0 }, nRiv0 = (S.rivals || []).length;
    const rv = () => (S.rivals || []).filter(x => !x.sub).map(x => ({ n: x.name, role: W.eco.role(x), cash: Math.round(x.cash), att: +(x.att.basic || 0).toFixed(3), px: +((x.px && x.px.basic) || 1).toFixed(3) }));
    for (let d = 1; d <= DAYS; d++) {
      if (plan.war && d === plan.war[0]) S.prod.bread.pf = plan.px;
      if (plan.war && d === plan.war[1]) S.prod.bread.pf = 1;
      if (plan.poor && d === plan.war[0]) { const t = S.rivals.find(x => x.name === plan.poor); if (t) t.cash = 0.01 * W.riv.value(t); }
      W.step();
      const ps = S.prod.bread, sh = S._nd && S._nd.sh && S._nd.sh.bread, D = (S._nd && S._nd.D.bread) || 1, shelf = sc.shops.reduce((a, c) => a + ((c.sales && c.sales.bread) || 0), 0);
      const mc = W.mk.makeCost ? W.mk.makeCost('bread').unit : 0; acc.rev += ps.rev + (ps.b2bV || 0); acc.cost += (shelf + (ps.b2b || 0)) * mc;
      if (d % 10 === 0) rows.push({ d, me: +((shelf + (ps.b2b || 0)) / D).toFixed(4), shelf: Math.round(shelf), b2b: Math.round(ps.b2b || 0), exp: Math.round(ps.exp || 0), npc: sh ? +sh.npc.toFixed(3) : null, riv: sh ? +sh.riv.toFixed(3) : null, px: +W.prodPrice('bread').toFixed(3), std: +W.stdPrice('bread').toFixed(3), cost: +mc.toFixed(3), mrg: +(acc.rev - acc.cost).toFixed(0), cash: Math.round(S.cash), rv: rv(), cede: (S.rv && S.rv.cede) || 0, wars: (S.rv && S.rv.wars) || 0 });
      if (d % 10 === 0) acc = { rev: 0, cost: 0 };
    }
    return { rows, nRiv0, nRiv: (S.rivals || []).filter(x => !x.sub).length, log: ((S.rv && S.rv.log) || []).slice(-12).map(x => 'j' + x.d + ' ' + x.n + ' : ' + x.t) };
  }, { SETUP, SEED, DAYS, plan });
  r.errs = pg.errs.slice(0, 3); await pg.context().close(); r.name = name; return r;
}
(async () => {
  const res = [];
  res.push(await run('A_entree', {}));
  res.push(await run('B_C_guerre_retour', { war: [60, 150], px: 0.6 }));
  res.push(await run('D_faillite', { war: [60, 9999], px: 0.6, poor: 'Mega Mart' }));
  await L.closeBrowser();
  const at = (r, d) => r.rows.find(x => x.d === d) || r.rows[r.rows.length - 1];
  res.forEach(r => { console.log(`\n== ${r.name} (rivaux ${r.nRiv0} → ${r.nRiv})`); r.rows.forEach(x => console.log(`j${x.d}\tpart ${(100 * x.me).toFixed(2)} %\trayon ${x.shelf}\tgros ${x.b2b}\texport ${x.exp}\tville ${(100 * x.npc).toFixed(1)} %\trivaux ${(100 * x.riv).toFixed(1)} %\tprix ${x.px} (std ${x.std}, coût ${x.cost})\tmarge 10 j ${x.mrg}\tcolombes cèdent ${x.cede}\t${x.rv.map(v => v.n.split(' ')[0] + ':' + v.role[0] + ':' + v.att + '@' + v.px).join(' ')}`)); r.log.forEach(l => console.log('   ' + l)); if (r.errs.length) console.log('ERREURS', r.errs); });
  if (OUT) require('fs').writeFileSync(OUT, JSON.stringify(res, null, 1));
})();
