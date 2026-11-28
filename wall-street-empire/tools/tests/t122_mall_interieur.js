// Intérieur du Mall (responsable Intérieur du Mall) : on ENTRE dans un grand hall commercial au lieu d'une fenêtre de cartes.
// Clic réel sur le Mall = hall isométrique (deux niveaux de cellules), cellules des rivaux (une par société vivante, nom et données de mallData au survol),
// ta boutique près du Mall dans une cellule dorée, cellules LIBRE liées à de vraies cases libres près du Mall ; clic réel sur une cellule libre puis
// « Petit marché » = boutique posée (coût débité, cellule occupée, bonus du Mall) ; clic sur ta cellule = fiche du magasin ; Échap ferme ; visiteurs animés ;
// agencement déterministe ; sauvegarde et rechargement intacts (aucun champ ajouté). Aucun pop-up : un seul panneau, la barre d'installation est dans le hall.
exports.name = 'Intérieur du Mall : grand hall, cellules libres, rivaux, installation';
const start = async (pg, opt) => pg.evaluate(async o => {
  const W = window.WSE; document.getElementById('caste').hidden = true; W.startMode('free'); W.setCaste('industriel');
  ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.S.noEv = true; W.setSpeed(0); if (o && o.cash) W.S.cash = o.cash;
  const b = document.querySelector('[data-sg="close"]'); if (b) b.click(); await new Promise(x => setTimeout(x, 400)); return true;
}, opt || {});

