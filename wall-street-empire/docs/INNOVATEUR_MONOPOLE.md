# Passe 67 (innovateur) : le monopole temporaire de l'innovation

Constat de Rémy : l'innovateur tech était la caste la plus faible (0,76 de la moyenne). Sa raison d'être est de **créer un monopole temporaire** par l'innovation
(Apple, Dyson, Eli Lilly) : lancer un produit que personne ne sait faire, le vendre cher tant que les rivaux n'ont pas rattrapé, relancer le suivant avant l'érosion.
Décision ajustée en cours de passe : l'innovateur doit devenir la caste de plus forte valeur finale (≈ 1,5 à 3 fois la moyenne), avec une courbe convexe et la plus
forte variance, sans plafond, en restant à somme positive (`docs/PRINCIPE_JEU_POSITIF.md`).

Test : `tools/tests/t67_innovateur.js`. Outils : `tools/bot_lib.js` (`P.innov`), `tools/sim_batch.js` (profil `innovateur`, `--native`).

## 1. Diagnostic mesuré

**(a) Le bot ne jouait pas la caste.** En `--native`, l'innovateur était joué par le bot « bon joueur » (commerce et services) : aucun produit développé, aucun brevet,
aucune usine, aucun centre de R&D, aucun data center en 1 800 jours (relevé des bâtiments). Ses bonus (R&D et data centers −25 %, loyer de calcul ×1,12, arbre
technologique −30 %) ne s'appliquaient donc à rien. Le jouer avec le bot industriel ne marche pas non plus : la chaîne verticale d'un smartphone coûte 106 M$
(15 usines, 13 extracteurs) au jour 300, quand l'empire vaut 22 M$ ; le bot épargne indéfiniment.

**(b) La mécanique ne donnait pas de monopole.**
- `mpProdOf` comptait comme concurrent **chaque rival présent dans la catégorie** (attrait de rayon / 0,2), même s'il ne sait pas fabriquer le produit. Un produit
  inédit face à 5 rivaux : k = 5,0, prime de prix **4 %** (t67). Seul vraiment sur le marché, la prime vaut 47 %.
- Banc `tools/bench_pouvoir.js` (usine isolée) : smartphone **48 % d'EBITDA seul**, 25 % face à 5 concurrents ; casque audio 39 % contre 19 %. La marge de monopole
  existe (dans la fourchette 40-55 % visée), mais la partie ne la donnait jamais.
- En marché neuf (Round), le brevet ne touchait pas le prix : il ne jouait que sur les offres du marché mûr et sur les licenciés. La copie (`mpProdEntry`) ignorait le brevet.
- Les licenciés rivaux payaient leur redevance **sans rien encaisser** (somme négative).
- Le bonus « recherches 30 % plus rapides et 20 % moins chères » ne valait que pour l'arbre technologique, pas pour le développement de produits.

**(c) Vitesse de revenu.** Bot « bon joueur » innovateur : 48-57 M$ au jour 900, 135-156 M$ au jour 1 800 ; les autres castes jouées par leur playbook : 69-153 M$ au jour 900.

## 2. Mécanique : la fenêtre de monopole (`game.template.html`, passe 67)

- **Ouverture** (`monoInit`) : à la fin d'une R&D, si personne d'autre ne vend le produit (pas de copie, pas de brevet rival, pas de licence), `S.prod[pk].rx = 0`
  (rattrapage des rivaux : 0 = personne ne sait le faire, 1 = tout le monde). Un produit standard (sans R&D) ou sous licence n'a pas de fenêtre.
- **Prix** (`mpProdOf`) : les rivaux de la catégorie comptent pour `rx × attrait / 0,2` (au lieu de 1) ; chaque licencié compte 0,6 ; une copie compte 1.
  Pendant la fenêtre : prime ≈ 47 % (pharmacie), 38 % (courant), 50 % (luxe) : marge d'usine de monopole 40-55 %.
- **Érosion progressive** (`monoStep`, chaque jour) : `rx += 1 / fenêtre`, avec
  `fenêtre = 300 j × brevet (×1,6 ; médicament ×4 : les génériques attendent l'expiration) × Innovateur (×1,4) × avance technologique (1 + 2,5 × (techno/pointe − 1)⁺) / (1 + 0,35 × licenciés)`.
  Chaque copie avance `rx` d'un coup (+0,25 ; +0,15 sous brevet). Une nouvelle gamme brevetée relance la fenêtre (`rx ≤ 0,3`).
