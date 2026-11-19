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
  const CITY_FAM = ['s1', 's2', 's3', 's4', 'tech', 'bank', 'off', 'tv'];   // passe 55 : le data center (campus 5×4) se construit hors de la ville
  // EBE/jour a priori par bâtiment (mesuré sur un exemplaire isolé, hors terrain) ; les mines : 40 %/an du capex
  const EBE0 = { sauto: 100, stech: 2000, slux: 900, smode: 1200, spharma: 650, shome: 400, ssport: 50, sbrico: 30, s1: 80, s2: 540, s3: 3100, s4: 11500, tech: 60000, dc: 70000, bank: 49500, off: 15000, tv: 7000, miron: 6800, mcopper: 2300, mcoal: 2800, mgold: 5800, well: 6100 };
  const REV0 = { tech: 128000, dc: 336000, bank: 114500 }, SVC_COST = { tech: 68000, dc: 265000, bank: 65000 };   // passe 55 : campus data center alimenté par le réseau (≈ 150 000 $/j d'électricité)
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
    const retail = key === 's3' || key === 's2' || key === 's1' || key === 's4' || !!(W.spec && W.spec.T[key]);
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
    // passe 46 : magasins spécialisés, dès que leur famille est connue et le palier atteint (P.spec = false pour les exclure)
    const specK = P.spec === false || !W.spec ? [] : W.spec.KEYS.filter(k => P.fam.indexOf(k) < 0 && !W.spec.locked(k) && (W.tierNow ? W.tierNow() : 0) >= (W.TYPES[k].tier || 0));
    P.fam.concat(specK).forEach(k => {
      const dc = P.demC && P.demC[k] != null ? P.demC[k] : specK.indexOf(k) >= 0 ? (P.specDemC != null ? P.specDemC : 0.2) : null;
      if (P.demC && dc != null && (s.stats.demC == null || s.stats.demC < dc)) return;   // jauge publique « demande commerce » : on ne sature pas la ville
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
      all.push({ k, roi: net, cost, afford: cost <= s.cash - (P.keep || 0) + room });
    });
    all.sort((a, b) => b.roi - a.roi);
    const aff = all.find(x => x.afford);
    // épargne : si un projet bien plus rentable (≥ 1,5 ×) est hors de portée mais atteignable en 2 ans de profits, on met de côté au lieu de multiplier les petits projets
    const top = all[0];
    if (top && !top.afford && (!aff || top.roi > 1.5 * aff.roi) && top.cost - (s.cash - (P.keep || 0) + room) < 500 * Math.max(0, (s.fin && s.fin.net) || 0)) return null;
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
  // Banquier (P.bank) : tous les 30 jours, prête la marge disponible de sa banque (moitié entreprises, moitié immobilier) tant que le ratio CET1 garde 2 points
  // au-dessus du minimum réglementaire ; en crise du crédit ou en récession, il ne prête plus (les défauts rongent les fonds propres).
  const BK = { last: -99 };
  function bank() {
    const s = S(), B = W.bank; if (!B || s.caste !== 'banquier' || s.day - BK.last < 30) return; BK.last = s.day;
    const b = B.init(); if (b.fail || (s.macro && s.macro.gdp < 0) || (W.macro && W.macro.shockI('credit') > 0)) return;
    if (B.ratio(b) < B.min() + 0.02) return;
    ['corp', 'immo'].forEach(k => { const q = 0.5 * B.cap(k); if (q > 1e6) B.lend(q, k); });
  }
  // passe 46 : commerce en ligne (P.ecom) : à partir du palier Industriel, lance la startup, un entrepôt en ligne près du port, puis ajoute de la capacité
  // (entrepôt ou data center) quand le goulot est mesuré et que la plateforme est rentable sur 30 jours
  const EC = { last: -99, log: [] };
  function ecom() {
    const s = S(), E = W.ecom; if (!E || s.day - EC.last < 15) return; EC.last = s.day;
    if ((E.tier ? E.tier() : 0) < (P.ecTier != null ? P.ecTier : 2) || !tierOk('ewh')) return;   // palier Industriel (valeur de l'empire), même quand tout est débloqué
    const cp = Math.max(1, s.cpi || 1), wc = W.TYPES.ewh.cost * cp;
    if (!E.st()) { const need = E.LAUNCH * cp + wc * 1.1; if (s.cash < need) borrow(need + 1e5); if (s.cash < need || !ensurePort()) return; if (!E.launch()) return; E.set('disc', P.ecDisc != null ? P.ecDisc : 0.08); E.set('ad', P.ecAd != null ? P.ecAd : 1500); EC.log.push([s.day, 'launch']); }
    const list = E.list(), L = E.st().last || {}, K = E.kpi();
    const add = k => { const c0 = k === 'dc' ? W.TYPES.dc.cost * cp : wc; if (s.cash < c0 * 1.05) borrow(c0 * 1.05 + 1e5); if (s.cash < c0 * 1.05) return false; const r = k === 'dc' ? tryBuildAny('dc') : tryBuildAny('ewh'); if (r > 0) { cnt[k] = (cnt[k] || 0) + 1; EC.log.push([s.day, k, Math.round(r)]); return true; } return false; };
    if (!list.length) { add('ewh'); return; }
    if (!K || s.day - (EC.lastAdd || 0) < 60) return;
    if (L.lostSite > 0.08 * L.O && K.eb > 0) { if (add('dc')) EC.lastAdd = s.day; return; }
    if (L.U >= 0.9 * L.scap && K.eb > 0 && list.length < (P.ecMax || 6)) { if (add('ewh')) EC.lastAdd = s.day; }
  }
  // ============================================================================================================  // Passe 67 : playbooks de caste (P.play = 'banquier' | 'negociant' | 'industriel' | 'agriculteur').
  // Chaque playbook joue ce qu'un joueur EXPERT de la caste ferait avec les outils de sa caste, dans l'ordre, chiffres du jeu à l'appui ;
  // il ne triche pas : uniquement les fonctions du jeu (place, outils BTP, banque, terminal financier, fiche de ferme...). CP.n compte les actions emblématiques (test t68).
  const CP = { n: {}, log: [], bk: { last: -99, inv: -99 }, tr: { last: -99, car: -99, emb: -99, pl: -99, pipe: -99 }, ag: { last: -99 }, ba: { last: -99 } };
  const nb4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const roadAdj = (x, y) => nb4.some(d => isRoad(x + d[0], y + d[1]));
  function note(k, info) { CP.n[k] = (CP.n[k] || 0) + 1; if (CP.log.length < 400) CP.log.push([S().day, k, info == null ? '' : info]); }
  function roomOf(levK) { const s = S(); return Math.max(0, Math.min((levK || P.lev) * s.stats.worth, W.creditLimit()) - (s.loan || 0)); }
  function fund(need) { if (S().cash < need) borrow(need + 1e5); return S().cash >= need; }

  // ----- Banquier d'affaires : la banque (100 M$ de CET1) prête autant que le permettent la demande de crédit de la ville (≈ 3 000 $ par habitant),
  // le ratio CET1 (≥ 10,5 % des actifs pondérés), le levier ×10 et surtout le LCR : sorties stressées de 30 jours = 8 % de l'encours × stress, couvertes par la trésorerie
  // du banquier. Un dollar de trésorerie porte donc 12,5 $ de crédits, qui rapportent taux + 3 points − 1,5 point de pertes (entreprises) : l'expert garde un coussin de liquidité
  // (financé au besoin par l'emprunt de la banque, à −40 % d'intérêt) au lieu de tout dépenser en magasins, et adapte le portefeuille au cycle :
  //  croissance ≥ 1,5 % : entreprises (meilleure marge nette) ; croissance molle : immobilier (pondéré 50 %) ; récession ou crise du crédit (pertes ×3 à ×7) : il rappelle
  //  les crédits risqués et prête au souverain (pondéré 0 %, perte 0,1 %/an). Il souscrit aux tours de table des rivaux (10 à 18 % sous le cours) dans la limite des 20 %
  //  de fonds propres tradables, et passe la banque au niveau « Monopole » (+1 point de marge entreprises) quand l'encours dépasse 12 M$ en période de croissance.
  function portVal() { const s = S(); let v = 0; Object.keys(s.port || {}).forEach(id => { const r = (s.rivals || []).find(x => x.id === id); if (r) v += s.port[id].n * W.riv.value(r) / 5000 * (1 + (r.mood || 0)); }); return v; }
  function banker() {
    const s = S(), B = W.bank, R = CP.bk; if (!B || s.caste !== 'banquier' || s.day - R.last < (P.bkEvery || 5)) return; R.last = s.day;
    const b = B.init(); if (b.fail) return;
    const M = s.macro || {}, gdp = M.gdp == null ? 0.03 : M.gdp, shock = W.macro ? W.macro.shockI('credit') : 0, stress = 1 + 1.5 * shock + (gdp < 0 ? 0.5 : 0);
    const bad = gdp < 0 || shock > 0.05, soft = !bad && gdp < 0.015;
    // 1) cycle : en récession / crise, rappel des crédits risqués (entreprises puis immobilier), au pair
    if (bad && (b.lt.corp + b.lt.immo) > 0) { const q = b.lt.corp + (gdp < 0 ? b.lt.immo : 0); if (q > 0) { B.repay(q); note('bk_recall', Math.round(q / 1e6) + ' M$'); } }
    // 2) coussin de liquidité : LCR visé 115 % sur l'encours actuel + la croissance possible (demande, CET1, levier)
    const L = B.limits(bad ? 'sov' : soft ? 'immo' : 'corp'), grow = Math.max(0, Math.min(L.dem, L.lev, L.cet));
    const want = Math.min(b.loans + grow, b.loans * 1.5 + 20e6);
    P.keep = 0.08 * stress * want * 1.15 + 0.05 * (s.loan || 0);
    if (s.cash < P.keep) borrow(P.keep + 1e5);
    // 3) prêter jusqu'à la contrainte la plus étroite, au type adapté au cycle
    const types = bad ? ['sov'] : soft ? ['immo', 'sov'] : ['corp', 'immo', 'sov'];
    for (const t of types) { const q = 0.97 * B.cap(t); if (q > 2e5 && B.lend(q, t)) note('bk_lend_' + t, Math.round(q / 1e6) + ' M$'); }
    // 4) niveau Monopole
    if (b.lvl === 0 && b.loans >= 12e6 && gdp >= 0.02 && W.bkUp) { W.bkUp(); if (B.init().lvl > 0) note('bk_up'); }
    // 5) participations : tours de table des rivaux (décote 10-18 %), dans la limite prudentielle (20 % des fonds propres)
    // 6) modèle « holding » : participations durables dans les rivaux qui composent le plus vite (croissance de valeur sur 180 jours), vendues s'ils déclinent ; la valeur
    //    des actions suit celle des sociétés : le banquier capte leur croissance sans la leur prendre (somme positive)
    R.h = R.h || {}; if (s.day % 30 < (P.bkEvery || 5)) (s.rivals || []).forEach(r => { (R.h[r.id] = R.h[r.id] || []).push([s.day, W.riv.value(r)]); if (R.h[r.id].length > 12) R.h[r.id].shift(); });
    const gr = r => { const h = R.h[r.id] || []; if (h.length < 7) return null; const a = h[h.length - 7][1], z = h[h.length - 1][1]; return a > 0 ? z / a - 1 : null; };
    if (s.day - (R.hold || -99) >= 30) { R.hold = s.day; const lim = 0.2 * b.res, pv = portVal(), rs = (s.rivals || []).filter(r => !r.sub && gr(r) != null).sort((a, c) => gr(c) - gr(a));
      const bad = rs.filter(r => gr(r) < -0.05 && ((s.port || {})[r.id] || { n: 0 }).n > 0); bad.forEach(r => { if (W.tradeShares(r.id, s.port[r.id].n, false)) note('bk_sell', r.name); });
      const top = rs[0]; if (top && gr(top) > 0.08) { const px = W.riv.value(top) / 5000 * (1 + (top.mood || 0)), room = Math.min(lim * 0.95 - pv, s.cash - P.keep), q = Math.min(250, Math.floor(room / (px * 1.08))); if (q >= 50 && W.tradeShares(top.id, q, true)) note('bk_hold', top.name + ' +' + Math.round(gr(top) * 100) + ' %/6 mois'); } }
    (s.inv || []).slice().forEach(q => { const i = s.inv.indexOf(q), cost = q.qty * q.px, lim = 0.2 * b.res; if (i < 0) return; if (portVal() + cost > lim) return; if (!fund(cost + P.keep)) return; if (W.inv.sub(i)) note('bk_stake', q.id); });
  }

  // ----- Négociant en matières : extraction exportée (+15 %), énergie (+30 % sur l'électricité, centrales −20 %), pipelines (−40 %), cartels (−50 %).
  // Chiffres du jeu : une centrale à charbon (1,6 M$ pour la caste) brûle 500 t/j et livre 300 MWh/j ; une mine de charbon (1 750 t/j) en alimente trois ;
  // le réseau paie 30 $/MWh × cpi (jusqu'à ×2,6 en pénurie, ×0,45 en surplus). Mesuré : centrale + mine, prix 22 $ : EBE ≈ 2 000 $/j (≈ 47 %/an) ;
  // éolienne (1,75 M$, sans combustible) ≈ 3 300-4 500 $/j de recettes. L'expert couvre la demande du réseau (sans la noyer : prix visé ≥ 24 $/MWh),
  // brûle son propre charbon (achemine charbon et pétrole par pipeline : transport ÷ 5), et forme un cartel de 20 jours (60 000 $ pour la caste) sur la matière
  // qu'il produit le plus quand ~3 jours de recettes de cette matière (effet mesuré du cartel) dépassent 1,2 fois le coût. Pas d'embargo gratuit : il ne s'en sert que pour riposter
  // à une guerre des prix qu'un rival lui mène (principe du jeu à somme positive).
  function extRev(g) { let v = 0; for (let i = 0; i < N * N; i++) { const c = S().grid[i]; if (!c || c.x + c.y * N !== i || !W.TYPES[c.t] || W.TYPES[c.t].ext !== g) continue; v += c.pRev || 0; } return v; }
  function ringCells(x, y, w, h) { const o = []; for (let ox = -1; ox <= w; ox++) for (let oy = -1; oy <= h; oy++) { if (ox >= 0 && ox < w && oy >= 0 && oy < h) continue; if ((ox < 0 || ox >= w) && (oy < 0 || oy >= h)) continue; o.push([x + ox, y + oy]); } return o; }
  function powerSite(key) {   // emplacement touchant une rue, avec une case de pylône raccordable à la ville (voisine d'une case urbaine)
    const T = W.TYPES[key], w = T.w || 1, h = T.h || 1; let best = null;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (W.footprintError(x, y, key)) continue; const ring = ringCells(x, y, w, h); if (!ring.some(p => isRoad(p[0], p[1]))) continue;
      const py = ring.find(p => !cell(p[0], p[1]) && !W.footprintError(p[0], p[1], 'pylon') && [-1, 0, 1].some(a => [-1, 0, 1].some(b => { const X = p[0] + a, Y = p[1] + b; return X >= 0 && Y >= 0 && X < N && Y < N && W.ZONE[Y * N + X] === 1; })));
      if (!py) continue; const d = Math.abs(x - 30) + Math.abs(y - 30) + (W.ZONE[y * N + x] === 1 ? 40 : 0); if (!best || d < best.d) best = { x, y, py, d };
    }
    return best;
  }
  function powerBuild(key) {
    const sp = powerSite(key); if (!sp) return false; const b4 = S().cash;
    if (!W.place(sp.x, sp.y, key)) return false; if (!W.place(sp.py[0], sp.py[1], 'pylon')) { W.place(sp.x, sp.y, 'bull'); return false; }
    noteBuilt(key, sp.x, sp.y, b4 - S().cash); return b4 - S().cash;
  }
  function pipeTo(c) {   // pipeline de la mine (ou du puits) vers un terminal (zone portuaire, quai, centrale, port, fonderie, entrepôt) ; une rue se franchit d'un saut
    const s = S(), T = W.TYPES[c.t], term = (x, y) => [-1, 0, 1].some(a => [-1, 0, 1].some(b => { const X = x + a, Y = y + b; if (X < 0 || Y < 0 || X >= N || Y >= N) return false; const z = W.ZONE[Y * N + X], o = cell(X, Y); return z === 2 || z === 4 || (o && (o.t === 'plant' || o.t === 'port' || o.t === 'foundry' || o.t === 'wh')); }));
    const prev = new Map(), q = [];
    ringCells(c.x, c.y, T.w || 1, T.h || 1).forEach(p => { if (p[0] < 0 || p[1] < 0 || p[0] >= N || p[1] >= N) return; const k = p[1] * N + p[0]; if (!s.grid[k] && !W.footprintError(p[0], p[1], 'pipeline') && Math.abs(p[0] - c.x) + Math.abs(p[1] - c.y) > 0) { prev.set(k, -1); q.push(k); } });
    let end = -1;
    for (let h = 0; h < q.length && q.length < 6000; h++) {
      const k = q[h], x = k % N, y = (k / N) | 0; if (term(x, y)) { end = k; break; }
      if (prev.size > 4000) break;
      nb4.forEach(d => { for (let st = 1; st <= 2; st++) { const X = x + d[0] * st, Y = y + d[1] * st; if (X < 0 || Y < 0 || X >= N || Y >= N) return; const j = Y * N + X, o = s.grid[j]; if (o && o.t === 'road' && st === 1) continue; if (o || W.footprintError(X, Y, 'pipeline')) return; if (!prev.has(j)) { prev.set(j, k); q.push(j); } return; } });
    }
    if (end < 0) return 0; const path = []; for (let k = end; k >= 0; k = prev.get(k)) path.push(k); if (path.length > 60) return 0;
    let n = 0; path.forEach(k => { if (W.place(k % N, (k / N) | 0, 'pipeline')) n++; }); return n;
  }
  function trader() {
    const s = S(), R = CP.tr; if (s.caste !== 'negociant' || s.day - R.last < 8) return; R.last = s.day; const cp = Math.max(1, s.cpi || 1);
    // 1) énergie : couvrir la demande du réseau tant que le prix après ajout reste ≥ 24 $/MWh (×cpi)
    const pw = s.power; if (pw && s.day - R.pl >= 30 && tierOk('plant')) {
      const nCoal = (born.mcoal || []).length, nPlant = (born.plant || []).length, fuel = nCoal * 1750 * 0.8 - 500 * nPlant;
      let sup = 0; ['plant', 'wind'].forEach(k => (born[k] || []).forEach(b => { const c = cell(b.x, b.y); if (c && c.t === k) sup += c._mwh || (k === 'plant' ? 286 : 87); }));   // offre réelle de ses centrales (l'instantané S.power peut dater d'avant la production du jour)
      const key = fuel >= 500 ? 'plant' : 'wind', add = key === 'plant' ? 286 : 87, r1 = (pw.B + sup + add) / Math.max(1, pw.D);
      const px1 = 30 * cp * (r1 < 1 ? 1 + 1.6 * (1 - r1) : Math.max(0.45, 1 / r1)), cost = W.TYPES[key].cost * cp * (key === 'plant' ? 0.8 : 1) * 1.05;
      const lastP = (born[key] || []).filter(b => s.day - b.day >= 40).slice(-1)[0], lc = lastP && cell(lastP.x, lastP.y), lh = lc && lc.hist ? lc.hist.slice(-20) : null;
      const okR = !lh || lh.length < 10 || lh.reduce((a, v) => a + v, 0) / lh.length * 360 >= 0.25 * lastP.paid;   // l'expert regarde le compte de la dernière centrale : moins de 25 %/an, il arrête
      if (okR && px1 >= (key === 'plant' ? 24 : 30) * cp && fund(cost + 2e5)) { const r = powerBuild(key); if (r > 0) { R.pl = s.day; note('tr_' + key, Math.round(px1) + ' $/MWh'); } else R.pl = s.day - 20; }
      if (fuel < 500 && nPlant + 1 > 0 && px1 >= 26 * cp && s.day - (R.coal || -99) > 60) {   // une mine de charbon pour brûler son propre charbon (et l'exporter le reste du temps)
        const q = depQuote('mcoal'); if (q.length && fund(q[0].tot * 1.1)) { const r = depBuild('mcoal'); if (r > 0) { R.coal = s.day; note('tr_mcoal'); } }
      }
    }
    // 2) pipelines : puits de pétrole et mines de charbon non raccordés
    if (s.day - R.pipe >= 24) { R.pipe = s.day; ['well', 'mcoal'].forEach(k => (born[k] || []).forEach(b => { const c = cell(b.x, b.y); if (!c || c.t !== k || c.piped || b.pt) return; b.pt = 1; const n = pipeTo(c); if (n) note('tr_pipeline', k + ' ' + n + ' cases'); })); }
    // 3) cartel sur la matière la plus produite
    if (s.day - R.car >= 21) {
      const cost = 6000 * 20 * 0.5 * cp; let best = null;
      // mesuré (graine 6000) : cours visé +18 % -> cours réel +5 % à J+3, +15 % à J+15, encore +7 % dix jours après : ≈ 3 jours de recettes de la matière en plus.
      // Le charbon brûlé par ses propres centrales ne compte pas (le cartel le renchérirait pour lui-même).
      ['iron', 'coal', 'copper', 'gold', 'oil'].forEach(g => { const v = extRev(g) - (g === 'coal' ? 500 * (born.plant || []).length * (s.price.coal || 0) : 0); if (v > 0 && (!best || v > best.v)) best = { g, v }; });
      if (best && 3.0 * best.v >= 1.2 * cost && s.cash > 3 * cost && W.cartelOn(best.g)) { R.car = s.day; note('tr_cartel', best.g); }
    }
    // 4) embargo défensif : seulement contre le rival qui mène une guerre des prix contre toi
    const RV = s.rv || {}; if (RV.war && RV.war.rid && s.day - R.emb >= 7) { const r = (s.rivals || []).find(x => x.id === RV.war.rid); if (r && (r.emb || 0) < s.day && s.cash > 2e6 && W.embargoOn(r.id)) { R.emb = s.day; note('tr_embargo', r.name); } }
  }

  // ----- Baron industriel : chaînes verticales complètes (bot industriel : extraction -> composants f1-f3 -> usine du produit -> magasins), plus de ports quand
  // les gisements s'épuisent (import moins cher), catalogue élargi au haut de gamme (f3/f4), rachat des actifs d'un rival en faillite (−15 % pour la caste, la filiale
  // continue de vendre : rien n'est détruit), participation de 10 % dans un rival (dès le jour 450, hors épargne d'une chaîne) puis contrôle à 51 % (filiale gérée par l'IA, dividendes 60 % du résultat),
  // quand les chaînes n'absorbent plus la trésorerie. L'OPA totale (dès 10 %, prime 20 %) fait disparaître la société cible du marché : l'expert ne la lance pas
  // tant qu'une participation majoritaire rapporte davantage (voir docs/EQUILIBRE_ECONOMIE.md).
  function baron() {
    const s = S(), R = CP.ba; if (s.caste !== 'industriel' || s.day - R.last < 16) return; R.last = s.day;
    const RV = s.rv || {};
    if (RV.sale && W.riv.buySale) { const sl = RV.sale, inc = Math.max(40, (sl.rev || 0) * 0.12) * Math.max(1, s.cpi || 1); if (sl.price < inc * 360 * 5 && fund(sl.price + 1e6) && W.riv.buySale()) note('ba_rescue', sl.name); }
    const worth = s.stats.worth || 0, idle = s.cash - 0.1 * worth; if (s.day < 450 || (IND.save != null && s.day - IND.save < 40)) return;   // jamais sur l'épargne réservée à une chaîne
    const rs = (s.rivals || []).filter(r => !r.sub).sort((a, b) => W.riv.value(a) - W.riv.value(b)), r = rs[0]; if (!r) return;
    const h = (s.port || {})[r.id], have = h ? h.n : 0, px = W.riv.value(r) / 5000 * (1 + (r.mood || 0));
    const tgt = worth > 60e6 && idle > W.riv.value(r) && !IND.save ? 2600 : idle > 3 * 500 * px ? 500 : 0, need = tgt - have;
    if (need > 0) { const q = Math.min(need, Math.floor(Math.max(0, idle) / (px * 1.05))); if (q >= 50 && W.tradeShares(r.id, q, true)) note(have + q > 2500 ? 'ba_control' : 'ba_stake', r.name + ' ' + Math.round((have + q) / 50) + ' %'); }
    // OPA (dès 10 %, prime 20 %) : une seule, tard, quand la trésorerie oisive couvre deux fois l'offre ; la cible devient une filiale (revenu de 12 % de son chiffre d'affaires, comptée au coût amorti)
    const rh = rs.find(x => ((s.port || {})[x.id] || { n: 0 }).n >= 500 && ((s.port || {})[x.id] || { n: 0 }).n <= 2500);
    if (rh && !CP.n.ba_opa && s.day >= 1200 && !IND.save) { const st = s.port[rh.id].n / 5000, pxh = W.riv.value(rh) / 5000 * (1 + (rh.mood || 0)), cost = (1 - st) * 5000 * pxh * 1.2; if (idle > 2 * cost && W.launchOpa(rh.id)) note((s.rivals || []).indexOf(rh) < 0 ? 'ba_opa' : 'ba_opa_fail', rh.name); }
  }

  // ----- Exploitant agricole : fermes (−25 %, cultures +15 %) et élevages, irrigation au maximum dès la pose (3 niveaux : 840 / 1 820 / 2 940 $ pour la caste,
  // +10 % de récolte par niveau et protection contre la sécheresse : rentabilisé en quelques jours sur une ferme de 1,5 M$), puis chaîne alimentaire
  // (pain d'abord) qui transforme ses propres récoltes ; le surplus part à l'export par le port. P.foodChain (essai mesuré, écarté) : chaîne de 14 produits alimentaires
  // dimensionnée aussi sur vigne, maïs, colza et élevages : 175 M$ au jour 1 800 contre 267 M$ (graine 6000) : de petites usines alimentaires peu chargées coûtent plus qu'elles ne rapportent.
  function farmer() {
    const s = S(), R = CP.ag; if (s.caste !== 'agriculteur' || s.day - R.last < 5) return; R.last = s.day;
    if (P.foodChain && !R.rawk) { R.rawk = 1; Object.assign(RAWK, { grapes: 'fvine', corn: 'fcorn', rapeseed: 'frapeseed', milk: 'fcattle', egg: 'fchicken', pork: 'fpig', wool: 'fsheep' }); ['fvine', 'fcorn', 'frapeseed', 'fcattle', 'fchicken', 'fpig', 'fsheep'].forEach(k => { if (W.TYPES[k]) EXT[k] = W.TYPES[k].ext; }); }   // la chaîne alimentaire se dimensionne aussi sur la vigne, le maïs, le colza et les élevages
    for (let i = 0; i < N * N; i++) { const c = s.grid[i]; if (!c || c.x + c.y * N !== i || !W.TYPES[c.t] || !W.TYPES[c.t].ext || !W.CROPS || !(W.CROPS[W.TYPES[c.t].ext] || W.TYPES[c.t].live)) continue;
      if ((c.irr | 0) >= 3 || s.cash < 2e4) continue; W.openBuilding(c.x, c.y); let n = 0; while ((c.irr | 0) < 3 && n++ < 3) { const l = c.irr | 0; W.bAct('irr'); if ((c.irr | 0) === l) break; note('ag_irr', c.t); } W.closeBuilding(); }
  }

  // ===== Passe 67 : Innovateur tech (P.innov). Séquence : produit phare inédit (R&D) → brevet → usine du produit (composants importés) → montée en capacité
  // tant que la fenêtre de monopole tient → centres de R&D (avance technologique, priorité au produit phare) → licences en fin de fenêtre → produit suivant avant l'érosion.
  // Les data centers (campus alimentés) et le commerce restent choisis par pick() (familles P.fam).
  const IN = { last: -99, log: [], fac: {}, bad: {} };
  const INNOV_PRODS = ['headache', 'cough', 'phone', 'antibio', 'tv', 'camera', 'smartwatch', 'headphones', 'desktop', 'etoys', 'powertools', 'solarpanel', 'ebike', 'fridge', 'washer', 'microwave'];
  function innov() {
    const s = S(); if (s.day - IN.last < (P.inEvery || 10)) return; IN.last = s.day;
    const M = W.mono, R = W.rd, cp = Math.max(1, s.cpi || 1), tn = W.tierNow ? W.tierNow() : 0, FKx = ['', 'f1', 'f2', 'f3', 'f4'];
    const room = Math.max(0, Math.min((P.inLev || P.lev) * s.stats.worth, W.creditLimit()) - (s.loan || 0)), avail = s.cash + room;
    const mine = W.PKEYS.filter(pk => IN.fac[pk] != null && !IN.bad[pk]);
    // 1) licences : on garde l'exclusivité au début de la fenêtre, on licencie quand elle s'érode (redevances, somme positive pour le licencié)
    try { const X = R.st(); (X.off || []).slice().forEach(o => { const inf = M.info(o.pk); R.answer(o.id, !inf || inf.ex < 0.45); }); } catch (e) { /* rien */ }
    // 2) montée en capacité des produits lancés : usines tant que les ventes absorbent la production et que l'exclusivité tient
    for (const pk of mine) {
      const ps = s.prod[pk], pr = W.PRODUCTS[pk]; if (ps.st !== 'on' || IN.bad[pk]) continue; const fk = FKx[pr.lvl], fcs = W.facCounts(pk), fc = fcs.mine, inf = M.info(pk) || { ex: 0 };
      if (fc > 0 && IN.fac[pk] > 0 && s.day - IN.fac[pk] > 45 && !(ps.made > 0) && !(ps.sold > 0)) { W.unassignProduct(pk); if (W.stopProduct) W.stopProduct(pk); IN.bad[pk] = s.day; IN.log.push([s.day, 'echec', pk]); if (IN.cur === pk) IN.cur = null; continue; }   // échec : intrants introuvables à un coût rentable (risque de l'innovation)
      // rendement mesuré par usine (EBE × 360 / capex) : on agrandit tant qu'il dépasse le seuil (plus bas pendant la fenêtre de monopole, où l'export exclusif paie une prime)
      const pf = prodProfit(pk), yld = pf != null && fc > 0 ? pf / fc * 360 / (W.TYPES[fk].cost * cp) : null, grow = yld != null && yld > (P.inYld || 0.6) && inf.ex > 0.3 && ps.made < 0.8 * ((W.mono.K.MONO_XW || 4) + 1) * Math.max(1, ps.sold) && fc < (P.inMaxFac || 8);   // débouché borné : ventes locales + export exclusif (MONO_XW × ventes locales) ; au-delà, l'export ordinaire fait monter le prix des intrants et ruine la chaîne (mesuré)
      if (fc > 0 && fcs.free > 0 && grow) { W.assignProduct(pk, fc + 1); IN.fac[pk] = s.day; continue; }
      if (fc === 0 || (IN.fac[pk] < s.day - 40 && grow)) {
        const c0 = W.TYPES[fk].cost * cp * 1.15; if (avail < c0) continue; if (s.cash < c0) borrow(c0 + 1e5); if (s.cash < c0) continue;
        if (!ensurePort()) continue; const r = tryBuildAny(fk); if (r > 0) { W.assignProduct(pk, fc + 1); IN.fac[pk] = s.day; IN.log.push([s.day, 'fac', pk, fc + 1]); return; }
      }
    }
    // 3) centres de R&D : avance technologique (fenêtre plus longue), R&D pharma plus rapide ; priorité au produit le plus rentable encore exclusif
    const nrd = s.rdPower || 0, wv = s.stats.worth || 0, wantRd = Math.min(P.inRdMax || 3, mine.length, wv > 250e6 * cp ? 3 : wv > 120e6 * cp ? 2 : wv > (P.inRdAt || 40e6) * cp ? 1 : 0), rdc = W.TYPES.rd.cost * cp * 0.75 * 1.1;
    if (nrd < wantRd && nrd === 0 && s.cash < rdc && avail > rdc) borrow(rdc + 1e5);   // le premier centre de R&D est un investissement prioritaire (pari de long terme)
    if (nrd < wantRd && s.cash > (nrd === 0 ? 1 : 1.3) * rdc) { const r = tryBuild('rd'); if (r > 0) IN.log.push([s.day, 'rdc', nrd + 1]); }
    // 3 bis) premier campus data center (plateforme cloud et IA, demande portée par les brevets) : on s'endette pour l'ouvrir dès que la valeur le permet
    const ndc = (s.stats.cn && s.stats.cn.dc) || 0;
    if (ndc === 0 && tierOk('dc') && wv > (P.inDcAt || 70e6) * cp && P.fam.indexOf('dc') >= 0) { const c0 = W.TYPES.dc.cost * cp * 1.1, room2 = Math.max(0, Math.min(0.6 * wv, W.creditLimit()) - (s.loan || 0)); if (s.cash + room2 >= c0) { if (s.cash < c0) { const l0 = P.lev; P.lev = 0.6; borrow(c0 + 1e5); P.lev = l0; } if (s.cash >= c0) { const r = tryBuildAny('dc'); if (r > 0) IN.log.push([s.day, 'dc', Math.round(r)]); } } }
    const foc = mine.filter(pk => s.prod[pk].st === 'on').sort((a, b) => ((M.info(b) || {}).ex || 0) * (s.prod[b].rm || 0) - ((M.info(a) || {}).ex || 0) * (s.prod[a].rm || 0))[0];
    if (foc && s.rdFocus !== foc) R.focus(foc);
    // 4) produit suivant : aucun développement en cours, et le dernier lancé est rentable ou s'érode
    // 4 bis) pari de long terme (Eli Lilly) : la pilule contre l'obésité, développement de plusieurs années, en parallèle, dès qu'un centre de R&D l'accélère
    const ob = s.prod.obesity, OB = W.PRODUCTS.obesity;
    if (OB && ob && ob.st === 'locked' && !IN.long && nrd >= 1 && wv > (P.inLongAt || 50e6) * cp && OB.tier <= tn && !R.held('obesity')) { const c = OB.rnd * [0.6, 1, 1.8][ob.q]; if (s.cash > 1.5 * c && W.launchProduct('obesity')) { IN.long = 'obesity'; IN.fac.obesity = 0; IN.log.push([s.day, 'rd', 'obesity']); } }
    if (W.PKEYS.some(pk => s.prod[pk].st === 'rnd' && pk !== IN.long)) return;
    const last = IN.cur, lps = last && s.prod[last], linf = last && M.info(last);
    if (last && lps && lps.st === 'on' && s.day - IN.curDay < (P.inGap || 150) && !(linf && linf.ex < 0.5)) return;
    const cands = (P.inProds || INNOV_PRODS).filter(pk => { const pr = W.PRODUCTS[pk], ps = s.prod[pk]; return pr && !pr.free && ps.st === 'locked' && pr.tier <= tn && !(W.modeLocked && W.modeLocked(pk)) && !R.held(pk) && !(s.rivals || []).some(r => r.fl && r.fl.k === pk) && tierOk(FKx[pr.lvl]) && !(pr.pharma && W.PRODUCTS[pk].days > 400 && nrd < 3); });
    for (const pk of cands) {
      const pr = W.PRODUCTS[pk], cost = pr.rnd * [0.6, 1, 1.8][s.prod[pk].q] + W.TYPES[FKx[pr.lvl]].cost * cp * 1.2 + (cnt.port || (s.stats.cn.port || 0) ? 0 : W.TYPES.port.cost * cp * 1.2);
      if (cost > avail * 0.6) continue;
      if (s.cash < cost) borrow(cost + 1e5); if (s.cash < pr.rnd) continue;
      if (W.launchProduct(pk)) { IN.cur = pk; IN.curDay = s.day; IN.fac[pk] = 0; IN.log.push([s.day, 'rd', pk]); }
      return;
    }
  }
  function tick() {
    const s = S(); let did = 0, spent = 0;
    if (P.innov) innov();
    if (s.day % 20 === 0) prune();
    if (s.day % 8 === 0) missions();
    if (P.industry) industry();
    if (P.ecom) ecom();
    if (P.bank && P.play !== 'banquier') bank();
    if (P.play === 'banquier') banker();
    if (P.play === 'negociant') trader();
    if (P.play === 'industriel') baron();
    if (P.play === 'agriculteur') farmer();
    if (P.idle > 0 && ((s.day * 2654435761) >>> 0) % 1000 < P.idle * 1000) return { did: 0, spent: 0 };
    if (s.stats.unemp < 0.045 && s.cash > 1.5e6 && (cnt.res || 0) < P.resCap) { for (let i = 0; i < 3; i++) { const r = tryBuild('res'); if (r) { spent += r; did++; } } }
    for (let n = 0; n < P.maxPerTick; n++) {
      if (P.industry && IND.save != null && s.day - IND.save < 40) break;   // épargne pour une chaîne
      const b = pick(); if (!b) break;
      if (s.cash - (P.keep || 0) < b.cost) borrow(b.cost + (P.keep || 0) + 1e5);
      if (s.cash - (P.keep || 0) < b.cost) break;
      const r = EXT[b.k] ? depBuild(b.k) : b.k === 'dc' ? tryBuildAny('dc') : tryBuild(b.k);
      if (r === -1) { P.lim = P.lim || {}; P.lim[b.k] = cnt[b.k] || 0; continue; }
      if (!r) { cnt['x_' + b.k] = s.day + 20; (window.__blog || (window.__blog = [])).push(['fail', b.k, s.day, Math.round(s.cash), Math.round(b.cost)]); continue; }
      cnt['x_' + b.k] = s.day + (EXT[b.k] ? 12 : 8); spent += r; did++;
    }
    if (P.bourse && s.day % 8 === 0) bourse();
    return { did, spent };
  }
  return { tick, cnt, P, pick, spots, repay, born, roiOf, depQuote, IND, chainsStatus, indCost, needs, plan, EC, CP, IN };
})();
