// Bureau de l'usine (lot 1 « ce que tu vois est vrai ») : clic sur le bureau vitré de la vue Dessus = carnet de commandes ;
// demande, offre, écart, ventes, export et marge perdue lus dans la simulation du jour ; plus de satisfaction ni de mini-carte inventées ; lisible en 1280x720 et 1920x1080.
exports.name = 'Bureau de l\'usine : carnet de commandes';
const PK = 'bread';
const SETUP = `(() => {
  const W = window.WSE, S = W.S; T.frz();
  const f = T.inP('f2'); T.inP('port'); for (let i = 0; i < 40; i++) T.inC('res'); T.inC('s1'); T.inC('s1'); T.inC('s2');
  W.launchProduct('${PK}'); const ps = S.prod['${PK}']; ps.st = 'on'; ps.rnd = 0; ps.pf = 1;
  f.prod = '${PK}'; f.wage = 2; const ins = Object.keys(W.productInputs('${PK}'));
  const pre = () => { T.frz(); S.cash = Math.max(S.cash, 5e9); ins.forEach(g => { S.stock[g] = 1e6; }); };
  window.B = { W, S, f, pre, ins };
  for (let i = 0; i < 20; i++) { pre(); W.step(); }
})()`;
const SHOTS = process.env.WSE_SHOTS || '';
const open = async (L, w, h) => {
  const pg = await L.newPage({ w, h, wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr{display:none!important}' });
  await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 900)); });
  return pg;
};
// clic réel sur le bureau vitré (centre du local FG.off), puis lecture du panneau
const clickOffice = async pg => {
  const xy = await pg.evaluate(() => { const { W } = window.B, sc = W.scene, o = W.fac.FG.off, sr = document.getElementById('bsw').getBoundingClientRect(), p = sc.M((o[0] + o[2]) / 2, (o[1] + o[3]) / 2 + 0.6, 0); return [sr.left + p[0], sr.top + p[1]]; });
  await pg.mouse.move(xy[0], xy[1]); await pg.waitForTimeout(150); await pg.mouse.click(xy[0], xy[1]); await pg.waitForTimeout(350);
  return pg.evaluate(() => ({ panel: window.WSE.imm.panel, txt: (document.getElementById('bpop').textContent || '').replace(/\s+/g, ' '), vis: !document.getElementById('bpop').hidden }));
};
// texte coupé : un élément du panneau plus large que sa boîte, ou panneau hors de l'écran ; cartes du canevas hors de la zone visible
const fit = pg => pg.evaluate(() => { const p = document.getElementById('bpop'), r = p.getBoundingClientRect(), bad = [];
  p.querySelectorAll('.finrow,.cbr,.cbg,.cbc,.cbt,h5,.bph').forEach(e => { if (e.scrollWidth > e.clientWidth + 1) bad.push(e.className || e.tagName); });
  const sc = window.WSE.scene, cr = (sc.cardRects || []).filter(q => q[0] < -1 || q[1] < -1 || q[2] > sc.ovW + 1 || q[3] > sc.ovH + 1).length, vb = document.getElementById('bvit').getBoundingClientRect(), o = document.getElementById('bsw').getBoundingClientRect(), v = [vb.left - o.left, vb.top - o.top, vb.right - o.left, vb.bottom - o.top];
  const under = (sc.cardRects || []).filter(q => vb.width && q[0] < v[2] && q[2] > v[0] && q[1] < v[3] && q[3] > v[1]).length;
  return { inView: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5, w: Math.round(r.width), h: Math.round(r.height), bad, cardsOut: cr + under, cards: (sc.cardRects || []).length }; });

