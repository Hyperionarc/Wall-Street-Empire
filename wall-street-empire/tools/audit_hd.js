// Audit de couverture HD (passe 99) : pour chaque bâtiment, équipement, service, décor et véhicule affiché sur la carte, quel sprite HD est
// réellement dessiné (nom du PNG, relevé en instrumentant drawImage pendant le rendu de l'élément seul) ou s'il est dessiné en VECTORIEL (repli code) ;
// puis la liste des PNG HD présents dans assets/factory_hd et assets/phase2_hd qui ne sont ni embarqués dans city.html ni dessinés.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/audit_hd.js [--md]   (--md : écrit docs/AUDIT_HD_COUVERTURE.md)
// Module : require('./audit_hd.js').inventaire(page) -> { rows, embedded } (utilisé par tests/t99_couverture_hd.js).
const fs = require('fs'), path = require('path');
const REPO = path.resolve(__dirname, '..', '..');

const PAGE = () => {
  const W = window.WSE, G = W.gfx, S = W.S, N = W.N, now = 1000, rows = [];
  const nm = new Map();
  Object.keys(G.P2_IMG).forEach(n => { const e = G.P2_IMG[n]; if (e && e.im) nm.set(e.im, e.base ? n + ' (dérivé de ' + e.base + ')' : n); });
  Object.keys(G.CITY_IMG).forEach(n => nm.set(G.CITY_IMG[n].im, n));
  Object.keys(G.FAC_IMG || {}).forEach(n => { const e = G.FAC_IMG[n]; if (e && e.im) nm.set(e.im, n); });
  Object.keys(G.HQ_IMG || {}).forEach(n => { const e = G.HQ_IMG[n]; if (e && e.img) nm.set(e.img, 'hq_' + n); });
  const P = CanvasRenderingContext2D.prototype;
  function trace(fn) {   // rend fn dans un canevas hors écran ; renvoie les noms des images dessinées et le nombre d'opérations vectorielles
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), st = { names: {}, ops: 0, atlas: 0, other: 0 };
    g.drawImage = function (s, ...a) { const n = nm.get(s); if (n) st.names[n] = (st.names[n] || 0) + 1; else if (s === G.ATLAS) st.atlas++; else if (s instanceof HTMLCanvasElement && s._hd) st.names[s._hd + ' (dérivé)'] = 1; else st.other++; return P.drawImage.call(this, s, ...a); };
    ['fill', 'stroke', 'fillRect'].forEach(k => { g[k] = function (...a) { st.ops++; return P[k].apply(this, a); }; });
    let err = null; try { G.use(g, fn); } catch (e) { err = e.message; }
    return { names: Object.keys(st.names), ops: st.ops, atlas: st.atlas, other: st.other, err };
  }
  const mode = t => t.err ? 'erreur' : t.names.length && t.ops > 20 && t.names.every(n => /^(veh_|voiture_|camion|poses\/|animal_|fermier|arbre)/.test(n)) ? 'VECTORIEL (+ petits sprites HD)' : t.names.length ? (t.ops > 40 ? 'HD + code' : 'HD') : t.atlas ? 'atlas Kenney' : t.ops ? 'VECTORIEL' : 'rien';
  const push = (fam, id, label, t, note) => rows.push({ fam, id, label, mode: mode(t), spr: t.names.join(', '), ops: t.ops, err: t.err, note: note || '' });
  const X0 = 40, Y0 = 40;
  const drawCell = (a, w, h) => () => { for (let s = 0; s <= w + h - 2; s++) for (let ox = 0; ox < w; ox++) { const oy = s - ox; if (oy < 0 || oy >= h) continue; G.tile(a, a.x + ox, a.y + oy, ox, oy, { now }); } if (a.t !== 'npc') G.overlay(a, { now }); };
  // 1. bâtiments du joueur, niveau 0 (et niveaux 2 et 4 pour ceux qui changent d'image avec le niveau)
  const LV = { s1: 1, s2: 1, s3: 1, s4: 1, res: 1, hq: 1, tech: 1, bank: 1, off: 1, mcopper: 1, dc: 1 };
  Object.keys(W.TYPES).forEach(k => {
    if (k === 'road' || k === 'npc' || k === 'part' || k === 'cable' || k === 'pipeline') return;
    (LV[k] ? [0, 2, 4] : [0]).forEach(lv => {
      const a = G.mkCell(k, 0.37); a.x = X0; a.y = Y0; a.born = null; a.conn = true; a.lvl = lv; if (k === 'dc') a.lg = lv >= 2;
      if (k === 'res') a.floors = [1, 4, 14][lv / 2];
      push('Bâtiments du joueur', k + (LV[k] ? ':n' + lv : ''), W.TYPES[k].name + (LV[k] ? ' (niveau ' + lv + ')' : ''), trace(drawCell(a, a.w, a.h)));
    });
  });
  // 2. équipements publics (cases PNJ « mon ») : grandeur réelle du barème des tailles
  const FP = (W.fp && W.fp.MON_FP) || {};
  ['hospital', 'lycee', 'college', 'maternelle', 'garderie', 'police', 'fire', 'hall', 'telecom', 'stadium', 'stadium2'].forEach(m => {
    const f = FP[m] || [1, 1], a = { t: 'npc', k: 'mon', m, seed: 0.37, floors: 2, lvl: 0, w: 1, h: 1, x: X0, y: Y0, mx: X0, my: Y0, mw: f[0], mh: f[1], conn: true };
    const fn = () => { for (let s = 0; s <= f[0] + f[1] - 2; s++) for (let ox = 0; ox < f[0]; ox++) { const oy = s - ox; if (oy < 0 || oy >= f[1]) continue; G.tile(a, X0 + ox, Y0 + oy, ox, oy, { now }); } };
    push('Équipements publics', 'mon:' + m, m, trace(fn));
  });
  // 3. services de quartier (ville vivante) : sprite propre au service
  Object.keys(W.vv.SVC).forEach(n => { const p = G.iso(X0, Y0); push('Services de quartier', 'sv:' + n, W.vv.SVC[n][0], trace(() => G.drawFlat((W.vv.SPR || {})[n] || n, p, 1, null, [1, 1]))); });
  // 4. ville (PNJ) : un échantillon par sorte
  { const seen = {}; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (!c || c.t !== 'npc' || c.x + c.y * N !== i || c.k === 'mon') continue;
      const key = c.k + (c.lm ? ':repère' : '') + ':' + (c.k === 'house' ? '' : c.floors <= 3 ? 'bas' : c.floors <= 8 ? 'moyen' : c.floors <= 30 ? 'tour' : 'gratte-ciel');
      if ((seen[key] = (seen[key] || 0) + 1) > 3) continue;
      push('Ville (PNJ)', key + '#' + seen[key], key, trace(drawCell(c, c.w || 1, c.h || 1))); } }
  // 5. décor, véhicules, navires, animaux, personnages
  { const p = G.iso(20, 80);
    G.VV_CARS.forEach((m, i) => push('Véhicules de la ville', 'car:' + m[0], m[0], trace(() => G.car({ x: 20, y: 80, nx: 21, ny: 80, t: 0.5, m: 'Red-Sedan1', hv: i }))));
    for (let i = 0; i < 7; i++) push('Port et mer', 'navire:' + i, 'navire n° ' + (i + 1), trace(() => G.ship(p.x, p.y + 45, i)));
    push('Port et mer', 'grue', 'grue portique', trace(() => G.crane(p.x, p.y + 40, 3, now)));
    push('Port et mer', 'conteneurs', 'conteneurs', trace(() => G.containers(p, 7, false)));
    let qc = null; for (let i = 0; i < N * N && !qc; i++) if (W.ZONE[i] === 4 && !S.grid[i]) qc = [i % N, (i / N) | 0];
    if (qc) push('Port et mer', 'quai', 'décor de quai', trace(() => G.quay(G.iso(qc[0], qc[1]), qc[0], qc[1], now)));
    const seenA = {}; Object.values(G.VV_FARM).forEach(L => L.forEach(it => { if (!it || seenA[it[0]]) return; seenA[it[0]] = 1; push('Fermes (détails)', it[0], it[0], trace(() => G.spr(it[0], p.x, p.y, it[1] * 3, false))); }));
    push('Décor', 'arbre', 'arbre isolé', trace(() => G.tree(p, 20, 80, { dx: 0, dy: 0 })));
    if (G.mallPeople) push('Mall central (animations)', 'mall:gens', 'clients et commerçants du marché', trace(() => G.mallPeople(p)));
    if (G.mallPark) push('Mall central (animations)', 'mall:parking', 'tour de parking (voitures)', trace(() => G.mallPark(p)));
  }
  const embedded = Object.keys(G.P2_IMG).concat(Object.keys(G.CITY_IMG), Object.keys(G.FAC_IMG || {}));
  return { rows, embedded };
};

