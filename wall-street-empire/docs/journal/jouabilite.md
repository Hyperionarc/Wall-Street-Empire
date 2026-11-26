# Journal du responsable Jouabilité & maîtrise de la supply chain

## Mission (Rémy)
« Refais un audit de jouabilité à travers chaque caste et approprie-toi le plaisir de maîtriser la supply chain : comprendre comment relier les produits, comment construire des produits. »

## Ce que j'ai retenu de Capitalism Lab (principes, pas copie)
Sources : pages du site officiel du scratchpad (guide du débutant, mise en place automatique de l'usine, améliorations du guide du fabricant) et captures ref_61 à ref_65.

Le plaisir du joueur intense tient en quatre gestes :
1. lire l'arbre d'un produit et voir ce qui est disponible ;
2. décider ce qu'on fabrique soi-même et ce qu'on achète : conseil de début de partie, « achète au port ce que tu ne sais pas encore faire » ;
3. relier, puis lire les goulots ;
4. voir la chaîne tourner.

Je n'ai repris ni textes, ni noms de menus, ni mises en page. Nos noms : « Ta chaîne », ✓ / ⚓, « Construire cette chaîne · devis », « Usine seule / Chaîne principale / Chaîne complète », « Diagnostic par maillon », jalons « Première chaîne complète », « Indépendant du port », titre « Maître de la chaîne ».

## Conçu en propre
- **Encart « Ta chaîne » du Guide** (`gTree`, `gChainOwn`, `gMasteryHTML`) : arbre complet en cascade, quantités par unité, source de chaque maillon avec la majoration réelle de l'import (`impRate`). Il s'allume quand chaque maillon est à toi.
- **Devis en trois périmètres** (`FAB_SCOPES`, `fabInc`, `chainNeeds(pk, inc)`, `chainLeaves(pk, inc)`) : une vraie décision entre capital immobilisé, marge et dépendance au port. L'emballage n'est jamais un ingrédient principal.
- **Seuil de rentabilité de la ferme dans le devis** (`farmBE`, fiche de ferme fictive passée à `farmEcon`). Une ferme déficitaire n'est pas cochée d'office.
- **Site des extracteurs** (`rawSpot`, `placeRaw`) : au plus près du port, puis raccordés.
- **Jalons de maîtrise** (`ryChainJ`, état `S.ry.chj`, facultatif et assaini dans `rySan`).
- **Refus visibles** : un `warn` émis pendant le geste du joueur s'affiche ; « Chantier en cours » remplace un « Agrandir » inerte.
- **Avertissement de main-d'œuvre à la pose** (`playerPlace`).
- **IA testeuse `tools/qa_ai/parcours_castes.js`** : parcours de caste, watchdog d'invariants, fuzz des fiches. Test `t110`.

## Mesures clés (graine 6100)
- Chaîne du pain avant correctif : devis de 13,3 M$ pour 10 M$ de trésorerie (bouton grisé). Après correctif : 1,06 / 4,15 / 13,3 M$ selon le périmètre.
- Ferme posée par « Fabriquer » avant correctif : hors réseau, rendement 65 %, −20 500 $/j. Après correctif : reliée, −13 700 $/j à 9 cases (seuil ≈ 16 cases) : c'est maintenant signalé.
- 12 parcours de 720 jours (6 castes × 2 départs) : 0 violation d'invariant, 0 erreur de page, jour simulé de 45 ms au plus.

## Économie libérale et autres consignes
- Aucune borne de rendement ajoutée ; aucune prime en argent (jalons : Diamants, crédits labo, titre, confiance du banquier).
- Aucun `rnd()` ajouté ; aucune fenêtre surgissante nouvelle (le devis existait déjà, il s'ouvre sur un clic du joueur).
- Sauvegarde : seul `ry.chj` est ajouté (facultatif).
- Pas touché : assets, multijoueur (`server/`), bots.

## À transmettre
- **Économie** :
  - l'emballage coûte plus que l'ingrédient (pain, œufs) ;
  - aucune faillite du joueur à −50 M$ ;
  - les fermes de base sont sous leur seuil de rentabilité hors caste agriculteur ;
  - l'innovateur est deux fois plus rentable que les autres castes à 6 ans ;
  - le coach donne +200 000 $ pour la pose d'un petit marché.
- **Chaîne & Commerce** :
  - l'arbre du pain perd l'emballage après le lancement ;
  - la surproduction (usine 20 fois plus grande que le débouché d'un magasin).
- **QA** : `parcours_joueur.js` est à mettre à jour (bulle « Ouvrir », catalogue).

## Tests
- `t110_parcours_castes` (nouveau) : 6 castes × 120 jours sans violation, fiches qui s'ouvrent et se ferment, Guide (arbre, ✓ et ⚓, devis), chaîne allumée, jalons, sauvegarde.
- Relancés un par un après le lot : t110 24 PASS, t01 7, t05 6, t44 45, t96 19, t98 30, t102 35, t24 13, t30 78, t38 86, t51 37 PASS (0 FAIL).
