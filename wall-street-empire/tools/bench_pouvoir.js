// Banc « pouvoir de marché » (passe 46) : EBITDA d'une usine isolée par filière selon le nombre de concurrents, et d'un commerce par gamme (normal / saturé).
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/bench_pouvoir.js [--json sortie.json] [--goods plastic,chem] [--k 0,2,4,6]
// Usine : intrants au prix de base (stock local), prix de sortie LIBRE (il converge vers cours × prime), population réglée pour que la demande locale ≈ la production de l'usine,
// concurrents forcés chaque jour (S.npcSup[g].k, capacité totale à son plafond de jeu 0,3 × demande × (1 + 0,35 (k − 1)), appel d'air neutralisé), macro figée. Produits finis : k rivaux présents dans la catégorie.
// Commerce : un magasin par banc (16 logements) ; « saturé » = 2 magasins de plus du même type et rivaux deux fois plus attractifs ; boutique luxe = hypermarché aux seuls rayons luxe.
const L = require('./tests/lib.js');
const A = process.argv.slice(2), arg = (k, d) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; };

async function factory(key, k) {
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 5e10, noAid: true });
  const r = await pg.evaluate(({ key, k }) => {
    const W = window.WSE, S = W.S, N = W.N, m = S.macro; m.boom = 0; m.phase = Math.PI; m.gdp = 0.03; m.infl = 0.02; m.rate = 0.04;
    const put = (t, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, t) && W.place(x, y, t)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } };
    const isP = !!W.PRODUCTS[key], rec = isP ? W.PRODUCTS[key] : W.RECIPES[key], fk = ['', 'f1', 'f2', 'f3', 'f4'][rec.lvl];
    const f = put(fk, 66, 84, 54, 84); put('port', 66, 84, 54, 84); for (let i = 0; i < 10; i++) put('res', 14, 44, 14, 44); put('s2', 14, 44, 14, 44);
    if (isP) { W.launchProduct(key); const ps = S.prod[key]; ps.st = 'on'; ps.rnd = 0; ps.pf = 1; ps.A = 0.03; ps.age = 0; ps._q = ps.q; W.assignProduct(key, 1); } else W.assignRecipe(key, 1);
    const ins = Object.keys(isP ? W.productInputs(key) : rec.in); f.src = {}; ins.forEach(g => { f.src[g] = 'local'; });
    const cls = isP ? W.PRODUCTS[key].cls : null, riv0 = JSON.parse(JSON.stringify(S.rivals[0] || {}));
    const rivs = () => Array.from({ length: k }, (_, i) => Object.assign(JSON.parse(JSON.stringify(riv0)), { id: 'rb' + i, caste: null, name: 'Rival ' + (i + 1), att: { basic: 0.2, std: 0.2, lux: 0.2, estate: 0 }, px: { basic: 1, std: 1, lux: 1, estate: 1 }, fl: null, st: { k: 'follow' }, sub: 0, emb: 0 }));
    let pop = null;
    const pre = () => { S.macro.phase = Math.PI; S.macro.boom = 0; S.noEv = true; ins.forEach(g => { S.stock[g] = 1e9; S.price[g] = W.GOODS[g].base * (S.cpi || 1); });
      if (isP) { S.prod[key].stock = 0; S.prod[key].brand = 50; S.prod[key].mpx = 0; S.prod[key].mph = 0; S.rivals = rivs(); if (S.rv) { S.rv.cartel = null; } }
      else { S.stock[key] = 0; const lm = S._lm && S._lm[key]; if (pop == null && lm && lm.D > 0 && f.out > 0) pop = S.pop * f.out / lm.D; if (pop) S.pop = pop;
        const D = lm ? lm.D : 0; S.npcSup = S.npcSup || {}; S.npcSup[key] = { cap: k ? 0.3 * D * (1 + 0.35 * (k - 1)) : 0, k, days: 99, hot: 0, cold: 0 }; } };
    for (let i = 0; i < 60; i++) { pre(); W.step(); }
    const A = { pRev: 0, cogs: 0, wag: 0, upk: 0, tr: 0, out: 0, px: 0, m: 0 }, D = 40;
    for (let i = 0; i < D; i++) { pre(); W.step(); A.pRev += f.pRev || 0; A.cogs += f.inCost || 0; A.wag += f.wages || 0; A.upk += f.upk || 0; A.tr += f.transport || 0; A.out += f.out || 0;
      A.px += isP ? W.prodPrice(key) / W.stdPrice(key) : S.price[key] / (W.GOODS[key].base * (S.cpi || 1)); A.m += isP ? W.mp.prod(key).m : W.mp.m(key); }
    Object.keys(A).forEach(q => A[q] /= D); A.fk = fk; return A;
  }, { key, k });
  const errs = pg.errs; await pg.context().close();
  const eb = r.pRev - r.cogs - r.wag - r.upk - r.tr;
  return { key, k, fk: r.fk, gm: r.pRev > 0 ? (r.pRev - r.cogs) / r.pRev : NaN, eb: r.pRev > 0 ? eb / r.pRev : NaN, px: r.px, m: r.m, errs };
}

