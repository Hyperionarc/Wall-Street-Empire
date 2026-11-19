// Chaîne, prix et demande à la Capitalism Lab (docs/CAPLAB_CHAINE_PRIX_DEMANDE.md, §7) :
// 7.1 la qualité des fournisseurs se paie, pèse dans le choix et passe dans la qualité des produits ;
// 7.2 le directeur des prix (COO) vise la note de la concurrence (+0 / +10 / +20) et relève le prix quand l'offre manque ;
// 7.3 les producteurs locaux (marque blanche) rattrapent lentement la qualité vendue sur le marché.
exports.name = 'Chaîne, prix et demande CapLab (passe 61)';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);
  // ---------- 7.1 Fournisseurs ----------
  const a = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, C = W.cl, out = {};
    // corrélation prix-qualité sur tous les biens, moyenne des prix
    const xs = [], ys = []; Object.keys(S.price).forEach(g => { C.supplierList(g).forEach(s => { if (s.name.indexOf('(') > 0) return; xs.push(s.q); ys.push(s.pf); }); });
    const m = v => v.reduce((p, x) => p + x, 0) / v.length, mx = m(xs), my = m(ys);
    let sxy = 0, sxx = 0, syy = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
    out.corr = sxy / Math.sqrt(sxx * syy); out.meanPf = my; out.n = xs.length;
    // note de choix : qualité contre prix selon le poids de la qualité
    const hi = { unit: 1.18, freight: 0.05, q: 90 }, lo = { unit: 0.78, freight: 0.05, q: 40 };
    out.q50 = C.offerScore(hi, 0.5) < C.offerScore(lo, 0.5); out.q0 = C.offerScore(lo, 0) < C.offerScore(hi, 0); out.q25 = C.offerScore(lo, 0.25) < C.offerScore(hi, 0.25);
    out.noQ = Math.abs(C.offerScore(hi) - (1.18 + 0.05 * (0.2 + 1.6 * 0.5))) < 1e-9;   // sans poids de qualité : l'ancienne formule (coût + fret pondéré)
    // usine d'un produit fini : la qualité pèse (part des intrants) ; magasin : presque pas
    W.launchProduct('jeans'); const ps = S.prod.jeans; ps.st = 'on';
    const f = T.inP('f2'); f.prod = 'jeans'; f.conn = true; const shop = T.inC('s1');
    out.qwF = C.buyerQw(f); out.qwS = C.buyerQw(shop);
    // propagation : même usine, fournisseur de meilleure ou de moins bonne qualité
    const g = Object.keys(W.productInputs ? W.productInputs('jeans') : {}).find(k => k !== 'pack') || Object.keys(W.PRODUCTS.jeans.in).find(k => k !== 'pack');
    const sl = C.supplierList(g).slice().sort((p, q) => p.q - q.q), best = sl[sl.length - 1], worst = sl[0];
    f.src = { [g]: 'co:' + best.id }; C.updInputQ('jeans'); out.iqHi = ps._iq; out.fiHi = ps._fi; out.tqHi = C.trueQ('jeans');
    f.src = { [g]: 'co:' + worst.id }; C.updInputQ('jeans'); out.iqLo = ps._iq; out.fiLo = ps._fi; out.tqLo = C.trueQ('jeans');
    f.src = { [g]: 'port' }; C.updInputQ('jeans'); out.iqPort = ps._iq;
    out.g = g; out.qHi = best.q; out.qLo = worst.q;
    // vue fournisseur : la note affichée suit le même calcul que le choix automatique
    const best2 = C.bestOffer(g, f.haul, C.buyerQw(f)); out.bestId = best2.id;
    return out;
  });
  t.check('fournisseurs : la qualité se paie (corrélation prix-qualité > 0,6) ; prix moyen inchangé (0,95-1,05)', a.corr > 0.6 && a.meanPf > 0.95 && a.meanPf < 1.05, `corr ${a.corr.toFixed(2)}, prix moyen ${a.meanPf.toFixed(3)} (${a.n} offres)`);
  t.check('choix : à 50 % de poids, la qualité 90 bat le moins cher de qualité 40 ; à 25 % et à 0 %, le moins cher gagne', a.q50 && a.q25 && a.q0, JSON.stringify({ q50: a.q50, q25: a.q25, q0: a.q0 }));
  t.check('sans poids de qualité, la note est l\'ancienne (coût + fret pondéré)', a.noQ);
  t.check('poids de la qualité : usine de produit fini > magasin', a.qwF > 0.3 && a.qwS < 0.1, `usine ${a.qwF.toFixed(2)}, magasin ${a.qwS.toFixed(2)}`);
  t.check('propagation : fournisseur de qualité haute > basse dans la qualité livrée et la qualité réelle du produit', a.iqHi > a.iqLo && a.fiHi > a.fiLo && a.tqHi > a.tqLo, `${a.g} : q ${a.qLo}→${a.qHi} ; livrée ${a.iqLo}→${a.iqHi} ; trueQ ${a.tqLo.toFixed(1)}→${a.tqHi.toFixed(1)}`);
  t.check('import : qualité livrée du port (55)', a.iqPort === 55, 'port ' + a.iqPort);
  // ---------- 7.2 Directeur des prix ----------
  const b = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, C = W.cl, ps = S.prod.jeans, out = {};
    S.pol = S.pol || {}; S._dw = S._dw || {}; S._dw.pd = {}; ps.sold = 0; ps.stock = 0; ps.pf = 1; delete ps.pxm;
    S.pol.px = 'man'; for (let i = 0; i < 30; i++) C.stepCooPrice(); out.man = ps.pf;
    const run = k => { S.pol.px = k; ps.pf = 1; for (let i = 0; i < 80; i++) C.stepCooPrice(); return { pf: ps.pf, ov: C.productScore('jeans').overall, cmp: C.compOv('jeans') }; };
    out.norm = run('norm'); out.agr = run('agr'); out.tagr = run('tagr');
    // goulot : 1 000 u demandées, 300 vendues, plus de stock -> hausse de 1 %/jour quelle que soit la politique
    S.pol.px = 'norm'; ps.pf = 1; S._dw.pd = { jeans: 1000 }; ps.sold = 300; ps.stock = 0; for (let i = 0; i < 10; i++) C.stepCooPrice(); out.short = ps.pf; out.shortFlag = ps._coo && ps._coo.short;
    // production nulle : aucune hausse (rien à vendre plus cher)
    ps.pf = 1; ps.sold = 0; for (let i = 0; i < 10; i++) C.stepCooPrice(); out.noProd = ps.pf;
    // le joueur reprend la main : le COO ne touche plus ce produit
    S._dw.pd = {}; ps.pf = 1.3; ps.pxm = 1; for (let i = 0; i < 10; i++) C.stepCooPrice(); out.manual = ps.pf; delete ps.pxm;
    // jamais sous le coût des intrants
    const inp = W.productInputs('jeans'); let u = 0; Object.keys(inp).forEach(g => { u += inp[g] * S.price[g]; }); out.unit = u / W.PRODUCTS.jeans.out; out.priceAgr = W.prodPrice('jeans');
    S.pol.px = 'man';
    return out;
  });
  t.check('COO manuel (défaut) : le prix ne bouge pas', b.man === 1, 'pf ' + b.man);
  const okNorm = Math.abs(b.norm.ov - b.norm.cmp) < 2.5 || b.norm.pf <= 0.61 || b.norm.pf >= 1.59;
  t.check('COO normal : note du produit ≈ note de la concurrence (±2,5) ou prix en butée', okNorm, `note ${b.norm.ov.toFixed(1)} / concurrence ${b.norm.cmp.toFixed(1)}, pf ${b.norm.pf.toFixed(3)}`);
  t.check('COO agressif < normal, très agressif ≤ agressif (prix plus bas pour viser +10 / +20 points)', b.agr.pf < b.norm.pf && b.tagr.pf <= b.agr.pf + 1e-9, `${b.norm.pf.toFixed(3)} > ${b.agr.pf.toFixed(3)} ≥ ${b.tagr.pf.toFixed(3)}`);
  t.check('COO agressif : jamais sous le coût des intrants', b.priceAgr >= b.unit * 0.999, `prix ${b.priceAgr.toFixed(2)} / coût ${b.unit.toFixed(2)}`);
  t.check('goulot (demande > livraisons) : le prix monte de ≈ 1 %/jour quelle que soit la politique', b.short > 1.09 && b.short < 1.12 && b.shortFlag === 1, 'pf ' + b.short.toFixed(4));
  t.check('sans production : pas de hausse « goulot »', b.noProd <= 1.0001 || b.noProd < b.short, 'pf ' + b.noProd.toFixed(4));
  t.check('curseur touché par le joueur : le COO ne modifie plus ce produit', b.manual === 1.3, 'pf ' + b.manual);
  // ---------- 7.3 Producteurs locaux ----------
  const c = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, C = W.cl, ps = S.prod.jeans, out = {};
    delete S.locQ; out.q0 = C.locQ('std'); out.a0 = C.locAttr('std');
    ps.sold = 0; for (let i = 0; i < 200; i++) C.stepLocQ({ basic: 1000, std: 800, lux: 100 }); out.idle = C.locQ('std');   // rien vendu sous ta marque : rien ne bouge
    ps.rt = 95; const tr = []; for (let d = 0; d < 720; d++) { ps.sold = 400; C.stepLocQ({ basic: 1000, std: 800, lux: 100 }); if (d === 359 || d === 719) tr.push(C.locQ('std')); }
    out.y1 = tr[0]; out.y2 = tr[1]; out.a2 = C.locAttr('std');
    ps.rt = 20; for (let d = 0; d < 2000; d++) { ps.sold = 400; C.stepLocQ({ basic: 1000, std: 800, lux: 100 }); } out.low = C.locQ('std');   // mauvaise qualité : les locaux ne régressent pas sous leur qualité de départ
    S.opt = Object.assign(S.opt || {}, { local: 0 }); S.locQ = { std: 55 }; ps.rt = 95; for (let d = 0; d < 720; d++) { ps.sold = 400; C.stepLocQ({ basic: 1000, std: 800, lux: 100 }); } out.comp0 = C.locQ('std'); S.opt.local = 2;
    // sauvegarde v8 : clé optionnelle lq ; une sauvegarde sans lq garde la qualité de départ
    S.locQ = { basic: 47.5, std: 61.25, lux: 70 }; W.save(); const raw = JSON.parse(localStorage.getItem('wse-city-v8')); out.saved = raw.lq && raw.lq.std === 61.25;
    const d1 = W.load(); out.loaded = d1 && d1.locQ && d1.locQ.std === 61.25;
    delete raw.lq; localStorage.setItem('wse-city-v8', JSON.stringify(raw)); const d2 = W.load(); out.old = !(d2 && d2.locQ);
    return out;
  });
  t.check('locaux : qualité de départ de la ville (55 en manufacturé), attrait 0,5', c.q0 === 55 && Math.abs(c.a0 - 0.5) < 1e-9, `${c.q0} / ${c.a0}`);
  t.check('locaux : rien ne bouge tant que tu ne vends pas sous ta marque (accueil)', c.idle === 55, String(c.idle));
  t.check('locaux : ils rattrapent lentement une qualité de marché élevée (an 1 < an 2 < qualité du marché), leur attrait monte', c.y1 > 56 && c.y2 > c.y1 && c.y2 < 75 && c.a2 > 0.5, `${c.y1.toFixed(1)} → ${c.y2.toFixed(1)}, attrait ${c.a2.toFixed(3)}`);
  t.check('locaux : jamais sous leur qualité de départ', c.low >= 55 - 1e-9, c.low.toFixed(2));
  t.check('locaux : compétence « très basse » (0) = aucun rattrapage', Math.abs(c.comp0 - 55) < 1e-6, c.comp0.toFixed(3));
  t.check('sauvegarde v8 : clé lq écrite et relue ; ancienne sauvegarde sans lq relue', c.saved && c.loaded && c.old, JSON.stringify({ s: c.saved, l: c.loaded, o: c.old }));
  t.check('formules : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();

  // ---------- Partie réelle : déterminisme et absence de NaN avec le COO et les nouveaux réglages ----------
  const runGame = async () => {
    const p = await L.newPage({ wait: 500 }); await L.setup(p, { cash: 5e9 }); await L.inject(p);
    const r = await p.evaluate(() => { const W = window.WSE, S = W.S; S.rs = 4242; S.pol = Object.assign(S.pol || {}, { px: 'agr', qw: 0.75, seek: true });
      W.launchProduct('jeans'); S.prod.jeans.st = 'on'; S.prod.jeans.pf = 1; T.inC('s2'); const f = T.inP('f2'); if (f) f.prod = 'jeans';
      T.stepN(150, true); return { pf: S.prod.jeans.pf, cash: Math.round(S.cash), lq: JSON.stringify(S.locQ || {}), bad: T.scan().slice(0, 3) }; });
    r.errs = p.errs.slice(0, 2); await p.context().close(); return r;
  };
  const g1 = await runGame(), g2 = await runGame();
  t.check('partie de 150 jours (COO agressif, qualité 75 %, recherche de fournisseurs) : déterministe', g1.pf === g2.pf && g1.cash === g2.cash && g1.lq === g2.lq, `${g1.pf} / ${g1.cash} vs ${g2.pf} / ${g2.cash}`);
  t.check('partie : aucun NaN ni pageerror', !g1.bad.length && !g1.errs.length, (g1.bad.concat(g1.errs)).join(' | '));
};
