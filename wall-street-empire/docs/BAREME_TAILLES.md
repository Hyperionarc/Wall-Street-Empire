# Barème des tailles (emprises en cases)

Règle générale : **plus c'est gros dans la vraie vie, plus d'emprise**. Une case ≈ 150 m de côté (environ 2 ha). Chaque bâtiment est ancré
exactement sur ses cases : coin nord entier et emprise w × h entière, sans aucune case partagée avec une autre emprise (grille stricte, contrôlée
par `WSE.fp.audit()` et le test `tools/tests/t58_tailles.js`). Le barème est aussi dans le code (`FP_BAREME`, vérifié par `WSE.fp.rules()`).

Colonnes : clé du type, nom, emprise avant → après (largeur × profondeur), nombre de cases, raison.

## Commerce

| Type | Nom | Avant | Emprise | Cases | Raison |
|---|---|---|---|---|---|
| `s1` | Petit marché | 1 × 1 | 1 × 1 | 1 | supérette de quartier (≈ 300 m²) : 1 lot |
| `smode` | Boutique de mode | 1 × 1 | 1 × 1 | 1 | petite boutique en pied d'immeuble |
| `spharma` | Pharmacie · drugstore | 1 × 1 | 1 × 1 | 1 | commerce de proximité |
| `slux` | Maison de luxe | 1 × 1 | 1 × 1 | 1 | boutique de prestige, petite surface |
| `stech` | Maison du Numérique | 2 × 1 | 2 × 1 | 2 | moyenne surface spécialisée |
| `shome` | Maison et déco | 2 × 1 | 2 × 1 | 2 | moyenne surface (meubles exposés) |
| `ssport` | Sport et loisirs | 2 × 1 | 2 × 1 | 2 | moyenne surface spécialisée |
| `sbrico` | Brico et outillage | 2 × 1 | 2 × 1 | 2 | moyenne surface avec cour de matériaux |
| `sauto` | Concession automobile | 2 × 2 | 2 × 2 | 4 | showroom + grand parking des voitures exposées, tout dans l'emprise |
| `s2` | Supermarché | 2 × 1 | **2 × 2** | 4 | ≈ 2 500 m² de vente + parking clients : 4 cases ; occupe exactement le coin 2×2 réservé de chaque bloc |
| `s3` | Hypermarché | 2 × 2 | **3 × 3** | 9 | ≈ 10 000 m² + très grand parking : 9 cases (≥ 8). Sprite carré → 3×3 plutôt que 4×2 (pas de déformation). **Périphérie conseillée** (plus d'interdiction au centre) |
| `s4` | Méga-centre commercial | 3 × 3 | 3 × 3 | 9 | inchangé (consigne « mall inchangé ») : galerie sur plusieurs niveaux, d'où la même emprise que l'hypermarché pour 4 fois sa capacité ; périphérie comme l'hypermarché |
| `ewh` | Entrepôt logistique en ligne | 2 × 2 | 2 × 2 | 4 | plateforme logistique |
| `immo` | Agence immobilière | 1 × 1 | 1 × 1 | 1 | bureau en pied d'immeuble |
| `sfuel` | Station-service | — | 1 × 1 | 1 | pompes, auvent et boutique au bord de la route (nouveau type, liberté de construire) |
| `scharge` | Bornes de recharge | — | 1 × 1 | 1 | bornes rapides et auvent au bord de la route (nouveau type) |
| `marina` | Port de plaisance | — | 2 × 2 | 4 | pontons, capitainerie et places d'amarrage au bord de l'eau (nautisme) |
| `shipyd` | Chantier naval | — | 3 × 3 | 9 | hall de coque, cale de lancement et grue portique au bord de l'eau (nautisme) |

## Ville, tours et bureaux (inchangés)

| Type | Nom | Avant | Emprise | Cases | Raison |
|---|---|---|---|---|---|
| `res` | Logements | 1 × 1 | 1 × 1 | 1 | 1 lot, on monte en étages |
| `tech` | Tour Tech | 1 × 1 | 1 × 1 | 1 | tour : 1 lot |
| `off` | Tour de location | 1 × 1 | 1 × 1 | 1 | tour : 1 lot |
| `bank` | Banque | 1 × 1 | 1 × 1 | 1 | immeuble de bureaux |
| `rd` | Centre de R&D | 1 × 1 | 1 × 1 | 1 | immeuble de bureaux et labos |
| `dc` | Data center | 1 × 1 | 5 × 4 | 20 | campus (passe 58) : interdit en ville, alimentation électrique obligatoire |
| `tv` | Station média | 1 × 1 | 1 × 1 | 1 | immeuble |
| `sport` | Équipement sportif | 1 × 1 | 1 × 1 | 1 | gymnase de quartier |
| `hq` | Siège social | 2 × 2 | 2 × 2 | 4 | inchangé |
| `npc` | Immeuble (ville existante) | 1 × 1 | 1 × 1 | 1 | chaque maison ou immeuble de la ville occupe exactement 1 case |

## Industrie, logistique, énergie

| Type | Nom | Avant | Emprise | Cases | Raison |
|---|---|---|---|---|---|
| `f1` | Petite usine | 1 × 1 | 1 × 1 | 1 | atelier |
| `foundry` | Fonderie d'or | 1 × 1 | 1 × 1 | 1 | atelier spécialisé |
| `wh` | Entrepôt | 1 × 1 | 1 × 1 | 1 | dépôt |
| `f2` | Usine moyenne | 2 × 1 | 2 × 1 | 2 |  |
| `btp` | Entreprise de BTP | 2 × 1 | 2 × 1 | 2 | bureaux + dépôt de matériel |
| `plant` | Centrale électrique | 2 × 1 | 2 × 1 | 2 |  |
| `f3` | Grande usine | 2 × 2 | 2 × 2 | 4 |  |
| `port` | Terminal portuaire | 2 × 2 | 2 × 2 | 4 |  |
| `f4` | Méga-usine | 3 × 3 | 3 × 3 | 9 |  |
| `nuclear` | Centrale nucléaire | 3 × 3 | 3 × 3 | 9 |  |
| `solar` | Centrale solaire | 5 × 4 | 5 × 4 | 20 | champ de panneaux de 20 cases |
| `wind` | Éolienne | 1 × 1 | 1 × 1 | 1 |  |

## Réseaux

| Type | Nom | Avant | Emprise | Cases | Raison |
|---|---|---|---|---|---|
| `road` | Route | 1 × 1 | 1 × 1 | 1 |  |
| `pylon` | Pylône / ligne aérienne | 1 × 1 | 1 × 1 | 1 |  |
| `cable` | Câble enterré | 1 × 1 | 1 × 1 | 1 |  |
| `pipeline` | Pipeline | 1 × 1 | 1 × 1 | 1 |  |

## Agriculture et élevage

| Type | Nom | Avant | Emprise | Cases | Raison |
|---|---|---|---|---|---|
| `fwheat` | Ferme de blé | 2 × 2 | 3 × 3 | 9 | grand champ (passe 85 : double de surface, débit et prix × 9/4) |
| `fsugar` | Plantation de canne | 2 × 2 | 3 × 3 | 9 | grand champ (passe 85 : double de surface, débit et prix × 9/4) |
| `fcotton` | Plantation de coton | 2 × 2 | 3 × 3 | 9 | grand champ (passe 85 : double de surface, débit et prix × 9/4) |
| `frubber` | Plantation d'hévéas | 2 × 2 | 3 × 3 | 9 | grand champ (passe 85 : double de surface, débit et prix × 9/4) |
| `fvine` | Vignoble | 2 × 2 | 3 × 3 | 9 | grand champ (passe 85 : double de surface, débit et prix × 9/4) |
| `fcorn` | Culture de maïs | 2 × 2 | 3 × 3 | 9 | grand champ (passe 85 : double de surface, débit et prix × 9/4) |
| `frapeseed` | Culture de colza | 2 × 2 | 3 × 3 | 9 | grand champ (passe 85 : double de surface, débit et prix × 9/4) |
| `fcattle` | Élevage de bovins | 2 × 2 | 2 × 2 | 4 | exploitation |
| `fchicken` | Élevage de poulets | 2 × 2 | 2 × 2 | 4 | exploitation |
| `fpig` | Élevage de porcs | 2 × 2 | 2 × 2 | 4 | exploitation |
| `fsheep` | Élevage de moutons | 2 × 2 | 2 × 2 | 4 | exploitation |

## Extraction (sur son gisement)

| Type | Nom | Avant | Emprise | Cases | Raison |
|---|---|---|---|---|---|
| `well` | Puits pétrole | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `gwell` | Puits de gaz naturel | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `miron` | Mine de fer | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `mcoal` | Mine charbon | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `mcopper` | Mine cuivre | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `mgold` | Mine d'or | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `mnicr` | Mine de nickel-chrome | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `mbauxite` | Mine de bauxite | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `mlithium` | Mine de lithium | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `mzinc` | Mine de zinc | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `mgraphite` | Mine de graphite | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `mphos` | Mine de phosphate | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `mpotash` | Mine de potasse | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `qsilica` | Carrière de silice | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `qclay` | Carrière d'argile | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `qsalt` | Mine de sel gemme | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `qgravel` | Carrière de granulats (gravier + sable, concasseur en option, passe 79) | 1 × 1 | 1 × 1 | 1 | 1 case de gisement ; le concasseur tient dans la même case |
| `qlime` | Carrière calcaire | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |
| `logging` | Camp bûcherons | 1 × 1 | 1 × 1 | 1 | 1 case de gisement |

## Équipements publics de la ville (cases « mon », table `MON_FP`)

| Équipement | Nom | Avant | Emprise | Cases | Raison |
|---|---|---|---|---|---|
| `hospital` | Hôpital | 1 × 1 | **3 × 3** | 9 | grand établissement : 9 cases, bâtiment à l'échelle de l'emprise |
| `lycee` | Lycée | 1 × 1 | **3 × 2** | 6 | bâtiment au fond, cour et piste de sport devant |
| `college` | Collège | 1 × 1 | **2 × 2** | 4 |  |
| `hall` | Hôtel de ville | 1 × 1 | **2 × 2** | 4 |  |
| `stadium` | Stade (×2) | 1 × 1 | **2 × 2** | 4 | tribunes et terrain |
| `maternelle` | École maternelle | 1 × 1 | 1 × 1 | 1 | petite école de quartier |
| `garderie` | Crèche et garderie | 1 × 1 | 1 × 1 | 1 |  |
| `police` | Commissariat | 1 × 1 | 1 × 1 | 1 |  |
| `fire` | Caserne de pompiers | 1 × 1 | 1 × 1 | 1 |  |
| `telecom` | Tour de télécommunications | 1 × 1 | 1 × 1 | 1 |  |
| `mall` | Mall central | 10 × 10 | 10 × 10 | 100 | inchangé |
| `air` | Aéroport | 6 × 4 | 6 × 4 | 24 | inchangé |

## Économie (proportionnée, marges gardées)

| Type | Capex | Entretien | Employés | Capacité | Commentaire |
|---|---|---|---|---|---|
| `s2` Supermarché 2 × 2 | 0,7 M$ (inchangé) | 240 $/j | 5 | 400 | l'emprise double : le prix du terrain (qui suit l'emprise) la paie |
| `s3` Hypermarché 3 × 3 | 4,0 → **4,4 M$** | 1 000 → **1 150 $/j** | 16 → **20** | 540 → **720** | 1,8 fois le supermarché pour 2,25 fois sa surface |
| `s4` Méga-centre 3 × 3 | ×4 l'hypermarché (dérivé) | ×4 | ×4 | ×4 | multi-niveaux |

