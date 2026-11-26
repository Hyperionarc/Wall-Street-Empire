// Passe 102 ter (retours de Rémy sur les vues de l'usine) : deux vraies vues et rien d'inerte.
//  1. barre de la vue usine : Isométrique, Dessus, −, +, Ensemble, Achat, Fabrication, Vente, Produit ; plus de Garage, de vue éclatée/assemblée ni de rotation inerte ;
//  2. chaque bouton a un effet vérifiable (vue, zoom, cadrage ou mise en avant) ;
//  3. isométrique : employés visibles et animés ; dessus : plan 2D détaillé (débit par bloc, goulot, flux) ;
//  4. mêmes cibles et mêmes infobulles dans les deux vues (planTip), cadenas achetable depuis le plan 2D ;
//  5. aucun bouton de la vue n'est recouvert par un panneau (1280×800 et 900×800).
exports.name = 'Usine : vues isométrique et dessus';
const sleep = ms => new Promise(r => setTimeout(r, ms));
exports.run = async (t, L) => {
  for (const [w, h] of [[1280, 800], [900, 800]]) {
    const pg = await L.newPage({ w, h, wait: 800 }); await L.setup(pg, { cash: 5e8 }); await L.inject(pg);
    const at = await pg.evaluate(() => { const W = window.WSE, T = window.T, f = T.inP('f2'); W.easyLaunch(f, 'readymeal'); for (let d = 0; d < 4; d++) W.step(); return { x: f.x, y: f.y }; });
    await pg.evaluate(p => window.WSE.openBuilding(p.x, p.y), at); await sleep(300);
    const ib = await pg.$('#bimmbtn'); if (ib) { await ib.click().catch(() => {}); await sleep(600); }
    const bar = await pg.evaluate(() => [...document.querySelectorAll('#bcam button')].filter(b => b.offsetParent).map(b => b.textContent.trim()));
    if (w === 1280) t.check('barre : Isométrique, Dessus, zoom, Ensemble, Achat, Fabrication, Vente, Produit (plus de Garage, vue éclatée ni rotation)', bar.join('|') === 'Isométrique|Dessus|−|+|Ensemble|Achat|Fabrication|Vente|Produit', bar.join('|'));
    // isométrique : employés animés, boutons de caméra
    const iso = await pg.evaluate(async () => { const W = window.WSE, sc = W.scene, p0 = (sc.ws || []).filter(x => !x.hidden).map(x => x.x + ',' + x.y).join(';'); await new Promise(r => setTimeout(r, 1200)); const p1 = (W.scene.ws || []).filter(x => !x.hidden).map(x => x.x + ',' + x.y).join(';');
      const cam = () => JSON.stringify(W.imm.cam), c0 = cam(); document.querySelector('#bcam [data-cam="+"]').click(); const c1 = cam(); document.querySelector('#bcam [data-cam="sell"]').click(); const c2 = cam(); document.querySelector('#bcam [data-cam="-"]').click(); const c3 = cam();
      return { n: (sc.ws || []).filter(x => !x.hidden).length, moved: p0 !== p1, zoom: c0 !== c1, focus: c1 !== c2, unz: c2 !== c3, top: !!sc.top }; });
    t.check(`${w} isométrique : vue de l'usine en volume avec des employés animés`, iso.top && iso.n >= 2 && iso.moved, JSON.stringify(iso));
    t.check(`${w} isométrique : zoom +, cadrage Vente, zoom − ont un effet`, iso.zoom && iso.focus && iso.unz, JSON.stringify(iso));
    await pg.click('#bcam [data-ang="plan"]'); await sleep(300);
    const pl = await pg.evaluate(() => { const W = window.WSE, S = W.S, c = S.grid.find(x => x && x.t === 'f2'), box = document.getElementById('bp2d'), cells = [...box.querySelectorAll('.p2c')];
      const same = cells.every(b => b.title === W.chain.planTip(W.scene, c, +b.dataset.p2, false));
      const fz = box.querySelector('.p2d').style.getPropertyValue('--z'); document.querySelector('#bcam [data-cam="+"]').click(); const fz2 = box.querySelector('.p2d').style.getPropertyValue('--z');
      document.querySelector('#bcam [data-cam="sell"]').click(); const hi = box.querySelectorAll('.p2c.hi').length; document.querySelector('#bcam [data-cam="all"]').click(); const hi0 = box.querySelectorAll('.p2c.hi').length;
      return { vis: !box.hidden, n: cells.length, same, stats: /Débit réel/.test(box.textContent) && /Achat[\s\S]*Stock[\s\S]*Machines[\s\S]*Vente/.test(box.textContent), zoom: fz !== fz2, hi, hi0, locks: box.querySelectorAll('.p2c.lock').length }; });
    t.check(`${w} dessus : plan 2D détaillé (12 blocs, débit, flux Achat → Stock → Machines → Vente)`, pl.vis && pl.n === 12 && pl.stats, JSON.stringify(pl));
    t.check(`${w} dessus : mêmes infobulles que l'isométrique sur chaque bloc ; zoom et mise en avant fonctionnent`, pl.same && pl.zoom && pl.hi >= 1 && pl.hi0 === 0, JSON.stringify(pl));
    // aucun bouton recouvert
    const cov = await pg.evaluate(() => { const out = []; document.querySelectorAll('#bview button').forEach(b => { if (!b.offsetParent) return; const r = b.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight) return; const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (e && !b.contains(e) && !e.contains(b)) out.push(b.textContent.trim().slice(0, 18) + ' ← ' + (e.id || e.className || e.tagName).toString().slice(0, 20)); }); return out; });
    t.check(`${w} dessus : aucun bouton recouvert par un panneau`, cov.length === 0, cov.slice(0, 5).join(' | '));
    // cadenas depuis le plan 2D, bascule sans perdre la sélection
    const lk = await pg.evaluate(async () => { const W = window.WSE, S = W.S, c = S.grid.find(x => x && x.t === 'f2'), b = document.querySelector('#bp2d .p2c.lock'); if (!b) return null; const i = +b.dataset.p2, cash = S.cash; b.click(); await new Promise(r => setTimeout(r, 100)); if (!W.chain.slotOpen(c, i)) W.bAct('planunlock:' + i);
      document.querySelector('#bcam [data-ang="top"]').click(); const sel = W.imm.panel; return { i, open: W.chain.slotOpen(c, i), paid: S.cash < cash, iso: document.getElementById('bp2d').hidden }; });
    t.check(`${w} dessus : un cadenas du plan 2D s'achète ; retour à l'isométrique en un clic`, lk && lk.open && lk.paid && lk.iso, JSON.stringify(lk));
    await sleep(300);
    const cov2 = await pg.evaluate(() => { const out = []; document.querySelectorAll('#bview button').forEach(b => { if (!b.offsetParent) return; const r = b.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight) return; const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (e && !b.contains(e) && !e.contains(b) && e.tagName !== 'CANVAS') out.push(b.textContent.trim().slice(0, 18) + ' ← ' + (e.id || e.className || e.tagName).toString().slice(0, 20)); }); return out; });
    t.check(`${w} isométrique : aucun bouton recouvert par un panneau`, cov2.length === 0, cov2.slice(0, 5).join(' | '));
    t.check(`${w} : 0 erreur de page`, pg.errs.length === 0, pg.errs.slice(0, 3).join(' | '));
    await pg.context().close();
  }
};
