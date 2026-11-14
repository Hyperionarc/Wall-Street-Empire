#!/usr/bin/env node
// Harnais de non-régression de Wall Street Empire.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/tests/run.js [filtre ...]
//   (construire d'abord : python3 wall-street-empire/tools/build.py ; WSE_URL pour tester un autre fichier)
// Chaque test imprime des lignes PASS / FAIL avec la valeur mesurée et le seuil. Code de sortie 1 s'il y a un FAIL.
const fs = require('fs'), path = require('path');
const lib = require('./lib.js');

const files = fs.readdirSync(__dirname).filter(f => /^t\d+_.*\.js$/.test(f)).sort();
const filters = process.argv.slice(2);
const results = [];
function mkT(group) {
  return {
    check(label, pass, detail) { const ok = !!pass; results.push({ group, label, ok, detail }); console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail !== undefined && detail !== '' ? '  [' + detail + ']' : ''}`); },
    // valeur dans [lo, hi] (unités affichées), arrondie à l'unité si round
    range(label, v, lo, hi, unit = '', dec = 1) { const ok = Number.isFinite(v) && v >= lo && v <= hi; this.check(label, ok, `${Number.isFinite(v) ? v.toFixed(dec) : v}${unit} attendu ${lo}-${hi}${unit}`); },
    info(msg) { console.log('        ' + msg); },
  };
}

(async () => {
  const t0 = Date.now();
  for (const f of files) {
    const mod = require('./' + f);
    if (filters.length && !filters.some(x => f.includes(x) || mod.name.includes(x))) continue;
    console.log(`\n== ${mod.name} (${f})`); const t1 = Date.now(), t = mkT(mod.name);
    try { await mod.run(t, lib); } catch (e) { t.check('exécution du test sans exception', false, (e && e.message || String(e)).slice(0, 200)); }
    console.log(`   (${((Date.now() - t1) / 1000).toFixed(1)} s)`);
  }
  await lib.closeBrowser();
  const fail = results.filter(r => !r.ok), pass = results.length - fail.length;
  console.log(`\n== Bilan : ${pass} PASS, ${fail.length} FAIL, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  fail.forEach(r => console.log(`   FAIL ${r.group} : ${r.label}${r.detail ? ' [' + r.detail + ']' : ''}`));
  process.exit(fail.length ? 1 : 0);
})();
