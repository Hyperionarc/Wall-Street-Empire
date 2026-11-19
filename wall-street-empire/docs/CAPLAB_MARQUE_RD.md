# Marque, R&D, qualité et cycle de vie : les règles de Capitalism Lab et notre écart

*Étude du 19/11/2026, demandée par Rémy. Elle prolonge `docs/ANALYSE_CAPITALISM.md` et `docs/PARITE_SIMCITY_CAPITALISM.md` (lignes C7, C8, C11) sans les répéter.*

**Méthode.** L'étude repose uniquement sur des sources publiques : le manuel officiel de Capitalism II, les pages officielles de capitalismlab.com (guide du débutant, FAQ, nouveautés, documentation de modding), les guides Steam et le forum officiel des joueurs. Il n'y a eu ni décompilation, ni lecture de fichiers du jeu, ni copie de textes ou d'images. Chaque règle est **reformulée** en équation ou en pseudo-code à nous, avec sa source et un **niveau de confiance** :

- **A** : l'éditeur la donne avec des chiffres (manuel, page officielle).
- **B** : l'éditeur la décrit sans chiffres, ou plusieurs joueurs la mesurent de la même façon.
- **C** : une seule observation de joueur, ou une déduction de notre part.

Quand une source ne donne qu'un ordre de grandeur, nos paramètres sont **des choix de calibrage**, pas des valeurs du jeu. Le jeu a évolué de Capitalism II (2001) à Capitalism Lab (2012 et suivantes). Une règle du manuel de 2001 peut donc avoir changé : on le signale quand une source plus récente le dit.

---

## 1. Spécification algorithmique (ce que fait Capitalism Lab)

### 1.1 Note globale d'un produit (P)

**P1. Trois notes, trois poids par produit (A).** Chaque produit a trois « préoccupations du consommateur » sur 0-100 (`PRICE_CN`, `QUALITY_CN`, `BRAND_CN` dans le kit de modding). La note globale est leur somme pondérée :

```
note_globale = w_prix · note_prix + w_qualité · note_qualité + w_marque · note_marque      (w = CN / ΣCN)
```

Exemples publiés : cigarettes marque 60 / qualité 15 / prix 25, viande surgelée 20 / 40 / 40, téléphone mobile qualité 40 (dont 80 % vient de la technologie de production). Un lit pèse « à parts à peu près égales ». La barre de note du produit montre la part de chaque critère *dans la décision de l'acheteur* : si le prix baisse, la part « prix » grossit et la marque et la qualité pèsent un peu moins (manuel, « Product Rating Bars »). Les biens intermédiaires vendus entre entreprises ont une préoccupation de marque nulle et 50/50 prix-qualité (forum, **B**).

**P2. Note de prix relative au prix standard (A).** Vendre au-dessus du prix standard baisse la note de prix, vendre en dessous la monte. Le prix standard suit les salaires et l'inflation, plus une **prime de R&D** (`RD_PREMIUM`) qui n'est pas indexée. Exemple publié : smartphone 600 + 200 = 800 (la prime vaut 33 % du prix de base).

```
prix_standard = PRIX_base × indice_salaires × inflation + RD_PREMIUM
note_prix = f(prix / prix_standard), f décroissante, f(1) = point neutre
```

La forme exacte de `f` n'est pas publique : le manuel renvoie à une formule « interne » sans la donner.

**P3. Note → parts de marché (C).** Pour les joueurs, deux produits à note égale ont des revenus comparables, mais la part de marché n'est pas proportionnelle à la note : un produit 20 à 30 points moins bien noté mais beaucoup moins cher garde des clients sensibles au prix. On n'a pas trouvé de formule publique.

### 1.2 Qualité et technologie (Q)

**Q1. Qualité = part technologie + part matières (A, manuel « Quality of Manufactured Goods »).** Chaque produit a une part technologique `ts`. Le reste de la qualité vient des intrants :

```
qualité = ts · (techno_usine / techno_pointe) + (1 − ts) · qualité_intrants          (0-100)
```

