// Passe 88 : départ « Ville de 100 000 habitants » (S.opt.start = 'moyenne'), défaut de l'écran Nouvelle partie (retour de Rémy : une vraie économie dès le départ, sans forêt de gratte-ciel). Vérifie :
//  1. API sans option (tests, bots, outils) : la ville de départ habituelle, inchangée (pas de S.opt.start, ≈ 60 000 habitants) ;
//  2. départ 'moyenne' : 100 000 à 120 000 habitants aux jours 0 et 30, chômage 5 à 9 %, équipements publics complets (plusieurs écoles), grand mall, hauteurs moyennes
//     (aucun immeuble au-delà de 16 étages, au plus 6 tours de 12 étages et plus, une majorité d'immeubles de 1 à 7 étages), demande de départ et IA identiques au départ 'ville' ;
//  3. paliers de ville : 50 000 et 100 000 habitants déjà atteints, masqués (aucun jalon « ville » sous 100 000 habitants), prochain palier 150 000 ;
//  4. un premier commerce près du mall gagne de l'argent dès le premier mois ;
//  5. sauvegarde : départ, région (bassin), population et bâtiments relus à l'identique ; la partie continue ;
//  6. écran Nouvelle partie (bureau et téléphone) : « Ville de 100 000 habitants » présélectionnée et appliquée au Round ; choix mémorisé (wse-start) ;
//  7. performance : génération et jour simulé de la ville de 100 000 habitants du même ordre que la ville habituelle.
exports.name = 'Départ ville de 100 000 habitants';
const START = ([st, seed]) => {
  const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true }));
  const t0 = performance.now(); W.startMode('round', st ? { start: st } : undefined); const gen = performance.now() - t0; const S = W.S; S.rs = seed; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
  S.mode.w0 = S.cash; return gen;
};
const INFO = () => { const W = window.WSE, S = W.S; let nb = 0, mall = 0, top = 0, tow = 0, low = 0, house = 0, n = 0; const fl = [];
  S.grid.forEach(c => { if (!c || c.t !== 'npc') return; nb++; if (c.m === 'mall') mall++; if (c.k === 'mon' || c.k === 'park') return; n++; fl.push(c.floors); if (c.floors > top) top = c.floors; if (c.floors >= 12) tow++; if (c.floors <= 7) low++; if (c.k === 'house') house++; });
  const att = S.rivals.reduce((a, r) => a + ['basic', 'std', 'lux', 'estate'].reduce((b, k) => b + (r.att[k] || 0), 0), 0), sv = W.citySvc();
  return { st: S.opt && S.opt.start, day: S.day, pop: Math.round(S.pop), popE: Math.round(W.popE()), un: S.stats.unemp, nb, mall, top, tow, low: n ? low / n : 0, house, att: +att.toFixed(3), cash: S.cash, cov: sv.cov, have: sv.have, bs: S.bassin, city: S.city && S.city.name }; };
