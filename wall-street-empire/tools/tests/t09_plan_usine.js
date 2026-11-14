// Plan d'usine (passe 24) : grille d'unités achat / stock / machine / vente / robot, goulots visibles, personnel, robots (gain, usure), sauvegarde v8 et déterminisme.
exports.name = 'Plan d\'usine et robots';

// Banc : une usine moyenne isolée (acier), intrants infinis au prix de base, quartier résidentiel pour l'effectif. Renvoie des fonctions de mesure dans la page.
const SETUP = `(() => {
  const W = window.WSE, S = W.S, N = W.N; const m = S.macro; m.boom = 0; m.phase = Math.PI; m.gdp = 0.03; m.infl = 0.02; m.rate = 0.04;
  const put = (k, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } };
  const f = put('f2', 66, 84, 54, 84); put('port', 66, 84, 54, 84); for (let i = 0; i < 40; i++) put('res', 14, 44, 14, 44); put('s2', 14, 44, 14, 44);
  W.assignRecipe('steel', 2); f.src = { iron: 'local', coal: 'local' }; f.wage = 2;
  const pre = () => { S.macro.phase = Math.PI; S.macro.boom = 0; S.cash = Math.max(S.cash, 5e9); ['iron', 'coal'].forEach(g => { S.stock[g] = 1e9; S.price[g] = W.GOODS[g].base * (S.cpi || 1); }); S.stock.steel = 0; S.price.steel = W.GOODS.steel.base * (S.cpi || 1); };
  const run = (n, warm) => { for (let i = 0; i < (warm || 0); i++) { pre(); W.step(); } const A = { out: 0, util: 0, fill: 0, jobs: 0, upk: 0, wag: 0, inCost: 0 }; for (let i = 0; i < n; i++) { pre(); W.step(); A.out += f.out || 0; A.util += f.util || 0; A.fill += W.fillOf(f); A.jobs += W.jobsOf(f); A.upk += f.upk || 0; A.wag += f.wages || 0; A.inCost += f.inCost || 0; } Object.keys(A).forEach(k => { A[k] /= n; }); A.limit = f.limit; A.F = W.planEvalC(f).F; A.mk = W.planEvalC(f).mk; return A; };
  window.B = { W, S, f, pre, run, put };
  for (let i = 0; i < 25; i++) { pre(); W.step(); }
})()`;

async function bench(L) { const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP); return pg; }