Exemple du manuel, reformulé : textile, `ts` = 50 %, techno de l'usine 30, pointe mondiale 100, coton de qualité 71. Apport techno = 50 × 30/100 = 15 points, apport matières = 71 × 50 % = 35 points, qualité = 50. Une usine très expérimentée mais en retard de technologie reste médiocre.

**Q2. La pointe technologique est endogène (A).** Elle vaut 100 au départ pour chaque produit et monte quand **un** offreur lance une version de technologie supérieure. Mettre sur le marché une technologie inédite fait donc *baisser la qualité relative de tous les produits existants*.

**Q3. Rupture technologique (A, Capitalism Lab).** C'est une option : toutes les variables de technologie perdent 10 % par an, de façon continue. Elle s'applique de toute façon quand la pointe dépasse 10 000 000. L'expertise de classe la compense. Sans R&D entretenue, une avance se perd d'elle-même.

**Q4. Matières premières (A et B).** Pour une mine ou une ferme, la qualité des matières dépend du gisement ; la formation ne la change pas. Une ferme monte en qualité avec le niveau de ses unités (guide du débutant : niveau 1 → 30, niveaux 8 et 9 → 93). La qualité se propage le long de la chaîne au poids de chaque intrant. Exemple de joueur : la silice fait 50 % du verre, qui fait 5 % de la qualité du lait en bouteille, donc la silice ne compte que pour 2,5 % de ce produit.

### 1.3 R&D (R)

**R1. Le gain dépend de la durée du projet, de façon convexe (A, manuel C2).** Gain attendu pour une unité seule :

| Durée | 6 mois | 1 an | 2 ans | 3 ans | 5 ans | 10 ans |
|---|---|---|---|---|---|---|
| Gain de technologie | 1 | 3 | 7 | 11 | 20 | 50 |

Ce barème donne 2 points/an sur 6 mois et 5 points/an sur 10 ans. Les projets longs paient mieux par an, mais immobilisent l'équipe et retardent l'application.

**R2. Les rendements de la taille d'équipe sont décroissants (A).** Dans un centre, 1 à 9 unités liées forment une équipe. Multiplicateur du gain selon le nombre d'unités : 1 → 100 %, 2 → 170 %, 3 → 240 %, 4 → 295 %, 5 → 350 %, 6 → 390 %, 7 → 430 %, 8 → 455 %, 9 → 480 %. Le gain marginal par unité ajoutée passe de +70 à +25 points de pourcentage. Exemple du manuel : 20 points en 5 ans pour une unité, donc 48 points pour trois (20 × 2,4).

**R3. L'expérience compte (A).** Chaque niveau d'unité ajoute 20 % au résultat du projet. Un CTO très expert (90) fait démarrer les unités au niveau 5 : dans le guide, un téléphone-appareil photo prend 3 ans au lieu de plus de 4.

**R4. Rattrapage par diffusion (A).** Le manuel C2 dit que la recherche est plus courte quand un concurrent applique déjà une technologie supérieure (diffusion, rétro-ingénierie). Capitalism Lab donne la formule :

```
si techno_max_concurrent > 100 et techno_à_moi nettement inférieure :
    gain = gain_base × (1 + (techno_max − techno_à_moi) / techno_max)
```

Exemple publié, reformulé : à 50 contre une pointe de 500 et un gain de base de 30, le bonus vaut 27 et le gain total 57.

**R5. Expertise de classe (A).** Chaque point d'expertise de la classe de produit ajoute 1 % au rendement de la R&D. Dans Capitalism II, appliquer une nouvelle technologie à une unité de fabrication **lui faisait perdre des niveaux**, en proportion de l'écart de technologie : le matériel change et l'expérience des ouvriers devient caduque. Capitalism Lab supprime cette perte grâce à l'expertise.

**R6. La technologie s'applique usine par usine (A).** Une fois le projet terminé, il faut appliquer la technologie à chaque unité de fabrication (Apply Tech : oui, non, toutes). La qualité ne monte qu'après cette application.

