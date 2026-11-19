// Marges par secteur (feuille maîtresse d'équilibrage, passe 16). EBITDA = (CA - intrants - salaires - entretien - fret - pub) / CA, macro figée.
exports.name = 'Marges et rendements';
exports.run = async (t, L) => {
  // Commerce : s1..s4 sur le banc d'une ville (8 logements). Passe 46 (décision du producteur : « arrête de caper les marges ») : plus de borne HAUTE ;
  // la marge de rayon résulte du pouvoir de marché (part face aux rivaux, remplissage des rayons, tools/tests/t45). On garde un plancher de viabilité et l'absence de NaN.
  const r = await L.bench(`B.s1=inC('s1'); B.s2=inC('s2'); B.s3=inC('s3'); B.s4=inC('s4'); for(let i=0;i<8;i++) inC('res'); inP('port');`, 50, 60);
  ['s1', 's2', 's3', 's4'].forEach(k => { const o = r.res[k]; t.check(`${k} : EBITDA ≥ 12 % et fini (plancher, sans plafond)`, !!o && Number.isFinite(o.eb) && Math.round(o.eb * 100) >= 12, o ? `EBITDA ${(o.eb * 100).toFixed(1)} %, MB ${(o.gm * 100).toFixed(0)} %` : 'absent'); });
  t.check('commerce : le luxe (s3, s4) garde une marge brute ≥ à celle du petit marché de base (s1)', r.res.s3 && r.res.s1 && r.res.s3.gm >= r.res.s1.gm - 0.005, `s1 ${(r.res.s1.gm * 100).toFixed(0)} %, s3 ${(r.res.s3.gm * 100).toFixed(0)} %`);
  t.check('commerce : 0 pageerror', r.errs.length === 0, r.errs.slice(0, 2).join(';'));

  // Usines : économie isolée (intrants au prix de base, 100 % d'effectif)
  const F1 = ['steel', 'chem', 'plastic', 'wire', 'plank', 'flour', 'fabric', 'glass'], F2 = ['osb', 'tire', 'motor', 'battery'], PH = ['headache', 'cough', 'obesity'];
  const all = await L.pool([...F1, ...F2, ...PH], 4, k => L.isoFactory(k));
  const by = Object.fromEntries(all.map(a => [a.key, a]));
  // Passe 46 : isoFactory remet le prix de sortie au prix de BASE chaque jour, donc ces mesures valent « marché concurrentiel » (pas de prime de pouvoir de marché).
  // Plus de borne HAUTE (c'était un plafond de marge) : plancher de viabilité et absence de NaN ; l'ordre monopole > duopole > marché saturé est vérifié dans t45 et tools/bench_pouvoir.js.
  F1.forEach(k => t.check(`f1 ${k} : EBITDA concurrentiel ≥ 10 % et fini`, Number.isFinite(by[k].eb) && by[k].eb * 100 >= 10, `${(by[k].eb * 100).toFixed(1)} %`));
  F2.forEach(k => t.check(`f2 ${k} : EBITDA concurrentiel ≥ 10 % et fini`, Number.isFinite(by[k].eb) && by[k].eb * 100 >= 10, `${(by[k].eb * 100).toFixed(1)} %`));
  PH.forEach(k => t.check(`pharma ${k} : marge brute >= 72 %`, by[k].gm >= 0.72, `MB ${(by[k].gm * 100).toFixed(0)} %, EBITDA ${(by[k].eb * 100).toFixed(0)} %`));
  // pharma : le prix suit le pouvoir de marché du princeps (rivaux de la partie) ; plancher 30 % seulement, sans plafond (passe 46)
  PH.forEach(k => t.check(`pharma ${k} : EBITDA ≥ 30 % et fini`, Number.isFinite(by[k].eb) && by[k].eb * 100 >= 29.5, `${(by[k].eb * 100).toFixed(1)} %`));
  t.check('usines isolées : 0 pageerror', all.every(a => a.errs.length === 0), all.flatMap(a => a.errs).slice(0, 2).join(';'));

  // Extracteurs (gisement le plus proche du port) : EBITDA par famille
  const EX = [['well', 'oil', 15, 23], ['mcoal', 'coal', 15, 32], ['miron', 'iron', 40, 62], ['mcopper', 'copper', 40, 62], ['mgold', 'gold', 40, 62], ['qgravel', 'gravel', 17, 35], ['qsand', 'sand', 17, 35], ['qlime', 'limestone', 17, 35], ['logging', 'wood', 17, 35], ['fwheat', 'wheat', 15, 30], ['fsugar', 'sugar', 8, 30], ['fcotton', 'cotton', 15, 30], ['frubber', 'rubber', 15, 30]];
  const ex = await L.pool(EX, 4, e => L.isoExtractor(e[0], e[1]));
  ex.forEach((x, i) => { const [k, , lo, hi] = EX[i]; if (x.none) return t.check(`extracteur ${k} : gisement disponible`, false); t.check(`extracteur ${k} : EBITDA ${lo}-${hi} % et retour <= ${k === 'fsugar' ? '7' : '6'} ans`, x.eb * 100 >= lo && x.eb * 100 <= hi && x.payback <= (k === 'fsugar' ? 7 : 6), `EBITDA ${(x.eb * 100).toFixed(1)} %, retour ${x.payback.toFixed(1)} an`); });
};
