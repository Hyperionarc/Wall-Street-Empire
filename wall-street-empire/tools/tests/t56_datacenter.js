// Passe 55 : le data center devient un campus hyperscale (5×4 cases), interdit en ville, qui doit être alimenté (réseau au tarif data center ou centrales du joueur).
// Uptime selon le mix (modèle horaire déterministe : solaire le jour, éolien variable, pilotable constant, batteries, appoint réseau), contrats cloud perdus pendant les pannes,
// fiche (puissance requise et reçue, uptime 30 jours, sources, coût, conseils), migration des anciens data centers (1×1 et 2×2), aucun NaN, fiche lisible sur mobile.
exports.name = 'Data center : campus, énergie et uptime (passe 55)';

// Pylônes sur toutes les cases constructibles qui bordent la ville (points d'entrée du réseau), puis centrales posées contre ces pylônes.
const GRID = `const Z = W.ZONE, inb = (x, y) => x >= 0 && y >= 0 && x < N && y < N, pyl = new Set();
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; if (Z[i] === 1 || Z[i] === 3) continue; let adj = false; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (inb(x + dx, y + dy) && Z[(y + dy) * N + x + dx] === 1) adj = true; if (adj && !W.footprintError(x, y, 'pylon') && W.place(x, y, 'pylon')) pyl.add(i); }
  const near = k => { const T0 = W.TYPES[k], w = T0.w || 1, h = T0.h || 1; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (W.footprintError(x, y, k)) continue; let ok = false; for (let X = x - 1; X <= x + w && !ok; X++) for (let Y = y - 1; Y <= y + h; Y++) if (pyl.has(Y * N + X)) { ok = true; break; } if (ok && W.place(x, y, k)) return S.grid[y * N + x]; } return null; };`;

async function scen(L, mix, days = 40) {
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { noAid: true }); await L.inject(pg);
  const r = await pg.evaluate(({ mix, days, GRID }) => {
    const W = window.WSE, S = W.S, T = window.T, N = W.N; new Function('W', 'S', 'N', 'out', GRID + ' out.near = near;')(W, S, N, T);
    for (let i = 0; i < 10; i++) T.inC('res');
    const d = T.inP('dc'); if (!d) return { none: true };
    const pl = []; Object.keys(mix.pl || {}).forEach(k => { for (let i = 0; i < mix.pl[k]; i++) { const p = T.near(k); if (p) pl.push(p); } });
    if (mix.bat) d.bat = mix.bat; if (mix.nogrid) d.gb = 0;
    for (let i = 0; i < 8; i++) { T.frz(); S.stock.coal = 1e9; W.step(); }   // mise en service (embauche, première charge des batteries) hors mesure
    const A = { pRev: 0, ic: 0, wag: 0, upk: 0, av: 0, up: 0, out: 0, grid: 0, own: 0, bat: 0, plRev: 0 }, ups = [];
    for (let i = 0; i < days; i++) { T.frz(); S.stock.coal = 1e9; W.step(); A.pRev += d.pRev; A.ic += d.inCost || 0; A.wag += d.wages; A.upk += d.upk || 0; A.av += d._avail; A.up += d._up; A.out += d._pw.out; A.grid += d._pw.grid; A.own += d._pw.own; A.bat += d._pw.bat; pl.forEach(p => { A.plRev += p.pRev || 0; }); ups.push(d._up); }
    Object.keys(A).forEach(k => { A[k] /= days; });
    const tips = W.dc.tips(d);
    return { A, eb: (A.pRev - A.ic - A.wag - A.upk) / Math.max(1, A.pRev), ct: d.ct, need: W.dc.need(d), np: pl.length, gok: pl.filter(p => p.gridOk).length, ups, tips, uph: (d.uph || []).length, up30: W.dc.up30(d), nan: T.scan(), sig: JSON.stringify([S.cash, d.pRev, d.ct, d.soc, ups]) };
  }, { mix, days, GRID });
  r.errs = pg.errs; await pg.context().close(); return r;
}

