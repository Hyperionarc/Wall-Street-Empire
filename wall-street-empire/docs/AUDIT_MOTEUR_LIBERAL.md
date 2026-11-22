# Audit : vers un moteur économique libéral (étape 1, audit seul)

Demande de Rémy : « économie libérale, pas communiste ». Prix libres, destruction créatrice rapide, marché du travail flexible, fiscalité faible,
concurrence ouverte avec l'importation. Les marges doivent venir **uniquement** des conditions de marché, du rendement de production,
du prix de revient et de l'opex. Rémy a précisé la règle : pas de limite « stalinienne », c'est-à-dire pas de plafond de prix ou de rendement
qui dicte le résultat ; on garde en revanche des **garde-fous** là où il en faut, et on les fixe d'après les simulations.

Ce document est un **audit**. Il ne modifie pas le code du jeu. Base : branche `ccr-d9ba3623-415kh0` (commit 4ef55af, passe 87 des fermes à surface variable).
Les numéros de ligne renvoient à `wall-street-empire/game.template.html` (21 078 lignes) à ce commit. Ils bougeront après la fusion du chantier fermes :
l'implémenteur doit chercher le **nom de la fonction ou de la constante** cité, pas le numéro.

Classement de chaque borne (consigne de Rémy) :
- **A**, à supprimer : règle administrée qui dicte le résultat ;
- **B**, à remplacer par un mécanisme de marché ;
- **C**, à garder comme garde-fou technique ou de stabilité (anti-NaN, division par zéro, explosion numérique, oscillation). On l'élargit jusqu'à ce qu'elle ne se déclenche
  qu'en cas de choc extrême, et un compteur de déclenchements (lot 0) le vérifie.

---

## 1. Cartographie du moteur actuel

### 1.1 Boucle quotidienne `step()` (l. 7451)
Ordre des opérations :
`stepMacro` → extraction (1) → `stepRecycle` → industrie `runRecipe` (2) → commerce (3) → `stepLocalMarket` / `trMarket` / export (4)
→ compte de résultat et impôt (5) → P&L par bâtiment (6) → **formation des prix (7)** → humeur et population (8) → marques et R&D.
Conséquence : le prix d'un jour J est formé **après** les ventes de J, avec les quantités `want`/`made` de J. Les prix servent donc avec un jour de retard,
ce qui stabilise naturellement le modèle. Il faut garder cet ordre.

### 1.2 Demande des ménages (biens de consommation)
| Élément | Où | Formule actuelle |
|---|---|---|
| Coefficients par habitant | `DEM_PER_POP` l. 1761 | basic 0,014 ; std 0,005 ; lux 0,0018 u/j/hab. ; estate 0,00032 (en dur l. 7561) |
| Population efficace | `popE()` l. 3483, `bassin()` l. 3482 | pop × bassin de chalandise |
| Multiplicateur global | `dMul` l. 7557 | `TM.demand × modOf('demand') × easeMult() × shockDemand()` |
| Cycle PIB | `gMul` l. 7558 | `clamp(1 + e·gD, lo, hi)` par classe, avec e = 0,5/1/6/1 |
| Salaire réel | `rwS`, l. 7559-7560 | correctifs bornés de `gMul` (le basique recule, le luxe avance) |
| Prospérité | `prosp()` l. 5175, `pxCls` l. 5186, `PX_EL` | `v = clamp(e·w·f, 0,85, 1,6)`, f = 1 + 0,07·ln(1 + CA de la ville / 250 k$) |
| Bonheur | l. 7561 | std et estate × (0,82 + 0,18 × bonheur/100) |
| Demande de classe | `dem` l. 7561 → `Dc` l. 7597 | `dem × (1 + 0,12·min(4, nProd)) × pfEl × rivMkt` |
| Accessibilité | `affordOf` l. 3397, `reqRW` l. 3396 | volume × (rw/req)^k, au moins 0,1 |
| Élasticité-prix | `elF` l. 2223, `EL_T`, `EL_OUT`, `EL_KNEE`, `EL_TAU` | courbe court/long terme ; luxe « Veblen » jusqu'à +12 % |
| Explication à l'écran | `demandWhyCls` l. 9202 | **recopie** les bornes de `gMul` (tableau `gk`) et le `boost` plafonné à 4 |

Point clé : la demande est en **unités de panier**, pas en valeur. Un produit (smartphone à 780 $, voiture à 900 $) prend une unité de la classe « lux »
(panier de base à 140 $) et la vend à `prodPrice(pk)`. Le budget des ménages n'existe pas : rien ne relie les dépenses au revenu. La part de dépense
en commerce de la ville vaut environ 1,4 $/j/hab., soit à peu près 2 % de la masse salariale (66 $/j/hab. = 120 $ × 0,55).

### 1.3 Partage entre magasins et produits (passe 46, passe 68)
- Magasin : `c._cap`, facteur de demande `df` (l. 7565), panier `SH` par type, `c._lc` borné par `elF` (l. 7569).
- Poids d'un magasin `c.pw` (l. 7573) : `((1 + 0,002·rt) / (pf/pfMean))^1,6 × (1 + 0,06·qual) × deptMult × TM.attract × (0,6 + 0,9·ci) × bq`.
  L'exposant vaut 1,6 pour toutes les classes.
- Produit : `attractiveness(pk)` l. 3378 = `(note/50)^1,6 × brandVolM × …` ; marchandise du marché local `locAttr(cls)` l. 3321 (bornée 0,5-2).
- Rivaux : `rivalAttr` l. 2603, `rivEff`, `rivMkt` (marché élargi, MC_MAX 0,6), `attrDen` (deux bassins), `rivCannib` (0,1 → 0,35).
- Marque : `ps.bc` (capital), `bcSig`, `brandLev`, `brandPrem`, `brandShield`, `shEl` (l. 3240-3265) ; marque d'enseigne `brandOf` l. 6407 ;
  `boost = 1 + 0,12·min(4, nProd)` (l. 7597, recopié l. 9205).
- Marge de rayon : `retailMk(cls) = RETAIL_MK × rvCartelK × rtPow` (l. 3513), où `rtPow` vient de `mpRetail` (l. 2415) et est lissé dans `S._rp` (l. 7652, sauvegardé `rp`).

### 1.4 Matières premières et chaîne B2B
- `stepLocalMarket(made, want)` l. 2246 : pour chaque bien de `LOCAL_D` (l. 2238 et 2241, environ 90 biens, matières, composants et robots) :
  `Dl = LOCAL_D[g] × (rawB2B ou RIV_USE) × popE/10 000 × gdpm × élasticité`. C'est donc **population × coefficient**, pas la consommation réelle des usines.
- Offre PNJ : `S.npcSup[g] = {cap, days, k, hot, cold}` ; offre de base `NPC_IMP` = 0,4 × Dl ; capacité PNJ au plus `NPC_CAP` = 0,3 × Dl, qui croît de 0,4 %/j.
- Les ventes du joueur `S.locSold[g]` se font à 0,97 × cours, sur le stock au-delà d'une réserve fixe de **750 u**.
- Intrants des usines rivales : `S.rv.inD` (calculé dans `fabDay` l. 2999 et `stepRivalsAI` l. 3100). C'est la seule demande B2B **réelle**.
- Usines du joueur : `runRecipe` (l. ~7505). Elles consomment `S.stock` ; leur besoin `want[g] += units × inp[g]` entre dans le rapport demande/offre ;
  l'import automatique est **refusé** si le coût des intrants dépasse 85 % de la valeur de sortie (l. 7516).