**R7. Achat de technologie (A pour le mécanisme, B pour le comportement).** Le bureau du CTO ou du PDG fait une offre chiffrée à un rival qui a une meilleure technologie. Le rival accepte ou refuse, et le transfert est immédiat. D'après le guide du débutant et les forums, le leader ne vend presque jamais ; le deuxième ou le troisième vend plus volontiers. Un rival qui quitte le marché arrête sa R&D et vend sa technologie.

**R8. Invention de produits (A).** Un produit nouveau a une année à partir de laquelle on peut le rechercher (`CANINV_YR`), une durée d'invention en années (`INVENT_YR`, raccourcie par le niveau et la taille de l'équipe) et jusqu'à deux produits prérequis (`PARENT1/2`). Le DLC Subsidiary ajoute une « R&D radicale » : sauts plus grands et plus courts, avec un taux de succès affiché, mais il faut un CTO. Aucun chiffre n'est publié (**B**).

**R9. Brevets (C, par absence).** Aucune source publique ne décrit de brevet dans Capitalism II ni dans Capitalism Lab. La protection d'une avance passe par le secret (le leader ne vend pas sa technologie) et par la vitesse de R&D. **Les brevets de WSE (passe 47) sont une invention de notre jeu**, pas une parité.

### 1.4 Marque (M)

**M1. Note de marque = notoriété + fidélité (A).** Chacune va de 0 à 100. La notoriété mesure la part de la ville qui connaît la marque et la profondeur de cette connaissance ; la fidélité, la part des clients fidèles et l'intensité de leur fidélité. D'après les joueurs, la note de marque *utile* plafonne à 100 dans la note globale (**B**). La fidélité semble bornée par la notoriété : `|fidélité| ≤ notoriété` (**C**).

**M2. La notoriété vient de la publicité seule et s'oublie lentement.**
- La publicité passe par des médias (télévision, radio, presse, puis Internet) qui ont un CPM et un audimat en « rating points » (**A**).
- D'après la mesure d'un joueur (**B**), le gain de notoriété est proportionnel à la dépense, versée en trois tranches par mois. Il est plafonné par la somme des rating points des médias choisis, elle-même bornée à 100. Atteindre 100 coûte environ 10 $ par habitant et par produit.
- Le niveau de l'unité de publicité ne compte pas. Le CMO améliore l'efficacité jusqu'à doubler l'effet à 100 d'expertise (**A** pour le principe, **B** pour le chiffre).
- Sans publicité, la notoriété baisse d'environ 1 à 2 points par mois (**B**, plusieurs joueurs, vitesse exacte inconnue). Une bonne part de marché la fait monter de quelques points sans publicité, environ 1 point tous les 7 ou 8 mois (**B**).

**M3. Pas de fidélité sans essai (A pour le principe, B et C pour les chiffres).**
- La page officielle « How Branding Works » le dit : la fidélité ne naît qu'après un achat, et une notoriété plus haute fait essayer plus de clients, donc la fidélité se construit plus vite.
- Une bonne expérience la monte, une mauvaise la baisse, et elle peut devenir négative : le client évite alors la marque. La qualité doit être *régulière*.
- D'après les joueurs, la fidélité croît lentement, de 0,5 à 1 point par mois. Elle croît plus vite quand le produit se vend beaucoup et qu'il est bien noté, et plus lentement quand on monte les prix pour profiter de sa marque.
- Les ruptures de stock et une qualité inférieure à celle des concurrents locaux l'usent (**B**). Une moyenne mobile des expériences garde longtemps une fidélité négative (**C**).
- Le manuel est explicite sur un point : **saturer la ville de publicité alors qu'on ne peut pas servir la hausse de demande** nuit à la fidélité.

**M4. Trois stratégies de marque (A).**
- *Marque d'entreprise* : une seule marque pour tout. Un nouveau produit coûte moins cher à faire connaître, mais la fidélité est plus faible (la firme ne paraît pas spécialisée) et un échec n'importe où abîme toute la marque.
- *Marque de gamme* : une marque par classe de produits. Mêmes avantages et inconvénients, atténués.
- *Marque unique* : une marque par produit. Aucune contagion entre produits, mais chaque produit doit financer sa propre publicité.
- Faire connaître toute une gamme coûte environ la moitié de la somme des campagnes par produit (**C**).
- La marque de distributeur (*private label*) rebaptise des produits achetés. Elle profite tout de suite d'une marque établie, mais **abîme toute la famille de marque** si sa qualité est inférieure (**A**).

