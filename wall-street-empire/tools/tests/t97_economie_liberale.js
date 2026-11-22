// Économie libérale (docs/ECONOMIE_LIBERALE.md) : 365 jours de partie avec bot, vérifie que le marché libre reste sain.
//  1. aucun NaN / Infinity / stock négatif / prix nul (libCheck) ; garde-fous techniques (bnd) touchés rarement ;
//  2. prix sans oscillation violente (écart-type journalier de log P < 4 %, pas de dents de scie de plus de 8 jours) ;
//  3. cycles : les cours bougent (pas de prix figés), au moins un marché passe sous son coût (vente à perte possible) ;
//  4. budget des ménages : il se resserre quand le chômage monte (récession forcée), le basique est servi d'abord ;
//  5. B2B piloté par les usines : la demande de matières suit la production des usines PNJ (choc de production → demande) ;
//  6. périssabilité : un stock de lait invendu est soldé puis détruit, un stock de blé se garde ; prix du joueur libres (pas de plafond 160 %).
exports.name = 'Économie libérale : marché libre sur 365 jours';
const DAYS = 365;
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 600 });
  const r = await pg.evaluate(([src, D]) => {
    const W = window.WSE; W.showModes(); W.startMode('round'); const S = W.S; S.rs = 9701; S.noEv = false; W.setCaste('industriel'); W.setSpeed(0);
    ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    (0, eval)(src); window.BOT.P.lev = 0.45; window.BOT.P.idle = 0; Object.assign(window.BOT.P, { hurdle: 0.05, bourse: false });
    const ph = {}, under = new Set(); let calls = 0; const ext = {};
    while (S.day < D) { for (let k = 0; k < 3; k++) { W.step(); calls++; Object.keys(S._pxr || {}).forEach(g => { const x = S._pxr[g]; if (S.price[g] < 0.97 * x.Pc) under.add(g); const e = ext[g] || (ext[g] = [1e99, 0]); e[0] = Math.min(e[0], S.price[g] / x.Pc); e[1] = Math.max(e[1], S.price[g] / x.Pc); }); } window.BOT.tick(); }
    const X = S._pxs || {}, vol = [], alt = []; Object.keys(X).forEach(g => { const o = X[g]; if (o.n > 30) { vol.push([g, Math.sqrt(o.s2 / o.n)]); alt.push([g, o.malt]); } });
    vol.sort((a, b) => b[1] - a[1]); alt.sort((a, b) => b[1] - a[1]);
    const B = S._bnd || {}, bnd = Object.keys(B).map(k => [k, B[k][0] ? (B[k][1] + B[k][2]) / B[k][0] : 0]).sort((a, b) => b[1] - a[1]);
    const moved = Object.keys(ext).filter(g => ext[g][1] / ext[g][0] > 1.03).length;   // amplitude du cours rapporté au coût marginal sur l'année
    const o = { lib: S._lib, vol: vol.slice(0, 4), alt: alt.slice(0, 4), bnd: bnd.slice(0, 5), moved, under: [...under].slice(0, 8), nUnder: under.size, scan: window.T ? [] : [] };
    // 4. budget : récession forcée (chômage 20 %) -> indice de budget en baisse, le basique reste servi
    const b0 = W.lib.hh().b; S.stats.unemp = 0.2; S.macro.gdp = -0.03; S.macro.wm = 0.9; S.day++; const X1 = W.lib.hh(); S.day--; o.b0 = b0; o.b1 = X1.b; o.sav1 = X1.sav;
    const dm = W.pos.hhDemand(W.lib.popE(), 1, 60, { basic: 12, std: 60, lux: 300 }), dm2 = W.pos.hhDemand(W.lib.popE(), 1, 60, { basic: 12, std: 60, lux: 600 });
    o.lux1 = dm.lux; o.lux2 = dm2.lux; o.basicSat = dm.sat; o.std1 = dm.std; o.std2 = dm2.std;
    // 5. B2B : production des usines PNJ doublée -> demande de blé en hausse (plans de production), avec un coup de fouet du stock tampon
    S.stats.unemp = 0.06; S.macro.gdp = 0.03; W.step(); const d0 = (S._lm.wheat || {}).ind || 0; Object.keys(S.macro.nb).forEach(k => { S.macro.nb[k] *= 2; });
    const m = {}, w = {}; Object.keys(S.price).forEach(g => { m[g] = 0; w[g] = 0; }); W.lib.slm(m, w); const L1 = S._lm.wheat || {}; o.b2b0 = d0; o.b2b1 = L1.ind; o.buf1 = L1.buf;
    // 6. périssabilité
    S.stock.milk = 0; S.stock.wheat = 0; W.step(); S.stock.milk = 30000; S.stock.wheat = 30000; S.flots = {}; const sold = { milk: 0, dead: 0 };
    for (let i = 0; i < 12; i++) { W.step(); const p = S._perish || {}; if (p.milk) { sold.milk += p.milk.sold; sold.dead += p.milk.dead; } }
    o.milk = S.stock.milk; o.wheat = S.stock.wheat; o.msold = sold.milk; o.mdead = sold.dead; o.perRev = S._perD;
    // prix libres
    const pk = W.PKEYS.find(k => S.prod[k].st === 'on') || W.PKEYS[0]; S.prod[pk].pf = W.lib.bnd('PXJ', 3.5, W.lib.PX_LO, W.lib.PX_HI); o.pf = S.prod[pk].pf;
    o.lib2 = W.lib.check(); return o;
  }, [L.BOT_SRC, DAYS]);
  t.info(`volatilité max ${r.vol.map(v => v[0] + ' ' + (100 * v[1]).toFixed(2) + ' %').join(', ')} · dents de scie ${r.alt.map(v => v.join(' ')).join(', ')} · bornes ${r.bnd.map(b => b[0] + ' ' + (100 * b[1]).toFixed(2) + ' %').join(', ')}`);
  t.check('365 jours : aucun NaN, Infinity, stock négatif ni prix nul (libCheck)', r.lib && r.lib.n === 0 && r.lib2.length === 0, JSON.stringify(r.lib).slice(0, 200));
  t.check('0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  t.check('prix sans oscillation violente : écart-type journalier de log(P) < 4 %', r.vol.length > 0 && r.vol[0][1] < 0.04, r.vol.map(v => v[0] + ' ' + (100 * v[1]).toFixed(2)).join(' '));
  t.check('pas de dents de scie de plus de 8 jours d\'affilée', r.alt.length > 0 && r.alt[0][1] <= 8, JSON.stringify(r.alt));
  t.check('garde-fous techniques : chacun touché moins de 1 % des appels', r.bnd.every(b => b[1] < 0.01), JSON.stringify(r.bnd));
  t.check('cycles : les cours bougent (au moins 10 biens varient de plus de 3 %)', r.moved >= 10, r.moved + ' biens');
  t.check('vente à perte possible : au moins un cours est passé sous le coût de ses producteurs', r.nUnder >= 1, r.under.join(', '));
  t.check('budget : il se resserre en récession (chômage 20 %, salaires en baisse), l\'épargne de précaution monte', r.b1 < r.b0 * 0.95 && r.sav1 > 0.05, `indice ${r.b0.toFixed(3)} -> ${r.b1.toFixed(3)}, épargne ${(100 * r.sav1).toFixed(1)} %`);
  t.check('budget fermé : un luxe deux fois plus cher se vend deux fois moins en unités (vrai prix), le basique est servi d\'abord', Math.abs(r.lux2 / r.lux1 - 0.5) < 0.01 && Math.abs(r.std2 / r.std1 - 1) < 1e-6 && r.basicSat, `luxe ${r.lux1.toFixed(0)} -> ${r.lux2.toFixed(0)}`);
  t.check('B2B piloté par les usines : production PNJ ×2 -> demande de blé ×2, plus un coup de fouet du stock tampon', r.b2b1 > 1.8 * r.b2b0 && r.buf1 > 0, `${r.b2b0.toFixed(0)} -> ${r.b2b1.toFixed(0)} u/j, tampon +${(r.buf1 || 0).toFixed(0)}`);
  t.check('périssabilité : le lait invendu disparaît en quelques jours (soldé ou détruit), le blé se garde', r.milk < 100 && r.wheat > 0, `lait ${Math.round(r.milk)} (soldé ${Math.round(r.msold)}, détruit ${Math.round(r.mdead)}), blé ${Math.round(r.wheat)}`);
  t.check('prix du joueur libres : 350 % accepté (plus de plafond à 160 %)', Math.abs(r.pf - 3.5) < 1e-9, String(r.pf));
  await pg.context().close();
};