async function retail(sat) {   // un magasin seul par banc (16 logements : rayons remplis à 60-80 %), rivaux par défaut de la partie ; saturé = 2 magasins de plus du même type et rivaux deux fois plus attractifs
  const one = (t, lux) => {
    let src = `B.a = inC('${t}'); for (let i = 0; i < 16; i++) inC('res'); inP('port');`;
    if (lux) src += ` B.a.shelf = { g_basic: false, g_std: false }; S.rivals.forEach(r => { r.att.lux = ${sat ? 0.6 : 0}; });`;
    if (sat) src += ` inC('${t}'); inC('${t}'); S.rivals.forEach(r => { Object.keys(r.att).forEach(c => { r.att[c] *= 2; }); });`;
    return L.bench(src, 60, 60);
  };
  const out = { sat, shops: {}, errs: [] };
  for (const [k, t, lux] of [['s1', 's1'], ['s2', 's2'], ['s3', 's3'], ['lux', 's3', 1]]) { const r = await one(t, lux); out.shops[k] = r.res[t]; out.errs.push(...r.errs); }
  return out;
}

if (require.main !== module) module.exports = { factory, retail };
else (async () => {
  const goods = (arg('goods', 'steel,plank,flour,glass,fabric,wire,chem,plastic,osb,tire,motor,battery,circuit,api,silicon')).split(',').filter(Boolean), ks = arg('k', '0,2,4,6').split(',').map(Number);
  const prods = (arg('prods', 'bread,utensils,jeans,headache,perfume')).split(',').filter(Boolean);
  const jobs = []; goods.concat(prods).forEach(g => ks.forEach(k => jobs.push([g, k])));
  const res = await L.pool(jobs, +arg('workers', 3), async j => { const r = await factory(j[0], j[1]); console.log(`  ${j[0]} k=${j[1]} : EBITDA ${(r.eb * 100).toFixed(1)} %, MB ${(r.gm * 100).toFixed(0)} %, prix ×${r.px.toFixed(2)}`); return r; });
  const by = {}; res.forEach(r => { (by[r.key] = by[r.key] || {})[r.k] = r; });
  const pc = x => Number.isFinite(x) ? (x * 100).toFixed(0).padStart(4) + ' %' : '   —  ';
  console.log('\nUSINES ISOLÉES : EBITDA (marge brute) [prix / base] selon le nombre de concurrents');
  console.log('bien'.padEnd(10) + ks.map(k => (k === 0 ? 'seul' : k + ' conc.').padStart(26)).join(''));
  Object.keys(by).forEach(g => console.log(g.padEnd(10) + ks.map(k => { const o = by[g][k]; return o ? `${pc(o.eb)} (${pc(o.gm).trim()}) [×${o.px.toFixed(2)}]`.padStart(26) : ''.padStart(26); }).join('')));
  const out = { factories: res };
  if (A.indexOf('--noretail') < 0) {
    out.retail = [await retail(false), await retail(true)];
    console.log('\nCOMMERCES : EBITDA (marge brute)');
    out.retail.forEach(R => { console.log((R.sat ? 'saturé  ' : 'normal  ') + [['s1', 'base (s1)'], ['s2', 'standard (s2)'], ['s3', 'tout + luxe (s3)'], ['lux', R.sat ? 'boutique luxe, rivaux forts' : 'boutique luxe, seule en luxe']].map(([k, l]) => { const o = R.shops[k]; return `${l} ${o ? pc(o.eb) + ' (' + pc(o.gm).trim() + ')' : '—'}`; }).join('   ')); });
  }
  const errs = res.flatMap(r => r.errs).concat((out.retail || []).flatMap(r => r.errs)); console.log('\nerreurs de page :', errs.length, errs.slice(0, 2).join(' ; '));
  if (arg('json')) require('fs').writeFileSync(arg('json'), JSON.stringify(out, null, 1));
  await L.closeBrowser();
})();
