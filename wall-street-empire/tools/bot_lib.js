// Bot « bon joueur » v2 (passe 17) : code injecté dans la page (window.BOT). Il ne triche pas : il n'utilise que place(), autoConnect(), step(), les boutons d'emprunt et de bourse, tradeShares().
// Principe : à chaque tick, il estime le rendement annuel du PROCHAIN bâtiment de chaque famille (commerces, services, mines, centrales...) :
//  - famille non encore construite : rendement a priori mesuré en audit ;
//  - sinon : rendement réalisé du dernier bâtiment construit (profit moyen / capex payé), ce qui reflète la saturation de la demande ;
//  - services (tech, data center, banque) : le bot lit la demande publique de la ville (S._sat) pour prédire la recette marginale.
// Il construit les familles par rendement décroissant tant qu'il est supérieur au taux d'actualisation (taux du prêt + marge), emprunte jusqu'au levier cible,
// bâtit des logements si le chômage est nul, ouvre un port et des mines (exports), s'introduit en bourse puis prend le contrôle de rivaux (scénarios 4 et 5).
window.BOT = (function () {
  const W = window.WSE, N = W.N;
  const S = () => W.S;
  const cell = (x, y) => (x >= 0 && y >= 0 && x < N && y < N) ? S().grid[y * N + x] : null;
  const isRoad = (x, y) => { const c = cell(x, y); return c && c.t === 'road'; };
  // Paramètres de profil. fam : familles autorisées ; lev : levier cible (dette / valorisation) ; hurdle : surprime exigée sur le taux d'intérêt
  const P = { lev: 0.45, idle: 0, reserve: 0.0, buyout: true, maxPerTick: 6, wait: 0, fam: ['s1', 's2', 's3', 's4', 'tech', 'dc', 'bank', 'off', 'miron', 'mcopper', 'mcoal', 'mgold', 'well'], hurdle: 0.10, bourse: true, subs: 0, ipo: false, ipoAt: 100e6, bourseAt: 0.55, resCap: 40, chain: false, exportTarget: 0, demC: { s1: 0.5, s2: 0.45, s3: 0.2, s4: 0.35 } };
  const cnt = {};
  const EXT = { miron: 'iron', mcopper: 'copper', mcoal: 'coal', mgold: 'gold', well: 'oil' };
  const CITY_FAM = ['s1', 's2', 's3', 's4', 'tech', 'dc', 'bank', 'off', 'tv'];
  // EBE/jour a priori par bâtiment (mesuré sur un exemplaire isolé, hors terrain) ; les mines : 40 %/an du capex
  const EBE0 = { s1: 80, s2: 540, s3: 3100, s4: 11500, tech: 60000, dc: 41000, bank: 49500, off: 15000, tv: 7000, miron: 6800, mcopper: 2300, mcoal: 2800, mgold: 5800, well: 6100 };
  const REV0 = { tech: 128000, dc: 94000, bank: 114500 }, SVC_COST = { tech: 68000, dc: 53000, bank: 65000 };
  const born = {};   // famille -> liste de {x,y,paid,day}
  function spots(key) {
    const out = []; const T = W.TYPES[key], w = T.w || 1, h = T.h || 1;
    for (let y = 12; y <= 48; y++) for (let x = 12; x <= 48; x++) {
      if (cell(x, y)) continue; if (W.footprintError(x, y, key)) continue;
      let adj = false; for (let ox = -1; ox <= w && !adj; ox++) for (let oy = -1; oy <= h; oy++) { if ((ox >= 0 && ox < w) && (oy >= 0 && oy < h)) continue; if ((ox < 0 || ox >= w) && (oy < 0 || oy >= h)) continue; if (isRoad(x + ox, y + oy)) { adj = true; break; } }
      if (adj) out.push([x, y, Math.hypot(x - 30, y - 30)]);
    }
    return out;
  }
  function tierOk(key) { return !(W.modeLocked && W.modeLocked(key)); }
  function borrow(need) {
    const b = document.getElementById('loanUp'); let n = 0;
    while (S().cash < need && n++ < 80) {
      const st = S().stats.worth; if ((S().loan || 0) > P.lev * st) break;
      const l0 = S().loan || 0; b.click(); if ((S().loan || 0) === l0) break;
    }
  }
  function repay() { const b = document.getElementById('loanDn'); let n = 0; while ((S().loan || 0) > 0 && S().cash > 2 * (S().loan || 0) + 1e6 && n++ < 20) { const l0 = S().loan; b.click(); if (S().loan === l0) break; } }
  function noteBuilt(key, x, y, paid) { (born[key] || (born[key] = [])).push({ x, y, paid, day: S().day }); cnt[key] = (cnt[key] || 0) + 1; }
  function tryBuild(key) {
    let sp = spots(key);
    if (!sp.length && P.buyout && W.TYPES[key].w == null) {
      let best = null;
      for (let y = 12; y <= 48; y++) for (let x = 12; x <= 48; x++) { const c = cell(x, y); if (!c || c.t !== 'npc') continue; let adj = false; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { if (isRoad(x + d[0], y + d[1])) adj = true; }); if (!adj) continue; const q = (c.floors || 1) + (c.k === 'house' ? -5 : 0); if (!best || q < best.q) best = { x, y, q }; }
      if (best && W.place(best.x, best.y, 'buyout')) sp = spots(key);
    }
    if (!sp.length) return -1;
    sp.sort((a, b) => a[2] - b[2]);
    const retail = key === 's3' || key === 's2' || key === 's1' || key === 's4';
    for (let k = 0; k < Math.min(sp.length, 8); k++) {
      const s = retail ? sp[k] : sp[sp.length - 1 - k];
      const before = S().cash; const ok = W.place(s[0], s[1], key);
      if (ok) { const c = cell(s[0], s[1]); if (c && !c.conn) { W.place(s[0], s[1], 'bull'); continue; } const paid = before - S().cash; noteBuilt(key, s[0], s[1], paid); return paid; }
    }
    return false;
  }
  function tryBuildAny(key) {   // usines : zone industrielle du port (toute la carte est balayée)
    const T = W.TYPES[key], w = T.w || 1, h = T.h || 1, cand = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (cell(x, y) || W.footprintError(x, y, key)) continue; let adj = false; for (let ox = -1; ox <= w && !adj; ox++) for (let oy = -1; oy <= h; oy++) { if ((ox >= 0 && ox < w) && (oy >= 0 && oy < h)) continue; if ((ox < 0 || ox >= w) && (oy < 0 || oy >= h)) continue; if (isRoad(x + ox, y + oy)) { adj = true; break; } } cand.push([adj ? 0 : 1, Math.abs(x - 75) + Math.abs(y - 69), x, y]); }
    cand.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    for (let k = 0; k < Math.min(cand.length, 6); k++) { const [, , x, y] = cand[k], b4 = S().cash; if (!W.place(x, y, key)) continue; const c = cell(x, y); if (c && !c.conn) { W.place(x, y, 'bull'); continue; } const paid = b4 - S().cash; noteBuilt(key, x, y, paid); return paid; }
    return false;
  }
  function portSpot() {
    let best = null; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (cell(x, y) || W.footprintError(x, y, 'port')) continue; const d = Math.abs(x - 30) + Math.abs(y - 30); if (!best || d < best[2]) best = [x, y, d]; }
    return best;
  }
  function ensurePort() {
    if ((S().stats.cn.port || 0) > 0 || cnt.port) return true; if (!tierOk('port')) return false;
    const sp = portSpot(); if (!sp) return false; const b4 = S().cash; if (!W.place(sp[0], sp[1], 'port')) return false; cnt.port = 1; return b4 - S().cash;
  }
  const depCache = {};
  function depQuote(key) {
    const s = S(), c0 = depCache[key]; if (c0 && c0.day === s.day) return c0.q;
    const dep = EXT[key], cand = [];
    for (let i = 0; i < N * N; i++) { const d = s.dep[i]; if (!d || d.k !== dep || !(d.r > 0) || s.grid[i]) continue; const x = i % N, y = (i / N) | 0; if (W.footprintError(x, y, key)) continue; cand.push([Math.abs(x - 75) + Math.abs(y - 69), x, y]); }
    cand.sort((a, b) => a[0] - b[0]);
    const q = cand.slice(0, 6).map(c => ({ x: c[1], y: c[2], tot: Math.round(W.TYPES[key].cost * Math.max(1, s.cpi || 1)) + W.sitePremium(c[1], c[2], key) + (W.landPrice(c[1], c[2]) * 0.3) }));
    depCache[key] = { day: s.day, q }; return q;
  }
  function depBuild(key) {
    if (!ensurePort()) return false;
    const q = depQuote(key); if (!q.length) return -1;
    for (let k = 0; k < q.length; k++) {
      const { x, y } = q[k], b4 = S().cash;
      if (!W.place(x, y, key)) continue;
      try { W.autoConnect(x, y); } catch (e) { /* rien */ }
      const paid = b4 - S().cash; noteBuilt(key, x, y, paid); return paid;
    }
    return false;
  }
  // rendement annuel (EBE / capex payé) du prochain bâtiment de la famille
  function roiOf(key) {
    const s = S(), T = W.TYPES[key], cp = Math.max(1, s.cpi || 1), capex = T.cost * cp * (W.S.caste ? 1 : 1);
    const list = born[key] || [];
    let prior = EBE0[key] != null ? EBE0[key] * cp * 360 / capex : 0.40;
    if (key === 'tech' || key === 'dc' || key === 'bank') {   // prédiction analytique de la recette marginale : D × (1 − e^(−U/D)) / (1 − e^(−1/D))
      const sk = (s._sat || {})[key]; const U = sk ? sk.U : 0, D = sk ? sk.D : Math.max(1, s.pop / ({ tech: 36000, dc: 48000, bank: 32000 })[key]);
      const f = u => (1 - Math.exp(-u / D)) / (1 - Math.exp(-1 / D)); const marg = f(U + 1) - f(U);
      prior = (REV0[key] * marg - SVC_COST[key]) * cp * 360 / capex; if (list.length && !sk) prior *= 0.9;
    }
    const ready = list.filter(b => s.day - b.day >= 30);
    if (!ready.length || key === 'tech' || key === 'dc' || key === 'bank') return { roi: prior, capex };
    const lastR = ready.slice(-2).map(b => { const c = cell(b.x, b.y); if (!c || c.t !== key) return null; const h = c.hist || []; if (h.length < 10) return null; const m = h.slice(-20).reduce((a, v) => a + v, 0) / Math.min(20, h.length); return m * 360 / Math.max(1, b.paid); }).filter(v => v != null);
    if (!lastR.length) return { roi: prior, capex };
    const r = lastR.reduce((a, v) => a + v, 0) / lastR.length;
    return { roi: Math.min(prior * 1.3, r * 0.92), capex };   // le suivant fera un peu moins bien que le dernier
  }
  function pick() {
    const s = S(); const all = [];
    const rate = W.loanRateNow ? W.loanRateNow() : 0.07, hurdle = rate + P.hurdle;
    const room = Math.max(0, Math.min(P.lev * s.stats.worth, W.creditLimit()) - (s.loan || 0));
    P.fam.forEach(k => {
      if (P.demC && P.demC[k] != null && (s.stats.demC == null || s.stats.demC < P.demC[k])) return;   // jauge publique « demande commerce » : on ne ssature pas la ville
      if (!tierOk(k) || !W.TYPES[k] || P.lim && P.lim[k] != null && (cnt[k] || 0) >= P.lim[k]) return;
      if (cnt['x_' + k] && s.day < cnt['x_' + k]) return;   // délai après un échec ou une construction récente
      if ((born[k] || []).some(b => s.day - b.day < (P.mature || 35))) return;   // un seul chantier en cours par famille : on attend de mesurer son rendement réel
      const R = roiOf(k), T = W.TYPES[k];
      let extra = 400000 * (T.w || 1) * (T.h || 1) * 0.02;
      if (EXT[k]) { const q = depQuote(k); if (!q.length) return; extra = q[0].tot - R.capex; if (!(cnt.port || (s.stats.cn.port || 0) > 0)) extra += W.TYPES.port.cost * 1.2; }
      const cost = (R.capex + extra) * 1.05;
      let roi = R.roi; if (EXT[k]) roi = roi * R.capex / (R.capex + Math.max(0, extra));
      const net = roi * (1 - (s.tax || 0.2));
      if (net < hurdle) return;
      all.push({ k, roi: net, cost, afford: cost <= s.cash + room });
    });
    all.sort((a, b) => b.roi - a.roi);
    const aff = all.find(x => x.afford);
    // épargne : si un projet bien plus rentable (≥ 1,5 ×) est hors de portée mais atteignable en 2 ans de profits, on met de côté au lieu de multiplier les petits projets
    const top = all[0];
    if (top && !top.afford && (!aff || top.roi > 1.5 * aff.roi) && top.cost - (s.cash + room) < 500 * Math.max(0, (s.fin && s.fin.net) || 0)) return null;
    return aff || null;
  }
  function bourse() {
    const s = S(), raw = s.stats.raw || 0;
    if (P.ipo && !(s.float > 0) && raw >= P.ipoAt && tierOk('hq')) {
      if (!W.S.stats.cn.hq && !cnt.hq && s.cash > 4e6 * (s.cpi || 1)) { const r = tryBuild('hq'); if (typeof r === 'number' && r > 0) { cnt.hq = 1; } }
      if (cnt.hq || s.stats.cn.hq) { const bo = document.getElementById('bourse'); if (bo) { const b = document.createElement('button'); b.id = 'ipo'; bo.appendChild(b); b.click(); b.remove(); } }
    }
    // prise de contrôle : 51 % des actions du rival le moins cher, tant qu'il en faut (P.subs)
    const want = P.subs, have = (s.rivals || []).filter(r => r.sub).length, D = W.modeDays ? W.modeDays() : 0;
    if (want > have && (!D || s.day >= P.bourseAt * D)) {
      const rs = (s.rivals || []).filter(r => !r.sub).sort((a, b) => W.rivalValueOf ? 0 : 0);
      rs.sort((a, b) => (a.cash + 1e8 * (a.att.basic + a.att.std + a.att.lux)) - (b.cash + 1e8 * (b.att.basic + b.att.std + b.att.lux)));
      const r = rs[0]; if (!r) return;
      const h = (s.port || {})[r.id], have2 = h ? h.n : 0, need = Math.ceil(0.52 * 5000) - have2;
      if (need > 0) { const est = (W.ranking().find(x => x.id === r.id) || { v: 1e8 }).v * 0.55 * 1.25; if (s.cash < est) borrow(est); if (s.cash >= est) W.tradeShares(r.id, need, true); }
    }
  }
  function prune() {   // démolit les mines épuisées (recette nulle, entretien et salaires qui continuent)
    const s = S();
    Object.keys(EXT).forEach(k => { (born[k] || []).slice().forEach(b => { const c = cell(b.x, b.y); if (!c || c.t !== k) { born[k].splice(born[k].indexOf(b), 1); return; } if ((c.days || 0) > 60 && (c.pRev || 0) < 1 && (c.profit || 0) < 0) { W.place(b.x, b.y, 'bull'); born[k].splice(born[k].indexOf(b), 1); cnt['p_' + k] = (cnt['p_' + k] || 0) + 1; } }); });
  }
  // missions de scénario : une usine et 2 produits sans R&D (scénario 2+), des exports réguliers (scénario 3), bourse et rachats (4 et 5)
  function missions() {
    const s = S(), mk = (s.mode && s.mode.k) || '';
    if (P.chain && !cnt.chain && s.cash > 4e6 * Math.max(1, s.cpi || 1)) {
      const r = tryBuildAny('f1');
      if (typeof r === 'number' && r > 0) { cnt.chain = 1; ['bread', 'soap', 'glassware', 'utensils'].forEach(pk => { const ps = s.prod[pk]; if (ps && ps.st === 'locked') { W.launchProduct(pk); } if (ps && ps.st === 'on') { W.assignProduct(pk, 1); try { W.autoChain(pk); } catch (e) { /* rien */ } } }); }
    }
    if (P.exportTarget && ((s.fin && s.fin.revExport) || 0) * 30 < P.exportTarget && (s.day % 16 === 0)) {   // exports : mines au meilleur rendement, quel que soit le seuil de rentabilité
      const rate = W.loanRateNow ? W.loanRateNow() : 0.07; const ks = ['miron', 'mgold', 'well', 'mcopper', 'mcoal'].filter(k => tierOk(k));
      for (const k of ks) { if (cnt['x_' + k] && s.day < cnt['x_' + k]) continue; if ((born[k] || []).some(b => s.day - b.day < 35)) continue; const q = depQuote(k); if (!q.length) continue; const cost = q[0].tot * 1.1 + (cnt.port ? 0 : W.TYPES.port.cost * 1.2); if (cost > s.cash + 0.5 * (P.lev * s.stats.worth - (s.loan || 0))) continue; if (s.cash < cost) borrow(cost + 1e5); if (s.cash < cost) continue; const r = depBuild(k); if (r > 0) { cnt['x_' + k] = s.day + 12; break; } }
    }
  }

  // ===== Profil industriel (passe 21) : chaînes verticales mine/ferme -> composants -> usine du produit -> magasins (les magasins viennent de pick()) =====
  // Principe : on ne construit une chaîne que dimensionnée (usines de composants = besoins de l'arborescence, extracteurs = besoins en matière), on la laisse mûrir,
  // puis on l'agrandit tant que ses ventes absorbent toute sa production (stock sous le plafond de couverture) ; les matières en excédent partent à l'export.
  const RAWK = { oil: 'well', iron: 'miron', coal: 'mcoal', copper: 'mcopper', gold: 'mgold', wheat: 'fwheat', sugar: 'fsugar', cotton: 'fcotton', rubber: 'frubber', wood: 'logging', gravel: 'qgravel', sand: 'qsand', limestone: 'qlime' };
  Object.keys(RAWK).forEach(g => { EXT[RAWK[g]] = g; });
  const IND = { chains: {}, last: -99, log: [], dem: {}, leaf: {} };   // dem / leaf : besoins CUMULÉS de toutes les chaînes (usines par composant, matières par cycle)
  const FK = ['', 'f1', 'f2', 'f3', 'f4'];
  function needs(pk, sc) {   // usines nécessaires par composant (en unités d'usine) et matières premières par cycle de l'usine du produit
    const need = {}, leaf = {}, expand = (g, q) => { if (g === 'ingot') { const F = W.TYPES.foundry.rec; leaf.ingot = (leaf.ingot || 0) + q; leaf.gold = (leaf.gold || 0) + q * F.in.gold / F.out.ingot; return; } const R = W.RECIPES[g]; if (!R) { leaf[g] = (leaf[g] || 0) + q; return; } const u = q / R.out; need[g] = (need[g] || 0) + u; Object.keys(R.in).forEach(i => expand(i, u * R.in[i])); };
    const inp = Object.assign({}, W.productInputs(pk)); if (W.PRODUCTS[pk].cls === 'basic') delete inp.pack;   // un produit de base se lance sans emballage
    Object.keys(inp).forEach(g => expand(g, inp[g] * sc)); return { need, leaf };
  }
  const CYC = 16 * 0.9;   // cycles de recette par jour et par usine (FAC_U x effectif)
  function delta(pk, sc) {   // besoins supplémentaires quand la chaîne passe de son échelle actuelle à sc
    const n1 = needs(pk, sc), n0 = IND.chains[pk] ? needs(pk, IND.chains[pk].sc) : { need: {}, leaf: {} }, d = { need: {}, leaf: {} };
    Object.keys(n1.need).forEach(g => { d.need[g] = n1.need[g] - (n0.need[g] || 0); }); Object.keys(n1.leaf).forEach(g => { d.leaf[g] = n1.leaf[g] - (n0.leaf[g] || 0); }); return d;
  }
  function plan(pk, sc) {   // ce qu'il faut construire : {fac:{clé:n}, ext:{clé:n}}
    const P0 = W.PRODUCTS[pk], d = delta(pk, sc), out = { fac: {}, ext: {} }, cn = S().stats.cn || {};
    const add = (o, k, n) => { if (n > 0) o[k] = (o[k] || 0) + n; };
    Object.keys(d.need).forEach(g => { const tot = (IND.dem[g] || 0) + d.need[g], k = FK[W.RECIPES[g].lvl]; add(out.fac, k, Math.ceil(tot - W.unitsOn(g) - 0.05)); });
    // les composants d'un même niveau partagent les mêmes usines : on compte le total par niveau (les recettes de niveau 1 peuvent tourner sur n'importe quelle usine libre)
    add(out.fac, FK[P0.lvl], Math.max(0, sc - W.facCounts(pk).mine));
    Object.keys(d.leaf).forEach(g => { const tot = (IND.leaf[g] || 0) + d.leaf[g]; if (g === 'ingot') { const per = W.TYPES.foundry.rec.out.ingot * CYC; add(out.ext, 'foundry', Math.ceil(tot * CYC / per - 0.05) - (cn.foundry || 0)); return; } const k = RAWK[g]; if (!k || !tierOk(k)) return; add(out.ext, k, Math.ceil(tot * CYC / (W.TYPES[k].rate * 0.85) - 0.05) - (cn[k] || 0)); });
    return out;
  }
  function indCost(pk, sc) {
    const P0 = W.PRODUCTS[pk], pl = plan(pk, sc), cp = Math.max(1, S().cpi || 1); let c = 0;
    Object.keys(pl.fac).forEach(k => { c += pl.fac[k] * W.TYPES[k].cost * cp; }); Object.keys(pl.ext).forEach(k => { c += pl.ext[k] * W.TYPES[k].cost * cp * (k === 'foundry' ? 1 : 1.15); });
    if (S().prod[pk].st === 'locked' && !P0.free) c += P0.rnd * [0.6, 1, 1.8][S().prod[pk].q];
    return c;
  }
  function buildChain(pk, sc) {
    const s = S(); if (!ensurePort()) return false;
    if (s.prod[pk].st === 'locked') { if (!W.launchProduct(pk)) return false; }
    const d = delta(pk, sc), pl = plan(pk, sc); let paid = 0, ok = true;
    // 1) extracteurs et fonderie ; 2) usines de composants ; 3) l'usine du produit EN DERNIER (une grande usine sans composants brûle ses salaires pour rien)
    Object.keys(pl.ext).forEach(k => { for (let i = 0; i < pl.ext[k]; i++) { let r; if (k === 'foundry') { r = tryBuildAny('foundry'); } else { const q = depQuote(k); if (!q.length) break; if (s.cash < q[0].tot * 1.05) borrow(q[0].tot * 1.05 + 1e5); r = depBuild(k); } if (!(r > 0)) break; paid += r; } });
    const prodK = FK[W.PRODUCTS[pk].lvl];
    Object.keys(pl.fac).filter(k => k !== prodK).concat(pl.fac[prodK] ? [prodK] : []).forEach(k => { for (let i = 0; i < pl.fac[k]; i++) { if (s.cash < W.TYPES[k].cost * 1.1) borrow(W.TYPES[k].cost * 1.1 + 1e5); const r = tryBuildAny(k); if (!(r > 0)) { ok = false; break; } paid += r; } });
    Object.keys(d.need).forEach(g => { IND.dem[g] = (IND.dem[g] || 0) + d.need[g]; }); Object.keys(d.leaf).forEach(g => { IND.leaf[g] = (IND.leaf[g] || 0) + d.leaf[g]; });
    // affectations explicites : composants d'abord (cumul de toutes les chaînes), produit ensuite
    Object.keys(IND.dem).forEach(g => { const n = Math.ceil(IND.dem[g] - W.unitsOn(g) - 0.05); if (n > 0) W.assignRecipe(g, n, true); });
    const np = sc - W.facCounts(pk).mine; if (np > 0) W.assignProduct(pk, np);
    return ok ? paid : paid;
  }
  function chainsStatus() { const s = S(); return Object.keys(IND.chains).map(pk => { const ps = s.prod[pk], ch = IND.chains[pk]; return { pk, sc: ch.sc, st: ps.st, sold: ps.sold, made: ps.made, stock: ps.stock, age: s.day - ch.day, rr: ps.rr }; }); }
  // rendement annuel a priori (EBITDA global / capex) d'une chaîne verticale bien construite, mesuré par tools/chain_audit.js (passe 21) ; le surplus part à l'export
  const PRIOR = { bread: 0.30, utensils: 0.36, soap: 0.22, glassware: 0.22, tshirt: 0.2, jeans: 0.27, bike: 0.32, cream: 0.25, blender: 0.25, headache: 0.30, cough: 0.35, watch: 0.60, jewelry: 0.26, perfume: 0.30, handbag: 0.3, skincare: 0.35 };
  function prodProfit(pk) {   // EBE moyen (20 derniers jours) des usines du produit
    let t = 0, n = 0; for (let i = 0; i < N * N; i++) { const c = S().grid[i]; if (!c || c.prod !== pk || c.x + c.y * N !== i) continue; const h = (c.hist || []).slice(-20); if (h.length < 10) continue; t += h.reduce((a, v) => a + v, 0) / h.length; n++; }
    return n ? t : null;
  }
  function doctor() {   // démolit les usines de produit qui tournent à vide depuis longtemps (une grande usine inactive brûle ses salaires)
    const s = S();
    Object.keys(IND.chains).forEach(pk => { const ch = IND.chains[pk]; if (ch.dead || s.day - ch.day < 150) return; let n = 0, u = 0, list = [];
      for (let i = 0; i < N * N; i++) { const c = s.grid[i]; if (!c || c.prod !== pk || c.x + c.y * N !== i) continue; n++; u += c.util || 0; list.push(c); }
      if (n && u / n < 0.25) ch.low = (ch.low || 0) + 1; else ch.low = 0;
      if (n && ch.low >= 4) { list.forEach(c => { W.place(c.x, c.y, 'bull'); }); ch.dead = true; IND.log.push([s.day, 'demolished', pk, n]); } });
  }
  // plus de ports = import moins cher (surcoût 30 % -> 5 % avec 5 ports) : les gisements s'épuisent, les usines continuent d'importer leurs matières
  function morePorts() {
    const s = S(), have = s.stats.cn.port || 0, want = Math.min(5, 1 + Object.keys(IND.chains).length); if (!Object.keys(IND.chains).length || have >= want || s.cash < 1.5 * W.TYPES.port.cost * Math.max(1, s.cpi || 1)) return;
    const sp = portSpot(); if (!sp) return; W.place(sp[0], sp[1], 'port');
  }
  function industry() {
    if (S().day - (IND.doc || -99) >= 30) { IND.doc = S().day; doctor(); if (P.morePorts) morePorts(); }
    const s = S(); if (s.day - IND.last < (P.indEvery || 12)) return; const tn = W.tierNow ? W.tierNow() : 0;
    const rate = W.loanRateNow ? W.loanRateNow() : 0.07, room = Math.max(0, Math.min((P.indLev || P.lev) * s.stats.worth, W.creditLimit()) - (s.loan || 0)), avail = s.cash + room;
    if (chainsStatus().some(c => c.st === 'rnd')) return;   // R&D en cours : on attend
    const order = P.prods || ['bread', 'utensils', 'bike', 'jeans', 'headache', 'cream', 'blender', 'perfume'], cands = [];
    for (const pk of order) {
      const P0 = W.PRODUCTS[pk]; if (!P0 || P0.tier > tn || (W.modeLocked && W.modeLocked(pk))) continue; const fk = FK[P0.lvl]; if (!tierOk(fk)) continue;
      const ch = IND.chains[pk], sc = ch ? ch.sc + 1 : 1; if (sc > (P.maxScale || 8)) continue;
      if (ch) { if (ch.dead || s.day - ch.day < (P.indMature || 60)) continue; const pf = prodProfit(pk), ps = s.prod[pk]; if (pf != null && pf < 0) { ch.bad = (ch.bad || 0) + 1; continue; }
        if (!(ps.sold > 0.8 * ps.made && ps.stock < 0.6 * W.prodRoom(pk))) continue; }   // on n'agrandit que si les ventes locales absorbent la production : le surplus partirait à l'export à ~72 % du cours, donc à perte pour un produit à 17-20 % de marge
      const roi = (PRIOR[pk] || 0.25) * (1 - 0.015 * (sc - 1)), net = roi * (1 - (s.tax || 0.2)); if (net < rate + (P.hurdle || 0.05)) continue;
      cands.push({ pk, sc, roi, cost: indCost(pk, sc) * 1.1 });
    }
    const net0 = Math.max(1, (s.fin && s.fin.net) || 0), reach = cands.filter(c => c.cost <= avail + 700 * net0).sort((a, b) => b.roi - a.roi);   // projets atteignables en ~2 ans de profit
    IND.dbg = { day: s.day, tn, avail: Math.round(avail), cands: cands.slice(0, 4).map(c => [c.pk, c.sc, Math.round(c.cost)]), reach: reach.map(c => c.pk) };
    const aff = reach[0];
    if (!aff) { IND.save = null; return; }
    if (aff.cost > avail) { IND.save = s.day; return; }   // on met de côté : le commerce ne dépense plus
    if (s.cash < aff.cost) borrow(aff.cost + 1e5); if (s.cash < aff.cost) return;
    const r = buildChain(aff.pk, aff.sc);
    if (r > 0 || r === 0) { IND.chains[aff.pk] = { sc: aff.sc, day: s.day }; IND.last = s.day; IND.log.push([s.day, aff.sc > 1 ? 'grow' : 'new', aff.pk, aff.sc, Math.round(r || 0)]); }
  }
  function tick() {
    const s = S(); let did = 0, spent = 0;
    if (s.day % 20 === 0) prune();
    if (s.day % 8 === 0) missions();
    if (P.industry) industry();
    if (P.idle > 0 && ((s.day * 2654435761) >>> 0) % 1000 < P.idle * 1000) return { did: 0, spent: 0 };
    if (s.stats.unemp < 0.02 && s.cash > 1.5e6 && (cnt.res || 0) < P.resCap) { for (let i = 0; i < 3; i++) { const r = tryBuild('res'); if (r) { spent += r; did++; } } }
    for (let n = 0; n < P.maxPerTick; n++) {
      if (P.industry && IND.save != null && s.day - IND.save < 40) break;   // épargne pour une chaîne
      const b = pick(); if (!b) break;
      if (s.cash < b.cost) borrow(b.cost + 1e5);
      if (s.cash < b.cost) break;
      const r = EXT[b.k] ? depBuild(b.k) : tryBuild(b.k);
      if (r === -1) { P.lim = P.lim || {}; P.lim[b.k] = cnt[b.k] || 0; continue; }
      if (!r) { cnt['x_' + b.k] = s.day + 20; (window.__blog || (window.__blog = [])).push(['fail', b.k, s.day, Math.round(s.cash), Math.round(b.cost)]); continue; }
      cnt['x_' + b.k] = s.day + (EXT[b.k] ? 12 : 8); spent += r; did++;
    }
    if (P.bourse && s.day % 8 === 0) bourse();
    return { did, spent };
  }
  return { tick, cnt, P, pick, spots, repay, born, roiOf, depQuote, IND, chainsStatus, indCost, needs, plan };
})();
