#!/usr/bin/env python3
"""Passe 76 : analyse des parties simulées des personas ICP (tools/sim_batch.js --icp) pour docs/MONETISATION_GAMIFICATION.md.

Usage : python3 wall-street-empire/tools/analyze_icp.py <icp.jsonl> [sortie.json]
Imprime les tableaux (Markdown) et écrit un résumé JSON (lu par tools/make_report_monetisation.py).
Proxy d'« envie de payer » : nombre d'occasions où une accélération ou la délégation aurait fait gagner plus de X % du temps
jusqu'au jalon suivant (X = 10 % et 25 %). Les durées de chantier sont une HYPOTHÈSE (le jeu actuel améliore un bâtiment instantanément).
"""
import json, sys, statistics as st, collections

SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else None
R = [json.loads(l) for src in SRC.split(',') for l in open(src) if l.strip()]
R = [r for r in R if r.get('series') and r.get('icp')]
NAMES = {'presse': 'Presse-boutons (Damien)', 'presse0': 'Presse-boutons, sans achat (témoin)', 'optimiseur': 'Optimiseur (Rémy)', 'optimcoo': 'Optimiseur, chaîne confiée au COO (témoin)', 'optimauto': 'Optimiseur, fournisseurs auto sans prix COO (témoin)',
         'etudiant': 'Étudiant en gestion', 'streamer': 'Streamer compétitif', 'mobile': 'Casual mobile', 'enseignant': 'Enseignant de gestion'}
ORDER = ['presse', 'presse0', 'optimiseur', 'optimcoo', 'optimauto', 'etudiant', 'streamer', 'mobile', 'enseignant']
CH_D = {2: 5, 3: 10, 4: 20, 5: 40}   # HYPOTHÈSE : durée d'un chantier vers le niveau n (jours de jeu), si l'on introduisait des chantiers à durée
MIN_PER_DAY = 0.75 / 60              # Round : 0,75 s réelle par jour de jeu à vitesse normale (cf. rapport personas) -> minutes
X1, X2 = 0.10, 0.25

def med(v):
    v = [x for x in v if x is not None]
    return st.median(v) if v else None

def milestones(r):
    """jours où chaque jalon est atteint : ×valeur (mult) et paliers (tier), d'après la télémétrie"""
    m = {}
    for e in r['icp']['ev']:
        if e[2] == 'mult': m.setdefault('x%g' % e[3]['x'], e[1])
        elif e[2] == 'tier': m.setdefault('T%d' % e[3]['n'], e[1])
        elif e[2] == 'bn': m.setdefault('1Md', e[1])
    m['usine'] = (r['icp']['first'].get('first_factory') or {}).get('j')
    return m

def ms_gap(r):
    """plus long creux de progression : jours entre deux jalons consécutifs (×valeur, palier, 1 Md$), du jour 1 à la fin"""
    ds = sorted({d for k, d in milestones(r).items() if d is not None and k != 'usine'} | {1, r['fin']['d']})
    return max(b - a for a, b in zip(ds, ds[1:])) if len(ds) > 1 else None

# passe 83 : jalons du rythme de progression (télémétrie « jalon ») ; A = jalons majeurs (×valeur, palier de fortune, 1 Md$, mission, jalon de fortune, palier de ville),
# B = A + défi de 30 jours réussi, duel du mois gagné, palier (niveau) de bâtiment terminé
KA = {'mission', 'val', 'ville'}
KB = KA | {'defi', 'duel', 'palier'}
def ms_days(r, kinds):
    ds = {d for k, d in milestones(r).items() if d is not None and k != 'usine'}
    for e in r['icp']['ev']:
        if e[2] == 'jalon' and isinstance(e[3], dict) and e[3].get('k') in kinds: ds.add(e[1])
    return sorted(ds)

def ms_gap_k(r, kinds):
    ds = sorted(set(ms_days(r, kinds)) | {1, r['fin']['d']})
    return max(b - a for a, b in zip(ds, ds[1:])) if len(ds) > 1 else None

def jal_count(r):
    c = collections.Counter()
    for e in r['icp']['ev']:
        if e[2] == 'jalon' and isinstance(e[3], dict): c[e[3].get('k')] += 1
    return c

def next_ms(r, day):
    ds = sorted(d for k, d in milestones(r).items() if d is not None and d > day and k != 'usine')
    return ds[0] if ds else None

