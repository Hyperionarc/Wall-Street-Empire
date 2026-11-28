# Journal du responsable Nautisme (plaisance, bande marine, construction navale)

## Mission (Rémy)
« Rajoute un port de type PLAISANCIER, parce que là je vois des yachts, c'est très bien. Dans ce port plaisancier, rajoute un peu de BANDE MARINE dans la carte.
On permettra de faire construire des yachts et des bateaux aux joueurs, et donc de proposer ce genre de produit dans un CHANTIER NAVAL où on pourra construire
à la fois des cargos, des pétroliers et des bateaux plaisanciers. »

Responsabilité : la mer vit aussi par la plaisance et le joueur peut bâtir une industrie navale cohérente avec l'économie.
Indicateur : `tools/tests/t124_nautisme.js` (16 vérifications). Branche `nautisme` (depuis `ccr-d9ba3623-415kh0`, a03391f). Les noms de fonctions font foi.
Périmètre des autres agents non touché : terminal à conteneurs (décor du port, `portBerthDraw`, `EXP_PORT`), panneau du Mall, vente aux commerces.

## 1. Bande marine : la baie de plaisance
- `coastX` devient `coastX0` (côte d'origine) + une baie au nord du port, lignes 17 à 23 (`BAY_X`) : le rivage recule jusqu'à x = 77, une anse d'environ 60 cases
  d'eau ouverte à l'est sur la mer, hors du terminal à conteneurs (y 54-84), au bord de la forêt du nord. Cases choisies parce qu'elles étaient vides sur la carte
  d'origine (seuls une case de granulats, une case d'hévéas et quelques arbres de la forêt disparaissent ; les gisements sont générés sans tirage décalé).
- `BAY.on` est réglé AVANT `buildZones` : `newCity` (toute nouvelle partie, champ `S.bay = 1`) et `load` (`d.bay`, champ facultatif). Une ancienne sauvegarde
  (sans `bay`) garde exactement sa côte, son port, son aéroport et ses chaînes (t124, dernière partie).
- Chemin d'accès `BAY_ROADS` (72, 23-27 puis 73-78, 23) depuis la départementale 72.
- Port de plaisance municipal (`TOWN_MAR`, cases 79-81 de la ligne 23) : capitainerie à vigie, atelier, bateaux sur bers à terre, trois pannes vers le nord avec
  catways et bateaux amarrés selon l'occupation du marché. Bâtiment public : la mairie ne le vend pas (`TOWN_MAR_MSG`) ; la route de desserte ne le traverse pas.

## 2. Port de plaisance (`marina`, 2×2, 1,8 M$, 8 emplois, menu Commerce > Plaisance)
- Pose : n'importe où sur la terre ferme qui touche la mer (`navWaterDir` : la face qui touche le plus de cases de mer). Aucune zone imposée, pas d'aide de zone
  (`ZN_NOAID`) : un loisir, pas de l'industrie. Desserte et défrichement payés comme partout (liberté de construire).
