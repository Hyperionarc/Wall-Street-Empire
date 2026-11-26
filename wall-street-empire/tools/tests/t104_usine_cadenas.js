// Passe 102 ter (retour de Rémy : « les cadenas de l'usine ne répondent pas ») : chaque emplacement verrouillé du plan d'usine s'achète d'un clic.
//  1. usine en manque de capacité de sortie (une seule porte de vente) : clic sur le cadenas d'une porte de SORTIE → trésorerie débitée, porte équipée, débit de vente en hausse ;
//  2. aucun cadenas inerte : chaque emplacement verrouillé propose « Débloquer » avec son coût (panneau) et une info-bulle qui dit quoi faire ;
//  3. fonds insuffisants : message clair (ce qu'il manque), rien n'est débité ;
//  4. sauvegarde : l'emplacement acheté reste ouvert après rechargement.
exports.name = 'Usine : cadenas cliquables (achat d\'emplacements)';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e7 }); await L.inject(pg);
  const r = await pg.evaluate(async () => {
    const W = window.WSE, S = W.S, T = window.T, K = W.chain, f = T.inP('f1'); W.easyLaunch(f, 'bread'); for (let d = 0; d < 3; d++) W.step();
    const pl = W.planOf(f), sells = pl.map((k, i) => k === 'sell' ? i : -1).filter(i => i >= 0); sells.slice(1).forEach(i => W.planDel(f, i));   // une seule porte de vente
    const locked = []; for (let i = 0; i < 12; i++) if (!K.slotOpen(f, i)) locked.push(i);
    W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 200));
    const cash0 = S.cash; S.cash = K.unlockCost(f) * 3;   // trésorerie modeste : le clic ouvre la confirmation au lieu d'acheter d'office
    const inert = []; locked.forEach(i => { W.bAct('plansel:' + i); if (K.slotOpen(f, i)) return; const h = document.getElementById('bview').innerHTML; if (h.indexOf('planunlock:' + i) < 0) inert.push(i); });
    S.cash = cash0;
    const door = locked.find(i => i >= 9) != null ? locked.find(i => i >= 9) : null;
    const before = { cash: S.cash, real: W.planEvalC(f).flow, sell: W.planOf(f).filter(k => k === 'sell').length, lim: W.planEvalC(f).lim };
    S.cash = 1000; const poor = K.planUnlock(f, door != null ? door : locked[0], true), poorJr = (S.jr || []).slice(-1)[0], cashPoor = S.cash; S.cash = before.cash;
    if (door != null) W.bAct('planunlock:' + door);
    const after = { cash: S.cash, real: W.planEvalC(f).flow, sell: W.planOf(f).filter(k => k === 'sell').length, open: door != null && K.slotOpen(f, door) };
    W.save(); return { locked, inert, door, before, after, poor, poorMsg: poorJr ? poorJr.t : '', cashPoor, x: f.x, y: f.y, cost: K.unlockCost(f) };
  });
  t.check('l\'usine a des emplacements verrouillés dont une porte de sortie', r.locked.length > 0 && r.door != null, JSON.stringify(r.locked));
  t.check('aucun cadenas inerte : chaque emplacement verrouillé propose « Débloquer » avec son coût', r.inert.length === 0, JSON.stringify(r.inert));
  t.check('fonds insuffisants : refus expliqué (ce qu\'il manque), rien n\'est débité', r.poor === false && /il manque/.test(r.poorMsg) && r.cashPoor === 1000, r.poorMsg);
  t.check('clic sur le cadenas de la porte de sortie : trésorerie débitée, porte équipée d\'une vente, débit en hausse', r.after.open && r.after.cash < r.before.cash && r.after.sell === r.before.sell + 1 && r.after.real >= r.before.real, JSON.stringify({ b: r.before, a: r.after, cost: r.cost }));
  const ctx = pg.context(), p2 = await ctx.newPage(); await p2.goto(L.URL); await p2.waitForTimeout(800);
  const re = await p2.evaluate(p => { const W = window.WSE, c = W.S.grid[p.y * W.N + p.x]; return c && W.chain.slotOpen(c, p.door); }, r);
  t.check('sauvegarde : l\'emplacement acheté reste ouvert', re === true, String(re));
  // usine dont la VENTE est le goulot : une seule porte de vente, plusieurs machines ; clic sur le cadenas d'une porte de sortie → débit en hausse
  const g = await pg.evaluate(() => { const W = window.WSE, S = W.S, T = window.T, K = W.chain, f = T.inP('f2'); W.easyLaunch(f, 'readymeal'); for (let d = 0; d < 2; d++) W.step();
    W.planOf(f).forEach((k, i) => { if (k === 'sell') W.planDel(f, i); }); const fr = i => W.planOf(f)[i] === '' && K.slotOpen(f, i);
    for (let i = 9; i < 12; i++) if (fr(i)) { W.planAdd(f, i, 'sell'); break; }
    for (let n = 0; n < 4 && W.planEvalC(f).lim !== 'pl_sell'; n++) { const j = [0, 1, 2, 3, 4, 5].find(fr); if (j == null) break; W.planAdd(f, j, (n % 2) ? 'stock' : 'make'); }
    for (let i = 6; i < 9; i++) if (W.planEvalC(f).lim === 'pl_buy') { if (fr(i)) W.planAdd(f, i, 'buy'); else if (!K.slotOpen(f, i)) K.planUnlock(f, i, true); }   // assez d'achats : la vente devient le goulot
    const e0 = W.planEvalC(f), door = [9, 10, 11].find(i => !K.slotOpen(f, i)), cash = S.cash; if (door == null) return { lim: e0.lim, none: 1 };
    W.openBuilding(f.x, f.y); W.bAct('planunlock:' + door); const e1 = W.planEvalC(f);
    return { lim: e0.lim, f0: e0.flow * W.planBase(f), f1: e1.flow * W.planBase(f), paid: cash - S.cash, open: K.slotOpen(f, door), plan: W.planOf(f).join(',') }; });
  t.check('usine dont la vente est le goulot : clic sur le cadenas d\'une porte de sortie → trésorerie débitée, débit de vente en hausse', g.lim === 'pl_sell' && g.open && g.paid > 0 && g.f1 > g.f0 * 1.05, JSON.stringify(g));
  t.check('0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
  await ctx.close();
};
