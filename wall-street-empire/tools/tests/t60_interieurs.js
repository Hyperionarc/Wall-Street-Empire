// Audit des intérieurs (tools/audit_interieurs.js) : chaque type de bâtiment se construit, sa vue intérieure s'ouvre sans erreur, scène non vide, aucun NaN / undefined
// (panneau et texte dessiné), rien hors écran, aucun onglet vide, boutons non superposés ; usines : plein écran + carnet de commandes ; Mall et Aéroport ; réseau sans faux intérieur.
// Mobile 390×844 sur un échantillon. Puis une chaîne de bout en bout (ferme -> moulin -> boulangerie -> magasin -> export) : chiffres cohérents, conseil juste, rupture expliquée.
exports.name = 'Intérieurs de tous les bâtiments et chaîne de bout en bout';
const fs = require('fs'), path = require('path'), os = require('os');
const { auditAll } = require('../audit_interieurs.js');

exports.run = async (t, L) => {
  const shots = process.env.WSE_SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), 'wse_t60_'));
  const pc = await auditAll(L, { shots, fast: 1 });
  const types = await (async () => { const pg = await L.newPage({ wait: 300 }); const k = await pg.evaluate(() => Object.keys(window.WSE.TYPES).filter(k => k !== 'road' && k !== 'npc')); await pg.context().close(); return k; })();
  const seen = new Set(pc.map(r => r.key));
  t.check(`chaque type de TYPES est audité (${types.length} types + Mall + Aéroport)`, types.every(k => seen.has(k)) && seen.has('mall') && seen.has('aeroport'), types.filter(k => !seen.has(k)).join(', '));
  const bad = pc.filter(r => r.problems.length);
  t.check('bureau 1280×900 : toutes les vues s\'ouvrent sans erreur JS, sans NaN, sans élément hors écran ni onglet vide', bad.length === 0, bad.slice(0, 4).map(r => r.key + ' : ' + r.problems.join(' ; ')).join(' || ').slice(0, 600));
  const shot = k => { try { return fs.statSync(path.join(shots, `pc_${k}.png`)).size; } catch (e) { return 0; } };
  const small = types.filter(k => !['pylon', 'cable', 'pipeline'].includes(k) && shot(k) < 30000);
  t.check('une capture non vide par type (> 30 Ko)', small.length === 0, small.join(', '));
  const ink = pc.filter(r => r.ink != null && r.ink >= 0 && r.kind !== 'msg' && r.ink < 0.2).map(r => r.key);
  t.check('scène intérieure dessinée pour chaque type (couverture ≥ 20 %)', ink.length === 0, ink.join(', '));
  const fac = pc.filter(r => ['f1', 'f2', 'f3', 'f4'].includes(r.key));
  t.check('usines f1–f4 : plein écran ouvert et carnet de commandes lisible', fac.length === 4 && fac.every(r => r.imm && r.imm.on && /Carnet de commandes/.test(r.book || '')), fac.map(r => r.key + ':' + (r.imm && r.imm.on)).join(' '));
  const kinds = Object.fromEntries(pc.map(r => [r.key, r.kind]));
  t.check('scène cohérente avec le bâtiment : entrepôt en ligne = halle logistique, magasins = rayons, usines = plan, mines/fermes = site, réseau = pas d\'intérieur',
    kinds.ewh === 'site' && kinds.wh === 'site' && kinds.s1 === 'retail' && kinds.sauto === 'retail' && kinds.f2 === 'plan' && kinds.miron === 'site' && kinds.fcattle === 'site' && kinds.dc === 'bld' && kinds.pylon === 'msg' && kinds.cable === 'msg' && kinds.pipeline === 'msg', JSON.stringify({ ewh: kinds.ewh, pylon: kinds.pylon, sauto: kinds.sauto }));
  const slow = pc.filter(r => r.frameMs > 25 && r.key !== 'f1' && r.key !== 'f2').map(r => r.key + ' ' + r.frameMs + ' ms');   // la première usine ouverte charge ses sprites
  t.info('coût de rendu d\'une image (ms) : ' + pc.filter(r => r.frameMs != null).map(r => r.key + ' ' + r.frameMs).join(' · '));
  t.check('rendu d\'une image de scène < 25 ms (hors premier chargement des sprites d\'usine)', slow.length === 0, slow.join(', '));
  const mob = await auditAll(L, { shots, fast: 1, w: 390, h: 844, tag: 'mob', only: ['f2', 'f4', 's1', 'sauto', 'spharma', 'dc', 'hq', 'miron', 'fcattle', 'ewh', 'port', 'res', 'mall', 'aeroport'] });
  const bm = mob.filter(r => r.problems.length);
  t.check('mobile 390×844 (échantillon de 14 vues) : sans erreur, sans débordement, boutons non superposés', bm.length === 0 && mob.length >= 14, bm.slice(0, 4).map(r => r.key + ' : ' + r.problems.join(' ; ')).join(' || ').slice(0, 600));

  // ---- chaîne de bout en bout
  const pg = await L.newPage({ w: 1280, h: 900 }); await L.setup(pg, { cash: 3e7 }); await L.inject(pg);
  const r = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N, T = window.T; S.unlockAll = false; T.frz();
    for (let i = 0; i < 30; i++) T.inC('res');
    const farm = T.put('fwheat', 0, N, 0, N), mill = T.inP('f1'), bak = T.inP('f1'), shop = T.inC('s1'); T.inP('port');
    W.openBuilding(mill.x, mill.y); W.bAct('recipe:flour'); W.launchProduct('bread'); for (let d = 0; d < 12; d++) { T.frz(); W.step(); }
    W.openBuilding(bak.x, bak.y); W.bAct('recipe:bread'); W.closeBuilding();
    let neg = 0; const chk = () => { Object.keys(S.prod).forEach(k => { if (S.prod[k].stock < 0) neg++; }); Object.keys(S.stock).forEach(g => { if (S.stock[g] < 0) neg++; }); };
    for (let d = 0; d < 30; d++) { T.frz(); W.step(); chk(); }
    const ps = S.prod.bread, B = W.fac.book(bak), adv = W.fac.advice(bak, B, W.recOf(bak)).t;
    const o = { farm: farm.out, mill: mill.out, millSrc: mill.src, bak: bak.out, sold: ps.sold, exp: ps.exp, dem: B.dem, prodTot: B.prodTot, bSold: B.sold, bExp: B.exp, adv, shop: shop.out };
    W.openBuilding(farm.x, farm.y); W.bAct('bull'); W.closeBuilding();
    for (let d = 0; d < 10; d++) { T.frz(); W.step(); chk(); }
    o.autoOut = mill.out; o.autoImp = mill._impIn || 0;   // source « Auto » : stock local puis port
    mill.src = { wheat: 'local' }; bak.src = { flour: 'local' };   // le joueur choisit « Mon réseau » : plus d'import
    for (let d = 0; d < 15; d++) { T.frz(); W.step(); chk(); }
    W.openBuilding(mill.x, mill.y); o.banMill = [...document.querySelectorAll('#bbody .bnbanner')].map(e => e.innerText.replace(/\s+/g, ' ')).join(' '); W.closeBuilding();
    o.millLim = mill.limit; o.bakLim = bak.limit; o.adv2 = W.fac.advice(bak, W.fac.book(bak), W.recOf(bak)).t; o.neg = neg;
    return o;
  });
  t.check('chaîne : la ferme, le moulin et la boulangerie produisent ; le magasin vend le pain', r.farm > 0 && r.mill > 0 && r.bak > 0 && r.sold > 0 && r.shop > 0, JSON.stringify({ farm: Math.round(r.farm), mill: Math.round(r.mill), bak: Math.round(r.bak), sold: +r.sold.toFixed(1) }));
  t.check('carnet = simulation : production, ventes et export identiques ; production = ventes + export (stock plein)', Math.abs(r.prodTot - r.bak) < 1e-6 && Math.abs(r.bSold - r.sold) < 1e-6 && Math.abs(r.bExp - r.exp) < 1e-6 && Math.abs(r.sold + r.exp - r.bak) < 0.02 * r.bak, `prod ${r.prodTot.toFixed(1)} · ventes ${r.sold.toFixed(1)} · export ${r.exp.toFixed(1)}`);
  t.check('conseil juste : rayons saturés (ventes << demande) -> ouvrir des magasins, pas « baisser le prix »', /magasins/.test(r.adv) && !/^Tu produis plus/.test(r.adv), r.adv);
  t.check('ferme démolie, source « Auto » : le moulin importe le blé par le port et continue (la branche auto était tombée dans un commentaire depuis la passe 21)', r.autoOut > 0 && r.autoImp > 0, `production ${r.autoOut.toFixed(1)} /j · import ${r.autoImp.toFixed(1)} /j`);
  t.check('source « Mon réseau » sans ferme : goulot « manque de blé » expliqué avec la solution, conseil « Rupture de farine » au bureau de la boulangerie', r.millLim === 'wheat' && /manque de blé/.test(r.banMill) && /choisis un fournisseur/.test(r.banMill) && /Rupture de farine/.test(r.adv2), r.banMill.slice(0, 220) + ' || ' + r.adv2);
  t.check('aucun stock négatif pendant toute la chaîne', r.neg === 0, 'négatifs : ' + r.neg);
  t.check('chaîne : 0 erreur JS', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();
};
