// Audit visuel automatisé (passe 55) : chaque élément affiché sur la carte est rendu seul dans un canevas instrumenté
// (méthodes du contexte 2D enveloppées) pour savoir s'il est dessiné par un sprite HD (assets/phase2_hd, factory_hd, city_hd, hq, sprite HD dérivé)
// ou par l'atlas Kenney basse définition, ou par du dessin vectoriel/procédural de repli.
// Mesures par élément : appels drawImage par source, opérations vectorielles, part des pixels peints sans les images (part procédurale),
// grands disques (arc/ellipse de rayon >= 25 px) et losanges répétés (petits quadrilatères pleins de même couleur) = le repli « disque/losange » à bannir.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/audit_visuel.js [dossier des planches]
//   écrit wall-street-empire/docs/AUDIT_VISUEL.md et, si un dossier est donné, une planche PNG par famille.
// Module : require('./audit_visuel.js').audit(page, { sheets }) renvoie { rows, sheets } (utilisé par tests/t55_audit_visuel.js).
const fs = require('fs'), path = require('path');

const PAGE = async (o) => {
  const W = window.WSE, G = W.gfx, S = W.S, N = W.N, now = 1000;
  const rows = [], thumbs = {};
  const ATL = G.ATLAS;
  const srcKind = s => s instanceof HTMLCanvasElement ? (s._hd ? 'hd' : 'cache') : s === ATL ? 'atlas' : ((s.naturalWidth || s.width) >= 24 ? 'hd' : 'img');
  function inst(g, noImg) {
    const st = { hd: 0, atlas: 0, cache: 0, img: 0, ops: 0, text: 0, disc: 0, diam: {}, names: {} };
    const P = CanvasRenderingContext2D.prototype; let pm = 0, pl = 0, bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9, arcBig = false;
    const pt = (x, y) => { const m = g.getTransform(), X = m.a * x + m.c * y + m.e, Y = m.b * x + m.d * y + m.f; bx0 = Math.min(bx0, X); by0 = Math.min(by0, Y); bx1 = Math.max(bx1, X); by1 = Math.max(by1, Y); };
    const sc = () => { const m = g.getTransform(); return Math.hypot(m.a, m.b); };
    g.beginPath = function () { pm = pl = 0; bx0 = by0 = 1e9; bx1 = by1 = -1e9; arcBig = false; return P.beginPath.call(this); };
    g.moveTo = function (x, y) { pm++; pt(x, y); return P.moveTo.call(this, x, y); };
    g.lineTo = function (x, y) { pl++; pt(x, y); return P.lineTo.call(this, x, y); };
    g.arc = function (x, y, r, ...a) { if (r / (o.scale || 1) * sc() >= 25) arcBig = true; pl += 9; return P.arc.call(this, x, y, r, ...a); };
    g.ellipse = function (x, y, rx, ry, ...a) { if (Math.max(rx, ry) / (o.scale || 1) * sc() >= 25) arcBig = true; pl += 9; return P.ellipse.call(this, x, y, rx, ry, ...a); };
    g.fill = function (...a) { st.ops++; if (arcBig && typeof this.fillStyle === 'string') st.disc++;   /* un halo en dégradé n'est pas un « disque » */ const w = (bx1 - bx0) / sc() * (o.scale || 1), h = (by1 - by0) / sc() * (o.scale || 1); if (pm === 1 && pl === 3 && w > 0 && w <= 20 && h <= 14) { const k = String(this.fillStyle); st.diam[k] = (st.diam[k] || 0) + 1; } return P.fill.apply(this, a); };
    g.stroke = function (...a) { st.ops++; return P.stroke.apply(this, a); };
    g.fillRect = function (...a) { st.ops++; return P.fillRect.apply(this, a); };
    g.strokeRect = function (...a) { st.ops++; return P.strokeRect.apply(this, a); };
    g.fillText = function (...a) { st.text++; return P.fillText.apply(this, a); };
    g.drawImage = function (s, ...a) { const k = srcKind(s); st[k]++; if (k === 'hd' && s._hd) st.names['dérivé:' + s._hd] = 1; if (noImg) return; return P.drawImage.call(this, s, ...a); };
    return st;
  }
  const SZ = 240;
  function render(fn, wc, noImg, fit) {   // wc = point monde au centre ; fit = taille monde visible
    const c = document.createElement('canvas'); c.width = c.height = SZ; const g = c.getContext('2d'), k = SZ / (fit || 300);
    o.scale = k; const st = inst(g, noImg); g.setTransform(k, 0, 0, k, SZ / 2 - wc.x * k, SZ * 0.62 - wc.y * k);
    let err = null; window.__g = g; try { G.use(g, fn); } catch (e) { err = (e && e.message) || String(e); }
    g.setTransform(1, 0, 0, 1, 0, 0); const d = g.getImageData(0, 0, SZ, SZ).data; let cov = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) cov++;
    return { c, st, err, cov, d };
  }
  function probe(fam, id, label, fn, wc, fit, extra) {
    const A = render(fn, wc, false, fit), B = render(fn, wc, true, fit), s = A.st;
    const diamRep = Object.values(s.diam).reduce((m, v) => Math.max(m, v), 0);
    let vis = 0; for (let i = 0; i < A.d.length; i += 4) if (A.d[i + 3] > 8 && B.d[i + 3] > 8 && Math.abs(A.d[i] - B.d[i]) + Math.abs(A.d[i + 1] - B.d[i + 1]) + Math.abs(A.d[i + 2] - B.d[i + 2]) < 12) vis++;
    const share = A.cov ? Math.min(1, vis / A.cov) : 0;   // part code = pixels finaux identiques au rendu sans images (le code visible, pas ce que le sprite recouvre)
    let mode = A.err ? 'erreur' : !A.cov ? 'invisible' : s.hd > 0 ? (share < 0.2 ? 'HD' : 'HD + code') : s.atlas > 0 ? 'atlas Kenney' : s.cache > 0 ? 'cache' : 'procédural';
    const r = { fam, id, label, mode, hd: s.hd, atlas: s.atlas, ops: s.ops, text: s.text, share: +share.toFixed(2), disc: s.disc, diamRep, derived: Object.keys(s.names).join(','), err: A.err, cov: A.cov, ...(extra || {}) };
    rows.push(r); (thumbs[fam] = thumbs[fam] || []).push([A.c, label + ' · ' + mode]);
    return r;
  }
  // 1. Bâtiments du joueur (TYPES)
  const X0 = 40, Y0 = 40;
  const skip = { road: 1, part: 1, npc: 1 };   // npc : bâtiments de la ville, audités plus bas
  Object.keys(W.TYPES).forEach(k => {
    if (skip[k]) return; const T = W.TYPES[k];
    let a; try { a = G.mkCell(k, 0.37); } catch (e) { rows.push({ fam: 'Bâtiments', id: k, label: T.name, mode: 'erreur', err: e.message }); return; }
    a.x = X0; a.y = Y0; a.born = null; a.conn = true; a.lvl = 0;
    const q = G.iso(X0 + a.w / 2, Y0 + a.h / 2), fit = 300 * Math.max(1, (a.w + a.h) / 2.2);
    probe('Bâtiments', k, T.name, () => { for (let s = 0; s <= a.w + a.h - 2; s++) for (let ox = 0; ox < a.w; ox++) { const oy = s - ox; if (oy < 0 || oy >= a.h) continue; G.tile(a, X0 + ox, Y0 + oy, ox, oy, { now }); } G.overlay(a, { now }); }, { x: q.x, y: q.y - 40 * Math.max(1, (a.w + a.h) / 2) }, fit, { w: a.w, h: a.h, hasP2: !!(W.p2.type[k] || W.p2.ext[k]), proc: !!G.PROC_IND[k], spec: !!G.SPEC_T[k] });
  });
  // 2. Bâtiments de la ville (PNJ) : un échantillon par sorte
  { const seen = {}; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (!c || c.t !== 'npc' || c.x + c.y * N !== i) continue;
      const fl = c.k === 'house' ? '' : c.floors <= 3 ? 'bas' : c.floors <= 8 ? 'moyen' : c.floors <= 30 ? 'tour' : 'gratte-ciel';
      if (c.m === 'mall' || c.m === 'air') continue;
      const key = c.k + (c.m ? ':' + c.m : '') + (c.lm ? ':repère' : '') + (fl ? ':' + fl : ''); if (seen[key] >= (c.k === 'res' || c.k === 'off' || c.k === 'house' ? 3 : 1)) continue; seen[key] = (seen[key] || 0) + 1;
      const w = c.w || 1, h = c.h || 1, q = G.iso(c.x + w / 2, c.y + h / 2), big = Math.max(1, (w + h) / 2.2);
      probe('Ville (PNJ)', key + '#' + seen[key], key, () => { for (let s = 0; s <= w + h - 2; s++) for (let ox = 0; ox < w; ox++) { const oy = s - ox; if (oy < 0 || oy >= h) continue; G.tile(c, c.x + ox, c.y + oy, ox, oy, { now }); } }, { x: q.x, y: q.y - (c.floors > 8 ? 160 : 50) * big }, (c.floors > 8 ? 520 : 300) * big);
  } }
  // grands équipements dessinés une fois depuis leur case avant (mall 10×10, aéroport) : toutes leurs cases, dans l'ordre de profondeur
  ['mall', 'air'].forEach(m => { const L = []; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.m === m) L.push(c); } if (!L.length) return;
    L.sort((a, b) => a.x + a.y - b.x - b.y); const xs = L.map(c => c.x), ys = L.map(c => c.y), q = G.iso((Math.min(...xs) + Math.max(...xs) + 1) / 2, (Math.min(...ys) + Math.max(...ys) + 1) / 2), n = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) + 1;
    probe('Ville (PNJ)', 'mon:' + m, m === 'mall' ? 'grand mall' : 'aéroport', () => L.forEach(c => G.tile(c, c.x, c.y, 0, 0, { now })), { x: q.x, y: q.y - 20 * n }, 150 * n); });
  // 3. Gisements et zones
  const CROPK = { wheat: 1, sugar: 1, cotton: 1, rubber: 1, grapes: 1, corn: 1, rapeseed: 1 }, LIVE = { milk: 1, egg: 1, pork: 1, wool: 1 };
  const kinds = Object.keys(W.DEPOSITS).filter(k => !LIVE[k]).concat(['chrome', 'sulfur', 'rare']);
  kinds.forEach(k => {
    const res = (W.DEPOSITS[k] || W.DEPOSITS.copper).res, x = 30, y = 70, p = G.iso(x, y), d = { k, r: res };
    const fam = CROPK[k] ? 'Zones fertiles' : k === 'wood' ? 'Forêts' : 'Gisements';
    probe(fam, k, (W.DEPOSITS[k] || { name: k }).name, () => CROPK[k] ? G.field(p, d, x, y) : k === 'wood' ? G.forest(p, x, y, d) : G.dep(p, d, now, x, y), { x: p.x, y: p.y + 20 }, 300);
    if (!CROPK[k] && k !== 'wood') probe('Gisements (repli sans sprite)', k + ':repli', (W.DEPOSITS[k] || { name: k }).name + ' (repli)', () => G.depProc(k, p.x, p.y + 33, x, y), { x: p.x, y: p.y + 20 }, 300);
  });
  // 4. Sol, eau, rivage, routes
  { const seen = {}; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const n = G.gtKind(x, y)[0], key = n.replace(/_[a-d]$/, n.startsWith('route_') ? '' : '').replace(/^(herbe|terre|sol_quai_beton)_[ab-d]$/, '$1'); if (seen[n]) continue; seen[n] = 1;
      const p = G.iso(x, y); probe(n.startsWith('route_') ? 'Routes' : 'Sol et eau', n, n, () => G.gtTile(window.__g || null, x, y, 1, false), { x: p.x, y: p.y + 33 }, 220); } }
  // 5. Décor, véhicules, navires, animaux, personnages
  { const p = G.iso(20, 80);
    probe('Décor', 'arbre_isole', 'arbre isolé', () => G.tree(p, 20, 80, { dx: 0, dy: 0 }), { x: p.x, y: p.y }, 220);
    [[3, 5], [4, 4]].forEach((c, i) => probe('Décor', 'rochers_' + i, 'rochers', () => G.rock(G.iso(c[0], c[1]), c[0], c[1]), G.iso(c[0], c[1] + 0.5), 200));
    let qc = null; for (let i = 0; i < N * N && !qc; i++) if (W.ZONE[i] === 4 && !S.grid[i]) qc = [i % N, (i / N) | 0];
    if (qc) probe('Décor', 'quai', 'décor de quai', () => G.quay(G.iso(qc[0], qc[1]), qc[0], qc[1], now), G.iso(qc[0], qc[1] + 0.5), 300);
    probe('Décor', 'conteneurs', 'conteneurs', () => G.containers(p, 7, false), { x: p.x, y: p.y + 10 }, 240);
    probe('Décor', 'grue', 'grue portique', () => G.crane(p.x, p.y + 40, 3, now), { x: p.x, y: p.y - 20 }, 300);
    probe('Véhicules', 'navire', 'porte-conteneurs', () => G.ship(p.x, p.y + 45, 1), { x: p.x, y: p.y }, 420);
    G.VV_CARS.forEach((m, i) => { const c = { x: 20, y: 80, nx: 21, ny: 80, t: 0.5, m: 'Red-Sedan1', hv: i }; probe('Véhicules', m[0], m[0], () => G.car(c), { x: p.x + 33, y: p.y + 40 }, 140); });
    const seenA = {}; Object.values(G.VV_FARM).forEach(L => L.forEach(it => { if (!it || seenA[it[0]]) return; seenA[it[0]] = 1; probe(/^animal/.test(it[0]) ? 'Animaux' : /fermier|vendang|vigneron/.test(it[0]) ? 'Personnages' : 'Décor', it[0], it[0], () => G.spr(it[0], p.x, p.y, it[1] * 3, false), { x: p.x, y: p.y - 20 }, 120); }));
  }
  // planches
  const sheets = {};
  if (o.sheets) Object.keys(thumbs).forEach(f => { const L = thumbs[f], C = 6, R = Math.ceil(L.length / C), cv = document.createElement('canvas'); cv.width = C * SZ; cv.height = R * (SZ + 18); const g = cv.getContext('2d');
    g.fillStyle = '#7e9664'; g.fillRect(0, 0, cv.width, cv.height); L.forEach(([c, t], i) => { const x = (i % C) * SZ, y = Math.floor(i / C) * (SZ + 18); g.drawImage(c, x, y); g.fillStyle = '#10141c'; g.fillRect(x, y + SZ, SZ, 18); g.fillStyle = /procédural|atlas|erreur/.test(t) ? '#ffb0a0' : '#e8ecf0'; g.font = '11px sans-serif'; g.fillText(t.slice(0, 40), x + 4, y + SZ + 13); });
    sheets[f] = cv.toDataURL('image/png'); });
  const fac = Object.keys(G.FAC_IMG || {}).map(n => [n, !!(G.FAC_IMG[n] && G.FAC_IMG[n].ok)]);
  return { rows, sheets, fac, nan: rows.filter(r => Object.values(r).some(v => typeof v === 'number' && !isFinite(v))).length };
};

