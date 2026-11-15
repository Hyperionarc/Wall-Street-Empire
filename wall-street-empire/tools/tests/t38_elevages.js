// Passe 38 : élevages (bovins, poulets, porcs, moutons), vignoble et vin ; matières agricoles brutes, chaînes lait -> yaourt / fromage, viande -> plat cuisiné,
// alimentation, maladie, « Fabriquer », arbre de chaîne, guide, produits de première nécessité, sauvegarde antérieure, déterminisme.
const fs = require('fs'), path = require('path');
exports.name = 'Élevages et vigne (passe 38)';

const FARMS = { fcattle: ['milk', ['beef', 'leather']], fchicken: ['egg', ['poultry']], fpig: ['pork', ['leather']], fsheep: ['wool', ['lamb']] };
const FINISHED = { drinkmilk: 90, eggs: 85, beefmeat: 78, chicken: 80, porkmeat: 78, lambmeat: 70, sausage: 50, tablewine: 28 };

exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);

  // 1. Données
  const D = await pg.evaluate(({ FARMS, FINISHED }) => {
    const W = window.WSE, o = { bad: [], tools: [], icons: [], colors: [], names: [] };
    Object.keys(FARMS).concat(['fvine']).forEach(k => {
      const T = W.TYPES[k]; if (!T || !T.ext) { o.bad.push(k + ' absent'); return; }
      if (k !== 'fvine') { const [main, co] = FARMS[k]; if (T.ext !== main || !T.live || !(T.live.head > 0) || !(T.live.grow > 0) || !(T.live.feed > 0) || !(T.live.dis > 0) || !(T.live.dis < 0.02)) o.bad.push(k + ' mal défini'); co.forEach(g => { if (!(T.co && T.co[g] > 0)) o.bad.push(k + ' sans coproduit ' + g); }); }
      [T.ext].concat(Object.keys(T.co || {})).forEach(g => { if (!W.GOODS[g] || W.GOODS[g].grp !== 'raw') o.bad.push(g + ' pas matière brute'); if (W.RAW_SRC[g] !== k && !(g === 'leather' && k === 'fpig')) o.bad.push(g + ' RAW_SRC ' + W.RAW_SRC[g]); if (!(W.LOCAL_D[g] > 0)) o.bad.push(g + ' sans offre locale'); });
      if (!W.CATS.find(c => c.id === 'agri').tools.includes(k)) o.tools.push(k);
      if (!W.ICONS[k]) o.icons.push(k); o.colors.push(T.color);
      if (!(T.cost > 0 && T.jobs > 0 && T.upkeep > 0)) o.bad.push(k + ' coûts');
    });
    o.fertile = !!W.CROPS.grapes && W.CROPS.grapes === 'fvine';
    o.fields = 0; W.S.dep.forEach(d => { if (d && d.k === 'grapes') o.fields++; });
    // plus aucune recette ne tire lait, viande ou cuir du blé seul
    const R = W.RECIPES; o.noMilk = !R.milk && !R.leather && !R.spirit && !W.GOODS.spirit;
    o.meat = JSON.stringify(R.meat.in); o.wine = JSON.stringify(R.wine.in);
    o.wheatOnly = Object.keys(R).filter(r => ['milk', 'meat', 'leather'].includes(r) && Object.keys(R[r].in).every(g => g === 'wheat'));
    o.rawMilk = W.GOODS.milk.grp; o.leather = W.GOODS.leather.grp;
    // matières brutes : ni usine ni recette n'en fabrique
    ['milk', 'egg', 'beef', 'pork', 'poultry', 'lamb', 'wool', 'leather', 'grapes'].forEach(g => { if (R[g]) o.bad.push(g + ' a une recette'); });
    // produits finis de première nécessité
    o.fin = Object.keys(FINISHED).map(k => { const P = W.PRODUCTS[k]; return P ? [k, P.cls, W.NECESS[k], W.DEMAND_PC[k] > 0, W.PROD_W[k] && W.PROD_W[k].reduce((a, b) => a + b, 0), !!W.famOf(k) && W.famOf(k) !== 'Autres', W.OBSO[k] != null] : [k]; });
    o.w = { milk: W.PROD_W.drinkmilk, eggs: W.PROD_W.eggs };
    o.lux = [W.PRODUCTS.grandcru.cls, W.PRODUCTS.sweater.cls, W.PRODUCTS.spirits.in, W.PRODUCTS.whisky.in, W.PRODUCTS.beer.in];
    // noms uniques
    const seen = new Set(); [W.GOODS, W.PRODUCTS, W.TYPES].forEach(M => Object.keys(M).forEach(k => { const n = M[k].name; if (seen.has(n)) o.names.push(n); seen.add(n); }));   // un composant et sa recette portent le même nom : on compare marchandises, produits et bâtiments
    return o;
  }, { FARMS, FINISHED });
  t.check('4 élevages + vignoble : bâtiments Agriculture, têtes, croissance, aliment, maladie faible, coproduits, matières brutes avec offre locale', D.bad.length === 0, D.bad.slice(0, 4).join(' ; '));
  t.check('outils dans la catégorie Agriculture, icône vectorielle et couleur propres (aucun doublon)', D.tools.length === 0 && D.icons.length === 0 && new Set(D.colors).size === D.colors.length, D.tools.concat(D.icons).join(','));
  t.check('raisin : culture de la ferme viticole, champs de vigne sur la carte', D.fertile && D.fields > 20, D.fields + ' cases');
  t.check('plus aucune recette ne produit lait, viande ou cuir à partir de blé seul ; plus d\'« Alcools et ferments »', D.noMilk && D.wheatOnly.length === 0 && D.rawMilk === 'raw' && D.leather === 'raw', D.wheatOnly.join(',') + ' ' + D.meat);
  t.check('viandes (abattoir) = bœuf + porc ; vin = raisin', /beef/.test(D.meat) && /pork/.test(D.meat) && /grapes/.test(D.wine), D.meat + ' ' + D.wine);
  t.check('produits finis de première nécessité : classe basic, nécessité 70-90, demande par habitant, poids prix > marque, famille, obsolescence',
    D.fin.every(r => r[1] === (r[0] === 'tablewine' ? 'basic' : 'basic') && r[2] === FINISHED[r[0]] && r[3] && r[4] === 100 && r[5] && r[6]), JSON.stringify(D.fin.filter(r => !(r[1] === 'basic' && r[2] === FINISHED[r[0]] && r[3] && r[4] === 100 && r[5] && r[6]))));
  t.check('lait et œufs : poids prix / qualité / marque orientés prix (50 / 30 / 20)', JSON.stringify(D.w.milk) === '[50,30,20]' && JSON.stringify(D.w.eggs) === '[50,30,20]', JSON.stringify(D.w));
  t.check('vin de grande réserve en luxe, pull en laine manufacturé ; spiritueux = vin distillé ; whisky = blé + planches (plus de spirit) ; bière à partir de blé',
    D.lux[0] === 'lux' && D.lux[1] === 'std' && D.lux[2].wine > 0 && !D.lux[2].spirit && D.lux[3].wheat > 0 && D.lux[3].plank > 0 && !D.lux[3].spirit && D.lux[4].wheat > 0, JSON.stringify(D.lux));
  t.check('aucun nom en double (marchandises, produits, bâtiments)', D.names.length === 0, D.names.join(', '));

  // 2. Chaque élevage produit ses matières ; le troupeau grandit ; l'alimentation conditionne la production
  for (const k of Object.keys(FARMS)) {
    const p = await L.newPage({ wait: 500 }); await L.setup(p, { cash: 5e10, noAid: true }); await L.inject(p);
    const r = await p.evaluate(({ k, FARMS }) => {
      const W = window.WSE, S = W.S, T = window.T, N = W.N, o = {}; S.noEv = true;
      let c = null; for (let i = 0; i < N * N && !c; i++) { const x = i % N, y = (i / N) | 0; if (!W.footprintError(x, y, k) && W.place(x, y, k)) { c = S.grid[i]; try { W.autoConnect(x, y); } catch (e) { } } }
      o.placed = !!c; if (!c) return o;
      const [main, co] = FARMS[k], T0 = W.TYPES[k];
      const run = (n, wheat) => { let s = 0; for (let d = 0; d < n; d++) { T.frz(); if (wheat != null) S.stock.wheat = wheat; W.step(); s += c.out; } return s / n; };
      o.hd0 = c.hd; const first = run(3, 1e6); o.first = first; const e1 = run(60, 1e6);   // le troupeau atteint sa pleine capacité
      o.hd = c.hd; o.fed = run(20, 1e6); o.feed1 = c._feed;
      o.stocks = [main].concat(co).map(g => S.stock[g] > 0.1);
      const dis0 = c.sick | 0; o.sickSeen = dis0;
      o.starved = run(20, 0); o.feed0 = c._feed; o.limit = c.limit;
      o.expected = T0.rate * Math.max(1, W.unitsOf ? W.unitsOf(c) : 1);
      o.bad = T.scan(); return o;
    }, { k, FARMS });
    t.check(`${k} : posé en campagne, produit son bien principal et ses coproduits bruts (stocks > 0)`, r.placed && r.stocks && r.stocks.every(Boolean) && r.fed > 0, JSON.stringify(r.stocks) + ' sortie ' + (r.fed && r.fed.toFixed(1)));
    t.check(`${k} : le troupeau grandit après la pose (20 % -> pleine capacité) : premières ventes réduites`, r.hd0 != null && r.hd0 < 0.5 && r.hd >= 0.99 && r.first < r.fed * 0.7, `troupeau ${r.hd0 && r.hd0.toFixed(2)} -> ${r.hd && r.hd.toFixed(2)} · sortie ${r.first && r.first.toFixed(1)} -> ${r.fed && r.fed.toFixed(1)}`);
    t.check(`${k} : alimentation insuffisante = production en baisse (35 % à 45 % de la pleine production), limite « blé »`, r.starved < r.fed * 0.5 && r.starved > r.fed * 0.25 && r.feed0 < 0.05 && r.feed1 > 0.99 && ['wheat', 'alert'].includes(r.limit), `bien nourri ${r.fed && r.fed.toFixed(1)} · sans blé ${r.starved && r.starved.toFixed(1)} · limite ${r.limit}`);
    t.check(`${k} : 0 pageerror, aucun NaN`, p.errs.length === 0 && r.bad.length === 0, p.errs.concat(r.bad).slice(0, 2).join(';'));
    await p.context().close();
  }

  // 3. « Fabriquer » : la chaîne descend jusqu'à l'élevage (plan chiffré, arbre, construction, production)
  const CH = [['yogurt', 'fcattle', 'milk'], ['cheese', 'fcattle', 'milk'], ['drinkmilk', 'fcattle', 'milk'], ['readymeal', 'fcattle', 'beef'], ['readymeal', 'fpig', 'pork'], ['eggs', 'fchicken', 'egg'], ['chicken', 'fchicken', 'poultry'], ['sausage', 'fpig', 'pork'], ['lambmeat', 'fsheep', 'lamb'], ['sweater', 'fsheep', 'wool'], ['tablewine', 'fvine', 'grapes'], ['jacket', 'fcattle', 'leather']];
  const seenPk = new Set();
  for (const [pk, farm, g] of CH) {
    if (seenPk.has(pk)) continue; seenPk.add(pk);
    const need = CH.filter(x => x[0] === pk).map(x => [x[1], x[2]]);
    const p2 = await L.newPage({ wait: 600 }); await L.setup(p2, { cash: 5e10 }); await L.inject(p2);
    const r = await p2.evaluate(({ pk, need }) => {
      const W = window.WSE, S = W.S, T = window.T, o = {}; T.inP('port');
      const P = W.producePlan(pk); o.plan = { complete: P.complete, total: P.total, raws: P.raws, rows: P.rows.map(x => x.label), missing: P.missing };
      const tr = W.chainTree(pk); o.tree = tr ? tr.list.filter(n => !n.root).map(n => n.k + ':' + n.st) : []; o.nMiss0 = tr ? tr.nMiss : -1;
      o.treeCost = tr ? tr.missCost : 0;
      const cash0 = S.cash; o.ok = W.quickProduce(pk, { raws: true }); o.spent = cash0 - S.cash;
      const leaves = W.chainLeaves(pk); o.noSrc = leaves.filter(g => !W.sourceInfo(g).n && g !== 'ingot'); o.wheatLeaf = leaves.includes('wheat');
      o.farms = need.map(([f]) => { let n = 0; for (let i = 0; i < W.N * W.N; i++) { const c = S.grid[i]; if (c && c.t === f && c.x + c.y * W.N === i) n++; } return f + ':' + n; });
      const tr2 = W.chainTree(pk); o.nMiss1 = tr2 ? tr2.nMiss : -1;
      T.stepN(150, true); const ps = S.prod[pk]; o.made = ps.made || 0; o.stock = ps.stock || 0; o.bad = T.scan(); o.lim = []; T.bldgs().forEach(c => { if (c.prod === pk && c.limit) o.lim.push(c.limit); });
      return o;
    }, { pk, need });
    const labels = need.map(x => x[0]);
    t.check(`« Fabriquer » ${pk} : plan chiffré jusqu'à l'élevage (${labels.join(', ')}) et à sa ferme de blé`, r.plan.complete && r.plan.total > 0 && labels.every(f => r.plan.rows.some(x => x.indexOf(window_name(f)) === 0)) && (pk === 'tablewine' || r.plan.rows.some(x => /Ferme de blé/.test(x))), `${r.plan.rows.length} lignes · ${Math.round(r.plan.total / 1e6)} M$ · manque ${r.plan.missing.join(';')}`);
    t.check(`arbre de chaîne ${pk} : matières d'élevage et blé d'alimentation en nœuds, tous couverts après construction`, need.every(([f, g2]) => r.tree.some(s => s.indexOf(g2 + ':') === 0)) && (pk === 'tablewine' || r.tree.some(s => s.indexOf('wheat:') === 0)) && r.nMiss1 === 0, `avant ${r.nMiss0} maillons manquants (${Math.round(r.treeCost / 1e6)} M$), après ${r.nMiss1}`);
    t.check(`quickProduce ${pk} : construit l'élevage (${r.farms.join(' ')}), le blé d'alimentation, toutes les feuilles ont une source`, r.ok && r.noSrc.length === 0 && (r.wheatLeaf || pk === 'tablewine') && r.farms.every(s => +s.split(':')[1] >= 1), `sans source : ${r.noSrc.join(',')} · dépensé ${Math.round(r.spent / 1e6)} M$`);
    t.check(`${pk} : de bout en bout, la chaîne produit des unités en 150 jours`, r.made > 0 && r.bad.length === 0, `fabriqué ${Math.round(r.made)} · limites ${[...new Set(r.lim)].join(',')} · ${r.bad.slice(0, 2).join(';')}`);
    t.check(`${pk} : 0 pageerror`, p2.errs.length === 0, p2.errs.slice(0, 2).join(';'));
    await p2.context().close();
  }

  // 4. Guide de l'agriculteur : élevages jouables, fiche par animal ; guide du fabricant à jour
  { const src = fs.readFileSync(path.join(__dirname, '..', '..', 'game.template.html'), 'utf8');
    t.check('guide de l\'agriculteur : plus de « en préparation » pour l\'élevage, ni « (à venir) » sur les animaux', !/Élevage : en préparation/.test(src) && !/FLIVE[^\n]*à venir/.test(src), '');
    t.check('guide de l\'agriculteur : fiche par animal (cycle, aliment, produits, débouchés, saisonnalité)', /Cycle de l'élevage/.test(src) && /Produits bruts/.test(src) && /Aliment/.test(src) && /Débouchés/.test(src), ''); }

  // 5. Sauvegarde antérieure : chargée, cartes inchangées ; stocks d'alcools devenus vin
  { const save = fs.readFileSync(path.join(__dirname, 'fixtures', 'save_v8_avant_passe33.json'), 'utf8'), old = JSON.parse(save);
    old.stock = old.stock || {}; old.stock.spirit = 321; old.stock.milk = 12;
    const sv = JSON.stringify(old);
    const oldDep = {}; old.dep.forEach(a => { oldDep[a[0]] = a[1]; });
    const b = await L.browser(), ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('wse_fx')) { localStorage.setItem('wse-city-v8', s); sessionStorage.setItem('wse_fx', '1'); } } catch (e) { } }, sv);
    const p5 = await L.newPage({ ctx, wait: 1200 }); await L.inject(p5);
    const r = await p5.evaluate(({ oldDep }) => {
      const W = window.WSE, S = W.S, N = W.N, T = window.T, o = { day: S.day, nb: T.bldgs().length, moved: 0 };
      Object.keys(oldDep).forEach(i => { const d = S.dep[i]; if (!d || d.k !== oldDep[i]) o.moved++; });
      o.wine = S.stock.wine; o.milk = S.stock.milk; o.farm = T.bldgs().filter(c => W.TYPES[c.t].live).length;
      const d0 = S.day; T.stepN(30, true); o.adv = S.day - d0; o.bad = T.scan(); W.save(); o.v = JSON.parse(localStorage.getItem('wse-city-v8')).v; return o; }, { oldDep });
    t.check('ancienne sauvegarde : chargée au même jour avec ses bâtiments, cartes (gisements) inchangées', r.day === old.day && r.nb >= 10 && r.moved === 0, `jour ${r.day}/${old.day} · ${r.nb} bâtiments · ${r.moved} cases modifiées`);
    t.check('ancienne sauvegarde : le stock d\'alcools devient du vin, le lait reste du lait, 30 jours sans NaN, réenregistrée en v8', Math.round(r.wine) === 321 && r.milk >= 11 && r.adv === 30 && r.bad.length === 0 && r.v === 8 && p5.errs.length === 0, `vin ${Math.round(r.wine)} · lait ${Math.round(r.milk)} · ${r.bad.slice(0, 2).join(';')} · ${p5.errs.slice(0, 2).join(';')}`);
    await ctx.close(); }

  // 6. Épizootie : rare, effet limité, déterministe ; déterminisme global
  { const run = async () => { const p = await L.newPage({ wait: 500 }); await L.setup(p, { cash: 5e10 }); await L.inject(p);
      const s = await p.evaluate(() => { const W = window.WSE, S = W.S, T = window.T, N = W.N; S.noEv = true; T.inP('port');
        ['fcattle', 'fchicken', 'fpig', 'fsheep', 'fwheat'].forEach(k => { for (let i = 0; i < N * N; i++) { const x = i % N, y = (i / N) | 0; if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) { } break; } } });
        T.stepN(400, true); const farms = T.bldgs().filter(c => W.TYPES[c.t].live);
        return JSON.stringify([S.stock.milk, S.stock.egg, S.stock.pork, S.stock.wool, S.stock.beef, S.stock.leather, Math.round(S.cash), farms.map(c => (c.sick | 0) + ':' + c.hd.toFixed(3))]); });
      await p.context().close(); return s; };
    const a = await run(), b = await run();
    const sick = JSON.parse(a)[7].map(x => +x.split(':')[0]);
    t.check('déterminisme : deux parties identiques (4 élevages, 400 jours, maladies comprises) donnent les mêmes stocks et la même trésorerie', a === b && a.indexOf('null') < 0, a === b ? a.slice(0, 90) : a.slice(0, 60) + ' <> ' + b.slice(0, 60));
    t.check('maladie : événement rare (au plus 6 épizooties par ferme en 400 jours)', sick.every(n => n <= 6), sick.join(',')); }
};
function window_name(f) { return ({ fcattle: 'Élevage de bovins', fchicken: 'Élevage de poulets', fpig: 'Élevage de porcs', fsheep: 'Élevage de moutons', fvine: 'Vignoble' })[f]; }
