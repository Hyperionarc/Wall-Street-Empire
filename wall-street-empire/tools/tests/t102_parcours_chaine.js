// Passe 102 (responsable Chaîne et commerce) : parcours des indicateurs, joués comme un joueur dans une « Ville de 100 000 habitants » (Round, 10 M$).
//  (a) jour 1 : clic sur l'emplacement 3 d'un petit marché → poulet → fournisseur « Import par le port » → le magasin vend du poulet dès le premier jour ;
//      puis le même emplacement relié à une usine (fournisseur « Fabriquer chez toi » puis « Tes usines ») ;
//  (b) blé → pain : ferme de blé + deux petites usines + magasin ; on choisit seulement « Pain » dans une usine : moulin affecté, pain vendu, aucune liaison manuelle ;
//  (c) œufs, poulet, viandes, lait, huile, pain, pâtes : achetables au port dès le jour 0, fabricables sans R&D ; farine : import par le port et moulin (blé) ;
//  (d) dans la fiche d'un commerce : prix nommé, fournisseurs (port, grossiste, tes usines), produits de toute la ville (pas de « famille ») ; usine : production et sources ;
//  (e) aucun îlot : tout commerce posé (marché, supermarché, spécialiste) vend des produits réels approvisionnés tout seuls.
exports.name = 'Parcours chaîne et commerce (indicateurs)';
const START = `window.__st = (seed, caste) => { const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); if (q) { q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true })); }
  W.startMode('round', { start: 'moyenne' }); const S = W.S; S.rs = seed; S.noEv = true; W.setCaste(caste || 'industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); S.mode.w0 = S.cash; return S.cash; };
  window.__near = (t) => { const W = window.WSE, S = W.S; for (let r = 0; r < 14; r++) for (let y = 23 - r; y <= 37 + r; y++) for (let x = 23 - r; x <= 37 + r; x++) if (Math.max(Math.abs(x - 30), Math.abs(y - 30)) >= 6 + r && !W.footprintError(x, y, t) && W.playerPlace(x, y, t)) return S.grid[y * W.N + x]; return null; };   // pose comme au clic (emplacements vides)
  window.__farm = (t) => { const W = window.WSE, S = W.S, N = W.N; for (let i = 0; i < N * N; i++) { const x = i % N, y = (i / N) | 0; if (x < 50 && y < 50) continue; if (!W.footprintError(x, y, t) && W.place(x, y, t)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } } return null; };`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
