# Journal du Responsable Mouvements et stationnement

Responsabilité : tout ce qui bouge ou stationne dans le jeu est physiquement crédible en orientation. Jamais de marche arrière apparente, jamais de véhicule garé de travers.
Indicateur : `tools/audit_orientation.js` (rapport en bas de ce journal) et le test `t121_orientation.js`, qui échoue dès qu'un avion recule, qu'une voiture roule en marche arrière apparente ou en travers, ou qu'une voiture de parking n'est pas dans l'axe de sa place.

Retours de Rémy à l'origine : « tu peux arrêter de faire rouler des voitures en marche arrière ? » ; « Revois tout, car l'aéroport aussi est incohérent : avion qui recule, voiture garée à la perpendiculaire. »

## Méthode
L'audit mesure l'angle entre le cap de déplacement réel (déplacement de la position dessinée d'un pas à l'autre, ramené dans le plan u, v de la carte) et l'orientation dessinée (sprite, miroir et vue choisis par le code, ou cap du modèle). Plus de 100° : marche arrière. 50 à 100° : en crabe (en travers). Saut de plus de 12 px monde en 50 ms : téléportation. Pour un véhicule garé, l'écart entre l'axe dessiné et l'axe de sa place (à 180° près) ne doit pas dépasser 20°. Le code relève ce qu'il dessine dans `ORI` (inactif hors audit, aucun coût en jeu). La simulation est déterministe (hash, horloge d'animation figée par `WSE.air.anim`).
Le même audit lancé sur la version d'avant (`WSE_URL=…`) donne les chiffres « avant » : avions 2 286 pas à reculons et 3 809 en crabe sur 29 025 en 2 h d'animation ; voitures de la ville 346 sauts de voie au centre des carrefours en 60 s.

## Ce qui a changé (passe 121)
**Aéroport, avions.** Le départ commençait par un repoussage en marche arrière (segment `rev`) et le cap tournait par fondu pendant que la position changeait de direction d'un coup (glissement en crabe). Désormais :
- postes A1 et A2 alignés le long de l'aérogare, avion garé parallèle à la façade, nez vers la piste ; passerelle vers la porte avant ; tracteur et chariot à bagages dans l'axe de l'avion ;
- arrivée : approche dans l'axe, toucher, décélération, sortie de piste en demi-tour par la bretelle, voie de circulation, voie de retour le long de l'aire, demi-tour au bas de l'aire, remontée jusqu'au poste en marche avant ;
- départ : sortie du poste tout droit, traversée de la voie de circulation (la piste est réservée dès le bord de l'aire), virage à droite sur la piste, alignement (arrêt 1,5 s), course, envol ; atterrissages et décollages dans le même sens de piste (face au même vent) ;
- trajectoires faites de droites et d'arcs de cercle (tortue), cap = tangente, accélération constante par segment (vitesses continues aux raccords) ; la fin d'un atterrissage et le début d'un décollage tombent exactement sur la pose de l'avion garé ;
- ordre « premier arrivé, premier parti » : un avion n'entre en A1 (devant) que si A2 est libre ; A1 part toujours avant A2 ; le cycle d'animation garde ses propriétés (au plus 2 mouvements, un seul avion sur la piste, intervalles irréguliers) ;
- lignes de guidage jaunes tracées à partir des trajectoires réelles, barres d'arrêt devant le nez ; bretelle de départ déplacée au droit des postes ; avions un peu plus petits au sol (0,95 au lieu de 1,25 : deux avions tiennent l'un derrière l'autre) et grossissant avec l'altitude.

**Aéroport, parking et voie de dépose.** Les places (0,28 × 0,35 case, 4 rangées serrées) étaient plus petites que les voitures, qui débordaient sur la place voisine et sur la rangée d'en face ; aucune allée. Désormais deux rangées de 8 places à la taille réelle des voitures (0,27 × 0,40), de part et d'autre d'une allée de 0,5 case ; places dessinées (lignes latérales dans l'axe de la place, ligne de fond) ; chaque voiture est centrée dans sa place, dans son axe ; rangée du fond garée en marche arrière (avant vers l'allée), rangée de devant entrée en marche avant ; lampadaires hors de l'allée. Voie de dépose : les taxis et navettes arrivaient en marche arrière (sprite avant tourné vers l'autre bout) ; ils sont maintenant dessinés selon leur cap (vue de dos à l'arrivée), font demi-tour en arc de cercle au lieu de glisser de côté, et l'arrêt est écourté quand la voiture suivante arrive (plus deux voitures au même arrêt). Test t94 : seuil de places ramené de 24 à 16, remplissage ≥ 40 %.

**Circulation urbaine.** Le correctif de Rémy (vue de dos quand la voiture remonte la rue) est conservé et généralisé par `vvVeh` (voie de dépose de l'aéroport comprise). Aux carrefours, la voiture changeait de voie d'un bond et pivotait d'un quart de tour sur place : elle suit maintenant une courbe (Bézier cubique tangente aux deux voies, de 80 % de la rue d'arrivée à 20 % de la suivante ; boucle tangente pour les demi-tours en cul-de-sac) et la vue dessinée suit la tangente. La vue arrière vectorielle (une boîte) est remplacée par un petit modèle 3D en facettes (caisse, habitacle vitré, lunette, toit, feux, plaque vierge, roues ; pick-up avec benne ; fourgon et camion avec portes arrière), éclairé de la gauche, à la teinte du modèle (teintes de `voiture_ville_a/b` corrigées : rouge et bleu comme leurs sprites).
Sprites de dos : `vvVeh` prend automatiquement `<modèle>_ar` (avant vers le haut à gauche, convention de la commande n° 17 bis), puis `voiture_dos` pour les voitures, sinon le modèle en facettes ; vue avant de repli `voiture_face`. `tools/build.py` déclare ces noms (et `avion_ligne`, `avion_ligne_ar`, `bus_navette`, `taxi`) : un PNG déposé dans `assets/factory_hd` est branché sans autre modification.

**Navires.** Vérifié sur les images : le remorqueur (`port_remorqueur_ne`, passerelle à l'avant) a sa proue en haut à droite et descendait le couloir ouest ; le voilier a sa proue en bas à gauche et remontait le couloir est : tous deux en marche arrière. Ils échangent leurs couloirs (une ligne de `SHIP_SPR`, sprites inchangés). `port_navire_cargo_ne` a malgré son nom la proue en bas à gauche : il reste dans le couloir ouest. Table `SHIP_BOW` pour l'audit.

**Usines et sites (vues intérieures).** Les camions se mettent à quai en marche arrière, cabine vers l'extérieur : c'est la manœuvre réelle. Elle est désormais signalée comme une manœuvre (feux de recul blancs et gyrophare orange pendant la marche arrière) ; ils repartent en marche avant.

**Audités sans changement.** Troupeaux : miroir choisi selon le sens de marche à l'écran (bêtes de trois quarts face à gauche) : jamais à reculons, de profil quand elles s'éloignent (une seule vue livrée). Passants du mall : même principe. Voitures garées du mall (toit du parking, marché) : dans l'axe de leur place. Grues, conteneurs, engins du port : immobiles ou décor (domaine Urbanisme/port).

## Ce qui reste imparfait
- Vues de dos : le modèle en facettes se lit comme une voiture vue de l'arrière mais reste plus simple que les sprites HD avant ; il faut les vrais sprites `<modèle>_ar` (commande n° 17 bis, rappelée dans `tools/factory_ai/RETOURS.md`). Même chose pour les passants et les bêtes (une seule vue de face : de profil quand ils s'éloignent).
- Quatre vues seulement par véhicule : au milieu d'un virage la vue est arrondie au sens le plus proche (l'audit compte ces pas à part, ils ne sont ni en crabe ni à reculons : le déplacement suit la tangente).
- Avions : dessinés en primitives (pas de sprite `avion_ligne`). Engins des vues intérieures de sites (tracteur, débardeur, chargeuse) : boîtes orientées sur 4 axes, demi-tour sur place en bout de trajet, quelques trajets en diagonale.
- Bus et camions de piste à l'aéroport : aucun pour l'instant (seuls le tracteur et le chariot à bagages, garés) ; à ajouter avec `bus_navette`.

