#!/usr/bin/env python3
"""Passe 76 : génère docs/WSE_Plan_Monetisation_Gamification.pdf (A4) à partir du résumé des personas ICP.

Usage : python3 wall-street-empire/tools/analyze_icp.py <icp.jsonl> <resume.json>
        python3 wall-street-empire/tools/make_report_monetisation.py <resume.json> [dossier_html]
Le HTML intermédiaire va dans dossier_html (par défaut : le dossier du résumé) ; le PDF est rendu par Playwright (page.pdf, NODE_PATH=$(npm root -g)).
"""
import json, sys, os, subprocess, html

SUM = json.load(open(sys.argv[1]))
TMP = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(sys.argv[1]))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = os.path.join(ROOT, 'docs', 'WSE_Plan_Monetisation_Gamification.pdf')
P = SUM['personas']; AB = SUM['ab']
SHORT = {'presse0': 'Presse-boutons sans achat (témoin)', 'optimcoo': 'Optimiseur + COO prix et fournisseurs (témoin)', 'optimauto': 'Optimiseur + fournisseurs auto seuls (témoin)'}
for _k, _o in P.items(): _o['name'] = SHORT.get(_k, _o['name'])
SUM['days'] = '1 800'
COL = {'presse': '#c2410c', 'presse0': '#f59e0b', 'optimiseur': '#1d4ed8', 'optimcoo': '#60a5fa', 'etudiant': '#047857', 'streamer': '#9333ea', 'mobile': '#db2777', 'enseignant': '#475569', 'optimauto': '#0891b2'}

def f(x, d=0, suf=''):
    return '—' if x is None else (('%.' + str(d) + 'f') % x).replace('.', ',') + suf

def mn(days):   # jours de jeu -> minutes réelles (Round, vitesse normale : 0,75 s par jour)
    return None if days is None else days * 0.75 / 60

def tab(head, rows, cls=''):
    return f'<table class="{cls}"><tr>' + ''.join(f'<th>{h}</th>' for h in head) + '</tr>' + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows) + '</table>'

def chart(w=640, h=210):
    ks = [k for k in P if P[k].get('curve')]
    ds = [d for d, _ in P[ks[0]]['curve']]; ymax = max(v for k in ks for _, v in P[k]['curve'] if v) * 1.08
    ox, oy, W, H = 40, 10, w - 165, h - 34
    X = lambda d: ox + W * (d - ds[0]) / max(1, ds[-1] - ds[0]); Y = lambda v: oy + H - H * v / ymax
    s = f'<svg viewBox="0 0 {w} {h}" width="100%" font-family="Helvetica, Arial, sans-serif">'
    for i in range(5):
        v = ymax * i / 4; s += f'<line x1="{ox}" x2="{ox + W}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="#e5e7eb"/><text x="{ox - 5}" y="{Y(v) + 3:.1f}" font-size="8" text-anchor="end" fill="#6b7280">×{v:.0f}</text>'
    for d in ds[::3]: s += f'<text x="{X(d):.1f}" y="{h - 14}" font-size="8" text-anchor="middle" fill="#6b7280">j{d}</text>'
    s += f'<text x="{ox}" y="{h - 2}" font-size="8" fill="#6b7280">jours de jeu (1 800 j ≈ 22 min réelles en Round à vitesse normale) · valeur ÷ 10 M$ de départ, médiane de 3 graines</text>'
    ly = oy + 4
    for k in ks:
        dash = 'stroke-dasharray="4 3"' if k in ('presse0', 'optimcoo', 'optimauto') else ''
        pts = ' '.join(f'{X(d):.1f},{Y(v):.1f}' for d, v in P[k]['curve'] if v is not None)
        s += f'<polyline points="{pts}" fill="none" stroke="{COL.get(k, "#333")}" stroke-width="{2.2 if k in ("presse", "optimiseur") else 1.4}" {dash}/>'
        s += f'<line x1="{ox + W + 10}" x2="{ox + W + 24}" y1="{ly}" y2="{ly}" stroke="{COL.get(k)}" stroke-width="2" {dash}/><text x="{ox + W + 28}" y="{ly + 3}" font-size="8" fill="#111">{html.escape({'presse0': 'Presse-b. sans achat', 'optimcoo': 'Optim. + COO', 'optimauto': 'Optim. + fourn. auto', 'presse': 'Presse-boutons', 'optimiseur': 'Optimiseur'}.get(k, P[k]['name']))}</text>'
        ly += 13
    return s + '</svg>'

