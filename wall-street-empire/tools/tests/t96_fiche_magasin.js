// Fiche magasin façon Capitalism Lab (retour de Rémy) : la grille des emplacements est TOUT EN HAUT (visible sans défiler), le premier
// emplacement est sélectionné d'office, un clic sur un produit le place, le curseur de prix porte le nom du produit, la publicité est reliée
// produit par produit (en ligne / médias, badge sur la carte, effet sur la demande de CE produit, sauvegarde), et les onglets du magasin
// (intérieur, logistique, effectif, comptes, publicité du magasin) sont repliés plus bas. Captures 1280×800, 900×800, 390×844.
exports.name = 'Fiche magasin : emplacements, prix nommé, publicité par produit';
const OUT = process.env.WSE_SHOTS || '';   // captures si WSE_SHOTS est défini (comme t41, t43)
const WORLD = `(o) => { const W = window.WSE, S = W.S, T = window.T; ['modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
  T.inC(o.t); ['bread', 'milk'].forEach(pk => { try { W.quickProduce(pk); } catch (e) {} }); T.stepN(o.days || 40, true);
  const c = S.grid.find(c => c && c.t === o.t); return { x: c.x, y: c.y }; }`;
exports.run = async (t, L) => {
  if (OUT) require('fs').mkdirSync(OUT, { recursive: true });
  // ---- 1. 1280×800 : petit marché
  let pg = await L.newPage({ w: 1280, h: 800, wait: 900 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
  const at = await pg.evaluate(`(${WORLD})({ t: 's1' })`);
  const a = await pg.evaluate(async (p) => { const W = window.WSE, c = W.S.grid[p.y * W.N + p.x]; W.openBuilding(p.x, p.y); await new Promise(r => setTimeout(r, 300));
    const bv = document.getElementById('bview'), r = bv.getBoundingClientRect(), g = bv.querySelector('.shgrid'), gr = g && g.getBoundingClientRect(), slots = [...bv.querySelectorAll('.shgrid .shs')];
    const close = bv.querySelector('.ph [data-act="close"]').getBoundingClientRect(), tabsTop = getComputedStyle(bv.querySelector(':scope > .btabs')).display;
    return { shop: bv.classList.contains('shop'), n: slots.length, N: W.slotsN(c), sel: slots.findIndex(s => s.classList.contains('sel')), gridIn: !!gr && gr.top >= r.top && gr.bottom <= r.bottom, scroll: bv.scrollTop,
      panel: !!bv.querySelector('.shpan'), auto: !!bv.querySelector('.shpan [data-act="autoslots"]'), close: [Math.round(close.width), Math.round(close.height), Math.round(close.right), Math.round(r.right)], tabsTop,
      det: !!bv.querySelector('.shdet [data-act="shopdet"]'), detOpen: !!bv.querySelector('.shdet .shtabs'), keys: W.shopUI.keys(c) }; }, at);
  t.check('fiche magasin : grille de ' + a.N + ' emplacements en haut, visible sans défiler', a.shop && a.n === a.N && a.N === 4 && a.gridIn && a.scroll === 0, JSON.stringify(a));
  t.check('premier emplacement sélectionné d\'office, panneau d\'action ouvert avec « Remplissage automatique »', a.sel === 0 && a.panel && a.auto, `sel ${a.sel}`);
  t.check('croix de fermeture ≥ 44 px en haut à droite ; onglets du haut masqués, « Détails du magasin » replié', a.close[0] >= 44 && a.close[1] >= 44 && a.close[3] - a.close[2] < 40 && a.tabsTop === 'none' && a.det && !a.detOpen, JSON.stringify(a.close) + ' ' + a.tabsTop);
  if (OUT) await pg.screenshot({ path: OUT + '/t96_1280_s1.png' });
  // clic réel sur un emplacement vide puis sur un produit de la liste
  const ei = a.keys.findIndex(k => !k);
  await pg.click(`#bview .shgrid .shs:nth-child(${ei + 1})`); await pg.waitForTimeout(150);
  const b = await pg.evaluate((p) => { const W = window.WSE, bv = document.getElementById('bview'), slots = [...bv.querySelectorAll('.shgrid .shs')], cards = [...bv.querySelectorAll('.shpan .shcb:not([disabled])')];
    return { sel: slots.findIndex(s => s.classList.contains('sel')), n: cards.length, first: cards[0] ? cards[0].dataset.act : '', names: cards.map(x => x.querySelector('b').textContent).join(', '), prices: /Achat livré[\s\S]*Prix conseillé/.test(bv.querySelector('.shpan').innerText), sup: !!bv.querySelector('.shpan .shc select, .shpan .shsup') }; }, at);
  t.check(`clic sur l'emplacement ${ei + 1} : il est sélectionné et propose ${b.n} produit(s) (photo, achat livré, prix conseillé, fournisseur)`, b.sel === ei && b.n >= 1 && b.prices && b.sup, b.names);
  if (b.first) await pg.click(`#bview .shpan .shcb[data-act="${b.first}"]`); await pg.waitForTimeout(150);
  const c1 = await pg.evaluate((p) => { const W = window.WSE, c = W.S.grid[p.y * W.N + p.x], bv = document.getElementById('bview'), h = bv.querySelector('.shprice h4'), sl = bv.querySelector('.shprice input[data-pk]');
    return { slots: (c.slots || []).slice(), h: h ? h.innerText.replace(/\s+/g, ' ') : '', pk: sl ? sl.dataset.pk : '', sel: [...bv.querySelectorAll('.shgrid .shs')].findIndex(s => s.classList.contains('sel')) }; }, at);
  const put = b.first.split(':').slice(2).join(':');
  t.check('un clic sur un produit le met immédiatement dans l\'emplacement sélectionné', c1.slots[ei] === put && c1.sel === ei, JSON.stringify(c1.slots));
  t.check('curseur de prix attaché à l\'emplacement et nommé (« Prix de vente : produit · x $ (y % du prix de référence) »)', c1.pk === put && /^Prix de vente : .+ · [\d,]+ \$ \(\d+ % du prix de référence\)/.test(c1.h), c1.h);
  // repères de marché et curseur : déplacer le curseur met à jour le prix affiché
  const pr = await pg.evaluate(() => { const bv = document.getElementById('bview'), sl = bv.querySelector('.shprice input[data-pk]'), p0 = document.getElementById('pkp').textContent; sl.value = 130; sl.dispatchEvent(new Event('input', { bubbles: true })); const p1 = document.getElementById('pkp').textContent; sl.dispatchEvent(new Event('change', { bubbles: true }));
    return { p0, p1, mk: /Prix moyen des concurrents[\s\S]*Prix d'achat livré/.test(bv.querySelector('.shprice').innerText) }; });
  t.check('repères : prix moyen des concurrents et prix d\'achat ; le curseur change le prix affiché', pr.mk && pr.p0 !== pr.p1, `${pr.p0} → ${pr.p1}`);
  // publicité par produit : en ligne, badge, budget, coût, effet
  await pg.click(`#bview .shad [data-act="adx:${put}:net"]`); await pg.waitForTimeout(100);
  await pg.click(`#bview .shad [data-act="adxb:${put}:1"]`); await pg.waitForTimeout(100);
  const d = await pg.evaluate((p) => { const W = window.WSE, c = W.S.grid[p.y * W.N + p.x], k = c.slots[p.i], bv = document.getElementById('bview'), card = bv.querySelectorAll('.shgrid .shs')[p.i];
    return { adx: JSON.stringify(c.adx), m: W.shopUI.mult(c, k), sp: W.shopUI.spend(c), badge: (card.querySelector('.adxb') || {}).textContent || '', eff: /Effet attendu[\s\S]*\+\d+ %/.test(bv.querySelector('.shad').innerText), pressed: (bv.querySelector('.shad [aria-pressed="true"]') || {}).textContent }; }, { ...at, i: ei });
  t.check('publicité en ligne reliée au produit : badge « En ligne » sur la carte, budget, effet attendu affiché', /"m":"net"/.test(d.adx) && d.badge === 'En ligne' && d.m > 1 && d.sp > 0 && d.eff && d.pressed === 'Publicité en ligne', JSON.stringify(d));
  await pg.click(`#bview .shad [data-act="adx:${put}:media"]`); await pg.waitForTimeout(100);
  const d2 = await pg.evaluate((p) => { const W = window.WSE, c = W.S.grid[p.y * W.N + p.x]; return { m: c.adx && c.adx[c.slots[p.i]].m, badge: (document.querySelectorAll('#bview .shgrid .shs')[p.i].querySelector('.adxb') || {}).textContent }; }, { ...at, i: ei });
  t.check('bascule vers « Médias » : badge « Médias »', d2.m === 'media' && d2.badge === 'Médias', JSON.stringify(d2));
  if (OUT) await pg.screenshot({ path: OUT + '/t96_1280_s1_pub.png' });
  // détails repliés : ouvrir, onglets, compte de résultat
  await pg.click('#bview .shdet [data-act="shopdet"]'); await pg.waitForTimeout(100);
  const e = await pg.evaluate(() => { const bv = document.getElementById('bview'), tabs = [...bv.querySelectorAll('.shdet .shtabs button')].map(b => b.textContent); return { tabs, int: /Démolir/.test(bv.querySelector('.shdet').innerText) }; });
  t.check('« Détails du magasin » déplié : Intérieur, Logistique, Effectif, Compte de résultat, Bilan, Flux de trésorerie, Publicité', e.tabs.join(',') === 'Intérieur,Logistique,Effectif,Compte de résultat,Bilan,Flux de trésorerie,Publicité' && e.int, e.tabs.join(','));
  await pg.click('#bview .shdet [data-act="tab:ad"]'); await pg.waitForTimeout(100);
  const f = await pg.evaluate(() => { const bv = document.getElementById('bview'); return { grid: !!bv.querySelector('.shgrid'), ad: /Notoriété/.test(bv.querySelector('.shdet').innerText), scene: getComputedStyle(document.getElementById('bsw')).display }; });
  t.check('onglet Publicité du magasin dans les détails ; la grille reste en haut et l\'animation reste visible', f.grid && f.ad && f.scene !== 'none', JSON.stringify(f));
  // sauvegarde : champ facultatif ax, aller-retour
  const sv = await pg.evaluate((p) => { const W = window.WSE; W.save(); const raw = JSON.parse(localStorage.getItem('wse-city-v8')); return JSON.stringify(raw).indexOf('"ax":') >= 0; }, at);
  const ctx = pg.context(); const pg2 = await ctx.newPage(); pg2.errs = []; pg2.on('pageerror', e => pg2.errs.push(e.message)); await pg2.goto(L.URL);
  const rl = await pg2.evaluate((p) => { const W = window.WSE, c = W.S.grid[p.y * W.N + p.x]; return JSON.stringify(c.adx || null); }, at);
  t.check('sauvegarde : publicité par produit enregistrée (champ facultatif) et relue', sv && /"m":"media"/.test(rl), rl);
  // Échap ferme la fiche
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(100);
  t.check('Échap ferme la fiche magasin', await pg.evaluate(() => document.getElementById('bview').hidden), '');
  t.check('0 pageerror (1280)', pg.errs.length === 0 && pg2.errs.length === 0, pg.errs.concat(pg2.errs).slice(0, 3).join(' | '));
  await ctx.close();

  // ---- 2. effet de la publicité par produit sur les ventes (deux parties identiques, déterministes)
  async function sales(on) { const p = await L.newPage({ wait: 700 }); await L.setup(p, { cash: 5e8 }); await L.inject(p);
    const q = await p.evaluate(`(${WORLD})({ t: 's2', days: 30 })`);
    const r = await p.evaluate((o) => { const W = window.WSE, S = W.S, T = window.T, c = S.grid[o.y * W.N + o.x], k = W.shopUI.keys(c).find(Boolean); c.slots = W.shopUI.keys(c);
      if (o.on) c.adx = { [k]: { m: 'net', b: 2000 } }; let s = 0, ad = 0; for (let d = 0; d < 20; d++) { W.step(); s += (c.sales && c.sales[k]) || 0; ad += c.adCost || 0; } return { k, s, ad, m: W.shopUI.mult(c, k) }; }, { ...q, on });
    await p.context().close(); return r; }
  const [s0, s1] = await Promise.all([sales(false), sales(true)]);
  t.check(`publicité en ligne sur ${s0.k} : ventes de ce produit dans ce magasin en hausse et budget compté dans la pub du magasin`, s1.s > s0.s * 1.02 && s1.ad > s0.ad && s1.m > 1, `${s0.s.toFixed(0)} → ${s1.s.toFixed(0)} u / 20 j · multiplicateur ${s1.m.toFixed(3)} · pub ${s0.ad.toFixed(0)} → ${s1.ad.toFixed(0)}`);

  // ---- 3. 900×800 (supermarché, 8 emplacements) et 390×844 (petit marché, 2 colonnes)
  for (const [w, h, ty, N] of [[900, 800, 's2', 8], [390, 844, 's1', 4]]) {
    const p = await L.newPage({ w, h, wait: 900 }); await L.setup(p, { cash: 5e8 }); await L.inject(p);
    const q = await p.evaluate(`(${WORLD})({ t: '${ty}', days: 20 })`);
    const r = await p.evaluate(async (o) => { const W = window.WSE; W.openBuilding(o.x, o.y); await new Promise(r => setTimeout(r, 300)); const bv = document.getElementById('bview'), br = bv.getBoundingClientRect(), s = [...bv.querySelectorAll('.shgrid .shs')], r0 = s[0].getBoundingClientRect(), r1 = s[1].getBoundingClientRect();
      const cols = new Set(s.map(x => Math.round(x.getBoundingClientRect().left))).size, small = [...bv.querySelectorAll('.shs, .shpan .btn, .shcb, .shdt')].filter(x => x.offsetParent && x.getBoundingClientRect().height < 44).length;
      return { n: s.length, cols, top: Math.round(r0.top - br.top), firstIn: r0.bottom <= br.bottom, hscroll: document.documentElement.scrollWidth > innerWidth + 1 || bv.scrollWidth > bv.clientWidth + 1, small, sel: s[0].classList.contains('sel') }; }, q);
    t.check(`${w}×${h} : ${N} emplacements, ${w < 600 ? '2' : '4'} colonnes, premier emplacement visible et sélectionné, pas de défilement horizontal, cibles ≥ 44 px`, r.n === N && r.cols === (w < 600 ? 2 : 4) && r.firstIn && r.sel && !r.hscroll && r.small === 0, JSON.stringify(r));
    if (OUT) await p.screenshot({ path: OUT + `/t96_${w}_${ty}.png` });
    t.check(`0 pageerror (${w})`, p.errs.length === 0, p.errs.slice(0, 3).join(' | '));
    await p.context().close();
  }
  if (OUT) t.info('captures : ' + OUT + '/t96_*.png');
};
