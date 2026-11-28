# Audit de couverture HD (passe 99)

Généré par `tools/audit_hd.js --md` : chaque élément est rendu seul dans un canevas dont `drawImage` est instrumenté ; la colonne « Sprite » donne le nom du PNG réellement dessiné. **VECTORIEL** = aucun sprite, dessin en code (repli). « HD + code » = sprite HD plus des détails animés en code (fumée, troupeaux, enseignes, chariots…).

Bilan : 162 éléments — HD 161 · VECTORIEL (+ petits sprites HD) 1.

## Bâtiments du joueur

| Élément | Rendu | Sprite HD dessiné | Avant (passe 98) | Note |
|---|---|---|---|---|
| Logements (niveau 0) (`res:n0`) | HD | `maison_n1` | maison_n1 |  |
| Logements (niveau 2) (`res:n2`) | HD | `immeuble_n1` | immeuble_n1 |  |
| Logements (niveau 4) (`res:n4`) | HD | `tour_logements` | tour_logements |  |
| Tour Tech (niveau 0) (`tech:n0`) | HD | `immeuble_bureaux_vitre` | immeuble_bureaux_vitre |  |
| Tour Tech (niveau 2) (`tech:n2`) | HD | `tour_tech` | tour_tech |  |
| Tour Tech (niveau 4) (`tech:n4`) | HD | `tour_tech` | tour_tech |  |
| Entrepôt (`wh`) | HD | `entrepot` | entrepot |  |
| Entrepôt logistique en ligne (`ewh`) | HD | `entrepot` | entrepot |  |
| Centrale électrique (`plant`) | HD | `centrale_charbon` | centrale_charbon |  |
| Centrale solaire (`solar`) | HD | `centrale_solaire` | centrale_solaire |  |
| Éolienne (`wind`) | HD | `eolienne` | eolienne |  |
| Centrale nucléaire (`nuclear`) | HD | `centrale_nucleaire` | centrale_nucleaire |  |
| Pylône / ligne aérienne (`pylon`) | HD | `pylone_electrique` | pylone_electrique |  |
| Centre de R&D (`rd`) | HD | `centre_rd` | centre_rd |  |
| Data center (niveau 0) (`dc:n0`) | HD | `data_center_campus` | VECTORIEL |  |
| Data center (niveau 2) (`dc:n2`) | HD | `data_center` | data_center |  |
| Data center (niveau 4) (`dc:n4`) | HD | `data_center` | data_center |  |
| Siège social (niveau 0) (`hq:n0`) | HD | `siege_hq_n1` | siege_hq_n1 |  |
| Siège social (niveau 2) (`hq:n2`) | HD | `siege_hq_n2` | siege_hq_n2 |  |
| Siège social (niveau 4) (`hq:n4`) | HD | `siege_hq_n3` | siege_hq_n3 |  |
| Banque (niveau 0) (`bank:n0`) | HD | `banque` | banque_neoclassique |  |
| Banque (niveau 2) (`bank:n2`) | HD | `banque` | banque_neoclassique |  |
| Banque (niveau 4) (`bank:n4`) | HD | `banque` | atlas Kenney |  |
| Puits pétrole (`well`) | HD | `puits_petrole` | puits_petrole |  |
| Mine de fer (`miron`) | HD | `mine_fer` | mine_fer |  |
| Mine charbon (`mcoal`) | HD | `mine_charbon` | mine_charbon |  |
| Mine cuivre (niveau 0) (`mcopper:n0`) | HD | `mine_cuivre` | mine_cuivre |  |
| Mine cuivre (niveau 2) (`mcopper:n2`) | HD | `mine_cuivre_niveau3` | mine_cuivre_niveau3 |  |
| Mine cuivre (niveau 4) (`mcopper:n4`) | HD | `mine_cuivre_niveau3` | mine_cuivre_niveau3 |  |
| Mine d'or (`mgold`) | HD | `mine_or` | mine_or |  |
| Mine de nickel-chrome (`mnicr`) | HD | `mine_nickel_chrome` | mine_nickel_chrome |  |
| Mine de bauxite (`mbauxite`) | HD | `mine_bauxite` | mine_bauxite |  |
| Mine de lithium (`mlithium`) | HD | `mine_lithium` | mine_lithium |  |
| Mine de zinc (`mzinc`) | HD | `mine_zinc` | mine_zinc |  |
| Mine de graphite (`mgraphite`) | HD | `mine_graphite` | mine_graphite |  |
| Puits de gaz naturel (`gwell`) | HD | `puits_gaz` | puits_gaz |  |
| Carrière de silice (`qsilica`) | HD | `carriere_silice` | carriere_silice |  |
| Carrière d'argile (`qclay`) | HD | `carriere_argile` | carriere_argile |  |
| Mine de sel gemme (`qsalt`) | HD | `mine_sel` | mine_sel |  |
| Mine de phosphate (`mphos`) | HD | `mine_phosphate` | mine_phosphate |  |
| Mine de potasse (`mpotash`) | HD | `mine_potasse` | mine_potasse |  |
| Ferme de blé (`fwheat`) | HD | `fwheat`, `fermier_seau` | fwheat, fermier_seau |  |
| Plantation de canne (`fsugar`) | HD | `fsugar` | fsugar |  |
| Plantation de coton (`fcotton`) | HD | `fcotton` | fcotton |  |
| Plantation d'hévéas (`frubber`) | HD | `frubber` | frubber |  |
| Vignoble (`fvine`) | HD | `fvine`, `vendangeur`, `vigneron_hotte` | fvine, vendangeur, vigneron_hotte |  |
| Culture de maïs (`fcorn`) | HD | `fcorn` | fcorn |  |
| Culture de colza (`frapeseed`) | HD | `frapeseed` | frapeseed |  |
| Élevage de bovins (`fcattle`) | HD | `fcattle`, `animal_vache`, `auge_foin`, `fermier_seau` | fcattle, animal_vache, auge_foin, fermier_seau |  |
| Élevage de poulets (`fchicken`) | HD | `fchicken`, `animal_poule`, `fermier_seau` | fchicken, animal_poule, fermier_seau |  |
| Élevage de porcs (`fpig`) | HD | `fpig`, `animal_cochon`, `auge_foin`, `fermier_seau` | fpig, animal_cochon, auge_foin, fermier_seau |  |
| Élevage de moutons (`fsheep`) | HD | `fsheep`, `animal_mouton`, `balles_foin`, `fermier_seau` | fsheep, animal_mouton, balles_foin, fermier_seau |  |
| Camp bûcherons (`logging`) | HD | `camp_bucherons` | camp_bucherons |  |
| Carrière de granulats (`qgravel`) | HD | `carriere` | carriere |  |
| Carrière calcaire (`qlime`) | HD | `carriere` | carriere |  |
| Entreprise de BTP (`btp`) | HD | `chantier_moyen` | chantier_moyen |  |
| Agence immobilière (`immo`) | HD | `agence_immo` | agence_immo |  |
| Fonderie d'or (`foundry`) | HD | `fonderie` | fonderie |  |
| Petite usine (`f1`) | HD | `usine_moyenne_f2` | usine_moyenne_f2 |  |
| Usine moyenne (`f2`) | HD | `usine_moyenne_f2` | usine_moyenne_f2 |  |
| Grande usine (`f3`) | HD | `usine_moyenne_f2` | usine_moyenne_f2 |  |
| Petit marché (niveau 0) (`s1:n0`) | HD | `petit_marche_n1` | petit_marche_n1 |  |
| Petit marché (niveau 2) (`s1:n2`) | HD | `petit_marche_n2` | petit_marche_n1 |  |
| Petit marché (niveau 4) (`s1:n4`) | HD | `petit_marche_n2` | petit_marche_n1 |  |
| Supermarché (niveau 0) (`s2:n0`) | HD | `bat_supermarche` | bat_supermarche |  |
| Supermarché (niveau 2) (`s2:n2`) | HD | `bat_supermarche_n2` | bat_supermarche_n2 |  |
| Supermarché (niveau 4) (`s2:n4`) | HD | `bat_supermarche_n3` | bat_supermarche_n3 |  |
| Hypermarché (niveau 0) (`s3:n0`) | HD | `bat_hypermarche` | bat_hypermarche |  |
| Hypermarché (niveau 2) (`s3:n2`) | HD | `bat_hypermarche_n2` | bat_hypermarche_n2 |  |
| Hypermarché (niveau 4) (`s3:n4`) | HD | `bat_hypermarche_n3` | bat_hypermarche_n3 |  |
| Terminal portuaire (`port`) | HD | `terminal_portuaire` | terminal_portuaire |  |
| Tour de location (niveau 0) (`off:n0`) | HD | `tour_bureaux` | tour_bureaux |  |
| Tour de location (niveau 2) (`off:n2`) | HD | `tour_bureaux` | tour_bureaux |  |
| Tour de location (niveau 4) (`off:n4`) | HD | `tour_bureaux` | tour_bureaux |  |
| Station média (`tv`) | HD | `station_tv` | station_tv |  |
| Équipement sportif (`sport`) | HD | `stade_sport` | stade_sport |  |
| Méga-usine (`f4`) | HD | `usine_f4_mega` | usine_f4_mega |  |
| Méga-centre commercial (niveau 0) (`s4:n0`) | HD | `bat_mega_centre_commercial` | mega_centre_commercial |  |
| Méga-centre commercial (niveau 2) (`s4:n2`) | HD | `bat_mega_centre_commercial` | mega_centre_commercial |  |
| Méga-centre commercial (niveau 4) (`s4:n4`) | HD | `bat_mega_centre_commercial` | mega_centre_commercial |  |
| Concession automobile (`sauto`) | HD | `concession_auto` | concession_auto |  |
| Maison du Numérique (`stech`) | HD | `boutique_high_tech` | boutique_high_tech |  |
| Maison de luxe (`slux`) | HD | `boutique_luxe` | boutique_luxe |  |
| Boutique de mode (`smode`) | HD | `boutique_mode_luxe` | boutique_mode_luxe |  |
| Pharmacie · drugstore (`spharma`) | HD | `pharmacie_quartier` | pharmacie |  |
| Maison et déco (`shome`) | HD | `maison_deco` | maison_deco |  |
| Sport et loisirs (`ssport`) | HD | `sport_loisirs` | sport_loisirs |  |
| Brico et outillage (`sbrico`) | VECTORIEL (+ petits sprites HD) | `voiture_ville_b` | voiture_ville_b |  |
| Station-service (`sfuel`) | HD | `station_service` |  |  |
| Bornes de recharge (`scharge`) | HD | `station_recharge_electrique` |  |  |

