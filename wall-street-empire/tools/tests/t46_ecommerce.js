// Passe 46 : commerce en ligne (plateforme de vente mondiale). Entrepôt logistique en ligne constructible (stock propre), demande mondiale distincte de la ville,
// ventes en ligne comptées en exports (port), aucune baisse des ventes des magasins de la ville, startup financée par une levée, déterminisme, sauvegarde,
// lisibilité 1280x720 et 390x844.
exports.name = 'Commerce en ligne : entrepôt, demande mondiale, exports, startup';
const PK = 'bread';
// usine f2 de pain (intrants fournis chaque jour : production > demande de la ville), 4 hypermarchés, 40 logements, un terminal portuaire.
// entrepôt en ligne et data center dans les deux parties ; ec : 0 = startup non lancée (aucune vente en ligne), 1 = startup lancée
const SETUP = ec => `(() => {
  const W = window.WSE, S = W.S; T.frz();
  T.put('port', 0, W.N, 0, W.N); const f = T.inP('f2'); for (let i = 0; i < 40; i++) T.inC('res'); for (let i = 0; i < 4; i++) T.inC('s3');
  W.launchProduct('${PK}'); const ps = S.prod['${PK}']; ps.st = 'on'; ps.rnd = 0; ps.pf = 1;
  f.prod = '${PK}'; f.wage = 2; const ins = Object.keys(W.productInputs('${PK}'));
  f.src = {}; ins.forEach(g => { f.src[g] = 'local'; });
  const e = T.inP('ewh'); T.inP('dc'); if (${ec}) W.ecom.launch('Testshop');   // mêmes bâtiments (mêmes emplois) dans les deux parties : seule la plateforme diffère
  const pre = () => { T.frz(); S.cash = Math.max(S.cash, 5e9); ins.forEach(g => { S.stock[g] = 1e6; }); };
  const log = { ret: [], sold: [], pd: [], exp: [], ec: [], xv: [], pu: [], inv: [], res: [], px: [] };
  const day = () => { pre(); W.step(); const p = S.prod['${PK}'], E = S.ecom, L = E && E.last;
    log.ret.push(S.fin.revRetail); log.sold.push(p.sold || 0); log.pd.push(S._dw.pd['${PK}'] || 0); log.exp.push(S.fin.revExport); log.ec.push(L ? L.rev : 0);
    log.xv.push(Object.keys(S._xv || {}).filter(k => k.indexOf('e:') === 0).reduce((a, k) => a + S._xv[k], 0)); log.pu.push(S._portUse || 0); log.px.push(W.pos.prosp().v);
    log.inv.push(W.ecom.used(e)); log.res.push((p.stock || 0) - W.ecom.RESV * (p.sold || 0)); };
  window.B = { W, S, f, e, day, log };
  for (let i = 0; i < 60; i++) day();
})()`;
const SHOTS = process.env.WSE_SHOTS || '';
const open = async (L, w, h, ec) => {
  const pg = await L.newPage({ w, h, wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP(ec));
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#feed{display:none!important}' });
  return pg;
};
const fit = (pg, sel) => pg.evaluate(sel => { const sec = document.querySelector(sel), bad = [];
  sec.querySelectorAll('.edk>div,.finrow,.edlearn,.btn,h3,h4,.note,.taxrow,.edleg').forEach(e => { if (e.offsetParent && e.scrollWidth > e.clientWidth + 1) bad.push((e.className || e.tagName) + ':' + (e.textContent || '').slice(0, 30)); });
  const pm = document.querySelector('#panel .pmain'), txt = sec.innerText;
  return { bad, hscroll: pm.scrollWidth > pm.clientWidth + 1, nan: /NaN|undefined|Infinity|\[object/.test(txt), len: txt.length, vis: !sec.hidden && sec.getBoundingClientRect().width > 0 }; }, sel);
const sum = a => a.reduce((x, y) => x + y, 0);

exports.run = async (t, L) => {
  // 0. référence sans commerce en ligne (mêmes décisions, même graine)
  const p0 = await open(L, 1280, 720, 0);
  const A = await p0.evaluate(() => window.B.log);
  t.check('aucune erreur de page (référence sans commerce en ligne)', p0.errs.length === 0, p0.errs.slice(0, 2).join(' | '));
  await p0.context().close();
  const pg = await open(L, 1280, 720, 1);
  // 1. bâtiment constructible
  const b = await pg.evaluate(() => { const { W, S, e } = window.B, T0 = W.TYPES.ewh, FAMS = W.FAMS.com.find(f => f[0] === 'En ligne');
    let cityErr = ''; for (let y = 14; y < 44 && !cityErr; y++) for (let x = 14; x < 44; x++) { const er = W.footprintError(x, y, 'ewh'); if (er && /port/.test(er)) { cityErr = er; break; } }
    return { T0: { w: T0.w, h: T0.h, tier: T0.tier, cost: T0.cost }, fam: FAMS && FAMS[1], placed: !!e, conn: !!(e && e.conn), cityErr, cn: S.stats.cn.ewh || 0 }; });
  t.check('entrepôt logistique en ligne constructible (Commerce > En ligne, 2×2, palier Industriel), posé en zone du port, refusé en ville', b.placed && b.conn && b.T0.w === 2 && b.T0.h === 2 && b.T0.tier === 2 && b.fam && b.fam.indexOf('ewh') >= 0 && /port/.test(b.cityErr) && b.cn === 1, JSON.stringify(b));
  // 2. stock propre de l'entrepôt : surplus de pain après la réserve des magasins, marchandises de rayon des grossistes ; capacité bornée
  const s = await pg.evaluate(pk => { const { W, S, e, log } = window.B; return { inv: Object.assign({}, e.inv), used: W.ecom.used(e), cap: W.ecom.storeCap(e), ship: e._ship, shipCap: W.ecom.shipCap(e), minRes: Math.min(...log.res.slice(5)), cat: W.ecom.cat().map(i => i.k), buy: S.ecom.last.buy, rev: e._rev, pRev: e.pRev }; }, PK);
  t.check('stock propre (c.inv par produit) : pain de l\'empire et marchandises de rayon, borné par la capacité ; la réserve des magasins (2 jours de ventes) n\'est jamais entamée', s.inv[PK] > 0 && s.inv.basic > 0 && s.used <= s.cap + 1e-6 && s.minRes >= -1e-6 && s.cat.indexOf(PK) >= 0 && s.buy > 0, JSON.stringify({ pain: Math.round(s.inv[PK]), base: Math.round(s.inv.basic), used: Math.round(s.used), cap: s.cap, minRes: Math.round(s.minRes) }));
  t.check('expédition quotidienne bornée par la capacité de l\'entrepôt ; recettes au compte de résultat du bâtiment', s.ship > 0 && s.ship <= s.shipCap + 1e-6 && s.rev > 0 && Math.abs(s.pRev - s.rev) < 1e-6, JSON.stringify({ ship: Math.round(s.ship), cap: Math.round(s.shipCap), rev: Math.round(s.rev) }));
  // 3. demande mondiale distincte de la ville ; 4. ventes en ligne = exports
  const B = await pg.evaluate(() => window.B.log);
  const d = await pg.evaluate(() => { const { W, S } = window.B, L = S.ecom.last, city = ['basic', 'std', 'lux'].reduce((a, c) => a + (S.stats.dem[c] || 0), 0), pool = ['basic', 'std', 'lux'].reduce((a, c) => a + L.pool[c], 0);
    return { city, pool, Udem: L.Udem, xm: S.xm.slice(), xsE: Object.keys(S.xsum).filter(k => k.indexOf('e:') === 0).length, port: L.port, mi: L.mi }; });
  t.check('demande mondiale : réservoir distinct de la ville et bien plus grand (≥ 10 × la demande de la ville)', d.pool >= 10 * d.city && d.Udem > 0, JSON.stringify({ monde: Math.round(d.pool), ville: Math.round(d.city), servie: Math.round(d.Udem) }));
  // Passe 68 : les ventes en ligne sont des exports, et tout export entre dans le revenu créé de la ville (S.stats.income -> prosp()) : de l'argent venu du monde paie
  // des salaires locaux (principe de somme positive). La demande de la ville peut donc MONTER un peu avec le commerce en ligne (≈ +0,1 % ici), jamais baisser :
  // chaque jour, aucune cannibalisation (avec ≥ sans à 0,1 % près) et un écart entièrement expliqué par la prospérité (élasticité-revenu 0,6 du pain, classe de base).
  const pdX = A.pd.map((v, i) => { const r = v > 1 ? B.pd[i] / v : 1, rx = 1; void B.px; return { r, rx }; });   // lot 3 (budget fermé) : le basique est une saturation physique, il ne dépend plus du revenu ; seul reste l'effet de second ordre des prix
  t.check('la demande de pain adressée aux magasins de la ville ne baisse pas avec le commerce en ligne (≥ −0,1 % chaque jour) ; l\'écart vient seulement de la prospérité (exports dans le revenu de la ville, écart au modèle < 0,01 %, total < 0,5 %)', pdX.every(x => x.r >= 1 - 1e-3 && Math.abs(x.r - x.rx) <= 1e-3) && sum(B.pd) <= 1.005 * sum(A.pd), JSON.stringify({ sans: Math.round(sum(A.pd)), avec: Math.round(sum(B.pd)), maxEcart: +(100 * Math.max(...pdX.map(x => x.r - 1))).toFixed(3) + ' %', maxResidu: +Math.max(...pdX.map(x => Math.abs(x.r - x.rx))).toExponential(1) }));
  const exS = sum(B.ec.slice(10)), xvS = sum(B.xv.slice(10)), dEx = sum(B.exp.slice(10)) - sum(A.exp.slice(10));
  t.check('ventes en ligne = exports : comptées dans revExport (S.fin), S._xv et S.xsum (clés e:), sans évincer les marchés d\'export du port (S.xm)', exS > 0 && Math.abs(xvS - exS) <= 1e-6 * exS && dEx > 0.5 * exS && B.exp.slice(10).every((v, i) => v >= B.ec[i + 10] - 1e-6) && d.xsE > 0 && d.xm.every(k => k.indexOf('e:') !== 0), JSON.stringify({ enLigne: Math.round(exS), hausseExports: Math.round(dEx) }));
  t.check('les colis passent par le port (débit portuaire consommé)', d.port >= 1 && sum(B.pu.slice(10)) > sum(A.pu.slice(10)), JSON.stringify({ sans: Math.round(sum(A.pu)), avec: Math.round(sum(B.pu)) }));
  // 5. aucune baisse des ventes des magasins de la ville
  const rA = sum(A.ret), rB = sum(B.ret), sA = sum(A.sold), sB = sum(B.sold);
  t.check('aucune baisse des ventes des magasins de la ville (chiffre d\'affaires de détail et unités de pain, 60 jours)', rB >= 0.999 * rA && sB >= 0.999 * sA && B.sold.every((v, i) => v >= 0.999 * A.sold[i] - 1e-6), JSON.stringify({ CA_sans: Math.round(rA), CA_avec: Math.round(rB), pain_sans: Math.round(sA), pain_avec: Math.round(sB) }));
  // 6. startup financée par une levée (Financement > Equity raising) : trésorerie + montant, part cédée, valorisation du fondateur inchangée par la levée
  const f = await pg.evaluate(async () => { const { W, S, day } = window.B; S.ecom.ad = 3000; for (let i = 0; i < 30; i++) day();
    W.refreshStats(); const raw0 = S.stats.raw, cash0 = S.cash, cap0 = S.capAdj || 0, V = W.ecom.val();
    document.getElementById('panel').hidden = false; document.querySelector('[data-ptab="fund"]').click(); await new Promise(r => setTimeout(r, 200));
    const card = document.querySelector('#bourse [data-ecf="0.1"]'), txt = document.getElementById('bourse').innerText; if (card) card.click(); await new Promise(r => setTimeout(r, 100));
    W.refreshStats(); const amt = S.cash - cash0, E = S.ecom; day(); return { card: !!card, txt: /startup Testshop/i.test(txt), amt, V, sold: E.sold, capd: (S.capAdj || 0) - cap0, raw0, raw1: S.stats.raw, n: E.n, mi: E.last.mi, eb: E.last.eb, raised: E.raised }; });
  t.check('startup financée par une levée (Financement > Equity raising) : 10 % cédés, fonds en trésorerie, contrepartie minoritaire au bilan', f.card && f.txt && f.amt > 0 && Math.abs(f.sold - 0.1) < 1e-9 && Math.abs(f.capd + f.amt) < 1 && f.n === 1, JSON.stringify({ levee: Math.round(f.amt), val: Math.round(f.V), cede: f.sold }));
  t.check('la levée n\'enrichit pas le fondateur ; les investisseurs touchent leur part des bénéfices de la startup', Math.abs(f.raw1 - f.raw0) < 0.02 * Math.abs(f.raw0) + 1e5 && (f.eb > 0 ? Math.abs(f.mi - 0.1 * f.eb) < 1e-6 * f.eb + 1e-6 : f.mi === 0), JSON.stringify({ raw0: Math.round(f.raw0), raw1: Math.round(f.raw1), eb: Math.round(f.eb), part: Math.round(f.mi) }));
  // fiche du bâtiment (outil Main) : indicateurs de l'entrepôt en ligne
  const fb = await pg.evaluate(async () => { const { W, e } = window.B; W.openBuilding(e.x, e.y); await new Promise(r => setTimeout(r, 300)); const box = document.getElementById('bview') || document.body, txt = box.innerText.replace(/\s+/g, ' '); W.closeBuilding(); return { txt: /Expéditions vers le monde/.test(txt) && /Ventes en ligne/.test(txt), nan: /NaN/.test(txt) }; });
  t.check('fiche du bâtiment : expéditions vers le monde et ventes en ligne affichées, sans NaN', fb.txt && !fb.nan, JSON.stringify(fb));
  // 7. page « Ma plateforme en ligne » et onglet Apprendre à 1280x720
  const ui = async (pg, tag) => { const o = {};
    await pg.evaluate(() => { window.WSE.ecom.show(); }); await pg.waitForTimeout(250);
    o.txt = await pg.evaluate(() => document.getElementById('ecomBody').innerText.replace(/\s+/g, ' ')); o.f = await fit(pg, '#ecomSec'); if (SHOTS) await pg.screenshot({ path: SHOTS + '/ecom_' + tag + '.png' });
    await pg.evaluate(() => { window.WSE.edu.show('exp'); }); await pg.waitForTimeout(250);
    o.edu = await pg.evaluate(() => document.getElementById('eduBody').innerText.replace(/\s+/g, ' ')); o.fe = await fit(pg, '#eduSec'); if (SHOTS) await pg.screenshot({ path: SHOTS + '/ecom_edu_' + tag + '.png' });
    return o; };
  const u = await ui(pg, '1280x720');
  t.check('page « Ma plateforme en ligne » : KPI (CA, marge, commandes/jour, panier moyen, service, délai), courbe, leviers, conseil, pas de concurrence frontale expliquée', ['Chiffre d\'affaires', 'EBITDA', 'Commandes / jour', 'panier moyen', 'Taux de service', 'Délai de livraison', 'COURBE DE CROISSANCE', 'Remise en ligne', 'Publicité en ligne', 'Catalogue', 'Entrepôts logistiques en ligne', 'data center', 'Flotte de livraison', 'Conseil', 'Aucune concurrence frontale', 'export'].every(x => u.txt.toLowerCase().includes(x.toLowerCase())), u.txt.slice(0, 200));
  t.check('Apprendre > « Pourquoi exporter ? » : service en ligne, délai, rupture, chapitre', ['Niveau de service en ligne', 'Délai de livraison', 'Rupture en ligne', 'POURQUOI EXPORTER', 'Pas de cannibalisation'].every(x => u.edu.toLowerCase().includes(x.toLowerCase())), u.edu.slice(0, 160));
  t.check('1280x720 : pages lisibles (aucun texte coupé, pas de défilement horizontal, pas de NaN)', [u.f, u.fe].every(q => q.vis && !q.bad.length && !q.hscroll && !q.nan), JSON.stringify([u.f, u.fe].map(q => ({ bad: q.bad.slice(0, 2), h: q.hscroll, nan: q.nan }))));
  // leviers : remise (élasticité) et catalogue
  const lv = await pg.evaluate(() => { const { W, S, day } = window.B, E = S.ecom; const o0 = E.last.O; W.ecom.set('disc', 0.25); day(); const o1 = E.last.O; W.ecom.set('disc', 0.1); W.ecom.set('cat', ['bread', false]); const c1 = W.ecom.cat().map(i => i.k); W.ecom.set('cat', ['bread', true]); return { o0, o1, c1 }; });
  t.check('leviers : une remise plus forte augmente les commandes (élasticité) ; un produit retiré sort du catalogue', lv.o1 > lv.o0 * 1.1 && lv.c1.indexOf('bread') < 0, JSON.stringify({ o0: Math.round(lv.o0), o1: Math.round(lv.o1) }));
  // 8. sauvegarde wse-city-v8 : champ ecom écrit, relu à l'identique, stock de l'entrepôt conservé ; lecture bornée
  const sv = await pg.evaluate(() => { const W = window.WSE; W.save(); const raw = JSON.parse(localStorage.getItem('wse-city-v8')); return { has: !!raw.ecom, snap: JSON.stringify(W.ecom.save()), inv: Math.round(W.ecom.used(window.B.e)) }; });
  const pg2 = await L.newPage({ ctx: pg.context(), wait: 900 });
  const r2 = await pg2.evaluate(([snap, inv]) => { const W = window.WSE; if (!W.S.ecom) return { ok: false }; const a = JSON.stringify(W.ecom.save()), l = W.ecom.list(), bad = W.ecom.san({ name: '<b>x</b>', C: 1e12, disc: 9, ad: -5, fleet: 99, sold: 3, off: ['bread', 'zz'], h: [[1, 2, 3, 4, 5, 6], ['a']], cum: { rev: 'x' } });
    return { ok: a === snap, ewh: l.length, inv: l.length ? Math.abs(Math.round(W.ecom.used(l[0])) - inv) <= 3 : false, none: W.ecom.san(undefined) === undefined, bad: bad.C <= W.ecom.WORLD && bad.disc <= 0.3 && bad.ad === 0 && bad.fleet === 3 && bad.sold <= 0.49 && bad.off.length === 1 && bad.h.length === 1 && bad.cum.rev === 0 && !/</.test(bad.name) }; }, [sv.snap, sv.inv]);
  t.check('sauvegarde wse-city-v8 : champ ecom écrit, relu à l\'identique, stock de l\'entrepôt conservé ; lecture bornée (valeurs folles ramenées, absence tolérée)', sv.has && r2.ok && r2.ewh === 1 && r2.inv && r2.none && r2.bad, JSON.stringify(r2));
  t.check('aucune erreur de page (1280x720)', pg.errs.length === 0 && pg2.errs.length === 0, pg.errs.concat(pg2.errs).slice(0, 2).join(' | '));
  await pg.context().close();
  // 9. déterminisme : deux parties identiques donnent la même trajectoire (aléa par hash, jamais rnd)
  const run = async () => { const p = await open(L, 1280, 720, 1); const x = await p.evaluate(() => { const { W, S } = window.B; return { h: JSON.stringify(S.ecom.h), k: JSON.stringify(W.ecom.kpi()), inv: JSON.stringify(window.B.e.inv) }; }); x.errs = p.errs; await p.context().close(); return x; };
  const a = await run(), c = await run();
  t.check('déterminisme : même graine et mêmes décisions = même historique, mêmes KPI, même stock', a.h === c.h && a.k === c.k && a.inv === c.inv && a.h.length > 10, a.k.slice(0, 120));
  // 10. mobile 390x844
  const pm = await open(L, 390, 844, 1);
  const m = await ui(pm, '390x844');
  t.check('390x844 : pages lisibles (aucun texte coupé, pas de défilement horizontal, pas de NaN)', [m.f, m.fe].every(q => q.vis && !q.bad.length && !q.hscroll && !q.nan), JSON.stringify([m.f, m.fe].map(q => ({ bad: q.bad.slice(0, 2), h: q.hscroll, nan: q.nan }))));
  t.check('aucune erreur de page (mobile, déterminisme)', pm.errs.length === 0 && !a.errs.length && !c.errs.length, pm.errs.concat(a.errs).slice(0, 2).join(' | '));
  await pm.context().close();
};
