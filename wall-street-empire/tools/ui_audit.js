// Audit d'interface : ouvre chaque onglet du bureau du PDG, chaque catégorie d'outils, l'usine et le guide à plusieurs tailles d'écran ;
// relève erreurs de page, textes NaN/undefined/[object], textes coupés (scrollWidth > clientWidth), éléments hors écran, boutons sans libellé.
// Usage : NODE_PATH=$(npm root -g) node wall-street-empire/tools/ui_audit.js
const { chromium } = require('playwright'); const path = require('path');
const SIZES = [[1280, 720], [1920, 1080], [390, 844]];
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const [w, h] of SIZES) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = [];
    p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await p.goto('file://' + path.resolve(__dirname, '..', 'city.html')); await p.waitForTimeout(1500);
    await p.evaluate(() => { const W = window.WSE; W.setSpeed(0); W.setCaste('industriel'); W.S.cash = 4e7; ['caste', 'hint', 'endscr', 'modesel'].forEach(i => { const e = document.getElementById(i); if (e) { e.hidden = true; e.style.display = 'none'; } }); });
    const scan = async (label) => {
      const r = await p.evaluate(() => {
        const bad = [], vw = innerWidth, vh = innerHeight;
        const vis = e => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0 && !e.closest('[hidden]'); };
        const txt = document.body.innerText || ''; (txt.match(/NaN|undefined|\[object|Infinity|null\b/g) || []).slice(0, 3).forEach(m => bad.push('texte : ' + m));
        document.querySelectorAll('button,.btn,.tbtn,h2,h3,h4,.finrow span,.finrow b,.rv small,.tcard b,.tcard small,th,td,label').forEach(e => {
          if (!vis(e)) return; const cs = getComputedStyle(e);
          if ((cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) bad.push('coupé : ' + (e.innerText || '').trim().slice(0, 40));
          const r = e.getBoundingClientRect(); const scr = (x => { while (x && x !== document.body) { const o = getComputedStyle(x).overflowX; if ((o === 'auto' || o === 'scroll') && x.scrollWidth > x.clientWidth) return true; x = x.parentElement; } return false; })(e);
          if (!scr && e.matches('button,.btn,.tbtn') && (r.right > vw + 2 || r.left < -2) && r.width < vw) bad.push('hors écran : ' + (e.innerText || e.id || '').trim().slice(0, 30));
          if (e.matches('button,.btn,.tbtn') && !(e.innerText || '').trim() && !e.getAttribute('aria-label') && !e.title && !e.querySelector('svg,img,canvas')) bad.push('bouton sans libellé : ' + (e.id || e.className));
        });
        if (document.documentElement.scrollWidth > vw + 2) bad.push('défilement horizontal de la page : ' + document.documentElement.scrollWidth + ' > ' + vw);
        return bad.slice(0, 14);
      });
      if (r.length) out.push({ size: w + 'x' + h, vue: label, problemes: r });
    };
    await scan('ville');
    await p.evaluate(() => window.WSE.vn.go('fin')).catch(() => {}); await p.waitForTimeout(500);   // passe 103 : le menu vertical remplace le bouton « Menu »
    const tabs = await p.evaluate(() => [...document.querySelectorAll('#panel [data-ptab]')].map(b => b.dataset.ptab));
    for (const t of tabs) { await p.evaluate(t => document.querySelector('#panel [data-ptab="' + t + '"]').click(), t); await p.waitForTimeout(450); await scan('menu:' + t); }
    await p.evaluate(() => { document.querySelector('#panel [data-ptab="fund"]').click(); document.querySelector('[data-fund="debt"]').click(); }); await p.waitForTimeout(400); await scan('menu:fund/debt');
    await p.keyboard.press('Escape'); await p.evaluate(() => { const c = [...document.querySelectorAll('button')].find(b => /Fermer/.test(b.innerText)); if (c) c.click(); }); await p.waitForTimeout(300);
    for (const cat of ['Agriculture', 'Extraction', 'BTP', 'Industrie', 'Commerce', 'Ville']) { await p.getByRole('button', { name: cat, exact: true }).first().click().catch(() => {}); await p.waitForTimeout(300); await scan('outils:' + cat); }
    if (errs.length) out.push({ size: w + 'x' + h, vue: 'erreurs JS', problemes: [...new Set(errs)].slice(0, 6) });
    await p.close();
  }
  await b.close(); console.log(out.length ? JSON.stringify(out, null, 1) : 'aucun problème détecté');
})();
