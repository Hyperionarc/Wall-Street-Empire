// Définitions des bâtiments rendus par lib3d.js (style européen réaliste, aucun texte : les enseignes sont peintes par le jeu sur les bandeaux `B.sign`).
// Repère : X = axe x de la grille (face +X = « R », avant-droite, à l'ombre), Z = axe y (face +Z = « L », avant-gauche, éclairée), mètres, case = 10 m.
// Étage courant 3,3 à 3,6 m (≈ 0,35 case, comme les immeubles HD de la ville), fenêtres 1,2-1,6 m × 1,6-2,0 m, allège 0,9 m.
import * as THREE from 'three';
import { M, renderSprite, windowAt, windowRow, door, roofGable, roofHip, roofFlat, tree, bush, fence, lowWall, slab, ground, courtTex, texturedGround, flag, bench } from './lib3d.js';

const CREAM = '#e7dcc4', STONE = '#d8cfbd', BASE = '#b9b3a8', TILE = '#bf7b54', SLATE = '#717a83', ZINC = '#8b949b', BRICK = '#9d5f47', MORTAR = '#cdbfac';

function plinth(B, x0, z0, x1, z1, h = 0.55) { B.box(M.stone(BASE), x0 - 0.05, 0, z0 - 0.05, x1 + 0.05, h, z1 + 0.05); }   // soubassement de pierre grise
function volume(B, m, x0, z0, x1, z1, h, o = {}) { B.box(m, x0, 0, z0, x1, h, z1); if (o.plinth !== false) plinth(B, x0, z0, x1, z1, o.ph || 0.55); }
function band(B, x0, z0, x1, z1, y, h = 0.22, d = 0.07, c = STONE) { B.box(M.stone(c), x0 - d, y, z0 - d, x1 + d, y + h, z1 + d); }   // cordon d'étage
function signBand(B, face, a0, a1, y0, y1, c, col = '#f3efe6') {   // bandeau d'enseigne vierge : façade +Z (face 'L', a = x) ou +X (face 'R', a = z), au plan c
  const m = M.plain(col, 0.75);
  if (face === 'L') { B.box(m, a0, y0, c - 0.02, a1, y1, c + 0.09); B.sign('L', a0, y0, c + 0.09, a1, y1, c + 0.09); }
  else { B.box(m, c - 0.02, y0, a0, c + 0.09, y1, a1); B.sign('R', c + 0.09, y0, a0, c + 0.09, y1, a1); }
}
function chain(B, m, x, z, h, sx = -1, sz = -1, s = 0.55) {   // chaînage d'angle en pierre (harpes alternées) sur l'arête (x, z) ; sx, sz : côté du mur
  for (let y = 0.55, i = 0; y < h - 0.05; y += s, i++) { const w = i % 2 ? 0.45 : 0.75, t = Math.min(s - 0.04, h - y);
    B.box(m, Math.min(x, x + sx * w), y, z - 0.05, Math.max(x, x + sx * w), y + t, z + 0.05); B.box(m, x - 0.05, y, Math.min(z, z + sz * w), x + 0.05, y + t, Math.max(z, z + sz * w)); }
}
function railing(B, face, c, a0, a1, y, h = 0.95, col = '#2f3337', d = 0.5) {   // balcon filant à garde-corps en fer forgé
  const m = M.plain(col, 0.5, 0.5), sl = M.stone('#d6cdba');
  if (face === 'Z') { B.box(sl, a0, y - 0.16, c, a1, y, c + d); B.box(m, a0, y + h - 0.05, c + d - 0.05, a1, y + h, c + d); for (let x = a0; x <= a1 + 1e-6; x += 0.13) B.box(m, x - 0.015, y, c + d - 0.04, x + 0.015, y + h, c + d - 0.01); }
  else { B.box(sl, c, y - 0.16, a0, c + d, y, a1); B.box(m, c + d - 0.05, y + h - 0.05, a0, c + d, y + h, a1); for (let z = a0; z <= a1 + 1e-6; z += 0.13) B.box(m, c + d - 0.04, y, z - 0.015, c + d - 0.01, y + h, z + 0.015); }
}
function rot(B, m, cx, cy, cz, sx, sy, sz, rz) { const g = new THREE.BoxGeometry(sx, sy, sz); g.rotateZ(rz); g.translate(cx, cy, cz); B.add(m, g); }
function pediment(B, x0, x1, z, y, h) {   // fronton triangulaire en pierre sur la façade +Z (plan z), corniche horizontale et rampants
  const m = M.stone('#ddd4c2'), c = M.stone('#e6dfcf'); B.tri(m, [x0, y, z + 0.3], [x1, y, z + 0.3], [(x0 + x1) / 2, y + h, z + 0.3]); B.tri(m, [x0, y, z], [(x0 + x1) / 2, y + h, z], [x1, y, z]);
  B.box(c, x0 - 0.35, y - 0.35, z - 0.05, x1 + 0.35, y, z + 0.55); const L = Math.hypot((x1 - x0) / 2, h) + 0.45, a = Math.atan2(h, (x1 - x0) / 2);
  rot(B, c, (3 * x0 + x1) / 4, y + h / 2 + 0.1, z + 0.25, L, 0.3, 0.6, a); rot(B, c, (x0 + 3 * x1) / 4, y + h / 2 + 0.1, z + 0.25, L, 0.3, 0.6, -a);
}
function clock(B, x, y, z, r = 0.7) {   // horloge sans chiffres (façade +Z) : cadran clair, cerclage sombre, index et deux aiguilles
  const disc = (rr, d, col, dz) => { const g = new THREE.CylinderGeometry(rr, rr, d, 40); g.rotateX(Math.PI / 2); g.translate(x, y, z + dz); B.add(M.plain(col, 0.5, 0.2), g); };
  disc(r + 0.1, 0.12, '#3b3f43', 0.06); disc(r, 0.14, '#f1ede2', 0.08); const h = M.plain('#25282b', 0.5);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; rot(B, h, x + Math.sin(a) * r * 0.82, y + Math.cos(a) * r * 0.82, z + 0.17, 0.05, i % 3 ? 0.1 : 0.2, 0.03, -a); }
  rot(B, h, x + 0.22, y + 0.12, z + 0.18, 0.07, r * 0.55, 0.03, -1.05); rot(B, h, x - 0.05, y + 0.28, z + 0.19, 0.05, r * 0.72, 0.03, 0.18);
}
function sandpit(B, x0, z0, x1, z1) { const w = M.wood('#8d6c4c'); B.box(w, x0, 0, z0, x1, 0.25, z0 + 0.12); B.box(w, x0, 0, z1 - 0.12, x1, 0.25, z1); B.box(w, x0, 0, z0, x0 + 0.12, 0.25, z1); B.box(w, x1 - 0.12, 0, z0, x1, 0.25, z1); B.box(M.sand(), x0 + 0.12, 0, z0 + 0.12, x1 - 0.12, 0.17, z1 - 0.12); }
function playHouse(B, x, z) {   // petite structure de jeux en bois (plateforme couverte + toboggan inox), couleurs sobres
  const w = M.wood('#9a7652'), p = M.plain('#6f7a6a', 0.7), s = M.plain('#a7adb0', 0.35, 0.6);
  [[0, 0], [1.4, 0], [0, 1.4], [1.4, 1.4]].forEach(([a, b]) => B.box(w, x + a, 0, z + b, x + a + 0.12, 2.3, z + b + 0.12));
  B.box(w, x, 1.0, z, x + 1.52, 1.12, z + 1.52); B.box(p, x - 0.1, 2.3, z - 0.1, x + 1.62, 2.4, z + 1.62);
  B.quad(s, [x + 1.52, 1.1, z + 0.3], [x + 1.52, 1.1, z + 1.2], [x + 3.3, 0.15, z + 1.2], [x + 3.3, 0.15, z + 0.3]);
}
function swing(B, x, z) { const m = M.plain('#5d6a72', 0.5, 0.4); B.box(m, x, 0, z, x + 0.1, 2.2, z + 0.1); B.box(m, x, 0, z + 2.4, x + 0.1, 2.2, z + 2.5); B.box(m, x - 0.02, 2.2, z, x + 0.12, 2.3, z + 2.5);
  [0.7, 1.7].forEach(t => { B.box(M.plain('#2f3338', 0.6), x + 0.03, 0.5, z + t, x + 0.07, 2.2, z + t + 0.03); B.box(M.wood('#7d5e40'), x - 0.15, 0.45, z + t - 0.25, x + 0.25, 0.52, z + t + 0.28); }); }
