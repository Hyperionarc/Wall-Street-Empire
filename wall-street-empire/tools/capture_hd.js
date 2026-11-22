#!/usr/bin/env node
// Passe 99 : captures de contrôle des sprites HD branchés par l'audit de couverture (docs/AUDIT_HD_COUVERTURE.md).
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/capture_hd.js <dossier> [cible ...] [--zoom=1.6]
//   cibles : bank s4 dc spharma (posés par le script), police fire drugstore hospital lycee (cases de la ville), port (quai et navires), mall (mall central, bas du parvis et parking),
//   ville100k (centre d'une ville de 100 000 habitants avec ses voitures)
const fs = require('fs'), path = require('path');
const L = require('./tests/lib.js');
const args = process.argv.slice(2), OUT = args[0] || '/tmp/capture_hd', ONLY = args.slice(1).filter(a => a[0] !== '-');
const ZOOM = +((args.find(a => a.startsWith('--zoom=')) || '').slice(7) || 1.6);
fs.mkdirSync(OUT, { recursive: true });
const PLACE = ['bank', 's4', 'dc', 'spharma'], CITYM = ['police', 'fire', 'hospital', 'lycee', 'garderie'];
(async () => {
  const pg = await L.newPage({ w: 1280, h: 900, wait: 2500 });
  await L.setup(pg, { cash: 5e10 }); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint,#mkview,#panel,.toast{display:none!important}' });
  await pg.waitForFunction(() => Object.values(window.WSE.gfx.P2_IMG).every(e => e.ok), null, { timeout: 30000 }).catch(() => {});
  const want = k => !ONLY.length || ONLY.includes(k);
  const spots = await pg.evaluate(({ PLACE, CITYM }) => {
    const W = window.WSE, S = W.S, N = W.N, o = {};
    PLACE.forEach(k => { const c = window.T.put(k, 14, 46, 14, 46) || window.T.put(k, 50, 90, 4, 90); if (c) o[k] = [c.x + c.w / 2, c.y + c.h / 2]; });
    for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'mon' && CITYM.includes(W.monBase ? W.monBase(c.m) : String(c.m).replace(/_\d+$/, '')) && !o[String(c.m).replace(/_\d+$/, '')]) o[String(c.m).replace(/_\d+$/, '')] = [c.x + 0.5, c.y + 0.5]; }
    W.vv.svc(); const d = W.vv.list().find(q => q[2] === 'drugstore'); if (d) o.drugstore = [d[0] + 0.5, d[1] + 0.5];
    let q = null; for (let i = 0; i < N * N && !q; i++) if (W.ZONE[i] === 4) q = [i % N, (i / N) | 0]; if (q) o.port = [q[0] + 2, q[1] + 4];
    const M = W.mall.pos(); if (M) { o.mall = [M.x + M.w * 0.72, M.y + M.w * 0.72]; o.mallpark = [M.x + 8.2, M.y + 3.4]; o.mallroof = [M.x + 8.4 - 2.3, M.y + 1.7 - 2.3]; }
    return o;
  }, { PLACE, CITYM });
  const files = [];
  for (const k of Object.keys(spots)) {
    if (!want(k) && !(/^mall/.test(k) && want('mall'))) continue; const sp = spots[k], zz = k === 'port' ? 0.9 : k === 'mall' ? 1.3 : /^mall/.test(k) ? 2.2 : ZOOM;
    await pg.evaluate(({ sp, zz }) => { const W = window.WSE; W.zoomTo(zz, 640, 450, { x: sp[0], y: sp[1] }); }, { sp, zz }); await pg.waitForTimeout(500);
    await pg.evaluate(({ sp }) => window.WSE.centerOn(sp[0] - 0.5, sp[1] - 0.5), { sp }); await pg.waitForTimeout(700);
    const f = path.join(OUT, k + '.png'); await pg.screenshot({ path: f, clip: { x: 240, y: 150, width: 800, height: 600 } }); files.push(f);
  }
  console.log(JSON.stringify(spots)); console.log(files.join('\n')); if (pg.errs.length) console.log('erreurs :', pg.errs.slice(0, 3).join(' ; '));
  await L.closeBrowser();
})();
