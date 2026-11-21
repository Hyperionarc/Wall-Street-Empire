// Passe 59 : audit réel des images de produits et des fermes.
// A. chaque produit fini et chaque bien a une photo HD (assets/guide_hd, réaffectée ou composée au build) ou figure dans la liste explicite des replis vectoriels ;
//    les replis sont des dessins propres au produit (pas le plateau-repas ni le tas de rochers par défaut) ; la photo HD sert aussi aux icônes de biens ; docs/AUDIT_PRODUITS.md couvre tout.
// B. fermes : effets vivants (blé, colza, maïs, canne, vigne, troupeaux) sans NaN, dessinés dans l'emprise 2×2, animés, sous le zoom 0,4 rien n'est ajouté, 0 erreur de page.
const fs = require('fs'), path = require('path');
exports.name = 'Audit produits et fermes (passe 59)';

// replis vectoriels assumés (commande Cowork en cours, voir docs/AUDIT_PRODUITS.md) : toute autre clé sans photo HD est une régression
const REPLI = ['eggs', 'chicken', 'porkmeat', 'lambmeat', 'sausage', 'tablewine', 'grandcru', 'tableoil', 'biofuel', 'grapes', 'corn', 'rapeseed', 'egg', 'wine', 'cookoil', 'biodiesel', 'cpu', 'dram', 'gpu', 'basic', 'std', 'lux'];   // passe 73 : puces (photos commandées, RETOURS.md n° 12)
const OWN_GLYPH = { eggs: 'eggbox', chicken: 'chicken', porkmeat: 'chop', lambmeat: 'rack', sausage: 'saucisson', tablewine: 'tablewine', grandcru: 'grandcru' };
const FARMS = ['fwheat', 'frapeseed', 'fcorn', 'fsugar', 'fvine', 'fcattle', 'fsheep', 'fpig', 'fchicken'];

