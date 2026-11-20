# Passe « équilibre économique » (priorités 2 et 5 de Rémy)

But : rééquilibrer l'économie après la croissance de ville à plusieurs millions d'habitants, les rivaux fabricants, la qualité des fournisseurs, le COO et la marque/R&D,
sans plafond artificiel sur l'argent gagné, avec des marges pilotées par le pouvoir de marché et un début de partie accueillant (10 M$ Normal / 100 M$ Facile).
Test : `tools/tests/t65_equilibre.js`. Outils : `tools/sim_batch.js` (nouvelle option `--native`), `tools/bot_lib.js` (bot banquier qui prête).

## 1. Protocole de mesure

Toutes les parties : Round Normal (10 M$), événements actifs, 1 800 jours (le quart d'un Round de 90 minutes), 1 travailleur, machine partagée avec d'autres agents.

- **Personas** (`--personas --seeds 3`, 12 parties) : le protocole de `docs/CAPLAB_CONCURRENCE_IA.md` (hardcore = profil rapide, joueuse = bon, ado = casual, fermier), castes tournantes.
- **Bon joueur** (`--profiles bon --seeds 2`, 12 parties) : les six castes jouées par le même bot de commerce et services.
- **Métier** (`--native --seeds 3`, 18 parties, nouveau) : les six castes sur la **même graine** (6000, 7000, 8000), chacune jouée par le bot qui exploite son métier :
  agriculteur = fermes et chaînes agricoles, industriel et négociant = mines, usines et exports, banquier = bon joueur qui prête sa banque, promoteur et innovateur = bon joueur.
- **Long** (`--profiles bon --seeds 1 --days 7200`, 6 parties) : un Round complet.
- **Banc déterministe** (hors dépôt) : même portefeuille de ville (3 supérettes, 2 supermarchés, 1 hypermarché, tour tech, banque, 2 bureaux) pour chaque caste, macro figée, 180 jours.

**Bruit.** Les parties bot sont chaotiques : un seul tirage de plus dans le flux des rivaux suffit à changer une partie de 0,35 à 2,9 fois sa valeur (mesure de la passe
concurrence). Ici, une même caste rejouée sur deux graines voisines varie peu (± 3 %), mais une graine éloignée peut changer le promoteur de 140 à 194 M$. Avec 2 à 3 parties
par caste, un écart de moins de 10 à 15 % entre castes n'est pas significatif.

## 2. Diagnostic (version de départ, `b091d25`)

### Trajectoire de valeur

| Campagne | Moy. géo. j 1 800 | Entrepreneur 25 M$ | Industriel 70 M$ | Magnat 250 M$ |
|---|---:|---:|---:|---:|
| Personas (12) | 138 M$ | j 204 à 540 | j 816 à 1 300 | jamais avant j 1 800 |
| Bon joueur (12) | 137 M$ | j 400 à 500 | j 1 000 à 1 300 | jamais |
| Métier (18) | 181 M$ | j 204 à 600 | j 714 à 1 300 | j 1 734 (agriculteur seul) |

Round complet (bot bon joueur, 7 200 jours = 90 min) :

| Caste | 25 / 70 / 250 / 700 M$ / 1 Md$ (jour) | Valeur j 1 800 / 3 600 / 5 400 / 7 200 | Meilleur rival à la fin | Résultat |
|---|---|---|---:|---|
| agriculteur | 500 / 1 300 / 2 800 / 4 100 / – | 114 / 632 / 793 / 835 M$ | 1 435 M$ | 2e, temps écoulé |
| banquier | 500 / 1 100 / 2 500 / 3 600 / 6 580 | 136 / 734 / 861 / 1 000 M$ | 1 174 M$ | victoire à 82 min |
| négociant | 500 / 1 200 / 3 000 / 4 400 / – | 119 / 516 / 774 / 871 M$ | 1 352 M$ | 2e, temps écoulé |
| industriel | 500 / 1 200 / 2 800 / 3 600 / 5 156 | 116 / 723 / 1 000 M$ | 544 M$ | victoire à 64 min |
| promoteur | 400 / 1 000 / 2 200 / 3 000 / 6 052 | 186 / 832 / 983 / 1 002 M$ | 757 M$ | victoire à 76 min |
| innovateur | 400 / 1 100 / 2 100 / 2 800 / 3 188 | 163 / 1 001 M$ | 168 M$ | victoire à 40 min |

**Vitesse.** La courbe attendue du Round (`CURVE`) prévoit 55 M$ au jour 1 800 ; les bots y sont à 110-280 M$ (2 à 5 fois au-dessus), donc en « surchauffe » dès le jour ~1 300.
Malgré cela, sur un Round complet un bon joueur atteint le milliard entre 40 et 82 minutes ou pas du tout, et les rivaux montent à 0,5-1,4 Md$ avec la mégapole de 4 à 6 millions
d'habitants : l'objectif « 1 Md$ en 90 minutes » reste disputé, la fin de partie n'est pas trop facile. Le début est rapide (paliers Entrepreneur à 3-7 min, Industriel à 9-16 min).
Pas de correction de rythme dans cette passe (voir §5).

### Constats

1. **Mission « Capitalisation de 10 M$ » gratuite** : le joueur démarre à 10 M$ en Normal, la mission (seuil 0,4 × palier Entrepreneur = 10 M$) se validait dès la première seconde
   et payait 800 000 $ ; en **Facile (100 M$)**, trois missions (10 M$, Entrepreneur 25 M$, Industriel 70 M$) payaient **9,8 M$ et 1 point de connaissance** au départ ; scénarios 2
   et 3 (12 et 15 M$ de départ) : 800 000 $. Les autres missions et les jalons de scénarios (affichage seul, sans prime) ne se valident pas au départ (vérifié sur les 6 castes × 8 modes).
2. **Aucune faillite spontanée** : 0 faillite sur 42 parties. Les IA gagnent 10 à 25 % par an sur leurs actifs, ne s'endettent que pour leurs usines (≤ 30 %, dette moyenne finale
   0,0 à 0,3 M$), remboursent dès qu'elles peuvent : rien ne peut les faire tomber.
