// Règles de Capitalism Lab (docs/CAPLAB_MARQUE_RD.md) : M2 oubli lent de la notoriété, M3 fidélité gagnée par l'essai (notoriété, qualité relative,
// publicité sans stock), R3 projet de R&D prioritaire, R4 rattrapage technologique, M6 changement de stratégie de marque = marques remises à zéro ;
// sauvegarde v8 (champ facultatif rdf), déterminisme, écran R&D lisible.
exports.name = 'Marque et R&D à la Capitalism Lab';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  // 1. M2 : la notoriété monte vite, s'oublie lentement (demi-vie AW_HL)
  const a = await pg.evaluate(() => { const B = window.WSE.brand, o = {}; let b = 0; for (let i = 0; i < 40; i++) b = B.awStep(b, 100); o.up40 = b;
    let c = 99; for (let i = 0; i < 30; i++) c = B.awStep(c, 0); o.d30 = c; c = 99; for (let i = 0; i < B.AW_HL; i++) c = B.awStep(c, 0); o.dHL = c; o.HL = B.AW_HL; return o; });
  t.check('M2 : la publicité construit la notoriété en quelques semaines (≥ 90 en 40 jours)', a.up40 >= 90, a.up40.toFixed(1));
  t.check('M2 : sans publicité, la notoriété s\'oublie lentement (99 → ≥ 75 en 30 jours, ≈ moitié après la demi-vie)', a.d30 >= 75 && a.dHL > 45 && a.dHL < 55 && a.HL >= 90, `30 j : ${a.d30.toFixed(1)} ; ${a.HL} j : ${a.dHL.toFixed(1)}`);
  // 2. M3 : fidélité (fonctions de la simulation)
  const b = await pg.evaluate(() => { const W = window.WSE, S = W.S, B = W.brand, o = {}; W.mk.setMat(0);
    W.launchProduct('phone'); const ps = S.prod.phone; ps.st = 'on'; ps.rnd = 0; ps.pf = 1; ps.rt = 62; S._dw = S._dw || {}; S._dw.pd = S._dw.pd || {};
    const run = (st, n) => { Object.assign(ps, st); let l = ps.loy; for (let i = 0; i < n; i++) { ps.loy = l; l = B.loyStep('phone', ps, 100); } return l; };
    ps.ad = { tv: 0, radio: 0, press: 0, net: 0, infl: 0 }; S._dw.pd.phone = 0;
    o.none = run({ brand: 0, bc: 0, loy: 20, sold: 0 }, 200);
    o.sellNoAw = run({ brand: 0, bc: 0, loy: 20, sold: 10 }, 200); S._dw.pd.phone = 10;
    o.sellAw = run({ brand: 90, bc: 120, loy: 20, sold: 10 }, 200);
    o.tNoAw = B.loyTarget('phone', Object.assign({}, ps, { brand: 0, bc: 0 }), 100); o.tAw = B.loyTarget('phone', Object.assign({}, ps, { brand: 90, bc: 120 }), 100);
    o.qHi = B.loyTarget('phone', Object.assign({}, ps, { brand: 100, bc: 300, rt: 85 }), 100); o.qLo = B.loyTarget('phone', Object.assign({}, ps, { brand: 100, bc: 300, rt: 40 }), 100); o.ref = B.loyQRef('phone');
    // publicité qui crée une demande qu'on ne sert pas (80 % non servie)
    ps.brand = 90; ps.bc = 120; ps.sold = 2; S._dw.pd.phone = 10; o.missNoAd = B.loyTarget('phone', ps, 40);
    ['tv', 'net'].forEach(k => { for (let i = 0; i < 30; i++) B.padSet('phone', k, 1); }); o.missAd = B.loyTarget('phone', ps, 40); S._dw.pd.phone = 2; o.servedAd = B.loyTarget('phone', ps, 40);
    return o; });
  t.check('M3 : sans notoriété ni vente, pas de fidélité offerte (≤ 30 après 200 jours, au lieu de ≈ 45 à 70 avant)', b.none <= 30 && b.tNoAw <= 31, `fidélité ${b.none.toFixed(1)}, cible ${b.tNoAw.toFixed(1)}`);
  t.check('M3 : la notoriété accélère et relève la fidélité (vendu + notoriété 90 ≫ vendu sans notoriété)', b.sellAw > b.sellNoAw + 15 && b.tAw > b.tNoAw + 20, `${b.sellNoAw.toFixed(1)} → ${b.sellAw.toFixed(1)} ; cibles ${b.tNoAw.toFixed(0)} / ${b.tAw.toFixed(0)}`);
  t.check('M3 : une qualité au-dessus du marché nourrit la fidélité, en dessous elle l\'use', b.qHi > b.qLo + 15, `qualité 85 : ${b.qHi.toFixed(0)} ; 40 : ${b.qLo.toFixed(0)} (référence ${b.ref})`);
  t.check('M3 : matraquer la publicité d\'un produit introuvable abîme la fidélité (et pas quand la demande est servie)', b.missAd < b.missNoAd - 8 && b.servedAd >= b.missNoAd, `sans pub ${b.missNoAd.toFixed(0)}, pub + 80 % non servi ${b.missAd.toFixed(0)}, pub + servi ${b.servedAd.toFixed(0)}`);
  // 3. R3 / R4 : R&D prioritaire et rattrapage (simulation, 1 centre de R&D)
  const rdRun = async (focus, lag) => { const p = await L.newPage({ wait: 500 }); await L.setup(p, { cash: 5e9 }); await L.inject(p);
    const r = await p.evaluate(([focus, lag]) => { const W = window.WSE, S = W.S, T = window.T; W.mk.setMat(0); const ks = ['phone', 'bread', 'tv', 'washer', 'bike', 'toys'];
      ks.forEach(pk => { W.launchProduct(pk); const ps = S.prod[pk]; ps.st = 'on'; ps.rnd = 0; ps.pf = 1; ps.tc = W.techFront(); });
      if (lag) S.prod.phone.tc = 50; if (focus) W.rd.focus('phone'); T.inC('rd'); T.stepN(3, true); const t0 = {}; ks.forEach(pk => { t0[pk] = S.prod[pk].tc; });
      T.stepN(360, true); const o = { p: S.rdPower, d: {}, f: S.rdFocus || null, bad: T.scan() }; ks.forEach(pk => { o.d[pk] = S.prod[pk].tc - t0[pk]; });
      o.rows = W.rd.techRows().map(x => [x.pk, Math.round(x.tc), x.foc, +x.cu.toFixed(2)]); return o; }, [focus, lag]); r.errs = p.errs.slice(); await p.context().close(); return r; };
  const R0 = await rdRun(false, false), RF = await rdRun(true, false), RL = await rdRun(false, true);
  const sum = o => Object.values(o.d).reduce((x, y) => x + y, 0);
  t.check('R3 : le produit prioritaire progresse nettement plus vite que sans priorité, les autres un peu moins', RF.f === 'phone' && RF.d.phone > R0.d.phone + 3 && RF.d.bread < R0.d.bread && R0.p > 0, `smartphone ${R0.d.phone.toFixed(1)} → ${RF.d.phone.toFixed(1)} ; pain ${R0.d.bread.toFixed(1)} → ${RF.d.bread.toFixed(1)}`);
  t.check('R3 : l\'effort total des centres de R&D ne change pas (±15 %)', Math.abs(sum(RF) - sum(R0)) <= 0.15 * Math.abs(sum(R0)) + 2, `${sum(R0).toFixed(1)} / ${sum(RF).toFixed(1)}`);
  t.check('R4 : un produit en retard rattrape (gain sur un an nettement supérieur à celui d\'un produit à la pointe)', RL.d.phone > R0.d.phone + 2 && RL.rows.some(x => x[0] === 'phone' && x[3] > 0.3), `retard : +${RL.d.phone.toFixed(1)} ; à la pointe : ${R0.d.phone.toFixed(1)} ; ${JSON.stringify(RL.rows.find(x => x[0] === 'phone'))}`);
  t.check('R&D : simulation saine (aucune valeur non finie, aucune erreur)', !R0.bad.length && !RF.bad.length && !RL.bad.length && !R0.errs.length && !RF.errs.length && !RL.errs.length, [].concat(R0.bad, RF.bad, R0.errs, RF.errs).slice(0, 3).join(' | '));
  // 4. Écran R&D : section « Technologie de tes produits », bouton Prioriser
  const u = await pg.evaluate(async () => { const W = window.WSE, S = W.S; ['bread', 'tv'].forEach(pk => { W.launchProduct(pk); const ps = S.prod[pk]; ps.st = 'on'; ps.rnd = 0; });
    W.coach.setPanel(true); document.querySelector('#panel [data-ptab="rdp"]').click(); W.rd.render(true); await new Promise(r => setTimeout(r, 100));
    const txt = document.getElementById('rdp').innerText, btn = document.querySelector('[data-rdp="foc:tv"]'); if (btn) btn.click(); await new Promise(r => setTimeout(r, 100));
    return { txt, has: !!btn, f: S.rdFocus, txt2: document.getElementById('rdp').innerText }; });
  t.check('écran R&D : section « Technologie de tes produits » (niveau, pointe, points par an), bouton Prioriser actif, sans NaN', /TECHNOLOGIE DE TES PRODUITS/i.test(u.txt) && /pointe \d+/.test(u.txt) && /par an/.test(u.txt) && u.has && u.f === 'tv' && /prioritaire/.test(u.txt2) && !L.BAD_TXT.test(u.txt2), u.f);
  // 5. M6 : changer de stratégie remet les marques à zéro (gratuit tant que rien n'est construit)
  const m = await pg.evaluate(() => { const W = window.WSE, S = W.S, B = W.brand, ps = S.prod.phone, o = {};
    ['bread', 'tv'].forEach(pk => { S.prod[pk].brand = 0; S.prod[pk].bc = 0; }); ps.brand = 0; ps.bc = 0; const st0 = B.strat(); o.free = B.setStrat(st0 === 'corp' ? 'range' : 'corp'); o.st1 = B.strat();
    ps.brand = 80; ps.bc = 150; ps.loy = 60; o.r = B.setStrat('unique'); o.after = [ps.brand, ps.bc, ps.loy]; o.st2 = B.strat(); o.same = B.setStrat('unique'); return o; });
  t.check('M6 : stratégie changée sans marque construite = gratuit ; avec une marque = notoriété et capital à 0, fidélité ramenée à 20', m.free.n === 0 && m.r.n === 1 && Math.round(m.r.bc) === 150 && m.after[0] === 0 && m.after[1] === 0 && m.after[2] === 20 && m.st2 === 'unique' && m.same.n === 0, JSON.stringify(m));
  // 6. Sauvegarde v8 : produit prioritaire conservé ; une sauvegarde sans le champ se charge
  const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S; S.rdFocus = 'tv'; W.save(); const d = JSON.parse(localStorage.getItem('wse-city-v8')); const had = d.rdf; delete d.rdf; return { had, v: d.v, json: JSON.stringify(d) }; });
  t.check('sauvegarde v8 : champ facultatif rdf (produit prioritaire)', sv.had === 'tv' && sv.v === 8, String(sv.had));
  await pg.context().addInitScript(j => { localStorage.setItem('wse-city-v8', j); }, sv.json);
  await pg.reload(); await pg.waitForTimeout(600); await L.inject(pg);
  const ld = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); S.noEv = true; const o = { f: S.rdFocus }; window.T.stepN(5, true); o.rows = W.rd.techRows().length; o.bad = window.T.scan(); return o; });
  t.check('ancienne sauvegarde sans rdf : se charge, aucun produit prioritaire, simulation saine', !ld.f && ld.bad.length === 0, JSON.stringify(ld));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
};