**M5. Méga-classes (A, sans chiffres).** Une marque d'entreprise concentrée sur une méga-classe (Mode, Alimentation et boissons, Santé et beauté, Électronique et électroménager, Luxe) étend son effet à toutes les classes de cette méga-classe. Sur plusieurs méga-classes, la fidélité baisse : on ne fait pas confiance à une marque qui vend à la fois des médicaments et des jouets. Un joueur rapporte qu'une ville où il vendait trois méga-classes avait une fidélité proche de 0 malgré une notoriété de 100 (**C**).

**M6. Changer de stratégie de marque remet toutes les marques à zéro (A).** Le jeu prévient avant le changement. D'où le conseil officiel : choisir sa stratégie dès le début.

**M7. La marque est locale (B).** Notoriété et fidélité se mesurent ville par ville, et la publicité ne vaut que dans la ville du média. *WSE n'a qu'une ville : cette règle est hors sujet pour l'instant.*

### 1.5 Cycle de vie et obsolescence (O)

**O1. Obsolescence de la demande (A).** `OBSOLETE` (0-100) est la baisse annuelle de la demande du produit, en pourcentage, sans aucun déclencheur (cigarettes : 2 %/an). Elle porte sur **le marché**, pas sur une firme : tous les offreurs la subissent.

**O2. Remplacement (A).** `OUTBY` désigne le produit remplaçant, `OUTSPEED` la vitesse du transfert, `OUTREMAIN` la part de la demande qui reste (40 → 60 % passent au remplaçant). Le transfert commence quand le remplaçant **est vendu**, par n'importe qui. Il peut atteindre 100 % : le guide prend l'exemple des téléphones mobiles. Le guide conseille de lancer la R&D du remplaçant dès qu'on commence à fabriquer un produit, et note qu'un ancien produit « peut rapporter pendant des années ».

**O3. Pas de mort par l'âge (B).** Aucune source ne décrit de déclin lié à l'âge d'un produit chez une firme. Un produit ancien recule par l'obsolescence O1, par le remplacement O2 et par la perte de qualité relative (Q2 et Q3) quand ses concurrents progressent et pas lui.

### 1.6 IA concurrentes (IA)

- **IA1 (B).** Les développeurs affirment que l'IA utilise le même code de demande que le joueur, sans handicap (réponse d'un modérateur du forum).
- **IA2 (B).** L'IA fait de la R&D et fait monter la pointe technologique. Sans expertise, il faut au joueur plusieurs centres ou un CTO spécialisé pour la suivre. Les rivaux dirigés par un PDG expert de la classe sont plus forts (réglage « Competitor Expertise Level »).
- **IA3 (B).** Les concurrents locaux réagissent quand on casse les prix. Un rival bien implanté n'entre que s'il a un net avantage de qualité ou de marque. Les rivaux achètent les composants de qualité du joueur pour fabriquer leurs propres versions, ce qui rogne son avantage. Le joueur peut l'empêcher avec la vente interne.
- **IA4 (C).** Une filiale laissée à l'IA a déjà dépensé en publicité plus que son chiffre d'affaires. Une seule observation : on ne peut pas en tirer de règle.

### 1.7 Boucles de rétroaction et choix stratégiques

