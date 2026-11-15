// Vue « Dessus » (passe 30) : usine en coupe par défaut, zones, ajout d'unité visible, alerte posée sur le convoyeur, cartes de KPI, vue éclatée / assemblée, chargeur de sprites avec repli.
exports.name = 'Vue Dessus : usine en coupe';

const SETUP = `(() => {
  const W = window.WSE, S = W.S, N = W.N; const m = S.macro; m.boom = 0; m.phase = Math.PI; m.gdp = 0.03; m.infl = 0.02; m.rate = 0.04;
  const put = (k, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } };
  const f = put('f2', 66, 84, 54, 84); put('port', 66, 84, 54, 84); for (let i = 0; i < 40; i++) put('res', 14, 44, 14, 44); put('s2', 14, 44, 14, 44);
  W.assignRecipe('steel', 2); f.src = { iron: 'local', coal: 'local' }; f.wage = 2;
  const pre = () => { S.macro.phase = Math.PI; S.macro.boom = 0; S.cash = Math.max(S.cash, 5e9); ['iron', 'coal'].forEach(g => { S.stock[g] = 1e9; S.price[g] = W.GOODS[g].base * (S.cpi || 1); }); };
  window.B = { W, S, f, pre };
  for (let i = 0; i < 25; i++) { pre(); W.step(); }
})()`;
const bench = async (L, o) => { o = o || {}; const pg = await L.newPage({ w: o.w || 1280, h: o.h || 900, wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP); await pg.addStyleTag({ content: '#modesel,#win,#endscr{display:none!important}' }); return pg; };
// somme des pixels d'une zone du canevas (détection de changement visible) et nombre de pixels d'une couleur
const PIX = `window.PIX = (cx, cy, r) => { const cv = document.getElementById('bscene'), g = cv.getContext('2d'), x = Math.max(0, Math.round(cx - r)), y = Math.max(0, Math.round(cy - r)), w = Math.min(cv.width - x, 2 * r), h = Math.min(cv.height - y, 2 * r), d = g.getImageData(x, y, w, h).data; let s = 0, red = 0, mag = 0; for (let i = 0; i < d.length; i += 4) { s = (s * 31 + d[i] + 3 * d[i + 1] + 7 * d[i + 2]) % 1000003; if (d[i] > 200 && d[i + 1] < 90 && d[i + 2] < 100) red++; if (d[i] > 220 && d[i + 1] < 40 && d[i + 2] > 220) mag++; } return { s, red, mag }; };`;

exports.run = async (t, L) => {
  // 1. Vue Dessus par défaut, zones, boutons
  let pg = await bench(L); await pg.evaluate(PIX);
  const a = await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 700)); const sc = W.scene, F = W.fac;
    return { ang: sc.ang, top: !!sc.top, pressed: (document.querySelector('#bcam [data-ang][aria-pressed="true"]') || {}).dataset.ang, order: [...document.querySelectorAll('#bcam [data-ang]')].map(b => b.dataset.ang).join(','), zones: F.FZ.map(z => z.n).join(','), expl: F.expl, exb: !!document.querySelector('#bcam [data-cam="explode"]').offsetParent,
      cards: sc.cardRects ? sc.cardRects.length : 0, kpi: (document.getElementById('bvit').textContent || '').replace(/\s+/g, ' '), walls: sc.wallSegs.length, slots: F.FG_SLOTS.length, nTrees: 0 }; });
  t.check('la vue « Dessus » est la vue par défaut à l\'ouverture de l\'intérieur (Garage reste disponible, en second)', a.ang === 'top' && a.top && a.pressed === 'top' && a.order === 'top,iso,garage', `${a.ang} · ${a.order}`);
  t.check('les quatre zones sont présentes (ACHATS, FABRICATION, VENTE, BUREAU) et les 12 emplacements du plan ont une position', a.zones === 'ACHATS,FABRICATION,VENTE,BUREAU' && a.slots === 12 && a.walls > 10, `${a.zones} · ${a.slots} emplacements · ${a.walls} pans de mur`);
  t.check('vue éclatée par défaut avec le bouton « Vue assemblée » ; cartes de KPI ancrées sur les zones et carte marge / satisfaction / temps de cycle', a.expl === true && a.exb && a.cards >= 4 && /Marge nette/i.test(a.kpi) && /satisfaction/i.test(a.kpi) && /cycle/i.test(a.kpi), `${a.cards} cartes · ${a.kpi.slice(0, 120)}`);
  const k = await pg.evaluate(() => { const { W, f } = window.B, sc = W.scene, I = W.fac.info(sc, f), o = {}; ['mat', 'mg', 'sat', 'lvl', 'cyc', 'cov'].forEach(x => { o[x] = I[x]; }); o.finite = ['mat', 'mg', 'sat', 'lvl', 'cyc'].every(x => Number.isFinite(I[x])); o.rng = I.sat >= 0 && I.sat <= 1 && I.lvl >= 0 && I.lvl <= 1; return o; });
  t.check('les cartes de KPI lisent de vraies valeurs : coût matière, marge, satisfaction (0-1), niveau de réserve (0-1), temps de cycle', k.finite && k.rng && k.mat > 0, JSON.stringify({ mat: +k.mat.toFixed(2), mg: +k.mg.toFixed(2), sat: +k.sat.toFixed(2), lvl: +k.lvl.toFixed(2), cyc: +k.cyc.toFixed(2) }));
  // 2. Un clic sur une zone ouvre le menu de la case : ACHATS -> porte d'entrée, VENTE -> porte de sortie, plot -> case du sol
  const pts = await pg.evaluate(() => { const { W, f } = window.B, sc = W.scene, sr = document.getElementById('bsw').getBoundingClientRect(), out = {};
    const scr = (x, y, z) => { const p = sc.M(x, y, z || 0); return [sr.left + p[0], sr.top + p[1]]; };
    out.achats = scr(5.5, 9.5, 0); out.vente = scr(25.7, 11.2, 0); out.rack = scr(W.fac.FG_SLOTS[0].c[0], W.fac.FG_SLOTS[0].c[1], 25); out.mach = scr(W.fac.FG_SLOTS[1].c[0], W.fac.FG_SLOTS[1].c[1], 25); return out; });
  const menu = async (xy) => { await pg.mouse.move(xy[0], xy[1]); await pg.waitForTimeout(120); await pg.mouse.click(xy[0], xy[1]); await pg.waitForTimeout(300); return pg.evaluate(() => (document.querySelector('#bpop .plsel b') || {}).textContent || ''); };
  const mA = await menu(pts.achats), mV = await menu(pts.vente), mR = await menu(pts.rack), mM = await menu(pts.mach);
  t.check('clic sur la zone ACHATS = menu de la porte d\'entrée (Case 7) ; clic sur la zone VENTE = porte de sortie (Case 10)', /Porte d'entrée 1 \(Case 7\)/.test(mA) && /Porte de sortie 1 \(Case 10\)/.test(mV), `${mA} | ${mV}`);
  t.check('clic sur un rack = menu de la case de stock (Case 1) ; clic sur une machine = menu de sa case (Case 2)', /^Case 1 · Stock/.test(mR) && /^Case 2 · Machine/.test(mM), `${mR} | ${mM}`);
  t.check('aucune erreur de page (vue Dessus)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();

  // 3. Ajouter une unité fait apparaître l'objet correspondant (stock -> rack, machine, robot, quai de vente + camion)
  pg = await bench(L); await pg.evaluate(PIX);
  const add = await pg.evaluate(async () => { const { W, f } = window.B; f.lvl = 3; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 600)); const sc = () => W.scene, F = W.fac, out = {};
    const hashAt = (i, z) => { const p = sc(), c = F.FG_SLOTS[i].c; return window.PIX(p.ox + (c[0] - c[1]) * p.tw / 2, p.oy + (c[0] + c[1]) * p.tw / 4 - z * p.zs, 70).s; };
    const frame = async () => { W.sceneFrame(0.03); W.sceneFrame(0.03); await new Promise(r => setTimeout(r, 60)); };
    for (const [i, u] of [[3, 'stock'], [2, 'make'], [5, 'robot']]) { await frame(); const h0 = hashAt(i, 30); const ok = u === 'robot' ? W.planAdd(f, i, u, 'rweld') : W.planAdd(f, i, u); await frame(); out[u] = { ok, changed: h0 !== hashAt(i, 30) }; }
    // quai d'achat et quai de vente : cases 7 et 10
    const piles = () => { const p = sc(), z = 0, x = 6.4 + 2.7, y = 9; return window.PIX(p.ox + (x - y) * p.tw / 2, p.oy + (x + y) * p.tw / 4, 70).s; };
    await frame(); const p0 = piles(); const okb = W.planAdd(f, 7, 'buy'); await frame(); out.buy = { ok: okb, changed: p0 !== piles() };
    const dock = () => { const p = sc(), x = 26.2, y = 16.6; return window.PIX(p.ox + (x - y) * p.tw / 2, p.oy + (x + y) * p.tw / 4, 80).s; };
    await frame(); const d0 = dock(); const oks = W.planAdd(f, 10, 'sell'); for (let i = 0; i < 160; i++) W.sceneFrame(0.05); await frame(); out.sell = { ok: oks, changed: d0 !== dock(), truck: !!(sc().trucks[10] && sc().trucks[10].d > 0.02) };
    out.pl = W.planOf(f).join(','); return out; });
  t.check('ajouter un stock fait apparaître un rack, une machine sa machine, un robot son bras (l\'image du plot change)', add.stock.ok && add.stock.changed && add.make.ok && add.make.changed && add.robot.ok && add.robot.changed, JSON.stringify([add.stock, add.make, add.robot]));
  t.check('ajouter une ligne d\'achat fait apparaître les matières ; ajouter une ligne de vente fait apparaître le quai et son camion', add.buy.ok && add.buy.changed && add.sell.ok && add.sell.changed && add.sell.truck, JSON.stringify([add.buy, add.sell]) + ' ' + add.pl);
  await pg.context().close();

  // 4. Alerte posée SUR le convoyeur de l'intrant manquant (hachuré rouge) + étiquette cliquable
  pg = await bench(L); await pg.evaluate(PIX);
  const al = await pg.evaluate(async () => { const { W, S, f, pre } = window.B; for (let i = 0; i < 25; i++) { pre(); S.stock.iron = 0; S.stock.coal = 0; W.step(); }
    W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 900)); const sc = W.scene, F = W.fac, h = (sc.alList || []).find(x => x.kind === 'in'), at = h && F.alertAt(sc, f, h), seg = at && at.segs && at.segs[0];
    const mid = seg ? [(seg[0][0] + seg[1][0]) / 2, (seg[0][1] + seg[1][1]) / 2] : [0, 0], px = sc.ox + (mid[0] - mid[1]) * sc.tw / 2, py = sc.oy + (mid[0] + mid[1]) * sc.tw / 4;
    const r1 = window.PIX(px, py, 40), hit = (sc.hits || []).find(x => x.kind === 'in');
    return { has: !!h, seg: !!seg, onFeeder: !!seg && Math.abs(seg[0][0] - F.FG_SLOTS[6].c[0]) < 0.01, red: r1.red, hit: !!hit, lim: f.limit }; });
  t.check('alerte « intrant manquant » : posée sur le convoyeur de l\'intrant (tronçon de la ligne d\'achat) et zone rouge hachurée visible', al.has && al.seg && al.onFeeder && al.red > 150, `limite ${al.lim} · pixels rouges ${al.red}`);
  const ph = await pg.evaluate(() => { const sc = window.WSE.scene, h = sc.hits.find(x => x.kind === 'in'), rc = document.getElementById('bsw').getBoundingClientRect(); const x = rc.left + (h.x0 + h.x1) / 2, y = rc.top + (h.y0 + h.y1) / 2, el = document.elementFromPoint(x, y); return { x, y, el: el ? (el.id || el.tagName + '.' + el.className) : null, h: [h.x0, h.y0, h.x1, h.y1].map(Math.round), n: sc.hits.length }; });
  await pg.mouse.move(ph.x, ph.y); await pg.waitForTimeout(150); await pg.mouse.click(ph.x, ph.y); await pg.waitForTimeout(350);
  const am = await pg.evaluate(() => [...document.querySelectorAll('#bpop [data-act]')].map(b => b.dataset.act));
  t.check('l\'étiquette d\'alerte posée sur le convoyeur ouvre le menu d\'actions (sources automatiques, fournisseur, import)', am.includes('alr:auto') && am.some(x => /^opensup:/.test(x)) && am.some(x => /^alr:port:/.test(x)), am.join(' ') + ' | ' + JSON.stringify(ph));
  await pg.context().close();

  // 5. Vue éclatée / assemblée : bouton, murs hauts et toit en assemblée, plan toujours éditable
  pg = await bench(L); await pg.evaluate(PIX);
  const ex = await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 500)); const o = {}; o.a = { ex: W.scene.ex, h: W.scene.wallSegs[0].h }; W.camCmd('explode'); await new Promise(r => setTimeout(r, 400)); o.b = { ex: W.scene.ex, h: W.scene.wallSegs[0].h, txt: document.querySelector('#bcam [data-cam="explode"]').textContent, expl: W.fac.expl };
    const sr = document.getElementById('bsw').getBoundingClientRect(), p = W.scene.M(W.fac.FG_SLOTS[1].c[0], W.fac.FG_SLOTS[1].c[1], 25); o.pt = [sr.left + p[0], sr.top + p[1]]; return o; });
  t.check('« Vue assemblée » : murs hauts (toit) ; « Vue éclatée » : murs bas, zones séparées ; le bouton bascule', ex.a.ex === true && ex.b.ex === false && ex.b.h > ex.a.h * 2 && /éclatée/.test(ex.b.txt), `${ex.a.h} → ${ex.b.h} px · ${ex.b.txt}`);
  await pg.mouse.move(ex.pt[0], ex.pt[1]); await pg.waitForTimeout(120); await pg.mouse.click(ex.pt[0], ex.pt[1]); await pg.waitForTimeout(300);
  const ma = await pg.evaluate(() => (document.querySelector('#bpop .plsel b') || {}).textContent || '');
  t.check('les unités du plan restent éditables en vue assemblée (clic sur la machine = menu de la case)', /^Case 2 · Machine/.test(ma), ma);
  await pg.context().close();

  // 6. Chargeur de sprites facultatif : un PNG remplace le dessin vectoriel, sinon repli vectoriel (aucune erreur)
  pg = await bench(L); await pg.evaluate(PIX);
  const sp = await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 900)); const F = W.fac, o = {};
    o.names = F.FAC_NAMES.join(','); o.n = F.FAC_NAMES.slice(0, 29).length; o.nAll = F.FAC_NAMES.length; o.active = F.FAC_NAMES.filter(n => F.img(n)).length; o.bad = F.load('inconnu', 'data:image/png;base64,AAAA');
    o.anch = !!(F.FAC_SPEC.rack_stockage && F.FAC_SPEC.rack_stockage.ancre_x > 0 && F.FAC_SPEC.camion_blanc.echelle_px_par_m > 0);
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 96; const q = cv.getContext('2d'); q.fillStyle = '#ff00ff'; q.fillRect(0, 0, 64, 96); const uri = cv.toDataURL('image/png');
    o.before = window.PIX(W.scene.W * 0.5, W.scene.H * 0.5, 900).mag;
    o.ok = F.load('arbre', uri); await new Promise(r => setTimeout(r, 700)); for (let i = 0; i < 3; i++) W.sceneFrame(0.03); await new Promise(r => setTimeout(r, 100));
    o.mag = window.PIX(W.scene.W * 0.5, W.scene.H * 0.5, 900).mag;
    // repli : tous les sprites retirés -> dessin vectoriel complet, aucune erreur, image non vide
    F.FAC_NAMES.forEach(n => F.unload(n)); await new Promise(r => setTimeout(r, 600)); for (let i = 0; i < 3; i++) W.sceneFrame(0.03); await new Promise(r => setTimeout(r, 100));
    o.left = F.FAC_NAMES.filter(n => F.img(n)).length; o.vec = window.PIX(W.scene.W * 0.5, W.scene.H * 0.5, 600); o.magAfter = window.PIX(W.scene.W * 0.5, W.scene.H * 0.5, 900).mag; o.top = W.scene.top;
    return o; });
  t.check('chargeur de sprites : 29 noms (bobines, plaques, palettes, racks, camions et camions ouverts, convoyeurs, machine, presse, robot, ouvriers, bureau, arbre, buisson, herbe, sol, quai, chariot...) avec leurs ancres', sp.n === 29 && sp.nAll >= 29 && /rack_stockage/.test(sp.names) && /camion_bleu_ouvert/.test(sp.names) && /quai_chargement/.test(sp.names) && sp.anch && sp.bad === false, sp.names.slice(0, 80));
  t.check('les sprites embarqués sont actifs dans la vue Dessus (≥ 25 sur 29) ; un PNG chargé (arbre) remplace le dessin des arbres', sp.active >= 25 && sp.ok && sp.mag > 800 && sp.before === 0, `actifs ${sp.active} · pixels magenta ${sp.before} → ${sp.mag}`);
  t.check('repli vectoriel : sans aucun sprite la vue se redessine entièrement en vectoriel, sans erreur', sp.left === 0 && sp.top && sp.vec.s > 0 && sp.magAfter === 0, `sprites restants ${sp.left}`);
  t.check('aucune erreur de page (sprites)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();

  // 7. Mobile 390x844 : la vue Dessus se construit, plein écran, clic sur une zone
  pg = await bench(L, { w: 390, h: 844 }); await pg.evaluate(PIX);
  const mo = await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 500)); W.immEnter(f); await new Promise(r => setTimeout(r, 900)); const sc = W.scene, sr = document.getElementById('bsw').getBoundingClientRect(); const p = sc.M(W.fac.FG_SLOTS[1].c[0], W.fac.FG_SLOTS[1].c[1], 25); return { ang: sc.ang, mob: sc.mob, vw: Math.round(sr.width), vh: Math.round(sr.height), pt: [sr.left + p[0], sr.top + p[1]], inView: p[0] > 0 && p[0] < sr.width && p[1] > 0 && p[1] < sr.height }; });
  await pg.mouse.click(mo.pt[0], mo.pt[1]); await pg.waitForTimeout(300); const mm = await pg.evaluate(() => (document.querySelector('#bpop .plsel b') || {}).textContent || '');
  t.check('mobile 390×844 : vue Dessus en plein écran, machine visible et un tap ouvre le menu de sa case', mo.ang === 'top' && mo.mob && mo.vw === 390 && mo.inView && /^Case 2 · Machine/.test(mm), `${mo.vw}×${mo.vh} · ${mm}`);
  t.check('aucune erreur de page (mobile)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
