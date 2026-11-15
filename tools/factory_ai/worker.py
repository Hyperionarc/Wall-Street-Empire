#!/usr/bin/env python3
"""Poste de production : à lancer UNE fois sur le Mac, il enchaîne ensuite les lots demandés.

    cd ~/Wall-Street-Empire/tools/factory_ai && .venv/bin/python worker.py

Il surveille travail/commandes/*.json et n'exécute que des programmes du kit (sprites, scènes, installation et rendus Blender), avec des options vérifiées :
  {"type": "sprites", "lot": "phase1", "limite": 20, "seul": ["presse"], "forcer": false}
  {"type": "scenes", "phase": "brouillons", "scene": ["rd_garage_voiture"], "budget_min": 30}
  {"type": "scenes", "phase": "finale", "retenir": ["rd_garage_voiture:63"], "budget_min": 30}
Toute autre demande est refusée. Ctrl-C l'arrête. Le journal de chaque lot est dans travail/commandes/fait/.
"""
import glob, json, os, re, subprocess, sys, time

ICI = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.join(ICI, 'travail', 'commandes')
FAIT = os.path.join(FILE, 'fait')
PY = os.path.join(ICI, '.venv', 'bin', 'python')
NOM = re.compile(r'^[a-z0-9_/]{1,80}$')
RETENIR = re.compile(r'^[a-z0-9_]{1,80}:\d{1,9}$')


def noms(v):
    v = v if isinstance(v, list) else [v]
    if not all(isinstance(x, str) and NOM.match(x) for x in v):
        raise ValueError('nom refusé')
    return v


def commande(c):
    """Traduit une demande en ligne de commande, ou lève ValueError."""
    if c.get('type') == 'sprites':
        a = [PY, os.path.join(ICI, 'batch.py'), '--arreter-ollama']
        if c.get('lot'):
            a += ['--lot', noms(c['lot'])[0]]
        for n in noms(c.get('seul', [])):
            a += ['--seul', n]
        if c.get('limite'):
            a += ['--limite', str(int(c['limite']))]
        if c.get('forcer'):
            a.append('--forcer')
        if c.get('planches'):
            a.append('--planches')
        return a
    if c.get('type') == 'scenes':
        if c.get('phase') not in ('brouillons', 'finale'):
            raise ValueError('phase refusée')
        a = [PY, os.path.join(ICI, 'batch_scenes.py'), '--phase', c['phase'], '--budget-min', str(float(c.get('budget_min', 30)))]
        for n in noms(c.get('scene', [])):
            a += ['--scene', n]
        for r in c.get('retenir', []):
            if not (isinstance(r, str) and RETENIR.match(r)):
                raise ValueError('graine refusée')
            a += ['--retenir', r]
        if c.get('forcer'):
            a.append('--forcer')
        return a
    if c.get('type') == 'pousser':
        return ['/bin/bash', os.path.join(ICI, 'pousser.sh')]
    if c.get('type') == 'blender_installer':
        return ['/bin/bash', os.path.join(ICI, 'blender', 'install_blender.sh')]
    if c.get('type') == 'blender':
        sc = noms(c.get('scene', ''))[0]
        script = os.path.join(ICI, 'blender', sc + '.py')
        if not os.path.isfile(script):
            raise ValueError('scène Blender inconnue')
        exe = os.path.expanduser('~/Applications/Blender.app/Contents/MacOS/Blender')
        n = max(1, min(int(c.get('angles', 36)), 120))
        return [[exe, '--background', '--python', script, '--', '--angles', str(n), '--taille', str(max(256, min(int(c.get('taille', 640)), 2048)))],
                [PY, os.path.join(ICI, 'blender', 'planche.py'), sc]]
    raise ValueError('type refusé')


def main():
    os.makedirs(FAIT, exist_ok=True)
    print('Poste de production prêt. En attente de lots (Ctrl-C pour arrêter).', flush=True)
    while True:
        for f in sorted(glob.glob(os.path.join(FILE, '*.json'))):
            base = os.path.basename(f)[:-5]
            journal = os.path.join(FAIT, base + '.log')
            try:
                argv = commande(json.load(open(f)))
            except Exception as e:
                open(journal, 'w').write(f'REFUSÉ : {e}\n')
                os.replace(f, os.path.join(FAIT, base + '.json'))
                print(f'[{base}] refusé : {e}', flush=True)
                continue
            suite = argv if argv and isinstance(argv[0], list) else [argv]
            print(f'\n=== [{base}] {" ".join(suite[0][1:])} ===', flush=True)
            os.replace(f, os.path.join(FAIT, base + '.json'))
            t0 = time.time()
            with open(journal, 'w') as log:
                for etape in suite:
                    p = subprocess.Popen(etape, cwd=ICI, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
                    for ligne in p.stdout:
                        sys.stdout.write(ligne); sys.stdout.flush()
                        log.write(ligne); log.flush()
                    code = p.wait()
                    if code:
                        break
                log.write(f'FIN code={code} duree={time.time() - t0:.0f}s\n')
            print(f'=== [{base}] terminé (code {code}, {time.time() - t0:.0f} s). En attente du lot suivant. ===', flush=True)
        time.sleep(3)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\nPoste arrêté.')