3. **L'agriculteur n'est pas faible quand il cultive.** Le constat « agriculteur 6e sur 6 à ~21 M$ » ne se reproduit pas (110 M$ et 1er en personas). Joué par le bot de commerce
   (qui n'utilise aucun de ses bonus), il vaut ce que valent toutes les castes sans bonus applicable (0,84). Joué par le bot fermier, c'est **la caste la plus forte** :
   271-283 M$, 1,52 à 1,68 fois la moyenne, Magnat avant le jour 1 800. Banc déterministe : 6 fermes rapportent 7,1 M$/an à l'agriculteur contre 0,9 à 1,2 M$/an aux autres castes
   (fermes −25 % et rendement +15 % sur des marges agricoles minces). Aucun rééquilibrage de l'agriculture n'est donc justifié (et la consigne interdit de la dégrader).
4. **Le négociant « faible » est un artefact de bot** : joué en commerce, 0,71 à 0,85 (aucun bonus applicable) ; joué en mines, usines et exports (son métier), 185 à 193 M$, autant que
   l'industriel. Essai écarté : achats −4 % → −8 % : +0,7 % de flux sur le portefeuille de ville (les magasins importent peu), aucun effet mesurable en partie, annulé.
5. **Banquier, la vraie caste faible** : 0,80 à 0,83 en métier. Sa banque (100 M$ de CET1) prête 95 à 190 M$ mais ne lui versait que 20 % des intérêts **bruts** ; les réserves de
   la banque ne comptaient nulle part dans sa valorisation (bot qui prête : 132-164 M$, comme sans prêter).
6. **Promoteur et innovateur** : forts avec le bot de commerce (1,40 et 1,19 sur 2 graines voisines), moyens sur les graines du protocole métier (0,91 et 0,81). Banc déterministe :
   leurs bonus valent +5 % et +2 % de rendement sur un même portefeuille de ville. Pas d'écart robuste : pas de correction.

## 3. Corrections (un commit chacune)

| Commit | Correction | Avant → après |
|---|---|---|
| `6111115` | **Missions** : « Capitalisation » vise 15 M$ (0,6 × Entrepreneur) ; toute mission de capitalisation dont le seuil ne dépasse pas le capital de départ (`S.mode.w0`) est cochée « atteint au départ » sans prime ni point (`S.mode.mfree`, sauvegardé avec le mode) | Normal : 800 000 $ gratuits → 0 ; Facile : 9,8 M$ + 1 point → 0 ; scénarios 2-3 : 800 000 $ → 0 ; la mission paie toujours quand 15 M$ sont réellement atteints |
| `acc224d` | **Rivaux** : une IA sur quatre environ est aventureuse (tirage déterministe au premier jour, `r.gs`) : obligations jusqu'à 70 % de ses actifs bruts pour s'étendre et pour ses actions de caste ; prime de risque `+8 pts × (levier − 30 %)` ; échéance annuelle d'un quart de la dette, refusée par les créanciers si levier > 80 %, ou en récession / crise du crédit si levier > 50 % ou couverture < 1,5 ; sous surveillance : échéances trimestrielles, ventes forcées décotées de 25 % ; insolvabilité si dette > 95 % des actifs | 0 faillite sur 42 parties → 5 parties sur 17 (métier) et 1 sur 12 (bon joueur) avec une faillite ; refus de reconduction dans 14 parties sur 17 |
| `2af07a2` | **Banquier** : dividende = 20 % du résultat **net** de la banque, prélevé sur ses fonds propres ; la valorisation compte les fonds propres au-delà de la dotation de 100 M$ (`bkEquity`), pertes comprises | Banquier métier 145 → 172 M$ (0,80 → 0,97 de la moyenne) |
| `e16f6ba` | Outils : `sim_batch --native`, relevé des IA aventureuses et des refus de crédit, bot banquier qui prête (`P.bank`) | – |
| `bbeb20d` | Test `t65_equilibre` | 17/17 |

## 4. Mesures après (version finale)

### Métier : 17 parties appariées (même caste, même profil, même graine)

| Caste | Avant moy. géo. (M$) | / moyenne | Après (M$) | / moyenne | Après / avant |
|---|---:|---:|---:|---:|---:|
| agriculteur | 275,5 | 1,52 | 262,4 | 1,48 | 0,95 |
| banquier | 145,3 | 0,80 | 171,5 | 0,97 | 1,18 |
| négociant | 189,1 | 1,04 | 180,5 | 1,02 | 0,95 |
| industriel | 180,2 | 1,00 | 180,2 | 1,02 | 1,00 |
| promoteur | 164,4 | 0,91 | 144,3 | 0,81 | 0,88 |
| innovateur | 146,6 | 0,81 | 134,3 | 0,76 | 0,92 |
| toutes | 181,1 | 1 | 177,4 | 1 | 0,98 |

Après / avant par partie : médiane 0,995, de 0,67 (promoteur, graine 8000) à 1,30 (banquier, graine 7000).

| IA (caste) | Valeur moy. finale avant (M$) | après | Dette moy. avant | après | Plus faible après |
|---|---:|---:|---:|---:|---:|
| agriculteur (Mega Mart) | 41,7 | 43,2 | 0,0 | 15,9 | 23,9 |
| banquier (Luxor) | 43,3 | 31,6 | 0,0 | 6,7 | 7,6 |
| négociant (DiscountCo) | 41,0 | 42,2 | 0,0 | 13,0 | 29,4 |
| industriel (Vulcan) | 42,3 | 46,0 | 0,1 | 21,7 | 32,3 |
| promoteur (Atlas) | 57,5 | 55,2 | 0,0 | 14,4 | 38,9 |
| innovateur (Novatek) | 38,2 | 43,9 | 0,0 | 23,5 | 24,2 |

### Bon joueur : 12 parties appariées (missions et rivaux seulement, avant la correction du banquier)

| Caste | Avant (M$) | / moyenne | Après (M$) | / moyenne | Après / avant |
|---|---:|---:|---:|---:|---:|
| agriculteur | 114,2 | 0,84 | 110,8 | 0,87 | 0,97 |
| banquier | 139,2 | 1,02 | 141,4 | 1,11 | 1,02 |
| négociant | 116,1 | 0,85 | 114,3 | 0,90 | 0,99 |
| industriel | 113,7 | 0,83 | 116,2 | 0,91 | 1,02 |
| promoteur | 190,7 | 1,40 | 145,8 | 1,14 | 0,76 |
| innovateur | 162,2 | 1,19 | 141,5 | 1,11 | 0,87 |
| toutes | 136,6 | 1 | 127,5 | 1 | 0,93 |

### Personas : 11 parties appariées (version finale ; la 12e, fermier innovateur 7003, non terminée à temps)

| Partie | Avant (M$) | Après (M$) | Après / avant |
|---|---:|---:|---:|
| hardcore, agriculteur, 7001 | 109,7 | 111,3 | 1,01 |
| joueuse, banquier, 7001 | 134,1 | 137,7 | 1,03 |
| ado, négociant, 7001 | 124,4 | 124,4 | 1,00 |
| fermier, industriel, 7001 | 180,0 | 153,4 | 0,85 |
| hardcore, banquier, 7002 | 142,6 | 140,7 | 0,99 |
| joueuse, négociant, 7002 | 113,7 | 108,6 | 0,96 |
| ado, industriel, 7002 | 124,3 | 119,0 | 0,96 |
| fermier, promoteur, 7002 | 194,1 | 162,0 | 0,83 |
| hardcore, négociant, 7003 | 111,8 | 107,7 | 0,96 |
| joueuse, industriel, 7003 | 110,1 | 105,3 | 0,96 |
| ado, promoteur, 7003 | 153,8 | 148,0 | 0,96 |

Après / avant : moyenne géométrique 0,954, médiane 0,963, de 0,83 à 1,03 (le joueur banquier « bon » ne prête pas sa banque : la correction du banquier ne joue pas ici).
Aucune faillite dans ces 11 parties, mais des refus de reconduction dans 5 ; les IA aventureuses finissent plus grosses (Mega Mart 46 → 56 M$ en moyenne).
Paliers inchangés (Entrepreneur au jour médian 500, Industriel 1 296).

## 5. Lecture honnête et limites

- **Gratuité au départ** : corrigée et testée (t65 : 8 modes × caste industriel, Facile compris).
- **Faillites plausibles** : atteintes. Une faillite dans 5 parties métier sur 17 (toujours une IA aventureuse ou une IA prise dans un refus de reconduction en récession), 1 sur 12 en
  bon joueur, 0 sur 11 en personas (refus de reconduction dans 5) ; les autres IA aventureuses frôlent la faillite (valeur tombée à 7,6-24 M$) ou s'en sortent plus grosses. Le siège vacant est repris 45 jours plus tard par une nouvelle IA.
- **Castes** : l'écart extrême (plus forte / plus faible, en métier) passe de 1,90 à 1,95 : **pas resserré**. Le banquier est remonté (0,80 → 0,97) ; en contrepartie, les rivaux
  aventureux, qui ouvrent des magasins à crédit, pèsent surtout sur les castes de commerce de ville (promoteur 0,91 → 0,81, innovateur 0,81 → 0,76 ; en bon joueur 0,76 et 0,87
  d'une campagne à l'autre). Sur 2 à 3 parties par caste, ces deux baisses restent dans le bruit d'une graine (le promoteur perd 33 % sur une graine et gagne 5 % sur une autre),
  mais leur sens est le même dans les deux campagnes : à surveiller. L'agriculteur reste la caste la plus forte quand il cultive (1,48) ; la consigne interdit de dégrader
  l'agriculture, et ce n'est pas un problème de faiblesse.
- **Rien n'est plafonné** : aucune limite ajoutée sur l'argent gagné ; les marges (t02, t45) et le pouvoir de marché ne sont pas touchés ; le départ (10 M$ / 100 M$) non plus.
- **Ce que les bots ne jouent pas** : zonage et spéculation du promoteur, cartels et embargos du négociant, R&D ciblée de l'innovateur, OPA. L'équilibre mesuré est celui des
  stratégies que les bots savent jouer.
- **Pistes non faites** : (1) limiter l'expansion à crédit des IA aventureuses dans les classes où le joueur est faible (R14) si la baisse des castes de ville se confirme sur
  10 graines ; (2) recaler `CURVE` (courbe attendue du Round) sur la ville qui grandit plus vite : les bots sont 2 à 5 fois au-dessus dès le jour 1 800 et paient la surchauffe ;
  (3) campagne de 10 graines (`--native --seeds 10`, environ 4 h avec 1 travailleur sur une machine libre) pour réduire l'incertitude par caste.

---

# Passe 67 : chaque caste jouée à fond (playbooks de bot)

Demande de Rémy : refaire jouer les castes en apprenant aux bots à jouer **100 % leur rôle**, puis mesurer. Périmètre : baron industriel, banquier, négociant, agriculteur
(promoteur et innovateur, bot et mécanique, sont confiés à d'autres agents : leur profil `--native` reste le bot « bon joueur »). Code : `tools/bot_lib.js` (`P.play`,
compteurs d'actions emblématiques `BOT.CP.n`, journal `BOT.CP.log`) ; profils `baron`, `banque`, `negoce`, `agri` de `tools/sim_batch.js` ; `--native` les utilise,
`--native --old` rejoue les bots d'avant (`industriel`, `banquier`, `fermier`). Test : `tools/tests/t68_bots_castes.js`.

## 1. Les playbooks (ce que ferait un joueur expert, chiffres du jeu)

**Banquier d'affaires (`banque`), modèle holding.** La banque (100 M$ de CET1) est le moteur de capital.
- Le LCR impose une trésorerie ≥ 8 % de l'encours × stress : **1 $ de trésorerie porte 12,5 $ de crédits**, qui rapportent taux + 3 points − 1,5 point de pertes
  (entreprises), soit ≈ 56 %/an sur la trésorerie immobilisée, plus que n'importe quel magasin. Le bot garde un coussin (`P.keep` : LCR visé 115 % sur l'encours et sa
  croissance possible), emprunté au besoin (intérêts −40 % pour la caste), et n'investit en magasins que l'excédent.
- Tous les 5 jours, il prête jusqu'à la contrainte la plus étroite (demande ≈ 3 000 $ par habitant, CET1 ≥ 10,5 %, levier ×10, LCR). Croissance ≥ 1,5 % : entreprises ;
  croissance molle : immobilier (pondéré 50 %) ; récession ou crise du crédit (pertes ×3 à ×7) : rappel des crédits risqués, prêts au souverain (pondéré 0 %).
- Niveau « Monopole » dès 12 M$ d'encours en croissance (+1 point de marge entreprises).
- Participations : souscrit aux tours de table des rivaux (10 à 18 % sous le cours) et garde des participations durables dans les rivaux qui composent le plus vite
  (valeur +8 % ou plus sur 180 jours), vendues s'ils déclinent, dans la limite prudentielle de 20 % des fonds propres. Pas d'OPA (elle retire la cible du marché).
- **Compounding** : 80 % des intérêts nets restent en réserve, les fonds propres croissent, donc le levier ×10 et la limite de participations aussi. Mesuré (graine 6000) :
  encours 1,15 Md$ et fonds propres 154 M$ au jour 900. La mécanique compose déjà : aucun ajustement de jeu n'a été nécessaire pour le banquier.

**Négociant en matières (`negoce`).** Base : mines, chaînes et exports du bot industriel (exports +15 %, intrants −4 %), plus :
- **Énergie** : centrales à charbon (1,6 M$ pour la caste, 500 t/j -> 286 MWh/j) brûlant le charbon de ses propres mines (une mine de 1 750 t/j en alimente trois),
  raccordées à la ville par un pylône ; éolienne faute de charbon. Il couvre la demande du réseau sans la noyer (prix après ajout ≥ 24 $/MWh pour une centrale,
  30 $/MWh pour une éolienne) et s'arrête si sa dernière centrale rapporte moins de 25 %/an (compte réel). Mesuré : centrale approvisionnée, prix 47 $ :
  EBE 10 600 $/j (≈ 3,8 M$/an pour 1,6 M$). Première version (offre du réseau lue dans l'instantané `S.power`, parfois nul) : 9 centrales et 6 éoliennes, prix tombé à
  15 $/MWh, toutes à perte ; corrigé en comptant la production réelle de ses centrales.
- **Pipelines** (−40 %) de chaque puits et mine de charbon vers un terminal (zone portuaire, centrale, port) : transport ÷ 5.
- **Cartel** de 20 jours (60 000 $ pour la caste) sur la matière qu'il produit le plus. Effet mesuré : cours réel +5 % à J+3, +15 % à J+15, encore +7 % dix jours
  après, soit ≈ 3 jours de recettes de la matière : il signe si ce gain dépasse 1,2 fois le coût (le charbon brûlé par ses centrales est exclu).
- **Embargo** : seulement en riposte à une guerre des prix qu'un rival lui mène (principe du jeu à somme positive : pas d'embargo gratuit).

**Baron industriel (`baron`).** Chaînes verticales du bot industriel (mine/ferme -> composants f1-f3 -> usine du produit -> magasins, agrandies tant que les ventes absorbent
la production) avec un catalogue élargi au haut de gamme (montre, parfum, soins, bijoux, sac, téléviseur, électroménager, voiture), plus :
- rachat des actifs d'un rival en faillite (−15 % pour la caste) si le revenu de la filiale (12 % de son chiffre d'affaires) rembourse le prix en moins de 5 ans ;
- participation de 10 % (seuil d'OPA de la caste) dans le rival le moins cher dès le jour 450, jamais sur l'épargne réservée à une chaîne (première version dès le jour 300 :
  elle mangeait l'épargne des chaînes, 182 M$ au lieu de 218 M$ sur la graine 6000), contrôle à 51 % (filiale gérée par l'IA, 60 % de son résultat en dividendes) quand
  la valeur dépasse 60 M$ et que la trésorerie oisive couvre la cible ; une seule OPA (prime 20 %), tard (jour ≥ 1 200), si la trésorerie oisive couvre deux fois l'offre.

**Exploitant agricole (`agri`).** Mécanique et bonus inchangés (décision de Rémy). Le bot fermier, plus l'irrigation au maximum de chaque ferme dès sa pose
(840 / 1 820 / 2 940 $ pour la caste, +10 % de récolte par niveau et protection contre la sécheresse). Essai écarté (`P.foodChain`) : une chaîne de 14 produits
alimentaires (pâtes, lait, œufs, viandes, vin, yaourt, bière, huile, fromage...) dimensionnée sur vigne, maïs, colza et élevages : 175 et 195 M$ au lieu de 267 et 249 M$
(graines 6000, 7000) : de petites usines alimentaires peu chargées coûtent plus qu'elles ne rapportent. Le bot garde la chaîne du pain du bot fermier.

## 2. Ajustements de jeu (minimaux)

| Ajustement | Pourquoi | Effet |
|---|---|---|
| **Charbon des centrales réservé** : le marché local ne vend plus le charbon dont les centrales du joueur ont besoin le lendemain (`stepLocalMarket`, réserve `PLANT_COAL ×` nombre de centrales) | selon l'ordre des cases, une centrale sur deux restait sans combustible alors que les mines du joueur en produisaient assez (mesuré : 3 centrales sur 6 à 0 MWh, EBE −2 906 $/j chacune) | les centrales tournent sur le charbon du joueur ; aucun effet sans centrale |
| **Filiales acquises au bilan** : une OPA réussie ou le rachat des actifs d'un rival en faillite compte au coût amorti (0,9 × prix payé, `subsBook`, champ optionnel `v` de `S.subs`) | avant, le prix sortait de la trésorerie sans contrepartie : racheter une société, même rentable, détruisait la valorisation (incohérent avec « actifs au coût amorti ») | une acquisition ne crée ni ne détruit de valeur le jour du rachat ; anciennes sauvegardes (sans `v`) : comme avant |

Contrôle : promoteur et innovateur (bot inchangé) donnent exactement les mêmes valeurs avant et après sur les graines 6000 et 7000 : les deux ajustements n'agissent
que là où ils doivent.

## 3. Mesures (`--native`, 1 800 jours, Round Normal, événements, graines 6000 / 7000 / 8000, 1 travailleur, machine partagée)

Avant : `--native --old` (version `217e497`). Après : playbooks et ajustements de cette passe. Valeur finale (M$), moyenne géométrique des 3 graines.

| Caste | Bot avant | Avant (M$) | / moy. | Bot après | Après (M$) | / moy. | Après / avant (par graine) |
|---|---|---:|---:|---|---:|---:|---|
| agriculteur | fermier | 240,6 | 1,41 | agri | 295,6 | 1,38 | 1,23 (1,11 / 1,23 / 1,35) |
| banquier | prête 50 % tous les 30 j | 161,6 | 0,94 | banque | 300,3 | 1,40 | 1,86 (1,72 / 1,67 / 2,24) |
| négociant | industriel | 168,9 | 0,99 | negoce | 251,5 | 1,17 | 1,49 (1,62 / 1,40 / 1,46) |
| industriel | industriel | 178,0 | 1,04 | baron | 204,5 | 0,95 | 1,15 (1,21 / 1,24 / 1,01) |
| promoteur | bon | 151,0 | 0,88 | bon (inchangé) | 151,0 | 0,70 | 1,00 |
| innovateur | bon | 142,3 | 0,83 | bon (inchangé) | 142,3 | 0,66 | 1,00 |
| toutes | | 171,1 | 1 | | 214,8 | 1 | 1,26 |

Parmi les quatre castes jouées à fond, rapport à leur moyenne (260 M$) : banquier 1,16, agriculteur 1,14, négociant 0,97, baron 0,79. Toutes dans la bande visée
(~0,8-1,3), le baron à la limite basse. Le promoteur et l'innovateur tombent à 0,66-0,70 de la moyenne des six **parce qu'ils sont encore joués par le bot de commerce** :
leurs playbooks (autres agents) doivent être mesurés avec cette même campagne avant toute conclusion sur leur équilibre.

Styles distincts (actions comptées sur 1 800 jours, `cp` de `sim_batch`) : banquier 260 à 290 décisions de prêt, 3 à 6 tours de table, 1 à 3 participations durables,
3 à 5 rappels de crédits en récession ; négociant 25 à 31 centrales, 3 à 6 éoliennes, 5 à 9 mines de charbon, 16 pipelines, 52 à 61 cartels, 8 à 28 embargos de riposte ;
agriculteur 186 à 198 niveaux d'irrigation ; baron 0 à 3 participations de 10 %, 1 rachat de failli (graine 6000), jamais de contrôle à 51 % ni d'OPA avant le jour 1 800
(la condition « valeur > 60 M$ et trésorerie oisive > valeur de la cible » n'est pas remplie : ses chaînes absorbent tout).

**Lecture.** Les écarts de cette campagne sont très au-dessus du bruit (banquier ×1,67 à ×2,24, négociant ×1,40 à ×1,62 sur chaque graine) : le classement d'avant
mesurait surtout la faiblesse des bots du banquier et du négociant. Le gain du baron (×1,01 à ×1,24) et de l'agriculteur (×1,11 à ×1,35) est réel mais, à 3 graines,
un écart de 10 à 15 % entre deux castes reste non significatif. Aucun ajustement d'équilibre n'a été appliqué aux bonus de caste : aucune caste jouée à fond n'est hors bande.

## 4. Test A/B « somme positive » (docs/PRINCIPE_JEU_POSITIF.md)

Même graine (6000, 7000), mêmes bots (version de la campagne « après », chaîne alimentaire et participation précoce du baron comprises), **castes isolées** : le joueur seul,
sans aucune IA (`SIM_NRIV=0`), contre **six castes actives** (le joueur et les 5 IA de caste). 11 parties appariées (l'innovateur 7000 manque).

| | 6 castes ensemble | Joueur seul |
|---|---:|---:|
| Population au jour 1 800 | 290 000 à 625 000 (≈ 350 000) | 154 000 à 253 000 (≈ 165 000) |
| Chômage | 3,8 à 7,7 % | 9,8 à 10,5 % |
| Valeur du joueur (moy.) | 212 M$ | 384 M$ |
| Valeur de toutes les entreprises du monde (moy.) | 470 M$ | 384 M$ |

Par caste, valeur du joueur avec les 5 autres / seul : agriculteur **1,41 et 1,68** (il vend ses récoltes à la ville plus peuplée et aux usines rivales : synergie nette),
négociant 0,71 et 0,75, industriel 0,61 et 0,72, banquier 0,47 et 0,53, innovateur 0,40, promoteur (bot de commerce) 0,26 et 0,30.
Trajectoire du monde à six castes (moyenne, M$) : 161 (j 300), 190, 245, 293, 383, 488 (j 1 800) : convexe.

**Lecture honnête.** La somme est positive pour l'économie (population doublée, chômage divisé par deux, valeur totale +23 % par rapport au joueur seul) et l'agriculteur
gagne à la présence des autres. Mais pour les castes de commerce et de services, l'arrivée de cinq concurrents coûte au joueur bien plus que ce que la ville plus grande lui
rapporte (0,26 à 0,75) : le gâteau grandit moins vite que le nombre de parts. Les mécaniques en cause ne sont pas des destructions gratuites (guerres de prix : 1 à 5 par
partie ; embargos du négociant : ripostes seulement) mais le partage de demandes finies : parts de marché des rayons, `svcSat` (−7 % de demande de services par rival),
`rivSvc` (la banque de Luxor et les data centers de Novatek prennent jusqu'à 12 % des recettes de services du joueur), cartels du négociant (+15 % sur le cours d'une matière
pendant 20 jours, payés par les usines acheteuses). **Pas de correction appliquée dans cette passe** : la mesure demande d'abord les playbooks du promoteur et de l'innovateur
(les deux castes les plus touchées), et une correction du partage de la demande toucherait toutes les castes. Pistes mesurables : (1) faire croître la demande de rayon
et de services avec l'emploi créé par chaque entreprise (la demande suivrait la population déjà doublée) ; (2) borner `rivSvc` quand la ville grandit grâce au joueur ;
(3) cartel du négociant : partager une partie du gain avec les usines clientes (contrats d'approvisionnement à prix garanti) plutôt qu'un pur transfert.

## 5. Limites

- 3 graines par caste (2 pour l'A/B) ; machine partagée par plusieurs agents (charge 15 à 22 sur 4 cœurs) : les durées par partie (100 à 300 s) ne sont pas des mesures de
  performance. Écarts < 10-15 % entre castes non significatifs.
- Promoteur et innovateur non joués à fond ici (autres agents) : leur rang (0,66-0,70) ne dit rien de leur équilibre.
- Le négociant ne fait pas de portage spéculatif de stocks (acheter en surplus, revendre en pénurie) : l'outil existe pour l'IA (`trMarket`), pas d'interface joueur
  simple pour stocker une matière achetée au marché. Ses contrats d'approvisionnement et l'agence immobilière du promoteur ne sont pas joués.
- Le baron ne prend jamais le contrôle d'un rival en 1 800 jours : l'OPA reste peu rentable (revenu de filiale = 12 % du chiffre d'affaires de la cible, ≈ 5 %/an du prix) ;
  c'est désormais neutre au bilan (filiale au coût amorti) mais pas créateur de valeur.
- `t65` garde les bots d'avant (`--native --old`) ; `t68` vérifie les actions emblématiques des nouveaux.

# Passe 68 : une économie réellement à somme positive (prospérité, deux bassins de clientèle, services B2B, contrat d'approvisionnement)

Principe de Rémy (docs/PRINCIPE_JEU_POSITIF.md) : aucune caste ne doit se nuire ou s'annuler. Mesure de départ (passe 67, section 4) : avec les 5 autres castes, chaque caste
jouée à fond gagnait MOINS que seule (sauf l'agriculteur). Code : `game.template.html` (bloc « Passe 68 » après `wageMkt`, `svcSat`, vente en magasin de `step`,
`stepLocalMarket`, `cartelOn`, `bkDemand`, panneau Concurrents) ; outil : `tools/sim_batch.js` (cumuls du compte de résultat `cf` et diagnostics `dg` par tranche de
100 jours dans chaque point de la série) ; test : `tools/tests/t70_somme_positive.js`.

## 1. Protocole

A/B apparié, même graine (6000 / 7000 / 8000), mêmes bots (`--native`, playbooks de la passe 67 ; promoteur et innovateur : bot « bon joueur »), 1 800 jours, Round Normal,
événements, 1 travailleur par flux (2 flux au plus en parallèle ; machine partagée, charge 7 à 20 sur 4 cœurs) : **A** = le joueur seul (`SIM_NRIV=0`, aucune IA),
**B** = le joueur et les 5 IA de caste. Ratio = valeur du joueur B / A. 36 parties avant, 36 après ; ablations de diagnostic sur 2 graines (12 parties chacune).

## 2. Diagnostic : d'où vient la perte du joueur en présence des rivaux (version de départ `90d1857`)

Ablations : une copie de la version de départ où UNE mécanique de concurrence est neutralisée (diagnostic seulement, jamais livré), comparée au même joueur seul.
Graines 6000 et 7000, moyenne géométrique de B/A.

| Caste | Départ | Sans parts de rayon des IA (`rivalAttr` = 0) | Sans `svcSat` −7 %/rival ni `rivSvc` | Salaires fixes (`wageMkt` = 1) |
|---|---:|---:|---:|---:|
| agriculteur | 1,34 | 1,36 | 1,34 | 1,41 |
| banquier | 0,50 | **1,15** | 0,58 | 0,58 |
| négociant | 0,73 | 0,86 | 0,73 | 0,69 |
| industriel | 0,75 | **0,99** | 0,75 | 0,70 |
| promoteur | 0,28 | **0,86** | 0,36 | 0,30 |
| innovateur | 0,45 | **1,10** | 0,44 | 0,40 |

Lecture :
- **Les parts de rayon expliquent l'essentiel** (×1,3 à ×3,1 selon la caste). Les 5 IA prenaient 63 à 72 % de la demande de chaque classe (base, manufacturé, luxe) pour
  le promoteur, le banquier et l'innovateur (15 à 33 % face au négociant, à l'industriel et à l'agriculteur, dont les produits sont plus attractifs), alors que leur valeur
  cumulée restait de l'ordre de celle du joueur seul : la part d'un produit du joueur dépend de son attrait (qualité, prix, marque), pas du nombre de ses magasins, et
  l'attrait des IA grandit avec leurs ouvertures (plafond 1,3 par classe). La marge de rayon (pouvoir de marché, `mpRetail`) tombait en plus de ×1,24 (seul) à ×0,97.
  Le bot investit tant que le rendement marginal dépasse son seuil : un magasin moins rentable, c'est moins de magasins, moins de trésorerie, et l'écart se compose sur
  5 ans (recettes de commerce B/A : promoteur 0,40, banquier 0,34, innovateur 0,57 ; entretien, indicateur de la taille du parc : 0,14 à 0,55).
- **Services** (`svcSat` −7 % de demande par rival jusqu'à −21 %, `rivSvc` jusqu'à 12 %) : ×1,2 à ×1,3 pour le promoteur et le banquier, rien pour les autres.
- **Salaires** (chômage 4 à 6 % avec les IA contre 10 % seul, `wageMkt` +5 à +8 %) : effet dans le bruit (< 5 %).
- **Cartels** : ceux du négociant IA ne s'appliquent au joueur que s'il les accepte (le bot ne répond pas) ; ceux du joueur négociant (+18 % sur le cours pendant 20 jours,
  52 à 61 par partie) sont payés par les usines acheteuses, IA comprises : transfert pur, sans effet mesurable sur la valeur du joueur (il n'en est pas la victime).
- **Négociant** : même sans parts de rayon il reste à 0,86. Le reste vient d'un chemin de bot : ville plus prospère dès le jour 3, le bot ouvre d'abord un magasin
  spécialisé (maison) qui lui prend la trésorerie de l'hypermarché (s3) du jour 6 ; ses recettes de commerce restent alors deux fois plus faibles pendant 1 000 jours
  (sans magasins spécialisés, `SIM_NOSPEC=1`, version finale : 0,90 au lieu de 0,79 sur 2 graines). En fin de partie, il investit davantage (jusqu'à 33 centrales contre 22)
  dans une ville plus demandeuse d'électricité : la valorisation au coût amorti (0,9 × coût) pénalise un investissement récent pas encore rentabilisé.
- Population : 433 k habitants en moyenne avec les IA contre 184 k seul, chômage 4,9 % contre 10,2 % : le gâteau grandissait déjà, mais moins vite que le nombre de parts.

## 3. Mécanismes ajoutés (chacun commenté dans le code)

| Mécanisme | Avant | Après | Pourquoi (gain mutuel) |
|---|---|---|---|
| **Multiplicateur de prospérité** `prosp()` | demande par habitant fixe | demande × emploi × salaire réel × (1 + 0,07 × ln(1 + T / 250 000 $)), T = chiffre d'affaires quotidien de TOUTES les entreprises (toi + IA) ; élasticité 0,6 (base), 1 (manufacturé), 1,4 (luxe) ; plafond ×1,6 ; s'applique aussi aux services, au crédit et aux matières (racine carrée) | chaque entreprise verse salaires, sous-traitance et dividendes ; une économie urbaine plus grosse paie mieux. Mesuré : ×1,22 à ×1,32 avec les IA, ≈ ×1,1 seul |
| **Marché élargi** `rivMkt` | les IA prenaient des parts d'une demande fixe | demande de classe × (1 + 0,6 × (1 − e^(−0,75 × attrait des IA))), au plus +60 % | leurs rayons, marques et publicité amènent de nouveaux clients (comme tes produits : +12 % par produit lancé). Mesuré ×1,2 à ×1,35 |
| **Deux bassins de clientèle** `attrDen` | une IA pesait tout son attrait sur tes clients | sur ta clientèle d'origine, une IA ne pèse que `rivCannib()` de son attrait : 10 % pour un débutant, jusqu'à 35 % au sommet (`compNow` : palier et profondeur des chaînes) ; sur la nouvelle clientèle, partage normal à l'attrait | une IA recrute surtout chez elle ; la concurrence monte avec ton palier. Part des IA dans les rayons : 0,63-0,72 -> 0,38-0,47 |
| **Marge de rayon** (`mpRetail`) | calculée sur la part totale des IA | calculée sur leur poids dans TA clientèle (`rivCl`) | le pouvoir de marché dépend de la concurrence pour tes clients ; seul, la marge reste celle d'avant (×1,24) |
| **Services B2B** `svcB2B` | −7 % de demande par rival (jusqu'à −21 %) | +7 % par entreprise active (pondérée par √(valeur / valeur de départ), au plus 5) | les entreprises sont des clientes des banques, bureaux tech et data centers |
| **`rivSvc`** | jusqu'à 12 % des recettes de services | jusqu'à 6 % | concurrence bornée, plus que compensée par le B2B |
| **Crédit** `bkDemand` | 3 000 $ par habitant | × prospérité, + dette des IA + la moitié de leur valeur quand tu tiens le siège du banquier (`bkRivDem`) | les IA empruntent à ta banque (« capital prêté ») |
| **Matières** (`stepLocalMarket`) | demande locale ∝ population | × √prospérité × (1 + 4 % par entreprise active, `RAW_B2B`) | chantiers, entretien, énergie des entreprises |
| **Contrat d'approvisionnement** (`cartelOn`, même action et même coût) | cartel : cours cible +18 % pendant 20 jours, payé par les usines clientes | prix stable (cours + 6 %) et volumes garantis 60 jours ; les usines clientes ne manquent plus de la matière (`fabFill`) et ne la paient jamais plus que le prix du contrat (`scPx`) ; pas d'amende (contrat légal) ; champ optionnel `S.rv.sc` | le vendeur gagne une prime modeste et des ventes locales ; le client gagne la sécurité d'approvisionnement et une protection contre les flambées |
| **Bilan des synergies** (Menu > Concurrents, en tête) | — | « Ce que les autres castes t'apportent » : prospérité et sa part due au revenu des autres, marché élargi, recettes dues à la demande qu'ils créent (par mois et cumul), habitants logés et emplois chez eux, matières livrées par le négociant, crédit du banquier ; « Ce que tu leur apportes » : demande créée pour eux, tes ventes de matières à leurs usines, tes emplois et logements, crédit de ta banque aux entreprises, redevances de tes brevets. Relevé quotidien `S.syn` (facultatif, sauvegardé ; anciennes sauvegardes : rien) | critère 2 du principe |

Essais écartés (mesurés sur 2 graines) : multiplicateur sur le revenu PAR HABITANT (×1,46 à ×1,59) : il gonflait surtout la partie solo (le joueur seul est riche par
habitant dans une petite ville : promoteur seul 574 -> 902 M$, B/A 0,39) ; attrait de la ville tiré aussi par le chiffre d'affaires des IA (`cityAttract`, terme aE) :
population passive au jour 4 800 = 1,69 M au lieu de 0,6-1,5 M (t34), retiré.

## 4. Mesures (A/B 1 800 jours, graines 6000 / 7000 / 8000 ; valeur moyenne en M$ ; ratio en moyenne géométrique)

| Caste | A solo avant | B avant | B/A avant | A solo après | B après | B/A après (par graine) | B après / B avant |
|---|---:|---:|---:|---:|---:|---|---:|
| agriculteur | 220 | 296 | 1,35 | 241 | 394 | **1,63** (1,58 / 1,66 / 1,66) | 1,33 |
| banquier | 593 | 301 | 0,51 | 597 | 690 | **1,13** (1,38 / 0,82 / 1,25) | 2,29 |
| négociant | 344 | 252 | 0,73 | 369 | 320 | **0,87** (0,70 / 1,03 / 0,90) | 1,27 |
| industriel | 269 | 205 | 0,76 | 261 | 276 | **1,06** (1,02 / 1,02 / 1,16) | 1,35 |
| promoteur | 600 | 154 | 0,25 | 661 | 677 | **1,02** (1,01 / 1,24 / 0,85) | 4,41 |
| innovateur | 326 | 143 | 0,44 | 335 | 345 | **1,02** (1,09 / 0,90 / 1,08) | 2,42 |
| toutes | | | 0,59 (min 0,20) | | | **1,10** (min 0,70) | |

| | Avant | Après |
|---|---:|---:|
| Valeur de toutes les entreprises (B) / joueur seul (A), moyenne géométrique | ×1,39 | **×1,93** |
| Valeur du monde B (moyenne, M$) | 514 | 760 |
| Trajectoire du monde B (M$, ≈ tous les 306 jours) | 159 197 255 326 409 514 | 166 218 301 396 546 760 (accroissements 52, 83, 95, 150, 214 : convexe) |
| Population au jour 1 800 (B / A) | 433 k / 184 k | 368 k / 184 k |
| Chômage (B / A) | 4,9 % / 10,2 % | 6,0 % / 10,2 % |
| Part des IA dans les rayons (promoteur, banquier, innovateur) | 0,63 à 0,72 | 0,38 à 0,47 |
| Valeur cumulée des 5 IA (B, M$) | ≈ 290 | 264 à 374 |

Lecture honnête :
- Cinq castes sur six valent au moins leur valeur seule en moyenne (1,02 à 1,63), le monde à six vaut 1,93 fois le joueur seul (1,39 avant) et sa trajectoire est convexe.
  Le joueur seul bouge peu (+0 à +10 %) : le gain vient de ce que les autres apportent, pas d'un gonflement général.
- **Le négociant reste sous 1 (0,87)**, à cause du chemin de bot décrit en section 2 et de la valorisation au coût de ses centrales récentes. Une graine sur trois est au-dessus de 1.
- **Graines sous 1** : banquier 7000 (0,82), promoteur 8000 (0,85), innovateur 7000 (0,90). À 3 graines, un écart de 10 à 15 % n'est pas significatif ; la moyenne est
  de 1,0 à 1,1 pour ces castes, pas dans la zone visée de 1,2 à 2 (sauf l'agriculteur).
- La population de la partie normale (B) baisse de 15 % (433 k -> 368 k) : les IA, moins dominantes dans les rayons, construisent moins de tours. La prospérité passe
  davantage par la demande par habitant (×1,2 à ×1,3) que par le nombre d'habitants.
- **Équilibre des castes dans la partie normale** : les valeurs B suivent désormais celles du joueur seul, où le promoteur et le banquier dominent (677 et 690 M$ contre
  276 à 394 M$ pour les autres) : rapport à la moyenne de 0,61 (industriel) à 1,53 (banquier), au-delà de la bande 0,8-1,3 de la passe 67. Le déséquilibre existait déjà
  seul ; il est à traiter par les playbooks et bonus de caste (priorité 5), pas par la concurrence.
- Aucun plafond sur l'argent gagné ; spéculation inchangée ; marges par pouvoir de marché conservées (mesurées sur ta clientèle) ; agriculture non modifiée (elle profite
  seulement de la demande accrue : 296 -> 394 M$ en partie normale). La guerre des prix des IA (et les embargos de riposte du négociant : 2 à 14 par partie) reste en place :
  c'est la prochaine mécanique « destructrice » à transformer.

## 5. Tests

`t70_somme_positive` (nouveau, 18 contrôles) : mécanismes (prospérité > 1 avec une part due aux autres, marché élargi borné, B2B > 1, `rivSvc` ≤ 6 %, contrat d'approvisionnement :
prix = cours + 6 %, client plafonné en cas de flambée, pas de doublon, fin à 60 jours), A/B réduit à 500 jours (graine 6000) : promoteur ×1,05 et banquier ×1,04 (seuil 0,9),
négociant ×0,59 à 500 jours (non soumis au seuil, voir section 2), monde > 1,2 × joueur seul pour les trois, bilan des synergies affiché et chiffré.
