# Journal du responsable Économie de marché

Domaine (docs/RESPONSABILITES.md) : prix, demande des ménages (budget fermé), B2B, import/export, faillites, cycles.
Indicateurs : aucune borne administrée sauf garde-fou instrumenté ; pas de NaN ; début accueillant pour toutes les castes ; croissance exponentielle ; la vente à perte mène à la faillite.
Branche : `economie-marche` (depuis `ccr-d9ba3623-415kh0`, HEAD 4bf6b66). Les noms de fonctions et de constantes font foi.

## Retours de Rémy traités (transcription) et ordre suivi
1. Emballage par matière (« un emballage ne contient pas de pétrole par définition »).
2. Dimensionnement pour 100 000 habitants (« un supermarché ne peut pas vendre seulement 167 bouts de pain »).
3. Concurrence féroce : le faucon et les colombes.
4. Information dans la supply chain : l'effet coup de fouet.
5. Calibration par bots et décision sur la faillite du joueur.
Ordre suivi : 1 → 2 et 3 ensemble → 4 → 5. Justification : le partage de la demande entre vendeurs (3) est la même fonction que la demande par habitant (2) ; les faire
séparément aurait obligé à réécrire deux fois la boucle de vente.

## Lot 1 : emballages par matière
Constat : le bien `pack` (« Emballages ») se fabriquait avec du plastique ET du bois ; tout produit emballé en consommait 1 par unité (7 $), plus que l'ingrédient pour les œufs
(1 200 $ d'œufs pour 705 $ d'emballage par cycle, constat T6 de l'audit de jouabilité). La chaîne des œufs exigeait un puits de pétrole.
Décisions :
- `PACK` garde le NIVEAU (vrac, standard, coffret premium) ; `PACK_MAT` donne la MATIÈRE et sa chaîne : papier et carton ← bois (bien `paper`), plastique ← pétrole (bien `pack`,
  renommé « Emballages plastique », recette plastique seul), verre ← sable et silice (`glass`), métal ← bauxite (`aluminium`).
- Quantité : la valeur d'un emballage standard est une part du prix de gros sans emballage (`PACK_SH` : 7 % base, 4 % courant, 2,5 % luxe ; `P.pv` calculé à l'étalonnage)
  × le coût relatif de la matière (`cf` : papier 1, plastique 0,85, verre 1,8, métal 1,4).
- Matières naturelles par produit (`PACK_NAT`, la première par défaut) : pain nu ou papier ; œufs et lait en carton ; viandes en barquette plastique ; bière et vin en verre ;
  soda en plastique, verre ou canette ; durables en carton. Le joueur choisit librement la matière (boutons dans la vue Produits, `ps.pm`, champ facultatif) : verre +6 % d'attrait,
  plastique −3 %, une matière inhabituelle pour le produit −6 % (`packAttrOf`). Le vrac n'est plus pénalisé pour un produit qui se vend nu (pain).
- Partout la même source : `packIn(pk, ps)` dans `productInputs`, `mkInputs`, `calProd` ; `prodCore` (intrants hors emballage) pour la qualité des matières (`iqua`) et les
  ingrédients principaux du devis (`fabInc`). Le planificateur (`chainNeeds`, `chainLeaves`, devis « Construire cette chaîne ») et le Guide du fabricant suivent donc la matière choisie.
Mesures : œufs 124 $ de carton par cycle pour 1 200 $ d'œufs (avant : 705 $ d'emballage) ; feuilles de la chaîne des œufs : œufs, bois, blé (avant : pétrole) ; devis des œufs sans puits de pétrole.
Test : `t114_emballages` (12 vérifications).

