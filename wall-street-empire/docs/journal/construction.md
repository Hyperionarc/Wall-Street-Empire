# Journal du responsable Liberté de construire

## Mission (Rémy)
« Théorie de la construction des bâtiments : quel que soit l'endroit, il faut juste INCITER par des subventions (hangar industriel, port…). Mais n'importe qui peut
construire où il veut, de l'autre côté de la ville, en pleine campagne. Il n'y a pas de problème. Il ne faut pas que tu l'interdises. Et les stations-service
(essence, recharge) devraient être construites au bord de la route, là où il n'y a pas de construction de ville, et que ce soit plus facile pour tout le monde
et moins cher à construire. »

Indicateur : `tools/tests/t120_liberte_construire.js` (un bâtiment de chaque famille posé en campagne et de l'autre côté de la ville, subvention au port et
nulle part ailleurs, station au bord de la route plus facile et moins chère, sauvegarde, 0 erreur).

## Principe retenu
`ZONE_NEED` n'est plus une règle de pose : c'est la **zone naturelle** d'un type (là où la ville l'aide ou là où il trouve ses clients). `footprintError` ne garde
que les impossibilités physiques. La géographie et l'économie font le reste : subvention de zone, prix du terrain par usage (passe 48), desserte, trajet des salariés,
clientèle. Les placements AUTOMATIQUES (« Construire cette chaîne », placement auto, meilleur site, mall, siège, bots) passent par `autoFpErr` = règle physique
+ zone naturelle (`zoneNatAt`) : leurs choix restent raisonnables et déterministes, comme avant.

## Refus de pose : inventaire et décision
### Levés (interdictions arbitraires de zone)
| Refus d'avant | Où | Maintenant |
|---|---|---|
| « Zone urbaine uniquement : logements, commerces et tours se construisent en ville » | `footprintError` / `ZONE_MSG[1]` | posés partout sur la terre ferme ; hors ville : desserte, peu de clients (`retReach`), talents (`remTal`) |
| « Pas d'usine en ville… » | `ZONE_MSG[2]` | usine en ville permise, sans subvention, sol industriel cher au centre, pollution (smog) sur les logements voisins |
| « Pas de data center en ville… » | `DC_ZMSG` | seule l'emprise libre de 5×4 cases compte |
| « Les lignes électriques se posent en campagne ou au port, pas dans la ville » | `footprintError` | réseaux (pylône, câble, oléoduc) partout, quai compris |
| « Emplacement non constructible ici » (oléoduc hors campagne) | `footprintError` | levé |
| « Les fermes se construisent en campagne » | `footprintError` | ferme sur toute terre ferme (sol cher en ville : prix agricole du terrain) |
| « Hypermarché : trop grand pour le centre dense… » | `periOk` / `periMsg` | conseil au survol, placements auto en périphérie (BAREME_TAILLES.md mis à jour) |
| « Cette case est une forêt / une terre agricole : réserve-la… » | `footprintError` | **défrichement payant** (`CLEAR_COST` : 2 500 $ la forêt, 900 $ le champ, × inflation), jamais la dernière forêt ou terre de sa sorte |
| « Campagne : aplanis le terrain d'abord (Terrassement), puis zone-le » | `zoneErr` | la campagne se zone : l'aplanissement est commandé avec le zonage (`proZoneRural`, permis puis travaux, zonage appliqué à la livraison, champ facultatif `zq`) |
| « Zone industrielle : seulement sur les terrains créés ou au port ; le centre-ville reste urbain » | `zoneErr` | levé (la case garde sa zone : pas de subvention en ville) |
| « Zone du port : réservée à l'industrie » | `zoneErr` | levé |
| « Un permis de voirie exige la caste Promoteur ou une entreprise de BTP » | `proRoadErr` | permis payant pour tous (`proRoadFee`, moins cher pour le promoteur) |
| « Terrassement : il faut une entreprise de BTP ou la caste Promoteur » | `proTerra` | un entrepreneur fait les travaux (tarif × 1,6 sans BTP, déjà dans `proAccess().k`) |