exports.run = async (t, L) => {
  const b = await L.browser(), ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const pg = await L.newPage({ ctx, wait: 2600 }); await L.inject(pg); await start(pg, { cash: 3e7 });
  await pg.addStyleTag({ content: '#modesel{display:none !important}' });
  // tes boutiques près du Mall (posées sur la carte, comme un joueur) ; le petit marché solde la mission « Ouvrir un petit marché » (+200 000 $) : le coût mesuré plus bas est alors le seul mouvement
  const pre = await pg.evaluate(() => { const W = window.WSE; W.setTool('view'); for (let i = 0; i < 2; i++) W.step(); try { W.mk.act('close'); } catch (e) {} const s = W.mall.spot('s2'); W.place(s.x, s.y, 's2'); const s1 = W.mall.spot('s1'); W.place(s1.x, s1.y, 's1'); W.step(); const M = W.mall.pos(); W.centerOn(M.x + 5, M.y + 5); return s; });
  await pg.waitForTimeout(500);
  // 1. clic réel sur le Mall : le hall s'ouvre
  const q = await pg.evaluate(() => { const W = window.WSE, M = W.mall.pos(), p = W.tileToScreen(M.x + 8, M.y + 8); return [p.x, p.y]; });
  await pg.mouse.click(q[0], q[1]); await pg.waitForTimeout(900);
  const h = await pg.evaluate(() => { const W = window.WSE, b = document.getElementById('mallp'), cv = document.getElementById('mhcv'), r = cv && cv.getBoundingClientRect();
    let vari = 0; if (cv) { const g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data, seen = new Set(); for (let i = 0; i < d.length; i += 4 * 97) seen.add((d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4)); vari = seen.size; }
    const C = W.mall.hall.cells(), riv = (W.S.rivals || []).filter(r => !r.dead);
    return { open: W.mall.isOpen() && !b.hidden, hall: b.classList.contains('hall'), w: r ? r.width : 0, h: r ? r.height : 0, vari, n: C.length, lv: [0, 1].map(l => C.filter(c => c.s.lvl === l).length),
      free: C.filter(c => c.st === 'free').length, me: C.filter(c => c.st === 'me').map(c => c.b.x + ',' + c.b.y), riv: C.filter(c => c.st === 'riv').map(c => c.r.id), rivN: Math.min(8, riv.length),
      names: C.filter(c => c.st === 'riv').every(c => riv.some(r => r.name.toUpperCase() === c.name)), tiles: C.filter(c => c.st === 'free').every(c => c.tile && W.mall.bonus(c.tile.x, c.tile.y).near && !W.S.grid[c.tile.y * W.N + c.tile.x]),
      ppl: W.mall.hall.people(), act: W.mall.hall.act(), cards: b.querySelectorAll('.aslot').length, txt: b.innerText };
  });
  t.check('clic réel sur le Mall : le grand hall s\'ouvre (canvas dessiné, pas de cartes)', h.open && h.hall && h.w > 600 && h.h > 350 && h.vari > 40 && h.cards === 0, JSON.stringify({ w: h.w, h: h.h, vari: h.vari, cards: h.cards }));
  t.check('16 cellules sur deux niveaux (rez-de-chaussée et galerie haute)', h.n === 16 && h.lv[0] >= 6 && h.lv[1] >= 6, JSON.stringify(h.lv));
  t.check('une cellule par rival vivant, enseigne à son nom', h.riv.length === h.rivN && h.rivN >= 3 && h.names, `${h.riv.length} / ${h.rivN}`);
  t.check('ta boutique près du Mall occupe une cellule', h.me.indexOf(pre.x + ',' + pre.y) >= 0, JSON.stringify(h.me));
  t.check('cellules LIBRE liées à de vraies cases libres près du Mall (+20 %)', h.free >= 3 && h.tiles, `${h.free} libres`);
  t.check('visiteurs animés, nombre lié à la fréquentation du Mall', h.ppl >= 10 && h.ppl <= 80 && h.act > 0 && h.act <= 1, `${h.ppl} visiteurs · activité ${h.act.toFixed(2)}`);
  t.check('peu de texte à l\'entrée (chiffres du marché repliés dans un tiroir)', !/Qui vend quoi/.test(h.txt) && h.txt.length < 400, h.txt.length + ' caractères');
  // 2. survol d'un rival : étiquette avec propriétaire, rayons, part, prix
  let pts = await pg.evaluate(() => window.WSE.mall.hall.pts());
  const rp = pts.find(p => p.st === 'riv'); await pg.mouse.move(rp.x - 3, rp.y); await pg.mouse.move(rp.x, rp.y); await pg.waitForTimeout(250);
  const tip = await pg.evaluate(() => { const e = document.getElementById('mhtip'); return { vis: !e.hidden, txt: e.innerText }; });
  t.check('survol d\'un rival : nom, ce qu\'il vend, part du marché, prix', tip.vis && /part du marché \d+ %/.test(tip.txt) && /Prix|hors grand public/.test(tip.txt) && /Base|Manuf|Luxe|hors grand public/.test(tip.txt), tip.txt.replace(/\n/g, ' · ').slice(0, 160));
  // 3. clic réel sur une cellule libre puis « Petit marché » : boutique installée
  const fp = pts.find(p => p.st === 'free' && p.lvl === 0) || pts.find(p => p.st === 'free');
  await pg.mouse.move(fp.x, fp.y); await pg.waitForTimeout(150); await pg.mouse.click(fp.x, fp.y); await pg.waitForTimeout(300);
  const bar = await pg.evaluate(() => { const e = document.getElementById('mhins'), bt = e.querySelector('[data-mall="ins:s1"]'); return { vis: !e.hidden, sel: window.WSE.mall.hall.sel(), btn: !!bt && !bt.disabled, n: e.querySelectorAll('[data-mall^="ins:"]').length, pops: document.querySelectorAll('.modal:not([hidden]),[role="alertdialog"]:not([hidden])').length }; });
  t.check('clic sur une cellule libre : barre d\'installation dans le hall (formats et coûts), aucun pop-up', bar.vis && bar.sel === fp.i && bar.btn && bar.n >= 2 && bar.pops === 0, JSON.stringify(bar));
  const pay = await pg.evaluate(() => { const S = window.WSE.S, bt = document.querySelector('#mhins [data-mall="ins:s1"]'), lab = bt.innerText, c0 = S.cash; bt.click(); return { paid: c0 - S.cash, lab }; });   // clic et mesure dans la même image (la partie tourne)
  await pg.waitForTimeout(300); const c0 = 0;
  const ins = await pg.evaluate(({ fp, c0 }) => { const W = window.WSE, S = W.S, c = W.mall.hall.cells()[fp.i], t = fp.tile, g = S.grid[t.y * W.N + t.x];
    return { st: c.st, at: c.b ? c.b.x + ',' + c.b.y : '', bld: g ? g.t : null, own: g ? (g.owner || 'me') : null, near: W.mall.bonus(t.x, t.y).near, bar: document.getElementById('mhins').hidden, open: W.mall.isOpen() }; }, { fp, c0 });
  t.check('« Petit marché » : boutique posée sur la case de la cellule, coût débité, cellule occupée par toi, bonus du Mall', pay.paid > 0 && Math.abs(pay.paid - +pay.lab.replace(/[^\d]/g, '')) <= 0.02 * pay.paid && ins.bld === 's1' && ins.own === 'me' && ins.st === 'me' && ins.at === fp.tile.x + ',' + fp.tile.y && ins.near && ins.bar && ins.open, JSON.stringify(Object.assign({ paid: pay.paid, lab: pay.lab.replace(/\n/g, ' ') }, ins)));
  // 4. le hall suit : deux rafraîchissements donnent le même agencement (déterministe)
  const det = await pg.evaluate(() => { const W = window.WSE, sig = () => W.mall.hall.cells().map(c => c.st + (c.tile ? c.tile.x + ',' + c.tile.y : '') + (c.r ? c.r.id : '')).join('|'); const a = sig(); W.mall.close(); W.mall.open(); const b = sig(); return { a, b }; });
  t.check('agencement déterministe (fermer et rouvrir : mêmes cellules)', det.a === det.b, '');
  // 5. clic sur ta cellule : la fiche du magasin s'ouvre (le hall se ferme)
  await pg.waitForTimeout(400); pts = await pg.evaluate(() => window.WSE.mall.hall.pts());
  const mp = pts.find(p => p.st === 'me' && p.b && p.b.x === fp.tile.x && p.b.y === fp.tile.y); await pg.mouse.click(mp.x, mp.y); await pg.waitForTimeout(500);
  const fi = await pg.evaluate(() => ({ bview: !document.getElementById('bview').hidden, mall: window.WSE.mall.isOpen() }));
  t.check('clic sur ta cellule : fiche du magasin ouverte', fi.bview && !fi.mall, JSON.stringify(fi));
  // 6. Échap ferme le hall
  await pg.evaluate(() => { window.WSE.closeBuilding && window.WSE.closeBuilding(); document.getElementById('bview').hidden = true; window.WSE.mall.open(); }); await pg.waitForTimeout(300);
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
  const esc = await pg.evaluate(() => ({ open: window.WSE.mall.isOpen(), hid: document.getElementById('mallp').hidden }));
  t.check('Échap ferme le hall', !esc.open && esc.hid, JSON.stringify(esc));
  // 7. croix : rouvrir puis fermer à la croix (44 px)
  const x = await pg.evaluate(async () => { window.WSE.mall.open(); await new Promise(r => setTimeout(r, 200)); const e = document.querySelector('#mallp .xbtn[data-mall="close"]'), r = e.getBoundingClientRect(); e.click(); return { w: r.width, open: window.WSE.mall.isOpen() }; });
  t.check('grande croix (≥ 44 px) qui ferme le hall', x.w >= 44 && !x.open, JSON.stringify(x));
  // 8. tiroir « Chiffres du marché »
  const dw = await pg.evaluate(async () => { window.WSE.mall.open(); document.querySelector('#mallp [data-mall="drw"]').click(); await new Promise(r => setTimeout(r, 100)); const d = document.getElementById('mhdrw'); const o = { vis: !d.hidden, txt: d.innerText }; window.WSE.mall.act('drw'); window.WSE.mall.close(); return o; });
  t.check('« Chiffres du marché » : demande, qui vend quoi, plus demandés, pôle (dans un tiroir)', dw.vis && /La demande de la ville/.test(dw.txt) && /Qui vend quoi/.test(dw.txt) && /Pôle commercial/.test(dw.txt), '');
  // 9. sauvegarde et rechargement : la boutique installée depuis le hall est là, le hall se rouvre
  const sv = await pg.evaluate(() => { const W = window.WSE; W.save(); const raw = localStorage.getItem('wse-city-v8'), d = JSON.parse(raw); return { keys: Object.keys(d).sort().join(','), n: raw.length }; });
  const pg2 = await L.newPage({ ctx, wait: 1500 });
  const rl = await pg2.evaluate(async fp => { const W = window.WSE, S = W.S, g = S.grid[fp.tile.y * W.N + fp.tile.x]; W.mall.open(); await new Promise(r => setTimeout(r, 600)); const C = W.mall.hall.cells();
    return { bld: g ? g.t : null, me: C.filter(c => c.st === 'me').map(c => c.b.x + ',' + c.b.y), open: W.mall.isOpen(), keys: Object.keys(JSON.parse(localStorage.getItem('wse-city-v8'))).sort().join(',') }; }, fp);
  t.check('sauvegarde : la boutique du hall est rechargée, le hall se rouvre avec ta cellule, aucun champ ajouté', rl.bld === 's1' && rl.me.indexOf(fp.tile.x + ',' + fp.tile.y) >= 0 && rl.open && rl.keys === sv.keys, JSON.stringify({ bld: rl.bld, me: rl.me }));
  // 10. performance : une image du hall (agencement en cache)
  const perf = await pg2.evaluate(() => { const H = window.WSE.mall.hall; H.frame(0.03); const t0 = performance.now(); for (let i = 0; i < 20; i++) H.frame(0.03); return (performance.now() - t0) / 20; });
  t.check('une image du hall coûte moins de 12 ms (agencement fixe en cache)', perf < 12, perf.toFixed(2) + ' ms');
  t.check('aucune erreur de page', pg.errs.length === 0 && pg2.errs.length === 0, pg.errs.concat(pg2.errs).slice(0, 3).join(' | '));
  // 11. mobile 390×844 : le hall tient dans l'écran, une cellule libre est visible
  const pm = await L.newPage({ wait: 2600, w: 390, h: 844 }); await start(pm, { cash: 3e7 });
  const mo = await pm.evaluate(async () => { const W = window.WSE; W.step(); W.mall.open(); await new Promise(r => setTimeout(r, 500)); const b = document.getElementById('mallp'), r = b.getBoundingClientRect(), cv = document.getElementById('mhcv').getBoundingClientRect();
    const vis = W.mall.hall.pts().filter(p => p.x >= cv.left && p.x <= cv.right && p.y >= cv.top && p.y <= cv.bottom); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: innerWidth, h: innerHeight, free: vis.filter(p => p.st === 'free').length, riv: vis.filter(p => p.st === 'riv').length, hs: b.scrollWidth > b.clientWidth + 1 }; });
  t.check('mobile 390×844 : hall dans l\'écran, cellules libres et rivaux visibles, sans débordement', mo.l >= 0 && mo.r <= mo.w && mo.t >= 0 && mo.b <= mo.h && mo.free >= 1 && mo.riv >= 1 && !mo.hs, JSON.stringify(mo));
  t.check('aucune erreur de page (mobile)', pm.errs.length === 0, pm.errs.slice(0, 3).join(' | '));
  await pm.context().close(); await ctx.close();
};
