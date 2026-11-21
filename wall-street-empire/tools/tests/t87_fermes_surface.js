// Passe 87 : surface variable des fermes (retour de Rémy : « on ne cultive pas du blé sur un enclos avec 50 vaches »). Corps de ferme + champs ou pâturages annexés (« Agrandir la ferme »).
// Vérifie : rentabilité par taille (petite ferme faible ou négative, ferme étendue ≥ rendement par case de la passe 85, pas d'emballement), agrandissement payant (aménagement + terrain),
// effectif sous-linéaire, têtes ∝ pâturage (50 vaches ≈ 25 cases), panneau (surface, ha, seuil, gain marginal, bouton), blocage, sauvegarde (ferme agrandie relue, ancienne 3×3 intacte),
// rival agriculteur qui agrandit ses terres, dessin (effets dans l'emprise, annexes HD, bêtes proportionnelles).
exports.name = 'Fermes : surface variable et rentabilité par taille';
exports.run = async (t, L) => {
  let pg = await L.newPage({ wait: 2600 }); await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, { cash: 5e9, noAid: true }); await L.inject(pg);
  const A = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, T = window.T, FX = W.farmx, o = {};
    const room = (x0, y0, m) => { for (let y = y0; y < y0 + m; y++) for (let x = x0; x < x0 + m; x++) { if (x >= N || y >= N) return false; const j = y * N + x, d = S.dep[j]; if (W.ZONE[j] !== 0 || S.grid[j] || (d && !W.CROPS[d.k]) || (S.npcFarm && S.npcFarm[j])) return false; } return true; };
    const site = (key, skip) => { let best = null; for (let i = 0; i < N * N; i++) { const x = i % N, y = (i / N) | 0; if (skip && skip(x, y)) continue; if (!room(x, y, 9) || W.footprintError(x, y, key)) continue; const d = Math.abs(x - 75) + Math.abs(y - 69); if (!best || d < best[0]) best = [d, x, y]; } return best; };
    for (let i = 0; i < 12; i++) T.put('res', 14, 44, 14, 44);
    const s1 = site('fwheat'); if (!s1) return { err: 'pas de site' };
    W.place(s1[1], s1[2], 'fwheat'); const c = S.grid[s1[2] * N + s1[1]]; o.base = [c.w, c.h];
    const pre = () => { S.macro.phase = Math.PI; S.macro.boom = 0; };
    const meas = (D) => { const q = { rev: 0, cost: 0, fc: 0 }; for (let i = 0; i < 40; i++) { pre(); W.step(); } for (let i = 0; i < D; i++) { pre(); W.step(); q.rev += c.pRev || 0; q.fc += (c.wages || 0) + (c.upk || 0); q.cost += (c.wages || 0) + (c.upk || 0) + (c.transport || 0) + (c.inCost || 0); } q.rev /= D; q.cost /= D; q.fc /= D; q.eb = q.rev - q.cost; q.A = c.w * c.h; q.jobs = W.jobsOf(c); q.K = FX.costK(c); q.old = (q.rev - q.cost + q.fc - q.fc / q.K * q.A / 9) / q.A; return q; };   // old : même ferme, mêmes jours, au barème d'avant (salaires et entretien d'un 3×3 × A / 9)
    // devis et paiement d'un agrandissement (avant la route : la route de raccordement contourne les terres d'agrandissement)
    const q0 = FX.quote(c); o.q0 = q0.ok ? { n: q0.n, build: q0.build, land: q0.land, side: q0.side } : q0.why;
    const cash0 = S.cash; const g = FX.grow(c); o.pay = g ? Math.round(cash0 - S.cash - g.cost) : null; o.after = [c.w, c.h]; o.cellCost = W.TYPES.fwheat.cellCost;
    try { W.autoConnect(c.x, c.y); } catch (e) { }
    // retour au corps de ferme : mesure à 9, 25, 36 et 64 cases (même site, même ferme ; agrandissement gratuit pour la mesure)
    S.grid.forEach((q, j) => { if (q && q.t === 'part' && q.ai === c.x + c.y * N && (q.ox >= 3 || q.oy >= 3)) S.grid[j] = null; }); c.w = 3; c.h = 3; delete c._fe;
    const R = {}; [9, 25, 36, 64].forEach(A => { let n = 0; while (c.w * c.h < A && n++ < 20 && FX.grow(c, 'free')); R[A] = meas(40); });
    o.R = R; o.K9 = FX.costKA('fwheat', 9); o.audit = W.fp.audit();
    // panneau à 64 cases
    W.openBuilding(c.x, c.y); const el = document.querySelector('#bbody .fsize'); o.txt = el ? el.innerText.replace(/\s+/g, ' ') : ''; o.plan = !!document.querySelector('#bbody .fplan'); o.planTxt = (document.querySelector('#bbody .fplan') || { innerText: '' }).innerText; W.closeBuilding();
    // dessin : effets de la ferme agrandie (zone utile, annexes, aucune coordonnée non finie)
    const fe = FX.ext(c), pr = FX.probe(c, 1000, 1.3), iso = W.gfx.iso;
    o.fe = fe ? { ann: fe.ann.map(q => q[2]), bw: fe.bw } : null; o.probe = pr.bad;
    const L0 = iso(c.x, c.y + c.h).x, R0 = iso(c.x + c.w, c.y).x, B0 = iso(c.x + c.w, c.y + c.h).y; o.box = [pr.box[0] >= L0 - 20, pr.box[2] <= R0 + 20, pr.box[3] <= B0 + 20];
    // élevage : 50 vaches ≈ 25 cases, troupeau dessiné proportionnel
    const s2 = site('fcattle', (x, y) => x >= c.x - 10 && x < c.x + 10 && y >= c.y - 10 && y < c.y + 10); W.place(s2[1], s2[2], 'fcattle'); const h = S.grid[s2[2] * N + s2[1]]; h.hd = 1;
    o.cow4 = Math.round(W.TYPES.fcattle.live.head * FX.areaK(h)); let n = 0; while (h.w * h.h < 25 && n++ < 20 && FX.grow(h, 'free')); o.cowA = h.w * h.h; o.cow25 = Math.round(W.TYPES.fcattle.live.head * FX.areaK(h));
    const fh = FX.ext(h); o.cowAnn = fh ? fh.ann.length : 0; o.cowProbe = FX.probe(h, 1000, 1.3).bad;
    W.openBuilding(h.x, h.y); o.herdTxt = (document.querySelector('#bbody') || { innerText: '' }).innerText.replace(/\s+/g, ' '); W.closeBuilding();
    // blocage : une route à l'est et au sud
    const s3 = site('fcorn', (x, y) => (x >= c.x - 10 && x < c.x + 10 && y >= c.y - 10 && y < c.y + 10) || (x >= h.x - 8 && x < h.x + 8 && y >= h.y - 8 && y < h.y + 8)); W.place(s3[1], s3[2], 'fcorn'); const k = S.grid[s3[2] * N + s3[1]];
    for (let i = 0; i < 4; i++) { W.place(k.x + 3, k.y + i, 'road'); W.place(k.x + i, k.y + 3, 'road'); }
    const qb = FX.quote(k); o.block = qb.ok ? 'ok' : qb.why;
    // rival agriculteur : ses fermes s'agrandissent sur les terres voisines de même culture
    const dep = []; for (let i = 0; i < N * N; i++) { const d = S.dep[i]; if (d && d.k === 'corn' && !S.grid[i] && !(S.npcFarm && S.npcFarm[i])) dep.push(i); }
    S.npcFarm = S.npcFarm || {}; const i0 = dep.find(i => dep.indexOf(i + 1) >= 0); if (i0 != null) { S.npcFarm[i0] = { o: 'Test Agri', g: 'corn' }; }
    const nf0 = Object.values(S.npcFarm).filter(q => q.o === 'Test Agri').length, gr = FX.npcGrow('Test Agri'), nf1 = Object.values(S.npcFarm).filter(q => q.o === 'Test Agri').length; o.npc = [nf0, gr, nf1];
    o.scan = T.scan(); return o;
  });
  if (A.err) { t.check('site de mesure', false, A.err); await pg.context().close(); return; }
  const R = A.R, pc = q => q.eb / q.A;
  t.info('rentabilité par taille (blé, même site, au cours du marché) : ' + [9, 25, 36, 64].map(a => `${R[a].A} cases ${Math.round(R[a].eb / R[a].rev * 100)} % (${Math.round(pc(R[a]))} $/case/j, barème d\'avant ${Math.round(R[a].old)})`).join(' · '));
  t.check('corps de ferme 3×3 de départ, agrandi d\'une rangée de 3 cases (aménagement + terrain payés)', A.base[0] === 3 && A.base[1] === 3 && A.q0 && A.q0.n === 3 && (A.after[0] * A.after[1]) === 12 && A.pay === 0 && A.q0.build > 0 && A.q0.build >= 3 * A.cellCost * 0.99 && A.q0.build <= 3 * A.cellCost * 1.15, JSON.stringify({ q0: A.q0, after: A.after, pay: A.pay }));
  t.check('petite ferme (9 cases, 20 ha) : EBITDA faible ou négatif (< 8 % des recettes)', R[9].eb / R[9].rev < 0.08, `${(R[9].eb / R[9].rev * 100).toFixed(1)} %`);
  t.check('ferme étendue (36 et 64 cases) : rendement par case ≥ celui d\'avant (même ferme, mêmes jours, barème de la passe 85)', pc(R[36]) >= R[36].old && pc(R[64]) >= R[64].old, `${Math.round(pc(R[36]))} ≥ ${Math.round(R[36].old)} et ${Math.round(pc(R[64]))} ≥ ${Math.round(R[64].old)} $/case/j`);
  t.check('au cours du marché, la ferme de 64 cases rapporte par case au moins autant que le corps de ferme seul au barème d\'avant', pc(R[64]) >= R[9].old * 0.95, `${Math.round(pc(R[64]))} contre ${Math.round(R[9].old)} $/case/j`);
  t.check('gain par case borné (64 cases : moins de 2× le rendement par case d\'avant) et croissant avec la taille', pc(R[64]) < 2 * R[9].old && pc(R[9]) < pc(R[25]) && pc(R[25]) < pc(R[64]), [9, 25, 36, 64].map(a => Math.round(pc(R[a]))).join(' < '));
  t.check('effectif sous-linéaire : 64 cases emploient moins de 7× un corps de ferme de 9', R[64].jobs / R[9].jobs < 64 / 9 && R[64].jobs > R[9].jobs * 2, (R[64].jobs / R[9].jobs).toFixed(2));
  t.check('emprises cohérentes après agrandissements (aucun chevauchement)', A.audit.length === 0, A.audit.slice(0, 2).join(' ; '));
  const tx = A.txt;
  t.check('panneau : surface en cases et en hectares, seuil de rentabilité, gain marginal, bouton Agrandir', /64 cases · 144 ha/.test(tx) && /rentable (à partir de \d+ cases \(\d+ ha\)|dès le corps de ferme)/.test(tx) && /Gain marginal|taille maximale/i.test(tx) && /Taille maximale|Agrandir la ferme/.test(tx), tx.slice(0, 200));
  t.check('panneau : le bloc « ce que tu optimises » (dates imposées) est toujours là', A.plan && /imposées/.test(A.planTxt), '');
  t.check('panneau : aucun NaN / undefined', !L.BAD_TXT.test(tx + A.herdTxt), ((tx + A.herdTxt).match(L.BAD_TXT) || [''])[0]);
  t.check('dessin : effets de la ferme agrandie finis et dans la parcelle, annexes HD', A.probe === 0 && A.box.every(Boolean) && A.fe && A.fe.ann.length >= 3 && A.fe.ann.every(n => /^bat_/.test(n)), JSON.stringify({ box: A.box, ann: A.fe && A.fe.ann }));
  t.check('élevage : 8 vaches sur 4 cases, 50 vaches sur 25 cases (têtes ∝ pâturage), annexes et troupeau dessinés', A.cow4 === 8 && A.cowA === 25 && A.cow25 === 50 && A.cowAnn >= 2 && A.cowProbe === 0 && /50 vaches/.test(A.herdTxt), JSON.stringify({ c4: A.cow4, A: A.cowA, c25: A.cow25, ann: A.cowAnn }));
  t.check('agrandissement bloqué par des routes à l\'est et au sud : refus expliqué', A.block !== 'ok' && /route/.test(A.block), A.block);
  t.check('rival agriculteur : agrandit ses terres (cases voisines de même culture)', A.npc[1] > 0 && A.npc[2] === A.npc[0] + A.npc[1], JSON.stringify(A.npc));
  t.check('état numérique sain (aucun NaN)', A.scan.length === 0, A.scan.slice(0, 3).join(', '));
  t.check('page : 0 erreur', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // Bouton du panneau, sauvegarde et relecture : une ferme agrandie garde son emprise ; une ferme 3×3 reste 3×3
  pg = await L.newPage({ wait: 2600 }); await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, T = window.T;
    const a = T.onDep('fwheat', 'wheat'), b = T.onDep('fvine', 'grapes'); if (!a || !b) return null; let n = 0;
    W.openBuilding(a.x, a.y); for (let i = 0; i < 3; i++) { const w0 = a.w * a.h; W.bAct('fgrow'); if (a.w * a.h > w0) n++; } W.closeBuilding();
    W.save(); return { a: [a.x, a.y, a.w, a.h], b: [b.x, b.y], n, inv: Math.round(a.invest) }; });
  await pg.reload(); await pg.waitForTimeout(2600);
  const ld = sv && await pg.evaluate(sv => { const W = window.WSE, S = W.S, N = W.N, a = S.grid[sv.a[1] * N + sv.a[0]], b = S.grid[sv.b[1] * N + sv.b[0]]; for (let i = 0; i < 5; i++) W.step();
    return { a: a && [a.t, a.w, a.h], b: b && [b.t, b.w, b.h], bad: W.fp.audit(), out: a && a.out, inv: a && Math.round(a.invest) }; }, sv);
  t.check('bouton « Agrandir la ferme » (panneau) : au moins une rangée annexée', sv && sv.n >= 1, JSON.stringify(sv));
  t.check('sauvegarde : ferme agrandie relue à son emprise, ferme 3×3 intacte, aucun chevauchement, production', !!ld && ld.a[1] === sv.a[2] && ld.a[2] === sv.a[3] && ld.b[1] === 3 && ld.b[2] === 3 && ld.bad.length === 0 && ld.out > 0 && Math.abs(ld.inv - sv.inv) <= 1, JSON.stringify({ sv, ld }));
  t.check('sauvegarde : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();
};
