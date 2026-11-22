// Passe 46 : pouvoir de marché. Les marges sont le RÉSULTAT de la concurrence (pas de plafond) : seul sur un marché, le prix et la marge montent ;
// chaque concurrent rogne la prime ; l'élasticité, l'export au cours mondial et l'appel d'air (concurrents attirés par une marge durablement forte) servent de garde-fous.
const BP = require('../bench_pouvoir.js');
exports.name = 'Pouvoir de marché (passe 46)';
exports.run = async (t, L) => {
  // 1. Formules (page neuve) : prime décroissante avec le nombre de vendeurs, nulle sur un marché très concurrentiel, prime produit, marge de rayon
  const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);
  const f = await pg.evaluate(() => {
    const W = window.WSE, M = W.mp, S = W.S, out = {};
    out.pr = [0, 1, 2, 4, 6].map(k => M.prime(M.Pg('plastic'), 1 + k + M.IMP));
    out.spec = M.Pg('plastic') > M.Pg('steel'); out.raw = ['oil', 'iron', 'wheat', 'beef', 'ingot'].every(g => !M.on(g));
    S.npcSup = S.npcSup || {}; S.npcSup.plastic = { cap: 0, k: 0, days: 0 }; out.g0 = M.good('plastic', 0, 100).m;   // tu ne produis pas : aucun effet
    out.gHalf = M.good('plastic', 50, 100).m; out.gFull = M.good('plastic', 100, 100).m;
    W.launchProduct('jeans'); const ps = S.prod.jeans; ps.st = 'on'; ps.brand = 50; const keep = S.rivals; S.rivals = []; S._mpp = {}; out.p0 = M.prodOf('jeans').m;
    S.rivals = [0, 1, 2, 3].map(i => Object.assign(JSON.parse(JSON.stringify(keep[0])), { id: 'z' + i, att: { basic: 0.2, std: 0.2, lux: 0.2, estate: 0 }, fl: null, sub: 0 })); out.p4 = M.prodOf('jeans').m;
    ps.brand = 100; out.p4b = M.prodOf('jeans').m; S.rivals = keep; out.vol = M.vol('jeans');
    out.r = [[0, 0.5], [0.5, 0.5], [0.9, 0.5], [0.5, 0.1]].map(a => M.retail('lux', a[0], a[1])); out.rb = M.retail('basic', 0, 0.5);
    // appel d'air déterministe : prime forte durable -> un concurrent de plus, avec un message
    S._mp = { plastic: { p: 0.5, cov: 1, m: 1.5 } }; const n = { cap: 0, k: 0, days: 0 }; let d = 0; for (; d < 400 && n.k < 1; d++) M.entry('plastic', n, 100);
    out.entryDay = d; out.entryK = n.k; out.entryCap = n.cap;
    const n2 = { cap: 0, k: 0, days: 0 }; for (let i = 0; i < d; i++) M.entry('plastic', n2, 100); out.det = n2.k === n.k && n2.cap === n.cap;
    S._mp = {}; const n3 = { cap: 50, k: 2, days: 0 }; for (let i = 0; i < 400; i++) M.entry('plastic', n3, 100); out.noHot = n3.k;   // sans prime : personne n'entre (et le marché non saturé ne fait sortir personne)
    return out;
  });
  t.check('prime de prix décroissante : seul > 1 > 2 > 4 > 6 concurrents', f.pr.every((v, i) => i === 0 || v < f.pr[i - 1] || (v === 0 && f.pr[i - 1] === 0)) && f.pr[0] > 0.6, f.pr.map(v => v.toFixed(2)).join(' > '));
  t.check('marché très concurrentiel (6 concurrents) : prime résiduelle < 10 % de celle du monopole', f.pr[4] < 0.1 * f.pr[0], f.pr[4].toFixed(3));
  t.check('spécialité (plastique) plus rentable qu\'une commodité (acier) ; fermes, élevages, mines, lingots hors du mécanisme', f.spec && f.raw);
  t.check('sans production propre : aucun effet ; couverture partielle < totale', f.g0 === 1 && f.gHalf > 1 && f.gHalf < f.gFull, `${f.g0} / ${f.gHalf.toFixed(2)} / ${f.gFull.toFixed(2)}`);
  t.check('produit fini : seul > 4 rivaux ; une marque forte résiste mieux', f.p0 > f.p4 && f.p4b > f.p4 && f.p0 > 1.2, `×${f.p0.toFixed(2)} / ×${f.p4.toFixed(2)} / marque ×${f.p4b.toFixed(2)}`);
  t.check('élasticité : la prime coûte du volume (0 < volume ≤ 1)', f.vol > 0 && f.vol <= 1, f.vol.toFixed(3));
  t.check('rayon : position forte > normale > rivaux dominants ; rayons saturés compriment ; le luxe réagit plus que la base', f.r[0] > f.r[1] && f.r[1] > f.r[2] && f.r[3] < f.r[1] && f.r[0] > f.rb, f.r.map(v => v.toFixed(2)).join(' / ') + ' base ' + f.rb.toFixed(2));
  t.check('appel d\'air : un concurrent entre après une prime durable (120-250 j), déterministe', f.entryK === 1 && f.entryDay >= 100 && f.entryDay <= 260 && f.entryCap > 0 && f.det, `jour ${f.entryDay}, k ${f.entryK}`);
  t.check('sans prime forte : pas d\'entrée', f.noHot === 2, 'k ' + f.noHot);
  // 2. Sauvegarde : champs optionnels, clé v8, relecture d'une ancienne sauvegarde sans ces champs
  const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S; S.npcSup = S.npcSup || {}; S.npcSup.chem = { cap: 12, k: 3, days: 40, hot: 17, cold: 0 }; W.save(); const raw = JSON.parse(localStorage.getItem('wse-city-v8')); const ok1 = raw.npcSup.chem.k === 3 && raw.npcSup.chem.hot === 17;
    delete raw.npcSup.chem.k; delete raw.npcSup.chem.hot; localStorage.setItem('wse-city-v8', JSON.stringify(raw)); const d = W.load(); const n = d && d.npcSup && d.npcSup.chem; return { ok1, k: W.mp ? (n ? (n.k != null ? n.k : n.cap > 0 ? 1 : 0) : -1) : -1 }; });
  t.check('sauvegarde v8 : concurrents et appel d\'air conservés ; ancienne sauvegarde relue (k déduit de la capacité)', sv.ok1 && sv.k === 1, JSON.stringify(sv));
  t.check('formules : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 2).join(';')); await pg.context().close();

  // 3. Usine isolée réelle (plastique) : monopole > duopole > marché saturé ; plancher de viabilité ; pas de NaN
  const R = await L.pool([0, 2, 6], 3, k => BP.factory('plastic', k));
  const e = R.map(r => r.eb * 100);
  t.check('usine de plastique : seule > 2 concurrents > 6 concurrents (EBITDA)', e[0] > e[1] + 3 && e[1] > e[2] + 3, e.map(v => v.toFixed(0) + ' %').join(' > '));
  t.check('usine monopolistique : EBITDA ≥ 30 % (pouvoir de marché plafonné naturellement par la parité d\'importation, docs/ECONOMIE_LIBERALE.md)', e[0] >= 30, e[0].toFixed(1) + ' %');
  t.check('marché saturé : marge plus mince que le monopole, sans plancher administré (EBITDA entre −20 % et 25 %)', e[2] >= -20 && e[2] <= 25 && e[2] < e[0] - 10, e[2].toFixed(1) + ' %');
  t.check('usines : aucun NaN, 0 pageerror', R.every(r => Number.isFinite(r.eb) && Number.isFinite(r.px) && r.errs.length === 0), R.flatMap(r => r.errs).slice(0, 2).join(';'));
};
