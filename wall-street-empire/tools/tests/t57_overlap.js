// Passe 57 : plus aucun chevauchement. (1) Plaques d'enseigne : jamais l'une sur l'autre, jamais sous l'interface (HUD, carte, barre d'outils, messages) ni coupées
// par le bord, détail croissant avec le zoom, plaque du bâtiment survolé toujours affichée. (2) Audit automatisé des sprites (tools/audit_overlap.js) : aucun
// bâtiment ne mord plus de 6 % sur une case voisine ou une route, et le tri de profondeur ne laisse plus un grand bâtiment masquer ses voisins de devant.
exports.name = 'Aucun chevauchement : plaques et sprites (passe 57)';
const SHOTS = process.env.WSE_SHOTS || '/tmp';
const KEYS = ['s3', 'dc', 'stech', 's2', 'hq', 'sauto', 'ssport', 'shome', 's1', 'rd', 'wh', 'smode', 'spharma', 'sbrico'];
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const finite = d => d.every(s => [s.x, s.y, s.w, s.h, s.fs, s.al].every(Number.isFinite) && s.w > 0 && s.h > 0 && s.txt && !/NaN|undefined/.test(s.txt));

exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 2600, w: 1280, h: 720 });
  await pg.evaluate(() => { window.WSE.startMode('free'); }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const w0 = await pg.evaluate(keys => { const W = window.WSE, T = window.T; const placed = {}; keys.forEach(k => { const c = T.inC(k); if (c) placed[k] = [c.x, c.y]; });
    W.setTool('view'); const M = W.mall.pos(); return { placed, M }; }, KEYS);
  t.check('bâtiments du joueur posés en ville pour le test', Object.keys(w0.placed).length >= 10, Object.keys(w0.placed).join(','));
  const close = () => pg.evaluate(() => { ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    [...document.querySelectorAll('button')].filter(b => /Continuer à jouer/.test(b.textContent) && b.offsetParent).forEach(b => b.click()); });
  const view = async (x, y, zz) => { await close(); await pg.evaluate(a => { const W = window.WSE; W.view.setZ(a[2]); W.centerOn(a[0], a[1]); }, [x, y, zz]); await pg.waitForTimeout(380);
    return pg.evaluate(() => { const G = window.WSE.sign; return { d: G.drawn, ui: G.ui, min: G.minImp(), z: window.WSE.view.z, lost: G.lost }; }); };

  // ---- 1. 20 vues (zooms 0,2 à 1,3, ville, magasins, mall, bords de l'interface)
  const P = w0.placed.s3 || [20, 20], M = w0.M, V = [];
  const pts = [[P[0], P[1]], [P[0] + 4, P[1] + 1], [M.x + 1, M.y + 1], [M.x - 6, M.y + 4], [M.x + 5, M.y - 5], [30, 40], [40, 30], [20, 31], [33, 21], [44, 44]];
  const zs = [0.22, 0.3, 0.38, 0.45, 0.55, 0.7, 0.9, 1.1, 1.3, 0.6];
  for (let i = 0; i < 20; i++) V.push([...pts[i % pts.length], zs[(i * 3) % zs.length]]);
  let coll = [], under = [], edge = 0, nan = 0, impBad = 0, tot = 0; const W0 = 1280, H0 = 720;
  for (const [x, y, zz] of V) {
    const r = await view(x, y, zz); tot += r.d.length; if (!finite(r.d)) nan++;
    for (let i = 0; i < r.d.length; i++) for (let j = i + 1; j < r.d.length; j++) if (hit(r.d[i], r.d[j])) coll.push(r.d[i].txt + '/' + r.d[j].txt + '@' + zz);
    r.d.forEach(s => { if (r.ui.some(u => hit(s, { x: u[0], y: u[1], w: u[2] - u[0], h: u[3] - u[1] }))) under.push(s.txt + '@' + zz); if (s.x < 0 || s.y < 0 || s.x + s.w > W0 || s.y + s.h > H0) edge++; if (!s.foc && s.imp < r.min) impBad++; });
  }
  t.check('20 vues : aucune plaque n\'en chevauche une autre (plaques posées comprises)', !coll.length, coll.length ? coll.slice(0, 4).join(' ') : `${tot} plaques`);
  t.check('20 vues : aucune plaque sous l\'interface (HUD, carte, barre du bas, messages) ni coupée par le bord', !under.length && !edge, under.slice(0, 4).join(' ') + (edge ? ` · ${edge} au bord` : ''));
  t.check('aucun NaN dans les plaques', !nan, String(nan));
  t.check('détail croissant avec le zoom : sous 0,3 seulement les repères (importance 3), sous 0,5 importance ≥ 2', !impBad, String(impBad));
  const far = await view(P[0], P[1], 0.24), near = await view(P[0], P[1], 0.8);
  t.check('zoom faible : seuls les grands repères (hypermarché, siège, hôpital, aéroport…) gardent leur plaque', far.d.every(s => s.imp >= 3), far.d.map(s => s.txt).join(', ') || 'aucune');
  t.check('zoom rapproché : plus de détail qu\'au zoom faible', near.d.length >= Math.max(2, far.d.length), `${far.d.length} → ${near.d.length}`);
  const ui = await view(P[0], P[1], 0.6);
  t.check('rectangles d\'interface relevés (HUD, carte, barre d\'outils)', ui.ui.length >= 5 && ui.ui.some(u => u[3] > 600) && ui.ui.some(u => u[1] < 30), `${ui.ui.length} rectangles`);
  await pg.screenshot({ path: SHOTS + '/t57_ville.png' }).catch(() => {});

  // ---- 2. Survol : la plaque d'un petit commerce, masquée au zoom de jeu, s'affiche au premier plan
  const sm = w0.placed.s1 || w0.placed.smode;
  if (sm) {
    await view(sm[0], sm[1], 0.36);
    const q = await pg.evaluate(p => window.WSE.tileToScreen(p[0], p[1]), sm); await pg.mouse.move(q.x, q.y); await pg.waitForTimeout(350);
    const d = await pg.evaluate(() => window.WSE.sign.drawn);
    const f = d.find(s => s.foc);
    t.check('survol d\'un petit commerce au zoom de jeu : sa plaque s\'affiche, lisible, sans chevaucher les autres', !!f && f.fs >= 10 && !d.some(s => s !== f && hit(s, f)), f ? `${f.txt} ${f.fs.toFixed(0)} px` : d.map(s => s.txt).join(', '));
    await pg.mouse.move(5, 360); await pg.waitForTimeout(200);
  }

  // ---- 3. Tri de profondeur dans la vraie ville : un voisin posé devant le flanc d'un 2×2 est dessiné après lui
  const ord = await pg.evaluate(() => { const A = window.WSE.audit, a = { x: 10, y: 10, w: 3, h: 3 }; return { old: A.before(a, 13, 10, 'old'), nw: A.before(a, 13, 10, 'new'), back: A.before(a, 11, 9, 'new') }; });
  t.check('tri de profondeur : le voisin devant le flanc d\'un 3×3 passe après lui (avant : avant lui), celui de derrière reste avant', ord.old && !ord.nw && ord.back, JSON.stringify(ord));

  // ---- 4. Performance
  await view(P[0], P[1], 0.55);
  const perf = await pg.evaluate(async () => { const G = window.WSE.sign, v = [], f = []; let t0 = performance.now(); for (let i = 0; i < 40; i++) { await new Promise(r => requestAnimationFrame(r)); const t1 = performance.now(); f.push(t1 - t0); t0 = t1; v.push(G.ms); } v.sort((a, b) => a - b); f.sort((a, b) => a - b); return { med: v[20], p90: v[36], fr: f[20] }; });
  t.check('performance : enseignes < 1 ms par image (médiane, rectangles d\'interface en cache)', perf.med < 1, `médiane ${perf.med.toFixed(3)} ms · p90 ${perf.p90.toFixed(3)} ms · image ${perf.fr.toFixed(1)} ms`);
  t.check('aucune erreur de page', !pg.errs.length, pg.errs.slice(0, 3).join(' | '));
  await pg.close();

  // ---- 5. Audit des sprites
  const { audit, SEUIL } = require('../audit_overlap.js');
  const t0 = Date.now(), A = await audit(L), rows = A.rows;
  const lat = rows.filter(r => !(r.lat <= SEUIL)), msk = rows.filter(r => !(r.mNew <= SEUIL)), was = rows.filter(r => r.mOld > SEUIL);
  t.check('audit : tous les types de bâtiments rendus (joueur et PNJ, sprites HD et procéduraux)', rows.length >= 100 && rows.some(r => /^pnj/.test(r.type)) && rows.some(r => r.spr === 'vectoriel'), `${rows.length} types · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  t.check(`audit : aucun sprite ne mord plus de ${SEUIL} % sur une case voisine ou une route`, !lat.length, lat.slice(0, 6).map(r => `${r.type} ${r.spr} ${r.lat.toFixed(1)} %`).join(', ') || `pire ${Math.max(...rows.map(r => r.lat)).toFixed(1)} %`);
  t.check(`audit : aucun bâtiment ne masque un voisin posé devant lui (> ${SEUIL} %)`, !msk.length, msk.slice(0, 6).map(r => `${r.type} ${r.mNew.toFixed(1)} %`).join(', ') || `${was.length} types masquaient leurs voisins avec l'ancien ordre, 0 maintenant`);
  t.check('audit : aucune mesure NaN, aucune erreur de page', !rows.some(r => r.nan) && !A.errs.length, A.errs.slice(0, 2).join(' | '));
};
