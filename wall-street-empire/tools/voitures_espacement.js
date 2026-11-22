#!/usr/bin/env node
// Passe 99 (Rémy : « des voitures l'une sur l'autre ») : mesure des paires de voitures trop proches dans une ville de 100 000 habitants.
// 60 s de circulation simulée (1 200 pas de 50 ms, vitesse ×1), relevé toutes les 20 images après 10 s : paires dont les positions dessinées
// sont à moins de 24 px monde (silhouettes qui se chevauchent, une voiture fait 36 px) et à moins de 12 px (superposées). Puis déterminisme : deux passes identiques.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/voitures_espacement.js   (SIM_HTML=chemin/vers/city.html pour une autre version)
const path = require('path');
const L = require('./tests/lib.js');
const RUN = () => {
  const W = window.WSE, T = W.traffic; T.refresh(); T.reset(); W.setSpeed(1);
  const o = { n: 0, near: 0, over: 0, k: 0, sig: '', mov: 0, prev: null };
  for (let i = 0; i < 1200; i++) { T.update(0.05); if (i >= 200 && i % 20 === 0) { o.k++; o.n += T.cars().length; o.near += T.close(24); o.over += T.close(12); const sg = T.cars().map(c => c.x + ',' + c.y + ',' + c.t.toFixed(2)); if (o.prev) o.mov += sg.filter((v, j) => v !== o.prev[j]).length / sg.length; o.prev = sg; } }
  W.setSpeed(0); o.prev = null; o.sig = T.cars().map(c => c.x + ',' + c.y + ',' + c.t.toFixed(3)).join(';'); return o;
};
async function mesure(pg) {
  await pg.evaluate(() => { const W = window.WSE; W.showModes(); W.startMode('round', { start: 'moyenne' }); W.S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); });
  const a = await pg.evaluate(RUN), b = await pg.evaluate(RUN), pop = await pg.evaluate(() => Math.round(window.WSE.S.pop));
  return { pop, voitures: +(a.n / a.k).toFixed(1), prochesParRelevé: +(a.near / a.k).toFixed(2), superposéesParRelevé: +(a.over / a.k).toFixed(2), enMouvement: +(a.mov / (a.k - 1)).toFixed(2), deterministe: a.sig === b.sig };
}
module.exports = { mesure };
if (require.main === module) (async () => {
  const pg = await L.newPage({ wait: 1500 }); const r = await mesure(pg); console.log(JSON.stringify(r)); if (pg.errs.length) console.log('erreurs', pg.errs.slice(0, 3)); await L.closeBrowser();
})();
