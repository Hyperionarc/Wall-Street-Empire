// Passe 100 : transparence des bâtiments devant (occlusion de la vue isométrique, demande de Rémy).
// Cible = bâtiment survolé / sélectionné, emprise de pose, objet visé par un outil ; les bâtiments dessinés après elle (ordre de profondeur iso) dont la silhouette
// la recouvre deviennent semi-transparents (alpha 0,30-0,45, fondu ~120 ms) avec un liseré ; sol, routes et véhicules restent opaques.
// Réglage mémorisé Auto / Toujours / Jamais (localStorage wse-occ), Alt maintenu = rayon de 4 cases, appui long au doigt. Captures avant / après dans WSE_SHOTS.
exports.name = 'Transparence des bâtiments devant (passe 100)';
const SHOTS = process.env.WSE_SHOTS || '/tmp';
const raf = pg => pg.evaluate(() => new Promise(r => requestAnimationFrame(() => r())));
const frames = async (pg, n) => { for (let i = 0; i < n; i++) await raf(pg); };
const clean = pg => pg.evaluate(() => { ['win', 'hint', 'mkview', 'caste', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); });

exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 2600, w: 1280, h: 800 });
  await pg.evaluate(() => { window.WSE.startMode('free'); });
  await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  // ---- 1. Scène : une pharmacie posée juste derrière une tour (case avant x+1, y+1)
  const sc = await pg.evaluate(async () => {
    const W = window.WSE, S = W.S, N = W.N; ['win', 'hint', 'modesel', 'caste', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    const ph = W.TYPES.spharma, pw = ph.w || 1, phh = ph.h || 1; let P = null;
    for (let y = 16; y < 44 && !P; y++) for (let x = 16; x < 44 && !P; x++) {
      if (W.footprintError(x, y, 'spharma') || W.footprintError(x + pw, y + phh, 'tech')) continue;
      if (W.place(x, y, 'spharma')) { if (W.place(x + pw, y + phh, 'tech')) P = { x, y, fx: x + pw, fy: y + phh }; else W.S.grid[y * N + x] = null; }
    }
    if (!P) return null;
    try { W.autoConnect(P.x, P.y); W.autoConnect(P.fx, P.fy); } catch (e) {}
    const tw = S.grid[P.fy * N + P.fx]; tw.floors = 9; tw.lvl = 2; tw.born = -1e9;   /* niveau 2 : une vraie tour (tour_tech) ; au niveau 0 le sprite est un immeuble de bureaux bas, qui ne masque plus assez la pharmacie de quartier (3 niveaux, cohérence esthétique) */
    S.grid[P.y * N + P.x].born = -1e9;
    W.setTool('view'); W.view.setZ(0.8); W.centerOn(P.x, P.y); return P;
  });
  t.check('scène de test : pharmacie posée derrière une tour Tech', !!sc, JSON.stringify(sc));
  if (!sc) { await pg.context().close(); return; }
  await frames(pg, 6);
  const api = await pg.evaluate(() => { const O = window.WSE.occ; return !!O && typeof O.setMode === 'function' && O.A >= 0.3 && O.A <= 0.45 && O.AX >= 0.3 && O.AX <= 0.45 && O.R >= 3 && O.R <= 5 && O.FADE >= 80 && O.FADE <= 200; });
  t.check('window.WSE.occ : alpha 0,30-0,45, rayon Alt ≈ 4 cases, fondu ≈ 120 ms', api);

  // capture AVANT (réglage Jamais : la tour masque la pharmacie)
  await pg.evaluate(p => { const O = window.WSE.occ; O.setMode('never'); O.hover(p.x, p.y); }, sc); await frames(pg, 8);
  const off = await pg.evaluate(() => ({ n: window.WSE.occ.list().length, d: window.WSE.occ.drawn }));
  t.check('réglage Jamais : aucun bâtiment transparent', off.n === 0 && off.d === 0, JSON.stringify(off));
  await clean(pg); await frames(pg, 2); await pg.screenshot({ path: SHOTS + '/t100_avant.png' }).catch(() => {});

  // ---- 2. Auto : survol de la pharmacie → la tour de devant devient transparente
  await pg.evaluate(() => window.WSE.occ.setMode('auto'));
  await raf(pg);
  const st0 = await pg.evaluate(p => { const W = window.WSE, O = W.occ, l = O.list(), tw = l.find(o => o.x === p.fx && o.y === p.fy), tg = W.S.grid[p.y * W.N + p.x];
    return { l, tw: !!tw, self: l.some(o => o.x === p.x && o.y === p.y), front: l.every(o => O.key(o) > O.key(tg)), road: l.some(o => o.t === 'road'), park: l.some(o => o.k === 'park') }; }, sc);
  t.check('Auto + survol : la tour qui masque la pharmacie est dans les masquants', st0.tw, st0.l.map(o => o.t + '@' + o.x + ',' + o.y).join(' '));
  t.check('la cible elle-même reste opaque, tous les masquants sont DEVANT (clé de profondeur iso supérieure)', !st0.self && st0.front);
  t.check('sol, routes et parcs jamais rendus transparents', !st0.road && !st0.park);
  await pg.waitForTimeout(40);
  const mid = await pg.evaluate(p => { const o = window.WSE.occ.list().find(q => q.x === p.fx && q.y === p.fy); return o ? o.f : null; }, sc);
  await pg.waitForTimeout(260);
  const end = await pg.evaluate(p => { const O = window.WSE.occ, o = O.list().find(q => q.x === p.fx && q.y === p.fy); return { f: o ? o.f : null, A: O.A, d: O.drawn, ms: O.ms }; }, sc);
  t.check('fondu doux : opacité intermédiaire après ~40 ms, puis alpha cible après ~300 ms', mid != null && mid < 1 && mid > end.A - 1e-6 && Math.abs(end.f - end.A) < 1e-6, `${mid && mid.toFixed(2)} → ${end.f}`);
  t.check('la tour est effectivement dessinée à travers le calque (globalAlpha)', end.d >= 1, `dessinés ${end.d} · ${end.ms.toFixed(2)} ms`);
  await clean(pg); await frames(pg, 2); await pg.screenshot({ path: SHOTS + '/t100_apres.png' }).catch(() => {});
  const sg = await pg.evaluate(() => window.WSE.sign.drawn.length);
  t.check('enseignes toujours posées pendant la transparence', sg >= 1, sg + ' plaques');

  // ---- 3. Sortie de la cible : retour progressif à l'opacité
  await pg.evaluate(() => window.WSE.occ.hover(null)); await pg.waitForTimeout(350);
  const back = await pg.evaluate(() => ({ n: window.WSE.occ.list().length, d: window.WSE.occ.drawn, f: window.WSE.occ.OCC.fade.size }));
  t.check('survol quitté : plus aucun masquant, fondu terminé', back.n === 0 && back.f === 0 && back.d === 0, JSON.stringify(back));

  // ---- 4. Bâtiment sélectionné (sans survol)
  const sel = await pg.evaluate(async p => { const O = window.WSE.occ; O.select(p.x, p.y); O.compute(); const r = O.list().some(o => o.x === p.fx && o.y === p.fy); O.select(null); return r; }, sc);
  t.check('bâtiment sélectionné : sa tour de devant devient transparente', sel);

  // ---- 5. Outils : Rachat / Démolir / Améliorer, emprise de pose
  const tools = await pg.evaluate(p => { const W = window.WSE, O = W.occ, r = {}; O.hover(p.x, p.y);
    ['bull', 'up', 'buyout', 's1'].forEach(k => { W.setTool(k); O.compute(); r[k] = O.list().some(o => o.x === p.fx && o.y === p.fy); });
    W.setTool('view'); O.hover(null); return r; }, sc);
  t.check('Démolir / Améliorer / Rachat visant la pharmacie : la tour de devant devient transparente', tools.bull && tools.up && tools.buyout, JSON.stringify(tools));
  t.check('emprise de pose (outil de construction) derrière la tour : la tour devient transparente', tools.s1, JSON.stringify(tools));

  // ---- 6. Toujours : aussi sur une case vide ; Auto : rien sur une case vide en mode Vue
  const emp = await pg.evaluate(p => { const W = window.WSE, O = W.occ, S = W.S, N = W.N; const tw = S.grid[p.fy * N + p.fx], tg = S.grid[p.y * N + p.x];
    S.grid[p.y * N + p.x] = null; O.hover(p.x, p.y); O.setMode('auto'); O.compute(); const a = O.list().length; O.setMode('always'); O.compute(); const b = O.list().some(o => o.x === p.fx && o.y === p.fy);
    S.grid[p.y * N + p.x] = tg; O.setMode('auto'); O.hover(null); return { a, b, tw: !!tw }; }, sc);
  t.check('case vide survolée : rien en Auto, la tour de devant devient transparente en Toujours', emp.a === 0 && emp.b, JSON.stringify(emp));

  // ---- 7. Alt maintenu : tous les bâtiments à ≈ 4 cases ; appui long au doigt : idem
  await pg.evaluate(p => { const O = window.WSE.occ; O.hover(p.x, p.y); }, sc);
  await pg.keyboard.down('Alt'); await frames(pg, 3);
  const alt = await pg.evaluate(p => { const O = window.WSE.occ, l = O.list(); return { n: l.length, far: l.filter(o => Math.hypot(o.x - p.x, o.y - p.y) > O.R + 0.6).length, A: l.length ? l[0].A : null, alt: O.OCC.alt }; }, sc);
  await pg.keyboard.up('Alt'); await frames(pg, 2);
  const altUp = await pg.evaluate(() => window.WSE.occ.OCC.alt);
  t.check('Alt maintenu : voir à travers tous les bâtiments dans un rayon de ≈ 4 cases (et seulement eux)', alt.alt && alt.n >= 2 && alt.far === 0 && alt.A >= 0.3 && alt.A <= 0.45, JSON.stringify(alt));
  t.check('Alt relâché : retour au mode Auto', altUp === false);
  const tch = await pg.evaluate(p => { const O = window.WSE.occ; O.hover(null); O.touch(p.x, p.y, 2000); O.compute(); const n = O.list().length; O.touch(null); O.compute(); return { n, n2: O.list().length }; }, sc);
  t.check('appui long (tactile) : même transparence autour du doigt', tch.n >= 2 && tch.n2 === 0, JSON.stringify(tch));

  // ---- 8. Réglage mémorisé et bouton du HUD
  const mem = await pg.evaluate(() => { const O = window.WSE.occ, b = document.getElementById('occb'); b.click(); const m1 = O.mode, ls1 = localStorage.getItem('wse-occ'); b.click(); const m2 = O.mode, txt = b.textContent; b.click(); return { m1, ls1, m2, txt, m3: O.mode }; });
  t.check('bouton « Transparence » : Auto → Toujours → Jamais → Auto, mémorisé dans localStorage (wse-occ)', mem.m1 === 'always' && mem.ls1 === 'always' && mem.m2 === 'never' && /Jamais/.test(mem.txt) && mem.m3 === 'auto', JSON.stringify(mem));
  await pg.evaluate(() => window.WSE.occ.setMode('never'));
  await pg.reload(); await pg.waitForTimeout(1500);
  const rl = await pg.evaluate(() => ({ m: window.WSE.occ.mode, b: document.getElementById('occb').textContent }));
  t.check('réglage relu au rechargement de la page', rl.m === 'never' && /Jamais/.test(rl.b), JSON.stringify(rl));
  await pg.evaluate(() => window.WSE.occ.setMode('auto'));
  t.check('aucune erreur de page', !pg.errs.length, pg.errs.slice(0, 3).join(' | '));
  await pg.context().close();

  // ---- 9. Ville de 100 000 habitants : coût du calcul et du dessin, Alt actif au cœur de la ville (headless, rendu logiciel)
  const p2 = await L.newPage({ wait: 2600, w: 1280, h: 900 });
  await p2.evaluate(() => { const W = window.WSE; W.showModes(); W.startMode('round'); W.setCaste('industriel'); W.setSpeed(0); W.S.noEv = true; ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); });
  const perf = await p2.evaluate(async () => {
    const W = window.WSE, S = W.S, N = W.N, O = W.occ, raf = () => new Promise(r => requestAnimationFrame(r));
    W.cityTune({ R0: 9e-4, CAP: 8e6 }); while (S.pop < 1e5 && S.day < 3000) W.step(); W.cityTune({ R0: 5.6e-5 });
    let best = null, bn = 0; for (let y = 18; y < 42; y += 2) for (let x = 18; x < 42; x += 2) { let n = 0; for (let v = y - 4; v <= y + 4; v++) for (let u = x - 4; u <= x + 4; u++) { const c = S.grid[v * N + u]; if (c && c.t === 'npc' && c.k !== 'mon') n++; } if (n > bn) { bn = n; best = [x, y]; } }
    W.setTool('view'); W.view.setZ(0.55); W.view.centerOn(best[0], best[1]); for (let i = 0; i < 20; i++) await raf();
    const meas = async () => { const ts = []; let t = performance.now(), occ = 0; for (let i = 0; i < 40; i++) { await raf(); const u = performance.now(); ts.push(u - t); t = u; occ += O.ms; } ts.sort((a, b) => a - b); return { med: +ts[20].toFixed(1), occ: +(occ / 40).toFixed(2) }; };
    O.hover(null); const r0 = await meas();
    O.hover(best[0], best[1]); const r1 = await meas(); const n1 = O.list().length;
    O.alt(true); await raf(); await raf(); const r2 = await meas(); const n2 = O.list().length, d2 = O.drawn;
    return { pop: Math.round(S.pop), best, r0, r1, n1, r2, n2, d2 };
  });
  t.info(`100 k hab : ${JSON.stringify(perf)}`);
  t.check('ville de 100 000 habitants atteinte pour la mesure', perf.pop >= 9e4, String(perf.pop));
  t.check('survol (Auto) : image médiane ≤ 1,25 × sans transparence (+5 ms)', perf.r1.med <= perf.r0.med * 1.25 + 5, `${perf.r0.med} → ${perf.r1.med} ms · ${perf.n1} masquants · ${perf.r1.occ} ms dont leur dessin`);
  t.check('Alt actif au cœur de la ville : ≥ 10 bâtiments transparents, image ≤ 2,5 × sans transparence (rendu logiciel headless)', perf.n2 >= 10 && perf.r2.med <= perf.r0.med * 2.5, `${perf.r0.med} → ${perf.r2.med} ms · ${perf.n2} masquants · ${perf.d2} dessinés · ${perf.r2.occ} ms dont leur dessin`);
  await clean(p2); await p2.screenshot({ path: SHOTS + '/t100_alt_ville.png' }).catch(() => {});
  await p2.evaluate(() => { window.WSE.occ.alt(false); window.WSE.occ.hover(null); });
  t.check('aucune erreur de page (ville 100 k)', !p2.errs.length, p2.errs.slice(0, 3).join(' | '));
  await p2.context().close();
};
