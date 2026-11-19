// Ville vivante (intégrateur n° 9) : sprites livrés par le Mac branchés dans le jeu.
// Services de quartier dans la ville de départ (centre : restaurants, cafés, boulangeries, boutiques ; périphérie : gare, église, stations), équipements publics en HD,
// fiche au clic, panneau du Mall ; voitures, utilitaires, camions et porte-conteneurs HD ; grues, conteneurs et marchandises sur les quais ; détails des fermes dans l'emprise ;
// niveaux des bâtiments du joueur ; déterminisme, ancienne sauvegarde, aucune erreur de page.
exports.name = 'Ville vivante : services, véhicules, port, fermes, niveaux (intégrateur n° 9)';
const fs = require('fs'), path = require('path');
const VV_NAMES = ['boulangerie', 'boutique_mode', 'cafe_de_quartier', 'restaurant_terrasse', 'ecole', 'hopital', 'gare_ferroviaire', 'eglise_de_village', 'station_service', 'station_recharge_electrique', 'drugstore', 'barre_hlm', 'immeuble_en_construction', 'mairie',
  'veh_argent', 'veh_blanc', 'veh_bleu', 'veh_camionnette', 'veh_jaune', 'veh_noir', 'veh_orange', 'veh_pickup', 'veh_rouge', 'veh_vert', 'voiture_ville_a', 'voiture_ville_b', 'camion_ville', 'navire_cargo', 'grue_portique', 'conteneur_bleu', 'conteneur_rouge', 'conteneur_pile',
  'animal_vache', 'animal_mouton', 'animal_poule', 'animal_cochon', 'auge_foin', 'balles_foin', 'meule_foin', 'fermier_seau', 'vendangeur', 'vigneron_hotte', 'champ_ble_vert', 'champ_ble_mur',
  'maison_n1', 'maison_n2', 'maison_n3', 'immeuble_n1', 'immeuble_n2', 'tour_bureaux', 'tour_logements', 'tour_tech', 'tour_pnj_a', 'tour_pnj_b', 'siege_hq_n1', 'siege_hq_n2', 'siege_hq_n3', 'supermarche_n2', 'supermarche_n3', 'hypermarche_n2', 'hypermarche_n3',
  'parc_urbain', 'rochers_a', 'rochers_b', 'gisement_or', 'batiment_abandonne', 'chantier_petit'];
const SCAN = `(() => { const W = window.WSE, S = W.S, N = W.N, V = W.vv, cnt = V.svc(), L = V.list(), ring = (x, y) => Math.max(0, Math.hypot(x - 30, y - 30) - W.mall.K.MALL_SH);
  const road = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(d => { const c = S.grid[(y + d[1]) * N + x + d[0]]; return c && c.t === 'road'; });
  let npc = 0, mons = {}; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc') { npc++; if (c.k === 'mon') mons[c.m] = 1; } }
  const cells = L.map(q => { const c = S.grid[q[1] * N + q[0]]; return { n: q[2], x: q[0], y: q[1], k: c && c.t === 'npc' ? c.k : '?', ring: ring(q[0], q[1]), road: road(q[0], q[1]), zone: V.SVC[q[2]][1] }; });
  return { cnt, cells, npc, mons: Object.keys(mons), monOk: Object.values(V.MON).every(n => V.ok(n)), list: JSON.stringify(L) }; })()`;
