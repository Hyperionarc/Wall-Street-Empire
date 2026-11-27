// Économie de marché, lot 4 (retour de Rémy, cours de supply chain) : l'information dans la chaîne et l'effet coup de fouet.
//  1. coup de fouet mesurable : la variabilité des commandes augmente en remontant (consommateurs → commerces → grossistes → usines) ;
//  2. choc de demande de −40 % : des périmés chez les grossistes d'abord, l'invendu des fermes (engagées sur leurs récoltes et leurs cheptels) ensuite ; la demande de matières des usines
//     de la ville chute avec retard et amplification ;
//  3. ton usine qui suit la demande prévue : le partage d'information avec les commerces réduit l'erreur de prévision et la variabilité de la production ;
//     suivre la demande au lieu de produire à pleine capacité réduit le stock et le surplus soldé à l'export ;
//  4. indicateurs visibles dans la fiche d'usine : information intégrée ✓, erreur de prévision, couverture de stock, coup de fouet, périmés.
exports.name = 'Information dans la chaîne : coup de fouet, choc de demande, prévision intégrée';
const START = `window.__st = () => { const W = window.WSE; W.startMode('round', { start: 'moyenne' }); const S = W.S; S.rs = 7001; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); S.cash = 6e7; ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); };`;
exports.run = async (t, L) => {
  // 1 et 2 : chaîne des commerces de la ville, sans toi
  const pg = await L.newPage({ wait: 700 }); await L.inject(pg); await pg.evaluate(START);
  const a = await pg.evaluate(() => { window.__st(); const W = window.WSE, S = W.S, I = W.eco.ich, o = { per: [], sur: [], raw: [] };
    const st = () => S._ich, RH = ['bread', 'chicken', 'beefmeat', 'cheese'], P = () => RH.reduce((x, k) => x + st()[k].rhd.perC[1], 0), F = () => RH.reduce((x, k) => x + st()[k].rhd.surC, 0), FO = () => st().chicken.rhd.L[2].O; let p1 = 0, f1 = 0, pre = [], preF = [];
    for (let d = 0; d < 100; d++) { W.step(); if (d >= 70) { pre.push(P() - p1); preF.push(F() - f1); } p1 = P(); f1 = F(); }
    o.bw = I.bw('bread', 60); o.bwM = I.bw('drinkmilk', 60); o.r0 = FO(); o.home0 = W.eco.dem('bread'); o.pre = pre.reduce((a, x) => a + x, 0) / pre.length; o.preF = preF.reduce((a, x) => a + x, 0) / preF.length; I.shock(0.6, 60);
    for (let d = 0; d < 90; d++) { W.step(); o.per.push(P() - p1); o.sur.push(F() - f1); p1 = P(); f1 = F(); o.raw.push(FO() / o.r0); if (d === 30) o.home1 = W.eco.dem('bread'); }
    return o; });
  const b = a.bwM, up = b.cons < b.shop && b.shop < b.whole && b.whole < b.fac;
  t.check('coup de fouet (lait) : la variabilité des commandes croît en remontant (consommateurs < commerces < grossistes < usines)', up, `lait ${[b.cons, b.shop, b.whole, b.fac].map(x => (100 * x).toFixed(1) + ' %').join(' < ')}`);
  t.check('pain aussi : les commandes des grossistes et des usines varient au moins deux fois plus que les achats des consommateurs', a.bw.whole > 2 * a.bw.cons && a.bw.fac > 2 * a.bw.cons, `pain ${[a.bw.cons, a.bw.shop, a.bw.whole, a.bw.fac].map(x => (100 * x).toFixed(1) + ' %').join(' → ')}`);
  const avg3 = (v, i) => (v[i] + (v[i + 1] || v[i]) + (v[i + 2] || v[i])) / 3, fP = a.per.findIndex((x, i) => avg3(a.per, i) > 3 * a.pre + 1), fS = a.sur.findIndex((x, i) => avg3(a.sur, i) > 3 * a.preF + 1);   // premier jour où le rythme des pertes triple
  t.check('choc sectoriel (restauration −40 %, type Covid) : les périmés des grossistes de la restauration triplent dans les jours qui suivent', fP >= 0 && fP <= 10, `jour +${fP} (avant le choc : ${a.pre.toFixed(0)} par jour)`);
  t.check('… puis l\'invendu des fermes engagées, plus tard', fS > fP, `invendu agricole au jour +${fS} (avant : ${a.preF.toFixed(0)} par jour), périmés des grossistes au jour +${fP}`);
  const rmin = Math.min(...a.raw), rDay = a.raw.indexOf(rmin);
  t.check('les commandes des usines aux fermes (poulet, restauration) chutent avec retard et amplification (plus que −40 %)', rmin < 0.6 && rDay >= 2, `minimum ×${rmin.toFixed(2)} au jour +${rDay}`);
  t.check('nuance : les ménages continuent de manger du pain ; la demande en commerces ne baisse pas (repas reportés à la maison)', a.home1 >= 0.98 * a.home0, `${Math.round(a.home0)} → ${Math.round(a.home1)} baguettes/j`);
  // 3 : ton usine de pain qui suit la demande prévue, avec ou sans partage d'information ; pleine capacité pour comparer
  const fac = async (mode, ish) => { const p = await L.newPage({ wait: 700 }); await L.inject(p); await p.evaluate(START);
    const r = await p.evaluate(([mode, ish]) => { window.__st(); const W = window.WSE, S = W.S, T = window.T, N = W.N; T.onDep('fwheat', 'wheat'); T.inP('f1'); const f = T.inP('f1'); W.easyLaunch(f, 'bread');
      const near = t => { for (let r = 0; r < 16; r++) for (let y = 23 - r; y <= 37 + r; y++) for (let x = 23 - r; x <= 37 + r; x++) if (!W.footprintError(x, y, t) && W.place(x, y, t)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } return null; };
      const s = near('s2'); W.shopUI.act(s, 'put:0:bread'); S.prod.bread.pf = 1.25; if (mode) S.prod.bread.plan = mode; if (ish) S.prod.bread.ish = 1;   // prix au-dessus du marché : la ville t'achète peu en gros, la capacité dépasse la demande
      const out = [], exp = [], stk = []; for (let d = 0; d < 110; d++) { W.step(); if (d >= 40) { out.push(f.out || 0); exp.push(S.prod.bread.exp || 0); stk.push(S.prod.bread.stock); } }
      const m = out.reduce((x, v) => x + v, 0) / out.length, sd = Math.sqrt(out.reduce((x, v) => x + (v - m) * (v - m), 0) / out.length);
      W.openBuilding(f.x, f.y); const ui = document.getElementById('bview') ? document.getElementById('bview').innerHTML : '';
      return { cv: sd / Math.max(1e-6, m), m, err: S.prod.bread._pl.err, integ: S.prod.bread._pl.integ, exp: exp.reduce((x, v) => x + v, 0) / exp.length, stk: stk.reduce((x, v) => x + v, 0) / stk.length, ui: /Prévision et information/.test(ui) && /Erreur de prévision/.test(ui) && /Couverture de stock/.test(ui) && /Information intégrée/.test(ui) && /Coup de fouet/.test(ui) }; }, [mode, ish]);
    r.errs = p.errs.slice(0, 3); await p.context().close(); return r; };
  const cap = await fac(null, 0), dem = await fac('dem', 0), demI = await fac('dem', 1);
  t.check('ton usine suit la demande prévue : moins de surplus soldé à l\'export et moins de stock qu\'à pleine capacité', dem.exp < 0.5 * cap.exp + 1 && dem.stk < cap.stk, JSON.stringify({ cap: [Math.round(cap.exp), Math.round(cap.stk)], dem: [Math.round(dem.exp), Math.round(dem.stk)] }));
  t.check('partage d\'information avec les commerces : erreur de prévision plus faible', demI.err < dem.err, `${(100 * dem.err).toFixed(1)} % → ${(100 * demI.err).toFixed(1)} %`);
  t.check('partage d\'information : production moins variable (moins de coup de fouet chez toi)', demI.cv < dem.cv, `écart-type/moyenne ${(100 * dem.cv).toFixed(1)} % → ${(100 * demI.cv).toFixed(1)} %`);
  t.check('information intégrée ✓ (tes magasins vendent ta production)', dem.integ === true, String(dem.integ));
  t.check('fiche d\'usine : information intégrée, erreur de prévision, couverture de stock, coup de fouet', dem.ui, '');
  const errs = pg.errs.concat(cap.errs, dem.errs, demI.errs); t.check('0 erreur de page', errs.length === 0, errs.slice(0, 3).join(' | '));
  await pg.context().close();
};
