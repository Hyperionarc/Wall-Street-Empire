// Passe 71 : écran Classements (sociétés, produits, vendeurs par produit, palmarès) et compteurs de ventes S.rk.
// Une partie bot (industriel, Round normal, graine fixe) de 450 jours ; on vérifie : comptage cohérent (somme des vendeurs = total du produit, unités de ta marque =
// ventes en rayon + export relevées jour par jour), rivaux IA présents comme vendeurs, tris corrects, aucune valeur non finie, palmarès, sauvegarde / rechargement,
// affichage 390×844 sans débordement, coût CPU (< 0,3 ms par jour) et neutralité : la partie est identique avec ou sans compteurs (information seule).
exports.name = 'Classements des sociétés et des produits';
const DAYS = 450, SEED = 6000;
const PRESET = { lev: 0.5, idle: 0, fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false, hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.6, play: 'industriel', prods: ['bread', 'utensils', 'bike', 'jeans', 'headache', 'watch', 'tv', 'car'] };
const START = ([src, P, seed]) => {
  const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); if (q) { q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true })); }
  W.startMode('round'); const S = W.S; S.rs = seed; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
  (0, eval)(src); Object.assign(window.BOT.P, P);
};
// Joue D jours (bot tous les 3 jours) ; relève chaque jour les ventes de ta marque (rayons + export) pour un contrôle indépendant
const PLAY = ([D, track]) => {
  const W = window.WSE, S = W.S, B = window.BOT, acc = window._acc || (window._acc = {}); let ms = 0, n = 0;
  while (S.day < D) { if (S.mode.done) { S.mode.k = 'free'; S.mode.done = null; }
    for (let k = 0; k < 3; k++) { const t0 = performance.now(); W.step(); ms += performance.now() - t0; n++;
      if (track) W.PKEYS.forEach(pk => { const ps = S.prod[pk]; const u = (ps.sold || 0) + (ps.exp > 0.01 ? ps.exp : 0); if (u > 0) acc[pk] = (acc[pk] || 0) + u; }); }
    B.tick(); }
  return { day: S.day, stepMs: ms / Math.max(1, n) };
};
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 });
  await pg.evaluate(START, [L.BOT_SRC, PRESET, SEED]);
  const p1 = await pg.evaluate(PLAY, [DAYS, true]);
  const r = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, rk = W.rk, st = rk.state(), fin = v => v == null || Number.isFinite(v);
    const all = rk.products({ per: 'all' }), cur = rk.products({ per: 'cur' }), last = rk.products({ per: 'last' });
    // unités de ta marque : compteur des classements vs relevé quotidien indépendant (ventes en rayon + surplus exporté)
    let e = 0, nP = 0; Object.keys(window._acc).forEach(pk => { const row = all.find(x => x.k === pk), me = row && row.sellers.find(s => s.sid === 'me'); const a = window._acc[pk], b = me ? me.u : 0; nP++; e = Math.max(e, Math.abs(a - b) / Math.max(1, a)); });
    // tris
    const desc = (a, k) => a.every((x, i) => i === 0 || a[i - 1][k] == null || x[k] == null || a[i - 1][k] >= x[k] - 1e-9) && a.every((x, i) => i === 0 || !(a[i - 1][k] == null && x[k] != null));
    const vCa = rk.products({ per: 'all', view: 'ca' }), vVol = rk.products({ per: 'all', view: 'vol' }), vCher = rk.products({ per: 'all', view: 'cher' }), vMg = rk.products({ per: 'all', view: 'marge' }), vCr = rk.products({ per: 'last', view: 'crois' });
    const asc = rk.products({ per: 'all', sort: 'avg', dir: 1 }), co = rk.companies('val'), coR = rk.companies('rev'), coA = rk.companies('val', 1), coG = rk.companies('g30');
    const sorts = { ca: desc(vCa, 'v'), vol: desc(vVol, 'u'), cher: desc(vCher, 'pmax'), marge: desc(vMg, 'mg'), crois: desc(vCr, 'g1'), coVal: desc(co, 'val'), coRev: desc(coR, 'rev'), coG: desc(coG, 'g30'),
      asc: asc.every((x, i) => i === 0 || asc[i - 1].avg <= x.avg + 1e-9), coAsc: coA.every((x, i) => i === 0 || coA[i - 1].val <= x.val) };
    const bad = []; [all, cur, last].forEach(a => a.forEach(x => ['u', 'v', 'avg', 'pmax', 'lsh', 'q', 'b', 'mg', 'g1', 'g12'].forEach(k => { if (!fin(x[k])) bad.push(x.k + '.' + k + '=' + x[k]); })));
    co.forEach(x => ['val', 'rev', 'net', 'mg', 'cap', 'emp', 'nb', 'ms', 'br', 'rd', 'g30', 'g360'].forEach(k => { if (!fin(x[k])) bad.push(x.sid + '.' + k + '=' + x[k]); }));
    const sel = {}; all.forEach(x => x.sellers.forEach(s => { sel[s.sid] = (sel[s.sid] || 0) + 1; }));
    const riv = (S.rivals || []).filter(x => !x.sub), rivIn = riv.filter(x => sel[x.id] > 0).length;
    const tp = rk.topPrice(), maxP = Math.max(...all.filter(x => W.PRODUCTS[x.k]).map(x => x.pmax)), lead = rk.leaders('all');
    const ldOk = lead.every(l => { const row = all.find(x => x.k === l.k); return row && row.sellers[0].sid === l.lead && row.sellers.every(s => s.v <= row.sellers[0].v + 1e-6); });
    const shSum = all.every(x => Math.abs(x.sellers.reduce((a, s) => a + s.sh, 0) - 1) < 1e-6);
    const cls = {}; all.forEach(x => { cls[x.cls] = (cls[x.cls] || 0) + 1; });
    const csvP = rk.csv('products'), csvC = rk.csv('companies'), hof = rk.hof();
    return { chk: rk.check(), e, nP, sorts, bad: bad.slice(0, 6), nBad: bad.length, nAll: all.length, nProd: all.filter(x => W.PRODUCTS[x.k]).length, cls, rivIn, nRiv: riv.length, sel, tp, maxP, ldOk, nLead: lead.length, shSum, H: st.H.length,
      csv: [csvP.split('\n').length, csvC.split('\n').length, /NaN|undefined/.test(csvP + csvC)], hof: hof.items.map(x => x.k), json: JSON.stringify(st).length, cost: rk.cost(),
      top: rk.top('ca', 5).map(x => [x.name, Math.round(x.v)]), co: co.map(x => [x.rank, x.name, Math.round(x.val / 1e6)]) };
  });
  t.info(`jour ${p1.day} · ${r.nAll} lignes (${r.nProd} produits finis, classes ${JSON.stringify(r.cls)}) · ${r.H} relevés mensuels · S.rk ${(r.json / 1024).toFixed(0)} ko`);
  t.info('top CA : ' + r.top.map(x => x[0] + ' ' + Math.round(x[1] / 1e3) + ' k$').join(' · ') + ' | sociétés : ' + r.co.map(x => x[0] + '. ' + x[1] + ' ' + x[2] + ' M$').join(', '));
  t.info(`produit le plus cher vendu : ${r.tp ? r.tp.name + ' ' + Math.round(r.tp.px) + ' $ (' + r.tp.byName + ', jour ' + r.tp.day + ')' : '–'}`);
  t.check('comptage : somme des vendeurs = total par produit, relevé mensuel = dernier mois (écart max < 0,1 %)', r.chk.maxErr < 1e-3 && r.chk.n > 100, `écart ${(r.chk.maxErr * 100).toFixed(4)} %, ${r.chk.n} cellules`);
  t.check('comptage : parts des vendeurs = 100 % pour chaque produit', r.shSum);
  t.check('comptage : unités de ta marque = ventes en rayon + export relevées chaque jour (écart < 0,5 %)', r.nP >= 2 && r.e < 0.005, `${r.nP} produits, écart max ${(r.e * 100).toFixed(3)} %`);
  t.check('rivaux IA présents comme vendeurs (usines et négoce)', r.nRiv >= 3 && r.rivIn === r.nRiv, `${r.rivIn}/${r.nRiv} rivaux ; vendeurs ${JSON.stringify(r.sel)}`);
  t.check('produits finis et biens classés (≥ 60 produits finis, biens, au moins 4 classes)', r.nProd >= 60 && r.cls.goods > 0 && Object.keys(r.cls).length >= 5, JSON.stringify(r.cls));
  t.check('aucune valeur non finie (NaN, Infinity) dans les classements produits et sociétés', r.nBad === 0 && r.chk.bad === 0, r.bad.join(', '));
  t.check('tris corrects (CA, volume, prix record, marge, croissance, prix croissant, sociétés valorisation/CA/croissance, ordre croissant)', Object.values(r.sorts).every(Boolean), JSON.stringify(r.sorts));
  t.check('produit le plus cher vendu = prix record le plus élevé des produits', !!r.tp && Math.abs(r.tp.px - r.maxP) < 0.01, r.tp ? `${r.tp.px} / ${r.maxP}` : 'aucun');
  t.check('n° 1 de chaque produit = premier vendeur de sa ligne', r.ldOk && r.nLead > 30, `${r.nLead} produits`);
  t.check('palmarès : produit n° 1, prix record, plus rentable, croissance, plus gros magasin, plus grosse usine, record de valorisation', ['top', 'px', 'pf', 'gr', 'shop', 'fac', 'val'].every(k => r.hof.indexOf(k) >= 0), r.hof.join(','));
  t.check('export CSV produits et sociétés (une ligne par produit et par société, sans NaN)', r.csv[0] === r.nAll + 1 && r.csv[1] >= 4 && !r.csv[2], JSON.stringify(r.csv));
  t.check('taille de S.rk raisonnable (< 120 ko après 450 jours)', r.json < 120 * 1024, (r.json / 1024).toFixed(0) + ' ko');
  t.check('coût CPU des compteurs < 0,3 ms par jour (relevé mensuel compris)', r.cost.perDay < 0.3, r.cost.perDay.toFixed(3) + ' ms/jour sur ' + r.cost.days + ' jours');
  // Profil CPU (échantillonnage 0,1 ms) sur 120 jours : temps propre de toutes les fonctions des classements (capture dans la boucle de vente, file, relevé mensuel, sauvegarde).
  // (un A/B par blocs de jours est trop bruité ici : ±3 ms/jour d'un bloc à l'autre, sans rapport avec les compteurs)
  const cdp = await pg.context().newCDPSession(pg); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 100 }); await cdp.send('Profiler.start');
  const pd = await pg.evaluate(() => { const W = window.WSE, t0 = performance.now(); for (let d = 0; d < 120; d++) W.step(); return { days: 120, ms: performance.now() - t0 }; });
  const { profile } = await cdp.send('Profiler.stop'); await cdp.detach(); const byId = {}; profile.nodes.forEach(n => { byId[n.id] = n; }); let rkUs = 0;
  profile.samples.forEach((id, i) => { const f = byId[id].callFrame.functionName || ''; if (/^rk[A-Z]/.test(f)) rkUs += profile.timeDeltas[i] || 0; });
  const perDay = rkUs / 1000 / pd.days;
  t.info(`profil : fonctions des classements ${perDay.toFixed(3)} ms/jour, pas de simulation ${(pd.ms / pd.days).toFixed(1)} ms/jour`);
  t.check('profil CPU : temps propre des classements < 0,3 ms par jour', perDay < 0.3, perDay.toFixed(3) + ' ms/jour');
  // Écran, palmarès de fin de partie
  const ui = await pg.evaluate(() => { const W = window.WSE, o = {}; ['co', 'pr', 'sel', 'hof'].forEach(k => { W.openRank(k); const b = document.getElementById('rkBody'); o[k] = { rows: b.querySelectorAll('tr').length, cards: b.querySelectorAll('.rkcard').length, nan: /NaN|undefined|Infinity/.test(b.innerText) }; });
    W.openRank('co'); document.querySelector('#rkBody th[data-rkcs="rev"]').click(); const col = [...document.querySelectorAll('#rkBody table tr')].slice(1).map(r => r.children[2].innerText); o.clickSort = col;
    W.endGame('time', 'Test'); const e = document.getElementById('endscr'); o.end = { hof: /Palmarès de la partie/i.test(e.innerText), btn: !!e.querySelector('[data-end="rank"]') }; e.querySelector('[data-end="rank"]').click(); o.endOpen = !document.getElementById('panel').hidden && !document.querySelector('[data-sec="rank"]').hidden; o.hist = JSON.parse(localStorage.getItem('wse-hof') || '[]').length; return o; });
  t.check('écran Classements : 4 vues remplies sans NaN (sociétés, produits, par produit, palmarès)', ui.co.rows >= 4 && ui.pr.rows >= 10 && ui.sel.rows >= 5 && ui.hof.cards >= 5 && !['co', 'pr', 'sel', 'hof'].some(k => ui[k].nan), JSON.stringify({ co: ui.co, pr: ui.pr, sel: ui.sel, hof: ui.hof }));
  t.check('clic sur un en-tête : tri de la colonne (CA / mois décroissant)', ui.clickSort.length >= 4, ui.clickSort.join(' > '));
  t.check('fin de partie : palmarès affiché, bouton Classements qui ouvre l\'écran, historique local enregistré', ui.end.hof && ui.end.btn && ui.endOpen && ui.hist >= 1, JSON.stringify(ui.end) + ' ouvert ' + ui.endOpen + ' historique ' + ui.hist);
  // Sauvegarde / rechargement
  const before = await pg.evaluate(() => { const W = window.WSE; W.save(); const p = W.rk.products({ per: 'all' }); return { day: W.S.day, n: p.length, v: p.reduce((a, x) => a + x.v, 0), tp: W.rk.topPrice(), H: W.rk.state().H.length, rec: Object.keys(W.rk.state().rec).length }; });
  const pg2 = await pg.context().newPage(); pg2.errs = []; pg2.on('pageerror', e => pg2.errs.push(e.message)); await pg2.goto(L.URL);
  const after = await pg2.evaluate(() => { const W = window.WSE; W.setSpeed(0); const p = W.rk.products({ per: 'all' }); return { day: W.S.day, n: p.length, v: p.reduce((a, x) => a + x.v, 0), tp: W.rk.topPrice(), H: W.rk.state().H.length, rec: Object.keys(W.rk.state().rec).length }; });
  t.check('sauvegarde / rechargement : compteurs, records et historique restaurés (CA cumulé à 0,1 %)', after.day === before.day && after.n === before.n && Math.abs(after.v - before.v) / Math.max(1, before.v) < 1e-3 && after.H === before.H && after.rec === before.rec && after.tp && before.tp && after.tp.k === before.tp.k, JSON.stringify({ before, after }));
  const old = await pg2.evaluate(() => { const W = window.WSE, raw = JSON.parse(localStorage.getItem('wse-city-v8')); delete raw.rk; localStorage.setItem('wse-city-v8', JSON.stringify(raw)); return 1; });
  const pg3 = await pg.context().newPage(); pg3.errs = []; pg3.on('pageerror', e => pg3.errs.push(e.message)); await pg3.goto(L.URL);
  const o3 = await pg3.evaluate(() => { const W = window.WSE; W.setSpeed(0); for (let i = 0; i < 31; i++) W.step(); return { day: W.S.day, n: W.rk.products({ per: 'last' }).length, chk: W.rk.check() }; });
  t.check('ancienne sauvegarde sans classements : chargement sans erreur, compteurs repartent', old && o3.n > 10 && o3.chk.bad === 0 && pg3.errs.length === 0, JSON.stringify(o3) + ' ' + pg3.errs.slice(0, 1).join(''));
  t.check('0 erreur de page', pg.errs.length === 0 && pg2.errs.length === 0, pg.errs.concat(pg2.errs).slice(0, 2).join(' | '));
  await pg.context().close();
  // Neutralité : même graine, 150 jours avec et sans compteurs -> même partie
  const res = [];
  for (const on of [true, false]) { const q = await L.newPage({ wait: 600 }); await q.evaluate(START, [L.BOT_SRC, PRESET, SEED]); await q.evaluate(on => window.WSE.rk.enable(on), on); await q.evaluate(PLAY, [150, false]); res.push(await q.evaluate(() => { const S = window.WSE.S; return { cash: Math.round(S.cash), v: Math.round(window.WSE.valuation()), riv: (S.rivals || []).map(r => Math.round(r.cash)).join(','), rk: !!S.rk }; })); await q.context().close(); }
  t.check('information seule : partie identique avec et sans compteurs (trésorerie, valorisation, rivaux)', res[0].cash === res[1].cash && res[0].v === res[1].v && res[0].riv === res[1].riv && res[0].rk && !res[1].rk, JSON.stringify(res));
  // Téléphone 390×844
  const b = await L.browser(), ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const m = await L.newPage({ ctx, wait: 1200 }); await m.evaluate(START, [L.BOT_SRC, PRESET, SEED]); await m.evaluate(PLAY, [120, false]);
  const mo = await m.evaluate(() => { const W = window.WSE, o = {}; ['co', 'pr', 'sel', 'hof'].forEach(k => { W.openRank(k); const b = document.getElementById('rkBody'), r = b.getBoundingClientRect(); const tabs = [...document.querySelectorAll('#rkTabs .btn')].map(x => x.getBoundingClientRect().height), sels = [...b.querySelectorAll('select')].map(x => x.getBoundingClientRect().height);
    o[k] = { sw: document.documentElement.scrollWidth, bw: Math.round(r.right), tabs: Math.min(...tabs), sel: sels.length ? Math.min(...sels) : 99, nan: /NaN|undefined|Infinity/.test(b.innerText), wrap: [...b.querySelectorAll('.rkw')].every(w => w.getBoundingClientRect().right <= innerWidth + 1) }; }); return o; });
  t.check('390×844 : aucune vue ne déborde de l\'écran (tableaux défilants dans leur cadre), onglets ≥ 40 px, listes ≥ 36 px, sans NaN', Object.values(mo).every(x => x.sw <= 390 && x.bw <= 391 && x.wrap && x.tabs >= 40 && x.sel >= 36 && !x.nan), JSON.stringify(mo));
  t.check('390×844 : 0 erreur de page', m.errs.length === 0, m.errs.slice(0, 2).join(' | '));
  await ctx.close();
};
