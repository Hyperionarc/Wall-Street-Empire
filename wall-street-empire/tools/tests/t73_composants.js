// Passe 73 : puces électroniques (CPU, DRAM, GPU), nœuds de gravure, bulle de l'IA.
// A. recettes : silice → silicium → puces (silicium + câbles + plastique, sans or ni wafer, usine de niveau 3) ; produits électroniques, électroménager et véhicules en consomment ;
//    moteur électrique inchangé. B. économie isolée : fonderies de puces rentables (EBITDA 22-35 %), smartphone et portable cohérents (≈ 21-27 %).
// C. campus : renouvellement des GPU (stock du joueur d'abord), capacité réduite sans GPU mais jamais d'arrêt. D. bulle : phases enchaînées, prix du GPU, électricité, déterminisme.
// E. nœuds (passe 73 bis) : aucune avance au calendrier, R&D seule (joueur et IA selon leur budget), brevet au premier, licence, accélération payante,
//    érosion des anciennes générations quand une plus récente existe (plancher des puces matures), déterminisme. F. pénurie de puces matures pour les voitures.
// G. sauvegarde : champs facultatifs relus, ancienne sauvegarde chargée sans erreur.
const fs = require('fs'), path = require('path');
exports.name = 'Puces, nœuds de gravure et bulle de l\'IA (passe 73)';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 800 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);
  // A. recettes
  const A = await pg.evaluate(() => {
    const W = window.WSE, R = W.RECIPES, P = W.PRODUCTS, o = { bad: [] };
    ['cpu', 'dram', 'gpu'].forEach(g => { const r = R[g]; if (!W.GOODS[g] || !r || r.lvl !== 3) o.bad.push(g + ' absent');
      else { const ks = Object.keys(r.in).sort().join(','); if (ks !== 'plastic,silicon,wire') o.bad.push(g + ' : ' + ks); if (!(r.in.silicon > r.in.wire && r.in.silicon > r.in.plastic)) o.bad.push(g + ' : peu de silicium'); } });
    o.silicon = Object.keys(R.silicon.in).sort().join(',');
    const need = { phone: ['cpu', 'dram'], laptop: ['cpu', 'dram', 'gpu'], desktop: ['cpu', 'dram', 'gpu'], tablet: ['cpu', 'dram'], console: ['cpu', 'dram', 'gpu'], tv: ['cpu'], smartwatch: ['cpu'], camera: ['cpu'], car: ['cpu', 'dram'], car_alu: ['cpu', 'dram'], scooter: ['cpu', 'dram'], ebike: ['cpu', 'dram'] };
    Object.keys(need).forEach(k => need[k].forEach(g => { if (!(P[k].in[g] > 0)) o.bad.push(k + ' sans ' + g); }));
    o.motor = Object.keys(R.motor.in).sort().join(',');
    o.base = { cpu: W.GOODS.cpu.base, dram: W.GOODS.dram.base, gpu: W.GOODS.gpu.base, silicon: W.GOODS.silicon.base };
    o.spec = ['cpu', 'dram', 'gpu'].every(g => W.LOCAL_D[g] > 0);
    o.early = Object.keys(P).filter(k => (P[k].tier || 0) === 0 && ['cpu', 'dram', 'gpu'].some(g => P[k].in[g] > 0));   // début de partie : aucun produit de départ n'en a besoin
    return o; });
  t.check('recettes cpu, dram, gpu : niveau 3, silicium + câbles de cuivre + plastique (ni or ni wafer)', A.bad.length === 0, A.bad.slice(0, 5).join(', '));
  t.check('silicium inchangé (silice + charbon) et moteur électrique inchangé (acier + câbles + aimants)', A.silicon === 'coal,silica' && A.motor === 'magnet,steel,wire', A.silicon + ' / ' + A.motor);
  t.check('prix de base calibrés : silicium < DRAM < CPU < GPU', A.base.silicon < A.base.dram && A.base.dram < A.base.cpu && A.base.cpu < A.base.gpu, JSON.stringify(A.base));
  t.check('marché local des puces (demande) et début de partie sans puces', A.spec && A.early.length === 0, A.early.join(','));

  // B. économie isolée (prix de base) : fonderies et produits
  const iso = await L.pool(['cpu', 'dram', 'gpu', 'phone', 'laptop'], 2, k => L.isoFactory(k));
  const by = Object.fromEntries(iso.map(a => [a.key, a]));
  ['cpu', 'dram', 'gpu'].forEach(k => t.range(`fonderie ${k} seule : EBITDA concurrentiel (22-35 %)`, by[k].eb * 100, 20, 36, ' %'));
  ['phone', 'laptop'].forEach(k => t.range(`${k} : EBITDA d'assemblage cohérent avec les puces (≈ 21-27 %)`, by[k].eb * 100, 17, 30, ' %'));
  t.check('économie isolée : 0 pageerror', iso.every(a => a.errs.length === 0), iso.flatMap(a => a.errs).slice(0, 2).join(';'));

  // C. campus : GPU consommés (stock du joueur), renouvellement suspendu = capacité réduite sans arrêt
  const C = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T; S.noEv = true; const dc = T.inP('dc'); T.inP('nuclear'); T.inP('nuclear'); if (!dc) return null;
    S.stock.gpu = 6000; const s0 = S.stock.gpu, c0 = S.cash; T.stepN(20, true); const used = s0 - S.stock.gpu, o = { used, gf: dc.gf, rev: dc.pRev, need: W.dc.need(dc) };
    S.stock.gpu = 0; dc.gpb = 0; T.stepN(120, true); o.gf2 = dc.gf; o.k2 = W.aib.dcK(dc); o.rev2 = dc.pRev; o.card = W.dc.card(dc); o.bad = T.scan();
    dc.gpb = 1; const cash0 = S.cash; T.stepN(5, true); o.buy = dc._gc; o.gf3 = dc.gf; dc.gn = 3; o.need3 = W.dc.need(dc); dc.gn = 0;
    return o; });
  t.check('campus : renouvelle sa flotte avec les GPU du joueur (stock consommé, flotte complète)', C && C.used > 100 && C.gf > 0.999, C ? `${Math.round(C.used)} GPU en 20 j` : 'pas de campus');
  t.check('campus sans GPU livrés : capacité réduite (75-100 %), jamais arrêté', C && C.gf2 < C.gf && C.k2 >= 0.75 && C.k2 < 1 && C.rev2 > 0, C ? `flotte ${(C.gf2 * 100).toFixed(1)} %, capacité ×${C.k2.toFixed(3)}` : '');
  t.check('campus : sans stock, il achète ses GPU au fondeur (investissement) ; génération récente = moins d\'électricité', C && C.buy > 0 && C.gf3 > C.gf2 && C.need3 < 0.8 * C.need, C ? `achat ${Math.round(C.buy)} $/j · besoin ${Math.round(C.need)} → ${Math.round(C.need3)} MWh/j` : '');
  t.check('fiche du campus : GPU, marché de l\'IA et indice (sans NaN)', C && /GPU du campus/.test(C.card) && /Indice IA|indice IA/.test(C.card) && !/NaN|undefined/.test(C.card) && C.bad.length === 0, C ? C.bad.slice(0, 3).join(',') : '');

  // D. bulle de l'IA : phases, prix, électricité, déterminisme
  const D = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, o = { seq: [], gpu: [], el: [], dmax: 0 }; const keep = S.aib;
    S.aib = { t0: 600, sd: 4242, n: 0, ls: '' }; let last = -1, peak = 0, low = 9, prev = null, elPeak = 0, ph3 = null;
    for (let d = 0; d < 4500; d++) { const a = W.aib.at(d); if (a.ph !== last) { o.seq.push([a.ph, d]); last = a.ph; }
      const m = 1 + 0.6 * a.h - 0.3 * a.b, e = 1 + 0.35 * a.h + 0.06 * a.s; if (prev != null) o.dmax = Math.max(o.dmax, Math.abs(m / prev - 1)); prev = m;
      if (m > peak) peak = m; if (a.ph === 3 && m < low) low = m; if (e > elPeak) elPeak = e; if (a.ph === 4 && ph3 == null) ph3 = e; }
    o.peak = peak; o.low = low; o.elPeak = elPeak; o.elAfter = ph3;
    const a1 = JSON.stringify([1000, 1700, 2100, 2600].map(d => W.aib.at(d))), a2 = JSON.stringify([1000, 1700, 2100, 2600].map(d => W.aib.at(d))); o.det = a1 === a2;
    S.aib = keep; return o; });
  const ph = D.seq.map(x => x[0]).join('');
  t.check('bulle : phases enchaînées CALME → HYPE → SOMMET → ÉCLATEMENT → CONSOLIDATION → CALME', /^012340/.test(ph), ph + ' ' + JSON.stringify(D.seq.slice(0, 7)));
  { const d1 = D.seq.find(x => x[0] === 1)[1], d0 = D.seq.find((x, i) => i > 1 && x[0] === 0)[1]; t.range('bulle : durée du cycle (années de jeu)', (d0 - d1) / 360, 4, 7, ' ans'); }
  t.range('GPU : chute du pic au creux de l\'éclatement (−40 à −60 %)', (1 - D.low / D.peak) * 100, 40, 60, ' %');
  t.check('GPU : variation journalière bornée (< 1,5 %/j avant l\'amortisseur du marché)', D.dmax < 0.015, (D.dmax * 100).toFixed(2) + ' %');
  t.check('électricité : flambe pendant la ruée, se détend après, reste au-dessus de la normale (gagnant structurel)', D.elPeak > 1.3 && D.elAfter < D.elPeak && D.elAfter > 1.02, `pic ×${D.elPeak.toFixed(2)}, après ×${(D.elAfter || 0).toFixed(2)}`);
  t.check('bulle : déterministe (même graine, même cycle)', D.det, '');

  // E. nœuds de gravure (passe 73 bis) : la technologie n'avance QUE par la R&D (aucune horloge) ; brevet au premier, licence pour les autres
  const E = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, o = {}, keepC = S.chip, keepN = S._chipN, keepR = S.rivals, keepCash = S.cash;
    const rdc = T.inP('rd'); o.rd = !!rdc;
    // E1. personne ne dépense (budget 0, centres non affectés, aucune IA fondeuse ou innovatrice) : la pointe ne bouge pas pendant 9 ans de jeu
    S.chip = { fp: 0, my: {} }; S.rivals = keepR.filter(r => r.caste !== 'industriel' && r.caste !== 'innovateur'); const d0 = S.day;
    T.stepN(1080, true); o.zero = { days: S.day - d0, fp: S.chip.fp, front: W.chip.front(), x: S.chip.x.me || 0, pt: Object.keys(S.chip.pt).length, rd: S.rdPower || 0 };
    S.rivals = keepR;
    // E2. forte dépense du joueur (1 M$/j) : il passe en premier, prend le brevet, la nouvelle est publiée
    S.chip = { fp: 0, my: {} }; S.cash = 5e10; S._sayBuf = []; W.chip.act('chipbud:4'); o.need1 = W.chip.need('me', 1); const d1 = S.day; let dReach = null;
    for (let i = 0; i < 60 && dReach == null; i++) { T.stepN(1, true); if (W.chip.front() >= 1) dReach = S.day - d1; }
    o.spend = { dReach, fp: S.chip.fp, h: S.chip.pt[1] && S.chip.pt[1].h, max: W.chip.max(), news: (S._sayBuf || []).join(' | ') };
    // accélération payante : un jour accéléré = un jour de dépense ajouté à l'avancement du nœud suivant
    const L = W.rd.list(), it = L.find(x => x.k === 'n:chip'), x0 = S.chip.x.me || 0, acc = it ? W.rd.accelerate('n:chip', 5, 'cash') : null;
    o.acc = { listed: !!it, ok: acc && acc.ok, d: acc && acc.d, dx: (S.chip.x.me || 0) - x0, rate: it ? it.rate : 0 };
    W.chip.act('chipbud:0'); o.budOff = W.chip.rate().tot;
    // prime de monopole tant que personne d'autre ne grave à ce nœud ; une licence accordée y met fin
    S._chipN = { gpu: 1 }; S.chip.my.gpu = 1; o.lead = W.chip.nodeM('gpu');
    const rv = keepR.find(r => r.caste === 'innovateur' && !r.sub) || keepR.find(r => !r.sub); S.chip.of = { n: 1, who: rv.id, name: rv.name, fee: 1e6, rate: 0.05, exp: S.day + 30 };
    o.ofOk = W.chip.answer(true); o.afterLic = W.chip.nodeM('gpu'); o.rvAcc = W.chip.acc(rv.id, 1);
    // E3. brevet d'un rival au nœud suivant : sans licence, pas de mise à niveau ; avec licence, accès ; obsolescence quand une génération plus récente existe réellement
    const d = S.day; S.chip = { fp: 2, my: { gpu: 1, cpu: 0 }, pub: 0, k: { me: 1, [rv.id]: 2 }, x: {}, fd: { 1: d - 900, 2: d - 10 }, pt: { 2: { h: rv.id, hn: rv.name, s: d - 10, u: d + 590, l: [] } } }; S._chipN = { gpu: 1, cpu: 1 };
    o.m0 = W.chip.nodeM('gpu'); S.chip.fd[2] = d - 400; o.m1 = W.chip.nodeM('gpu'); o.mOld = W.chip.nodeM('cpu'); S.chip.fd[2] = d - 10;
    o.maxNoLic = W.chip.max(); o.upNoLic = W.chip.up('gpu'); const cash0 = S.cash, rc0 = rv.cash; o.lic = W.chip.licBuy(2); o.licPaid = cash0 - S.cash; o.rvGot = rv.cash - rc0;
    o.maxLic = W.chip.max(); o.upLic = W.chip.up('gpu'); o.myLic = S.chip.my.gpu; o.atFront = W.chip.nodeM('gpu');
    o.card = W.chip.rdHTML('act'); S._chipN = {}; o.none = W.chip.nodeM('gpu');
    // E4. IA : elles avancent selon leur budget réel (part de leur valeur, payée sur leur trésorerie) ; sans budget, rien
    S.chip = { fp: 0, my: {} }; const ri = keepR.filter(r => !r.sub && (r.caste === 'industriel' || r.caste === 'innovateur')), cs = ri.map(r => r.cash), as0 = ri.map(r => r.as || 0);
    ri.forEach(r => { r.cash = 3e9; }); const da = S.day; S.day = Math.ceil((S.day - 11) / 30) * 30 + 11; W.chip.rdStep(); o.riv = { n: ri.length, k: ri.map(r => W.chip.kn(r.id)), fp: S.chip.fp, h: S.chip.pt[1] && S.chip.pt[1].h, spent: ri.map((r, i) => Math.round((3e9 - r.cash) / 1e6)) };
    // déterminisme : même état, même résultat
    const snap = JSON.stringify(S.chip); S.chip = { fp: 0, my: {} }; ri.forEach((r, i) => { r.cash = 3e9; r.as = as0[i]; }); W.chip.rdStep(); o.det = JSON.stringify(S.chip) === snap;
    S.chip = { fp: 0, my: {} }; ri.forEach(r => { r.cash = 1e5; }); W.chip.rdStep(); o.poor = S.chip.fp; S.day = da;
    ri.forEach((r, i) => { r.cash = cs[i]; r.as = as0[i]; });
    S.chip = keepC; S._chipN = keepN; S.cash = keepCash; return o; });
  t.check('nœuds : à zéro dépense de R&D, la pointe reste fixe pendant 9 ans de jeu (aucune avance au calendrier)', E.zero.front === 0 && E.zero.fp === 0 && E.zero.x === 0 && E.zero.pt === 0 && E.zero.days >= 1000, JSON.stringify(E.zero));
  t.check('nœuds : forte dépense (1 M$/j) : le joueur grave le premier en 7 nm et en prend le brevet ; actualité « grave désormais en 7 nm »', E.spend.dReach != null && E.spend.dReach <= Math.ceil(E.need1 / 1e6) + 2 && E.spend.h === 'me' && E.spend.max === 1 && /grave désormais en 7 nm/.test(E.spend.news), JSON.stringify(E.spend) + ' besoin ' + Math.round(E.need1 / 1e6) + ' M$');
  t.check('nœuds : l\'accélération payante s\'applique au nœud suivant (chaque jour accéléré = un jour de dépense ajouté) ; budget à 0 = plus de dépense', E.acc.listed && E.acc.ok && E.acc.d > 0 && Math.abs(E.acc.dx - E.acc.d * E.acc.rate) < 1 && E.budOff === 0, JSON.stringify(E.acc));
  t.check('nœuds : seul à graver au nœud de pointe = prime de monopole ; licence accordée = fin de la prime, le licencié a accès', E.lead > 1.2 && E.ofOk && E.afterLic === 1 && E.rvAcc, `×${E.lead} → ×${E.afterLic}`);
  t.check('nœuds : génération plus récente qui vient de sortir = érosion naissante ; diffusée = prix érodé ; vieilles puces = puces matures (plancher ×0,5)', E.m0 < 1 && E.m0 > 0.95 && E.m1 < 0.8 && E.m1 > 0.6 && E.mOld >= 0.5 && E.mOld <= E.m1, `×${E.m0.toFixed(3)} → ×${E.m1.toFixed(2)} · ancien ×${E.mOld.toFixed(2)}`);
  t.check('nœuds : brevet d\'un rival = pas de mise à niveau sans licence ; licence achetée (payée au rival) = accès et mise à niveau', E.maxNoLic === 1 && E.upNoLic === false && E.lic.ok && E.licPaid > 0 && Math.abs(E.rvGot - E.lic.fee) < 1 && E.maxLic === 2 && E.upLic === true && E.myLic === 2 && E.atFront === 1, JSON.stringify({ a: E.maxNoLic, b: E.upNoLic, l: E.lic, m: E.maxLic, u: E.upLic }));
  t.check('fiche : « Nœud de pointe atteint par X (brevet) », « R&D requise », avancement (sans NaN)', /Nœud de pointe/.test(E.card) && /atteint par/.test(E.card) && /brevet/.test(E.card) && /R&amp;D requise|R&D requise/.test(E.card) && /avancement/.test(E.card) && !/NaN|undefined|Infinity/.test(E.card) && E.none === 1, E.card.replace(/<[^>]+>/g, '').slice(0, 220));
  t.check('IA : avancent selon leur budget réel de R&D (riches : nouveau nœud et brevet ; pauvres : rien) ; déterministe', E.riv.n > 0 && E.riv.fp >= 1 && E.riv.h != null && E.riv.h !== 'me' && E.poor === 0 && E.det, JSON.stringify(E.riv) + ' pauvres ' + E.poor);

  // F. pénurie de puces matures : voitures pendant la ruée
  const F = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, keep = S.aib, keepN = S._chipN; S.aib = { t0: S.day - 700, sd: 4242, n: 0, ls: '1bc' }; S._aib = null; S._chipN = {};
    const a = W.aib.now(), o = { h: a.h, car: W.chip.slow('car'), phone: W.chip.slow('phone'), chipM: W.aib.chipM() };
    S._chipN = { cpu: 1, dram: 1 }; o.carOwn = W.chip.slow('car'); S.aib = keep; S._aib = null; S._chipN = keepN; return o; });
  t.check('pénurie de puces matures (ruée sur l\'IA) : voitures ralenties et puces plus chères ; ta propre fonderie t\'en protège', F.h > 0.5 && F.car < 0.9 && F.chipM > 1.1 && F.carOwn === 1 && F.phone === 1, JSON.stringify(F));

  // G. sauvegarde : aller-retour et ancienne sauvegarde
  const G = await pg.evaluate(() => { const W = window.WSE, S = W.S; S.chip = { fp: 2, my: { gpu: 2 }, pub: 1, k: { me: 2 }, x: { me: 1234567 }, fd: { 2: S.day - 10 }, pt: { 2: { h: 'me', hn: 'Ta société', s: S.day - 10, u: S.day + 500, l: [{ id: 'r6', name: 'Novatek', rate: 0.05, fee: 1e6, paid: 10 }] } }, bud: 2e5, rc: 1 }; S.aib = { t0: 900, sd: 77, n: 0, ls: '1' }; let dc = null; S.grid.forEach(c => { if (c && c.t === 'dc') dc = c; }); if (dc) { dc.gf = 0.8; dc.gn = 1.5; dc.gpb = 0; } W.save(); return { has: !!dc }; });
  await pg.reload(); await pg.waitForTimeout(900);
  const G2 = await pg.evaluate(() => { const W = window.WSE, S = W.S; let dc = null; S.grid.forEach(c => { if (c && c.t === 'dc') dc = c; }); return { chip: S.chip, aib: S.aib, gf: dc && dc.gf, gn: dc && dc.gn, gpb: dc && dc.gpb }; });
  t.check('sauvegarde : nœuds, cycle de l\'IA et GPU du campus relus', G2.chip && G2.chip.fp === 2 && G2.chip.pub === 1 && G2.chip.my.gpu === 2 && G2.chip.k.me === 2 && G2.chip.x.me >= 1234567 && G2.chip.pt[2] && G2.chip.pt[2].h === 'me' && G2.chip.pt[2].l.length === 1 && G2.chip.bud === 2e5 && G2.chip.rc === 1 && G2.aib && G2.aib.t0 === 900 && G2.aib.sd === 77 && (!G.has || (Math.abs(G2.gf - 0.8) < 1e-3 && Math.abs(G2.gn - 1.5) < 1e-3 && G2.gpb === 0)), JSON.stringify(G2));
  { const O = await pg.evaluate(() => { const W = window.WSE, S = W.S, keep = S.chip; const o = W.chip.san({ fp: 2.3, my: { gpu: 2 } }); S.chip = o; const r = { pub: o.pub, fp: o.fp, max: W.chip.max(), pt: Object.keys(o.pt).length }; S.chip = keep; return r; });
    t.check('ancienne sauvegarde (pointe fractionnaire au calendrier) : générations déjà sorties publiques, aucun brevet', O.pub === 2 && O.fp === 2 && O.max === 2 && O.pt === 0, JSON.stringify(O)); }
  { const save = fs.readFileSync(path.join(__dirname, 'fixtures', 'save_v8_avant_passe33.json'), 'utf8');
    const b = await L.browser(), ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('wse_fx')) { localStorage.setItem('wse-city-v8', s); sessionStorage.setItem('wse_fx', '1'); } } catch (e) { } }, save);
    const p5 = await L.newPage({ ctx, wait: 1200 }); await L.inject(p5);
    const r = await p5.evaluate(() => { const W = window.WSE, S = W.S, T = window.T, o = { chip0: S.chip === undefined || S.chip === null, aib0: !S.aib }; T.stepN(20, true); o.bad = T.scan(); o.px = ['cpu', 'dram', 'gpu'].every(g => S.price[g] > 0); o.rank = W.chip.rank(); return o; });
    t.check('ancienne sauvegarde (sans puces) : chargée, prix des puces initialisés, aucune valeur non finie, 0 erreur', r.chip0 && r.aib0 && r.px && r.bad.length === 0 && !/NaN|undefined/.test(r.rank) && p5.errs.length === 0, r.bad.slice(0, 3).join(',') + ' ' + p5.errs.slice(0, 2).join(';'));
    await ctx.close(); }
  t.check('page : 0 erreur', pg.errs.length === 0, pg.errs.slice(0, 2).join(';'));

  // H. bot « fondeur de puces » (tools/bot_lib.js, P.chip) : fonderies seules, intrants achetés, rentables
  { const pb = await L.newPage({ wait: 800 }); await L.setup(pb, { caste: 'industriel', cash: 3e8 }); await L.inject(pb); await L.injectBot(pb);
    const H = await pb.evaluate(() => { const W = window.WSE, S = W.S, B = window.BOT; S.unlockAll = true; B.P.chip = true; B.P.maxPerTick = 0; B.P.chOrder = ['gpu', 'cpu', 'dram']; B.P.chEvery = 10;
      for (let d = 0; d < 160; d++) { B.tick(); W.step(); }
      const o = { log: B.CH.log, eb: {}, n: Object.assign({}, S._chipN), card: '' }; ['gpu', 'cpu', 'dram'].forEach(g => { o.eb[g] = W.chip.eb(g); });
      W.chip.fabs('gpu').slice(0, 1).forEach(c => { o.card = W.chip.card(c); }); o.rank = W.chip.rank(); o.bad = window.T.scan(); return o; });
    t.check('bot fondeur de puces : construit ses fonderies (GPU puis CPU)', (H.n.gpu || 0) >= 1 && (H.n.cpu || 0) >= 1, JSON.stringify(H.log));
    t.range('bot fondeur : EBITDA de la fonderie de GPU sur 30 j (marché réel, pouvoir de marché)', (H.eb.gpu == null ? NaN : H.eb.gpu) * 100, 18, 80, ' %');
    t.check('fiche de la fonderie et classement des fondeurs : nœud, pointe mondiale, part de marché (sans NaN)', /Gravure de tes usines/.test(H.card) && /pointe mondiale/.test(H.rank) && !/NaN|undefined|Infinity/.test(H.card + H.rank) && H.bad.length === 0 && pb.errs.length === 0, H.bad.slice(0, 3).join(',') + pb.errs.slice(0, 2).join(';'));
    await pb.context().close(); }
};
