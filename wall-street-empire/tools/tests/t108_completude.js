// Passe 101 : complétude de l'information (docs/AUDIT_COMPLETUDE.md, tools/audit_completude.js --lite).
// Rémy : « Revérifie et audite tous les produits et tous les bâtiments où il MANQUERAIT DES INFORMATIONS. »
// Chaque produit, bien, bâtiment, équipement public, service de quartier et outil du jeu doit avoir un nom français, une description (produits, bâtiments, équipements)
// et une image affichable (photo, sprite HD ou repli dessiné) ; les recettes ne citent que des intrants existants ; aucun produit sans producteur possible ;
// aucun texte « undefined » / « NaN » dans une fiche du Guide, une infobulle ou une vue intérieure ; tout bâtiment a un outil de pose, une icône et une place dans un menu.
exports.name = 'Complétude : nom, description, image, recette, menu de chaque objet du jeu';
const A = require('../audit_completude.js');
exports.run = async (t, L) => {
  const R = await A.run(L, { lite: true }), S = R.static, by = {}; R.rows.forEach(r => { (by[r.g] = by[r.g] || []).push(r); });
  const n = g => (by[g] || []).length;
  t.check(`tous les objets sont audités : ${S.prods.length} produits, ${S.goods.length} biens, ${S.types.length - 1} bâtiments, ${S.pub.length + 2} équipements publics, ${S.svc.length} services`,
    n('produit') === S.prods.length && n('bien') === S.goods.length && n('bâtiment') === S.types.length - 1 && n('équipement public') === S.pub.length + 2 && n('service de quartier') === S.svc.length && n('outil') === S.tools.length, Object.keys(by).map(g => g + ' ' + n(g)).join(', '));
  const bad = c => R.rows.filter(r => r.c[c] && r.c[c][0] === 'x');
  const noName = bad('nom'), noDesc = bad('desc').concat(bad('sub'), bad('txt')), noImg = bad('img').concat(bad('sprite'));
  t.check('aucun produit, bien, bâtiment ni équipement sans nom français lisible (ni clé brute, ni « undefined »)', !noName.length, noName.map(r => r.g + ' ' + r.k).join(', '));
  t.check('aucun produit, bâtiment ni équipement sans description (desc, sous-titre ou texte d\'équipement)', !noDesc.length, noDesc.map(r => r.g + ' ' + r.k).join(', '));
  t.check('aucun produit, bien, bâtiment, équipement ni service sans image affichable (photo, sprite HD ou repli dessiné)', !noImg.length, noImg.map(r => r.g + ' ' + r.k + ' ' + (r.c.img || r.c.sprite)[1]).join(', '));
  const hard = R.rows.filter(r => r.level === 'bloquant');
  t.check('aucun manque obligatoire : prix de référence, famille, intrants connus, chaîne de production, coût, menu, icône, fiche du Guide sans texte suspect', !hard.length, hard.map(r => r.g + ' ' + r.k + ' : ' + r.bloq.join(', ')).join(' ; '));
  const iss = R.issues.filter(i => i.sev === 'bloquant');
  t.check('aucune incohérence : nom en double, bâtiment sans outil de pose, outil sans définition, entrée GUIDE_SUBST cassée', !iss.length, iss.map(i => i.cat + ' ' + i.txt).join(' ; '));
  const prodNoMaker = S.prods.filter(p => p.chain).map(p => p.k), goodNoMaker = S.goods.filter(g => !g.abs && g.why).map(g => g.k);
  t.check('chaque produit et chaque bien peut être produit ou importé (aucun producteur introuvable)', !prodNoMaker.length && !goodNoMaker.length, prodNoMaker.concat(goodNoMaker).join(', '));
  t.check('chaque type de bâtiment est dans un menu (catégorie et famille) avec une icône d\'outil', S.types.filter(x => x.k !== 'npc').every(x => x.cat.length && x.fam.length && x.icon), S.types.filter(x => x.k !== 'npc' && !(x.cat.length && x.fam.length && x.icon)).map(x => x.k).join(', '));
  t.info(`${R.rows.length} objets : ${R.sum.ok} complets, ${R.sum.attendu} avec manque attendu (repli, sprite partagé, enseigne…), ${R.sum.bloquant} avec manque obligatoire`);
  // ---- correctifs de la passe 101 : nom et survol des services de quartier, enseigne de l'agence immobilière, Guide sans NaN
  const pg = await L.newPage({ wait: 2600 }); await L.setup(pg, {});
  const r = await pg.evaluate(() => { const W = window.WSE, N = W.N, o = { svc: [] }; W.vv.svc();
    (W.vv.list() || []).forEach(q => { const c = W.S.grid[q[1] * N + q[0]]; if (!c || o.svc.some(s => s.k === q[2])) return; const sp = W.aud.VV_SVC_SPR[q[2]] || q[2]; c._spr = sp; const lab = W.mapLabel(q[0], q[1]); o.svc.push({ k: q[2], nom: W.vv.name(c), tip: lab && lab.t, exp: W.vv.SVC[q[2]][0] }); });
    o.immo = !!W.sign.SIGN.immo && W.sign.txt('immo');
    o.guide = ['couture', 'grandcru', 'watch', 'bread'].map(k => { W.openGuide(k); return [k, /NaN|undefined/.test(document.getElementById('gview').innerText)]; });
    return o; });
  t.check('chaque service de quartier de la ville affiche son nom (pharmacie comprise : le sprite « pharmacie » est celui du service « drugstore ») et le survol l\'annonce', r.svc.length >= 6 && r.svc.every(s => s.nom === s.exp && s.tip === s.exp), r.svc.filter(s => !(s.nom === s.exp && s.tip === s.exp)).map(s => s.k + ' nom=' + s.nom + ' survol=' + s.tip).join(', '));
  t.check('l\'agence immobilière porte une enseigne de façade', !!r.immo, String(r.immo));
  t.check('fiche du Guide sans « NaN » pour un produit jamais lancé (couture, grand cru, montre, pain)', r.guide.every(g => !g[1]), JSON.stringify(r.guide));
  t.check('0 erreur de page', !pg.errs.length && !R.errs.length, pg.errs.concat(R.errs).slice(0, 2).join(' | '));
  await pg.context().close();
};
