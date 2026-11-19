// Campagne de parties simulées : N joueurs (bots) × castes × profils × graines, horizon réglable, résultats en JSONL.
// Usage : NODE_PATH=$(npm root -g) node tools/sim_batch.js <sortie.jsonl> [--workers 4] [--seeds 10] [--days 3600] [--castes a,b] [--profiles x,y]
// Chaque ligne : { caste, profile, seed, events, series:[{d,val,cash,loan,net,rk,unemp,happy,pop}], fin:{...}, ms }.
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const A = process.argv.slice(2), arg = (k, d) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; };
if (process.env.SIM_WORKER) {
  const { chromium } = require('playwright'); const jobs = JSON.parse(process.env.SIM_WORKER), out = process.env.SIM_OUT, DAYS = +process.env.SIM_DAYS;
  const botSrc = fs.readFileSync(path.join(__dirname, 'bot_lib.js'), 'utf8');
  const PRESET = { bon: { lev: 0.45, every: 4, idle: 0, p: { hurdle: 0.05 } }, rapide: { lev: 0.55, every: 2, idle: 0, p: { hurdle: 0.03, mature: 28, maxPerTick: 8, demC: { s1: 0.5, s2: 0.45, s3: 0.3, s4: 0.35 } } }, lent: { lev: 0.35, every: 8, idle: 0.25, p: { hurdle: 0.08, mature: 45 } }, casual: { lev: 0.25, every: 12, idle: 0.5, p: { hurdle: 0.10, mature: 50 } }, industriel: { lev: 0.5, every: 3, idle: 0, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.6, bourse: false, fam: ['s1', 's2', 's3', 's4', 'off', 'miron', 'mcopper', 'mcoal', 'mgold', 'well'] } },
    fermier: { lev: 0.4, every: 3, idle: 0, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.5, bourse: false, fam: ['fwheat', 'fsugar', 'fcotton', 'fvine', 'fcattle', 'fchicken', 'fpig', 'fsheep', 's1', 's2', 's3'] } } };
  (async () => {
    const b = await chromium.launch();
    for (const j of jobs) {
      const t0 = Date.now(), p = await b.newPage({ viewport: { width: 1280, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.dismiss());
      try {
        await p.goto('file://' + (process.env.SIM_HTML || path.resolve(__dirname, '..', 'city.html'))); await p.waitForTimeout(400);
        const pre = Object.assign({}, PRESET[j.profile]); if (process.env.SIM_NOSPEC) pre.p = Object.assign({}, pre.p, { spec: false });   // passe 46 : référence sans magasins spécialisés
        await p.evaluate(([n, ec]) => { window.__NRIV = n; window.__ECOM = ec; }, [process.env.SIM_NRIV != null ? +process.env.SIM_NRIV : null, process.env.SIM_ECOM ? +process.env.SIM_ECOM : 0]);   // SIM_ECOM=1 : le bot construit le commerce en ligne au palier Industriel (passe 46) ; SIM_ECOM=2 : dès le palier Entrepreneur (variante)
        await p.evaluate(([caste, noEv, lev, idle, src, prof, seed]) => { const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); if (q) { q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true })); } W.startMode('round'); const S = W.S; S.rs = seed | 0; S.noEv = noEv; if (window.__NRIV != null) S.opt = Object.assign(S.opt || {}, { n: window.__NRIV }); W.setCaste(caste); W.setSpeed(0); ['caste', 'hint', 'endscr'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; }); S.mode.w0 = S.cash; (0, eval)(src); window.BOT.P.lev = lev; window.BOT.P.idle = idle; Object.assign(window.BOT.P, { fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false }, prof); if (window.__ECOM) { window.BOT.P.ecom = true; window.BOT.P.ecTier = window.__ECOM >= 2 ? window.__ECOM - 1 : 2; } }, [j.caste, !j.events, pre.lev, pre.idle, botSrc, pre.p, j.seed]);
        const series = []; let fin = null;
        while (true) {
          const r = await p.evaluate(([every, DAYS]) => { const W = window.WSE, S = W.S, t = S.day + 100; while (S.day < t && !S.mode.done) { for (let k = 0; k < every; k++) W.step(); window.BOT.tick(); } const F = S.fin || {}; return { d: S.day, done: S.mode.done || null, val: Math.round(W.valuation()), cash: Math.round(S.cash), loan: Math.round(S.loan || 0), net: Math.round(F.net || 0), rk: W.rankPlayers()[0], n: W.rankPlayers()[1], unemp: +(S.stats.unemp || 0).toFixed(3), happy: Math.round(S.stats.happy || 0), pop: Math.round(S.pop), bld: Object.values(window.BOT.cnt).reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0), ret: Math.round(F.revRetail || 0), sp: W.spec ? W.spec.KEYS.reduce((a, k) => a + ((S.stats.cn || {})[k] || 0), 0) : 0, exp: Math.round(F.revExport || 0), ec: W.ecom && S.ecom && S.ecom.last ? Math.round(S.ecom.last.rev) : 0, ecEb: W.ecom && S.ecom && S.ecom.last ? Math.round(S.ecom.last.eb) : 0, ewh: W.ecom ? W.ecom.list().length : 0, tier: W.ecom && W.ecom.tier ? W.ecom.tier() : 0, riv: (S.rivals || []).map(r => [r.caste || r.id, Math.round(W.riv.value(r)), (r.fab || []).filter(f => f.on !== false).length, Math.round(r.debt || 0)]), rv: S.rv ? [S.rv.wars || 0, S.rv.fails || 0, S.rv.opas || 0, S.rv.fabs || 0] : [], neg: (() => { const o = []; Object.keys(S.stock).forEach(g => { if (S.stock[g] < 0) o.push('stock.' + g + '=' + S.stock[g]); }); Object.keys(S.prod).forEach(k => { if (S.prod[k].stock < 0) o.push('prod.' + k + '.stock=' + S.prod[k].stock); }); return o.slice(0, 6); })() }; }, [pre.every, DAYS]);   // audit : stocks négatifs relevés tous les 100 jours
          series.push(r); if (r.done || r.d >= DAYS) { fin = r; break; }
        }
        fs.appendFileSync(out, JSON.stringify({ persona: j.persona, caste: j.caste, profile: j.profile, seed: j.seed, events: j.events, series, fin, errs: errs.slice(0, 2), ms: Date.now() - t0 }) + '\n');
      } catch (e) { fs.appendFileSync(out, JSON.stringify({ caste: j.caste, profile: j.profile, seed: j.seed, events: j.events, erreur: String(e).slice(0, 200) }) + '\n'); }
      await p.close();
    }
    await b.close();
  })();
} else {
  const out = path.resolve(A[0] || 'sim_results.jsonl'), W = +arg('workers', 4), seeds = +arg('seeds', 10), days = +arg('days', 3600);
  const castes = (arg('castes', 'agriculteur,banquier,negociant,industriel,promoteur,innovateur')).split(','), profiles = (arg('profiles', 'bon,rapide,lent,casual')).split(',');
  const jobs = [];
  if (A.includes('--like')) {   // rejoue exactement les mêmes parties qu'un autre fichier (comparaison avant/après d'une modification)
    const src = arg('like', ''), lim = +arg('limit', 24), seen = new Set();
    fs.readFileSync(src, 'utf8').split('\n').filter(Boolean).forEach(l => { try { const r = JSON.parse(l); if (r.series && jobs.length < lim) jobs.push({ persona: r.persona, caste: r.caste, profile: r.profile, seed: r.seed, events: r.events }); } catch (e) {} });
  } else if (A.includes('--personas')) {   // même monde pour les trois personas : même graine et même caste ; hardcore = rapide (optimise), « elle » = bon (régulière), ado = casual (parties courtes, joue peu)
    const PERS = [['hardcore', 'rapide'], ['joueuse', 'bon'], ['ado', 'casual'], ['fermier', 'fermier']];   // monde partagé : même graine ; chaque persona prend une caste différente et tourne sur les six castes au fil des mondes
    for (let w = 1; w <= seeds; w++) PERS.forEach((pr, i) => jobs.push({ persona: pr[0], caste: castes[(w - 1 + i) % castes.length], profile: pr[1], seed: 7000 + w, events: true }));
  } else for (let s = 1; s <= seeds; s++) for (const c of castes) for (const p of profiles) jobs.push({ caste: c, profile: p, seed: 1000 * s + 17 * castes.indexOf(c) + 3 * profiles.indexOf(p), events: s % 2 === 0 });
  let done = new Set(); if (A.includes('--resume') && fs.existsSync(out)) { fs.readFileSync(out, 'utf8').split('\n').filter(Boolean).forEach(l => { try { const r = JSON.parse(l); if (r.series) done.add([r.persona || '', r.caste, r.profile, r.seed].join('|')); } catch (e) {} }); } else fs.writeFileSync(out, '');
  for (let i = jobs.length - 1; i >= 0; i--) if (done.has([jobs[i].persona || '', jobs[i].caste, jobs[i].profile, jobs[i].seed].join('|'))) jobs.splice(i, 1); const slices = Array.from({ length: W }, () => []); jobs.forEach((j, i) => slices[i % W].push(j));
  console.log(jobs.length, 'parties,', W, 'travailleurs, horizon', days, 'jours ->', out);
  slices.forEach(sl => { const c = spawn(process.execPath, [__filename], { env: Object.assign({}, process.env, { SIM_WORKER: JSON.stringify(sl), SIM_OUT: out, SIM_DAYS: String(days) }), stdio: 'inherit' }); c.on('exit', () => console.log('travailleur terminé')); });
}
