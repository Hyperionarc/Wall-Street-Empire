#!/usr/bin/env node
// Audit des intérieurs : pour CHAQUE type de bâtiment (TYPES), le construit dans une ville de test, ouvre sa vue intérieure (panneau + scène animée),
// parcourt tous les onglets, entre en vue immersive pour les usines (atelier + bureau / carnet de commandes), ouvre aussi le Mall et l'Aéroport,
// en bureau (1280×900) puis en mobile (390×844). Détecte : erreurs JS, NaN / undefined / Infinity (texte du panneau ET texte dessiné sur les canevas),
// éléments hors écran, défilement horizontal, onglets vides, scène vide, coût de rendu d'une image de la scène.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/audit_interieurs.js [dossier_captures] [filtre_type ...]
//   (construire d'abord : python3 wall-street-empire/tools/build.py). Écrit audit.json dans le dossier de captures.
const fs = require('fs'), path = require('path');

const SKIP = ['road', 'npc'], NET = ['pylon', 'cable', 'pipeline'];   // la route et les immeubles de la ville n'ont pas de vue intérieure (fiche immeuble à part)
// produit mis en fabrication dans chaque usine pour voir une ligne qui tourne (intrants fournis en stock local)
const FAB = { f1: ['r', 'steel'], f2: ['p', 'bread'], f3: ['p', 'jeans'], f4: ['p', 'jeans'], foundry: ['r', null] };

// Code injecté : construit tous les types demandés, met les usines en production, avance 15 jours (macro figée)
const BUILD_SRC = keys => `(() => {
  const W = window.WSE, S = W.S, N = W.N, T = window.T, out = {};
  T.frz(); for (let i = 0; i < 40; i++) T.inC('res'); T.inP('port');
  const tryAt = (key, x0, x1, y0, y1) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, key) && W.place(x, y, key)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[y * N + x]; } return null; };
  const onDep = (key, k) => { for (let i = 0; i < N * N; i++) { const d = S.dep[i]; if (d && d.k === k && d.r > 0 && !S.grid[i] && !W.footprintError(i % N, i / N | 0, key) && W.place(i % N, i / N | 0, key)) { try { W.autoConnect(i % N, i / N | 0); } catch (e) {} return S.grid[i]; } } return null; };
  const fake = (key, k) => { const proto = Object.values(S.dep).find(d => d && d.k && d.r > 0) || { r: 1e5 }; for (let y = 50; y < N - 2; y++) for (let x = 2; x < N - 2; x++) { const i = y * N + x; if (S.grid[i] || S.dep[i]) continue; S.dep[i] = Object.assign({}, proto, { k, r: W.DEPOSITS[k].res || 1e5 }); if (!W.footprintError(x, y, key) && W.place(x, y, key)) { try { W.autoConnect(x, y); } catch (e) {} return S.grid[i]; } delete S.dep[i]; } return null; };
  ${JSON.stringify(keys)}.forEach(key => {
    const Ty = W.TYPES[key]; let c = null;
    try {
      if (Ty.ext && !(W.CROPS[Ty.ext] || W.LIVE[Ty.ext])) c = onDep(key, Ty.ext) || fake(key, Ty.ext);
      else c = tryAt(key, 14, 44, 14, 44) || tryAt(key, 60, 90, 50, 90) || tryAt(key, 0, N, 0, N);
    } catch (e) { out[key] = { err: 'construction : ' + e.message }; return; }
    out[key] = c ? { x: c.x, y: c.y } : { err: 'aucun emplacement valide' };
  });
  // usines en production
  const fab = ${JSON.stringify(FAB)}, ins = new Set();
  Object.keys(fab).forEach(key => { const p = out[key]; if (!p || p.err) return; const c = S.grid[p.y * N + p.x], [kind, pk] = fab[key]; if (!pk) return;
    if (kind === 'p') { if (!S.prod[pk] || S.prod[pk].st !== 'on') { W.launchProduct(pk); const ps = S.prod[pk]; ps.st = 'on'; ps.rnd = 0; ps.pf = 1; } c.prod = pk; Object.keys(W.productInputs(pk)).forEach(g => ins.add(g)); }
    else { c.prod = pk; Object.keys(W.RECIPES[pk].in).forEach(g => ins.add(g)); }
    c.src = {}; ins.forEach(g => { c.src[g] = 'local'; }); c.wage = 2; });
  const pre = () => { T.frz(); S.cash = Math.max(S.cash, 5e9); ins.forEach(g => { S.stock[g] = Math.max(S.stock[g] || 0, 5e4); }); };
  for (let i = 0; i < 15; i++) { pre(); W.step(); }
  window.__AUD = { pre }; return out;
})()`;

