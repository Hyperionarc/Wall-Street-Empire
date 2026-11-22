# Économie libérale : ce qui a changé dans le moteur (lots 0 à 7)

Consigne de Rémy : « Joue à Capitalism Lab, ne régente pas. L'économie la plus libérale possible, la détermination par le marché la plus libre possible.
On peut vendre à perte : le résultat, c'est la faillite. » Plan suivi : docs/AUDIT_MOTEUR_LIBERAL.md (lots 0 → 1 → 2 → 5 partiel → 3 → 4a → 4b → 6 → 7).
Les noms de fonctions et de constantes font foi (les numéros de ligne bougent). Sauvegarde `wse-city-v8` inchangée : seuls des champs facultatifs ont été ajoutés.

## Lot 0 : configuration centrale et garde-fous comptés
- `US_MACRO_CONFIG` (alias `USM`) : toute la fiscalité et le droit du travail en un seul objet.
- `bnd(id, v, lo, hi)` : borne une valeur ET compte chaque contact dans `S._bnd[id] = [appels, en bas, en haut, dernier jour]` (non sauvegardé).
  Les bornes restantes sont des garde-fous techniques très larges (anti-NaN, anti-explosion). `tools/bnd_report.js` les mesure sur des parties de bots ;
  règle : une borne touchée plus de 1 % des appels en partie normale masque un mécanisme.
- `libCheck()` (fin de `step`) : NaN, Infinity, stock négatif, prix nul (`S._lib`) ; relevé de l'oscillation des cours (`S._pxs` : écart-type journalier de log P, dents de scie).
- Export `WSE.lib` (USM, bnd, check, why, whyRaw, mb, hh, season, perish, slm…) pour les tests et les outils.

## Lot 1 : fiscalité américaine fixe, fin des taxes sur le succès
- Impôt sur les sociétés fixe 24 % (fédéral + États) ; le curseur d'impôt n'agit plus (taux affiché, ancien taux sauvegardé lu sans effet).
- Report des pertes illimité, imputable sur 80 % du bénéfice (`lossUse`) ; avant : plafond 50 M$. Même règle par société (`firmTax`).
- Sales tax 6 % : les prix de rayon sont HT pour l'entreprise ; le ménage paie TTC (budget du lot 3). Charges patronales 8 % comprises dans le coût salarial
  (le salaire brut versé aux ménages = coût / 1,08). Relevés : `S.fin.salesTax`, `S.fin.payroll`.
