// Rapport des garde-fous techniques du moteur libéral (bnd) et de l'oscillation des cours (docs/ECONOMIE_LIBERALE.md).
// Joue N graines × castes avec le bot (profils --native de sim_batch.js, simplifiés) et sort, pour chaque borne : part des appels où elle a mordu (en bas / en haut),
// puis les biens les plus volatils (écart-type journalier de log P, plus forte variation, plus longue série de dents de scie) et les invariants (libCheck).
// Règle de décision : une borne de classe C touchée plus de 1 % des appels en partie normale cache un mécanisme (à reclasser en B ou à élargir).
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/bnd_report.js [jours=365] [graines=2] [castes=industriel,agriculteur,negociant,banquier,promoteur,innovateur]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const DAYS = +process.argv[2] || 365, SEEDS = +process.argv[3] || 2, CASTES = (process.argv[4] || 'industriel,agriculteur,negociant,banquier,promoteur,innovateur').split(',');
const URL = process.env.WSE_URL || 'file://' + path.resolve(__dirname, '..', 'city.html'), BOT = fs.readFileSync(path.join(__dirname, 'bot_lib.js'), 'utf8');
const PLAY = { agriculteur: { play: 'agriculteur', industry: true, fam: ['fwheat', 'fsugar', 'fcotton', 'fvine', 'fcattle', 'fchicken', 'fpig', 'fsheep', 's1', 's2', 's3'] }, industriel: { play: 'industriel', industry: true }, negociant: { play: 'negociant', industry: true }, banquier: { play: 'banquier' }, promoteur: {}, innovateur: { innov: true } };
(async () => {
  const b = await chromium.launch(), agg = {}, vol = {}; let n = 0, bad = 0;
  for (let s = 1; s <= SEEDS; s++) for (const caste of CASTES) {
    const p = await b.newPage(); p.on('dialog', d => d.dismiss()); await p.goto(URL); await p.waitForTimeout(500);
    const r = await p.evaluate(([caste, seed, D, src, pl]) => {
      const W = window.WSE; W.showModes(); W.startMode('round'); const S = W.S; S.rs = seed; S.noEv = false; W.setCaste(caste); W.setSpeed(0);
      ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
      (0, eval)(src); Object.assign(window.BOT.P, { lev: 0.45, idle: 0, hurdle: 0.05, bourse: false }, pl);
      while (S.day < D) { for (let k = 0; k < 3; k++) W.step(); try { window.BOT.tick(); } catch (e) {} }
      return { B: S._bnd || {}, X: S._pxs || {}, L: S._lib || {}, v: W.valuation() };
    }, [caste, 4000 + 97 * s, DAYS, BOT, PLAY[caste] || {}]);
    await p.close(); n++; if (r.L.n) bad += r.L.n;
    Object.keys(r.B).forEach(k => { const a = agg[k] || (agg[k] = [0, 0, 0]); a[0] += r.B[k][0]; a[1] += r.B[k][1]; a[2] += r.B[k][2]; });
    Object.keys(r.X).forEach(g => { const o = r.X[g], v = vol[g] || (vol[g] = { s2: 0, n: 0, mx: 0, alt: 0 }); v.s2 += o.s2; v.n += o.n; v.mx = Math.max(v.mx, o.mx); v.alt = Math.max(v.alt, o.malt); });
    console.log(`${caste} graine ${s} : valeur ${(r.v / 1e6).toFixed(1)} M$, invariants violés ${r.L.n || 0} jour(s)`);
  }
  await b.close();
  console.log(`\nGarde-fous (${n} parties × ${DAYS} j) : part des appels où la borne mord`);
  Object.keys(agg).sort().forEach(k => { const a = agg[k]; console.log(`  ${k.padEnd(5)} appels ${String(a[0]).padStart(9)}  en bas ${(100 * a[1] / Math.max(1, a[0])).toFixed(3)} %  en haut ${(100 * a[2] / Math.max(1, a[0])).toFixed(3)} %${(a[1] + a[2]) / Math.max(1, a[0]) > 0.01 ? '  <-- > 1 % : mécanisme masqué ?' : ''}`); });
  const V = Object.keys(vol).map(g => [g, Math.sqrt(vol[g].s2 / Math.max(1, vol[g].n)), vol[g].mx, vol[g].alt]).sort((a, c) => c[1] - a[1]).slice(0, 12);
  console.log('\nCours les plus volatils : bien, écart-type journalier de log P, plus forte variation, plus longue série de dents de scie');
  V.forEach(v => console.log(`  ${v[0].padEnd(10)} ${(100 * v[1]).toFixed(2)} %  ${(100 * v[2]).toFixed(1)} %  ${v[3]} j`));
  console.log(`\nInvariants (NaN, stock négatif, prix nul) violés : ${bad} jour(s) au total`);
})();
