// Chariot élévateur : mission selon les besoins réels du stock ; immobile et garé sans besoin.
exports.name = 'Chariot élévateur : mission et repos';
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
  const r = await pg.evaluate(async () => { const { W, f } = window.B, S = W.S; W.openBuilding(f.x, f.y); await new Promise(x => setTimeout(x, 900)); const sc = () => W.scene, step = n => { for (let i = 0; i < n; i++) W.sceneFrame(0.1); }, rec = W.recOf ? W.recOf(f) : null, o = {};
    const outG = Object.keys(S.stock).find(g => g === 'steel') || 'steel'; Object.keys(S.stock).forEach(g => { S.stock[g] = 1e9; }); S.stock[outG] = 0;
    /* 1. aucun besoin : camions absents, stock de sortie vide, intrants pleins -> le chariot reste à son poste */
    sc().trucks = {}; step(400); const h = sc().fk; o.idle = h ? [h.x, h.y, h.ph] : null;
    /* 2. besoin d'achat : camion d'achat à quai, stock d'intrant bas -> mission quai -> stock */
    const ins = Object.keys((rec && rec.in) || { iron: 1 }); ins.forEach(g => { S.stock[g] = 0; }); sc().trucks[6] = { d: 1, st: 'dock', t: 0, fill: 1 }; step(2); const a = sc().fk; o.m1 = a.ph; const xs = [];
    for (let i = 0; i < 120; i++) { step(1); xs.push(Math.round(sc().fk.x * 10) / 10 + ',' + Math.round(sc().fk.y * 10) / 10); if (sc().fk.carry) o.carried = true; sc().trucks[6] = { d: 1, st: 'dock', t: 0, fill: 1 }; }
    o.moved = new Set(xs).size; o.maxx = Math.max(...xs.map(s => +s.split(',')[0])); o.carry = !!o.carried;
    /* 3. plus de besoin : il rentre à son poste et s'arrête */
    ins.forEach(g => { S.stock[g] = 1e9; }); sc().trucks = {}; step(200); const b = sc().fk; o.home = [Math.round(b.x * 10) / 10, Math.round(b.y * 10) / 10, b.ph, b.carry];
    return o; });
  t.check('sans besoin (pas de camion, stock plein) : le chariot reste immobile à son poste', r.idle && Math.abs(r.idle[0] - 3.9) < 0.01 && Math.abs(r.idle[1] - 14.9) < 0.01 && r.idle[2] === 'idle', JSON.stringify(r.idle));
  t.check('besoin d\'achat (camion à quai, intrant bas) : le chariot part en mission, porte une palette et se déplace', r.moved > 10 && r.carry, JSON.stringify({ m1: r.m1, moved: r.moved, carry: r.carry }));
  t.check('mission terminée : il rentre à son poste et s\'immobilise, sans palette', r.home && Math.abs(r.home[0] - 3.9) < 0.06 && Math.abs(r.home[1] - 14.9) < 0.06 && r.home[2] === 'idle' && r.home[3] === false, JSON.stringify(r.home));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