## Équipements publics

| Élément | Rendu | Sprite HD dessiné | Avant (passe 98) | Note |
|---|---|---|---|---|
| hospital (`mon:hospital`) | HD | `hopital_ville` | hopital |  |
| lycee (`mon:lycee`) | HD | `lycee` | ecole |  |
| college (`mon:college`) | HD | `college` | ecole |  |
| maternelle (`mon:maternelle`) | HD | `ecole_maternelle` | ecole |  |
| garderie (`mon:garderie`) | HD | `creche` | ecole |  |
| police (`mon:police`) | HD | `commissariat_ville` | VECTORIEL |  |
| fire (`mon:fire`) | HD | `caserne_pompiers` | VECTORIEL |  |
| hall (`mon:hall`) | HD | `hotel_de_ville` | mairie |  |
| telecom (`mon:telecom`) | HD | `station_tv` | station_tv |  |
| stadium (`mon:stadium`) | HD | `stade_sport` | stade_sport |  |
| stadium2 (`mon:stadium2`) | HD | `stade_sport` | stade_sport |  |

## Services de quartier

| Élément | Rendu | Sprite HD dessiné | Avant (passe 98) | Note |
|---|---|---|---|---|
| Restaurant en terrasse (`sv:restaurant_terrasse`) | HD | `restaurant_quartier` | restaurant_terrasse |  |
| Café de quartier (`sv:cafe_de_quartier`) | HD | `cafe_quartier` | cafe_de_quartier |  |
| Boulangerie (`sv:boulangerie`) | HD | `boulangerie_quartier` | boulangerie |  |
| Boutique de mode (`sv:boutique_mode`) | HD | `boutique_quartier` | boutique_mode |  |
| Pharmacie (`sv:drugstore`) | HD | `pharmacie_quartier` | drugstore |  |
| Barre HLM (`sv:barre_hlm`) | HD | `barre_hlm` | barre_hlm |  |
| Immeuble en construction (`sv:immeuble_en_construction`) | HD | `immeuble_en_construction` | immeuble_en_construction |  |
| Église (`sv:eglise_de_village`) | HD | `eglise_de_village` | eglise_de_village |  |
| Immeuble abandonné (friche) (`sv:batiment_abandonne`) | HD | `batiment_abandonne` | batiment_abandonne |  |