- **Brevet** : sous ton brevet, le délai avant copie double et le rival qui veut le produit **prend une licence** (forfait encaissé + redevance) au lieu de copier ;
  à défaut, une marque étrangère sort une version de gamme inférieure (demi-concurrent).
- **Export exclusif** (`monoXP`) : le monde ne sait pas le faire non plus : l'export d'un produit exclusif reçoit la prime de monopole × exclusivité, sur un volume
  mondial borné à 4 fois les ventes locales (au-delà, cours ordinaire). Mesuré : élargir ce volume à 10 fois ne change rien, et une montée en capacité sans borne ruine la
  chaîne (le prix des intrants monte) : 74 M$ au lieu de 216 M$ (essai écarté).
- **Somme positive** : le licencié rival encaisse sa marge sur ses ventes sous licence (16 %), redevance déduite (4 à 9 %) : chaque licence enrichit les deux parties (t67).
- **Plateforme cloud de l'Innovateur** (`svcSat`) : chaque brevet actif ajoute 40 % de la demande de calcul de la ville (`DC_PLAT`) : ses data centers vendent au-delà de la ville.
- **Bonus de caste rendus réels** : développement de produit −20 % de coût et −30 % de durée ; fenêtre ×1,4 ; textes de la fiche de caste mis à jour.
- **Interface** : « Fenêtre de monopole : exclusivité X %, environ N j restants (brevet) · prime +P % · risque de copie faible/moyen/élevé (~J j) » dans la fiche produit
  (`prodModelHTML`), le bureau de l'usine (carnet, prix et marge) et la section « Technologie de tes produits » du panneau R&D et brevets ; message quand la fenêtre se referme.
- **Sauvegarde** : un seul champ facultatif `S.prod[pk].rx` (dans `prod`, clé `wse-city-v8`) ; absent = marché ouvert (`rx = 1`), donc une ancienne sauvegarde se comporte comme avant.
- Exports `window.WSE` conservés ; ajout de `window.WSE.mono` (`info`, `txt`, `win`, `init`, `step`, `rx`, `xp`, `K`). Aucun tirage aléatoire ajouté (copies : `hash`).

## 3. Bot innovateur (`tools/bot_lib.js`, `P.innov`)

Bon joueur (commerce, services, data centers par rendement) + tous les 10 jours :
1. **Produit suivant** quand aucun développement n'est en cours et que le précédent s'érode (exclusivité < 50 %) ou a 150 jours : premier produit inédit abordable de
   `headache, cough, phone, antibio, tv, camera, smartwatch, headphones, …` (palier atteint, pas de brevet rival, pas copié).
2. **Usine du produit** dès le lancement (composants achetés ou fabriqués par les usines libres), agrandie tant que l'exclusivité tient (> 30 %), que l'usine rapporte
   plus de 60 %/an et que la production reste sous le débouché (ventes locales + export exclusif).
