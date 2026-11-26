#!/usr/bin/env node
'use strict';
/* Wall Street Empire : serveur de salle (multijoueur phase 1, « course parallèle »).
   Un seul fichier, une seule dépendance (ws). Il fait deux choses :
     1. il sert le jeu (city.html) en statique sur / (compressé gzip si le navigateur l'accepte) ;
     2. il gère des salles de 2 à 6 humains sur /ws (WebSocket) : code court, réglages de l'hôte, caste unique par joueur,
        prêt / départ synchronisé, relais de l'état résumé (≈ 1 message/s par joueur), classement commun, fin de manche commune.
   Chaque joueur fait tourner SA simulation dans son navigateur (même graine, mêmes réglages) : le serveur ne simule rien.
   Aucune donnée personnelle : pseudo choisi (nettoyé), aucun e-mail, aucun compte, aucun journal d'adresses IP (compteur en mémoire seulement).
   Variables d'environnement : PORT (8080), HOST (0.0.0.0), CITY_HTML (chemin du jeu ; défaut ../city.pub.html s'il existe, sinon ../city.html),
   ALLOW_ORIGINS (liste séparée par des virgules ; vide = toutes), MAX_ROOMS (300), MP_MIN_DUR_MIN (durée minimale d'une manche, 5 min ; tests : 0,05). */
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib'), crypto = require('crypto'), os = require('os');
const { WebSocketServer } = require('ws');

