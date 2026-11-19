# Capitalism Lab : chaîne d'approvisionnement, fixation des prix et demande

*Spécification algorithmique reconstruite à partir de sources publiques, écart avec Wall Street Empire (WSE) et écarts corrigés. Document du 19/11/2026. Les fonctions citées renvoient à `wall-street-empire/game.template.html` ; les numéros de ligne changent souvent, **le nom de fonction fait foi**.*

---

## 0. Méthode et limites

**Sources.** Je n'ai utilisé que des documents publics : les manuels officiels de Capitalism II et de Capitalism Plus (PDF distribués par l'éditeur et par Steam), le site officiel de Capitalism Lab (guide du débutant, pages de fonctions, documentation de modding), le forum officiel capitalism2.com, un guide Steam et un guide de stratégie publié en ligne. La liste complète, avec les URL, est au §9.

**Ce que je n'ai pas fait.** Je n'ai rien décompilé, ouvert aucun fichier du jeu et lu aucun code. Je ne reproduis aucun texte protégé : chaque règle est reformulée avec mes propres notations. Une formule ou une table de chiffres publiée dans un manuel est un fait. Je la cite avec sa source, dans ma notation.

**Le jeu est en partie opaque, même pour ses joueurs.** Le manuel donne la formule de la note globale, la table des niveaux d'unité, la politique de prix du COO, le diagnostic des goulots et le calcul de la qualité. En revanche, **la fonction qui partage la demande entre vendeurs n'est publiée nulle part**. Les joueurs expérimentés du forum le disent eux-mêmes : on ne connaît pas la formule exacte des parts de marché. Pour ces règles, je donne le comportement observé (niveau B ou C) et une proposition d'algorithme (niveau D), présentée comme telle.

**Niveaux de confiance utilisés pour chaque règle**

| Niveau | Signification |
|---|---|
| **A** | Écrit dans un manuel officiel ou sur le site officiel (formule, table ou règle explicite) |
| **B** | Observé par plusieurs joueurs expérimentés ou par un modérateur, et cohérent avec le niveau A |
| **C** | Rapporté par un seul joueur, ou déduit d'un exemple chiffré |
| **D** | Non publié : ma reconstruction. Plausible, mais à traiter comme une hypothèse de conception |

---

## 1. Vue d'ensemble : la boucle quotidienne de Capitalism Lab

Chaque entreprise (ferme, mine, usine, magasin, entrepôt) est une grille d'unités reliées : achat, fabrication, stock, vente, publicité. Chaque unité possède **son propre stock**, **une capacité** et **un niveau**. Les marchandises circulent d'unité en unité, puis d'entreprise en entreprise, en suivant des liens fournisseur → acheteur choisis par le joueur ou par son COO (A, manuel de Capitalism II, chap. 4).

Ordre de calcul reconstruit pour une journée (ordre exact : **D** ; chaque étape : niveau indiqué) :

```
pour chaque ville :
  1. DEMANDE de chaque produit = habitants × achats annuels par habitant / 365
       × effet du pouvoir d'achat (fort si le produit est peu nécessaire)        [A pour les facteurs, D pour la forme]
       × obsolescence et remplacement par un produit plus récent                 [A]
  2. NOTE GLOBALE de chaque offre (magasin × produit) : qualité, marque, prix
       pondérés par les « concerns » du produit dans cette ville                 [A, formule publiée]
  3. PARTAGE de la demande entre les offres : la meilleure note gagne le plus,
       sans tout prendre ; un segment sensible au prix achète le moins cher ;
       chaque magasin est pondéré par la fréquentation de son emplacement
       et par le bonus de demande de détail                                       [B pour le comportement, D pour la fonction]
  4. VENTE de chaque magasin = min(sa part de demande, capacité de ses unités de vente
       selon leur niveau, son stock)                                              [A]
pour chaque lien fournisseur → acheteur :
  5. ACHAT = min(ce que l'unité d'achat peut recevoir : capacité et place en stock,
       ce que le fournisseur peut livrer) ; un fournisseur à court rationne ses acheteurs [A pour les barres offre/demande, D pour la règle de rationnement]
  6. FABRICATION quand l'unité dispose de la recette complète, tant qu'il reste de la place en sortie [A]
  7. PRIX : chaque vendeur garde le sien ; le joueur le règle, son COO l'ajuste chaque jour
       selon sa politique, les IA et les concurrents locaux suivent leurs règles  [A pour le COO, B et C pour les IA]
```

Trois quantités locales et visibles par unité : **ce que je peux faire** (capacité × niveau), **ce qu'on me demande** (barre de demande) et **ce que j'ai** (stock). Le diagnostic se fait unité par unité (A, §3.3).

---

## 2. La demande des consommateurs

### 2.1 Volume total d'un produit dans une ville

| # | Règle | Conf. |
|---|---|---|
| D1 | Chaque produit a un paramètre « demande » : nombre moyen d'unités qu'un consommateur achète par an (de 0,001 à 999). Exemples publiés par un modérateur : une moto tous les 100 ans (0,01/an), une voiture tous les 71 ans (0,014/an) | A (modding) + B |
| D2 | La population de la ville détermine directement la demande totale | A |
| D3 | Indice de nécessité de 0 à 100 (paramètre de 0 à 10, multiplié par 10) : un produit très nécessaire garde une demande stable même à un prix peu attrayant ; un produit peu nécessaire dépend surtout de son attrait. Baisser le prix d'un produit peu nécessaire peut augmenter le profit, parce que le volume compense | A |
| D4 | En économie urbaine complexe, le **niveau de dépense** de la ville agit sur la demande de tous les produits, d'autant plus que le produit est peu nécessaire (dentifrice peu touché, voiture très touchée). Le climat économique suit les créations et les fermetures d'entreprises : beaucoup de fermetures peuvent faire basculer la ville en récession | A |
| D5 | Les biens peu nécessaires (ordinateurs, voitures) se vendent surtout dans les villes à hauts salaires ; les biens nécessaires partout | A (guide du débutant) |
| D6 | Obsolescence : un pourcentage de baisse annuelle de la demande (cigarettes : 2 %/an) ; un produit plus récent capte progressivement la demande d'un ancien (vitesse réglable), l'ancien en garde une part (exemple : 40 %). Au-delà de 90 % de demande transférée, le produit est déclaré obsolète. Voiture thermique vers électrique : jusqu'à 50 % de transfert | A |
| D7 | Une fois le marché « saturé », la demande totale d'une ville paraît fixe : ouvrir plus de magasins déplace surtout des ventes entre concurrents. Une note globale plus haute change peu le chiffre d'affaires total du marché ; l'état de l'économie compte bien plus | B (plusieurs joueurs) |
| D8 | Seuls les **magasins spécialisés** créent de la demande en plus (effet de chaîne) ; un magasin général, un discounter ou un grand magasin n'en crée pas, il la partage | B |
| D9 | Taxe à la consommation (DLC villes) : chaque achat paie prix × taux ; un taux élevé réduit la dépense | A |

