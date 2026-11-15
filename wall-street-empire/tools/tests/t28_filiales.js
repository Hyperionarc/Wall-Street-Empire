// Passe 32 : filiales (sociétés du groupe), comptabilité séparée, vente interne, prix de cession, impôt par société,
// offre « Groupe » dans la sélection de fournisseur, clients d'un producteur, sauvegarde rétrocompatible, arbre de chaîne cliquable.
exports.name = 'Filiales, vente interne, prix de cession, arbre de chaîne';

const near = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-6) * Math.max(1, Math.abs(a), Math.abs(b));

exports.run = async (t, L) => {
  // ---------- 1. Société à part, comptes, vente interne, prix de cession, impôt, fournisseurs, clients, sauvegarde
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);
  const r = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, G = W.grp, o = {};
    for (let i = 0; i < 10; i++) T.inC('res'); T.inC('s2'); T.inP('port');
    const mi = T.onDep('miron', 'iron'), mc = T.onDep('mcoal', 'coal'), f1 = T.inP('f1'), f1b = T.inP('f1'), f1c = T.inP('f1'), f2 = T.inP('f2');
    f1.prod = 'steel'; f1b.prod = 'steel'; f1c.prod = 'steel'; f2.prod = 'engine'; f2.src = { steel: 'auto', wire: 'port', oil: 'port' };
    const day = () => { T.frz(); const c0 = S.cash; W.step(); const A = G.accounts(), d = A.day; return { A, d, dc: S.cash - c0 }; };
    // défaut : tout appartient à la maison mère, aucune filiale
    o.def = { firm: G.idOf(f1), name: G.name(G.idOf(f1)), nFirms: (S.firms || []).length };
    T.stepN(12, true); o.base = { steelOut: f1.out, engOut: f2.out, lim: f2.limit };
    // création + affectation
    const f = G.create('Acier du Nord'); o.created = !!f && f.id > 0 && S.firms.length === 1 && f.name === 'Acier du Nord';
    o.eligNew = G.accounts().subs[0].elig; [f1, f1b, f1c, mi, mc].forEach(c => G.assign(c, f.id));
    o.assigned = [f1, f1b, f1c, mi, mc].every(c => c.firm === f.id) && G.idOf(f2) === 0;
    // comptabilité séparée, jour par jour : somme des sociétés = consolidé, trésorerie sans écart
    let maxChk = 0, maxCash = 0, maxDc = 0, maxEl = 0, maxEb = 0;
    for (let i = 0; i < 25; i++) { const { A, d, dc } = day(), all = [A.parent].concat(A.subs);
      const net = all.reduce((a, s) => a + s.d.net, 0), ext = all.reduce((a, s) => a + s.d.ext, 0), int = all.reduce((a, s) => a + s.d.int, 0), ic = all.reduce((a, s) => a + s.d.icost, 0);
      maxChk = Math.max(maxChk, Math.abs(net - S.fin.net), Math.abs(ext - (S.fin.revRetail + S.fin.revExport + S.fin.revTech + S.fin.revBank)));
      maxCash = Math.max(maxCash, Math.abs(A.cashSum - S.cash)); maxDc = Math.max(maxDc, Math.abs(dc - (S.fin.net - S.fin.div))); maxEl = Math.max(maxEl, Math.abs(int - ic));
      all.forEach(s => { maxEb = Math.max(maxEb, Math.abs(s.d.ebitda - (s.d.ext + s.d.int - s.d.icost - s.d.ecost))); }); }
    const A1 = G.accounts(), s1 = A1.subs[0];
    o.acc = { maxChk, maxCash, maxDc, maxEl, maxEb, subExt: s1.d.ext, subInt: s1.d.int, subCost: s1.d.ecost, subEb: s1.d.ebitda, parIcost: A1.parent.d.icost, parExt: A1.parent.d.ext, subCash: s1.cash, subN: s1.n, fixed: s1.fixed, roi: s1.roi, consoExt: A1.conso.ext, sumExtAvg: A1.parent.avg.ext + s1.avg.ext };
    // vente interne INACTIVE : le marché et les concurrents achètent l'acier
    const cl0 = G.clients(f1); o.off = { loc: S.locSold.steel, types: [...new Set(cl0.rows.map(x => x.type))], uses: cl0.rows.filter(x => x.type === 'grp').map(x => x.use), riv: cl0.rows.filter(x => x.type === 'riv').length, vols: cl0.rows.every(x => x.q > 0), isale: G.isale(f1) };
    o.cashBefore = { sub: f.cash, src: JSON.stringify(f2.src) };
    // vente interne ACTIVE (réglage de la filiale) : plus aucune vente au marché, aux concurrents ni à l'export ; l'usine du groupe est toujours servie
    f.isale = 1; let locOn = 0, xsOn = 0; for (let i = 0; i < 15; i++) { day(); locOn += S.locSold.steel || 0; xsOn += (S._xs && S._xs.steel) || 0; }
    const cl1 = G.clients(f1); o.on = { loc: locOn, xs: xsOn, types: [...new Set(cl1.rows.map(x => x.type))], engOut: f2.out, res: G.ledRes('steel'), src: JSON.stringify(f2.src), isale: G.isale(f1), sub: G.accounts().subs[0].d };
    // prix de cession : 130 % puis 70 % du marché ; la marge se déplace, le consolidé hors impôt ne bouge pas
    const flow = () => { const d = G.accounts().day, v = d.fl[f.id + '>0:steel']; return v ? { q: v[0], val: v[1], mv: v[2] } : null; };
    const pre = () => { const A = G.accounts(); return { sub: A.subs[0].d.pre, par: A.parent.d.pre, subInt: A.subs[0].d.int, parIc: A.parent.d.icost, tax: A.subs[0].d.tax, ptax: A.parent.d.tax, conso: A.subs[0].d.pre + A.parent.d.pre, f2cost: f2.inCost, f1rev: f1.pRev }; };
    G.setTp(f.id, 'steel', 'pct', 100); day(); const p100 = pre(), fl100 = flow();
    G.setTp(f.id, 'steel', 'pct', 130); day(); const p130 = pre(), fl130 = flow(); o.tp130 = G.tp(f.id, 'steel') / S.price.steel;
    G.setTp(f.id, 'steel', 'pct', 70); day(); const p70 = pre(), fl70 = flow();
    G.setTp(f.id, 'steel', 'abs', 5); day(); const flAbs = flow(); o.tpAbs = G.tp(f.id, 'steel');
    G.setTp(f.id, 'steel', 'pct', 250); o.tpClamp = G.tp(f.id, 'steel') / S.price.steel;
    G.setTp(f.id, 'steel', 'pct', 100);
    o.tp = { p100, p130, p70, fl100, fl130, fl70, flAbs };
    // impôt par société : la mère en perte ne réduit pas l'impôt de la filiale ; l'intégration fiscale compense
    S.lossC = 0; f.lossC = 0; f.isale = 0; G.setTp(f.id, 'steel', 'abs', S.price.steel * 6); S.grp.integ = 0;
    day(); const sep = G.accounts(), sepFin = { tax: S.fin.tax, up: S.fin.upkeep };
    o.sep = { subPre: sep.subs[0].d.pre, subTax: sep.subs[0].d.tax, parPre: sep.parent.d.pre, parTax: sep.parent.d.tax, tax: S.fin.tax, parLoss: S.lossC, elig: sep.subs[0].elig };
    f.born = S.day - 40; S.lossC = 0; f.lossC = 0; S.grp.integ = 1;
    day(); const it = G.accounts();
    o.integ = { subPre: it.subs[0].d.pre, parPre: it.parent.d.pre, tax: S.fin.tax, fee: it.day.fee, ca: it.day.ca, integ: it.subs[0].integ, rate: o.sep.subTax / Math.max(1, o.sep.subPre), feeK: G.INTEG_FEE };
    S.grp.integ = 0; G.setTp(f.id, 'steel', 'pct', 100);
    // dette allouée : plafonnée par la dette du groupe
    S.loan = 100000; o.debt = G.setDebt(f.id, 5e9); S.loan = 0; day(); o.debtAfter = f.debt;
    // fournisseurs : offre « Groupe » au prix de cession
    G.setTp(f.id, 'steel', 'pct', 110);
    const cards = G.offers(f2, 'steel'), gc = cards.find(x => x.type === 'grp');
    o.sup = { has: !!gc, id: gc && gc.id, total: gc && gc.o.total, tp: G.tp(f.id, 'steel'), name: gc && gc.name, overall: gc && gc.overall, delay: gc && gc.delay, types: [...new Set(cards.map(x => x.type))], n: cards.length, self: G.offers(f1, 'iron').filter(x => x.type === 'grp').length };
    G.openSup(f2, 'steel'); const sv = document.getElementById('supview');
    o.supUI = { open: !sv.hidden, tag: !!sv.querySelector('.gtag'), txt: (sv.textContent.match(/Groupe/g) || []).length, cards: sv.querySelectorAll('.sc').length, delay: /Délai/.test(sv.textContent) };
    const pick = sv.querySelector('[data-s="pick:' + (gc && gc.id) + '"]'); if (pick) pick.click(); const ok = sv.querySelector('[data-s="ok"]'); if (ok) ok.click();
    o.supPick = f2.src.steel; day(); day(); o.supRun = { engOut: f2.out, fl: !!flow() };
    // clients : écran
    f.isale = 0; T.stepN(6, true); G.act('cli:' + f1.x + ',' + f1.y); const gvw = document.getElementById('grpview');
    o.cliUI = { open: !gvw.hidden, rows: gvw.querySelectorAll('table tr').length - 1, txt: gvw.textContent.slice(0, 4000), riv: gvw.querySelectorAll('.cli-riv').length, grp: gvw.querySelectorAll('.cli-grp').length, mkt: gvw.querySelectorAll('.cli-mkt').length };
    // écran Groupe : liste des sociétés, rachat de rival dans la même liste
    S.subs = (S.subs || []).concat([{ name: 'Mega Mart', inc: 500 }]); G.open('grp');
    o.grpUI = { txt: gvw.textContent, rows: gvw.querySelectorAll('.gtab tr').length, bad: /NaN|undefined|Infinity|\[object/.test(gvw.textContent) };
    G.gact('firm:' + f.id); o.firmUI = { txt: gvw.textContent, bad: /NaN|undefined|Infinity|\[object/.test(gvw.textContent), range: gvw.querySelectorAll('input[type=range]').length };
    gvw.querySelector('[data-g="fisale:' + f.id + '"]').click(); o.fisale = f.isale; G.close();
    // fiche bâtiment : société, vente interne, clients
    W.openBuilding(f1.x, f1.y); const bv = document.getElementById('bview');
    o.bUI = { card: !!bv.querySelector('.firmcard'), create: !!bv.querySelector('[data-grp^="new:"]'), assign: bv.querySelectorAll('[data-grp^="assign:"]').length, cli: !!bv.querySelector('[data-grp^="cli:"]'), isale: !!bv.querySelector('[data-grp^="isale:"]') };
    bv.querySelector('[data-grp^="isale:"]').click(); o.bIsale = [f1.isale, G.isale(f1)]; bv.querySelector('[data-grp="assign:' + f1.x + ',' + f1.y + ':0"]').click(); o.bAssign = G.idOf(f1); G.assign(f1, f.id); W.closeBuilding();
    // sauvegarde : aller-retour, puis ancienne sauvegarde sans filiales
    f1.isale = 1; W.save(); const d = W.load(), c1 = d.grid[f1.y * W.N + f1.x];
    o.save = { firms: (d.firms || []).length, name: d.firms[0] && d.firms[0].name, cFirm: c1.firm, cIsale: c1.isale, tp: d.firms[0] && d.firms[0].tp && d.firms[0].tp.steel && d.firms[0].tp.steel.v, grp: !!d.grp, src: d.grid[f2.y * W.N + f2.x].src.steel, cash: d.firms[0].cash };
    const raw = JSON.parse(localStorage.getItem('wse-city-v8')); delete raw.firms; delete raw.grp; raw.g.forEach(c => { if (c && c[20] && typeof c[20] === 'object') { delete c[20].fm; delete c[20].is; } });
    localStorage.setItem('wse-city-v8', JSON.stringify(raw)); const d0 = W.load(), c0 = d0 && d0.grid[f1.y * W.N + f1.x];
    o.old = { ok: !!d0, firms: d0 && (d0.firms || []).length, cFirm: c0 && c0.firm, grp: d0 && d0.grp };
    // partie sans filiale (état d'ancienne sauvegarde) : rien ne change, aucune erreur
    S.firms = undefined; S.grp = undefined; [f1, f1b, f1c, mi, mc, f2].forEach(c => { delete c.firm; delete c.isale; }); f2.src.steel = 'auto';
    const c0b = S.cash; T.frz(); W.step(); o.plain = { dc: S.cash - c0b, net: S.fin.net - S.fin.div, grp: S.grp === undefined, bad: T.scan() };
    return o;
  });
  t.check('par défaut tout bâtiment appartient à la maison mère (aucune filiale)', r.def.firm === 0 && r.def.name === 'Maison mère' && r.def.nFirms === 0, JSON.stringify(r.def));
  t.check('la chaîne de test tourne (acier produit, moteurs produits)', r.base.steelOut > 1 && r.base.engOut > 0.1, JSON.stringify(r.base));
  t.check('création d\'une filiale nommée', r.created);
  t.check('affectation de bâtiments à la filiale (c.firm), le reste à la maison mère', r.assigned);
  t.check('comptes par société : CA externe, CA interne, coûts, EBITDA de la filiale renseignés', r.acc.subExt > 0 && r.acc.subInt > 0 && r.acc.subCost > 0 && r.acc.subN === 5 && r.acc.fixed > 0 && Number.isFinite(r.acc.roi), JSON.stringify(r.acc));
  t.check('achats internes de la mère = ventes internes de la filiale', near(r.acc.parIcost, r.acc.subInt, 1e-9) && r.acc.maxEl < 1e-6, `${r.acc.parIcost} / ${r.acc.subInt}`);
  t.check('EBITDA = CA externe + CA interne − achats internes − coûts externes (chaque société, chaque jour)', r.acc.maxEb < 1e-6, r.acc.maxEb);
  t.check('somme des sociétés = consolidé (résultat net et CA externe), 25 jours', r.acc.maxChk < 0.01, r.acc.maxChk);
  t.check('aucun écart de trésorerie : somme des trésoreries des sociétés = trésorerie du groupe', r.acc.maxCash < 0.01, r.acc.maxCash);
  t.check('variation de trésorerie du groupe = résultat net consolidé − dividendes', r.acc.maxDc < 0.01, r.acc.maxDc);
  t.check('trésorerie interne de la filiale alimentée par son résultat', Math.abs(r.acc.subCash) > 1, r.acc.subCash);
  t.check('vente interne INACTIVE : le marché local achète l\'acier', r.off.loc > 1 && !r.off.isale, r.off.loc);
  t.check('clients listés : groupe, rivaux IA et marché, avec volumes et usage', r.off.types.indexOf('grp') >= 0 && r.off.types.indexOf('riv') >= 0 && r.off.types.indexOf('mkt') >= 0 && r.off.riv >= 1 && r.off.vols && r.off.uses.some(u => /Moteurs/.test(u)), JSON.stringify(r.off));
  t.check('vente interne ACTIVE : plus aucune vente au marché, aux concurrents ni à l\'export (15 jours)', r.on.loc === 0 && r.on.xs === 0 && r.on.isale, `${r.on.loc} / ${r.on.xs}`);
  t.check('vente interne ACTIVE : seuls les bâtiments du groupe sont clients', r.on.types.length === 1 && r.on.types[0] === 'grp', JSON.stringify(r.on.types));
  t.check('vente interne ACTIVE : le surplus est stocké (stock réservé), l\'usine du groupe reste servie', r.on.res > 10 && r.on.engOut > 0.1 && r.on.sub.int > 0, JSON.stringify({ res: r.on.res, eng: r.on.engOut }));
  t.check('changer l\'option ne rompt pas les achats en cours (fournisseurs inchangés)', r.on.src === r.cashBefore.src, r.on.src);
  const tp = r.tp;
  t.check('prix de cession 130 % : la filiale facture 1,3 × le prix de marché', tp.fl130 && near(tp.fl130.val / tp.fl130.mv, 1.3, 1e-6) && near(r.tp130, 1.3, 1e-9), tp.fl130 && tp.fl130.val / tp.fl130.mv);
  t.check('prix de cession 70 % et prix libre appliqués, pourcentage borné à 70-130 %', tp.fl70 && near(tp.fl70.val / tp.fl70.mv, 0.7, 1e-6) && r.tpAbs === 5 && tp.flAbs && near(tp.flAbs.val / tp.flAbs.q, 5, 1e-6) && near(r.tpClamp, 1.3, 1e-9), JSON.stringify([tp.fl70 && tp.fl70.val / tp.fl70.mv, r.tpAbs, r.tpClamp]));
  t.check('la marge est comptabilisée chez la vendeuse : CA interne et résultat de la filiale montent avec le prix de cession', tp.p130.subInt > tp.p100.subInt * 1.2 && tp.p70.subInt < tp.p100.subInt * 0.8, `${tp.p70.subInt} < ${tp.p100.subInt} < ${tp.p130.subInt}`);
  t.check('consolidation : la marge intra-groupe est éliminée (achats internes = ventes internes à chaque prix)', near(tp.p130.subInt, tp.p130.parIc, 1e-9) && near(tp.p70.subInt, tp.p70.parIc, 1e-9));
  t.check('compte par bâtiment : l\'usine acheteuse paie le prix de cession (coût d\'intrants plus élevé à 130 % qu\'à 70 %)', tp.p130.f2cost > tp.p70.f2cost, `${tp.p70.f2cost} / ${tp.p130.f2cost}`);
  t.check('impôt par société : la filiale bénéficiaire paie son impôt, la mère en perte n\'en paie pas et garde sa perte reportable', r.sep.subPre > 0 && r.sep.subTax > 0 && r.sep.parPre < 0 && r.sep.parTax === 0 && r.sep.parLoss > 0 && near(r.sep.tax, r.sep.subTax, 1e-9), JSON.stringify(r.sep));
  const expInt = Math.max(0, r.integ.subPre + r.integ.parPre) * r.integ.rate;
  t.check('intégration fiscale : impôt calculé sur le résultat d\'ensemble (les pertes de la mère compensent)', r.integ.integ && near(r.integ.tax, expInt, 1e-6) && r.integ.tax < r.sep.tax, `${r.integ.tax} attendu ${expInt}, séparé ${r.sep.tax}`);
  t.check('intégration fiscale : coût = 0,15 % du CA consolidé', near(r.integ.fee, r.integ.feeK * r.integ.ca, 1e-9) && r.integ.fee > 0, r.integ.fee);
  t.check('filiale récente non éligible à l\'intégration (détention de 30 jours), éligible ensuite', r.eligNew === false && r.sep.elig === true);
  t.check('dette allouée plafonnée par la dette du groupe', r.debt === 100000 && r.debtAfter === 0, `${r.debt} / ${r.debtAfter}`);
  t.check('fournisseurs : offre « Groupe » au prix de cession, notée comme les autres', r.sup.has && near(r.sup.total, r.sup.tp, 1e-9) && r.sup.name === 'Acier du Nord' && r.sup.overall > 0 && r.sup.delay === 0 && r.sup.types.indexOf('co') >= 0 && r.sup.types.indexOf('import') >= 0, JSON.stringify(r.sup));
  t.check('pas d\'offre « Groupe » de sa propre société', r.sup.self === 0, r.sup.self);
  t.check('page de sélection : étiquette « Groupe » et délai affichés à côté des concurrents et du port', r.supUI.open && r.supUI.tag && r.supUI.cards >= 3 && r.supUI.delay, JSON.stringify(r.supUI));
  t.check('choisir l\'offre du groupe : l\'usine s\'y fournit au prix de cession', /^grp:\d+$/.test(r.supPick || '') && r.supRun.engOut > 0.1 && r.supRun.fl, JSON.stringify([r.supPick, r.supRun]));
  t.check('bouton « Voir les clients » : écran avec acheteurs du groupe, rivaux et marché', r.cliUI.open && r.cliUI.grp >= 1 && r.cliUI.riv >= 1 && r.cliUI.mkt >= 1 && !L.BAD_TXT.test(r.cliUI.txt), JSON.stringify({ g: r.cliUI.grp, r: r.cliUI.riv, m: r.cliUI.mkt }));
  t.check('écran Groupe : maison mère, filiale, rachat de rival, éliminations, consolidé', /Maison mère/.test(r.grpUI.txt) && /Acier du Nord/.test(r.grpUI.txt) && /Mega Mart/.test(r.grpUI.txt) && /Éliminations/.test(r.grpUI.txt) && /Groupe consolidé/.test(r.grpUI.txt) && /Intégration fiscale/.test(r.grpUI.txt) && !r.grpUI.bad, r.grpUI.rows);
  t.check('fiche société : compte de résultat, bilan, prix de cession réglable', /Compte de résultat/.test(r.firmUI.txt) && /Bilan/.test(r.firmUI.txt) && /Prix de cession/.test(r.firmUI.txt) && r.firmUI.range >= 2 && !r.firmUI.bad && r.fisale === 1, r.firmUI.range);
  t.check('fiche bâtiment : société, « Créer une filiale », « Affecter à », vente interne, clients', r.bUI.card && r.bUI.create && r.bUI.assign >= 2 && r.bUI.cli && r.bUI.isale, JSON.stringify(r.bUI));
  t.check('fiche bâtiment : bascule de la vente interne et réaffectation', r.bIsale[0] === 0 && r.bIsale[1] === false && r.bAssign === 0, JSON.stringify([r.bIsale, r.bAssign]));
  t.check('sauvegarde v8 : filiales, affectation, vente interne, prix de cession et fournisseur « Groupe » conservés', r.save.firms === 1 && r.save.name === 'Acier du Nord' && r.save.cFirm > 0 && r.save.cIsale === 1 && r.save.tp === 110 && r.save.grp && /^grp:/.test(r.save.src), JSON.stringify(r.save));
  t.check('ancienne sauvegarde (sans filiales) : chargée, tout à la maison mère', r.old.ok && r.old.firms === 0 && r.old.cFirm === undefined && r.old.grp === null, JSON.stringify(r.old));
  t.check('partie sans filiale : simulation inchangée, aucun champ créé, aucune valeur invalide', near(r.plain.dc, r.plain.net, 1e-9) && r.plain.grp && r.plain.bad.length === 0, JSON.stringify(r.plain));
  t.check('aucune erreur de page (comptes, écrans)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();

  // ---------- 2. Arbre de chaîne cliquable (voiture)
  const p2 = await L.newPage({ wait: 500 }); await L.setup(p2, { cash: 5e10 }); await L.inject(p2);
  const a = await p2.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T, G = W.grp, o = {}, gvw = document.getElementById('grpview');
    for (let i = 0; i < 10; i++) T.inC('res'); T.inC('s3'); T.inP('port');
    // avant toute usine : l'arbre annonce déjà la chaîne et son coût
    const t0 = G.tree('car'); o.t0 = { kids: t0.root.kids.map(n => n.k), rootSt: t0.root.st, miss: t0.nMiss, cost: t0.missCost };
    W.launchProduct('car'); const ps = S.prod.car; ps.st = 'on'; ps.rnd = 0; ps.pf = 1; ps._q = ps.q;
    const fc = T.inP('f3'); fc.prod = 'car'; const fe = T.inP('f2'); fe.prod = 'engine'; const fs = T.inP('f1'); fs.prod = 'steel';
    const mi = T.onDep('miron', 'iron'), mc = T.onDep('mcoal', 'coal');
    const f = G.create('Acier SA'); [fs, mi, mc].forEach(c => G.assign(c, f.id)); f.isale = 1;
    const co = G.offers(fe, 'wire').find(x => x.type === 'co');
    fe.src = { steel: 'auto', wire: co.id, oil: 'port' }; fc.src = { engine: 'auto', chassis: 'local', tire: 'port' };
    Object.keys(W.productInputs('car')).forEach(g => { if (!fc.src[g]) fc.src[g] = 'port'; });
    T.stepN(8, true);
    const snap = () => { const t = G.tree('car'), by = {}; t.list.forEach(n => { by[n.path] = n.st; }); return { t, by, sts: [...new Set(t.list.filter(n => !n.root).map(n => n.st))] }; };
    const s1 = snap(), kid = k => s1.t.root.kids.find(n => n.k === k);
    o.t1 = { kids: s1.t.root.kids.map(n => n.k), eng: kid('engine').kids.map(n => n.k + ':' + n.st), cha: kid('chassis').kids.map(n => n.k + ':' + n.st), tir: kid('tire').kids.map(n => n.k + ':' + n.st), sts: s1.sts, root: s1.t.root.st,
      engine: s1.by['car/engine'], chassis: s1.by['car/chassis'], tire: s1.by['car/tire'], steel: s1.by['car/engine/steel'], wire: s1.by['car/engine/wire'], oil: s1.by['car/engine/oil'], rubber: s1.by['car/tire/rubber'],
      leaves: s1.t.list.filter(n => !n.kids.length).every(n => !W.RECIPES[n.k]), missCost: s1.t.missCost, gain: s1.t.gain, nMiss: s1.t.nMiss, chCost: s1.t.nodes['car/chassis'].cost, sev: s1.t.list.filter(n => n.sev).map(n => n.k + ':' + n.sev + ':' + n.cause).slice(0, 6), steelLine: '' };
    // bouton de la fiche produit
    W.setPview(true); const pc = document.querySelector('#plist [data-p="car"]'); if (pc) pc.click();
    const tb = document.querySelector('#pdetail [data-grp="tree:car"]'); o.btn = !!tb; if (tb) tb.click();
    o.ui = { open: !gvw.hidden, nodes: gvw.querySelectorAll('.tbtn').length, tree: !!gvw.querySelector('[role="tree"]'), items: gvw.querySelectorAll('[role="treeitem"]').length, head: [(document.getElementById('chmiss') || {}).textContent, (document.getElementById('chgain') || {}).textContent], svg: !!gvw.querySelector('script,iframe'),
      txt: gvw.textContent, lines: [...gvw.querySelectorAll('.tbtn')].map(b => b.dataset.st + '|' + b.querySelector('.tst').textContent) };
    // clavier : flèches pour se déplacer, replier et déplier
    const b0 = gvw.querySelector('.tbtn'); b0.focus(); const key = k => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    key('ArrowDown'); const foc1 = document.activeElement.dataset.g; key('ArrowLeft'); const li1 = gvw.querySelector('[data-path="car/engine"]');
    o.kb = { foc1, collapsed: li1.getAttribute('aria-expanded'), kidsHidden: !gvw.querySelector('[data-path="car/engine/steel"]'), focusKept: document.activeElement.dataset.g };
    key('ArrowRight'); o.kb.reopen = gvw.querySelector('[data-path="car/engine"]').getAttribute('aria-expanded') + '/' + !!gvw.querySelector('[data-path="car/engine/steel"]');
    // nœud acheté ou importé : choisir un fournisseur / internaliser, avec comparaison de coût
    gvw.querySelector('[data-g="node:car/tire"]').click();
    o.tire = { sheet: !!document.getElementById('gsheet'), sup: !!gvw.querySelector('#gsheet [data-g^="sup:"]'), inter: /Internaliser/.test(document.getElementById('gsheet').textContent), cmp: (document.getElementById('chcmp') || {}).textContent, txt: document.getElementById('gsheet').textContent };
    gvw.querySelector('#gsheet [data-g="plan"]').click(); o.tire.plan = !!gvw.querySelector('.gconfirm') && /Pneus|caoutchouc/i.test(gvw.querySelector('.gconfirm').textContent);
    gvw.querySelector('[data-g="cancel"]').click(); o.tire.cancel = !gvw.querySelector('.gconfirm') && (S.firms || []).length === 1;
    // nœud manquant : construire la filiale manquante, coût annoncé, confirmation
    gvw.querySelector('[data-g="node:car/chassis"]').click();
    const bb = gvw.querySelector('#gsheet [data-g="plan"]'); o.miss = { btn: bb && bb.textContent, before: (S.firms || []).length };
    bb.click(); const cf = gvw.querySelector('.gconfirm'); o.miss.confirm = !!cf; o.miss.total = W.grp.state().plan.total; o.miss.items = W.grp.state().plan.items.map(i => i.k + ':' + i.key + '×' + i.n + (i.err ? '!' + i.err : '')); o.miss.totTxt = (document.getElementById('chtotal') || {}).textContent;
    o.miss.nothingYet = (S.firms || []).length === 1; const cash0 = S.cash;
    gvw.querySelector('[data-g="confirm"]').click();
    const nf = S.firms[S.firms.length - 1], nb = []; S.grid.forEach(c => { if (c && c.firm === nf.id && c.t !== 'part') nb.push(c); });
    o.built = { firms: S.firms.length, name: nf.name, isale: nf.isale, tpDef: nf.tpDef, n: nb.length, prods: [...new Set(nb.map(c => c.prod || W.TYPES[c.t].ext))], spent: cash0 - S.cash, src: fc.src.chassis, conn: nb.filter(c => c.conn).length };
    const s2 = snap(); o.t2 = { chassis: s2.by['car/chassis'], paint: s2.by['car/chassis/paint'], missCost: s2.t.missCost, nMiss: s2.t.nMiss, uiLine: (gvw.querySelector('[data-g="node:car/chassis"] .tst') || {}).textContent, uiSt: (gvw.querySelector('[data-g="node:car/chassis"]') || {}).dataset.st, head: (document.getElementById('chmiss') || {}).textContent };
    S.stock.steel += 80000; T.stepN(12, true); const s3 = snap(), ch = s3.t.nodes['car/chassis'];
    o.t3 = { chassis: ch.st, out: ch.mk.reduce((x, c) => x + ((c.cm && c.cm[0]) || 0), 0), cumInt: G.accounts().subs[1].cum.int, carCum: (fc.cm && fc.cm[0]) || 0, carOut: fc.out, lim: fc.limit, sev: s3.t.list.filter(n => n.sev).map(n => n.k + ':' + n.sev + ':' + n.cause).slice(0, 8), sub: G.accounts().subs.map(s => s.name + ' int ' + Math.round(s.d ? s.d.int : 0)), bad: T.scan() };
    // choisir un fournisseur depuis l'arbre
    G.open('tree', { pk: 'car' }); gvw.querySelector('[data-g="node:car/tire"]').click(); gvw.querySelector('#gsheet [data-g^="sup:"]').click();
    o.supOpen = { sup: !document.getElementById('supview').hidden, grp: gvw.hidden, txt: /SÉLECTIONNER UN FOURNISSEUR/.test(document.getElementById('supview').textContent) && /Pneus/.test(document.getElementById('supview').textContent) };
    document.getElementById('supview').hidden = true;
    // composant (pas seulement produit fini) : même arbre
    const tm = G.tree('engine'); o.comp = { kids: tm.root.kids.map(n => n.k), n: tm.list.length };
    return o;
  });
  t.check('arbre de la voiture : 3 composants (moteurs, châssis, pneus)', ['engine', 'chassis', 'tire'].every(k => a.t1.kids.indexOf(k) >= 0), a.t1.kids.join(','));
  t.check('chaque composant descend jusqu\'à ses matières premières', a.t1.eng.some(x => /^steel:/.test(x)) && a.t1.eng.some(x => /^oil:/.test(x)) && a.t1.cha.some(x => /^steel:/.test(x)) && a.t1.tir.some(x => /^rubber:/.test(x)) && a.t1.leaves, JSON.stringify([a.t1.eng, a.t1.cha, a.t1.tir]));
  t.check('avant toute usine, l\'arbre annonce la chaîne manquante et son coût', a.t0.rootSt === 'miss' && a.t0.kids.length >= 3 && a.t0.miss >= 3 && a.t0.cost > 0, JSON.stringify(a.t0));
  t.check('statut « Fabriqué par ta filiale » (acier)', a.t1.steel === 'sub', a.t1.steel);
  t.check('statut « Fabriqué par la maison mère » (moteurs)', a.t1.engine === 'parent' && a.t1.root === 'parent', a.t1.engine);
  t.check('statut « Acheté à un fournisseur » (fil)', a.t1.wire === 'bought', a.t1.wire);
  t.check('statut « Importé » (pneus, pétrole)', a.t1.tire === 'imp' && a.t1.oil === 'imp', `${a.t1.tire} ${a.t1.oil}`);
  t.check('statut « MANQUANT » (châssis) avec coût d\'installation estimé', a.t1.chassis === 'miss' && a.t1.chCost > 0, `${a.t1.chassis} ${a.t1.chCost}`);
  t.check('matière d\'un composant acheté : « non requis » (caoutchouc)', a.t1.rubber === 'na', a.t1.rubber);
  t.check('en-tête : coût total de ce qui manque et gain mensuel si la chaîne est complète', a.t1.missCost > 0 && Number.isFinite(a.t1.gain) && /\$/.test(a.ui.head[0] || '') && /mois/.test(a.ui.head[1] || ''), JSON.stringify(a.ui.head));
  t.check('goulots signalés sur les nœuds (cause lisible)', a.t1.sev.length >= 1 && a.t1.sev.every(x => x.split(':')[2].length > 3), a.t1.sev.join(' ; '));
  t.check('fiche produit : bouton « Arbre de chaîne · monter la filiale fournisseur »', a.btn && a.ui.open);
  t.check('arbre affiché en DOM (role=tree, nœuds cliquables), sans bibliothèque externe', a.ui.tree && a.ui.nodes >= 10 && a.ui.items === a.ui.nodes && !a.ui.svg && !L.BAD_TXT.test(a.ui.txt), `${a.ui.nodes} nœuds`);
  t.check('une ligne de statut lisible par nœud', a.ui.lines.every(l => l.split('|')[1].length > 8) && a.ui.lines.some(l => /^sub\|Fabriqué par ta filiale Acier SA · capacité utilisée .* · coût de revient/.test(l)) && a.ui.lines.some(l => /^bought\|Acheté à .* livré/.test(l)) && a.ui.lines.some(l => /^imp\|Importé \(port.*fret/.test(l)) && a.ui.lines.some(l => /^miss\|MANQUANT · installation .*délai/.test(l)) && a.ui.lines.some(l => /^parent\|Fabriqué par la maison mère/.test(l)), a.ui.lines.slice(0, 4).join(' ; '));
  t.check('clavier : flèche bas déplace, flèche gauche replie, flèche droite déplie', a.kb.foc1 === 'node:car/engine' && a.kb.collapsed === 'false' && a.kb.kidsHidden && a.kb.focusKept === 'node:car/engine' && a.kb.reopen === 'true/true', JSON.stringify(a.kb));
  t.check('nœud importé : « Choisir un fournisseur » et « Internaliser » avec comparaison acheter / fabriquer', a.tire.sheet && a.tire.sup && a.tire.inter && /mois/.test(a.tire.cmp || '') && /Acheter/.test(a.tire.txt) && /Fabriquer/.test(a.tire.txt), a.tire.cmp);
  t.check('« Internaliser » propose un plan, « Annuler » ne crée rien', a.tire.plan && a.tire.cancel);
  t.check('nœud manquant : bouton « Construire la filiale manquante »', /Construire la filiale manquante/.test(a.miss.btn || ''), a.miss.btn);
  t.check('plan annoncé avant confirmation (bâtiments, coût total), rien n\'est créé avant', a.miss.confirm && a.miss.total > 0 && a.miss.nothingYet && a.miss.items.some(x => /^chassis:/.test(x)) && /\$/.test(a.miss.totTxt || ''), a.miss.items.join(' ') + ' = ' + a.miss.total);
  t.check('confirmation : filiale créée, bâtiments construits et affectés, vente interne active, prix de cession 100 %', a.built.firms === 2 && a.built.n >= 2 && a.built.isale === 1 && a.built.tpDef === 100 && a.built.prods.indexOf('chassis') >= 0 && a.built.prods.indexOf('paint') >= 0, JSON.stringify(a.built));
  t.check('coût réel ≈ coût annoncé (aux primes de mission et au raccordement routier près)', a.built.spent >= a.miss.total * 0.85 && a.built.spent <= a.miss.total * 1.05, `${a.built.spent} / ${a.miss.total}`);
  t.check('l\'usine cliente se fournit auprès de la nouvelle filiale', /^grp:\d+$/.test(a.built.src || ''), a.built.src);
  t.check('l\'arbre se met à jour : le châssis passe à « Fabriqué par ta filiale », le coût manquant baisse', a.t2.chassis === 'sub' && a.t2.uiSt === 'sub' && /Fabriqué par ta filiale/.test(a.t2.uiLine || '') && a.t2.missCost < a.t1.missCost && a.t2.nMiss < a.t1.nMiss, JSON.stringify(a.t2));
  t.check('après 12 jours : la filiale a produit des châssis, les a cédés au groupe, des voitures sont sorties ; aucune valeur invalide', a.t3.chassis === 'sub' && a.t3.out > 1 && a.t3.cumInt > 1 && a.t3.carCum > 1 && a.t3.bad.length === 0, JSON.stringify(a.t3));
  t.check('« Choisir un fournisseur » ouvre la page de sélection du fournisseur', a.supOpen.sup && a.supOpen.grp && a.supOpen.txt, JSON.stringify(a.supOpen));
  t.check('l\'arbre marche aussi pour un composant (moteurs)', a.comp.kids.indexOf('steel') >= 0 && a.comp.n >= 4, a.comp.kids.join(','));
  t.check('aucune erreur de page (arbre)', p2.errs.length === 0, p2.errs.slice(0, 2).join(' | '));
  await p2.context().close();

  // ---------- 3. Mobile : arbre repliable, pas de débordement horizontal
  const p3 = await L.newPage({ wait: 500, w: 390, h: 800 }); await L.setup(p3, { cash: 5e10 });
  const m = await p3.evaluate(() => {
    const W = window.WSE, gvw = document.getElementById('grpview'); W.grp.open('tree', { pk: 'car' });
    const n0 = gvw.querySelectorAll('.tbtn').length, tg = gvw.querySelector('[data-g="tog:car/engine"]'); tg.click(); const n1 = gvw.querySelectorAll('.tbtn').length;
    gvw.querySelector('[data-g="expand"]').click(); const n2 = gvw.querySelectorAll('.tbtn').length, r = gvw.getBoundingClientRect();
    const minH = Math.min(...[...gvw.querySelectorAll('.tbtn')].map(b => b.getBoundingClientRect().height));
    return { n0, n1, n2, over: gvw.scrollWidth - gvw.clientWidth, w: r.width, vw: innerWidth, minH };
  });
  t.check('mobile : arbre replié par défaut au-delà des composants, dépliable au doigt', m.n0 >= 4 && m.n1 > m.n0 && m.n2 > m.n1, `${m.n0} → ${m.n1} → ${m.n2} nœuds`);
  t.check('mobile : pas de défilement horizontal, cibles tactiles ≥ 34 px', m.over <= 2 && m.w <= m.vw + 1 && m.minH >= 33, JSON.stringify(m));
  t.check('aucune erreur de page (mobile)', p3.errs.length === 0, p3.errs.slice(0, 2).join(' | '));
  await p3.context().close();
};