- Clientèle : flotte de plaisance de la région `S.nav.pf` (≈ 2,5 bateaux pour 1 000 habitants-équivalents au départ, `NAV_PF0`), alimentée par les achats de
  bateaux (chez toi ou à l'étranger), diminuée par les fins de vie (25 ans). 70 % veulent une place de port (`NAV_BERTH_SH`).
- Prix de marché du loyer d'une place (`A.pr`) : `NAV_R0` × inflation × revenu réel^0,8 × humeur × rareté^0,35 (demande ÷ places de la région + ports de la côte),
  lissé sur 10 jours. Aucun prix administré : il monte avec la richesse de la ville, l'humeur et la rareté des places ; garde-fou compté `NAV2` sur le rapport de tension.
- Partage : tes ports, le port municipal (s'il existe) et les autres ports de la côte (option extérieure, `NAV_OUT`) ; poids = places × attrait (niveau,
  abri de la baie, distance à la ville, effectif) × (ton loyer / marché)^−2,5. Le joueur règle son loyer (±5 %).
- Recettes : loyers, carburant nautique (marge 22 % sur le cours du pétrole), entretien (marge 55 %), flotte de location (voiliers achetés au prix mondial, ou
  construits au prix de revient par ton chantier, revendus 70 %) dont le taux de location suit la saison, l'humeur et le revenu.
- Mesure (t124, ville de départ, 260 jours) : 59 places louées sur 60, loyer de marché 56 $/j (≈ 1 700 $/mois), 4 500 $/j de recettes ; sur 720 jours, résultat
  d'exploitation (salaires et entretien compris) ≈ 1,4 M$, soit ≈ 0,24 M$ par an de jeu (120 j) pour 1,8 M$ investis : un actif patrimonial lent, comme une vraie marina.

## 3. Chantier naval (`shipyd`, 3×3, 7,5 M$, 60 emplois, menu Industrie > Naval)
- Pose : au bord de l'eau (même règle). En zone portuaire, il touche l'aide de zone de l'industrie (incitation, pas obligation).
- Catalogue `NAV_SHIPS` : voilier de croisière (12 m, 24 j), yacht à moteur (24 m, 60 j), cargo porte-conteneurs (140 m, 100 j), pétrolier de produits (180 m, 115 j).
  Nomenclatures (Guide du fabricant > Navires) en part de la valeur des matières : verre et plastique et chimie (composites et résines, dérivés du pétrole),
  textiles techniques (voiles), planches (teck, contreplaqué), inox (accastillage), moteurs thermiques et électriques, câbles, cartes électroniques, écrans,
  peintures, mousse, tissus, LED, céramique (aménagement intérieur des yachts), acier, acier galvanisé, pièces en caoutchouc. Rien de nouveau dans `GOODS` :
  ce sont les biens existants, donc les chaînes du joueur (fonderie, plasturgie, électronique…) alimentent directement le chantier.
- Lancement de produit : « Concevoir » (R&D : coût et jours par modèle), puis « Améliorer les plans » (génération +1, qualité +10, jusqu'à 4). Qualité du navire =
  plans + formation du chantier ; marque navale `S.nav.br` (+3 par plaisance livrée, +2 par navire de commerce, −4 en retard) ; fidélité des acheteurs locaux.
- Prix : le joueur fixe son prix en % du prix mondial (±5 %). Le prix mondial `navWorldPx` est le coût des chantiers étrangers : intrants au cours mondial
  (`marketBounds(g).wld`), main-d'œuvre mondiale, plus leur marge et leurs frais (25 %). Marché, pas barème.
- Fabrication à la commande (file `S.nav.ord`, nouveau mécanisme : le moteur de production de série n'est pas touché) :
  appels d'offres déterministes (intensité accumulée, `hash`) ; l'acheteur compare ton offre (prix, qualité, marque, délai annoncé selon ta file, fidélité, vitrine
  si tu as un port de plaisance) à `NAV_NF` = 2 chantiers étrangers ; si tu gagnes, la commande entre au carnet du chantier le moins chargé. Avancement FIFO dans la
  limite des cales (2 × niveau ; voilier ¼ de cale, yacht ½, cargo et pétrolier 1), au rythme de l'effectif. Matières prises dans ton stock (ta chaîne) sinon achetées
  au cours local, ou à la parité d'importation quand le marché local est plus cher ; l'achat local entre dans la demande du marché (`want`). Main-d'œuvre de
  chantier au salaire de marché.
- Argent : acompte 20 % à la commande, 30 % à la mise à l'eau (60 % d'avancement), solde à la livraison encaissé à 30 jours (file des créances `S.ar`, via
  `S._navAR`). Le chiffre d'affaires est reconnu à la livraison (contrat achevé) ; les acomptes sont des avances (hors compte de résultat), retirées à la livraison.
  Matières et main-d'œuvre sont payées chaque jour : l'en-cours monte, le BFR (en-cours − acomptes + créances) est affiché dans la fiche ; la valorisation compte
  l'en-cours net des acomptes (`evaluate`). Le crédit de la banque reste le moyen de le financer.
- Mesures (t124, prix 80 % du mondial pour les yachts et cargos, 260 jours) : 19 commandes (voiliers, 2 yachts, 2 cargos), délais tenus (cargo commandé jour 73,
  livré jour 175), BFR d'un cargo à la mise à l'eau ≈ 8,8 M$, CA 41 M$, 8,9 M$ de créances. Sur 720 jours au prix mondial : coût de revient 80-86 % du prix pour
  les voiliers, 87-91 % pour les yachts, 85-93 % pour cargos et pétroliers (droits, fret, salaires locaux, inflation pendant un contrat à prix ferme) ; le chantier
  gagne ≈ un tiers des appels d'offres de plaisance quand sa marque est faite. Marges minces et capital immobilisé : c'est le métier ; l'avantage vient de ta chaîne
  intégrée (intrants à ton coût) et de ta marque (prix plus haut).

## 4. Débouchés et liens avec l'économie
- Plaisance locale : `NAV_LUX` = 12 % du budget de luxe des ménages (budget fermé, `HD.R × HD.wl`) va aux bateaux neufs, × (revenu réel / sa moyenne sur 90 jours)^4 :
  un achat durable qu'on reporte en récession. Plaisance étrangère : 10 voiliers et 3 yachts par an au cycle près (× (1 + 14 × écart du cycle)).
- Budget fermé : ce que les ménages paient chez toi (places, carburant, entretien, la moitié de la location, yachts et voiliers livrés aux habitants), lissé sur 30 jours
  (`navHH`), est retiré de leur budget de luxe dans `hhDemand` (garde-fou `NAV1` à 50 %). Sans activité nautique : aucun effet sur la demande existante.
- Marine marchande : 3 cargos et 2 pétroliers par an en appels d'offres (dont 40 % d'armateurs locaux : armateurs PNJ inventés `NAV_OWNERS` ou rivaux IA qui ont la
  trésorerie, débités de l'acompte, du versement et du solde), × cycle (1 + 9 × écart), × trafic du port, × cours du pétrole^½ pour les pétroliers.
- Lien choisi avec le commerce maritime : la flotte marchande locale en service (`S.nav.mf`, navires des armateurs locaux, livrés par toi ou par l'étranger) ajoute
  3 % par navire au débit portuaire quotidien `tp` de l'export du surplus (au plus +45 %, `navPortK`). `EXP_PORT`, le taux d'export et les chaînes ne changent pas.
- Cycle : en récession profonde, plaisance ×0,38 contre ×0,60 pour la marine marchande (t124) ; biens de première nécessité inchangés.

## 5. Visuel (vectoriel, style des bâtiments procéduraux ; aucun texte dans les images)
- Navires dessinés dans le plan de la carte avec un cap (`navBoat`) : la proue est toujours à l'avant (pas de vues à quatre directions). Voilier (voiles
  affalées à quai), yacht (bande vitrée, flybridge), cargo (château arrière, conteneurs), pétrolier (tuyauteries) ; coque apprêtée et membrures sur cale,
  superstructure qui monte pendant l'armement.
- Bateaux qui entrent et sortent : boucle fermée par port (deux voies, deux demi-tours en arcs), cap = tangente (t124 : écart max 0,9°) ; relevés dans l'audit
  d'orientation (`oriRec('navire', 'pl_…')`).
- Chantier : hangar de coque, cales de lancement latéral avec tins, grue portique Goliath jaune à chariot animé, navires à flot au quai d'armement, navire livré
  à quai 6 jours. Les sprites existants du port (`SHIP_SPR`) restent au large ; commande d'assets : `tools/factory_ai/RETOURS.md` (COMMANDE Nautisme n°1).
- Guide du fabricant : classe « Navires » (4 fiches, nomenclature, prix mondial, délai, paiements, clientèle) avec une image vectorielle (`navSVG`).
- Sobriété : aucun pop-up ; commandes, mises à l'eau, livraisons au journal ; détails dans les fiches.

## Captures (deviceScaleFactor 2)
- `captures/nautisme_baie_large.jpg` : la baie (port municipal, ton port de plaisance, chantier sur la côte, bateaux en mouvement).
- `captures/nautisme_marina.jpg` : port de plaisance du joueur (capitainerie, atelier, bateaux à terre, pannes).
- `captures/nautisme_port_municipal.jpg` : port de plaisance municipal sur la rive sud.
- `captures/nautisme_chantier_construction.jpg` : chantier naval, pétrolier sur cale (coque apprêtée), yacht à flot en armement.
- `captures/nautisme_chantier_livre.jpg` : cargo livré à quai, yacht en armement, pétrolier sur cale.
- `captures/nautisme_fiche_chantier.jpg` : fiche du chantier (modèles, prix, carnet, BFR).
- `captures/nautisme_guide_yacht.jpg` : Guide du fabricant, yacht à moteur.

## Emprunté (principe) / conçu
Principe emprunté à la construction navale réelle et aux jeux de gestion : production à la commande, acomptes par étapes, appels d'offres, cale de lancement.
Conçu pour le jeu : baie déterministe, partage des places de port par attrait et loyer de marché, appels d'offres comparés aux chantiers étrangers au prix
mondial des intrants, budget fermé de la plaisance, lien flotte marchande → débit du port, navires vectoriels orientés par leur cap.

## Sauvegarde
`wse-city-v8` inchangée : champs facultatifs `bay`, `nav` (modèles, carnet, marque, fidélité, flottes, accumulateurs) et, par bâtiment, `nv` (loyer, flotte de
location, dernière livraison). Ancienne sauvegarde : relue intacte, sans baie ni état nautique.

## Reste imparfait
- Vue intérieure (onglet Intérieur) du port de plaisance et du chantier : scène générique de bureaux.
- Coûts/mois et EBE de la fiche du chantier suivent la journée (un jour de livraison gonfle le CA, un jour sans livraison montre une perte) : le compte de
  résultat est en « contrat achevé » ; l'en-cours est dans la valorisation mais pas dans le compte de résultat.
- Les rivaux ne construisent pas de navires ni de ports de plaisance (ils en achètent).
- Un seul port municipal ; pas encore de concessionnaire nautique distinct (le port de plaisance du joueur sert de vitrine : +20 % d'attrait des yachts et voiliers vendus aux habitants).
- Bateaux vectoriels faute de sprites de plaisance orientables (commande d'assets passée).

## Tests (lancés un par un)
Voir la section suivante, mise à jour en fin de passe.
