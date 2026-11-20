// Passe 74 : COO à acheter (droit premium SIMULÉ) et score de maîtrise de la supply chain (gratuit).
// Chaîne mal réglée (ferme de blé → moulin → boulangerie → magasins) : sans COO, avec un COO Bronze / Argent / Or, et pilotée par un bot « expert manuel »
// qui applique chaque jour, sans délai ni seuil, le meilleur choix de source que le joueur voit dans la vue fournisseurs (coût livré corrigé de la qualité).
// Attendu : le COO améliore nettement la chaîne mal réglée sans jamais dépasser l'expert (≈ 90-95 % de son résultat) ; sans COO, rien ne change (le manuel
// reste intact et gratuit) ; le score de maîtrise mesure service, rotation, coût livré et ruptures, et le classement dédié ne compte que le pilotage manuel.
exports.name = 'COO (premium simulé) et maîtrise de la supply chain';
const DAYS = 120, SHOTS = process.env.WSE_SHOTS || '';
// Scénario partagé avec l'outil de mesure : corps de fonction (W, S, T) qui monte la chaîne, la dérègle et renvoie { run(mode, D) }.
const SCEN = `
  const N = W.N; S.unlockAll = false; T.frz();
  for (let i = 0; i < 30; i++) T.inC('res');
  const farm = T.put('fwheat', 0, N, 0, N), mill = T.inP('f1'), bak = T.inP('f1'), sh1 = T.inC('s1'), sh2 = T.inC('s2'); T.inP('port');
  W.openBuilding(mill.x, mill.y); W.bAct('recipe:flour'); W.launchProduct('bread'); for (let d = 0; d < 12; d++) { T.frz(); W.step(); }
  W.openBuilding(bak.x, bak.y); W.bAct('recipe:bread'); W.closeBuilding();
  for (let d = 0; d < 20; d++) { T.frz(); W.step(); }
  // dérèglage typique d'un débutant : il rachète au port le blé et la farine qu'il produit, met « Mon réseau » sur un intrant qu'il ne produit pas
  // et sur les produits courants du supermarché (rupture), et garde le fournisseur le plus cher pour le reste
  const ins = Object.keys(W.productInputs('bread')); mill.src = { wheat: 'port' }; bak.src = {};
  ins.forEach(g => { const own = (S.flow.own[g] || 0) > 0; if (own) bak.src[g] = 'port'; else { const sl = W.riv.tr.list(g).filter(s => !s.ems); bak.src[g] = sl.length && g !== ins[ins.length - 1] ? 'co:' + sl.slice().sort((a, b) => W.offerScore(W.supOffer(g, b.id, bak.haul), 0) - W.offerScore(W.supOffer(g, a.id, bak.haul), 0))[0].id : 'local'; } });
  sh2.src = { std: 'local' };
  const chain = [farm, mill, bak, sh1, sh2];
  const expert = () => {   // expert manuel : chaque jour, pour chaque achat, la source la moins chère en coût livré corrigé de la qualité, sans seuil
    const need = {}, list = []; T.bldgs().forEach(c => W.coo.ins(c).forEach(([g, q]) => { need[g] = (need[g] || 0) + q; list.push([c, g, q]); }));
    const own = (S.flow && S.flow.own) || {};
    list.forEach(([c, g]) => { const o = W.coo.opts(c, g, need[g], own[g] || 0), cands = [['auto', o.auto]]; if (o.best && o.best.id !== 'import' && !o.covered) cands.push([o.best.id, o.best.sc]);
      cands.sort((a, b) => a[1] - b[1]); const cur = (c.src && c.src[g]) || 'auto', cs = W.coo.score(c, g, cur, o);
      if (cands[0][0] !== cur && !(cur === 'port' && cands[0][0] === 'import') && cs > cands[0][1] * 1.0001) { c.src = c.src || {}; c.src[g] = cands[0][0] === 'import' ? 'port' : cands[0][0]; } });
  };
  const snap = () => chain.map(c => JSON.stringify(c.src || {})).join(' | ');
  return { chain, ins, snap, run(mode, D) {
    const E = W.ent.S(), LV = { bronze: 1, argent: 2, or: 3 }; if (LV[mode]) { E.prem = 1; W.coo.set(LV[mode]); }
    const src0 = snap(), sal0 = E.coo.sal, cash0 = S.cash; let prof = 0, rup = 0, spend = 0;
    for (let d = 0; d < D; d++) { T.frz(); if (mode === 'expert') expert(); W.step(); chain.forEach(c => { prof += c.profit || 0; spend += (c.inCost || 0) + (c._cogs || 0); if (c.limit && (W.GOODS[c.limit] || c.limit === 'stock')) rup++; }); }
    const sal = E.coo.sal - sal0, sc = W.scm ? W.scm.score() : {};
    return { spendD: Math.round(spend / D), prof: Math.round(prof), sal: Math.round(sal), net: Math.round(prof - sal), rup, src0, src1: snap(), score: sc.score == null ? null : +sc.score.toFixed(1), svc: sc.svc, ratio: sc.ratio, rot: sc.rot, manual: sc.manual, log: E.coo.log.slice(0, 6).map(l => l[1].slice(0, 110)), sav: Math.round(E.coo.sav), adv: E.coo.adv.length };
  } };`;
