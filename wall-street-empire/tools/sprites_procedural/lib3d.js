// Rendu procédural 3D des bâtiments (module chargé dans Chromium par render.js).
// Unité : 1 = 1 mètre ; une case du jeu = CASE mètres. Axe X du monde = axe x de la grille du jeu (vers le bas-droit de l'écran),
// axe Z = axe y de la grille (vers le bas-gauche), Y = hauteur. Faces visibles : +Z (« L », avant-gauche, éclairée) et +X (« R », avant-droite, à l'ombre).
// Caméra orthographique à 45° d'azimut et 30° d'élévation : la case se projette en losange 2:1 exact, comme la grille du jeu (iso(), TW = 2 TH).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export const CASE = 10;          // mètres par case (étage ≈ 0,33 case, mesuré sur immeuble_n1 / immeuble_pnj_a : ≈ 80 px par étage pour 396 px de losange)
export const PX_CASE = 396;      // largeur du losange d'une case dans les sprites HD (assets/phase2_hd)

// ---------- hasard déterministe ----------
export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hex = (c, k = 1) => { const n = parseInt(c.slice(1), 16), f = v => Math.round(Math.max(0, Math.min(255, v * k))); return `rgb(${f(n >> 16 & 255)},${f(n >> 8 & 255)},${f(n & 255)})`; };   // couleur sRGB (canevas) : pas de passage par THREE.Color (linéaire)