## Lots 2 et 3 : articles, besoin par habitant, partage de la demande entre tous les vendeurs
Constat (sonde, ville de 100 000 habitants, région 303 000, jour 30) : demande « base » 6 641 unités/j pour la région, soit 0,022 par habitant ; un supermarché vend 43 « pains »
(lot de valeur à 4,17 $) ; la demande non servie par tes magasins disparaissait (aucun autre vendeur explicite) ; les produits de base se concurrençaient entre eux dans un panier
(si tu ne vendais que du pain, tout le panier de base allait au pain).
Décisions :
- Unité = ARTICLE (`ART` : article, prix de rayon visé, besoin par habitant et par jour) pour 26 biens de consommation courante : baguette (250 g), boîte de 6 œufs, poulet entier,
  litre de lait, pack de 4 yaourts, barquette de viande de 500 g, etc. À l'étalonnage, A = prix de rayon d'avant ÷ prix visé (`ART_K`) ; la production par cycle est multipliée par A,
  le prix de référence divisé par A (valeur neutre : même coût et même valeur par cycle, A fois plus d'articles ; le fret suit la valeur, pas le nombre d'articles).
- Besoin de la ville par produit (`pkDemDay`, `pkDem`) : habitants × besoin par habitant × chocs (dMul) × accessibilité (salaire réel) × revenu réel^ε (ε = 0,12 + 0,6 × (1 − nécessité)),
  avec une clôture budgétaire (`ART_MAXSH` = 12 % du revenu disponible). Les biens non courants (courant, luxe) gardent le budget d'Engel partagé par l'attrait (on arbitre entre une télé et un téléphone,
  pas entre le pain et les œufs).
- Partage entre TOUS les vendeurs (`pkShare`) : poids de tes magasins = capacité de rayon du produit × fréquentation (emplacement, notoriété, service : `c.pw`, `c.adF`, exposants par classe)
  × attrait de ton offre (prix, qualité, marque, fidélité, emballage) rapporté à la « marque blanche » des commerces de la ville (`pkNpcA` : prix standard, qualité locale `locQ`, sans marque) ;
  commerces de la ville et Mall : capacité `NPC_SL` = 1,1 × la demande ; concurrents IA : `RIV_W` × leur attrait (marque, prix, service). Le service Vente borne la capacité, pas l'attrait.
- Vente en gros aux commerces de la ville (`b2bStep`) : ta production d'un bien courant est achetée par les commerces de la ville au prix que tu fixes, jusqu'à `B2B_MAX` (25 %) de leurs achats
  au prix standard, jusqu'à 90 % si tu es nettement moins cher (élasticité 6 : un acheteur professionnel compare), moins si ta qualité perçue est faible. Tu gardes `B2B_RES` jours de ventes
  pour tes magasins. Avant : le surplus d'une usine partait à l'export à ≈ 72 % du cours.
- Faucons et colombes (`rivHawk` = agressivité du profil de caste × niveau de difficulté × curseur de concurrence ; `HAWK_TH` = 0,75) : le faucon suit tes baisses fort et jusqu'à −25 %,
  dès 2 % de parts ; la colombe suit si sa trésorerie dépasse `DOVE_CR` (15 %) de sa valeur, sinon elle cède des parts (ferme des rayons, journal « cède des parts »). Les guerres des prix,
  la vente forcée, la restructuration et la faillite des rivaux existaient : elles jouent maintenant aussi par produit (ta part de pain pèse sur leur classe).
