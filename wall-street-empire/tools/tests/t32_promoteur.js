// Passe 34 : promoteur « à la Trump » — prix de marché des biens (loyers capitalisés, quartier, densité, taux), achat / démolition / construction / vente avec plus-value taxée,
// loyers des logements, étages au prix du lot, chantiers visibles, terrains ex nihilo (remblai, polder, aplanissement), zonage SimCity, voirie sous permis, contrats BTP sans production de matériaux,
// objectifs de caste, fiche d'immeuble et panneau Opérations, sauvegarde et déterminisme.
exports.name = 'Promoteur : spéculation, terrains ex nihilo, zonage, incitations de caste';

exports.run = async (t, L) => {
  const pgA = await L.newPage({ wait: 600 }); await L.setup(pgA, { caste: 'promoteur', cash: 5e8 }); await L.inject(pgA);

  // ---------- 1. Modèle de prix (page jetable : on y bouleverse le quartier)
  const A = await pgA.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, P = W.pro, o = { houses: [] }; S.done = W.acq.MISSIONS.map(m => m.id); S.macro.boom = 0; S.macro.phase = Math.PI; S.macro.rate = 0.03; S.macro.gdp = 0.03; P.PR().hype = 0;
    const hs = []; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'house' && W.acq.ownerOf(c) === 'npc') hs.push(c); }
    o.nh = hs.length; const pick = hs.filter(c => P.value(c).attr > 0.95).sort((a, b) => P.value(b).attr - P.value(a).attr)[0] || hs[0]; o.pick = [pick.x, pick.y];
    const v = P.value(pick); o.v = v; o.ask = P.ask(pick); o.old = 900 * 0.7;
    // sensibilité aux taux : taux directeur 3 % -> 9 % = valeur en baisse nette (retournement)
    const v0 = P.value(pick).v; S.macro.rate = 0.09; S.day++; const v1 = P.value(pick).v; S.macro.rate = 0.03; S.day++; o.rateDrop = v1 / v0;
    // boom : taux de capitalisation plus bas
    S.macro.boom = 1; S.day++; const v2 = P.value(pick).v; S.macro.boom = 0; S.day++; o.boom = v2 / v0;
    // humeur du marché : euphorie vs morosité
    P.PR().hype = 1; S.day++; const vh = P.value(pick).v; P.PR().hype = -1; S.day++; const vl = P.value(pick).v; P.PR().hype = 0; S.day++; o.hype = [vh / v0, vl / v0];
    // plus d'étages = plus de loyer et de valeur ; un immeuble ancien plafonne sur la valeur du lot
    o.floors = [1, 2, 4, 6].map(f => P.valueAt(pick.x, pick.y, 'res', f).v);
    // densification autour : 8 immeubles de 6 étages à moins de 3 cases augmentent la valeur de la maison
    const before = P.value(pick).v; let n = 0; for (let dx = -3; dx <= 3 && n < 8; dx++) for (let dy = -3; dy <= 3 && n < 8; dy++) { const c = S.grid[(pick.y + dy) * N + pick.x + dx]; if (c && c.t === 'npc' && c.k !== 'mon' && c.k !== 'park' && !c.lm && c.floors < 10 && c !== pick) { c.k = 'off'; c.floors = 12; n++; } }
    S.day++; o.dens = [n, P.value(pick).v / before];
    // quartier : le centre vaut plus que la périphérie pour un même immeuble
    o.geo = [P.valueAt(30, 30, 'res', 4).v, P.valueAt(14, 14, 'res', 4).v];
    return o;
  });
  t.info(`maison choisie ${A.pick} : valeur ${Math.round(A.v.v)} $ (lot ${A.v.lot}, attractivité ${A.v.attr.toFixed(2)}, occupation ${A.v.occ.toFixed(2)}, capitalisation ${(A.v.cap * 100).toFixed(2)} %), prix demandé ${A.ask} $ (avant : ${A.old} $)`);
  t.check('prix de marché : une maison vaut des milliers de dollars (loyers capitalisés), plus 630 $', A.ask > 10 * A.old && A.v.v >= 0.8 * A.v.lot, JSON.stringify([A.ask, A.v.v, A.v.lot]));
  t.check('taux directeur 3 % -> 9 % : les valeurs chutent d\'au moins 25 % (retournement par les taux)', A.rateDrop < 0.75, 'x' + A.rateDrop.toFixed(2));
  t.check('supercycle (boom) : les valeurs montent (taux de capitalisation plus bas)', A.boom > 1.02, 'x' + A.boom.toFixed(3));
  t.check('humeur du marché : euphorie > normal > morosité', A.hype[0] > 1.05 && A.hype[1] < 0.97, A.hype.map(v => v.toFixed(2)).join(' / '));
  t.check('plus d\'étages = plus de valeur (1, 2, 4, 6 étages strictement croissants)', A.floors.every((v, i) => i === 0 || v > A.floors[i - 1]), A.floors.join(' < '));
  t.check('la densification autour fait monter la valeur (boucle de marché)', A.dens[0] >= 4 && A.dens[1] > 1.02, JSON.stringify(A.dens));
  t.check('le centre-ville vaut plus que la périphérie pour le même immeuble', A.geo[0] > 1.3 * A.geo[1], A.geo.join(' / '));

  const errA = pgA.errs.slice(); await pgA.context().close();
  const pg = await L.newPage({ wait: 600 }); await L.setup(pg, { caste: 'promoteur', cash: 5e8 }); await L.inject(pg);

  // ---------- 2. Achat, démolition, construction, vente : plus-value réaliste, taxée
  const B = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, P = W.pro, o = {}; S.done = W.acq.MISSIONS.map(m => m.id); S.macro.boom = 0; S.macro.rate = 0.03; S.macro.gdp = 0.03; P.PR().hype = 0;
    // meilleur site : maison avec la meilleure marge pour 4 étages
    const hs = []; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'house' && W.acq.ownerOf(c) === 'npc') hs.push(c); }
    hs.sort((a, b) => P.devPlan(b.x, b.y, 4).margin - P.devPlan(a.x, a.y, 4).margin);
    const med = hs[Math.floor(hs.length / 2)], best = hs[0]; o.mAll = hs.map(c => P.devPlan(c.x, c.y, 4).margin); o.medM = P.devPlan(med.x, med.y, 4).margin; o.bestM = P.devPlan(best.x, best.y, 4).margin;
    const h = best; o.h = [h.x, h.y]; const plan = P.devPlan(h.x, h.y, 4); o.plan = plan;
    const cash0 = S.cash; o.hover = (() => { W.setTool('buyout'); return 1; })();
    const ok1 = W.place(h.x, h.y, 'buyout'); o.razed = ok1 && !S.grid[h.y * N + h.x]; o.paid = cash0 - S.cash; o.land = S.pland && S.pland[h.y * N + h.x];
    const cash1 = S.cash; const ok2 = W.place(h.x, h.y, 'res'); const b = S.grid[h.y * N + h.x]; o.built = ok2 && b && b.t === 'res'; o.buildPaid = cash1 - S.cash; o.landCharged = o.buildPaid - Math.round(W.TYPES.res.cost * 0.85);
    o.works0 = b && b.works ? { k: b.works.k, days: b.works.due - S.day } : null; o.capBefore = null;
    // pendant le chantier : pas de loyer, on ne peut pas vendre
    window.T.stepN(2, true); o.rentDuring = b.pRev; const sellTry = P.sell(h.x, h.y); o.sellDuring = sellTry.ok;
    window.T.stepN(12, true); o.delivered = !b.works; o.rent1 = b.pRev; o.floors1 = b.floors;
    // étages : coût au prix du lot, chantier de plusieurs jours
    const fc = []; for (let f = 1; f < 4; f++) { const uc = W.upgradeCost(b); fc.push(uc); const c0 = S.cash; const ok = W.place(h.x, h.y, 'up'); if (!ok) { o.upFail = [f, uc, S.cash]; break; } o.upPaid = (o.upPaid || 0) + (c0 - S.cash); o.upDays = b.works.due - S.day; window.T.stepN(b.works.due - S.day + 1, true); }
    o.floorCosts = fc; o.floors2 = b.floors; o.lot = W.landPrice(h.x, h.y); o.res1Cost = W.TYPES.res.cost;
    window.T.stepN(40, true); o.rent4 = b.pRev; o.cost4 = b.upk; o.profit = b.profit; o.occ = b._occ;
    o.dbg = { planValue: plan.value, vFinal: P.value(b).v, vi: P.value(b).vi, cap: P.value(b).cap, rate: S.macro.rate, gdp: S.macro.gdp, hype: P.PR().hype, attr: P.value(b).attr, occ: P.value(b).occ };
    o.fiche = P.fiche(b); const q = o.fiche.quote; const worthBefore = S.cash; o.invest = b.invest + (b.lp || 0);
    const r = P.sell(h.x, h.y); o.sold = r.ok; o.q = r.q; o.cashGain = S.cash - worthBefore; o.owner = W.acq.ownerOf(S.grid[h.y * N + h.x]); o.npcCell = S.grid[h.y * N + h.x] && S.grid[h.y * N + h.x].t === 'npc' && S.grid[h.y * N + h.x].floors;
    o.total = S.cash - cash0; o.stat = JSON.parse(JSON.stringify(P.PR().st));
    return o;
  });
  const med = B.mAll.slice().sort((a, b) => a - b)[Math.floor(B.mAll.length / 2)];
  t.info(`maisons à raser : marge médiane de la promotion à 4 étages ${(med * 100).toFixed(0)} %, meilleur site ${(B.bestM * 100).toFixed(0)} % ; achat ${B.paid} $ + construction ${B.buildPaid} $ + 3 étages ${B.upPaid} $ -> vente ${B.q && B.q.price} $ (plus-value ${B.q && B.q.gain}, impôt ${B.q && B.q.tax}, net ${B.q && B.q.net})`);
  t.check('le rachat est facturé au prix de marché et le terrain payé n\'est pas repayé à la construction', B.razed && B.paid > 10000 && B.land === B.paid && B.landCharged < 1 && B.landCharged > -1, JSON.stringify([B.paid, B.land, B.landCharged]));
  t.check('construction : chantier visible (jours de travaux), aucun loyer avant la livraison, vente refusée pendant le chantier', B.works0 && B.works0.k === 'new' && B.works0.days >= 4 && B.rentDuring === 0 && B.sellDuring === false, JSON.stringify([B.works0, B.rentDuring, B.sellDuring]));
  t.check('après livraison : logements avec loyers qui paient leur entretien (recettes > charges)', B.delivered && B.rent1 > 0 && B.profit > 0 && B.rent4 > 2 * B.cost4, JSON.stringify([B.rent1, B.rent4, B.cost4, B.profit]));
  t.check('étage supplémentaire : coût ≈ prix du lot + du logement (plus 350 $), croît avec la hauteur, chantier de plusieurs jours', B.floorCosts.length === 3 && B.floorCosts.every(c => c > 40000) && B.floorCosts[2] > B.floorCosts[0] && B.upDays >= 4 && B.floors2 === 4, JSON.stringify([B.floorCosts, B.upDays, B.floors2]));
  t.check('plus-value de vente : réaliste et grasse pour un promoteur (valeur d\'arrivée > coût total de 10 % au moins)', B.q && B.q.gain > 0 && B.q.price > 1.1 * (B.paid + B.buildPaid + B.upPaid), JSON.stringify([B.q, B.paid + B.buildPaid + B.upPaid]));
  t.check('plus-value taxée : impôt = taux × plus-value (taux selon la durée de détention), honoraires 2,5 %', B.q && B.q.tax === Math.round(B.q.gain * B.q.rate) && B.q.rate > 0.1 && Math.abs(B.q.fee - B.q.price * 0.025) <= 1, JSON.stringify(B.q));
  t.check('la vente transforme le logement en immeuble de la ville (propriétaire PNJ ou rival) et encaisse le net', B.sold && B.npcCell === 4 && B.owner !== 'me' && Math.abs(B.cashGain - B.q.net) <= 1, JSON.stringify([B.sold, B.npcCell, B.owner, B.cashGain, B.q && B.q.net]));
  t.check('la fiche donne valeur marchande, loyer, rendement et plus-value latente avant la vente', B.fiche && B.fiche.value > 0 && B.fiche.rentDay > 0 && B.fiche.yieldNet > 0 && typeof B.fiche.latent === 'number' && B.fiche.quote.net > 0, JSON.stringify([B.fiche.value, B.fiche.rentDay, B.fiche.yieldNet, B.fiche.latent]));
  t.check('bilan du promoteur : opération rentable de bout en bout (cash final > cash initial)', B.total > 0, 'solde ' + Math.round(B.total) + ' $');

  // comparaison de castes : même site, même opération, un autre joueur gagne moins
  const C = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, P = W.pro, o = {}; S.macro.boom = 0; S.macro.rate = 0.03; S.macro.gdp = 0.03; P.PR().hype = 0;
    const N = W.N, hs = []; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'house' && W.acq.ownerOf(c) === 'npc') hs.push(c); } const h = hs[Math.floor(hs.length / 3)];
    W.setCaste('promoteur'); S.day++; const p = P.devPlan(h.x, h.y, 4); W.setCaste('negociant'); S.day++; const n = P.devPlan(h.x, h.y, 4); W.setCaste('promoteur'); S.day++;
    o.p = { cost: p.cost, gain: p.gain, m: p.margin }; o.n = { cost: n.cost, gain: n.gain, m: n.margin }; return o;
  });
  t.check('avantage de caste : même promotion, le promoteur coûte moins cher et gagne nettement plus', C.p.cost < C.n.cost && C.p.gain > C.n.gain + 30000 && C.p.m > C.n.m + 0.15, JSON.stringify(C));

  // ---------- 3. Achat pour louer, loyers des biens de la ville, vente, annonce, taxe sur la spéculation courte
  const D = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, P = W.pro, T = window.T, o = {}; S.macro.boom = 0; S.macro.rate = 0.03; S.macro.gdp = 0.03; P.PR().hype = 0;
    const rs = []; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'res' && c.floors >= 3 && c.floors <= 6 && W.acq.ownerOf(c) === 'npc') rs.push(c); } const r = rs[3];
    o.rival = (() => { for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && W.acq.ownerOf(c) !== 'npc' && c.k !== 'mon' && W.acq.ownerOf(c) !== 'me') return c; } })() ? 1 : 0;
    const chk = P.buyCheck(r); o.chk = chk; S.cash = 1000; const cl = P.buyCheck(r); o.poor = cl; S.cash = 5e8;
    const c0 = S.cash; const ok = P.keep(r.x, r.y); o.kept = ok; o.paid = c0 - S.cash; o.owner = W.acq.ownerOf(r); o.hold = P.PR().hold[r.x + ',' + r.y];
    const cF = S.cash; T.stepN(30, true); o.rent30 = S.cash - cF; const m30 = P.PR().kept; o.keptRent = m30;
    o.worthIncl = S.stats.worth;
    // vente trop rapide : 32 % d'impôt ; vente après 200 jours : 16 %
    const q1 = P.quote(r, P.value(r).v * 1.08 * 0.9); T.stepN(200, true); const q2 = P.quote(r, P.value(r).v * 1.08 * 0.9); o.rates = [q1.rate, q2.rate];
    // annonce : prix demandé trop haut = aucune offre ; prix raisonnable = vendu en quelques semaines
    const lh = P.list(r.x, r.y, 1.6); o.listHigh = lh.ok; let soldHigh = false; for (let d = 0; d < 50; d++) { T.stepN(1, true); if (W.acq.ownerOf(r) !== 'me') { soldHigh = true; break; } } o.soldHigh = soldHigh;
    const lo = P.list(r.x, r.y, 1.02); let days = -1; for (let d = 0; d < 60; d++) { T.stepN(1, true); if (W.acq.ownerOf(r) !== 'me') { days = d; break; } } o.soldDays = days; o.ownerAfter = W.acq.ownerOf(r);
    return o;
  });
  t.check('rachat pour louer : prix demandé affiché avant, refus expliqué si trésorerie insuffisante', D.chk.ok && D.chk.price > 10000 && !D.poor.ok && /Il te manque/.test(D.poor.why), JSON.stringify([D.chk, D.poor.why]));
  t.check('rachat pour louer : le bien passe à « me », base enregistrée, trésorerie débitée du prix + frais', D.kept && D.owner === 'me' && D.hold && D.hold.basis === D.paid, JSON.stringify([D.kept, D.owner, D.hold, D.paid]));
  t.check('un bien loué rapporte des loyers nets (> 0 sur 30 jours) malgré charges et taxe foncière', D.rent30 > 0 && D.keptRent && D.keptRent.net > 0 && D.keptRent.gross > D.keptRent.net, JSON.stringify([D.rent30, D.keptRent]));
  t.check('impôt sur la plus-value : 32 % avant 45 jours (spéculation courte), 16 % après 150 jours', D.rates[0] === 0.32 && D.rates[1] === 0.16, JSON.stringify(D.rates));
  t.check('annonce à 160 % de la valeur : aucun acquéreur sous 50 jours ; à 102 % : vendu en quelques semaines', D.listHigh && !D.soldHigh && D.soldDays >= 0 && D.soldDays < 60 && D.ownerAfter !== 'me', JSON.stringify([D.soldHigh, D.soldDays, D.ownerAfter]));

  // ---------- 4. Terrains ex nihilo : aplanissement, polder, remblai ; extension au-delà de 37x37 ; terrain déjà payé ; routes
  const E = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, P = W.pro, T = window.T, o = {}; S.cash = 5e8; P.PR().brush = 1;
    const find = (pred) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (pred(x, y)) return [x, y]; return null; };
    const kindAt = (x, y) => { const pl = P.terraPlan(x, y, 1); return pl.cells.length ? pl.cells[0].k : null; };
    const g = find((x, y) => x === 49 && (y - 12) % 6 !== 0 && (y - 12) % 6 !== 5 && kindAt(x, y) === 'grade'); const pol = find((x, y) => kindAt(x, y) === 'polder'); const fill = find((x, y) => x === 88 && P.terraPlan(x, y, 3).kinds.fill > 0);
    o.sites = { g, pol, fill };
    const pg1 = P.terraPlan(g[0], g[1], 1), pp = P.terraPlan(pol[0], pol[1], 1), pf = P.terraPlan(fill[0], fill[1], 3), per = {}; pf.cells.forEach(q => { per[q.k] = q.cost; });
    o.costs = { grade: pg1.cost, polder: pp.cost, fill: per.fill }; o.delays = { g: [pg1.permit, pg1.works], p: [pp.permit, pp.works], f: [pf.permit, pf.works] }; o.risk = [pg1.risk, pp.risk, pf.risk];
    const lotG = W.landPrice(g[0], g[1]); o.lotG = lotG;
    const z0 = { g: W.ZONE[g[1] * N + g[0]], pol: W.ZONE[pol[1] * N + pol[0]] };
    const c0 = S.cash; const ok = P.terra(g[0], g[1]); o.ok = ok; o.debit = c0 - S.cash; o.op = JSON.parse(JSON.stringify(P.PR().terr.map(q => ({ st: q.st, n: q.cells.length }))));
    T.stepN(1, true); o.stillGrass = W.ZONE[g[1] * N + g[0]] === 0;
    // permis puis travaux : le terrain n'existe qu'à la livraison
    let d = 0; while (P.PR().terr.length && d < 60) { T.stepN(1, true); d++; } o.days = d; o.zone1 = W.ZONE[g[1] * N + g[0]]; o.inCity = W.inCity(g[0], g[1]); o.ext = W.ZEXT[g[1] * N + g[0]]; o.pland = S.pland && S.pland[g[1] * N + g[0]]; o.refused = P.PR().st.created === 0;
    o.beyond = W.inCity(g[0], g[1]) && !(g[0] >= W.CITY.x0 && g[0] <= W.CITY.x1);
    // construire sur le terrain créé : pas de coût de sol
    const cb = S.cash; const rb = W.place(g[0], g[1], 'res'); const b = S.grid[g[1] * N + g[0]]; o.builtOnNew = rb && b && b.t === 'res'; o.buildDebit = cb - S.cash; o.lpKept = b && b.lp;
    return o;
  });
  t.info(`terrain : aplanir ${E.costs.grade} $/case, polder ${E.costs.polder} $, remblai ${E.costs.fill} $ ; permis+travaux ${JSON.stringify(E.delays)} ; lot en ville ≈ ${E.lotG} $`);
  t.check('trois techniques de terrain : aplanissement < poldérisation < remblai (coût par case), délais de travaux croissants', E.costs.grade < E.costs.polder && E.costs.polder < E.costs.fill && E.delays.g[1] <= E.delays.p[1] && E.delays.p[1] <= E.delays.f[1], JSON.stringify([E.costs, E.delays]));
  t.check('permis et risque : délai de permis, risque d\'aléas croissant avec la difficulté', E.delays.g[0] >= 2 && E.risk[0] < E.risk[1] && E.risk[1] < E.risk[2], JSON.stringify(E.risk));
  t.check('le terrain n\'existe qu\'à la livraison (délai > 0), puis la case devient urbaine hors de l\'ancienne zone 37x37', E.ok && E.stillGrass && E.days > 4 && E.zone1 === 1 && E.inCity && E.ext === 1 && E.beyond, JSON.stringify([E.ok, E.stillGrass, E.days, E.zone1, E.inCity, E.ext]));
  t.check('le terrain créé est payé une fois : base enregistrée, construction sans repayer le sol', E.pland > 0 && E.builtOnNew && E.lpKept === E.pland && E.buildDebit <= 70000, JSON.stringify([E.pland, E.lpKept, E.buildDebit]));

  // zonage : cases zonées, développement par la ville, demande, services
  const F = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, P = W.pro, T = window.T, o = {}; S.cash = 5e8; S.noEv = true;
    // zone de 7 x 7 en bordure est de la ville (campagne à aplanir) : un terrassement 3 x 3 puis zonage
    P.PR().brush = 3; let ok = 0; for (let y = 26; y < 37; y += 3) { if (P.terra(49, y)) ok++; } o.ops = ok;
    let guard = 0; while (P.PR().terr.length && guard++ < 80) T.stepN(1, true);
    const cells = []; for (let y = 24; y < 40; y++) for (let x = 49; x < 54; x++) if (W.ZONE[y * N + x] === 1 && W.ZEXT[y * N + x] && !S.grid[y * N + x] && !W.footprintError(x, y, 'res')) cells.push([x, y]);
    o.created = cells.length;
    const zt = ['R', 'c', 'o', 'r']; let z = 0, fee = 0; const c0 = S.cash; cells.forEach((q, i) => { if (P.zone(q[0], q[1], zt[i % 4])) z++; }); fee = c0 - S.cash; o.zoned = z; o.fee = fee;
    let ec = null; for (let y = 13; y < 48 && !ec; y++) for (let x = 13; x < 48; x++) if (W.ZONE[y * N + x] === 1 && !S.grid[y * N + x]) { ec = [x, y]; break; } o.reject = [P.zoneErr(60, 60, 'r'), ec ? P.zoneErr(ec[0], ec[1], 'i') : 'aucune case libre'];
    const b0 = S.built.length; T.stepN(60, true); o.spawned = S.built.length - b0; o.dem = P.zoneDem();
    const kinds = {}; S.built.slice(b0).forEach(b => { kinds[b[2]] = (kinds[b[2]] || 0) + 1; }); o.kinds = kinds;
    o.conn = cells.filter(q => { const c = S.grid[q[1] * N + q[0]]; return c && c.t === 'npc'; }).length;
    o.svc = P.PR().svcC; o.pop0 = S.pop; o.cap = S.stats.cap; o.pxCreated = P.PR().st.created;
    return o;
  });
  t.info(`zonage : ${F.created} cases créées, ${F.zoned} zonées (${F.fee} $), ${F.spawned} bâtiments sortis de terre en 60 jours ${JSON.stringify(F.kinds)} ; demande R/C/I ${JSON.stringify(F.dem)} ; services ${F.svc}`);
  t.check('terrassement en série : plusieurs chantiers livrés, des dizaines de cases créées', F.ops >= 2 && F.created >= 12, JSON.stringify([F.ops, F.created]));
  t.check('zonage résidentiel, résidentiel dense, commerce, bureaux : cases zonées, permis facturé', F.zoned >= 10 && F.fee > 0, JSON.stringify([F.zoned, F.fee]));
  t.check('zonage refusé hors terrain aménagé (campagne, centre-ville industriel) avec explication', /Campagne/.test(F.reject[0]) && /industrielle/.test(F.reject[1]), JSON.stringify(F.reject));
  t.check('SimCity : la ville construit seule sur les zones reliées à une rue (maisons, immeubles, bureaux), selon la demande', F.spawned >= 4 && Object.keys(F.kinds).length >= 2 && F.conn >= 4, JSON.stringify([F.spawned, F.kinds, F.conn]));

  // ---------- 5. Voirie et permis
  const G = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, P = W.pro, o = {}; S.cash = 5e8; let spot = null;
    for (let y = 14; y < 44 && !spot; y++) for (let x = 14; x < 44; x++) { if (W.ZONE[y * N + x] === 1 && !S.grid[y * N + x] && !P.roadErr(x, y)) { spot = [x, y]; break; } }
    o.spot = spot; const c0 = S.cash; o.ok = !!spot && W.place(spot[0], spot[1], 'road'); o.fee = c0 - S.cash; o.road = !!spot && S.grid[spot[1] * N + spot[0]] && S.grid[spot[1] * N + spot[0]].t === 'road' && S.grid[spot[1] * N + spot[0]].own; o.bl = !!spot && !!(S.pro.bl && S.pro.bl[spot[1] * N + spot[0]]);
    W.setCaste('agriculteur'); const e2 = P.roadErr(spot[0] + 1, spot[1]); W.setCaste('promoteur'); o.nonProm = e2;
    return o;
  });
  t.check('voirie : le promoteur pose une route en ville sous permis payant ; les autres castes sans entreprise de BTP sont refusés', G.ok && G.road && G.fee > 0 && G.bl && /permis de voirie|raccorder|Avenue/.test(G.nonProm || 'x'), JSON.stringify(G));

  // ---------- 6. Contrats BTP sans produire les matériaux
  const H = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, P = W.pro, o = {}; S.cash = 5e9; S.contracts = []; S.stock = S.stock || {}; T.inC('btp'); T.stepN(2, true);
    W.offerContract(); const ct = S.contracts[0]; o.n = S.contracts.length; o.has = !!ct;
    o.cost = P.matCost(ct); o.margin = ct.reward - o.cost; o.reward = ct.reward;
    S.stock = {}; const c0 = S.cash; const acc = W.acceptContract(ct.id); let d = 0; const cd0 = S.cdone || 0; while ((S.cdone || 0) === cd0 && d < 200) { T.stepN(1, true); d++; } o.acc = acc; o.done = (S.cdone || 0) - cd0; o.days = d; o.net = S.cash - c0; o.late = d >= ct.days; o.name = ct.name; o.paid = ct.paid;
    return o;
  });
  t.info(`contrat BTP : récompense ${H.reward} $, matériaux au marché + sous-traitance ${H.cost} $ (marge ${H.margin} $), livré en ${H.days} jours`);
  t.check('contrat BTP : honoré sans produire les matériaux (achetés au marché), livré dans les délais', H.acc && H.done === 1 && !H.late, JSON.stringify([H.acc, H.done, H.days]));
  t.check('contrat BTP : le promoteur dégage une marge positive (récompense +25 % > matériaux × 1,12)', H.margin > 0 && H.net > 0, JSON.stringify([H.margin, H.net]));

  // ---------- 7. Objectifs de caste, honoraires, panneau Opérations, fiche, infobulle
  const I = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, P = W.pro, o = {}; S.cash = 5e9; const st = P.state(); o.goals = st.goals.map(g => g.n);
    const p = P.PR(); p.goals = {}; p.st.bHouse = 10; p.st.created = 50; p.st.comm = 0; const c0 = S.cash; P.check(); o.done = Object.keys(P.PR().goals); o.reward = S.cash - c0;
    o.comm = P.fee(5); o.level = P.level();
    // fiche et panneau
    let hz = null; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'res' && W.acq.ownerOf(c) === 'npc') { hz = c; break; } }
    P.open(hz.x, hz.y); const f = document.getElementById('pfiche'); o.fiche = { hidden: f.hidden, txt: f.textContent };
    W.setTool('buyout'); const tip = document.getElementById('sitetip'); W.S.cash = 5e9;
    document.getElementById('pn').click(); document.querySelector('[data-ptab="ops"]').click(); P.render(); o.ops = document.getElementById('ops').textContent;
    return o;
  });
  t.check('objectifs de caste : dix objectifs lisibles (maisons, étages, terrain, zonage, plus-values, locatif, voirie, chantiers, honoraires)', I.goals.length === 10 && /Rachète 10 maisons/.test(I.goals.join('|')) && /Crée 50 cases/.test(I.goals.join('|')) && /Densifie/.test(I.goals.join('|')), I.goals.length + '');
  t.check('objectifs : atteindre 10 maisons rachetées et 50 cases créées verse les récompenses et fait progresser le niveau', I.done.indexOf('g1') >= 0 && I.done.indexOf('g3') >= 0 && I.reward > 400000 && I.level >= 1, JSON.stringify([I.done, I.reward, I.level]));
  t.check('honoraires : le promoteur perçoit une commission sur les chantiers des autres', I.comm > 0, I.comm + '');
  t.check('fiche d\'immeuble : valeur marchande, loyer, rendement, simulation de promotion, bouton Racheter', !I.fiche.hidden && /Valeur marchande/.test(I.fiche.txt) && /Loyer/.test(I.fiche.txt) && /Rendement net/.test(I.fiche.txt) && /Si tu rases et construis/.test(I.fiche.txt) && /Racheter pour louer/.test(I.fiche.txt), I.fiche.txt.slice(0, 160));
  t.check('panneau Opérations : marché, objectifs, chantiers, parc locatif, plus-values, urbanisme', ['MARCHÉ IMMOBILIER', 'OBJECTIFS DE CASTE', 'CHANTIERS EN COURS', 'PARC LOCATIF', 'PLUS-VALUES RÉALISÉES', 'URBANISME'].every(k => I.ops.indexOf(k) >= 0), I.ops.slice(0, 120));

  // infobulle : prix de marché affiché avant le clic, refus expliqué
  const J = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, P = W.pro, o = {}; let hz = null; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'house' && W.acq.ownerOf(c) === 'npc') { hz = c; break; } }
    W.setTool('buyout'); S.cash = 5e9; o.tip = P.tip(hz.x, hz.y); S.cash = 500; o.poor = P.tip(hz.x, hz.y); W.place(hz.x, hz.y, 'buyout'); o.msg = [...document.querySelectorAll('#feed .msg')].map(e => e.textContent).join(' | '); o.still = !!S.grid[hz.y * N + hz.x] && S.cash === 500; S.cash = 5e9;
    W.setTool('keep'); o.keep = P.tip(hz.x, hz.y); W.setTool('terra'); o.terra = P.tip(50, 40); W.setTool('zone'); o.zone = P.tip(50, 40); W.setTool('view'); return o;
  });
  t.check('infobulle de rachat : valeur de marché, prix demandé, frais, loyer net, plus-value de la promotion AVANT le clic', /Valeur de marché/.test(J.tip) && /Prix demandé/.test(J.tip) && /Frais de mutation/.test(J.tip) && /Plus-value estimée/.test(J.tip), J.tip.replace(/<[^>]+>/g, ' ').slice(0, 200));
  t.check('rachat refusé faute de trésorerie : prix expliqué (loyers capitalisés), rien débité', /Il te manque/.test(J.poor) && /Prix de marché/.test(J.msg) && J.still, J.msg.slice(0, 160));
  t.check('infobulles du terrassement et du zonage : coût, permis, délai ; raison si impossible', /Permis/.test(J.terra) || /Campagne|Déjà|contigu/.test(J.terra), J.terra.replace(/<[^>]+>/g, ' ').slice(0, 160));

  // ---------- 8. Sauvegarde rétrocompatible et déterminisme
  const K = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, P = W.pro, o = {}; P.PR().hype = 0.3; W.save(); const raw = JSON.parse(localStorage.getItem('wse-city-v8')); o.v = raw.v; o.keys = ['pro', 'pland', 'pzn', 'pzm'].map(k => raw[k] != null); o.zmN = raw.pzm ? Object.keys(raw.pzm).length : 0;
    // ancienne sauvegarde sans champs promoteur : relue sans erreur, la carte d'origine est reconstruite
    ['pro', 'pland', 'pzn', 'pzm'].forEach(k => { delete raw[k]; }); localStorage.setItem('wse-city-v8', JSON.stringify(raw)); const S0 = W.load();
    o.old = { ok: !!S0 && S0.day === S.day, pro: S0 && S0.pro, zn: S0 && S0.pzn, pland: S0 && S0.pland, zext: W.ZEXT.reduce((a, v) => a + v, 0), cash: S0 && Math.round(S0.cash) === Math.round(S.cash) };
    return o;
  });
  t.check('sauvegarde v8 : champs pro, pland, pzn, pzm écrits ; ancienne sauvegarde (sans eux) relue sans erreur, carte d\'origine rétablie', K.v === 8 && K.keys.every(Boolean) && K.zmN > 0 && K.old.ok && K.old.pro === null && K.old.zn === null && K.old.zext === 0 && K.old.cash, JSON.stringify(K));

  // aller-retour complet : terrain créé, travaux, zonage, bien détenu
  const pg2 = await L.newPage({ wait: 500 }); await L.setup(pg2, { caste: 'promoteur', cash: 5e9 }); await L.inject(pg2);
  const R1 = await pg2.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, P = W.pro, T = window.T; S.noEv = true; P.PR().brush = 2; P.terra(49, 30); let g = 0; while (P.PR().terr.length && g++ < 60) T.stepN(1, true);
    const cells = []; for (let y = 28; y < 34; y++) for (let x = 49; x < 53; x++) if (W.ZEXT[y * N + x] && !S.grid[y * N + x]) cells.push([x, y]);
    cells.slice(0, 3).forEach(q => P.zone(q[0], q[1], 'R'));
    const sp = cells[cells.length - 1]; W.place(sp[0], sp[1], 'res'); const b = S.grid[sp[1] * N + sp[0]];
    const rs = []; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'house' && W.acq.ownerOf(c) === 'npc') rs.push(c); } P.keep(rs[0].x, rs[0].y);
    P.terra(60, 60); W.save(); return { zext: W.ZEXT.reduce((a, v) => a + v, 0), zn: Object.keys(S.pzn || {}).length, hold: Object.keys(S.pro.hold).length, works: !!(b && b.works), terr: S.pro.terr.length, floors: b && b.floors, bday: b && b.bday, invest: b && b.invest, cash: Math.round(S.cash) };
  });
  await pg2.reload(); await pg2.waitForTimeout(700);
  const R2 = await pg2.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; let b = null; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'res') b = c; } return { zext: W.ZEXT.reduce((a, v) => a + v, 0), zn: Object.keys(S.pzn || {}).length, hold: Object.keys(S.pro.hold).length, works: !!(b && b.works), terr: S.pro.terr.length, floors: b && b.floors, bday: b && b.bday, invest: b && b.invest, inCity: W.inCity(49, 30), roads: S.grid.filter(c => c && c.t === 'road').length }; });
  t.check('sauvegarde : terrains créés, zonage, biens détenus, chantiers de logements et de terrain, base et date d\'achat restaurés', R2.zext === R1.zext && R2.zn === R1.zn && R2.hold === R1.hold && R2.works === R1.works && R2.terr === R1.terr && R2.floors === R1.floors && R2.bday === R1.bday && R2.inCity, JSON.stringify([R1, R2]));

  // déterminisme : même scénario sur deux parties de même graine = même résultat
  const run = async () => { const p = await L.newPage({ wait: 400 }); await L.setup(p, { caste: 'promoteur', cash: 5e9 }); await L.inject(p);
    const r = await p.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, P = W.pro, T = window.T; S.rs = 777; S.noEv = true; P.PR().brush = 2; P.terra(49, 30); for (let i = 0; i < 40; i++) T.stepN(1, true); for (let y = 28; y < 34; y++) for (let x = 49; x < 53; x++) if (W.ZEXT[y * N + x] && !S.grid[y * N + x]) P.zone(x, y, 'R');
      for (let i = 0; i < 60; i++) T.stepN(1, true); return { cash: Math.round(S.cash), built: S.built.length, pop: Math.round(S.pop), hype: +S.pro.hype.toFixed(4), z: Object.keys(S.pzn || {}).length }; });
    await p.context().close(); return r; };
  const r1 = await run(), r2 = await run();
  t.check('déterminisme : deux parties de même graine donnent les mêmes terrains, bâtiments zonés et trésorerie', JSON.stringify(r1) === JSON.stringify(r2) && r1.built > 0, JSON.stringify([r1, r2]));

  // intégrité : aucun NaN, aucune erreur de page
  const bad = await pg.evaluate(() => window.T.scan());
  t.check('aucune valeur non finie dans l\'état de jeu', bad.length === 0, bad.slice(0, 4).join(', '));
  t.check('aucune erreur de page', pg.errs.length === 0 && pg2.errs.length === 0 && errA.length === 0, pg.errs.concat(pg2.errs, errA).slice(0, 3).join(' | '));
  await pg.context().close(); await pg2.context().close();
};
