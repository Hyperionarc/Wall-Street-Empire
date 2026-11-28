# Journal du responsable de la cohérence esthétique des bâtiments

Domaine : l'ensemble des bâtiments affichés (ville, équipements publics, services de quartier, bâtiments du joueur) forme un tout homogène : même registre réaliste européen, même définition, même lumière, calage isométrique exact (ancrage, emprise entière, échelle, profondeur). Charte : `docs/STYLE_BATIMENTS.md`. Hors domaine (autres responsables, non touchés) : port, intérieur et panneau du Mall, vente aux commerces, nautisme ; l'extérieur du Mall et l'aéroport restent dessinés par le code (choix de leurs responsables).

## Indicateurs et mesure

| Indicateur | Mesure | État (28 nov.) |
|---|---|---|
| Aucun aplat sans détail parmi les bâtiments de la ville au démarrage | `tools/audit_esthetique.js` (arêtes < 0,1 et aplats > 55 %), t125 | atteint (avant : tour en atlas empilé et prisme bleu vectoriel) |
| Aucun repli vectoriel ou atlas dans la ville au démarrage | audit, t125 | atteint (mall et aéroport : dessin du code voulu) |
| Écoles distinctes, européennes, à l'emprise du barème | t125 (sprite par établissement, losange = cases × 396 px, calage) | atteint : maternelle 1×1, crèche 1×1, collège 2×2, lycée 3×2 |
| Aucun pictogramme géant, croix religieuse ou texte sur un bâtiment civil | revue à l'œil + charte ; t125 (services de quartier) | atteint pour la ville ; restent les sprites du joueur listés plus bas |
| Définition ≥ 0,6 px source par px écran en vue rapprochée | audit | équipements et ville : atteint sauf stade ; joueur : voir `docs/AUDIT_ESTHETIQUE.md` |

## Lot 1 (28 nov.) : verdict de Rémy sur le centre-ville

Constat (captures `docs/audit_esthetique/avant_*.jpg`) : la « tour bleue sans détail » était le repli `drawTowerProc` (prisme dégradé, case (28, 39)) et une autre tour de 14 étages tombait sur l'atlas Kenney empilé (case (26, 21)) : leur groupe PNJ tiré au hasard (« banque ») n'a aucun sprite au-delà de 10 étages. Les « deux bâtiments verts avec une croix » : `pharmacie.png`, un bâtiment en forme de croix verte néon (deux exemplaires dans la ville). La « pancarte marron cartoon » : la tasse géante sur le toit brun du café ; même défaut pour le restaurant (couverts), la boulangerie (baguette), la boutique (cintre sur toit rose), la mairie (toit bleu vif à pictogramme). Les quatre écoles partageaient `ecole.png` (cahier géant sur toit bleu, fenêtres multicolores, 160 px par case pour le collège : flou). L'hôpital portait les mots HOSPITAL / EMERGENCY dans l'image ; le commissariat flottait 0,4 TH au-dessus de sa case (dalle partielle).

Fait :
1. **Méthode de production** : `tools/sprites_procedural/` — rendu 3D procédural (Three.js 0.160.0 dans Chromium headless via Playwright, WebGL SwiftShader) : bâtiment décrit en mètres (volumes, toits à deux pans / en croupe / terrasse, fenêtres à dormant, meneau, appui et linteau saillants, corniches, chaînages, fronton, horloge sans chiffres, lucarnes, balcons en fer forgé, stores, arbres à houppier déformé), textures générées (brique, enduit, pierre de taille, ardoise, zinc, tuile, pavés, cour tracée), projection orthographique 2:1 exacte (azimut 45°, élévation 30°, losange de 396 px par case mesuré sur les sprites HD), soleil haut-gauche + ciel + rebond, ombres PCF, occlusion ambiante GTAO, sur-échantillonnage ×2. `meta.json` donne le losange exact de la dalle et les bandeaux d'enseigne (repris par `build.py` et `SF`).
2. **Douze rendus** (`assets/phase2_hd`) : `ecole_maternelle`, `creche`, `college` (2×2, L en brique, préau, cour de sport), `lycee` (3×2 dessiné sur toute l'emprise : corps en pierre, avant-corps à fronton et horloge, aile en brique, cour plantée, grille, portail), `pharmacie_quartier` (croix verte à bras égaux sur potence), `cafe_quartier`, `restaurant_quartier`, `boulangerie_quartier`, `boutique_quartier`, `hotel_de_ville` (2×2, campanile, fronton, perron), `hopital_ville` (3×3, sans texte ni emblème), `commissariat_ville`. Anciennes images gardées en repli (`VV_MON_ALT`, `VV_SVC_SPR`).
3. **Tours** : `citySpr` — une tour PNJ hors des plages de son groupe prend une tour de bureaux HD (plus d'atlas empilé ni de prisme).
4. **Calage** : le losange détecté au build (rangée la plus large) se trompait sur une dalle rectangulaire (lycée décalé d'un tiers de case) : les rendus procéduraux fournissent leur losange exact.
5. **Audit** `tools/audit_esthetique.js` (+ `--md` → `docs/AUDIT_ESTHETIQUE.md` et vignettes) ; test `t125_esthetique.js` (échoue sur la version d'avant : 15 FAIL, passe sur celle-ci).

Emprunté comme principe : rien de Capitalism Lab ici ; la référence est l'architecture scolaire et municipale française (groupe scolaire Jules-Ferry, hôtel de ville à campanile, croix de pharmacie à potence). Conçu de façon originale : la méthode (rendu procédural calé sur la grille du jeu) et chaque bâtiment.

## Reste à faire (carnet)
- Bâtiments du joueur sous-définis ou mal calés (2×1 dessinés en 1,5 case, data center plat et flou, méga-centre, supermarché, stade) : voir `docs/AUDIT_ESTHETIQUE.md` ; candidats au rendu procédural ou à la commande d'assets.
- Couleurs vives à surveiller : station-service (52 %), stade, tours vitrées bleues.
- Brico et outillage (`sbrico`) : toujours en primitives (commande n° 9 / 17 bis).
