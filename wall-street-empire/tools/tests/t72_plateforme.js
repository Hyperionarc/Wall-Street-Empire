// Passe 72 (innovateur) : brevets en garantie de crédit, plateforme cloud et IA à rendements croissants, électronique sous-traitée au prix de gros,
// actifs immatériels dans la valorisation, bot innovateur (brevets → crédit adossé → campus alimenté → plateforme). Somme positive avec les autres castes.
exports.name = 'Innovateur : plateforme cloud, brevets en garantie, électronique sous-traitée';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { caste: 'innovateur', cash: 5e9 }); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#feed{display:none!important}' });

  // 1. Électronique : sous-traitant au prix de gros mondial (composants électroniques seulement), usine de smartphones qui produit et gagne de l'argent
  const e = await pg.evaluate(() => { const W = window.WSE, S = W.S, T = window.T, C = W.ip.ems, o = {};
    o.ems = Object.keys(C.G);
    o.offer = (() => { const g = 'circuit', base = W.GOODS[g].base * (S.cpi || 1); return { px: C.px(g), ref: base }; })();
    o.local = +(S.price.circuit / (W.GOODS.circuit.base * (S.cpi || 1))).toFixed(2);
    o.fabric = !!C.G.fabric || !!C.G.pack;
    const riv = C.rival(); o.riv = riv ? riv.name : null; const c0 = riv ? riv.cash : 0;
    W.launchProduct('phone'); let n = 0; while (S.prod.phone.st !== 'on' && n++ < 300) W.step();
    const f = T.inP('f3'); W.step(); W.assignProduct('phone', 1); for (let i = 0; i < 3; i++) W.step();
    const fac = T.bldgs().find(b => b.prod === 'phone'); o.src = fac && fac.src; o.noBuy = fac && fac._noBuy;
    const r0 = riv ? riv.cash : 0; let made0 = S.prod.phone.made || 0, prof = 0; for (let d = 0; d < 20; d++) { W.step(); prof += fac ? fac.profit || 0 : 0; }
    o.made = S.prod.phone.made; o.prof = prof / 20; o.st = C.st(); o.limit = fac && fac.limit; if (riv) { const k0 = riv.cash; C.pay(1e6); o.dRiv = riv.cash - k0; o.expM = 1e6 * W.ip.K.EMS_M / ((1 + W.ip.K.EMS_M) * (1 + W.ip.K.EMS_FR)); }
    return o; });
  t.check('sous-traitance électronique : composants électroniques au prix de gros mondial (+12 % de marge), pas pour les biens ordinaires', e.ems.indexOf('circuit') >= 0 && e.ems.indexOf('screen') >= 0 && !e.fabric && Math.abs(e.offer.px / e.offer.ref - 1.12) < 0.01, `circuit ${e.offer.px.toFixed(1)} $ (référence ${e.offer.ref.toFixed(1)} $, cours local ×${e.local})`);
  t.check('smartphone d\'un innovateur sans chaîne verticale : les composants sont sous-traités, l\'usine produit (plus d\'échec à l\'import)', e.src && e.src.screen === 'co:ems' && e.src.circuit === 'co:ems' && !e.noBuy && e.made > 0 && !e.limit, `${JSON.stringify(e.src)} · production ${Math.round(e.made)}/j`);
  t.check('smartphone : EBE d\'usine positif (marge de monopole sur composants au prix de gros)', e.prof > 0, `EBE ${Math.round(e.prof)} $/j`);
  t.check('somme positive : le sous-traitant (industriel IA) encaisse sa marge sur les commandes', e.riv && Math.abs(e.dRiv - e.expM) < 1 && e.st && e.st.m30 > 0, `${e.riv} : +${Math.round(e.dRiv || 0)} $ par million commandé · marge du mois ${Math.round(e.st ? e.st.m30 : 0)} $`);

  // 2. Actifs immatériels : brevets valorisés (rente de monopole sur la fenêtre restante), comptés dans la capitalisation et prêtés par la banque
  const v = await pg.evaluate(() => { const W = window.WSE, S = W.S, o = {}, ps = S.prod.phone, K = W.ip.K;
    ps.rm = 3e6; S._ipc = null; const I = W.ip.info(), q = W.ip.pat('phone'), inf = W.mono.info('phone'), r = W.rd.held('phone');
    const Y = K.YEAR_D, yl = (r.until - S.day) / Y, ym = Math.min(yl, inf.left / Y), ann = y => (1 - Math.pow(1 + K.IP_DISC, -y)) / K.IP_DISC;
    o.exp = K.IP_PRU * Y * (q.roy * ann(yl) + K.IP_EROS * (3e6 / 30) * inf.p / (1 + inf.p) * ann(ym)); o.v = q.v; o.I = { n: I.n, pat: I.pat, v: I.v, col: I.col };
    W.refreshStats(); o.w1 = S.stats.worth; o.cl1 = W.creditLimit();
    const save = Object.assign({}, S.pat); Object.keys(S.pat).forEach(k => delete S.pat[k]); S._ipc = null; W.refreshStats(); o.w0 = S.stats.worth; o.cl0 = W.creditLimit(); o.I0 = W.ip.info().v; Object.assign(S.pat, save); S._ipc = null; W.refreshStats();
    W.setCaste('industriel'); S._ipc = null; o.colInd = W.ip.info().col; o.patInd = W.ip.info().pat; o.platInd = W.ip.q(); W.setCaste('innovateur'); S._ipc = null;
    return o; });
  t.check('brevet valorisé : rente de monopole (CA × prime / (1 + prime)) actualisée sur la fenêtre restante, à moitié, décote 40 %', v.v > 0 && Math.abs(v.v / v.exp - 1) < 0.01, `valeur ${(v.v / 1e6).toFixed(2)} M$ (attendu ${(v.exp / 1e6).toFixed(2)})`);
  t.check('valorisation : les brevets comptent dans la capitalisation (écart = valeur des actifs immatériels)', v.I0 === 0 && Math.abs((v.w1 - v.w0) - v.I.v) < 1 + 1e-6 * v.I.v, `+${((v.w1 - v.w0) / 1e6).toFixed(2)} M$ pour ${(v.I.v / 1e6).toFixed(2)} M$ d'immatériel`);
  t.check('crédit adossé aux brevets : le plafond monte de la garantie (50 % pour l\'Innovateur, 35 % pour une autre caste), sans double compte', v.cl1 - v.cl0 > 0.4 * v.I.col && v.cl1 - v.cl0 < 1.3 * v.I.col && v.I.col > 0 && Math.abs(v.I.col / v.I.pat - 0.5) < 0.01 && Math.abs(v.colInd / v.patInd - 0.35) < 0.01 && v.platInd === 1, `plafond ${(v.cl0 / 1e6).toFixed(1)} → ${(v.cl1 / 1e6).toFixed(1)} M$ · garantie ${(v.I.col / 1e6).toFixed(2)} M$ (industriel ${(v.colInd / 1e6).toFixed(2)})`);

  // 3. Financement de projet du premier campus (≥ 3 brevets, demande cloud non servie), plateforme à rendements croissants, calcul facturé aux autres castes
  const p = await pg.evaluate(() => { const W = window.WSE, S = W.S, T = window.T, o = {}; W.mk.setMat(0);
    ['cough', 'headache'].forEach(pk => W.launchProduct(pk)); let n = 0; while (['cough', 'headache'].some(pk => S.prod[pk].st !== 'on') && n++ < 200) W.step(); W.step(); S._ipc = null;
    const I = W.ip.info(); o.n = I.n; o.proj = I.proj; o.k = W.ip.K.DC_PROJ; o.cost = W.TYPES.dc.cost * 0.75 * Math.max(1, S.cpi || 1); o.q1 = W.ip.q();
    o.clSame = Math.abs(I.col - (0.5 * I.pat + W.ip.K.PLAT_LTV * I.plat)) < 1; const cash0 = S.cash, l0 = S.loan || 0; S.cash = 0.3 * o.cost; const d = T.inP('dc'); o.pfin = (S.loan || 0) - l0; o.dcOk = !!d; S.cash += cash0;
    for (let i = 0; i < 6; i++) { S.stock.coal = 1e9; W.step(); }
    o.q2 = W.ip.q(); o.rent = d._rent0; o.U = S._sat.dc.U; o.D = S._sat.dc.D;
    const rs = S.rivals.filter(r => !r.sub), c0 = rs.map(r => r.cash), pRev = []; let fee = 0, gain = 0, rev = 0;
    for (let i = 0; i < 10; i++) { W.step(); const P = W.ip.platSt(); fee += P.fee; gain += P.gain; rev += d.pRev; }
    o.fee = fee; o.gain = gain; o.rev = rev; o.share = fee / rev;
    // rendements croissants : un second campus relève la qualité de la plateforme (recette par campus)
    const r1 = d._rent0; const d2 = T.inP('dc'); for (let i = 0; i < 3; i++) W.step(); o.r1 = r1; o.r2 = d._rent0; o.q3 = W.ip.q(); o.U2 = S._sat.dc.U;
    S._ipc = null; const I2 = W.ip.info(); o.plat = I2.plat; o.pe = I2.pe; o.pb = I2.pb;
    W.setCaste('industriel'); W.step(); o.rInd = d._rent0; o.qInd = W.ip.q(); W.setCaste('innovateur'); W.step();
    o.card = W.ip.card(); o.emp = W.ip.empire(); o.debt = W.ip.debtRows((n, v) => n + ' ' + v);
    return o; });
  t.check('financement de projet : avec 3 brevets et une demande cloud non servie, la banque finance 65 % d\'un campus (contrats cloud)', p.n >= 3 && p.k === 0.65 && Math.abs(p.proj / p.cost - p.k) < 0.01, `${p.n} brevets · ${(p.proj / 1e6).toFixed(1)} M$ pour un campus de ${(p.cost / 1e6).toFixed(1)} M$`);
  t.check('financement de projet versé à la construction : campus posé avec 30 % de trésorerie, la banque complète (au plus 65 % du coût) ; ce prêt n\'entre pas dans la ligne de crédit générale', p.dcOk && p.pfin > 0.1 * p.cost && p.pfin <= p.proj + 1 && p.clSame, `prêt de projet ${(p.pfin / 1e6).toFixed(1)} M$`);
  t.check('plateforme : la qualité des modèles monte avec les brevets et les campus (rendements croissants) ; le 2e campus ne fait pas baisser la recette du 1er (l\'effet de réseau compense le partage de la demande)', p.q1 > 1.05 && p.q2 > p.q1 && p.q3 > p.q2 && p.r2 > p.r1 * 0.99, `qualité ×${p.q1.toFixed(2)} → ×${p.q2.toFixed(2)} (1 campus) → ×${p.q3.toFixed(2)} (2 campus) ; recette du 1er campus ${Math.round(p.r1)} → ${Math.round(p.r2)} $/j`);
  t.check('saturation : la demande cloud reste finie (bornée par la ville et les brevets), les autres castes n\'ont pas de plateforme', p.D > p.U && p.D < 200 && p.qInd === 1 && p.rInd < p.r2, `demande ${p.D.toFixed(1)} campus pour ${p.U2} servis`);
  t.check('somme positive : 20 % du calcul facturé aux autres castes, qui gagnent 1,6 fois ce qu\'elles paient', Math.abs(p.share - 0.2) < 0.01 && Math.abs(p.gain / p.fee - 1.6) < 1e-6, `facturé ${Math.round(p.fee / 10)} $/j, gain ${Math.round(p.gain / 10)} $/j`);
  t.check('valorisation de la plateforme : EBE cloud actualisé moins la valeur des campus (≥ 0)', p.plat >= 0 && p.pb > 0 && isFinite(p.plat), `EBE ${Math.round(p.pe)} $/j · murs ${(p.pb / 1e6).toFixed(0)} M$ · écart ${(p.plat / 1e6).toFixed(1)} M$`);
  t.check('interface : fiche plateforme (qualité, demande, facturation, gain des autres castes), actifs immatériels, garanties du bureau de la dette', /Plateforme cloud et IA/.test(p.card) && /gain de productivité/.test(p.card) && /ACTIFS IMMATÉRIELS/.test(p.emp) && /Brevets actifs/.test(p.debt) && !L.BAD_TXT.test(p.card + p.emp + p.debt), p.debt.slice(0, 120));
  // 4. sauvegarde inchangée (aucun champ nouveau) ; aucun NaN ; aucune erreur
  const s = await pg.evaluate(() => { const W = window.WSE, S = W.S, T = window.T; W.save(); const sv = JSON.parse(localStorage.getItem('wse-city-v8')); return { ipc: '_ipc' in sv || 'ip' in sv || '_plat' in sv, nan: T.scan().slice(0, 4) }; });
  t.check('sauvegarde wse-city-v8 sans nouveau champ (valeurs dérivées, recalculées), aucun NaN', !s.ipc && !s.nan.length, s.nan.join(','));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // 5. bot innovateur : avec trois brevets et du crédit adossé, il ouvre son campus puis l'alimente au nucléaire (centrale reliée au réseau)
  const pb = await L.newPage({ wait: 500 });
  const r = await pb.evaluate(src => { const W = window.WSE; W.showModes(); W.startMode('round'); const S = W.S; S.rs = 6000; S.noEv = true; W.setCaste('innovateur'); W.setSpeed(0); ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    (0, eval)(src); Object.assign(window.BOT.P, { lev: 0.45, idle: 0, fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false, hurdle: 0.05, innov: true });
    S.cash = 120e6; S.tech = Object.assign(S.tech || {}, { solar: 1, cables: 1, nuclear: 1 }); W.mk.setMat(0);
    ['headache', 'cough', 'antibio'].forEach(pk => W.launchProduct(pk)); let n = 0; while (['headache', 'cough', 'antibio'].some(pk => S.prod[pk].st !== 'on') && n++ < 200) W.step();
    const o = { n: W.ip.info().n };
    for (let i = 0; i < 40; i++) { for (let k = 0; k < 4; k++) W.step(); window.BOT.tick(); }
    const nuc = []; for (let i = 0; i < W.N * W.N; i++) { const c = S.grid[i]; if (c && c.t === 'nuclear' && c.x + c.y * W.N === i) nuc.push(c); }
    o.dc = (S.stats.cn || {}).dc || 0; o.nuc = nuc.length; o.grid = nuc.filter(c => c.gridOk).length; o.log = window.BOT.IN.log.filter(x => x[1] === 'dc' || x[1] === 'nuc');
    return o; }, L.BOT_SRC);
  t.check('bot innovateur : brevets → campus data center (crédit adossé) → centrale nucléaire reliée au réseau', r.n >= 3 && r.dc >= 1 && r.nuc >= 1 && r.grid === r.nuc, JSON.stringify(r));
  t.check('bot innovateur : aucune erreur de page', pb.errs.length === 0, pb.errs.slice(0, 2).join(' ; '));
  await pb.context().close();
};
