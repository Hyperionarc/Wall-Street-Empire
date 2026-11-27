// Économie de marché, lot 1 (retour de Rémy) : l'emballage a une MATIÈRE.
//  1. « Un emballage ne contient pas de pétrole par définition » : papier et carton ← bois ; plastique ← pétrole ; verre ← sable et silice ; métal ← bauxite ;
//  2. chaque produit a son emballage naturel (pain : nu ou papier ; œufs et lait : carton ; bière : verre ; poulet : barquette plastique) ;
//  3. le joueur choisit la matière (coût, attrait) et la chaîne planifiée (feuilles de l'arbre, devis, Guide) suit ce choix ;
//  4. l'emballage coûte une petite part du produit (avant : un emballage à 7 $ pour une boîte d'œufs à 6 $) ;
//  5. sauvegarde : la matière choisie (ps.pm, champ facultatif) est relue.
exports.name = 'Emballages par matière (papier, plastique, verre, métal)';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 600 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
  const r = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, o = {}, val = (pk, g) => { const inp = W.productInputs(pk); return (inp[g] || 0) * W.GOODS[g].base; };
    o.recPack = Object.keys(W.RECIPES.pack.in); o.packName = W.GOODS.pack.name;
    o.breadLaunch = (W.launchProduct('bread'), { pack: S.prod.bread.pack, inp: Object.keys(W.productInputs('bread')), leaves: W.chainLeaves('bread') });
    S.prod.bread.pack = 1; o.breadStd = { inp: Object.keys(W.productInputs('bread')), leaves: W.chainLeaves('bread') }; S.prod.bread.pack = 0;
    o.eggs = { inp: W.productInputs('eggs'), leaves: W.chainLeaves('eggs'), packV: val('eggs', 'paper'), coreV: val('eggs', 'egg') };
    o.milk = Object.keys(W.productInputs('drinkmilk')); o.beer = Object.keys(W.productInputs('beer')); o.chicken = Object.keys(W.productInputs('chicken')); o.perfume = Object.keys(W.productInputs('perfume'));
    const a0 = W.eco.attractiveness('soda'); o.soda0 = { inp: Object.keys(W.productInputs('soda')), leaves: W.chainLeaves('soda') };
    S.prod.soda.pm = 'glass'; o.sodaGlass = { inp: Object.keys(W.productInputs('soda')), leaves: W.chainLeaves('soda'), attr: W.eco.attractiveness('soda') / a0 };
    S.prod.soda.pm = 'metal'; o.sodaMetal = Object.keys(W.productInputs('soda'));
    S.prod.eggs.pm = 'glass'; o.eggsGlass = W.eco.attractiveness('eggs'); S.prod.eggs.pm = 'paper'; o.eggsPaper = W.eco.attractiveness('eggs');
    // le devis « Construire cette chaîne » des œufs : aucune ligne pétrole
    const P = W.producePlan('eggs', { scope: 'all' }); o.plan = P.rows.map(x => x.label).join(' | ');
    // part de l'emballage dans le coût des intrants (tous les produits emballés)
    let worst = 0, wk = ''; W.PKEYS.forEach(pk => { const pr = W.PRODUCTS[pk]; if (pr.cls === 'estate' || pr.custom) return; const inp = W.productInputs(pk); let tot = 0; Object.keys(inp).forEach(g => { tot += inp[g] * (W.GOODS[g] ? W.GOODS[g].base : 0); });
      const pv = pr.out * pr.pv * (S.prod[pk].pack ? 1 : 0) * 1.8; if (tot > 0 && pv / tot > worst) { worst = pv / tot; wk = pk; } }); o.worst = [worst, wk];
    S.prod.soda.pm = 'glass'; W.save(); const sv = JSON.parse(localStorage.getItem('wse-city-v8')); o.saved = sv.prod.soda.pm;
    return o;
  });
  t.check('le bien « pack » est l\'emballage plastique, fait de plastique seul (plus de bois dans le plastique)', r.recPack.join() === 'plastic' && /plastique/i.test(r.packName), r.recPack.join() + ' · ' + r.packName);
  t.check('pain lancé : vendu nu, aucun emballage, chaîne sans pétrole', r.breadLaunch.pack === 0 && r.breadLaunch.inp.join() === 'flour' && r.breadLaunch.leaves.indexOf('oil') < 0, JSON.stringify(r.breadLaunch));
  t.check('pain en emballage standard : sac papier, issu du bois (pas du pétrole)', r.breadStd.inp.indexOf('paper') >= 0 && r.breadStd.leaves.indexOf('wood') >= 0 && r.breadStd.leaves.indexOf('oil') < 0, JSON.stringify(r.breadStd));
  t.check('œufs : boîte en carton (papier ← bois), aucun pétrole dans la chaîne', r.eggs.inp.paper > 0 && !r.eggs.inp.pack && r.eggs.leaves.indexOf('wood') >= 0 && r.eggs.leaves.indexOf('oil') < 0, JSON.stringify(r.eggs.leaves));
  t.check('l\'emballage des œufs coûte une petite part de l\'ingrédient (< 20 %)', r.eggs.packV < 0.2 * r.eggs.coreV, `${r.eggs.packV.toFixed(0)} $ contre ${r.eggs.coreV.toFixed(0)} $ par cycle`);
  t.check('matières naturelles : lait en brique carton, bière en verre, poulet en barquette plastique, parfum en flacon de verre', r.milk.indexOf('paper') >= 0 && r.beer.indexOf('glass') >= 0 && r.chicken.indexOf('pack') >= 0 && r.perfume.indexOf('glass') >= 0, [r.milk, r.beer, r.chicken, r.perfume].map(x => x.join('+')).join(' / '));
  t.check('le joueur choisit la matière : soda en plastique → verre (sable, silice, plus de pétrole pour l\'emballage) → canette (aluminium)', r.soda0.inp.indexOf('pack') >= 0 && r.sodaGlass.inp.indexOf('glass') >= 0 && r.sodaGlass.inp.indexOf('pack') < 0 && r.sodaGlass.leaves.indexOf('silica') >= 0 && r.sodaMetal.indexOf('aluminium') >= 0, JSON.stringify([r.soda0.inp, r.sodaGlass.inp, r.sodaMetal]));
  t.check('image : le verre valorise le soda ; une matière inhabituelle (œufs en bocal de verre) n\'apporte pas plus qu\'une habituelle', r.sodaGlass.attr > 1 && r.eggsGlass <= r.eggsPaper * 1.02, `soda verre ×${r.sodaGlass.attr.toFixed(3)} ; œufs verre ${r.eggsGlass.toFixed(3)} / papier ${r.eggsPaper.toFixed(3)}`);
  t.check('devis de la chaîne des œufs : aucun puits de pétrole', !/pétrole/i.test(r.plan), r.plan.slice(0, 300));
  t.range('part maximale de l\'emballage (coffret le plus cher) dans le coût des intrants d\'un produit', 100 * r.worst[0], 0, 45, ' %');
  t.check('sauvegarde : la matière choisie est enregistrée', r.saved === 'glass', String(r.saved));
  t.check('0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
  await pg.context().close();
};