_TX = [os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), 'textes.json'), os.path.join(os.path.dirname(os.path.abspath(__file__)), 'make_report_monetisation_textes.json')]   # commentaires des résultats (à réécrire si les mesures changent)
TXT = next((json.load(open(x)) for x in _TX if os.path.exists(x)), {})
def T(k, d=''): return TXT.get(k, d)

css = """@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:9.4pt/1.45 'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1f2937}
.pg{width:210mm;height:297mm;padding:14mm 15mm 14mm;page-break-after:always;position:relative;overflow:hidden}
h1{font-size:23pt;line-height:1.15;margin:0 0 3mm;color:#0f172a}h2{font-size:14pt;margin:0 0 2.5mm;color:#0f172a;border-bottom:2px solid #0f172a;padding-bottom:1mm}h3{font-size:10.5pt;margin:3.5mm 0 1.2mm;color:#0f172a}
.hd{display:flex;justify-content:space-between;font-size:7.5pt;color:#6b7280;margin-bottom:4mm;text-transform:uppercase;letter-spacing:.06em}
.ft{position:absolute;left:15mm;right:15mm;bottom:7mm;font-size:7.5pt;color:#9ca3af;display:flex;justify-content:space-between}
table{width:100%;border-collapse:collapse;font-size:8pt;margin:1.5mm 0 2mm}th{background:#0f172a;color:#fff;text-align:left;padding:1.3mm 1.8mm;font-weight:600;vertical-align:bottom}td{padding:1.2mm 1.8mm;border-bottom:1px solid #e5e7eb;vertical-align:top}tr:nth-child(even) td{background:#f9fafb}
.box{border:1px solid #d1d5db;border-radius:4px;padding:2.5mm 3.5mm;margin:2mm 0;background:#f9fafb}.warn{border-color:#f59e0b;background:#fffbeb}.ok{border-color:#10b981;background:#ecfdf5}
.tagm{display:inline-block;font-size:7pt;font-weight:700;padding:.2mm 1.5mm;border-radius:2px;background:#dbeafe;color:#1e3a8a}.tags{display:inline-block;font-size:7pt;font-weight:700;padding:.2mm 1.5mm;border-radius:2px;background:#fde68a;color:#78350f}
ul,ol{margin:1mm 0 1.5mm 4.5mm;padding:0}li{margin:.6mm 0}.note{font-size:7.6pt;color:#6b7280}.cols{display:flex;gap:5mm}.cols>div{flex:1}.sm{font-size:7.4pt}.sm td{padding:.8mm 1.5mm}.sm th{padding:1mm 1.5mm}.kpi{display:flex;gap:3mm;margin:2mm 0}.kpi div{flex:1;border:1px solid #d1d5db;border-radius:4px;padding:2mm 3mm}.kpi b{display:block;font-size:14pt;color:#0f172a}.kpi small{color:#6b7280;font-size:7.5pt}"""

_PG = [0]
def page(n, title, body):
    _PG[0] += 1; n = _PG[0]
    return f'<div class="pg"><div class="hd"><span>Wall Street Empire · plan de monétisation et de gamification</span><span>{title}</span></div>{body}<div class="ft"><span>20 novembre 2026 · aucun paiement réel n\'est branché · mesures = joueurs simulés</span><span>{n}</span></div></div>'

