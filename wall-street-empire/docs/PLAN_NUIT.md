# Plan de travail autonome (nuit du 18 au 19 novembre 2026)

Objectif : rejoindre SimCity (la ville vivante) et Capitalism Lab (la profondeur économique) sans dégrader ce qui existe. Règles : ne jamais lancer deux suites de tests ou builds en même temps ; un commit et un push après chaque lot ; ne pas toucher à master ; aucune règle économique punitive ; aléa déterministe ; sauvegarde rétrocompatible ; pas de génération d'image côté cloud (Cowork s'en charge via `tools/factory_ai/RETOURS.md`).

## État au départ
- Poussé sur `ccr-d9ba3623-415kh0` : financement (equity et dette), tours de table, réseau social, usine (carnet de commandes), atelier marque et supply chain, ville aérée et mall, marges relevées, curseur de concurrence, forêts et fermes HD.
- En cours : agent « mall 10×10 au centre, style MBK » ; mesure de la croissance de la ville ; suite de tests complète (échecs attendus sur les fourchettes de marges).

## File d'attente (dans l'ordre ; cocher quand fait et poussé)
1. [ ] **Tests de marges** : élargir les fourchettes EBITDA (t02 : commerces 5-20 %, usines 10-22 %) en justifiant ; relancer la suite seule ; tout vert.
2. [ ] **Fusionner le mall 10×10** (branche de l'agent), reconstruire, tests t44/t34/t26/t01, capture de la vue de départ.
3. [ ] **Croissance de la ville** : retenir un réglage intermédiaire (1 M d'habitants vers le jour 5 000 en passif), le valider avec le bot actif sur 4 h ; faire croître les emplois avec la population (chômage ≤ 15 % à plusieurs millions) ; borner les hauteurs ; `tools/city_growth.js`.
4. [ ] **Parité : petits lots rentables** (`docs/PARITE_SIMCITY_CAPITALISM.md`, ordre de l'audit) : (a) calques de carte étendus ; (b) barre RCI et courbes de la ville ; (c) fin de l'export silencieux du surplus des usines (le surplus doit être visible, chiffré et désactivable).
5. [ ] **Parité : lots moyens** : (d) valeur du terrain unifiée (centre = le mall, pollution prise en compte) ; (e) services à couverture gérés par une mairie IA (rayons, calque, budget) ; (f) pollution diffuse avec vent.
5b. [ ] **Parité : gros lots** (un seul si le temps manque) : stock local par usine ; rivaux à chaînes réelles croissant avec le palier du joueur ; circulation légère proportionnelle à la charge ; niveaux d'unité ; brevets liés à un produit ; éditeur de scénarios JSON et défi de classe.
6. [ ] **Supply chain pédagogique** : effet coup de fouet réel (politique de réapprovisionnement avec commandes amont variables), équilibre capacité des rayons / demande.
7. [ ] **Concurrence profonde** : rivaux qui construisent de vraies chaînes sur les produits de rang 3-4 (option C : abstraits + chaînes réelles pour les filières verrouillables) ; contre-mesures anti-monopole.
8. [ ] **Cinq premières minutes** : relancer les personas (40 parties) sur le nouveau build, comparer à l'étude du jour ; ajuster.
9. [ ] **Maïs et colza** : cultures et produits (huile, carburant) si le temps le permet.
10. [ ] Chaque lot : mise à jour du README, rapport court dans `docs/JOURNAL_NUIT.md`.

## Réveils
Un réveil par heure (message envoyé par `send_later`) reprend ce fichier, avance le premier lot non coché, pousse, puis réarme le suivant jusqu'au matin.
