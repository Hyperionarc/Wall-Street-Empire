// Passe 102 ter : ressorts de défi de la chaîne (déterministes) et BFR de la société.
//  1. aucun fournisseur défaillant avant le jour 30 (début accueillant) ;
//  2. un grossiste peut faire défaut quelques jours : le lien casse, le stock s'épuise (rupture), « Réparer les liens » relie au meilleur fournisseur et les ventes reprennent ;
//  3. déterminisme : mêmes jours de défaillance d'une partie à l'autre ;
//  4. BFR de la société = stocks au coût livré, affiché dans la fiche société.
exports.name = 'Chaîne : fournisseurs défaillants, réparation, BFR';
exports.run = async (t, L) => {
  const scan = async () => { const pg = await L.newPage({ wait: 600 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
    const r = await pg.evaluate(() => { const W = window.WSE, S = W.S, out = []; const d0 = S.day; for (let d = 0; d < 400; d++) { S.day = d; W.mk.inv(); W.PKEYS.slice(0, 40).forEach(pk => { const o = W.mk.offers(pk).find(x => x.kind === 'pnj' && x.fail); if (o) out.push(d + ':' + pk); }); } S.day = d0; W.mk.inv(); return out; });
    await pg.context().close(); return r; };
  const a = await scan(), b = await scan();
  t.check('aucune défaillance avant le jour 30 ; des défaillances ensuite (quelques jours)', a.length > 0 && a.every(x => +x.split(':')[0] >= 30), a.slice(0, 6).join(' '));
  t.check('déterminisme : mêmes défaillances d\'une partie à l\'autre', a.join() === b.join(), `${a.length} / ${b.length}`);
  const fail = a.find(x => ['bread', 'eggs', 'chicken', 'drinkmilk', 'pasta', 'tableoil', 'soap', 'tshirt'].indexOf(x.split(':')[1]) >= 0) || a[0], [fd, fpk] = [+fail.split(':')[0], fail.split(':')[1]];
  const pg = await L.newPage({ w: 1280, h: 800, wait: 600 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
  const r = await pg.evaluate(([fd, fpk]) => { const W = window.WSE, S = W.S, T = window.T, c = T.inC('s2'); c.slots = Array(8).fill(null);
    W.shopUI.act(c, 'mkput:0:' + fpk); W.shopUI.act(c, 'sup:' + fpk + ':loc'); while (S.day < fd - 8) W.step();
    let rup = 0; for (let d = 0; d < 14 && !(S.prod[fpk].stock < 1); d++) W.step(); rup = S.prod[fpk].stock < 1 ? 1 : 0; const brk = S.prod[fpk]._brk;
    W.openBuilding(c.x, c.y); const btn = !!document.querySelector('#bview [data-act="netfix"]'); const n = W.netFix(); const id = S.prod[fpk].buy.id; let sold = 0; for (let d = 0; d < 6; d++) { W.step(); sold += (c.sales && c.sales[fpk]) || 0; }
    const B = W.bfrTotal(); return { fd, fpk, rup, brk, btn, n, id, sold, bfr: B.v, days: B.d }; }, [fd, fpk]);
  t.check('fournisseur défaillant : lien cassé, rupture, bouton « Réparer les liens » ; la réparation relie un autre fournisseur et les ventes reprennent', r.rup && r.brk && r.btn && r.n >= 1 && r.id !== 'loc' && r.sold > 0, JSON.stringify(r));
  t.check('BFR de la société mesuré (stocks au coût, en jours de ventes)', r.bfr > 0 && Number.isFinite(r.days), JSON.stringify({ bfr: r.bfr, days: r.days }));
  t.check('0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
  await pg.context().close();
};