1. **Qualité → note → ventes → expertise → R&D plus efficace → qualité.** La boucle est lente. La rupture technologique (Q3) la freine : il faut payer la R&D chaque année rien que pour garder sa place.
2. **Publicité → notoriété → essais → fidélité (si la qualité suit) → note de marque → prime de prix.** La fidélité est l'actif durable. Une publicité sans qualité, ou sans stock, la détruit (M3).
3. **Prix bas → part de marché → fidélité.** C'est la tactique du guide : entrer moins cher, puis remonter le prix une fois la marque construite. Les joueurs visent une note globale environ 7 points sous celle des concurrents pour prendre plus de 50 % du marché, puis remontent le prix jusqu'à égaliser.
4. **Choix selon les poids.** On choisit le levier d'après les poids du produit (P1) : cigarettes = publicité, viande = prix et qualité, téléphone = R&D. Le joueur qui investit partout perd de l'argent.
5. **Timing.** Il faut attendre une avance technologique *et* des capacités suffisantes avant de lancer une grosse campagne. Sinon la demande créée n'est pas servie et la fidélité baisse (M3).

---

## 2. Écart avec Wall Street Empire

Code lu : `scoreW`, `productScore`, `attractiveness`, `bcStep`, `bcSig`, `brandVolM` et `brandPrem` (marque cumulative), la mise à jour quotidienne des produits dans `step()` (notoriété `ps.brand`, perception `ps.rt`, fidélité `ps.loy`), `stepRivBrand`, `trueQ`, `updInputQ`, `stepProdTech`, `techFront`, `stepAdoption`, `outMul`, `OBSO`, `SUCC`, `launchProduct`, `changeTier`, `patGrant` / `patStep` / `patRevDay` (passe 47), `mpProdEntry`, `techMults`, `eduBrand` (passe 43) et `BRAND_STRAT`.

Gravité, du point de vue du joueur : **haute** = la règle change la stratégie à adopter ; **moyenne** = réalisme visible, effet sur la stratégie limité ; **basse** = détail.

