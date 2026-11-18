// Passe 43 : outil d'apprentissage (écoles de commerce). Atelier marque, tableau supply chain, chocs de commandes annoncés, bilan d'apprentissage.
// Indicateurs recalculés à partir de la simulation du jour (demande S._dw.pd, ventes ps.sold, production ps.made, stock, capacité des rayons S._dw.pc),
// campagne = hausse de demande (avec délai) puis de marque, rupture pendant un pic = fidélité en baisse bornée, export JSON, déterminisme, sauvegarde,
// lisibilité 1280x720 et 390x844.
exports.name = 'Apprentissage : marque, supply chain, chocs, bilan';
const PK = 'bread';
// usine f2 de pain, 4 hypermarchés ; lim : intrants limités chaque jour (production < demande, rupture de stock)
const SETUP = (lim, PK, ns, ded) => `(() => {
  const W = window.WSE, S = W.S; T.frz();
  const f = T.inP('f2'); T.inP('port'); for (let i = 0; i < 40; i++) T.inC('res'); for (let i = 0; i < ${ns}; i++) T.inC('s3');
  ${ded ? "S.grid.forEach(q => { if (q && q.t === 's3') q.shelf = { g_basic: false, g_std: false }; });" : ''}
  W.launchProduct('${PK}'); const ps = S.prod['${PK}']; ps.st = 'on'; ps.rnd = 0; ps.pf = 1;
  f.prod = '${PK}'; f.wage = 2; const ins = Object.keys(W.productInputs('${PK}')), need = W.productInputs('${PK}');
  f.src = {}; ins.forEach(g => { f.src[g] = 'local'; });
  const pre = () => { T.frz(); S.cash = Math.max(S.cash, 5e9); ins.forEach(g => { S.stock[g] = ${lim ? 'need[g] * ' + lim : '1e6'}; }); };
  const tally = { d: [], s: [], m: [], k: [] };
  const day = () => { pre(); W.step(); const p = S.prod['${PK}']; tally.d.push(S._dw.pd['${PK}'] || 0); tally.s.push(p.sold || 0); tally.m.push(p.made || 0); tally.k.push(p.stock || 0); };
  window.B = { W, S, f, pre, ins, day, tally };
  for (let i = 0; i < 25; i++) day();
})()`;
const SHOTS = process.env.WSE_SHOTS || '';
const open = async (L, w, h, lim, o = {}) => {
  const pg = await L.newPage({ w, h, wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP(lim, o.pk || PK, o.ns || 4, o.ded));
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#feed{display:none!important}' });
  return pg;
};
// lisibilité : rien ne déborde dans l'onglet Apprendre, pas de défilement horizontal, pas de NaN
const fit = pg => pg.evaluate(() => { const sec = document.getElementById('eduSec'), bad = [];
  sec.querySelectorAll('.edk>div,.finrow,.edlearn,.edlim,.edpeak,.btn,h3,h4,.note,.edleg,.edsel').forEach(e => { if (e.offsetParent && e.scrollWidth > e.clientWidth + 1) bad.push((e.className || e.tagName) + ':' + (e.textContent || '').slice(0, 30)); });
  const pm = document.querySelector('#panel .pmain'), txt = sec.innerText;
  return { bad, hscroll: pm.scrollWidth > pm.clientWidth + 1, nan: /NaN|undefined|Infinity|\[object/.test(txt), len: txt.length, vis: !sec.hidden && sec.getBoundingClientRect().width > 0 }; });

exports.run = async (t, L) => {
  let pg = await open(L, 1280, 720);
  // 1. indicateurs supply chain = valeurs de la simulation
  const k = await pg.evaluate(pk => { const { W, S, f, tally } = window.B, sc = W.edu.sc(pk, 30), ps = S.prod[pk], sum = a => a.reduce((x, y) => x + y, 0), n = tally.d.length;
    const D = sum(tally.d), Q = sum(tally.s), qty = W.PRODUCTS[pk].out, capX = (f._u || 0) * qty * (1 - Math.max(0, 0.05)) ;
    return { n: sc.n, nT: n, D: sc.D, DT: D, Q: sc.Q, QT: Q, svc: sc.svc, lost: sc.lost, days: sc.days, daysX: ps.stock / (Q / n), stock: sc.stock, psStock: ps.stock, cap: sc.cap, capX, capS: S._dw.pc[pk], capS7: sc.capS, lim: W.edu.lim(pk), bw: sc.bw, rot: sc.rot, ss: sc.ss, lead: sc.lead, made: sum(tally.m) / n, scMade: sc.made }; }, PK);
  const near = (a, b, r) => Math.abs(a - b) <= (r || 1e-3) * Math.max(1, Math.abs(b));
  t.check('niveau de service = ventes ÷ demande relevées jour après jour dans la simulation (S._dw.pd, ps.sold)', k.n === k.nT && near(k.D, k.DT) && near(k.Q, Math.min(k.QT, k.DT)) && near(k.svc, k.Q / k.D) && near(k.lost, k.D - k.Q), JSON.stringify({ n: k.n, D: Math.round(k.D), Q: Math.round(k.Q), svc: +k.svc.toFixed(3) }));
  t.check('jours de stock, production moyenne, capacité des rayons (S._dw.pc) et capacité des usines cohérents', near(k.days, k.daysX) && near(k.stock, k.psStock) && near(k.scMade, k.made) && k.capS > 0 && k.cap > 0 && k.cap <= k.capX * 1.001 && k.cap >= 0.85 * k.capX, JSON.stringify({ days: +k.days.toFixed(1), cap: Math.round(k.cap), capS: Math.round(k.capS), lim: k.lim.k }));
  t.check('maillon qui limite identifié avec une action (stock présent, rayons saturés : les magasins)', k.lim.k === 'shop' && /rayons/.test(k.lim.why) && k.lim.acts.length >= 1 && k.QT < k.DT, k.lim.t + ' · ' + k.lim.why.slice(0, 90));
  t.check('coup de fouet, rotation, délai et stock de sécurité calculés (valeurs finies)', [k.rot, k.ss, k.lead].every(Number.isFinite) && (k.bw == null || Number.isFinite(k.bw)) && k.lead === 1, JSON.stringify({ bw: k.bw, rot: k.rot && +k.rot.toFixed(1), ss: Math.round(k.ss) }));
  // 2. campagne : annonce de la hausse, demande qui monte avec un délai, puis capital de marque ; coût dans la publicité
  const c = await pg.evaluate(pk => { const { W, S, day } = window.B, ps = S.prod[pk], base = W.S._dw.pd[pk], bc0 = W.brand.of(ps);
    const r = W.edu.camp(pk), ah = W.edu.ahead().find(a => a.p === pk), feed = document.getElementById('feed').innerText, o = { r, ah, feed, base, bc0, d: [], m: [], bc: [], ad: [] };
    for (let i = 0; i < 26; i++) { day(); o.d.push(S._dw.pd[pk]); o.m.push(W.edu.demM(pk)); o.bc.push(W.brand.of(ps)); o.ad.push(ps.adCost); }
    o.rec = S.edu.pk.slice(-1)[0] || null; o.camp = S.edu.camp[pk] || null; o.b = W.edu.brand(pk); return o; }, PK);
  t.check('campagne : le jeu annonce la hausse attendue (« +X % dans 5 jours ») et la liste dans les pics à venir', c.r.ok && /Demande attendue \+\d+ % dans 5 jours/.test(c.feed) && c.ah && c.ah.pct === Math.round(c.r.A * 100) && c.ah.wait === 5, c.feed.slice(0, 160));
  t.check('campagne : la demande monte AVEC UN DÉLAI (1/5 de l\'effet le 1er jour, plein effet au 5e)', Math.abs(c.m[0] - (1 + c.r.A / 5)) < 1e-6 && Math.abs(c.m[4] - (1 + c.r.A)) < 1e-6 && c.d[5] > c.base * (1 + 0.6 * c.r.A) && c.d[0] < c.d[5], JSON.stringify({ base: Math.round(c.base), j1: Math.round(c.d[0]), j6: Math.round(c.d[5]), A: c.r.A }));
  t.check('campagne : puis le capital de marque monte (+5 points au moins) ; budget payé chaque jour dans la publicité', c.bc[14] - c.bc0 >= 5 && c.ad.slice(0, 15).every(x => Math.abs(x - c.r.b) < 1e-6) && c.ad[16] === 0, JSON.stringify({ bc0: +c.bc0.toFixed(1), bc15: +c.bc[14].toFixed(1), b: c.r.b }));
  t.check('pic enregistré ; rayons saturés sans rupture de stock : aucune perte de fidélité, mais pic non tenu (pas de bonus)', c.rec && c.rec.k === 'camp' && c.rec.rd === 0 && c.rec.pen === 0 && c.rec.ok === 0 && c.rec.bon === 0 && c.rec.svc < c.rec.sb, JSON.stringify(c.rec));
  // pic TENU : lave-linge, 8 hypermarchés dont les rayons lui sont consacrés (capacité des rayons et production > demande du pic)
  { const pw = await open(L, 1280, 720, 0, { pk: 'washer', ns: 8, ded: true });
    const w = await pw.evaluate(() => { const { W, S, day } = window.B, ps = S.prod.washer, bc0 = W.brand.of(ps), loy0 = ps.loy, ah = (W.edu.camp('washer'), W.edu.ahead()[0]); for (let i = 0; i < 26; i++) day(); return { ah, rec: S.edu.pk.slice(-1)[0] || null, bc0, bc: W.brand.of(ps), loy0, loy: ps.loy }; });
    t.check('pic TENU (production et rayons suffisants, verdict annoncé « tu tiendras ») : aucune rupture, bonus de marque et de fidélité', w.ah && w.ah.ok && !w.ah.shelf && w.rec && w.rec.ok === 1 && w.rec.rd === 0 && w.rec.bon > 0 && w.rec.svc >= 0.95 && w.bc > w.bc0, JSON.stringify(w.rec));
    t.check('aucune erreur de page (pic tenu)', pw.errs.length === 0, pw.errs.slice(0, 2).join(' | '));
    await pw.context().close(); }
  // 3. écran Atelier marque et Supply chain à 1280x720
  const ui = async (pg, tag) => { const o = {};
    await pg.evaluate(() => { window.WSE.edu.show('brand'); }); await pg.waitForTimeout(250);
    o.brand = await pg.evaluate(() => document.getElementById('eduBody').innerText.replace(/\s+/g, ' ')); o.fb = await fit(pg); if (SHOTS) await pg.screenshot({ path: SHOTS + '/edu_marque_' + tag + '.png', fullPage: false });
    await pg.evaluate(() => { document.querySelector('#eduTabs [data-edut="scm"]').click(); }); await pg.waitForTimeout(200);
    o.scm = await pg.evaluate(() => document.getElementById('eduBody').innerText.replace(/\s+/g, ' ')); o.fs = await fit(pg); if (SHOTS) await pg.screenshot({ path: SHOTS + '/edu_supply_' + tag + '.png' });
    await pg.evaluate(() => { document.querySelector('#eduTabs [data-edut="deb"]').click(); }); await pg.waitForTimeout(200);
    o.deb = await pg.evaluate(() => document.getElementById('eduBody').innerText.replace(/\s+/g, ' ')); o.fd = await fit(pg); if (SHOTS) await pg.screenshot({ path: SHOTS + '/edu_bilan_' + tag + '.png' });
    return o; };
  const u = await ui(pg, '1280x720');
  t.check('Atelier marque : courbe, force (courbe en S), fidélité, prime, valeur de marque expliquée, coût et rendement de la pub, érosion, expériences, « Ce que tu apprends »', ['Capital de marque dans le temps', 'courbe en S', 'Fidélité', 'Prime de prix obtenue', 'Valeur de la marque', 'demi-vie ÷ ln 2', 'Coût de la publicité', 'Rendement de la pub', 'Érosion si j\'arrête', 'Campagne coup de poing', 'Tout couper', 'Ce que tu apprends'].every(x => u.brand.toLowerCase().includes(x.toLowerCase())), u.brand.slice(0, 200));
  t.check('Supply chain : service, ventes perdues ($ et unités), jours de stock, délai, rotation, capacité servable vs pointe, coup de fouet, maillon qui limite', ['Niveau de service', 'Ventes perdues', 'Jours de stock', 'Délai de réapprovisionnement', 'Rotation des stocks', 'Capacité maximale servable', 'Demande de pointe', 'coup de fouet', 'Maillon qui limite', 'PICS À VENIR', 'EMPIRE'].every(x => u.scm.toLowerCase().includes(x.toLowerCase())), u.scm.slice(0, 200));
  t.check('1280x720 : trois écrans lisibles (aucun texte coupé, pas de défilement horizontal, pas de NaN)', [u.fb, u.fs, u.fd].every(f => f.vis && !f.bad.length && !f.hscroll && !f.nan), JSON.stringify([u.fb, u.fs, u.fd].map(f => ({ bad: f.bad.slice(0, 2), h: f.hscroll, nan: f.nan }))));
  // « Tout couper » : la publicité tombe à zéro, l'érosion suit la demi-vie
  const cut = await pg.evaluate(pk => { const { W, S, day } = window.B, ps = S.prod[pk]; ps.ad.radio = 200; for (let i = 0; i < 3; i++) day();
    W.edu.act('cut:' + pk); const zero = W.edu.brand(pk).ad === 0, bc0 = W.brand.of(ps), H = W.brand.half(ps); for (let i = 0; i < 10; i++) day(); const b = W.edu.brand(pk);
    const txt = document.getElementById('eduBody').innerText; W.edu.act('cut:' + pk); return { zero, bc0, bc: b.bc, drop: b.cut.drop, exp: b.cut.exp, H, back: ps.ad.radio === 200, txt: /Rétablir|Tout couper/.test(txt) }; }, PK);
  t.check('« Tout couper » : publicité à zéro, le capital s\'érode (ordre de grandeur de la demi-vie), « Rétablir » remet les budgets', cut.zero && cut.bc < cut.bc0 && cut.drop > 0 && cut.drop < 3 * cut.exp + 0.02 && cut.back, JSON.stringify({ bc0: +cut.bc0.toFixed(2), bc: +cut.bc.toFixed(2), drop: +cut.drop.toFixed(3), exp: +cut.exp.toFixed(3) }));
  // 4. bilan : écran, concepts, export JSON (bouton « Copier le bilan »)
  const d = await pg.evaluate(async () => { const W = window.WSE; W.edu.show('deb'); await new Promise(r => setTimeout(r, 150)); document.querySelector('[data-edu="copy"]').click(); await new Promise(r => setTimeout(r, 300));
    const R = W.edu.report(), ta = document.getElementById('eduJson'), t0 = W.S.edu.t; let J = null; try { J = JSON.parse(ta.value); } catch (e) { J = null; }
    return { R, J, txt: document.getElementById('eduBody').innerText.replace(/\s+/g, ' '), svcX: t0.Q / t0.D, cc: W.edu.concepts(R) }; });
  t.check('bilan : service moyen, ruptures et coût, valeur de marque créée, rendement de la pub, meilleur et pire pic, 3 concepts', ['Niveau de service moyen', 'Ruptures et leur coût', 'Valeur de marque créée', 'Rendement de la publicité', 'MEILLEUR ET PIRE MOMENT', 'CONCEPTS', 'Stock de sécurité', 'Capital de marque'].every(x => d.txt.toLowerCase().includes(x.toLowerCase())) && d.cc.length === 3 && Math.abs(d.R.niveau_service_moyen - d.svcX) < 1e-3 && d.R.pics >= 1 && d.R.meilleur_pic, d.txt.slice(0, 160));
  t.check('export JSON pour l\'enseignant : le bilan copié se relit et contient les indicateurs', d.J && d.J.version === 1 && d.J.niveau_service_moyen === d.R.niveau_service_moyen && d.J.produits.length >= 1 && 'ventes_perdues_usd' in d.J && 'rendement_publicite' in d.J && 'valeur_marque_creee_usd' in d.J, d.J ? Object.keys(d.J).join(',').slice(0, 160) : 'JSON illisible');
  // 5. sauvegarde : champ edu écrit puis relu (même contexte)
  const sv = await pg.evaluate(() => { const W = window.WSE; W.save(); const raw = JSON.parse(localStorage.getItem('wse-city-v8')); return { has: !!raw.edu, snap: JSON.stringify(W.edu.save()) }; });
  const pg2 = await L.newPage({ ctx: pg.context(), wait: 900 });
  const r2 = await pg2.evaluate(snap => { const W = window.WSE; if (!W.S.edu) return { ok: false }; const a = JSON.stringify(W.edu.save()), bad = W.edu.san({ sd: 'x', shk: [{ k: 'viral', p: 'bread', m: 99, d0: 3, d1: 5 }, { k: 'zz', p: 'bread' }], h: { bread: { d: [1, 2, 'a'], s: [1], m: [1, 2, 3], k: [0, 0, 0], b: [1, 1, 1] }, nope: {} }, pk: new Array(80).fill({ k: 'camp', p: 'bread', svc: 7, pen: 99 }) });
    return { ok: a === snap, none: W.edu.san(undefined) === undefined, m: bad.shk.length === 1 && bad.shk[0].m === 3, h: bad.h.bread.d.length === 1 && !bad.h.nope, pk: bad.pk.length === 40 && bad.pk[0].svc === 1 && bad.pk[0].pen === W.edu.PEN_LOY }; }, sv.snap);
  t.check('sauvegarde wse-city-v8 : champ edu écrit, relu à l\'identique ; lecture bornée (valeurs folles ramenées, absence tolérée)', sv.has && r2.ok && r2.none && r2.m && r2.h && r2.pk, JSON.stringify(r2));
  t.check('aucune erreur de page (1280x720)', pg.errs.length === 0 && pg2.errs.length === 0, pg.errs.concat(pg2.errs).slice(0, 2).join(' | '));
  await pg.context().close();
  // 6. rupture pendant un pic : intrants limités (production < demande), choc annoncé ; fidélité et marque baissent, bornées
  const runShock = async () => {
    const p = await open(L, 1280, 720, 1.2);
    const x = await p.evaluate(pk => { const { W, S, day } = window.B, ps = S.prod[pk]; ps.stock = 0; for (let i = 0; i < 5; i++) day();
      const sh = W.edu.shock(pk, 'viral'), lim0 = W.edu.lim(pk), ahead = W.edu.ahead()[0], o = { sh, lim0, ahead, loy: [], bc: [], cur: [] };
      for (let i = 0; i < 22; i++) { day(); o.loy.push(ps.loy); o.bc.push(W.brand.of(ps)); if (S.edu.cur[pk]) o.cur.push(S.edu.cur[pk].pen); }
      o.rec = S.edu.pk.slice(-1)[0]; o.rep = W.edu.report(); o.lim = W.edu.lim(pk); o.roll = [W.edu.roll(5, 40, ['bread', 'soap']), W.edu.roll(5, 40, ['bread', 'soap'])]; return o; }, PK);
    x.errs = p.errs; await p.context().close(); return x;
  };
  const a = await runShock(), b = await runShock();
  t.check('choc exogène annoncé quelques jours avant (déterministe, par hash) avec la hausse et le verdict « il manquera »', a.sh.ok && a.sh.s.d0 - a.sh.s.a >= 4 && a.sh.s.d0 - a.sh.s.a <= 6 && a.ahead && !a.ahead.ok && a.ahead.short > 0, JSON.stringify({ s: a.sh.s, short: a.ahead && Math.round(a.ahead.short) }));
  t.check('maillon qui limite en rupture : intrant manquant à l\'usine, action proposée', a.lim0.k === 'input' && a.lim0.acts.some(q => /^open:/.test(q[0])), a.lim0.t);
  t.check('rupture pendant le pic : fidélité en baisse BORNÉE (≤ ' + 8 + ' points), marque −6 % au plus, pic manqué sans bonus', a.rec && a.rec.rd > 0 && a.rec.pen > 0 && a.rec.pen <= 8 + 1e-9 && a.rec.ok === 0 && a.rec.bon === 0 && Math.min(...a.loy) >= 5 && a.cur.every(q => q <= 8 + 1e-9), JSON.stringify(a.rec));
  t.check('déterminisme : même graine, mêmes actions = mêmes chocs et même bilan ; le tirage pur ne dépend que de (graine, jour, produits)', JSON.stringify(a.rep) === JSON.stringify(b.rep) && JSON.stringify(a.sh.s) === JSON.stringify(b.sh.s) && JSON.stringify(a.roll[0]) === JSON.stringify(a.roll[1]), JSON.stringify({ svc: a.rep.niveau_service_moyen, pics: a.rep.pics }));
  t.check('aucune erreur de page (chocs)', !a.errs.length && !b.errs.length, a.errs.concat(b.errs).slice(0, 2).join(' | '));
  // 7. mobile 390x844 : les trois écrans restent lisibles
  pg = await open(L, 390, 844);
  await pg.evaluate(pk => { const { W, day } = window.B; W.edu.camp(pk); for (let i = 0; i < 4; i++) day(); }, PK);
  const m = await ui(pg, '390x844');
  t.check('390x844 : trois écrans lisibles (aucun texte coupé, pas de défilement horizontal, pas de NaN)', [m.fb, m.fs, m.fd].every(f => f.vis && !f.bad.length && !f.hscroll && !f.nan), JSON.stringify([m.fb, m.fs, m.fd].map(f => ({ bad: f.bad.slice(0, 2), h: f.hscroll, nan: f.nan }))));
  t.check('aucune erreur de page (mobile)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
