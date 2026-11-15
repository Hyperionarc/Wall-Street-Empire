#!/usr/bin/env node
/* Exporte du dessin vectoriel du jeu les gabarits PNG des sprites HD qui n'en ont pas encore :
   forme, emprise, échelle (64 px par mètre, tuile de 128 px de large) et ancre (centre de l'emprise au sol)
   sont ceux du jeu. Sortie : tools/factory_ai/gabarits/<nom>.png + ancres.json.
   Usage : NODE_PATH=$(npm root -g) node export_gabarits.js   (nécessite wall-street-empire/city.html : python3 wall-street-empire/tools/build.py)
   Ne demande rien au modèle d'images ; relancer après toute modification du dessin vectoriel. */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ICI = __dirname, OUT = path.join(ICI, 'gabarits'), HTML = path.resolve(ICI, '..', '..', 'wall-street-empire', 'city.html');

const PAGE = () => {
  const W = window.WSE, V = W.vec, TW = 128, ZS = TW / 48, M = 10;
  ['convoyeur_droit'].forEach(n => W.fac.unload(n));   // le vectoriel du convoyeur, pas le sprite
  const out = {};
  const job = (nom, pw, ph, zh, fn) => {
    const s = V.sp({ tw: TW, zs: ZS, spr: {} }, nom, pw, ph, zh, fn), cv = s.cv, g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const m = 4, w = x1 - x0 + 1 + 2 * m, h = y1 - y0 + 1 + 2 * m, c2 = document.createElement('canvas'); c2.width = w; c2.height = h; c2.getContext('2d').drawImage(cv, x0 - m, y0 - m, w, h, 0, 0, w, h);
    const ax = s.ox + (pw - ph) * TW / 4 - (x0 - m), ay = s.oy + (pw + ph) * TW / 8 - (y0 - m);
    out[nom] = { png: c2.toDataURL('image/png').split(',')[1], info: { largeur: w, hauteur: h, ancre_x: Math.round(ax), ancre_y: Math.round(ay), echelle_px_par_m: 64, source: 'vectoriel du jeu' } };
  };
  // machines (emprise 3,5 x 3,4 cases)
  job('gab_four', 3.5, 3.4, 90, (g, l) => V.machine(g, l, 'furnace', '#d8794e', 0));
  job('gab_reacteur', 3.5, 3.4, 90, (g, l) => V.machine(g, l, 'reactor', '#46d39a', 0));
  job('gab_presse', 3.5, 3.4, 90, (g, l) => V.machine(g, l, 'press', '#3f78d8', 0));
  job('gab_assemblage', 3.5, 3.4, 90, (g, l) => V.machine(g, l, 'assembly', '#46d39a', 0));
  // matières (palette de 2,2 x 2,2 cases)
  [['ingot', '#f2c14e'], ['coil', '#d9822b'], ['ring', '#2a2d36'], ['bar', '#aab4c4'], ['sheet', '#c8995a'], ['plank', '#d9b27c'], ['barrel', '#3f78d8'], ['sack', '#f1efe6'], ['ore', '#9c4a32']]
    .forEach(([sh, col]) => job('gab_mat_' + sh, 2.2, 2.2, 52, (g, l) => V.mat(g, l, sh, col, 4)));
  // camion : semi-remorque couchée selon x, cabine vers x+ (= « face » : arrière côté x min, vers le quai de vente)
  job('gab_camion_face', 5.6, 2.6, 48, (g, l) => V.truck(g, l, 'x', '#f3f5f9', '#d8403c'));
  // convoyeurs : pièce de 2,6 cases, largeur 0,9
  const belt = (nom, pw, ph, pts) => job(nom, pw, ph, 20, (g, l) => V.belt(g, l, pts, 0.9, false));
  belt('gab_conv_sud_est', 2.6, 1.3, [[0, 0.65], [2.6, 0.65]]);
  belt('gab_conv_nord_est', 1.3, 2.6, [[0.65, 0], [0.65, 2.6]]);
  belt('gab_conv_coin_ne', 2.6, 2.6, [[1.3, 0], [1.3, 1.3], [2.6, 1.3]]);
  belt('gab_conv_coin_se', 2.6, 2.6, [[2.6, 1.3], [1.3, 1.3], [1.3, 2.6]]);
  belt('gab_conv_coin_sw', 2.6, 2.6, [[1.3, 2.6], [1.3, 1.3], [0, 1.3]]);
  belt('gab_conv_coin_nw', 2.6, 2.6, [[0, 1.3], [1.3, 1.3], [1.3, 0]]);
  // murs bas (2 cases de long, 0,3 d'épaisseur, 30 de haut) et coins
  const mur = (g, l, x, y, w, d) => V.sbox(g, l, x, y, w, d, 30, '#eef1f5', '#c9cfd9', '#a3adbc', 0);
  job('gab_mur_ne', 2, 0.3, 30, (g, l) => mur(g, l, 0, 0, 2, 0.3));
  job('gab_mur_nw', 0.3, 2, 30, (g, l) => mur(g, l, 0, 0, 0.3, 2));
  job('gab_mur_ouverture_ne', 2, 0.3, 30, (g, l) => { mur(g, l, 0, 0, 0.6, 0.3); mur(g, l, 1.4, 0, 0.6, 0.3); });
  job('gab_mur_ouverture_nw', 0.3, 2, 30, (g, l) => { mur(g, l, 0, 0, 0.3, 0.6); mur(g, l, 0, 1.4, 0.3, 0.6); });
  job('gab_coin_n', 1, 1, 30, (g, l) => { mur(g, l, 0, 0, 1, 0.3); mur(g, l, 0, 0.3, 0.3, 0.7); });
  job('gab_coin_e', 1, 1, 30, (g, l) => { mur(g, l, 0, 0, 1, 0.3); mur(g, l, 0.7, 0.3, 0.3, 0.7); });
  job('gab_coin_s', 1, 1, 30, (g, l) => { mur(g, l, 0.7, 0, 0.3, 0.7); mur(g, l, 0, 0.7, 1, 0.3); });
  job('gab_coin_w', 1, 1, 30, (g, l) => { mur(g, l, 0, 0, 0.3, 0.7); mur(g, l, 0, 0.7, 1, 0.3); });
  return out;
};

(async () => {
  if (!fs.existsSync(HTML)) { console.error('city.html absent : lance python3 wall-street-empire/tools/build.py'); process.exit(1); }
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1200, height: 800 } }), errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + HTML); await pg.waitForTimeout(800);
  const res = await pg.evaluate(PAGE);
  fs.mkdirSync(OUT, { recursive: true });
  const anch = {};
  Object.keys(res).forEach(n => { fs.writeFileSync(path.join(OUT, n + '.png'), Buffer.from(res[n].png, 'base64')); anch[n + '.png'] = res[n].info; });
  fs.writeFileSync(path.join(OUT, 'ancres.json'), JSON.stringify(anch, null, 1));
  console.log(Object.keys(res).length, 'gabarits exportés dans', OUT, errs.length ? '| erreurs : ' + errs.join(' ; ') : '');
  await b.close();
})();