exports.run = async (t, L) => {
  // ---------- (a) parcours au clic
  {
    const pg = await L.newPage({ w: 1280, h: 900, wait: 700 }); await L.inject(pg); await pg.evaluate(START);
    const a0 = await pg.evaluate(() => { const cash = window.__st(10201, 'industriel'), W = window.WSE, S = W.S, c = window.__near('s1'); window.__c = c;
      return { cash, mat: S.mat, x: c.x, y: c.y, slots: W.shopUI.keys(c).slice(), on: W.PKEYS.filter(k => S.prod[k].st === 'on').length }; });
    t.check('départ « Ville de 100 000 habitants », Round, 10 M$, sans marché mûr', a0.cash === 10e6 && !a0.mat, JSON.stringify({ cash: a0.cash, mat: a0.mat }));
    const real = a0.slots.filter(k => k && k.indexOf('g_') !== 0);
    t.check('un petit marché posé par le joueur a ses emplacements vides (c\'est au joueur de choisir)', a0.slots.length === 4 && a0.slots.every(k => !k), a0.slots.join(','));
    await pg.evaluate(p => window.WSE.openBuilding(p.x, p.y), a0); await sleep(250);
    await pg.click('#bview .shgrid .shs:nth-child(3)'); await sleep(120);
    let has = await pg.evaluate(() => !!document.querySelector('#bview .shpan .shcb[data-act$=":chicken"]'));
    if (!has) { await pg.click('#bview .shpan [data-act="shall"]'); await sleep(120); has = await pg.evaluate(() => !!document.querySelector('#bview .shpan .shcb[data-act$=":chicken"]')); }
    t.check('emplacement 3 sélectionné : « Poulet » proposé directement dans la même fiche', has, '');
    if (has) { await pg.click('#bview .shpan .shcb[data-act$=":chicken"]'); await sleep(150); }
    const portCard = await pg.evaluate(() => { const b = document.querySelector('#bview .shpan .shsc[data-act="sup:chicken:port"]'); return !!b; });
    t.check('après le choix du poulet : cartes fournisseurs au même endroit, dont « Import par le port »', portCard, '');
    if (portCard) { await pg.click('#bview .shpan .shsc[data-act="sup:chicken:port"]'); await sleep(120); }
    const a1 = await pg.evaluate(() => { const W = window.WSE, S = W.S, c = window.__c, d0 = S.day; W.step(); const ps = S.prod.chicken;
      return { slot3: W.shopUI.keys(c)[2], sold: (c.sales && c.sales.chicken) || 0, buy: ps.buy && ps.buy.id, st: ps.st, rnd: ps.rnd || 0, day: S.day - d0, other: Object.keys(c.sales || {}).filter(k => c.sales[k] > 0).length }; });
    t.check('jour 1 : le magasin vend du poulet importé par le port (sans R&D ni usine)', a1.slot3 === 'chicken' && a1.sold > 0 && a1.buy === 'port' && a1.st === 'on' && !a1.rnd, JSON.stringify(a1));
    // même emplacement, fournisseur = tes usines (élevage de poulets + petite usine)
    const a2 = await pg.evaluate(() => { const W = window.WSE, S = W.S, T = window.T; window.__farm('fchicken'); window.__f = T.inP('f1'); return { f: !!window.__f }; });
    await pg.evaluate(p => { window.WSE.closeBuilding && window.WSE.closeBuilding(); window.WSE.openBuilding(p.x, p.y); }, a0); await sleep(200);
    await pg.click('#bview .shgrid .shs:nth-child(3)'); await sleep(120);
    const mk = await pg.evaluate(() => !!document.querySelector('#bview .shpan .shsc[data-act="mkmake:chicken"]'));
    t.check('fournisseur « Fabriquer chez toi » proposé sur l\'emplacement', mk && a2.f, '');
    if (mk) { await pg.click('#bview .shpan .shsc[data-act="mkmake:chicken"]'); await sleep(120); }
    const a3 = await pg.evaluate(() => { const W = window.WSE, S = W.S, c = window.__c, f = window.__f; let out = 0, sold = 0; for (let d = 0; d < 12; d++) { W.step(); if (d >= 6) { out += f.out || 0; sold += (c.sales && c.sales.chicken) || 0; } } return { prod: f.prod, out, sold, buy: S.prod.chicken.buy && S.prod.chicken.buy.id }; });
    t.check('l\'usine reliée fabrique le poulet et le rayon continue de vendre', a3.prod === 'chicken' && a3.out > 0 && a3.sold > 0, JSON.stringify(a3));
    await pg.evaluate(p => { window.WSE.closeBuilding && window.WSE.closeBuilding(); window.WSE.openBuilding(p.x, p.y); }, a0); await sleep(200);
    await pg.click('#bview .shgrid .shs:nth-child(3)'); await sleep(120);
    const own = await pg.evaluate(() => !!document.querySelector('#bview .shpan .shsc[data-act="sup:chicken:make"]'));
    if (own) { await pg.click('#bview .shpan .shsc[data-act="sup:chicken:make"]'); await sleep(120); }
    const a4 = await pg.evaluate(() => { const W = window.WSE, S = W.S, c = window.__c; let sold = 0; for (let d = 0; d < 8; d++) { W.step(); sold += (c.sales && c.sales.chicken) || 0; } return { buy: S.prod.chicken.buy, sold }; });
    t.check('fournisseur « Tes usines » choisi : achat arrêté, le rayon vend ta production', own && !a4.buy && a4.sold > 0, JSON.stringify(a4));
    t.check('(a) 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
    await pg.context().close();
  }
  // ---------- (b), (c), (e)
  {
    const pg = await L.newPage({ wait: 700 }); await L.inject(pg); await pg.evaluate(START);
    const b = await pg.evaluate(() => { window.__st(10202, 'industriel'); const W = window.WSE, S = W.S, T = window.T;
      const farm = T.onDep('fwheat', 'wheat'), f1 = T.inP('f1'), f2 = T.inP('f1'), shop = window.__near('s1');
      W.easyLaunch(f1, 'bread'); W.shopUI.act(shop, 'put:0:bread');   // les deux gestes du joueur : « Pain » dans le catalogue de l'usine, « Pain » sur un emplacement du magasin
      let bo = 0, fo = 0, so = 0, buyU0 = 0;
      for (let d = 0; d < 24; d++) { W.step(); if (d === 13) buyU0 = S.prod.bread.buy ? S.prod.bread.buy.units : 0; if (d >= 14) { bo += f1.out || 0; fo += f2.out || 0; so += (shop.sales && shop.sales.bread) || 0; } }
      const buyU = (S.prod.bread.buy ? S.prod.bread.buy.units : 0) - buyU0;
      return { farm: !!farm && farm.out > 0, f2: f2.prod, bo, fo, so, buyU, shelf: W.shopUI.keys(shop).indexOf('bread') >= 0, src1: f1.src, src2: f2.src };
    });
    t.check('(b) blé → farine : la seconde usine est affectée au moulin toute seule et tourne', b.farm && b.f2 === 'flour' && b.fo > 0, JSON.stringify({ f2: b.f2, fo: Math.round(b.fo) }));
    t.check('(b) farine → pain → magasin : le pain fabriqué est en rayon et se vend, sans liaison manuelle ; l\'achat au réseau ne complète presque rien', b.bo > 0 && b.shelf && b.so > 0 && b.buyU < 0.2 * b.so, JSON.stringify({ bo: Math.round(b.bo), so: Math.round(b.so), buyU: Math.round(b.buyU) }));
    const c = await pg.evaluate(() => { const W = window.WSE, S = W.S, L = ['eggs', 'chicken', 'beefmeat', 'porkmeat', 'lambmeat', 'drinkmilk', 'tableoil', 'bread', 'pasta', 'yogurt', 'cheese'], o = {};
      L.forEach(pk => { const offs = W.mk.offers(pk); o[pk] = { port: offs.some(x => x.kind === 'port'), loc: offs.some(x => x.kind === 'pnj'), free: !!W.PRODUCTS[pk].free, lvl: W.PRODUCTS[pk].lvl }; });
      return { o, flour: !!W.RECIPES.flour && !!W.RECIPES.flour.in.wheat && W.GOODS.flour.grp === 'comp', farms: ['fchicken', 'fcattle', 'fpig', 'fsheep', 'fwheat', 'fcorn', 'frapeseed'].every(k => !!W.TYPES[k]) }; });
    const bad = Object.keys(c.o).filter(k => !(c.o[k].port && c.o[k].loc && c.o[k].free && c.o[k].lvl === 1));
    t.check('(c) œufs, poulet, viandes, lait, huile, pain, pâtes, yaourts, fromages : au port et chez un grossiste dès le jour 1, fabricables sans R&D en petite usine', !bad.length, bad.join(',') || 'tous');
    t.check('(c) farine : moulin (blé) et import par le port ; élevages et cultures disponibles', c.flour && c.farms, '');
    const e = await pg.evaluate(() => { const W = window.WSE, S = W.S; const shops = ['s2', 'spharma', 'smode'].map(t => window.__near(t)).filter(Boolean);
      shops.forEach(c => { const cand = W.shopUI.cands(c).filter(x => x.mk).slice(0, 2); cand.forEach((x, i) => W.shopUI.act(c, 'mkput:' + i + ':' + x.key)); });   // le joueur choisit 2 produits par magasin, rien d'autre
      for (let d = 0; d < 3; d++) W.step();
      return shops.map(c => { const ks = W.shopUI.keys(c).filter(Boolean), sold = ks.filter(k => (c.sales && c.sales[k]) > 0); return { t: c.t, n: ks.length, sold: sold.length }; }); });
    t.check('(e) aucun îlot : un produit choisi dans un supermarché, une pharmacie, une boutique de mode est approvisionné tout seul et se vend', e.length === 3 && e.every(x => x.n === 2 && x.sold === 2), JSON.stringify(e));
    // fournisseurs réels pour chaque classe de marchandise du marché et pour des produits (marque, médicament)
    const g = await pg.evaluate(() => { const W = window.WSE, S = W.S, c = window.__near('s3'), o = {};
      ['basic', 'std', 'lux'].forEach((cl, i) => { W.shopUI.act(c, 'put:' + i + ':g_' + cl); });
      ['basic', 'std', 'lux'].forEach(cl => { W.shopUI.act(c, 'gsup:' + cl + ':co:s0'); });
      W.shopUI.act(c, 'mkput:3:soap'); W.shopUI.act(c, 'sup:soap:loc'); W.shopUI.act(c, 'mkput:4:tshirt'); W.shopUI.act(c, 'sup:tshirt:port');
      for (let d = 0; d < 7; d++) W.step();   // le port livre en 2 jours : le changement de fournisseur peut créer un trou de réassort
      ['basic', 'std', 'lux'].forEach(cl => { o[cl] = { src: c.src && c.src[cl], sold: (c.sales && c.sales['g_' + cl]) || 0 }; });
      ['soap', 'tshirt', 'bread'].forEach(pk => { o[pk] = { src: S.prod[pk].buy && S.prod[pk].buy.id, sold: (c.sales && c.sales[pk]) || 0, n: W.mk.offers(pk).length, riv: W.mk.offers(pk).some(x => x.kind === 'riv') }; });
      return o; });
    t.check('fournisseur autre qu\'automatique pour les biens de base, manufacturés et de luxe : compagnie choisie, le rayon vend', ['basic', 'std', 'lux'].every(k => g[k].src === 'co:s0' && g[k].sold > 0), JSON.stringify({ basic: g.basic, std: g.std, lux: g.lux }));
    t.check('fournisseur choisi pour un savon (grossiste) et un t-shirt (port) : le rayon vend', g.soap.src === 'loc' && g.soap.sold > 0 && g.tshirt.src === 'port' && g.tshirt.sold > 0, JSON.stringify({ s: g.soap, t: g.tshirt }));
    t.check('les sociétés concurrentes figurent parmi les fournisseurs d\'un produit', g.soap.riv || g.tshirt.riv || g.bread.riv, JSON.stringify(g));
    // gamme du jour 1 : biens de 2e et 3e cycle absents du réseau et de la liste d'un emplacement
    const z = await pg.evaluate(() => { const W = window.WSE, S = W.S, c = window.__near('s3'), cands = W.shopUI.cands(c).map(x => x.key), L2 = ['headache', 'antibio', 'cough', 'tv', 'phone', 'jeans', 'handbag', 'watch', 'car', 'washer', 'blender'];
      return { off: L2.filter(pk => S.prod[pk].st !== 'on' && W.mk.offers(pk).length), inList: L2.filter(pk => cands.indexOf(pk) >= 0), basics: ['bread', 'eggs', 'chicken', 'drinkmilk', 'tableoil', 'soap', 'tshirt'].filter(pk => !(W.mk.offers(pk).length || S.prod[pk].st === 'on')) }; });
    t.check('jour 1 : médicaments, électronique, électroménager, mode travaillée, luxe, voitures absents du réseau et de la liste d\'un emplacement ; biens de première nécessité présents', !z.off.length && !z.inList.length && !z.basics.length, JSON.stringify(z));
    const x = await pg.evaluate(() => { const W = window.WSE, S = W.S, c = window.__near('s1'), N = W.N; const ks = W.shopUI.keys(c); const i = ks.indexOf(null); window.WSE.openBuilding(c.x, c.y);
      W.shopUI.act(c, 'mkput:' + i + ':eggs'); W.step(); W.step(); return { slot: W.shopUI.keys(c)[i], sold: (c.sales && c.sales.eggs) || 0 }; });
    t.check('(d) pas de « famille » : une pharmacie peut mettre des œufs en rayon et les vend', x.slot === 'eggs' && x.sold > 0, JSON.stringify(x));
    t.check('(b-e) 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
    await pg.context().close();
  }
  // ---------- (d) tout depuis la fiche
  {
    const pg = await L.newPage({ w: 1280, h: 900, wait: 700 }); await L.inject(pg); await pg.evaluate(START);
    const p = await pg.evaluate(() => { window.__st(10203, 'negociant'); const W = window.WSE, c = window.__near('s2'); W.shopUI.act(c, 'mkput:0:bread'); W.step(); return { x: c.x, y: c.y }; });
    await pg.evaluate(p => window.WSE.openBuilding(p.x, p.y), p); await sleep(250);
    const d = await pg.evaluate(() => { const bv = document.getElementById('bview'), pan = bv.querySelector('.shpan'); return { price: !!pan.querySelector('input[type="range"][data-pk]'), sup: pan.querySelectorAll('.shsc').length, port: !!pan.querySelector('.shsc[data-act$=":port"]'), make: !!pan.querySelector('.shsc[data-act^="mkmake:"], .shsc[data-act$=":make"]'), list: pan.querySelectorAll('.shcb').length, stat: /Ventes/.test(pan.innerText) && /Marge/.test(pan.innerText), clr: !!pan.querySelector('[data-act^="clrstk:"]') }; });
    t.check('(d) fiche magasin : prix nommé, ventes et marge, ≥ 3 fournisseurs (port, grossiste, tes usines), liste de produits, vider le stock', d.price && d.stat && d.sup >= 3 && d.port && d.make && d.list >= 5 && d.clr, JSON.stringify(d));
    const sw = await pg.evaluate(() => { const W = window.WSE, S = W.S, bv = document.getElementById('bview'), b = bv.querySelector('.shpan .shsc[data-act$=":loc"]'); if (!b) return null; const pk = b.dataset.act.split(':')[1]; b.click(); return { pk, id: S.prod[pk].buy && S.prod[pk].buy.id }; });
    t.check('(d) changer de fournisseur depuis l\'emplacement : un clic relie le produit au grossiste', sw && sw.id === 'loc', JSON.stringify(sw));
    // usine : emplacements d'achat (un par intrant) et fournisseurs en cartes dessous, au même endroit ; niveau = débit (une petite usine fait des jeans)
    const f = await pg.evaluate(() => { const W = window.WSE, T = window.T, f = T.inP('f1'); W.easyLaunch(f, 'pasta'); const j = T.inP('f1'); j.prod = 'jeans'; j.src = {}; return { x: f.x, y: f.y, jx: j.x, jy: j.y }; });
    await pg.evaluate(p => { window.WSE.closeBuilding && window.WSE.closeBuilding(); window.WSE.openBuilding(p.x, p.y); }, f); await sleep(250);
    const fb = await pg.evaluate(() => { const bv = document.getElementById('bview'); return { slots: bv.querySelectorAll('.fbuy .shs').length, port: !!bv.querySelector('.fbuy .shsc[data-act="fsrc:flour:port"]') }; });
    if (fb.port) { await pg.click('#bview .fbuy .shsc[data-act="fsrc:flour:port"]'); await sleep(150); }
    const fs = await pg.evaluate(p => { const W = window.WSE, S = W.S, c = S.grid[p.y * W.N + p.x], j = S.grid[p.jy * W.N + p.jx]; W.launchProduct('jeans'); for (let i = 0; i < 30 && S.prod.jeans.st !== 'on'; i++) W.step(); W.step(); W.step(); return { src: c.src && c.src.flour, jOut: j.out || 0, jst: S.prod.jeans.st }; }, f);
    t.check('(d) usine : emplacement d\'achat « Farine » et fournisseur « Import par le port » choisi au même endroit', fb.slots >= 1 && fb.port && fs.src === 'port', JSON.stringify(Object.assign(fb, fs)));
    const bt = await pg.evaluate(p => { const W = window.WSE, S = W.S, T = window.T, f2 = T.inP('f1'); f2.prod = 'bread'; f2.src = {}; window.WSE.closeBuilding && window.WSE.closeBuilding(); window.WSE.openBuilding(p.x, p.y); const b = document.querySelector('#bview .fbuy [data-act="fbatch:flour"]'); if (b) b.click(); return { btn: !!b, src: f2.src && f2.src.flour }; }, f);
    t.check('(d) changement de fournisseur en lot : « même source pour mes autres usines » relie aussi la boulangerie au port', bt.btn && bt.src === 'port', JSON.stringify(bt));
    t.check('niveau d\'usine = capacité : une petite usine fabrique des jeans (produit d\'usine moyenne), à débit réduit', fs.jst === 'on' && fs.jOut > 0, JSON.stringify(fs));
    t.check('(d) 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
    await pg.context().close();
  }
};
// ---------- passe 102 ter : trois départements (Achats → Stock → Vente), ruptures, finances de l'emplacement, notoriété
const run0 = exports.run;
exports.run = async (t, L) => {
  await run0(t, L);
  const scen = async (pre, fix) => {   // un petit marché, œufs + pain + poulet ; pre : dégrade un service ; fix : action du joueur au jour 12
    const pg = await L.newPage({ wait: 700 }); await L.inject(pg); await pg.evaluate(START);
    const r = await pg.evaluate(([pre, fix]) => { window.__st(10204, 'industriel'); const W = window.WSE, S = W.S, c = window.__near('s1');
      ['eggs', 'bread', 'chicken'].forEach((pk, i) => W.shopUI.act(c, 'mkput:' + i + ':' + pk)); new Function('c', 'W', 'S', pre)(c, W, S);
      let r1 = 0, s1 = 0, r2 = 0, s2 = 0; for (let d = 0; d < 26; d++) { if (d === 12) new Function('c', 'W', 'S', fix)(c, W, S); W.step(); const s = (c.sales && c.sales.eggs) || 0, rup = S.prod.eggs.stock < 1 ? 1 : 0; if (d >= 6 && d < 12) { r1 += rup; s1 += s; } if (d >= 20) { r2 += rup; s2 += s; } }
      return { r1, s1: s1 / 6, r2, s2: s2 / 6, aw: c.aw, cov: W.chain.covOf('eggs'), st: S.prod.eggs.stock, se: S.prod.eggs._se, sold: S.prod.eggs.sold }; }, [pre, fix]);
    await pg.context().close(); return r; };
  const base = await scen('', '');
  t.check('équilibre : achats, stock et rayon suffisent, aucune rupture d\'œufs', base.r1 === 0 && base.r2 === 0 && base.s1 > 5, JSON.stringify(base));
  t.check('couverture de stock = stock ÷ ventes potentielles', Math.abs(base.cov.d - base.st / Math.max(base.se, base.sold)) < 1e-6, JSON.stringify(base.cov));
  const preBuy = "c.dept = Object.assign({}, c.dept || {}); c.dept.buy = 0; S.prod.eggs._se = 1e-9; c.pk = { eggs: 0.6 };";   // service Achats vidé + prix des œufs baissé (pic de demande)
  const buyFix = await scen(preBuy, "c.train = c.train || {}; c.train.buy = 3;");
  const buyWrong = await scen(preBuy, "c.train = c.train || {}; c.train.stock = 3;");
  t.check('goulot Achats : ruptures mesurables ; former les Achats les fait disparaître', buyFix.r1 >= 2 && buyFix.r2 === 0 && buyFix.s2 > buyFix.s1, JSON.stringify(buyFix));
  t.check('goulot Achats : former le Stock ne corrige pas la rupture', buyWrong.r2 >= 2, JSON.stringify(buyWrong));
  const preSell = "c.dept = Object.assign({}, c.dept || {}); c.dept.sell = 0; c.dept.stock = 1;";
  const sellFix = await scen(preSell, "c.train = c.train || {}; c.train.sell = 3;");
  const sellWrong = await scen(preSell, "c.train = c.train || {}; c.train.buy = 3;");
  t.check('goulot Vente (rayon) : former la Vente augmente les ventes ; former les Achats non', sellFix.s2 > 1.1 * sellFix.s1 && sellWrong.s2 < 1.05 * sellWrong.s1, JSON.stringify({ sellFix, sellWrong }));
  // finances et notoriété
  const pg = await L.newPage({ w: 1280, h: 800, wait: 700 }); await L.inject(pg); await pg.evaluate(START);
  const f = await pg.evaluate(() => { window.__st(10205, 'industriel'); const W = window.WSE, S = W.S, c = window.__near('s1'), c2 = window.__near('s1');
    W.shopUI.act(c, 'mkput:0:eggs'); W.shopUI.act(c2, 'mkput:0:bread'); const aw0 = c.aw || 0; for (let d = 0; d < 40; d++) W.step(); const aw1 = c.aw;
    const it = { name: 'Œufs', price: W.prodPrice('eggs'), stock: S.prod.eggs.stock, gen: false }, E = W.chain.slotEcon(c, 'eggs', it);
    c2.adx = { bread: { m: 'media', b: 4000 } }; const a2 = W.chain.adTarget(c2); c2.adx = null; const a20 = W.chain.adTarget(c2);
    c._av = 0.3; const lowAv = W.chain.adTarget(c); c._av = 1; const hiAv = W.chain.adTarget(c);
    W.openBuilding(c.x, c.y); const bv = document.getElementById('bview'); return { aw0, aw1, a2, a20, lowAv, hiAv, band: bv.querySelectorAll('.dband .dblk').length, fin: /BFR/.test(bv.textContent) && /Couverture de stock/.test(bv.textContent), mg: /Marge commerciale/.test(bv.textContent), bfr: S.prod.eggs.stock * E.cost, E }; });
  t.check('notoriété du magasin : monte avec les ventes, sans publicité', f.aw1 > f.aw0 + 3, `${f.aw0.toFixed(1)} → ${f.aw1.toFixed(1)}`);
  t.check('notoriété : la publicité par produit l\'augmente ; les ruptures (disponibilité faible) la font baisser', f.a2 > f.a20 && f.lowAv < f.hiAv, JSON.stringify({ a2: f.a2, a20: f.a20, lowAv: f.lowAv, hiAv: f.hiAv }));
  t.check('fiche : bandeau Achats / Stock / Vente, finances de l\'emplacement (marge commerciale, couverture, BFR)', f.band === 3 && f.fin && f.mg && f.bfr > 0, JSON.stringify({ band: f.band, fin: f.fin, mg: f.mg, bfr: f.bfr }));
  t.check('0 erreur de page (départements, finances, notoriété)', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
  await pg.context().close();
};