pp = P.get('presse', {}); po = P.get('optimiseur', {}); ab1 = AB.get('presse_vs_presse0', {}); ab2 = AB.get('optimcoo_vs_optimiseur', {})
pages = []
pages.append(page(1, 'Synthèse', f'''<h1>Monétisation et gamification<br><span style="font-weight:400;font-size:15pt;color:#475569">Hypothèses, mesures par simulation et plan de test</span></h1>
<div class="box warn"><b>À lire d'abord.</b> Aucune donnée de vrais joueurs n'existe. Les chiffres viennent de <b>{SUM['n']} parties jouées par des bots</b> (8 personas, 3 graines, {SUM['days']} jours, caste industrielle) ; ils mesurent l'économie et les creux du jeu, pas l'envie de payer d'un humain. Chaque affirmation est marquée <span class="tagm">MESURÉ</span> ou <span class="tags">SUPPOSÉ</span>.</div>
<h3>Synthèse exécutive</h3><ul>
<li><b>Deux segments.</b> A, le <i>Presse-boutons</i> (profil Damien, type Supremacy) paie le temps, la délégation et le statut ; B, l'<i>Optimiseur</i> (profil Rémy) paie le jeu et ses extensions, reste et recommande. <span class="tags">SUPPOSÉ</span></li>
<li><b>Décisions de Rémy → règles.</b> Le COO (optimisation <b>automatique</b> de la chaîne) est payant ; le <b>manuel</b> reste gratuit et doit rester au moins aussi bon. L'accélération des chantiers 1→5 est payante en monnaie simulée, jamais obligatoire. Aucun pay-to-win dans le classement du Round.</li>
{T('synth_li')}
<li><b>Télémétrie locale anonyme livrée</b> : opt-in, rien n'est envoyé, journal ≤ 200 ko exportable en JSON (Menu &gt; Partie), sans effet sur la partie (testé). C'est l'outil de la bêta fermée.</li>
<li><b>Prochaine étape</b> : entretien avec Damien Gromier (5 questions, dernière page), puis bêta fermée de 20 à 40 joueurs (moitié A, moitié B).</li></ul>
<div class="kpi"><div><b>{f(pp.get('val'))} M$</b><small>Presse-boutons, valeur à j{SUM['days']} (médiane)</small></div><div><b>{f(po.get('val'))} M$</b><small>Optimiseur manuel, valeur à j{SUM['days']}</small></div><div><b>{f(po.get('manual'))}</b><small>décisions de fournisseur prises à la main par l'Optimiseur (0 avec le COO)</small></div><div><b>{f(pp.get('msGap'))} j</b><small>plus long creux sans jalon (Presse-boutons) ≈ {f(mn(pp.get('msGap')), 0)} min réelles</small></div></div>
'''))
pages.append(page(0, 'Méthode', f'''<h2>Mesuré ou supposé</h2>{tab(['Affirmation', 'Statut'], [
 ['Temps pour chaque jalon, creux de progression, ruptures, attente de trésorerie, usage manuel / automatique', '<span class="tagm">MESURÉ</span> bots'],
 ['Valeur de la délégation (COO) : A/B sur les mêmes graines', '<span class="tagm">MESURÉ</span> bots'],
 ['Occasions où accélérer aurait fait gagner &gt; 10 % du temps jusqu\'au jalon suivant', '<span class="tagm">MESURÉ</span> pour la R&amp;D · <span class="tags">SUPPOSÉ</span> pour les chantiers (durées hypothétiques : niv. 2 = 5 j, 3 = 10 j, 4 = 20 j, 5 = 40 j ; aujourd\'hui instantané)'],
 ['A paie le temps et le statut, B le contenu', '<span class="tags">SUPPOSÉ</span> à valider en entretiens'],
 ['Rétention J1/J7/J30, session, conversion, ARPPU', 'NON MESURÉ : aucun joueur réel'],
])}<h3>Règles de conception (décisions de Rémy)</h3><ol><li>Manuel gratuit et complet (fournisseurs, prix, ruptures).</li><li>COO payant = automatisation, pas avantage ; test « COO ≤ manuel » sur 3 graines.</li><li>Accélération jamais obligatoire ; aucun creux sans action possible &gt; 3 min réelles.</li><li>Round classé : ni accélération ni COO payant ; seul le cosmétique se vend.</li><li>Prix affiché avant confirmation ; pas de boîte à butin.</li></ol><h3>Comportements simulés</h3>{tab(['Persona', 'Règles du bot'], [
 ['Presse-boutons (Damien)', 'agit tous les 2 jours, levier 55 %, délègue (fournisseurs auto, prix au COO, Sources automatiques), accélère la R&amp;D en Diamants, améliore un bâtiment tous les 20 j ; ennui après 30 j sans victoire visible'],
 ['Presse-boutons sans achat (témoin)', 'le même, sans délégation ni accélération'],
 ['Optimiseur (Rémy)', 'tous les 3 jours, levier 45 %, revoit À LA MAIN les fournisseurs de chaque usine et magasin tous les 2 jours (rupture traitée dès le 1er jour), politique automatique coupée'],
 ['Optimiseur + COO prix et fournisseurs (témoin)', 'même tempo, fournisseurs automatiques et prix confiés au COO (politique Normale)'],
 ['Optimiseur + fournisseurs auto seuls (témoin)', 'même tempo, fournisseurs automatiques, prix laissés au réglage par défaut'],
 ['Étudiant en gestion', 'tous les 6 jours, levier 30 %, revue manuelle tous les 15 jours, prudent'],
 ['Streamer compétitif', 'tous les 2 jours, levier 65 %, tout en automatique, accélère, ennui après 20 j'],
 ['Casual mobile', 'tous les 12 jours, une action sur deux perdue, délègue, accélère'],
 ['Enseignant de gestion', 'tous les 8 jours, levier 25 %, revue manuelle tous les 10 jours'],
])}'''))

