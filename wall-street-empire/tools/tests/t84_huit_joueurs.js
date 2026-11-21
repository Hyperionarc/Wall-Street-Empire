// Passe 80 : parties à 8 joueurs (les 6 castes + 2 sièges supplémentaires, réglage « Nombre de concurrents » = Très élevé = 7 IA).
// Vérifie sur 3 graines : composition (5 IA de caste + 2 doublons de caste aux noms distincts, 6 sièges de caste, 2 sièges supplémentaires),
// le bot « bon joueur » joue 500 jours, temps moyen d'un jour simulé < 40 ms, aucune valeur non finie, classement à 8, sauvegarde et rechargement.
exports.name = 'Parties à 8 joueurs : composition, performance, sauvegarde';
exports.run = async (t, L) => {
  for (const seed of [6000, 7000, 8000]) {
    const pg = await L.newPage({ wait: 500 }); await L.inject(pg); await L.injectBot(pg);
    const a = await pg.evaluate(seed => {
      const W = window.WSE; W.startMode('round'); const S = W.S; S.rs = seed; S.opt = Object.assign(S.opt || {}, { n: 4 }); W.setCaste('industriel'); W.setSpeed(0); if (S.mode) delete S.mode.await;
      ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
      const o = { n: S.rivals.length, castes: S.rivals.map(r => r.caste || ('+' + r.sty)), names: S.rivals.map(r => r.name), seats: W.seats.list().length, extra: W.seats.extra().map(x => x.sty), players: W.seats.players() };
      const B = window.BOT; Object.assign(B.P, { lev: 0.45, idle: 0, hurdle: 0.05, fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false });
      let ms = 0, mx = 0, n = 0;
      for (let d = 0; d < 500 && !S.mode.done; d++) { const t0 = performance.now(); W.step(); const dt = performance.now() - t0; if (d >= 100) { ms += dt; n++; mx = Math.max(mx, dt); } if (d % 4 === 3) B.tick(); }
      o.ms = ms / Math.max(1, n); o.mx = mx; o.day = S.day; o.bad = window.T.scan(); o.rank = W.rankPlayers(); o.val = W.valuation();
      o.rivV = S.rivals.map(r => W.riv.value(r)); o.extraAct = S.rivals.filter(r => !r.caste).map(r => (r.acts || 0) + (r.fab || []).length);
      W.save(); const d = JSON.parse(localStorage.getItem('wse-city-v8')); o.saved = (d.rivals || []).filter(r => r.sty).length; o.json = JSON.stringify(d); return o;
    }, seed);
    const want = ['agriculteur', 'banquier', 'negociant', 'promoteur', 'innovateur'];
    t.check(`graine ${seed} : 7 IA = 5 castes restantes + 2 sièges supplémentaires (doublons de caste)`, a.n === 7 && want.every(k => a.castes.indexOf(k) >= 0) && a.extra.length === 2 && a.extra.every(Boolean) && new Set(a.names).size === 7, a.castes.join(',') + ' | ' + a.names.join(', '));
    t.check(`graine ${seed} : 6 sièges de caste, 8 joueurs au classement`, a.seats === 6 && a.players === 8 && a.rank[1] === 8, `${a.seats} sièges, ${a.players} joueurs, rang ${a.rank.join('/')}`);
    t.range(`graine ${seed} : temps moyen d'un jour simulé (jours 100-500, bot bon joueur, 8 joueurs)`, a.ms, 0, 40, ' ms', 1);
    t.check(`graine ${seed} : aucune valeur non finie dans l'état`, a.bad.length === 0 && a.rivV.every(Number.isFinite) && Number.isFinite(a.val), a.bad.slice(0, 3).join(' '));
    t.check(`graine ${seed} : les sièges supplémentaires agissent selon leur caste (actions ou usines)`, a.extraAct.every(x => x > 0), a.extraAct.join(','));
    t.info(`graine ${seed} : jour ${a.day}, pic ${a.mx.toFixed(0)} ms, joueur ${(a.val / 1e6).toFixed(1)} M$, rivaux ${a.rivV.map(v => (v / 1e6).toFixed(0)).join(' / ')} M$`);
    if (seed === 6000) {   // rechargement de la sauvegarde
      await pg.context().addInitScript(j => { localStorage.setItem('wse-city-v8', j); }, a.json);
      await pg.reload(); await pg.waitForTimeout(700);
      const ld = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); S.noEv = true; ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
        const o = { n0: S.rivals.length, sty: S.rivals.filter(r => r.sty).length, day: S.day }; for (let i = 0; i < 20; i++) W.step(); o.n1 = S.rivals.length; o.fin = S.rivals.every(r => isFinite(W.riv.value(r))); o.players = W.seats.players(); return o; });
      t.check('sauvegarde à 8 joueurs : rechargée avec ses 7 IA et ses sièges supplémentaires', a.saved === 2 && ld.n0 === 7 && ld.sty === 2 && ld.n1 === 7 && ld.fin && ld.players === 8, JSON.stringify(ld));
    }
    t.check(`graine ${seed} : aucune erreur de page`, pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
    await pg.context().close();
  }
};