exports.run = async (t, L) => {
  // ---- 1 à 4
  {
    const pg = await L.newPage({ wait: 600 }); await L.inject(pg);
    const v = await pg.evaluate(([S0, I]) => { (0, eval)('(' + S0 + ')')([null, 7001]); return (0, eval)('(' + I + ')')(); }, [START.toString(), INFO.toString()]);
    t.check('API sans option : ville de départ habituelle (pas de S.opt.start, 50 000 à 80 000 habitants, grand mall)', !v.st && v.mall === 100 && v.pop >= 50000 && v.pop <= 80000, JSON.stringify({ st: v.st, pop: v.pop, mall: v.mall }));
    const m = await pg.evaluate(([S0, I]) => { const gen = (0, eval)('(' + S0 + ')')(['moyenne', 7001]); const W = window.WSE, S = W.S, f = (0, eval)('(' + I + ')'), o = { gen, j0: f() };
      const t0 = performance.now(); while (S.day < 30) W.step(); o.ms = (performance.now() - t0) / 30; o.j30 = f(); o.bad = window.T.scan().slice(0, 4);
      const R = W.ry.S(); o.pi = R.pi; o.next = W.ry.POP[R.pi]; o.jal = (R.log || []).filter(x => x[1] === 'ville').map(x => x[2]); return o; }, [START.toString(), INFO.toString()]);
    const a = m.j0, b = m.j30;
    t.info(`ville habituelle : ${v.pop} hab. (région ${v.popE}) · ville de 100 000 : jour 0 ${a.pop} hab. (région ${a.popE}, bassin ${a.bs.toFixed(3)}), jour 30 ${b.pop} hab. · chômage ${(a.un * 100).toFixed(1)} % puis ${(b.un * 100).toFixed(1)} % · ${a.nb} bâtiments, ${a.house} maisons, plus haut ${a.top} étages, ${a.tow} tours ≥ 12 étages, ${Math.round(a.low * 100)} % de 1 à 7 étages · génération ${m.gen.toFixed(0)} ms, ${m.ms.toFixed(1)} ms par jour simulé`);
    t.range('ville de 100 000 : population au jour 0', a.pop, 100000, 120000, ' hab.', 0);
    t.range('ville de 100 000 : population au jour 30', b.pop, 100000, 125000, ' hab.', 0);
    t.check('ville de 100 000 : chômage de 5 à 9 % aux jours 0 et 30', a.un >= 0.05 && a.un <= 0.09 && b.un >= 0.05 && b.un <= 0.09, `${(a.un * 100).toFixed(1)} % · ${(b.un * 100).toFixed(1)} %`);
    t.check('ville de 100 000 : équipements publics complets sans surplus (hôpital, lycée, collège, école, crèche, police, pompiers ; couverture 100 %, un de chaque sorte : urbanisme, Rémy)', a.cov >= 0.999 && ['hospital', 'lycee', 'college', 'maternelle', 'garderie', 'police', 'fire'].every(k => a.have[k] === 1), JSON.stringify(a.have));
    t.check('ville de 100 000 : hauteurs moyennes (plus haut ≤ 16 étages, 1 à 6 tours de 12 étages et plus, ≥ 85 % des bâtiments de 1 à 7 étages, ≥ 60 maisons), grand mall 10×10', a.top <= 16 && a.tow >= 1 && a.tow <= 6 && a.low >= 0.85 && a.house >= 60 && a.mall === 100, JSON.stringify({ top: a.top, tow: a.tow, low: a.low, house: a.house, mall: a.mall }));
    t.check('ville de 100 000 : même demande de départ que la ville habituelle (région ±1 %), mêmes IA (attrait cumulé ±2 %), trésorerie du Round 10 M$', Math.abs(a.popE / v.popE - 1) <= 0.01 && Math.abs(a.att / v.att - 1) <= 0.02 && a.cash === 10e6, `${a.popE} / ${v.popE} · ${a.att} / ${v.att} · ${a.cash}`);
    t.check('paliers de ville : les jalons commencent au-dessus de la ville de départ (premier palier 150 000), aucun jalon « ville » déjà franchi au départ', m.pi === 0 && m.next === 150000 && !m.jal.some(x => /^(50|100) 000/.test(x.replace(/\s/g, ' '))), JSON.stringify({ pi: m.pi, next: m.next, jal: m.jal }));
    t.check('ville de 100 000 : aucune valeur non finie, 0 erreur de page', !m.bad.length && pg.errs.length === 0, m.bad.join(' ') + pg.errs.slice(0, 2).join(' ; '));
    // ---- 4 : premier commerce
    const c = await pg.evaluate(([S0]) => { (0, eval)('(' + S0 + ')')(['moyenne', 7002]); const W = window.WSE, S = W.S; let c = null;
      for (let r = 0; r < 12 && !c; r++) for (let y = 23 - r; y <= 37 + r && !c; y++) for (let x = 23 - r; x <= 37 + r && !c; x++) if (Math.max(Math.abs(x - 30), Math.abs(y - 30)) >= 6 + r && !W.footprintError(x, y, 's1') && W.place(x, y, 's1')) c = S.grid[y * W.N + x];
      if (!c) return null; let p = 0, rv = 0; for (let d = 1; d <= 30; d++) { W.step(); if (d > 8) { p += c.profit || 0; rv += c.pRev || 0; } } return { x: c.x, y: c.y, p: p / 22, r: rv / 22 }; }, [START.toString()]);
    t.check('ville de 100 000 : un premier petit marché près du mall est rentable dès le premier mois (bénéfice moyen des jours 9 à 30 > 0)', c && c.p > 0, c ? `(${c.x}, ${c.y}) bénéfice ${Math.round(c.p)} $/j, CA ${Math.round(c.r)} $/j` : 'pas de place');
    // ---- 7 : performance comparée (jour simulé)
    const pv = await pg.evaluate(([S0]) => { (0, eval)('(' + S0 + ')')([null, 7001]); const W = window.WSE, S = W.S, t0 = performance.now(); while (S.day < 30) W.step(); return (performance.now() - t0) / 30; }, [START.toString()]);
    t.check('performance : génération < 2 s, jour simulé de la ville de 100 000 ≤ 2 × celui de la ville habituelle (+ 5 ms)', m.gen < 2000 && m.ms <= 2 * pv + 5, `génération ${m.gen.toFixed(0)} ms · ${m.ms.toFixed(1)} ms/jour contre ${pv.toFixed(1)} ms/jour`);
    await pg.context().close();
  }
  // ---- 5 : sauvegarde
  {
    const pg = await L.newPage({ wait: 600 }); await L.inject(pg); const ctx = pg.context();
    const sv = await pg.evaluate(([S0]) => { (0, eval)('(' + S0 + ')')(['moyenne', 7003]); const W = window.WSE, S = W.S; for (let i = 0; i < 12; i++) W.step(); W.save(); let nb = 0; S.grid.forEach(c => { if (c && c.t === 'npc') nb++; }); return { st: S.opt.start, bs: S.bassin, jt: S.cg.jt, pop: S.pop, day: S.day, nb, pe: Math.round(W.popE()) }; }, [START.toString()]);
    await pg.close();
    const p2 = await ctx.newPage(); p2.errs = []; p2.on('pageerror', e => p2.errs.push(e.message)); await p2.goto(L.URL); await p2.waitForTimeout(800);
    const re = await p2.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); let nb = 0; S.grid.forEach(c => { if (c && c.t === 'npc') nb++; }); const o = { st: S.opt && S.opt.start, bs: S.bassin, jt: S.cg && S.cg.jt, pop: S.pop, day: S.day, nb, pe: Math.round(W.popE()) }; const p0 = S.pop; for (let i = 0; i < 20; i++) W.step(); o.after = S.pop - p0; return o; });
    t.check('sauvegarde : départ « moyenne », région, emplois visés, bâtiments et population relus à l\'identique', re.st === 'moyenne' && Math.abs(re.bs - sv.bs) < 1e-9 && re.jt === sv.jt && re.nb === sv.nb && Math.abs(re.pop - sv.pop) < 1 && Math.abs(re.pe - sv.pe) <= 2 && Math.abs(re.day - sv.day) <= 1, `avant ${JSON.stringify(sv)} après ${JSON.stringify(re)}`);
    t.check('après rechargement : la partie continue (20 jours), 0 erreur', p2.errs.length === 0 && Number.isFinite(re.after), p2.errs.slice(0, 2).join(' ; '));
    await ctx.close();
  }
  // ---- 6 : écran Nouvelle partie (bureau et téléphone)
  for (const vw of [[1280, 900], [390, 844]]) {
    const pg = await L.newPage({ wait: 600, w: vw[0], h: vw[1] });
    const u = await pg.evaluate(async () => { const W = window.WSE; W.showModes(); const r = [...document.querySelectorAll('#modesel input[name="start"]')], o = { radios: r.map(x => x.value + (x.checked ? '*' : '')), txt: r[0] ? r[0].parentElement.textContent.trim() : '' };
      const box = document.querySelector('#modesel .mbox') || document.getElementById('modesel'); o.over = Math.max(document.documentElement.scrollWidth - innerWidth, box.scrollWidth - box.clientWidth);
      document.querySelector('#modesel [data-mode="round"]').click(); o.st = W.S.opt && W.S.opt.start; o.pop = Math.round(W.S.pop); o.mem0 = localStorage.getItem('wse-start');
      W.showModes(); const p = document.querySelector('#modesel input[name="start"][value="petite"]'); p.checked = true; p.dispatchEvent(new Event('change', { bubbles: true })); o.mem = localStorage.getItem('wse-start'); W.showModes(); o.again = (document.querySelector('#modesel input[name="start"]:checked') || {}).value; document.getElementById('modesel').hidden = true; return o; });
    t.check(`écran Nouvelle partie ${vw[0]}×${vw[1]} : « Ville de 100 000 habitants » présélectionnée et appliquée au Round (≥ 100 000 habitants), sans défilement horizontal`, u.radios[0] === 'moyenne*' && u.radios.length === 4 && /100 000/.test(u.txt) && u.st === 'moyenne' && u.pop >= 100000 && u.over <= 1 && pg.errs.length === 0, JSON.stringify(u) + pg.errs.slice(0, 2).join(' ; '));
    t.check(`écran Nouvelle partie ${vw[0]}×${vw[1]} : le choix du départ est mémorisé (wse-start) et présélectionné la fois suivante`, u.mem === 'petite' && u.again === 'petite', JSON.stringify({ mem0: u.mem0, mem: u.mem, again: u.again }));
    await pg.context().close();
  }
};
