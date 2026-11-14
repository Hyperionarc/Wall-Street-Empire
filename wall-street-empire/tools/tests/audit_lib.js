// Partie « empire » jouée par un bot, et lecture des valeurs affichées dans les écrans (pour l'audit de cohérence inter-écrans).
const L = require('./lib.js');

// Monte une économie variée (extraction, usines, produits, commerces, banque, tech, entrepôt) puis joue `days` jours avec le bot de réinvestissement.
async function playEmpire(days = 300, opts = {}) {
  const pg = await L.newPage({ wait: 800, w: opts.w || 1400, h: opts.h || 900 }); await L.setup(pg, { caste: opts.caste || 'industriel', cash: 2e9 }); await L.inject(pg); await L.injectBot(pg);
  await pg.evaluate(() => {
    const W = window.WSE, S = W.S, T = window.T; S.noEv = true;
    ['well', 'miron', 'mcoal', 'fwheat', 'fcotton', 'fsugar', 'logging', 'qsand'].forEach(k => { const dep = { well: 'oil', miron: 'iron', mcoal: 'coal', fwheat: 'wheat', fcotton: 'cotton', fsugar: 'sugar', logging: 'wood', qsand: 'sand' }[k]; T.onDep(k, dep); T.onDep(k, dep, 1); });
    T.inP('port'); T.inP('wh'); for (let i = 0; i < 4; i++) T.inP('f1'); for (let i = 0; i < 3; i++) T.inP('f2'); T.inP('f3');
    for (let i = 0; i < 30; i++) T.inC('res'); T.inC('s1'); T.inC('s2'); T.inC('s2'); T.inC('s3'); T.inC('s3'); T.inC('bank'); T.inC('tech'); T.inC('hq'); T.inC('off');
    ['utensils', 'bread', 'jeans', 'headache', 'soap'].forEach(k => { W.launchProduct(k); W.assignProduct(k, 2); try { W.autoChain(k); } catch (e) { } });
    T.stepN(20, false);
    window.BOT.P.lev = 0.3; window.BOT.P.idle = 0.2;
  });
  for (let d = 0; d < days; d += 10) await pg.evaluate(() => { const W = window.WSE; for (let k = 0; k < 10; k += 2) { W.step(); W.step(); window.BOT.tick(); } });
  return pg;
}

// Nombre affiché : « 1 234 $ », « −5 678 $ », « 12,5 » -> nombre
function num(s) { if (s == null) return NaN; const t = String(s).replace(/[\s  ]/g, '').replace('−', '-').replace(',', '.'); const m = t.match(/[+-]?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; }
// Valeur qui suit un libellé dans un texte d'écran (le libellé peut être suivi de sous-texte)
function after(text, label, opts = {}) {
  const i = text.indexOf(label); if (i < 0) return NaN; const tail = text.slice(i + label.length, i + label.length + (opts.span || 90));
  const m = tail.match(/([+−-]?\s*\d[\d\s  ]*(?:,\d+)?)\s*\$/); return m ? num(m[1]) * (/^\s*[−-]/.test(tail.slice(0, tail.indexOf(m[1]) + 1)) || /^[−-]/.test(m[1].trim()) ? 1 : 1) : NaN;
}
async function openTab(pg, tab) { await pg.evaluate(t => { const p = document.getElementById('panel'); if (p.hidden) document.getElementById('pn').click(); const b = document.querySelector(`[data-ptab="${t}"]`); b && b.click(); }, tab); await pg.waitForTimeout(150); }
async function tabText(pg, tab) { await openTab(pg, tab); return pg.evaluate(t => (document.querySelector(`section[data-sec="${t}"]`) || {}).innerText || '', tab); }

module.exports = { playEmpire, num, after, openTab, tabText };
