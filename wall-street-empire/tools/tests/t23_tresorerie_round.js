// Round : trésorerie de départ commune à tous les joueurs : 10 M$ en Normal, 100 M$ en Facile (choix dans la sélection de partie).
exports.name = 'Round : trésorerie de départ Normal / Facile';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 500 });
  const run = async (easy) => pg.evaluate(async (easy) => { const W = window.WSE; document.getElementById('caste').hidden = true; if (W.showModes) W.showModes();
    const sel = document.getElementById('modesel'); const r = sel.querySelector('input[name="dif"][value="' + (easy ? 'easy' : 'normal') + '"]'); if (!r) return { err: 'pas de sélecteur de difficulté' };
    r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); W.startMode('round'); await new Promise(x => setTimeout(x, 300));
    const S = W.S; return { cash: S.cash, easy: S.mode.easy, rivals: (S.rivals || []).map(x => x.cash), w0: S.mode.w0, ui: !!sel.querySelector('.mdif') }; }, easy);
  const n = await run(false), e = await run(true);
  t.check('Normal : 10 M$ pour le joueur et pour chaque rival IA', n.cash === 10e6 && n.easy === 0 && n.rivals.length >= 1 && n.rivals.every(c => c === 10e6) && n.w0 === 10e6, JSON.stringify(n));
  t.check('Facile : 100 M$ pour le joueur et pour chaque rival IA', e.cash === 100e6 && e.easy === 1 && e.rivals.every(c => c === 100e6) && e.w0 === 100e6, JSON.stringify(e));
  t.check('le sélecteur de difficulté est présent dans la sélection de partie', n.ui === true, '');
  t.check('aucune erreur de page', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close();
};
