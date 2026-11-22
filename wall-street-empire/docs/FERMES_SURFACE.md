# Fermes à surface variable (passes 87 et 88)

Retour de Rémy : « on ne cultive pas du blé sur un enclos avec 50 vaches ; il faut des surfaces considérables pour être rentable ».
Une case ≈ 150 m ≈ 2,25 ha (`HA_CASE`).

## Design retenu (passe 87)

- **Ferme = corps de ferme + cases annexées.** On pose le corps de ferme (emprise de base : 3×3 pour une culture, 2×2 pour un élevage),
  puis « Agrandir la ferme » (fiche de la ferme) annexe des rangées entières côté est ou côté sud. Passe 88 : plus aucun plafond (l'ancien 8×8 est supprimé).
  L'ancre ne bouge jamais : sol, liens, fournisseurs et sauvegarde restent attachés à la même case.
- **Prix.** Corps de ferme d'une culture : 45 % de l'ancien prix 3×3 (`FARM_CORPS_K`, entrée en jeu accessible). Case annexée : 80 % de l'ancien prix par case
  (`FARM_CELL_K` : clôtures, drainage, plantation ou cheptel) + le foncier local (même prix que pour poser un bâtiment). Corps d'élevage : prix inchangé.
- **Économie.** Récolte, têtes et recettes ∝ surface (`farmAreaK`). Salaires et entretien : postes de coûts physiques (passe 88, plus bas) ;
  la formule `v·A/B + (eq/B)·(1 − v)` de la passe 87 est retirée.
- **Élevages.** Têtes ∝ pâturage : 2 vaches par case (8 sur le 2×2, 50 sur 25 cases), 22 brebis par case ; porcs et poules (hors-sol) inchangés par case.
- **Panneau.** Bloc « Surface de l'exploitation » : surface (cases, ha, emprise), têtes, EBITDA total et par case, postes de coûts, seuil de rentabilité calculé,
  cours local, choix du nombre de rangées, devis, gain marginal et amortissement, boutons. Le bloc « Ce que la ferme gère / ce que tu optimises » est conservé.
- **Dessin.** Corps de ferme HD dans le coin nord ; cases annexées en champ HD de la culture avec les effets vivants (tiges, rangs, vigne) ou en prairie clôturée
  avec meules de foin ; annexes HD le long de la bande arrière ; bêtes affichées ∝ têtes.
- **Sauvegarde** `wse-city-v8` : champ facultatif `fw: [w, h]` dans les extras de la cellule. Absent = corps de ferme seul (anciennes fermes 3×3 valides) ;
  `fpMigrate` reconnaît une emprise agrandie cohérente et ne la réduit pas. Passe 88 : relue jusqu'au bord de la carte (plus de borne 8).

## Passe 88 : obstacles, fermes de centaines de cases, postes de coûts physiques

Demandes de Rémy : « une option de rachat de bâtiments et de sciage / abattage d'arbres » ; « des fermes de centaines de cases si le fermier le souhaite,
on fait jouer l'économie d'échelle » ; « aucune borne de rendement imposée de manière stalinienne ».

### Obstacles sur la rangée visée (`farmRowEval`, `farmPlanRaw`, `farmGrowExec`)

| Case visée | « Agrandir la ferme » | « Agrandir en rachetant/défrichant » |
|---|---|---|
| Campagne libre, terre agricole | annexée | annexée |
| Arbre isolé (décor) | abattu : 6 000 $ (× inflation), 60 u de bois | idem |
| Forêt de feuillus (tuile `foret_dense`) | bloquant | défrichée : 60 000 $ la case ; 80 % de la réserve sur pied récupérée en bois |
| Forêt de sapins (tuile `foret_sapins`) | bloquant | défrichée : 45 000 $ la case (abattage plus simple) ; 90 % récupérés |
| Forêt appropriée (`d.own`) | bloquant | bloquant |
| Bâtiment de la ville (PNJ) | bloquant | racheté au prix du marché (`buyoutCost` : même prix que l'outil Rachat et `acqPlan`, loyers capitalisés, −8 % Promoteur), rasé (`acqDemolish`), terrain compris |
| Bâtiment à toi | bloquant | démoli sans indemnité (valeur perdue affichée), terrain déjà à toi |
| Bâtiment d'un rival, équipement public, bien invendable 2 ans, siège social | bloquant | bloquant (un rival se négocie : outil Rachat / pose d'un commerce) |
| Route de la ville, ou route qui dessert autre chose | bloquant (tu la déplaces toi-même) | bloquant |
| Route privée de la ferme : route à toi en cul-de-sac (au plus une route voisine hors de la future emprise, aucun autre bâtiment voisin) | bloquant | absorbée en chemin de ferme (0 $) |
| Gisement minier ou énergétique, ville, port, mer, bord de carte, terre d'un rival | bloquant | bloquant |

- Gravats du bâti rasé : `rubbleOf` ; évacuation `rubEvac` comprise dans le devis (0 $ avec ton concasseur), débitée par `rubAdd` (passe 79).
- Bois récupéré : livré dans ton stock (`S.stock.wood`, la matière du camp de bûcherons) dans la limite de la place (`roomFor('wood')`) ; le reste est vendu au cours local
  × 0,85 (`WOOD_SELL`, frais de négoce) et crédité. Le défrichage coûte plus que le bois ne vaut (forêt dense : 60 000 $ contre 3 200 u × 9 $ ≈ 28 800 $) :
  raser une forêt pour son bois ne rapporte rien, le camp de bûcherons reste la façon d'exploiter une forêt.
- Le type de forêt suit la tuile HD dessinée (même tirage `hash(x, y, 3)`).

### Plusieurs rangées, direction, devis, confirmation

- Fiche : « +1 rangée / +5 rangées / +10 rangées / Maximum » (maximum : autant de rangées que le terrain et la trésorerie le permettent) ; un devis global.
- Direction, rangée par rangée : le côté (est ou sud) avec le moins d'obstacles (bâtiment = 3, case de forêt ou route = 1, arbre isolé = 0), puis le côté le plus court
  (la ferme reste ramassée), puis le moins cher.
- **Nord et ouest : non faits.** L'ancre (coin nord du corps de ferme : sol, liens, fournisseurs, sauvegarde, cases `part` à décalage positif) ne bouge jamais ;
  annexer au nord ou à l'ouest exigerait de la déplacer. Une ferme fermée à l'est et au sud ne grandit plus.
- « Agrandir la ferme » : terre libre (et arbres isolés), exécuté au clic (bouton qui affiche le prix). S'il y a des obstacles levables, « Agrandir en rachetant/défrichant »
  ouvre une seule fenêtre (`#acq`) : aménagement, terrain, rachat de N bâtiments (nom, position, prix), défrichement (cases de feuillus, de sapins, arbres),
  route privée absorbée, évacuation des gravats, **total à payer**, bois récupéré (en stock, vendu), net débité, gain d'EBITDA attendu, délai d'amortissement ;
  « Confirmer » ou « Annuler ». Rien n'est exécuté avant « Confirmer ».
- Survol d'un bouton (et fenêtre ouverte) : cases visées en évidence sur la carte (vert : libre ; vert clair : arbre ; orange : forêt ; rouge : bâtiment ; bleu : route privée).
- Paiement : trésorerie contrôlée avant (total brut), une seule opération. Le plan est recalculé à l'exécution ; s'il a changé depuis le devis affiché, rien n'est fait.
  Exécution atomique : une erreur au milieu rétablit grille, gisements, décor, trésorerie, stock, propriétés et gravats. Prix annoncé tenu (arrondis absorbés).
- Pas de pay-to-win : tout se paie en argent du jeu.

**Devis type** (t89, blé 3×3, 2 rangées : forêt dense à l'est puis maison de hameau au sud) : aménagement de 7 cases 2 800 000 $ ; terrain 3 890 $ ;
rachat d'1 bâtiment (maison) 35 770 $ ; défrichement de 2 cases de feuillus 120 000 $ ; évacuation des gravats (260 u) 390 $ ; **total 2 960 050 $** ;
6 400 u de bois livrées en stock (≈ 57 600 $ au cours) ; débité = 2 960 050 $.

### Aucun plafond de taille

`FARM_MAX` ne vaut plus que le côté de la carte (N = 96). Limites naturelles seulement : terre libre, rachetable ou défrichable, trésorerie, bords de la carte, cours local.
Emprise rectangulaire maximale supportée : N × N (grille), sauvegarde `fw` relue jusqu'au bord de la carte, `fpMigrate` et l'audit des emprises acceptent toute
emprise rectangulaire cohérente. La route posée par « Relier » évite les terres d'agrandissement probables (carré max(8, w + 5) × max(8, h + 5) au sud-est).

### Postes de coûts physiques (`farmCosts`, `FARM_COST`)

Unités : u = `T.upkeep / B` (entretien d'une case de référence, par jour, × inflation), j = `T.jobs / B` emplois ; A cases ; d = distance moyenne des cases au centre du corps de ferme.

| Poste | Cultures | Élevages |
|---|---|---|
| Cour (bâtiments, bureau, assurance), fixe | 4,5 u | 4 u |
| Machines : nM = ⌈A / M⌉ jeux, chacun amorti et entretenu | petit matériel M = 25 cases, 4 u ; gros matériel M = 80, 11 u | petit M = 30, 2,5 u ; gros M = 90, 6 u |
| Intrants et entretien des sols, par case | 0,35 u | 0,3 u |
| Carburant et trajets, par case | 0,12 u × (1 + d / 10) | 0,08 u × (1 + d / 10) |
| Équipe de la cour, fixe | 5 j | 4,5 j |
| Conducteurs, par jeu de machines | 2 j | 1 j |
| Ouvriers, par case | 0,55 j (petit matériel), 0,42 j (gros) | 0,45 j / 0,36 j |

La ferme prend le parc le moins coûteux à sa surface (mécanisation choisie, pas imposée). Calibrage : à 9 cases de culture, entretien = 1,43 × `T.upkeep`
(comme la passe 87) ; vers 20 cases, coût par case ≈ celui de la passe 85. Ce qui en sort (blé, ferme carrée) :

| Cases | Entretien / case | Emplois / case | Parc | Trajet moyen |
|---|---|---|---|---|
| 9 | 1,43 u | 1,33 j | 1 petit | 1,1 case |
| 100 | 0,75 u | 0,68 j | 4 petits | 5,8 cases (0,9 km) |
| 196 | 0,77 u | 0,48 j | 3 gros | 8,8 cases |
| 400 | 0,78 u | 0,46 j | 5 gros | 13,4 cases (2 km) |

Les frais fixes se diluent jusqu'à une centaine de cases ; au-delà, le gros matériel économise des ouvriers mais carburant et trajets montent : l'entretien par case
remonte légèrement. Aucun seuil, plafond ni multiplicateur d'échelle n'est codé : le seuil de rentabilité affiché est **calculé** (`farmEcon` : première surface, en grandissant
par le côté le plus court, où l'EBITDA en régime établi devient positif au cours du jour) et n'est jamais imposé. La projection (seuil, gain marginal, amortissement)
utilise la production en régime établi (moyenne annuelle, troupeau complet) : ni la montée en charge d'une ferme neuve ni la saison ne la faussent.

Tests adaptés : t88 ne codait pas de borne de rendement inventée hormis « 64 cases < 2× le rendement d'avant », gardé comme garde-fou ; ses fermes de mesure grandissent
désormais par le côté le plus court (plus de plafond 8×8 pour les arrêter).

### Rentabilité mesurée (t89 : blé, même site 20×20, cours du marché, 40 jours par taille)

| Cases (ha) | EBITDA / an | Marge | $ / case / jour | Cours du blé | Emplois |
|---|---|---|---|---|---|
| 9 (20) | −1 M$ | −7 % | −275 | 6,76 $ | 24 |
| 100 (225) | 31 M$ | 27 % | 860 | 6,00 $ | 136 |
| 196 (441) | 56 M$ | 26 % | 797 | 5,98 $ | 187 |
| 400 (900) | 160 M$ | 32 % | 1 112 | 5,97 $ | 366 |

La saison et la fertilité des nouvelles cases font varier la mesure d'environ ±20 %. Le cours local baisse quand l'offre grandit (6,76 → 6,00 $), puis se cale sur le prix
d'export par le port : au-delà d'une centaine de cases, la ferme devient preneuse de prix ; entrepôts, export et usines de transformation (minoterie, boulangerie) sont la suite
logique pour valoriser davantage. Pas de gain absurde : le rendement par case à 400 cases reste du même ordre qu'à 100 cases (t89 : < 1,6×).

### Rendu des grandes fermes

- Champs annexés dessinés tuile par tuile (seules les cases à l'écran) ; corps de ferme et effets dessinés même quand la case avant de l'emprise est hors écran
  (dernière case visible, `_frv`).
- Effets vivants (tiges au vent, rangs de maïs et de canne, ceps, meules, bêtes) calculés seulement dans la fenêtre visible (`fxWin`) et plafonnés en nombre d'éléments
  dessinés (`FX_CAP` : 3 000 tiges, 1 800 plants en rangs, 3 500 feuilles de vigne, 160 bêtes), éclaircis de façon déterministe (hash) : limite de rendu seulement.
  Places des bêtes calculées une fois par emprise (`HERD_HOME`). Annexes HD : 4 + 1 tous les 90 cases.
- Mesure (t89, rendu logiciel headless, médiane) : ferme de 225 cases à l'écran ≈ 61 / 53 / 42 ms par image (zoom 1 / 0,75 / 0,45) contre 31 / 29 / 28 ms pour
  la même vue sans elle (≈ 100 ms avant le plafond d'effets).

### IA

- Bots (`tools/bot_lib.js`, `farmGrow`) : sans rangée libre, ils peuvent défricher une forêt libre (mode `wood`, bois livré en stock) ; jamais de rachat.
- Rival agriculteur (`growNpcFarm`) : quand plus aucune terre de sa culture ne touche ses fermes, il défriche jusqu'à 4 cases de forêt libre voisine (ni exploitée,
  ni appropriée), dans l'ordre des cases (déterministe, sans tirage).

### Outils

- `tools/tests/t89_fermes_obstacles.js` : rachat, défrichage, devis = débit, trésorerie insuffisante, atomicité, fenêtre, sauvegarde, ferme de ≥ 200 cases, temps d'image,
  postes de coûts, rentabilité par taille, rival.
- `tools/capture_fermes.js <dossier> fwheat --obstacles` : captures avant / après un agrandissement avec rachat et défrichage ; `--size=N` agrandit jusqu'à N cases.

## Limites

- Agrandissement vers l'est et le sud seulement (l'ancre ne bouge pas) ; une ferme bloquée sur ces deux côtés ne grandit plus.
- Seuil et gain marginal affichés au cours du jour ; la baisse du cours quand ton offre grandit n'y est pas comptée (elle l'est dans la mesure).
- Les terrains urbains (zone de la ville) ne redeviennent pas des champs : un immeuble en ville reste bloquant. En campagne il n'y a normalement pas de bâti de la ville :
  le rachat sert surtout pour tes propres bâtiments et le bâti PNJ qui s'y trouverait.
- Les bâtiments d'un rival ne se rachètent pas depuis la fiche de la ferme (négociation avec l'outil Rachat).
- Aucune forêt « protégée » n'existe sur la carte hormis les forêts appropriées (`d.own`) et les terres des rivaux.
- Les annexes sont décoratives (une case chacune) ; elles ne changent pas l'économie.
