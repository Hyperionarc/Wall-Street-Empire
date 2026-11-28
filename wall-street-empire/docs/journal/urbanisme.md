# Journal du responsable Urbanisme (ville de départ)

## Mission (Rémy)
« Évite de mettre des recharges électriques en plein milieu de la ville. Dégage de la place. L'hôtel de ville, centre-le près du City Mall, visible, dans un bloc de cafés et de jolis immeubles existants. Trop de collèges et de services publics ; jamais deux collèges côte à côte ; répartis-les d'un angle à l'autre et cache-les derrière des immeubles. »

## Diagnostic (captures avant, ville de 100 000 habitants, `tools/capture_ville.js`)
- « Recharges électriques » = les **stations-service et stations de recharge électrique** (précision de Rémy) : services de quartier (`VV_SVC`, couronne « p ») peints sur des immeubles de la ville, à 9 cases du Mall, donc en plein tissu urbain.
- Hôtel de ville en (32-33, 45-46) : 10 cases au sud du Mall, au bord de la ville.
- 15 équipements publics : 2 stades, lycée, 2 collèges, 3 maternelles, 2 crèches (les `XTRA` de `genCityM` posés au hasard dans le bâti), hôpital, police, pompiers, télécom, mairie ; lycée et collège tous deux sur le bord nord.
- Abords du Mall : une seule rangée de lots libres.

## Décisions
- **Stations** : retirées de `VV_SVC` ; nouveau décor `vvFuelMap()` (3 stations-service, 2 de recharge) sur la campagne libre au bord des **routes qui sortent de la ville** (case voisine d'une route hors zone urbaine, 2 à 10 cases du bord de la ville, espacées de 9 cases). Rien n'est sauvegardé ; une case prise par le joueur fait disparaître la station ; elles suivent l'extension de la ville. Pas de lien avec le réseau électrique ni les chaînes (elles n'en avaient aucun).
- **Hôtel de ville** : `MONU['38,34']` (2×2 en 38-39 × 34-35), dans l'îlot à droite du Mall (3 cases de son emprise), façade côté avant isométrique dégagée par construction (avenue de l'anneau devant, coin 2×2 libre du bloc à côté). `vvSvcMap` regroupe d'abord cafés, restaurants, boulangeries et boutiques à 4 cases de la mairie : un îlot vivant où le joueur construit la suite.
- **Équipements** : un de chaque sorte à 100 000 habitants (c'est ce que `CITY_SVC` demande) ; `XTRA` vidé, second stade retiré (même groupe de bonus « sport » : aucun effet sur l'humeur). 10 équipements au lieu de 15. Les quatre écoles aux quatre angles de la ville (13,13 · 43,13 · 13,43 · 43,43), au fond de leur bloc (le bâti de devant les masque). La croissance (`citySvcGrow`) ne pose plus jamais une école contre une autre.
- **Place libre** (`genCityM`) : deux rangées de lots libres autour du Mall (au lieu d'une) et les lots qui bordent les deux grands axes (avenues 30) ; la population visée est inchangée (la ville s'étale un peu plus loin en maisons).
- Déterminisme : tout par `hash()`. Sauvegarde : aucun champ nouveau ; une ancienne sauvegarde garde sa ville (la disposition ne change qu'à la génération).

## Tests
- Nouveau `t118_urbanisme.js` (10 contrôles) : mairie ≤ 4 cases du Mall, façade dégagée, ≥ 3 commerces autour ; écoles non contiguës et à ≥ 15 cases l'une de l'autre, au fond du bloc ; ≤ 10 équipements ; aucune station en ville, 5 au bord des routes d'accès ; ≥ 80 lots libres aux abords du Mall et ≥ 40 le long des axes ; déterminisme ; sauvegarde.
- Ajustés (nouvelle disposition voulue) : `t44` (10 équipements au lieu de 11), `t50` (stations hors ville ; restaurant cliqué non masqué par un voisin de devant), `t89_ville_100k` (un équipement de chaque sorte), `t77` (le magasin de test n'est plus posé contre une école).

## Emprunts et conception propre
Principe emprunté à l'urbanisme réel : stations-service en entrée de ville, équipements de quartier répartis, parvis devant la mairie. Disposition, règles et code conçus pour notre jeu.

## Reste imparfait
- Les cadres colorés de propriété des rivaux (losanges cyan, rose, orange) restent nombreux en ville : domaine Interface.
- Une tour de bureaux vectorielle bleue isolée (sans sprite HD) se voit à gauche du Mall : domaine Visuels.

## Captures (avant / après, ville de 100 000 habitants)
`docs/journal/captures/urbanisme_avant_large.jpg`, `urbanisme_apres_large.jpg`, `urbanisme_avant_centre.jpg`, `urbanisme_apres_centre.jpg` (outil : `tools/capture_ville.js <dossier> ville`).
