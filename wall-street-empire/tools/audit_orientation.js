#!/usr/bin/env node
// Responsable Mouvements et stationnement : audit d'orientation de tout ce qui bouge ou stationne.
// Pour chaque entité mobile, sur une simulation déterministe, on mesure l'angle entre son CAP DE DÉPLACEMENT (déplacement réel de la position dessinée
// d'une image à la suivante, ramené dans le plan u, v de la carte) et l'ORIENTATION DESSINÉE (cap du sprite ou du modèle choisi par le code) :
//   > 100° : marche arrière apparente (erreur) ; > 50° : en crabe / en travers (erreur pour un véhicule) ; sauts de position > 12 px monde par pas (téléportation, changement de voie d'un bond).
// Pour chaque entité garée : écart entre l'axe dessiné et l'axe de sa place (modulo 180°) > 20° : garée de travers (erreur).
// Entités : voitures et utilitaires de la ville (virages aux carrefours compris), avions de l'aéroport (roulage, décollage, atterrissage, postes),
// voitures du parking et de la voie de dépose de l'aéroport, passants du mall, navires, troupeaux des fermes.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/audit_orientation.js [--md] [--captures=<dossier>]   (WSE_URL=… pour auditer une autre version)
//   --md : réécrit la section mesurée de docs/journal/mouvements.md
const fs = require('fs'), path = require('path');
const L = require('./tests/lib.js');

const ang = (a, b) => { let d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; };   // écart d'angles (0..π)
const deg = r => Math.round(r * 180 / Math.PI);

