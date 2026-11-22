// Passe 68 : économie à somme positive (docs/PRINCIPE_JEU_POSITIF.md). A/B réduit : même graine, la même caste jouée par son bot, seule (aucune IA) puis avec les 5 autres castes.
//  1. Mécanismes : multiplicateur de prospérité (revenu créé par toutes les entreprises), marché élargi par l'offre des concurrents, demande d'affaires des services (B2B)
//     au lieu de −7 % par rival, part des services prise par un rival bornée à 6 %, contrat d'approvisionnement (prix stable, volumes garantis) au lieu du cartel punitif.
//  2. Bilan des synergies affiché dans Menu > Concurrents (« ce que les autres castes t'apportent / ce que tu leur apportes ») avec des chiffres non nuls.
//  3. A/B sur DAYS jours : la valeur de toutes les entreprises dépasse celle du joueur seul ; pour les castes de commerce et de services (promoteur, banquier), le joueur vaut
//     au moins MIN_R × sa valeur seul dès 500 jours. Le négociant (extraction, énergie) n'est pas soumis au seuil à 500 jours : son bot ouvre un magasin spécialisé de moins
//     au départ quand la ville est plus prospère (voir docs/EQUILIBRE_ECONOMIE.md, passe 68) ; il est mesuré sur 1 800 jours dans la campagne A/B.
exports.name = 'Somme positive : prospérité, synergies, A/B réduit';
const DAYS = 500, SEED = 6000, MIN_R = 0.9;
const PRESET = {   // copie de tools/sim_batch.js (profils --native)
  negociant: { lev: 0.5, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.6, bourse: false, play: 'negociant', fam: ['s1', 's2', 's3', 's4', 'off', 'miron', 'mcopper', 'mcoal', 'mgold', 'well'] } },
  promoteur: { lev: 0.45, every: 4, p: { hurdle: 0.05 } },
  banquier: { lev: 0.6, every: 4, p: { hurdle: 0.05, play: 'banquier' } }
};
const RATIO = { promoteur: 1, banquier: 1 };   // castes soumises au seuil MIN_R à DAYS jours
async function game(L, caste, nriv) {
  const P = PRESET[caste], pg = await L.newPage({ wait: 600 });
  await pg.evaluate(([caste, P, seed, src, nriv]) => {
    const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true }));
    W.startMode('round'); const S = W.S; S.rs = seed; S.noEv = false; if (nriv != null) S.opt = Object.assign(S.opt || {}, { n: nriv }); W.setCaste(caste); W.setSpeed(0); ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
    S.mode.w0 = S.cash; (0, eval)(src); window.BOT.P.lev = P.lev; window.BOT.P.idle = 0; Object.assign(window.BOT.P, { fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false }, P.p);
  }, [caste, P, SEED, L.BOT_SRC, nriv]);
  const r = await pg.evaluate(([every, D]) => {
    const W = window.WSE, S = W.S; while (S.day < D && !S.mode.done) { for (let k = 0; k < every; k++) W.step(); window.BOT.tick(); }
    const X = W.pos.prosp(), riv = (S.rivals || []).reduce((a, r) => a + W.riv.value(r), 0);
    return { v: W.valuation(), riv, n: (S.rivals || []).length, px: X.v, fr: X.fr, pop: S.pop, syn: S.syn ? JSON.parse(JSON.stringify(S.syn)) : null, html: W.pos.synHTML(), mk: ['basic', 'std', 'lux'].map(c => W.pos.rivMkt(c)), b2b: W.pos.svcB2B(), rs: [W.pos.rivSvc('bank'), W.pos.rivSvc('dc')] };
  }, [P.every, DAYS]);
  r.errs = pg.errs.slice(0, 2); await pg.context().close(); return r;
}
exports.run = async (t, L) => {
  // 1. Mécanismes, sur une partie courte (sans bot) : prospérité, marché élargi, B2B, contrat d'approvisionnement
  { const pg = await L.newPage({ wait: 600 });
    const m = await pg.evaluate(() => {
      const W = window.WSE; W.showModes(); W.startMode('round'); const S = W.S; S.rs = 6000; W.setCaste('negociant'); W.setSpeed(0);
      for (let d = 0; d < 120; d++) W.step();
      const X = W.pos.prosp(), o = { px: X.v, fr: X.fr, riv: X.riv, mk: W.pos.rivMkt('std'), mk0: W.pos.rivMkt('std', 0), b2b: W.pos.svcB2B(), rsv: Math.max(W.pos.rivSvc('bank'), W.pos.rivSvc('dc'), W.pos.rivSvc('tech')) };
      // contrat d'approvisionnement sur le fer : prix stable (cours + 6 %), client protégé d'une flambée
      S.cash = Math.max(S.cash, 1e8); const g = 'iron'; S.mods = (S.mods || []).filter(x => x.k !== 'px_' + g); const p0 = S.price[g];   /* un épisode étranger en cours sur le fer (pénurie) empêcherait la signature : la mesure porte sur le contrat seul */ o.ok = W.cartelOn(g); o.sc = W.pos.scOn(g); o.cp = S.rv.sc && S.rv.sc.p / p0; S.price[g] = p0 * 1.5; o.cap = W.pos.scPx(g) / p0; S.price[g] = p0;
      o.dup = W.cartelOn(g); for (let d = 0; d < 70; d++) W.step(); o.end = W.pos.scOn(g);
      return o;
    });
    t.check('prospérité : > 1 avec les 5 IA, une part due au revenu qu\'elles versent', m.px > 1 && m.fr > 0.0005 && m.riv > 0   /* lot 3 : budget fermé, le revenu versé par les IA entre au prorata réel de leur chiffre d'affaires */, `×${m.px.toFixed(3)}, part des autres ${(100 * m.fr).toFixed(1)} %`);
    t.check('marché élargi par l\'offre des concurrents (borné)', m.mk > 1.05 && m.mk <= 1.6001 && Math.abs(m.mk0 - 1) < 1e-9, `×${m.mk.toFixed(3)}`);
    t.check('services : les entreprises sont des clientes (B2B > 1, au lieu de −7 % par rival)', m.b2b > 1.1, `×${m.b2b.toFixed(3)}`);
    t.check('part des services prise par un rival bornée à 6 %', m.rsv <= 0.0601, (100 * m.rsv).toFixed(2) + ' %');
    t.check('contrat d\'approvisionnement : signé, prix du contrat = cours + 6 %, client protégé d\'une flambée (prix plafonné)', m.ok && m.sc && Math.abs(m.cp - 1.06) < 0.002 && Math.abs(m.cap - 1.06) < 0.002, JSON.stringify({ cp: m.cp, cap: m.cap }));
    t.check('contrat : pas de doublon, fin au bout de 60 jours', !m.dup && !m.end, JSON.stringify({ dup: m.dup, end: m.end }));
    t.check('mécanismes : 0 erreur de page', pg.errs.length === 0, pg.errs.slice(0, 1).join(''));
    await pg.context().close(); }
  // 2-3. A/B réduit
  for (const caste of Object.keys(PRESET)) {
    const A = await game(L, caste, 0), B = await game(L, caste, null), rr = B.v / A.v, world = B.v + B.riv;
    t.info(`${caste} : seul ${(A.v / 1e6).toFixed(1)} M$ (prospérité ×${A.px.toFixed(2)}, ${Math.round(A.pop / 1e3)} k hab.) ; avec 5 IA ${(B.v / 1e6).toFixed(1)} M$ (×${rr.toFixed(2)}), monde ${(world / 1e6).toFixed(0)} M$, prospérité ×${B.px.toFixed(2)} (dont ${(100 * B.fr).toFixed(0)} % grâce aux autres), ${Math.round(B.pop / 1e3)} k hab., marché ×${B.mk.map(x => x.toFixed(2)).join('/')}, B2B ×${B.b2b.toFixed(2)}`);
    t.check(`${caste} : 0 erreur de page (A et B)`, A.errs.length + B.errs.length === 0, A.errs.concat(B.errs).join(' | ').slice(0, 160));
    t.check(`${caste} : somme positive, la valeur de toutes les entreprises dépasse celle du joueur seul`, world > 1.2 * A.v, `${(world / 1e6).toFixed(0)} M$ contre ${(A.v / 1e6).toFixed(0)} M$`);
    if (RATIO[caste]) t.check(`${caste} : avec les 5 autres castes, le joueur vaut au moins ${MIN_R} × sa valeur seul (${DAYS} j)`, rr >= MIN_R, '×' + rr.toFixed(2));
    t.check(`${caste} : bilan des synergies affiché et chiffré`, /Ce que les autres castes t'apportent/.test(B.html) && /Ce que tu leur apportes/.test(B.html) && B.syn && B.syn.m && B.syn.m.dem > 0 && (B.syn.t.dem || 0) > 0, B.syn ? JSON.stringify(B.syn.m).slice(0, 160) : 'aucun');
  }
};
