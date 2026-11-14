// Mesure « chaîne complète » (passe 21) : extraction -> composants -> usine du produit -> magasins, auto-production activée, N jours, prix de marché libres.
// Usage : NODE_PATH=$(npm root -g) node tools/chain_audit.js [produit|all] [jours]   (build d'abord)
// Sortie : par maillon EBITDA / utilisation / limite (valeurs au cours du marché : les cessions internes ne sont pas de la trésorerie),
// puis la rentabilité GLOBALE = trésorerie réelle (CA magasins + export - salaires - entretien - fret - importations) comparée à la même ville sans la chaîne.
const L = require('./tests/lib.js');

// Plans de chaîne : ext = extracteurs [clé, gisement, nombre], fac = usines libres par niveau (l'auto-production en ajoute), stores = commerces
const PLANS = {
  bread:    { prod: 'bread',    nAssign: 1, ext: [['fwheat', 'wheat', 2]], fac: { f1: 2 }, stores: { s1: 4, s2: 2 } },
  bread2:   { prod: 'bread',    nAssign: 1, ext: [['fwheat', 'wheat', 2]], fac: { f1: 2 }, stores: { s1: 6, s2: 8 } },
  utensils: { prod: 'utensils', nAssign: 1, ext: [['miron', 'iron', 1], ['mcoal', 'coal', 1], ['well', 'oil', 1]], fac: { f1: 3 }, stores: { s1: 4, s2: 2 } },
  jeans:    { prod: 'jeans',    nAssign: 1, ext: [['fcotton', 'cotton', 2], ['logging', 'wood', 1], ['well', 'oil', 1]], fac: { f1: 3, f2: 1 }, stores: { s2: 2, s3: 1 } },   // l'emballage (plastique + bois) est un 3e composant à produire
  bike:     { prod: 'bike',     nAssign: 1, ext: [['miron', 'iron', 1], ['mcoal', 'coal', 1], ['well', 'oil', 1], ['frubber', 'rubber', 1], ['logging', 'wood', 1]], fac: { f1: 3, f2: 1 }, stores: { s2: 2, s3: 1 } },
  watch:    { prod: 'watch',    nAssign: 1, ext: [['mgold', 'gold', 1], ['miron', 'iron', 1], ['mcoal', 'coal', 1], ['mcopper', 'copper', 1], ['qsand', 'sand', 1]], fac: { f1: 2, f2: 1, f3: 1 }, stores: { s3: 2 }, foundry: 1 },
  jewelry:  { prod: 'jewelry',  nAssign: 1, ext: [['mgold', 'gold', 1], ['mcopper', 'copper', 1], ['qsand', 'sand', 1], ['mcoal', 'coal', 1]], fac: { f1: 2, f3: 1 }, stores: { s3: 2 }, foundry: 1 },
  // chaînes MAL construites (le joueur doit équilibrer) : composants achetés dehors, ou aucun magasin pour écouler
  bad_bread:   { prod: 'bread',  nAssign: 1, ext: [], fac: { f1: 1 }, stores: { s1: 4, s2: 2 } },
  bad_jeans:   { prod: 'jeans',  nAssign: 1, ext: [], fac: { f2: 1 }, stores: { s2: 2, s3: 1 } },
  bad_bike:    { prod: 'bike',   nAssign: 1, ext: [['miron', 'iron', 1]], fac: { f2: 1 }, stores: { s2: 2, s3: 1 } },
  bad_nostore: { prod: 'utensils', nAssign: 1, ext: [['miron', 'iron', 1], ['mcoal', 'coal', 1], ['well', 'oil', 1]], fac: { f1: 3 }, stores: { s2: 1 } },
  perfume:  { prod: 'perfume',  nAssign: 1, ext: [['well', 'oil', 1], ['mcoal', 'coal', 1], ['fsugar', 'sugar', 1], ['qsand', 'sand', 1], ['logging', 'wood', 1]], fac: { f1: 5, f2: 1, f3: 1 }, stores: { s3: 2 } },
  skincare: { prod: 'skincare', nAssign: 1, ext: [['well', 'oil', 1], ['mcoal', 'coal', 1], ['fsugar', 'sugar', 1], ['qsand', 'sand', 1], ['logging', 'wood', 1], ['mgold', 'gold', 1]], fac: { f1: 5, f2: 1, f3: 1 }, stores: { s3: 2 }, foundry: 1 },
  headache: { prod: 'headache', nAssign: 1, ext: [['well', 'oil', 1], ['mcoal', 'coal', 1], ['fsugar', 'sugar', 1]], fac: { f1: 1, f2: 1 }, stores: { s1: 3, s2: 2 } }
};

