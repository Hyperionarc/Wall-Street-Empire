#!/usr/bin/env node
// Captures du terminal portuaire (deviceScaleFactor 2) à plusieurs zooms, pour la vérification visuelle (journal port.md).
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/port_shots.js <préfixe> [zooms=0.35,0.7,1.2] [cx=77] [cy=68]
// Variable PORT_BUILD=1 : pose d'abord une usine et un entrepôt dans deux blocs libres du terre-plein (rendu bâti / non bâti côte à côte).
const L = require('./tests/lib.js');
(async () => {
  const pre = process.argv[2] || '/tmp/port', zs = (process.argv[3] || '0.35,0.7,1.2').split(',').map(Number), cx = +(process.argv[4] || 77), cy = +(process.argv[5] || 68);
  const b = await L.browser(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const pg = await L.newPage({ ctx, wait: 1500 }); await L.setup(pg, { cash: 5e9 });
  await pg.addStyleTag({ content: '#modesel{display:none !important}' });
  if (process.env.PORT_BUILD) await pg.evaluate(() => { const W = window.WSE; [[74, 62, 'f2'], [80, 56, 'wh'], [68, 68, 'f1']].forEach(([x, y, k]) => { if (!W.footprintError(x, y, k)) W.place(x, y, k); }); });
  const seq = (process.env.PORT_SEQ || '').split(',').filter(Boolean).map(Number);   // PORT_SEQ=0.2,0.4,… : instants de l'escale du poste 0 (fraction du cycle), horloge figée
  if (seq.length) { const zz = zs[0];
    for (const f of seq) { await pg.evaluate(([zz, cx, cy, f]) => { const W = window.WSE, P = W.port, s0 = P.cycle(0, 0).s; P.setClock(((f - s0 + 1) % 1) * P.SH.P); W.setTool('view'); W.zoomTo(zz, innerWidth / 2, innerHeight / 2, { x: cx, y: cy }); W.centerOn(cx, cy); }, [zz, cx, cy, f]);
      await pg.waitForTimeout(2500);
      const st = await pg.evaluate(f => { const P = window.WSE.port, s0 = P.cycle(0, 0).s, c = P.cycle(0, ((f - s0 + 1) % 1) * P.SH.P); return c.ph + ' ' + c.cnt.reduce((a, b) => a + b, 0); }, f);
      const fn = `${pre}_t${f}.png`; await pg.screenshot({ path: fn }); console.log(fn, st); }
    console.log('erreurs', JSON.stringify(pg.errs.slice(0, 3))); await L.closeBrowser(); return; }
  for (const zz of zs) {
    await pg.evaluate(([zz, cx, cy]) => { const W = window.WSE; W.setTool('view'); W.zoomTo(zz, innerWidth / 2, innerHeight / 2, { x: cx, y: cy }); W.centerOn(cx, cy); }, [zz, cx, cy]);
    await pg.waitForTimeout(5000);
    const f = `${pre}_z${zz}.png`; await pg.screenshot({ path: f }); console.log(f);
  }
  console.log('erreurs', JSON.stringify(pg.errs.slice(0, 3))); await L.closeBrowser();
})();
