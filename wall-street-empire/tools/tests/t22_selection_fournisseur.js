// La page de sélection du fournisseur (#supview) doit s'afficher au-dessus de la vue large de l'usine (#bview.wide).
exports.name = 'Sélection du fournisseur au premier plan';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 });
  const r = await pg.evaluate(() => { const b = document.getElementById('bview'), s = document.getElementById('supview'); b.hidden = false; b.classList.add('wide'); b.classList.remove('imm'); s.hidden = false; const zb = +getComputedStyle(b).zIndex, zs = +getComputedStyle(s).zIndex; b.hidden = true; s.hidden = true; b.classList.remove('wide'); return { zb, zs }; });
  t.check('#supview au-dessus de #bview.wide (la page de sélection n\'est plus cachée derrière l\'usine)', r.zs > r.zb, JSON.stringify(r));
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
