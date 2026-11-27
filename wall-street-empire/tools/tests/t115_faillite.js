// Économie de marché, lot 5 (décision et correction de Rémy) : la faillite du joueur est réelle, en libéral pur, et le free cash flow négatif n'est jamais « magique » :
// il émerge de la situation du joueur (marges, stocks, production, coûts fixes, dette) et de sa réaction. Faillite = trésorerie sous le découvert toléré ET plus aucun prêteur
// ET plus aucun investisseur, pendant le délai de procédure (INS_END jours) ; aucun renflouement.
// Scénario déterministe (graine fixe, hash) : boulangerie industrielle (deux fermes de blé, deux moulins, trois boulangeries, deux supermarchés), financée à crédit (intérêts ≈ l'excédent brut d'exploitation d'avant le choc).
// Choc SECTORIEL au jour 90 : la restauration perd 40 % de ses repas (type Covid) ; les ménages continuent d'acheter du pain (et en achètent un peu plus). Trois joueurs :
//  - trésorerie négative, surendetté (banque saturée, valorisation négative) : banqueroute après le délai de grâce, fin de partie, causes récapitulées ;
//  - même trou de trésorerie, refinancement possible : la banque et les investisseurs comblent, la partie continue ;
//  - passif contre réactif (production à la demande prévue, information, déstockage, prix) : le réactif garde plus de trésorerie ;
//  - bien capitalisé et passif : pas de dette ; il absorbe le choc.
exports.name = 'Faillite du joueur : choc sectoriel, situation et réaction du joueur';
const SETUP = `const W = window.WSE; W.startMode('round', { start: 'moyenne' }); const S = W.S; S.rs = 7001; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); S.cash = 6e7;
  ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
  const T = window.T, N = W.N; T.onDep('fwheat', 'wheat'); T.onDep('fwheat', 'wheat'); T.inP('f1'); T.inP('f1'); const fs = [T.inP('f1'), T.inP('f1'), T.inP('f1')]; fs.forEach(f => W.easyLaunch(f, 'bread'));
  const near = t => { for (let r = 0; r < 16; r++) for (let y = 23 - r; y <= 37 + r; y++) for (let x = 23 - r; x <= 37 + r; x++) if (!W.footprintError(x, y, t) && W.place(x, y, t)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } return null; };
  ['s2', 's2'].forEach(t => { const c = near(t); if (c) W.shopUI.act(c, 'put:0:bread'); });`;
async function run(L, mode) {
  const pg = await L.newPage({ wait: 600 }); await L.inject(pg);
  const r = await pg.evaluate(({ SETUP, mode }) => {
    new Function(SETUP)(); const W = window.WSE, S = W.S, E = W.eco, o = { nLend: 0, nRaise: 0, warn: 0 }; let ebe = 0;
    for (let d = 0; d < 90; d++) { W.step(); if (d >= 60) ebe += S.m30[S.m30.length - 1][1]; }
    ebe /= 30; o.ebe0 = Math.round(ebe);
    if (mode === 'passive' || mode === 'react') { S.loan = (S.loan || 0) + Math.max(0, ebe) * 360 / Math.max(0.01, W.loanRateNow()); S.cash = 3e5; }   // financé à crédit : intérêts ≈ l'EBE d'avant le choc
    if (mode === 'refused' || mode === 'refi') { S.cash = -5e6; if (mode === 'refused') S.loan = (S.loan || 0) + 2e8; }   // trou de trésorerie ; « refused » : surendetté (valorisation négative, banque saturée)
    E.ich.shock(0.6, 9999);   // restauration −40 % (circuit « rhd »)
    for (let d = 0; d < (mode === 'refi' ? 150 : 400) && !S.mode.done; d++) {   // refi : la période où le premier joueur fait banqueroute, et au-delà
      if (mode === 'react' && d === 5) { const ps = S.prod.bread; ps.plan = 'dem'; ps.ish = 1; ps.pf = 0.97; }
      if (mode === 'react' && d === 6 && S.prod.bread.stock > 3 * ((S.prod.bread.sold || 0) + (S.prod.bread.b2b || 0))) { const v = S.prod.bread.stock * W.prodPrice('bread') * 0.4; S.cash += v; S.prod.bread.stock = 0; o.clr = Math.round(v); }   // solder le stock dormant (même règle que « Vider le stock »)
      W.step();
      const Lv = E.insolv.levers();   // tout joueur se défend avec la banque et les investisseurs, tant qu'ils acceptent
      if (Lv.hole > 0 && Lv.lend > 1000) { const x = Math.min(Lv.lend, Lv.hole + 2e5); S.loan += x; S.cash += x; o.nLend++; }
      else if (Lv.hole > 0 && Lv.inv > 0 && E.insolv.raise()) o.nRaise++;
    }
    o.day = S.day; o.done = S.mode.done; o.bkr = S.mode.bkr || null; o.cash = Math.round(S.cash); o.val = Math.round(W.valuation()); o.home = Math.round(E.dem('bread'));
    o.warn = (S.jr || []).filter(x => /Cessation de paiements|découvert toléré/.test(JSON.stringify(x))).length;
    return o; }, { SETUP, mode });
  r.errs = pg.errs.slice(0, 3); await pg.context().close(); return r;
}
exports.run = async (t, L) => {
  const X = await run(L, 'refused'), X2 = await run(L, 'refused'), Y = await run(L, 'refi'), P = await run(L, 'passive'), R = await run(L, 'react'), C = await run(L, 'rich');
  t.check('trésorerie négative + crédit et actions refusés : banqueroute, fin de partie (après le délai de grâce)', X.done === 'lose' && !!X.bkr && X.day >= 90 + 30, JSON.stringify({ jour: X.day, fin: X.done, cash: X.cash, val: X.val }));
  t.check('alertes au journal avant la banqueroute (le joueur a le temps de réagir)', X.warn >= 1, `${X.warn} alertes`);
  t.check('récapitulatif des causes à la fin (trésorerie, dette, BFR, conjoncture)', !!X.bkr && /dette/.test(X.bkr.why) && /BFR/.test(X.bkr.why) && /conjoncture/.test(X.bkr.why), X.bkr ? X.bkr.why.slice(0, 160) : '');
  t.check('même trou de trésorerie mais refinancement possible (banque, investisseurs) : pas de fin de partie (150 jours après le trou)', !Y.done && !Y.bkr && Y.nLend + Y.nRaise >= 1, JSON.stringify({ jour: Y.day, emprunts: Y.nLend, levées: Y.nRaise, cash: Y.cash }));
  t.check('déterminisme : même issue au même jour', X.day === X2.day && X.done === X2.done, `${X.day} / ${X2.day}`);
  t.check('choc sectoriel, joueur endetté : celui qui réagit (production à la demande, information, déstockage, prix) finit avec plus de trésorerie que le passif', R.cash > P.cash, `réactif ${R.cash} $ contre passif ${P.cash} $`);
  t.check('bien capitalisé, même passif : il absorbe le choc', !C.done && !C.bkr, JSON.stringify({ jour: C.day, cash: C.cash, val: C.val }));
  const errs = [X, X2, Y, P, R, C].reduce((a, x) => a.concat(x.errs), []); t.check('0 erreur de page', errs.length === 0, errs.slice(0, 3).join(' | '));
};
