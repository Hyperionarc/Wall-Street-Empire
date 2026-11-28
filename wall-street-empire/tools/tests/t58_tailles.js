// Barème des tailles et grille stricte : chaque type a l'emprise de docs/BAREME_TAILLES.md (supermarché 2×2, hypermarché 3×3 hors du centre dense, hôpital 3×3, collège 2×2, lycée 3×2…),
// plus de gare dans la ville vivante, aucune emprise qui se chevauche (contrôle mathématique de la grille) sur 3 villes générées, sur la ville après 2 ans de croissance et sur des
// constructions du joueur, sprites d'une case centrés sur leur case, recalage (snap) de la pose, ancienne sauvegarde migrée aux nouvelles emprises, écran de téléphone, aucun NaN.
exports.name = 'Barème des tailles et grille stricte';
const fs = require('fs'), path = require('path');
const SHOTS = process.env.WSE_SHOTS || '/tmp';
const hide = pg => pg.evaluate(() => { ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); const b = document.querySelector('[data-sg="close"]'); if (b) b.click(); try { window.WSE.mk.act('close'); } catch (e) {} });
exports.run = async (t, L) => {
  // ---- 1. Barème : code, document, règles
  let pg = await L.newPage({ wait: 2600 }); await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg); await hide(pg);
  const b = await pg.evaluate(() => { const W = window.WSE, F = W.fp, T = W.TYPES, cells = k => (T[k].w || 1) * (T[k].h || 1);
    return { rules: F.rules(), keys: Object.keys(T), fp: Object.keys(T).map(k => [k, (T[k].w || 1) + '×' + (T[k].h || 1)]), s1: cells('s1'), s2: cells('s2'), s3: cells('s3'), s3peri: !!T.s3.peri, s4: cells('s4'), sauto: cells('sauto'), hq: T.hq.w + '×' + T.hq.h,
      towers: ['tech', 'off', 'bank', 'res'].every(k => cells(k) === 1), mon: F.MON_FP, wse: ['TYPES', 'place', 'footprintError', 'save', 'load', 'sign', 'vv', 'mall', 'spec'].every(k => !!W[k]) }; });
  t.check('barème : chaque type de TYPES a exactement l\'emprise du barème (FP_BAREME)', b.rules.length === 0, b.rules.slice(0, 6).join(' · '));
  const doc = fs.readFileSync(path.resolve(__dirname, '..', '..', 'docs', 'BAREME_TAILLES.md'), 'utf8');
  const miss = b.fp.filter(([k, f]) => !new RegExp('`' + k + '`[^\\n]*\\b' + f.replace('×', '\\s*×\\s*') + '\\b').test(doc));
  t.check(`docs/BAREME_TAILLES.md : les ${b.keys.length} types y figurent avec leur emprise`, miss.length === 0, miss.slice(0, 8).map(m => m.join(' ')).join(', '));
  t.check('petite boutique et petit marché 1 case, supermarché 4 cases (2×2), hypermarché ≥ 8 cases et conseillé en périphérie', b.s1 === 1 && b.s2 === 4 && b.s3 >= 8 && b.s3peri, JSON.stringify({ s1: b.s1, s2: b.s2, s3: b.s3, peri: b.s3peri }));
  t.check('concession automobile ≥ 2×2 (parking des voitures exposées) ; tours 1 case, siège 2×2, méga-centre 3×3 inchangés', b.sauto >= 4 && b.towers && b.hq === '2×2' && b.s4 === 9, JSON.stringify({ sauto: b.sauto, hq: b.hq, s4: b.s4 }));
  const M = b.mon, area = m => (M[m] ? M[m][0] * M[m][1] : 1);
  t.check('équipements publics : hôpital ≥ 3×3, collège 2×2, lycée 3×2, maternelle et crèche 1 case', area('hospital') >= 9 && M.hospital[0] >= 3 && M.hospital[1] >= 3 && area('college') === 4 && M.lycee && M.lycee.join('×') === '3×2' && area('maternelle') === 1 && area('garderie') === 1, JSON.stringify(M));
  t.check('window.WSE : exports conservés, window.WSE.fp ajouté', b.wse, '');

  // ---- 2. Plus de gare
  const g = await pg.evaluate(() => { const W = window.WSE; W.vv.svc(); return { svc: Object.keys(W.vv.SVC).filter(n => /gare/.test(n)), list: W.vv.list().filter(q => /gare/.test(q[2])).length, sign: Object.keys(W.sign.SIGN).filter(k => /gare/.test(k)) }; });
  t.check('plus de gare : ni service de quartier, ni gare posée dans la ville, ni enseigne', !g.svc.length && !g.list && !g.sign.length, JSON.stringify(g));

  // ---- 3. Hypermarché : plus refusé au centre (liberté de construire, docs/journal/construction.md : le sol cher et le conseil au survol incitent), posé en périphérie
  const h = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, F = W.fp; let cen = null, per = null, nc = 0;
    for (let y = 12; y < 49; y++) for (let x = 12; x < 49; x++) { const d = F.periDist(x, y, 3, 3), e = W.footprintError(x, y, 's3'); if (d < 9) { nc++; if (!cen && /périphérie|centre dense/.test(e)) cen = { x, y, e }; } if (!per && !e && d >= 12) per = { x, y, d }; }
    const n0 = S.grid.filter(c => c && c.t === 's3').length, ok = per ? W.place(per.x, per.y, 's3') : false, c = per && S.grid[per.y * N + per.x];
    return { cen, per, ok, t: c && c.t, w: c && c.w, h: c && c.h, n: S.grid.filter(c => c && c.t === 's3').length - n0 }; });
  t.check('hypermarché : plus de refus « centre dense » (seules l\'emprise libre et le prix du sol comptent)', !h.cen, h.cen ? h.cen.e : 'aucun refus de zone au centre');
  t.check('hypermarché posé en périphérie (≥ 12 cases du centre) sur une emprise 3×3', h.ok && h.t === 's3' && h.w === 3 && h.h === 3 && h.per.d >= 12, JSON.stringify(h.per) + ' ' + h.w + '×' + h.h);

  // ---- 4. Recalage (snap) : la case pointée est dans l'emprise posée, emprise valide et centrée
  const sn = await pg.evaluate(() => { const W = window.WSE, F = W.fp, out = []; [['s2', 2, 2], ['s3', 3, 3], ['sauto', 2, 2], ['f3', 2, 2]].forEach(([k, w, hh]) => {
      for (let y = 10; y < 90; y += 3) for (let x = 10; x < 90; x += 3) { const a = F.snap(x, y, k); if (W.footprintError(a.x, a.y, k)) continue; out.push({ k, ok: x >= a.x && x < a.x + w && y >= a.y && y < a.y + hh && Number.isInteger(a.x) && Number.isInteger(a.y) }); if (out.filter(q => q.k === k).length >= 6) return; } }); return out; });
  t.check('recalage de la pose : coin entier, la case pointée est toujours dans l\'emprise valide retenue', sn.length >= 12 && sn.every(q => q.ok), `${sn.filter(q => q.ok).length}/${sn.length}`);

  // ---- 5. Non-chevauchement des emprises : 3 villes générées, constructions du joueur, ville après croissance
  const ov = await pg.evaluate(() => { const W = window.WSE, F = W.fp, r = {};
    ['town', 'dense', 'old'].forEach(k => { const gr = F.city(k); r[k] = { bad: F.audit(gr), n: gr.filter(c => c && c.t === 'npc').length, mon: gr.filter(c => c && c.t === 'npc' && c.k === 'mon' && c.m === 'hospital').length }; });
    return r; });
  ['town', 'dense', 'old'].forEach(k => t.check(`ville générée « ${k} » : aucune emprise qui se chevauche, maisons et immeubles sur 1 case, hôpital sur 9 cases`, ov[k].bad.length === 0 && ov[k].n > 200 && ov[k].mon === 9, ov[k].bad.slice(0, 3).join(' · ') + ` (${ov[k].n} cases PNJ, hôpital ${ov[k].mon})`));
  const pl = await pg.evaluate(() => { const W = window.WSE, S = W.S, T = window.T; const keys = ['s1', 's2', 's3', 's4', 'sauto', 'stech', 'smode', 'shome', 'sbrico', 'res', 'tech', 'hq', 'immo', 'btp', 'f1', 'f2', 'f3', 'f4', 'wh', 'port', 'plant', 'ewh'];
    let n = 0; for (let r = 0; r < 3; r++) keys.forEach(k => { if (T.build(k)) n++; }); ['fwheat', 'fcattle', 'miron', 'well'].forEach(k => { if (T.depBuild(k, T.EXT[k] || ({ fcattle: 'wheat' })[k])) n++; });
    const bad0 = W.fp.audit(); T.stepN(720, true); return { n, bad0, bad1: W.fp.audit(), nan: T.scan(), errs: 0 }; });
  t.check(`constructions du joueur (${pl.n} bâtiments posés au hasard) : aucune emprise qui se chevauche`, pl.n >= 40 && pl.bad0.length === 0, pl.bad0.slice(0, 3).join(' · '));
  t.check('après 2 ans de croissance de la ville : aucune emprise qui se chevauche', pl.bad1.length === 0, pl.bad1.slice(0, 3).join(' · '));
  t.check('aucun NaN / Infinity dans l\'état de la partie', pl.nan.length === 0, pl.nan.slice(0, 4).join(', '));

  // ---- 6. Sprites d'une case centrés sur leur case (calcul : bas de la silhouette = sommet avant de la case)
  const sp = await pg.evaluate(() => window.WSE.fp.spr());
  const offP = Object.keys(sp.p2).filter(n => Math.abs(sp.p2[n]) > 0.25), offC = Object.keys(sp.city).filter(n => Math.abs(sp.city[n]) > 0.25);
  t.check(`sprites d'une case de la ville vivante (${Object.keys(sp.p2).length}) : silhouette posée sur sa case (écart ≤ 0,25 case)`, Object.keys(sp.p2).length >= 15 && offP.length === 0, offP.map(n => n + ' ' + sp.p2[n]).join(', '));
  t.check(`maisons et immeubles HD de la ville (${Object.keys(sp.city).length}) : silhouette posée sur sa case (écart ≤ 0,25 case)`, Object.keys(sp.city).length >= 10 && offC.length === 0, offC.map(n => n + ' ' + sp.city[n]).join(', '));
  t.check('chargement et simulation : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' ; '));
  await pg.context().close();

  // ---- 7. Ancienne sauvegarde (supermarché 2×1, hypermarché 2×2, hôpital sur 1 case) migrée aux nouvelles emprises, sans perte
  pg = await L.newPage({ wait: 2600 }); await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg); await hide(pg);
  const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, T = window.T; const a = T.inC('s2'), b = T.build('s3'), r = T.inC('res'), f = T.inP('f1');
    W.save(); const d = JSON.parse(localStorage.getItem('wse-city-v8')), ia = a.x + a.y * N, ib = b.x + b.y * N;
    d.g.forEach((q, j) => { if (Array.isArray(q) && q[0] === 'part' && ((q[1] === ia && q[3] >= 1) || (q[1] === ib && (q[2] >= 2 || q[3] >= 2)))) d.g[j] = 0; });   // ancienne emprise : 2×1 et 2×2
    const H = W.fp.MON_FP.hospital, hc = d.cty.filter(q => q[2] === 'mon' && q[5] === 'hospital'), keep = hc.find(q => q[0] === 45 && q[1] === 33) || hc[hc.length - 1];
    d.cty = d.cty.filter(q => !(q[2] === 'mon' && q[5] === 'hospital') || q === keep); let nh = 0; hc.forEach(q => { if (q !== keep && nh < 2) { d.cty.push([q[0], q[1], 'house', 1, 0.5, 0]); nh++; } });   // l'hôpital d'avant : 1 case, des maisons autour
    localStorage.setItem('wse-city-v8', JSON.stringify(d));
    const nb = S.grid.filter(c => c && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part').length; return { a: [a.x, a.y], b: [b.x, b.y], nb, cash: Math.round(d.cash), done: d.done || [], hospCells: hc.length, H }; });
  await pg.reload(); await pg.waitForTimeout(2600);
  const mg = await pg.evaluate(sv => { const W = window.WSE, S = W.S, N = W.N, grab = (x, y) => S.grid[y * N + x];
    const cnt = (x, y, w, h, ai) => { let n = 0; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const q = grab(x + i, y + j); if (q && (q === grab(x, y) || (q.t === 'part' && q.ai === ai))) n++; } return n; };
    const s2 = S.grid.find(c => c && c.t === 's2'), s3 = S.grid.find(c => c && c.t === 's3'), hc = S.grid.filter(c => c && c.t === 'npc' && c.k === 'mon' && c.m === 'hospital');
    return { s2: s2 && [s2.x, s2.y, s2.w, s2.h, cnt(s2.x, s2.y, s2.w, s2.h, s2.x + s2.y * N)], s3: s3 && [s3.x, s3.y, s3.w, s3.h, cnt(s3.x, s3.y, s3.w, s3.h, s3.x + s3.y * N)], hosp: hc.length, nb: S.grid.filter(c => c && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part').length, cash: Math.round(S.cash - W.acq.MISSIONS.filter(m => S.done.includes(m.id) && !sv.done.includes(m.id)).reduce((a, m) => a + (m.r || 0), 0)), bad: W.fp.audit(), errs: 0 }; }, sv);   // trésorerie de la sauvegarde, hors primes de missions validées au chargement
  t.info(`avant : supermarché ${sv.a}, hypermarché ${sv.b}, hôpital ${sv.hospCells} → 1 case · après : supermarché ${mg.s2}, hypermarché ${mg.s3}, hôpital ${mg.hosp} cases`);
  t.check('ancienne sauvegarde : supermarché 2×1 → 2×2 et hypermarché 2×2 → 3×3 (4 et 9 cases à eux), hôpital d\'une case → 3×3', mg.s2 && mg.s2[2] * mg.s2[3] === 4 && mg.s2[4] === 4 && mg.s3 && mg.s3[2] * mg.s3[3] === 9 && mg.s3[4] === 9 && mg.hosp === 9, JSON.stringify(mg));
  t.check('migration sans perte : mêmes bâtiments du joueur, rien de payé ni remboursé (écart de trésorerie < 50 k$ : au plus une journée de jeu), aucune emprise qui se chevauche', mg.nb === sv.nb && Math.abs(mg.cash - sv.cash) < 5e4 && mg.bad.length === 0, JSON.stringify({ nb: [sv.nb, mg.nb], cash: [sv.cash, mg.cash], bad: mg.bad.slice(0, 3) }));
  const mg2 = await pg.evaluate(() => { const W = window.WSE; W.save(); return W.fp.audit().length; }); await pg.reload(); await pg.waitForTimeout(2200);
  const mg3 = await pg.evaluate(() => { const W = window.WSE, S = W.S; return { bad: W.fp.audit(), s3: S.grid.filter(c => c && c.t === 's3').map(c => c.w * c.h) }; });
  t.check('sauvegarde migrée relue à l\'identique (wse-city-v8)', mg2 === 0 && mg3.bad.length === 0 && mg3.s3.join() === '9', JSON.stringify(mg3));
  t.check('migration et rechargements : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' ; '));
  await pg.context().close();

  // ---- 8. Écran de téléphone : hypermarché et supermarché dessinés à leur emprise, sans erreur
  const mp = await L.newPage({ wait: 2600, w: 390, h: 844 }); await mp.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(mp, { cash: 5e8 }); await L.inject(mp); await hide(mp);
  const mo = await mp.evaluate(() => { const W = window.WSE, T = window.T; const c3 = T.build('s3'), c2 = T.inC('s2'); W.setTool('view'); W.view.setZ(0.7); W.centerOn(c3.x + 1.5, c3.y + 1.5); return { c3: [c3.x, c3.y, c3.w, c3.h], c2: c2 && [c2.w, c2.h] }; });
  await mp.waitForTimeout(900); await hide(mp); await mp.screenshot({ path: SHOTS + '/t58_mobile.png' }).catch(() => {});
  const mm = await mp.evaluate(() => { const W = window.WSE, d = W.sign.drawn; return { plates: d.filter(s => /HYPERMARCH/.test(s.txt)).length, bad: W.fp.audit().length, sw: document.documentElement.scrollWidth, vw: window.innerWidth }; });
  t.check('téléphone (390 × 844) : hypermarché 3×3 dessiné avec sa plaque, pas de défilement horizontal, 0 erreur', mo.c3[2] === 3 && mm.plates === 1 && mm.bad === 0 && mm.sw <= mm.vw + 1 && mp.errs.length === 0, JSON.stringify(Object.assign(mo, mm)) + ' ' + mp.errs.slice(0, 2).join(' ; '));
  await mp.context().close();

  // ---- 9. Nouvelle partie : hôpital, lycée, collège, hôtel de ville et stades à l'emprise du barème, dessinés par leur sprite HD (jamais le repli vectoriel)
  const np = await L.newPage({ wait: 2600 });
  const eq = await np.evaluate(() => { const W = window.WSE; W.startMode('free'); W.setCaste('industriel'); W.setSpeed(0); const S = W.S, N = W.N, F = W.fp, out = {};
    Object.keys(F.MON_FP).forEach(m => { const fp = F.MON_FP[m], cs = S.grid.filter(c => c && c.t === 'npc' && c.k === 'mon' && c.m === m), c0 = cs[0];
      const one = c0 && cs.every(c => c.mx === c0.mx && c.my === c0.my && c.mw === fp[0] && c.mh === fp[1] && c.x >= c.mx && c.x < c.mx + c.mw && c.y >= c.my && c.y < c.my + c.mh);
      const lots = c0 && cs.every(c => W.ZONE[c.y * N + c.x] === 1 && c.x % 6 !== 0 && c.y % 6 !== 0);   // jamais sur une avenue ni une rue
      let spr = null; if (c0) { const a = S.grid[c0.my * N + c0.mx]; try { spr = W.audit.solo(Object.assign({}, a, { w: a.mw, h: a.mh }), 0.3).spr; } catch (e) { spr = 'erreur ' + e.message; } }
      out[m] = { n: cs.length, want: fp[0] * fp[1], one: !!one, lots: !!lots, spr, hd: W.vv.MON[m] }; });
    return { out, bad: F.audit() }; });
  const eqBad = Object.keys(eq.out).filter(m => { const o = eq.out[m]; if (m === 'stadium2' && o.n === 0) return false; /* urbanisme : le second stade est retiré de la ville de départ */ return o.n !== o.want || !o.one || !o.lots; });
  t.check('nouvelle partie : hôpital 3×3, lycée 3×2, collège, hôtel de ville et stades 2×2 — exactement leur emprise, sur des lots (ni rue ni voisin), WSE.fp.audit() vide', eqBad.length === 0 && eq.bad.length === 0, JSON.stringify(eqBad.map(m => [m, eq.out[m]])) + ' ' + eq.bad.slice(0, 3).join(' · '));
  const sprBad = Object.keys(eq.out).filter(m => !(m === 'stadium2' && eq.out[m].n === 0) && eq.out[m].spr !== eq.out[m].hd);
  t.check('nouvelle partie : chaque équipement dessiné par son sprite HD sur son emprise (hopital_ville, lycee, college, hotel_de_ville, stade_sport), aucun repli vectoriel', sprBad.length === 0, Object.keys(eq.out).map(m => m + '=' + eq.out[m].spr).join(' '));
  // ancienne sauvegarde : hôpital sur 1 case entouré de bâtiments du joueur → reconstruit à 3×3 sur le lot libre le plus proche, sans toucher au joueur
  const os = await np.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; S.cash = 5e9;
    const hs = S.grid.filter(c => c && c.t === 'npc' && c.k === 'mon' && c.m === 'hospital'), k = hs[0], kx = k.mx + 1, ky = k.my + 1;
    hs.forEach(c => { S.grid[c.y * N + c.x] = null; }); let placed = 0;
    for (let y = ky - 2; y <= ky + 2; y++) for (let x = kx - 2; x <= kx + 2; x++) { if (x === kx && y === ky) continue; const c = S.grid[y * N + x]; if (c && c.t === 'npc' && c.k !== 'mon') S.grid[y * N + x] = null; if (!S.grid[y * N + x] && !W.footprintError(x, y, 'res') && W.place(x, y, 'res')) placed++; }
    const h1 = { t: 'npc', k: 'mon', m: 'hospital', seed: 0.5, floors: 1, lvl: 0, w: 1, h: 1, x: kx, y: ky, born: 0, alertUntil: -1, conn: true, rev: 0, out: 0, prod: null, lm: false }; S.grid[ky * N + kx] = h1;
    W.save(); const nb = S.grid.filter(c => c && c.t === 'res').length; return { placed, nb, at: [kx, ky] }; });
  await np.reload(); await np.waitForTimeout(2600);
  const ol = await np.evaluate(() => { const W = window.WSE, S = W.S, hs = S.grid.filter(c => c && c.t === 'npc' && c.k === 'mon' && c.m === 'hospital'); return { n: hs.length, fp: hs[0] && [hs[0].mx, hs[0].my, hs[0].mw, hs[0].mh], nb: S.grid.filter(c => c && c.t === 'res').length, bad: W.fp.audit() }; });
  t.check('ancienne sauvegarde : hôpital d\'une case entouré par le joueur → 3×3 sur le lot libre le plus proche, bâtiments du joueur intacts, aucune emprise qui se chevauche', os.placed >= 6 && ol.n === 9 && ol.fp && ol.fp[2] === 3 && ol.fp[3] === 3 && ol.nb === os.nb && ol.bad.length === 0, JSON.stringify({ os, ol: Object.assign({}, ol, { bad: ol.bad.slice(0, 3) }) }));
  t.check('nouvelle partie et sauvegarde relue : 0 erreur de page', np.errs.length === 0, np.errs.slice(0, 3).join(' ; '));
  await np.context().close();
};