function gatePillars(B, x0, x1, z, h = 2.2) { const m = M.stone('#d9d0bd'), c = M.stone('#e8e1d1'); [x0, x1].forEach(x => { B.box(m, x - 0.3, 0, z - 0.3, x + 0.3, h, z + 0.3); B.box(c, x - 0.38, h, z - 0.38, x + 0.38, h + 0.18, z + 0.38); }); }
function bikeShed(B, x0, z0, x1, z1) { const m = M.plain('#6a737a', 0.5, 0.4); [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(([x, z]) => B.box(m, x - 0.05, 0, z - 0.05, x + 0.05, 2.2, z + 0.05)); B.box(M.zinc('#9aa3a9'), x0 - 0.2, 2.2, z0 - 0.3, x1 + 0.2, 2.3, z1 + 0.3);
  for (let x = x0 + 0.4; x < x1 - 0.2; x += 0.7) B.box(M.plain('#3a3f44', 0.6, 0.3), x - 0.02, 0, (z0 + z1) / 2 - 0.6, x + 0.02, 0.9, (z0 + z1) / 2 + 0.6); }

export const SPRITES = {
  // École maternelle (1 case) : bâtiment bas en L de plain-pied, enduit clair sur soubassement de pierre, toit de tuiles à pente douce, préau en zinc,
  // cour (marelle) avec bac à sable et petite structure de jeux en bois, grille basse et muret
  ecole_maternelle: { cases: [1, 1], seed: 3, build(B) {
    slab(B, 10, 10, M.paving('#cdc8bb'));
    texturedGround(B, courtTex('mat', 5.2, 4.8, 'jeu'), 4.6, 5.0, 9.6, 9.6);
    ground(B, M.grass('#6f8c4c'), 0.3, 8.2, 4.2, 9.7); ground(B, M.grass('#6f8c4c'), 8.0, 0.3, 9.7, 4.6);
    const W = M.render(CREAM), roof = M.tiles(TILE);
    volume(B, W, 0.8, 0.9, 7.6, 4.6, 3.3); roofGable(B, roof, 0.8, 0.9, 7.6, 4.6, 3.3, 1.25, 'x', 0.45, W);
    volume(B, W, 0.8, 4.6, 4.2, 7.9, 3.3); roofGable(B, roof, 0.8, 4.6, 4.2, 7.9, 3.3, 1.05, 'z', 0.45, W);
    windowRow(B, { face: 'Z', c: 4.6, u0: 4.3, u1: 7.6, n: 2, ys: [0.85], w: 1.35, h: 1.6 });
    windowRow(B, { face: 'X', c: 7.6, u0: 0.9, u1: 4.6, n: 2, ys: [0.85], w: 1.3, h: 1.6 });
    windowRow(B, { face: 'X', c: 4.2, u0: 4.6, u1: 7.9, n: 2, ys: [0.85], w: 1.2, h: 1.6 });
    windowAt(B, { face: 'Z', c: 7.9, u: 1.5, y: 0.85, w: 0.9, h: 1.6 });
    door(B, { face: 'Z', c: 7.9, u: 3.0, w: 1.5, h: 2.3, frame: '#4a5560', canopy: 0.9 });
    signBand(B, 'L', 0.95, 4.05, 2.55, 3.0, 7.9);
    const post = M.plain('#e4e1da', 0.6); [[7.4, 6.4], [5.9, 6.4], [4.45, 6.4]].forEach(([x, z]) => B.box(post, x - 0.09, 0, z - 0.09, x + 0.09, 2.7, z + 0.09));
    B.box(M.zinc(ZINC), 4.2, 2.7, 4.6, 7.75, 2.9, 6.6); B.box(M.plain('#e8e4dc', 0.7), 4.2, 2.62, 6.5, 7.75, 2.9, 6.62);
    sandpit(B, 5.0, 7.2, 6.9, 8.9); playHouse(B, 7.3, 7.2); bench(B, 5.3, 9.0);
    fence(B, 4.4, 9.85, 9.85, 9.85, 1.1, 0.2, '#66706a'); fence(B, 9.85, 4.7, 9.85, 9.85, 1.1, 0.2, '#66706a'); lowWall(B, 0.15, 9.85, 3.0, 9.85, 0.5);
    tree(B, 9.0, 1.6, 0.8, 5); tree(B, 1.4, 9.0, 0.6, 6); bush(B, 8.6, 3.9, 0.6, 7); bush(B, 2.4, 9.1, 0.5, 8); bush(B, 3.7, 9.2, 0.45, 9);
  } },
  // Crèche (1 case) : deux volumes bas décalés à toits monopentes en zinc, bardage bois et enduit blanc, grandes baies, jardin, portique, haie
  creche: { cases: [1, 1], seed: 4, build(B) {
    slab(B, 10, 10, M.paving('#cbc6ba'));
    ground(B, M.grass('#71904d'), 4.8, 4.9, 9.7, 9.7); ground(B, M.grass('#71904d'), 0.3, 8.6, 4.8, 9.7);
    const Wd = M.wood('#a0815e'), Wr = M.render('#eeebe4', 'w');
    volume(B, Wr, 0.9, 0.9, 6.2, 4.9, 3.6); volume(B, Wd, 0.9, 4.9, 4.6, 8.3, 3.0);
    const zr = M.zinc('#8e979d');   // monopentes : arêtes hautes vers le fond
    B.roofPlane(zr, [6.5, 3.6, 5.2], [0.6, 3.6, 5.2], [0.6, 4.5, 0.6], [6.5, 4.5, 0.6]); B.box(M.plain('#e3e0d9', 0.7), 0.6, 3.45, 5.15, 6.5, 3.65, 5.25);
    B.tri(Wr, [6.2, 3.6, 4.9], [6.2, 3.6, 0.9], [6.2, 4.43, 0.9]); B.tri(Wr, [0.9, 3.6, 4.9], [0.9, 3.6, 0.9], [0.9, 4.43, 0.9]);
    B.roofPlane(zr, [4.9, 3.0, 8.6], [0.6, 3.0, 8.6], [0.6, 3.75, 4.9], [4.9, 3.75, 4.9]); B.box(M.plain('#e3e0d9', 0.7), 0.6, 2.86, 8.55, 4.9, 3.05, 8.65);
    B.tri(Wd, [4.6, 3.0, 8.3], [4.6, 3.0, 4.9], [4.6, 3.7, 4.9]);
    windowRow(B, { face: 'X', c: 6.2, u0: 1.0, u1: 4.8, n: 2, ys: [0.6], w: 1.5, h: 2.1, frame: '#4b5157', transom: false });
    windowRow(B, { face: 'Z', c: 4.9, u0: 4.6, u1: 6.2, n: 1, ys: [0.6], w: 1.1, h: 2.1, frame: '#4b5157', transom: false });
    windowRow(B, { face: 'X', c: 4.6, u0: 5.1, u1: 8.2, n: 2, ys: [0.5], w: 1.2, h: 1.9, frame: '#4b5157', transom: false });
    door(B, { face: 'Z', c: 8.3, u: 1.9, w: 1.4, h: 2.2, frame: '#4b5157', canopy: 0.8 }); windowAt(B, { face: 'Z', c: 8.3, u: 3.6, y: 0.5, w: 1.3, h: 1.9, frame: '#4b5157', transom: false });
    signBand(B, 'L', 0.95, 4.55, 2.45, 2.85, 8.3, '#f1ede4');
    swing(B, 7.6, 6.0); sandpit(B, 5.4, 7.6, 7.0, 9.2); bench(B, 8.6, 9.2);
    fence(B, 4.9, 9.85, 9.85, 9.85, 1.0, 0.18, '#6b746d'); fence(B, 9.85, 5.0, 9.85, 9.85, 1.0, 0.18, '#6b746d');
    for (let x = 0.5; x < 4.7; x += 0.55) bush(B, x, 9.3, 0.42, 20 + Math.round(x * 10));
    tree(B, 8.7, 1.8, 0.85, 31); tree(B, 6.4, 8.6, 0.55, 32); bush(B, 7.6, 4.4, 0.55, 33);
  } },
  // Collège (2 × 2 cases) : bâtiment en L de brique à cordons et chaînages de pierre, toits d'ardoise en croupe ; aile de 2 niveaux, corps principal de 3 niveaux
  // à avant-corps d'entrée enduit ; préau sur poteaux, cour avec terrain de sport tracé, platanes, grille sur muret et portail entre piliers
  college: { cases: [2, 2], seed: 5, build(B) {
    slab(B, 20, 20, M.paving('#cbc6b9'));
    texturedGround(B, courtTex('col', 11.2, 9.6, 'cour'), 8.6, 9.6, 19.7, 19.4); texturedGround(B, courtTex('colsp', 7.2, 5.0, 'sport'), 11.8, 13.4, 19.0, 18.4, 0.045);
    const Br = M.brick(BRICK, MORTAR), St = M.stone(STONE), sl = M.slate(SLATE), H1 = 3.6, H2 = 3.4;
    // corps principal (fond), 3 niveaux
    volume(B, Br, 1.2, 1.2, 18.8, 8.4, H1 + 2 * H2);
    [H1, H1 + H2].forEach(y => band(B, 1.2, 1.2, 18.8, 8.4, y - 0.1)); band(B, 1.2, 1.2, 18.8, 8.4, H1 + 2 * H2 - 0.3, 0.42, 0.18, '#e2dacb');
    roofHip(B, sl, 1.2, 1.2, 18.8, 8.4, H1 + 2 * H2 + 0.1, 3.0, 0.45);
    chain(B, St, 18.8, 8.4, H1 + 2 * H2 - 0.3, -1, -1);
    // avant-corps d'entrée enduit, 3 niveaux
    volume(B, M.render('#e4dbc8', 'ac'), 11.2, 8.4, 15.2, 9.3, H1 + 2 * H2 + 0.6, { plinth: false }); B.box(M.stone(BASE), 11.15, 0, 8.4, 15.25, 0.55, 9.35);
    B.box(M.stone('#e2dacb'), 11.0, H1 + 2 * H2 + 0.3, 8.3, 15.4, H1 + 2 * H2 + 0.75, 9.5);
    // fenêtres
    const fz = { face: 'Z', c: 8.4, w: 1.35, h: 1.85, lintel: STONE };
    windowRow(B, Object.assign({}, fz, { u0: 8.2, u1: 11.2, n: 2, ys: [H1 + 0.9, H1 + H2 + 0.9] })); windowRow(B, Object.assign({}, fz, { u0: 15.2, u1: 18.8, n: 2, ys: [0.95, H1 + 0.9, H1 + H2 + 0.9] }));
    windowRow(B, Object.assign({}, fz, { c: 9.3, u0: 11.2, u1: 15.2, n: 2, ys: [H1 + 0.9, H1 + H2 + 0.9], lintel: null }));
    door(B, { face: 'Z', c: 9.3, u: 13.2, w: 2.2, h: 2.7, frame: '#3f474f', canopy: 1.1 }); signBand(B, 'L', 11.6, 14.8, H1 - 0.45, H1 - 0.02, 9.3);
    windowRow(B, { face: 'X', c: 18.8, u0: 1.2, u1: 8.4, n: 3, ys: [0.95, H1 + 0.9, H1 + H2 + 0.9], w: 1.3, h: 1.85, lintel: STONE });
    // aile (gauche), 2 niveaux
    volume(B, Br, 1.2, 8.4, 7.6, 18.6, H1 + H2); band(B, 1.2, 8.4, 7.6, 18.6, H1 - 0.1); band(B, 1.2, 8.4, 7.6, 18.6, H1 + H2 - 0.3, 0.38, 0.16, '#e2dacb');
    roofHip(B, sl, 1.2, 8.4, 7.6, 18.6, H1 + H2 + 0.08, 2.6, 0.45); chain(B, St, 7.6, 18.6, H1 + H2 - 0.3, -1, -1);
    windowRow(B, { face: 'X', c: 7.6, u0: 8.6, u1: 18.6, n: 4, ys: [0.95, H1 + 0.9], w: 1.3, h: 1.85, lintel: STONE });
    windowRow(B, { face: 'Z', c: 18.6, u0: 1.2, u1: 7.6, n: 2, ys: [0.95, H1 + 0.9], w: 1.3, h: 1.85, lintel: STONE });
    // préau le long de l'aile
    const post = M.plain('#dedad2', 0.6); for (let z = 10.0; z <= 17.6; z += 2.5) B.box(post, 10.15, 0, z - 0.12, 10.4, 3.0, z + 0.12);
    B.box(M.zinc(ZINC), 7.6, 3.0, 9.6, 10.7, 3.2, 18.0); B.box(M.plain('#e6e2da', 0.7), 10.5, 2.85, 9.6, 10.7, 3.2, 18.0);
    // cour : platanes, bancs, grille sur muret, portail
    [[16.8, 10.6], [12.2, 11.0], [19.0, 12.4]].forEach((p, i) => tree(B, p[0], p[1], 1.05, 40 + i)); bench(B, 14.3, 11.0); bench(B, 9.4, 12.5, 'z');
    const fc = '#4a5157'; lowWall(B, 8.0, 19.75, 10.3, 19.75, 0.55); lowWall(B, 13.9, 19.75, 19.75, 19.75, 0.55); lowWall(B, 19.75, 9.0, 19.75, 19.75, 0.55);
    fence(B, 13.9, 19.75, 19.75, 19.75, 1.7, 0.16, fc); fence(B, 19.75, 9.0, 19.75, 19.75, 1.7, 0.16, fc); gatePillars(B, 10.5, 13.7, 19.75);
    lowWall(B, 0.3, 19.75, 7.6, 19.75, 0.55); ground(B, M.grass('#6d8a4b'), 0.3, 18.8, 7.9, 19.6); for (let x = 1.0; x < 7.5; x += 1.3) bush(B, x, 19.2, 0.5, 50 + x * 3);
    ground(B, M.grass('#6d8a4b'), 18.9, 0.4, 19.7, 8.6); bush(B, 19.3, 2.0, 0.5, 61); bush(B, 19.3, 5.0, 0.5, 62);
    flag(B, 15.6, 9.7, 5.8);
  } },
  // Lycée (3 × 2 cases) : grand corps principal en pierre et enduit de 3 niveaux sous toit d'ardoise, avant-corps central à fronton et horloge, aile en retour à droite (brique),
  // cour d'honneur plantée, terrain de sport, abri à vélos, grille haute sur muret et portail monumental
  lycee: { cases: [3, 2], seed: 6, build(B) {
    slab(B, 30, 20, M.paving('#cdc8bb'));
    texturedGround(B, courtTex('lyc', 21, 9.4, 'cour'), 8.4, 10.2, 29.4, 19.4); texturedGround(B, courtTex('lycsp', 9.0, 5.4, 'sport'), 12.0, 13.0, 21.0, 18.4, 0.045);
    const En = M.render('#e5dcc8', 'lyc'), St = M.stone('#d6ccb8'), Br = M.brick('#a0654c', MORTAR), sl = M.slate(SLATE), H1 = 3.8, H2 = 3.5, HT = H1 + 2 * H2;
    // corps principal
    volume(B, En, 1.0, 1.0, 29.0, 8.6, HT, { ph: 0.7 }); B.box(St, 0.98, 0, 0.98, 29.02, H1, 8.62);   // rez-de-chaussée en pierre de taille
    band(B, 1.0, 1.0, 29.0, 8.6, H1 - 0.05, 0.25); band(B, 1.0, 1.0, 29.0, 8.6, H1 + H2 - 0.1); band(B, 1.0, 1.0, 29.0, 8.6, HT - 0.35, 0.5, 0.22, '#e6dfcf');
    roofHip(B, sl, 1.0, 1.0, 29.0, 8.6, HT + 0.15, 3.6, 0.5);
    for (const x of [6.0, 11.0, 19.0, 24.0]) { B.box(M.slate(SLATE), x - 0.7, HT + 0.4, 7.4, x + 0.7, HT + 2.0, 8.3); B.box(M.plain('#e7e3da', 0.6), x - 0.8, HT + 2.0, 7.3, x + 0.8, HT + 2.25, 8.4); windowAt(B, { face: 'Z', c: 8.3, u: x, y: HT + 0.55, w: 0.9, h: 1.15, transom: false }); }   // lucarnes
    // avant-corps central à fronton
    volume(B, St, 12.0, 8.6, 18.0, 9.8, HT, { plinth: false }); B.box(M.stone('#e6dfcf'), 11.8, HT - 0.35, 8.5, 18.2, HT + 0.15, 10.0);
    pediment(B, 12.0, 18.0, 9.6, HT + 0.15, 2.6); clock(B, 15.0, HT + 1.05, 9.85, 0.62);
    B.box(sl, 11.6, HT + 0.15, 7.0, 18.4, HT + 2.6, 9.6, {});
    const fz = { face: 'Z', c: 8.6, w: 1.3, h: 2.0, frame: '#ece9e2', lintel: '#e3dccc' };
    windowRow(B, Object.assign({}, fz, { u0: 8.0, u1: 12.0, n: 2, ys: [0.95, H1 + 0.8, H1 + H2 + 0.8] })); windowRow(B, Object.assign({}, fz, { u0: 18.0, u1: 29.0, n: 5, ys: [0.95, H1 + 0.8, H1 + H2 + 0.8] }));
    windowRow(B, Object.assign({}, fz, { c: 9.8, u0: 12.0, u1: 18.0, n: 3, ys: [H1 + 0.8, H1 + H2 + 0.8], skip: () => false }));
    railing(B, 'Z', 9.8, 13.0, 17.0, H1 + 0.6);
    door(B, { face: 'Z', c: 9.8, u: 15.0, w: 2.4, h: 3.0, frame: '#39414a' }); windowAt(B, { face: 'Z', c: 9.8, u: 12.95, y: 0.95, w: 1.1, h: 2.0, frame: '#ece9e2' }); windowAt(B, { face: 'Z', c: 9.8, u: 17.05, y: 0.95, w: 1.1, h: 2.0, frame: '#ece9e2' });
    signBand(B, 'L', 12.9, 17.1, H1 - 0.6, H1 - 0.12, 9.8);
    B.box(M.stone('#cfc6b3'), 13.2, 0, 9.8, 16.8, 0.18, 10.9); B.box(M.stone('#cfc6b3'), 13.5, 0, 9.8, 16.5, 0.34, 10.4);   // perron
    // aile en retour (gauche), brique, 3 niveaux : elle ne masque pas la façade principale
    volume(B, Br, 1.0, 8.6, 8.0, 18.6, HT); band(B, 1.0, 8.6, 8.0, 18.6, H1 - 0.1); band(B, 1.0, 8.6, 8.0, 18.6, H1 + H2 - 0.1); band(B, 1.0, 8.6, 8.0, 18.6, HT - 0.35, 0.5, 0.22, '#e6dfcf');
    roofHip(B, sl, 1.0, 8.6, 8.0, 18.6, HT + 0.15, 3.2, 0.5); chain(B, St, 8.0, 18.6, HT - 0.35, -1, -1);
    windowRow(B, { face: 'Z', c: 18.6, u0: 1.0, u1: 8.0, n: 2, ys: [0.95, H1 + 0.8, H1 + H2 + 0.8], w: 1.3, h: 2.0, lintel: STONE });
    windowRow(B, { face: 'X', c: 8.0, u0: 8.6, u1: 18.6, n: 4, ys: [0.95, H1 + 0.8, H1 + H2 + 0.8], w: 1.3, h: 2.0, lintel: STONE });
    windowRow(B, { face: 'X', c: 29.0, u0: 1.0, u1: 8.6, n: 3, ys: [0.95, H1 + 0.8, H1 + H2 + 0.8], w: 1.3, h: 2.0, lintel: '#e3dccc' });
    // cour d'honneur : platanes, bancs, abri à vélos, terrain de sport, grille haute sur muret, portail entre piliers, drapeaux
    [[10.6, 11.6], [21.4, 11.6], [25.6, 11.8], [27.8, 15.4], [9.8, 17.6]].forEach((p, i) => tree(B, p[0], p[1], 1.1, 70 + i));
    bench(B, 19.6, 11.4); bench(B, 23.6, 11.6); bikeShed(B, 22.4, 16.6, 27.0, 18.6);
    const fc = '#40474d'; lowWall(B, 0.3, 19.75, 12.8, 19.75, 0.6); lowWall(B, 17.2, 19.75, 29.75, 19.75, 0.6); lowWall(B, 29.75, 9.2, 29.75, 19.75, 0.6);
    fence(B, 8.4, 19.75, 12.8, 19.75, 2.0, 0.17, fc); fence(B, 17.2, 19.75, 29.75, 19.75, 2.0, 0.17, fc); fence(B, 29.75, 9.2, 29.75, 19.75, 2.0, 0.17, fc); gatePillars(B, 13.1, 16.9, 19.75, 2.8);
    ground(B, M.grass('#6d8a4b'), 0.4, 18.9, 8.0, 19.6); for (let x = 0.9; x < 7.8; x += 1.2) bush(B, x, 19.2, 0.5, 90 + x * 2);
    ground(B, M.grass('#6d8a4b'), 29.2, 0.4, 29.7, 8.8); flag(B, 11.6, 10.3, 7.0); flag(B, 18.4, 10.3, 7.0, ['#2f4a86', '#2f4a86', '#2f4a86']);
  } },
  // Pharmacie (1 case) : immeuble urbain de 3 niveaux et combles (enduit, pierre, balcons en fer forgé, ardoise), rez-de-chaussée en vitrines sous bandeau d'enseigne vierge,
  // croix verte de pharmacie à bras égaux sur potence (enseigne lumineuse caractéristique, aucune croix latine), jardinières
  pharmacie_quartier: { cases: [1, 1], seed: 7, build(B) {
    slab(B, 10, 10, M.paving('#cfcabe'));
    const En = M.render('#e9e0cc', 'ph'), St = M.stone('#d8cfbc'), H1 = 4.0, H2 = 3.3, HT = H1 + 2 * H2, x0 = 1.2, z0 = 1.2, x1 = 8.6, z1 = 8.6;
    volume(B, En, x0, z0, x1, z1, HT, { plinth: false }); B.box(M.plain('#4c5a52', 0.6, 0.1), x0 - 0.005, 0, z0 - 0.005, x1 + 0.005, H1, z1 + 0.005);   // devanture peinte (vert de gris)
    band(B, x0, z0, x1, z1, H1 - 0.05, 0.3, 0.12); band(B, x0, z0, x1, z1, H1 + H2 - 0.1); B.box(M.stone('#e6dfcf'), x0 - 0.3, HT - 0.1, z0 - 0.3, x1 + 0.3, HT + 0.35, z1 + 0.3);
    roofHip(B, M.slate(SLATE), x0, z0, x1, z1, HT + 0.35, 2.6, 0.2); B.box(M.brick('#9a6550', MORTAR), 2.4, HT + 1.4, 2.4, 3.2, HT + 3.4, 3.0);
    chain(B, St, x1, z1, HT - 0.1, -1, -1);
    // vitrines (deux faces), porte d'angle sur la face L
    windowRow(B, { face: 'Z', c: z1, u0: x0 + 0.2, u1: x1 - 0.2, n: 3, ys: [0.45], w: 2.0, h: 2.75, frame: '#e8e6e0', sill: '#b9b3a8', mullion: false, transom: false, shop: true, skip: i => i === 2 });
    door(B, { face: 'Z', c: z1, u: 7.25, w: 1.7, h: 2.75, frame: '#e8e6e0' });
    windowRow(B, { face: 'X', c: x1, u0: z0 + 0.2, u1: z1 - 0.2, n: 3, ys: [0.45], w: 2.0, h: 2.75, frame: '#e8e6e0', sill: '#b9b3a8', mullion: false, transom: false, shop: true });
    signBand(B, 'L', x0 + 0.3, x1 - 0.3, H1 - 0.78, H1 - 0.22, z1 + 0.02, '#eef0ea'); signBand(B, 'R', z0 + 0.3, z1 - 0.3, H1 - 0.78, H1 - 0.22, x1 + 0.02, '#eef0ea');
    B.box(M.plain('#4f9e6a', 0.6), x0 + 0.3, H1 - 0.24, z1 + 0.11, x1 - 0.3, H1 - 0.18, z1 + 0.13); B.box(M.plain('#4f9e6a', 0.6), x1 + 0.11, H1 - 0.24, z0 + 0.3, x1 + 0.13, H1 - 0.18, z1 - 0.3);   // filet vert sous le bandeau
    // étages : fenêtres hautes à la française, balcons filants au 1er
    const fo = { w: 1.15, h: 2.05, frame: '#efece5', lintel: '#e1d9c8' };
    windowRow(B, Object.assign({ face: 'Z', c: z1, u0: x0, u1: x1, n: 3, ys: [H1 + 0.55, H1 + H2 + 0.55] }, fo)); windowRow(B, Object.assign({ face: 'X', c: x1, u0: z0, u1: z1, n: 3, ys: [H1 + 0.55, H1 + H2 + 0.55] }, fo));
    railing(B, 'Z', z1, x0 + 0.4, x1 - 0.4, H1 + 0.45); railing(B, 'X', x1, z0 + 0.4, z1 - 0.4, H1 + 0.45);
    for (const x of [3.0, 6.8]) { B.box(M.slate(SLATE), x - 0.55, HT + 0.5, 7.6, x + 0.55, HT + 1.9, 8.45); windowAt(B, { face: 'Z', c: 8.45, u: x, y: HT + 0.7, w: 0.7, h: 0.95, transom: false }); }   // lucarnes
    // croix verte de pharmacie (bras égaux) dans un caisson carré sur potence, perpendiculaire à la façade L, près de l'angle
    const cxs = 8.0, cy = H1 + 0.15 + 1.1, cz = z1 + 1.25, k = M.plain('#33383d', 0.5, 0.4), gC = new THREE.MeshStandardMaterial({ color: '#3fa456', emissive: '#2f9a4a', emissiveIntensity: 0.55, roughness: 0.4, side: THREE.DoubleSide });
    gC.userData.uv = 1; gC.userData.uvMode = 'world';
    B.box(k, cxs - 0.04, cy - 0.06, z1, cxs + 0.04, cy + 0.06, cz - 0.75); B.box(k, cxs - 0.1, cy - 0.82, cz - 0.82, cxs + 0.1, cy + 0.82, cz + 0.82);
    B.box(M.plain('#f3f3ef', 0.6), cxs - 0.11, cy - 0.76, cz - 0.76, cxs + 0.11, cy + 0.76, cz + 0.76);
    B.box(gC, cxs - 0.16, cy - 0.64, cz - 0.21, cxs + 0.16, cy + 0.64, cz + 0.21); B.box(gC, cxs - 0.16, cy - 0.21, cz - 0.64, cxs + 0.16, cy + 0.21, cz + 0.64);
    // trottoir : jardinières, potelets
    [[1.6, 9.3], [9.3, 2.2]].forEach(([x, z], i) => { B.box(M.plain('#6a6f72', 0.7), x - 0.45, 0, z - 0.3, x + 0.45, 0.5, z + 0.3); bush(B, x, z, 0.4, 100 + i); });
    for (let x = 2.5; x < 6.5; x += 1.3) B.cyl(M.plain('#3d4247', 0.5, 0.4), x, 0, 9.55, 0.06, 0.8, 8);
  } },
  // Commerces de quartier (1 case) : immeuble de ville à rez-de-chaussée commercial (vitrines, store banne sobre, bandeau d'enseigne vierge), étages d'habitation.
  // Remplacent les petits cubes à pictogramme géant sur le toit (tasse, couverts, baguette, cintre) : la fonction se lit à la devanture, le nom est peint par le jeu.
  cafe_quartier: { cases: [1, 1], seed: 11, build(B) { shopBuilding(B, { wall: '#e8dfca', front: '#2f4a3f', awn: ['#2f5a48', '#efe9dc'], roof: 'zinc', floors: 2, terrace: 'cafe' }); } },
  restaurant_quartier: { cases: [1, 1], seed: 12, build(B) { shopBuilding(B, { wall: '#d9c7ad', brick: true, front: '#5a2b2b', awn: ['#6d2f2f', '#ece4d4'], roof: 'slate', floors: 2, terrace: 'resto' }); } },
  boulangerie_quartier: { cases: [1, 1], seed: 13, build(B) { shopBuilding(B, { wall: '#eadfc8', front: '#7a5a3a', awn: ['#8a6a44', '#f0e8d6'], roof: 'tiles', floors: 2, terrace: 'bancs' }); } },
  boutique_quartier: { cases: [1, 1], seed: 14, build(B) { shopBuilding(B, { wall: '#e4e1da', front: '#2e3138', awn: null, roof: 'slate', floors: 3, terrace: 'plantes' }); } },
  // Hôtel de ville (2 × 2) : pierre de taille, deux grands niveaux, avant-corps à fronton et horloge, campanile, toit d'ardoise, parvis à degrés, drapeaux, pelouses
  hotel_de_ville: { cases: [2, 2], seed: 15, build(B) {
    slab(B, 20, 20, M.paving('#d3cec2'));
    ground(B, M.grass('#6d8a4b'), 0.4, 13.0, 8.4, 19.6); ground(B, M.grass('#6d8a4b'), 13.6, 13.0, 19.6, 19.6); ground(B, M.grass('#6d8a4b'), 18.6, 0.4, 19.6, 12.4);
    const St = M.stone('#ddd3bf'), sl = M.slate(SLATE), H1 = 4.6, H2 = 4.2, HT = H1 + H2;
    volume(B, St, 1.6, 2.2, 18.4, 10.6, HT, { ph: 0.8 }); band(B, 1.6, 2.2, 18.4, 10.6, H1 - 0.1, 0.3, 0.1, '#e7e0d0'); B.box(M.stone('#e8e1d1'), 1.3, HT - 0.2, 1.9, 18.7, HT + 0.35, 10.9);
    roofHip(B, sl, 1.6, 2.2, 18.4, 10.6, HT + 0.35, 3.4, 0.35);
    for (const x of [4.2, 7.0, 13.0, 15.8]) { B.box(sl, x - 0.6, HT + 0.6, 9.5, x + 0.6, HT + 2.1, 10.3); windowAt(B, { face: 'Z', c: 10.3, u: x, y: HT + 0.75, w: 0.75, h: 1.0, transom: false }); }
    chain(B, St, 18.4, 10.6, HT - 0.2, -1, -1); chain(B, St, 1.6, 10.6, HT - 0.2, 1, -1);
    const fo = { face: 'Z', c: 10.6, w: 1.3, h: 2.5, frame: '#efece5', lintel: '#e9e2d2' };
    windowRow(B, Object.assign({}, fo, { u0: 1.6, u1: 7.6, n: 3, ys: [1.2, H1 + 0.8] })); windowRow(B, Object.assign({}, fo, { u0: 12.4, u1: 18.4, n: 3, ys: [1.2, H1 + 0.8] }));
    windowRow(B, { face: 'X', c: 18.4, u0: 2.2, u1: 10.6, n: 3, ys: [1.2, H1 + 0.8], w: 1.3, h: 2.5, frame: '#efece5', lintel: '#e9e2d2' });
    // avant-corps central
    volume(B, M.stone('#e2d9c6'), 7.6, 10.6, 12.4, 11.8, HT + 0.4, { plinth: false }); pediment(B, 7.6, 12.4, 11.6, HT + 0.4, 2.0); clock(B, 10.0, HT + 1.15, 11.85, 0.55);
    B.box(sl, 7.2, HT + 0.4, 9.0, 12.8, HT + 2.1, 11.6);
    door(B, { face: 'Z', c: 11.8, u: 10.0, w: 2.2, h: 3.2, frame: '#3b3328' }); windowRow(B, { face: 'Z', c: 11.8, u0: 7.6, u1: 12.4, n: 2, ys: [H1 + 0.8], w: 1.3, h: 2.5, frame: '#efece5' });
    railing(B, 'Z', 11.8, 8.0, 12.0, H1 + 0.6); signBand(B, 'L', 8.3, 11.7, H1 - 0.95, H1 - 0.35, 11.8);
    for (let i = 0; i < 4; i++) B.box(M.stone('#cfc6b3'), 7.4 - i * 0.4, 0, 11.8, 12.6 + i * 0.4, 0.6 - i * 0.15, 12.4 + i * 0.45);   // degrés du perron
    // campanile sur le faîtage
    const cx = 10.0, cz = 6.4, yb = HT + 3.0; B.box(St, cx - 1.3, HT + 1.0, cz - 1.3, cx + 1.3, yb + 3.0, cz + 1.3);
    [[0, 1], [1, 0]].forEach(([a, b]) => { for (const s of [-1, 1]) { const P = b ? [cx - 0.45, yb + 0.7, cz + s * 1.31, cx + 0.45, yb + 2.4, cz + s * 1.32] : [cx + s * 1.31, yb + 0.7, cz - 0.45, cx + s * 1.32, yb + 2.4, cz + 0.45]; B.box(M.plain('#2e3236', 0.8), Math.min(P[0], P[3]), P[1], Math.min(P[2], P[5]), Math.max(P[0], P[3]), P[4], Math.max(P[2], P[5])); } });
    B.box(M.stone('#e8e1d1'), cx - 1.5, yb + 3.0, cz - 1.5, cx + 1.5, yb + 3.3, cz + 1.5); const zr = M.zinc('#7d878e');
    B.roofTri(zr, [cx + 1.5, yb + 3.3, cz + 1.5], [cx - 1.5, yb + 3.3, cz + 1.5], [cx, yb + 5.6, cz]); B.roofTri(zr, [cx + 1.5, yb + 3.3, cz - 1.5], [cx + 1.5, yb + 3.3, cz + 1.5], [cx, yb + 5.6, cz]);
    B.roofTri(zr, [cx - 1.5, yb + 3.3, cz + 1.5], [cx - 1.5, yb + 3.3, cz - 1.5], [cx, yb + 5.6, cz]); B.roofTri(zr, [cx - 1.5, yb + 3.3, cz - 1.5], [cx + 1.5, yb + 3.3, cz - 1.5], [cx, yb + 5.6, cz]);
    B.cyl(M.plain('#6c7378', 0.4, 0.6), cx, yb + 5.6, cz, 0.04, 1.2, 6);
    flag(B, 6.4, 12.6, 6.5); flag(B, 13.6, 12.6, 6.5, ['#2f4a86', '#2f4a86', '#2f4a86']);
    [[2.2, 15.6], [5.6, 17.6], [16.6, 15.4], [18.8, 4.0]].forEach((p, i) => tree(B, p[0], p[1], 1.0, 130 + i));
    for (let x = 1.0; x < 8.2; x += 1.1) bush(B, x, 13.4, 0.45, 140 + x * 3); for (let x = 13.9; x < 19.4; x += 1.1) bush(B, x, 13.4, 0.45, 150 + x * 3);
    for (const x of [8.6, 11.4]) { B.box(M.stone('#cdc4b1'), x - 0.4, 0, 16.0, x + 0.4, 0.5, 16.8); bush(B, x, 16.4, 0.4, 160 + x); }
  } },
};
// Immeuble de ville à commerce en rez-de-chaussée (1 case). o : wall (enduit), brick, front (devanture), awn ([bande, fond] ou null), roof (zinc | slate | tiles), floors (étages au-dessus du commerce), terrace
function shopBuilding(B, o) {
  slab(B, 10, 10, M.paving('#cfcabe'));
  const H1 = 4.0, H2 = 3.2, HT = H1 + o.floors * H2, x0 = 1.0, z0 = 1.0, x1 = 8.4, z1 = 7.6;
  const Wm = o.brick ? M.brick('#a7735a', MORTAR) : M.render(o.wall, 'sh' + o.wall);
  volume(B, Wm, x0, z0, x1, z1, HT, { plinth: false }); B.box(M.plain(o.front, 0.55, 0.1), x0 - 0.005, 0, z0 - 0.005, x1 + 0.005, H1, z1 + 0.005);
  band(B, x0, z0, x1, z1, H1 - 0.05, 0.28, 0.12); for (let f = 1; f < o.floors; f++) band(B, x0, z0, x1, z1, H1 + f * H2 - 0.1, 0.18, 0.06);
  B.box(M.stone('#e6dfcf'), x0 - 0.25, HT - 0.1, z0 - 0.25, x1 + 0.25, HT + 0.3, z1 + 0.25);
  if (o.roof === 'zinc') roofHip(B, M.zinc('#8d969c'), x0, z0, x1, z1, HT + 0.3, 2.2, 0.15); else if (o.roof === 'tiles') roofHip(B, M.tiles(TILE), x0, z0, x1, z1, HT + 0.3, 2.4, 0.3); else roofHip(B, M.slate(SLATE), x0, z0, x1, z1, HT + 0.3, 2.6, 0.2);
  B.box(M.brick('#9a6550', MORTAR), 2.2, HT + 1.0, 2.0, 3.0, HT + 3.0, 2.6);
  const sh = { ys: [0.4], w: 2.0, h: 2.6, frame: '#e9e6df', sill: '#b9b3a8', mullion: false, transom: false, shop: true };
  windowRow(B, Object.assign({ face: 'Z', c: z1, u0: x0 + 0.1, u1: x1 - 0.1, n: 3, skip: i => i === 1 }, sh)); door(B, { face: 'Z', c: z1, u: (x0 + x1) / 2, w: 1.6, h: 2.6, frame: '#e9e6df' });
  windowRow(B, Object.assign({ face: 'X', c: x1, u0: z0 + 0.1, u1: z1 - 0.1, n: 2 }, sh));
  signBand(B, 'L', x0 + 0.3, x1 - 0.3, H1 - 0.72, H1 - 0.2, z1 + 0.02, '#f2efe7'); signBand(B, 'R', z0 + 0.3, z1 - 0.3, H1 - 0.72, H1 - 0.2, x1 + 0.02, '#f2efe7');
  if (o.awn) {   // stores bannes rayés, couleurs sobres, lambrequin
    const am = M.awning(o.awn[0], o.awn[1]); const ya = H1 - 0.85, yb = ya - 0.75, d = 1.3;
    B.roofPlane(am, [x1 - 0.2, yb, z1 + d], [x0 + 0.2, yb, z1 + d], [x0 + 0.2, ya, z1 + 0.05], [x1 - 0.2, ya, z1 + 0.05]); B.box(am, x0 + 0.2, yb - 0.3, z1 + d - 0.03, x1 - 0.2, yb, z1 + d + 0.02);
    B.roofPlane(am, [x1 + d, yb, z0 + 0.2], [x1 + d, yb, z1 - 0.2], [x1 + 0.05, ya, z1 - 0.2], [x1 + 0.05, ya, z0 + 0.2]); B.box(am, x1 + d - 0.03, yb - 0.3, z0 + 0.2, x1 + d + 0.02, yb, z1 - 0.2);
  }
  const fo = { w: 1.1, h: 1.9, frame: '#efece5', lintel: '#e1d9c8', shutters: o.brick ? '#56635b' : null };
  const ys = []; for (let f = 0; f < o.floors; f++) ys.push(H1 + f * H2 + 0.55);
  windowRow(B, Object.assign({ face: 'Z', c: z1, u0: x0, u1: x1, n: 3, ys }, fo)); windowRow(B, Object.assign({ face: 'X', c: x1, u0: z0, u1: z1, n: 3, ys }, fo));
  railing(B, 'Z', z1, x0 + 0.3, x1 - 0.3, H1 + 0.45, 0.9, '#2f3337', 0.4);
  // terrasse / trottoir
  const R = B.R;
  if (o.terrace === 'cafe' || o.terrace === 'resto') {
    const tab = M.plain('#d9d6cf', 0.5, 0.3), ch = M.plain(o.terrace === 'cafe' ? '#3d4a44' : '#5b4636', 0.7), pole = M.plain('#5f6469', 0.5, 0.4), cloth = M.plain('#ece7da', 0.85);
    const spots = o.terrace === 'cafe' ? [[2.0, 8.6], [3.9, 8.7], [5.8, 8.6], [9.2, 3.0], [9.2, 5.4]] : [[2.2, 8.7], [5.6, 8.7], [9.2, 4.2]];
    spots.forEach(([x, z]) => { B.cyl(pole, x, 0, z, 0.04, 0.75, 8); B.cyl(tab, x, 0.72, z, 0.38, 0.05, 14); [[0.55, 0], [-0.55, 0]].forEach(([a, b]) => { B.box(ch, x + a - 0.18, 0.42, z + b - 0.18, x + a + 0.18, 0.47, z + b + 0.18); B.box(ch, x + a + (a > 0 ? 0.14 : -0.18), 0.47, z - 0.18, x + a + (a > 0 ? 0.18 : -0.14), 0.95, z + 0.18); }); });
    if (o.terrace === 'resto') spots.forEach(([x, z]) => { B.cyl(pole, x, 0.75, z, 0.03, 1.6, 6); const g = new THREE.ConeGeometry(1.25, 0.55, 8, 1, true); g.translate(x, 2.6, z); B.add(cloth, g); });
    B.box(M.plain('#6a6f72', 0.7), 8.8, 0, 8.6, 9.7, 0.5, 9.5); bush(B, 9.25, 9.05, 0.42, 300);
  } else if (o.terrace === 'bancs') { bench(B, 3.0, 8.9); bench(B, 9.1, 4.2, 'z'); [[1.5, 8.9], [9.2, 8.7]].forEach(([x, z], i) => { B.box(M.plain('#6a6f72', 0.7), x - 0.35, 0, z - 0.35, x + 0.35, 0.5, z + 0.35); bush(B, x, z, 0.38, 310 + i); }); }
  else { [[2.0, 8.6], [6.8, 8.6], [9.2, 2.2], [9.2, 6.0]].forEach(([x, z], i) => { B.box(M.plain('#5d6265', 0.7), x - 0.35, 0, z - 0.35, x + 0.35, 0.55, z + 0.35); bush(B, x, z, 0.4, 320 + i); }); }
  for (let x = 1.2; x < 8.4; x += 1.8) B.cyl(M.plain('#3d4247', 0.5, 0.4), x, 0, 9.65, 0.05, 0.8, 8);
}
export async function render(name, opts) { const s = SPRITES[name]; const r = await renderSprite(s, Object.assign({}, s.opts, opts)); r.cases = s.cases; return r; }