// ---------- dans la page ----------
const CARS = () => {   // circulation : 60 s (1 200 pas de 50 ms) ; position dessinée et vue dessinée de chaque voiture à chaque pas
  const W = window.WSE, T = W.traffic; T.refresh(); T.reset(); W.setSpeed(1);
  const geom = T.geom || (c => { const p = T.pos(c); return { px: p[0], py: p[1], dir: p[2] }; }), HD = { SE: 0, SW: Math.PI / 2, NW: Math.PI, NE: -Math.PI / 2 };
  const legacy = c => { const dx = c.nx - c.x, dy = c.ny - c.y, dir = dx > 0 ? 'SE' : dx < 0 ? 'NW' : dy > 0 ? 'SW' : 'NE', t = Math.max(0, Math.min(1, c.t)), L = { SE: [-9, 4], NW: [9, -4], SW: [9, 4], NE: [-9, -4] }[dir], TW = 132, TH = 66;
    return { px: ((c.x - c.y) + ((c.nx - c.ny) - (c.x - c.y)) * t) * TW / 2 + L[0], py: ((c.x + c.y) + ((c.nx + c.ny) - (c.x + c.y)) * t) * TH / 2 + TH / 2 + L[1], dir }; };   // rendu d'avant (ligne droite, pivot au centre du carrefour)
  const prev = new Map(), prevL = new Map(), o = { n: 0, back: 0, crab: 0, jump: 0, turns: 0, ex: [], L: { n: 0, back: 0, crab: 0, jump: 0 } };
  const chk = (R, c, g, P, isL) => { const q = P.get(c); P.set(c, g); if (!q) return; const dx = g.px - q.px, dy = g.py - q.py, d = Math.hypot(dx, dy); if (d < 0.3) return;
    if (d > 12) { R.jump++; return; } R.n++; const mu = dx / 132 + dy / 66, mv = dy / 66 - dx / 132, a = Math.atan2(mv, mu), e = (() => { let x = Math.abs(a - HD[g.dir]) % (2 * Math.PI); return x > Math.PI ? 2 * Math.PI - x : x; })();
    if (e > 100 * Math.PI / 180) { R.back++; if (!isL && o.ex.length < 6) o.ex.push({ x: c.x, y: c.y, dir: g.dir, mv: Math.round(a * 57.3) }); } else if (e > 50 * Math.PI / 180 && g.hd != null && q.hd != null && g.straight === false && (() => { const th = Math.atan2(Math.sin(g.hd) + Math.sin(q.hd), Math.cos(g.hd) + Math.cos(q.hd)); let x = Math.abs(a - th) % (2 * Math.PI); x = x > Math.PI ? 2 * Math.PI - x : x; return x < 35 * Math.PI / 180; })()) R.quant = (R.quant || 0) + 1;   // en plein virage : le déplacement suit la tangente, seule la vue (4 sens disponibles) est arrondie au plus proche
    else if (e > 50 * Math.PI / 180) { R.crab++; if (!isL && (o.exC || (o.exC = [])).length < 8) o.exC.push({ t: +c.t.toFixed(3), st: g.straight, dir: g.dir, mv: Math.round(a * 57.3), d: +d.toFixed(2), q: !!c.q, w: +(c.wait || 0).toFixed(2) }); } };
  for (let i = 0; i < 1200; i++) { T.update(0.05); for (const c of T.cars()) { if (c.px < 0 && c.t === 0) { prev.delete(c); prevL.delete(c); } const g = geom(c); if (g.straight === false) o.turns++; chk(o, c, g, prev, false); chk(o.L, c, legacy(c), prevL, true); } }
  W.setSpeed(0); o.cars = T.cars().length; o.curve = !!T.geom; return o;
};
const PLANES = () => {   // trafic aérien : 2 h d'horloge d'animation, pas de 0,1 s
  const A = window.WSE.air, H = 7200, dt = 0.1, prev = new Map(), o = { n: 0, back: 0, crab: 0, ex: [], hdJump: 0, maxTurnRate: 0, rev: 0 };
  for (let T = 0; T < H; T += dt) {
    const s = A.state(T), seen = new Set();
    s.mov.forEach(m => { const id = m.k + m.st + ':' + Math.round((m.t0 != null ? m.t0 : 0) * 10); seen.add(id); const q = prev.get(id); prev.set(id, m); if (!q) return;
      const du = m.u - q.u, dv = m.v - q.v, d = Math.hypot(du, dv); let dh = Math.abs(m.h - q.h) % (2 * Math.PI); if (dh > Math.PI) dh = 2 * Math.PI - dh;
      if (d > 0.004) o.maxTurnRate = Math.max(o.maxTurnRate, dh / dt); if (dh > 0.6) o.hdJump++;
      if (d < 0.004) return; o.n++; const a = Math.atan2(dv, du); let e = Math.abs(a - m.h) % (2 * Math.PI); if (e > Math.PI) e = 2 * Math.PI - e;
      if (e > 100 * Math.PI / 180) { o.back++; if (o.ex.length < 4) o.ex.push({ k: m.k, st: m.st, u: +m.u.toFixed(2), v: +m.v.toFixed(2), cap: Math.round(m.h * 57.3), depl: Math.round(a * 57.3) }); } else if (e > 25 * Math.PI / 180) o.crab++; });
    for (const k of prev.keys()) if (!seen.has(k)) prev.delete(k);
  }
  const O = window.WSE.ori; if (O && O.pose) {   // raccords avec les postes : fin d'atterrissage = avion garé ; début de décollage = avion garé
    const pth = (k, st) => O.path(k, st), dur = (k, st) => pth(k, st).reduce((a, q) => a + q.d, 0);
    o.stands = [0, 1].map(st => { const a = O.pose('arr', st, dur('arr', st)), d = O.pose('dep', st, 0), S = O.stand; return { st, arr: [a.u, a.v, a.h].map(x => +x.toFixed(3)), dep: [d.u, d.v, d.h].map(x => +x.toFixed(3)), stand: [S.u, S.v[st], S.h].map(x => +x.toFixed(3)),
      ok: Math.hypot(a.u - S.u, a.v - S.v[st]) < 0.01 && Math.abs(Math.sin(a.h - S.h)) + 1 - Math.cos(a.h - S.h) < 0.01 && Math.hypot(d.u - S.u, d.v - S.v[st]) < 0.01 && Math.abs(Math.sin(d.h - S.h)) + 1 - Math.cos(d.h - S.h) < 0.01 }; });
    const touch = pth('arr', 0).find(q => q.zp === 'app'), lift = pth('dep', 0).find(q => q.zp === 'climb'); o.wind = { atterrissage: Math.round(touch.h0 * 57.3), decollage: Math.round(lift.h0 * 57.3) };
  }
  return o;
};
const SHIPS = () => { const O = window.WSE.ori; if (!O) return null; return O.ships().map(s => { const sm = O.SHIP_SPR[s.seed % O.SHIP_SPR.length][0], bow = O.SHIP_BOW[sm], mv = s.v > 0 ? Math.PI / 2 : -Math.PI / 2; return { spr: sm, couloir: s.x < 92.5 ? 'ouest' : 'est', sens: s.v > 0 ? '+y (bas à gauche)' : '−y (haut à droite)', bow, mv }; }); };
const HERDS = () => {   // troupeaux : position de chaque bête à t et t + 0,05 s, vue (miroir) choisie par le code
  const W = window.WSE, S = W.S, O = W.ori; if (!O || !O.herd) return null; const out = { n: 0, back: 0, side: 0, farms: 0 };
  const farms = []; for (let i = 0; i < S.grid.length; i++) { const c = S.grid[i]; if (c && /^(fcattle|fsheep|fpig|fchicken)$/.test(c.t) && c.x + c.y * W.N === i) farms.push(c); }
  farms.slice(0, 6).forEach(a => { out.farms++; for (let k = 0; k < 40; k++) { const t = 1000 + k * 731, A = O.herd(a, t), B = O.herd(a, t + 50), mB = new Map(B.map(q => [q[6], q]));
    A.forEach(q => { const r = mB.get(q[6]); if (!r) return; const du = r[4] - q[4], dv = r[5] - q[5]; if (Math.hypot(du, dv) < 1e-4) return; out.n++; const a = Math.atan2(dv, du), hd = q[3] ? 0 : Math.PI / 2;
      let e = Math.abs(a - hd) % (2 * Math.PI); if (e > Math.PI) e = 2 * Math.PI - e; if (e > 100 * Math.PI / 180) out.back++; else if (e > 50 * Math.PI / 180) out.side++; }); } });
  return out;
};