// base = true : même ville (port + magasins) sans extracteurs, usines ni produit, pour isoler l'apport de la chaîne
async function runChain(plan, days = 200, base = false) {
  const pg = await L.newPage({ wait: 600 }); await L.setup(pg, { caste: 'industriel', cash: 5e10 }); await L.inject(pg);
  const r = await pg.evaluate(({ plan, days, base }) => {
    const W = window.WSE, S = W.S, T = window.T;
    S.noEv = true; let capex = 0;
    T.inP('port');
    // gisement le plus proche du port (comme le joueur raisonnable / le bot)
    const nearDep = (key, dep) => { const N = W.N, c = []; for (let i = 0; i < N * N; i++) { const d = S.dep[i]; if (!d || d.k !== dep || !(d.r > 0) || S.grid[i]) continue; const x = i % N, y = (i / N) | 0; if (W.footprintError(x, y, key)) continue; c.push([Math.abs(x - 75) + Math.abs(y - 69), x, y]); } c.sort((a, b) => a[0] - b[0]); for (const q of c.slice(0, 12)) { if (W.place(q[1], q[2], key)) { try { W.autoConnect(q[1], q[2]); } catch (e) { /* rien */ } return true; } } return false; };
    if (!base) {
      plan.ext.forEach(([k, dep, n]) => { for (let i = 0; i < n; i++) nearDep(k, dep); });
      if (plan.foundry) T.inP('foundry');
      Object.keys(plan.fac).forEach(k => { for (let i = 0; i < plan.fac[k]; i++) T.inP(k); });
    }
    for (let i = 0; i < (plan.res || 0); i++) T.inC('res');
    Object.keys(plan.stores).forEach(k => { for (let i = 0; i < plan.stores[k]; i++) T.inC(k); });
    const pk = plan.prod;
    if (!base) {
      W.launchProduct(pk); const ps = S.prod[pk];
      if (ps.st === 'rnd') { ps.rnd = 0; ps.st = 'on'; ps.pf = 1; ps.A = 0.03; ps.age = 0; ps._q = ps.q; }
      W.assignProduct(pk, plan.nAssign || 99); try { W.autoChain(pk); } catch (e) { /* rien */ }
    }
    T.bldgs().forEach(c => { capex += (W.TYPES[c.t].cost || 0); });   // capex nominal (hors terrain)
    const keyOf = c => c.t + (c.prod ? ':' + c.prod : '');
    const tally = {}, days0 = 40, meas = days - days0, prices = {}, F = { rev: 0, eb: 0, imp: 0, exp: 0, ret: 0 };
    for (let d = 0; d < days; d++) {
      T.frz(); W.step();
      if (d < days0) continue;
      { const f = S.fin; F.rev += f.revRetail + f.revExport; F.ret += f.revRetail; F.exp += f.revExport; F.imp += f.imports; F.eb += f.revRetail + f.revExport - f.wages - f.upkeep - f.transport - f.adv - f.imports; }
      T.bldgs().forEach(c => { const k = keyOf(c); const a = tally[k] || (tally[k] = { rev: 0, cogs: 0, wag: 0, upk: 0, tr: 0, ad: 0, out: 0, util: 0, c: 0, lim: {}, imp: 0 });
        a.rev += c.pRev || 0; a.cogs += c.inCost || 0; a.wag += c.wages || 0; a.upk += c.upk != null ? c.upk : 0; a.tr += c.transport || 0; a.ad += c.adCost || 0; a.out += c.out || 0; a.util += c.util || 0; a.c++; a.imp += c._impCost || 0; if (c.limit) a.lim[c.limit] = (a.lim[c.limit] || 0) + 1; });
      Object.keys(W.GOODS).forEach(g => { const p = prices[g] || (prices[g] = { s: 0, base: W.GOODS[g].base, st: 0 }); p.s += S.price[g] / (S.cpi || 1); p.st = S.stock[g]; });
    }
    const out = {}; Object.keys(tally).forEach(k => { const a = tally[k], R = x => x / meas, cnt = a.c / meas; out[k] = { n: Math.round(cnt), rev: R(a.rev), cogs: R(a.cogs), wag: R(a.wag), upk: R(a.upk), tr: R(a.tr), ad: R(a.ad), out: R(a.out) / Math.max(1, cnt), util: a.util / a.c, imp: R(a.imp), lim: a.lim }; out[k].ebitda = out[k].rev - out[k].cogs - out[k].wag - out[k].upk - out[k].tr - out[k].ad; });
    const pr = {}; Object.keys(prices).forEach(g => { pr[g] = { rel: prices[g].s / meas / prices[g].base, stock: prices[g].st }; });
    const P = S.prod[pk];
    return { out, pr, capex, prod: { sold: P.sold, made: P.made, stock: P.stock, rev: P.rev, share: P.share, price: W.prodPrice ? W.prodPrice(pk) : 0 }, fin: { rev: F.rev / meas, eb: F.eb / meas, imp: F.imp / meas, exp: F.exp / meas, ret: F.ret / meas }, pop: S.pop };
  }, { plan, days, base });
  r.errs = pg.errs; await pg.context().close(); return r;
}

