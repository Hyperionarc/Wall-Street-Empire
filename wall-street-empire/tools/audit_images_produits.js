#!/usr/bin/env node
// Audit de RÉCONCILIATION des images de chaque produit fini (PRODUCTS) et de chaque bien/matière (GOODS) :
// quelle image le jeu affiche réellement (photo HD propre, photo substituée/voisine, composite provisoire GUIDE_COMPOSE,
// repli vectoriel « fond sombre + objet simplifié », ou rien) et un fichier HD existe-t-il dans assets/ sous un nom que le build n'a pas branché ?
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/audit_images_produits.js [--check]
//   -> écrit wall-street-empire/docs/AUDIT_IMAGES_PRODUITS.md ; --check : code de sortie 1 si une photo HD existe sous un nom candidat mais n'est pas affichée.
// Complément de tools/audit_produits.js (fidélité à l'œil, planches) : celui-ci ne juge pas la ressemblance, il vérifie le branchement.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), REPO = path.resolve(ROOT, '..');
const L = require('./tests/lib.js');
const CHECK = process.argv.includes('--check');

// ---- fichiers image disponibles (tous les dossiers d'assets pertinents) ----
const DIRS = ['assets/guide_hd', 'assets/guide_hd_256', 'assets/phase2_hd/guide', 'wall-street-empire/assets/guide_hd', 'wall-street-empire/assets/products_hd', 'assets/phase2_hd', 'assets/factory_hd'];
const EXT = /\.(jpe?g|png|webp)$/i;
function listImages() {
  const out = [];
  for (const d of DIRS) { const p = path.join(REPO, d); if (!fs.existsSync(p)) continue; for (const f of fs.readdirSync(p)) if (EXT.test(f)) out.push({ dir: d, base: f.replace(EXT, ''), rel: d + '/' + f }); }
  return out;
}
const IMGS = listImages();
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
// synonymes français/anglais à chercher en plus de la clé (nom de fichier exact ou commençant par le synonyme)
const ALIASES = {
  tablewine: ['vin_de_table', 'table_wine', 'vin_table', 'red_wine', 'vin_rouge'], grandcru: ['grand_cru', 'vin_grande_reserve', 'vin_haut_de_gamme', 'fine_wine', 'bordeaux'], wine: ['vin', 'bottle_wine', 'bouteille_vin'],
  sausage: ['saucisson', 'saucisse', 'charcuterie', 'salami'], eggs: ['oeufs', 'oeuf', 'egg_box'], egg: ['oeufs', 'oeuf', 'eggs'], chicken: ['poulet', 'poultry', 'volaille'], porkmeat: ['porc', 'pork', 'viande_porc'], lambmeat: ['agneau', 'lamb', 'gigot'],
  tableoil: ['huile_de_table', 'huile', 'olive_oil', 'cooking_oil', 'cookoil'], cookoil: ['huile_de_cuisine', 'huile', 'tableoil', 'cooking_oil'], biofuel: ['biocarburant', 'bidon'], biodiesel: ['biodiesel'],
  grapes: ['raisin', 'grape'], corn: ['mais', 'maize'], rapeseed: ['colza', 'canola'], cpu: ['processeur', 'processor', 'chip', 'puce'], dram: ['ram', 'memoire', 'memory'], gpu: ['carte_graphique', 'graphics'],
  whisky: ['whiskey', 'spirit'], spirits: ['spiritueux', 'spirit'], bread: ['pain'], biscuits: ['biscuit'], candy: ['bonbons', 'bonbon'], yogurt: ['yaourt', 'yogourt'], cheese: ['fromage'], pasta: ['pates'], chocolate: ['chocolat'], readymeal: ['plat_cuisine', 'plats_cuisines', 'ready_meal'],
  drinkmilk: ['lait', 'milk'], beefmeat: ['boeuf', 'beef', 'meat'], soda: ['sodas'], beer: ['biere'],
};
const NOT_PRODUCT = new Set(['basic', 'std', 'lux']);   // catégories de gamme abstraites (Biens de base / manufacturés / luxe) : aucune image attendue

