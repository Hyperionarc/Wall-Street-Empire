// Passe 47 : brevets de produit (fin de la rente fixe), licences et redevances, brevets des rivaux, expiration, pipeline de R&D,
// accélération payante (Diamants, trésorerie, crédits labo) avec plafonds et coût affiché avant confirmation, module IAP inactif (IAP_LIVE = false),
// déterminisme, ancienne sauvegarde convertie, chapitre « Brevets » de l'onglet Apprendre, lisibilité 1280x720 et 390x844.
exports.name = 'Brevets, licences et accélération de la R&D';
const SHOTS = process.env.WSE_SHOTS || '';
const open = async (L, w, h, ctx) => {
  const pg = await L.newPage({ w, h, wait: 500, ctx }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#feed{display:none!important}' });
  return pg;
};
const fit = pg => pg.evaluate(() => { const sec = document.getElementById('rdpSec'), bad = [];
  sec.querySelectorAll('.rdrow,.rdk>div,.btn,h3,.note,.edlearn,.accp,.conf').forEach(e => { if (e.offsetParent && e.scrollWidth > e.clientWidth + 1) bad.push((e.className || e.tagName) + ':' + (e.textContent || '').slice(0, 30)); });
  const pm = document.querySelector('#panel .pmain'), txt = sec.innerText;
  return { bad, hscroll: pm.scrollWidth > pm.clientWidth + 1, nan: /NaN|undefined|Infinity|\[object/.test(txt), len: txt.length, vis: !sec.hidden && sec.getBoundingClientRect().width > 0 }; });

exports.run = async (t, L) => {
  let pg = await open(L, 1280, 720);
  // 1. premier développement (marché neuf) : brevet de 8 ans (+2 en haute technologie), plus de rente fixe
  const a = await pg.evaluate(() => { const W = window.WSE, S = W.S, o = {}; W.mk.setMat(0);
    o.rev0 = W.rd.revDay(); o.ok = W.launchProduct('biscuits'); o.ok2 = W.launchProduct('phone'); o.rdT = S.prod.phone.rdT;
    for (let i = 0; i < 25; i++) W.step();
    o.b = W.rd.held('biscuits'); o.p = W.rd.held('phone'); o.yb = W.rd.years('biscuits', 'dev', true); o.yp = W.rd.years('phone', 'dev', true); o.yo = W.rd.years('obesity', 'dev', true); o.val = W.rd.value('phone'); o.patents = S.patents || 0; o.patRev = S.patRev; o.mine = W.rd.mine('phone');
    o.st = S.prod.phone.st; return o; });
  t.check('premier à terminer la R&D : brevet au nom du joueur (since, until, holder, licensees), produit lancé', a.ok && a.ok2 && a.st === 'on' && a.p && a.p.holder === 'me' && Array.isArray(a.p.licensees) && a.mine && a.b && a.b.holder === 'me', JSON.stringify(a.p));
  t.check('durée en années de jeu : 8 ans (base), 10 ans (haute technologie), 12+ ans (pharmacie) ; 1 an = 120 jours', a.p.until - a.p.since === a.yp * 120 && a.yb === 8 && a.yp === 10 && a.yo >= 12 && a.b.until - a.b.since === 960, `biscuits ${a.yb} ans, smartphone ${a.yp} ans, obésité ${a.yo} ans`);
  t.check('rente fixe supprimée : sans licencié, aucune redevance ; valeur du brevet capitalisée > 0', a.rev0 === 0 && a.patRev === 0 && a.patents === 0 && a.val > 0, `valeur ${Math.round(a.val)} $`);
  // 2. licence accordée : forfait encaissé, redevances quotidiennes, rival débité ; le licencié partage le produit
  const b = await pg.evaluate(() => { const W = window.WSE, S = W.S, X = W.rd.st(), rv = S.rivals[0], o = {};
    o.comp0 = W.mk.comp('phone'); X.off.push({ id: 901, pk: 'phone', who: 'x' + rv.id, name: rv.name, fee: 25000, rate: 0.05, exp: S.day + 30 });
    o.cash0 = S.cash; o.rc0 = rv.cash; o.ans = W.rd.answer(901, true); o.cash1 = S.cash; o.rc1 = rv.cash; o.lic = W.rd.held('phone').licensees.slice();
    o.comp1 = W.mk.comp('phone'); o.day = W.rd.licDay('phone', o.lic[0]); o.rd0 = W.rd.revDay(); W.step(); o.patRev = S.patRev; o.paid = W.rd.held('phone').licensees[0].paid; o.roy = W.rd.held('phone').roy; o.rc2 = rv.cash; o.cpi = S.cpi || 1;
    X.off.push({ id: 902, pk: 'biscuits', who: 'p1', name: 'X', fee: 100, rate: 0.05, exp: S.day + 30 }); o.cash2 = S.cash; o.ref = W.rd.answer(902, false); o.cash3 = S.cash; o.lb = W.rd.held('biscuits').licensees.length; return o; });
  t.check('licence accordée : forfait encaissé, licencié inscrit, le rival paie', b.ans && b.cash1 - b.cash0 === 25000 && b.rc0 - b.rc1 === 25000 && b.lic.length === 1 && b.lic[0].rate === 0.05, JSON.stringify(b.lic[0]));
  t.check('redevances : S.patRev = part du licencié × demande × prix × taux, cumulées sur le brevet et payées par le rival', b.day > 0 && Math.abs(b.patRev - b.day) < 0.03 * Math.max(1, b.day) && b.roy > 0 && Math.abs(b.paid - b.roy) < 1e-6 && Math.abs(b.roy - b.patRev * b.cpi) < 0.03 * b.roy, `${b.day.toFixed(1)} $/j, cumul ${Math.round(b.roy)} $ payés par le licencié`);
  t.check('licencié = un concurrent de plus sur le produit (attrait ×1/1,1) ; refus : rien n\'est encaissé', Math.abs(b.comp1 / b.comp0 - 1 / 1.1) < 1e-6 && !b.ref && b.cash3 === b.cash2 && b.lb === 0, `${b.comp0} → ${b.comp1.toFixed(3)}`);
  // 3. brevet d'un rival : blocage, gamme inférieure libre, licence payée (transfert de technologie) et redevance sur le chiffre d'affaires
  const c = await pg.evaluate(() => { const W = window.WSE, S = W.S, rv = S.rivals[1] || S.rivals[0], o = {};
    S.pat.camera = { since: S.day, until: S.day + 960, holder: rv.id, hn: rv.name, q: 1, kind: 'dev', licensees: [], roy: 0, rate: 0.06 }; W.mk.inv();
    S.prod.camera.q = 1; o.blk = !!W.rd.block('camera'); o.msg = W.rd.blockMsg('camera'); o.l = W.launchProduct('camera'); o.st0 = S.prod.camera.st; o.low = W.rd.block('camera', 0);
    o.fee = W.rd.licFee('camera'); o.cash0 = S.cash; o.rc0 = rv.cash; o.buy = W.rd.buyLicence('camera'); o.cash1 = S.cash; o.rc1 = rv.cash; o.st1 = S.prod.camera.st; o.q = S.prod.camera.q; o.blk2 = !!W.rd.block('camera');
    S.prod.camera.rev = 10000; S.prod.camera.res = 0; const c2 = S.cash, r2 = rv.cash; W.rd.step(); o.pay = c2 - S.cash; o.get = rv.cash - r2; o.paid = W.rd.st().paid; return o; });
  t.check('brevet d\'un rival : le joueur ne peut pas développer à la gamme couverte (message, R&D refusée), la gamme inférieure reste libre', c.blk && !c.l && c.st0 === 'locked' && /brevet de/.test(c.msg) && c.low === null, c.msg.slice(0, 120));
  t.check('licence achetée : forfait payé au rival, produit lancé tout de suite à la gamme couverte, plus de blocage', c.buy.ok && Math.abs(c.cash0 - c.cash1 - c.fee) < 1 && Math.abs(c.rc1 - c.rc0 - c.fee) < 1 && c.st1 === 'on' && c.q === 1 && !c.blk2, `licence ${c.fee} $`);
  t.check('licence payée : 6 % du chiffre d\'affaires versés chaque jour au titulaire', Math.abs(c.pay - 600) < 1e-6 && Math.abs(c.get - 600) < 1e-6 && c.paid >= 600, `${c.pay} $ payés`);
  // 4. exclusivité du marché mûr : premier à une gamme au-dessus du marché ; les offreurs non licenciés passent sous la gamme couverte
  const m = await pg.evaluate(() => { const W = window.WSE, S = W.S, o = {}; W.mk.setMat(1);
    const pk = W.PKEYS.find(k => { const pr = W.PRODUCTS[k]; return !pr.free && !pr.pharma && S.prod[k].st === 'locked' && !S.pat[k] && W.rd.top(k) === 1; });
    o.pk = pk; o.top = W.rd.top(pk); o.off0 = W.mk.offers(pk).map(x => [x.id, x.tier]); o.comp0 = W.mk.comp(pk);
    W.changeTier(pk, 1); o.same = W.rd.grant(pk, 'dev'); W.changeTier(pk, 2); o.l = W.launchProduct(pk, 'rd');
    for (let i = 0; i < 80 && S.prod[pk].st !== 'on'; i++) W.step();
    o.p = W.rd.held(pk); o.pq = o.p && o.p.q; o.off1 = W.mk.offers(pk).map(x => [x.id, x.tier, !!x.copy]); o.top1 = W.rd.top(pk);
    if (o.p) { o.p.q = 1; W.mk.inv(); } o.off1b = W.mk.offers(pk).map(x => [x.id, x.tier, !!x.copy]); o.comp1 = W.mk.comp(pk);   // brevet couvrant la gamme déjà vendue : copies de gamme inférieure
    // licencié : garde sa gamme ; expiration : les copies redeviennent des offres normales
    const top2 = W.mk.offers(pk).find(x => x.copy); if (top2) { o.p.licensees.push({ id: top2.id, name: top2.name, since: S.day, fee: 0, rate: 0.05, paid: 0 }); W.mk.inv(); o.licT = (W.mk.offers(pk).find(x => x.id === top2.id) || {}).tier; o.licT0 = o.off0.find(x => x[0] === top2.id)[1]; }
    o.p.until = S.day + 1; o.w0 = o.p.w; W.step(); o.after = W.rd.held(pk); o.hist = W.rd.st().hist[0]; o.off2 = W.mk.offers(pk).map(x => [x.id, x.tier, !!x.copy]); W.mk.setMat(0); return o; });
  t.check('marché mûr : pas de brevet à la gamme déjà vendue ; brevet en gamme supérieure (premier à ce niveau de technologie)', m.pk && m.same === null && m.p && m.p.holder === 'me' && m.pq === 2, `${m.pk} : marché gamme ${m.top}, brevet gamme ${m.pq}`);
  t.check('exclusivité : plus aucun offreur non licencié à la gamme couverte (versions de gamme inférieure seulement), attrait du produit en hausse', m.off1.every(x => x[1] < 2) && m.off1b.every(x => x[1] < 1) && m.off1b.some(x => x[2]) && m.comp1 > m.comp0 && m.top1 === 1, JSON.stringify(m.off1b) + ` attrait ${m.comp0.toFixed(3)} → ${m.comp1.toFixed(3)}`);
  t.check('un licencié garde sa gamme d\'origine', m.licT !== undefined && m.licT === m.licT0, `${m.licT0} → ${m.licT}`);
  t.check('expiration : brevet retiré, historique, les offres redeviennent normales (aucune copie)', !m.after && m.hist && m.hist.pk === m.pk && m.off2.every(x => !x[2]) && m.off2.some(x => x[1] >= 1), JSON.stringify(m.hist));
  // 5. expiration imminente annoncée ; rivaux qui déposent des brevets (déterministe)
  const e = await pg.evaluate(() => { const W = window.WSE, S = W.S, o = {}, p = W.rd.held('phone'); p.until = S.day + 50; p.w = 0; const f0 = document.getElementById('feed').innerText.length; W.step(); o.w = p.w; o.feed = document.getElementById('feed').textContent; o.adv = W.rd.advice(); return o; });
  t.check('expiration imminente : alerte à 60 jours de l\'échéance, conseil du panneau', e.w === 1 && /Expiration imminente/.test(e.feed) && /expire dans/.test(e.adv), e.adv.slice(0, 100));
  // 6. accélération : jours retirés, plafond par jour et par recherche, coût affiché avant confirmation, alternative en trésorerie, crédits labo
  const x = await pg.evaluate(() => { const W = window.WSE, S = W.S, X = W.rd.st(), o = {}; o.gem0 = X.gem;
    W.changeTier('car', 1); o.l = W.launchProduct('car'); const ps = S.prod.car, k = 'p:car'; o.T = ps.rdT; o.r0 = ps.rnd;
    const I = W.rd.info(k); o.rate = I.rate; o.capDay = I.capDay; o.capTot = I.capTot; o.perDay = I.perDay; o.cost = I.cost; o.q5 = W.rd.quote(k, 5); o.q5 = { d: o.q5.d, gem: o.q5.gem, cash: o.q5.cash };
    o.a1 = W.rd.accelerate(k, 2, 'gem'); o.r1 = ps.rnd; o.gem1 = X.gem; o.a2 = W.rd.accelerate(k, 50, 'gem'); o.r2 = ps.rnd; o.a3 = W.rd.accelerate(k, 1, 'gem'); o.gem3 = X.gem;
    W.step(); const c0 = S.cash; o.a4 = W.rd.accelerate(k, 1, 'cash'); o.cashD = c0 - S.cash; X.cred = 3; o.a5 = W.rd.accelerate(k, 1, 'lab'); o.cred = X.cred;
    let n = 0; for (let i = 0; i < 40; i++) { const r = W.rd.accelerate(k, 10, 'cash'); if (r.ok) n += r.d; W.step(); if (ps.st !== 'rnd') break; } o.acc = ps.acc; o.T2 = Math.floor(ps.rdT * 0.5);
    o.costs = [1, 5, 10, 30].map(W.rd.gemCost); return o; });
  t.check('accélérer retire exactement les jours achetés (−2 j : ' + (x.r0 - x.r1).toFixed(2) + ' j de R&D)', x.a1.ok && x.a1.d === 2 && Math.abs((x.r0 - x.r1) - 2 * x.rate) < 1e-9 && x.gem0 - x.gem1 === x.a1.gem && x.a1.gem === 6, JSON.stringify(x.a1));
  t.check('plafond par jour de jeu (10 % de la durée, au plus 10 j) : la demande de 50 j est ramenée au plafond, puis refusée le même jour', x.a2.ok && x.a2.d === x.capDay - 2 && !x.a3.ok && /Plafond/.test(x.a3.why) && x.gem3 === x.gem1 - x.a2.gem, `plafond ${x.capDay} j/jour, 2e achat ${x.a2.d} j, 3e refusé`);
  t.check('plafond par recherche : au plus la moitié de la durée accélérée en tout', x.acc <= x.T2 && x.acc >= x.T2 - 10, `${x.acc} j accélérés sur ${x.T} j (max ${x.T2})`);
  t.check('tarif dégressif lisible : 1 j = 3, 5 j = 12, 10 j = 22, 30 j = 55 Diamants', JSON.stringify(x.costs) === '[3,12,22,55]', x.costs.join(' / '));
  t.check('alternative en trésorerie : 3 fois le coût journalier de la R&D, sans remise ; crédits labo 1 pour 1', x.a4.ok && Math.abs(x.cashD - x.perDay) < 1e-6 && Math.abs(x.perDay - Math.max(500, Math.round(x.cost / x.T * 3))) <= 1 && x.a5.ok && x.cred === 2 && x.q5.cash === x.q5.d * x.perDay && x.q5.d === Math.min(5, x.capDay), `${x.perDay} $/j (R&D ${Math.round(x.cost)} $ sur ${x.T} j)`);
  // 7. Diamants : dotation de départ, +10 par palier, +5 par jalon du conseiller
  const g = await pg.evaluate(() => { const W = window.WSE, S = W.S; S.stats.worth = 0; S.rdx = null; const X = W.rd.st(), o = { g0: X.gem, tp: X.tp }; S.stats.worth = 1e13; W.rd.step(); o.g1 = W.rd.st().gem; S.coach = S.coach || { done: {}, prop: -1e9 }; S.coach.done = Object.assign({}, S.coach.done, { zz_test: S.day }); W.rd.step(); o.g2 = W.rd.st().gem; W.rd.step(); o.g3 = W.rd.st().gem; return o; });
  t.check('Diamants : 100 au départ, +10 par palier atteint (4 paliers : +40), +5 par jalon, une seule fois', g.g0 === 100 && g.tp === 0 && g.g1 === 140 && g.g2 === g.g1 + 5 && g.g3 === g.g2, JSON.stringify(g));
  // 8. panneau : coût affiché AVANT confirmation, confirmation qui débite ; IAP inactif (aucune requête, aucun crédit)
  await pg.evaluate(() => { const W = window.WSE, S = W.S; W.rd.st().gem = 100; W.launchProduct('tv'); W.coach.setPanel(true); document.querySelector('#panel [data-ptab="rdp"]').click(); window._rdp.sel = 'p:tv'; window._rdp.d = 1; window._rdp.conf = null; W.rd.render(true); });
  const u0 = await pg.evaluate(() => ({ btn: (document.querySelector('[data-rdp="ask:gem"]') || {}).textContent, cash: (document.querySelector('[data-rdp="ask:cash"]') || {}).textContent, gem: window.WSE.rd.st().gem, r: window.WSE.S.prod.tv.rnd }));
  await pg.click('[data-rdp="ask:gem"]');
  const u1 = await pg.evaluate(() => ({ conf: (document.querySelector('#rdp .conf') || {}).innerText || '', gem: window.WSE.rd.st().gem, r: window.WSE.S.prod.tv.rnd }));
  await pg.click('[data-rdp="go"]');
  const u2 = await pg.evaluate(() => ({ gem: window.WSE.rd.st().gem, r: window.WSE.S.prod.tv.rnd }));
  t.check('coût affiché sur le bouton puis dans la confirmation, rien n\'est débité avant « Confirmer »', /−1 j · 3 Diamants/.test(u0.btn) && /\$/.test(u0.cash) && /3 Diamants/.test(u1.conf) && u1.gem === u0.gem && u1.r === u0.r && u2.gem === u0.gem - 3 && u2.r < u0.r, `${u0.btn} | ${u1.conf.replace(/\s+/g, ' ').slice(0, 80)}`);
  const reqs = []; pg.on('request', r => { if (!/^(file|data|blob):/.test(r.url())) reqs.push(r.url()); });
  await pg.evaluate(() => { window._rdp.shop = true; window.WSE.rd.render(true); });
  await pg.click('[data-rdp="iap:gem_l"]'); await pg.waitForTimeout(150);
  const ia = await pg.evaluate(() => { const W = window.WSE, r = W.rd.iapPurchase ? null : W.rd.iap.purchase('gem_s'); return { live: W.rd.iap.LIVE, r, gem: W.rd.st().gem, box: !document.getElementById('iapbox').hidden, t: document.getElementById('iapT').textContent, demo: /DÉMONSTRATION/.test(document.getElementById('rdpSec').innerText), calls: W.rd.iap.log.calls.length, cred: W.rd.iap.log.credited }; });
  if (SHOTS) await pg.screenshot({ path: SHOTS + '/t47_iap_1280.png' });
  t.check('IAP_LIVE = false : iapPurchase n\'ouvre que « Paiements bientôt disponibles », aucun crédit, aucune requête réseau, offres marquées démonstration', ia.live === false && ia.r && ia.r.ok === false && ia.r.reason === 'iap_off' && ia.gem === u2.gem && ia.box && /bientôt disponibles/.test(ia.t) && ia.demo && ia.calls === 2 && ia.cred === 0 && reqs.length === 0, JSON.stringify({ r: ia.r, reqs: reqs.length }));
  await pg.evaluate(() => { document.getElementById('iapbox').hidden = true; });
  const f1 = await fit(pg); if (SHOTS) await pg.screenshot({ path: SHOTS + '/t47_rdp_1280.png' });
  t.check('panneau R&D et brevets lisible à 1280x720 (rien ne déborde, pas de NaN)', f1.vis && !f1.bad.length && !f1.hscroll && !f1.nan && f1.len > 600, JSON.stringify(f1).slice(0, 160));
  // 9. Apprendre > Brevets : une phrase par situation
  const ed = await pg.evaluate(() => { const W = window.WSE; W.edu.show('pat'); return document.getElementById('eduBody').innerText; });
  t.check('Apprendre > « Brevets et avantage concurrentiel » : brevet détenu, licence payée, expiration imminente', /BREVETS ET AVANTAGE CONCURRENTIEL/i.test(ed) && /Brevet détenu/i.test(ed) && /Licence payée/i.test(ed) && /Expiration imminente/i.test(ed) && !/NaN|undefined/.test(ed), ed.slice(0, 120).replace(/\s+/g, ' '));
  const ex = await pg.evaluate(() => { const W = window.WSE; return ['mk', 'edu', 'net', 'coach', 'mall', 'fac', 'ph', 'riv', 'acq', 'pro', 'zn', 'rub', 'grp'].filter(k => !W[k]).concat(typeof W.rd.patentHeld === 'function' ? [] : ['rd']); });
  t.check('exports window.WSE conservés et window.WSE.rd ajouté', ex.length === 0, ex.join(','));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
  // 10. déterminisme : même graine, mêmes actions = mêmes brevets de rivaux, mêmes offres de licence
  const run = async () => { const p = await open(L, 1280, 720); const r = await p.evaluate(() => { const W = window.WSE, S = W.S; W.mk.setMat(0); W.launchProduct('phone'); for (let i = 0; i < 520; i++) W.step(); return JSON.stringify({ pat: S.pat, off: W.rd.st().off, gem: W.rd.st().gem }); }); await p.context().close(); return r; };
  const [d1, d2] = [await run(), await run()];
  t.check('déterminisme : deux parties identiques donnent les mêmes brevets (dont ceux des rivaux) et les mêmes offres', d1 === d2 && /"holder":"r/.test(d1), d1 === d2 ? (d1.match(/"holder"/g) || []).length + ' brevets' : 'différent');
  // 11. ancienne sauvegarde (S.patents = 3, rente fixe) : convertie en portefeuille sans erreur
  const ctx = await (await L.browser()).newContext({ viewport: { width: 390, height: 844 } });
  pg = await open(L, 390, 844, ctx);
  const old = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.mk.setMat(0); W.launchProduct('biscuits'); for (let i = 0; i < 8; i++) W.step(); W.save(); const sv = JSON.parse(localStorage.getItem('wse-city-v8')); delete sv.pat; delete sv.rdx; sv.patents = 3; return JSON.stringify(sv); });
  await pg.close(); await ctx.addInitScript(v => { if (!sessionStorage.getItem('t47')) { sessionStorage.setItem('t47', '1'); localStorage.setItem('wse-city-v8', v); } }, old);   // sauvegarde « d'avant la passe 47 »
  pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); await pg.goto(L.URL); await pg.waitForTimeout(400);
  const o = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); const r = { pat: JSON.parse(JSON.stringify(S.pat || {})), old: S.rdx && S.rdx.old, patents: S.patents, rev: W.rd.revDay() }; for (let i = 0; i < 5; i++) W.step(); r.rev2 = S.patRev; return r; });
  t.check('ancienne sauvegarde : 3 brevets à rente fixe → 1 brevet de produit (biscuits) + 2 brevets génériques qui expirent, sans erreur', o.pat.biscuits && o.pat.biscuits.holder === 'me' && o.old && o.old.n === 2 && o.old.until > 0 && o.patents === 0 && Math.abs(o.rev - 140) < 1e-6 && o.rev2 > 0 && pg.errs.length === 0, JSON.stringify({ old: o.old, rev: o.rev }));
  // 12. mobile 390x844
  await L.inject(pg); await pg.addStyleTag({ content: '#modesel,#win,#endscr,#feed,#caste,#hint{display:none!important}' });
  await pg.evaluate(() => { const W = window.WSE; W.launchProduct('phone'); W.coach.setPanel(true); document.querySelector('#panel [data-ptab="rdp"]').click(); window._rdp.sel = 'p:phone'; window._rdp.shop = true; W.rd.render(true); });
  const f2 = await fit(pg); if (SHOTS) await pg.screenshot({ path: SHOTS + '/t47_rdp_390.png', fullPage: false });
  t.check('panneau lisible sur mobile 390x844 (pas de défilement horizontal, rien ne déborde)', f2.vis && !f2.bad.length && !f2.hscroll && !f2.nan, JSON.stringify(f2).slice(0, 160));
  t.check('aucune erreur de page (mobile, sauvegarde rechargée)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await ctx.close();
};
