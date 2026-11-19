// Passe 44 : ville de départ aérée (CITY_D0), Mall central (vitrine du marché) et pôle commercial (densité commerciale récompensée).
// Mall au centre dès le départ, clic réel = panneau (rivaux, parts cohérentes avec S.mkt, boutons d'action), bonus de fréquentation près du mall et pour un pôle de 4,
// ville plus basse et moins peuplée (≈ 60 000 hab.) avec la même économie de départ, croissance sur 3 ans de jeu, anciennes sauvegardes, déterminisme, aucune erreur.
// Passe 45 : le mall occupe un bloc complet de 10×10 cases au centre (25-34), sans route ni immeuble, entouré d'un anneau routier raccordé ; pôle mesuré depuis le bord de l'emprise ;
// caméra de départ sur tout le mall, encart de bienvenue replié ; une sauvegarde avec l'ancien mall 2×2 garde l'ancien comportement.
exports.name = 'Mall central, pôle commercial et ville aérée (passe 44)';
const SCAN = `(() => { const W = window.WSE, S = W.S, N = W.N; const o = { n: 0, max: 0, cmax: 0, mall: 0, mon: 0, park: 0 };
  for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (!c || c.t !== 'npc') continue; if (c.k === 'mon' && c.m === 'mall') { o.mall++; continue; } if (c.m === 'air') continue; o.n++; if (c.k === 'mon') o.mon++; if (c.k === 'park') o.park++;
    if (c.floors > o.max) o.max = c.floors; if (Math.hypot(c.x - 30, c.y - 30) < 12 && c.floors > o.cmax) o.cmax = c.floors; }
  return o; })()`;
const start = async (pg, opt) => pg.evaluate(async o => {
  const W = window.WSE; document.getElementById('caste').hidden = true; W.startMode('free'); W.setCaste('industriel');
  ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.S.noEv = true; W.setSpeed(0); if (o && o.cash) W.S.cash = o.cash;
  const b = document.querySelector('[data-sg="close"]'); if (b) b.click(); await new Promise(x => setTimeout(x, 400)); return true;
}, opt || {});

