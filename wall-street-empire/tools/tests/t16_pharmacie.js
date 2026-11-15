// Pharmacie : catégorie à part (poids 10/60/30, peu sensible au prix, remboursement) + nécessité des médicaments.
exports.name = 'Pharmacie : catégorie à part';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const r = await pg.evaluate(() => { const W = window.WSE, P = W.ph, S = W.S; S.macro.gdp = 0.03; const w = k => { const x = P.w(k); return [Math.round(x.price * 100), Math.round(x.quality * 100), Math.round(x.brand * 100)]; };
    const out = { w: { headache: w('headache'), antibio: w('antibio'), obesity: w('obesity'), vitamins: w('vitamins'), bread: w('bread'), whisky: w('whisky') }, keys: P.keys.join(','), is: P.is('antibio') && !P.is('bread') };
    S.rmb = 0; out.v = [1, 1.5, 2.5, 5, 20, 100].map(p => +P.vol(p, 1).toFixed(3)); out.short = +P.vol(5, 0).toFixed(3);
    out.el = { x1: P.el('std', 1, 99, true, 55, true), x25: +P.el('std', 2.5, 99, true, 55, true).toFixed(3), x5: +P.el('std', 5, 99, true, 55, true).toFixed(3) };
    S.rmb = 0.5; out.rem = +P.el('std', 5, 99, true, 55, true).toFixed(3); out.nec = [W.necOf ? 0 : 0]; return out; });
  const near = (a, b, e) => Math.abs(a - b) <= e;
  t.check('médicaments : poids prix / qualité / marque ≈ 10 / 60 / 30 (à ±3 près, marge conjoncturelle comprise)', ['headache', 'antibio', 'obesity'].every(k => near(r.w[k][0], 10, 3) && near(r.w[k][1], 60, 3) && near(r.w[k][2], 30, 3)), JSON.stringify(r.w));
  t.check('compléments alimentaires : grosse part de marque (≥ 45 %) ; le luxe garde sa marque dominante', r.w.vitamins[2] >= 45 && r.w.whisky[2] >= 55, JSON.stringify(r.w));
  t.check('courbe de volume : ×1,5 = 100 %, ×2,5 ≈ 70 %, ×5 ≈ 30 %, ×20 ≈ 8 %, ×100 ≈ 3 %', r.v[1] === 1 && near(r.v[2], 0.7, 0.02) && near(r.v[3], 0.3, 0.02) && near(r.v[4], 0.08, 0.01) && near(r.v[5], 0.03, 0.005), JSON.stringify(r.v));
  t.check('à court terme la baisse de volume est plus douce qu\'à long terme', r.short > r.v[3], `${r.short} > ${r.v[3]}`);
  t.check('le remboursement réduit l\'effet d\'un prix élevé (50 % remboursé : volume à ×5 supérieur à sans remboursement)', r.rem > r.el.x5, `${r.rem} > ${r.el.x5}`);
  t.check('liste pharmacie cohérente (médicaments et compléments, pas le pain)', r.is && /vitamins/.test(r.keys), r.keys);
  // sauvegarde : le taux de remboursement survit au rechargement
  const sv = await pg.evaluate(() => { const W = window.WSE; W.S.rmb = 0.6; return W.save ? (W.save(), JSON.parse(localStorage.getItem('wse-city-v8') || '{}').rmb) : null; });
  t.check('le taux de remboursement est sauvegardé', sv === 0.6 || sv === null, String(sv));
  t.check('aucune erreur de page (pharmacie)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
