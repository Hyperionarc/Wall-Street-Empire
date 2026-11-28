// Le port ressemble à un vrai terminal ET laisse la place de bâtir (Rémy : « une petite bande de conteneurs derrière le quai sur toute la longueur du port ;
// pas 10 blocs de conteneurs : il faut laisser construire usines et entrepôts » ; « plein de problèmes isométriques » ; « voir les conteneurs se remplir sur les bateaux ») :
//  1. terre-plein clair (sol_terminal) ; bande de conteneurs sur toute la longueur (colonne derrière le quai) ; front de quai continu ;
//  2. parcelles : ≥ 80 % des blocs du terre-plein sans décor et constructibles ; survol : « Terrain portuaire · subvention X % » (taux réel) ; construire dans un bloc libre,
//     sur la bande et dans le bloc du fond fonctionne (le décor s'efface) ; décor non sauvegardé ;
//  3. audit isométrique : objets du décor dessinés dans leur emprise entière (0 pixel hors de la colonne de l'emprise, posés au sol), rien sur les avenues,
//     ordre de profondeur (chaque objet dessiné à sa case avant, portiques et camions à la rangée de leur axe), pixels des avenues en bitume ;
//  4. navires selon l'activité ; escale animée : le pont se vide au déchargement et se remplit au chargement, de façon continue, proportionnellement aux échanges ;
//  5. images en cache borné, dessin du décor peu coûteux, 0 erreur ; déterminisme.
exports.name = 'Terminal portuaire';
exports.run = async (t, L) => {
  const b = await L.browser(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const pg = await L.newPage({ ctx, wait: 1500 }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel{display:none !important}' });
  // ---- 1. agencement
  const a = await pg.evaluate(() => { const W = window.WSE, N = W.N, P = W.port, G = W.ground, Z = W.ZONE, K = {}, P0 = W.PORT; let asph = 0, term = 0, edge = {}, band = {}, onRoad = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const z = Z[y * N + x]; if (z === 2 && !G.kind(x, y)[0].startsWith('route_')) { const n = G.kind(x, y)[0]; if (n === 'sol_terminal') term++; else if (n === 'sol_port_asphalte') asph++; }
      const k = P.kind(x, y).replace(/:.*/, ''); if (k) { K[k] = (K[k] || 0) + 1; if (z === 2 && G.kind(x, y)[0].startsWith('route_')) onRoad++; } if (k === 'quai_bord') edge[y] = 1; if (k === 'bande') band[y] = 1; }
    const rows = [], brow = []; for (let y = P0.y0; y <= P0.y1; y++) { rows.push(edge[y] ? 1 : 0); if ((y - P0.y0) % 6) brow.push(band[y] ? 1 : 0); }
    let det = true; for (let i = 0; i < 200; i++) { const x = 60 + (i * 7) % 30, y = 50 + (i * 13) % 38; if (P.kind(x, y) !== P.kind(x, y)) det = false; }
    const bl = P.blocks(), free = bl.filter(q => q.free).length;
    return { asph, term, K, rows: rows.join(''), brow: brow.join(''), det, onRoad, nb: bl.length, free, ratio: free / bl.length, decorB: bl.filter(q => q.decor).map(q => q.bx + ',' + q.by) }; });
  t.info(JSON.stringify(a));
  t.check('terre-plein clair : la zone portuaire est en béton clair (sol_terminal), plus d\'asphalte sombre', a.term > 300 && a.asph === 0, `${a.term} cases claires · ${a.asph} sombres`);
  t.check('bande de conteneurs sur TOUTE la longueur du port (chaque rangée hors avenues de y 55 à 83)', a.brow.length >= 24 && !/0/.test(a.brow), a.brow);
  t.check('front de quai continu (bord de quai sur toutes les rangées) avec voie et rangée de quai', !/0/.test(a.rows.slice(1, -1)) && (a.K.quai_voie || 0) >= 25 && (a.K.quai_parc || 0) >= 25, a.rows);
  t.check('parcelles : au moins 80 % des blocs du terre-plein sans décor et constructibles (et ≥ 35 %)', a.ratio >= 0.8 && a.nb >= 15, `${a.free}/${a.nb} blocs libres (${Math.round(a.ratio * 100)} %), décor : ${a.decorB.join(' ')}`);
  t.check('fond du port limité à un bloc : 4 objets de 2×2 cases (case avant + 3 cases d\'emprise)', (a.K.fond || 0) === 4 && (a.K.fond_ || 0) === 12, JSON.stringify({ fond: a.K.fond, fond_: a.K.fond_ }));
  t.check('aucun décor sur les avenues du port', a.onRoad === 0, a.onRoad);
  t.check('agencement déterministe', a.det);
  // ---- 2. survol : subvention de la parcelle
  const h = await pg.evaluate(() => { const W = window.WSE, l = W.mapLabel(75, 62), lb = W.mapLabel(W.port.BAND_X, 62), lr = W.mapLabel(84, 63), r = Math.round(W.zn.rate('indus') * 100);
    W.setTool('view'); W.zoomTo(0.8, innerWidth / 2, innerHeight / 2, { x: 76, y: 62 }); W.centerOn(76, 62); return { l, lb, lr, r }; });
  await pg.waitForTimeout(800);
  const sp = await pg.evaluate(() => window.WSE.tileToScreen(75, 62)); await pg.mouse.move(sp.x + 3, sp.y + 2); await pg.mouse.move(sp.x, sp.y); await pg.waitForTimeout(700);
  const tip = await pg.evaluate(() => { const e = document.getElementById('hovtip'); return e && !e.hidden ? e.textContent : ''; });
  const pop = await pg.evaluate(() => [...document.querySelectorAll('.modal:not([hidden]),#modal:not([hidden])')].filter(e => e.offsetParent).length);
  t.check('survol d\'une parcelle libre : « Terrain portuaire · subvention X % » (taux réel de la zone), dans l\'étiquette discrète, sans pop-up', h.l && h.l.t === `Terrain portuaire · subvention ${h.r} %` && /Parcelle libre/.test(h.l.s) && /Terrain portuaire · subvention \d+ %/.test(tip) && pop === 0, JSON.stringify({ l: h.l, tip, pop }));
  t.check('survol : la bande se dit « Parc à conteneurs · constructible », l\'avenue « Route »', /Parc à conteneurs/.test(h.lb.s) && h.lr.t === 'Route', JSON.stringify([h.lb, h.lr]));
  // ---- 3. audit isométrique (empreinte dessinée vs empreinte logique)
  const au = await pg.evaluate(() => { const W = window.WSE, P = W.port, o = {};
    const meas = (cv, ox, oy, k, F) => {   // cv dessiné avec l'origine iso(0, 0) en (ox, oy) px canevas, échelle k ; emprise F×F depuis (0, 0)
      const g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data, H = F * 33, Wd = F * 66; let out = 0, opq = 0, maxY = -1e9, minX = 1e9, maxX = -1e9;
      for (let py = 0; py < cv.height; py++) for (let px = 0; px < cv.width; px++) { if (d[(py * cv.width + px) * 4 + 3] < 48) continue; opq++;
        const wx = (px + 0.5) / k - ox, wy = (py + 0.5) / k - oy; minX = Math.min(minX, wx); maxX = Math.max(maxX, wx); maxY = Math.max(maxY, wy);
        const be = 2 * H - Math.abs(wx) * 0.5; if (wx < -Wd - 1.5 || wx > Wd + 1.5 || wy > be + 1.5) out++; }
      return { out, pct: +(out / (Wd * H) * 100).toFixed(2), opq, minX: +minX.toFixed(1), maxX: +maxX.toFixed(1), gap: +(2 * H - maxY).toFixed(1) }; };
    ['hangar', 'silos'].forEach(n => { const c = P.pre('audit_' + n, P.OBJ_B, P[n]), k = c.width / (c._b[2] - c._b[0]); o[n] = meas(c, -c._b[0], -c._b[1], k, 2); });
    for (let v = 0; v < P.VAR; v++) { const c = P.tile('B', v, 1), r = meas(c, 72, 64, 1, 1); if (!o.bande || r.out > o.bande.out) o.bande = r; }
    for (let v = 0; v < P.VAR; v++) { const c = P.tile('Q', v, 1), r = meas(c, 72, 64, 1, 1); if (!o.quai || r.out > o.quai.out) o.quai = r; }
    const C = P.CRU, S = P.SH; o.crane = { legsOnQuay: C.L - 0.07 >= 85 && C.S + 0.07 <= 88, boomOverShip: C.B1 > S.X1 && C.B1 < S.X1 + 1.2, laneBetweenLegs: C.LANE > C.L + 0.2 && C.LANE < C.S - 0.2 };
    o.ship = { inSea: S.X0 >= 88 && S.X1 <= 90, cellsInHull: P.cells.every(cl => cl.every(([b, r]) => { const [u, w] = P.cellUW(b, r); return u >= S.X0 && u + 0.34 <= S.X1 && w >= -S.L + 0.95 && w + 0.56 <= S.L - 1.0; })) };
    o.bandInCell = P.BAND_U[0] > 0 && P.BAND_U[1] < 1 && P.BAND_W.every(r => r[0] > 0 && r[1] < 1);
    // ordre de profondeur : objet du fond dessiné à sa case avant (la plus proche de l'observateur de son emprise)
    let front = true; const B = P.BACK_B; P.BACK.forEach(([dx, dy, n]) => { const x0 = W.PORT.x0 + B[0] * 6 + 1 + dx, y0 = W.PORT.y0 + B[1] * 6 + 1 + dy; if (P.kind(x0 + 1, y0 + 1) !== 'fond:' + n || P.kind(x0, y0) !== 'fond_' || P.kind(x0 + 1, y0) !== 'fond_' || P.kind(x0, y0 + 1) !== 'fond_') front = false; });
    o.frontCell = front; return o; });
  t.info('audit isométrique : ' + JSON.stringify(au));
  t.check('audit isométrique : hangars, silos, cases de bande et de quai dessinés dans leur emprise entière (0 pixel hors de la colonne), posés au sol (écart ≤ 6 px monde)', ['hangar', 'silos', 'bande', 'quai'].every(k => au[k].out === 0) && au.hangar.gap <= 6 && au.silos.gap <= 6, JSON.stringify(['hangar', 'silos', 'bande', 'quai'].map(k => k + ':' + au[k].out + 'px/écart ' + au[k].gap)));
  t.check('objets du fond : 2×2 cases, largeur dessinée = emprise inscrite (±124 px monde, ±3), dessinés à leur case avant', au.frontCell && ['hangar', 'silos'].every(k => Math.abs(au[k].minX + 124) <= 3 && Math.abs(au[k].maxX - 124) <= 3), JSON.stringify({ front: au.frontCell, h: [au.hangar.minX, au.hangar.maxX], s: [au.silos.minX, au.silos.maxX] }));
  t.check('portiques : jambes sur le quai, voie du quai entre les jambes, flèche au-dessus du navire ; navire en mer, conteneurs dans la cale ; bande dans sa case', Object.values(au.crane).every(Boolean) && Object.values(au.ship).every(Boolean) && au.bandInCell, JSON.stringify([au.crane, au.ship, au.bandInCell]));
  // ---- 4. navires selon l'activité ; escale animée
  const s = await pg.evaluate(() => { const W = window.WSE, S = W.S, P = W.port, o = {};
    W.step(); o.n0 = P.berths().length; o.T0 = Math.round(P.act().T);
    const row = (imp, exp) => { const r = new Array(24).fill(0); r[3 + 1] = exp; r[3 + 9] = imp; return r; };   // ordre M30F : revRetail, revExport, …, imports (colonnes 3 + i)
    const keep = S.m30, sum = a => a.reduce((x, y) => x + y, 0);
    const deck = () => { const T = P.SH.P, s0 = P.cycle(0, 0).s, at = f => sum(P.cycle(0, ((f - s0 + 1) % 1) * T).cnt), U = [], Lo = [];
      for (let f = 0.13; f <= 0.48; f += 0.0025) U.push(at(f)); for (let f = 0.52; f <= 0.86; f += 0.0025) Lo.push(at(f)); return { U, Lo, full: at(0.11), out: at(0.88) }; };
    S.m30 = new Array(30).fill(0).map(() => row(500000, 200000)); S.day++; o.n1 = P.berths().length; o.T1 = Math.round(P.act().T); o.d1 = deck(); o.cargo1 = P.cargo();
    S.m30 = new Array(30).fill(0).map(() => row(15000, 10000)); S.day++; o.n2 = P.berths().length; o.d2 = deck();
    S.m30 = keep; S.day -= 2; P.act();
    const mono = (a, dir) => a.every((v, i) => !i || (dir < 0 ? v <= a[i - 1] : v >= a[i - 1])), jump = a => Math.max(0, ...a.map((v, i) => i ? Math.abs(v - a[i - 1]) : 0));
    o.chk = [o.d1, o.d2].map(d => ({ uDown: mono(d.U, -1) && d.U[0] > d.U[d.U.length - 1], lUp: mono(d.Lo, 1) && d.Lo[d.Lo.length - 1] > d.Lo[0], jump: Math.max(jump(d.U), jump(d.Lo)), full: d.full, out: d.out, u0: d.U[0], u1: d.U[d.U.length - 1], l0: d.Lo[0], l1: d.Lo[d.Lo.length - 1] }));
    delete o.d1; delete o.d2; return o; });
  t.info(JSON.stringify(s));
  t.check('navires à quai selon l\'activité réelle : 1 au départ, 4 au-delà de 600 000 $/jour d\'échanges, 2 vers 25 000 $/jour', s.n0 === 1 && s.n1 === 4 && s.n2 === 2, JSON.stringify([s.n0, s.n1, s.n2]));
  t.check('escale : le nombre de conteneurs sur le pont décroît pendant le déchargement et croît pendant le chargement, sans saut (≤ 1 par portique entre deux instants proches)', s.chk.every(c => c.uDown && c.lUp && c.jump <= 3), JSON.stringify(s.chk.map(c => [c.uDown, c.lUp, c.jump, c.u0 + '→' + c.u1, c.l0 + '→' + c.l1])));
  t.check('cargaison proportionnelle aux échanges : navire plus chargé quand l\'import / export est élevé', s.chk[0].full + s.chk[0].out > s.chk[1].full + s.chk[1].out, JSON.stringify(s.chk.map(c => [c.full, c.out])));
  // ---- 5. rendu : trois zooms, cache borné, coût du décor, pixels des avenues
  await pg.mouse.move(5, 450); await pg.evaluate(() => { const e = document.getElementById('hovtip'); if (e) e.hidden = true; });
  const shots = []; let ms = [], road = [];
  for (const zz of [0.45, 0.8, 1.4]) { await pg.evaluate(zz => { const W = window.WSE; W.setTool('view'); W.zoomTo(zz, innerWidth / 2, innerHeight / 2, { x: 82, y: 66 }); W.centerOn(82, 66); }, zz); await pg.waitForTimeout(1500);
    ms.push(await pg.evaluate(async () => { const v = []; for (let i = 0; i < 20; i++) { await new Promise(r => requestAnimationFrame(r)); v.push(window.WSE.port.ms()); } v.sort((a, b) => a - b); return v[10]; }));
    const f = (process.env.WSE_SHOTS || '/tmp') + `/t119_port_z${zz}.png`; const buf = await pg.screenshot({ path: f }).catch(() => null); shots.push(f);
    if (zz === 0.8 && buf) { const px = await pg.evaluate(async b64 => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
        const W = window.WSE, o = []; for (let y = 56; y <= 76; y++) { if ((y - 54) % 6 === 0) continue; const p = W.tileToScreen(84, y); if (p.x < 80 || p.y < 0 || p.x > innerWidth - 260 || p.y > innerHeight - 200) continue; /* hors HUD et mini-carte */ const d = g.getImageData(Math.round(p.x * 2), Math.round(p.y * 2), 1, 1).data; o.push([y, d[0], d[1], d[2]]); } return o; }, buf.toString('base64'));
      road = px; } }
  const grey = road.filter(([, r, g, bb]) => Math.max(r, g, bb) - Math.min(r, g, bb) < 28 && (r + g + bb) / 3 < 150);
  t.check('avenue du quai dégagée : le centre de chaque case d\'avenue (x 84) est en bitume gris (pas de conteneur)', road.length >= 6 && grey.length >= road.length * 0.8, `${grey.length}/${road.length} ` + JSON.stringify(road.slice(0, 4)));
  const nt = await pg.evaluate(() => window.WSE.port.tiles());
  t.info('décor du port (médiane, ms par image, logiciel sans GPU) : ' + ms.map(x => x.toFixed(1)).join(' / ') + ' · images en cache : ' + nt + ' · captures : ' + shots.join(' '));
  t.check('décor pré-rendu : cache borné (≤ (2 sortes × 12 variantes + 5 objets) × 6 résolutions)', nt > 0 && nt <= (2 * 12 + 5) * 6, nt);
  t.check('dessin du décor portuaire < 40 ms par image en rendu logiciel (médiane, 3 zooms)', ms.every(x => x < 40), ms.map(x => x.toFixed(1)).join(' / '));
  // ---- 2 bis. construire : bloc libre, bande, bloc du fond ; décor non sauvegardé
  const p = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, P = W.port, o = {};
    const bl = P.blocks().find(q => q.free && !q.built); for (let y = bl.y0; y < bl.y0 + bl.ny && !o.f; y++) for (let x = bl.x0; x < bl.x0 + bl.nx && !o.f; x++) if (!W.footprintError(x, y, 'f1') && W.place(x, y, 'f1')) o.f = [x, y, S.grid[y * N + x].t, P.kind(x, y), W.zn.buildAid(x, y, 1000)];
    for (let y = 56; y < 84 && !o.b; y++) { const x = P.BAND_X; if (P.kind(x, y) === 'bande' && !W.footprintError(x, y, 'wh') && W.place(x, y, 'wh')) o.b = [x, y, S.grid[y * N + x].t]; }
    const B = P.BACK_B, x0 = W.PORT.x0 + B[0] * 6 + 1, y0 = W.PORT.y0 + B[1] * 6 + 1; for (let y = y0; y < y0 + 5 && !o.k; y++) for (let x = x0; x < x0 + 5 && !o.k; x++) if (/^fond/.test(P.kind(x, y)) && !W.footprintError(x, y, 'wh') && W.place(x, y, 'wh')) o.k = [x, y, S.grid[y * N + x].t];
    for (let y = 56; y < 84 && !o.q; y++) for (let x = 85; x < 88 && !o.q; x++) if (/^quai/.test(P.kind(x, y)) && !W.footprintError(x, y, 'port') && W.place(x, y, 'port')) o.q = [x, y, S.grid[y * N + x].t];
    W.save(); const sv = localStorage.getItem('wse-city-v8') || ''; o.saved = /port_parc|sol_terminal|berths|"bande"/.test(sv); return o; });
  await pg.waitForTimeout(400); const bt = await pg.evaluate(() => window.WSE.port.built());
  t.check('construire : une usine se pose dans un bloc libre (subventionnée), un entrepôt sur la bande et dans le bloc du fond (le décor du bloc s\'efface), un port sur le quai ; décor non sauvegardé', !!p.f && p.f[4] > 0 && !!p.b && !!p.k && bt.length === 1 && !!p.q && !p.saved, JSON.stringify({ p, bt }));
  t.check('0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await ctx.close();
};