def rd_proxy(r, x):
    n = 0; tot = 0
    for e in r['icp']['ps'].get('rdEp', []):
        dur = (e.get('b') or e['a']) - e['a']; save = 0.5 * max(dur, e.get('tot', 0))   # règle du jeu : au plus la moitié de la durée d'une recherche
        nx = next_ms(r, e['a']); tot += 1
        if nx and save / max(1, nx - e['a']) > x: n += 1
    return n, tot

def ch_proxy(r, x):
    n = 0; tot = 0
    for e in r['icp']['ev']:
        if e[2] != 'chantier' or not isinstance(e[3], dict) or e[3].get('via') != 'ui': continue
        D = CH_D.get(e[3].get('l'), 0); tot += 1
        nx = next_ms(r, e[1])
        if D and nx and D / max(1, nx - e[1]) > x: n += 1
    return n, tot

by = collections.defaultdict(list)
for r in R: by[r['persona']].append(r)
seeds = sorted({r['seed'] for r in R})
PEVERY = {'presse': 2, 'presse0': 2, 'optimiseur': 3, 'optimcoo': 3, 'optimauto': 3, 'etudiant': 6, 'streamer': 2, 'mobile': 12, 'enseignant': 8}   # jours de jeu entre deux décisions du bot (tools/sim_batch.js)
FXK = ['produit', 'port', 'export', 'niv2', 'niv3', 'hyper', 'usine_moy', 'siege', 'ipo', 'part10', 'filiale', 'campus', 'pp']
MS = ['usine', 'x1.5', 'x2', 'x3', 'x5', 'x10', 'T1', 'T2', 'T3']
MSN = {'usine': '1re usine', 'x1.5': '×1,5', 'x2': '×2', 'x3': '×3', 'x5': '×5', 'x10': '×10', 'T1': 'Entrepreneur', 'T2': 'Industriel', 'T3': 'Magnat'}
summary = {'seeds': seeds, 'n': len(R), 'days': max(r['fin']['d'] for r in R), 'personas': {}, 'ab': {}, 'hyp_chantier': CH_D}

for p in ORDER:
    v = by.get(p)
    if not v: continue
    ms = [milestones(r) for r in v]
    ps = [r['icp']['ps'] for r in v]; cn = [r['icp']['cnt'] for r in v]
    auto = [c.get('sc_switch', 0) + c.get('sc_autosource', 0) for c in cn]; man = [c.get('sc_manual', 0) for c in cn]
    rd1 = [rd_proxy(r, X1) for r in v]; rd2 = [rd_proxy(r, X2) for r in v]; c1 = [ch_proxy(r, X1) for r in v]; c2 = [ch_proxy(r, X2) for r in v]
    o = {
        'name': NAMES.get(p, p), 'n': len(v),
        'val': med([r['fin']['val'] / 1e6 for r in v]), 'mult': med([r['fin']['val'] / 10e6 for r in v]), 'rank': med([r['fin']['rk'] for r in v]),
        'ms': {k: med([m.get(k) for m in ms]) for k in MS}, 'ms_n': {k: sum(1 for m in ms if m.get(k) is not None) for k in MS},
        'waitCash': med([x.get('waitCash', 0) for x in ps]), 'gapMax': med([x.get('gapMax', 0) for x in ps]), 'msGap': med([ms_gap(r) for r in v]), 'ennui': med([x.get('ennui', 0) for x in ps]), 'ennuiD': med([x.get('ennuiD', 0) for x in ps]),
        'quit': [x.get('quitJ') for x in ps], 'rupD': med([c.get('rup_days', 0) for c in cn]), 'rupN': med([c.get('rupture', 0) for c in cn]), 'refus': med([c.get('refus_n', 0) for c in cn]),
        'auto': med(auto), 'manual': med(man), 'checks': med([x['man']['checks'] for x in ps]), 'autoShare': med([a / (a + m) if a + m else None for a, m in zip(auto, man)]),
        'acc': med([x['acc']['n'] for x in ps]), 'accDays': med([x['acc']['days'] for x in ps]), 'accGem': med([x['acc']['gem'] for x in ps]), 'accWant': med([x['acc']['want'] for x in ps]),
        'up': med([x['up']['n'] for x in ps]), 'rdEp': med([len(x.get('rdEp', [])) for x in ps]),
        'wtp_rd10': sum(a for a, b in rd1), 'wtp_rd25': sum(a for a, b in rd2), 'rd_tot': sum(b for a, b in rd1),
        'wtp_ch10': sum(a for a, b in c1), 'wtp_ch25': sum(a for a, b in c2), 'ch_tot': sum(b for a, b in c1),
        'telKo': med([r['icp']['size'] / 1000 for r in v]), 'errs': sum(len(r.get('errs') or []) for r in v),
        'msGapA': med([ms_gap_k(r, KA) for r in v]), 'msGapB': med([ms_gap_k(r, KB) for r in v]), 'nA': med([len(ms_days(r, KA)) for r in v]), 'nB': med([len(ms_days(r, KB)) for r in v]),
        'jal': {k: med([jal_count(r).get(k, 0) for r in v]) for k in ['mission', 'val', 'ville', 'defi', 'duel', 'palier']},
        'every': PEVERY.get(p, 1), 'waitD': med([x.get('waitD', x.get('waitCash', 0) * PEVERY.get(p, 1)) for x in ps]), 'waitIdleD': med([x.get('waitIdleD') for x in ps]), 'waitAct': med([x.get('waitAct', 0) for x in ps]),
        'pp': med([x.get('pp', 0) for x in ps]), 'ppA': med([x.get('ppA', 0) / 1e6 for x in ps]), 'pop': med([r['fin']['pop'] for r in v]),
        'fx': {k: med([(r['icp'].get('fx') or {}).get(k) for r in v]) for k in FXK}, 'fx_n': {k: sum(1 for r in v if (r['icp'].get('fx') or {}).get(k) is not None) for k in FXK},
        'curve': [[s['d'], med([next((x['val'] for x in r['series'] if x['d'] >= s['d']), r['series'][-1]['val']) / 10e6 for r in v])] for s in v[0]['series']],
    }
    summary['personas'][p] = o