3. **Échec** : une usine qui ne produit rien après 45 jours (intrants introuvables à un coût rentable, cas fréquent de l'électronique à composants importés) est
   libérée et le produit abandonné : la R&D est perdue (risque de l'innovation).
4. **Centres de R&D** : le premier dès 40 M$ de valeur (financé à crédit en priorité), puis à 120 et 250 M$ ; priorité de R&D au produit exclusif le plus rentable.
5. **Pari de long terme (Eli Lilly)** : la pilule contre l'obésité (1 200 jours de R&D, réduits par la caste et les centres), lancée en parallèle dès le premier centre.
6. **Licences** : refusées tant que l'exclusivité dépasse 45 %, acceptées ensuite (redevances ×1,5).
7. **Data center** : un premier campus à crédit dès 70 M$ de valeur si le financement le permet (rarement atteint en 1 800 jours, voir limites).

## 4. Mesures (sim_batch `--native`, 1 800 jours, graines 6000/7000/8000, 1 travailleur)

AVANT = `90d1857` (playbooks des autres castes, innovateur joué par le bot « bon joueur ») ; APRÈS = cette passe (innovateur joué par `P.innov`). Mêmes graines, 18 parties chacun.

| Caste (bot) | AVANT 6000 / 7000 / 8000 (M$) | moy. géo. | / moyenne | APRÈS 6000 / 7000 / 8000 | moy. géo. | / moyenne | après / avant |
|---|---|---:|---:|---|---:|---:|---:|
| agriculteur (agri) | 297 / 307 / 284 | 295,7 | 1,38 | 282 / 323 / 299 | 300,7 | 1,21 | 1,02 |
| banquier (banque) | 287 / 288 / 328 | 300,3 | 1,40 | 287 / 288 / 328 | 300,3 | 1,21 | 1,00 |
| **innovateur** (bon → innovateur) | 135 / 156 / 137 | **142,3** | **0,66** | 208 / 224 / 386 | **262,0** | **1,06** | **1,84** |
| négociant (negoce) | 264 / 266 / 227 | 251,5 | 1,17 | 240 / 271 / 252 | 253,9 | 1,03 | 1,01 |
| industriel (baron) | 218 / 214 / 184 | 204,4 | 0,95 | 263 / 266 / 233 | 253,5 | 1,02 | 1,24 |
| promoteur (bon) | 152 / 189 / 120 | 151,0 | 0,70 | 152 / 189 / 120 | 151,0 | 0,61 | 1,00 |
| toutes | | 214,8 | 1 | | 247,5 | 1 | 1,15 |

Classement (moy. géo.) : AVANT banquier > agriculteur > négociant > industriel > promoteur > **innovateur (6e)** ;
APRÈS agriculteur ≈ banquier > **innovateur (3e)** > négociant ≈ industriel > promoteur. Aucune erreur de page ; joueur 1er dans 17 parties sur 18 (promoteur 8000 : 2e), avant comme après.

Trajectoire de l'innovateur (M$, jours 300 / 600 / 900 / 1 200 / 1 500 / 1 800) :
AVANT 22-23 / 34-37 / 48-57 / 72-84 / 105-108 / 135-156 ; APRÈS 35-37 / 66-68 / 96-107 / 117-139 / 152-237 / 208-386 : départ deux fois plus rapide (le premier
médicament breveté), puis accélération en fin de partie quand la pilule contre l'obésité arrive (graine 8000 : 139 → 237 → 386 M$).
Variance la plus forte des six castes (208-386 M$, ±30 %), comme voulu (pari de R&D de long terme).

Effet sur les autres castes : agriculture, banque, négoce et promotion inchangés (±2 %, dans le bruit) ; le baron industriel gagne +24 % parce qu'il développe aussi
des produits inédits (médicaments) et profite de la même fenêtre de monopole (mécanique générale, pas un bonus de caste).

Variantes mesurées (innovateur seul, mêmes graines) : sans fenêtre pharmacie longue ni centre de R&D prioritaire 336 / 184 / 403 (moy. géo. 292 : dans le bruit) ;
export exclusif borné à 10 × les ventes locales : sans effet ; montée en capacité sans borne (usines tant qu'elles rapportent) : 74 M$ (écartée).

**Cible non atteinte.** La cible de Rémy (1,5 à 3 fois la moyenne) n'est pas atteinte : 1,06 de la moyenne (1,84 fois l'innovateur d'avant, 3e sur 6 ; meilleure partie
de toute la campagne : 386 M$ contre 328 pour le meilleur banquier). Freins mesurés : (1) le data center campus (64 M$ pour l'innovateur, plafond de crédit ≈ 39 M$ à
100 M$ de valeur) n'est jamais construit avant le jour 1 800, alors que sa demande de plateforme est là (D = 39 campus, rendement 32 %/an) ; (2) l'électronique à
composants importés échoue (garde-fou de rentabilité) ; (3) la valorisation est comptable : la rente de monopole n'entre que par la trésorerie. Pistes : financement de
projet adossé aux brevets pour le premier campus (crédit de caste, comme le promoteur et le banquier), chaîne de composants électroniques pour la R&D, rendements
croissants de la plateforme cloud (coût marginal décroissant par campus).

## 5. Limites

- 3 graines par caste ; une partie de bot change de 20 à 40 % d'une graine à l'autre pour l'innovateur (variance voulue : la pilule contre l'obésité arrive ou non à temps).
- Machine partagée avec d'autres agents : les durées ne sont pas des mesures de performance.
- La mécanique est générale : toute caste qui développe un produit inédit ouvre une fenêtre (le baron industriel, qui développe des médicaments, en profite aussi).
- L'électronique à composants importés échoue presque toujours (garde-fou de rentabilité d'`autoSource`) : le bot innovateur gagne surtout par la pharmacie.
  Une vraie chaîne de composants électroniques (écrans, circuits, batteries) reste trop chère avant 100 M$.
- Le data center campus (60 M$ pour l'innovateur) n'est presque jamais construit avant le jour 1 800 : la plateforme cloud reste une voie de fin de partie.
- La valorisation est comptable (actifs + trésorerie) : les brevets n'y figurent pas ; la rente de monopole compte par la trésorerie qu'elle accumule.