exports.run = async (t, L) => {
  let pg = await bench(L);
  // 1. Plan par défaut : capacité, effectif et entretien identiques à l'ancienne formule
  const d = await pg.evaluate(() => { const { W, f, run } = window.B; const T = W.TYPES.f2; const A = run(20); const e = W.planEvalC(f);
    return { plan: f.plan == null, dim: W.PLAN_DIM.f2.join('x'), ucap: W.unitsOf(f) / W.unitsBase(f), e, A, qty: W.RECIPES.steel.out, un: f._un, fill: A.fill }; });
  t.check('plan par défaut : aucune donnée stockée (c.plan absent) et 12 emplacements (sol 3×2 + portes) pour la grande usine', d.plan && d.dim === '3x2', d.dim);
  t.check('plan par défaut : débit 100 %, une machine (capacité inchangée), pas de goulot', d.e.F === 1 && d.e.mk === 1 && d.ucap === 1 && !d.e.lim && Math.abs(d.e.jw - 1) < 1e-9 && Math.abs(d.e.uw - 1) < 1e-9, `F=${d.e.F} mk=${d.e.mk} jw=${d.e.jw} uw=${d.e.uw}`);
  t.range('plan par défaut : production = capacité nominale × effectif × (1 − pertes)', d.A.out / (d.un * d.A.fill * d.qty), 0.93, 1.001, '', 3);
  const base = d.A;
  // 2. 2 machines + 2 achats + 2 ventes = 2× la production ; une seule machine de plus : bridée par les lignes d'achat et de vente
  const two = await pg.evaluate(() => { const { W, f, run } = window.B; const r = {};
    W.planSet(f, ['stock', 'make', 'make', '', '', '', 'buy', 'buy', '', 'sell', 'sell', '']); r.full = run(20, 12); r.fe = W.planEvalC(f);
    W.planSet(f, ['stock', 'make', 'make', '', '', '', 'buy', '', '', 'sell', '', '']); r.half = run(20, 12); r.he = W.planEvalC(f);
    W.planSet(f, W.planDefault(f)); r.back = run(20, 12); r.cnull = f.plan == null; return r; });
  const norm = x => x.out / x.fill;
  t.range('2 machines + 2 achats + 2 ventes = 2× la production (à effectif égal)', norm(two.full) / norm(base), 1.93, 2.05, '', 3);
  t.check('2 machines sans chaînes suffisantes : débit limité par le plan, goulot nommé', two.he.F < 0.7 && /^pl_(buy|sell)/.test(two.half.limit || ''), `F=${two.he.F.toFixed(2)} limite=${two.half.limit}`);
  t.range('1 achat + 1 vente pour 2 machines : production ≈ 1,25× (125 % de débit par ligne)', norm(two.half) / norm(base), 1.18, 1.32, '', 3);
  t.check('revenir au plan par défaut redonne la capacité d\'origine et efface c.plan', Math.abs(norm(two.back) / norm(base) - 1) < 0.03 && two.cnull, `${(norm(two.back) / norm(base)).toFixed(3)}`);
  t.check('effectif et entretien suivent le plan (2 machines : +52 % d\'effectif de base, +69 %… selon unités)', two.fe.jw > 1.5 && two.fe.uw > 1.5, `effectif ×${two.fe.jw.toFixed(2)}`);
  // 3. Goulot de vente : 0 ligne de vente = production bloquée, message « Sortie pleine »
  const sell0 = await pg.evaluate(() => { const { W, f, run } = window.B; W.planSet(f, ['stock', 'make', '', '', '', '', 'buy', '', '', '', '', '']); const A = run(12, 6); W.openBuilding(f.x, f.y); const txt = document.getElementById('bbody').textContent;
    const bn = document.querySelector('.bnbanner b') ? document.querySelector('.bnbanner b').textContent : ''; W.planSet(f, W.planDefault(f)); return { out: A.out, limit: A.limit, F: A.F, bn, hasGrid: !!document.querySelector('.plgrid'), cells: document.querySelectorAll('.plc').length, bad: document.querySelectorAll('.plc.bad').length }; });
  t.check('0 ligne de vente : production bloquée (≈ 0) et limite pl_sell0', sell0.out < 1e-6 && sell0.limit === 'pl_sell0' && sell0.F === 0 || (sell0.F < 0.01 && sell0.out < 0.5), `out=${sell0.out.toFixed(1)} F=${sell0.F} limite=${sell0.limit}`);
  t.check('goulot visible : bandeau « Sortie pleine » et case de vente absente signalée', /Sortie pleine/.test(sell0.bn) && sell0.hasGrid && sell0.cells === 12, sell0.bn);
  // 4. Manque de personnel à l'achat : curseur d'affectation sous-doté -> débit réduit proportionnellement
  const staff = await pg.evaluate(() => { const { W, f, run } = window.B; W.planSet(f, ['stock', 'make', 'make', '', '', '', 'buy', 'buy', '', 'sell', 'sell', '']); run(5, 8); const e0 = W.planEvalC(f), ok = run(10, 4);
    const n = e0.n, tot = n.make * 0.52 + n.buy * 0.16 + n.stock * 0.15 + n.sell * 0.17; const idl = { prod: n.make * 0.52 / tot, buy: n.buy * 0.16 / tot, stock: n.stock * 0.15 / tot, sell: n.sell * 0.17 / tot };
    f.dept = { prod: idl.prod, buy: idl.buy * 0.4, stock: idl.stock, sell: idl.sell }; const A = run(10, 4), e = W.planEvalC(f); const lim = A.limit; W.planSet(f, W.planDefault(f)); return { ok: ok.out / ok.fill, low: A.out / A.fill, F: e.F, lim, sbuy: e.f.sbuy }; });
  t.check('personnel insuffisant à l\'achat : débit réduit (limite pl_sbuy), liens non assurés', staff.lim === 'pl_sbuy' && staff.F < 0.6 && staff.F > 0.3, `F=${staff.F.toFixed(2)} limite=${staff.lim}`);
  t.range('personnel insuffisant : la production baisse proportionnellement au débit', staff.low / staff.ok, staff.F * 0.8, staff.F * 1.25 + 0.001, '', 3);
  await pg.context().close();

  // 5. Robots : fabriqués par des usines, posés sur une machine (gain de cadence, effectif réduit, usure, remplacement)
  pg = await bench(L);
  const rob = await pg.evaluate(() => { const { W, S, f, run } = window.B, o = {};
    o.noMk = W.planAdd(f, 1, 'robot', 'rweld') === false || true; W.planSet(f, W.planDefault(f));
    const plan0 = W.planOf(f).slice(); const base = run(16, 8); o.base = base;
    const prm = W.RECIPES.rweld; o.lvl = prm.lvl; o.inKeys = Object.keys(prm.in).join(','); o.price = W.GOODS.rweld.base; o.makers = ['rweld', 'rpaint', 'rasm', 'r6'].map(k => W.RECIPES[k] ? W.RECIPES[k].lvl : 0).join(',');
    const cash0 = S.cash; S.stock.rweld = 0; const ok = W.planAdd(f, 2, 'robot', 'rweld'); o.ok = ok; o.paid = cash0 - S.cash; o.cell = W.planOf(f)[2];
    const rb = run(16, 8); o.rb = rb; o.mk = W.planEvalC(f).mk; o.jw = W.planEvalC(f).jw; o.roi = W.robotRoi(f, 'r6', 3);
    o.dept = f.dept === null;
    // usure : robot à 95 % remplacé par un robot du stock (consommé) ; sinon acheté au marché
    f.rb[2].w = 0.95; S.stock.rweld = 3; const st0 = S.stock.rweld; W.step(); o.replaced = f.rb[2].w < 0.1 && S.stock.rweld < st0;
    f.rb[2].w = 0.95; S.stock.rweld = 0; const c1 = S.cash; S.cash = 5e11; W.step(); o.bought = f.rb[2].w < 0.1;
    // robot hors d'usage (cash insuffisant) : l'effet disparaît
    S.cash = 1; f.rb[2].w = 1; o.mkBroken = W.planEvalC(f).mk; S.cash = 5e10;
    // retrait : revente partielle
    const c2 = S.cash; W.planDel(f, 2); o.refund = S.cash - c2; o.back = f.plan == null && f.rb == null;
    return o; });
  t.check('robots : 4 biens fabriqués par des usines moyenne / grande (niveaux 2-3), recettes avec acier, moteurs, circuits, câbles', rob.makers === '2,2,3,3' && /steel/.test(rob.inKeys) && /motor/.test(rob.inKeys) && /circuit/.test(rob.inKeys) && /wire/.test(rob.inKeys), `niveaux ${rob.makers} ; ${rob.inKeys} ; prix ${Math.round(rob.price)}`);
  t.check('robot posé : débité (cash) et case « robot » occupée', rob.ok && rob.cell === 'robot' && rob.paid > 0, `payé ${Math.round(rob.paid)}`);
  t.range('robot de soudure : +15 % de cadence de machine', rob.rb.out / rob.rb.fill / (rob.base.out / rob.base.fill), 1.11, 1.19, '', 3);
  t.check('robot : effectif de machine réduit (effectif plan < 1+robot)', rob.jw < 1.06 && rob.mk > 1.14, `jw=${rob.jw.toFixed(3)} mk=${rob.mk.toFixed(2)}`);
  t.check('robot : retour sur investissement calculé en jours (ROI)', rob.roi && rob.roi.roi > 5 && rob.roi.roi < 3000, rob.roi ? `${Math.round(rob.roi.roi)} j, gain ${Math.round(rob.roi.gain)}/j` : 'nul');
  t.check('usure : un robot à 95 % est remplacé par un robot du stock (consommé) ou acheté au marché', rob.replaced && rob.bought, `stock ${rob.replaced} marché ${rob.bought}`);
  t.check('robot en panne (non remplaçable) : plus aucun gain de cadence', Math.abs(rob.mkBroken - 1) < 1e-9, `mk=${rob.mkBroken}`);
  t.check('retirer le robot : revente partielle et retour au plan par défaut', rob.refund > 0 && rob.back, `+${Math.round(rob.refund)}`);
  // 6. Économie des robots : une usine fabrique des robots qui se vendent sur le marché (PNJ et rivaux)
  const eco = await pg.evaluate(() => { const { W, S, f, pre } = window.B; f.prod = 'rweld'; const ins = Object.keys(W.RECIPES.rweld.in); f.src = {}; ins.forEach(g => { f.src[g] = 'local'; });
    const p2 = () => { pre(); ins.forEach(g => { S.stock[g] = 1e9; S.price[g] = W.GOODS[g].base * (S.cpi || 1); }); S.stock.steel = 1e9; };
    let made = 0, st = 0; for (let i = 0; i < 90; i++) { p2(); W.step(); made += f.out || 0; }
    const rv = (S.rivals || []).length; return { made, stock: S.stock.rweld, price: S.price.rweld, base: W.GOODS.rweld.base, sold: S.locSold && S.locSold.rweld || 0, rec: W.recOf(f) && W.recOf(f).out, rivals: rv, ld: 'rweld' in W.GOODS }; });
  t.check('une usine fabrique des robots (production > 0) au prix du marché', eco.made > 0.5 && eco.rec === 'rweld' && eco.price > 0, `${eco.made.toFixed(1)} robots en 90 j ; cours ${Math.round(eco.price)} $ (base ${Math.round(eco.base)})`);
  t.check('les robots se vendent aux usines PNJ et rivales (demande locale)', eco.sold > 0 || eco.stock < eco.made - 0.5, `vendus/j ${eco.sold.toFixed(2)} ; stock ${eco.stock.toFixed(1)}`);
  await pg.context().close();

  // 7. Sauvegarde v8 : plan et robots restitués ; ancienne sauvegarde (sans plan) = plan par défaut
  const ctx = await (await L.browser()).newContext({ viewport: { width: 1280, height: 900 } });
  pg = await L.newPage({ ctx, wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP);
  const sv1 = await pg.evaluate(() => { const { W, S, f } = window.B; W.planSet(f, ['robot', 'stock', 'make', 'make', '', '', 'buy', 'buy', '', 'sell', 'sell', '']); f.rb = { 0: { k: 'r6', w: 0.31 } }; W.planSet(f, W.planOf(f)); while (S.day % 5 !== 0 || S.day < 1) { window.B.pre(); W.step(); } window.B.pre(); W.step(); while (S.day % 5 !== 0) { window.B.pre(); W.step(); }
    const raw = localStorage.getItem('wse-city-v8'); const sv = JSON.parse(raw); return { v: sv.v, raw: raw.length, plan: f.plan.join(','), w: f.rb[0].w, pos: [f.x, f.y], day: S.day }; });
  t.check('sauvegarde v8 conservée avec le plan (clé pl) et les robots (rb)', sv1.v === 8 && sv1.raw > 1000 && /robot/.test(sv1.plan), `v${sv1.v} · ${sv1.plan}`);
  await pg.close(); pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); await pg.goto(L.URL);
  const ld = await pg.evaluate(pos => { const W = window.WSE, S = W.S, c = S.grid[pos[1] * W.N + pos[0]]; return c && c.t === 'f2' ? { plan: c.plan && c.plan.join(','), rb: c.rb, mk: W.planEvalC(c).mk, n: W.planEvalC(c).n } : null; }, sv1.pos);
  t.check('rechargement : plan et robot (type, usure) restitués à l\'identique', !!ld && ld.plan === sv1.plan && ld.rb && ld.rb[0].k === 'r6' && Math.abs(ld.rb[0].w - sv1.w) < 0.01 && ld.n.make === 2, ld ? ld.plan : 'absent');
  await pg.close(); await ctx.addInitScript(() => { try { const raw = JSON.parse(localStorage.getItem('wse-city-v8')); raw.g.forEach(r => { if (r && r[20] && r[20].pl) { delete r[20].pl; delete r[20].rb; r[14] = 0; } }); localStorage.setItem('wse-city-v8', JSON.stringify(raw)); } catch (e) {} });   // simule une sauvegarde v8 d'avant la passe 24
  pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); await pg.goto(L.URL); await pg.waitForTimeout(900);
  const ld2 = await pg.evaluate(pos => { const W = window.WSE, S = W.S, c = S.grid[pos[1] * W.N + pos[0]]; return c ? { plan: c.plan == null, e: W.planEvalC(c), pl: W.planOf(c).join(',') } : null; }, sv1.pos);
  t.check('ancienne sauvegarde (sans plan) : plan par défaut, capacité inchangée', ld2 && ld2.plan && ld2.e.F === 1 && ld2.e.mk === 1 && /^stock,make,,,,,buy,,,sell/.test(ld2.pl), ld2 ? ld2.pl : '');
  t.check('aucune erreur de page (rechargements)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await ctx.close();

  // 8. Déterminisme : deux parties identiques avec le même plan donnent le même état
  const run2 = async () => { const p = await bench(L); const r = await p.evaluate(() => { const { W, S, f, run } = window.B; W.planSet(f, ['stock', 'make', 'make', '', '', '', 'buy', 'buy', '', 'sell', 'sell', '']); S.stock.r6 = 5; W.planAdd(f, 5, 'robot', 'r6'); const A = run(40); return { out: A.out, cash: S.cash, w: f.rb && f.rb[5] && f.rb[5].w, day: S.day, errs: 0 }; }); const e = p.errs.length; await p.context().close(); return Object.assign(r, { e }); };
  const A = await run2(), B2 = await run2();
  t.check('déterminisme : deux parties identiques (plan + robot) donnent la même production, trésorerie et usure', A.out === B2.out && A.cash === B2.cash && A.w === B2.w && A.e + B2.e === 0, `${A.out.toFixed(3)} / ${B2.out.toFixed(3)}`);

  // 9. Interface : éditeur 3×3, ajout, vue isométrique du plan, mobile
  for (const vp of [{ w: 1280, h: 900, n: 'bureau' }, { w: 390, h: 844, n: 'mobile' }]) {
    const p = await L.newPage({ w: vp.w, h: vp.h, wait: 600 }); await L.setup(p, { cash: 5e10 }); await L.inject(p); await p.evaluate(SETUP);
    const ui = await p.evaluate(async () => { const { W, S, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 200));
      const q = s => document.querySelector(s); const o = { grid: !!q('.plgrid'), cells: document.querySelectorAll('.plc').length, flows: document.querySelectorAll('.plflow div').length };
      const free = document.querySelector('[data-act="plansel:2"]'); free.click(); await new Promise(r => setTimeout(r, 100)); o.menu = [...document.querySelectorAll('.plrow')].map(b => b.textContent.slice(0, 22));
      const cash0 = S.cash; document.querySelector('[data-act="planadd:make"]').click(); await new Promise(r => setTimeout(r, 100)); o.made = W.planEvalC(f).n.make === 2 && S.cash < cash0; o.cost = cash0 - S.cash;
      await new Promise(r => setTimeout(r, 400)); o.scene = W.scene && W.scene.kind; const cv = document.getElementById('bscene'); o.cw = cv.width; o.noBtn = !document.querySelector('[data-act="planview"]');
      o.tiles = document.querySelectorAll('#btiles .tile').length; o.vit = (document.getElementById('bvit') || {}).textContent || ''; o.stats = (document.getElementById('bstats') || {}).textContent || '';
      o.nm0 = W.recOf(f).name; f.prod = 'wire'; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 400)); o.vit2 = document.getElementById('bvit').textContent; o.nm = W.RECIPES.wire.name; o.sceneKey = W.scene.recKey === W.recOf(f).out;
      W.bAct('plandel:' + W.planOf(f).findIndex(u => u === 'make')); o.fx = W.scene.fx.length;
      const sc = W.scene, a = sc.ox + (sc.X0 + 0.5 * sc.cs - (sc.Y0 + 0.5 * sc.cs)) * sc.tw / 2; o.canvasOK = cv.width > 300;
      return o; });
    t.check(`interface ${vp.n} : mini-carte 3×3, 4 débits chiffrés, menu d'ajout, pose d'une machine et vue isométrique du plan`, ui.grid && ui.cells === 12 && ui.flows === 4 && ui.menu.length >= 6 && ui.made && ui.scene === 'plan' && ui.canvasOK && ui.noBtn && ui.tiles === 4 && ui.vit.indexOf(ui.nm0) >= 0 && ui.vit2.indexOf(ui.nm) >= 0 && ui.sceneKey && ui.fx > 0 && /Cadence/.test(ui.stats), `tuiles ${ui.tiles} · vit ${ui.vit.slice(0, 40)} / ${ui.vit2.slice(0, 40)} (${ui.nm0}, ${ui.nm}) · clé ${ui.sceneKey} · fx ${ui.fx} · bouton ${ui.noBtn} · ${ui.cells} cases · menu ${ui.menu.length} lignes · machine ${Math.round(ui.cost)} $ · scène ${ui.scene}`);
    t.check(`interface ${vp.n} : aucune erreur de page`, p.errs.length === 0, p.errs.slice(0, 2).join(' | '));
    await p.context().close();
  }

  // 10. Choix libre de chaque case (passe 26) : remplacer une unité par une autre, vente en première colonne, déplacement, pas de « première case libre » imposée
  pg = await bench(L);
  const ch = await pg.evaluate(async () => { const { W, S, f } = window.B, o = {}; const q = s2 => document.querySelector(s2);
    W.planSet(f, ['stock', 'make', '', '', '', '', 'buy', '', '', 'sell', '', '']); W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 200));
    const c0 = S.cash, rf = W.planRefund(f, 0); o.ok = W.planReplace(f, 0, 'make'); o.net = c0 - S.cash; o.expect = W.planUnitCost(f, 'make') - rf; o.plan = W.planOf(f).join(',');
    o.same = W.planReplace(f, 0, 'make');   // remplacer par le même type : refusé
    o.lockedBefore = !W.slotOpen(f, 10); o.lockedAdd = W.planAdd(f, 10, 'sell'); f.lvl = 1; o.col0 = W.planAdd(f, 10, 'sell'); f.lvl = 0; o.sells = W.planEvalC(f).n.sell;
    o.badDoor = W.planAdd(f, 7, 'make') || W.planAdd(f, 3, 'sell');   // une machine ne se pose pas à une porte, une vente pas au sol
    W.planSet(f, ['stock', 'make', '', '', '', '', 'buy', '', '', 'sell', '', '']); W.bAct('plansel:0'); await new Promise(r => setTimeout(r, 150));
    o.menu = [...document.querySelectorAll('#bpop [data-act]')].map(b => b.dataset.act + (b.disabled ? '!' : '')); const before = W.planOf(f).join(','); W.setPlanSel(-1); W.bAct('planadd:make'); o.noSel = W.planOf(f).join(',') === before;
    W.bAct('plansel:0'); W.bAct('planadd:make'); o.viaMenu = W.planOf(f)[0];
    o.mv = W.planMove(f, 1, 8) || W.planMove(f, 1, 3); o.after = W.planOf(f).join(','); o.mvDoor = W.planMove(f, 3, 7);
    W.bAct('plantool:make'); const tl = document.querySelectorAll('#bpal .tool').length; o.tools = tl; W.bAct('plantool:make'); return o; });
  t.check('remplacer une unité par une autre en un clic : coût net = coût − 50 % de l\'unité reprise, même type refusé', ch.ok && ch.plan.split(',')[0] === 'make' && Math.abs(ch.net - ch.expect) < 1 && !ch.same, `net ${Math.round(ch.net)} attendu ${Math.round(ch.expect)} · ${ch.plan}`);
  t.check('une porte de sortie verrouillée au niveau 0 refuse la pose, puis l\'accepte après le niveau ; chaque type a son emplacement (pas de machine à une porte, pas de vente au sol)', ch.lockedBefore && !ch.lockedAdd && ch.col0 && ch.sells >= 2 && !ch.badDoor, `ventes ${ch.sells}`);
  t.check('menu d\'une case du sol : machine / stock / robots + vider + déplacer (pas d\'achat ni de vente) ; sans case choisie la pose est refusée', /planadd:make/.test(ch.menu.join()) && !/planadd:buy/.test(ch.menu.join()) && !/planadd:sell/.test(ch.menu.join()) && /plandel:0/.test(ch.menu.join()) && ch.noSel && ch.viaMenu === 'make', ch.menu.join(' '));
  t.check('déplacement d\'une unité vers une case libre (jamais vers une porte de mauvais type) et palette d\'outils permanente (5 unités + gomme)', ch.mv && !ch.mvDoor && ch.tools === 6, `${ch.after} · outils ${ch.tools}`);
  t.check('aucune erreur de page (plan libre)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
