#!/usr/bin/env node
// Captures des fermes sur la carte à 3 zooms : normal (zlv[1]), rapproché (zlv[0]) et zoom maximal (1,8), plus une 2e image au zoom maximal 0,7 s plus tard (vent, bêtes).
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/capture_fermes.js <dossier> [ferme ...] [--debug]  (--debug : contour des zones utiles en magenta)
const fs = require('fs'), path = require('path');
const L = require('./tests/lib.js');
const args = process.argv.slice(2), OUT = args[0] || '/tmp/fermes', DBG = args.includes('--debug'), ONLY = args.slice(1).filter(a => a[0] !== '-');
const DAY = (args.find(a => a.startsWith('--day=')) || '').slice(6) || null;   // --day=200 : jour de l'année (saisons de la vigne)
fs.mkdirSync(OUT, { recursive: true });
const FARMS = ['fwheat', 'fcorn', 'frapeseed', 'fsugar', 'fcotton', 'frubber', 'fvine', 'fcattle', 'fchicken', 'fpig', 'fsheep'];

(async () => {
  const pg = await L.newPage({ w: 1280, h: 900, wait: 900 });
  await pg.evaluate(() => { const W = window.WSE; W.startMode('free'); W.setCaste('industriel'); });
  await L.setup(pg, { cash: 5e10 }); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint,#mkview,#panel,.toast{display:none!important}' });
  await pg.evaluate(d => { ['caste', 'hint', 'endscr', 'modesel', 'win', 'mkview'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); window.WSE.S.cash = 3e7; window.WSE.setSpeed(1); if (d.day != null) window.WSE.S.day = +d.day; d = d.dbg; if (window.WSE.farmFx) window.WSE.farmFx.debug(d); }, { dbg: DBG, day: DAY });
  const spots = await pg.evaluate(FARMS => {
    const W = window.WSE, S = W.S, N = W.N, o = {}, CR = W.CROPS, used = new Set();
    const ok = (x, y, k) => { for (let dy = -3; dy < 6; dy++) for (let dx = -3; dx < 6; dx++) if (used.has((x + dx) + ',' + (y + dy))) return false; return !W.footprintError(x, y, k); };
    FARMS.forEach(k => {
      const g = W.TYPES[k].ext, crop = CR[g] === k;
      for (let i = 0; i < N * N && !o[k]; i++) { const x = i % N, y = (i / N) | 0; const d = S.dep[i]; if (crop ? !(d && d.k === g) : !!d) continue; if (x < 4 || y < 4 || x > N - 6 || y > N - 6) continue; if (!ok(x, y, k)) continue; if (W.place(x, y, k)) { const T = W.TYPES[k]; o[k] = [x, y, T.w || 1, T.h || 1]; for (let dy = 0; dy < (T.h || 1); dy++) for (let dx = 0; dx < (T.w || 1); dx++) used.add((x + dx) + ',' + (y + dy)); } }
    });
    return o;
  }, ONLY.length ? FARMS.filter(k => ONLY.includes(k)) : FARMS);   // seulement les fermes demandées : plus de place pour chacune
  const files = [];
  for (const k of FARMS) {
    if (ONLY.length && !ONLY.includes(k)) continue;
    const sp = spots[k]; if (!sp) { console.log('pas de place pour', k); continue; }
    for (const [nm, lv] of [['z1', 1], ['z0', 0], ['zmax', -1]]) {
      await pg.evaluate(({ sp, lv }) => { const W = window.WSE, Z = W.zlv(); W.zoomTo(lv < 0 ? 1.8 : Z[lv], 640, 450, { x: sp[0] + sp[2] / 2, y: sp[1] + sp[3] / 2 }); }, { sp, lv });
      await pg.waitForTimeout(650);
      await pg.evaluate(({ sp }) => { window.WSE.centerOn(sp[0] + sp[2] / 2 - 0.5, sp[1] + sp[3] / 2 - 0.5); }, { sp });   // centre de l'emprise (2×2 ou 3×3)
      await pg.waitForTimeout(300);
      const cl = { x: 240, y: 180, width: 800, height: 600 };
      const f = path.join(OUT, `${k}_${nm}.png`); await pg.screenshot({ path: f, clip: cl }); files.push(f);
      if (lv < 0) { await pg.waitForTimeout(700); const f2 = path.join(OUT, `${k}_zmax_b.png`); await pg.screenshot({ path: f2, clip: cl }); files.push(f2); }
    }
  }
  console.log(files.length + ' captures dans ' + OUT); if (pg.errs.length) console.log('erreurs :', pg.errs.slice(0, 3).join(' ; '));
  await L.closeBrowser();
})();
