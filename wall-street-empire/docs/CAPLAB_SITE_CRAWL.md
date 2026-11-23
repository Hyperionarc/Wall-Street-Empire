# Capitalism Lab : ce que montre le site officiel (crawl du 23/11/2026)

Source : https://www.capitalismlab.com/ , exploré avec Crawl4AI (103 pages, profondeur 2). Les pages brutes sont dans le scratchpad de la session (non versionnées : texte protégé) ; ce document est une synthèse reformulée. Pages utiles : `beginners-guide-gameplay-basics/`, `improvements/interfaces/` (+ `auto-set-up-factory-production`, `auto-setup-farm-production`), `new-content/batch-switching-supplier/`, `new-features/city-dynamics/`, `new-features/enhanced-macroeconomic-simulation/`, `new-features/inflation/`, `high-priced-products/`.

## Ce qu'il faut reproduire (modèle d'interaction)
- **Un bâtiment = des unités** : unités d'achat, de vente, de fabrication, de stockage, de marketing, de R&D. Un magasin se règle par ses unités de vente (produit en rayon, prix, fret affiché) et ses unités d'achat reliées à un fournisseur.
- **Lien fournisseur** : un bouton [Link] sur l'unité d'achat ouvre la liste des fournisseurs possibles. Les fournisseurs sont : tes propres usines, fermes et mines ; les sociétés concurrentes (souvent meilleur prix et meilleure qualité que les ports) ; les **ports** (port industriel : matières et semi-produits ; port commercial : biens de détail). Le jeu affiche, pour chaque source, le prix, la qualité et le **fret** (le fournisseur ne le touche pas).
- **Changement de fournisseur en lot** (« Batch Switching Supplier ») : remplacer en un clic, pour tous les magasins d'une liste filtrée (ville, type), une source ou un produit par un autre. Option « même fournisseur » ou « même produit ». Bouton [Clear Stock] pour vider un rayon.
- **Mise en place automatique** : pour une usine ou une ferme, on choisit le produit et le jeu construit la disposition des unités tout seul (marque « ✓ » quand toutes les matières premières sont disponibles sur le marché). Le joueur ne câble rien à la main.
- **Les ports sont le démarrage** : conseil officiel de début de partie : acheter chez les ports les semi-produits qu'on ne sait pas encore fabriquer, ne produire soi-même que le strict nécessaire ; la difficulté augmente quand les ports sont moins bien fournis. Dépendance à réduire plus tard.
- **Diagnostic par barres** : offre (jaune) contre demande (orange) sur chaque unité pour trouver le goulot ; attendre quelques jours avant de conclure (stocks qui se remplissent).
- **Fret et emplacement** : regrouper usines et fermes près d'un port ; magasins dans les zones de forte fréquentation même si le terrain est cher ; surcouche valeur du terrain et surcouche trafic (calques) pour choisir où construire ; biens de première nécessité : usine et magasin dans la même ville ; produits de luxe : usine là où les salaires sont bas.
- **Intégration** : un même intrant sert à de nombreux produits (21 produits utilisent des composants électroniques) : on étend la chaîne vers les catégories voisines ; surplus vendable aux concurrents.

## Écart avec notre jeu (à combler par le responsable Chaîne & Commerce)
1. Notre choix de produit en rayon est limité par famille et produits lancés ; il doit offrir tout bien vendable (comme le port commercial).
2. Notre sélection de fournisseur est une fenêtre séparée ; elle doit être le panneau sous la grille d'emplacements.
3. Pas de changement de fournisseur en lot ; pas de [Clear Stock] ; pas de mise en place automatique d'une usine/ferme à partir du produit.
4. Les commerces, usines et fermes ne forment pas un seul réseau d'approvisionnement.
