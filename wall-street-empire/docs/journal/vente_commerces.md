# Journal du responsable Vente aux commerces (B2B aval)

Domaine : tout commerce existant qui n'est pas au joueur (commerces de quartier de la ville ; plus tard ceux du Mall et des rivaux) est un DÉBOUCHÉ où le joueur référence ses produits.
Branche : `vente-commerces` (depuis `ccr-d9ba3623-415kh0`, HEAD a03391f). Les noms de fonctions et de constantes font foi (préfixe `bsh`).

## Constat (Rémy)
Clic sur une pharmacie de la ville : la fiche ne proposait que « Racheter pour louer / Racheter et raser / Fermer ». « Je suis censé pouvoir VENDRE dans ce commerce spécialisé »,
puis « et donc réellement l'ouvrir » : entrer dans le commerce comme dans ses propres magasins, voir ses rayons, ses fournisseurs, ses prix, sa fréquentation, et y proposer ses produits.

## Ce qui est livré
- **Ouvrir le commerce** (`bshOpen`) : « Ouvrir » sur l'étiquette (et donc le double-clic), ou « Vendre ici » dans la fiche de l'immeuble, entre dans le commerce. C'est la fenêtre des magasins
  du joueur (`#bview` en mode `shop`), pas une nouvelle fenêtre : intérieur animé avec visiteurs (scène `mkRetail` sur une cellule de substitution : pharmacie, boutique de mode ou petit
  marché, enseigne au nom du commerce), grille d'emplacements, panneau d'action à droite, cartes fournisseurs (`.shsc`), indicateurs. En-tête « Commerce de la ville · lecture seule ».
  « Racheter l'immeuble… » renvoie à la fiche existante (racheter pour louer, pour raser).
