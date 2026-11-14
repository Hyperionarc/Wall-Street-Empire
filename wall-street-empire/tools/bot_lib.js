// Bot « bon joueur » : code injecté dans la page (window.BOT). Réinvestit en priorité dans les bâtiments au meilleur rendement,
// emprunte jusqu'à 45 % de la valeur, construit des logements quand le chômage est nul. Ne triche pas : n'utilise que place(), step(), le bouton d'emprunt.
window.BOT = (function () {
  const W = window.WSE, N = W.N;
  const S = () => W.S;
  const cell = (x, y) => (x >= 0 && y >= 0 && x < N && y < N) ? S().grid[y * N + x] : null;
  const isRoad = (x, y) => { const c = cell(x, y); return c && c.t === 'road'; };
  // rendement journalier net attendu par bâtiment (mesuré sur 90 jours, hors terrain)
  const NET = { tech: 34000, dc: 24000, bank: 38000, off: 18000, s3: 3900, s2: 950, s1: 160, tv: 9500 };
  const LIM = { s3: 4, s2: 5, s1: 8, tv: 0 };
  const P = { lev: 0.45, idle: 0,  reserve: 0.0, names: [], buyout: true, maxPerTick: 6, wait: 0 };
  const cnt = {};
  const spotCache = {};
  function spots(key) {
    const out = []; const T = W.TYPES[key], w = T.w || 1, h = T.h || 1;
    for (let y = 12; y <= 48; y++) for (let x = 12; x <= 48; x++) {
      if (cell(x, y)) continue; if (W.footprintError(x, y, key)) continue;
      let adj = false; for (let ox = -1; ox <= w && !adj; ox++) for (let oy = -1; oy <= h; oy++) { if ((ox >= 0 && ox < w) && (oy >= 0 && oy < h)) continue; if ((ox < 0 || ox >= w) && (oy < 0 || oy >= h)) continue; if (isRoad(x + ox, y + oy)) { adj = true; break; } }
      if (adj) out.push([x, y, Math.hypot(x - 30, y - 30)]);
    }
    return out;
  }
  const costOf = (key, x, y) => { const T = W.TYPES[key]; return Math.round(T.cost * (W.S.caste ? 1 : 1)) + (x == null ? 0 : W.landPrice(x, y)); };
  function tierOk(key) { const T = W.TYPES[key]; return !(T.tier && !S().unlockAll && T.tier > tierIdx()); }
  function tierIdx() { const w = S().stats.worth, t = [0, 25e6, 70e6, 250e6, 700e6]; let i = 0; t.forEach((v, k) => { if (w >= v) i = k; }); return i; }
  function borrow(need) {
    // emprunte par paliers via le bouton, jusqu'au levier cible
    const b = document.getElementById('loanUp'); let n = 0;
    while (S().cash < need && n++ < 60) {
      const st = S().stats.worth; if ((S().loan || 0) > P.lev * st) break;
      const l0 = S().loan || 0; b.click(); if ((S().loan || 0) === l0) break;
    }
  }
  function repay() { // rembourse le surplus si trésorerie abondante sans projet
    const b = document.getElementById('loanDn'); let n = 0; while ((S().loan || 0) > 0 && S().cash > 2 * (S().loan || 0) + 1e6 && n++ < 20) { const l0 = S().loan; b.click(); if (S().loan === l0) break; }
  }
  function buyoutSpot(key) {
    // rase l'immeuble PNJ le moins cher collé à une route pour libérer un terrain
    if (!P.buyout) return null; let best = null;
    for (let y = 12; y <= 48; y++) for (let x = 12; x <= 48; x++) { const c = cell(x, y); if (!c || c.t !== 'npc') continue; let adj = false; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { if (isRoad(x + d[0], y + d[1])) adj = true; }); if (!adj) continue; const cs = W.buyoutCost ? W.buyoutCost(c) : 1; if (!best || cs < best.cs) best = { x, y, cs }; }
    return best;
  }
  function tryBuild(key) {
    let sp = spots(key);
    if (!sp.length && P.buyout && W.TYPES[key].w == null) {
      let best = null;
      for (let y = 12; y <= 48; y++) for (let x = 12; x <= 48; x++) { const c = cell(x, y); if (!c || c.t !== 'npc') continue; let adj = false; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { if (isRoad(x + d[0], y + d[1])) adj = true; }); if (!adj) continue; const q = (c.floors || 1) + (c.k === 'house' ? -5 : 0); if (!best || q < best.q) best = { x, y, q }; }
      if (best && W.place(best.x, best.y, 'buyout')) sp = spots(key);
    }
    if (!sp.length) { return -1; }
    sp.sort((a, b) => a[2] - b[2]);
    const mid = key === 's3' || key === 's2' ? 0 : sp.length - 1;   // commerces au centre, tours en périphérie (terrain moins cher)
    for (let k = 0; k < Math.min(sp.length, 8); k++) {
      const s = key === 's3' || key === 's2' ? sp[k] : sp[sp.length - 1 - k];
      const before = S().cash; const ok = W.place(s[0], s[1], key);
      if (ok) { const c = cell(s[0], s[1]); if (c && !c.conn) { W.place(s[0], s[1], 'bull'); continue; } cnt[key] = (cnt[key] || 0) + 1; return before - S().cash; }
    }
    return false;
  }
  function pick() {
    let best = null;
    Object.keys(NET).forEach(k => {
      if (!tierOk(k) || (W.modeLocked && W.modeLocked(k))) return; if ((LIM[k] != null) && (cnt[k] || 0) >= LIM[k]) return;
      const T = W.TYPES[k]; const cost = T.cost * Math.max(1, S().cpi || 1) + 400000 * (T.w || 1) * (T.h || 1) * 0.1;
      const roi = NET[k] * Math.max(1, S().cpi || 1) / cost;
      const room = Math.max(0, Math.min(P.lev * S().stats.worth, W.creditLimit()) - (S().loan || 0)); if (cost * 1.05 > S().cash + room) return;
      if (!best || roi > best.roi) best = { k, roi, cost };
    });
    return best;
  }
  function tick() {
    const s = S(); let did = 0, spent = 0;
    if (P.idle > 0 && ((s.day * 2654435761) >>> 0) % 1000 < P.idle * 1000) return { did: 0, spent: 0 };
    // logements si plein emploi
    if (s.stats.unemp < 0.02 && s.cash > 1.5e6 && (cnt.res || 0) < 40) { for (let i = 0; i < 3; i++) { const r = tryBuild('res'); if (r) { spent += r; did++; } } }
    for (let n = 0; n < P.maxPerTick; n++) {
      const b = pick(); if (!b) break;
      if (s.cash < b.cost * 1.05) borrow(b.cost * 1.05 + 1e5);
      if (s.cash < b.cost * 1.05) break;
      const r = tryBuild(b.k); if (r === -1) { LIM[b.k] = cnt[b.k] || 0; continue; } if (!r) break; spent += r; did++;
    }
    return { did, spent };
  }
  return { tick, cnt, P, pick, spots, repay, LIM };
})();
