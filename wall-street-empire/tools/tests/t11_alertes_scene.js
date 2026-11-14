// Alertes cliquables de la scène d'usine (passe 26) : intrant manquant -> pastille -> menu contextuel -> « Sources automatiques » -> la production reprend.
exports.name = 'Alertes cliquables de la scène d\'usine';

const SETUP = `(() => {
  const W = window.WSE, S = W.S, N = W.N; const m = S.macro; m.boom = 0; m.phase = Math.PI; m.gdp = 0.03; m.infl = 0.02; m.rate = 0.04;
  const put = (k, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } };
  const f = put('f2', 66, 84, 54, 84); put('port', 66, 84, 54, 84); for (let i = 0; i < 40; i++) put('res', 14, 44, 14, 44); put('s2', 14, 44, 14, 44);
  W.assignRecipe('steel', 2); f.src = { iron: 'local', coal: 'local' }; f.wage = 2;
  const fr = () => { S.macro.phase = Math.PI; S.macro.boom = 0; S.cash = Math.max(S.cash, 5e9); S.price.steel = W.GOODS.steel.base * (S.cpi || 1) * 6; };   // acier cher : acheter les intrants reste rentable
  window.B = { W, S, f, fr };
})()`;

exports.run = async (t, L) => {
  for (const vp of [{ w: 1280, h: 900, n: 'bureau' }, { w: 390, h: 844, n: 'mobile' }]) {
    const pg = await L.newPage({ w: vp.w, h: vp.h, wait: 600 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP);
    await pg.addStyleTag({ content: '#modesel,#win,#endscr{display:none!important}' });
    // 1. pénurie d'intrant : sources « ton réseau » sans aucune mine, stock à zéro
    const pen = await pg.evaluate(async () => { const { W, S, f, fr } = window.B; for (let i = 0; i < 25; i++) { fr(); S.stock.iron = 0; S.stock.coal = 0; W.step(); }
      W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 700)); const al = (W.scene.hits || []).filter(h => h.kind === 'in'); return { lim: f.limit, out: f.out || 0, n: al.length, g: al[0] && al[0].g, kinds: (W.scene.hits || []).map(h => h.kind).join(',') }; });
    t.check(`alerte ${vp.n} : la pénurie d'intrant est une pastille cliquable de la scène`, /^(iron|coal)$/.test(pen.lim || '') && pen.n === 1 && pen.out < 0.5, `limite ${pen.lim} · production ${pen.out.toFixed(1)} · pastilles ${pen.kinds}`);
    // 2. clic réel sur la pastille -> menu contextuel avec les actions
    const pos = await pg.evaluate(() => { const sc = window.WSE.scene, h = sc.hits.find(x => x.kind === 'in'), rc = document.getElementById('bsw').getBoundingClientRect(); return { x: rc.left + (h.x0 + h.x1) / 2, y: rc.top + (h.y0 + h.y1) / 2, wpx: h.x1 - h.x0, hpx: h.y1 - h.y0 }; });
    await pg.mouse.move(pos.x, pos.y); await pg.waitForTimeout(150); await pg.mouse.click(pos.x, pos.y); await pg.waitForTimeout(400);
    const menu = await pg.evaluate(() => { const pop = document.getElementById('bpop'); return { vis: !pop.hidden, acts: [...pop.querySelectorAll('[data-act]')].map(b => b.dataset.act) }; });
    t.check(`alerte ${vp.n} : le clic ouvre le menu (sources automatiques, fournisseur, import) et la zone tactile fait au moins 44 px`, menu.vis && menu.acts.includes('alr:auto') && menu.acts.some(a => /^opensup:/.test(a)) && menu.acts.some(a => /^alr:port:/.test(a)) && pos.hpx >= 43 && pos.wpx >= 43, `${menu.acts.join(' ')} · zone ${Math.round(pos.wpx)}×${Math.round(pos.hpx)} px`);
    // 3. « Sources automatiques » : la production reprend
    await pg.click('#bpop [data-act="alr:auto"]'); await pg.waitForTimeout(300);
    const rep = await pg.evaluate(async () => { const { W, S, f, fr } = window.B; let out = 0; for (let i = 0; i < 30; i++) { fr(); W.step(); if (i >= 20) out += f.out || 0; } await new Promise(r => setTimeout(r, 500)); return { out: out / 10, lim: f.limit, inAl: (W.scene.hits || []).filter(h => h.kind === 'in').length, menuOff: document.getElementById('bpop').hidden }; });
    t.check(`alerte ${vp.n} : après « Sources automatiques » la production reprend et l'alerte disparaît`, rep.out > 1 && rep.inAl === 0 && rep.menuOff, `production ${rep.out.toFixed(1)}/j · limite ${rep.lim} · alertes ${rep.inAl}`);
    t.check(`alerte ${vp.n} : aucune erreur de page`, pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
    await pg.context().close();
  }

  // Caméra (bureau) : zoom molette / boutons, point de vue « fabrication », clic exact sur une case malgré la transformation
  const pg = await L.newPage({ w: 1280, h: 900, wait: 600 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg); await pg.evaluate(SETUP);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr{display:none!important}' });
  await pg.evaluate(async () => { const { W, f } = window.B; W.openBuilding(f.x, f.y); await new Promise(r => setTimeout(r, 600)); });
  const sw0 = await pg.evaluate(() => document.getElementById('bscene').getBoundingClientRect().width);
  await pg.click('[data-cam="+"]'); await pg.click('[data-cam="+"]'); await pg.click('[data-cam="make"]'); await pg.waitForTimeout(200);
  const cam = await pg.evaluate(() => { const W = window.WSE, sc = W.scene, sr = document.getElementById('bsw').getBoundingClientRect(), i = W.planOf(window.B.f).indexOf('make'), q = W.planSlotXY(sc, i), p = sc.M(q[0] - 1.3, q[1] - 1.3, 0), rc = document.getElementById('bscene').getBoundingClientRect(); const cx = sr.left + p[0], cy = sr.top + p[1]; return { w: rc.width, cx, cy, inView: p[0] > 0 && p[0] < sr.width && p[1] > 0 && p[1] < sr.height, i }; });
  t.check('caméra : zoom avant par les boutons et point de vue « Fabrication » centré sur la machine', cam.w > sw0 * 1.5 && cam.inView, `largeur ${Math.round(sw0)} → ${Math.round(cam.w)} px · machine visible ${cam.inView}`);
  await pg.mouse.click(cam.cx, cam.cy); await pg.waitForTimeout(300);
  const sel = await pg.evaluate(() => document.querySelector('#bpop .plsel b') ? document.querySelector('#bpop .plsel b').textContent : '');
  t.check('caméra : un clic sur la machine zoomée ouvre bien le menu de SA case (coordonnées exactes)', new RegExp('Case ' + (cam.i + 1) + ' ').test(sel), sel);
  await pg.click('[data-cam="all"]'); const w1 = await pg.evaluate(() => document.getElementById('bscene').getBoundingClientRect().width);
  t.check('caméra : « Ensemble » recentre à l\'échelle 1', Math.abs(w1 - sw0) < 2, `${Math.round(w1)} px`);
  t.check('caméra : aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
