// Passe 88 : agrandir une ferme malgré les obstacles (demande de Rémy) et fermes de centaines de cases (économie d'échelle émergente, aucun plafond).
// Vérifie : refus sans rachat ni défrichage (raison expliquée), devis détaillé (aménagement, terrain, rachat d'un immeuble, défrichement, bois récupéré, gravats, total, amortissement),
// direction avec le moins d'obstacles, devis = montant débité, bois livré en stock, trésorerie insuffisante refusée sans rien changer, atomicité (erreur au milieu : tout est rétabli),
// fenêtre de confirmation unique et cases en évidence, sauvegarde (emprise, forêt abattue, immeuble rasé) ; ferme de ≥ 200 cases par agrandissement en lot (devis global, sauvegarde,
// temps d'image) ; postes de coûts physiques (cour, machines, ouvriers, carburant) et rentabilité à 100, 200 et 400 cases (tableau) ; rival agriculteur qui défriche une forêt libre.
exports.name = 'Fermes : agrandissement avec rachat et défrichage, fermes de centaines de cases';
exports.run = async (t, L) => {
  const SITE = `(() => { const W = window.WSE, S = W.S, N = W.N;
    window.__room = (x0, y0, m, forest) => { for (let y = y0; y < y0 + m; y++) for (let x = x0; x < x0 + m; x++) { if (x >= N || y >= N) return false; const j = y * N + x, d = S.dep[j]; if (W.ZONE[j] !== 0 || S.grid[j] || (d && !W.CROPS[d.k] && !(forest && d.k === 'wood')) || (S.npcFarm && S.npcFarm[j])) return false; } return true; };
    window.__site = (key, m, forest, skip) => { let best = null; for (let i = 0; i < N * N; i++) { const x = i % N, y = (i / N) | 0; if (skip && skip(x, y)) continue; if (!window.__room(x, y, m, forest) || W.footprintError(x, y, key)) continue; const d = Math.abs(x - 75) + Math.abs(y - 69); if (!best || d < best[0]) best = [d, x, y]; } return best; }; })()`;
  let pg = await L.newPage({ wait: 2600 }); await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, { cash: 5e9, noAid: true }); await L.inject(pg); await pg.evaluate(SITE);
  const A = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, FX = W.farmx, o = {};
    const s1 = window.__site('fwheat', 7); if (!s1) return { err: 'pas de site' };
    W.place(s1[1], s1[2], 'fwheat'); const c = S.grid[s1[2] * N + s1[1]], x = c.x, y = c.y;
    // obstacles : une forêt dense (2 cases) sur la rangée est, un gisement de fer derrière (la 2e rangée est impossible à l'est), un immeuble de la ville (hameau) sur la rangée sud
    const HX = x + 1, HY = y + 3, hj = HY * N + HX, fj = y * N + x + 3; S.grid[hj] = { t: 'npc', k: 'house', seed: 0.3, floors: 1, lvl: 0, w: 1, h: 1, x: HX, y: HY, born: 0, alertUntil: -1, conn: true, rev: 0, out: 0, prod: null, lm: false }; S.npcOwn = S.npcOwn || {}; S.npcOwn[HX + ',' + HY] = 'npc';
    [[x + 3, y], [x + 3, y + 1]].forEach(p => { S.dep[p[1] * N + p[0]] = { k: 'wood', r: 4000 }; }); S.dep[(y + 1) * N + x + 4] = { k: 'iron', r: 5000 };
    const qf = FX.quote(c); o.free = qf.ok ? 'ok' : qf.why;
    // plan de 2 rangées avec rachat et défrichage
    const P = FX.plan(c, 2, 'clear'); o.P = P.ok ? { rows: P.rows.map(r => r.side), n: P.n, build: P.build, land: P.land, buy: P.buy, clr: P.clr, wood: P.wood, ws: P.woodStock, wsold: P.woodSold, wc: P.woodCredit, rub: P.rub, evac: P.evac, gross: P.gross, net: P.net, blds: P.blds.map(b => b.name + '@' + b.x + ',' + b.y + ':' + b.price), cl: P.cl.map(q => q.k + ':' + q.wood), hl: P.hl.length, w: P.w, h: P.h, price: P.blds[0] && P.blds[0].price } : P.why;
    o.ask = FX.ask(S.grid[hj]);
    // trésorerie insuffisante : refus, rien ne change
    const g0 = JSON.stringify([S.grid[hj] && S.grid[hj].t, S.dep[fj], c.w, c.h]); S.cash = P.gross - 1; const r0 = FX.exec(c, 2, 'clear'); o.poor = { ok: r0.ok, why: r0.why, short: r0.short, same: g0 === JSON.stringify([S.grid[hj] && S.grid[hj].t, S.dep[fj], c.w, c.h]) && S.cash === P.gross - 1 };
    // atomicité : erreur au milieu de l'exécution (livraison du bois) -> tout est rétabli
    S.cash = 5e9; let wv = S.stock.wood || 0, boom = true; Object.defineProperty(S.stock, 'wood', { configurable: true, enumerable: true, get: () => wv, set: v => { if (boom) { boom = false; throw new Error('panne'); } wv = v; } });
    const cash1 = S.cash, r1 = FX.exec(c, 2, 'clear'); o.atom = { ok: r1.ok, why: r1.why, cash: S.cash === cash1, house: !!(S.grid[hj] && S.grid[hj].t === 'npc'), forest: !!S.dep[fj], wh: [c.w, c.h], audit: W.fp.audit().length };
    Object.defineProperty(S.stock, 'wood', { configurable: true, enumerable: true, writable: true, value: wv });
    // exécution réelle : devis = montant débité ; bois en stock ; immeuble rasé ; forêt abattue
    const wood0 = S.stock.wood || 0, cash2 = S.cash, r2 = FX.exec(c, 2, 'clear', { expect: P.net });
    o.ex = { ok: r2.ok, why: r2.why, paid: cash2 - S.cash, net: P.net, wood: (S.stock.wood || 0) - wood0, house: S.grid[hj] && S.grid[hj].t, ai: S.grid[hj] && S.grid[hj].ai === x + y * N, forest: S.dep[fj], wh: [c.w, c.h], audit: W.fp.audit().length, mods: (S.npcMods || []).some(m => m[0] === HX && m[1] === HY && m[2] === 'x') };
    o.site = [x, y];
    // panneau et fenêtre de confirmation : nouvelle rangée bloquée par une forêt et un bâtiment à toi (entrepôt) -> devis avec rachat/défrichage
    S.dep[(y + c.h) * N + x + 2] = { k: 'wood', r: 3000 };
    const okWh = ['wh', 'f1', 'f2'].find(k => !W.footprintError(x, y + c.h, k) && W.place(x, y + c.h, k)); o.wh = okWh || false; o.whErr = W.footprintError(x, y + c.h, 'wh');
    W.openBuilding(x, y); const pan = document.querySelector('#bbody .fsize'); o.pan = pan ? pan.innerText.replace(/\s+/g, ' ') : '';
    const bx = document.querySelector('#bbody [data-act="fgrowx"]'); o.bx = !!bx; if (bx) bx.click();
    const box = document.getElementById('acq'); o.box = box && !box.hidden ? box.innerText.replace(/\s+/g, ' ') : ''; o.hl = (FX.hl() || []).map(q => q[2]).join('');
    const ok = box && box.querySelector('[data-ac="fqok"]'); const cash3 = S.cash, q3 = FX.plan(c, 1, 'clear'); if (ok) ok.click(); o.conf = { paid: cash3 - S.cash, net: q3.net, hidden: box.hidden, wh: [c.w, c.h] };
    W.closeBuilding();
    o.scan = window.T.scan(); W.save(); return o;
  });
  if (A.err) { t.check('site de mesure', false, A.err); await pg.context().close(); return; }
  t.info('devis 2 rangées (rachat + défrichage) : ' + JSON.stringify(A.P));
  t.check('sans rachat ni défrichage : refus expliqué (forêt défrichable et bâtiment)', A.free !== 'ok' && /forêt/.test(A.free) && /bâtiment/.test(A.free), A.free);
  const P = A.P;
  t.check('devis : 2 rangées, la première du côté le moins encombré (est : forêt plutôt que l\'immeuble au sud), puis le sud (l\'est est fermé par un gisement)', P && P.rows && P.rows[0] === 'E' && P.rows[1] === 'S' && P.w === 4 && P.h === 4, JSON.stringify(P && P.rows));
  t.check('devis : rachat de l\'immeuble au prix du marché (outil Rachat), gravats évacués', P.blds && P.blds.length === 1 && P.buy === A.ask && P.buy > 0 && P.rub > 0 && P.evac > 0, JSON.stringify({ blds: P.blds, ask: A.ask, rub: P.rub, evac: P.evac }));
  t.check('devis : défrichement de 2 cases de forêt dense, bois récupéré (80 % de la réserve)', P.cl && P.cl.filter(q => /^dense|^sapins/.test(q)).length === 2 && P.clr > 0 && P.wood >= 6400, JSON.stringify({ cl: P.cl, clr: P.clr, wood: P.wood }));
  t.check('devis : total = aménagement + terrain + rachat + défrichement + gravats ; net = total − bois vendu', Math.abs(P.gross - (P.build + P.land + P.buy + P.clr + P.evac)) < 1 && Math.abs(P.net - (P.gross - P.wc)) < 1, JSON.stringify({ gross: P.gross, net: P.net }));
  t.check('trésorerie insuffisante : refusée, rien n\'est changé', A.poor.ok === false && A.poor.why === 'cash' && A.poor.short === 1 && A.poor.same, JSON.stringify(A.poor));
  t.check('atomicité : une erreur pendant l\'exécution rétablit tout (trésorerie, immeuble, forêt, emprise)', A.atom.ok === false && A.atom.cash && A.atom.house && A.atom.forest && A.atom.wh[0] === 3 && A.atom.wh[1] === 3 && A.atom.audit === 0, JSON.stringify(A.atom));
  t.check('exécution : montant débité = devis, immeuble racheté et rasé (champ à sa place), forêt abattue, bois livré en stock', A.ex.ok && Math.abs(A.ex.paid - A.ex.net) < 1 && A.ex.house === 'part' && A.ex.ai && A.ex.mods && A.ex.forest == null && A.ex.wood >= P.ws - 1 && A.ex.wood > 0 && A.ex.wh[0] === 4 && A.ex.wh[1] === 4 && A.ex.audit === 0, JSON.stringify(A.ex));
  t.check('fiche : choix +1 / +5 / +10 rangées / maximum, postes de coûts, seuil calculé, bouton « Agrandir en rachetant/défrichant »', A.wh && /\+1 rangée/.test(A.pan) && /\+5 rangées/.test(A.pan) && /Maximum/.test(A.pan) && /cour/.test(A.pan) && /matériel/.test(A.pan) && /carburant/.test(A.pan) && /Seuil calculé/.test(A.pan) && A.bx, A.pan.slice(0, 300));
  t.check('fenêtre de confirmation unique : lignes du devis (aménagement, terrain, rachat, défrichement, bois, total, amortissement), cases en évidence', /Aménagement/.test(A.box) && /Terrain/.test(A.box) && /Rachat de 1 bâtiment/.test(A.box) && /Défrichement/.test(A.box) && /Bois récupéré/.test(A.box) && /Total à payer/.test(A.box) && /amortissement/i.test(A.box) && /b/.test(A.hl) && /w/.test(A.hl), A.box.slice(0, 400) + ' | hl=' + A.hl);
  t.check('confirmation : agrandissement exécuté, montant débité = devis, fenêtre fermée', A.conf.hidden && Math.abs(A.conf.paid - A.conf.net) < 1 && A.conf.wh[0] * A.conf.wh[1] > 16, JSON.stringify(A.conf));
  t.check('état numérique sain, 0 erreur de page', A.scan.length === 0 && pg.errs.length === 0, A.scan.slice(0, 3).join(', ') + pg.errs.slice(0, 2).join(' ; '));
  await pg.reload(); await pg.waitForTimeout(2600);
  const ld = await pg.evaluate(o => { const W = window.WSE, S = W.S, N = W.N, x = o.site[0], y = o.site[1], c = S.grid[y * N + x]; for (let i = 0; i < 3; i++) W.step();
    return { t: c && c.t, wh: c && [c.w, c.h], hs: S.grid[(y + 3) * N + x + 1] && S.grid[(y + 3) * N + x + 1].t, f: S.dep[y * N + x + 3], bad: W.fp.audit().length, out: c && c.out }; }, A);
  t.check('sauvegarde : emprise agrandie relue, immeuble toujours rasé, forêt toujours abattue, aucun chevauchement', ld.t === 'fwheat' && ld.wh[0] === A.conf.wh[0] && ld.wh[1] === A.conf.wh[1] && ld.hs === 'part' && ld.f == null && ld.bad === 0 && ld.out > 0, JSON.stringify(ld));
  t.check('sauvegarde : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // Ferme de centaines de cases : agrandissement en lot (devis global), sauvegarde, temps d'image ; postes de coûts ; rentabilité à 100, 200 et 400 cases
  pg = await L.newPage({ wait: 2600 }); await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, { cash: 5e10, noAid: true }); await L.inject(pg); await pg.evaluate(SITE);
  const B = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, FX = W.farmx, o = {};
    for (let i = 0; i < 12; i++) window.T.put('res', 14, 44, 14, 44);
    let s = window.__site('fwheat', 20, true); o.m = 20; if (!s) { s = window.__site('fwheat', 15, true); o.m = 15; } if (!s) return { err: 'pas de site 15×15' };
    W.place(s[1], s[2], 'fwheat'); const c = S.grid[s[2] * N + s[1]]; o.site = [c.x, c.y];
    const P = FX.plan(c, 24, 'clear'), cash0 = S.cash, r = FX.exec(c, 24, 'clear', { expect: P.net }); o.lot = { ok: r.ok, why: r.why, n: P.n, rows: P.rows.length, wh: [c.w, c.h], paid: cash0 - S.cash, net: P.net, cl: P.cl.length, wood: P.wood, audit: W.fp.audit().length };
    o.costs = [9, 100, 196, 400].map(A => { const w = Math.round(Math.sqrt(A)), q = FX.costs('fwheat', w, Math.round(A / w)); return { A: q.A, kU: +q.kU.toFixed(2), kJ: +q.kJ.toFixed(2), uC: +(q.U / q.A).toFixed(3), jC: +(q.J / q.A).toFixed(3), fleet: q.fn, nM: q.nM, d: +q.d.toFixed(1) }; });
    try { W.autoConnect(c.x, c.y); } catch (e) { }
    W.save(); return o;
  });
  if (B.err) { t.check('site d\'une grande ferme', false, B.err); await pg.context().close(); return; }
  t.check('ferme de ≥ 200 cases créée par agrandissement en lot (24 rangées, un devis global = montant débité)', B.lot.ok && B.lot.wh[0] * B.lot.wh[1] >= 200 && Math.abs(B.lot.paid - B.lot.net) < 1 && B.lot.audit === 0, JSON.stringify(B.lot));
  t.info('postes de coûts (blé, ferme carrée) : ' + B.costs.map(q => `${q.A} cases : entretien ${q.uC} u/case, ${q.jC} emploi-unité/case, ${q.nM} × ${q.fleet}, trajet moyen ${q.d} cases`).join(' · '));
  t.check('postes physiques : coûts par case décroissants de 9 à 100 cases (frais fixes répartis), gros matériel choisi pour les grandes fermes, trajet croissant', B.costs[0].uC > B.costs[1].uC && B.costs[0].jC > B.costs[1].jC && B.costs[3].fleet === 'gros matériel' && B.costs[3].d > B.costs[1].d, JSON.stringify(B.costs.map(q => [q.A, q.uC, q.jC, q.fleet, q.d])));
  // temps d'image avec la grande ferme à l'écran (rendu logiciel headless : comparaison à la même vue sans elle)
  const frame = async (on) => pg.evaluate(async ({ site, on }) => { const W = window.WSE, raf = () => new Promise(r => requestAnimationFrame(r)), out = {};
    ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    for (const zz of [1, 0.75, 0.45]) { W.view.setZ(zz); W.view.centerOn(site[0] + 8, site[1] + 8); for (let i = 0; i < 10; i++) await raf(); const ts = []; let t0 = performance.now(); for (let i = 0; i < 30; i++) { await raf(); const u = performance.now(); ts.push(u - t0); t0 = u; } ts.sort((a, b) => a - b); out[zz] = +ts[15].toFixed(1); }
    return out; }, { site: B.site, on });
  const fBig = await frame(true);
  await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; });
  await pg.reload(); await pg.waitForTimeout(2600);
  const ld2 = await pg.evaluate(o => { const W = window.WSE, S = W.S, N = W.N, c = S.grid[o.site[1] * N + o.site[0]]; for (let i = 0; i < 3; i++) W.step(); return { wh: c && [c.w, c.h], bad: W.fp.audit().length, out: c && c.out }; }, B);
  t.check('sauvegarde : ferme de ≥ 200 cases relue à son emprise, aucun chevauchement, production', ld2.wh && ld2.wh[0] === B.lot.wh[0] && ld2.wh[1] === B.lot.wh[1] && ld2.bad === 0 && ld2.out > 0, JSON.stringify(ld2));
  const fRef = await pg.evaluate(async ({ site }) => { const W = window.WSE, S = W.S, N = W.N, c = S.grid[site[1] * N + site[0]], raf = () => new Promise(r => requestAnimationFrame(r)), out = {};
    // même vue, la ferme ramenée à son corps de ferme (référence)
    S.grid.forEach((q, j) => { if (q && q.t === 'part' && q.ai === c.x + c.y * N && (q.ox >= 3 || q.oy >= 3)) S.grid[j] = null; }); const w0 = c.w, h0 = c.h; c.w = 3; c.h = 3; delete c._fe;
    for (const zz of [1, 0.75, 0.45]) { W.view.setZ(zz); W.view.centerOn(site[0] + 8, site[1] + 8); for (let i = 0; i < 10; i++) await raf(); const ts = []; let t0 = performance.now(); for (let i = 0; i < 30; i++) { await raf(); const u = performance.now(); ts.push(u - t0); t0 = u; } ts.sort((a, b) => a - b); out[zz] = +ts[15].toFixed(1); }
    return out; }, B);
  t.info('temps d\'image médian (ms), zoom 1 / 0,75 / 0,45 : grande ferme ' + JSON.stringify(fBig) + ' ; même vue sans elle ' + JSON.stringify(fRef));
  t.check('temps d\'image raisonnable avec une ferme de ≥ 200 cases à l\'écran (≤ 2× la même vue sans elle + 20 ms, et < 120 ms)', [1, 0.75, 0.45].every(zz => fBig[zz] <= 2 * fRef[zz] + 20 && fBig[zz] < 120), JSON.stringify({ fBig, fRef }));
  t.check('grande ferme : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // Rentabilité par taille (même site, agrandissement sans paiement pour la mesure ; cours du marché, qui baisse quand l'offre grandit)
  pg = await L.newPage({ wait: 2600 }); await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, { cash: 5e10, noAid: true }); await L.inject(pg); await pg.evaluate(SITE);
  const R = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, FX = W.farmx;
    for (let i = 0; i < 12; i++) window.T.put('res', 14, 44, 14, 44);
    // site de mesure 20×20 : le carré de campagne le plus dégagé ; ce qui le bloque encore (route de campagne, gisement) est retiré pour la mesure
    let best = null; for (let i = 0; i < N * N; i++) { const x = i % N, y = (i / N) | 0; if (x + 20 > N || y + 20 > N) continue; let bad = 0, ok = true; for (let v = 0; v < 20 && ok; v++) for (let u = 0; u < 20; u++) { const j = (y + v) * N + x + u, d = S.dep[j], g = S.grid[j]; if (W.ZONE[j] !== 0 || (S.npcFarm && S.npcFarm[j]) || (g && g.t !== 'road')) { ok = false; break; } if (g || (d && !W.CROPS[d.k] && d.k !== 'wood')) bad++; } if (ok && (!best || bad < best[0])) best = [bad, x, y]; }
    if (!best) return { err: 'pas de site 20×20' }; for (let v = 0; v < 20; v++) for (let u = 0; u < 20; u++) { const j = (best[2] + v) * N + best[1] + u; if (S.grid[j]) S.grid[j] = null; const d = S.dep[j]; if (d && !W.CROPS[d.k] && d.k !== 'wood') S.dep[j] = null; }
    const s = best;
    W.place(s[1], s[2], 'fwheat'); const c = S.grid[s[2] * N + s[1]]; try { W.autoConnect(c.x, c.y); } catch (e) { }
    const pre = () => { S.macro.phase = Math.PI; S.macro.boom = 0; };
    const meas = D => { const q = { rev: 0, cost: 0, pr: 0, sold: 0 }; for (let i = 0; i < 30; i++) { pre(); W.step(); } for (let i = 0; i < D; i++) { pre(); W.step(); q.rev += c.pRev || 0; q.cost += (c.wages || 0) + (c.upk || 0) + (c.transport || 0) + (c.inCost || 0); q.pr += S.price.wheat; q.out = (q.out || 0) + (c.out || 0); } ['rev', 'cost', 'pr', 'out'].forEach(k => q[k] /= D); q.eb = q.rev - q.cost; q.A = c.w * c.h; q.jobs = W.jobsOf(c); return q; };
    const out = {}; [9, 100, 196, 400].forEach(A => { let n = 0; while (c.w * c.h < A && n++ < 60 && FX.grow(c, { free: true, mode: 'clear' })); out[A] = meas(40); out[A].E = FX.econ(c); out[A].E = { be: out[A].E.be, marg: out[A].E.marg }; });
    return out;
  });
  if (R.err) { t.check('site 20×20', false, R.err); await pg.context().close(); return; }
  const ks = [9, 100, 196, 400];
  t.info('rentabilité (blé, 360 j ≈ ' + ks.map(k => `${R[k].A} cases (${Math.round(R[k].A * 2.25)} ha) : EBITDA ${Math.round(R[k].eb * 360 / 1e6)} M$/an, ${Math.round(R[k].eb / R[k].rev * 100)} % des recettes, ${Math.round(R[k].eb / R[k].A)} $/case/j, cours ${R[k].pr.toFixed(2)} $, ${Math.round(R[k].jobs)} emplois, seuil calculé ${R[k].E.be}`).join(' · '));
  t.check('économie d\'échelle émergente : marge de 100 cases > marge du corps de ferme ; grande ferme rentable', R[100].eb / R[100].rev > R[9].eb / R[9].rev && R[400].eb > 0 && R[196].eb > 0, ks.map(k => (R[k].eb / R[k].rev * 100).toFixed(1) + ' %').join(' · '));
  t.check('pas de gain absurde : l\'EBITDA par case à 400 cases reste < 1,6× celui de 100 cases (cours, trajets)', R[400].eb / R[400].A < 1.6 * R[100].eb / R[100].A, `${Math.round(R[400].eb / R[400].A)} contre ${Math.round(R[100].eb / R[100].A)} $/case/j`);
  t.check('le cours local réagit à l\'offre : il baisse (ou ne monte pas) quand la ferme passe de 100 à 400 cases', R[400].pr <= R[100].pr * 1.001, `${R[100].pr.toFixed(3)} -> ${R[400].pr.toFixed(3)}`);
  t.check('mesure : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // Rival agriculteur sans terre de sa culture autour : il défriche une forêt libre voisine (déterministe)
  pg = await L.newPage({ wait: 2600 }); await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const V = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, FX = W.farmx; S.npcFarm = S.npcFarm || {};
    let i0 = -1; for (let i = N + 1; i < N * N - N - 1; i++) { const d = S.dep[i]; if (!d || d.k !== 'wood' || S.grid[i] || W.ZONE[i] !== 0) continue; i0 = i; break; } if (i0 < 0) return null;
    const j = i0; S.dep[j] = { k: 'corn', r: 1000 }; S.npcFarm[j] = { o: 'Test Bois', g: 'corn' };
    const nb = [j + 1, j - 1, j + N, j - N].filter(q => S.dep[q] && S.dep[q].k === 'wood' && !S.grid[q] && W.ZONE[q] === 0 && !S.npcFarm[q]);
    [j + 1, j - 1, j + N, j - N].forEach(q => { if (S.dep[q] && S.dep[q].k === 'corn') S.dep[q] = { k: 'wood', r: 4000 }; });
    const nb2 = [j + 1, j - 1, j + N, j - N].filter(q => S.dep[q] && S.dep[q].k === 'wood' && !S.grid[q] && W.ZONE[q] === 0 && !S.npcFarm[q]);
    const g = FX.npcGrow('Test Bois'); return { nb: nb2.length, g, conv: nb2.filter(q => S.dep[q] && S.dep[q].k === 'corn' && S.npcFarm[q]).length }; });
  t.check('rival agriculteur : défriche une forêt libre voisine quand il n\'a plus de terre de sa culture (déterministe)', V && V.nb > 0 && V.g === V.conv && V.g > 0, JSON.stringify(V));
  await pg.context().close();
};
