// Macro-économie : chômage plancher (>= 3 %), humeur qui fluctue avec le cycle, cycle irrégulier, 3 chocs exogènes, transmission du taux, sauvegarde.
exports.name = 'Macro : chômage, humeur, cycle, chocs, taux';

const SETUP = (seed, rich) => `(() => { const W = window.WSE, S = W.S, T = window.T; S.rs = ${seed} * 7919; S.noEv = true; S.cash = 2e9; S.float = 0.2;
  for (let i = 0; i < 30; i++) T.inC('res'); T.inC('s1'); T.inC('s2'); T.inC('s3'); T.inC('hq'); T.inP('f1');
  ${rich ? "for (let i = 0; i < 12; i++) { T.inC('off'); T.inC('tech'); T.inC('bank'); T.inP('f2'); T.inP('f3'); }" : ''} })()`;
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m)))); };
const corr = (a, b) => { const ma = mean(a), mb = mean(b); let n = 0, da = 0, db = 0; for (let i = 0; i < a.length; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; } return n / Math.sqrt(da * db || 1); };

exports.run = async (t, L) => {
  // 1. Trois graines, 3 000 jours : chômage plancher, humeur, cycle
  for (const seed of [1, 2, 3]) {
    const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 2e9 }); await L.inject(pg);
    await pg.evaluate(SETUP(seed, seed === 3));
    const R = await pg.evaluate(() => { const W = window.WSE, S = W.S, o = { u: [], h: [], g: [], i: [], day: [], cashFix: 0 };
      for (let d = 0; d < 3000; d++) { if (d % 50 === 0 && S.cash < 1e9) S.cash = 2e9; W.step(); if (d % 5 === 0) { o.u.push(S.stats.unemp); o.h.push(S.stats.happy); o.g.push(S.macro.gdp); o.i.push(S.macro.infl); } } o.nan = window.T.scan(); return o; });
    const u = R.u, h = R.h, g = R.g, hs = h.slice(40);
    t.check(`graine ${seed} : chômage jamais sous 3 % sur 3 000 jours (min ${(Math.min(...u) * 100).toFixed(2)} %, max ${(Math.max(...u) * 100).toFixed(1)} %)`, Math.min(...u) >= 0.03 - 1e-9 && Math.max(...u) < 0.5, '');
    t.check(`graine ${seed} : le chômage varie (écart-type ${(sd(u) * 100).toFixed(2)} pts)`, sd(u) > 0.004, '');
    t.check(`graine ${seed} : humeur dans 20-92, écart-type > 6 (${sd(hs).toFixed(1)}, min ${Math.min(...hs).toFixed(0)}, max ${Math.max(...hs).toFixed(0)})`, sd(hs) > 6 && Math.min(...hs) > 15 && Math.max(...hs) < 95, '');
    const c = corr(h.slice(40), g.slice(40));
    t.check(`graine ${seed} : humeur corrélée positivement au PIB (r = ${c.toFixed(2)})`, c > 0.35, '');
    t.check(`graine ${seed} : PIB dans [−4,5 %, +7 %] (min ${(Math.min(...g) * 100).toFixed(1)}, max ${(Math.max(...g) * 100).toFixed(1)}) et inflation dans [−1 %, 12 %]`, Math.min(...g) > -0.045 && Math.max(...g) < 0.0701 && Math.min(...R.i) >= -0.0101 && Math.max(...R.i) <= 0.1201, '');
    // cycle irrégulier : durées des expansions et récessions (franchissements de 3 %) différentes
    const gaps = []; let last = 0; for (let i = 1; i < g.length; i++) if ((g[i - 1] - 0.03) * (g[i] - 0.03) < 0) { gaps.push(i - last); last = i; }
    t.check(`graine ${seed} : cycle irrégulier (${gaps.length} demi-cycles, durées ${gaps.slice(0, 8).map(x => x * 5).join('/')} j, écart-type ${sd(gaps.slice(1)).toFixed(1)})`, gaps.length >= 6 && sd(gaps.slice(1)) > 2, '');
    t.check(`graine ${seed} : pas de NaN, 0 pageerror`, R.nan.length === 0 && pg.errs.length === 0, R.nan.slice(0, 2).join(';') + pg.errs.slice(0, 2).join(';'));
    t.info(`graine ${seed} : chômage ${(mean(u) * 100).toFixed(1)} % en moyenne, humeur ${mean(hs).toFixed(0)} en moyenne`);
    await pg.context().close();
  }
  // plancher du modèle : marché du travail très tendu, croissance forte
  { const pg = await L.newPage({ wait: 400 });
    const r = await pg.evaluate(() => { const W = window.WSE, S = W.S, M = W.macro; S.macro.gdp = 0.07; S.macro.nairu = 0.035; return { tight: M.unempTarget(5e6, 1e5), slack: M.unempTarget(5e4, 1e5), norm: M.unempTarget(1e5, 1e5) }; });
    t.check(`modèle : marché très tendu -> chômage 3,0 % (${(r.tight * 100).toFixed(2)} %) ; sans emploi (50 % de postes) -> ${(r.slack * 100).toFixed(1)} %`, r.tight === 0.03 && r.slack > 0.45, '');
    const r2 = await pg.evaluate(() => { const W = window.WSE, S = W.S, M = W.macro, o = {}; S.macro.nairu = 0.045; [-0.04, 0, 0.03, 0.06].forEach(g => { S.macro.gdp = g; o[g] = M.unempTarget(1e5, 1e5); }); return o; });
    t.check(`modèle : le chômage monte en récession (PIB −4 % -> ${(r2[-0.04] * 100).toFixed(1)} %), baisse en boom (+6 % -> ${(r2[0.06] * 100).toFixed(1)} %)`, r2[-0.04] > 0.085 && r2[-0.04] < 0.13 && r2[0.06] < 0.04 && r2[0.06] >= 0.03, '');
    await pg.context().close(); }

  // 2. Chocs : chacun via la carte d'événement (toast, bandeau), comparé à un témoin de même graine
  async function run(id, shock, choice) {
    const pg = await L.newPage({ wait: 400, w: 1400 }); await L.setup(pg, { cash: 2e9 }); await L.inject(pg);
    await pg.evaluate(SETUP(7, false));
    const R = await pg.evaluate(({ id, shock, choice }) => { const W = window.WSE, S = W.S, M = W.macro, o = { s: {} };
      const fr = () => { S.macro.boom = 0; S.macro.phase = Math.PI; }; for (let d = 0; d < 40; d++) { fr(); W.step(); }
      const snap = () => ({ gdp: S.macro.gdp, h: S.stats.happy, u: S.stats.unemp, infl: S.macro.infl, rate: W.macro.loanRateNow(), lim: M.creditLimit(), oil: M.marketBounds('oil').base / (W.GOODS.oil.base * S.cpi), prem: S.prem, dem: M.shockDemand(), px: S.price.oil / (W.GOODS.oil.base * S.cpi) });
      o.s0 = snap(); const feed0 = document.getElementById('feed') ? document.getElementById('feed').children.length : 0;
      if (shock) { S.noEv = false; S.event = id; M.showEvent(); o.card = window.WSE.ui.decList().some(d => d.id === 'ev') && document.getElementById('evcard').hidden; document.querySelector('#evcard [data-ev="' + choice + '"]').click(); S.noEv = true; o.toast = (S.jr || []).some(e => /Choc énergétique|Pandémie|Crise du crédit/.test(e.t)); }
      const ser = { h: [], u: [], g: [], i: [], px: [], dem: [], rate: [], lim: [], prem: [] }; let bar = false;
      for (let d = 0; d < 75; d++) { fr(); W.step(); const c = snap(); ser.h.push(c.h); ser.u.push(c.u); ser.g.push(c.gdp); ser.i.push(c.infl); ser.px.push(c.px); ser.dem.push(c.dem); ser.rate.push(c.rate); ser.lim.push(c.lim); ser.prem.push(c.prem); if (d === 30) o.bar = !document.getElementById('shockbar').hidden && document.getElementById('shockbar').textContent.length > 8; }
      o.ser = ser;
      o.s1 = snap(); for (let d = 0; d < 200; d++) { fr(); W.step(); if (d === 40) o.endG = S.macro.gdp; } o.end = M.shockAny(); return o; }, { id, shock, choice });
    R.errs = pg.errs.length; await pg.context().close(); return R;
  }
  const ctl = await run('energy', false, 0);
  const en = await run('energy', true, 1), pa = await run('pandemic', true, 1), cr = await run('credit', true, 1);
  const pa0 = await run('pandemic', true, 0), en0 = await run('energy', true, 0), cr0 = await run('credit', true, 0);
  // écart maximal (dans le sens voulu) entre le choc et le témoin de même graine, sur 75 jours
  const gap = (r, k, sgn = 1) => Math.max(...r.ser[k].map((v, i) => sgn * (v - ctl.ser[k][i])));
  const ratio = (r, k) => Math.max(...r.ser[k].map((v, i) => v / ctl.ser[k][i]));
  t.info(`témoin : PIB ${(ctl.ser.g[74] * 100).toFixed(1)} %, humeur ${ctl.ser.h[74].toFixed(0)} (départ ${ctl.s0.h.toFixed(0)}), chômage ${(ctl.ser.u[74] * 100).toFixed(1)} %, inflation ${(ctl.ser.i[74] * 100).toFixed(1)} %`);
  const all = [['énergie', en], ['pandémie', pa], ['crédit', cr]];
  all.forEach(([n, r]) => {
    t.check(`choc ${n} : décision en attente (sans fenêtre), annonce au journal, état visible`, r.card && r.toast && r.bar && r.errs === 0, `carte ${r.card}, toast ${r.toast}, bandeau ${r.bar}, erreurs ${r.errs}`);
    t.check(`choc ${n} : humeur −8 à −25 points par rapport au témoin en quelques semaines (${gap(r, 'h', -1).toFixed(1)})`, gap(r, 'h', -1) >= 8 && gap(r, 'h', -1) <= 25, '');
    t.check(`choc ${n} : PIB plus bas que le témoin (−${(gap(r, 'g', -1) * 100).toFixed(1)} pts)`, gap(r, 'g', -1) > 0.01, '');
    t.check(`choc ${n} : chômage plus haut que le témoin (+${(gap(r, 'u') * 100).toFixed(1)} pts)`, gap(r, 'u') > 0.008, '');
  });
  t.check(`énergie : pétrole ×${ratio(en, 'px').toFixed(2)} le témoin (option subir), ×${ratio(en0, 'px').toFixed(2)} (option couverture) ; inflation +${(gap(en, 'i') * 100).toFixed(1)} pts`, ratio(en, 'px') >= 1.5 && ratio(en0, 'px') >= 1.25 && ratio(en0, 'px') < ratio(en, 'px') && gap(en, 'i') > 0.008, '');
  t.check(`pandémie : demande ×${Math.min(...pa.ser.dem).toFixed(2)} (−30 %) ; télétravail ×${Math.min(...pa0.ser.dem).toFixed(2)} (−15 %) ; rebond ×${Math.max(...pa.ser.dem).toFixed(2)}`, Math.min(...pa.ser.dem) < 0.76 && Math.min(...pa.ser.dem) > 0.6 && Math.min(...pa0.ser.dem) > 0.8 && Math.min(...pa0.ser.dem) < 0.9, '');
  t.check(`crédit : taux +${(gap(cr, 'rate') * 100).toFixed(1)} pts, plafond de dette −${Math.round(100 * (1 - Math.min(...cr.ser.lim) / ctl.ser.lim[0]))} %, prime boursière −${gap(cr, 'prem', -1).toFixed(2)}`, gap(cr, 'rate') > 0.025 && Math.min(...cr.ser.lim) < ctl.ser.lim[0] * 0.75 && gap(cr, 'prem', -1) > 0.01, '');
  t.check(`crédit, désendettement : choc plus léger (taux +${(gap(cr0, 'rate') * 100).toFixed(1)} vs +${(gap(cr, 'rate') * 100).toFixed(1)} pts)`, gap(cr0, 'rate') < gap(cr, 'rate'), '');
  t.check(`chocs : terminés après 200 jours supplémentaires (actif : ${[en.end, pa.end, cr.end].join('/')}) ; pandémie : PIB rebondit (${(pa.endG * 100).toFixed(1)} %)`, !en.end && !pa.end && !cr.end, '');

  // 3. Transmission du taux directeur aux biens durables et au logement
  { const pg = await L.newPage({ wait: 400 });
    const r = await pg.evaluate(() => { const W = window.WSE, S = W.S, M = W.macro, o = {}; [0.02, 0.04, 0.09].forEach(rt => { S.macro.rate = rt; o[rt] = { fr: M.rateF('fridge'), est: M.rateF('house_wood'), bread: M.rateF('bread'), recF: M.recF('fridge') }; }); return o; });
    t.check(`taux : réfrigérateur ×${r[0.02].fr.toFixed(2)} (2 %) / ×${r[0.04].fr.toFixed(2)} (4 %) / ×${r[0.09].fr.toFixed(2)} (9 %)`, r[0.02].fr > r[0.04].fr && r[0.04].fr > r[0.09].fr && r[0.09].fr >= 0.88 && r[0.02].fr <= 1.08, '');
    t.check(`taux : logement ×${r[0.02].est.toFixed(2)} / ×${r[0.04].est.toFixed(2)} / ×${r[0.09].est.toFixed(2)} ; pain insensible (×${r[0.09].bread.toFixed(2)})`, r[0.02].est > r[0.04].est && r[0.04].est > r[0.09].est && r[0.09].est >= 0.8 && r[0.09].bread === 1, '');
    await pg.context().close(); }

  // 4. Sauvegarde : ancienne sauvegarde (sans champs de cycle, humeur saturée, chômage 0) rechargée sans erreur
  { const ctx = await (await L.browser()).newContext({ viewport: { width: 1280, height: 900 } });
    let pg = await L.newPage({ ctx, wait: 500 }); await L.setup(pg, { cash: 2e9 }); await L.inject(pg);
    await pg.evaluate(SETUP(5, false)); await pg.evaluate(() => { window.T.stepN(60); const S = window.WSE.S; S.moodEv = -7; while (S.day % 5 !== 0) window.WSE.step(); });
    const info = await pg.evaluate(() => { const sv = JSON.parse(localStorage.getItem('wse-city-v8')); const ok = sv.macro && sv.macro.v1 != null && sv.mev != null;
      ['v1', 'amp', 'ar', 'bEnd', 'nairu', 'uL', 'sk', 'sh', 'shLast', 'bf'].forEach(k => delete sv.macro[k]); delete sv.mev; sv.st.happy = 93; sv.st.unemp = 0; sv.v = 8; localStorage.setItem('wse-city-v8', JSON.stringify(sv)); return { ok }; });
    t.check('sauvegarde : nouveaux champs (cycle, hystérésis, humeur d\'événement) enregistrés', info.ok, '');
    await pg.close(); pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); await pg.goto(L.URL); await pg.evaluate(() => window.WSE.setSpeed(0)); await L.inject(pg);
    const r = await pg.evaluate(() => { const S = window.WSE.S, T = window.T, u = [], h = []; T.stepN(120); for (let i = 0; i < 40; i++) { T.stepN(5); u.push(S.stats.unemp); h.push(S.stats.happy); } return { u: Math.min(...u), h0: h[0], h1: h[h.length - 1], nan: T.scan(), v1: S.macro.v1 != null, mev: S.moodEv }; });
    t.check(`ancienne sauvegarde : se recharge, 160 jours sans NaN, chômage >= 3 % (${(r.u * 100).toFixed(1)} %), humeur ramenée de 93 à ${r.h1.toFixed(0)}`, r.nan.length === 0 && r.u >= 0.03 && r.h1 < 88 && r.v1 && pg.errs.length === 0, pg.errs.slice(0, 2).join(';'));
    await ctx.close(); }
};
