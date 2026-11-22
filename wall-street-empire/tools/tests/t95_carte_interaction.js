// Passe 95 : interaction avec la carte. Vérifie :
//  1. zoom : 5 paliers à rapport constant ; les boutons +/− et la molette passent d'un palier au voisin (jamais deux crans), y compris depuis le cadrage initial hors palier
//     et en cliquant plus vite que l'animation ; vue satellite floue réservée au palier le plus haut ;
//  2. étiquette de survol discrète (une ou deux lignes) : forêt (arbres, m³), gisement (quantité et unité réelle, richesse), bâtiment (nom, propriétaire) ; épinglée au clic sur un gisement ;
//  3. outil Extraction automatique : le bon extracteur est posé selon le gisement (pétrole → puits, fer → mine de fer, granulats → carrière, bois → bûcherons), à la taille choisie ;
//  4. glisser-poser : plusieurs extracteurs d'un coup, devis = débit, déjà exploités ignorés, fonds insuffisants → les plus rentables d'abord.
exports.name = 'Carte : zoom, étiquettes, extraction automatique';
exports.run = async (t, L) => {
  const pg = await L.newPage({ w: 1280, h: 900, wait: 900 });
  await pg.evaluate(() => { const W = window.WSE; W.startMode('free'); W.setCaste('industriel'); });
  await L.setup(pg, { cash: 3e8 });
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint,#mkview,.toast{display:none!important}' });
  // ---- 1. zoom
  const zr = await pg.evaluate(() => { const L = window.WSE.zlv(), r = []; for (let i = 0; i < 4; i++) r.push(L[i] / L[i + 1]); return r; });
  t.check('zoom : 5 paliers à rapport constant', zr.length === 4 && Math.max(...zr) / Math.min(...zr) < 1.001, zr.map(v => v.toFixed(3)).join(' '));
  const z0 = await pg.evaluate(() => window.WSE.zoomZ), seq = [z0];
  for (let i = 0; i < 6; i++) { await pg.click('#zout'); await pg.waitForTimeout(330); seq.push(await pg.evaluate(() => window.WSE.zoomZ)); }
  for (let i = 0; i < 5; i++) { await pg.click('#zin'); await pg.waitForTimeout(330); seq.push(await pg.evaluate(() => window.WSE.zoomZ)); }
  const lv = await pg.evaluate(() => window.WSE.zlv()), onL = z => lv.some(v => Math.abs(Math.log(z / v)) < 0.01);
  const ins = seq.slice(7, 11).map((z, i) => z / seq[6 + i]);   // 4 crans du palier 4 au palier 0 (le 5e clic bute sur le palier 0)
  t.check('zoom : chaque clic sur + depuis le dézoom maximal avance d\'un seul palier, même rapport à chaque fois', seq.slice(6).every(onL) && ins.every(q => Math.abs(q - zr[0]) / zr[0] < 0.01), ins.map(v => v.toFixed(3)).join(' '));
  const sat = await pg.evaluate(() => { const W = window.WSE, L = W.zlv(); return L.map(z => z < 0.115 && z < L[4] * 1.3); });
  t.check('zoom : vue satellite seulement au palier le plus haut', sat.filter(Boolean).length <= 1 && !sat.slice(0, 4).some(Boolean), sat.join(','));
  // clics rapides (plus vite que l'animation) : aucun clic perdu ni doublé
  await pg.evaluate(() => window.WSE.zoomTo(window.WSE.zlv()[4])); await pg.waitForTimeout(400);
  await pg.click('#zin'); await pg.waitForTimeout(60); await pg.click('#zin'); await pg.waitForTimeout(500);
  const zf = await pg.evaluate(() => window.WSE.zoomZ);
  t.check('zoom : deux clics rapides sur + = deux paliers exactement', Math.abs(Math.log(zf / lv[2])) < 0.01, zf.toFixed(3) + ' attendu ' + lv[2].toFixed(3));
  // depuis un zoom hors palier (cadrage initial, pincement) : palier voisin, pas deux crans
  const mid = Math.sqrt(lv[1] * lv[2]) * 1.15; await pg.evaluate(z => { const W = window.WSE; W.zoomTo(z); }, mid); await pg.waitForTimeout(400);
  await pg.click('#zin'); await pg.waitForTimeout(400); const zm = await pg.evaluate(() => window.WSE.zoomZ);
  t.check('zoom : hors palier, + va au palier voisin', Math.abs(Math.log(zm / lv[1])) < 0.01, zm.toFixed(3) + ' attendu ' + lv[1].toFixed(3));
  // ---- 2. étiquettes
  const sp = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, o = {}; for (let i = 0; i < N * N; i++) { const d = S.dep[i]; if (!d || S.grid[i]) continue; const k = d.k === 'wood' ? 'wood' : W.CROPS[d.k] ? 'crop' : d.k; if (!o[k]) o[k] = [i % N, (i / N) | 0]; } return o; });
  await pg.evaluate(() => { const W = window.WSE; W.setTool('view'); W.zoomTo(W.zlv()[1]); }); await pg.waitForTimeout(400);
  const hov = async tt => { await pg.evaluate(q => window.WSE.centerOn(q[0], q[1]), tt); await pg.waitForTimeout(200); const q = await pg.evaluate(q => window.WSE.tileToScreen(q[0], q[1]), tt); await pg.mouse.move(q.x, q.y + 2); await pg.waitForTimeout(60); await pg.mouse.move(q.x, q.y + 4); await pg.waitForTimeout(120); return pg.evaluate(() => { const e = document.getElementById('hovtip'); return { vis: !e.hidden, txt: e.innerText.replace(/\n/g, ' | '), h: e.offsetHeight, w: e.offsetWidth }; }); };
  const hw = await hov(sp.wood), ho = await hov(sp.oil), hi = await hov(sp.iron);
  t.check('survol d\'une forêt : « Forêt · N arbres » et bois en m³', hw.vis && /^Forêt · [\d\s\u202f\u00a0]+ arbres/.test(hw.txt) && /m³ de bois/.test(hw.txt), hw.txt);
  t.check('survol d\'un gisement de pétrole : quantité en barils et richesse', ho.vis && /^Pétrole · [\d\s\u202f\u00a0,]+( M)? barils/.test(ho.txt) && /Gisement (riche|moyen|pauvre)/.test(ho.txt), ho.txt);
  t.check('survol d\'un gisement de fer : quantité en tonnes', hi.vis && /^Fer · [\d\s\u202f\u00a0,]+ (Mt|t)/.test(hi.txt), hi.txt);
  t.check('étiquette discrète : deux lignes au plus, petite (< 70 px de haut, < 280 px de large)', ho.h < 70 && ho.w < 280, ho.w + '×' + ho.h);
  // clic sur le gisement : étiquette épinglée, aucun panneau
  { await pg.evaluate(q => window.WSE.centerOn(q[0], q[1]), sp.oil); await pg.waitForTimeout(150); const q = await pg.evaluate(q => window.WSE.tileToScreen(q[0], q[1]), sp.oil); await pg.mouse.click(q.x, q.y + 4); await pg.waitForTimeout(250);
    const r = await pg.evaluate(() => ({ pin: document.getElementById('hovtip').classList.contains('pin') && !document.getElementById('hovtip').hidden, panels: ['bwin', 'pfiche', 'xquote'].filter(i => { const e = document.getElementById(i); return e && !e.hidden; }) }));
    t.check('clic sur un gisement : étiquette épinglée, pas de panneau', r.pin && !r.panels.length, JSON.stringify(r)); }
  // ---- 3. outil automatique : le bon extracteur, à la bonne taille
  const auto = await pg.evaluate(sp => { const W = window.WSE, S = W.S, N = W.N, o = {};
    [['oil', 'xp'], ['iron', 'xm'], ['gravel', 'xg'], ['wood', 'xp']].forEach(([k, tl]) => { const q = sp[k]; if (!q) { o[k] = null; return; } const ok = W.place(q[0], q[1], tl), c = S.grid[q[1] * N + q[0]]; o[k] = { ok, t: c && c.t, lvl: c && c.lvl }; });
    o.none = W.place(5, 5, 'xp'); return o; }, sp);
  t.check('extraction automatique : pétrole → puits, fer → mine de fer (taille moyenne = niveau 2), granulats → carrière (grosse = niveau 3), bois → bûcherons',
    auto.oil && auto.oil.t === 'well' && auto.oil.lvl === 0 && auto.iron && auto.iron.t === 'miron' && auto.iron.lvl === 1 && auto.gravel && auto.gravel.t === 'qgravel' && auto.gravel.lvl === 2 && auto.wood && auto.wood.t === 'logging' && !auto.none, JSON.stringify(auto));
  // ---- 4. glisser-poser : devis = débit
  const mult = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; let best = null;
    for (let y = 2; y < N - 6 && !best; y++) for (let x = 2; x < N - 6 && !best; x++) { let n = 0, k0 = null; for (let dy = 0; dy < 5; dy++) for (let dx = 0; dx < 5; dx++) { const i = (y + dy) * N + x + dx, d = S.dep[i]; if (d && !W.CROPS[d.k] && d.k !== 'wood' && !S.grid[i]) { n++; k0 = d.k; } } if (n >= 4) best = [x, y]; }
    if (!best) return null; const p = W.xauto.plan(best[0], best[1], best[0] + 4, best[1] + 4, 0), c0 = S.cash, r = W.xauto.exec(p);
    const p2 = W.xauto.plan(best[0], best[1], best[0] + 4, best[1] + 4, 0);
    return { n: p.items.length, total: p.total, spent: r.spent, placed: r.n, used2: p2.skip.used, items2: p2.items.length, cashDelta: c0 - S.cash, rew: r.rew }; });
  t.check('glisser-poser : plusieurs extracteurs posés d\'un coup, débit = total du devis', mult && mult.n >= 2 && mult.placed === mult.n && Math.abs(mult.spent - mult.total) < 1, JSON.stringify(mult));
  t.check('glisser-poser : la même zone une 2e fois = gisements déjà exploités ignorés, rien à poser', mult && mult.used2 >= mult.n && mult.items2 === 0, mult && (mult.used2 + ' ignorés'));
  const poor = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; const all = W.xauto.plan(0, 0, N - 1, N - 1, 0); if (all.items.length < 3) return null;
    const keep = S.cash; const sc = all.items.map(i => i.total).sort((a, b) => a - b); S.cash = sc[0] + sc[1] + 1; const p = W.xauto.plan(0, 0, N - 1, N - 1, 0); const r = { n: p.items.length, poor: p.poor, tot: p.total, cash: S.cash, sorted: p.items.every((it, i, a) => !i || a[i - 1].score >= it.score) }; S.cash = keep; return r; });
  t.check('fonds insuffisants : seules les installations finançables, les plus rentables d\'abord, le reste signalé', poor && poor.n >= 1 && poor.poor > 0 && poor.tot <= poor.cash && poor.sorted, JSON.stringify(poor));
  // devis affiché (interface) puis annulé : rien n'est débité
  const ui = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, p = W.xauto.plan(0, 0, N - 1, 40, 1); W.xauto.quote(p); const e = document.getElementById('xquote'), txt = e.innerText, c0 = S.cash; e.querySelector('[data-xq="no"]').click(); return { vis: /Total · \d+ installation/.test(txt) && /construction .* \+ terrain .* \+ droit d'exploitation .* \+ agrandissement/.test(txt), closed: e.hidden, same: S.cash === c0 }; });
  t.check('devis : lignes lisibles (construction + terrain + droit + agrandissement = total), Annuler ne débite rien', ui.vis && ui.closed && ui.same, JSON.stringify(ui));
  t.check('aucune erreur JavaScript', !pg.errs.length, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();
};
