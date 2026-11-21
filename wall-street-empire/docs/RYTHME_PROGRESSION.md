# Passe 83 : rythme de progression, de la première à la dernière heure

*Demande de Rémy : « avance sur le GAMEPLAY ». Les simulations de personas (docs/MONETISATION_GAMIFICATION.md §6) montraient des creux de 8 à 13 minutes sans jalon,
un Presse-boutons bloqué par l'argent et un Streamer qui s'ennuie. Tout ce qui suit est soit **mesuré sur des bots** (même graine avant/après), soit **supposé** ; chaque point est étiqueté.*

Code : `game.template.html`, bloc « Passe 83 : RYTHME DE PROGRESSION » (avant « Démarrage »), fonctions `ry*`. Export : `window.WSE.ry`.
Test : `tools/tests/t83_rythme.js`. Mesure : `tools/sim_batch.js --icp` (carte des premières fois, jalons du rythme), `tools/bot_lib.js` (persona `ry`, mesures d'épargne),
`tools/analyze_icp.py` (tableaux « Passe 83 »).

## 1. Ce qui a été ajouté au jeu

| Mécanique | Ce que voit le joueur | Récompense | Effet économique automatique |
|---|---|---|---|
| **Chaîne de missions par caste** (8 à 9 missions × 6 castes, puis une **série sans fin**) | pastille « ◆ Mission n/N » dans la barre d'objectif (titre = leçon), ligne complète avec le bouton Conseil, toast « Mission accomplie » | 8 Diamants, crédits labo, jetons de chantier express, confiance du banquier, titre de fin de chaîne | aucun |
| **Jalons de fortune** ×1,5 · 2 · 3 · 4 · 5 · 7 · 10 · 14 · 20 · 30 · 40 · 50 · 70 · 100 · 140 · 200 (rapport ≈ 1,4) | toast « Jalon de fortune » | 5 Diamants | aucun |
| **Paliers de ville** 50 k · 100 k · 150 k · 200 k · 300 k · 500 k · 750 k · 1 M · 2 M · 5 M habitants | toast, avec les magasins dont un niveau supérieur devient possible (prérequis de population des chantiers) | 4 Diamants | aucun |
| **Défi des 30 jours** (CA +8 %, 2 bâtiments, un chantier, valeur +5 %, zéro rupture, dette −10 %, un produit, exports +15 %) choisi selon l'état réel, sans tirage aléatoire | toast de lancement, de réussite ou d'échec ; aucune pénalité | 12 Diamants + 5 j de crédits labo | aucun |
| **Duel du mois** contre le rival le plus proche en valeur, et classement de croissance sur 30 jours | toast « Duel gagné / perdu » avec les deux croissances et ta place | 6 Diamants si gagné | aucun |
| **Geste utile** (Conseiller adaptatif) : chantier de magasin rentable et abordable, usine saturée à agrandir, sources d'une usine en rupture, crédits labo, jeton express, publicité déficitaire | ligne « Geste utile … [Faire] » (bouton Conseil ou HUD déplié) | — | seulement si le joueur clique |
| **Prêt de projet du banquier IA** | dans le plan du Conseiller quand le jalon chiffré n'est pas abordable, bouton « Prêt de projet » | — | seulement si le joueur le prend |
| **Opportunité de marché** (cours d'une matière que tu consommes ou produis à ±15 % sur 30 jours) | toast de conseil (au plus un tous les 45 jours) | — | aucun |

Règles tenues :
- **Aucune mission validée gratuitement** : une mission n'est jamais validée le jour où elle commence ; ses objectifs de quantité sont **relatifs** au moment où elle commence
  (« 2 usines de plus »). Deux missions actives au plus ; une mission que ton style de jeu n'emprunte pas passe **en réserve** après 120 jours sans progrès (toujours réalisable).
- **Pas de plafond sur l'argent, pas d'inflation** : aucune récompense n'est de l'argent. Les jetons, crédits labo et prêts n'agissent que si le joueur les utilise.
  Vérifié par t83 : même graine, même bot, rythme actif ou coupé → même valeur, même trésorerie, même dette au jour 360.
- **Aucun appel à `rnd()`** : défi choisi par `(jour / 30, caste)`, duel par proximité de valeur ; la suite aléatoire de la partie est inchangée (t05 vert).
- **Spéculation libre, somme positive, agriculture intacte** : rien n'est retiré ni bridé ; le duel compare des croissances (on gagne en créant de la valeur).
- **Prêt de projet** : au plus 50 % du coût du projet (+ « confiance du banquier » gagnée en mission, 65 % au plus), service de tous les prêts de projet ≤ EBE / 1,5,
  encours ≤ 25 % de la valeur, 3 prêts au plus, refusé sans EBE positif ou en crise du crédit ; taux du crédit + 1 point ; capital remboursé **chaque jour sur 5 ans** ;
  il s'ajoute à la dette (valorisation et intérêts normaux) mais **hors du plafond ordinaire** (la marge d'emprunt habituelle n'est pas entamée).
- **Sauvegarde rétro-compatible** : champ facultatif `ry` (assaini par `rySan`) ; une ancienne sauvegarde initialise les échelles en silence (pas de rafale de jalons).
- **Mobile** : sur téléphone (HUD compact replié) la pastille et la ligne du rythme sont masquées (la carte garde ses 60 %) ; HUD déplié, la ligne tient dans l'écran.

### Missions (extrait : Baron industriel)
1 Première usine · 2 Un produit lancé · 3 Un port ou une mine · 4 Un magasin au niveau 2 (chantier) · 5 Deux produits de plus · 6 Deux usines ou extracteurs de plus ·
7 Deux chantiers terminés · 8 Siège social · 9 10 % d'un rival ou une filiale (titre « Baron »). Puis la **série** : chantiers, bâtiments, produits, CA +x %, de plus en plus grands.
Chaque caste a sa chaîne (négociant : port, extraction, export, énergie, contrat d'approvisionnement ; agriculteur : ferme, irrigation, élevage, produit alimentaire ;
banquier : prêts, tour de table, bourse ; promoteur : logements, étages, ventes, bureaux ; innovateur : recherche, labo, brevet, data center). Les paliers 1→5 sont reliés
au flux : missions « niveau 2 », « chantiers terminés », défi « lance un chantier », jalon « palier de bâtiment » à la fin de chaque chantier, jetons express en récompense,
paliers de ville qui annoncent les niveaux débloqués.

## 2. Mesures avant / après

Protocole (**mesuré**, bots) : `tools/sim_batch.js --icp --icp-list presse,presse0,optimiseur,streamer,mobile,etudiant --seeds 3 --days 1800 --workers 1 --castes industriel`,
graines 7101-7103, Round Normal, caste industrielle, télémétrie active ; **avant** = build d'avant la passe avec les mêmes outils de mesure (le nouveau `bot_lib.js` n'y change
rien puisque `WSE.ry` n'existe pas) ; **après** = build de la passe 83. Médianes de 3 graines. 1 jour ≈ 0,75 s réelle (Round, vitesse normale). Les personas Presse-boutons,
Optimiseur, Étudiant, Streamer et Casual **suivent le rythme** (`P.pers.ry` : geste utile pendant l'épargne, au plus un geste payant tous les 30 jours et ≤ 5 % de la trésorerie ;
prêt de projet quand il couvre tout l'écart) ; le **témoin** « Presse-boutons sans achat » ignore le Conseiller (ni geste ni prêt) : c'est le contrôle A/B dans le même build.

### 2.1 Jalons : intervalle maximal entre deux jalons (jours de jeu / minutes réelles)

| Persona | Avant (×valeur, palier) | Après, jalons majeurs A | Après, tous jalons B | Jalons A par partie (avant → après) |
|---|---|---|---|---|
| Presse-boutons (Damien) | 726 j / 9,1 min | **217 j / 2,7 min** | 70 j / 0,9 min | 7 → 32 |
| Presse-boutons sans achat (témoin) | 629 j / 7,9 min | **198 j / 2,5 min** | 69 j / 0,9 min | 7 → 26 |
| Optimiseur (Rémy) | 760 j / 9,5 min | **159 j / 2,0 min** | 71 j / 0,9 min | 7 → 35 |
| Étudiant en gestion | 863 j / 10,8 min | **269 j / 3,4 min** | 98 j / 1,2 min | 7 → 30 |
| Streamer compétitif | 798 j / 10,0 min | **216 j / 2,7 min** | 76 j / 1,0 min | 9 → 30 |
| Casual mobile | 725 j / 9,1 min | **291 j / 3,6 min** | 103 j / 1,3 min | 8 → 30 |

A = ×valeur et paliers de fortune d'avant + missions + jalons de fortune + paliers de ville ; B = A + défis réussis, duels gagnés, niveaux de bâtiment terminés.
Objectif « 5 à 10 minutes au plus » : **tenu** (≤ 3,6 min pour A). t83 le vérifie sur 3 castes jouées par leur playbook, 720 jours : agriculteur 143 j, négociant 166 j,
industriel 144 j (seuil 400 j ≈ 5 min). Répartition médiane (Presse-boutons, 1 800 j) : 25 missions, 9 jalons de fortune, 4 paliers de ville, 16 défis réussis, 42 duels gagnés,
10 niveaux de bâtiment. **Limite** : l'ancien indicateur « creux sans jalon » (×valeur et paliers seulement) ne bouge pas (629-902 j) : les échelles de la télémétrie (`TEL_MULT`)
sont gardées telles quelles pour rester comparables ; ce sont les nouveaux jalons qui comblent les creux.
**Les duels sont presque toujours gagnés** (≈ 42 sur 60) : les rivaux IA du Round Normal ne suivent pas ces bots (déjà noté en passe 76 : tout le monde finit 1er). À revoir :
viser le rival juste au-dessus quand il existe, ou un objectif de croissance relatif plus exigeant.

### 2.2 Épargne bloquante

| Persona | Jours d'épargne avant | après | dont **sans geste possible** avant → après | Gestes faits pendant l'épargne | Prêts de projet (nb, M$) |
|---|---|---|---|---|---|
| Presse-boutons (Damien) | 1 166 (63,5 %) | 1 178 (64,2 %) | 63,5 % → **3,9 %** | 81 | 3 (3,5) |
| Presse-boutons sans achat (témoin) | 1 244 (67,8 %) | 1 244 (67,8 %) | 67,8 % → **6,9 %** (le jeu propose, le témoin ne fait rien) | 0 | 0 |
| Optimiseur | 1 131 (61,6 %) | 1 071 (58,3 %) | 61,6 % → **6,7 %** | 9 | 3 (6,3) |
| Étudiant | 1 038 (56,5 %) | 1 074 (58,5 %) | 56,5 % → **3,3 %** | 5 | 3 (23,6) |
| Streamer | 628 (34,2 %) | 626 (34,1 %) | 34,2 % → **0 %** | 139 | 3 (9,1) |
| Casual mobile | 552 (30,1 %) | 528 (28,8 %) | 30,1 % → **0 %** | 14 | 2 (16,5) |

Jours d'épargne = jours où le bot met de côté pour une chaîne et ne construit rien d'autre (sur 1 836 jours simulés). « Sans geste possible » = le jeu ne proposait **aucun**
geste utile abordable (chantier de magasin, usine saturée, sources d'une usine en rupture, crédits labo, jeton express) ni prêt de projet couvrant l'écart.
Avant la passe ce chiffre est égal aux jours d'épargne (le jeu ne proposait rien pendant l'attente). Objectif « < 12 % de jours d'épargne sans action possible » : **tenu
pour tous les personas (0 à 6,9 %)**. **Ce qui n'a pas changé** : la durée de l'épargne elle-même (≈ 60 % des jours pour les personas industriels). Le prêt de projet
(50 % du projet au plus) ne sert que 2 à 3 fois par partie, en début de partie : ensuite les chaînes visées coûtent plus de deux fois la trésorerie.

**Correction d'un chiffre de la passe 76** : les « 21 à 32 % des jours en épargne » de docs/MONETISATION_GAMIFICATION.md comptaient des **décisions** du bot (une tous les 2 jours
pour le Presse-boutons) rapportées à 1 800 **jours** ; en jours, c'est 56 à 68 % pour les personas industriels (30-34 % pour le Streamer et le Casual).

### 2.3 Ennui (jours sans « victoire visible » au-delà du seuil du persona)

| Persona | Avant | Après | Épisodes avant → après |
|---|---|---|---|
| Streamer compétitif (seuil 20 j) | **114 j** | **19 j** | 34 → 7 |
| Casual mobile (seuil 45 j) | 45 j | 7 j | 0 → 0 |
| Presse-boutons (seuil 30 j) | 3 j | 3 j | 1 → 1 |
| Presse-boutons sans achat (témoin) | 9 j | 3 j | 2 → 1 |

« Victoire visible » = nouveau bâtiment, chantier, palier, ×valeur, première fois **et désormais tout jalon du rythme**. La baisse vient de ce que ces jalons existent (le témoin,
dont l'économie est identique avant/après, passe de 9 à 3 jours) : c'est **mesuré sur bots, par définition** ; qu'un humain se sente récompensé par un toast est **supposé**.

### 2.4 Valeur finale et carte du temps (jour de la première fois, médiane)

| Persona | Valeur avant → après | Entrepreneur | Industriel | ×10 | 1er magasin niveau 2 | 1re usine moyenne | 1er prêt de projet |
|---|---|---|---|---|---|---|---|
| Presse-boutons | 201 → 206 M$ (+3 %) | j296 → j298 | j636 → j686 | j1074 → j1070 | j50 → j50 | j461 → j463 | — → j43 |
| Presse-boutons sans achat | 186 → 186 M$ (identique) | j320 → j320 | j734 → j734 | j1171 → j1171 | j50 → j50 | j481 → j481 | — |
| Optimiseur | 217 → 207 M$ (−5 %) | j137 → j135 | j595 → j756 | j1076 → j1134 | j670 → j150 | j349 → j364 | — → j64 |
| Étudiant | 215 → 215 M$ (0 %) | j286 → j270 | j772 → j872 | j973 → j1016 | j250 → j250 | j853 → j607 | — → j313 |
| Streamer | 312 → 256 M$ (**−18 %**) | j103 → j112 | j511 → j405 | j672 → j729 | j955 → j90 | j271 → j235 | — → j11 |
| Casual mobile | 296 → 255 M$ (**−14 %**) | j440 → j439 | j820 → j817 | j960 → j987 | — → j620 | j157 → j157 | — → j847 |

Premier produit, port et export : jour 3 à 13, inchangés. Siège, bourse, participation, filiale, campus : **jamais atteints** par ces bots (ils ne construisent pas de siège :
`bourse: false`) ; leurs missions passent en réserve et la série prend le relais. La ville finit à 250 000-370 000 habitants en 1 800 jours : **1 M, 2 M et 5 M d'habitants
ne sont pas atteints dans un Round** (paliers utiles en partie libre et pour le promoteur).

**Valeur : résultat honnête.** Sans action du joueur, l'économie est **identique** (témoin 186 = 186 M$ ; t83 : même valeur, trésorerie et dette au jour 360, rythme actif ou
coupé). Quand le bot suit le rythme, la valeur finale varie de **−18 % à +3 %** selon le persona. Diagnostic (Streamer, graine 7101) : avec seulement 4 gestes dans la partie,
la trajectoire est identique jusqu'au jour 800 puis diverge (346 → 274 M$) ; prêt de projet seul : 318 M$ ; une variante où le prêt sort du levier du bot fait pire (283 M$).
L'écart vient des **choix du bot** (dépendance au chemin : une chaîne lancée plus tôt ou plus tard change la suite), pas d'un coût caché des mécaniques ; mais il n'est **pas
démontré** que gestes et prêt de projet rapportent : ils occupent l'attente, ils ne l'abrègent pas. À faire : n'offrir que les gestes dont le gain annoncé s'est vérifié
(EBE mesuré du bâtiment 30 jours après), et tester le prêt de projet avec un planning de chaîne réaliste.

## 3. Mesuré ou supposé

| Affirmation | Statut |
|---|---|
| Intervalle maximal entre jalons majeurs ≤ 3,6 min (6 personas), ≤ 166 j sur 3 castes (t83) | **Mesuré (bots)** |
| Jours d'épargne sans geste possible ≤ 6,9 % (cible < 12 %) | **Mesuré (bots)** ; « geste utile » = définition du jeu (rentable, abordable, faisable) |
| Ennui du Streamer 114 → 19 jours | **Mesuré, par définition** ; plaisir réel **supposé** |
| Aucun effet économique automatique (rnd intact, mêmes valeurs rythme actif/coupé) | **Mesuré** (t83, t05, témoin A/B) |
| Économie d'ensemble intacte (t02, t65, t70) | **Mesuré** (tests verts) |
| Gestes utiles et prêt de projet accélèrent la croissance | **Non démontré** (−18 % à +3 %) |
| Duel du mois motivant | **Supposé** ; les bots gagnent presque tous les duels |
| Paliers de ville 1 M / 2 M / 5 M | **Implémentés, non atteints** en Round |

## 4. Tests

`tools/tests/t83_rythme.js` (23 contrôles) : départ sans mission gratuite (6 castes) ; intervalle entre jalons majeurs ≤ 400 j sur 3 castes (agriculteur, négociant,
industriel, 720 j) et ≥ 3 missions chacune ; sauvegarde en cours de chaîne relue à l'identique puis la chaîne continue ; ancienne sauvegarde sans `ry` ; économie identique
rythme actif ou coupé ; prêt de projet (refus sans EBE, versement, hors plafond ordinaire, remboursement quotidien) ; geste « chantier » en un clic ; mobile 390×844.
Relancés un par un : t01, t02, t05, t08 (chaînes et scénarios), t31, t36, t44, t45, t64, t65, t70, t74, t83 : verts.
Fichiers de mesure (hors dépôt) : dossier `rythme83` du scratchpad de session (`avant/`, `apres2/`, `diag/`).
