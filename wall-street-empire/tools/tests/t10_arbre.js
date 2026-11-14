// Arbre des produits étendu (passe 25) et composeur : cohérence des recettes, marges, vignettes, création / lancement / sauvegarde / déterminisme des produits composés.
exports.name = 'Arbre des produits et composeur';

// EBITDA mesurés (isoFactory, macro figée) des produits d'origine avant la passe 25 : ils ne doivent pas bouger (tolérance 0,6 point)
const BASE_EB = { bread: 19.7, jeans: 16.0, tv: 21.0, headache: 38.8, obesity: 37.8, watch: 29.5, perfume: 29.5, laptop: 18.8, fridge: 15.8, house_wood: 13.7, bike: 15.9, cream: 16.1 };

exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);

  // 1. Données : recettes, niveaux, cycles, comptes
  const D = await pg.evaluate(() => {
    const W = window.WSE, o = { badIn: [], badLvl: [], order: [], cyc: [], tooMany: [], noVig: [], noFam: [], noTab: [], wsum: [], dupName: [] };
    const rk = Object.keys(W.RECIPES), seen = new Set(['ingot']);
    Object.keys(W.GOODS).forEach(g => { if (W.GOODS[g].grp === 'raw') seen.add(g); });
    rk.forEach(k => { Object.keys(W.RECIPES[k].in).forEach(g => { if (!W.GOODS[g]) o.badIn.push(k + ':' + g); else if (!seen.has(g)) o.order.push(k + ' avant ' + g); }); if (![1, 2, 3].includes(W.RECIPES[k].lvl)) o.badLvl.push(k); seen.add(k); });
    const dfs = (g, path) => { if (path.includes(g)) { o.cyc.push(path.concat(g).join('>')); return; } const R = W.RECIPES[g]; if (R) Object.keys(R.in).forEach(i => dfs(i, path.concat(g))); };
    rk.forEach(k => dfs(k, []));
    const names = new Set();
    Object.keys(W.PRODUCTS).forEach(k => {
      const P = W.PRODUCTS[k]; Object.keys(P.in).forEach(g => { if (!W.GOODS[g]) o.badIn.push(k + ':' + g); });
      if (![1, 2, 3, 4].includes(P.lvl)) o.badLvl.push(k);
      if (W.P25[k] && Object.keys(P.in).length > 3) o.tooMany.push(k);
      const sv = W.productSVG(k, 1); if (!/^<svg/.test(sv) || sv.length < 700 || sv.indexOf('M50 120 L150 78 L250 120') >= 0) o.noVig.push(k);
      if (W.famOf(k) === 'Autres') o.noFam.push(k);
      if (names.has(P.name)) o.dupName.push(P.name); names.add(P.name);
      if (W.P25[k]) { const w = W.PROD_W[k]; if (!w || w.reduce((a, b) => a + b, 0) !== 100 || W.NECESS[k] == null || W.DEMAND_PC[k] == null || W.OBSO[k] == null) o.noTab.push(k); }
    });
    o.nProd = Object.keys(W.PRODUCTS).length; o.nComp = rk.length + 1; o.nNew = Object.keys(W.P25).length;
    o.classes = {}; Object.keys(W.PRODUCTS).forEach(k => { const c = W.PRODUCTS[k].cls; o.classes[c] = (o.classes[c] || 0) + 1; });
    o.fams = W.FAM_ORDER.filter(f => Object.keys(W.PRODUCTS).some(k => W.famOf(k) === f)).length;
    return o;
  });
  t.check(`arbre : ${D.nProd} produits finis (70 à 85) dont ${D.nNew} nouveaux`, D.nProd >= 70 && D.nProd <= 85, `classes ${JSON.stringify(D.classes)}`);
  t.check(`arbre : ${D.nComp} composants (35 à 45)`, D.nComp >= 35 && D.nComp <= 45, '');
  t.check('recettes et produits : tous les intrants existent, niveaux d\'usine 1-3 (4 pour les produits de masse)', D.badIn.length === 0 && D.badLvl.length === 0, D.badIn.concat(D.badLvl).slice(0, 4).join(', '));
  t.check('recettes : chaque intrant est fabriqué avant son utilisation (ordre de calibrage) et aucun cycle', D.order.length === 0 && D.cyc.length === 0, D.order.concat(D.cyc).slice(0, 3).join(' | '));
  t.check('nouveaux produits : 3 intrants au plus (hors emballage)', D.tooMany.length === 0, D.tooMany.join(', '));
  t.check(`chaque produit a une vignette dédiée (pas le repli carton) : ${D.nProd}`, D.noVig.length === 0, D.noVig.slice(0, 5).join(', '));
  t.check(`chaque produit a une famille d'affichage (${D.fams} familles), pas de nom en double`, D.noFam.length === 0 && D.dupName.length === 0, D.noFam.concat(D.dupName).join(', '));
  t.check('nouveaux produits : poids prix/qualité/marque (somme 100), nécessité, demande par habitant, obsolescence renseignés', D.noTab.length === 0, D.noTab.join(', '));

  // 2. Marges mesurées (usine isolée) : 12-30 % pour les nouveaux, pharma MB >= 72 %, anciens inchangés
  const nk = await pg.evaluate(() => Object.keys(window.WSE.P25));
  const keys = nk.concat(Object.keys(BASE_EB));
  const res = await L.pool(keys, 4, k => L.isoFactory(k)), by = Object.fromEntries(res.map(a => [a.key, a]));
  const ph = nk.filter(k => k === 'antibio'), other = nk.filter(k => !ph.includes(k));
  const bad = other.filter(k => !(by[k].eb * 100 >= 12 && by[k].eb * 100 <= 30));
  t.check(`${other.length} nouveaux produits : EBITDA usine 12-30 % (min ${Math.min(...other.map(k => by[k].eb * 100)).toFixed(1)} %, max ${Math.max(...other.map(k => by[k].eb * 100)).toFixed(1)} %)`, bad.length === 0, bad.map(k => k + ' ' + (by[k].eb * 100).toFixed(1)).join(', '));
  ph.forEach(k => { t.check(`pharma ${k} : marge brute >= 72 %`, by[k].gm >= 0.72, `MB ${(by[k].gm * 100).toFixed(0)} %`); t.range(`pharma ${k} : EBITDA 30-45 %`, by[k].eb * 100, 30, 45, ' %', 0); });
  const drift = Object.keys(BASE_EB).filter(k => Math.abs(by[k].eb * 100 - BASE_EB[k]) > 0.6);
  t.check(`produits existants : EBITDA inchangés (${Object.keys(BASE_EB).length} témoins, tolérance 0,6 point)`, drift.length === 0, drift.map(k => `${k} ${(by[k].eb * 100).toFixed(1)} vs ${BASE_EB[k]}`).join(', '));
  t.check('produits (nouveaux et témoins) : 0 pageerror', res.every(a => a.errs.length === 0), res.flatMap(a => a.errs).slice(0, 2).join(';'));
  t.check('tous les nouveaux produits ont un prix de référence positif et supérieur à leur coût d\'intrants', await pg.evaluate(() => { const W = window.WSE; return Object.keys(W.P25).every(k => { const P = W.PRODUCTS[k]; const c = Object.keys(P.in).reduce((a, g) => a + P.in[g] * W.GOODS[g].base, 0) / P.out; return P.ref > c && c > 0; }); }), '');

  // 3. Composeur : refus, création, lancement, vignette
  const C = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, o = {}, N = W.N;
    o.refus = { gMilk: W.cmpEval('garment', ['fabric', 'milk']), dChem: W.cmpEval('drink', ['chem']), tNoCore: W.cmpEval('toy', ['paint']), vide: W.cmpEval('snack', []), quatre: W.cmpEval('toy', ['plastic', 'plank', 'fabric', 'foam']), rien: W.cmpEval('', ['plastic']), brut: W.cmpEval('furniture', ['iron']) };
    o.refusOk = Object.keys(o.refus).every(k => o.refus[k].ok === false && typeof o.refus[k].err === 'string' && o.refus[k].err.length > 20);
    o.refusTxt = Object.keys(o.refus).map(k => k + ': ' + o.refus[k].err.slice(0, 50)).join(' | ');
    // synergies : une bonne association vaut mieux qu'une moyenne
    const sy = W.cmpEval('snack', ['sugar', 'milk']), nsy = W.cmpEval('snack', ['wheat', 'essence']);
    o.synQ = [sy.q, nsy.q, sy.syn.length, nsy.syn.length];
    // chaque modèle : une association valide donne un produit viable
    o.models = Object.keys(W.CMODELS).map(k => { const M = W.CMODELS[k], e = W.cmpEval(k, M.syn[0].slice(0, 2)); return { k, ok: e.ok, err: e.err, viable: e.ok && e.price > e.cost && e.cost > 0 && e.rnd > 0 && e.days >= 2 && e.mpct > 0.1 && e.mpct < 0.7, mpct: e.ok ? Math.round(e.mpct * 100) : null, q: e.q }; });
    // création et lancement d'un produit composé avec « Tout lancer » (easyLaunch)
    const put = (k, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) { } return S.grid[y * N + x]; } };
    const f = put('f2', 66, 84, 54, 84); put('port', 66, 84, 54, 84);
    const r = W.cmpCreate('garment', ['fabric', 'leather', 'hardware'], 'Veste <b>Test</b>', 5); o.create = r;
    const k = r.key; o.def = JSON.stringify(S.cprod); const P = W.PRODUCTS[k]; o.name = P && P.name; o.cls = P.cls; o.lvl = P.lvl; o.inKeys = Object.keys(P.in);
    o.dup = W.cmpCreate('garment', ['hardware', 'leather', 'fabric'], 'Autre').err || '';
    const an = W.PRODUCTS.jeans; o.rndRatio = P.rnd / an.rnd;
    o.inTables = W.PROD_W[k] && W.NECESS[k] != null && W.DEMAND_PC[k] != null && W.PKEYS.includes(k);
    o.svg = W.productSVG(k, S.prod[k].q); o.svgOk = /^<svg/.test(o.svg) && o.svg.length > 700 && o.svg.indexOf('Veste <b>') < 0;
    o.easy = W.easyLaunch(f, k); o.st = S.prod[k].st; o.fprod = f.prod; o.rndDays = S.prod[k].rnd;
    return o;
  });
  t.check('composeur : 7 combinaisons absurdes ou incomplètes refusées avec une explication', C.refusOk, C.refusTxt);
  t.check(`composeur : synergies (sucre + lait : qualité ${C.synQ[0]} et ${C.synQ[2]} synergie(s) ; blé + arôme : ${C.synQ[1]} et ${C.synQ[3]})`, C.synQ[0] > C.synQ[1] && C.synQ[2] > 0 && C.synQ[3] === 0, '');
  const badM = C.models.filter(m => !m.viable);
  t.check(`composeur : ${C.models.length} modèles, chaque association valide donne un produit viable (prix > coût, marge 10-70 %)`, badM.length === 0, badM.map(m => m.k + ' ' + (m.err || m.mpct + ' %')).join(', '));
  t.check('composeur : création du produit (id cp1, nom nettoyé de tout HTML, tables de demande, vignette)', C.create.ok && C.create.key === 'cp1' && C.name === 'Veste bTestb' && C.inTables && C.svgOk && C.cls === 'std' && C.lvl === 2, JSON.stringify(C.create) + ' ' + C.name);
  t.check('composeur : doublon refusé (même association dans un autre ordre)', /déjà composé/.test(C.dup), C.dup);
  t.check(`composeur : R&D réduite par rapport au produit de référence (${(C.rndRatio * 100).toFixed(0)} % de celle des jeans)`, C.rndRatio > 0 && C.rndRatio <= 0.8, '');
  t.check('composeur : lancement en un clic (easyLaunch) : R&D lancée, usine affectée', C.easy === true && C.st === 'rnd' && C.fprod === 'cp1' && C.rndDays > 0, `st ${C.st} prod ${C.fprod}`);

  // 4. Marge mesurée de produits composés (modèles de classes différentes)
  const MK = [['garment', ['fabric', 'leather', 'hardware']], ['snack', ['sugar', 'milk']], ['gadget', ['screen', 'circuit', 'battery']], ['vehicle', ['engine', 'chassis', 'tire']], ['toy', ['plank', 'paint']], ['appliance', ['motor', 'case']]];
  const cm = await L.pool(MK, 3, m => L.isoFactory('', `return W.cmpCreate(${JSON.stringify(m[0])}, ${JSON.stringify(m[1])}, '', 0).key;`));
  const badC = cm.filter(a => !(a.eb * 100 >= 12 && a.eb * 100 <= 30));
  t.check(`produits composés (${MK.map(m => m[0]).join(', ')}) : EBITDA usine 12-30 %`, badC.length === 0 && cm.every(a => a.errs.length === 0), cm.map((a, i) => MK[i][0] + ' ' + (a.eb * 100).toFixed(1) + ' %').join(', '));

  // 5. Demande : un produit composé lancé vend en magasin, sans NaN ; fiche produit et écran Produits
  const V = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, T = window.T, k = 'cp1', ps = S.prod[k];
    ps.st = 'on'; ps.rnd = 0; ps.pf = 1; ps.A = 0.5; ps.age = 0; ps._q = ps.q;
    for (let i = 0; i < 10; i++) T.inC('res'); T.inC('s3'); T.inC('s2'); const f = T.inP('f2'); if (f) { W.assignProduct(k, 99); }
    for (let d = 0; d < 80; d++) { T.frz(); W.step(); }
    W.setPview ? W.setPview(true) : 0; const pv = document.getElementById('pview'); const txt = pv ? pv.innerText : '';
    return { made: ps.made, sold: ps.sold, share: ps.share, stock: ps.stock, bad: T.scan(), txt: /Veste/.test(txt), nan: /NaN|undefined/.test(txt), pvOk: !!txt };
  });
  t.check(`demande : le produit composé se fabrique et se vend (fabriqué ${V.made.toFixed(0)}, part ${(V.share * 100).toFixed(1)} %)`, V.made > 0 && (V.sold > 0 || V.share > 0), '');
  t.check('demande : aucune valeur non finie dans l\'état de la partie', V.bad.length === 0, V.bad.slice(0, 3).join(','));
  t.check('écran Produits : le produit composé apparaît (sans NaN)', V.txt && !V.nan, '');

  // 6. Sauvegarde v8 : aller-retour, ancienne sauvegarde sans produits composés, déterminisme
  await pg.evaluate(() => window.WSE.save());
  const before = await pg.evaluate(() => { const W = window.WSE, S = W.S; return JSON.stringify({ d: S.cprod, p: W.PRODUCTS.cp1, st: S.prod.cp1.st }); });
  await pg.reload(); await pg.waitForTimeout(900);
  const after = await pg.evaluate(() => { const W = window.WSE, S = W.S; return JSON.stringify({ d: S.cprod, p: W.PRODUCTS.cp1, st: S.prod.cp1 && S.prod.cp1.st }); });
  t.check('sauvegarde : le produit composé (définition, tables, état) survit au rechargement à l\'identique', before === after && /cp1/.test(after), before === after ? '' : before.slice(0, 80) + ' -> ' + after.slice(0, 80));
  const o2 = await pg.evaluate(() => { const W = window.WSE; const raw = JSON.parse(localStorage.getItem('wse-city-v8')); const v = raw.v, had = Array.isArray(raw.cprod) && raw.cprod.length; delete raw.cprod; localStorage.setItem('wse-city-v8', JSON.stringify(raw)); let S0 = null, err = ''; try { S0 = W.load(); } catch (e) { err = e.message; } return { v, had, err, ok: !!S0, has: !!W.PRODUCTS.cp1, n: S0 ? (S0.cprod || []).length : -1, nk: Object.keys(W.PRODUCTS).length, st: S0 ? Object.keys(S0.prod).length : -1, cash: S0 && S0.cash > 0 }; });
  t.check(`sauvegarde v${o2.v} sans champ « cprod » (ancienne sauvegarde) : chargée sans erreur, aucun produit composé, ${o2.nk} produits`, o2.had > 0 && o2.ok && !o2.err && !o2.has && o2.n === 0 && o2.st === o2.nk && o2.nk === 80, JSON.stringify(o2));
  t.check('rechargements : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // déterminisme : deux parties neuves donnent exactement les mêmes définitions, quantités et prix
  const mk = async () => { const p = await L.newPage({ wait: 600 }); await L.setup(p, { cash: 5e10 }); const r = await p.evaluate(() => { const W = window.WSE; const a = W.cmpCreate('gadget', ['screen', 'circuit', 'battery'], '', 3), b = W.cmpCreate('snack', ['sugar', 'milk', 'essence'], 'Mon snack', 1); return JSON.stringify({ a, b, c: W.S.cprod, p1: W.PRODUCTS.cp1, p2: W.PRODUCTS.cp2, e: W.cmpEval('toy', ['plank', 'paint']) }, (k, v) => typeof v === 'object' && v && v.name && v.noun ? undefined : v); }); await p.context().close(); return r; };
  const [d1, d2] = [await mk(), await mk()];
  t.check('déterminisme : deux parties neuves composent exactement les mêmes produits', d1 === d2 && d1.length > 300, d1 === d2 ? '' : 'différent');

  // 7. Auto-production : double-clic / quickProduce sur tous les produits (nouveaux et composés)
  const Q = await L.newPage({ wait: 700 }); await L.setup(Q, { cash: 5e11 }); await L.inject(Q);
  const qp = await Q.evaluate(() => {
    const W = window.WSE, S = W.S; const fails = [];
    W.cmpCreate('toy', ['plank', 'paint'], '', 2); W.cmpCreate('furniture', ['foam', 'leather'], '', 4); W.cmpCreate('drink', ['sugar', 'essence'], '', 0);
    Object.keys(W.PRODUCTS).forEach(k => { let ok = false; try { ok = W.quickProduce(k); } catch (e) { fails.push(k + ' exc ' + e.message); } if (!ok) fails.push(k); else if (!['rnd', 'on'].includes(S.prod[k].st)) fails.push(k + ' etat ' + S.prod[k].st); });
    for (let d = 0; d < 20; d++) W.step();
    return { n: Object.keys(W.PRODUCTS).length, fails, on: Object.keys(S.prod).filter(k => S.prod[k].st !== 'locked').length };
  });
  t.check(`auto-production (quickProduce) : ${qp.n} produits dont 3 composés lancés en un clic`, qp.fails.length === 0 && qp.on === qp.n, qp.fails.slice(0, 5).join(', '));
  t.check('auto-production : 0 pageerror', Q.errs.length === 0, Q.errs.slice(0, 2).join(' ; '));
  await Q.context().close();
};
