# Audit visuel de la carte (passe 55)

Généré par `tools/audit_visuel.js` : chaque élément est rendu seul dans un canevas instrumenté ; on compte les images HD (sprites `assets/phase2_hd`, `factory_hd`, `city_hd`, `hq`, sprites HD dérivés par recoloration), l'atlas Kenney basse définition et les opérations vectorielles. « Part code » = pixels de l'image finale identiques au rendu sans images (le dessin en code réellement visible) / pixels peints. « Disque/losanges » = grands disques (rayon ≥ 25 px) ou petits losanges pleins répétés (≥ 4 de même couleur) : le repli générique banni.

Bilan : 209 éléments — HD 174 · procédural 27 · HD + code 8. Valeurs non finies : 0. Erreurs de page : 0.

## Corrections de la passe 55

- **Gisements** : la branche générique de `drawDeposit` (grand disque clair + 5 losanges blancs, sur gravier, sable, calcaire et tout gisement sans sprite) est supprimée. Gravier, sable, calcaire, soufre et terres rares ont un sprite HD dérivé (`P2_RECOL` : `gisement_bauxite`, `gisement_potasse`, `gisement_zinc`, `gisement_graphite` dont la luminance est remappée sur 3 teintes sobres) : même dalle, même éclairage, même emprise que les 17 autres. Sans sprite du tout, repli `depProc` : terre aux contours bruités fondue dans l'herbe + 2-3 tas en volume (flanc éclairé haut-gauche, flanc à l'ombre, ombre portée bas-droite), nappe sombre pour pétrole et gaz.
- **Terre sous les gisements** : la tache de terre de chaque case de gisement est plus petite (62-78 % au lieu de 85-120 %) et plus légère (opacité 45-70 % modulée par un bruit) : plus de grande tache brune cernée.
- **Zones fertiles** : maïs, colza, canne, coton, hévéa, vigne en parcelles HD (champ de blé HD recoloré), comme les fermes ; plus d'aplat à traits.
- **Mines** : plus de bloc Kenney dessiné sous les mines HD. **Centre de concassage** : reprend la carrière HD. **Centre télécom** : reprend la station média HD.
- **Caserne, commissariat** : palette ramenée à la charte (brique patinée, pierre grise, ardoise ; plus de gyrophare rouge/bleu ni de rouge vif), portes rainurées en traits au lieu de lamelles.
- **Geyser de pétrole** : flaque de base réduite (plus de grand disque plein).
- Routes : la part de code (≈ 25 %) est la sous-couche d'asphalte voulue sous les pièces à centre transparent (charte). Mall : parvis, voitures et passants animés dessinés en code par-dessus le sprite HD (passe 45). Aéroport : composition procédurale de la passe 49 (sprite commandé, 55-4).

Qualité : **bonne** = sprite HD seul ; **correcte** = sprite HD + petits détails animés en code (fumée, scintillement, enseigne) ou dessin vectoriel sobre conforme à la charte ; **basse déf.** = atlas Kenney ; **à refaire** = repli disque/losanges.

