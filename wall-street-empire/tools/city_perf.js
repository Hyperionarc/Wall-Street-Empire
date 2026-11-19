// Performance d'une très grande ville (passe 60) : fait croître la ville très vite (réglage accéléré par WSE.cityTune, joueur passif) jusqu'à une population cible,
// puis mesure le coût d'un jour simulé, les images par seconde du rendu (headless, logiciel) à trois zooms, le nombre d'appels de dessin par image et la taille de la sauvegarde.
// Usage : NODE_PATH=$(npm root -g) node tools/city_perf.js [population cible, 4.5e6 par défaut] [jours max, 9000] ['{"R0":9e-4,"CAP":8e6}']
// SIM_HTML=chemin/vers/city.html pour mesurer une autre version. --profil : profil CPU (CDP) de 60 jours simulés à la fin.
const { chromium } = require('playwright'); const path = require('path');
const A = process.argv.slice(2).filter(a => a[0] !== '-'), TARGET = +(A[0] || 4.5e6), DMAX = +(A[1] || 9000), TUNE = JSON.parse(A[2] || '{"R0":9e-4,"CAP":8e6}'), PROF = process.argv.includes('--profil');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + (process.env.SIM_HTML || path.resolve(__dirname, '..', 'city.html'))); await p.waitForTimeout(800);
  await p.evaluate(() => { const W = window.WSE; W.showModes(); W.startMode('round'); W.setCaste('industriel'); W.setSpeed(0); W.S.noEv = true; ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); });
  const render = () => p.evaluate(async () => {   // médiane du temps entre deux images (rendu logiciel headless : à comparer entre deux mesures de la même machine, pas en absolu)
    const W = window.WSE, raf = () => new Promise(r => requestAnimationFrame(r)), P = CanvasRenderingContext2D.prototype, out = [];
    let n = 0; const di = P.drawImage, fl = P.fill; P.drawImage = function () { n++; return di.apply(this, arguments); }; P.fill = function () { n++; return fl.apply(this, arguments); };
    for (const v of [[30, 30, 0.55], [30, 30, 0.25], [40, 40, 0.13]]) { W.view.setZ(v[2]); W.view.centerOn(v[0], v[1]); for (let i = 0; i < 30; i++) await raf();
      n = 0; const ts = []; let t = performance.now(); for (let i = 0; i < 60; i++) { await raf(); const u = performance.now(); ts.push(u - t); t = u; }
      ts.sort((a, c) => a - c); out.push({ zoom: v[2], msImage: +ts[30].toFixed(1), fps: +(1000 / ts[30]).toFixed(1), p90: +ts[54].toFixed(1), appelsDessin: Math.round(n / 60) }); }
    P.drawImage = di; P.fill = fl; return out; });
  const info = () => p.evaluate(() => { const W = window.WSE, S = W.S, c = S.city || {}; let npc = 0; S.grid.forEach(q => { if (q && q.t === 'npc') npc++; }); W.save(); const sv = localStorage.getItem('wse-city-v8') || ''; return { day: S.day, pop: Math.round(S.pop), npc, lots: c.lots, top: c.top, lv: (c.lv || []).join('/'), ext: c.ext, saveKo: Math.round(sv.length / 1024) }; });
  const r0 = await render(), i0 = await info();
  console.log('départ', JSON.stringify(i0)); r0.forEach(r => console.log('  rendu', JSON.stringify(r)));
  const curve = await p.evaluate(([T, D, tune]) => { const W = window.WSE, S = W.S; W.cityTune(tune); const o = []; let ms = 0, n = 0;
    while (S.pop < T && S.day < D) { const t0 = performance.now(); W.step(); ms += performance.now() - t0; n++; if (S.day % 500 === 0) { o.push([S.day, Math.round(S.pop), +(ms / n).toFixed(1)]); ms = 0; n = 0; } } return o; }, [TARGET, DMAX, TUNE]);
  console.log('croissance accélérée', JSON.stringify(TUNE)); curve.forEach(c => console.log('  jour', c[0], ' ', (c[1] / 1e6).toFixed(2), 'M hab ', c[2], 'ms/jour'));
  const st = await p.evaluate(() => { const W = window.WSE, S = W.S; W.cityTune({ R0: 5.6e-5 }); const t = []; for (let i = 0; i < 60; i++) { const t0 = performance.now(); W.step(); t.push(performance.now() - t0); } t.sort((a, c) => a - c); return { moy: +(t.reduce((a, c) => a + c, 0) / t.length).toFixed(1), med: +t[30].toFixed(1), max: +t[59].toFixed(1) }; });
  const r1 = await render(), i1 = await info();
  console.log('fin', JSON.stringify(i1), ' jour simulé', JSON.stringify(st)); r1.forEach(r => console.log('  rendu', JSON.stringify(r)));
  if (PROF) { const cdp = await p.context().newCDPSession(p); await cdp.send('Profiler.enable');
    const prof = async (lbl, fn, arg, per) => { await cdp.send('Profiler.start'); await p.evaluate(fn, arg); const { profile } = await cdp.send('Profiler.stop');
      const self = {}, dt = profile.timeDeltas || [], byId = {}; profile.nodes.forEach(nd => { byId[nd.id] = nd; }); (profile.samples || []).forEach((id, i) => { const nd = byId[id], k = nd.callFrame.functionName || '(anon)'; self[k] = (self[k] || 0) + (dt[i] || 0); });
      Object.entries(self).sort((a, c) => c[1] - a[1]).slice(0, 12).forEach(([k, v]) => console.log('  profil ' + lbl, k.padEnd(28), (v / 1000 / per).toFixed(2), 'ms'));
      if (process.argv.includes('--inclusif')) { const par = {}; profile.nodes.forEach(nd => (nd.children || []).forEach(ch => { par[ch] = nd.id; })); const inc = {};
        (profile.samples || []).forEach((id, i) => { const seen = new Set(); for (let q = id; q != null; q = par[q]) { const k = byId[q].callFrame.functionName || '(anon)'; if (!seen.has(k)) { seen.add(k); inc[k] = (inc[k] || 0) + (dt[i] || 0); } } });
        Object.entries(inc).sort((a, c) => c[1] - a[1]).slice(0, 30).forEach(([k, v]) => console.log('  inclusif ' + lbl, k.padEnd(28), (v / 1000 / per).toFixed(2), 'ms'));
        const pr = {}; (profile.samples || []).forEach((id, i) => { const seen = new Set(); for (let q = id; par[q] != null; q = par[q]) { const k = (byId[par[q]].callFrame.functionName || '(anon)') + ' > ' + (byId[q].callFrame.functionName || '(anon)'); if (!seen.has(k)) { seen.add(k); pr[k] = (pr[k] || 0) + (dt[i] || 0); } } });
        Object.entries(pr).sort((a, c) => c[1] - a[1]).slice(0, 40).forEach(([k, v]) => console.log('  appel ' + lbl, k.padEnd(44), (v / 1000 / per).toFixed(2), 'ms')); } };
    await prof('jour', () => { for (let i = 0; i < 60; i++) window.WSE.step(); }, null, 60);
    if (process.argv.includes('--bot')) { await p.evaluate(src => { (0, eval)(src); Object.assign(window.BOT.P, { fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false, lev: 0.45 }); window.WSE.S.cash = 2e9; for (let i = 0; i < 20; i++) { for (let k = 0; k < 4; k++) window.WSE.step(); window.BOT.tick(); } }, require('fs').readFileSync(path.join(__dirname, 'bot_lib.js'), 'utf8'));
      await prof('bot (4 jours + tick)', () => { for (let i = 0; i < 15; i++) { for (let k = 0; k < 4; k++) window.WSE.step(); window.BOT.tick(); } }, null, 15); }
    await prof('image z0,25', async () => { const W = window.WSE; W.view.setZ(0.25); W.view.centerOn(30, 30); for (let i = 0; i < 60; i++) await new Promise(r => requestAnimationFrame(r)); }, null, 60); }
  console.log(errs.length ? 'ERREURS ' + errs.slice(0, 3).join(' ; ') : '0 pageerror'); await b.close();
})();
