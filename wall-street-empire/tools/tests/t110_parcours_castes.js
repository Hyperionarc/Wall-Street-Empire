// Responsable Jouabilité : parcours des 6 castes (tools/qa_ai/parcours_castes.js) sur le vrai build, départ « Ville de 100 000 habitants » (Round 10 M$),
// 120 jours joués par le playbook de chaque caste, sous WATCHDOG : aucune valeur non finie, aucun stock négatif, aucune erreur de page, aucun texte suspect au HUD,
// jour simulé < 400 ms ; à la fin, chaque type de bâtiment possédé s'ouvre, sa fiche n'affiche ni NaN ni undefined et sa croix la ferme.
// Puis la BOUCLE DE MAÎTRISE : le Guide du fabricant montre l'arbre complet du pain (blé → farine → pain) avec ses sources, le devis « Construire cette chaîne »
// ouvre la confirmation sans rien dépenser, la chaîne construite « s'allume » et le jalon « Première chaîne complète » tombe au journal ; sauvegarde relue.
exports.name = 'Parcours des 6 castes sous watchdog et boucle de maîtrise de la chaîne';
const Q = require('../qa_ai/parcours_castes.js');
exports.run = async (t, L) => {
  for (const caste of Q.CASTES) {
    const r = await Q.runOne({ caste, start: 'moyenne', days: 120, seed: 6100, chk: 30, fuzz: true });
    const k = r.kpi[r.kpi.length - 1] || {};
    t.info(`${caste} : jour ${k.day}, valeur ${(k.val / 1e6).toFixed(1)} M$, ${k.nb} bâtiments, ${k.msDay} ms/jour${r.inert.length ? ' · clics sans effet visible : ' + r.inert.slice(0, 3).join(' ; ') : ''}`);
    t.check(`${caste} : 120 jours sans violation d'invariant (NaN/Infinity, stock négatif, HUD) ni erreur de page`, k.day >= 120 && !r.viol.length && !r.errs.length, r.viol.concat(r.errs).slice(0, 3).join(' | '));
    t.check(`${caste} : aucun jour simulé au-delà de 400 ms`, !r.slow.length, r.slow.slice(0, 2).join(' | '));
    t.check(`${caste} : chaque fiche de bâtiment s'ouvre, sans texte suspect, et se ferme par sa croix`, r.opened > 0 && !r.ui.length, (r.ui || []).slice(0, 3).join(' | ') + ` (${r.opened} fiches)`);
  }
  // ---- boucle de maîtrise : pain de A à Z
  const pg = await L.newPage({ w: 1280, h: 860, wait: 700 }); await L.inject(pg); const ctx = pg.context();
  const g = await pg.evaluate(() => { const W = window.WSE; W.showModes(); W.startMode('round', { start: 'moyenne' }); const S = W.S; S.rs = 6100; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); S.cash = 10e6;
    W.openGuide('bread'); const gv = document.getElementById('gview'), o = { txt0: gv.innerText, port0: gv.querySelectorAll('.gmast .gport').length, own0: gv.querySelectorAll('.gmast .gok').length, btn: !!gv.querySelector('[data-g="build:bread"]'), diag: !!gv.querySelector('[data-g="tree:bread"]') };
    const nb = () => S.grid.filter((c, i) => c && c.x + c.y * W.N === i && W.TYPES[c.t] && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part').length, n0 = nb(); const c0 = S.cash; gv.querySelector('[data-g="build:bread"]').click(); const fb = document.getElementById('fabview'); o.fab = !fb.hidden; o.fabTxt = fb.innerText; o.spent0 = c0 - S.cash; o.gClosed = gv.hidden;
    o.scopes = [...fb.querySelectorAll('input[name="fabScope"]')].map(x => x.value + (x.checked ? '*' : '')); o.fabTxt2 = fb.innerText; S.cash = 60e6; const c1 = S.cash;
    const all = fb.querySelector('input[name="fabScope"][value="all"]'); all.checked = true; all.dispatchEvent(new Event('change', { bubbles: true })); const rw = fb.querySelector('#fabRaw'); o.rawDef = rw ? rw.checked : null; if (rw && !rw.checked) { rw.checked = true; rw.dispatchEvent(new Event('change', { bubbles: true })); }
    const go = fb.querySelector('[data-fab="go"]'); if (go && !go.disabled) go.click(); o.spent = c1 - S.cash; o.built = nb() - n0;
    for (let i = 0; i < 40; i++) W.step(); W.openGuide('bread'); o.txt1 = document.getElementById('gview').innerText; o.lit = !!document.querySelector('#gview .gmast.glit'); o.own1 = document.querySelectorAll('#gview .gmast .gok').length; o.port1 = document.querySelectorAll('#gview .gmast .gport').length;
    o.jal = (S.ry && S.ry.log || []).filter(x => x[1] === 'chaine').map(x => x[2]); o.chj = S.ry && S.ry.chj; o.made = S.prod.bread.made; W.save(); return o; });
  t.info(`guide avant : ${g.own0} ✓ / ${g.port0} ⚓ · après construction : ${g.own1} ✓ / ${g.port1} ⚓ · dépensé ${Math.round(g.spent / 1e3)} k$ · jalons ${JSON.stringify(g.jal)}`);
  t.check('Guide : arbre complet du pain en cascade (farine puis blé), sources « au port » au départ, bouton « Construire cette chaîne » et diagnostic par maillon', /Farine/.test(g.txt0) && /Blé/.test(g.txt0) && g.port0 >= 2 && g.own0 === 0 && g.btn && g.diag, JSON.stringify({ port0: g.port0, own0: g.own0, btn: g.btn, diag: g.diag }));
  t.check('devis : le clic ouvre la confirmation (coût total annoncé) sans rien dépenser et referme le Guide (une seule fenêtre)', g.fab && /COÛT TOTAL/i.test(g.fabTxt) && Math.abs(g.spent0) < 1 && g.gClosed, g.fabTxt.replace(/\s+/g, ' ').slice(0, 120));
  t.check('devis : trois périmètres (usine seule, chaîne principale, chaîne complète), la chaîne principale proposée par défaut ; la ferme sous son seuil de rentabilité est signalée', g.scopes.join() === 'fac,main*,all' && /seuil de rentabilité|aucune taille rentable|perdrait de l'argent/.test(g.fabTxt2), JSON.stringify(g.scopes));
  t.check('construction confirmée : la chaîne du pain est à toi (usines et ferme posées), le Guide l\'« allume » (tous les maillons ✓)', g.built >= 3 && g.lit && g.port1 === 0 && g.own1 >= 2, JSON.stringify({ built: g.built, spent: g.spent, lit: g.lit, own1: g.own1, port1: g.port1 }));
  t.check('jalons au journal : « Première chaîne complète » une seule fois, puis « Indépendant du port » après 30 jours sans import d\'usine', g.jal.filter(x => /Chaîne complète/.test(x)).length === 1 && /pain/i.test(g.jal[0]) && g.chj && g.chj.c1 > 0 && (!g.chj.ip || g.chj.ip >= g.chj.c1 + 25), JSON.stringify({ jal: g.jal, chj: g.chj }));
  await pg.close();
  const p2 = await ctx.newPage(); p2.errs = []; p2.on('pageerror', e => p2.errs.push(e.message)); await p2.goto(L.URL); await p2.waitForTimeout(800);
  const re = await p2.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); const o = { chj: S.ry && S.ry.chj }; for (let i = 0; i < 10; i++) W.step(); o.n = (S.ry.log || []).filter(x => x[1] === 'chaine').length; return o; });
  t.check('sauvegarde : jalons de chaîne relus, pas de doublon après 10 jours, 0 erreur', re.chj && re.chj.c1 === g.chj.c1 && re.n === g.jal.length && p2.errs.length === 0 && pg.errs.length === 0, JSON.stringify(re) + p2.errs.concat(pg.errs).slice(0, 2).join(' ; '));
  await ctx.close();
};
