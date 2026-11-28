#!/usr/bin/env node
// Captures de la ville de départ (100 000 habitants) et du port, à plusieurs zooms (deviceScaleFactor 2).
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/capture_ville.js <dossier> [ville|port|tout] [prefixe]
//   PORT_ACT=n : simule n jours avant les captures du port (navires selon l'activité d'import / export)
const fs = require('fs'), path = require('path');
const L = require('./tests/lib.js');
const args = process.argv.slice(2), OUT = args[0] || '/tmp/ville', WHAT = args[1] || 'tout', PRE = args[2] || '';
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await L.browser(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const pg = await L.newPage({ ctx, wait: 1500 });
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint,.toast{display:none!important}' });
  await pg.evaluate(() => { const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); if (q) { q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true })); }
    W.startMode('round', { start: 'moyenne' }); W.S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.step(); W.setTool('view'); });
  await pg.waitForTimeout(2500);
  const shot = async (n, z, x, y) => { await pg.evaluate(({ z, x, y }) => { const W = window.WSE; W.zoomTo(z, innerWidth / 2, innerHeight / 2, { x, y }); W.centerOn(x, y); }, { z, x, y }); await pg.waitForTimeout(+process.env.CAP_WAIT || 2500); const f = path.join(OUT, PRE + n + '.png'); await pg.screenshot({ path: f }); console.log(f); };
  if (WHAT !== 'port') { await shot('ville_large', 0.42, 30, 30); await shot('ville_centre', 0.8, 31, 31); await shot('ville_sud', 0.8, 34, 40); }
  if (WHAT !== 'ville') {
    if (process.env.PORT_ACT) await pg.evaluate(n => { const W = window.WSE; for (let i = 0; i < n; i++) W.step(); }, +process.env.PORT_ACT);
    if (process.env.PORT_TRADE) await pg.evaluate(v => { const S = window.WSE.S, r = new Array(24).fill(0); r[12] = v; S.m30 = new Array(30).fill(0).map(() => r.slice()); S.day++; }, +process.env.PORT_TRADE);   // échanges simulés ($ par jour, colonne « imports » des 30 derniers jours) : navires à quai
    await shot('port_large', 0.45, 76, 69); await shot('port_moyen', 0.8, 78, 66); await shot('port_proche', 1.4, 82, 62);
  }
  if (pg.errs.length) console.log('erreurs :', pg.errs.slice(0, 3).join(' ; '));
  await L.closeBrowser();
})();
