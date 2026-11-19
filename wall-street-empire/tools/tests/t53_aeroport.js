// Passe 49 : l'Aéroport et son duty free. Un seul aéroport par carte (6×4 cases, en périphérie sud, contre la route du sud), trafic selon la taille de la région et le PIB,
// boutique duty free ouverte au joueur comme aux rivaux : prix +30 %, redevance de 35 % du CA, trafic partagé entre les vendeurs (saturation), sauvegarde, déterminisme,
// rentabilité : meilleure qu'un magasin au démarrage (presque sans investissement), inférieure à un grand magasin à volume égal.
exports.name = 'Aéroport et duty free (passe 49)';
const CLS = ['basic', 'std', 'lux'];
exports.run = async (t, L) => {
  // ---- 1. Placement, panneau au clic réel
  const pg = await L.newPage({ wait: 2600, w: 1280, h: 720 }); await L.inject(pg);
  await pg.evaluate(async () => { const W = window.WSE; document.getElementById('caste').hidden = true; W.startMode('free'); W.setCaste('industriel');
    ['caste', 'hint', 'endscr', 'modesel', 'win'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); W.S.noEv = true; W.setSpeed(0); W.S.cash = 3e7;
    const b = document.querySelector('[data-sg="close"]'); if (b) b.click(); await new Promise(x => setTimeout(x, 400)); try { W.mk.act('close'); } catch (e) {} });
  const st = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, P = W.air.pos(); let n = 0, dep = 0, city = 0; const cells = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const c = S.grid[y * N + x]; if (c && c.t === 'npc' && c.k === 'mon' && c.m === 'air') { n++; cells.push([x, y]); if (S.dep[y * N + x]) dep++; if (W.inCity(x, y)) city++; } }
    const isR = (x, y) => x >= 0 && y >= 0 && x < N && y < N && S.grid[y * N + x] && S.grid[y * N + x].t === 'road', ring = [];
    for (let k = -1; k <= P.w; k++) ring.push([P.x + k, P.y - 1], [P.x + k, P.y + P.h]); for (let k = 0; k < P.h; k++) ring.push([P.x - 1, P.y + k], [P.x + P.w, P.y + k]);
    const r0 = ring.find(r => isR(r[0], r[1])), seen = new Uint8Array(N * N), q = r0 ? [r0] : []; if (r0) seen[r0[1] * N + r0[0]] = 1;
    while (q.length) { const [x, y] = q.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const X = x + d[0], Y = y + d[1]; if (!isR(X, Y) || seen[Y * N + X]) return; seen[Y * N + X] = 1; q.push([X, Y]); }); }
    const M = W.mall.pos(), toMall = seen[(M.y - 1) * N + M.x - 1] === 1;
    return { P, n, dep, city, road: !!r0, toMall, pax: W.air.pax(), popE: W.mall.popE(), mon: cells.length }; });
  t.check('un seul aéroport de 6×4 cases (24 cases), hors de la ville, sur aucun gisement', st.P && st.P.w === 6 && st.P.h === 4 && st.n === 24 && st.city === 0 && st.dep === 0, JSON.stringify(st.P) + ` cases ${st.n} · en ville ${st.city} · gisements ${st.dep}`);
  t.check('en périphérie (au sud de la zone d\'extension de la ville) et relié par route au mall', st.P.y >= 56 && st.road && st.toMall, JSON.stringify({ y: st.P.y, road: st.road, mall: st.toMall }));
  t.range('trafic de départ (passagers par jour)', st.pax, 3000, 7000, '', 0);
  const pax2 = await pg.evaluate(() => { const S = window.WSE.S, p0 = S.pop, b0 = S.bx; S.pop *= 2; S.bx = (S.bx || 0) * 2; const v = window.WSE.air.pax(); S.pop = p0; S.bx = b0; return v; });
  t.check('le trafic croît avec la région (habitants ×2 : passagers ×1,8 au moins)', pax2 > 1.8 * st.pax, `${Math.round(st.pax)} → ${Math.round(pax2)}`);
  await pg.evaluate(() => { const W = window.WSE, P = W.air.pos(); W.setTool('view'); W.step(); W.centerOn(P.x + 3, P.y + 2); });
  await pg.waitForTimeout(400);
  const pts = await pg.evaluate(() => { const W = window.WSE, P = W.air.pos(); return [[P.x + 5, P.y + 3], [P.x + 1, P.y + 1], [P.x + 3, P.y + 2]].map(c => { const p = W.tileToScreen(c[0], c[1]); return [p.x, p.y]; }); });
  const opened = []; for (const q of pts) { await pg.evaluate(() => window.WSE.air.close()); await pg.mouse.click(q[0], q[1]); await pg.waitForTimeout(250); opened.push(await pg.evaluate(() => window.WSE.air.isOpen() && !document.getElementById('airp').hidden)); }
  t.check('clic sur 3 cases de l\'aéroport : le panneau « Aéroport » s\'ouvre', opened.every(Boolean), JSON.stringify(opened));
  const pn = await pg.evaluate(() => { const b = document.getElementById('airp'), txt = b.innerText, r = b.getBoundingClientRect(); return { txt, nV: b.querySelectorAll('[data-arv]').length, nR: (window.WSE.S.rivals || []).filter(x => !x.dead).length, open: !!b.querySelector('[data-air="open"]'), fits: r.left >= 0 && r.right <= innerWidth && b.scrollWidth <= b.clientWidth + 1 }; });
  t.check('panneau : trafic passagers, vendeurs présents, redevance, mes ventes, bouton d\'ouverture', /AÉROPORT/.test(pn.txt) && /Passagers/.test(pn.txt) && /Vendeurs présents/i.test(pn.txt) && /Redevance aéroportuaire/.test(pn.txt) && /35 %/.test(pn.txt) && /Mes ventes/i.test(pn.txt) && pn.open && pn.nV >= 1 && pn.nV <= pn.nR, `${pn.nV} vendeurs`);
  t.check('panneau propre (aucun NaN, aucun montant par jour) et dans l\'écran', !/NaN|undefined|Infinity|\[object/.test(pn.txt) && !/\$\s*\/\s*(jour|j)\b/.test(pn.txt) && pn.fits, '');
  const mb = await pg.evaluate(async () => { const W = window.WSE; W.air.close(); W.mall.open(); const b = document.querySelector('#mallp [data-mall="air"]'); if (!b) return false; b.click(); await new Promise(x => setTimeout(x, 200)); return W.air.isOpen() && !W.mall.isOpen(); });
  t.check('le panneau du Mall mène à l\'aéroport (bouton « Aéroport »)', mb, '');
  await pg.screenshot({ path: (process.env.WSE_SHOTS || '/tmp') + '/t53_panel.png' }).catch(() => {});

  // ---- 2. Ouverture de la boutique, vente, redevance
  const sh = await pg.evaluate(() => { const W = window.WSE, S = W.S, c0 = S.cash, e = W.air.data().entry; document.querySelector('#airp [data-air="open"]').click(); const paid = c0 - S.cash;
    for (let i = 0; i < 10; i++) W.step(); const A = S.air, h = A.h[A.h.length - 1], d = S._air, K = W.air.K;
    return { e, paid, on: A.on, n: A.h.length, ca: h[0], fe: h[1], rent: h[1] - K.AIR_TAX * h[0], u: h[3], you: CLS_YOU(d), D: CLS_D(d), mult: d.mult, txt: document.getElementById('airp').innerText };
    function CLS_YOU(d) { return ['basic', 'std', 'lux'].map(c => d.cls[c].you); } function CLS_D(d) { return ['basic', 'std', 'lux'].map(c => [d.cls[c].D, d.cls[c].n]); } });
  t.check('ouvrir la boutique coûte le droit d\'entrée (≈ 20 000 $, coût faible)', sh.on === 1 && Math.abs(sh.paid - sh.e) < 1 && sh.e < 30000, `${Math.round(sh.paid)} $`);
  t.check('la boutique vend chaque jour (CA, unités) dans les trois rayons', sh.n === 10 && sh.ca > 0 && sh.u > 0 && sh.you.every(v => v > 0), JSON.stringify({ ca: Math.round(sh.ca), u: Math.round(sh.u) }));
  t.check('redevance = 35 % du CA + petit loyer (≈ 120 $/jour)', sh.rent > 100 && sh.rent < 160 && sh.fe > 0.35 * sh.ca, `${Math.round(sh.fe)} sur ${Math.round(sh.ca)}`);
  t.check('chaque rayon est partagé entre les vendeurs présents (ta part = demande / nombre de vendeurs)', sh.you.every((v, i) => Math.abs(v - sh.D[i][0] / sh.D[i][1]) < 1e-6 * sh.D[i][0]), JSON.stringify(sh.D.map((d, i) => [Math.round(d[0]), d[1], Math.round(sh.you[i])])));
  t.check('panneau : mes ventes (CA, redevance, résultat) affichées par mois', /Chiffre d'affaires/.test(sh.txt) && /Résultat de la boutique/.test(sh.txt) && /Fermer ma boutique/.test(sh.txt), '');

  // ---- 3. Saturation : seul au terminal (rivaux absents) tu prends tout le trafic ; avec n vendeurs, 1/n ; jamais plus que le trafic
  const sat = await pg.evaluate(() => { const W = window.WSE, S = W.S, R = S.rivals, cls = ['basic', 'std', 'lux']; const one = () => { W.step(); const d = S._air; return { you: cls.map(c => d.cls[c].you), D: cls.map(c => d.cls[c].D), n: cls.map(c => d.cls[c].n), riv: Object.keys(d.riv).length }; };
    const withR = one(); const rc = R.map(r => r.cash); S.rivals = []; const alone = one(); S.rivals = R;
    const cash = R.map((r, i) => r.cash - rc[i]);
    return { withR, alone, cash }; });
  t.check('seul vendeur : tu sers toute la demande des voyageurs (et pas plus)', sat.alone.n.every(v => v === 1) && sat.alone.you.every((v, i) => Math.abs(v - sat.alone.D[i]) < 1e-6 * sat.alone.D[i]), JSON.stringify(sat.alone.you.map(Math.round)));
  t.check('avec les rivaux : ta part est divisée par le nombre de vendeurs (saturation par le trafic)', sat.withR.riv >= 3 && sat.withR.you.every((v, i) => v < 0.5 * sat.withR.D[i] && Math.abs(v * sat.withR.n[i] - sat.withR.D[i]) < 1e-6 * sat.withR.D[i]), JSON.stringify({ n: sat.withR.n, you: sat.withR.you.map(Math.round) }));
  // un rayon décoché : tu le quittes, les autres vendeurs se partagent la demande
  const sf = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.air.shelf('g:lux', false); W.step(); const a = S._air.cls.lux; W.air.shelf('g:lux', true); W.step(); const b = S._air.cls.lux; return { a: [a.n, a.you], b: [b.n, b.you] }; });
  t.check('rayon Luxe décoché : aucune vente de luxe, un vendeur de moins ; recoché : retour', sf.a[1] === 0 && sf.b[0] === sf.a[0] + 1 && sf.b[1] > 0, JSON.stringify(sf));

  // ---- 4. Rentabilité : un hypermarché bien placé et la boutique duty free sur 30 jours
  const rt = await pg.evaluate(() => { const W = window.WSE, S = W.S, N = W.N, K = W.air.K, cls = ['basic', 'std', 'lux'];
    const sp = W.mall.spot('s3'); W.place(sp.x, sp.y, 's3'); try { W.autoConnect(sp.x, sp.y); } catch (e) {} const c3 = S.grid[sp.y * N + sp.x];
    const sp1 = W.mall.spot('s1'); W.place(sp1.x, sp1.y, 's1'); try { W.autoConnect(sp1.x, sp1.y); } catch (e) {} const c1 = S.grid[sp1.y * N + sp1.x];
    for (let i = 0; i < 20; i++) W.step();
    const acc = { s3: { rev: 0, ebe: 0, u: 0, mix: { basic: 0, std: 0, lux: 0 } }, s1: { rev: 0, ebe: 0, u: 0 }, air: { ca: 0, net: 0, u: 0, cu: { basic: [0, 0, 0], std: [0, 0, 0], lux: [0, 0, 0] } }, gross: { air: {}, shop: {} } };
    for (let d = 0; d < 30; d++) { W.step();
      acc.s3.rev += c3.pRev; acc.s3.ebe += c3.profit; acc.s3.u += c3.out; cls.forEach(c => { acc.s3.mix[c] += (c3.sales && c3.sales['g_' + c]) || 0; });
      acc.s1.rev += c1.pRev; acc.s1.ebe += c1.profit; acc.s1.u += c1.out;
      const h = S.air.h[S.air.h.length - 1]; acc.air.ca += h[0]; acc.air.net += h[0] - h[1] - h[2]; acc.air.u += h[3];
      cls.forEach(c => { const q = S._air.cls[c]; const a = acc.air.cu[c]; a[0] += q.you; a[1] += q.ca; a[2] += q.cost; }); }
    // marge brute unitaire (avant redevance) : duty free contre rayon en ville, mêmes marchandises importées
    cls.forEach(c => { const cost = S.price[c] * 1.05; acc.gross.air[c] = W.air.price(c) - cost; acc.gross.shop[c] = W.air.price(c) / K.AIR_MK - cost; });
    // à volume égal : la boutique duty free qui vendrait le même panier (mêmes unités par rayon) que l'hypermarché, au résultat unitaire mesuré par rayon
    const unitNet = c => { const a = acc.air.cu[c]; return a[0] > 0 ? (a[1] * (1 - K.AIR_TAX) - a[2]) / a[0] : 0; };
    acc.eqVol = cls.reduce((s, c) => s + acc.s3.mix[c] * unitNet(c), 0) - K.AIR_RENT * 30;
    acc.cost = { s1: W.TYPES.s1.cost, s3: W.TYPES.s3.cost, air: W.air.data().entry }; acc.unitNet = cls.map(unitNet);
    return acc; });
  const roiAir = rt.air.net / rt.cost.air, roi1 = rt.s1.ebe / rt.cost.s1, roi3 = rt.s3.ebe / rt.cost.s3;
  t.info(`30 jours · duty free : CA ${Math.round(rt.air.ca)} $, résultat ${Math.round(rt.air.net)} $ (${Math.round(100 * rt.air.net / rt.air.ca)} % du CA), ${Math.round(rt.air.u)} u, entrée ${Math.round(rt.cost.air)} $`);
  t.info(`30 jours · petit marché : CA ${Math.round(rt.s1.rev)} $, EBE ${Math.round(rt.s1.ebe)} $, coût ${rt.cost.s1} $ · hypermarché : CA ${Math.round(rt.s3.rev)} $, EBE ${Math.round(rt.s3.ebe)} $ (${Math.round(100 * rt.s3.ebe / rt.s3.rev)} %), ${Math.round(rt.s3.u)} u, coût ${rt.cost.s3} $`);
  t.info(`même panier que l'hypermarché vendu au duty free : ${Math.round(rt.eqVol)} $ contre EBE ${Math.round(rt.s3.ebe)} $ · rendement mensuel du capital : duty free ${Math.round(roiAir * 100)} %, petit marché ${Math.round(roi1 * 100)} %, hypermarché ${Math.round(roi3 * 100)} %`);
  t.check('marge brute unitaire plus haute au duty free qu\'en rayon de ville (achats d\'impulsion, +30 %)', CLS.every(c => rt.gross.air[c] > rt.gross.shop[c] * 1.2), JSON.stringify(CLS.map(c => [rt.gross.air[c].toFixed(2), rt.gross.shop[c].toFixed(2)])));
  t.check('au démarrage : le duty free rentabilise son capital bien plus vite qu\'un magasin (rendement mensuel > 3 × petit marché et hypermarché)', roiAir > 3 * roi1 && roiAir > 3 * roi3 && rt.air.net > 0, `${(roiAir * 100).toFixed(0)} % / ${(roi1 * 100).toFixed(0)} % / ${(roi3 * 100).toFixed(0)} %`);
  t.check('à volume égal : le duty free rapporte moins qu\'un grand magasin bien rempli (redevance de 35 %)', rt.eqVol < rt.s3.ebe && rt.eqVol > 0.6 * rt.s3.ebe, `${Math.round(rt.eqVol)} < ${Math.round(rt.s3.ebe)}`);
  t.check('à grande échelle : un hypermarché vend plus que tout le duty free (plafond naturel du trafic)', rt.s3.ebe > rt.air.net && rt.s3.u > rt.air.u, `${Math.round(rt.s3.u)} u contre ${Math.round(rt.air.u)} u`);
  t.check('aucune erreur de page (vente, saturation, rentabilité)', pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));

  // ---- 5. Sauvegarde et chargement
  const ctx = pg.context();
  const s1 = await pg.evaluate(() => { const W = window.WSE, S = W.S; W.save(); return { pos: W.air.pos(), on: S.air.on, n: S.air.h.length, ca: Math.round(S.air.ca), g: S.air.g, lux: S.air.g.lux }; });
  const pg2 = await L.newPage({ ctx, wait: 1200 });
  const s2 = await pg2.evaluate(() => { const W = window.WSE, S = W.S; const o = { pos: W.air.pos(), on: S.air && S.air.on, n: S.air && S.air.h.length, ca: S.air && Math.round(S.air.ca), g: S.air && S.air.g, lux: S.air && S.air.g.lux }; W.setSpeed(0); S.noEv = true; const u0 = S.air.u; W.step(); o.sells = S.air.u > u0; return o; });
  t.check('sauvegarde : aéroport, boutique, rayons et historique des ventes conservés ; la boutique vend encore', JSON.stringify(s1.pos) === JSON.stringify(s2.pos) && s2.on === 1 && s2.n === s1.n && s2.ca === s1.ca && JSON.stringify(s2.g) === JSON.stringify(s1.g) && s2.sells && pg2.errs.length === 0, JSON.stringify({ s1, s2 }));
  const raw = await pg2.evaluate(() => localStorage.getItem('wse-city-v8'));
  await ctx.close();
  // ancienne sauvegarde (sans aéroport ni boutique) : chargée sans erreur, aéroport posé au même endroit, pas de boutique
  const d0 = JSON.parse(raw); delete d0.air; d0.cty = d0.cty.filter(q => q[5] !== 'air');
  const b = await L.browser(), c2 = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await c2.addInitScript(v => { try { if (!localStorage.getItem('wse-city-v8')) localStorage.setItem('wse-city-v8', v); } catch (e) {} }, JSON.stringify(d0));
  const p3 = await c2.newPage(); p3.errs = []; p3.on('pageerror', e => p3.errs.push(e.message)); p3.on('dialog', x => x.dismiss()); await p3.goto(L.URL); await p3.waitForTimeout(1200);
  const o3 = await p3.evaluate(() => { const W = window.WSE, S = W.S; for (let i = 0; i < 3; i++) W.step(); W.air.open(); return { pos: W.air.pos(), air: S.air || null, open: !document.getElementById('airp').hidden, txt: document.getElementById('airp').innerText }; });
  t.check('ancienne sauvegarde sans aéroport : chargée sans erreur, aéroport ajouté, aucune boutique', p3.errs.length === 0 && o3.pos && JSON.stringify(o3.pos) === JSON.stringify(s1.pos) && !o3.air && o3.open && /Ouvrir une boutique duty free/.test(o3.txt), JSON.stringify({ pos: o3.pos, err: p3.errs.slice(0, 2) }));
  await c2.close();

  // ---- 6. Déterminisme : deux parties identiques avec la boutique ouverte
  const run = async () => { const p = await L.newPage({ wait: 700 }); await L.setup(p, { cash: 3e7 });
    const x = await p.evaluate(() => { const W = window.WSE, S = W.S; W.air.openShop(); for (let i = 0; i < 40; i++) W.step(); return { pos: JSON.stringify(W.air.pos()), ca: S.air.ca.toFixed(4), riv: S.rivals.map(r => (r.aca || 0).toFixed(4) + ':' + Math.round(r.cash)).join(',') }; });
    x.errs = p.errs; await p.context().close(); return x; };
  const r1 = await run(), r2 = await run();
  t.check('déterminisme : même aéroport, mêmes ventes, mêmes rivaux', r1.pos === r2.pos && r1.ca === r2.ca && r1.riv === r2.riv && !r1.errs.length && !r2.errs.length, `${r1.ca} / ${r2.ca}`);

  // ---- 7. Mobile 390x844 : panneau lisible
  const pm = await L.newPage({ wait: 1500, w: 390, h: 844 }); await L.setup(pm, { cash: 3e7 });
  const mo = await pm.evaluate(async () => { const W = window.WSE; W.step(); W.air.open(); await new Promise(x => setTimeout(x, 300)); const box = document.getElementById('airp'), r = box.getBoundingClientRect(), bad = [];
    box.querySelectorAll('.r,.mriv,.btn').forEach(e => { if (e.scrollWidth > e.clientWidth + 2) bad.push(e.className); }); return { vis: !box.hidden, l: r.left, r: r.right, t: r.top, b: r.bottom, w: innerWidth, h: innerHeight, bad }; });
  t.check('mobile 390x844 : panneau de l\'aéroport dans l\'écran, sans débordement horizontal', mo.vis && mo.l >= 0 && mo.r <= mo.w && mo.t >= 0 && mo.b <= mo.h && !mo.bad.length, JSON.stringify(mo));
  t.check('aucune erreur de page (mobile)', pm.errs.length === 0, pm.errs.slice(0, 3).join(' | '));
  await pm.context().close();
};
