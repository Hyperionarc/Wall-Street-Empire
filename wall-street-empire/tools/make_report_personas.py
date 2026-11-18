#!/usr/bin/env python3
"""Génère docs/WSE_Rapport_Personas.pdf à partir des campagnes simulées (JSONL) : personas, castes, comparaison, plan d'amélioration."""
import json, sys, os, statistics as st, collections, html, subprocess
SC = sys.argv[1]; OUT = os.path.join(os.path.dirname(__file__), '..', 'docs')
P = [json.loads(l) for l in open(f'{SC}/sim_personas.jsonl') if l.strip()]; P = [r for r in P if 'series' in r]
C = [json.loads(l) for l in open(f'{SC}/sim_campagne2.jsonl') if l.strip()]; C = [r for r in C if 'series' in r]
V0 = 10e6; VS = 14.26e6
def at(r, d, k):
    s = [x for x in r['series'] if x['d'] >= d]; return (s[0] if s else r['series'][-1])[k]
def fin(r, k='val'): return r['series'][-1][k]
PN = {'hardcore': ('Marc, 34 ans', 'Hardcore gamer, ancien de Capitalism II', '#d95f5f'), 'joueuse': ('Léa, 29 ans', 'Joueuse régulière, esthète', '#b78cff'), 'ado': ('Noé, 15 ans', 'Gamer de navigateur', '#3fb6d6'), 'fermier': ('Hugo, 41 ans', 'Fan de Farm Simulator', '#6bbf59')}
STRAT = {'hardcore': 'optimise vite (levier 55 %, agit tous les 2 jours)', 'joueuse': 'régulière (levier 45 %, tous les 4 jours)', 'ado': 'joue peu et par à-coups (levier 25 %, une action sur deux perdue)', 'fermier': 'bâtit des fermes, des élevages et la chaîne agro-industrielle'}
by = collections.defaultdict(list)
for r in P: by[r['persona']].append(r)
def line_chart(series, w=520, h=135, ymax=None, title=''):
    ds = sorted({x['d'] for r in P for x in r['series']}); ymax = ymax or max(max(v) for v in series.values()) * 1.05
    ox, oy, W, H = 42, 12, w - 52, h - 38
    def X(d): return ox + W * (d - ds[0]) / (ds[-1] - ds[0])
    def Y(v): return oy + H - H * v / ymax
    s = f'<svg viewBox="0 0 {w} {h}" width="100%">'
    for k in range(5):
        v = ymax * k / 4; s += f'<line x1="{ox}" y1="{Y(v):.1f}" x2="{ox+W}" y2="{Y(v):.1f}" stroke="#e3e6f5"/><text x="{ox-6}" y="{Y(v)+3:.1f}" font-size="8.5" text-anchor="end" fill="#5b6390">{v:.0f}</text>'
    for d in ds[::6]: s += f'<text x="{X(d):.1f}" y="{h-18}" font-size="8.5" text-anchor="middle" fill="#5b6390">{d*0.75/60:.0f} min</text>'
    for k, v in series.items():
        pts = ' '.join(f'{X(d):.1f},{Y(x):.1f}' for d, x in zip(ds, v)); s += f'<polyline points="{pts}" fill="none" stroke="{PN[k][2]}" stroke-width="2.4"/>'
        s += f'<text x="{X(ds[-1])+3:.1f}" y="{Y(v[-1])+3:.1f}" font-size="9" fill="{PN[k][2]}" font-weight="700">{PN[k][0].split(",")[0]}</text>'
    return s + f'<text x="{ox}" y="{h-4}" font-size="8.5" fill="#5b6390">{title}</text></svg>'
ds = sorted({x['d'] for r in P for x in r['series']})
curves = {k: [st.median(at(r, d, 'val') / V0 for r in v) for d in ds] for k, v in by.items()}
def tab(rows, head):
    return '<table><tr>' + ''.join(f'<th>{h}</th>' for h in head) + '</tr>' + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows) + '</table>'
mrows = []
for k in ['hardcore', 'joueuse', 'ado', 'fermier']:
    v = by[k]; t3 = [next((x['d'] for x in r['series'] if x['rk'] <= 3), None) for r in v]; t3v = [t for t in t3 if t is not None]
    top = sum(1 for r in v if fin(r, 'rk') == 1)
    mrows.append([f'<b>{PN[k][0]}</b><br><small>{PN[k][1]}</small>', f'×{st.median(fin(r)/V0 for r in v):.1f}', f'{st.mean(at(r,300,"rk") for r in v):.1f}', f'{st.median(at(r,300,"val")/VS for r in v):.2f}', (f'{int(st.median(t3v))} j ({len(t3v)}/{len(v)})' if t3v else 'jamais'), f'{st.mean(fin(r,"rk") for r in v):.1f}', f'{top}/10', f'{100*st.mean(fin(r,"unemp") for r in v):.1f} %'])