| Règle | Capitalism Lab (public) | Chez nous (avant l'étude) | Écart | Gravité |
|---|---|---|---|---|
| P1 poids par produit | Trois préoccupations par produit | `PROD_W` par produit, glissement des poids selon le PIB | Aucun (plus riche) | — |
| P2 prix standard | Indexé sur les salaires et l'inflation, plus une prime de R&D non indexée (jusqu'à 33 %) | `stdPrice` identique, prime de R&D plafonnée à 8 % | Prime de R&D plus faible | basse |
| P2 note de prix | Au-dessus du standard elle baisse, en dessous elle monte | Idem, avec un plateau sans pénalité jusqu'au prix accepté par la marque | Aucun | — |
| Q1 qualité | `ts` × techno / pointe + (1 − `ts`) × intrants | `trueQ` = base de la gamme × (part intrants × `fi` + `ts` × techno / pointe) ; `fi` = 0,85 à 1,15 | Les intrants ne pèsent que ±15 % et la gamme fixe la base | moyenne |
| Q2 pointe endogène | Monte quand un offreur lance mieux | `techFront` = 100 + 4 points/an, exogène ; le joueur peut monter jusqu'à 1,4 × la pointe sans la déplacer | Une avance du joueur ne déclasse pas les rivaux | moyenne |
| Q3 rupture −10 %/an | Option continue | `ps.tc` −10 %/an | Aucun | — |
| R1 durée convexe | Projets de 6 mois à 10 ans, barème convexe | Entretien continu (`rdPower`) ; développement produit à durée fixe | Pas de choix de durée | basse |
| R2 taille d'équipe | Rendements décroissants (×4,8 pour 9 unités) | Gain linéaire en unités de R&D | Pas de rendements décroissants | basse |
| **R3 cibler un produit** | Chaque équipe travaille sur **le** produit choisi | Effort réparti **uniformément** sur tous les produits lancés (÷ n/3) | **Le joueur ne peut pas concentrer sa R&D** | **haute** |
| **R4 rattrapage** | Gain × (1 + retard / pointe) | Rien : un produit en retard (techno 50 contre 104) reste à 51 après un an | **Absent** | **haute** |
| R5 expertise | +1 %/point ; perte de niveau à l'application (C2) | +1 %/point de méga-classe, +4 par R&D réussie | Aucun (pas de perte de niveau, comme dans Lab) | — |
| R6 application par usine | Application usine par usine | Automatique | Simplification assumée | basse |
| R7 achat de technologie | Offre au rival, le leader refuse souvent | Licence de marché (30 % de la R&D + 3,5 % de redevance), licence des brevets rivaux | Mécanisme voisin | basse |
| R9 brevets | Absents | Passe 47 : brevets de produit, licences, rivaux | Ajout de WSE (voulu, sans paiement réel) | — |
| M1 notoriété + fidélité | Somme bornée à 100 | Note de marque = 0,65 × notoriété + 0,35 × fidélité, plus le capital cumulatif `bc` | Équivalent | — |
| **M2 oubli de la notoriété** | Baisse lente, environ 1 à 2 points par mois | `ps.brand` revenait vers la cible à 7 %/jour dans les deux sens : 99 → 11 en 30 jours, → 0 en 90 jours après la coupure | **Oubli 30 à 60 fois trop rapide** : la publicité était une dépense de flux, la stratégie « campagne puis prix » était impossible | **haute** |
| **M3 pas de fidélité sans essai** | Fidélité après achat, plus vite avec la notoriété, bornée par elle | Cible = 0,5 × perception + 0,3 × stock + 0,2 × prix : **44 de fidélité en 120 jours sans aucune publicité ni vente** (note de marque 15 offerte) | **Fidélité gratuite** | **haute** |
| M3 qualité relative | En dessous des concurrents, la fidélité s'use | Qualité absolue | Pas de comparaison au marché | moyenne |
| M3 publicité sans stock | Nuit à la fidélité (manuel) | Seulement pendant les chocs de la passe 43 | Partiel | moyenne |
| M4 stratégies de marque | Entreprise, gamme, unique | `BRAND_STRAT` : les trois, avec leurs effets | Aucun | — |
| M4 marque de distributeur | Rebaptiser, risque pour la famille | Absente | Absent (déjà noté en C7) | basse |
| M5 méga-classes | Contagion intra, dilution inter | `MEGA_OF`, `corpLoyF` (−8 % de fidélité par méga-classe) | Aucun | — |
| **M6 changement de stratégie** | Remet toutes les marques à zéro | Gratuit et sans effet sur les marques | **Exploit** : on change de stratégie selon l'écran | **moyenne** |
| O1 obsolescence | Baisse annuelle de la demande, sans déclencheur | `ps.obs` par produit après un an, remis à 1 à chaque montée de gamme, plancher 0,3 | La relance de gamme remet l'obsolescence à zéro | basse |
| O2 remplacement | `OUTBY`, `OUTREMAIN`, dès que le remplaçant est vendu | `SUCC` : date ou adoption du successeur | Aucun | — |
| O3 pas de mort par l'âge | Aucun déclin lié à l'âge | `stepAdoption` : adoption −0,0012/jour × (1 + (âge − 420)/400) au-delà de 420 jours, compensée par le bouche-à-oreille (mesuré : 0,97 → 0,91 de l'âge 540 à 1 260 jours) | Effet faible, mais sans fondement dans la référence | basse |
| IA2 R&D des rivaux | Les rivaux font monter la pointe | La pointe monte seule de 4 points/an ; les rivaux n'ont pas de technologie | La pointe exogène tient lieu de R&D des rivaux | moyenne |
| IA3 copie | Les rivaux achètent tes composants et copient | `mpProdEntry` : un produit à prime forte et durable finit copié | Aucun | — |
| IA publicité | Même code que le joueur | `stepRivBrand` : capital par profil, riposte | Aucun | — |

---

## 3. Ce qui a été implémenté (un commit par écart)

Écarts traités, par ordre d'impact sur le plaisir de jeu et le réalisme. Aucun ne plafonne l'argent gagné, ne touche à la spéculation ni à l'agriculture, et ne modifie les marges du modèle de pouvoir de marché. Les brevets restent sans paiement réel. Champs de sauvegarde : seul `rdf` (produit prioritaire) est ajouté ; la clé reste `wse-city-v8`, et une ancienne sauvegarde se charge sans lui.

1. **M2, oubli lent de la notoriété** (`awStep`, `AW_UP` = 0,07, `AW_HL` = 120 jours). La notoriété monte comme avant (7 %/jour vers la cible publicitaire) mais redescend avec une demi-vie de 120 jours au lieu d'environ 10. Effet de jeu : une campagne devient un investissement ; « campagne de quelques mois puis hausse de prix » marche comme dans Capitalism. Calibrage : la source dit 1 à 2 points par mois, et notre temps est compressé (1 an de brevet = 120 jours), donc 120 jours est un choix, cohérent avec la demi-vie du capital de marque `bc`.
2. **M3, fidélité gagnée par l'essai** (`loyTarget`, `loyStep`, `loyQRef`).
   ```
   vitesse = 0,02 × (vendu ? 0,25 + 0,75 × notoriété/100 : 0,15)
   qualité_relative = perception + 0,5 × (perception − qualité_moyenne_du_marché)   (marché mûr : moyenne des offres ; sinon gamme standard 62)
   cible = min(cible_d'avant(qualité_relative), 30 + 0,7 × max(notoriété, 0,6 × capital))
           − 40 × (part non servie − 0,25)⁺ × puissance_pub/1,5      (publicité qui crée une demande qu'on ne sert pas)
   ```
   Sans notoriété, la fidélité plafonne vers 30 et monte lentement. Avec une forte notoriété et des ventes, elle atteint ses anciens niveaux.
3. **R3 et R4, projet R&D prioritaire et rattrapage** (`rdFocW`, `rdSetFocus`, `rdCatch`, `rdTechRows`). Le produit prioritaire reçoit 3 fois la part d'un autre produit (au plus la moitié de l'effort), sans changer l'effort total. Un produit en retard gagne `× (1 + retard/pointe)`, plafonné à ×1,9 (formule publiée de Capitalism Lab). Le Bureau du PDG > R&D et brevets ajoute une section **Technologie de tes produits** : niveau, pointe, qualité réelle, points par an (dont le rattrapage) et un bouton « Prioriser ».
4. **M6, changer de stratégie de marque remet les marques à zéro** (`setBrandStrat`). Notoriété et capital passent à 0, la fidélité revient au niveau d'un lancement (20 au plus). C'est gratuit tant qu'aucune marque n'est construite. L'écran Marque prévient.

