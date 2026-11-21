#!/usr/bin/env node
// Captures des fermes sur la carte à 3 zooms : normal (zlv[1]), rapproché (zlv[0]) et zoom maximal (1,8), plus une 2e image au zoom maximal 0,7 s plus tard (vent, bêtes).
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/capture_fermes.js <dossier> [ferme ...] [--debug] [--size=36]  (--debug : contour des zones utiles en magenta ;
//   --size=N : passe 87, chaque ferme est agrandie jusqu'à N cases (corps de ferme + champs ou pâturages annexés))
const fs = require('fs'), path = require('path');
const L = require('./tests/lib.js');
const args = process.argv.slice(2), OUT = args[0] || '/tmp/fermes', DBG = args.includes('--debug'), ONLY = args.slice(1).filter(a => a[0] !== '-');
const DAY = (args.find(a => a.startsWith('--day=')) || '').slice(6) || null;
const SIZE = +((args.find(a => a.startsWith('--size=')) || '').slice(7) || 0);   // --day=200 : jour de l'année (saisons de la vigne)
fs.mkdirSync(OUT, { recursive: true });
const FARMS = ['fwheat', 'fcorn', 'frapeseed', 'fsugar', 'fcotton', 'frubber', 'fvine', 'fcattle', 'fchicken', 'fpig', 'fsheep'];

(async () => {
  const pg = await L.newPage({ w: 1280, h: 900, wait: 900 });
  await pg.evaluate(() => { const W = window.WSE; W.startMode('free'); W.setCaste('industriel'); });
  await L.setup(pg, { cash: 5e10 }); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint,#mkview,#panel,.toast{display:none!important}' });
  await pg.evaluate(d => { ['caste', 'hint', 'endscr', 'modesel', 'win', 'mkview'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); window.WSE.S.cash = 3e7; window.WSE.setSpeed(1); if (d.day != null) window.WSE.S.day = +d.day; d = d.dbg; if (window.WSE.farmFx) window.WSE.farmFx.debug(d); }, { dbg: DBG, day: DAY });
  const spots = await pg.evaluate(({ FARMS, SIZE }) => {
    const W = window.WSE, S = W.S, N = W.N, o = {}, CR = W.CROPS, used = new Set(), M = SIZE ? Math.ceil(Math.sqrt(SIZE)) + 3 : 6;
    const room = (x, y) => { if (!SIZE) return true; const m = Math.ceil(Math.sqrt(SIZE)); for (let dy = 0; dy < m; dy++) for (let dx = 0; dx < m; dx++) { const X = x + dx, Y = y + dy; if (X >= N || Y >= N) return false; const j = Y * N + X, d = S.dep[j]; if (W.ZONE[j] !== 0 || S.grid[j] || (d && !CR[d.k]) || (S.npcFarm && S.npcFarm[j])) return false; } return true; };
    const ok = (x, y, k) => { for (let dy = -3; dy < M; dy++) for (let dx = -3; dx < M; dx++) if (used.has((x + dx) + ',' + (y + dy))) return false; return room(x, y) && !W.footprintError(x, y, k); };
    FARMS.forEach(k => {
      const g = W.TYPES[k].ext, crop = CR[g] === k;
      for (let i = 0; i < N * N && !o[k]; i++) { const x = i % N, y = (i / N) | 0; const d = S.dep[i]; if (crop ? !(d && d.k === g) : !!d) continue; if (x < 4 || y < 4 || x > N - 6 || y > N - 6) continue; if (!ok(x, y, k)) continue; if (W.place(x, y, k)) { const c = S.grid[y * N + x]; if (SIZE && W.farmx) { let n = 0; while (c.w * c.h < SIZE && n++ < 20 && W.farmx.grow(c, 'free')); } o[k] = [x, y, c.w, c.h]; for (let dy = 0; dy < c.h; dy++) for (let dx = 0; dx < c.w; dx++) used.add((x + dx) + ',' + (y + dy)); } }
    });
    return o;
  }, { FARMS: ONLY.length ? FARMS.filter(k => ONLY.includes(k)) : FARMS, SIZE });   // seulement les fermes demandées : plus de place pour chacune
  const files = [];
  for (const k of FARMS) {
    if (ONLY.length && !ONLY.includes(k)) continue;
    const sp = spots[k]; if (!sp) { console.log('pas de place pour', k); continue; }
    for (const [nm, lv] of [['z1', 1], ['z0', 0], ['zmax', -1]]) {
      await pg.evaluate(({ sp, lv }) => { const W = window.WSE, Z = W.zlv(); W.zoomTo(lv < 0 ? 1.8 : Z[lv], 640, 450, { x: sp[0] + sp[2] / 2, y: sp[1] + sp[3] / 2 }); }, { sp, lv });
      await pg.waitForTimeout(650);
      await pg.evaluate(({ sp }) => { window.WSE.centerOn(sp[0] + sp[2] / 2 - 0.5, sp[1] + sp[3] / 2 - 0.5); }, { sp });   // centre de l'emprise (2×2 ou 3×3)
      await pg.waitForTimeout(300);
      const cl = SIZE ? { x: 40, y: 50, width: 1200, height: 800 } : { x: 240, y: 180, width: 800, height: 600 };
      const f = path.join(OUT, `${k}_${nm}.png`); await pg.screenshot({ path: f, clip: cl }); files.push(f);
      if (lv < 0) { await pg.waitForTimeout(700); const f2 = path.join(OUT, `${k}_zmax_b.png`); await pg.screenshot({ path: f2, clip: cl }); files.push(f2); }
    }
  }
  console.log(files.length + ' captures dans ' + OUT); if (pg.errs.length) console.log('erreurs :', pg.errs.slice(0, 3).join(' ; '));
  await L.closeBrowser();
})();
