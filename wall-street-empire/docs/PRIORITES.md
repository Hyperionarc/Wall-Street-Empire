# Priorités (règle de Rémy : l'impact joueur d'abord, pas le détail)

Ordre de travail permanent, du plus important au moins important. On ne passe au niveau suivant que si le précédent est sain.
1. **Jouable sans bug** : suite de tests verte, parcours joueur de bout en bout, mobile utilisable, pas de blocage.
2. **Réalisme et profondeur économique** : chaîne d'approvisionnement, prix/demande, marque, R&D, concurrence IA (en cours, voir docs/CAPLAB_*.md), énergie, finance, négociant/banquier IA.
3. **Croissance de ville crédible** (villes à plusieurs millions d'habitants, emplois proportionnés).
4. **Lisibilité et beauté à l'écran** : cohérence des bâtiments, intérieurs, produits, fermes. Livraisons Cowork (hôpital, pharmacie, mall, photos produits, sprites des 27 éléments dessinés en code).
5. **Équilibre des castes** (agriculteur trop faible, etc.) et parties multi-castes à 8 joueurs.
6. Détails cosmétiques (herbe, brins, effets) : SEULEMENT s'il ne reste rien de plus important.

Fonctionnement autonome : réveil toutes les 30 minutes, fusionner les agents finis, relancer la suite complète (par fichier, reprise), choisir le prochain point de la liste, lancer les agents en parallèle (5 maximum à cause de la charge machine), journaliser dans docs/JOURNAL_NUIT.md.
