// Passe 87 : départ « de zéro » (S.opt.start) et offensives des concurrents sans fenêtre (retours de Rémy). Vérifie :
//  1. API sans option (tests, bots, outils) : la ville de départ habituelle, inchangée (grand mall, ≈ 60 000 habitants, pas de S.opt.start, rivaux non réduits) ;
//  2. départ 'zero' : bourg de 300 à 800 habitants, une cinquantaine de bâtiments au centre, port vide, chômage raisonnable, rivaux à petite implantation, aucune valeur non finie ;
//  3. un petit marché posé près de la halle gagne de l'argent dès le premier mois ;
//  4. croissance avec le bot (tools/bot_lib.js) : quelques milliers d'habitants à 6 mois, des dizaines de milliers à 2 ans, croissance continue ;
//  5. sauvegarde : S.opt.start, la densité du bourg et la population relus à l'identique, la partie continue ;
//  6. écran Nouvelle partie : 4 départs (passe 88 : « Ville de 100 000 habitants » présélectionnée), le Bourg choisi est appliqué au Round ; téléphone 390×844 sans défilement horizontal ;
//  7. offensive d'un concurrent : sans enjeu grave, pas de fenêtre (ligne du journal, réponse depuis le bandeau) ; grave : fenêtre, au plus une par mois.
exports.name = 'Départ de zéro et offensives des concurrents';
const START = ([st, seed, bot]) => {
  const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true }));
  W.startMode('round', st ? { start: st } : undefined); const S = W.S; S.rs = seed; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
  S.mode.w0 = S.cash;
  if (bot) { (0, eval)(bot); window.BOT.P.lev = 0.45; window.BOT.P.idle = 0; Object.assign(window.BOT.P, { fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false, hurdle: 0.05 }); }
};
const INFO = () => { const W = window.WSE, S = W.S; let nb = 0, port = 0, own = 0; S.grid.forEach((c, i) => { if (!c) return; if (c.t === 'npc' && c.k !== 'mon') { nb++; if (W.inCity && !W.inCity(c.x, c.y)) port++; } else if (c.t !== 'npc' && c.t !== 'road' && c.t !== 'part') own++; });
  let mall = 0; S.grid.forEach(c => { if (c && c.t === 'npc' && c.m === 'mall') mall++; });
  const att = S.rivals.reduce((a, r) => a + ['basic', 'std', 'lux', 'estate'].reduce((b, k) => b + (r.att[k] || 0), 0), 0);
  return { st: S.opt && S.opt.start, pop: Math.round(S.pop), popE: Math.round(W.popE()), nb, port, own, mall, att: +att.toFixed(3), hk: W.start.hk(), unemp: S.stats.unemp, cash: S.cash }; };
