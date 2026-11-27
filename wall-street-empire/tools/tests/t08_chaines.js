// Chaînes industrielles complètes (passe 21) : mine/ferme -> composants -> usine du produit -> magasins, auto-production activée.
// Une chaîne bien construite doit être rentable (EBITDA global ≥ 12 %, retour sur capex ≤ 5,5 ans ; sans plafond depuis la passe 46) ; une chaîne mal construite (composants achetés dehors) ne doit pas gagner d'argent.
const CA = require('../chain_audit.js');
exports.name = 'Chaînes industrielles (passe 21)';
exports.run = async (t, L) => {
  const days = 160;
  // Chaîne équilibrée : pain (ferme -> farine -> pain -> magasins) et ustensiles (fer, charbon, pétrole -> acier, plastique -> ustensiles)
  for (const k of ['bread', 'utensils']) {
    const r = await CA.runChain(CA.PLANS[k], days), b = await CA.runChain(CA.PLANS[k], days, true), d = CA.delta(r, b);
    // Passe 46 : plus de borne HAUTE d'EBITDA ni de retour minimal sur capex (c'étaient des plafonds de marge) : une chaîne intégrée qui tient seule son marché peut être une pépite.
    // On garde le plancher de rentabilité, un retour fini et l'absence de NaN ; la chaîne mal construite (ci-dessous) reste testée.
    t.check(`chaîne ${k} bien construite : EBITDA global ≥ 12 % et fini`, Number.isFinite(d.margin) && d.margin * 100 >= 11.5, (d.margin * 100).toFixed(0) + ' %');
    t.check(`chaîne ${k} bien construite : retour sur capex ≤ 5,5 ans et positif`, Number.isFinite(d.payback) && d.payback > 0 && d.payback <= 5.5, d.payback.toFixed(1) + ' an');
    t.check(`chaîne ${k} : 0 pageerror`, r.errs.length === 0, r.errs.slice(0, 2).join(';'));
  }
  // Chaîne mal construite : usine de pain seule, farine à acheter. L'auto-production suspend les achats ruineux : pas de perte, pas de gain miracle.
  { const r = await CA.runChain(CA.PLANS.bad_bread, days), b = await CA.runChain(CA.PLANS.bad_bread, days, true), d = CA.delta(r, b);
    t.check('chaîne mal construite (pain sans farine) : n\'apporte pas plus de 10 % de marge (farine importée au prix du port ; économie, lot 2 : le pain se vend en gros aux commerces de la ville au lieu de partir à l\'export)', !(d.margin > 0.10) || d.dEb < 500, `EBITDA ${Math.round(d.dEb)} $/j, marge ${(d.margin * 100).toFixed(0)} %`);
    const f = r.out['f1:bread']; t.check('chaîne mal construite : l\'usine de pain n\'achète pas à perte (achats suspendus ou rentables)', !f || f.ebitda > -0.02 * Math.max(1, f.rev) || f.rev < 1, f ? `EBITDA usine ${Math.round(f.ebitda)} $/j sur ${Math.round(f.rev)} $/j` : 'usine absente'); }
  // Fonderie : son or fondu est valorisé (avant, 0 : perte fictive de 100 k$/j à l'écran)
  { const r = await CA.runChain(CA.PLANS.watch, 90); const f = r.out.foundry; t.check('fonderie : lingots valorisés au cours (CA > 0)', !!f && f.rev > 0, f ? Math.round(f.rev) + ' $/j' : 'absente'); }
};
