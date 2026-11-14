// Scénarios 1 à 5 et tutoriels (passe 22) : écran de démarrage, caste, verrous, tutoriel guidé avec vrais clics, victoire / défaite,
// déblocage du suivant, sauvegarde et reprise, retour au menu, anti-frustration (Conseil), rayons (12 produits au plus).
exports.name = 'Scénarios et tutoriel';

const SPOT = `(key) => { const W = window.WSE, N = W.N, S = W.S; const T = W.TYPES[key], w = T.w || 1, h = T.h || 1; const isRoad = (x, y) => { const c = S.grid[y * N + x]; return c && c.t === 'road'; };
 const out = []; for (let y = 12; y <= 50; y++) for (let x = 12; x <= 50; x++) { if (S.grid[y * N + x]) continue; if (W.footprintError(x, y, key)) continue; let adj = false; for (let ox = -1; ox <= w; ox++) for (let oy = -1; oy <= h; oy++) { if ((ox >= 0 && ox < w) && (oy >= 0 && oy < h)) continue; if ((ox < 0 || ox >= w) && (oy < 0 || oy >= h)) continue; if (isRoad(x + ox, y + oy)) adj = true; } if (adj) out.push([x, y, Math.hypot(x - 30, y - 30)]); }
 out.sort((a, b) => a[2] - b[2]); return out.slice(0, 40); }`;