### Gardés (impossibilités physiques), message clair et voie payante
| Refus | Message | Voie payante |
|---|---|---|
| Mer | « Mer : remblaie-la d'abord (outil Terrassement, jusqu'à 4 cases du rivage), puis construis. » | remblai / poldérisation |
| Quai du port (bâtiment autre qu'un terminal) | « Quai du port : réservé à l'amarrage des navires… Construis juste derrière, en zone portuaire (subventionnée). » | zone portuaire juste derrière |
| Terminal portuaire hors du quai | « Un terminal portuaire s'amarre sur le quai… » | — (amarrage) |
| Case occupée | « Case occupée. » | rachat (`acqPlan` : immeubles de la ville, négociation avec un rival) |
| Bâtiment public | « Bâtiment public : la mairie ne le vend pas. » | — |
| Rue | « C'est une rue : construis à côté. » | — |
| Gisement minier sous un bâtiment ordinaire | « Cette case est un gisement minier : réserve-la à une mine ou une carrière. » | — (la mine) |
| Extracteur sans gisement, gisement épuisé | inchangés | — |
| Ferme concurrente (PNJ, rival) | inchangé | — (pas d'expropriation) |
| Station loin de toute route | « Une station se pose au bord d'une route… » | poser une route (outil Route) |
| Terrassement : quai, gisement, ferme d'autrui, mer trop profonde, terrain non contigu | inchangés | — |
| Zonage de campagne non contigu à la ville ou à une case déjà commandée | « Campagne : zone en partant d'une case contiguë… » | zoner de proche en proche |

## Le coût réel de l'éloignement (marché, pas des murs)
- **Desserte** (`dessField`, `dessPlan`, `dessBuild`) : un bâtiment sans route à portée reçoit sa route jusqu'au réseau public, posée avec lui, à ta charge :
  route (120 $/case) + réseaux électricité et eau `DESS_UTIL` = 2 400 $/case, × inflation. Champ de distance déterministe (campagne libre et tes routes, jamais à
  travers la ville bâtie). Sans trésorerie suffisante, le bâtiment est posé seul (comme avant) avec le chiffrage de la desserte manquante.
- **Salariés** (`remWm`) : hors des zones aménagées, prime de trajet jusqu'à +20 % des salaires à 30 cases de la ville (fermes, mines, puits, réseaux et stations exclus).
- **Talents et clients** (`remTal`) : bureaux techno, banque, R&D en campagne : recettes × 1 / (1 + distance / 15).
- **Clientèle d'un commerce** (`retReach`) : hors de la ville, la part des ménages qui font le trajet = 1 / (1 + distance / 4) (le spécialiste attire de plus loin,
  exposant 1 − zone de chalandise) ; elle réduit la capacité d'accueil (`c._cap`) et l'attrait (`c.pw`). En ville : 1, rien ne change.
- **Subventions** inchangées et levier central : aide à la construction, taxe locale et emploi en zone portuaire et industrielle (`znBuildAid`, `znOf`) ;
  `znOf` exclut désormais les commerces (un magasin posé au port ne touche aucune aide de zone), stations ajoutées à `ZN_NOAID`.
- Tout est au survol (`siteFreeHTML`) : subvention ou son absence, défrichement, desserte (cases et coût), prime de trajet, talents, clientèle, conseil centre dense.
  Le devis (`siteInfo.total`) compte défrichement et desserte ; `bestSite` aussi.

## Stations au bord de la route (nouveaux types `sfuel`, `scharge`)
- Station-service 85 000 $ (2 emplois), bornes de recharge 60 000 $ (1 emploi, palier 1) : moins chères que le petit marché (110 000 $), 1 case, aucune zone requise,
  pas de subvention ; la seule condition est de toucher une route (publique ou la tienne) : la route voisine la dessert, aucune desserte à payer.
- Économie (`roadFlow`, `fuelQuote`, `fuelDay`) : flux de passage de la route touchée (part des habitants : axe ville-port 12 %, départementale 3,5 % décroissant avec
  la distance, avenues 2 % + 6 % × fréquentation, port 4 %, chemin privé 0,4 %) × part qui s'arrête (2 % ; recharge 3 % × part des véhicules électriques, 10 %
  au départ, +3 points par an, 40 % au plus), partagé avec les stations du même genre à moins de 9 cases (les tiennes et celles de la ville), plafonné par les pompes
  (420 pleins/jour, 110 recharges, × niveau × effectif). Carburant acheté au prix de gros (cours du pétrole), électricité au prix du réseau + acheminement ; boutique.
