#!/usr/bin/env node
// Parcours joueur scripté, au clic réel (souris) comme le ferait Rémy : écran de départ -> mode Round -> choix de caste -> premier commerce près du Mall
// -> ouverture du magasin -> première usine (pain) avec sa ferme et son moulin -> magasin approvisionné -> export par le port.
// À chaque étape : erreurs JS, NaN / undefined affichés, boutons inertes (clic sans effet visible), soft-lock (rien ne bouge), images/s sur la carte et dans l'usine.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/parcours_joueur.js [dossier_captures]
const path = require('path'), fs = require('fs');
const L = require('./tests/lib.js');

async function parcours(o = {}) {
  const shots = o.shots || '', W0 = o.w || 1280, H0 = o.h || 720, steps = [], tag = o.tag || (W0 < 600 ? 'mob' : 'pc');
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const pg = await L.newPage({ w: W0, h: H0, wait: 3000 });
  const snap = async n => { if (shots) await pg.screenshot({ path: path.join(shots, `parcours_${tag}_${n}.png`) }); };
  const bad = () => pg.evaluate(() => { const t = document.body.innerText; return (t.match(/.{0,30}(NaN|undefined|Infinity|\[object).{0,20}/g) || []).slice(0, 4); });
  const step = async (name, fn) => {
    const r = { name, ok: true, notes: [] }; steps.push(r); const e0 = pg.errs.length;
    try { const v = await fn(r); if (v === false) r.ok = false; } catch (e) { r.ok = false; r.notes.push('exception : ' + String(e.message || e).slice(0, 200)); }
    const b = await bad(); if (b.length) { r.ok = false; r.notes.push('texte suspect : ' + b.join(' | ')); }
    const er = pg.errs.slice(e0); if (er.length) { r.ok = false; r.notes.push('erreurs JS : ' + er.slice(0, 3).join(' || ').slice(0, 300)); }
    await snap(steps.length + '_' + name.replace(/[^a-z0-9]+/gi, '_').slice(0, 30));
    if (o.log) console.log(`${r.ok ? 'OK  ' : 'PB  '} ${name}${r.notes.length ? ' — ' + r.notes.join(' ; ') : ''}`);
    return r;
  };
  const click = async sel => { const b = await pg.$(sel); if (!b) throw new Error('introuvable : ' + sel); await b.scrollIntoViewIfNeeded(); await b.click(); await pg.waitForTimeout(350); };
  // le joueur fait glisser la carte pour amener la case dans une zone visible (sur mobile, le haut de l'écran est pris par le tableau de bord), puis touche la case
  const tileClick = async (x, y) => {
    const q = await pg.evaluate(([x, y]) => { const W = window.WSE; W.centerOn(x + 0.5, y + 0.5);
      const hit = (px, py) => { const e = document.elementFromPoint(px, py); return e && e.id === 'view'; };
      let p = W.tileToScreen(x, y); if (hit(p.x, p.y)) return p;
      // case masquée : cherche le point de carte libre le plus proche du centre et y amène la case (décalage en cases calculé sur la projection)
      const a = W.tileToScreen(x + 1, y), b = W.tileToScreen(x, y + 1), ux = [a.x - p.x, a.y - p.y], uy = [b.x - p.x, b.y - p.y], det = ux[0] * uy[1] - ux[1] * uy[0];
      let best = null; for (let py = 40; py < innerHeight - 40; py += 20) for (let px = 30; px < innerWidth - 30; px += 20) if (hit(px, py) && hit(px + 12, py) && hit(px, py + 12)) { const d = Math.hypot(px - innerWidth / 2, py - innerHeight / 2); if (!best || d < best.d) best = { px, py, d }; }
      if (!best || !det) { p.hit = 'masquée'; return p; }
      const vx = p.x - best.px, vy = p.y - best.py, kx = (vx * uy[1] - vy * uy[0]) / det, ky = (ux[0] * vy - ux[1] * vx) / det;
      W.centerOn(x + 0.5 + kx, y + 0.5 + ky); p = W.tileToScreen(x, y); if (!hit(p.x, p.y)) { const e = document.elementFromPoint(p.x, p.y); p.hit = e ? (e.id || e.tagName.toLowerCase() + '.' + e.className) : 'rien'; } return p; }, [x, y]);
    if (q.hit) tileClick.cover = (tileClick.cover || []).concat(q.hit);
    await pg.waitForTimeout(250); await pg.mouse.click(q.x, q.y); await pg.waitForTimeout(400); return q; };
  // le simple clic sur une usine ouvre sa fiche après un court délai (double-clic = entrer) : attendre la fiche, et la fin d'une éventuelle animation d'entrée
  const openWait = async () => { await pg.waitForFunction(() => !document.getElementById('bview').hidden && !window.WSE.imm.tr, null, { timeout: 15000 }).catch(() => {}); await pg.mouse.move(W0 / 2 + 3, H0 / 2 + 3); await pg.waitForTimeout(300); };   // le joueur bouge : les commandes de l'usine plein écran réapparaissent (elles s'estompent après un temps d'inactivité)
  const fps = async ms => pg.evaluate(ms => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < ms) requestAnimationFrame(f); else res(Math.round(n * 1000 / (performance.now() - t0))); }; requestAnimationFrame(f); }), ms);
  const days = n => pg.evaluate(n => { const W = window.WSE; for (let i = 0; i < n; i++) W.step(); W.refreshStats && W.refreshStats(); return W.S.day; }, n);

  await step('écran de départ : choix du mode', async r => { const v = await pg.evaluate(() => !document.getElementById('modesel').hidden); if (!v) { r.notes.push('pas d\'écran de choix du mode'); return false; } });
  await step('mode Round', async r => { await click('#modesel [data-mode=round]'); await pg.waitForTimeout(600);
    const st = await pg.evaluate(() => ({ mode: !document.getElementById('modesel').hidden, caste: !document.getElementById('caste').hidden, cbtn: [...document.querySelectorAll('#caste button')].filter(b => b.offsetParent).map(b => [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + ':' + b.textContent.trim().slice(0, 18)) }));
    r.notes.push('caste visible : ' + st.caste); r.cbtn = st.cbtn; if (!st.caste) return false; });
  await step('choix de caste (Industriel)', async r => {
    await click('#caste [data-cview="industriel"]'); await pg.waitForTimeout(400);   // fiche de la caste
    await click('#caste [data-caste="industriel"]'); await pg.waitForTimeout(500);
    // confirmation éventuelle
    const conf = await pg.evaluate(() => { const c = document.getElementById('caste'); if (c.hidden) return 'fermé'; const b = [...c.querySelectorAll('button')].filter(b => b.offsetParent).find(b => /commencer|jouer|valider|choisir|confirmer|go/i.test(b.textContent)); if (b) { b.setAttribute('data-pj2', '1'); return b.textContent.trim().slice(0, 30); } return 'ouvert sans bouton'; });
    if (conf !== 'fermé' && conf !== 'ouvert sans bouton') await click('#caste [data-pj2="1"]');
    await pg.waitForTimeout(600);
    const st = await pg.evaluate(() => ({ caste: window.WSE.S.caste, open: !document.getElementById('caste').hidden, day: window.WSE.S.day }));
    r.notes.push(JSON.stringify(st)); if (st.open || !st.caste) return false;
    await pg.evaluate(() => { window.WSE.setSpeed(0); window.WSE.S.noEv = true; const b = document.querySelector('[data-sg="close"]'); if (b) b.click(); });
  });
  let shop = null;
  await step('premier commerce : Petit marché près du Mall (outil + clic sur la carte)', async r => {
    await click('[data-c=com]');
    const has = await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-k]')].find(b => b.dataset.k === 's1' && b.offsetParent); return !!b; });
    if (!has) { const fam = await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-f]')].filter(b => b.offsetParent).find(b => /commerce|magasin|march/i.test(b.textContent)); if (b) b.click(); return b ? b.textContent.trim().slice(0, 30) : null; }); r.notes.push('famille : ' + fam); await pg.waitForTimeout(300); }
    const ok = await pg.evaluate(() => { const b = [...document.querySelectorAll('[data-k="s1"]')].find(b => b.offsetParent); if (b) b.click(); return !!b; });
    if (!ok) { r.notes.push('bouton Petit marché introuvable dans la barre, outil posé par setTool'); await pg.evaluate(() => window.WSE.setTool('s1')); }
    await pg.waitForTimeout(300);
    const sp = await pg.evaluate(() => window.WSE.mall.spot('s1')); if (!sp) { r.notes.push('aucune case libre près du Mall'); return false; }
    const c0 = await pg.evaluate(() => window.WSE.S.cash);
    await tileClick(sp.x, sp.y);
    shop = await pg.evaluate(([x, y]) => { const c = window.WSE.S.grid[y * window.WSE.N + x]; return c && c.t === 's1' ? { x: c.x, y: c.y } : null; }, [sp.x, sp.y]);
    const c1 = await pg.evaluate(() => window.WSE.S.cash); const msg = await pg.evaluate(() => (window.WSE.S._sayBuf || []).slice(-2).join(' | ')); r.notes.push(`case ${sp.x},${sp.y} · posé ${!!shop} · trésorerie ${c1 - c0 >= 0 ? '+' : ''}${Math.round(c1 - c0)} $ (coût moins récompense de mission éventuelle) · messages : ${msg}`);
    if (!shop) return false;
  });
  await step('ouvrir le magasin (outil Main + clic) et remplir les rayons', async r => {
    await click('[data-k=view]'); await tileClick(shop.x, shop.y);
    const st = await pg.evaluate(() => ({ open: !document.getElementById('bview').hidden, name: document.getElementById('bname').textContent }));
    r.notes.push(JSON.stringify(st)); if (!st.open) return false;
    const fill = await pg.$('#bview [data-act="autoslots"]'); if (fill) { await fill.click(); await pg.waitForTimeout(300); }
    await days(10);
    const s = await pg.evaluate(([x, y]) => { const c = window.WSE.S.grid[y * window.WSE.N + x]; return { out: c.out, profit: c.profit, util: c.util }; }, [shop.x, shop.y]);
    r.notes.push('après 10 j : ' + JSON.stringify(s)); if (!(s.out > 0)) { r.notes.push('le magasin ne vend rien'); return false; }
    await click('#bview [data-act=close]');
  });
  r_fps = await fps(2500);
  await step('fluidité sur la carte (vitesse ×1)', async r => { await pg.evaluate(() => window.WSE.setSpeed(1)); const f = await fps(3000); await pg.evaluate(() => window.WSE.setSpeed(0)); r.notes.push(`${f} images/s (pause : ${r_fps})`); r.fps = f; if (f < 20) return false; });
  const place = async (key, zone) => pg.evaluate(([key, zone]) => { const W = window.WSE, S = W.S, N = W.N, [x0, x1, y0, y1] = zone; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!W.footprintError(x, y, key)) return { x, y }; return null; }, [key, zone]);
  const build = async (r, key, zone, ext) => {
    await pg.evaluate(k => window.WSE.setTool(k), key); let sp;
    if (ext) sp = await pg.evaluate(([key, ext]) => { const W = window.WSE, S = W.S, N = W.N; let best = null; for (let i = 0; i < N * N; i++) { const x = i % N, y = i / N | 0; if (!W.footprintError(x, y, key)) { const d = Math.abs(x - 70) + Math.abs(y - 66); if (!best || d < best.d) best = { x, y, d }; } } return best; }, [key, ext]);
    else sp = await place(key, zone);
    if (!sp) { r.notes.push('pas de place pour ' + key); return null; }
    await tileClick(sp.x, sp.y);
    const c = await pg.evaluate(([x, y, k]) => { const c = window.WSE.S.grid[y * window.WSE.N + x]; return c && c.t === k ? { x: c.x, y: c.y } : null; }, [sp.x, sp.y, key]);
    if (!c && tileClick.cover) { r.notes.push('clic masqué par ' + tileClick.cover.slice(-1)[0]); }
    tileClick.cover = null;
    r.notes.push(key + (c ? ' posé en ' + sp.x + ',' + sp.y : ' NON posé : ' + await pg.evaluate(([x, y, k]) => window.WSE.footprintError(x, y, k), [sp.x, sp.y, key])));
    return c;
  };
  let farm, mill, bak, port;
  await step('chaîne du pain : ferme de blé, moulin (farine), boulangerie (pain), terminal portuaire', async r => {
    await pg.evaluate(() => { window.WSE.S.cash = Math.max(window.WSE.S.cash, 3e7); });
    farm = await build(r, 'fwheat', null, 'wheat'); mill = await build(r, 'f1', [60, 90, 50, 90]); bak = await build(r, 'f1', [60, 90, 50, 90]); port = await build(r, 'port', [60, 90, 50, 90]);
    await pg.evaluate(() => window.WSE.setTool('view'));
    if (!farm || !mill || !bak) return false;
  });
  await step('boulangerie : « Choisir la production » -> catalogue -> Pain -> « Tout lancer automatiquement »', async r => {
    await tileClick(bak.x, bak.y); await openWait();
    const cb = await pg.$('#bview [data-act="catalog"]:visible'); if (!cb) { r.notes.push('bouton catalogue absent'); return false; } await cb.click(); await pg.waitForTimeout(500);
    await click('#cview [data-cat="sel:bread"]');
    const btn = await pg.evaluate(() => { const b = document.querySelector('#cview [data-cat="easy:bread"], #cview [data-cat="make:bread"]'); return b ? b.textContent.trim().slice(0, 60) : null; }); r.notes.push('bouton : ' + btn); if (!btn) return false;
    await click('#cview [data-cat="easy:bread"], #cview [data-cat="make:bread"]'); await pg.waitForTimeout(500);
    const fab = await pg.evaluate(() => { const f = document.getElementById('fabview'); if (f && !f.hidden) { const b = [...f.querySelectorAll('button')].find(b => /confirm|lancer|oui|fabriquer/i.test(b.textContent)) || f.querySelector('button'); const t = b.textContent.trim().slice(0, 40); b.click(); return t; } return null; }); if (fab) r.notes.push('confirmation : ' + fab);
    await pg.waitForTimeout(400); await pg.evaluate(() => { ['cview', 'pview'].forEach(i => { const e = document.getElementById(i); if (e && !e.hidden) { const c = e.querySelector('[data-cat="close"], .ibtn'); if (c) c.click(); } }); });
    const st = await pg.evaluate(([b, m]) => { const S = window.WSE.S, N = window.WSE.N; return { bak: S.grid[b.y * N + b.x].prod, mill: S.grid[m.y * N + m.x].prod, bread: S.prod.bread.st, src: S.grid[b.y * N + b.x].src }; }, [bak, mill]);
    r.notes.push(JSON.stringify(st)); if (st.bak !== 'bread' || st.bread !== 'on') return false;
  });
  await step('entrer dans l\'usine (plein écran), images/s, sortie par Échap', async r => {
    await tileClick(bak.x, bak.y); await openWait();
    const e = await pg.$('#bview [data-imm="enter"]'); if (e && await e.isVisible()) { await e.click(); await pg.waitForTimeout(1400); } else r.notes.push('bouton « Entrer » non visible');
    const imm = await pg.evaluate(() => window.WSE.imm.on); r.notes.push('plein écran : ' + imm);
    const f = await fps(2500); r.notes.push(`${f} images/s dans l'usine`); r.fps = f;
    await pg.waitForFunction(() => !window.WSE.imm.tr, null, { timeout: 15000 }).catch(() => {}); await pg.mouse.move(W0 / 2, H0 / 2); await pg.waitForTimeout(200);   // fin de l'animation d'entrée (machine chargée)
    const tel = W0 < 600 || H0 < 520;   // téléphone (portrait ou paysage) : pas de clavier, on touche « Sortir »
    if (tel) { await click('#bexit'); await pg.waitForTimeout(1100); } else { await pg.keyboard.press('Escape'); await pg.waitForTimeout(1100); }
    const imm2 = await pg.evaluate(() => window.WSE.imm.on); r.notes.push((tel ? 'bouton Sortir' : 'Échap') + ' : sortie ' + !imm2 + (tel ? ' (sur téléphone, l\'usine s\'ouvre directement en plein écran)' : '')); if (imm2 || !imm) return false;
    await pg.evaluate(() => window.WSE.closeBuilding());
  });
  await step('le magasin vend le pain ; le surplus part à l\'export ; aucun stock négatif', async r => {
    // le Petit marché ne le vend que s'il est en rayon
    await tileClick(shop.x, shop.y); const fill = await pg.$('#bview [data-act="autoslots"]'); if (fill) { await fill.click(); await pg.waitForTimeout(200); } await pg.evaluate(() => window.WSE.closeBuilding());
    const res = await pg.evaluate(([b, m]) => { const W = window.WSE, S = W.S, N = W.N, neg = []; let mn = 1e9;
      for (let d = 0; d < 30; d++) { W.step(); Object.keys(S.prod).forEach(k => { if (S.prod[k].stock < 0) neg.push(k + '=' + S.prod[k].stock); }); Object.keys(S.stock).forEach(g => { if (S.stock[g] < 0) neg.push(g + '=' + S.stock[g]); }); mn = Math.min(mn, S.prod.bread.stock); }
      const bk = S.grid[b.y * N + b.x], ml = S.grid[m.y * N + m.x], ps = S.prod.bread, B = W.fac.book(bk);
      return { bakOut: bk.out, bakLim: bk.limit, millOut: ml.out, millLim: ml.limit, sold: ps.sold, exp: ps.exp, stock: ps.stock, dem: B && B.dem, neg: neg.slice(0, 5), mn, cash: S.cash, advice: W.fac.advice(bk, B, W.recOf(bk)).t }; }, [bak, mill]);
    r.notes.push(JSON.stringify(res)); r.data = res;
    if (res.neg.length || !(res.bakOut > 0) || !(res.sold > 0)) return false;
  });
  await step('sauvegarde puis rechargement : la partie reprend à l\'identique', async r => {
    const a = await pg.evaluate(() => { const W = window.WSE; W.save(); return { day: W.S.day, cash: Math.round(W.S.cash), n: W.S.grid.filter(c => c && c.t !== 'npc' && c.t !== 'road').length }; });
    await pg.reload(); await pg.waitForTimeout(3000);
    const b = await pg.evaluate(() => { const W = window.WSE; const ms = document.getElementById('modesel'); return { day: W.S.day, cash: Math.round(W.S.cash), n: W.S.grid.filter(c => c && c.t !== 'npc' && c.t !== 'road').length, modesel: ms && !ms.hidden }; });
    r.notes.push('avant ' + JSON.stringify(a) + ' après ' + JSON.stringify(b)); if (b.day < a.day || b.day > a.day + 10 || a.n !== b.n) return false;
  });
  await pg.context().close();
  return steps;
}
module.exports = { parcours };
let r_fps = 0;
if (require.main === module) {
  (async () => {
    const shots = process.argv[2] || '';
    const a = await parcours({ shots, log: 1 }); console.log('--- mobile 390×844'); const b = await parcours({ shots, log: 1, w: 390, h: 844 });
    // passe 64 : téléphone en paysage et tablette
    console.log('--- paysage 844×390'); const c = await parcours({ shots, log: 1, w: 844, h: 390, tag: 'pay' });
    console.log('--- tablette 820×1180'); const d = await parcours({ shots, log: 1, w: 820, h: 1180, tag: 'tab' }); await L.closeBrowser();
    const all = a.concat(b, c, d); console.log(`\n${all.filter(s => s.ok).length}/${all.length} étapes sans problème`);
  })();
}
