# Concurrence et comportement des entreprises IA : ce que fait Capitalism Lab, ce que fait WSE

*Étude du 19/11/2026. Méthode : uniquement des sources publiques (site officiel capitalismlab.com, guide d'usage en classe, notes de version, guides de joueurs sur Steam, forum Enlight). Aucune décompilation, aucun extrait de code ni d'asset, aucun texte protégé recopié : les règles ci-dessous sont **reformulées** en algorithmes propres à WSE, avec nos noms et nos paramètres. Chaque règle porte un **niveau de confiance** :*

- **A** : écrit noir sur blanc dans une source officielle (site, manuel, notes de version).
- **B** : décrit par plusieurs joueurs ou déductible directement d'un réglage officiel.
- **C** : témoignage isolé (forum, guide d'un joueur) ou inférence de conception de notre part ; à traiter comme une hypothèse.

*Les références de code renvoient à `wall-street-empire/game.template.html` ; le nom de fonction fait foi (les numéros de ligne bougent).*

---

## 0. En bref

1. **Ce qui est établi (A).** Dans Capitalism Lab, les IA sont des entreprises complètes : elles **fabriquent** leurs propres produits, les vendent sur le marché libre, **achètent leurs intrants** à des fournisseurs (dont le joueur), font de la R&D, se financent en bourse et peuvent être rachetées. Leur force se règle par des curseurs publics : nombre, capital de départ, agressivité d'expansion, agressivité tarifaire, expertise, avance technologique, compétence des concurrents locaux, fusions amicales, changement de stratégie, répartition des « focus » (diversifié, distribution, bourse, immobilier, tech, médias, banque, assurance). La difficulté globale est une **note en %** (niveau 3 ≈ 121 %, au-delà de 200 % « trop dur pour débuter »).
2. **Ce qui ne l'est pas.** Les seuils exacts (quand une IA déclenche une baisse de prix, combien elle investit, quand elle ferme) ne sont **pas publiés**. Nous les avons donc **conçus** (confiance C), en respectant les comportements décrits.
3. **Notre écart principal** était celui que signalait déjà `PARITE_SIMCITY_CAPITALISM.md` (C14) : nos rivaux vendaient du « magique » (une marge fixe sur un attrait agrégé) sans rien fabriquer ni acheter. Cette passe leur donne des **usines réelles** (mêmes recettes que le joueur, intrants achetés au marché local, stocks, rupture, coût de revient), une règle **fabriquer ou acheter**, un **plancher de coût** sur les prix, de la **dette**, un **journal qui explique** chaque décision, et une **note de difficulté** qui monte avec le palier du joueur.

---

## 1. Ce que disent les sources publiques, reformulé en règles

### 1.1 Réglages de la concurrence (confiance A)

Sources : [Script – Competitors](https://www.capitalismlab.com/scripts/script-competitors/), [exemple de script « competitors »](https://www.capitalismlab.com/cap_lab_files/scripts/sample_script_competitors.txt), [Improved AI](https://www.capitalismlab.com/?p=429), [Version 11.0](https://www.capitalismlab.com/version110/), [Version 13.0](https://www.capitalismlab.com/version130/).

| Réglage public | Valeurs | Règle que nous en tirons |
|---|---|---|
| Nombre de concurrents | 0 à plusieurs dizaines | `OPT_NRIV` (0, 2, 3, 5, 8) : existe |
| Capital de départ des IA | Très bas → Massif | `OPT_CAP` : existe. Capitalism Lab réserve la **promotion immobilière** IA aux capitaux Élevé/Très élevé (coûteuse) : règle B, non reprise (notre promoteur IA existe toujours, c'est une caste) |
| Agressivité d'expansion | Très basse → Très haute | `OPT_EXP` : existe. Notes 11.0 : à « Très haute », les IA ouvrent magasins **et usines** avec plus d'urgence → chez nous le seuil de rendement exigé d'une usine IA est divisé par ce coefficient |
| Agressivité tarifaire | Très basse → Haute | `OPT_PRICE` : existe (attrait des rivaux) |
| Expertise des IA | Aucune → Haute | partiel : `r.mq` (qualité de gestion, fixée à la création) |
| Avance technologique des IA | Aucune → Haute | absent (voir §4) |
| Compétence des concurrents locaux | Très basse → Très haute | `OPT_LOC` (producteurs PNJ de matières) : existe |
| Fusions amicales des IA | oui / non | absent : nos IA ne fusionnent pas entre elles |
| L'IA peut changer de stratégie | oui / non (v12+) | absent : la caste fixe la stratégie |
| Répartition des focus (diversifié, distribution, bourse, immobilier, tech, médias, banque, assurance) | 1 à 30 chacun, « préférences » | équivalent : nos **six castes** (une IA par caste) |
| Expertise produit (classe, nombre d'IA) | ne touche que les IA « diversifiées » | équivalent introduit ici : **familles fabriquées par caste** (`RIV_FABF`) |

**Difficulté.** Le guide de classe ([Educational Use Guide, PDF](https://www.capitalismlab.com/cap_lab_files/education/Capitalism_Lab_Educational_Use_Guide.pdf)) décrit une barre de difficulté **1 à 8** (configurations prédéfinies) et une **note globale en %** qui agrège tous les réglages ; un débutant s'en sort jusqu'à ~121 % (niveau 3), au-delà de 200 % c'est trop dur pour débuter (A). La formule d'agrégation n'est pas publiée (→ la nôtre est en §2.6, confiance C).

### 1.2 Les IA fabriquent et achètent (confiance A)

Source principale : [Beginner's Guide, Gameplay Basics](https://www.capitalismlab.com/beginners-guide-gameplay-basics/).

- **R1.** Au fil de la partie, les concurrents **se mettent à fabriquer leurs propres produits** et les vendent sur le marché libre (A).
- **R2.** Leurs produits intermédiaires sont souvent **moins chers et de meilleure qualité** que ceux des ports (A) : une IA qui fabrique devient un **fournisseur** potentiel du joueur.
- **R3.** Les concurrents **achètent volontiers le surplus du joueur** quand la note de son produit est haute (prix bas, qualité haute) ; le joueur peut couper ces ventes (« vente interne »), mais **les contrats d'approvisionnement établis continuent** (A ; voir aussi [Set default Internal Sale](https://www.capitalismlab.com/resources/gameplay-faq/set-default-internal-sale-status/)).
- **R4.** Les ports (importations) servent de béquille de départ ; selon la difficulté, **leurs approvisionnements peuvent s'arrêter** (A).
- **R5.** Le meilleur détenteur d'une technologie ne la vend pas au joueur ; le 2e ou le 3e le fera plus volontiers (A).
- **R6.** Les IA « focus tech » ne font que de la R&D, **vendent leurs technologies**, peuvent ensuite **fabriquer** pour exploiter leur avance, ou être **rachetées** par un grand groupe ; leur cours est très volatil ([Tech-focused AI Companies](https://www.capitalismlab.com/new-features/tech-focused-ai-companies/), A).
- **R7.** R&D des IA (v13) : elles visent en priorité les technologies **où leur retard est le plus grand**, avec un objectif d'autant plus ambitieux que le retard est grand, et ne prennent jamais les deux niveaux de risque les plus élevés (A).

### 1.3 Prix, note produit, parts de marché (A et B)

- **R8.** Les ventes dépendent de la **note globale** du produit, somme pondérée prix / qualité / marque, avec des poids **propres à chaque produit** (exemples publics : cigarettes ~60/15/25 marque/qualité/prix, viande surgelée 20/40/40, téléphone ~40 % qualité dont ~80 % vient de la technologie de production) (A, guide débutant). WSE a déjà ce modèle (`productScore`, `PROD_W`).
- **R9.** Le COO (IA de gestion, que les IA concurrentes utilisent aussi pour leurs propres sociétés) a une **politique de prix** sur un curseur « maximiser la marge ↔ maximiser la part », une option « **ne jamais vendre sous le coût** », et une politique d'achat : poids du fret (préférer les fournisseurs proches), « chercher de meilleurs approvisionnements », **tolérance aux ruptures** (plus elle est basse, plus vite on change de fournisseur) ([Management Policies](https://www.capitalismlab.com/improvements/management-policies/), A).
- **R10.** Les concurrents **locaux** (PNJ d'une ville) ont une compétence réglable par produit (`LOCALCOMP` dans les fichiers de mod) ; pour un produit **nouvellement inventé**, ils n'apparaissent que **progressivement sur cinq ans** : le premier inventeur a peu de rivaux au début ([Version 11.0](https://www.capitalismlab.com/version110/), [Advanced Modding – Products](https://www.capitalismlab.com/mod/advanced-modding/advanced-modding-products/), A).
- **R11.** Une baisse de prix du joueur entraîne des baisses des rivaux ; la guerre des prix est un équilibre de Nash où tous perdent de la marge ([Game Theory in a Business Simulation](https://www.capitalismlab.com/game-theory/), A pour l'idée, sans formule).
- **R12.** Les concurrents locaux **réagissent** quand le joueur passe nettement sous leur prix (le joueur cité les a vus baisser après un écart de 4 points de note) (C, [guide Steam « Master in Capitalism 2 »](https://steamcommunity.com/sharedfiles/filedetails/?id=2969285443)).
- **R13.** Une IA tend à **s'aligner sur le magasin le mieux noté** du joueur pendant une guerre, et à vendre **à peu près au coût** pour survivre (C, forum Enlight « Driving out AI competition », synthèse d'un moteur de recherche ; page non lisible directement).
- **R14.** Les rivaux **entrent rarement** dans un marché où le joueur est déjà fort, sauf avantage net de qualité ou de marque ; ils **augmentent formation et équipement** quand ils voient l'avance du joueur (C, guide Steam).
- **R15.** Part de marché « saine » visée par la stratégie officielle : **25 à 50 %** sans se surétendre ; entrer à prix compétitif puis monter le prix quand qualité et marque sont établies ([Strategies for Market Domination](https://www.capitalismlab.com/strategies-market-domination/), A pour le conseil, pas une règle d'IA).

### 1.4 Finance, rachats, faillite (A et C)

- **R16.** Introduction en bourse : mêmes règles pour le joueur et les IA ; cinq niveaux d'exigence (défaut : 100 M$ de CA **ou** 10 M$ de bénéfice sur le dernier exercice), pas d'IPO la première année, capitalisation minimale et fonds propres positifs ([Version 13.0](https://www.capitalismlab.com/version130/), A).
- **R17.** Fusion de deux filiales : il faut **75 %** de chacune ; la plus grosse capitalisation absorbe, paiement en cash ou en actions ([Merging Subsidiary Companies](https://www.capitalismlab.com/subsidiary-dlc/merging-subsidiary-companies/), A). Une société IA privée et indépendante peut accepter une **offre de rachat** (garder séparée ou fusionner) ([Acquiring a Private Company](https://www.capitalismlab.com/digital-age-dlc/acquiring-private-company/), A).
- **R18.** Capital-risque (DLC Banque) : les VC vendent progressivement à partir de ~3× leur mise, une tranche par mois ; un rachat les paie en totalité (A, v13).
- **R19.** Un joueur qui **émet beaucoup d'actions** s'expose à une **OPA** (A, guide de classe).
- **R20.** Une société **au bord de la faillite** est proposée au rachat au joueur (notes v10, A) ; la faillite est la sanction normale d'un débutant (guide de classe, A). Les IA peuvent être ruinées par un joueur qui leur siphonne leur trésorerie par fusions (C, forum « Make billions, bankrupt everyone »).
- **R21.** Les IA prennent des participations au capital d'autres sociétés, y compris celle du joueur (C, guide Steam : un rival détenait 22,6 % du joueur).
- **R22.** Les IA s'endettent : la stratégie officielle conseille d'émettre le maximum d'obligations la première année, puis de réduire l'endettement quand le CA est là (« s'étendre ou mourir ») (A pour le conseil ; C pour l'IA).

---

## 2. Spécification algorithmique retenue pour WSE

Notation : `P_c` cours de la classe `c` (`S.price[c]`), `px_c` prix relatif du rival (1 = marché), `pr_c = px_c / positionnement` (1 = prix habituel de l'enseigne), `m_r` marge de négoce du rival, `v_c` volume vendu (unités de classe/jour).

### 2.1 Fabriquer ou acheter (R1, R2, R9) — implémenté

Marge de négoce (existante) : `m_r = clamp(m_profil × mq × E.m, 0,05, 0,4)` : le rival achète en gros à `(1 − m_r) × P_c` et revend `pr × P_c`.

Coût de fabrication d'un produit `pk`, aux **mêmes recettes que le joueur** (`PRODUCTS[pk].in / out`) :

```
k_in(pk)  = Σ_g in[g] × S.price[g] / out / stdPrice(pk)        # part des intrants dans le prix de gros, aux cours du jour
fill, imp = fabFill(pk)                                          # taux de service des intrants et surcoût d'import (§2.3)
uc        = (1 − m_r) × (k_in × imp + FAB_LAB)                    # coût unitaire, relatif au cours de la classe
m_fab     = 1 − uc                                               # marge fabriquée (comparée à m_r)
```

Projet d'usine (évalué tous les 30 jours, sans aléa) pour chaque produit des **familles de la caste** (`RIV_FABF` : industriel = auto, électroménager, maison, jouets ; innovateur = électronique, santé ; agriculteur = alimentation, boissons ; négociant = alimentation, mode, maison ; banquier = mode et boissons de luxe ; promoteur = maisons préfabriquées) et de palier `tier ≤ palier du joueur + 1` :

```
cap    = min(FAB_SHARE × v̄_c, 0,95 × v̄_c − capacité déjà installée)    # v̄ : volume lissé (λ = 0,03/j)
gain   = m_fab − m_r                    ; exigé ≥ FAB_GAIN
an     = gain × cap × fill × P_c × 360
capex  = FAB_CAPEX × cap × P_c           # ≈ 5 mois de chiffre d'affaires de la capacité
roi    = an / capex (+0,03 si c'est son produit phare)
construire le meilleur projet si roi ≥ FAB_HURDLE / coef_expansion et nb_usines < fabMax
```

| Paramètre | Valeur | Raison |
|---|---|---|
| `FAB_LAB` | 0,18 | main-d'œuvre, énergie, amortissement, fret en part du prix départ usine |
| `FAB_GAIN` | 0,04 | une usine qui ne gagne pas 4 points de marge ne vaut pas le risque |
| `FAB_HURDLE` | 0,22 /an | retour en moins de ~4,5 ans |
| `FAB_CAPEX` | 150 j de CA | ordre de grandeur des usines du joueur |
| `FAB_SHARE` | 0,3 | une usine couvre au plus 30 % des ventes de la classe ; le reste reste en négoce |
| `FAB_PAY` | 0,8 | part du surplus mensuel des usines (sur le négoce) qui rembourse la dette puis part en dividendes |
| `FAB_DAYS` | 12 j | stock cible de produits finis |

Financement (R22) : sur fonds propres au-delà d'une réserve de 8 % de la valeur, le reste **emprunté** si la dette reste ≤ 30 % de la valeur et si le rival est bénéficiaire. Intérêts : taux directeur + 3 points ; remboursement de 10 % de la trésorerie par mois quand celle-ci dépasse 25 % de la valeur.

Distribution (R22, conçu pour l'équilibre, C) : chaque mois, `FAB_PAY` = 80 % du surplus de marge des usines sur ce qu'aurait rapporté le négoce rembourse d'abord la dette, puis part en dividendes (le joueur actionnaire minoritaire touche sa part). Sans cette règle, la première version (40 % des ventes en usine, `FAB_LAB` 0,12, 4 usines) faisait perdre 7 à 9 % de valeur aux bots joueurs (§5) : la rente des usines finançait l'expansion des IA.

Mise en sommeil : si `m_fab < m_r − 0,02` pendant 60 jours (intrant trop cher), l'usine s'arrête et le rival revend des marchandises achetées ; elle rouvre après 30 jours à `m_fab > m_r + 0,04`. Chaque décision est écrite au journal avec ses chiffres.

**Exemple** (test `t63`, Round Normal, négociant DiscountCo, jour 600, ventes lissées de 900 unités/jour en produits de base) : meilleur projet = chips de maïs (maïs, huile, sel) ; marge fabriquée 48 % contre 17 % en négoce ; capacité 270 u/j (30 % de 900) ; 402 000 $ investis ; retour 1,3 an. Journal : « DiscountCo ouvre une usine de Chips de maïs (270 u/j) : marge fabriquée 48 % contre 17 % en négoce, 402 000 $ investis, retour en 1,3 ans. Ses intrants s'achètent au marché local (maïs, huile de cuisine, sel). »

### 2.2 Journée d'usine (stock, ventes, rupture) — implémenté

```
q        = min(cap × fill, cap × FAB_DAYS − stock + part du volume)     # production du jour
stock   += q ; uc moyen pondéré ; achats d'intrants : q × P_c / stdPrice(pk) × in[g]/out  → S.rv.inD[g]
vendu    = min(v_c, capacité, stock) ; marge = vendu × P_c × (pr − uc)
manque   = min(v_c, capacité) − vendu  → 40 % couvert en négoce, 60 % de ventes perdues
service  = moyenne lissée (1 − perdu / v_c) ; attrait du rival × (0,7 + 0,3 × service)
```

Le stock de produits finis est payé à la production (trésorerie) et compte dans la valeur du rival (au coût).

### 2.3 Achats d'intrants au marché local, y compris au joueur (R2, R3, R4) — implémenté

- Les achats du jour `S.rv.inD[g]` s'ajoutent à la **demande du marché local** (`stepLocalMarket`) : le joueur qui produit `g` en vend une part au prorata de sa capacité face aux producteurs PNJ, exactement comme à la ville. Le relevé `S._lm[g].rivMe` dit combien il en vend aux usines rivales (affiché dans Menu > Concurrents).
- Les importateurs suivent cette demande supplémentaire **au rapport offre / demande du jour** : le cours ne bouge pas (une hausse de 12 % d'une matière ruinait le joueur industriel, README passe rivaux). Une première version (importateurs à 90 %) faisait au contraire **baisser** les cours d'un marché déjà en pénurie (rapport 2,5) : le rapport d'ensemble se rapprochait de 1.
- **Pénurie** : quand le cours d'un intrant approche son plafond (`p / plafond > 0,8`), le marché local ne sert plus qu'une fraction `f = clamp(1 − 2,5 × (p/plafond − 0,8), 0,35, 1)` ; le port importe jusqu'à 60 % du manque, **35 % plus cher** (`imp`). La rupture est affichée sur la fiche du rival (« rupture : coton »).

### 2.4 Prix : plancher de coût et journal (R9, R11, R13) — implémenté

Le prix cible existant (positionnement × part en recul × trésorerie × suivi du joueur × stratégie × entente) reçoit un **plancher** pour les rivaux qui fabriquent : `px ≥ positionnement × (coût moyen + 0,02)`, et `coût − 0,04` pendant une guerre des prix (vendre un peu sous le coût pour survivre ou prendre des parts : R13). Le coût moyen `r.cb[c]` mêle coût de fabrication et coût d'achat en gros, au prorata des volumes. Conséquence voulue : un rival qui fabrique à bas coût **peut** mener une guerre plus profonde sans se ruiner, un revendeur non.

Tout mouvement de prix d'au moins 6 % depuis le dernier relevé est écrit au journal avec son **facteur principal** (« baisse ses prix de 8 % sur les produits manufacturés : il s'aligne sur tes prix (indice 0,85) » ; « monte ses prix… : il ne vend pas sous son coût de revient (79 % du cours) »), au plus une fois par mois et par rival. Le journal garde 40 entrées.

### 2.5 Difficulté qui monte avec le palier (R1, notes 11.0) — implémenté

- `fabMax(r) = jour < 360 ? 0 : clamp(palier du joueur + [jour ≥ 540] − [Round facile], 0, 3)` : **aucune usine IA la première année**, quel que soit le joueur (les IA s'industrialisent « au fil de la partie », R1), puis aucune avant le jour 540 pour un joueur au palier Citoyen (début accueillant), puis une de plus par palier de fortune (Entrepreneur 25 M$, Industriel 70 M$…). Les scénarios `s1`–`s5` en sont exclus. Le seuil d'un an a été ajouté après coup : sans lui, un joueur artificiellement très riche (test `t02`, 50 G$) voyait 15 usines IA dès le jour 30, dont les tours embauchent en ville et renchérissent la main-d'œuvre des fermes (EBITDA de l'hévéa 15,7 % → 13,9 %).
- La courbe existante `compNow()` (agressivité, seuil de guerre, profondeur, rachats, marge ×(0,8 + 0,2 c)) reste la même.

### 2.6 Note de difficulté de la concurrence (A pour le principe, C pour la formule) — implémenté

```
note = 100 % × (facile ? 0,7 : 1) × (n/5)^0,5 × capital^0,15 × expansion^0,3 × prix × local^0,1 × (c/0,4)^0,5 × (1 + g)
```

où `c` et `g` viennent de `compNow()`. Elle vaut 100 % au départ d'un Round Normal par défaut et monte avec le palier, la profondeur des chaînes du joueur et son avance (affichée en tête de Menu > Concurrents, `WSE.riv.rating()`).

---

## 3. Écart détaillé avec notre IA

Gravité : **5** = change la façon de jouer contre l'IA ; **1** = détail.

| Règle | Capitalism Lab (public) | Chez nous avant cette passe | Écart | Gravité | Cette passe |
|---|---|---|---|---|---|
| Les IA fabriquent (R1) | Oui, avec de vraies usines et chaînes | `stepRivalsAI` : recettes = volume × cours × prix relatif, marge fixe `m` ; « usines » = tours `rivTower` décoratives | Total : rien n'était fabriqué | 5 | **Fait** : `r.fab`, `fabDay`, recettes du joueur |
| Les IA achètent leurs intrants (R2, R3) | Aux ports, aux autres IA, au joueur | `RIV_USE` : +6 % de demande locale par rival sur 10 matières, forfaitaire | Pas de lien avec ce que le rival vend | 5 | **Fait** : `S.rv.inD` → `stepLocalMarket`, part du joueur relevée |
| Fabriquer ou acheter | Implicite dans la gestion IA | absent | — | 4 | **Fait** : `fabPlan` (marge, rendement, palier, familles) |
| Stock et rupture chez l'IA | Stock local par entreprise, ruptures | absent | Un rival ne manquait jamais de rien | 4 | **Fait** : stock 12 j, pénurie au plafond du cours, ventes perdues, attrait × service |
| Ne pas vendre sous le coût (R9) | Option du COO | Le prix pouvait tomber à −25 % avec une marge de 20 % : vente à perte non voulue | Pas de notion de coût | 4 | **Fait** pour les rivaux qui fabriquent |
| Réaction aux prix du joueur (R11–R13) | Alignement, baisses en chaîne | `rivPrice` : suivi `fol` borné −12/+10 %, prix limite, guerre | Présent ; non expliqué | 2 | **Fait** : journal explicatif |
| Difficulté (§1.1) | Barre 1–8 + note en % | `rivBase` (facile/normal) × `compNow` (palier, chaînes, avance) | Pas de note lisible ; l'IA ne changeait pas de nature avec le palier | 3 | **Fait** : `fabMax` par palier, `rivRating()` |
| Expertise produit / focus | Focus par IA, expertise par classe | 6 castes, classes de cœur | Pas de spécialisation produit | 3 | **Fait** : `RIV_FABF` (familles par caste) |
| Dette et levée (R16, R22) | Obligations, émissions d'actions, IPO | trésorerie seule, `debt: 0` | Les IA ne s'endettaient jamais | 3 | **Partiel** : dette d'usine bornée à 30 % ; pas d'émission d'actions IA |
| Faillite (R20) | Sanction réelle | vente forcée puis faillite ; « aucune faillite spontanée observée » (README) | Faillites invraisemblablement rares | 3 | **Non atteint** : dette et vente d'usines en détresse existent, mais 0 faillite sur 12 parties (§5) |
| Rachat d'une IA en difficulté (R20) | Offert au joueur | `rivBankrupt` : actifs à vendre 30 j | — | — | inchangé (usines ajoutées aux actifs) |
| Fusions entre IA, IA qui se rachètent (R17) | Oui (option) | Non : seul le plus riche reprend un failli | Pas de consolidation | 2 | non fait |
| OPA sur le joueur (R19, R21) | Participations, OPA si flottant large | `rivalOpa` : dès 25 % de flottant | Présent | — | inchangé |
| R&D des IA ciblée sur le retard (R7) | Oui | brevets forfaitaires (`rivCasteAct` innovateur, `patStep`) | Pas de niveau techno par produit chez l'IA | 3 | non fait |
| Vente de technologie par l'IA (R5, R6) | Oui (2e/3e détenteur) | licences de brevets (passe 47) | Proche | 2 | inchangé |
| Concurrents locaux progressifs sur un produit neuf (R10) | 5 ans | `mpEntry`, `npcSup` (appel d'air) sur les matières | Partiel | 2 | inchangé |
| Ports qui s'arrêtent selon la difficulté (R4) | Oui | import toujours possible | — | 2 | non fait (contraire au début accueillant) |
| Entrée rare là où le joueur domine (R14) | Témoignage | `rivExpand` vise déjà les classes où le joueur est faible | Proche | 1 | inchangé |
| Guerres et ententes entre IA | Possibles | seulement contre / avec le joueur | — | 2 | non fait |
| Fonction valeur d'un rival | Capitalisation boursière | trésorerie + 27 M$ par point d'attrait + actifs + immobilier | Les usines et la dette n'y étaient pas | 3 | **Fait** : + valeur comptable des usines et du stock − dette |

---

## 4. Ce qui reste incertain ou non fait

- **Seuils des IA de Capitalism Lab** : non publiés. Nos paramètres (`FAB_*`, plancher de coût, pénurie au plafond) sont des choix de conception (C), calés par simulation (§5).
- **Unités** : le rival vend des « unités de classe » au cours de la classe ; la conversion en unités physiques passe par la valeur (`P_c / stdPrice(pk)`). C'est cohérent en valeur, pas en pièces (une usine IA de « jeans » vend en réalité un panier manufacturé).
- **Pas de qualité ni de technologie par usine IA** : la qualité IA reste celle de l'attrait. Ni avance technologique IA (réglage « AI Tech Head Start »), ni R&D ciblée (R7).
- **Pas de fusions entre IA, pas d'émission d'actions IA, pas d'IPO IA.**
- **Les usines IA ne vendent pas au joueur** (R2 : l'IA comme fournisseur) ; le joueur leur vend, elles ne lui vendent pas encore.
- Les tours des usines sont des marqueurs `off` (bureaux à la couleur du rival), plafonnés à 8 bâtiments par rival ; au-delà l'usine existe sans tour.

---

## 5. Mesures avant / après

**Protocole.** `tools/sim_batch.js --personas --seeds 3 --days 1800 --workers 1` (Round Normal, 10 M$, 4 personas par monde : hardcore = profil rapide, joueuse = bon, ado = casual, fermier ; chaque persona prend une caste différente et tourne sur les six castes ; 12 parties). Trois campagnes sur les mêmes graines :
- **avant** : version d'origine (`70151f3`) ;
- **bruit** : même version, avec **un seul tirage de plus** dans le flux aléatoire privé des rivaux au jour 1. Elle mesure la sensibilité chaotique des bots : toute modification des rivaux, même neutre, la subit ;
- **après** : version finale de cette passe.

`sim_batch.js` enregistre désormais l'état des rivaux à chaque point (valeur, usines actives, dette, faillites, OPA, usines construites). Aucune erreur de page dans les 36 parties.

| Partie (persona, caste, graine) | Avant (M$) | Bruit (M$) | Après (M$) | Bruit / avant | Après / avant | Usines IA (après) |
|---|---|---|---|---|---|---|
| hardcore, agriculteur, 7001 | 25,0 | 72,7 | 23,2 | 2,91 | 0,93 | 4 |
| joueuse, banquier, 7001 | 89,3 | 83,2 | 87,8 | 0,93 | 0,98 | 12 |
| ado, négociant, 7001 | 80,4 | 81,2 | 80,9 | 1,01 | 1,01 | 12 |
| fermier, industriel, 7001 | 71,0 | 157,9 | 74,5 | 2,22 | 1,05 | 12 |
| hardcore, banquier, 7002 | 89,3 | 81,1 | 76,4 | 0,91 | 0,86 | 12 |
| joueuse, négociant, 7002 | 78,9 | 76,6 | 77,6 | 0,97 | 0,98 | 12 |
| ado, industriel, 7002 | 93,2 | 89,1 | 88,6 | 0,96 | 0,95 | 12 |
| fermier, promoteur, 7002 | 149,7 | 151,2 | 140,3 | 1,01 | 0,94 | 15 |
| hardcore, négociant, 7003 | 71,1 | 66,8 | 69,3 | 0,94 | 0,97 | 9 |
| joueuse, industriel, 7003 | 86,9 | 30,1 | 79,4 | 0,35 | 0,91 | 12 |
| ado, promoteur, 7003 | 94,4 | 97,3 | 87,3 | 1,03 | 0,92 | 15 |
| fermier, innovateur, 7003 | 76,6 | 69,2 | 74,7 | 0,90 | 0,97 | 12 |

- **Bruit / avant** : médiane 0,963, de 0,35 à 2,91. **Après / avant** : médiane 0,963, moyenne géométrique 0,955, de 0,86 à 1,05. **Après / bruit** : médiane 0,995. La médiane de l'effet est **égale** à celle du bruit ; la dispersion est bien plus faible (aucune partie hors de 0,86–1,05, contre 0,35–2,91 pour le bruit).

| Caste du joueur | Parties | Avant moy. (M$) | Bruit moy. | Après moy. | Après / avant | Après / moyenne (avant, bruit) |
|---|---|---|---|---|---|---|
| agriculteur | 1 | 25,0 | 72,7 | 23,2 | 0,93 | 0,47 |
| banquier | 2 | 89,3 | 82,2 | 82,1 | 0,92 | 0,96 |
| négociant | 3 | 76,8 | 74,9 | 75,9 | 0,99 | 1,00 |
| industriel | 3 | 83,7 | 92,4 | 80,8 | 0,97 | 0,92 |
| promoteur | 2 | 122,1 | 124,2 | 113,8 | 0,93 | 0,92 |
| innovateur | 1 | 76,6 | 69,2 | 74,7 | 0,97 | 1,02 |

| Caste IA | Valeur finale moyenne avant (M$) | bruit | après | min–max après |
|---|---|---|---|---|
| banquier (Luxor) | 30,3 | 30,3 | 33,0 | 27,7–39,4 |
| négociant (DiscountCo) | 32,0 | 32,1 | 32,6 | 27,0–37,9 |
| industriel (Vulcan) | 32,8 | 33,0 | 33,7 | 30,3–35,9 |
| promoteur (Atlas) | 39,5 | 39,2 | 39,4 | 33,3–42,1 |
| innovateur (Novatek) | 30,2 | 29,9 | 31,9 | 27,4–35,8 |
| agriculteur (Mega Mart) | 31,6 | 32,2 | 33,3 | 23,2–40,2 |

- **Usines IA** : 9 à 15 par partie (11,6 actives en moyenne en fin de partie), dette IA totale moyenne 0,5 M$ en fin de partie. Guerres des prix : 32 avant, 29 après. **Faillites : 0 avant, 0 après** ; OPA : 0 et 0.
- **Lecture honnête.** (1) L'équilibre entre castes de joueurs tient au sens « aucune ne domine » : les rapports par caste vont de 0,92 à 0,99 ; mais **banquier, promoteur et agriculteur perdent 7 à 8 %** par rapport à la campagne « avant », au-delà de la cible de ~5 %, sur 1 à 2 parties chacune ; rapporté à la moyenne (avant, bruit), banquier −4 %, promoteur −8 %, industriel −8 % (tiré par une partie « bruit » exceptionnelle). Avec 12 parties et un bruit de ce niveau, on ne peut pas distinguer un effet de 3 à 5 % du hasard ; une campagne de 10 graines (`--seeds 10`, ~4 h avec 1 travailleur) le permettrait. (2) Les rivaux gagnent 2 à 9 % de valeur (castes fabricantes surtout), le promoteur IA (qui ne fabrique que des maisons, jamais rentables à ses marges) ne bouge pas : aucune IA ne domine. (3) **Aucune faillite spontanée** : la règle « faillites plausibles » n'est pas atteinte ; les IA restent bénéficiaires, leur dette est faible et remboursée. C'est un écart qui reste ouvert (§4).
- **Historique des réglages** (mêmes 12 parties, campagne arrêtée plus tôt pour les deux premières) : première version (usines à 40 % des ventes, `FAB_LAB` 0,12, jusqu'à 4 usines, pas de distribution) : −3 à −9 % sur les 4 premières parties ; usines à 30 % et 3 au plus : −3 à −11 % sur 3 parties ; distribution à 60 % : médiane 0,945 sur 8 parties ; version finale (distribution à 80 %, cours neutre des intrants, aucune usine la première année) : médiane 0,963.

**Tests ciblés** (version finale) : `t63_concurrence_ia` 21/21, `t27_rivaux` 46/46, `t25_macro_humeur` 44/44, `t30_gisements` 78/78, `t45_pouvoir_de_marche` 15/15, `t46_ecommerce` 21/21, `t09_plan_usine` 36/36, `t02_marges` 40/40 (la version intermédiaire échouait sur l'hévéa, corrigé par le seuil d'un an), `t01_erreurs` 7/7, `t05_sauvegarde` 6/6.

---

## 6. Sources

- Capitalism Lab, Beginner's Guide, Gameplay Basics : https://www.capitalismlab.com/beginners-guide-gameplay-basics/
- Capitalism Lab, Script – Competitors : https://www.capitalismlab.com/scripts/script-competitors/
- Capitalism Lab, exemple de script de concurrents : https://www.capitalismlab.com/cap_lab_files/scripts/sample_script_competitors.txt
- Capitalism Lab, Management Policies (COO) : https://www.capitalismlab.com/improvements/management-policies/
- Capitalism Lab, Improved AI : https://www.capitalismlab.com/?p=429
- Capitalism Lab, Tech-focused AI Companies : https://www.capitalismlab.com/new-features/tech-focused-ai-companies/
- Capitalism Lab, Version 11.0 : https://www.capitalismlab.com/version110/
- Capitalism Lab, Version 13.0 : https://www.capitalismlab.com/version130/
- Capitalism Lab, Game Theory in a Business Simulation : https://www.capitalismlab.com/game-theory/
- Capitalism Lab, Strategies for Market Domination : https://www.capitalismlab.com/strategies-market-domination/
- Capitalism Lab, Set default Internal Sale status : https://www.capitalismlab.com/resources/gameplay-faq/set-default-internal-sale-status/
- Capitalism Lab, Merging Subsidiary Companies : https://www.capitalismlab.com/subsidiary-dlc/merging-subsidiary-companies/
- Capitalism Lab, Acquiring a Private Company : https://www.capitalismlab.com/digital-age-dlc/acquiring-private-company/
- Capitalism Lab, Advanced Modding – Products : https://www.capitalismlab.com/mod/advanced-modding/advanced-modding-products/
- Capitalism Lab, Educational Use Guide (PDF) : https://www.capitalismlab.com/cap_lab_files/education/Capitalism_Lab_Educational_Use_Guide.pdf
- Steam, guide « Master in Capitalism 2 » : https://steamcommunity.com/sharedfiles/filedetails/?id=2969285443
- Forum Enlight, « Driving out AI competition » : http://www.enlight.com/forum/viewtopic.php?f=11&t=1535 (page non lisible directement : contenu connu par extrait de moteur de recherche, confiance C)
- Forum Enlight, « Make billions, bankrupt everyone » : http://www.enlight.com/forum/viewtopic.php?t=2760 (idem)
