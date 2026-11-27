// Économie de marché, lot 6 (Rémy : le cycle économique, à notre façon ; tableau de bord de l'économie).
//  1. libellés de phase : reprise, expansion, pic, récession (dépression si profonde), lus par le moteur (cycPhase) ;
//  2. sur cinq ans de jeu (600 jours, une année = 120 jours), la phase change et le chômage varie : il monte en récession (loi d'Okun), il n'est plus collé au plancher ;
//  3. Engel : la récession fait baisser la demande de luxe bien plus que celle de base ; le pain se mange toujours ; la reprise relève le luxe ;
//  4. tableau de bord dans Ville / Économie : phase, PIB, chômage, taux, inflation, crédit, immobilier, stocks ; déterministe (hash, même partie, mêmes chiffres).
exports.name = 'Cycle économique : phases, chômage, Engel, tableau de bord';
exports.run = async (t, L) => {
  const go = async () => { const pg = await L.newPage({ wait: 600 }); await L.inject(pg);
    const r = await pg.evaluate(() => { const W = window.WSE; W.startMode('round', { start: 'moyenne' }); const S = W.S; S.rs = 7001; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0);
      ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
      const C = W.eco.cyc, m = S.macro || (W.step(), S.macro), sh = C.shape(m.phase, m), base = 2 * Math.PI * sh.n, lab = {};
      [[0.05, 'reprise'], [0.4, 'expansion'], [1 - sh.r - 0.03, 'pic'], [1 - sh.r / 2, sh.deep ? 'depression' : 'recession']].forEach(([x, k]) => { const ph0 = m.phase, g0 = m.gdp; m.boom = 0; m.phase = base + 2 * Math.PI * x; if (k === 'recession' || k === 'depression') m.gdp = -0.02; lab[k] = C.phase().k; m.phase = ph0; m.gdp = g0; });
      m.boom = 0; m.phase = base + 2 * Math.PI * (1 - sh.r - 0.2);   // ≈ 230 jours avant la récession
      const rows = []; for (let d = 0; d < 600; d++) { W.step(); const dm = S._dw.dem; rows.push([C.phase().k, S.stats.unemp, dm.basic, dm.lux, W.eco.dem('bread') / W.popE(), S.macro.gdp]); }
      document.getElementById('panel').hidden = false; let dash = ''; try { dash = W.eco.dash(); } catch (e) { dash = 'ERR ' + e.message; }
      return { lab, rows, dash: /Phase du cycle/.test(dash) && /Chômage/.test(dash) && /Taux directeur/.test(dash) && /Crédit/.test(dash) && /Indice immobilier/.test(dash) && /stocks/.test(dash), dashTxt: dash.replace(/<[^>]+>/g, ' ').slice(0, 300) }; });
    r.errs = pg.errs.slice(0, 3); await pg.context().close(); return r; };
  const a = await go(), b = await go();
  t.check('libellés de phase corrects (reprise, expansion, pic, récession ou dépression)', a.lab.reprise === 'reprise' && a.lab.expansion === 'expansion' && a.lab.pic === 'pic' && (a.lab.recession === 'recession' || a.lab.depression === 'depression'), JSON.stringify(a.lab));
  const by = k => a.rows.filter(r => r[0] === k || (k === 'recession' && r[0] === 'depression')), avg = (v, j) => v.reduce((s, r) => s + r[j], 0) / Math.max(1, v.length);
  const ks = [...new Set(a.rows.map(r => r[0]))], un = a.rows.map(r => r[1]), E = by('expansion').concat(by('pic')), R = by('recession'), Q = by('reprise');
  t.check('sur cinq ans, le cycle passe par plusieurs phases dont une récession', ks.length >= 3 && R.length > 10, ks.join(', ') + ` (${R.length} jours de récession)`);
  t.check('le chômage varie (au moins 1,5 point d\'amplitude)', Math.max(...un) - Math.min(...un) >= 0.015, `${(100 * Math.min(...un)).toFixed(1)} % → ${(100 * Math.max(...un)).toFixed(1)} %`);
  const uR = Math.max(...R.map(r => r[1])), uE = avg(E, 1);
  t.check('le chômage monte en récession', uR > uE + 0.01, `expansion ${(100 * uE).toFixed(1)} %, pointe en récession ${(100 * uR).toFixed(1)} %`);
  const lE = avg(E.slice(-60), 3), lR = Math.min(...R.map(r => r[3])), bE = avg(E.slice(-60), 2), bR = Math.min(...R.map(r => r[2])), dl = lR / lE - 1, db = bR / bE - 1;
  t.check('Engel : en récession la demande de luxe baisse bien plus que celle de base', dl < 2 * db - 0.02 && dl < -0.03, `luxe ${(100 * dl).toFixed(1)} %, base ${(100 * db).toFixed(1)} %`);
  const pE = avg(E.slice(-60), 4), pR = Math.min(...R.map(r => r[4]));
  t.check('on mange toujours du pain : besoin par habitant presque inchangé en récession (> −5 %)', pR / pE - 1 > -0.05, `${pE.toFixed(3)} → ${pR.toFixed(3)} baguette/hab./j`);
  const lQ = Q.length ? Math.max(...Q.map(r => r[3])) : null;
  t.check('la reprise relève la demande de luxe', lQ != null && lQ > lR * 1.03, lQ != null ? `${Math.round(lR)} → ${Math.round(lQ)}` : 'pas de reprise sur la période');
  t.check('tableau de bord Ville / Économie : phase, PIB, chômage, taux, crédit, immobilier, stocks', a.dash, a.dashTxt);
  t.check('déterminisme : mêmes phases jour par jour d\'une partie à l\'autre (cycle tiré par hash)', JSON.stringify(a.rows.map(r => r[0])) === JSON.stringify(b.rows.map(r => r[0])), '');
  const errs = a.errs.concat(b.errs); t.check('0 erreur de page', errs.length === 0, errs.slice(0, 3).join(' | '));
};
