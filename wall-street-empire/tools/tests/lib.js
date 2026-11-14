// Bibliothèque commune du harnais de non-régression (NODE_PATH=$(npm root -g) pour trouver playwright).
const path = require('path');
const { chromium } = require('playwright');
const URL = process.env.WSE_URL || 'file://' + path.resolve(__dirname, '..', '..', 'city.html');
const BOT_SRC = require('fs').readFileSync(path.resolve(__dirname, '..', 'bot_lib.js'), 'utf8');

let _browser = null;
async function browser() { return _browser || (_browser = await chromium.launch()); }
async function closeBrowser() { if (_browser) { await _browser.close(); _browser = null; } }

// Ouvre une page neuve (nouveau contexte : localStorage vierge) et collecte les erreurs.
async function newPage(opts = {}) {
  const b = await browser();
  const ctx = opts.ctx || await b.newContext({ viewport: { width: opts.w || 1280, height: opts.h || 900 } });
  const pg = await ctx.newPage(); pg.errs = [];
  pg.on('pageerror', e => pg.errs.push('pageerror: ' + e.message + ' | ' + ((e.stack || '').split('\n')[1] || '').trim()));
  pg.on('console', m => { if (m.type() === 'error') pg.errs.push('console: ' + m.text()); });
  pg.on('dialog', d => d.dismiss());
  await pg.goto(URL); await pg.waitForTimeout(opts.wait || 800);
  return pg;
}

// Initialise une partie de test : pause, caste, pas d'événements, trésorerie, tout débloqué.
async function setup(pg, o = {}) {
  await pg.evaluate(o => {
    const W = window.WSE, S = W.S;
    W.setSpeed(0); W.setCaste(o.caste || 'industriel'); S.noEv = true; S.cash = o.cash || 5e9; S.unlockAll = true;
    ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
  }, o);
}

// Utilitaires injectés dans la page : window.T
const HELP = `
window.T = (function () {
  const W = window.WSE, N = W.N, S = () => W.S;
  const put = (key, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, key) && W.place(x, y, key)) { try { W.autoConnect(x, y); } catch (e) {} return S().grid[y * N + x]; } return null; };
  const onDep = (key, k, n = 0) => { let m = 0; for (let i = 0; i < N * N; i++) { const d = S().dep[i]; if (d && d.k === k && !S().grid[i] && !W.footprintError(i % N, (i / N | 0), key) && W.place(i % N, (i / N | 0), key)) { if (m++ >= n) { try { W.autoConnect(i % N, i / N | 0); } catch (e) {} return S().grid[i]; } } } return null; };
  const inP = k => put(k, 66, 84, 54, 84), inC = k => put(k, 14, 44, 14, 44);
  const frz = () => { const m = S().macro; if (m) { m.phase = Math.PI; m.boom = 0; } };
  const stepN = (n, freeze) => { for (let i = 0; i < n; i++) { if (freeze) frz(); W.step(); } };
  const scan = () => { const bad = [], seen = new Set(); (function walk(o, p, d) { if (d > 8 || bad.length > 30) return; if (typeof o === 'number') { if (!isFinite(o)) bad.push(p + '=' + o); return; } if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o); for (const k in o) walk(o[k], p + '.' + k, d + 1); })(S(), 'S', 0); return bad; };
  const bldgs = () => { const o = []; for (let i = 0; i < N * N; i++) { const c = S().grid[i]; if (c && c.x + c.y * N === i && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part' && c.t !== 'pylon' && c.t !== 'cable' && c.t !== 'pipeline') o.push(c); } return o; };
  // Bot aléatoire déterministe (graine fixe) : placement n'importe où dans une zone, gisements
  let seed = 12345; const R = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const zones = { city: [14, 44, 14, 44], port: [66, 84, 54, 84], all: [0, N, 0, N] };
  const ZK = { res: 'city', s1: 'city', s2: 'city', s3: 'city', s4: 'city', tech: 'city', bank: 'city', rd: 'city', dc: 'city', hq: 'city', btp: 'city', immo: 'city', f1: 'port', f2: 'port', f3: 'port', f4: 'port', foundry: 'port', wh: 'port', plant: 'port', nuclear: 'port', port: 'port' };
  const findSpot = (key, zone) => { const [x0, x1, y0, y1] = zones[zone] || zones.all; const n = (x1 - x0) * (y1 - y0); const st = Math.floor(R() * n); for (let k = 0; k < n; k++) { const i = (st + k * 7919) % n; const x = x0 + i % (x1 - x0), y = y0 + Math.floor(i / (x1 - x0)); if (!W.footprintError(x, y, key)) return [x, y]; } return null; };
  const build = key => { const sp = findSpot(key, ZK[key] || 'all'); if (!sp) return null; if (!W.place(sp[0], sp[1], key)) return null; return S().grid[sp[1] * N + sp[0]]; };
  const EXT = { well: 'oil', miron: 'iron', mcoal: 'coal', mcopper: 'copper', mgold: 'gold', fwheat: 'wheat', fsugar: 'sugar', fcotton: 'cotton', frubber: 'rubber', logging: 'wood', qgravel: 'gravel', qsand: 'sand', qlime: 'limestone' };
  const depBuild = (key, k) => { const c = []; for (let i = 0; i < N * N; i++) { const d = S().dep[i]; if (d && d.k === k && !S().grid[i] && d.r > 0) c.push(i); } if (!c.length) return null; for (let t = 0; t < 30; t++) { const i = c[Math.floor(R() * c.length)]; const x = i % N, y = (i / N) | 0; if (!W.footprintError(x, y, key) && W.place(x, y, key)) { try { W.autoConnect(x, y); } catch (e) {} return S().grid[i]; } } return null; };
  const owned = () => { const o = []; for (let i = 0; i < N * N; i++) { const c = S().grid[i]; if (c && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part') o.push(c); } return o; };
  return { put, onDep, inP, inC, frz, stepN, scan, bldgs, R, build, depBuild, EXT, owned };
})();`;
async function inject(pg) { await pg.evaluate(HELP); }
async function injectBot(pg) { await pg.evaluate(BOT_SRC); }

