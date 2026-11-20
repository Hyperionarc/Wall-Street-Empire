# Passe 74 : paliers par chantier, COO à acheter (premium simulé), score de maîtrise de la supply chain

Décisions de Rémy appliquées : (a) les bâtiments passent du niveau 1 au niveau 5 par **chantiers** avec une barre de progression (comme WW3 / Supremacy) ;
(b) l'optimisation **automatique** de la supply chain est le produit payant (un **COO** qu'on recrute), l'optimisation **manuelle** reste gratuite, complète et jamais
bridée ; (c) l'accélération des chantiers se paie en **Diamants** (monnaie simulée, jamais obligatoire) ; (d) pas de pay-to-win dans le classement du Round.

**Aucun paiement réel n'est branché.** « Premium » est un droit simulé (`S.ent.prem`), activé par un bouton de démonstration « Activer Premium (simulé) »
(Menu > Partie, et carte du COO). Les Diamants sont une monnaie simulée : bouton « +100 Diamants (simulé) », 300 Diamants offerts à la première activation,
et des Diamants **gratuits** gagnés par les badges de maîtrise.

Code : `game.template.html`, bloc « Passe 74 » (juste après `upgradeSpent`), fonctions `pal*` (paliers), `ent*` (droits simulés), `coo*` (COO), `scm*` (maîtrise).
Exports : `window.WSE.pal`, `WSE.ent`, `WSE.coo`, `WSE.scm`, `WSE.levelMult`. Tests : `tools/tests/t74_paliers.js` (28 contrôles), `tools/tests/t75_coo.js` (19 contrôles).
Aucun appel à `rnd()` : la suite aléatoire d'une partie est inchangée (t05 déterminisme vert).

## 1. Paliers 1 → 5 par chantier

