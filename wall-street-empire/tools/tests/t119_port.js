// Le port ressemble à un vrai terminal industriel (retour de Rémy : « ça ressemble à rien ton port », référence : terminal à conteneurs de Dunkerque) :
//  1. terre-plein clair : toutes les cases de la zone portuaire en béton clair (sol_terminal), plus d'aplat d'asphalte sombre ;
//  2. agencement ordonné : parc à conteneurs côté quai (≥ 100 cases), fond du port en silos, hangars et terminal vrac (≥ 20), front de quai continu (une case de bord par rangée) ;
//  3. navires à quai selon l'activité réelle d'import / export : 1 au départ, 4 quand les échanges dépassent le dernier seuil, et les portiques suivent les postes occupés ;
//  4. décor pur : les bâtiments du port restent posables sur une case de parc ou de quai (le décor s'efface), rien n'est sauvegardé ;
//  5. images pré-rendues en cache borné, dessin du décor peu coûteux, 0 erreur ; déterminisme (hash).
exports.name = 'Terminal portuaire';
exports.run = async (t, L) => {
  const b = await L.browser(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const pg = await L.newPage({ ctx, wait: 1500 }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const a = await pg.evaluate(() => { const W = window.WSE, N = W.N, P = W.port, G = W.ground, Z = W.ZONE, K = {}; let asph = 0, term = 0, edge = {};
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const z = Z[y * N + x]; if (z === 2 && !G.kind(x, y)[0].startsWith('route_')) { const n = G.kind(x, y)[0]; if (n === 'sol_terminal') term++; else if (n === 'sol_port_asphalte') asph++; }
      const k = P.kind(x, y).replace(/:.*/, ''); if (k) K[k] = (K[k] || 0) + 1; if (k === 'quai_bord') edge[y] = 1; }
    const fond = {}; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const k = P.kind(x, y); if (k.startsWith('fond:')) fond[k.slice(5)] = (fond[k.slice(5)] || 0) + 1; }
    const P0 = W.PORT, rows = []; for (let y = P0.y0; y <= P0.y1; y++) rows.push(edge[y] ? 1 : 0);
    let det = true; for (let i = 0; i < 200; i++) { const x = 60 + (i * 7) % 30, y = 50 + (i * 13) % 38; if (P.kind(x, y) !== P.kind(x, y)) det = false; }
    return { asph, term, K, fond, rows: rows.join(''), det }; });
  t.info(JSON.stringify(a));
  t.check('terre-plein clair : la zone portuaire est en béton clair (sol_terminal), plus d\'asphalte sombre', a.term > 300 && a.asph === 0, `${a.term} cases claires · ${a.asph} sombres`);
  t.check('parc à conteneurs côté quai (≥ 100 cases) et fond du port en silos, hangars, vrac (≥ 20 cases, 3 sortes)', (a.K.parc || 0) >= 100 && (a.K.fond || 0) >= 20 && Object.keys(a.fond).length === 3, JSON.stringify({ parc: a.K.parc, fond: a.fond }));
  t.check('front de quai continu (bord de quai sur toutes les rangées du port) avec voie et rangée de quai', !/0/.test(a.rows.slice(1, -1)) && (a.K.quai_voie || 0) >= 25 && (a.K.quai_parc || 0) >= 25, a.rows);
  t.check('agencement déterministe', a.det);
  // ---- 3. navires selon l'activité
  const s = await pg.evaluate(() => { const W = window.WSE, S = W.S, P = W.port, o = {};
    W.step(); o.n0 = P.berths().length; o.T0 = Math.round(P.act().T);
    const row = (imp, exp) => { const r = new Array(24).fill(0); r[3 + 1] = exp; r[3 + 9] = imp; return r; };   // ordre M30F : revRetail, revExport, …, imports (colonnes 3 + i)
    const keep = S.m30; S.m30 = new Array(30).fill(0).map(() => row(500000, 200000)); S.day++; o.n1 = P.berths().length; o.T1 = Math.round(P.act().T);
    S.m30 = new Array(30).fill(0).map(() => row(15000, 10000)); S.day++; o.n2 = P.berths().length;
    S.m30 = keep; S.day -= 2; return o; });
  t.check('navires à quai selon l\'activité réelle : 1 au départ (le port public importe pour la ville), 4 au-delà de 600 000 $/jour d\'échanges, 2 vers 25 000 $/jour', s.n0 === 1 && s.n1 === 4 && s.n2 === 2, JSON.stringify(s));
  // ---- 5. rendu : trois zooms, cache borné, coût du décor
  const shots = []; let ms = [];
  for (const zz of [0.45, 0.8, 1.4]) { await pg.evaluate(zz => { const W = window.WSE; W.setTool('view'); W.zoomTo(zz, innerWidth / 2, innerHeight / 2, { x: 80, y: 66 }); W.centerOn(80, 66); }, zz); await pg.waitForTimeout(1500);
    ms.push(await pg.evaluate(async () => { const v = []; for (let i = 0; i < 20; i++) { await new Promise(r => requestAnimationFrame(r)); v.push(window.WSE.port.ms()); } v.sort((a, b) => a - b); return v[10]; }));
    const f = (process.env.WSE_SHOTS || '/tmp') + `/t119_port_z${zz}.png`; await pg.screenshot({ path: f }).catch(() => {}); shots.push(f); }
  const nt = await pg.evaluate(() => window.WSE.port.tiles());
  t.info('décor du port (médiane, ms par image, logiciel sans GPU) : ' + ms.map(x => x.toFixed(1)).join(' / ') + ' · images en cache : ' + nt);
  t.check('parc pré-rendu : cache borné (≤ 2 sortes × 12 variantes × 6 résolutions)', nt > 0 && nt <= 2 * 12 * 6, nt);
  t.check('dessin du décor portuaire < 40 ms par image en rendu logiciel (médiane, 3 zooms)', ms.every(x => x < 40), ms.map(x => x.toFixed(1)).join(' / '));
  // ---- 4. décor pur : bâtiments du port toujours posables
  const p = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, P = W.port, o = {};
    for (let y = 56; y < 84 && !o.f; y++) for (let x = 79; x < 84 && !o.f; x++) if (P.kind(x, y) === 'parc' && !W.footprintError(x, y, 'f1') && W.place(x, y, 'f1')) o.f = [x, y, S.grid[y * N + x].t];
    for (let y = 56; y < 84 && !o.q; y++) for (let x = 85; x < 88 && !o.q; x++) if (/^quai/.test(P.kind(x, y)) && !W.footprintError(x, y, 'port') && W.place(x, y, 'port')) o.q = [x, y, S.grid[y * N + x].t];
    W.save(); const sv = localStorage.getItem('wse-city-v8') || ''; o.saved = /port_parc|sol_terminal|berths/.test(sv); return o; });
  t.check('une usine se pose sur une case du parc à conteneurs, un port sur le quai (le décor s\'efface) ; le décor n\'est pas sauvegardé', !!p.f && !!p.q && !p.saved, JSON.stringify(p));
  t.check('0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await ctx.close();
};
