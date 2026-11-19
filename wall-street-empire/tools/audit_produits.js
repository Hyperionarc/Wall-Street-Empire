#!/usr/bin/env node
// Audit des images de produits finis (PRODUCTS) et de biens (GOODS) : quelle image le jeu affiche réellement, HD ou repli, dimensions.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/audit_produits.js [dossier-planches]
//   -> inventaire JSON (stdout résumé), docs/AUDIT_PRODUITS.md régénéré, planches de contact PNG (rendu tel que le jeu l'affiche) dans le dossier donné.
// Les verdicts de fidélité viennent de tools/audit_produits_verdicts.json (jugés à l'œil sur les planches, pas calculés).
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), REPO = path.resolve(ROOT, '..');
const L = require('./tests/lib.js');
const OUT = process.argv[2] || null;

function jpegSize(buf) {   // dimensions d'un JPEG/PNG sans bibliothèque d'image
  if (buf[0] === 0x89 && buf[1] === 0x50) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  let i = 2; while (i < buf.length) { if (buf[i] !== 0xFF) { i++; continue; } const m = buf[i + 1], len = buf.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)]; i += 2 + len; }
  return null;
}
function fileInfo(dirs, key) {
  for (const d of dirs) for (const e of ['.jpg', '.jpeg', '.png', '.webp']) { const p = path.join(d, key + e); if (fs.existsSync(p)) { const s = jpegSize(fs.readFileSync(p)); return { file: path.relative(REPO, p), w: s && s[0], h: s && s[1] }; } }
  return null;
}
const GUIDE_DIRS = [path.join(ROOT, 'assets', 'guide_hd'), path.join(REPO, 'assets', 'guide_hd')];
const HERO_DIRS = [path.join(ROOT, 'assets', 'products_hd')];

async function inventory(pg) {
  return pg.evaluate(() => {
    const W = window.WSE, P = W.PRODUCTS, G = W.GOODS, A = W.imgAudit;
    const prods = Object.keys(P).map(k => ({ k, kind: 'prod', name: P[k].name, fam: W.famOf(k), guide: A.guide(k), hero: A.hero(k), vec: /^<svg/.test(A.productSVG0(k, 1)) }));
    const goods = Object.keys(G).map(k => ({ k, kind: 'good', name: G[k].name, grp: G[k].grp, guide: A.guide(k), hero: false, vec: !!A.compIconVec(k) }));
    return prods.concat(goods);
  });
}

// Planche : chaque carte montre l'image affichée par le jeu (vignette réelle) et le repli vectoriel, à 150 px
async function sheets(pg, items, out) {
  fs.mkdirSync(out, { recursive: true }); const per = 24, files = [];
  for (let s = 0; s * per < items.length; s++) {
    const part = items.slice(s * per, (s + 1) * per);
    await pg.evaluate(part => {
      let d = document.getElementById('auditsheet'); if (!d) { d = document.createElement('div'); d.id = 'auditsheet'; document.body.appendChild(d); }
      d.style.cssText = 'position:fixed;left:0;top:0;width:1280px;background:#3a3f4c;z-index:999999;display:grid;grid-template-columns:repeat(6,1fr);gap:4px;padding:4px;font:11px sans-serif;color:#fff';
      const W = window.WSE, A = W.imgAudit;
      d.innerHTML = part.map(it => {
        const shown = it.kind === 'prod' ? W.productSVG(it.k, 1) : (A.photo(it.k) ? `<img src="${A.photo(it.k)}" style="width:100%;height:100%;object-fit:cover">` : `<img src="${A.compIcon(it.k)}" style="width:100%;height:100%;object-fit:contain">`);
        const vec = it.kind === 'prod' ? A.productSVG0(it.k, 1) : `<img src="${A.compIconVec(it.k)}" style="width:100%;height:100%;object-fit:contain">`;
        return `<div style="background:#262a35;padding:3px;border-radius:4px"><div style="display:flex;gap:3px"><div style="width:140px;height:140px;background:#555">${shown}</div><div style="width:56px;height:56px;background:#555">${vec}</div></div><div><b>${it.k}</b> ${it.name}</div><div style="color:${it.guide ? '#9f9' : '#f99'}">${it.guide ? 'photo HD' : 'REPLI vectoriel'}${it.hero ? ' + hero' : ''}</div></div>`;
      }).join('');
    }, part);
    await pg.waitForTimeout(400);
    const f = path.join(out, `planche_produits_${String(s + 1).padStart(2, '0')}.png`);
    await pg.locator('#auditsheet').screenshot({ path: f }); files.push(f);
  }
  await pg.evaluate(() => { const d = document.getElementById('auditsheet'); if (d) d.remove(); });
  return files;
}