## Emprunté comme principe, conçu de manière originale
Principe emprunté à la circulation des jeux de gestion urbaine : les véhicules suivent des voies orientées et tournent en courbe. Conçu pour ce jeu : postes d'aéroport en « premier arrivé, premier parti » sans repoussage, trajectoires en arcs exactes, audit d'orientation instrumenté, modèle de dos en facettes teinté d'après le sprite avant.

<!-- AUDIT:debut (généré par tools/audit_orientation.js --md, ne pas éditer à la main) -->
### Mesures (2026-11-28, version actuelle)

Verdict : **aucune marche arrière, aucun véhicule garé de travers**.

| Entités | Pas mesurés | Marche arrière (> 100°) | En crabe (50–100°) | Garés | Garés de travers (> 20°) |
|---|---|---|---|---|---|
| Avions (2 h d'animation, pas 0,1 s) | 26053 | 0 | 0 (> 25°) | — | — |
| Voitures de la ville (60 s, 81 voitures, 7191 pas en virage) | 94815 | 0 | 0 | — | — |
| *Voitures, rendu d'avant (ligne droite, pivot au carrefour)* | 94519 | 0 | 0 | — | — |
| voiture | 0 | 0 | 0 | 0 | 0 |
| avion | 17 | 0 | 0 | 0 | 0 |
| aéroport : voie de dépose | 80 | 0 | 0 | 0 | 0 |
| aéroport : voiture garée | 0 | 0 | 0 | 1980 | 0 |
| navire | 0 | 0 | 0 | 0 | 0 |
| passant du mall | 3509 | 0 | 2605 | 0 | 0 |
| mall : voiture garée | 0 | 0 | 0 | 2560 | 0 |

- Sauts de position (> 12 px monde en 50 ms) : 0 (rendu d'avant : 346, changement de voie d'un bond au centre du carrefour).
- Avions : vitesse de rotation maximale du cap 88°/s, 0 saut(s) de cap ; atterrissage cap 0°, décollage cap 0° (même sens de piste) ; raccords poste ↔ trajectoire : A1 exact, A2 exact.
- Navires : navire_cargo (ouest, +y (bas à gauche)) proue en avant ; port_navire_petrolier (ouest, +y (bas à gauche)) proue en avant ; port_voilier (ouest, +y (bas à gauche)) proue en avant ; port_navire_cargo_ne (ouest, +y (bas à gauche)) proue en avant ; port_navire_vraquier (ouest, +y (bas à gauche)) proue en avant ; port_ferry (est, −y (haut à droite)) proue en avant ; port_remorqueur_ne (est, −y (haut à droite)) proue en avant.
- Troupeaux : 0 pas mesurés sur 0 élevage(s), 0 à reculons, 0 de profil en s'éloignant (une seule vue de trois quarts avant : 90° au plus).
- Erreurs de page : 0.
<!-- AUDIT:fin -->