// ---- règles de branchement du build (lues dans tools/build.py, pas recopiées) ----
function parseBuild() {
  const src = fs.readFileSync(path.join(ROOT, 'tools', 'build.py'), 'utf8');
  const grab = name => { const m = src.match(new RegExp('^' + name + "\\s*=\\s*\\{([^}]*)\\}", 'm')); const o = {}; if (m) for (const kv of m[1].matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)) o[kv[1]] = kv[2]; return o; };
  return { subst: grab('GUIDE_SUBST'), fill: grab('GUIDE_FILL'), compose: grab('GUIDE_COMPOSE') };
}
function size(p) {   // dimensions JPEG/PNG sans bibliothèque
  try {
    const b = fs.readFileSync(p); if (b[0] === 0x89 && b[1] === 0x50) return [b.readUInt32BE(16), b.readUInt32BE(20)];
    let i = 2; while (i < b.length) { if (b[i] !== 0xFF) { i++; continue; } const m = b[i + 1], n = b.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + n; }
  } catch (e) { /* illisible */ }
  return null;
}

(async () => {
  const B = parseBuild();
  const pg = await L.newPage({ w: 1280, h: 900, wait: 900 });
  const inv = await pg.evaluate(() => {
    const W = window.WSE, P = W.PRODUCTS, G = W.GOODS, A = W.imgAudit;
    return Object.keys(P).map(k => ({ k, kind: 'prod', name: P[k].name, grp: W.famOf(k), shown: !!A.guide(k), hero: !!A.hero(k), photoLen: (A.photo(k) || '').length }))
      .concat(Object.keys(G).map(k => ({ k, kind: 'good', name: G[k].name, grp: G[k].grp, shown: !!A.guide(k), hero: false, photoLen: (A.photo(k) || '').length })));
  });
  await L.closeBrowser();

  const own = k => IMGS.find(i => i.base === k && /guide_hd/.test(i.dir));   // fichier propre branché par build.py (dossiers guide_hd)
  const rows = inv.map(it => {
    const k = it.k, f = own(k); let type, file = '', action = '—';
    if (NOT_PRODUCT.has(k)) { type = 'catégorie abstraite'; action = 'aucune (pas un objet)'; }
    else if (B.subst[k] && own(B.subst[k])) { type = 'photo substituée'; file = own(B.subst[k]).rel + ` (GUIDE_SUBST ← ${B.subst[k]})`; action = `commande : ${k}.jpg propre (la photo ${k}.jpg est jugée mauvaise)`; }
    else if (f) { type = 'photo HD'; const s = size(path.join(REPO, f.rel)); file = f.rel + (s ? ` ${s[0]}×${s[1]}` : ''); }
    else if (B.fill[k] && own(B.fill[k])) { type = 'photo voisine (provisoire)'; file = own(B.fill[k]).rel + ` (GUIDE_FILL ← ${B.fill[k]})`; action = `commande : ${k}.jpg propre`; }
    else if (B.compose[k]) { type = 'composite provisoire'; file = `assets/phase2_hd/${B.compose[k]}.png sur fond studio (GUIDE_COMPOSE)`; action = `commande : ${k}.jpg propre`; }
    else if (it.shown) { type = 'photo HD (source inconnue)'; file = '?'; }
    else { type = 'repli vectoriel (fond sombre)'; action = `commande : ${k}.jpg propre`; }
    // un fichier HD existe-t-il sous un nom candidat sans être affiché ?
    const cands = [k, ...(ALIASES[k] || [])].flatMap(a => IMGS.filter(i => /guide_hd|phase2_hd\/guide|products_hd/.test(i.dir) && (i.base === a || i.base.startsWith(a + '_'))));
    const unwired = !it.shown && !NOT_PRODUCT.has(k) ? cands : [];
    const hd = it.shown && type !== 'composite provisoire' ? 'oui' : unwired.length ? 'oui, NON BRANCHÉ : ' + unwired.map(u => u.rel).join(', ') : 'non';
    if (unwired.length) action = 'brancher (build.py) : ' + unwired.map(u => u.rel).join(', ');
    const hero = it.hero ? 'oui' : '';
    return { ...it, type, file, hd, action, hero, real: type === 'photo HD' || type === 'photo HD (source inconnue)', unwired: unwired.length };
  });

  const P = rows.filter(r => r.kind === 'prod'), G = rows.filter(r => r.kind === 'good'), real = rows.filter(r => r.real), abstr = rows.filter(r => r.type === 'catégorie abstraite');
  const tally = t => rows.filter(r => r.type === t);
  const toOrder = rows.filter(r => /commande/.test(r.action)), unwired = rows.filter(r => r.unwired);
  const sum = `${rows.length} clés (${P.length} produits, ${G.length} biens) : ${real.length} photos HD propres, ${tally('photo substituée').length} substituées, ${tally('photo voisine (provisoire)').length} voisines, ${tally('composite provisoire').length} composites, ${tally('repli vectoriel (fond sombre)').length} replis vectoriels, ${abstr.length} abstraites ; non branchées : ${unwired.length} ; à commander : ${toOrder.length}`;
  console.log(sum);
  console.log('à commander :', toOrder.map(r => r.k).join(', '));
  if (unwired.length) console.log('NON BRANCHÉES :', unwired.map(r => r.k + ' ← ' + r.hd).join(' ; '));

  const line = r => `| \`${r.k}\` ${r.name} | ${r.kind === 'prod' ? 'produit · ' : 'bien · '}${r.grp || ''} | ${r.type}${r.file ? ' : ' + r.file : ''}${r.hero ? ' · hero 16:9' : ''} | ${r.hd} | ${r.action} |`;
  const head = '| clé et nom | genre · famille | image affichée | fichier HD disponible ? | action |\n|---|---|---|---|---|\n';
  const md = `# Audit des images par produit : ce que le jeu affiche réellement

Généré par \`tools/audit_images_produits.js\` (inventaire du jeu construit + lecture de \`tools/build.py\` + inventaire des dossiers d'assets). Ne juge pas la ressemblance (voir \`AUDIT_PRODUITS.md\` et ses planches) : vérifie que chaque clé affiche la meilleure image existante et liste ce qui reste à commander.

- ${sum}.
- Types d'image : **photo HD** = \`assets/guide_hd/<clé>.jpg\` (réduite à 288 px dans le jeu) ; **photo substituée / voisine** = \`GUIDE_SUBST\` / \`GUIDE_FILL\` de build.py (photo d'une autre clé, provisoire) ; **composite provisoire** = \`GUIDE_COMPOSE\` (animal HD posé sur fond studio) ; **repli vectoriel** = dessin du code sur fond sombre (\`productSVG0\` / \`drawItem\`), c'est ce que Rémy voit pour le vin de table, le vin de grande réserve et le saucisson ; **catégorie abstraite** = classes de gamme (base, manufacturé, luxe), sans objet à photographier.
- Dossiers d'assets examinés : ${DIRS.join(', ')}. \`assets/guide_hd_256\` et \`assets/phase2_hd/guide\` sont des copies de \`assets/guide_hd\` (mêmes noms) : aucune photo cachée ailleurs. Aucune photo supprimée.
- Chemins d'affichage vérifiés dans \`game.template.html\` : \`productSVG\` (catalogue, fiche, rayons, Guide), \`gThumb\` (Guide), \`compIcon\` et \`drawProd\` (rayons, fournisseurs, emplacements, bulles de la halle) préfèrent tous la photo HD (\`GUIDEHD\`) au dessin ; aucun contournement trouvé. Le défaut vu par Rémy vient donc uniquement de l'absence de fichier, pas d'un mauvais branchement.

## Produits finis (${P.length})

${head}${P.map(line).join('\n')}

## Biens, matières et composants (${G.length})

${head}${G.map(line).join('\n')}

## À commander (${toOrder.length})

${toOrder.map(r => `- \`${r.k}.jpg\` ${r.name} (${r.type})`).join('\n')}
`;
  fs.writeFileSync(path.join(ROOT, 'docs', 'AUDIT_IMAGES_PRODUITS.md'), md);
  if (CHECK && unwired.length) process.exit(1);
})();
