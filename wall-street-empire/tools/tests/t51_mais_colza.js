// Passe 51 : maïs et colza. Cultures constructibles (3×3 depuis la passe 85, sprites HD), zones fertiles sur la carte, production, chaînes
// maïs + colza -> huile de cuisine -> huile de table (LE dérivé retenu ; les chips de maïs sont retirées : passe 75), colza -> biodiesel -> biocarburant, vente en magasin,
// rentabilité des fermes, guide, sauvegarde antérieure, déterminisme, 0 erreur de page.
const fs = require('fs'), path = require('path');
exports.name = 'Maïs et colza (passe 51)';

const CROPS2 = { fcorn: 'corn', frapeseed: 'rapeseed' };
const FIN = { tableoil: ['cookoil'], biofuel: ['biodiesel'] };

exports.run = async (t, L) => {
  const root = path.resolve(__dirname, '..', '..');
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);

  // 1. Données : types, biens, recettes, produits et toutes leurs tables
  const D = await pg.evaluate(({ CROPS2, FIN }) => {
    const W = window.WSE, S = W.S, o = { bad: [] };
    Object.keys(CROPS2).forEach(k => {
      const T = W.TYPES[k], g = CROPS2[k]; if (!T) { o.bad.push(k + ' absent'); return; }
      if (T.ext !== g || T.w !== 3 || T.h !== 3 || T.live)   /* passe 85 : cultures 3×3 (avant 2×2) */ o.bad.push(k + ' mal défini');
      if (!(T.cost > 0 && T.jobs > 0 && T.upkeep > 0 && T.rate > 0)) o.bad.push(k + ' coûts');
      if (!W.GOODS[g] || W.GOODS[g].grp !== 'raw') o.bad.push(g + ' pas matière brute');
      if (W.CROPS[g] !== k || W.RAW_SRC[g] !== k) o.bad.push(g + ' CROPS/RAW_SRC');
      if (!(W.LOCAL_D[g] > 0) || !(W.RES_COST[g] > 0)) o.bad.push(g + ' sans offre locale ou coût');
      if (!W.DEPOSITS[g]) o.bad.push(g + ' sans gisement');
      if (!W.CATS.find(c => c.id === 'agri').tools.includes(k)) o.bad.push(k + ' hors menu Agriculture');
      if (!W.ICONS[k]) o.bad.push(k + ' sans icône');
      if (W.RECIPES[g]) o.bad.push(g + ' a une recette');
    });
    o.base = { wheat: W.GOODS.wheat.base, sugar: W.GOODS.sugar.base, corn: W.GOODS.corn.base, rapeseed: W.GOODS.rapeseed.base, cookoil: W.GOODS.cookoil.base, biodiesel: W.GOODS.biodiesel.base };
    o.rec = { cookoil: W.RECIPES.cookoil && W.RECIPES.cookoil.in, biodiesel: W.RECIPES.biodiesel && W.RECIPES.biodiesel.in, grpC: W.GOODS.cookoil.grp, grpB: W.GOODS.biodiesel.grp };
    o.fin = Object.keys(FIN).map(k => { const P = W.PRODUCTS[k]; if (!P) return [k, 'absent']; const w = W.PROD_W[k]; return [k, P.cls, FIN[k].every(g => P.in[g] > 0), P.ref > 0 && P.out > 0 && P.rnd > 0 && P.days > 0 && P.tier != null && !!P.desc, W.NECESS[k] != null, W.DEMAND_PC[k] > 0, w && w.reduce((a, b) => a + b, 0) === 100, W.OBSO[k] != null, W.famOf(k) !== 'Autres', !!W.GLY[k], /^<svg/.test(W.productSVG(k, 1)), !!W.P25[k], S.prod[k] && S.prod[k].st]; });
    o.tableoilNec = W.NECESS.tableoil; o.fam = [W.famOf('tableoil'), W.famOf('biofuel')]; o.noChips = !W.PRODUCTS.cornchips && !!W.PROD_RETIRED.cornchips;
    o.fields = {}; S.dep.forEach(d => { if (d && (d.k === 'corn' || d.k === 'rapeseed')) o.fields[d.k] = (o.fields[d.k] || 0) + 1; });
    o.quad = {}; S.dep.forEach((d, i) => { if (d && (d.k === 'corn' || d.k === 'rapeseed')) { const q = (i % W.N < W.N / 2 ? 0 : 1) + ((i / W.N | 0) < W.N / 2 ? 0 : 2); (o.quad[d.k] = o.quad[d.k] || {})[q] = 1; } });
    const seen = new Set(); o.dup = []; [W.GOODS, W.PRODUCTS, W.TYPES].forEach(M => Object.keys(M).forEach(k => { const n = M[k].name; if (seen.has(n)) o.dup.push(n); seen.add(n); }));
    o.counts = [Object.keys(W.TYPES).length, Object.keys(W.GOODS).length, Object.keys(W.RECIPES).length, Object.keys(W.PRODUCTS).length];
    return o;
  }, { CROPS2, FIN });
  t.check('fcorn et frapeseed : fermes 3×3 du menu Agriculture, maïs et colza bruts (CROPS, RAW_SRC, gisement, offre locale, coût), icône', D.bad.length === 0, D.bad.slice(0, 4).join(' ; '));
  t.check('prix de base cohérents avec le blé et la canne (maïs 5-8 $, colza 7-12 $)', D.base.corn >= 5 && D.base.corn <= 8 && D.base.rapeseed >= 7 && D.base.rapeseed <= 12, JSON.stringify(D.base));
  t.check('recettes : huile de cuisine = maïs + colza, biodiesel = colza + produits chimiques (intermédiaires « comp »)', D.rec.cookoil && D.rec.cookoil.corn > 0 && D.rec.cookoil.rapeseed > 0 && D.rec.biodiesel && D.rec.biodiesel.rapeseed > 0 && D.rec.biodiesel.chem > 0 && D.rec.grpC === 'comp' && D.rec.grpB === 'comp', JSON.stringify(D.rec));
  t.check('produits finis (huile de table, biocarburant) : intrants, prix, R&D, nécessité, demande, méga-classe, poids, obsolescence, famille, vignette',
    D.fin.every(r => r[1] === 'basic' && r.slice(2, 12).every(Boolean)), JSON.stringify(D.fin.filter(r => !(r[1] === 'basic' && r.slice(2, 12).every(Boolean)))));
  t.check('huile de table : première nécessité (Alimentation), biocarburant dans Auto et outils', D.tableoilNec >= 70 && D.fam[0] === 'Alimentation' && D.fam[1] === 'Auto et outils', JSON.stringify(D.fam));
  t.check('chips de maïs retirées de la gamme (passe 75), listées dans PROD_RETIRED pour les anciennes sauvegardes', D.noChips, '');
  t.check('zones fertiles de maïs et de colza présentes et réparties sur la carte (au moins 3 quarts chacune)', D.fields.corn > 40 && D.fields.rapeseed > 30 && Object.keys(D.quad.corn || {}).length >= 3 && Object.keys(D.quad.rapeseed || {}).length >= 3, JSON.stringify(D.fields) + ' ' + JSON.stringify(D.quad));
  t.check('aucun nom en double (marchandises, produits, bâtiments)', D.dup.length === 0, D.dup.join(', '));
  t.info(`types ${D.counts[0]} · biens ${D.counts[1]} · recettes ${D.counts[2]} · produits ${D.counts[3]}`);

  // 2. Sprites HD : branchés dans le build et calés sur 3×3 comme les autres cultures (passe 85)
  { const tpl = fs.readFileSync(path.join(root, 'game.template.html'), 'utf8'), html = fs.readFileSync(path.join(root, 'city.html'), 'utf8'), bld = fs.readFileSync(path.join(root, 'tools', 'build.py'), 'utf8');
    t.check('méga-classe de marque (MEGA_OF) et technologies (PROD_TECH) : huile de table en alimentation, biocarburant en auto', /tableoil: 'food', biofuel: 'auto'/.test(tpl) && /tableoil: 8 \}/.test(tpl) && /biofuel: 10 \}, \['handtools', 'lube', 'biofuel'\]/.test(tpl), '');
    const dim = k => { const m = html.match(new RegExp('"' + k + '": \\[([0-9., ]+)\\]')); return m ? m[1].split(',').map(Number) : null; };
    const dw = dim('fwheat'), dc = dim('fcorn'), dr = dim('frapeseed');
    t.check('sprites HD : fcorn et frapeseed dans P2_TYPE et dans le build (P2_NAMES)', /P2_TYPE = \{[^}]*fcorn: 'fcorn'[^}]*frapeseed: 'frapeseed'/.test(tpl) && /'fcorn', 'frapeseed'/.test(bld), '');
    const hasHD = /"fcorn": "data:image\/(png|webp)/.test(html) && /"frapeseed": "data:image\/(png|webp)/.test(html);   // passe 81 : les sprites HD sont encodés en WebP quand c'est plus léger
    if (fs.existsSync(path.join(root, '..', 'assets', 'factory_hd', 'fcorn.png')) || hasHD)
      t.check('sprites HD embarqués, losange de même largeur que la ferme de blé (3 cases)', hasHD && dw && dc && dr && [dw, dc, dr].every(d => (d[7] - d[6]) / d[0] > 0.97)   /* le losange remplit la largeur de l'image : le jeu le cale sur 2 cases quelle que soit la résolution (le nouveau champ de blé de Cowork est en 768 px, maïs et colza en 512) */, JSON.stringify({ dw, dc, dr }));
    else t.info('assets/factory_hd absents : repli vectoriel (pas de sprite HD à vérifier)'); }

  // 3. Chaque culture se construit en campagne et produit
  for (const k of Object.keys(CROPS2)) {
    const p = await L.newPage({ wait: 500 }); await L.setup(p, { cash: 5e10, noAid: true }); await L.inject(p);
    const r = await p.evaluate(({ k, g }) => {
      const W = window.WSE, S = W.S, T = window.T, N = W.N, o = {}; S.noEv = true;
      let c = null; for (let i = 0; i < N * N && !c; i++) { const d = S.dep[i]; if (!d || d.k !== g) continue; const x = i % N, y = (i / N) | 0; if (!W.footprintError(x, y, k) && W.place(x, y, k)) { c = S.grid[i]; try { W.autoConnect(x, y); } catch (e) { } } }
      o.placed = !!c; if (!c) return o; o.wh = [c.w, c.h];
      const s0 = S.stock[g] || 0; let made = 0; for (let d = 0; d < 30; d++) { T.frz(); W.step(); made += c.out || 0; }
      o.made = made; o.stockUp = (S.stock[g] || 0) > s0 || (S.locSold && S.locSold[g] > 0); o.bad = T.scan(); return o;
    }, { k, g: CROPS2[k] });
    t.check(`${k} : posé sur une zone fertile (3×3, passe 85), produit du ${CROPS2[k]} en 30 jours`, r.placed && r.wh[0] === 3 && r.wh[1] === 3 && r.made > 100 && r.stockUp, JSON.stringify({ placed: r.placed, wh: r.wh, made: r.made && Math.round(r.made) }));
    t.check(`${k} : 0 pageerror, aucun NaN`, p.errs.length === 0 && r.bad.length === 0, p.errs.concat(r.bad || []).slice(0, 2).join(';'));
    await p.context().close();
  }

  // 4. Rentabilité : retour sur capex comparable aux autres cultures, sans dégrader les fermes existantes
  { const ex = await L.pool([['fcorn', 'corn'], ['frapeseed', 'rapeseed'], ['fwheat', 'wheat']], 3, e => L.isoExtractor(e[0], e[1]));
    ex.forEach(x => { if (x.none) return t.check(`${x.key} : zone fertile disponible`, false);
      if (x.key === 'fwheat') return t.check('ferme de blé (36 cases, passe 87) : EBITDA 15-45 % et retour <= 6 ans', x.eb * 100 >= 15 && x.eb * 100 <= 45 && x.payback <= 6, `EBITDA ${(x.eb * 100).toFixed(1)} %, retour ${x.payback.toFixed(1)} an`);
      t.check(`${x.key} : EBITDA 15-45 % et retour sur capex 0,5 à 6 ans (ferme de 36 cases, passe 87)`, x.eb * 100 >= 15 && x.eb * 100 <= 45 && x.payback >= 0.5 && x.payback <= 6, `EBITDA ${(x.eb * 100).toFixed(1)} %, retour ${x.payback.toFixed(2)} an`); });
    const fx = await L.pool(['cookoil', 'biodiesel', 'tableoil', 'biofuel'], 3, k => L.isoFactory(k));
    fx.forEach(a => t.check(`usine ${a.key} : EBITDA 10-25 % (marge plausible)`, a.eb * 100 >= 10 && a.eb * 100 <= 25 && a.errs.length === 0, `EBITDA ${(a.eb * 100).toFixed(1)} %, MB ${(a.gm * 100).toFixed(0)} %`)); }

  // 5. Chaînes de bout en bout : « Fabriquer » construit cultures et usines, le produit fini sort et se vend en magasin
  const CH = [['tableoil', ['fcorn', 'frapeseed']], ['biofuel', ['frapeseed']]];
  for (const [pk, farms] of CH) {
    const p2 = await L.newPage({ wait: 600 }); await L.setup(p2, { cash: 5e10 }); await L.inject(p2);
    const r = await p2.evaluate(({ pk, farms }) => {
      const W = window.WSE, S = W.S, T = window.T, N = W.N, o = {}; T.inP('port');
      const P = W.producePlan(pk); o.plan = { complete: P.complete, total: P.total, rows: P.rows.map(x => x.label) };
      const tr = W.chainTree(pk); o.tree = tr ? tr.list.filter(n => !n.root).map(n => n.k) : [];
      o.ok = W.quickProduce(pk, { raws: true });
      const leaves = W.chainLeaves(pk); o.noSrc = leaves.filter(g => !W.sourceInfo(g).n);
      o.farms = farms.map(f => { let n = 0; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === f && c.x + c.y * N === i) n++; } return n; });
      for (let i = 0; i < 4; i++) T.inC('res'); if (!T.bldgs().some(c => c.t === 's2' || c.t === 's1')) T.inC('s2');
      let sold = 0, rev = 0; for (let d = 0; d < 180; d++) { T.frz(); W.step(); sold += S.prod[pk].sold || 0; rev += S.prod[pk].rev || 0; }
      o.made = S.prod[pk].made || 0; o.sold = sold; o.rev = rev; o.st = S.prod[pk].st; o.bad = T.scan(); return o;
    }, { pk, farms });
    t.check(`« Fabriquer » ${pk} : plan chiffré jusqu'aux cultures, ${farms.join(' + ')} construites, toutes les feuilles ont une source`, r.plan.complete && r.plan.total > 0 && r.ok && r.noSrc.length === 0 && r.farms.every(n => n >= 1), `${r.plan.rows.length} lignes · fermes ${r.farms.join(',')} · sans source ${r.noSrc.join(',')}`);
    t.check(`${pk} : chaîne visible dans l'arbre (${FIN[pk].join(', ')})`, FIN[pk].every(g => r.tree.includes(g)) && farms.every(f => r.tree.includes(f === 'fcorn' ? 'corn' : 'rapeseed')), r.tree.join(','));
    t.check(`${pk} : produit en 180 jours et vendu en magasin`, r.made > 0 && r.sold > 0 && r.rev > 0 && r.bad.length === 0, `fabriqué ${Math.round(r.made)} · vendu ${Math.round(r.sold)} · CA ${Math.round(r.rev)} $ · ${r.bad.slice(0, 2).join(';')}`);
    t.check(`${pk} : 0 pageerror`, p2.errs.length === 0, p2.errs.slice(0, 2).join(';'));
    await p2.context().close();
  }

  // 6. Guide de l'agriculteur : maïs et colza jouables ; guide du fabricant sur l'huile de table
  { const r = await pg.evaluate(async () => {
      const W = window.WSE, src = document.documentElement.innerHTML; W.openGuide('tableoil'); await new Promise(x => setTimeout(x, 200));
      const g = document.getElementById('gview'), o = { txt: g.innerText, cards: g.querySelectorAll('.gcard').length }; return o; });
    t.check('guide du fabricant : huile de table avec sa carte d\'intrant (huile de cuisine)', /Huile de table/.test(r.txt) && /Huile de cuisine/.test(r.txt) && r.cards >= 2, `${r.cards} cartes`);
    const tpl = fs.readFileSync(path.join(root, 'game.template.html'), 'utf8');
    t.check('guide de l\'agriculteur : maïs et colza reliés à leur culture (plus « à venir »)', /\['corn', 'Maïs', \d+, \d+, 'corn'\]/.test(tpl) && /\['rapeseed', 'Colza', \d+, \d+, 'rapeseed'\]/.test(tpl), ''); }

  // 7. Sauvegarde antérieure : chargée, anciennes cases inchangées, zones de maïs et de colza ajoutées sur des cases libres
  { const save = fs.readFileSync(path.join(__dirname, 'fixtures', 'save_v8_avant_passe33.json'), 'utf8'), old = JSON.parse(save);
    const oldDep = {}; old.dep.forEach(a => { oldDep[a[0]] = a[1]; });
    const b = await L.browser(), ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('wse_fx')) { localStorage.setItem('wse-city-v8', s); sessionStorage.setItem('wse_fx', '1'); } } catch (e) { } }, save);
    const p5 = await L.newPage({ ctx, wait: 1200 }); await L.inject(p5);
    const r = await p5.evaluate(({ oldDep }) => {
      const W = window.WSE, S = W.S, N = W.N, T = window.T, o = { day: S.day, nb: T.bldgs().length, moved: 0, f: {}, onBld: 0 };
      // passe 79 : les gisements de sable sont fusionnés en granulats (sand → gravel, migration voulue) ; toute autre case doit être inchangée
      o.sand = 0; Object.keys(oldDep).forEach(i => { const d = S.dep[i], k0 = oldDep[i] === 'sand' ? 'gravel' : oldDep[i]; if (oldDep[i] === 'sand' && d && d.k === 'gravel') o.sand++; if (!d || d.k !== k0) o.moved++; });
      S.dep.forEach((d, i) => { if (d && (d.k === 'corn' || d.k === 'rapeseed')) { o.f[d.k] = (o.f[d.k] || 0) + 1; const c = S.grid[i]; if (c && c.t !== 'road') o.onBld++; } });
      o.stock = [S.stock.corn, S.stock.cookoil, S.prod.tableoil && S.prod.tableoil.st];
      const d0 = S.day; T.stepN(30, true); o.adv = S.day - d0; o.bad = T.scan(); W.save(); const sv = JSON.parse(localStorage.getItem('wse-city-v8')); o.v = sv.v; o.savedCorn = sv.dep.filter(a => a[1] === 'corn').length; return o; }, { oldDep });
    t.check('ancienne sauvegarde : même jour, bâtiments conservés, anciennes cases de gisement inchangées', r.day === old.day && r.nb >= 10 && r.moved === 0 && r.sand === old.dep.filter(a => a[1] === 'sand').length, `jour ${r.day}/${old.day} · ${r.nb} bâtiments · ${r.moved} cases modifiées · ${r.sand} sable → granulats`);
    t.check('ancienne sauvegarde : zones de maïs et de colza ajoutées sur des cases libres, stocks à zéro, nouveaux produits verrouillés ou disponibles', r.f.corn > 20 && r.f.rapeseed > 20 && r.onBld === 0 && r.stock[0] === 0 && r.stock[1] === 0 && !!r.stock[2], JSON.stringify(r.f) + ' ' + JSON.stringify(r.stock));
    t.check('ancienne sauvegarde : 30 jours sans NaN, réenregistrée en v8 avec ses champs de maïs, 0 pageerror', r.adv === 30 && r.bad.length === 0 && r.v === 8 && r.savedCorn > 20 && p5.errs.length === 0, `${r.bad.slice(0, 2).join(';')} · ${p5.errs.slice(0, 2).join(';')}`);
    await ctx.close(); }

  // 8. Déterminisme : deux parties identiques avec les deux cultures et l'huile donnent le même état
  { const run = async () => { const p = await L.newPage({ wait: 500 }); await L.setup(p, { cash: 5e10 }); await L.inject(p);
      const s = await p.evaluate(() => { const W = window.WSE, S = W.S, T = window.T; S.noEv = true; T.inP('port'); W.quickProduce('tableoil', { raws: true }); T.stepN(200, true);
        return JSON.stringify([S.stock.corn, S.stock.rapeseed, S.stock.cookoil, S.prod.tableoil.made, Math.round(S.cash), S.dep.filter(d => d && d.k === 'corn').length]); });
      await p.context().close(); return s; };
    const a = await run(), b = await run();
    t.check('déterminisme : deux parties (huile de table, 200 jours) identiques', a === b && a.indexOf('null') < 0, a === b ? a.slice(0, 90) : a.slice(0, 60) + ' <> ' + b.slice(0, 60)); }

  t.check('page principale : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(';'));
  await pg.context().close();
};