async function inventaire(pg) { return pg.evaluate(PAGE); }

function pngs() {   // PNG HD du dépôt (premier niveau de assets/factory_hd et assets/phase2_hd)
  const o = [];
  ['factory_hd', 'phase2_hd'].forEach(d => { const D = path.join(REPO, 'assets', d); if (fs.existsSync(D)) fs.readdirSync(D).filter(f => f.endsWith('.png')).forEach(f => o.push([d, f.slice(0, -4)])); });
  return o;
}
// PNG présents sans emploi sur la carte, avec la raison (pas de type de jeu, intérieur d'usine, réservé à un autre chantier, version remplacée)
const NON_CARTE = {
  aeroport_terminal: 'aéroport : chantier d\'un autre agent', mall_central: 'NE PAS BRANCHER : le mall « effet Guggenheim » dessiné en code est l\'extérieur voulu', mall_central_moderne: 'NE PAS BRANCHER : idem (extérieur du mall conservé)',
  drugstore: 'ANCIENNE pharmacie (cube blanc + parking de voitures-cubes, 17/11) : remplacée partout par pharmacie.png (croix verte lumineuse, 19/11)', bat_drugstore: 'ancienne pharmacie sans parking (17/11) : remplacée par pharmacie.png',
  mega_centre_commercial: 'ancien méga-centre (petit bâtiment au fond d\'un parking de voitures-cubes) : remplacé par bat_mega_centre_commercial', supermarche: 'ancien supermarché + parking : remplacé par bat_supermarche', supermarche_n2: 'remplacé par bat_supermarche_n2', supermarche_n3: 'remplacé par bat_supermarche_n3', hypermarche: 'remplacé par bat_hypermarche', hypermarche_n2: 'remplacé par bat_hypermarche_n2', hypermarche_n3: 'remplacé par bat_hypermarche_n3',
  usine_petite_f1: 'jugée « abri de jardin » (passe 78) : repli usine_moyenne_f2 en attendant la commande n° 14', usine_grande_f3: 'jugée confuse (passe 78) : deux halls f2 en attendant la commande n° 14',
  data_center: 'cube gris sans parcelle : remplacé par data_center_campus (5×4)', banque_neoclassique: 'pièce d\'or géante sur le toit (style jeu mobile) : remplacée par banque.png', fwheat_test: 'essai du producteur',
  bat_scierie: 'pas de scierie dans le jeu (le camp de bûcherons a son sprite)', scierie_exterieure: 'pas de scierie dans le jeu', raffinerie_petrole: 'pas de raffinerie dans le jeu (la chimie est une usine f1-f4)', raffinerie_unite_distillation: 'pas de raffinerie dans le jeu', torchere_raffinerie: 'pas de raffinerie dans le jeu', reservoir_stockage_petrole: 'pas de dépôt pétrolier dans le jeu',
  ferme_traditionnelle: 'ferme de style rustique : les fermes 2×2 / 3×3 ont leurs sprites (fwheat…)', manufacturing_unit: 'intérieur d\'usine', bat_ferme_carrousel: 'annexe de ferme non retenue (passe 87)', bat_ferme_porcherie_long: 'doublon de bat_ferme_porcherie_longue', bat_ferme_porcherie_longue: 'annexe non retenue (passe 87)', bat_ferme_poulailler_long: 'annexe non retenue (passe 87)',
  station_recharge_rapide_autoroute: 'pas d\'autoroute sur la carte', boutique_high_tech_n2: 'niveau 2 de la boutique high-tech (pas de niveaux pour les spécialistes)', concession_auto_n2: 'niveau 2 de la concession (pas de niveaux pour les spécialistes)',
  hangar_ferme: 'grange rouge isolée : les sprites de ferme contiennent déjà grange et silo', tracteur: 'tracteur : déjà présent dans les sprites de culture 3×3 (coin nord-est)',
};
const INTERIEUR = /^(bac_|barres_|bobine|bobineuse|caisse|cuve|extincteur|four_|futs_|ligne_|lingots_|machine_|malaxeur|mannequin|panneau|panneaux|peaux|planches|pneus|portant|poste_couture|reacteur|robot_6_axes_bras|rouleaux|sacs_|scie_|table_de_coupe|transpalette|unite_|armoire|chariot_elevateur_charge|coin_mur|mur_bas_|convoyeur_vide|camion_.*_face|ouvrier_[hf]\d$)/;

