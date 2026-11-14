// Marges par secteur (feuille maîtresse d'équilibrage, passe 16). EBITDA = (CA - intrants - salaires - entretien - fret - pub) / CA, macro figée.
exports.name = 'Marges et rendements';
exports.run = async (t, L) => {
  // Commerce : s1..s4 sur le banc d'une ville (8 logements), EBITDA 5-14 %
  const r = await L.bench(`B.s1=inC('s1'); B.s2=inC('s2'); B.s3=inC('s3'); B.s4=inC('s4'); for(let i=0;i<8;i++) inC('res'); inP('port');`, 50, 60);
  ['s1', 's2', 's3', 's4'].forEach(k => { const o = r.res[k]; t.check(`${k} : EBITDA 5-14 % (arrondi à l'unité)`, !!o && Math.round(o.eb * 100) >= 5 && Math.round(o.eb * 100) <= 14, o ? `EBITDA ${(o.eb * 100).toFixed(1)} %, MB ${(o.gm * 100).toFixed(0)} %` : 'absent'); });
  t.check('commerce : 0 pageerror', r.errs.length === 0, r.errs.slice(0, 2).join(';'));

  // Usines : économie isolée (intrants au prix de base, 100 % d'effectif)
  const F1 = ['steel', 'chem', 'plastic', 'wire', 'plank', 'flour', 'fabric', 'glass'], F2 = ['osb', 'tire', 'motor', 'battery'], PH = ['headache', 'cough', 'obesity'];
  const all = await L.pool([...F1, ...F2, ...PH], 4, k => L.isoFactory(k));
  const by = Object.fromEntries(all.map(a => [a.key, a]));
  F1.forEach(k => t.range(`f1 ${k} : EBITDA 10-18 %`, by[k].eb * 100, 10, 18, ' %'));
  F2.forEach(k => t.range(`f2 ${k} : EBITDA 10-18 %`, by[k].eb * 100, 10, 18, ' %'));
  PH.forEach(k => t.check(`pharma ${k} : marge brute >= 72 %`, by[k].gm >= 0.72, `MB ${(by[k].gm * 100).toFixed(0)} %, EBITDA ${(by[k].eb * 100).toFixed(0)} %`));
  PH.forEach(k => t.range(`pharma ${k} : EBITDA 30-45 %`, by[k].eb * 100, 30, 45, ' %', 0));
  t.check('usines isolées : 0 pageerror', all.every(a => a.errs.length === 0), all.flatMap(a => a.errs).slice(0, 2).join(';'));

  // Extracteurs (gisement le plus proche du port) : EBITDA par famille
  const EX = [['well', 'oil', 15, 22], ['mcoal', 'coal', 15, 32], ['miron', 'iron', 40, 62], ['mcopper', 'copper', 40, 62], ['mgold', 'gold', 40, 62], ['qgravel', 'gravel', 17, 35], ['qsand', 'sand', 17, 35], ['qlime', 'limestone', 17, 35], ['logging', 'wood', 17, 35], ['fwheat', 'wheat', 12, 40], ['fsugar', 'sugar', 17, 50], ['fcotton', 'cotton', 12, 35], ['frubber', 'rubber', 17, 50]];
  const ex = await L.pool(EX, 4, e => L.isoExtractor(e[0], e[1]));
  ex.forEach((x, i) => { const [k, , lo, hi] = EX[i]; if (x.none) return t.check(`extracteur ${k} : gisement disponible`, false); t.check(`extracteur ${k} : EBITDA ${lo}-${hi} % et retour <= 3,5 ans`, x.eb * 100 >= lo && x.eb * 100 <= hi && x.payback <= 3.5, `EBITDA ${(x.eb * 100).toFixed(1)} %, retour ${x.payback.toFixed(1)} an`); });
};
