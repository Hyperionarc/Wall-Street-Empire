// Révélation produit « cinéma » (vignette de lancement, option « ne plus afficher », héros HD avec repli SVG) et liaisons entre unités de la vue Dessus (flux colorés, flux coupé en alerte, bouton).
exports.name = 'Vignette produit cinéma et liaisons de la vue Dessus';

const SETUP = `(() => {
  const W = window.WSE, S = W.S, N = W.N; const m = S.macro; m.boom = 0; m.phase = Math.PI; m.gdp = 0.03; m.infl = 0.02; m.rate = 0.04;
  const put = (k, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } };
  const f = put('f2', 66, 84, 54, 84); put('port', 66, 84, 54, 84); for (let i = 0; i < 40; i++) put('res', 14, 44, 14, 44); put('s2', 14, 44, 14, 44);
  W.assignRecipe('steel', 2); f.src = { iron: 'local', coal: 'local' }; f.wage = 2;
  const pre = () => { S.macro.phase = Math.PI; S.macro.boom = 0; S.cash = Math.max(S.cash, 5e9); ['iron', 'coal'].forEach(g => { S.stock[g] = 1e9; S.price[g] = W.GOODS[g].base * (S.cpi || 1); }); };
  window.B = { W, S, f, pre };
  for (let i = 0; i < 25; i++) { pre(); W.step(); }
})()`;
const bench = async (L) => { const pg = await L.newPage({ w: 1280, h: 900, wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP); await pg.addStyleTag({ content: '#modesel,#win,#endscr{display:none!important}' }); return pg; };
const sleep = (pg, ms) => pg.waitForTimeout(ms);

exports.run = async (t, L) => {
  // ---------- A. Vignette cinéma
  let pg = await L.newPage({ w: 1280, h: 800, wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr{display:none!important}' });
  const keys = await pg.evaluate(() => { const W = window.WSE; W.cine.setTest(true); W.cine.setOpt(true); const ks = Object.keys(W.PRODUCTS).filter(k => W.S.prod[k].st === 'locked'); return ks.slice(0, 4); });
  const [p1, p2, p3, p4] = keys;
  const tr = await pg.evaluate(async pk => { const W = window.WSE, S = W.S, ps = S.prod[pk], r = {}; r.ok = W.launchProduct(pk); r.st0 = ps.st; ps.rnd = 1; S.noEv = true; for (let i = 0; i < 3 && !W.cine.on; i++) { S.macro.phase = Math.PI; S.macro.boom = 0; S.cash = 5e10; W.step(); } r.st1 = ps.st; await new Promise(x => setTimeout(x, 700)); r.s = W.cine.state(); r.vis = !document.getElementById('cine').hidden;
    const cv = document.getElementById('cinecv'), g = cv.getContext('2d'), d = g.getImageData(560, 200, 160, 160).data; let lit = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 120) lit++; r.lit = lit; r.name = W.PRODUCTS[pk].name; r.facts = W.cine.facts(pk).map(f => f.l); return r; }, p1);
  t.check('lancer un produit (fin de R&D) déclenche la révélation plein écran', tr.ok && tr.st1 === 'on' && tr.s.on && tr.s.pk === p1 && tr.vis, JSON.stringify({ st: [tr.st0, tr.st1], s: tr.s }));
  t.check('la vignette est animée (images dessinées) et le visuel héros est la vignette SVG de repli', tr.s.frames >= 3 && tr.s.hero === 'svg' && tr.lit > 200, `${tr.s.frames} images · ${tr.s.hero} · ${tr.lit} px clairs`);
  t.check('trois chiffres clés (prix conseillé, qualité, marge)', tr.facts.join('|') === 'PRIX CONSEILLÉ|QUALITÉ|MARGE', tr.facts.join('|'));
  await pg.keyboard.press('Escape'); await sleep(pg, 200);
  const esc = await pg.evaluate(() => ({ on: window.WSE.cine.on, hidden: document.getElementById('cine').hidden }));
  t.check('Échap ignore la présentation', !esc.on && esc.hidden, JSON.stringify(esc));
  await pg.evaluate(() => window.WSE.cine.show(Object.keys(window.WSE.PRODUCTS)[0], 'test')); await sleep(pg, 300);
  await pg.mouse.click(300, 300); await sleep(pg, 200);
  t.check('un clic ignore la présentation', await pg.evaluate(() => !window.WSE.cine.on), '');
  // fin naturelle (fondu) : durée 3-6 s
  const t0 = Date.now(); await pg.evaluate(pk => window.WSE.cine.show(pk, 'test'), p1); let n = 0; while (n++ < 80 && await pg.evaluate(() => window.WSE.cine.on)) await sleep(pg, 100);
  const dur = (Date.now() - t0) / 1000; t.check('la présentation dure 3 à 6 s puis se ferme d\'elle-même', dur >= 3 && dur <= 6.5, dur.toFixed(1) + ' s');
  // « ne plus afficher »
  await pg.evaluate(pk => window.WSE.cine.show(pk, 'test'), p1); await sleep(pg, 300); await pg.click('#cinechk'); await sleep(pg, 100);
  const o1 = await pg.evaluate(() => ({ on: window.WSE.cine.on, opt: window.WSE.cine.opt(), ls: localStorage.getItem('wse-cine') }));
  t.check('cocher « Ne plus afficher » mémorise l\'option (sans fermer la présentation)', o1.on && !o1.opt && o1.ls === '0', JSON.stringify(o1));
  await pg.keyboard.press('Escape'); await sleep(pg, 100);
  const tr2 = await pg.evaluate(async pk => { const W = window.WSE, S = W.S, ps = S.prod[pk]; W.launchProduct(pk); ps.rnd = 1; for (let i = 0; i < 3; i++) { S.macro.phase = Math.PI; S.macro.boom = 0; S.cash = 5e10; W.step(); } await new Promise(x => setTimeout(x, 400)); return { st: ps.st, on: W.cine.on }; }, p2);
  t.check('option désactivée : le lancement suivant n\'affiche plus la vignette', tr2.st === 'on' && !tr2.on, JSON.stringify(tr2));
  const man = await pg.evaluate(async pk => { const W = window.WSE; W.cine.show(pk); await new Promise(x => setTimeout(x, 300)); const r = W.cine.on; W.cine.close(); return r; }, p2);
  t.check('« Revoir la présentation » reste possible même option désactivée', man === true, '');
  // option dans le Menu
  await pg.evaluate(() => { window.WSE.cine.setOpt(true); });
  // première fabrication en usine
  const fm = await pg.evaluate(async ([pk]) => { const W = window.WSE, S = W.S, ps = S.prod[pk]; W.cine.reset(); W.cine.watch(); ps.st = 'on'; S.cm = S.cm || {}; S.cm[pk] = 1; W.cine.watch(); await new Promise(x => setTimeout(x, 300)); const r = { on: W.cine.on, pk: W.cine.state().pk }; W.cine.close(); return r; }, [p3]);
  t.check('un produit terminé en usine pour la première fois déclenche aussi la présentation', fm.on && fm.pk === p3, JSON.stringify(fm));
  // héros HD injecté
  const hd = await pg.evaluate(async pk => { const W = window.WSE, c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.fillStyle = '#c33'; g.fillRect(0, 0, 640, 360); g.fillStyle = '#fff'; g.fillRect(100, 100, 440, 160); const uri = c.toDataURL('image/png');
    const before = W.cine.heroOf(pk); W.cine.setHero(pk, uri); await new Promise(x => setTimeout(x, 300)); const after = W.cine.heroOf(pk); W.cine.show(pk, 'test'); await new Promise(x => setTimeout(x, 700)); const s = W.cine.state();
    const d = document.getElementById('cinecv').getContext('2d').getImageData(640 - 40, 300 - 5, 80, 10).data; let wh = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 200) wh++; W.cine.close(); W.cine.setHero(pk, ''); const rest = W.cine.heroOf(pk); return { before, after, hero: s.hero, wh, rest }; }, p4);
  t.check('une image HD fournie (setProductHero) remplace la vignette SVG comme visuel héros', !hd.before && hd.after && hd.hero === 'hd' && hd.wh > 100, JSON.stringify(hd));
  t.check('sans image HD le repli SVG revient', !hd.rest, '');
  // fiche produit : bouton « Revoir la présentation » ; option dans le Menu
  const fi = await pg.evaluate(async pk => { const W = window.WSE; W.S.prod[pk].st = 'on'; W.setPview(true); document.querySelector('#plist [data-p="' + pk + '"]').click(); await new Promise(x => setTimeout(x, 200)); const b = [...document.querySelectorAll('#pdetail [data-act="cine"]')][0]; const has = !!b && /Revoir la présentation/.test(b.textContent); if (b) b.click(); await new Promise(x => setTimeout(x, 300)); const on = W.cine.on; W.cine.close(); W.setPview(false); return { has, on }; }, p1);
  t.check('la fiche produit propose « Revoir la présentation »', fi.has && fi.on, JSON.stringify(fi));
  await pg.evaluate(() => { document.getElementById('pn').click(); document.querySelector('[data-ptab="goals"]').click(); }); await sleep(pg, 400);
  const mn = await pg.evaluate(() => { const b = document.querySelector('#goals [data-cine="0"]'); if (!b) return { has: false }; b.click(); const r = { has: true, opt: window.WSE.cine.opt() }; const b1 = document.querySelector('#goals [data-cine="1"]'); b1.click(); r.opt2 = window.WSE.cine.opt(); return r; });
  t.check('l\'option « ne plus afficher » figure dans le Menu (Objectifs) et se règle', mn.has && mn.opt === false && mn.opt2 === true, JSON.stringify(mn));
  t.check('aucune erreur de page (vignette)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();

  // ---------- B. Liaisons entre unités
  pg = await bench(L);
  const open = await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 900)); const F = W.fac, L0 = F.links(); return { on: F.linksOn(), expl: F.expl, n: L0.length, kinds: [...new Set(L0.map(l => l.kind))].sort().join(','), btn: (document.querySelector('#blinks') || {}).textContent, tips: L0.map(l => l.tip).slice(0, 2) }; });
  t.check('liaisons actives par défaut en vue éclatée, avec achat / vente tracés', open.on && open.expl && open.n >= 2 && /buy/.test(open.kinds) && /sell/.test(open.kinds), JSON.stringify(open));
  t.check('l\'étiquette du flux donne le débit et la marchandise', open.tips.every(x => /Flux : [\d,\s]+ u\/j de /.test(x)), open.tips.join(' | '));
  // pixels de couleur sur le chemin
  const PXJS = `window.PXL = (l, sc) => { const cv = document.getElementById('bscene'), g = cv.getContext('2d'); const a = l.pts[Math.floor(l.pts.length / 2) - 1] || l.pts[0], b = l.pts[Math.floor(l.pts.length / 2)] || l.pts[l.pts.length - 1]; const p = window.WSE.vec.isoP(sc, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 7), d = g.getImageData(Math.round(p[0]) - 2, Math.round(p[1]) - 2, 5, 5).data; let r = 0, gg = 0, bl = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; bl += d[i + 2]; } const n = d.length / 4; return [r / n, gg / n, bl / n, p]; }`;
  await pg.evaluate(PXJS);
  const px = await pg.evaluate(async () => { const { W } = window.B, F = W.fac, sc = W.scene, fr = async () => { W.sceneFrame(0.03); W.sceneFrame(0.03); await new Promise(r => setTimeout(r, 60)); }, hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const out = []; await fr(); const L1 = F.links().filter(l => l.status === '' || !l.status).slice(0, 4); const on = L1.map(l => window.PXL(l, sc)); F.setLinks(false); await fr(); const off = L1.map(l => window.PXL(l, sc)); F.setLinks(true); await fr();
    L1.forEach((l, i) => out.push({ id: l.id, col: l.col, dOnOff: Math.round(dist(on[i], off[i])), dCol: Math.round(dist(on[i], hex(/^#[0-9a-f]{6}$/i.test(l.col) ? l.col : '#888888'))) })); return out; });
  t.check('les liaisons se dessinent : pixels sur les chemins différents de ceux sans liaison, proches de la couleur de la marchandise', px.length >= 2 && px.filter(o => o.dOnOff > 25).length >= Math.ceil(px.length / 2) && px.some(o => o.dCol < 130), JSON.stringify(px));
  // survol : info-bulle
  const hv = await pg.evaluate(async () => { const { W } = window.B, sc = W.scene, sr = document.getElementById('bsw').getBoundingClientRect(), iso = W.vec.isoP; let best = null;
    W.fac.links().filter(x => x.kind === 'buy').forEach(l => { for (let i = 1; i < l.pts.length && !best; i++) for (const f of [0.3, 0.5, 0.7]) { const a = l.pts[i - 1], b = l.pts[i], x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f, q = iso(sc, x, y, 0), m = sc.M(x, y, 0); if (W.fac.at(sc, q[0], q[1]) < 0 && W.fac.linkAt(sc, q[0], q[1])) { best = { x: sr.left + m[0], y: sr.top + m[1], id: l.id }; break; } } });
    return best; });
  await pg.mouse.move(hv.x - 40, hv.y - 40); await pg.mouse.move(hv.x, hv.y); await sleep(pg, 250);
  const tip = await pg.evaluate(() => { const b = document.getElementById('btip'); return { vis: b && !b.hidden, txt: b ? b.textContent : '', hov: window.WSE.scene.hovL }; });
  t.check('au survol d\'une liaison, l\'étiquette « N u/j de <marchandise> » s\'affiche', tip.vis && /u\/j de /.test(tip.txt) && !!tip.hov, JSON.stringify(tip));
  // flux coupé : rupture d'intrant
  const cut = await pg.evaluate(async () => { const { W, f } = window.B, sc = W.scene, F = W.fac, fr = async () => { W.sceneFrame(0.03); W.sceneFrame(0.03); await new Promise(r => setTimeout(r, 60)); }; const g0 = Object.keys(W.RECIPES ? W.RECIPES.steel.in : { iron: 1 })[0]; f.limit = g0; await fr(); await fr();
    const L1 = F.links(), buy = L1.filter(l => l.kind === 'buy'), sell = L1.filter(l => l.kind === 'sell'); const c = buy[0] ? window.PXL(buy[0], sc) : [0, 0, 0]; f.limit = ''; await fr(); const L2 = F.links();
    return { buy: buy.map(l => l.status), sell: sell.map(l => l.status), px: c.slice(0, 3).map(Math.round), after: L2.filter(l => l.kind === 'buy').map(l => l.status), tip: buy[0] && buy[0].tip }; });
  t.check('un flux coupé (rupture d\'intrant) est signalé en alerte (statut « cut », rouge) puis revient à la normale', cut.buy.length && cut.buy.every(s => s === 'cut') && cut.px[0] > 150 && cut.px[0] > cut.px[1] * 1.5 && cut.after.every(s => s !== 'cut') && /coupé/.test(cut.tip), JSON.stringify(cut));
  const sat = await pg.evaluate(async () => { const { W, f } = window.B, F = W.fac, sc = W.scene; f.limit = '_full'; await new Promise(r => setTimeout(r, 150)); W.sceneFrame(0.03); W.sceneFrame(0.03); const s = F.links().filter(l => l.kind === 'sell').map(l => l.status); f.limit = ''; return s; });
  t.check('quai plein : les liaisons de vente sont en alerte', sat.length && sat.every(s => s === 'cut'), JSON.stringify(sat));
  // bouton
  const bt = await pg.evaluate(async () => { const W = window.WSE, b = document.querySelector('#blinks'), r = {}; r.t0 = b.textContent; b.click(); await new Promise(x => setTimeout(x, 150)); W.sceneFrame(0.03); r.off = !W.fac.linksOn(); r.n1 = W.fac.links().length; r.t1 = b.textContent; r.p1 = b.getAttribute('aria-pressed'); b.click(); await new Promise(x => setTimeout(x, 150)); W.sceneFrame(0.03); r.on = W.fac.linksOn(); r.n2 = W.fac.links().length; return r; });
  t.check('le bouton « Voir les liaisons » masque puis ré-affiche les liaisons', bt.off && bt.n1 === 0 && /Voir les liaisons/.test(bt.t1) && bt.p1 === 'false' && bt.on && bt.n2 >= 2 && /Masquer/.test(bt.t0), JSON.stringify(bt));
  const asm = await pg.evaluate(async () => { const W = window.WSE; document.querySelector('#bcam [data-cam="explode"]').click(); await new Promise(x => setTimeout(x, 600)); W.sceneFrame(0.03); const n = W.fac.links().length; document.querySelector('#bcam [data-cam="explode"]').click(); await new Promise(x => setTimeout(x, 600)); W.sceneFrame(0.03); return { n, back: W.fac.links().length }; });
  t.check('en vue assemblée les liaisons ne sont pas tracées ; elles reviennent en vue éclatée', asm.n === 0 && asm.back >= 2, JSON.stringify(asm));
  t.check('aucune erreur de page (liaisons)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
