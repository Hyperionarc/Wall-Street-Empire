# Jouer à plusieurs (phase 1 : « course parallèle »)

## En deux mots

- Chaque joueur fait tourner **sa propre partie** dans son navigateur. Tout le monde part de la **même graine** et des **mêmes réglages** : même ville, mêmes gisements, mêmes IA, mêmes tirages aléatoires au départ.
- Un **petit serveur de salle** (`wall-street-empire/server/server.js`, Node + `ws`) relaie chaque seconde l'état résumé de chacun : valeur, trésorerie, population, jour, caste, pseudo, statut. Il donne à tous un **classement commun en direct**, lance la partie au même moment pour tous et décide de la **fin de manche commune** : premier à l'objectif (1 Md$ par défaut) ou plus grande valeur à la fin du temps.
- **2 à 6 humains**, **6 places au plus** (3 à 6 au choix de l'hôte). Chaque humain choisit une caste **libre** (une caste par joueur) ; les **IA** prennent les autres castes au niveau de difficulté de la salle (1 à 8).
- Les humains ne s'attaquent pas directement en phase 1 : chacun a sa ville. Dans **ta** ville, la caste d'un autre humain est tenue par une IA locale (son « double »), pour garder la même concurrence que dans un Round à 6.
- Le même service sert **le jeu et la salle** : une seule adresse à donner aux amis.
- Le solo ne change pas : le jeu n'ouvre **aucune** connexion tant qu'on n'ouvre pas « Jouer à plusieurs ».

### Dans le jeu

- **Menu > Réglages et partie > Jouer à plusieurs**, ou la carte **Jouer à plusieurs** de l'écran Nouvelle partie.
- **Créer une salle** : tu deviens l'hôte. Le code (4 lettres) et un lien `…/?salle=CODE` s'affichent ; donne-les à tes amis.
- **Rejoindre** : pseudo + code. Le lien `?salle=CODE` ouvre directement l'écran avec le code prérempli.
- Chacun **choisit sa caste** parmi celles qui ne sont pas prises (une caste déjà prise est grisée et refusée par le serveur), puis clique **Je suis prêt**.
- L'hôte règle : **niveau des IA** (1 à 8), **durée** (5 à 120 min), **départ** 10 M$ (normal) ou 100 M$ (facile) par joueur, **objectif** (1 Md$ par défaut), **places au total** (3 à 6), **ville de départ**, **graine**. Puis **Lancer la partie** : compte à rebours de 3 s et départ en même temps pour tous.
- Pendant la partie : la puce **Salle CODE · Rang 2/6 · 47 min restantes** en haut de l'écran, et le **classement commun en direct** en tête de **Menu > Sociétés > Classement**. Pas de fenêtre surgissante.
- Fin de manche : l'écran de fin habituel, avec en plus **Résultats de la salle** (rang, pseudo, caste, humain ou IA, valeur).
- **Coupure réseau** : la partie locale continue ; le jeu se reconnecte tout seul (1 s, 2 s, 4 s… jusqu'à 15 s). Si la page est rechargée, la sauvegarde locale reprend et le jeu rejoint la salle avec son jeton.

---

## (a) Jouer en local avec des amis (même Wi-Fi)

Il faut Node.js 18 ou plus récent sur l'ordinateur qui héberge.

```sh
cd wall-street-empire/server
npm install
node server.js
```

Le serveur affiche les adresses à utiliser :

```
Wall Street Empire · serveur de salle sur le port 8080
  sur cet ordinateur : http://localhost:8080/
  pour tes amis (même réseau) : http://192.168.1.20:8080/
```

Tu ouvres `http://localhost:8080/`, tes amis ouvrent l'adresse « pour tes amis » (même Wi-Fi). Si l'adresse ne répond pas chez eux, autorise Node dans le pare-feu de l'ordinateur hôte (Windows le demande au premier lancement). Le port se change avec `PORT=9000 node server.js`.

Le jeu servi est `wall-street-empire/city.html` (construit par `python3 wall-street-empire/tools/build.py`), ou `city.pub.html` s'il existe (voir d).

## (b) Mettre en ligne (recommandé) : UN seul service Node

Le plus simple : un seul service qui sert `city.html` **et** le WebSocket `/ws`. Une seule adresse en `https://` (le jeu passe alors tout seul en `wss://`).

### Render (gratuit possible)

1. Pousse le dépôt sur GitHub (le fichier `city.html` construit doit être dans le dépôt).
2. Sur render.com : **New > Blueprint**, choisis le dépôt : le fichier `render.yaml` à la racine crée le service. Sans Blueprint : **New > Web Service** avec
   - Root Directory : `wall-street-empire`
   - Build Command : `npm ci --prefix server --omit=dev`
   - Start Command : `node server/server.js`
   - Health Check Path : `/healthz`
   - Plan : Free (ou Starter).
3. L'adresse est du type `https://wall-street-empire.onrender.com/` : c'est le lien à donner.

Le plan gratuit **s'endort après 15 minutes sans visite** et met environ une minute à se réveiller ; un redémarrage efface les salles (elles vivent en mémoire). Ouvre le lien quelques minutes avant de jouer. Pour des soirées régulières, le plan Starter (payant) évite ces pauses.

### Fly.io

Depuis `wall-street-empire/` (le `Dockerfile` et le `fly.toml` sont fournis) :

```sh
fly launch --copy-config --no-deploy   # choisis un nom d'application libre (remplace « wse-salle-a-renommer »)
fly deploy
```

Une seule machine (les salles sont en mémoire), réveil automatique, région Paris (`cdg`).

### Railway, ou une VM

- Railway : nouveau projet depuis le dépôt, dossier racine `wall-street-empire`, il détecte le `Dockerfile`. Rien à régler : `PORT` est fourni par Railway.
- VM (OVH, Scaleway, Hetzner…) : `docker build -t wse-salle wall-street-empire && docker run -d --restart unless-stopped -p 80:8080 wse-salle`, ou Node directement (`node server/server.js` avec `PORT=80`), derrière un proxy HTTPS (Caddy : `reverse_proxy localhost:8080`, le WebSocket passe tel quel).

Variables d'environnement (toutes facultatives, aucun secret) : `PORT` (8080), `HOST` (0.0.0.0), `CITY_HTML` (chemin du jeu servi), `ALLOW_ORIGINS` (origines autorisées pour le WebSocket, séparées par des virgules ; vide = toutes), `MAX_ROOMS` (300), `MAX_CONN_PER_IP` (16).

## (c) Variante : jeu en statique, salle séparée

Tu peux héberger `city.html` sur GitHub Pages, Cloudflare Pages, Netlify… et seulement le serveur de salle sur Render/Fly.io. On indique alors l'adresse du serveur dans le lien :

```
https://toi.github.io/wse/city.html?server=https://wse-salle.onrender.com
https://toi.github.io/wse/city.html?server=wse-salle.onrender.com&salle=ABCD
```

(l'écran « Jouer à plusieurs » propose aussi un champ « Serveur de salle »). Le WebSocket n'a pas besoin de CORS ; pour n'accepter que ton site, règle `ALLOW_ORIGINS=https://toi.github.io` sur le serveur. Une page en `https://` ne peut parler qu'à un serveur en `wss://` (https) : c'est le cas de Render et Fly.io. Ouvert directement depuis le disque (`file://`), le jeu demande l'adresse du serveur.

## (d) Taille du fichier : version publiable allégée

`city.html` pèse ≈ 22 Mo (images intégrées). Le serveur l'envoie compressé (≈ 16 Mo transférés) et le navigateur le garde en cache, mais sur téléphone le premier chargement reste long, et certains hébergeurs ou outils limitent la taille d'un fichier (Cloudflare Pages : 25 Mo par fichier ; 16 Mo pour une page publiée comme artefact). La version allégée (images en WebP) se construit ainsi :

```sh
sh wall-street-empire/tools/build_pub.sh wall-street-empire/city.pub.html
```

Mesuré le 26/11 : 18,2 Mo (12,1 Mo transférés compressés) contre 22,6 Mo (15,9 Mo). Pour passer sous 16 Mo, baisser la qualité : `WSE_PUB_Q=70 WSE_PUB_PQ=80 WSE_PUB_JQ=60 sh wall-street-empire/tools/build_pub.sh …` (vérifier le rendu des images).

Si `city.pub.html` existe à côté de `city.html`, le serveur et l'image Docker la servent automatiquement (sinon `CITY_HTML=…`). Elle contient le même jeu et le même module multijoueur.

## (e) Sécurité et vie privée

- **Aucune donnée personnelle** : pas de compte, pas d'e-mail, pas de cookie. Le pseudo est nettoyé (balises, caractères de contrôle, 20 caractères au plus). Les adresses IP ne sont ni enregistrées ni écrites dans les journaux (un simple compteur en mémoire limite le nombre de connexions par adresse).
- Le jeton de reconnexion (aléatoire) et le code de salle sont gardés dans le navigateur (`localStorage`, clé `wse-mp`) et effacés à la fin de la manche.
- Limites anti-abus : messages de 4 Ko au plus (au-delà la connexion est fermée), débit limité (4 messages/s, rafales de 20 ; l'état de partie n'est pris en compte qu'une fois par ~0,7 s), une seule salle par connexion, 6 humains par salle, 16 connexions par adresse, 300 salles, salles vides supprimées (10 min en attente, 30 min en partie, 20 min après la fin).
- **Confiance** : en phase 1, chaque navigateur annonce lui-même sa valeur. Un joueur qui modifie son jeu peut tricher (les bonus « bac à sable » et le changement de caste sont désactivés pendant une partie à plusieurs, mais rien n'empêche de bricoler la page). À réserver aux parties entre amis.

## (f) Limites de la phase 1 et phase 2

### Ce que la phase 1 ne fait pas

- **Pas de monde partagé** : chacun joue sa ville. On ne peut ni acheter les immeubles d'un autre humain, ni lui faire une OPA, ni lui prendre des clients. Les villes divergent dès les premières décisions (les tirages aléatoires dépendent de ce qu'on fait).
- La carte (routes, ville, gisements, port) est la carte fixe du jeu (`MAP_SEED`) ; la graine de salle règle tous les tirages : événements, IA (qualité, style, décisions), cycle économique, croissance de la ville.
- La valeur d'une IA dans le classement commun est la **moyenne** de ce que voit chaque humain connecté (chacun affronte sa propre copie de l'IA).
- Le temps de la manche est le temps réel du serveur : faire pause ne l'arrête pas (le Round est à vitesse ×1 pour tous, pas d'accélération).
- Pas d'arrivée en cours de partie (seule la reconnexion d'un joueur déjà inscrit est acceptée) ; un serveur redémarré perd ses salles (les parties locales continuent hors classement commun).

### Phase 2 : monde partagé (non implémentée)

Objectif : une seule ville, les humains se concurrencent pour de vrai (clients, immeubles, OPA). Deux architectures possibles : **lockstep** (chaque navigateur simule tout, seules les commandes circulent) ou **hôte autoritaire** (un navigateur ou le serveur simule, les autres reçoivent l'état). Prérequis :

1. **Bus de commandes unique** : toutes les actions du joueur (poser, démolir, régler un prix, emprunter, acheter des actions…) doivent passer par une seule fonction `cmd(joueur, action, paramètres)` sérialisable, appliquée au début d'un jour donné. Aujourd'hui l'interface modifie `S` directement à des centaines d'endroits.
2. **Identité de joueur** au lieu de `'me'` : propriétaire des bâtiments, trésorerie, emprunts, produits, marques, caste… sont « le joueur » implicite. Il faut un tableau de sociétés humaines (les sièges `S.seats` et `companyOf()` en sont l'amorce) et des propriétaires explicites partout.
3. **Déterminisme inter-navigateurs** (lockstep) : `Math.exp`, `Math.sin`, `Math.pow`, `Math.log` peuvent donner des résultats différents au dernier bit selon le navigateur et le processeur ; les écarts grossissent jour après jour. Il faut des fonctions maison (tables ou polynômes) ou des calculs en virgule fixe dans la simulation, plus une somme de contrôle de `S` échangée chaque jour pour détecter une désynchronisation. Le générateur aléatoire (`rnd`, mulberry32 en entiers) et `hash()` sont déjà déterministes ; il ne reste aucun `Math.random` dans la simulation.
4. **Synchronisation de vitesse** : un seul horloger (le serveur) donne le tempo des jours ; pause et vitesse deviennent des votes ou des décisions de l'hôte.
5. **Interface multi-sociétés** : fiches, menus, classements, rachats entre humains, messages entre joueurs.

Estimation : hôte autoritaire (l'hôte simule, les autres envoient des commandes et reçoivent un état résumé de leur société et de la carte visible) ≈ 4 à 6 semaines ; lockstep complet ≈ 2 à 3 mois, surtout pour le bus de commandes et le déterminisme des fonctions mathématiques.

---

## Fichiers

- `wall-street-empire/multiplayer.js` : client (écran de salle, classement, reconnexion), inséré dans `city.html` par `tools/build.py`.
- `wall-street-empire/server/server.js`, `package.json` : serveur de salle (sert aussi le jeu).
- `wall-street-empire/Dockerfile`, `.dockerignore`, `fly.toml`, `render.yaml` (racine du dépôt) : déploiement.
- Test : `NODE_PATH=$(npm root -g) node wall-street-empire/tools/tests/run.js t109` (serveur local sur un port libre, deux pages, captures dans `$WSE_SHOTS`).

### Protocole (JSON sur `/ws`)

Client → serveur : `create {name}`, `join {code, name, token?}`, `caste {caste}`, `ready {on}`, `settings {set}` (hôte), `start` (hôte), `state {w, cash, pop, day, st, ai}` (≈ 1/s), `leave`, `ping`.
Serveur → client : `joined {code, pid, token, host}`, `room {room}`, `start {seed, set, seats, in}`, `board {rows, left}` (1/s), `end {why, rows, winner}`, `err {code, msg}`.
