// Passe 83 : rythme de progression (docs/RYTHME_PROGRESSION.md). Missions par caste, jalons de fortune et de ville, défi de 30 jours, duel du mois,
// gestes utiles pendant l'épargne, prêt de projet du banquier IA. Vérifie :
//  1. aucune mission n'est validée gratuitement au départ (6 castes, 3 jours sans rien faire) ;
//  2. sur 3 castes jouées par leur playbook (tools/bot_lib.js), l'intervalle maximal entre deux jalons majeurs (×valeur, palier de fortune, mission,
//     jalon de fortune, palier de ville) reste sous RY_MAX jours (≈ 5 min réelles à 0,75 s par jour) ;
//  3. aucune récompense automatique ne touche l'économie : même graine, même bot, rythme actif ou coupé (S.ryOff) => même valeur et même trésorerie ;
//  4. sauvegarde en cours de chaîne de missions (missions actives, faites, en réserve, défi, jetons) relue à l'identique, la chaîne continue ;
//  5. prêt de projet : hors plafond ordinaire, remboursé chaque jour, refusé sans EBE ; geste utile « chantier » abordable et réalisable ;
//  6. mobile 390×844 : la ligne du rythme n'élargit pas la page et reste repliée dans le HUD compact (visible une fois déplié).
exports.name = 'Rythme de progression (missions, jalons, défis, prêt de projet)';
const RY_MAX = 400, DAYS = 720, SEED = 6000;
const FAMI = ['s1', 's2', 's3', 's4', 'off', 'miron', 'mcopper', 'mcoal', 'mgold', 'well'];
const PRESET = {   // copie de tools/sim_batch.js (agri, negoce, baron)
  agriculteur: { lev: 0.4, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.5, bourse: false, play: 'agriculteur', fam: ['fwheat', 'fsugar', 'fcotton', 'fvine', 'fcattle', 'fchicken', 'fpig', 'fsheep', 's1', 's2', 's3'] } },
  negociant: { lev: 0.5, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.6, bourse: false, play: 'negociant', fam: FAMI } },
  industriel: { lev: 0.5, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.6, bourse: false, play: 'industriel', prods: ['bread', 'utensils', 'bike', 'jeans', 'headache', 'cough', 'cream', 'blender', 'watch', 'perfume'], fam: FAMI } }
};
const START = ([caste, P, seed, src, off, tel]) => {
  const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true }));
  W.startMode('round'); const S = W.S; S.rs = seed; S.noEv = false; W.setCaste(caste); W.setSpeed(0); ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
  S.mode.w0 = S.cash; if (off) S.ryOff = 1; if (tel) W.tel.enable(true);
  if (src) { (0, eval)(src); window.BOT.P.lev = P.lev; window.BOT.P.idle = 0; Object.assign(window.BOT.P, { fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false }, P.p); }
};
exports.run = async (t, L) => {
  // ---- 1. départ : aucune mission validée sans rien faire (6 castes)
  {
    const pg = await L.newPage({ wait: 600 });
    const r = await pg.evaluate(START => { const W = window.WSE, out = {}; ['industriel', 'negociant', 'agriculteur', 'banquier', 'promoteur', 'innovateur'].forEach(k => { (0, eval)('(' + START + ')')([k, null, 7101, null, 0, 0]); for (let i = 0; i < 3; i++) W.step(); const R = W.ry.S(), v = W.ry.view(); out[k] = { done: Object.keys(R.md).length, act: v.mis.map(m => [m.id, m.p, m.g]), first: (W.ry.CH[k] || [])[0].id }; }); return out; }, START.toString());
    const bad = Object.keys(r).filter(k => r[k].done > 0 || !r[k].act.length || r[k].act.some(a => a[1] >= a[2]));
    t.check('départ : aucune mission validée gratuitement (6 castes, 3 jours sans action), la première mission de chaque caste est active', bad.length === 0, bad.length ? JSON.stringify(bad.map(k => [k, r[k]])) : Object.keys(r).map(k => k + ':' + r[k].act.map(a => a[0]).join('+')).join(' '));
    t.check('départ : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
    await pg.context().close();
  }
  // ---- 2. trois castes jouées par leur playbook : intervalle maximal entre deux jalons majeurs
  let saveCtx = null;
  for (const caste of Object.keys(PRESET)) {
    const P = PRESET[caste], pg = await L.newPage({ wait: 600 });
    await pg.evaluate(([src, a]) => (0, eval)('(' + src + ')')(a), [START.toString(), [caste, P, SEED, L.BOT_SRC, 0, 1]]);
    const r = await pg.evaluate(([every, D]) => { const W = window.WSE, S = W.S, B = window.BOT; while (S.day < D && !S.mode.done) { for (let k = 0; k < every; k++) W.step(); B.tick(); }
      const ev = W.tel.events().filter(e => /^(mult|tier|bn)$/.test(e[2]) || (e[2] === 'jalon' && /^(mission|val|ville)$/.test(e[3] && e[3].k))).map(e => e[1]), all = W.tel.events().filter(e => e[2] === 'jalon').map(e => [e[1], e[3].k]);
      const ds = Array.from(new Set([1].concat(ev, [S.day]))).sort((a, b) => a - b); let gap = 0, at = 0; for (let i = 1; i < ds.length; i++) if (ds[i] - ds[i - 1] > gap) { gap = ds[i] - ds[i - 1]; at = ds[i - 1]; }
      const R = W.ry.S(), kinds = {}; all.forEach(x => { kinds[x[1]] = (kinds[x[1]] || 0) + 1; });
      return { gap, at, n: ev.length, kinds, md: Object.keys(R.md), v: W.valuation(), day: S.day }; }, [P.every, DAYS]);
    t.info(`${caste} : ${r.n} jalons majeurs en ${r.day} j, plus long creux ${r.gap} j (après le jour ${r.at}) ; par type ${JSON.stringify(r.kinds)} ; missions ${r.md.join(' ')} ; valeur ${Math.round(r.v / 1e6)} M$`);
    t.check(`${caste} : intervalle maximal entre deux jalons majeurs ≤ ${RY_MAX} jours (≈ ${Math.round(RY_MAX * 0.75 / 60)} min) sur ${DAYS} jours`, r.gap <= RY_MAX, r.gap + ' j');
    t.check(`${caste} : au moins 3 missions de caste accomplies en ${DAYS} jours`, r.md.length >= 3, r.md.join(' '));
    t.check(`${caste} : 0 erreur de page`, pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
    if (caste === 'industriel') saveCtx = pg; else await pg.context().close();
  }
  // ---- 3. sauvegarde en cours de chaîne de missions, puis reprise
  {
    let pg = saveCtx; const ctx = pg.context();
    const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S, R = W.ry.S(); R.ex = Math.max(R.ex, 1); W.save(); return JSON.parse(JSON.stringify({ day: S.day, md: R.md, act: R.act, pk: R.pk, mi: R.mi, ser: R.ser, df: R.df, ex: R.ex, cl: R.cl, vi: R.vi, pi: R.pi, gem: W.rd.st().gem })); });
    await pg.close();
    pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); await pg.goto(L.URL); await pg.waitForTimeout(600);
    const re = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); const R = W.ry.S(), o = JSON.parse(JSON.stringify({ day: S.day, md: R.md, act: R.act, pk: R.pk, mi: R.mi, ser: R.ser, df: R.df, ex: R.ex, cl: R.cl, vi: R.vi, pi: R.pi, gem: W.rd.st().gem }));
      const n0 = Object.keys(R.md).length; for (let i = 0; i < 120; i++) W.step(); o.after = Object.keys(W.ry.S().md).length - n0; o.actAfter = W.ry.S().act.length; o.row = W.ry.row().length; return o; });
    const same = ['md', 'act', 'pk', 'mi', 'ser', 'df', 'ex', 'cl', 'vi', 'pi'].filter(k => JSON.stringify(sv[k]) !== JSON.stringify(re[k])); if (Math.abs(re.day - sv.day) > 1) same.push('day');   // la page peut avancer d'un jour avant la pause
    t.check('sauvegarde en cours de chaîne : missions faites, actives et en réserve, défi, jetons, échelles relus à l\'identique', same.length === 0, same.length ? 'diffèrent : ' + same.join(', ') : `${Object.keys(sv.md).length} faites, actives ${sv.act.map(a => a.id).join('+')}, défi ${sv.df ? sv.df.k : '—'}`);
    t.check('après rechargement : la chaîne continue (missions toujours actives, ligne du rythme affichée), 0 erreur', re.actAfter > 0 && re.row > 0 && pg.errs.length === 0, `${re.after} mission(s) de plus en 120 j ; ${pg.errs.slice(0, 2).join(' ; ')}`);
    // ancienne sauvegarde sans le champ ry : chargée sans erreur, rythme repart sans pluie de récompenses
    const old = await pg.evaluate(() => { const W = window.WSE, k = 'wse-city-v8', d = JSON.parse(localStorage.getItem(k)); delete d.ry; localStorage.setItem(k, JSON.stringify(d)); return true; });
    await pg.close(); pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); await pg.goto(L.URL); await pg.waitForTimeout(600);
    const ro = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); const g0 = W.rd.st().gem; W.step(); W.step(); const R = W.ry.S(); return { vi: R.vi, pi: R.pi, gem: W.rd.st().gem - g0, ry: !!S.ry }; });
    t.check('ancienne sauvegarde sans rythme : chargée sans erreur, échelles initialisées en silence (pas de rafale de jalons)', old && ro.ry && ro.vi >= 0 && ro.gem <= 20 && pg.errs.length === 0, JSON.stringify(ro));
    await ctx.close();
  }
  // ---- 4. aucune incidence automatique sur l'économie : même graine, rythme actif ou coupé
  {
    const res = [];
    for (const off of [0, 1]) {
      const pg = await L.newPage({ wait: 600 }); const P = PRESET.industriel;
      await pg.evaluate(([src, a]) => (0, eval)('(' + src + ')')(a), [START.toString(), ['industriel', P, SEED + 1, L.BOT_SRC, off, 0]]);
      res.push(await pg.evaluate(every => { const W = window.WSE, S = W.S; while (S.day < 360) { for (let k = 0; k < every; k++) W.step(); window.BOT.tick(); } return { v: Math.round(W.valuation()), cash: Math.round(S.cash), loan: Math.round(S.loan || 0), md: S.ry ? Object.keys(S.ry.md).length : 0 }; }, P.every));
      await pg.context().close();
    }
    t.check('économie inchangée : même graine, même bot, rythme actif ou coupé => même valeur, trésorerie et dette au jour 360 (récompenses non monétaires)', res[0].v === res[1].v && res[0].cash === res[1].cash && res[0].loan === res[1].loan && res[0].md > 0 && res[1].md === 0, JSON.stringify(res));
  }
  // ---- 5. prêt de projet et geste utile (chantier)
  {
    const pg = await L.newPage({ wait: 600 }); await pg.evaluate(([src, a]) => (0, eval)('(' + src + ')')(a), [START.toString(), ['industriel', null, 7101, null, 0, 0]]); await L.inject(pg);
    const r = await pg.evaluate(() => {
      const W = window.WSE, S = W.S, o = {}; S.cash = 3e6; S.m30 = [];
      o.q0 = W.ry.ppQuote(10e6);   // aucun EBE : refusé
      for (let i = 0; i < 30; i++) S.m30.push([2e6, 1.2e6]);   // EBE simulé : 1,2 M$ par jour pendant 30 jours (≈ 432 M$ par an)
      const L0 = W.creditLimit(), loan0 = S.loan || 0, cash0 = S.cash; o.q1 = W.ry.ppQuote(10e6); const a = W.ry.ppTake(o.q1.max, 'test');
      o.a = a; o.dLoan = (S.loan || 0) - loan0; o.dCash = S.cash - cash0; o.dLim = W.creditLimit() - L0; const b0 = W.ry.ppBal(); for (let i = 0; i < 10; i++) W.step(); o.paid = b0 - W.ry.ppBal();
      // geste utile : petit marché rentable, assez d'argent pour le chantier du niveau 2
      const c = T.inC('s1'); S.pop = Math.max(S.pop, 200000); S.cash = 3e6; c.profit = 4000; c.conn = true; o.micro = W.ry.micro(0).map(m => m.k); const up0 = c.lvl | 0; o.did = W.ry.act('up', 0); o.pal = !!c.pal; o.up0 = up0;
      return o; });
    t.check('prêt de projet : refusé sans EBE positif', !r.q0.ok && r.q0.max === 0, r.q0.why.join(' ; '));
    t.check('prêt de projet : accordé (≤ 50 % du projet), versé en trésorerie et en dette, hors plafond ordinaire (la marge d\'emprunt ordinaire n\'est pas entamée)', r.a > 0 && r.a <= 5e6 + 1 && Math.abs(r.dLoan - r.a) < 1 && Math.abs(r.dCash - r.a) < 1 && r.dLim >= r.a - 1, JSON.stringify({ a: r.a, dLoan: r.dLoan, dLim: r.dLim }));
    t.check('prêt de projet : remboursé chaque jour (capital sur 5 ans)', r.paid > 0 && Math.abs(r.paid - 10 * r.a / (5 * 360)) < 0.02 * r.a, Math.round(r.paid) + ' $ en 10 jours');
    t.check('geste utile : un chantier d\'amélioration abordable est proposé et lancé en un clic', r.micro.indexOf('up') >= 0 && r.did && r.pal, JSON.stringify(r.micro));
    t.check('prêt de projet et geste utile : 0 erreur', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
    await pg.context().close();
  }
  // ---- 6. mobile 390×844
  {
    const b = await L.browser(), ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    const pg = await L.newPage({ ctx, wait: 1500 });
    await pg.evaluate(([src, a]) => (0, eval)('(' + src + ')')(a), [START.toString(), ['industriel', null, 7101, null, 0, 0]]);
    const r = await pg.evaluate(async () => { const W = window.WSE, S = W.S; for (let i = 0; i < 40; i++) W.step(); W.setSpeed(0); await new Promise(r => setTimeout(r, 700));
      const box = document.querySelector('#objbar .ory'), cs = box ? getComputedStyle(box) : null, o = { has: !!box, shown: cs ? cs.display !== 'none' : false, sw: document.documentElement.scrollWidth, W: innerWidth, cmp: document.body.classList.contains('cmp') };
      const hx = document.getElementById('hudx'); if (hx) hx.click(); await new Promise(r => setTimeout(r, 700)); const b2 = document.querySelector('#objbar .ory'); o.shown2 = !!b2 && getComputedStyle(b2).display !== 'none'; o.w2 = b2 ? Math.round(b2.getBoundingClientRect().width) : 0; o.sw2 = document.documentElement.scrollWidth; return o; });
    t.check('mobile 390×844 : HUD compact, ligne du rythme repliée (la carte garde sa place), aucun débordement horizontal', r.cmp && (!r.has || !r.shown) && r.sw <= r.W, JSON.stringify(r));
    t.check('mobile : HUD déplié, la ligne du rythme est visible et tient dans l\'écran', r.shown2 && r.w2 <= r.W && r.sw2 <= r.W, JSON.stringify({ shown: r.shown2, w: r.w2, sw: r.sw2 }));
    t.check('mobile : 0 erreur', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
    await ctx.close();
  }
};
