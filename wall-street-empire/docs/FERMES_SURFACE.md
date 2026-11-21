# Fermes à surface variable (passe 87)

Retour de Rémy : « on ne cultive pas du blé sur un enclos avec 50 vaches ; il faut des surfaces considérables pour être rentable ».
Une case ≈ 150 m ≈ 2,25 ha (`HA_CASE`).

## Design retenu

- **Ferme = corps de ferme + cases annexées.** On pose le corps de ferme (emprise de base : 3×3 pour une culture, 2×2 pour un élevage),
  puis « Agrandir la ferme » (fiche de la ferme) annexe une rangée entière côté est ou côté sud (le côté le plus court d'abord), jusqu'à 8×8 (`FARM_MAX`).
  L'ancre ne bouge jamais : sol, liens, fournisseurs et sauvegarde restent attachés à la même case.
- Une case annexée doit être une terre de campagne libre (pas de route, bâtiment, gisement minier, forêt ni terre d'un rival).
  La route posée par « Relier » évite si possible les terres d'agrandissement (pénalité de chemin sur le carré 8×8 au sud-est).
- **Prix.** Corps de ferme d'une culture : 45 % de l'ancien prix 3×3 (`FARM_CORPS_K`, entrée en jeu accessible). Case annexée : 80 % de l'ancien prix par case
  (`FARM_CELL_K` : clôtures, drainage, plantation ou cheptel) + le foncier local (même prix que pour poser un bâtiment). Corps d'élevage : prix inchangé.
- **Économie.** Récolte, têtes et recettes ∝ surface (`farmAreaK`). Salaires et entretien suivent
  `farmCostK = v·A/B + (eq/B)·(1 − v)` (A cases, B cases de base) : une part fixe (cour, tracteur, grange, salle de traite) et une part par case.
  Cultures : v = 0,65, eq = 20 ; élevages : v = 0,5, eq = 11 (`FARM_ECO`). À A = eq le coût par case est celui de la passe 85 ;
  plus petit, les frais fixes pèsent (EBITDA faible ou négatif) ; plus grand, économies d'échelle, modérées par la baisse du cours local quand l'offre grandit.
  Effectif sous-linéaire (64 cases ≈ 3,8× l'équipe d'un corps de ferme de 9).
- **Élevages.** Têtes ∝ pâturage : 2 vaches par case (8 sur le 2×2, 50 sur 25 cases), 22 brebis par case ; porcs et poules (hors-sol) inchangés par case.
- **Panneau.** Bloc « Surface de l'exploitation » : surface (cases, ha, emprise), têtes, EBITDA total et par case, seuil « rentable à partir de N cases (X ha) »
  calculé aux cours du jour, gain marginal d'une case, devis de la prochaine annexe (aménagement + terrain, amortissement), bouton « Agrandir la ferme ».
  Le bloc « Ce que la ferme gère / ce que tu optimises » (dates imposées) est conservé.
- **Dessin.** Corps de ferme HD dans le coin nord ; cases annexées en champ HD de la culture (blé mûr, parcelles recolorées) avec les effets vivants
  (tiges, rangs, vigne) ou en prairie clôturée avec meules de foin ; annexes HD (granges et silos, chais, étables, bergeries, porcheries, poulaillers)
  le long de la bande arrière (une tous les 12 cases de culture, 8 cases d'élevage, 4 au plus) ; bêtes affichées ∝ têtes.
- **IA.** Un rival agriculteur qui a ses 8 fermes agrandit ses terres (cases voisines de même culture, déterministe, sans tirage) au lieu de « moderniser ».
  Bots (`tools/bot_lib.js`, `farmGrow`) : tout profil agrandit une ferme sous son seuil de rentabilité ou quand une case s'amortit en moins de 500 jours
  (900 pour l'Exploitant agricole), en gardant 2× le devis en trésorerie.
- **Sauvegarde** `wse-city-v8` : champ facultatif `fw: [w, h]` dans les extras de la cellule. Absent = corps de ferme seul (anciennes fermes 3×3 valides) ;
  `fpMigrate` reconnaît une emprise agrandie cohérente et ne la réduit pas.

## Rentabilité par taille

Mesure : `tools/tests/t87_fermes_surface.js` (blé, même site) et banc par type (360 jours, cours du marché). Voir le rapport de la passe 87 pour les chiffres.
Bancs d'extracteurs (`tests/lib.js`, `isoExtractor`) : une ferme est mesurée à sa taille de référence de 36 cases (≈ 80 ha).

## Limites

- Agrandissement vers l'est et le sud seulement (l'ancre ne bouge pas) ; une ferme bloquée sur ces deux côtés ne grandit plus.
- Le seuil affiché suppose le cours du jour ; la baisse du cours quand ton offre grandit n'y est pas comptée (elle l'est dans la mesure).
- Les annexes sont décoratives (une case chacune) ; elles ne changent pas l'économie.
