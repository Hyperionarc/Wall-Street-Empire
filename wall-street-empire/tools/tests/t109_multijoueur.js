// Multijoueur phase 1 (« course parallèle ») : serveur de salle local sur un port libre + deux pages Playwright (bureau 1280×800, téléphone 390×844).
// Salle à code court, jointure par code, castes distinctes (caste prise refusée), départ synchronisé, même graine → même carte et mêmes IA,
// relais du classement entre les pages, reconnexion (coupure réseau puis rechargement de la page), fin de manche commune et écran de résultats ;
// contrôles du serveur en direct (nom nettoyé, message trop gros, salle inconnue, fin au temps) ; le solo (file://) n'ouvre aucune connexion.
exports.name = 'Multijoueur : salle, course parallèle (passe 109)';
const path = require('path'), fs = require('fs'), net = require('net'), { spawn, execSync } = require('child_process');
const OUT = process.env.WSE_SHOTS || '/tmp';
const SRV = path.resolve(__dirname, '..', '..', 'server');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
async function until(fn, ms = 15000, step = 200) { const t0 = Date.now(); for (;;) { let v; try { v = await fn(); } catch (e) { v = null; } if (v) return v; if (Date.now() - t0 > ms) return null; await sleep(step); } }

exports.run = async (t, L) => {
  if (!fs.existsSync(path.join(SRV, 'node_modules', 'ws'))) execSync('npm install --no-audit --no-fund', { cwd: SRV, stdio: 'ignore' });
  const port = await freePort(), base = `http://127.0.0.1:${port}/`;
  const proc = spawn(process.execPath, [path.join(SRV, 'server.js')], { env: Object.assign({}, process.env, { PORT: String(port), HOST: '127.0.0.1', MP_MIN_DUR_MIN: '0.05' }), stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; proc.stdout.on('data', d => { log += d; }); proc.stderr.on('data', d => { log += d; });
  try {
    const up = await until(async () => (await fetch(base + 'healthz')).ok, 8000);
    t.check('serveur de salle démarré (node server/server.js, PORT libre)', !!up, log.slice(0, 200));
    const html = await fetch(base, { headers: { 'accept-encoding': 'gzip' } });
    t.check('le serveur sert aussi city.html (statique, gzip)', html.ok && /text\/html/.test(html.headers.get('content-type') || ''), html.status + ' ' + html.headers.get('content-type'));

    // ---------- 1. contrôles du serveur en direct (client WebSocket brut) ----------
    const WS = require(path.join(SRV, 'node_modules', 'ws'));
    const cli = () => new Promise(res => { const w = new WS(`ws://127.0.0.1:${port}/ws`); w.msgs = []; w.on('message', d => w.msgs.push(JSON.parse(d))); w.on('open', () => res(w)); w.on('error', () => res(null)); });
    const wait = (w, f, ms = 5000) => until(() => w.msgs.find(f), ms, 50);
    const a = await cli(), b = await cli();
    a.send(JSON.stringify({ t: 'create', name: '  <b>Zoé</b>\u0007 la très très longue ' }));
    const ja = await wait(a, m => m.t === 'joined'), ra = await wait(a, m => m.t === 'room');
    t.check('création de salle : code court (4-5 caractères), nom nettoyé (balises, contrôles, 20 car. max)', ja && /^[A-Z0-9]{4,5}$/.test(ja.code) && ra && ra.room.players[0].name.length <= 20 && !/[<>\u0007]/.test(ra.room.players[0].name), JSON.stringify(ja && { code: ja.code, n: ra && ra.room.players[0].name }));
    b.send(JSON.stringify({ t: 'join', code: 'ZZZZ9', name: 'x' })); const e1 = await wait(b, m => m.t === 'err');
    t.check('salle inconnue refusée', e1 && e1.code === 'noroom', JSON.stringify(e1));
    b.send(JSON.stringify({ t: 'join', code: ja.code.toLowerCase(), name: 'Yann' })); await wait(b, m => m.t === 'joined');
    a.send(JSON.stringify({ t: 'caste', caste: 'promoteur' })); await sleep(150); b.send(JSON.stringify({ t: 'caste', caste: 'promoteur' }));
    const e2 = await wait(b, m => m.t === 'err' && m.code === 'caste_taken');
    t.check('serveur : une caste déjà prise est refusée', !!e2, JSON.stringify(e2));
    b.send(JSON.stringify({ t: 'create', name: 'z' })); const e3 = await wait(b, m => m.t === 'err' && m.code === 'role');
    t.check('serveur : un seul rôle par connexion (pas de deuxième salle sur la même socket)', !!e3);
    b.send(JSON.stringify({ t: 'caste', caste: 'agriculteur' })); a.send(JSON.stringify({ t: 'settings', set: { dur: 0.05, total: 4, lv: 9 } })); await sleep(200);
    b.send(JSON.stringify({ t: 'settings', set: { lv: 1 } })); const e4 = await wait(b, m => m.t === 'err' && m.code === 'host');
    t.check('serveur : seul l\'hôte règle la partie', !!e4);
    a.send(JSON.stringify({ t: 'ready', on: true })); b.send(JSON.stringify({ t: 'ready', on: true })); await sleep(200); a.send(JSON.stringify({ t: 'start' }));
    const sa = await wait(a, m => m.t === 'start'), sb = await wait(b, m => m.t === 'start');
    t.check('départ synchronisé : même graine et mêmes places pour les deux, 4 places (2 humains + 2 IA), castes uniques, niveau borné à 8', sa && sb && sa.seed === sb.seed && JSON.stringify(sa.seats) === JSON.stringify(sb.seats) && sa.seats.length === 4 && sa.seats.filter(s => s.ctrl === 'ai').length === 2 && new Set(sa.seats.map(s => s.caste)).size === 4 && sa.set.lv === 8, JSON.stringify(sa && { seed: sa.seed, seats: sa.seats.map(s => s.caste + ':' + s.ctrl), lv: sa.set.lv }));
    await sleep(3200); for (let i = 0; i < 3; i++) { a.send(JSON.stringify({ t: 'state', w: 5e6 + i, cash: 1, pop: 1, day: i, st: 'play', ai: { [sa.seats.find(s => s.ctrl === 'ai').caste]: 7e6 } })); b.send(JSON.stringify({ t: 'state', w: 3e6, cash: 1, pop: 1, day: i, st: 'play', ai: { [sa.seats.find(s => s.ctrl === 'ai').caste]: 9e6 } })); await sleep(800); }
    const bd = await wait(b, m => m.t === 'board' && m.rows.some(r => r.kind === 'human' && r.w >= 5e6));
    const aiRow = bd && bd.rows.find(r => r.kind === 'ai' && r.caste === sa.seats.find(s => s.ctrl === 'ai').caste);
    t.check('classement relayé : rang commun humains + IA (valeur d\'une IA = moyenne de ce que voient les joueurs)', bd && bd.rows.length === 4 && bd.rows[0].rank === 1 && aiRow && Math.abs(aiRow.w - 8e6) < 1, JSON.stringify(bd && bd.rows.map(r => [r.rank, r.kind, r.caste, r.w])));
    const big = 'x'.repeat(6000); let closed = false; b.on('close', () => { closed = true; }); b.send(JSON.stringify({ t: 'state', pad: big })); await until(() => closed, 3000, 50);
    t.check('serveur : message trop gros (> 4 Ko) → connexion fermée', closed);
    const ea = await wait(a, m => m.t === 'end', 8000);
    t.check('fin de manche au temps (durée réglée par l\'hôte) : message de fin commun avec le classement final', ea && ea.why === 'time' && ea.rows.length === 4, JSON.stringify(ea && { why: ea.why, n: ea.rows.length }));
    a.close();

    // ---------- 2. deux pages : bureau (hôte) et téléphone ----------
    const br = await L.browser();
    const mk = async (w, h) => { const ctx = await br.newContext({ viewport: { width: w, height: h } }); const pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/WebSocket|ERR_CONNECTION|net::/.test(m.text())) pg.errs.push(m.text()); }); pg.on('dialog', d => d.dismiss()); await pg.goto(base); await pg.waitForFunction(() => window.MP && window.WSE && window.WSE.S, null, { timeout: 60000 }); await pg.waitForTimeout(800); return pg; };
    const A = await mk(1280, 800), B = await mk(390, 844);
    const st = pg => pg.evaluate(() => window.MP.state());
    await A.evaluate(() => window.MP.open()); await A.fill('#mpName', 'Alice'); await A.click('[data-mp="create"]');
    const code = (await until(async () => { const s = await st(A); return s.room && s.room.code; })) || '';
    t.check('page A : salle créée depuis l\'écran « Jouer à plusieurs », code affiché', /^[A-Z0-9]{4,5}$/.test(code) && (await A.textContent('#mpRoomCode')) === code, code);
    await B.goto(base + '?salle=' + code); await B.waitForFunction(() => window.MP && window.WSE && window.WSE.S, null, { timeout: 60000 });
    const pre = await until(() => B.evaluate(() => { const i = document.getElementById('mpCode'); return i && !document.getElementById('mpscr').hidden ? i.value : null; }), 8000);
    t.check('lien ?salle=CODE : l\'écran s\'ouvre avec le code prérempli', pre === code, pre);
    await B.fill('#mpName', 'Bob'); await B.click('[data-mp="join"]');
    const two = await until(async () => { const s = await st(A); return s.room && s.room.players.length === 2 ? s.room : null; });
    t.check('page B rejoint avec le code : les deux pages voient 2 joueurs', !!two && (await until(async () => { const s = await st(B); return s.room && s.room.players.length === 2; })), JSON.stringify(two && two.players.map(p => p.name)));
    await A.click('[data-mpc="industriel"]'); await until(async () => { const s = await st(B); return s.room.players.some(p => p.caste === 'industriel'); });
    const dis = await B.evaluate(() => document.querySelector('[data-mpc="industriel"]').disabled);
    await B.evaluate(() => { const b = document.querySelector('[data-mpc="industriel"]'); b.disabled = false; b.click(); });   // forcer le clic : le serveur doit refuser
    const ref = await until(async () => { const s = await st(B); return s.err && /déjà prise/.test(s.err) ? s.err : null; }, 4000);
    const bc = (await st(B)).room.players.find(p => p.name === 'Bob').caste;
    t.check('caste déjà prise : bouton grisé et refus du serveur (message), Bob reste sans caste', dis && !!ref && !bc, JSON.stringify({ dis, ref, bc }));
    await B.click('[data-mpc="banquier"]'); await until(async () => { const s = await st(A); return s.room.players.some(p => p.caste === 'banquier'); });
    await A.selectOption('#mpLv', '5'); await until(async () => (await st(B)).room.set.lv === 5);
    await A.selectOption('#mpTot', '6'); await until(async () => (await st(B)).room.set.total === 6);
    await A.click('[data-mp="ready"]'); await B.click('[data-mp="ready"]');
    await until(async () => { const s = await st(A); return s.room.players.every(p => p.ready); });
    await A.waitForTimeout(300);
    await B.evaluate(() => { document.getElementById('mpscr').scrollTop = 0; });
    await A.screenshot({ path: path.join(OUT, 't109_salle_1280.png') }); await B.screenshot({ path: path.join(OUT, 't109_salle_390.png') });
    const canStart = await A.evaluate(() => !document.querySelector('[data-mp="start"]').disabled);
    t.check('hôte : « Lancer la partie » actif quand tous ont une caste et sont prêts', canStart);
    await A.click('[data-mp="start"]');
    const cd = await until(() => B.evaluate(() => { const c = document.querySelector('.mpcd'); return c ? c.textContent : null; }), 3000, 100);
    const started = await until(async () => { const r = await Promise.all([A, B].map(p => p.evaluate(() => { const S = window.WSE.S; return S.mode && S.mode.mp && S.mode.k === 'round' && S.caste ? 1 : 0; }))); return r[0] && r[1]; }, 20000);
    t.check('départ synchronisé (compte à rebours puis Round sur les deux pages)', !!started && !!cd, cd);
    // même graine → même carte, mêmes IA ; castes distinctes ; places : 6 (2 humains + 4 IA au niveau 5)
    const fp = pg => pg.evaluate(() => { const S = window.WSE.S, f = window.MP.state().fp0 || {}; return Object.assign({}, f, { nRiv: S.rivals.length, caste: S.caste, castes: S.rivals.map(r => r.caste).concat([S.caste]).sort().join(','), cash: S.mode.w0 }); });
    const fa = await fp(A), fb = await fp(B);
    t.check('même graine → même carte (routes, ville, gisements), même population et même générateur aléatoire au départ', fa.map === fb.map && fa.pop === fb.pop && fa.seed === fb.seed && fa.seed > 0 && fa.rs === fb.rs, JSON.stringify({ a: [fa.map, fa.pop, fa.seed], b: [fb.map, fb.pop, fb.seed] }));
    t.check('mêmes rivaux IA sur les castes non prises (identité, qualité, trésorerie, implantation), niveau 5 de la salle', fa.rv.length === 4 && JSON.stringify(fa.rv) === JSON.stringify(fb.rv) && fa.lv === 5 && fb.lv === 5, JSON.stringify({ a: fa.rv.map(x => x.split('|').slice(0, 4).join(':')), lvA: fa.lv }));
    t.check('caste libre pour chacun : A industriel, B banquier, 6 castes distinctes dans chaque ville (5 rivaux), départ à 10 M$', fa.caste === 'industriel' && fb.caste === 'banquier' && fa.nRiv === 5 && fb.nRiv === 5 && fa.castes === fb.castes && fa.castes.split(',').length === 6 && fa.cash === 10e6, JSON.stringify({ a: fa.castes, b: fb.caste, cash: fa.cash }));
    // relais du classement : A voit la valeur de Bob telle que la page B la calcule
    await A.waitForTimeout(2500); await Promise.all([A, B].map(p => p.evaluate(() => window.WSE.setSpeed(0)))); await A.waitForTimeout(2600);
    const vb = await B.evaluate(() => Math.round(window.WSE.valuation())), rowB = await until(async () => { const s = await st(A); const r = s.board && s.board.rows.find(x => x.name === 'Bob'); return r && Math.abs(r.w - vb) <= 1 ? r : null; }, 6000);
    const brd = (await st(A)).board;
    t.check('relais du classement : la page A affiche la valeur de Bob calculée par la page B (≈ 1 relevé/s), 6 lignes (2 humains + 4 IA)', !!rowB && brd.rows.length === 6 && brd.rows.filter(r => r.kind === 'ai').length === 4, JSON.stringify({ vb, row: rowB && rowB.w, n: brd && brd.rows.length }));
    const hudOf = pg => pg.evaluate(() => { const h = document.getElementById('mpHud'), r = h && h.getBoundingClientRect(); return h && !h.hidden && getComputedStyle(h).display !== 'none' && r.right <= innerWidth + 1 ? h.innerText.replace(/\s+/g, ' ') : null; });
    const hudA = await hudOf(A), hudB = await hudOf(B);
    t.check('HUD : puce discrète « Rang x/6 » pendant la partie, visible et dans l\'écran à 1280 et 390 px', /Rang [1-6]\/6/.test(hudA || '') && /Rang [1-6]\/6/.test(hudB || ''), hudA + ' | ' + hudB);
    await B.screenshot({ path: path.join(OUT, 't109_hud_390.png') });
    for (const [pg, w] of [[A, 1280], [B, 390]]) {
      await pg.evaluate(() => window.WSE.vn.go('corp', 'corps')); await pg.waitForTimeout(900);
      const txt = await pg.evaluate(() => { const b = document.getElementById('mpLive'); return b && b.offsetParent ? b.innerText : ''; });
      t.check(`${w} px : Menu > Sociétés > Classement montre le classement commun en direct (Alice, Bob, IA)`, /en direct/.test(txt) && /Alice/.test(txt) && /Bob/.test(txt) && /IA/.test(txt), txt.slice(0, 120).replace(/\n/g, ' '));
      await pg.screenshot({ path: path.join(OUT, `t109_classement_${w}.png`) });
    }
    // reconnexion 1 : coupure réseau simulée → hors ligne chez A, puis retour automatique
    await B.evaluate(() => window.MP.drop());
    const off = await until(async () => { const s = await st(A); const r = s.board && s.board.rows.find(x => x.name === 'Bob'); return r && r.st === 'off'; }, 5000, 100);
    const back = await until(async () => { const s = await st(A); const r = s.board && s.board.rows.find(x => x.name === 'Bob'); return r && r.on && r.st !== 'off'; }, 12000);
    t.check('déconnexion détectée (Bob « hors ligne » chez A) puis reconnexion automatique', !!off && !!back);
    // reconnexion 2 : rechargement de la page B → la sauvegarde locale reprend, la salle est rejointe avec le jeton
    const before = await B.evaluate(() => ({ day: window.WSE.S.day, caste: window.WSE.S.caste }));
    await B.evaluate(() => window.WSE.save()); await B.reload(); await B.waitForFunction(() => window.MP && window.WSE && window.WSE.S, null, { timeout: 60000 });
    const rej = await until(async () => { const s = await st(B); return s.conn === 'on' && s.room && s.room.phase === 'play' ? s : null; }, 15000);
    const after = await B.evaluate(() => ({ day: window.WSE.S.day, caste: window.WSE.S.caste, code: window.WSE.S.mode.mp && window.WSE.S.mode.mp.code, k: window.WSE.S.mode.k }));
    t.check('rechargement : partie locale sauvegardée reprise (même caste, même jour au moins) et salle rejointe automatiquement', !!rej && after.code === code && after.caste === before.caste && after.day >= before.day && after.k === 'round', JSON.stringify({ before, after }));
    // fin de manche : A atteint l'objectif → fin commune, écran de résultats sur les deux pages
    await A.evaluate(() => { const S = window.WSE.S; S.stats.raw = 2e9; });
    const ends = await until(async () => { const r = await Promise.all([A, B].map(p => p.evaluate(() => { const S = window.WSE.S, e = document.getElementById('endscr'); return S.mode.done && !e.hidden && /Résultats de la salle/.test(e.textContent) ? { d: S.mode.done, t: e.textContent } : null; }))); return r[0] && r[1] ? r : null; }, 12000);
    t.check('fin de manche commune : A gagne (objectif atteint), B perd, résultats de la salle sur les deux écrans de fin', !!ends && ends[0].d === 'win' && ends[1].d === 'lose' && /Résultats de la salle/.test(ends[0].t) && /Résultats de la salle/.test(ends[1].t) && /Alice/.test(ends[1].t), JSON.stringify(ends && ends.map(e => [e.d, (e.t.match(/Résultats de la salle[^\n]*/) || [''])[0]])));
    await B.screenshot({ path: path.join(OUT, 't109_fin_390.png') });
    t.check('aucune erreur JS sur les deux pages', !A.errs.length && !B.errs.length, A.errs.concat(B.errs).slice(0, 3).join(' | '));
    await A.context().close(); await B.context().close();

    // ---------- 3. solo inchangé : page file:// sans serveur, aucune connexion ouverte ----------
    const P = await L.newPage({ wait: 1500 });
    const ws0 = await P.evaluate(() => { const S = window.MP.state(); return { conn: S.conn, url: window.MP.wsUrl(), btn: document.querySelectorAll('[data-mpopen]').length }; });
    await P.evaluate(() => window.MP.open()); const srvBox = await P.evaluate(() => { const d = document.querySelector('#mpscr details'); return d && d.open; });
    t.check('solo (file://) : aucune connexion réseau, bouton « Jouer à plusieurs » présent, adresse du serveur demandée à l\'ouverture', ws0.conn === 'off' && ws0.url === '' && ws0.btn >= 1 && srvBox && !P.errs.length, JSON.stringify(ws0) + ' ' + P.errs.slice(0, 2).join(';'));
    await P.context().close();
  } finally { proc.kill(); }
};
