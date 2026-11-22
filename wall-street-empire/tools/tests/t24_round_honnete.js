// « Round honnête » : (1) lever du capital ne fait jamais gagner, (2) l'impôt n'achète pas l'humeur, (3) coût des technologies à l'échelle, (4) « Fabriquer » annonce le coût et vérifie la chaîne.
exports.name = 'Round honnête : capital, impôt, technologies, Fabriquer';
exports.run = async (t, L) => {
  // ---- 1. Levée de capital : la valorisation du fondateur (valeur d'entreprise × part) ne monte jamais par une levée
  let pg = await L.newPage({ wait: 600 }); await L.setup(pg, { caste: 'industriel', cash: 5e9 }); await L.inject(pg);
  const c1 = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; T.put('hq', 14, 44, 14, 44); T.stepN(2); W.refreshStats();
    const click = id => { const b = document.createElement('button'); b.id = id; document.getElementById('bourse').appendChild(b); b.click(); b.remove(); W.refreshStats(); };
    S.stats.raw = S.stats.raw;
    const v0 = W.valuation(), cash0 = S.cash; click('ipo'); T.stepN(1); const v1 = W.valuation(), cash1 = S.cash, fl1 = S.float;
    let vmax = v1; for (let i = 0; i < 6; i++) { click('raise'); T.stepN(1); vmax = Math.max(vmax, W.valuation()); }
    return { v0, v1, cash0, cash1, fl1, vmax, flEnd: S.float, cashEnd: S.cash };
  });
  t.check('IPO : trésorerie levée mais valorisation du fondateur non augmentée', c1.cash1 > c1.cash0 && c1.fl1 === 0.3 && c1.v1 <= c1.v0 * 1.001, JSON.stringify(c1));
  t.check('6 augmentations de capital : la valorisation du fondateur ne monte jamais (dilution comprise)', c1.vmax <= c1.v0 * 1.001 && c1.flEnd > c1.fl1 && c1.cashEnd > c1.cash1, JSON.stringify(c1));
  await pg.context().close();

  // ---- 2. Impôt : sans recettes dépensées, le taux ne change pas l'humeur ; le bonus de services est plafonné et à rendements décroissants
  pg = await L.newPage({ wait: 600 }); await L.setup(pg, { caste: 'industriel', cash: 5e9 }); await L.inject(pg);
  const c2 = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; const hap = tx => { S.tax = tx; S.taxEff = null; T.stepN(3); return S.stats.happy; };
    const lo = hap(0.05), hi = hap(0.45);
    const f = x => { S.taxEff = x; return W.taxSvc(); }, n = (S.taxEff = null, W.taxSvc()), a = f(0.05), b = f(W.lib.USM.corpTax), c = f(0.45)   /* lot 1 : référence = taux fixe américain */, d = f(0.8), z = f(50);
    return { lo, hi, n, a, b, c, d, z, d25: W.taxDrag(0.25), d45: W.taxDrag(0.45) };
  });
  t.check('maximiser l\'impôt n\'achète pas l\'humeur : écart 45 % vs 5 % ≤ 4 points (avant : 24)', c2.hi - c2.lo <= 4, JSON.stringify(c2));
  t.check('services publics : neutres au taux de référence, plafonnés (≤ +3), rendements décroissants', Math.abs(c2.n) < 1e-9 && Math.abs(c2.b) < 1e-9 && c2.z <= 3.01 && c2.a < 0 && c2.c > 0 && (c2.d - c2.c) < (c2.c - c2.b), JSON.stringify(c2));
  t.check('impôt > 25 % : l\'investissement / l\'afflux d\'habitants recule', c2.d25 === 1 && c2.d45 < 0.9, JSON.stringify(c2));
  await pg.context().close();

  // ---- 3. Technologies : 1 à 6 % de la capitalisation attendue de l'ère, jamais moins de 0,3 % du capex débloqué
  pg = await L.newPage({ wait: 600 });
  const c3 = await pg.evaluate(() => {
    const W = window.WSE, CAP = { 1: 20e6, 2: 120e6, 3: 400e6 }; if (!W.TECHS) return { err: 'TECHS non exposé' };
    const bad = [], avg = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
    W.TECHS.forEach(T => { const p = T.c / CAP[T.era]; avg[T.era][0] += T.c; avg[T.era][1]++; if (p < 0.01 - 1e-9 || p > 0.06 + 1e-9) bad.push(T.id + ' ' + (p * 100).toFixed(2) + ' %');
      Object.keys(W.TYPES).forEach(k => { if (W.TYPES[k].tech === T.id && T.c < 0.003 * W.TYPES[k].cost) bad.push(T.id + ' < 0,3 % du capex ' + k); }); });
    return { bad, m: [1, 2, 3].map(e => Math.round(avg[e][0] / avg[e][1])) };
  });
  t.check('chaque technologie coûte 1 à 6 % de la capitalisation de son ère et ≥ 0,3 % du capex', !c3.err && c3.bad.length === 0, JSON.stringify(c3));
  t.check('le coût moyen croît avec l\'ère', !c3.err && c3.m[0] < c3.m[1] && c3.m[1] < c3.m[2], JSON.stringify(c3));
  await pg.context().close();

  // ---- 4. « Fabriquer » : plan chiffré, confirmation, annulation, chaîne complète, message honnête
  pg = await L.newPage({ wait: 600 }); await L.setup(pg, { caste: 'industriel', cash: 5e9 }); await L.inject(pg);
  const c4 = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; if (!W.producePlan) return { err: 'pas de producePlan' };
    T.stepN(2); const nb = () => T.owned().length;
    const pk = W.PKEYS.find(k => S.prod[k].st === 'locked' && W.PRODUCTS[k].tier <= 1 && W.producePlan(k).raws > 0);
    if (!pk) return { err: 'aucun produit à matière manquante' };
    const P = W.producePlan(pk), cash0 = S.cash, n0 = nb();
    const r = W.askProduce(pk), vis = !document.getElementById('fabview').hidden, shown = document.getElementById('fabview').textContent;
    const stay = S.cash === cash0 && nb() === n0; W.fabCancel(); const cancelled = S.cash === cash0 && nb() === n0 && document.getElementById('fabview').hidden;
    W.askProduce(pk); const ok = W.fabConfirm(); T.stepN(1);
    const spent = cash0 - S.cash, after = W.producePlan(pk);
    return { pk, P: { total: P.total, build: P.build, raws: P.raws, rows: P.rows.length, complete: P.complete, missing: P.missing }, r, vis, hasTotal: /COÛT TOTAL/.test(shown), stay, cancelled, ok, spent, built: nb() - n0, after: { raws: after.raws, missing: after.missing, st: S.prod[pk].st } };
  });
  t.check('« Fabriquer » : plan chiffré avec extracteurs de matières premières', !c4.err && c4.P.total > 0 && c4.P.raws > 0 && c4.P.rows >= 2, JSON.stringify(c4));
  t.check('confirmation affichée avec le coût total, aucune dépense avant accord, annulation sans effet', !c4.err && c4.r === 'pending' && c4.vis && c4.hasTotal && c4.stay && c4.cancelled, JSON.stringify(c4));
  t.check('après confirmation : chaîne complète (plus de matière manquante) et dépense ≤ coût annoncé', !c4.err && c4.ok === true && c4.built >= 2 && c4.after.raws === 0 && c4.after.missing.length === 0 && c4.spent <= c4.P.total * 1.15 + 1, JSON.stringify(c4));
  const c5 = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; const nb = () => T.owned().length;
    const pk = W.PKEYS.find(k => S.prod[k].st === 'locked' && W.PRODUCTS[k].tier <= 1 && W.producePlan(k).raws > 0);
    if (!pk) return { skip: 1 };
    S.cash = 50; const n0 = nb(), ok = W.quickProduce(pk); return { ok, built: nb() - n0, cash: S.cash };
  });
  t.check('trésorerie insuffisante : rien n\'est construit à moitié', c5.skip || (c5.ok === false && c5.built === 0), JSON.stringify(c5));
  const c6 = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; S.cash = 5e9; const bad = []; const sg = W.mk.suggest() || [];
    sg.forEach(x => { if (x.route === 'make' && /tout pour le faire/.test(x.why)) { const m = W.producePlan(x.pk); if (m.raws > 0 || m.buys.length) bad.push(x.pk); } });
    return { bad, n: sg.length };
  });
  t.check('le message « tu as déjà tout pour le faire » n\'apparaît plus quand une matière manque', c6.bad.length === 0, JSON.stringify(c6));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