// Apport de la chaîne = ville avec chaîne - ville sans chaîne
function delta(r, b) { const dEb = r.fin.eb - b.fin.eb, dRev = r.fin.rev - b.fin.rev, dCap = r.capex - b.capex; return { dEb, dRev, dCap, margin: dRev > 0 ? dEb / dRev : NaN, payback: dEb > 0 ? dCap / (dEb * 360) : Infinity }; }

function report(name, r, b) {
  const f = v => Math.round(v).toLocaleString('fr-FR'), pc = v => (v * 100).toFixed(0).padStart(4) + ' %';
  console.log('\n=== chaîne ' + name + ' | capex ' + f(r.capex / 1e6) + ' M$ | pop ' + f(r.pop));
  console.log('maillon'.padEnd(18), 'n'.padStart(3), 'CA/j'.padStart(10), 'intrants'.padStart(10), 'salaires'.padStart(9), 'entr.'.padStart(8), 'fret'.padStart(8), 'EBITDA/j'.padStart(10), 'marge', ' util', ' limite');
  Object.keys(r.out).filter(k => !['res', 'npc'].includes(k.split(':')[0])).sort().forEach(k => { const a = r.out[k];
    console.log(k.padEnd(18), String(a.n).padStart(3), f(a.rev).padStart(10), f(a.cogs).padStart(10), f(a.wag).padStart(9), f(a.upk).padStart(8), f(a.tr).padStart(8), f(a.ebitda).padStart(10), a.rev > 0 ? pc(a.ebitda / a.rev) : '   - ', pc(a.util), JSON.stringify(a.lim)); });
  const d = delta(r, b);
  console.log('GLOBAL (trésorerie réelle, apport de la chaîne) : EBITDA ' + f(d.dEb) + ' $/j sur CA ' + f(d.dRev) + ' $/j = ' + (d.margin * 100).toFixed(0) + ' % | capex ajouté ' + f(d.dCap / 1e6) + ' M$ | retour ' + (isFinite(d.payback) ? d.payback.toFixed(1) + ' ans' : 'jamais') + ' | imports ' + f(r.fin.imp) + ' $/j | export ' + f(r.fin.exp) + ' $/j');
  console.log('produit', JSON.stringify(r.prod, (k, v) => typeof v === 'number' ? Math.round(v * 100) / 100 : v));
  return d;
}
module.exports = { runChain, report, delta, PLANS };
if (require.main === module) (async () => {
  const w = process.argv[2] || 'all', days = +(process.argv[3] || 200);
  for (const k of (w === 'all' ? Object.keys(PLANS) : w.split(','))) {
    const r = await runChain(PLANS[k], days), b = await runChain(PLANS[k], days, true); report(k, r, b);
    console.log('prix/base:', Object.keys(r.pr).filter(g => Math.abs(r.pr[g].rel - 1) > 0.04 && r.pr[g].stock > 0).map(g => g + ' ×' + r.pr[g].rel.toFixed(2)).join(' '), '| erreurs', r.errs.length, r.errs.slice(0, 2).join(';'));
  }
  await L.closeBrowser();
})();
