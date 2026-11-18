# Consignes fermes (décisions de Rémy, 17/11/2026) — à respecter par tout agent générateur

1. **Taille** : une ferme de base = **4 cases (2×2)**, jamais 1 case. Le joueur peut choisir des petites (4) ou grandes (8) fermes.
2. **Agrandissements** : le joueur peut acheter des extensions de terrain ; l'effectif du cheptel doit **croître avec la surface** (effectif = densité par case × nb de cases, voir `nb_` dans parcelle.py) — jamais un nombre fixe.
3. **Cheptels aérés** : visibles mais pas compacts (≈3 vaches, 12 moutons, 14 poules, 9 porcs par case). Pas 100 bestioles serrées : il faut seulement que ça évoque un élevage.
4. **Un seul bâtiment** par ferme (jamais plusieurs bâtiments côte à côte), posé dans la bande fine du bord nord→est (sommet haut → coin est). Poulets/porcs : bâtiment long le long de ce bord. Vaches : stabulation circulaire (`bat_ferme_stabulation_ronde`) ou étable traversante / carrousel de traite.
5. **Aucun dépassement du losange du terrain** : contrôle automatique EMPRISE (parcelle.py) ; viser < 1 %, signaler sinon.
6. **Décor sobre** : peu d'arbres/buissons. Porcs : une mare. Moutons : prairie, quelques haies, 1–2 arbres au plus.
7. Pas besoin de confirmation de Rémy pour les images : produire et pousser sur `assets/factory-sprites`, jamais sur master.
