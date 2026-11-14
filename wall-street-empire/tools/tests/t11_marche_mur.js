// Passe 27 : marché mûr (produits déjà développés par le marché), licence, offres des autres, achat -> rayon, suggestions, make-or-buy, tests simulés et essai pilote, sauvegarde.
exports.name = 'Marché mûr, offres et suggestions';

exports.run = async (t, L) => {
  // 1. Départ mûr : le Libre démarre en marché mûr, les scénarios 1-2 gardent la R&D complète
  {
    const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
    const A = await pg.evaluate(() => {
      const W = window.WSE; const o = {};
      W.startMode('s1'); o.s1 = W.S.mat | 0; o.s1off = W.mk.offers('bread').length;
      W.startMode('s2'); o.s2 = W.S.mat | 0;
      W.startMode('free'); const S = W.S; o.free = S.mat | 0; S.noEv = true; S.cash = 5e8;
      const ks = W.PKEYS; o.n = ks.length; o.withOff = ks.filter(k => W.mk.offers(k).length >= 3).length; o.max = Math.max(...ks.map(k => W.mk.offers(k).length));
      let badM = 0, badP = 0, badF = 0, badQ = 0, nr = 0;
      ks.forEach(k => W.mk.offers(k).forEach(of => {
        const base = W.PRODUCTS[k].ref * W.QTIER[of.tier].ref * S.cpi;
        if (of.kind === 'riv') { nr++; if (of.margin < 0.05 - 1e-9 || of.margin > 0.2 + 1e-9) badM++; }
        if (of.unit < base * 0.85 || of.unit > base * 1.3 || (of.kind === 'riv' && (of.unit < base * 1.0 || of.unit > base * 1.27))) badP++;
        if (!(of.freight > 0) || of.freight > of.unit * 0.4) badF++;
        if (of.q < 30 || of.q > 95 || of.cap < 1 || !isFinite(of.total) || of.delay < 1) badQ++;
      }));
      o.nr = nr; o.badM = badM; o.badP = badP; o.badF = badF; o.badQ = badQ;
      o.st = ks.filter(k => S.prod[k].st === 'locked').length;
      return o;
    });
    t.check('marché mûr : Libre démarre mûr, scénarios 1-2 en R&D complète (sans offre)', A.free === 1 && A.s1 === 0 && A.s2 === 0 && A.s1off === 0, JSON.stringify({ free: A.free, s1: A.s1, s2: A.s2, off: A.s1off }));
    t.check('marché mûr : presque tous les produits ont des offreurs (>= 3)', A.withOff >= A.n - 2 && A.max <= 6, `${A.withOff}/${A.n}, max ${A.max}`);
    t.check('offres : marge des rivaux entre 5 et 20 %', A.nr > 20 && A.badM === 0, `${A.nr} offres de rivaux, ${A.badM} hors bornes`);
    t.check('offres : prix de marché unique (rivaux : +5 à +20 % du prix de gros, ± qualité ; étrangers : dumping possible), fret > 0 et raisonnable, qualité/délai valides', A.badP === 0 && A.badF === 0 && A.badQ === 0, `prix ${A.badP}, fret ${A.badF}, divers ${A.badQ}`);
    t.check('marché mûr : le joueur part sans aucun produit lancé (il prend une licence ou achète)', A.st === A.n, `${A.st}/${A.n}`);
    t.check('marché mûr : 0 pageerror au démarrage', pg.errs.length === 0, pg.errs[0] || '');
    await pg.context().close();
  }

  // 2. Licence, R&D accélérée, offre achetée -> rayon, vente, pas d'argent gratuit ; calcul pur ; déterminisme
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
  const B = await pg.evaluate(() => {
    const W = window.WSE, T = window.T, S = W.S, o = {};
    W.startMode('free'); S.noEv = true; S.cash = 5e8; S.unlockAll = true; ['caste', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.setSpeed(0); W.setCaste('industriel');
    const sh = T.inC('s1'), sh2 = T.inC('s2'), f1 = T.inP('f1'), f2 = T.inP('f2'); o.built = !!(sh && sh2 && f1 && f2);
    T.stepN(3, true);
    // licence
    const c0 = S.cash; W.launchProduct('sneakers'); const ps = S.prod.sneakers; const lic = c0 - S.cash, rd = Math.round(W.PRODUCTS.sneakers.rnd * W.QTIER[ps.q].rnd);
    o.lic = { st: ps.st, lic: ps.lic, cost: lic, rd, ratio: lic / rd, A: ps.A };
    W.launchProduct('tshirt', 'rd'); const p2 = S.prod.tshirt; o.rdq = { st: p2.st, rnd: p2.rnd, days: W.PRODUCTS.tshirt.days };
    // pure : l'état ne change pas
    const dig = () => JSON.stringify([S.cash, S.rs, S.day, S.prod, S.trials]) + S.grid.filter(c => c && c.slots).length;
    const d0 = dig(); W.mk.inv(); const s1 = JSON.stringify(W.mk.suggest().map(x => [x.pk, Math.round(x.score), x.route, x.why])); const sm1 = JSON.stringify(W.mk.sim('bread', 'make')), sb1 = JSON.stringify(W.mk.sim('bread', 'buy'));
    W.mk.inv(); const s2 = JSON.stringify(W.mk.suggest().map(x => [x.pk, Math.round(x.score), x.route, x.why])); const sm2 = JSON.stringify(W.mk.sim('bread', 'make'));
    o.pure = dig() === d0; o.det = s1 === s2 && sm1 === sm2; o.sugN = JSON.parse(s1).length;
    // suggestions : cohérence
    const sg = W.mk.suggest(); o.sorted = sg.every((x, i) => !i || sg[i - 1].score >= x.score); o.fin = sg.every(x => isFinite(x.score) && x.score >= 0 && x.why.length > 8 && x.un >= 0 && x.un <= 0.9);
    o.lista = W.mk.sgList().slice(0, 6).length;
    const top = sg[0]; o.top = [top.pk, top.route, Math.round(top.profit), top.why];
    // plus d'habitants -> plus de demande non servie (même produit)
    const pk0 = sg.find(x => !S.prod[x.pk].share).pk, u0 = W.mk.unmet(pk0); const pop = S.pop; S.pop = Math.round(pop * 1.6); W.mk.inv(); const u1 = W.mk.unmet(pk0); S.pop = pop; W.mk.inv();
    o.unmet = [u0, u1];
    // make-or-buy
    const m = W.mk.sim('bread', 'make'), b = W.mk.sim('bread', 'buy'), mc = W.mk.makeCost('bread');
    o.mob = { mc: mc.unit, mm: m.margin, bm: b.margin, rp: m.rp, tot: b.o.total, okm: Math.abs(m.margin - (m.rp - m.unitCost)) < 1e-9, okb: Math.abs(b.margin - (b.rp - b.o.total)) < 1e-9, cost: mc.unit > 0 && b.o.total > 0 };
    // achat à une offre -> rayon, vente
    const best = W.mk.best('bread'), of = W.mk.offerAt('bread', best); o.best = [best.name, of.total, of.base];
    const cash1 = S.cash; const okB = W.mk.buy('bread', best.id, 80); const pb = S.prod.bread;
    o.buy = { ok: okB, st: pb.st, res: pb.res, src: W.mk.src('bread'), txt: W.mk.srcTxt('bread'), shelf: S.grid.filter(c => c && c.slots && c.slots.includes('bread')).length };
    T.stepN(25, true);
    o.sold = { stock: pb.stock, sold: pb.sold, rev: pb.rev, spent: S.mkBuy, units: pb.buy.units, cash: S.cash - cash1, share: pb.share };
    // aucune boucle d'argent : coût d'achat par unité >= prix de gros du marché ; revenu en rayon par unité <= prix de rayon max
    o.unitCost = S.mkBuy / Math.max(1, pb.buy.units); o.wh = W.prodPrice('bread');
    // fabriquer aussi -> « mixte »
    W.mk.make('bread'); T.stepN(2, true); o.mix = W.mk.src('bread');
    // concurrence : un produit à plus d'offreurs a un attrait réduit
    o.comp = [W.mk.comp('bread'), W.mk.comp('tshirt')];
    o.err = T.scan().length; return o;
  });
  t.check('licence : produit lancé tout de suite, coût = 30 % de la R&D, redevance activée', B.lic.st === 'on' && B.lic.lic === 1 && Math.abs(B.lic.ratio - 0.3) < 0.01 && B.lic.A >= 0.7, JSON.stringify(B.lic));
  t.check('R&D accélérée : durée divisée par 3', B.rdq.st === 'rnd' && Math.abs(B.rdq.rnd - Math.ceil(B.rdq.days / 3)) <= 1, JSON.stringify(B.rdq));
  t.check('calcul pur : suggestions et prévisions ne modifient pas l\'état (argent, rnd, produits, rayons)', B.pure, '');
  t.check('déterminisme : suggestions et prévisions identiques à l\'appel suivant', B.det && B.sugN >= 40, `${B.sugN} suggestions`);
  t.check('suggestions : triées par score, finies, avec une phrase « pourquoi », 6 cartes affichables', B.sorted && B.fin && B.lista === 6, JSON.stringify(B.top));
  t.check('suggestions : la demande non servie augmente avec la population', B.unmet[1] > B.unmet[0], B.unmet.map(v => v.toFixed(2)).join(' -> '));
  t.check('make-or-buy : coût complet de fabrication, coût livré, marges cohérentes avec le prix en rayon', B.mob.okm && B.mob.okb && B.mob.cost && B.mob.rp > B.mob.mc, `fabriquer ${B.mob.mc.toFixed(2)} (marge ${B.mob.mm.toFixed(2)}) · acheter ${B.mob.tot.toFixed(2)} (marge ${B.mob.bm.toFixed(2)}) · rayon ${B.mob.rp.toFixed(2)}`);
  t.check('achat à un offreur : produit en rayon, source « Acheté à X »', B.buy.ok && B.buy.st === 'on' && B.buy.res === 1 && B.buy.src === 'buy' && /^Acheté à /.test(B.buy.txt) && B.buy.shelf >= 1, JSON.stringify(B.buy));
  t.check('achat -> rayon vendable : le stock arrive et se vend en rayon', B.sold.units > 50 && B.sold.sold > 0 && B.sold.rev > 0, JSON.stringify(B.sold));
  t.check('aucune boucle d\'argent : coût d\'achat par unité > prix de gros du marché (+ fret)', B.unitCost > B.wh * 1.03 && B.unitCost < B.wh * 1.5, `${B.unitCost.toFixed(2)} $ pour un prix de gros de ${B.wh.toFixed(2)} $`);
  t.check('fabriquer en plus d\'acheter : source « Mixte »', B.mix === 'mix', B.mix);
  t.check('la concurrence des offreurs réduit l\'attrait (coefficient < 1 pour des produits très offerts)', B.comp[0] < 1.01 && B.comp[0] > 0.4 && B.comp[1] > 0.4, B.comp.map(v => v.toFixed(2)).join(' / '));
  t.check('état sans valeur non finie', B.err === 0, '' + B.err);

  // 3. Prévision et essai pilote
  const C = await pg.evaluate(days => {
    const W = window.WSE, T = window.T, S = W.S, o = {};
    S.cash = 5e8; W.mk.inv();
    const pk = 'candy', pk2 = 'woodtoys', pk3 = 'chair';
    const sim = W.mk.sim(pk, 'make'), simb = W.mk.sim(pk, 'buy');
    o.sim = { sum: sim.summary, lo: sim.d30.units[0], mid: sim.d30.units[1], hi: sim.d30.units[2], h90: sim.d90.units[1], cap: sim.capex.total, risks: sim.risks.length, sumb: simb.summary };
    const plan = W.mk.trialPlan(pk, 'buy'); o.plan = { ok: plan.ok, why: plan.why, cost: plan.cost, cap: plan.cap, L: plan.L };
    const cash0 = S.cash, tr = W.mk.trialStart(pk, 'buy'); o.start = !!tr; o.paid = cash0 - S.cash; o.cost = tr && tr.cost;
    const tr2 = W.mk.trialStart(pk2, 'buy'), tr3 = W.mk.trialStart(pk3, 'buy'); o.lim = [!!tr2, !!tr3];
    o.only = S.grid.filter(c => c && c.slots && c.slots.includes(pk)).length;
    T.stepN(days, true);
    const t1 = S.trials.find(x => x.id === tr.id); o.res = { status: t1.status, sold: t1.sold, rev: t1.rev, margin: t1.margin, share: t1.share, L: t1.L, left: t1.left };
    const cashBefore = S.cash; const stop = W.mk.trialDecide(tr.id, false); o.stop = { ok: stop, st: S.prod[pk].st, back: S.cash - cashBefore, cost: tr.cost, unit: tr.unit, left: t1.left, buy: S.prod[pk].buy };
    // continuer (deuxième essai)
    const tB = S.trials.find(x => x.pk === pk2); if (tB) { T.stepN(25, true); const t2 = S.trials.find(x => x.id === tB.id); o.t2 = t2.status; const ok = W.mk.trialDecide(tB.id, true); o.go = { ok, st: S.prod[pk2].st, buy: !!S.prod[pk2].buy }; }
    o.err = T.scan().length; return o;
  }, 12);
  t.check('prévision : fourchette basse < centrale < haute, 30 et 90 jours, risques, investissement, phrase de synthèse', C.sim.lo < C.sim.mid && C.sim.mid < C.sim.hi && C.sim.h90 > C.sim.mid * 2 && C.sim.risks === 3 && C.sim.cap > 0 && /unités par mois/.test(C.sim.sum + C.sim.sumb), JSON.stringify(C.sim).slice(0, 300));
  t.check('essai pilote : coût plafonné affiché avant, lot payé à l\'avance, produit en rayon d\'un seul magasin', C.plan.ok && C.start && Math.abs(C.paid - C.cost) < 1 && C.cost <= C.plan.cap + 1 && C.only === 1, JSON.stringify({ plan: C.plan, paid: C.paid, only: C.only }));
  t.check('essais simultanés limités à 2', C.lim[0] === true && C.lim[1] === false, JSON.stringify(C.lim));
  t.check('essai pilote : terminé avec résultat (ventes réelles, marge, part de marché)', C.res.status === 'done' && C.res.sold > 0 && C.res.rev > 0 && C.res.share > 0 && isFinite(C.res.margin), JSON.stringify(C.res));
  t.check('essai arrêté : produit retiré, stock revendu à 80 % du coût au plus (aucun gain gratuit)', C.stop.ok && C.stop.st === 'locked' && C.stop.back <= C.stop.left * C.stop.unit * 0.8 + 1 && C.stop.back < C.stop.cost && !C.stop.buy, JSON.stringify(C.stop));
  t.check('essai continué : achat régulier en place', C.go && C.go.ok && C.go.st === 'on' && C.go.buy, JSON.stringify(C.go));
  t.check('essais : aucune valeur non finie', C.err === 0, '' + C.err);

  // 4. Sauvegarde v8 rétro-compatible
  const D = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, o = {};
    W.save(); const raw = localStorage.getItem(Object.keys(localStorage).find(k => /wse|save/i.test(k) && k !== 'wse-prog' && !/_gal$/.test(k))); o.has = !!raw;
    const d = JSON.parse(raw); o.v = d.v; o.mat = d.mat; o.hasT = Array.isArray(d.trials);
    const want = { mat: S.mat, buys: Object.keys(S.prod).filter(k => S.prod[k].buy).join(','), lic: Object.keys(S.prod).filter(k => S.prod[k].lic).join(',') };
    const L2 = W.load(); o.same = L2 && L2.mat === want.mat && Object.keys(L2.prod).filter(k => L2.prod[k].buy).join(',') === want.buys && Object.keys(L2.prod).filter(k => L2.prod[k].lic).join(',') === want.lic;
    ['mat', 'matPop', 'trials', 'tid', 'mkv'].forEach(k => delete d[k]);
    const key = Object.keys(localStorage).find(k => /wse|save/i.test(k) && k !== 'wse-prog' && !/_gal$/.test(k)); localStorage.setItem(key, JSON.stringify(d));
    const L3 = W.load(); o.old = !!L3 && L3.mat === 0 && Array.isArray(L3.trials) && L3.trials.length === 0 && Object.keys(L3.prod).every(k => L3.prod[k].lic !== undefined);
    return o;
  });
  t.check('sauvegarde v8 : marché mûr, achats et licences survivent au rechargement', D.has && D.v === 8 && D.mat === 1 && D.hasT && D.same, JSON.stringify(D));
  t.check('sauvegarde v8 sans champs de la passe 27 : chargée, marché non mûr, champs par défaut', D.old, '');
  t.check('marché mûr : 0 pageerror sur tout le parcours', pg.errs.length === 0, pg.errs[0] || '');
  await pg.context().close();

  // 5. Interface : encart de bienvenue, cartes « Recommandé pour toi », boutons réels, écran de test, bandeau du catalogue, mobile
  for (const vp of [{ w: 1280, h: 900 }, { w: 390, h: 844 }]) {
    const pu = await L.newPage({ w: vp.w, h: vp.h, wait: 700 });
    const U = await pu.evaluate(() => { const W = window.WSE; W.startMode('free'); W.S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); const h = document.getElementById('hint'); if (h) h.hidden = true; return { welcome: !document.getElementById('mkview').hidden, cards: document.querySelectorAll('#mkview .sgc').length }; });
    t.check(`interface ${vp.w}px : encart de bienvenue avec 3 cartes recommandées`, U.welcome && U.cards === 3, JSON.stringify(U));
    await pu.evaluate(() => window.WSE.mk.act('close')); await L.inject(pu);
    await pu.evaluate(() => { const W = window.WSE, T = window.T; W.S.cash = 5e8; W.S.unlockAll = true; T.inC('s2'); T.inP('f1'); T.inP('f2'); T.stepN(3, true); W.mk.inv(); W.setPview(true); }); await pu.waitForTimeout(300);
    const V = await pu.evaluate(() => { const c = [...document.querySelectorAll('#sgcards .sgc')]; const b = c[0] && [...c[0].querySelectorAll('[data-sg]')].map(x => x.dataset.sg.split(':')[0]); return { n: c.length, btn: b, why: c.every(x => x.querySelector('.sgw').textContent.length > 10), img: c.every(x => x.querySelector('svg')), sw: document.documentElement.scrollWidth <= window.innerWidth + 2 }; });
    t.check(`interface ${vp.w}px : 6 cartes lisibles, boutons Fabriquer / Acheter / Les deux / Tester, image, pas de défilement horizontal`, V.n === 6 && ['make', 'buy', 'both', 'test'].every(k => V.btn.includes(k)) && V.why && V.img && V.sw, JSON.stringify(V));
    await pu.click('#sgchips [data-sg="f:Mode"]'); await pu.fill('#sgq', 'jean'); await pu.waitForTimeout(150);
    const F = await pu.evaluate(() => ({ n: document.querySelectorAll('#sgcards .sgc').length, first: document.querySelector('#sgcards .sgc b') && document.querySelector('#sgcards .sgc b').textContent, focus: document.activeElement.id }));
    t.check(`interface ${vp.w}px : filtre « Mode » + recherche « jean » : seuls les jeans, la saisie garde le focus`, F.n === 1 && /Jeans/.test(F.first) && F.focus === 'sgq', JSON.stringify(F));
    await pu.fill('#sgq', ''); await pu.click('#sgchips [data-sg="f:all"]');
    await pu.click('#sgcards [data-sg^="test:"]'); await pu.waitForTimeout(250);
    const Tt = await pu.evaluate(() => ({ vis: !document.getElementById('mkview').hidden, cols: document.querySelectorAll('#mkview .simc').length, sum: [...document.querySelectorAll('#mkview .simsum')].map(e => e.textContent.length > 20).every(Boolean), pilot: document.querySelectorAll('#mkview [data-sg^="trial:"]').length }));
    t.check(`interface ${vp.w}px : « Tester » ouvre la prévision fabriquer / acheter côte à côte avec essai pilote`, Tt.vis && Tt.cols === 2 && Tt.sum && Tt.pilot === 2, JSON.stringify(Tt));
    await pu.click('#mkview [data-sg="close"]');
    const before = await pu.evaluate(() => Object.keys(window.WSE.S.prod).filter(k => window.WSE.S.prod[k].st === 'on').length);
    await pu.click('#sgcards [data-sg^="buy:"]:not([disabled])'); await pu.waitForTimeout(200);
    const after = await pu.evaluate(() => Object.keys(window.WSE.S.prod).filter(k => window.WSE.S.prod[k].st === 'on').length);
    t.check(`interface ${vp.w}px : « Acheter à X » depuis une carte met le produit en rayon`, after === before + 1, `${before} -> ${after}`);
    await pu.evaluate(() => window.WSE.setPview(false));
    const K = await pu.evaluate(() => { const W = window.WSE, S = W.S; let f = null; for (let i = 0; i < W.N * W.N; i++) { const c = S.grid[i]; if (c && c.t === 'f2') { f = c; break; } } W.openBuilding(f.x, f.y); W.bAct('catalog'); return { strip: document.querySelectorAll('#cview .sgstrip .sgc').length, vis: !document.getElementById('cview').hidden }; });
    t.check(`interface ${vp.w}px : le catalogue d'usine affiche le bandeau « Recommandé pour toi »`, K.vis && K.strip >= 1, JSON.stringify(K));
    t.check(`interface ${vp.w}px : 0 pageerror`, pu.errs.length === 0, pu.errs[0] || '');
    await pu.context().close();
  }
};