seg = tab(['Segment / ICP', 'Objectif', 'Retient', 'Fait partir', 'Achèterait (supposé)'], [
 ['<b>A. Presse-boutons</b> (Damien)', 'grossir vite, dominer, être vu', 'compétition, statut, alliances, rythme', 'être bloqué, battu par un payeur', 'temps, COO, 2ᵉ chantier, cosmétique, passe de saison'],
 ['<b>B. Optimiseur</b> (Rémy)', 'comprendre et régler la machine', 'profondeur, chiffres lisibles, défis', 'l\'argent bat la compétence', 'le jeu, les extensions ; le COO pour les tâches répétitives'],
 ['Étudiant en gestion', 'apprendre en jouant', 'réalisme, explications', 'jargon sans aide', 'licence éducation'],
 ['Streamer compétitif', 'spectacle, classement', 'retournements, saisons', 'lenteur, pas de classement public', 'cosmétique, passe ; refuse le pay-to-win'],
 ['Casual mobile', 'se détendre 5 minutes', 'progrès pendant l\'absence, objectifs courts', 'début lent, écrans denses', 'accélérations ponctuelles, pack de démarrage'],
 ['Enseignant de gestion', 'démontrer prix, offre, chaîne', 'scénarios rejouables, exports', 'coût par élève, achats intégrés', 'licence classe'],
])
lev = tab(['Levier', 'Pour qui', 'Ce qui se vend', 'Garde-fou', 'Dans le jeu aujourd\'hui'], [
 ['<b>Temps</b>', 'A, mobile', 'Diamants : −1/−5/−10 j', 'plafonds, Diamants gagnés en jouant, désactivé en Round classé', 'R&amp;D accélérable ; chantiers instantanés'],
 ['<b>COO / délégation</b>', 'A, mobile, B fatigué', 'COO : fournisseurs, prix, ruptures en continu', 'jamais meilleur que le manuel', 'existe, gratuit (politique fournisseurs, prix COO, Sources automatiques)'],
 ['<b>Parallélisme</b>', 'A', '2ᵉ file de chantier / recherche', 'une file gratuite toujours là', 'absent'],
 ['<b>Statut / cosmétique</b>', 'A, streamer', 'enseignes, couleurs, trophées', 'aucun effet économique', 'palmarès, classements'],
 ['<b>Saisons</b>', 'A, streamer', 'passe de saison, prestige', 'classement au mérite seul', 'Round 90 min ; pas de saisons'],
 ['<b>Alliances</b>', 'A', 'rien en direct : moteur social', '—', 'absent'],
 ['<b>Contenu / extensions</b>', 'B', 'villes, chaînes, castes, scénarios', '—', 'contenu riche, non découpé'],
 ['<b>Éducation / B2B</b>', 'étudiant, enseignant', 'licence établissement', 'sans achats intégrés', 'Apprentissage, Guide du fabricant'],
])
pages.append(page(2, 'Hypothèses', f'''<h2>1. Hypothèses : segments, boucles, leviers <span class="tags">SUPPOSÉ</span></h2>{seg}
<div class="cols"><div><h3>Boucles</h3><ul><li><b>Courte (minutes)</b> : construire, améliorer (niveau 1→5), lever un blocage. Lieu des accélérations.</li><li><b>Moyenne (heure)</b> : chaîne R&amp;D → usine → magasin, palier, Round de 90 min.</li><li><b>Longue (semaines)</b> : saisons, prestige, alliances, extensions. Absente aujourd'hui.</li></ul></div>
<div><h3>Délégation contre maîtrise</h3><p><b>Déléguer s'achète, maîtriser se gagne.</b> Le COO fait le travail d'un joueur attentif, sans fatigue ; il ne doit jamais faire mieux qu'un bon joueur manuel. Règle mesurable : sur les mêmes graines, l'Optimiseur manuel atteint ses jalons au moins aussi vite que le même joueur avec COO.</p></div></div>
<h3>Leviers</h3>{lev}
'''))