# A/B délégation : même graine, même tempo, chaîne confiée au jeu (COO) ou non
for a, b, lab in [('presse', 'presse0', 'Presse-boutons : délégation + accélération vs rien'), ('optimcoo', 'optimiseur', 'Optimiseur : COO (fournisseurs + prix) vs revue manuelle'), ('optimauto', 'optimiseur', 'Optimiseur : fournisseurs auto seuls vs revue manuelle')]:
    if a not in by or b not in by: continue
    rows = []; faster10 = faster25 = slower10 = tot = 0
    for s in seeds:
        ra = next((r for r in by[a] if r['seed'] == s), None); rb = next((r for r in by[b] if r['seed'] == s), None)
        if not ra or not rb: continue
        ma, mb = milestones(ra), milestones(rb)
        for k in MS:
            if k == 'usine' or ma.get(k) is None or mb.get(k) is None: continue
            tot += 1; g = (mb[k] - ma[k]) / max(1, mb[k])
            if g > X1: faster10 += 1
            if g > X2: faster25 += 1
            if g < -X1: slower10 += 1
        rows.append({'seed': s, 'valA': ra['fin']['val'] / 1e6, 'valB': rb['fin']['val'] / 1e6})
    summary['ab'][a + '_vs_' + b] = {'lab': lab, 'tot': tot, 'faster10': faster10, 'faster25': faster25, 'slower10': slower10, 'rows': rows,
                                      'dval': med([(x['valA'] - x['valB']) / x['valB'] for x in rows])}

def f(x, d=0, suf=''):
    return '—' if x is None else (('%.' + str(d) + 'f') % x).replace('.', ',') + suf

print(f"{len(R)} parties, graines {seeds}, horizon {summary['days']} jours\n")
print('| Persona | Valeur finale | ×départ | Rang | 1re usine | ×2 | ×3 | ×5 | ×10 | Entrepreneur | Industriel |')
print('|---|---|---|---|---|---|---|---|---|---|---|')
for p, o in summary['personas'].items():
    m = o['ms']; print(f"| {o['name']} | {f(o['val'])} M$ | ×{f(o['mult'], 1)} | {f(o['rank'], 1)} | j{f(m['usine'])} | j{f(m['x2'])} | j{f(m['x3'])} | j{f(m['x5'])} | j{f(m['x10'])} ({o['ms_n']['x10']}/{o['n']}) | j{f(m['T1'])} | j{f(m['T2'])} ({o['ms_n']['T2']}/{o['n']}) |")