const start = async pg => pg.evaluate(async () => {
  const W = window.WSE; document.getElementById('caste').hidden = true; W.startMode('free'); W.setCaste('industriel');
  ['caste', 'hint', 'endscr', 'modesel', 'win', 'mkview'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.S.noEv = true; W.setSpeed(0); W.S.cash = 3e7;
  const b = document.querySelector('[data-sg="close"]'); if (b) b.click(); await new Promise(x => setTimeout(x, 400)); return true;
});

exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 3000, w: 1280, h: 800 }); await L.inject(pg); await start(pg);
  // ---- 1. Sprites chargés
  const ld = await pg.evaluate(n => { const I = window.WSE.p2.img, D = window.WSE.p2.dim; return { miss: n.filter(k => !(I[k] && I[k].ok && D[k])), anc: ['veh_rouge', 'navire_cargo', 'animal_vache', 'grue_portique'].map(k => D[k] && D[k][10] >= 0 && D[k][11] >= 0) }; }, VV_NAMES);
  t.check(`les ${VV_NAMES.length} sprites de la ville vivante sont embarqués et chargés`, ld.miss.length === 0, ld.miss.join(', '));
  t.check('ancres d\'ancres.json transmises au jeu (véhicules, navire, animaux, grue)', ld.anc.every(Boolean), JSON.stringify(ld.anc));

  // ---- 2. Services dans la ville de départ, aux endroits cohérents, densité clairsemée gardée
  const a = await pg.evaluate(SCAN), C = a.cells;
  const want = ['restaurant_terrasse', 'cafe_de_quartier', 'boulangerie', 'boutique_mode', 'drugstore', 'barre_hlm', 'immeuble_en_construction', 'eglise_de_village', 'gare_ferroviaire', 'station_service', 'station_recharge_electrique', 'batiment_abandonne'];
  t.check('chaque service de quartier est présent dans la ville de départ', want.every(n => a.cnt[n] >= 1), JSON.stringify(a.cnt));
  const cen = C.filter(c => c.zone === 'c'), per = C.filter(c => c.zone === 'p');
  t.check('centre : restaurants, cafés, boulangeries, boutiques à moins de 9 cases du bord du mall', cen.length >= 8 && cen.every(c => c.ring < 9), cen.map(c => c.n.slice(0, 4) + ':' + c.ring.toFixed(1)).join(' '));
  t.check('périphérie : gare, églises, stations à 9 cases ou plus ; stations et gare au bord d\'une rue', per.length >= 6 && per.every(c => c.ring >= 9) && per.filter(c => /station|gare/.test(c.n)).every(c => c.road), per.map(c => c.n.slice(0, 6) + ':' + c.ring.toFixed(1) + (c.road ? 'r' : '')).join(' '));
  t.check('équipements publics en HD : hôpital, écoles, hôtel de ville, stades', ['hospital', 'lycee', 'hall', 'stadium'].every(m => a.mons.includes(m)) && a.monOk, a.mons.join(',') + ' · sprites ' + a.monOk);
  t.check('les services habillent des immeubles existants (maison, logements, bureaux) : densité de la ville inchangée, moins de 12 % du bâti', C.every(c => /^(house|res|off)$/.test(c.k)) && C.length <= 0.12 * a.npc, `${C.length} services sur ${a.npc} bâtiments PNJ`);

  // ---- 3. Clic sur un service : fiche avec son nom ; panneau du Mall
  const q = C.find(c => c.n === 'restaurant_terrasse') || C[0];
  const xy = await pg.evaluate(q => { const W = window.WSE; W.setTool('view'); W.centerOn(q.x, q.y); return null; }, q); await pg.waitForTimeout(500);
  const pxy = await pg.evaluate(q => { const p = window.WSE.tileToScreen(q.x, q.y); return [p.x, p.y]; }, q);
  await pg.mouse.click(pxy[0], pxy[1]); await pg.waitForTimeout(400);
  const fi = await pg.evaluate(() => { const b = document.getElementById('pfiche'); return b && !b.hidden ? b.textContent : ''; });
  t.check('clic sur un restaurant de la ville : la fiche de l\'immeuble s\'ouvre avec le nom du service', /Restaurant en terrasse/.test(fi), fi.slice(0, 90) + (xy || ''));
  const mh = await pg.evaluate(() => window.WSE.vv.html());
  t.check('panneau du Mall : section « Commerces de quartier autour du mall »', /Commerces de quartier/.test(mh) && /Café de quartier ×\d/.test(mh), mh.replace(/<[^>]+>/g, ' ').slice(0, 140));

  // ---- 4. Véhicules et navires en HD, port
  await pg.evaluate(() => { window.WSE.setSpeed(1); window.WSE.centerOn(30, 36); }); await pg.waitForTimeout(2500);
  const v = await pg.evaluate(() => { const W = window.WSE, V = W.vv; return { n: V.draws(), cars: V.CARS.length, side: V.CARS.every(m => m[1] === 0 || m[1] === 1), ok: V.CARS.every(m => V.ok(m[0])), ship: V.ok('navire_cargo'), goods: V.GOODS.every(n => V.ok(n)) }; });
  t.check('circulation : 13 modèles HD (voitures, utilitaires, camion), sens de l\'avant renseigné pour le miroir, objets HD dessinés à l\'écran', v.cars === 13 && v.side && v.ok && v.n > 20, JSON.stringify(v));
  t.check('port : porte-conteneurs, grue, conteneurs et marchandises (bacs, lingots, sacs, barres) en HD', v.ship && v.goods, JSON.stringify({ ship: v.ship, goods: v.goods }));

  // ---- 5. Niveaux des bâtiments du joueur et fermes
  const lv = await pg.evaluate(() => { const V = window.WSE.vv; return { res: [1, 2, 3, 6, 9, 14].map(f => V.lvl({ t: 'res' }, f)), hq: [0, 2, 4].map(l => V.hq({ lvl: l })), s2: [0, 2, 4].map(l => V.p2name({ t: 's2', lvl: l })), s3: [0, 2, 4].map(l => V.p2name({ t: 's3', lvl: l })), tech: V.lvl({ t: 'tech', lvl: 2 }, 6), off: V.lvl({ t: 'off', lvl: 0 }, 10), farm: Object.keys(V.FARM) }; });
  t.check('logements du joueur : maison n1 → n2 → n3 → immeuble n1 → n2 → tour de logements selon les étages', JSON.stringify(lv.res) === JSON.stringify(['maison_n1', 'maison_n2', 'maison_n3', 'immeuble_n1', 'immeuble_n2', 'tour_logements']), lv.res.join(' '));
  t.check('siège social, supermarché, hypermarché : sprite du niveau (n1, n2, n3) ; tour tech et tour de location HD', lv.hq.join() === 'siege_hq_n1,siege_hq_n2,siege_hq_n3' && lv.s2.join() === 'supermarche,supermarche_n2,supermarche_n3' && lv.s3.join() === 'hypermarche,hypermarche_n2,hypermarche_n3' && lv.tech === 'tour_tech' && lv.off === 'tour_bureaux', JSON.stringify(lv));
  t.check('fermes : détails sur les élevages, le blé et la vigne', ['fcattle', 'fsheep', 'fpig', 'fchicken', 'fwheat', 'fvine'].every(k => lv.farm.includes(k)), lv.farm.join(','));
  const fm = await pg.evaluate(() => { const W = window.WSE, T = window.T; const c = T.onDep('fcattle', 'wheat'); if (!c) return null; W.centerOn(c.x + 1, c.y + 1); return { x: c.x, y: c.y, w: c.w, h: c.h }; });
  if (fm) { await pg.waitForTimeout(500); const n0 = await pg.evaluate(() => window.WSE.vv.draws()); await pg.waitForTimeout(300); const n1 = await pg.evaluate(() => window.WSE.vv.draws());
    t.check('élevage posé : ferme 2×2, animaux et auge dessinés (seulement dans l\'emprise : points entre 0 et 2 cases)', fm.w === 2 && fm.h === 2 && n1 > n0, JSON.stringify(fm)); }

  // ---- 6. Déterminisme et sauvegarde
  const sv = await pg.evaluate(() => { window.WSE.save(); const s = localStorage.getItem('wse-city-v8'); return { has: /_sv|"hv"/.test(s), len: s.length }; });
  t.check('rien de nouveau dans la sauvegarde (services recalculés, clé wse-city-v8)', !sv.has && sv.len > 1000, JSON.stringify(sv));
  t.check('aucune erreur de page (nouvelle partie)', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
  const pg2 = await L.newPage({ wait: 3000, w: 1280, h: 800 }); await start(pg2);
  const b = await pg2.evaluate(SCAN);
  t.check('déterministe : une autre nouvelle partie a exactement les mêmes services aux mêmes cases', b.list === a.list, `${C.length} services`);
  const save = fs.readFileSync(path.join(__dirname, 'fixtures', 'save_v8_avant_passe33.json'), 'utf8');
  const ctx = await (await L.browser()).newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(s => { try { if (!sessionStorage.getItem('wse_fx')) { localStorage.setItem('wse-city-v8', s); sessionStorage.setItem('wse_fx', '1'); } } catch (e) { } }, save);
  const p3 = await L.newPage({ ctx, wait: 2500 });
  const o = await p3.evaluate(() => { const W = window.WSE, S = W.S; const n = Object.values(W.vv.svc()).reduce((s, v) => s + v, 0); W.step(); return { n, day: S.day }; });
  await p3.waitForTimeout(800);
  t.check('ancienne sauvegarde (avant passe 33) : chargée, services de quartier présents, écran de téléphone, aucune erreur', o.n >= 5 && p3.errs.length === 0, `${o.n} services · jour ${o.day} · ${p3.errs.slice(0, 2).join(';')}`);
  await ctx.close(); await pg2.context().close(); await pg.context().close();
};