// Banc de mesure : setupSrc construit (accès à W,S,N,put,onDep,inP,inC,B,log), chauffe, mesure sur `meas` jours, agrège par type de bâtiment.
async function bench(setupSrc, warm, meas, opts = {}) {
  const pg = await newPage(); await setup(pg, { caste: opts.caste, cash: opts.cash || 5e10 }); await inject(pg);
  const r = await pg.evaluate(({ setupSrc, warm, meas }) => {
    const W = window.WSE, S = W.S, N = W.N, T = window.T, { put, onDep, inP, inC } = T; const B = {}, log = [];
    new Function('W', 'S', 'N', 'put', 'onDep', 'inP', 'inC', 'B', 'log', setupSrc)(W, S, N, put, onDep, inP, inC, B, log);
    T.stepN(warm, true); const agg = {};
    for (let d = 0; d < meas; d++) {
      T.frz(); W.step();
      T.bldgs().forEach(c => { const key = c.t + (c.prod ? ':' + c.prod : ''); const o = agg[key] || (agg[key] = { n: 0, pRev: 0, inCost: 0, wages: 0, oth: 0, out: 0, util: 0, profit: 0 });
        o.pRev += c.pRev || 0; o.inCost += c.inCost || 0; o.wages += c.wages || 0; o.oth += (c.upk || 0) + (c.transport || 0) + (c.adCost || 0); o.out += c.out || 0; o.util += c.util || 0; o.profit += c.profit || 0; o.n++; });
    }
    const res = {}; Object.keys(agg).forEach(k => { const o = agg[k], R = x => x / meas; const base = R(o.pRev), cogs = R(o.inCost), wag = R(o.wages), oth = R(o.oth);
      res[k] = { n: Math.round(o.n / meas), base, cogs, wag, oth, gm: base > 0 ? (base - cogs) / base : NaN, eb: base > 0 ? (base - cogs - wag - oth) / base : NaN, out: R(o.out) / (o.n / meas), util: o.util / o.n }; });
    return { res, log, fin: S.fin, pop: S.pop };
  }, { setupSrc, warm, meas });
  r.errs = pg.errs; await pg.context().close(); return r;
}