exports.SCEN = SCEN;

exports.run = async (t, L) => {
  const R = {};
  for (const mode of ['none', 'bronze', 'argent', 'or', 'expert']) {
    const pg = await L.newPage(); await L.setup(pg, { cash: 3e7 }); await L.inject(pg);
    R[mode] = await pg.evaluate(({ mode, D, SCEN }) => { const W = window.WSE, S = W.S, T = window.T; const Z = new Function('W', 'S', 'T', SCEN)(W, S, T); return Z.run(mode, D); }, { mode, D: DAYS, SCEN });
    R[mode].errs = pg.errs.slice(0, 2); await pg.context().close();
  }
  const f = v => (v / 1e6).toFixed(2) + ' M$';
  t.info(Object.keys(R).map(m => `${m} : net ${f(R[m].net)} (salaire ${f(R[m].sal)}), ruptures ${R[m].rup}, score ${R[m].score}`).join(' ; '));
  const ex = R.expert.net, base = R.none.net;
  t.check('le dérèglage coûte cher : la chaîne mal réglée sans COO gagne nettement moins que l\'expert manuel', base < 0.8 * ex, `${f(base)} contre ${f(ex)}`);
  t.check('sans COO, rien ne bouge tout seul : les sources mal réglées restent celles du joueur (manuel intact)', R.none.src0 === R.none.src1, R.none.src1);
  t.check('COO Or : améliore nettement la chaîne mal réglée (≥ 80 % du gain de l\'expert)', R.or.net - base >= 0.8 * (ex - base), `${f(R.or.net)} (sans COO ${f(base)}, expert ${f(ex)})`);
  t.check('COO Or : jamais meilleur que l\'expert manuel, ≈ 90-95 % de son résultat net', R.or.net <= ex && R.or.net >= 0.88 * ex && R.or.net <= 0.97 * ex, `${(R.or.net / ex * 100).toFixed(1)} % de l'expert`);
  t.check('niveaux (résultat de la chaîne avant rémunération du COO) : Bronze ≤ Argent ≤ Or ≤ expert ; net de chaque niveau au-dessus de la chaîne mal réglée', R.bronze.net > base && R.argent.net > base && R.bronze.prof <= R.argent.prof && R.argent.prof <= R.or.prof && R.or.prof <= R.expert.prof, ['bronze', 'argent', 'or'].map(m => `${m} ${(R[m].prof / R.expert.prof * 100).toFixed(1)} % brut, ${(R[m].net / ex * 100).toFixed(1)} % net`).join(' · '));
  t.check('le COO affiche ce qu\'il fait : journal de décisions et économies estimées', R.or.log.length >= 2 && R.or.sav > 0 && R.argent.log.length >= 2, R.or.log.slice(0, 3).join(' || '));
  t.check('Bronze = aide au pilotage : il règle les ruptures et propose le reste (conseils à appliquer)', R.bronze.adv > 0 || R.bronze.log.some(l => /Conseil/.test(l)), R.bronze.log.slice(0, 3).join(' || '));
  t.check('score de maîtrise : mesuré pour tous, plus haut pour l\'expert que pour la chaîne mal réglée', R.expert.score > R.none.score && R.none.score != null, `mal réglée ${R.none.score}, expert ${R.expert.score}, COO Or ${R.or.score}`);
  t.check('score de maîtrise : pilotage manuel reconnu (expert), période COO marquée hors classement', R.expert.manual === true && R.or.manual === false, '');
  t.check('0 erreur JS (5 parties)', Object.keys(R).every(m => !R[m].errs.length), Object.keys(R).map(m => R[m].errs.join(';')).join(' ').trim());

  // ---- droit premium simulé, Diamants, interface, sauvegarde, classement et badges
  const ctx = await (await L.browser()).newContext({ viewport: { width: 1280, height: 900 } });
  let pg = await L.newPage({ ctx }); await L.setup(pg, { cash: 3e7 }); await L.inject(pg);
  const u = await pg.evaluate(async () => { const W = window.WSE, S = W.S, T = window.T, o = {}; const E = W.ent.S();
    for (let i = 0; i < 8; i++) T.inC('res'); const sh = T.inC('s2'); T.inP('port'); T.stepN(3, true); sh.src = { std: 'local' };   // un magasin mal réglé à confier au COO
    o.refused = W.coo.set(2) === false && !E.coo.lv;   // pas de COO sans le droit simulé
    W.setPanel(true); W.setPtab('game'); W.p74Render(); o.game = document.getElementById('entBox').innerText;
    document.querySelector('#entBox [data-p74="prem"]').click(); o.prem = E.prem; o.dia = E.dia;
    W.setPtab('chain'); W.p74Render(); o.chain = document.getElementById('cooBox').innerText.replace(/\s+/g, ' ');
    const b = document.querySelector('#cooBox [data-p74="coo:3"]'); o.btn = !!b && !b.disabled; b.click(); o.lv = E.coo.lv;
    for (let d = 0; d < 6; d++) W.step(); W.p74Render(); o.chain2 = document.getElementById('cooBox').innerText.replace(/\s+/g, ' '); o.scm = document.getElementById('scmBox').innerText.replace(/\s+/g, ' ');
    W.save(); return o; });
  t.check('sans droit premium simulé, le COO ne se recrute pas (le manuel reste complet)', u.refused, '');
  t.check('Menu > Partie : bouton de démonstration « Activer Premium (simulé) », aucun paiement réel annoncé', /Activer Premium \(simulé\)/.test(u.game) && /aucun paiement réel/i.test(u.game) && u.prem === 1 && u.dia >= 300, u.game.slice(0, 160));
  t.check('Menu > Chaîne : carte du COO (niveaux Bronze/Argent/Or, salaire), journal et score supply chain ; carte de maîtrise gratuite', u.btn && u.lv === 3 && /Bronze/.test(u.chain) && /Or/.test(u.chain) && /gratuit/i.test(u.chain) && /JOURNAL DU COO/i.test(u.chain2) && /maîtrise/i.test(u.scm), u.chain2.slice(0, 200));
  await pg.close();
  pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); await pg.goto(L.URL); await pg.evaluate(() => window.WSE.setSpeed(0));
  const re = await pg.evaluate(() => { const S = window.WSE.S; return { prem: S.ent && S.ent.prem, lv: S.ent && S.ent.coo && S.ent.coo.lv, log: S.ent && S.ent.coo ? S.ent.coo.log.length : 0, scm: S.scm ? S.scm.h.length : 0 }; });
  t.check('sauvegarde : droit simulé, niveau du COO, journal et historique de maîtrise relus (champs facultatifs)', re.prem === 1 && re.lv === 3 && re.log > 0 && re.scm > 0, JSON.stringify(re));
  const rk = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.openRank('scm'); const h = document.getElementById('rkBody').innerText;
    // badges : 30 jours de pilotage manuel sans rupture → badges gratuits et Diamants
    S.ent.coo.lv = 0; const d0 = S.ent.dia; S.scm.h = Array.from({ length: 30 }, () => [100, 0, 0, 3, 2, 0, 95, 100, 50, 2, 0]); W.scm.award(); return { h, b: Object.keys(S.scm.b), gain: S.ent.dia - d0, best: S.scm.best, rank: W.scm.rank() }; });
  t.check('Classements > Supply chain : classement de maîtrise (sociétés IA estimées) et badges', /Score de maîtrise/i.test(rk.h) && /BADGES DE MAÎTRISE/i.test(rk.h) && /hors classement|rang/i.test(rk.h), rk.h.slice(0, 200));
  t.check('badges gratuits après 30 jours de pilotage manuel sans rupture (Diamants en prime), record manuel', rk.b.indexOf('r0') >= 0 && rk.b.indexOf('svc') >= 0 && rk.b.indexOf('cost') >= 0 && rk.gain > 0 && rk.best >= 85, JSON.stringify({ b: rk.b, gain: rk.gain, best: rk.best }));
  t.check('rechargement et classement : 0 erreur', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await ctx.close();

  // ---- ancienne sauvegarde (sans ent ni scm) : se charge, aucun COO, premium désactivé
  pg = await L.newPage({ wait: 500 });
  const old = await pg.evaluate(() => { const W = window.WSE; W.save(); const d = JSON.parse(localStorage.getItem('wse-city-v8')); delete d.ent; delete d.scm; localStorage.setItem('wse-city-v8', JSON.stringify(d)); const S0 = W.load(); return { ok: !!S0, prem: S0 && S0.ent ? S0.ent.prem : 0, coo: S0 && S0.ent && S0.ent.coo ? S0.ent.coo.lv : 0, scm: S0 ? S0.scm : 'x' }; });
  t.check('ancienne sauvegarde sans champs premium : se charge, sans COO ni premium', old.ok && !old.prem && !old.coo && old.scm == null, JSON.stringify(old));
  await pg.context().close();

  // ---- bureau 1280×900 et mobile 390×844 : cartes du COO et de la maîtrise lisibles, sans défilement horizontal
  for (const [w, h, tag] of [[1280, 900, 'pc'], [390, 844, 'mobile']]) {
    pg = await L.newPage({ w, h }); await L.setup(pg, { cash: 3e7 }); await L.inject(pg);
    const m = await pg.evaluate(async () => { const W = window.WSE, S = W.S, T = window.T; for (let i = 0; i < 8; i++) T.inC('res'); const sh = T.inC('s2'); T.inP('port'); T.stepN(3, true); sh.src = { std: 'local' };
      W.ent.prem(true); W.coo.set(3); for (let d = 0; d < 8; d++) W.step(); W.setPanel(true); W.setPtab('chain'); W.p74Render(); await new Promise(r => setTimeout(r, 300));
      const box = document.getElementById('cooBox'), r = box.getBoundingClientRect(), btns = [...box.querySelectorAll('button')].map(b => b.getBoundingClientRect().height);
      box.scrollIntoView(); await new Promise(r => setTimeout(r, 200));
      return { inside: r.left >= -1 && r.right <= innerWidth + 1, sw: document.documentElement.scrollWidth, iw: innerWidth, minBtn: Math.min(...btns), txt: box.innerText.length }; });
    if (SHOTS) await pg.screenshot({ path: require('path').join(SHOTS, `t75_${tag}_coo.png`) });
    if (SHOTS) { await pg.evaluate(() => { const S = window.WSE.S; S.ent.coo.lv = 0; S.scm.h = Array.from({ length: 30 }, () => [100, 2, 1, 3, 2, 0, 104, 100, 50, 2, 0]); window.WSE.openRank('scm'); }); await pg.waitForTimeout(300); await pg.screenshot({ path: require('path').join(SHOTS, `t75_${tag}_classement.png`) }); }
    t.check(`${tag} ${w}×${h} : carte du COO dans l'écran, sans défilement horizontal, boutons ≥ 26 px`, m.inside && m.sw <= m.iw + 1 && m.minBtn >= 26 && m.txt > 200, JSON.stringify(m));
    t.check(`${tag} : 0 erreur`, pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
    await pg.context().close();
  }
};
