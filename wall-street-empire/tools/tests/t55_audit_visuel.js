// Passe 55 : audit visuel de la carte. Chaque élément affiché (bâtiments TYPES, ville, gisements, zones fertiles, forêts, sol, eau, routes,
// décor, véhicules, animaux, personnages) est rendu seul dans un canevas instrumenté (tools/audit_visuel.js) :
// plus aucun repli « disque / losanges » générique, gisements et cultures en sprite HD (dérivé recoloré si besoin), repli sans sprite sobre,
// liste HD / repli conforme au rapport docs/AUDIT_VISUEL.md, pas de NaN, RNG du jeu non consommé, 0 erreur de page.
const fs = require('fs'), path = require('path');
const { audit } = require('../audit_visuel.js');
exports.name = 'Audit visuel (passe 55)';

const NO_DISC = ['Bâtiments', 'Gisements', 'Gisements (repli sans sprite)', 'Zones fertiles', 'Forêts', 'Sol et eau', 'Routes', 'Décor', 'Véhicules', 'Animaux', 'Personnages'];
// éléments encore dessinés en code (sprite commandé à Cowork, voir RETOURS.md commande n°55) ou réseaux tracés
const REPLI_OK = { cable: 1, pipeline: 1, 'mon:fire': 1, 'mon:police': 1, 'mon:air': 1, dc: 1 };

