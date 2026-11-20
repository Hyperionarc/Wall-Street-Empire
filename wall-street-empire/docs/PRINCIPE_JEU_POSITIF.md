# Principe de conception (Rémy, 19 nov.) : un jeu à effet exponentiel, pas à somme nulle

**Aucune caste ne doit se nuire ou s'annuler.** Les six castes sont complémentaires : la réussite de l'une augmente les possibilités des autres. Le jeu est une économie qui grossit (le gâteau grandit), pas un partage fixe.

## Boucles positives voulues (chaque flèche = un effet réel dans le code)
- **Promoteur** → plus d'habitants, de logements, d'emplois → plus de consommateurs pour tout le monde (agriculteur, industriel, négociant) ; la densité fait monter la valeur du terrain et les loyers.
- **Banquier** → crédit, tours de table, levées → capital disponible pour industriels, promoteurs, innovateurs ; son rendement dépend de leur croissance.
- **Négociant** → matières et énergie moins chères et disponibles pour tous → marges industrielles ↑ ; stocks tampons qui lissent les chocs.
- **Industriel** → produits et composants → débouchés de l'agriculteur et du négociant, biens pour les commerces de la ville.
- **Agriculteur** → alimentation de la population et intrants (blé, sucre, coton, viande) → permet à la ville de grossir et aux industriels de transformer.
- **Innovateur** → technologies, licences, data centers → hausse de qualité/productivité chez les autres (licences payantes mais rentables pour le licencié), nouveaux marchés.
- **Effet exponentiel** : la croissance de chacun relève la croissance de tous (population, pouvoir d'achat, qualité, capital), avec des rendements croissants jusqu'aux limites physiques (terre, énergie, main-d'œuvre).

## À proscrire / à corriger
- Mécaniques où une caste ne peut gagner qu'en faisant perdre une autre (prix cassés qui détruisent la marge de tous, embargos subis sans contrepartie, cartels punitifs permanents, rachats hostiles automatiques).
- Concurrence destructrice par défaut : la rivalité reste (classement, parts de marché) mais elle doit se faire en **créant de la valeur** (meilleur produit, meilleure marque, plus de capacité) plutôt qu'en détruisant celle des autres.
- IA rivales qui s'annulent entre elles ou annulent le joueur sans contrepartie.

## Critères mesurables
1. **Somme positive** : la valeur totale de toutes les entreprises (joueur + IA) croît plus vite quand toutes les castes sont actives que lorsque chacune est seule (test A/B : 6 castes ensemble vs castes isolées, même graine).
2. **Synergies visibles** : chaque caste affiche dans l'UI « ce que les autres castes t'apportent » et « ce que tu leur apportes ».
3. **Pas d'annulation** : aucune action de caste ne réduit durablement la valeur d'une autre caste de plus qu'elle ne crée pour elle-même ou pour l'ensemble.
4. **Croissance exponentielle jusqu'aux limites** : trajectoire de valeur globale convexe (rendements croissants) sur les 2 000 premiers jours.

## État (passe 68, détail dans docs/EQUILIBRE_ECONOMIE.md)
- Mécanismes : multiplicateur de prospérité (`prosp`, revenu créé par toutes les entreprises), marché élargi par l'offre des concurrents (`rivMkt`), deux bassins de
  clientèle (`attrDen` : une IA pèse peu sur ta clientèle d'origine, de plus en plus avec ton palier), services B2B au lieu de −7 % par rival, `rivSvc` ≤ 6 %, crédit des IA
  chez le banquier joueur, demande de matières liée à l'activité des entreprises, cartel du négociant devenu contrat d'approvisionnement (prix stable, volumes garantis).
- Critère 1 (A/B 1 800 jours, 3 graines) : monde à six = ×1,93 le joueur seul (×1,39 avant) ; par caste, joueur avec les 5 autres / seul : agriculteur 1,63, banquier 1,13,
  industriel 1,06, promoteur 1,02, innovateur 1,02, **négociant 0,87** (chemin de bot au départ, voir passe 68). Avant : 0,25 à 0,76 (agriculteur 1,35).
- Critère 2 : bilan « Ce que les autres castes t'apportent / ce que tu leur apportes » en tête de Menu > Concurrents (chiffres réels, relevé `S.syn`).
- Critère 4 : trajectoire du monde convexe (166, 218, 301, 396, 546, 760 M$).
- Reste à transformer : guerres des prix des IA et embargos de riposte ; équilibre des castes en partie normale (promoteur et banquier au-dessus de la bande).
