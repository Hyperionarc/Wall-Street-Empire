"""Cadre un bâtiment de ferme : réduit l'échelle (kf) tant que l'emprise dépasse la bande nord→est.
Usage : python3 ferme_cadre.py <bat> <v1> <mode> <sortie> <kf_max> "<décor>" [flip]"""
import sys, os, re, subprocess
bat, v1, mode, sortie, kf, deco = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5]), sys.argv[6]
env = dict(os.environ, BAT_COIN='1', BAT_FLIP='1' if len(sys.argv) > 7 and sys.argv[7] == 'flip' else '0')
while kf > 0.3:
    r = subprocess.run(['python3', 'parcelle.py', bat, '3', '0', v1, '1', mode, sortie, 'factory_hd', '%.3f' % kf, deco], capture_output=True, text=True, env=env)
    m = re.search(r'depassement ([\d.]+)%', r.stdout)
    pen = re.search(r'pente base ([\d.]+) redressement y x ([\d.]+)', r.stdout)
    d = float(m.group(1)) if m else 99
    print(sortie, 'kf %.3f' % kf, 'depassement %.2f%%' % d, pen.group(0) if pen else '')
    if d <= 0.8: break
    kf -= 0.04
