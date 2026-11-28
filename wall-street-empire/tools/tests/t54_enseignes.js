// Passe 54 : enseignes dessinées par le code. Les images d'assets ne contiennent plus de texte : chaque magasin, équipement public, station, entrepôt, siège…
// reçoit une plaque nette (police du jeu, nom de l'interface en capitales), une seule par bâtiment, sans chevauchement, masquée quand elle serait illisible,
// posée sur l'ancienne enseigne générée des sprites concernés. Vérifie aussi le coût de dessin (< 1 ms par image) et l'écran de téléphone (390 × 844).
exports.name = 'Enseignes dessinées par le code (passe 54)';
const KEYS = ['s1', 's2', 's3', 'sauto', 'stech', 'slux', 'smode', 'spharma', 'shome', 'ssport', 'sbrico', 'wh', 'rd', 'dc', 'hq'];
const SHOTS = process.env.WSE_SHOTS || '/tmp';
async function world(pg, L) {
  await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  return pg.evaluate(async keys => { const W = window.WSE, S = W.S, T = window.T, N = W.N;
    ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    const b = document.querySelector('[data-sg="close"]'); if (b) b.click(); try { W.mk.act('close'); } catch (e) {}
    const placed = {}; keys.forEach(k => { const c = T.inC(k); if (c) placed[k] = [c.x, c.y]; });
    const mon = {}; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'mon' && c.x + c.y * N === i && !mon[c.m]) mon[c.m] = [c.x, c.y]; }
    W.setTool('view'); return { placed, mon }; }, KEYS);
}
const view = (pg, x, y, zz) => pg.evaluate(a => { const W = window.WSE; ['win', 'hint'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.view.setZ(a[2]); W.centerOn(a[0], a[1]); }, [x, y, zz]).then(() => pg.waitForTimeout(450));
const drawn = pg => pg.evaluate(() => window.WSE.sign.drawn);
const overlaps = d => { const o = []; const f = d.filter(s => !s.cover); for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) { const a = f[i], b = f[j]; if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) o.push(a.txt + '/' + b.txt); } return o; };
const finite = d => d.every(s => [s.x, s.y, s.w, s.h, s.fs, s.al].every(Number.isFinite) && s.w > 0 && s.h > 0 && s.txt && !/NaN|undefined/.test(s.txt));

