#!/usr/bin/env node
// Audit de COMPLÉTUDE (passe 101) : pour chaque produit (PRODUCTS), bien/matière (GOODS), type de bâtiment (TYPES), équipement public (PUB), service de la ville vivante
// (vv.SVC), outil (TOOL_META) et élément spécial (mall, aéroport), vérifie par script, sur le jeu construit (banc tests/lib.js), que toutes les informations attendues existent :
// nom français, description, famille, gamme, prix de référence, recette et intrants, chaîne de production, image (vraie photo / sprite HD ou repli), éclairage, ancre et ombre,
// coût, emplois, entretien, emprise, menu de construction, icône d'outil, infobulle (bouton, survol), enseigne de façade, intérieur, fiche du Guide, présence dans docs/CATALOGUE.md.
// Détecte aussi les incohérences (intrant inconnu, produit sans producteur, bien jamais utilisé, doublon de nom, texte « undefined », images identiques, sprite non branché…).
//
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/audit_completude.js [--md] [--json] [--lite]
//   --md   : écrit wall-street-empire/docs/AUDIT_COMPLETUDE.md ;  --json : écrit tools/audit_completude.json ;  --lite : sans pose des bâtiments ni intérieurs (rapide, utilisé par t108).
//   Code de sortie 1 si une information OBLIGATOIRE manque (statut « x ») : nom, description, image affichable, intrant connu, prix, outil de pose, icône, texte suspect…
//   Les manques « attendus » (statut « w » : photo de repli, intérieur absent, enseigne manquante…) sont comptés et listés mais ne bloquent pas.
// Module : require('./audit_completude.js').run(L, { lite }) -> { rows, issues, assets, sum } (utilisé par tests/t108_completude.js).
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..'), REPO = path.resolve(ROOT, '..');
const BAD = /undefined|NaN|\[object|Infinity|\bnull\b/;
const read = p => { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return ''; } };
const TPL = read(path.join(ROOT, 'game.template.html')), BUILD = read(path.join(ROOT, 'tools', 'build.py')), CAT = read(path.join(ROOT, 'docs', 'CATALOGUE.md'));
const RETOURS = read(path.join(REPO, 'tools', 'factory_ai', 'RETOURS.md'));
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// ---------- 1. Relevé dans la page (aucune pose de bâtiment) ----------
const STATIC = () => {
  const W = window.WSE, A = W.aud, IA = W.imgAudit, BADR = /undefined|NaN|\[object|Infinity|\bnull\b/, o = { prods: [], goods: [], types: [], pub: [], svc: [], tools: [], npc: [], dupNames: [] };
  const FK = ['', 'f1', 'f2', 'f3', 'f4'], memo = {};
  const obtain = (g, d) => {   // null si le bien peut être obtenu (extrait, fabriqué ou importé), sinon la raison
    if (memo[g] !== undefined) return memo[g]; if (d > 12) return 'boucle'; memo[g] = null; let r = null;
    if (g === 'ingot') r = !W.TYPES.foundry ? 'pas de fonderie' : obtain('gold', d + 1);
    else if (W.RECIPES[g]) { const R = W.RECIPES[g]; if (!W.TYPES[FK[R.lvl]]) r = 'pas d\'usine de niveau ' + R.lvl; else for (const i of Object.keys(R.in)) { if (!W.GOODS[i] && !W.PRODUCTS[i]) { r = 'intrant inconnu ' + i; break; } const q = obtain(i, d + 1); if (q) { r = i + ' : ' + q; break; } } }
    else if (g === 'rare') r = (W.CO_SRC.rare || []).some(m => W.TYPES[m]) ? null : 'aucune mine ne coproduit les terres rares';
    else { const s = W.RAW_SRC[g], T = s && W.TYPES[s]; r = !T ? 'aucun extracteur' : (T.ext === g || (T.co && T.co[g])) ? null : 'extracteur ' + s + ' incohérent'; }
    return memo[g] = r;
  };
  const used = {}; Object.keys(W.RECIPES).forEach(r => Object.keys(W.RECIPES[r].in).forEach(g => { (used[g] = used[g] || []).push(r); }));
  Object.keys(W.PRODUCTS).forEach(p => Object.keys(W.PRODUCTS[p].in).forEach(g => { (used[g] = used[g] || []).push(p); }));
  Object.keys(W.TYPES).forEach(k => { const T = W.TYPES[k]; if (T.live) (used.wheat = used.wheat || []).push(k); if (T.rec) Object.keys(T.rec.in).forEach(g => { (used[g] = used[g] || []).push(k); }); });
  (used.fert = used.fert || []).push('(option « engrais » des fermes)');
  (used.pack = used.pack || []).push('(emballage de tous les produits)');
  const guide = k => { try { W.openGuide(k); const g = document.getElementById('gview'), t = g.innerText.replace(/\s+/g, ' '), im = g.querySelector('.gimg img, .gimg svg, .gimg canvas'); W.closeBuilding && 0; return { len: t.length, bad: (t.match(new RegExp('.{0,30}(' + BADR.source + ').{0,20}')) || [''])[0], img: !!im, name: t.indexOf(A.gName(k)) >= 0 }; } catch (e) { return { err: e.message }; } };
  const prices = new Map();
  W.PKEYS.forEach(k => { const P = W.PRODUCTS[k], ins = Object.keys(P.in), bad = ins.filter(g => !W.GOODS[g] && !W.PRODUCTS[g]), why = ins.map(g => obtain(g, 0)).find(x => x);
    const svg = IA.productSVG0(k, 1);
    o.prods.push({ k, name: P.name, desc: P.desc || '', cls: P.cls, lvl: P.lvl, tier: P.tier, ref: P.ref, out: P.out, days: P.days, rnd: P.rnd, nIn: ins.length, badIn: bad, chain: why || (W.TYPES[FK[P.lvl]] ? null : 'pas d\'usine de niveau ' + P.lvl), fam: W.famOf(k), photo: !!IA.guide(k), hero: !!IA.hero(k), svg: typeof svg === 'string' && /^<svg/.test(svg) && svg.length > 200, gly: !!W.GLY[k], nec: W.NECESS[k], dpc: W.DEMAND_PC[k], obso: W.OBSO[k], pw: !!W.PROD_W[k], free: !!P.free, g: guide(k), inGuide: A.gItems(P.cls).indexOf(k) >= 0,
      stores: Object.keys(W.TYPES).filter(t => W.TYPES[t].ret && W.TYPES[t].ret.sells.indexOf(P.cls) >= 0), spec: Object.keys(W.spec.T).filter(t => (W.spec.PF[W.spec.T[t].fam] || []).indexOf(k) >= 0) });
  });
  const absT = new Set(['basic', 'std', 'lux']);
  A.GKEYS.forEach(k => { const G = W.GOODS[k], R = W.RECIPES[k], prod = [];
    Object.keys(W.TYPES).forEach(t => { const T = W.TYPES[t]; if (T.ext === k || (T.co && T.co[k])) prod.push(t); }); if (R) prod.push('usine niv.' + R.lvl); if (k === 'ingot') prod.push('foundry');
    o.goods.push({ k, name: G.name, base: G.base, grp: G.grp, color: G.color, abs: absT.has(k), photo: !!IA.guide(k), prod, why: absT.has(k) ? null : obtain(k, 0), used: used[k] || [], robot: !!W.ROBOTS[k], unit: A.DEP_U[k] || null, g: guide(k) });
  });
  const inCat = {}, inFam = {}; W.CATS.forEach(c => c.tools.forEach(t => { (inCat[t] = inCat[t] || []).push(c.id); })); Object.keys(W.FAMS).forEach(c => W.FAMS[c].forEach(f => f[1].forEach(t => { (inFam[t] = inFam[t] || []).push(c + '/' + f[0]); })));
  const fpr = W.fp.rules ? W.fp.rules() : [];
  Object.keys(W.TYPES).forEach(k => { const T = W.TYPES[k], ic = W.ICONS[W.ICON_OF[k] || k], tt = (A.TOOL_META[k] || T);
    o.types.push({ k, name: T.name, sub: T.sub || '', cost: T.cost, jobs: T.jobs, upkeep: T.upkeep, tier: T.tier, w: T.w || 1, h: T.h || 1, color: T.color, ext: T.ext || null, co: T.co ? Object.keys(T.co) : [], live: !!T.live, rec: !!T.rec, ret: !!T.ret, rate: T.rate,
      extOk: !T.ext || !!W.GOODS[T.ext], coOk: !T.co || Object.keys(T.co).every(g => !!W.GOODS[g]), recOk: !T.rec || (Object.keys(T.rec.in).every(g => !!W.GOODS[g]) && Object.keys(T.rec.out).every(g => !!W.GOODS[g])),
      cat: inCat[k] || [], fam: inFam[k] || [], icon: !!ic, title: (tt.name || '') + (tt.sub ? ' · ' + tt.sub : ''), sign: W.sign.SIGN[k] ? (W.sign.txt(k) || '?') : null, fpBad: fpr.filter(r => String(r).indexOf(k) === 0 || String(r).indexOf('`' + k + '`') >= 0).join(' | '),
      locked: (() => { try { return W.S.unlockAll ? 'tout débloqué (test)' : ''; } catch (e) { return ''; } })(), scn: A.SCN_LOCK ? [1, 2, 3, 4, 5].find(i => { const L = A.SCN_LOCK['s' + i]; return !L || L.indexOf(k) >= 0; }) : null, farmGuide: !!(A.FCROPS.find(c => c[4] && W.CROPS[c[4]] === k) || A.FLIVE.find(c => c[2] === k)) });
  });
  const MON = W.vv.MON, FPm = (W.fp && W.fp.MON_FP) || {};
  Object.keys(A.PUB).filter(k => !/_\d+$/.test(k) && k !== 'mall' && k !== 'air').forEach(k => { const p = A.PUB[k]; o.pub.push({ k, name: p[0], txt: p[2] || '', spr: MON[k] || null, sprOk: !!(MON[k] && W.vv.ok(MON[k])), fp: FPm[k] ? FPm[k].join('×') : '1×1', sign: W.sign.SIGN['mon:' + k] ? W.sign.txt('mon:' + k) : null, face: !!A.SIGN_FACE['mon:' + k] }); });
  W.vv.svc(); Object.keys(W.vv.SVC).forEach(k => { const s = W.vv.SVC[k], spr = A.VV_SVC_SPR[k] || k; o.svc.push({ k, name: s[0], cls: s[1], n: s[2], spr, sprOk: !!W.vv.ok(spr), sign: W.sign.SIGN['sv:' + k] ? W.sign.txt('sv:' + k) : null, face: !!A.SIGN_FACE['sv:' + k], count: (W.vv.list() || []).filter(q => q[2] === k).length }); });
  Object.keys(A.TOOL_META).forEach(k => { const T = A.TOOL_META[k]; o.tools.push({ k, name: T.name, sub: T.sub || '', color: T.color, icon: !!W.ICONS[W.ICON_OF[k] || k], cat: inCat[k] || [] }); });
  const kinds = {}; for (let i = 0; i < W.N * W.N; i++) { const c = W.S.grid[i]; if (c && c.t === 'npc' && c.x + c.y * W.N === i) kinds[c.k] = (kinds[c.k] || 0) + 1; }
  Object.keys(kinds).forEach(k => o.npc.push({ k, n: kinds[k], fr: A.kindFr(k, 1), frN: A.kindFr(k, 2) }));
  const all = {}; [['produit', o.prods], ['bien', o.goods]].forEach(([g, L]) => L.forEach(r => { const n = String(r.name).trim().toLowerCase(); (all[n] = all[n] || []).push(g + ' ' + r.k); })); const tn = {}; o.types.forEach(r => { const n = String(r.name).trim().toLowerCase(); (tn[n] = tn[n] || []).push('bâtiment ' + r.k); });
  [all, tn].forEach(m => Object.keys(m).forEach(n => { if (m[n].length > 1) o.dupNames.push(n + ' : ' + m[n].join(', ')); }));
  o.cityNames = Object.keys(W.gfx.CITY_IMG); o.embedded = Object.keys(W.gfx.P2_IMG).concat(Object.keys(W.gfx.CITY_IMG), Object.keys(W.gfx.FAC_IMG || {}), A.GUIDEHD_KEYS.map(k => 'guide/' + k), A.PRODHD_KEYS.map(k => 'products/' + k)); o.repli = { f1: A.P2_REPLI.f1 || null, f3: A.P2_F3_DUO || null };
  o.cats = W.CATS.map(c => ({ id: c.id, tools: c.tools })); o.famTools = Object.keys(W.FAMS).map(c => ({ id: c, tools: W.FAMS[c].flatMap(f => f[1]) }));
  { const gv = document.getElementById('gview'); if (gv) { gv.hidden = true; gv.innerHTML = ''; } }
  o.guideKeys = { prods: W.PKEYS.length, farms: A.FCROPS.filter(c => c[4]).map(c => c[0]).concat(A.FLIVE.map(c => c[0])), soon: A.FCROPS.filter(c => !c[4]).map(c => c[1]) };
  return o;
};

// ---------- 2. Pose de chaque type, survol, intérieur, sprite et éclairage ----------
async function probe(pg, L, keys, rows) {
  const I = require('./audit_interieurs.js'), D = require('./audit_hd.js'), T80 = require('./tests/t80_orientation.js');
  await L.inject(pg);
  await pg.addStyleTag({ content: '#modesel,#win,#endscr,#caste,#hint,#evcard,#recap,#cine{display:none!important}' });
  await pg.waitForFunction(() => Object.values(window.WSE.gfx.P2_IMG).every(e => e.ok), null, { timeout: 30000 }).catch(() => {});
  const hd = await D.inventaire(pg), by = {}; hd.rows.forEach(r => { (by[r.id] = by[r.id] || r); });
  // services, équipements publics : survol et sprite dessinés
  const pubs = await pg.evaluate(() => { const W = window.WSE, N = W.N, o = { mon: {}, svc: {} }; for (let i = 0; i < N * N; i++) { const c = W.S.grid[i]; if (!c || c.t !== 'npc' || c.x + c.y * N !== i) continue; if (c.k === 'mon' && !o.mon[c.m]) o.mon[c.m] = { x: c.x, y: c.y, lab: W.mapLabel(c.x, c.y), n: 0 }; if (c.k === 'mon') o.mon[c.m].n++; }
    (W.vv.list() || []).forEach(q => { const c = W.S.grid[q[1] * N + q[0]], nm = c ? W.vv.name(c) : ''; const s = o.svc[q[2]] || (o.svc[q[2]] = { name: nm, n: 0, lab: c ? W.mapLabel(q[0], q[1]) : null }); s.n++; }); return o; });
  // pose de tous les types
  const toBuild = keys.filter(k => !['road', 'npc'].includes(k));
  const pos = await pg.evaluate(I.BUILD_SRC(toBuild)); const res = {};
  for (const k of toBuild) {
    const p = pos[k], r = res[k] = { placed: !!(p && !p.err), err: p && p.err };
    if (!r.placed) continue;
    try {
      r.hover = await pg.evaluate(p => window.WSE.mapLabel(p.x, p.y), p);
      if (['pylon', 'cable', 'pipeline'].includes(k)) { r.kind = 'msg'; r.int = 'message'; continue; }
      await pg.evaluate(p => { window.WSE.closeBuilding(); window.WSE.openBuilding(p.x, p.y); }, p); await pg.waitForTimeout(260);
      if (await pg.evaluate(() => window.WSE.imm.on)) await pg.waitForTimeout(500);
      const m = await pg.evaluate(() => { const bv = document.getElementById('bview'), t = bv.hidden ? '' : bv.innerText.replace(/\s+/g, ' '); const bad = t.match(/.{0,30}(undefined|NaN|Infinity|\[object).{0,20}/g) || [];
        return { open: !bv.hidden, name: (document.getElementById('bname') || {}).textContent || '', kind: window.WSE.scene ? window.WSE.scene.kind : null, tabs: [...document.querySelectorAll('#bview .btabs button')].filter(b => !b.hidden && b.offsetParent).map(b => b.textContent), len: t.length, bad: bad.slice(0, 3) }; });
      Object.assign(r, m); await pg.evaluate(() => { if (window.WSE.imm.on) window.WSE.immExit(); window.WSE.closeBuilding(); }); await pg.waitForTimeout(120);
    } catch (e) { r.exc = String(e.message).slice(0, 120); }
  }
  const ints = {};
  for (const [k, sel, open] of [['mall', '#mallp', 'mall'], ['air', '#airp', 'air']]) {
    try { await pg.evaluate(open => { window.WSE.closeBuilding(); window.WSE[open].open(); }, open); await pg.waitForTimeout(350);
      ints[k] = await pg.evaluate(sel => { const p = document.querySelector(sel); if (!p) return { none: 1 }; const t = p.innerText.replace(/\s+/g, ' '); return { vis: !p.hidden && p.getBoundingClientRect().width > 0, len: t.length, bad: t.match(/.{0,30}(undefined|NaN|Infinity|\[object).{0,20}/g) || [] }; }, sel);
      await pg.evaluate(open => window.WSE[open].close(), open); } catch (e) { ints[k] = { exc: e.message }; }
  }
  // éclairage et dimensions des sprites réellement dessinés
  const names = new Set(); hd.rows.forEach(r => r.spr.split(', ').forEach(n => { n = n.replace(/ \(dérivé.*$/, ''); if (n && !/^(veh_|voiture_|camion|poses\/|animal_|fermier|arbre)/.test(n)) names.add(n); }));
  const light = await pg.evaluate(T80.pageMeasure, [...names]);
  const dim = await pg.evaluate(ns => { const D = window.WSE.gfx.P2DIM, o = {}; ns.forEach(n => { const d = D[n]; if (d) o[n] = { w: d[0], h: d[1], dal: d[7] - d[6], anc: d.length > 11 && d[10] >= 0 }; }); return o; }, [...names]);
  const aud = hd.rows;
  return { by, pubs, res, ints, light, dim, hdRows: aud, embedded: hd.embedded, hd };
}

// ---------- 3. Fichiers d'assets ----------
const IMG = /\.(jpe?g|png|webp)$/i;
const ls = d => { const p = path.join(REPO, d); return fs.existsSync(p) ? fs.readdirSync(p).filter(f => IMG.test(f)).map(f => ({ d, f, base: f.replace(IMG, ''), p: path.join(p, f) })) : []; };
const md5 = p => crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
function buildMaps() { const grab = n => { const m = BUILD.match(new RegExp('^' + n + "\\s*=\\s*\\{([^}]*)\\}", 'm')); const o = {}; if (m) for (const kv of m[1].matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)) o[kv[1]] = kv[2]; return o; }; return { subst: grab('GUIDE_SUBST'), fill: grab('GUIDE_FILL'), compose: grab('GUIDE_COMPOSE') }; }
function drawItemCases() { const a = TPL.indexOf('function drawItem('), b = TPL.indexOf('function compIconVec('); const s = TPL.slice(a, b), set = new Set(); for (const m of s.matchAll(/case '([a-z0-9_]+)'/g)) set.add(m[1]); return set; }
function orderOf(name) {   // dernière « COMMANDE n°… » dont le texte cite ce nom de fichier
  const re = new RegExp('(^|[^a-z0-9_])' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9_]|$)', 'i'); let last = null, cur = null;
  RETOURS.split('\n').forEach(l => { const h = l.match(/^#+\s*(?:Passe \d+ \([^)]*\)\s*:?\s*)?(COMMANDE n°\s*\d+(?: bis)?|Commande n°\s*\d+(?: bis)?)/i); if (h) cur = h[1].replace(/^commande/i, 'COMMANDE'); if (re.test(l) && cur) last = cur; });
  return last;
}

// ---------- 4. Évaluation ----------
const ok = t => ['ok', t || ''], w = t => ['w', t || ''], x = t => ['x', t || ''], na = t => ['na', t || ''];
function verdict(c, labels) { const bad = Object.keys(c).filter(k => c[k][0] === 'x'), warn = Object.keys(c).filter(k => c[k][0] === 'w'); return { bloq: bad.map(k => labels[k] || k), warn: warn.map(k => labels[k] || k), v: !bad.length && !warn.length ? 'OK' : 'manque ' + bad.concat(warn).map(k => labels[k] || k).join(', '), level: bad.length ? 'bloquant' : warn.length ? 'attendu' : 'ok' }; }

function evaluate(S, P, o) {
  const maps = buildMaps(), cases = drawItemCases(); const rows = [], issues = [];
  const files = { guide: ls('assets/guide_hd'), g256: ls('assets/guide_hd_256'), p2: ls('assets/phase2_hd'), fac: ls('assets/factory_hd'), cand: ls('assets/factory_hd_candidats'), prodhd: ls('wall-street-empire/assets/products_hd') };
  const own = k => files.guide.find(i => i.base === k);
  const catKeys = new Set([...CAT.matchAll(/`([a-z0-9_]+)`/g)].map(m => m[1]));
  const issue = (cat, txt, sev) => issues.push({ cat, txt, sev: sev || 'attendu' });
  // doublons de nom
  S.dupNames.forEach(d => issue('Nom en double', d, 'bloquant'));
  { const pn = {}; S.pub.forEach(p => { (pn[p.name] = pn[p.name] || []).push(p.k); }); Object.keys(pn).filter(n => pn[n].length > 1).forEach(n => issue('Nom en double', 'équipements publics ' + pn[n].join(', ') + ' : même nom « ' + n + ' »')); }
  // --- images identiques
  const hashOf = {}; files.guide.forEach(f => { f.h = md5(f.p); (hashOf[f.h] = hashOf[f.h] || []).push(f.base); });
  Object.values(hashOf).filter(l => l.length > 1).forEach(l => issue('Images identiques', 'fichiers de guide_hd au contenu identique : ' + l.join(', ')));
  // --- produits
  const L1 = { nom: 'nom', desc: 'description', fam: 'famille', gamme: 'gamme', prix: 'prix de référence', rec: 'recette/intrants', chaine: 'chaîne de production', img: 'image', gly: 'glyphe de repli', eco: 'tables de demande', vente: 'point de vente', guide: 'fiche du Guide', cat: 'ligne du catalogue' };
  const prodKeys = {};
  S.prods.forEach(p => { const k = p.k, c = {}, nm = p.name || '';
    c.nom = !nm || nm === k || BAD.test(nm) || /^[a-z0-9_]+$/.test(nm) ? x(nm || 'vide') : ok(nm);
    c.desc = !p.desc ? x('vide') : BAD.test(p.desc) ? x('texte suspect') : p.desc.length < 25 ? w('très court') : ok();
    c.fam = !p.fam || p.fam === 'Autres' ? x('« Autres »') : ok(p.fam);
    c.gamme = !p.cls || !p.lvl || !(p.lvl >= 1 && p.lvl <= 4) || p.tier == null ? x('classe/niveau/palier') : ok(`${p.cls}·n${p.lvl}·p${p.tier}`);
    c.prix = !(p.ref > 0) || !isFinite(p.ref) ? x('absent') : ok(p.ref.toFixed(2).replace('.', ',') + ' $');
    c.rec = p.badIn.length ? x('intrant inconnu ' + p.badIn.join(',')) : !p.nIn ? x('aucun intrant') : !(p.out > 0) || !(p.days > 0) ? x('sortie/cycle') : ok(p.nIn + ' intrants');
    c.chaine = p.chain ? x(p.chain) : ok();
    const ow = own(k); let img, t;
    if (maps.subst[k] && own(maps.subst[k])) { img = w('substituée ← ' + maps.subst[k]); t = 'subst'; }
    else if (ow) { img = ok('photo'); t = 'photo'; }
    else if (maps.fill[k] && own(maps.fill[k])) { img = w('voisine ← ' + maps.fill[k]); t = 'fill'; }
    else if (maps.compose[k]) { img = w('composite'); t = 'compose'; }
    else if (p.photo) { img = ok('photo (source ?)'); t = 'photo'; }
    else { img = (p.svg ? w('repli vectoriel') : x('aucune')); t = 'vec'; }
    if (!p.photo && !p.svg) img = x('aucune image affichable'); if (!!p.photo !== (t !== 'vec')) img = x('incohérence build/jeu (' + t + ' / ' + p.photo + ')');
    c.img = img; prodKeys[k] = t;
    c.gly = t === 'vec' ? (p.gly ? ok() : w('pas de glyphe : dessin générique')) : na();
    c.eco = p.nec == null || p.dpc == null || p.obso == null || !p.pw ? w('valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W') : ok();
    c.vente = p.cls === 'estate' ? (S.types.find(t2 => t2.k === 'immo') ? ok('immo') : x('aucune agence')) : p.stores.length ? ok(p.stores.join(' ')) : x('aucun magasin ne vend la classe ' + p.cls);
    c.guide = !p.inGuide ? x('absent de la liste') : p.g.err ? x(p.g.err) : p.g.bad ? x('texte suspect : ' + p.g.bad) : !p.g.img ? w('sans image') : !p.g.name ? w('nom absent de la fiche') : ok();
    c.cat = catKeys.has(k) ? ok() : w('absent de docs/CATALOGUE.md');
    rows.push({ g: 'produit', k, name: nm, c, lab: L1 });
  });
  // --- biens
  const L2 = { nom: 'nom', prix: 'prix de base', grp: 'groupe', couleur: 'couleur', img: 'image', prod: 'producteur', usage: 'débouché', guide: 'fiche du Guide', unite: 'unité', cat: 'ligne du catalogue' };
  S.goods.forEach(gd => { const k = gd.k, c = {}, nm = gd.name || '';
    c.nom = !nm || nm === k || BAD.test(nm) ? x(nm || 'vide') : ok(nm);
    c.prix = gd.abs ? na('catégorie abstraite') : !(gd.base > 0) ? x('absent') : ok(String(gd.base).replace('.', ',') + ' $');
    c.grp = !gd.grp ? x('absent') : ok(gd.grp); c.couleur = /^#[0-9a-f]{6}$/i.test(gd.color || '') ? ok() : w('couleur absente');
    const ow = own(k); let t, img;
    if (gd.abs) { img = na('catégorie de gamme abstraite'); t = 'abs'; }
    else if (maps.subst[k] && own(maps.subst[k])) { img = w('substituée'); t = 'subst'; }
    else if (ow) { img = ok('photo'); t = 'photo'; }
    else if (maps.fill[k] && own(maps.fill[k])) { img = w('voisine ← ' + maps.fill[k]); t = 'fill'; }
    else if (maps.compose[k]) { img = w('composite animal'); t = 'compose'; }
    else if (gd.photo) { img = ok('photo (source ?)'); t = 'photo'; }
    else { img = cases.has(k) ? w('repli vectoriel dédié') : w('repli vectoriel générique'); t = 'vec'; }
    c.img = img; prodKeys[k] = t;
    c.prod = gd.abs ? na() : gd.why ? x(gd.why) : ok(gd.prod.join(' ') || 'import/port');
    c.usage = gd.abs ? na() : gd.used.length || gd.robot ? ok(gd.used.length + ' recette(s)') : w('jamais intrant : vente/export seulement');
    c.guide = gd.g.err ? x(gd.g.err) : gd.g.bad ? x('texte suspect : ' + gd.g.bad) : !gd.g.img ? w('sans image') : ok();
    c.unite = gd.abs ? na() : ok(gd.unit || 't');
    c.cat = catKeys.has(k) ? ok() : w('absent de docs/CATALOGUE.md');
    rows.push({ g: 'bien', k, name: nm, c, lab: L2 });
    if (!gd.abs && !gd.used.length && !gd.robot && !gd.prod.length) issue('Bien jamais utilisé', k + ' (' + nm + ') : ni produit ni intrant');
  });
  // --- bâtiments
  const L3 = { nom: 'nom', sub: 'description', propre: 'sprite propre', cout: 'coût', emplois: 'emplois', entretien: 'entretien', emprise: 'emprise', palier: 'palier/déblocage', menu: 'menu de construction', icone: 'icône d\'outil', bouton: 'infobulle du bouton', survol: 'infobulle de survol', recette: 'recette/production', sprite: 'sprite', ecl: 'éclairage', ancre: 'ancre/ombre', enseigne: 'enseigne', inter: 'intérieur', guide: 'fiche du Guide', cat: 'ligne du catalogue' };
  const NET = ['road', 'pylon', 'cable', 'pipeline'], NOINT = ['road'], sprOf = {}, sprs = h => h.spr.split(', ').map(n => n.replace(/ \(dérivé.*$/, '')).filter(n => n && !/^(veh_|voiture_|camion|poses\/|animal_|fermier|arbre)/.test(n));
  const SIGN_EXPECT = t => t.ret || ['wh', 'ewh', 'rd', 'dc', 'hq', 'port', 'tv'].includes(t.k);
  S.types.filter(t => t.k !== 'npc').forEach(t => { const k = t.k, c = {}, pr = P && P.res[k], hdr = P && (P.by[k] || P.by[k + ':n0']), net = NET.includes(k);
    c.nom = !t.name || t.name === k || BAD.test(t.name) ? x(t.name || 'vide') : ok(t.name);
    const subDup = S.types.filter(y => y.k !== k && y.sub === t.sub).map(y => y.k);
    c.sub = !t.sub ? x('vide') : BAD.test(t.sub) ? x('texte suspect') : subDup.length ? w('sous-titre générique « ' + t.sub + ' » aussi sur ' + subDup.join(', ')) : t.sub.length < 12 ? w('sous-titre trop court : « ' + t.sub + ' »') : ok(t.sub);
    c.cout = !(t.cost > 0) || !isFinite(t.cost) ? x('absent') : ok();
    c.emplois = (t.jobs == null && NET.includes(k)) ? ok('réseau : 0') : t.jobs == null || !isFinite(t.jobs) ? x('absent') : ok(t.jobs);
    c.entretien = t.upkeep == null || !isFinite(t.upkeep) ? x('absent') : ok(t.upkeep);
    c.emprise = t.fpBad ? x(t.fpBad.slice(0, 60)) : ok(t.w + '×' + t.h);
    c.palier = t.tier && !(t.tier >= 1 && t.tier <= 4) ? x('palier ' + t.tier) : ok(t.tier ? 'palier ' + t.tier : 'dès le départ');
    c.menu = !t.cat.length ? x('aucune catégorie') : !t.fam.length ? x('aucune famille') : ok(t.cat[0]);
    c.icone = !t.icon ? x('aucune') : ok();
    c.bouton = !t.title || BAD.test(t.title) ? x(t.title || 'vide') : ok();
    c.survol = !pr ? na('--lite') : !pr.placed ? w('non posé : ' + pr.err) : !pr.hover || !pr.hover.t || BAD.test(pr.hover.t + (pr.hover.s || '')) ? x('vide ou suspect') : ok(pr.hover.t.slice(0, 40));
    c.recette = !t.extOk ? x('bien extrait inconnu ' + t.ext) : !t.coOk ? x('coproduit inconnu') : !t.recOk ? x('recette inconnue') : ok(t.ext ? 'extrait ' + t.ext : t.rec ? 'recette' : t.ret ? 'vente' : '');
    // sprite
    if (net) { c.sprite = ok('tuiles de réseau (code)'); c.ecl = na(); c.ancre = na(); }
    else if (!hdr) { c.sprite = P ? x('non rendu') : na('--lite'); c.ecl = na(); c.ancre = na(); }
    else { const spr = sprs(hdr); sprOf[k] = spr[0] || null; const vec = /^VECTORIEL|atlas/.test(hdr.mode);
      c.sprite = vec ? w(hdr.mode) : hdr.mode === 'rien' || hdr.mode === 'erreur' ? x(hdr.mode) : ok(spr[0] || hdr.mode);
      const m = spr.map(n => P.light[n]).filter(Boolean)[0]; c.ecl = !spr.length || P.lite ? na() : S.cityNames.includes(spr[0]) ? na('sprite de la ville') : !m ? w('non mesuré') : m.ratio >= 0.95 ? ok(m.ratio) : w('flanc gauche sombre ' + m.ratio);
      const d = spr.map(n => P.dim[n]).filter(Boolean)[0]; const pxc = d ? d.dal / Math.max(1, t.w) : 0; c.ancre = !spr.length || P.lite ? na() : !d ? ok('sprite d\'usine (ancres.json)') : pxc && pxc < 130 ? w('définition ' + Math.round(pxc) + ' px/case') : ok(Math.round(pxc) + ' px/case'); }
    c.enseigne = t.sign ? ok(t.sign) : SIGN_EXPECT(t) ? w('aucune enseigne') : na();
    c.inter = NOINT.includes(k) ? na('réseau') : !pr ? na('--lite') : !pr.placed ? w('non posé : ' + pr.err) : pr.kind === 'msg' ? ok('message') : pr.exc ? x(pr.exc) : !pr.open ? w('ne s\'ouvre pas') : pr.bad && pr.bad.length ? x('texte suspect ' + pr.bad[0]) : pr.len < 60 ? w('panneau vide') : ok(pr.kind || 'panneau');
    c.guide = t.ext && (t.live || ['wheat', 'sugar', 'cotton', 'rubber', 'grapes', 'corn', 'rapeseed'].includes(t.ext)) ? (t.farmGuide ? ok('Guide de l\'agriculteur') : x('absent du Guide de l\'agriculteur')) : na();
    c.cat = catKeys.has(k) ? ok() : w('absent de docs/CATALOGUE.md');
    rows.push({ g: 'bâtiment', k, name: t.name, c, lab: L3, sp: sprOf[k] || null, ent: t });
  });
  // --- équipements publics
  const L4 = { nom: 'nom', txt: 'description', emprise: 'emprise', sprite: 'sprite', ecl: 'éclairage', partage: 'sprite propre', enseigne: 'enseigne', survol: 'infobulle de survol', inter: 'intérieur', cat: 'ligne du catalogue' };
  const spCount = {}; S.pub.forEach(p => { if (p.spr) spCount[p.spr] = (spCount[p.spr] || []).concat(p.k); });
  S.pub.forEach(p => { const c = {}, k = p.k, hr = P && (P.by['mon:' + k]), pm = P && P.pubs.mon[k], spr = hr ? hr.spr.split(', ').map(n => n.replace(/ \(dérivé.*$/, '')).filter(Boolean) : [];
    c.nom = !p.name || BAD.test(p.name) ? x('vide') : ok(p.name); c.txt = !p.txt ? x('vide') : BAD.test(p.txt) ? x('suspect') : !/\+[\d,]+ d'humeur/.test(p.txt) ? w('sans l\'effet chiffré (« +N d\'humeur ») : « ' + p.txt + ' »') : ok(p.txt);
    c.emprise = ok(p.fp); c.sprite = !P ? na('--lite') : !hr ? x('non rendu') : /^VECTORIEL|atlas/.test(hr.mode) ? w(hr.mode) : hr.mode === 'rien' || hr.mode === 'erreur' ? x(hr.mode) : ok(spr[0]);
    const m = spr.map(n => P && P.light[n]).filter(Boolean)[0]; c.ecl = !spr.length || P.lite ? na() : !m ? w('non mesuré') : m.ratio >= 0.95 ? ok(m.ratio) : w('flanc gauche sombre ' + m.ratio);
    c.partage = p.spr && spCount[p.spr].length > 1 ? w('même sprite que ' + spCount[p.spr].filter(q => q !== k).join(', ')) : ok();
    c.enseigne = p.sign ? ok(p.sign) : w('aucune enseigne'); c.survol = P.lite ? na('--lite') : !pm ? w('absent de la ville de départ') : !pm.lab || !pm.lab.t || BAD.test(pm.lab.t) ? x('vide') : ok(pm.lab.t);
    c.inter = na('pas de fenêtre'); c.cat = na();
    rows.push({ g: 'équipement public', k, name: p.name, c, lab: L4, sp: spr[0] || p.spr });
  });
  ['mall', 'air'].forEach(k => { const c = {}, I = P && P.ints[k], nm = k === 'mall' ? 'Mall central' : 'Aéroport', hr = P && P.by['mon:' + k];
    c.nom = ok(nm); c.txt = ok(k === 'mall' ? 'Centre commercial de la ville' : 'Équipement de la ville'); c.emprise = ok(k === 'mall' ? '10×10' : '2 cases ×24');
    c.sprite = !P ? na('--lite') : k === 'mall' ? ok('extérieur « Guggenheim » dessiné en code (voulu par Rémy)') : hr ? (hr.mode === 'VECTORIEL' ? w('VECTORIEL (aérogare dessinée en code, avions animés)') : ok(hr.spr)) : w('dessin en code (avions, aérogare, parking) ; aeroport_terminal.png en en-tête seulement');
    c.ecl = na(); c.partage = ok(); c.enseigne = ok(k === 'mall' ? 'MALL (plaque)' : 'AÉROPORT'); c.survol = ok(nm);
    c.inter = P.lite ? na('--lite') : !I || I.none || I.exc ? x('panneau absent') : !I.vis ? x('panneau fermé') : I.bad.length ? x('texte suspect') : ok('panneau dédié'); c.cat = na();
    rows.push({ g: 'équipement public', k, name: nm, c, lab: L4 });
  });
  // --- services de la ville vivante
  const L5 = { nom: 'nom', cls: 'classe', sprite: 'sprite HD', propre: 'sprite propre', enseigne: 'enseigne', face: 'enseigne de façade', survol: 'infobulle de survol', presence: 'présence en ville' };
  S.svc.forEach(s => { const c = {}, hr = P && P.by['sv:' + s.k], pm = P && P.pubs.svc[s.k];
    c.nom = !s.name || BAD.test(s.name) ? x('vide') : ok(s.name); c.cls = s.cls ? ok(s.cls) : x('absente');
    c.sprite = !P ? (s.sprOk ? ok(s.spr) : x('sprite introuvable ' + s.spr)) : !hr ? x('non rendu') : /^VECTORIEL|atlas/.test(hr.mode) ? w(hr.mode) : hr.mode === 'rien' || hr.mode === 'erreur' ? x(hr.mode) : ok(s.spr);
    c.enseigne = s.sign ? ok(s.sign) : (['c', 'm'].includes(s.cls) && !/hlm|construction|friche/i.test(s.name)) ? w('aucune enseigne') : na();
    c.face = s.sign ? (s.face ? ok('peinte en façade') : w('plaque flottante seulement')) : na();
    c.survol = P.lite ? na('--lite') : !pm ? w('aucun exemplaire en ville') : !pm.name ? x('nom vide') : ok(pm.name); c.presence = s.count ? ok(s.count + ' en ville') : w('0 en ville de départ');
    rows.push({ g: 'service de quartier', k: s.k, name: s.name, c, lab: L5, sp: s.spr });
  });
  // --- outils hors types
  const L6 = { nom: 'nom', sub: 'sous-titre', couleur: 'couleur', icone: 'icône', menu: 'menu' };
  S.tools.forEach(t => { const c = {}; c.nom = !t.name || BAD.test(t.name) ? x('vide') : ok(t.name); c.sub = t.sub ? ok(t.sub) : w('vide'); c.couleur = t.color ? ok() : w('absente'); c.icone = t.icon ? ok() : x('aucune');
    c.menu = t.cat.length || ['view', 'up', 'bull'].includes(t.k) ? ok(t.cat[0] || 'barre fixe') : (['xp', 'xm', 'xg', 'link', 'ecom', 'buyout', 'keep', 'terra', 'zone'].includes(t.k) ? x('aucune catégorie') : w('aucune catégorie')); rows.push({ g: 'outil', k: t.k, name: t.name, c, lab: L6 }); });
  // --- types de bâtiments de la ville (PNJ)
  const L7 = { nom: 'nom', pluriel: 'pluriel' };
  S.npc.forEach(n => { const c = {}; c.nom = !n.fr || BAD.test(n.fr) || n.fr === n.k ? x(n.fr) : ok(n.fr); c.pluriel = !n.frN || BAD.test(n.frN) || n.frN === n.fr ? w('pluriel identique au singulier') : ok(n.frN); rows.push({ g: 'ville (PNJ)', k: n.k, name: n.fr, c, lab: L7 }); });
  // --- sprites partagés entre objets différents (même image pour deux objets du jeu) et replis de la petite et de la grande usine
  const share = {}; rows.forEach(r => { if (r.sp && !(r.g === 'bâtiment' && ['res', 'tech', 'off', 'bank'].includes(r.k))) (share[r.sp] = share[r.sp] || []).push(r.g === 'bâtiment' ? r.k : r.g === 'équipement public' ? 'mon:' + r.k : 'sv:' + r.k); });
  rows.forEach(r => { if (!['bâtiment', 'équipement public', 'service de quartier'].includes(r.g) || !r.sp) { if (['bâtiment', 'service de quartier'].includes(r.g)) r.c.propre = na(); return; }
    const id = r.g === 'bâtiment' ? r.k : r.g === 'équipement public' ? 'mon:' + r.k : 'sv:' + r.k, others = (share[r.sp] || []).filter(q => q !== id && !(id === 'f2' && (q === 'f1' || q === 'f3')) && !((id === 'sv:drugstore' && q === 'spharma') || (id === 'spharma' && q === 'sv:drugstore')));
    const rep = r.g === 'bâtiment' && ((r.k === 'f1' && S.repli.f1) || (r.k === 'f3' && S.repli.f3));
    const c = rep ? w('repli : ' + (r.k === 'f1' ? S.repli.f1 : S.repli.f3) + ' (usine ' + (r.k === 'f1' ? 'petite' : 'grande') + ' jugée mauvaise, commande n°14)') : others.length ? w('même sprite que ' + others.join(', ')) : ok();
    if (r.g === 'équipement public') r.c.partage = c; else r.c.propre = c; });
  rows.forEach(r => Object.assign(r, verdict(r.c, r.lab)));
  // --- cohérence des menus
  const toolOf = new Set(S.cats.flatMap(c => c.tools)), famOf = {}; S.famTools.forEach(f => f.tools.forEach(t => { famOf[t] = 1; }));
  S.types.filter(t => t.k !== 'npc').forEach(t => { if (!toolOf.has(t.k)) issue('Bâtiment sans outil de pose', `${t.k} (${t.name}) : absent de CATS`, 'bloquant'); if (!famOf[t.k]) issue('Bâtiment sans outil de pose', `${t.k} : absent de FAMS`, 'bloquant'); });
  S.cats.forEach(c => c.tools.forEach(t => { if (!S.types.some(y => y.k === t) && !S.tools.some(y => y.k === t)) issue('Outil sans définition', `${t} (catégorie ${c.id})`, 'bloquant'); }));
  S.famTools.forEach(f => f.tools.forEach(t => { const cat = S.cats.find(c => c.id === f.id); if (cat && cat.tools.indexOf(t) < 0) issue('Outil dans FAMS mais pas dans CATS', `${t} (${f.id})`, 'bloquant'); }));
  if (S.guideKeys.soon.length) issue('Guide de l\'agriculteur', 'cultures listées « à venir » sans ferme : ' + S.guideKeys.soon.join(', '), 'info');
  // --- sprites : fichiers photos orphelins, entrées GUIDE_* devenues inutiles
  const keySet = new Set(S.prods.map(p => p.k).concat(S.goods.map(g => g.k))), refd = new Set(Object.values(maps.subst).concat(Object.values(maps.fill)));
  files.guide.filter(f => !keySet.has(f.base) && !refd.has(f.base)).forEach(f => issue('Photo non utilisée', `assets/guide_hd/${f.f} : aucun produit ni bien « ${f.base} »`, 'attendu'));
  Object.keys(maps.fill).forEach(k => { if (own(k)) issue('Entrée GUIDE_FILL périmée', `${k} : une photo propre existe, retirer la ligne de tools/build.py`, 'attendu'); });
  Object.keys(maps.compose).forEach(k => { if (own(k)) issue('Entrée GUIDE_COMPOSE périmée', `${k} : une photo propre existe, retirer la ligne de tools/build.py`, 'attendu'); });
  Object.keys(maps.subst).forEach(k => { if (own(k) && !own(maps.subst[k])) issue('Entrée GUIDE_SUBST cassée', k, 'bloquant'); });
  const g256 = new Set(files.g256.map(f => f.base)); files.guide.filter(f => !g256.has(f.base)).forEach(f => issue('Copie guide_hd_256 manquante', f.base, 'info'));
  // --- PNG HD non utilisés (hors carte), avec la raison écrite par audit_hd
  const assets = { unused: [], orders: {} };
  if (P) { const D = require('./audit_hd.js'), md = D.report({ rows: P.hdRows, embedded: P.embedded }, null), sec = md.split('## PNG HD présents mais absents de la carte')[1] || '';
    sec.split('\n').filter(l => /^\| (factory_hd|phase2_hd) /.test(l)).forEach(l => { const q = l.split('|').map(s => s.trim()); assets.unused.push({ dir: q[1], png: q[2].replace(/`/g, ''), emb: q[3], why: q[4] }); }); }
  // --- vectoriel : assets à commander (nom, emprise)
  return { rows, issues, assets, files: { guide: files.guide.length, g256: files.g256.length, p2: files.p2.length, fac: files.fac.length, cand: files.cand.length }, prodImg: prodKeys, maps };
}

async function run(L, opts = {}) {
  const pg = await L.newPage({ w: 1280, h: 900, wait: 2600 }); await L.setup(pg, { cash: 5e10 });
  const S = await pg.evaluate(STATIC); let P = null;
  if (!opts.lite) P = await probe(pg, L, S.types.map(t => t.k), null);
  else { await pg.waitForFunction(() => Object.values(window.WSE.gfx.P2_IMG).every(e => e.ok), null, { timeout: 30000 }).catch(() => {}); const D = require('./audit_hd.js'), hd = await D.inventaire(pg), by = {}; hd.rows.forEach(r => { by[r.id] = by[r.id] || r; }); P = { by, pubs: { mon: {}, svc: {} }, res: {}, ints: {}, light: {}, dim: {}, hdRows: hd.rows, embedded: hd.embedded, lite: true }; }
  const errs = pg.errs.slice(); await pg.context().close();
  const R = evaluate(S, P.lite ? Object.assign(P, { res: {} }) : P, opts); R.errs = errs; R.static = S;
  R.assets = Object.assign(R.assets || {}, scanAssets(S), { orders: ordersReport() }); R.assets.hdUnused = (R.assets.unused || []).filter(u => u.emb === 'oui').length;
  const sev = R.rows.reduce((a, r) => { a[r.level] = (a[r.level] || 0) + 1; return a; }, {}); R.sum = { total: R.rows.length, ok: sev.ok || 0, attendu: sev.attendu || 0, bloquant: sev.bloquant || 0, issuesBloq: R.issues.filter(i => i.sev === 'bloquant').length };
  return R;
}
// ---------- 5. Assets : fichiers présents mais non branchés, commandes Cowork non livrées ----------
function gitDates() {
  try {
    const out = require('child_process').execFileSync('git', ['log', '--since=2026-11-18', '--name-only', '--pretty=format:@%cs', '--', 'assets', 'wall-street-empire/assets'], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26 });
    let d = ''; const m = {};
    out.split('\n').forEach(l => { if (l[0] === '@') d = l.slice(1); else if (l.trim() && !m[l]) m[l] = d; });
    return m;
  } catch (e) { return {}; }
}
function scanAssets(S) {
  const emb = new Set(S.embedded), dates = gitDates(), NC = require('./audit_hd.js').NON_CARTE, out = { unwired: [] };
  const sets = [['assets/factory_hd', /\.png$/, b => emb.has(b), 'factory_hd'], ['assets/phase2_hd', /\.png$/, b => emb.has(b), 'phase2_hd'], ['assets/factory_hd/int', /\.png$/, b => emb.has('int/' + b), 'factory_hd/int'], ['assets/factory_hd/poses', /\.png$/, b => emb.has('poses/' + b), 'factory_hd/poses'],
    ['assets/phase2_hd', /\.jpe?g$/, () => false, 'phase2_hd (scènes)'], ['assets/scenes_hd', /\.jpe?g$/, () => false, 'scenes_hd'], ['assets/factory_hd_candidats', /\.png$/, b => emb.has(b), 'factory_hd_candidats'],
    ['assets/guide_hd', /\.jpe?g$/, b => emb.has('guide/' + b), 'guide_hd'], ['wall-street-empire/assets/products_hd', /\.jpe?g$/, b => emb.has('products/' + b), 'products_hd']];
  sets.forEach(([d, re, wired, label]) => {
    const p = path.join(REPO, d); if (!fs.existsSync(p)) return;
    fs.readdirSync(p, { withFileTypes: true }).filter(f => f.isFile() && re.test(f.name)).forEach(f => {
      const b = f.name.replace(/\.[^.]+$/, ''), rel = d + '/' + f.name, date = dates[rel] || '', w2 = wired(b); let why = NC[b] || '';
      if (w2) return;
      if (label === 'candidats' || label === 'factory_hd_candidats') { if (fs.existsSync(path.join(REPO, 'assets/factory_hd', f.name))) return; why = why || 'candidat d\'immeuble ou de maison non retenu (aucune copie dans factory_hd)'; }
      else if (label === 'factory_hd/int') why = 'accessoire d\'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine';
      else if (label === 'factory_hd/poses') why = /_(machine|porte_carton)$/.test(b) ? 'pose d\'ouvrier non utilisée (seules marche et debout sont embarquées)' : /employe|ingenieur/.test(b) ? 'personnage de bureau non utilisé par la vue immersive' : why;
      else if (/scènes|scenes_hd/.test(label)) why = 'illustration de scène (Studio R&D, atelier, labo) : jamais chargée par le jeu';
      else if (label === 'guide_hd') why = 'photo sans produit ni bien du même nom';
      if (/^hero_/.test(b)) why = 'source 1920×1080 du visuel de lancement 16:9 (la version 1280×720 est déjà embarquée : products_hd)';
      else if (/^(vitrine_accueil|vue_ville_ensemble)$/.test(b)) why = 'illustration d\'accueil 1920×1080 : aucun écran de départ ne la charge';
      else if (/couture|cuir|maroquinerie|mannequin|portant_vetements|table_de_coupe/.test(b)) why = 'élément d\'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l\'usine';
      else if (/^ouvrier_gilet_/.test(b) && /debout|marche/.test(b)) why = 'pose d\'ouvrier à gilet : le jeu embarque les poses h1-h3 et f1-f3 (marche, debout) seulement';
      out.unwired.push({ dir: label, file: f.name, date, why: why || 'sans emploi connu', recent: date >= '2026-11-18' });
    });
  });
  return out;
}
function ordersReport() {   // fichiers cités dans les commandes numérotées de RETOURS.md et absents du dépôt (chaque fichier est rattaché à la dernière commande qui le cite)
  const idx = new Set();
  const walk = (d, pre) => { if (!fs.existsSync(d)) return; for (const f of fs.readdirSync(d, { withFileTypes: true })) { if (f.isDirectory()) { if (!['ombres', '_apercus'].includes(f.name)) walk(path.join(d, f.name), pre + f.name + '/'); } else if (IMG.test(f.name)) { idx.add(f.name.replace(IMG, '')); idx.add(pre + f.name.replace(IMG, '')); } } };
  ['assets/factory_hd', 'assets/phase2_hd', 'assets/guide_hd', 'assets/scenes_hd', 'assets/factory_hd_candidats', 'wall-street-empire/assets/products_hd'].forEach(d => walk(path.join(REPO, d), ''));
  const STALE = /^(champ_|gisement_(gravier|sable|calcaire)|data_center_campus_panne|fwheat_sol|fcorn_sol|frapeseed_sol|fsugar_sol|fvine_sol|f(cattle|sheep|pig|chicken)_pre|animal_vache_)/;   // noms d'anciennes commandes remplacés depuis (sprites de culture 3×3, ville vivante)
  let cur = null; const last = {};
  RETOURS.split('\n').forEach(l => {
    if (l[0] === '#') { const h = l.match(/(?:COMMANDE|Commande)\s*(?:DE L'INTÉGRATEUR AU PRODUCTEUR )?n°\s*(\d+)(\s*bis)?/i); cur = h ? 'n°' + h[1] + (h[2] ? ' bis' : '') : null; }
    if (!cur) return;
    for (const m of l.matchAll(/`([a-z0-9_\/]+)\.(png|jpg)`/g)) { const n = m[1]; if (!idx.has(n) && !idx.has(n.split('/').pop()) && !STALE.test(n.split('/').pop())) last[n + '.' + m[2]] = cur; }
    if (cur === 'n°17 bis') { const q = l.match(/^\d+\.\s+`([a-z0-9_]+)`/); if (q && !idx.has(q[1])) last[q[1] + '.png'] = cur; }
  });
  const o = {}; Object.keys(last).forEach(n => { (o[last[n]] = o[last[n]] || []).push(n); }); return o;
}

// ---------- 6. Rendu Markdown ----------
// Correctifs sûrs apportés par la passe 101 (texte, nom, enseigne, branchement ; aucune règle d'économie ni d'équilibre touchée)
const FIXED = `- **Guide du fabricant : « ×NaN de volume » sur la fiche de la haute couture (\`couture\`) et du vin de grande réserve (\`grandcru\`)** : un produit jamais lancé a un score négatif et la puissance 0,6 donnait NaN (aussi dans l'écran d'éducation, où \`Math.max(1, NaN)\` restait NaN). \`brandVolX\` renvoie désormais ×1 quand le calcul n'est pas fini ; aucun effet sur les produits lancés.
- **Pharmacie de quartier (service « drugstore ») : nom vide** dans la sélection et le survol, car le sprite dessiné s'appelle \`pharmacie\` et la table des services connaît \`drugstore\` (\`vvSvcName\` ignorait \`VV_SVC_OF\`). Le nom « Pharmacie » s'affiche.
- **Infobulle de survol d'un service de quartier** : elle annonçait « Immeuble de logements », « Maison » ou « Immeuble de bureaux » au lieu du service (boulangerie, café, restaurant, pharmacie, station-service, école…). Elle affiche maintenant le nom du service et sa nature (« Commerce de quartier · Propriétaire : la ville »).
- **Agence immobilière (\`immo\`)** : seul magasin sans enseigne ; elle porte maintenant la plaque « AGENCE IMMOBILIÈRE » (comme les autres commerces).
- **Banc d'audit** : \`window.WSE.aud\` expose en lecture seule les tables internes nécessaires (TOOL_META, PUB, SIGN_FACE, GUIDEHD…) ; \`tools/audit_interieurs.js\` exporte \`BUILD_SRC\` et \`t80_orientation.js\` exporte \`pageMeasure\` pour être réutilisés.
- **Test \`t108_completude\`** : échoue si un produit, un bien, un bâtiment, un équipement public ou un service n'a ni nom, ni description, ni image affichable, ou si une recette cite un intrant inconnu.`;

// ---------- 6. Rendu Markdown (suite) ----------
const SHOW = { img: 1, sprite: 1, inter: 1, menu: 1 };
const cell = (st, col) => st[0] === 'ok' ? (st[1] && SHOW[col] ? st[1] : 'ok') : st[0] === 'na' ? '—' : st[0] === 'w' ? '~ ' + st[1] : '**X** ' + st[1];
const esc = t => String(t).replace(/\|/g, '/').replace(/\n/g, ' ');
function table(rows, cols) {
  const labels = rows[0].lab;
  let h = '| objet | ' + cols.map(c => labels[c] || c).join(' | ') + ' | verdict |\n|' + '---|'.repeat(cols.length + 2) + '\n';
  rows.forEach(r => { h += `| \`${r.k}\` ${esc(r.name)} | ` + cols.map(c => esc(r.c[c] ? cell(r.c[c], c) : '—')).join(' | ') + ` | ${esc(r.v)} |\n`; });
  return h;
}
const COLS = { 'produit': ['nom', 'desc', 'fam', 'gamme', 'prix', 'rec', 'chaine', 'img', 'gly', 'eco', 'vente', 'guide', 'cat'], 'bien': ['nom', 'prix', 'grp', 'couleur', 'img', 'prod', 'usage', 'guide', 'unite', 'cat'],
  'bâtiment': ['nom', 'sub', 'cout', 'emplois', 'entretien', 'emprise', 'palier', 'menu', 'icone', 'bouton', 'survol', 'recette', 'sprite', 'propre', 'ecl', 'ancre', 'enseigne', 'inter', 'guide', 'cat'],
  'équipement public': ['nom', 'txt', 'emprise', 'sprite', 'ecl', 'partage', 'enseigne', 'survol', 'inter'], 'service de quartier': ['nom', 'cls', 'sprite', 'propre', 'enseigne', 'face', 'survol', 'presence'], 'outil': ['nom', 'sub', 'couleur', 'icone', 'menu'], 'ville (PNJ)': ['nom', 'pluriel'] };
const TITLES = { 'produit': 'Produits finis (PRODUCTS)', 'bien': 'Biens, matières et composants (GOODS)', 'bâtiment': 'Bâtiments et équipements constructibles (TYPES)', 'équipement public': 'Équipements publics de la ville, mall et aéroport (PUB)', 'service de quartier': 'Services de la ville vivante (vv.SVC)', 'outil': 'Outils de la barre (TOOL_META)', 'ville (PNJ)': 'Bâtiments de la ville (PNJ)' };

function priorites(R) {   // liste priorisée des manques, du plus visible au plus discret
  const L = [], add = (p, t) => L.push([p, t]); const rowsOf = (g, col, st) => R.rows.filter(r => r.g === g && r.c[col] && r.c[col][0] === st);
  const prodImg = R.rows.filter(r => r.g === 'produit' && r.c.img[0] === 'w'), free = new Set(R.static.prods.filter(p => p.free).map(p => p.k)), p1 = prodImg.filter(r => free.has(r.k));
  if (p1.length) add(1, `${p1.length} produits de la gamme du jour 1 sans vraie photo (${p1.map(r => r.k).join(', ')}) : dessin vectoriel, photo voisine, substituée ou composite (commande n°18 non livrée).`);
  const p2 = prodImg.filter(r => !free.has(r.k)); if (p2.length) add(2, `${p2.length} autres produits en photo provisoire (${p2.map(r => r.k).join(', ')}).`);
  const gi = rowsOf('bien', 'img', 'w'); if (gi.length) add(2, `${gi.length} biens et matières sans vraie photo (${gi.map(r => r.k).join(', ')}) : raisin, maïs, colza, œuf, vin, puces, huiles et composites d'animaux.`);
  const seen = new Set(); rowsOf('bâtiment', 'propre', 'w').forEach(r => { const m = r.c.propre[1].match(/^même sprite que (.*)$/), id = m ? [r.k].concat(m[1].split(', ')).sort().join('+') : r.k; if (seen.has(id)) return; seen.add(id); add(2, m ? `sprite partagé entre bâtiments : ${[r.k].concat(m[1].split(', ')).join(', ')} (images identiques pour des objets différents).` : `bâtiment ${r.k} (${r.name}) : ${r.c.propre[1]}.`); });
  rowsOf('bâtiment', 'sprite', 'w').forEach(r => add(2, `bâtiment ${r.k} (${r.name}) : ${r.c.sprite[1]}, aucun PNG ne le remplace (brico_outillage.png jamais livré).`));
  rowsOf('équipement public', 'partage', 'w').forEach(r => { const m = r.c.partage[1].match(/^même sprite que (.*)$/), id = m ? [r.k].concat(m[1].replace(/mon:/g, '').split(', ')).sort().join('+') : r.k; if (seen.has(id)) return; seen.add(id); add(3, m ? `sprite partagé entre équipements : ${[r.k].concat(m[1].replace(/mon:/g, '').split(', ')).join(', ')}.` : `équipement ${r.k} (${r.name}) : ${r.c.partage[1]}.`); });
  rowsOf('équipement public', 'sprite', 'w').forEach(r => add(3, `équipement ${r.k} (${r.name}) : ${r.c.sprite[1]}.`));
  rowsOf('équipement public', 'enseigne', 'w').forEach(r => add(4, `équipement ${r.k} (${r.name}) : pas d'enseigne de façade.`));
  rowsOf('service de quartier', 'face', 'w').forEach(r => add(4, `service ${r.k} : enseigne en plaque flottante seulement (pas de bandeau peint sur le sprite).`));
  rowsOf('bâtiment', 'ancre', 'w').forEach(r => add(4, `bâtiment ${r.k} : ${r.c.ancre[1]} (sprite agrandi : flou à fort zoom).`));
  const sg = rowsOf('bâtiment', 'sub', 'w'); if (sg.length) add(4, `${sg.length} bâtiments à sous-titre générique ou trop court (${sg.map(r => r.k + ' « ' + r.ent.sub + ' »').join(', ')}) : ils n'expliquent pas le rôle du bâtiment dans l'infobulle de la barre d'outils.`);
  rowsOf('équipement public', 'txt', 'w').forEach(r => add(4, `équipement ${r.k} (${r.name}) : ${r.c.txt[1]}.`));
  const ec = R.rows.filter(r => r.g === 'produit' && r.c.eco[0] === 'w'); if (ec.length) add(4, `${ec.length} produits sans entrées dans NECESS / DEMAND_PC / OBSO / PROD_W (${ec.map(r => r.k).join(', ')}) : le jeu applique des valeurs par défaut (nécessité 50, demande 0,3) ; à renseigner si l'équilibre l'exige (hors périmètre de l'audit).`);
  const nc = R.rows.filter(r => r.c.cat && r.c.cat[0] === 'w'); if (nc.length) add(4, `${nc.length} objets absents de docs/CATALOGUE.md (${nc.slice(0, 12).map(r => r.k).join(', ')}${nc.length > 12 ? '…' : ''}) : régénérer le catalogue.`);
  R.issues.filter(i => i.sev === 'attendu').forEach(i => add(4, `${i.cat} : ${i.txt}`));
  return L.sort((a, b) => a[0] - b[0]);
}

function render(R) {
  const S = R.static, byG = {}; R.rows.forEach(r => { (byG[r.g] = byG[r.g] || []).push(r); });
  const cnt = g => { const L = byG[g] || []; return { n: L.length, ok: L.filter(r => r.level === 'ok').length, w: L.filter(r => r.level === 'attendu').length, x: L.filter(r => r.level === 'bloquant').length }; };
  let md = `# Audit de complétude : produits, biens, bâtiments, équipements et services

Généré par \`tools/audit_completude.js --md\` (rejouable ; code de sortie 1 si une information OBLIGATOIRE manque). Source : le jeu construit (\`city.html\`, lu par le banc \`tools/tests/lib.js\`, aucune lecture à la main), les dossiers \`assets/\`, \`tools/build.py\`, \`docs/CATALOGUE.md\` et \`tools/factory_ai/RETOURS.md\`. Complète \`AUDIT_IMAGES_PRODUITS.md\` (images par clé), \`AUDIT_HD_COUVERTURE.md\` (sprite dessiné par élément) et \`AUDIT_INTERIEURS.md\`.

**Légende des cellules** : \`ok\` = présent ; \`~ texte\` = manque ATTENDU, non bloquant (photo de repli, sprite partagé, enseigne absente…) ; \`**X** texte\` = manque OBLIGATOIRE (nom, description, image affichable, intrant connu, outil de pose, texte « undefined »…) ; \`—\` = sans objet. **Verdict** : OK, ou « manque » suivi des colonnes concernées.

## 1. Synthèse chiffrée

| groupe | objets | complets (OK) | manques attendus | manques obligatoires |
|---|---|---|---|---|
`;
  const T = { n: 0, ok: 0, w: 0, x: 0 };
  Object.keys(TITLES).forEach(g => { const c = cnt(g); if (!c.n) return; T.n += c.n; T.ok += c.ok; T.w += c.w; T.x += c.x; md += `| ${TITLES[g]} | ${c.n} | ${c.ok} | ${c.w} | ${c.x} |\n`; });
  md += `| **Total** | **${T.n}** | **${T.ok}** | **${T.w}** | **${T.x}** |\n\n`;
  const lbl = { photo: 'photos HD propres', subst: 'photo substituée', fill: 'photo voisine', compose: 'composites', vec: 'replis vectoriels', abs: 'catégories abstraites' };
  const pi = {}, gi = {}; S.prods.forEach(p => { const r = R.prodImg[p.k]; pi[r] = (pi[r] || 0) + 1; }); S.goods.forEach(p => { const r = R.prodImg[p.k]; gi[r] = (gi[r] || 0) + 1; });
  md += `- Colonnes contrôlées : ${Object.values(COLS).reduce((a, c) => a + c.length, 0)} sur les 7 groupes ; incohérences transversales relevées : ${R.issues.length} (dont ${R.issues.filter(i => i.sev === 'bloquant').length} obligatoires).
- Images des ${S.prods.length} produits : ${Object.entries(pi).map(([k, v]) => v + ' ' + (lbl[k] || k)).join(', ')}. Des ${S.goods.length} biens : ${Object.entries(gi).map(([k, v]) => v + ' ' + (lbl[k] || k)).join(', ')}.
- Assets : ${R.assets.unwired.length} fichiers image présents mais non embarqués dans \`city.html\` (section 5), dont ${R.assets.unwired.filter(u => u.recent).length} modifiés depuis le 18/11 ; ${Object.values(R.assets.orders).reduce((a, l) => a + l.length, 0)} fichiers cités dans les commandes de \`RETOURS.md\` n'existent pas encore dans le dépôt.
- Ce que l'audit ne mesure pas : la ressemblance d'une photo (voir \`AUDIT_PRODUITS.md\`), la qualité artistique d'un sprite (voir \`REVUE_BATIMENTS.md\`), l'équilibre économique.

## 2. Liste priorisée des manques

`;
  const pr = priorites(R), lab = { 1: 'P1 (vu à chaque partie)', 2: 'P2 (visible, provisoire)', 3: 'P3 (équipements publics, aéroport)', 4: 'P4 (finitions, documents)' };
  [1, 2, 3, 4].forEach(p => { const L = pr.filter(q => q[0] === p); if (L.length) md += `**${lab[p]}**\n\n` + L.map(q => '- ' + q[1]).join('\n') + '\n\n'; });
  md += `## 3. Incohérences transversales

| gravité | contrôle | détail |
|---|---|---|
${R.issues.map(i => `| ${i.sev} | ${esc(i.cat)} | ${esc(i.txt)} |`).join('\n') || '| — | aucune | — |'}

Contrôles sans anomalie : nom en double (produits, biens, bâtiments), intrant ou produit sortant inexistant, produit sans producteur possible (toutes les chaînes remontent à un extracteur, une ferme, une fonderie ou un import), bien sans producteur, bâtiment absent d'un menu de construction, outil sans définition, texte « undefined » / « NaN » / « [object » dans une fiche du Guide, un survol ou une vue intérieure, deux fichiers de photo au contenu identique.

## 4. Corrigé pendant cet audit

${R.fixed || '(voir le journal du commit)'}

## 5. Assets non branchés et commandes non livrées

### 5.1 Fichiers présents mais non embarqués dans le jeu (${R.assets.unwired.length})

| dossier | fichier | dernière modification | raison / emploi possible |
|---|---|---|---|
${R.assets.unwired.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.file.localeCompare(b.file)).map(u => `| ${u.dir} | \`${u.file}\` | ${u.date || 'avant le 18/11'} | ${esc(u.why)} |`).join('\n')}

### 5.2 Fichiers cités dans les commandes de \`tools/factory_ai/RETOURS.md\` et absents du dépôt

Chaque fichier est rattaché à la dernière commande qui le cite. Les besoins NOUVEAUX relevés par cet audit (sprites partagés entre objets différents, sprites trop petits, agence immobilière) forment la **COMMANDE n°21** de \`RETOURS.md\` ; ses fichiers apparaissent ci-dessous tant qu'ils ne sont pas livrés.

| commande | fichiers attendus |
|---|---|
${Object.keys(R.assets.orders).map(k => `| ${k} | ${R.assets.orders[k].map(n => '`' + n + '`').join(', ')} |`).join('\n')}

### 5.3 PNG embarqués mais dessinés par aucun élément de la carte

${R.assets.hdUnused} PNG sont embarqués sans être dessinés par un bâtiment, un service ou un décor de l'inventaire (intérieurs d'usine, marchandises des quais, annexes de ferme, niveaux, anciennes versions remplacées) : la liste raisonnée est dans \`AUDIT_HD_COUVERTURE.md\` (test t99 : aucun sans raison écrite).

## 6. Détail par objet

`;
  Object.keys(TITLES).forEach(g => { const L = byG[g]; if (!L) return; md += `### ${TITLES[g]}\n\n` + table(L, COLS[g]) + '\n'; });
  return md;
}

async function cli() {
  const L = require('./tests/lib.js'), lite = process.argv.includes('--lite'), t0 = Date.now(), R = await run(L, { lite }); await L.closeBrowser();
  if (process.argv.includes('--dump')) fs.writeFileSync(process.argv[process.argv.indexOf('--dump') + 1], JSON.stringify(R, null, 1));
  if (process.argv.includes('--json')) fs.writeFileSync(path.join(__dirname, 'audit_completude.json'), JSON.stringify({ sum: R.sum, rows: R.rows.map(r => ({ g: r.g, k: r.k, name: r.name, level: r.level, v: r.v })), issues: R.issues }, null, 1));
  if (process.argv.includes('--md')) { R.fixed = FIXED; fs.writeFileSync(path.join(ROOT, 'docs', 'AUDIT_COMPLETUDE.md'), render(R)); console.log('écrit docs/AUDIT_COMPLETUDE.md'); }
  const g = {}; R.rows.forEach(r => { g[r.g] = g[r.g] || [0, 0, 0]; g[r.g][r.level === 'ok' ? 0 : r.level === 'attendu' ? 1 : 2]++; });
  Object.keys(g).forEach(k => console.log(k.padEnd(22), 'OK', g[k][0], '· manques attendus', g[k][1], '· obligatoires', g[k][2]));
  R.rows.filter(r => r.level === 'bloquant').forEach(r => console.log('OBLIGATOIRE', r.g, r.k, '->', r.bloq.join(', ')));
  R.issues.filter(i => i.sev === 'bloquant').forEach(i => console.log('OBLIGATOIRE', i.cat, i.txt));
  if (R.errs.length) console.log('erreurs de page', R.errs.slice(0, 3));
  console.log(JSON.stringify(R.sum), ((Date.now() - t0) / 1000).toFixed(0) + ' s');
  process.exit(R.sum.bloquant || R.sum.issuesBloq || R.errs.length ? 1 : 0);
}
module.exports = { run, STATIC, evaluate, ROOT, REPO, render, scanAssets, ordersReport };
if (require.main === module) cli();
