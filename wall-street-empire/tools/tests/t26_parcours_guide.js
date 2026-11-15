// Parcours guidé : premier écran, conseiller à jalons chiffrés (4 phases), rendements décroissants, classement et récaps, dates, sauvegarde, terrain du siège.
exports.name = 'Parcours guidé (premier écran, jalons, rendements, classement, dates)';
exports.run = async (t, L) => {
  const start = async (pg, caste, mode) => pg.evaluate(async ([caste, mode]) => {
    const W = window.WSE; document.getElementById('caste').hidden = true; W.startMode(mode || 'round'); W.setCaste(caste || 'industriel');
    ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.S.noEv = true; W.setSpeed(0); W.S.cash = 5e8; await new Promise(x => setTimeout(x, 450)); return true;
  }, [caste, mode]);

  // 1. Premier écran
  const pg = await L.newPage({ wait: 3800 }); await L.inject(pg);
  await pg.evaluate(() => { try { window.WSE.coach.setPanel(true); } catch (e) {} });
  await start(pg, 'promoteur', 'round');
  const f = await pg.evaluate(() => { const W = window.WSE, c = W.coach.camTile(), o = document.getElementById('objbar').textContent; return { cam: c, near: W.coach.builtNear(Math.round(c.x), Math.round(c.y), 4), panel: !document.getElementById('panel').hidden, obj: o, id: W.S.coach && W.S.coach.id, cityX: c.x > 12 && c.x < 48 && c.y > 12 && c.y < 48 }; });
  t.check('la caméra initiale est sur du bâti (ville), pas sur le port vide', f.near >= 10 && f.cityX, JSON.stringify({ cam: f.cam, near: f.near }));
  t.check('le panneau « Bureau du PDG » est fermé au lancement', f.panel === false, '');
  t.check('un objectif clair et chiffré, cohérent avec le commerce, est affiché', /Objectif :.*commerce/.test(f.obj) && /coût .*\$/.test(f.obj) && /min/.test(f.obj) && /Phase 1\/4 · Commerce/.test(f.obj), f.obj.slice(-170));
  const sc = await L.newPage({ wait: 3800 });
  await start(sc, 'industriel', 's2');
  const f2 = await sc.evaluate(() => { const W = window.WSE, c = W.coach.camTile(); return { near: W.coach.builtNear(Math.round(c.x), Math.round(c.y), 4), panel: !document.getElementById('panel').hidden }; });
  t.check('scénario : même premier écran (bâti, panneau fermé)', f2.near >= 10 && !f2.panel, JSON.stringify(f2));
  await sc.context().close();

  // 2. Jalons cohérents avec l'état : trois états simulés
  const S3 = await pg.evaluate(() => {
    const W = window.WSE, C = W.coach, T = window.T, S = W.S, r = {};
    const show = o => { const c = C.pick(o); return c ? { id: c.id, ph: c.ph, cost: c.cost, gain: c.gain, min: c.min, years: c.years } : null; };
    r.a = show(C.st(true));                                   // A : rien de construit
    for (let i = 0; i < 3; i++) T.inC('s1'); T.stepN(12, true); r.shops = C.st(true).shops;
    const o2 = C.st(true); r.b = show(o2);                    // B : 3 commerces, pas d'usine
    const o3 = Object.assign({}, o2, { fac: 1, facOn: 1, prodOn: 3, prodRnd: 0, adWaste30: 0, loan: 4e6, cash: 9e6, val: 3e7, hq: false });   // C : usine, 3 produits, dette
    r.c = show(o3);
    const o4 = Object.assign({}, o3, { loan: 0, hq: true, listed: false, val: 3e7 }); r.d = show(o4);
    return r;
  });
  t.check('état A (rien de construit) : phase 1 Commerce, premier commerce', S3.a && S3.a.id === 'shop1' && S3.a.ph === 0, JSON.stringify(S3.a));
  t.check('état B (3 commerces, pas d\'usine) : phase 2 Première usine', S3.shops >= 3 && S3.b && S3.b.ph === 1, JSON.stringify({ n: S3.shops, b: S3.b }));
  t.check('état C (usine, produits, dette) : phase 4, remboursement de la dette', S3.c && S3.c.ph === 3 && S3.c.id === 'debt', JSON.stringify(S3.c));
  t.check('état D (sans dette, siège) : introduction en bourse', S3.d && S3.d.id === 'ipo', JSON.stringify(S3.d));
  t.check('chaque jalon est chiffré : coût, gain par mois, durée en minutes', [S3.a, S3.b, S3.c, S3.d].every(x => x && x.cost >= 0 && x.gain > 0 && x.min >= 1 && x.min <= 99), '');

  // 3. Plus de jalon quand le retour dépasse le seuil
  const R = await pg.evaluate(() => {
    const C = window.WSE.coach, o = C.st(true), mk = y => Object.assign({}, o, { shops: 1, shop: Object.assign({}, o.shop, { years: y, gainD: 15 }) });
    const lo = C.pick(mk(3)), hi = C.pick(mk(20));
    return { lo: lo && lo.id, hi: hi && hi.id, thr: C.ROI_MAX };
  });
  t.check('retour de 3 ans : un commerce de plus est proposé', R.lo === 'shop3', R.lo);
  t.check('retour de 20 ans (> seuil) : plus aucun jalon commerce', R.hi !== 'shop3' && R.hi !== 'shop1', R.hi + ' seuil ' + R.thr + ' ans');
  const sat = await pg.evaluate(() => {
    const W = window.WSE, T = window.T, C = W.coach; for (let i = 0; i < 52; i++) { if (!T.inC(i % 3 === 2 ? 's2' : 's1')) break; } T.stepN(70, true);
    const m = C.shopMarginal('s1'), m2 = C.shopMarginal('s2'), p = C.pick(C.st(true)), v = C.view(), card = C.roiCard(Object.values(W.S.grid).find(c => c && c.t === 's1'));
    return { gain: m.gainD, years: m.years, util: m.util, p: p && p.id, card: card.replace(/<[^>]+>/g, ' ').slice(0, 260), tip: v && (v.cur || v.nxt || {}).id, hasPlan: !!(v && v.plan) };
  });
  t.check('marché saturé : le prochain petit marché rapporte < seuil et n\'est plus recommandé', (sat.years === Infinity || sat.years > 8) && !(sat.p || '').startsWith('shop'), JSON.stringify({ g: Math.round(sat.gain), y: sat.years, util: sat.util, p: sat.p }));
  t.check('la fiche d\'un commerce affiche le retour marginal du prochain', /prochain petit march.*rapporterait ~-?\d+ \$ par jour/.test(sat.card) && /retour|jamais amorti/.test(sat.card), sat.card);

  // 3b. Publicité : ROI par support et dosage
  const ad = await pg.evaluate(() => {
    const W = window.WSE, C = W.coach; const c = Object.values(W.S.grid).find(x => x && x.t === 's1' && x.conn); c.ad = { tv: 0, radio: 150, net: 300, press: 0, infl: 0 }; window.T.stepN(5, true);
    const a = C.adAdvice(c), h = C.adRoiHTML(c).replace(/<[^>]+>/g, ' ');
    return { net: a.net, rows: a.rows.map(r => [r.k, Math.round(r.b), Math.round(r.net), Math.round(r.opt)]), has: /Retour sur investissement par support/.test(h) && /Radio/.test(h) && /Internet/.test(h) && /Dosage optimal/.test(h), loss: /perdre/.test(h) };
  });
  t.check('publicité : ROI par support, dosage optimal et perte annoncée', ad.has && ad.loss && ad.net < 0, JSON.stringify(ad.rows));

  // 4. Classement dans le HUD
  const rk = await pg.evaluate(() => { const W = window.WSE; W.S.coach.rk = null; W.coach.step(1); window.T.stepN(11, true); W.coach.step(1); const h = W.coach.rankHTML().replace(/<[^>]+>/g, ' '); return { h, rows: W.coach.rankRows().length, obj: document.getElementById('objbar').textContent }; });
  t.check('classement en direct des rivaux dans le HUD (rang, valorisation, tendance, écart au leader)', rk.rows >= 3 && /Classement/.test(rk.obj) && /[▲▼▬]/.test(rk.obj) && /(écart avec le leader|tu es en tête)/.test(rk.obj), rk.h.slice(0, 200));

  // 5. Dates
  const dt = await pg.evaluate(() => { const W = window.WSE, C = W.coach; W.S.day = 350; W.setSpeed(0); const D = [0, 119, 120, 350, 7199].map(C.dateTxt); window.eval; return { D }; });
  t.check('date unifiée : 1 an = 120 jours (jour 350 = « Jour 111 · An 3 »)', dt.D[0] === 'Jour 1 · An 1' && dt.D[1] === 'Jour 120 · An 1' && dt.D[2] === 'Jour 1 · An 2' && dt.D[3] === 'Jour 111 · An 3', dt.D.join(' | '));
  const hud = await pg.evaluate(async () => { await new Promise(x => setTimeout(x, 500)); document.getElementById('hudflush'); return { d: document.getElementById('vDate').textContent, o: document.getElementById('objbar').textContent }; });
  t.check('le HUD affiche la même date et le minuteur en minutes ET en jours', /Jour 111 · An 3/.test(hud.o) && /\d+ min/.test(hud.o) && /jour 350 \/ 7 200/.test(hud.o.replace(/\s/g, ' ')), hud.o.slice(0, 160));

  // 7. Sous-objectif : compte à rebours et pénalité annoncée
  const so = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; S.day = 400; const o = (S.x11 = S.x11 || {}).obj = (S.x11.obj || {}); const buf = []; const say0 = W.say;
    o.sub = { id: 'ca', t: 'Test de sous-objectif', metric: 'ca', target: 1e12, until: S.day + 25, kp: 1, pen: 0, w: 0 };
    const stepSub = () => W.coach.stepSub(); const m = [];
    stepSub(); m.push((S._sayBuf || []).slice(-1)[0]); S.day += 18; stepSub(); m.push((S._sayBuf || []).slice(-1)[0]); S.day += 5; stepSub(); m.push((S._sayBuf || []).slice(-1)[0]);
    const ann = o.sub && o.sub.pen, cash0 = S.cash; S.day += 10; stepSub(); const paid = cash0 - S.cash;
    return { m, ann, paid, hudRow: !!o.sub };
  });
  t.check('sous-objectif : rappels avant l\'échéance avec la pénalité', so.m.filter(x => /Attention|plus que/.test(x || '')).length >= 2, JSON.stringify(so.m));
  t.check('la pénalité appliquée est celle qui avait été annoncée', so.ann != null && Math.abs(so.paid - so.ann) <= 1, 'annoncée ' + so.ann + ' payée ' + so.paid);

  // 8. Récaps
  const rc = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; S.day = 500; S.coach.ms = 'Expansion'; S.coach.mrD = -99; S.macro.gdp = -0.013; S.macro.boom = 0; W.coach.step(1);
    const box = document.getElementById('recap'); const a = { vis: !box.hidden, txt: box.textContent };
    S.event = 'crash'; document.getElementById('evcard').hidden = false; document.getElementById('evcard').innerHTML = '<button data-ev="1"></button>'; box.hidden = true; document.querySelector('#evcard [data-ev]').click();
    return { a, b: { vis: !box.hidden, txt: box.textContent } };
  });
  t.check('récap macro (« Récession : −1,3 % de PIB … ; que faire »)', rc.a.vis && /Récession : −1,3 % de PIB/.test(rc.a.txt) && /Que faire/.test(rc.a.txt) && /CA/.test(rc.a.txt), rc.a.txt.slice(0, 200));
  t.check('récap après un événement (effet chiffré et que faire)', rc.b.vis && /Krach boursier/.test(rc.b.txt) && /Que faire/.test(rc.b.txt) && /demande −20 %/.test(rc.b.txt), rc.b.txt.slice(0, 200));

  // 9. Terrain du siège
  const hq = await pg.evaluate(() => { const C = window.WSE.coach, a = C.hqSite(true), b = C.hqSite(true, { noFree: true }); return { a: a.kind, b: b.kind, cost: b.plan && b.plan.total, msgA: C.hqSiteMsg(a), msgB: C.hqSiteMsg(b), ex: !!(window.WSE.acq && window.WSE.acq.exec) }; });
  t.check('siège : lot 2×2 libre proposé quand il en existe un', hq.a === 'free' && /terrain libre de 2×2/.test(hq.msgA), hq.msgA);
  t.check('siège : sans lot libre, rachat d\'un lot bâti (acqPlan) avec message explicite et coût', hq.b === 'acq' && hq.cost > 0 && /Plus aucun lot libre/.test(hq.msgB) && hq.ex, hq.msgB.slice(0, 200));

  // 6. Sauvegarde automatique et conservation du titre / de la caste
  const sv = await pg.evaluate(async () => { const W = window.WSE, T = window.T; const k = 'wse-city-v8'; const before = (localStorage.getItem(k) || '').length; T.inC('s2'); const raw0 = localStorage.getItem(k); await new Promise(x => setTimeout(x, 800)); const raw1 = localStorage.getItem(k); return { changed: raw0 !== raw1, tm: W.S.tierMax | 0, caste: W.S.caste }; });
  t.check('construction : sauvegarde automatique différée (sans attendre 5 jours)', sv.changed, '');
  await pg.evaluate(() => { const W = window.WSE; W.S.tierMax = 3; W.S.caste = 'promoteur'; W.save(); });
  const before = await pg.evaluate(() => ({ line: document.getElementById('tierLine').textContent, caste: window.WSE.S.caste }));
  await pg.reload(); await pg.waitForTimeout(3600);
  const after = await pg.evaluate(() => ({ line: document.getElementById('tierLine').textContent, caste: window.WSE.S.caste, tn: document.getElementById('tierName').textContent }));
  t.check('rechargement : caste conservée', after.caste === 'promoteur', JSON.stringify(after));
  t.check('rechargement : titre conservé (Magnat, pas Citoyen)', /Magnat/.test(after.line) && /Magnat/.test(after.tn), after.line);
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
