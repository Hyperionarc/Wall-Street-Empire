// Audit du modèle macroéconomique : simule N jours, relève croissance, inflation, taux directeur, chômage, taux d'emprunt, appétit du marché ;
// vérifie les relations attendues (courbe de Phillips, loi d'Okun, règle de Taylor, cycles) et écrit un résumé.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/macro_audit.js [jours] [graine]
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const days = +process.argv[2] || 3600, b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'city.html')); await p.waitForTimeout(1200);
  const r = await p.evaluate(async days => {
    const W = window.WSE, S = W.S, out = []; W.setSpeed(0); S.noEv = false; S.cash = 5e9;
    ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    for (let d = 0; d < days; d++) { W.step ? W.step(1) : null; if (d % 10 === 0) { const m = S.macro; out.push({ d: S.day, gdp: m.gdp, infl: m.infl, rate: m.rate, u: (S.stats && S.stats.unemp) || 0, loan: W.loanRate(), ms: W.vc.sent(), boom: m.boom ? 1 : 0, cc: W.credCycle() }); } }
    return out;
  }, days);
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length, sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); }, cor = (a, b) => { const ma = mean(a), mb = mean(b); return mean(a.map((x, i) => (x - ma) * (b[i] - mb))) / (sd(a) * sd(b) || 1); };
  const g = r.map(x => x.gdp), i = r.map(x => x.infl), t = r.map(x => x.rate), u = r.map(x => x.u), l = r.map(x => x.loan), ms = r.map(x => x.ms);
  const f = (n, a, s = 100) => `${n}: moy ${(mean(a) * s).toFixed(1)} %, écart-type ${(sd(a) * s).toFixed(1)}, min ${(Math.min(...a) * s).toFixed(1)}, max ${(Math.max(...a) * s).toFixed(1)}`;
  const res = [`Simulation : ${days} jours (${(days / 360).toFixed(1)} ans), ${r.length} relevés`, f('Croissance', g), f('Inflation', i), f('Taux directeur', t), f('Chômage', u), f('Taux d\'emprunt (banque)', l), f('Appétit du marché', ms),
    `Phillips (chômage, inflation) : corr ${cor(u, i).toFixed(2)} (attendu < 0)`, `Okun (croissance, chômage) : corr ${cor(g, u).toFixed(2)} (attendu < 0)`, `Taylor (inflation, taux directeur) : corr ${cor(i, t).toFixed(2)} (attendu > 0)`,
    `Taux d'emprunt vs taux directeur : corr ${cor(t, l).toFixed(2)} (attendu > 0,8)`, `Appétit du marché vs croissance : corr ${cor(g, ms).toFixed(2)} (attendu > 0)`, `Part du temps en boom : ${(mean(r.map(x => x.boom)) * 100).toFixed(0)} %`,
    `Chômage jamais à 0 : min ${(Math.min(...u) * 100).toFixed(1)} % ; récessions (croissance < 0) : ${(r.filter(x => x.gdp < 0).length / r.length * 100).toFixed(0)} % du temps`];
  console.log(res.join('\n')); await b.close();
})();
