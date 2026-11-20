// Passe 34 : subventions de la zone portuaire / industrielle (aides dégressives selon l'occupation) et recyclage des gravats (R&D, concasseur de la carrière de granulats (passe 79), gisements épuisés).
exports.name = 'Subventions de zone et recyclage (passe 34)';

exports.run = async (t, L) => {
  // ---------- A. SUBVENTIONS DE ZONE ----------
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);
  const A = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, Z = W.zn, o = {};
    o.occ = [Z.occ('port'), Z.occ('indus')]; o.rate = [Z.rate('port'), Z.rate('indus')];
    o.txt = Z.txt('port'); o.txtI = Z.txt('indus');
    // dégressif : on fait varier l'occupation par la présence de rivaux
    const cells = Z.cells('indus'); o.cells = cells; o.curve = [];
    [0, 0.2, 0.29, 0.4, 0.5, 0.6, 0.7, 0.8, 1].forEach(p => { S.zn.riv.indus = Math.round(p * cells); window.WSE.refreshStats(); o.curve.push([p, +Z.rate('indus').toFixed(4), +Z.levy('indus').toFixed(4)]); });
    S.zn.riv.indus = 0; W.refreshStats();
    // encombrement du port : plus d'aide
    S._portCap = 1000; S._portUse = 950; o.congested = Z.rate('port'); S._portUse = 100; o.free = Z.rate('port'); S._portCap = 0; S._portUse = 0;
    // aide à la construction : coût net d'un entrepôt en zone vide puis en zone saturée
    const T = window.T; o.build0 = Math.round(W.TYPES.wh.cost * Math.max(1, W.cpi ? W.cpi() : 1)); const c0 = S.cash; const w1 = T.put('wh', 66, 84, 54, 84); o.paid = c0 - S.cash;
    o.aidEmpty = Z.buildAid(w1.x, w1.y, W.TYPES.wh.cost); S.zn.riv.indus = Math.round(0.8 * cells); W.refreshStats(); o.rateSat = Z.rate('indus'); o.aidSat = Z.buildAid(w1.x, w1.y, W.TYPES.wh.cost);
    o.aidShare = o.aidEmpty / W.TYPES.wh.cost; o.cum = S.zn.cum;
    // fiche et multiplicateurs : entretien / salaires en zone aidée puis saturée
    o.umSat = Z.um(w1); S.zn.riv.indus = 0; W.refreshStats(); o.umEmpty = Z.um(w1); o.card = Z.card(w1); o.of = [Z.of(w1), Z.of({ t: 'res', x: 20, y: 20 })];
    return o;
  });
  t.info(`occupation au départ : port ${A.occ[0]}, industrielle ${A.occ[1]} ; ${A.cells} cases constructibles en zone industrielle`);
  t.info(A.txt);
  t.check('zone vide : aide maximale de 40 % (portuaire et industrielle)', Math.abs(A.rate[0] - 0.4) < 1e-9 && Math.abs(A.rate[1] - 0.4) < 1e-9, A.rate.join(' / '));
  t.check('annonce claire : « Zone portuaire : subventions 40 % jusqu\'à 30 % d\'occupation »', /Zone portuaire : subventions 40 % jusqu'à 30 % d'occupation/.test(A.txt) && /Zone industrielle : subventions 40 %/.test(A.txtI), A.txt);
  const cv = Object.fromEntries(A.curve.map(r => [r[0], r]));
  t.check('plein jusqu\'à 30 % d\'occupation (0, 20, 29 % : 40 %)', [0, 0.2, 0.29].every(p => Math.abs(cv[p][1] - 0.4) < 1e-9), A.curve.slice(0, 3).map(r => r[1]).join(','));
  t.check('dégressif entre 30 et 70 % : 40 % -> 30 % (40 %) -> 20 % (50 %) -> 10 % (60 %) -> 0', Math.abs(cv[0.5][1] - 0.2) < 0.01 && cv[0.4][1] > cv[0.5][1] && cv[0.5][1] > cv[0.6][1] && cv[0.6][1] > 0 && cv[0.7][1] === 0, A.curve.slice(2, 7).map(r => r[1]).join(','));
  t.check('saturation (> 70 %) : plus aucune aide ; taxe d\'encombrement au-delà de 85 %', cv[0.8][1] === 0 && cv[1][1] === 0 && cv[0.8][2] === 0 && cv[1][2] > 0.1, `aide ${cv[0.8][1]}/${cv[1][1]}, taxe ${cv[0.8][2]}/${cv[1][2]}`);
  t.check('port encombré (débit ≥ 90 % de la capacité) : fin des aides de la zone portuaire', A.congested === 0 && A.free > 0, `${A.congested} / ${A.free}`);
  t.check('aide à la construction : 40 % du capex d\'un entrepôt en zone vide, 0 en zone saturée ; la ville a payé (cumul)', Math.abs(A.aidShare - 0.4) < 0.001 && A.aidSat === 0 && A.rateSat === 0 && A.cum >= A.aidEmpty * 0.99, `aide ${Math.round(A.aidEmpty)} sur ${A.build0}, cumul ${Math.round(A.cum)}`);
  t.check('taxe locale exonérée : entretien réduit en zone aidée, plein tarif en zone saturée', A.umEmpty < 0.7 && Math.abs(A.umSat - 1) < 1e-9, `×${A.umEmpty.toFixed(2)} vs ×${A.umSat}`);
  t.check('fiche du bâtiment éligible : texte d\'aide ; aucun texte hors zone', /aide 40 %/.test(A.card) && A.of[0] === 'indus' && A.of[1] === null, A.card);

  // bandeau et surbrillance : l'outil sélectionné dans la zone affiche l'annonce
  const B = await pg.evaluate(() => { const W = window.WSE; W.setTool('port'); const b = document.getElementById('znban'), r1 = { hid: b.hidden, tx: b.textContent }; W.setTool('wh'); const r2 = { hid: b.hidden, tx: b.textContent }; W.setTool('res'); const r3 = { hid: b.hidden }; W.setTool('view'); return { r1, r2, r3 }; });
  t.check('bandeau d\'annonce visible avec l\'outil Port / Entrepôt, masqué en ville', !B.r1.hid && /Zone portuaire/.test(B.r1.tx) && !B.r2.hid && /Zone industrielle/.test(B.r2.tx) && B.r3.hid, B.r1.tx.slice(0, 80));

  // rivaux : ils s'implantent aussi, paient moins et comptent dans l'occupation
  const R = await pg.evaluate(() => { const W = window.WSE, S = W.S, Z = W.zn; S.zn.riv = { port: 0, indus: 0 }; W.refreshStats();
    const r = { caste: 'industriel', cash: 1e9, as: 0, name: 'Rival test', id: 'rt', att: {} }, o0 = Z.occ('indus'); const ok = Z.rivalSettle(r, 1e6); W.refreshStats();
    return { ok, paid: 1e9 - r.cash, as: r.as, occ: [o0, Z.occ('indus')], riv: S.zn.riv.indus }; });
  t.check('rival industriel : implantation en zone industrielle aidée à 40 % (paie 60 %) et occupation en hausse', R.ok && Math.abs(R.paid - 6e5) < 1 && R.as === 1e6 && R.occ[1] > R.occ[0] && R.riv === 6, `payé ${R.paid}, actif ${R.as}, occ ${R.occ.join('→')}`);

  // port : en équilibre dès qu'il y a un minimum de trafic, très réduit en perte à vide
  async function portNet(sat, src) {
    return pg.evaluate(({ sat, src }) => { const W = window.WSE, S = W.S, T = window.T, Z = W.zn;
      const pp = new Function('W', 'S', 'N', 'put', 'onDep', 'inP', 'inC', src); S.zn.riv = { port: 0, indus: 0 }; if (sat) S.zn.riv.port = Math.round(0.8 * Z.cells('port'));
      for (let i = 0; i < W.N * W.N; i++) { const c = S.grid[i]; if (c && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part') S.grid[i] = null; }
      pp(W, S, W.N, T.put, T.onDep, T.inP, T.inC); W.refreshStats(); T.stepN(45, true); let p = 0, n = 0;
      for (let d = 0; d < 30; d++) { T.frz(); W.step(); const b = T.bldgs().filter(c => c.t === 'port'); b.forEach(c => { p += c.profit || 0; n++; }); }
      return { net: p / Math.max(1, n), n }; }, { sat, src });
  }
  const empty = "put('port', 80, 90, 54, 84);";
  const typ = "put('port', 80, 90, 54, 84); inP('wh'); for (let i = 0; i < 2; i++) { onDep('miron', 'iron'); onDep('mcoal', 'coal'); }";
  const e1 = await portNet(false, empty), e0 = await portNet(true, empty), t1 = await portNet(false, typ), t0 = await portNet(true, typ);
  t.info(`port à vide : ${Math.round(e1.net)} $/j avec aides, ${Math.round(e0.net)} $/j sans ; départ typique : ${Math.round(t1.net)} avec, ${Math.round(t0.net)} sans`);
  t.check('port à vide (zone déserte) : la perte baisse d\'au moins 80 % grâce aux aides', e0.net < -3000 && e1.net > 0.2 * e0.net, `${Math.round(e1.net)} vs ${Math.round(e0.net)}`);
  t.check('port dans un départ typique (mines + entrepôt) : rentable', t1.n > 0 && t1.net > 0, `${Math.round(t1.net)} $/jour`);

  // budget municipal : les aides sont payées par la ville ; budget à sec = aides réduites
  const M = await pg.evaluate(() => { const W = window.WSE, S = W.S, Z = W.zn; S.zn.riv = { port: 0, indus: 0 }; W.refreshStats(); const b0 = Z.bud(); S.zn.bud = -Z.inc() * 150; const r0 = Z.rate('indus'); S.zn.bud = -Z.inc() * 75; const r1 = Z.rate('indus'); S.zn.bud = b0; return { r0, r1, bf: Z.bf() }; });
  t.check('budget municipal épuisé : aides suspendues (à sec) ou réduites de moitié (à mi-dette)', M.r0 === 0 && Math.abs(M.r1 - 0.2) < 0.01 && M.bf === 1, `${M.r0} / ${M.r1}`);

  // sauvegarde : occupation rivale, budget et annonces survivent au rechargement
  const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S; S.zn.riv = { port: 4, indus: 12 }; S.zn.bud = 123456; S.rub = { st: 777, tot: 999, done: 222, fl: 5, d: 0 }; W.save(); return localStorage.getItem('wse-city-v8') ? JSON.parse(localStorage.getItem('wse-city-v8')).zn : null; });
  t.check('sauvegarde wse-city-v8 : budget, implantations rivales et annonces enregistrés', !!sv && sv.bud === 123456 && sv.riv.indus === 12 && sv.riv.port === 4, JSON.stringify(sv));
  const pg2 = await L.newPage({ ctx: pg.context(), wait: 700 });
  const ld = await pg2.evaluate(() => { const S = window.WSE.S; return { zn: S.zn, rub: S.rub }; });
  t.check('rechargement : budget municipal, rivaux en zone et gravats restaurés', ld.zn && ld.zn.bud === 123456 && ld.zn.riv.indus === 12 && ld.rub && ld.rub.st === 777 && ld.rub.tot === 999, JSON.stringify(ld));
  await pg2.close();
  t.check('subventions : aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();

  // ---------- B. RECYCLAGE (passe 79 : le concasseur est un investissement de la carrière de granulats) ----------
  const p3 = await L.newPage({ wait: 700 }); await L.setup(p3, { cash: 5e10 }); await L.inject(p3);
  const G = await p3.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, o = {};
    o.techReq = W.TECHS.find(x => x.id === 'recycl');
    const t2 = W.TECHS.find(x => x.id === 'recycl2'); o.t2 = { c: t2.c, req: t2.req, fx: t2.fx };
    o.menu = !W.CATS.find(c => c.id === 'btp').tools.includes('crush') && !W.TYPES.crush && W.CATS.find(c => c.id === 'btp').tools.includes('qgravel');
    o.eraCost = [o.techReq.c, W.TECHS.find(x => x.id === 'wind').c, W.TECHS.find(x => x.id === 'blast2').c];
    // démolition -> gravats
    const r = T.put('res', 14, 44, 14, 44); const rub0 = W.rub.st().st, exp = W.rub.of(r); W.place(r.x, r.y, 'bull'); o.bull = { exp, got: W.rub.st().st - rub0, tot: W.rub.st().tot };
    o.npcRub = W.rub.of({ t: 'npc', k: 'res', floors: 20 }); o.houseRub = W.rub.of({ t: 'npc', k: 'house' });
    // chantier : une construction laisse des gravats
    const r1 = W.rub.st().st; T.put('f1', 66, 84, 54, 84); o.site = W.rub.st().st - r1;
    // carrière de granulats + concasseur : proportions, plafond, flux
    const cr = T.onDep('qgravel', 'gravel'); o.crush = !!cr; cr.cr = 1;
    S.rub = { st: 1e6, tot: 1e6, done: 0, fl: 0, d: 0, pl: 0 }; ['gravel', 'sand', 'cement'].forEach(g => { S.stock[g] = 0; });
    W.refreshStats(); T.frz(); W.step(); const c = W.rub.st();
    o.cap = W.cr.CAP[1] * W.fillOf(cr); o.done1 = c.done;
    o.ratio = ['gravel', 'sand', 'cement'].map(g => cr._rq[g] / Math.max(1, c.done));
    // flux limité : peu de gravats -> production recyclée plafonnée par le flux
    S.rub.st = 500; S.rub.done = 0; T.frz(); W.step();
    o.low = { done: S.rub.done, st: S.rub.st }; const tt = S.rub.tot; T.frz(); W.step(); o.low2 = { done: S.rub.done, rin: cr._rin, add: S.rub.tot - tt };
    // second concasseur : la capacité totale double mais pas la production si le flux est le même
    const cr2 = T.onDep('qgravel', 'gravel'); cr.cr = 2; cr2.cr = 2; W.refreshStats(); S.rub.st = 3000; S.rub.done = 0; T.frz(); W.step(); o.two = { done: S.rub.done, cap: W.rub.st().cap }; cr.cr = 1;
    // bilan : revenus valorisés et profit
    S.rub.st = 1e6; for (let i = 0; i < 5; i++) { T.frz(); W.step(); } o.pRev = cr.pRev; o.profit = cr.profit; o.rrev = cr._rrev;
    return o;
  });
  t.check('R&D « Recyclage et concassage » : ère 2, coût rééchelonné, prérequis explosifs, +10 % de rendement des concasseurs ; niveau 2 : +10 % encore', G.techReq && G.techReq.era === 2 && G.eraCost[0] >= 2e6 && G.eraCost[0] <= 8e6 && G.techReq.req.join() === 'blast1' && G.techReq.fx.recy === 1.1 && G.t2.fx.recy === 1.1 && G.t2.req.includes('recycl'), `${G.eraCost.join(' / ')}`);
  t.check('passe 79 : plus de centre de concassage séparé (une seule filière : carrière de granulats + concasseur)', G.menu, '');
  t.check('démolition : gravats proportionnels à la taille (étages), ajoutés au stock', G.bull.exp > 0 && G.bull.got === G.bull.exp && G.npcRub > G.houseRub, `immeuble ${G.bull.exp}, tour 20 étages ${G.npcRub}, maison ${G.houseRub}`);
  t.check('chantier : une construction laisse des gravats de chantier', G.site > 0, `${G.site}`);
  t.check('concassage : gravier 50 %, sable 30 %, ciment recyclé 8 % des gravats traités (proportions fixes)', Math.abs(G.ratio[0] - 0.5) < 0.01 && Math.abs(G.ratio[1] - 0.3) < 0.01 && Math.abs(G.ratio[2] - 0.08) < 0.005, G.ratio.map(v => v.toFixed(3)).join(' / '));
  t.check('capacité plafonnée : un gros stock de gravats est traité à la capacité du concasseur (pas plus)', G.done1 > 0 && Math.abs(G.done1 - G.cap) < 0.02 * G.cap, `traité ${Math.round(G.done1)} pour ${Math.round(G.cap)} de capacité`);
  t.check('production plafonnée par le flux : stock de 500 → 500 traités, puis seulement les gravats arrivés depuis', Math.abs(G.low.done - 500) < 1 && G.low.st <= G.low2.add + 1 && G.low2.rin <= G.low2.add + 1, `${G.low.done} traités, puis ${Math.round(G.low2.rin)} (gravats arrivés dans la journée : ${Math.round(G.low2.add)})`);
  t.check('deux concasseurs ne créent pas de matière : avec 3 000 gravats, 3 000 traités', Math.abs(G.two.done - 3000) < 1, `${Math.round(G.two.done)} (capacité ${Math.round(G.two.cap)})`);
  t.check('la carrière valorise sa production recyclée au prix du marché (profit positif)', G.pRev > 0 && G.profit > 0 && G.rrev > 0, `recettes ${Math.round(G.pRev)}/j dont recyclé ${Math.round(G.rrev)}/j, profit ${Math.round(G.profit)}/j`);

  // gisement épuisé : alerte claire + investissement concasseur / démolition remboursée
  const D = await p3.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, o = {};
    const q = T.onDep('qgravel', 'gravel'); o.q = !!q; if (!q) return o;
    const dep = S.dep[q.y * W.N + q.x]; dep.r = 5; S._sayBuf = []; T.frz(); W.step(); o.msg = (S._sayBuf || []).join(' | '); for (let i = 0; i < 2; i++) { T.frz(); W.step(); }
    o.dry = q.dry; o.lim = q.limit;
    const bn = W.rub.bottleneck(q); o.bn = { t: bn.t, acts: bn.acts.map(a => a[0]) };
    o.refund = W.rub.refund(q); o.conv = W.rub.convCost(q);
    const c0 = S.cash; S.rub.st = 50000;
    o.ok = W.rub.recycle(q); o.type = q.t; o.paid = c0 - S.cash; W.refreshStats(); for (let i = 0; i < W.cr.DAYS[0] + 2; i++) { T.frz(); W.step(); } o.lv = q.cr; o.lim2 = q.limit; o.grav = (q._rq || {}).gravel || 0;
    // démolition remboursée d'un autre site épuisé
    const q2 = T.onDep('qgravel', 'gravel'); if (q2) { S.dep[q2.y * W.N + q2.x].r = 0; T.frz(); W.step(); const c1 = S.cash, rf = W.rub.refund(q2), rub1 = W.rub.st().st; o.bref = W.rub.bullRefund(q2); o.refGot = S.cash - c1; o.rf = rf; o.gone = !S.grid[q2.y * W.N + q2.x]; o.rubGain = W.rub.st().st - rub1; }
    return o;
  });
  t.check('gisement épuisé : le site est signalé (alerte « épuisé », limite « reserve »)', D.q && D.dry === true && D.lim === 'reserve' && /épuisé/.test(D.msg), `${D.lim} · ${(D.msg || '').slice(0, 60)}`);
  t.check('fiche du site épuisé : boutons « Investir dans un concasseur » et « Démolir (remboursement) »', D.bn && D.bn.acts.includes('crinv') && D.bn.acts.includes('bullref') && /entretien/.test(D.bn.t), D.bn && D.bn.acts.join(','));
  t.check('investissement : la carrière garde son type, le concasseur entre en service après son chantier', D.ok === true && D.type === 'qgravel' && D.paid > 0 && D.lv === 1, `${D.type}, niveau ${D.lv}, ${Math.round(D.paid)} $`);
  t.check('carrière épuisée avec concasseur : produit du gravier recyclé à partir des gravats', D.grav > 0 && D.lim2 !== 'reserve', `gravier recyclé ${Math.round(D.grav)}/j, limite ${D.lim2}`);
  // démolition : les gravats viennent du joueur (sans redevance) ; la démolition du site rembourse 35 % (frais d'évacuation déduits si plus aucun concasseur)
  t.check('démolition d\'un site épuisé : 35 % de l\'investissement remboursé, gravats récupérés', D.bref === true && Math.abs(D.refGot - D.rf) < 2 && D.rf > 0 && D.gone && D.rubGain > 0, `remb. ${Math.round(D.refGot)}, gravats +${D.rubGain}`);

  // fiche des bâtiments : pas d'erreur, bloc concasseur et aide de zone
  const F = await p3.evaluate(() => { const W = window.WSE, S = W.S, T = window.T; const out = {}; S.zn.riv = { port: 0, indus: 0 }; W.refreshStats(); let cr = null, wh = null;
    for (let i = 0; i < W.N * W.N; i++) { const c = S.grid[i]; if (c && c.t === 'qgravel' && c.cr > 0 && !cr) cr = c; if (c && c.t === 'f1' && !wh) wh = c; }
    if (cr) { W.openBuilding(cr.x, cr.y); out.cr = document.getElementById('bbody').textContent; W.closeBuilding(); }
    if (wh) { W.openBuilding(wh.x, wh.y); out.wh = document.getElementById('bbody').textContent; W.closeBuilding(); }
    return out; });
  t.check('fiche de la carrière : « Concasseur de recyclage », gravats de la ville en entrée, matières recyclées en sortie', /Concasseur de recyclage/.test(F.cr || '') && /Gravats de la ville/.test(F.cr || '') && /Gravier recyclé/i.test(F.cr || ''), (F.cr || '').slice(0, 80));
  t.check('fiche d\'une usine de zone : bandeau « Subvention de zone »', /Subvention de zone/.test(F.wh || ''), (F.wh || 'aucun entrepôt').replace(/\s+/g, ' ').slice(0, 90));
  t.check('recyclage : aucune erreur de page', p3.errs.length === 0, p3.errs.slice(0, 2).join(' | '));
  await p3.context().close();

  // ---------- C. DÉTERMINISME ----------
  const SCRIPT = `(() => { const W = window.WSE, S = W.S, T = window.T; S.noEv = true; S.cash = 5e10; S.unlockAll = true;
    T.put('port', 80, 90, 54, 84); T.put('wh', 66, 84, 54, 84); { const k = T.onDep('qgravel', 'gravel', 1); if (k) k.cr = 1; } T.onDep('miron', 'iron');
    for (let i = 0; i < 4; i++) { const r = T.put('res', 14, 44, 14, 44); if (r && i % 2) W.place(r.x, r.y, 'bull'); }
    const q = T.onDep('qgravel', 'gravel'); if (q) S.dep[q.y * W.N + q.x].r = 3;
    S.zn.riv.indus = 20; W.refreshStats();
    for (let d = 0; d < 60; d++) { T.frz(); W.step(); }
    return JSON.stringify({ day: S.day, cash: Math.round(S.cash), zn: S.zn, rub: S.rub, st: [S.stock.gravel, S.stock.sand, S.stock.cement].map(Math.round), fin: S.fin }); })()`;
  async function game() { const p = await L.newPage({ wait: 600 }); await L.setup(p, { cash: 5e10 }); await L.inject(p); const s = await p.evaluate(SCRIPT); await p.context().close(); return s; }
  const [g1, g2] = await Promise.all([game(), game()]);
  t.check('déterminisme : deux parties identiques (aides, budget, gravats, stocks) donnent le même état', g1 === g2 && g1.length > 100, g1 === g2 ? `${g1.length} caractères comparés` : 'états différents');
};
