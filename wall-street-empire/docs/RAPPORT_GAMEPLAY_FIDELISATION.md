# Wall Street Empire : test de bout en bout, gameplay et fidélisation

*18 novembre 2026. Mesures faites avec des joueurs simulés (bots) sur le build actuel ; ce qui n'est pas mesuré est signalé comme tel.*

## 1. Avec 10 M$, que devient un joueur ?

**Round de 90 minutes (10 M$ pour tous, 3 profils de joueur)**

| Profil | Valorisation finale | Résultat |
|---|---|---|
| Bon joueur | 949 M$ | 1er sur 6, mais le milliard n'est pas atteint dans le temps |
| Joueur lent | 881 M$ | 1er sur 6 |
| Joueur occasionnel | 1 005 M$ au jour 6 768 | victoire avant la fin |

Courbe du bon joueur : 10 M$ au départ, 21 M$ à 10 % du temps, 38 M$ à 40 %, 66 M$ à 60 %, 167 M$ à 80 %, 295 M$ à 90 %, 949 M$ à 100 %. Les 35 premières minutes sont plates : classé 5e ou 6e sur 6 jusqu'à 60 % du temps. Les dix dernières minutes valent plus que les quatre-vingts premières.

**Partie libre de 4 heures (19 200 jours à vitesse normale), 10 M$ au départ, bon joueur**

| Moment | Valorisation | Rang |
|---|---|---|
| 24 min (10 %) | 25 M$ | 6/6 |
| 48 min (20 %) | 39 M$ | 6/6 |
| 72 min (30 %) | 72 M$ | 6/6 |
| 96 min (40 %) | 264 M$ | 2/6 |
| 120 min (50 %) | 2,4 Md$ | 1/6 |
| 168 min (70 %) | 14,6 Md$ | 1/6 |
| **240 min (4 h)** | **39,2 Md$ (dont 38 Md$ en trésorerie)** | 1/6 |

**Réponse à la question** : un joueur qui part avec 10 M$ repart au bout de 4 heures avec environ **39 Md$ de valorisation**, soit ×3 900, et le milliard est franchi vers 105 minutes.

**Deux défauts nets :**
1. **Le début est lent en partie libre** : 72 minutes pour arriver à 72 M$, dernier au classement pendant plus d'une heure. C'est la zone où un joueur en ligne décroche.
2. **Après le milliard, il n'y a plus rien à acheter.** La trésorerie monte en ligne droite (38 Md$ inutilisés, dette figée à 832 M$) : le bot n'a plus d'investissement à faire. Dans un jeu « infini », c'est la fin du jeu à 2 heures. Il faut des puits d'argent et des objectifs au-delà du milliard (voir §4).

*Limite* : les bots n'utilisent pas encore les tours de financement ni le menu Financement ; un joueur humain peut aller plus vite au début.

## 2. Test de bout en bout, bugs
- **Interface** : audit automatique de tous les onglets, des six catégories d'outils et du menu Financement à 1280×720, 1920×1080 et mobile 390×844 : aucune erreur JavaScript, aucun texte coupé ou `NaN`.
- **Suite de tests** : 953 réussis, 0 échec sur le dernier build complet.
- **Images** : contrôle de 370 sprites : angle de caméra, débordements, coupes (détail dans `tools/factory_ai/RETOURS.md`, adressé au Mac). Constat principal : les bâtiments de ville sont à 40-48° au lieu de 30° ; le jeu les recale provisoirement en les écrasant.
- **Ce qui reste visuellement ancien** : forêts, sol, routes, scierie extérieure (images reçues pour les forêts, pas encore branchées).

## 3. Est-ce que ça « accroche » comme un casino ? Comparaison avec le PDF et Supremacy WW3
Le PDF d'investisseurs vise une fidélisation à la Supremacy : multijoueur asynchrone, Conseil de sécurité économique à 5 sièges, cartels, OPA, embargos, ZEE, blocs commerciaux, 5 paliers d'accès, cible J7 > 15 % et J30 18 %.

| Mécanique du PDF | Dans le jeu aujourd'hui |
|---|---|
| Moteur économique profond, chaînes de production | Oui, et lisible (carnet de commandes de l'usine) |
| Cartels, embargos, OPA hostiles | Oui (cartel, embargo, OPA) |
| Marque d'empire | Oui (capital de marque) |
| Rivaux IA par caste | Oui, 6 castes |
| Boucle « pitch / levée de fonds » à effet de surprise | Oui (tour sursouscrit, tiède, down round) |
| Conseil de sécurité économique (5 sièges, vote des règles) | **Non** : un simple message à 700 M$ |
| Multijoueur asynchrone, alliances, blocs commerciaux, ZEE | **Non** |
| Progression pendant l'absence du joueur, notifications | **Non** |
| Succès, récompenses de connexion, saisons, prestige | **Non** |
| Paliers d'accès (Citoyen à Oligarque) | Partiel : les paliers existent comme niveaux de richesse, pas comme statut social |

**Verdict honnête.** La *profondeur* économique est là et la courbe de gain est excitante dans la dernière ligne droite. En revanche, **le jeu n'a pas encore les boucles qui font revenir** : pas de raison de se reconnecter demain, pas d'événement qui arrive pendant l'absence, rien à perdre ni à défendre face à d'autres humains, pas de statut visible. À l'état actuel, il fidélise la première heure par la découverte et la courbe de richesse, mais **pas la première semaine**, et pas du tout le long terme.

**Premières heures** : les 35 premières minutes sans récompense forte et un classement dernier sont le point faible. Ce qui joue pour : le tutoriel guidé, les tours de financement à issue incertaine, la montée de palier, les gisements et mines qui brillent.

## 4. Propositions, par ordre d'impact (sans loot box : le PDF les exclut)
1. **Accélérer les 30 premières minutes** : une victoire visible toutes les 3-4 minutes (premier commerce, première usine, premier tour de financement dès la 8e minute, passage au rang 3 avant 25 minutes).
2. **Puits d'argent et objectifs après 1 Md$** : paliers au-delà (10 Md$, 100 Md$, 1 000 Md$), projets longs coûteux (infrastructure, Conseil de sécurité), nouvelles villes, rachat de rivaux en série ; l'argent doit toujours avoir un usage.
3. **Un monde persistant à la Supremacy** : le temps continue quand le joueur est absent (revenus qui s'accumulent plafonnés, événements, attaques d'OPA ou embargos que l'on peut parer sous 24 h), notification « ton usine est en rupture », « une OPA est lancée sur ta filiale ».
4. **Statut social visible** : Conseil de sécurité économique (5 sièges aux enchères), marque d'empire affichée à tous, classement par saison avec prestige conservé d'une saison à l'autre.
5. **Boucles quotidiennes et hebdomadaires** : mission du jour, série de jours consécutifs, tournoi de la semaine, succès.
6. **Alliances et blocs commerciaux** : chaînes d'approvisionnement partagées entre alliés, prix internes, front commun contre un embargo (c'est le « PvP » du PDF).

## 5. Ce que je n'ai pas pu mesurer
Rétention réelle (J1, J7, J30), temps de session, taux de conversion : il faut des joueurs réels (soft launch). Les bots prouvent l'équilibre de l'économie, pas l'envie de revenir.