Chiffres avant/après et résultats des tests : voir § 5.

---

## 4. Ce qui reste incertain ou non traité

- **Formules exactes non publiques** : la fonction note de prix `f`, la conversion note → part de marché, la vitesse d'oubli de la notoriété et la croissance de la fidélité. Les chiffres viennent de mesures de joueurs (confiance **B** ou **C**), et nos paramètres sont des calibrages.
- **Q2, pointe endogène** : non traité. Il faudrait des rivaux avec une technologie par produit pour qu'une avance du joueur déclasse leurs offres. Effort M ; c'est le prochain écart à combler, avec IA2.
- **Q1, poids réel des intrants** : chez nous la gamme (premier prix / premium / haut de gamme) fixe la base de qualité et les intrants ne déplacent que ±15 %. Revenir à la formule de Capitalism changerait l'équilibre des gammes (t10, t59) et demanderait une passe de calibrage dédiée.
- **R1 et R2, durée et taille d'équipe** : non traités. Introduire des rendements décroissants affaiblirait les centres de R&D existants sans gain de plaisir évident.
- **O3, déclin par l'âge** : conservé (effet mesuré faible). À supprimer si on veut une parité stricte.
- **M4, marque de distributeur** : absente, déjà notée en C7.
- **Brevets** : aucun équivalent dans Capitalism. Notre système est un choix de design, pas une parité.

## 5. Validation

**Sonde ciblée.** Même scénario avant et après (6 immeubles, 1 grand magasin, smartphone, pain, téléviseur et lave-linge lancés, conjoncture figée, mode non mûr) :

