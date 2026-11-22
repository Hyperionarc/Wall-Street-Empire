#!/usr/bin/env node
// Captures de l'aéroport (passe 94) : vue normale et rapprochée de l'emprise (avions, aérogare, parking), série d'instantanés au fil de l'horloge
// d'animation (atterrissages / décollages), étiquette de survol, vue intérieure (panneau) et Mall central.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/capture_aeroport.js <dossier> [--serie=8] [--mobile]
const fs = require('fs'), path = require('path');
const L = require('./tests/lib.js');
const args = process.argv.slice(2), OUT = args.find(a => a[0] !== '-') || '/tmp/aeroport', SER = +((args.find(a => a.startsWith('--serie=')) || '').slice(8) || 8), MOB = args.includes('--mobile');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const W0 = MOB ? 390 : 1280, H0 = MOB ? 844 : 900;
  const pg = await L.newPage({ w: W0, h: H0, wait: 1500 });
  await L.setup(pg, { cash: 3e7 }); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint,.toast{display:none!important}' });
  await pg.evaluate(() => { const W = window.WSE; ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); try { W.mk.act('close'); } catch (e) {} W.step(); W.setTool('view'); });
  const files = [], shot = async (n, clip) => { const f = path.join(OUT, n + '.png'); await pg.screenshot(clip ? { path: f, clip } : { path: f }); files.push(f); };
  const P = await pg.evaluate(() => window.WSE.air.pos());
  const clip = MOB ? null : { x: 140, y: 110, width: 1000, height: 680 };
  for (const [nm, zz, cu, cv] of [['z_normal', 0.55, 2.6, 1.6], ['z_proche', 1.1, 2.6, 1.6], ['z_max', 1.8, 1.4, 1.9]]) {
    await pg.evaluate(({ P, zz, cu, cv }) => { const W = window.WSE; W.zoomTo(zz, innerWidth / 2, innerHeight / 2, { x: P.x + 3, y: P.y + 2 }); W.centerOn(P.x + cu, P.y + cv); }, { P, zz, cu, cv });
    await pg.waitForTimeout(700); await shot(nm, clip);
  }
  // série : l'horloge d'animation avance (W.air.anim(t) fige l'instant dessiné), au même zoom rapproché
  await pg.evaluate(({ P }) => { const W = window.WSE; W.zoomTo(1.1, innerWidth / 2, innerHeight / 2, { x: P.x + 3, y: P.y + 2 }); W.centerOn(P.x + 2.6, P.y + 1.6); }, { P }); await pg.waitForTimeout(400);
  const tl = await pg.evaluate(() => window.WSE.air.timeline(0, 3600));
  for (let i = 0; i < SER; i++) {
    const ev = tl[Math.floor(i / 4) % Math.max(1, tl.length)]; if (!ev) break;
    const t = ev.t0 + ev.dur * [0.12, 0.38, 0.62, 0.9][i % 4];
    await pg.evaluate(t => window.WSE.air.anim(t), t); await pg.waitForTimeout(250); await shot(`serie_${i}_${ev.k}_${Math.round(t)}s`, clip);
  }
  await pg.evaluate(() => window.WSE.air.anim(null));
  // survol : curseur main et étiquette « Aéroport · Entrer »
  const q = await pg.evaluate(P => { const p = window.WSE.tileToScreen(P.x + 2, P.y + 2); return [p.x, p.y]; }, P);
  await pg.mouse.move(q[0], q[1]); await pg.waitForTimeout(300); await shot('survol', clip);
  await pg.mouse.click(q[0], q[1]); await pg.waitForTimeout(400); await shot('interieur');
  await pg.evaluate(() => { document.querySelector('#airp [data-air="open"]').click(); for (let i = 0; i < 5; i++) window.WSE.step(); window.WSE.air.open(); }); await pg.waitForTimeout(300); await shot('interieur_boutique');
  await pg.evaluate(() => { window.WSE.air.close(); window.WSE.mall.open(); }); await pg.waitForTimeout(400); await shot('mall_interieur');
  console.log(files.length + ' captures dans ' + OUT); if (pg.errs.length) console.log('erreurs :', pg.errs.slice(0, 3).join(' ; '));
  await L.closeBrowser();
})();
