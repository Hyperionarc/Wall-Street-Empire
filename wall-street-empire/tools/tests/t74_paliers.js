// Passe 74 : paliers d'amélioration 1 → 5 par chantier (barre de progression, comme WW3/Supremacy). Progression, fin de chantier, accélération en Diamants
// simulés (plafond en Round), prérequis (palier, population, trésorerie, chantiers simultanés), sauvegarde d'un chantier en cours, migration des anciennes
// sauvegardes (niveau au coût historique), affichage (fiche, intérieur, jauge sur la carte, liste « Niveau n/5 »), mobile 390×844, rentabilité par niveau.
// Captures facultatives : WSE_SHOTS=<dossier hors dépôt>.
exports.name = 'Paliers 1 → 5 par chantier';
const SHOTS = process.env.WSE_SHOTS || '';
exports.run = async (t, L) => {
  // ---- 1. barème, progression, fin de chantier, affichage
  const ctx = await (await L.browser()).newContext({ viewport: { width: 1280, height: 900 } });
  let pg = await L.newPage({ ctx }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
  const a = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, P = W.pal, o = {};
    o.costS2 = P.DEF.s2.cost.map(x => x / 1e6); o.costS3 = P.DEF.s3.cost.map(x => x / 1e6); o.days = P.DEF.s2.days; o.daysS3 = P.DEF.s3.days;
    o.multOk = Object.keys(P.DEF).every(k => P.DEF[k].mult.every((m, i, A) => i === 0 ? m === 1 : m > A[i - 1]));
    const c = T.inC('s2'); for (let i = 0; i < 10; i++) T.inC('res'); T.inP('port'); S.pop = Math.max(S.pop, 400000); T.stepN(4, true);
    o.cap0 = W.levelMult(c); o.jobs0 = W.jobsOf(c); const c0 = S.cash; o.uc = W.upgradeCost(c);
    o.ok = W.place(c.x, c.y, 'up'); o.paid = c0 - S.cash; o.pal = Object.assign({}, c.pal); o.second = W.place(c.x, c.y, 'up'); o.paid2 = c0 - S.cash;
    o.prog = []; o.sales = []; for (let d = 0; d < c.pal.dur - 1; d++) { T.stepN(1, true); o.prog.push(+P.prog(c).toFixed(3)); o.sales.push(+(c.out || 0).toFixed(1)); }
    W.openBuilding(c.x, c.y); const card = document.querySelector('#bbody .lever.pal'); o.card = card ? card.innerText.replace(/\s+/g, ' ') : ''; o.bar = !!document.querySelector('#bbody .palbar');
    o.drawn0 = P.drawn(); return o; });
  await pg.waitForTimeout(800);
  if (SHOTS) await pg.screenshot({ path: require('path').join(SHOTS, 't74_pc_interieur.png') });
  const a2 = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, P = W.pal, c = S.grid.find(x => x && x.t === 's2'), o = { cap: document.getElementById('bcap').textContent };
    W.closeBuilding(); W.centerOn(c.x, c.y); return o; });
  a.cap = a2.cap; await pg.waitForTimeout(800);
  if (SHOTS) await pg.screenshot({ path: require('path').join(SHOTS, 't74_pc_carte.png') });
  const a3 = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, P = W.pal, c = S.grid.find(x => x && x.t === 's2'), o = { drawn: P.drawn() };
    W.setPanel(true); W.setPtab('empire'); W.updateHUD && W.updateHUD(); W.p74Render(); o.list = (document.getElementById('palList') || {}).innerText || ''; W.setPanel(false);
    T.stepN(1, true); o.lvl = c.lvl; o.palGone = !c.pal; o.cap1 = W.levelMult(c); o.jobs1 = W.jobsOf(c); o.sayDone = /Chantier terminé/.test(document.body.innerText) || true;
    return o; });
  Object.assign(a2, a3);
  t.check('barème : supermarché 1 → 40 M$ (paliers 3, 8, 20, 40 M$), hypermarché 20, 40, 70, 100 M$ (après 10 M$ de base)', JSON.stringify(a.costS2) === '[3,8,20,40]' && JSON.stringify(a.costS3) === '[20,40,70,100]', `s2 ${a.costS2} · s3 ${a.costS3}`);
  t.check('durées croissantes : quelques jours pour 1→2, 3 à 6 semaines de jeu pour 4→5', a.days.every((d, i, A) => !i || d > A[i - 1]) && a.days[0] <= 7 && a.days[3] >= 21 && a.days[3] <= 42 && a.daysS3[3] >= 21 && a.daysS3[3] <= 45, `s2 ${a.days} j · s3 ${a.daysS3} j`);
  t.check('capacité strictement croissante de niveau en niveau pour chaque type', a.multOk, '');
  t.check('lancement : coût du palier débité, chantier en cours, un seul chantier par bâtiment', a.ok && Math.abs(a.paid - a.uc) < 2 && a.pal.to === 1 && a.second === false && a.paid2 === a.paid, JSON.stringify({ paid: a.paid, uc: a.uc, pal: a.pal, second: a.second }));
  t.check('barre de progression : avance chaque jour, le magasin continue de vendre', a.prog.every((p, i, A) => !i || p > A[i - 1]) && a.prog[a.prog.length - 1] < 1 && a.sales.every(v => v > 0), `progression ${a.prog.join(', ')} · ventes/j ${a.sales.join(', ')}`);
  t.check('fiche du bâtiment : niveau, barre, pourcentage et bouton Accélérer ; intérieur : légende du chantier', a.bar && /Niveau 1\/5/i.test(a.card) && /Chantier vers le niveau 2/.test(a.card) && /Accélérer/.test(a.card) && /chantier vers le niveau 2/.test(a.cap), a.card.slice(0, 160) + ' || ' + a.cap);
  t.check('carte : jauge du chantier dessinée au-dessus du bâtiment', a2.drawn > a.drawn0, `${a.drawn0} → ${a2.drawn} dessins`);
  t.check('liste des magasins « Niveau n/5 » avec le chantier en cours (Menu > Empire)', /Niveau 1\/5/.test(a2.list) && /Chantier vers le niveau 2/.test(a2.list), a2.list.slice(0, 160));
  t.check('fin de chantier : niveau 2, capacité et emplois en hausse', a2.lvl === 1 && a2.palGone && a2.cap1 > a.cap0 && a2.jobs1 > a.jobs0, JSON.stringify({ lvl: a2.lvl, cap: [a.cap0, a2.cap1], jobs: [Math.round(a.jobs0), Math.round(a2.jobs1)] }));

  // ---- 2. accélération, prérequis, chantiers simultanés
  const b = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, P = W.pal, E = W.ent.S(), o = {}, c = S.grid.find(x => x && x.t === 's2');
    W.place(c.x, c.y, 'up'); o.left0 = P.left(c); o.dia10 = P.diaFor(10); o.dia5 = P.diaFor(5);
    E.dia = 0; o.noDia = P.accel(c); o.still = !!c.pal;
    E.dia = 1000; const d0 = E.dia; o.cost = P.diaFor(P.accDays(c)); o.acc = P.accel(c); o.spent = d0 - E.dia; o.lvl = c.lvl; o.gone = !c.pal;
    // prérequis : palier d'entreprise, population, trésorerie
    const s3 = T.inC('s3'); S.unlockAll = false; S.stats.worth = 1e6; const r1 = P.reqs(s3); o.tierWhy = r1.why.join(' ; '); o.tierRefused = W.place(s3.x, s3.y, 'up') === false && !s3.pal;
    S.unlockAll = true; const pop0 = S.pop; S.pop = 1000; c.lvl = 2; const r2 = P.reqs(c); o.popWhy = r2.why.join(' ; '); o.popRefused = W.place(c.x, c.y, 'up') === false; S.pop = pop0;
    const cash0 = S.cash; S.cash = 1000; const r3 = P.reqs(c); o.cashWhy = r3.why.join(' ; '); o.cashRefused = W.place(c.x, c.y, 'up') === false; S.cash = cash0;
    // chantiers simultanés : 1 au palier Citoyen (tierNow 0), +1 par palier
    const sh = []; for (let i = 0; i < 3; i++) sh.push(T.inC('s1')); S.pop = 400000; S.unlockAll = false;   // refreshStats recalcule la valeur après chaque pose : on fixe le palier juste avant chaque essai
    S.stats.worth = 0; o.slots0 = P.slots(); o.p1 = W.place(sh[0].x, sh[0].y, 'up'); S.stats.worth = 0; o.slotWhy = P.reqs(sh[1]).why.join(' ; '); o.p2 = W.place(sh[1].x, sh[1].y, 'up');
    S.stats.worth = 80e6; o.slots2 = P.slots(); o.p3 = W.place(sh[1].x, sh[1].y, 'up'); S.unlockAll = true;
    return o; });
  t.check('accélération : coût en Diamants proportionnel au temps restant', b.dia10 === 2 * b.dia5 && b.dia5 > 0, `5 j = ${b.dia5}, 10 j = ${b.dia10} Diamants`);
  t.check('accélération refusée sans Diamants (jamais obligatoire : le chantier continue)', b.noDia === false && b.still, '');
  t.check('accélération avec Diamants simulés : chantier terminé tout de suite, Diamants débités', b.acc && b.gone && b.lvl === 2 && b.spent === b.cost && b.cost > 0, JSON.stringify({ cost: b.cost, spent: b.spent, lvl: b.lvl }));
  t.check('prérequis : palier d\'entreprise insuffisant → refus expliqué', b.tierRefused && /palier d'entreprise/.test(b.tierWhy), b.tierWhy);
  t.check('prérequis : population insuffisante → refus expliqué', b.popRefused && /habitants requise/.test(b.popWhy), b.popWhy);
  t.check('prérequis : trésorerie insuffisante → refus expliqué', b.cashRefused && /il manque/.test(b.cashWhy), b.cashWhy);
  t.check('chantiers simultanés limités par le palier d\'entreprise (1 au palier Citoyen, 3 au palier Industriel)', b.slots0 === 1 && b.p1 && !b.p2 && /chantier/.test(b.slotWhy) && b.slots2 === 3 && b.p3, JSON.stringify({ s0: b.slots0, p1: b.p1, p2: b.p2, s2: b.slots2, p3: b.p3, why: b.slotWhy }));

  // ---- 3. sauvegarde d'un chantier en cours, reprise, fin après rechargement
  const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S, c = S.grid.find(x => x && x.t === 's1' && x.pal); for (let i = 0; i < 2; i++) W.step(); W.save(); return { x: c.x, y: c.y, pal: Object.assign({}, c.pal), prog: W.pal.prog(c), day: S.day, raw: localStorage.getItem('wse-city-v8') }; });
  await pg.close();
  pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); await pg.goto(L.URL); await pg.evaluate(() => window.WSE.setSpeed(0)); await L.inject(pg);
  const re = await pg.evaluate(sv => { const W = window.WSE, S = W.S, c = W.S.grid[sv.y * W.N + sv.x]; const o = { day: S.day, pal: c && c.pal ? Object.assign({}, c.pal) : null, prog: c ? W.pal.prog(c) : -1 };
    let n = 0; while (c.pal && n < 60) { W.step(); n++; } o.after = n; o.lvl = c.lvl; return o; }, sv);
  t.check('sauvegarde : le chantier en cours est relu à l\'identique (niveau visé, début, durée, accélération)', re.pal && re.pal.to === sv.pal.to && re.pal.t0 === sv.pal.t0 && re.pal.dur === sv.pal.dur && Math.abs(re.prog - sv.prog) < 1e-9, JSON.stringify({ avant: sv.pal, apres: re.pal }));
  t.check('après rechargement le chantier reprend et se termine', re.lvl === sv.pal.to && re.after > 0 && re.after <= sv.pal.dur, `terminé en ${re.after} jours, niveau ${re.lvl + 1}`);
  t.check('rechargement : 0 erreur', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));

  // ---- 4. migration d'une sauvegarde d'avant les paliers : niveau payé au barème, sinon niveau 1, coût historique conservé
  const mig = JSON.parse(sv.raw); delete mig.ent; let s2i = -1, s1i = -1;
  mig.g.forEach((r, i) => { if (!Array.isArray(r)) return; if (r[0] === 's2' && s2i < 0) s2i = i; if (r[0] === 's1' && s1i < 0) s1i = i; });
  const m0 = { s2: mig.g[s2i].slice(), s1: mig.g[s1i].slice() };
  mig.g[s2i][2] = 2; mig.g[s2i][9] = 700000 + 490000 + 630000; if (mig.g[s2i][20] && typeof mig.g[s2i][20] === 'object') { delete mig.g[s2i][20].ps; delete mig.g[s2i][20].pa; }   // agrandi deux fois à l'ancienne (0,49 + 0,63 M$)
  mig.g[s1i][2] = 3; mig.g[s1i][9] = 110000 + 300000 + 800000 + 50000; if (mig.g[s1i][20] && typeof mig.g[s1i][20] === 'object') { delete mig.g[s1i][20].ps; delete mig.g[s1i][20].pa; }
  await pg.evaluate(raw => { localStorage.setItem('wse-city-v8', raw); Storage.prototype.setItem = () => {}; }, JSON.stringify(mig)); await pg.close();   // la page fermée ne doit pas réécrire sa sauvegarde (visibilitychange)
  pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); await pg.goto(L.URL); await pg.evaluate(() => window.WSE.setSpeed(0));
  const mg = await pg.evaluate(([i2, i1]) => { const W = window.WSE, S = W.S, a = S.grid[i2], b = S.grid[i1]; for (let d = 0; d < 3; d++) W.step(); return { s2: [a.lvl, a.invest, a.pspent || 0], s1: [b.lvl, b.invest, b.pspent || 0], pv: S.ent && S.ent.pv }; }, [s2i, s1i]);
  t.check('migration : supermarché agrandi à l\'ancienne pour 1,1 M$ → niveau 1 (le palier 2 coûte 3 M$), coût historique conservé', mg.s2[0] === 0 && Math.abs(mg.s2[1] - 1820000) < 1, JSON.stringify(mg.s2));
  t.check('migration : petit marché qui a payé 1,15 M$ de travaux → niveau 3 (0,3 + 0,8 M$), coût historique conservé', mg.s1[0] === 2 && Math.abs(mg.s1[1] - 1260000) < 1 && Math.abs(mg.s1[2] - 1.1e6) < 1, JSON.stringify(mg.s1));
  t.check('migration : 0 erreur, sauvegarde marquée (pv)', pg.errs.length === 0 && mg.pv === 1, pg.errs.slice(0, 2).join(' ; '));
  await ctx.close();

  // ---- 5. Round : l'accélération ne raccourcit jamais plus de la moitié d'un chantier (pas de pay-to-win)
  pg = await L.newPage({ wait: 600 });
  const rd = await pg.evaluate(() => { const W = window.WSE; W.showModes(); W.startMode('round'); const S = W.S; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); S.cash = 5e9; S.unlockAll = true; S.pop = 500000;
    let c = null; for (let y = 10; y < 80 && !c; y++) for (let x = 10; x < 80 && !c; x++) if (!W.footprintError(x, y, 's2') && W.place(x, y, 's2')) c = S.grid[y * W.N + x];
    if (!c) return { none: 1 }; c.lvl = 3; W.place(c.x, c.y, 'up'); const dur = c.pal.dur; W.ent.S().dia = 1e5; const okA = W.pal.accel(c); const left = W.pal.left(c), again = W.pal.accel(c);
    return { dur, okA, left, again, still: !!c.pal }; });
  t.check('Round : accélération plafonnée à 50 % du chantier, le reste se termine au rythme normal', !rd.none && rd.okA && Math.abs(rd.left - rd.dur / 2) < 1e-6 && rd.again === false && rd.still, JSON.stringify(rd));
  t.check('Round : 0 erreur', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // ---- 6. mobile 390×844 : fiche lisible, pas de défilement horizontal, boutons au doigt
  pg = await L.newPage({ w: 390, h: 844 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
  const mob = await pg.evaluate(async () => { const W = window.WSE, S = W.S, T = window.T, c = T.inC('s2'); for (let i = 0; i < 6; i++) T.inC('res'); S.pop = 400000; T.stepN(3, true); W.place(c.x, c.y, 'up'); T.stepN(2, true);
    W.openBuilding(c.x, c.y); await new Promise(r => setTimeout(r, 500)); const card = document.querySelector('#bbody .lever.pal'); if (card) card.scrollIntoView(); await new Promise(r => setTimeout(r, 200));
    const r = card ? card.getBoundingClientRect() : null, btn = card && card.querySelector('[data-act="palacc"]'), bb = btn ? btn.getBoundingClientRect() : null;
    return { card: !!card, inside: r ? r.left >= -1 && r.right <= innerWidth + 1 : false, sw: document.documentElement.scrollWidth, iw: innerWidth, btnH: bb ? bb.height : 0, txt: card ? card.innerText.replace(/\s+/g, ' ') : '' }; });
  if (SHOTS) await pg.screenshot({ path: require('path').join(SHOTS, 't74_mobile_fiche.png') });
  t.check('mobile 390×844 : carte du palier dans l\'écran, sans défilement horizontal, bouton Accélérer ≥ 36 px', mob.card && mob.inside && mob.sw <= mob.iw + 1 && mob.btnH >= 36, JSON.stringify({ inside: mob.inside, sw: mob.sw, iw: mob.iw, btnH: mob.btnH }));
  t.check('mobile : 0 erreur', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // ---- 7. rentabilité par niveau (banc du test t02, demande × population exigée par le palier / population du banc) : EBITDA ≥ 16 % et retour ≥ 1,5 an à chaque palier
  const eco = await L.pool([['s2', 1], ['s2', 2], ['s2', 3], ['s2', 4], ['s3', 1], ['s3', 2], ['s3', 3], ['s3', 4]], 1, async ([key, lv]) => {
    const p = await L.newPage(); await L.setup(p, { cash: 5e10, noAid: true }); await L.inject(p);
    const r = await p.evaluate(({ key, lv }) => { const W = window.WSE, T = window.T, S = W.S, P = W.pal.DEF[key]; const c = T.inC(key); for (let i = 0; i < 8; i++) T.inC('res'); T.inP('port');
      c.lvl = lv; c.pspent = 0; for (let l = 0; l < lv; l++) c.pspent += P.cost[l]; const dm = Math.max(1, W.pal.popReq(key, lv - 1) / S.pop); S.mods = (S.mods || []).concat([{ k: 'demand', v: dm, until: 1e9 }]);
      T.stepN(40, true); const A = { r: 0, e: 0 }, D = 40; for (let d = 0; d < D; d++) { T.frz(); W.step(); A.r += c.pRev || 0; A.e += (c.pRev || 0) - (c.inCost || 0) - (c.wages || 0) - (c.upk || 0) - (c.transport || 0) - (c.adCost || 0); }
      const inv = W.TYPES[key].cost + c.pspent; return { key, lv: lv + 1, eb: A.e / A.r, pb: inv / (A.e / D * 360) }; }, { key, lv });
    r.errs = p.errs.length; await p.context().close(); return r; });
  t.info('rentabilité par niveau : ' + eco.map(r => `${r.key} N${r.lv} EBITDA ${(r.eb * 100).toFixed(1)} % retour ${r.pb.toFixed(1)} an`).join(' ; '));
  t.check('chaque palier (niveaux 2 à 5 du supermarché et de l\'hypermarché) : EBITDA ≥ 16 % et retour sur l\'investissement cumulé ≥ 1,5 an, croissant', eco.every(r => r.eb >= 0.16 && r.pb >= 1.5) && ['s2', 's3'].every(k => eco.filter(r => r.key === k).every((r, i, A) => !i || r.pb > A[i - 1].pb)), eco.map(r => `${r.key}N${r.lv} ${(r.eb * 100).toFixed(0)} % ${r.pb.toFixed(1)} a`).join(', '));
  t.check('rentabilité : 0 erreur', eco.every(r => r.errs === 0), '');
};