### Système générique
`PAL_DEF[type] = { cost[4], mult[5], days[4], tier[4], popK }`, construit par `palDefault(...)`. Un type présent dans `PAL_DEF` s'améliore par chantier ; les autres
types gardent l'agrandissement immédiat d'avant (`LVL_MULT` / `LVL_COST`). Pour étendre aux usines, fermes, R&D ou data centers : ajouter une entrée (coûts, capacités,
durées, palier d'entreprise et population exigés) ; `levelMult`, `upgradeCost`, `upgradeSpent`, la fiche, la jauge sur la carte, la sauvegarde et la migration suivent seuls.
Cette passe l'applique aux magasins `s1` à `s4` et aux 8 magasins spécialisés.

- `place(x, y, 'up')` (outil Améliorer ou bouton de la fiche) lance un chantier `c.pal = { to, t0, dur, acc, cost }` au lieu d'agrandir tout de suite.
- **Le magasin continue de vendre pendant le chantier** (capacité de l'ancien niveau) ; le niveau, la capacité et les emplois montent à la fin.
- **Un chantier par bâtiment ; chantiers simultanés = 1 + palier d'entreprise** : 1 (Citoyen), 2 (Entrepreneur), 3 (Industriel), 4 (Magnat), 5 (Oligarque).
- **Prérequis par palier** : palier d'entreprise (valorisation), population de la ville, trésorerie. Un refus explique la raison (fiche et message).
- **Entretien du palier** : 2 % par an du coût payé (`palUpk`, dans l'entretien du magasin, donc dans l'EBE).
- **Accélération** : bouton « Accélérer · n Diamants » ; coût = 3 Diamants par jour restant (proportionnel au temps restant). En **Round**, un chantier ne peut
  pas être raccourci de plus de la moitié de sa durée (`PAL_ROUND_ACC`) : le premium accélère sans gagner le classement.

### Barème (prix de l'année de départ, × inflation)

| Type | Niveau 1 (construction) | 1→2 | 2→3 | 3→4 | 4→5 | Capacité N1…N5 | Durées (jours) | Palier d'entreprise | Population pour N3 / N4 / N5 |
|---|---|---|---|---|---|---|---|---|---|
| `s1` Petit marché | 0,11 M$ | 0,3 M$ | 0,8 M$ | 2 M$ | 4 M$ | ×1 ; 2,4 ; 5 ; 10 ; 18 | 4, 10, 21, 35 | Citoyen, Entrepreneur, Industriel, Magnat | 40 k / 75 k / 150 k |
| `s2` Supermarché | 0,7 M$ (≈ 1 M$ avec le terrain) | **3 M$** | **8 M$** | **20 M$** | **40 M$** | ×1 ; 3 ; 7 ; 15 ; 28 | 4, 10, 21, 35 | Entrepreneur, Entrepreneur, Industriel, Magnat | 80 k / 150 k / 300 k |
| `s3` Hypermarché | 4,4 M$ (+ terrain) | **20 M$** | **40 M$** | **70 M$** | **100 M$** | ×1 ; 2,75 ; 5,2 ; 8,3 ; 12 | 5, 13, 26, 44 | Industriel, Industriel, Magnat, Magnat | 120 k / 225 k / 450 k |
| `s4` Méga-centre | 17,6 M$ | 40 M$ | 80 M$ | 140 M$ | 200 M$ | ×1 ; 1,7 ; 2,8 ; 4,4 ; 6,1 | 5, 13, 26, 44 | Magnat, Magnat, Oligarque, Oligarque | 160 k / 300 k / 600 k |
| 8 spécialisés | 0,52 à 2,6 M$ | 1,5 × | 3 × | 5 × | 7,5 × le prix de construction (Numérique : 16, 25, 35, 45 M$ ; pharmacie : 1 ; 3,4 ; 7,5 ; 9,5 M$) | ×1 ; 2 ; 3,2 ; 4,6 ; 6,2 | 4, 10, 21, 35 | Citoyen, Entrepreneur, Industriel, Magnat | 120 k / 225 k / 450 k (concession : 120 k dès le niveau 2) |

Écart assumé avec la consigne « hypermarché 10 → 100 M$ » : le niveau 1 reste le prix de construction actuel (4,4 M$ + terrain), sinon tout l'équilibrage
(t02, t65) et les anciennes parties bougeaient. Les paliers 2 à 5 suivent exactement la consigne (20, 40, 70, 100 M$ ; supermarché 3, 8, 20, 40 M$).

### Rentabilité mesurée par niveau
Banc du test t02 (ville de test, 8 logements, macro figée), demande multipliée par population exigée / population du banc (≈ 65 000 habitants), 40 à 60 jours mesurés.
Retour = investissement cumulé (construction + paliers) / EBITDA annuel.

| Type | N1 | N2 | N3 | N4 | N5 |
|---|---|---|---|---|---|
| Supermarché : EBITDA / retour | 30,6 % / 1,1 an | 31,0 % / 1,9 an | 30,1 % / 2,6 ans | 29,9 % / 3,3 ans | 29,1 % / 4,2 ans |
| Hypermarché : EBITDA / retour | 45,7 % / 0,8 an | 45,5 % / 1,6 an | 44,6 % / 2,3 ans | 42,7 % / 3,2 ans | 42,3 % / 3,9 ans |
| Méga-centre : retour | 0,8 an | 2,3 ans | 2,5 ans | 3,4 ans | 4,2 ans |
| Petit marché : retour | 1,1 an | 1,7 an | 2,4 ans | 3,4 ans | 4,4 ans |
| Pharmacie : retour | 0,8 an | 1,6 an | 2,2 ans | 2,7 ans | 3,6 ans |
| Maison du Numérique : retour | 0,4 an | 1,6 an | 2,5 ans | 3,4 ans | 4,0 ans |
| Boutique de mode : retour | 1,6 an | 2,1 ans | 3,0 ans | 4,1 ans | 5,4 ans |
| Maison et déco : retour | 1,7 an | 2,2 ans | 3,2 ans | 4,3 ans | 5,7 ans |
| Concession auto : retour | 3,4 ans | 2,4 ans | 5,6 ans | 3,7 ans | 4,8 ans |

Chaque palier reste rentable (EBITDA ≥ 16 %), avec des rendements décroissants (retour ≥ 1,5 an et croissant de palier en palier) : un palier n'est jamais une
planche à billets. Limites honnêtes :
- **La cible « EBITDA 16-21 % à chaque niveau » n'est pas tenue au sens strict** : sur ce banc sans concurrent proche, le niveau 1 fait déjà 30 % (supermarché) et
  45 % (hypermarché), calibrage de la passe 46 (« plus de plafond de marge ») qu'il ne m'appartenait pas de défaire. Les paliers gardent la marge du niveau 1
  (−1 à −3 points d'entretien) ; en Round, la concurrence la ramène plus bas.
- **Magasins spécialisés** : leur demande est celle d'une seule famille, d'où un barème plus prudent (capacité ×6,2 au niveau 5) et une ville plus grande exigée.
  Deux d'entre eux rapportaient trop par dollar investi (Numérique : retour 0,4 an au niveau 1, pharmacie 0,8 an) : leurs paliers sont plus chers. Le premier barème
  (2, 5, 11, 20 × le prix de construction, capacité ×5,5) donnait 10 à 20 ans de retour aux niveaux 4-5 pour la mode et la maison, et un EBITDA négatif au niveau 4
  de la mode avec l'ancienne capacité ×13 : corrigé. Reste irrégulière : la concession auto (niveau 3 à 5,6 ans) ; la demande de voitures est à revoir à part.

### Affichage
- **Fiche du bâtiment** (onglet Intérieur) : carte « Niveau n/5 » (pastilles), capacité et emplois, coût, durée et prérequis du palier suivant, bouton « Améliorer → niveau n »,
  puis pendant le chantier une barre, le pourcentage, les jours restants, « le magasin continue de vendre » et « Accélérer · n Diamants ».
- **Intérieur** : barre du chantier en haut de la scène, légende « Niveau n/5 … chantier vers le niveau n : x % (j) ». La scène suit le niveau : une caisse de plus aux
  niveaux 3 et 5, plus de clients (+30 % par niveau) et un débit plus élevé, rayons plus serrés aux niveaux 4 et 5 (l'intérieur riche reste un autre chantier).
- **Carte** : jauge orange au-dessus du bâtiment et emprise en pointillés pendant le chantier (sans texte) ; le magasin s'élève de 12 % par niveau et garde ses étoiles.
- **Liste** : Menu > Empire, « Magasins : niveaux et chantiers » (Niveau n/5, barre de chaque chantier, nombre de chantiers possibles).

### Sauvegarde et migration
Champs facultatifs dans l'extra de la cellule : `pa` (chantier : niveau visé, début, durée, jours accélérés, coût) et `ps` (total payé pour les paliers) ;
au niveau de la partie : `ent` (droits simulés, Diamants, COO) et `scm` (historique de maîtrise). Une ancienne sauvegarde (sans `ent.pv`) est migrée : un magasin
agrandi à l'ancienne garde le niveau que son coût historique paie au nouveau barème, sinon il revient au **niveau 1 au coût historique** (son `invest` est conservé).
Exemple testé : supermarché agrandi deux fois pour 1,1 M$ → niveau 1 ; petit marché qui avait payé 1,15 M$ → niveau 3 (0,3 + 0,8 M$).

## 2. COO à acheter (premium simulé)

Menu > Chaîne, carte « Directeur des opérations (COO) ». Sans droit premium simulé, le recrutement est refusé ; le pilotage manuel et les automatismes de base
(« Tout lancer automatiquement », import automatique, politique « Chercher de meilleurs fournisseurs ») restent exactement comme avant.

| Niveau | Rôle | Revue | Seuil de changement | Rémunération |
|---|---|---|---|---|
| Bronze | aide au pilotage : répare ce qui est cassé (rupture, source qui ne peut pas livrer), **propose** le reste (bouton « Appliquer les conseils ») | 10 jours | 10 % | 2 k$/mois + 0,4 % des achats pilotés |
| Argent | pilote les achats : fournisseurs au coût livré corrigé de la qualité, mix propre production / port / négociant, stocks tampons (5 jours), ruptures | 5 jours, ruptures tous les 2 jours | 6 % | 4 k$/mois + 1 % |
| Or | pilotage complet et continu : Argent + équilibrage des chaînes (une usine libre prend un composant acheté faute de production), surplus (journal), prix confiés au directeur des prix existant (option) | 2 jours, ruptures chaque jour | 3 % | 6 k$/mois + 1,5 % |

- **Mêmes leviers que le joueur** : le COO ne change que `c.src` (sources), l'affectation d'une usine libre et la politique « Prix des produits » du directeur des prix.
  Il évalue chaque source avec la règle du jeu (`offerScore` : coût livré pondéré par le fret, corrigé de la qualité, capacité des fournisseurs) ; aucun bonus caché.
- **Jamais meilleur qu'un expert** : il ne revoit ses choix que tous les 2 à 10 jours, ne change que si le gain dépasse son seuil, et il coûte une rémunération qui suit la
  taille de la chaîne (comme un service d'achats externalisé).
- **Ce qu'il affiche** : journal des décisions (raison, économie estimée), économies estimées cumulées et rythme mensuel (décisions des 90 derniers jours), rémunération
  versée, score supply chain (même mesure que pour un joueur manuel).

### Mesure : chaîne mal réglée, COO contre expert manuel (t75, 120 jours, même graine)
Chaîne ferme de blé → moulin → boulangerie → petit marché + supermarché + port. Dérèglage de débutant : blé et farine rachetés au port alors qu'on les produit, produits
courants du supermarché en « Mon réseau » sans stock. Le bot « expert manuel » applique **chaque jour, sans seuil**, la meilleure source que le joueur voit dans la vue
fournisseurs (gratuit). Résultat net de la chaîne (EBE cumulé − rémunération du COO) :

| Pilotage | Net (120 j) | % de l'expert | Brut avant rémunération |
|---|---|---|---|
| Chaîne mal réglée, sans COO | 0,26 M$ | 21 % | 0,26 M$ |
| COO Bronze (conseils non appliqués) | 0,47 M$ | 37 % | 0,50 M$ |
| COO Argent | 1,20 M$ | 93,9 % | 1,24 M$ |
| COO Or | 1,19 M$ | **93,3 %** | 1,26 M$ (98,6 %) |
| Expert manuel | 1,27 M$ | 100 % | 1,27 M$ |

Le COO récupère 92 % du gain de l'expert et reste à ≈ 93 % de son résultat (cible 90-95 %). Sans COO, aucune source ne change (manuel intact).
Dans ce scénario statique Or et Argent font les mêmes choix (l'avance d'Or apparaît quand les cours bougent, quand un fournisseur sature ou quand une usine libre
peut équilibrer la chaîne) ; Or coûte plus cher.
