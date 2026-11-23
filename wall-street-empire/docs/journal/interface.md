# Journal du responsable Interface

Domaine : HUD, menu, journal, décisions en attente, fenêtres générales, croix de fermeture, infobulles, calques. Les fenêtres des magasins et usines (grille d'emplacements, fournisseurs) appartiennent au responsable Chaîne & Commerce : je n'y touche pas.

## Indicateurs (charte `docs/RESPONSABILITES.md`) et mesure
| Indicateur | Mesure | État |
|---|---|---|
| Écran de jeu libre, HUD minimal | t98 (2 indicateurs), t103 (HUD : trésorerie + CA, date, vitesse, zoom ; ≤ 6 boutons) | atteint |
| Zéro pop-up interrompant | t98 (220 jours avec événements), t103 (60 jours : 0 notification flottante, 0 panneau ouvert tout seul) | atteint |
| Tout panneau fermable en un clic / Échap | t98 (9 panneaux), t103 (chaque entrée du menu : croix ≥ 44 px en haut à droite, Échap) | atteint |
| Action utile visible sans défiler | t103 (rail : 16 entrées de 44 px tiennent à 800 px de haut ; dock en bas à gauche) | atteint sur bureau ; téléphone : tiroir |
| Information à la demande | menu vertical : rien ne s'affiche tout seul, points « nouveau » seulement | atteint |

## Lot 1 (passe 103) : menu vertical à la Capitalism Lab
Demande de Rémy : un menu vertical à gauche, toujours accessible et repliable, qui remplace le bouton « Menu » et regroupe tout ; précision : un dock d'information en bas à gauche (journal, ville et économie, recherches, annonces des concurrents).

Décisions :
- **Un seul rail** : les 4 sources d'information forment le pied du rail (bloc « Informations » en bas à gauche) plutôt qu'un second dock flottant : l'écran reste libre et la navigation complète reste en haut du rail.
- **Fenêtre unique** : chaque rubrique ouvre la fenêtre du menu (`#panel`) ancrée à droite du rail, avec ses onglets en haut ; on réutilise les écrans existants (sections `data-sec`) et les boutons `[data-ptab]` d'origine (les tests qui les cliquent restent valables). Une seule fenêtre à la fois (ouvrir une rubrique ferme journal, décisions, aide, guide, vue Produits, terminal).
- **Plein écran ou largeur réglable** (bord droit à tirer), mémorisés (`wse-pfull`, `wse-pw`) ; rail déplié mémorisé (`wse-vnx`).
- **HUD** : trésorerie (résultat et CA du mois), date, vitesse, zoom. Partis dans le menu : Menu (☰), Produits, Calque et Transparence (Réglages et partie), Reset (Réglages), ▾ (Ville et économie), bandeau Objectifs (Objectifs et missions), Journal / Décisions / Aide (entrées du rail, mêmes boutons et identifiants). Minimap déplacée en haut à droite.
- **Écrans ajoutés** (lecture seule, aucune donnée économique modifiée) : Sociétés (classement trésorerie, CA annuel, résultat, courbe 36 mois ; fiche société : stratégie, bilan, compte de résultat, bourse, établissements), Fiches produits (Ta marque / Moyenne du marché / Pondération pour prix, qualité, marque ; camemberts production et détail ; ventes 12 mois ; filtres société, catégorie, ville), Mes établissements (par type, état, résultat, Ouvrir / Voir), Annonces des concurrents (dépêches « rivaux » du journal + décisions), bloc macro (inflation, pouvoir d'achat, chômage, PIB, taux) dans Ville et économie, coche ✓ dans le Guide du fabricant quand toutes les matières sont disponibles (stock ou production propre).
- **Sauvegarde** : seul ajout, `S.rk.fh` (historique des sociétés, 36 relevés mensuels au plus, facultatif) ; une ancienne sauvegarde reprend les 13 relevés de `S.rk.H`.
- **Téléphone** (390×844) : bouton Menu 48 px en bas à gauche (point « nouveau ») qui ouvre le rail en tiroir (libellés, dock en bas) ; la fenêtre occupe l'écran ; onglets et croix ≥ 44 px.

Tests adaptés (ils encodaient l'ancien HUD) :
- `t64_mobile` : « bouton ▾ » remplacé par Menu > Ville et économie (6 indicateurs + macro) ; ouverture du menu par `#vnMob` puis l'entrée du rail au lieu de `#pn` ; vue Produits par Menu > Produits > « Lancer un produit » au lieu de `#pv`.
- Les tests qui cliquent `#pn`, `#pv`, `#rst` par le code (t01, t08, t27, t29, t32, t66, t98, audit_lib) restent valables : ces boutons existent toujours (masqués) pour la compatibilité.

Nouveau test : `t103_menu_vertical` (rail, dock, repli, HUD minimal, chaque entrée ouvre une fenêtre avec croix et Échap, contenus ajoutés, plein écran, téléphone, 60 jours sans notification flottante, sauvegarde `fh`).

Tests lancés un par un après le lot 1 : t01, t05, t08, t44, t64, t83, t96, t98, t100, t103, t27, t29, t34, t37, t40, t42, t46, t48, t62, t66, t71, t76 : tous verts. Échecs déjà présents sur la branche de départ (vérifiés sur le `city.html` d'origine, hors de mon domaine) : t26 (2 récaps macro/événement), t32 (rachat refusé), t47 (alerte d'expiration de brevet), t60 (boutons superposés dans la fenêtre des magasins s2/s3/s4 : domaine Chaîne & Commerce).

## Lot 2 (passe 103, suite)
- Finances : onglet **Flux de trésorerie** consolidé (encaissements, décaissements d'exploitation, EBE, intérêts, impôt, flux d'exploitation, dividendes, flux disponible, autonomie en mois si le flux est négatif).
- Actions financières : onglets Emprunts et levées + **Actions et bourse**.
- Sélecteur de calque : s'ouvre sous le bouton (désormais dans Réglages) sans sortir de l'écran.
- Téléphone : tiroir fermé invisible (plus de cibles hors écran pour le lecteur d'écran et l'audit) ; en-tête de fenêtre sans bandeau de chiffres.
- `tools/ui_audit.js` : ouvre le menu par le rail (l'ancien bouton « Menu » n'existe plus) ; audit 1280×720, 1920×1080, 390×844 : aucun problème détecté.
- Tutoriel : sur téléphone, la flèche désigne le bouton Menu en bas à gauche tant que le tiroir est fermé.

Reste à faire (lots suivants) :
- Courbe 36 mois : se remplit au fil des relevés mensuels (une partie neuve n'a qu'un point).
- Multi-villes : le filtre Ville ne propose que la ville courante.
- Pas encore de dividende pour les sociétés (affiché « — »).
