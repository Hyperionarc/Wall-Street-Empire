// Références mortes après la suppression des usines génériques : TYPES.fN.rec, tutoriel, missions, contrats, README, libellés « générique ».
const fs = require('fs'), path = require('path');
exports.name = 'Références mortes (usines génériques)';
exports.run = async (t, L) => {
  const root = path.resolve(__dirname, '..', '..');
  const src = fs.readFileSync(path.join(root, 'game.template.html'), 'utf8').split('\n');
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8').split('\n');

  // 1. Libellés « générique » dans le code (hors boîte isométrique et type de scène 'generic') et le README (hors récits historiques des passes 8 et 13)
  const badSrc = src.map((l, i) => [i + 1, l]).filter(([, l]) => /g[ée]n[ée]rique/i.test(l) && !/bo[iî]te isom[ée]trique/.test(l)).map(([n, l]) => `l.${n}: ${l.trim().slice(0, 70)}`);
  t.check('game.template.html : aucun libellé ni commentaire « générique » obsolète', badSrc.length === 0, badSrc.slice(0, 3).join(' | '));
  let sec = '', badRd = [];
  readme.forEach((l, i) => { if (/^## /.test(l)) sec = l; if (/g[ée]n[ée]rique/i.test(l) && !/Passe (8|13)\b|Tests et passe 19/.test(sec) && !/passe 13/i.test(l)) badRd.push(`l.${i + 1}: ${l.trim().slice(0, 70)}`); });
  t.check('README : aucune description actuelle d\'une production « générique » (hors récits des passes 8 et 13)', badRd.length === 0, badRd.slice(0, 3).join(' | '));

  // 2. Verrous de scénario, outils du tutoriel, besoins des contrats : clés existantes
  const text = src.join('\n');
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 5e9 });
  const D = await pg.evaluate(() => { const W = window.WSE; return { types: Object.keys(W.TYPES), goods: Object.keys(W.GOODS), prods: Object.keys(W.PRODUCTS), recs: Object.keys(W.RECIPES), scn: JSON.stringify(Object.keys(W.SCN).map(k => [W.SCN[k].n, W.SCN[k].d, (W.SCN[k].ms || []).map(m => m.t), (W.SCN[k].tuto || []).map(m => m.t)])) }; });
  const lockKeys = []; (text.match(/const L[1-4] = [^;]*;/g) || []).forEach(d => (d.match(/'(\w+)'/g) || []).forEach(k => lockKeys.push(k.replace(/'/g, ''))));
  const miss1 = [...new Set(lockKeys)].filter(k => !D.types.includes(k));
  t.check(`verrous de scénario (${new Set(lockKeys).size} clés) : tous les types existent`, lockKeys.length > 20 && miss1.length === 0, miss1.join(', '));
  const toolKeys = [...new Set((text.match(/tool: '(\w+)'/g) || []).map(x => x.slice(7, -1)))], miss2 = toolKeys.filter(k => !D.types.includes(k));
  t.check(`tutoriel (${toolKeys.length} outils) : tous les types existent`, miss2.length === 0, miss2.join(', '));
  const ctBlock = (text.match(/const CONTRACT_TYPES = \[[\s\S]*?\n\];/) || [''])[0], needKeys = [...new Set((ctBlock.match(/need: \{([^}]*)\}/g) || []).flatMap(m => (m.match(/(\w+):/g) || []).map(x => x.slice(0, -1)).filter(x => x !== 'need')))];
  const miss3 = needKeys.filter(k => !D.goods.includes(k));
  t.check(`contrats (${needKeys.length} biens demandés) : tous existent et ne sont pas des marchandises génériques`, needKeys.length > 0 && miss3.length === 0 && !needKeys.some(k => ['basic', 'std', 'lux'].includes(k)), miss3.join(', '));
  const sc = D.scn; t.check('scénarios, objectifs et tutoriel : aucun libellé « générique »', !/g[ée]n[ée]rique/i.test(sc), '');

  // 3. Données : intrants des recettes / produits, rayons, sorties de TYPES.fN.rec
  const bad = [];
  const D2 = await pg.evaluate(() => { const W = window.WSE, o = { rin: [], pin: [], sells: [], rec: [], lvl: [] }; Object.keys(W.RECIPES).forEach(k => Object.keys(W.RECIPES[k].in).forEach(g => { if (!W.GOODS[g]) o.rin.push(k + ':' + g); if (!W.GOODS[k]) o.rin.push('sans bien ' + k); }));
    Object.keys(W.PRODUCTS).forEach(k => { Object.keys(W.PRODUCTS[k].in).forEach(g => { if (!W.GOODS[g]) o.pin.push(k + ':' + g); }); if (!['f1', 'f2', 'f3', 'f4'][W.PRODUCTS[k].lvl - 1] || !W.TYPES[['f1', 'f2', 'f3', 'f4'][W.PRODUCTS[k].lvl - 1]]) o.lvl.push(k); });
    Object.keys(W.TYPES).forEach(k => { const T = W.TYPES[k]; if (T.ret) T.ret.sells.forEach(g => { if (g !== 'estate' && !W.GOODS[g]) o.sells.push(k + ':' + g); }); if (T.rec) { Object.keys(T.rec.in).concat(Object.keys(T.rec.out)).forEach(g => { if (!W.GOODS[g]) o.rec.push(k + ':' + g); }); } });
    o.fRec = ['f1', 'f2', 'f3', 'f4'].map(k => k + ':' + Object.keys(W.TYPES[k].rec.out).join('+')); return o; });
  t.check('recettes et produits : tous les intrants et sorties existent dans GOODS', D2.rin.length + D2.pin.length + D2.lvl.length === 0, D2.rin.concat(D2.pin, D2.lvl).slice(0, 4).join(', '));
  t.check('rayons et TYPES.fN.rec (référence d\'emplacement et de calibrage) : biens existants', D2.sells.length + D2.rec.length === 0, D2.sells.concat(D2.rec).slice(0, 4).join(', '));
  // TYPES.fN.rec ne doit servir qu'à l'emplacement : une usine vide ne produit rien (voir aussi « Intégrité ») et ne s'affiche pas comme productrice
  const E = await pg.evaluate(() => { const W = window.WSE, S = W.S, T = window.T || null; const N = W.N, out = {}; ['f1', 'f2', 'f3', 'f4'].forEach(k => { let c = null; for (let y = 54; y < 84 && !c; y++) for (let x = 66; x < 84 && !c; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) { } c = S.grid[y * N + x]; } if (c) { for (let i = 0; i < 6; i++) W.step(); W.openBuilding(c.x, c.y); out[k] = document.getElementById('bview').innerText; } }); return out; });
  const badE = Object.keys(E).filter(k => /g[ée]n[ée]rique|Biens de base|Produits de luxe/i.test(E[k]) || !/Aucun produit|usine vide|Choisi/i.test(E[k]));
  t.check(`fiche d'usine vide (${Object.keys(E).join(', ')}) : « Aucun produit » affiché, ni « générique » ni bien de rayon fabriqué`, Object.keys(E).length === 4 && badE.length === 0, badE.map(k => k + ': ' + E[k].slice(0, 80).replace(/\n/g, ' ')).join(' | '));
  // Seul calibrage : le prix de base des biens de rayon vient de TYPES.fN.rec (pas d'usine joueur)
  t.info('TYPES.fN.rec.out (calibrage des marchandises de rayon) : ' + D2.fRec.join(', '));
  t.check('0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();
};
