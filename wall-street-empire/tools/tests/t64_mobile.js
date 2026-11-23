// Interface jouable sur téléphone (passe 64) : HUD compact en 390×844, carte visible ≥ 60 % de la hauteur, pas de débordement horizontal,
// cibles tactiles ≥ 44 px (commandes du haut, catégories, outils, boutons Fermer des vues plein écran), notifications courtes, en bas, jamais au centre
// ni bloquantes, tableau de bord dépliable, gestes au doigt (tap = pose, glisser = déplacer la carte, pincer = zoomer sans rien poser),
// paysage 844×390 et tablette 820×1180 ; le bureau garde son tableau de bord complet et au plus 2 notifications.
exports.name = 'Interface mobile';
const path = require('path');
const SHOTS = process.env.WSE_SHOTS || '';

// Ouvre une page (contexte tactile pour téléphone / tablette) et démarre un Round au clic, comme un joueur
async function start(L, w, h, touch) {
  const b = await L.browser();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: !!touch, isMobile: !!touch, deviceScaleFactor: 1 });
  const pg = await L.newPage({ ctx, wait: 2800 });
  const tap = async s => { const e = await pg.$(s); if (!e) throw new Error('introuvable : ' + s); await e.click(); await pg.waitForTimeout(450); };
  await tap('#modesel [data-mode=round]'); await tap('#caste [data-cview="industriel"]'); await tap('#caste [data-caste="industriel"]');
  await pg.waitForTimeout(900);
  await pg.evaluate(() => { const W = window.WSE; W.setSpeed(0); W.S.noEv = true; const b = document.querySelector('[data-sg="close"]'); if (b) b.click(); document.querySelectorAll('#feed .msg').forEach(m => m.remove()); });
  await pg.waitForTimeout(300);
  pg.tap2 = tap; return pg;
}
// Mesures dans la page : part de la hauteur où la carte est atteignable, débordement, cibles trop petites, notifications
const MEAS = () => {
  const W = innerWidth, H = innerHeight, vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  let rows = 0, tot = 0; for (let y = 2; y < H; y += 4) { tot++; let hit = 0; for (const fx of [0.2, 0.5, 0.8]) { const e = document.elementFromPoint(W * fx, y); if (e && e.id === 'view') hit++; } if (hit >= 2) rows++; }
  const small = []; document.querySelectorAll('#hud button, #bar .cat, #bar .tool').forEach(b => { if (!vis(b)) return; const r = b.getBoundingClientRect(); if (r.bottom < 0 || r.top > H) return; if (r.height < 44 || r.width < 44) small.push((b.id || b.className.split(' ')[0] || b.tagName) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); });
  const msgs = [...document.querySelectorAll('#feed .msg')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, pe: getComputedStyle(e).pointerEvents, under: (document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2) || {}).id }; });
  const bar = document.getElementById('bar').getBoundingClientRect(), hud = document.getElementById('hud').getBoundingClientRect();
  return { frac: rows / tot, sw: document.documentElement.scrollWidth, W, H, small, msgs, barTop: bar.top, hudBot: hud.bottom, chips: [...document.querySelectorAll('#hud .chip')].filter(vis).length, rank: !!([...document.querySelectorAll('#objbar .orank')].find(vis)), cmp: document.body.classList.contains('cmp') };
};
const closeSize = (pg, sel) => pg.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(b => b.offsetParent); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), right: Math.round(innerWidth - r.right), sw: document.documentElement.scrollWidth, W: innerWidth }; }, sel);