exports.run = async (t, L) => {
  const root = path.resolve(__dirname, '..', '..');
  const pg = await L.newPage({ wait: 900 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);

  // A1. inventaire
  const A = await pg.evaluate(async ({ REPLI, OWN_GLYPH }) => {
    const W = window.WSE, I = W.imgAudit, o = { miss: [], extra: [], vecBad: [], glyph: [], icon: [], dims: [], prod: 0, good: 0 };
    const keys = Object.keys(W.PRODUCTS).map(k => ['p', k]).concat(Object.keys(W.GOODS).map(k => ['g', k])); o.prod = Object.keys(W.PRODUCTS).length; o.good = Object.keys(W.GOODS).length;
    const rock = I.compIconVec('__aucun__');   // dessin par défaut de drawItem (tas de rochers) : un repli ne doit jamais l'utiliser
    keys.forEach(([kind, k]) => {
      const hd = I.guide(k), rep = REPLI.includes(k);
      if (!hd && !rep) o.miss.push(k); if (hd && rep) o.extra.push(k);
      if (rep) { if (kind === 'p') { if (!/^<svg/.test(I.productSVG0(k, 1)) || !/^<svg/.test(W.productSVG(k, 2))) o.vecBad.push(k); } else if (I.compIconVec(k) === rock) o.vecBad.push(k); }
      if (kind === 'g' && hd && I.compIcon(k) !== I.photo(k)) o.icon.push(k);
    });
    Object.keys(OWN_GLYPH).forEach(k => { if (!W.GLY[k] || W.GLY[k][0] !== OWN_GLYPH[k]) o.glyph.push(k + ':' + (W.GLY[k] || [])[0]); });
    ['beefmeat', 'chicken', 'porkmeat', 'lambmeat'].forEach(k => { if (W.GLY[k] && W.GLY[k][0] === 'plate') o.glyph.push(k + ' plateau'); });
    o.whisky = I.photo('whisky') === I.photo('spirit') && !!I.photo('spirit');
    o.wineDiff = I.productSVG0('tablewine', 1) !== I.productSVG0('grandcru', 1) && W.GLY.tablewine[0] !== W.GLY.grandcru[0];
    // les photos se décodent et ne sont pas des vignettes minuscules
    const ph = keys.filter(([, k]) => I.guide(k)).map(([, k]) => k);
    await Promise.all(ph.map(k => new Promise(res => { const im = new Image(); im.onload = () => { if (im.naturalWidth < 256 || im.naturalHeight < 256) o.dims.push(k + ' ' + im.naturalWidth); res(); }; im.onerror = () => { o.dims.push(k + ' illisible'); res(); }; im.src = I.photo(k); })));
    o.nPhotos = ph.length; return o;
  }, { REPLI, OWN_GLYPH });
  t.check(`chaque produit (${A.prod}) et bien (${A.good}) a une photo HD ou figure dans la liste explicite des replis`, A.miss.length === 0, 'sans image : ' + A.miss.join(', '));
  t.check('liste des replis à jour (aucune clé listée n\'a déjà sa photo)', A.extra.length === 0, A.extra.join(', '));
  t.check('replis : dessins propres au produit (jamais le tas de rochers par défaut), toutes qualités', A.vecBad.length === 0, A.vecBad.join(', '));
  t.check('aliments et vins sans photo : silhouette fidèle (œufs, viandes, saucisson, vin de table ≠ grand cru), plus de plateau-repas générique', A.glyph.length === 0 && A.wineDiff, A.glyph.join(', '));
  t.check('whisky : photo sans pseudo-texte (carafe spirit.jpg) au lieu de whisky.jpg', A.whisky, '');
  t.check(`photos HD décodables et >= 256 px (${A.nPhotos})`, A.dims.length === 0, A.dims.slice(0, 5).join(', '));
  t.check('biens : l\'icône des rayons, fournisseurs et emplacements est la photo HD quand elle existe', A.icon.length === 0, A.icon.slice(0, 5).join(', '));

  // A2. affichage réel : Guide (carte photo), fiche produit et rayon du vin de table / grand cru, halle (bulle d'intrant photo)
  const V = await pg.evaluate(async () => {
    const W = window.WSE, o = {}; W.openGuide('cheese'); await new Promise(r => setTimeout(r, 250));
    const g = document.getElementById('gview'); o.gphoto = g ? g.querySelectorAll('img.gphoto').length : 0;
    o.svgT = W.productSVG('tablewine', 0).length > 500; o.svgG = W.productSVG('grandcru', 2).length > 500;
    return o; });
  t.check('Guide : cartes avec photos HD (fromage et ses intrants)', V.gphoto >= 2, `${V.gphoto} photos`);
  t.check('vin de table et grand cru : vignettes dessinées (catalogue, fiche, rayons)', V.svgT && V.svgG, '');

  // A3. rapport d'audit
  { const md = fs.readFileSync(path.join(root, 'docs', 'AUDIT_PRODUITS.md'), 'utf8');
    const missing = await pg.evaluate(() => Object.keys(window.WSE.PRODUCTS).concat(Object.keys(window.WSE.GOODS)));
    const nf = missing.filter(k => md.indexOf('| `' + k + '` ') < 0);
    t.check('docs/AUDIT_PRODUITS.md : une ligne par produit et par bien (image, fidélité, action)', nf.length === 0, nf.slice(0, 6).join(', '));
    const ret = fs.readFileSync(path.join(root, '..', 'tools', 'factory_ai', 'RETOURS.md'), 'utf8');
    t.check('RETOURS.md : commande Cowork des photos produits et des fermes (n° 11)', /COMMANDE DE L'INTÉGRATEUR AU PRODUCTEUR n° 11/.test(ret) && REPLI.filter(k => !['basic', 'std', 'lux'].includes(k)).every(k => ret.indexOf('`' + k + '.jpg`') >= 0), ''); }

  // B. fermes
  const B = await pg.evaluate(({ FARMS }) => {
    const W = window.WSE, S = W.S, N = W.N, F = W.farmFx, o = { placed: [], bad: [], out: [], herdOut: [], moved: {}, zone: [], far: [] };
    const used = new Set(), free = (x, y) => { for (let dy = -2; dy < 4; dy++) for (let dx = -2; dx < 4; dx++) if (used.has((x + dx) + ',' + (y + dy))) return false; return true; };
    FARMS.forEach(k => {
      const g = W.TYPES[k].ext, crop = W.CROPS[g] === k; let c = null;
      for (let i = 0; i < N * N && !c; i++) { const x = i % N, y = (i / N) | 0, d = S.dep[i]; if (crop ? !(d && d.k === g) : !!d) continue; if (!free(x, y) || W.footprintError(x, y, k)) continue; if (W.place(x, y, k)) { c = S.grid[i]; for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) used.add((x + dx) + ',' + (y + dy)); } }
      if (!c) return; o.placed.push(k);
      F.zone(c).forEach(q => { if (!(q[0] >= 0 && q[0] <= c.w && q[1] >= 0 && q[1] <= c.h)) o.zone.push(k); });
      const iso = (x, y) => ({ x: (x - y) * 66, y: (x + y) * 33 }), L = iso(c.x, c.y + c.h).x, R = iso(c.x + c.w, c.y).x, Tp = iso(c.x, c.y).y, Bt = iso(c.x + c.w, c.y + c.h).y;
      for (const now of [0, 1234, 98765, 3.6e6]) for (const zz of [1.3, 0.6]) {
        const r = F.probe(c, now, zz); if (r.bad) o.bad.push(k + '@' + now);
        if (r.box[0] < 1e8 && (r.box[0] < L - 2 || r.box[2] > R + 2 || r.box[3] > Bt + 2 || r.box[1] < Tp - 70)) o.out.push(k + ' ' + r.box.map(Math.round).join(','));
      }
      if (F.HERD[k]) { const h0 = F.herd(c, 0), h1 = F.herd(c, 2500); if (h0.length < 4) o.herdOut.push(k + ' ' + h0.length + ' bêtes');
        h0.concat(h1).forEach(q => { if (!(q[4] > 0 && q[4] < c.w && q[5] > 0 && q[5] < c.h) || !F.inPoly(F.zone(c), q[4], q[5])) o.herdOut.push(k + ' hors zone'); });
        o.moved[k] = h0.some((q, i) => h1[i] && Math.hypot(q[1] - h1[i][1], q[2] - h1[i][2]) > 0.5); }
      if (F.probe(c, 500, 0.3).box[0] < 1e8) o.far.push(k);
    });
    o.det = JSON.stringify(F.herd(S.grid.find(c => c && c.t === 'fcattle'), 4321)) === JSON.stringify(F.herd(S.grid.find(c => c && c.t === 'fcattle'), 4321));
    return o; }, { FARMS });
  t.check(`fermes posées (${B.placed.length}/${FARMS.length})`, B.placed.length === FARMS.length, B.placed.join(','));
  t.check('zones utiles des sprites inscrites dans l\'emprise (élevages 2×2, cultures 3×3)', B.zone.length === 0, B.zone.join(','));
  t.check('effets vivants (champs, vigne, troupeaux) : aucune valeur non finie, 4 instants, 2 zooms', B.bad.length === 0, B.bad.slice(0, 4).join(', '));
  t.check('effets dessinés dans l\'emprise (losange de la ferme, tiges et bêtes au plus 70 px au-dessus)', B.out.length === 0, B.out.slice(0, 3).join(' ; '));
  t.check('troupeaux : au moins 4 bêtes, toutes dans le pré de la ferme', B.herdOut.length === 0, B.herdOut.slice(0, 4).join(', '));
  t.check('troupeaux animés (les bêtes bougent en 2,5 s) et déterministes', Object.values(B.moved).every(Boolean) && Object.keys(B.moved).length === 4 && B.det, JSON.stringify(B.moved));
  t.check('vue éloignée (zoom < 0,4) : rien n\'est ajouté au sprite', B.far.length === 0, B.far.join(','));

  // B2. rendu réel au zoom rapproché pendant 1,5 s : 0 erreur, le champ de blé change entre deux images (vent)
  const R = await pg.evaluate(async () => {
    const W = window.WSE, S = W.S; const c = S.grid.find(c => c && c.t === 'fwheat'); W.setSpeed(0); W.zoomTo(1.3, 640, 450, { x: c.x + 1, y: c.y + 1 }); await new Promise(r => setTimeout(r, 500)); W.centerOn(c.x + 0.5, c.y + 0.5);
    const cv = document.getElementById('view'), grab = () => { const g = document.createElement('canvas'); g.width = 200; g.height = 120; g.getContext('2d').drawImage(cv, cv.width / 2 - 200, cv.height / 2 - 120, 400, 240, 0, 0, 200, 120); return g.getContext('2d').getImageData(0, 0, 200, 120).data; };
    await new Promise(r => setTimeout(r, 300)); const a = grab(); await new Promise(r => setTimeout(r, 900)); const b = grab(); let d = 0; for (let i = 0; i < a.length; i += 4) d += Math.abs(a[i] - b[i]) > 12 ? 1 : 0;
    const t0 = performance.now(); let n = 0; const cc = S.grid.find(c => c && c.t === 'fwheat'); for (; n < 30; n++) W.farmFx.probe(cc, n * 33, 1.3); const ms = (performance.now() - t0) / n;
    return { d, ms }; });
  t.check('blé au zoom rapproché : le champ ondule (pixels qui changent entre deux images)', R.d > 150, `${R.d} pixels`);
  t.range('coût d\'un champ de blé dense par image (ms, contexte enregistreur)', R.ms, 0, 12, ' ms', 2);
  t.check('page : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(';'));
  await pg.context().close();
};
