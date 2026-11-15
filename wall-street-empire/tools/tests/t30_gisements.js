// Passe 33 : gisements industriels (nickel, chrome, bauxite, lithium, silice, sel, soufre, phosphate, gaz, terres rares, zinc, argile, potasse, graphite),
// leurs mines, les chaînes qui en dérivent (inox, aluminium, batteries, aimants, chimie, engrais, briques, porcelaine), le marché, les sauvegardes et le déterminisme.
const fs = require('fs'), path = require('path');
exports.name = 'Gisements industriels (passe 33)';

const MINE = { nickel: 'mnickel', chrome: 'mchrome', bauxite: 'mbauxite', lithium: 'mlithium', silica: 'qsilica', salt: 'qsalt', sulfur: 'msulfur', phosphate: 'mphos', gas: 'gwell', rare: 'mrare', zinc: 'mzinc', clay: 'qclay', potash: 'mpotash', graphite: 'mgraphite' };
const KINDS = Object.keys(MINE);
const NEWC = ['stainless', 'galva', 'brass', 'alumina', 'aluminium', 'magnet', 'fert', 'brick', 'porcelain', 'chassisal'];
// EBITDA visé d'un extracteur posé sur le gisement le plus proche du port (macro figée) : métaux 38-62 %, minéraux et chimie 17-45 %, gaz 15-30 %
const EBR = { nickel: [38, 62], chrome: [38, 62], bauxite: [38, 62], lithium: [38, 62], rare: [38, 62], zinc: [38, 62], graphite: [38, 62], silica: [17, 45], salt: [17, 45], clay: [17, 45], sulfur: [17, 45], phosphate: [17, 45], potash: [17, 45], gas: [15, 30] };

exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);

  // 1. Données : gisements sur la carte, rareté, accessibilité
  const D = await pg.evaluate(({ MINE, NEWC }) => {
    const W = window.WSE, S = W.S, N = W.N, o = { kinds: {}, bad: [], names: [], orphan: [], leaf: [], tables: [], icons: [], fams: [] };
    Object.keys(MINE).forEach(k => {
      const cells = []; for (let i = 0; i < N * N; i++) { const d = S.dep[i]; if (d && d.k === k) cells.push(i); }
      let near = 999, acc = 0, rmin = 1e12, rmax = 0, gmin = 9, gmax = 0;
      cells.forEach(i => { const x = i % N, y = (i / N) | 0, d = Math.abs(x - 75) + Math.abs(y - 69); if (d < near) near = d; if (!W.footprintError(x, y, MINE[k]) && d <= 75) acc++; rmin = Math.min(rmin, S.dep[i].r); rmax = Math.max(rmax, S.dep[i].r); const g = W.gradeOf(x, y, k); gmin = Math.min(gmin, g); gmax = Math.max(gmax, g); });
      o.kinds[k] = { n: cells.length, near, acc, res: W.DEPOSITS[k].res, gmin, gmax };
      if (!W.GOODS[k] || W.GOODS[k].grp !== 'raw') o.bad.push(k + ' : pas une matière brute');
      if (W.RAW_SRC[k] !== MINE[k] || !W.TYPES[MINE[k]] || W.TYPES[MINE[k]].ext !== k) o.bad.push(k + ' : mine absente ou mal reliée');
      if (!(W.LOCAL_D[k] > 0) || !(W.EL_RAW[k] > 0)) o.tables.push(k);
      if (!W.ICONS[MINE[k]]) o.icons.push(MINE[k]);
    });
    // noms uniques et chaînes sans orphelin : tout composant nouveau sert à une recette ou à un produit, toute matière brute aussi
    const dup = (obj, f) => { const s = new Set(), d = []; Object.keys(obj).forEach(k => { const n = f(obj[k]); if (s.has(n)) d.push(n); s.add(n); }); return d; };
    o.names = dup(W.GOODS, g => g.name).concat(dup(W.TYPES, g => g.name), dup(W.PRODUCTS, g => g.name), dup(W.RECIPES, g => g.name));
    const used = g => Object.keys(W.RECIPES).some(r => W.RECIPES[r].in[g]) || Object.keys(W.PRODUCTS).some(p => W.PRODUCTS[p].in[g]);
    Object.keys(MINE).concat(NEWC).forEach(g => { if (!used(g) && g !== 'fert') o.orphan.push(g); });   // l'engrais est consommé par l'option Engrais des fermes (testée plus bas)
    NEWC.forEach(g => { if (!W.RECIPES[g] || !W.GOODS[g]) o.orphan.push(g + ' sans recette'); });
    // toute feuille d'une recette ou d'un produit est une matière brute avec une mine, ou le lingot (fonderie)
    const leaves = (g, set) => { const R = W.RECIPES[g]; if (!R) { set.add(g); return; } Object.keys(R.in).forEach(i => leaves(i, set)); };
    const all = new Set(); Object.keys(W.RECIPES).forEach(r => leaves(r, all)); Object.keys(W.PRODUCTS).forEach(p => Object.keys(W.PRODUCTS[p].in).forEach(g => leaves(g, all)));
    all.forEach(g => { if (g !== 'ingot' && !W.RAW_SRC[g]) o.leaf.push(g); });
    // catalogue : toutes les mines sont dans la famille Extraction, et les familles sont celles demandées
    const fam = W.FAMS.extr, listed = new Set(fam.flatMap(f => f[1]));
    Object.values(MINE).forEach(m => { if (!listed.has(m) || !W.CATS.find(c => c.id === 'extr').tools.includes(m)) o.fams.push(m); });
    o.famNames = fam.map(f => f[0]); o.colors = Object.values(MINE).map(m => W.TYPES[m].color); o.iconStr = Object.values(MINE).map(m => W.ICONS[m]);
    o.uses = { lithium: W.usesTxt('lithium', 5), nickel: W.usesTxt('nickel', 5), bauxite: W.usesTxt('bauxite', 5), silica: W.usesTxt('silica', 5), rare: W.usesTxt('rare', 5), salt: W.usesTxt('salt', 5), phosphate: W.usesTxt('phosphate', 5), clay: W.usesTxt('clay', 5), zinc: W.usesTxt('zinc', 5), sulfur: W.usesTxt('sulfur', 5) };
    return o;
  }, { MINE, NEWC });
  KINDS.forEach(k => t.info(`${k.padEnd(9)} ${String(D.kinds[k].n).padStart(3)} cases · plus proche à ${String(D.kinds[k].near).padStart(3)} cases du port · teneur ${D.kinds[k].gmin}-${D.kinds[k].gmax} · réserve ${D.kinds[k].res}/case`));
  t.check(`${KINDS.length} gisements : chacun a au moins 1 site sur la carte`, KINDS.every(k => D.kinds[k].n >= 1), KINDS.filter(k => D.kinds[k].n < 1).join(', '));
  t.check('chaque gisement a au moins 1 site accessible (constructible, à 75 cases du port au plus)', KINDS.every(k => D.kinds[k].acc >= 1), KINDS.filter(k => D.kinds[k].acc < 1).join(', '));
  t.check('rareté : lithium, terres rares et graphite ont moins de 12 cases ; silice, sel et argile plus de 30', ['lithium', 'rare', 'graphite'].every(k => D.kinds[k].n <= 12) && ['silica', 'salt', 'clay'].every(k => D.kinds[k].n >= 30), KINDS.map(k => k + ':' + D.kinds[k].n).join(' '));
  t.check('inégalité géographique : au moins 4 gisements à plus de 35 cases du port, au moins 3 à moins de 40', KINDS.filter(k => D.kinds[k].near > 35).length >= 4 && KINDS.filter(k => D.kinds[k].near < 40).length >= 3, KINDS.map(k => k + ':' + D.kinds[k].near).join(' '));
  t.check('teneur du minerai : varie selon la région (0,85 à 1,15), jamais hors bornes, sauf le gaz', KINDS.every(k => D.kinds[k].gmin >= 0.85 && D.kinds[k].gmax <= 1.15) && KINDS.some(k => D.kinds[k].gmax - D.kinds[k].gmin > 0.1), '');
  t.check('chaque gisement : matière brute, mine reliée par RAW_SRC, offre locale (LOCAL_D) et élasticité (EL_RAW)', D.bad.length === 0 && D.tables.length === 0, D.bad.concat(D.tables).join(', '));
  t.check('chaque mine a une icône vectorielle, une couleur et un dessin propres (aucun doublon)', D.icons.length === 0 && new Set(D.colors).size === D.colors.length && new Set(D.iconStr).size === D.iconStr.length, D.icons.join(', '));
  t.check('catalogue des mines : familles Énergie, Métaux, Minéraux industriels, Chimie de base ; les 14 mines y figurent', D.fams.length === 0 && ['Énergie', 'Métaux', 'Minéraux industriels', 'Chimie de base'].every(f => D.famNames.includes(f)), D.fams.join(', ') + ' | ' + D.famNames.join(', '));
  t.check('aucun nom en double (marchandises, bâtiments, produits, composants)', D.names.length === 0, D.names.join(', '));
  t.check('aucune chaîne orpheline : chaque matière et chaque composant nouveau est consommé, chaque recette a ses intrants', D.orphan.length === 0, D.orphan.join(', '));
  t.check('toute chaîne remonte à une mine, un puits ou une ferme (aucune feuille sans extracteur)', D.leaf.length === 0, D.leaf.join(', '));
  t.check('débouchés affichés : lithium -> batteries, nickel -> inox, bauxite -> alumine, silice -> verre/silicium, sel et soufre -> chimie, argile -> briques',
    /batteries/.test(D.uses.lithium) && /inoxydable/.test(D.uses.nickel) && /alumine/.test(D.uses.bauxite) && /(verre|silicium)/.test(D.uses.silica) && /chimiques/.test(D.uses.salt) && /chimiques/.test(D.uses.sulfur) && /briques/.test(D.uses.clay) && /aimants/.test(D.uses.rare) && /(engrais|principes)/.test(D.uses.phosphate) && /(galvanis|laiton)/.test(D.uses.zinc), JSON.stringify(D.uses).slice(0, 300));
  await pg.context().close();

  // 2. Déterminisme de la carte : deux parties neuves, même carte (et anciennes cases inchangées : voir le test de sauvegarde)
  { const a = await L.newPage({ wait: 400 }), b = await L.newPage({ wait: 400 });
    const ha = await a.evaluate(() => JSON.stringify(window.WSE.S.dep.map(d => d ? [d.k, d.r] : 0))), hb = await b.evaluate(() => JSON.stringify(window.WSE.S.dep.map(d => d ? [d.k, d.r] : 0)));
    t.check('carte déterministe : deux parties neuves ont exactement les mêmes gisements', ha === hb && ha.length > 1000, `${ha.length} octets`);
    await a.context().close(); await b.context().close(); }

  // 3. Les mines produisent et sont rentables (EBITDA et retour sur capex)
  const ex = await L.pool(KINDS, 4, k => L.isoExtractor(MINE[k], k));
  ex.forEach((x, i) => { const k = KINDS[i], [lo, hi] = EBR[k]; if (x.none) return t.check(`mine ${MINE[k]} : gisement disponible`, false); t.check(`mine ${MINE[k]} (${k}) : produit, EBITDA ${lo}-${hi} % et retour <= 3,5 ans`, Number.isFinite(x.eb) && x.eb * 100 >= lo && x.eb * 100 <= hi && x.payback <= 3.5, `EBITDA ${(x.eb * 100).toFixed(1)} %, retour ${x.payback.toFixed(1)} an`); });

  // 4. Recettes : EBITDA des usines (intrants au prix de base) et des produits nouveaux
  const RECS = NEWC.concat(['chem', 'api', 'glass', 'silicon', 'battery', 'motor', 'ceramic', 'hardware', 'led']);
  const rr = await L.pool(RECS.concat(['cookware', 'car_alu']), 4, k => L.isoFactory(k));
  const by = Object.fromEntries(rr.map(a => [a.key, a]));
  RECS.forEach(k => k === 'api' ? t.range(`recette ${k} (${by[k].fk}) : EBITDA 20-28 % (cible 25 %)`, by[k].eb * 100, 20, 28, ' %') : t.range(`recette ${k} (${by[k].fk}) : EBITDA 10-22 %`, by[k].eb * 100, 10, 22, ' %'));
  ['cookware', 'car_alu'].forEach(k => t.range(`produit ${k} : EBITDA 12-32 %`, by[k].eb * 100, 12, 32, ' %'));
  t.check('usines isolées : 0 pageerror', rr.every(a => a.errs.length === 0), rr.flatMap(a => a.errs).slice(0, 2).join(';'));

  // 5. « Fabriquer » : plan chiffré complet jusqu'à la mine, construction, arbre de chaîne, production
  for (const [pk, need] of [['car_alu', ['mbauxite', 'gwell', 'qsalt', 'msulfur']], ['cookware', ['mnickel', 'mchrome']]]) {
    const p2 = await L.newPage({ wait: 600 }); await L.setup(p2, { cash: 5e10 }); await L.inject(p2);
    const r = await p2.evaluate(({ pk, need }) => {
      const W = window.WSE, S = W.S, T = window.T, o = {};
      const P = W.producePlan(pk); o.plan = { complete: P.complete, total: P.total, raws: P.raws, missing: P.missing, rows: P.rows.map(x => x.label), minesIn: need.every(m => P.rows.some(x => x.label.indexOf(W.TYPES[m].name) === 0)) };
      const tr = W.chainTree(pk); o.tree = tr ? tr.list.filter(n => !n.root).map(n => n.k + ':' + n.st) : []; o.nMiss0 = tr ? tr.nMiss : -1;
      const cash0 = S.cash; o.ok = W.quickProduce(pk, { raws: true }); o.spent = cash0 - S.cash;
      const leaves = W.chainLeaves(pk); o.noSrc = leaves.filter(g => !W.sourceInfo(g).n && g !== 'ingot'); o.leaves = leaves;
      o.mines = need.map(m => { let n = 0; for (let i = 0; i < W.N * W.N; i++) { const c = S.grid[i]; if (c && c.t === m && c.x + c.y * W.N === i) n++; } return m + ':' + n; });
      const tr2 = W.chainTree(pk); o.nMiss1 = tr2 ? tr2.nMiss : -1;
      T.stepN(90, true); const ps = S.prod[pk]; o.made = ps.made || 0; o.stock = ps.stock || 0; o.lim = []; T.bldgs().forEach(c => { if (c.prod === pk && c.limit) o.lim.push(c.limit); });
      o.bad = T.scan(); return o;
    }, { pk, need });
    t.check(`« Fabriquer » ${pk} : plan chiffré complet (usine, composants, matières premières jusqu'aux mines)`, r.plan.complete && r.plan.total > 0 && r.plan.raws > 0 && r.plan.minesIn && r.plan.rows.length >= 6, `${r.plan.rows.length} lignes, ${Math.round(r.plan.total / 1e6)} M$, manque : ${r.plan.missing.join(' ; ')}`);
    t.check(`arbre de chaîne ${pk} : les matières nouvelles y figurent (${need.map(m => m).join(', ')} -> maillons à construire avant, en place après)`, need.every(m => { const g = Object.keys(MINE).find(k => MINE[k] === m); return r.tree.some(s => s.indexOf(g + ':') === 0); }) && r.nMiss1 === 0, `avant ${r.nMiss0} maillons manquants, après ${r.nMiss1} ; ${r.tree.slice(0, 12).join(' ')}`);
    t.check(`quickProduce ${pk} : va jusqu'aux mines (${need.join(', ')}) et toutes les feuilles ont une source`, r.ok && r.noSrc.length === 0 && r.mines.every(s => +s.split(':')[1] >= 1), `construit : ${r.mines.join(' ')} · sans source : ${r.noSrc.join(',')} · dépensé ${Math.round(r.spent / 1e6)} M$`);
    t.check(`${pk} : la chaîne produit des unités en 90 jours, sans valeur absurde`, r.made > 0 && r.bad.length === 0, `fabriqué ${Math.round(r.made)} · limites ${[...new Set(r.lim)].join(',')} · ${r.bad.slice(0, 2).join(';')}`);
    t.check(`${pk} : 0 pageerror`, p2.errs.length === 0, p2.errs.slice(0, 2).join(';'));
    await p2.context().close();
  }

  // 6. Marché : offre locale et PNJ, prix cohérents, demande des rivaux
  { const p3 = await L.newPage({ wait: 600 }); await L.setup(p3, { cash: 5e10 }); await L.inject(p3);
    const r = await p3.evaluate(({ KINDS, NEWC }) => {
      const W = window.WSE, S = W.S, T = window.T; T.stepN(120, true); const o = { px: [], npc: [], d0: 0, d1: 0 };
      KINDS.concat(NEWC).forEach(g => { const rel = S.price[g] / (W.GOODS[g].base * (S.cpi || 1)); if (!(rel > 0.5 && rel < 2.2)) o.px.push(g + ' x' + rel.toFixed(2)); const n = S.npcSup && S.npcSup[g]; if (!n) o.npc.push(g); });
      o.demandUse = ['lithium', 'rare', 'nickel', 'aluminium'].every(g => W.RIV_USE[g]); o.riv = ['steel', 'copper'].every(g => !W.RIV_USE[g]);
      return o; }, { KINDS, NEWC });
    t.check('marché : après 120 jours, tous les cours restent dans 0,5-2,2 × la base', r.px.length === 0, r.px.join(', '));
    t.check('marché : un producteur local (PNJ) suit chaque matière nouvelle', r.npc.length === 0, r.npc.join(', '));
    t.check('demande des rivaux : lithium, terres rares, nickel et aluminium la majorent, pas l\'acier ni le cuivre', r.demandUse && r.riv, '');
    t.check('marché : 0 pageerror', p3.errs.length === 0, p3.errs.slice(0, 2).join(';')); await p3.context().close(); }

  // 7. Engrais : +20 % de récolte, consomme le stock, persiste dans la sauvegarde
  { const p4 = await L.newPage({ wait: 600 }); await L.setup(p4, { cash: 5e10 }); await L.inject(p4);
    const r = await p4.evaluate(() => {
      const W = window.WSE, S = W.S, T = window.T; const f = T.onDep('fwheat', 'wheat'); if (!f) return null; T.inP('port');
      let a = 0, b = 0; for (let i = 0; i < 20; i++) { f.fert = 0; S.stock.fert = 1e7; T.frz(); S.stock.wheat = 0; W.step(); if (i >= 8) a += f.out; f.fert = 1; S.stock.fert = 1e7; T.frz(); S.stock.wheat = 0; W.step(); if (i >= 8) b += f.out; }   // jours alternés : l'effectif qui monte se compense
      W.save(); const sv = JSON.parse(localStorage.getItem('wse-city-v8'));
      return { a, b, ratio: b / a, used: 1e7 - S.stock.fert, saved: JSON.stringify(sv.g).indexOf('"fe":1') >= 0 }; });
    t.check('engrais : +20 % de récolte (17 à 23) quand le stock est suffisant, et le stock diminue', !!r && r.ratio > 1.17 && r.ratio < 1.23 && r.used > 0, r ? `×${r.ratio.toFixed(3)}, ${Math.round(r.used)} u consommées` : 'ferme absente');
    t.check('engrais : l\'option est enregistrée dans la sauvegarde', !!r && r.saved, '');
    await p4.context().close(); }

  // 8. Sauvegarde antérieure (fixture produite par la version d'avant la passe 33) : chargeable, anciens gisements inchangés, nouveaux ajoutés sur cases libres
  { const save = fs.readFileSync(path.join(__dirname, 'fixtures', 'save_v8_avant_passe33.json'), 'utf8'), old = JSON.parse(save);
    const oldDep = {}; old.dep.forEach(a => { oldDep[a[0]] = a[1]; });
    const b = await L.browser(), ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('wse_fx')) { localStorage.setItem('wse-city-v8', s); sessionStorage.setItem('wse_fx', '1'); } } catch (e) { } }, save);
    const p5 = await L.newPage({ ctx, wait: 1200 }); await L.inject(p5);
    const r = await p5.evaluate(({ oldDep, MINE }) => {
      const W = window.WSE, S = W.S, N = W.N, T = window.T, o = { day: S.day, nb: T.bldgs().length, cnt: {}, moved: 0, onBld: 0 };
      Object.keys(oldDep).forEach(i => { const d = S.dep[i]; if (!d || d.k !== oldDep[i]) o.moved++; });
      Object.keys(MINE).forEach(k => { o.cnt[k] = 0; for (let i = 0; i < N * N; i++) { const d = S.dep[i]; if (d && d.k === k) { o.cnt[k]++; if (S.grid[i]) o.onBld++; } } });
      const d0 = S.day; T.stepN(30, true); o.adv = S.day - d0; o.bad = T.scan(); o.px = ['lithium', 'aluminium', 'stainless'].map(g => S.price[g]);
      W.save(); const s2 = JSON.parse(localStorage.getItem('wse-city-v8')); o.dep2 = s2.dep.length; o.sameNew = s2.dep.filter(a => MINE[a[1]]).length;
      return o; }, { oldDep, MINE });
    t.check('ancienne sauvegarde : chargée au même jour avec ses bâtiments', r.day === old.day && r.nb >= 10, `jour ${r.day}/${old.day}, ${r.nb} bâtiments`);
    t.check('ancienne sauvegarde : les anciens gisements sont strictement inchangés', r.moved === 0, `${r.moved} cases modifiées`);
    t.check('ancienne sauvegarde : les 14 nouveaux gisements sont ajoutés, jamais sous un bâtiment existant', KINDS.every(k => r.cnt[k] >= 1) && r.onBld === 0, KINDS.map(k => k + ':' + r.cnt[k]).join(' ') + ' sous bâtiment ' + r.onBld);
    t.check('ancienne sauvegarde : 30 jours de simulation, cours des nouvelles matières définis, sans NaN', r.adv === 30 && r.bad.length === 0 && r.px.every(v => v > 0), `${r.adv} j · ${r.bad.slice(0, 2).join(';')} · ${r.px.map(v => v && v.toFixed(1)).join('/')}`);
    t.check('ancienne sauvegarde : réenregistrée avec les nouveaux gisements, 0 pageerror', r.sameNew > 20 && p5.errs.length === 0, `${r.sameNew} cases nouvelles · ${p5.errs.slice(0, 2).join(';')}`);
    await ctx.close(); }

  // 9. Déterminisme de la simulation avec les nouvelles chaînes : deux parties identiques donnent la même économie
  { const run = async () => { const p = await L.newPage({ wait: 500 }); await L.setup(p, { cash: 5e10 }); await L.inject(p);
      const s = await p.evaluate(() => { const W = window.WSE, S = W.S, T = window.T; S.noEv = true; T.inP('port'); ['mlithium', 'mnickel', 'mbauxite', 'qsalt', 'msulfur'].forEach(m => { const g = W.TYPES[m].ext; T.onDep(m, g); }); T.stepN(60, true); return JSON.stringify([S.stock.lithium, S.stock.nickel, S.stock.bauxite, S.stock.salt, S.stock.sulfur, Math.round(S.cash), S.price.lithium, S.price.salt]); });
      await p.context().close(); return s; };
    const a = await run(), b = await run();
    t.check('déterminisme : deux parties identiques (5 mines, 60 jours) donnent les mêmes stocks, cours et trésorerie', a === b && a.indexOf('null') < 0, a === b ? a.slice(0, 80) : a.slice(0, 60) + ' <> ' + b.slice(0, 60)); }
};