const PORT = +process.env.PORT || 8080, HOST = process.env.HOST || '0.0.0.0';
const ROOT = path.resolve(__dirname, '..');
const CITY = process.env.CITY_HTML ? path.resolve(process.env.CITY_HTML) : (fs.existsSync(path.join(ROOT, 'city.pub.html')) ? path.join(ROOT, 'city.pub.html') : path.join(ROOT, 'city.html'));
const ORIGINS = (process.env.ALLOW_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const MAX_ROOMS = +process.env.MAX_ROOMS || 300, MAX_IP = +process.env.MAX_CONN_PER_IP || 16;
const MIN_DUR = Math.max(0.01, +process.env.MP_MIN_DUR_MIN || 5);
const CASTES = ['industriel', 'promoteur', 'banquier', 'negociant', 'agriculteur', 'innovateur'];
const STARTS = ['moyenne', 'zero', 'petite', 'ville'], TARGETS = [1e8, 2.5e8, 5e8, 1e9];
const MAX_HUMANS = 6, MIN_HUMANS = 2, MAX_SEATS = 6, MAX_MSG = 4096;
const CODE_AB = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const now = () => Date.now();

// ---------- 1. Fichier statique ----------
let cache = { mt: 0, raw: null, gz: null, etag: '' };
function cityFile() {
  let st; try { st = fs.statSync(CITY); } catch (e) { return null; }
  if (st.mtimeMs !== cache.mt) { const raw = fs.readFileSync(CITY); cache = { mt: st.mtimeMs, raw, gz: zlib.gzipSync(raw, { level: 6 }), etag: '"' + crypto.createHash('sha1').update(raw).digest('hex').slice(0, 16) + '"' }; }
  return cache;
}
const server = http.createServer((req, res) => {
  const u = (req.url || '/').split('?')[0];
  if (u === '/healthz') { res.writeHead(200, { 'content-type': 'text/plain', 'access-control-allow-origin': '*', 'cache-control': 'no-store' }); res.end('ok ' + rooms.size + ' salle(s)'); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  if (u === '/' || u === '/index.html' || u === '/city.html') {
    const f = cityFile();
    if (!f) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('city.html introuvable : construis-le (python3 wall-street-empire/tools/build.py) ou règle CITY_HTML.'); return; }
    if (req.headers['if-none-match'] === f.etag) { res.writeHead(304, { etag: f.etag }); res.end(); return; }
    const gz = /\bgzip\b/.test(req.headers['accept-encoding'] || ''), body = gz ? f.gz : f.raw;
    res.writeHead(200, Object.assign({ 'content-type': 'text/html; charset=utf-8', 'content-length': body.length, etag: f.etag, 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer' }, gz ? { 'content-encoding': 'gzip', vary: 'accept-encoding' } : {}));
    if (req.method === 'HEAD') res.end(); else res.end(body);
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('introuvable');
});

// ---------- 2. Salles ----------
const rooms = new Map();   // code -> salle
const ipCount = new Map();   // adresse -> connexions ouvertes (en mémoire, jamais écrit)
const rid = n => crypto.randomBytes(n).toString('hex');
function newCode() { for (let len = 4; len <= 5; len++) for (let k = 0; k < 40; k++) { let c = ''; const b = crypto.randomBytes(len); for (let i = 0; i < len; i++) c += CODE_AB[b[i] % CODE_AB.length]; if (!rooms.has(c)) return c; } return null; }
function cleanName(s, i) {
  s = String(s == null ? '' : s).normalize('NFKC').replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f<>&"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
  return s || 'Joueur ' + (i || 1);
}
const num = (v, lo, hi, d) => { v = +v; return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
function mkRoom(code) {
  return { code, phase: 'lobby', host: null, made: now(), touched: now(), players: [], seats: null, t0: 0, endAt: 0, end: null,
    set: { lv: 4, dur: 90, easy: false, total: 6, target: 1e9, start: 'moyenne', seed: crypto.randomBytes(4).readUInt32BE(0) & 0x7fffffff } };
}
const pub = p => ({ pid: p.pid, name: p.name, caste: p.caste, ready: !!p.ready, on: !!p.ws, host: false, st: p.st || '' });
function roomView(R) { return { code: R.code, phase: R.phase, host: R.host, set: R.set, players: R.players.map(p => Object.assign(pub(p), { host: p.pid === R.host })), seats: R.seats, t0: R.t0, endAt: R.endAt, now: now() }; }
function send(ws, o) { if (ws && ws.readyState === 1) { try { ws.send(JSON.stringify(o)); } catch (e) { /* socket fermée */ } } }
function bcast(R, o) { const s = JSON.stringify(o); R.players.forEach(p => { if (p.ws && p.ws.readyState === 1) { try { p.ws.send(s); } catch (e) { /* */ } } }); }
const roomSync = R => { R.touched = now(); bcast(R, { t: 'room', room: roomView(R) }); };
function err(ws, code, msg) { send(ws, { t: 'err', code, msg }); }

// Places : les castes des humains, puis les IA sur des castes non prises (tirées avec la graine), total 3 à 6, jamais deux fois la même caste
function seatsOf(R) {
  const hum = R.players.filter(p => p.caste), taken = new Set(hum.map(p => p.caste)), free = CASTES.filter(k => !taken.has(k));
  let s = R.set.seed >>> 0; const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let i = free.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [free[i], free[j]] = [free[j], free[i]]; }
  const total = Math.max(hum.length, Math.min(MAX_SEATS, R.set.total)), nAi = Math.max(0, total - hum.length);
  const seats = hum.map(p => ({ caste: p.caste, ctrl: 'human', pid: p.pid, name: p.name })).concat(free.slice(0, nAi).map(k => ({ caste: k, ctrl: 'ai' })));
  return seats.sort((a, b) => CASTES.indexOf(a.caste) - CASTES.indexOf(b.caste));
}

// Classement commun : humains (valeurs envoyées par leur navigateur) + IA des castes non prises (moyenne des valeurs vues par les humains connectés)
function board(R) {
  const rows = [];
  (R.seats || []).forEach(s => {
    if (s.ctrl === 'human') { const p = R.players.find(q => q.pid === s.pid); const x = (p && p.last) || {}; rows.push({ kind: 'human', pid: s.pid, name: p ? p.name : s.name, caste: s.caste, w: x.w || 0, cash: x.cash || 0, pop: x.pop || 0, day: x.day || 0, st: p ? (p.left ? 'left' : !p.ws ? 'off' : x.st || 'play') : 'left', on: !!(p && p.ws) }); }
    else { const vs = R.players.filter(p => p.last && p.last.ai && Number.isFinite(p.last.ai[s.caste])).map(p => p.last.ai[s.caste]), w = vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : (s.lw || 0); s.lw = w; rows.push({ kind: 'ai', name: '', caste: s.caste, w, st: 'ai', on: true }); }
  });
  rows.sort((a, b) => b.w - a.w); rows.forEach((r, i) => { r.rank = i + 1; r.w = Math.round(r.w); r.cash = Math.round(r.cash || 0); });
  return rows;
}
function endRound(R, why, win) {
  if (R.phase !== 'play') return; R.phase = 'end'; const rows = board(R); R.end = { why, at: now(), rows, winner: win || rows[0] || null };
  bcast(R, { t: 'end', why, rows, winner: R.end.winner, code: R.code }); roomSync(R);
}
function tickRoom(R) {
  if (R.phase !== 'play' || now() < R.t0) return;
  const rows = board(R), el = now() - R.t0, left = Math.max(0, R.endAt - now());
  bcast(R, { t: 'board', code: R.code, el, left, rows, target: R.set.target });
  const top = rows[0]; if (top && top.w >= R.set.target) return endRound(R, 'target', top);
  if (left <= 0) return endRound(R, 'time', top);
}
setInterval(() => rooms.forEach(tickRoom), 1000).unref();
// Ménage : salle vide depuis 10 min (lobby) ou 30 min (partie), salle terminée depuis 20 min ; joueur déconnecté du lobby depuis 60 s
setInterval(() => {
  const t = now();
  rooms.forEach((R, code) => {
    const any = R.players.some(p => p.ws);
    if (R.phase === 'lobby') { const before = R.players.length; R.players = R.players.filter(p => p.ws || t - p.off < 60000); if (R.players.length !== before) { fixHost(R); roomSync(R); } }
    if ((!any && t - R.touched > (R.phase === 'play' ? 30 : 10) * 60000) || (R.phase === 'end' && t - R.end.at > 20 * 60000) || !R.players.length) rooms.delete(code);
  });
}, 15000).unref();
function fixHost(R) { if (R.players.some(p => p.pid === R.host && !p.left)) return; const h = R.players.find(p => p.ws && !p.left) || R.players.find(p => !p.left); R.host = h ? h.pid : null; }

// ---------- 3. Messages ----------
function onMsg(ws, o) {
  const me = ws.me, R = me && rooms.get(me.code), P = R && R.players.find(p => p.pid === me.pid);
  switch (o.t) {
    case 'ping': return send(ws, { t: 'pong', now: now() });
    case 'create': {
      if (me) return err(ws, 'role', 'Cette connexion est déjà dans une salle.');
      if (rooms.size >= MAX_ROOMS) return err(ws, 'busy', 'Serveur complet : réessaie plus tard.');
      const code = newCode(); if (!code) return err(ws, 'busy', 'Aucun code libre.');
      const Rn = mkRoom(code), p = { pid: rid(4), token: rid(16), name: cleanName(o.name, 1), caste: null, ready: false, ws, last: null, off: 0 };
      Rn.players.push(p); Rn.host = p.pid; rooms.set(code, Rn); ws.me = { code, pid: p.pid };
      send(ws, { t: 'joined', code, pid: p.pid, token: p.token, host: true }); return roomSync(Rn);
    }
    case 'join': {
      if (me) return err(ws, 'role', 'Cette connexion est déjà dans une salle.');
      const code = String(o.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5), Rj = rooms.get(code);
      if (!Rj) return err(ws, 'noroom', 'Salle introuvable : vérifie le code.');
      const tok = typeof o.token === 'string' ? o.token : '', old = tok && Rj.players.find(p => p.token === tok);
      if (old) {   // reconnexion : on reprend sa place (sa partie locale sauvegardée continue)
        if (old.ws && old.ws !== ws) { const w0 = old.ws; old.ws = null; try { w0.me = null; w0.close(4000, 'remplacé'); } catch (e) { /* */ } }
        old.ws = ws; old.left = false; ws.me = { code, pid: old.pid }; send(ws, { t: 'joined', code, pid: old.pid, token: old.token, host: Rj.host === old.pid, resume: true });
        fixHost(Rj); roomSync(Rj);
        if (Rj.phase === 'play') send(ws, startMsg(Rj, true)); else if (Rj.phase === 'end') send(ws, { t: 'end', why: Rj.end.why, rows: Rj.end.rows, winner: Rj.end.winner, code });
        return;
      }
      if (Rj.phase !== 'lobby') return err(ws, 'started', 'La partie de cette salle a déjà commencé.');
      if (Rj.players.length >= MAX_HUMANS) return err(ws, 'full', 'Salle complète (6 joueurs humains au plus).');
      const p = { pid: rid(4), token: rid(16), name: cleanName(o.name, Rj.players.length + 1), caste: null, ready: false, ws, last: null, off: 0 };
      if (Rj.players.some(q => q.name === p.name)) p.name = cleanName(p.name.slice(0, 17) + ' ' + (Rj.players.length + 1));
      Rj.players.push(p); ws.me = { code, pid: p.pid }; fixHost(Rj); send(ws, { t: 'joined', code, pid: p.pid, token: p.token, host: Rj.host === p.pid }); return roomSync(Rj);
    }
  }
  if (!R || !P) return err(ws, 'noroom', 'Rejoins d\'abord une salle.');
  R.touched = now();
  switch (o.t) {
    case 'caste': {
      if (R.phase !== 'lobby') return err(ws, 'phase', 'La partie a commencé : la caste ne change plus.');
      const k = o.caste === null ? null : String(o.caste); if (k !== null && CASTES.indexOf(k) < 0) return err(ws, 'caste', 'Caste inconnue.');
      if (k && R.players.some(q => q !== P && q.caste === k)) return err(ws, 'caste_taken', 'Cette caste est déjà prise par ' + R.players.find(q => q.caste === k).name + '.');
      P.caste = k; P.ready = false; return roomSync(R);
    }
    case 'ready': if (R.phase !== 'lobby') return; if (o.on && !P.caste) return err(ws, 'nocaste', 'Choisis d\'abord ta caste.'); P.ready = !!o.on; return roomSync(R);
    case 'name': if (R.phase !== 'lobby') return; P.name = cleanName(o.name, R.players.indexOf(P) + 1); return roomSync(R);
    case 'settings': {
      if (R.host !== P.pid) return err(ws, 'host', 'Seul l\'hôte règle la partie.'); if (R.phase !== 'lobby') return;
      const s = R.set, x = o.set || {};
      if (x.lv != null) s.lv = Math.round(num(x.lv, 1, 8, s.lv));
      if (x.dur != null) s.dur = num(x.dur, MIN_DUR, 180, s.dur);
      if (x.easy != null) s.easy = !!x.easy;
      if (x.total != null) s.total = Math.round(num(x.total, 3, MAX_SEATS, s.total));
      if (x.target != null && TARGETS.indexOf(+x.target) >= 0) s.target = +x.target;
      if (x.start != null && STARTS.indexOf(x.start) >= 0) s.start = x.start;
      if (x.seed != null) s.seed = Math.round(num(x.seed, 1, 0x7fffffff, s.seed));
      R.players.forEach(p => { p.ready = false; }); return roomSync(R);
    }
    case 'start': {
      if (R.host !== P.pid) return err(ws, 'host', 'Seul l\'hôte lance la partie.'); if (R.phase !== 'lobby') return;
      const on = R.players.filter(p => p.ws);
      if (on.length < MIN_HUMANS) return err(ws, 'few', 'Il faut au moins 2 joueurs humains.');
      if (on.some(p => !p.caste || !p.ready)) return err(ws, 'notready', 'Tous les joueurs doivent choisir une caste et être prêts.');
      R.players = on; R.seats = seatsOf(R); R.phase = 'play'; R.t0 = now() + 3000; R.endAt = R.t0 + R.set.dur * 60000;
      bcast(R, startMsg(R, false)); return roomSync(R);
    }
    case 'state': {
      if (R.phase !== 'play') return; const t = now(); if (P.lastAt && t - P.lastAt < 700) return; P.lastAt = t;   // ≈ 1 message/s : l'excédent est ignoré
      const ai = {}; if (o.ai && typeof o.ai === 'object') CASTES.forEach(k => { const v = +o.ai[k]; if (Number.isFinite(v) && R.seats.some(s => s.ctrl === 'ai' && s.caste === k)) ai[k] = num(v, -1e13, 1e14, 0); });
      P.last = { w: num(o.w, -1e13, 1e14, 0), cash: num(o.cash, -1e13, 1e14, 0), pop: Math.round(num(o.pop, 0, 1e8, 0)), day: Math.round(num(o.day, 0, 1e6, 0)), st: ['play', 'pause', 'done', 'fail'].indexOf(o.st) >= 0 ? o.st : 'play', ai };
      return;
    }
    case 'leave': {
      if (R.phase === 'lobby') { R.players = R.players.filter(p => p !== P); } else { P.left = true; P.ws = null; }
      ws.me = null; fixHost(R); send(ws, { t: 'left' }); return roomSync(R);
    }
    default: return err(ws, 'bad', 'Message inconnu.');
  }
}
function startMsg(R, resume) { return { t: 'start', code: R.code, resume: !!resume, seed: R.set.seed, set: R.set, seats: R.seats, in: Math.max(0, R.t0 - now()), left: Math.max(0, R.endAt - now()), now: now() }; }

// ---------- 4. WebSocket ----------
const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MSG, perMessageDeflate: false });
const ipOf = req => String((req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '?');
server.on('upgrade', (req, sock, head) => {
  if ((req.url || '').split('?')[0] !== '/ws') { sock.destroy(); return; }
  const org = req.headers.origin || '';
  if (ORIGINS.length && org && ORIGINS.indexOf(org) < 0) { sock.write('HTTP/1.1 403 Forbidden\r\n\r\n'); sock.destroy(); return; }
  const ip = ipOf(req); if ((ipCount.get(ip) || 0) >= MAX_IP) { sock.write('HTTP/1.1 429 Too Many Requests\r\n\r\n'); sock.destroy(); return; }
  wss.handleUpgrade(req, sock, head, ws => { ipCount.set(ip, (ipCount.get(ip) || 0) + 1); ws.ip = ip; wss.emit('connection', ws, req); });
});
wss.on('connection', ws => {
  ws.alive = true; ws.me = null; ws.bucket = 20; ws.bt = now(); ws.strikes = 0;
  ws.on('pong', () => { ws.alive = true; });
  ws.on('error', () => { try { ws.terminate(); } catch (e) { /* message trop gros, trame invalide : la socket est fermée */ } });
  ws.on('message', (data, bin) => {
    const t = now(); ws.bucket = Math.min(20, ws.bucket + (t - ws.bt) / 250); ws.bt = t;   // 4 messages/s en continu, rafales de 20
    if (ws.bucket < 1) { if (++ws.strikes > 40) ws.close(4008, 'trop de messages'); return; } ws.bucket -= 1;
    if (bin || data.length > MAX_MSG) return;
    let o; try { o = JSON.parse(data.toString('utf8')); } catch (e) { return err(ws, 'json', 'Message illisible.'); }
    if (!o || typeof o !== 'object' || typeof o.t !== 'string') return;
    try { onMsg(ws, o); } catch (e) { err(ws, 'srv', 'Erreur du serveur.'); }
  });
  ws.on('close', () => {
    const n = (ipCount.get(ws.ip) || 1) - 1; if (n > 0) ipCount.set(ws.ip, n); else ipCount.delete(ws.ip);
    const me = ws.me, R = me && rooms.get(me.code); if (!R) return; const P = R.players.find(p => p.pid === me.pid);
    if (P && P.ws === ws) { P.ws = null; P.off = now(); if (R.phase === 'lobby') P.ready = false; fixHost(R); roomSync(R); }
  });
});
setInterval(() => wss.clients.forEach(ws => { if (!ws.alive) { ws.terminate(); return; } ws.alive = false; try { ws.ping(); } catch (e) { /* */ } }), 15000).unref();

wss.on('error', () => { /* erreurs de poignée de main : ignorées */ });
server.on('clientError', (e, sock) => { try { sock.destroy(); } catch (x) { /* */ } });
process.on('uncaughtException', e => { console.error('erreur inattendue (le serveur continue) :', e && e.message); });
server.listen(PORT, HOST, () => {
  const addr = []; Object.values(os.networkInterfaces()).forEach(L => (L || []).forEach(a => { if (a.family === 'IPv4' && !a.internal) addr.push(a.address); }));
  console.log(`Wall Street Empire · serveur de salle sur le port ${PORT}`);
  console.log(`  jeu servi : ${CITY}${fs.existsSync(CITY) ? '' : ' (INTROUVABLE : construis city.html)'}`);
  console.log(`  sur cet ordinateur : http://localhost:${PORT}/`);
  addr.forEach(a => console.log(`  pour tes amis (même réseau) : http://${a}:${PORT}/`));
});
module.exports = { server, rooms };
