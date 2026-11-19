// Passe 69 : le promoteur « Trump » — droits à bâtir qui suivent la ville, promotion en une fois avec charge foncière, tours baptisées et marque de prestige,
// programmes emblématiques (hôtel, casino, centre commercial, golf), parc immobilier à la valeur de marché, cycle bulle / krach, liquidité, levier et ventes forcées,
// achat-revente avec garde « l'acquéreur garde 2 ans », population créée par les projets du promoteur et synergies affichées, sauvegarde.
exports.name = 'Promoteur Trump : promotions, marque, cycle immobilier, levier, démographie';

exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 600 }); await L.setup(pg, { caste: 'promoteur', cash: 5e8 }); await L.inject(pg);
  const A = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, P = W.pro, T = window.T, o = {}; S.done = W.acq.MISSIONS.map(m => m.id); S.macro.boom = 0; S.macro.rate = 0.03; S.macro.gdp = 0.03; P.PR().hype = 0; P.PR().cy = { bub: 0, k: 0, rmin: 0.03, n: 0 };
    // droits à bâtir : au moins la grande hauteur du promoteur ; ils montent avec la population
    const x0 = 30, y0 = 31; o.mx0 = P.maxAt(x0, y0); o.base = P.maxFl(); const p0 = S.pop; S.pop = 600000; o.mx1 = P.maxAt(x0, y0); S.pop = p0;
    // opportunités et devis
    const d = P.deals(5, -1); o.nd = d.length; const q = d[0]; o.q = q && { fl: q.fl, total: q.total, value: q.value, gain: q.gain, margin: q.margin, rights: q.rights, npc: q.npc };
    // promotion : trésorerie débitée du devis, chantier, aucune capacité avant livraison
    const cap0 = S.stats.cap, cash0 = S.cash, v0 = W.valuation(); const r = P.develop(q.x, q.y, q.fl); o.dev = r.ok; o.paid = cash0 - S.cash; o.total = q.total;
    const b = S.grid[q.y * N + q.x]; o.works = !!(b && b.works && b.works.k === 'new'); W.refreshStats ? W.refreshStats() : 0; o.capDuring = S.stats.cap - cap0;
    let g = 0; while (b.works && g++ < 400) T.stepN(1, true); o.days = g; o.bn = b.bn || ''; o.fl = b.floors; o.brand = P.brand(); o.brandK = P.brandK(b);
    o.capAfter = P.demo().cap; o.expCap = 5 * 30 * b.floors;
    o.v1 = W.valuation(); o.mtm = P.mtm().mkt; o.adj = P.mtm().adj; o.fvIn = S.stats.fv >= P.mtm().mkt; o.val = P.value(b).v;
    // démographie : population créée, attractivité, écrans
    const dm = P.demo(); o.demo = { pop: dm.pop, share: dm.share, units: dm.units, fl: dm.fl }; o.attr = P.attrCity(); const sy = P.syn(); o.syn = [sy.give.pop, sy.get.jobs];
    { const sec = document.getElementById('ops').closest('section'); if (sec) sec.hidden = false; const pn = document.getElementById('panel'); if (pn) pn.hidden = false; } P.render(); const ops = document.getElementById('ops'); o.ops = ops ? ops.innerHTML : ''; o.cityTxt = P.cityHTML();
    // programme emblématique : hôtel sur la tour (≥ 8 étages), loyer de l'étage relevé à l'ouverture
    const rent0 = P.value(b).rentFl; const pr = P.prog(b.x, b.y, 'hotel'); o.prog = pr.ok; g = 0; while (b.works && g++ < 200) T.stepN(1, true); o.progK = P.value(b).rentFl / rent0; o.progN = b.prog;
    o.progErrOther = P.progErr(b, 'mall');   // 3 à 12 étages
    // golf : agrément pour le voisinage
    return o;
  });
  t.check('droits à bâtir : au moins la grande hauteur du promoteur, plus haut quand la ville grandit', A.mx0 >= A.base && A.mx1 > A.mx0, `${A.base} / ${A.mx0} / ${A.mx1} étages`);
  t.check('opportunités : biens ou lots sous-valorisés trouvés', A.nd >= 3, String(A.nd));
  t.range('marge de la meilleure promotion après charge foncière (ni gratuite ni nulle)', A.q.margin * 100, 15, 160, ' %', 0);
  t.check('charge foncière prélevée sur la valeur créée', A.q.rights > 0, String(A.q.rights));
  t.check('promotion lancée : le prix payé est celui du devis', A.dev && Math.abs(A.paid - A.total) <= Math.max(5000, 0.01 * A.total), `${A.paid} / ${A.total}`);
  t.check('pas de capacité d\'habitat pendant le chantier', A.works && A.capDuring === 0, String(A.capDuring));
  t.check('livraison : la tour loge autant qu\'un immeuble de la ville (150 habitants par étage)', A.capAfter === A.expCap, `${A.capAfter} / ${A.expCap}`);
  t.check('tour de 10 étages ou plus baptisée, la marque démarre', (A.fl < 10 || (A.bn.indexOf('Tower') >= 0 && A.brand > 0 && A.brandK > 1)), `${A.fl} ét. « ${A.bn} » marque ${A.brand.toFixed(3)} prime ${A.brandK.toFixed(3)}`);
  t.check('valorisation : la tour livrée compte à sa valeur de marché (plus que son coût)', A.adj > 0 && A.mtm > A.total * 0.9, `parc ${Math.round(A.mtm)} (réévaluation ${Math.round(A.adj)}) · coût ${A.total}`);
  t.check('population créée par tes projets mesurée', A.demo.pop > 0 && A.demo.units >= 1 && A.attr > 1, JSON.stringify(A.demo) + ' attr ' + A.attr.toFixed(3));
  t.check('écran Opérations : population créée, synergies dans les deux sens, marque, cycle', /POPULATION CRÉÉE/.test(A.ops) && /CE QUE TU APPORTES/.test(A.ops) && /T'APPORTENT/.test(A.ops) && /MARQUE DE PRESTIGE/.test(A.ops) && /Cycle/.test(A.ops));
  t.check('programme hôtel : loyer de l\'étage relevé (×1,6)', A.prog && A.progN === 'hotel' && A.progK > 1.4 && A.progK < 1.8, A.progK.toFixed(2));
  t.check('règles des programmes (centre commercial : 12 étages au plus)', /12 étages au plus/.test(A.progErrOther) || A.fl <= 12, A.progErrOther);

  // ---------- cycle : krach (valeurs, liquidité, expertises), bulle qui éclate à la remontée des taux
  const B = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, P = W.pro, T = window.T, o = {}; const L = P.port()[0];
    S.day++; const v0 = P.value(L).v, m0 = P.mktK(), i0 = P.immoIdx(), q0 = P.liq();
    P.PR().cy.k = 0.6; S.day++; o.v = P.value(L).v / v0; o.mkt = [m0, P.mktK()]; o.idx = [i0, P.immoIdx()]; o.liq = [q0, P.liq()];
    P.PR().cy = { bub: 0.6, k: 0, rmin: 0.03, n: 0 }; S.macro.rate = 0.045; P.cycle(); o.kr = P.PR().cy.k; o.n = P.PR().cy.n;
    P.PR().cy = { bub: 0, k: 0, rmin: 0.03, n: 0 }; S.macro.rate = 0.03; return o;
  });
  t.range('krach : valeur des biens', B.v * 100, 45, 85, ' % avant', 0);
  t.check('krach : vente immédiate décotée, liquidité et expertises en baisse', B.mkt[1] < B.mkt[0] - 0.05 && B.liq[1] < 0.5 && B.idx[1] < B.idx[0], JSON.stringify(B));
  t.check('la bulle éclate quand les taux remontent', B.kr > 0.3 && B.n === 1, `intensité ${B.kr}`);

  // ---------- levier : emprunt au plafond (×5), krach, appel de marge, vente forcée de l'immobilier
  const pg2 = await L.newPage({ wait: 500 }); await L.setup(pg2, { caste: 'promoteur', cash: 3e6 }); await L.inject(pg2);
  const C = await pg2.evaluate(() => {
    const W = window.WSE, S = W.S, P = W.pro, T = window.T, o = {}; S.done = W.acq.MISSIONS.map(m => m.id); S.macro.rate = 0.03; S.macro.gdp = 0.03; P.PR().cy = { bub: 0, k: 0, rmin: 0.03, n: 0 }; S.loan = 0;
    let n = 0; const up = document.getElementById('loanUp'); for (let i = 0; i < 200; i++) { const d = P.deals(3, 0.05)[0]; if (!d) break; while (S.cash < d.total && i++ < 400) { const l = S.loan; up.click(); if (S.loan === l) break; } if (S.cash < d.total) break; if (P.develop(d.x, d.y, d.fl).ok) n++; else break; }
    o.n = n; for (let i = 0; i < 160; i++) T.stepN(1, true); o.ltv0 = P.ltv(); o.loan = S.loan; o.port0 = P.port().length;
    while (P.ltv() < 0.88) { const l = S.loan; up.click(); if (S.loan === l) break; }
    o.ltvMax = P.ltv(); P.PR().cy.k = 0.8; S.macro.rate = 0.07; for (let i = 0; i < 45; i++) T.stepN(1, true);
    o.forced = P.PR().st.forced || 0; o.port1 = P.port().length; o.ltv1 = P.ltv(); o.done = S.mode && S.mode.done || null; return o;
  });
  t.check('levier : promotions financées à crédit', C.n >= 2 && C.loan > 0, JSON.stringify(C));
  t.check('krach sur levier fort : appel de marge puis ventes forcées de l\'immobilier', C.forced >= 1 && C.port1 < C.port0, `${C.forced} vente(s) forcée(s), parc ${C.port0} -> ${C.port1}, LTV ${C.ltvMax.toFixed(2)} -> ${C.ltv1.toFixed(2)}`);

  // ---------- achat-revente : rachat sous la valeur, annonce au-dessus, l'acquéreur garde le bien 2 ans
  const D = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, P = W.pro, T = window.T, o = {}; P.PR().hype = 0.4; let c = null;
    for (let i = 0; i < N * N && !c; i++) { const b = S.grid[i]; if (b && b.t === 'npc' && (b.k === 'res' || b.k === 'house') && P.buyCheck(b).ok) c = b; }
    const k = P.buyCheck(c); o.ask = k.price / P.value(c).v; P.keep(c.x, c.y); P.list(c.x, c.y, 1.12); const g0 = P.PR().st.gain; let g = 0; while (W.acq.ownerOf(c) === 'me' && g++ < 46) T.stepN(1, true);
    o.sold = W.acq.ownerOf(S.grid[c.y * N + c.x]) !== 'me'; o.gain = P.PR().st.gain - g0; o.again = P.buyCheck(S.grid[c.y * N + c.x]).ok; o.why = P.buyCheck(S.grid[c.y * N + c.x]).why; return o;
  });
  t.check('achat-revente : racheté sous la valeur (réseau du promoteur), revendu avec plus-value', D.ask < 1 && D.sold && D.gain > 0, JSON.stringify(D));
  t.check('l\'acquéreur ne revend pas aussitôt (pas de boucle infinie sur le même bien)', !D.again, D.why);

  // ---------- hors promoteur : règles de la passe 34 inchangées
  const E = await pg.evaluate(() => { const W = window.WSE, P = W.pro, o = {}; W.setCaste('industriel'); o.mx = P.maxAt(30, 31); o.base = P.maxFl(); o.prog = P.progErr(P.port().find(c => c.t === 'res'), 'hotel'); W.setCaste('promoteur'); return o; });
  t.check('hors promoteur : hauteur de base, pas de programme emblématique', E.mx === E.base && /réservés/.test(E.prog), JSON.stringify(E));

  // ---------- sauvegarde : nom de tour et programme
  const F1 = await pg.evaluate(() => { const W = window.WSE, P = W.pro, b = P.port().find(c => c.bn || c.prog); W.save(); return b ? { x: b.x, y: b.y, bn: b.bn, pg: b.prog } : null; });
  await pg.reload(); await pg.waitForTimeout(700);
  const F2 = await pg.evaluate(o => { const W = window.WSE, c = W.S.grid[o.y * W.N + o.x]; return c ? { bn: c.bn, pg: c.prog } : null; }, F1);
  t.check('sauvegarde : tour baptisée et programme emblématique restaurés', F1 && F2 && F2.bn === F1.bn && F2.pg === F1.pg, JSON.stringify([F1, F2]));
  t.check('aucune erreur JavaScript', pg.errs.length === 0 && pg2.errs.length === 0, pg.errs.concat(pg2.errs).slice(0, 3).join(' | '));
};
