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
