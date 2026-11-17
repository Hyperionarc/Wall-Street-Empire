// Passe 39 : achat/revente d'actions d'un rival en boucle ne crée plus d'argent (l'ordre s'exécute au cours moyen du déplacement).
exports.name = 'Pas d\'argent gratuit en bourse (passe 39)';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e7 });
  const r = await pg.evaluate(() => { const W = window.WSE, S = W.S, id = (S.rivals || [])[0] && S.rivals[0].id; if (!id) return { err: 'aucun rival' }; const c0 = S.cash; let maxLoop = -1e18;
    for (let i = 0; i < 100; i++) { const c = S.cash; W.tradeShares(id, 2000, true); W.tradeShares(id, 2000, false); maxLoop = Math.max(maxLoop, S.cash - c); }
    return { gain: S.cash - c0, maxLoop }; });
  t.check('aucune boucle achat/vente ne rapporte d\'argent', !r.err && r.maxLoop <= 0, JSON.stringify(r));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.join(' | '));
};