// Fermes : jugement à l'œil sur les captures de tools/capture_fermes.js (zooms zlv[1], zlv[0] et maximal), avant / après la passe 59
const FERMES = `
## Fermes (captures \`tools/capture_fermes.js\`, 3 zooms)

| ferme | avant (sprite HD seul) | passe 59 (code, par-dessus le sprite) | reste à faire (Cowork n° 11) |
|---|---|---|---|
| \`fwheat\` blé | tapis doré plat qui évoque du chaume, meules et figurines au milieu, aucun mouvement | blé dense (≈1 200 tiges au zoom rapproché) aux épis dorés, vagues de vent qui traversent le champ avec reflets clairs (effet « Gladiator »), meules retirées du champ | \`fwheat_sol.png\` (zone cultivée nue, sans figurines) |
| \`frapeseed\` colza | jaune vif lisible mais figé | tapis de fleurs jaune vif sur tiges vertes, ondulation | \`frapeseed_sol.png\` |
| \`fcorn\` maïs | rangs verts courts, ressemble à une jeune culture | rangées de hautes tiges (27-34 px), feuilles en arc, panicules et épis jaunes, sillons, balancement | \`fcorn_sol.png\` |
| \`fsugar\` canne | aplat vert | rangées serrées de tiges hautes vert clair, feuilles en lanières, balancement | \`fsugar_sol.png\` |
| \`fcotton\` coton | bourres blanches lisibles | inchangé (déjà fidèle) | — |
| \`frubber\` hévéa | rangs d'arbres ronds, lisible | inchangé | — |
| \`fvine\` vigne | quelques rangs peints, chai dominant | rangs palissés (piquets, fil, ceps, haie de feuillage), grappes noires de juillet à octobre, feuillage roux en automne, maigre l'hiver (taillé) | \`fvine_sol.png\` |
| \`fcattle\` bovins | vaches peintes petites et figées | 6 vaches HD plus grandes qui se promènent dans le pré (allure variable, se retournent), ombre au sol | \`fcattle_pre.png\`, cycles de marche |
| \`fsheep\` moutons | troupeau peint figé | 10 moutons animés | \`fsheep_pre.png\`, cycles de marche |
| \`fpig\` porcs | porcs roses peints figés | 8 porcs animés | \`fpig_pre.png\`, cycles de marche |
| \`fchicken\` poules | poules peintes minuscules | 14 poules animées qui picorent (sautillent) | \`fchicken_pre.png\`, cycles de marche |

Sous le zoom 0,4 le sprite seul est affiché (aucun coût). Effectifs proportionnels à la surface (consignes fermes). Tout est visuel et déterministe (rien en sauvegarde). Défaut honnête : les bêtes peintes du sprite restent visibles sous les bêtes animées (deux échelles) tant que les prés vides ne sont pas livrés ; à la vue normale (zlv[1]) les champs restent petits et le vent se voit peu, l'effet est net à partir du zoom rapproché.
`;
function writeMd(items, verdicts) {
  const rows = items.map(it => {
    const g = fileInfo(GUIDE_DIRS, it.k), h = it.kind === 'prod' ? fileInfo(HERO_DIRS, it.k) : null, v = verdicts[it.k] || {};
    const hero = h ? ` · hero \`${h.file}\` ${h.w}×${h.h}` : '';
    const img = v.img ? v.img + hero : g ? `\`${g.file}\` ${g.w}×${g.h}` + hero : it.guide ? 'photo HD (source dans build.py)' : '**repli vectoriel** (' + (it.kind === 'prod' ? 'productSVG0' : 'drawItem') + ')';
    return `| \`${it.k}\` ${it.name} | ${it.kind === 'prod' ? it.fam : it.grp} | ${img} | ${v.f || (it.guide ? 'fidèle' : 'absente')} | ${v.a || (it.guide ? '—' : 'commande Cowork')} |`;
  });
  const nP = items.filter(i => i.kind === 'prod'), nG = items.filter(i => i.kind === 'good');
  const bad = items.filter(i => /^(mauvais|moyen)/.test((verdicts[i.k] || {}).f || '')).map(i => '`' + i.k + '`'), rep = items.filter(i => !i.guide).map(i => '`' + i.k + '`');
  const md = `# Audit des images de produits et de biens\n\nGénéré par \`tools/audit_produits.js\` (inventaire automatique du jeu construit) ; la colonne fidélité est un jugement à l'œil sur les planches de contact (\`tools/audit_produits_verdicts.json\`).\n\n` +
    `- Produits finis : ${nP.length}, dont ${nP.filter(i => i.guide).length} avec photo HD (assets/guide_hd), ${nP.filter(i => i.hero).length} avec visuel de lancement 16:9 (assets/products_hd).\n` +
    `- Biens et matières : ${nG.length}, dont ${nG.filter(i => i.guide).length} avec photo HD.\n` +
    `- Sans photo HD (${rep.length}) : repli vectoriel explicite : ${rep.join(', ')}. Commande Cowork en fin de tools/factory_ai/RETOURS.md.\n` +
    `- Photo présente mais à refaire (${bad.length}, mauvaise ou moyenne) : ${bad.join(', ')}.\n` +
    `- Corrigé par le code (passe 59) : whisky (photo à pseudo-texte remplacée par la carafe sans texte), pull/bœuf/lait (photos existantes fidèles réaffectées), carcasses et laine (animal HD sur fond studio), 10 nouveaux dessins de repli (œufs, poulet, porc, agneau, saucisson, pull, vin de table, grand cru, chips ; raisin, œufs en vrac, carcasses, laine, vin côté biens), et la photo HD des biens désormais affichée dans les rayons, fournisseurs, emplacements et bulles de la halle (avant : toujours le dessin vectoriel).\n\n` +
    `Où l'image s'affiche : produits = \`productSVG\` (catalogue, fiche produit, paliers, rayons de magasin, Guide, vignettes de l'usine, cinéma de lancement en repli du hero) ; biens = \`gThumb\` (Guide) et \`compIcon\`/\`drawProd\` (rayons, fournisseurs, emplacements d'usine, bulles d'intrants) qui prennent la photo HD si elle existe, sinon le dessin vectoriel. Les palettes et caisses de la halle restent des formes (carton/caisse/sac) colorées : pas de photo collée sur un volume 3D.\n\n` +
    `| produit | famille | image | fidélité | action |\n|---|---|---|---|---|\n` + rows.join('\n') + '\n' + FERMES;
  fs.writeFileSync(path.join(ROOT, 'docs', 'AUDIT_PRODUITS.md'), md);
}

(async () => {
  const pg = await L.newPage({ w: 1280, h: 1000, wait: 900 });
  await pg.evaluate(() => { ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); });
  const items = await inventory(pg);
  const vf = path.join(__dirname, 'audit_produits_verdicts.json'), verdicts = fs.existsSync(vf) ? JSON.parse(fs.readFileSync(vf, 'utf8')) : {};
  writeMd(items, verdicts);
  const miss = items.filter(i => !i.guide);
  console.log(`produits ${items.filter(i => i.kind === 'prod').length} · biens ${items.filter(i => i.kind === 'good').length} · sans photo HD ${miss.length} : ${miss.map(i => i.k).join(', ')}`);
  if (OUT) { const f = await sheets(pg, items, OUT); console.log('planches :', f.join(' ')); }
  if (pg.errs.length) console.log('erreurs de page :', pg.errs.slice(0, 3).join(' ; '));
  await L.closeBrowser();
})();
