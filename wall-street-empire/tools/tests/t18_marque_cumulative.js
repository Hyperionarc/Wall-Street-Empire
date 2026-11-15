// Marque cumulative : capital de marque (accumulation, érosion), parts de marché, résistance au bradage, prime de prix, poids par produit, IA, sauvegarde.
exports.name = 'Marque cumulative';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  // 1. Modèle pur : deux versions du même produit (mêmes fonctions que la simulation)
  const r = await pg.evaluate(() => { const W = window.WSE, B = W.brand, S = W.S; S.macro.gdp = 0.03; Object.keys(S.prod).forEach(k => { S.prod[k].rt = 55; });
    const strong = { bc: 200, brand: 90, loy: 70 }, none = { bc: 0, brand: 0, loy: 20 }, cut = Object.assign({ pf: 0.7 }, none), o = { p: {} };
    ['bread', 'phone', 'car', 'headache', 'watch'].forEach(pk => { const d = B.duel(pk, strong, none), dc = B.duel(pk, Object.assign({ pf: 0.95 }, strong), cut), d0 = B.duel(pk, none, cut), cap = B.duel(pk, Object.assign({}, none, { bc: 200 }), none);
      const at = x => B.attr(pk, Object.assign({}, S.prod[pk], x));
      o.p[pk] = { lev: B.lev(pk), sa: d.sa, ratio: d.a / d.b, capRatio: cap.a / cap.b, saCut: dc.sa, saNone: d0.sa, prem: B.prem(pk, strong), prem0: B.prem(pk, none), vol0: B.volM(pk, none), volLow: B.volM(pk, { bc: 10 }),
        up: at(Object.assign({ pf: 1.25 }, strong)) / at(strong), up0: at(Object.assign({ pf: 1.25 }, none)) / at(none), sh: B.shield(pk, strong) }; });
    o.sig = [25, 50, 100, 200, 400].map(B.sig); o.el = [B.el(0.6, 0), B.el(0.6, o.p.phone.sh)]; o.mkt = B.mkt(); return o; });
  const P = r.p, f = v => v.toFixed(2);
  t.check('(i) à prix égal, la forte marque prend plus de parts (smartphone : ≥ 2 fois le volume du sans-marque)', P.phone.sa > 0.5 && P.phone.ratio >= 2, `part ${f(P.phone.sa)}, ×${f(P.phone.ratio)}`);
  t.check('capital de marque seul (même notoriété) : ≈ ×1,4 à ×2,2 de volume sur un produit à fort poids de marque', P.phone.capRatio >= 1.4 && P.phone.capRatio <= 2.2 && P.headache.capRatio >= 1.4, `smartphone ×${f(P.phone.capRatio)}, médicament ×${f(P.headache.capRatio)}`);
  t.check('(ii) le sans-marque brade de 30 % : la forte marque garde ≥ 90 % de sa part en baissant de 5 % (voiture, smartphone)', P.car.saCut >= 0.9 * P.car.sa && P.phone.saCut >= 0.9 * P.phone.sa, `voiture ${f(P.car.sa)} → ${f(P.car.saCut)}, smartphone ${f(P.phone.sa)} → ${f(P.phone.saCut)}`);
  t.check('sans marque, le même bradage prend nettement plus de parts (part < 0,46 au lieu de 0,50)', P.car.saNone < 0.46 && P.car.sa - P.car.saCut < 0.5 - P.car.saNone, `sans marque 0,50 → ${f(P.car.saNone)}`);
  t.check('une hausse de prix de 25 % coûte moins de volume à la forte marque', P.phone.up > P.phone.up0 + 0.05 && P.phone.up >= 0.95 && r.el[1] > r.el[0], `forte ${f(P.phone.up)} vs sans ${f(P.phone.up0)} ; élasticité de rayon ${f(r.el[0])} → ${f(r.el[1])}`);
  t.check('(iii) effet faible sur le pain (≤ ×1,15), fort sur le luxe (≥ ×2,5)', P.bread.capRatio <= 1.15 && P.bread.capRatio > 1 && P.watch.capRatio >= 2.5 && P.bread.lev < 0.2 && P.watch.lev > 0.8, `pain ×${f(P.bread.capRatio)}, montre ×${f(P.watch.capRatio)} ; leviers ${f(P.bread.lev)} / ${f(P.watch.lev)}`);
  t.check('prime de prix acceptée : pain ≈ +10 %, smartphone ≈ +30 à +60 %, luxe ×2 à ×3 ; aucune sans marque', P.bread.prem <= 1.13 && P.bread.prem > 1.04 && P.phone.prem >= 1.3 && P.phone.prem <= 1.6 && P.watch.prem >= 2 && P.watch.prem <= 3 && P.watch.prem0 === 1, `pain ${f(P.bread.prem)}, smartphone ${f(P.phone.prem)}, montre ${f(P.watch.prem)}`);
  t.check('luxe sans marque : le volume s\'effondre sous le seuil (≤ 60 %), pas le pain ni le smartphone', P.watch.vol0 <= 0.6 && P.watch.volLow < 0.75 && P.bread.vol0 === 1 && P.phone.vol0 === 1, `montre ${f(P.watch.vol0)}, pain ${f(P.bread.vol0)}`);
  t.check('rendements croissants puis saturation douce (force de marque en S)', r.sig[1] / r.sig[0] > 2 && r.sig[3] / r.sig[2] < 1.4 && r.sig[4] < 1 && r.sig[4] > r.sig[3], r.sig.map(f).join(' '));
  // 2. Simulation : accumulation sous publicité, érosion sans publicité, direction marketing, IA
  const s = await pg.evaluate(() => { const W = window.WSE, B = W.brand, S = W.S, T = window.T, o = {};
    for (let i = 0; i < 6; i++) T.inC('res'); T.inC('s3');
    ['phone', 'bread'].forEach(pk => { W.launchProduct(pk); const ps = S.prod[pk]; ps.st = 'on'; ps.rnd = 0; ps.pf = 1; });
    const ps = S.prod.phone; ['tv', 'radio', 'press', 'net', 'infl'].forEach(ak => { for (let i = 0; i < 40; i++) B.padSet('phone', ak, 1); });
    T.stepN(30, true); o.b30 = ps.bc; o.tr1 = B.trend('phone'); T.stepN(210, true); o.b240 = ps.bc; o.loy = ps.loy; o.bread = S.prod.bread.bc; o.volX = B.volX('phone');
    o.html = W.prodModelHTML('phone'); o.cap = B.capHTML();
    o.mkt0 = B.mkt(); o.tg0 = B.target('phone'); T.inC('hq'); const cx0 = S.cx; S.cx = { cmo: { name: 'Test', exp: { mkt: 100 } } }; o.mkt1 = B.mkt(); o.tg1 = B.target('phone'); S.cx = cx0;
    ps.ad = { tv: 0, radio: 0, press: 0, net: 0, infl: 0 }; o.half = B.half(ps); T.stepN(Math.round(o.half), true); o.bEnd = ps.bc; o.tr2 = B.trend('phone');
    o.riv = (S.rivals || []).map(x => ({ id: x.id, bk: x.bk, m: B.rivM(x, 'lux'), low: B.rivM(Object.assign({}, x, { bk: 0.2 * x.bk }), 'lux'), hi: B.rivM(Object.assign({}, x, { bk: 1.5 * x.bk + 20 }), 'lux') }));
    ['tv', 'net'].forEach(ak => { for (let i = 0; i < 40; i++) B.padSet('phone', ak, 1); }); T.stepN(30, true);   // la publicité reprend : notoriété haute au moment de la sauvegarde
    o.bad = T.scan(); return o; });
  t.check('la publicité s\'accumule en capital de marque (30 j puis 240 j) et la tendance monte', s.b30 > 5 && s.b240 > 2.5 * s.b30 && s.b240 > 80 && s.tr1 === 1, `${s.b30.toFixed(0)} → ${s.b240.toFixed(0)}`);
  t.check('sans publicité, le produit n\'accumule aucun capital (pain)', s.bread === 0, String(s.bread));
  t.check('(iv) érosion sans publicité : environ la moitié du capital après une demi-vie, tendance « s\'érode »', s.bEnd / s.b240 > 0.4 && s.bEnd / s.b240 < 0.62 && s.tr2 === -1, `${s.b240.toFixed(0)} → ${s.bEnd.toFixed(0)} en ${Math.round(s.half)} j`);
  t.check('la fidélité allonge la demi-vie (120 à 180 jours)', s.half > 120 && s.half <= 180 && s.loy > 20, `${Math.round(s.half)} j, fidélité ${Math.round(s.loy)}`);
  t.check('direction marketing : la publicité devient jusqu\'à 2 fois plus efficace', Math.abs(s.mkt0 - 1) < 1e-9 && s.mkt1 >= 1.9 && s.tg1 >= 1.9 * s.tg0, `×${f(s.mkt0)} → ×${f(s.mkt1)}`);
  t.check('IA : chaque rival a un capital de marque ; distancé il perd de l\'attrait, en surinvestissant il en gagne', s.riv.length > 0 && s.riv.every(x => Number.isFinite(x.bk) && x.bk >= 0 && x.low < x.m && x.hi > x.m && x.m > 0.6 && x.m < 1.4), JSON.stringify(s.riv.map(x => [x.id, Math.round(x.bk), +x.m.toFixed(2)])));
  t.check('fiche produit et écran Marque : ligne « Capital de marque … prime de prix acceptée … demi-vie » avec tendance, sans NaN', /Capital de marque/.test(s.html) && /de volume vs concurrent sans marque/.test(s.html) && /prime de prix acceptée \+\d+ %/.test(s.html) && /demi-vie \d+ j/.test(s.html) && /monte|stable|s'érode/.test(s.html) && /Capital de marque/.test(s.cap) && !L.BAD_TXT.test(s.html) && !L.BAD_TXT.test(s.cap), `×${f(s.volX)}`);
  t.check('aucune valeur non finie dans l\'état', s.bad.length === 0, s.bad.slice(0, 4).join(' | '));
  // 3. Rétrocompatibilité : une sauvegarde v8 sans les nouveaux champs se charge et se rejoue
  const sv = await pg.evaluate(() => { const W = window.WSE; W.save(); const d = JSON.parse(localStorage.getItem('wse-city-v8')); const had = d.prod.phone.bc != null; Object.keys(d.prod).forEach(k => { delete d.prod[k].bc; }); (d.rivals || []).forEach(x => { delete x.bk; }); return { had, v: d.v, day: d.day, brand: d.prod.phone.brand, json: JSON.stringify(d) }; });
  await pg.context().addInitScript(j => { localStorage.setItem('wse-city-v8', j); }, sv.json);   // l'ancienne sauvegarde est réécrite avant le démarrage du jeu (la page sauvegarde en se fermant)
  await pg.reload(); await pg.waitForTimeout(600); await L.inject(pg);
  const ld = await pg.evaluate(() => { const W = window.WSE, S = W.S, B = W.brand; W.setSpeed(0); S.noEv = true; const o = { day: S.day, bc0: S.prod.phone.bc, st: S.prod.phone.st, a0: B.attr('phone'), html: W.prodModelHTML('phone') }; window.T.stepN(3, true); o.bc1 = S.prod.phone.bc; o.riv = (S.rivals || []).every(x => Number.isFinite(x.bk)); o.bad = window.T.scan(); return o; });
  t.check('(v) le capital de marque est sauvegardé (champ optionnel de la sauvegarde v8)', sv.had && sv.v === 8, JSON.stringify({ had: sv.had, v: sv.v, day: sv.day }));
  t.check('(v) une sauvegarde sans capital de marque se charge : valeur déduite de la notoriété, puis simulation saine', ld.day === sv.day && ld.st === 'on' && ld.bc0 === undefined && Number.isFinite(ld.a0) && Number.isFinite(ld.bc1) && ld.bc1 >= 0.5 * sv.brand && ld.bc1 <= 0.75 * sv.brand && ld.riv && ld.bad.length === 0 && !L.BAD_TXT.test(ld.html), `jour ${ld.day}, notoriété ${sv.brand.toFixed(0)} → capital ${ld.bc1 == null ? ld.bc1 : ld.bc1.toFixed(1)} ${ld.bad.slice(0, 2).join(' | ')}`);
  t.check('(vi) aucune erreur de page (marque cumulative)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