function report(r, before) {
  const all = pngs(), emb = new Set(r.embedded), drawn = new Set();
  r.rows.forEach(x => x.spr.split(', ').forEach(n => n && drawn.add(n.replace(/ \(dérivé.*$/, ''))));
  let md = `# Audit de couverture HD (passe 99)\n\nGénéré par \`tools/audit_hd.js --md\` : chaque élément est rendu seul dans un canevas dont \`drawImage\` est instrumenté ; la colonne « Sprite » donne le nom du PNG réellement dessiné. **VECTORIEL** = aucun sprite, dessin en code (repli). « HD + code » = sprite HD plus des détails animés en code (fumée, troupeaux, enseignes, chariots…).\n\n`;
  const cnt = {}; r.rows.forEach(x => { cnt[x.mode] = (cnt[x.mode] || 0) + 1; });
  md += `Bilan : ${r.rows.length} éléments — ${Object.entries(cnt).map(([k, v]) => k + ' ' + v).join(' · ')}.\n\n`;
  const fams = [...new Set(r.rows.map(x => x.fam))];
  fams.forEach(f => {
    md += `## ${f}\n\n| Élément | Rendu | Sprite HD dessiné | Avant (passe 98) | Note |\n|---|---|---|---|---|\n`;
    r.rows.filter(x => x.fam === f).forEach(x => { const b = before && before[x.id]; md += `| ${x.label} (\`${x.id}\`) | ${x.mode} | ${x.spr ? '`' + x.spr.split(', ').join('`, `') + '`' : '—'} | ${b ? (b.spr ? b.spr : b.mode) : ''} | ${x.note || ''} |\n`; });
    md += '\n';
  });
  md += `## PNG HD présents mais absents de la carte\n\n| Dossier | PNG | Embarqué dans city.html | Raison |\n|---|---|---|---|\n`;
  all.filter(([d, n]) => !drawn.has(n)).forEach(([d, n]) => {
    const why = NON_CARTE[n] || (/^bat_(ferme|chai)_/.test(n) ? 'annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l\'inventaire rend les fermes à leur taille de départ)'
      : /^port_/.test(n) ? 'décor du port tiré par case de quai ou navire (hors échantillon de l\'inventaire) ; vérifié sur capture du port'
      : n === 'gare_ferroviaire' ? 'plus de gare pour l\'instant (consigne de Rémy)'
      : /^(gratte_ciel|tour_|immeuble|maison|brownstone|pavillon|chalet|villa|hotel|chantier_petit|petit_marche_n2)/.test(n) ? 'bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l\'inventaire)'
      : /^(route_|herbe|terre|sol_|eau_|rivage|gisement|foret|arbre|buisson|rochers|champ_|meule|concasseur)/.test(n) ? 'sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments)'
      : /^(bac_|lingots_|sacs_|barres_|briques|futs_|porcelaine|chassis|aimants|conteneur_)/.test(n) && emb.has(n) ? 'marchandise posée sur les quais (VV_GOODS, tirée au hasard par case)'
      : INTERIEUR.test(n) || /^(camion_|chariot|convoyeur|presse|quai_|rack_|robot_|palette|plaques|bobine|machine|mur_|ouvrier_|bureau_vitre|buisson|arbre)/.test(n) ? 'intérieur d\'usine (vue immersive) ou marchandise'
      : 'à vérifier');
    md += `| ${d} | \`${n}\` | ${emb.has(n) ? 'oui' : 'non'} | ${why} |\n`;
  });
  return md;
}

module.exports = { inventaire, PAGE, pngs, report, NON_CARTE };

if (require.main === module) {
  (async () => {
    const L = require('./tests/lib.js');
    const pg = await L.newPage({ wait: 3000 }); await L.setup(pg, {});
    await pg.waitForFunction(() => Object.values(window.WSE.gfx.P2_IMG).every(e => e.ok), null, { timeout: 30000 }).catch(() => {});
    const r = await inventaire(pg);
    const bf = path.join(__dirname, 'audit_hd_avant.json'), before = fs.existsSync(bf) ? JSON.parse(fs.readFileSync(bf, 'utf8')) : null;
    if (process.argv.includes('--avant')) { const o = {}; r.rows.forEach(x => { o[x.id] = { mode: x.mode, spr: x.spr }; }); fs.writeFileSync(bf, JSON.stringify(o, null, 0)); }
    r.rows.forEach(x => console.log(x.fam, '|', x.id, '|', x.mode, '|', x.spr, x.err || ''));
    if (process.argv.includes('--md')) { const ex = path.resolve(__dirname, '..', 'docs', 'AUDIT_HD_COUVERTURE.md'), cur = fs.existsSync(ex) ? fs.readFileSync(ex, 'utf8') : '', tail = cur.indexOf('<!-- manuel -->') >= 0 ? cur.slice(cur.indexOf('<!-- manuel -->')) : '';
      fs.writeFileSync(ex, report(r, before) + '\n' + tail); console.log('écrit', ex); }
    if (pg.errs.length) console.log('erreurs', pg.errs.slice(0, 3));
    await L.closeBrowser();
  })();
}
