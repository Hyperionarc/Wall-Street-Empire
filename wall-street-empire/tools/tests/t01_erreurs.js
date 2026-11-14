// 0 pageerror au chargement, après simulation, et à l'ouverture de tous les bâtiments / écrans ; textes sans NaN/undefined/Infinity/[object et sans montant « /jour » en $.
const L = require('./lib.js');
exports.name = 'Erreurs JS et panneaux';
exports.run = async (t) => {
  // 1. chargement à froid
  let pg = await L.newPage({ wait: 1500 });
  t.check('chargement : 0 pageerror / console.error', pg.errs.length === 0, pg.errs.slice(0, 2).join(' ; '));
  await pg.context().close();

  // 2. tous les bâtiments : construction, 150 jours, ouverture de la fiche, clic sur tous les onglets/boutons, lecture du texte
  pg = await L.newPage({ wait: 1000 }); await L.setup(pg, { caste: 'banquier', cash: 5e9 });
  const made = await pg.evaluate(() => {
    const W = window.WSE, S = W.S, N = W.N; window._m = {}; const keys = Object.keys(W.TYPES).filter(k => k !== 'road' && k !== 'park');
    keys.forEach(k => { try { let c = null; for (let y = 0; y < N && !c; y++) for (let x = 0; x < N && !c; x++) if (!W.footprintError(x, y, k) && W.place(x, y, k)) c = S.grid[y * N + x]; if (c) window._m[k] = [c.x, c.y]; } catch (e) { window._m[k + '_ERR'] = e.message; } });
    for (let i = 0; i < 150; i++) W.step(); return { n: Object.keys(window._m).length, all: keys.length };
  });
  t.check('construction de tous les types de bâtiments', made.n >= made.all - 2, `${made.n}/${made.all}`);
  const keys = Object.keys(await pg.evaluate(() => window._m)).filter(k => !k.endsWith('_ERR'));
  const bad = [], badDay = [];
  for (const k of keys) {
    const pos = await pg.evaluate(k => window._m[k], k); if (!Array.isArray(pos)) continue;
    try {
      await pg.evaluate(p => window.WSE.openBuilding(p[0], p[1]), pos); await pg.waitForTimeout(100);
      const texts = [];
      for (let i = 0; i < 40; i++) {
        const ok = await pg.evaluate(i => { const bs = [...document.querySelectorAll('#bview button')].filter(x => x.offsetParent && !x.disabled && !/Démol|Fermer|Retour|close|sell|Vendre/i.test(x.innerText + (x.dataset.cat || '') + (x.dataset.a || ''))); const x = bs[i]; if (!x) return false; x.click(); return true; }, i);
        if (!ok) break; await pg.waitForTimeout(30);
        if (i % 4 === 0) texts.push(await pg.evaluate(() => document.getElementById('bview').innerText));
      }
      texts.push(await pg.evaluate(() => document.getElementById('bview') ? document.getElementById('bview').innerText : ''));
      for (const txt of texts) {
        if (L.BAD_TXT.test(txt)) { bad.push(k + ': ' + ((txt.match(/.{0,25}(NaN|undefined|Infinity|\[object).{0,25}/) || [''])[0]).replace(/\n/g, ' ')); break; }
        const m = txt.match(L.BAD_DAY); if (m) { badDay.push(k + ': ' + (txt.match(/.{0,30}(?:\$|k\$|M\$|Md\$)\s*\/\s*(?:jour|j)\b/) || [''])[0].replace(/\n/g, ' ')); break; }
      }
      await pg.evaluate(() => window.WSE.closeBuilding && window.WSE.closeBuilding());
    } catch (e) { bad.push(k + ' ERR ' + e.message.slice(0, 100)); }
  }
  t.check(`fiches de ${keys.length} bâtiments : aucun NaN/undefined/Infinity/[object`, bad.length === 0, bad.slice(0, 4).join(' | '));
  t.check('fiches de bâtiments : aucun montant « $ /jour » (mensuel uniquement)', badDay.length === 0, badDay.slice(0, 4).join(' | '));

  // 3. écrans globaux (menu, finances, empire, produits, bourse, objectifs...) après 300 jours
  await pg.evaluate(() => { for (let i = 0; i < 300; i++) window.WSE.step(); });
  const panelTxt = await pg.evaluate(async () => {
    const out = {}; const grab = (n) => { out[n] = [...document.querySelectorAll('#panel, #prodscreen, #term, #hud, #objbar')].map(e => e.innerText).join('\n'); };
    document.getElementById('pn').click(); grab('menu');
    const tabs = [...document.querySelectorAll('#panel [data-tab], #panel .tabs button, #panel nav button, #panel button[role=tab]')];
    for (const b of tabs) { try { b.click(); grab('tab:' + (b.innerText || b.dataset.tab || '').trim().slice(0, 20)); } catch (e) { } }
    document.getElementById('pv').click(); grab('produits');
    try { window.WSE.openTerm(); grab('bourse'); } catch (e) { out.bourseErr = e.message; }
    return out;
  });
  const badPanels = [], badPanelDay = [];
  Object.keys(panelTxt).forEach(k => { const txt = panelTxt[k]; if (typeof txt !== 'string') { badPanels.push(k + ' ' + txt); return; } if (L.BAD_TXT.test(txt)) badPanels.push(k + ': ' + (txt.match(/.{0,25}(NaN|undefined|Infinity|\[object).{0,25}/) || [''])[0].replace(/\n/g, ' ')); if (L.BAD_DAY.test(txt)) badPanelDay.push(k + ': ' + (txt.match(/.{0,30}(?:\$|k\$|M\$|Md\$)\s*\/\s*(?:jour|j)\b/) || [''])[0].replace(/\n/g, ' ')); });
  t.check(`écrans globaux (${Object.keys(panelTxt).length} vues) : aucun NaN/undefined/Infinity/[object`, badPanels.length === 0, badPanels.slice(0, 4).join(' | '));
  t.check('écrans globaux : aucun montant « $ /jour »', badPanelDay.length === 0, badPanelDay.slice(0, 4).join(' | '));
  t.check('après 450 jours et toutes les ouvertures : 0 pageerror', pg.errs.length === 0, pg.errs.slice(0, 3).join(' ; '));
  await pg.context().close();
};