MSK = [('usine', '1re usine'), ('x2', '×2'), ('x3', '×3'), ('x5', '×5'), ('x10', '×10'), ('T1', 'Entrepreneur'), ('T2', 'Industriel')]
rows = []
for k, o in P.items():
    m = o['ms']; rows.append([f'<b style="color:{COL.get(k)}">{html.escape(o["name"])}</b>', f'{f(o["val"])} M$', f'×{f(o["mult"], 1)}'] + [('j' + f(m[x]) + (f' <span class="note">({o["ms_n"][x]}/{o["n"]})</span>' if o['ms_n'][x] < o['n'] else '')) if m[x] is not None else '—' for x, _ in MSK])
pages.append(page(3, 'Simulation : jalons', f'''<h2>2. Personas simulés : temps pour chaque jalon <span class="tagm">MESURÉ</span></h2>
<p class="note">{SUM['n']} parties, graines {", ".join(str(s) for s in SUM['seeds'])}, {SUM['days']} jours, Round Normal, caste industrielle (chaînes d'usines : là où la supply chain compte), télémétrie locale active pour la mesure. Médiane de 3 graines ; « (2/3) » = jalon atteint dans 2 parties sur 3. 1 jour de jeu ≈ 0,75 s réelle en Round à vitesse normale.</p>
{tab(['Persona', 'Valeur j' + str(SUM['days']), '×départ'] + [n for _, n in MSK], rows)}
{chart()}
{T('jalons_note')}'''))

rows2 = []; rows3 = []
for k, o in P.items():
    q = [x for x in o['quit'] if x is not None]
    rows2.append([f'<b style="color:{COL.get(k)}">{html.escape(o["name"])}</b>', f(o['waitCash']), f(o['gapMax']), f'{f(o["msGap"])} <span class="note">≈ {f(mn(o["msGap"]))} min</span>', f'{len(q)}/{o["n"]}', f(o['rupN']), f(o['rupD'])])
    rows3.append([f'<b style="color:{COL.get(k)}">{html.escape(o["name"])}</b>', f(o['auto']), f(o['manual']), f(None if o['autoShare'] is None else 100 * o['autoShare'], 0, ' %'), f(o['up']), f'{f(o["acc"])} ({f(o["accDays"])} j)', f(o['accWant']), f'{o["wtp_rd10"]}/{o["rd_tot"]}', f'{o["wtp_ch10"]} · {o["wtp_ch25"]} / {o["ch_tot"]}'])