// ---------- textures générées (canevas) ----------
const TEX = new Map();
function canvasTex(key, w, h, draw, repeatM) {   // repeatM : mètres couverts par la texture (UV monde)
  if (TEX.has(key)) return TEX.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData.m = repeatM || 1;
  TEX.set(key, t); return t;
}
function noise(g, w, h, amp, seed, size = 1) { const R = rng(seed); const d = g.getImageData(0, 0, w, h), a = d.data; for (let y = 0; y < h; y += size) for (let x = 0; x < w; x += size) { const v = (R() - 0.5) * amp; for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) { const k = ((y + j) * w + x + i) * 4; a[k] += v; a[k + 1] += v; a[k + 2] += v; } } g.putImageData(d, 0, 0); }
export const T = {
  brick: (base = '#9a5a44', mortar = '#cbbfae') => canvasTex('brick' + base, 512, 512, (g, w, h) => {   // appareil en panneresse, 4 m × 4 m ; brique 0,25 × 0,075 m
    g.fillStyle = mortar; g.fillRect(0, 0, w, h); const R = rng(7), bw = 32, bh = 9.6;
    for (let r = 0; r * bh < h; r++) for (let x = -(r % 2) * bw / 2; x < w; x += bw) { g.fillStyle = hex(base, 0.86 + R() * 0.26); g.fillRect(x + 1, r * bh + 1, bw - 2, bh - 1.6); }
    noise(g, w, h, 14, 3);
  }, 4),
  render: (base = '#e6dcc6', key = '') => canvasTex('render' + base + key, 256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); noise(g, w, h, 10, 5, 2); noise(g, w, h, 6, 6); }, 3),
  stone: (base = '#d9cfbc') => canvasTex('stone' + base, 512, 512, (g, w, h) => {   // pierre de taille : assises de 0,5 m, joints fins
    g.fillStyle = base; g.fillRect(0, 0, w, h); const R = rng(11), ch = 64, cw = 128;
    for (let r = 0; r * ch < h; r++) for (let x = -(r % 2) * cw / 2; x < w; x += cw) { g.fillStyle = hex(base, 0.94 + R() * 0.1); g.fillRect(x + 1, r * ch + 1, cw - 2, ch - 2); }
    noise(g, w, h, 8, 12);
  }, 4),
  tiles: (base = '#b0674a') => canvasTex('tiles' + base, 512, 512, (g, w, h) => {   // tuiles mécaniques : rangs de 0,3 m (v = pente), ombre sous chaque rang
    g.fillStyle = hex(base, 0.8); g.fillRect(0, 0, w, h); const R = rng(21), rh = 38, tw = 26;
    for (let r = 0; r * rh < h; r++) for (let x = -(r % 2) * tw / 2; x < w; x += tw) { const k = 0.85 + R() * 0.25; const gr = g.createLinearGradient(0, r * rh, 0, r * rh + rh); gr.addColorStop(0, hex(base, k * 1.08)); gr.addColorStop(0.8, hex(base, k * 0.95)); gr.addColorStop(1, hex(base, k * 0.62)); g.fillStyle = gr; g.fillRect(x + 1, r * rh, tw - 2, rh); }
    noise(g, w, h, 10, 22);
  }, 4),
  slate: (base = '#5d636b') => canvasTex('slate' + base, 512, 512, (g, w, h) => {   // ardoise : petits modules, rangs de 0,2 m
    g.fillStyle = hex(base, 0.75); g.fillRect(0, 0, w, h); const R = rng(31), rh = 26, tw = 30;
    for (let r = 0; r * rh < h; r++) for (let x = -(r % 2) * tw / 2; x < w; x += tw) { g.fillStyle = hex(base, 0.88 + R() * 0.2); g.fillRect(x + 1, r * rh + 1, tw - 2, rh - 3); }
    noise(g, w, h, 10, 32);
  }, 4),
  zinc: (base = '#8d959c') => canvasTex('zinc' + base, 512, 512, (g, w, h) => {   // zinc à joints debout tous les 0,5 m (u), le long de la pente (v)
    g.fillStyle = base; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { g.fillStyle = hex(base, 1.18); g.fillRect(x, 0, 3, h); g.fillStyle = hex(base, 0.78); g.fillRect(x + 3, 0, 3, h); }
    noise(g, w, h, 6, 41, 2);
  }, 4),
  membrane: (base = '#9a9c9c') => canvasTex('memb' + base, 256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); noise(g, w, h, 18, 51); noise(g, w, h, 8, 52, 4); }, 4),
  paving: (base = '#c9c4b8') => canvasTex('pave' + base, 512, 512, (g, w, h) => {   // dalles de béton 0,5 m
    g.fillStyle = hex(base, 0.85); g.fillRect(0, 0, w, h); const R = rng(61), s = 64;
    for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) { g.fillStyle = hex(base, 0.95 + R() * 0.08); g.fillRect(x + 1, y + 1, s - 2, s - 2); }
    noise(g, w, h, 8, 62);
  }, 4),
  asphalt: (base = '#8f8e8a') => canvasTex('asph' + base, 256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); noise(g, w, h, 22, 71); noise(g, w, h, 8, 72, 3); }, 4),
  grass: (base = '#6f8f4a') => canvasTex('grass' + base, 256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); noise(g, w, h, 26, 81); noise(g, w, h, 14, 82, 4); }, 3),
  wood: (base = '#9a7a56') => canvasTex('wood' + base, 256, 256, (g, w, h) => {   // bardage vertical : lames de 0,15 m
    g.fillStyle = base; g.fillRect(0, 0, w, h); const R = rng(91); for (let x = 0; x < w; x += 19) { g.fillStyle = hex(base, 0.85 + R() * 0.25); g.fillRect(x, 0, 17, h); g.fillStyle = hex(base, 0.6); g.fillRect(x + 17, 0, 2, h); }
    noise(g, w, h, 10, 92);
  }, 2.5),
  shop: () => canvasTex('shop', 128, 128, (g, w, h) => {   // vitrine éclairée : intérieur clair, rayonnages, reflet
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d9d4c6'); gr.addColorStop(1, '#a9a293'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R = rng(121); for (let y = 30; y < h - 20; y += 22) { g.fillStyle = '#7d766a'; g.fillRect(4, y, w - 8, 3); for (let x = 6; x < w - 8; x += 7) { g.fillStyle = ['#5f8f73', '#c9c3b5', '#8aa1b4', '#b5a089', '#e5e1d8'][Math.floor(R() * 5)]; g.fillRect(x, y - 9, 5, 9); } }
    g.fillStyle = 'rgba(40,52,64,.35)'; g.fillRect(0, 0, w, 14); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(w * 0.1, 0); g.lineTo(w * 0.5, 0); g.lineTo(w * 0.1, h); g.lineTo(0, h); g.lineTo(0, h * 0.5); g.fill();
  }, 1),
  stripes: (a, b) => canvasTex('str' + a + b, 128, 64, (g, w, h) => { for (let x = 0; x < w; x += 32) { g.fillStyle = a; g.fillRect(x, 0, 16, h); g.fillStyle = b; g.fillRect(x + 16, 0, 16, h); } noise(g, w, h, 8, 131); }, 1.0),
  sand: () => canvasTex('sand', 128, 128, (g, w, h) => { g.fillStyle = '#d8c9a3'; g.fillRect(0, 0, w, h); noise(g, w, h, 20, 101); }, 2),
  glass: () => canvasTex('glass', 64, 128, (g, w, h) => {   // vitrage : reflet du ciel en haut, sombre en bas, reflet oblique
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fb3c4'); gr.addColorStop(0.45, '#5d7487'); gr.addColorStop(1, '#2f3c49'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.10)'; g.beginPath(); g.moveTo(w * 0.15, 0); g.lineTo(w * 0.55, 0); g.lineTo(w * 0.15, h * 0.6); g.lineTo(0, h * 0.6); g.lineTo(0, h * 0.3); g.closePath(); g.fill();
  }, 1),
};

