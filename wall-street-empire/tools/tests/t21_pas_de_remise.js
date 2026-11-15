// La « remise à niveau » (100 M$, capitalisation 1 Md$) ne doit jamais se déclencher dans une nouvelle partie : une trésorerie négative reste une vraie difficulté.
exports.name = 'Pas de remise à niveau en nouvelle partie';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const r = await pg.evaluate(() => { const W = window.WSE, S = W.S; S.cash = -5e6; S.loan = 3e6; const c0 = S.cash; for (let i = 0; i < 5; i++) W.step(); return { c0, c: S.cash, loan: S.loan, fix1: S.fix1, cap: S.capAdj || 0 }; });
  t.check('trésorerie négative en nouvelle partie : pas de cadeau de 100 M$, dette conservée, capitalisation non ajustée', r.c < 1e7 && r.loan > 0 && r.fix1 === 1 && r.cap === 0, JSON.stringify(r));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