async function audit(pg, o = {}) {
  await pg.evaluate(() => { window.__g = null; });
  return pg.evaluate(PAGE, { sheets: !!o.sheets });
}
module.exports = { audit, PAGE };

// --- rapport ---
const ACTION = {
  'HD': 'aucune', 'HD + code': 'vérifier les détails dessinés en code (effets, enseigne, chemins) — sobres',
  'atlas Kenney': 'remplacer par un sprite HD (ou repli sobre)', 'procédural': 'repli procédural : sobre exigé, sprite à commander', 'erreur': 'corriger', 'invisible': 'rien de dessiné à cet endroit (réseau ou rendu ailleurs)', 'cache': 'image cuite (sol ou enseigne)'
};
const NOTE = {   // décisions de l'audit (passe 55)
  gravel: 'sprite HD dérivé (gisement_bauxite recoloré gris) — était disque + losanges', sand: 'sprite HD dérivé (gisement_bauxite recoloré sable) — était disque + losanges', limestone: 'sprite HD dérivé (gisement_potasse recoloré calcaire) — était disque + losanges',
  sulfur: 'ancien gisement converti au chargement ; sprite HD dérivé (gisement_zinc recoloré soufre)', rare: 'ancien gisement converti au chargement ; sprite HD dérivé (gisement_graphite recoloré)',
  corn: 'parcelle HD (champ_ble_vert recoloré maïs) — était aplat + traits', rapeseed: 'parcelle HD (champ_ble_mur recoloré colza)', sugar: 'parcelle HD dérivée', cotton: 'parcelle HD dérivée', rubber: 'parcelle HD dérivée', grapes: 'parcelle HD dérivée',
  'mon:fire': 'composition iso sobre (brique patinée) — commande Cowork 55-2', 'mon:police': 'composition iso sobre (pierre grise) — commande Cowork 55-3', 'mon:air': 'composition procédurale (passe 49) — commande Cowork 55-4', 'mon:telecom': 'reprend la station média HD (station_tv)', 'mon:mall': 'sprite HD + parvis animé en code (passe 45)',
  sbrico: 'composition primitives (drawSpecShop) — sprite brico_outillage commandé (n°9, rappel 55-7)', oil: 'sprite HD + geyser animé', iron: 'sprite HD + éclat animé', gold: 'sprite HD + scintillement',
  crush: 'reprend la carrière HD — commande Cowork 55-1 (concasseur)', pylon: 'composition iso sobre (pylône HD)', cable: 'réseau (ligne tracée)', pipeline: 'réseau (conduite tracée)'
};
if (require.main === module) {
  (async () => {
    const { chromium } = require('playwright');
    const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1280, height: 900 } }); const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('file://' + path.resolve(__dirname, '..', 'city.html')); await pg.waitForTimeout(2500);
    await pg.evaluate(() => { const W = window.WSE; W.setSpeed(0); W.setCaste('industriel'); });
    const out = process.argv[2]; const r = await audit(pg, { sheets: !!out });
    if (out) { fs.mkdirSync(out, { recursive: true }); Object.entries(r.sheets).forEach(([f, d]) => fs.writeFileSync(path.join(out, 'audit_' + f.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w]+/g, '_').toLowerCase() + '.png'), Buffer.from(d.split(',')[1], 'base64'))); }
    const fams = [...new Set(r.rows.map(x => x.fam))];
    const cnt = {}; r.rows.forEach(x => { cnt[x.mode] = (cnt[x.mode] || 0) + 1; });
    let md = `# Audit visuel de la carte (passe 55)\n\nGénéré par \`tools/audit_visuel.js\` : chaque élément est rendu seul dans un canevas instrumenté ; on compte les images HD (sprites \`assets/phase2_hd\`, \`factory_hd\`, \`city_hd\`, \`hq\`, sprites HD dérivés par recoloration), l'atlas Kenney basse définition et les opérations vectorielles. « Part code » = pixels de l'image finale identiques au rendu sans images (le dessin en code réellement visible) / pixels peints. « Disque/losanges » = grands disques (rayon ≥ 25 px) ou petits losanges pleins répétés (≥ 4 de même couleur) : le repli générique banni.\n\n`;
    md += `Bilan : ${r.rows.length} éléments — ` + Object.entries(cnt).map(([k, v]) => `${k} ${v}`).join(' · ') + `. Valeurs non finies : ${r.nan}. Erreurs de page : ${errs.length}.\n\n`;
    md += `## Corrections de la passe 55\n\n- **Gisements** : la branche générique de \`drawDeposit\` (grand disque clair + 5 losanges blancs, sur gravier, sable, calcaire et tout gisement sans sprite) est supprimée. Gravier, sable, calcaire, soufre et terres rares ont un sprite HD dérivé (\`P2_RECOL\` : \`gisement_bauxite\`, \`gisement_potasse\`, \`gisement_zinc\`, \`gisement_graphite\` dont la luminance est remappée sur 3 teintes sobres) : même dalle, même éclairage, même emprise que les 17 autres. Sans sprite du tout, repli \`depProc\` : terre aux contours bruités fondue dans l'herbe + 2-3 tas en volume (flanc éclairé haut-gauche, flanc à l'ombre, ombre portée bas-droite), nappe sombre pour pétrole et gaz.\n- **Terre sous les gisements** : la tache de terre de chaque case de gisement est plus petite (62-78 % au lieu de 85-120 %) et plus légère (opacité 45-70 % modulée par un bruit) : plus de grande tache brune cernée.\n- **Zones fertiles** : maïs, colza, canne, coton, hévéa, vigne en parcelles HD (champ de blé HD recoloré), comme les fermes ; plus d'aplat à traits.\n- **Mines** : plus de bloc Kenney dessiné sous les mines HD. **Centre de concassage** : reprend la carrière HD. **Centre télécom** : reprend la station média HD.\n- **Caserne, commissariat** : palette ramenée à la charte (brique patinée, pierre grise, ardoise ; plus de gyrophare rouge/bleu ni de rouge vif), portes rainurées en traits au lieu de lamelles.\n- **Geyser de pétrole** : flaque de base réduite (plus de grand disque plein).\n- Routes : la part de code (≈ 25 %) est la sous-couche d'asphalte voulue sous les pièces à centre transparent (charte). Mall : parvis, voitures et passants animés dessinés en code par-dessus le sprite HD (passe 45). Aéroport : composition procédurale de la passe 49 (sprite commandé, 55-4).\n\n`;
    md += `Qualité : **bonne** = sprite HD seul ; **correcte** = sprite HD + petits détails animés en code (fumée, scintillement, enseigne) ou dessin vectoriel sobre conforme à la charte ; **basse déf.** = atlas Kenney ; **à refaire** = repli disque/losanges.\n\n`;
    fams.forEach(f => {
      md += `## ${f}\n\n| Élément | Rendu actuel | HD ? | Qualité | Action |\n|---|---|---|---|---|\n`;
      r.rows.filter(x => x.fam === f).forEach(x => {
        const bad = x.disc > 0 || x.diamRep >= 4, hd = x.mode === 'HD' || x.mode === 'HD + code' || x.mode === 'cache';
        const rendu = `${x.mode}${x.derived ? ' (dérivé de ' + x.derived.replace(/dérivé:/g, '') + ')' : ''} · ${x.hd || 0} img HD, ${x.atlas || 0} atlas, ${x.ops || 0} op. code, part code ${Math.round((x.share || 0) * 100)} %${bad ? ' · DISQUE/LOSANGES' : ''}`;
        const q = bad ? 'à refaire' : x.mode === 'HD' || x.mode === 'cache' ? 'bonne' : x.mode === 'atlas Kenney' ? 'basse déf.' : x.mode === 'erreur' ? 'erreur' : 'correcte';
        const key = String(x.id).replace(/:repli$/, '').replace(/(:repère)?(:(bas|moyen|tour|gratte-ciel))?#\d+$/, '');
        const act = /:repli$/.test(x.id) ? 'repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque' : NOTE[key] || ACTION[x.mode] || '';
        md += `| ${x.label} (\`${x.id}\`) | ${rendu} | ${hd ? 'oui' : 'non'} | ${q} | ${act} |\n`;
      });
      md += '\n';
    });
    const facOk = r.fac.filter(x => x[1]).length;
    md += `## Intérieur des usines (vue immersive)\n\nSprites \`FAC\` (factory / factory_hd) chargés : ${facOk} sur ${r.fac.length}. Hors carte : non rendus ici (voir t12, t17).\n\n`;
    md += `## Commandes Cowork en attente\n\nVoir la fin de \`tools/factory_ai/RETOURS.md\` (commandes 55-1 et suivantes). Les éléments concernés gardent en attendant un sprite HD voisin ou un repli procédural sobre.\n`;
    fs.writeFileSync(path.resolve(__dirname, '..', 'docs', 'AUDIT_VISUEL.md'), md);
    console.log(JSON.stringify(cnt), 'nan', r.nan, 'errs', errs.slice(0, 3));
    r.rows.filter(x => x.mode !== 'HD' || x.disc || x.diamRep >= 4).forEach(x => console.log(x.fam, '|', x.id, '|', x.mode, 'hd', x.hd, 'atl', x.atlas, 'ops', x.ops, 'share', x.share, 'disc', x.disc, 'diam', x.diamRep, x.err || ''));
    await b.close();
  })();
}
