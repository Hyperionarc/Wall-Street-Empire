// Urbanisme de la ville de départ (retour de Rémy : « la ville respire et se lit ») :
//  1. l'hôtel de ville est près du Mall (≤ 4 cases de son emprise), façade dégagée (rien de plus haut que 2 étages devant lui, côté avant isométrique),
//     dans un îlot déjà vivant (au moins 3 cafés, restaurants, boulangeries ou boutiques à 4 cases ou moins) ;
//  2. écoles (lycée, collège, maternelle, crèche) : jamais deux contiguës, réparties aux angles (≥ 15 cases l'une de l'autre), au fond de leur bloc (cachées par le bâti de devant) ;
//  3. équipements publics bornés (≤ 10 à 100 000 habitants, ≤ 4 écoles) ;
//  4. aucune station-service ni borne de recharge en ville : 3 + 2 stations au bord des routes d'accès, sur la campagne libre hors de la zone urbaine ;
//  5. de la place pour construire : lots libres aux abords du Mall et le long des grands axes ;
//  6. génération déterministe (hash) et sauvegarde relue avec la même disposition.
exports.name = 'Urbanisme de la ville de départ';
const START = seed => {
  const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); if (q) { q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true })); }
  W.startMode('round', { start: 'moyenne' }); const S = W.S; S.rs = seed; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
};
const SCAN = () => {
  const W = window.WSE, S = W.S, N = W.N, at = (x, y) => (x >= 0 && y >= 0 && x < N && y < N) ? S.grid[y * N + x] : null, R = W.mall.rect();
  const mons = {}; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'mon' && c.m !== 'mall' && c.m !== 'air') (mons[c.m] = mons[c.m] || []).push([c.x, c.y]); }
  const hc = mons.hall || [], hx = Math.min(...hc.map(q => q[0])), hy = Math.min(...hc.map(q => q[1])), hw = Math.max(...hc.map(q => q[0])) - hx + 1, hh = Math.max(...hc.map(q => q[1])) - hy + 1;
  const dMall = Math.max(Math.max(R.x0 - (hx + hw - 1), hx - R.x1, 0), Math.max(R.y0 - (hy + hh - 1), hy - R.y1, 0));
  const front = []; for (let k = 0; k <= hh; k++) front.push([hx + hw, hy + k]); for (let k = 0; k < hw; k++) front.push([hx + k, hy + hh]);
  const blk = front.map(q => at(q[0], q[1])).filter(c => c && c.t !== 'road' && !(c.t === 'npc' && (c.k === 'park' || (c.floors || 1) <= 2)));
  W.vv.svc(); const shops = W.vv.list().filter(q => /cafe|restaurant|boulangerie|boutique/.test(q[2]) && Math.max(Math.abs(q[0] - hx), Math.abs(q[1] - hy)) <= 4).length;
  const edu = Object.keys(mons).filter(m => /^(lycee|college|maternelle|garderie)(_\d+)?$/.test(m)), cellsOf = m => mons[m];
  let adj = 0, minD = 1e9; for (let i = 0; i < edu.length; i++) for (let j = i + 1; j < edu.length; j++) { cellsOf(edu[i]).forEach(a => cellsOf(edu[j]).forEach(b => { const d = Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])); if (d <= 1) adj++; if (d < minD) minD = d; })); }
  const back = edu.every(m => { const x0 = Math.min(...mons[m].map(q => q[0])), y0 = Math.min(...mons[m].map(q => q[1])); return x0 % 6 <= 2 && y0 % 6 <= 2; });
  const fuel = W.vv.fuel(), C0 = W.CITY0, Z = W.ZONE;
  const fuelOk = fuel.every(q => Z[q[1] * N + q[0]] === 0 && !at(q[0], q[1]) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(d => { const c = at(q[0] + d[0], q[1] + d[1]); return c && c.t === 'road'; }));
  const svcSt = W.vv.list().filter(q => /station/.test(q[2])).length;
  let freeM = 0, freeAx = 0; for (let y = C0.y0; y <= C0.y1; y++) for (let x = C0.x0; x <= C0.x1; x++) { const id = y * N + x; if (Z[id] !== 1 || at(x, y)) continue; const rd = (x - 12) % 6 === 0 || (y - 12) % 6 === 0 || (x >= R.x0 - 1 && x <= R.x1 + 1 && y >= R.y0 - 1 && y <= R.y1 + 1); if (rd) continue;
    const dm = Math.max(Math.max(R.x0 - x, x - R.x1, 0), Math.max(R.y0 - y, y - R.y1, 0)); if (dm <= 4) freeM++; else if (Math.abs(x - 30) === 1 || Math.abs(y - 30) === 1) freeAx++; }
  let sig = 0; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc') sig = (sig * 31 + i * 7 + (c.floors || 0) + (c.k.charCodeAt(0) || 0)) % 1000000007; }
  return { hall: [hx, hy, hw, hh], dMall, blk: blk.map(c => c.k + c.floors), shops, edu, adj, minD, back, nMon: Object.keys(mons).length, mons: Object.keys(mons), fuel, fuelOk, svcSt, freeM, freeAx, sig, pop: Math.round(S.pop) };
};
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 600 }); await L.inject(pg);
  const a = await pg.evaluate(([S0, F]) => { (0, eval)('(' + S0 + ')')(8101); return (0, eval)('(' + F + ')')(); }, [START.toString(), SCAN.toString()]);
  t.info(`hôtel de ville ${JSON.stringify(a.hall)} à ${a.dMall} case(s) du Mall · devant : ${a.blk.join(',') || 'dégagé'} · ${a.shops} commerces de quartier autour · écoles ${a.edu.join(', ')} (écart min ${a.minD}) · ${a.nMon} équipements · stations ${JSON.stringify(a.fuel)} · lots libres : ${a.freeM} aux abords du Mall, ${a.freeAx} le long des axes · ${a.pop} hab.`);
  t.check('hôtel de ville 2×2 à 4 cases ou moins du Mall', a.hall[2] === 2 && a.hall[3] === 2 && a.dMall <= 4, JSON.stringify(a.hall) + ' d=' + a.dMall);
  t.check('façade de l\'hôtel de ville dégagée (rien de plus de 2 étages devant, côté avant isométrique)', a.blk.length === 0, a.blk.join(','));
  t.check('hôtel de ville dans un îlot vivant (≥ 3 cafés, restaurants, boulangeries ou boutiques à 4 cases ou moins)', a.shops >= 3, a.shops);
  t.check('aucune paire d\'écoles contiguës ; écoles réparties (≥ 15 cases entre deux écoles)', a.adj === 0 && a.minD >= 15, `contiguës ${a.adj}, écart min ${a.minD}`);
  t.check('écoles au fond de leur bloc (cachées derrière le bâti, pas au premier plan)', a.back, a.edu.join(','));
  t.check('équipements publics bornés (≤ 10, dont ≤ 4 écoles)', a.nMon <= 10 && a.edu.length <= 4, a.mons.join(','));
  t.check('aucune station-service ni recharge sur un lot de la ville ; 5 stations au bord des routes d\'accès, hors de la zone urbaine', a.svcSt === 0 && a.fuel.length === 5 && a.fuelOk, JSON.stringify(a.fuel));
  t.check('de la place pour construire : ≥ 80 lots libres aux abords du Mall, ≥ 40 le long des grands axes', a.freeM >= 80 && a.freeAx >= 40, `${a.freeM} · ${a.freeAx}`);
  const b = await pg.evaluate(([S0, F]) => { (0, eval)('(' + S0 + ')')(8102); return (0, eval)('(' + F + ')')(); }, [START.toString(), SCAN.toString()]);
  t.check('génération déterministe (deux parties : même ville, même hôtel de ville, mêmes stations)', a.sig === b.sig && JSON.stringify(a.hall) === JSON.stringify(b.hall) && JSON.stringify(a.fuel) === JSON.stringify(b.fuel), `${a.sig} / ${b.sig}`);
  // sauvegarde : même disposition après rechargement
  await pg.evaluate(() => window.WSE.save()); const ctx = pg.context(); await pg.close();
  const p2 = await ctx.newPage(); p2.errs = []; p2.on('pageerror', e => p2.errs.push(e.message)); await p2.goto(L.URL); await p2.waitForTimeout(800); await L.inject(p2);
  const c = await p2.evaluate(F => { window.WSE.setSpeed(0); return (0, eval)('(' + F + ')')(); }, SCAN.toString());
  t.check('sauvegarde relue : même hôtel de ville, mêmes écoles, mêmes bâtiments ; 0 erreur', JSON.stringify(c.hall) === JSON.stringify(b.hall) && c.edu.join() === b.edu.join() && c.sig === b.sig && p2.errs.length === 0 && pg.errs.length === 0, `${c.sig} / ${b.sig} ${p2.errs.slice(0, 2).join(' ; ')}`);
  await ctx.close();
};
