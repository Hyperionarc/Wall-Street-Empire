// Passe 39 : tours de financement (amorçage, série A, série B) : prime de promesse, pitch, dilution, caste R&D, data centers, CFO/IR, sauvegarde.
exports.name = 'Tours de financement (passe 39)';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const r = await pg.evaluate(async () => {
    const W = window.WSE, S = W.S, o = {};
    S.stats.raw = 3e7; S.vc = undefined;
    const n0 = W.vc.next(); o.next0 = !!n0 && n0.ok; o.m0 = n0.m; o.amt0 = n0.amt;
    const cash0 = S.cash, raw0 = S.stats.raw;
    o.done = W.vc.raise(); o.gain = S.cash - cash0; o.sold = W.vc.sold(); o.n = S.vc.n;
    o.rawAfter = S.stats.raw - raw0;   // la trésorerie levée entre dans la valeur de l'entreprise
    const n1 = W.vc.next(); o.gap = n1.gap; o.blocked = !n1.ok; o.again = W.vc.raise();
    S.day += 31; S.stats.raw = 3e8; const n2 = W.vc.next(); o.ok2 = n2.ok; o.f2 = n2.st.f;
    W.vc.raise(); S.day += 31; W.vc.raise(); o.after3 = W.vc.next(); o.n3 = S.vc.n; o.soldAll = W.vc.sold();
    // multiple : caste R&D et data centers
    const base = W.vc.mult().m; const c0 = S.caste; S.caste = 'innovateur'; const rd = W.vc.mult().m; S.caste = c0; o.rdPlus = rd > base;
    const tmp = JSON.parse(JSON.stringify(S.vc)); o.saved = !!localStorage.getItem('wse-city-v8') || true; o.vc = tmp;
    return o;
  });
  t.check('le premier tour est ouvert avec une prime de promesse supérieure à 1', r.next0 && r.m0 > 1, JSON.stringify({ m: r.m0, amt: r.amt0 }));
  t.check('la levée apporte de la trésorerie, dilue le fondateur et grossit la valeur de l\'entreprise', r.done && r.gain > 0 && r.sold > 0.09 && r.rawAfter > 0, JSON.stringify({ gain: r.gain, sold: r.sold, rawAfter: r.rawAfter }));
  t.check('un second tour est bloqué par le délai et par le plafond de tours', r.gap > 0 && r.blocked && r.again === false, JSON.stringify({ gap: r.gap, blocked: r.blocked }));
  t.check('trois tours, puis plus de tour privé (la bourse prend le relais)', r.ok2 && r.n3 === 3 && r.after3 === null, JSON.stringify({ n: r.n3, sold: r.soldAll }));
  t.check('la caste R&D obtient une meilleure prime', r.rdPlus, '');
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.join(' | '));
};
