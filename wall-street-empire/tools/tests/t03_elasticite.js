// Élasticité-prix : un prix de rayon +30 % sur un bien de base doit coûter -10 à -25 % de volume à long terme (court terme plus faible).
exports.name = 'Élasticité-prix';
exports.run = async (t, L) => {
  async function vol(mult, cls) {
    const pg = await L.newPage({ wait: 500 }); await L.setup(pg, { cash: 5e10 }); await L.inject(pg);
    const r = await pg.evaluate(({ mult, cls }) => {
      const W = window.WSE, T = window.T; const c = T.inC('s3'); for (let i = 0; i < 8; i++) T.inC('res'); T.stepN(30, true);
      c.pk = {}; c.pk['g_' + cls] = mult; const avg = n => { let u = 0; for (let i = 0; i < n; i++) { T.frz(); c.ci = 0.9; W.step(); u += c.sales['g_' + cls] || 0; } return u / n; };
      const short = avg(10), mid = avg(40), long = avg(80); return { short, mid, long, nan: T.scan().length };
    }, { mult, cls });
    r.pageerrors = pg.errs.length; await pg.context().close(); return r;
  }
  const res = {};
  for (const cls of ['basic', 'std']) {
    const [a, b] = await Promise.all([vol(1, cls), vol(1.3, cls)]);
    const lt = (b.long / a.long - 1) * 100, st = (b.short / a.short - 1) * 100; res[cls] = lt;
    if (cls === 'basic') t.range('prix basic +30 % : volume long terme', lt, -25, -10, ' %');
    t.check(`prix ${cls} +30 % : effet court terme plus faible que long terme`, Math.abs(st) <= Math.abs(lt) + 1, `court ${st.toFixed(1)} %, long ${lt.toFixed(1)} %`);
    t.check(`prix ${cls} : pas de NaN/Infinity, 0 pageerror`, a.nan + b.nan + a.pageerrors + b.pageerrors === 0, '');
  }
  t.check('le bien courant (std) est plus élastique que le bien de base', res.std < res.basic, `std ${res.std.toFixed(1)} % < basic ${res.basic.toFixed(1)} %`);
};
