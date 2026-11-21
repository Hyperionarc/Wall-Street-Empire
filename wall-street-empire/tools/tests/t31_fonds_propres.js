// Fonds propres : banque en Bâle III (CET1, RWA, LCR, défauts, faillite) et crédit du promoteur adossé à l'immobilier (levier ×5, LTV 80 %, appel de marge).
exports.name = 'Fonds propres : banque Bâle III et promoteur à 20 %';

exports.run = async (t, L) => {
  // 1. Exploit : prêter au maximum dès le jour 1 est bloqué, le CET1 reste au-dessus du seuil, l'emprunt de la banque suit ses fonds propres
  {
    const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { caste: 'banquier', cash: 3e6 }); await L.inject(pg);
    const R = await pg.evaluate(() => { const W = window.WSE, S = W.S, B = W.bank, o = {}; S.macro.phase = Math.PI; S.macro.boom = 0;
      S.cash = 3e6; S.pop = 500000; W.step(); const lim0 = W.creditLimit(); o.lim0 = lim0;
      for (let i = 0; i < 40; i++) W.bkLend(1e12); const b = S.bk; o.loans = b.loans; o.rwa = B.rwa(); o.ratio = B.ratio(); o.min = B.min(); o.lcr = B.lcr(); o.cap = B.cap(); o.lim1 = W.creditLimit(); o.res = b.res;
      o.minRatio = 9; o.minLcr = 9; o.neg = 0; o.maxLim = 0;
      for (let d = 0; d < 360; d++) { S.macro.phase = Math.PI; S.macro.boom = 0; W.step(); const r = B.ratio(); o.minRatio = Math.min(o.minRatio, r - B.min()); o.maxLim = Math.max(o.maxLim, W.creditLimit() - (W.bank.LEV - 1) * Math.max(0, S.bk.res)); if (S.cash < 0) o.neg++; }
      o.after = b.loans; o.fail = !!b.fail; o.errs = window.T.scan(); return o; });
    t.check(`jour 1 : prêter au maximum est borné par la liquidité (LCR) : ${(R.loans / 1e6).toFixed(1)} M$ de crédits avec 3 M$ de trésorerie`, R.loans > 1e6 && R.loans < 60e6 && R.lcr >= 0.999, `lcr ${R.lcr.toFixed(2)}`);
    t.check(`CET1 ${(R.ratio * 100).toFixed(1)} % >= minimum ${(R.min * 100).toFixed(1)} % après le prêt maximal`, R.ratio >= R.min, '');
    t.check(`le plafond d'emprunt de la banque n'augmente pas avec le portefeuille de crédits (${(R.lim0 / 1e6).toFixed(2)} -> ${(R.lim1 / 1e6).toFixed(2)} M$)`, R.lim1 <= R.lim0 * 1.001 + 1, '');
    t.check('sur 360 jours : CET1 toujours au-dessus du minimum, pas de faillite, trésorerie jamais négative', R.minRatio >= -1e-9 && !R.fail && R.neg === 0, `écart min ${(R.minRatio * 100).toFixed(2)} pts, neg ${R.neg}`);
    t.check('constantes lisibles : levier banque x10 (emprunt <= 9 x fonds propres), promoteur x5 ; emprunt de la banque borné', R.maxLim <= 1, String(R.maxLim));
    t.check('pas de NaN', R.errs.length === 0, R.errs.slice(0, 3).join(';'));
    // trésorerie abondante : seul le CET1 (et le levier brut) borne le portefeuille
    const R2 = await pg.evaluate(() => { const W = window.WSE, S = W.S, B = W.bank; S.bk = null; S.cash = 5e9; S.macro.phase = Math.PI; S.macro.boom = 0; W.step(); for (let i = 0; i < 60; i++) W.bkLend(1e12); const b = S.bk;
      const o = { loans: b.loans, rwa: B.rwa(), ratio: B.ratio(), min: B.min(), why: B.limits('corp') }; b.sel = 'sov'; const l0 = b.loans; W.bkLend(1e12); o.sov = b.loans - l0; o.ratio2 = B.ratio();
      S.cash = 1e6; o.lcrLow = B.lcr(); const l1 = b.loans; const okLend = W.bkLend(1e6); o.refused = !okLend && b.loans === l1; return o; });
    t.check(`RWA borné : crédits ${(R2.loans / 1e6).toFixed(0)} M$, RWA ${(R2.rwa / 1e6).toFixed(0)} M$, ratio ${(R2.ratio * 100).toFixed(1)} % >= ${(R2.min * 100).toFixed(1)} %`, R2.ratio >= R2.min && R2.loans <= 100e6 / R2.min * 1.0001 + 1, '');
    t.check('les prêts souverains (pondération 0 %) ne consomment pas de CET1 (mais le levier brut les borne)', R2.sov >= 0 && R2.ratio2 >= R2.min, `+${(R2.sov / 1e6).toFixed(0)} M$`);
    t.check('liquidité insuffisante (LCR < 100 %) : prêt refusé', R2.refused && R2.lcrLow < 1, `lcr ${R2.lcrLow.toFixed(2)}`);
    await pg.context().close();
  }

  // 2. Défauts : un choc de crédit et la récession rongent les fonds propres ; la faillite est possible
  {
    const run = async shock => { const pg = await L.newPage({ wait: 400 }); await L.setup(pg, { caste: 'banquier', cash: 5e9 }); await L.inject(pg);
      const r = await pg.evaluate(shock => { const W = window.WSE, S = W.S, B = W.bank, M = W.macro; S.pop = 500000; S.macro.phase = Math.PI; S.macro.boom = 0; W.step(); for (let i = 0; i < 60; i++) W.bkLend(1e12); const b = S.bk, l0 = b.loans, res0 = b.res;
        if (shock) { M.shockStart('credit', 1); S.macro.gdp = -0.02; } let rmin = 9;
        for (let d = 0; d < 90; d++) { S.macro.phase = Math.PI; S.macro.boom = 0; if (shock) S.macro.gdp = -0.02; W.step(); rmin = Math.min(rmin, B.ratio()); }
        return { l0, loss: b.lossT, res0, res: b.res, ratio: B.ratio(), rmin, st: b.st, fail: !!b.fail, loans: b.loans }; }, shock);
      r.errs = pg.errs.length; await pg.context().close(); return r; };
    const calm = await run(false), shk = await run(true);
    t.check(`choc de crédit : pertes mesurables ${(shk.loss / 1e6).toFixed(2)} M$ contre ${(calm.loss / 1e6).toFixed(2)} M$ sans choc (x${(shk.loss / Math.max(1, calm.loss)).toFixed(1)})`, shk.loss > 4 * calm.loss && shk.loss > 1e6, '');
    t.check(`les défauts consomment les fonds propres : CET1 ${(calm.ratio * 100).toFixed(1)} % -> ${(shk.ratio * 100).toFixed(1)} %`, shk.ratio < calm.ratio && shk.res < shk.res0 + 1e6 && shk.res < calm.res, `res ${(shk.res / 1e6).toFixed(1)} vs ${(calm.res / 1e6).toFixed(1)}`);
    t.check('pas d\'erreur de page', calm.errs === 0 && shk.errs === 0, '');
  }
  {
    const pg = await L.newPage({ wait: 400 }); await L.setup(pg, { caste: 'banquier', cash: 5e9 }); await L.inject(pg);
    const R = await pg.evaluate(() => { const W = window.WSE, S = W.S, B = W.bank; S.macro.phase = Math.PI; S.macro.boom = 0; W.step(); const b = B.init(); const o = {};
      // restriction : sous 4,5 % de CET1 le régulateur fait rappeler des crédits et les prêts sont bloqués
      b.lt = { corp: 1e9, immo: 0, sov: 0 }; b.res = 40e6; b.loans = 1e9; S.macro.phase = Math.PI; S.macro.boom = 0; W.step(); o.st = b.st; o.ratio = B.ratio(); o.cap = B.cap(); o.loansAfter = b.loans; o.lend = W.bkLend(1e6);
      // faillite : les pertes dépassent les fonds propres
      b.res = 1e3; b.lt = { corp: 1e10, immo: 0, sov: 0 }; b.loans = 1e10; b.st = 'ok'; S.macro.gdp = -0.03; W.macro.shockStart('credit', 1);
      for (let d = 0; d < 40 && !b.fail; d++) { S.macro.phase = Math.PI; S.macro.boom = 0; W.step(); } o.fail = !!b.fail; o.done = S.mode && S.mode.done; o.scr = !document.getElementById('endscr').hidden; o.txt = document.getElementById('endscr').textContent.slice(0, 160); o.lim = W.creditLimit(); o.lend2 = W.bkLend(1e6); return o; });
    t.check('sous 4,5 % de CET1 : restriction, prêts bloqués, crédits rappelés', R.st === 'restr' && R.cap === 0 && R.lend === false && R.loansAfter < 1e9, `${JSON.stringify([R.st, (R.ratio * 100).toFixed(1), R.loansAfter])}`);
    t.check('fonds propres négatifs : faillite de la banque, écran de fin explicite, plus d\'emprunt ni de prêt', R.fail && R.done === 'bank' && R.scr && /FAILLITE/.test(R.txt) && R.lim === 0 && R.lend2 === false, JSON.stringify([R.fail, R.done, R.scr, R.lim, R.txt.slice(0, 60)]));
    await pg.context().close();
  }

  // 3. Sauvegarde rétrocompatible : ancienne banque sans types de crédits
  {
    const pg = await L.newPage({ wait: 400 }); await L.setup(pg, { caste: 'banquier', cash: 5e9 }); await L.inject(pg);
    const R = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.step(); S.bk = { res: 100e6, lvl: 0, loans: 50e6, coll: 0, inc: 0 }; W.save(); const d = JSON.parse(localStorage.getItem('wse-city-v8')); const had = d.bk && !d.bk.lt; return { had, v: d.v }; });
    await pg.reload(); await pg.waitForTimeout(600); await L.inject(pg);
    const R2 = await pg.evaluate(() => { const W = window.WSE, S = W.S; const b = W.bank.init(); return { loans: b.loans, corp: b.lt.corp, ratio: W.bank.ratio(), caste: S.caste, cap: W.bank.cap() }; });
    // Le jeu tourne en temps réel entre le rechargement et l'appel : sur une machine chargée, un jour peut s'écouler et amortir quelques milliers de $
  // du portefeuille (vu : 49 998 051 $). La migration est vérifiée par l'égalité crédits aux entreprises = encours, encours ≈ 50 M$ (à 0,2 % près).
  t.check('ancienne banque (sans types de crédits) rechargée : portefeuille en crédits aux entreprises, ratio fini', R.v === 8 && Math.abs(R2.corp - R2.loans) < 1 && R2.loans <= 50e6 + 1 && R2.loans > 49.9e6 && Number.isFinite(R2.ratio) && R2.caste === 'banquier', JSON.stringify([R, R2]));
    t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
    await pg.context().close();
  }

  // 4. Promoteur : 20 % de fonds propres, plafond lié à la valeur de l'immobilier, appel de marge
  {
    const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { caste: 'promoteur', cash: 3e6 }); await L.inject(pg);
    const R = await pg.evaluate(() => { const W = window.WSE, S = W.S, P = W.promo, o = {}; S.macro.phase = Math.PI; S.macro.boom = 0; S.macro.gdp = 0.03; S.macro.rate = 0.04; S.cash = 3e6; S.loan = 0; W.step(); S.cash = 3e6; W.refreshStats && W.refreshStats();
      o.lim = W.creditLimit(); o.rate0 = W.loanRateNow();
      document.getElementById('loanUp') && 0; S.loan = 12e6; S.cash += 12e6; o.ltv = P.ltv(); o.lim12 = W.creditLimit(); o.rate12 = W.loanRateNow();
      // dépréciation : l'indice immobilier baisse en récession avec une crise du crédit
      S.loan = 0; S.cash = 3e6; const T = window.T; S.cash = 40e6; for (let i = 0; i < 6; i++) T.inC('immo'); for (let i = 0; i < 8; i++) T.inC('res'); S.cash = 3e6; W.refreshStats(); o.iv = S.stats.iv; o.idx0 = P.idx(); o.limB = W.creditLimit();
      S.macro.gdp = -0.03; S.macro.rate = 0.07; W.macro.shockStart('credit', 1); o.idx1 = P.idx(); o.limC = W.creditLimit(); return o; });
    t.check('levier promoteur x5 constant', (await pg.evaluate(() => window.WSE.bank.PROMO_LEV)) === 5 && R.lim12 === 12e6 || 0, ''); t.check(`promoteur au départ (3 M$) : plafond de dette ${(R.lim / 1e6).toFixed(2)} M$ (≈ 12 M$ = 4 × fonds propres, levier ×5)`, R.lim >= 11.9e6 && R.lim <= 12.1e6, '');
    t.check(`taux cohérent : ${(R.rate0 * 100).toFixed(1)} % sans dette, ${(R.rate12 * 100).toFixed(1)} % à 80 % de LTV (prime de levier), LTV ${(R.ltv * 100).toFixed(0)} %`, R.rate12 > R.rate0 && R.rate12 < 0.3 && Math.abs(R.ltv - 0.8) < 0.01, '');
    t.check('le plafond reste 12 M$ une fois emprunté (fonds propres inchangés)', Math.abs(R.lim12 - 12e6) < 1e5, String(R.lim12));
    t.check(`l'immobilier se déprécie (indice ${R.idx0.toFixed(2)} -> ${R.idx1.toFixed(2)}) : le plafond baisse (${(R.limB / 1e6).toFixed(2)} -> ${(R.limC / 1e6).toFixed(2)} M$)`, R.iv > 0 && R.idx1 < R.idx0 - 0.15 && R.limC < R.limB, `iv ${R.iv}`);
    const M = await pg.evaluate(() => { const W = window.WSE, S = W.S, P = W.promo, o = {}; S.macro.phase = Math.PI; S.macro.boom = 0; S.macro.gdp = 0.03; S.macro.rate = 0.04; S.cash = 3e6; S.loan = 0; W.refreshStats(); S.stats.iv = 0; S.stats.fv = 0; S.loan = 11.9e6; S.cash = 14.9e6; const ok0 = P.ltv(); P.step(); o.mc0 = !!S.mc; S.cash = 12.5e6; o.ltv = P.ltv(); const r0 = W.loanRateNow(); P.step(); o.mc = !!S.mc; o.rate = W.loanRateNow() - r0;
      S.day = S.mc ? S.mc.until : S.day; P.step(); o.loanAfter = S.loan; o.cashAfter = S.cash; o.negCash = S.cash < 0; o.errs = window.T.scan(); return o; });
    t.check(`LTV ${(M.ltv * 100).toFixed(0)} % > 90 % : appel de marge, taux majoré (+${(M.rate * 100).toFixed(1)} pts), puis vente forcée / saisie de trésorerie sans trésorerie négative`, !M.mc0 && M.mc && M.rate > 0.015 && M.loanAfter < 11.9e6 && !M.negCash && M.errs.length === 0, JSON.stringify(M));
    await pg.context().close();
  }

  // 5. Découvert : trésorerie négative limitée et chère ; dépense refusée si elle rend la trésorerie négative
  {
    const pg = await L.newPage({ wait: 400 }); await L.setup(pg, { caste: 'industriel', cash: 1e6 }); await L.inject(pg);
    const R = await pg.evaluate(() => { const W = window.WSE, S = W.S, o = {}; S.cash = 1000; const before = S.cash; const n0 = Object.keys(S.grid).length; const T = window.T; const c = T.inC('res'); o.refused = !c && S.cash >= 0; o.od = W.odLimit(); S.cash = 1e6; o.okBuy = !!T.inC('res'); return o; });
    t.check(`dépense qui rendrait la trésorerie négative : refusée (découvert toléré ${(R.od / 1e3).toFixed(0)} k$)`, R.refused && R.od >= 25e3 && R.od <= 5e6 && R.okBuy, JSON.stringify(R));
    await pg.context().close();
  }
};
