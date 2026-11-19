// Passe 35 : ville de départ (petite ville d'environ 100 000 habitants) et croissance urbaine jusqu'à un million d'habitants (modèle à la SimCity).
// Passe 60 : villes de plusieurs millions d'habitants (niveaux de ville, extension sur toute la terre ferme, tours jusqu'à 96 étages, emplois et services proportionnés) :
// passif ≈ 1 M vers le jour 5 000 et 1,2 à 3,2 M au jour 7 200, actif 3 à 7,5 M (bornes mises à jour d'après les mesures, voir docs/VILLE_MILLIONS.md).
// Départ lisible (centre, quartiers, périphérie, terrain libre), économie de départ inchangée (bassin de consommation), anciennes sauvegardes intactes,
// croissance passive (250-420 k en 7 200 jours) et active (600 k-1,2 M), niveaux de densité, extension de la zone, jalons, indicateurs, sauvegarde, performances.
exports.name = 'Ville : petite ville de départ et croissance';

// passe 45 : les 100 cases du grand mall (bloc 10×10 au centre) sont comptées à part ; le « centre » devient l'anneau de quartiers autour du mall (moins de 11,5 cases du centre), la périphérie commence à 16 cases
const SCAN = `(() => { const W = window.WSE, S = W.S, N = W.N; const o = { house: 0, res: 0, off: 0, park: 0, mon: 0, mall: 0, lm: 0, max: 0, cx: 0, nx: 0, px: 0, np: 0, lots: 0, free: 0, n: 0 }; const M = W.mall && W.mall.pos(), big = !!M && M.w >= 10;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const c = S.grid[y * N + x]; if (!c || c.t !== 'npc') continue; if (c.k === 'mon' && c.m === 'mall') { o.mall++; continue; } if (c.m === 'air') continue; o.n++; o[c.k]++; if (c.k === 'mon') (o.monK || (o.monK = {}))[c.m] = 1; if (c.lm) o.lm++; if (c.floors > o.max) o.max = c.floors;
    const d = Math.hypot(x - 30, y - 30); if (c.k === 'res' || c.k === 'off' || c.k === 'house') { if (d < (big ? 11.5 : 7)) { o.cx += c.floors; o.nx++; } else if (d > (big ? 16 : 12)) { o.px += c.floors; o.np++; } } }
  o.monN = Object.keys(o.monK || {}).length; const sc = S.cg && S.city ? S.city : {}; o.lots = sc.lots || 0; o.free = sc.free || 0; return o; })()`;