exports.run = async (t, L) => {
  // ---- 1 et 2 : ville habituelle (API sans option) puis bourg de départ
  {
    const pg = await L.newPage({ wait: 600 }); await L.inject(pg);
    const v = await pg.evaluate(([S0, I]) => { (0, eval)('(' + S0 + ')')([null, 7001, null]); return (0, eval)('(' + I + ')')(); }, [START.toString(), INFO.toString()]);
    t.check('API sans option : ville de départ habituelle (pas de S.opt.start, grand mall 10×10, 50 000 à 80 000 habitants)', !v.st && v.mall === 100 && v.pop >= 50000 && v.pop <= 80000 && v.hk === 1, JSON.stringify(v));
    const z = await pg.evaluate(([S0, I]) => { (0, eval)('(' + S0 + ')')(['zero', 7001, null]); const W = window.WSE; for (let i = 0; i < 3; i++) W.step(); const o = (0, eval)('(' + I + ')')(); o.bad = window.T.scan().slice(0, 4); o.city = W.S.city.name; return o; }, [START.toString(), INFO.toString()]);
    t.info(`ville : ${v.pop} hab., attrait cumulé des rivaux ${v.att} ; bourg : ${z.pop} hab. (bassin ${z.popE}), ${z.nb} bâtiments, densité ${z.hk.toFixed(3)}, rivaux ${z.att}, chômage ${(z.unemp * 100).toFixed(1)} %`);
    t.range('départ de zéro : population du bourg (300 à 800 habitants)', z.pop, 300, 800, ' hab.', 0);
    t.check('départ de zéro : une cinquantaine de bâtiments de la ville (35 à 80), aucun hors de la ville (port et zone industrielle vides), aucun bâtiment du joueur', z.st === 'zero' && z.nb >= 35 && z.nb <= 80 && z.port === 0 && z.own === 0 && z.mall === 4, JSON.stringify(z));
    t.check('départ de zéro : chômage de départ sous 20 %, niveau de ville « Bourg », trésorerie du Round 10 M$', z.unemp < 0.2 && z.city === 'Bourg' && z.cash === 10e6, `${(z.unemp * 100).toFixed(1)} % · ${z.city} · ${z.cash}`);
    t.check('départ de zéro : les IA démarrent avec une petite implantation (attrait cumulé ≤ 40 % de celui de la ville)', z.att <= 0.4 * v.att, `${z.att} / ${v.att}`);
    t.check('départ de zéro : aucune valeur non finie dans l\'état, 0 erreur de page', !z.bad.length && pg.errs.length === 0, z.bad.join(' ') + pg.errs.slice(0, 2).join(' ; '));
    // ---- 3 : un petit marché rapporte dès le premier mois
    const m = await pg.evaluate(() => { const W = window.WSE, S = W.S; S.cash = 10e6; let c = null; for (let y = 24; y < 36 && !c; y++) for (let x = 24; x < 36 && !c; x++) if (!W.footprintError(x, y, 's1') && W.place(x, y, 's1')) c = S.grid[y * W.N + x];
      if (!c) return null; let p = 0, r = 0; for (let d = 1; d <= 30; d++) { W.step(); if (d > 8) { p += c.profit || 0; r += c.pRev || 0; } } return { p: p / 22, r: r / 22, sold: c._sold, cap: c._capNom }; });
    t.check('départ de zéro : un petit marché près de la halle est rentable dès le premier mois (bénéfice moyen des jours 9 à 30 > 0)', m && m.p > 0, m ? `bénéfice ${Math.round(m.p)} $/j, CA ${Math.round(m.r)} $/j, ventes ${Math.round(m.sold)} / ${Math.round(m.cap)} u/j` : 'pas de place');
    await pg.context().close();
  }
  // ---- 4 et 5 : croissance avec le bot, puis sauvegarde
  {
    const pg = await L.newPage({ wait: 600 }); await L.inject(pg); const ctx = pg.context();
    await pg.evaluate(([S0, bot]) => (0, eval)('(' + S0 + ')')(['zero', 5000, bot]), [START.toString(), L.BOT_SRC]);
    const g = await pg.evaluate(() => { const W = window.WSE, S = W.S, B = window.BOT, at = {}, marks = [30, 180, 360, 720]; S.mode.k = 'free';
      while (S.day < 720) { for (let k = 0; k < 4; k++) { W.step(); if (marks.indexOf(S.day) >= 0) at[S.day] = Math.round(S.pop); } B.tick(); } return { at, bad: window.T.scan().slice(0, 4) }; });
    t.info('population (bot, départ de zéro) : ' + Object.keys(g.at).map(d => `jour ${d} : ${g.at[d]}`).join(' · '));
    t.range('croissance : quelques milliers d\'habitants à 6 mois (jour 180)', g.at[180], 1500, 15000, ' hab.', 0);
    t.range('croissance : des dizaines de milliers d\'habitants à 2 ans (jour 720)', g.at[720], 10000, 150000, ' hab.', 0);
    t.check('croissance continue (jour 30 < 180 < 360 < 720), aucune valeur non finie, 0 erreur', g.at[30] < g.at[180] && g.at[180] < g.at[360] && g.at[360] < g.at[720] && !g.bad.length && pg.errs.length === 0, g.bad.join(' ') + pg.errs.slice(0, 2).join(' ; '));
    const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.save(); let nb = 0; S.grid.forEach(c => { if (c && c.t === 'npc') nb++; }); return { st: S.opt.start, hk: S.cg.hk, pop: S.pop, day: S.day, nb, cap: Math.round(S.stats.cap) }; });
    await pg.close();
    const p2 = await ctx.newPage(); p2.errs = []; p2.on('pageerror', e => p2.errs.push(e.message)); await p2.goto(L.URL); await p2.waitForTimeout(800);
    const re = await p2.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); let nb = 0; S.grid.forEach(c => { if (c && c.t === 'npc') nb++; }); const o = { st: S.opt && S.opt.start, hk: S.cg && S.cg.hk, pop: S.pop, day: S.day, nb }; W.refreshStats(); o.cap = Math.round(S.stats.cap); const p0 = S.pop; for (let i = 0; i < 20; i++) W.step(); o.after = S.pop - p0; return o; });
    t.check('sauvegarde : départ, densité du bourg, bâtiments de la ville et population relus à l\'identique', re.st === 'zero' && re.hk === 1 && re.nb === sv.nb && Math.abs(re.pop - sv.pop) < 1 && Math.abs(re.cap - sv.cap) <= Math.max(2, sv.cap * 0.002) && Math.abs(re.day - sv.day) <= 1, `avant ${JSON.stringify(sv)} après ${JSON.stringify(re)}`);
    t.check('après rechargement : la partie continue (20 jours), 0 erreur', p2.errs.length === 0 && Number.isFinite(re.after), p2.errs.slice(0, 2).join(' ; '));
    await ctx.close();
  }
  // ---- 6 : écran Nouvelle partie (bureau et téléphone)
  for (const vw of [[1280, 900], [390, 844]]) {
    const pg = await L.newPage({ wait: 600, w: vw[0], h: vw[1] });
    const u = await pg.evaluate(async () => { const W = window.WSE; W.showModes(); const r = [...document.querySelectorAll('#modesel input[name="start"]')], o = { radios: r.map(x => x.value + (x.checked ? '*' : '')), txt: r.map(x => x.parentElement.textContent.trim().split(' · ')[0]) };
      const box = document.querySelector('#modesel .mbox') || document.getElementById('modesel'); o.over = Math.max(document.documentElement.scrollWidth - innerWidth, box.scrollWidth - box.clientWidth);
      const z = r.find(x => x.value === 'zero'); z.checked = true; z.dispatchEvent(new Event('change', { bubbles: true })); document.querySelector('#modesel [data-mode="round"]').click(); o.st = W.S.opt && W.S.opt.start; o.pop = Math.round(W.S.pop); return o; });
    t.check(`écran Nouvelle partie ${vw[0]}×${vw[1]} : « Ville de 100 000 habitants » présélectionnée, « Bourg (défi, 600 habitants) / Petite ville / Ville établie » proposés, le Bourg choisi est appliqué au Round, sans défilement horizontal`, u.radios.join(',') === 'moyenne*,zero,petite,ville' && /100 000/.test(u.txt[0]) && /Bourg/.test(u.txt[1]) && /Petite ville/.test(u.txt[2]) && /Ville établie/.test(u.txt[3]) && u.st === 'zero' && u.pop < 1000 && u.over <= 1 && pg.errs.length === 0, JSON.stringify(u) + pg.errs.slice(0, 2).join(' ; '));
    await pg.context().close();
  }
  // ---- 7 : offensive d'un concurrent (seul événement possible pendant le test)
  {
    const pg = await L.newPage({ wait: 600 });
    await pg.evaluate(S0 => (0, eval)('(' + S0 + ')')([null, 7003, null]), START.toString());
    const e = await pg.evaluate(() => { const W = window.WSE, S = W.S, E = W.EVENTS, keep = E.filter(x => x.id === 'rival'); E.length = 0; keep.forEach(x => E.push(x)); S.noEv = false; S.cash = 5e8;
      let c = null; for (let y = 24; y < 44 && !c; y++) for (let x = 14; x < 44 && !c; x++) if (!W.footprintError(x, y, 's1') && W.place(x, y, 's1')) c = S.grid[y * W.N + x];
      const box = document.getElementById('evcard'), o = { soft: [], modal: [] }; let last = null;
      const run = n => { for (let i = 0; i < n; i++) { W.step(); if (S.event && W.ui.decList().some(d => d.id === 'ev')) { o.modal.push(S.day); if (!box.hidden) o.win = (o.win || 0) + 1; box.querySelector('[data-ev="1"]').click(); } if (S.evR && S.evR !== last) { last = S.evR; o.soft.push(S.day); } } };
      run(60); o.softBan = !!document.querySelector('#rvban [data-rve="0"]') || /Offensive/.test(W.evRiv.html('rve')); o.n1 = o.modal.length;
      if (S.evR) { const c0 = S.cash, m0 = (S.mods || []).length; o.ans = W.evRiv.answer(0); o.paid = c0 - S.cash; o.mod = (S.mods || []).slice(m0).map(m => m.k + ':' + m.v); o.left = !!S.evR; }
      W.evRiv.tune({ W: 0 }); run(150); W.evRiv.tune({ W: 0.05 });   // enjeu toujours « grave » : fenêtres, au plus une par mois
      let gap = 999; for (let i = 1; i < o.modal.length; i++) gap = Math.min(gap, o.modal[i] - o.modal[i - 1]);
      o.gap = gap; return o; });
    t.info(`offensives : ${e.soft.length} sans fenêtre (jours ${e.soft.join(', ')}), ${e.modal.length} fenêtres (jours ${e.modal.join(', ')})`);
    t.check('offensive à enjeu faible : aucune fenêtre, ligne du journal et réponse dans le bandeau des rivaux', e.n1 === 0 && e.soft.length >= 1 && e.softBan, JSON.stringify(e));
    t.check('réponse depuis le bandeau : mêmes effets que la fenêtre (Riposter : coût débité, demande +5 % pendant 15 jours), offensive close', e.ans === true && e.paid > 0 && e.mod.join() === 'demand:1.05' && !e.left, JSON.stringify({ ans: e.ans, paid: e.paid, mod: e.mod }));
    t.check('offensive grave : décision en attente sans fenêtre (passe 99), au plus une tous les 30 jours', e.modal.length >= 2 && e.gap >= 30 && !e.win, `${e.modal.length} fenêtres, écart minimal ${e.gap} j`);
    t.check('offensives : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
    await pg.context().close();
  }
};