abrows = [[a['lab'], f'{a["faster10"]}/{a["tot"]} ({a["faster25"]} à &gt; 25 %)', f'{a["slower10"]}/{a["tot"]}', f(100 * a['dval'], 1, ' %') if a.get('dval') is not None else '—'] for a in AB.values()]
pages.append(page(4, 'Blocages et envie de payer', f'''<h2>3. Points de blocage <span class="tagm">MESURÉ</span></h2>
{tab(['Persona', 'Jours d\'épargne bloquante', 'Plus long creux sans action (j)', 'Plus long creux sans jalon (j)', 'Abandon simulé', 'Ruptures (débuts)', 'Jours × bâtiments en rupture'], rows2, 'sm')}
<p class="note">Épargne bloquante : jours où le bot met de côté pour une chaîne et ne construit plus rien d'autre (attente de trésorerie). Creux sans action : jours consécutifs sans nouveau bâtiment ni chantier. Creux sans jalon : plus long intervalle entre deux jalons (×valeur, palier). Abandon simulé : ennui cumulé au-delà du seuil du persona.</p>
<h2>4. Manuel ou automatique, et proxy d'« envie de payer » <span class="tagm">MESURÉ</span></h2>
{tab(['Persona', 'Décisions auto', 'Décisions manuelles', 'Part auto', 'Chantiers', 'Accélérations (j gagnés)', 'Envie d\'accélérer sans Diamants', 'R&amp;D : gain &gt; 10 %', 'Chantiers : &gt; 10 % · &gt; 25 % (hyp.)'], rows3, 'sm')}
<p class="note">Décisions auto = changements de fournisseur faits par le jeu (politique automatique) + passages en « Sources automatiques ». Proxy R&amp;D : recherches où l'accélération maximale autorisée (½ de la durée) aurait réduit de plus de 10 % le temps jusqu'au jalon suivant. Proxy chantiers : même calcul sur chaque amélioration de niveau, avec les durées <b>supposées</b> 5/10/20/40 jours.</p>
'''))
pages.append(page(0, 'A/B délégation', f'''<h2>5. Délégation : A/B sur les mêmes graines <span class="tagm">MESURÉ</span></h2><p class="note">Même graine, même caste, même tempo ; seule change la délégation. « Plus tôt » : jalon (×valeur, palier) atteint plus de 10 % plus tôt que le témoin.</p>{tab(['Comparaison', 'Jalons atteints &gt; 10 % plus tôt', '&gt; 10 % plus tard', 'Écart de valeur finale (médiane)'], abrows)}
{T('blocages_note')}{T('ab_note')}'''))

pages.append(page(5, 'Télémétrie et métriques', f'''<h2>6. Télémétrie locale anonyme (livrée)</h2><div class="box ok"><b>Opt-in, désactivée par défaut, rien n'est envoyé.</b> Menu &gt; Partie &gt; « Télémétrie locale (anonyme) » : Oui / Non, « Exporter le journal (JSON) », « Effacer le journal ». Stockage <code>localStorage['wse-telemetry']</code> borné à 200 ko (les plus anciens événements sont retirés, les « premières fois » restent). API <code>WSE.tel</code>. Test t76 : opt-in, taille bornée, export, aucune requête réseau, <b>partie identique avec et sans télémétrie</b> (360 jours avec bot).</div>
{tab(['Événement', 'Sens'], [
 ['game, first_buy, first_factory', 'partie observée ; premier bâtiment ; première usine'],
 ['tier, mult, bn', 'palier de fortune ; valeur ×1,5 / ×2 / ×3 / ×5 / ×10 / ×30 / ×100 ; 1 Md$'],
 ['chantier, accel', 'amélioration de niveau 1→5 ou étage ; accélération payée (Diamants, trésorerie, crédits labo)'],
 ['policy, sc_autosource, sc_switch', 'usage automatique : politique fournisseurs / prix au COO ; Sources automatiques ; changement fait par le jeu'],
 ['sc_manual, sc_auto, px_manual', 'usage manuel : fournisseur choisi à la main, rendu à l\'automatique ; prix réglé à la main'],
 ['rupture, rup_days, refus', 'rupture subie (une par bâtiment et matière / 30 j) ; jours×bâtiments en rupture ; action refusée (argent, palier)'],
 ['iap, optin', 'boutique de démonstration ouverte (intention d\'achat) ; activation'],
])}<p class="note">Format : <code>[secondes depuis la session, jour de jeu, type, données]</code>, compteurs, premières occurrences, sessions (date du jour, durée, jours joués). Pas de nom, pas d'adresse, pas d'heure précise.</p>
<h2>7. Métriques à suivre <span class="tags">NON MESURÉ</span></h2>{tab(['Métrique', 'Définition', 'Source en bêta', 'Cible (hypothèse)'], [
 ['Rétention J1 / J7 / J30', 'part des joueurs revenus 1, 7, 30 j après la 1re session', 'sessions du journal exporté', 'J1 ≥ 35 %, J7 &gt; 15 % (dossier investisseurs), J30 ≥ 8 %'],
 ['Durée de session', 'médiane et 90ᵉ centile', 'sess[].s', 'A : 8-15 min ; B : 30-60 min'],
 ['Abandon par étape', 'non-atteinte : 1er achat, 1re usine, Entrepreneur, ×2, ×5', 'first', '&lt; 20 % avant la 1re usine'],
 ['Taux de délégation', 'décisions jeu/COO ÷ toutes les décisions d\'achat', 'sc_switch + sc_autosource vs sc_manual', 'A &gt; 70 %, B &lt; 40 %'],
 ['Conversion', 'au moins un achat (aujourd\'hui : clic boutique de démonstration)', 'iap', '2-5 % (référence du genre, non vérifiée)'],
 ['ARPPU', 'revenu mensuel par payeur', 'soft launch', 'non fixé'],
 ['Ruptures', 'débuts et jours×bâtiments par heure de jeu', 'rupture, rup_days', 'en baisse avec l\'expérience'],
])}'''))