exports.run = async (t, L) => {
  // ---- 1. Ville de départ
  let pg = await L.newPage({ wait: 700 }); await L.setup(pg, { caste: 'industriel', cash: 5e9 }); await L.inject(pg);
  await pg.evaluate('window.WSE.refreshStats(); window.WSE.step();');
  const a = await pg.evaluate(SCAN);
  const st = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.refreshStats(); return { pop: S.pop, bs: S.bassin, cv: S.cityV, jobs: S.stats.jobs, wf: S.stats.workforce, unemp: S.stats.unemp, cap: S.stats.cap, popE: W.mall.popE(), hudPop: document.getElementById('vPop').textContent, hudSub: document.getElementById('vPopSub').textContent, free: S.city && S.city.free, lots: S.city && S.city.lots }; });
  // passe 44 : ville de départ aérée (CITY_D0 = 0,6) : ≈ 60 000 habitants au lieu de ≈ 100 000 ; l'économie de départ est conservée par la région du bassin (S.bx)
  t.range('départ : population (petite ville aérée, passe 44)', st.pop, 50000, 75000, ' hab.', 0);
  t.check('départ : nouvelle ville de la passe 35 (S.cityV = 2) avec bassin de consommation', st.cv === 2 && st.bs > 2.5 && st.bs < 3.2, `cityV ${st.cv} · bassin ${st.bs}`);
  t.range('départ : économie équivalente à celle de l\'ancienne ville (habitants x bassin + région)', st.popE / 1000, 270, 310, ' k', 0);
  t.range('départ : rapport emplois / actifs comme avant (0,80 à 0,95)', st.jobs / st.wf, 0.8, 0.95, '', 2);
  t.range('départ : chômage de départ inchangé (5 à 14 %)', st.unemp * 100, 5, 14, ' %');
  // barème des tailles (b3d94df) : les équipements publics occupent plusieurs cases (hôpital 3×3, lycée 3×2, collège, stades et mairie 2×2), chaque case
  // étant une cellule « mon » : on compte les 11 équipements distincts (c.m) et non plus les cases (36 cases pour 11 équipements)
  t.check('départ : maisons, immeubles, bureaux, parcs et équipements publics présents', a.house >= 80 && a.res >= 60 && a.off >= 20 && a.off <= 80 && a.park >= 8 && a.monN === 11 && a.mall === 100, JSON.stringify({ house: a.house, res: a.res, off: a.off, park: a.park, equipements: a.monN, casesEquip: a.mon, mall: a.mall }));
  t.check('départ : bâtiments bas (aucune tour de plus de 20 étages, aucun repère de 54-66 étages)', a.max <= 20 && a.lm === 0, `plus haut ${a.max} étages`);
  t.check('départ : moins de 400 bâtiments PNJ (tous bas)', a.n <= 400, a.n + ' bâtiments');
  t.check('départ : beaucoup de terrain libre (au moins 40 % des lots)', st.lots > 0 && st.free / st.lots >= 0.4, `${st.free} lots libres sur ${st.lots}`);
  t.check('départ : tissu urbain lisible (centre nettement plus haut que la périphérie)', a.nx > 10 && a.np > 10 && a.cx / a.nx > 2 * a.px / a.np, `centre ${(a.cx / a.nx).toFixed(1)} étages · périphérie ${(a.px / a.np).toFixed(1)}`);
  t.check('départ : le HUD affiche la taille de la ville', /Petite ville/.test(st.hudSub) && /\d/.test(st.hudPop), st.hudSub);
  // indicateurs dans l'Empire
  const emp = await pg.evaluate(() => { const W = window.WSE; W.setPanelTab && W.setPanelTab('empire'); const b = document.querySelector('[data-ptab="empire"]'); if (b) b.click(); const p = document.getElementById('pn'); if (p && document.getElementById('panel').hidden) p.click(); W.step(); return document.getElementById('empire') ? document.getElementById('empire').innerText : ''; });
  t.check('Empire : bloc « La ville » (taille, remplissage, densité, demandes de logements et d\'emplois)', /LA VILLE · PETITE VILLE/i.test(emp) && /Remplissage des logements/i.test(emp) && /Densité/i.test(emp) && /Demande de logements/i.test(emp) && /Demande d'emplois/i.test(emp), emp.slice(emp.indexOf('LA VILLE'), emp.indexOf('LA VILLE') + 80).replace(/\s+/g, ' '));
  t.check('départ : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(';'));
  await pg.context().close();

  // ---- 2. Croissance passive : la ville croît seule, plus lentement
  pg = await L.newPage({ wait: 600 }); await L.setup(pg, { caste: 'industriel', cash: 5e9 }); await L.inject(pg);
  const P = await pg.evaluate(() => { const W = window.WSE, S = W.S, T = window.T, out = [], t0 = performance.now(); let ms = 0, bad = 0; const sn = [];
    for (let d = 0; d < 7200; d++) { W.step(); if (S.day % 600 === 0) { out.push(Math.round(S.pop)); if (S.day % 1200 === 0) { const b = T.scan(); bad += b.length; } } }
    const c = S.city, mk = {}; S.grid.forEach(q => { if (q && q.t === 'npc' && q.k === 'mon' && q.m !== 'mall' && q.m !== 'air') mk[q.m] = 1; });
    return { out, ms: (performance.now() - t0) / 7200, bad, ms2: S.cg.ms, ext: (S.cityExt || []).length, lv: c.lv, top: c.top, free: c.free, lots: c.lots, hud: document.getElementById('vPopSub').textContent, ev: (S._sayBuf || []).join(' | '),
      mons: Object.keys(mk).length, cov: W.citySvcCov ? W.citySvcCov() : -1, bs: W.mall.popE() / S.pop, jr: c.jobsRatio, name: c.name }; });
  const pp = P.out;
  // passe 60 (priorité 3 de Rémy : villes de plusieurs millions d'habitants) : rythme par niveau de ville (CG_R0 5,6e-5 -> 2e-4, plafond logistique 1 M -> 5 M), extension sur
  // toute la terre ferme, tours jusqu'à 96 étages. Mesuré avant / après sur ce scénario (tools/city_growth.js) : passif 206 k -> ≈ 2,2 M au jour 7 200, ≈ 1 M vers le jour 4 800
  // (avant : 160 k au jour 5 400). Bornes : 1 M vers le jour 5 000 en passif (0,6 à 1,5 M au jour 4 800), 1,2 à 3,2 M au jour 7 200.
  t.range('passif : population au jour 4 800 (cap du million vers le jour 5 000)', pp[7] / 1000, 600, 1500, ' k', 0);
  t.range('passif : population après 7 200 jours', pp[pp.length - 1] / 1000, 1200, 3200, ' k', 0);
  t.check('passif : la ville croît en continu (jamais de recul de plus de 3 % entre deux mesures)', pp.every((v, i) => i === 0 || v >= pp[i - 1] * 0.97) && pp[pp.length - 1] > 2 * pp[0], pp.map(v => Math.round(v / 1000)).join(' '));
  // barème des tailles : les équipements multi-cases prennent 25 lots centraux de plus (dont les mieux placés) ; mesuré sur le même scénario avant/après
  // le barème : population 193 k / 192 k, niveaux 29/172/148/18/0/0 -> 25/178/133/27/0/0 (plus de tours), plus haut 16 -> 14 étages (le lot central le
  // plus haut est désormais un équipement). La densification n'a pas reculé : seuil du plus haut ramené de 15 à 13 étages (toujours « plus de 10 »).
  t.check('passif : se densifie par niveaux (tours, grandes tours, supertours de 60 étages ou plus au centre)', P.lv[3] > 200 && P.lv[4] > 30 && P.lv[5] > 5 && P.top >= 60 && P.top <= 96, `niveaux ${P.lv.join('/')} · plus haut ${P.top} étages`);
  t.check('passif : taille de la ville affichée (Mégalopole ou Mégapole)', /Mégalopole|Mégapole/.test(P.name) && /Mégalopole|Mégapole/.test(P.hud), P.name + ' · ' + P.hud);
  t.check('passif : services publics proportionnés (équipements ajoutés, couverture d\'au moins 90 %)', P.mons > 20 && P.cov >= 0.9, `${P.mons} équipements distincts · couverture ${(P.cov * 100).toFixed(0)} %`);
  t.check('passif : emplois proportionnés (emplois / actifs 0,8 à 1)', P.jr >= 0.8 && P.jr <= 1, 'emplois / actifs ' + (+P.jr).toFixed(2));
  t.check('passif : la région ne grandit plus comme la ville (bassin effectif < 2 au-delà d\'un million)', P.bs > 1 && P.bs < 2, 'popE / habitants ' + P.bs.toFixed(2));
  // passe 44 : la ville aérée garde des lots libres plus longtemps : l'extension n'est exigée que si les lots ont manqué (moins de 14 % libres)
  t.check('passif : la zone urbaine s\'étend sur la campagne (au moins 20 blocs ajoutés)', P.ext >= 20, `${P.ext} blocs ajoutés · ${P.free} lots libres sur ${P.lots}`);
  t.check('passif : jalons de taille annoncés (au moins 7 : jusqu\'au million)', P.ms2 >= 7, 'jalons ' + P.ms2);
  t.check('passif : 0 NaN, 0 pageerror', P.bad === 0 && pg.errs.length === 0, pg.errs.slice(0, 2).join(';'));
  t.check('passif : coût de simulation raisonnable (moins de 25 ms par jour en moyenne)', P.ms < 25, P.ms.toFixed(1) + ' ms/jour');
  // sauvegarde aller-retour (ville nouvelle formule) dans le même contexte
  const ctx = pg.context();
  const s1 = await pg.evaluate(() => { const W = window.WSE, S = W.S; while (S.day % 5 !== 0) W.step(); W.save(); const o = { pop: S.pop, day: S.day, n: 0, ext: (S.cityExt || []).length, floors: 0, bs: S.bassin }; S.grid.forEach(c => { if (c && c.t === 'npc') { o.n++; o.floors += c.floors; } }); o.svc = JSON.stringify(W.citySvc().have); return o; });
  const pg2 = await ctx.newPage(); pg2.errs = []; pg2.on('pageerror', e => pg2.errs.push(e.message)); await pg2.goto(L.URL || pg.url()); await pg2.waitForTimeout(900);
  const s2 = await pg2.evaluate(() => { const W = window.WSE, S = W.S; const o = { pop: S.pop, day: S.day, n: 0, ext: (S.cityExt || []).length, floors: 0, bs: S.bassin, cv: S.cityV, inz: 0 }; S.grid.forEach(c => { if (c && c.t === 'npc') o.n++, o.floors += c.floors; }); (S.cityExt || []).forEach(b => { if (W.inCity(b[0] * 6 + 3, b[1] * 6 + 3)) o.inz++; }); o.svc = JSON.stringify(W.citySvc().have); o.bad = W.fp.audit().length; return o; });
  t.check('sauvegarde : ville, extensions, équipements ajoutés, population et bassin identiques après rechargement', s2.cv === 2 && s2.n === s1.n && s2.floors === s1.floors && s2.ext === s1.ext && s2.inz === s2.ext && Math.abs(s2.pop - s1.pop) < 1 && s2.day === s1.day && s2.bs === s1.bs && s2.svc === s1.svc && s2.bad === 0 && pg2.errs.length === 0, JSON.stringify({ avant: s1, apres: s2 }));
  // ancienne sauvegarde : on retire les champs de la passe 35 d'une sauvegarde actuelle et on la charge dans un contexte neuf (la ville de 288 000 habitants est régénérée)
  const raw = await pg2.evaluate(() => localStorage.getItem('wse-city-v8'));
  await pg2.context().close();
  const d = JSON.parse(raw); ['cv', 'bs', 'cext', 'cg', 'cty'].forEach(k => delete d[k]); d.pop = 288533; d.day = 0; d.built = []; d.npcMods = []; d.jpf = 74.28177127659576;
  const b = await L.browser(), ctx2 = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx2.addInitScript(v => { try { if (!localStorage.getItem('wse-city-v8')) localStorage.setItem('wse-city-v8', v); } catch (e) {} }, JSON.stringify(d));
  const pg3 = await ctx2.newPage(); pg3.errs = []; pg3.on('pageerror', e => pg3.errs.push(e.message)); pg3.on('dialog', x => x.dismiss()); await pg3.goto(L.URL); await pg3.waitForTimeout(900);
  const o2 = await pg3.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; const k = { house: 0, res: 0, off: 0, park: 0, mon: 0 }; let mx = 0; S.grid.forEach(c => { if (c && c.t === 'npc') { k[c.k]++; mx = Math.max(mx, c.floors); } }); const mk = {}; S.grid.forEach(c => { if (c && c.t === 'npc' && c.k === 'mon' && c.m !== 'mall' && c.m !== 'air') mk[c.m] = 1; }); const n0 = Object.values(k).reduce((a, b) => a + b, 0);
    S.noEv = true; for (let i = 0; i < 120; i++) W.step(); const k1 = { house: 0, res: 0, off: 0, park: 0, mon: 0 }; S.grid.forEach(c => { if (c && c.t === 'npc') k1[c.k]++; }); W.refreshStats();
    return { k, mons: Object.keys(mk).length, mx, cv: S.cityV || 0, bs: S.bassin || 1, pop: S.pop, n0, n1: Object.values(k1).reduce((a, b) => a + b, 0), ext: (S.cityExt || []).length, inz: W.inCity(54, 30) }; });
  // barème des tailles : la ville régénérée d'une ancienne sauvegarde place ses équipements sur leur emprise (25 cases de plus) : mesuré avant/après
  // le barème : maisons 103 -> 98, résidences 166 -> 162, bureaux 94 -> 94, parcs 32 -> 30, 11 équipements distincts dans les deux cas
  t.check('ancienne sauvegarde : l\'ancienne ville (103 maisons, ~165 résidences, 94 bureaux, tours de 60 étages) est conservée', o2.cv === 0 && o2.bs === 1 && o2.k.house >= 95 && o2.k.house <= 103 && o2.k.res >= 156 && o2.mons === 11 && o2.k.off >= 90 && o2.mx >= 60 && o2.pop > 280000 && o2.pop < 320000, JSON.stringify(o2));
  t.check('ancienne sauvegarde : pas de nouveau modèle de croissance (aucun lot construit, pas d\'extension)', o2.ext === 0 && !o2.inz && o2.n1 <= o2.n0 + 4 && pg3.errs.length === 0, `${o2.n0} -> ${o2.n1} bâtiments ${pg3.errs.slice(0, 2).join(';')}`);
  await ctx2.close();

  // ---- 3. cityExtend(x, y) : extension manuelle de la zone urbaine
  pg = await L.newPage({ wait: 600 }); await L.setup(pg, { caste: 'industriel', cash: 5e9 }); await L.inject(pg);
  const X = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N; const f = W.cityExtend; if (!f) return { err: 'cityExtend non exposée' };
    const oks = []; for (let bx = 1; bx <= 9; bx++) for (let by = 1; by <= 8; by++) if (W.cityBlockState(bx, by) === 'ok') oks.push([bx, by]);
    if (oks.length < 2) return { err: 'moins de 2 blocs extensibles : ' + oks.length };
    const iso = (() => { for (let bx = 1; bx <= 9; bx++) for (let by = 1; by <= 8; by++) if (W.cityBlockState(bx, by) === 'isole') return [bx, by]; return null; })();
    const [bx, by] = oks[0], [cx, cy] = oks[oks.length - 1], res = { n: oks.length, ok: oks.slice(0, 6).join(' ') };
    res.far = f(90, 90); res.iso = iso ? f(iso[0] * 6 + 3, iso[1] * 6 + 3) : false;
    const oc = cy * N + cx * 6 + 3; S.grid[oc] = { t: 'res', x: cx * 6 + 3, y: cy * 6, w: 1, h: 1, floors: 1 }; S.grid[cy * 6 * N + cx * 6 + 2] = { t: 'res', x: cx * 6 + 2, y: cy * 6, w: 1, h: 1, floors: 1 };
    res.occ = f(cx * 6 + 3, cy * 6 + 3); S.grid[oc] = null; S.grid[cy * 6 * N + cx * 6 + 2] = null;
    const mid = [bx * 6 + 3, by * 6 + 3];
    res.ok = f(mid[0], mid[1]);
    res.after = { inC: W.inCity(mid[0], mid[1]), zone: W.ZONE[mid[1] * N + mid[0]], cityx0: W.CITY.x0, cityy0: W.CITY.y0, road: !!(S.grid[by * 6 * N + mid[0]] && S.grid[by * 6 * N + mid[0]].t === 'road') || !!(S.grid[mid[1] * N + bx * 6] && S.grid[mid[1] * N + bx * 6].t === 'road'), place: !W.footprintError(mid[0], mid[1], 'res'), twice: f(mid[0], mid[1]), ext: (S.cityExt || []).length };
    return res; });
  t.check('cityExtend : refuse l\'hors-carte, le bloc isolé et le bloc occupé ; accepte un bloc voisin de la ville', !X.err && !X.far && !X.iso && !X.occ && X.ok, JSON.stringify(X));
  t.check('cityExtend : le bloc devient zone urbaine (construction autorisée, avenues créées), pas deux fois', !X.err && X.after.inC && X.after.zone === 1 && X.after.road && X.after.place && !X.after.twice && X.after.ext === 1, JSON.stringify(X.after));
  t.check('cityExtend : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(';'));
  await pg.context().close();

  // ---- 4. Joueur actif (bot riche) : passe 60, la ville dépasse 3 millions d'habitants (avant : 600 000 à 1,2 million) ; promoteurs et immeubles les plus hauts
  pg = await L.newPage({ wait: 600 }); await L.setup(pg, { caste: 'industriel', cash: 2e9 }); await L.injectBot(pg);
  const A = await pg.evaluate(() => { const W = window.WSE, S = W.S, out = []; let ms = 0, mx = 0;
    while (S.day < 7200) { const t0 = performance.now(); for (let j = 0; j < 4; j++) W.step(); window.BOT.tick(); const dt = performance.now() - t0; ms += dt; if (dt > mx) mx = dt; if (S.day % 600 === 0 && out.length < Math.floor(S.day / 600)) out.push(Math.round(S.pop)); }
    const g0 = performance.now(); for (let i = 0; i < 20; i++) { S.cg.acc = 0; W.cityGrow(); } const gms = (performance.now() - g0) / 20; const c = S.city; return { out, ms: ms / S.day, mx, gms, ext: c.ext, lv: c.lv, top: c.top, lots: c.lots, free: c.free, ms2: S.cg.ms, occ: c.occ, attr: c.attr, jr: c.jobsRatio, svc: W.citySvc(), bad: W.fp.audit().length }; });
  const aa = A.out;
  // passe 60 : mesuré avant / après (tools/city_growth.js, bot riche) : 730 k -> ≈ 5,3 M au jour 7 200, le million vers le jour 2 900 (avant : jamais) ; avec le bot de ce test
  // (plus actif) : 6,3 M au jour 7 200. Borne haute 7,5 M : la carte pleine loge ≈ 6 à 8 M d'habitants à 96 étages au plus.
  t.range('actif : population après 7 200 jours (plusieurs millions)', aa[aa.length - 1] / 1000, 3000, 7500, ' k', 0);
  t.check('actif : plus vite que le joueur passif (jour 3 000 et jour 7 200)', aa[4] > 1.8 * pp[4] && aa[aa.length - 1] > 1.5 * pp[pp.length - 1], `jour 3 000 : ${Math.round(aa[4] / 1000)} k contre ${Math.round(pp[4] / 1000)} k · jour 7 200 : ${Math.round(aa[aa.length - 1] / 1000)} k contre ${Math.round(pp[pp.length - 1] / 1000)} k`);
  t.check('actif : grandes tours et supertours (niveaux 4 et 5) en nombre, 90 étages ou plus, jamais plus de 96', A.lv[4] > 200 && A.lv[5] > 100 && A.top >= 90 && A.top <= 96, `niveaux ${A.lv.join('/')} · plus haut ${A.top}`);
  t.check('actif : tous les jalons annoncés jusqu\'à 2,5 millions (au moins 8)', A.ms2 >= 8, 'jalons ' + A.ms2);
  t.check('actif : emplois proportionnés (emplois / actifs 0,8 à 1) et services publics suivis (couverture ≥ 85 %)', A.jr >= 0.8 && A.jr <= 1 && A.svc.cov >= 0.85, 'emplois / actifs ' + (+A.jr).toFixed(2) + ' · ' + JSON.stringify(A.svc.have) + ' · couverture ' + (A.svc.cov * 100).toFixed(0) + ' %');
  t.check('actif : aucune emprise qui se chevauche (équipements ajoutés au barème)', A.bad === 0, A.bad + ' anomalies');
  t.check('actif : performances à plusieurs millions d\'habitants (jour simulé < 40 ms en moyenne, pic < 1,5 s, pas de croissance urbaine > 30 ms)', A.ms < 40 && A.mx < 1500 && A.gms < 30, `${A.ms.toFixed(1)} ms/jour, pic ${A.mx.toFixed(0)} ms, croissance ${A.gms.toFixed(1)} ms`);
  t.check('actif : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(';'));
  t.info('courbe active : ' + aa.map(v => Math.round(v / 1000) + 'k').join(' ') + ' | passive : ' + pp.map(v => Math.round(v / 1000) + 'k').join(' '));
  await pg.context().close();
};