- Lecture : fiche d'emplacement (« Finances de l'emplacement ») : unité, demande de la ville, partage toi / ville et Mall / rivaux, vendu en gros.
Mesures (graine 7001, ville de 100 000) :
- besoin de pain 83 000 à 91 000 baguettes/j (0,28-0,30 par habitant) ; dépense des 26 biens courants 5,7 % du revenu disponible ;
- supermarché près du Mall (6 produits) : 240 baguettes, 227 boîtes d'œufs, 574 L de lait, 100 poulets par jour ; chiffre d'affaires 4 210 $/j contre 4 208 $/j avant (valeur neutre) ;
- part de la ville d'un supermarché : 0,3 % ; commerces de la ville et Mall 78 % ; concurrents 21 % ;
- petite boulangerie industrielle : 20 500 baguettes/j, dont 19 700 vendues en gros aux commerces de la ville (avant : 3 718 « pains » dont l'essentiel exporté).
Scénarios (`tools/concurrence_sim.js`, 240 jours, trois boulangeries, trois magasins) : voir la section « Mesures de la concurrence ».
Tests : `t111_echelle_demande`, `t112_concurrence`.

## Mesures de la concurrence (`tools/concurrence_sim.js`, 240 jours, trois boulangeries, trois magasins, graine 7001)
| Situation | Part de la ville (pain) | Marge sur 10 j | Réponse des rivaux |
|---|---|---|---|
| A. entrée intégrée au prix standard | 47 % (coût 0,62 $ < prix 0,75 $) | +49 000 $ | Mega Mart et DiscountCo baissent un peu (0,95 → 0,91 ; 0,84 → 0,80) |
| B. guerre des prix (60 % du prix standard, jours 40-120) | 63 % | −77 000 $ | les deux répliquent ; la colombe à trésorerie saine suit |
| C. retour au prix standard | revient vers A (± 15 points à 30 jours : les rivaux remontent leurs prix lentement) | positive | prix des rivaux qui remontent de 1,5 %/j au plus |
| D. guerre contre une colombe sans trésorerie (Mega Mart) | 62 % | négative | trois « cède des parts », magasins fermés (attrait 0,48 → 0,29), participation de Luxor & Fils |
La marque protège : attrait relatif ×6 avec marque et fidélité à 80 (t112).

## Lot 4 : information dans la chaîne et coup de fouet
- `ichStep` simule, par bien courant et par CIRCUIT (« dom » : commerces, achats des ménages ; « rhd » : restauration hors domicile, part `RHD_SH`), quatre maillons :
  commerces → grossistes → usines → fermes (`ICH_L` : retard d'information tau, lissage a, couverture cov plafonnée à 60 % de la durée de conservation, correction b, délai lt).
  Périmés premier entré premier sorti (`ICH_SHELF`) ; fermes engagées (`ICH_COMMIT` : 240 j pour une culture, 300 pour le lait, 700 pour le bœuf) : leur invendu part à l'export à perte
  quand silos et chambres froides (20 jours de production) sont pleins. Demande du jour : semaine + aléa par `hash` (jamais `rnd`).
- Couplages : la vente en gros (`b2bStep`) reçoit les commandes des grossistes (`ichOrdF`, amplifiées et en retard) ; la demande de matières des usines de la ville (`stepLocalMarket`)
  suit les commandes des usines aux fermes (`ichRaw`, lissée sur une semaine : les chocs passent, pas le bruit).
- Ton usine : réglage « suivre la demande prévue » (`ps.plan = 'dem'`, limite `_plan` dans `runRecipe`) : prévision = ventes de la veille de tes magasins (information intégrée, sans retard)
  + commandes en gros vues avec 2 jours de retard ; contrat de partage d'information (`ps.ish`, 250 $/j indexés) : les commerces commandent sur leurs ventes (70 %), tu connais leurs commandes
  le jour même (effet partiel). Fiche d'usine « Prévision et information » : information intégrée ✓, erreur de prévision, couverture de stock, coup de fouet par maillon, périmés, coût de possession.
- CHOC SECTORIEL et nuancé (correction de Rémy) : `ichShock(m, jours, { ch })`, par défaut la restauration (type Covid). Les ménages continuent de manger du pain : 70 % des repas perdus
  se reportent à la maison (`ICH_HOME`) ; la demande en commerces ne baisse pas (88 349 → 93 332 baguettes/j). Ce qui fait mal : les périmés des grossistes de la restauration (dès le jour +1),
  les commandes des usines aux fermes qui s'effondrent (×0 au jour +3 pour le poulet de la restauration), l'invendu agricole qui arrive plus tard (jour +12).
- Mesures (t113) : coup de fouet du lait 5,7 % (consommateurs) < 6,5 % < 10,5 % < 16,3 % (usines) ; pain 5,5 % → 13,8 % → 19,4 % → 17,7 %. Ton usine à la demande : surplus soldé à l'export
  10 409 → 508 /j, stock 10 510 → 7 701 ; partage d'information : erreur 14,8 % → 3,8 %, variabilité de la production 16,2 % → 7,1 %.

## Lot 5 : faillite du joueur (décision de Rémy : réelle, banqueroute = fin de partie)
- Pas de FCF négatif « magique » : il émerge des marges, des stocks, de la production, des coûts fixes et de la dette du joueur, et de sa réaction.
- `insolvStep` : banqueroute quand la trésorerie est sous le découvert toléré ET que ni la banque (`creditLimit` : EBE, levier, garanties, `credCycle`, crise du crédit) ni les investisseurs
  (`vcNext`, émission d'actions : valorisation positive, prime) ne peuvent, ensemble, combler le trou, pendant `INS_END` = 30 jours de grâce (alertes au journal au 1er jour et à mi-délai ;
  avant cela, alerte « découvert toléré » tous les 15 jours avec ce que la banque et les investisseurs proposent). Fin de partie dans tous les modes (`endGame('lose')`), écran de fin habituel
  avec le récapitulatif des causes (trésorerie, dette, intérêts, résultat, BFR, conjoncture, choc). Pas de rebond, pas de renflouement.
- Leviers existants, reliés et lisibles : emprunter, lever des fonds ou émettre des actions, vendre ou démolir des actifs, « Vider le stock », production à la demande, prix et publicité,
  changement de fournisseur, effectifs (ils suivent l'activité).
- Test `t115_faillite` : trou de trésorerie + surendettement ⇒ banqueroute au jour 120 (après la grâce) ; même trou mais refinancement possible ⇒ pas de fin ; passif contre réactif sous un choc
  sectoriel ⇒ le réactif garde plus de trésorerie ; bien capitalisé ⇒ survit ; déterministe.
- Les IA rivales suivaient déjà la même règle (vente forcée, restructuration, faillite).

## Lot 6 : cycle économique et tableau de bord
- Cycle asymétrique en quatre phases (`cycDev`, `cycShape`, `cycPhase`) : reprise → expansion → pic → récession (dépression si profonde : 18 % des cycles, tirés par `hash` une fois par cycle,
  récession plus longue et plus creuse). Une année = 120 jours : cycle moyen ≈ 1 150 jours (≈ 9,5 ans), récession ≈ 10 % du cycle (≈ 11 mois). Écart nul à mi-cycle (les tests qui figent la
  conjoncture à phase = π gardent leurs repères).
- Effets, tous par les mécanismes existants : PIB → emploi (loi d'Okun : coefficient 1,1 autour du taux naturel `nairu`, inertie ; les postes vacants ne neutralisent plus le cycle, d'où
  « le chômage ne varie jamais » : il était collé au plancher frictionnel de 3 %), salaires, épargne, budget des ménages (Engel), crédit (`credCycle`), taux, bourse (`mktSent` anticipe la
  conjoncture à 60 jours). Biens de base peu sensibles : élasticité-revenu des biens courants 0,04-0,1 (le DEM_PER_POP et la logique basique / courant / luxe ne changent pas).
- Rivaux : en récession un faucon qui a de la trésorerie attaque plus tôt (seuil de guerre × 0,6) ; une colombe déficitaire réduit plus tôt.
- Tableau de bord (Ville / Économie, `ecoDashHTML`) : phase en clair (et délai indicatif avant la prochaine récession), PIB, chômage et taux naturel, taux directeur, inflation et indice des prix,
  pouvoir d'achat et salaire moyen, crédit (disponibilité, spread, taux proposé), humeur et épargne, indice immobilier, stocks, couverture et utilisation des capacités ; tendance ▲▼ sur 30 jours
  et mini-courbe sur 6 mois (`S.macro.hx`, relevé tous les 5 jours). Tuile « Conjoncture » : phase du cycle + choc en cours.
- Mesures (t116, 600 jours) : chômage 5,4 % → 12,1 % (pointe en récession, 7,7 % en expansion) ; luxe −25 % en récession, base +2 % ; pain 0,291 → 0,292 baguette/hab./j ; la reprise relève le luxe.

## Lot 7 : coût de possession du stock et BFR (Rémy : le cycle sur toute la chaîne)
- `holdStep` : coût de possession des stocks de produits, par jour = valeur au coût × (taux d'emprunt + entreposage et assurance 12 %/an + démarque des périssables, jusqu'à 50 %/an),
  compté en logistique dans le compte de résultat. Il monte quand les stocks gonflent (récession, usine qui ne réagit pas).
- Créances clients : la vente en gros est encaissée à 30 jours (`S.ar`, champ facultatif sauvegardé) : la croissance gonfle le BFR et réclame de la trésorerie (on peut faire faillite en croissance).
- Lecture : fiche société (BFR, dont stocks et créances, variation sur 30 jours, coût de possession, besoin de financement), fiche d'usine (coût de possession) ; message court au journal
  quand le BFR grimpe (« prévois de la trésorerie, déstocke, ralentis la production ou ajuste tes prix »).
- Reste à faire : délais de paiement fournisseurs (achats payés comptant), négociation des délais, coût de stockage des entrepôts au-delà de c._fee.

## Calibration par bots (sim_batch `--native`, une graine, 816 jours ; M$ aux jours ≈ 200 / 400 / 600 / 800)
| Caste | Départ (HEAD 4bf6b66) | Lots 1 à 4 | Final (lots 1 à 7, cycle long) |
|---|---|---|---|
| Banquier | 31 / 63 / 93 / 143 | 31 / 63 / 92 / 143 | 31 / 62 / 105 / 151 |
| Agriculteur | 38 / 101 / 112 / 107 | 35 / 96 / 81 / 100 | 33 / 93 / 108 / 113 |
| Négociant | 24 / 40 / 85 / 124 | 24 / 43 / 85 / 155 | 27 / 42 / 85 / 152 |
| Promoteur | 34 / 42 / 206 / 167 | 34 / 22 / 111 / 91 | 34 / 41 / 66 / 234 |
| Innovateur | 33 / 70 / 145 / 223 | 33 / 69 / 131 / 194 | 33 / 69 / 149 / 241 |
| Industriel | 14 / 29 / 47 / 77 | 16 / 29 / 50 / 84 | 15 / 19 / 34 / 44 |
Aucune banqueroute de bot sur 816 jours (agriculteur compris). Lecture honnête : après les lots 1 à 4, l'écart entre castes à 6 ans s'était resserré (2,9 → 2,1) et l'industriel démarrait mieux
(vente en gros) ; avec le cycle long et la loi d'Okun (lot 6), l'industriel retombe à 44 M$ (contre 77 au départ) : son playbook de bot épargne et construit en plein milieu de la première
récession, qui tombe maintenant vers le jour 400-500 de cette graine. Une seule graine : la mesure sur plusieurs graines et l'équilibrage de l'industriel restent À FAIRE (indicateur
« valeurs à 6 ans plus proches » non atteint).

## Tests modifiés (justification)
- `t08_chaines` « chaîne mal construite (pain sans farine) » : 5 % → 10 % de marge au plus ; la farine reste importée au prix du port, mais le pain se vend maintenant en gros aux commerces de la ville
  au lieu de partir à l'export à 72 %. Les deux échecs « chaîne bread bien construite » existaient au départ (−10 % d'EBITDA ; maintenant −8 %).
- `t25_macro_humeur` : plancher du PIB −4,5 % → −6,5 % (la dépression, profonde et rare, fait partie du cycle demandé par Rémy).
- `t111` hypermarché : des centaines de baguettes par jour (un méga-centre en vend quatre fois plus) ; le chiffre d'affaires d'un magasin est resté du même ordre (valeur neutre).

## Emprunté comme principe / conçu en propre
Emprunté comme principe : la note de la concurrence « marque blanche » (déjà dans le jeu), le jeu de la bière (beer game) et l'effet coup de fouet des cours de supply chain,
la règle d'Engel. Conçu en propre : matières d'emballage et leur effet sur l'attrait, unité = article avec facteur de valeur neutre, besoin par habitant borné par le budget,
partage capacité × fréquentation × attrait relatif entre tes magasins, les commerces de la ville et les rivaux, vente en gros aux commerces de la ville, profils faucon et colombe,
chaîne d'information simulée des commerces de la ville couplée à tes usines et aux fermes.


## Note du responsable Vente aux commerces (branche `vente-commerces`)
`b2bStep` : les commandes des grossistes sont multipliées par (1 − `bshCut(pk)`), la part des commandes des commerces de quartier où le joueur est référencé nommément (`bshStep`, exécuté juste avant) ;
leurs livraisons entrent dans `S._b2b.v` (créances à 30 jours, `arStep`) et le transport dans les frais. Le « B2B de ville » = référencements nommés + reste anonyme. Détail : `docs/journal/vente_commerces.md`.
