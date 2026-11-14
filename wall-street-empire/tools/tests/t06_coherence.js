// Cohérence inter-écrans : une partie de 300 jours jouée par un bot, puis comparaison des mêmes grandeurs affichées à plusieurs endroits (écart toléré 1 %).
const A = require('./audit_lib.js');
exports.name = 'Cohérence inter-écrans';

// Toutes les valeurs numériques (avec « $ » ou non) qui suivent un libellé (insensible à la casse), sur la même ligne ou la suivante.
function vals(text, label, opt = {}) {
  const lines = text.split('\n').map(l => l.trim()), out = []; const re = label instanceof RegExp ? label : new RegExp('^' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  for (let i = 0; i < lines.length; i++) {
    if (!re.test(lines[i])) continue; let tail = lines[i].replace(re, '');
    let m = tail.match(/([+−-]?\s?\d[\d\s  ]*(?:,\d+)?)/); if (!m && !opt.sameLine) { for (let k = i + 1; k < Math.min(lines.length, i + 3) && !m; k++) m = lines[k].match(/^([+−-]?\s?\d[\d\s  ]*(?:,\d+)?)/); }
    if (m) { const s = m[1].replace(/[\s  ]/g, '').replace('−', '-').replace(',', '.'); out.push(parseFloat(s)); }
  }
  return out;
}
const toN = s => parseFloat(String(s).replace(/[\s\u202f\u00a0]/g, '').replace(',', '.').replace('−', '-'));
const MONEY_TOL = 0.01;
function agree(vs) { const ref = vs[0].v; return vs.every(x => Number.isFinite(x.v) && Math.abs(x.v - ref) <= Math.max(2, Math.abs(ref) * MONEY_TOL)); }
const show = vs => vs.map(x => `${x.s}=${Number.isFinite(x.v) ? Math.round(x.v * 100) / 100 : 'absent'}`).join(' | ');

exports.run = async (t, L) => {
  const pg = await A.playEmpire(300, { w: 1400 });
  await pg.evaluate(() => { for (let i = 0; i < 3; i++) window.WSE.step(); });   // le dernier jour simulé est celui affiché
  const C = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, DM = 30; const cs = []; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.x + c.y * N === i && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part' && c.t !== 'pylon' && c.t !== 'cable' && c.t !== 'pipeline') cs.push(c); }
    const a = S.m30, k = 30 / a.length, mo = { ca: a.reduce((s, r) => s + r[0], 0) * k, ebe: a.reduce((s, r) => s + r[1], 0) * k, net: a.reduce((s, r) => s + (r[2] || 0), 0) * k };
    const F = S.fin; const sold = {}; cs.forEach(c => { if (c.sales) Object.keys(c.sales).forEach(g => { sold[g] = (sold[g] || 0) + (c.sales[g] || 0); }); });
    let jobs = 0, wages = 0; cs.forEach(c => { wages += c.wages || 0; jobs += (W.TYPES[c.t].jobs || 0) * 0; });
    return { cash: S.cash, pop: S.pop, mo, F: Object.assign({}, F), wagesB: wages * DM, stock: S.stock, price: S.price, prod: Object.fromEntries(Object.entries(S.prod).filter(([, p]) => p.st === 'on').map(([k, p]) => [k, { qm: p.qm, rm: p.rm, sold: p.sold, stock: p.stock }])), soldSum: sold, nb: cs.length, hud: { cash: document.getElementById('vCash').innerText, net: document.getElementById('vNet').innerText, pop: document.getElementById('vPop').innerText, jobs: document.getElementById('vJobs').innerText } };
  });
  const E = await A.tabText(pg, 'empire'), Fi = await A.tabText(pg, 'fin'), Mk = await A.tabText(pg, 'market'), Pr = await A.tabText(pg, 'prods');
  const strip = await pg.evaluate(() => ({ cash: document.getElementById('psCash').innerText, net: document.getElementById('psNet').innerText }));
  const pn = s => { const m = String(s).match(/[+−-]?\s?\d[\d\s  ]*(?:,\d+)?/); return m ? parseFloat(m[0].replace(/[\s  ]/g, '').replace('−', '-').replace(',', '.')) : NaN; };
  const DM = 30, F = C.F, rep = (name, vs, note) => t.check(`${name} : écart <= 1 % entre écrans`, agree(vs), show(vs) + (note ? ' ; ' + note : ''));
  const hudNet = pn(C.hud.net.split('/mois')[0]), hudCA = (() => { const m = C.hud.net.match(/CA\s*([\d\s  ]+)/); return m ? parseFloat(m[1].replace(/[\s  ]/g, '')) : NaN; })();

  // 1. Trésorerie
  rep('trésorerie', [{ s: 'état', v: C.cash }, { s: 'HUD', v: pn(C.hud.cash) }, { s: 'bureau (bandeau)', v: pn(strip.cash) }, ...vals(E, 'Trésorerie', { sameLine: false }).slice(0, 2).map((v, i) => ({ s: 'Empire#' + (i + 1), v }))]);
  // 2. Résultat net mensuel : HUD / bandeau / Empire (2 endroits) / Finances / réconciliation / compte de résultat
  rep('résultat net mensuel', [{ s: 'HUD', v: hudNet }, { s: 'bandeau', v: pn(strip.net) }, ...vals(E, /^Résultat net \/ mois/i).map((v, i) => ({ s: 'Empire#' + (i + 1), v })), ...vals(Fi, /^Résultat net \/ mois/i).map(v => ({ s: 'Finances', v })), ...vals(Fi, /^= Résultat net/).map(v => ({ s: 'réconciliation', v })), ...vals(E, /^Résultat net\t|^Résultat net$/).map(v => ({ s: 'compte de résultat', v }))]);
  // 3. Chiffre d'affaires mensuel
  const caFin = vals(Fi, 'Ventes au détail', { sameLine: false })[0] + vals(Fi, 'Exports', { sameLine: false })[0] + vals(Fi, 'Tech, banques, filiales', { sameLine: false })[0];
  rep('chiffre d\'affaires mensuel', [{ s: 'HUD', v: hudCA }, ...vals(E, /^Chiffre d'affaires \/ mois/i).map(v => ({ s: 'Empire mensuel', v })), ...vals(E, /^Chiffre d'affaires \(détail/i).map(v => ({ s: 'Empire compte de résultat', v })), { s: 'Finances (Σ lignes)', v: caFin }, ...vals(Fi, /^Total encaissé/).map(v => ({ s: 'réconciliation', v }))]);
  // 4. EBE mensuel : Empire vs EBE recalculé depuis les lignes du compte de résultat de Finances
  const g = l => vals(Fi, l, { sameLine: false })[0] || 0;
  const ebeFin = caFin + g('Salaires') + g('Coûts d\'exploitation') + g('Transport') + g('Publicité') + g('Importations (port)');
  rep('EBE mensuel', [{ s: 'Empire', v: vals(E, /^EBE \/ mois/i)[0] }, { s: 'Finances (recalculé)', v: ebeFin }, { s: 'HUD/m30', v: C.mo.ebe }]);
  // 5. Salaires totaux : Finances vs Empire vs somme des fiches de bâtiments
  const salE = vals(E, /^Salaires, coûts d'exploitation, transport/i)[0];
  rep('salaires + exploitation + transport', [{ s: 'Finances', v: -(g('Salaires') + g('Coûts d\'exploitation') + g('Transport')) }, { s: 'Empire', v: -salE }]);
  rep('salaires totaux', [{ s: 'Finances', v: -g('Salaires') }, { s: 'Σ fiches bâtiments', v: C.wagesB }]);
  // 6. Ventes d'un produit : écran Produits (« Vendu : n u/mois ») vs état vs somme des ventes des magasins x 30
  const prodNames = { utensils: 'Ustensiles de cuisine', bread: 'Pain' };
  for (const pk of Object.keys(prodNames)) {
    const idx = Pr.indexOf(prodNames[pk]); const seg = idx >= 0 ? Pr.slice(idx, idx + 900) : ''; const m = seg.match(/Vendu :\s*([\d\s  ]+)\s*u\/mois/); const shown = m ? parseFloat(m[1].replace(/[\s  ]/g, '')) : NaN;
    const p = C.prod[pk]; if (!p) continue;
    rep(`ventes ${pk} (u/mois)`, [{ s: 'écran Produits', v: shown }, { s: 'état (qm)', v: p.qm }, { s: 'Σ magasins x 30', v: (C.soldSum[pk] || C.soldSum['p_' + pk] || 0) * DM }], 'qm = moyenne glissante exponentielle ; Σ magasins = ventes du dernier jour x 30');
  }
  // 7. Stocks : état vs Empire (Production et stocks) vs Bourse
  const gl = { oil: 'Pétrole', iron: 'Minerai de fer', coal: 'Charbon', sand: 'Sable', wheat: 'Blé', sugar: 'Canne à sucre', cotton: 'Coton', steel: 'Acier', plastic: 'Plastique' };
  const stockBad = [], priceBad = [];
  for (const k of Object.keys(gl)) {
    const nm = gl[k]; const mE = E.match(new RegExp(nm + '\\t([\\d.,]+)\\t([\\d.,]+)\\t([\\d\\s\\u202f\\u00a0]+)\\t([\\d\\s\\u202f\\u00a0,]+)\\s*\\$')); const iM = Mk.indexOf('\n' + nm + '\n'); const segM = iM >= 0 ? Mk.slice(iM, iM + 160) : '';
    const sM = segM.match(/stock\s*([\d\s  ]+)/), pM = segM.match(/([\d\s  ]+(?:,\d+)?)\s*\$/);
    const st = C.stock[k], pr = C.price[k]; const sE = mE ? parseFloat(mE[3].replace(/[\s  ]/g, '')) : NaN, pE = mE ? parseFloat(mE[4].replace(/[\s  ]/g, '').replace(',', '.')) : NaN;
    const sMv = sM ? parseFloat(sM[1].replace(/[\s  ]/g, '')) : NaN, pMv = pM ? parseFloat(pM[1].replace(/[\s  ]/g, '').replace(',', '.')) : NaN;
    const okS = [sE, sMv].every(v => Number.isFinite(v) && Math.abs(v - st) <= Math.max(1, Math.abs(st) * 0.01)), okP = [pE, pMv].every(v => Number.isFinite(v) && Math.abs(v - pr) <= Math.max(0.06, pr * 0.01));
    if (!okS) stockBad.push(`${k}: état ${Math.round(st)} Empire ${sE} Bourse ${sMv}`); if (!okP) priceBad.push(`${k}: état ${pr.toFixed(2)} Empire ${pE} Bourse ${pMv}`);
  }
  t.check('stocks de biens : écart <= 1 % entre état, Empire et Bourse', stockBad.length === 0, stockBad.slice(0, 4).join(' | '));
  t.check('prix des biens : écart <= 1 % entre état, Empire et Bourse', priceBad.length === 0, priceBad.slice(0, 4).join(' | '));
  // 7b. Production quotidienne par bien (Empire, « Produit/j ») vs somme des extracteurs du joueur (pas d'offre PNJ comptée)
  const ext = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, o = {}; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.x + c.y * N === i && W.TYPES[c.t] && W.TYPES[c.t].ext) { const g = W.TYPES[c.t].ext; o[g] = (o[g] || 0) + (c.out || 0); } } return o; });
  const prodBad = [];
  for (const k of Object.keys(gl)) { if (!(k in ext)) continue; const mE = E.match(new RegExp(gl[k] + '\\t([\\d.,\\s\\u202f\\u00a0]+?)\\t')); const sh = mE ? toN(mE[1]) : NaN; if (!(Math.abs(sh - ext[k]) <= Math.max(1, ext[k] * 0.01))) prodBad.push(`${k}: Empire ${sh} / Σ extracteurs ${ext[k].toFixed(1)}`); }
  t.check('Empire « Produit/j » = production des extracteurs du joueur (hors offre PNJ)', prodBad.length === 0, prodBad.slice(0, 4).join(' | '));
  // 8. Population
  rep('population', [{ s: 'état', v: C.pop }, { s: 'HUD', v: pn(C.hud.pop) }, ...vals(E, /^Habitants/i).slice(0, 1).map(v => ({ s: 'Empire', v })), ...(() => { const m = Mk.match(/([\d\s  ]+)\s*habitants ×/); return m ? [{ s: 'Bourse', v: parseFloat(m[1].replace(/[\s  ]/g, '')) }] : []; })()]);
  // 9. Fiche produit d'un magasin vs écran Produits (mêmes définitions : prix, moyenne, marque, qualité, note globale)
  const fiche = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 's2' && c.x + c.y * N === i && c.conn) { W.openBuilding(c.x, c.y); return document.getElementById('bview').innerText; } } return ''; });
  const fm = fiche.match(/\n([^\n]+?) · ([\d,]+) \$\nfiche produit([\s\S]*?)Voir les parts de marché/);
  if (!fm) t.check('fiche produit de magasin trouvée', false, 'bloc « fiche produit » absent');
  else {
    const pname = fm[1], blk = fm[3], pi = Pr.toLowerCase().indexOf(pname.toLowerCase()), seg = pi >= 0 ? Pr.slice(pi, pi + 900) : '';
    const rowF = l => { const m = blk.match(new RegExp(l + '\\t([^\\t\\n]+)\\t([^\\t\\n]+)')); return m ? [toN(m[1]), toN(m[2])] : [NaN, NaN]; }, rowP = l => { const m = seg.match(new RegExp('\\n' + l + '\\t([^\\t\\n]+)\\t([^\\t\\n]+)')); return m ? [toN(m[1]), toN(m[2])] : [NaN, NaN]; };
    const bad = []; ['Prix en rayon', 'Qualité', 'Marque', 'Note globale'].forEach(l => { const f = rowF(l), p = rowP(l); [0, 1].forEach(j => { const tol = l === 'Prix en rayon' ? 0.6 + 0.01 * p[j] : 1.01 + 0.01 * p[j]; if (!(Math.abs(f[j] - p[j]) <= tol)) bad.push(`${l} ${j ? 'moyenne' : 'toi'}: fiche ${f[j]} / écran Produits ${p[j]}`); }); });
    t.check(`fiche produit (${pname}) vs écran Produits : prix, moyenne, marque, qualité, note globale`, bad.length === 0, bad.slice(0, 5).join(' | '));
  }
  // 10. Fiches de bâtiments : stocks et prix des intrants (« stock N · P $ ») vs état ; emplois des fiches vs Empire
  const fich = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; W.refreshStats(); const names = {}; Object.keys(W.GOODS).forEach(g => { names[W.GOODS[g].name] = g; }); const seen = {}, out = { lines: [], jobsSum: 0, nf: 0, playerJobs: S.stats.playerJobs };
    for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (!c || c.x + c.y * N !== i || c.t === 'npc' || c.t === 'road' || c.t === 'part' || c.t === 'pylon' || c.t === 'cable' || c.t === 'pipeline' || c.t === 'res') continue;
      W.openBuilding(c.x, c.y); const tx = document.getElementById('bview').innerText; const m = tx.match(/EFFECTIF\s*\n\s*([\d\s  ]+)\s*\/\s*([\d\s  ]+)/); if (m) { out.jobsSum += parseFloat(m[2].replace(/[\s  ]/g, '')); out.nf++; }
      if (!seen[c.t]) { seen[c.t] = 1; const re = /\n([^\n]+)\n[^\n]*stock\s*([\d\s  ]+)\s*·\s*([\d\s  ]+(?:,\d+)?)\s*\$/g; let mm; while ((mm = re.exec(tx))) { const g = names[mm[1].trim()]; if (g) out.lines.push([c.t, g, parseFloat(mm[2].replace(/[\s  ]/g, '')), parseFloat(mm[3].replace(/[\s  ]/g, '').replace(',', '.')), S.stock[g], S.price[g]]); } } }
    W.closeBuilding && W.closeBuilding(); return out; });
  const bl = fich.lines.filter(l => !(Math.abs(l[2] - l[4]) <= Math.max(1, l[4] * 0.01)) || !(Math.abs(l[3] - l[5]) <= Math.max(0.06, l[5] * 0.01))).map(l => `${l[0]}/${l[1]}: fiche stock ${l[2]} prix ${l[3]} ; état ${Math.round(l[4])} / ${l[5].toFixed(2)}`);
  t.check(`fiches de bâtiments (${fich.lines.length} lignes de stock/prix) : cohérentes avec l'état et la Bourse`, fich.lines.length > 0 && bl.length === 0, bl.slice(0, 4).join(' | ') || (fich.lines.length ? '' : 'aucune ligne lue'));
  // 11. Onglets Achats (cours, stock) et Logistique (stock / capacité) d'une usine vs état
  const tabs = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'f1' && c.prod && c.x + c.y * N === i) { W.openBuilding(c.x, c.y); W.bAct('tab:pu'); const pu = document.getElementById('bview').innerText; W.bAct('tab:lg'); const lg = document.getElementById('bview').innerText; const names = {}; Object.keys(W.GOODS).forEach(g => { names[W.GOODS[g].name] = g; }); return { pu, lg, names, stock: S.stock, price: S.price }; } } return null; });
  if (!tabs) t.check('onglets Achats / Logistique d\'une usine', false, 'aucune usine f1 affectée');
  else {
    const bad2 = []; let n2 = 0, mm; const rePu = /\n([^\n]+)\nbesoin [^\n]*? stock\s*([\d\s  ]+)\s*·\s*cours\s*([\d\s  ]+(?:,\d+)?)\s*\$/g;
    while ((mm = rePu.exec(tabs.pu))) { const g = tabs.names[mm[1].trim()]; if (!g) continue; n2++; if (Math.abs(toN(mm[2]) - tabs.stock[g]) > Math.max(1, tabs.stock[g] * 0.01) || Math.abs(toN(mm[3]) - tabs.price[g]) > Math.max(0.06, tabs.price[g] * 0.01)) bad2.push(`Achats ${g}: ${mm[2].trim()} / ${mm[3]} vs état ${Math.round(tabs.stock[g])} / ${tabs.price[g].toFixed(2)}`); }
    const reLg = /\n([^\n]+)\n([\d\s  ]+) \/ ([\d\s  ]+)\n/g; while ((mm = reLg.exec(tabs.lg))) { const g = tabs.names[mm[1].trim()]; if (!g) continue; n2++; if (Math.abs(toN(mm[2]) - tabs.stock[g]) > Math.max(1, tabs.stock[g] * 0.01)) bad2.push(`Logistique ${g}: ${mm[2].trim()} vs état ${Math.round(tabs.stock[g])}`); }
    t.check(`onglets Achats et Logistique d'une usine (${n2} lignes) : stock et cours cohérents avec l'état`, n2 > 0 && bad2.length === 0, bad2.slice(0, 3).join(' | ') || (n2 ? '' : 'aucune ligne lue'));
  }
  rep('emplois dans tes bâtiments', [{ s: 'Empire', v: fich.playerJobs }, { s: `Σ fiches (${fich.nf})`, v: fich.jobsSum }]);
  t.check('audit : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();
};
