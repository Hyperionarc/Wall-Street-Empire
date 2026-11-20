# Monétisation et gamification : hypothèses, mesures et plan de test

*20 novembre 2026, passe 76. Aucune donnée de vrais joueurs n'existe à ce jour. Tout ce qui suit est soit **mesuré sur des joueurs simulés (bots)**, soit **supposé** ; chaque point est étiqueté. Aucun paiement réel n'est branché dans le jeu (`IAP_LIVE = false`). PDF : `docs/WSE_Plan_Monetisation_Gamification.pdf`.*

## 1. Synthèse exécutive

- **Deux segments, deux produits.** (A) Le *Presse-boutons* (profil Damien, joueur dépensier de Supremacy) achète du **temps**, de la **délégation** et du **statut**. (B) L'*Optimiseur* (profil Rémy, ingénieur) achète le **jeu et ses extensions**, reste longtemps et recrute par le bouche-à-oreille. La monétisation doit servir A sans faire fuir B. *(Hypothèse de départ, à valider en bêta.)*
- **Décisions de Rémy, traduites en règles de conception.** L'optimisation **automatique** de la chaîne d'approvisionnement (le COO) est le produit payant ; l'optimisation **manuelle** reste gratuite et doit rester **au moins aussi bonne** (sinon c'est du pay-to-win). L'accélération des chantiers (barre de progression des niveaux 1→5) se paie en monnaie simulée (Diamants) mais n'est **jamais obligatoire**. Dans le **Round compétitif**, aucun achat ne change le classement.
- **Ce que disent les bots (mesuré, 27 parties de 1 800 jours, 3 graines, caste industrielle).** Fournisseurs automatiques et revue manuelle donnent le même résultat (le COO « supply chain » vend du temps de joueur, pas de la victoire) ; en revanche les prix confiés au COO rapportent +29 % face aux prix par défaut, à corriger avant de les vendre ; le vrai blocage est l'argent (21 à 32 % des jours du Presse-boutons en épargne), pas le temps ; les jalons sont espacés de 8 à 13 minutes réelles après ×10. Détail §6.
- **Ce que les bots ne peuvent pas dire.** Rétention J1/J7/J30, conversion, ARPPU, plaisir : il faut de vrais joueurs. La télémétrie locale anonyme livrée dans cette passe (opt-in, rien n'est envoyé, export JSON) est l'outil de la bêta fermée.
- **Prochaine étape recommandée.** Entretien avec Damien Gromier (5 questions, §9), puis bêta fermée de 20 à 40 joueurs (moitié A, moitié B) avec export volontaire du journal de télémétrie, avant tout soft launch.

## 2. Mesuré ou supposé

| Affirmation | Statut | Source |
|---|---|---|
| Temps pour atteindre chaque jalon, creux de progression, ruptures, attente de trésorerie, usage manuel/automatique par persona | **Mesuré (bots)** | `tools/sim_batch.js --icp`, `tools/analyze_icp.py`, §6 |
| La délégation (COO) fait gagner du temps de jeu ou du résultat | **Mesuré (bots, A/B même graine)** | §6.5 |
| Nombre d'occasions où une accélération aurait fait gagner > 10 % / 25 % du temps jusqu'au jalon suivant | **Mesuré pour la R&D** ; **calculé sur hypothèse** pour les chantiers (durées supposées : niveau 2 = 5 j, 3 = 10 j, 4 = 20 j, 5 = 40 j ; aujourd'hui un niveau s'obtient instantanément) | §6.4 |
| Les joueurs A paient pour du temps et du statut, les joueurs B pour du contenu | **Supposé** (entretiens à faire, marché des 4X/MMO de stratégie) | §3 |
| Rétention J1/J7/J30, durée de session, conversion, ARPPU | **Non mesuré** (aucun joueur réel) ; cibles du dossier investisseurs reprises comme hypothèses | §7 |
| Comportement des bots = comportement humain | **Faux par construction** : les bots ne s'ennuient pas, ne lisent pas, ne paient pas ; ils mesurent l'économie, pas l'envie | §11 |

## 3. Hypothèses : qui joue, et pourquoi il paierait

### 3.1 Segments et ICP

| Segment / ICP | Objectif | Session | Ce qui le retient | Ce qui le fait partir | Ce qu'il achèterait (supposé) |
|---|---|---|---|---|---|
| **A. Presse-boutons** (Damien, type Supremacy) | grossir vite, dominer, être vu | courtes et fréquentes, plusieurs par jour | compétition, statut, alliances, notifications, rythme | être bloqué sans rien à faire, être battu par un payeur | temps (accélérations), délégation (COO), parallélisme (2ᵉ chantier), cosmétique de statut, passe de saison |
| **B. Optimiseur** (Rémy, ingénieur) | comprendre et régler finement la machine | longues, le soir et le week-end | profondeur, lisibilité des chiffres, défis, scénarios | sentiment que l'argent bat la compétence, opacité | le jeu, les extensions (nouvelles chaînes, villes, scénarios), éventuellement le COO pour les tâches répétitives |
| Étudiant en gestion | apprendre en jouant | moyennes | réalisme, explications, Guide du fabricant | jargon sans aide, mode compétitif agressif | version éducation (licence établissement), pas d'achats in-game |
| Streamer compétitif | spectacle, classement, rivalités | longues, en direct | événements visibles, retournements, saisons | parties lentes, absence de classement public | cosmétique, passe de saison ; ne veut **pas** de pay-to-win (critiqué en direct) |
| Casual mobile | se détendre 5 minutes | très courtes | progression pendant l'absence, objectifs courts | lenteur du début, écrans denses | accélérations ponctuelles, pack de démarrage |
| Enseignant de gestion | démontrer des mécanismes (prix, offre, chaîne) | préparées, en classe | scénarios rejouables, tableaux exportables | coût par élève, achats intégrés | licence classe, scénarios pédagogiques |

### 3.2 Boucles courtes et longues
- **Boucle courte (minutes)** : construire, voir l'argent rentrer, améliorer un bâtiment (niveau 1→5), lever un blocage (rupture, trésorerie). C'est la boucle du segment A ; c'est là que vivent les accélérations.
- **Boucle moyenne (heure)** : lancer une chaîne (R&D → usine → magasin), atteindre un palier, gagner un Round de 90 minutes.
- **Boucle longue (jours, semaines)** : saisons compétitives, prestige conservé, alliances, nouvelles villes et extensions. C'est la boucle du segment B et du bouche-à-oreille ; elle est **absente aujourd'hui** (voir docs/RAPPORT_GAMEPLAY_FIDELISATION.md).

### 3.3 Délégation contre maîtrise
Le cœur de la proposition : **déléguer s'achète, maîtriser se gagne**. Le COO payant fait le même travail que le joueur attentif, sans fatigue ; il ne doit **jamais** faire mieux qu'un bon joueur manuel. La règle mesurable : sur les mêmes graines, l'Optimiseur manuel atteint ses jalons au moins aussi vite que le même joueur avec COO (§6.5). Si le COO devient meilleur, on le bride ; s'il est bien plus mauvais, personne ne l'achète.

### 3.4 Leviers

| Levier | Pour qui | Ce qui se vend | Garde-fou | État dans le jeu |
|---|---|---|---|---|
| **Temps** (accélérations) | A, mobile | Diamants : −1/−5/−10 jours sur une recherche ; demain, sur un chantier | plafonds (10 j par jour de jeu, ½ de la durée) ; Diamants gagnés en jouant (paliers, jalons) ; désactivé en Round classé | Existe pour la R&D (`WSE.rd.accelerate`) ; chantiers instantanés aujourd'hui |
| **COO / délégation** | A, mobile, B fatigué | abonnement ou achat unique « COO » : fournisseurs, prix, ruptures gérés en continu | jamais meilleur que le manuel ; le manuel reste gratuit et complet | Existe et gratuit : politique « Chercher de meilleurs fournisseurs », prix confiés au COO, bouton « Sources automatiques » |
| **Parallélisme** | A | 2ᵉ file de chantier ou de recherche | file gratuite toujours disponible ; pas en Round classé | Absent |
| **Statut / cosmétique** | A, streamer | sièges, enseignes, couleurs d'empire, trophées de saison | n'affecte jamais l'économie | Palmarès et classements existent ; cosmétique absent |
| **Saisons compétitives** | A, streamer | passe de saison (cosmétique + objectifs), prestige conservé | classement par mérite seul | Round de 90 min existe ; saisons absentes |
| **Alliances** | A | rien à vendre directement ; moteur de rétention et de dépense sociale | — | Absent (multijoueur asynchrone à faire) |
| **Contenu / extensions** | B | nouvelles villes, chaînes, castes, scénarios | — | Le contenu existe ; pas de découpage commercial |
| **Éducation / B2B** | étudiant, enseignant | licence établissement, scénarios pédagogiques | sans achats intégrés | Onglet Apprentissage et Guide du fabricant existent |

## 4. Règles de conception issues des décisions de Rémy

1. **Manuel gratuit et complet** : choix des fournisseurs, prix, ruptures, tout reste accessible sans payer.
2. **COO payant = automatisation, pas avantage** : il applique les mêmes règles que le joueur, avec ses tolérances (7 jours de rupture tolérée par défaut) ; test de non-régression à créer : « COO ≤ Optimiseur manuel » sur 3 graines.
3. **Accélération jamais obligatoire** : aucun contenu n'est inaccessible sans accélérer ; le temps d'attente sans payer est mesuré et borné (cible : aucun creux > 3 minutes réelles sans action possible).
4. **Round compétitif sans pay-to-win** : en Round classé, accélérations et COO payant désactivés (ou COO accessible à tous) ; seul le cosmétique se vend.
5. **Prix toujours affiché avant confirmation**, en monnaie simulée et (le jour venu) en euros ; pas de boîte à butin.

## 5. Télémétrie locale anonyme (livrée, passe 76)

- **Opt-in, désactivée par défaut** : Menu > Partie > « Télémétrie locale (anonyme) » Oui/Non. Rien n'est envoyé sur le réseau (vérifié par t76).
- **Journal** dans `localStorage['wse-telemetry']`, borné à 200 ko : au-delà, les événements les plus anciens sont retirés (les « premières fois » restent).
- **Événements** : partie observée, premier achat, première usine, palier, multiples de valeur (×1,5 à ×100), 1 Md$, chantier lancé (niveau 1→5 ou étage), accélération payée (Diamants, trésorerie, crédits labo), politique automatique (fournisseurs, prix COO), fournisseur choisi à la main ou rendu à l'automatique, bouton « Sources automatiques », changement de fournisseur fait par le jeu, prix réglé à la main, rupture subie, action refusée, boutique de démonstration ouverte. Chaque événement : `[secondes depuis la session, jour de jeu, type, données]`.
- **Anonyme** : identifiant de session aléatoire local, date du jour seulement, aucun nom ni adresse.
- **Export JSON** : bouton « Exporter le journal (JSON) » ; API `WSE.tel` (`on`, `enable`, `log`, `events`, `counts`, `first`, `export`, `download`, `clear`, `flush`, `size`).
- **Sans effet sur la partie** : lecture seule de l'état, jamais le générateur aléatoire ; t76 vérifie qu'une partie de 360 jours avec bot est identique au jour près (valeur, trésorerie, grille, rivaux) avec et sans télémétrie.

## 6. Résultats de simulation (mesuré)

Protocole : `NODE_PATH=$(npm root -g) node tools/sim_batch.js icp.jsonl --icp --seeds 3 --days 1800 --workers 1 --castes industriel` (+ `--icp-list optimauto` pour le 3ᵉ témoin), puis `python3 tools/analyze_icp.py icp.jsonl,icp2.jsonl resume.json` et `python3 tools/make_report_monetisation.py resume.json`. 27 parties, graines 7101-7103, Round Normal, caste industrielle, télémétrie locale active (c'est elle qui fournit les jalons, les ruptures et l'usage manuel/automatique). Médianes de 3 graines. 1 jour de jeu ≈ 0,75 s réelle en Round à vitesse normale (1 800 jours ≈ 22 minutes).

### 6.1 Comportements simulés (tools/bot_lib.js, `P.pers` ; tools/sim_batch.js, `--icp`)

| Persona | Règles du bot |
|---|---|
| Presse-boutons (Damien) | agit tous les 2 jours, levier 55 %, délègue (fournisseurs auto, prix au COO, Sources automatiques), accélère la R&D en Diamants, améliore un bâtiment tous les 20 j ; ennui après 30 j sans victoire visible |
| Presse-boutons sans achat (témoin) | le même, sans délégation ni accélération |
| Optimiseur (Rémy) | tous les 3 jours, levier 45 %, revoit à la main les fournisseurs de chaque usine et magasin tous les 2 jours (rupture traitée dès le 1er jour), politique automatique coupée |
| Optimiseur + COO prix et fournisseurs (témoin) | même tempo, fournisseurs automatiques et prix confiés au COO (politique Normale) |
| Optimiseur + fournisseurs auto seuls (témoin) | même tempo, fournisseurs automatiques, prix par défaut |
| Étudiant en gestion | tous les 6 jours, levier 30 %, revue manuelle tous les 15 jours |
| Streamer compétitif | tous les 2 jours, levier 65 %, tout en automatique, accélère, ennui après 20 j |
| Casual mobile | tous les 12 jours, une action sur deux perdue, délègue, accélère |
| Enseignant de gestion | tous les 8 jours, levier 25 %, revue manuelle tous les 10 jours |

### 6.2 Temps pour atteindre chaque jalon (jour de jeu, médiane ; « (3/3) » = atteint dans 3 parties sur 3)

| Persona | Valeur finale | ×départ | Rang | 1re usine | ×2 | ×3 | ×5 | ×10 | Entrepreneur | Industriel |
|---|---|---|---|---|---|---|---|---|---|---|
| Presse-boutons (Damien) | 254 M$ | ×25,4 | 1,0 | j3 | j114 | j360 | j581 | j778 (3/3) | j258 | j623 (3/3) |
| Presse-boutons sans achat (témoin) | 252 M$ | ×25,2 | 1,0 | j3 | j133 | j354 | j581 | j877 (3/3) | j264 | j681 (3/3) |
| Optimiseur (Rémy) | 230 M$ | ×23,0 | 1,0 | j4 | j61 | j251 | j463 | j808 (3/3) | j137 | j645 (3/3) |
| Optimiseur + COO prix et fournisseurs (témoin) | 296 M$ | ×29,6 | 1,0 | j4 | j61 | j208 | j397 | j659 (3/3) | j126 | j540 (3/3) |
| Optimiseur + fournisseurs auto seuls (témoin) | 216 M$ | ×21,6 | 1,0 | j4 | j61 | j251 | j463 | j807 (3/3) | j137 | j645 (3/3) |
| Étudiant en gestion | 204 M$ | ×20,4 | 1,0 | j7 | j181 | j374 | j644 | j956 (3/3) | j270 | j758 (3/3) |
| Streamer compétitif | 249 M$ | ×24,9 | 1,0 | j3 | j24 | j202 | j331 | j699 (3/3) | j103 | j424 (3/3) |
| Casual mobile | 283 M$ | ×28,3 | 1,0 | j13 | j199 | j534 | j752 | j957 (3/3) | j440 | j820 (3/3) |
| Enseignant de gestion | 251 M$ | ×25,1 | 1,0 | j9 | j173 | j338 | j602 | j974 (3/3) | j240 | j727 (3/3) |

Tous les personas finissent 1ers sur 6 : les rivaux IA du Round Normal ne menacent pas ces bots, le rang ne discrimine pas. Le Streamer passe ×2 au jour 24 ; le Casual mobile, qui agit peu, finit à 283 M$ : le jeu récompense la patience autant que l'activité.

### 6.3 Points de blocage

| Persona | Attente de trésorerie (j) | Plus long creux sans action (j) | Plus long creux sans jalon (j) | Épisodes d'ennui | Abandon simulé | Ruptures (débuts) | Jours×bâtiments en rupture | Refus |
|---|---|---|---|---|---|---|---|---|
| Presse-boutons (Damien) | 372 | 18 | 747 | 0 | 0/3 | 8 | 1500 | 0 |
| Presse-boutons sans achat (témoin) | 585 | 18 | 846 | 0 | 0/3 | 19 | 3278 | 0 |
| Optimiseur (Rémy) | 262 | 27 | 1028 | 0 | 0/3 | 10 | 1113 | 0 |
| Optimiseur + COO prix et fournisseurs (témoin) | 216 | 27 | 797 | 0 | 0/3 | 9 | 1214 | 0 |
| Optimiseur + fournisseurs auto seuls (témoin) | 268 | 27 | 1029 | 0 | 0/3 | 10 | 1247 | 0 |
| Étudiant en gestion | 166 | 54 | 880 | 0 | 0/3 | 6 | 734 | 0 |
| Streamer compétitif | 314 | 36 | 963 | 36 | 0/3 | 12 | 1237 | 0 |
| Casual mobile | 44 | 228 | 649 | 0 | 0/3 | 13 | 967 | 0 |
| Enseignant de gestion | 124 | 120 | 856 | 1 | 0/3 | 7 | 397 | 0 |

Épargne bloquante : jours où le bot met de côté pour une chaîne et ne construit rien d'autre. Creux sans action : jours consécutifs sans nouveau bâtiment ni chantier. Creux sans jalon : plus long intervalle entre deux jalons (×valeur, palier), 650 à 1 030 jours, soit 8 à 13 minutes réelles, surtout après ×10 (le jalon suivant, ×30, est trop loin). Aucun abandon simulé ; le Streamer dépasse son seuil d'ennui ≈ 110 jours par partie.

### 6.4 Manuel ou automatique, et proxy d'« envie de payer »

| Persona | Décisions auto (jeu/COO) | Décisions manuelles | Part auto | Revues manuelles | Chantiers | Accélérations (j gagnés) | Envie d'accélérer non satisfaite | Proxy R&D >10 % | Proxy chantiers >10 % / >25 % (hyp.) |
|---|---|---|---|---|---|---|---|---|---|
| Presse-boutons (Damien) | 45 | 0 | 100 % | 0 | 89 | 5 (15 j) | 0 | 2/3 | 109/265 · 61 |
| Presse-boutons sans achat (témoin) | 0 | 0 | — % | 0 | 90 | 0 (0 j) | 0 | 2/3 | 117/267 · 69 |
| Optimiseur (Rémy) | 0 | 121 | 0 % | 34158 | 61 | 0 (0 j) | 0 | 2/3 | 60/182 · 30 |
| Optimiseur + COO prix et fournisseurs (témoin) | 58 | 0 | 100 % | 0 | 61 | 0 (0 j) | 0 | 3/3 | 79/182 · 40 |
| Optimiseur + fournisseurs auto seuls (témoin) | 60 | 0 | 100 % | 0 | 60 | 0 (0 j) | 0 | 2/3 | 59/180 · 30 |
| Étudiant en gestion | 0 | 39 | 0 % | 6698 | 30 | 0 (0 j) | 0 | 1/3 | 26/90 · 15 |
| Streamer compétitif | 86 | 0 | 100 % | 0 | 59 | 5 (15 j) | 0 | 3/3 | 62/175 · 31 |
| Casual mobile | 77 | 0 | 100 % | 0 | 0 | 2 (6 j) | 0 | 3/3 | 0/0 · 0 |
| Enseignant de gestion | 0 | 17 | 0 % | 5553 | 5 | 0 (0 j) | 0 | 1/3 | 3/15 · 3 |

Décisions auto = changements de fournisseur faits par le jeu (politique automatique) + passages en « Sources automatiques ». Proxy R&D : recherches où l'accélération maximale autorisée (½ de la durée) aurait réduit de plus de 10 % le temps jusqu'au jalon suivant (une seule recherche par partie pour cette caste). Proxy chantiers : même calcul sur chaque amélioration de niveau, avec les durées **supposées** 5/10/20/40 jours (aujourd'hui instantané). Aucune envie d'accélérer n'est restée insatisfaite : les Diamants gagnés en jouant (100 au départ, +10 par palier, +5 par jalon) ont toujours suffi.

### 6.5 A/B délégation (mêmes graines, même tempo)

- Presse-boutons : délégation + accélération vs rien : jalons atteints >10 % plus tôt 5/23 (>25 % : 0), >10 % plus tard 2/23, écart de valeur finale médian 5,2 %
- Optimiseur : COO (fournisseurs + prix) vs revue manuelle : jalons atteints >10 % plus tôt 12/21 (>25 % : 0), >10 % plus tard 0/21, écart de valeur finale médian 29,4 %
- Optimiseur : fournisseurs auto seuls vs revue manuelle : jalons atteints >10 % plus tôt 0/21 (>25 % : 0), >10 % plus tard 0/21, écart de valeur finale médian -4,6 %

**À retenir.**
1. **Fournisseurs automatiques ≈ revue manuelle** (aucun jalon plus tôt, valeur −4,6 %) : le COO « supply chain » fait gagner du temps de joueur (121 décisions et ≈ 34 000 vérifications évitées par partie), pas du résultat. La règle « COO ≤ manuel » tient : c'est le produit payant voulu.
2. **Prix confiés au COO : +29 %** face à un joueur qui laisse les prix par défaut. Vendu tel quel, ce serait du pay-to-win. Avant de le rendre payant : afficher gratuitement le prix conseillé et la note visée dans la fiche produit, puis vérifier par les bots qu'un Optimiseur qui suit ce conseil à la main fait aussi bien ; en Round classé, ne pas le vendre.
3. **Pour le Presse-boutons, la délégation réduit surtout la frustration** : jours×bâtiments en rupture divisés par 2,2 (3 278 → 1 500), valeur +5 %.
4. **Le vrai blocage est l'argent, pas le temps** (21 à 32 % des jours du Presse-boutons en épargne bloquante). Vendre de l'argent serait du pay-to-win ; il n'existe donc pas aujourd'hui de produit « temps » crédible. Des chantiers à durée en créeraient un (41 % des améliorations du Presse-boutons au-delà du seuil de 10 %, avec les durées supposées), au prix d'attentes nouvelles à tester d'abord avec les bots (aucun creux sans action > 3 min).
5. **Gamification gratuite d'abord** : des jalons intermédiaires (×15, ×20, objectifs courts, contrats) combleraient les 8 à 13 minutes sans jalon.

## 7. Métriques à suivre (définitions ; aucune n'est mesurée aujourd'hui)

| Métrique | Définition | Source en bêta | Cible (hypothèse) |
|---|---|---|---|
| Rétention J1 / J7 / J30 | part des joueurs revenus 1, 7, 30 jours après la première session | `sess` du journal exporté (date du jour) ; en soft launch, analytique avec consentement | J1 ≥ 35 %, J7 > 15 %, J30 ≥ 8 % (dossier investisseurs : J7 > 15 %) |
| Durée de session | secondes par session, médiane et 90ᵉ centile | `sess[].s` | A : 8-15 min ; B : 30-60 min |
| Abandon par étape | part des joueurs qui n'atteignent pas : premier achat, première usine, palier Entrepreneur, ×2, ×5 | `first` | perte < 20 % avant la première usine |
| Taux de délégation | part des décisions d'approvisionnement prises par le jeu/COO | `sc_switch + sc_autosource` contre `sc_manual` | segment A > 70 %, segment B < 40 % (hypothèse à vérifier) |
| Ruptures subies | débuts de rupture et jours×bâtiments en rupture par heure de jeu | `rupture`, `rup_days` | en baisse avec l'expérience |
| Conversion | part des joueurs qui achètent au moins une fois (aujourd'hui : intention = clic sur la boutique de démonstration) | `iap` | 2-5 % (référence du genre, non vérifiée) |
| ARPPU | revenu par joueur payant et par mois | soft launch seulement | non fixé |
| Intention d'accélérer | accélérations en Diamants, et envies non satisfaites (Diamants épuisés) | `accel` ; bots : `acc.want` | — |

## 8. Plan de test en phases

| Phase | Qui | Durée | Ce qu'on mesure | Critère pour passer à la suite |
|---|---|---|---|---|
| **0. Bots** (en cours) | 8 personas simulés, 3 graines, 1 800 jours | continu | jalons, creux, ruptures, manuel/auto, proxy d'envie de payer, A/B COO | COO ≤ manuel ; aucun creux sans action > 3 min ; envie d'accélérer présente mais jamais bloquante |
| **1. Entretiens** | Damien Gromier + 3 à 5 joueurs A, 3 à 5 joueurs B | 2 semaines | motivations, seuils de prix, ce qui choque | les leviers « temps » et « COO » sont jugés acceptables par A **et** B |
| **2. Bêta fermée** | 20 à 40 joueurs (moitié A, moitié B), télémétrie opt-in, export volontaire du JSON, questionnaire (§9.2) | 4 semaines | J1/J7, sessions, abandon par étape, délégation, ruptures, clics boutique (démonstration, rien n'est vendu) | J7 > 15 % ; < 20 % d'abandon avant la première usine ; B ne se plaint pas de pay-to-win |
| **3. Prix fictifs** | mêmes joueurs, boutique en Diamants simulés à plusieurs prix (A/B) | 2 semaines | élasticité de l'intention d'achat, achats de COO simulés | une offre COO choisie par > 20 % des joueurs A |
| **4. Soft launch** | 1 ou 2 pays, paiement réel, analytique avec consentement | 6 à 8 semaines | conversion, ARPPU, J30, plaintes | conversion ≥ 2 %, J30 ≥ 8 %, note des avis ≥ 4/5 |

## 9. Questions pour Damien Gromier et questionnaire

### 9.1 Les cinq questions à poser à Damien (ex-joueur dépensier de Supremacy)
1. **Le déclic** : quel a été le moment exact où tu as payé pour la première fois dans Supremacy, et qu'est-ce que tu as acheté (temps, ressources, statut, avantage militaire) ?
2. **Le ressenti du pay-to-win** : as-tu déjà eu l'impression d'avoir gagné grâce à l'argent plutôt qu'au talent, ou d'avoir perdu contre un payeur ? Qu'est-ce que ça t'a fait, et est-ce que tu es resté ?
3. **Le temps** : qu'est-ce qui était le plus pénible à attendre, et combien aurais-tu payé (en euros) pour ne plus l'attendre ? À partir de quel montant par mois tu t'es dit « c'est trop » ?
4. **Les autres** : quel rôle ont joué l'alliance, le chat et le classement dans ta dépense ? Aurais-tu payé autant en jouant seul ?
5. **La délégation** : si un « directeur des opérations » pouvait gérer à ta place les approvisionnements et les prix, tu l'achèterais (une fois, abonnement) ? Que doit-il ne **jamais** faire pour que tu continues à te sentir maître de ton empire ?

### 9.2 Questionnaire court (bêta, 2 minutes)
1. Combien de minutes as-tu joué aujourd'hui ? (moins de 10 / 10-30 / 30-60 / plus de 60)
2. Qu'est-ce qui t'a donné envie de continuer ? (une réponse libre)
3. À quel moment t'es-tu ennuyé ou senti bloqué ? (moment, cause)
4. Tu préfères régler toi-même tes fournisseurs et tes prix, ou les confier au COO ? (moi / COO / ça dépend)
5. As-tu eu envie d'accélérer quelque chose ? Quoi ? (non / recherche / chantier / autre)
6. Un achat dans le jeu te semblerait-il injuste face aux autres joueurs ? Lequel ? (libre)
7. Combien paierais-tu, une fois, pour le jeu complet ? (0 / 5 € / 10 € / 20 € / plus)
8. Et par mois, pour un COO et un passe de saison ? (0 / 3 € / 5 € / 10 € / plus)
9. Reviendras-tu demain ? (oui / peut-être / non) Pourquoi ?
10. Recommanderais-tu le jeu à un ami (0 à 10) ?

## 10. Risques

| Risque | Effet | Parade |
|---|---|---|
| **Pay-to-win** | le segment B part et fait de la mauvaise publicité (le reproche n° 1 fait à Supremacy) | règles §4 ; Round classé sans achat d'avantage ; test « COO ≤ manuel » |
| **Perte des optimiseurs** | si l'automatique est meilleur ou si le manuel est rendu pénible pour vendre le COO | le manuel garde toute son ergonomie ; l'interface du manuel s'améliore en même temps que le COO |
| **Dark patterns** (urgence artificielle, prix opaques en monnaie virtuelle) | défiance, avis négatifs, risque juridique | prix affiché avant confirmation, pas de compte à rebours commercial, pas de boîte à butin (déjà exclues par le dossier investisseurs) |
| **Réglementation** | protection des consommateurs et des mineurs (UE), règles des magasins d'applications, données personnelles | à faire vérifier par un juriste avant le soft launch : principes européens sur les monnaies virtuelles des jeux (prix lisible en euros), pas de boîtes à butin (interdites ou encadrées dans plusieurs pays), mention « achats intégrés » (PEGI), consentement explicite avant toute analytique (RGPD) ; la télémétrie actuelle est locale et opt-in |
| **Biais des bots** | décisions prises sur des comportements simulés | les bots servent à l'économie et aux creux ; toute décision de prix attend la bêta |

## 11. Limites de cette passe
- Une seule caste (industriel) et 3 graines par persona ; les personas ICP sont des **règles de comportement** (tempo, levier, revue manuelle, délégation, accélération), pas des humains.
- Les chantiers 1→5 sont aujourd'hui **instantanés** : l'envie d'accélérer un chantier est calculée sur des durées **supposées**. Introduire de vraies durées de chantier est une décision de gameplay à tester d'abord avec les bots (creux de progression) puis en bêta.
- Le COO actuel est gratuit : l'A/B mesure la valeur de la délégation, pas l'envie de la payer.
