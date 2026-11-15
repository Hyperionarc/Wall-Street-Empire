# Orientations : ce que désigne chaque suffixe de nom

Repère du jeu : l'axe x va vers le bas-droite de l'écran, l'axe y vers le bas-gauche.
Une case est un losange : sommets haut, droite, bas, gauche ; bords haut-droit, bas-droit, bas-gauche, haut-gauche.
Tous les suffixes désignent des **directions d'écran**. Aucun sprite n'est obtenu par miroir : chaque
orientation est un fichier à part, ancré au même point au sol.

| Suffixe | Sens à l'écran | Dans le repère du jeu |
|---|---|---|
| `_nord_est` (tronçon droit) | axe bas-gauche ↔ haut-droite | le long de y |
| `_sud_est` (tronçon droit) | axe haut-gauche ↔ bas-droite | le long de x (orientation de `convoyeur_droit` du lot 1) |
| `coin_ne` | relie les bords haut-droit et bas-droit, autour du sommet droit | bords y=min et x=max |
| `coin_se` | relie les bords bas-droit et bas-gauche, autour du sommet bas | bords x=max et y=max |
| `coin_sw` | relie les bords bas-gauche et haut-gauche, autour du sommet gauche | bords y=max et x=min (orientation de `convoyeur_coin` du lot 1) |
| `coin_nw` | relie les bords haut-gauche et haut-droit, autour du sommet haut | bords x=min et y=min |
| `mur_bas_ne`, `mur_bas_ouverture_ne` | mur posé sur le bord haut-droit de la case | bord y=min (comme `mur_bas_droite` du lot 1) |
| `mur_bas_nw`, `mur_bas_ouverture_nw` | mur posé sur le bord haut-gauche de la case | bord x=min (comme `mur_bas_gauche` du lot 1) |
| `coin_mur_n` / `_e` / `_s` / `_w` | angle de mur au sommet haut / droit / bas / gauche de la case | |
| `camion_*_dos`, `remorque_*` | véhicule couché sur l'axe haut-gauche ↔ bas-droite, arrière en bas à droite (vers le spectateur), cabine en haut à gauche | cabine côté x=min (comme les camions du lot 1) |
| `camion_*_face` | même axe, cabine en bas à droite (vers le spectateur), arrière en haut à gauche | cabine côté x=max |
| personnages | regardent vers le bas-droite de l'écran | vers +x |

Les sprites `convoyeur_droit_sud_est`, `convoyeur_vide_droit_sud_est`, `convoyeur_coin_sw` et
`convoyeur_vide_coin_sw` sont produits à partir des gabarits du lot 1 : cadrage et ancre exacts.
Les autres orientations n'ont pas encore de gabarit : leur sens ne repose que sur la consigne
donnée au modèle. Le PRODUCTEUR vérifie chaque rendu contre ce tableau et refait ceux qui sont à l'envers.
