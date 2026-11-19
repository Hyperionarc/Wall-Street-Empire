// Mesure de la croissance de la ville : population à jours donnés, en passif (aucune action) ou avec le bot actif, pour des réglages donnés.
// Usage : NODE_PATH=$(npm root -g) node tools/city_growth.js '{"R0":5.6e-5,"CAP":1e6,"REL":0}' [passif|bot] [jours] [pas]
// Une ligne tous les « pas » jours (360 par défaut) : population, capacité, chômage, emplois/actifs, lots libres, blocs ajoutés, plus haut immeuble,
// niveaux de densité, équipements publics, coût moyen d'un jour simulé ; puis une ligne CSV « jour;population » pour tracer la courbe.
// SIM_HTML=chemin/vers/city.html pour mesurer une autre version (par exemple celle d'avant un changement).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const tune = JSON.parse(process.argv[2] || '{}'), mode = process.argv[3] || 'passif', DAYS = +(process.argv[4] || 7200), STEP = +(process.argv[5] || 360), botSrc = fs.readFileSync(path.join(__dirname, 'bot_lib.js'), 'utf8');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + (process.env.SIM_HTML || path.resolve(__dirname, '..', 'city.html'))); await p.waitForTimeout(500);
  const out = await p.evaluate(async ([tune, mode, DAYS, STEP, src]) => {
    const W = window.WSE; W.showModes(); W.startMode('round'); const S = W.S; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    W.cityTune(tune); if (mode === 'bot') { (0, eval)(src); Object.assign(window.BOT.P, { fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false, lev: 0.45 }); }
    const res = []; let next = STEP, ms = 0, d0 = S.day;
    const mons = () => { const k = {}; S.grid.forEach(c => { if (c && c.t === 'npc' && c.k === 'mon' && c.m !== 'mall' && c.m !== 'air') k[c.m] = 1; }); return Object.keys(k).length; };
    while (S.day < DAYS) { const t0 = performance.now(); for (let k = 0; k < 4; k++) W.step(); if (mode === 'bot') window.BOT.tick(); ms += performance.now() - t0;
      if (S.day >= next) { const st = S.stats || {}, c = S.city || {}; res.push({ d: S.day, pop: Math.round(S.pop), cap: Math.round(st.cap || 0), unemp: +(st.unemp || 0).toFixed(3), jr: +(c.jobsRatio || 0).toFixed(2), popE: Math.round(W.mall.popE ? W.mall.popE() : 0), lots: c.lots, free: c.free, ext: c.ext, top: c.top, lv: (c.lv || []).join('/'), mons: mons(), ms: +(ms / (S.day - d0)).toFixed(1) }); next += STEP; } }
    return res;
  }, [tune, mode, DAYS, STEP, botSrc]);
  console.log(JSON.stringify(tune), mode, errs.length ? 'ERREURS ' + errs.slice(0, 3).join(' ; ') : '0 pageerror');
  out.forEach(r => console.log(String(r.d).padStart(6), 'j', (r.pop / 1000).toFixed(0).padStart(6), 'k hab', ' cap', (r.cap / 1000).toFixed(0), 'k  popE', (r.popE / 1000).toFixed(0), 'k  chômage', (r.unemp * 100).toFixed(1), '%  emplois/actifs', r.jr, ' lots libres', r.free + '/' + r.lots, ' blocs', r.ext, ' plus haut', r.top, ' niveaux', r.lv, ' équip.', r.mons, ' ', r.ms, 'ms/j'));
  console.log('CSV', out.map(r => r.d + ';' + r.pop).join(' '));
  await b.close();
})();
