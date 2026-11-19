#!/usr/bin/env node
// Passe 57 : audit automatisé du débordement des sprites de bâtiments.
// Chaque type (bâtiments du joueur : sprites P2/HD, sprites de ville, composition procédurale ; bâtiments PNJ de la ville générée, un exemplaire par sprite)
// est rendu SEUL, hors écran, avec les fonctions de dessin du jeu (WSE.audit.solo), à plusieurs zooms. On mesure :
//   (a) débordement latéral : pixels opaques hors de la colonne de son emprise (losange w×h prolongé vers le haut), rapportés à la case voisine (sol ou route)
//       la plus mordue, en % de l'aire d'une case ;
//   (b) masque des voisins devant : pixels du bâtiment dans la colonne d'un voisin posé devant ses flancs (case x + w ou y + h, hauteur d'une case)
//       quand ce voisin est dessiné AVANT lui, en % de cette colonne ; « old » = ordre d'origine (case avant), « new » = ordre de la passe 57 (centre).
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/audit_overlap.js [--json fichier] [--seuil 6]
// Sortie : tableau type | sprite | débordement lat. % | masque voisin % (old → new), puis la liste des dépassements du seuil.
const path = require('path');
const ZOOMS = [0.35, 0.7];
const SEUIL = 6;

// Code exécuté dans la page : renvoie une ligne par type audité.
function pageAudit(ZOOMS) {
  const W = window.WSE, A = W.audit, S = W.S, N = W.N, TW = A.TW, TH = A.TH, iso = A.iso;
  const measure = (a, s) => {
    const r = A.solo(a, s), g = r.cv.getContext('2d'), im = g.getImageData(0, 0, r.cv.width, r.cv.height).data, cw = r.cv.width, ch = r.cv.height;
    const L = iso(a.x, a.y + a.h), R = iso(a.x + a.w, a.y), B = iso(a.x + a.w, a.y + a.h);
    const be = wx => wx <= B.x ? L.y + (wx - L.x) * (B.y - L.y) / (B.x - L.x) : B.y + (wx - B.x) * (R.y - B.y) / (R.x - B.x);
    const tol = 1.5, per = new Map(); let tot = 0, opq = 0;
    // voisins devant les flancs : colonne d'une case, hauteur d'une case (TW px monde)
    const nb = []; for (let j = -1; j <= a.h; j++) nb.push([a.x + a.w, a.y + j]); for (let i = -1; i < a.w; i++) nb.push([a.x + i, a.y + a.h]);
    const NB = nb.map(([nx, ny]) => { const l = iso(nx, ny + 1), rr = iso(nx + 1, ny), b = iso(nx + 1, ny + 1); return { nx, ny, l, r: rr, b, old: A.before(a, nx, ny, 'old'), nw: A.before(a, nx, ny, 'new'), c: 0 }; });
    const nbe = (n, wx) => wx <= n.b.x ? n.l.y + (wx - n.l.x) * (n.b.y - n.l.y) / (n.b.x - n.l.x) : n.b.y + (wx - n.b.x) * (n.r.y - n.b.y) / (n.r.x - n.b.x);
    for (let py = 0; py < ch; py++) for (let px = 0; px < cw; px++) {
      if (im[(py * cw + px) * 4 + 3] < 48) continue; opq++;
      const wx = r.x0 + (px + 0.5) / s, wy = r.y0 + (py + 0.5) / s;
      for (const n of NB) if (wx > n.l.x && wx < n.r.x) { const e = nbe(n, wx); if (wy <= e && wy >= e - TW) n.c++; }
      const inX = wx >= L.x - tol && wx <= R.x + tol;
      if (inX && wy <= be(Math.min(R.x, Math.max(L.x, wx))) + tol) continue;   // dans la colonne de l'emprise : normal
      let wyg = wy; if (!inX) wyg = Math.max(wy, wx < L.x ? L.y : R.y);   // débordement latéral en hauteur : rapporté à la case voisine au pied de la colonne
      const u = Math.floor((wx / (TW / 2) + wyg / (TH / 2)) / 2), v = Math.floor((wyg / (TH / 2) - wx / (TW / 2)) / 2);
      if (u >= a.x && u < a.x + a.w && v >= a.y && v < a.y + a.h) continue;
      const k = u + ',' + v; per.set(k, (per.get(k) || 0) + 1); tot++;
    }
    const tile = TW * TH / 2 * s * s, col = TW * TW * s * s;
    let worst = 0, wk = ''; per.forEach((c, k) => { if (c > worst) { worst = c; wk = k; } });
    const mOld = Math.max(0, ...NB.filter(n => n.old).map(n => n.c)) / col * 100, mNew = Math.max(0, ...NB.filter(n => n.nw).map(n => n.c)) / col * 100;
    return { spr: r.spr, lat: worst / tile * 100, tile: wk, tot: tot / tile * 100, mOld, mNew, opq };
  };
  const rows = [], seen = new Set();
  const run = (label, a) => {
    const s0 = A.solo(a, 0.05).spr; if (seen.has(label + '|' + s0)) return;   // un exemplaire par sprite
    const ms = ZOOMS.map(s => measure(a, s)), m = ms.reduce((p, q) => ({ lat: Math.max(p.lat, q.lat), mOld: Math.max(p.mOld, q.mOld), mNew: Math.max(p.mNew, q.mNew), tot: Math.max(p.tot, q.tot) }), { lat: 0, mOld: 0, mNew: 0, tot: 0 });
    const spr = ms[ms.length - 1].spr, key = label + '|' + spr; if (seen.has(key)) return; seen.add(key);
    rows.push({ type: label, spr, w: a.w, h: a.h, lat: m.lat, tot: m.tot, tile: ms[ms.length - 1].tile, mOld: m.mOld, mNew: m.mNew, opq: ms[ms.length - 1].opq, nan: ms.some(q => ![q.lat, q.mOld, q.mNew].every(Number.isFinite)) });
  };
  // 1. Bâtiments du joueur : cellule de synthèse posée sur sol plat (hors grille), plusieurs niveaux pour ceux qui changent de sprite
  const skip = new Set(['road', 'part', 'npc', 'pylon', 'cable', 'pipeline', 'terra', 'zone', 'bull', 'view', 'up', 'link', 'keep', 'buyout']);
  Object.keys(W.TYPES).filter(k => !skip.has(k) && W.TYPES[k] && W.TYPES[k].name).forEach(k => {
    [0, 2, 4].forEach(lv => { if (lv && !['s2', 's3', 'hq', 'res', 'tech'].includes(k)) return;
      const a = A.mkCell(k, 0.37); a.x = 20; a.y = 20; a.lvl = lv; if (k === 'res') a.floors = 1 + lv * 2; a.born = null; delete a.works;
      try { run(k + (lv ? ' niv.' + lv : ''), a); } catch (e) { rows.push({ type: k, spr: 'ERREUR ' + e.message, w: a.w, h: a.h, lat: NaN, mOld: NaN, mNew: NaN, nan: true }); } });
  });
  // 2. Bâtiments PNJ de la ville générée : un exemplaire par sprite (rendu seul, la ville n'est pas modifiée)
  // (le mall 10×10 et l'aéroport 6×4 sont faits de cases PNJ d'une case dessinées ensemble depuis leur case avant : leur emprise réelle est leur parcelle, hors de cet audit case par case)
  for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (!c || c.t !== 'npc' || c.x + c.y * N !== i || (c.k === 'mon' && (c.m === 'mall' || c.m === 'air'))) continue;
    const mm = W.fp.monMulti(c); if (mm && (c.x !== c.mx || c.y !== c.my)) continue;   // équipement de plusieurs cases (barème) : audité une fois, sur toute son emprise (mx, my, mw, mh), depuis son coin nord
    const lab = 'pnj ' + (c.k === 'mon' ? 'mon:' + c.m : c.k); try { run(lab, mm ? Object.assign({}, c, { w: c.mw, h: c.mh }) : c); } catch (e) { rows.push({ type: lab, spr: 'ERREUR ' + e.message, w: c.w, h: c.h, lat: NaN, mOld: NaN, mNew: NaN, nan: true }); } }
  return rows;
}