exports.run = async (t, L) => {
  const ctx = await (await L.browser()).newContext({ viewport: { width: 1280, height: 800 } });
  const pg = await L.newPage({ ctx, wait: 3600 });
  const ev = (f, a) => pg.evaluate(f, a);
  const vis = sel => pg.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && getComputedStyle(e).display !== 'none'; }, sel);
  const chooseCaste = async () => { await pg.click('[data-cview="industriel"]'); await pg.click('[data-caste="industriel"]'); await pg.waitForTimeout(300); };
  const clickPulse = async () => { const p = pg.locator('.pulse').first(); if (await p.count()) { await p.click(); await pg.waitForTimeout(200); return true; } return false; };
  const buildAt = async key => { for (const sp of await pg.evaluate(`(${SPOT})('${key}')`)) { await pg.evaluate(([x, y]) => window.WSE.centerOn(x, y), sp); await pg.waitForTimeout(100); const pt = await pg.evaluate(([x, y]) => window.WSE.tileToScreen(x, y), sp); const c0 = await ev(() => window.WSE.S.cash); await pg.mouse.click(pt.x, pt.y); await pg.waitForTimeout(200); if ((await ev(() => window.WSE.S.cash)) < c0) return sp; } return null; };

  // 1. Écran de démarrage : seul le scénario 1 est ouvert
  const cards = await ev(() => [...document.querySelectorAll('#modesel [data-mode]')].map(b => [b.dataset.mode, b.disabled]));
  t.check('écran de démarrage : round, libre et scénario 1 ouverts, scénarios 2 à 5 verrouillés', cards.length >= 7 && cards.filter(c => /^s[2-5]$/.test(c[0])).every(c => c[1]) && !cards.find(c => c[0] === 's1')[1] && !cards.find(c => c[0] === 'round')[1], JSON.stringify(cards.filter(c => c[1]).map(c => c[0])));
  await pg.locator('[data-mode="s2"]').click({ force: true, timeout: 2000 }).catch(() => {}); await pg.waitForTimeout(200);
  t.check('clic sur un scénario verrouillé : sans effet', (await vis('#modesel')) && (await ev(() => window.WSE.S.mode.k)) !== 's2', '');

  // 2. Choix du scénario puis de la caste : le temps ne court qu'après la caste
  await pg.click('[data-mode="s1"]'); await pg.waitForTimeout(1600);
  const d0 = await ev(() => ({ day: window.WSE.S.day, vis: !document.getElementById('caste').hidden }));
  t.check('caste affichée, temps à l\'arrêt (jour 0) tant que la caste n\'est pas choisie', d0.vis && d0.day === 0, JSON.stringify(d0));
  await chooseCaste(); await pg.waitForTimeout(1800);
  const d1 = await ev(() => ({ day: window.WSE.S.day, caste: window.WSE.S.caste, k: window.WSE.S.mode.k }));
  t.check('caste choisie par clics : le temps repart, scénario 1', d1.caste === 'industriel' && d1.k === 's1' && d1.day >= 1, JSON.stringify(d1));
  t.check('barre d\'objectif : scénario, jalon, temps et tutoriel visibles', await ev(() => { const o = document.getElementById('objbar').innerText; return /SCÉNARIO 1/.test(o) && /Ouvrir 3 commerces/.test(o) && /60 min/.test(o) && /Tutoriel 1\/5/.test(o); }), '');

  // 3. Verrous : l'industrie est fermée au scénario 1, l'étiquette indique le scénario d'ouverture
  await pg.click('.cat[data-c="indus"]'); await pg.click('.tool.fam[data-f="0"]');
  const lk = await ev(() => { const b = document.querySelector('#flyout .tool[data-k="f1"] small'); return b ? b.textContent : null; });
  t.check('usine verrouillée au scénario 1 : étiquette « Scénario 2 »', lk === 'Scénario 2', String(lk));
  const c0 = await ev(() => window.WSE.S.cash); const placed = await ev(() => window.WSE.place(68, 56, 'f1'));
  t.check('placer une usine au scénario 1 est refusé (pas de débit)', !placed && (await ev(() => window.WSE.S.cash)) >= c0 - 5e5, '');

  // 4. Tutoriel du scénario 1 : 5 étapes avec de vrais clics, flèche sur le bon bouton
  await ev(() => { window.WSE.setSpeed(0); });
  const tu = async () => ev(() => { const x = window.WSE.tutoCur(); return x ? x.i + 1 : 0; });
  await clickPulse();   // catégorie Commerce
  const hl1 = await ev(() => { const p = document.querySelector('.pulse'); return p ? p.dataset.f || p.dataset.c || p.dataset.k : null; });
  t.check('étape 1 : après la catégorie, la flèche désigne la famille Magasins', hl1 === '0', String(hl1));
  await clickPulse(); await clickPulse();   // famille puis Petit marché
  t.check('étape 1 : après les clics guidés le surlignage s\'éteint (outil choisi, à toi de poser sur la carte)', await ev(() => !document.querySelector('.pulse') && document.getElementById('flyout').hidden), '');
  
  t.check('étape 1 : poser un commerce valide l\'étape', (await buildAt('s1')) !== null && (await tu()) === 2, 'étape ' + (await tu()));
  await clickPulse();   // Main
  const sp = await ev(() => { const W = window.WSE; for (let i = 0; i < W.N * W.N; i++) { const c = W.S.grid[i]; if (c && c.t === 's1') return [c.x, c.y]; } });
  await ev(([x, y]) => window.WSE.centerOn(x, y), sp); await pg.waitForTimeout(150);
  const pt = await ev(([x, y]) => window.WSE.tileToScreen(x, y), sp); await pg.mouse.click(pt.x, pt.y); await pg.waitForTimeout(400);
  t.check('étape 2 : ouvrir le commerce (Main + clic) valide l\'étape', (await tu()) === 3, 'étape ' + (await tu()));
  await ev(() => window.WSE.closeBuilding()); await pg.waitForTimeout(600);
  const hl3 = await ev(() => { const p = document.querySelector('.pulse'); return p ? p.id : null; });
  t.check('étape 3 : la flèche désigne le bouton Menu', hl3 === 'pn', String(hl3));
  for (let i = 0; i < 4 && (await tu()) === 3; i++) await clickPulse();
  t.check('étape 3 : Menu > Finances > Emprunter valide l\'étape', (await tu()) === 4 && (await ev(() => window.WSE.S.loan)) > 0, 'étape ' + (await tu()));
  await pg.click('#pclose'); await pg.waitForTimeout(200);
  for (let k = 0; k < 2; k++) { for (let i = 0; i < 4; i++) { const pu = await ev(() => { const p = document.querySelector('.pulse'); return p ? p.dataset.k : null; }); if (pu === 's1') break; await clickPulse(); } await clickPulse(); await buildAt('s1'); }
  t.check('étape 4 : 3 commerces valident l\'étape', (await tu()) === 5, 'étape ' + (await tu()));
  const texte = await ev(() => document.getElementById('objbar').innerText);
  t.check('étape 5 : texte clair et bouton « Compris »', /Tutoriel 5\/5/.test(texte) && await vis('[data-ob="ok"]'), '');
  await pg.click('[data-ob="ok"]'); await pg.waitForTimeout(200);
  t.check('fin du tutoriel : plus de ligne de tutoriel', (await tu()) === 0 && !(await ev(() => /Tutoriel \d\/5/.test(document.getElementById('objbar').innerText))), '');
  const blocks = await ev(() => { const r = document.getElementById('objbar').getBoundingClientRect(); return r.bottom < 260; });
  t.check('le tutoriel reste dans la barre du haut (ne cache pas la carte)', blocks, '');

  // 5. Conseil contextuel : plus d'argent
  await ev(() => { const S = window.WSE.S; S.cash = 1000; S.loan = window.WSE.creditLimit(); S.fin = S.fin || {}; });
  const k1 = await ev(() => window.WSE.stuckInfo());
  t.check('anti-frustration : « plus d\'argent » détecté avec une explication', k1 && k1.block && /argent/i.test(k1.t), k1 && k1.t);
  await pg.click('[data-ob="tip"]'); await pg.waitForTimeout(200);
  t.check('bouton Conseil : encart affiché dans la barre d\'objectif', await vis('.ocoach'), '');
  await pg.click('[data-ob="tip"]'); await ev(() => { window.WSE.S.cash = 3e6; window.WSE.S.loan = 0; });

  // 6. Sauvegarde et reprise au milieu du scénario
  await ev(() => { const W = window.WSE; W.setSpeed(0); while (W.S.day % 5 !== 0 || W.S.day < 30) W.step(); });
  const sv = await ev(() => ({ day: window.WSE.S.day, cash: Math.round(window.WSE.S.cash), n: window.WSE.S.stats.cn.s1 || 0, k: window.WSE.S.mode.k, tdone: !!window.WSE.S.mode.f.tdone }));
  await pg.reload(); await pg.waitForTimeout(4000);
  const rl = await ev(() => ({ day: window.WSE.S.day, cash: Math.round(window.WSE.S.cash), n: window.WSE.S.stats.cn.s1 || 0, k: window.WSE.S.mode.k, tdone: !!window.WSE.S.mode.f.tdone, modes: !document.getElementById('modesel').hidden, caste: window.WSE.S.caste, obj: /SCÉNARIO 1/.test(document.getElementById('objbar').innerText) }));
  t.check('reprise après rechargement : scénario 1, jour, trésorerie, commerces, tutoriel terminé conservés', rl.k === 's1' && rl.day >= sv.day && rl.day <= sv.day + 12 && Math.abs(rl.cash - sv.cash) < 2e5 && rl.n === sv.n && rl.tdone && !rl.modes && rl.caste === 'industriel' && rl.obj, JSON.stringify([sv, rl]));
  await pg.evaluate(() => { document.getElementById('hint').hidden = true; });

  // 7. Victoire : écran, déblocage du scénario 2, bouton « Scénario suivant »
  await ev(() => { const W = window.WSE; W.setSpeed(0); W.S.cash = 80e6; W.S.noEv = true; for (let i = 0; i < 3; i++) W.step(); });
  const win = await ev(() => ({ done: window.WSE.S.mode.done, txt: document.getElementById('endscr').innerText, prog: JSON.parse(localStorage.getItem('wse-prog') || '{}') }));
  t.check('victoire du scénario 1 : écran VICTOIRE, score enregistré, scénario 2 annoncé', win.done === 'win' && /VICTOIRE/.test(win.txt) && /Scénario 2 débloqué/.test(win.txt) && win.prog.s1 > 0, JSON.stringify(win.prog));
  await pg.click('[data-end="next"]'); await pg.waitForTimeout(500);
  const n2 = await ev(() => ({ k: window.WSE.S.mode.k, day: window.WSE.S.day, caste: window.WSE.S.caste, lockHq: window.WSE.modeLocked('hq'), lockPort: window.WSE.modeLocked('port'), lockF1: window.WSE.modeLocked('f1'), tuto: window.WSE.SCN.s2.tuto.length }));
  t.check('« Scénario suivant » lance le scénario 2 : usines ouvertes, siège fermé, tutoriel de 5 étapes', n2.k === 's2' && n2.day === 0 && !n2.lockF1 && !n2.lockPort && n2.lockHq && n2.tuto === 5, JSON.stringify(n2));
  await chooseCaste(); await ev(() => window.WSE.setSpeed(0));

  // 8. Tutoriel du scénario 2 : chaque étape désigne un élément d'interface existant
  const hls = await ev(() => { const o = []; const T = window.WSE.SCN.s2.tuto; return T.map(s => s.hl ? s.hl() : null); });
  const ok2 = await ev(sels => sels.map(s => !s || !!document.querySelector(s)), hls);
  t.check('tutoriel scénario 2 : l\'étape 1 est désignée par un sélecteur valide', hls[0] && ok2[0], JSON.stringify(hls));
  await ev(() => { window.WSE.S.cash = 60e6; });
  const sp2 = await buildAt('s1'); // pas d'usine : un commerce seul
  t.check('scénario 2 : l\'étape « mine » n\'est pas validée par un commerce', (await tu()) === 1, 'étape ' + (await tu()));
  // débouché : mine sans usine ni port
  const dep = await ev(() => { const W = window.WSE, S = W.S; for (let i = 0; i < W.N * W.N; i++) { const d = S.dep[i]; if (d && d.k === 'iron' && !S.grid[i] && !W.footprintError(i % W.N, (i / W.N) | 0, 'miron')) { if (W.place(i % W.N, (i / W.N) | 0, 'miron')) return true; } } return false; });
  const k2 = await ev(() => window.WSE.stuckInfo());
  t.check('anti-frustration : mine sans usine ni port, message « pas de débouché »', dep && k2 && /débouché/.test(k2.t), k2 && k2.t);
  t.check('tutoriel scénario 2 : poser une mine valide l\'étape 1', (await tu()) >= 2, 'étape ' + (await tu()));
  // condition de victoire : 2 produits lancés
  await ev(() => { const W = window.WSE; W.S.cash = 300e6; for (let i = 0; i < 3; i++) W.step(); });
  t.check('scénario 2 : la valorisation seule ne suffit pas (2 produits requis)', (await ev(() => window.WSE.S.mode.done)) == null, '');
  await ev(() => { const W = window.WSE, ks = Object.keys(W.PRODUCTS); let n = 0; ks.forEach(k => { if (n < 2) { W.S.prod[k].st = 'on'; n++; } }); W.S.cash = 300e6; for (let i = 0; i < 3; i++) W.step(); });
  t.check('scénario 2 : 2 produits + 60 M$ de valorisation = victoire', (await ev(() => window.WSE.S.mode.done)) === 'win', '');
  await pg.click('[data-end="new"]'); await pg.waitForTimeout(300);
  const cards2 = await ev(() => [...document.querySelectorAll('#modesel [data-mode]')].map(b => [b.dataset.mode, b.disabled]));
  t.check('retour au menu : scénario 3 débloqué, 4 et 5 encore verrouillés', !cards2.find(c => c[0] === 's3')[1] && cards2.find(c => c[0] === 's4')[1] && cards2.find(c => c[0] === 's5')[1], JSON.stringify(cards2));

  // 9. Défaite au temps écoulé, jalons manqués, réessayer
  await pg.click('[data-mode="s3"]'); await pg.waitForTimeout(300); await chooseCaste(); await ev(() => window.WSE.setSpeed(0));
  const lock3 = await ev(() => ({ nuc: window.WSE.modeLocked('nuclear'), bank: window.WSE.modeLocked('bank'), hq: window.WSE.modeLocked('hq'), solar: window.WSE.modeLocked('solar'), term: (() => { window.WSE.openTerm(); return !document.getElementById('tview').hidden; })() }));
  t.check('scénario 3 : énergie et services ouverts, banque et siège fermés, bourse fermée', !lock3.nuc && !lock3.solar && lock3.bank && lock3.hq && !lock3.term, JSON.stringify(lock3));
  await ev(() => { const W = window.WSE; W.S.day = W.modeDays() - 1; W.step(); W.step(); });
  const lose = await ev(() => ({ done: window.WSE.S.mode.done, txt: document.getElementById('endscr').innerText, prog: JSON.parse(localStorage.getItem('wse-prog') || '{}') }));
  t.check('défaite : écran « OBJECTIF MANQUÉ » avec jalons manqués et bouton Réessayer', lose.done === 'lose' && /OBJECTIF MANQUÉ/.test(lose.txt) && /jalons manqués/i.test(lose.txt) && /Réessayer/.test(lose.txt), lose.txt.slice(0, 60));
  t.check('défaite : le scénario 4 reste verrouillé (pas de score pour le 3)', !lose.prog.s3, JSON.stringify(lose.prog));
  await pg.click('[data-end="retry"]'); await pg.waitForTimeout(400);
  t.check('« Réessayer » relance le scénario 3 à zéro', await ev(() => window.WSE.S.mode.k === 's3' && window.WSE.S.day === 0 && !window.WSE.S.mode.done), '');
  await chooseCaste(); await ev(() => window.WSE.setSpeed(0));

  // 10. Retour au menu depuis la partie (bouton Reset confirmé) puis annulation
  await pg.click('#rst'); await pg.click('#rst'); await pg.waitForTimeout(300);
  t.check('Reset (confirmé) : retour au menu des modes', await vis('#modesel'), '');
  await pg.click('#modesel [data-mode=""]'); await pg.waitForTimeout(200);
  t.check('Annuler : la partie en cours reste en place', !(await vis('#modesel')) && (await ev(() => window.WSE.S.mode.k)) === 's3', '');

  // 11. Scénario 4 : tutoriel bourse / OPA, verrous et 5 scénarios décrits
  await ev(() => window.WSE.startMode('s4')); await pg.waitForTimeout(200); await chooseCaste(); await ev(() => window.WSE.setSpeed(0));
  const s4 = await ev(() => ({ n: window.WSE.SCN.s4.tuto.length, step: window.WSE.tutoCur().i, hq: window.WSE.modeLocked('hq'), bank: window.WSE.modeLocked('bank'), hl: window.WSE.SCN.s4.tuto[0].hl() }));
  t.check('scénario 4 : tutoriel de 4 étapes (siège, introduction, rachat, OPA), siège et banque ouverts', s4.n === 4 && s4.step === 0 && !s4.hq && !s4.bank && /cat|tool/.test(s4.hl), JSON.stringify(s4));
  await ev(() => { window.WSE.S.cash = 80e6; window.WSE.S.noEv = true; });
  const chain = await ev(() => { const W = window.WSE; const t0 = W.SCN.s4.tuto; const seq = []; seq.push(t0[0].ok()); return seq; });
  t.check('scénario 4 : étape 1 non validée sans siège social', chain[0] === false, '');

  // 12. Rayons : 12 produits au plus par magasin
  const sl = await ev(() => { const W = window.WSE; const f = k => W.slotsN({ t: k }); return { s1: f('s1'), s2: f('s2'), s3: f('s3'), s4: f('s4') }; });
  t.check('rayons : 4 / 8 / 12 / 12 emplacements, jamais plus de 12', sl.s1 === 4 && sl.s2 === 8 && sl.s3 === 12 && sl.s4 === 12, JSON.stringify(sl));

  // 13. Aucune erreur
  t.check('0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
  await ctx.close();
};
