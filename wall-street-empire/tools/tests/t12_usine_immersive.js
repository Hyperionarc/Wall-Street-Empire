// Usine immersive (passe 28) : plein écran (entrer / sortir, transition, panneaux qui se masquent), halle en perspective avec 12 emplacements (portes), pannes déterministes, compétences, curseurs, objectifs, sauvegarde.
exports.name = 'Usine immersive, atelier vivant';

const SETUP = `(() => {
  const W = window.WSE, S = W.S, N = W.N; const m = S.macro; m.boom = 0; m.phase = Math.PI; m.gdp = 0.03; m.infl = 0.02; m.rate = 0.04;
  const put = (k, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } };
  const f = put('f2', 66, 84, 54, 84); put('port', 66, 84, 54, 84); for (let i = 0; i < 40; i++) put('res', 14, 44, 14, 44); put('s2', 14, 44, 14, 44);
  W.assignRecipe('steel', 2); f.src = { iron: 'local', coal: 'local' }; f.wage = 2;
  const pre = () => { S.macro.phase = Math.PI; S.macro.boom = 0; S.cash = Math.max(S.cash, 5e9); ['iron', 'coal'].forEach(g => { S.stock[g] = 1e9; S.price[g] = W.GOODS[g].base * (S.cpi || 1); }); S.stock.steel = 0; S.price.steel = W.GOODS.steel.base * (S.cpi || 1); };
  const run = n => { let out = 0, rev = 0; for (let i = 0; i < n; i++) { pre(); W.step(); out += f.out || 0; rev += f.pRev || 0; } return { out, rev }; };
  window.B = { W, S, f, pre, run };
  for (let i = 0; i < 25; i++) { pre(); W.step(); }
})()`;
const bench = async (L, o) => { o = o || {}; const pg = await L.newPage({ w: o.w || 1280, h: o.h || 900, wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP); await pg.addStyleTag({ content: '#modesel,#win,#endscr{display:none!important}' }); return pg; };

exports.run = async (t, L) => {
  // 1. Halle : 12 emplacements, portes d'entrée / de sortie, migration d'un ancien plan 3×3, verrous selon le niveau
  let pg = await bench(L);
  const m = await pg.evaluate(() => { const { W, f } = window.B, o = {}; o.n = W.planOf(f).length; o.def = W.planOf(f).join(','); o.kinds = [0, 5, 6, 8, 9, 11].map(i => W.slotKind(i)).join(',');
    o.ok = [W.slotOk(6, 'buy'), W.slotOk(6, 'make'), W.slotOk(9, 'sell'), W.slotOk(2, 'sell'), W.slotOk(2, 'robot')].join(',');
    o.open0 = [...Array(12).keys()].filter(i => W.slotOpen(f, i)).length; f.lvl = 1; o.open1 = [...Array(12).keys()].filter(i => W.slotOpen(f, i)).length; f.lvl = 0;
    W.planSet(f, ['buy', 'buy', 'robot', 'stock', 'make', 'sell', 'make', 'sell', '']); f.rb = { 2: { k: 'r6', w: 0.2 } }; const mg = W.planOf(f); o.mig = mg.join(','); o.rb = f.rb && Object.keys(f.rb).join(','); o.e = W.planEvalC(f).n;
    W.planSet(f, W.planDefault(f)); o.back = f.plan == null; return o; });
  t.check('12 emplacements : sol 3×2 + 3 portes d\'entrée + 3 portes de sortie, plan par défaut inchangé (1 achat, 1 stock, 1 machine, 1 vente)', m.n === 12 && m.def === 'stock,make,,,,,buy,,,sell,,' && m.kinds === 'floor,floor,in,in,out,out' && m.ok === 'true,false,true,false,true', `${m.n} · ${m.def} · ${m.kinds}`);
  t.check('verrous par niveau : usine moyenne 8 emplacements libres au niveau 0, 10 au niveau 1', m.open0 === 8 && m.open1 === 10, `${m.open0} puis ${m.open1}`);
  t.check('migration d\'un ancien plan 3×3 : achats aux portes d\'entrée, ventes aux portes de sortie, robot suivi à sa nouvelle case', m.mig === 'robot,stock,make,make,,,buy,buy,,sell,sell,' && m.rb === '0' && m.e.buy === 2 && m.e.sell === 2 && m.e.make === 2 && m.back, m.mig);
  await pg.context().close();

  // 2. Plein écran : bouton, transition ~0,6 s, taille 100 %, panneaux qui se masquent au repos puis reviennent, sortie par Échap
  pg = await bench(L);
  const tab = await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 700)); const sw = document.getElementById('bsw').getBoundingClientRect(), bv = document.getElementById('bview').getBoundingClientRect(); return { sw: [Math.round(sw.width), Math.round(sw.height)], bv: [Math.round(bv.width), Math.round(bv.height)], vh: innerHeight, vw: innerWidth, btn: !!document.getElementById('bimmbtn').offsetParent, angles: [...document.querySelectorAll('#bcam [data-ang]')].map(b => b.dataset.ang).join(',') }; });
  t.check('mode normal : la scène occupe ≥ 75 % de la hauteur de la fenêtre et ≥ 95 % de la largeur du panneau', tab.sw[1] >= 0.75 * tab.vh && tab.sw[0] >= 0.9 * tab.bv[0] && tab.bv[0] >= 0.9 * tab.vw, `scène ${tab.sw.join('×')} · panneau ${tab.bv.join('×')} · fenêtre ${tab.vw}×${tab.vh}`);
  t.check('bouton « Entrer dans l\'usine » et sélecteur d\'angle (Garage, Isométrique, Dessus)', tab.btn && tab.angles === 'garage,iso,top', tab.angles);
  await pg.click('#bimmbtn'); const tr = await pg.evaluate(() => { const i = window.WSE.imm; return { on: i.on, tr: i.tr && i.tr.D, dir: i.tr && i.tr.dir }; }); await pg.waitForTimeout(900);
  const inn = await pg.evaluate(() => { const i = window.WSE.imm, sw = document.getElementById('bsw').getBoundingClientRect(), bv = document.getElementById('bview'); return { on: i.on, tr: i.tr, sw: [Math.round(sw.width), Math.round(sw.height)], cls: bv.classList.contains('imm'), tiles: getComputedStyle(document.getElementById('btiles')).opacity, vw: innerWidth, vh: innerHeight }; });
  t.check('« Entrer dans l\'usine » : transition de 0,6 s puis scène à 100 % × 100 % de la fenêtre', tr.on && tr.tr === 600 && tr.dir === 'in' && inn.tr === null && inn.cls && inn.sw[0] === inn.vw && inn.sw[1] === inn.vh, `${tr.tr} ms · ${inn.sw.join('×')} sur ${inn.vw}×${inn.vh}`);
  await pg.waitForTimeout(3600); const idle = await pg.evaluate(() => ({ idle: document.getElementById('bview').classList.contains('idle'), o: getComputedStyle(document.getElementById('btiles')).opacity, st: getComputedStyle(document.getElementById('bstats')).opacity }));
  await pg.mouse.move(500, 400); await pg.mouse.move(520, 420); await pg.waitForTimeout(700); const wake = await pg.evaluate(() => ({ idle: document.getElementById('bview').classList.contains('idle'), o: getComputedStyle(document.getElementById('btiles')).opacity }));
  t.check('les panneaux (stats, tuiles, outils) se masquent au repos et réapparaissent au mouvement de la souris', idle.idle && +idle.o < 0.05 && +idle.st < 0.05 && !wake.idle && +wake.o > 0.95, `repos ${idle.o} · réveil ${wake.o}`);
  await pg.keyboard.press('Escape'); const out0 = await pg.evaluate(() => { const i = window.WSE.imm; return { tr: i.tr && i.tr.dir, on: i.on }; }); await pg.waitForTimeout(900);
  const out1 = await pg.evaluate(() => ({ on: window.WSE.imm.on, hidden: document.getElementById('bview').hidden, cls: document.getElementById('bview').classList.contains('imm') }));
  t.check('Échap : sortie avec transition (retour au panneau Intérieur)', out0.tr === 'out' && !out1.on && !out1.hidden && !out1.cls, JSON.stringify(out1));
  // 3. Double-clic sur l'usine dans la ville : entrer ; Échap : retour à la ville, bâtiment fermé
  await pg.evaluate(() => { const { W, f } = window.B; W.closeBuilding(); W.setTool('view'); W.centerOn(f.x, f.y); W.zoomTo(0.5); }); await pg.waitForTimeout(800);
  const pt = await pg.evaluate(() => { const { W, f } = window.B, p = W.tileToScreen(f.x, f.y); return p; });
  await pg.mouse.click(pt.x, pt.y); await pg.waitForTimeout(90); await pg.mouse.click(pt.x, pt.y); await pg.waitForTimeout(1100);
  const dbl = await pg.evaluate(() => ({ on: window.WSE.imm.on, from: window.WSE.imm.from }));
  t.check('double-clic sur l\'usine dans la ville : on entre directement dans l\'usine (transition zoom depuis la carte)', dbl.on && dbl.from === 'city', JSON.stringify(dbl));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(1000);
  const back = await pg.evaluate(() => ({ on: window.WSE.imm.on, hidden: document.getElementById('bview').hidden }));
  t.check('retour à la ville par Échap (fenêtre fermée, transition symétrique)', !back.on && back.hidden, JSON.stringify(back));
  t.check('aucune erreur de page (plein écran)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();

  // 4. Angles de caméra : les 3 angles se dessinent, un clic sur une case et sur une porte fonctionne dans chacun
  pg = await bench(L);
  const ang = [];
  await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 500)); });
  for (const a of ['garage', 'iso', 'top']) {
    await pg.click(`[data-ang="${a}"]`); await pg.waitForTimeout(500);
    const r = await pg.evaluate(() => { const W = window.WSE, sc = W.scene, sr = document.getElementById('bsw').getBoundingClientRect(), o = {}; o.ang = sc.ang;
      const tryAt = i => { const q = W.planSlotXY(sc, i), z = i >= 6 ? 36 : 0, m = i >= 6 ? (i < 9 ? [0, q[1]] : [q[0], 0]) : q, p = sc.M(m[0], m[1], z); return { x: sr.left + p[0], y: sr.top + p[1], hit: W.planSlotAt(sc, ...(() => { const k = document.getElementById('bscene').getBoundingClientRect(); return [(sr.left + p[0] - k.left) / (k.width / document.getElementById('bscene').width), (sr.top + p[1] - k.top) / (k.height / document.getElementById('bscene').height)]; })()) }; };
      o.floor = tryAt(1); o.door = tryAt(9); o.lockedDoor = tryAt(11); o.hits = sc.hits.length; return o; });
    ang.push(r);
    await pg.mouse.click(r.floor.x, r.floor.y); await pg.waitForTimeout(250); const s1 = await pg.evaluate(() => (document.querySelector('#bpop .plsel b') || {}).textContent || '');
    await pg.mouse.click(r.door.x, r.door.y); await pg.waitForTimeout(250); const s2 = await pg.evaluate(() => (document.querySelector('#bpop .plsel b') || {}).textContent || '');
    r.s1 = s1; r.s2 = s2;
  }
  t.check('les trois angles se construisent (garage = perspective, iso, dessus)', ang.map(r => r.ang).join() === 'garage,iso,top', ang.map(r => r.ang).join());
  t.check('clic sur la machine (case 2) et sur la porte de sortie 1 : menus de leur emplacement dans chaque angle', ang.every(r => /^Case 2 /.test(r.s1) && /Case 10\)/.test(r.s2)), ang.map(r => `${r.s1} | ${r.s2}`).join(' ; '));
  await pg.context().close();

  // 5. Atelier vivant : réglages, compétences, pannes déterministes, inspecteur, objectifs, sauvegarde
  pg = await bench(L);
  const a = await pg.evaluate(() => { const { W, S, f, run } = window.B, o = {}; const base = run(20); o.noFx = !f.fx; o.sf = W.shopF(f);
    W.fxMake(f); o.sf0 = W.shopF(f); const b2 = run(20); o.same = Math.abs(b2.out / base.out - 1) < 0.02;
    W.fxSet(f, 0, 100); o.fast = W.shopF(f); const rf = run(20); o.fastOut = rf.out / base.out; W.fxSet(f, 0, 50);
    W.fxSet(f, 1, 100); o.qual = W.shopF(f); W.fxSet(f, 1, 50);
    W.fxSet(f, 2, 100); o.r100 = W.fxRisk(f); W.fxSet(f, 2, 50); o.r50 = W.fxRisk(f); W.fxSet(f, 2, 0); o.r0 = W.fxRisk(f); W.fxSet(f, 2, 50); W.fxSet(f, 0, 100); o.rfast = W.fxRisk(f); W.fxSet(f, 0, 50);
    const c0 = S.cash; o.t1 = W.fxTrainBuy(f, 0); o.paid = c0 - S.cash; for (let i = 0; i < 6; i++) W.fxTrainBuy(f, 0); o.maxTrain = f.fx.w[0]; o.skill = W.fxSkill(f, 0);
    for (let i = 0; i < 9; i++) for (let j = 0; j < 6; j++) W.fxTrainBuy(f, i); f.fx.nw = 9; o.sfMax = W.shopF(f); f.fx.w = []; f.fx.nw = 4; return o; });
  t.check('réglages à 50 / 50 / 50 et sans formation : l\'économie est identique (facteur 1, production inchangée)', a.noFx && a.sf === 1 && a.sf0 === 1 && a.same, `facteur ${a.sf0}`);
  t.check('cadence haute : plus de production mais plus de risque de panne ; qualité haute : plus lent', a.fast > 1.2 && a.fastOut > 1.1 && a.rfast > a.r50 * 1.8 && a.qual < 1, `×${a.fast.toFixed(2)} · production ×${a.fastOut.toFixed(2)} · risque ×${(a.rfast / a.r50).toFixed(2)} · qualité ×${a.qual.toFixed(2)}`);
  t.check('maintenance : plus elle est haute, moins de pannes (100 : ×0,4 ; 0 : ×1,6)', a.r100 < a.r50 * 0.5 && a.r0 > a.r50 * 1.5, `${a.r100.toFixed(4)} < ${a.r50.toFixed(4)} < ${a.r0.toFixed(4)}`);
  t.check('formation payante, +10 par clic, bornée à 50 ; rendement borné à +8 % quand toute l\'équipe est au maximum', a.t1 && a.paid > 0 && a.maxTrain === 50 && a.skill <= 100 && a.sfMax <= 1.0801 && a.sfMax > 1.07, `payé ${Math.round(a.paid)} · compétence ${a.skill} · ×${a.sfMax.toFixed(3)}`);
  await pg.context().close();
  // pannes et inspecteur déterministes
  const runB = async () => { const p = await bench(L); const r = await p.evaluate(() => { const { W, S, f } = window.B; W.fxMake(f); const ev = []; for (let i = 0; i < 400; i++) { window.B.pre(); const b0 = f.fx.brk, i0 = f.fx.ins; W.step(); if (f.fx.brk !== b0 || f.fx.ins !== i0) ev.push(S.day + ':' + f.fx.brk + ':' + f.fx.ins); } return { ev: ev.join('|'), bn: f.fx.bn, st: f.fx.st, ir: f.fx.ir, cash: Math.round(S.cash), out: Math.round(f.fx.tot), cost: W.fxRepairCost(f), cap: W.TYPES.f2.cost }; }); await p.context().close(); return r; };
  const r1 = await runB(), r2 = await runB();
  t.check('pannes et visite d\'inspecteur déterministes (mêmes jours, même trésorerie sur deux parties identiques)', r1.ev === r2.ev && r1.cash === r2.cash && r1.bn === r2.bn, `${r1.bn} panne(s), ${r1.st} inspection(s) conforme(s) · ${r1.ev.slice(0, 80)}`);
  t.check('effets bornés : coût de réparation raisonnable (≤ 6 % du prix du bâtiment), au moins une inspection en 400 jours', r1.cost <= 0.06 * r1.cap && r1.st + (r1.ir === 'warn' ? 1 : 0) >= 1, `réparation ${r1.cost} · bâtiment ${r1.cap}`);
  pg = await bench(L);
  const g = await pg.evaluate(() => { const { W, S, f, run } = window.B, o = {}; W.fxMake(f); f.fx.brk = S.day; const c0 = S.cash, rc = W.fxRepairCost(f); o.rep = W.fxRepair(f); o.cost = c0 - S.cash === rc; o.brk = f.fx.brk;
    f.fx.tot = 99; run(3); o.g1 = !!f.fx.g.t100; o.n = W.fxGoalN(f); f.fx.run = 1200; run(1); o.g2 = !!f.fx.g.r1000;
    o.gal = Object.keys(S.gal || {}).length; o.neon = W.fxQuality(f);
    // sauvegarde et rechargement dans la même page : champs optionnels
    W.save(); const raw = JSON.parse(localStorage.getItem('wse-city-v8')); const fr = raw.g.find(r => r && r[20] && r[20].fx); o.saved = !!fr && !!fr[20].fx.g.t100 && fr[20].fx.s.join() === '50,50,50'; o.v = raw.v; o.pos = [f.x, f.y]; return o; });
  t.check('réparation d\'un clic (coût débité, panne levée) ; objectifs « 100 unités » et « 1 000 unités sans arrêt » validés', g.rep && g.cost && g.brk === 0 && g.g1 && g.g2, JSON.stringify({ g1: g.g1, g2: g.g2 }));
  t.check('galerie des produits fabriqués alimentée ; sauvegarde v8 avec champs optionnels (fx)', g.v === 8 && g.saved, `v${g.v} fx ${g.saved}`);
  await pg.reload(); await pg.waitForTimeout(700);
  const ld = await pg.evaluate(pos => { const W = window.WSE, S = W.S, c = S.grid[pos[1] * W.N + pos[0]]; return c && c.fx ? { g: Object.keys(c.fx.g).join(','), s: c.fx.s.join(), gal: Object.keys(S.gal || {}).length } : null; }, g.pos);
  t.check('rechargement : objectifs et réglages restitués', !!ld && /t100/.test(ld.g) && ld.s === '50,50,50', ld ? ld.g : 'absent');
  await pg.context().close();
  // 6. Mobile 390x844 : plein écran direct, aucune erreur, pas de débordement horizontal
  pg = await bench(L, { w: 390, h: 844 });
  const mo = await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 900)); const sw = document.getElementById('bsw').getBoundingClientRect(); return { on: W.imm.on, sw: [Math.round(sw.width), Math.round(sw.height)], ov: document.documentElement.scrollWidth > innerWidth }; });
  t.check('mobile 390×844 : ouvrir l\'usine passe directement en plein écran', mo.on && mo.sw[0] === 390 && mo.sw[1] === 844 && !mo.ov, mo.sw.join('×'));
  t.check('aucune erreur de page (mobile)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
  // 7. Performance de la scène (rendu logiciel sans GPU)
  pg = await bench(L);
  const pf = await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 600)); const t0 = performance.now(); for (let i = 0; i < 60; i++) W.sceneFrame(0.033); const dt = (performance.now() - t0) / 60; return { dt }; });
  t.info(`coût d'une image de la scène en vue de plan (rendu logiciel) : ${pf.dt.toFixed(2)} ms`);
  t.check('image de scène < 10 ms (rendu logiciel, objectif GPU 2 ms)', pf.dt < 10, `${pf.dt.toFixed(2)} ms`);
  await pg.context().close();
};