async function framesORI(pg, setupFn, n, stepFn) {   // rend n images avec le relevé d'orientation actif ; renvoie les enregistrements
  return pg.evaluate(async ({ setupFn, n, stepFn }) => {
    const W = window.WSE, O = W.ori; if (!O) return null; new Function('W', setupFn)(W); O.ORI.list = []; O.ORI.on = true;
    for (let k = 0; k < n; k++) { O.ORI.frame = k; new Function('W', 'k', stepFn)(W, k); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }
    O.ORI.on = false; return O.ORI.list.map(r => ({ kind: r.kind, id: String(r.id), u: r.u, v: r.v, hd: r.hd, f: r.f, axis: r.axis, mv: r.mv, oneView: r.oneView, hdTrue: r.hdTrue }));
  }, { setupFn, n, stepFn });
}
function judge(list) {   // regroupe par entité : garés (axe de la place) et mobiles (déplacement d'une image à l'autre)
  const by = {}, ids = new Map();
  (list || []).forEach(r => { const k = r.kind; const B = by[k] || (by[k] = { n: 0, parked: 0, parkBad: 0, back: 0, crab: 0, mov: 0, maxPark: 0, ex: [] }); const key = k + '|' + r.id;
    if (r.axis != null) { B.parked++; let e = Math.abs(r.hd - r.axis) % Math.PI; e = Math.min(e, Math.PI - e); B.maxPark = Math.max(B.maxPark, deg(e)); if (e > 20 * Math.PI / 180) { B.parkBad++; if (B.ex.length < 3) B.ex.push({ id: r.id, ecart: deg(e) }); } return; }
    const q = ids.get(key); ids.set(key, r); if (!q || q.f !== r.f - 1) return; const du = r.u - q.u, dv = r.v - q.v; if (Math.hypot(du, dv) < 1e-3) return; B.mov++;
    const a = Math.atan2(dv, du), e = ang(a, r.hd); if (e > 100 * Math.PI / 180) { B.back++; if (B.ex.length < 3) B.ex.push({ id: r.id, cap: deg(r.hd), depl: deg(a) }); } else if (e > 50 * Math.PI / 180) B.crab++; });
  Object.values(by).forEach(B => { B.n = B.parked + B.mov; }); return by;
}

