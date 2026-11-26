#!/usr/bin/env node
// IA testeuse minimale (responsable Jouabilité) : rejoue un parcours par caste sur le vrai build (city.html), avec un WATCHDOG d'invariants.
//  - départs : « Ville de 100 000 habitants » (Round 10 M$, start 'moyenne') et « de zéro » (Bourg, start 'zero') ;
//  - chaque caste est jouée par le playbook de son métier (tools/bot_lib.js, profils de tools/sim_batch.js) ;
//  - watchdog à chaque point de contrôle : valeurs non finies dans l'état (NaN/Infinity), stocks négatifs, trésorerie non finie, erreurs de page / console,
//    temps de simulation d'un jour (ms), images par seconde de la carte ; textes suspects (NaN, undefined, [object) dans le HUD ;
//  - à la fin : chaque type de bâtiment possédé est ouvert (vue intérieure) : texte suspect, croix de fermeture effective, clics inertes
//    (bouton visible dont le clic ne change ni la fiche, ni l'état, ni le journal), Guide du fabricant ouvert et refermé.
// Rien n'est aléatoire : graine fixe (S.rs) et bots déterministes. Usage :
//   NODE_PATH=$(npm root -g) node wall-street-empire/tools/qa_ai/parcours_castes.js [--days=360] [--castes=industriel,agriculteur] [--starts=moyenne,zero] [--shots=dossier] [--fuzz=0|1]
const path = require('path'), fs = require('fs');
const L = require('../tests/lib.js');

const FAMI = ['s1', 's2', 's3', 's4', 'off', 'miron', 'mcopper', 'mcoal', 'mgold', 'well'];
// profils de tools/sim_batch.js (baron, agri, banque, negoce, trump, innovateur)
const PRESET = {
  industriel: { lev: 0.5, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.6, bourse: false, play: 'industriel', prods: ['bread', 'utensils', 'bike', 'jeans', 'headache', 'cough', 'cream', 'blender', 'watch', 'perfume', 'skincare', 'jewelry', 'handbag', 'tv', 'fridge', 'washer', 'car'], fam: FAMI } },
  promoteur: { lev: 0.45, every: 4, p: { hurdle: 0.05, trump: true, trLtv: 0.65 } },
  banquier: { lev: 0.6, every: 4, p: { hurdle: 0.05, play: 'banquier' } },
  negociant: { lev: 0.65, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.75, bourse: false, play: 'negociant', fam: FAMI } },
  agriculteur: { lev: 0.4, every: 3, p: { hurdle: 0.05, industry: true, indEvery: 8, indLev: 0.5, bourse: false, play: 'agriculteur', fam: ['fwheat', 'fsugar', 'fcotton', 'fvine', 'fcattle', 'fchicken', 'fpig', 'fsheep', 's1', 's2', 's3'] } },
  innovateur: { lev: 0.45, every: 4, p: { hurdle: 0.05, innov: true } }
};
const CASTES = Object.keys(PRESET);

