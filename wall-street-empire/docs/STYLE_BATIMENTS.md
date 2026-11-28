# Charte des bâtiments — cohérence esthétique

Responsable : cohérence esthétique des bâtiments. Complète `docs/CHARTE_VISUELLE.md` (couleurs, géométrie, encodage) pour tout ce qui est un bâtiment.
Contrôle automatique : `tools/audit_esthetique.js` (rapport `docs/AUDIT_ESTHETIQUE.md`) et `tools/tests/t125_esthetique.js`.

Verdict de Rémy à l'origine de cette charte : « Je ne veux pas voir des trucs de type jouet sur les collèges et les écoles […] il faut une cohérence esthétique assurée partout. »

## 1. Registre

- **Réalisme européen contemporain** : une ville française ou européenne d'aujourd'hui (immeubles de ville en enduit et pierre, brique, ardoise, zinc, tuile ; équipements publics sobres ; tours de bureaux vitrées). Pas de dessin animé, pas de maquette en jouet, pas d'« icône de jeu mobile ».
- **La fonction se lit par l'architecture**, jamais par un pictogramme géant : une école a une cour, un préau, une grille ; une pharmacie a une devanture et sa croix verte sur potence ; un café a une terrasse et un store ; un hôpital a des bandeaux vitrés, un hall et un auvent des urgences.
- **Le nom est écrit par le jeu**, sur un bandeau vierge de la façade (`SF`, `SIGN_FACE`) ou sur une plaque flottante. Aucun texte, aucune lettre, aucun chiffre, aucun logo dans les images.

## 2. Palette et matériaux

| Famille | Couleurs (sRGB) | Usage |
|---|---|---|
| Enduits | `#e7dcc4` crème, `#e9e0cc` pierre claire, `#e3e0d8` gris chaud, `#eeebe4` blanc cassé | murs des immeubles de ville, écoles, équipements |
| Pierre | `#d8cfbd`, `#ddd3bf` (taille), `#b9b3a8` (soubassement) | rez-de-chaussée, cordons, chaînages, frontons |
| Brique | `#9d5f47`, `#a0654c`, `#a7735a`, joints `#cdbfac` | collège, aile du lycée, rez-de-chaussée de l'hôpital |
| Toitures | ardoise `#717a83`, zinc `#8b949b`, tuile `#bf7b54`, membrane `#8f9293` | jamais de toit bleu vif, rose, rouge pur |
| Menuiseries | blanc `#ebe8e1`, anthracite `#3a3e44` | fenêtres, portes |
| Vitrages | dégradé ciel `#9fb3c4` → `#2f3c49`, vitrines éclairées chaudes | jamais de cyan fluo |
| Végétation | verts désaturés `#4f6e37`–`#6f8f4a` | arbres, haies, pelouses |
| Accent unique | vert pharmacie `#3fa456`, bleu ardoise `#4f5f73`, stores `#2f5a48` / `#6d2f2f` / `#8a6a44` | une seule couleur vive par bâtiment, ≤ 15 % de la surface |

Les teintes de terre (brique, tuile, bois : teinte 5-45°) ne comptent pas comme couleurs vives. L'audit mesure la part de pixels vifs (S > 0,6) hors teintes de terre.

## 3. Lumière, ombre, projection

- Projection isométrique 2:1 exacte (caméra orthographique, azimut 45°, élévation 30°) : la dalle d'une case est un losange de 396 × 198 px dans la source (132 × 66 px monde).
- Soleil haut-gauche : flanc avant-gauche (face +y de la grille, « L ») éclairé, flanc avant-droit (« R ») à l'ombre, ombres portées vers la droite ; ciel diffus froid, rebond du sol chaud ; occlusion ambiante légère au pied des murs et sous les avant-toits.
- Dalle de parcelle fine (béton, 0,35 m) à flancs visibles, qui couvre **toute** l'emprise logique : 1 × 1, 2 × 2 (collège, hôtel de ville), 3 × 2 (lycée, dalle rectangulaire dessinée sur toute l'emprise), 3 × 3 (hôpital).

## 4. Échelle

- 1 case ≈ 10 m. Étage courant 3,2 à 3,6 m (≈ 0,35 case, ≈ 80 px source, ≈ 33 px monde × 2 à zoom 1) ; rez-de-chaussée commercial ou public 3,8 à 4,6 m.
- Fenêtres 1,1 à 1,6 m de large, 1,6 à 2,5 m de haut, allège 0,9 m, appuis et linteaux saillants ; travées régulières de 2 à 2,5 m.
- Définition : ≥ 396 px source par case (au plus 400 px gardés par le build). L'audit signale toute image agrandie plus de 1,7 fois en vue rapprochée (zoom 1,4, dpr 2).

## 5. Enseignes

- Bandeau vierge clair (`#f2efe7`) au-dessus de la devanture ou de l'entrée, sur la face L (et R pour un commerce d'angle) ; le jeu y peint le nom (police du jeu, filet d'accent de la charte).
- Pharmacie : **croix verte à bras égaux** (croix grecque) dans un caisson carré sur potence, perpendiculaire à la façade. Jamais de croix latine, jamais de bâtiment en forme de croix.
- Hôpital : pas d'emblème de la Croix-Rouge (protégé) ni de lettre « H » ; la fonction se lit au hall et à l'auvent des urgences ; le jeu écrit HÔPITAL.

## 6. Interdits

- Style **jouet** : objets géants sur un toit (cahier, tasse, couverts, baguette, cintre), toits monochromes vifs, fenêtres multicolores, proportions de maquette.
- Couleurs saturées hors accent unique ; néon ; cyan, rose, jaune fluo.
- **Croix religieuse** hors d'une église ; tout symbole religieux, politique ou protégé sur un bâtiment civil.
- **Texte** dans l'image (lettres, chiffres, logos, marques réelles).
- Aplats sans détail : prisme lisse, cube sans fenêtres (tour de repli vectorielle). Toute tour de la ville doit avoir un sprite HD avec étages lisibles, montants, couronnement.
- Repli vectoriel ou atlas basse définition visible au démarrage.

## 7. Production

1. Sprite livré par l'équipe d'images (`tools/factory_ai/RETOURS.md`) selon cette charte, ou
2. **Rendu procédural 3D** : `tools/sprites_procedural/` (Three.js 0.160.0 dans Chromium headless) : `batiments.js` décrit le bâtiment en mètres (volumes, toits, fenêtres en saillie, corniches, textures de brique, d'enduit, d'ardoise générées), `lib3d.js` l'éclaire et le projette, `render.js` écrit `assets/phase2_hd/<nom>.png` et `meta.json` (losange exact de la dalle et bandeaux d'enseigne, repris par `tools/build.py` et `SF`).
   `cd wall-street-empire/tools/sprites_procedural && npm install` puis `NODE_PATH=$(npm root -g) node wall-street-empire/tools/sprites_procedural/render.js [noms…] [--out dossier]`.
3. Brancher : `P2_NAMES` (et `P2_FP` si plusieurs cases) dans `tools/build.py`, `VV_MON` / `VV_SVC_SPR` / `SPEC_SPR` et `SF` dans le jeu ; garder l'ancien sprite en repli (`VV_MON_ALT`).
4. Juger à l'œil : capture du jeu au zoom proche à côté des voisins (lumière, saturation, hauteur d'étage, taille des fenêtres), puis `tools/audit_esthetique.js --md` et `t125`.