pages.append(page(6, 'Plan de test', f'''<h2>8. Plan de test en phases</h2>{tab(['Phase', 'Qui', 'Durée', 'Mesures', 'Critère de passage'], [
 ['<b>0. Bots</b> (en cours)', '8 personas, 3 graines, 1 800 j', 'continu', 'jalons, creux, ruptures, manuel/auto, envie de payer, A/B COO', 'COO ≤ manuel ; aucun creux sans action &gt; 3 min ; accélération jamais bloquante'],
 ['<b>1. Entretiens</b>', 'Damien Gromier, 3-5 joueurs A, 3-5 joueurs B', '2 semaines', 'motivations, seuils de prix, ce qui choque', 'temps et COO jugés acceptables par A et B'],
 ['<b>2. Bêta fermée</b>', '20-40 joueurs (½ A, ½ B), télémétrie opt-in, export volontaire', '4 semaines', 'J1/J7, sessions, abandon par étape, délégation, ruptures, clics boutique', 'J7 &gt; 15 % ; &lt; 20 % d\'abandon avant la 1re usine ; pas de plainte pay-to-win de B'],
 ['<b>3. Prix fictifs</b>', 'mêmes joueurs, offres en Diamants simulés à plusieurs prix', '2 semaines', 'élasticité de l\'intention, choix du COO', 'COO choisi par &gt; 20 % des joueurs A'],
 ['<b>4. Soft launch</b>', '1-2 pays, paiement réel, analytique avec consentement', '6-8 semaines', 'conversion, ARPPU, J30, avis', 'conversion ≥ 2 %, J30 ≥ 8 %, avis ≥ 4/5'],
])}
<h2>9. Risques</h2>{tab(['Risque', 'Effet', 'Parade'], [
 ['<b>Pay-to-win</b>', 'B part et dénigre (reproche n° 1 fait à Supremacy)', 'règles de conception ; Round classé sans achat d\'avantage ; test COO ≤ manuel'],
 ['<b>Perte des optimiseurs</b>', 'manuel rendu pénible pour vendre le COO', 'le manuel garde toute son ergonomie et s\'améliore en même temps'],
 ['<b>Dark patterns</b>', 'défiance, avis négatifs, risque juridique', 'prix affiché avant confirmation, pas d\'urgence commerciale, pas de boîte à butin'],
 ['<b>Réglementation</b>', 'protection des consommateurs et des mineurs (UE), magasins d\'applications, données personnelles', 'revue par un juriste avant soft launch : prix des monnaies virtuelles lisible en euros, pas de boîte à butin, mention « achats intégrés », consentement avant toute analytique (RGPD) ; la télémétrie actuelle est locale et opt-in'],
 ['<b>Biais des bots</b>', 'décider sur des comportements simulés', 'bots = économie et creux ; décisions de prix seulement après la bêta'],
])}
<h3>Limites de cette étude</h3><ul><li>Une caste (industriel), 3 graines par persona ; les personas sont des règles (tempo, levier, revue, délégation), pas des humains.</li><li>Les chantiers 1→5 sont instantanés aujourd'hui : l'envie d'accélérer un chantier est calculée sur des durées supposées.</li><li>Le COO actuel est gratuit : l'A/B mesure la valeur de la délégation, pas l'envie de la payer.</li></ul>'''))

