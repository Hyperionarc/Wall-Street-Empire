// Passe 78 : convention d'éclairage des sprites de bâtiments (docs/REVUE_BATIMENTS.md, Rémy : « supermarchés : angle isométrique inversé »).
// Convention mesurée sur les références (maisons, immeubles, tours, usine moyenne, boutiques v2, dalle commune des commerces) : lumière haut-gauche,
// flanc gauche (face sud-ouest) clair, flanc droit (face sud-est) sombre, dalle 2:1.
// Mesure : sur l'image réellement embarquée (après miroir P2_FLIP du build), luminance médiane de la bande d'épaisseur juste au-dessus de l'arête basse gauche
// de la silhouette (flanc gauche de la dalle) et de l'arête basse droite ; ratio gauche / droite. Les sprites rendus avec la lumière à droite (ratio < 0,8 avant le
// passe 78 : mines, puits, carrières, entrepôt, port, nucléaire, data center, chantier, stade) sont retournés au build ; les cas ambigus sont listés avec leur raison.
exports.name = 'Orientation et éclairage des sprites de bâtiments';
const BUILDINGS = ['usine_moyenne_f2', 'usine_grande_f3', 'usine_f4_mega', 'fonderie', 'bat_supermarche', 'bat_supermarche_n2', 'bat_supermarche_n3', 'bat_hypermarche', 'bat_hypermarche_n2', 'bat_hypermarche_n3',
  'petit_marche_n1', 'petit_marche_n2', 'mega_centre_commercial', 'concession_auto', 'boutique_high_tech', 'boutique_luxe', 'boutique_mode_luxe', 'boutique_mode', 'pharmacie', 'maison_deco', 'sport_loisirs',
  'drugstore', 'boulangerie', 'cafe_de_quartier', 'restaurant_terrasse', 'station_service', 'station_recharge_electrique', 'entrepot', 'terminal_portuaire', 'centrale_charbon', 'centrale_nucleaire',
  'centrale_solaire', 'eolienne', 'centre_rd', 'data_center', 'agence_immo', 'chantier_moyen', 'station_tv', 'stade_sport', 'hopital', 'ecole', 'mairie', 'eglise_de_village', 'siege_hq_n1', 'siege_hq_n2',
  'siege_hq_n3', 'tour_bureaux', 'tour_logements', 'tour_tech', 'tour_pnj_a', 'tour_pnj_b', 'maison_n1', 'maison_n2', 'maison_n3', 'immeuble_n1', 'immeuble_n2', 'maison_pnj_a', 'maison_pnj_b', 'maison_pnj_c',
  'immeuble_pnj_a', 'immeuble_pnj_b', 'barre_hlm', 'immeuble_en_construction', 'batiment_abandonne', 'chantier_petit', 'puits_petrole', 'puits_gaz', 'mine_fer', 'mine_charbon', 'mine_cuivre', 'mine_or',
  'mine_nickel_chrome', 'mine_bauxite', 'mine_lithium', 'mine_zinc', 'mine_graphite', 'mine_phosphate', 'mine_potasse', 'mine_sel', 'carriere', 'carriere_argile', 'carriere_silice', 'camp_bucherons',
  'caserne_pompiers', 'commissariat', 'banque', 'data_center_campus', 'bat_mega_centre_commercial'];   // passe 99 : sprites HD branchés par l'audit de couverture
// Exceptions justifiées (ratio < 0,95) : sprite non dessiné en jeu ou mesure non significative
const EXC = {
  usine_petite_f1: 'plus dessinée : la petite usine reprend l\'usine moyenne (P2_REPLI) en attendant la commande Cowork n° 14',
  supermarche: 'plus dessiné (bat_supermarche) ; dalle commune claire à gauche', hypermarche: 'plus dessiné (bat_hypermarche)'
};
const FLIPPED = ['entrepot', 'terminal_portuaire', 'centrale_nucleaire', 'data_center', 'chantier_moyen', 'stade_sport', 'puits_gaz', 'mine_fer', 'mine_charbon', 'mine_cuivre', 'mine_or', 'mine_nickel_chrome', 'mine_bauxite', 'mine_zinc', 'carriere', 'carriere_argile', 'carriere_silice'];