// ---- code exécuté dans la page
const START = ([st, seed, caste, P, bot]) => {
  const W = window.WSE; W.showModes(); const q = document.querySelector('#modesel input[name="dif"][value="normal"]'); if (q) { q.checked = true; q.dispatchEvent(new Event('change', { bubbles: true })); }
  W.startMode('round', st ? { start: st } : undefined); const S = W.S; S.rs = seed; S.noEv = false; W.setCaste(caste); W.setSpeed(0);
  ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) e.hidden = true; });
  S.mode.w0 = S.cash; window.__w0 = S.cash;
  (0, eval)(bot); const B = window.BOT; B.P.lev = P.lev; B.P.idle = 0; Object.assign(B.P, { fam: ['s1', 's2', 's3', 'tech', 'dc', 'bank', 'off'], bourse: false }, P.p);
  return { pop: Math.round(S.pop), cash: S.cash, caste: S.caste, start: S.opt && S.opt.start };
};
// invariants (watchdog) : renvoie la liste des violations
const WATCH = () => {
  const W = window.WSE, S = W.S, v = [];
  const bad = window.T.scan(); if (bad.length) v.push('non fini : ' + bad.slice(0, 4).join(' '));
  Object.keys(S.stock || {}).forEach(g => { if (S.stock[g] < -1e-6) v.push('stock négatif : ' + g + '=' + S.stock[g].toFixed(2)); });
  Object.keys(S.prod || {}).forEach(k => { const s = S.prod[k].stock; if (s < -1e-6) v.push('stock produit négatif : ' + k + '=' + s.toFixed(2)); });
  if (!isFinite(S.cash)) v.push('trésorerie non finie');
  const hud = ['hud', 'obar', 'ojal', 'stats'].map(i => document.getElementById(i)).filter(Boolean).map(e => e.innerText).join(' ');
  const m = hud.match(/.{0,24}(NaN|undefined|Infinity|\[object).{0,16}/); if (m) v.push('HUD : ' + m[0]);
  return v;
};
const KPI = () => { const W = window.WSE, S = W.S, F = S.fin || {}; const own = {}; let nb = 0; S.grid.forEach((c, i) => { if (c && c.x + c.y * W.N === i && c.t !== 'npc' && c.t !== 'road' && c.t !== 'part' && W.TYPES[c.t]) { own[c.t] = (own[c.t] || 0) + 1; nb++; } });
  const prods = Object.keys(S.prod).filter(k => S.prod[k].st === 'on' && (S.prod[k].made || 0) > 0);
  return { day: S.day, val: Math.round(W.valuation()), cash: Math.round(S.cash), loan: Math.round(S.loan || 0), net: Math.round(F.net || 0), pop: Math.round(S.pop), nb, own, made: prods.length, prods: prods.slice(0, 8), jal: ((W.ry && W.ry.S && W.ry.S().log) || []).length, msg: (S._sayBuf || []).length }; };

async function runOne(o) {
  const { caste, start, days, seed, shots, fuzz } = o, P = PRESET[caste], res = { caste, start, seed, viol: [], errs: [], slow: [], fps: [], kpi: [], ui: [], inert: [], shots: [] };
  const pg = await L.newPage({ w: o.w || 1280, h: o.h || 800, wait: 900 }); await L.inject(pg);
  res.init = await pg.evaluate(([S0, a]) => (0, eval)('(' + S0 + ')')(a), [START.toString(), [start, seed, caste, P, L.BOT_SRC]]);
  const snap = async n => { if (!shots) return; fs.mkdirSync(shots, { recursive: true }); const f = path.join(shots, `${caste}_${start}_${n}.png`); await pg.screenshot({ path: f }); res.shots.push(f); };
  const fps = ms => pg.evaluate(ms => new Promise(r => { let n = 0, worst = 0, last = performance.now(); const t0 = last; const f = () => { const t = performance.now(); worst = Math.max(worst, t - last); last = t; n++; if (t - t0 < ms) requestAnimationFrame(f); else r({ fps: Math.round(n * 1000 / (t - t0)), worst: Math.round(worst) }); }; requestAnimationFrame(f); }), ms);
  await snap('j0');
  const chk = Math.max(10, o.chk || 30); let e0 = 0;
  while (true) {
    const r = await pg.evaluate(([every, chk, D]) => { const W = window.WSE, S = W.S, B = window.BOT; let worst = 0, tot = 0, n = 0; const end = Math.min(D, S.day + chk);
      while (S.day < end && !S.mode.done) { for (let k = 0; k < every; k++) { const t0 = performance.now(); W.step(); const dt = performance.now() - t0; tot += dt; n++; if (dt > worst) worst = dt; } try { B.tick(); } catch (e) { return { day: S.day, botErr: String(e && e.message || e).slice(0, 160) }; } }
      try { W.refreshStats && W.refreshStats(); } catch (e) {}
      return { day: S.day, done: S.mode.done || null, worst: Math.round(worst), avg: +(tot / Math.max(1, n)).toFixed(1) }; }, [P.every, chk, days]);
    const w = await pg.evaluate(W0 => (0, eval)('(' + W0 + ')')(), WATCH.toString());
    if (r.botErr) res.viol.push(`j${r.day} bot : ${r.botErr}`);
    w.forEach(x => res.viol.push(`j${r.day} ${x}`));
    const er = pg.errs.slice(e0); e0 = pg.errs.length; er.forEach(x => res.errs.push(`j${r.day} ${x.slice(0, 220)}`));
    if (r.worst > (o.slowMs || 400)) res.slow.push(`j${r.day} jour simulé le plus lent ${r.worst} ms (moyenne ${r.avg} ms)`);
    res.kpi.push(Object.assign(await pg.evaluate(K => (0, eval)('(' + K + ')')(), KPI.toString()), { msDay: r.avg }));
    if (r.day >= days || r.done || r.botErr) break;
  }
  const f = await fps(700); res.fps.push(f); await snap('fin');
  if (fuzz) Object.assign(res, await uiAudit(pg, res, snap));
  res.errs = res.errs.concat(pg.errs.slice(e0).map(x => 'fin ' + x.slice(0, 220)));
  await pg.context().close();
  return res;
}

// ---- audit d'interface en fin de parcours : chaque type de bâtiment possédé est ouvert, ses boutons cliqués un par un
async function uiAudit(pg, res, snap) {
  const out = { ui: [], inert: [], opened: 0 };
  const types = await pg.evaluate(() => { const W = window.WSE, S = W.S, seen = {}, o = []; S.grid.forEach((c, i) => { if (!c || c.x + c.y * W.N !== i || c.t === 'npc' || c.t === 'road' || c.t === 'part' || !W.TYPES[c.t] || seen[c.t]) return; if (['pylon', 'cable', 'pipeline', 'bull', 'buyout'].includes(c.t)) return; seen[c.t] = 1; o.push([c.t, c.x, c.y]); }); return o.slice(0, 14); });
  for (const [t, x, y] of types) {
    const st = await pg.evaluate(([x, y]) => { const W = window.WSE; try { W.openBuilding(x, y); } catch (e) { return { err: String(e.message) }; } const b = document.getElementById('bview'); return { open: !b.hidden, txt: (b.innerText.match(/.{0,24}(NaN|undefined|Infinity|\[object).{0,16}/) || [''])[0] }; }, [x, y]);
    await pg.waitForTimeout(250);
    if (st.err) { out.ui.push(`${t} : exception à l'ouverture ${st.err}`); continue; }
    if (!st.open) { out.ui.push(`${t} : la vue intérieure ne s'ouvre pas`); continue; }
    out.opened++; if (st.txt) out.ui.push(`${t} : texte suspect « ${st.txt} »`);
    if (out.opened <= 3) await snap('bat_' + t);
    // clics inertes : boutons visibles de la fiche (hors fermer, vendre, démolir, onglets déjà actifs)
    const n = await pg.evaluate(() => { const b = document.getElementById('bview'); let i = 0; [...b.querySelectorAll('#bbody button, #bkpi button, #bhud button')].forEach(e => { e.removeAttribute('data-qa'); const r = e.getBoundingClientRect(); if (e.disabled || !r.width || e.closest('[hidden]') || e.getAttribute('aria-pressed') === 'true' || e.classList.contains('sel') || e.classList.contains('on')) return; const s = (e.innerText + ' ' + (e.dataset.act || '')).toLowerCase(); if (/fermer|close|vendre|céder|démol|bull|sell|liquid|fermeture/.test(s)) return; e.setAttribute('data-qa', String(i++)); }); return i; });
    for (let k = 0; k < Math.min(n, 10); k++) {
      const r = await pg.evaluate(k => { const W = window.WSE, S = W.S, b = document.getElementById('bview'), e = b.querySelector(`[data-qa="${k}"]`); if (!e || !e.isConnected) return null;
        const sig = () => [b.innerHTML.length, b.innerHTML.slice(0, 4000), Math.round(S.cash), (S._sayBuf || []).join('~'), ['gview', 'cview', 'pview', 'svview', 'tview', 'supview', 'fabview', 'panel'].map(i => document.getElementById(i) && document.getElementById(i).hidden).join(''), b.hidden, JSON.stringify(S.prod).length].join('|');
        const lab = (e.innerText || e.getAttribute('aria-label') || e.dataset.act || '').trim().slice(0, 40), a = sig(); e.click(); return { lab, a, act: e.dataset.act || '' }; }, k);
      if (!r) continue; await pg.waitForTimeout(180);
      const same = await pg.evaluate(a => { const W = window.WSE, S = W.S, b = document.getElementById('bview'); const s = [b.innerHTML.length, b.innerHTML.slice(0, 4000), Math.round(S.cash), (S._sayBuf || []).join('~'), ['gview', 'cview', 'pview', 'svview', 'tview', 'supview', 'fabview', 'panel'].map(i => document.getElementById(i) && document.getElementById(i).hidden).join(''), b.hidden, JSON.stringify(S.prod).length].join('|'); return s === a; }, r.a);
      if (same) out.inert.push(`${t} : « ${r.lab} » (${r.act})`);
      // revenir à la fiche si le clic a ouvert autre chose
      await pg.evaluate(([x, y]) => { const W = window.WSE; ['gview', 'cview', 'pview', 'svview', 'tview', 'supview', 'fabview'].forEach(i => { const e = document.getElementById(i); if (e && !e.hidden && i !== 'bview') e.hidden = true; }); if (document.getElementById('bview').hidden) W.openBuilding(x, y); }, [x, y]);
    }
    // croix de fermeture
    const cl = await pg.evaluate(() => { const b = document.getElementById('bview'), x = b.querySelector('[data-act="close"]'); if (!x) return 'pas de bouton Fermer'; x.click(); return b.hidden ? '' : 'Fermer sans effet'; });
    if (cl) out.ui.push(`${t} : ${cl}`);
  }
  // Guide du fabricant
  const g = await pg.evaluate(() => { const W = window.WSE; W.openGuide('bread'); const g = document.getElementById('gview'); const o = { open: !g.hidden, txt: (g.innerText.match(/.{0,24}(NaN|undefined|\[object).{0,16}/) || [''])[0] }; const x = g.querySelector('[data-g="close"]'); if (x) x.click(); o.closed = g.hidden; return o; });
  if (!g.open) out.ui.push('Guide du fabricant : ne s\'ouvre pas'); if (g.txt) out.ui.push('Guide : texte suspect « ' + g.txt + ' »'); if (!g.closed) out.ui.push('Guide : Fermer sans effet');
  return out;
}

async function main() {
  const A = process.argv.slice(2), arg = (k, d) => { const a = A.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
  const castes = arg('castes', CASTES.join(',')).split(','), starts = arg('starts', 'moyenne,zero').split(','), days = +arg('days', 360), shots = arg('shots', ''), fuzz = arg('fuzz', '1') === '1', seed = +arg('seed', 6100);
  const all = [];
  for (const start of starts) for (const caste of castes) {
    const t0 = Date.now(); const r = await runOne({ caste, start, days, seed, shots, fuzz, chk: +arg('chk', 30) }); r.sec = Math.round((Date.now() - t0) / 1000); all.push(r);
    const k = r.kpi[r.kpi.length - 1] || {};
    console.log(`\n== ${caste} · ${start} (${r.sec} s) : jour ${k.day}, valeur ${Math.round(k.val / 1e5) / 10} M$ (départ ${Math.round(r.init.cash / 1e5) / 10}), trésorerie ${Math.round(k.cash / 1e5) / 10} M$, dette ${Math.round(k.loan / 1e5) / 10} M$, ${k.nb} bâtiments, ${k.made} produits fabriqués, pop ${k.pop}, ${k.msDay} ms/jour, fps ${JSON.stringify(r.fps)}`);
    console.log('   courbe de valeur (M$) : ' + r.kpi.map(x => `j${x.day}:${(x.val / 1e6).toFixed(1)}`).join(' '));
    console.log('   bâtiments : ' + JSON.stringify(k.own));
    ['viol', 'errs', 'slow', 'ui', 'inert'].forEach(f => { if (r[f] && r[f].length) console.log(`   ${f} (${r[f].length}) : ` + [...new Set(r[f])].slice(0, 8).join(' || ')); });
  }
  await L.closeBrowser();
  const outF = arg('out', ''); if (outF) fs.writeFileSync(outF, JSON.stringify(all, null, 1));
  const nv = all.reduce((a, r) => a + r.viol.length + r.errs.length, 0); console.log(`\n== Bilan : ${all.length} parcours, ${nv} violation(s) d'invariants ou erreur(s)`);
  process.exit(nv ? 1 : 0);
}
module.exports = { runOne, PRESET, CASTES, WATCH, KPI, START };
if (require.main === module) main();