pages.append(page(7, 'Questions pour Damien', '''<h2>10. Les cinq questions à poser à Damien Gromier</h2><p class="note">Ex-joueur dépensier de Supremacy. Entretien de 30 minutes, enregistré avec son accord, questions ouvertes ; relancer par « raconte-moi la dernière fois que… ».</p><ol>
<li><b>Le déclic</b> : quel a été le moment exact où tu as payé pour la première fois dans Supremacy, et qu'as-tu acheté (temps, ressources, statut, avantage militaire) ?</li>
<li><b>Le pay-to-win</b> : as-tu eu l'impression d'avoir gagné grâce à l'argent plutôt qu'au talent, ou d'avoir perdu contre un payeur ? Qu'est-ce que ça t'a fait, et es-tu resté ?</li>
<li><b>Le temps</b> : qu'est-ce qui était le plus pénible à attendre, et combien (en euros) aurais-tu payé pour ne plus l'attendre ? À partir de quel montant par mois t'es-tu dit « c'est trop » ?</li>
<li><b>Les autres</b> : quel rôle ont joué l'alliance, le chat et le classement dans ta dépense ? Aurais-tu payé autant en jouant seul ?</li>
<li><b>La délégation</b> : si un « directeur des opérations » gérait à ta place approvisionnements et prix, l'achèterais-tu (une fois, abonnement) ? Que doit-il ne <b>jamais</b> faire pour que tu te sentes encore maître de ton empire ?</li></ol>
<h2>11. Questionnaire court (bêta, 2 minutes)</h2><ol>
<li>Combien de minutes as-tu joué aujourd'hui ? (moins de 10 / 10-30 / 30-60 / plus de 60)</li>
<li>Qu'est-ce qui t'a donné envie de continuer ? (libre)</li>
<li>À quel moment t'es-tu ennuyé ou senti bloqué ? (moment, cause)</li>
<li>Tu préfères régler toi-même fournisseurs et prix, ou les confier au COO ? (moi / COO / ça dépend)</li>
<li>As-tu eu envie d'accélérer quelque chose ? Quoi ? (non / recherche / chantier / autre)</li>
<li>Un achat dans le jeu te semblerait-il injuste face aux autres joueurs ? Lequel ? (libre)</li>
<li>Combien paierais-tu, une fois, pour le jeu complet ? (0 / 5 € / 10 € / 20 € / plus)</li>
<li>Et par mois, pour un COO et un passe de saison ? (0 / 3 € / 5 € / 10 € / plus)</li>
<li>Reviendras-tu demain ? (oui / peut-être / non) Pourquoi ?</li>
<li>Recommanderais-tu le jeu à un ami ? (0 à 10)</li></ol>
<div class="box"><b>Joindre à la bêta</b> : la consigne pour activer la télémétrie (Menu &gt; Partie &gt; Oui), puis exporter le journal JSON en fin de semaine et le joindre au questionnaire. Rien n'est envoyé automatiquement.</div>'''))

doc = f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>WSE · plan de monétisation et de gamification</title><style>{css}</style></head><body>{"".join(pages)}</body></html>'
os.makedirs(TMP, exist_ok=True); H = os.path.join(TMP, 'plan_monetisation.html'); open(H, 'w').write(doc)
js = f"""const {{ chromium }} = require('playwright'); (async () => {{ const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://{H}'); await p.pdf({{ path: {json.dumps(PDF)}, format: 'A4', printBackground: true, preferCSSPageSize: true }}); await b.close(); }})();"""
npm = subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip()
subprocess.run(['node', '-e', js], check=True, env=dict(os.environ, NODE_PATH=npm))
print('ok', PDF, H)
