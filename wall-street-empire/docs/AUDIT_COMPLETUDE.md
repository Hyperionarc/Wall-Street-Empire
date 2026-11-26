# Audit de complétude : produits, biens, bâtiments, équipements et services

Généré par `tools/audit_completude.js --md` (rejouable ; code de sortie 1 si une information OBLIGATOIRE manque). Source : le jeu construit (`city.html`, lu par le banc `tools/tests/lib.js`, aucune lecture à la main), les dossiers `assets/`, `tools/build.py`, `docs/CATALOGUE.md` et `tools/factory_ai/RETOURS.md`. Complète `AUDIT_IMAGES_PRODUITS.md` (images par clé), `AUDIT_HD_COUVERTURE.md` (sprite dessiné par élément) et `AUDIT_INTERIEURS.md`.

**Légende des cellules** : `ok` = présent ; `~ texte` = manque ATTENDU, non bloquant (photo de repli, sprite partagé, enseigne absente…) ; `**X** texte` = manque OBLIGATOIRE (nom, description, image affichable, intrant connu, outil de pose, texte « undefined »…) ; `—` = sans objet. **Verdict** : OK, ou « manque » suivi des colonnes concernées.

## 1. Synthèse chiffrée

| groupe | objets | complets (OK) | manques attendus | manques obligatoires |
|---|---|---|---|---|
| Produits finis (PRODUCTS) | 94 | 69 | 25 | 0 |
| Biens, matières et composants (GOODS) | 98 | 83 | 15 | 0 |
| Bâtiments et équipements constructibles (TYPES) | 69 | 40 | 29 | 0 |
| Équipements publics de la ville, mall et aéroport (PUB) | 13 | 5 | 8 | 0 |
| Services de la ville vivante (vv.SVC) | 11 | 8 | 3 | 0 |
| Outils de la barre (TOOL_META) | 12 | 12 | 0 | 0 |
| Bâtiments de la ville (PNJ) | 5 | 5 | 0 | 0 |
| **Total** | **302** | **222** | **80** | **0** |

- Colonnes contrôlées : 67 sur les 7 groupes ; incohérences transversales relevées : 2 (dont 0 obligatoires).
- Images des 94 produits : 81 photos HD propres, 1 photo substituée, 4 photo voisine, 8 replis vectoriels. Des 98 biens : 80 photos HD propres, 10 replis vectoriels, 5 composites, 3 catégories abstraites.
- Assets : 110 fichiers image présents mais non embarqués dans `city.html` (section 5), dont 38 modifiés depuis le 18/11 ; 54 fichiers cités dans les commandes de `RETOURS.md` n'existent pas encore dans le dépôt.
- Ce que l'audit ne mesure pas : la ressemblance d'une photo (voir `AUDIT_PRODUITS.md`), la qualité artistique d'un sprite (voir `REVUE_BATIMENTS.md`), l'équilibre économique.

## 2. Liste priorisée des manques

**P1 (vu à chaque partie)**

- 10 produits de la gamme du jour 1 sans vraie photo (drinkmilk, eggs, beefmeat, chicken, porkmeat, lambmeat, sausage, tablewine, tableoil, biofuel) : dessin vectoriel, photo voisine, substituée ou composite (commande n°18 non livrée).

**P2 (visible, provisoire)**

- 3 autres produits en photo provisoire (whisky, sweater, grandcru).
- 15 biens et matières sans vraie photo (grapes, corn, rapeseed, egg, beef, pork, poultry, lamb, wool, wine, cpu, dram, gpu, cookoil, biodiesel) : raisin, maïs, colza, œuf, vin, puces, huiles et composites d'animaux.
- sprite partagé entre bâtiments : wh, ewh (images identiques pour des objets différents).
- sprite partagé entre bâtiments : qgravel, qlime (images identiques pour des objets différents).
- bâtiment f1 (Petite usine) : repli : usine_moyenne_f2 (usine petite jugée mauvaise, commande n°14).
- bâtiment f3 (Grande usine) : repli : usine_moyenne_f2 (usine grande jugée mauvaise, commande n°14).
- sprite partagé entre bâtiments : tv, mon:telecom (images identiques pour des objets différents).
- sprite partagé entre bâtiments : sport, mon:stadium, mon:stadium2 (images identiques pour des objets différents).
- bâtiment sbrico (Brico et outillage) : VECTORIEL (+ petits sprites HD), aucun PNG ne le remplace (brico_outillage.png jamais livré).

**P3 (équipements publics, aéroport)**

- sprite partagé entre équipements : stadium, sport, stadium2.
- sprite partagé entre équipements : telecom, tv.
- sprite partagé entre équipements : lycee, college, maternelle, garderie.
- équipement air (Aéroport) : dessin en code (avions, aérogare, parking) ; aeroport_terminal.png en en-tête seulement.

**P4 (finitions, documents)**

