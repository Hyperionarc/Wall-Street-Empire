/* ---------- Multijoueur, phase 1 : « course parallèle » (module inséré par tools/build.py à la place du marqueur MP_JS, dans la portée du jeu) ----------
   Chaque humain joue SA ville dans son navigateur, à partir de la même graine et des mêmes réglages (ville, IA des castes non prises, difficulté).
   Le serveur de salle (wall-street-empire/server/server.js) ne simule rien : il relaie toutes les secondes l'état résumé de chacun
   (valeur, trésorerie, population, jour, statut) et décide pour tous de la fin de manche (premier à l'objectif ou fin du temps).
   Le jeu solo n'en dépend jamais : aucune connexion n'est ouverte tant que le joueur n'ouvre pas « Jouer à plusieurs » ou qu'une partie à plusieurs n'est pas en cours.
   État de jeu ajouté : S.mode.mp { code, pid, tg, dur, seats } et S.mode.mpFinal (résultats communs) ; S.opt.seed, S.opt.nr, S.opt.rc (places de la salle). Session : localStorage 'wse-mp'. */
const MP = (() => {
  const SK = 'wse-mp', CK = ['industriel', 'promoteur', 'banquier', 'negociant', 'agriculteur', 'innovateur'];
  const st = { ws: null, conn: 'off', want: false, retry: 0, rt: null, q: [], code: '', pid: '', token: '', host: false, name: '', srv: '', room: null, board: null, boardAt: 0, err: '', cd: null, open: false, final: null, auto: false, failN: 0 };
  const E = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const qs = k => { try { return new URLSearchParams(location.search).get(k) || ''; } catch (e) { return ''; } };
  const sessGet = () => { try { return JSON.parse(localStorage.getItem(SK) || 'null'); } catch (e) { return null; } };
  const sessSet = o => { try { if (o) localStorage.setItem(SK, JSON.stringify(o)); else localStorage.removeItem(SK); } catch (e) { /* stockage indisponible */ } };
  const cN = k => (CASTES[k] ? CASTES[k].n : k || '—');
  const aiName = k => (RIV_CASTE[k] ? RIV_CASTE[k].name : 'IA');
  const rowName = r => r.kind === 'human' ? r.name : aiName(r.caste);
  const inGame = () => !!(S && S.mode && S.mode.mp && S.mode.mp.code);
  const live = () => inGame() && !S.mode.done;
  const minTxt = ms => { const m = Math.max(0, Math.round(ms / 60000)); return m >= 1 ? m + ' min' : Math.max(0, Math.round(ms / 1000)) + ' s'; };
  // Adresse du serveur : ?server=… (hébergement statique séparé), sinon le même hôte que la page (wss si https)
  function wsUrl() {
    let s = (st.srv || qs('server') || '').trim();
    if (s) { if (!/^(wss?|https?):\/\//i.test(s)) s = 'https://' + s; s = s.replace(/^http/i, 'ws').replace(/\/+$/, ''); if (!/\/ws$/.test(s)) s += '/ws'; return s; }
    if (/^https?:$/.test(location.protocol) && location.host) return (location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + location.host + '/ws';
    return '';
  }
  // ---------- connexion (reconnexion automatique, la partie locale continue pendant la coupure) ----------
  function connect() {
    if (st.ws && (st.ws.readyState === 0 || st.ws.readyState === 1)) return;
    const u = wsUrl(); if (!u) { st.err = 'Adresse du serveur inconnue : indique-la ci-dessous (ou ouvre le jeu depuis le serveur de salle).'; render(); return; }
    clearTimeout(st.rt); st.conn = 'connecting'; let ws;
    try { ws = new WebSocket(u); } catch (e) { st.conn = 'off'; st.err = 'Adresse du serveur invalide.'; render(); return; }
    st.ws = ws;
    ws.onopen = () => { if (st.ws !== ws) return; st.conn = 'on'; st.retry = 0; st.err = ''; if (st.code && st.token) raw({ t: 'join', code: st.code, token: st.token, name: st.name }); const q = st.q.splice(0); q.forEach(raw); render(); hud(); };
    ws.onmessage = ev => { if (st.ws !== ws) return; let m; try { m = JSON.parse(ev.data); } catch (e) { return; } try { onMsg(m); } catch (e) { /* message inattendu : ignoré */ } };
    ws.onclose = () => { if (st.ws !== ws) return; st.ws = null; st.conn = 'off'; render(); hud(); if (st.want) { const d = Math.min(15000, 1000 * Math.pow(2, st.retry++)); st.rt = setTimeout(connect, d); } };
    ws.onerror = () => { /* onclose suit */ };
  }
  const raw = o => { try { if (st.ws && st.ws.readyState === 1) { st.ws.send(JSON.stringify(o)); return true; } } catch (e) { /* */ } return false; };
  function send(o) { st.want = true; if (!raw(o)) { st.q.push(o); connect(); } }
  function drop() { if (st.ws) { try { st.ws.close(); } catch (e) { /* */ } } }   // tests : coupure réseau simulée (la reconnexion suit)
  function stop() { st.want = false; clearTimeout(st.rt); const w = st.ws; st.ws = null; st.conn = 'off'; if (w) { try { w.close(); } catch (e) { /* */ } } }
  // ---------- messages du serveur ----------
  function onMsg(m) {
    if (m.t === 'joined') { st.code = m.code; st.pid = m.pid; st.token = m.token; st.host = !!m.host; st.err = ''; st.failN = 0; sessSet({ code: st.code, pid: st.pid, token: st.token, name: st.name, srv: st.srv }); render(); return; }
    if (m.t === 'room') { st.room = m.room; st.host = m.room.host === st.pid; render(); hud(); return; }
    if (m.t === 'start') { onStart(m); return; }
    if (m.t === 'board') { st.board = m; st.boardAt = Date.now(); hud(); return; }
    if (m.t === 'end') { finish(m); return; }
    if (m.t === 'left') { st.code = ''; st.token = ''; st.room = null; sessSet(null); stop(); render(); hud(); return; }
    if (m.t === 'err') {
      st.err = m.msg || 'Erreur.';
      if (m.code === 'noroom' && st.token) {   // salle disparue (serveur redémarré) : la partie locale continue en solo, sans relance infinie
        if (++st.failN >= 2 || !inGame()) { st.code = ''; st.token = ''; st.room = null; sessSet(null); stop(); if (inGame()) say('Salle introuvable sur le serveur : ta partie continue en local, hors classement commun.', 'warn'); }
      }
      render(); return;
    }
  }
  function onStart(m) {
    const mine = inGame() && S.mode.mp.code === m.code;
    if (m.resume && mine) { st.board = st.board || null; hud(); return; }   // reconnexion : on reprend sa partie locale sauvegardée
    if (mine && !m.resume) return;
    let n = Math.ceil((m.in || 0) / 1000); st.cd = n; render();
    const tick = () => { if (n <= 0) { st.cd = null; begin(m); return; } st.cd = n; render(); n--; setTimeout(tick, 1000); };
    if (m.in > 0) setTimeout(tick, Math.max(0, (m.in || 0) - n * 1000)); else begin(m);
  }
  // Départ : nouvelle partie Round avec la graine et les réglages de la salle ; la caste du joueur est celle choisie dans la salle
  function begin(m) {
    const me = (m.seats || []).find(s => s.pid === st.pid); if (!me) return;
    const set = m.set || {}, rc = m.seats.map(s => s.caste), keep = [roundLv, roundEasy];
    roundLv = set.lv >= 1 && set.lv <= 8 ? set.lv : DIF_DEF; roundEasy = !!set.easy; show(false);
    try {
      startMode('round', { start: START_K.indexOf(set.start) >= 0 ? set.start : 'moyenne', mp: { seed: m.seed | 0, caste: me.caste, opt: { lv: roundLv, nr: rc.length - 1, rc, seed: m.seed | 0 },
        info: { code: m.code, pid: st.pid, tg: set.target || ROUND_TARGET, dur: set.dur, seats: m.seats.map(s => ({ caste: s.caste, ctrl: s.ctrl, name: s.name || '' })) } } });
    } finally { roundLv = keep[0]; roundEasy = keep[1]; }
    const k = S.caste; S.caste = ''; setCaste(k);   // effets d'arrivée de la caste (prime de départ, technologies) comme un choix normal
    st.fp0 = fp(); delete S.mode.await; setSpeed(1); syncSpeedUI(); updateHUD(); save();
    const nh = m.seats.filter(s => s.ctrl === 'human').length;
    say(`Partie à plusieurs : salle ${m.code}, ${m.seats.length} places (${nh} humains, ${m.seats.length - nh} IA). Premier à ${fmtV(set.target || ROUND_TARGET)} ou plus grande valeur au bout de ${minTxt(set.dur * 60000)}.`, 'gold');
    hud();
  }
  // Empreinte de départ (tests, diagnostic) : carte (cases, gisements), population, graine, rivaux IA des places sans humain
  function fp() {
    let h = 0; const mix = x => { x = String(x); for (let i = 0; i < x.length; i++) h = (Math.imul(h, 31) + x.charCodeAt(i)) | 0; };
    for (let i = 0; i < N * N; i++) { const c = S.grid[i], d = S.dep[i]; mix((c ? c.t + (c.k || '') + (c.floors || '') : '.') + (d ? d.k + d.r : '')); }
    const ai = S.mode.mp ? S.mode.mp.seats.filter(x => x.ctrl === 'ai').map(x => x.caste) : [];
    return { map: h, pop: Math.round(S.pop), seed: S.opt && S.opt.seed, rs: S.rs, lv: difLv(), rv: (S.rivals || []).filter(r => ai.indexOf(r.caste) >= 0).map(r => [r.id, r.caste, r.name, r.mq, Math.round(r.cash), JSON.stringify(r.att)].join('|')).sort() };
  }
  // Fin de manche commune (objectif atteint par un joueur ou une IA, ou temps écoulé)
  function finish(m) {
    const fin = { code: m.code, why: m.why, rows: m.rows || [], me: st.pid, win: m.winner || null }; st.final = fin;
    if (inGame() && S.mode.mp.code === m.code) {
      S.mode.mpFinal = fin; const w = fin.win, iWin = !!(w && w.pid && w.pid === st.pid), myR = fin.rows.find(r => r.pid === st.pid), n = fin.rows.length;
      const wn = w ? rowName(w) + (w.kind === 'ai' ? '' : '') : '?', rk = myR ? myR.rank : n;
      const msg = iWin ? (m.why === 'target' ? `Tu atteins ${fmtV(S.mode.mp.tg)} le premier : tu remportes la manche de la salle ${m.code} !` : `Temps écoulé : tu as la plus grande valeur de la salle ${m.code}.`)
        : (m.why === 'target' ? `${wn} atteint ${fmtV(S.mode.mp.tg)} et remporte la manche. Tu termines ${rk}e sur ${n}.` : `Temps écoulé : ${wn} gagne la manche. Tu termines ${rk}e sur ${n}.`);
      if (!S.mode.done) endGame(iWin ? 'win' : m.why === 'target' ? 'lose' : 'time', msg); else if (S.mode.res) { S.mode.res.mp = fin; showEnd(); save(); }
    }
    sessSet(null); st.want = false; setTimeout(stop, 500); render(); hud();
  }
  // ---------- état résumé envoyé chaque seconde ----------
  function stateMsg() {
    const ai = {}; (S.mode.mp.seats || []).forEach(s => { if (s.ctrl !== 'ai') return; const r = (S.rivals || []).find(x => x.caste === s.caste && !x.sub); if (r) ai[s.caste] = Math.round(rivalValue(r)); });
    return { t: 'state', w: Math.round(valuation()), cash: Math.round(S.cash), pop: Math.round(S.pop || 0), day: S.day | 0, st: S.mode.done ? (S.mode.done === 'win' ? 'done' : 'fail') : speed === 0 ? 'pause' : 'play', ai };
  }
  setInterval(() => {
    try {
      if (inGame() && st.code === S.mode.mp.code && !st.final) raw(stateMsg());
      const lock = live(); ['mCash', 'mCaste'].forEach(id => { const b = el(id); if (b && b.disabled !== lock) { b.disabled = lock; b.title = lock ? 'Indisponible pendant une partie à plusieurs' : ''; } });
      hud();
    } catch (e) { /* facultatif */ }
  }, 1000);
  // ---------- affichages ----------
  function myRank() { const b = st.board; if (!b || !b.rows) return null; const r = b.rows.find(x => x.pid === st.pid); return r ? [r.rank, b.rows.length] : null; }
  function hud() {
    const h = el('mpHud'); if (!h) return; const on = live(); if (h.hidden === on) h.hidden = !on; if (!on) return;
    const rk = myRank(), left = st.board ? st.board.left - (Date.now() - st.boardAt) : null;
    el('mpHudS').textContent = 'Salle ' + S.mode.mp.code; el('mpHudR').textContent = rk ? `Rang ${rk[0]}/${rk[1]}` : 'Rang –';
    el('mpHudT').textContent = st.conn === 'on' ? (left != null ? minTxt(left) + ' restantes' : 'en ligne') : 'hors ligne · reconnexion…';
  }
  const stTxt = r => r.kind === 'ai' ? 'IA' : r.st === 'off' ? 'hors ligne' : r.st === 'left' ? 'a quitté' : r.st === 'pause' ? 'en pause' : r.st === 'fail' ? 'faillite' : r.st === 'done' ? 'terminé' : 'en jeu';
  function rowsHTML(rows, me, full) {
    return rows.map(r => `<div class="mprow ${r.pid && r.pid === me ? 'me' : ''} ${r.kind}" style="--cc:${CASTES[r.caste] ? CASTES[r.caste].col : '#8f9acb'}"><span><b>${r.rank}.</b> ${E(rowName(r))}${r.pid === me ? ' (toi)' : ''} <small>· ${E(cN(r.caste))} · ${r.kind === 'human' ? 'humain' : 'IA'}${full && r.kind === 'human' ? ' · jour ' + (r.day | 0) : ''}${r.kind === 'human' ? ' · ' + stTxt(r) : ''}</small></span><b>${fmtV(r.w || 0)}</b></div>`).join('');
  }
  // Menu > Sociétés > Classement : panneau du classement commun en direct
  function panelHTML() {
    if (!inGame()) return '';
    const b = st.final && st.final.code === S.mode.mp.code ? { rows: st.final.rows, left: 0 } : st.board, mp = S.mode.mp;
    const left = b && !st.final ? Math.max(0, b.left - (Date.now() - st.boardAt)) : 0;
    const head = `Salle ${E(mp.code)} · classement commun ${st.final ? 'final' : 'en direct'}`, sub = st.final ? (st.final.why === 'target' ? 'objectif atteint' : 'temps écoulé') : `${minTxt(left)} restantes · objectif ${fmtV(mp.tg)}`;
    const conn = st.final ? '' : st.conn === 'on' ? '' : '<p class="note mpwarn">Connexion au serveur perdue : reconnexion automatique, ta partie continue en local.</p>';
    return `<div class="mpbox" id="mpLive"><h4>${head} <small>· ${sub}</small></h4>${conn}${b && b.rows ? rowsHTML(b.rows, st.pid, true) : '<p class="note">En attente du premier relevé du serveur…</p>'}
      <small class="note">Chaque humain joue sa propre ville (même graine) ; les valeurs arrivent du serveur chaque seconde. Valeur des IA : moyenne de ce que voient les joueurs. Dans ta ville, la caste d'un autre humain est tenue par une IA locale.</small></div>`;
  }
  // Écran de fin : résultats communs de la salle
  function resHTML(f) {
    return `<h4>Résultats de la salle ${E(f.code)} · ${f.why === 'target' ? 'objectif atteint' : 'temps écoulé'}</h4><div class="mpres">${(f.rows || []).map(r => `<div class="erow ${r.pid && r.pid === f.me ? 'me' : ''}"><span>${r.rank}. ${E(rowName(r))} · <small>${E(cN(r.caste))} · ${r.kind === 'human' ? 'humain' : 'IA'}</small></span><b>${fmtV(r.w || 0)}</b></div>`).join('')}</div>`;
  }
  // ---------- écran « Jouer à plusieurs » (salle) ----------
  function scr() {
    let d = el('mpscr'); if (d) return d;
    const css = document.createElement('style'); css.textContent = `#mpscr{position:fixed;z-index:45;inset:0;display:flex;align-items:flex-start;justify-content:center;background:rgba(4,6,20,.93);backdrop-filter:blur(6px);overflow-y:auto;padding:16px}#mpscr[hidden]{display:none}
#mpscr>.mbox{margin:auto 0;text-align:left;max-width:760px}#mpscr h2{text-align:center}.mpin{background:#0d1433;border:1px solid var(--line);color:var(--fg);border-radius:8px;padding:8px 10px;font:inherit;min-height:40px;box-sizing:border-box;max-width:100%}
.mpgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mpgrid .mcard{cursor:default}.mpgrid .mcard .btn{margin-top:6px;align-self:flex-start}.mpj{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.mpj .mpin{width:7.5em;text-transform:uppercase;letter-spacing:.15em}
.mpcg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.mpcb{display:flex;flex-direction:column;gap:2px;text-align:left;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:var(--panel-hi);color:var(--fg);font:inherit;cursor:pointer;min-height:44px}
.mpcb b{color:var(--cc)}.mpcb small{color:var(--mut);font-size:11.5px}.mpcb.on{border-color:var(--cc);box-shadow:0 0 0 2px var(--cc) inset}.mpcb:disabled{opacity:.55;cursor:not-allowed}
.mprow{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.06);border-left:3px solid var(--cc);font-size:13px;text-align:left}.mprow small{color:var(--mut)}.mprow>b{white-space:nowrap}.mprow.me{color:var(--gold);font-weight:700}.mprow.me small{color:#d9c38b}
.mpset{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}.mpset label{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--mut)}.mpset select,.mpset input{width:100%}
.mpcode{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;margin:6px 0}.mpcode b{font-family:var(--font-m);font-size:30px;letter-spacing:.25em;color:var(--gold)}.mpcode small{color:var(--mut);word-break:break-all}
.mpbtns{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.mpbtns .btn{min-height:44px}.mpst{margin-top:8px;font-size:12.5px;color:var(--cyan);min-height:1.2em}.mpst.bad{color:var(--orange)}.mpcd{font-family:var(--font-d);font-size:40px;color:var(--gold);text-align:center}
.mpbox{border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:0 0 10px;background:var(--panel-hi)}.mpbox h4{margin:0 0 6px}.mpwarn{color:var(--orange)}
#hud .stats .chip.mpchip{cursor:pointer;min-width:0}#hud .stats .chip.mpchip[hidden]{display:none!important}#mpHudR{color:var(--cyan)}body.cmp:not(.hx) #hud .stats .chip.mpchip{flex:0 0 auto;padding:2px 6px}
@media (max-width:600px){.mpgrid{grid-template-columns:1fr}.mpcg{grid-template-columns:1fr 1fr}#mpscr{padding:10px}.mpcode b{font-size:26px}}`;
    document.head.appendChild(css);
    d = document.createElement('div'); d.id = 'mpscr'; d.hidden = true; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Jouer à plusieurs'); (el('app') || document.body).appendChild(d);
    d.addEventListener('click', onClick); d.addEventListener('change', onChange);
    d.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'mpCode') { e.preventDefault(); act('join'); } if (e.key === 'Escape') { e.stopPropagation(); show(false); } });
    return d;
  }
  function show(on) { const d = scr(); st.open = !!on; d.hidden = !on; if (on) render(); }
  function open(code) { st.auto = false; if (code) st.pre = String(code).toUpperCase(); const s = sessGet(); if (s && !st.code && s.code && s.token && !inGame()) { st.code = s.code; st.token = s.token; st.name = s.name || st.name; st.srv = s.srv || st.srv; send({ t: 'ping' }); } show(true); }
  const sel = (id, opts, v, dis) => `<select class="mpin" id="${id}" ${dis ? 'disabled' : ''}>${opts.map(([k, t]) => `<option value="${E(k)}" ${String(k) === String(v) ? 'selected' : ''}>${E(t)}</option>`).join('')}</select>`;
  function render() {
    const d = el('mpscr'); if (!d || d.hidden) return;
    const a = document.activeElement, keep = a && d.contains(a) && a.id && a.tagName === 'INPUT' ? { id: a.id, v: a.value, s: a.selectionStart } : null;
    const R = st.room, inRoom = !!(R && st.code && R.code === st.code), me = inRoom ? R.players.find(p => p.pid === st.pid) : null;
    let body = '';
    if (st.final && !inRoom) body = `<div class="mpbox">${resHTML(st.final)}</div>`;
    if (!inRoom) {
      const noSrv = !(/^https?:$/.test(location.protocol) && location.host) && !qs('server');
      body += `<p class="note">Chacun joue sa ville dans son navigateur, à partir de la même graine et des mêmes réglages ; un petit serveur relaie le classement en direct. 2 à 6 humains, les IA tiennent les castes libres. Lancer une partie à plusieurs remplace ta partie solo sauvegardée dans ce navigateur.</p>
      <label class="matopt">Ton pseudo (visible des autres joueurs, rien d'autre n'est demandé) <input class="mpin" id="mpName" maxlength="20" autocomplete="nickname" value="${E(st.name || '')}" placeholder="Pseudo"></label>
      <div class="mpgrid"><div class="mcard"><b>Créer une salle</b><small>Tu es l'hôte : tu règles la partie et tu donnes le code à tes amis.</small><button class="btn" data-mp="create">Créer une salle</button></div>
      <div class="mcard"><b>Rejoindre une salle</b><small>Tape le code donné par l'hôte (4 ou 5 caractères).</small><span class="mpj"><input class="mpin" id="mpCode" maxlength="5" autocomplete="off" spellcheck="false" value="${E(st.pre || '')}" placeholder="CODE"><button class="btn" data-mp="join">Rejoindre</button></span></div></div>
      <details ${noSrv ? 'open' : ''} style="margin-top:10px"><summary class="note">Serveur de salle${noSrv ? ' (à indiquer : le jeu n\'est pas ouvert depuis le serveur)' : ' : ' + E(wsUrl().replace(/^ws/, 'http').replace(/\/ws$/, ''))}</summary><label class="matopt">Adresse <input class="mpin" id="mpSrv" value="${E(st.srv || qs('server') || '')}" placeholder="https://ma-salle.onrender.com ou 192.168.1.20:8080" style="width:100%"></label></details>`;
    } else {
      const s = R.set, H = st.host && R.phase === 'lobby', hum = R.players.length, taken = {}; R.players.forEach(p => { if (p.caste) taken[p.caste] = p; });
      const link = (/^https?:$/.test(location.protocol) ? location.origin + location.pathname : '') + '?salle=' + R.code + (qs('server') ? '&server=' + encodeURIComponent(qs('server')) : '');
      const total = Math.max(hum, s.total), nAi = Math.max(0, total - R.players.filter(p => p.caste).length);
      body = `<div class="mpcode"><span>Salle</span><b id="mpRoomCode">${E(R.code)}</b><button class="btn sec" data-mp="copy">Copier le lien</button><small>${E(link)}</small></div>
      <h4>Joueurs humains (${hum}/6)</h4><div id="mpPlayers">${R.players.map(p => `<div class="mprow ${p.pid === st.pid ? 'me' : ''}" style="--cc:${p.caste && CASTES[p.caste] ? CASTES[p.caste].col : '#4a5694'}"><span><b>${E(p.name)}</b>${p.pid === st.pid ? ' (toi)' : ''}${p.host ? ' · hôte' : ''} <small>· ${p.caste ? E(cN(p.caste)) : 'caste à choisir'}${p.on ? '' : ' · hors ligne'}</small></span><b>${p.ready ? 'prêt ✓' : 'pas prêt'}</b></div>`).join('')}</div>
      <h4>Ta caste (une caste par joueur ; les IA prennent les autres)</h4><div class="mpcg">${CK.map(k => { const o = taken[k], mine = me && me.caste === k, dis = R.phase !== 'lobby' || (o && !mine); return `<button class="mpcb ${mine ? 'on' : ''}" data-mpc="${k}" style="--cc:${CASTES[k].col}" ${dis ? 'disabled' : ''} aria-pressed="${mine ? 'true' : 'false'}"><b>${E(CASTES[k].n)}</b><small>${o ? (mine ? 'ta caste' : 'prise par ' + E(o.name)) : 'libre · ' + E(CASTES[k].tag)}</small></button>`; }).join('')}</div>
      <h4>Réglages ${st.host ? '(tu es l\'hôte)' : '(réglés par l\'hôte)'}</h4>${!H ? `<p class="note" id="mpSetTxt">IA niveau ${s.lv} (${E(DIF_LV[s.lv] ? DIF_LV[s.lv].n : '')}) · ${minTxt(s.dur * 60000)} · ${s.easy ? '100 M$ (facile)' : '10 M$ (normal)'} par joueur · objectif ${fmtV(s.target)} · ${Math.max(s.total, Math.min(6, hum))} places · graine ${s.seed}</p>` : ''}<div class="mpset" ${H ? '' : 'hidden'}>
        <label>Niveau des IA${sel('mpLv', DIF_LV.slice(1).map((L, i) => [i + 1, (i + 1) + ' · ' + L.n]), s.lv, !H)}</label>
        <label>Durée de la manche${sel('mpDur', ([5, 15, 30, 45, 60, 90, 120].indexOf(s.dur) < 0 ? [[s.dur, minTxt(s.dur * 60000)]] : []).concat([5, 15, 30, 45, 60, 90, 120].map(v => [v, v + ' min'])), s.dur, !H)}</label>
        <label>Départ${sel('mpEasy', [[0, '10 M$ par joueur (normal)'], [1, '100 M$ par joueur (facile)']], s.easy ? 1 : 0, !H)}</label>
        <label>Objectif${sel('mpTg', [[1e9, '1 Md$ de valeur'], [5e8, '500 M$'], [2.5e8, '250 M$'], [1e8, '100 M$']], s.target, !H)}</label>
        <label>Places au total (humains + IA)${sel('mpTot', [3, 4, 5, 6].filter(v => v >= Math.min(6, hum)).map(v => [v, v + ' places' + (v === 6 ? ' (les 6 castes)' : '')]), Math.max(s.total, Math.min(6, hum)), !H)}</label>
        <label>Ville de départ${sel('mpStart', [['moyenne', 'Ville de 100 000 habitants'], ['ville', 'Ville établie'], ['petite', 'Petite ville'], ['zero', 'Bourg (défi)']], s.start, !H)}</label>
        <label>Graine (même ville et mêmes tirages pour tous)<input class="mpin" id="mpSeed" type="number" min="1" max="2147483647" value="${s.seed}" ${H ? '' : 'disabled'}></label>
      </div>
      <p class="note">${total} places : ${hum} humain${hum > 1 ? 's' : ''} et ${nAi} IA au niveau ${s.lv} (${E(DIF_LV[s.lv] ? DIF_LV[s.lv].n : '')}), tirées au départ parmi les castes libres. Fin de manche commune : premier à ${fmtV(s.target)} ou plus grande valeur au bout de ${minTxt(s.dur * 60000)}.</p>
      ${st.cd != null ? `<div class="mpcd" aria-live="assertive">Départ dans ${st.cd}…</div>` : ''}
      <div class="mpbtns">${R.phase === 'lobby' ? `<button class="btn ${me && me.ready ? 'sec' : ''}" data-mp="ready" ${me && me.caste ? '' : 'disabled'}>${me && me.ready ? 'Je ne suis plus prêt' : 'Je suis prêt'}</button>${st.host ? `<button class="btn" data-mp="start" ${hum >= 2 && R.players.every(p => p.caste && p.ready && p.on) ? '' : 'disabled'}>Lancer la partie</button>` : '<small class="note">L\'hôte lance la partie quand tout le monde est prêt.</small>'}` : ''}<button class="btn sec" data-mp="leave">Quitter la salle</button></div>`;
    }
    d.innerHTML = `<div class="mbox"><h2>JOUER À PLUSIEURS</h2>${body}<div class="mpst ${st.err ? 'bad' : ''}" id="mpSt" aria-live="polite">${E(st.err || (st.conn === 'connecting' ? 'Connexion au serveur…' : st.conn === 'on' ? (inRoom ? 'Connecté au serveur de salle.' : 'Connecté.') : ''))}</div><div class="mpbtns"><button class="btn sec" data-mp="close">Fermer</button></div></div>`;
    if (keep) { const i = el(keep.id); if (i) { i.value = keep.v; i.focus(); try { i.setSelectionRange(keep.s, keep.s); } catch (e) { /* nombre */ } } }
  }
  const val = id => { const i = el(id); return i ? i.value : ''; };
  function readHome() { const n = val('mpName').trim(); if (n) st.name = n.slice(0, 20); const sv = val('mpSrv').trim(); if (sv !== (st.srv || '')) { st.srv = sv; if (st.ws) stop(); } }
  function act(a) {
    if (a === 'close') { show(false); return; }
    if (a === 'create') { readHome(); st.err = ''; st.final = null; send({ t: 'create', name: st.name }); render(); return; }
    if (a === 'join') { readHome(); const c = val('mpCode').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (c.length < 4) { st.err = 'Le code de salle fait 4 ou 5 caractères.'; render(); return; } st.pre = c; st.err = ''; st.final = null; send({ t: 'join', code: c, name: st.name }); render(); return; }
    if (a === 'ready') { const me = st.room && st.room.players.find(p => p.pid === st.pid); send({ t: 'ready', on: !(me && me.ready) }); return; }
    if (a === 'start') { send({ t: 'start' }); return; }
    if (a === 'leave') { send({ t: 'leave' }); if (inGame() && !S.mode.done) { S.mode.mp = null; save(); say('Tu as quitté la salle : ta partie continue en solo.', 'info'); } return; }
    if (a === 'copy') { const t = el('mpscr').querySelector('.mpcode small'); try { navigator.clipboard.writeText(t ? t.textContent : st.code); st.err = ''; el('mpSt').textContent = 'Lien copié.'; } catch (e) { /* presse-papiers indisponible */ } }
  }
  function onClick(e) { const b = e.target.closest('[data-mp],[data-mpc]'); if (!b || b.disabled) return; e.stopPropagation(); if (b.dataset.mpc) { st.err = ''; send({ t: 'caste', caste: b.dataset.mpc }); return; } act(b.dataset.mp); }
  function onChange(e) {
    const id = e.target.id, v = e.target.value, M = { mpLv: ['lv', +v], mpDur: ['dur', +v], mpEasy: ['easy', v === '1'], mpTg: ['target', +v], mpTot: ['total', +v], mpStart: ['start', v], mpSeed: ['seed', +v] }[id];
    if (M && st.host) send({ t: 'settings', set: { [M[0]]: M[1] } });
  }
  // accès : bouton [data-mpopen] (Menu > Réglages et partie, écran Nouvelle partie), puce du HUD, lien ?salle=CODE
  document.addEventListener('click', e => { const b = e.target.closest('[data-mpopen]'); if (b) { e.preventDefault(); e.stopPropagation(); open(); } const h = e.target.closest('#mpHud'); if (h) { try { vnGo('corp', 'corps'); } catch (er) { /* */ } } }, true);
  { const h = el('mpHud'); if (h) h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h.click(); } }); }
  // reprise : partie à plusieurs en cours dans la sauvegarde locale → reconnexion automatique avec le jeton de la salle
  { const s = sessGet(); if (s && s.code && s.token && inGame() && S.mode.mp.code === s.code && !S.mode.done) { Object.assign(st, { code: s.code, pid: s.pid, token: s.token, name: s.name || '', srv: s.srv || '', auto: true, want: true }); connect(); }
    else if (qs('salle')) setTimeout(() => { if (!inGame() || S.mode.done) open(qs('salle')); }, 3500); }
  return { open, show, panelHTML, resHTML, connect, drop, stop, state: () => ({ conn: st.conn, code: st.code, pid: st.pid, host: st.host, room: st.room, board: st.board, err: st.err, final: st.final, fp0: st.fp0 || null }), stateMsg, wsUrl, fp };
})();
window.MP = MP; window.WSE.mp = MP;
