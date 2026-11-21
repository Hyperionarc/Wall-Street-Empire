// Passe 80 : niveau de difficulté des IA 1 à 8 (façon Capitalism Lab) et fin de Round enrichie.
// A. Niveau par défaut = Normal (4) : réglages des IA identiques à la version d'avant ; note de difficulté croissante avec le niveau ; début accueillant (aucun effet avant le jour 180).
// B. Interface : sélecteur de niveau et de nombre de joueurs dans l'écran Nouvelle partie, ligne de niveau dans les paramètres ; S.opt.lv sauvegardé.
// C. Fin de partie : un rival qui atteint 1 Md$ avant le joueur remporte le Round (défaite), classement des joueurs, palmarès local, « Continuer en bac à sable ».
// D. Rang du joueur selon le niveau : bot « bon joueur » (industriel, graine 6000, 1 000 jours) aux niveaux 2, 4 et 8 : les IA valent plus à mesure que le niveau monte.
exports.name = 'Niveaux de difficulté des IA (1-8), rang du joueur, fin de Round';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 });
  const a = await pg.evaluate(() => {
    const W = window.WSE; W.startMode('round'); const S = W.S; W.setCaste('industriel'); W.setSpeed(0); if (S.mode) delete S.mode.await;
    ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    const D = W.dif, o = { def: D.lv(), k4: D.LV[4].k, ag4: D.LV[4].ag, n: D.LV.length - 1 };
    S.opt.lv = 4; o.e4 = JSON.stringify(W.riv.diff()); delete S.opt.lv; o.e0 = JSON.stringify(W.riv.diff());
    o.notes = [1, 2, 3, 4, 5, 6, 7, 8].map(l => D.note(l));
    o.rt = [1, 4, 8].map(l => { S.opt.lv = l; return W.riv.rating(); });
    S.day = 100; o.k8early = D.k(); S.day = 1200; o.k8late = D.k(); S.opt.lv = 1; o.k1 = D.k(); S.day = 0; S.opt.lv = 4;
    return o;
  });
  t.check('8 niveaux, Normal (4) par défaut avec compétence ×1 et combativité ×1', a.n === 8 && a.def === 4 && a.k4 === 1 && a.ag4 === 1, `défaut ${a.def}`);
  t.check('niveau Normal : réglages des IA identiques à ceux d\'une partie sans niveau (ancienne sauvegarde)', a.e4 === a.e0, a.e4.slice(0, 80));
  t.check('note de difficulté strictement croissante de 1 à 8 (100 % au niveau Normal)', a.notes.every((v, i) => i === 0 || v > a.notes[i - 1]) && a.notes[3] === 100, a.notes.join(' / ') + ' %');
  t.check('note affichée de la concurrence croissante avec le niveau', a.rt[0] < a.rt[1] && a.rt[1] < a.rt[2], a.rt.join(' / ') + ' %');
  t.check('début accueillant : au niveau 8, compétence ×1 au jour 100, pleine au jour 1 200', a.k8early === 1 && a.k8late > 3, `${a.k8early} -> ${a.k8late}`);

  // B. interface
  const b = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; W.showModes(); const sel = document.getElementById('lvsel'), nr = document.getElementById('nrsel');
    const o = { lv: sel ? sel.options.length : 0, nr: nr ? [...nr.options].map(x => x.textContent).join(' | ') : '' };
    sel.value = '6'; sel.dispatchEvent(new Event('change', { bubbles: true })); nr.value = '4'; nr.dispatchEvent(new Event('change', { bubbles: true }));
    W.startMode('round'); W.setCaste('banquier'); W.setSpeed(0); if (S.mode) delete W.S.mode.await; ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    o.after = [W.S.opt.lv, W.S.rivals.length]; W.save(); o.saved = (JSON.parse(localStorage.getItem('wse-city-v8')).opt || {}).lv;
    o.optRow = (W.optHTML ? W.optHTML() : '').split('data-opt="lv:').length - 1;
    try { localStorage.removeItem('wse-lv'); localStorage.removeItem('wse-nr'); } catch (e) {}
    return o;
  });
  t.check('écran Nouvelle partie : 8 niveaux et nombre de joueurs jusqu\'à 8', b.lv === 8 && /8 joueurs/.test(b.nr), b.nr);
  t.check('le niveau et le nombre de joueurs choisis s\'appliquent au Round (niveau 6, 7 IA) et le niveau est sauvegardé', b.after[0] === 6 && b.after[1] === 7 && b.saved === 6, JSON.stringify(b.after) + ' sauvé ' + b.saved);
  t.check('paramètres de la partie : ligne « niveau de difficulté » à 8 boutons', b.optRow === 8, String(b.optRow));

  // C. fin de partie : victoire d'un rival, écran de défaite, bac à sable
  const c = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, r = S.rivals.find(x => x.caste === 'industriel'); r.cash = 1.2e9; W.step();
    const o = { done: S.mode.done, msg: S.mode.res && S.mode.res.msg, pl: S.mode.res && S.mode.res.pl ? S.mode.res.pl.length : 0, top: S.mode.res && S.mode.res.pl && S.mode.res.pl[0][0] };
    const box = document.getElementById('endscr'); o.html = box.textContent; o.shown = !box.hidden;
    const btn = box.querySelector('[data-end="cont"]'); o.btn = btn ? btn.textContent : ''; if (btn) btn.click();
    o.free = S.mode.k; const d0 = S.day; W.setSpeed(0); for (let i = 0; i < 5; i++) W.step(); o.cont = S.day - d0;
    o.hof = JSON.parse(localStorage.getItem('wse-rounds') || '[]').length; return o;
  });
  t.check('un rival qui atteint 1 Md$ avant toi remporte le Round (défaite)', c.done === 'lose' && /remporte le round/.test(c.msg || ''), c.msg);
  t.check('écran de fin : DÉFAITE, classement des 8 joueurs avec leur caste, palmarès des rounds', c.shown && /DÉFAITE/.test(c.html) && /Classement des joueurs/.test(c.html) && c.pl === 8 && c.top === 'Vulcan Industries' && c.hof >= 1, `${c.pl} joueurs, en tête ${c.top}, palmarès ${c.hof}`);
  t.check('« Continuer en bac à sable » : la partie continue en Libre', /bac à sable/.test(c.btn) && c.free === 'free' && c.cont === 5, `${c.btn} -> ${c.free}, +${c.cont} j`);
  t.check('aucune erreur de page (A-C)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();

  // D. rang du joueur selon le niveau (bot bon joueur, industriel, graine 6000, 1 000 jours)
  const res = {};
  for (const lv of [2, 4, 8]) {
    const p = await L.newPage({ wait: 500 }); await L.injectBot(p);
    res[lv] = await p.evaluate(([lv]) => {
      const W = window.WSE; W.startMode('round'); const S = W.S; S.rs = 6000; S.opt = Object.assign(S.opt || {}, { lv }); W.setCaste('industriel'); W.setSpeed(0); if (S.mode) delete S.mode.await; S.mode.w0 = S.cash;
      ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
      const B = window.BOT; Object.assign(B.P, { lev: 0.45, idle: 0, hurdle: 0.05, fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false });
      while (S.day < 1000 && !S.mode.done) { for (let k = 0; k < 4; k++) W.step(); B.tick(); }
      const rv = S.rivals.map(r => W.riv.value(r)); return { me: W.valuation(), best: Math.max(...rv), sum: rv.reduce((x, y) => x + y, 0), rank: W.rankPlayers(), d: S.day };
    }, [lv]);
    t.check(`niveau ${lv} : aucune erreur de page`, p.errs.length === 0, p.errs.slice(0, 2).join(' | '));
    await p.context().close();
  }
  const f = v => (v / 1e6).toFixed(0);
  t.info(Object.keys(res).map(lv => `niveau ${lv} : toi ${f(res[lv].me)} M$, meilleure IA ${f(res[lv].best)} M$, IA cumulées ${f(res[lv].sum)} M$, rang ${res[lv].rank.join('/')}`).join(' ; '));
  t.check('les IA valent davantage à mesure que le niveau monte (somme des IA, niveaux 2 < 4 < 8)', res[2].sum < res[4].sum && res[4].sum < res[8].sum, `${f(res[2].sum)} < ${f(res[4].sum)} < ${f(res[8].sum)} M$`);
  t.check('au niveau 8, la meilleure IA vaut au moins 1,5 fois plus qu\'au niveau 4', res[8].best >= 1.5 * res[4].best, `${f(res[4].best)} -> ${f(res[8].best)} M$`);
  t.check('rang du joueur au niveau 2 meilleur ou égal à celui du niveau 8', res[2].rank[0] <= res[8].rank[0], `${res[2].rank[0]} vs ${res[8].rank[0]}`);
};