- Mesures (graine du test, ville de 61 000 habitants, jour 30) : station sur l'axe ville-port 147 pleins/j, EBE ≈ 720 $/j (retour ≈ 120 jours) ; bornes à côté 24
  recharges/j, EBE ≈ 50 $/j (le marché électrique grandit avec les années) ; station de départementale 33 pleins/j, EBE −45 $/j. Seconde station à 4 cases :
  part captée 62 %. Le marché place les stations : grand axe, loin des autres.
- Sprites : ceux des stations de la ville (`station_service`, `station_recharge_electrique`), enseignes STATION-SERVICE / RECHARGE (code), menu Commerce >
  « Au bord de la route ». Fiche : passage, concurrence, pleins ou recharges, marge brute, diagnostic (saturée, peu de passage).

## IA (rivaux) et bots
Les rivaux posent leurs tours sur les lots de la ville (`rivTower`) et comptent dans l'occupation des zones (`znRivalSettle`) : ils ne passent pas par
`footprintError`, rien ne change pour eux. Les placements automatiques et les bots restent dans leur zone naturelle (`autoFpErr`, port d'abord pour l'industrie).
Suite possible : laisser les rivaux ouvrir des stations sur les grands axes (même `fuelQuote`).

## Emprunté (principe) et conçu en propre
Principe emprunté aux jeux de gestion urbaine : zones incitatives plutôt que zones obligatoires, coût de viabilisation. Conçu en propre : desserte posée avec le
bâtiment par un champ de distance, prime de trajet, clientèle décroissante hors de la ville, stations vivant du flux de la route touchée et de la concurrence.

## Tests ajustés parce que la règle a changé volontairement
| Test | Avant | Maintenant |
|---|---|---|
| t32 promoteur (zonage) | refus de zoner la campagne et l'industrie en ville | campagne zonable avec son aplanissement (pas de refus « aplanis d'abord »), industrie zonable en ville |
| t32 promoteur (voirie) | les castes sans BTP refusées | aucune caste exigée (seules les règles physiques restent) |
| t46 e-commerce | entrepôt en ligne refusé en ville | aucun refus de zone en ville (posé au port, son emplacement naturel) |
| t48 valeur du terrain | usine refusée en ville | usine permise en ville ; placement automatique toujours au port d'abord |
| t56 data center | aucune case urbaine ne l'accepte | aucun refus de zone ; seule l'emprise libre 5×4 compte |
| t58 tailles | hypermarché refusé au centre | plus de refus « centre dense » ; posé en périphérie (≥ 12 cases) ; `sfuel`, `scharge` au barème |

## Sauvegarde
`wse-city-v8` inchangée : champs facultatifs seulement (`zq` sur une commande de terrassement, `c._fq` relevé de la station). Une ancienne sauvegarde se recharge
intacte : rien n'est migré, les bâtiments restent où ils sont. Aucun `rnd()` ajouté.

## Limites connues
- Les rivaux n'ouvrent pas encore de stations ; seules les stations de la ville (3 stations-service, 2 bornes) font concurrence.
- La recharge ne pèse pas encore sur la demande d'électricité du réseau (`S._pDem`).
- La desserte relie au réseau public le plus proche par la campagne ; elle ne traverse pas la ville bâtie (une case intérieure d'îlot reste « non reliée » comme avant).

## Résultats des tests (lancés un par un, branche `liberte-construire`)
t120 20 PASS · t01 7 · t05 6 · t44 45 · t96 19 · t97 12 · t98 30 · t102 35 · t110 24 · t27 46 · t33 35 · t46 21 · t48 29 · t58 28 · t77 18 (0 FAIL).
t32 : 45 PASS, 1 FAIL « rachat refusé faute de trésorerie » ; t56 : 19 PASS, 6 FAIL (rentabilité, fiche du campus) : ces échecs existent à l'identique sur
la branche de départ (`city.html` de f298ccc rejoué avec `WSE_URL`), sans lien avec les règles de pose.