// ---------- matériaux ----------
const MAT = new Map();
export function mat(key, o) {
  if (MAT.has(key)) return MAT.get(key);
  const { uvMode, ...q } = o || {}; const p = Object.assign({ roughness: 0.88, metalness: 0, side: THREE.DoubleSide }, q); const m = new THREE.MeshStandardMaterial(p);
  m.userData.uv = q.map ? (q.map.userData.m || 1) : 1; m.userData.uvMode = uvMode || 'world'; MAT.set(key, m); return m;
}
export const M = {
  brick: (b, mo) => mat('brick' + b + mo, { map: T.brick(b, mo) }),
  render: (c, k) => mat('render' + c + (k || ''), { map: T.render(c, k) }),
  stone: (c) => mat('stone' + c, { map: T.stone(c) }),
  plain: (c, r = 0.85, m = 0) => mat('plain' + c + r + m, { color: c, roughness: r, metalness: m }),
  tiles: (c) => mat('tiles' + c, { map: T.tiles(c), uvMode: 'roof' }),
  slate: (c) => mat('slate' + c, { map: T.slate(c), uvMode: 'roof' }),
  zinc: (c) => mat('zinc' + c, { map: T.zinc(c), uvMode: 'roof', roughness: 0.55, metalness: 0.25 }),
  membrane: (c) => mat('memb' + c, { map: T.membrane(c) }),
  paving: (c) => mat('pave' + c, { map: T.paving(c) }),
  asphalt: (c) => mat('asph' + c, { map: T.asphalt(c) }),
  grass: (c) => mat('grass' + c, { map: T.grass(c) }),
  wood: (c) => mat('wood' + c, { map: T.wood(c) }),
  sand: () => mat('sand', { map: T.sand() }),
  glass: () => mat('glass', { map: T.glass(), roughness: 0.25, metalness: 0.1, uvMode: 'own' }),
  shop: () => mat('shopglass', { map: T.shop(), roughness: 0.3, emissive: '#ffffff', emissiveMap: T.shop(), emissiveIntensity: 0.25, uvMode: 'own' }),
  awning: (a, b) => mat('awn' + a + b, { map: T.stripes(a, b), roughness: 0.9, uvMode: 'roof' }),
  leaf: () => mat('leaf', { vertexColors: true, roughness: 0.95 }),
};

// ---------- assembleur : géométries fusionnées par matériau, UV monde ----------
const _v = new THREE.Vector3(), _n = new THREE.Vector3();
function worldUV(geo, m) {
  const mode = m.userData.uvMode, s = m.userData.uv || 1; if (mode === 'own') return geo;
  const P = geo.attributes.position, N = geo.attributes.normal, uv = new Float32Array(P.count * 2);
  for (let i = 0; i < P.count; i++) {
    _v.fromBufferAttribute(P, i); _n.fromBufferAttribute(N, i); const ax = Math.abs(_n.x), ay = Math.abs(_n.y), az = Math.abs(_n.z);
    let u, v;
    if (ay >= ax && ay >= az) { u = _v.x; v = _v.z; } else if (ax >= az) { u = _v.z; v = _v.y; } else { u = _v.x; v = _v.y; }
    uv[i * 2] = u / s; uv[i * 2 + 1] = v / s;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return geo;
}
export class Builder {
  constructor(seed = 1) { this.parts = new Map(); this.R = rng(seed); this.signs = []; this.extra = []; }
  add(m, geo, noShadow) { const k = m.uuid + (noShadow ? '!' : ''); if (!this.parts.has(k)) this.parts.set(k, { m, g: [], ns: !!noShadow }); this.parts.get(k).g.push(worldUV(geo.index ? geo.toNonIndexed() : geo, m)); return this; }
  box(m, x0, y0, z0, x1, y1, z1, o = {}) {   // pavé aligné sur les axes (coins min / max)
    const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    if (o.rotY) { g.translate(-o.cx, 0, -o.cz); g.rotateY(o.rotY); g.translate(o.cx, 0, o.cz); }
    return this.add(m, g, o.ns);
  }
  quad(m, a, b, c, d, uvs) {   // quadrilatère (sens anti-horaire vu de dehors) ; uvs facultatifs
    const g = new THREE.BufferGeometry(), p = [a, b, c, a, c, d].flat(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    if (uvs) g.setAttribute('uv', new THREE.Float32BufferAttribute([uvs[0], uvs[1], uvs[2], uvs[0], uvs[2], uvs[3]].flat(), 2));
    g.computeVertexNormals(); if (uvs) { const k = m.userData.uvMode; m.userData.uvMode = 'own'; this.add(m, g); m.userData.uvMode = k; return this; } return this.add(m, g);
  }
  tri(m, a, b, c) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([a, b, c].flat(), 3)); g.computeVertexNormals(); return this.add(m, g); }
  roofPlane(m, a, b, c, d, down) {   // pan de toit : a-b égout, c-d faîtage ; UV : u le long de l'égout, v le long de la pente (rangs de tuiles parallèles à l'égout)
    const s = m.userData.uv || 4, A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), dirU = B.clone().sub(A).normalize(), slopeV = new THREE.Vector3(...d).sub(A);
    const dirV = slopeV.clone().sub(dirU.clone().multiplyScalar(slopeV.dot(dirU))).normalize();
    const uvOf = p => { const q = new THREE.Vector3(...p).sub(A); return [q.dot(dirU) / s, q.dot(dirV) / s]; };
    return this.quad(m, a, b, c, d, [uvOf(a), uvOf(b), uvOf(c), uvOf(d)]);
  }
  roofTri(m, a, b, c) { const s = m.userData.uv || 4, A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), dirU = B.clone().sub(A).normalize(), q = new THREE.Vector3(...c).sub(A), dirV = q.clone().sub(dirU.clone().multiplyScalar(q.dot(dirU))).normalize();
    const uvOf = p => { const r = new THREE.Vector3(...p).sub(A); return [r.dot(dirU) / s, r.dot(dirV) / s]; };
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([a, b, c].flat(), 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([uvOf(a), uvOf(b), uvOf(c)].flat(), 2)); g.computeVertexNormals();
    const k = m.userData.uvMode; m.userData.uvMode = 'own'; this.add(m, g); m.userData.uvMode = k; return this; }
  cyl(m, x, y0, z, r, h, seg = 10, o = {}) { const g = new THREE.CylinderGeometry(o.r2 != null ? o.r2 : r, r, h, seg); g.translate(x, y0 + h / 2, z); return this.add(m, g, o.ns); }
  sign(face, x0, y0, z0, x1, y1, z1) { this.signs.push({ face, p: [[x0, y0, z0], [x1, y1, z1]] }); }   // bandeau d'enseigne vierge (le jeu y peint le nom)
  build(scene) {
    for (const { m, g, ns } of this.parts.values()) {
      const geo = mergeGeometries(g, false); if (!geo) { console.warn('fusion impossible', m.name || m.uuid); continue; }
      const mesh = new THREE.Mesh(geo, m); mesh.castShadow = !ns; mesh.receiveShadow = true; scene.add(mesh);
    }
    this.extra.forEach(o => scene.add(o));
  }
}

