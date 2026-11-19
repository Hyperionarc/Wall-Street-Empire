// Concurrence IA à la Capitalism Lab (docs/CAPLAB_CONCURRENCE_IA.md) : les rivaux fabriquent (mêmes recettes que le joueur), achètent leurs intrants
// au marché local (y compris au joueur), tiennent un stock, subissent les pénuries, ne vendent pas sous leur coût, s'endettent pour investir,
// expliquent leurs décisions au journal ; la difficulté (nombre d'usines IA, note en %) monte avec le palier du joueur ; sauvegarde rétrocompatible.
exports.name = 'Concurrence IA : rivaux fabricants, intrants, coûts, difficulté';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 });
  const a = await pg.evaluate(() => {
    const W = window.WSE; W.startMode('round'); const S = W.S, F = W.riv.fab; W.seats.claim('industriel', 'me'); W.setSpeed(0); S.noEv = true; if (S.mode) delete S.mode.await;
    ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    const o = { max0: S.rivals.map(r => F.max(r)), rt0: W.riv.rating() };
    for (let i = 0; i < 60; i++) W.step();
    o.fab60 = S.rivals.reduce((n, r) => n + (r.fab || []).length, 0);
    // --- fabriquer ou acheter : on avance la date au-delà du jour 540 (début accueillant terminé) et on donne un volume au négociant ---
    const r = S.rivals.find(x => x.caste === 'negociant'); S.day = 600; r.cash = 40e6; r.debt = 0; r.vs = { basic: 900, std: 300, lux: 20, estate: 0 }; r.pf = 5000;
    o.maxNeg = F.max(r); const pl = F.plan(r); o.plan = pl ? { pk: pl.pk, cls: pl.cls, mo: pl.mo, mr: pl.mr, roi: pl.roi, cap: pl.cap } : null;
    const nb0 = r.nb || 0, log0 = S.rv.log.length; F.decide(r); const f = (r.fab || [])[0];
    o.built = !!f; o.fab = f ? { pk: f.pk, cap: f.cap, x: f.x, y: f.y, bv: f.bv } : null; o.towerOwned = f && f.x != null ? (S.npcOwn || {})[f.x + ',' + f.y] === r.id : null;
    o.logBuild = (S.rv.log.slice(-3).map(l => l.t).find(t => /ouvre une usine/.test(t)) || '');
    o.inputs = f ? Object.keys(W.PRODUCTS[f.pk].in) : [];
    o.val1 = W.riv.value(r);
    return o;
  });
  t.check('début accueillant : aucune usine IA autorisée au départ (palier Citoyen) ni construite les 60 premiers jours', a.max0.every(x => x === 0) && a.fab60 === 0, `max ${a.max0.join('/')}, usines ${a.fab60}`);
  t.range('note de difficulté de la concurrence au départ d\'un Round Normal ≈ 100 %', a.rt0, 90, 110, ' %', 0);
  t.check('fabriquer ou acheter : le projet retenu bat la marge de négoce d\'au moins 4 points et rapporte au moins 22 %/an', a.plan && a.plan.mo - a.plan.mr >= 0.04 && a.plan.roi >= 0.22, JSON.stringify(a.plan));
  t.check('l\'IA construit l\'usine, visible en ville (tour à son nom) et expliquée au journal', a.built && a.towerOwned === true && /marge fabriquée/.test(a.logBuild) && /négoce/.test(a.logBuild), a.logBuild.slice(0, 140));

  const b = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, F = W.riv.fab, r = S.rivals.find(x => x.caste === 'negociant'), f = r.fab[0], g = Object.keys(W.PRODUCTS[f.pk].in)[0], o = { g };
    // le joueur a du stock de l'intrant : il en vend aux usines rivales via le marché local
    let me = 0; for (let i = 0; i < 20; i++) { S.stock[g] = 6000; W.step(); me = Math.max(me, (S._lm && S._lm[g] && S._lm[g].rivMe) || 0); }
    o.inD = (S.rv.inD || {})[g] || 0; o.lm = S._lm && S._lm[g] ? { riv: S._lm[g].riv, me } : null; o.made = f.sold > 0; o.uc = f.uc; o.cb = r.cb[f.cls];
    o.panel = W.riv.fab.line(r); o.oo = r.oo ? r.oo[f.cls] : null;
    // pénurie : cours de l'intrant bloqué près de son plafond -> production ralentie, rupture affichée, part en recul ; puis marge insuffisante -> mise en sommeil
    const e0 = W.riv.eff(r, f.cls), gs = Object.keys(W.PRODUCTS[f.pk].in);
    const P0 = {}; gs.forEach(x => { P0[x] = S.price[x]; });
    for (let i = 0; i < 100; i++) { gs.forEach(x => { S.price[x] = P0[x] * 40; }); W.step(); if (i === 10) { o.fill = f.fill; o.why = f.why; o.ooS = r.oo[f.cls]; const e1 = W.riv.eff(r, f.cls), k = r.oo[f.cls]; r.oo[f.cls] = 1; o.effK = e1 / W.riv.eff(r, f.cls); r.oo[f.cls] = k; } }
    o.sleep = f.on === false; o.logSleep = (S.rv.log.map(l => l.t).find(t => /met en sommeil/.test(t)) || '');
    gs.forEach(x => { S.price[x] = P0[x]; }); for (let i = 0; i < 70; i++) { gs.forEach(x => { S.price[x] = P0[x]; }); W.step(); } o.reopen = f.on !== false;
    return o;
  });
  t.check('l\'usine produit et vend : intrants achetés au marché local et relevés (demande des usines rivales)', b.made && b.inD > 0 && b.lm && b.lm.riv > 0, `${b.g} : ${b.inD.toFixed(1)} u/j`);
  t.check('le joueur qui a du stock de cet intrant en vend aux usines rivales', b.lm && b.lm.me > 0, `vendu aux rivaux ${b.lm && b.lm.me.toFixed(1)} u/j`);
  t.check('coût de revient de l\'usine sous le coût d\'achat en gros, coût moyen de la classe calculé', b.uc > 0 && b.uc < 1 && b.cb > 0 && b.cb < 1, `coût usine ${b.uc.toFixed(2)}, coût moyen ${b.cb.toFixed(2)}`);
  t.check('fiche du rival : usine, capacité, stock et coût affichés', /Usines/.test(b.panel) && /u\/j/.test(b.panel) && /coût/.test(b.panel), b.panel.replace(/<[^>]+>/g, '').slice(0, 120));
  t.check('pénurie d\'intrant (cours au plafond) : l\'usine tourne au ralenti, la rupture est nommée, le service baisse', b.fill < 0.95 && !!b.why && b.ooS < 1, `taux ${b.fill && b.fill.toFixed(2)}, intrant ${b.why}, service ${b.ooS && b.ooS.toFixed(2)}`);
  t.check('la rupture fait perdre de l\'attrait au rival (ses clients partent)', b.effK < 0.995, `attrait ×${b.effK.toFixed(3)} par rapport au même rival bien servi`);
  t.check('intrant durablement trop cher : l\'usine est mise en sommeil, avec l\'explication', b.sleep && /trop cher/.test(b.logSleep), b.logSleep.slice(0, 120));
  t.check('intrants redevenus abordables : l\'usine rouvre', b.reopen, '');

  const c = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, F = W.riv.fab, R = W.riv, r = S.rivals.find(x => x.caste === 'negociant'), f = r.fab[0], cls = f.cls, b = R.prof(r).px[cls], o = {};
    S.rivals.forEach(x => { x.st = { k: 'follow' }; }); R.state().warCd = 1e9; R.state().carCd = 1e9; R.state().maCd = 1e9;
    // plancher de coût : les intrants triplent, le coût de revient monte ; parti de 80 % de son prix habituel, le rival remonte au moins à coût + 2 %
    const gs = Object.keys(W.PRODUCTS[f.pk].in), P0 = {}; gs.forEach(x => { P0[x] = S.price[x]; }); const hot = () => gs.forEach(x => { S.price[x] = P0[x] * 3; });
    r.px[cls] = b * 0.8; f.lo = 0; for (let i = 0; i < 25; i++) { hot(); W.step(); } o.cb = r.cb[cls]; o.floor = r.px[cls] / b; o.logCost = (S.rv.log.map(l => l.t).find(t => /coût de revient/.test(t)) || '');
    // en guerre des prix, il peut descendre jusqu'à 4 % sous son coût, pas plus bas
    R.war(r, cls); r.st.d = 0.25; for (let i = 0; i < 25; i++) { hot(); W.step(); r.st.until = S.day + 50; f.lo = 0; } o.cbW = r.cb[cls]; o.warPx = r.px[cls] / b; R.endStrat(r, 'test'); R.state().warCd = 1e9;
    gs.forEach(x => { S.price[x] = P0[x]; });
    // dette : un rival bénéficiaire mais à court de trésorerie emprunte pour son usine, la dette réduit sa valeur
    const r2 = S.rivals.find(x => x.caste === 'agriculteur'); r2.fab = []; r2.vs = { basic: 1200, std: 100, lux: 0, estate: 0 }; r2.pf = 5000; r2.cash = 0.1 * R.value(r2); r2.debt = 0;
    const v0 = R.value(r2), pl = F.plan(r2); o.pl2 = !!pl; const ok = pl && F.build(r2, pl); o.debt = r2.debt || 0; o.capex = pl ? pl.capex : 0; o.logDebt = (S.rv.log.slice(-2).map(l => l.t).find(t => /empruntés/.test(t)) || '');
    o.dv = R.value(r2) - v0;
    // difficulté : le nombre d'usines permis et la note montent avec le palier du joueur
    const mx0 = F.max(r2), rt0 = R.rating(); S.stats.worth = 80e6; W.step(); o.mx = [mx0, F.max(r2)]; o.rt = [rt0, R.rating()];
    o.company = W.seats.company('agriculteur').debt;
    // distribution : le surplus mensuel des usines rembourse d'abord la dette, puis part en dividendes
    const r3 = S.rivals.find(x => x.caste === 'negociant'); r3.debt = 50000; r3.div = 0; r3.cash = Math.max(r3.cash, 5e6); let n = 0; do { r3.fsm = 400000; W.step(); n++; } while (S.day % 30 !== 0 && n < 40);
    o.dist = { debt: r3.debt || 0, div: r3.div || 0 };
    return o;
  });
  t.check('« ne jamais vendre sous le coût » : le prix remonte au plancher coût + 2 %, expliqué au journal', c.cb > 0.8 && c.floor >= c.cb + 0.01 && /coût de revient/.test(c.logCost), `coût ${c.cb.toFixed(3)}, prix ×${c.floor.toFixed(3)} · ${c.logCost.slice(0, 90)}`);
  t.check('en guerre des prix, il peut vendre jusqu\'à 4 % sous son coût, pas au-delà', c.warPx >= c.cbW - 0.05 && c.warPx < c.cbW + 0.01 && c.warPx > 0.76, `coût ${c.cbW.toFixed(3)}, prix ×${c.warPx.toFixed(3)} (une guerre à −25 % sans plancher donnerait ×0,75)`);
  t.check('investissement financé en partie par emprunt (dette bornée), annoncé au journal', c.pl2 && c.debt > 0 && c.debt <= 0.3 * (c.capex + 1e9) && /empruntés/.test(c.logDebt) && c.company === c.debt, `dette ${Math.round(c.debt)} sur ${c.capex}`);
  t.check('la valeur d\'un rival compte ses usines et retranche sa dette (investir ne crée pas de valeur fictive)', Math.abs(c.dv) <= 0.02 * Math.max(1, c.capex) + 10000, `écart ${Math.round(c.dv)}`);
  t.check('distribution : 60 % du surplus des usines rembourse la dette puis part en dividendes', c.dist.debt === 0 && c.dist.div > 100000, JSON.stringify(c.dist));
  t.check('difficulté : plus d\'usines IA permises et note plus haute quand le joueur monte de palier', c.mx[1] > c.mx[0] && c.rt[1] > c.rt[0], `usines ${c.mx.join('→')}, note ${c.rt.join('→')} %`);

  // --- sauvegarde : aller-retour des usines ; ancienne sauvegarde sans usines ---
  const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.save(); const d = JSON.parse(localStorage.getItem('wse-city-v8')); const n = d.rivals.reduce((a, r) => a + (r.fab || []).length, 0); const old = JSON.parse(JSON.stringify(d)); old.rivals.forEach(r => { delete r.fab; delete r.debt; delete r.vs; delete r.cb; delete r.oo; delete r.pxL; delete r.pxD; }); if (old.rv) delete old.rv.inD; return { n, json: JSON.stringify(d), old: JSON.stringify(old) }; });
  await pg.context().addInitScript(j => { localStorage.setItem('wse-city-v8', j); }, sv.json); await pg.reload(); await pg.waitForTimeout(700);
  const ld = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); S.noEv = true; const n = S.rivals.reduce((a, r) => a + (r.fab || []).length, 0); for (let i = 0; i < 20; i++) W.step(); return { n, fin: S.rivals.every(r => isFinite(r.cash) && isFinite(W.riv.value(r))) }; });
  t.check('sauvegarde wse-city-v8 : les usines des rivaux survivent à l\'aller-retour', sv.n >= 2 && ld.n === sv.n && ld.fin, `${sv.n} usines enregistrées, ${ld.n} rechargées`);
  const pg2 = await L.newPage({ wait: 300 }); await pg2.context().addInitScript(j => { localStorage.setItem('wse-city-v8', j); }, sv.old); await pg2.reload(); await pg2.waitForTimeout(700);
  const ld2 = await pg2.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); S.noEv = true; for (let i = 0; i < 40; i++) W.step(); return { n: S.rivals.length, fin: S.rivals.every(r => isFinite(r.cash) && isFinite(W.riv.value(r))) }; });
  t.check('ancienne sauvegarde sans usines IA : chargée et simulée sans erreur', ld2.n >= 3 && ld2.fin && pg2.errs.length === 0, pg2.errs.slice(0, 2).join(' | '));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg2.context().close(); await pg.context().close();
};
