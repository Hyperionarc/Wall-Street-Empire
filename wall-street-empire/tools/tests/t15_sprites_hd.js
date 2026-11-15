// Sprites HD de l'usine : priorité assets/factory_hd > assets/factory (gabarit) > vectoriel, repli si le PNG HD est illisible, emplacements du lot 2.
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
exports.name = 'Sprites HD : priorité HD > gabarit > vectoriel';
const PNG1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
exports.run = async (t, L) => {
  const root = path.resolve(__dirname, '..', '..'), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wsehd-')), hd = path.join(tmp, 'hd'), out = path.join(tmp, 'city.html');
  fs.mkdirSync(hd);
  fs.writeFileSync(path.join(hd, 'arbre.png'), PNG1);                                   // HD valide (gabarit existe : substitution)
  fs.writeFileSync(path.join(hd, 'buisson.png'), Buffer.from('pas un png'));            // HD illisible -> repli sur le gabarit
  fs.writeFileSync(path.join(hd, 'four_industriel.png'), PNG1);                          // lot 2 : aucun gabarit, aucun vectoriel
  // PNG en palette 256 couleurs (mode P, transparence tRNS) : lecture par build.py et le chargeur, transparence conservée
  const pal = cp.spawnSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nim = Image.new("RGBA", (96, 64), (0, 0, 0, 0))\nfor x in range(32, 64):\n    for y in range(16, 48): im.putpixel((x, y), (200, 40, 40, 255))\nim.quantize(256, method=Image.Quantize.FASTOCTREE).save(sys.argv[1], transparency=0)\nq = Image.open(sys.argv[1]); print(q.mode)', path.join(hd, 'rack_vide.png')], { encoding: 'utf8' });
  fs.writeFileSync(path.join(hd, 'ancres.json'), JSON.stringify({ 'arbre.png': { largeur: 1, hauteur: 1, ancre_x: 0, ancre_y: 1, echelle_px_par_m: 64 }, 'four_industriel.png': { largeur: 1, hauteur: 1, ancre_x: 0, ancre_y: 1, echelle_px_par_m: 64 } }));
  const r = cp.spawnSync('python3', [path.join(root, 'tools', 'build.py')], { env: Object.assign({}, process.env, { WSE_HD_DIR: hd, WSE_OUT: out }), encoding: 'utf8' });
  t.check('la construction avec un dossier HD réussit', r.status === 0 && fs.existsSync(out), (r.stderr || r.stdout || '').slice(-200));
  const pg = await L.newPage({ wait: 300 }); await pg.goto('file://' + out); await pg.waitForTimeout(900);
  const a = await pg.evaluate(() => { const F = window.WSE.fac, g = n => { const e = F.img(n); return e ? { w: e.im.naturalWidth, hd: !!e.hd, fb: !!e.fb, ax: e.a && e.a.ancre_x, ay: e.a && e.a.ancre_y } : null; }; return { arbre: g('arbre'), buisson: g('buisson'), four: g('four_industriel'), rack: g('rack_stockage'), pal: (() => { const e = F.img('rack_vide'); if (!e) return null; const c = document.createElement('canvas'); c.width = e.im.naturalWidth; c.height = e.im.naturalHeight; const x = c.getContext('2d'); x.drawImage(e.im, 0, 0); return { w: c.width, h: c.height, corner: x.getImageData(2, 2, 1, 1).data[3], mid: Array.from(x.getImageData(48, 32, 1, 1).data) }; })(), names: F.FAC_NAMES.length, lot2: F.FAC_NAMES.indexOf('lingots_or') >= 0 && F.FAC_NAMES.indexOf('ouvrier_h1') >= 0 }; });
  t.check('un PNG de assets/factory_hd remplace le gabarit (1 px, ancre du fichier HD)', a.arbre && a.arbre.w === 1 && a.arbre.hd && a.arbre.ay === 1, JSON.stringify(a.arbre));
  t.check('un PNG HD illisible retombe sur le gabarit de assets/factory (image 128 px, ancre du gabarit)', a.buisson && a.buisson.fb && a.buisson.w > 1 && !a.buisson.hd, JSON.stringify(a.buisson));
  t.check('un sprite sans HD garde le gabarit', a.rack && a.rack.w > 1 && !a.rack.hd, JSON.stringify(a.rack));
  t.check('un PNG HD en palette 256 couleurs (mode P + transparence) se lit : taille, fond transparent, couleur conservée', (pal.stdout || '').trim() === 'P' && a.pal && a.pal.w === 96 && a.pal.corner === 0 && a.pal.mid[3] === 255 && a.pal.mid[0] > 150, JSON.stringify(a.pal) + ' ' + (pal.stdout || pal.stderr || '').trim());
  t.check('les emplacements du lot 2 sont reconnus : un PNG HD sans gabarit se charge, les autres restent en vectoriel', a.four && a.four.w === 1 && a.lot2 && a.names > 29, JSON.stringify({ four: a.four, n: a.names }));
  t.check('aucune erreur de page (sprites HD)', pg.errs.length === 0, pg.errs.slice(0, 2).join(' | '));
  await pg.context().close(); fs.rmSync(tmp, { recursive: true, force: true });
};
