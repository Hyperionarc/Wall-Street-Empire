# Wall Street Empire — prototype jouable (V0.2)

Mini-ville isométrique avec une économie en chaîne, jouable dans le navigateur (téléphone ou ordinateur).
Ouvrir `city.html` : un seul fichier, sans serveur, sprites inclus.

## Ce que fait le jeu

Une ville de 12×12 cases. Le joueur construit, relie par des routes, règle l'impôt et améliore ses bâtiments.

**Chaîne de production**

```
Raffinerie ──pétrole──▶ Usine ──biens──▶ Commerce ──ventes──▶ Habitants
     ▲                                                  │
     └────── travail (55 % des habitants) ◀─────────────┘        Impôts ▶ trésorerie
```

- **Logements** : 6 + 4 par étage de capacité. La population grandit vers la capacité selon l'humeur.
- **Raffinerie** : 14 barils par jour (à pleine dotation en personnel). **Usine** : transforme 10 barils en 12 biens.
- **Commerce** : vend jusqu'à 16 biens par jour, dans la limite de la demande (0,12 bien par habitant).
- **Tour Tech** (palier Entrepreneur) et **Banque** (palier Industriel) : revenus propres. Chaque banque donne +10 % de revenus
  aux entreprises (plafonné à +30 %).
- **Prix du marché** : pétrole et biens évoluent selon l'offre et la demande, puis reviennent lentement vers leur prix de base.
- **Impôt** : la ville touche un pourcentage du chiffre d'affaires des secteurs, plus un impôt par habitant employé.
  Un taux élevé rapporte plus mais fait baisser l'humeur.
- **Humeur** : biens disponibles, chômage, pollution (raffinerie et usine à moins de 2 cases d'un logement) et impôt.
- **Améliorer** : un étage de plus pour un logement (jusqu'à 6), un niveau pour les autres (jusqu'à 3 : +50 % de capacité par niveau).
- **Événements** : goulot de production (−25 % pendant 6 jours), boom boursier (+25 % pendant 8 jours), saisons (neige l'hiver).

**Paliers** (calculés sur la capitalisation) : Citoyen, Entrepreneur (30 k$), Industriel (80 k$), Magnat (250 k$), Oligarque (800 k$).
Dix missions guident la progression et donnent des primes. Le palier Oligarque est la victoire (le jeu continue ensuite).

## Commandes

| Action | Tactile | Souris / clavier |
|---|---|---|
| Construire | choisir l'outil, toucher une case | clic |
| Tracer des routes | outil Route, glisser | clic maintenu |
| Déplacer la vue | outil Main, glisser | glisser, ou clic droit |
| Inspecter | outil Main, toucher une case | clic (outil Main) |
| Zoom | deux doigts, boutons + et − | molette |
| Raccourcis | | 1 à 9 pour les outils, Échap pour la main |

## Fichiers

| Fichier | Rôle |
|---|---|
| `city.html` | le jeu complet, généré (atlas de sprites intégré) |
| `game.template.html` | source du jeu (à modifier) |
| `tools/build.py` | assemble l'atlas à partir de `assets/src/` et génère `city.html` |
| `tools/vehicle_frames.json` | numéro d'image de chaque direction des véhicules |
| `assets/` | sprites sources (CC0), atlas généré, `CREDITS.md` |

Pour régénérer : `python3 wse/tools/build.py` (nécessite Python 3 et Pillow).

## Équilibrage vérifié

Un robot joueur (construit autour d'une grille de routes, puis améliore au plus rentable) atteint l'Oligarque vers le jour 400 à 2 s par jour.
Un joueur humain y mettra nettement plus longtemps. Sans l'outil Améliorer, l'argent s'accumulait sans usage une fois la carte pleine.

## Limites connues et pistes

- Un seul joueur contre l'économie. Les mécaniques multijoueur du pitch (cartel, Conseil, OPA) ne sont pas encore là.
- Les prix et rendements sont des premières valeurs, pas un équilibrage final.
- Les véhicules ne sont pas toujours parfaitement orientés selon leur sens de marche.
- Pas encore d'électronique, de ressources autres que le pétrole, ni de concurrents IA.