- Droits de douane 4 % + fret (`impRate(ports)` : ×1,30 sans port, ×1,05 avec cinq ports, comme avant mais décomposé). Électricité ×0,85.
- « Surchauffe » supprimée : `stepDifficulty` ne monte plus au-dessus de 0 (plus d'impôt +5 pts, salaires +8 %, plafond de dette −15 %, IA durcies quand on réussit).
  Le coup de pouce à un joueur qui stagne (`S.diff = −1`) reste.

## Lot 2 : marché du travail flexible
- L'effectif d'une usine suit son activité en 1 à 3 jours à la baisse (embauche ≈ 7 jours) ; à l'arrêt, 8 % de maintenance (avant 25 %).
- Indemnité de licenciement ≈ 0,2 mois de salaire par poste supprimé (dans les salaires du jour, `c._sev`, `S._sevD`).
- Salaire de marché à inertie : moyenne mobile de 45 jours de la tension (`S.macro.wm`, champ facultatif), garde-fou 0,5-2,5 (B61).
- Allocataires chômage (`S.macro.ubN`) : chaque nouveau chômeur touche 35 % du salaire, 180 jours au plus. Ils entrent dans le budget des ménages.
- Chômage frictionnel ≥ 3 % gardé comme borne physique comptée (B62).

## Lot 5 (avant le budget) : prix par le marché
- `marketBounds(g)` : `base` = coût marginal domestique (répercussion des intrants SANS borne), `imp` = parité d'importation (prix mondial × droits × fret),
  `wld` = prix mondial ; `fl`/`cap` = garde-fous 0,05 et 20 × la référence. Plus de plancher 0,75/0,86 × base, plus de plancher « intrants + 8 % »,
  plus de plafond 1,6 × base, plus de supercycle administré des matières.
- Formation du cours (section 7 de `step`) : en pénurie le cours monte du coût vers la parité d'import ; l'import plafonne naturellement (`sMin`), même un producteur dominant ;
  en surplus il baisse avec l'excès d'offre (`MKT_EPS` = 2,5, mesuré : rapport 0,5 → ×0,76), soutenu seulement par la parité d'export (ce que paie l'étranger,
  net de la congestion de ses marchés : liquidation à l'étranger). Rapport demande/offre en moyenne mobile ≈ 3 jours, cours ≈ 6 jours ; amortisseur ±10 %/j (garde-fou B44).
- Pouvoir de marché dynamique (`mpGood`) : prime × g(taux d'utilisation des capacités : nulle sous 0,6, pleine au-dessus de 0,9) × h(stock : nulle au-delà de 15 jours de demande).
- Marchandises de rayon : plus de « fournisseurs extérieurs » à 47 % de la demande ; industrie PNJ (`S.macro.nb`) qui suit la demande avec ≈ 30 jours de retard
  et ferme quand le cours passe sous son coût, plus l'import au-dessus de la parité (`impShare`).
- Producteurs PNJ de matières : sous leur coût plus de 14 jours, ils réduisent leur capacité (plancher naturel). Rivaux : bornes de prix élargies (0,4-2,5, garde-fou B52) ;
  un rival à court de trésorerie qui perd ses clients liquide jusqu'à 15 % sous son coût, comme le joueur peut le faire.
- Joueur : prix libres de 5 % à 20 × la référence (`pxFree`, garde-fou contre les fautes de saisie) ; curseurs 20-400 % ; plus de plafond à 150 % sur le basique.
  L'import automatique n'est plus jamais refusé quand la fabrication est déficitaire ; l'auto-production avertit au lieu de suspendre les achats.
  Le COO suit le marché ; il ne refuse de vendre sous le coût que si le joueur a choisi « Ne jamais vendre sous le coût ». Aucune mise en veille automatique du joueur.

## Lot 3 : budget fermé des ménages (en dollars, loi d'Engel)
- `prosp()` (nom gardé pour les services, le crédit et le bilan des synergies) calcule le revenu : masse salariale de la ville + allocations
  + revenus versés par les entreprises (rivaux ≈ 25 % de leur CA : salaires, achats locaux, dividendes ; toi ≈ 6 % hors salaires + dividendes) − impôt sur le revenu 15 % − épargne
  (5 %, plus en chômage élevé, moins en expansion). Indice `b` = budget réel par habitant / référence ; sans plafond.
- `hhDemand` : budget des rayons = `spend0()` × b (κ ≈ 1,3 % du revenu disponible, calibré pour que la demande du jour 0 soit celle d'avant ; même κ pour la ville,
  la ville de 100 000 habitants et le bourg, puisque tout est par habitant). Cascade : basique d'abord (saturation physique, au plus 80 % du budget),
  reste × (0,82 + 0,18 × bonheur/100), partagé entre courant et luxe selon le revenu réel (sigmoïde d'Engel, part du luxe au départ calibrée).
- Courant et luxe : unités = budget / prix moyen RÉELLEMENT payé (`pbar`, pondéré par l'attrait des offres) : un produit cher consomme son vrai prix.
- Logement : saturation par habitant × revenu réel × coût du crédit (garde-fou B4).
- Supprimés : `gMul`, `rwS`, `pxCls`/`PX_EL`, `PX_MAX`, le multiplicateur de chiffre d'affaires des banques (+30 %) et du boom boursier (+25 %).
- Panneau « Pourquoi la demande » (`demandWhyCls`) réécrit en cascade, lisant `S._dw.bud` : revenu → épargne → budget → basique → reste → Engel → prix payés.

## Lot 4a : chaîne B2B réelle
- Demande de matières (`stepLocalMarket`) = plans de production des usines PNJ de la ville (elles fabriquent les marchandises de rayon : `S.macro.nb`, nomenclature
  calibrée une fois, `S.macro.b2bK`) + reconstitution de leur stock tampon (7 jours, rattrapé en 5 : coup de fouet, `npcSup[g].b`) + demande finale directe
  pour l'énergie et les matériaux de chantier (`FDIR`) + usines rivales (`S.rv.inD`) + tes usines. Plus de « population × coefficient » ni de multiplicateur de PIB.
- Chaque acheteur PNJ arbitre local / import au prix livré. Réserve du joueur = 7 jours de sa propre consommation (avant : 750 unités fixes).
- `demandWhyRaw` réécrit : usines clientes, stock tampon, demande finale, rivaux, tes usines, local ou import, concurrence, tes ventes.

## Lot 4b : agriculture saisonnière et périssable
- Récolte saisonnière des cultures (`SEASON` étendu : même production annuelle, pic au mois de récolte du calendrier FCROPS).
- Périssabilité (`PERISH`, `stepPerish`) : lots datés premier entré premier sorti (`S.flots`, champ facultatif) ; blé, maïs, sucre ≈ 1 an, coton 2 ans, lait 5 jours,
  œufs 25, viandes 8-12, raisin 10. Un entrepôt qui stocke le bien (silo, chambre froide) multiplie la durée par 4 pour la part qu'il abrite.
  Un lot près de sa fin est soldé (97 → 40 % du cours, local puis export) ; ce qui périme malgré tout est détruit (perte comptée). Jamais de destruction sans tentative de vente.
- La caste agriculteur garde ses débouchés : demande B2B des usines alimentaires PNJ et des tiennes, parité d'export ; une grande ferme seule qui inonde le marché local
  vend à la parité d'export (EBITDA mince : c'est le marché).

## Lot 6 : partage des rayons et marque
- Exposant de la sensibilité à l'écart de note par classe (`ALPHA`) : basique 2,2, courant 1,6, luxe 0,6 ; dans `c.pw` (partage entre magasins), `attractiveness` et `locAttr`.
- Bonus de gamme `brandBoost` : 1 + 0,17 ln(1 + n produits), sans plafond de 4 produits, dilué par la qualité de la gamme pondérée par le CA (garde-fou B27).

## Lot 7 : validation
- `tools/tests/t97_economie_liberale.js` (365 jours avec bot) : invariants, oscillation (écart-type journalier < 4 %, pas de dents de scie > 8 jours), garde-fous < 1 %,
  cycles, vente à perte possible, budget qui se resserre en récession, vrai prix des produits chers, B2B piloté par les usines (avec coup de fouet), périssabilité, prix libres.
- `tools/bnd_report.js` : rapport des garde-fous et des cours les plus volatils sur des parties de bots (6 castes).

## Tests corrigés (ils encodaient des bornes administrées en propriétés de marché)
| Test | Avant | Maintenant | Pourquoi |
|---|---|---|---|
| t02 extracteurs (cultures) | EBITDA 15-45 % et retour ≤ 6 ans, sur 40 jours | −5 à 45 %, CA désaisonnalisé, sans exigence de retour | sans plancher 0,75 × base, une ferme seule sans industrie aval vend à la parité d'export ; récolte saisonnière |
| t02 puits de pétrole | 15-23 % | 15-26 % | plus de supercycle administré ni de plancher |
| t45 monopole | EBITDA ≥ 40 % | ≥ 30 % | la parité d'importation plafonne naturellement le pouvoir de marché |
| t45 marché saturé | « plancher de viabilité » EBITDA ≥ 3 % | marge mince, entre −20 et 15 % | plus de plancher de marge garanti |
| t24 services publics | neutres à 25 % | neutres au taux fixe de 24 % | fiscalité américaine |
| t70 prospérité | part due aux IA > 2 % au jour 120 | > 0,05 % | le revenu versé par les IA entre au prorata réel de leur CA (budget fermé), plus par un logarithme gonflé |
| t87 sauvegarde | capacité lue avant la croissance du dernier jour | lue après `refreshStats` | la ville grandit plus vite ; mesure comparable au rechargement |
| lib.js `isoExtractor1` | CA brut sur la fenêtre | CA désaisonnalisé (÷ `seasonMult`) | récolte saisonnière |
| t88 rentabilité par taille | recettes brutes, tailles mesurées à des saisons différentes | recettes désaisonnalisées | récolte saisonnière |
| t51 ferme de blé 36 cases | EBITDA ≥ 15 % | ≥ 10 % | cours libre, plus de plancher |
| t30 recettes | EBITDA 10-22 % | 10-24 % | intrants au cours libre |
| t46 pain et commerce en ligne | modèle prospérité^0,6 | basique indépendant du revenu (saturation) | budget fermé |
| t18 marque | bradage sans marque < 0,46 ; hausse de 25 % : écart ≥ 0,05 | < 0,48 ; écart ≥ 0,02 | luxe joué sur la marque (α = 0,6), le prix pèse moins pour tous |
| t66 amortisseur | demande du jour 1 000 u | 100 000 u | l'achat n'a lieu qu'au-delà de 1 000 $ : indépendant du cours du bien |
| t73 fonderies | 20-36 % ; bot fondeur 18-80 % | 20-38 % ; 5-80 % | prime plafonnée par l'import, annulée par un stock dormant |

Échecs constatés aussi sur la branche de départ (non liés au moteur) : t08_chaines (chaîne du pain), t43 (annonce de campagne masquée par une guerre des prix dans le fil),
t44 (encart du mall), t59 (photo porkmeat).

## Calibration (bots, mesures)
- Garde-fous (`tools/bnd_report.js 720 1`, 6 castes) : aucune borne touchée (0,000 % des appels pour B4, B6, B18, B19, B27, B29, B38, B41, B44, B52, B61, B62, PXJ).
  Cours les plus volatils : acier, plastique, cuivre ≈ 0,7 % d'écart-type journalier, plus forte variation 4,8 %/j, dents de scie ≤ 2 jours. Aucun invariant violé.
- A/B fermier (copie de t65, 1 080 j) : avant le lot 138 M$ ; lots 0-6 : 55 M$ (saisonnalité −34 M$, périssabilité −16 M$, marché saturé) ;
  avec des marchés mondiaux profonds pour les denrées (congestion d'export ÷4, `AG_GOODS`) : 119 M$. t65 (équilibre des castes) repasse : agriculteur 0,96, banquier 1,16,
  négociant 0,86, industriel 0,90, promoteur 1,30, innovateur 0,89 de la moyenne géométrique.
- sim_batch `--native --seeds 1 --days 1800` (M$ aux jours 90 / 180 / 360 / 720 / 1 080 / 1 440 / 1 800) : banquier 20/31/56/116/193/352/451, agriculteur 17/28/74/104/76/157/211,
  industriel 15/17/28/52/103/221/288, innovateur 23/33/63/199/301/519/940, négociant 17/24/27/97/215/385/525, promoteur 18/31/19/30/112/113/438 ; villes de 330 000 à 1,2 M d'habitants,
  chômage 4-9 %. Croissance exponentielle, pas d'effondrement systémique, 0 erreur. Avant (1 080 j) : 221, 80, 119, 297, 211, 287 M$ : à 1 080 j les castes restent du même ordre
  de grandeur ; le démarrage (≤ 360 j) est 20 à 40 % plus lent pour l'industriel, l'agriculteur et le négociant (marges de marché plus minces que les anciens planchers).

## Début de partie (amorçage, après la fusion avec ccr-d9ba3623-415kh0)
Consigne permanente « début accueillant », sans plancher administré ni changement des règles de marché. Leviers d'amorçage mesurés (sim_batch `--native`, 2 graines, 360 j) :
- `HH_KAPPA` = 1,45 : budget des rayons calé sur la première année de l'ancienne demande (le supercycle de départ y gonflait le courant et le luxe de ≈ 30 %), pas sur le seul jour 0 ;
- `B2B_K0` = 1,6 : nomenclature des usines PNJ calée sur la première année de l'ancienne demande industrielle (boom de départ et activité des entreprises compris) ; sans lui la demande de matières tombait de 35 % ;
- crédit à la consommation (`hhCredit`, remplace l'ancien multiplicateur de chiffre d'affaires des banques B14) : jusqu'à +30 % de budget avec les banques de la ville, selon le coût du crédit ;
- récoltes étalées : amplitude saisonnière 0,22 (au lieu de 0,6 : les castes qui achètent des fermes perdaient 40 % la première année).
Valeur moyenne à 360 j (M$), branche de départ fusionnée → moteur libéral : banquier 47 → 58, négociant 46 → 46, agriculteur 96 → 93, innovateur 54 → 60, promoteur 37 → 31, industriel 36 → 28.
L'industriel reste ≈ 20 % plus lent au départ : à 100 jours, ses magasins vendent autant d'unités mais avec une part de marché et une marge de rayon plus faibles (la demande, plus forte, est servie par les rivaux),
son EBE plus bas limite son crédit (3 ans d'EBE) ; le multiplicateur B14 n'y est pour rien (mesuré : identique avec ou sans).

## Déterminisme
Trois caches de module étaient indexés sur le seul jour (ou sur une grille précédente) et réutilisés par la partie suivante dans la même page : `compNow` (curseur de concurrence),
`siteIndex` (magasins et extracteurs), le trafic (`trf`, utilisé par la valeur des terrains). Ils sont maintenant liés à la partie (S, S.grid) : t27 repasse.

## Limites connues et suite
- La demande B2B des usines PNJ utilise `LOCAL_D` comme nomenclature calibrée (par bien, pas par recette de panier) ; une vraie nomenclature par classe de panier est la suite logique.
- `rivMkt` (marché élargi par les concurrents) est gardé (effet de variété), il pourrait disparaître si la somme positive tient par le seul budget.
- Calibration des bots : voir la section du rapport de passe (sim_batch `--native`, comparaison avant/après).
