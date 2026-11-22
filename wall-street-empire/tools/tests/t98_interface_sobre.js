// Passe 99 : interface sobre (Rémy : « le joueur va saturer », « trop d'informations »). Journal daté et filtrable sauvegardé, décisions en attente sans bannière,
// Menu > Ville / Économie, clic = sélection légère (pas de fiche économique), identité du bâtiment cliqué (pas de boulangerie pour un immeuble),
// fermeture uniforme (× ≥ 44 px collante, Échap, clic sur la carte), calques d'implantation, aide « ? ».
exports.name = 'Interface sobre (passe 99)';
const HIDE = '#modesel,#win,#endscr,#caste,#hint{display:none!important}';
exports.run = async (t, L) => {
  // ---------- 1. Partie avec événements : aucune bannière ni fenêtre qui interrompt, HUD sobre, journal et décisions ----------
  for (const [w, h] of [[1280, 800], [900, 800], [390, 844]]) {
    const ctx = await (await L.browser()).newContext({ viewport: { width: w, height: h } });
    const pg = await L.newPage({ ctx, wait: 1500 }); await L.setup(pg, { cash: 4e7 }); await L.inject(pg); await pg.addStyleTag({ content: HIDE });
    const r = await pg.evaluate(() => {
      const W = window.WSE, S = W.S, T = window.T, vis = e => !!e && !e.hidden && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0;
      S.noEv = false; for (let i = 0; i < 6; i++) T.inC('s1'); T.inC('res');
      let modal = 0, ban = 0; const bar = document.getElementById('bar').getBoundingClientRect().top;
      for (let d = 0; d < 220; d++) { W.step(); if (d % 10 === 0) { if (['evcard', 'recap', 'win', 'shockbar'].some(id => vis(document.getElementById(id)))) modal++;
        if ([...document.querySelectorAll('body *')].some(e => { if (!vis(e) || e.closest('#bar,#hud,#bview,#panel,#pview')) return false; const cs = getComputedStyle(e); if (cs.position !== 'fixed' && cs.position !== 'absolute') return false; const q = e.getBoundingClientRect(); return q.bottom > bar - 120 && q.top < bar && q.width > 200 && /rvban|znban|evcard|recap|shock|feed/.test(e.id); })) ban++; } }
      const chips = [...document.querySelectorAll('#hud .stats .chip')].filter(vis).length;
      return { modal, ban, chips, jr: (S.jr || []).length, cats: [...new Set((S.jr || []).map(e => e.c))].sort().join(','), ev: S.event || null, dec: W.ui.decList().length };
    });
    t.check(`${w}×${h} : 220 jours avec événements, aucune fenêtre d'événement ni bannière en bas de l'écran`, r.modal === 0 && r.ban === 0, JSON.stringify(r));
    t.check(`${w}×${h} : HUD sobre (trésorerie et date seulement)`, r.chips === 2, `${r.chips} indicateurs visibles`);
    t.check(`${w}×${h} : le journal reçoit les dépêches, classées`, r.jr >= 10 && /eco/.test(r.cats), `${r.jr} entrées · ${r.cats}`);
    await pg.screenshot({ path: '/tmp/t98_jeu_' + w + '.png' }).catch(() => {});
    await ctx.close();
  }

  const pg = await L.newPage({ w: 1280, h: 800, wait: 1500 }); await L.setup(pg, { cash: 4e7 }); await L.inject(pg); await pg.addStyleTag({ content: HIDE });
  const ev = (f, a) => pg.evaluate(f, a);
  await ev(() => { const W = window.WSE, T = window.T; window._shop = T.inC('s1'); window._shop2 = T.inC('s1'); T.inC('res'); for (let i = 0; i < 40; i++) W.step(); });

  // ---------- 2. Journal : panneau, filtres, le jeu continue, sauvegarde des 200 dernières entrées ----------
  const j = await ev(async () => {
    const W = window.WSE, S = W.S; W.setSpeed(1); for (let i = 0; i < 260; i++) W.say('Essai du journal n° ' + i, 'info'); W.say('Mission accomplie : essai', 'gold'); W.say('Rachat de test par un rival', 'warn');
    const dot = !document.getElementById('jrBadge').hidden; document.getElementById('jrBtn').click(); await new Promise(r => setTimeout(r, 250));
    const p = document.getElementById('jrp'), n0 = p.querySelectorAll('.jrl li').length, sp = S.speed !== undefined ? S.speed : null;
    p.querySelector('[data-jrf="mis"]').click(); await new Promise(r => setTimeout(r, 100)); const nm = p.querySelectorAll('.jrl li').length, allMis = [...p.querySelectorAll('.jrl .jc')].every(x => /Missions/.test(x.textContent));
    p.querySelector('[data-jrf="all"]').click(); const dot2 = !document.getElementById('jrBadge').hidden;
    W.save(); const raw = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /wse|save/i.test(k) && /"jr"/.test(localStorage.getItem(k))) || '') || '{}');
    return { dot, dot2, n0, nm, allMis, saved: (raw.jr || []).length, last: (raw.jr || []).slice(-1)[0], paused: document.getElementById('spd0').getAttribute('aria-pressed') };
  });
  t.check('journal : point « non lu », s\'éteint à l\'ouverture', j.dot && !j.dot2, JSON.stringify([j.dot, j.dot2]));
  t.check('journal : liste datée (200 entrées au plus) et filtre Missions', j.n0 >= 150 && j.n0 <= 200 && j.nm >= 1 && j.allMis, `${j.n0} lignes, ${j.nm} missions`);
  t.check('journal : le jeu continue pendant la lecture (pas de pause)', j.paused === 'false', j.paused);
  t.check('journal : sauvegardé (champ facultatif jr, 200 dernières entrées)', j.saved > 0 && j.saved <= 200 && j.last && /Rachat de test/.test(j.last.t), `${j.saved} entrées`);
  const jl = await ev(() => { const W = window.WSE; W.setSpeed(0); return { back: W.ui.jrSan([{ d: 3, t: 'x', k: 'info' }, { bad: 1 }]).length }; });
  t.check('journal : nettoyage à la lecture d\'une sauvegarde (entrées invalides ignorées)', jl.back === 1, JSON.stringify(jl));
  await ev(() => window.WSE.ui.xpOpen('jrp', false));

  // ---------- 3. Décisions en attente : offre de rachat d'un rival, événement à choix ----------
  const d = await ev(async () => {
    const W = window.WSE, S = W.S, r = S.rivals.find(x => !x.sub), c = window._shop; S.rv = S.rv || {};
    S.rv.offer = { kind: 'buy', rid: r.id, t: c.t, x: c.x, y: c.y, price: 104000, until: S.day + 20 };
    S.event = 'cargo'; if (!W.EVENTS.find(e => e.id === 'cargo')) S.event = W.EVENTS[0].id; W.ui.decSync(); await new Promise(r => setTimeout(r, 50));
    const ban = !document.getElementById('rvban').hidden && getComputedStyle(document.getElementById('rvban')).display !== 'none';
    const btn = document.getElementById('decBtn'), n = document.getElementById('decN').textContent, vis0 = !btn.hidden; btn.click(); await new Promise(r => setTimeout(r, 100));
    const txt = document.getElementById('decp').innerText, cash0 = S.cash;
    document.querySelector('#decp [data-dec="rv|0"]').click(); await new Promise(r => setTimeout(r, 100));
    const sold = S.cash - cash0, left = W.ui.decList().map(x => x.id);
    document.querySelector('#decp [data-dec^="ev|"]').click(); await new Promise(r => setTimeout(r, 100));
    return { ban, vis: vis0, n, mega: new RegExp(r.name + '[\\s\\S]*offre 104').test(txt), sold, left, ev: S.event, evcard: !document.getElementById('evcard').hidden, n2: W.ui.decList().length };
  });
  t.check('décisions : offre de rachat d\'un rival dans la boîte (icône avec compteur), aucune bannière', !d.ban && d.vis && +d.n >= 2 && d.mega, JSON.stringify(d).slice(0, 200));
  t.check('décisions : « Accepter » vend le bâtiment (même fonction que l\'ancien bandeau)', d.sold === 104000 && d.left.indexOf('rv') < 0, `${d.sold} $`);
  t.check('décisions : un événement à choix se règle depuis la boîte, sans fenêtre', d.ev === null && !d.evcard, JSON.stringify([d.ev, d.evcard]));
  const lst = await ev(() => { const W = window.WSE, S = W.S, r = S.rivals.find(x => !x.sub); S.rv.lxOf = { kind: 'loan', rid: r.id, amt: 1e6, rate: 0.08, until: S.day + 20 }; S.rv.trOf = { rid: r.id, g: 'oil', fee: 5000, until: S.day + 20 }; S.evR = { id: 'rival', d: S.day, until: S.day + 30, loss: 1000 }; S.chip = S.chip || {}; S.chip.of = { name: r.name, who: r.id, n: 3, fee: 1e6, rate: 0.05, exp: S.day + 30 }; return W.ui.decList().map(x => x.id); });
  t.check('décisions : prêt / levée d\'un rival, cartel, offensive, licence de gravure listés', ['lx', 'tr', 'evr', 'chip'].every(k => lst.indexOf(k) >= 0), lst.join(','));
  await ev(() => { const S = window.WSE.S; S.rv.lxOf = null; S.rv.trOf = null; S.evR = null; S.chip.of = null; window.WSE.ui.xpOpen('decp', false); });

  // ---------- 4. Menu > Ville / Économie ----------
  const eco = await ev(() => { document.getElementById('pn').click(); document.querySelector('#panel [data-ptab="city"]').click(); const t = document.getElementById('ecoBox').innerText; document.getElementById('pclose').click(); return t; });
  t.check('Menu > Ville / Économie : population, postes pourvus, humeur, capitalisation, impôt lisibles', ['POPULATION', 'POSTES POURVUS', 'HUMEUR', 'CAPITALISATION', 'IMPÔT'].every(k => eco.toUpperCase().indexOf(k) >= 0) && /\d/.test(eco) && !L.BAD_TXT.test(eco), eco.replace(/\n/g, ' ').slice(0, 160));

  // ---------- 5. Clic sur un bâtiment : sélection légère, pas de fiche économique ----------
  const cl = await ev(async () => {
    const W = window.WSE, S = W.S, c = window._shop; W.setTool('view'); W.centerOn(c.x, c.y); await new Promise(r => setTimeout(r, 500));
    const p = W.tileToScreen(c.x, c.y), cv = document.getElementById('view'), fire = (x, y) => { cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, pointerId: 1, bubbles: true })); cv.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, pointerId: 1, bubbles: true })); };
    const at = W.ui.pick(p.x, p.y - 6); fire(p.x, p.y - 6); await new Promise(r => setTimeout(r, 150));
    const tag = document.getElementById('selTag'), o = { tag: !tag.hidden, txt: tag.innerText, bview: !document.getElementById('bview').hidden, fiche: !document.getElementById('pfiche').hidden, at, c: [c.x, c.y] };
    const big = /Valeur marchande|Cash-flow|Rendement|Si tu rases|Loyers/.test(tag.innerText);
    tag.querySelector('[data-st="open"]').click(); await new Promise(r => setTimeout(r, 200)); o.opened = !document.getElementById('bview').hidden; o.big = big; W.closeBuilding();
    let npc = null; for (let i = 0; i < W.N * W.N && !npc; i++) { const q = S.grid[i]; if (q && q.t === 'npc' && q.k === 'res' && Math.abs(q.x - c.x) + Math.abs(q.y - c.y) < 12) npc = q; }
    W.inspect(npc.x, npc.y); o.npcFiche = !document.getElementById('pfiche').hidden; o.npcTag = tag.innerText;
    return o;
  });
  t.check('clic sur un commerce : petite étiquette (nom, « Ouvrir »), aucune fenêtre ni fiche économique', cl.tag && /Petit marché/.test(cl.txt) && /Ouvrir/.test(cl.txt) && !cl.bview && !cl.fiche && !cl.big, JSON.stringify(cl).slice(0, 220));
  t.check('« Ouvrir » sur l\'étiquette ouvre la fenêtre du bâtiment', cl.opened, '');
  t.check('clic sur un immeuble de la ville : étiquette seule (plus de valeur marchande, loyers, « si tu rases… »)', !cl.npcFiche && /Ouvrir/.test(cl.npcTag) && !/Valeur marchande|Si tu rases/.test(cl.npcTag), cl.npcTag.replace(/\n/g, ' | '));

  // ---------- 6. Identité : titre et icône = bâtiment dessiné sous le pointeur ----------
  const id = await ev(async () => {
    const W = window.WSE, S = W.S, L0 = W.vv.list(), out = { bad: [], n: 0, front: null };
    for (const q of L0.slice(0, 30)) { const c = S.grid[q[1] * W.N + q[0]]; if (!c) continue; W.centerOn(q[0], q[1]); await new Promise(r => setTimeout(r, 120)); const nm = W.vv.SVC[q[2]][0], I = W.ui.selInfo(c);
      if (c._spr === q[2] && I.n !== nm) out.bad.push(q[2] + '→' + I.n); if (c._spr && c._spr !== q[2] && I.n === nm) out.bad.push('nom ' + nm + ' sur sprite ' + c._spr); out.n++; }
    // sprite de service non dessiné (chantier, sprite absent) : le titre ne dit pas « boulangerie »
    const q = L0.find(x => x[2] === 'boulangerie') || L0[0], c = S.grid[q[1] * W.N + q[0]], keep = c._spr; c._spr = 'immeuble_pnj_a'; out.notSvc = W.ui.selInfo(c).n; c._spr = keep;
    return out;
  });
  t.check('identité : le titre de l\'étiquette suit le sprite réellement dessiné (services de quartier)', id.bad.length === 0 && id.n >= 5, `${id.n} services vérifiés ${id.bad.slice(0, 3).join(' ; ')}`);
  t.check('identité : un immeuble dessiné comme immeuble ne s\'appelle pas « Boulangerie »', !/Boulangerie|Restaurant|Café|Boutique/.test(id.notSvc), id.notSvc);
  const pk = await ev(async () => {   // silhouette : un point sur le haut d'un bâtiment haut sélectionne ce bâtiment, même si la case au sol sous le pointeur est un autre bâtiment
    const W = window.WSE, S = W.S, N = W.N; let best = null;
    for (let i = 0; i < N * N && !best; i++) { const c = S.grid[i]; if (!c || c.t !== 'npc' || c.k === 'mon' || (c.floors || 0) < 6) continue; const bx = c.x - 1, by = c.y - 1, b = S.grid[by * N + bx]; if (b && b.t === 'npc' && b.k !== 'mon' && b.x === bx && b.y === by) best = [c, b]; }
    if (!best) return null; const [c, b] = best; W.centerOn(c.x, c.y); await new Promise(r => setTimeout(r, 400));
    const p = W.tileToScreen(b.x, b.y), g = W.ui.pick(p.x, p.y), cv = document.getElementById('view').getBoundingClientRect();
    return { front: [c.x, c.y], back: [b.x, b.y], got: g ? [g.x, g.y] : null, frontTop: Number.isFinite(c._top) };
  });
  t.check('identité : un clic sur la silhouette d\'un immeuble de devant ne sélectionne pas le bâtiment caché derrière', !pk || (pk.got && !(pk.got[0] === pk.back[0] && pk.got[1] === pk.back[1])) || !pk.frontTop, JSON.stringify(pk));

  // ---------- 7. Fermeture uniforme ----------
  const fz = await ev(async () => {
    const W = window.WSE, out = [], c = window._shop2, wait = ms => new Promise(r => setTimeout(r, ms));
    const OPEN = { panel: () => document.getElementById('pn').click(), pview: () => document.getElementById('pv').click(), bview: () => W.openBuilding(c.x, c.y), gview: () => W.openGuide(), tview: () => W.openTerm(), svview: () => W.openChain(), mallp: () => W.mall.open(), jrp: () => document.getElementById('jrBtn').click(), helpp: () => document.getElementById('helpBtn').click() };
    for (const k of Object.keys(OPEN)) {
      W.ui.open().forEach(q => q.o.close()); OPEN[k](); await wait(800); const E = document.getElementById(k); if (!E || E.hidden) { out.push(k + ':non ouvert'); continue; }
      [E, ...E.querySelectorAll('*')].forEach(x => { if (x.scrollHeight > x.clientHeight + 4) x.scrollTop = 1e6; }); await wait(120);
      const R = E.getBoundingClientRect(), x = [...E.querySelectorAll('.xbig,.xinj,.xclose')].find(q => q.offsetParent); if (!x) { out.push(k + ':pas de ×'); continue; }
      const q = x.getBoundingClientRect(), hit = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
      if (!(q.width >= 44 && q.height >= 44 && q.top - R.top < 70 && R.right - q.right < 60 && hit && (hit === x || x.contains(hit)))) out.push(k + ':× ' + JSON.stringify([q.width, q.height, Math.round(q.top - R.top), Math.round(R.right - q.right), !!hit && hit.className]));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await wait(150);
      if (!E.hidden && getComputedStyle(E).display !== 'none') out.push(k + ':Échap');
      OPEN[k](); await wait(500); document.getElementById('view').dispatchEvent(new PointerEvent('pointerdown', { clientX: 150, clientY: 480, pointerId: 2, bubbles: true })); await wait(100);
      if (!E.hidden && getComputedStyle(E).display !== 'none') out.push(k + ':clic dehors');
    }
    return out;
  });
  t.check('fermeture : grosse croix × visible (≥ 44 px, en haut à droite, collante), Échap et clic sur la carte ferment (9 panneaux)', fz.length === 0, fz.join(' | '));

  // ---------- 8. Calques ----------
  const ly = await ev(async () => {
    const W = window.WSE; document.getElementById('lyr').click(); await new Promise(r => setTimeout(r, 100)); const items = [...document.querySelectorAll('#lyrmenu [data-lyr]')].map(b => b.textContent);
    const o = { items, f: {} }; for (const k of ['pop', 'rich', 'dem', 'comp', 'jobs']) { const f = W.lyr.field(k); let n = 0, bad = 0; for (const v of f) { if (v > 0.05) n++; if (!(v >= 0 && v <= 1)) bad++; } o.f[k] = [n, bad]; }
    document.querySelector('#lyrmenu [data-lyr="rich"]').click(); await new Promise(r => setTimeout(r, 250)); o.leg = document.getElementById('lyrleg').innerText; o.lay = W.land.layer(); o.menu = !document.getElementById('lyrmenu').hidden; W.land.setLayer('auto'); return o;
  });
  t.check('calques : sélecteur avec population, pouvoir d\'achat, demande par classe, concurrence, foncier, fréquentation, emploi', ['population', 'achat', 'Demande', 'Concurrence', 'foncier', 'Fréquentation', 'Emploi'].every(k => ly.items.some(i => i.indexOf(k) >= 0)), ly.items.join(' · '));
  t.check('calques : champs calculés sur la ville (valeurs 0-1) et légende minimale', Object.values(ly.f).every(v => v[0] > 20 && v[1] === 0) && ly.lay === 'rich' && /Pouvoir d'achat/.test(ly.leg) && !ly.menu, JSON.stringify(ly.f) + ' ' + ly.leg.replace(/\n/g, ' '));

  // ---------- 9. Aide « ? » ----------
  const hp = await ev(async () => { document.getElementById('helpBtn').click(); await new Promise(r => setTimeout(r, 150)); const p = document.getElementById('helpp'), r = p.getBoundingClientRect(), o = { vis: !p.hidden, txt: p.innerText, h: r.height, w: r.width, objHidden: document.body.classList.contains('noobj') }; window.WSE.ui.xpOpen('helpp', false); return o; });
  t.check('aide : « ? » ouvre un petit panneau (conseil), le bandeau d\'objectifs reste masqué par défaut', hp.vis && /Conseil/i.test(hp.txt) && hp.w <= 420 && hp.objHidden, JSON.stringify({ w: hp.w, h: hp.h, obj: hp.objHidden }));
  const errs = pg.errs.filter(e => !/setPointerCapture/.test(e));   // pointeurs synthétiques du test (sans pointeur actif)
  t.check('aucune erreur JS', errs.length === 0, errs.slice(0, 3).join(' ; '));
  await pg.context().close();
};