- Les fournisseurs nommés (`supplierList` l. 2165) ont une capacité `supCap` égale à cf × 1,5 × la référence `LOCAL_D`.
- Négociant IA : `trMarket` l. 2731, marge `trK` bornée 1,03-1,16, multiplicateur `trM` ; sous-traitant électronique `EMS_*` (l. 2180).
- Fermes : `CROPS`, `LIVE`, `farmAreaK`, `farmCostKA` (l. 1849-1854), `soilMult`, `seasonMult` (`SEASON` : lait, œufs, laine, raisin seulement),
  élevage `liveStep` l. 6450 (aliment, `FEED_FLOOR` 0,35). **Aucune périssabilité** : un stock agricole se garde indéfiniment.
  Les cultures produisent chaque jour (pas de récolte saisonnière, sauf le raisin).

### 1.5 Prix et marges
- `marketBounds(g)` l. 2301 : ancrage `base = G.base × pass × cpi × modOf(px_g) × shockPx × trM × [puces] × [matières : 1 + 3·max(0, gdp − 3 %)]`,
  avec `pass = 1 − inS + inS × clamp(coût intrants / coût de référence, 0,7, 1,5)`.
  Plancher `fl = 0,75 × base` (matières) ou `0,86 × base` (transformés), relevé à `1,08 × coût des intrants / inO` (au plus 1,4 × base).
  Plafond `cap = 1,6 × base × mpM`.
- Formation du cours, section 7 (l. 7766-7775) :
  `ratio = EMA_0,25((want + 1)/(made + 1))`, `f = 1 + 0,30·tanh(0,7(ratio − 1))` en pénurie, sinon `1 − (0,12 ou 0,18)·tanh(1,4(1 − ratio))`.
  Ensuite `nx = p0 + (base·f·mp.m − p0)·0,10`, variation bornée à ±4 %/j (`TR_DCAP`, seulement si le cours reste entre 0,5 et 2 × la référence),
  enfin `clamp(fl, 1,6·base·mp.m)`.
- Pouvoir de marché (passe 46) : `mpGood` (composants : n = 1 + k + 0,5 import, prime `mpPrime`, √couverture), `mpProdOf` (produits finis : `MP_PCLS`
  basic 0,35, std 0,6, lux 0,8), `mpVol` (élasticité de la prime), appel d'air `mpEntry` / `mpProdEntry` (entrée déterministe par hash, sortie après 240 j froids),
  monopole d'innovation `mono*` (l. 2340-2380).
- Prix des produits : `prodPrice = ref × QTIER × ps.pf × cpi × mpProd.m` (l. 3226) ; `stdPrice` (l. 2151) indexé sur le salaire, `wf` borné 0,85-1,25.
- Curseurs : `ps.pf` 0,6-1,6 (COO l. 3361, actions l. 19707) ; prix de rayon `c.pf` 0,7-1,4 (au chargement l. 4642) ; `c.pk` 0,6-2,2 (l. 11742) ;
  loyers 0,6-1,6.
- Rivaux : `rivPrice` l. ~2625, cible `clamp(b·t, 0,7b, 1,3b)`, pas de −3 %/+1,5 % par jour, plancher « jamais sous le coût » sauf en guerre des prix ;
  `rivMr` 0,05-0,4 ; usines `fabPlan` l. 2965, `rivFabDecide` (mise en sommeil après 60 j de marge sous le négoce : **une veille existe déjà côté IA**).