## Bâtiments

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| Logements (`res`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Tour Tech (`tech`) | HD · 1 img HD, 0 atlas, 2 op. code, part code 1 % | oui | bonne | aucune |
| Entrepôt (`wh`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Entrepôt logistique en ligne (`ewh`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Centrale électrique (`plant`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Centrale solaire (`solar`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Éolienne (`wind`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Centrale nucléaire (`nuclear`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Pylône / ligne aérienne (`pylon`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | composition iso sobre (pylône HD) |
| Câble enterré (`cable`) | procédural · 0 img HD, 0 atlas, 2 op. code, part code 100 % | non | correcte | réseau (ligne tracée) |
| Pipeline (`pipeline`) | procédural · 0 img HD, 0 atlas, 4 op. code, part code 100 % | non | correcte | réseau (conduite tracée) |
| Centre de R&D (`rd`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Data center (`dc`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Siège social (`hq`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Banque (`bank`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 1 % | oui | bonne | aucune |
| Puits pétrole (`well`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine de fer (`miron`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine charbon (`mcoal`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine cuivre (`mcopper`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine d'or (`mgold`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine de nickel-chrome (`mnicr`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine de bauxite (`mbauxite`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine de lithium (`mlithium`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine de zinc (`mzinc`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine de graphite (`mgraphite`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Puits de gaz naturel (`gwell`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Carrière de silice (`qsilica`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Carrière d'argile (`qclay`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine de sel gemme (`qsalt`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine de phosphate (`mphos`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Mine de potasse (`mpotash`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Ferme de blé (`fwheat`) | HD · 4 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Plantation de canne (`fsugar`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Plantation de coton (`fcotton`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Plantation d'hévéas (`frubber`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Vignoble (`fvine`) | HD · 3 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Culture de maïs (`fcorn`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Culture de colza (`frapeseed`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Élevage de bovins (`fcattle`) | HD · 5 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Élevage de poulets (`fchicken`) | HD · 5 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Élevage de porcs (`fpig`) | HD · 5 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Élevage de moutons (`fsheep`) | HD · 5 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Camp bûcherons (`logging`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Carrière de granulats (`qgravel`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | passe 79 : remplace la carrière de gravier et la sablière ; concasseur (investissement) dessiné en code sobre par-dessus le sprite — commande Cowork 79-1 (carrière avec concasseur) |
| Carrière calcaire (`qlime`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Entreprise de BTP (`btp`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Agence immobilière (`immo`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Fonderie d'or (`foundry`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Petite usine (`f1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Usine moyenne (`f2`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Grande usine (`f3`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Petit marché (`s1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Supermarché (`s2`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Hypermarché (`s3`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Terminal portuaire (`port`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Tour de location (`off`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Station média (`tv`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Équipement sportif (`sport`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Méga-usine (`f4`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Méga-centre commercial (`s4`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Concession automobile (`sauto`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Maison du Numérique (`stech`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Maison de luxe (`slux`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Boutique de mode (`smode`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Pharmacie · drugstore (`spharma`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Maison et déco (`shome`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Sport et loisirs (`ssport`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| Brico et outillage (`sbrico`) | HD + code · 1 img HD, 0 atlas, 28 op. code, part code 98 % | oui | correcte | composition primitives (drawSpecShop) — sprite brico_outillage commandé (n°9, rappel 55-7) |

## Ville (PNJ)

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| house (`house#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| house (`house#2`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| house (`house#3`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| res:bas (`res:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| res:bas (`res:bas#2`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| off:bas (`off:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| res:bas (`res:bas#3`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| mon:fire:bas (`mon:fire:bas#1`) | procédural · 0 img HD, 0 atlas, 17 op. code, part code 100 % | non | correcte | composition iso sobre (brique patinée) — commande Cowork 55-2 |
| mon:college:bas (`mon:college:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| off:bas (`off:bas#2`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| off:bas (`off:bas#3`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| mon:lycee:bas (`mon:lycee:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| res:moyen (`res:moyen#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| park:bas (`park:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| res:moyen (`res:moyen#2`) | HD · 1 img HD, 0 atlas, 2 op. code, part code 1 % | oui | bonne | aucune |
| res:moyen (`res:moyen#3`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| mon:police:bas (`mon:police:bas#1`) | procédural · 0 img HD, 0 atlas, 18 op. code, part code 100 % | non | correcte | composition iso sobre (pierre grise) — commande Cowork 55-3 |
| off:moyen (`off:moyen#1`) | HD · 1 img HD, 0 atlas, 2 op. code, part code 2 % | oui | bonne | aucune |
| off:moyen (`off:moyen#2`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| mon:stadium:bas (`mon:stadium:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| res:tour (`res:tour#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| off:tour (`off:tour#1`) | HD · 1 img HD, 0 atlas, 2 op. code, part code 1 % | oui | bonne | aucune |
| off:moyen (`off:moyen#3`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| mon:hospital:bas (`mon:hospital:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| res:tour (`res:tour#2`) | HD · 1 img HD, 0 atlas, 4 op. code, part code 4 % | oui | bonne | aucune |
| mon:maternelle:bas (`mon:maternelle:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| mon:stadium2:bas (`mon:stadium2:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| mon:garderie:bas (`mon:garderie:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| mon:hall:bas (`mon:hall:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| mon:telecom:bas (`mon:telecom:bas#1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | reprend la station média HD (station_tv) |
| grand mall (`mon:mall`) | HD + code · 2 img HD, 0 atlas, 1166 op. code, part code 33 % · DISQUE/LOSANGES | oui | à refaire | sprite HD + parvis animé en code (passe 45) |
| aéroport (`mon:air`) | procédural · 0 img HD, 0 atlas, 104 op. code, part code 100 % · DISQUE/LOSANGES | non | à refaire | composition procédurale (passe 49) — commande Cowork 55-4 |

## Gisements

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| pétrole (`oil`) | HD + code · 1 img HD, 0 atlas, 19 op. code, part code 28 % | oui | correcte | sprite HD + geyser animé |
| fer (`iron`) | HD · 1 img HD, 0 atlas, 11 op. code, part code 14 % | oui | bonne | sprite HD + éclat animé |
| charbon (`coal`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| cuivre (`copper`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| or (`gold`) | HD · 1 img HD, 0 atlas, 13 op. code, part code 5 % | oui | bonne | sprite HD + scintillement |
| granulats, gravier et sable (`gravel`) | HD (dérivé de gisement_bauxite) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | sprite HD dérivé (gisement_bauxite recoloré gris) — était disque + losanges |
| calcaire (`limestone`) | HD (dérivé de gisement_potasse) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | sprite HD dérivé (gisement_potasse recoloré calcaire) — était disque + losanges |
| nickel-chrome (`nickel`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| bauxite (`bauxite`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| lithium (`lithium`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| silice (`silica`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| sel gemme (`salt`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| phosphate (`phosphate`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| gaz naturel (`gas`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| zinc (`zinc`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| argile (`clay`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| potasse (`potash`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| graphite (`graphite`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| chrome (`chrome`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| sulfur (`sulfur`) | HD (dérivé de gisement_zinc) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | ancien gisement converti au chargement ; sprite HD dérivé (gisement_zinc recoloré soufre) |
| rare (`rare`) | HD (dérivé de gisement_graphite) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | ancien gisement converti au chargement ; sprite HD dérivé (gisement_graphite recoloré) |

## Gisements (repli sans sprite)

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| pétrole (repli) (`oil:repli`) | procédural · 0 img HD, 0 atlas, 3 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| fer (repli) (`iron:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| charbon (repli) (`coal:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| cuivre (repli) (`copper:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| or (repli) (`gold:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| gravier (repli) (`gravel:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| sable (repli) (`sand:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| calcaire (repli) (`limestone:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| nickel-chrome (repli) (`nickel:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| bauxite (repli) (`bauxite:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| lithium (repli) (`lithium:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| silice (repli) (`silica:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| sel gemme (repli) (`salt:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| phosphate (repli) (`phosphate:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| gaz naturel (repli) (`gas:repli`) | procédural · 0 img HD, 0 atlas, 3 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| zinc (repli) (`zinc:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| argile (repli) (`clay:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| potasse (repli) (`potash:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| graphite (repli) (`graphite:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| chrome (repli) (`chrome:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| sulfur (repli) (`sulfur:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |
| rare (repli) (`rare:repli`) | procédural · 0 img HD, 0 atlas, 31 op. code, part code 100 % | non | correcte | repli sobre (terre fondue + tas ombrés), utilisé seulement si le sprite manque |

## Forêts

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| bois (`wood`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |

## Zones fertiles

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| blé (`wheat`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| canne à sucre (`sugar`) | HD (dérivé de champ_ble_vert) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | parcelle HD dérivée |
| coton (`cotton`) | HD (dérivé de champ_ble_vert) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | parcelle HD dérivée |
| caoutchouc (`rubber`) | HD (dérivé de champ_ble_vert) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | parcelle HD dérivée |
| raisin (`grapes`) | HD (dérivé de champ_ble_vert) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | parcelle HD dérivée |
| maïs (`corn`) | HD (dérivé de champ_ble_vert) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | parcelle HD (champ_ble_vert recoloré maïs) — était aplat + traits |
| colza (`rapeseed`) | HD (dérivé de champ_ble_mur) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | parcelle HD (champ_ble_mur recoloré colza) |

## Sol et eau

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| herbe_c (`herbe_c`) | HD (dérivé de herbe_c) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| herbe_d (`herbe_d`) | HD (dérivé de herbe_d) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| herbe_a (`herbe_a`) | HD (dérivé de herbe_a) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| herbe_b (`herbe_b`) | HD (dérivé de herbe_b) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| rivage_sable (`rivage_sable`) | HD (dérivé de rivage_sable) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| eau_calme (`eau_calme`) | HD (dérivé de eau_calme) · 1 img HD, 0 atlas, 1 op. code, part code 0 % | oui | bonne | aucune |
| sol_ville_pave (`sol_ville_pave`) | HD (dérivé de sol_ville_pave) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| sol_quai_beton_a (`sol_quai_beton_a`) | HD (dérivé de sol_quai_beton_a) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| sol_quai_beton_b (`sol_quai_beton_b`) | HD (dérivé de sol_quai_beton_b) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| eau_rivage_quai (`eau_rivage_quai`) | HD (dérivé de eau_rivage_quai) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| sol_port_asphalte (`sol_port_asphalte`) | HD (dérivé de sol_port_asphalte) · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |

## Routes

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| route_bout_sw (`route_bout_sw`) | HD (dérivé de route_bout_sw) · 1 img HD, 0 atlas, 1 op. code, part code 16 % | oui | bonne | aucune |
| route_droite_ne (`route_droite_ne`) | HD (dérivé de route_droite_ne) · 1 img HD, 0 atlas, 1 op. code, part code 18 % | oui | bonne | aucune |
| route_coude_se_sw (`route_coude_se_sw`) | HD + code (dérivé de route_coude_se_sw) · 1 img HD, 0 atlas, 1 op. code, part code 26 % | oui | correcte | vérifier les détails dessinés en code (effets, enseigne, chemins) — sobres |
| route_droite_nw (`route_droite_nw`) | HD (dérivé de route_droite_nw) · 1 img HD, 0 atlas, 1 op. code, part code 19 % | oui | bonne | aucune |
| route_t_ne (`route_t_ne`) | HD + code (dérivé de route_t_ne) · 1 img HD, 0 atlas, 1 op. code, part code 24 % | oui | correcte | vérifier les détails dessinés en code (effets, enseigne, chemins) — sobres |
| route_croix (`route_croix`) | HD + code (dérivé de route_croix) · 1 img HD, 0 atlas, 1 op. code, part code 27 % | oui | correcte | vérifier les détails dessinés en code (effets, enseigne, chemins) — sobres |
| route_coude_sw_nw (`route_coude_sw_nw`) | HD (dérivé de route_coude_sw_nw) · 1 img HD, 0 atlas, 1 op. code, part code 19 % | oui | bonne | aucune |
| route_t_nw (`route_t_nw`) | HD + code (dérivé de route_t_nw) · 1 img HD, 0 atlas, 1 op. code, part code 24 % | oui | correcte | vérifier les détails dessinés en code (effets, enseigne, chemins) — sobres |
| route_t_se (`route_t_se`) | HD + code (dérivé de route_t_se) · 1 img HD, 0 atlas, 1 op. code, part code 21 % | oui | correcte | vérifier les détails dessinés en code (effets, enseigne, chemins) — sobres |
| route_t_sw (`route_t_sw`) | HD (dérivé de route_t_sw) · 1 img HD, 0 atlas, 1 op. code, part code 19 % | oui | bonne | aucune |
| route_bout_se (`route_bout_se`) | HD (dérivé de route_bout_se) · 1 img HD, 0 atlas, 1 op. code, part code 15 % | oui | bonne | aucune |
| route_coude_ne_se (`route_coude_ne_se`) | HD (dérivé de route_coude_ne_se) · 1 img HD, 0 atlas, 1 op. code, part code 19 % | oui | bonne | aucune |
| route_coude_ne_nw (`route_coude_ne_nw`) | HD (dérivé de route_coude_ne_nw) · 1 img HD, 0 atlas, 1 op. code, part code 14 % | oui | bonne | aucune |
| route_bout_ne (`route_bout_ne`) | HD (dérivé de route_bout_ne) · 1 img HD, 0 atlas, 1 op. code, part code 9 % | oui | bonne | aucune |

## Décor

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| arbre isolé (`arbre_isole`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| rochers (`rochers_0`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| rochers (`rochers_1`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| décor de quai (`quai`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| conteneurs (`conteneurs`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| grue portique (`grue`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| auge_foin (`auge_foin`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| balles_foin (`balles_foin`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| meule_foin (`meule_foin`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |

## Véhicules

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| porte-conteneurs (`navire`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| veh_argent (`veh_argent`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| veh_blanc (`veh_blanc`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| veh_bleu (`veh_bleu`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| veh_jaune (`veh_jaune`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| veh_noir (`veh_noir`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| veh_orange (`veh_orange`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| veh_rouge (`veh_rouge`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| veh_vert (`veh_vert`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| voiture_ville_a (`voiture_ville_a`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| voiture_ville_b (`voiture_ville_b`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| veh_pickup (`veh_pickup`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| veh_camionnette (`veh_camionnette`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| camion_ville (`camion_ville`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |

## Animaux

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| animal_vache (`animal_vache`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| animal_mouton (`animal_mouton`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| animal_cochon (`animal_cochon`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| animal_poule (`animal_poule`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |

## Personnages

| Élément | Rendu actuel | HD ? | Qualité | Action |
|---|---|---|---|---|
| fermier_seau (`fermier_seau`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| vendangeur (`vendangeur`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |
| vigneron_hotte (`vigneron_hotte`) | HD · 1 img HD, 0 atlas, 0 op. code, part code 0 % | oui | bonne | aucune |

## Intérieur des usines (vue immersive)

Sprites `FAC` (factory / factory_hd) chargés : 98 sur 98. Hors carte : non rendus ici (voir t12, t17).

## Commandes Cowork en attente

Voir la fin de `tools/factory_ai/RETOURS.md` (commandes 55-1 et suivantes). Les éléments concernés gardent en attendant un sprite HD voisin ou un repli procédural sobre.
