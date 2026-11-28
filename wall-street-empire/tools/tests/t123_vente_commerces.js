// Vente aux commerces de la ville (responsable Vente aux commerces, constat de Rémy : « Je suis censé pouvoir VENDRE dans ce commerce spécialisé », « et donc réellement l'ouvrir »).
// Un commerce de quartier (pharmacie, boulangerie, café, restaurant, boutique de mode) s'ouvre comme un magasin du joueur (intérieur animé, grille d'emplacements, cartes
// fournisseurs) en lecture seule ; « Vendre ici » propose un produit lancé (prix de gros, volume) ; l'acheteur (déterministe) accepte un produit compétitif et refuse, avec un motif,
// un produit trop cher ou de mauvaise qualité ; les livraisons sont facturées à 30 jours (créances) ; retirer le produit arrête les ventes ; sauvegarde et rechargement intacts.
// Captures si WSE_SHOTS est défini (répertoire) : fiche, vue des rayons, référencement accepté, ventes après quelques jours.
exports.name = 'Vente aux commerces de la ville : ouvrir le commerce, référencer, créances';
const OUT = process.env.WSE_SHOTS || '';
exports.run = async (t, L) => {
  if (OUT) require('fs').mkdirSync(OUT, { recursive: true });
  const shot = async (pg, n) => { if (OUT) await pg.screenshot({ path: OUT + '/vente_' + n + '.jpg', type: 'jpeg', quality: 80 }); };
  const pg = await L.newPage({ w: 1280, h: 800, wait: 900 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel{display:none !important}' });
  const ph = await pg.evaluate(() => { const W = window.WSE, S = W.S; try { W.quickProduce('soap'); } catch (e) { } window.T.stepN(20, true);
    const sh = W.bsh.shops().find(s => s.n === 'drugstore'); window._ph = sh; return sh ? { x: sh.x, y: sh.y, k: sh.k, n: W.bsh.shops().length, st: S.prod.soap.st, stock: Math.round(S.prod.soap.stock) } : null; });
  t.check('la ville a des commerces de quartier qui achètent en gros (une pharmacie au moins)', ph && ph.n >= 5, JSON.stringify(ph));
  if (!ph) return;
  // ---- 1. Fiche de l'immeuble : « Vendre ici » à côté de « Racheter » ; étiquette de survol
  const f = await pg.evaluate(async p => { const W = window.WSE, S = W.S, c = S.grid[p.y * W.N + p.x]; W.centerOn(p.x, p.y); await new Promise(r => setTimeout(r, 300)); W.pro.open(p.x, p.y); await new Promise(r => setTimeout(r, 150));
    const b = document.getElementById('pfiche'); return { txt: b.innerText, sell: !!b.querySelector('[data-pf="sellhere"]'), keep: !!b.querySelector('[data-pf="keep"]'), hov: (W.mapLabel(p.x, p.y) || {}).s || '', tag: W.ui && W.ui.selInfo ? W.ui.selInfo(c).s : '' }; }, ph);
  t.check('fiche d\'un commerce de la ville : bouton « Vendre ici » à côté de « Racheter pour louer »', f.sell && f.keep && /Vendre ici/.test(f.txt), f.txt.replace(/\s+/g, ' ').slice(0, 160));
  t.check('survol : étiquette courte « Vend : … · tes produits : N »', /Vend : médicaments.* · tes produits : 0/.test(f.hov), f.hov);
  await shot(pg, '1_fiche');
  // ---- 2. « Vendre ici » ouvre le commerce : même fenêtre que les magasins (intérieur, grille, cartes fournisseurs), lecture seule
  await pg.click('#pfiche [data-pf="sellhere"]'); await pg.waitForTimeout(500);
  const o = await pg.evaluate(() => { const bv = document.getElementById('bview'), sc = window.WSE.scene; return { open: !bv.hidden, shop: bv.classList.contains('shop'), name: document.getElementById('bname').textContent, slots: bv.querySelectorAll('.shgrid .shs').length, free: bv.querySelectorAll('.shgrid .shs.empty').length, cards: bv.querySelectorAll('.shpan .shsc').length, ro: /lecture seule/.test(bv.innerText), scene: sc && sc.kind, cust: sc && sc.cust ? sc.cust.length : -1, txt: bv.querySelector('.shpan').innerText.slice(0, 200), fiche: !document.getElementById('pfiche').hidden }; });
  t.check('« Vendre ici » ouvre le commerce (PHARMACIE) dans la fenêtre des magasins : grille d\'emplacements, fournisseurs en cartes, lecture seule, fiche fermée', o.open && o.shop && o.name === 'PHARMACIE' && o.slots >= 8 && o.cards >= 1 && o.ro && !o.fiche, JSON.stringify(o).slice(0, 260));
  t.check('intérieur dessiné avec visiteurs (scène de magasin)', o.scene === 'retail', `scène ${o.scene}, ${o.cust} visiteurs`);
  t.check('rayons : médicaments (grossiste répartiteur) et hygiène (grossiste, rivaux) avec prix, qualité, marque, part du rayon', /Prix de gros[\s\S]*Qualité[\s\S]*Marque[\s\S]*Part du rayon/.test(o.txt), o.txt.replace(/\s+/g, ' '));
  await shot(pg, '2_rayons');
  // ---- 3. Décisions de l'acheteur : compétitif accepté, trop cher refusé, qualité insuffisante refusée (motifs lisibles), déterministe
  const d = await pg.evaluate(() => { const W = window.WSE, S = W.S, B = W.bsh, sh = window._ph, px = W.prodPrice('soap'), mx = B.maxPx(sh, 'soap', 40);
    const e2 = B.eval(sh, 'soap', px * 3, 40), rt = S.prod.soap.rt; S.prod.soap.rt = 8; const e3 = B.eval(sh, 'soap', mx ? mx * 0.95 : px, 40); S.prod.soap.rt = rt;
    const a = B.eval(sh, 'soap', mx * 0.95, 40), b = B.eval(sh, 'soap', mx * 0.95, 40);
    return { mx, px, e2: [e2.ok, e2.why], e3: [e3.ok, e3.why], det: a.ok === b.ok && a.me.B === b.me.B && a.th === b.th, okBelow: a.ok, okAbove: B.eval(sh, 'soap', mx * 1.08, 40).ok }; });
  t.check('produit trop cher (×3) : refusé, motif « trop cher face à … »', !d.e2[0] && /^trop cher face à .+ : [\d,]+ \$ contre [\d,]+ \$/.test(d.e2[1]), d.e2[1]);
  t.check('produit de mauvaise qualité : refusé, motif « qualité insuffisante »', !d.e3[0] && /^qualité insuffisante : \d+ contre \d+ chez /.test(d.e3[1]), d.e3[1]);
  t.check('décision déterministe ; un prix de gros sous le seuil passe, au-dessus non', d.det && d.mx > 0 && d.okBelow && !d.okAbove, `seuil ${d.mx && d.mx.toFixed(3)} $ (prix catalogue ${d.px.toFixed(3)} $)`);
  // ---- 4. Proposer depuis la fenêtre (clics réels) : baisser le prix jusqu'à l'accord, proposer
  const si = await pg.evaluate(() => { const B = window.WSE.bsh, car = B.carried(window._ph); return car.indexOf('soap'); });
  await pg.click(`#bview .shgrid .shs:nth-child(${si + 1})`); await pg.waitForTimeout(150);
  for (let i = 0; i < 12; i++) { const ok = await pg.evaluate(() => { const e = document.querySelector('#bview .bshev'); return e ? e.classList.contains('pos') : true; }); if (ok) break; await pg.click('#bview [data-act="bdpx:soap:-5"]'); await pg.waitForTimeout(80); }
  const jr0 = await pg.evaluate(() => (window.WSE.S.jr || []).length);
  await pg.click('#bview [data-act="bprop:soap"]'); await pg.waitForTimeout(250);
  const acc = await pg.evaluate(p => { const W = window.WSE, S = W.S, Lk = S.bsh && S.bsh.L[p.k], bv = document.getElementById('bview'), jr = (S.jr || []).map(e => JSON.stringify(e)).join(' ');
    return { L: Lk && Lk.ls.soap ? { px: Lk.ls.soap.px, vol: Lk.ls.soap.vol } : null, me: !!bv.querySelector('.shgrid .shs.bshme'), card: /Toi \(référencé\)/.test(bv.innerText), jr: /Référencement obtenu/.test(jr), hov: W.mapLabel(p.x, p.y).s }; }, ph);
  t.check('« Proposer le référencement » (clic) : produit référencé, carte « Toi (référencé) » dans le rayon, journal « Référencement obtenu »', acc.L && acc.me && acc.card && acc.jr, JSON.stringify(acc).slice(0, 220));
  t.check('survol après référencement : « tes produits : 1 »', /tes produits : 1/.test(acc.hov), acc.hov);
  await shot(pg, '3_reference');
  // ---- 5. Ventes réelles et créances à 30 jours
  const s = await pg.evaluate(p => { const W = window.WSE, S = W.S, B = W.bsh; W.closeBuilding(); const q0 = S.ar ? S.ar.q.length : 0; let vs = 0, qs = 0, arIn = true;
    for (let i = 0; i < 8; i++) { window.T.frz(); W.step(); const D = S._bshD || {}; vs += D.v || 0; qs += D.q || 0; const last = S.ar.q[S.ar.q.length - 1]; if (!(last >= (S._b2b.bsh || 0) - 1e-6)) arIn = false; }
    const L = S.bsh.L[p.k].ls.soap; return { vs, qs, arIn, ar: B.ar(p.k), h: L.h.length, f: L.f, q: L.q, cut: B.cut('soap'), b2b: S._b2b }; }, ph);
  t.check('ventes réelles au commerce (demande de sa zone de chalandise, part du rayon)', s.qs > 1 && s.q > 0, `${s.qs.toFixed(1)} articles en 8 jours, ${s.vs.toFixed(2)} $ facturés`);
  t.check('ventes payées à 30 jours : elles entrent dans les créances (S.ar) et dans « Tes créances ici »', s.arIn && s.ar > 0 && Math.abs(s.ar - s.vs) < 0.05 * s.vs + 1 && s.h === 8, `créances ici ${s.ar.toFixed(2)} $ pour ${s.vs.toFixed(2)} $ livrés`);
  t.check('la vente en gros anonyme exclut les commandes de ce commerce (somme = référencements + reste)', s.cut > 0 && s.cut < 0.95 && s.b2b.bsh > 0 && s.b2b.v >= s.b2b.bsh, `part retirée ${(100 * s.cut).toFixed(2)} %`);
  await pg.evaluate(p => window.WSE.bsh.open(p.x, p.y), ph); await pg.waitForTimeout(400);
  await pg.evaluate(() => { const B = window.WSE.bsh, i = B.carried(window._ph).indexOf('soap'); window.WSE.bAct('bslot:' + i); }); await pg.waitForTimeout(150);
  const kp = await pg.evaluate(() => document.getElementById('bview').innerText);
  t.check('fiche du commerce : indicateurs sobres (fréquentation, rotation, couverture, ta part de ses rayons, créances)', /FRÉQUENTATION|Fréquentation/.test(kp) && /Rotation|ROTATION/.test(kp) && /Ta part de ses rayons|TA PART DE SES RAYONS/i.test(kp) && /créances ici/i.test(kp), '');
  await shot(pg, '4_ventes');
  // ---- 6. Sauvegarde et rechargement (référencement gardé) ; ancienne sauvegarde sans le champ
  const sv = await pg.evaluate(() => { window.WSE.save(); const raw = JSON.parse(localStorage.getItem('wse-city-v8')); return { has: !!(raw.bsh && raw.bsh.L), raw: JSON.stringify(raw.bsh || null).slice(0, 200) }; });
  const ctx = pg.context(), pg2 = await ctx.newPage(); pg2.errs = []; pg2.on('pageerror', e => pg2.errs.push(e.message)); await pg2.goto(L.URL); await pg2.waitForTimeout(1500);
  const re = await pg2.evaluate(p => { const W = window.WSE, S = W.S; const E = S.bsh && S.bsh.L[p.k]; return { ok: !!(E && E.ls.soap), px: E && E.ls.soap.px, h: E && E.ls.soap.h.length, day: S.day }; }, ph);
  const px0 = await pg.evaluate(p => window.WSE.S.bsh.L[p.k].ls.soap.px, ph);
  t.check('sauvegarde (clé wse-city-v8, champ facultatif bsh) et rechargement : référencement intact', sv.has && re.ok && Math.abs(re.px - px0) < 1e-3 && re.h === 8, JSON.stringify(re));
  const old = await pg2.evaluate(() => { const raw = JSON.parse(localStorage.getItem('wse-city-v8')); delete raw.bsh; localStorage.setItem('wse-city-v8', JSON.stringify(raw)); return raw.day; });
  const pg3 = await ctx.newPage(); pg3.errs = []; pg3.on('pageerror', e => pg3.errs.push(e.message)); await pg3.goto(L.URL); await pg3.waitForTimeout(1500);
  const o3 = await pg3.evaluate(() => { const W = window.WSE, S = W.S; W.setSpeed(0); const d0 = S.day; W.step(); W.step(); return { day: d0, bsh: S.bsh ? Object.keys(S.bsh.L || {}).length : 0, cash: Number.isFinite(S.cash) }; });
  t.check('ancienne sauvegarde (sans le champ) : rechargée intacte, aucun référencement, la partie continue', o3.day === old && o3.bsh === 0 && o3.cash && pg3.errs.length === 0, JSON.stringify(o3) + ' ' + pg3.errs.slice(0, 2).join(' | '));
  await pg2.close(); await pg3.close();
  // ---- 7. Retirer le produit arrête les ventes
  await pg.click('#bview [data-act="bdel:soap"]'); await pg.waitForTimeout(150);
  const w = await pg.evaluate(p => { const W = window.WSE, S = W.S; W.closeBuilding(); let q = 0; for (let i = 0; i < 3; i++) { window.T.frz(); W.step(); q += (S._bshD && S._bshD.q) || 0; } return { gone: !(S.bsh.L[p.k] && S.bsh.L[p.k].ls.soap), q, hov: W.mapLabel(p.x, p.y).s }; }, ph);
  t.check('« Retirer le produit » : référencement supprimé, plus aucune livraison', w.gone && w.q === 0 && /tes produits : 0/.test(w.hov), JSON.stringify(w));
  // ---- 8. Autres commerces : une boulangerie s'ouvre aussi (pain), un restaurant par « Ouvrir » de l'étiquette
  const bk = await pg.evaluate(async () => { const W = window.WSE, B = W.bsh, sh = B.shops().find(s => s.n === 'boulangerie'), rs = B.shops().find(s => s.n === 'restaurant_terrasse'); if (!sh) return null; B.open(sh.x, sh.y); await new Promise(r => setTimeout(r, 200)); const n1 = document.getElementById('bname').textContent, car = B.carried(sh);
    W.closeBuilding(); const c = W.S.grid[rs.y * W.N + rs.x], I = W.ui && W.ui.selInfo ? W.ui.selInfo(c) : null; if (I && I.open) I.open(); await new Promise(r => setTimeout(r, 200)); const n2 = document.getElementById('bname').textContent, v = !document.getElementById('bview').hidden; W.closeBuilding(); return { n1, car, n2, v, bread: B.dem(sh, 'bread') }; });
  t.check('boulangerie de la ville : s\'ouvre, vend du pain (demande de sa zone > 0)', bk && bk.n1 === 'BOULANGERIE' && bk.car.indexOf('bread') >= 0 && bk.bread > 0, JSON.stringify(bk));
  t.check('restaurant : « Ouvrir » de l\'étiquette entre dans le commerce', bk && bk.v && bk.n2 === 'RESTAURANT EN TERRASSE', bk && bk.n2);
  const nan = await pg.evaluate(() => window.T.scan().filter(x => /bsh/.test(x)));
  t.check('aucun NaN dans l\'état de la vente aux commerces', nan.length === 0, nan.slice(0, 3).join(' '));
  t.check('0 erreur de page', pg.errs.length === 0 && pg2.errs.length === 0, pg.errs.concat(pg2.errs).slice(0, 3).join(' | '));
  await pg.close();
};