exports.run = async (t, L) => {
  // ---- 1. Interdit en ville, taille, emprise, placement hors de la ville
  const pg = await L.newPage({ wait: 600 }); await L.setup(pg); await L.inject(pg);
  const z = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, T = window.T, Z = W.ZONE;
    let city = 0, msg = '', tried = 0; for (let y = 0; y < N && tried < 400; y++) for (let x = 0; x < N; x++) { if (Z[y * N + x] !== 1) continue; tried++; const e = W.footprintError(x, y, 'dc'); if (!e) city++; else if (/en ville|zone/.test(e)) msg = e; }
    const placedCity = false;
    const d = T.inP('dc'); let parts = 0; for (let i = 0; i < N * N; i++) { const q = S.grid[i]; if (q && q.t === 'part' && d && q.ai === d.x + d.y * N) parts++; }
    let inCity = 0; if (d) for (let ox = 0; ox < d.w; ox++) for (let oy = 0; oy < d.h; oy++) if (Z[(d.y + oy) * N + d.x + ox] === 1) inCity++;
    return { city, msg, tried, placedCity, w: W.TYPES.dc.w, h: W.TYPES.dc.h, dw: d && d.w, dh: d && d.h, parts, inCity, cost: W.TYPES.dc.cost, jobs: W.TYPES.dc.jobs, f3: W.TYPES.f3.cost, nuc: W.TYPES.nuclear.cost };
  });
  // liberté de construire (docs/journal/construction.md) : plus d'interdiction de zone ; seule l'emprise de 5×4 cases libres (physique) limite le campus en ville
  t.check('plus interdit en ville : aucun refus de zone, seule l\'emprise libre de 5×4 cases compte (le centre est bâti)', z.tried > 100 && !z.msg, z.msg.slice(0, 90) || `${z.city} emprise(s) libre(s) en ville`);
  t.check('campus immense : emprise ≥ 10 cases (5×4 = 20), posé en zone industrielle', z.w * z.h >= 10 && z.dw === z.w && z.dh === z.h && z.parts === z.w * z.h - 1 && z.inCity === 0, `${z.w}×${z.h}, ${z.parts + 1} cases occupées`);
  t.check('coût et effectif proportionnés (≈ 4 anciens data centers : 60-120 M$, 150-300 emplois)', z.cost >= 6e7 && z.cost <= 1.2e8 && z.jobs >= 150 && z.jobs <= 300, `${(z.cost / 1e6).toFixed(0)} M$ · ${z.jobs} emplois`);
  await pg.context().close();

  // ---- 2. Besoin d'énergie et alimentation
  const none = await scen(L, { nogrid: 1 }, 20), grid = await scen(L, {}), coal = await scen(L, { pl: { plant: 8 } }), nuc = await scen(L, { pl: { nuclear: 2 } });
  t.check('besoin colossal : ≥ 8 fois une grande usine (240 MWh/j) et ≥ 6 centrales à charbon', grid.need >= 8 * 240 && grid.need >= 6 * 300, `${grid.need} MWh/j`);
  t.check('sans alimentation (appoint coupé, aucune centrale) : non opérationnel, aucune recette', none.A.av === 0 && none.A.pRev === 0 && none.A.out === 24, `capacité ${none.A.av} · recettes ${Math.round(none.A.pRev)}`);
  t.check('réseau seul : opérationnel mais facture très lourde (30-60 % du CA), EBITDA bas (0-30 %)', grid.A.av > 0.999 && grid.A.ic > 0.3 * grid.A.pRev && grid.A.ic < 0.6 * grid.A.pRev && grid.eb > 0 && grid.eb < 0.3, `électricité ${(100 * grid.A.ic / grid.A.pRev).toFixed(0)} % du CA · EBITDA ${(100 * grid.eb).toFixed(0)} %`);
  t.check('centrales propres reliées (charbon ×8) : facture divisée, EBITDA bien meilleur', coal.gok === coal.np && coal.np === 8 && coal.A.own > 0.7 * coal.need && coal.A.ic < 0.3 * grid.A.ic && coal.eb > grid.eb + 0.2, `autoproduit ${Math.round(coal.A.own)} MWh/j · EBITDA ${(100 * coal.eb).toFixed(0)} %`);
  t.check('nucléaire ×2 : 100 % autoalimenté, uptime 100 %, aucun achat au réseau', nuc.A.av > 0.999 && nuc.A.up > 0.999 && nuc.A.grid < 1 && nuc.ct === 1, `uptime ${(100 * nuc.A.up).toFixed(1)} %`);
  t.check('rentabilité cohérente : capex rentabilisé en 1-2,5 ans avec ses centrales, plus de 3 ans au réseau seul', 80e6 / ((coal.A.pRev - coal.A.ic - coal.A.wag - coal.A.upk) * 360) < 2.5 && 80e6 / ((grid.A.pRev - grid.A.ic - grid.A.wag - grid.A.upk) * 360) > 3, '');

  // ---- 3. Uptime selon le mix (intermittence, batteries, appoint)
  const sol = await scen(L, { pl: { solar: 3 }, nogrid: 1 }), solB = await scen(L, { pl: { solar: 3 }, nogrid: 1, bat: 3 }), solG = await scen(L, { pl: { solar: 3 } }), wind = await scen(L, { pl: { wind: 45 }, nogrid: 1 }), mixC = await scen(L, { pl: { solar: 3, plant: 6 }, nogrid: 1, bat: 3 });
  t.check('solaire seul sans appoint : pannes chaque nuit, uptime < 70 %, contrats cloud perdus', sol.A.up < 0.7 && sol.A.out >= 8 && sol.ct < 0.8 && sol.A.pRev < 0.5 * grid.A.pRev, `uptime ${(100 * sol.A.up).toFixed(0)} % · ${sol.A.out.toFixed(1)} h de panne/j · contrats ${(100 * sol.ct).toFixed(0)} %`);
  t.check('batteries : le surplus de midi couvre la nuit (uptime nettement meilleur)', solB.A.bat > 0 && solB.A.up > sol.A.up + 0.2 && solB.A.av > sol.A.av, `uptime ${(100 * sol.A.up).toFixed(0)} % → ${(100 * solB.A.up).toFixed(0)} %`);
  t.check('appoint réseau : uptime 100 % mais facture (les heures sans soleil sont achetées)', solG.A.up > 0.999 && solG.A.grid > 0.2 * solG.need && solG.A.ic > 0, `réseau ${Math.round(solG.A.grid)} MWh/j`);
  t.check('éolien seul (×45) sans appoint : uptime fluctuant (jours sans vent)', wind.A.up < 0.95 && Math.max(...wind.ups) - Math.min(...wind.ups) > 0.2, `uptime ${(100 * wind.A.up).toFixed(0)} % (min ${(100 * Math.min(...wind.ups)).toFixed(0)} %, max ${(100 * Math.max(...wind.ups)).toFixed(0)} %)`);
  t.check('bon joueur : mix solaire ×3 + charbon ×6 + batteries sans réseau → uptime ≥ 95 %', mixC.A.up >= 0.95 && mixC.A.grid === 0, `uptime ${(100 * mixC.A.up).toFixed(1)} %`);
  t.check('conseils adaptés (réseau seul, mix intermittent, appoint coupé)', /Tout vient du réseau/.test(grid.tips.join(' ')) && /solaire|batteries/i.test(sol.tips.join(' ')) && /Appoint réseau coupé/.test(sol.tips.join(' ')), sol.tips[0].slice(0, 80));
  const det = await scen(L, { pl: { solar: 3 }, nogrid: 1 });
  t.check('déterminisme : même scénario, même résultat', det.sig === sol.sig, '');
  const all = [none, grid, coal, nuc, sol, solB, solG, wind, mixC];
  t.check('aucun NaN, aucune erreur JS dans les scénarios', all.every(r => !r.nan.length && !r.errs.length), all.map(r => r.nan.length + r.errs.length).join(','));

  // ---- 4. Migration d'une ancienne sauvegarde (data center 1×1 et 2×2 en ville)
  const ctx = await (await L.browser()).newContext({ viewport: { width: 1280, height: 900 } });
  let p2 = await L.newPage({ ctx, wait: 600 }); await L.setup(p2); await L.inject(p2);
  const prep = await p2.evaluate(async () => { const W = window.WSE, S = W.S, N = W.N, T = window.T; const a = T.inC('tech'), b = T.inC('hq'); W.step(); await new Promise(r => setTimeout(r, 700)); W.save();   // après la sauvegarde différée (0,4 s) de la construction
    const sv = JSON.parse(localStorage.getItem('wse-city-v8')), ia = a.x + a.y * N, ib = b.x + b.y * N; sv.g[ia][0] = 'dc'; sv.g[ib][0] = 'dc'; sv.g[ia][9] = 19000000; sv.g[ib][9] = 19000000;
    localStorage.setItem('wse-city-v8', JSON.stringify(sv)); Storage.prototype.setItem = function () {};   /* la page ne réécrit plus la sauvegarde en se fermant */ return { ia, ib, a: [a.x, a.y], b: [b.x, b.y, b.w, b.h] }; });
  await p2.close();
  p2 = await ctx.newPage(); p2.errs = []; p2.on('pageerror', e => p2.errs.push(e.message)); await p2.goto(L.URL); await p2.waitForTimeout(500);
  await p2.evaluate(() => window.WSE.setSpeed(0)); await L.inject(p2);
  const mg = await p2.evaluate(({ ia, ib }) => { const W = window.WSE, S = W.S, N = W.N, T = window.T, A = S.grid[ia], B = S.grid[ib];
    const own = (c, i) => { let n = 0, bad = 0; for (let j = 0; j < N * N; j++) { const q = S.grid[j]; if (q && q.t === 'part' && q.ai === i) n++; } for (let ox = 0; ox < c.w; ox++) for (let oy = 0; oy < c.h; oy++) { const q = S.grid[ia === i ? i + ox + oy * N : i + ox + oy * N]; if (!(q === c || (q && q.t === 'part' && q.ai === i))) bad++; } return { n, bad }; };
    const oa = own(A, ia), ob = own(B, ib); T.stepN(30, true);
    return { ta: A.t, tb: B.t, wa: [A.w, A.h, A.lg], wb: [B.w, B.h, B.lg], oa, ob, need: [W.dc.need(A), W.dc.need(B)], av: [A._avail, B._avail], rev: [A.pRev, B.pRev], nan: T.scan() };
  }, prep);
  t.check('migration : anciens data centers 1×1 et 2×2 conservés à leur emprise d\'origine (aucun chevauchement)', mg.ta === 'dc' && mg.tb === 'dc' && mg.wa[0] === 1 && mg.wa[1] === 1 && mg.wb[0] === 2 && mg.wb[1] === 2 && mg.oa.bad === 0 && mg.ob.bad === 0 && mg.ob.n === 3, JSON.stringify({ a: mg.wa, b: mg.wb }));
  t.check('migration : comptés pour ¼ de campus (besoin 600 MWh/j), alimentés par le réseau, recettes positives, sans NaN', mg.wa[2] === 0.25 && mg.need[0] === 600 && mg.av[0] > 0.999 && mg.rev[0] > 0 && mg.nan.length === 0 && p2.errs.length === 0, `besoin ${mg.need[0]} · recettes ${Math.round(mg.rev[0])}`);
  // aller-retour : batteries, appoint et uptime persistés
  const rt = await p2.evaluate(async () => { const W = window.WSE, S = W.S, T = window.T; const d = T.inP('dc'); d.bat = 2; d.gb = 0; T.stepN(5, true); await new Promise(r => setTimeout(r, 700)); W.save(); return { i: d.x + d.y * W.N, soc: d.soc, ct: d.ct, n: d.uph.length }; });
  await p2.close(); p2 = await ctx.newPage(); p2.errs = []; await p2.goto(L.URL); await p2.waitForTimeout(400);
  const rt2 = await p2.evaluate(i => { const c = window.WSE.S.grid[i]; return { t: c.t, w: c.w, lg: c.lg, bat: c.bat, gb: c.gb, ct: c.ct, n: (c.uph || []).length }; }, rt.i);
  t.check('sauvegarde : campus 5×4, batteries, appoint coupé, contrats et uptime relus', rt2.t === 'dc' && rt2.w === 5 && !rt2.lg && rt2.bat === 2 && rt2.gb === 0 && Math.abs(rt2.ct - rt.ct) < 0.002 && rt2.n === rt.n, JSON.stringify(rt2));
  await ctx.close();

  // ---- 5. Fiche du data center (desktop et mobile)
  for (const vp of [[1280, 800], [390, 844]]) {
    const p3 = await L.newPage({ wait: 2600, w: vp[0], h: vp[1] }); await L.inject(p3);
    await p3.evaluate(async () => { const W = window.WSE; W.startMode('free'); W.setCaste('industriel'); ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.S.noEv = true; W.setSpeed(0); W.S.cash = 3e9; W.S.unlockAll = true; try { W.mk.act('close'); } catch (e) {} });
    const pt = await p3.evaluate(() => { const W = window.WSE, T = window.T, d = T.inP('dc'); W.step(); W.step(); ['win', 'hint'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.setTool('view'); W.centerOn(d.x + 2, d.y + 2); const q = W.tileToScreen(d.x + 2, d.y + 2); return [q.x, q.y]; });
    await p3.waitForTimeout(300); await p3.mouse.click(pt[0], pt[1]); await p3.waitForTimeout(600);
    const pn = await p3.evaluate(() => { const b = document.getElementById('bview'); if (!b || b.hidden) return null; const r = b.getBoundingClientRect(), card = b.querySelector('.dccard'); return { txt: b.innerText, fits: r.left >= -1 && r.right <= innerWidth + 1, cardW: card ? card.scrollWidth <= card.clientWidth + 2 : false, bat: !!b.querySelector('[data-act="dcbat"]'), grid: !!b.querySelector('[data-act="dcgrid"]') }; });
    t.check(`fiche (${vp[0]} px) : puissance requise/reçue, uptime 30 jours, sources, coût, conseils, batteries, appoint`, pn && /Puissance requise/.test(pn.txt) && /Uptime 30 jours/i.test(pn.txt) && /Coût de l'électricité/.test(pn.txt) && /Conseils/i.test(pn.txt) && /tes centrales/.test(pn.txt) && pn.bat && pn.grid, pn ? '' : 'fiche fermée');
    t.check(`fiche (${vp[0]} px) : propre (aucun NaN) et dans l'écran`, pn && !/NaN|undefined|Infinity|\[object/.test(pn.txt) && pn.fits && pn.cardW && !p3.errs.length, p3.errs.slice(0, 2).join(';'));
    if (vp[0] < 500) { const tg = await p3.evaluate(async () => { const b = document.querySelector('#bview [data-act="dcgrid"]'); b.click(); await new Promise(r => setTimeout(r, 100)); let d; const S = window.WSE.S; S.grid.forEach(c => { if (c && c.t === 'dc') d = c; }); return d.gb; }); t.check('mobile : le bouton « Appoint réseau » bascule l\'alimentation', tg === 0, ''); }
    await p3.screenshot({ path: (process.env.WSE_SHOTS || '/tmp') + `/t56_fiche_${vp[0]}.png` }).catch(() => {});
    await p3.context().close();
  }
};