async function audit(L, opts = {}) {
  const pg = await L.newPage({ wait: opts.wait || 3000, w: 1280, h: 720 });
  await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, {});
  const rows = await pg.evaluate(pageAudit, opts.zooms || ZOOMS);
  const errs = pg.errs.slice(); await pg.close();
  return { rows, errs };
}
module.exports = { audit, SEUIL, ZOOMS };

if (require.main === module) {
  (async () => {
    const L = require('./tests/lib.js'), a = process.argv.slice(2), seuil = +(a[a.indexOf('--seuil') + 1] || SEUIL) || SEUIL;
    const { rows, errs } = await audit(L); await L.closeBrowser();
    rows.sort((p, q) => q.lat - p.lat || q.mNew - p.mNew);
    const f = v => Number.isFinite(v) ? v.toFixed(1) : String(v);
    console.log('type | sprite | emprise | débordement lat. % (case) | masque voisin % old → new');
    rows.forEach(r => console.log(`${r.type} | ${r.spr} | ${r.w}×${r.h} | ${f(r.lat)} (${r.tile || '-'}) | ${f(r.mOld)} → ${f(r.mNew)}`));
    const bad = rows.filter(r => !(r.lat <= seuil) || !(r.mNew <= seuil));
    console.log(`\n${rows.length} types audités · seuil ${seuil} % · ${bad.length} au-dessus : ${bad.map(r => r.type + ' (' + r.spr + ' ' + f(r.lat) + ' / ' + f(r.mNew) + ')').join(', ') || 'aucun'}`);
    if (errs.length) console.log('erreurs de page : ' + errs.slice(0, 3).join(' | '));
    const j = a.indexOf('--json'); if (j >= 0 && a[j + 1]) require('fs').writeFileSync(a[j + 1], JSON.stringify(rows, null, 1));
    process.exit(bad.length ? 1 : 0);
  })();
}
