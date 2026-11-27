// Économie de marché, lot 2 (retour de Rémy : « un supermarché ne peut pas vendre seulement 167 bouts de pain ; 100 000 habitants sont bien obligés d'aller quelque part »).
//  1. unité = article de consommation (baguette, boîte de 6 œufs, litre de lait) à un prix de rayon réaliste ;
//  2. besoin par habitant et par jour réaliste (pain 0,2-0,45 baguette, œufs, lait) ; la dépense de ces biens reste une part raisonnable du revenu (Engel) ;
//  3. la demande de la ville se partage entre tous les vendeurs (tes magasins, les concurrents, les commerces de la ville et le Mall) : les parts font 100 % ;
//  4. un supermarché écoule des centaines, un hypermarché des milliers d'articles par jour ; une boulangerie industrielle sort des dizaines de milliers de baguettes,
//     vendues à tes magasins puis en gros aux commerces de la ville ;
//  5. valeur neutre : changer l'unité ne change pas la valeur d'une journée de vente (chiffre d'affaires d'un supermarché du même ordre qu'avant).
exports.name = 'Échelle de la demande : articles, besoins par habitant, partage entre vendeurs';
const START = `window.__st = () => { const W = window.WSE; W.startMode('round', { start: 'moyenne' }); const S = W.S; S.rs = 7001; S.noEv = true; W.setCaste('industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); };
  window.__nearMall = t => { const W = window.WSE, S = W.S, N = W.N; let m = null; for (let i = 0; i < N * N; i++) { const c = S.grid[i]; if (c && c.t === 'npc' && c.k === 'mon' && c.m === 'mall') { m = [i % N, (i / N) | 0]; break; } }
    for (let r = 2; r < 18; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = m[0] + dx, y = m[1] + dy; if (!W.footprintError(x, y, t) && W.place(x, y, t)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } } return null; };`;
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.inject(pg); await pg.evaluate(START);
  const r = await pg.evaluate(() => {
    window.__st(); const W = window.WSE, S = W.S, E = W.eco, o = {};
    const s2 = window.__nearMall('s2'), s3 = window.__nearMall('s3'), ks = ['bread', 'eggs', 'chicken', 'drinkmilk', 'pasta', 'yogurt'];
    ks.forEach((k, i) => { W.shopUI.act(s2, 'mkput:' + i + ':' + k); W.shopUI.act(s3, 'mkput:' + i + ':' + k); });
    let rev = 0; for (let d = 0; d < 30; d++) { W.step(); if (d >= 20) rev += s2._rev || 0; }
    const pe = W.popE(); o.pe = pe; o.pc = {}; ['bread', 'eggs', 'drinkmilk', 'chicken'].forEach(k => { o.pc[k] = E.dem(k) / pe; });
    o.retail = {}; ['bread', 'eggs', 'drinkmilk', 'chicken'].forEach(k => { o.retail[k] = W.prodPrice(k) * 1.76; });
    o.art = E.artName('bread'); o.sh = S._nd.sh.bread; o.inc = S._nd.val / S._nd.inc;
    o.s2 = { bread: s2.sales.bread || 0, tot: ks.reduce((a, k) => a + (s2.sales[k] || 0), 0), rev: rev / 10 };
    o.s3 = { bread: s3.sales.bread || 0, tot: ks.reduce((a, k) => a + (s3.sales[k] || 0), 0) };
    o.D = E.dem('bread'); o.served = (s2.sales.bread || 0) + (s3.sales.bread || 0);
    return o;
  });
  t.range('pain : besoin de la ville par habitant (baguettes/j)', r.pc.bread, 0.2, 0.45, '', 3);
  t.range('œufs : boîtes de 6 par habitant et par jour (≈ 0,3 à 1,2 œuf)', r.pc.eggs, 0.05, 0.2, '', 3);
  t.range('lait de boisson : litres par habitant et par jour', r.pc.drinkmilk, 0.08, 0.25, '', 3);
  t.range('poulet entier : par habitant et par jour', r.pc.chicken, 0.005, 0.03, '', 4);
  t.check('l\'unité du pain est l\'article « baguette »', /baguette/.test(r.art), r.art);
  t.range('prix de rayon d\'une baguette ($)', r.retail.bread, 0.8, 2.5, ' $', 2);
  t.range('prix de rayon d\'un litre de lait ($)', r.retail.drinkmilk, 0.7, 2.5, ' $', 2);
  t.range('prix de rayon d\'un poulet entier ($)', r.retail.chicken, 4, 16, ' $', 2);
  t.range('dépense des biens de consommation courante / revenu disponible (Engel, %)', 100 * r.inc, 2, 12, ' %');
  t.check('les parts de la demande de pain font 100 % (toi + concurrents + commerces de la ville et Mall)', Math.abs(r.sh.me + r.sh.riv + r.sh.npc - 1) < 1e-6, JSON.stringify(r.sh));
  t.check('les commerces de la ville et le Mall servent l\'essentiel de la ville (> 50 %), tes deux magasins une part', r.sh.npc > 0.5 && r.sh.me > 0 && r.sh.me < 0.1, JSON.stringify(r.sh));
  t.check('la demande de pain de la ville dépasse de loin ce que vendent tes magasins (les habitants vont ailleurs)', r.D > 20 * r.served, `${Math.round(r.D)} baguettes/j contre ${Math.round(r.served)}`);
  t.range('supermarché près du Mall : baguettes vendues par jour', r.s2.bread, 120, 2000, '', 0);
  t.range('hypermarché : baguettes vendues par jour (des centaines ; un méga-centre en vend quatre fois plus)', r.s3.bread, 200, 5000, '', 0);
  t.range('hypermarché : articles de base vendus par jour (6 produits)', r.s3.tot, 1000, 30000, '', 0);
  t.range('valeur neutre : chiffre d\'affaires quotidien du supermarché (6 produits de base, $)', r.s2.rev, 3000, 6500, ' $', 0);
  // boulangerie industrielle : production en articles, vente en gros aux commerces de la ville
  const pg2 = await L.newPage({ wait: 700 }); await L.inject(pg2); await pg2.evaluate(START);
  const b = await pg2.evaluate(() => { window.__st(); const W = window.WSE, S = W.S, T = window.T; S.cash = 5e7; T.onDep('fwheat', 'wheat'); T.inP('f1'); const f = T.inP('f1'); W.easyLaunch(f, 'bread'); const s = window.__nearMall('s2'); W.shopUI.act(s, 'put:0:bread');
    let out = 0, b2b = 0, sold = 0, exp = 0; for (let d = 0; d < 50; d++) { W.step(); if (d >= 30) { out += f.out || 0; b2b += S.prod.bread.b2b || 0; sold += (s.sales && s.sales.bread) || 0; exp += S.prod.bread.exp || 0; } }
    return { out: out / 20, b2b: b2b / 20, sold: sold / 20, exp: exp / 20, px: W.prodPrice('bread'), std: W.stdPrice('bread') }; });
  t.range('petite boulangerie industrielle : baguettes par jour', b.out, 5000, 40000, '', 0);
  t.check('sa production se vend d\'abord à tes magasins puis en gros aux commerces de la ville (pas d\'abord à l\'export)', b.sold > 0 && b.b2b > 0.5 * b.out && b.exp < 0.3 * b.out, JSON.stringify(b));
  t.check('0 erreur de page', pg.errs.length + pg2.errs.length === 0, pg.errs.concat(pg2.errs).slice(0, 3).join(' | '));
  await pg.context().close(); await pg2.context().close();
};