// ---------- éléments d'architecture ----------
// Fenêtre sur une façade. face : 'X' (plan x = c, normale +X ou -X selon sgn) ou 'Z'. (u, y) : centre horizontal le long de la façade, bas de la fenêtre.
export function windowAt(B, o) {
  const { face, c, sgn = 1, u, y, w = 1.4, h = 1.7, frame = '#ebe8e1', sill = '#d6d0c4', mullion = true, transom = true, shutters = null, lintel = null, depth = 0.12 } = o;
  const F = M.plain(frame, 0.6), G = o.shop ? M.shop() : M.glass(), S = M.plain(sill, 0.8), fr = 0.08;
  const P = (uu, yy, dd) => face === 'X' ? [c + sgn * dd, yy, uu] : [uu, yy, c + sgn * dd];
  const bx = (u0, y0, d0, u1, y1, d1, m) => { const a = P(u0, y0, d0), b = P(u1, y1, d1); B.box(m, Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])); };
  // vitrage (plan juste devant le mur, UV propres)
  const g0 = P(u - w / 2, y, 0.015), g1 = P(u + w / 2, y, 0.015), g2 = P(u + w / 2, y + h, 0.015), g3 = P(u - w / 2, y + h, 0.015);
  const quadOrder = (face === 'X') === (sgn > 0) ? [g1, g0, g3, g2] : [g0, g1, g2, g3];   // normale vers l'extérieur
  B.quad(G, ...quadOrder, face === 'X' && sgn > 0 ? [[1, 0], [0, 0], [0, 1], [1, 1]] : [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // tableau (ébrasement sombre simulé par le cadre saillant) et dormant
  bx(u - w / 2 - fr, y - fr, 0, u - w / 2, y + h + fr, depth, F); bx(u + w / 2, y - fr, 0, u + w / 2 + fr, y + h + fr, depth, F);
  bx(u - w / 2, y + h, 0, u + w / 2, y + h + fr, depth, F); bx(u - w / 2, y - fr, 0, u + w / 2, y, depth * 0.7, F);
  if (mullion) bx(u - 0.03, y, 0, u + 0.03, y + h, 0.06, F);
  if (transom) bx(u - w / 2, y + h * 0.72, 0, u + w / 2, y + h * 0.72 + 0.05, 0.06, F);
  bx(u - w / 2 - 0.14, y - fr - 0.07, 0, u + w / 2 + 0.14, y - fr, 0.2, S);   // appui saillant
  if (lintel) bx(u - w / 2 - 0.12, y + h + fr, 0, u + w / 2 + 0.12, y + h + fr + 0.22, 0.05, M.plain(lintel, 0.8));
  if (shutters) { const SH = M.plain(shutters, 0.8); bx(u - w / 2 - fr - w / 2, y, 0, u - w / 2 - fr - 0.02, y + h, 0.06, SH); bx(u + w / 2 + fr + 0.02, y, 0, u + w / 2 + fr + w / 2, y + h, 0.06, SH); }
}
// Rangée de fenêtres sur une façade entre u0 et u1, n travées, étages ys
export function windowRow(B, o) { const { u0, u1, n, ys } = o; const step = (u1 - u0) / n; ys.forEach(y => { for (let i = 0; i < n; i++) if (!(o.skip && o.skip(i, y))) windowAt(B, Object.assign({}, o, { u: u0 + step * (i + 0.5), y })); }); }
export function door(B, o) {   // porte vitrée à deux vantaux avec auvent facultatif
  const { face, c, sgn = 1, u, y = 0, w = 1.8, h = 2.4, frame = '#3a3e44', canopy = 0 } = o;
  windowAt(B, { face, c, sgn, u, y, w, h, frame, sill: frame, mullion: true, transom: false, depth: 0.1 });
  if (canopy) { const P = (uu, yy, dd) => face === 'X' ? [c + sgn * dd, yy, uu] : [uu, yy, c + sgn * dd]; const a = P(u - w / 2 - 0.5, y + h + 0.25, 0), b = P(u + w / 2 + 0.5, y + h + 0.4, canopy);
    B.box(M.plain('#d9d6cf', 0.6), Math.min(a[0], b[0]), a[1], Math.min(a[2], b[2]), Math.max(a[0], b[0]), b[1], Math.max(a[2], b[2])); }
}
// Toits : à deux pans (faîtage le long de axis), en croupe (4 pans), plat avec acrotère
export function roofGable(B, m, x0, z0, x1, z1, yE, hR, axis = 'x', ov = 0.35, wallMat = null) {
  const X0 = x0 - ov, X1 = x1 + ov, Z0 = z0 - ov, Z1 = z1 + ov, t = 0.18;
  if (axis === 'x') { const zm = (z0 + z1) / 2, yT = yE + hR;
    B.roofPlane(m, [X1, yE, Z1], [X0, yE, Z1], [X0, yT, zm], [X1, yT, zm]); B.roofPlane(m, [X0, yE, Z0], [X1, yE, Z0], [X1, yT, zm], [X0, yT, zm]);
    if (wallMat) { B.tri(wallMat, [x1, yE, z1], [x1, yE, z0], [x1, yT - 0.05, zm]); B.tri(wallMat, [x0, yE, z0], [x0, yE, z1], [x0, yT - 0.05, zm]); }
    const E = M.plain('#e9e5dc', 0.7); B.box(E, X0, yE - t, Z1 - 0.05, X1, yE, Z1 + 0.05); B.box(E, X0, yE - t, Z0 - 0.05, X1, yE, Z0 + 0.05);
    B.box(M.plain('#6d6f70', 0.7), X0, yT - 0.04, zm - 0.12, X1, yT + 0.1, zm + 0.12);   // faîtière
  } else { const xm = (x0 + x1) / 2, yT = yE + hR;
    B.roofPlane(m, [X1, yE, Z0], [X1, yE, Z1], [xm, yT, Z1], [xm, yT, Z0]); B.roofPlane(m, [X0, yE, Z1], [X0, yE, Z0], [xm, yT, Z0], [xm, yT, Z1]);
    if (wallMat) { B.tri(wallMat, [x0, yE, z1], [x1, yE, z1], [xm, yT - 0.05, z1]); B.tri(wallMat, [x1, yE, z0], [x0, yE, z0], [xm, yT - 0.05, z0]); }
    const E = M.plain('#e9e5dc', 0.7); B.box(E, X1 - 0.05, yE - t, Z0, X1 + 0.05, yE, Z1); B.box(E, X0 - 0.05, yE - t, Z0, X0 + 0.05, yE, Z1);
    B.box(M.plain('#6d6f70', 0.7), xm - 0.12, yT - 0.04, Z0, xm + 0.12, yT + 0.1, Z1);
  }
}
export function roofHip(B, m, x0, z0, x1, z1, yE, hR, ov = 0.4) {
  const X0 = x0 - ov, X1 = x1 + ov, Z0 = z0 - ov, Z1 = z1 + ov, yT = yE + hR, w = X1 - X0, d = Z1 - Z0;
  if (w >= d) { const r = d / 2, a = [X0 + r, yT, (Z0 + Z1) / 2], b = [X1 - r, yT, (Z0 + Z1) / 2];
    B.roofPlane(m, [X1, yE, Z1], [X0, yE, Z1], a, b); B.roofPlane(m, [X0, yE, Z0], [X1, yE, Z0], b, a); B.roofTri(m, [X1, yE, Z0], [X1, yE, Z1], b); B.roofTri(m, [X0, yE, Z1], [X0, yE, Z0], a);
    B.box(M.plain('#5f6366', 0.7), a[0], yT - 0.05, a[2] - 0.1, b[0], yT + 0.08, a[2] + 0.1);
  } else { const r = w / 2, a = [(X0 + X1) / 2, yT, Z0 + r], b = [(X0 + X1) / 2, yT, Z1 - r];
    B.roofPlane(m, [X1, yE, Z0], [X1, yE, Z1], b, a); B.roofPlane(m, [X0, yE, Z1], [X0, yE, Z0], a, b); B.roofTri(m, [X1, yE, Z1], [X0, yE, Z1], b); B.roofTri(m, [X0, yE, Z0], [X1, yE, Z0], a);
    B.box(M.plain('#5f6366', 0.7), a[0] - 0.1, yT - 0.05, a[2], a[0] + 0.1, yT + 0.08, b[2]);
  }
  const E = M.plain('#ebe7de', 0.7), t = 0.16; B.box(E, X0, yE - t, Z1 - 0.05, X1, yE, Z1 + 0.05); B.box(E, X1 - 0.05, yE - t, Z0, X1 + 0.05, yE, Z1); B.box(E, X0, yE - t, Z0 - 0.05, X1, yE, Z0 + 0.05); B.box(E, X0 - 0.05, yE - t, Z0, X0 + 0.05, yE, Z1);
}
export function roofFlat(B, x0, z0, x1, z1, y, o = {}) {   // toit-terrasse : membrane, acrotère, édicules techniques
  const cap = M.plain(o.cap || '#d8d4cb', 0.7), p = o.par == null ? 0.5 : o.par, t = 0.25;
  B.box(M.membrane(o.memb || '#8f9293'), x0 + t, y, z0 + t, x1 - t, y + 0.06, z1 - t);
  if (p > 0) { B.box(cap, x0, y, z0, x1, y + p, z0 + t); B.box(cap, x0, y, z1 - t, x1, y + p, z1); B.box(cap, x0, y, z0, x0 + t, y + p, z1); B.box(cap, x1 - t, y, z0, x1, y + p, z1); }
  (o.boxes || []).forEach(b => { const BM = M.plain(b[5] || '#b9bcbd', 0.6, 0.2); B.box(BM, b[0], y, b[1], b[2], y + b[4], b[3]); B.box(M.plain('#8e9192', 0.6, 0.3), b[0] + 0.15, y + b[4], b[1] + 0.15, b[2] - 0.15, y + b[4] + 0.08, b[3] - 0.15); });
}
export function cornice(B, m, x0, z0, x1, z1, y, h = 0.3, d = 0.18) { B.box(m, x0 - d, y, z0 - d, x1 + d, y + h, z1 + d); }
// Arbre : tronc et houppier de sphères déformées, couleurs par sommet (vert désaturé)
export function tree(B, x, z, s = 1, seed = 1, kind = 'feuillu') {
  const R = rng(seed * 977 + 13); B.cyl(M.plain('#5b4636', 0.9), x, 0, z, 0.15 * s, 2.4 * s, 7, { r2: 0.1 * s });
  const n = kind === 'cone' ? 1 : 9, base = new THREE.Color(kind === 'cone' ? '#3d5733' : '#536f39'), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    let g; if (kind === 'cone') { g = new THREE.ConeGeometry(1.4 * s, 4.4 * s, 12, 6); g.translate(x, 4.2 * s, z); }
    else { const r = (i === 0 ? 1.35 : 0.75 + R() * 0.45) * s; g = new THREE.IcosahedronGeometry(r, 3); const a = R() * 6.28, d = i === 0 ? 0 : (0.75 + R() * 0.45) * s; g.translate(x + Math.cos(a) * d, (3.3 + (R() - 0.3) * 1.2) * s + (i === 0 ? 0.3 * s : 0), z + Math.sin(a) * d); }
    g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g);
    const P = g.attributes.position, col = new Float32Array(P.count * 3), ph = R() * 10;
    for (let k = 0; k < P.count; k++) { const nx = P.getX(k), ny = P.getY(k), nz = P.getZ(k), j = (Math.sin(nx * 4.1 + nz * 3.3 + ph) * Math.cos(ny * 3.7 + nx * 2.1) + 0.5 * Math.sin(nz * 9.1 + ny * 7.7)) * 0.11 * s;
      const dx = nx - x, dz = nz - z, dl = Math.hypot(dx, dz) || 1; P.setXYZ(k, nx + dx / dl * j, ny + j, nz + dz / dl * j);
      const l = 0.72 + 0.12 * Math.sin(nx * 11 + nz * 13 + ny * 7) + R() * 0.12 + (ny - 3.4 * s) * 0.07; c.copy(base).multiplyScalar(l); col.set([c.r, c.g, c.b], k * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(P.count * 2), 2));
    B.add(M.leaf(), g);
  }
}
export function bush(B, x, z, r = 0.6, seed = 3) {
  const R = rng(seed); let g = new THREE.IcosahedronGeometry(r, 2); g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g); g.scale(1.3, 0.75, 1.1); g.translate(x, r * 0.6, z);
  const P = g.attributes.position, col = new Float32Array(P.count * 3), c = new THREE.Color();
  for (let k = 0; k < P.count; k++) { const j = Math.sin(P.getX(k) * 13 + P.getZ(k) * 11) * 0.06; P.setY(k, Math.max(0.02, P.getY(k) + j)); c.set('#557838').multiplyScalar(0.75 + R() * 0.3 + (P.getY(k) - r * 0.6) * 0.3); col.set([c.r, c.g, c.b], k * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(P.count * 2), 2)); B.add(M.leaf(), g);
}
export function fence(B, x0, z0, x1, z1, h = 1.6, gap = 0.16, col = '#3d4247') {   // grille à barreaux, lisse haute et basse
  const m = M.plain(col, 0.5, 0.4), L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / gap), dx = (x1 - x0) / L, dz = (z1 - z0) / L;
  for (let i = 0; i <= n; i++) { const x = x0 + dx * i * gap, z = z0 + dz * i * gap; B.box(m, x - 0.025, 0, z - 0.025, x + 0.025, h, z + 0.025); }
  const rail = (y, t) => B.box(m, Math.min(x0, x1) - 0.03, y, Math.min(z0, z1) - 0.03, Math.max(x0, x1) + 0.03, y + t, Math.max(z0, z1) + 0.03);
  rail(0.12, 0.06); rail(h - 0.08, 0.07);
}
export function lowWall(B, x0, z0, x1, z1, h = 0.6, m = null) { m = m || M.stone('#d6ccb8'); B.box(m, Math.min(x0, x1) - 0.12, 0, Math.min(z0, z1) - 0.12, Math.max(x0, x1) + 0.12, h, Math.max(z0, z1) + 0.12); B.box(M.plain('#e4dccb', 0.8), Math.min(x0, x1) - 0.16, h, Math.min(z0, z1) - 0.16, Math.max(x0, x1) + 0.16, h + 0.08, Math.max(z0, z1) + 0.16); }
// Dalle de la parcelle : socle béton fin (flancs visibles), dessus pavé
export function slab(B, W, D, top = null, t = 0.35) {
  B.box(M.plain('#b3afa6', 0.9), 0, -t, 0, W, 0, D); if (top !== false) B.box(top || M.paving('#cfcabd'), 0.02, 0, 0.02, W - 0.02, 0.02, D - 0.02);
}
// Surface au sol (court, pelouse) : fine plaque posée sur la dalle
export function ground(B, m, x0, z0, x1, z1, y = 0.03) { B.box(m, x0, 0, z0, x1, y, z1, { ns: true }); }
export function courtTex(key, wM, dM, kind) {   // revêtement de cour avec marquages (terrain de basket / handball, marelle) : texture propre à la surface
  return canvasTex('court' + key, Math.round(wM * 40), Math.round(dM * 40), (g, w, h) => {
    g.fillStyle = kind === 'sport' ? '#9a6f5e' : '#a3a19b'; g.fillRect(0, 0, w, h); noise(g, w, h, 16, 111);
    g.strokeStyle = 'rgba(245,242,235,.85)'; g.lineWidth = 3;
    if (kind === 'sport') { const m = 14; g.strokeRect(m, m, w - 2 * m, h - 2 * m); g.beginPath(); g.moveTo(w / 2, m); g.lineTo(w / 2, h - m); g.stroke(); g.beginPath(); g.arc(w / 2, h / 2, Math.min(w, h) * 0.12, 0, 7); g.stroke();
      [m, w - m].forEach(x => { g.beginPath(); g.arc(x, h / 2, Math.min(w, h) * 0.28, x < w / 2 ? -1.57 : 1.57, x < w / 2 ? 1.57 : 4.71); g.stroke(); }); }
    else { g.lineWidth = 2.5; for (let i = 0; i < 6; i++) g.strokeRect(w * 0.18 + (i % 2) * 18, h * 0.3 + Math.floor(i / 2) * 18 * (i > 1 ? 1 : 0) + i * 9, 18, 18); }
  }, 1);
}
export function texturedGround(B, tex, x0, z0, x1, z1, y = 0.035) {   // surface texturée en entier sur le rectangle (UV 0..1)
  const m = mat('tg' + tex.uuid, { map: tex, roughness: 0.9, uvMode: 'own' }); B.quad(m, [x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], [[0, 0], [1, 0], [1, 1], [0, 1]]);
}
export function flag(B, x, z, h = 6, cols = ['#2f4a86', '#f1efe9', '#b8393f']) {   // mât et drapeau à trois bandes verticales (sans emblème)
  B.cyl(M.plain('#d9dadb', 0.4, 0.6), x, 0, z, 0.05, h, 8); const w = 1.4, fh = 0.95; cols.forEach((c, i) => B.box(M.plain(c, 0.8), x + 0.06 + i * w / 3, h - fh, z - 0.02, x + 0.06 + (i + 1) * w / 3, h - 0.05, z + 0.02));
}
export function bench(B, x, z, axis = 'x') { const m = M.wood('#8a6a4a'), f = M.plain('#3d4247', 0.5, 0.4); if (axis === 'x') { B.box(m, x - 0.8, 0.42, z - 0.2, x + 0.8, 0.48, z + 0.2); B.box(f, x - 0.7, 0, z - 0.15, x - 0.62, 0.42, z + 0.15); B.box(f, x + 0.62, 0, z - 0.15, x + 0.7, 0.42, z + 0.15); } else { B.box(m, x - 0.2, 0.42, z - 0.8, x + 0.2, 0.48, z + 0.8); B.box(f, x - 0.15, 0, z - 0.7, x + 0.15, 0.42, z - 0.62); B.box(f, x - 0.15, 0, z + 0.62, x + 0.15, 0.42, z + 0.7); } }

