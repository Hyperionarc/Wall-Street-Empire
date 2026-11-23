// Passe 103 : MENU VERTICAL (Rémy : « je veux aussi un menu vertical comme Capitalism Lab »). Rail d'icônes à gauche, repliable, qui remplace le bouton « Menu » ;
// pied du rail = dock d'information en bas à gauche (journal, ville et économie, recherches, annonces des concurrents) ; chaque entrée ouvre une fenêtre avec croix et Échap ;
// HUD du haut minimal ; téléphone : bouton Menu en bas à gauche et tiroir ; aucune notification flottante après 60 jours de jeu.
exports.name = 'Menu vertical (passe 103)';
const HIDE = '#modesel,#win,#endscr,#caste,#hint{display:none!important}';
const OUT = process.env.WSE_SHOTS || '/tmp';
exports.run = async (t, L) => {
  // ---------- 1. Bureau et tablette : rail, dock, HUD minimal, chaque entrée ouvre une fenêtre (croix ≥ 44 px, Échap) ----------
  for (const [w, h] of [[1280, 800], [900, 800]]) {
    const ctx = await (await L.browser()).newContext({ viewport: { width: w, height: h } });
    const pg = await L.newPage({ ctx, wait: 1500 }); await L.setup(pg, { cash: 4e7 }); await L.inject(pg); await pg.addStyleTag({ content: HIDE });
    await pg.evaluate(() => { const W = window.WSE, T = window.T; window._shop = T.inC('s1'); T.inC('s1'); T.inC('res'); T.inP('f1'); for (let i = 0; i < 45; i++) W.step(); });
    const r = await pg.evaluate(() => {
      const vis = e => !!e && !e.hidden && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0, nav = document.getElementById('vnav'), R = nav.getBoundingClientRect();
      const ent = [...nav.querySelectorAll('[data-vn]')], dock = [...nav.querySelectorAll('.vnd [data-vn]')].map(b => b.dataset.vn), small = ent.filter(b => { const q = b.getBoundingClientRect(); return q.height < 44 || q.width < 44; }).map(b => b.dataset.vn);
      const dr = nav.querySelector('.vnd').getBoundingClientRect(), hudBtn = [...document.querySelectorAll('#hud button')].filter(vis).map(b => b.id);
      return { vis: vis(nav), x: R.left, w: R.width, h: R.height, n: ent.length, keys: ent.map(b => b.dataset.vn), small, dock, dockBottom: innerHeight - dr.bottom, dockLeft: dr.left, chips: [...document.querySelectorAll('#hud .stats .chip')].filter(vis).length, cash: document.getElementById('vCash').textContent, ca: document.getElementById('vNet').textContent, hudBtn, old: ['pn', 'pv', 'hudx', 'objtgl', 'rst'].filter(id => vis(document.getElementById(id))), lyrInHud: !!document.querySelector('#hud #lyr,#hud #occb') };
    });
    const need = ['corp', 'prod', 'myb', 'fin', 'fact', 'bourse', 'mfg', 'farm', 'goals', 'dec', 'game', 'jr', 'city', 'rd', 'annc'];
    t.check(`${w}×${h} : rail vertical visible à gauche, ${need.length} rubriques au moins (Sociétés … Réglages), cibles ≥ 44 px`, r.vis && r.x <= 1 && r.w >= 44 && r.w <= 80 && need.every(k => r.keys.indexOf(k) >= 0) && !r.small.length, JSON.stringify({ x: r.x, w: r.w, n: r.n, small: r.small, miss: need.filter(k => r.keys.indexOf(k) < 0) }));
    t.check(`${w}×${h} : dock en bas à gauche (journal, ville et économie, recherches, annonces des concurrents)`, ['jr', 'city', 'rd', 'annc'].every(k => r.dock.indexOf(k) >= 0) && r.dock.length === 4 && r.dockBottom < 40 && r.dockLeft < 20, JSON.stringify({ dock: r.dock, b: r.dockBottom, l: r.dockLeft }));
    t.check(`${w}×${h} : HUD minimal (trésorerie avec CA, date, vitesse, zoom ; plus de Menu, Produits, Calque, Transparence, ▾)`, r.chips === 2 && /CA/.test(r.ca) && !r.old.length && !r.lyrInHud && r.hudBtn.length <= 6, JSON.stringify({ chips: r.chips, ca: r.ca, btn: r.hudBtn, old: r.old }));
    // repli / dépli
    const ex = await pg.evaluate(async () => { const b = document.getElementById('vnTgl'), nav = document.getElementById('vnav'), lab = () => getComputedStyle(nav.querySelector('[data-vn="corp"] .vnt')).opacity; b.click(); await new Promise(r => setTimeout(r, 300)); const o = { w1: nav.getBoundingClientRect().width, l1: lab(), m: localStorage.getItem('wse-vnx') }; b.click(); await new Promise(r => setTimeout(r, 300)); o.w2 = nav.getBoundingClientRect().width; o.l2 = lab(); return o; });
    t.check(`${w}×${h} : le rail se déplie avec ses libellés et se replie (mémorisé)`, ex.w1 >= 180 && +ex.l1 > 0.9 && ex.w2 <= 80 && +ex.l2 < 0.1 && ex.m === '1', JSON.stringify(ex));
    // chaque entrée ouvre sa fenêtre
    const o = await pg.evaluate(async () => {
      const W = window.WSE, wait = ms => new Promise(r => setTimeout(r, ms)), bad = [], vis = e => !!e && !e.hidden && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
      const rail = document.getElementById('vnav').getBoundingClientRect(), tabsSeen = {};
      for (const g of W.vn.VN) {
        W.ui.open().forEach(q => q.o.close()); await wait(80);
        document.querySelector(`#vnav [data-vn="${g.k}"]`).click(); await wait(450);
        const L0 = W.ui.open().filter(q => q.o.id !== 'selTag' && q.o.id !== 'lyrmenu'); if (L0.length !== 1) { bad.push(g.k + ':' + L0.length + ' fenêtre(s)'); continue; }
        const E = document.getElementById(L0[0].o.id), R = E.getBoundingClientRect(), x = [...E.querySelectorAll('.xbig,.xinj,.xclose')].find(q => q.offsetParent);
        if (R.left < rail.right - 1) bad.push(g.k + ':cache le rail');
        if (!x) bad.push(g.k + ':pas de ×'); else { const q = x.getBoundingClientRect(); if (q.width < 44 || q.height < 44 || q.top - R.top > 70 || R.right - q.right > 60) bad.push(g.k + ':× ' + [q.width, q.height].join('x')); }
        if (document.querySelector(`#vnav [data-vn="${g.k}"]`).getAttribute('aria-current') !== 'true') bad.push(g.k + ':entrée non marquée');
        if (g.tabs) { const tb = [...document.querySelectorAll('#panel .pnav [data-ptab]')].filter(vis).map(b => b.dataset.ptab); if (tb.join() !== g.tabs.map(q => q[0]).join()) bad.push(g.k + ':onglets ' + tb.join('/'));
          for (const [tab] of g.tabs) { document.querySelector(`#panel .pnav [data-ptab="${tab}"]`).click(); await wait(250); const s = document.querySelector(`#panel [data-sec="${tab}"]`); const txt = s && !s.hidden ? s.innerText.trim() : ''; tabsSeen[tab] = txt.length; if (txt.length < 20) bad.push(g.k + '/' + tab + ':vide'); } }
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await wait(150);
        if (vis(E)) bad.push(g.k + ':Échap');
      }
      return { bad, tabsSeen };
    });
    t.check(`${w}×${h} : chaque entrée ouvre UNE fenêtre à droite du rail (croix ≥ 44 px en haut à droite, onglets de la rubrique non vides), Échap la ferme`, o.bad.length === 0, o.bad.slice(0, 8).join(' | ') + ' ' + Object.keys(o.tabsSeen).length + ' onglets');
    // deuxième clic referme, plein écran et largeur
    const fs = await pg.evaluate(async () => { const W = window.WSE, P = document.getElementById('panel'), wait = ms => new Promise(r => setTimeout(r, ms)), b = document.querySelector('#vnav [data-vn="fin"]'); b.click(); await wait(200); const w0 = P.getBoundingClientRect().width; document.getElementById('pfull').click(); await wait(150); const w1 = P.getBoundingClientRect().width; document.getElementById('pfull').click(); await wait(100); const w2 = P.getBoundingClientRect().width; b.click(); await wait(150); return { w0, w1, w2, closed: P.hidden, iw: innerWidth }; });
    t.check(`${w}×${h} : fenêtre en plein écran au choix, puis taille normale ; un second clic sur la rubrique la referme`, fs.w1 >= fs.w0 && fs.w1 >= fs.iw - 100 && Math.abs(fs.w2 - fs.w0) < 2 && fs.closed, JSON.stringify(fs));
    if (w === 1280) {
      // contenus ajoutés
      const c = await pg.evaluate(async () => {
        const W = window.WSE, wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
        W.vn.go('corp', 'corps'); await wait(300); const co = document.querySelectorAll('#vnCorps .co'); o.corps = co.length; o.corpsTxt = /Trésorerie[\s\S]*CA annuel[\s\S]*Résultat annuel/.test(document.getElementById('vnCorps').innerText) && !!document.querySelector('#vnCorps .co svg');
        co[1].click(); await wait(300); const fi = document.getElementById('vnFiche').innerText; o.fiche = ['BILAN', 'COMPTE DE RÉSULTAT', 'BOURSE', 'ÉTABLISSEMENTS', 'Stratégie'].every(k => fi.toUpperCase().indexOf(k.toUpperCase()) >= 0); o.ficheOn = !document.querySelector('#panel [data-sec="cfiche"]').hidden;
        W.vn.go('prod', 'pcards'); await wait(300); const pc = document.querySelector('#vnPcards .pc'); o.pc = document.querySelectorAll('#vnPcards .pc').length; o.pcTab = !!pc && /Prix[\s\S]*Qualité[\s\S]*Marque[\s\S]*Pondération|Pondération[\s\S]*Prix[\s\S]*Qualité[\s\S]*Marque/.test(pc.innerText) && pc.querySelectorAll('.pies svg').length === 2;
        const sel = document.querySelector('#vnPcards select[data-vact="pf:cls"]'); sel.value = 'lux'; sel.dispatchEvent(new Event('change', { bubbles: true })); await wait(200); o.lux = [...document.querySelectorAll('#vnPcards .pc .ph2 small:first-child')].every(s => /Luxe/.test(s.textContent));
        W.vn.go('myb'); await wait(300); o.myb = document.querySelectorAll('#vnMyb .myr').length; const ob = document.querySelector('#vnMyb [data-vact^="open:"]'); ob.click(); await wait(400); o.bview = !document.getElementById('bview').hidden; o.panelClosed = document.getElementById('panel').hidden; W.closeBuilding();
        W.vn.go('city'); await wait(300); const ct = document.querySelector('#panel [data-sec="city"]').innerText.toUpperCase(); o.macro = ['INFLATION', "POUVOIR D'ACHAT", 'CHÔMAGE', 'PIB', 'TAUX', 'POPULATION', 'POSTES POURVUS', 'HUMEUR'].every(k => ct.indexOf(k) >= 0);
        W.vn.go('goals'); await wait(300); o.objbar = !!document.querySelector('#panel [data-sec="goals"] #objbar') && !document.querySelector('#hud #objbar');
        W.vn.go('game'); await wait(300); o.lyr = !!document.querySelector('#panel [data-sec="game"] #lyr') && !!document.querySelector('#panel [data-sec="game"] #occb'); document.getElementById('lyr').click(); await wait(150); o.lyrMenu = !document.getElementById('lyrmenu').hidden; document.getElementById('lyrmenu').hidden = true;
        W.ui.open().forEach(q => q.o.close()); document.querySelector('#vnav [data-vn="mfg"]').click(); await wait(400); o.guide = /qualité est déterminée/i.test(document.getElementById('gview').innerText); o.chk = document.querySelectorAll('#gview .gchk').length >= 0;
        W.ui.open().forEach(q => q.o.close()); document.querySelector('#vnav [data-vn="annc"]').click(); await wait(300); o.annc = /ANNONCES DES CONCURRENTS/.test(document.getElementById('vnAnnc').innerText);
        W.ui.open().forEach(q => q.o.close()); return o;
      });
      t.check('Sociétés : classement (trésorerie, CA annuel, résultat, courbe) et fiche société (stratégie, bilan, compte de résultat, bourse, établissements)', c.corps >= 2 && c.corpsTxt && c.fiche && c.ficheOn, JSON.stringify(c).slice(0, 200));
      t.check('Produits : fiches avec Ta marque / Moyenne / Pondération, deux camemberts (production, détail), filtre de catégorie', c.pc >= 1 && c.pcTab && c.lux, JSON.stringify({ pc: c.pc, tab: c.pcTab, lux: c.lux }));
      t.check('Mes établissements : liste avec accès direct (« Ouvrir » ouvre le bâtiment)', c.myb >= 3 && c.bview && c.panelClosed, JSON.stringify({ n: c.myb, b: c.bview }));
      t.check('Ville et économie : inflation, pouvoir d\'achat, chômage, PIB, taux, population, postes pourvus, humeur', c.macro, '');
      t.check('Objectifs : le bandeau (scénario, jalons, tutoriel) est dans Menu > Objectifs et missions ; Réglages : calque et transparence', c.objbar && c.lyr && c.lyrMenu, JSON.stringify({ o: c.objbar, l: c.lyr, m: c.lyrMenu }));
      t.check('Guide du fabricant et annonces des concurrents depuis le rail', c.guide && c.annc, JSON.stringify({ g: c.guide, a: c.annc }));
      await pg.evaluate(() => { window.WSE.vn.go('corp'); }); await pg.waitForTimeout(400); await pg.screenshot({ path: OUT + '/t103_societes_1280.png' }).catch(() => {});
      await pg.evaluate(() => { window.WSE.vn.go('prod', 'pcards'); }); await pg.waitForTimeout(400); await pg.screenshot({ path: OUT + '/t103_produits_1280.png' }).catch(() => {});
      // sauvegarde : historique des sociétés sur 36 mois (champ facultatif S.rk.fh), ancienne sauvegarde sans fh
      const sv = await pg.evaluate(() => { const W = window.WSE, S = W.S; for (let i = 0; i < 70; i++) W.step(); const n = (S.rk.fh || []).length; W.save(); const k = Object.keys(localStorage).find(q => /"rk"/.test(localStorage.getItem(q) || '')); const raw = k ? JSON.parse(localStorage.getItem(k)) : {}; return { n, saved: raw.rk && Array.isArray(raw.rk.fh) ? raw.rk.fh.length : -1 }; });
      t.check('sauvegarde : historique des sociétés (rk.fh, 36 mois au plus) enregistré', sv.n >= 2 && sv.saved === sv.n, JSON.stringify(sv));
    } else { await pg.evaluate(() => { window.WSE.vn.go('corp', 'cfiche'); }); await pg.waitForTimeout(400); await pg.screenshot({ path: OUT + '/t103_fiche_900.png' }).catch(() => {}); }
    // ---------- 60 jours de jeu : aucune notification flottante, rien ne s'ouvre tout seul ----------
    const nf = await pg.evaluate(() => {
      const W = window.WSE, S = W.S, vis = e => !!e && !e.hidden && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0; W.ui.open().forEach(q => q.o.close()); S.noEv = false; let feed = 0, opened = 0, ban = 0;
      for (let d = 0; d < 60; d++) { W.step(); if (d % 5 === 0) { feed = Math.max(feed, [...document.querySelectorAll('#feed .msg')].filter(vis).length); opened = Math.max(opened, W.ui.open().filter(q => q.o.id !== 'selTag').length); ban += ['rvban', 'evcard', 'recap', 'shockbar', 'znban'].filter(id => vis(document.getElementById(id))).length; } }
      return { feed, opened, ban, jr: (S.jr || []).length };
    });
    t.check(`${w}×${h} : 60 jours de jeu avec événements : aucune notification flottante, aucun panneau ouvert tout seul (le journal reçoit tout)`, nf.feed === 0 && nf.opened === 0 && nf.ban === 0 && nf.jr > 0, JSON.stringify(nf));
    await pg.screenshot({ path: OUT + '/t103_jeu_' + w + '.png' }).catch(() => {});
    const errs = pg.errs.filter(e => !/setPointerCapture/.test(e)); t.check(`${w}×${h} : aucune erreur JS`, errs.length === 0, errs.slice(0, 3).join(' ; '));
    await ctx.close();
  }
  // ---------- 2. Téléphone 390×844 : bouton Menu en bas à gauche, tiroir, fenêtre plein écran ----------
  const ctx = await (await L.browser()).newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const pg = await L.newPage({ ctx, wait: 1500 }); await L.setup(pg, { cash: 4e7 }); await L.inject(pg); await pg.addStyleTag({ content: HIDE });
  await pg.evaluate(() => { const W = window.WSE, T = window.T; T.inC('s1'); T.inC('res'); for (let i = 0; i < 40; i++) W.step(); });
  const m0 = await pg.evaluate(() => { const nav = document.getElementById('vnav').getBoundingClientRect(), b = document.getElementById('vnMob').getBoundingClientRect(), bar = document.getElementById('bar').getBoundingClientRect(); return { navRight: nav.right, b: [b.left, b.width, b.height, bar.top - b.bottom], sw: document.documentElement.scrollWidth }; });
  t.check('390×844 : rail replié hors écran, bouton Menu (≥ 44 px) en bas à gauche au-dessus de la barre d\'outils', m0.navRight <= 1 && m0.b[0] < 20 && m0.b[1] >= 44 && m0.b[2] >= 44 && m0.b[3] >= 0 && m0.b[3] < 30 && m0.sw <= 390, JSON.stringify(m0));
  await pg.tap('#vnMob'); await pg.waitForTimeout(350);
  const m1 = await pg.evaluate(() => { const nav = document.getElementById('vnav'), R = nav.getBoundingClientRect(), d = [...nav.querySelectorAll('.vnd [data-vn]')].map(b => b.getBoundingClientRect()); return { l: R.left, w: R.width, dock: d.length, dockIn: d.every(q => q.bottom <= innerHeight && q.height >= 44), lab: getComputedStyle(nav.querySelector('[data-vn="corp"] .vnt')).opacity }; });
  await pg.screenshot({ path: OUT + '/t103_tiroir_390.png' }).catch(() => {});
  t.check('390×844 : le bouton Menu ouvre le tiroir (libellés, dock en bas, cibles ≥ 44 px)', m1.l >= -1 && m1.w >= 200 && m1.dock === 4 && m1.dockIn && +m1.lab > 0.9, JSON.stringify(m1));
  await pg.tap('#vnav [data-vn="corp"]'); await pg.waitForTimeout(450);
  const m2 = await pg.evaluate(() => { const P = document.getElementById('panel'), R = P.getBoundingClientRect(), x = P.querySelector('.xbig'), q = x ? x.getBoundingClientRect() : null, tabs = [...P.querySelectorAll('.pnav [data-ptab]')].filter(b => b.offsetParent).map(b => b.getBoundingClientRect().height); return { open: !P.hidden, R: [R.left, R.top, R.width], drawer: document.body.classList.contains('vnm'), x: q ? [q.width, q.height] : null, tabs, sw: document.documentElement.scrollWidth }; });
  await pg.screenshot({ path: OUT + '/t103_societes_390.png' }).catch(() => {});
  t.check('390×844 : une entrée ouvre sa fenêtre plein écran (onglets ≥ 44 px, croix ≥ 44 px), le tiroir se referme', m2.open && m2.R[0] <= 1 && m2.R[2] >= 385 && !m2.drawer && m2.x && m2.x[0] >= 44 && m2.tabs.length === 4 && m2.tabs.every(h => h >= 44) && m2.sw <= 390, JSON.stringify(m2));
  await pg.tap('#panel .xbig'); await pg.waitForTimeout(250);
  await pg.tap('#vnMob'); await pg.waitForTimeout(300); await pg.keyboard.press('Escape'); await pg.waitForTimeout(250);
  const m3 = await pg.evaluate(() => ({ panel: document.getElementById('panel').hidden, drawer: document.body.classList.contains('vnm') }));
  t.check('390×844 : la croix ferme la fenêtre, Échap ferme le tiroir', m3.panel && !m3.drawer, JSON.stringify(m3));
  await pg.tap('#vnMob'); await pg.waitForTimeout(300); await pg.tap('#vnav [data-vn="jr"]'); await pg.waitForTimeout(300);
  const m4 = await pg.evaluate(() => ({ jr: !document.getElementById('jrp').hidden, drawer: document.body.classList.contains('vnm') }));
  t.check('390×844 : le journal s\'ouvre depuis le dock du tiroir', m4.jr && !m4.drawer, JSON.stringify(m4));
  const errs = pg.errs.filter(e => !/setPointerCapture/.test(e)); t.check('390×844 : aucune erreur JS', errs.length === 0, errs.slice(0, 3).join(' ; '));
  await ctx.close();
  // ---------- 3. Ancienne sauvegarde sans historique fh : reprise des relevés mensuels existants ----------
  const p2 = await L.newPage({ wait: 1200 }); await L.setup(p2, {});
  const rs = await p2.evaluate(() => { const W = window.WSE, S = W.S; for (let i = 0; i < 65; i++) W.step(); W.save(); const k = Object.keys(localStorage).find(q => /"rk"/.test(localStorage.getItem(q) || '')); const raw = JSON.parse(localStorage.getItem(k)); const h = (raw.rk.H || []).length; delete raw.rk.fh; localStorage.setItem(k, JSON.stringify(raw)); return { k, h }; });
  await p2.reload(); await p2.waitForTimeout(1500);
  const rl = await p2.evaluate(() => { const S = window.WSE.S; return { fh: S.rk && S.rk.fh ? S.rk.fh.length : -1, H: S.rk && S.rk.H ? S.rk.H.length : -1 }; });
  t.check('sauvegarde rétro-compatible : sans rk.fh, l\'historique des sociétés reprend les relevés mensuels existants', rl.fh === rl.H && rl.H === rs.h && rl.H >= 2, JSON.stringify([rs.h, rl]));
  await p2.context().close();
};
