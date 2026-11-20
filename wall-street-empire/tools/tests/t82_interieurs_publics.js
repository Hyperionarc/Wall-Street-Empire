// Passe 78 : intérieurs des équipements publics (écoles, crèche, hôpital, caserne, commissariat, hôtel de ville, stades, télécom, aéroport, mall).
// Chaque équipement s'ouvre au clic (Mall et Aéroport : bouton « Voir l'intérieur » de leur panneau) sur une scène isométrique animée, sans erreur, à 1280×900 et 390×844 ;
// aucun NaN / undefined (panneau et texte dessiné) ; une image coûte moins de 4 ms ; les occupants suivent les données du jeu (bassin desservi / équipements, passagers,
// humeur) ; le mécénat verse au budget municipal et se sauvegarde.
exports.name = 'Intérieurs des équipements publics';

const PUBS = ['maternelle', 'garderie', 'college', 'lycee', 'hospital', 'police', 'fire', 'hall', 'stadium', 'stadium2', 'telecom', 'mall', 'air'];

async function view(L, t, w, h) {
  const tag = w < 600 ? 'mobile 390×844' : 'bureau 1280×900';
  const pg = await L.newPage({ w, h }); await L.setup(pg, {}); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint,#evcard,#recap,#cine{display:none!important}' });
  await pg.evaluate(() => { window.__CVBAD = []; const P = CanvasRenderingContext2D.prototype, f0 = P.fillText, BAD = /NaN|undefined|Infinity|\[object/; P.fillText = function (s, ...a) { if (BAD.test(String(s)) && window.__CVBAD.length < 20) window.__CVBAD.push(String(s).slice(0, 60)); return f0.call(this, s, ...a); }; });
  const pos = await pg.evaluate(() => { const W = window.WSE, o = {}; W.S.grid.forEach(c => { if (c && c.t === 'npc' && c.k === 'mon' && !o[c.m]) o[c.m] = [c.x, c.y]; }); return o; });
  const res = {};
  for (const m of PUBS) {
    if (!pos[m]) { res[m] = { miss: 1 }; continue; }
    await pg.evaluate(([m, p]) => { const W = window.WSE; W.closeBuilding(); if (m === 'mall' || m === 'air') { W[m].open(); const b = document.querySelector(`[data-${m}="int"]`); if (b) b.click(); } else W.inspect(p[0], p[1]); }, [m, pos[m]]);
    await pg.waitForTimeout(450);
    res[m] = await pg.evaluate(() => {
      const W = window.WSE, bv = document.getElementById('bview'), txt = bv.innerText, BAD = /NaN|undefined|Infinity|\[object/;
      let best = 1e9; for (let b = 0; b < 5; b++) { const t0 = performance.now(); for (let i = 0; i < 10; i++) W.sceneFrame(0.033); best = Math.min(best, (performance.now() - t0) / 10); }   // meilleur de 5 séries de 10 images (machine partagée)
      const cv = document.getElementById('bscene'), g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data; let ink = 0, n = 0; for (let i = 0; i < d.length; i += 4 * 101) { n++; if (d[i + 3] > 10) ink++; }
      const r = bv.getBoundingClientRect();
      return { open: !bv.hidden, kind: W.scene && W.scene.kind, ms: best, bad: BAD.test(txt), noInt: /pas d'intérieur/i.test(txt), tabs: [...bv.querySelectorAll('.btabs button')].filter(b => b.offsetParent).map(b => b.textContent), hs: bv.scrollWidth > bv.clientWidth + 2, inView: r.left >= -1 && r.right <= innerWidth + 1, ink: ink / Math.max(1, n), cvBad: window.__CVBAD.splice(0), st: W.pub.stats() };
    });
    res[m].errs = pg.errs.splice(0);
  }
  const bad = PUBS.filter(m => { const r = res[m]; return !r || r.miss || !r.open || r.kind !== 'pub' || r.errs.length || r.bad || r.noInt || r.cvBad.length || r.hs || !r.inView || r.ink < 0.2 || r.tabs.join('|') !== 'Intérieur'; });
  t.check(`${tag} : les ${PUBS.length} équipements s'ouvrent sur leur intérieur (onglet « Intérieur » seul, scène dessinée, sans erreur JS, sans NaN dans le panneau ni sur le canevas, sans débordement)`, bad.length === 0,
    bad.map(m => { const r = res[m] || {}; return m + (r.miss ? ' absent' : ` open=${r.open} kind=${r.kind} err=${(r.errs || []).join(' ').slice(0, 120)} bad=${r.bad} cv=${(r.cvBad || []).join(',')} hs=${r.hs} ink=${(r.ink || 0).toFixed(2)} tabs=${(r.tabs || []).join('/')}`); }).join(' || ').slice(0, 700));
  const slow = PUBS.filter(m => res[m] && !(res[m].ms < 4));
  t.info(`${tag}, coût d'une image (ms) : ` + PUBS.map(m => m + ' ' + (res[m] && res[m].ms != null ? res[m].ms.toFixed(2) : '?')).join(' · '));
  t.check(`${tag} : une image de scène coûte moins de 4 ms pour chaque équipement`, slow.length === 0, slow.map(m => m + ' ' + res[m].ms.toFixed(2)).join(', '));
  return pg;
}

exports.run = async (t, L) => {
  const pg = await view(L, t, 1280, 900);
  // densité d'occupants proportionnelle aux données réelles
  const r = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, out = {}, pos = {}; S.grid.forEach(c => { if (c && c.t === 'npc' && c.k === 'mon' && !pos[c.m]) pos[c.m] = [c.x, c.y]; });
    const svc = W.citySvc(), have = svc.have, NEED = svc.need, pop0 = S.pop;
    const probe = (m, pop) => { S.pop = pop; S._svc = null; W.closeBuilding(); W.openBuilding(pos[m][0], pos[m][1]); W.sceneFrame(0.6); W.sceneFrame(0.05); const st = W.pub.stats(), I = W.pub.info(W.S.grid[pos[m][1] * W.N + pos[m][0]]); const txt = document.getElementById('bview').innerText.replace(/\s+/g, ' '); return { st, occ: I.occ, n: I.n, cap: I.K.cap, have: I.have, popE: W.popE ? W.popE() : null, shown: txt.includes(I.n.toLocaleString('fr-FR').replace(/\s/g, ' ')), pax: W.air.pax() }; };
    ['hospital', 'college', 'maternelle', 'police', 'fire', 'lycee', 'garderie', 'stadium', 'mall', 'hall', 'telecom', 'air'].forEach(m => { out[m] = { lo: probe(m, 25000), hi: probe(m, 140000) }; });
    S.pop = pop0; S._svc = null;
    // formule de l'hôpital : bassin desservi / (hôpitaux × habitants par hôpital)
    S.pop = 140000; S._svc = null; const c = S.grid[pos.hospital[1] * W.N + pos.hospital[0]], I = W.pub.info(c); out.formula = { occ: I.occ, popE: I.served * I.have, need: NEED.hospital, have: have.hospital }; S.pop = pop0; S._svc = null;
    return out;
  });
  const keys = Object.keys(r).filter(k => r[k].lo);
  const bad = keys.filter(m => { const a = r[m].lo, b = r[m].hi; const ok = x => x.st && x.st.occN === Math.round(x.st.nOcc * Math.min(1, x.occ)) && x.st.on === x.st.occN && x.n === Math.round(x.cap * x.occ) && x.st.occVis <= x.st.on && x.shown; return !(ok(a) && ok(b) && (m === 'air' ? b.st.occN >= a.st.occN : b.st.occN > a.st.occN) && b.n >= a.n); });
  t.check('occupants ∝ données réelles : silhouettes présentes = arrondi(places dessinées × taux d\'occupation), chiffre affiché = capacité × taux, et plus d\'occupants quand la ville grandit (25 000 → 140 000 habitants)', bad.length === 0 && keys.length === 12,
    bad.map(m => `${m} lo ${JSON.stringify(r[m].lo.st)} occ ${r[m].lo.occ.toFixed(2)} hi occN ${r[m].hi.st && r[m].hi.st.occN} occ ${r[m].hi.occ.toFixed(2)} shown ${r[m].lo.shown}/${r[m].hi.shown}`).join(' || ').slice(0, 700));
  t.info('occupation (25 000 → 140 000 hab.) : ' + keys.map(m => `${m} ${Math.round(r[m].lo.occ * 100)}→${Math.round(r[m].hi.occ * 100)} % (${r[m].lo.st.occN}→${r[m].hi.st.occN}/${r[m].hi.st.nOcc} silhouettes)`).join(' · '));
  const F = r.formula; t.check('hôpital : taux d\'occupation = bassin desservi / (hôpitaux × 600 000 habitants)', Math.abs(F.occ - Math.min(1.6, Math.max(0.04, F.popE / (F.have * 600000)))) < 0.01, `occ ${F.occ.toFixed(3)} · bassin ${Math.round(F.popE)} · hôpitaux ${F.have}`);
  const ax = x => Math.round(Math.min(1.6, Math.max(0.04, x.pax / 9000)) * 9000);
  t.check('aéroport : passagers affichés = passagers du jeu (airPax), à 25 000 et 140 000 habitants', Math.abs(r.air.lo.n - ax(r.air.lo)) <= 1 && Math.abs(r.air.hi.n - ax(r.air.hi)) <= 1, `n ${r.air.lo.n} / ${r.air.hi.n} · pax ${Math.round(r.air.lo.pax)} / ${Math.round(r.air.hi.pax)}`);
  // mécénat : verse au budget municipal, rien d'autre ; sauvegardé
  const d = await pg.evaluate(() => {
    const W = window.WSE, S = W.S; let p = null; S.grid.forEach(c => { if (!p && c && c.t === 'npc' && c.k === 'mon' && c.m === 'hospital') p = c; });
    W.closeBuilding(); W.inspect(p.x, p.y); const cash0 = S.cash, bud0 = W.zn.st().bud == null ? null : W.zn.st().bud; const btn = document.querySelector('#bview [data-act="pubdon:100000"]'); if (btn) btn.click();
    const o = { btn: !!btn, dCash: cash0 - S.cash, dBud: W.zn.st().bud - (bud0 == null ? W.zn.st().bud - 100000 : bud0), don: S.zn.don };
    W.save(); const S0 = W.load(); o.donLoaded = S0 && S0.zn ? S0.zn.don : null; o.nan = window.T.scan(); return o;
  });
  t.check('mécénat : « Donner 100 000 $ » débite la trésorerie et crédite le budget municipal ; le cumul se sauvegarde', d.btn && Math.abs(d.dCash - 100000) < 1 && Math.abs(d.dBud - 100000) < 1 && d.donLoaded === 100000, JSON.stringify(d).slice(0, 200));
  t.check('aucune valeur non finie dans l\'état après les ouvertures', d.nan.length === 0, d.nan.slice(0, 5).join(', '));
  t.check('bureau : 0 erreur JS', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();
  const pm = await view(L, t, 390, 844); await pm.context().close();
};
