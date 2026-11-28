// Responsable Liberté de construire (consigne de Rémy) : « N'importe qui peut construire où il veut, de l'autre côté de la ville, en pleine campagne. Il ne faut pas
// l'interdire : il faut juste INCITER par des subventions (port, zone industrielle). Les stations-service se construisent au bord de la route, plus facile et moins cher. »
// Vérifie : un bâtiment de chaque famille se pose en campagne et de l'autre côté de la ville sans refus de zone (et une usine, un entrepôt en ville, un commerce au port) ;
// la subvention de zone est accordée au port / en zone industrielle et nulle part ailleurs ; l'éloignement coûte (desserte et réseaux, défrichement, clientèle) sans interdire ;
// les impossibilités physiques restent, avec un message clair ; la station au bord de la route est plus facile et moins chère, vit du passage et de la concurrence ;
// zonage et voirie libérés ; sauvegarde et rechargement intacts ; 0 erreur de page.
exports.name = 'Liberté de construire : poser partout, inciter par les subventions, stations au bord de la route';
const ZONE_REFUS = /Zone urbaine|Pas d'usine|Pas de data center|centre dense|se construisent en|se posent en|non constructible|réservée à l'industrie|seulement sur|hors zone/i;
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 2400 }); await L.setup(pg, { caste: 'agriculteur', cash: 3e9 }); await L.inject(pg);
  const a = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, Z = W.ZONE, o = {}; S.done = W.acq.MISSIONS.map(m => m.id); S.won = true; S.noEv = true;
    const ownRoads = () => S.grid.filter(c => c && c.t === 'road' && c.own).length;
    const free = (key, x0, x1, y0, y1, zone) => { const T = W.TYPES[key]; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { let ok = true; for (let oy = 0; oy < (T.h || 1) && ok; oy++) for (let ox = 0; ox < (T.w || 1) && ok; ox++) { const i = (y + oy) * N + x + ox; if (x + ox >= N || y + oy >= N || S.grid[i] || S.dep[i] || (zone != null && Z[i] !== zone)) ok = false; } if (ok) return [x, y]; } return null; };
    // 1. un bâtiment de chaque famille, en pleine campagne (ouest, au sud) et de l'autre côté de la ville (nord-ouest, à l'opposé du port)
    const FAM = ['s1', 's2', 'sauto', 'res', 'off', 'tech', 'bank', 'f1', 'f2', 'foundry', 'wh', 'dc', 'solar', 'fwheat', 'fcattle'];
    o.rural = []; o.far = [];
    FAM.forEach(k => { [['rural', 0, 26, 56, 94], ['far', 0, 40, 0, 10]].forEach(([g, x0, x1, y0, y1]) => {
      const sp = free(k, x0, x1, y0, y1, 0); if (!sp) { o[g].push({ k, none: 1 }); return; }
      const e = W.footprintError(sp[0], sp[1], k), c0 = S.cash, r0 = ownRoads(), ok = !e && W.place(sp[0], sp[1], k), b = S.grid[sp[1] * N + sp[0]];
      o[g].push({ k, x: sp[0], y: sp[1], e, ok, paid: c0 - S.cash, conn: !!(b && b.conn), dess: ownRoads() - r0 }); }); });
    // 2. en ville (usine, entrepôt) et au port (commerce, logements) : plus de refus de zone ; la subvention suit la zone, pas le type posé
    const cityF = free('f1', 13, 47, 13, 47, 1); o.cityF = cityF && { e: W.footprintError(cityF[0], cityF[1], 'f1'), ok: W.place(cityF[0], cityF[1], 'f1'), aid: W.zn.buildAid(cityF[0], cityF[1], 1e6) };
    const portS = free('s1', 66, 84, 54, 84, 2); o.portS = portS && (() => { const e = W.footprintError(portS[0], portS[1], 's1'), c0 = S.cash, ok = W.place(portS[0], portS[1], 's1'), b = S.grid[portS[1] * N + portS[0]]; return { e, ok, paid: c0 - S.cash, zn: W.zn.of(b), bld: Math.round(W.TYPES.s1.cost * Math.max(1, S.cpi || 1)) }; })();
    const portF = free('f1', 66, 84, 54, 84, 2); o.portF = portF && (() => { const b0 = Math.round(W.TYPES.f1.cost * Math.max(1, S.cpi || 1)), aid = W.zn.buildAid(portF[0], portF[1], b0), c0 = S.cash, land = W.land.costFor(portF[0], portF[1], 'f1'), ok = W.place(portF[0], portF[1], 'f1'); return { aid, ok, paid: c0 - S.cash, land, b0, zn: W.zn.of(S.grid[portF[1] * N + portF[0]]) }; })();
    o.aidRural = W.zn.buildAid(10, 70, 1e6); o.aidCity = W.zn.buildAid(30, 30, 1e6);
    // 3. impossibilités physiques : mer, quai, case occupée, bâtiment public, gisement minier
    let sea = null, quai = null, mon = null, min = null; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (!sea && Z[i] === 3) sea = i; if (!quai && Z[i] === 4 && !c) quai = i; if (!mon && c && c.t === 'npc' && c.k === 'mon' && c.w === 1 && !c.mw) mon = i; const d = S.dep[i]; if (!min && d && !c && d.k !== 'wood' && !W.CROPS[d.k]) min = i; }
    const fe = (i, k) => i == null ? 'aucune case' : W.footprintError(i % N, (i / N) | 0, k);
    o.phys = { sea: fe(sea, 's1'), quai: fe(quai, 'f1'), port: fe(min, 'port'), mon: fe(mon, 's1'), min: fe(min, 'f1') };
    // 4. station au bord de la route : facile (aucune zone, desserte par la route voisine), moins chère, vit du passage
    o.cost = { sfuel: W.TYPES.sfuel.cost, scharge: W.TYPES.scharge.cost, s1: W.TYPES.s1.cost };
    const hw = [55, 47]; o.stOff = W.footprintError(10, 75, 'sfuel');
    { const c0 = S.cash, r0 = ownRoads(), q = W.siteInfo(hw[0], hw[1], 'sfuel'); o.st = { e: W.footprintError(hw[0], hw[1], 'sfuel'), ok: W.place(hw[0], hw[1], 'sfuel'), paid: c0 - S.cash, dess: ownRoads() - r0, aid: q.aid, F: q.fq.F, quote: Math.round(q.fq.gm) }; }
    { const c0 = S.cash; o.ch = { ok: W.place(hw[0] + 2, hw[1], 'scharge'), paid: c0 - S.cash }; }
    const sp = W.mall.spot('s1'); { const c0 = S.cash; o.cityShop = { ok: W.place(sp.x, sp.y, 's1'), paid: c0 - S.cash }; }
    // station sur une départementale, loin de l'axe ville-port
    let dep = null; for (let y = 60; y < 95 && !dep; y++) { const x = 31; if (!W.footprintError(x, y, 'sfuel')) dep = [x, y]; } o.depOk = dep && W.place(dep[0], dep[1], 'sfuel'); o.depAt = dep;
    // concurrence : une seconde station sur l'axe partage le passage
    o.q1 = W.siteInfo(hw[0] + 4, hw[1], 'sfuel').fq.sh;
    // 5. zonage et voirie libérés
    let zc = null, zp = null, zr = null; for (let i = 0; i < N * N && !(zc && zp && zr); i++) { const x = i % N, y = (i / N) | 0; if (!zc && Z[i] === 1 && !S.grid[i] && !W.pro.zoneErr(x, y, 'i')) zc = [x, y]; if (!zp && Z[i] === 2 && !S.grid[i] && !W.pro.zoneErr(x, y, 'r')) zp = [x, y];
      if (!zr && Z[i] === 0 && !S.grid[i] && !S.dep[i] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(d => Z[(y + d[1]) * N + x + d[0]] === 1)) zr = [x, y]; }
    o.zone = { city: zc && W.pro.zoneErr(zc[0], zc[1], 'i'), port: zp && W.pro.zoneErr(zp[0], zp[1], 'r'), rural: zr && W.pro.zoneErr(zr[0], zr[1], 'r') };
    if (zr) { W.S.pro && (W.S.pro.zmode = 'r'); const c0 = S.cash; o.zone.ruralOk = W.place(zr[0], zr[1], 'zone'); o.zone.ruralPaid = c0 - S.cash; o.zone.q = (S.pro.terr || []).some(op => op.zq === 'r' && op.cells.some(q => q[0] === zr[0] && q[1] === zr[1])); o.zr = zr; window._zr = zr; }
    { let rd = null; for (let y = 14; y < 44 && !rd; y++) for (let x = 14; x < 44; x++) if (Z[y * N + x] === 1 && !S.grid[y * N + x] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(d => { const c = S.grid[(y + d[1]) * N + x + d[0]]; return c && c.t === 'road'; })) { rd = [x, y]; break; } o.road = rd ? W.pro.roadErr(rd[0], rd[1]) : 'aucune case'; }
    o.terraErr = (() => { const p = W.pro.terraPlan(10, 50, 1); return p.why || ''; })();
    return o;
  });
  const fam = g => a[g].filter(r => !r.none);
  ['rural', 'far'].forEach(g => {
    const rs = fam(g), bad = rs.filter(r => r.e || !r.ok);
    t.check(`${g === 'rural' ? 'en pleine campagne' : 'de l\'autre côté de la ville'} : un bâtiment de chaque famille se pose sans refus de zone (${rs.map(r => r.k).join(', ')})`, rs.length >= 12 && !bad.length && !rs.some(r => ZONE_REFUS.test(r.e || '')), bad.map(r => r.k + ':' + r.e).join(' | ') || rs.length + ' posés');
    t.check(`${g === 'rural' ? 'campagne' : 'autre côté'} : chaque bâtiment est desservi (route de desserte posée à ta charge quand aucune route n'est à portée)`, rs.every(r => r.conn) && rs.some(r => r.dess > 0), rs.filter(r => !r.conn).map(r => r.k).join(',') + ' · desserte ' + rs.map(r => r.dess).join('/'));
  });
  t.check('usine posée en ville (plus d\'interdiction) sans subvention ; commerce posé dans la zone du port, sans aucune aide de zone', a.cityF && !a.cityF.e && a.cityF.ok && a.cityF.aid === 0 && a.portS && !a.portS.e && a.portS.ok && a.portS.zn === null && a.portS.paid >= a.portS.bld, JSON.stringify({ cityF: a.cityF, portS: a.portS }));
  t.check('subvention de zone toujours accordée à l\'usine du port (aide déduite du prix payé) et nulle en campagne et en ville', a.portF && a.portF.aid > 0 && a.portF.ok && a.portF.paid < a.portF.b0 + a.portF.land && a.portF.zn === 'indus' && a.aidRural === 0 && a.aidCity === 0, JSON.stringify(a.portF) + ` campagne ${a.aidRural} ville ${a.aidCity}`);
  const rf = fam('rural').find(r => r.k === 's1'), dcF = fam('rural').find(r => r.k === 'dc');
  t.check('l\'éloignement coûte sans interdire : un petit marché en campagne paie sa desserte (plus cher qu\'au cœur de la ville hors terrain)', rf && rf.ok && rf.dess > 0 && rf.paid > 110000, JSON.stringify(rf));
  t.check('data center : plus interdit nulle part sur la terre ferme (campus posé en campagne)', dcF && dcF.ok, JSON.stringify(dcF));
  const P = a.phys;
  t.check('impossibilités physiques gardées, avec un message clair et la voie payante (mer : remblai ; quai : amarrage ; public ; gisement)', /remblaie/.test(P.sea) && /Quai du port/.test(P.quai) && /quai/.test(P.port) && /public/.test(P.mon) && /gisement minier/.test(P.min), JSON.stringify(P));
  t.check('station au bord de la route : moins chère à construire que les autres commerces (le petit marché est le moins cher)', a.cost.sfuel < a.cost.s1 && a.cost.scharge < a.cost.s1, JSON.stringify(a.cost));
  t.check('station : aucune zone requise, desservie par la route voisine (aucune route à poser), sans subvention ; refusée seulement loin de toute route (message clair)', !a.st.e && a.st.ok && a.st.dess === 0 && a.st.aid === 0 && /bord d'une route/.test(a.stOff), JSON.stringify(a.st) + ' · ' + a.stOff);
  t.check('station au bord de l\'axe ville-port : coût total payé inférieur au petit marché près du mall', a.st.paid < a.cityShop.paid && a.ch.ok && a.ch.paid < a.st.paid, `station ${a.st.paid} $ · bornes ${a.ch.paid} $ · petit marché ${a.cityShop.paid} $`);
  t.check('concurrence : une autre station à portée partage le passage (part captée < 100 %)', a.q1 < 0.95, 'part ' + a.q1);
  t.check('zonage libéré : zone industrielle en ville, résidentiel au port, campagne zonable (aplanissement commandé avec le zonage)', a.zone.city === '' && a.zone.port === '' && a.zone.rural === '' && a.zone.ruralOk && a.zone.q && a.zone.ruralPaid > 0, JSON.stringify(a.zone));
  t.check('voirie libérée : en ville, une route privée ne demande plus de caste ni d\'entreprise de BTP (permis payant)', !/permis de voirie|Promoteur|BTP/.test(a.road), a.road || 'ok');
  // 6. économie des stations sur 30 jours
  const e = await pg.evaluate(dep => { const W = window.WSE, S = W.S, N = W.N; for (let i = 0; i < 30; i++) W.step(); const P = (x, y) => { const c = S.grid[y * N + x]; return c && { t: c.t, out: +(c.out || 0).toFixed(1), rev: Math.round(c.pRev || 0), profit: Math.round(c.profit || 0), fq: c._fq }; };
    const zr = window._zr, zi = zr ? zr[1] * N + zr[0] : -1; return { zr: zr && { pzn: (S.pzn || {})[zi] || null, z: W.ZONE[zi], pend: (S.pro.terr || []).some(o => o.zq && o.cells.some(q => q[0] === zr[0] && q[1] === zr[1])) }, hw: P(55, 47), ch: P(57, 47), dep: dep && P(dep[0], dep[1]), q2: W.siteInfo(59, 47, 'sfuel').fq.sh, q2b: W.siteInfo(59, 47, 'sfuel').fq.sh, fin: S.fin.revRetail }; }, a.depAt);
  t.info(`axe ville-port : ${JSON.stringify(e.hw)} · bornes : ${JSON.stringify(e.ch)} · départementale : ${JSON.stringify(e.dep)}`);
  t.check('station de l\'axe ville-port rentable (passage fort), plus que celle d\'une départementale (passage faible) : c\'est le marché qui place les stations', e.hw && e.hw.profit > 0 && e.hw.out > 50 && (!e.dep || e.dep.profit < e.hw.profit), `${e.hw && e.hw.profit} $/j contre ${e.dep && e.dep.profit} $/j`);
  t.check('campagne zonée : après le permis et les travaux, la case devient urbaine et zonée (ou le permis est refusé et remboursé), jamais bloquée', e.zr && !e.zr.pend && (e.zr.pzn === 'r' ? e.zr.z === 1 : true), JSON.stringify(e.zr));
  t.check('prévision déterministe (même calcul, même résultat)', e.q2 === e.q2b, e.q2 + ' / ' + e.q2b);
  // 7. sauvegarde et rechargement
  const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.save(); return { st: S.grid.filter(c => c && (c.t === 'sfuel' || c.t === 'scharge')).length, roads: S.grid.filter(c => c && c.t === 'road' && c.own).length, n: S.grid.filter(c => c && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part').length, zq: (S.pro.terr || []).filter(o => o.zq).length, day: S.day }; });
  const p2 = await pg.context().newPage(); p2.errs = []; p2.on('pageerror', x => p2.errs.push(x.message)); await p2.goto(L.URL); await p2.waitForTimeout(1500);
  const re = await p2.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); const o = { st: S.grid.filter(c => c && (c.t === 'sfuel' || c.t === 'scharge')).length, roads: S.grid.filter(c => c && c.t === 'road' && c.own).length, n: S.grid.filter(c => c && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part').length, zq: ((S.pro && S.pro.terr) || []).filter(o => o.zq).length, day: S.day }; for (let i = 0; i < 10; i++) W.step(); o.after = S.grid.filter(c => c && c.t === 'sfuel').every(c => Number.isFinite(c.profit)); return o; });
  t.check('sauvegarde wse-city-v8 : stations, routes de desserte, bâtiments et zonage en attente relus à l\'identique ; la partie continue', re.st === sv.st && re.roads === sv.roads && re.n === sv.n && re.zq === sv.zq && Math.abs(re.day - sv.day) <= 1 && re.after, `avant ${JSON.stringify(sv)} après ${JSON.stringify(re)}`);
  t.check('0 erreur de page', pg.errs.length === 0 && p2.errs.length === 0, pg.errs.concat(p2.errs).slice(0, 3).join(' ; '));
  await pg.context().close();
};
