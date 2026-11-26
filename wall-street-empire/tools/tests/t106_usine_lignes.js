// Passe 102 ter (retour de Rémy sur l'abattoir) : lignes de production parallèles par variante.
//  Une usine à trois lignes (porc, bœuf, volaille) : chaque ligne consomme SON intrant et produit SA viande ; un goulot sur une ligne (plus de bœuf)
//  n'arrête pas les autres ; le débit total est la somme des lignes ; ventes distinctes par produit ; ajout d'une ligne = une machine payée ; sauvegarde.
exports.name = 'Usine : lignes parallèles par variante';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
  const r = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, f = T.inP('f1'), sh = T.inC('s2'); W.easyLaunch(f, 'porkmeat'); W.shopUI.act(sh, 'mkput:0:porkmeat');
    const cash0 = S.cash, c1 = W.lines.cands(f); W.bAct; const okB = W.lines.add(f, 'beefmeat'), okC = W.lines.add(f, 'chicken'); const paid = cash0 - S.cash;
    ['beefmeat', 'chicken'].forEach((pk, i) => W.shopUI.act(sh, 'mkput:' + (i + 1) + ':' + pk)); ['porkmeat', 'beefmeat', 'chicken'].forEach(pk => { if (S.prod[pk].buy) S.prod[pk].buy = null; });   // le rayon vit de la production
    const feed = () => { S.stock.pork = 1e5; S.stock.poultry = 1e5; }; let A = {}, B = {};
    for (let d = 0; d < 6; d++) { feed(); S.stock.beef = 1e5; W.step(); } feed(); S.stock.beef = 1e5; W.step(); A = { lines: f._lines.map(x => [x.pk, Math.round(x.out)]), out: f.out, sales: ['porkmeat', 'beefmeat', 'chicken'].map(k => (sh.sales && sh.sales[k]) || 0) };
    f.src = Object.assign({}, f.src || {}, { beef: 'local' }); S.stock.beef = 0; feed(); W.step();   // goulot : plus de bœuf (pas d'import)
    B = { lines: f._lines.map(x => [x.pk, Math.round(x.out), x.limit]), out: f.out };
    W.save(); return { c1, okB, okC, paid, A, B, x: f.x, y: f.y, ln: f.lines };
  });
  t.check('ajout de lignes depuis l\'usine (variantes de la même famille), chacune payée comme une machine', r.okB && r.okC && r.paid > 0 && r.c1.indexOf('beefmeat') >= 0 && r.c1.indexOf('chicken') >= 0, JSON.stringify({ paid: r.paid, ln: r.ln }));
  const s = r.A.lines.reduce((a, x) => a + x[1], 0);
  t.check('trois lignes produisent chacune leur viande ; débit total = somme des lignes', r.A.lines.length === 3 && r.A.lines.every(x => x[1] > 0) && Math.abs(s - r.A.out) <= 3, JSON.stringify(r.A.lines) + ' total ' + Math.round(r.A.out));
  t.check('ventes distinctes par produit dans le magasin', r.A.sales.every(v => v > 0), JSON.stringify(r.A.sales));
  const beef = r.B.lines.find(x => x[0] === 'beefmeat'), oth = r.B.lines.filter(x => x[0] !== 'beefmeat');
  t.check('goulot sur la ligne bœuf (plus de carcasses) : elle s\'arrête, les lignes porc et volaille continuent', beef && beef[1] === 0 && beef[2] === 'beef' && oth.every(x => x[1] > 0), JSON.stringify(r.B.lines));
  const ctx = pg.context(), p2 = await ctx.newPage(); await p2.goto(L.URL); await p2.waitForTimeout(800);
  const re = await p2.evaluate(p => { const W = window.WSE, c = W.S.grid[p.y * W.N + p.x]; return c && c.lines; }, r);
  t.check('sauvegarde : les lignes sont relues (une usine sans lignes reste à une seule ligne)', JSON.stringify(re) === JSON.stringify(r.ln), JSON.stringify(re));
  t.check('0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
  await ctx.close();
};