// Mesures dans la page sur la vue Bâtiment ouverte
const MEASURE = `(() => {
  const bv = document.getElementById('bview'), BAD = /NaN|undefined|Infinity|\\[object/;
  const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const clipped = e => { for (let p = e.parentElement; p && p !== bv; p = p.parentElement) { const ox = getComputedStyle(p).overflowX; if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true; if (p.id === 'bsw') return true; } return false; };
  const out = [];
  if (!bv.hidden) bv.querySelectorAll('*').forEach(e => { if (out.length > 12 || !vis(e) || clipped(e)) return; const r = e.getBoundingClientRect(); if (r.right > innerWidth + 2 || r.left < -2) out.push((e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '')) + ' ' + Math.round(r.left) + '..' + Math.round(r.right)); });
  // boutons qui se recouvrent (hors menu contextuel #bpop, qui passe volontairement au-dessus)
  const ov = [], bs = bv.hidden ? [] : [...bv.querySelectorAll('button')].filter(b => vis(b) && !b.closest('#bpop') && getComputedStyle(b).opacity !== '0' && !b.closest('.idle #bcam'));
  const op = e => { for (let p = e; p && p !== bv; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.opacity === '0' || cs.pointerEvents === 'none') return true; } return false; };
  const R = bs.filter(b => !op(b)).map(b => [b, b.getBoundingClientRect()]);
  for (let i = 0; i < R.length && ov.length < 4; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i][1], b = R[j][1]; const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ix > 4 && iy > 4 && ix * iy > 0.25 * Math.min(a.width * a.height, b.width * b.height) && !R[i][0].contains(R[j][0]) && !R[j][0].contains(R[i][0])) { ov.push(R[i][0].textContent.trim().slice(0, 20) + ' / ' + R[j][0].textContent.trim().slice(0, 20)); break; } }
  const txt = bv.hidden ? '' : bv.innerText.replace(/\\s+/g, ' ');
  const m = txt.match(new RegExp('.{0,40}(' + BAD.source + ').{0,30}', 'g')) || [];
  const r = bv.getBoundingClientRect();
  const cv = document.getElementById('bscene'); let ink = 0, cols = 0;
  try { const g = cv.getContext('2d'), W2 = cv.width, H2 = cv.height, d = g.getImageData(0, 0, W2, H2).data, set = new Set(); let n = 0, k = 0; for (let i = 0; i < d.length; i += 4 * 97) { n++; if (d[i + 3] > 10) { k++; set.add((d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4)); } } ink = k / Math.max(1, n); cols = set.size; } catch (e) { ink = -1; }
  return { open: !bv.hidden, name: document.getElementById('bname').textContent, kind: window.WSE.scene ? window.WSE.scene.kind : null, bad: m.slice(0, 5), out, hscroll: bv.scrollWidth > bv.clientWidth + 2, inView: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1, ink, cols, ov, txtLen: txt.length, canvasBad: (window.__CVBAD || []).splice(0) };
})()`;

