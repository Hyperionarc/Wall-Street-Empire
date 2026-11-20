// Passe 75 : gamme resserrée (demande de Rémy). Les chips de maïs (cornchips) sont retirées : l'huile de table est LE dérivé du maïs et du colza ;
// la seule viande ovine vendue est l'AGNEAU (jamais « mouton » côté consommateur) ; les familles de magasin (PRODUCT_FAMILY) restent cohérentes ;
// une ancienne sauvegarde réelle (fixture produite par l'ancien build : chips lancées, usine, stock, rayon, brevet, classements) se charge proprement.
const fs = require('fs'), path = require('path');
exports.name = 'Gamme resserrée (passe 75)';

exports.run = async (t, L) => {
  const root = path.resolve(__dirname, '..', '..');
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);

  // 1. Données : cornchips absent de toutes les tables, PROD_RETIRED renseigné
  const D = await pg.evaluate(() => {
    const W = window.WSE, k = 'cornchips', o = { left: [] };
    const tabs = { PRODUCTS: W.PRODUCTS, P25: W.P25, PROD_W: W.PROD_W, NECESS: W.NECESS, DEMAND_PC: W.DEMAND_PC, MEGA_OF: W.MEGA_OF, OBSO: W.OBSO, PROD_TECH: W.PROD_TECH, TECH_SHARE: W.TECH_SHARE, GLY: W.GLY, prod: W.S.prod };
    Object.keys(tabs).forEach(n => { if (tabs[n] && tabs[n][k] != null) o.left.push(n); });
    Object.keys(W.spec.PF).forEach(f => { if (W.spec.PF[f].includes(k)) o.left.push('PRODUCT_FAMILY.' + f); });
    o.nProd = Object.keys(W.PRODUCTS).filter(x => !/^c[pd]?\d/.test(x) && !W.PRODUCTS[x].custom).length;
    o.ret = W.PROD_RETIRED && W.PROD_RETIRED[k]; o.uc = W.retiredUnitCost ? W.retiredUnitCost(k) : NaN;
    o.oil = !!W.PRODUCTS.tableoil && W.PRODUCTS.tableoil.in.cookoil > 0 && W.famOf('tableoil') === 'Alimentation' && W.spec.famOf('tableoil') === 'food';
    o.cornUse = Object.keys(W.PRODUCTS).filter(x => W.PRODUCTS[x].in.corn > 0).concat(Object.keys(W.RECIPES).filter(x => W.RECIPES[x].in.corn > 0));
    return o;
  });
  t.check('chips de maïs absentes de toutes les tables (produits, poids, nécessité, demande, méga-classe, obsolescence, technologies, vignette, familles, état)', D.left.length === 0, D.left.join(', '));
  t.check(`gamme : ${D.nProd} produits finis (95 - chips de maïs)`, D.nProd === 94, '');
  t.check('PROD_RETIRED : chips de maïs, remplacées par l\'huile de table (même classe), coût de revient historique positif', D.ret && D.ret.to === 'tableoil' && D.ret.cls === 'basic' && D.uc > 1 && D.uc < 6, `${D.uc && D.uc.toFixed(3)} $/u`);
  t.check('huile de table : LE dérivé du maïs et du colza (alimentation, magasin food) ; le maïs ne sert plus qu\'à l\'huile de cuisine', D.oil && D.cornUse.join() === 'cookoil', D.cornUse.join(','));

  // 2. Ovin : l'agneau seul côté consommateur
  const O = await pg.evaluate(async () => {
    const W = window.WSE, o = {};
    o.ovine = Object.keys(W.PRODUCTS).filter(k => W.PRODUCTS[k].in.lamb > 0);
    o.name = W.PRODUCTS.lambmeat && W.PRODUCTS.lambmeat.name; o.desc = W.PRODUCTS.lambmeat && W.PRODUCTS.lambmeat.desc;
    o.mutton = Object.keys(W.PRODUCTS).filter(k => /mouton|mutton|ovin/i.test(k + ' ' + W.PRODUCTS[k].name) || /\bmouton/i.test(W.PRODUCTS[k].desc.replace(/jamais de mouton/i, '')));
    o.goodsMutton = Object.keys(W.GOODS).filter(k => /mouton|mutton/i.test(k + ' ' + W.GOODS[k].name));
    o.lambGood = W.GOODS.lamb && W.GOODS.lamb.name; o.wool = !!W.GOODS.wool && W.TYPES.fsheep.ext === 'wool' && W.TYPES.fsheep.co.lamb > 0;
    W.openGuide('lambmeat'); await new Promise(r => setTimeout(r, 250)); const g = document.getElementById('gview'); o.guide = g ? g.innerText : '';
    return o;
  });
  t.check('une seule viande ovine vendue : l\'agneau (lambmeat), libellé « Agneau »', O.ovine.join() === 'lambmeat' && /^Agneau$/.test(O.name) && /agneau/i.test(O.desc), `${O.ovine.join(',')} · ${O.name}`);
  t.check('aucun produit ni bien vendu sous le nom « mouton » (la laine reste un coproduit de l\'élevage)', O.mutton.length === 0 && O.goodsMutton.length === 0 && /Agneau/.test(O.lambGood) && O.wool, O.mutton.concat(O.goodsMutton).join(','));
  t.check('Guide du fabricant : fiche « Agneau » sans « mouton »', /Agneau/.test(O.guide) && !/viande de mouton|\bMouton\b/.test(O.guide), O.guide.slice(0, 80).replace(/\n/g, ' '));

  // 3. Familles de magasin cohérentes
  const F = await pg.evaluate(() => {
    const W = window.WSE, PF = W.spec.PF, seen = {}, o = { dup: [], unknown: [], missing: [], empty: [], famDisp: [] };
    Object.keys(PF).forEach(f => { if (!PF[f].length) o.empty.push(f); PF[f].forEach(k => { if (!W.PRODUCTS[k]) o.unknown.push(k); if (seen[k]) o.dup.push(k); seen[k] = f; }); });
    Object.keys(W.PRODUCTS).filter(k => !W.PRODUCTS[k].custom && !/^c[pd]?\d/.test(k)).forEach(k => { if (!seen[k]) o.missing.push(k); if (W.famOf(k) === 'Autres') o.famDisp.push(k); });
    return o;
  });
  t.check('PRODUCT_FAMILY : chaque produit dans exactement une famille, aucune clé inconnue, aucune famille vide ; famille d\'affichage pour tous', !F.dup.length && !F.unknown.length && !F.missing.length && !F.empty.length && !F.famDisp.length, JSON.stringify(F));

  // 4. Migration pure (rivaux, usines des rivaux, e-commerce, boutique duty free) sur un objet de sauvegarde fabriqué
  const M = await pg.evaluate(() => {
    const W = window.WSE, d = { cash: 100, prod: { cornchips: { stock: 80 }, tableoil: { stock: 5 } }, g: [['f1', 0.1, 0, 1, 'cornchips'], ['s2', 0.2, 0, 1, 0, 1, 1, 0, 0, 1, 0, [], [0, 0, 0, 0], [1, 1, ['cornchips', 'bread']], 0, 0, 0, 0, 0, 0, { inv: { cornchips: 16, bread: 3 }, pk: { cornchips: 1.1 } }]],
      rivals: [{ id: 'r1', fl: { k: 'cornchips', cls: 'basic', d: 0.9 }, fab: [{ pk: 'cornchips', cls: 'basic', cap: 30 }, { pk: 'bread', cls: 'basic', cap: 9 }] }], pat: { cornchips: { until: 9 } }, ecom: { off: ['cornchips', 'bread'] }, air: { off: { cornchips: 1, bread: 1 } } };
    const r = W.retiredMigrate(d), uc = W.retiredUnitCost('cornchips');
    return { r, d: JSON.stringify(d), cashOk: d.cash === 100 + Math.round(96 * uc), fl: d.rivals[0].fl, fab: d.rivals[0].fab.map(f => f.pk), r4: d.g[0][4], shelf: d.g[1][13][2], inv: d.g[1][20].inv, again: W.retiredMigrate(d).n };
  });
  t.check('migration : stock (entrepôt + rayons) revendu au coût historique, usine sans produit, rayons et prix nettoyés', M.cashOk && M.r.units === 96 && M.r4 === 0 && M.shelf.join() === 'bread' && M.inv.cornchips == null && M.inv.bread === 3, JSON.stringify(M.r));
  t.check('migration : produit phare et usine du rival reportés sur l\'huile de table ; e-commerce, duty free et brevets nettoyés ; idempotente', M.fl.k === 'tableoil' && M.fl.d === 0.9 && M.fab.join() === 'tableoil,bread' && M.d.indexOf('cornchips') < 0 && M.again === 0, M.d.slice(0, 160));

  // 5. Ancienne sauvegarde RÉELLE (ancien build : chips lancées et fabriquées, stock 1 200 u, rayon de 500 u, brevet, classements, pédagogie)
  { const save = fs.readFileSync(path.join(__dirname, 'fixtures', 'save_v8_avec_cornchips.json'), 'utf8'), old = JSON.parse(save);
    const b = await L.browser(), ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('wse_fx')) { localStorage.setItem('wse-city-v8', s); sessionStorage.setItem('wse_fx', '1'); } } catch (e) { } }, save);
    const p5 = await L.newPage({ ctx, wait: 300 }); await p5.evaluate(() => window.WSE.setSpeed(0)); await L.inject(p5);
    const r = await p5.evaluate(({ oldCash }) => {
      const W = window.WSE, S = W.S, T = window.T, o = { day: S.day, ret: S.retired || null, nb: T.bldgs().length };
      o.cashDelta = S.cash - oldCash; o.idle = T.bldgs().filter(c => /^f\d/.test(c.t) && !c.prod).length;
      const js = JSON.stringify(S, (k, v) => (k === 'grid' || k === 'dep' || k === 'retired') ? undefined : v); o.leftS = (js.match(/cornchips/g) || []).length;
      o.leftGrid = S.grid.filter(c => c && c.t !== 'npc' && (c.prod === 'cornchips' || (c.inv && c.inv.cornchips != null) || (c.pk && c.pk.cornchips != null) || (c.shelf && c.shelf.cornchips != null))).length;
      W.openGuide('tableoil'); const d0 = S.day; T.stepN(30, true); o.adv = S.day - d0; o.bad = T.scan(); W.save(); const raw = localStorage.getItem('wse-city-v8'); o.resaved = (raw.match(/cornchips/g) || []).length;
      try { if (W.setPview) W.setPview(true); const pv = document.getElementById('pview'), tx = pv ? pv.innerText : ''; if (/NaN|undefined|Chips de maïs/.test(tx)) o.viewErr = 'écran Produits : ' + tx.match(/NaN|undefined|Chips de maïs/)[0]; } catch (e) { o.viewErr = e.message; }
      return o; }, { oldCash: old.cash });
    t.check('ancienne sauvegarde avec chips de maïs : chargée (même jour, bâtiments conservés)', r.day === old.day && r.nb >= 10 && !!r.ret, `jour ${r.day}/${old.day} · ${r.nb} bâtiments`);
    const uc = D.uc, exp = Math.round(1700 * uc);
    t.check('stock des chips (1 200 u en entrepôt + 500 u en rayon) converti en trésorerie au coût de revient historique', r.ret && Math.round(r.ret.units) === 1700 && r.ret.cash === exp && Math.abs(r.cashDelta - exp) <= 1, `${r.ret && r.ret.units} u · ${r.ret && r.ret.cash} $ attendu ${exp} $ · Δ trésorerie ${Math.round(r.cashDelta)} $`);
    t.check('plus aucune trace des chips (état, usines, rayons, prix, brevets, classements) ; usine remise sans produit', r.leftS === 0 && r.leftGrid === 0 && r.idle >= 1, `état ${r.leftS} · cases ${r.leftGrid} · usines sans produit ${r.idle}`);
    t.check('ancienne sauvegarde : 30 jours sans NaN, réenregistrée sans chips, 0 pageerror', r.adv === 30 && r.bad.length === 0 && r.resaved === 0 && !r.viewErr && p5.errs.length === 0, `${r.bad.slice(0, 2).join(';')} · ${(r.viewErr || '')} · ${p5.errs.slice(0, 2).join(';')}`);
    await ctx.close(); }

  { const tpl = fs.readFileSync(path.join(root, 'game.template.html'), 'utf8').split('\n').filter(l => /cornchips/.test(l) && !/PROD_RETIRED|^\s*\/\//.test(l));
    t.check('game.template.html : cornchips ne subsiste que dans PROD_RETIRED (et les commentaires)', tpl.length === 0, tpl.map(l => l.trim().slice(0, 60)).join(' | ')); }

  // 6. Documentation : proposition de gamme pour Rémy, audit et catalogue à jour, commande d'images sans chips
  { const g = path.join(root, 'docs', 'GAMME_PRODUITS.md'), md = fs.existsSync(g) ? fs.readFileSync(g, 'utf8') : '';
    t.check('docs/GAMME_PRODUITS.md : tableau produit | raison | impact, biocarburant proposé à la suppression', /\| produit \| raison \| impact \|/i.test(md) && /`biofuel`/.test(md) && /`cornchips`/.test(md), `${md.length} car.`);
    const au = fs.readFileSync(path.join(root, 'docs', 'AUDIT_PRODUITS.md'), 'utf8'), cat = fs.readFileSync(path.join(root, 'docs', 'CATALOGUE.md'), 'utf8');
    t.check('AUDIT_PRODUITS.md et CATALOGUE.md : plus de ligne cornchips, 94 produits', au.indexOf('| `cornchips`') < 0 && cat.indexOf('`cornchips` |') < 0 && /Produits finis : 94/.test(au) && /Produits finis : 94/.test(cat), '');
    const pj = JSON.parse(fs.readFileSync(path.join(root, '..', 'tools', 'factory_ai', 'photos_guide.json'), 'utf8'));
    t.check('photos_guide.json : plus de sujet cornchips', !pj.sujets.cornchips, ''); }

  t.check('page principale : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(';'));
  await pg.context().close();
};
