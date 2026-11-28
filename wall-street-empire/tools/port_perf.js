#!/usr/bin/env node
// Mesure des images/s sur la vue du port (ville de 100 000 habitants), après cuisson du sol : médiane de l'intervalle entre deux images (requestAnimationFrame).
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/port_perf.js [zoom=0.55] ; WSE_URL=file://.../city.html pour comparer une autre version.
const L = require('./tests/lib.js');
(async () => {
  const zz = +(process.argv[2] || 0.55);
  const pg = await L.newPage({ wait: 1500 });
  await pg.evaluate(zz => { const W = window.WSE; W.startMode('round', { start: 'moyenne' }); W.setSpeed(0); ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.setTool('view'); W.zoomTo(zz, innerWidth / 2, innerHeight / 2, { x: 78, y: 68 }); W.centerOn(78, 68); }, zz);
  await pg.waitForTimeout(9000);   // cuisson des blocs de sol
  const r = await pg.evaluate(async () => { const v = [], d = []; let t = performance.now(); for (let i = 0; i < 60; i++) { await new Promise(r => requestAnimationFrame(r)); const n = performance.now(); v.push(n - t); t = n; if (window.WSE.port) d.push(window.WSE.port.ms()); } v.sort((a, b) => a - b); d.sort((a, b) => a - b); return { med: v[30], p90: v[54], decor: d.length ? d[30] : null }; });
  console.log(JSON.stringify({ zoom: zz, ...r, errs: pg.errs.slice(0, 2) }));
  await L.closeBrowser();
})();