async function run(opts = {}) {
  const pg = await L.newPage({ wait: 2200, w: 1280, h: 860 }); await L.setup(pg, { cash: 3e7 });
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint,.toast{display:none!important}' });
  await pg.evaluate(() => { const W = window.WSE; ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); try { W.mk.act('close'); } catch (e) {} W.step(); W.setTool('view'); });
  const R = { version: opts.label || 'actuelle' };
  R.planes = await pg.evaluate(PLANES);
  R.cars = await pg.evaluate(CARS);
  R.ships = await pg.evaluate(SHIPS);
  R.herds = await pg.evaluate(HERDS);
  // aéroport rendu : parking, voie de dépose, avions (relevé du dessin réel), au zoom rapproché
  const air = await framesORI(pg, "const P = W.air.pos(); W.zoomTo(1.1, innerWidth / 2, innerHeight / 2, { x: P.x + 3, y: P.y + 2 }); W.centerOn(P.x + 2.6, P.y + 1.6); W.setSpeed(0);", 90, 'W.air.anim(40 + k * 0.25);');
  const mall = await framesORI(pg, "const M = W.mall.pos(); W.zoomTo(1.1, innerWidth / 2, innerHeight / 2, { x: M.x + 5, y: M.y + 5 }); W.centerOn(M.x + 8, M.y + 8);", 40, '');
  await pg.evaluate(() => window.WSE.air.anim(null));
  R.drawn = air ? judge(air.concat(mall || [])) : null;
  if (opts.captures) {   // captures de l'aéroport à plusieurs zooms, et série d'un départ et d'un atterrissage
    fs.mkdirSync(opts.captures, { recursive: true }); R.shots = [];
    const P = await pg.evaluate(() => window.WSE.air.pos()), clip = { x: 140, y: 90, width: 1000, height: 680 };
    const shot = async n => { const f = path.join(opts.captures, n + '.png'); await pg.screenshot({ path: f, clip }); R.shots.push(f); };
    const tl = await pg.evaluate(() => window.WSE.air.timeline(0, 1800)), ea = tl.find(e => e.k === 'arr'), ed = tl.find(e => e.k === 'dep');
    for (const [nm, zz, cu, cv] of [['aeroport_z055', 0.55, 2.6, 1.6], ['aeroport_z110', 1.1, 2.6, 1.6], ['aeroport_z180', 1.8, 1.6, 1.9]]) {
      await pg.evaluate(({ P, zz, cu, cv, t }) => { const W = window.WSE; W.air.anim(t); W.zoomTo(zz, innerWidth / 2, innerHeight / 2, { x: P.x + 3, y: P.y + 2 }); W.centerOn(P.x + cu, P.y + cv); }, { P, zz, cu, cv, t: ed.t0 + 3 });
      await pg.waitForTimeout(500); await shot(nm);
    }
    { const bb = await pg.evaluate(P => { const W = window.WSE, K = W.air.L.K, q = [[K.u0, K.v0], [K.u1, K.v0], [K.u1, K.v1], [K.u0, K.v1]].map(c => W.tileToScreen(P.x + c[0], P.y + c[1])); const xs = q.map(p => p.x), ys = q.map(p => p.y); return [Math.min(...xs) - 20, Math.min(...ys) - 40, Math.max(...xs) + 20, Math.max(...ys) + 20]; }, P);
      const f = path.join(opts.captures, 'aeroport_parking_z180.png'), x = Math.max(0, bb[0]), y = Math.max(0, bb[1]); await pg.screenshot({ path: f, clip: { x, y, width: Math.min(1280 - x, bb[2] - x), height: Math.min(860 - y, bb[3] - y) } }); R.shots.push(f); }
    await pg.evaluate(({ P }) => { const W = window.WSE; W.zoomTo(1.5, innerWidth / 2, innerHeight / 2, { x: P.x + 3, y: P.y + 2 }); W.centerOn(P.x + 2.2, P.y + 1.6); }, { P });
    for (const [e, fr] of [[ed, [0.05, 0.3, 0.5, 0.7]], [ea, [0.3, 0.6, 0.8, 0.97]]]) for (const x of fr) { const t = e.t0 + e.dur * x; await pg.evaluate(t => window.WSE.air.anim(t), t); await pg.waitForTimeout(250); await shot(`aeroport_${e.k === 'arr' ? 'atterrissage' : 'decollage'}_${Math.round(x * 100)}`); }
    await pg.evaluate(() => window.WSE.air.anim(null));
  }
  R.errs = pg.errs.slice(0, 5);
  await pg.context().close();
  // verdict
  const V = R.verdict = {};
  V.avionsRecul = R.planes.back; V.avionsCrabe = R.planes.crab; V.postesRaccord = R.planes.stands ? R.planes.stands.every(s => s.ok) : null;
  V.voituresRecul = R.cars.back; V.voituresCrabe = R.cars.crab; V.voituresSauts = R.cars.jump;
  const D = R.drawn || {}, pk = D['aéroport : voiture garée'] || { parked: 0, parkBad: 0 }, cb = D['aéroport : voie de dépose'] || { back: 0, crab: 0, mov: 0 }, ap = D['avion'] || { back: 0, mov: 0 };
  V.parkingAeroport = { garees: pk.parked, deTravers: pk.parkBad, ecartMax: pk.maxPark }; V.deposeRecul = cb.back; V.deposeCrabe = cb.crab; V.avionsDessinesRecul = ap.back;
  V.naviresRecul = R.ships ? R.ships.filter(s => ang(s.bow, s.mv) > Math.PI / 2).map(s => s.spr) : null;
  V.ok = V.avionsRecul === 0 && V.voituresRecul === 0 && pk.parkBad === 0 && pk.parked > 0 && cb.back === 0 && ap.back === 0 && (!V.naviresRecul || !V.naviresRecul.length) && !R.errs.length;
  return R;
}
module.exports = { run };

