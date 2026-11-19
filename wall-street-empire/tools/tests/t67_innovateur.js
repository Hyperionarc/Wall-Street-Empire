// Passe 67 : Innovateur tech, monopole temporaire de l'innovation. Fenêtre d'exclusivité (ps.rx) ouverte par une R&D inédite, prime de pouvoir de marché pendant la fenêtre,
// érosion progressive (rattrapage, licences, copies), brevet et caste qui l'allongent, export exclusif, licencié gagnant (somme positive), plateforme cloud, bonus de R&D produit,
// sauvegarde rétro-compatible, lecture dans l'interface (fiche produit et R&D), bot innovateur.
exports.name = 'Innovateur : monopole temporaire';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { caste: 'innovateur', cash: 5e9 }); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#feed{display:none!important}' });
  // 1. bonus de caste sur le développement de produit (−20 % de coût, −30 % de durée)
  const a = await pg.evaluate(() => { const W = window.WSE, S = W.S, o = {}; W.mk.setMat(0);
    const c0 = S.cash; W.launchProduct('cough'); o.costI = c0 - S.cash; o.daysI = S.prod.cough.rdT;
    W.setCaste('industriel'); const c1 = S.cash; W.launchProduct('headache'); o.costN = c1 - S.cash; o.daysN = S.prod.headache.rdT; o.refC = W.PRODUCTS.cough.rnd * W.QTIER[S.prod.cough.q].rnd; o.refH = W.PRODUCTS.headache.rnd * W.QTIER[S.prod.headache.q].rnd;
    W.setCaste('innovateur'); S.rivals.forEach(r => { r.att.basic = 0.3; r.att.std = 0.3; r.att.lux = 0.3; });
    for (let i = 0; i < 60; i++) W.step();
    const ps = S.prod.cough; o.st = ps.st; o.rx = ps.rx; o.inf = W.mono.info('cough'); o.pat = W.rd.mine('cough'); o.p0 = W.mono.info('cough').p;
    const rx0 = ps.rx; ps.rx = 1; S._mpp = {}; o.pOpen = W.mp.prod('cough').p; o.kOpen = W.mp.prod('cough').k; ps.rx = rx0; S._mpp = {}; o.kMono = W.mp.prod('cough').k;
    return o; });
  t.check('Innovateur : développement de produit 20 % moins cher et 30 % plus court (industriel : prix plein)', Math.abs(a.costI - 0.8 * a.refC) < 2 && Math.abs(a.costN - a.refH) < 2 && a.daysI === Math.round(45 * 0.7) && a.daysN === 30, `coût ${a.costI} / ${a.refC}, durée ${a.daysI} j ; industriel ${a.costN} / ${a.refH}, ${a.daysN} j`);
  t.check('R&D inédite terminée : brevet + fenêtre de monopole ouverte (rattrapage rx ≈ 0, exclusivité ≈ 100 %)', a.st === 'on' && a.pat && a.rx != null && a.rx < 0.1 && a.inf && a.inf.ex > 0.9, JSON.stringify(a.inf));
  t.check('pendant la fenêtre, les rivaux présents dans la catégorie ne comptent presque pas : prime de prix forte (≥ 35 %) contre marché ouvert (≤ 15 %)', a.p0 >= 0.35 && a.pOpen <= 0.15 && a.kMono < 0.6 * a.kOpen, `prime ${(a.p0 * 100).toFixed(0)} % (k ${a.kMono.toFixed(2)}) contre ${(a.pOpen * 100).toFixed(0)} % ouvert (k ${a.kOpen.toFixed(2)})`);
  // 2. érosion progressive ; brevet, caste et avance technologique allongent la fenêtre ; licenciés la raccourcissent
  const b = await pg.evaluate(() => { const W = window.WSE, S = W.S, ps = S.prod.cough, o = {}, M = W.mono;
    o.winI = M.win('cough'); W.setCaste('industriel'); o.winN = M.win('cough'); W.setCaste('innovateur');
    const pat = W.rd.held('cough'); const keep = pat.until; pat.until = S.day; o.winNoPat = M.win('cough'); pat.until = keep;
    const tc = ps.tc; ps.tc = W.techFront() * 1.2; o.winLead = M.win('cough'); ps.tc = tc;
    pat.licensees.push({ id: 'p1', name: 'Test', since: S.day, fee: 0, rate: 0.05, paid: 0 }); S._mpp = {}; o.winLic = M.win('cough'); o.kLic = W.mp.prod('cough').k; pat.licensees.pop(); S._mpp = {}; o.kNo = W.mp.prod('cough').k;
    const seq = []; for (let i = 0; i < 4; i++) { seq.push(+ps.rx.toFixed(3)); for (let d = 0; d < 60; d++) W.step(); } o.seq = seq; o.pEnd = M.info('cough').p;
    return o; });
  t.check('fenêtre : Innovateur ×1,4 face à une autre caste ; brevet ×1,6 ; avance technologique +50 % à 120 % de la pointe', Math.abs(b.winI / b.winN - 1.4) < 0.01 && Math.abs(b.winI / b.winNoPat - 1.6) < 0.01 && Math.abs(b.winLead / b.winI - 1.5) < 0.02, `innov ${b.winI.toFixed(0)} j, autre ${b.winN.toFixed(0)} j, sans brevet ${b.winNoPat.toFixed(0)} j, avance ${b.winLead.toFixed(0)} j`);
  t.check('licence accordée : un concurrent de plus (k +0,6) et une fenêtre plus courte (÷ 1,35)', b.kLic - b.kNo > 0.5 && Math.abs(b.winI / b.winLic - 1.35) < 0.01, `k ${b.kNo.toFixed(2)} → ${b.kLic.toFixed(2)}, fenêtre ${b.winI.toFixed(0)} → ${b.winLic.toFixed(0)} j`);
  t.check('érosion progressive : le rattrapage des rivaux monte chaque mois, la prime baisse', b.seq.every((v, i) => i === 0 || v > b.seq[i - 1]) && b.pEnd < a.p0, `rx ${b.seq.join(' → ')}, prime ${(a.p0 * 100).toFixed(0)} → ${(b.pEnd * 100).toFixed(0)} %`);
  // 3. copie sous brevet = licence forcée (le rival paie et gagne sa marge) ; export exclusif ; plateforme cloud
  const c = await pg.evaluate(() => { const W = window.WSE, S = W.S, ps = S.prod.cough, o = {}, pat = W.rd.held('cough'); const rv = S.rivals.find(r => !r.sub && r.att && r.att.std > 0.03);
    o.l0 = pat.licensees.length; o.rx0 = ps.rx; o.cash0 = S.cash; ps.mph = 99999; ps.sold = Math.max(ps.sold || 0, 50); S.prod.cough.st = 'on';
    // un tour d'appel d'air : on avance d'un jour
    W.step(); o.l1 = pat.licensees.length; o.rx1 = ps.rx; o.lic = pat.licensees[pat.licensees.length - 1];
    const lr = o.lic && o.lic.id[0] === 'x' ? S.rivals.find(r => 'x' + r.id === o.lic.id) : null; if (lr) { const c0 = lr.cash; W.rd.step(); o.dRiv = lr.cash - c0; }
    ps.sold = 50; o.xp = W.mono.xp('cough', 100); const rx = ps.rx; ps.rx = 1; o.xpOpen = W.mono.xp('cough', 100); ps.rx = rx;
    W.refreshStats(); W.step(); const D1 = S._sat.dc.D; const P = S.pat; const save = Object.assign({}, P); Object.keys(P).forEach(k => delete P[k]); W.step(); const D0 = S._sat.dc.D; Object.assign(P, save); o.D1 = D1; o.D0 = D0; o.np = Object.keys(save).filter(k => save[k].holder === 'me').length;
    return o; });
  t.check('copie sous ton brevet : le rival prend une licence (forfait encaissé) au lieu de copier, la fenêtre se resserre', c.l1 === c.l0 + 1 && c.rx1 > c.rx0 + 0.1, `licenciés ${c.l0} → ${c.l1}, rx ${(+c.rx0).toFixed(2)} → ${(+c.rx1).toFixed(2)}`);
  t.check('somme positive : le rival licencié gagne de l\'argent sur ses ventes sous licence (marge > redevance)', c.dRiv == null || c.dRiv > 0, `rival licencié ${c.dRiv == null ? '—' : (c.dRiv > 0 ? '+' : '') + Math.round(c.dRiv) + ' $/j'}`);
  t.check('export exclusif : prime à l\'export tant que la fenêtre est ouverte, nulle une fois refermée', c.xp > 0.05 && c.xpOpen === 0, `prime export ${(c.xp * 100).toFixed(0)} % / ouvert ${c.xpOpen}`);
  t.check('plateforme cloud de l\'Innovateur : la demande de calcul grandit avec ses brevets', c.np > 0 && c.D1 > c.D0 * (1 + 0.3 * c.np), `D ${c.D0.toFixed(2)} → ${c.D1.toFixed(2)} avec ${c.np} brevet(s)`);
  // 4. sauvegarde : rx sauvegardé ; ancienne sauvegarde sans rx = marché ouvert ; nouvelle gamme brevetée = fenêtre relancée
  const d = await pg.evaluate(() => { const W = window.WSE, S = W.S, o = {}; W.save(); const sv = JSON.parse(localStorage.getItem('wse-city-v8')); o.saved = sv.prod && sv.prod.cough && sv.prod.cough.rx;
    o.legacy = W.mono.rx({}); o.legacyInfo = (() => { const ps = S.prod.cough, rx = ps.rx; delete ps.rx; S._mpp = {}; const i = W.mono.info('cough'); ps.rx = rx; S._mpp = {}; return i; })();
    const ps = S.prod.cough; ps.rx = 0.9; const q0 = ps.q; o.up = q0 < 2 ? W.changeTier('cough', q0 + 1) : null; o.rxUp = ps.rx; return o; });
  t.check('sauvegarde wse-city-v8 : rattrapage enregistré ; ancienne sauvegarde (sans rx) = marché ouvert, sans erreur', d.saved != null && isFinite(d.saved) && d.legacy === 1 && d.legacyInfo && d.legacyInfo.open, JSON.stringify(d.legacyInfo));
  t.check('nouvelle gamme brevetée (génération suivante) : la fenêtre se rouvre (rx ≤ 0,3)', d.up === null || (d.up && d.rxUp <= 0.3 + 1e-9), `rx 0,9 → ${d.rxUp}`);
  // 5. interface : fiche produit et R&D affichent la fenêtre et le risque de copie
  const u = await pg.evaluate(() => { const W = window.WSE, S = W.S; S.prod.cough.rx = 0.2; S._mpp = {}; const t1 = W.mono.txt('cough'), h = W.prodModelHTML ? W.prodModelHTML('cough') : ''; return { t1, h: /Monopole/.test(h) && /Fenêtre de monopole/.test(h) }; });
  t.check('interface : « Fenêtre de monopole » (exclusivité, jours restants, prime, risque de copie) dans la fiche produit, lisible', /Fenêtre de monopole : exclusivité \d+ %, environ \d+ j restants/.test(u.t1) && /risque de copie/.test(u.t1) && !L.BAD_TXT.test(u.t1) && u.h, u.t1);
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();
  // 6. bot innovateur : il développe un produit inédit, le brevette et le fabrique (Round Normal, 260 jours)
  const pb = await L.newPage({ wait: 500 });
  const r = await pb.evaluate(src => { const W = window.WSE; W.showModes(); W.startMode('round'); const S = W.S; S.rs = 6000; S.noEv = true; W.setCaste('innovateur'); W.setSpeed(0); ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    (0, eval)(src); Object.assign(window.BOT.P, { lev: 0.45, idle: 0, fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false, hurdle: 0.05, innov: true });
    while (S.day < 260) { for (let k = 0; k < 4; k++) W.step(); window.BOT.tick(); }
    const dev = W.PKEYS.filter(pk => S.prod[pk].st === 'on' && !W.PRODUCTS[pk].free); return { dev, pat: dev.filter(pk => W.rd.mine(pk)), made: dev.reduce((a, pk) => a + (S.prod[pk].made || 0), 0), mono: dev.map(pk => W.mono.info(pk)).filter(x => x && !x.open).length, log: window.BOT.IN.log.slice(0, 6) }; }, L.BOT_SRC);
  t.check('bot innovateur : produit inédit développé, breveté, fabriqué, fenêtre de monopole ouverte', r.dev.length >= 1 && r.pat.length >= 1 && r.made > 0 && r.mono >= 1, JSON.stringify(r.log));
  t.check('bot innovateur : aucune erreur de page', pb.errs.length === 0, pb.errs.slice(0, 2).join(' ; '));
  await pb.context().close();
};