print('\n| Persona | Attente de trésorerie (j) | Plus long creux sans action (j) | Plus long creux sans jalon (j) | Épisodes d\'ennui | Abandon simulé | Ruptures (débuts) | Jours×bâtiments en rupture | Refus |')
print('|---|---|---|---|---|---|---|---|---|')
for p, o in summary['personas'].items():
    q = [x for x in o['quit'] if x is not None]
    print(f"| {o['name']} | {f(o['waitCash'])} | {f(o['gapMax'])} | {f(o['msGap'])} | {f(o['ennui'])} | {len(q)}/{o['n']}{' (j' + ', '.join(str(x) for x in q) + ')' if q else ''} | {f(o['rupN'])} | {f(o['rupD'])} | {f(o['refus'])} |")
print('\n| Persona | Décisions auto (jeu/COO) | Décisions manuelles | Part auto | Revues manuelles | Chantiers | Accélérations (j gagnés) | Envie d\'accélérer non satisfaite | Proxy R&D >10 % | Proxy chantiers >10 % / >25 % (hyp.) |')
print('|---|---|---|---|---|---|---|---|---|---|')
for p, o in summary['personas'].items():
    print(f"| {o['name']} | {f(o['auto'])} | {f(o['manual'])} | {f(None if o['autoShare'] is None else 100 * o['autoShare'])} % | {f(o['checks'])} | {f(o['up'])} | {f(o['acc'])} ({f(o['accDays'])} j) | {f(o['accWant'])} | {o['wtp_rd10']}/{o['rd_tot']} | {o['wtp_ch10']}/{o['ch_tot']} · {o['wtp_ch25']} |")
print()
for k, a in summary['ab'].items():
    print(f"A/B {a['lab']} : jalons atteints >10 % plus tôt {a['faster10']}/{a['tot']} (>25 % : {a['faster25']}), >10 % plus tard {a['slower10']}/{a['tot']}, écart de valeur finale médian {f(100 * a['dval'], 1)} %")
N = summary['days']
print('\n### Passe 83 : rythme (jalons A = ×valeur, palier de fortune, mission, jalon de fortune, ville ; B = A + défi, duel, palier de bâtiment) ; 1 jour ≈ 0,75 s')
print('| Persona | Creux max sans jalon (ancienne déf.) | Creux max A (j / min) | Creux max B (j / min) | Jalons A | Jalons B | Missions | Fortune | Ville | Défis | Duels | Paliers bât. | Pop. finale |')
print('|---|---|---|---|---|---|---|---|---|---|---|---|---|')
for p, o in summary['personas'].items():
    j = o['jal']; mn = lambda d: '—' if d is None else f(d * MIN_PER_DAY, 1)
    print(f"| {o['name']} | {f(o['msGap'])} | {f(o['msGapA'])} / {mn(o['msGapA'])} | {f(o['msGapB'])} / {mn(o['msGapB'])} | {f(o['nA'])} | {f(o['nB'])} | {f(j['mission'])} | {f(j['val'])} | {f(j['ville'])} | {f(j['defi'])} | {f(j['duel'])} | {f(j['palier'])} | {f(o['pop'])} |")
print('\n| Persona | Jours d\'épargne bloquante (% de ' + str(N) + ' j) | dont sans geste possible | Gestes faits pendant l\'épargne | Prêts de projet (M$) | Ennui (jours au-delà du seuil) | Épisodes d\'ennui | Plus long creux sans victoire visible (j) |')
print('|---|---|---|---|---|---|---|---|')
for p, o in summary['personas'].items():
    pc = lambda d: '—' if d is None else f(d, 0) + ' (' + f(100 * d / N, 1) + ' %)'
    print(f"| {o['name']} | {pc(o['waitD'])} | {pc(o['waitIdleD'])} | {f(o['waitAct'])} | {f(o['pp'])} ({f(o['ppA'], 1)}) | {f(o['ennuiD'])} | {f(o['ennui'])} | {f(o['gapMax'])} |")
print('\n| Persona | ' + ' | '.join(FXK) + ' |')
print('|---|' + '---|' * len(FXK))
for p, o in summary['personas'].items():
    print(f"| {o['name']} | " + ' | '.join(('j' + f(o['fx'][k]) + (' (' + str(o['fx_n'][k]) + '/' + str(o['n']) + ')' if o['fx_n'][k] < o['n'] else '')) if o['fx'][k] is not None else '—' for k in FXK) + ' |')
if OUT: json.dump(summary, open(OUT, 'w'), ensure_ascii=False, indent=1); print('->', OUT)
