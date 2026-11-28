// Responsable Nautisme (demande de Rémy) : « un port de type PLAISANCIER, un peu de BANDE MARINE dans la carte, faire construire des yachts et des bateaux,
// un CHANTIER NAVAL où l'on construit à la fois des cargos, des pétroliers et des bateaux plaisanciers ».
// Vérifie : baie de plaisance présente pour une nouvelle partie (avec le port municipal) et absente d'une ancienne sauvegarde ; port de plaisance et chantier naval
// posables au bord de l'eau seulement (aucune zone imposée) ; conception d'un modèle (R&D) ; le chantier gagne des appels d'offres et produit un yacht et un cargo
// à la commande, avec délai, acompte, versement à la mise à l'eau, solde en créance à 30 jours et un BFR positif pendant la construction ; le port de plaisance
// encaisse des loyers de places ; budget fermé des ménages ; plaisance plus sensible à la récession que la marine marchande ; bateaux en mouvement proue en avant ;
// sauvegarde et rechargement intacts ; 0 erreur de page.
exports.name = 'Nautisme : baie, port de plaisance, chantier naval à la commande';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 2000 }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const a = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, Z = W.ZONE, V = W.nav, o = {}; S.noEv = true; S.done = W.acq.MISSIONS.map(m => m.id); S.won = true;
    o.bay = { S: S.bay, on: V.BAY.on, sea: [Z[20 * N + 80], Z[19 * N + 78], Z[22 * N + 79]], town: W.footprintError(80, 23, 's1') };
    // pose : à l'intérieur des terres refusé (message d'accès à l'eau), au bord de la baie et sur la côte accepté
    const freeAt = k => { for (let y = 56; y < 92; y++) for (let x = 2; x < 40; x++) { let ok = true; for (let j = 0; j < 3 && ok; j++) for (let i = 0; i < 3; i++) { const q = (y + j) * N + x + i; if (S.grid[q] || S.dep[q] || Z[q] !== 0) ok = false; } if (ok) return [x, y]; } return [40, 70]; }, fi = freeAt();
    o.inland = W.footprintError(fi[0], fi[1], 'marina'); o.inlandY = W.footprintError(fi[0], fi[1], 'shipyd'); o.fi = fi;
    const c0 = S.cash; o.mar = !W.footprintError(81, 16, 'marina') && W.place(81, 16, 'marina'); o.marPaid = c0 - S.cash;
    o.yard = !W.footprintError(86, 27, 'shipyd') && W.place(86, 27, 'shipyd');
    o.coast = null; for (let y = 2; y < 12 && !o.coast; y++) for (let x = 80; x < 90; x++) if (!W.footprintError(x, y, 'marina')) { o.coast = [x, y]; break; }
    const M = S.grid[16 * N + 81], Y = S.grid[27 * N + 86], A = V.S();
    // conception : coût débité, plans livrés au bout du délai
    const cr = S.cash; V.act(Y, 'rd:voilier'); o.rd = { paid: cr - S.cash, st: A.m.voilier.st, left: A.m.voilier.left };
    for (let d = 0; d < 21; d++) W.step(); o.rd.after = A.m.voilier.st;
    // yacht et cargo lancés, prix bas : le chantier gagne des commandes
    ['yacht', 'cargo'].forEach(k => { A.m[k].st = 'on'; A.m[k].px = 0.8; });
    const seen = {}, trace = []; let cashMin = 0;
    for (let d = 0; d < 260; d++) {
      const cb = S.cash; W.step();
      A.ord.forEach(q => { if (!seen[q.id]) seen[q.id] = { k: q.k, d0: q.d0, due: q.due, p: q.p, a0: q.a, days: W.nav.NAV_SHIPS[q.k].days }; const s = seen[q.id]; s.prMax = Math.max(s.prMax || 0, q.pr); s.bfr = Math.max(s.bfr || -1e15, q.c - q.a); if (q.pr >= 0.6) s.launch = q.a; });
      void cb;
    }
    o.orders = Object.keys(seen).map(id => Object.assign({ id: +id }, seen[id]));
    o.del = A.del.slice(); o.cum = A.cum; o.tw = A.tw; o.tl = A.tl; o.br = A.br; o.ar = (S.ar && S.ar.q || []).reduce((s, v) => s + v, 0);
    o.marina = { rev: M.pRev, nq: M._nq, util: M.util }; o.hh = V.hh(); o.pf = A.pf; o.mf = A.mf; o.portK = V.portK();
    // cycle : plaisance plus sensible que la marine marchande
    const ph0 = S.macro.phase; let rec = null, exp = null; for (let i = 0; i < 400; i++) { S.macro.phase = ph0 + i * 0.02; const c = V.cyc(); if (!rec || c.dv < rec.dv) rec = c; if (!exp || c.dv > exp.dv) exp = c; } S.macro.phase = ph0; o.cyc = { rec, exp };
    // bateaux en mouvement : cap = direction du déplacement
    let worst = 0; V.loops().forEach(P => { for (let s = 0; s < 30; s += 0.05) { const q0 = W.nav.loopAt(P, s), q1 = W.nav.loopAt(P, s + 0.01), mv = Math.atan2(q1[1] - q0[1], q1[0] - q0[0]); worst = Math.max(worst, Math.abs(Math.atan2(Math.sin(q0[2] - mv), Math.cos(q0[2] - mv)))); } });
    o.loops = V.loops().length; o.worst = worst;
    o.scan = window.T.scan().slice(0, 5);
    W.save(); o.sv = { n: A.ord.length, del: A.del.length, br: +A.br.toFixed(2), m: A.m.voilier.st, px: M.nv && M.nv.px, bay: S.bay, day: S.day };
    return o;
  });
  t.info(JSON.stringify({ orders: a.orders, tw: a.tw, tl: a.tl, marina: a.marina.nq, cyc: a.cyc, pf: a.pf, mf: a.mf }).slice(0, 1400));
  t.check('bande marine : baie de plaisance présente dans une nouvelle partie (eau au nord du port, port municipal sur la rive)', a.bay.S === 1 && a.bay.on === 1 && a.bay.sea.every(z => z === 3) && /municipal/.test(a.bay.town), JSON.stringify(a.bay));
  t.check('pose libre au bord de l\'eau : refus seulement loin de l\'eau (accès), port de plaisance posé dans la baie et sur la côte, chantier naval sur la côte', /bord de l'eau/.test(a.inland) && /bord de l'eau/.test(a.inlandY) && a.mar && a.yard && !!a.coast && a.marPaid > 0, JSON.stringify({ paid: a.marPaid, inland: a.inland, inlandY: a.inlandY, mar: a.mar, yard: a.yard, coast: a.coast }));
  t.check('conception d\'un modèle (R&D) : coût débité, plans livrés au bout du délai', a.rd.paid > 0 && a.rd.st === 'rd' && a.rd.after === 'on', JSON.stringify(a.rd));
  const yo = a.orders.filter(o => o.k === 'yacht'), co = a.orders.filter(o => o.k === 'cargo'), dy = a.del.filter(d => d[0] === 'yacht'), dc = a.del.filter(d => d[0] === 'cargo');
  t.check('appels d\'offres gagnés : au moins un yacht et un cargo commandés au chantier', yo.length >= 1 && co.length >= 1, `yachts ${yo.length} · cargos ${co.length}`);
  const okDelay = a.orders.every(o => o.due >= o.d0 + o.days - 1);
  t.check('production à la commande : délai de livraison promis ≥ durée de construction ; acompte de 20 % encaissé à la commande', okDelay && a.orders.every(o => Math.abs(o.a0 - 0.2 * o.p) < 1 || o.p === 0), a.orders.map(o => `${o.k} ${o.d0}→${o.due} (${o.days} j) acompte ${Math.round(o.a0 / Math.max(1, o.p) * 100)} %`).join(' · '));
  t.check('BFR pesant : pendant la construction les coûts engagés dépassent les acomptes reçus (en-cours > acomptes)', a.orders.some(o => o.bfr > 0), a.orders.map(o => o.k + ' ' + Math.round(o.bfr / 1e3) + ' k$').join(' · '));
  t.check('livraisons : un yacht et un cargo livrés, chiffre d\'affaires au prix du contrat, solde en créance à 30 jours', dy.length >= 1 && dc.length >= 1 && a.cum.rev > 0 && a.ar >= 0, `yachts ${dy.length} · cargos ${dc.length} · CA ${Math.round(a.cum.rev / 1e6)} M$ · créances ${Math.round(a.ar / 1e3)} k$`);
  t.check('le port de plaisance encaisse des loyers de places (prix de marché) et des services', a.marina.rev > 0 && a.marina.nq && a.marina.nq.rent > 0 && a.marina.nq.o > 0 && a.marina.nq.pr > 10, JSON.stringify(a.marina.nq));
  t.check('budget fermé : la dépense des ménages chez toi (places, bateaux) est retirée de leur budget de luxe', a.hh > 0, Math.round(a.hh) + ' $/j');
  t.check('cycle : la plaisance chute plus que la marine marchande en récession', a.cyc.rec.lux < a.cyc.rec.com && a.cyc.rec.com < 1 && a.cyc.exp.lux >= 1, JSON.stringify(a.cyc));
  t.check('flottes : flotte de plaisance et flotte marchande locale alimentées ; débit du port relié à la flotte marchande (≤ +45 %)', a.pf > 1 && a.mf > 0 && a.portK > 1 && a.portK <= 1.45, `${Math.round(a.pf)} bateaux · ${a.mf.toFixed(1)} navires · port ×${a.portK.toFixed(3)}`);
  t.check('bateaux de plaisance en mouvement : proue en avant sur tout le trajet (baie et ports du joueur)', a.loops >= 2 && a.worst < 0.2, `${a.loops} trajets · écart max ${(a.worst * 180 / Math.PI).toFixed(1)}°`);
  t.check('aucune valeur non finie dans l\'état', !a.scan.length, a.scan.join(' '));
  // sauvegarde et rechargement
  const p2 = await pg.context().newPage(); p2.errs = []; p2.on('pageerror', x => p2.errs.push(x.message)); await p2.goto(L.URL); await p2.waitForTimeout(1800);
  const re = await p2.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, A = W.nav.S(); W.setSpeed(0); const M = S.grid[16 * N + 81];
    const o = { n: A.ord.length, del: A.del.length, br: +A.br.toFixed(2), m: A.m.voilier.st, px: M && M.nv && M.nv.px, bay: S.bay, day: S.day, sea: W.ZONE[20 * N + 80], yard: !!(S.grid[27 * N + 86] && S.grid[27 * N + 86].t === 'shipyd') };
    for (let d = 0; d < 3; d++) W.step(); o.after = S.day; return o; });
  t.check('sauvegarde wse-city-v8 : baie, carnet de commandes, livraisons, marque, modèles, ports et chantier relus à l\'identique', re.n === a.sv.n && re.del === a.sv.del && re.br === a.sv.br && re.m === a.sv.m && re.bay === 1 && re.sea === 3 && re.yard && Math.abs(re.day - a.sv.day) <= 1, `avant ${JSON.stringify(a.sv)} après ${JSON.stringify(re)}`);
  // ancienne sauvegarde (sans les champs bay et nav) : la côte d'origine, rien de nautique
  await p2.evaluate(() => { const k = 'wse-city-v8', d = JSON.parse(localStorage.getItem(k)); delete d.bay; delete d.nav; const nav = r => Array.isArray(r) && (r[0] === 'marina' || r[0] === 'shipyd'); d.g = d.g.map(r => nav(r) || (Array.isArray(r) && r[0] === 'part' && nav(d.g[r[1]])) ? 0 : r); localStorage.setItem(k, JSON.stringify(d)); });
  const p3 = await pg.context().newPage(); p3.errs = []; p3.on('pageerror', x => p3.errs.push(x.message)); await p3.goto(L.URL); await p3.waitForTimeout(1800);
  const old = await p3.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; W.setSpeed(0); const o = { bay: S.bay || 0, on: W.nav.BAY.on, sea: W.ZONE[20 * N + 80], town: W.footprintError(80, 23, 's1'), nav: !!S.nav }; for (let d = 0; d < 3; d++) W.step(); o.ok = true; return o; });
  t.check('ancienne sauvegarde : rechargée sans la baie (côte d\'origine), sans état nautique, la partie continue', old.bay === 0 && old.on === 0 && old.sea !== 3 && !/municipal/.test(old.town) && old.ok, JSON.stringify(old));
  t.check('0 erreur de page', pg.errs.length === 0 && p2.errs.length === 0 && p3.errs.length === 0, pg.errs.concat(p2.errs, p3.errs).slice(0, 3).join(' ; '));
  await pg.context().close();
};
