// Passe 29 : pose d'un commerce sur du bâti existant (rachat PNJ), propriété des bâtiments, négociation avec un rival / joueur humain, sauvegarde.
exports.name = 'Acquisition de bâti et négociation';

exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e7 }); await L.inject(pg);
  await pg.evaluate(() => { window.WSE.S.done = window.WSE.acq.MISSIONS.map(m => m.id); });   // missions closées : pas de récompense qui fausse les mesures de trésorerie

  // 1. Pose sur une maison PNJ : bulle de confirmation, paiement, démolition, construction
  const A = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, o = {};
    S.cash = 5e7;
    let h = null; for (let i = 0; i < N * N && !h; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'house' && W.acq.ownerOf(c) === 'npc' && !W.footprintError(c.x, c.y, 's1', true)) h = c; }
    o.found = !!h; if (!h) return o;
    o.strict = W.footprintError(h.x, h.y, 's1'); o.acqFlag = W.footprintError(h.x, h.y, 's1', true);
    const ap = W.acq.plan(h.x, h.y, 's1'); o.plan = ap ? { acq: ap.acqNpc, build: ap.build, total: ap.total, housing: ap.housing, groups: Object.keys(ap.groups).length } : null;
    o.expect = W.acq.buyoutCost(h);
    const cash0 = S.cash, cap0 = S.stats.cap, mods0 = S.npcMods.length;
    const r0 = W.place(h.x, h.y, 's1'); o.placeFalse = r0 === false; o.bubble = !document.getElementById('acq').hidden; o.bubbleTxt = document.getElementById('acq').textContent;
    o.cashAfterOpen = S.cash === cash0; o.still = !!S.grid[h.y * N + h.x] && S.grid[h.y * N + h.x].t === 'npc';
    document.querySelector('#acq [data-ac=ok]').click();
    const c1 = S.grid[h.y * N + h.x];
    o.built = !!c1 && c1.t === 's1'; o.paid = Math.round(cash0 - S.cash); o.mods = S.npcMods.length - mods0; o.closed = document.getElementById('acq').hidden;
    o.cap = [cap0, S.stats.cap]; o.x = h.x; o.y = h.y;
    return o;
  });
  t.check('une maison PNJ est détectée comme acquérable (pose stricte refusée, acquisition possible)', A.found && A.strict && !A.acqFlag, `${A.strict} / "${A.acqFlag}"`);
  t.check('plan : rachat = buyoutCost, total = rachat + construction', A.plan && A.plan.acq === A.expect && A.plan.total === A.plan.acq + A.plan.build && A.plan.housing > 0, JSON.stringify(A.plan));
  t.check('la pose ouvre une bulle de confirmation sans rien débiter', A.placeFalse && A.bubble && A.cashAfterOpen && A.still && /Cette case est occupée par 1 maison/.test(A.bubbleTxt), A.bubbleTxt && A.bubbleTxt.slice(0, 90));
  t.check('confirmation : commerce construit, total payé, case PNJ démolie (npcMods)', A.built && A.paid === A.plan.total && A.mods === 1 && A.closed, `payé ${A.paid} attendu ${A.plan && A.plan.total}`);
  t.check('la capacité d\'habitat de la ville baisse du nombre d\'habitants annoncé (maison démolie)', A.cap[0] - A.cap[1] === A.plan.housing, A.cap.join(' > ') + ' / plan ' + A.plan.housing);

  // 2. Trésorerie insuffisante : refus avec le manque, rien n'est débité ni démoli
  const B = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, o = {};
    let c = null; for (let i = 0; i < N * N && !c; i++) { const q = S.grid[i]; if (q && q.t === 'npc' && q.k === 'res' && q.floors >= 3 && q.floors <= 6 && W.acq.ownerOf(q) === 'npc' && !W.footprintError(q.x, q.y, 's1', true)) c = q; }
    const ap = W.acq.plan(c.x, c.y, 's1'); S.cash = Math.round(ap.total - 500);
    W.place(c.x, c.y, 's1'); const btn = document.querySelector('#acq [data-ac=ok]');
    o.disabled = !!btn && btn.disabled; o.txt = document.getElementById('acq').textContent;
    const r = W.acq.exec(c.x, c.y, 's1', {}); o.why = r.why; o.short = r.short; o.cash = S.cash === Math.round(ap.total - 500); o.still = S.grid[c.y * N + c.x] === c;
    W.acq.close(); S.cash = 5e7; return o;
  });
  t.check('trésorerie insuffisante : bouton désactivé, manque affiché (500 $)', B.disabled && /il te manque 500 \$/.test(B.txt), B.txt.slice(-120));
  t.check('trésorerie insuffisante : exécution refusée, aucun débit, bâtiment intact', B.why === 'cash' && B.short === 500 && B.cash && B.still, JSON.stringify([B.why, B.short]));

  // 3. Remise Promoteur de 30 %
  const P = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N; let c = null; for (let i = 0; i < N * N && !c; i++) { const q = S.grid[i]; if (q && q.t === 'npc' && q.k === 'res' && q.floors >= 3 && W.acq.ownerOf(q) === 'npc' && !W.footprintError(q.x, q.y, 's2', true)) c = q; }
    W.setCaste('negociant'); const a = W.acq.plan(c.x, c.y, 's2').acqNpc; W.setCaste('promoteur'); const b = W.acq.plan(c.x, c.y, 's2').acqNpc; W.setCaste('industriel'); S.cash = 5e7; return { a, b };
  });
  t.check('caste Promoteur : rachat à -30 %', Math.abs(P.b / P.a - 0.7) < 0.01, `${P.b} / ${P.a}`);

  // 4. Emprise multiple : hypermarché 2x2 sur plusieurs bâtiments
  const M = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, o = {}; const T = W.TYPES.s3, w = T.w || 1, h = T.h || 1; o.size = [w, h]; let best = null;
    for (let y = 14; y < 44 && !best; y++) for (let x = 14; x < 44 && !best; x++) { const ap = W.acq.plan(x, y, 's3'); if (ap && ap.items.length >= 2 && !Object.keys(ap.groups).length) best = ap; }
    o.ok = !!best; if (!best) return o; o.n = best.items.length; o.desc = best.desc;
    const cash0 = S.cash, r = W.acq.exec(best.x, best.y, 's3', {}); o.res = r.ok; o.paid = Math.round(cash0 - S.cash); o.exp = best.total; o.after = S.grid[best.y * N + best.x].t;
    return o;
  });
  t.check('emprise multiple : plusieurs bâtiments rachetés d\'un coup, un seul paiement', M.ok && M.res && M.paid === M.exp && M.after === 's3', JSON.stringify(M));

  // 5. Propriété : rivaux propriétaires de quelques bâtiments, déterminisme
  const O = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, o = { by: {} };
    let n = 0; S.grid.forEach(c => { if (c && c.t === 'npc') { const w = W.acq.ownerOf(c); o.by[w] = (o.by[w] || 0) + 1; n++; } });
    o.n = n; o.rc = W.acq.rivalCells().length; o.rent = W.acq.rivalRents();
    const c = S.grid.find(c => c && c.t === 'npc' && W.acq.ownerOf(c) === 'r1'); o.c = c ? [c.x, c.y] : null;
    o.same = c && W.acq.ownerOf(c) === W.acq.ownerOf(c);
    const r1 = S.rivals.find(r => r.id === 'r1'), rev0 = r1.rev; o.r1 = !!r1;
    return o;
  });
  const own = Object.keys(O.by).filter(k => k !== 'npc').reduce((a, k) => a + O.by[k], 0);
  t.check('quelques bâtiments appartiennent aux rivaux (3 à 10 % de la ville)', own / O.n >= 0.03 && own / O.n <= 0.1 && O.by.r1 > 0 && O.by.r2 > 0 && O.by.r3 > 0, JSON.stringify(O.by));
  t.check('les rivaux perçoivent des loyers', O.rent.r1 > 0 && O.rent.r2 > 0, JSON.stringify(O.rent));

  // 6. Négociation avec un rival : accepté / contre-offre / refusé déterministes
  const G = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, o = {};
    const c = S.grid.find(c => c && c.t === 'npc' && W.acq.ownerOf(c) === 'r2' && !W.footprintError(c.x, c.y, 's1', true));
    const id = c.x + ',' + c.y, V = W.acq.value(c), R = W.acq.reserve([c], 'r2', 'me', false).R; o.V = V; o.R = R;
    const run = (off, setup) => { S.neg = {}; S.reqs = []; S.rel = {}; return JSON.parse(JSON.stringify(W.acq.demandeAchat('me', 'r2', id, off))); };
    o.hi = run(Math.round(R * 1.02)); o.mid = run(Math.round(R * 0.88)); o.low = run(Math.round(R * 0.5));
    o.mid2 = run(Math.round(R * 0.88));
    // 3 tours : contre-offres successives puis décision finale
    S.neg = {}; S.rel = {}; const seq = []; let off = Math.round(R * 0.86);
    for (let i = 0; i < 3; i++) { const r = W.acq.demandeAchat('me', 'r2', id, off); seq.push(r.state); if (r.state !== 'countered') break; off = Math.round(R * 0.86); }
    o.seq = seq;
    // refus : délai avant nouvelle tentative
    S.neg = {}; W.acq.demandeAchat('me', 'r2', id, Math.round(R * 0.3)); const again = W.acq.demandeAchat('me', 'r2', id, Math.round(R * 2)); o.again = [again.state, again.cd];
    S.day += 21; const later = W.acq.demandeAchat('me', 'r2', id, Math.round(R * 2)); o.later = later.state; S.day -= 21;
    return o;
  });
  t.check('offre >= valeur de réserve : acceptée', G.hi.state === 'accepted' && G.hi.price > 0, JSON.stringify(G.hi));
  t.check('offre un peu basse : contre-offre supérieure à l\'offre', G.mid.state === 'countered' && G.mid.counter > Math.round(G.R * 0.88), JSON.stringify(G.mid));
  t.check('offre très basse : refusée avec délai', G.low.state === 'refused' && G.low.cd === 20, JSON.stringify(G.low));
  t.check('réponses déterministes (même offre, même réponse)', G.mid.state === G.mid2.state && G.mid.counter === G.mid2.counter);
  t.check('3 tours maximum : la dernière réponse est acceptée ou refusée, jamais une 3e contre-offre', G.seq.length <= 3 && G.seq[G.seq.length - 1] !== 'countered', G.seq.join(' > '));
  t.check('après un refus : nouvelle tentative bloquée 20 jours, puis rouverte', G.again[0] === 'refused' && G.again[1] > 0 && G.later === 'accepted', JSON.stringify([G.again, G.later]));

  // 7. Négociation via l'interface + pose : paiement au rival, construction
  const U = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, o = {};
    S.neg = {}; S.reqs = []; S.cash = 5e7;
    const c = S.grid.find(c => c && c.t === 'npc' && W.acq.ownerOf(c) === 'r3' && !W.footprintError(c.x, c.y, 's4', true));
    o.pos = [c.x, c.y]; const r3 = S.rivals.find(r => r.id === 'r3'), cash0 = S.cash, rc0 = r3.cash;
    W.place(c.x, c.y, 's4'); o.bubble = document.getElementById('acq').textContent;
    o.noConfirm = !document.querySelector('#acq [data-ac=ok]');
    document.querySelector('#acq [data-ac=neg]').click();
    o.neg = document.getElementById('neg').textContent; o.negShown = !document.getElementById('neg').hidden;
    const R = W.acq.reserve([c], 'r3', 'me', false).R, rg = document.getElementById('negr'); rg.value = Math.round(R * 1.1 / 10) * 10; rg.dispatchEvent(new Event('input'));
    document.querySelector('#neg [data-ac=noffer]').click();
    o.acc = document.getElementById('neg').textContent; document.querySelector('#neg [data-ac=nok]').click();
    o.total = document.getElementById('acq').textContent;
    document.querySelector('#acq [data-ac=ok]').click();
    o.built = S.grid[c.y * N + c.x].t === 's4'; o.paid = Math.round(cash0 - S.cash); o.rivGain = Math.round(r3.cash - rc0);
    o.price = Math.round(R * 1.1 / 10) * 10; o.relUp = (S.rel.r3 || 0) > 0;
    return o;
  });
  t.check('rival : la bulle propose « Négocier avec » et pas de confirmation directe', /appartient à .*à négocier/.test(U.bubble) && U.noConfirm, U.bubble.slice(0, 160));
  t.check('fenêtre de négociation : valeur estimée, tour, avocat', U.negShown && /Valeur estimée/.test(U.neg) && /Tour1 \/ 3/.test(U.neg) && /avocat/.test(U.neg), U.neg.slice(0, 100));
  t.check('accord via l\'interface puis construction : le rival encaisse le prix, le joueur paie prix + construction', U.built && U.rivGain >= U.price && U.paid > U.price && /Accord/.test(U.acc) && U.relUp, `payé ${U.paid} prix ${U.price} rival +${U.rivGain}`);

  // 8. Joueur humain (multijoueur à venir) : état pending puis réponse
  const H = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, o = {};
    const c = S.grid.find(c => c && c.t === 'npc' && W.acq.ownerOf(c) === 'npc' && c.k === 'res' && c.floors <= 6);
    S.npcOwn = S.npcOwn || {}; S.npcOwn[c.x + ',' + c.y] = 'h:alice'; S.neg = {}; S.reqs = [];
    const id = c.x + ',' + c.y, R = W.acq.reserve([c], 'h:alice', 'me', false).R;
    o.owner = W.acq.ownerOf(c); o.name = W.acq.ownerName('h:alice');
    const r = W.acq.demandeAchat('me', 'h:alice', id, Math.round(R * 1.05)); o.st0 = r.state;
    S.day += 1; W.acq.stepReqs(); o.st1 = r.state; S.day += 1; W.acq.stepReqs(); o.st2 = r.state; o.price = r.price;
    const r2 = W.acq.demandeAchat('me', 'h:alice', id, Math.round(R * 0.9)); const sid = r2.id; o.p2 = r2.state;
    const rr = W.acq.repondreAchat(sid, 'counter', Math.round(R * 1.2)); o.p3 = rr.state + ':' + rr.counter;
    const r4 = W.acq.demandeAchat('me', 'h:alice', id, Math.round(R * 0.9)); const rf = W.acq.repondreAchat(r4.id, 'refuse'); o.p4 = rf.state;
    return o;
  });
  t.check('joueur humain : demande en attente (pending), réponse automatique en solo après 2 jours', H.owner === 'h:alice' && H.st0 === 'pending' && H.st1 === 'pending' && H.st2 === 'accepted' && H.price > 0, JSON.stringify(H));
  t.check('joueur humain : réponse manuelle contre-offre / refus', /^countered:/.test(H.p3) && H.p4 === 'refused', H.p3 + ' ' + H.p4);

  // 9. Sauvegarde v8 rétro-compatible
  const V = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, o = {};
    S.npcOwn = { '30,30': 'h:bob' }; S.neg = { '1,1': { r: 1, cd: 0 } }; W.save(); const sv = JSON.parse(localStorage.getItem('wse-city-v8')); o.v = sv.v; o.nown = !!sv.nown; o.neg = !!sv.neg;
    const key = 'wse-city-v8'; delete sv.nown; delete sv.neg; delete sv.reqs; delete sv.rid; localStorage.setItem(key, JSON.stringify(sv));
    return o;
  });
  await pg.reload(); await pg.waitForTimeout(900);
  const V2 = await pg.evaluate(() => { const W = window.WSE, S = W.S; return { npcOwn: typeof S.npcOwn, neg: typeof S.neg, reqs: Array.isArray(S.reqs), cash: S.cash > 0, built: S.grid.some(c => c && c.t === 's1'), mods: S.npcMods.length }; });
  t.check('sauvegarde v8 : champs nown/neg/reqs écrits', V.v === 8 && V.nown && V.neg, JSON.stringify(V));
  t.check('ancienne sauvegarde sans owner : chargée, défauts vides, constructions et démolitions conservées', V2.npcOwn === 'object' && V2.neg === 'object' && V2.reqs && V2.built && V2.mods >= 3, JSON.stringify(V2));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' || '));
  await pg.context().close();
};