exports.run = async (t, L) => {
  const root = path.resolve(__dirname, '..', '..');
  const pg = await L.newPage({ wait: 2500 }); await L.setup(pg, {});
  const rs0 = await pg.evaluate(() => window.WSE.S.rs);
  const r = await audit(pg, {});
  const rs1 = await pg.evaluate(() => window.WSE.S.rs), r2 = await audit(pg, {});
  const sig = R => JSON.stringify(R.rows.map(x => [x.id, x.mode, x.hd, x.ops, x.cov]));
  const rows = r.rows, by = {}; rows.forEach(x => { by[x.id] = x; });
  const types = await pg.evaluate(() => Object.keys(window.WSE.TYPES).filter(k => k !== 'road' && k !== 'part' && k !== 'npc'));
  const hd = rows.filter(x => x.mode === 'HD' || x.mode === 'HD + code'), rep = rows.filter(x => x.mode === 'procédural' || x.mode === 'atlas Kenney');
  t.info(`${rows.length} éléments audités : ${hd.length} en sprite HD, ${rep.length} en repli (${rep.map(x => x.id).join(', ')})`);

  t.check(`chaque type de bâtiment (${types.length}) est audité`, types.length >= 62 && types.every(k => by[k]), types.filter(k => !by[k]).join(','));
  t.check('aucune erreur de rendu ni valeur non finie dans l\'audit', rows.every(x => x.mode !== 'erreur') && r.nan === 0, rows.filter(x => x.mode === 'erreur').map(x => x.id + ':' + x.err).slice(0, 3).join(' ; '));
  const bad = rows.filter(x => NO_DISC.includes(x.fam) && x.id !== 'dc' && (x.disc > 0 || x.diamRep >= 4));
  t.check('plus aucun repli « disque / losanges » (grand disque plein ou ≥ 4 petits losanges de même couleur)', bad.length === 0, bad.map(x => `${x.id} disques ${x.disc} losanges ${x.diamRep}`).join(' ; '));

  const hasHD = fs.existsSync(path.join(root, '..', 'assets', 'phase2_hd', 'gisement_bauxite.png'));
  if (hasHD) {
    const deps = rows.filter(x => x.fam === 'Gisements'), nhd = deps.filter(x => x.hd < 1);
    t.check(`les ${deps.length} gisements (dont gravier, sable, calcaire, argile, silice, sel, potasse, phosphate, soufre, terres rares) en sprite HD`, deps.length >= 20 && !nhd.length, nhd.map(x => x.id).join(','));
    t.check('gravier, sable, calcaire, soufre, terres rares : sprite HD dérivé (même modelé que les autres gisements)', ['gravel', 'sand', 'limestone', 'sulfur', 'rare'].every(k => by[k] && /gisement_/.test(by[k].derived || '')), ['gravel', 'sand', 'limestone', 'sulfur', 'rare'].map(k => k + '=' + (by[k] && by[k].derived)).join(' '));
    const crops = rows.filter(x => x.fam === 'Zones fertiles'), cb = crops.filter(x => x.hd < 1 || x.share > 0.05);
    t.check(`zones fertiles (${crops.length}, dont maïs et colza) : parcelles HD, plus d'aplat ni de disque`, crops.length === 7 && !cb.length && by.corn.derived && by.rapeseed.derived, cb.map(x => x.id + ':' + x.share).join(','));
    const rp = rep.filter(x => !REPLI_OK[x.id.replace(/:bas#\d+$/, '')] && !/:repli$/.test(x.id));
    t.check('liste HD / repli : seuls les éléments en attente de sprite Cowork restent dessinés en code', !rp.length && hd.length >= 150, rp.map(x => x.fam + ':' + x.id).join(', '));
    const ground = rows.filter(x => x.fam === 'Sol et eau' || x.fam === 'Routes');
    t.check('sol, eau, rivage, quais et 16 routes en sprites HD', ground.length >= 25 && ground.every(x => x.hd >= 1), ground.filter(x => x.hd < 1).map(x => x.id).join(','));
    const mv = rows.filter(x => ['Véhicules', 'Animaux', 'Personnages', 'Décor', 'Forêts'].includes(x.fam));
    t.check('véhicules, navire, animaux, personnages, décor et forêts en sprites HD', mv.length >= 25 && mv.every(x => x.mode === 'HD'), mv.filter(x => x.mode !== 'HD').map(x => x.id + ':' + x.mode).join(','));
  } else t.info('assets HD absents : vérification HD ignorée');
  const reps = rows.filter(x => x.fam === 'Gisements (repli sans sprite)');
  t.check(`repli sans sprite (${reps.length} gisements) : terre fondue et tas ombrés, sobres (peu d'opérations, aucun disque)`, reps.length >= 20 && reps.every(x => x.ops > 0 && x.ops < 60 && !x.disc && x.diamRep < 4), reps.filter(x => !(x.ops > 0 && x.ops < 60)).map(x => x.id).join(','));

  const tpl = fs.readFileSync(path.join(root, 'game.template.html'), 'utf8');
  t.check('code : la branche générique « disque + losanges » de drawDeposit a disparu', !/GRADE_K\[k\] \? \[mixC\(GOODS\[k\]\.color/.test(tpl) && !/ctx\.ellipse\(cx, cy, 42, 20, 0, 0, 7\)/.test(tpl), '');
  const md = fs.existsSync(path.join(root, 'docs', 'AUDIT_VISUEL.md')) ? fs.readFileSync(path.join(root, 'docs', 'AUDIT_VISUEL.md'), 'utf8') : '';
  t.check('docs/AUDIT_VISUEL.md : tableau complet (élément | rendu | HD ? | qualité | action) couvrant chaque type', /\| Élément \| Rendu actuel \| HD \? \| Qualité \| Action \|/.test(md) && types.every(k => md.includes('(`' + k + '`)')), types.filter(k => !md.includes('(`' + k + '`)')).slice(0, 5).join(','));
  const ret = fs.readFileSync(path.join(root, '..', 'tools', 'factory_ai', 'RETOURS.md'), 'utf8');
  t.check('RETOURS.md : commande Cowork n°55 (fichiers, emprise, sans texte)', /Commande n°55/.test(ret) && /concasseur_recyclage\.png/.test(ret) && /aucun texte/i.test(ret), '');
  t.check('audit déterministe (deux passes identiques) et RNG du jeu non consommé', sig(r) === sig(r2) && rs0 === rs1, String(rs0) + ' → ' + String(rs1));
  t.check('0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
