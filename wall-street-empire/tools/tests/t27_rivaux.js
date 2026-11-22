// Rivaux vivants : une IA par caste (sièges), prix relatifs réactifs, guerre des prix, OPA hostile, faillite + rachat, entente (accepter / refuser),
// valorisation non figée, déterminisme, prise et libération d'un siège, sauvegarde rétrocompatible.
exports.name = 'Rivaux vivants : castes, prix, stratégies, sièges';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 });
  // Round Normal, caste choisie par le joueur ; quelques magasins pour exister sur le marché
  const start = async (caste, shops) => pg.evaluate(({ caste, shops }) => {
    const W = window.WSE; W.startMode('round'); const S = W.S, N = W.N; const before = S.rivals.map(r => r.caste);
    W.seats.claim(caste, 'me'); W.setSpeed(0); S.noEv = true; if (S.mode) delete S.mode.await;
    ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    let n = 0; if (shops) { S.cash = 400e6; ['s1', 's2', 's3', 's1', 's2', 's3', 's1', 's2', 's1', 's2', 's3', 's1'].forEach(k => { for (let y = 16; y < 44 && n < 99; y++) { let ok = false; for (let x = 16; x < 44; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) {} ok = true; n++; break; } if (ok) break; } }); }
    return { before, shops: n, rivals: S.rivals.map(r => ({ id: r.id, caste: r.caste, name: r.name, cash: r.cash, px: r.px, fl: r.fl })), seats: W.seats.list().map(s => [s.caste, s.ctrl, s.pid, !!s.company]), me: S.caste, castes: Object.keys(window.WSE.riv.CASTE) };
  }, { caste, shops });

  // --- 1. Six castes, cinq IA, caste du joueur exclue ---
  const a = await start('industriel', true);
  t.check('6 sièges : 1 humain (le joueur) et 5 IA, une par caste restante', a.seats.length === 6 && a.seats.filter(s => s[1] === 'human').length === 1 && a.seats.filter(s => s[1] === 'ai').length === 5 && a.rivals.length === 5, JSON.stringify(a.seats.map(s => s[0] + ':' + s[1])));
  t.check('la caste du joueur n\'est tenue par aucune IA ; chaque IA a une caste distincte', !a.rivals.some(r => r.caste === 'industriel') && new Set(a.rivals.map(r => r.caste)).size === 5, a.rivals.map(r => r.caste).join(','));
  t.check('avant le choix, le siège du joueur était tenu par une IA (remplacée à la prise du siège)', a.before.indexOf('industriel') >= 0, a.before.join(','));
  t.check('même trésorerie de départ pour tous (10 M$ en Normal)', a.rivals.every(r => r.cash === 10e6), a.rivals.map(r => r.cash).join(','));
  const px = n => a.rivals.find(r => r.name === n).px;
  t.check('prix par profil : DiscountCo bas, Mega Mart milieu, Luxor haut', px('DiscountCo').basic < px('Mega Mart').basic && px('Mega Mart').basic < px('Luxor & Fils').basic && px('DiscountCo').std < 0.95 && px('Luxor & Fils').lux > 1.1, JSON.stringify([px('DiscountCo'), px('Mega Mart'), px('Luxor & Fils')]));
  t.check('chaque IA a un produit phare', a.rivals.every(r => r.fl && r.fl.k), a.rivals.map(r => r.fl && r.fl.k).join(','));

  // --- 2. Prix réactifs : le rival suit le joueur, la part suit le prix ---
  const p2 = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, R = W.riv; for (let i = 0; i < 40; i++) W.step();
    const r = S.rivals.find(x => x.caste === 'negociant'), o = { you: S.mkt.basic.you };
    const snap = JSON.stringify(S), rs0 = S.rs;
    const run = pf => { S.rivals.forEach(x => { x.st = { k: 'follow' }; }); S.rv.warCd = 1e9; S.rv.carCd = 1e9; S.rv.maCd = 1e9; S.grid.forEach(c => { if (c && W.TYPES[c.t] && W.TYPES[c.t].ret) c.pf = pf; }); for (let i = 0; i < 30; i++) W.step(); return S.rivals.find(x => x.caste === 'negociant').px.basic; };
    o.lo = run(0.8); o.hi = run(1.25);
    const e0 = R.eff(r, 'basic'); r.px.basic *= 0.8; o.effUp = R.eff(r, 'basic') / e0; r.px.basic /= 0.8;
    o.el = R.EL.basic; return o;
  });
  t.check('le joueur est présent sur le marché de base', p2.you > 0.03, 'part ' + (p2.you * 100).toFixed(1) + ' %');
  t.check('prix rival réactif : il baisse quand le joueur casse ses prix, remonte quand il les monte', p2.lo < p2.hi - 0.01, `prix base ${p2.lo.toFixed(3)} (joueur ×0,8) contre ${p2.hi.toFixed(3)} (joueur ×1,25)`);
  t.range('un rival 20 % moins cher gagne en attrait (élasticité de base 2,4)', p2.effUp, 1.5, 1.9, '', 2);

  // --- 3. Guerre des prix : déclenchée contre le joueur dominant, signalée, puis terminée ---
  const w = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, R = W.riv, RV = R.state(); RV.warCd = 1e9; RV.carCd = 1e9; RV.maCd = 1e9; RV.war = null; S.rivals.forEach(x => { x.st = { k: 'follow' }; x.wcd = 0; });
    const o = {}; const r = S.rivals.find(x => x.caste === 'negociant'), cls = 'basic', sh = c => (S.mkt[c].riv.find(x => x.id === r.id) || { s: 0 }).s;
    S.grid.forEach(c => { if (c && W.TYPES[c.t] && W.TYPES[c.t].ret) c.pf = 1; }); for (let i = 0; i < 25; i++) W.step(); const px0 = r.px[cls], s0 = sh(cls), y0 = S.mkt[cls].you, a0 = 1 - S._dw.cls[cls].rivShare;
    // le joueur domine : la décision de l'IA peut déclencher la guerre (tirage déterministe) ; on force ici le joueur à 45 % pour la décision
    const mk = {}; ['basic', 'std', 'lux', 'estate'].forEach(c => { mk[c] = S.mkt[c].you; S.mkt[c].you = c === cls ? 0.45 : 0.1; }); RV.ys = { basic: 0.45, std: 0.1, lux: 0.1, estate: 0.1 }; RV.warCd = 0; r.st = { k: 'follow' }; let tries = 0; while (r.st.k !== 'war' && tries++ < 60) R.decide(r); ['basic', 'std', 'lux', 'estate'].forEach(c => { S.mkt[c].you = mk[c]; });
    o.started = r.st.k === 'war'; o.cls = r.st.cls; o.d = r.st.d; o.until = r.st.until; o.day0 = S.day; o.tries = tries;
    o.ban = document.getElementById('rvban').textContent; o.toast = (S._sayBuf || []).join(' | ');
    for (let i = 0; i < 12; i++) W.step(); o.pxWar = r.px[o.cls] / px0; o.shWar = sh(cls) / Math.max(1e-9, s0); o.youWar = S.mkt[cls].you / Math.max(1e-9, y0); o.attWar = (1 - S._dw.cls[cls].rivShare) / a0; o.txt = R.stratTxt(r); o.banShown = !document.getElementById('rvban').hidden;
    let n = 0; while (r.st.k === 'war' && n++ < 200) W.step(); o.ended = r.st.k !== 'war'; o.endDay = S.day; o.warNull = !RV.war; o.cd = RV.warCd - S.day;
    for (let i = 0; i < 40; i++) W.step(); o.pxAfter = r.px[o.cls] / px0; return o;
  });
  t.check('guerre des prix déclenchée contre le joueur dominant', w.started && w.cls === 'basic', `classe ${w.cls}, essais ${w.tries}`);
  t.range('profondeur de la guerre entre 10 et 25 %', w.d * 100, 10, 25, ' %');
  t.check('guerre signalée : au journal, sans bannière en bas de l\'écran (passe 99)', /Guerre des prix/.test(w.toast + w.ban) && !w.banShown && /guerre des prix contre toi/.test(w.txt), w.txt);
  t.check('pendant la guerre : prix du rival en baisse, sa part monte, la part de clientèle adressée au joueur recule', w.pxWar < 0.93 && w.shWar > 1.05 && w.attWar < 0.97 && w.youWar < 1.05, `prix ×${w.pxWar.toFixed(2)}, part rivale ×${w.shWar.toFixed(2)}, clientèle du joueur ×${w.attWar.toFixed(2)}, ventes du joueur ×${w.youWar.toFixed(2)} (magasins à pleine capacité)`);
  t.check('guerre terminée à l\'échéance, trêve ensuite', w.ended && w.warNull && w.endDay <= w.until + 1 && w.cd > 60, `jour ${w.endDay} (échéance ${w.until}), trêve ${w.cd} j`);
  t.check('après la guerre, le prix remonte vers son niveau normal', w.pxAfter > w.pxWar + 0.04, `×${w.pxAfter.toFixed(2)} contre ×${w.pxWar.toFixed(2)}`);

  // --- 4. Entente : accepter (marges gonflées, amende possible), refuser (guerre possible) ---
  const c = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, R = W.riv, RV = R.state(), o = {}; const r = S.rivals.find(x => x.caste === 'negociant'); S.rivals.forEach(x => { x.st = { k: 'follow' }; });
    const mk = (cls) => { const e = Object.keys(W.PRODUCTS).find(k => W.PRODUCTS[k].cls === cls); return e; };
    RV.war = null; RV.cartel = null; RV.offer = { kind: 'cartel', rid: r.id, cls: 'basic', until: S.day + 20 };
    const rev = () => { let a = 0; for (let i = 0; i < 10; i++) { W.step(); a += (S.fin && S.fin.revRetail) || 0; } return a; };
    RV.offer = null; RV.warCd = 1e9; RV.carCd = 1e9; RV.maCd = 1e9; const r0 = rev(); o.k0 = R.cartelK('basic'); RV.offer = { kind: 'cartel', rid: r.id, cls: 'basic', until: S.day + 20 }; W.step();
    o.ban = document.getElementById('rvban').textContent; o.btn = document.querySelectorAll('#rvban [data-rv]').length; o.px0 = r.px.basic; document.querySelector('#rvban [data-rv="yes"]').click(); o.on = !!RV.cartel; o.k1 = R.cartelK('basic'); o.k2 = R.cartelK('std');
    S.rs = 12345; const cash0 = S.cash; let fined = 0, days = 0; const r1 = rev(); o.revUp = r1 / Math.max(1, r0); o.pxUp = r.px.basic / o.px0;
    // amende aléatoire : on rejoue des ententes jusqu'à voir les deux issues (sanction, fin normale)
    let seenFine = false, seenEnd = false, k = 0; while ((!seenFine || !seenEnd) && k++ < 40) { if (!RV.cartel) { RV.offer = { kind: 'cartel', rid: r.id, cls: 'basic', until: S.day + 20 }; W.riv.answer(true); } const f0 = RV.fines || 0; let n = 0; while (RV.cartel && n++ < 100) W.step(); if ((RV.fines || 0) > f0) { seenFine = true; o.fine = RV.fines - f0; } else seenEnd = true; }
    o.seenFine = seenFine; o.seenEnd = seenEnd; o.val = W.valuation();
    // refus : peut déclencher une guerre des prix
    let wars = 0, refus = 0; for (let i = 0; i < 30; i++) { S.rivals.forEach(x => { x.st = { k: 'follow' }; }); RV.war = null; RV.offer = { kind: 'cartel', rid: r.id, cls: 'basic', until: S.day + 20 }; W.riv.answer(false); refus++; if (r.st.k === 'war') wars++; }
    o.wars = wars; o.refus = refus; R.endStrat(r, 'test'); RV.warCd = 1e9; return o;
  });
  t.check('entente proposée dans le bandeau (Accepter / Refuser), acceptée : entente active', /entente/.test(c.ban) && c.btn === 2 && c.on, c.ban.slice(0, 70));
  t.check('accepter gonfle les marges : prix de rayon +8 % dans la classe visée seulement, le rival remonte aussi ses prix', c.k0 === 1 && c.k1 === 1.08 && c.k2 === 1 && c.pxUp > 1.03 && c.revUp > 0.97, `marge de rayon ×${c.k1}, prix rival ×${c.pxUp.toFixed(3)}, recettes totales ×${c.revUp.toFixed(3)}`);
  t.check('amende antitrust aléatoire : certaines ententes sont sanctionnées, d\'autres vont à leur terme', c.seenFine && c.seenEnd && c.fine >= 250000, `amende ${Math.round(c.fine || 0)} $`);
  t.check('refuser peut déclencher une guerre des prix (ni jamais, ni toujours)', c.wars > 0 && c.wars < c.refus, `${c.wars} guerres sur ${c.refus} refus`);

  // --- 5. Rachat hostile : offre sur un bâtiment, OPA sur la société cotée ---
  const h = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, R = W.riv, RV = R.state(), o = {}; const r = S.rivals.find(x => x.caste === 'promoteur'); S.rivals.forEach(x => { x.st = { k: 'follow' }; }); RV.war = null; RV.cartel = null; RV.offer = null;
    r.cash = 300e6; S.grid.forEach(c => { if (c && W.TYPES[c.t] && W.TYPES[c.t].ret && !(c.profit > 0)) c.profit = 2000; });
    const tg = R.buyTarget(r); o.tg = tg ? [tg.c.t, tg.price] : null; if (!tg) return o;
    RV.offer = { kind: 'buy', rid: r.id, x: tg.c.x, y: tg.c.y, t: tg.c.t, price: tg.price, until: S.day + 20 };
    const cash0 = S.cash, rc0 = r.cash; W.riv.answer(true); const g = S.grid[tg.c.y * W.N + tg.c.x];
    o.paid = S.cash - cash0; o.rpaid = rc0 - r.cash; o.cell = g ? g.t : null; o.owner = g ? W.acq.ownerOf(g) : null; o.rid = r.id;
    // refus
    const tg2 = R.buyTarget(r); RV.offer = { kind: 'buy', rid: r.id, x: tg2.c.x, y: tg2.c.y, t: tg2.c.t, price: tg2.price, until: S.day + 20 }; const c1 = S.cash; W.riv.answer(false); o.refKeep = S.grid[tg2.c.y * W.N + tg2.c.x] === tg2.c && S.cash === c1;
    // la décision de l'IA émet bien une offre de rachat (société non cotée)
    RV.maCd = 0; RV.warCd = 1e9; RV.carCd = 1e9; let n = 0; while (!RV.offer && n++ < 200) { r.st = { k: 'follow' }; RV.ys = { basic: 1, std: 1, lux: 1, estate: 1 }; R.decide(r); } o.offer = RV.offer ? RV.offer.kind : null; RV.offer = null;
    // OPA sur la société cotée : flottant large -> réussite fréquente ; flottant nul -> jamais lancée par l'IA
    const ib = S.rivals.find(x => x.caste === 'banquier'); ib.cash = 500e6; S.float = 0.6; let won = 0, tot = 40; const tk0 = (S.x11 && S.x11.takeovers) || 0;
    for (let i = 0; i < tot; i++) if (R.opa(ib)) won++; o.won = won; o.tot = tot; o.tk = ((S.x11 && S.x11.takeovers) || 0) - tk0; o.prem = S.prem;
    S.float = 0.6; RV.maCd = 0; ib.cash = 500e6; n = 0; const op0 = RV.opas || 0; while ((RV.opas || 0) === op0 && n++ < 300) { RV.maCd = 0; ib.st = { k: 'follow' }; RV.ys = { basic: 1, std: 1, lux: 1, estate: 1 }; R.decide(ib); } o.aiOpa = (RV.opas || 0) > op0;
    S.float = 0; RV.offer = null; return o;
  });
  t.check('un rival riche cible le bâtiment le plus rentable du joueur', !!h.tg, JSON.stringify(h.tg));
  t.check('offre acceptée : le joueur est payé, le bâtiment passe au rival', h.tg && h.paid === h.tg[1] && h.rpaid === h.tg[1] && h.cell === 'npc' && h.owner === h.rid, `payé ${h.paid}, case ${h.cell}, propriétaire ${h.owner}`);
  t.check('offre refusée : rien ne change', h.refKeep === true, '');
  t.check('l\'IA émet d\'elle-même une offre de rachat hostile', h.offer === 'buy', String(h.offer));
  t.check('OPA hostile possible sur la société cotée (flottant 60 %) : parfois réussie, parfois repoussée', h.won > 0 && h.won < h.tot && h.tk === h.won, `${h.won} réussies sur ${h.tot}`);
  t.check('l\'IA lance d\'elle-même une OPA quand le flottant dépasse 25 %', h.aiOpa === true, '');

  // --- 6. Faillite d'un rival mal géré et rachat de ses actifs ---
  const f = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, R = W.riv, RV = R.state(), o = {}; RV.sale = null; RV.warCd = 1e9; RV.carCd = 1e9; RV.maCd = 1e9;
    const r = S.rivals.find(x => x.caste === 'agriculteur'); r.mq = 0.05; r.cash = -40e6; r.as = 0;   // mal géré : marge nulle et dettes supérieures à ce que rapporte la vente forcée de ses magasins
    let n = 0; while (S.rivals.indexOf(r) >= 0 && n++ < 400) W.step(); o.days = n; o.gone = S.rivals.indexOf(r) < 0; o.sale = RV.sale ? { name: RV.sale.name, price: RV.sale.price } : null; o.seat = W.seats.list().find(s => s.caste === 'agriculteur');
    const subs0 = (S.subs || []).length, cash0 = S.cash; o.bought = R.buySale(); o.paid = cash0 - S.cash; o.subs = (S.subs || []).length - subs0; o.saleOff = !RV.sale;
    // sans repreneur humain : un rival rachète
    const r2 = S.rivals.find(x => x.caste === 'negociant'); r2.mq = 0.05; r2.cash = -40e6; r2.as = 0; S.rivals.forEach(x => { if (x !== r2) x.cash = Math.max(x.cash, 80e6); });
    n = 0; while (S.rivals.indexOf(r2) >= 0 && n++ < 400) W.step(); const sum0 = S.rivals.map(x => Object.values(x.att).reduce((a, b) => a + b, 0)); const pr = RV.sale ? RV.sale.price : 0; const cashB = S.rivals.map(x => x.cash);
    n = 0; while (RV.sale && n++ < 40) W.step(); o.sold2 = !RV.sale; o.log = (RV.log || []).map(l => l.t).join(' | ');
    n = 0; while (S.rivals.length < 5 && n++ < 100) W.step(); o.refill = S.rivals.length; o.castes = S.rivals.map(x => x.caste).sort().join(','); return o;
  });
  t.check('un rival mal géré fait faillite', f.gone && f.sale && f.sale.price > 0, `en ${f.days} jours, actifs à ${f.sale && f.sale.price} $`);
  t.check('le joueur rachète les actifs du failli : paiement, filiale créée', f.bought && f.paid === f.sale.price && f.subs === 1 && f.saleOff, `payé ${f.paid}`);
  t.check('sans repreneur humain, un rival rachète les actifs', f.sold2 && /rachète les actifs de DiscountCo/.test(f.log), f.log.slice(-120));
  t.check('les sièges vacants sont repris par une nouvelle IA de la même caste', f.refill === 5 && /agriculteur/.test(f.castes) && /negociant/.test(f.castes), f.castes);

  // --- 7. Sièges : claim d'un siège IA en cours de partie, release, statut à l'écran ---
  const s = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, o = {}; for (let i = 0; i < 20; i++) W.step();
    const k = 'banquier', r = S.rivals.find(x => x.caste === k), pick = x => JSON.stringify({ cash: x.cash, att: x.att, px: x.px, bk: x.bk, as: x.as, re: x.re, id: x.id, name: x.name });
    o.free0 = W.seats.isFree(k); const b4 = pick(r), v0 = W.riv.value(r);
    const q = W.seats.claim(k, 'h:Alice'); o.ok = q.ok; o.same = pick(r) === b4 && W.riv.value(r) === v0; o.free1 = W.seats.isFree(k); o.seat = W.seats.list().find(x => x.caste === k); o.co = q.company && q.company.id === r.id && q.company.ctrl === 'human';
    o.twice = W.seats.claim(k, 'h:Bob').ok; o.meBlocked = W.seats.claim(k, 'me').ok; o.meCaste = S.caste;
    const px1 = JSON.stringify(r.px), att1 = JSON.stringify(r.att), acts1 = r.acts || 0; for (let i = 0; i < 70; i++) W.step();
    o.aiStopped = JSON.stringify(r.px) === px1 && JSON.stringify(r.att) === att1 && (r.acts || 0) === acts1 && r.st.k === 'human'; o.earns = r.rev > 0;
    o.order = W.seats.order(k, { px: { lux: 1.3 } }) && r.px.lux === 1.3;
    W.showCaste(true); const st = document.querySelector('#caste [data-seat="banquier"]'), st2 = document.querySelector('#caste [data-seat="negociant"]'), st3 = document.querySelector('#caste [data-seat="industriel"]'); o.ui = [st && st.textContent, st2 && st2.textContent, st3 && st3.textContent];
    document.querySelector('#caste [data-cview="negociant"]').click(); const btn = document.querySelector('#caste [data-caste="negociant"]'); o.btn = btn && btn.textContent; document.getElementById('caste').hidden = true;
    const pxA = r.px.lux, vA = W.riv.value(r), cashA = r.cash; const rel = W.seats.release(k); o.rel = rel.ok; o.free2 = W.seats.isFree(k);
    W.step(); o.jump = Math.abs(r.px.lux - pxA) / pxA; o.vJump = Math.abs(W.riv.value(r) - vA) / vA; for (let i = 0; i < 60; i++) W.step(); o.aiBack = r.px.lux < pxA - 0.02 && r.st.k !== 'human';
    // le joueur change de caste en cours de partie : l'IA du siège visé garde son entreprise et prend le siège libéré
    const n0 = S.rivals.length, tgt = S.rivals.find(x => x.caste === 'innovateur'), keep = JSON.stringify({ cash: tgt.cash, att: tgt.att, id: tgt.id }); W.setCaste('innovateur');
    o.swap = S.caste === 'innovateur' && S.rivals.length === n0 && tgt.caste === 'industriel' && JSON.stringify({ cash: tgt.cash, att: tgt.att, id: tgt.id }) === keep && !S.rivals.some(x => x.caste === 'innovateur');
    o.seats = W.seats.list().map(x => x.caste + ':' + x.ctrl).join(' '); W.setCaste('industriel'); return o;
  });
  t.check('claim d\'un siège IA en cours de partie : entreprise héritée telle quelle', s.free0 && s.ok && s.same && !s.free1 && s.seat.ctrl === 'human' && s.seat.pid === 'h:Alice' && s.co, JSON.stringify(s.seat));
  t.check('un siège tenu par un humain ne peut pas être repris (autre joueur, joueur local)', s.twice === false && s.meBlocked === false && s.meCaste === 'industriel', '');
  t.check('l\'IA cesse d\'agir pour ce siège (prix, expansion, actions de caste figés), l\'entreprise continue de vendre', s.aiStopped && s.earns, '');
  t.check('l\'humain qui tient le siège fixe ses prix (seats.order)', s.order === true, '');
  t.check('écran des castes : statut de chaque siège et action « Prendre cette caste »', /Joueur : Alice/.test(s.ui[0]) && /IA.*disponible/.test(s.ui[1]) && /Ton siège/.test(s.ui[2]) && /Prendre cette caste/.test(s.btn || ''), JSON.stringify(s.ui) + ' ' + s.btn);
  t.check('release : l\'IA reprend la main sans saut (prix et valeur continus), puis ramène les prix', s.rel && s.free2 && s.jump < 0.03 && s.vJump < 0.02 && s.aiBack, `saut de prix ${(s.jump * 100).toFixed(1)} %, de valeur ${(s.vJump * 100).toFixed(1)} %`);
  t.check('changement de caste du joueur : l\'IA visée garde son entreprise et reprend le siège libéré', s.swap, s.seats);

  // --- 8. Panneau Rivaux ---
  const u = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; W.step(); W.refreshStats(); document.getElementById('pn').click(); document.querySelector('[data-ptab="rivals"]').click();
    const box = document.getElementById('rivals'); return { n: box.querySelectorAll('.rcard[data-riv]').length, txt: box.textContent, rivals: S.rivals.length };
  });
  t.check('panneau Rivaux : une carte par IA avec caste, prix relatif, stratégie, valorisation, trésorerie', u.n === u.rivals && /Stratégie/.test(u.txt) && /Prix relatif/.test(u.txt) && /Valorisation/.test(u.txt) && /trésorerie/.test(u.txt) && /Banquier d'affaires/.test(u.txt) && /Sièges/.test(u.txt), `${u.n} cartes`);

  // --- 9. Valorisation non figée, joueur passif, déterminisme (même graine -> même histoire) ---
  const hist = async () => { await start('industriel', true); return pg.evaluate(() => {
    const W = window.WSE, S = W.S; S.rs = 424242; S.cash = 5e6; const v0 = S.rivals.map(r => W.riv.value(r)), y0 = [];
    for (let i = 0; i < 60; i++) W.step(); const sh = () => ['basic', 'std', 'lux'].reduce((a, c) => a + S.mkt[c].you, 0) / 3; const s0 = sh();
    for (let i = 0; i < 1140; i++) W.step();
    return { v0, v1: S.rivals.map(r => W.riv.value(r)), names: S.rivals.map(r => r.name), s0, s1: sh(), log: JSON.stringify(S.rv.log), px: JSON.stringify(S.rivals.map(r => r.px)), cash: S.rivals.map(r => Math.round(r.cash)), my: Math.round(S.cash), wars: S.rv.wars || 0, acts: S.rivals.map(r => r.acts || 0), nb: S.rivals.map(r => r.nb || 0), day: S.day, errs: 0 }; }); };
  const h1 = await hist(), h2 = await hist();
  const gr = h1.v1.map((v, i) => v / h1.v0[i]);
  t.check('valorisation des rivaux non figée sur 1 200 jours (chacune bouge d\'au moins 5 %)', gr.every(g => Math.abs(g - 1) >= 0.05), h1.names.map((n, i) => n + ' ×' + gr[i].toFixed(2)).join(', '));
  t.check('au moins trois rivaux grandissent nettement (plus de 10 % en un sixième de round)', gr.filter(g => g > 1.1).length >= 3, '');
  t.check('chaque IA agit selon sa caste (actions de caste menées, bâtiments posés en ville)', h1.acts.every(n => n >= 3) && h1.nb.reduce((a, b) => a + b, 0) >= 3, 'actions ' + h1.acts.join('/') + ', bâtiments ' + h1.nb.join('/'));
  t.check('un joueur passif perd des parts de marché', h1.s1 < h1.s0 * 0.97, `part moyenne ${(h1.s0 * 100).toFixed(1)} % -> ${(h1.s1 * 100).toFixed(1)} %`);
  t.check('déterminisme : même graine, même histoire (journal, prix, trésoreries)', h1.log === h2.log && h1.px === h2.px && JSON.stringify(h1.cash) === JSON.stringify(h2.cash) && h1.my === h2.my, `${h1.wars} guerre(s), jour ${h1.day}`);

  // --- 10. Sauvegarde : aller-retour et ancienne sauvegarde (rivaux sans caste, sans prix, sans S.rv ni S.seats) ---
  const sv = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; W.riv.state().offer = { kind: 'cartel', rid: S.rivals[0].id, cls: 'basic', until: S.day + 20 }; W.save();
    const d = JSON.parse(localStorage.getItem('wse-city-v8')); const o = { hasRv: !!d.rv, seats: (d.seats || []).length, px: !!d.rivals[0].px, day: d.day };
    d.rivals = [{ id: 'r1', name: 'Mega Mart', col: '#ff8a3d', cash: 5e6, att: { basic: 0.22, std: 0.12, lux: 0, estate: 0.1 } }, { id: 'r2', name: 'Luxor & Fils', col: '#ff4fa3', cash: 6e6, att: { basic: 0.02, std: 0.12, lux: 0.3, estate: 0.2 } }, { id: 'r3', name: 'DiscountCo', col: '#3fd8ff', cash: 4e6, att: { basic: 0.26, std: 0.26, lux: 0.2, estate: 0.2 } }];
    delete d.rv; delete d.seats; d.opt = { n: 2 }; o.json = JSON.stringify(d); return o; });
  t.check('la sauvegarde contient l\'état des rivaux (S.rv), les sièges et les prix', sv.hasRv && sv.seats === 6 && sv.px, JSON.stringify({ hasRv: sv.hasRv, seats: sv.seats, px: sv.px }));
  await pg.context().addInitScript(j => { localStorage.setItem('wse-city-v8', j); }, sv.json);   // la page sauvegarde en se fermant : l'ancienne sauvegarde est réécrite avant le démarrage
  await pg.reload(); await pg.waitForTimeout(700);
  const ld = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; W.setSpeed(0); S.noEv = true; ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    const o = { day: S.day, n0: S.rivals.length, noPx: S.rivals.every(r => !r.px), v: S.rivals.map(r => W.riv.value(r)) }; for (let i = 0; i < 30; i++) W.step();
    o.n1 = S.rivals.length; o.castes = S.rivals.map(r => r.caste); o.px = S.rivals.every(r => r.px && r.px.basic > 0); o.seats = W.seats.list().length; o.fin = S.rivals.every(r => isFinite(r.cash) && isFinite(W.riv.value(r))); o.me = S.caste; return o; });
  t.check('ancienne sauvegarde (3 rivaux sans caste ni prix) : chargée telle quelle', ld.day >= sv.day && ld.day <= sv.day + 3 && ld.n0 === 3, `jour ${ld.day}, ${ld.n0} rivaux`);
  t.check('ancienne sauvegarde : les rivaux reçoivent caste et prix au premier jour, sans doublon avec le joueur', ld.px && ld.fin && ld.seats === 6 && ld.castes.indexOf(ld.me) < 0 && ld.castes.join(',') === 'agriculteur,banquier,negociant', ld.castes.join(','));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