async function auditAll(L, o = {}) {
  const shots = o.shots || '', w = o.w || 1280, h = o.h || 900, tag = o.tag || (w < 600 ? 'mob' : 'pc');
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const pg = await L.newPage({ w, h, wait: 600 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint,#evcard,#recap,#cine{display:none!important}' });
  // texte dessiné sur les canevas : tout libellé contenant NaN / undefined est relevé
  await pg.evaluate(() => { window.__CVBAD = []; const P = CanvasRenderingContext2D.prototype, f0 = P.fillText, s0 = P.strokeText, BAD = /NaN|undefined|Infinity|\[object/;
    P.fillText = function (t, ...a) { if (BAD.test(String(t)) && window.__CVBAD.length < 20) window.__CVBAD.push(String(t).slice(0, 60)); return f0.call(this, t, ...a); };
    P.strokeText = function (t, ...a) { if (BAD.test(String(t)) && window.__CVBAD.length < 20) window.__CVBAD.push(String(t).slice(0, 60)); return s0.call(this, t, ...a); }; });
  const all = await pg.evaluate(() => Object.keys(window.WSE.TYPES));
  const keys = all.filter(k => !SKIP.includes(k) && (!o.only || !o.only.length || o.only.includes(k)));
  const tb = Date.now(), pos = await pg.evaluate(BUILD_SRC(keys)); if (o.log) console.log(`${tag} : ${keys.length} types construits en ${Date.now() - tb} ms`);
  const res = [];
  const err0 = () => pg.errs.splice(0);
  err0();
  for (const k of keys) {
    const r = { key: k, tag, problems: [] }, t1 = Date.now(); res.push(r);
    const p = pos[k]; if (!p || p.err) { r.problems.push('non construit : ' + (p && p.err)); continue; }
    try {
      if (NET.includes(k)) {   // réseau : pas d'intérieur, un message d'information à la place
        const n = await pg.evaluate(p => { window.WSE.closeBuilding(); window.WSE.openBuilding(p.x, p.y); const f = document.getElementById('feed'), J = window.WSE.S.jr || [], tg = document.getElementById('selTag'); return { open: !document.getElementById('bview').hidden, msg: (f && f.lastChild && f.lastChild.textContent) || (J.length ? J[J.length - 1].t : '') || (tg && !tg.hidden ? tg.textContent : '') }; }, p);   // passe 99 : message au journal (et étiquette de sélection)
        r.kind = 'msg'; r.name = n.msg; if (n.open) r.problems.push('le réseau ouvre une vue intérieure'); if (!n.msg || /NaN|undefined/.test(n.msg)) r.problems.push('message absent ou suspect : ' + n.msg);
        const er = err0(); if (er.length) r.problems.push('erreurs JS : ' + er.join(' || ').slice(0, 300)); continue;
      }
      await pg.evaluate(p => { window.WSE.closeBuilding(); window.WSE.openBuilding(p.x, p.y); }, p);
      await pg.waitForTimeout(o.fast ? 350 : 700);
      if (await pg.evaluate(() => window.WSE.imm.on)) { await pg.waitForTimeout(900); }   // mobile : les usines entrent directement en plein écran
      const m = await pg.evaluate(MEASURE); Object.assign(r, { name: m.name, kind: m.kind, ink: m.ink, cols: m.cols });
      if (!m.open) r.problems.push('la vue ne s\'ouvre pas');
      if (m.bad.length) r.problems.push('texte suspect : ' + m.bad.join(' | '));
      if (m.canvasBad.length) r.problems.push('texte de scène suspect : ' + m.canvasBad.join(' | '));
      if (m.out.length) r.problems.push('hors écran : ' + m.out.slice(0, 4).join(', '));
      if (m.hscroll) r.problems.push('défilement horizontal du panneau');
      if (m.ov.length) r.problems.push('boutons superposés : ' + m.ov.join(', '));
      if (!m.inView) r.problems.push('panneau hors de la fenêtre');
      if (m.ink >= 0 && (m.ink < 0.2 || m.cols < 6)) r.problems.push(`scène vide ou presque (couverture ${Math.round(m.ink * 100)} %, ${m.cols} couleurs)`);
      // coût de rendu d'une image de la scène
      r.frameMs = await pg.evaluate(() => { const W = window.WSE, t0 = performance.now(); for (let i = 0; i < 10; i++) W.sceneFrame(0.033); return +((performance.now() - t0) / 10).toFixed(2); });
      if (r.frameMs > 25) r.problems.push('scène lente : ' + r.frameMs + ' ms/image');
      if (shots) await pg.screenshot({ path: path.join(shots, `${tag}_${k}.png`) });
      // onglets
      const tabs = await pg.evaluate(() => [...document.querySelectorAll('#bview .btabs button')].filter(b => !b.hidden && b.offsetParent).map(b => [b.dataset.act, b.textContent]));
      r.tabs = tabs.map(t => t[1]);
      for (const [act, lab] of tabs) {
        if (act === 'tab:int') continue;
        const tm = await pg.evaluate(async act => { const b = document.querySelector(`#bview .btabs button[data-act="${act}"]`); b.click(); await new Promise(x => setTimeout(x, 120)); const bb = document.getElementById('bbody'); return { len: bb.innerText.replace(/\s+/g, ' ').length }; }, act);
        const m2 = await pg.evaluate(MEASURE);
        if (tm.len < 40) r.problems.push(`onglet ${lab} vide`);
        if (m2.bad.length) r.problems.push(`onglet ${lab} : texte suspect ${m2.bad.join(' | ')}`);
        if (m2.out.length) r.problems.push(`onglet ${lab} : hors écran ${m2.out.slice(0, 3).join(', ')}`);
        if (m2.hscroll) r.problems.push(`onglet ${lab} : défilement horizontal`);
      }
      await pg.evaluate(() => { const b = document.querySelector('#bview .btabs button[data-act="tab:int"]'); if (b) b.click(); });
      // usines : vue immersive, atelier, bureau (carnet de commandes)
      const isF = await pg.evaluate(k => !!window.WSE.PLAN_DIM[k], k);
      if (isF) {
        await pg.evaluate(() => { if (!window.WSE.imm.on) window.WSE.immEnter(null, 'tab'); }); await pg.waitForTimeout(1300);
        const mi = await pg.evaluate(MEASURE); r.imm = { on: await pg.evaluate(() => window.WSE.imm.on), ink: mi.ink };
        if (!r.imm.on) r.problems.push('vue immersive : ne s\'ouvre pas');
        if (mi.bad.length || mi.canvasBad.length) r.problems.push('immersive : texte suspect ' + mi.bad.concat(mi.canvasBad).join(' | '));
        if (mi.ink >= 0 && mi.ink < 0.2) r.problems.push('immersive : scène vide');
        if (mi.ov.length) r.problems.push('immersive : boutons superposés : ' + mi.ov.join(', '));
        if (mi.out.length) r.problems.push('immersive : hors écran ' + mi.out.slice(0, 3).join(', '));
        r.immMs = await pg.evaluate(() => { const W = window.WSE, t0 = performance.now(); for (let i = 0; i < 10; i++) W.sceneFrame(0.033); return +((performance.now() - t0) / 10).toFixed(2); });
        if (r.immMs > 30) r.problems.push('immersive lente : ' + r.immMs + ' ms/image');
        if (shots) await pg.screenshot({ path: path.join(shots, `${tag}_${k}_imm.png`) });
        await pg.evaluate(() => window.WSE.fac.openBook()); await pg.waitForTimeout(400);
        const bk = await pg.evaluate(() => { const p = document.getElementById('bpop'), rr = p.getBoundingClientRect(); return { vis: !p.hidden, txt: p.innerText.replace(/\s+/g, ' '), inView: rr.left >= -1 && rr.right <= innerWidth + 1 && rr.top >= -1 && rr.bottom <= innerHeight + 1 }; });
        r.book = bk.txt.slice(0, 220);
        if (!bk.vis || !/Carnet de commandes/.test(bk.txt)) r.problems.push('carnet de commandes absent');
        if (/NaN|undefined|Infinity/.test(bk.txt)) r.problems.push('carnet : texte suspect');
        if (!bk.inView) r.problems.push('carnet hors écran');
        if (shots) await pg.screenshot({ path: path.join(shots, `${tag}_${k}_carnet.png`) });
        await pg.evaluate(() => window.WSE.immExit()); await pg.waitForTimeout(900);
        if (await pg.evaluate(() => window.WSE.imm.on)) { await pg.evaluate(() => window.WSE.closeBuilding()); }
      }
    } catch (e) { r.problems.push('exception : ' + (e.message || e).toString().slice(0, 160)); }
    const er = err0(); if (er.length) r.problems.push('erreurs JS : ' + er.slice(0, 3).join(' || ').slice(0, 300));
    r.ms = Date.now() - t1; if (o.log) console.log(`${tag} ${k.padEnd(10)} ${(r.kind || '').padEnd(6)} ${String(r.ms).padStart(5)} ms  ${r.problems.length ? r.problems.join(' ; ') : 'ok'}`);
  }
  // Mall central et aéroport (panneaux dédiés)
  for (const [k, sel, open] of [['mall', '#mallp', 'mall'], ['aeroport', '#airp', 'air']]) {
    if (o.only && o.only.length && !o.only.includes(k)) continue;
    const r = { key: k, tag, problems: [] }; res.push(r);
    try {
      await pg.evaluate(open => { window.WSE.closeBuilding(); window.WSE[open].open(); }, open); await pg.waitForTimeout(500);
      const m = await pg.evaluate(sel => { const p = document.querySelector(sel); if (!p) return { none: 1 }; const rr = p.getBoundingClientRect(), t = p.innerText.replace(/\s+/g, ' '); return { vis: !p.hidden && rr.width > 0, len: t.length, bad: t.match(/.{0,40}(NaN|undefined|Infinity).{0,20}/g) || [], inView: rr.left >= -1 && rr.right <= innerWidth + 1, hs: p.scrollWidth > p.clientWidth + 2 }; }, sel);
      r.name = k; if (m.none || !m.vis) r.problems.push('panneau absent'); if (m.bad && m.bad.length) r.problems.push('texte suspect : ' + m.bad.join(' | ')); if (m.inView === false) r.problems.push('panneau hors écran'); if (m.hs) r.problems.push('défilement horizontal');
      if (shots) await pg.screenshot({ path: path.join(shots, `${tag}_${k}.png`) });
      await pg.evaluate(open => window.WSE[open].close(), open);
    } catch (e) { r.problems.push('exception : ' + e.message.slice(0, 160)); }
    const er = err0(); if (er.length) r.problems.push('erreurs JS : ' + er.slice(0, 3).join(' || ').slice(0, 300));
  }
  // les données du jeu restent finies après toutes ces ouvertures
  const nan = await pg.evaluate(() => window.T.scan()); if (nan.length) res.push({ key: '_etat', tag, problems: ['valeurs non finies dans S : ' + nan.slice(0, 6).join(', ')] });
  await pg.context().close();
  return res;
}
module.exports = { auditAll, BUILD_SRC };

if (require.main === module) {
  const L = require('./tests/lib.js');
  const shots = process.argv[2] || path.join(require('os').tmpdir(), 'wse_audit_interieurs'), only = process.argv.slice(3);
  (async () => {
    const v = process.env.WSE_AUD_VIEW || 'pc,mob', t0 = Date.now();
    const pc = /pc/.test(v) ? await auditAll(L, { shots, only, log: 1 }) : [], mob = /mob/.test(v) ? await auditAll(L, { shots, only, w: 390, h: 844, log: 1 }) : [];
    await L.closeBrowser();
    const all = pc.concat(mob); fs.writeFileSync(path.join(shots, 'audit_' + v.replace(',', '_') + '.json'), JSON.stringify(all, null, 1));
    all.forEach(r => console.log(`${r.tag} ${r.key.padEnd(10)} ${(r.kind || '').padEnd(6)} ${r.frameMs != null ? String(r.frameMs).padStart(6) + 'ms' : '        '} ${r.problems.length ? 'PROBLÈMES : ' + r.problems.join(' ; ') : 'ok'}`));
    const bad = all.filter(r => r.problems.length).length;
    console.log(`\n${all.length} vues auditées, ${bad} avec problème(s), ${((Date.now() - t0) / 1000).toFixed(0)} s · captures : ${shots}`);
  })();
}
