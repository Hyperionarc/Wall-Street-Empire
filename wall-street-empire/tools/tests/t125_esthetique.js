// Cohérence esthétique des bâtiments (docs/STYLE_BATIMENTS.md, tools/audit_esthetique.js). Rémy : « Je ne veux pas voir des trucs de type jouet sur les collèges et les écoles » ;
// « un gratte-ciel complètement sans aucun détail » ; « deux bâtiments verts avec une croix […] une pancarte marron type cartoon ».
exports.name = 'Cohérence esthétique : écoles européennes distinctes, aucun aplat sans détail, charte des bâtiments';
const fs = require('fs'), path = require('path');
const A = require('../audit_esthetique.js');
const SCHOOLS = { lycee: ['lycee', [3, 2]], college: ['college', [2, 2]], maternelle: ['ecole_maternelle', [1, 1]], garderie: ['creche', [1, 1]] };
const PROC = ['ecole_maternelle', 'creche', 'college', 'lycee', 'pharmacie_quartier', 'cafe_quartier', 'restaurant_quartier', 'boulangerie_quartier', 'boutique_quartier', 'hotel_de_ville', 'hopital_ville', 'commissariat_ville'];
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 2500 });
  const R = await A.audit(pg), by = {}; R.rows.forEach(r => { by[r.id] = r; });
  await pg.waitForFunction(() => Object.values(window.WSE.gfx.P2_IMG).every(e => e.ok), null, { timeout: 30000 }).catch(() => {});
  const info = await pg.evaluate(() => { const W = window.WSE; return { mon: W.vv.MON, fp: W.fp.MON_FP, dim: W.p2.dim, svc: W.vv.SPR, sf: W.aud.SIGN_FACE }; });
  // 1. les écoles : un sprite distinct chacune, rendu HD (plus de repli ni de sprite partagé « ecole »), à la bonne emprise, calé
  const sprs = Object.keys(SCHOOLS).map(m => info.mon[m]);
  t.check('maternelle, crèche, collège et lycée ont chacun leur sprite (distincts, aucun « ecole » partagé)', new Set(sprs).size === 4 && !sprs.includes('ecole') && Object.keys(SCHOOLS).every(m => info.mon[m] === SCHOOLS[m][0]), JSON.stringify(sprs));
  Object.keys(SCHOOLS).forEach(m => {
    const [n, fp] = SCHOOLS[m], r = by['mon:' + m], d = info.dim[n] || [], dw = d[7] - d[6], cases = (fp[0] + fp[1]) / 2, mf = info.fp[m] || [1, 1];
    t.check(`${m} : emprise du barème ${fp.join(' × ')} et losange de la dalle = ${cases} case(s) × 396 px (±2 %)`, mf[0] === fp[0] && mf[1] === fp[1] && Math.abs(dw / cases / 396 - 1) < 0.02, `barème ${mf.join('×')}, losange ${dw} px`);
    t.check(`${m} : dessiné en HD par ${n} (ni vectoriel ni « ecole »), calé (débord ≤ 6 %, Δbas ≤ 0,3 TH, emprise remplie ≥ 90 %), défini (≥ 0,6), sans aplat`,
      r && r.mode === 'HD' && r.spr === n && r.over <= 0.06 && Math.abs(r.dyB) <= 0.3 && r.fill >= 0.9 && r.def >= 0.6 && !r.aplat, r && JSON.stringify({ mode: r.mode, spr: r.spr, over: r.over, dyB: r.dyB, fill: r.fill, def: r.def }));
  });
  // 2. la ville au démarrage : aucun aplat sans détail, aucun repli vectoriel ni atlas (hors mall et aéroport, dessinés par le code à dessein)
  const npc = R.rows.filter(r => /^Ville|^Services|^Équipements/.test(r.fam));
  const flat = npc.filter(r => r.aplat), vec = npc.filter(r => r.mode !== 'HD');
  t.check('aucun aplat sans détail parmi les bâtiments de la ville visibles au démarrage (tours, immeubles, services, équipements)', !flat.length, flat.map(r => r.id + ' arêtes ' + r.edge + ' aplats ' + r.flat).join(', ') || npc.length + ' sortes auditées');
  t.check('aucun bâtiment de la ville en repli vectoriel ou atlas Kenney au démarrage', !vec.length, vec.map(r => r.id + ':' + r.mode).join(', '));
  const ecole = npc.filter(r => /(^|, )ecole(,|$)/.test(r.spr));
  t.check('l\'ancien sprite « ecole » (cahier géant sur toit bleu) n\'est plus dessiné nulle part', !ecole.length, ecole.map(r => r.id).join(', '));
  const tow = R.rows.filter(r => /^npc:/.test(r.id) && /(atlas|vectoriel)$/.test(r.id));
  t.check('tours de la ville : jamais l\'atlas empilé ni le prisme bleu sans détail (toutes en sprite HD)', !tow.length, tow.map(r => r.label).join(', '));
  // 3. charte : pharmacie (croix verte à bras égaux sur potence), commerces sans pictogramme de toit, rendus procéduraux définis, non saturés, calés
  t.check('services de quartier : pharmacie, café, restaurant, boulangerie, boutique dessinés par leurs immeubles à devanture (plus les cubes à pictogramme géant)',
    info.svc.drugstore === 'pharmacie_quartier' && info.svc.cafe_de_quartier === 'cafe_quartier' && info.svc.restaurant_terrasse === 'restaurant_quartier' && info.svc.boulangerie === 'boulangerie_quartier' && info.svc.boutique_mode === 'boutique_quartier', JSON.stringify(info.svc));
  const pr = R.rows.filter(r => PROC.includes(r.spr));
  const bad = pr.filter(r => r.sat > 0.15 || r.def < 0.6 || r.aplat || r.over > 0.06 || Math.abs(r.dyB) > 0.3);
  t.check('rendus procéduraux conformes à la charte (couleurs vives ≤ 15 %, définition ≥ 0,6, calés, détaillés)', pr.length >= 10 && !bad.length, bad.map(r => r.id + JSON.stringify({ sat: r.sat, def: r.def, over: r.over, dyB: r.dyB })).join(' ; ') || pr.length + ' rendus');
  const meta = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'sprites_procedural', 'meta.json'), 'utf8'));
  const sfBad = []; Object.values(info.sf).forEach(T => Object.keys(T).forEach(n => { const m = meta[n], F = T[n]; if (!m) return; const s = m.signs[0];
    if (Math.abs(F.ax * m.w - s.cx) > 1 || Math.abs(F.ay * m.h - s.cy) > 1 || Math.abs(F.w * m.w - s.w) > 1 || F.face !== s.face) sfBad.push(n); }));
  t.check('enseignes de façade des rendus procéduraux calées sur leur bandeau vierge (SF = meta.json)', !sfBad.length, sfBad.join(', '));
  const sizes = PROC.map(n => { const f = path.resolve(__dirname, '..', '..', '..', 'assets', 'phase2_hd', n + '.png'); return fs.existsSync(f) ? fs.statSync(f).size : -1; });
  t.check('PNG des rendus procéduraux présents (assets/phase2_hd)', sizes.every(s => s > 0), PROC.filter((n, i) => sizes[i] <= 0).join(', ') || Math.round(sizes.reduce((a, b) => a + b, 0) / 1024) + ' Ko');
  t.check('aucune erreur de page', !pg.errs.length, pg.errs.slice(0, 3).join(' | '));
  await pg.context().close();
};
