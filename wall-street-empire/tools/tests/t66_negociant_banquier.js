// Passe 66 : le négociant (DiscountCo) et le banquier (Luxor & Fils) IA agissent vraiment.
// Négociant : stocks au port, offre « négociant » (prix, capacité, délai) dans les achats, ventes au joueur et aux usines rivales, amortisseur (achète les surplus,
// revend dans les pénuries), épisodes mondiaux bornés (jamais +12 % d'un coup : ±4 %/jour au plus sur le cours, multiplicateur ≤ 0,25 %/jour), électricité
// (réseau en pénurie, appoint d'un data center), cartel et embargo (coût −50 %), faillite possible.
// Banquier : prêts cotés selon le cycle et le risque, refus, renchérissement, prêts aux rivaux (usines), marge d'intérêt, tours de table, posture bornée qui
// alimente riskPrem et credCycle, pas de resserrement en récession, lisibilité (Menu > Concurrents), sauvegarde rétrocompatible.
exports.name = 'Négociant et banquier IA actifs (passe 66)';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 });
  const a = await pg.evaluate(() => {
    const W = window.WSE; W.startMode('round'); const S = W.S, TR = W.riv.tr; W.seats.claim('industriel', 'me'); W.setSpeed(0); S.noEv = true; if (S.mode) delete S.mode.await;
    ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    const o = {}; let up = 0;
    for (let i = 0; i < 160; i++) { const P0 = Object.assign({}, S.price); W.step(); Object.keys(P0).forEach(g => { if (W.GOODS[g].grp === 'raw') up = Math.max(up, S.price[g] / P0[g] - 1); }); }
    const r = TR.R(), T = TR.S(); o.name = r && r.name; o.val = TR.val(); o.nStk = Object.keys(T.stk).length; o.up = up;
    const g = Object.keys(T.stk).sort((x, y) => T.stk[y] * S.price[y] - T.stk[x] * S.price[x])[0]; o.g = g;
    const sp = TR.list(g).find(s => s.id === 'neg'); o.sup = sp ? { name: sp.name, pf: sp.pf, stk: sp.stk, re: sp.re, cap: sp.cf * 1.5 * Math.max(300, 1) } : null;
    // (1) vente au joueur : relevé du jour (fournisseur « négociant »), le négociant livre sur stock et encaisse
    const s0 = T.stk[g], c0 = r.cash, q = Math.min(100, s0 / 2); S._supU = { [g + ':neg']: q }; const made = {}, want = {}; Object.keys(S.price).forEach(k => { made[k] = 100; want[k] = 100; });
    const pa = Object.assign({}, T.pa); Object.keys(T.pa).forEach(k => { T.pa[k] = S.price[k]; });   // cours au repère : pas d'amortisseur
    const me0 = T.m.me || 0; TR.market(made, want); o.sold = s0 - (T.stk[g] || 0); o.cash = (T.m.me || 0) - me0; o.unit = o.cash / Math.max(1e-9, o.sold); o.world = S.price[g] / Math.max(1e-9, W.mk ? 1 : 1);
    // (2) amortisseur : cours 15 % au-dessus de son repère -> il revend (offre du jour en hausse) ; 15 % au-dessous -> il achète (demande du jour en hausse)
    S._supU = {}; Object.keys(T.pa).forEach(k => { T.pa[k] = S.price[k]; }); T.pa[g] = S.price[g] / 1.15; const m1 = {}, w1 = {}; Object.keys(S.price).forEach(k => { m1[k] = 100; w1[k] = 100; }); const st1 = T.stk[g]; TR.market(m1, w1); o.relMade = m1[g] - 100; o.relStk = st1 - (T.stk[g] || 0);
    Object.keys(T.pa).forEach(k => { T.pa[k] = S.price[k]; }); T.pa[g] = S.price[g] / 0.85; const m2 = {}, w2 = {}; Object.keys(S.price).forEach(k => { m2[k] = 100; w2[k] = 1000; }); const st2 = T.stk[g] || 0; TR.market(m2, w2); o.buyWant = w2[g] - 1000; o.buyStk = (T.stk[g] || 0) - st2;
    Object.assign(T.pa, pa);
    // (3) couverture des pénuries des usines rivales : avec du stock, le taux de service d'une usine en pénurie remonte
    return o;
  });
  t.check('le négociant IA constitue des stocks de matières premières au port', a.name === 'DiscountCo' && a.val > 1e5 && a.nStk >= 10, `${a.nStk} matières, ${Math.round(a.val)} $ en stock`);
  t.check('offre « négociant » dans les fournisseurs : prix (marge 3 à 16 %), capacité = son stock, délai de réassort', a.sup && /négociant/.test(a.sup.name) && a.sup.pf >= 1.03 && a.sup.pf <= 1.16 && a.sup.stk > 0 && a.sup.re >= 6 && a.sup.re <= 14, JSON.stringify(a.sup));
  t.check('il livre le joueur sur son stock et encaisse le prix demandé (ventes « à toi » du mois)', Math.abs(a.sold - Math.min(100, a.sup ? a.sup.stk / 2 : 0)) < 1e-6 && a.cash > 0 && a.unit > 0, `${a.sold.toFixed(1)} u, ${Math.round(a.cash)} $ (${a.unit.toFixed(2)} $/u)`);
  t.check('amortisseur : cours au-dessus de son repère -> il revend (offre du jour en hausse)', a.relMade > 0 && a.relStk > 0, `+${a.relMade.toFixed(1)} u d'offre`);
  t.check('amortisseur : cours au-dessous de son repère -> il achète et stocke (demande du jour en hausse)', a.buyWant > 0 && a.buyStk > 0, `+${a.buyWant.toFixed(1)} u de demande`);
  t.check('variation journalière des cours des matières bornée (jamais +12 % d\'un coup : ≤ +4 %/jour)', a.up <= 0.0401, `hausse maximale ${(a.up * 100).toFixed(2)} %/jour sur 160 jours`);

  const b = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, TR = W.riv.tr, r = TR.R(), T = TR.S(), o = {};
    // épisode de pénurie à +6 % : le multiplicateur du cours visé monte d'au plus 0,25 %/jour et reste ≤ +8 % ; le cours ne bondit jamais
    const g = 'copper'; T.ep = { g, k: 'short', a: 0.06, t0: S.day, d: 80, ok: true }; T.epCd = 1e9; let mxStep = 0, mxUp = 0, prev = TR.M(g), p0 = S.price[g];
    for (let i = 0; i < 40; i++) { const P0 = S.price[g]; W.step(); const m = TR.M(g); mxStep = Math.max(mxStep, m - prev); prev = m; mxUp = Math.max(mxUp, S.price[g] / P0 - 1); }
    o.ep = { m: TR.M(g), mxStep, mxUp, rise: S.price[g] / p0 - 1 };
    T.ep = null;
    // électricité : la ville manque de courant -> le négociant importe (≤ 12 % de la demande), vendu au réseau +30 %
    const g0 = (T.m.grid || 0); S._pDraw = 4 * ((S.power && S.power.D) || 1000); W.step(); o.el = { tr: S.power.tr, D: S.power.D, r: S.power.r, grid: (T.m.grid || 0) - g0 };
    // cartel proposé au joueur (le joueur détient du stock) : accepté -> cours visé +6 % progressif
    const gc = 'iron'; S.stock[gc] = 5000; T.ccCd = 0; S.rv.trOf = null; T.cc = null; r.acts = 2; const room = () => true, tell = () => {}; TR.act(r, 1e6, room, tell); o.ofr = S.rv.trOf ? S.rv.trOf.g : null; o.fee = S.rv.trOf ? S.rv.trOf.fee : 0;
    const cash0 = S.cash; W.riv.answerX('tr', true); o.cc = !!T.cc; o.paid = cash0 - S.cash; const m0 = TR.M(S.rv.tr.cc ? S.rv.tr.cc.g : gc); for (let i = 0; i < 10; i++) W.step(); o.ccM = [m0, TR.M(T.cc ? T.cc.g : gc)];
    // embargo financé par le négociant contre le rival qui le domine (coût réduit de moitié)
    S.rivals.forEach(x => { x.emb = 0; }); r.acts = 1; const c1 = r.cash; const mk = S.mkt.basic; const o2 = S.rivals.find(x => x !== r); mk.riv.forEach(x => { x.s = x.id === o2.id ? 0.5 : x.id === r.id ? 0.05 : 0.01; }); TR.act(r, 1e6, room, tell); o.emb = { id: o2.emb > S.day, cost: c1 - r.cash };
    // il rejoint le cartel formé par le joueur sur une matière qu'il stocke
    const gj = Object.keys(T.stk).find(x => x !== (T.cc && T.cc.g)); S.cash = Math.max(S.cash, 1e8); W.cartelOn(gj); o.join = T.hold && T.hold.g === gj;
    o.log = S.rv.log.slice(-12).map(l => l.t);
    return o;
  });
  t.check('épisode de pénurie : multiplicateur du cours visé ≤ +0,25 %/jour et ≤ +8 %, cours sans à-coup (≤ +4 %/jour)', b.ep.mxStep <= 0.00251 && b.ep.m <= 1.081 && b.ep.m > 1.03 && b.ep.mxUp <= 0.0401, JSON.stringify(b.ep));
  t.check('électricité : en pénurie de courant, le négociant importe (≤ 12 % de la demande) et vend au réseau', b.el.tr > 0 && b.el.tr <= 0.12 * b.el.D + 1e-6 && b.el.grid > 0, JSON.stringify(b.el));
  t.check('cartel proposé au joueur sur une matière qu\'il détient, accepté : part du coût payée, cours visé monté progressivement', b.ofr && b.cc && b.paid > 0 && b.ccM[1] > b.ccM[0] && b.ccM[1] - b.ccM[0] <= 0.0251, `${b.ofr}, ${Math.round(b.paid)} $, ×${b.ccM.map(x => x.toFixed(4)).join(' → ×')}`);
  t.check('embargo financé contre le rival dominant, coût réduit de moitié (caste négociant)', b.emb.id && b.emb.cost > 0 && b.emb.cost <= 0.5 * 8000 * 10000 + 1, JSON.stringify(b.emb));
  t.check('il rejoint le cartel formé par le joueur (retient ses stocks), expliqué au journal', b.join && b.log.some(x => /rejoint ton cartel/.test(x)), b.log.slice(-3).join(' | ').slice(0, 160));

  // --- data center : appoint du négociant quand l'appoint réseau est coupé ---
  const pd = await L.newPage({ wait: 500 }); await L.setup(pd, { noAid: true }); await L.inject(pd);
  const dc = await pd.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T; for (let i = 0; i < 10; i++) T.inC('res'); const d = T.inP('dc'); if (!d) return { none: true };
    d.gb = 0; for (let i = 0; i < 6; i++) { T.frz(); W.step(); } const A0 = d._avail, ic0 = d.inCost || 0;
    d.tb = 1; const tr = W.riv.tr.R(), c0 = tr ? tr.cash : 0; let av = 0, ic = 0; for (let i = 0; i < 6; i++) { T.frz(); W.step(); av += d._avail / 6; ic += (d.inCost || 0) / 6; }
    const card = W.dc.card(d); W.save(); const sv = JSON.parse(localStorage.getItem('wse-city-v8')); const row = sv.g[d.x + d.y * W.N];
    return { A0, av, ic0, ic, trd: d._pw.trd, gain: tr ? tr.cash - c0 : 0, btn: /Appoint négociant/.test(card), tb: row && row[20] && row[20].dcp ? row[20].dcp[5] : null };
  });
  t.check('data center sans appoint réseau : le négociant couvre les pannes au prix fort (bouton dans la fiche, sauvegardé)', !dc.none && dc.av > dc.A0 + 0.05 && dc.trd > 0 && dc.ic > dc.ic0 && dc.btn && dc.tb === 1, JSON.stringify(dc));
  if (pd.errs.length) t.check('aucune erreur (data center)', false, pd.errs.slice(0, 2).join(' | '));
  await pd.context().close();

  const c = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, LX = W.riv.lx, L = LX.R(), o = {}, M = S.macro;
    o.name = L && L.name;
    // cotation : le taux suit le cycle (récession > boom) et le risque (levier), refus au-delà de 55 % de levier
    const g0 = M.gdp, sh = S.macro.sh; S.loan = 0; const v = Math.max(1, W.valuation());
    M.gdp = 0.06; const qB = LX.quote('me', 0.1 * v); M.gdp = -0.02; const qR = LX.quote('me', 0.1 * v); M.gdp = g0;
    const qLo = LX.quote('me', 0.05 * v), qHi = LX.quote('me', 0.9 * v), qX = LX.quote('me', 3 * v);
    o.q = { boom: qB.rate, rec: qR.rate, lo: qLo.rate, hi: qHi.ok ? qHi.rate : null, refuse: !qX.ok, why: qX.why && qX.why[0] };
    // prêt au joueur : ajouté à sa dette, au taux fixe coté ; intérêts payés au taux Luxor sur cette part
    const amt = LX.offerAmt(), l0 = S.loan || 0, c0 = S.cash, q = LX.quote('me', amt); const ok = LX.take(amt); o.take = { ok, amt, dl: (S.loan || 0) - l0, dc: S.cash - c0, me: LX.meAmt(), r: LX.S().me && LX.S().me.r, qr: q.rate };
    // prêt à un rival (usine) : dette + marge cotée ; refus au-delà du levier maximal, expliqué au journal
    const rv = S.rivals.find(x => x.caste === 'promoteur'); rv.debt = 0; rv.dsp = null; const okR = LX.lend(rv, 1e6, 'test'); o.lend = { ok: okR, debt: rv.debt, dsp: rv.dsp };
    const rb = S.rivals.find(x => x.caste === 'agriculteur'); rb.debt = 0; rb.bkRef = -999; const okB = LX.lend(rb, 50 * W.riv.value(rb), 'usine géante'); o.ref = { ok: okB, log: S.rv.log.slice(-1)[0].t };
    // marge d'intérêt encaissée par la banque
    const lc = L.cash; LX.day(); o.nim = L.cash - lc;
    // posture bornée : elle alimente riskPrem (≤ 0,4 point) et credCycle (≤ 6 %)
    const B = LX.S(); B.st = 0; const rp0 = W.riskPrem(), cc0 = W.credCycle(); B.st = 1; const rp1 = W.riskPrem(), cc1 = W.credCycle(); B.st = 0; o.st = { drp: rp1 - rp0, dcc: cc1 / cc0 };
    // pas de resserrement du crédit en récession (pas de spirale), même endetté
    S.rv.sq = null; S.rv.sqCd = 0; S.loan = 2 * Math.max(1, W.valuation()); M.gdp = -0.03; for (let i = 0; i < 20; i++) LX.act(L, 1e5, () => {}); o.sqRec = !!(S.rv.sq && S.rv.sq.until >= S.day); M.gdp = g0;
    // tour de table d'un rival rentable à court de trésorerie : la banque en prend 40 %, invite le joueur
    const rr = S.rivals.find(x => x.caste === 'innovateur'); rr.cash = 0.01 * W.riv.value(rr); rr.pf = 5000; const rc = rr.cash, las = L.as; L.cash = Math.max(L.cash, 50e6); S.inv = []; const okS = LX.rescue(L, rr); o.rescue = { ok: okS, dc: rr.cash - rc, das: L.as - las, inv: S.inv.length && S.inv[0].by === L.id };
    // offre de prêt au joueur dont la ligne bancaire est pleine
    S.loan = 0.9 * W.creditLimit(); S.rv.lxOf = null; LX.S().me = null; S.day = Math.max(S.day, 120); const L2 = LX.R(); L2.cash = Math.max(L2.cash, 1e7); let tries = 0; while (!S.rv.lxOf && tries++ < 3) LX.act(L2, 1e5, () => {}); o.offer = S.rv.lxOf ? { kind: S.rv.lxOf.kind, amt: S.rv.lxOf.amt, rate: S.rv.lxOf.rate } : null;
    if (S.rv.lxOf) { const l1 = S.loan; W.riv.answerX('lx', true); o.offerOk = S.loan > l1; }
    S.loan = 0;
    // lisibilité : Menu > Concurrents
    W.step(); W.refreshStats(); document.getElementById('pn').click(); document.querySelector('[data-ptab="rivals"]').click(); const box = document.getElementById('rivals'); const html = box.innerHTML; o.panel = { role: (html.match(/Rôle de l'IA/g) || []).length, tr: /data-trline/.test(html), lx: /data-lxline/.test(html), cards: box.querySelectorAll('.rcard[data-riv]').length, txt: box.textContent.slice(0, 50) };
    return o;
  });
  t.check('le banquier IA cote ses prêts selon le cycle : plus cher en récession qu\'en boom', c.name === 'Luxor & Fils' && c.q.rec > c.q.boom, `boom ${(c.q.boom * 100).toFixed(2)} %, récession ${(c.q.rec * 100).toFixed(2)} %`);
  t.check('… et selon le risque : plus cher à fort levier, refus au-delà de 55 % (motif lisible)', c.q.hi > c.q.lo && c.q.refuse && /levier/.test(c.q.why || ''), JSON.stringify(c.q));
  t.check('prêt au joueur : dette et trésorerie augmentent du montant, taux fixe coté, part Luxor suivie', c.take.ok && Math.abs(c.take.dl - c.take.amt) < 1 && Math.abs(c.take.dc - c.take.amt) < 1 && Math.abs(c.take.me - c.take.amt) < 1 && Math.abs(c.take.r - c.take.qr) < 1e-4, JSON.stringify(c.take));
  t.check('il finance un rival (dette à marge cotée) et refuse un emprunt démesuré, expliqué au journal', c.lend.ok && c.lend.debt === 1e6 && c.lend.dsp > 0 && !c.ref.ok && /refuse de prêter/.test(c.ref.log), c.ref.log.slice(0, 120));
  t.check('la banque encaisse sa marge d\'intérêt', c.nim > 0, `${c.nim.toFixed(0)} $/jour`);
  t.check('posture bornée : au plus +0,4 point de prime de risque et −6 % de crédit', c.st.drp <= 0.004 + 1e-9 && c.st.drp >= 0 && c.st.dcc >= 0.94 - 1e-9 && c.st.dcc <= 1, JSON.stringify(c.st));
  t.check('pas de resserrement du crédit en récession (aucune spirale)', !c.sqRec, '');
  t.check('tour de table d\'un rival rentable à court de trésorerie : 40 % pour la banque, joueur invité', c.rescue.ok && c.rescue.dc > 0 && Math.abs(c.rescue.das - 0.4 * c.rescue.dc / 0.98) < 1000 && c.rescue.inv, JSON.stringify(c.rescue));
  t.check('ligne bancaire pleine : le banquier propose un prêt, accepté depuis le panneau', c.offer && c.offer.kind === 'loan' && c.offer.amt > 0 && c.offerOk, JSON.stringify(c.offer));
  t.check('Menu > Concurrents : rôle de chaque IA, bloc négoce et bloc banque', c.panel.role >= 5 && c.panel.tr && c.panel.lx, JSON.stringify(c.panel));

  // --- faillite possible du négociant qui se trompe ; sauvegarde ---
  const d = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, TR = W.riv.tr, r = TR.R(), T = TR.S(), o = {};
    W.save(); const sv = JSON.parse(localStorage.getItem('wse-city-v8')); o.saved = !!(sv.rv && sv.rv.tr && sv.rv.tr.stk && sv.rv.lx); const old = JSON.parse(JSON.stringify(sv)); delete old.rv.tr; delete old.rv.lx; old.rivals.forEach(x => { delete x.dsp; delete x.bkRef; }); o.json = JSON.stringify(sv); o.old = JSON.stringify(old);
    // pari perdu financé à crédit : stocks qui s'effondrent, dette au plafond, gestion dégradée -> il brade ses stocks puis fait faillite
    const f0 = S.rv.fails || 0; r.mq = 0.05; r.as = 0; r.debt = 30e6; r.cash = -30e6; S.rivals.forEach(x => { if (x !== r) x.cash = Math.max(x.cash, 80e6); });
    let n = 0; while (S.rivals.indexOf(r) >= 0 && n++ < 500) W.step();
    o.fail = (S.rv.fails || 0) > f0; o.brade = S.rv.log.some(l => /brade/.test(l.t)); o.loss = S.rv.log.some(l => /passe une perte/.test(l.t)); o.n = n;
    return o;
  });
  t.check('le négociant qui se trompe peut faire faillite : il brade ses stocks, le banquier passe une perte', d.fail && d.brade && d.loss, `${d.n} jours`);
  await pg.context().addInitScript(j => { localStorage.setItem('wse-city-v8', j); }, d.json); await pg.reload(); await pg.waitForTimeout(700);
  const ld = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); S.noEv = true; const v = W.riv.tr.val(); for (let i = 0; i < 10; i++) W.step(); return { v, st: S.rv.lx && S.rv.lx.st != null, fin: S.rivals.every(r => isFinite(r.cash) && isFinite(W.riv.value(r))) }; });
  t.check('sauvegarde wse-city-v8 : stocks du négociant et état de la banque relus', d.saved && ld.v > 0 && ld.st && ld.fin, JSON.stringify(ld));
  const p2 = await L.newPage({ wait: 300 }); await p2.context().addInitScript(j => { localStorage.setItem('wse-city-v8', j); }, d.old); await p2.reload(); await p2.waitForTimeout(700);
  const l2 = await p2.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); S.noEv = true; for (let i = 0; i < 30; i++) W.step(); return { fin: S.rivals.every(r => isFinite(r.cash) && isFinite(W.riv.value(r))), tr: !!(S.rv && S.rv.tr) }; });
  t.check('ancienne sauvegarde sans négoce ni banque IA : chargée, simulée, état recréé', l2.fin && l2.tr && p2.errs.length === 0, p2.errs.slice(0, 2).join(' | '));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await p2.context().close(); await pg.context().close();
};
