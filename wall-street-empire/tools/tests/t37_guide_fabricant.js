// Guide du fabricant : accolades de liaison, ligne « technologies connues de toi », photo injectée (repli vectoriel sinon).
exports.name = 'Guide du fabricant : arborescence et photos';
const PNG1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
exports.run = async (t, L) => {
  const pg = await L.newPage({ w: 1400, h: 900, wait: 400 }); await L.setup(pg, { cash: 5e9 }); await L.inject(pg);
  const r = await pg.evaluate(async (PNG) => { document.getElementById('openGuide') && document.getElementById('openGuide').click(); await new Promise(x => setTimeout(x, 300));
    const clk = s => { const c = document.querySelector(s); if (c) c.click(); }; clk('[data-g="cls:std"]'); await new Promise(x => setTimeout(x, 150)); clk('[data-g="sel:sneakers"]'); await new Promise(x => setTimeout(x, 200));
    const g = document.getElementById('gview'), o = { open: !g.hidden, cards: g.querySelectorAll('.gcol .gcard').length, txt: g.innerText, stub: g.querySelector('.gdiag:not(.rev) > .gcol:first-child > .gcard') ? getComputedStyle(g.querySelector('.gdiag:not(.rev) > .gcol:first-child > .gcard'), '::after').width : null, photo0: g.querySelectorAll('img.gphoto').length };
    window.WSE.setGuidePhoto('sneakers', PNG); await new Promise(x => setTimeout(x, 150)); o.photo1 = document.getElementById('gview').querySelectorAll('img.gphoto').length; return o; }, PNG1);
  t.check('le guide s\'ouvre sur les baskets avec ses cartes d\'intrants et son produit', r.open && r.cards >= 3, JSON.stringify({ open: r.open, cards: r.cards }));
  t.check('accolade de liaison entre chaque carte d\'intrant et le rail (trait de 17 px)', r.stub === '17px', String(r.stub));
  t.check('la boîte qualité indique si tu connais les technologies du produit', /Technologies connues de toi/.test(r.txt), '');
  t.check('sans photo : vignette vectorielle ; avec une photo injectée : elle remplace la vignette du produit', r.photo0 === 0 && r.photo1 === 1, JSON.stringify({ avant: r.photo0, apres: r.photo1 }));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