## Ville (PNJ)

| Élément | Rendu | Sprite HD dessiné | Avant (passe 98) | Note |
|---|---|---|---|---|
| house: (`house:#1`) | HD | `maison_pnj_a` | maison_pnj_a |  |
| house: (`house:#2`) | HD | `maison_japonaise` | maison_japonaise |  |
| house: (`house:#3`) | HD | `maison_de_ville_briques` | maison_de_ville_briques |  |
| res:bas (`res:bas#1`) | HD | `maison_de_ville_briques` | maison_de_ville_briques |  |
| res:bas (`res:bas#2`) | HD | `maison_moderne_cubique` | maison_moderne_cubique |  |
| off:bas (`off:bas#1`) | HD | `immeuble_bureaux_vitre` | immeuble_bureaux_vitre |  |
| res:bas (`res:bas#3`) | HD | `maison_moderne_cubique` | maison_moderne_cubique |  |
| off:bas (`off:bas#2`) | HD | `immeuble_bureaux_vitre` | immeuble_bureaux_vitre |  |
| off:bas (`off:bas#3`) | HD | `banque_neoclassique` | immeuble_pnj_b |  |
| res:moyen (`res:moyen#1`) | HD | `immeuble_londonien_briques` | immeuble_londonien_briques |  |
| park:bas (`park:bas#1`) | HD | `parc_urbain` | parc_urbain |  |
| res:moyen (`res:moyen#2`) | HD | `immeuble_art_deco` | immeuble_art_deco |  |
| res:moyen (`res:moyen#3`) | HD | `immeuble_londonien_briques` | immeuble_en_construction |  |
| off:moyen (`off:moyen#1`) | HD | `hotel_de_luxe` | hotel_de_luxe |  |
| off:moyen (`off:moyen#2`) | HD | `cafe_quartier` | cafe_de_quartier |  |
| res:tour (`res:tour#1`) | HD | `immeuble_en_construction` | immeuble_en_construction |  |
| off:tour (`off:tour#1`) | HD | `tour_bureaux_12_etages_a` | tour_bureaux_12_etages_a |  |
| off:moyen (`off:moyen#3`) | HD | `immeuble_pnj_b` | immeuble_pnj_b |  |
| park:bas (`park:bas#2`) | HD | `parc_urbain` | parc_urbain |  |
| park:bas (`park:bas#3`) | HD | `parc_urbain` | parc_urbain |  |
| res:tour (`res:tour#2`) | HD | `immeuble_residentiel_moderne` | immeuble_residentiel_moderne |  |

## Véhicules de la ville

