// Passe 46 : magasins spécialisés (concession, high-tech, luxe, mode, pharmacie, maison, sport, bricolage), inspirés des boutiques de Capitalism Lab.
// Table produit -> famille complète, types constructibles et verrouillés tant que la famille n'est pas connue, assortiment restreint à la famille,
// avantage de spécialiste (attrait, priorité plafonnée par la demande de la famille, marge, vitrine de marque), fiche, Mall, chapitre « Apprendre »,
// déterminisme, sauvegarde, aucune erreur de page.
exports.name = 'Magasins spécialisés (passe 46)';
const WORLD = `(spec) => { const W = window.WSE, S = W.S, T = window.T;
  T.inC('s2'); if (spec) T.inC('smode');
  ['jeans', 'tshirt', 'headache'].forEach(pk => { try { W.quickProduce(pk); } catch (e) {} });
  T.stepN(90, true);
  const shops = []; W.S.grid.forEach(c => { if (c && W.TYPES[c.t] && W.TYPES[c.t].ret && c.t !== 'immo' && c.x + c.y * W.N === W.S.grid.indexOf(c)) shops.push(c); });
  let fash = 0, all = 0; shops.forEach(c => Object.keys(c.sales || {}).forEach(k => { const v = c.sales[k] || 0; all += v; if (k === 'jeans' || k === 'tshirt') fash += v; }));
  const prof = shops.reduce((a, c) => a + (c.profit || 0), 0), sm = shops.find(c => c.t === 'smode');
  return { fash, all, prof, jeansBc: S.prod.jeans.bc || 0, sps: S.prod.jeans.sps || 0, jeansAttrShare: S.prod.jeans.share || 0, smSales: sm ? JSON.stringify(sm.sales) : '', val: W.valuation() };
}`;
exports.run = async (t, L) => {
  // ---- 1. Table des familles et types
  let pg = await L.newPage({ wait: 900 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
  const a = await pg.evaluate(() => {
    const W = window.WSE, P = W.spec.PF, seen = {}, dup = [], unknown = [];
    Object.keys(P).forEach(f => P[f].forEach(k => { if (seen[k]) dup.push(k); seen[k] = f; if (!W.PRODUCTS[k]) unknown.push(k); }));
    const missing = Object.keys(W.PRODUCTS).filter(k => !W.PRODUCTS[k].custom && !seen[k]);
    const com = W.CATS.find(c => c.id === 'com').tools, fam = W.FAMS.com.find(f => f[0] === 'Magasins spécialisés');
    const types = W.spec.KEYS.map(k => { const T = W.TYPES[k]; return { k, ok: !!(T && T.ret && T.ret.fam && T.ret.sells.length && T.cost > 0 && T.upkeep > 0 && T.jobs > 0 && W.ICONS[k] && com.includes(k) && fam && fam[1].includes(k)), fam: T && T.ret.fam, cost: T && T.cost, sells: T && T.ret.sells.join(',') }; });
    return { n: Object.keys(seen).length, nP: Object.keys(W.PRODUCTS).length, dup, unknown, missing, types, fx: ['car', 'laptop', 'watch', 'couture', 'headache', 'perfume', 'bike', 'ebike', 'sofa', 'washer', 'powertools', 'jeans', 'bread'].map(k => k + ':' + W.spec.famOf(k)).join(' '),
      wse: ['mall', 'edu', 'brand', 'coach', 'spec'].every(k => !!W[k]) && typeof W.spec.card === 'function' };
  });
  t.check(`table PRODUCT_FAMILY : les ${a.nP} produits ont exactement une famille`, a.n === a.nP && !a.dup.length && !a.unknown.length && !a.missing.length, JSON.stringify({ n: a.n, dup: a.dup, unknown: a.unknown, missing: a.missing }));
  t.check('familles cohérentes (voiture → auto, ordinateur → high-tech, montre et haute couture → luxe, vélo → sport, vélo électrique → auto, canapé et lave-linge → maison)', a.fx === 'car:auto laptop:tech watch:luxury couture:luxury headache:health perfume:luxury bike:sport ebike:auto sofa:home washer:home powertools:diy jeans:fashion bread:food', a.fx);
  t.check(`${a.types.length} magasins spécialisés dans Commerce > Magasins spécialisés (famille, classes, coût, icône)`, a.types.length === 8 && a.types.every(x => x.ok), JSON.stringify(a.types.filter(x => !x.ok)));
  t.info(a.types.map(x => `${x.k}=${x.fam} [${x.sells}] ${Math.round(x.cost / 1000)} k$`).join(' · '));
  t.check('window.WSE : exports existants conservés et window.WSE.spec ajouté', a.wse, '');

  // ---- 2. Verrous : famille inconnue -> verrouillé ; un généraliste qui vend la classe principale ou un produit lancé de la famille -> débloqué
  const lk = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T; S.unlockAll = false; S.cash = 5e8; W.refreshStats();
    const before = { mode: W.spec.locked('smode'), tool: W.spec.KEYS.every(k => W.spec.locked(k)) };
    let placed = null; for (let y = 14; y < 44 && !placed; y++) for (let x = 14; x < 44 && !placed; x++) if (!W.footprintError(x, y, 'smode')) placed = W.place(x, y, 'smode') ? 'posé' : 'refusé';
    T.inC('s2'); W.refreshStats();
    const after = { mode: W.spec.locked('smode'), auto: W.spec.locked('sauto') };
    const st0 = S.prod.car.st; S.prod.car.st = 'on';   // règle testée isolément : une voiture en vente (lancée ou achetée) rend la famille connue
    const car = { auto: W.spec.locked('sauto'), carOn: S.prod.car.st }; S.prod.car.st = st0;
    S.unlockAll = true; return { before, placed, after, car, need: W.spec.need('sauto') };
  });
  t.check('au départ (aucun commerce, aucun produit) : tous les spécialisés sont verrouillés et la pose est refusée', lk.before.tool && lk.before.mode && lk.placed === 'refusé', JSON.stringify(lk));
  t.check('un supermarché (rayon manufacturé) débloque la boutique de mode, pas la concession (classe luxe)', !lk.after.mode && lk.after.auto, JSON.stringify(lk.after));
  t.check('une voiture en vente débloque la concession (la famille est connue)', !lk.car.auto, JSON.stringify(lk.car) + ' · ' + lk.need);
  await pg.context().close();

  // ---- 3. Assortiment, plafonnement par la demande de la famille, fiche, Mall, Apprendre
  pg = await L.newPage({ wait: 900 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
  const b = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, N = W.N;
    T.inC('s3'); const m = T.inC('smode'), ph = T.inC('spharma'), au = T.inC('sauto');
    ['jeans', 'headache', 'phone'].forEach(pk => { try { W.quickProduce(pk); } catch (e) {} });
    T.stepN(60, true);
    const sk = c => { W.openBuilding(c.x, c.y); const t = document.getElementById('bview').innerText; W.closeBuilding(); return t; };
    const fams = c => Object.keys(c.sales || {}).filter(k => k.indexOf('g_') !== 0).map(k => W.spec.famOf(k));
    const f0 = { m: fams(m), ph: fams(ph), au: fams(au) };
    // un produit hors famille forcé dans un rayon est ignoré (sauvegarde trafiquée)
    m.slots = (m.slots || W.spec.T.smode && Array(8).fill(null)).slice(); m.slots[0] = 'headache';
    T.stepN(2, true);
    const dw = S._dw.cls, cap = {}; ['basic', 'std', 'lux'].forEach(cl => { let g = 0; [m, ph, au].forEach(c => { g += (c.sales && c.sales['g_' + cl]) || 0; }); cap[cl] = { sold: g, max: ['fashion', 'health', 'auto'].reduce((a, f) => a + W.spec.share(f, cl), 0) * dw[cl].Dc }; });
    const txt = sk(m), mall = W.mall.html(), pk = Object.keys(m.sales || {});
    W.edu.show('spec'); const edu = document.getElementById('eduBody') ? document.getElementById('eduBody').innerText : '';
    return { mFams: f0.m, phFams: f0.ph, auFams: f0.au, headacheInMode: !!(m.sales && m.sales.headache), shelf: m.slots, cap, txt, mall, edu, items: pk, gens: Object.keys(au.sales || {}).filter(k => k.indexOf('g_') === 0) };
  });
  t.check('assortiment restreint : la boutique de mode ne vend que de la mode, la pharmacie que de la santé, la concession que de l\'automobile', b.mFams.every(f => f === 'fashion') && b.phFams.every(f => f === 'health') && b.auFams.every(f => f === 'auto') && b.mFams.length > 0, JSON.stringify({ m: b.mFams, ph: b.phFams, au: b.auFams }));
  t.check('un produit hors famille placé de force dans un rayon de la boutique de mode n\'y est jamais vendu', !b.headacheInMode, JSON.stringify(b.items));
  t.check('panier de classe des spécialistes plafonné par la part de leurs familles dans la demande (aucun exploit)', ['basic', 'std', 'lux'].every(cl => b.cap[cl].sold <= b.cap[cl].max + 1e-6), JSON.stringify(b.cap, (k, v) => typeof v === 'number' ? Math.round(v * 10) / 10 : v));
  t.check('fiche du magasin : famille, avantage chiffré, part de marché de la famille et conseil', /Magasin spécialisé/i.test(b.txt) && /Attrait des produits de la famille\s*\+\d+ %/i.test(b.txt) && /Part de marché de la famille/i.test(b.txt) && /Conseil :/i.test(b.txt) && !L.BAD_TXT.test(b.txt), (b.txt.match(/Magasin spécialisé[\s\S]{0,300}/i) || [b.txt.slice(0, 200)])[0].replace(/\n/g, ' | ').slice(0, 300));
  t.check('panneau « Le Mall » : ligne « Magasins spécialisés présents » avec la boutique de mode', /Magasins spécialisés présents/.test(b.mall) && /Boutique de mode ×1/.test(b.mall), (b.mall.match(/Magasins spécialisés présents.{0,160}/) || [''])[0]);
  t.check('onglet Apprendre : chapitre « Généraliste ou spécialiste ? » (panier moyen, marge, zone de chalandise, marque)', /Panier moyen/i.test(b.edu) && /Zone de chalandise/i.test(b.edu) && /Effet sur la marque/i.test(b.edu) && /Marge/i.test(b.edu) && !L.BAD_TXT.test(b.edu), b.edu.slice(0, 160).replace(/\n/g, ' | '));
  t.check('après 60 jours, trois spécialistes et toutes les ouvertures : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' ; '));

  // ---- 4. Sauvegarde : le magasin et la part vendue en spécialiste (ps.sps) survivent au rechargement
  const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.save(); let c = null; S.grid.forEach(q => { if (q && q.t === 'smode' && !c) c = q; }); return { x: c.x, y: c.y, sps: S.prod.jeans.sps || 0, key: Object.keys(localStorage).find(k => /^wse-city-v8$/.test(k)) }; });
  await pg.reload(); await pg.waitForTimeout(1500);
  const rl = await pg.evaluate(p => { const W = window.WSE, S = W.S, c = S.grid[p.y * W.N + p.x]; return { t: c && c.t, sps: S.prod.jeans.sps || 0 }; }, sv);
  t.check('sauvegarde (wse-city-v8) : la boutique de mode et la part vendue en spécialiste sont rechargées', sv.key === 'wse-city-v8' && rl.t === 'smode' && Math.abs(rl.sps - sv.sps) < 1e-6 && sv.sps > 0, JSON.stringify({ sv, rl }));
  t.check('rechargement : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' ; '));
  await pg.context().close();

  // ---- 5. Avantage du spécialiste : même monde avec ou sans boutique de mode ; déterminisme
  const run = async spec => { const p = await L.newPage({ wait: 900 }); await L.setup(p, { cash: 5e8, noAid: true }); await L.inject(p); const r = await p.evaluate(`(${WORLD})(${spec})`); r.errs = p.errs.length; await p.context().close(); return r; };
  const A = await run(false), B = await run(true), B2 = await run(true);
  t.info(`sans spécialiste : mode ${A.fash.toFixed(1)} u/j, capital de marque jeans ${A.jeansBc.toFixed(1)} · avec : mode ${B.fash.toFixed(1)} u/j, capital ${B.jeansBc.toFixed(1)} (part vendue en spécialiste ${Math.round(B.sps * 100)} %)`);
  t.check('avec une boutique de mode, la famille mode se vend plus (attrait du spécialiste face aux rivaux)', B.fash > A.fash * 1.03, `${A.fash.toFixed(1)} → ${B.fash.toFixed(1)} u/j`);
  t.check('vitrine de marque : le capital de marque des jeans monte plus vite quand ils sont vendus en boutique spécialisée', B.jeansBc > A.jeansBc && B.sps > 0.1, `${A.jeansBc.toFixed(2)} → ${B.jeansBc.toFixed(2)} (sps ${B.sps.toFixed(2)})`);
  t.check('déterminisme : deux parties identiques donnent exactement les mêmes ventes et la même valorisation', B.fash === B2.fash && B.val === B2.val && B.smSales === B2.smSales, `${B.fash} / ${B2.fash} · ${Math.round(B.val)} / ${Math.round(B2.val)}`);
  t.check('mondes comparés : 0 erreur de page', A.errs + B.errs + B2.errs === 0, `${A.errs} ${B.errs} ${B2.errs}`);
};
