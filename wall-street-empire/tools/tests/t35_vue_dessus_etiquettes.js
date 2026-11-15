// Vue Dessus : étiquettes sans chevauchement (bannières de zone, cartes de KPI, pastilles d'ouvriers, pastilles d'alerte et d'intrants).
exports.name = 'Vue Dessus : étiquettes sans chevauchement';
const SETUP = `(() => {
  const W = window.WSE, S = W.S, N = W.N; const m = S.macro; m.boom = 0; m.phase = Math.PI; m.gdp = 0.03; m.infl = 0.02; m.rate = 0.04;
  const put = (k, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } };
  const f = put('f2', 66, 84, 54, 84); put('port', 66, 84, 54, 84); for (let i = 0; i < 40; i++) put('res', 14, 44, 14, 44); put('s2', 14, 44, 14, 44);
  W.assignRecipe('steel', 2); f.src = { iron: 'local', coal: 'local' }; f.wage = 2;
  const pre = () => { S.macro.phase = Math.PI; S.macro.boom = 0; S.cash = Math.max(S.cash, 5e9); ['iron', 'coal'].forEach(g => { S.stock[g] = 1e9; S.price[g] = W.GOODS[g].base * (S.cpi || 1); }); };
  window.B = { W, S, f, pre };
  for (let i = 0; i < 25; i++) { pre(); W.step(); }
})()`;
exports.run = async (t, L) => {
  const pg = await L.newPage({ w: 1400, h: 900, wait: 400 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP);
  const r = await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(x => setTimeout(x, 1100)); for (let i = 0; i < 4; i++) W.sceneFrame(0.03);
    const sc = W.scene, A = (sc && sc.ovAvoid) || [], ov = (a, b) => a[0] < b[2] - 2 && a[2] > b[0] + 2 && a[1] < b[3] - 2 && a[3] > b[1] + 2; let n = 0, pairs = [];
    for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) if (ov(A[i], A[j])) { n++; pairs.push([A[i].map(Math.round), A[j].map(Math.round)]); }
    const cards = (sc.cardRects || []).length, vw = sc.ovW, vh = sc.ovH, area = (sc.cardRects || []).reduce((s, q) => s + Math.max(0, q[2] - q[0]) * Math.max(0, q[3] - q[1]), 0);
    return { top: !!sc.top, n, nRect: A.length, pairs: pairs.slice(0, 3), cards, cover: area / (vw * vh) }; });
  t.check('la vue Dessus enregistre les rectangles d\'étiquettes (cartes, bannières, pastilles d\'ouvriers)', r.top && r.nRect >= 6, JSON.stringify({ top: r.top, nRect: r.nRect }));
  t.check('aucune paire d\'étiquettes ne se recouvre (marge de 2 px)', r.n === 0, JSON.stringify(r.pairs));
  t.check('les cartes de KPI ne couvrent pas plus d\'un quart de la scène', r.cover <= 0.25, (r.cover * 100).toFixed(1) + ' %');
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