| Mesure | Avant | Après |
|---|---|---|
| Fidélité au jour 120, sans publicité ni vente (smartphone) | 44 | 23 |
| Note de marque offerte sans publicité | 15 | 8 |
| Notoriété 30 j après une campagne coupée (partie de 99) | 11 | 83 |
| Notoriété 90 j après la coupure | 0 | 59 |
| Capital de marque 90 j après la coupure | 29 | 27 (inchangé, par construction) |
| Smartphone à techno 50 (pointe 100 → 104), 1 centre de R&D, 6 produits, 1 an | 50 → 51 | 50 → 54 en rattrapage seul, 50 → 64 en prioritaire |
| Produit à la pointe, 1 centre, 6 produits, 1 an | −3,5 points | +3,7 points s'il est prioritaire (les autres : −5,1 au lieu de −3,6) |

**Campagne de simulation** (`tools/sim_batch.js`, 1 travailleur, 1 200 jours, 3 graines × castes industriel et innovateur, profil industriel) : valeur finale moyenne 93,2 M$ avant, 97,3 M$ après (+4,4 %, entre −3 % et +9,7 % selon la partie, donc dans le bruit des graines). Le bot reste premier dans les six parties. Aucune erreur de page, aucun stock négatif. Le bot ne fait pas de publicité : le durcissement de la fidélité ne l'a pas pénalisé de façon mesurable, et le rattrapage technologique l'aide un peu.

**Tests.** `t62_marque_rd` 15/15 (nouveau), `t18` 20/20, `t43` 25/25, `t45` 15/15, `t47` 30/30, `t14` 19/19, `t02` 40/40, `t10` 31/31. Deux premiers passages de `t10` ont échoué sur un `page.goto` dépassant 30 s : la machine était chargée (moyenne de charge ≈ 30, d'autres simulations tournaient). Relancé seul, il passe. La version d'avant passe aussi.

## Sources

- Manuel officiel de Capitalism II (Enlight, 2002), chapitres « Product Rating », « Quality of Manufactured Goods », « Research & Development », « Advertising Unit », « Private Labeling », « Headquarters » : https://www.mogelpower.de/manuals/Capitalism_2_English_Manual.pdf (aussi sur Steam : https://cdn.cloudflare.steamstatic.com/steam/apps/638200/manuals/Cap2_manual.pdf)
- Capitalism Lab, guide du débutant : https://www.capitalismlab.com/beginners-guide-gameplay-basics/
- Capitalism Lab, How Branding Works : https://www.capitalismlab.com/?p=4374
- Capitalism Lab, FAQ : https://www.capitalismlab.com/?p=743
- Capitalism Lab, Technology Research (formule de rattrapage) : https://www.capitalismlab.com/digital-age-dlc/technology-research/
- Capitalism Lab, Technology Disruption : https://www.capitalismlab.com/new-features/technology-disruption/
- Capitalism Lab, Product Class Expertise : https://www.capitalismlab.com/new-features/product-class-expertise/
- Capitalism Lab, Mega Product Class : https://www.capitalismlab.com/improvements/mega-product-class/
- Capitalism Lab, Advanced Modding – Products : https://www.capitalismlab.com/mod/advanced-modding/advanced-modding-products/
- Capitalism Lab, Radical R&D Unit : https://www.capitalismlab.com/subsidiary-dlc/radical-rd-unit/
- Forum, « What I've learned about Advertising » : https://www.capitalism2.com/forum/viewtopic.php?t=8339
- Forum, « brand loyalty turns negative. why? » : https://www.capitalism2.com/forum/viewtopic.php?f=11&p=11644&t=1965
- Forum, « Corporate Brand Strategy; Positive Examples » : https://www.capitalism2.com/forum/viewtopic.php?f=11&t=2508
- Forum, « Raw Materials: High quality or low quality? » : https://www.capitalism2.com/forum/viewtopic.php?t=3921
- Forum, « Price » : https://www.capitalism2.com/forum/viewtopic.php?t=568
- Forum, « how to catch up with AI's technology » : https://capitalism2.com/forum/viewtopic.php?t=3800
- Forum, « Advertising overhaul? » : http://www.enlight.com/forum/viewtopic.php?f=14&t=689
- Guide Steam « Master in Capitalism 2 » : https://steamcommunity.com/sharedfiles/filedetails/?id=2969285443