Marges vérifiées par `t02` (EBITDA des commerces ≥ 12 %).

## Hypermarché hors du centre dense

Les grandes surfaces (`T.peri` : hypermarché, méga-centre) ont leur place en ville à **12 cases ou plus du centre** (distance du centre de leur emprise au
centre-ville, `PERI_R`), là où il y a la place pour leur parking : « c'est couillon de le mettre en ville ».
Mise à jour (responsable Liberté de construire, consigne de Rémy « n'importe qui peut construire où il veut, il ne faut pas l'interdire ») : la pose au centre
n'est plus refusée. La périphérie reste l'emplacement conseillé (conseil au survol « Centre dense : terrain cher et peu de place pour le parking », placements
automatiques en périphérie seulement) et le prix du sol commercial du centre fait le reste. Voir `docs/journal/construction.md`.

## Migration des anciennes sauvegardes (`wse-city-v8`, format inchangé)

Au chargement (`fpMigrate`), un bâtiment du joueur dont le type a grandi (supermarché 2 × 1, hypermarché 2 × 2) garde son coin nord s'il le peut
(sinon le coin le plus proche) et prend les cases voisines libres ou occupées par la ville (maison, immeuble, parc rasés comme pour une acquisition) ;
jamais une rue, un équipement public, un gisement ni un autre bâtiment du joueur. Sans place possible, il garde son ancienne emprise (rien ne se
chevauche, rien n'est perdu). Les équipements publics d'une case (`monLink`) sont agrandis de la même façon sur les lots voisins.

## Grille stricte et sprites

- Les maisons et immeubles de la ville occupent 1 case chacun ; leur sprite est centré sur SA case : le centre de dalle détecté au build est recalculé
  depuis le bas de la silhouette quand il tombe sur un toit en surplomb (`p2Ctr`, `cityBox`) : plus de maison « au milieu de 4 cases »
  (`maison_pnj_a`, `maison_pnj_c`, `petit_marche_n1`, `agence_immo`, `usine_petite_f1`, tours de 12 et 25 étages).
- À la pose, l'emprise est recalée (snap) sur des cases entières autour du pointeur : coin le mieux centré dont l'emprise est valide (`snapAt`).
- Supermarché et hypermarché : sprite carré étiré sur toute l'emprise carrée, abris à caddies sur le parking, repli procédural soigné (grande boîte
  plate, bandeau, parking tracé) si le sprite manque ; plus jamais l'ancien atlas en losanges. Aucun texte dans les sprites (plaques SIGN).
- Plus de gare dans la ville vivante pour l'instant (service retiré de `VV_SVC` et de `SIGN`).
