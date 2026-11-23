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

## Captures d'écran fournies par Rémy (références d'interface, non versionnées)
Dossier de la session : `scratchpad/caplab/refs/` (ref_61 à ref_65). Ce qu'elles montrent :
- **Guide du fabricant** : menu de gauche permanent (Corporations, Corporate Details, Products, Product Details, Firms, Financials, Persons, Goal, Score, Manufacturer's Guide, Farmer's Guide, Manager's Guide, Cities, Financial Actions, Stock Exchange…) ; arbre des intrants d'un produit (carrosserie, moteur, roues avec quantités par unité et qualité) ; « la qualité est déterminée par : technologie de production 30 % / qualité des matières premières 70 % » ; liste Classe de produit → Type de produit avec une coche quand toutes les matières sont disponibles ; infobulle « glissement de demande » (voiture → voiture électrique, vitesse, max 50 %).
- **Corporations** : classement de 51 sociétés avec portrait du PDG, trésorerie, chiffre d'affaires annuel, résultat, courbe de résultat opérationnel sur 36 mois ; fiche société : stratégie, bilan, compte de résultat, bourse (cours, capitalisation, PER, dividende), aperçu des établissements (icônes avec compteurs).
- **Produits** : fiche par produit avec graphique des ventes sur 12 mois, **deux camemberts de parts de marché (production / détail)**, tableau Local / Moyenne pour prix, qualité, marque et la pondération de chaque critère (« Concern » : prix 30 %, qualité 35 %, marque 35 %), note globale ; filtres par société, catégorie, ville.
- **HUD** : très sobre : trésorerie, valeur nette et date en bas ; minicarte avec sélecteur de ville ; indicateurs macro (inflation, pouvoir d'achat, chômage, PIB, taux) dans un petit bloc replié.
Leçon d'interface : l'information est dans des fenêtres à onglets que le joueur ouvre lui-même ; la carte reste libre ; la comparaison Local / Moyenne est le cœur de la décision de prix.

## Ce qui rend la supply chain « challenging » dans Capitalism Lab (synthèse, 23/11/2026)
Sources : pages officielles aspirées (guide du débutant, simulation du commerce de détail, entrepôts, outils de gestion de la chaîne, liens d'approvisionnement cassés, équilibrage), recherches sur le web (le wiki japonais de Capitalism 2 sur la marque a répondu 403 : non lu ; ne rien affirmer de ses formules).
1. **Goulots diagnostiqués par des barres offre/demande** unité par unité ; il faut attendre quelques jours (stocks qui se remplissent) avant de conclure ; une usine trop grande ou un magasin qui vend trop lentement se lisent différemment.
2. **Capacité par unité et niveau** (formation) : chaque unité (achat, vente, fabrication) a un niveau ; former coûte (sauf niveau 9) ; un commerce a des unités d'achat et de vente très formées.
3. **Fret** : coût réel par intrant selon la distance (affiché dans l'unité de vente et pour chaque intrant d'usine) ; il faut regrouper usines et fermes, près d'un port ; magasins dans les zones de trafic même si le terrain est cher.
4. **Qualité en cascade** : la qualité d'un produit dépend de la technologie de production et de la qualité des matières ; un maillon médiocre dégrade tout l'aval.
5. **Dépendance aux ports et aux concurrents** : bons pour démarrer, mais la qualité des ports baisse avec la difficulté et ils peuvent cesser de fournir ; les concurrents offrent parfois mieux, mais un fournisseur qui disparaît laisse des **liens cassés** à réparer (outil de redirection en lot).
6. **Récoltes par rafales** : les produits agricoles arrivent par à-coups alors que la demande est continue ; les **entrepôts** tamponnent (capacité, plusieurs sources), ou servent de position spéculative.
7. **Trafic et chaîne de magasins** : indice de trafic de 0 à 100 par emplacement ; bonus de demande de détail (étoiles) qui amplifie le trafic ; un réseau de magasins accroît la notoriété de toute la chaîne.
8. **Marque** : note de marque = notoriété + fidélité ; la notoriété (part de la population qui connaît la marque) précède l'essai puis la fidélité ; l'importance de la marque varie selon le produit (forte pour cosmétiques et médicaments, faible pour l'agricole) (avis de joueurs, non officiel).
9. **Index de nécessité** : produits de première nécessité achetés quels que soient les salaires ; produits de luxe réservés aux villes riches.
10. **Surproduction** : un intrant très polyvalent oblige à étendre vers les catégories voisines ou à vendre le surplus aux concurrents.

## Pistes pour retrouver ce « challenge » dans notre jeu (à arbitrer par les responsables Chaîne & Commerce et Économie)
- Ruptures de stock dues à un service achats sous-dimensionné (en cours).
- Fournisseurs concurrents ou ports qui peuvent faillir ou se dégrader : liens cassés, alerte discrète, bouton de réparation en lot.
- Délais et fret qui comptent vraiment dans le prix livré et le choix du fournisseur.
- Entrepôts comme tampon des récoltes saisonnières et position spéculative.
- Qualité en cascade (matières → produit → note) qui a un effet visible sur les ventes et la marque.
- Notoriété du magasin qui se construit (trafic, chaîne, disponibilité), pas seulement par la publicité.
- Difficulté (1–8) qui joue sur la richesse du port et la réactivité des concurrents, pas seulement sur le comportement des IA.
