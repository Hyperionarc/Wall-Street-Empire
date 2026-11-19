// Équilibre économique (passe « rééquilibrage ») : (1) aucune récompense gratuite au départ (missions de capitalisation sous le capital de départ),
// (2) rivaux qui prennent des risques : une IA aventureuse sur-endettée peut faire faillite, une IA prudente non,
// (3) équilibre des castes : six castes jouées par le bot de leur métier (agriculteur = fermes, industriel et négociant = usines, mines et exports, banquier = prêts de sa banque) sur la même graine, valeur relative bornée, progression ni nulle ni explosive.
exports.name = 'Équilibre : gratuité au départ, faillites plausibles, castes';
const PRESET = { bon: { lev: 0.45, every: 4, p: { hurdle: 0.05 } },
  industriel: { lev: 0.5, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.6, bourse: false, fam: ['s1', 's2', 's3', 's4', 'off', 'miron', 'mcopper', 'mcoal', 'mgold', 'well'] } },
  fermier: { lev: 0.4, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.5, bourse: false, fam: ['fwheat', 'fsugar', 'fcotton', 'fvine', 'fcattle', 'fchicken', 'fpig', 'fsheep', 's1', 's2', 's3'] } },
  banquier: { lev: 0.45, every: 4, p: { hurdle: 0.05, bank: true } } };
