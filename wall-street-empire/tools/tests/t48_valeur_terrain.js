// Passe 48 : valeur du terrain PAR USAGE (commerce, résidentiel, bureaux, industrie, agricole, extraction), quartiers nommés et cartes de chaleur, à la Capitalism Lab.
// Centre (mall) cher pour le commerce, vue sur la mer chère pour le résidentiel, zone portuaire subventionnée pour l'industrie, usine en campagne moins chère mais
// plus loin (transport), ferme moins chère loin de la ville ; calques et légende en $/case ; achat cohérent avec la revalorisation ; déterminisme ; ancienne sauvegarde ; mobile.
exports.name = 'Valeur du terrain par usage, quartiers et cartes de chaleur (passe 48)';
const fs = require('fs'), path = require('path');
const start = async pg => pg.evaluate(async () => {
  const W = window.WSE; document.getElementById('caste').hidden = true; W.startMode('free'); W.setCaste('industriel');
  ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.S.noEv = true; W.setSpeed(0);
  const b = document.querySelector('[data-sg="close"]'); if (b) b.click(); await new Promise(x => setTimeout(x, 300)); W.step(); return true;
});
const MAPSIG = `(() => { const L = window.WSE.land, N = window.WSE.N; let h = 0; ['com', 'res', 'off', 'ind', 'agr', 'ext'].forEach((u, k) => { for (let i = 0; i < N * N; i += 7) h = (h * 31 + Math.round(L.raw(i % N, (i / N) | 0, u)) + k) % 1000000007; });
  const C = L.cache(); return h + ':' + C.labels.map(l => l.name + '@' + l.x + ',' + l.y).join('|'); })()`;

exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 2400, w: 1280, h: 720 }); await L.inject(pg); await start(pg);
  const a = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, Ld = W.land, o = {}; S.cash = 3e7; S.done = W.acq.MISSIONS.map(m => m.id); S.won = true;   // missions déjà accomplies : aucune récompense ne fausse les montants payés
    const sp = W.mall.spot('s1'); o.sp = sp;
    o.comC = Ld.model(sp.x, sp.y, 'com'); o.comP = Ld.model(14, 14, 'com'); o.comF = Ld.model(10, 80, 'com');
    o.resSea = Ld.model(86, 20, 'res'); o.resIn = Ld.model(30, 86, 'res');
    o.indPort = Ld.model(70, 60, 'ind'); o.indCity = Ld.model(37, 30, 'ind'); o.indFar = Ld.model(40, 70, 'ind');
    o.agrNear = W.land.costFor(50, 20, 'fwheat'); o.agrFar = W.land.costFor(10, 80, 'fwheat'); o.agrMid = W.land.costFor(20, 70, 'fwheat');
    o.useOf = ['s1', 'res', 'off', 'tech', 'f1', 'wh', 'fwheat', 'fcattle', 'well', 'miron'].map(k => k + ':' + Ld.useOf(k));
    o.pole = Ld.pole(); o.mall = W.mall.rect();
    // somme exacte des composantes
    o.sumOk = [o.comC, o.resSea, o.indPort].every(m => Math.abs(Object.values(m.parts).reduce((x, y) => x + y, 0) - m.v) <= 12);
    // zones : usine en ville refusée, en campagne autorisée ; placements automatiques : port d'abord
    o.errCity = W.footprintError(37, 31, 'f1'); o.errRural = W.footprintError(40, 70, 'f1'); o.auto = Ld.autoSpot('f1');
    // usine au port (subventionnée) vs usine en campagne
    const b0 = Math.round(W.TYPES.f1.cost * Math.max(1, W.S.cpi || 1));
    let px = null; for (let y = 60; y <= 78 && !px; y++) for (let x = 68; x <= 80 && !px; x++) if (!W.footprintError(x, y, 'f1') && W.ZONE[y * W.N + x] === 2) px = [x, y];
    o.px = px; o.portSite = W.siteInfo(px[0], px[1], 'f1'); o.ruralSite = W.siteInfo(40, 70, 'f1'); o.aid = W.zn.buildAid(px[0], px[1], b0); o.aidRural = W.zn.buildAid(40, 70, b0); o.b0 = b0;
    const c0 = S.cash; o.rOk = W.place(40, 70, 'f1'); o.rPaid = c0 - S.cash; const rc = S.grid[70 * W.N + 40]; o.rLp = rc && rc.lp; o.rHaul = rc && rc.haul;
    const c1 = S.cash; o.pOk = W.place(px[0], px[1], 'f1'); o.pPaid = c1 - S.cash;
    // achat cohérent : petit marché près du mall
    const land = Ld.costFor(sp.x, sp.y, 's1'), sum = Ld.price(sp.x, sp.y, 'com'), c2 = S.cash; o.sOk = W.place(sp.x, sp.y, 's1'); o.sPaid = c2 - S.cash;
    const b = S.grid[sp.y * W.N + sp.x]; o.s1 = { land, sum, lp: b.lp, lpv: b.lpv, foot: Ld.foot(sp.x, sp.y, 's1'), val: Ld.val(b), build: Math.round(W.TYPES.s1.cost * Math.max(1, W.S.cpi || 1)) };
    // logements : lot au prix du modèle résidentiel
    o.lot = W.pro.valueAt(20, 40, 'res', 3).lot; o.lotM = Ld.price(20, 40, 'res');
    // quartiers
    const C = Ld.cache(); o.labels = C.labels.map(l => l.name); o.qMall = Ld.district(sp.x, sp.y); o.qPort = Ld.district(85, 70); o.qInd = Ld.district(70, 60); o.qCoast = Ld.district(86, 20); o.qFar = Ld.district(10, 80);
    // cache : deux appels sans changement = même objet
    o.cacheSame = Ld.cache() === C;
    return o; });
  t.info(`commerce : mall ${a.comC.price} $/case (${a.comC.q}) · périphérie ${a.comP.price} · campagne ${a.comF.price} ; résidentiel vue mer ${a.resSea.price} (vue ${a.resSea.view}) · intérieur ${a.resIn.price}`);
  t.info(`industrie : port ${a.indPort.price} · centre-ville ${a.indCity.price} · campagne ${a.indFar.price} ; ferme 2×2 : près de la ville ${a.agrNear} $, à mi-distance ${a.agrMid} $, loin ${a.agrFar} $`);
  t.check('usages fonciers : commerce, résidentiel, bureaux, industrie, agricole, extraction', a.useOf.join() === 's1:com,res:res,off:off,tech:off,f1:ind,wh:ind,fwheat:agr,fcattle:agr,well:ext,miron:ext', a.useOf.join(' '));
  t.check('le pôle de la ville est le Mall central (plus de centre codé en dur)', a.mall && a.pole.x0 === a.mall.x0 && a.pole.y1 === a.mall.y1, JSON.stringify(a.pole));
  t.check('commerce : le pourtour du mall vaut bien plus que la périphérie (×4) et la campagne (×40)', a.comC.price > 4 * a.comP.price && a.comC.price > 40 * a.comF.price && a.comC.parts.centre > 0 && a.comC.parts.trafic > 0, `${a.comC.price} / ${a.comP.price} / ${a.comF.price}`);
  t.check('résidentiel : une villa vue mer vaut bien plus (×3) qu\'une case de l\'intérieur à la même distance de la ville', a.resSea.price > 3 * a.resIn.price && a.resSea.parts.vue > 0 && !a.resIn.parts.vue && Math.abs(a.resSea.dC - a.resIn.dC) < 3, `${a.resSea.price} vs ${a.resIn.price}`);
  t.check('décomposition exacte : la somme des composantes donne la valeur', a.sumOk, '');
  t.check('industrie : le sol de la zone portuaire coûte moins cher que celui du centre-ville, le port y compte', a.indPort.price < a.indCity.price && a.indPort.parts.port > a.indCity.parts.port, `${a.indPort.price} < ${a.indCity.price}`);
  t.check('usine : refusée en ville, autorisée en campagne ; placement automatique dans la zone du port d\'abord', /Pas d'usine en ville/.test(a.errCity) && a.errRural === '' && a.auto && a.auto[0] >= 66 && a.auto[1] >= 54, `${a.errCity.slice(0, 40)} · ${JSON.stringify(a.auto)}`);
  t.check('zone portuaire subventionnée : aide à la construction au port, aucune en campagne', a.aid > 0 && a.aidRural === 0, `${a.aid} $ vs ${a.aidRural} $`);
  t.check('usine au port : coût d\'installation total (subvention déduite) inférieur à la campagne', a.pOk && a.rOk && a.pPaid < a.rPaid, `port ${a.pPaid} $ · campagne ${a.rPaid} $`);
  t.check('usine en campagne : terrain moins cher qu\'au port mais transport plus long et plus cher', a.ruralSite.land < a.portSite.land && a.ruralSite.haul > a.portSite.haul && a.ruralSite.transport > a.portSite.transport, `terrain ${a.ruralSite.land} < ${a.portSite.land} · transport ${Math.round(a.ruralSite.transport)} > ${Math.round(a.portSite.transport)} $/j`);
  t.check('ferme : le foncier près de la ville est cher (pression urbaine), loin de tout il ne coûte presque rien', a.agrNear > 5 * a.agrFar && a.agrMid < a.agrNear && a.agrFar < 2000, `${a.agrNear} > ${a.agrMid} > ${a.agrFar}`);
  t.range('départ accueillant : premier petit marché près du mall, coût total (k$)', (a.s1.build + a.s1.land) / 1000, 120, 140, ' k$', 1);
  t.check('achat cohérent : terrain payé = coût annoncé = somme des cases au modèle commerce ; valeur au bilan = prix payé', a.sOk && a.s1.land === a.s1.sum && Math.abs(a.sPaid - a.s1.land - a.s1.build) <= 0.05 * a.s1.build && a.s1.lp === a.s1.land && a.s1.lpv === a.s1.foot && Math.abs(a.s1.val - a.s1.lp) <= 1, JSON.stringify(a.s1) + ' payé ' + a.sPaid);
  t.check('logements : le lot d\'un bien suit le modèle résidentiel', a.lot === a.lotM && a.lot > 0, `${a.lot} / ${a.lotM}`);
  const need = ['Midtown', 'Parktown', 'Faubourg', 'Harborside', 'Zone industrielle', 'Campagne', 'La Côte'];
  t.check('quartiers nommés par la géométrie (Midtown autour du mall, Parktown, Harborside, Zone industrielle, Faubourg, La Côte, Campagne)', need.every(n => a.labels.includes(n)) && a.qMall === 'Midtown' && a.qPort === 'Harborside' && a.qInd === 'Zone industrielle' && a.qCoast === 'La Côte' && a.qFar === 'Campagne', a.labels.join(', '));
  t.check('carte de valeur mise en cache (pas de recalcul sans changement)', a.cacheSame, '');

  // ---- calques et légende (1280x720), noms des quartiers dessinés
  const ly = await pg.evaluate(async () => {
    const W = window.WSE, o = { names: Object.keys(W.land.LAYER_N), leg: {} }; W.setTool('view'); W.zoomTo(0.35);
    const M = W.mall.pos(); W.centerOn(M.x + 5, M.y + 5);
    const drawn = new Set(), f0 = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (s, ...r) { drawn.add(String(s)); return f0.call(this, s, ...r); };
    for (const k of ['landc', 'landr', 'traffic']) { W.land.setLayer(k); await new Promise(x => setTimeout(x, 350)); const e = document.getElementById('lyrleg'), r = e.getBoundingClientRect(); o.leg[k] = { txt: e.innerText, vis: !e.hidden && r.width > 0, grad: (e.querySelector('i') || {}).style ? e.querySelector('i').style.background : '', fit: r.right <= innerWidth && r.left >= 0, btn: document.getElementById('lyr').textContent }; }
    CanvasRenderingContext2D.prototype.fillText = f0; o.drawn = [...drawn].filter(s => /^[A-ZÉÈ ]{5,}$/.test(s));
    // clic réel sur le bouton : le calque suivant
    W.land.setLayer('auto'); document.getElementById('lyr').click(); document.querySelector('#lyrmenu [data-lyr="landc"]').click(); o.afterClicks = W.land.layer();
    // info-bulle de construction : valeur du terrain pour l'usage de l'outil et décomposition
    W.land.setLayer('auto'); W.setTool('s1'); const sp = W.mall.spot('s1'), p = W.tileToScreen(sp.x, sp.y); return { o, p, sp }; });
  const L0 = ly.o; t.info(`calques : ${L0.names.join(', ')} ; noms dessinés : ${L0.drawn.slice(0, 8).join(', ')}`);
  t.check('calques « Valeur du terrain (commerce) », « Valeur résidentielle (vue, calme) », « Fréquentation » dans le sélecteur', ['landc', 'landr', 'traffic'].every(k => L0.names.includes(k)) && /Valeur du terrain \(commerce\)/.test(L0.leg.landc.txt) && /Valeur résidentielle \(vue, calme\)/.test(L0.leg.landr.txt) && /Fréquentation/.test(L0.leg.traffic.txt), '');
  t.check('légende en $/case avec dégradé froid → chaud, lisible en 1280x720', ['landc', 'landr'].every(k => L0.leg[k].vis && L0.leg[k].fit && /\$\/case/.test(L0.leg[k].txt) && /^linear-gradient\(90deg,(hsl\(235|rgb\(29,46,237)/.test(L0.leg[k].grad.replace(/\s/g, '')) && /(hsl\(0,|rgb\(237,29,29\))\)$/.test(L0.leg[k].grad.replace(/\s/g, ''))) && /Commerce \$/.test(L0.leg.landc.btn), JSON.stringify(L0.leg.landc));
  t.check('noms des quartiers affichés sur la carte avec le calque', L0.drawn.includes('MIDTOWN') && L0.drawn.length >= 3, L0.drawn.join(', '));
  t.check('le bouton Calque ouvre le sélecteur, « Valeur du foncier (commerce) » active le calque (passe 99)', L0.afterClicks === 'landc', L0.afterClicks);
  await pg.mouse.move(ly.p.x, ly.p.y); await pg.waitForTimeout(500);
  const tip = await pg.evaluate(() => { const e = document.getElementById('sitetip'), r = e.getBoundingClientRect(); return { vis: !e.hidden, txt: e.innerText, fit: r.right <= innerWidth + 1 && r.left >= -1 && r.bottom <= innerHeight }; });
  t.check('info-bulle de construction : valeur du terrain (commerce) en $/case, quartier et décomposition (centralité, trafic, distance)', tip.vis && /Valeur du terrain \(commerce\)/.test(tip.txt) && /\/case/.test(tip.txt) && /Midtown/.test(tip.txt) && /centralité/.test(tip.txt) && /trafic/.test(tip.txt) && /distance/.test(tip.txt) && tip.fit, tip.txt.replace(/\s+/g, ' ').slice(0, 220));
  // revalorisation : la ville se densifie (trafic) → la valeur au bilan suit le modèle, bornée
  const rv = await pg.evaluate(() => { const W = window.WSE, S = W.S, T = window.T; T.stepN(40, true); let o = null; for (let i = 0; i < S.grid.length && !o; i++) { const c = S.grid[i]; if (c && c.t === 's1' && c.lpv) o = { val: W.land.val(c), foot: W.land.foot(c.x, c.y, c.t), lp: c.lp, lpv: c.lpv }; } return o; });
  t.check('revalorisation d\'un terrain possédé sur le même modèle que l\'achat', rv && Math.abs(rv.val - rv.lp * Math.min(5, Math.max(0.6, rv.foot / rv.lpv))) <= 1, JSON.stringify(rv));
  const sig1 = await pg.evaluate(MAPSIG);
  t.check('aucune erreur de page (1280x720)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // ---- déterminisme : une autre partie, mêmes valeurs et mêmes quartiers
  const p2 = await L.newPage({ wait: 2400 }); await start(p2); const sig2 = await p2.evaluate(MAPSIG); const p3s = await p2.evaluate(() => { window.WSE.step(); return true; });
  const pA = await L.newPage({ wait: 2400 }); await start(pA); const sig3 = await pA.evaluate(MAPSIG);
  t.check('déterminisme : deux parties neuves donnent la même carte de valeur et les mêmes quartiers', sig2 === sig3 && p3s, `${sig2.slice(0, 40)} / ${sig3.slice(0, 40)}`);
  t.info(`(signature après 40 jours de jeu : ${sig1.slice(0, 30)})`);
  await p2.context().close(); await pA.context().close();

  // ---- ancienne sauvegarde (avant passe 48) : terrains au prix payé, revalorisation par l'ancien indice, terrain nu sans valeur d'achat = prix payé
  { const save = fs.readFileSync(path.join(__dirname, 'fixtures', 'save_v8_avant_passe33.json'), 'utf8'), old = JSON.parse(save);
    let free = -1; for (let i = 60 * 96 + 3; i < old.g.length && free < 0; i++) if (!old.g[i] && i % 96 >= 3 && i % 96 <= 9) free = i;   // case de campagne libre (la ville PNJ est régénérée au chargement)
    old.pland = { [free]: 50000 }; const lps = []; old.g.forEach((c, i) => { if (Array.isArray(c) && c[20] && c[20].lp) lps.push([i, c[20].lp]); });
    const ctx = await (await L.browser()).newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('wse_fx')) { localStorage.setItem('wse-city-v8', s); sessionStorage.setItem('wse_fx', '1'); } } catch (e) { } }, JSON.stringify(old));
    const p5 = await L.newPage({ ctx, wait: 1500 }); await L.inject(p5);
    const r = await p5.evaluate(lps => { const W = window.WSE, S = W.S, o = { kept: 0, n: lps.length, lpv: 0, bad: 0 };
      lps.forEach(([i, lp]) => { const c = S.grid[i]; if (c && Math.round(c.lp) === lp) o.kept++; if (c && c.lpv) o.lpv++; const v = c ? W.land.val(c) : NaN; if (!(v > 0) || !isFinite(v)) o.bad++; });
      o.assets = W.land.assets(); window.T.stepN(20, true); o.scan = window.T.scan(); W.refreshStats(); o.worth = S.stats.worth; W.save(); o.resave = JSON.parse(localStorage.getItem('wse-city-v8')).pland; return o; }, lps);
    t.check('ancienne sauvegarde : terrains déjà achetés gardent leur prix payé, valeur au bilan finie (ancien indice)', r.n >= 10 && r.kept === r.n && r.lpv === 0 && r.bad === 0, JSON.stringify({ n: r.n, kept: r.kept, lpv: r.lpv, bad: r.bad }));
    t.check('ancienne sauvegarde : terrain nu sans valeur d\'achat notée compté au prix payé ; 20 jours sans NaN ; réenregistrée', r.assets === 50000 && r.scan.length === 0 && isFinite(r.worth) && r.resave && r.resave[free] === 50000 && p5.errs.length === 0, JSON.stringify({ a: r.assets, s: r.scan.slice(0, 2), e: p5.errs.slice(0, 2) }));
    await ctx.close(); }

  // ---- mobile 390x844 : légende et info-bulle dans l'écran
  const pm = await L.newPage({ wait: 2400, w: 390, h: 844 }); await start(pm);
  const mb = await pm.evaluate(async () => { const W = window.WSE; W.land.setLayer('landr'); await new Promise(x => setTimeout(x, 400)); const e = document.getElementById('lyrleg'), r = e.getBoundingClientRect(), b = document.getElementById('lyr').getBoundingClientRect();
    W.setTool('s1'); const sp = W.mall.spot('s1'); W.centerOn(sp.x, sp.y); await new Promise(x => setTimeout(x, 200)); const p = W.tileToScreen(sp.x, sp.y);
    return { leg: { vis: !e.hidden, l: r.left, r: r.right, txt: e.innerText }, btn: { l: b.left, r: b.right }, p, w: innerWidth, sw: document.documentElement.scrollWidth }; });
  await pm.mouse.move(mb.p.x, mb.p.y); await pm.waitForTimeout(500);
  const mt = await pm.evaluate(() => { const e = document.getElementById('sitetip'), r = e.getBoundingClientRect(); return { vis: !e.hidden, l: r.left, r: r.right, txt: e.innerText }; });
  t.check('mobile 390x844 : légende en $/case et bouton Calque dans l\'écran, pas de défilement horizontal', mb.leg.vis && mb.leg.l >= 0 && mb.leg.r <= mb.w && /\$\/case/.test(mb.leg.txt) && mb.btn.r <= mb.w + 1 && mb.sw <= mb.w + 1, JSON.stringify(mb.leg) + ' ' + JSON.stringify(mb.btn));
  t.check('mobile 390x844 : info-bulle avec la valeur du terrain dans l\'écran', mt.vis && mt.l >= -1 && mt.r <= mb.w + 1 && /Valeur du terrain/.test(mt.txt), JSON.stringify({ l: mt.l, r: mt.r }));
  t.check('mobile : aucune erreur de page', pm.errs.length === 0, pm.errs.slice(0, 2).join(' ; '));
  await pm.context().close();
};
