// Assemblage HD de l'usine : sprites du lot 2 simulés (1 px, tous les noms de pièces) ; la vue Dessus se dessine sans erreur, avec repli vectoriel pour le reste.
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
exports.name = 'Assemblage HD : pièces du lot 2 dans la vue Dessus';
const PNG1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
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
  const root = path.resolve(__dirname, '..', '..'), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wsehd2-')), hd = path.join(tmp, 'hd'), out = path.join(tmp, 'city.html');
  fs.mkdirSync(hd);
  const names = ['convoyeur_vide_droit_sud_est', 'convoyeur_vide_droit_nord_est', 'convoyeur_vide_coin_ne', 'convoyeur_vide_coin_se', 'convoyeur_vide_coin_sw', 'convoyeur_vide_coin_nw', 'four_industriel', 'reacteur_chimique', 'bac_minerai_fer', 'bac_charbon', 'camion_blanc_face', 'camion_rouge_face', 'camion_bleu_face'];
  names.forEach(n => fs.writeFileSync(path.join(hd, n + '.png'), PNG1));
  const r = cp.spawnSync('python3', [path.join(root, 'tools', 'build.py')], { env: Object.assign({}, process.env, { WSE_HD_DIR: hd, WSE_OUT: out }), encoding: 'utf8' });
  t.check('construction avec les pièces HD du lot 2', r.status === 0 && fs.existsSync(out), (r.stderr || '').slice(-200));
  const pg = await L.newPage({ wait: 300 }); await pg.goto('file://' + out); await pg.waitForTimeout(800); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP);
  const a = await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 900)); for (let i = 0; i < 3; i++) W.sceneFrame(0.03);
    const F = W.fac; return { belt: ['convoyeur_vide_droit_sud_est', 'convoyeur_vide_coin_nw'].every(n => !!F.img(n)), top: W.scene && W.scene.top }; });
  t.check('la vue Dessus se dessine avec les pièces HD (convoyeurs, coudes, camions, matières), sans erreur de page', a.belt && a.top && pg.errs.length === 0, JSON.stringify(a) + ' ' + pg.errs.slice(0, 2).join(' | '));
  await pg.context().close(); fs.rmSync(tmp, { recursive: true, force: true });
};
