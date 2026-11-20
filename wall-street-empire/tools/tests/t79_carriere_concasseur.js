// Passe 79 (demande de Rémy) : une seule carrière de granulats (gravier + sable en coproduits, un seul gisement, un seul outil), concasseur de recyclage
// investi depuis la fiche de la carrière (chantier, 3 niveaux) qui prolonge la production quand le gisement s'épuise, gravats de démolition (joueur, promoteur,
// mairie, croissance de la ville) recyclés en granulats, redevance de dépôt / frais d'évacuation, migration des anciennes sauvegardes (qgravel, qsand, crush), déterminisme.
exports.name = 'Carrière de granulats et concasseur (passe 79)';

exports.run = async (t, L) => {
  // ---------- 1. Une seule carrière, gravier + sable ----------
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e10, noAid: true }); await L.inject(pg);
  const A = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, o = {};
    const Q = W.TYPES.qgravel; o.name = Q.name; o.ext = Q.ext; o.co = Q.co; o.noSand = !W.TYPES.qsand && !W.TYPES.crush && !W.DEPOSITS.sand;
    o.tools = W.CATS.find(c => c.id === 'btp').tools.filter(k => /^q/.test(k) || k === 'crush');
    let nd = 0, ns = 0; S.dep.forEach(d => { if (d && d.k === 'gravel') nd++; if (d && d.k === 'sand') ns++; }); o.nDep = nd; o.nSand = ns; o.depName = W.DEPOSITS.gravel.name;
    T.inP('port'); for (let i = 0; i < 10; i++) T.inC('res');
    const q = T.onDep('qgravel', 'gravel'); o.placed = !!q; const d = S.dep[q.y * W.N + q.x];
    T.stepN(10, true); const r0 = d.r; T.frz(); W.step(); o.gravel = q.out; o.sand = q._cq.sand; o.drain = r0 - d.r;
    const A = { pRev: 0, eb: 0 }; for (let i = 0; i < 20; i++) { T.frz(); W.step(); A.pRev += q.pRev / 20; A.eb += (q.pRev - q.wages - (q.upk || 0) - (q.transport || 0)) / 20; } o.eco = A; o.capex = Q.cost;
    o.srcSand = W.RAW_SRC ? W.RAW_SRC.sand : null;
    return o;
  });
  t.check('une seule carrière « Carrière de granulats » (plus de sablière ni de centre de concassage, plus de gisement de sable)', A.name === 'Carrière de granulats' && A.ext === 'gravel' && A.noSand && A.nSand === 0 && A.nDep > 100, `${A.name} · ${A.ext} · ${A.nDep} cases de gisement « ${A.depName} » · sable ${A.nSand} · types ${A.noSand}`);
  t.check('un seul outil de pose dans le menu BTP (granulats + calcaire)', JSON.stringify(A.tools) === '["qgravel","qlime"]', JSON.stringify(A.tools));
  t.check('la carrière produit gravier ET sable (0,7 u de sable par u de gravier) et le gisement s\'épuise du tout-venant', A.placed && A.gravel > 0 && Math.abs(A.sand / A.gravel - 0.7) < 1e-6 && A.drain >= A.gravel + A.sand - 1 && A.drain <= 1.1 * (A.gravel + A.sand), `gravier ${Math.round(A.gravel)}, sable ${Math.round(A.sand)}, gisement −${Math.round(A.drain)}/j (tout-venant extrait, pertes comprises)`);
  t.range('carrière seule : EBITDA (%)', 100 * A.eco.eb / A.eco.pRev, 17, 35);
  t.info(`carrière seule : CA ${Math.round(A.eco.pRev)} $/j, EBITDA ${Math.round(A.eco.eb)} $/j, capex ${A.capex} $ (retour ≈ ${(A.capex / (A.eco.eb * 360)).toFixed(1)} an)`);

  // ---------- 2. Épuisement puis investissement concasseur ----------
  const B = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, o = {}, q = S.grid.find(c => c && c.t === 'qgravel'), d = S.dep[q.y * W.N + q.x];
    const pre = { pRev: 0 }; for (let i = 0; i < 10; i++) { T.frz(); W.step(); pre.pRev += q.pRev / 10; } o.pre = pre.pRev;
    S.rub.st = 2e6; S.rub.pl = 0;   // gravats abondants (démolitions de la ville)
    d.r = 10; for (let i = 0; i < 3; i++) { T.frz(); W.step(); } o.dry = q.dry; o.lim = q.limit; o.pRevDry = q.pRev;
    const bn = W.rub.bottleneck(q); o.acts = bn.acts.map(a => a[0]);
    W.openBuilding(q.x, q.y); o.card = (document.getElementById('bbody') || {}).innerText || ''; o.btn = !!document.querySelector('#bbody [data-act="crinv"]'); W.closeBuilding();
    const c0 = S.cash, cost = W.cr.cost(q); o.ok = W.cr.invest(q); o.paid = c0 - S.cash; o.cost = cost; o.again = W.cr.invest(q);
    o.prog = []; for (let i = 0; i < W.cr.DAYS[0] - 1; i++) { T.frz(); W.step(); o.prog.push(+W.cr.prog(q).toFixed(2)); } o.lv0 = q.cr | 0;
    for (let i = 0; i < 2; i++) { T.frz(); W.step(); } o.lv1 = q.cr;
    const M = () => { const a = { pRev: 0, eb: 0, rin: 0, fee: 0 }; for (let i = 0; i < 15; i++) { S.rub.st = Math.max(S.rub.st, 1e6); T.frz(); W.step(); a.pRev += q.pRev / 15; a.eb += (q.pRev - q.wages - (q.upk || 0) - (q.transport || 0)) / 15; a.rin += q._rin / 15; a.fee += q._gate / 15; } return a; };
    o.L1 = M(); o.lim1 = q.limit;
    q.cr = 2; o.L2 = M(); q.cr = 3; o.L3 = M(); o.max = W.cr.cost(q) === 0 && W.cr.invest(q) === false;
    W.openBuilding(q.x, q.y); o.card2 = (document.getElementById('bbody') || {}).innerText || ''; W.closeBuilding();
    return o;
  });
  t.check('gisement épuisé : limite « reserve », boutons « Investir dans un concasseur » et « Démolir »', B.dry && B.lim === 'reserve' && B.acts.includes('crinv') && B.acts.includes('bullref') && B.btn && /Investir dans un concasseur/.test(B.card) && /Gisement restant/.test(B.card), B.acts.join(','));
  t.check('investissement : coût débité, chantier unique avec barre de progression, concasseur en service à la fin', B.ok && Math.abs(B.paid - B.cost) < 2 && B.cost > 0 && B.again === false && B.prog.every((p, i, a) => !i || p > a[i - 1]) && B.lv0 === 0 && B.lv1 === 1, `${B.paid} $ · ${B.prog.join(' ')} · niveau ${B.lv1}`);
  t.check('carrière épuisée + concasseur : la production et le CA reprennent (gravats recyclés), plus d\'alerte d\'épuisement', B.pRevDry === 0 && B.L1.pRev > 0 && B.L1.rin > 0 && B.L1.eb > 0 && B.lim1 !== 'reserve', `CA ${Math.round(B.L1.pRev)} $/j, EBITDA ${Math.round(B.L1.eb)} $/j, traité ${Math.round(B.L1.rin)} u/j`);
  t.check('agrandir le concasseur augmente volume traité et CA ; au niveau 3 le CA dépasse celui de l\'ancienne extraction', B.L2.rin > B.L1.rin && B.L3.rin > B.L2.rin && B.L2.pRev > B.L1.pRev && B.L3.pRev > B.pre && B.max, `CA ${[B.L1, B.L2, B.L3].map(x => Math.round(x.pRev)).join(' → ')} $/j (extraction ${Math.round(B.pre)})`);
  t.check('fiche : gisement restant, gravats de la ville, volume traité, CA recyclé', /Gravats de la ville/.test(B.card2) && /traité/.test(B.card2) && /CA recyclé/.test(B.card2) && /Concasseur niveau 3\/3/.test(B.card2), B.card2.replace(/\s+/g, ' ').slice(0, 120));
  t.info(`concasseur (épuisé, gravats abondants) : CA/j ${[B.L1, B.L2, B.L3].map(x => Math.round(x.pRev)).join(' / ')}, EBITDA/j ${[B.L1, B.L2, B.L3].map(x => Math.round(x.eb)).join(' / ')}, redevance/j ${[B.L1, B.L2, B.L3].map(x => Math.round(x.fee)).join(' / ')}`);

  // ---------- 3. Démolitions → gravats → recyclage (somme positive) ----------
  const C = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, o = {}, q = S.grid.find(c => c && c.t === 'qgravel' && c.cr > 0);
    // sans concasseur : démolir coûte l'évacuation ; avec : gratuit, sans redevance (gravats du joueur)
    q.cr = 0; const r = T.put('res', 14, 44, 14, 44); r.floors = 6; const rb = W.rub.of(r), st0 = S.rub.st, c0 = S.cash; W.place(r.x, r.y, 'bull'); o.evac = c0 - S.cash; o.rb = rb; o.got = S.rub.st - st0;
    o.evacExp = Math.round(rb * W.rub.EVAC * Math.max(1, S.cpi || 1));
    q.cr = 1; const r2 = T.put('res', 14, 44, 14, 44); const c1 = S.cash; W.place(r2.x, r2.y, 'bull'); o.evac2 = c1 - S.cash;
    // gravats du joueur seuls : pas de redevance ; gravats de la ville : redevance
    S.rub.st = 500; S.rub.pl = 500; T.frz(); W.step(); o.feeMine = q._gate; o.rinMine = q._rin;
    S.rub.st = 500; S.rub.pl = 0; T.frz(); W.step(); o.feeCity = q._gate;
    // rachat d'un immeuble de la ville (promoteur) : gravats proportionnels aux étages
    let npc = null; for (let i = 0; i < W.N * W.N && !npc; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'res' && !(S.npcOwn && S.npcOwn[c.x + ',' + c.y]) && !c.lm) npc = c; }
    if (npc) { const t0 = S.rub.tot, exp = W.rub.of(npc); W.place(npc.x, npc.y, 'buyout'); o.buy = { exp, got: S.rub.tot - t0, fl: npc.floors }; }
    // croissance de la ville : gravats diffus (population) + immeubles rasés et reconstruits plus haut
    S.noEv = true; let diff = 0; const t1 = S.rub.tot; for (let i = 0; i < 120; i++) { diff += 0.5 * S.pop / 360; W.step(); } o.city = { tot: S.rub.tot - t1, diff, fl: S.rub.fl };
    return o;
  });
  t.check('démolition sans concasseur : gravats ajoutés (∝ étages) et petit coût d\'évacuation', C.got === C.rb && C.rb > 0 && Math.abs(C.evac - C.evacExp) <= 1 && C.evac > 0, `${C.rb} u, évacuation ${C.evac} $`);
  t.check('démolition avec ton concasseur : évacuation gratuite', C.evac2 === 0, `${C.evac2} $`);
  t.check('redevance de dépôt : payée par les démolisseurs de la ville, jamais pour tes propres gravats', C.rinMine > 0 && C.feeMine === 0 && C.feeCity > 0, `tes gravats ${C.feeMine} $, ville ${Math.round(C.feeCity)} $`);
  t.check('rachat-démolition d\'un immeuble de la ville (promoteur) : gravats ∝ étages', C.buy && C.buy.got >= C.buy.exp && C.buy.exp === 420 * C.buy.fl, C.buy ? `${C.buy.fl} étages → ${C.buy.got} u` : 'aucun immeuble');
  t.check('croissance de la ville : gravats diffus (population) + immeubles rasés pour reconstruire plus haut', C.city.tot >= C.city.diff - 1 && C.city.tot > 0, `${Math.round(C.city.tot)} u en 120 j (dont diffus ${Math.round(C.city.diff)})`);
  t.check('carrière et concasseur : aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();

  // ---------- 4. Migration d'une ancienne sauvegarde (qgravel, qsand, crush, gisements de gravier et de sable) ----------
  const ctx = await (await L.browser()).newContext({ viewport: { width: 1280, height: 900 } });
  let p2 = await L.newPage({ ctx, wait: 700 }); await L.setup(p2, { cash: 5e9 }); await L.inject(p2);
  const M0 = await p2.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, N = W.N;
    const a = T.onDep('qgravel', 'gravel'), b = T.onDep('qgravel', 'gravel', 1), c = T.onDep('qgravel', 'gravel', 2); c.lvl = 1;
    S.stock.gravel = 1234; S.stock.sand = 567; S.rub = { st: 9000, tot: 9000, done: 0, fl: 10, d: 0 }; W.step(); W.save();
    const raw = JSON.parse(localStorage.getItem('wse-city-v8')); const ia = a.y * N + a.x, ib = b.y * N + b.x, ic = c.y * N + c.x;
    raw.g[ib][0] = 'qsand'; raw.g[ic][0] = 'crush'; delete raw.agg;
    let sandSet = 0; const old = {}; raw.dep.forEach(e => { if (e[1] === 'gravel' && sandSet < 30 && e[0] !== ia) { e[1] = 'sand'; sandSet++; } if (e[0] === ia || e[0] === ib) old[e[0]] = e[2]; });
    W.setSpeed(0); localStorage.setItem('wse-city-v8', JSON.stringify(raw)); Storage.prototype.setItem = function () {};   /* plus aucune sauvegarde de cette page (sauvegarde différée de la pose) */ return { ia, ib, ic, old, stock: [1234, 567] };
  });
  const p1 = p2;   // la nouvelle page charge la sauvegarde modifiée AVANT la fermeture de l'ancienne (qui sauvegarde en partant)
  p2 = await ctx.newPage(); p2.errs = []; p2.on('pageerror', e => p2.errs.push(e.message)); await p2.goto(L.URL); await p2.waitForTimeout(600); await p1.close();
  const M1 = await p2.evaluate(m => {
    const W = window.WSE, S = W.S; W.setSpeed(0); const g = i => S.grid[i] ? { t: S.grid[i].t, cr: S.grid[i].cr | 0, lvl: S.grid[i].lvl | 0 } : null;
    let sand = 0; S.dep.forEach(d => { if (d && d.k === 'sand') sand++; });
    return { a: g(m.ia), b: g(m.ib), c: g(m.ic), sand, ra: S.dep[m.ia] && S.dep[m.ia].r, rb: S.dep[m.ib] && S.dep[m.ib].r, st: [Math.round(S.stock.gravel), Math.round(S.stock.sand)], rub: Math.round(S.rub.st), unknown: S.grid.some(c => c && !W.TYPES[c.t] && c.t !== 'part') };
  }, M0);
  await p2.evaluate(() => { const W = window.WSE; W.setSpeed(0); for (let i = 0; i < 10; i++) W.step(); });
  t.check('migration : sablière → carrière de granulats, centre de concassage → carrière avec concasseur (niveau 3 s\'il avait été agrandi)', M1.a && M1.a.t === 'qgravel' && M1.b && M1.b.t === 'qgravel' && M1.b.cr === 0 && M1.c && M1.c.t === 'qgravel' && M1.c.cr === 3 && M1.c.lvl === 0 && !M1.unknown, JSON.stringify([M1.a, M1.b, M1.c]));
  t.check('migration : gisements de sable → granulats, réserves × 1,7 (tout-venant, même durée de vie)', M1.sand === 0 && Math.abs(M1.ra - 1.7 * M0.old[M0.ia]) <= 2 && Math.abs(M1.rb - 1.7 * M0.old[M0.ib]) <= 2, `${M0.old[M0.ia]} → ${M1.ra}`);
  t.check('migration : stocks de gravier, de sable et de gravats conservés ; 0 erreur', JSON.stringify(M1.st.map(v => v > 0)) === '[true,true]' && M1.rub >= 9000 && p2.errs.length === 0, `stocks ${M1.st.join('/')} · gravats ${M1.rub} · ${p2.errs.slice(0, 1).join('')}`);
  // aller-retour : un concasseur en chantier survit à la sauvegarde
  const R0 = await p2.evaluate(m => { const W = window.WSE, S = W.S, q = S.grid[m.ia]; S.cash = 1e9; W.cr.invest(q); W.step(); return { crb: q.crb ? q.crb.to : 0 }; }, M0);
  { const p1b = p2; p2 = await ctx.newPage(); p2.errs = []; p2.on('pageerror', e => p2.errs.push(e.message)); await p2.goto(L.URL); await p2.waitForTimeout(500); await p1b.close(); }
  const R1 = await p2.evaluate(m => { const S = window.WSE.S, q = S.grid[m.ia]; return { crb: q && q.crb ? q.crb.to : 0, c: S.grid[m.ic] && S.grid[m.ic].cr }; }, M0);
  t.check('sauvegarde : niveau du concasseur et chantier en cours conservés', R0.crb === 1 && R1.crb === 1 && R1.c === 3, JSON.stringify([R0, R1]));
  await ctx.close();

  // ---------- 5. Déterminisme ----------
  const SCRIPT = `(() => { const W = window.WSE, S = W.S, T = window.T; S.noEv = true; S.cash = 5e10; S.unlockAll = true;
    T.inP('port'); const q = T.onDep('qgravel', 'gravel'); for (let i = 0; i < 6; i++) { const r = T.put('res', 14, 44, 14, 44); if (r && i % 2) W.place(r.x, r.y, 'bull'); }
    S.dep[q.y * W.N + q.x].r = 2000; W.cr.invest(q);
    for (let d = 0; d < 80; d++) { T.frz(); W.step(); }
    return JSON.stringify({ day: S.day, cash: Math.round(S.cash), rub: S.rub, q: [q.cr, q.out, q._rin, q.pRev], st: [S.stock.gravel, S.stock.sand, S.stock.cement].map(Math.round), fin: S.fin }); })()`;
  async function game() { const p = await L.newPage({ wait: 600 }); await L.setup(p, { cash: 5e10 }); await L.inject(p); const s = await p.evaluate(SCRIPT); await p.context().close(); return s; }
  const g1 = await game(), g2 = await game();
  t.check('déterminisme : deux parties identiques (carrière, concasseur, gravats, stocks) donnent le même état', g1 === g2 && g1.length > 100, g1 === g2 ? `${g1.length} caractères comparés` : 'états différents');
};