const NAT = { agriculteur: 'fermier', industriel: 'industriel', negociant: 'industriel', banquier: 'banquier' };   // même correspondance que tools/sim_batch.js --native
const CASTES = ['agriculteur', 'banquier', 'negociant', 'industriel', 'promoteur', 'innovateur'];
const DAYS = 1080, SEED = 6000;
exports.run = async (t, L) => {
  // ---- 1. Pas de gratuité au départ : Round Normal et Facile, scénarios, Libre
  let pg = await L.newPage({ wait: 600 });
  const g = await pg.evaluate(() => {
    const W = window.WSE, out = {};
    for (const md of ['round:normal', 'round:easy', 's1', 's2', 's3', 's4', 's5', 'free']) {
      const [k, d] = md.split(':');
      if (k === 'round') { W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="' + d + '"]'); q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true })); }
      W.startMode(k); const S = W.S; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0);
      const c0 = S.cash, kp0 = S.kp || 0; for (let i = 0; i < 3; i++) W.step();
      const paid = W.acq.MISSIONS.filter(m => S.done.indexOf(m.id) >= 0 && !((S.mode.mfree || []).indexOf(m.id) >= 0)).reduce((a, m) => a + m.r, 0);
      out[md] = { w0: S.mode.w0, paid, kp: (S.kp || 0) - kp0, free: (S.mode.mfree || []).slice(), cash: Math.round(S.cash - c0) };
    }
    // m6 se valide quand le palier est réellement atteint
    W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true }));
    W.startMode('round'); const S = W.S; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); W.step();
    const m6 = W.acq.MISSIONS.find(m => m.id === 'm6'); const before = S.done.indexOf('m6') >= 0; S.cash += 6e6; const c1 = S.cash; W.step();
    out.m6 = { t: m6.t, before, after: S.done.indexOf('m6') >= 0, gain: Math.round(S.cash - c1), r: m6.r };
    return out;
  });
  const modes = Object.keys(g).filter(k => k !== 'm6');
  t.check('aucune mission payée dans les 3 premiers jours (Round Normal/Facile, scénarios 1 à 5, Libre)', modes.every(k => g[k].paid === 0 && g[k].kp === 0), modes.map(k => k + ' ' + g[k].paid + ' $/' + g[k].kp + ' pt').join(' ; '));
  t.check('Round Facile (100 M$) : m6, Entrepreneur et Industriel cochés « atteints au départ », sans prime', ['m6', 'w1', 'w2'].every(id => g['round:easy'].free.indexOf(id) >= 0), JSON.stringify(g['round:easy']));
  t.check('Round Normal (10 M$) : la mission « Capitalisation de 15 M$ » reste à faire au départ', g['round:normal'].free.length === 0 && !g.m6.before && /15 M\$/.test(g.m6.t), JSON.stringify(g['round:normal']) + ' ' + g.m6.t);
  t.check('… et se valide avec sa prime une fois 15 M$ réellement atteints', g.m6.after && g.m6.gain >= g.m6.r, JSON.stringify(g.m6));
  await pg.context().close();

  // ---- 2. Faillites plausibles : IA aventureuse très endettée en récession -> refus de reconduction, ventes forcées, faillite ; IA prudente peu endettée -> survit
  pg = await L.newPage({ wait: 600 });
  const f = await pg.evaluate(() => {
    const W = window.WSE; W.showModes(); W.startMode('round'); const S = W.S; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0);
    for (let i = 0; i < 40; i++) W.step();
    const R = W.riv, a = S.rivals.find(x => x.caste === 'agriculteur'), b = S.rivals.find(x => x.caste === 'negociant');
    a.gs = 'av'; a.cash = 0.3e6; a.debt = 0.78 * R.gross(a); b.gs = 'pr'; b.debt = 0.1 * R.value(b);
    const o = { lev0: +R.lev(a).toFixed(2), rate: +R.rate(a).toFixed(3), canA: R.canBorrow(a, 1e6), canB: R.canBorrow(b, 1e6) }; let n = 0;
    while (n++ < 760 && S.rivals.indexOf(a) >= 0) { S.macro.gdp = -0.02; W.step(); }
    o.days = n; o.aGone = S.rivals.indexOf(a) < 0; o.bAlive = S.rivals.indexOf(b) >= 0; o.calls = S.rv.calls || 0; o.fails = S.rv.fails || 0;
    o.log = (S.rv.log || []).filter(l => l.n === 'Mega Mart' && /créanciers|faillite/.test(l.t)).map(l => l.d + ' ' + l.t.slice(0, 60)).slice(-3).join(' | ');
    // style de gestion tiré au premier jour : déterministe, environ une IA sur quatre aventureuse
    let av = 0, tot = 0; for (let s = 0; s < 12; s++) { W.startMode('round'); W.S.rs = 9000 + 131 * s; W.S.noEv = true; W.setCaste(['agriculteur', 'banquier', 'negociant', 'industriel', 'promoteur', 'innovateur'][s % 6]); W.setSpeed(0); W.step(); W.step(); W.S.rivals.forEach(r => { tot++; if (r.gs === 'av') av++; }); }
    o.av = av; o.tot = tot; return o;
  });
  t.check('IA aventureuse : levier élevé = prime de risque, plus de crédit au-delà de 70 % des actifs', f.rate > 0.09 && !f.canA && f.canB, JSON.stringify({ lev0: f.lev0, rate: f.rate, canA: f.canA, canB: f.canB }));
  t.check('IA aventureuse sur-endettée en récession : créanciers, ventes forcées puis faillite', f.aGone && f.calls >= 2 && f.fails >= 1, `${f.days} jours, ${f.calls} refus de reconduction : ${f.log}`);
  t.check('IA prudente peu endettée dans la même récession : survit', f.bAlive, '');
  t.check('style de gestion : 10 à 45 % d\'IA aventureuses sur 12 parties', f.av >= 0.1 * f.tot && f.av <= 0.45 * f.tot, `${f.av}/${f.tot}`);
  await pg.context().close();

  // ---- 3. Équilibre des castes : bot du métier (agriculteur = fermes, industriel et négociant = usines et exports, banquier = bon joueur qui prête, autres = bon joueur), même graine, Round Normal, DAYS jours
  const vals = {};
  for (const caste of CASTES) {
    pg = await L.newPage({ wait: 500 });
    const P = PRESET[NAT[caste] || 'bon'];
    await pg.evaluate(([caste, P, seed, src]) => {
      const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true }));
      W.startMode('round'); const S = W.S; S.rs = seed; S.noEv = false; W.setCaste(caste); W.setSpeed(0); ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
      S.mode.w0 = S.cash; (0, eval)(src); window.BOT.P.lev = P.lev; window.BOT.P.idle = 0; Object.assign(window.BOT.P, { fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false }, P.p);
    }, [caste, P, SEED, L.BOT_SRC]);
    vals[caste] = await pg.evaluate(([every, D]) => { const W = window.WSE, S = W.S; while (S.day < D && !S.mode.done) { for (let k = 0; k < every; k++) W.step(); window.BOT.tick(); } return { v: W.valuation(), rk: W.rankPlayers()[0], riv: Math.max(...S.rivals.map(r => W.riv.value(r))) }; }, [P.every, DAYS]);
    t.check(`${caste} : 0 erreur de page`, pg.errs.length === 0, pg.errs.slice(0, 1).join(''));
    await pg.context().close();
  }
  const geo = Math.exp(CASTES.reduce((a, c) => a + Math.log(vals[c].v), 0) / CASTES.length), rel = CASTES.map(c => vals[c].v / geo);
  t.info('valeur au jour ' + DAYS + ' (M$) : ' + CASTES.map((c, i) => c + ' ' + (vals[c].v / 1e6).toFixed(1) + ' (' + rel[i].toFixed(2) + ', rang ' + vals[c].rk + ')').join(' ; '));
  t.range('caste la plus faible / moyenne géométrique (mesuré 0,71 : innovateur)', Math.min(...rel), 0.6, 1, '', 2);
  t.range('caste la plus forte / moyenne géométrique (mesuré 1,45 : agriculteur)', Math.max(...rel), 1, 1.8, '', 2);
  t.range('progression : valeur médiane au jour ' + DAYS + ' (M$, départ 10)', CASTES.map(c => vals[c].v / 1e6).sort((a, b) => a - b)[3], 40, 160, ' M$', 1);
};
