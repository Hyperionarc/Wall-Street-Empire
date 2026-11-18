// Mesure de la croissance de la ville : population à jours donnés, en passif (aucune action) ou avec le bot actif, pour des réglages donnés.
// Usage : NODE_PATH=$(npm root -g) node tools/city_growth.js '{"R0":5.6e-5,"CAP":1e6,"REL":0}' [passif|bot] [jours]
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const tune = JSON.parse(process.argv[2] || '{}'), mode = process.argv[3] || 'passif', DAYS = +(process.argv[4] || 7200), botSrc = fs.readFileSync(path.join(__dirname, 'bot_lib.js'), 'utf8');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 900 } }); await p.goto('file://' + (process.env.SIM_HTML || path.resolve(__dirname, '..', 'city.html'))); await p.waitForTimeout(500);
  const out = await p.evaluate(async ([tune, mode, DAYS, src]) => {
    const W = window.WSE; W.showModes(); W.startMode('round'); const S = W.S; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    W.cityTune(tune); if (mode === 'bot') { (0, eval)(src); Object.assign(window.BOT.P, { fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false, lev: 0.45 }); }
    const marks = [360, 720, 1080, 1800, 2700, 3600, 5400, 7200, 10800, 14400, 19200].filter(d => d <= DAYS), res = []; let mi = 0;
    while (S.day < DAYS && mi < marks.length) { for (let k = 0; k < 4; k++) W.step(); if (mode === 'bot') window.BOT.tick(); if (S.day >= marks[mi]) { res.push({ d: S.day, pop: Math.round(S.pop), cap: Math.round((S.stats || {}).cap || 0), unemp: +((S.stats || {}).unemp || 0).toFixed(3), lots: (S.city || {}).free, top: (S.city || {}).top }); mi++; } }
    return res;
  }, [tune, mode, DAYS, botSrc]);
  console.log(JSON.stringify(tune), mode); out.forEach(r => console.log(String(r.d).padStart(6), 'j', (r.pop / 1000).toFixed(0).padStart(6), 'k hab', ' cap', (r.cap / 1000).toFixed(0), 'k  chômage', (r.unemp * 100).toFixed(1), '% lots libres', r.lots, 'plus haut', r.top));
  await b.close();
})();
