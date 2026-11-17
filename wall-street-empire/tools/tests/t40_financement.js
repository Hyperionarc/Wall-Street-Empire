// Passe 40 : menu Financement (Equity raising / Debt raising) : bureau du banquier, prêt signé, remboursement, équity avec vocabulaire startup.
exports.name = 'Menu Financement : equity et dette (passe 40)';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 3e7 }); await L.inject(pg);
  const r = await pg.evaluate(async () => {
    const W = window.WSE, S = W.S, o = {}; S.stats.raw = 4e7;
    [...document.querySelectorAll('button')].find(b => /Menu$/.test(b.textContent.trim())).click(); await new Promise(x => setTimeout(x, 300));
    document.querySelector('#panel [data-ptab="fund"]').click(); window.WSE.setSpeed(1); await new Promise(x => setTimeout(x, 900)); window.WSE.setSpeed(0);
    o.menu = !!document.querySelector('[data-sec="fund"]') && !document.querySelector('[data-sec="fund"]').hidden;
    o.eq = /Pre-money valuation/.test(document.getElementById('fundEq').innerText) && /pitch/i.test(document.getElementById('fundEq').innerText);
    o.bourseKept = !!document.getElementById('portfolio') && !document.querySelector('[data-sec="market"] #bourse');
    document.querySelector('[data-fund="debt"]').click(); await new Promise(x => setTimeout(x, 300));
    const d = document.getElementById('fundDebt'); o.debtShown = !d.hidden; o.banker = /Lazare/.test(d.innerText) && !!d.querySelector('.bko img'); o.looks = /free cash flow/i.test(d.innerText);
    const c0 = S.cash, l0 = S.loan || 0; d.querySelector('[data-debt="p50"]').click(); await new Promise(x => setTimeout(x, 200)); document.querySelector('#fundDebt [data-debt="draw"]').click(); await new Promise(x => setTimeout(x, 200));
    o.drew = S.cash > c0 && (S.loan || 0) > l0; o.cap = (S.loan || 0) <= W.creditLimit() + 1;
    const l1 = S.loan; document.querySelector('#fundDebt [data-debt="r100"]').click(); await new Promise(x => setTimeout(x, 200)); o.repaid = (S.loan || 0) < l1;
    return o;
  });
  t.check('le menu Financement existe avec Equity raising et Debt raising ; la Bourse garde portefeuille et cotations', r.menu && r.eq && r.bourseKept, JSON.stringify(r));
  t.check('Debt raising : bureau du banquier Lazare, avec fonds propres et free cash flow', r.debtShown && r.banker && r.looks, '');
  t.check('on signe un prêt dans la limite du plafond puis on rembourse', r.drew && r.cap && r.repaid, JSON.stringify({ drew: r.drew, cap: r.cap, repaid: r.repaid }));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.join(' | '));
};
