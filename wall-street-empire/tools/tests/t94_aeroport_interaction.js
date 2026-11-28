// Passe 94 : retours de Rémy sur l'aéroport. Trafic aérien animé (atterrissages et décollages à intervalles irréguliers, au plus 2 mouvements simultanés,
// un seul avion sur la piste, avion au contact par moments, cadence liée au trafic, déterministe), parking d'aéroport et aérogare à vitrines,
// interaction : survol (curseur main + « Aéroport · Entrer »), clic = vue intérieure avec le bouton d'ouverture visible sans défiler, statistiques repliables,
// grande croix et Échap ; même principe pour le Mall central.
exports.name = 'Aéroport : animations, parking, entrer dans l\'aérogare (passe 94)';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 2200, w: 1280, h: 800 }); await L.setup(pg, { cash: 3e7 });
  await pg.evaluate(async () => { const W = window.WSE; ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    const b = document.querySelector('[data-sg="close"]'); if (b) b.click(); try { W.mk.act('close'); } catch (e) {} W.step(); W.setTool('view'); });

  // ---- 1. Trafic aérien (horloge d'animation, sans aléa)
  const an = await pg.evaluate(() => {
    const A = window.WSE.air, pax = A.pax(), H = 7200, tl = A.timeline(0, H), st = tl.map(e => e.t0).sort((a, b) => a - b), gaps = st.slice(1).map((v, i) => v - st[i]);
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length, sd = Math.sqrt(gaps.reduce((a, b) => a + (b - mean) * (b - mean), 0) / gaps.length);
    let maxMov = 0, maxRw = 0, calmPark = 0, two = 0, n = 0; const sk = 0.25;
    for (let T = 0; T < H; T += sk) { const s = A.state(T); n++; maxMov = Math.max(maxMov, s.mov.length); if (s.mov.length === 2) two++;
      const rw = s.mov.filter(m => Math.abs(m.v - 0.52) < 0.12 && m.u > 0 && m.u < 6 && m.z < 40).length; maxRw = Math.max(maxRw, rw); if (!s.mov.length && s.park.length) calmPark++; }
    let same = 0, run = 0; for (let i = 1; i < gaps.length; i++) { if (Math.abs(gaps[i] - gaps[i - 1]) < 1) { run++; same = Math.max(same, run); } else run = 0; }
    const arr = tl.filter(e => e.k === 'arr'), dep = tl.filter(e => e.k === 'dep');
    const ea = arr[0], ed = dep[0], a0 = A.state(ea.t0 + 0.2).mov.find(m => m.k === 'arr'), a1 = A.state(ea.t0 + ea.dur - 0.05).mov.find(m => m.k === 'arr'), d0 = A.state(ed.t0 + 0.2).mov.find(m => m.k === 'dep'), d1 = A.state(ed.t0 + ed.dur - 0.3).mov.find(m => m.k === 'dep');
    const midA = []; for (let x = 0.05; x < 1; x += 0.05) { const m = A.state(ea.t0 + ea.dur * x).mov.find(q => q.k === 'arr'); if (m) midA.push(m.z); }
    const big = A.timeline(0, H, pax * 4), same2 = JSON.stringify(A.timeline(0, H)) === JSON.stringify(tl);
    return { pax, n: tl.length, perH: tl.length / (H / 3600), bigPerH: big.length / (H / 3600), gmin: Math.min(...gaps), gmax: Math.max(...gaps), cv: sd / mean, distinct: new Set(gaps.map(g => Math.round(g))).size, ng: gaps.length, same, mode: Math.max(...Object.values(gaps.reduce((o, g) => { const k = Math.round(g); o[k] = (o[k] || 0) + 1; return o; }, {}))),
      nArr: arr.length, nDep: dep.length, maxMov, maxRw, calm: calmPark / n, two: two / n, det: same2, a0, a1, d0, d1, touch: midA.some(z => z === 0) && midA[0] > 50 };
  });
  t.check('atterrissages ET décollages (les deux présents, en nombre comparable)', an.nArr >= 5 && an.nDep >= 5 && Math.abs(an.nArr - an.nDep) <= 2, `${an.nArr} atterrissages, ${an.nDep} décollages en 2 h`);
  t.check('intervalles irréguliers (coefficient de variation > 0,35, écarts variés, aucun écart dominant, jamais 3 écarts égaux de suite)', an.cv > 0.35 && an.distinct >= 0.4 * an.ng && an.mode <= 0.12 * an.ng && an.same < 2, `cv ${an.cv.toFixed(2)} · ${an.distinct}/${an.ng} écarts distincts (à la seconde) · le plus fréquent ×${an.mode} · écarts ${an.gmin.toFixed(1)}–${an.gmax.toFixed(1)} s`);
  t.check('jamais plus de 2 mouvements simultanés, jamais 2 avions sur la piste', an.maxMov <= 2 && an.maxRw <= 1, `max ${an.maxMov} mouvements, ${an.maxRw} sur la piste · 2 à la fois ${(an.two * 100).toFixed(0)} % du temps`);
  t.check('des moments calmes avec un avion garé au contact de l\'aérogare', an.calm > 0.15, `${(an.calm * 100).toFixed(0)} % du temps`);
  t.range('cadence plausible au trafic de départ (mouvements par heure d\'animation)', an.perH, 20, 110, '', 0);
  t.check('cadence liée au trafic : passagers ×4 → nettement plus de mouvements (toujours ≤ 2 à la fois)', an.bigPerH > 1.3 * an.perH, `${an.perH.toFixed(0)} → ${an.bigPerH.toFixed(0)} /h (pax ${Math.round(an.pax)})`);
  t.check('atterrissage : approche en vol, toucher, roulage jusqu\'au poste (A1/A2)', an.a0 && an.a0.z > 80 && an.touch && an.a1 && an.a1.z === 0 && an.a1.u < 2.2 && an.a1.u > 1.4, JSON.stringify({ a0: an.a0 && [an.a0.u, an.a0.z].map(v => +v.toFixed(2)), a1: an.a1 && [an.a1.u, an.a1.v, an.a1.z].map(v => +v.toFixed(2)) }));
  t.check('décollage : départ du poste au sol, accélération puis envol', an.d0 && an.d0.z === 0 && an.d0.u < 2.2 && an.d1 && an.d1.z > 100, JSON.stringify({ d0: an.d0 && [an.d0.u, an.d0.z].map(v => +v.toFixed(2)), d1: an.d1 && [an.d1.u, an.d1.z].map(v => +v.toFixed(1)) }));
  t.check('déterministe (même horaire à chaque appel ; aucun aléa)', an.det, '');

  // ---- 2. Vue de la carte : parking garni, aérogare à vitrines, avions dessinés
  const P = await pg.evaluate(() => window.WSE.air.pos());
  await pg.evaluate(P => { const W = window.WSE; W.zoomTo(1.1, innerWidth / 2, innerHeight / 2, { x: P.x + 3, y: P.y + 2 }); W.centerOn(P.x + 2.6, P.y + 1.6); }, P); await pg.waitForTimeout(900);
  const dr = await pg.evaluate(() => window.WSE.air.drawn());
  t.check('parking d\'aéroport présent et garni (voitures HD garées)', dr && dr.stalls >= 16 && dr.cars >= 0.4 * dr.stalls && dr.cars <= dr.stalls, JSON.stringify(dr));   // Responsable Mouvements : 2 rangées de 8 places à la taille réelle des voitures (avant : 4 rangées de 12 places trop petites, voitures qui débordaient sur la place voisine et sur la rangée d'en face)
  t.check('façade de l\'aérogare : vitrines de boutiques et avions dessinés (au contact ou en mouvement)', dr && dr.slots >= 4 && dr.mov + dr.park >= 1, JSON.stringify(dr));

  // ---- 3. Survol : curseur main et étiquette « Aéroport · Entrer »
  const q = await pg.evaluate(P => { const p = window.WSE.tileToScreen(P.x + 3, P.y + 3); return [p.x, p.y]; }, P);
  await pg.mouse.move(q[0] - 5, q[1] - 5); await pg.mouse.move(q[0], q[1]); await pg.waitForTimeout(200);
  const hv = await pg.evaluate(() => { const t = document.getElementById('entertip'), c = document.querySelector('canvas'); return { vis: !t.hidden, txt: t.innerText, cur: getComputedStyle(document.elementFromPoint(innerWidth / 2, innerHeight / 2) || c).cursor, cv: [...document.querySelectorAll('canvas')].map(x => x.style.cursor).filter(Boolean) }; });
  t.check('survol de l\'aéroport : curseur main et étiquette « Aéroport · Entrer »', hv.vis && /Aéroport · Entrer/.test(hv.txt) && hv.cv.includes('pointer'), JSON.stringify(hv));

  // ---- 4. Clic = vue intérieure, bouton d'ouverture en haut, stats repliées, croix
  await pg.mouse.click(q[0], q[1]); await pg.waitForTimeout(350);
  const iv = await pg.evaluate(() => { const b = document.getElementById('airp'), r = b.getBoundingClientRect(), op = b.querySelector('[data-air="open"]'), ro = op && op.getBoundingClientRect(), x = b.querySelector('.xbtn[data-air="close"]'), rx = x && x.getBoundingClientRect();
    const slots = [...b.querySelectorAll('.aconc .aslot')], det = [...b.querySelectorAll('details.asec')], btn = b.querySelector('.acts [data-air="open"]'), rb = btn && btn.getBoundingClientRect();
    return { vis: !b.hidden && window.WSE.air.isOpen(), top: b.scrollTop, tipHidden: document.getElementById('entertip').hidden, hero: !!b.querySelector('.ahero'), occ: slots.filter(s => s.classList.contains('on')).length, free: slots.filter(s => s.matches('button[data-air="open"]')).length,
      nv: window.WSE.air.data().vendors.length, inView: ro && ro.top >= r.top && ro.bottom <= Math.min(r.bottom, innerHeight), main: rb && rb.bottom <= Math.min(r.bottom, innerHeight) && /Ouvrir une boutique duty free \(/.test(btn.innerText),
      det: det.length, open: det.filter(d => d.open).length, sums: det.map(d => d.querySelector('summary').innerText.replace(/\s+/g, ' ')).join(' | '),
      x: rx && x.innerText.trim() === '×' && rx.width >= 36 && rx.top - r.top < 40 && r.right - rx.right < 40, pos: (() => { const s = b.querySelector('.aconc').getBoundingClientRect(), d = det[0].getBoundingClientRect(); return s.top < d.top; })() }; });
  t.check('clic sur l\'aéroport : la vue intérieure s\'ouvre (aérogare en en-tête), l\'étiquette de survol disparaît', iv.vis && iv.hero && iv.tipHidden && iv.top === 0, JSON.stringify({ vis: iv.vis, hero: iv.hero, tip: iv.tipHidden }));
  t.check('galerie des emplacements : une enseigne par vendeur présent + « + Ouvrir une boutique duty free » libre', iv.occ === iv.nv && iv.free >= 1, `${iv.occ} enseignes / ${iv.nv} vendeurs · ${iv.free} libre(s)`);
  t.check('bouton « Ouvrir une boutique duty free (… $) » visible sans défiler', iv.inView && iv.main, '');
  t.check('statistiques sous la galerie, dans des sections repliables (repliées à l\'entrée)', iv.pos && iv.det >= 4 && iv.open === 0 && /Trafic aérien/.test(iv.sums) && /Vendeurs présents/.test(iv.sums) && /Taxes et loyer/.test(iv.sums) && /Mes ventes/.test(iv.sums), iv.sums);
  t.check('grande croix × en haut à droite du panneau', iv.x, '');
  const tg = await pg.evaluate(async () => { const b = document.getElementById('airp'), d = b.querySelector('details[data-sec="traf"]'); d.querySelector('summary').click(); await new Promise(x => setTimeout(x, 50)); const o1 = d.open && /Passagers/.test(d.innerText);
    window.WSE.air.open(); const o2 = b.querySelector('details[data-sec="traf"]').open; b.querySelector('details[data-sec="traf"] summary').click(); await new Promise(x => setTimeout(x, 50)); return { o1, o2 }; });
  t.check('une section se déplie au clic et reste dépliée au rafraîchissement du panneau', tg.o1 && tg.o2, JSON.stringify(tg));
  const cl = await pg.evaluate(async () => { const W = window.WSE; document.querySelector('#airp .xbtn').click(); const a = !W.air.isOpen() && document.getElementById('airp').hidden;
    W.air.open(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await new Promise(x => setTimeout(x, 50)); return { a, b: !W.air.isOpen() }; });
  t.check('fermer : la croix et Échap', cl.a && cl.b, JSON.stringify(cl));
  // ouverture depuis la galerie, puis la boutique apparaît comme enseigne « Ta boutique duty free »
  const sh = await pg.evaluate(() => { const W = window.WSE; W.air.open(); document.querySelector('#airp .aconc [data-air="open"]').click(); const b = document.getElementById('airp');
    return { on: !!(W.S.air && W.S.air.on), you: !!b.querySelector('.aslot.you'), shop: !!b.querySelector('details[data-sec="shop"][open]'), txt: b.innerText }; });
  t.check('« + Ouvrir » dans la galerie ouvre la boutique ; elle apparaît comme enseigne, son détail déplié', sh.on && sh.you && sh.shop && /Ta boutique duty free/.test(sh.txt) && /Fermer ma boutique/.test(sh.txt), '');
  await pg.screenshot({ path: (process.env.WSE_SHOTS || '/tmp') + '/t94_interieur.png' }).catch(() => {});
  await pg.evaluate(() => window.WSE.air.close());

  // ---- 5. Mall central : même principe
  const M = await pg.evaluate(() => { const W = window.WSE, M = W.mall.pos(); W.centerOn(M.x + 5, M.y + 5); return M; }); await pg.waitForTimeout(500);
  const qm = await pg.evaluate(M => { const p = window.WSE.tileToScreen(M.x + 8, M.y + 8); return [p.x, p.y]; }, M);
  await pg.mouse.move(qm[0] - 4, qm[1]); await pg.mouse.move(qm[0], qm[1]); await pg.waitForTimeout(200);
  const mh = await pg.evaluate(() => { const t = document.getElementById('entertip'); return { vis: !t.hidden, txt: t.innerText }; });
  await pg.mouse.click(qm[0], qm[1]); await pg.waitForTimeout(350);
  const mv = await pg.evaluate(() => { const b = document.getElementById('mallp'), r = b.getBoundingClientRect(), sh = b.querySelector('.mconc [data-mall="shop"]'), rs = sh && sh.getBoundingClientRect();
    return { vis: !b.hidden, cards: b.querySelectorAll('.mconc .aslot.on').length, shop: rs && rs.bottom <= Math.min(r.bottom, innerHeight), x: !!b.querySelector('.xbtn[data-mall="close"]'), det: b.querySelectorAll('details.asec').length }; });
  t.check('Mall : survol « Mall central · Entrer », clic = galerie des boutiques en haut avec « + Ouvrir ma boutique » visible, stats repliables, croix', mh.vis && /Mall central · Entrer/.test(mh.txt) && mv.vis && mv.cards >= 3 && mv.shop && mv.x && mv.det >= 3, JSON.stringify({ mh, mv }));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
  await pg.context().close();

  // ---- 6. Mobile 390×844 : l'intérieur tient dans l'écran, le bouton d'ouverture est visible
  const pm = await L.newPage({ wait: 1500, w: 390, h: 844 }); await L.setup(pm, { cash: 3e7 });
  const mo = await pm.evaluate(async () => { const W = window.WSE; W.step(); W.air.open(); await new Promise(x => setTimeout(x, 300)); const b = document.getElementById('airp'), r = b.getBoundingClientRect(), op = b.querySelector('.aconc [data-air="open"]'), ro = op.getBoundingClientRect(), bad = [];
    b.querySelectorAll('.r,.mriv,.btn,.aslot').forEach(e => { if (e.scrollWidth > e.clientWidth + 2) bad.push(e.className); });
    return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: innerWidth, h: innerHeight, btn: ro.top >= r.top && ro.bottom <= Math.min(r.bottom, innerHeight), hs: b.scrollWidth > b.clientWidth + 1, bad }; });
  t.check('mobile 390×844 : vue intérieure dans l\'écran, « + Ouvrir » visible, sans débordement horizontal', mo.l >= 0 && mo.r <= mo.w && mo.t >= 0 && mo.b <= mo.h && mo.btn && !mo.hs && !mo.bad.length, JSON.stringify(mo));
  t.check('aucune erreur de page (mobile)', pm.errs.length === 0, pm.errs.slice(0, 3).join(' | '));
  await pm.context().close();
};