exports.run = async (t, L) => {
  let pg = await open(L, 1280, 720);
  // 1. le bureau est cliquable et ouvre le carnet
  const o = await clickOffice(pg);
  t.check('clic sur le BUREAU de la vue Dessus : le panneau « Carnet de commandes » s\'ouvre', o.panel === 'carnet' && o.vis && /Carnet de commandes/.test(o.txt) && /Demande/.test(o.txt) && /Écart/.test(o.txt) && /Conseil/.test(o.txt), `${o.panel} · ${o.txt.slice(0, 160)}`);
  // 2. cohérence avec la simulation
  const k = await pg.evaluate(pk => { const { W, S, f } = window.B, B = W.fac.book(f), ps = S.prod[pk], dc = S._dw.cls[W.PRODUCTS[pk].cls]; let tot = 0; W.S.grid.forEach((c, i) => { if (c && c.prod === pk && W.FLEVEL[c.t] && c.x + c.y * W.N === i) tot += c.out || 0; });
    const txt = document.getElementById('bpop').textContent.replace(/\s+/g, ' ');
    return { dem: B.dem, pd: S._dw.pd[pk], prodTot: B.prodTot, tot, mine: B.mine, out: f.out, sold: B.sold, psSold: ps.sold, gap: B.gap, st: B.st, riv: B.riv, rivX: dc.Dc * dc.rivShare, stock: B.stock, psStock: ps.stock, exp: B.exp, psExp: ps.exp || 0, price: B.price, px: W.prodPrice(pk), txt }; }, PK);
  const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
  t.check('demande = demande adressée au produit par la vente en magasin (S._dw.pd) ; offre = production réelle des usines', k.dem > 0 && near(k.dem, k.pd) && near(k.prodTot, k.tot) && near(k.mine, k.out) && k.prodTot > 0, JSON.stringify({ dem: +k.dem.toFixed(2), prod: +k.prodTot.toFixed(2), mine: +k.mine.toFixed(2) }));
  t.check('écart = offre − demande ; ventes, stock, export et prix = valeurs de la simulation ; rivaux = part de la catégorie', near(k.gap, k.prodTot - k.dem) && near(k.sold, k.psSold) && near(k.stock, k.psStock) && near(k.exp, k.psExp) && near(k.price, k.px) && near(k.riv, k.rivX), JSON.stringify({ gap: +k.gap.toFixed(2), st: k.st, sold: +k.sold.toFixed(2), exp: +k.exp.toFixed(2), riv: +k.riv.toFixed(1) }));
  const msgOk = k.st === 'short' ? /Tu manques de/.test(k.txt) : k.st === 'over' ? /Surproduction/.test(k.txt) : /équilibrées/.test(k.txt);
  t.check('le message de l\'écart suit son signe (manque / surproduction / équilibre)', msgOk, k.st + ' · ' + (k.txt.match(/Écart[^A-Z]*[^.]{0,60}/) || [''])[0]);
  // 3. surproduction : le surplus part à l'export, la marge perdue est chiffrée à partir de la recette réelle de l'export
  const x = await pg.evaluate(pk => { const { W, S, f, pre } = window.B, ps = S.prod[pk]; ps.stock = 2e5; pre(); W.step(); const B = W.fac.book(f); W.fac.openBook(); const txt = document.getElementById('bpop').textContent.replace(/\s+/g, ' ');
    return { exp: B.exp, psExp: ps.exp, loss: B.xLoss, lossX: ps.exp * W.prodPrice(pk) - S._xv[pk], st: B.st, gap: B.gap, txt }; }, PK);
  t.check('surproduction : export réel (ps.exp) et marge perdue = valeur au prix intérieur − recette de l\'export (S._xv), affichés dans le carnet', x.exp > 0 && Math.abs(x.exp - x.psExp) < 1e-6 && x.loss > 0 && Math.abs(x.loss - x.lossX) < 1e-6 * Math.max(1, x.lossX) && /Marge perdue à l'export/.test(x.txt) && /part à l'export avec une marge réduite|Surproduction|Tu manques/.test(x.txt), JSON.stringify({ exp: +x.exp.toFixed(1), loss: +x.loss.toFixed(0), st: x.st }));
  // 4. plus de chiffres inventés dans la vue Dessus
  const v = await pg.evaluate(() => { const { W, f } = window.B, I = W.fac.info(W.scene, f), kp = (document.getElementById('bvit').textContent || '').replace(/\s+/g, ' ');
    return { kp, sat: 'sat' in I, cyc: 'cyc' in I, lvl: I.lvl, fill: I.book.fill }; });
  t.check('cartes de la vue Dessus : ni satisfaction client ni temps de cycle inventés ; la réserve affichée = stock réel du produit', !v.sat && !v.cyc && !/satisfaction|cycle/i.test(v.kp) && /Ventes \/ demande/.test(v.kp) && Math.abs(v.lvl - v.fill) < 1e-9, v.kp.slice(0, 140));
  // 5. aucune valeur ne dépend de la position (hash) : deux usines identiques du même produit lisent le même marché
  const hz = await pg.evaluate(pk => { const { W, S, f, pre } = window.B, g = T.inP('f2'); g.prod = pk; g.wage = 2; for (let i = 0; i < 3; i++) { pre(); W.step(); } const a = W.fac.book(f), b = W.fac.book(g); return { a: [a.dem, a.prodTot, a.sold, a.riv, a.gap], b: [b.dem, b.prodTot, b.sold, b.riv, b.gap], n: a.nFac }; }, PK);
  t.check('deux usines du même produit à des coordonnées différentes lisent les mêmes demande, offre, ventes et écart (aucun hash)', hz.n >= 2 && hz.a.every((q, i) => q === hz.b[i]), JSON.stringify(hz));
  // 6. composant (acier) : demande = usines clientes + part du marché local, offre des producteurs locaux
  const cp = await pg.evaluate(() => { const { W, S, pre } = window.B, c = T.inP('f2'); W.assignRecipe('steel', 1); let s = null; S.grid.forEach(q => { if (q && q.prod === 'steel' && W.FLEVEL[q.t]) s = q; }); if (!s) return null; s.src = { iron: 'local', coal: 'local' }; ['iron', 'coal'].forEach(g => { S.stock[g] = 1e6; }); for (let i = 0; i < 4; i++) { pre(); ['iron', 'coal'].forEach(g => { S.stock[g] = 1e6; }); W.step(); } const B = W.fac.book(s), lm = S._lm && S._lm.steel; void c;
    return { dem: B.dem, exp: lm ? B.inNeed + lm.D * lm.sh : B.inNeed, riv: B.riv, rivX: lm ? lm.npc : 0, isP: B.isP, ok: [B.dem, B.prodTot, B.sold, B.stock, B.days === Infinity ? 0 : B.days].every(Number.isFinite) }; });
  t.check('composant (acier) : demande = besoins des usines clientes + part du marché local (S._lm), rivaux = producteurs locaux et import', cp && !cp.isP && cp.ok && Math.abs(cp.dem - cp.exp) < 1e-6 * Math.max(1, cp.exp) && Math.abs(cp.riv - cp.rivX) < 1e-6 * Math.max(1, cp.rivX), JSON.stringify(cp));
  // 7. lisibilité 1280x720 (carnet ouvert après un clic réel)
  await pg.evaluate(() => { const { W, f } = window.B; W.closeBuilding(); W.openBuilding(f.x, f.y); }); await pg.waitForTimeout(800);
  const o2 = await clickOffice(pg), f1 = await fit(pg);
  if (SHOTS) await pg.screenshot({ path: SHOTS + '/carnet_1280x720.png' });
  t.check('1280x720 : carnet visible en entier, aucun texte coupé, cartes de KPI dans l\'écran', o2.panel === 'carnet' && f1.inView && !f1.bad.length && f1.cardsOut === 0, JSON.stringify(f1));
  t.check('aucune erreur de page (1280x720)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
  // 8. lisibilité 1920x1080
  pg = await open(L, 1920, 1080);
  const o3 = await clickOffice(pg), f2 = await fit(pg);
  if (SHOTS) await pg.screenshot({ path: SHOTS + '/carnet_1920x1080.png' });
  await pg.evaluate(() => { window.WSE.setImmPanel(''); window.WSE.scene.hovOff = false; }); await pg.mouse.move(5, 5); await pg.waitForTimeout(400);
  if (SHOTS) await pg.screenshot({ path: SHOTS + '/vue_dessus_1920x1080.png' });
  t.check('1920x1080 : carnet visible en entier, aucun texte coupé, cartes de KPI dans l\'écran', o3.panel === 'carnet' && f2.inView && !f2.bad.length && f2.cardsOut === 0, JSON.stringify(f2));
  t.check('aucune erreur de page (1920x1080)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
