// Passe 76 : télémétrie locale anonyme (docs/MONETISATION_GAMIFICATION.md).
// Opt-in (désactivée par défaut), rien d'envoyé, journal borné (≤ 200 ko) dans localStorage « wse-telemetry », export JSON depuis Menu > Partie,
// et AUCUN impact sur la simulation : la même partie (graine, caste, bot) donne exactement le même état avec et sans télémétrie.
exports.name = 'Télémétrie locale anonyme (opt-in, bornée, exportable, sans effet sur la partie)';
const DAYS = 360, SEED = 7601;
async function play(L, on) {
  const pg = await L.newPage({ wait: 600 });
  const sent = []; pg.on('request', r => { const u = r.url(); if (!/^(file|data|blob):/.test(u)) sent.push(u); });
  const r = await pg.evaluate(([on, src, D, seed]) => {
    const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); if (q) { q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true })); }
    W.startMode('round'); const S = W.S; S.rs = seed; S.noEv = false; W.setCaste('industriel'); W.setSpeed(0); ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    const def = W.tel.on(); if (on) W.tel.enable(true);
    S.mode.w0 = S.cash; (0, eval)(src);
    Object.assign(window.BOT.P, { lev: 0.5, idle: 0, fam: ['s1', 's2', 's3', 's4', 'off', 'miron', 'mcopper', 'mcoal', 'mgold', 'well'], bourse: false, hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.6, pers: { deleg: 1, up: 20 } });
    let k = 0; while (S.day < D && !S.mode.done) { W.step(); if (++k % 3 === 0) window.BOT.tick(); }
    W.tel.flush();
    let hist = 0; (S.hist || []).forEach((v, i) => { hist = (hist * 31 + (v | 0) + i) % 1000000007; });
    let grid = 0; S.grid.forEach((c, i) => { if (c && c.t !== 'npc') grid = (grid * 17 + i + (c.lvl | 0) * 7 + (c.t.length)) % 1000000007; });
    return { def, day: S.day, val: Math.round(W.valuation()), cash: Math.round(S.cash), loan: Math.round(S.loan || 0), pop: Math.round(S.pop), hist, grid, rivals: (S.rivals || []).map(x => Math.round(W.riv.value(x))).join(','),
      ls: localStorage.getItem('wse-telemetry'), cnt: W.tel.counts(), n: W.tel.events().length };
  }, [on, L.BOT_SRC, DAYS, SEED]);
  r.errs = pg.errs; r.sent = sent; return { pg, r };
}
exports.run = async (t, L) => {
  // 1. sans opt-in : rien n'est collecté ni écrit
  const A = await play(L, false), a = A.r;
  t.check('désactivée par défaut (opt-in)', a.def === false, String(a.def));
  t.check('sans opt-in : aucun journal écrit dans localStorage', a.ls == null && a.n === 0, a.ls ? a.ls.length + ' caractères' : 'vide');
  await A.pg.context().close();
  // 2. avec opt-in : journal rempli, mêmes résultats de partie
  const B = await play(L, true), b = B.r, pg = B.pg;
  t.info('compteurs : ' + JSON.stringify(b.cnt));
  t.check('avec opt-in : événements clés journalisés (partie, premier achat, première usine, palier ou ×valeur)', b.cnt.game >= 1 && b.cnt.first_buy === 1 && b.cnt.first_factory === 1 && ((b.cnt.tier || 0) + (b.cnt.mult || 0)) >= 1, JSON.stringify(b.cnt));
  t.check('usage automatique (COO, sources automatiques) et chantiers journalisés', (b.cnt.policy || 0) >= 1 && (b.cnt.sc_autosource || 0) >= 1 && (b.cnt.chantier || 0) >= 1, `policy ${b.cnt.policy | 0}, sc_autosource ${b.cnt.sc_autosource | 0}, chantier ${b.cnt.chantier | 0}`);
  t.check('journal persistant dans localStorage « wse-telemetry »', !!b.ls && JSON.parse(b.ls).ev.length === b.n, b.ls ? b.ls.length + ' caractères' : 'absent');
  const same = ['day', 'val', 'cash', 'loan', 'pop', 'hist', 'grid', 'rivals'].filter(k => a[k] !== b[k]);
  t.check(`aucun impact sur la simulation : partie identique avec et sans télémétrie (${DAYS} jours, bot, événements actifs)`, same.length === 0, same.length ? same.map(k => k + ' ' + a[k] + ' ≠ ' + b[k]).join(' ; ') : `valeur ${Math.round(a.val / 1e6)} M$, trésorerie et grille identiques`);
  t.check('rien n\'est envoyé sur le réseau', b.sent.length === 0 && a.sent.length === 0, b.sent.slice(0, 2).join(' '));
  t.check('aucune erreur de page', a.errs.length === 0 && b.errs.length === 0, a.errs.concat(b.errs).slice(0, 2).join(' | '));
  // 3. taille bornée, export JSON, effacement, désactivation
  const r = await pg.evaluate(() => {
    const T = window.WSE.tel; for (let i = 0; i < 20000; i++) T.log('test', { i, pad: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }); T.flush();
    const ls = localStorage.getItem(T.KEY) || '', ex = T.export(); let o = null; try { o = JSON.parse(ex); } catch (e) { o = null; }
    const firstKept = !!(o && o.first && o.first.first_buy);
    // l'interface : Menu > Partie
    document.querySelector('[data-ptab="game"]').click(); const btnOn = document.querySelector('#teltoggle [data-tel="1"]'), exp = document.getElementById('telExport');
    const ui = { pressed: btnOn && btnOn.getAttribute('aria-pressed'), exp: !!exp, note: (document.getElementById('telNote') || {}).textContent || '' };
    document.querySelector('#teltoggle [data-tel="0"]').click(); const off = T.on(); const n0 = T.events().length; window.WSE.step(); T.log('apres', 1); const n1 = T.events().length;
    document.getElementById('telClear').click(); const cleared = T.events().length === 0 && localStorage.getItem(T.KEY) == null;
    return { ls: ls.length, max: T.MAX, ok: !!o, keys: o ? Object.keys(o).join(',') : '', drop: o ? o.drop : 0, firstKept, ui, off, n0, n1, cleared, anon: !/@|https?:/.test(ex) };
  });
  t.check('taille bornée : 20 000 événements de plus, journal ≤ 200 ko (les plus anciens retirés)', r.ls <= r.max && r.drop > 0, `${Math.round(r.ls / 1000)} ko, ${r.drop} événements retirés`);
  t.check('export JSON valide (événements, compteurs, premières fois, sessions, schéma)', r.ok && /ev/.test(r.keys) && /cnt/.test(r.keys) && /first/.test(r.keys) && /sess/.test(r.keys) && /schema/.test(r.keys) && r.firstKept, r.keys);
  t.check('export anonyme (ni adresse, ni lien)', r.anon);
  t.check('Menu > Partie : interrupteur Oui/Non et bouton Exporter', r.ui.pressed === 'true' && r.ui.exp && /rien n'est envoyé/.test(r.ui.note), JSON.stringify(r.ui).slice(0, 160));
  t.check('désactivation : plus rien n\'est collecté', r.off === false && r.n1 === r.n0, `${r.n0} → ${r.n1}`);
  t.check('effacement du journal', r.cleared);
  await pg.context().close();
};
