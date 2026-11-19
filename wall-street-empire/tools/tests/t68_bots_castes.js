// Passe 67 : chaque caste jouée par le playbook de son métier (tools/bot_lib.js, P.play) construit, en 600 jours, les bâtiments et les actions emblématiques de sa caste :
//  agriculteur = fermes irriguées au maximum et chaîne alimentaire ; banquier = prêts de sa banque dans les règles Bâle III et participation à un tour de table ;
//  négociant = électricité vendue au réseau et cartel sur sa matière ; industriel = chaîne verticale (extraction -> composants -> usine du produit) alimentée par ses mines et son port.
// Les profils sont ceux de tools/sim_batch.js (agri, banque, negoce, baron). Promoteur et innovateur : playbooks tenus par d'autres passes (non testés ici).
exports.name = 'Bots de caste : actions emblématiques en 600 jours';
const FAMI = ['s1', 's2', 's3', 's4', 'off', 'miron', 'mcopper', 'mcoal', 'mgold', 'well'];
const PRESET = {   // copie de tools/sim_batch.js (PRESET baron, negoce, banque, agri)
  agriculteur: { lev: 0.4, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.5, bourse: false, play: 'agriculteur', fam: ['fwheat', 'fsugar', 'fcotton', 'fvine', 'fcattle', 'fchicken', 'fpig', 'fsheep', 's1', 's2', 's3'] } },
  banquier: { lev: 0.6, every: 4, p: { hurdle: 0.05, play: 'banquier' } },
  negociant: { lev: 0.5, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.6, bourse: false, play: 'negociant', fam: FAMI } },
  industriel: { lev: 0.5, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.6, bourse: false, play: 'industriel', prods: ['bread', 'utensils', 'bike', 'jeans', 'headache', 'cough', 'cream', 'blender', 'watch', 'perfume', 'skincare', 'jewelry', 'handbag', 'tv', 'fridge', 'washer', 'car'], fam: FAMI } }
};
const DAYS = 600, SEED = 6000;
exports.run = async (t, L) => {
  for (const caste of Object.keys(PRESET)) {
    const P = PRESET[caste], pg = await L.newPage({ wait: 600 });
    await pg.evaluate(([caste, P, seed, src]) => {
      const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true }));
      W.startMode('round'); const S = W.S; S.rs = seed; S.noEv = false; W.setCaste(caste); W.setSpeed(0); ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
      S.mode.w0 = S.cash; (0, eval)(src); window.BOT.P.lev = P.lev; window.BOT.P.idle = 0; Object.assign(window.BOT.P, { fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false }, P.p);
    }, [caste, P, SEED, L.BOT_SRC]);
    const r = await pg.evaluate(([every, D]) => {
      const W = window.WSE, S = W.S, B = window.BOT; let bkBad = 0;
      while (S.day < D && !S.mode.done) { for (let k = 0; k < every; k++) W.step(); B.tick(); if (S.caste === 'banquier' && S.bk && (S.bk.fail || S.bk.st === 'restr')) bkBad++; }
      const cn = S.stats.cn || {}, farms = [], ch = B.chainsStatus();
      for (let i = 0; i < W.N * W.N; i++) { const c = S.grid[i]; if (c && c.x + c.y * W.N === i && W.TYPES[c.t] && W.TYPES[c.t].ext && (W.CROPS[W.TYPES[c.t].ext] || W.TYPES[c.t].live)) farms.push(c.irr | 0); }
      const b = S.bk ? W.bank.init() : null;
      return { v: W.valuation(), n: Object.assign({}, B.CP.n), cn, farms, ch, bk: b && { loans: b.loans, res: b.res, ratio: W.bank.ratio(b), min: W.bank.min(), lvl: b.lvl }, bkBad, port: Object.keys(S.port || {}).map(id => [id, S.port[id].n]), power: S.power && S.power.price, day: S.day };
    }, [P.every, DAYS]);
    t.info(caste + ' : ' + JSON.stringify({ v: Math.round(r.v / 1e5) / 10, n: r.n, ch: r.ch.map(c => c.pk + '×' + c.sc), port: r.port }));
    t.check(`${caste} : 0 erreur de page`, pg.errs.length === 0, pg.errs.slice(0, 1).join(''));
    t.check(`${caste} : l'entreprise a grandi (valeur > 10 M$ de départ)`, r.v > 12e6, Math.round(r.v / 1e6) + ' M$');
    if (caste === 'agriculteur') {
      t.check('agriculteur : au moins 4 fermes ou élevages', r.farms.length >= 4, r.farms.length + ' fermes');
      t.check('agriculteur : ses fermes irriguées au maximum (3/3), sauf les toutes dernières posées (au moins 85 %)', r.farms.length > 0 && r.farms.filter(l => l === 3).length >= 0.85 * r.farms.length && (r.n.ag_irr || 0) >= 3, JSON.stringify(r.farms));
      t.check('agriculteur : une chaîne alimentaire qui transforme ses récoltes', r.ch.some(c => c.made > 0), JSON.stringify(r.ch.map(c => [c.pk, Math.round(c.made)])));
    }
    if (caste === 'banquier') {
      t.check('banquier : sa banque prête (entreprises, immobilier ou souverain)', (r.n.bk_lend_corp || 0) + (r.n.bk_lend_immo || 0) + (r.n.bk_lend_sov || 0) >= 5 && r.bk.loans > 100e6, Math.round(r.bk.loans / 1e6) + ' M$ d\'encours');
      t.check('banquier : ratio CET1 au-dessus du minimum réglementaire, jamais restreint', r.bk.ratio >= r.bk.min && r.bkBad === 0, (r.bk.ratio * 100).toFixed(1) + ' % / ' + (r.bk.min * 100).toFixed(1) + ' %');
      t.check('banquier : participation prise dans un rival (tour de table)', (r.n.bk_stake || 0) >= 1 && r.port.length >= 1, JSON.stringify(r.port));
      t.check('banquier : fonds propres de la banque en hausse (bénéfices mis en réserve)', r.bk.res > 100e6, Math.round(r.bk.res / 1e6) + ' M$');
    }
    if (caste === 'negociant') {
      t.check('négociant : centrale ou éolienne raccordée qui vend au réseau (+30 %)', (r.n.tr_plant || 0) + (r.n.tr_wind || 0) >= 1, JSON.stringify(r.n));
      t.check('négociant : cartel signé sur sa matière', (r.n.tr_cartel || 0) >= 1, JSON.stringify(r.n));
      t.check('négociant : port et extraction exportée', (r.cn.port || 0) >= 1 && ['miron', 'mcopper', 'mcoal', 'mgold', 'well'].some(k => (r.cn[k] || 0) > 0), JSON.stringify(r.cn));
    }
    if (caste === 'industriel') {
      t.check('industriel : chaîne verticale en production (usine du produit, composants, extraction)', r.ch.some(c => c.made > 0) && ['f1', 'f2', 'f3'].some(k => (r.cn[k] || 0) > 0), JSON.stringify(r.ch.map(c => [c.pk, c.sc, Math.round(c.made)])));
      t.check('industriel : port et extraction qui alimentent ses usines (mines, puits ou carrières)', (r.cn.port || 0) >= 1 && ['miron', 'mcopper', 'mcoal', 'mgold', 'well', 'qsand', 'logging'].some(k => (r.cn[k] || 0) > 0), JSON.stringify(r.cn));
      // la participation de 10 % (seuil d'OPA de la caste) vient après le jour 450 et jamais sur l'épargne d'une chaîne : relevée dans les campagnes (sim_batch, champ cp.ba_stake), pas exigée ici
    }
    await pg.context().close();
  }
};