### 1.6 Importations, export et stocks
- Import des usines : `impR = max(1,05, 1,3 − 0,05·ports) × TM.buy × modOf('buy')` (l. 7513 ; même formule pour l'aliment du bétail, l. 6460),
  au prix `S.price[g] / mpM(g)`, avec un fret de 0,4 % par case de distance.
- Import des rayons : `PNJ_MK` = 1,05 × cours (l. 3487).
- « Fournisseurs extérieurs » (l. 7634) : `want[cls] += 0,5·dem ; made[cls] += 0,47·dem`. C'est une offre administrée qui empêche toute pénurie durable.
- Export du surplus (l. 7663-7671) : `expRate = min(0,95, (0,82 + 0,04·ports) × TM.export)` ; demande étrangère `max(4 000, LOCAL_D·4·popE/1e5)`,
  congestion `EXP_CONG` ; débit du port `30 000 × (1 + 2,5·ports)` ; seuil d'export `max(7 500, 0,5·capFor)`.
  Produits finis : au-delà de `prodRoom` (15 jours de ventes, `PROD_COVER`), export à expRate − 0,1 (l. 7673).
  **Une liquidation existe donc déjà** : le surplus part à l'export avec une décote.
- Capacité de stockage : `STOCK_CAP` 15 000 (+ 20 000 par port) et entrepôts (`capFor`, `roomFor` l. 5270) ; une usine s'arrête quand son stock est plein (`_full`).

### 1.7 Salaires et emploi
- Salaire : `c.wages = jobsOf × crewWage × sectWage × fill × WAGE_RATE(120) × wageMkt × diffMult × wageOf.m × TM.wage × modOf × cpi × znWm` (l. 7701).
- `wageMkt` l. 5164 : `clamp(1 + 1,5·(0,125 − chômage), 0,8, 1,4)` ; `diffMult` = 1 + 8 % par niveau de surchauffe.
- Effectif : `fillOf = clamp(STAFF × attrait du salaire, 0, 1)` ; `actF = 0,25 + 0,75·actOf` (EMA de 0,05/j sur l'utilisation, l. 6683-6684).
  Les licenciements sont donc lents (demi-vie d'environ 14 j), gratuits, et il reste au moins 25 % de l'effectif.
- Chômage : `unempTarget` l. 6041 (NAIRU, cycle, manque de postes), lissé à 0,1, **plancher 3 %** (l. 7471). Pas d'allocations chômage.
- Salaire réel `S.rw` (l. 6077) : courbe de Phillips, borné 0,7-3.

### 1.8 Fiscalité actuelle
- Impôt sur les sociétés : `S.tax` vaut 25 % par défaut et **le joueur le règle de 5 à 45 %** (curseur `#tax`, l. 1368, l. 15621), plus `regTax()` (+5 pts par niveau de surchauffe).
  Report de pertes `S.lossC` **plafonné à 50 M$** (l. 7723 et 7107). Intégration fiscale des filiales : `firmTax`.
- L'impôt agit sur la ville : `taxSvc` (humeur, au plus +6), `taxDrag` (population −60 % de l'écart au-dessus de 25 %).
- Aucune sales tax, aucune charge patronale explicite, aucun droit de douane (l'import paie une majoration de port de 5 à 30 %), aucune allocation chômage.
- `stepDifficulty` (l. ~6094) : si la valeur du joueur dépasse 1,5, 2,2 ou 3,2 × la trajectoire attendue, `S.diff` vaut 1, 2 ou 3. Effets : impôt +5 pts,
  salaires +8 %, plafond de dette −15 %, IA et événements plus agressifs. **C'est une taxe sur le succès** ; voir les bornes B65, B68 et B72.

### 1.9 Multiplicateurs « hors marché »
- `mult = 1 + min(0,3, 0,1·banques) + boom(0,25)` (l. 7475). Il multiplie **tout le CA du commerce et de l'export** (l. 7709) sans aucune contrepartie de demande.
- `S.fix1` (remise à niveau, ancienne sauvegarde seulement) : hors sujet.

---

## 2. Inventaire des bornes administrées

Colonnes : identifiant, lieu, valeur, justification probable, **classe** (A, B ou C), remplacement proposé.
Pour les bornes de classe C : la valeur élargie proposée, vérifiée par le compteur `BND` du lot 0. La cible est moins de 0,1 % des jours en partie normale,
et seulement sous choc (pandémie, crise de l'énergie).

### 2.1 Demande des ménages
| # | Lieu | Valeur actuelle | Justification probable | Cl. | Remplacement |
|---|---|---|---|---|---|
| B1 | `gMul.basic` l. 7558 | clamp 0,95-1,05 | le basique varie peu avec le PIB | A | budget fermé (lot 3) : la saturation physique rend le basique inélastique sans borne |
| B2 | `gMul.std` | 0,9-1,1 | | A | budget : résiduel discrétionnaire |
| B3 | `gMul.lux` | 0,7-1,4 (élasticité 6) | luxe très cyclique | A | budget : la part luxe suit le revenu par habitant et le bonheur |
| B4 | `gMul.estate` | 0,9-1,1 × clamp(1 − 4·rateGap, 0,8, 1,12) | crédit immobilier | B | budget logement + coût du crédit (mensualité / revenu) |
| B5 | `rwS` l. 7560 | basique 0,85-1,05 ; std 0,85-1,4 ; luxe 0,6-1,6 | effet d'Engel | A | loi d'Engel dans le budget (lot 3) |
| B6 | `prosp()` e, w l. 5182 | 0,92-1,08 ; 0,92-1,12 | stabilité | B | revenu réel (masse salariale, dividendes, allocations) dans le budget |
| B7 | `prosp().v` | 0,85-**1,6** (`PX_MAX`) | « on ne consomme pas à l'infini » | A | la saturation par habitant (basique, logement) remplace le plafond ; le discrétionnaire est borné par le revenu, pas par une constante |
| B8 | `PX_EL` | 0,6/1/1,4 | élasticité-revenu | B | découle du budget (Engel) |
| B9 | `DEM_PER_POP` | 0,014/0,005/0,0018 | calibration | B | basique et logement deviennent des **saturations physiques** (q*/hab.) ; std et lux deviennent des parts du résiduel |
| B10 | bonheur 0,82 + 0,18·h/100 | std et estate seulement | | B | appliqué au résiduel discrétionnaire, comme le demande la spécification |
| B11 | `affordOf` plancher 0,1 | anti-zéro | | C | garder 0,02 et compter |
| B12 | `shockDemand` 0,6-1,2 | pandémie | | C | garder (choc exogène), compter |
| B13 | `easeMult` ×1,1 quand `S.diff < 0` | aide aux débutants | | B | à remplacer par l'accueil de début de partie (voir la question 3) |
| B14 | `mult` banques + boom, l. 7475 | +30 % et +25 % de CA | « la banque fait tourner l'économie » | **A** | supprimer ; le crédit passe par le budget (épargne négative, crédit à la consommation), le boom par le PIB |

### 2.2 Partage entre magasins et marques
| # | Lieu | Valeur | Justif. | Cl. | Remplacement |
|---|---|---|---|---|---|
| B15 | `boost` l. 7597 et 9205 | 1 + 0,12·**min(4, n)** | l'offre crée sa demande | B | `1 + k·ln(1 + n)` avec k ≈ 0,17 (n = 1 donne +11,8 %, presque comme aujourd'hui ; n = 10 donne +41 %) **et** dilution de la qualité (lot 6) |
| B16 | `c.pw` exposant 1,6 | toutes classes | | B | α par classe : basic 2,2, std 1,6, lux 0,6 |
| B17 | `attractiveness` (note/50)^1,6 | | | B | même α par classe (cohérence magasin et produit) |
| B18 | `locAttr` 0,5-2 | marque blanche | | C | élargir à 0,2-5, compter |
| B19 | `df` 0,1-1 (l. 7565) ; `elF` par magasin 0,05-1,15 (l. 7569) ; `pfEl` 0,5-1,6 (l. 7597) ; `need` 0,3-1,8 (0,02 pharmacie, l. 7609) | anti-explosion | | C | élargir (`pfEl` 0,2-3, `need` 0,05-3) ; ces clamps cachent l'élasticité réelle : à mesurer |
| B20 | `rivMkt` `MC_MAX` 0,6 | marché élargi borné (t70) | | B | l'offre des rivaux augmente le budget **via leurs salaires et dividendes** (budget fermé) au lieu d'une prime de demande ; garder MC_MAX en C le temps de calibrer |
| B21 | `rivCannib` 0,1-0,35 | accueil du débutant | | B | concurrence croissante avec le palier (contrainte permanente) ; à garder tant que le palier l'exige, documenté comme règle de jeu |
| B22 | `RETAIL_MK` 1,76/1,82/2,3 | marges de distribution réelles | | B | prix de rayon = coût de gros × (1 + marge du pouvoir de marché `rtPow`) ; la marge résulte du curseur `pf` et de la concurrence |
| B23 | `mpRetail` `RP_R`, `RP_REF`, `RP_SAT` ; `rpSan` 0,2-5 | pouvoir de marché du rayon | | B/C | indexer sur l'utilisation et le ratio stock/ventes (lot 5) ; `rpSan` reste en C |
| B24 | `rvCartelK` ×1,08 | entente acceptée | | B | l'entente fait monter le prix via le `pf` des rivaux ; la prime fixe disparaît |
| B25 | Curseurs `ps.pf` 0,6-1,6, `c.pf` 0,7-1,4, `c.pk` 0,6-2,2 | interface | | **A** (libre fixation des prix) | élargir à 0,25-4 (C, contre les fautes de saisie), sans plafond économique : l'élasticité punit seule un prix absurde |
| B26 | `bq` 0,8-1,2 ; `rt`, `loy`, `aw`, `bc` 0-100 (600) | échelles de notes | | C | garder (ce sont des échelles, pas des prix) |
| B27 | `corpLoyF` ≥ 0,6/0,8 | dilution de marque | | B | remplacée par la dilution pondérée par le CA (lot 6) |

### 2.3 Chaîne B2B, matières et agriculture
| # | Lieu | Valeur | Justif. | Cl. | Remplacement |
|---|---|---|---|---|---|
| B28 | `LOCAL_D × popE/10 000` (l. 2251) | demande industrielle par habitant | substitut d'industrie PNJ | **B** (cœur du lot 4) | demande = plans de production réels (joueur + rivaux + PNJ aval) + reconstitution d'un stock tampon de 7 j + consommation finale directe (carburant, bois de chauffage, matériaux de construction liés aux chantiers) |
| B29 | `gdpm` 0,8-1,5 ; élasticité 0,4-1,8 (l. 2251 et `demandWhyRaw` 9191) | | | A/C | le cycle passe par la production aval ; élasticité de substitution gardée, clamp élargi 0,1-4 en C |
| B30 | `NPC_IMP` 0,4, `NPC_CAP` 0,3, croissance 0,4 %/j, entrée par `rnd()` | offre PNJ | | B | les PNJ deviennent des producteurs avec une capacité, un coût unitaire (`RES_COST × base`) et une veille ; l'import élastique ferme le marché (lot 5) |
| B31 | réserve fixe de 750 u (l. 2260, `demandWhyRaw`) | stock de sécurité | | B | réserve = stock tampon cible (7 j de consommation propre), réglable par le joueur |
| B32 | vente locale à 0,97 × cours | frais de négoce | | C | à garder comme coût de transaction, ou à remplacer par le fret |
| B33 | `RAW_B2B`, `RIV_USE`, `svcB2B` (0-1,5, 5 rivaux) | demande d'affaires | | B | remplacés par les achats réels des usines et services rivaux ; `svcB2B` reste pour les **services** (banque, bureaux) |
| B34 | import auto refusé si intrants > 85 % de la valeur produite (l. 7516) | protéger le joueur | | **A** | supprimer ; la veille économique (lot 5) arrête l'usine sur un signal de **coût variable**, pas sur un seuil fixe |
| B35 | `supCap` = cf × 1,5 × LOCAL_D | capacité des fournisseurs | | B | capacité = production réelle du fournisseur (PNJ, rival ou négociant) |
| B36 | « fournisseurs extérieurs » 0,47/0,5 × dem (l. 7634) | pas de pénurie permanente | | **B** | import élastique des marchandises de rayon au prix livré (lot 5) : la pénurie fait monter le prix jusqu'à la parité import, puis l'import comble |
| B37 | Fermes : aucune périssabilité ; récolte quotidienne | simplicité | | B | lots datés, liquidation avant péremption, récolte saisonnière (lot 4b) |
| B37bis | `FEED_FLOOR` 0,35 | un troupeau sans aliment produit encore 35 % | | B/C | pâturage : garder 0,35 pour les ruminants (herbe), 0 pour porcs et volailles |

### 2.4 Prix et marges
| # | Lieu | Valeur | Justif. | Cl. | Remplacement |
|---|---|---|---|---|---|
| B38 | `marketBounds` plancher 0,75/0,86 × base | prix jamais nul | | **A** | plancher naturel : liquidation (vente à perte si stock > 15 j) + veille (14 j sous le coût variable) ; garde-fou C à 0,05 × base |
| B39 | plancher `1,08 × coût intrants / inO` | « un transformé ne se vend jamais sous ses intrants + 8 % » | | **A** | c'est la règle stalinienne la plus forte : la marge minimale est garantie. Le prix peut tomber sous le coût, les producteurs passent en veille, l'offre baisse, le prix remonte |
| B40 | plafond `1,6 × base × mpM` | anti-flambée | | **B** | plafond naturel = parité import `P_imp = base × cpi × (1 + droit + fret)` avec une part d'import sigmoïde ; garde-fou C à 8 × base |
| B41 | `pass` clamp 0,7-1,5 | répercussion des intrants | | B | l'ancrage disparaît : le prix vient du coût marginal local, de la parité import et du rapport offre/demande |
| B42 | `f` tanh +30 % / −12 % / −18 % | courbe offre/demande douce | | B | f garde sa forme, mais sans amplitude administrée : `P* = coût marginal × (1 + markup)` en équilibre, et la pénurie pousse vers P_imp |
| B43 | lissage du cours 0,10/j ; EMA du ratio 0,25 | stabilité | | C | EMA de 5 à 7 j (α ≈ 0,15-0,2) comme le veut la spécification ; à valider par la mesure d'oscillation |
| B44 | `TR_DCAP` ±4 %/j (entre 0,5 et 2 × la référence) | amortisseur (t66) | | C | élargir à ±10 %/j, compter ; sans effet sur les manipulations extrêmes (déjà exclues) |
| B45 | matières × (1 + 3·max(0, gdp − 3 %)) | supercycle des matières | | B | vient de la demande aval réelle |
| B46 | `mpGood` : `MP_S0` 0,10, `MP_IMP` 0,5, √cov, `mpPg` 0,7/0,9/1,25 | pouvoir de marché | | B | markup = f(taux d'utilisation des capacités du secteur, stock/ventes, nombre effectif de vendeurs) ; l'appel d'air `mpEntry` est déjà un mécanisme de marché : **à garder** |
| B47 | `MP_KMAX` 6 entrants | anti-saturation | | C | à garder (au-delà, l'effet de la prime est négligeable) |
| B48 | `MP_PCLS` basic 0,35, std 0,6, lux 0,8 | prime maximale par classe | | B | prime issue de l'élasticité de la classe (règle de Lerner : markup = 1/(ε − 1)) et du nombre de vendeurs |
| B49 | `monoXP` volume ≤ 4 × ventes locales | export du monopole | | C | garder (demande mondiale finie), documenter |
| B50 | `stdPrice` `wf` 0,85-1,25 ; `rdPrem` ≤ 8 % | indexation sur le salaire | | B | le prix standard suit le coût (salaires et intrants) sans borne |
| B51 | `trK` 1,03-1,16 ; `trM` épisodes | marge du négociant | | B/C | marge selon le stock et la pénurie (déjà de marché), bornes élargies à 1,0-1,4 en C |
| B52 | `rivPrice` 0,7-1,3 × b, pas −3 %/+1,5 % ; `rivMr` 0,05-0,4 ; guerre 10-25 % ; `seatOrder` 0,6-1,6 | IA | | B/C | les IA fixent leur prix sur leur **coût réel** (`r.cb`) + leur markup de marché ; garder les pas journaliers en C ; bornes élargies à 0,4-2,5 |
| B53 | `foreign` dumping ×0,82 / pénurie ×1,22 | événements | | C | à garder comme chocs exogènes ; avec P_imp, ils jouent sur le prix mondial plutôt que sur le cours local |
| B54 | `SC_PREM` contrat d'approvisionnement cours + 6 % | t70 | | B | négocié (stock du négociant et pénurie) |

### 2.5 Imports, export, stocks
| # | Lieu | Valeur | Justif. | Cl. | Remplacement |
|---|---|---|---|---|---|
| B55 | `impR` 1,05-1,3 selon les ports | majoration de port | | B | `P_imp = P_monde × (1 + droit 3-5 %) × (1 + fret)`, fret = coût par distance ou délai (`TRANS`) ; les ports réduisent le fret, pas un multiplicateur fixe |
| B56 | `PNJ_MK` 1,05 | grossiste | | B | même P_imp, avec la marge du grossiste (pouvoir de marché) |
| B57 | `EXP_BASE` 0,82, +0,04/port, max 0,95 ; `EXP_CONG` ; demande étrangère ≥ 4 000 | export | | B/C | export = P_monde × (1 − fret − droit étranger) ; demande étrangère élastique (sigmoïde), plancher 4 000 en C |
| B58 | débit du port `30 000 × (1 + 2,5·ports)` | capacité physique | | C (physique) | à garder |
| B59 | seuil d'export `max(7 500, 0,5·capFor)` ; `PROD_COVER` 15 j | stock dormant | | B | liquidation : au-delà de 15 j de ventes, prix de vente réduit (local d'abord, export ensuite) |
| B60 | `STOCK_CAP`, `roomFor` (`_full`) | capacité physique | | C (physique) | à garder ; c'est un vrai coût de stockage |

### 2.6 Salaires et emploi
| # | Lieu | Valeur | Justif. | Cl. | Remplacement |
|---|---|---|---|---|---|
| B61 | `wageMkt` 0,8-1,4 | tension du marché du travail | | B/C | salaire de marché = EMA de 30-60 j de la tension (inertie), bornes élargies à 0,5-2,5 en C |
| B62 | chômage plancher 3 % (l. 7471), `unempTarget` 0,03-0,14 / 0,03-0,95 | chômage frictionnel | | C | t25 exige ≥ 3 % : garder 2-3 % comme borne physique (frictions), compter |
| B63 | `S.rw` 0,7-3 | salaire réel | | C | élargir à 0,4-6 |
| B64 | `actF` plancher 25 %, EMA 0,05 | effectif d'une usine vide | | B | usine en veille : effectif minimal de maintenance (5-10 %), licenciement en 1-3 j avec un coût de 0,2 mois de salaire par poste supprimé |
| B65 | `diffMult` +8 %/niveau | surchauffe | | **A** | supprimer (taxe sur le succès) |
| B66 | `deptMult` 0,55-1,3 ; `crewWage` | organisation | | C | à garder (rendement interne, pas un prix) |

### 2.7 Fiscalité et macroéconomie
| # | Lieu | Valeur | Justif. | Cl. | Remplacement |
|---|---|---|---|---|---|
| B67 | `S.tax` curseur 5-45 % ; défaut 25 % | le joueur est aussi maire | | B | `US_MACRO_CONFIG.corpTax` = 24 % (voir la question 4) |
| B68 | `regTax` +5 pts/niveau ; `REG_DEBT` −15 % | surchauffe | | **A** | supprimer |
| B69 | `S.lossC` ≤ 50 M$ | | | **A** | report illimité (régime fédéral : imputable sur 80 % du bénéfice) |
| B70 | `taxDrag` (au-delà de 25 %), `taxSvc` ≤ +6 | | | B | conservés tels quels si le taux est fixe ; les recettes de sales tax et d'IS financent les services publics |
| B71 | macro : `gdp` −8 % à +6/7 %, inflation −1 % à 12 %, taux 0,5-14 %, `m.v1`, `m.amp`, NAIRU 3,5-7 % | stabilité du cycle (t25) | | C | à garder (bornes du modèle exogène), compter |
| B72 | `stepDifficulty` dans son ensemble (`S.diff` 1-3) | rubber band | | **A** pour la partie punitive | garder seulement `S.diff = −1` (aide quand le joueur stagne) ou le remplacer par l'accueil de début ; question 3 |
| B73 | humeur `moodTarget` (composantes bornées), `happy` 0-100, population `clamp(1 − 0,8·rateGap, 0,95, 1,04)` | humeur | | C | à garder |

### 2.8 Ce qui est déjà « libéral » et doit rester
- Appel d'air et sortie des concurrents (`mpEntry`, `mpProdEntry`, sortie après 240 j froids) : la destruction créatrice existe déjà ; il faut seulement l'accélérer.
- Mise en sommeil et réouverture des usines IA (`rivFabDecide`), faillites des IA endettées (`rivCanBorrow`, refus de reconduction), restructuration des enseignes.
- Négociant amortisseur (`trMarket`), qui achète dans le surplus et revend dans la pénurie.
- Export du surplus, qui sert déjà d'exutoire de liquidation.
- Monopole d'innovation temporaire, érodé par les copies.

---

## 3. Risques d'effets de bord

### 3.1 Interface
- `demandWhyCls` (l. 9202) **recopie** les bornes de `gMul` (tableau `gk`) et `min(4, nProd)`. Il faut le réécrire **dans le même lot** que la demande,
  en lisant les valeurs dans `S._dw` (budget, saturation, résiduel) plutôt qu'en les recalculant. Sinon l'écran ment.
- `demandWhyRaw` (l. 9190) duplique la formule de `stepLocalMarket` (LOCAL_D, gdpm, réserve de 750). Réécriture obligatoire au lot 4 :
  « Ta demande = besoins des usines clientes (liste) + stock tampon + consommation finale ».
- `renderMarketDet` affiche « Prix unique du marché fl – cap » (l. 9226) : il faudra afficher « parité import » et « coût variable des producteurs ».
- Bureau de l'usine (`S._lm`, `S._dw.pd`, `S._dw.pc`), Mall (`S.mkt`), guides et pédagogie (t43), `mpTxt`, `monoTxt`, `taxrow` (curseur d'impôt), bandeau de surchauffe.
- Les textes « +12 % chacun, 4 max » et « réserve de 750 u. non vendue » sont des chaînes à changer.

### 3.2 Sauvegarde `wse-city-v8`
- Champs existants à conserver en lecture : `npcSup` (cap, days, k, hot, cold), `locSold`, `rp`, `rw`, `macro`, `tax`, `price`, `ph`, `lq`.
- Champs **nouveaux, facultatifs** (absents = comportement par défaut) :
  - `lots` agricoles `{g: [[q, jour], …]}` (périssabilité) ; si le champ manque, tout le stock est considéré comme produit le jour du chargement ;
  - `idle` par usine (veille : `c.vl = {d: jours sous le coût, on: 0/1}`, à placer dans les extras de la cellule, comme `fw`) ;
  - `ub` allocations chômage en cours (montant, jours restants) ;
  - `bud` (épargne des ménages lissée) ;
  - `bnd` (compteurs cumulés, facultatif) ;
  - `pxE` (EMA des prix si on la distingue de `price`).
- `S.tax` : si le taux devient fixe, lire l'ancienne valeur sans l'appliquer, ou la garder comme réglage du mode bac à sable.
- `S.diff` : rester lisible même si l'effet punitif disparaît.
- Test du chargement : t05, plus les tests de sauvegarde de t30, t38, t45, t51, t62, t63, t87, t88.

### 3.3 Fermes et caste agriculteur
- Périssabilité et saisonnalité **baissent mécaniquement** le revenu agricole (liquidation, stockage, récolte concentrée en trésorerie).
  L'intention « caste agriculteur inchangée, agriculture non dégradée » impose une compensation : silos et entrepôts frigorifiques qui prolongent la durée de vie,
  contrats d'approvisionnement, demande B2B réelle des usines alimentaires (meunerie, laiterie), qui **augmente** quand la ville s'industrialise.
- La fusion récente des fermes à surface variable (passe 87) calibre l'EBITDA par taille (t88 : petite ferme faible, ferme étendue ≥ passe 85).
  Un plancher de prix supprimé (B38) et une demande qui ne vient plus de `LOCAL_D` peuvent faire **chuter le cours du blé** si aucune usine aval n'existe.
  Il faut une consommation finale directe pour les produits agricoles (les ménages achètent du lait, des œufs, de la viande : `LOCAL_D` des produits agricoles
  devient une **saturation physique par habitant**, comme le basique).
- t02 (bandes d'EBITDA des extracteurs, 15-45 % pour les cultures), t38, t51, t59, t86, t88.

### 3.4 IA rivales et bots
- `fabPlan` / `fabKin` / `fabFill` lisent `marketBounds(g).cap` et `.fl` pour estimer la pénurie (`x = clamp(1 − 2,5(P/cap − 0,8), …)`, aussi dans `trMarket`).
  Si `cap` devient la parité import, il faut redéfinir la pénurie comme `P / P_imp`.
- `rivPrice` utilise `r.cb` (coût) comme plancher : à aligner sur la règle de liquidation du joueur. Une IA « ne vend jamais sous le coût »,
  alors que le joueur pourra le faire : c'est une asymétrie à trancher (les IA doivent pouvoir liquider aussi, sinon elles perdent les guerres des prix).
- Le négoce des rivaux (`resU × Pc × (pr − 1 + mr)`) **ne prélève aucune marchandise réelle** : leurs ventes de rayon sont une part de volume sans achat de gros.
  Dans un budget fermé, la part des rivaux consomme le budget des ménages : c'est correct. Mais leurs achats de gros devraient alimenter `want[cls]`.
  À traiter au lot 4 (sinon la marchandise de rayon du joueur ne voit pas la demande des rivaux).
- Bots (`tools/bot_lib.js`, profils de `sim_batch.js`) : seuils de rentabilité (`hurdle`), `farmGrow` (seuil de rentabilité aux cours du jour), `demC` par magasin.
  Ils sont calés sur l'économie actuelle. Une chute des marges de la commodité (plus de plancher +8 %) changera leurs décisions. Recalibrer `hurdle` sans toucher aux chemins.
- `bench_pouvoir.js` lit `S._lm`, `mp.m` et `mp.prod` : à mettre à jour avec le lot 5.

### 3.5 Déterminisme
- Le commerce contient des appels à `rnd()` (bad buzz l. 7577, migration l. 7659, entrée PNJ et `placeNpcFarm` dans `stepLocalMarket`).
  `rnd()` est déterministe (mulberry32 sur `S.rs`), mais **tout appel ajouté ou retiré décale le flux** et change toutes les parties de référence des tests.
  Règle pour l'implémenteur : n'ajouter que des `hash(jour, bien, sel)` ; si un appel `rnd()` disparaît (par exemple avec la refonte de l'offre PNJ),
  consommer un `rnd()` muet pour garder le flux (comme le fait déjà `stepMacro`).

### 3.6 Départ de zéro et petites villes
- Bourg d'environ 630 habitants : le budget fermé doit marcher avec une masse salariale minuscule. Le revenu des ménages comprend tous les emplois
  (PNJ de la ville et entreprises) ; le basique et le logement sont prélevés en premier et **saturent** dès que le revenu suffit. Le résiduel grandit ensuite
  avec la population × rw, de façon exponentielle. Risque : si le budget est calculé sur la seule masse salariale du joueur et des IA,
  la demande du bourg vaut presque 0 au jour 1. La masse salariale de la ville (`popE × 0,55 × (1 − chômage) × WAGE_RATE × rw × cpi`) doit être la base.
- t87 exige qu'un petit marché près de la halle soit rentable dès le premier mois : la demande du jour 0 doit être **identique** à l'actuelle
  (calibration par κ, voir le lot 3).

### 3.7 Tests qui vont casser (à mettre à jour en même temps que le lot concerné)
| Lot | Tests probablement touchés | Pourquoi |
|---|---|---|
| 0 (instrumentation) | aucun | lecture seule |
| 1 (fiscalité US) | t05, t19, t23, t24, t28 (intégration fiscale), t65, t70, t83, t85 | taux, report de pertes, surchauffe, trésorerie de Round |
| 2 (travail) | t25 (chômage ≥ 3 %, corrélations), t41, t65, t87 | licenciements rapides, allocations |
| 3 (budget) | t02 (marges des commerces ≥ 12 %), t03 (élasticité −10 à −25 %), t25, t27, t34, t43, t44, t46, t50, t52, t53, t54, t62, t65, t70 (prospérité > 1,02, marché élargi ≤ 1,6), t83, t84, t87 | `prosp`, `rivMkt`, `_dw`, demande du jour 0 |
| 4 (B2B et fermes) | t02 (extracteurs), t08, t09, t28, t30, t38, t41, t51, t59, t61, t63 (intrants des rivaux), t66 (négociant), t73, t79, t86, t88 | `LOCAL_D`, `locSold`, `_lm`, périssabilité |
| 5 (prix) | t02 (EBITDA ≥ 10 %), t11_marche_mur, t20, t45 (plancher de viabilité ≥ 3 %, prime), t61, t63, t66 (±4 %/j), t67, t72, t73 | planchers, plafonds, `mpGood` |
| 6 (rayons et marque) | t18, t44, t52, t54, t62, t78 | α, `boost`, dilution |
| 7 (validation) | nouveau test t89 « marché libre 365 j » | |
Les plus sensibles : t02, t45, t70 et t65, parce qu'ils encodent des **planchers de marge** (≥ 12 %, ≥ 10 %, ≥ 3 %) : ils traduisent l'ancienne philosophie.
Il faudra les reformuler en propriétés de marché : une usine seule rentable, un marché saturé qui fait sortir un concurrent ou mettre en veille,
la marge moyenne du secteur qui revient vers le coût du capital.

---

## 4. Plan d'implémentation par lots

Principe : chaque lot est livrable seul, passe la suite de tests (avec mise à jour justifiée), et ses constantes sont réglables dans `US_MACRO_CONFIG`
ou `LIB_CFG`. Chaque lot a un **commutateur** (`LIB_CFG.lotN = true`) pour mesurer A/B sur la même graine.

### Lot 0 : instrumentation et configuration (aucun changement d'équilibre)
- `const US_MACRO_CONFIG = { corpTax: 0.25, salesTax: 0, payroll: 0, fireMonths: 0, ubRate: 0, ubDays: 0, tariff: 0, energyK: 1, … }`, avec des valeurs **neutres**
  qui reproduisent l'actuel, puis passent aux valeurs US au lot 1.
- Fonction `bnd(id, v, lo, hi)` : renvoie `clamp(v, lo, hi)` et incrémente `S._bnd[id] = [jours touchés en bas, en haut, dernier jour]`.
  Les compteurs ne sont pas sauvegardés, ou seulement en champ facultatif `bnd`. **Remplacer chaque clamp des tableaux B1 à B73 par `bnd('B…', …)`**, sans changer les valeurs.
- Invariants quotidiens (`libCheck()`, hors interface) : NaN/Infinity dans `S.price`, `S.stock`, `S.prod[*].stock`, `S.cash`, rivaux ; stock négatif ; prix ≤ 0.
- Outil `tools/bnd_report.js`, sur le modèle de `macro_audit.js` : N graines × 6 castes (bots de `bot_lib.js`) × 365 et 1 800 jours.
  Il sort, pour chaque borne : la part des jours touchés, la part sous choc et la valeur moyenne au moment du contact.
  Mesures de prix : écart-type des variations journalières de log(P), nombre d'inversions de tendance sur 30 j, amplitude maximale sur 60 j.
- **Décision par la mesure** : une borne C touchée plus de 1 % des jours en partie normale masque un mécanisme. Il faut alors la reclasser en B ou l'élargir.
- Tests : la suite entière doit passer **sans changement**.

### Lot 1 : fiscalité US et suppression des taxes sur le succès
- `corpTax` 24 % (question 4 pour le curseur) ; report de pertes illimité, imputable sur 80 % du bénéfice (B69).
- Sales tax 6 % sur le CA des rayons (le prix affiché est TTC ; le CA de l'entreprise est HT ; la recette alimente `taxSvc` et le budget public).
  Pour rester neutre au départ, augmenter `RETAIL_MK` de 6 % ou présenter la taxe comme incluse.
- Charges patronales de 8 % : `c.wages × (1 + payroll)`, avec `WAGE_RATE` ramené à 120 / 1,08 pour garder le coût du travail constant au départ.
- Énergie × 0,85 (`ELEC_BASE`, carburants de `shockPx`).
- Supprimer `regTax`, `diffMult`, `REG_DEBT` (B65, B68). Garder l'aide `S.diff = −1` (B72).
- Effet attendu : léger, moins de 3 % sur la valeur à 1 800 j. À surveiller : t65 (bandes de castes), t24, t83 (rythme des jalons).

### Lot 2 : marché du travail flexible
- Licenciement : quand `actOf` baisse, l'effectif suit en 1 à 3 jours (au lieu d'une EMA à 0,05), avec une indemnité de 0,2 × salaire mensuel par poste supprimé (`fireMonths`).
  Embauche progressive (inertie de 5-10 j) : c'est la seule friction.
- Allocations chômage : 35 % du salaire pendant au plus 180 j. Elles entrent dans le budget des ménages au lot 3 ; au lot 2, on les calcule et on les affiche seulement.
  Financement : charges patronales et IS (pas de déficit administré).
- `wageMkt` devient une EMA de 45 j de la tension (inertie des salaires), bornée en C à 0,5-2,5 (B61). Le plancher de 3 % de chômage devient une borne C (B62).
- Effet attendu : des usines qui ferment plus vite en récession, donc des cycles plus marqués. Indicateurs : écart-type du chômage (t25 > 0,4 pt), humeur.

### Lot 3 : demande des ménages en budget fermé (le cœur)
- Revenu des ménages, par jour :
  `Y = masse salariale (emplois de la ville, du joueur et des IA) + dividendes locaux (S.float, r.div) + allocations − IS non répercuté − sales tax`
  et `B = Y × (1 − s)`, où l'épargne `s = s0 + k·(chômage − NAIRU) − k'·(confiance)` (épargne de précaution, négative en reprise).
- Le budget de commerce modélisé vaut `B_c = κ × B`. Le coefficient κ (≈ 2 %) est **calibré une seule fois** pour que la demande du jour 0 soit égale à l'actuelle,
  en ville normale comme en départ de zéro (contrôle t87). Il représente la part du revenu dépensée dans les rayons de la ville (le reste va aux loyers, à la santé, aux services hors jeu).
- Ordre de prélèvement : (1) basique `q_b = min(q*_b × popE × élasticité(P_b), B_c·0,8 / P_b)`, avec `q*_b = DEM_PER_POP.basic` comme **saturation physique** ;
  (2) logement, même principe (`0,00032` saturation, mensualité et taux) ; (3) résiduel `R = B_c − dépenses (1) et (2)`, multiplié par `(0,82 + 0,18·bonheur/100)`,
  réparti entre std et lux selon une part de luxe `w_l = σ((ln(rw·revenu/hab.) − μ)/τ)` (loi d'Engel). Pas de borne `gMul`.
- Conversion en unités : **unités de panier** = valeur / prix du panier de la classe (`S.price[cls] × retailMk`). Le partage entre produits reste celui de l'attrait
  (question 5 : passer plus tard au budget en valeur par produit).
- `prosp()` : son rôle « somme positive » passe dans Y, puisque les salaires et dividendes des IA en font partie (t70 reste vrai par construction).
  `pxCls`, `gMul`, `rwS`, `mult` (B14) et `PX_MAX` sont supprimés. `rivMkt` reste derrière un commutateur, puis disparaît si t70 tient sans lui.
- Réécrire `demandWhyCls` en cascade : revenu → épargne → budget de commerce → basique (saturé ou non) → logement → résiduel → std et lux.
- Effet attendu : **fort**. Le cycle du PIB n'agit plus que par l'emploi et les salaires, donc avec un retard. Le luxe devient bien plus cyclique dans les villes riches.
  Risque de spirale récessive (moins d'emplois, moins de demande, fermetures) : il est amorti par les allocations et l'épargne négative.
  Garde-fou C : `B_c ≥ coût de la saturation basique × 0,6` (compté).
- Calibration : `sim_batch.js --seeds 10 --days 1800` sur les 6 castes, profil « bon », A/B contre lot 2. Indicateurs : valeur médiane par caste (bande de t65),
  ratio monde / joueur seul (t70 ≥ 1,2), satisfaction du basique (> 0,9 hors choc), part du luxe dans la dépense (5-15 % en bourg, 20-35 % en métropole),
  convexité de la trajectoire de valeur (critère 4 de PRINCIPE_JEU_POSITIF).

### Lot 4 : chaîne B2B réelle
- **4a, matières et composants.** Supprimer `Dl = LOCAL_D × popE` pour les biens intermédiaires. La demande d'un bien g devient :
  - besoins des plans de production du jour (joueur : `want` déjà calculé dans `runRecipe` ; rivaux : `S.rv.inD` ; producteurs PNJ aval) ;
  - plus la reconstitution du stock tampon : `(cible − stock)/τ`, avec cible = 7 j de consommation et τ = 5 j ;
  - plus une consommation finale directe pour les biens que les ménages ou la construction achètent vraiment (carburant, gaz, bois, gravier, sable, ciment, briques
    selon les chantiers de `stepCity` ou `stepDevs`). Cette partie garde un coefficient par habitant ou par chantier, **documenté comme demande finale**.
  - Les producteurs PNJ (`npcSup`) deviennent des entreprises PNJ dotées d'une capacité, d'un coût unitaire (`RES_COST × base × cpi` pour les matières, recette × cours pour les transformés)
    et de la règle de veille du lot 5. Leur demande d'intrants remonte la chaîne.
  - Choix entre local et import, par client : prix livré = prix + fret(distance) + droit, ajusté de la qualité (`(q/65)^0,5`, déjà dans `supplierList`).
  - Les ventes de rayon des rivaux génèrent des achats de gros (marchandises de rayon), ajoutés à `want[cls]`.
- **4b, agriculture.** Lots datés `S.lots[g]` (FIFO). Durée de vie indicative : blé, maïs, colza, sucre, coton, laine 360 j ; raisin 10 j (vendange : vers le chai) ;
  lait 5 j ; œufs 25 j ; viande 10 j sans froid. Les silos et entrepôts frigorifiques (`wh` qui stockent ces biens) multiplient la durée par 3 à 10.
  Liquidation : un lot à moins de 20 % de sa durée de vie est mis en vente d'abord, à prix décroissant (jusqu'à 40 % du cours). Il est ensuite exporté ou donné
  (destruction comptée en perte). Jamais de destruction sans tentative de vente.
  Récolte saisonnière des cultures : production annuelle identique, concentrée sur 60-90 j (blé l'été, maïs l'automne), via `seasonMult` étendu.
  La trésorerie de la ferme devient saisonnière ; le banquier IA finance le fonds de roulement (synergie de castes).
- Effet attendu : **fort sur les matières** (cours bien plus volatils si l'industrie aval est petite) et sur le bourg (presque aucune usine aval au départ :
  la demande finale directe doit porter le début de partie). À surveiller : EBITDA des extracteurs (t02), rentabilité des fermes par taille (t88),
  bilan de la caste agriculteur (t70 ≥ 1,63 avant).

### Lot 5 : prix par le marché
- Parité import par bien : `P_imp(g) = GOODS[g].base × cpi × (1 + droit) × (1 + fret(g))`. L'offre d'import est une sigmoïde douce :
  `part_imp = 1 / (1 + exp(−(P/P_imp − 1)/0,04))`. Elle remplace le plafond 1,6 × base (B40) et les « fournisseurs extérieurs » 0,47 (B36).
  Elle laisse au producteur local une marge naturelle égale au fret et au droit.
- Planchers naturels : (1) **liquidation** : un vendeur dont le stock dépasse 15 j de ventes accepte un prix décroissant jusqu'à son coût variable × 0,5 ;
  (2) **veille** : une usine (joueur, IA, PNJ) dont le prix de vente est inférieur au coût variable unitaire pendant 14 jours consécutifs passe en veille.
  Elle ne produit plus, licencie avec l'indemnité du lot 2, ne paie que ses frais fixes, et redémarre au prix d'un coût modéré (5 j de frais fixes + montée en charge sur 7 j).
  Le joueur garde la main : politique COO « veille automatique » activée par défaut et désactivable (question 2).
- Pouvoir de marché dynamique : `markup = mpPrime(P_g, n_eff) × g(u) × h(s)`, où u est le taux d'utilisation des capacités du secteur (prime forte quand u > 0,9, nulle sous 0,6)
  et s le ratio stock/ventes (au-dessus de 15 j, la prime s'annule et la liquidation commence). L'appel d'air `mpEntry` est conservé, avec une entrée plus rapide quand u > 0,95.
- Lissage du prix : EMA de 6 j (α ≈ 0,15), et le ratio demande/offre en EMA de 3 j. `TR_DCAP` passe en garde-fou C (±10 %/j).
- Supprimer les planchers 0,75/0,86 × base et intrants + 8 % (B38, B39), `pass` (B41), le refus d'import à 85 % (B34), `rvCartelK` (B24).
  Ajouter des garde-fous C : 0,05 × base ≤ P ≤ 8 × base, comptés.
- Rivaux : prix = coût réel `r.cb` × (1 + markup de marché) ; liquidation et veille identiques à celles du joueur (fin de l'asymétrie « jamais sous le coût »).
- Effet attendu : marges des commodités plus basses en moyenne, plus élevées en pénurie. Cycles du type « surinvestissement, guerre des prix, fermetures, rebond ».
  À surveiller : oscillation (lot 0), part de jours en veille par secteur (cible 5-20 % en récession, moins de 5 % en expansion), délai de rebond.
  Il faut vérifier la propriété de t45 : la prime décroît avec le nombre de concurrents.

### Lot 6 : partage des rayons et marque
- α par classe dans `c.pw` et `attractiveness` : 2,2 / 1,6 / 0,6 (B16, B17).
- `boost = 1 + 0,17·ln(1 + nProd)` (B15), en même temps dans `demandWhyCls`.
- Dilution de marque : réputation de la marque = Σ(CA_pk × qualité_pk) / Σ CA_pk sur tous les produits de la marque. Elle entre dans `rt` et `brand` de `productScore`
  et remplace `corpLoyF` (B27). Un produit bas de gamme qui fait beaucoup de chiffre dilue la marque.
- `RETAIL_MK` devient la marge de référence affichée ; la marge réelle vient du curseur `pf` élargi (B25) et de `rtPow`.
- Effet attendu : modéré. Le basique se joue sur le prix, le luxe sur la marque. À surveiller : t62, t52, t54, et la part de marché du joueur dans le Mall.

### Lot 7 : validation
- Nouveau test `t89_marche_libre.js`, sur 365 jours, 3 graines, 8 joueurs et IA, difficultés 1, 4 et 8 :
  - aucun NaN ou Infinity, aucun stock négatif ;
  - prix stables : écart-type journalier de log(P) inférieur à 4 % hors choc, pas d'alternance haussière/baissière de plus de 8 jours d'affilée ;
  - au moins un épisode « expansion », un « guerre des prix ou liquidation » et un « veille puis redémarrage » ;
  - compteurs `BND` de classe C sous 1 % des jours ;
  - début accueillant : t87 inchangé.
- Rejouer `sim_batch.js` (10 graines, 3 600 j), `macro_audit.js` (relations de Phillips, d'Okun, de Taylor), `city_growth.js` et `bench_pouvoir.js`.

### Ordre recommandé
**0 → 1 → 2 → 5 (partiel : planchers et parité import) → 3 → 4a → 4b → 6 → 7.**
La parité import (lot 5 partiel) vient avant le budget, parce que sans plafond naturel la demande budgétaire produirait des flambées.
4b (agriculture) passe après la fusion du chantier des fermes et après 4a, qui lui donne ses débouchés aval.

---

## 5. Contraintes permanentes à respecter (rappel pour l'implémenteur)
1. **Somme positive** (docs/PRINCIPE_JEU_POSITIF.md) : aucune caste ne nuit à une autre. Le budget fermé doit compter les salaires et dividendes des IA dans le revenu des ménages.
   La veille et la liquidation ne doivent pas devenir une arme permanente contre l'agriculteur ou le négociant (critère 3 : pas d'annulation).
2. Pas de plafond artificiel sur le gain d'argent ; spéculation libre ; marges portées par le pouvoir de marché.
3. Début de partie accueillant ; concurrence croissante avec le palier du joueur (`compNow`, `rivCannib`, `fabMax`).
4. Agriculture non dégradée, caste agriculteur inchangée en intention ; fermes à surface variable (coûts physiques explicites, rendement émergent, docs/FERMES_SURFACE.md).
5. Puces : les nœuds de gravure ne s'obtiennent que par la R&D (`chipNodeM` reste hors du mécanisme de prix).
6. RNG déterministe : `hash()` dans le code nouveau, jamais `rnd()` ; garder le nombre d'appels à `rnd()` (voir 3.5).
7. Sauvegarde `wse-city-v8` rétrocompatible : uniquement des champs facultatifs, valeurs par défaut sans effet.
8. Départ de zéro (`S.opt.start = 'zero'`, bourg d'environ 630 habitants) : la demande doit marcher avec très peu d'habitants et croître de façon exponentielle.
9. 8 joueurs ou IA, difficulté 1-8 : les règles de marché s'appliquent à tous de la même façon (fin des asymétries IA/joueur).
10. Pas de pay-to-win en Round.
11. Suite de tests : un fichier à la fois (`NODE_PATH=$(npm root -g) node wall-street-empire/tools/tests/run.js <filtre>`) ; reconstruire `city.html` par `python3 wall-street-empire/tools/build.py`.

---

## 6. Questions de conception pour Rémy (6)

1. **Les curseurs de prix doivent-ils devenir vraiment libres ?** Aujourd'hui un produit se vend entre 60 et 160 % du prix de référence, un rayon entre 70 et 140 %.
   *Recommandation : oui, de 25 à 400 % ; seul le marché (les clients qui partent) punit un prix absurde.*
2. **La mise en veille des usines du joueur est-elle automatique ?** Les IA ferment déjà leurs usines non rentables.
   *Recommandation : automatique par défaut (directeur des opérations), avec un interrupteur par usine et une alerte, pour que le joueur garde la main.*
3. **Faut-il supprimer la « surchauffe » ?** Quand le joueur s'enrichit vite, ses impôts (+5 pts), ses salaires (+8 %) et ses IA rivales montent : c'est une taxe sur le succès.
   *Recommandation : supprimer la partie punitive ; garder l'aide aux joueurs qui stagnent et laisser la concurrence (appel d'air, IA plus fortes selon le niveau 1-8) faire le travail.*
4. **Le joueur doit-il garder le curseur d'impôt (5-45 %) ?** Il joue une entreprise, pas un maire.
   *Recommandation : taux fixe de 24 % (plus 6 % de sales tax et 8 % de charges) en partie normale ; curseur réservé au bac à sable.*
5. **Comment la demande compte-t-elle les produits chers ?** Aujourd'hui une voiture à 900 $ remplace un « panier luxe » de 140 $ (calcul en unités).
   Avec un vrai budget en dollars, on vendrait environ 6 fois moins de voitures, et les filières chères perdraient beaucoup de chiffre d'affaires.
   *Recommandation : au lot 3, budget converti en unités de panier (même équilibre qu'aujourd'hui) ; passage au budget en valeur par produit plus tard, mesuré à part.*
6. **Quelle sévérité pour la périssabilité agricole ?**
   *Recommandation : durées de vie réalistes, mais jamais de destruction sèche : les produits périssables sont soldés d'abord (jusqu'à 40 % du cours), et les silos ou entrepôts frigorifiques
   prolongent leur durée. La demande réelle des usines alimentaires compense, pour que la caste agriculteur garde son intérêt.*