allr = P + C; bc = collections.defaultdict(list)
for r in allr: bc[r['caste']].append(r)
CN = {'agriculteur': 'Exploitant agricole', 'banquier': "Banquier d'affaires", 'industriel': 'Baron industriel', 'innovateur': 'Innovateur tech', 'negociant': 'Négociant en matières', 'promoteur': 'Promoteur BTP'}
crow = []
for c in ['agriculteur', 'industriel', 'promoteur', 'banquier', 'negociant', 'innovateur']:
    v = bc[c]; crow.append([f'<b>{CN[c]}</b>', str(len(v)), f'×{st.median(fin(r)/V0 for r in v):.1f}', f'{st.mean(fin(r,"rk") for r in v):.1f}', f'{st.mean(at(r,300,"rk") for r in v):.1f}', f'{100*st.mean(fin(r,"loan")/max(1,fin(r)) for r in v):.0f} %', f'{st.mean(fin(r,"happy") for r in v):.0f}'])
N = len(allr)
css = """@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:10pt/1.5 'Helvetica Neue',Arial,sans-serif;color:#1c2040}.pg{width:210mm;height:297mm;padding:15mm 16mm 13mm;page-break-after:always;position:relative;overflow:hidden}
.cover{background:linear-gradient(160deg,#0b1030,#1b2150 70%,#26307a);color:#fff;padding:26mm 18mm}.cover h1{font-size:30pt;line-height:1.1;margin:12mm 0 5mm;color:#fff}.cover h1 b{color:#f2b84b}.cover p{color:#c9d0ff;font-size:12.5pt;max-width:150mm}
.tag{display:inline-block;border:1px solid #f2b84b;color:#f2b84b;padding:2px 10px;border-radius:20px;font-size:9pt;letter-spacing:.14em;text-transform:uppercase}
h2{font-size:17pt;margin:0 0 3mm;color:#1b2150}h2 i{font-style:normal;color:#d99a1e;margin-right:6px}h3{font-size:11.5pt;margin:4mm 0 1.5mm;color:#1b2150}
.hd{display:flex;justify-content:space-between;font-size:8.5pt;color:#5b6390;border-bottom:1px solid #dde1f3;padding-bottom:2mm;margin-bottom:5mm;letter-spacing:.08em;text-transform:uppercase}
.ft{position:absolute;left:16mm;right:16mm;bottom:7mm;font-size:8pt;color:#9aa1c8;display:flex;justify-content:space-between}
table{width:100%;border-collapse:collapse;font-size:8.8pt;margin:2mm 0}th{background:#1b2150;color:#fff;text-align:left;padding:1.6mm 2.4mm;font-weight:600}td{padding:1.6mm 2.4mm;border-bottom:1px solid #e3e6f5;vertical-align:top}tr:nth-child(even) td{background:#fafbff}small{color:#5b6390}
.card{background:#f6f7fc;border:1px solid #e1e5f5;border-radius:8px;padding:3mm 4mm;margin-bottom:3mm}.cols{display:flex;gap:5mm}.cols>div{flex:1}
.warn{background:#fff6e1;border:1px solid #f0d28a;border-radius:8px;padding:3mm 4mm;margin:3mm 0;font-size:9.3pt}.note{font-size:8.6pt;color:#5b6390}
.chat p{margin:1mm 0;font-size:9pt}.chat b{font-size:8.6pt}ul{margin:1mm 0 2mm 5mm;padding:0}li{margin:.8mm 0}.ok{color:#2b7a47;font-weight:700}.ko{color:#b3363b;font-weight:700}"""
pages = []
pages.append(f'<div class="pg cover"><span class="tag">Étude de jeu</span><h1>WALL STREET <b>EMPIRE</b><br>Quatre joueurs, six castes, {N} parties</h1><p>Ce que ressentent un hardcore gamer ex-Capitalism II, une joueuse régulière, un adolescent de navigateur et un fan de Farm Simulator, et ce qu\'il faut changer pour dépasser Capitalism II.</p><div class="warn" style="color:#1c2040;margin-top:14mm"><b>Lecture de ce document.</b> Les quatre personas sont des <b>joueurs simulés</b> : leur comportement est mesuré sur {N} parties jouées par des bots, et leurs avis sont rédigés par l\'équipe de conception à partir de ces mesures et de critiques publiques de Capitalism et de Supremacy. Ce n\'est <b>pas</b> un retour de vrais joueurs ; il sert à repérer les problèmes à tester ensuite avec de vraies personnes.</div></div>')
pages.append(f'''<div class="pg"><div class="hd"><span>Wall Street Empire · étude de jeu</span><span>1 · Résumé</span></div><h2><i>01</i>Résumé</h2>
<div class="card"><h3>Les cinq constats qui comptent</h3><ul>
<li><b>Début de partie décourageant pour trois profils sur quatre.</b> Au bout de 4 minutes de jeu (jour 300), Marc, Léa et Noé sont derniers du classement ; leur valeur n'a progressé que de 12 à 15 %. Seul Hugo (fermes et chaîne agro-industrielle) est déjà 2<sup>e</sup>.</li>
<li><b>L'agriculture et les chaînes verticales écrasent le commerce seul</b> : Hugo finit à ×{st.median(fin(r)/V0 for r in by["fermier"]):.1f} sa mise et premier dans {sum(1 for r in by["fermier"] if fin(r,"rk")==1)} parties sur 10, contre ×3 à ×4 pour les autres. Excellente nouvelle pour les joueurs de Farm Simulator, mais le conseil du jeu (« commence par un petit marché ») mène à la dernière place.</li>
<li><b>Plus d'actions ne veut pas dire plus de gains.</b> Le hardcore qui optimise vite finit à ×{st.median(fin(r)/V0 for r in by["hardcore"]):.1f} (rang moyen {st.mean(fin(r,"rk") for r in by["hardcore"]):.1f}), moins bien que l'adolescent qui joue à moitié (×{st.median(fin(r)/V0 for r in by["ado"]):.1f}) : les magasins saturent la ville. Il manque des leviers d'optimisation visibles (prix, marque, carnet de commandes).</li>
<li><b>Les six castes sont jouables mais pas équilibrées en début de partie</b> : aucune ne donne de victoire rapide hors agriculture ; les mécaniques propres à chaque caste (banque, cartels, brevets) ne sont pas encore le moteur de plaisir.</li>
<li><b>Face à Capitalism II</b> : on le dépasse sur le visuel, le réalisme macro et financier et la lisibilité de l'usine ; on ne l'a pas encore dépassé sur la <b>fidélisation long terme</b> (pas de monde persistant, pas de saisons, pas d'alliances).</li></ul></div>
<h3>Qui joue quoi</h3>{tab([[f"<b>{PN[k][0]}</b>", PN[k][1], STRAT[k]] for k in ["hardcore","joueuse","ado","fermier"]], ["Persona","Profil","Comportement mesuré"])}
<p class="note">Chaque persona a joué 10 mondes (même graine pour les quatre), en prenant chaque fois une caste différente et en parcourant les six castes. Horizon : 2 400 jours, soit 30 minutes de jeu. Une campagne générale de {len(C)} parties complète l'ensemble ({N} au total).</p>
<h3>Courbe de richesse (valeur de l'empire ÷ 10 M$ de départ, médiane des 10 parties)</h3>{line_chart(curves, ymax=max(max(v) for v in curves.values())*1.05)}
<div class="ft"><span>Wall Street Empire · étude de jeu</span><span>2</span></div></div>''')
pages.append(f'''<div class="pg"><div class="hd"><span>Wall Street Empire · étude de jeu</span><span>2 · Les quatre joueurs</span></div><h2><i>02</i>Les quatre joueurs en chiffres</h2>
{tab(mrows, ["Joueur","Valeur à 30 min","Rang à 4 min","Valeur à 4 min (×)","1<sup>er</sup> top 3","Rang fin","1<sup>er</sup> au final","Chômage"])}
<p class="note">Valeur à 30 min : multiple des 10 M$ de départ. « Valeur à 4 min » : rapport à la valeur initiale de l'empire (14,3 M$ avec la dotation). Rang sur 6 joueurs.</p>
<div class="cols"><div><div class="card"><h3>Marc, 34 ans · hardcore, ex-Capitalism II</h3><p><b>Plaisir estimé : 2,5 / 5.</b> « La profondeur est là : chaînes, macro, banque. Mais je suis dernier au bout de quatre minutes et je ne vois pas pourquoi. Je veux voir l'offre, la demande et mes marges. Le carnet de commandes d'usine est la bonne direction. Je construis des magasins et ils s'écroulent : rendements décroissants, pas assez de leviers (prix, marketing, marque) pour reprendre la main. »</p><p><b>Reviendrait demain ?</b> Oui, s'il comprend la boucle gagnante ; sinon il retourne à Capitalism.</p></div>
<div class="card"><h3>Léa, 29 ans · joueuse régulière</h3><p><b>Plaisir estimé : 3 / 5.</b> « C'est beau, la ville est vivante et le Réseau est une idée drôle. Mais quarante minutes sans récompense et un vocabulaire de banquier : je ne sais pas quoi faire en premier. J'aimerais un fil d'objectifs courts et des petits succès. »</p><p><b>Reviendrait demain ?</b> Peut-être : un rappel quotidien et des objectifs courts la feraient revenir.</p></div></div>
<div><div class="card"><h3>Noé, 15 ans · gamer de navigateur</h3><p><b>Plaisir estimé : 2 / 5 au début, 4 / 5 à 30 min.</b> « Chuis dernier lol, c'est nul. Je quitte si rien ne se passe en trois minutes. Mais le chat est marrant et quand je monte au classement c'est cool. Un bouton qui explose, des notifs, des succès. » Il passe pourtant du dernier rang au rang {st.mean(fin(r,"rk") for r in by["ado"]):.1f} en moyenne à la fin : le jeu récompense la patience, pas la rapidité.</p><p><b>Reviendrait demain ?</b> Seulement s'il a une raison sociale (amis, classement) : c'est le profil le plus fragile avant 5 minutes.</p></div>
<div class="card"><h3>Hugo, 41 ans · fan de Farm Simulator</h3><p><b>Plaisir estimé : 4 / 5.</b> « Mes champs, mes bêtes, le tracteur : je m'y retrouve, et ça rapporte. Premier au classement dans {sum(1 for r in by["fermier"] if fin(r,"rk")==1)} parties sur 10. Il me manque ce qui fait Farm Simulator : conduire, labourer, la météo qui compte, les machines à améliorer, un champ qui change à l'écran selon la saison. »</p><p><b>Reviendrait demain ?</b> Oui, c'est le seul profil accroché dès les premières minutes.</p></div></div></div>
<div class="ft"><span>Wall Street Empire · étude de jeu</span><span>3</span></div></div>''')
pages.append(f'''<div class="pg"><div class="hd"><span>Wall Street Empire · étude de jeu</span><span>3 · Les six castes</span></div><h2><i>03</i>Les six castes</h2>
{tab(crow, ["Caste","Parties","Valeur à 30 min","Rang fin (moy.)","Rang à 4 min","Dette / valeur","Humeur"])}
<p class="note">{N} parties, toutes castes confondues. Les bots ne jouent pas encore les mécaniques propres à chaque caste (levier bancaire, cartels, brevets) : ces chiffres mesurent surtout le bonus de coût de chaque caste, pas son potentiel complet.</p>
<table><tr><th>Caste</th><th>Avantages</th><th>Inconvénients constatés</th><th>Améliorations proposées</th></tr>
<tr><td><b>Exploitant agricole</b></td><td>Fermes −25 %, rendements +15 %. Meilleur démarrage mesuré avec les chaînes agro-industrielles.</td><td>Le plus rentable de loin (×{st.median(fin(r)/V0 for r in by["fermier"]):.0f}) : risque d'unique stratégie gagnante.</td><td>Garder l'attrait ; donner aux autres castes des chaînes aussi rentables ; saisons, météo et machines pour les fans de simulation de ferme.</td></tr>
<tr><td><b>Baron industriel</b></td><td>Usines −12 %, production +5 %, OPA dès 10 %.</td><td>Démarrage lent : usines chères avant de vendre.</td><td>Mission de départ « première chaîne » avec récompense rapide ; carnet de commandes mis en avant.</td></tr>
<tr><td><b>Promoteur BTP</b></td><td>Construction −15 %, levier ×5, création de terrain.</td><td>Dette élevée (la plus forte du tableau) et rang bas à 4 min.</td><td>Premier chantier récompensé tout de suite ; afficher la plus-value immobilière en temps réel.</td></tr>
<tr><td><b>Banquier d'affaires</b></td><td>Levier ×10 sur 100 M$ de fonds propres, Bâle III.</td><td>Mécanique la plus riche mais invisible pour un nouveau joueur.</td><td>Bureau du banquier comme écran de départ : clients à financer, marges visibles, premier prêt en 2 minutes.</td></tr>
<tr><td><b>Négociant en matières</b></td><td>Cartels/embargos −50 %, exports +15 %.</td><td>Rang bas et peu de levier d'action au début.</td><td>Écran de trading avec prix en direct, premiers contrats d'import-export proposés.</td></tr>
<tr><td><b>Innovateur tech</b></td><td>Recherche −20 % de coût et +30 % de vitesse, brevets +50 %.</td><td>Effet des brevets lent à voir.</td><td>Tour de financement dès la 8<sup>e</sup> minute (déjà favorisé), premier brevet visible et récompensé.</td></tr></table>
<div class="ft"><span>Wall Street Empire · étude de jeu</span><span>4</span></div></div>''')
pages.append(f'''<div class="pg"><div class="hd"><span>Wall Street Empire · étude de jeu</span><span>4 · Comparaison avec Capitalism II</span></div><h2><i>04</i>Face à Capitalism II</h2>
<div class="card"><h3>Ce que disent les critiques publiques (sources en bas de page)</h3><ul>
<li>Capitalism II : critique unanime sur la <b>profondeur et la rejouabilité</b> (un joueur d'un forum parle de son « meilleur travail » et d'une rejouabilité massive ; un testeur : « presque trop de profondeur »).</li>
<li>Capitalism Lab : salué comme outil pour <b>apprendre la gestion</b> ; critiqué pour une carte isométrique « plus monotone que SimCity 3000 », un visuel daté, et un personnel à recruter jugé « virtuellement inutile ».</li>
<li>Supremacy (référence du multijoueur) : forte rétention mais reproches de <b>pay-to-win</b>, de lenteur des chronomètres et de bugs.</li></ul></div>
{tab([["Profondeur de la chaîne de production","Référence du genre","Équivalente et plus lisible (vue d'usine, carnet de commandes)","≈"],["Réalisme macro (cycles, inflation, taux)","Présent, discret","Quatre variables liées entre elles, taux bancaires qui suivent le cycle, mesures de corrélation conformes","<span class=ok>+</span>"],["Finance (dette, levées, bourse)","Bourse et prêts","Bâle III pour le banquier, tours de financement avec pitch, tours de table des rivaux","<span class=ok>+</span>"],["Visuel","Daté, carte monotone","Rendu HD de la ville, des gisements, des forêts et des fermes ; encore des zones anciennes (sol, routes)","<span class=ok>+</span>"],["Social et monde vivant","Peu","Réseau et salon simulés (le vrai multijoueur reste à faire)","≈"],["Démarrage et accessibilité","Courbe d'apprentissage raide","Début lent et peu guidé (voir constats)","<span class=ko>−</span>"],["Fidélisation long terme","Rejouabilité par la variété des mondes","Pas de saisons, d'alliances, d'événements pendant l'absence","<span class=ko>−</span>"]],["Axe","Capitalism II / Lab","Wall Street Empire","Verdict"])}
<div class="card"><h3>Le verdict de Marc (hardcore, ex-Capitalism II)</h3><p>« Sur le fond, c'est plus profond et plus réaliste : les cycles macro, le banquier et les levées de fonds n'ont pas d'équivalent chez Chan, et l'usine est enfin lisible. Mais je ne dirai pas "mieux" tant que je ne peux pas rejouer vingt fois sans ennui : il me faut des mondes différents, un classement saisonnier, des rivaux qui m'attaquent pour de vrai, et un moyen de dépenser mon argent après le premier milliard. »</p></div>
<p class="note">Sources : <a href="https://www.capitalismlab.com/buy-game/testimonials/">témoignages Capitalism Lab</a> (promotionnels), <a href="https://boards.straightdope.com/t/anyone-play-capitalism-ii/808594">forum Straight Dope</a>, <a href="https://www.gamespot.com/capitalism-ii/user-reviews/2200-526739/">GameSpot, avis de joueurs</a>, <a href="https://www.gamestar.de/artikel/radikalste-wirtschaftssimulation-begeistert-angewidert,3398694.html">GameStar</a>, <a href="https://www.mmoreviews.com/?p=55413">MMO Reviews, Supremacy 1914</a>. Aucune de ces sources ne traite des adolescents ni de la rétention chiffrée.</p>
<div class="ft"><span>Wall Street Empire · étude de jeu</span><span>5</span></div></div>''')
chat = [('Noé','chuis dernier lol, qui a un conseil ?'),('Hugo','Pose des fermes et une usine derrière, moi je suis 2e depuis cinq minutes.'),('Léa','Hugo, tu peux m\'expliquer ? Je comprends pas pourquoi mes magasins ne rapportent rien'),('Marc','Rendements décroissants, la ville sature. Regarde le carnet de commandes de ton usine, demande/offre.'),('Noé','ok je fais des fermes... ah ouais ca monte'),('Léa','Le Réseau est trop drôle, un PDG vient de me liker. Mais j\'aimerais un objectif court toutes les trois minutes.'),('Marc','Mon vrai test : est-ce que ça tient à la dixième partie ? Les rivaux se ressemblent trop.'),('Hugo','Il me manque le tracteur à conduire et les saisons, sinon c\'est top.'),('Noé','y a un chat public c\'est cool, ajoutez des succès svp'),('Léa','Moi je reviens demain si j\'ai une récompense de connexion.')]
cl = ''.join(f'<p><b style="color:{PN[{"Noé":"ado","Léa":"joueuse","Marc":"hardcore","Hugo":"fermier"}[a]][2]}">{a}</b> : {html.escape(t)}</p>' for a, t in chat)
pages.append(f'''<div class="pg"><div class="hd"><span>Wall Street Empire · étude de jeu</span><span>5 · Chat et améliorations</span></div><h2><i>05</i>Ambiance : le salon à quatre</h2>
<div class="warn"><b>Conversation fictive</b> écrite pour illustrer l'ambiance ; elle n'a pas été produite par de vrais joueurs. Le salon du jeu est simulé tant que le multijoueur n'est pas ouvert.</div><div class="card chat">{cl}</div>
<h2 style="margin-top:6mm"><i>06</i>Améliorations, par ordre d'impact</h2>
<table><tr><th>#</th><th>Amélioration</th><th>Pourquoi (mesure)</th></tr>
<tr><td>1</td><td><b>Refaire les 5 premières minutes</b> : première mission « ferme + usine » récompensée, rang 3 avant 6 minutes, une victoire visible toutes les 3 minutes.</td><td>3 profils sur 4 derniers à 4 min ; le conseil actuel mène au rang 6.</td></tr>
<tr><td>2</td><td><b>Rééquilibrer commerce / agriculture / industrie</b> : rendre rentable le commerce seul sans nerfer les fermes ; rendements décroissants visibles.</td><td>Fermier ×{st.median(fin(r)/V0 for r in by["fermier"]):.1f} contre ×3 à ×4.</td></tr>
<tr><td>3</td><td><b>Monde persistant</b> : revenus, événements et attaques pendant l'absence, notifications, boucle quotidienne et succès.</td><td>Les quatre profils demandent un motif de retour (Léa, Noé) ou de la variété (Marc).</td></tr>
<tr><td>4</td><td><b>Après le premier milliard</b> : projets longs, paliers 10 / 100 / 1 000 Md$, Conseil de sécurité économique.</td><td>Simulation 4 h : 38 Md$ de trésorerie sans emploi.</td></tr>
<tr><td>5</td><td><b>Univers Farm Simulator</b> : saisons visibles sur les champs, météo qui compte, machines à améliorer, tracteur animé, rotation des cultures ; maïs et colza déjà dessinés, à brancher.</td><td>Hugo est le seul accroché ; marché de joueurs de simulation agricole.</td></tr>
<tr><td>6</td><td><b>Leviers d'optimisation pour le hardcore</b> : prix par produit, marketing, marque, carnet de commandes (lot 2).</td><td>L'optimiseur finit derrière le joueur occasionnel.</td></tr>
<tr><td>7</td><td><b>Faire vivre les castes</b> : un écran et une première mission propres à chacune (banque, trading, brevets, chantier).</td><td>Aucune caste hors agriculture ne démarre vite.</td></tr>
<tr><td>8</td><td><b>Vrai multijoueur asynchrone</b> (Conseil, alliances, blocs) selon le pitch.</td><td>Condition de la durée de vie très longue.</td></tr></table>
<div class="ft"><span>Wall Street Empire · étude de jeu</span><span>6</span></div></div>''')
doc = f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Wall Street Empire · étude de jeu</title><style>{css}</style></head><body>{"".join(pages)}</body></html>'
os.makedirs(OUT, exist_ok=True); h = os.path.join(OUT, 'rapport_personas.html'); open(h, 'w').write(doc); print('ok', h)