function pageMeasure(names) {   // exécuté dans la page
  const W = window.WSE, P = W.p2.img, out = {};
  for (const n of names) {
    const e = P[n]; if (!e || !e.ok) { out[n] = null; continue; }
    const im = e.im, s = Math.min(1, 700 / Math.max(im.naturalWidth || im.width, 1)), w = Math.round((im.naturalWidth || im.width) * s), h = Math.round((im.naturalHeight || im.height) * s);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data, A = (x, y) => d[(y * w + x) * 4 + 3] > 200, L = (x, y) => { const i = (y * w + x) * 4; return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; };
    let x0 = w, x1 = -1; const yb = new Array(w).fill(-1);
    for (let x = 0; x < w; x++) for (let y = h - 1; y >= 0; y--) if (A(x, y)) { yb[x] = y; if (x < x0) x0 = x; if (x > x1) x1 = x; break; }
    const k = Math.max(3, Math.round(0.012 * w)), cx = (x0 + x1) / 2, span = (x1 - x0) / 2;
    const side = (a, b) => { const v = []; for (let x = Math.round(a); x < Math.round(b); x++) { if (yb[x] < 0) continue; for (let y = yb[x] - k; y < yb[x] - 1; y++) if (y >= 0 && A(x, y)) v.push(L(x, y)); } v.sort((p, q) => p - q); return v.length ? v[v.length >> 1] : NaN; };
    const l = side(x0 + 0.15 * span, cx - 0.25 * span), r = side(cx + 0.25 * span, x1 - 0.15 * span);
    out[n] = { l: Math.round(l), r: Math.round(r), ratio: +(l / Math.max(1, r)).toFixed(3) };
  }
  return out;
}

exports.pageMeasure = pageMeasure;
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 3000 }); await L.setup(pg);
  const names = BUILDINGS.concat(Object.keys(EXC));
  const m = await pg.evaluate(pageMeasure, names);
  const miss = BUILDINGS.filter(n => !m[n]);
  t.check(`les ${BUILDINGS.length} sprites de bâtiments sont embarqués et décodés`, !miss.length, miss.join(','));
  const bad = BUILDINGS.filter(n => m[n] && !(m[n].ratio >= 0.95) && !EXC[n]);
  t.check('convention : flanc gauche de la dalle au moins aussi clair que le droit (lumière haut-gauche) sur tous les bâtiments (ratio ≥ 0,95), hors exceptions justifiées', !bad.length, bad.map(n => n + ' ' + m[n].ratio).join(', '));
  const fl = FLIPPED.filter(n => m[n] && m[n].ratio > 1.15);
  t.check('sprites rendus avec la lumière à droite retournés au build (P2_FLIP) : flanc gauche désormais nettement clair (ratio > 1,15)', fl.length === FLIPPED.length, FLIPPED.filter(n => !fl.includes(n)).map(n => n + ' ' + (m[n] && m[n].ratio)).join(', '));
  const src = require('fs').readFileSync(require('path').resolve(__dirname, '..', 'build.py'), 'utf8'), fset = (src.match(/P2_FLIP = \{([^}]*)\}/) || [, ''])[1];
  t.check('P2_FLIP (build.py) ne retourne aucun sprite portant du texte ou une enseigne de façade (pharmacie, boutiques, hôpital, supermarchés…)', !/pharmacie|boutique|hopital|supermarche|hypermarche|drugstore|mairie|ecole|cafe|boulangerie|restaurant|station_service/.test(fset), fset.slice(0, 120));
  // en jeu : le sprite réellement dessiné pour chaque type de bâtiment du joueur respecte la convention
  const drawn = await pg.evaluate(() => { const W = window.WSE, A = W.audit, o = {}; ['f1', 'f2', 'f3', 'f4', 's2', 's3', 'wh', 'ewh', 'port', 'plant', 'nuclear', 'rd', 'immo', 'foundry', 's1', 'miron', 'mcoal', 'well', 'gwell', 'qsilica', 'logging'].forEach(k => { [0, 4].forEach(lv => { const a = A.mkCell(k, 0.37); a.x = 20; a.y = 20; a.lvl = lv; a.born = null; delete a.works; o[k + ':' + lv] = A.solo(a, 0.1).spr; }); }); return o; });
  const dn = [...new Set(Object.values(drawn))], m2 = await pg.evaluate(pageMeasure, dn), badD = Object.keys(drawn).filter(k => m2[drawn[k]] && !(m2[drawn[k]].ratio >= 0.95));
  t.check('en jeu : usines, supermarché, hypermarché, entrepôts, port, énergie, extraction dessinés avec un sprite éclairé à gauche', !badD.length, badD.map(k => k + '=' + drawn[k]).join(', '));
  t.check('petite usine : plus le hangar à bardeaux (repli usine moyenne) ; supermarché et hypermarché : bâtiment seul bat_* (plus le petit cube au fond du parking)', drawn['f1:0'] === 'usine_moyenne_f2' && /^bat_supermarche/.test(drawn['s2:0']) && /^bat_hypermarche/.test(drawn['s3:4']), JSON.stringify({ f1: drawn['f1:0'], s2: drawn['s2:0'], s3: drawn['s3:4'], f3: drawn['f3:0'] }));
  t.info(BUILDINGS.map(n => m[n] ? `${n} ${m[n].ratio}` : n + ' ?').join(' · '));
  t.check('0 erreur de page', !pg.errs.length, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