**Pseudo-code (forme : D)**

```
D_jour(p, ville) = pop(ville) × DEMANDE(p) / 365
                 × dépense(ville) ^ (1 − nécessité(p)/100)      // D3-D4 : élasticité-revenu décroissante avec la nécessité
                 × (1 − OBSO(p))^(années)                       // D6
                 × part restante après remplacement(p)           // D6
                 × (1 + bonus_spécialistes(p, ville))            // D8
```

Exemple chiffré : 500 000 habitants, une voiture tous les 71 ans → 500 000 × 0,014 / 365 ≈ **19 voitures par jour** avant les effets de dépense.

### 2.2 La note globale d'une offre (formule publiée)

Le manuel de Capitalism II, repris tel quel dans celui de Capitalism Plus, publie la formule suivante. Je la reformule avec mes notations :

```
Note = Q × cQ / 60  +  M × cM / 60  +  cP × (Pstd − P) / Pstd
  Q   : note de qualité (0 à 100)
  M   : note de marque = notoriété (0-100) + fidélité (0-100), donc de 0 à 200
  cQ, cM, cP : « concerns » qualité, marque, prix du produit, en % (somme = 100)
  Pstd : prix standard du produit (interne, jamais affiché)
  P    : prix de vente pratiqué
```

| # | Règle | Conf. |
|---|---|---|
| N1 | La formule ci-dessus. Le terme de prix est **linéaire** : vendre au prix standard rapporte 0 point, à moitié prix +cP/2, au double −cP. La note n'est pas bornée (des joueurs citent des notes de 104 et de 140) | A (formule), B (bornes) |
| N2 | Les concerns varient légèrement d'une ville à l'autre (cultures différentes) | A |
| N3 | Exemples publiés de pondération (prix / qualité / marque) : cigarettes 25 / 15 / 60 ; viande surgelée 40 / 40 / 20 ; un lit à peu près en tiers égaux ; boisson gazeuse et chaussures de sport : marque dominante ; un bien semi-fini (composant, matière) n'a pas de marque, prix et qualité à 50 / 50 | A (exemples) ; C (50/50 pour les semi-finis) |
| N4 | Le prix standard suit les salaires de la ville et l'inflation ; une « prime de R&D » s'y ajoute en monnaie courante, sans inflation (smartphone : 600 + 200 = 800) | A |
| N5 | Le prix de vente a un plafond ; le jeu refuse au-delà | A |

Exemple chiffré : cQ = 30, cM = 30, cP = 40 ; Q = 70 ; M = 60 (notoriété 40, fidélité 20).
À 0,9 × Pstd : 70 × 30/60 + 60 × 30/60 + 40 × 0,1 = 35 + 30 + 4 = **69**. À 1,3 × Pstd : 35 + 30 − 12 = **53**.

### 2.3 Qualité d'un produit fabriqué (formule publiée)

```
Q(produit) = wT × (tech_usine / tech_pointe) × 100 / 100  +  wM × Q(intrants livrés) / 100
             avec wT + wM = 100 (poids propres au produit, lus dans le guide du fabricant)
```