exports.run = async (t, L) => {
  // ---- 1. Départ : ville aérée et mall au centre, caméra sur le mall
  const pg = await L.newPage({ wait: 2600, w: 1280, h: 720 }); await L.inject(pg); await start(pg, { cash: 3e7 });
  const a = await pg.evaluate(SCAN);
  const st = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; W.step(); W.refreshStats(); try { W.mk.inv(); W.mk.open('welcome', ''); } catch (e) {} const M = W.mall.pos(), cam = W.coach.camTile(), cells = [];
    let roads = 0, other = 0; if (M) for (let oy = 0; oy < M.w; oy++) for (let ox = 0; ox < M.w; ox++) { const c = S.grid[(M.y + oy) * N + M.x + ox]; const ok = !!c && c.t === 'npc' && c.k === 'mon' && c.m === 'mall'; cells.push(ok); if (c && c.t === 'road') roads++; else if (c && !ok) other++; }
    // anneau routier autour de l'emprise, raccordé au réseau (parcours en largeur sur les routes depuis un coin de l'anneau)
    const ring = []; if (M) for (let k = -1; k <= M.w; k++) ring.push([M.x + k, M.y - 1], [M.x + k, M.y + M.w], [M.x - 1, M.y + k], [M.x + M.w, M.y + k]);
    const isR = (x, y) => { const c = S.grid[y * N + x]; return !!c && c.t === 'road'; }, seen = new Uint8Array(N * N), q = [[M.x - 1, M.y - 1]]; seen[(M.y - 1) * N + M.x - 1] = 1;
    while (q.length) { const [x, y] = q.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const X = x + d[0], Y = y + d[1]; if (X < 0 || Y < 0 || X >= N || Y >= N || seen[Y * N + X] || !isR(X, Y)) return; seen[Y * N + X] = 1; q.push([X, Y]); }); }
    const ringOk = ring.every(r => isR(r[0], r[1])), ringCon = ring.every(r => seen[r[1] * N + r[0]]), farCon = !!seen[12 * N + 12] && !!seen[48 * N + 48] && !!seen[90 * N + 30];
    // vue de départ : tout le mall (sol et enseigne) entre le bandeau et la barre d'outils, encart de bienvenue replié hors du mall
    const sL = W.tileToScreen(M.x - 0.5, M.y + M.w - 0.5), sR = W.tileToScreen(M.x + M.w - 0.5, M.y - 0.5), sB = W.tileToScreen(M.x + M.w - 0.5, M.y + M.w - 0.5), sC = W.tileToScreen(M.x + 4.1, M.y + 4.1), k = W.tileToScreen(M.x + 1, M.y).x - W.tileToScreen(M.x, M.y).x;
    const top = sC.y - (W.mall.K.MB_H + 180) * k / 66, hud = document.getElementById('hud').getBoundingClientRect(), bar = document.getElementById('bar').getBoundingClientRect(), mk = document.getElementById('mkview'), mr = mk.getBoundingClientRect();
    const view = { l: sL.x, r: sR.x, t: top, b: sB.y, hud: hud.bottom, bar: bar.top, w: innerWidth };
    const mkOver = !mk.hidden && mr.left < view.r && mr.right > view.l && mr.top < view.b && mr.bottom > view.t, mkMini = !mk.hidden && mk.classList.contains('wlmini') && mk.querySelectorAll('.sgc').length === 3;
    return { M, cells, roads, other, ringOk, ringCon, farCon, view, mkOver, mkMini, pop: S.pop, popE: W.mall.popE(), bx: S.bx, bs: S.bassin, cap: S.stats.cap, jr: S.stats.jobs / S.stats.workforce, cam, D0: W.mall.K.CITY_D0, free: S.city && S.city.free, lots: S.city && S.city.lots, obj: document.getElementById('objbar').textContent, hint: document.getElementById('hint').textContent, coach: S.coach && S.coach.id }; });
  t.check('le Mall central occupe un bloc complet de 10×10 cases au centre de la ville (centre à moins d\'une case de 30, 30)', st.M && st.M.w === 10 && st.cells.length === 100 && st.cells.every(Boolean) && Math.hypot(st.M.x + 4.5 - 30, st.M.y + 4.5 - 30) <= 1, JSON.stringify(st.M));
  t.check('emprise réservée : aucune route ni aucun autre bâtiment sur les 100 cases', st.roads === 0 && st.other === 0, `routes ${st.roads} · autres ${st.other}`);
  t.check('anneau routier complet autour du mall, raccordé aux avenues, au reste de la ville et à la route du sud', st.ringOk && st.ringCon && st.farCon, JSON.stringify({ ring: st.ringOk, con: st.ringCon, far: st.farCon }));
  t.check('vue de départ : tout le mall (enseigne comprise) visible entre le bandeau et la barre d\'outils', st.view.l >= 0 && st.view.r <= st.view.w && st.view.t >= st.view.hud - 30 && st.view.b <= st.view.bar + 10 && st.view.r - st.view.l >= 300, JSON.stringify(st.view, (k, v) => typeof v === 'number' ? Math.round(v) : v));
  t.check('encart « Bienvenue sur un marché déjà en pleine activité » discret (replié, 3 idées à déplier) et hors du mall', st.mkMini && !st.mkOver, JSON.stringify({ mini: st.mkMini, over: st.mkOver }));
  // passe 46 : bâtiment principal curviligne et sobre, partie statique rendue dans un cache hors écran (reconstruit seulement si l'échelle change)
  const rd = await pg.evaluate(async () => { const R = window.WSE.mall.render; if (!R || !R.cache()) return { ok: false }; const b0 = R.builds(); await new Promise(x => setTimeout(x, 1200)); const b1 = R.builds(), C = R.cache(), G = R.geo();
    let n = 0, sat = 0; try { const d = C.cv.getContext('2d').getImageData(0, 0, C.cv.width, C.cv.height).data; for (let i = 0; i < d.length; i += 16) { if (d[i + 3] < 200) continue; n++; const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); if (mx > 115 && (mx - mn) / mx > 0.55) sat++; } } catch (e) { return { ok: false, err: e.message }; }
    return { ok: true, b0, b1, sat: +(sat / n).toFixed(4), runs: G.runs.length, pod: G.pod.length, w: C.cv.width, h: C.cv.height }; });
  t.check('passe 46 : bâtiment principal curviligne (socle ondulé, rampe en spirale, couronne de l\'enseigne), palette sobre (moins de 3 % de pixels saturés), rendu statique en cache non reconstruit à chaque image', rd.ok && rd.b1 === rd.b0 && rd.sat < 0.03 && rd.runs >= 3 && rd.pod >= 5, JSON.stringify(rd));
  await pg.screenshot({ path: (process.env.WSE_SHOTS || '/tmp') + '/t44_mall.png' }).catch(() => {});
  t.range('ville aérée : population de départ', st.pop, 55000, 65000, ' hab.', 0);
  t.check('ville aérée : centre bas (au plus 16 étages), plus aucun gratte-ciel', a.cmax <= 16 && a.max <= 16 && a.cmax >= 6, `centre ${a.cmax} étages · plus haut ${a.max}`);
  t.check('ville aérée : moins de bâtiments, plus de lots libres (au moins 55 %), parcs et équipements publics présents', a.n <= 330 && st.free / st.lots >= 0.55 && a.park >= 12 && a.mon === 11, `${a.n} bâtiments · ${st.free} lots libres sur ${st.lots} · ${a.park} parcs`);
  t.range('économie de départ inchangée : habitants-équivalents du bassin (k)', st.popE / 1000, 280, 300, ' k', 1);
  t.range('économie de départ inchangée : rapport emplois / actifs', st.jr, 0.8, 0.95, '', 2);
  t.check('réglage unique CITY_D0 exposé (0,6)', st.D0 === 0.6, String(st.D0));
  t.check('caméra de départ sur le mall (centre de l\'écran dans l\'emprise)', st.M && st.cam.x >= st.M.x - 1 && st.cam.x <= st.M.x + st.M.w && st.cam.y >= st.M.y - 1 && st.cam.y <= st.M.y + st.M.w, JSON.stringify(st.cam));
  t.check('conseiller : premier jalon « Clique sur le Mall central pour voir le marché »', st.coach === 'mall' && /Clique sur le Mall central pour voir le marché/.test(st.obj), st.obj.slice(-160));
  t.check('écran d\'accueil : le mall est mentionné', /Mall central/.test(st.hint) && /60 000/.test(st.hint), st.hint.slice(0, 120));

  // ---- 2. Clic réel sur plusieurs cases du mall (vue de départ) : chaque case ouvre le panneau « Le Mall »
  await pg.evaluate(() => { const W = window.WSE; W.setTool('view'); for (let i = 0; i < 2; i++) W.step(); W.mk.act('close'); });
  await pg.waitForTimeout(300);
  const pts = await pg.evaluate(() => { const W = window.WSE, M = W.mall.pos(); return [[M.x + 9, M.y + 9], [M.x + 1, M.y + 8], [M.x + 8, M.y + 1], [M.x + 9, M.y + 5], [M.x + 4, M.y + 9]].map(c => { const p = W.tileToScreen(c[0], c[1]); return [p.x, p.y, c[0], c[1]]; }); });
  const opened = [];
  for (const q of pts) { await pg.evaluate(() => window.WSE.mall.close()); await pg.mouse.click(q[0], q[1]); await pg.waitForTimeout(250); opened.push(await pg.evaluate(() => window.WSE.mall.isOpen() && !document.getElementById('mallp').hidden)); }
  t.check('clic sur 5 cases différentes de l\'emprise (coins, bords) : le même panneau « Le Mall » s\'ouvre', opened.every(Boolean), JSON.stringify(opened));
  await pg.evaluate(() => { const W = window.WSE; W.mall.close(); const M = W.mall.pos(); W.centerOn(M.x + 8, M.y + 8); });
  await pg.waitForTimeout(400);
  const xy = await pg.evaluate(() => { const W = window.WSE, M = W.mall.pos(), p = W.tileToScreen(M.x + 8, M.y + 8); return [p.x, p.y]; });
  await pg.mouse.click(xy[0], xy[1]); await pg.waitForTimeout(500);
  const pn = await pg.evaluate(() => { const W = window.WSE, S = W.S, box = document.getElementById('mallp'), d = W.mall.data();
    const cards = [...box.querySelectorAll('[data-mriv]')].map(e => e.dataset.mriv), txt = box.innerText;
    // cohérence avec S.mkt : part pondérée par la demande de chaque rayon
    const dw = S._dw.cls, cl = ['basic', 'std', 'lux'], Dt = cl.reduce((a, c) => a + dw[c].Dc, 0);
    const ref = {}; (S.rivals || []).forEach(r => { ref[r.id] = cl.reduce((a, c) => { const q = S.mkt[c].riv.find(x => x.id === r.id); return a + (q ? q.s : 0) * dw[c].Dc; }, 0) / Dt; });
    const err = d.riv.reduce((m, r) => Math.max(m, Math.abs(r.share - ref[r.id])), 0), you = cl.reduce((a, c) => a + S.mkt[c].you * dw[c].Dc, 0) / Dt;
    const pcs = [...box.querySelectorAll('.mpc')].map(e => +e.textContent.replace(/[^\d]/g, ''));
    return { vis: !box.hidden && W.mall.isOpen(), txt, cards, nRiv: (S.rivals || []).filter(r => !r.dead).length, err, you: Math.abs(d.you - you), pcs, sumPc: d.riv.map(r => Math.round(r.share * 100)),
      btn: ['shop', 'prod', 'port'].map(k => !!box.querySelector(`[data-mall="${k}"]`)), names: (S.rivals || []).every(r => txt.indexOf(r.name) >= 0), coach: S.coach.id, seen: !!S.coach.mall,
      bad: /NaN|undefined|Infinity|\[object/.test(txt), perDay: /\d\s*\$\s*\/\s*(jour|j)\b/.test(txt), fits: box.scrollWidth <= box.clientWidth + 1 && box.getBoundingClientRect().right <= innerWidth && box.getBoundingClientRect().left >= 0 }; });
  t.check('clic sur le mall : le panneau « Le Mall » s\'ouvre avec la note pédagogique', pn.vis && /LE MALL CENTRAL/.test(pn.txt) && /Le mall est la vitrine du marché : tes rivaux y sont déjà/.test(pn.txt), pn.txt.slice(0, 90));
  t.check('qui vend quoi : chaque rival (nom, caste, rayons, part, prix relatif au tien)', pn.cards.length === pn.nRiv && pn.nRiv >= 3 && pn.names && /prix ×\d,\d\d/.test(pn.txt) && /(moins|plus) cher que toi|même prix que toi/.test(pn.txt) && /Exploitant agricole|Banquier|Négociant|Promoteur|Innovateur/.test(pn.txt), `${pn.cards.length} cartes`);
  t.check('parts affichées cohérentes avec S.mkt (écart < 0,5 point)', pn.err < 0.005 && pn.you < 0.005 && pn.pcs.join() === pn.sumPc.join(), JSON.stringify({ err: pn.err, pcs: pn.pcs, ref: pn.sumPc }));
  t.check('demande de la ville, produits les plus demandés avec prix de rayon, ta part', /La demande de la ville/i.test(pn.txt) && /Les plus demandés/i.test(pn.txt) && /Ta part du marché/.test(pn.txt) && /u\/mois/.test(pn.txt) && /prix de rayon/.test(pn.txt), '');
  t.check('trois boutons d\'action et bornes du pôle commercial documentées', pn.btn.every(Boolean) && /moins de 6 cases du mall : \+20 %/.test(pn.txt) && /4 boutiques voisines/.test(pn.txt) && /−8 %/.test(pn.txt), JSON.stringify(pn.btn));
  t.check('panneau propre (aucun NaN, aucun montant par jour) et lisible en 1280x720', !pn.bad && !pn.perDay && pn.fits, '');
  t.check('jalon « mall » atteint, le conseiller passe à « Ouvre ta boutique près du mall »', pn.seen && pn.coach === 'shop1', pn.coach);
  await pg.screenshot({ path: (process.env.WSE_SHOTS || '/tmp') + '/t44_panel.png' }).catch(() => {});
  // action « Ouvrir ma boutique près du mall » : outil petit marché + case libre proche ; pose ; jalon suivant « Importe un produit du port »
  const sh = await pg.evaluate(async () => { const W = window.WSE, S = W.S; document.querySelector('#mallp [data-mall="shop"]').click(); await new Promise(x => setTimeout(x, 200));
    const tool = W.mall.tool(), sp = W.mall.spot('s1'), cam = W.coach.camTile(), ok = W.place(sp.x, sp.y, 's1'); try { W.autoConnect(sp.x, sp.y); } catch (e) {}
    for (let i = 0; i < 6; i++) W.step(); W.coach.step(1); const c = S.grid[sp.y * W.N + sp.x];
    const M = W.mall.pos(), ring = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(d => { const X = sp.x + d[0], Y = sp.y + d[1], r = S.grid[Y * W.N + X]; return r && r.t === 'road' && X >= M.x - 1 && X <= M.x + M.w && Y >= M.y - 1 && Y <= M.y + M.w; });
    return { ring, imp: W.coach.st(true).imp, tool, closed: document.getElementById('mallp').hidden, sp, d: W.mall.dist(sp.x, sp.y), camD: Math.hypot(cam.x - sp.x, cam.y - sp.y), ok, near: W.mall.bonus(sp.x, sp.y).near, coach: S.coach.id, done: Object.keys(S.coach.done || {}), obj: document.getElementById('objbar').textContent, tr: c && c.traffic, trB: W.mall.trafficBase(sp.x, sp.y) }; });
  t.check('« Ouvrir ma boutique près du mall » : outil petit marché, caméra sur la case libre la plus proche du bord (au bord de l\'anneau)', sh.tool === 's1' && sh.closed && sh.d <= 2.5 && sh.ring && sh.camD <= 2.5 && sh.ok && sh.near, JSON.stringify({ tool: sh.tool, d: sh.d, ring: sh.ring, cam: sh.camD }));
  t.check('jalons enchaînés : boutique ouverte puis « Importe un produit du port » (atteint dès que les rayons sont remplis par l\'import)', sh.done.indexOf('mall') >= 0 && sh.done.indexOf('shop1') >= 0 && (sh.coach === 'imp' || sh.done.indexOf('imp') >= 0 || sh.imp === true), JSON.stringify({ id: sh.coach, done: sh.done, imp: sh.imp }));
  const bt = await pg.evaluate(async () => { const W = window.WSE; W.mall.open(); document.querySelector('#mallp [data-mall="port"]').click(); await new Promise(x => setTimeout(x, 300)); const r = { bview: !document.getElementById('bview').hidden };
    W.mall.open(); document.querySelector('#mallp [data-mall="prod"]').click(); await new Promise(x => setTimeout(x, 300)); r.pv = document.getElementById('pv').getAttribute('aria-pressed') === 'true' || !!document.querySelector('#pview:not([hidden]), #prodview:not([hidden])'); r.buf = (W.S._sayBuf || []).slice(-6).join(' | '); return r; });
  t.check('« Importer depuis le port » ouvre la fiche (Logistique) ; « Voir les produits » ouvre la vue Produits', bt.bview && bt.pv && /port importe/.test(bt.buf), JSON.stringify({ bview: bt.bview, pv: bt.pv }));
  t.check('aucune erreur de page (départ, panneau, actions)', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
  await pg.context().close();

  // ---- 3. Pôle commercial : bonus près du mall et pour 4 boutiques voisines (sans aléa)
  const pp = await L.newPage({ wait: 600 }); await L.setup(pp, { cash: 5e9 }); await L.inject(pp);
  const po = await pp.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, M = W.mall.pos(), K = W.mall.K, r = {};
    const freeAt = (x0, x1, y0, y1, pred) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!W.footprintError(x, y, 's1') && (!pred || pred(x, y))) return [x, y]; return null; };
    // a) une boutique seule près du mall
    const p1 = W.mall.spot('s1'); W.place(p1.x, p1.y, 's1'); const b1 = W.mall.bonus(p1.x, p1.y); r.near = { d: b1.d, k: b1.k, near: b1.near, pole: b1.pole, tr: W.mall.traffic(p1.x, p1.y), base: W.mall.trafficBase(p1.x, p1.y) };
    // a2) distance mesurée depuis le bord de l'emprise 10×10 (6 cases : bonus ; 7 cases : rien)
    r.edge = { d6: W.mall.dist(M.x - 6, M.y + 4), d7: W.mall.dist(M.x - 7, M.y + 4), dE: W.mall.dist(M.x + M.w + 5, M.y + M.w + 2), dIn: W.mall.dist(M.x + 4, M.y - 1), n6: W.mall.dist(M.x - 6, M.y + 4) <= K.MALL_R, n7: W.mall.dist(M.x - 7, M.y + 4) <= K.MALL_R };
    // b) un pôle de 4 boutiques voisines loin du mall (quartier nord-ouest)
    const far = []; for (let y = 13; y <= 22 && far.length < 4; y++) for (let x = 13; x <= 22 && far.length < 4; x++) { if (W.mall.dist(x, y) <= K.MALL_R + 2) continue; if (far.length && !far.some(q => Math.max(Math.abs(q[0] - x), Math.abs(q[1] - y)) <= 2)) continue; if (!W.footprintError(x, y, 's1') && W.place(x, y, 's1')) far.push([x, y]); }
    r.nFar = far.length; const c0 = S.grid[far[0][1] * N + far[0][0]], bf = W.mall.bonus(far[0][0], far[0][1]); r.pole = { n: bf.pole, k: bf.k, near: bf.near, um: W.mall.poleUm(c0) };
    // c) une boutique isolée (loin de tout) : aucun bonus
    const iso = freeAt(40, 47, 40, 47, (x, y) => W.mall.dist(x, y) > K.MALL_R + 2 && W.mall.pole(x, y) <= 1); W.place(iso[0], iso[1], 's1'); const ci = S.grid[iso[1] * N + iso[0]], bi = W.mall.bonus(iso[0], iso[1]); r.iso = { k: bi.k, pole: bi.pole, um: W.mall.poleUm(ci) };
    // frais fixes : même boutique, même niveau : ratio pôle / isolée
    r.upk = W.mall.upkOf(c0) / W.mall.upkOf(ci);
    // la fréquentation enregistrée (rafraîchie tous les 5 jours) applique le bonus ; formule exacte
    for (let i = 0; i < 6; i++) W.step(); r.recNear = S.grid[p1.y * N + p1.x].traffic; r.expNear = Math.min(1, W.mall.trafficBase(p1.x, p1.y) * W.mall.bonus(p1.x, p1.y).k); r.recPole = c0.traffic; r.expPole = Math.min(1, W.mall.trafficBase(c0.x, c0.y) * 1.1);
    r.baseNear = W.mall.trafficBase(p1.x, p1.y); r.basePole = W.mall.trafficBase(c0.x, c0.y);
    // fiche du magasin : pastille ; halo (rendu sans erreur)
    W.openBuilding(c0.x, c0.y); r.pip = /Pôle commercial/.test(document.getElementById('bview').innerText) && !!document.querySelector('#bview .polepip'); W.closeBuilding && W.closeBuilding();
    W.openBuilding(ci.x, ci.y); r.noPip = !document.querySelector('#bview .polepip') && /Pôle commercial : non/.test(document.getElementById('bview').innerText); W.closeBuilding && W.closeBuilding();
    return r; });
  t.check('boutique à moins de 6 cases du mall : +20 % de fréquentation', po.near.near && po.near.d <= 6 && Math.abs(po.near.k - 1.2) < 1e-9 && Math.abs(po.near.tr - Math.min(1, po.near.base * 1.2)) < 1e-9, JSON.stringify(po.near));
  t.check('pôle commercial : distance mesurée depuis le bord de l\'emprise (6 cases : +20 % ; 7 cases : aucun bonus)', Math.abs(po.edge.d6 - 6) < 1e-9 && Math.abs(po.edge.d7 - 7) < 1e-9 && Math.abs(po.edge.dIn - 1) < 1e-9 && Math.abs(po.edge.dE - Math.hypot(6, 3)) < 1e-9 && po.edge.n6 && !po.edge.n7, JSON.stringify(po.edge));
  t.check('pôle de 4 boutiques voisines : +10 % de fréquentation et frais fixes −8 %', po.nFar === 4 && po.pole.n >= 4 && !po.pole.near && Math.abs(po.pole.k - 1.1) < 1e-9 && Math.abs(po.pole.um - 0.92) < 1e-9 && Math.abs(po.upk - 0.92) < 0.002, JSON.stringify(Object.assign({ upk: po.upk }, po.pole)));
  t.check('boutique isolée : aucun bonus', po.iso.k === 1 && po.iso.pole === 0 && po.iso.um === 1, JSON.stringify(po.iso));
  // passe 45 : tolérance relative de 0,2 % pour le pôle (la ville grandit tous les 2 jours et la fréquentation enregistrée date du dernier rafraîchissement, tous les 5 jours)
  t.check('fréquentation enregistrée = base × bonus (plafonnée à 100), plus élevée qu\'à base égale sans bonus', Math.abs(po.recNear - po.expNear) < 1e-6 && Math.abs(po.recPole - po.expPole) < 2e-3 * po.expPole && (po.recNear > po.baseNear || po.baseNear >= 0.83) && (po.recPole > po.basePole || po.basePole >= 0.9), JSON.stringify({ near: [po.baseNear, po.recNear], pole: [po.basePole, po.recPole] }));
  t.check('fiche du magasin : pastille « Pôle commercial » (et conseil quand la boutique est isolée)', po.pip && po.noPip, JSON.stringify({ pip: po.pip, no: po.noPip }));
  t.check('aucune erreur de page (pôle)', pp.errs.length === 0, pp.errs.slice(0, 3).join(' | '));
  await pp.context().close();

  // ---- 4. Croissance : la ville regrandit sur 3 ans de jeu (360 jours), puis continue
  const pg2 = await L.newPage({ wait: 600 }); await L.setup(pg2, { cash: 5e9 });
  const gr = await pg2.evaluate(() => { const W = window.WSE, S = W.S, out = [Math.round(S.pop)]; let f0 = 0; S.grid.forEach(c => { if (c && c.t === 'npc') f0 += c.floors; });
    for (let d = 0; d < 1080; d++) { W.step(); if (S.day % 120 === 0) out.push(Math.round(S.pop)); }
    let f1 = 0; S.grid.forEach(c => { if (c && c.t === 'npc') f1 += c.floors; }); const M = W.mall.pos(); let bad = 0; for (let y = M.y; y < M.y + M.w; y++) for (let x = M.x; x < M.x + M.w; x++) { const c = S.grid[y * W.N + x]; if (!c || c.t !== 'npc' || c.m !== 'mall') bad++; }
    return { bad, ext: (S.cityExt || []).length, out, f0, f1, mall: !!W.mall.pos() && W.S.grid[W.mall.pos().y * W.N + W.mall.pos().x].m === 'mall', top: S.city.top, attr: S.city.attr }; });
  t.check('3 ans de jeu (360 jours) : la ville regrandit (+4 % au moins)', gr.out[3] > gr.out[0] * 1.04, gr.out.map(v => Math.round(v / 1000)).join(' → ') + ' k');
  t.check('9 ans de jeu : croissance continue (+20 % au moins, jamais de recul de plus de 3 %), étages ajoutés, mall intact', gr.out[9] > gr.out[0] * 1.2 && gr.out.every((v, i) => !i || v >= gr.out[i - 1] * 0.97) && gr.f1 > gr.f0 && gr.mall, `étages ${gr.f0} → ${gr.f1} · attractivité ${gr.attr.toFixed(2)}`);
  t.check('croissance : la ville ne construit jamais dans l\'emprise du mall (100 cases intactes)', gr.bad === 0, `cases modifiées ${gr.bad} · blocs ajoutés ${gr.ext}`);
  t.check('aucune erreur de page (croissance)', pg2.errs.length === 0, pg2.errs.slice(0, 3).join(' | '));
  // sauvegarde : le mall et le bassin (bx) survivent à un rechargement
  const ctx = pg2.context();
  const s1 = await pg2.evaluate(() => { const W = window.WSE, S = W.S; W.save(); return { mall: W.mall.pos(), bx: S.bx, popE: Math.round(W.mall.popE()) }; });
  const pg3 = await L.newPage({ ctx, wait: 900 });
  const s2 = await pg3.evaluate(() => { const W = window.WSE, S = W.S; return { mall: W.mall.pos(), bx: S.bx, popE: Math.round(W.mall.popE()) }; });
  t.check('sauvegarde : mall et région du bassin conservés au rechargement', JSON.stringify(s1) === JSON.stringify(s2) && pg3.errs.length === 0, JSON.stringify({ s1, s2 }));
  const raw = await pg3.evaluate(() => localStorage.getItem('wse-city-v8'));
  await ctx.close();

  // ---- 5. Anciennes sauvegardes : sans mall (passe 35) et ancienne ville (sans cv) : chargement sans erreur, mall ajouté si les cases sont libres
  const b = await L.browser();
  const load = async d => { const c2 = await b.newContext({ viewport: { width: 1280, height: 900 } }); await c2.addInitScript(v => { try { if (!localStorage.getItem('wse-city-v8')) localStorage.setItem('wse-city-v8', v); } catch (e) {} }, JSON.stringify(d));
    const p = await c2.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', x => x.dismiss()); await p.goto(L.URL); await p.waitForTimeout(900);
    const o = await p.evaluate(() => { const W = window.WSE, S = W.S; for (let i = 0; i < 5; i++) W.step(); W.mall.open(); const n = S.grid.filter(c => c && c.t === 'npc' && c.m === 'mall').length; const r30 = S.grid[27 * W.N + 30]; return { day: S.day, pop: Math.round(S.pop), mall: W.mall.pos(), n, cv: S.cityV | 0, open: !document.getElementById('mallp').hidden, bx: S.bx || 0, av30: !!r30 && r30.t === 'road', d: W.mall.dist(31, 28) }; });
    o.errs = p.errs; await c2.close(); return o; };
  const d35 = JSON.parse(raw); delete d35.bx; d35.cty = d35.cty.filter(q => q[5] !== 'mall');
  // sauvegarde de la passe 44 (ancien mall 2×2 en 28-29) : elle garde l'ancien mall, l'avenue 30 et la distance au centre du mall
  const d44 = JSON.parse(raw); d44.cty = d44.cty.filter(q => q[5] !== 'mall'); [[28, 28], [29, 28], [28, 29], [29, 29]].forEach(c => d44.cty.push([c[0], c[1], 'mon', 1, 0.5, 'mall']));
  const o44 = await load(d44);
  t.check('sauvegarde avec l\'ancien mall 2×2 (passe 44) : chargée sans erreur, ancien mall conservé, ancien réseau (avenue 30), ancien calcul du pôle', o44.errs.length === 0 && o44.n === 4 && o44.mall && o44.mall.x === 28 && o44.mall.w === 2 && o44.open && o44.av30 && Math.abs(o44.d - Math.hypot(31 - 28.5, 28 - 28.5)) < 1e-9, JSON.stringify(o44));
  const o35 = await load(d35);
  t.check('ancienne sauvegarde passe 35 (sans mall ni bx) : chargée sans erreur, mall ajouté sur ses cases libres', o35.errs.length === 0 && o35.cv === 2 && o35.n === 4 && o35.mall && o35.mall.x === 28 && o35.open && o35.bx === 0, JSON.stringify(o35));
  const dOld = JSON.parse(raw); ['cv', 'bs', 'bx', 'cext', 'cg', 'cty'].forEach(k => delete dOld[k]); dOld.pop = 288533; dOld.day = 0; dOld.built = []; dOld.npcMods = []; dOld.jpf = 74.28177127659576;
  const oOld = await load(dOld);
  t.check('très ancienne sauvegarde (ville de 288 000 habitants) : chargée sans erreur, mall ajouté au coin libre du centre', oOld.errs.length === 0 && oOld.cv === 0 && oOld.n === 4 && oOld.mall && oOld.open && oOld.pop > 250000, JSON.stringify(oOld));

  // ---- 6. Déterminisme : deux nouvelles parties identiques (ville, mall, panneau, croissance)
  const run = async () => { const p = await L.newPage({ wait: 600 }); await L.setup(p, { cash: 5e9 });
    const x = await p.evaluate(() => { const W = window.WSE, S = W.S, city = []; S.grid.forEach((c, i) => { if (c && c.t === 'npc') city.push(i + ':' + c.k + ':' + c.floors + ':' + (c.m || '')); });
      for (let i = 0; i < 60; i++) W.step(); const d = W.mall.data(); return { city: city.join('|'), pop: Math.round(S.pop), riv: d.riv.map(r => r.id + ':' + r.share.toFixed(6)).join(','), M: JSON.stringify(W.mall.pos()) }; });
    x.errs = p.errs; await p.context().close(); return x; };
  const r1 = await run(), r2 = await run();
  t.check('déterminisme : même ville de départ, même mall, même croissance, mêmes parts', r1.city === r2.city && r1.pop === r2.pop && r1.riv === r2.riv && r1.M === r2.M && !r1.errs.length && !r2.errs.length, `${r1.pop} / ${r2.pop}`);
  // ---- 7. Mobile 390x844 : panneau lisible
  const pm = await L.newPage({ wait: 2600, w: 390, h: 844 }); await start(pm);
  const mo = await pm.evaluate(async () => { const W = window.WSE; W.step(); W.mall.open(); await new Promise(x => setTimeout(x, 300)); const box = document.getElementById('mallp'), r = box.getBoundingClientRect(), bad = [];
    box.querySelectorAll('.r,.mriv,.btn').forEach(e => { if (e.scrollWidth > e.clientWidth + 2) bad.push(e.className); });
    return { vis: !box.hidden, l: r.left, r: r.right, t: r.top, b: r.bottom, w: innerWidth, h: innerHeight, bad, scroll: box.scrollHeight > box.clientHeight }; });
  t.check('mobile 390x844 : panneau du mall dans l\'écran, sans débordement horizontal', mo.vis && mo.l >= 0 && mo.r <= mo.w && mo.t >= 0 && mo.b <= mo.h && !mo.bad.length, JSON.stringify(mo));
  t.check('aucune erreur de page (mobile)', pm.errs.length === 0, pm.errs.slice(0, 3).join(' | '));
  await pm.context().close();
};