// Économie isolée d'une usine : intrants au prix de base (stock local), prix figés, sortie vidée chaque jour, macro figée.
async function isoFactory(key, preSrc) {   // preSrc : code optionnel (W, S) qui crée le produit à mesurer (produit composé) et renvoie sa clé
  const pg = await newPage({ wait: 500 }); await setup(pg, { cash: 5e10 });
  const r = await pg.evaluate(({ key, preSrc }) => {
    const W = window.WSE, S = W.S, N = W.N; if (preSrc) key = new Function('W', 'S', preSrc)(W, S); const m = S.macro; m.boom = 0; m.phase = Math.PI; m.gdp = 0.03; m.infl = 0.02; m.rate = 0.04;
    const put = (k, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } };
    const isP = !!W.PRODUCTS[key]; const rec = isP ? W.PRODUCTS[key] : W.RECIPES[key]; const fk = ['', 'f1', 'f2', 'f3', 'f4'][rec.lvl];
    const f = put(fk, 66, 84, 54, 84); put('port', 66, 84, 54, 84); for (let i = 0; i < 10; i++) put('res', 14, 44, 14, 44); put('s2', 14, 44, 14, 44);
    if (isP) { W.launchProduct(key); const ps = S.prod[key]; ps.st = 'on'; ps.rnd = 0; ps.pf = 1; ps.A = 0.03; ps.age = 0; ps._q = ps.q; W.assignProduct(key, 1); } else W.assignRecipe(key, 1);
    const ins = Object.keys(isP ? W.productInputs(key) : rec.in); f.src = {}; ins.forEach(g => { f.src[g] = 'local'; });
    const pre = () => { S.macro.phase = Math.PI; S.macro.boom = 0; ins.forEach(g => { S.stock[g] = 1e9; S.price[g] = W.GOODS[g].base * (S.cpi || 1); }); if (!isP) { S.stock[key] = 0; S.price[key] = W.GOODS[key].base * (S.cpi || 1); } else S.prod[key].stock = 0; };
    for (let i = 0; i < 20; i++) { pre(); W.step(); }
    const A = { pRev: 0, cogs: 0, wag: 0, upk: 0, tr: 0, out: 0, util: 0 }, D = 40;
    for (let i = 0; i < D; i++) { pre(); W.step(); A.pRev += f.pRev || 0; A.cogs += f.inCost || 0; A.wag += f.wages || 0; A.upk += f.upk || 0; A.tr += f.transport || 0; A.out += f.out || 0; A.util += f.util || 0; }
    Object.keys(A).forEach(k => A[k] /= D); A.fk = fk; A.key = key; return A;
  }, { key, preSrc });
  const errs = pg.errs; await pg.context().close();
  const eb = r.pRev - r.cogs - r.wag - r.upk - r.tr;
  return { key: r.key, fk: r.fk, ca: r.pRev, out: r.out, gm: r.pRev > 0 ? (r.pRev - r.cogs) / r.pRev : NaN, eb: r.pRev > 0 ? eb / r.pRev : NaN, util: r.util, errs };
}
// Extracteur sur le gisement le plus proche du port (rank near) ou médian.
async function isoExtractor(key, dep, rank = 'near') {
  const pg = await newPage({ wait: 400 }); await setup(pg, { cash: 5e10 });
  const r = await pg.evaluate(({ key, dep, rank }) => {
    const W = window.WSE, S = W.S, N = W.N; const m = S.macro; m.boom = 0; m.phase = Math.PI; m.gdp = 0.03; m.infl = 0.02; m.rate = 0.04;
    const cands = []; for (let i = 0; i < N * N; i++) { const d = S.dep[i]; if (d && d.k === dep && !S.grid[i] && !W.footprintError(i % N, (i / N | 0), key)) cands.push([Math.abs(i % N - 75) + Math.abs((i / N | 0) - 69), i]); }
    cands.sort((a, b) => a[0] - b[0]); const pick = rank === 'near' ? cands[0] : cands[cands.length >> 1]; if (!pick) return null;
    const c = W.place(pick[1] % N, pick[1] / N | 0, key) && S.grid[pick[1]]; try { W.autoConnect(pick[1] % N, pick[1] / N | 0); } catch (e) {}
    for (let i = 0; i < 12; i++) { for (let y = 14; y < 44; y++) for (let x = 14; x < 44; x++) if (!W.footprintError(x, y, 'res') && W.place(x, y, 'res')) { y = 99; break; } }
    const pre = () => { S.macro.phase = Math.PI; S.macro.boom = 0; }; for (let i = 0; i < 30; i++) { pre(); W.step(); }
    const A = { pRev: 0, wag: 0, upk: 0, tr: 0, out: 0 }, D = 40;
    for (let i = 0; i < D; i++) { pre(); W.step(); A.pRev += c.pRev || 0; A.wag += c.wages || 0; A.upk += c.upk || 0; A.tr += c.transport || 0; A.out += c.out || 0; }
    Object.keys(A).forEach(k => A[k] /= D); A.cost = W.TYPES[key].cost; return A;
  }, { key, dep, rank });
  await pg.context().close(); if (!r) return { key, rank, none: true };
  const eb = r.pRev - r.wag - r.upk - r.tr; return { key, rank, eb: eb / r.pRev, payback: r.cost / Math.max(1, eb * 360) };
}
// Exécute des tâches asynchrones par lots parallèles
async function pool(items, n, fn) { const out = new Array(items.length); let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } })); return out; }

// Détecteurs de texte suspect dans un panneau.
const BAD_TXT = /NaN|undefined|Infinity|\[object/;
const BAD_DAY = /(?:\d|\s)(?:\$|k\$|M\$|Md\$)\s*\/\s*(?:jour|j)\b/;
module.exports = { isoFactory, isoExtractor, pool, URL, newPage, setup, inject, injectBot, bench, browser, closeBrowser, BAD_TXT, BAD_DAY, BOT_SRC };