exports.run = async (t, L) => {
  const shot = async (pg, n) => { if (SHOTS) await pg.screenshot({ path: path.join(SHOTS, 't64_' + n + '.png') }); };
  // ---- 1. Téléphone 390×844 (portrait)
  let pg = await start(L, 390, 844, true);
  let m = await pg.evaluate(MEAS); await shot(pg, 'mob_carte');
  t.check('390×844 : HUD compact actif (body.cmp), trésorerie et date sur une ligne (2 indicateurs, HUD sobre)', m.cmp && m.chips === 2, `${m.chips} indicateurs`);
  t.range('390×844 : hauteur de carte visible et atteignable au doigt', m.frac * 100, 60, 100, ' %', 0);
  t.check('390×844 : aucun débordement horizontal sur la carte', m.sw <= m.W, `${m.sw} px pour ${m.W}`);
  t.check('390×844 : commandes du haut, catégories et outils visibles ≥ 44×44 px', m.small.length === 0, m.small.slice(0, 6).join(', '));
  // un tap au centre de l'écran tombe sur la carte
  const ctr = await pg.evaluate(() => (document.elementFromPoint(innerWidth / 2, innerHeight / 2) || {}).id);
  t.check('390×844 : un tap au centre de l\'écran tombe sur la carte', ctr === 'view', ctr);
  // notifications : file courte, en bas au-dessus de la barre, non bloquantes
  await pg.evaluate(() => { const W = window.WSE; window._uiAct = performance.now(); W.say('Mission accomplie : Ouvrir un petit marché en ville (+200 000 $)', 'bad'); W.say('Zone industrielle : subventions 40 % jusqu\'à 30 % d\'occupation · construction, taxe locale exonérée, loyer foncier réduit.', 'bad'); W.say('Troisième message de test assez long pour voir s\'il tient sur deux lignes au plus dans la file de notifications.', 'bad'); });
  await pg.waitForTimeout(400); m = await pg.evaluate(MEAS); await shot(pg, 'mob_notif');
  const ms = m.msgs, cy = m.H / 2;
  t.check('390×844 : au plus 1 notification visible à la fois', ms.length >= 1 && ms.length <= 1, `${ms.length} visibles`);
  t.check('notifications jamais au centre : sous le milieu de l\'écran, au-dessus de la barre d\'outils, ≤ 2 lignes (≤ 44 px)', ms.every(q => q.t > cy + 0.2 * m.H && q.b <= m.barTop + 1 && q.b - q.t <= 44), JSON.stringify(ms.map(q => [Math.round(q.t), Math.round(q.b)])) + ' barre ' + Math.round(m.barTop));
  t.check('notifications non bloquantes : un tap sur la notification atteint la carte (pointer-events none)', ms.every(q => q.pe === 'none' && q.under === 'view'), JSON.stringify(ms.map(q => q.pe + '/' + q.under)));
  t.range('390×844 : carte visible avec une notification affichée', m.frac * 100, 60, 100, ' %', 0);
  const gone = await pg.evaluate(() => new Promise(r => setTimeout(() => r(document.querySelectorAll('#feed .msg').length), 5300)));
  t.check('notifications auto-masquées en ≈ 5 s sur téléphone', gone === 0, `${gone} restantes après 5,3 s`);
  await pg.evaluate(() => { const W = window.WSE; window._uiAct = performance.now(); W.say('Doublon', 'bad'); W.say('Doublon', 'bad'); });
  const dup = await pg.evaluate(() => document.querySelectorAll('#feed .msg').length);
  t.check('un message identique n\'est pas empilé deux fois', dup === 1, `${dup}`);
  // passe 103 : le bouton ▾ (tableau de bord déplié) et le bouton « Menu » du HUD sont remplacés par le menu vertical (tiroir sur téléphone, bouton en bas à gauche) :
  // les indicateurs sont dans Menu > Ville et économie, le calque et « Nouvelle ville » dans Menu > Réglages et partie (voir t103_menu_vertical).
  await pg.tap2('#vnMob'); await pg.tap2('#vnav [data-vn="city"]'); const mx = await pg.evaluate(() => ({ n: document.querySelectorAll('#ecoBox .eco').length, mac: !!document.getElementById('vnMac') })); await shot(pg, 'mob_deplie');
  t.check('Menu > Ville et économie : le tableau de bord complet (6 indicateurs et macroéconomie) ; calque et nouvelle ville dans Menu > Réglages', mx.n === 6 && mx.mac && await pg.evaluate(() => !!document.querySelector('#panel [data-sec="game"] #lyr') && !!document.getElementById('vnNew')), JSON.stringify(mx));
  await pg.tap2('#pclose'); const mc = await pg.evaluate(MEAS);
  t.check('fermeture : retour au HUD compact, carte ≥ 60 %', mc.chips === 2 && !mc.rank && mc.frac >= 0.6, `${mc.chips} indicateurs, carte ${Math.round(mc.frac * 100)} %`);
  // vues plein écran : bouton Fermer évident (≥ 44 px, en haut), pas de débordement
  const views = [['Menu (Finances)', ['#vnMob', '#vnav [data-vn="fin"]'], '#pclose'], ['vue Produits', ['#vnMob', '#vnav [data-vn="prod"]', '#vnPcards [data-vact="pview"]'], '#pvclose']];
  for (const [n, open, close] of views) {
    for (const o of open) await pg.tap2(o); const c = await closeSize(pg, close); await shot(pg, 'mob_' + close.slice(1));
    t.check(`390×844 : ${n} en plein écran, bouton Fermer ≥ 44 px en haut à droite, sans débordement`, c && c.w >= 44 && c.h >= 44 && c.top < 80 && c.right < 40 && c.sw <= c.W, JSON.stringify(c));
    await pg.tap2(close);
  }
  // fiche d'un bâtiment (Mall voisin : petit marché posé par le code puis ouvert au tap)
  const sp = await pg.evaluate(() => { const W = window.WSE, s = W.mall.spot('s1'); if (!s || !W.place(s.x, s.y, 's1')) return null; W.setTool('view'); W.openBuilding(s.x, s.y); return s; });
  await pg.waitForTimeout(500);
  const cb = await closeSize(pg, '#bview .ph>[data-act="close"]'); await shot(pg, 'mob_fiche');
  t.check('390×844 : fiche d\'un bâtiment en plein écran, bouton Fermer ≥ 44 px, sans débordement', !!sp && cb && cb.w >= 44 && cb.h >= 44 && cb.top < 90 && cb.sw <= cb.W, JSON.stringify(cb));
  await pg.evaluate(() => window.WSE.closeBuilding());
  // gestes au doigt avec un outil de construction : pincer ne pose rien, glisser déplace la carte, tap pose
  const cdp = await pg.context().newCDPSession(pg);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i + 1 })) });
  const n0 = await pg.evaluate(() => { window.WSE.S.cash = 5e8; window.WSE.setTool('s1'); return window.WSE.S.grid.filter(c => c && c.t === 's1').length; });
  const z0 = await pg.evaluate(() => window.WSE.zlv && 0);
  const cx = 195, cyy = 430;
  await touch('touchStart', [[cx - 30, cyy]]); await touch('touchStart', [[cx - 30, cyy], [cx + 30, cyy]]);
  for (let k = 1; k <= 8; k++) await touch('touchMove', [[cx - 30 - k * 8, cyy], [cx + 30 + k * 8, cyy]]);
  await touch('touchEnd', []); await pg.waitForTimeout(300);
  const n1 = await pg.evaluate(() => window.WSE.S.grid.filter(c => c && c.t === 's1').length);
  t.check('pincer avec l\'outil Petit marché : aucun bâtiment posé au contact des doigts', n1 === n0, `${n0} → ${n1}`);
  const cam0 = await pg.evaluate(() => { const p = window.WSE.tileToScreen(40, 40); return [p.x, p.y]; });
  await touch('touchStart', [[cx, cyy]]); for (let k = 1; k <= 8; k++) await touch('touchMove', [[cx + k * 10, cyy + k * 6]]); await touch('touchEnd', []); await pg.waitForTimeout(250);
  const cam1 = await pg.evaluate(() => { const p = window.WSE.tileToScreen(40, 40); return [p.x, p.y]; });
  const n2 = await pg.evaluate(() => window.WSE.S.grid.filter(c => c && c.t === 's1').length);
  t.check('glisser un doigt avec un outil de construction : la carte suit le doigt, rien n\'est posé', Math.hypot(cam1[0] - cam0[0], cam1[1] - cam0[1]) > 40 && n2 === n0, `déplacement ${Math.round(Math.hypot(cam1[0] - cam0[0], cam1[1] - cam0[1]))} px, ${n0} → ${n2}`);
  const sp2 = await pg.evaluate(() => { const W = window.WSE, s = W.mall.spot('s1'); if (!s) return null; W.centerOn(s.x + 0.5, s.y + 0.5); const p = W.tileToScreen(s.x, s.y); return { x: s.x, y: s.y, px: p.x, py: p.y, hit: (document.elementFromPoint(p.x, p.y) || {}).id }; });
  if (sp2) { await touch('touchStart', [[sp2.px, sp2.py]]); await touch('touchEnd', []); await pg.waitForTimeout(400); }
  const n3 = await pg.evaluate(() => window.WSE.S.grid.filter(c => c && c.t === 's1').length);
  t.check('un tap (sans glisser) pose le bâtiment sur la case touchée', !!sp2 && sp2.hit === 'view' && n3 === n0 + 1, JSON.stringify(sp2 && { hit: sp2.hit }) + ` ${n0} → ${n3}`);
  t.check('390×844 : aucune erreur JS', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();

  // ---- 2. Téléphone en paysage 844×390 et tablette 820×1180
  for (const [w, h, n, lo] of [[844, 390, 'paysage 844×390', 45], [820, 1180, 'tablette 820×1180', 60]]) {
    pg = await start(L, w, h, true); await pg.evaluate(() => window.WSE.say('Mission accomplie : test de notification', 'gold')); await pg.waitForTimeout(300);
    const q = await pg.evaluate(MEAS); await shot(pg, (w > h ? 'paysage' : 'tablette') + '_carte');
    t.range(`${n} : hauteur de carte visible`, q.frac * 100, lo, 100, ' %', 0);
    t.check(`${n} : pas de débordement horizontal, cibles tactiles ≥ 44 px, notifications hors du centre et non bloquantes`, q.sw <= q.W && q.small.length === 0 && q.msgs.every(x => x.pe === 'none' && (x.t > q.H * 0.6 || x.b < q.H * 0.35)), `${q.sw}/${q.W} · ${q.small.slice(0, 4).join(', ')} · ${JSON.stringify(q.msgs.map(x => [Math.round(x.t), Math.round(x.b)]))}`);
    if (await pg.evaluate(() => !!document.getElementById('vnMob').offsetParent)) await pg.tap2('#vnMob'); await pg.tap2('#vnav [data-vn="fin"]'); const c = await closeSize(pg, '#pclose'); await pg.tap2('#pclose');   // passe 103 : menu vertical
    t.check(`${n} : Menu ouvert, bouton Fermer ≥ 44 px, sans débordement, aucune erreur JS`, c && c.w >= 44 && c.h >= 44 && c.sw <= c.W && pg.errs.length === 0, JSON.stringify(c) + ' ' + pg.errs.slice(0, 1).join(''));
    await pg.context().close();
  }

  // ---- 3. Bureau 1280×800 : tableau de bord complet, au plus 2 notifications
  pg = await start(L, 1280, 800, false);
  await pg.evaluate(() => { const W = window.WSE; window._uiAct = performance.now(); ['A', 'B', 'C', 'D'].forEach(x => W.say('Message ' + x, 'bad')); });
  const d = await pg.evaluate(MEAS); await shot(pg, 'bureau');
  t.check('bureau : HUD sobre (2 indicateurs, pas de mode compact), au plus 2 notifications, aucune erreur JS', !d.cmp && d.chips === 2 && d.msgs.length <= 2 && pg.errs.length === 0, `${d.chips} indicateurs, ${d.msgs.length} notifications`);
  t.range('bureau 1280×800 : hauteur de carte visible', d.frac * 100, 55, 100, ' %', 0);
  await pg.context().close();
};
