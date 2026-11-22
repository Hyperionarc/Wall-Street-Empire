// Passe 99 : couverture HD (docs/AUDIT_HD_COUVERTURE.md). Rémy : « Tu n'as pas chargé toutes les images en HD » ; « la pharmacie, tu me l'as fait apparaître dans la TRÈS ANCIENNE version ».
// Chaque élément est rendu seul dans un canevas dont drawImage est instrumenté (tools/audit_hd.js) : on vérifie le NOM du PNG réellement dessiné.
exports.name = 'Couverture HD : sprites branchés, pharmacie récente, aucun PNG orphelin';
const A = require('../audit_hd.js');
const EXPECT = { 'bank:n0': 'banque', 'bank:n4': 'banque', 's4:n0': 'bat_mega_centre_commercial', 'dc:n0': 'data_center_campus', 'mon:police': 'commissariat', 'mon:fire': 'caserne_pompiers',
  spharma: 'pharmacie', 'sv:drugstore': 'pharmacie', 's2:n0': 'bat_supermarche', 's3:n4': 'bat_hypermarche_n3', 'mon:hospital': 'hopital' };
const VEC_OK = { sbrico: 'brico_outillage non livré (commande n°9 / 17 bis)' };
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 2500 }); await L.setup(pg, {});
  await pg.waitForFunction(() => Object.values(window.WSE.gfx.P2_IMG).every(e => e.ok), null, { timeout: 30000 }).catch(() => {});
  const r = await A.inventaire(pg), by = {}; r.rows.forEach(x => { by[x.id] = x; });
  const bad = Object.keys(EXPECT).filter(k => !by[k] || by[k].spr.split(', ').indexOf(EXPECT[k]) < 0);
  t.check('sprites HD attendus réellement dessinés (banque, méga-centre, campus data center, commissariat, caserne, pharmacie, supermarchés)', !bad.length, bad.map(k => k + ' -> ' + (by[k] ? by[k].spr || by[k].mode : 'absent')).join(' ; '));
  const vec = r.rows.filter(x => /VECTORIEL|atlas|erreur|rien/.test(x.mode) && !VEC_OK[x.id]);
  t.check('aucun bâtiment, équipement, service, véhicule ni décor en vectoriel ou atlas Kenney (hors commandes en attente)', !vec.length, vec.map(x => x.id + ':' + x.mode).join(', '));
  const old = r.rows.filter(x => /(^|, )(drugstore|bat_drugstore|mega_centre_commercial|banque_neoclassique)(,|$)/.test(x.spr) && !/^Ville/.test(x.fam));
  t.check('anciennes versions jamais dessinées pour le joueur ni les services (drugstore 17/11, méga-centre à parking, banque à pièce d\'or)', !old.length, old.map(x => x.id + ':' + x.spr).join(', '));
  const sh = new Set(r.rows.filter(x => /^navire:/.test(x.id)).map(x => x.spr));
  t.check('navires variés (au moins 5 sprites HD différents sur les 7 bateaux)', sh.size >= 5, [...sh].join(' | '));
  const md = A.report(r, null), orph = (md.match(/\| à vérifier \|/g) || []).length;
  t.check('chaque PNG HD absent de la carte a une raison écrite (version remplacée, intérieur d\'usine, pas de type de jeu…)', orph === 0, orph + ' PNG sans raison');
  const ph = await pg.evaluate(() => { const W = window.WSE; return { t: W.p2.type.spharma, dim: (W.p2.dim.pharmacie || []).slice(0, 2) }; });
  t.check('pharmacie du joueur = pharmacie.png la plus récente (268×209, croix verte lumineuse ; enseigne PHARMACIE peinte en façade)', ph.t === 'pharmacie' && ph.dim[0] === 268 && ph.dim[1] === 209, JSON.stringify(ph));
  // artefacts : liseré sombre (bord semi-transparent mélangé au fond noir du rendu) corrigé au build (_defringe)
  const fr = await pg.evaluate(names => names.map(n => { const e = window.WSE.p2.img[n]; if (!e || !e.ok) return [n, null]; const im = e.im, w = im.naturalWidth, h = im.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, w, h).data, A = i => d[i * 4 + 3], Lu = i => 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; let n0 = 0, bad = 0;
    for (let y = 2; y < h - 2; y++) for (let x = 2; x < w - 2; x++) { const i = y * w + x, a = A(i); if (a < 10 || a >= 250) continue; let so = 0, no = 0, tr = false;
      for (let v = -2; v <= 2; v++) for (let u = -2; u <= 2; u++) { const j = i + v * w + u, b = A(j); if (b >= 250) { so += Lu(j); no++; } else if (b < 10) tr = true; }
      if (!no || !tr) continue; n0++; if (Lu(i) < so / no - 45) bad++; }
    return [n, n0 ? +(bad / n0).toFixed(3) : 0]; }), ['centre_rd', 'stade_sport', 'bat_mega_centre_commercial', 'tour_bureaux', 'banque', 'siege_hq_n1', 'entrepot', 'pharmacie', 'caserne_pompiers']);
  t.check('pas de liseré sombre autour des sprites (moins de 8 % des pixels de bord nettement plus sombres que l\'objet)', fr.every(x => x[1] != null && x[1] < 0.08), fr.map(x => x[0] + ' ' + x[1]).join(' · '));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
  // voitures : espacement et déterminisme dans une ville de 100 000 habitants (tools/voitures_espacement.js ; avant la passe 99 : 1 paire trop proche et 0,52 superposée par relevé, non déterministe)
  const p2 = await L.newPage({ wait: 1500 }), V = await require('../voitures_espacement.js').mesure(p2);
  t.check('voitures espacées : ≤ 0,3 paire trop proche (< 24 px) et ≤ 0,1 superposée (< 12 px) par relevé, circulation fluide, déterministe', V.prochesParRelevé <= 0.3 && V.superposéesParRelevé <= 0.1 && V.enMouvement >= 0.6 && V.deterministe && V.voitures >= 40, JSON.stringify(V));
  t.check('aucune erreur de page (circulation)', p2.errs.length === 0, p2.errs.slice(0, 2).join(' | '));
  await p2.context().close();
};