function md(R) {
  const P = R.planes, C = R.cars, V = R.verdict, D = R.drawn || {};
  const rows = Object.entries(D).map(([k, B]) => `| ${k} | ${B.mov} | ${B.back} | ${B.crab} | ${B.parked} | ${B.parkBad} |`).join('\n');
  return `<!-- AUDIT:debut (généré par tools/audit_orientation.js --md, ne pas éditer à la main) -->
### Mesures (${new Date().toISOString().slice(0, 10)}, version ${R.version})

Verdict : **${V.ok ? 'aucune marche arrière, aucun véhicule garé de travers' : 'DÉFAUTS RESTANTS'}**.

| Entités | Pas mesurés | Marche arrière (> 100°) | En crabe (50–100°) | Garés | Garés de travers (> 20°) |
|---|---|---|---|---|---|
| Avions (2 h d'animation, pas 0,1 s) | ${P.n} | ${P.back} | ${P.crab} (> 25°) | — | — |
| Voitures de la ville (60 s, ${C.cars} voitures, ${C.turns} pas en virage) | ${C.n} | ${C.back} | ${C.crab} | — | — |
| *Voitures, rendu d'avant (ligne droite, pivot au carrefour)* | ${C.L.n} | ${C.L.back} | ${C.L.crab} | — | — |
${rows}

- Sauts de position (> 12 px monde en 50 ms) : ${C.jump} (rendu d'avant : ${C.L.jump}, changement de voie d'un bond au centre du carrefour).
- Avions : vitesse de rotation maximale du cap ${(P.maxTurnRate * 57.3).toFixed(0)}°/s, ${P.hdJump} saut(s) de cap ; atterrissage cap ${P.wind ? P.wind.atterrissage : '?'}°, décollage cap ${P.wind ? P.wind.decollage : '?'}° (même sens de piste) ; raccords poste ↔ trajectoire : ${P.stands ? P.stands.map(s => 'A' + (s.st + 1) + (s.ok ? ' exact' : ' FAUX')).join(', ') : '?'}.
- Navires : ${R.ships ? R.ships.map(s => `${s.spr} (${s.couloir}, ${s.sens}) ${ang(s.bow, s.mv) < 0.1 ? 'proue en avant' : 'MARCHE ARRIÈRE'}`).join(' ; ') : 'non mesuré'}.
- Troupeaux : ${R.herds ? `${R.herds.n} pas mesurés sur ${R.herds.farms} élevage(s), ${R.herds.back} à reculons, ${R.herds.side} de profil en s'éloignant (une seule vue de trois quarts avant : 90° au plus)` : 'non mesuré'}.
- Erreurs de page : ${R.errs.length}.
<!-- AUDIT:fin -->`;
}
if (require.main === module) (async () => {
  const a = process.argv.slice(2), cap = (a.find(x => x.startsWith('--captures=')) || '').slice(11);
  const R = await run({ captures: cap || null, label: process.env.WSE_LABEL });
  console.log(JSON.stringify({ verdict: R.verdict, planes: { n: R.planes.n, back: R.planes.back, crab: R.planes.crab, ex: R.planes.ex, stands: R.planes.stands, wind: R.planes.wind }, cars: { n: R.cars.n, back: R.cars.back, crab: R.cars.crab, jump: R.cars.jump, turns: R.cars.turns, legacy: R.cars.L, quant: R.cars.quant || 0, ex: R.cars.ex, exC: R.cars.exC }, drawn: R.drawn, ships: R.ships, herds: R.herds, errs: R.errs, shots: R.shots }, null, 1));
  if (a.includes('--md')) {
    const f = path.resolve(__dirname, '..', 'docs', 'journal', 'mouvements.md'); let t = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '# Journal du Responsable Mouvements et stationnement\n\n';
    const blk = md(R); t = /<!-- AUDIT:debut[\s\S]*AUDIT:fin -->/.test(t) ? t.replace(/<!-- AUDIT:debut[\s\S]*AUDIT:fin -->/, blk) : t + '\n' + blk + '\n'; fs.writeFileSync(f, t); console.log('rapport : ' + f);
  }
  await L.closeBrowser();
})();