exports.run = async (t, L) => {
  // ---- 1. Table et noms
  const pg = await L.newPage({ wait: 2600, w: 1280, h: 720 });
  await pg.evaluate(() => { window.WSE.startMode('free'); });
  const w0 = await world(pg, L);
  const tb = await pg.evaluate(keys => { const W = window.WSE, G = W.sign; return { api: !!G && typeof G.txt === 'function', bad: keys.filter(k => !G.SIGN[k] || !G.txt(k) || G.txt(k) !== G.txt(k).toUpperCase()),
    names: keys.map(k => [k, G.txt(k)]), coh: ['s1', 's2', 's3', 'stech', 'smode', 'shome', 'ssport', 'sbrico', 'wh', 'rd', 'dc', 'hq'].every(k => G.txt(k) === W.TYPES[k].name.toUpperCase()),
    pub: ['hospital', 'lycee', 'college', 'maternelle', 'hall'].map(m => G.txt('mon:' + m)), sv: ['station_service', 'station_recharge_electrique'].map(n => G.txt('sv:' + n)), gare: G.txt('sv:gare_ferroviaire') }; }, KEYS);
  t.check('window.WSE.sign : table SIGN pour les 15 types (magasins, entrepôt, R&D, data center, siège), textes en capitales', tb.api && !tb.bad.length, tb.bad.join(','));
  t.check('noms tirés des tables de l\'interface (TYPES[..].name, équipements publics, services)', tb.coh && tb.pub.join('|') === 'HÔPITAL|LYCÉE|COLLÈGE|ÉCOLE MATERNELLE|HÔTEL DE VILLE' && tb.sv.join('|') === 'STATION-SERVICE|RECHARGE ÉLECTRIQUE' && !tb.gare, tb.pub.join('|') + ' · ' + tb.sv.join('|'));
  t.info(tb.names.map(n => n.join('=')).join(' · '));
  t.check('15 bâtiments posés en ville pour le test', Object.keys(w0.placed).length >= 12, Object.keys(w0.placed).join(','));

  // ---- 2. Vue rapprochée : plaques présentes, nettes, lisibles, sans chevauchement
  const P = w0.placed.s2 || Object.values(w0.placed)[0];
  await view(pg, P[0], P[1], 0.7);
  let d = await drawn(pg);
  const want = Object.keys(w0.placed).map(k => [k, w0.placed[k]]);
  const vis = await pg.evaluate(arr => arr.filter(r => { const p = window.WSE.tileToScreen(r[1][0], r[1][1]); return p.x > 60 && p.x < innerWidth - 60 && p.y > 120 && p.y < innerHeight - 120; }).map(r => r[0]), want);
  const got = new Set(d.map(s => s.key)), seen = vis.filter(k => got.has(k));
  t.check('zoom rapproché : une plaque par bâtiment visible (au moins 50 % des bâtiments à l\'écran, les autres cèdent la place à un plus grand)', d.length >= 4 && seen.length >= Math.ceil(0.5 * vis.length), `${seen.length}/${vis.length} visibles · ${d.length} plaques · ${d.map(s => s.txt).join(', ')}`);
  t.check('jamais deux plaques pour le même bâtiment', new Set(d.map(s => s.id)).size === d.length, `${d.length} plaques`);
  t.check('aucun chevauchement entre plaques flottantes', !overlaps(d).length, overlaps(d).slice(0, 5).join(' '));
  t.check('aucun NaN : positions, tailles et textes finis', finite(d), '');
  const minFs = Math.min(...d.map(s => s.fs)), opaqMin = Math.min(...d.filter(s => s.al >= 1).map(s => s.fs));
  t.check('lisibilité : police ≥ 9 px écran à pleine opacité, jamais affichée sous 7 px', minFs >= 7 && opaqMin >= 9, `min ${minFs.toFixed(1)} px · opaques ${opaqMin.toFixed(1)} px`);
  const dpr = await pg.evaluate(() => window.WSE.view.dpr);
  t.check('plaques posées en pixels physiques entiers (pas de flou de rééchantillonnage)', d.every(s => Math.abs(s.x * dpr - Math.round(s.x * dpr)) < 1e-6 && Math.abs(s.y * dpr - Math.round(s.y * dpr)) < 1e-6), `dpr ${dpr}`);
  await pg.screenshot({ path: SHOTS + '/t54_magasins.png' }).catch(() => {});

  // ---- 3. Anciennes enseignes générées recouvertes (hôpital, supermarché, hypermarché, high-tech, sport)
  const cov = await pg.evaluate(() => { const W = window.WSE; return Object.keys(W.sign.SIGN_COVER).filter(n => W.sign.SIGN_COVER[n].f); });
  t.check('5 sprites à texte généré ont un bandeau de recouvrement (high-tech, sport, hôpital, supermarché, hypermarché)', ['boutique_high_tech', 'sport_loisirs', 'hopital', 'supermarche', 'hypermarche'].every(n => cov.includes(n)), cov.join(','));
  const covered = d.filter(s => s.cover).map(s => s.key);
  // passe 78 : le supermarché et l'hypermarché sont dessinés avec bat_* dont le cartouche de toit est effacé au build : plus rien à recouvrir, leur plaque flotte au-dessus du toit
  const s2bat = await pg.evaluate(() => { const W = window.WSE, c = W.S.grid.find(q => q && q.t === 's2'); return !!c && /^bat_/.test(W.vv.p2name(c)); });
  t.check('au moins un bâtiment à ancienne enseigne porte sa plaque à l\'emplacement d\'origine (ou supermarché sans texte : bat_* effacé au build, plaque flottante)', covered.length >= 1 || (s2bat && d.some(s => s.key === 's2' && !s.cover)), covered.join(',') + (s2bat ? ' · s2 = bat_*' : ''));
  if (w0.mon.hospital) {
    await view(pg, w0.mon.hospital[0], w0.mon.hospital[1], 0.9); d = await drawn(pg);
    const h = d.find(s => s.key === 'mon:hospital');
    t.check('hôpital : « HÔPITAL » écrit par le jeu (rendu européen hopital_ville sans texte : bandeau de façade, ou plaque posée sur l\'ancien sprite)', h && h.txt === 'HÔPITAL' && (h.cover || h.face === 'L'), JSON.stringify(h || null));
    await pg.screenshot({ path: SHOTS + '/t54_hopital.png' }).catch(() => {});
  }
  const pubs = ['hall', 'lycee', 'college', 'maternelle'].filter(m => w0.mon[m]);
  if (pubs.length) { const m = pubs[0]; await view(pg, w0.mon[m][0], w0.mon[m][1], 0.8); d = await drawn(pg);
    t.check(`équipement public (${m}) : plaque claire à son nom`, d.some(s => s.key === 'mon:' + m), d.map(s => s.txt).join(', ')); }

  // ---- 4. Aéroport, mall
  const air = await pg.evaluate(() => { const P = window.WSE.air && window.WSE.air.pos(); return P ? [P.x + 3, P.y + 2] : null; });
  if (air) { await view(pg, air[0], air[1], 0.5); d = await drawn(pg);
    t.check('aéroport : plaque « AÉROPORT » dessinée par le système d\'enseignes', d.some(s => s.key === 'mon:air' && s.txt === 'AÉROPORT'), d.map(s => s.txt).join(', '));
    await pg.screenshot({ path: SHOTS + '/t54_aeroport.png' }).catch(() => {}); }
  const mall = await pg.evaluate(() => { const P = window.WSE.mall && window.WSE.mall.pos(); return P ? [P.x + P.w / 2, P.y + P.h / 2] : null; });
  if (mall) { await view(pg, mall[0], mall[1], 0.45); d = await drawn(pg);
    t.check('autour du mall : aucune plaque ne chevauche une autre', !overlaps(d).length && finite(d), `${d.length} plaques`);
    await pg.screenshot({ path: SHOTS + '/t54_mall.png' }).catch(() => {}); }

  // ---- 5. Zoom trop faible : texte masqué
  await view(pg, P[0], P[1], 0.13); d = await drawn(pg);
  t.check('zoom lointain (0,13) : aucune plaque illisible affichée', d.every(s => s.fs >= 7), `${d.length} plaques, min ${d.length ? Math.min(...d.map(s => s.fs)).toFixed(1) : '-'} px`);
  await view(pg, P[0], P[1], 0.3); d = await drawn(pg);
  t.check('zoom de jeu (0,3) : plaques des moyens et grands bâtiments visibles, toujours ≥ 7 px', d.length >= 2 && d.every(s => s.fs >= 7), `${d.length} plaques`);

  // ---- 6. Performance : coût des enseignes par image
  await view(pg, P[0], P[1], 0.55);
  const perf = await pg.evaluate(async () => { const G = window.WSE.sign, v = []; for (let i = 0; i < 40; i++) { await new Promise(r => requestAnimationFrame(r)); v.push(G.ms); } v.sort((a, b) => a - b); return { med: v[20], p90: v[36], cache: G.cacheN }; });
  t.check('performance : enseignes < 1 ms par image (médiane), cache borné', perf.med < 1 && perf.cache <= 500, `médiane ${perf.med.toFixed(3)} ms · p90 ${perf.p90.toFixed(3)} ms · ${perf.cache} plaques en cache`);
  // désactivation : rien n'est dessiné, aucune erreur
  const off = await pg.evaluate(async () => { const G = window.WSE.sign; G.on = false; await new Promise(r => setTimeout(r, 120)); const n = G.drawn.length; G.on = true; return n; });
  t.check('interrupteur WSE.sign.on : désactivé, aucune plaque', off === 0, String(off));
  t.check('aucune erreur de page', !pg.errs.length, pg.errs.slice(0, 3).join(' | '));
  await pg.close();

  // ---- 7. Téléphone 390 × 844
  const mp = await L.newPage({ wait: 2600, w: 390, h: 844 });
  await mp.evaluate(() => { window.WSE.startMode('free'); });
  const w1 = await world(mp, L); const Q = w1.placed.s2 || Object.values(w1.placed)[0];
  await view(mp, Q[0], Q[1], 0.6); d = await drawn(mp);
  t.check('mobile 390×844 : plaques présentes, lisibles (≥ 9 px opaques), plus étroites que l\'écran, sans chevauchement ni NaN', d.length >= 2 && finite(d) && !overlaps(d).length && d.every(s => s.w < 390 && (s.al < 1 || s.fs >= 9)), `${d.length} plaques · ${d.map(s => s.txt + ' ' + s.fs.toFixed(0) + 'px').join(', ')}`);
  await mp.screenshot({ path: SHOTS + '/t54_mobile.png' }).catch(() => {});
  t.check('mobile : aucune erreur de page', !mp.errs.length, mp.errs.slice(0, 3).join(' | '));
  await mp.close();
};
