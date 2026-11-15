# Phase 2 : ordre de production (20 lots de 20 images = 400)

## Principe et justification

1. **La première minute fixe tout.** Le joueur démarre en (74, 63), dans la **zone portuaire** (`START`, `PORT`), pas en ville (`CITY` : cases 12-48). L'écran montre : sol de port et de quai, routes (grille tous les 6, `GRID`), mer, navires, conteneurs et grues, quelques arbres, des voitures (`spawnCars`, `urbanRoads` zones 1-2). Lots 1 à 4.
2. **Puis ce que le joueur construit en premier** : missions `m1` (puits ou mine), `mr` (route), `mwood`, `m3` (petite usine `f1`), `m2` (petit marché `s1`), `mq` (carrière). Ce sont les bâtiments sans palier (`tier` absent). Chaque pose passe par l'état « chantier » (`born`, `grow`), donc les chantiers viennent avant les bâtiments. Lots 4 à 9.
3. **La ville existante** (maisons, tours, sol de ville) n'apparaît que quand le joueur déplace la caméra : lots 10 à 12.
4. **Paliers suivants** (`tier` 1 : `f2`, `s2`, `tech`, `hq`, `foundry`, `btp`, `immo`, `off`, `tv`, `sport`, `mgold`, `rd`, `dc` ; `tier` 2 : `f3`, `s3`, `bank` ; `tier` 3 : `f4`, `s4`) dans l'ordre où le joueur les débloque (`TIERS` : 1,25 M$, 3,5 M$, 12,5 M$). Lots 14 à 18.
5. **Fermes** (40 images, en partie sur code à adapter pour les stades) après la ville, avant les paliers : lots 12 à 14.
6. **Énergie, monuments, ruines, vitrines** en fin : peu visibles tôt, ruines non codées, vitrines après stabilisation du style.
7. **Un lot = 20 images = une planche d'aperçu** (`taille_lot_apercu` 20) : validation et commit/push après chaque lot. Le lot 1 sert d'essai de style de la phase 2 : à valider par le propriétaire avant le lot 2.
8. Une famille peut chevaucher deux lots ; le manifeste garde l'ordre ci-dessous (`lot` = `L01`...).

## Lots

| Lot | Contenu (images) | Pourquoi maintenant |
|---|---|---|
| L01 | sol zone portuaire 3, sol quai 3, eau 3, rivage 1, routes 10 sur 16 (droites 2, croix 1, coudes 4, isolé 1, bouts 2) | écran de départ : sol et routes sous les pieds |
| L02 | routes 6 (T 4, bouts 2), herbe 6, arbres 6, buissons 2 | raccords de routes ; décor de campagne et de port |
| L03 | port : conteneurs 6, grues 2, navires 3, terminal 3 ; véhicules 6 | quai et mer visibles dès le premier plan |
| L04 | véhicules 18 (reste) ; **vitrine accueil** ; chantiers 1 | circulation sur les routes ; premier visuel de présentation |
| L05 | chantiers 14 ; gisements 6 | chaque construction commence par un chantier |
| L06 | gisements 3 ; puits pétrole 3 ; mines (fer, charbon, cuivre) 14 | mission `m1` |
| L07 | mines 4 ; petite usine `f1` 6 ; entrepôt `wh` 6 ; petit marché `s1` 4 | missions `m3`, `m2` |
| L08 | `s1` 8 ; logements `res` 12 | `m2`, logements sans palier |
| L09 | `res` 15 ; camp de bûcherons 3 ; carrières 2 | `mwood`, `mq` |
| L10 | carrières 7 ; sol de ville 4 ; maisons NPC 9 | ville (caméra libre) |
| L11 | maisons NPC 15 ; tours NPC 5 | ville |
| L12 | tours NPC 9 ; fermes : hangars 11 | ville ; agriculture |
| L13 | hangar 1 ; champs 19 | agriculture (vérifier d'abord la décision sur les 3 stades) |
| L14 | champs 5 ; clôtures et tracteurs 4 ; BTP 3 ; `f2` 6 ; fonderie 2 | palier Entrepreneur |
| L15 | fonderie 1 ; `s2` 6 ; `immo` 6 ; mine d'or 6 ; tour tech 1 | palier 1 |
| L16 | tour tech 5 ; banque 6 ; tour de location 3 ; station média 3 ; sport 3 | palier 1-2 |
| L17 | sport 3 ; siège `hq` 3 ; R&D 3 ; data center 3 ; `f3` 6 ; `s3` 2 | palier 2 |
| L18 | `s3` 7 ; `f4` 3 ; `s4` 3 ; centrales 7 | paliers 2-3 |
| L19 | centrales 5 ; réseau (pylônes, câble, pipeline) 9 ; monuments 6 | fin de partie |
| L20 | monuments 5 ; parcs 2 ; ruines 5 ; vitrines 2 à 9 (8) | derniers, style stable |

Les décomptes sont l'allocation séquentielle des 400 lignes de `INVENTAIRE.md` dans cet ordre de priorité ; si une famille change de taille après validation de la phase 1, décaler les lots suivants sans changer l'ordre des priorités.

## Règles d'exécution par lot

- Avant : `git pull`, lire `RETOURS.md` et la section « Leçons de la phase 1 » de `CHARTE.md`.
- Pendant : refaire (`--seul <nom> --forcer`) tout rebut ; 3 essais maximum, puis le lister dans `JOURNAL.md`.
- Après : planche d'aperçu, commit, push sur `assets/phase2-*`, ne jamais fusionner dans `master`.
- Estimation de volume : 400 retenues, ~20 à 25 % de rebuts supposés, soit 480 à 500 générations (aucune mesure de durée disponible avant la phase 1).