// ---------- rendu ----------
export async function renderSprite(spec, opts = {}) {
  const SS = opts.ss || 2, [cw, cd] = spec.cases, W = cw * CASE, D = cd * CASE;
  const scene = new THREE.Scene(); const B = new Builder(spec.seed || 1); spec.build(B, { W, D }); B.build(scene);
  // lumière : soleil haut-gauche (flanc avant-gauche +Z clair, avant-droit +X à l'ombre), ciel et sol diffus
  const sunDir = new THREE.Vector3(...(opts.sun || [-0.42, 0.80, 0.52])).normalize();
  scene.add(new THREE.HemisphereLight(0xdfe8f2, 0x8a8174, opts.hemi || 1.0));
  const sun = new THREE.DirectionalLight(0xfff3e2, opts.sunI || 3.0); const c0 = new THREE.Vector3(W / 2, 0, D / 2); sun.position.copy(c0).addScaledVector(sunDir, 120); sun.target.position.copy(c0); scene.add(sun, sun.target);
  sun.castShadow = true; const r = Math.max(W, D) * 0.9 + 10; Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 300 }); sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2.5;
  const fill = new THREE.DirectionalLight(0xe8eef7, opts.fill || 0.45); fill.position.set(W / 2 + 60, 40, D / 2 - 10); scene.add(fill);   // contre-jour doux sur le flanc droit
  // caméra : azimut 45°, élévation 30° (losange 2:1)
  const el = Math.PI / 6, dir = new THREE.Vector3(Math.cos(el) * Math.SQRT1_2, Math.sin(el), Math.cos(el) * Math.SQRT1_2);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000); cam.position.copy(c0).addScaledVector(dir, 300); cam.up.set(0, 1, 0); cam.lookAt(c0); cam.updateMatrixWorld();
  // cadrage : la dalle (coins au sol) donne la largeur du losange = PX_CASE × (cw + cd) / 2 ; hauteur : boîte englobante de la scène
  const toCam = p => p.clone().applyMatrix4(cam.matrixWorldInverse);
  const slabPts = [[0, 0, 0], [W, 0, 0], [W, 0, D], [0, 0, D]].map(p => toCam(new THREE.Vector3(...p)));
  const xs = slabPts.map(p => p.x), xMin = Math.min(...xs), xMax = Math.max(...xs), diaPx = PX_CASE * (cw + cd) / 2, ppm = diaPx / (xMax - xMin), margin = 6;
  const bb = new THREE.Box3().setFromObject(scene); let yMax = -1e9, yMin = 1e9;
  for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) { const q = toCam(new THREE.Vector3(x, y, z)); yMax = Math.max(yMax, q.y); yMin = Math.min(yMin, q.y); }
  const slabBot = Math.min(...[[0, -0.4, 0], [W, -0.4, 0], [W, -0.4, D], [0, -0.4, D]].map(p => toCam(new THREE.Vector3(...p)).y));
  yMin = Math.max(yMin, slabBot) ; const outW = Math.round(diaPx + 2 * margin), outH = Math.round((yMax - yMin) * ppm + 2 * margin);
  const halfW = outW / 2 / ppm, cx = (xMin + xMax) / 2; cam.left = cx - halfW; cam.right = cx + halfW; cam.top = yMax + margin / ppm; cam.bottom = cam.top - outH / ppm; cam.updateProjectionMatrix();
  // rendu : beauté (alpha) puis occlusion ambiante (GTAO), en sur-échantillonnage SS
  const rw = outW * SS, rh = outH * SS, cv = document.createElement('canvas'); cv.width = rw; cv.height = rh;
  const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: false });
  R.setSize(rw, rh, false); R.setClearColor(0x000000, 0); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = opts.exposure || 1.0; R.outputColorSpace = THREE.SRGBColorSpace;
  const read = () => { const g2 = document.createElement('canvas'); g2.width = rw; g2.height = rh; const x = g2.getContext('2d'); x.drawImage(cv, 0, 0); return x.getImageData(0, 0, rw, rh); };
  let ao = null;
  if (opts.ao !== false) {
    const comp = new EffectComposer(R); comp.setSize(rw, rh); comp.addPass(new RenderPass(scene, cam)); const gt = new GTAOPass(scene, cam, rw, rh); gt.output = GTAOPass.OUTPUT.Denoise;
    gt.updateGtaoMaterial({ radius: opts.aoR || 1.2, distanceExponent: 1, thickness: 1.5, scale: 1, samples: 16, distanceFallOff: 1 }); gt.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
    comp.addPass(gt); R.setClearColor(0xffffff, 1); comp.render(); ao = read(); R.setClearColor(0x000000, 0);
  }
  R.render(scene, cam); const beauty = read();
  // composition et réduction SS×SS -> 1 (moyenne pondérée par l'alpha), AO adouci
  const out = new ImageData(outW, outH), A = beauty.data, O = out.data, aoK = opts.aoK == null ? 0.55 : opts.aoK;
  for (let y = 0; y < outH; y++) for (let x = 0; x < outW; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) { const k = ((y * SS + j) * rw + x * SS + i) * 4, al = A[k + 3] / 255; let f = 1; if (ao) f = 1 - aoK * (1 - ao.data[k] / 255); r += A[k] * al * f; g += A[k + 1] * al * f; b += A[k + 2] * al * f; a += al; }
    const k = (y * outW + x) * 4; if (a > 0) { O[k] = r / a; O[k + 1] = g / a; O[k + 2] = b / a; } O[k + 3] = Math.round(a / (SS * SS) * 255);
  }
  const fc = document.createElement('canvas'); fc.width = outW; fc.height = outH; fc.getContext('2d').putImageData(out, 0, 0);
  // métadonnées : bandeaux d'enseigne (centre, largeur horizontale, hauteur) en px de l'image, losange de la dalle
  const toPx = p => { const q = toCam(new THREE.Vector3(...p)); return [(q.x - cam.left) * ppm, (cam.top - q.y) * ppm]; };
  const signs = B.signs.map(s => { const [a, b] = s.p, pts = []; for (const x of [a[0], b[0]]) for (const y of [a[1], b[1]]) for (const z of [a[2], b[2]]) pts.push(toPx([x, y, z]));
    const xs2 = pts.map(p => p[0]), ys2 = pts.map(p => p[1]), c = toPx([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]); const h = Math.abs(toPx([a[0], a[1], a[2]])[1] - toPx([a[0], b[1], a[2]])[1]);
    return { face: s.face, cx: +c[0].toFixed(1), cy: +c[1].toFixed(1), w: +(Math.max(...xs2) - Math.min(...xs2)).toFixed(1), h: +h.toFixed(1) }; });
  const dia = [[0, 0, 0], [W, 0, 0], [W, 0, D], [0, 0, D]].map(toPx).map(p => p.map(v => +v.toFixed(1)));
  R.dispose(); return { png: fc.toDataURL('image/png'), w: outW, h: outH, signs, dia };
}
