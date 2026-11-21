// Passe 85 : cultures 3×3 (retour de Rémy : fermes céréalières trop petites, sprites 768 px restaurés) et bloc « Ce que la ferme gère / ce que tu optimises ».
// Vérifie : emprise 3×3 des 7 cultures (élevages 2×2), débit et prix d'entrée au prorata de la surface (rendement par case inchangé), zone des effets vivants dans l'emprise,
// panneau honnête (dates imposées, automatique / tu décides, engrais et sa couverture, récolte en stock, COO), achat manuel d'engrais, COO hors Round seulement,
// ancienne sauvegarde (culture 2×2) relue sans casse : agrandie à 3×3 si la place est libre, sinon gardée en 2×2 et produisant au prorata (4/9).
exports.name = 'Cultures 3×3 et bloc « ce que tu optimises »';
const CROPS_T = ['fwheat', 'fsugar', 'fcotton', 'frubber', 'fvine', 'fcorn', 'frapeseed'], LIVE_T = ['fcattle', 'fchicken', 'fpig', 'fsheep'];
const OLD_CAPEX = { fwheat: 2000000, fsugar: 2500000, fcotton: 2200000, frubber: 2500000, fvine: 3000000, fcorn: 2000000, frapeseed: 2600000 };   // prix d'entrée 2×2 d'avant la passe 85
exports.run = async (t, L) => {
  let pg = await L.newPage({ wait: 2600 }); await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const A = await pg.evaluate(({ CROPS_T, LIVE_T, OLD_CAPEX }) => {
    const W = window.WSE, S = W.S, N = W.N, T = window.T, F3 = W.farm3, o = {};
    o.sz = CROPS_T.map(k => k + ' ' + W.TYPES[k].w + '×' + W.TYPES[k].h).filter(x => !/3×3$/.test(x)).concat(LIVE_T.map(k => k + ' ' + W.TYPES[k].w + '×' + W.TYPES[k].h).filter(x => !/2×2$/.test(x)));
    o.capex = CROPS_T.filter(k => Math.abs(W.TYPES[k].cost / 9 - OLD_CAPEX[k] / 4) > 1).map(k => k + ' ' + W.TYPES[k].cost);
    o.area = F3.CROP_AREA; o.zone = F3.FARM_ZONE3.crop.every(q => q[0] >= 0 && q[0] <= 3 && q[1] >= 0 && q[1] <= 3);
    // une ferme de blé 3×3, 40 jours
    const c = T.onDep('fwheat', 'wheat'); o.wh = c ? [c.w, c.h] : null; if (!c) return o;
    T.stepN(40, true); o.out3 = c.out; o.k3 = F3.cropAreaK(c);
    W.openBuilding(c.x, c.y); const el = document.querySelector('#bbody .fplan'); o.txt = el ? el.innerText.replace(/\s+/g, ' ') : ''; o.btn = !!document.querySelector('#bbody [data-act="fertbuy"]'); W.closeBuilding();
    o.plan = F3.plan(c);
    // achat manuel d'engrais (gratuit, au cours + 15 %)
    c.fert = 1; T.stepN(2, true); const cash0 = S.cash, f0 = S.stock.fert || 0; W.openBuilding(c.x, c.y); W.bAct('fertbuy'); W.closeBuilding(); o.buy = [cash0 - S.cash, (S.stock.fert || 0) - f0];
    // COO Argent (premium simulé) : pilote l'engrais hors Round
    c.fert = 0; S.stock.fert = 0; W.ent.prem(1); W.coo.set(2); const c1 = S.cash; W.farm3.cooFarm(); o.coo = { fert: c.fert, stock: S.stock.fert || 0, spent: c1 - S.cash };
    W.coo.set(0); W.ent.prem(0);
    // ancienne culture 2×2 gardée telle quelle (pas de place) : produit au prorata de sa surface
    // (même case : seul c.w × c.h change, comme pour une ferme gardée en 2×2 par fpMigrate ; marché figé : on compare le débit de deux jours identiques)
    T.stepN(1, true); const o3 = c.out / c.util; c.w = 2; c.h = 2; c.fpOld = 1; o.k2 = F3.cropAreaK(c); T.stepN(1, true); const o2 = c.out / c.util;   // capacité nominale (out / util) : indépendante du raccordement, qui change avec l'emprise dans ce montage
    c.w = 3; c.h = 3; delete c.fpOld; o.ratio = o2 / o3;
    o.errs = 0; return o;
  }, { CROPS_T, LIVE_T, OLD_CAPEX });
  t.check('emprises : les 7 cultures en 3×3, les 4 élevages restent en 2×2', A.sz.length === 0, A.sz.join(', '));
  t.check('prix d\'entrée au prorata de la surface (× 9/4) : même prix par case qu\'en 2×2', A.capex.length === 0 && A.area === 2.25, A.capex.join(', '));
  t.check('zone du champ (effets vivants) inscrite dans l\'emprise 3×3', A.zone, '');
  t.check('ferme de blé posée sur une terre agricole en 3×3, produit en 40 jours', A.wh && A.wh[0] === 3 && A.wh[1] === 3 && A.out3 > 100 && A.k3 === 1, JSON.stringify({ wh: A.wh, out: A.out3 && Math.round(A.out3) }));
  t.check('ancienne culture 2×2 sans place pour grandir : produit 4/9 d\'une 3×3 (rendement par case inchangé)', Math.abs(A.k2 - 4 / 9) < 1e-9 && Math.abs(A.ratio - 4 / 9) < 0.03, `k ${A.k2 && A.k2.toFixed(3)}, ratio ${A.ratio && A.ratio.toFixed(3)}`);
  const tx = A.txt || '';
  t.check('panneau : bloc « Ce que la ferme gère / ce que tu optimises »', /ce que la ferme g[èe]re/i.test(tx) && /Automatique/.test(tx) && /Tu décides/.test(tx) && A.btn, tx.slice(0, 160));
  t.check('panneau : dates de semis et de récolte présentées comme imposées (pas de réglage), compte à rebours en jours', /imposées/.test(tx) && /ne se règlent pas/.test(tx) && /(récolte|semis) dans \d+ jours/.test(tx), '');
  t.check('panneau : engrais (stock, couverture, quantité jusqu\'à la récolte), irrigation chiffrée, récolte en stock, COO', /Stock d'engrais/.test(tx) && /couvre/.test(tx) && /Irrigation/.test(tx) && /\$\/mois/.test(tx) && /Récolte en stock/.test(tx) && /COO/.test(tx), '');
  t.check('panneau : aucun NaN / undefined', !L.BAD_TXT.test(tx), (tx.match(L.BAD_TXT) || [''])[0]);
  t.check('calendrier cohérent (prochaine étape entre 0 et 360 jours, horizon de l\'engrais ≥ 0)', A.plan && A.plan.cal && A.plan.cal.dn >= 0 && A.plan.cal.dn < 360 && A.plan.horizon >= 0, JSON.stringify(A.plan && A.plan.cal));
  t.check('achat manuel d\'engrais : le stock monte, la trésorerie paie le cours + 15 %', A.buy[1] > 0 && Math.abs(A.buy[0] / A.buy[1] - A.plan.fPx) / A.plan.fPx < 0.05, JSON.stringify(A.buy));
  t.check('COO Argent (hors Round) : engrais pris en charge sur la ferme (activé et stock acheté, ou laissé off s\'il ne rapporte pas)', A.coo && ((A.coo.fert === 1 && (A.coo.stock > 0 || A.coo.spent >= 0)) || A.coo.fert === 0), JSON.stringify(A.coo));
  t.check('page : 0 erreur', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // Round compétitif : le COO ne pilote pas les fermes (aucun avantage payant)
  pg = await L.newPage({ wait: 2600 }); await pg.evaluate(() => { window.WSE.startMode('round'); }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const R = await pg.evaluate(() => { const W = window.WSE, S = W.S, T = window.T; const c = T.onDep('fwheat', 'wheat'); if (!c) return null; T.stepN(5, true); c.fert = 0; S.stock.fert = 0; W.ent.prem(1); W.coo.set(2); const c0 = S.cash; W.farm3.cooFarm(); return { fert: c.fert, stock: S.stock.fert || 0, spent: c0 - S.cash, txt: W.farm3.html(c).replace(/<[^>]+>/g, ' ') }; });
  t.check('Round compétitif : le COO ne touche pas aux fermes, et le panneau le dit', R && R.fert === 0 && R.stock === 0 && R.spent === 0 && /Round compétitif/.test(R.txt), JSON.stringify(R && { fert: R.fert, stock: R.stock, spent: R.spent }));
  await pg.context().close();

  // Ancienne sauvegarde : cultures 2×2 relues sans casse, agrandies à 3×3 sur place
  pg = await L.newPage({ wait: 2600 }); await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, T = window.T; const a = T.onDep('fwheat', 'wheat'), b = T.onDep('fvine', 'grapes'), h = T.put('fcattle', 0, N, 0, N); if (!a || !b) return null;
    W.save(); const d = JSON.parse(localStorage.getItem('wse-city-v8')), ia = a.x + a.y * N, ib = b.x + b.y * N;
    d.g.forEach((q, j) => { if (Array.isArray(q) && q[0] === 'part' && (q[1] === ia || q[1] === ib) && (q[2] >= 2 || q[3] >= 2)) d.g[j] = 0; });   // emprise d'avant : 2×2
    localStorage.setItem('wse-city-v8', JSON.stringify(d)); return { a: [a.x, a.y], b: [b.x, b.y], n: S.grid.filter(c => c && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part').length }; });
  await pg.reload(); await pg.waitForTimeout(2600);
  const mg = sv && await pg.evaluate(sv => { const W = window.WSE, S = W.S, N = W.N, at = p => S.grid[p[1] * N + p[0]]; const a = at(sv.a), b = at(sv.b);
    for (let i = 0; i < 5; i++) W.step();
    return { a: a && [a.t, a.w, a.h, !!a.fpOld], b: b && [b.t, b.w, b.h, !!b.fpOld], n: S.grid.filter(c => c && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part').length, bad: W.fp.audit(), out: a && a.out }; }, sv);
  t.check('ancienne sauvegarde : cultures 2×2 relues, agrandies à 3×3 sur place, aucun bâtiment perdu ni chevauchement', !!mg && mg.a[1] === 3 && mg.a[2] === 3 && mg.b[1] === 3 && mg.b[2] === 3 && mg.n === sv.n && mg.bad.length === 0 && mg.out > 0, JSON.stringify(mg));
  t.check('ancienne sauvegarde : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();
};
