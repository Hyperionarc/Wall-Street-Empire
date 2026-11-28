// Responsable Mouvements et stationnement (retours de Rémy : « tu peux arrêter de faire rouler des voitures en marche arrière ? », « l'aéroport aussi est
// incohérent : avion qui recule, voiture garée à la perpendiculaire »). L'audit tools/audit_orientation.js compare, pour chaque entité qui bouge, son cap
// de déplacement réel et l'orientation dessinée, et pour chaque entité garée l'axe dessiné et l'axe de sa place.
exports.name = 'Mouvements : aucun véhicule en marche arrière, aucun véhicule garé de travers (passe 121)';
exports.run = async (t, L) => {
  const fs = require('fs'), path = require('path');
  const A = require('../audit_orientation.js'), dir = path.join(process.env.WSE_SHOTS || require('os').tmpdir(), 't121_aeroport');
  const R = await A.run({ captures: dir }), V = R.verdict, P = R.planes, C = R.cars, D = R.drawn || {};
  t.check('avions : jamais de marche arrière (cap dessiné = sens du déplacement, 2 h d\'animation)', P.n > 10000 && P.back === 0, `${P.back} pas à reculons sur ${P.n}${P.ex.length ? ' ex. ' + JSON.stringify(P.ex[0]) : ''}`);
  t.check('avions : cap tangent à la trajectoire (aucun glissement en crabe > 25°, aucun saut de cap)', P.crab === 0 && P.hdJump === 0, `${P.crab} pas en crabe, ${P.hdJump} saut(s), rotation max ${(P.maxTurnRate * 57.3).toFixed(0)}°/s`);
  t.check('avions : atterrissage et décollage dans le même sens de piste (face au vent)', P.wind && P.wind.atterrissage === P.wind.decollage, JSON.stringify(P.wind));
  t.check('avions : fin d\'atterrissage et début de décollage exactement sur le poste (position et cap), avion garé nez vers la piste', P.stands && P.stands.every(s => s.ok), JSON.stringify(P.stands && P.stands.map(s => s.ok)));
  const ad = D['avion'] || { mov: 0, back: 0 };
  t.check('avions dessinés (relevé du rendu) : aucun à reculons', ad.back === 0, `${ad.mov} pas mesurés`);
  const pk = D['aéroport : voiture garée'] || { parked: 0, parkBad: 0, maxPark: 99 };
  t.check('parking de l\'aéroport : chaque voiture garée dans l\'axe de sa place (écart ≤ 20°)', pk.parked > 0 && pk.parkBad === 0, `${pk.parked} relevés, ${pk.parkBad} de travers, écart max ${pk.maxPark}°`);
  const cb = D['aéroport : voie de dépose'] || { mov: 0, back: 0, crab: 0 };
  t.check('voie de dépose de l\'aéroport (taxis, navettes) : ni marche arrière ni crabe', cb.mov > 0 && cb.back === 0 && cb.crab === 0, `${cb.mov} pas, ${cb.back} à reculons, ${cb.crab} en crabe`);
  t.check('voitures de la ville : aucune marche arrière apparente (60 s, virages compris)', C.n > 20000 && C.back === 0, `${C.back} sur ${C.n} pas (${C.turns} en virage)`);
  t.check('voitures de la ville : jamais en travers dans un virage, jamais de saut de voie', C.crab === 0 && C.jump === 0, `${C.crab} en crabe, ${C.jump} sauts (rendu d'avant : ${C.L.jump} sauts) ; ${C.quant || 0} pas où la vue est arrondie à l'un des 4 sens`);
  t.check('navires : proue en avant dans les deux couloirs', R.ships && R.ships.length >= 5 && !V.naviresRecul.length, (R.ships || []).map(s => s.spr.replace('port_', '') + (Math.abs(Math.sin((s.bow - s.mv) / 2)) < 0.1 ? '' : ' RECULE')).join(', '));
  const shots = (R.shots || []).filter(f => fs.existsSync(f) && fs.statSync(f).size > 20000);
  t.check('captures de l\'aéroport produites (3 zooms, parking, décollage et atterrissage)', shots.length >= 12, `${shots.length} fichiers dans ${dir}`);
  t.check('aucune erreur de page', !R.errs.length, R.errs.join(' ; '));
};