| Élément | Rendu | Sprite HD dessiné | Avant (passe 98) | Note |
|---|---|---|---|---|
| veh_argent (`car:veh_argent`) | HD | `veh_argent` | veh_argent |  |
| veh_blanc (`car:veh_blanc`) | HD | `veh_blanc` | veh_blanc |  |
| veh_bleu (`car:veh_bleu`) | HD | `veh_bleu` | veh_bleu |  |
| veh_jaune (`car:veh_jaune`) | HD | `veh_jaune` | veh_jaune |  |
| veh_noir (`car:veh_noir`) | HD | `veh_noir` | veh_noir |  |
| veh_orange (`car:veh_orange`) | HD | `veh_orange` | veh_orange |  |
| veh_rouge (`car:veh_rouge`) | HD | `veh_rouge` | veh_rouge |  |
| veh_vert (`car:veh_vert`) | HD | `veh_vert` | veh_vert |  |
| voiture_ville_a (`car:voiture_ville_a`) | HD | `voiture_ville_a` | voiture_ville_a |  |
| voiture_ville_b (`car:voiture_ville_b`) | HD | `voiture_ville_b` | voiture_ville_b |  |
| veh_pickup (`car:veh_pickup`) | HD | `veh_pickup` | veh_pickup |  |
| veh_camionnette (`car:veh_camionnette`) | HD | `veh_camionnette` | veh_camionnette |  |
| camion_ville (`car:camion_ville`) | HD | `camion_ville` | camion_ville |  |

## Port et mer

| Élément | Rendu | Sprite HD dessiné | Avant (passe 98) | Note |
|---|---|---|---|---|
| navire n° 1 (`navire:0`) | HD | `navire_cargo` |  |  |
| navire n° 2 (`navire:1`) | HD | `port_navire_petrolier` |  |  |
| navire n° 3 (`navire:2`) | HD | `port_voilier` |  |  |
| navire n° 4 (`navire:3`) | HD | `port_navire_cargo_ne` |  |  |
| navire n° 5 (`navire:4`) | HD | `port_navire_vraquier` |  |  |
| navire n° 6 (`navire:5`) | HD | `port_ferry` |  |  |
| navire n° 7 (`navire:6`) | HD | `port_remorqueur_ne` |  |  |
| grue portique (`grue`) | HD | `grue_portique` | grue_portique |  |
| conteneurs (`conteneurs`) | HD | `conteneur_pile` | conteneur_pile |  |
| décor de quai (`quai`) | HD | `port_phare (dérivé)` | porcelaine_caisses |  |

## Fermes (détails)

| Élément | Rendu | Sprite HD dessiné | Avant (passe 98) | Note |
|---|---|---|---|---|
| auge_foin (`auge_foin`) | HD | `auge_foin` | auge_foin |  |
| fermier_seau (`fermier_seau`) | HD | `fermier_seau` | fermier_seau |  |
| balles_foin (`balles_foin`) | HD | `balles_foin` | balles_foin |  |
| vendangeur (`vendangeur`) | HD | `vendangeur` | vendangeur |  |
| vigneron_hotte (`vigneron_hotte`) | HD | `vigneron_hotte` | vigneron_hotte |  |

## Décor

| Élément | Rendu | Sprite HD dessiné | Avant (passe 98) | Note |
|---|---|---|---|---|
| arbre isolé (`arbre`) | HD | `arbre_isole_a` | arbre_isole_a |  |

## Mall central (animations)

| Élément | Rendu | Sprite HD dessiné | Avant (passe 98) | Note |
|---|---|---|---|---|
| clients et commerçants du marché (`mall:gens`) | HD | `poses/ouvrier_h2_marche`, `poses/ouvrier_f1_debout` |  |  |
| tour de parking (voitures) (`mall:parking`) | HD | `veh_jaune` |  |  |

## PNG HD présents mais absents de la carte