- **Rayons** : chaque commerce a une catégorie (`BSH_T`) et un nombre d'emplacements : pharmacie 10 (médicaments, hygiène, beauté), boulangerie 4 (pain, pâtes, biscuits, confiserie),
  café 4 (boissons, lait, biscuits), restaurant 6 (viandes, fromages, pain, œufs, huile, vin), boutique de mode 8 (prêt-à-porter). Un emplacement porte un produit que quelqu'un livre dans la ville
  (`bshCarried`) ; un emplacement libre attend un produit que personne ne livre encore (ton produit y entre sans concurrent, face à l'offre standard de la ville).
- **Fournisseurs actuels** (lecture seule) : les mêmes offres que le réseau du joueur (`netOffers` : grossiste PNJ, import par le port, sociétés rivales), plus le grossiste répartiteur pour les
  médicaments. Au plus `BSH_K` = 3 fournisseurs par rayon ; carte : prix de gros, qualité, marque, part du rayon ; « en attente » : le premier fournisseur qui prendrait ta place.
- **Vendre ici** : sur un emplacement, choisir un de tes produits lancés de la catégorie, régler le prix de gros (±5 %) et le volume (articles/jour au plus) ; la carte affiche en direct le verdict
  de l'acheteur (« accepterait : … » / « refuserait : motif »), les ventes prévues et le prix de gros le plus haut qu'il accepterait aujourd'hui (`bshMaxPx`). « Proposer le référencement ».
- **Référencement** : carte « Toi (référencé) » dans le rayon, badge « Toi » sur l'emplacement ; livré hier, commandé, taux de service, prix, volume, créances ici, couverture de ton stock, ancienneté ;
  boutons Prix ±5 %, Volume ±, « Retirer le produit ». Journal : « Référencement obtenu », « refusé », « perdu » (aucune fenêtre surgissante).
- **Survol** : « Vend : médicaments, hygiène, beauté · tes produits : N » dans l'étiquette de la carte (`mapLabel`, `selInfo`).

## Modèle économique (conçu en propre)
- **Demande du commerce** (`bshDem`) = demande de la ville pour le produit (`mkDemandDay`, donc `pkDem` et le budget fermé des ménages) × part des commerces de la ville (`pkShare` : `S._nd.sh[pk].npc`,
  qui intègre pw, attractivité, rivaux faucons et colombes ; hors biens courants : ce que ni toi ni les rivaux ne servez) × **zone de chalandise** (`bshZone` : part des habitants à moins de
  `BSH_R` = 6 cases, logements de la ville et les tiens) × part captée par ce type de commerce (pharmacie : 55 % des médicaments de sa zone, 20 % de l'hygiène ; boulangerie : 35 % du pain…).
  Cafés et restaurants vivent du **circuit de la restauration** (`RHD_SH`, choc sectoriel `ichShockM` compris).
- **Partage du rayon** : entre les fournisseurs retenus, au prorata de l'attrait client de leur offre (`attractiveness` avec le prix de rayon, la qualité, la marque, la fidélité).
- **Acheteur** (`bshEval`, déterministe) : note = attrait client × (prix de référence ÷ prix de gros)^`BSH_E` (1,3 : sa marge) × fiabilité (ton taux de service) × distance (au-delà de 20 cases).
  Rayon incomplet : accepté si la note atteint 85 % du meilleur fournisseur ; rayon complet : il faut battre le dernier fournisseur retenu, avec une prime d'entrée `BSH_HUR` (6 %, réduite par
  l'ancienneté de la relation, ±2 % d'humeur de l'acheteur tirée par `hash` par semaine) ; emplacement libre : 80 % de l'offre standard de la ville.
  Refus préalables : produit hors catégorie ou non lancé, disponibilité insuffisante (stock + production < 5 jours du volume proposé), ruptures (< 80 % de service), rayons pleins.
  Motif lisible : « trop cher face à X : a $ contre b $ », « qualité insuffisante : q contre q' chez X », « marque trop peu connue », « trop loin de tes usines et entrepôts », sinon « offre moins intéressante ».
- **Revue** (`bshReview`, tous les 7 jours, date propre à chaque commerce) : tu restes si ta note × (1,08 + 0,07 × ancienneté) vaut celle du fournisseur en attente et si ton taux de service
  reste au-dessus de 70 % ; sinon « il change de fournisseur : X est meilleur » ou « rupture fréquente ». Une hausse de prix est renégociée (même règle) ; une baisse est acceptée.
- **Livraison et argent** (`bshStep`, chaque jour, avant la vente en gros anonyme) : livré = min(volume, demande du commerce × ta part, ton stock) ; transport à ta charge
  (`TRANS` × distance de ton usine ou entrepôt le plus proche, dans les frais de transport) ; facturé au prix de gros, **encaissé à 30 jours** : la valeur entre dans `S._b2b.v`, donc dans
  `arStep` (créances `S.ar`, BFR, fiche société) ; « Tes créances ici » = livraisons des 30 derniers jours.
- **Intégration à la vente en gros existante** : `b2bStep` (anonyme) reçoit les commandes des grossistes × ta part × (1 − `bshCut`) : la part des commandes des commerces où tu es référencé
  en est retirée. Le « B2B de ville » = référencements nommés + reste anonyme (mesuré ci-dessous : total inchangé à 3 % près).
- **Rivaux** : leurs offres du réseau (sociétés concurrentes de la ville, `netRivMakes`) occupent les rayons comme fournisseurs, avec les mêmes règles de note ; ils peuvent te prendre ta place à la revue.
- Garde-fous instrumentés : `bnd('VS1')` (part des commerces hors biens courants, 0,05-1), `bnd('VS2')` (part retirée de la vente en gros anonyme, 0-0,95). Aucun prix ni marge administrés.
- Sauvegarde : champ facultatif `bsh` de `wse-city-v8` (`bshSave` / `bshSan`) ; une ancienne sauvegarde se recharge sans référencement. Aucun `rnd()` (hash seulement).

## Mesures (ville de 100 000 habitants, jour 20 à 35, bots de test)
- 14 commerces de quartier qui achètent : 3 restaurants, 3 cafés, 3 boulangeries, 3 boutiques de mode, 2 pharmacies. Zones de chalandise : 7 à 26 % des habitants.
- Pharmacie (40, 39) : savon 60 articles/j, maux de tête 41, antibiotiques 21 ; ton savon référencé à 1,61 $ (seuil de l'acheteur 1,67 $, prix catalogue 1,69 $) prend 31 % du rayon face à DiscountCo et Mega Mart : ≈ 19 savons/j.
- Boulangeries : 3 800 à 5 700 baguettes/j chacune (zones larges du centre) ; ton pain accepté jusqu'à ≈ 0,85 $ (référence 0,78 $) : il remplace Mega Mart dans le rayon.
- Pain référencé dans 3 boulangeries et 3 restaurants : 5 110 articles/j, 4 221 $/j facturés, 512 $/j de transport ; vente en gros totale 16 735 $/j avant → 17 294 $/j après (dont 4 221 $ nommés) :
  la somme reste du même ordre (le reste anonyme diminue de 21 % des commandes).
- Trop cher (×3) : « trop cher face à Alpina (grossiste) : 5,07 $ contre 1,65 $ » ; qualité 8 : « qualité insuffisante : 8 contre 50 chez Alpina (grossiste) ».

## Captures (Playwright, 1280×800, `WSE_SHOTS=docs/journal/captures node tools/tests/run.js t123`)
- `captures/vente_1_fiche.jpg` : fiche de la pharmacie de la ville avec « Vendre ici » à côté de « Racheter pour louer ».
- `captures/vente_2_rayons.jpg` : la pharmacie ouverte (intérieur, 9 / 10 emplacements, fournisseurs du rayon en cartes, lecture seule).
- `captures/vente_3_reference.jpg` : savon référencé (carte « Toi (référencé) », badge « Toi »).
- `captures/vente_4_ventes.jpg` : après 8 jours : livré, taux de service, créances ici, indicateurs du commerce.

## Tests
`t123_vente_commerces` (22 vérifications) : « Vendre ici » sur un commerce de la ville ; étiquette de survol ; ouverture dans la fenêtre des magasins (grille, cartes, lecture seule, intérieur avec visiteurs) ;
refus « trop cher » et « qualité insuffisante » avec motif ; déterminisme et seuil de prix ; proposition par clics réels ; ventes réelles ; créances à 30 jours ; part retirée de la vente en gros anonyme ;
indicateurs ; sauvegarde et rechargement ; ancienne sauvegarde ; retrait (plus de livraison) ; boulangerie et restaurant ; aucun NaN ; 0 erreur de page.
Test adapté : `t50_ville_vivante` « Ouvrir » sur un restaurant de la ville entre maintenant dans le commerce (fenêtre des magasins, titre RESTAURANT EN TERRASSE) au lieu d'ouvrir la fiche
de l'immeuble ; la fiche reste accessible par « Racheter l'immeuble… ».

## Emprunté comme principe / conçu en propre
Emprunté (principe) : un fabricant propose ses produits à des détaillants indépendants qui gardent le meilleur fournisseur. Conçu en propre : zone de chalandise par cases, part captée par type
de commerce de quartier, note de l'acheteur (attrait client × marge × fiabilité × distance), prime d'entrée et prime de fidélité selon l'ancienneté, revue hebdomadaire, motifs de refus,
intégration à la vente en gros anonyme et aux créances, réutilisation de la fenêtre des magasins du joueur en lecture seule.

## Ce qui reste imparfait
- Commerces du Mall et magasins des rivaux : pas encore ouvrables comme débouchés (le Mall appartient à un autre responsable ; les rivaux n'ont pas de bâtiment de magasin sur la carte).
  Un commerce de quartier racheté par un rival reste un débouché (même règle).
- Les ventes des rivaux dans ces rayons ne sont pas créditées à leurs comptes (ils occupent les rayons, leur chiffre d'affaires vient toujours de leur part de marché globale).
- Les commerces ne gardent pas de stock propre de ton produit (couverture et rotation du commerce : ≈ 2 jours, ceux du maillon « commerces » de la chaîne d'information).
- La disposition des services de quartier se recalcule chaque jour (`vvSvcMap`) : si la croissance de la ville déplace un commerce, le référencement est perdu (journal : « le commerce a fermé ou changé d'activité »).
- Sous 1 100 px de large, la fenêtre des magasins masque l'intérieur animé (règle existante des magasins).
