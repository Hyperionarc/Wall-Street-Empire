# Plan de travail autonome (nuit du 18 au 19 novembre 2026)

Objectif : rejoindre SimCity (la ville vivante) et Capitalism Lab (la profondeur économique) sans dégrader ce qui existe. Règles : ne jamais lancer deux suites de tests ou builds en même temps ; un commit et un push après chaque lot ; ne pas toucher à master ; aucune règle économique punitive ; aléa déterministe ; sauvegarde rétrocompatible ; pas de génération d'image côté cloud (Cowork s'en charge via `tools/factory_ai/RETOURS.md`).

## État au départ
- Poussé sur `ccr-d9ba3623-415kh0` : financement (equity et dette), tours de table, réseau social, usine (carnet de commandes), atelier marque et supply chain, ville aérée et mall, marges relevées, curseur de concurrence, forêts et fermes HD.
- En cours : agent « mall architectural moderne (Guggenheim, sans arc-en-ciel) » ; agent « marges selon le pouvoir de marché (sans plafond : seul sur un marché = marges très élevées, la concurrence les comprime) » ; suite de tests complète sur le build du mall 10×10 ; mesure de croissance de la ville terminée (réglage à retenir : intermédiaire).

## File d'attente (dans l'ordre ; cocher quand fait et poussé)
1. [ ] **Tests de marges** : élargir les fourchettes EBITDA (t02 : commerces 5-20 %, usines 10-22 %) en justifiant ; relancer la suite seule ; tout vert.
2. [ ] **Fusionner le mall 10×10** (branche de l'agent), reconstruire, tests t44/t34/t26/t01, capture de la vue de départ.
3. [ ] **Croissance de la ville** : retenir un réglage intermédiaire (1 M d'habitants vers le jour 5 000 en passif), le valider avec le bot actif sur 4 h ; faire croître les emplois avec la population (chômage ≤ 15 % à plusieurs millions) ; borner les hauteurs ; `tools/city_growth.js`.
4. [ ] **Parité : petits lots rentables** (`docs/PARITE_SIMCITY_CAPITALISM.md`, ordre de l'audit) : (a) calques de carte étendus ; (b) barre RCI et courbes de la ville ; (c) fin de l'export silencieux du surplus des usines (le surplus doit être visible, chiffré et désactivable).
5. [ ] **Parité : lots moyens** (ABANDONNÉS pour l'instant sur demande de Rémy : « la pollution, le vent, la circulation, on s'en fout si ça ne fait pas gagner d'argent ») : valeur du terrain unifiée et services à couverture seulement s'ils ont un effet sur les profits (loyers, fréquentation).
4b. [ ] **PRIORITÉ HAUTE (demande de Rémy, 19 nov., 00 h 30)** :
   - **E-commerce / ventes mondiales** (agent lancé) : entrepôt en ligne, demande mondiale = export via le port, startup financée par equity raising, sans concurrence frontale avec les magasins de la ville.
   - **Médias et publicité** (à lancer ensuite) : chaînes de télévision, radios, plateformes vidéo et sites internet comme sociétés avec bâtiments visibles en ville, audience, tarifs publicitaires, rachetables par le joueur (OPA) et COTÉES en bourse ; les canaux de publicité des commerces (AD_CH) deviennent ces médias, avec leurs logos. **Décision de conception : marques FICTIVES inspirées des vraies (jamais les vrais logos : marques déposées, risque juridique pour un jeu commercial)**, logos dessinés en vectoriel par le jeu, noms parodiques ; une chaîne d'info, une chaîne sportive, une radio musicale, une plateforme vidéo, un réseau social, un moteur de recherche.
5a. [ ] **Chantiers validés par Rémy (18 nov., 00 h)** : combler les sept écarts économiques, dans cet ordre (un agent par lot, un seul en cours à la fois quand la machine est chargée) :
   - (i) **Stock local par usine + carnet de commandes réel + fin de l'export silencieux du surplus** : chaque usine a son propre stock ; le carnet devient une vraie file de commandes dans la simulation (commandes de clients, retards, annulations) ; le surplus est un choix visible (export chiffré, désactivable), jamais silencieux.
   - (ii) **Rivaux qui fabriquent** : chaînes réelles croissant avec le palier du joueur (voitures, ordinateurs).
   - (iii) **Brevets liés à un produit avec licences** (fin de la rente fixe). **Fait (passe 47)** : brevets de produit, licences, brevets des rivaux, panneau R&D et brevets, accélération en Diamants (aucun paiement réel, `IAP_LIVE = false`).
   - (iv) **Obligations** : émission, coupon selon le cycle et la notation, échéances (onglet Financement > Debt raising).
   - (v) **Éditeur de scénarios JSON + défi de classe asynchrone**.
   - (vi) **Multijoueur asynchrone** (serveur et WebSocket : conception d'abord, selon le PDF d'investisseurs).
5b. [ ] **Parité : gros lots** (un seul si le temps manque) : stock local par usine ; rivaux à chaînes réelles croissant avec le palier du joueur ; circulation légère proportionnelle à la charge ; niveaux d'unité ; brevets liés à un produit ; éditeur de scénarios JSON et défi de classe.
6. [ ] **Supply chain pédagogique** : effet coup de fouet réel (politique de réapprovisionnement avec commandes amont variables), équilibre capacité des rayons / demande.
7. [ ] **Concurrence profonde** : rivaux qui construisent de vraies chaînes sur les produits de rang 3-4 (option C : abstraits + chaînes réelles pour les filières verrouillables) ; contre-mesures anti-monopole.
8. [ ] **Cinq premières minutes** : relancer les personas (40 parties) sur le nouveau build, comparer à l'étude du jour ; ajuster.
9. [ ] **Maïs et colza** : cultures et produits (huile, carburant) si le temps le permet.
10. [ ] Chaque lot : mise à jour du README, rapport court dans `docs/JOURNAL_NUIT.md`.

## Mise à jour 19 nov., 01 h : tout intégrer pour pouvoir tester
Demande de Rémy : « tu prends toute la nuit pour tout mettre ce qu'on a fait ensemble, qu'on puisse le tester ; si c'est à améliorer, tu l'envoies tout de suite dans RETOURS.md à Cowork ». Agents en cours : mall architectural, marges par pouvoir de marché, e-commerce, brevets/R&D avec accélération, valeur du terrain par zones (heatmaps), sol/routes/eau, ville vivante (services, véhicules, port, fermes), maïs et colza. À chaque fusion : build, tests ciblés, suite complète seule, commit/push, capture, puis `inventaire.py`. Abandonnés sur demande : pollution/vent, circulation, éditeur de scénarios, défi de classe, multijoueur pour l'instant.

## Réveils
Un réveil par heure (message envoyé par `send_later`) reprend ce fichier, avance le premier lot non coché, pousse, puis réarme le suivant jusqu'au matin.
