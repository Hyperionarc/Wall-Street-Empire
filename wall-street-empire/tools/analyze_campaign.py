#!/usr/bin/env python3
"""Analyse d'une campagne de parties simulées (sim_batch.js) : indicateurs de plaisir de jeu par caste et par profil.
Indicateurs : temps avant le premier rang <= 3, durée de plateau (fenêtres de 100 jours où la valeur progresse de moins de 2 %),
croissance de valeur sur la période, parties sans progrès (valeur finale < 1,3 x départ), chômage moyen et humeur moyenne, faillites."""
import json, sys, statistics as st, collections
rows = [json.loads(l) for l in open(sys.argv[1]) if l.strip()]
ok = [r for r in rows if 'series' in r]; err = [r for r in rows if 'erreur' in r]
print(f'{len(rows)} parties lues, {len(ok)} exploitables, {len(err)} en erreur\n')
def met(r):
    s = r['series']; v0 = 10e6; vals = [x['val'] for x in s]; plateau = 0; run = 0; best = 0
    for a, b in zip(vals, vals[1:]):
        if b < a * 1.02: run += 1; best = max(best, run)
        else: run = 0
        plateau += 1 if b < a * 1.02 else 0
    t3 = next((x['d'] for x in s if x['rk'] <= 3), None); tm = next((x['d'] for x in s if x['rk'] <= 1), None)
    return dict(final=vals[-1] / v0, plateau=plateau / max(1, len(vals) - 1), plateau_max=best * 100, t3=t3, t1=tm, unemp=st.mean(x['unemp'] for x in s), happy=st.mean(x['happy'] for x in s), loan=s[-1]['loan'] / max(1, s[-1]['val']), flat=vals[-1] < 1.3 * v0, rk=s[-1]['rk'], neg=any(x['cash'] < 0 for x in s))
def table(key):
    g = collections.defaultdict(list)
    for r in ok: g[r[key]].append(met(r))
    print(f'{"":14s} {"n":>3s} {"x départ":>9s} {"plateau":>8s} {"1er top3":>9s} {"1er rang1":>9s} {"chômage":>8s} {"humeur":>7s} {"sans progrès":>12s} {"rang fin":>8s}')
    for k, v in sorted(g.items()):
        t3 = [m['t3'] for m in v if m['t3'] is not None]; t1 = [m['t1'] for m in v if m['t1'] is not None]
        print(f'{k:14s} {len(v):3d} {st.median([m["final"] for m in v]):8.1f}x {100*st.mean(m["plateau"] for m in v):7.0f}% {(str(int(st.median(t3)))+"j (" + str(len(t3)) + "/" + str(len(v)) + ")") if t3 else "jamais":>9s} {(str(int(st.median(t1)))+"j") if t1 else "jamais":>9s} {100*st.mean(m["unemp"] for m in v):7.1f}% {st.mean(m["happy"] for m in v):7.0f} {100*sum(m["flat"] for m in v)/len(v):11.0f}% {st.mean(m["rk"] for m in v):8.1f}')
    print()
print('PAR CASTE'); table('caste'); print('PAR PROFIL'); table('profile')
g = collections.defaultdict(list)
for r in ok: g[('événements' if r['events'] else 'sans événement')].append(met(r)['final'])
print('ÉVÉNEMENTS :', {k: f'{st.median(v):.1f}x (n={len(v)})' for k, v in g.items()})
print('\nFaillites / trésorerie négative :', sum(met(r)['neg'] for r in ok), 'sur', len(ok))
