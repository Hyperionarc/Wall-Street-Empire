# Audit des intérieurs et de la jouabilité (19 nov.)

Objectif : qu'aucun bâtiment ne casse quand Rémy l'ouvre, que chaque intérieur ressemble à son métier, que la chaîne d'approvisionnement se pilote réellement, et qu'une partie se joue de bout en bout sans bug.

## Outils

| Outil | Rôle |
|---|---|
| `tools/audit_interieurs.js [captures] [types…]` | Construit **les 70 types** de `TYPES` (hors route et immeubles de la ville) dans une ville de test, ouvre chaque vue, parcourt tous les onglets, entre en plein écran dans les usines (atelier + bureau / carnet de commandes), ouvre le Mall et l'Aéroport. Bureau 1280×900 puis mobile 390×844 (`WSE_AUD_VIEW=pc` ou `mob`). Détecte : erreurs JS, NaN / undefined / Infinity dans le panneau **et dans le texte dessiné sur les canevas**, éléments hors écran, défilement horizontal, boutons superposés, onglets vides, scène vide, coût de rendu d'une image. Écrit `audit_pc.json` / `audit_mob.json` et une capture par vue. |
| `tools/parcours_joueur.js [captures]` | Parcours d'un joueur **au clic réel** : écran de départ → mode Round → fiche et choix de la caste → Petit marché près du Mall (outil + clic sur la carte) → ouverture du magasin, rayons → ferme de blé, deux petites usines, port → catalogue « Choisir la production » → Pain → « Tout lancer automatiquement » → entrée dans l'usine, images/s, sortie (Échap ou bouton Sortir) → ventes, export, aucun stock négatif → sauvegarde et rechargement. En bureau et en mobile. Sur mobile, le script fait glisser la carte pour amener la case dans la zone visible (le tableau de bord couvre le haut de l'écran). |
| `tools/tests/t60_interieurs.js` | Non-régression : tous les types (bureau) + échantillon mobile de 14 vues + chaîne ferme → moulin → boulangerie → magasin → export (chiffres, conseil, rupture, import auto, stocks négatifs). Passe 78 : + les 13 équipements publics (clés `pub:<équipement>`, ouverts au clic ; Mall et Aéroport par « Voir l'intérieur »), échantillon mobile de 17 vues. |
| `tools/tests/t82_interieurs_publics.js` | Passe 78 : chaque équipement public s'ouvre sur son intérieur à 1280×900 et 390×844 (onglet « Intérieur » seul, sans erreur ni NaN), image < 4 ms, occupants ∝ données (25 000 → 140 000 habitants), mécénat sauvegardé. |
| `tools/sim_batch.js` | Relève maintenant les stocks négatifs (`neg`) tous les 100 jours. |

## Résultat par type (bureau 1280×900 et mobile 390×844, après corrections)

« Scène » : type de rendu de l'intérieur (`plan` usine en plan avec plein écran, `site` exploitation à ciel ouvert ou halle, `retail` magasin, `bld` intérieur isométrique de service, `msg` pas d'intérieur). Toutes les vues ci-dessous s'ouvrent sans erreur JS, sans NaN/undefined, sans débordement ni onglet vide, en bureau comme en mobile.

| Type | Rendu (jugé sur capture) | Problèmes trouvés | Action |
|---|---|---|---|
| f1 Petite usine | plan : quais d'achat, convoyeur, stockage, machine, bureau vitré, quai de vente, cartes Achats/Fabrication/Stockage/Carnet. Très lisible, donne envie | « Masquer les liaisons » recouvrait la barre caméra en plein écran ; sur mobile « Vue assemblée » recouvrait − / + | **corrigé** (CSS) |
| f2 Usine moyenne | idem, pain : sacs de farine, racks, quai | idem ; première ouverture lente une fois (47 ms/image, chargement des sprites HD), 1,3–1,8 ms ensuite | CSS corrigé ; lenteur notée (premier chargement) |
| f3 Grande usine | idem, jeans : bobines de tissu | — | — |
| f4 Méga-usine (3×3) | même plan 3×2 que f1–f3 : on ne « sent » pas la taille | intérieur identique quelle que soit la taille | **reste** (sujet « tailles + grille », autre agent) |
| foundry Fonderie d'or | halle, four, convoyeur, camion, alerte « Or brut manquant » | — | — |
| s1 / s2 / s3 Marchés | rayons muraux, gondoles, caisses, clients avec caddies | — | — |
| s4 Méga-centre | même décor que l'hypermarché | pas plus grand que s3 | reste (cosmétique) |
| sauto Concession | **avant** : gondoles multicolores d'épicerie ; **après** : voitures exposées sur dalle, pièces sombres en rayon | intérieur incohérent | **corrigé** (mobilier par métier, `RT_STYLE`) |
| smode Mode | **après** : portants de vêtements | idem | **corrigé** |
| stech Numérique | **après** : tables avec écrans allumés | idem | **corrigé** |
| slux Luxe | **après** : socles avec pièces dorées, palette or/noir | idem | **corrigé** |
| shome Maison et déco | **après** : canapés et lampes | idem | **corrigé** |
| spharma Pharmacie | **après** : rayons blancs/verts/bleus, croix verte | idem | **corrigé** |
| ssport / sbrico | gondoles, palettes sport / outillage | (gondoles gardées, couleurs du métier) | corrigé (palette) ; accessoires HD commandés (n°11) |
| wh Entrepôt | halle, racks, chariots, quai | — | — |
| ewh Entrepôt en ligne | **avant** : bureaux avec employés assis (scène « off » par défaut) ; **après** : halle logistique (racks, chariots, quai), capacité = stock en ligne | incohérent | **corrigé** |
| pylon / cable / pipeline | **avant** : un « intérieur » de bureau avec 2 employés pour 0 poste, « Clientèle : revenus liés à la bourse », « Aucun goulot, recruter » | absurde | **corrigé** : message d'information (rôle + entretien), pas de vue intérieure |
| res Logements | séjour isométrique (canapé, lit, TV) | « Immeuble de 1 étages » ; « Clientèle : revenus liés à la ville et à la bourse » | **corrigé** (accord, « Habitants / Loyers et valeur ») |
| tech, off, btp, immo, bank, hq, rd | bureaux, salle du conseil (hq), guichets et coffre (banque), paillasses (R&D) | — | — |
| dc Data center | allées de baies serveurs, climatiseurs, techniciens | — | — |
| tv, sport | plateau télé ; terrain de basket et gradins | — | — |
| plant, solar, wind, nuclear | chaudière/turbine ; champ de panneaux ; éoliennes ; enceinte du réacteur | alertes « Hors réseau / Sans route » normales dans la ville de test | — |
| port | portiques, conteneurs, cargo | — | — |
| 15 mines et carrières, puits | fosse/puits, excavatrice, convoyeur, camion | — | — |
| 7 cultures, 4 élevages, bûcherons | rangées de culture ; troupeau, grange, silo ; forêt | — | — |
| crush Concassage | rendu « carrière » | pas de tas de gravats visibles | reste (cosmétique) |
| Mall central, Aéroport | panneaux dédiés (demande, qui vend quoi, trafic, duty free) | — | — |
| Équipements publics (passe 78) : maternelle, crèche, collège, lycée, hôpital, caserne, commissariat, hôtel de ville, 2 stades, télécom | **avant** : un message (« financés par la mairie »), pas d'intérieur ; **après** : scène isométrique en coupe `pub` (même technique que `bld`) : classe et coin lecture, berceaux et tapis d'éveil, classe + couloir + cantine, amphi + labo + gymnase, chambres + bloc + urgences, remise à camions + barre + vestiaires + tour de manœuvre, accueil + bureaux + cellules + garage, guichets + bureaux + salle du conseil, tribunes + terrain + vestiaires, régie + studio + serveurs | Rémy : « pas d'intérieur » au catalogue | **corrigé** : onglet « Intérieur » (occupation, capacité, effectif, couverture, humeur, budget de fonctionnement, mécénat) ; occupants ∝ bassin desservi / équipements de la sorte |
| Mall central, Aéroport (passe 78) | panneau dédié **+** intérieur (galeries, boutiques, fontaine, escalator, foule ; enregistrement, sûreté, salle d'embarquement face à la piste avec avion qui décolle, duty free) | — | bouton « Voir l'intérieur » dans chaque panneau, retour par « Ouvrir le panneau » |
| Parcs | pas d'intérieur (espace vert) | — | — |

Captures : `pc_<type>.png`, `mob_<type>.png`, et pour les usines `_imm.png` (plein écran) et `_carnet.png` (bureau), générées par `audit_interieurs.js` (dossier passé en argument, hors dépôt).

## Usines et chaîne d'approvisionnement

Scénario de bout en bout (t60 + parcours joueur) : ferme de blé → petite usine « Farine » → petite usine « Pain » → Petit marché + terminal portuaire.

- **Ce qui marche** : la ferme produit (≈ 2 300 blé/j), le moulin (≈ 1 390 farine/j), la boulangerie (≈ 3 670 pains/j) ; le carnet de commandes lit exactement la simulation (production = sortie des usines, ventes = `S.prod.bread.sold`, export = `ps.exp`, production = ventes + export quand le stock est plein, écart = offre − demande) ; la vue Dessus montre achats, stock en jours, débit de la chaîne, surproduction et marge perdue à l'export ; goulot et boutons d'action en clair (« manque de blé : construis une ferme de blé, ou choisis un fournisseur »).
- **Bug majeur corrigé — l'import automatique ne marchait plus depuis la passe 21** : dans `runRecipe`, la branche `else if (mode === 'auto' && short > 0.01)` (« Auto : stock local, puis port si rupture », promis par l'interface) était tombée **dans le commentaire** de fin de ligne. Une usine en source « Auto » s'arrêtait net à la première rupture locale, sans jamais importer. Corrigé ; vérifié (ferme démolie → le moulin importe ≈ 1 140 blé/j et continue). L'import reste suspendu quand il rendrait la fabrication déficitaire ; ce cas est maintenant expliqué dans le goulot (« Import automatique en pause… »).
- **Conseil faux corrigé** : avec 1 magasin, ventes 57/j pour une demande de 2 600/j, le bureau conseillait « baisse le prix ». Il dit maintenant : « Tes magasins ne vendent que 57 /j sur une demande de 2 636 /j : ouvre des magasins qui le mettent en rayon (le reste part à l'export, avec une marge réduite). Baisser le prix n'y changera rien. »
- **Texte corrigé** : « Il manque farine » → « Rupture de farine : choisis un fournisseur ou construis la source. »
- **Stock négatif `prod.toothpaste.stock`** : non reproduit sur la version actuelle (t04 600 jours, 9 parties bot de 1 000 jours, chaîne, scénario dentifrice dédié de 300 jours avec pharmacie, supermarché, duty free, entrepôt en ligne et intrants coupés par intermittence). Source identifiée par lecture : dans la vente en magasin, un reliquat de demande inférieur à 1e-9 restait compté « vendu » sans stock pour un produit de marque (`q` non ramené à `fs`) ; avec des dizaines de magasins, le stock passait à −1e-9 et le contrôle `< 0` le signalait. Corrigé à la source (un produit de marque ne se vend que sur son stock) + plancher 0 contre l'arrondi flottant.

## Jouabilité de bout en bout

- **Parcours joueur** (`parcours_joueur.js`) : 22/22 étapes sans problème (bureau et mobile) : aucune erreur JS, aucun NaN affiché, aucun bouton inerte sur le chemin, pas de soft-lock, sauvegarde/rechargement identique (même nombre de bâtiments ; le Round reprend en temps réel).
- **Parties bot** (`sim_batch.js`, 1 travailleur, 1 000 jours, profil « bon ») : industriel, agriculteur, négociant × 2 graines (avec et sans événements) : 0 erreur JS, 0 stock négatif, valorisation de 21 à 43 M$, aucun blocage.
- **Images/s** (Chromium sans GPU, donc pessimiste) : carte 23–31 i/s en 1280×720, 47–54 en 390×844 ; usine plein écran 21–25 (bureau), 48–53 (mobile). Une image de scène intérieure coûte 0,1 à 6 ms (hors premier chargement des sprites).
- **Relevé** : la récompense de mission du premier Petit marché (+200 000 $) dépasse son coût : la trésorerie monte quand on le pose (voulu, mais surprenant).

## Reste à faire (priorisé)

1. ~~**Mobile : la carte visible est réduite**~~ **fait (passe 64)** : HUD compact sur téléphone (portrait < 600 px, paysage < 520 px de haut) : une rangée de commandes 44 px, trésorerie · capitalisation · date sur une ligne, barre du Round sur une ligne + jalon (classement, rattrapage, calque, reset, zoom derrière le bouton ▾), une seule notification courte en bas au-dessus de la barre d'outils (4,5 s, jamais au centre, non cliquable), catégories et outils ≥ 44 px, boutons Fermer 44 px, au doigt : tap = pose, glisser = déplacer la carte, pincer = zoom sans rien poser. Carte visible : 390×844 de 40 % à 65 %, paysage 844×390 de 6 % à 56 %, tablette 820×1180 63 %. Test : `t64_mobile.js`.
2. **Agriculteur faible** : une graine sans événements finit 6/6 à 21 M$ (les deux autres castes ≈ 40 M$). À rééquilibrer (sujet produits + fermes, autre agent).
3. **Intérieur des usines indépendant de la taille** (f1 à f4 : même plan 3×2) et méga-centre identique à l'hypermarché : sujet « tailles + grille ».
4. **Images/s de la carte en 1280×720** proches de 25 sans GPU : à mesurer sur la machine de Rémy ; si < 40, alléger le rendu de la ville (enseignes, passants) à vitesse ×1.
5. Accessoires HD d'intérieur des magasins spécialisés et de l'entrepôt en ligne : **commande n°11** dans `tools/factory_ai/RETOURS.md`.
6. Concassage : montrer des tas de gravats ; Logements ouverts par le panneau bâtiment : préférer la fiche immeuble (déjà le cas au clic sur la carte).
