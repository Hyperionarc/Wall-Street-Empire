#!/usr/bin/env node
// Rendu procédural 3D des sprites de bâtiments (écoles, pharmacie…) : Three.js 0.160.0 dans Chromium headless (Playwright, WebGL SwiftShader).
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/sprites_procedural/render.js [noms…] [--out dossier]
//   Prérequis : (cd wall-street-empire/tools/sprites_procedural && npm install) — installe three@0.160.0 dans ce dossier (ou THREE_DIR=<dossier du paquet three>).
//   Sortie par défaut : assets/phase2_hd/<nom>.png (racine du dépôt), intégrés par tools/build.py (P2_NAMES) comme les autres sprites HD ;
//   meta.json : taille, losange de la dalle et bandeaux d'enseigne (px de l'image) de chaque sprite, repris par le jeu (SF, enseignes de façade).
// Définitions des bâtiments : batiments.js ; bibliothèque (textures, matériaux, toits, fenêtres, arbres, rendu GTAO) : lib3d.js.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const HERE = __dirname, REPO = path.resolve(HERE, '..', '..', '..');
const args = process.argv.slice(2), oi = args.indexOf('--out'), OUT = oi >= 0 ? path.resolve(args[oi + 1]) : path.join(REPO, 'assets', 'phase2_hd');
const names = args.filter((a, i) => !a.startsWith('--') && !(oi >= 0 && i === oi + 1));
const THREE_DIR = process.env.THREE_DIR || path.join(HERE, 'node_modules', 'three');
if (!fs.existsSync(path.join(THREE_DIR, 'build', 'three.module.js'))) { console.error('three introuvable : (cd ' + HERE + ' && npm install) ou THREE_DIR=…'); process.exit(1); }
const ver = JSON.parse(fs.readFileSync(path.join(THREE_DIR, 'package.json'), 'utf8')).version; if (ver !== '0.160.0') console.warn('attention : three ' + ver + ' (rendus de référence faits avec 0.160.0)');
const HOST = 'http://wse-proc.local';
const HTML = `<!doctype html><html><head><meta charset="utf-8"><script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script></head>
<body style="margin:0;background:#888"><script type="module">import * as Bt from '/src/batiments.js'; window.Bt = Bt; window.ready = true;</script></body></html>`;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
  await pg.route(HOST + '/**', r => {
    const u = new URL(r.request().url()).pathname; let f = null;
    if (u === '/' || u === '/index.html') return r.fulfill({ contentType: 'text/html', body: HTML });
    if (u.startsWith('/three/')) f = path.join(THREE_DIR, u.slice(7)); else if (u.startsWith('/src/')) f = path.join(HERE, u.slice(5));
    if (!f || !fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
    r.fulfill({ contentType: f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream', body: fs.readFileSync(f) });
  });
  await pg.goto(HOST + '/index.html'); await pg.waitForFunction(() => window.ready, null, { timeout: 30000 });
  const all = await pg.evaluate(() => Object.keys(window.Bt.SPRITES)); const todo = names.length ? names : all;
  fs.mkdirSync(OUT, { recursive: true }); const mf = path.join(HERE, 'meta.json'); const meta = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')) : {};
  for (const n of todo) {
    if (!all.includes(n)) { console.error('inconnu :', n, '(connus :', all.join(', ') + ')'); continue; }
    const t0 = Date.now(); const r = await pg.evaluate(n => window.Bt.render(n), n);
    fs.writeFileSync(path.join(OUT, n + '.png'), Buffer.from(r.png.split(',')[1], 'base64'));
    if (OUT === path.join(REPO, 'assets', 'phase2_hd')) meta[n] = { w: r.w, h: r.h, cases: r.cases, dia: r.dia, signs: r.signs };
    console.log(n, r.w + '×' + r.h, 'enseignes', JSON.stringify(r.signs), ((Date.now() - t0) / 1000).toFixed(1) + ' s');
  }
  if (OUT === path.join(REPO, 'assets', 'phase2_hd')) fs.writeFileSync(mf, JSON.stringify(meta, null, 1) + '\n');
  const bad = errs.filter(e => !/GPU stall|THREE.WebGLRenderer|Automatic fallback|swiftshader|WebGL/i.test(e)); if (bad.length) console.log('messages de la page :', bad.slice(0, 8).join(' | '));
  await b.close();
})();