- équipement stadium (Stade) : pas d'enseigne de façade.
- équipement stadium2 (Stade) : pas d'enseigne de façade.
- équipement telecom (Tour de télécommunications) : pas d'enseigne de façade.
- service restaurant_terrasse : enseigne en plaque flottante seulement (pas de bandeau peint sur le sprite).
- service station_service : enseigne en plaque flottante seulement (pas de bandeau peint sur le sprite).
- service station_recharge_electrique : enseigne en plaque flottante seulement (pas de bandeau peint sur le sprite).
- bâtiment solar : définition 91 px/case (sprite agrandi : flou à fort zoom).
- bâtiment stech : définition 127 px/case (sprite agrandi : flou à fort zoom).
- 19 bâtiments à sous-titre générique ou trop court (res « Résidentiel », bank « London Gold », well « NYMEX Oil », miron « Extraction », mcoal « Extraction », mgold « Extraction », mlithium « Métaux · batteries », mgraphite « Métaux · batteries », qsilica « Minéraux industriels », qclay « Minéraux industriels », mphos « Chimie · engrais », mpotash « Chimie · engrais », fwheat « Champ », fsugar « Champ », fcotton « Champ », frubber « Champ », logging « Forêt », qlime « BTP », btp « Chantiers ») : ils n'expliquent pas le rôle du bâtiment dans l'infobulle de la barre d'outils.
- équipement stadium2 (Stade) : sans l'effet chiffré (« +N d'humeur ») : « Loisirs ».
- 12 produits sans entrées dans NECESS / DEMAND_PC / OBSO / PROD_W (soap, glassware, cream, blender, fridge, jewelry, perfume, skincare, handbag, tablet, laptop, console) : le jeu applique des valeurs par défaut (nécessité 50, demande 0,3) ; à renseigner si l'équilibre l'exige (hors périmètre de l'audit).
- Nom en double : équipements publics stadium, stadium2 : même nom « Stade »

## 3. Incohérences transversales

| gravité | contrôle | détail |
|---|---|---|
| attendu | Nom en double | équipements publics stadium, stadium2 : même nom « Stade » |
| info | Guide de l'agriculteur | cultures listées « à venir » sans ferme : Cacao, Noix de coco, Lin, Citron, Fraise, Tabac |

Contrôles sans anomalie : nom en double (produits, biens, bâtiments), intrant ou produit sortant inexistant, produit sans producteur possible (toutes les chaînes remontent à un extracteur, une ferme, une fonderie ou un import), bien sans producteur, bâtiment absent d'un menu de construction, outil sans définition, texte « undefined » / « NaN » / « [object » dans une fiche du Guide, un survol ou une vue intérieure, deux fichiers de photo au contenu identique.

## 4. Corrigé pendant cet audit

- **Guide du fabricant : « ×NaN de volume » sur la fiche de la haute couture (`couture`) et du vin de grande réserve (`grandcru`)** : un produit jamais lancé a un score négatif et la puissance 0,6 donnait NaN (aussi dans l'écran d'éducation, où `Math.max(1, NaN)` restait NaN). `brandVolX` renvoie désormais ×1 quand le calcul n'est pas fini ; aucun effet sur les produits lancés.
- **Pharmacie de quartier (service « drugstore ») : nom vide** dans la sélection et le survol, car le sprite dessiné s'appelle `pharmacie` et la table des services connaît `drugstore` (`vvSvcName` ignorait `VV_SVC_OF`). Le nom « Pharmacie » s'affiche.
- **Infobulle de survol d'un service de quartier** : elle annonçait « Immeuble de logements », « Maison » ou « Immeuble de bureaux » au lieu du service (boulangerie, café, restaurant, pharmacie, station-service, école…). Elle affiche maintenant le nom du service et sa nature (« Commerce de quartier · Propriétaire : la ville »).
- **Agence immobilière (`immo`)** : seul magasin sans enseigne ; elle porte maintenant la plaque « AGENCE IMMOBILIÈRE » (comme les autres commerces).
- **Banc d'audit** : `window.WSE.aud` expose en lecture seule les tables internes nécessaires (TOOL_META, PUB, SIGN_FACE, GUIDEHD…) ; `tools/audit_interieurs.js` exporte `BUILD_SRC` et `t80_orientation.js` exporte `pageMeasure` pour être réutilisés.
- **Test `t108_completude`** : échoue si un produit, un bien, un bâtiment, un équipement public ou un service n'a ni nom, ni description, ni image affichable, ou si une recette cite un intrant inconnu.

## 5. Assets non branchés et commandes non livrées

### 5.1 Fichiers présents mais non embarqués dans le jeu (110)

| dossier | fichier | dernière modification | raison / emploi possible |
|---|---|---|---|
| factory_hd | `boutique_high_tech_n2.png` | 2026-11-19 | niveau 2 de la boutique high-tech (pas de niveaux pour les spécialistes) |
| factory_hd | `concession_auto_n2.png` | 2026-11-19 | niveau 2 de la concession (pas de niveaux pour les spécialistes) |
| factory_hd | `fwheat_test.png` | 2026-11-19 | essai du producteur |
| factory_hd_candidats | `immeuble_haussmann_b.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_haussmann_c.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_haussmann_d.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_haussmann_e.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_haussmann_f.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_haussmann_g.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_r6_angle_commerce.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_r6_brique.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_r6_haussmann.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_r6_moderne_blanc.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_r6_moderne_bois.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_r6_neoclassique.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_r6_residence_jardin.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd_candidats | `immeuble_r6_social.png` | 2026-11-19 | candidat d'immeuble ou de maison non retenu (aucune copie dans factory_hd) |
| factory_hd/int | `int_auto_comptoir.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_auto_voiture_a.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_auto_voiture_b.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_auto_voiture_c.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_brico_etagere.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_deco_canape.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_deco_table.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_ewh_convoyeur.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_ewh_rayonnage.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_ewh_robot.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_luxe_socle.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_mode_mannequin.png` | 2026-11-19 | élément d'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l'usine |
| factory_hd/int | `int_mode_portant.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_pharma_comptoir.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_pharma_etagere.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_sport_rack.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_sport_velo.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_tech_presentoir.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd/int | `int_tech_table.png` | 2026-11-19 | accessoire d'intérieur de magasin (commande n°11 du 19/11) : aucun code ne le dessine |
| factory_hd | `mall_central_moderne.png` | 2026-11-19 | NE PAS BRANCHER : idem (extérieur du mall conservé) |
| factory_hd | `mall_central.png` | 2026-11-19 | NE PAS BRANCHER : le mall « effet Guggenheim » dessiné en code est l'extérieur voulu |
| factory_hd | `bat_drugstore.png` | avant le 18/11 | ancienne pharmacie sans parking (17/11) : remplacée par pharmacie.png |
| factory_hd | `bat_ferme_carrousel.png` | avant le 18/11 | annexe de ferme non retenue (passe 87) |
| factory_hd | `bat_ferme_porcherie_long.png` | avant le 18/11 | doublon de bat_ferme_porcherie_longue |
| factory_hd | `bat_ferme_porcherie_longue.png` | avant le 18/11 | annexe non retenue (passe 87) |
| factory_hd | `bat_ferme_poulailler_long.png` | avant le 18/11 | annexe non retenue (passe 87) |
| factory_hd | `bat_scierie.png` | avant le 18/11 | pas de scierie dans le jeu (le camp de bûcherons a son sprite) |
| factory_hd/poses | `employe_bureau_1_1.png` | avant le 18/11 | personnage de bureau non utilisé par la vue immersive |
| factory_hd/poses | `employe_bureau_1_2.png` | avant le 18/11 | personnage de bureau non utilisé par la vue immersive |
| factory_hd/poses | `employe_bureau_2_1.png` | avant le 18/11 | personnage de bureau non utilisé par la vue immersive |
| factory_hd/poses | `employe_bureau_2_2.png` | avant le 18/11 | personnage de bureau non utilisé par la vue immersive |
| factory_hd/poses | `employe_bureau_3_1.png` | avant le 18/11 | personnage de bureau non utilisé par la vue immersive |
| factory_hd/poses | `employe_bureau_3_2.png` | avant le 18/11 | personnage de bureau non utilisé par la vue immersive |
| factory_hd | `ferme_traditionnelle.png` | avant le 18/11 | ferme de style rustique : les fermes 2×2 / 3×3 ont leurs sprites (fwheat…) |
| phase2_hd | `hangar_ferme.png` | avant le 18/11 | grange rouge isolée : les sprites de ferme contiennent déjà grange et silo |
| phase2_hd (scènes) | `hero_jouet.jpg` | avant le 18/11 | source 1920×1080 du visuel de lancement 16:9 (la version 1280×720 est déjà embarquée : products_hd) |
| phase2_hd (scènes) | `hero_montre_luxe.jpg` | avant le 18/11 | source 1920×1080 du visuel de lancement 16:9 (la version 1280×720 est déjà embarquée : products_hd) |
| phase2_hd (scènes) | `hero_pain.jpg` | avant le 18/11 | source 1920×1080 du visuel de lancement 16:9 (la version 1280×720 est déjà embarquée : products_hd) |
| phase2_hd (scènes) | `hero_parfum.jpg` | avant le 18/11 | source 1920×1080 du visuel de lancement 16:9 (la version 1280×720 est déjà embarquée : products_hd) |
| phase2_hd (scènes) | `hero_pilules.jpg` | avant le 18/11 | source 1920×1080 du visuel de lancement 16:9 (la version 1280×720 est déjà embarquée : products_hd) |
| phase2_hd (scènes) | `hero_portable.jpg` | avant le 18/11 | source 1920×1080 du visuel de lancement 16:9 (la version 1280×720 est déjà embarquée : products_hd) |
| phase2_hd (scènes) | `hero_smartphone.jpg` | avant le 18/11 | source 1920×1080 du visuel de lancement 16:9 (la version 1280×720 est déjà embarquée : products_hd) |
| phase2_hd (scènes) | `hero_sneakers.jpg` | avant le 18/11 | source 1920×1080 du visuel de lancement 16:9 (la version 1280×720 est déjà embarquée : products_hd) |
| phase2_hd (scènes) | `hero_tv.jpg` | avant le 18/11 | source 1920×1080 du visuel de lancement 16:9 (la version 1280×720 est déjà embarquée : products_hd) |
| phase2_hd (scènes) | `hero_voiture.jpg` | avant le 18/11 | source 1920×1080 du visuel de lancement 16:9 (la version 1280×720 est déjà embarquée : products_hd) |
| factory_hd/poses | `ingenieur_tablette.png` | avant le 18/11 | personnage de bureau non utilisé par la vue immersive |
| factory_hd | `machine_a_coudre_cuir.png` | avant le 18/11 | élément d'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l'usine |
| factory_hd | `machine_a_coudre_industrielle.png` | avant le 18/11 | sans emploi connu |
| factory_hd | `mannequin_couture.png` | avant le 18/11 | élément d'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l'usine |
| factory_hd | `manufacturing_unit.png` | avant le 18/11 | intérieur d'usine |
| factory_hd/poses | `ouvrier_f1_machine.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_f1_porte_carton.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_f2_machine.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_f2_porte_carton.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_f3_machine.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_f3_porte_carton.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_gilet_bleu_debout.png` | avant le 18/11 | pose d'ouvrier à gilet : le jeu embarque les poses h1-h3 et f1-f3 (marche, debout) seulement |
| factory_hd/poses | `ouvrier_gilet_bleu_machine.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_gilet_bleu_marche.png` | avant le 18/11 | pose d'ouvrier à gilet : le jeu embarque les poses h1-h3 et f1-f3 (marche, debout) seulement |
| factory_hd/poses | `ouvrier_gilet_bleu_porte_carton.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_gilet_orange_debout.png` | avant le 18/11 | pose d'ouvrier à gilet : le jeu embarque les poses h1-h3 et f1-f3 (marche, debout) seulement |
| factory_hd/poses | `ouvrier_gilet_orange_machine.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_gilet_orange_marche.png` | avant le 18/11 | pose d'ouvrier à gilet : le jeu embarque les poses h1-h3 et f1-f3 (marche, debout) seulement |
| factory_hd/poses | `ouvrier_gilet_orange_porte_carton.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_h1_machine.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_h1_porte_carton.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_h2_machine.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_h2_porte_carton.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_h3_machine.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd/poses | `ouvrier_h3_porte_carton.png` | avant le 18/11 | pose d'ouvrier non utilisée (seules marche et debout sont embarquées) |
| factory_hd | `peaux_cuir.png` | avant le 18/11 | élément d'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l'usine |
| factory_hd | `portant_vetements.png` | avant le 18/11 | élément d'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l'usine |
| factory_hd | `poste_couture_ouvriere_1.png` | avant le 18/11 | élément d'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l'usine |
| factory_hd | `poste_couture_ouvriere_2.png` | avant le 18/11 | élément d'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l'usine |
| factory_hd | `poste_couture_ouvriere_3.png` | avant le 18/11 | élément d'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l'usine |
| factory_hd | `raffinerie_petrole.png` | avant le 18/11 | pas de raffinerie dans le jeu (la chimie est une usine f1-f4) |
| factory_hd | `raffinerie_unite_distillation.png` | avant le 18/11 | pas de raffinerie dans le jeu |
| factory_hd | `reservoir_stockage_petrole.png` | avant le 18/11 | pas de dépôt pétrolier dans le jeu |
| phase2_hd (scènes) | `scene_atelier_jouets.jpg` | avant le 18/11 | illustration de scène (Studio R&D, atelier, labo) : jamais chargée par le jeu |
| phase2_hd (scènes) | `scene_labo_smartphone.jpg` | avant le 18/11 | illustration de scène (Studio R&D, atelier, labo) : jamais chargée par le jeu |
| phase2_hd (scènes) | `scene_rd_garage_moteur.jpg` | avant le 18/11 | illustration de scène (Studio R&D, atelier, labo) : jamais chargée par le jeu |
| phase2_hd (scènes) | `scene_rd_garage_voiture.jpg` | avant le 18/11 | illustration de scène (Studio R&D, atelier, labo) : jamais chargée par le jeu |
| phase2_hd (scènes) | `scene_rd_halle_robots.jpg` | avant le 18/11 | illustration de scène (Studio R&D, atelier, labo) : jamais chargée par le jeu |
| factory_hd | `scierie_exterieure.png` | avant le 18/11 | pas de scierie dans le jeu |
| factory_hd | `station_recharge_rapide_autoroute.png` | avant le 18/11 | pas d'autoroute sur la carte |
| factory_hd | `table_de_coupe_tissu.png` | avant le 18/11 | élément d'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l'usine |
| factory_hd | `torchere_raffinerie.png` | avant le 18/11 | pas de raffinerie dans le jeu |
| phase2_hd | `tracteur.png` | avant le 18/11 | tracteur : déjà présent dans les sprites de culture 3×3 (coin nord-est) |
| factory_hd | `unite_couture.png` | avant le 18/11 | élément d'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l'usine |
| factory_hd | `unite_maroquinerie.png` | avant le 18/11 | élément d'atelier textile / maroquinerie livré mais jamais choisi par la vue immersive de l'usine |
| scenes_hd | `usine_voiture.jpg` | avant le 18/11 | illustration de scène (Studio R&D, atelier, labo) : jamais chargée par le jeu |
| phase2_hd (scènes) | `vitrine_accueil.jpg` | avant le 18/11 | illustration d'accueil 1920×1080 : aucun écran de départ ne la charge |
| phase2_hd (scènes) | `vue_ville_ensemble.jpg` | avant le 18/11 | illustration d'accueil 1920×1080 : aucun écran de départ ne la charge |

### 5.2 Fichiers cités dans les commandes de `tools/factory_ai/RETOURS.md` et absents du dépôt

Chaque fichier est rattaché à la dernière commande qui le cite. Les besoins NOUVEAUX relevés par cet audit (sprites partagés entre objets différents, sprites trop petits, agence immobilière) forment la **COMMANDE n°21** de `RETOURS.md` ; ses fichiers apparaissent ci-dessous tant qu'ils ne sont pas livrés.

| commande | fichiers attendus |
|---|---|
| n°17 | `scene_mall_interieur.jpg`, `int_hypermarche.png`, `int_petit_marche.png`, `int_mall_galerie.png` |
| n°8 | `scene_bureau_banquier.jpg`, `scene_salle_conseil.jpg` |
| n°17 bis | `brico_outillage.png`, `college.png`, `lycee.png`, `ecole_maternelle.png`, `creche.png` |
| n°18 | `eggs.jpg`, `chicken.jpg`, `porkmeat.jpg`, `lambmeat.jpg`, `sausage.jpg`, `tablewine.jpg`, `grandcru.jpg`, `tableoil.jpg`, `biofuel.jpg`, `corn.jpg`, `rapeseed.jpg`, `cookoil.jpg`, `biodiesel.jpg`, `grapes.jpg`, `egg.jpg`, `wine.jpg`, `sweater.jpg`, `drinkmilk.jpg`, `beefmeat.jpg`, `beef.jpg`, `pork.jpg`, `lamb.jpg`, `poultry.jpg`, `wool.jpg`, `cpu.jpg`, `dram.jpg`, `gpu.jpg` |
| n°79 | `carriere_concasseur.png`, `carriere_concasseur_n3.png` |
| n°19 | `avion_ligne.png`, `ombres/avion_ligne.png`, `avion_ligne_ar.png`, `aerogare_vitree.png`, `parking_aeroport.png`, `bus_navette.png`, `taxi.png`, `int_aerogare_hall.png` |
| n°21 | `flourbag.jpg`, `entrepot_en_ligne.png`, `carriere_calcaire.png`, `salle_de_sport.png`, `tour_telecom.png`, `stade_sport_b.png` |

### 5.3 PNG embarqués mais dessinés par aucun élément de la carte

253 PNG sont embarqués sans être dessinés par un bâtiment, un service ou un décor de l'inventaire (intérieurs d'usine, marchandises des quais, annexes de ferme, niveaux, anciennes versions remplacées) : la liste raisonnée est dans `AUDIT_HD_COUVERTURE.md` (test t99 : aucun sans raison écrite).

## 6. Détail par objet

### Produits finis (PRODUCTS)

| objet | nom | description | famille | gamme | prix de référence | recette/intrants | chaîne de production | image | glyphe de repli | tables de demande | point de vente | fiche du Guide | ligne du catalogue | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `utensils` Ustensiles de cuisine | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `bread` Pain | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `biscuits` Biscuits | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `candy` Bonbons | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `tshirt` T-shirts | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `jeans` Jeans | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `sneakers` Baskets | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `tyres` Pneus automobiles | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `mattress` Matelas | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `toys` Jouets en plastique | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `woodtoys` Jouets en bois | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `chair` Chaise | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `bed` Lit | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `house_wood` Maison à ossature bois | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `house_concrete` Maison en béton | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `bike` Vélo | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `washer` Lave-linge | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `tv` Téléviseur | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `phone` Smartphone | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `headache` Pilules contre le mal de tête | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `cough` Sirop contre la toux | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `obesity` Pilules contre l'obésité | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `watch` Montre de luxe | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `soap` Savons et détergents | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `glassware` Verrerie et bocaux | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `cream` Crèmes et soins | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `blender` Petit électroménager | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `fridge` Réfrigérateur | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `jewelry` Bijoux en or | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `perfume` Parfum de luxe | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `skincare` Soins de luxe | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `handbag` Sac de créateur | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `tablet` Tablette tactile | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `laptop` Ordinateur portable | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `console` Console de jeux | ok | ok | ok | ok | ok | ok | ok | photo | — | ~ valeurs par défaut (nécessité 50, demande 0,3) : NECESS/DEMAND_PC/OBSO/PROD_W | ok | ok | ok | manque tables de demande |
| `yogurt` Yaourts | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `cheese` Fromages | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `pasta` Pâtes alimentaires | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `chocolate` Chocolat | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `readymeal` Plats cuisinés | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `soda` Sodas | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `beer` Bière | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `spirits` Spiritueux | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `whisky` Whisky de luxe | ok | ok | ok | ok | ok | ok | ok | ~ substituée ← spirit | — | ok | ok | ok | ok | manque image |
| `vitamins` Compléments alimentaires | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `antibio` Antibiotiques | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `shampoo` Shampooings | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `toothpaste` Dentifrice | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `makeup` Maquillage | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `hygiene` Couches et hygiène | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `jacket` Vestes | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `leathershoes` Chaussures en cuir | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `dress` Robes | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `socks` Chaussettes et sous-vêtements | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `bag` Sacs en cuir | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `couture` Haute couture | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `camera` Appareils photo | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `smartwatch` Montres connectées | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `headphones` Casques audio | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `microwave` Fours micro-ondes | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `vacuum` Aspirateurs | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `lamp` Luminaires LED | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `desktop` Ordinateurs de bureau | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `solarpanel` Panneaux solaires | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `sofa` Canapés | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `table` Tables | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `wardrobe` Armoires | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `tableware` Vaisselle en céramique | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `books` Livres et cahiers | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `sportswear` Vêtements de sport | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `tent` Tentes et camping | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `ebike` Vélos électriques | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `dolls` Poupées et peluches | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `etoys` Jouets électroniques | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `car` Voitures | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `car_alu` Voitures en aluminium | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `cookware` Casseroles et couverts inox | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `scooter` Scooters | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `lube` Lubrifiants et carburants | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `handtools` Outillage à main | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `powertools` Outillage électroportatif | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `drinkmilk` Lait de consommation | ok | ok | ok | ok | ok | ok | ok | ~ voisine ← milk | — | ok | ok | ok | ok | manque image |
| `eggs` Œufs | ok | ok | ok | ok | ok | ok | ok | ~ repli vectoriel | ok | ok | ok | ok | ok | manque image |
| `beefmeat` Viande de bœuf | ok | ok | ok | ok | ok | ok | ok | ~ voisine ← meat | — | ok | ok | ok | ok | manque image |
| `chicken` Poulet | ok | ok | ok | ok | ok | ok | ok | ~ repli vectoriel | ok | ok | ok | ok | ok | manque image |
| `porkmeat` Viande de porc | ok | ok | ok | ok | ok | ok | ok | ~ voisine ← meat | — | ok | ok | ok | ok | manque image |
| `lambmeat` Agneau | ok | ok | ok | ok | ok | ok | ok | ~ repli vectoriel | ok | ok | ok | ok | ok | manque image |
| `sausage` Saucisson et charcuterie | ok | ok | ok | ok | ok | ok | ok | ~ repli vectoriel | ok | ok | ok | ok | ok | manque image |
| `sweater` Pulls en laine | ok | ok | ok | ok | ok | ok | ok | ~ voisine ← jacket | — | ok | ok | ok | ok | manque image |
| `tablewine` Vin de table | ok | ok | ok | ok | ok | ok | ok | ~ repli vectoriel | ok | ok | ok | ok | ok | manque image |
| `grandcru` Vin de grande réserve | ok | ok | ok | ok | ok | ok | ok | ~ repli vectoriel | ok | ok | ok | ok | ok | manque image |
| `petfood` Aliments pour animaux | ok | ok | ok | ok | ok | ok | ok | photo | — | ok | ok | ok | ok | OK |
| `tableoil` Huile de table | ok | ok | ok | ok | ok | ok | ok | ~ repli vectoriel | ok | ok | ok | ok | ok | manque image |
| `biofuel` Biocarburant en bidons | ok | ok | ok | ok | ok | ok | ok | ~ repli vectoriel | ok | ok | ok | ok | ok | manque image |

### Biens, matières et composants (GOODS)

| objet | nom | prix de base | groupe | couleur | image | producteur | débouché | fiche du Guide | unité | ligne du catalogue | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `oil` Pétrole | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `iron` Minerai de fer | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `coal` Charbon | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `copper` Cuivre | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `gold` Or brut | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `wood` Bois | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `gravel` Gravier | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `sand` Sable | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `limestone` Calcaire | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `nickel` Nickel | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `chrome` Chrome | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `bauxite` Bauxite | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `lithium` Lithium | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `silica` Silice pure | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `salt` Sel gemme | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `sulfur` Soufre | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `phosphate` Phosphate | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `gas` Gaz naturel | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `rare` Terres rares | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `zinc` Zinc | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `clay` Argile et kaolin | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `potash` Potasse | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `graphite` Graphite | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `wheat` Blé | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `sugar` Canne à sucre | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `cotton` Coton | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `rubber` Caoutchouc naturel | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `grapes` Raisin | ok | ok | ok | ok | ~ repli vectoriel dédié | ok | ok | ok | ok | ok | manque image |
| `corn` Maïs | ok | ok | ok | ok | ~ repli vectoriel dédié | ok | ok | ok | ok | ok | manque image |
| `rapeseed` Colza (graines) | ok | ok | ok | ok | ~ repli vectoriel dédié | ok | ok | ok | ok | ok | manque image |
| `milk` Lait cru | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `egg` Œufs en vrac | ok | ok | ok | ok | ~ repli vectoriel dédié | ok | ok | ok | ok | ok | manque image |
| `beef` Bœuf (carcasses) | ok | ok | ok | ok | ~ composite animal | ok | ok | ok | ok | ok | manque image |
| `pork` Porc (carcasses) | ok | ok | ok | ok | ~ composite animal | ok | ok | ok | ok | ok | manque image |
| `poultry` Volaille (carcasses) | ok | ok | ok | ok | ~ composite animal | ok | ok | ok | ok | ok | manque image |
| `lamb` Agneau (carcasses) | ok | ok | ok | ok | ~ composite animal | ok | ok | ok | ok | ok | manque image |
| `wool` Laine brute | ok | ok | ok | ok | ~ composite animal | ok | ok | ok | ok | ok | manque image |
| `leather` Cuir brut | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `flour` Farine | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `fabric` Tissu | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `tire` Pneus | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `ingot` Lingots d'or | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `steel` Acier | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `plank` Planches | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `stud` Montants d'ossature bois | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `osb` Panneaux OSB | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `cement` Ciment | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `concrete` Béton | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `chem` Produits chimiques | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `api` Principes actifs | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `plastic` Plastique | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `wire` Câbles de cuivre | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `pack` Emballages | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `motor` Moteurs électriques | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `battery` Batteries | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `circuit` Cartes électroniques | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `gcase` Boîtiers en or | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `screen` Écrans | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `glass` Verre | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `silicon` Silicium | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `essence` Essences et arômes | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `rweld` Robot de soudure | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `rpaint` Robot de peinture | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `rasm` Robot d'assemblage | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `r6` Robot 6 axes | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `paper` Papier et carton | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `meat` Viandes (abattoir) | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `wine` Vin | ok | ok | ok | ok | ~ repli vectoriel dédié | ok | ok | ok | ok | ok | manque image |
| `ceramic` Céramique | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `hardware` Fermetures et quincaillerie | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `case` Boîtiers et coques | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `foam` Mousse et rembourrage | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `paint` Peintures et vernis | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `rubberp` Pièces en caoutchouc | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `tfabric` Textiles techniques | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `led` Éclairage LED | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `engine` Moteurs thermiques | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `chassis` Châssis et carrosserie | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `sensor` Capteurs et optiques | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `cpu` Processeurs | ok | ok | ok | ok | ~ repli vectoriel dédié | ok | ok | ok | ok | ok | manque image |
| `dram` Mémoire DRAM | ok | ok | ok | ok | ~ repli vectoriel dédié | ok | ok | ok | ok | ok | manque image |
| `gpu` Cartes graphiques et accélérateurs IA | ok | ok | ok | ok | ~ repli vectoriel dédié | ok | ok | ok | ok | ok | manque image |
| `pv` Cellules photovoltaïques | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `stainless` Acier inoxydable | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `galva` Acier galvanisé | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `brass` Laiton | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `alumina` Alumine | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `aluminium` Aluminium | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `magnet` Aimants permanents | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `fert` Engrais | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `brick` Briques | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `porcelain` Porcelaine | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `chassisal` Châssis en aluminium | ok | ok | ok | ok | photo | ok | ok | ok | ok | ok | OK |
| `cookoil` Huile de cuisine | ok | ok | ok | ok | ~ repli vectoriel dédié | ok | ok | ok | ok | ok | manque image |
| `biodiesel` Biodiesel | ok | ok | ok | ok | ~ repli vectoriel dédié | ok | ok | ok | ok | ok | manque image |
| `basic` Biens de base | ok | — | ok | ok | — | — | — | ok | — | ok | OK |
| `std` Biens manufacturés | ok | — | ok | ok | — | — | — | ok | — | ok | OK |
| `lux` Produits de luxe | ok | — | ok | ok | — | — | — | ok | — | ok | OK |

### Bâtiments et équipements constructibles (TYPES)

| objet | nom | description | coût | emplois | entretien | emprise | palier/déblocage | menu de construction | icône d'outil | infobulle du bouton | infobulle de survol | recette/production | sprite | sprite propre | éclairage | ancre/ombre | enseigne | intérieur | fiche du Guide | ligne du catalogue | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `road` Route | ok | ok | ok | ok | ok | ok | ok | agri | ok | ok | — | ok | tuiles de réseau (code) | — | — | — | — | — | — | ok | OK |
| `res` Logements | ok | ~ sous-titre trop court : « Résidentiel » | ok | ok | ok | ok | ok | ville | ok | ok | ok | ok | maison_n1 | ok | ok | ok | — | bld | — | ok | manque description |
| `tech` Tour Tech | ok | ok | ok | ok | ok | ok | ok | ville | ok | ok | ok | ok | immeuble_bureaux_vitre | ok | — | ok | — | bld | — | ok | OK |
| `wh` Entrepôt | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | entrepot | ~ même sprite que ewh | ok | ok | ok | site | — | ok | manque sprite propre |
| `ewh` Entrepôt logistique en ligne | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | entrepot | ~ même sprite que wh | ok | ok | ok | site | — | ok | manque sprite propre |
| `plant` Centrale électrique | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | centrale_charbon | ok | ok | ok | — | bld | — | ok | OK |
| `solar` Centrale solaire | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | centrale_solaire | ok | ok | ~ définition 91 px/case | — | bld | — | ok | manque ancre/ombre |
| `wind` Éolienne | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | eolienne | ok | ok | ok | — | bld | — | ok | OK |
| `nuclear` Centrale nucléaire | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | centrale_nucleaire | ok | ok | ok | — | bld | — | ok | OK |
| `pylon` Pylône / ligne aérienne | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | tuiles de réseau (code) | — | — | — | — | message | — | ok | OK |
| `cable` Câble enterré | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | tuiles de réseau (code) | — | — | — | — | message | — | ok | OK |
| `pipeline` Pipeline | ok | ok | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | tuiles de réseau (code) | — | — | — | — | message | — | ok | OK |
| `rd` Centre de R&D | ok | ok | ok | ok | ok | ok | ok | ville | ok | ok | ok | ok | centre_rd | ok | ok | ok | ok | bld | — | ok | OK |
| `dc` Data center | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | data_center_campus | ok | ok | ok | ok | bld | — | ok | OK |
| `hq` Siège social | ok | ok | ok | ok | ok | ok | ok | ville | ok | ok | ok | ok | siege_hq_n1 | ok | ok | ok | ok | bld | — | ok | OK |
| `bank` Banque | ok | ~ sous-titre trop court : « London Gold » | ok | ok | ok | ok | ok | ville | ok | ok | ok | ok | banque | ok | ok | ok | — | bld | — | ok | manque description |
| `well` Puits pétrole | ok | ~ sous-titre trop court : « NYMEX Oil » | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | puits_petrole | ok | ok | ok | — | site | — | ok | manque description |
| `miron` Mine de fer | ok | ~ sous-titre générique « Extraction » aussi sur mcoal, mgold | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_fer | ok | ok | ok | — | site | — | ok | manque description |
| `mcoal` Mine charbon | ok | ~ sous-titre générique « Extraction » aussi sur miron, mgold | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_charbon | ok | ok | ok | — | site | — | ok | manque description |
| `mcopper` Mine cuivre | ok | ok | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_cuivre | ok | ok | ok | — | site | — | ok | OK |
| `mgold` Mine d'or | ok | ~ sous-titre générique « Extraction » aussi sur miron, mcoal | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_or | ok | ok | ok | — | site | — | ok | manque description |
| `mnicr` Mine de nickel-chrome | ok | ok | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_nickel_chrome | ok | ok | ok | — | site | — | ok | OK |
| `mbauxite` Mine de bauxite | ok | ok | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_bauxite | ok | ok | ok | — | site | — | ok | OK |
| `mlithium` Mine de lithium | ok | ~ sous-titre générique « Métaux · batteries » aussi sur mgraphite | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_lithium | ok | ok | ok | — | site | — | ok | manque description |
| `mzinc` Mine de zinc | ok | ok | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_zinc | ok | ok | ok | — | site | — | ok | OK |
| `mgraphite` Mine de graphite | ok | ~ sous-titre générique « Métaux · batteries » aussi sur mlithium | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_graphite | ok | ok | ok | — | site | — | ok | manque description |
| `gwell` Puits de gaz naturel | ok | ok | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | puits_gaz | ok | ok | ok | — | site | — | ok | OK |
| `qsilica` Carrière de silice | ok | ~ sous-titre générique « Minéraux industriels » aussi sur qclay | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | carriere_silice | ok | ok | ok | — | site | — | ok | manque description |
| `qclay` Carrière d'argile | ok | ~ sous-titre générique « Minéraux industriels » aussi sur qsilica | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | carriere_argile | ok | ok | ok | — | site | — | ok | manque description |
| `qsalt` Mine de sel gemme | ok | ok | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_sel | ok | ok | ok | — | site | — | ok | OK |
| `mphos` Mine de phosphate | ok | ~ sous-titre générique « Chimie · engrais » aussi sur mpotash | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_phosphate | ok | ok | ok | — | site | — | ok | manque description |
| `mpotash` Mine de potasse | ok | ~ sous-titre générique « Chimie · engrais » aussi sur mphos | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | mine_potasse | ok | ok | ok | — | site | — | ok | manque description |
| `fwheat` Ferme de blé | ok | ~ sous-titre générique « Champ » aussi sur fsugar, fcotton, frubber | ok | ok | ok | ok | ok | agri | ok | ok | ok | ok | fwheat | ok | ok | ok | — | site | ok | ok | manque description |
| `fsugar` Plantation de canne | ok | ~ sous-titre générique « Champ » aussi sur fwheat, fcotton, frubber | ok | ok | ok | ok | ok | agri | ok | ok | ok | ok | fsugar | ok | ok | ok | — | site | ok | ok | manque description |
| `fcotton` Plantation de coton | ok | ~ sous-titre générique « Champ » aussi sur fwheat, fsugar, frubber | ok | ok | ok | ok | ok | agri | ok | ok | ok | ok | fcotton | ok | ok | ok | — | site | ok | ok | manque description |
| `frubber` Plantation d'hévéas | ok | ~ sous-titre générique « Champ » aussi sur fwheat, fsugar, fcotton | ok | ok | ok | ok | ok | agri | ok | ok | ok | ok | frubber | ok | ok | ok | — | site | ok | ok | manque description |
| `fvine` Vignoble | ok | ok | ok | ok | ok | ok | ok | agri | ok | ok | ok | ok | fvine | ok | ok | ok | — | site | ok | ok | OK |
| `fcorn` Culture de maïs | ok | ok | ok | ok | ok | ok | ok | agri | ok | ok | ok | ok | fcorn | ok | ok | ok | — | site | ok | ok | OK |
| `frapeseed` Culture de colza | ok | ok | ok | ok | ok | ok | ok | agri | ok | ok | ok | ok | frapeseed | ok | ok | ok | — | site | ok | ok | OK |
| `fcattle` Élevage de bovins | ok | ok | ok | ok | ok | ok | ok | agri | ok | ok | ok | ok | fcattle | ok | ok | ok | — | site | ok | ok | OK |
| `fchicken` Élevage de poulets | ok | ok | ok | ok | ok | ok | ok | agri | ok | ok | ok | ok | fchicken | ok | ok | ok | — | site | ok | ok | OK |
| `fpig` Élevage de porcs | ok | ok | ok | ok | ok | ok | ok | agri | ok | ok | ok | ok | fpig | ok | ok | ok | — | site | ok | ok | OK |
| `fsheep` Élevage de moutons | ok | ok | ok | ok | ok | ok | ok | agri | ok | ok | ok | ok | fsheep | ok | ok | ok | — | site | ok | ok | OK |
| `logging` Camp bûcherons | ok | ~ sous-titre trop court : « Forêt » | ok | ok | ok | ok | ok | extr | ok | ok | ok | ok | camp_bucherons | ok | ok | ok | — | site | — | ok | manque description |
| `qgravel` Carrière de granulats | ok | ok | ok | ok | ok | ok | ok | btp | ok | ok | ok | ok | carriere | ~ même sprite que qlime | ok | ok | — | site | — | ok | manque sprite propre |
| `qlime` Carrière calcaire | ok | ~ sous-titre trop court : « BTP » | ok | ok | ok | ok | ok | btp | ok | ok | ok | ok | carriere | ~ même sprite que qgravel | ok | ok | — | site | — | ok | manque description, sprite propre |
| `btp` Entreprise de BTP | ok | ~ sous-titre trop court : « Chantiers » | ok | ok | ok | ok | ok | btp | ok | ok | ok | ok | chantier_moyen | ok | ok | ok | — | bld | — | ok | manque description |
| `immo` Agence immobilière | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | agence_immo | ok | ok | ok | ok | bld | — | ok | OK |
| `foundry` Fonderie d'or | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | fonderie | ok | ok | ok | — | fac | — | ok | OK |
| `f1` Petite usine | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | usine_moyenne_f2 | ~ repli : usine_moyenne_f2 (usine petite jugée mauvaise, commande n°14) | ok | ok | — | plan | — | ok | manque sprite propre |
| `f2` Usine moyenne | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | usine_moyenne_f2 | ok | ok | ok | — | plan | — | ok | OK |
| `f3` Grande usine | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | usine_moyenne_f2 | ~ repli : usine_moyenne_f2 (usine grande jugée mauvaise, commande n°14) | ok | ok | — | plan | — | ok | manque sprite propre |
| `s1` Petit marché | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | petit_marche_n1 | ok | ok | ok | ok | retail | — | ok | OK |
| `s2` Supermarché | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | bat_supermarche | ok | ok | ok | ok | retail | — | ok | OK |
| `s3` Hypermarché | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | bat_hypermarche | ok | ok | ok | ok | retail | — | ok | OK |
| `port` Terminal portuaire | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | terminal_portuaire | ok | ok | ok | ok | bld | — | ok | OK |
| `off` Tour de location | ok | ok | ok | ok | ok | ok | ok | ville | ok | ok | ok | ok | tour_bureaux | ok | ok | ok | — | bld | — | ok | OK |
| `tv` Station média | ok | ok | ok | ok | ok | ok | ok | ville | ok | ok | ok | ok | station_tv | ~ même sprite que mon:telecom | ok | ok | ok | bld | — | ok | manque sprite propre |
| `sport` Équipement sportif | ok | ok | ok | ok | ok | ok | ok | ville | ok | ok | ok | ok | stade_sport | ~ même sprite que mon:stadium, mon:stadium2 | ok | ok | — | bld | — | ok | manque sprite propre |
| `f4` Méga-usine | ok | ok | ok | ok | ok | ok | ok | indus | ok | ok | ok | ok | usine_f4_mega | ok | ok | ok | — | plan | — | ok | OK |
| `s4` Méga-centre commercial | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | bat_mega_centre_commercial | ok | ok | ok | ok | retail | — | ok | OK |
| `sauto` Concession automobile | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | concession_auto | ok | ok | ok | ok | retail | — | ok | OK |
| `stech` Maison du Numérique | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | boutique_high_tech | ok | ok | ~ définition 127 px/case | ok | retail | — | ok | manque ancre/ombre |
| `slux` Maison de luxe | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | boutique_luxe | ok | ok | ok | ok | retail | — | ok | OK |
| `smode` Boutique de mode | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | boutique_mode_luxe | ok | ok | ok | ok | retail | — | ok | OK |
| `spharma` Pharmacie · drugstore | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | pharmacie | ok | ok | ok | ok | retail | — | ok | OK |
| `shome` Maison et déco | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | maison_deco | ok | ok | ok | ok | retail | — | ok | OK |
| `ssport` Sport et loisirs | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | sport_loisirs | ok | ok | ok | ok | retail | — | ok | OK |
| `sbrico` Brico et outillage | ok | ok | ok | ok | ok | ok | ok | com | ok | ok | ok | ok | ~ VECTORIEL (+ petits sprites HD) | — | — | — | ok | retail | — | ok | manque sprite |

### Équipements publics de la ville, mall et aéroport (PUB)

| objet | nom | description | emprise | sprite | éclairage | sprite propre | enseigne | infobulle de survol | intérieur | verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| `stadium` Stade | ok | ok | ok | stade_sport | ok | ~ même sprite que sport, mon:stadium2 | ~ aucune enseigne | ok | — | manque sprite propre, enseigne |
| `stadium2` Stade | ok | ~ sans l'effet chiffré (« +N d'humeur ») : « Loisirs » | ok | stade_sport | ok | ~ même sprite que sport, mon:stadium | ~ aucune enseigne | ok | — | manque description, sprite propre, enseigne |
| `hall` Hôtel de ville | ok | ok | ok | mairie | ok | ok | ok | ok | — | OK |
| `telecom` Tour de télécommunications | ok | ok | ok | station_tv | ok | ~ même sprite que tv | ~ aucune enseigne | ok | — | manque sprite propre, enseigne |
| `hospital` Hôpital | ok | ok | ok | hopital | ok | ok | ok | ok | — | OK |
| `police` Commissariat de police | ok | ok | ok | commissariat | ok | ok | ok | ok | — | OK |
| `fire` Caserne de pompiers | ok | ok | ok | caserne_pompiers | ok | ok | ok | ok | — | OK |
| `lycee` Lycée | ok | ok | ok | ecole | ok | ~ même sprite que mon:college, mon:maternelle, mon:garderie | ok | ok | — | manque sprite propre |
| `college` Collège | ok | ok | ok | ecole | ok | ~ même sprite que mon:lycee, mon:maternelle, mon:garderie | ok | ok | — | manque sprite propre |
| `maternelle` École maternelle | ok | ok | ok | ecole | ok | ~ même sprite que mon:lycee, mon:college, mon:garderie | ok | ok | — | manque sprite propre |
| `garderie` Crèche et garderie | ok | ok | ok | ecole | ok | ~ même sprite que mon:lycee, mon:college, mon:maternelle | ok | ok | — | manque sprite propre |
| `mall` Mall central | ok | ok | ok | extérieur « Guggenheim » dessiné en code (voulu par Rémy) | — | ok | ok | ok | panneau dédié | OK |
| `air` Aéroport | ok | ok | ok | ~ dessin en code (avions, aérogare, parking) ; aeroport_terminal.png en en-tête seulement | — | ok | ok | ok | panneau dédié | manque sprite |

### Services de la ville vivante (vv.SVC)

| objet | nom | classe | sprite HD | sprite propre | enseigne | enseigne de façade | infobulle de survol | présence en ville | verdict |
|---|---|---|---|---|---|---|---|---|---|
| `restaurant_terrasse` Restaurant en terrasse | ok | ok | restaurant_terrasse | ok | ok | ~ plaque flottante seulement | ok | ok | manque enseigne de façade |
| `cafe_de_quartier` Café de quartier | ok | ok | cafe_de_quartier | ok | ok | ok | ok | ok | OK |
| `boulangerie` Boulangerie | ok | ok | boulangerie | ok | ok | ok | ok | ok | OK |
| `boutique_mode` Boutique de mode | ok | ok | boutique_mode | ok | ok | ok | ok | ok | OK |
| `drugstore` Pharmacie | ok | ok | pharmacie | ok | ok | ok | ok | ok | OK |
| `barre_hlm` Barre HLM | ok | ok | barre_hlm | ok | — | — | ok | ok | OK |
| `immeuble_en_construction` Immeuble en construction | ok | ok | immeuble_en_construction | ok | — | — | ok | ok | OK |
| `eglise_de_village` Église | ok | ok | eglise_de_village | ok | — | — | ok | ok | OK |
| `station_service` Station-service | ok | ok | station_service | ok | ok | ~ plaque flottante seulement | ok | ok | manque enseigne de façade |
| `station_recharge_electrique` Station de recharge électrique | ok | ok | station_recharge_electrique | ok | ok | ~ plaque flottante seulement | ok | ok | manque enseigne de façade |
| `batiment_abandonne` Immeuble abandonné (friche) | ok | ok | batiment_abandonne | ok | — | — | ok | ok | OK |

### Outils de la barre (TOOL_META)

| objet | nom | sous-titre | couleur | icône | menu | verdict |
|---|---|---|---|---|---|---|
| `view` Main | ok | ok | ok | ok | barre fixe | OK |
| `link` Relier | ok | ok | ok | ok | agri | OK |
| `buyout` Racheter et raser | ok | ok | ok | ok | btp | OK |
| `keep` Racheter pour louer | ok | ok | ok | ok | btp | OK |
| `terra` Terrassement | ok | ok | ok | ok | btp | OK |
| `zone` Zonage | ok | ok | ok | ok | btp | OK |
| `ecom` Ma plateforme en ligne | ok | ok | ok | ok | com | OK |
| `up` Améliorer | ok | ok | ok | ok | barre fixe | OK |
| `xp` Petite exploitation | ok | ok | ok | ok | extr | OK |
| `xm` Moyenne exploitation | ok | ok | ok | ok | extr | OK |
| `xg` Grosse exploitation | ok | ok | ok | ok | extr | OK |
| `bull` Démolir | ok | ok | ok | ok | barre fixe | OK |

### Bâtiments de la ville (PNJ)

| objet | nom | pluriel | verdict |
|---|---|---|---|
| `house` maison | ok | ok | OK |
| `res` immeuble de logements | ok | ok | OK |
| `off` immeuble de bureaux | ok | ok | OK |
| `mon` bâtiment | ok | ok | OK |
| `park` parc | ok | ok | OK |