| # | Règle | Conf. |
|---|---|---|
| Q1 | Exemple publié (textile, 50 % technologie, 50 % matière) : coton de qualité 71, technologie de l'usine 30, pointe mondiale 100 → 50 × 30/100 + 71 × 50 % = 15 + 35,5 ≈ **50** | A |
| Q2 | La pointe technologique commence à 100 et monte quand un produit plus avancé entre sur le marché : les produits existants deviennent relativement moins bons | A |
| Q3 | Installer une technologie plus récente fait perdre un niveau à l'unité de fabrication (les ouvriers réapprennent) | A |
| Q4 | La qualité des cultures et de l'élevage monte avec l'expérience de la ferme (niveau d'unité) ; celle des matières dépend du gisement | A |
| Q5 | La qualité des intrants **achetés** passe directement dans la qualité du produit : choisir un fournisseur, c'est choisir une qualité | A (Q1) + B |
| Q6 | Le prix d'un intrant croît avec sa qualité ; l'ordre de grandeur rapporté est prix ≈ prix de base × (qualité / 50) × niveau de salaire de la ville d'origine, plus le fret | C (un joueur expérimenté) |

### 2.4 Marque

| # | Règle | Conf. |
|---|---|---|
| M1 | Note de marque = notoriété + fidélité. Chacune combine la part de la population concernée et l'intensité moyenne | A |
| M2 | La notoriété monte avec la publicité, l'ancienneté de vente, la largeur de la distribution et la taille de la clientèle | A |
| M3 | La fidélité suppose un achat préalable : plus de notoriété fait plus d'essais, donc une fidélité qui monte plus vite. Une qualité satisfaisante et **régulière** la fait monter ; une mauvaise expérience la fait baisser, parfois sous zéro | A |
| M4 | Une marque qui couvre beaucoup de produits inspire moins de fidélité (stratégies marque d'entreprise, de gamme ou unique ; changer de stratégie remet les marques à zéro) | A |
| M5 | Faire de la publicité pour un produit de mauvaise qualité gaspille de l'argent : forte demande au début, puis érosion. Les quatre cas publiés (qualité basse ou haute × publicité faible ou forte) donnent la trajectoire de la demande | A |
| M6 | Repères de joueur : environ 100 000 $ par mois dans un média noté 33 rapportent environ 4 points de marque par mois ; sans publicité, la marque monte d'environ 1 point tous les 7 à 8 mois grâce aux ventes | C |

### 2.5 Partage de la demande entre vendeurs

| # | Règle | Conf. |
|---|---|---|
| P1 | La plupart des acheteurs préfèrent la meilleure note, mais **pas tous** : un segment sensible au prix achète le moins cher même moins bien noté, et un segment attaché à la qualité achète le meilleur produit même mal noté. On peut gagner en leader des coûts ou de la qualité | A |
| P2 | Un produit noté 20 à 30 points sous le concurrent garde une part réelle s'il est nettement moins cher ; deux notes égales ne donnent pas deux parts égales ; les parts convergent lentement vers un équilibre | B |
| P3 | Les **concurrents locaux** existent dans chaque ville sans apparaître sur la carte ; ils vendent une « marque blanche » (part blanche des camemberts) et sont parfois la principale force du marché. Leur compétence est un réglage de partie | A |
| P4 | La note « moyenne » affichée est une moyenne pondérée de tous les vendeurs, marque blanche comprise ; avant l'arrivée des rivaux, elle égale la note locale | B (modérateur et joueurs) |
| P5 | Repère de joueur : pour prendre vite plus de 50 % du marché, viser une note d'environ 7 points sous les locaux… avec un prix très bas ; ensuite, une note comparable suffit à garder les ventes quelques mois | C |
| P6 | Fréquentation : chaque emplacement a un indice de 0 à 100 (maximal au centre, décroissant vers la périphérie) ; un bonus de demande de détail (étoiles) l'amplifie : spécialisation, nombre de magasins du même type dans la ville, emplacements très fréquentés. Chaque nouveau magasin bien placé profite à toute la chaîne | A |
| P7 | La distance entre deux magasins de la même ville compte peu : la demande se calcule par ville (débat de joueurs, qui réclament justement une couverture locale) | B |

**Proposition d'algorithme pour P1-P4 (D)**

```
pour chaque offre i (magasin × produit) dans la ville :
  N_i = note globale (§2.2) ; F_i = fréquentation × bonus de détail du magasin
  part_note_i  = F_i × max(0, N_i)^α / Σ_j F_j × max(0, N_j)^α        // α ≈ 1,5 à 2 : la meilleure note domine sans tout prendre
  part_prix_i  = F_i × (Pstd / P_i)^β / Σ_j …                          // segment sensible au prix
  part_qual_i  = F_i × Q_i^β / Σ_j …                                   // segment attaché à la qualité
  part_i = (1 − sP − sQ) × part_note_i + sP × part_prix_i + sQ × part_qual_i
           avec sP ≈ cP/200, sQ ≈ cQ/400, et la marque blanche comme offre j à part entière (P3)
ventes_i = min(part_i × D_jour, capacité de vente_i, stock_i)
la demande non servie par une offre à court de stock est en partie reportée sur les autres (le reste est perdu)
```

### 2.6 Élasticités, saturation et cycles

- **Élasticité-prix** : elle n'est pas un paramètre explicite. Elle sort du terme linéaire de prix (N1), de la nécessité (D3) et du segment sensible au prix (P1). Un modérateur du forum présente la nécessité comme une approximation de l'élasticité (B).
- **Saturation** : la demande totale est bornée par D1-D4 ; au-delà, la note ne fait que déplacer des parts (D7).
- **Cycles** : niveau de dépense, salaires, inflation, chômage et taux d'intérêt de la macroéconomie (A) ; saisonnalité de l'offre agricole (laine, cultures), que l'unité de stock tamponne (A) ; cycle de vie des produits et ruptures technologiques (A).

---

## 3. La fixation des prix

### 3.1 Qui fixe quoi

| # | Règle | Conf. |
|---|---|---|
| X1 | **Chaque vendeur a son propre prix**, réglé dans son unité de vente : il n'existe pas de cours unique, sauf pour les biens du port. L'acheteur voit le prix, le fret, la qualité, la marque et la note de chaque fournisseur | A |
| X2 | Le coût d'un magasin = prix d'achat + fret ; le coût d'une usine = coût de ses intrants, fret compris ; le coût d'une mine = la consommation de son gisement (amortissement de l'actif) | A |
| X3 | Le fret est payé par l'acheteur, croît avec la distance et dépend d'un indice de fret propre au produit (1 à 100 : élevé si le fret pèse lourd par rapport au prix). Entre deux villes, trois trajets : fournisseur → port, port → port, port → acheteur | A |
| X4 | Repères de joueurs sur le fret : entre villes, il ajoute 15 à 30 % au prix d'un bien de consommation moyen ; le pain, les meubles et les biens bon marché y sont très sensibles, l'or, l'électronique et les composants beaucoup moins. Exemple pain : blé → farine (2:1) → pain (9:10), 0,10 $ de fret par trajet donne 0,39 $ par pain, dont plus de la moitié sur le premier trajet | C |

### 3.2 Le prix choisi par l'humain

- Le joueur fixe le prix de chaque produit dans chaque entreprise (une option l'applique à toute la ville) (A, B).
- Règle d'or du guide officiel : si la note est trop basse, **baisser le prix tout de suite**. On gagne moins par unité, mais on vend plus, ce qui augmente souvent le profit total et lance la fidélité. Marque et qualité se construisent lentement ; elles financent ensuite un prix plus haut (A).
- Stratégie de chaîne de joueurs : vendre bon marché entre ses propres maillons et prendre la marge au détail. Si toute la chaîne est interne, le profit consolidé ne dépend pas du prix de cession, seulement la trésorerie et la répartition entre entreprises (B, C).
- Prix départ usine élevé : il décourage les IA de s'approvisionner chez toi. Arrêter de vendre à un concurrent oblige à monter le prix très haut, ou à passer en « vente interne » (A, B).

### 3.3 Diagnostic offre/demande (publié)

| Offre vs demande | Utilisation | Goulot | Remède (A) |
|---|---|---|---|
| offre < demande | 100 % | capacité au maximum | une unité de plus, ou former l'unité |
| offre > demande | 100 % | capacité au maximum | idem |
| offre < demande | < 100 % | approvisionnement insuffisant | remonter la chaîne : fournisseur, achat, fabrication, liens |
| offre > demande | < 100 % | demande faible | prix, qualité, marque, publicité |

Une usine dont la sortie ne se vide pas suspend sa fabrication : le goulot est alors à la sortie (A).

### 3.4 Le prix réglé par le COO (publié)

Le COO délégué fixe les prix « en réponse au marché » selon une politique choisie (A, manuels de Capitalism II et Plus) :

| Politique | Cible |
|---|---|
| Normale | note globale ≈ celle de la concurrence |
| Agressive | note ≈ concurrence + 10 points |
| Très agressive | note ≈ concurrence + 20 points |

**Exception** : si la demande dépasse l'offre, le COO **augmente le prix quelle que soit la politique**, car baisser le prix créerait de la demande sans créer de ventes (A). Une politique agressive peut déclencher une guerre des prix qui réduit les marges de tous et ne paie que si les concurrents sortent du marché (A). Dans Capitalism Lab, la politique devient un curseur continu marge ↔ parts de marché, avec un interrupteur « ne jamais vendre sous le coût » (A, page « Management Policies »).

Rôles du COO par type d'entreprise (A) : magasin = prix, publicité, meilleurs fournisseurs, arrêt des achats si le coût dépasse le prix de vente, formation ; usine = prix, nouveau fournisseur si l'intrant s'arrête, publicité, formation ; mine et ferme = prix, formation.

### 3.5 Le prix des IA et des concurrents locaux

| # | Règle | Conf. |
|---|---|---|
| I1 | Les concurrents locaux sont une IA passive : leur prix bouge lentement, avec l'inflation et le prix moyen du marché ; leur qualité suit la tendance moyenne du marché ; leurs prix et leurs marques ne bougent vraiment qu'en économie très réaliste | B (modérateur) |
| I2 | Joueurs : les locaux ne progressent pas d'eux-mêmes mais rattrapent avec le temps ; une R&D très poussée sur un produit (lits niveau 200) est difficile à rentabiliser parce que les locaux finissent par rattraper | B |
| I3 | Les IA fixent souvent leur attrait (note) juste au-dessus du tien pour te prendre des ventes ; elles réagissent avec retard à tes baisses de prix | C |
| I4 | Une IA vendeuse de matières prend une marge par défaut d'environ 20 % sur son coût et monte fortement ses prix quand la demande dépasse son offre | C |
| I5 | Les IA entrent rarement sur un marché où tu as une grosse part, sauf avec un avantage de qualité ou de marque ; une note au-dessus de 100 dissuade leur entrée | B |
| I6 | Le prix des produits d'une IA vendus chez un détaillant sous accord de prix ne se négocie pas | C |

---

## 4. La chaîne d'approvisionnement

### 4.1 Fournisseurs et liens

| # | Règle | Conf. |
|---|---|---|
| S1 | Une unité d'achat achète le produit choisi **tant que le fournisseur en a**. Changer de fournisseur fait perdre le stock de l'ancien produit, sauf si l'on arrête l'achat et qu'on attend que le stock s'écoule | A |
| S2 | La fiche fournisseur affiche la propriété, la ville, la distance, le fret réel, le coût, la qualité, la marque, la note et les barres offre/demande du fournisseur. Barre d'offre plus courte que la barre de demande = pénurie, il faut changer de fournisseur | A |
| S3 | Sources possibles : tes entreprises, celles des concurrents, les ports (biens importés, sans marque), les entrepôts. Le port n'est pas éternel : son offre peut s'arrêter sans prévenir (sauf option « approvisionnement constant »), et ta propre production finit souvent par coûter moins cher | A |
| S4 | Liaison automatique (option) : les unités d'achat trouvent seules leur fournisseur. Vente interne (option, par défaut ou produit par produit) : le produit n'est vendu qu'à tes entreprises, mais les acheteurs extérieurs déjà servis ne sont pas coupés | A |
| S5 | COO (Lab) : « chercher de meilleurs fournisseurs » (mieux notés, stock fiable, sans changer de type de produit ; parmi tes entreprises seulement ou toutes), « poids du fret » (préférer les fournisseurs proches), « tolérance de pénurie » (au bout de combien de temps on change de fournisseur). En multijoueur, un port de secours fournit tes usines si tout est coupé | A |
| S6 | Outils de Lab : changer en masse de fournisseur pour toutes les entreprises qui achètent un produit ; rediriger vers une unité de vente donnée toutes les unités d'achat de tes entreprises | A |
| S7 | Acheteurs réels d'une usine : magasins et usines de toutes les sociétés, classés par note (prix livré, qualité, marque) ; une bonne note attire les IA (A). Un fournisseur à court rationne ses acheteurs (règle exacte non publiée : D) | A / D |

### 4.2 Capacités, niveaux et stocks

| Niveau d'unité | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| Productivité (%) | 100 | 130 | 160 | 200 | 250 | 300 | 360 | 430 | 500 |
| Capacité (%) | 100 | 125 | 175 | 200 | 250 | 300 | 375 | 437 | 500 |

*Table du manuel de Capitalism II (A), pour les unités d'achat et de vente. Le niveau monte par l'expérience et la formation (de quelques mois par niveau à une formation intensive coûteuse). Une unité de niveau 9 se forme gratuitement. Un cadre expert ajoute un niveau tous les 20 points d'expertise dans son domaine.*

| # | Règle | Conf. |
|---|---|---|
| K1 | La barre d'utilisation pleine signifie que l'unité ne peut rien traiter de plus, même s'il y a de l'offre et de la demande | A |
| K2 | L'unité de stock a une capacité plusieurs fois supérieure aux autres pour un coût plusieurs fois moindre, et son niveau ne progresse pas. Elle sert de tampon (saisonnalité de la laine et des cultures, à-coups d'un fournisseur) et de stock d'anticipation | A |
| K3 | Le stock se compte en « cargaisons » de valeur à peu près constante : une cargaison contient quelques voitures ou plusieurs milliers de flacons de shampoing | A |
| K4 | Les usines produisent et les unités d'achat achètent tant qu'il reste de la place : la demande lue paraît forte tant que les stocks se remplissent, et ne se lit vraiment qu'une fois les stocks pleins. Il faut juger sur les ventes aux clients finals | A |
| K5 | Une usine ne fabrique qu'avec la recette complète en stock ; sortie pleine = fabrication suspendue | A |
| K6 | Lab a réduit la capacité des unités vers un niveau plus réaliste, surtout aux niveaux élevés | A |
| K7 | Entrepôt (Lab) : entrée, stockage et sortie à 3 fois la capacité et le débit des unités d'usine (le grand modèle à 6 fois) ; marque de distributeur et publicité en option ; outil de spéculation (pétrole acheté avant une hausse) | A |
| K8 | Produits très chers (option de Lab) : une unité demande prix / 20 000 jours de fabrication (30 000 $ → 1,5 jour) | A |
| K9 | Le coût d'achat n'est décaissé qu'à la vente (seul le fret est payé à l'achat) | C |

### 4.3 Choix d'un fournisseur : la règle à reproduire

```
pour un acheteur b et un intrant g, parmi les fournisseurs s qui ont de l'offre :
  coût_livré(s)  = prix(s) + fret(s, b)                          // X2-X3
  note(s)        = cQ_b × q(s) / 60  +  cP_b × (Pref − coût_livré(s)) / Pref   // N1 appliqué à un bien semi-fini (marque nulle, N3)
  choisir argmax note(s) ; changer quand le fournisseur actuel est en pénurie depuis plus de « tolérance » jours (S5),
  ou quand un autre est nettement meilleur (seuil D : 5 %)
```

---

## 5. Import, export, ventes internes

| # | Règle | Conf. |
|---|---|---|
| E1 | Nombre de ports par ville (biens de consommation, biens industriels), apparition de nouveaux ports, qualité moyenne des importations (basse : inférieure aux produits des sociétés au départ ; haute : supérieure) | A |
| E2 | Produits du port : à considérer seulement si leur note dépasse celle des locaux (sans marque, il faut environ 40 à 50 % de qualité en plus) ; ne pas faire de publicité pour un produit du port (tes concurrents en profitent) ; leur prix peut monter et ruiner une marge calculée sur l'ancien prix | C |
| E3 | Société d'export (Lab) : 8 produits au plus, 2 sociétés au plus ; chaque client a un volume d'achat total, puis il cesse d'acheter ; le volume dépend aussi du prix et de la qualité | A |
| E4 | DLC villes : une ville n'exporte qu'une fois sa compétitivité au-dessus de la référence mondiale ; PIB = consommation + investissement + dépense publique + exportations nettes | A |
| E5 | Filiales (Lab) : ventes internes au prix de cession choisi ; le profit consolidé ne change pas, seule sa répartition (donc l'impôt et le résultat de chaque société) | A (fonction) / B (effet) |

---

## 6. Écart détaillé avec Wall Street Empire

Barème de gravité : **4** = change la façon de jouer ou fausse une règle centrale ; **3** = réalisme notable ; **2** = détail visible ; **1** = cosmétique. « Corrigé » renvoie au §7.

| # | Règle (Capitalism Lab, public) | Chez nous (code) | Écart | Grav. |
|---|---|---|---|---|
| G1 | Note globale linéaire en prix face au prix standard, qualité, marque 0-200 (N1) | `productScore` : prix = 50 × (prix perçu / prix)^1,2 borné 0-100, avec zone de prime de marque `brandPrem` ; qualité = perception `ps.rt` ; marque 0-100 ; moyenne pondérée `scoreW` (poids par produit `PROD_W`, glissement en récession) | Forme différente mais équivalente en tendance (prix ↑ → note ↓, marque et qualité ↑ → note ↑) ; la nôtre est bornée, plus lisible | 1 |
| G2 | Concerns par produit et par ville (N2-N3) | Par produit (`PROD_W`, `SCORE_W`), modulés par le PIB | Une seule ville : rien à faire | — |
| G3 | Qualité = technologie / pointe + qualité des intrants livrés (Q1-Q5) | `trueQ` le fait déjà (`TECH_SHARE`, `techFront`) ; **mais** `updInputQ` ne lisait que la qualité de tes propres bâtiments : la qualité d'un fournisseur ou du port ne servait à rien | Le choix d'un fournisseur n'avait aucun effet sur la qualité | 3 · **corrigé (7.1)** |
| G4 | Le prix d'un intrant croît avec sa qualité (Q6) | `supplierList` : prix et qualité tirés **indépendamment** (hash) : un fournisseur pouvait être à la fois le moins cher et le meilleur | Choix dominant, pas d'arbitrage | 3 · **corrigé (7.1)** |
| G5 | Choix de fournisseur sur la note (prix livré et qualité), fret et tolérance de pénurie (S5, 4.3) | `offerScore` = coût + fret × poids, sans qualité ; `polFr`, `polTol` présents ; `autoSource` prend le moins cher de qualité ≥ 50 (décision de la passe 21, conservée) | La qualité ne pesait pas | 3 · **corrigé (7.1)** |
| G6 | COO : prix visant la note de la concurrence + 0 / 10 / 20, et hausse quand la demande dépasse l'offre (3.4) | `pfOf` : curseur de politique = ±8 % fixe sur les rayons, sans lien avec la concurrence ni les goulots ; le prix produit `ps.pf` est purement manuel | Pas de prix qui réagit au marché pour le joueur ; un goulot ne fait jamais monter le prix | 4 · **corrigé (7.2)** |
| G7 | Concurrents locaux passifs, qualité qui suit le marché (P3, I1-I2) | Marchandise locale (`'g'`) d'attrait fixe 0,5 ; qualité moyenne de la ville figée (45/55/70) dans les fiches | Un avantage de qualité était acquis pour toujours : pas de course à la R&D contre les locaux | 3 · **corrigé (7.3)** |
| G8 | Partage : segments sensibles au prix et à la qualité (P1-P2) | Part ∝ attrait = (note / 50)^1,6 × marque × emballage × adoption… ; élasticité séparée (`elF`) ; rivaux agrégés par classe (`rivalAttr`) | Pas de segment « prix » explicite ; l'élasticité de `elF` en tient en partie lieu | 2 |
| G9 | Demande par produit : habitants × achats par an (D1-D2), nécessité (D3), dépense (D4), obsolescence (D6) | `DEMAND_PC`, `typeW`, `necOf`, `affordOf`, `recF`, `OBSO`, `SUCC`, Bass (`stepAdoption`) ; **mais** la demande est un **pool par classe** (`dem[cls]`) partagé entre produits, et chaque produit lancé l'agrandit de 12 % (jusqu'à 4) | Lancer un produit crée de la demande de classe (choix de jeu assumé) ; ailleurs, plus riche que CapLab (Bass, Veblen, court/long terme) | 2 |
| G10 | Seuls les spécialistes créent de la demande (D8) ; fréquentation 0-100, bonus de chaîne (P6) | Passe 46 : `specDay`, `specAttr`, `SPEC_PASS` ; `custIndex` (emplacement 38 %, notoriété, qualité, assortiment, humeur), `trafficAt` | Au niveau | — |
| G11 | Chaque vendeur a son prix (X1) | Prix unique par bien `S.price` (passe 14, choix d'équipe « à la Offworld ») ; le joueur ne règle pas le prix de ses composants ; le pouvoir de marché (`mpGood`) fait la marge | Écart volontaire (lisibilité) ; le pouvoir de marché reproduit l'effet « seul vendeur = marge » | 2 (assumé) |
| G12 | Acheteurs industriels classés par note (S7) | `stepLocalMarket` : ta part = ta capacité / (ta capacité + capacité PNJ) : le prix et la qualité de tes composants ne changent pas ta part | Part à la capacité, pas à la note | 3 |
| G13 | Fournisseur à court : barres offre/demande vraies, rationnement, pénurie (S2, S7) | Fournisseurs nommés et import **illimités** ; la barre « Offre » de la fiche fournisseur est tirée au hasard (`supCards`) | Pas de rupture côté fournisseur ; une barre décorative | 3 · **corrigé (7.4)** |
| G14 | Port non constant, offre qui peut s'arrêter (S3, E1) | Import instantané et illimité, ×1,05-1,3 + fret | Pas de risque d'approvisionnement portuaire | 2 |
| G15 | Stock local par unité, lag, sortie pleine = arrêt (K2-K5) | Stock commun à l'empire (`S.stock`, `S.prod[pk].stock`) ; usine arrêtée si le stock commun est plein (`roomFor`) ; au-delà de 15 jours de ventes, le surplus de produit fini part **automatiquement** à l'export à ≈ 72 % du cours mondial, **sans congestion** (contrairement aux biens) | Déjà relevé (C3, C5 de `PARITE`) ; surproduction peu visible | 3 |
| G16 | Niveaux d'unité 1-9 (table 4.2) | Pas de niveau par unité (plan à 12 emplacements, robots) | Déjà relevé (C2) | 3 |
| G17 | Fret par produit (indice 1-100), payé par l'acheteur, 3 trajets entre villes (X3-X4) | Intrants : 0,6 % du prix par case (`FREIGHT`) ; sorties : 0,01 $ par unité et par case (`TRANS`, donc plus lourd pour les biens bon marché, comme dans CapLab) ; import et étranger en 3 trajets | Proche ; le fret des intrants est proportionnel à la valeur et non au poids | 1 |
| G18 | Vente interne, prix de cession sans effet sur le consolidé (S4, E5) | Passe 32 : filiales, prix de cession, intégration fiscale, vente interne par société | Au niveau | — |
| G19 | IA : note juste au-dessus de la tienne, guerre des prix, locaux qui entrent quand la marge attire (I3-I5) | `rivPrice` (réaction à la perte de part, suivi du prix du joueur `fol`, guerre, entente), `mpEntry` / `mpProdEntry` (appel d'air) | Au niveau, avec une règle différente (part perdue plutôt que note visée) | 1 |
| G20 | Prix de vente plafonné (N5) | Curseurs 60-160 % (produit), 60-220 % (rayon) | Au niveau | — |
| G21 | Ne jamais vendre sous le coût (3.4) | `S.pol.noLoss` pour les rayons ; le COO de 7.2 l'applique aux produits | Au niveau | — |
| G22 | Achat payé à la vente (K9) | Intrants payés à la production | Détail de trésorerie | 1 |

---

## 7. Ce qui a été implémenté (un commit par écart)

Ordre retenu, par impact sur le plaisir de jeu et le réalisme, sans toucher aux principes décidés avec Rémy : aucun plafond sur l'argent gagné, spéculation libre, marges pilotées par le pouvoir de marché, accueil du début de partie préservé, concurrence qui monte avec le palier, agriculture (saisons, météo) intacte.

### 7.1 La qualité des fournisseurs se paie, pèse dans le choix et passe dans les produits (G3, G4, G5)

- **Prix et qualité couplés** (`supplierList`) : `prix = cours × (0,92 + 0,12 × h) × (q / 65)^0,5` (h : écart propre déterministe). Une qualité 90 coûte environ 18 % de plus, une qualité 40 environ 22 % de moins. La moyenne des prix ne bouge pas (≈ 1,01 × cours, comme avant).
- **Choix sur une note** (`offerScore`, `bestOffer`, `buyerQw`) : `coût équivalent = (prix + fret × poids du fret) × max(0,3 ; 1 + qw × (60 − q) / 50)`. Le poids de la qualité `qw` est propre à l'acheteur : politique « Poids de la qualité » (nouveau curseur, 50 % par défaut) × part des intrants dans la qualité de son produit (100 − `TECH_SHARE`). Un magasin ou une usine de composants n'en tient presque pas compte, parce que la qualité de ses intrants ne change rien à ce qu'il vend.
  Exemple à 50 % : fournisseur q 90 à 1,18 → 1,18 × 0,70 = 0,83 ; fournisseur q 40 à 0,78 → 0,78 × 1,20 = 0,94 : la qualité gagne. À 25 %, c'est le moins cher qui gagne (1,00 contre 0,86).
- **Propagation** (`srcQ`, `inputQ`, `updInputQ`) : la qualité livrée vient de la source réellement choisie par chaque usine (fournisseur nommé = sa qualité ; port = 55 ; stock local = ta production si tu en as, sinon le marché local, 50). Elle entre dans `trueQ`, donc dans la perception de qualité et la note du produit. Elle est recalculée chaque mois et dès que tu valides un fournisseur.
- La note de la vue « Sélectionner un fournisseur » utilise la même formule que le choix automatique. `autoSource` garde la règle de la passe 21 (le moins cher livré parmi les qualités ≥ 50), qui protège les marges fines des usines.

### 7.2 Le directeur des prix (COO) (G6)

- `compOv(pk)` : note moyenne de la concurrence sur l'échelle de `productScore`. Elle combine la marque blanche locale (prix standard, qualité `locQ`, marque nulle, poids `locAttr`) et les rivaux présents dans la catégorie (prix relatif `r.px`, capital de marque `r.bk`, qualité de gestion `r.mq`), pondérés par leur attrait `rivEff`.
- Politique « Prix des produits (COO) » (Finances > Politique de gestion) : **Manuel** (défaut : aucun effet), **Normal** (note = concurrence), **Agressif** (+10), **Très agressif** (+20). Chaque jour, `stepCooPrice` calcule par bissection le prix `ps.pf` qui atteint la cible (`cooTargetPf`) et s'en approche de 2 % par jour au plus.
- **Goulot** : si la demande adressée au produit (`S._dw.pd`) dépasse les ventes (moins de 90 % servis, stock inférieur à 2 jours de demande, production non nulle), le prix monte de 1 % par jour quelle que soit la politique.
- Plancher : jamais sous le coût des intrants (+5 % avec « Ne jamais vendre sous le coût »). Curseur 60-160 %. Un produit dont tu bouges le curseur reste en manuel (bouton « Rendre au COO »). La fiche produit affiche la note, la cible et la raison.

### 7.3 Les producteurs locaux rattrapent la qualité du marché (G7)

- `S.locQ[cls]` démarre à la qualité de la ville (45 / 55 / 70). Chaque jour (`stepLocQ`), elle tend vers `q0 + compétence × 0,6 × (qualité moyenne du marché − q0)`, avec une demi-vie de 540 jours. La qualité moyenne du marché = ta part × ta qualité perçue + le reste × celle des locaux. La compétence est le paramètre de partie « Compétence des producteurs locaux » : 0 à 2,4. La qualité locale ne descend jamais sous q0, et rien ne bouge tant que tu ne vends pas de produit de ta marque dans la catégorie (accueil préservé).
- Attrait de la marchandise locale : `0,5 × ((50 + poids qualité × (locQ − q0)) / 50)^1,6`, la même courbe que celle des produits. Exemple : avec 50 % du marché en jeans de qualité perçue 95 et la compétence modérée, `locQ` passe de 55 à 63 en deux ans, et l'attrait des locaux de 0,50 à 0,55 (+10 %).
- Sauvegarde : clé optionnelle `lq` (absente = ancien comportement).

### 7.4 Les fournisseurs nommés ont une capacité ; les barres offre / demande deviennent vraies (G13)

- Chaque fournisseur nommé (`supplierList`) reçoit un facteur de taille `cf` (0,35 à 0,95, déterministe ; 2 pour une puissance étrangère). Sa capacité quotidienne vaut `cf × 1,5 × demande locale de référence du bien` (`supCap`, `supRef`), et elle est partagée entre **tous** ses clients du jour (`S._supU`, non sauvegardé). Repère : une usine moyenne de jeans consomme ≈ 1 750 u/j de tissu ; un fournisseur de tissu livre 1 800 à 4 100 u/j. Il sert donc une à deux usines, pas trois.
- Au-delà de la capacité, l'unité d'achat complète au port, au prix de l'import (l'équivalent du « port de secours » de CapLab, S5). L'usine ne s'arrête pas : elle paie plus cher, et un message l'explique au plus une fois par mois. C'est un choix d'accueil : en CapLab strict, l'usine manquerait d'intrant.
- Le choix automatique (`bestOffer` en cas de rupture ou avec « Chercher de meilleurs fournisseurs », `autoSource` au lancement) écarte un fournisseur qui n'a plus de quoi servir l'acheteur, et la recherche quitte un fournisseur saturé.
- Vue « Sélectionner un fournisseur » : la barre « Offre » (capacité restante pour cet acheteur) et la barre « Demande » (son besoin) sont tracées sur la même échelle. Elles remplacent les barres tirées au hasard.

### 7.5 Écarts laissés ouverts (et pourquoi)

- **G12** (acheteurs industriels classés par note) et **G11** (un prix par vendeur) : ils remettent en cause le prix unique de la passe 14, décidé avec l'équipe. À trancher avec Rémy avant de coder.
- **G14** (coupures du port) : avec le report automatique de 7.4, une coupure ne change presque que le coût. Sans report, elle arrête des chaînes entières dès le début de partie. Proposition : des coupures déterministes (hash) de 10 à 30 jours par bien industriel, réservées aux paliers avancés, réglées par « Activité des puissances étrangères ». L'entrepôt (spéculation, tampon) y gagnerait un vrai rôle.
- **Rationnement strict** (une usine qui s'arrête faute de fournisseur) : à garder pour une option « CapLab strict », comme l'option « approvisionnement constant » du jeu.
- **G15 / G16** (stock local, niveaux d'unité) : chantiers L déjà spécifiés dans `ANALYSE_CAPITALISM.md` et `PARITE_SIMCITY_CAPITALISM.md`. Pour le surplus exporté sans congestion, la congestion de la passe 21 pourrait s'appliquer aussi aux produits finis. Elle réduirait les gains des gros producteurs : c'est à trancher avec Rémy (principe « pas de plafond »).
- **G8** (segment sensible au prix) : modifierait toutes les parts de rayon et donc les marges calibrées (t02, t45). Il vaut mieux le faire dans une passe d'équilibrage dédiée.

---

## 8. Validation (avant / après)

**Tests ciblés** (un par un, 1 worker, sans build pendant un test) : t02, t04, t08 (chaînes et scénarios), t09, t20, t22, t23, t24, t37 et t45 sont **tous verts avant et après** (0 FAIL). Le nouveau test t61 donne 24 PASS.

**`tools/sim_batch.js`** : 1 200 jours, 1 worker, 3 graines, castes industriel et négociant, profils bon et industriel, soit 12 parties. La même graine est jouée avant (commit 70151f3) et après (commit 4b0f6b6).

| Partie | Valeur avant | Valeur après | Écart | Résultat net/j avant → après |
|---|---|---|---|---|
| industriel / bon (3 graines) | 57,1 · 59,1 · 56,7 M$ | identiques | 0 % | identiques |
| négociant / bon (3 graines) | 53,2 · 53,7 · 55,6 M$ | identiques | 0 % | identiques |
| industriel / industriel 1003 | 104,1 M$ | 100,4 M$ | −3,5 % | 146 892 → 156 474 |
| industriel / industriel 2003 | 106,8 M$ | 103,2 M$ | −3,3 % | 138 752 → 147 355 |
| industriel / industriel 3003 | 101,6 M$ | 102,7 M$ | +1,1 % | 160 743 → 152 112 |
| négociant / industriel 1020 | 94,2 M$ | 95,2 M$ | +1,1 % | 139 539 → 134 357 |
| négociant / industriel 2020 | 91,2 M$ | 88,9 M$ | −2,6 % | 134 237 → 137 739 |
| négociant / industriel 3020 | 61,5 M$ | 61,5 M$ | −0,1 % | 100 456 → 100 052 |
| **Moyenne des 12** | 74,57 M$ | 73,95 M$ | **−0,8 %** | rang 1/6 partout, 0 erreur de page |

Lecture. Le profil « bon » (commerce et services) est inchangé bit à bit : le COO est en manuel par défaut, les locaux ne bougent pas sans produit de marque, et ce profil n'achète pas d'intrants à des fournisseurs nommés. Le profil industriel bouge de −3,5 % à +1,1 %. Deux effets s'y combinent : le couplage prix-qualité des fournisseurs, et le reliquat importé quand un fournisseur est saturé. Le résultat net quotidien de fin de partie monte même dans 3 cas sur 6. Ce n'est donc pas un plafond sur les gains : c'est le coût réaliste de plusieurs usines branchées sur un seul petit fournisseur.

**Banc du directeur des prix** (une chaîne de jeans, 2 usines, 4 magasins, 360 jours, même graine). En manuel, le prix reste à 100 %. En **Normal**, le COO monte le prix à 112-113 % : la note du produit (41) dépassait celle de la concurrence (39), il récupère donc de la marge en égalisant les notes, et la trésorerie gagne +3 % sur la période. En **Agressif** et **Très agressif**, la cible +10 / +20 est inatteignable au-dessus du coût des intrants : le COO s'arrête au plancher (≈ 101 %) au lieu de brader. Pendant une guerre des prix d'un rival au jour 120, le Normal suit le marché (109 % au plus bas, puis 113 %). Limite du banc : les rayons de ce montage ne vendaient pas le produit de marque (ventes nulles), donc il mesure la règle de prix et les coûts, pas l'effet sur le volume. L'effet volume est couvert par t61 (note visée atteinte) et par `productScore`.

---

## 9. Sources

**Officielles**
- Manuel de Capitalism II (Enlight) : https://www.enlight.com/capitalism2/manual/Capitalism2_Manual.pdf (note globale et formule, concerns, qualité des produits fabriqués, unités et table des niveaux, diagnostic des goulots, concurrents locaux, politique de prix du COO, économie urbaine complexe, ports)
- Manuel de Capitalism Plus (Steam) : https://steamcdn-a.akamaihd.net/steam/apps/450120/manuals/Capitalism_Plus_Manual.pdf (mêmes règles, vente interne, approvisionnement constant des ports, port de secours, indice de nécessité)
- Capitalism Lab, guide du débutant : https://www.capitalismlab.com/beginners-guide-gameplay-basics/
- Capitalism Lab, modding des produits (prix standard, prime de R&D, fret, demande, nécessité, concerns, obsolescence, remplacement) : https://www.capitalismlab.com/mod/advanced-modding/advanced-modding-products/
- Capitalism Lab, marque : https://www.capitalismlab.com/?p=4374
- Capitalism Lab, commerce (fréquentation, bonus de demande de détail) : https://www.capitalismlab.com/new-content/retail-simulation-enhancement/
- Capitalism Lab, entrepôt : https://www.capitalismlab.com/new-content/warehouse/
- Capitalism Lab, politiques de gestion (prix, fret, meilleurs fournisseurs, tolérance de pénurie) : https://www.capitalismlab.com/improvements/management-policies/
- Capitalism Lab, équilibrage (capacité des unités, fret à trois trajets, niveau 9) : https://www.capitalismlab.com/improvements/improved-gameplay-balance/
- Capitalism Lab, simulation des produits (remplacement, obsolescence) : https://www.capitalismlab.com/new-content/enhanced-product-simulation/
- Capitalism Lab, outils d'approvisionnement : https://www.capitalismlab.com/new-content/supply-management-tools/
- Capitalism Lab, mode analyse des usines : https://www.capitalismlab.com/analysis-mode-factories/
- Capitalism Lab, export : https://www.capitalismlab.com/export-strategy/
- Capitalism Lab, DLC villes : https://www.capitalismlab.com/ces-dlc/ultra-realistic-city-economic-simulation/
- Capitalism Lab, produits très chers : https://www.capitalismlab.com/high-priced-products

**Communauté** (niveaux B et C)
- Forum, qualité des matières et formules de prix : https://www.capitalism2.com/forum/viewtopic.php?t=3921
- Forum, demande et nécessité (modérateur) : https://www.capitalism2.com/forum/viewtopic.php?t=7763
- Forum, parts de marché et marque blanche : https://www.capitalism2.com/forum/viewtopic.php?t=3992
- Forum, note produit : https://www.capitalism2.com/forum/viewtopic.php?t=4151
- Forum, capacité des magasins : https://www.capitalism2.com/forum/viewtopic.php?t=5589
- Forum, emplacement des magasins : https://www.capitalism2.com/forum/viewtopic.php?t=1778
- Forum, prix départ usine et vente interne : https://capitalism2.com/forum/viewtopic.php?t=3455 · https://www.capitalism2.com/forum/viewtopic.php?t=3456
- Forum, questions de base : https://capitalism2.com/forum/viewtopic.php?t=4510
- Guide Steam « Master in Capitalism 2 » : https://steamcommunity.com/sharedfiles/filedetails/?id=2969285443
- Guide de stratégie Capitalism Lab (Proqet) : https://www.magazine.proqet.com/proqetmagazine/capitalism-lab-strategy-guide-part-1/
