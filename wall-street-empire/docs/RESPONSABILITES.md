# Responsabilités des agents (Wall Street Empire)

Principe (décision de Rémy) : on ne donne pas des tâches, on donne des **responsabilités**. Chaque responsable possède un domaine, une vision, des indicateurs mesurables et le pouvoir de décider de son propre carnet de tâches. Il rend compte par un journal court (`docs/journal/<domaine>.md`) et par des tests qui échouent tant que la vision n'est pas atteinte.

Vision commune (Rémy) : jouer à Capitalism Lab / Capitalism II. Économie libérale la plus libre possible : les prix, les marges et les faillites viennent du marché. Tout est relié (port, mines, fermes, usines, commerces) sans liaison manuelle absurde. Tout se manipule depuis l'intérieur du bâtiment (acheter, vendre, optimiser). Peu d'informations à l'écran, pas de pop-ups, le joueur va chercher l'information. Aucun texte dans les images (titres écrits par le code). Les castes n'ont que des avantages, jamais d'interdits. Début de partie accueillant. Jeu à somme positive.

Règles communes : une branche par responsable, un commit par lot testé, tests lancés un par un, RNG déterministe (hash(), jamais rnd() en simulation), sauvegarde `wse-city-v8` rétro-compatible, ne pas modifier le domaine d'un autre sans lui écrire dans son journal. Le chef de projet (session principale) fusionne, publie et arbitre.

## Responsable Chaîne & Commerce (urgent)
Domaine : liaison port → extraction → fermes → usines → entrepôts → magasins ; achat et vente depuis la fenêtre de n'importe quel bâtiment ; biens de première nécessité disponibles dès le premier jour.
Indicateurs (tests de parcours, joués par l'IA testeuse) : (1) dès le jour 1 on achète un produit importé par le port et on le vend dans un commerce ; (2) blé → pain (usine) → magasin sans liaison manuelle ; (3) œufs, poulet, viande, lait, farine, huile disponibles via fermes/port ; (4) en entrant dans un bâtiment on peut acheter, vendre, changer de fournisseur et optimiser sans en sortir ; (5) plus aucun « îlot » commerce déconnecté.
Pouvoir : supprimer ou fusionner toute mécanique qui complique la liaison (barrières d'usine, familles, verrous), après l'avoir notée dans son journal.

## Responsable Économie de marché
Domaine : prix, demande des ménages (budget fermé), B2B, import/export, faillites, cycles. Indicateurs : aucune borne administrée sauf garde-fou instrumenté ; pas de NaN ; début accueillant pour toutes les castes ; croissance exponentielle ; la vente à perte mène à la faillite.

## Responsable Interface
Domaine : HUD, journal, décisions en attente, fenêtres des bâtiments, croix de fermeture, infobulles, calques. Indicateurs : écran de jeu libre (HUD minimal), zéro pop-up interrompant, tout panneau fermable en un clic/Échap, une action utile visible sans défiler.

## Responsable Visuels & Assets
Domaine : sprites HD, produits, bâtiments, enseignes, véhicules, personnages ; commandes à Cowork (`tools/factory_ai/RETOURS.md`). Indicateurs : audit de couverture HD (`docs/AUDIT_HD_COUVERTURE.md`) ; aucune version obsolète affichée ; aucun cube vectoriel visible là où une image existe.

## Responsable QA (IA testeuse)
Domaine : `tools/qa_ai/` (Utility AI + HTN + fuzzer + watchdog). Indicateurs : campagne nocturne reproductible ; chaque défaut a une graine et un rejeu ; les scénarios de parcours des autres responsables sont automatisés.

## Responsable Architecture & Livraison
Domaine : découpage de `game.template.html` en modules assemblés par `tools/build.py`, build, version publiable < 16 Mo, intégration continue. Indicateurs : deux responsables peuvent modifier des modules différents sans conflit ; build reproductible.