| Dossier | PNG | Embarqué dans city.html | Raison |
|---|---|---|---|
| factory_hd | `aeroport_terminal` | oui | aéroport : chantier d'un autre agent |
| factory_hd | `arbre` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| factory_hd | `armoire_electrique` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `bac_calcaire` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `bac_charbon` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `bac_gravier` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `bac_minerai_cuivre` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `bac_minerai_fer` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `bac_sable` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `barres_acier` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `bat_chai_vigne` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_chai_vigneron` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_drugstore` | non | ancienne pharmacie sans parking (17/11) : remplacée par pharmacie.png |
| factory_hd | `bat_ferme_bergerie` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_ferme_bovins` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_ferme_carrousel` | non | annexe de ferme non retenue (passe 87) |
| factory_hd | `bat_ferme_etable_traversante` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_ferme_hangar` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_ferme_moutons` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_ferme_porcherie` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_ferme_porcherie_long` | non | doublon de bat_ferme_porcherie_longue |
| factory_hd | `bat_ferme_porcherie_longue` | non | annexe non retenue (passe 87) |
| factory_hd | `bat_ferme_porcs` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_ferme_poulailler` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_ferme_poulailler_long` | non | annexe non retenue (passe 87) |
| factory_hd | `bat_ferme_poulets` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_ferme_stabulation_ronde` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_ferme_traite` | oui | annexe des fermes agrandies (dessinée quand une ferme grandit, passe 87 ; l'inventaire rend les fermes à leur taille de départ) |
| factory_hd | `bat_scierie` | non | pas de scierie dans le jeu (le camp de bûcherons a son sprite) |
| factory_hd | `bobine_acier` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `bobine_acier_couchee` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `bobine_cuivre` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `bobine_cuivre_couchee` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `bobine_fil` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `bobineuse_filature` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `boulangerie` | non | baguette géante sur le toit : remplacée par boulangerie_quartier (repli seulement) |
| factory_hd | `boutique_high_tech_n2` | non | niveau 2 de la boutique high-tech (pas de niveaux pour les spécialistes) |
| factory_hd | `boutique_mode` | non | cintre géant sur un toit rose : remplacée par boutique_quartier pour la ville (la boutique du joueur garde boutique_mode_luxe) |
| factory_hd | `brownstone_new_yorkais` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `buisson` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| factory_hd | `bureau_vitre` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `cafe_de_quartier` | non | tasse géante sur un toit brun (pancarte « cartoon ») : remplacé par cafe_quartier (repli seulement) |
| factory_hd | `caisse_verre` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `caisses_composants` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `camion_blanc` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `camion_blanc_face` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `camion_blanc_ouvert` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `camion_bleu` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `camion_bleu_face` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `camion_bleu_ouvert` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `camion_rouge` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `camion_rouge_face` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `camion_rouge_ouvert` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `chalet_savoyard` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `chariot_elevateur` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `chariot_elevateur_charge` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `coin_mur_e` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `coin_mur_n` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `coin_mur_s` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `coin_mur_w` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `concession_auto_n2` | non | niveau 2 de la concession (pas de niveaux pour les spécialistes) |
| factory_hd | `convoyeur_coin` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `convoyeur_droit` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `convoyeur_vide_coin_ne` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `convoyeur_vide_coin_nw` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `convoyeur_vide_coin_se` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `convoyeur_vide_coin_sw` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `convoyeur_vide_droit_nord_est` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `convoyeur_vide_droit_sud_est` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `cuve_inox` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `drugstore` | non | ANCIENNE pharmacie (cube blanc + parking de voitures-cubes, 17/11) : remplacée partout par pharmacie.png (croix verte lumineuse, 19/11) |
| factory_hd | `ecole` | non | style jouet (cahier géant sur toit bleu, fenêtres multicolores), partagé par les 4 écoles : remplacé par ecole_maternelle, creche, college, lycee (repli seulement) |
| factory_hd | `extincteur` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `ferme_traditionnelle` | non | ferme de style rustique : les fermes 2×2 / 3×3 ont leurs sprites (fwheat…) |
| factory_hd | `four_industriel` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `four_rotatif_ciment` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `futs_petrole` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `futs_plastique` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `fwheat_test` | non | essai du producteur |
| factory_hd | `gare_ferroviaire` | oui | plus de gare pour l'instant (consigne de Rémy) |
| factory_hd | `gratte_ciel_25_etages_a` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `gratte_ciel_25_etages_b` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `gratte_ciel_40_etages_a` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `gratte_ciel_40_etages_b` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `gratte_ciel_60_etages_a` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `gratte_ciel_60_etages_b` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `hopital` | non | textes HOSPITAL / EMERGENCY dans l'image, 260 px par case : remplacé par hopital_ville (repli seulement) |
| factory_hd | `hypermarche` | oui | remplacé par bat_hypermarche |
| factory_hd | `hypermarche_n2` | oui | remplacé par bat_hypermarche_n2 |
| factory_hd | `hypermarche_n3` | oui | remplacé par bat_hypermarche_n3 |
| factory_hd | `immeuble_haussmannien` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `immeuble_n2` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `immeuble_pnj_a` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `immeuble_residentiel_6_etages_a` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `immeuble_residentiel_6_etages_b` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `ligne_conditionnement` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `lingots_acier` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `lingots_cuivre` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `lingots_or` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `machine_a_coudre_cuir` | non | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `machine_a_coudre_industrielle` | non | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `machine_assemblage` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `machine_decoupe_laser` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `machine_injection_plastique` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `mairie` | non | toit bleu vif à pictogramme de document, 160 px par case : remplacée par hotel_de_ville (repli seulement) |
| factory_hd | `maison_bois_nordique` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `maison_n2` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `maison_n3` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `maison_pnj_b` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `maison_pnj_c` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `malaxeur_industriel` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `mall_central` | non | NE PAS BRANCHER : le mall « effet Guggenheim » dessiné en code est l'extérieur voulu |
| factory_hd | `mall_central_moderne` | non | NE PAS BRANCHER : idem (extérieur du mall conservé) |
| factory_hd | `mannequin_couture` | non | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `manufacturing_unit` | non | intérieur d'usine |
| factory_hd | `mur_bas_droite` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `mur_bas_gauche` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `mur_bas_ne` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `mur_bas_nw` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `mur_bas_ouverture_ne` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `mur_bas_ouverture_nw` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `ouvrier_f1` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `ouvrier_f2` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `ouvrier_f3` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `ouvrier_gilet_bleu` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `ouvrier_gilet_orange` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `ouvrier_h1` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `ouvrier_h2` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `ouvrier_h3` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `palette_cartons` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `palette_vide` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `panneau_securite` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `panneaux_osb` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `pavillon_banlieue` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `peaux_cuir` | non | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `pharmacie` | non | bâtiment en forme de croix verte (lu comme une croix religieuse) : remplacé par pharmacie_quartier (repli seulement) |
| factory_hd | `planches_bois` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `plaques_acier` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `pneus_empiles` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `port_bateau_peche` | oui | décor du port tiré par case de quai ou navire (hors échantillon de l'inventaire) ; vérifié sur capture du port |
| factory_hd | `port_cavalier_straddle` | oui | décor du port tiré par case de quai ou navire (hors échantillon de l'inventaire) ; vérifié sur capture du port |
| factory_hd | `port_entrepot_a` | oui | décor du port tiré par case de quai ou navire (hors échantillon de l'inventaire) ; vérifié sur capture du port |
| factory_hd | `port_navire_cargo_se` | oui | décor du port tiré par case de quai ou navire (hors échantillon de l'inventaire) ; vérifié sur capture du port |
| factory_hd | `port_piles_conteneurs_a` | oui | décor du port tiré par case de quai ou navire (hors échantillon de l'inventaire) ; vérifié sur capture du port |
| factory_hd | `port_piles_conteneurs_b` | oui | décor du port tiré par case de quai ou navire (hors échantillon de l'inventaire) ; vérifié sur capture du port |
| factory_hd | `port_portique_quai` | oui | décor du port tiré par case de quai ou navire (hors échantillon de l'inventaire) ; vérifié sur capture du port |
| factory_hd | `port_reach_stacker` | oui | décor du port tiré par case de quai ou navire (hors échantillon de l'inventaire) ; vérifié sur capture du port |
| factory_hd | `port_reservoirs` | oui | décor du port tiré par case de quai ou navire (hors échantillon de l'inventaire) ; vérifié sur capture du port |
| factory_hd | `port_terminal_vrac` | oui | décor du port tiré par case de quai ou navire (hors échantillon de l'inventaire) ; vérifié sur capture du port |
| factory_hd | `portant_vetements` | non | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `poste_couture_ouvriere_1` | non | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `poste_couture_ouvriere_2` | non | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `poste_couture_ouvriere_3` | non | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `presse` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `quai_chargement` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `rack_stockage` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `rack_vide` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `raffinerie_petrole` | non | pas de raffinerie dans le jeu (la chimie est une usine f1-f4) |
| factory_hd | `raffinerie_unite_distillation` | non | pas de raffinerie dans le jeu |
| factory_hd | `reacteur_chimique` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `reservoir_stockage_petrole` | non | pas de dépôt pétrolier dans le jeu |
| factory_hd | `restaurant_terrasse` | non | couverts géants sur le toit : remplacé par restaurant_quartier (repli seulement) |
| factory_hd | `robot_6_axes` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `robot_6_axes_bras_1` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `robot_6_axes_bras_2` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `robot_6_axes_bras_3` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `rouleaux_caoutchouc` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `rouleaux_tissu` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `sacs_beton` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `sacs_ble` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `sacs_ciment` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `sacs_coton` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `sacs_farine` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `sacs_sucre` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| factory_hd | `scie_industrielle` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `scierie_exterieure` | non | pas de scierie dans le jeu |
| factory_hd | `station_recharge_rapide_autoroute` | non | pas d'autoroute sur la carte |
| factory_hd | `supermarche` | oui | ancien supermarché + parking : remplacé par bat_supermarche |
| factory_hd | `supermarche_n2` | oui | remplacé par bat_supermarche_n2 |
| factory_hd | `supermarche_n3` | oui | remplacé par bat_supermarche_n3 |
| factory_hd | `table_de_coupe_tissu` | non | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `torchere_raffinerie` | non | pas de raffinerie dans le jeu |
| factory_hd | `tour_bureaux_12_etages_b` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `tour_de_verre` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| factory_hd | `transpalette` | oui | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `unite_couture` | non | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `unite_maroquinerie` | non | intérieur d'usine (vue immersive) ou marchandise |
| factory_hd | `villa_mediterraneenne` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| phase2_hd | `aimants_terres_rares` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `arbre_isole_b` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `arbre_isole_c` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `arbre_isole_d` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `arbre_ville` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `bac_argile` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_bauxite` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_chrome` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_graphite` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_lithium` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_nickel` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_phosphate` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_potasse` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_sel` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_silice` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_soufre` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_terres_rares` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `bac_zinc` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `barres_galva` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `barres_inox` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `briques_palette` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `buisson_a` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `buisson_b` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `champ_ble_mur` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `champ_ble_vert` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `chantier_petit` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| phase2_hd | `chassis_aluminium` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `commissariat` | non | dalle partielle : bâtiment flottant 0,4 TH au-dessus de sa case : remplacé par commissariat_ville (repli seulement) |
| phase2_hd | `concasseur_recyclage` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `conteneur_bleu` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `conteneur_rouge` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `eau_calme` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `eau_rivage_quai` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `foret_dense_a` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `foret_dense_b` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `foret_dense_c` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `foret_sapins_a` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `foret_sapins_b` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `futs_gaz` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `gisement_argile` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_bauxite` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_charbon` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_cuivre` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_fer` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_gaz` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_graphite` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_lithium` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_nickel_chrome` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_or` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_petrole` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_phosphate` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_potasse` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_sel` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_silice` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `gisement_zinc` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `hangar_ferme` | non | grange rouge isolée : les sprites de ferme contiennent déjà grange et silo |
| phase2_hd | `herbe_a` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `herbe_b` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `herbe_c` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `herbe_d` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `immeuble_n2` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| phase2_hd | `immeuble_pnj_a` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| phase2_hd | `lingots_aluminium` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `lingots_laiton` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `maison_n2` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| phase2_hd | `maison_n3` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| phase2_hd | `maison_pnj_b` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| phase2_hd | `maison_pnj_c` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| phase2_hd | `mega_centre_commercial` | oui | ancien méga-centre (petit bâtiment au fond d'un parking de voitures-cubes) : remplacé par bat_mega_centre_commercial |
| phase2_hd | `meule_foin` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `porcelaine_caisses` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `rivage_sable` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `rochers_a` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `rochers_b` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_bout_ne` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_bout_nw` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_bout_se` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_bout_sw` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_coude_ne_nw` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_coude_ne_se` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_coude_se_sw` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_coude_sw_nw` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_croix` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_droite_ne` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_droite_nw` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_isolee` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_t_ne` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_t_nw` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_t_se` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `route_t_sw` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `sacs_alumine` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `sacs_engrais` | oui | marchandise posée sur les quais (VV_GOODS, tirée au hasard par case) |
| phase2_hd | `sol_port_asphalte` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `sol_quai_beton_a` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `sol_quai_beton_b` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `sol_ville_pave` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `terre_a` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `terre_b` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `terre_c` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `terre_d` | oui | sol, végétation, gisement ou état particulier (rendus par la carte, hors inventaire des bâtiments) |
| phase2_hd | `tour_pnj_a` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| phase2_hd | `tour_pnj_b` | oui | bâtiment de la ville ou niveau, choisi par graine, étages ou niveau (hors échantillon de l'inventaire) |
| phase2_hd | `tracteur` | non | tracteur : déjà présent dans les sprites de culture 3×3 (coin nord-est) |
| phase2_hd | `usine_grande_f3` | oui | jugée confuse (passe 78) : deux halls f2 en attendant la commande n° 14 |
| phase2_hd | `usine_petite_f1` | oui | jugée « abri de jardin » (passe 78) : repli usine_moyenne_f2 en attendant la commande n° 14 |

<!-- manuel -->
## Versions multiples : la plus récente contre celle qui est affichée (passe 99)

Dates : dernier commit de chaque PNG (branche `origin/assets/factory-sprites` comprise, identique au dépôt pour ces fichiers).

| Bâtiment | Versions (date) | Voulue | Affichée avant | Affichée maintenant | Cause / correction |
|---|---|---|---|---|---|
| Pharmacie du joueur (`spharma`) | `drugstore` (17/11 16 h 52, cube blanc + parking de voitures-cubes), `bat_drugstore` (17/11, sans parking), `pharmacie` (5 versions le 19/11 ; dernière 22 h 27 : « croix verte lumineuse », sans arbres) | `pharmacie` 22 h 27 + enseigne PHARMACIE peinte en façade (`SIGN_FACE.spharma`) | `pharmacie` (bonne) | `pharmacie` | repli `drugstore` retiré de `SPEC_SPR.spharma` : si la pharmacie manque, c'est le dessin sobre, jamais la vieille version |
| **Pharmacie de quartier (service de la ville « drugstore »)** | idem | `pharmacie` | **`drugstore` (TRÈS ANCIENNE version, 17/11)** | `pharmacie` + enseigne PHARMACIE en façade | **cause** : le service de quartier de la ville vivante s'appelle `drugstore` et le nom du service servait de nom de sprite (`vvDraw(a._sv)`) : 2 pharmacies-cubes sur parking dans chaque ville. **Correction** : `VV_SVC_SPR = { drugstore: 'pharmacie' }` (clé du service inchangée pour les sauvegardes), libellé « Pharmacie », enseigne `sv:drugstore` |
| Méga-centre commercial (`s4`) | `mega_centre_commercial` (phase2, 17/11 : petit bâtiment au fond d'un parking de voitures-cubes), `bat_mega_centre_commercial` (17/11 18 h 12, bâtiment seul) | `bat_*` (même règle que supermarché/hypermarché, passe 78) | `mega_centre_commercial` | `bat_mega_centre_commercial` | `VV_LVL_BAT.s4` |
| Supermarché / hypermarché (`s2`, `s3`, niveaux 1-3) | `supermarche*`, `hypermarche*` (17/11, parking) ; `bat_*` (17/11 16 h 52) | `bat_*` | `bat_*` | `bat_*` | déjà corrigé en passe 78 |
| Petit marché (`s1`) | `petit_marche_n1`, `petit_marche_n2` (17/11) | n1 puis n2 au niveau 2 | `petit_marche_n1` à tous les niveaux | n1, puis n2 dès le niveau 2 | `VV_LVL.s1` |
| Banque du joueur (`bank`) | `banque_neoclassique` (15/11, pièce d'or géante sur le toit), `banque` (phase2, 17/11, péristyle de pierre) | `banque` | `banque_neoclassique` jusqu'à 8 étages, puis **atlas Kenney** empilé | `banque` à tous les niveaux | `P2_TYPE.bank` |
| Data center (`dc`, campus 5×4) | `data_center` (17/11, cube gris sans parcelle), `data_center_campus` (19/11 20 h 30) | `data_center_campus` | **vectoriel** (le campus n'avait pas de sprite) ; ancien data center compact : `data_center` | campus : `data_center_campus` ; ancien compact (`lg`) : `data_center` | `dcVec`, `vvP2Name` |
| Caserne, commissariat | `caserne_pompiers`, `commissariat` (19/11 20 h 30) | ces PNG | **vectoriel** (dessin code passe 55) | HD | `VV_MON.fire`, `VV_MON.police` |
| Hôpital | `hopital` (19/11, 6 versions ; dernière 22 h 25 : HOSPITAL sur le toit, EMERGENCY réduit) | dernière | dernière | dernière | — |
| Écoles (lycée, collège, maternelle, crèche) | `ecole` seul (15/11) | 4 rendus distincts | `ecole` ×4 | `ecole` ×4 | aucun autre PNG : commande n° 17 bis |
| Usines f1 / f3 | `usine_petite_f1`, `usine_grande_f3` (17-18/11), `usine_moyenne_f2` (18/11) | commande n° 14 | repli f2 (passe 78) | repli f2 | inchangé (refus de Rémy, commande n° 14 en attente) |
| Fermes | `fwheat`… (21/11, 3×3) ; `ferme_traditionnelle`, `hangar_ferme`, `tracteur` (anciens) | sprites 3×3 du 21/11 | 3×3 du 21/11 | idem | grange, silo et tracteur déjà dans les sprites 3×3 |
| Mall central | `mall_central`, `mall_central_moderne` (19/11) | **extérieur dessiné en code (« effet Guggenheim »), à conserver** | code | code (bâtiment et enseigne inchangés) | PNG volontairement non branchés |
| Boutique high-tech, concession | `*_n2` (19/11) | — | n1 | n1 | pas de niveaux visuels pour les spécialistes |

## Artefacts (passe 99)

- **Liseré sombre autour des sprites** (cause : bord semi-transparent de 1-2 px mélangé au fond noir du rendu, mesuré à -90 à -122 niveaux de luminance contre le pixel opaque voisin sur 25 sprites dont `centre_rd`, `stade_sport`, `bat_mega_centre_commercial`, `siege_hq_n1`, tours, `banque`) : corrigé au build (`_defringe`, build.py) sur 263 sprites de la phase 2 et les 26 immeubles de la ville (ré-encodés en WebP q92, alpha sans perte : city.html passe de 22,65 à 22,2 Mo). Ombres portées et vitrages non touchés (seul le liseré qui touche à la fois l'objet et le vide est traité). Contrôle : t99 (moins de 8 % de pixels de bord nettement plus sombres ; 0 à 7 % mesurés).
- Encodage WebP des sprites : aucun halo ajouté (écart de luminance sur les bords < 0,3 niveau, mesuré). Sous-échantillonnage : le contexte principal est en `imageSmoothingQuality = 'high'` ; navires et portique de quai embarqués à 800 px (P2_FP = 2) pour rester nets au zoom maximal.
- Navires superposés dans la mer : deux couloirs à vitesse unique et espacement régulier (avant : vitesses différentes dans un même couloir, les navires se rattrapaient).
- Non traité (hors priorité « bâtiments et produits », et l'herbe n'est pas prioritaire) : le motif en losanges visible sur la tuile `eau_rivage_quai` le long des quais.

## Voitures (passe 99)

Mesure : `tools/voitures_espacement.js` (ville de 100 000 habitants, 81 voitures, 60 s simulées, relevé toutes les 20 images).

| | Avant | Après |
|---|---|---|
| Paires trop proches (< 24 px monde, silhouettes qui se chevauchent) par relevé | 1,00 | 0,10 |
| Paires superposées (< 12 px) par relevé | 0,52 | 0,02 |
| Déterministe (deux passes identiques) | non (`Math.random`) | oui (graine propre à la circulation) |
| Voitures en mouvement entre deux relevés | — | 100 % |

Règles : apparition sur une case libre seulement, distance minimale de 0,56 case dans une voie (file à l'arrêt), ligne d'arrêt et carrefour réservé à une voiture, entrée dans la rue suivante si son début est libre, déblocage après 6 s d'attente. Parking du mall : une voiture HD par place tracée (jamais deux).

## Mall central (passe 99, le bâtiment et l'enseigne « MALL CENTRAL » ne changent pas)

Avant : passants = petits blocs de couleur, commerçants absents, tuk-tuks en cubes, voitures du parking = rectangles de couleur (niveaux) et pavés de couleur (toit). Après : passants et commerçants HD (`poses/ouvrier_*_marche` / `_debout`, ombre portée, deux poses alternées pour la marche, miroir selon le sens), voitures HD (`veh_*`, `voiture_ville_*`) garées dans les niveaux (vues par l'ouverture) et sur des places tracées du toit, petite voiture HD à la place des tuk-tuks. Clients civils, vendeurs en tablier, caddies, voitures de face et de dos, marquages : commande n° 17 bis (`tools/factory_ai/RETOURS.md`).

## Captures de contrôle

`tools/capture_hd.js <dossier>` : banque, méga-centre, data center, pharmacie, caserne, commissariat, pharmacie de quartier, écoles, hôpital, port, mall (parvis, parking, toit du parking).
