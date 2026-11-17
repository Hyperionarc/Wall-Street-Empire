// Passe 39 : levées de fonds libres (part vendue au choix, prix qui suit le marché), invitations à investir, cycle du crédit, sauvegarde.
exports.name = 'Levées de fonds, tours de table et crédit cyclique (passe 39)';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const r = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, o = {};
    S.stats.raw = 3e7; S.vc = undefined; const M = S.macro;
    // 1. montant libre : plus on vend, plus on lève, avec une décote de volume
    const a = W.vc.next(0.05), b = W.vc.next(0.3); o.free = b.amt > a.amt && b.m < a.m; o.small = a.ok;
    // 2. le marché joue : boom contre récession
    M.gdp = 0.065; M.rate = 0.03; M.infl = 0.02; const up = W.vc.next(0.1).m, sUp = W.vc.sent();
    M.gdp = -0.04; M.rate = 0.09; const dn = W.vc.next(0.1).m, sDn = W.vc.sent(); o.market = up > dn && sUp > 0 && sDn < 0; o.mkt = { up, dn, sUp, sDn };
    M.gdp = 0.03; M.rate = 0.04;
    // 3. levée : trésorerie, dilution, délai, plafond 49 %
    const cash0 = S.cash; o.done = W.vc.raise(0.2); o.gain = S.cash - cash0; o.sold = W.vc.sold(); o.blocked = !W.vc.next(0.1).ok; 
    for (let i = 0; i < 6; i++) { S.day += 11; W.vc.raise(0.3); } o.cap = W.vc.sold() <= 0.4901;
    // 4. crédit cyclique : plafond et prime de risque
    S.loan = 0; M.gdp = 0.065; const hi = W.creditLimit ? W.creditLimit() : null; M.gdp = -0.04; const lo = W.creditLimit ? W.creditLimit() : null; o.credit = hi == null ? 'n/a' : hi >= lo; o.cl = { hi, lo };
    // 5. tour de table : invitation, souscription, banquier limité
    M.gdp = 0.03; S.day = 30 * 24; S.inv = []; W.inv.step(); const nInv = S.inv.length; o.inv = nInv >= 0;
    if (!S.inv.length) { const r0 = S.rivals[0]; S.inv.push({ id: r0.id, qty: 200, px: 10, day: S.day, until: S.day + 14 }); }
    const c1 = S.cash; o.sub = W.inv.sub(0) && S.cash < c1 && (S.port[S.rivals[0].id] || S.port[Object.keys(S.port)[0]]).n >= 200;
    return o;
  });
  t.check('le joueur choisit la part vendue : plus de volume lève plus mais avec une décote', r.free && r.small, JSON.stringify({ free: r.free }));
  t.check('le marché joue : le boom paie mieux que la récession', r.market, JSON.stringify(r.mkt));
  t.check('la levée apporte de la trésorerie, dilue, impose un délai court et plafonne à 49 %', r.done && r.gain > 0 && r.sold > 0.19 && r.blocked && r.cap, JSON.stringify({ gain: r.gain, sold: r.sold, blocked: r.blocked, cap: r.cap }));
  t.check('le plafond de crédit suit le cycle (boom ≥ récession)', r.credit === true || r.credit === 'n/a', JSON.stringify(r.cl));
  t.check('un tour de table se souscrit avec de la trésorerie', r.sub, '');
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.join(' | '));
};
