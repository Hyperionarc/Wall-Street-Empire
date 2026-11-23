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
  window.__near = (t) => { const W = window.WSE, S = W.S; for (let r = 0; r < 14; r++) for (let y = 23 - r; y <= 37 + r; y++) for (let x = 23 - r; x <= 37 + r; x++) if (Math.max(Math.abs(x - 30), Math.abs(y - 30)) >= 6 + r && !W.footprintError(x, y, t) && W.place(x, y, t)) return S.grid[y * W.N + x]; return null; };
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
    t.check('un petit marché posé se remplit tout seul de vrais produits (≥ 3) et laisse un emplacement libre', real.length >= 3 && a0.slots.some(k => !k), a0.slots.join(','));
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
      W.easyLaunch(f1, 'bread');   // le seul geste : « Pain » dans le catalogue de l'usine
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
    const e = await pg.evaluate(() => { const W = window.WSE, S = W.S; const shops = ['s2', 'spharma', 'smode'].map(t => window.__near(t)).filter(Boolean); for (let d = 0; d < 8; d++) W.step();
      return shops.map(c => { const ks = W.shopUI.keys(c).filter(Boolean), sold = ks.filter(k => (c.sales && c.sales[k]) > 0); return { t: c.t, n: ks.length, real: ks.filter(k => k.indexOf('g_') !== 0).length, sold: sold.length }; }); });
    t.check('(e) aucun îlot : supermarché, pharmacie et boutique de mode posés vendent tout seuls des produits réels', e.length === 3 && e.every(x => x.real >= 2 && x.sold >= x.n - 1), JSON.stringify(e));
    const x = await pg.evaluate(() => { const W = window.WSE, S = W.S, c = window.__near('s1'), N = W.N; const ks = W.shopUI.keys(c); const i = ks.indexOf(null); window.WSE.openBuilding(c.x, c.y);
      W.shopUI.act(c, 'mkput:' + i + ':jeans'); W.step(); W.step(); return { slot: W.shopUI.keys(c)[i], sold: (c.sales && c.sales.jeans) || 0 }; });
    t.check('(d) pas de « famille » : un petit marché peut mettre des jeans en rayon et les vend', x.slot === 'jeans' && x.sold > 0, JSON.stringify(x));
    t.check('(b-e) 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
    await pg.context().close();
  }
  // ---------- (d) tout depuis la fiche
  {
    const pg = await L.newPage({ w: 1280, h: 900, wait: 700 }); await L.inject(pg); await pg.evaluate(START);
    const p = await pg.evaluate(() => { window.__st(10203, 'negociant'); const W = window.WSE, c = window.__near('s2'); W.step(); return { x: c.x, y: c.y }; });
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
    t.check('niveau d\'usine = capacité : une petite usine fabrique des jeans (produit d\'usine moyenne), à débit réduit', fs.jst === 'on' && fs.jOut > 0, JSON.stringify(fs));
    t.check('(d) 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
    await pg.context().close();
  }
};
