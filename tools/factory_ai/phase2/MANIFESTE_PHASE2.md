# Phase 2 : structure proposée de `manifest_carte.json`

But : un Claude Code lancé sur le Mac (`Darwin arm64`, producteur) n'a qu'à `git pull`, lancer un lot, relire la planche, pousser. Le fichier sera **généré** par un `build_manifest_carte.py` (comme `build_manifest.py` en phase 1) à partir de `INVENTAIRE.md` ; ce document ne crée pas le JSON.

## Racine

```json
{
  "version": 1,
  "modele": "flux2-klein-4b",
  "echelle_hd": 3,
  "classes": { "T": {"gen_px": 768}, "S": {"gen_px": 768}, "M": {"gen_px": 1024},
               "L": {"gen_px": 1280}, "P": {"gen_px": 512}, "V": {"gen_w": 1536, "gen_h": 864} },
  "lots": [ {"id": "L01", "ordre": 1, "nb": 20, "note": "sol port, quai, eau, routes"} ],
  "images": [ ... ],
  "planches": { ... },
  "test": ["L01"]
}
```

## Entrée d'image (champs)

| Champ | Type | Exemple | Rôle |
|---|---|---|---|
| `nom` | texte | `usine/f2_a_n2_actif` | identifiant unique, **`famille/nom_niveau_etat`** (voir nommage) |
| `famille` | texte | `usine` | une des 20 familles de `INVENTAIRE.md` |
| `type_jeu` | texte | `f2` | clé de `TYPES` (ou `deposit:iron`, `cult:wheat`, `veh:Red-Sedan1`, `monument:hospital`) |
| `variante` | texte | `a` | `a`, `b`... (atlas : `shop7` -> `a`) |
| `niveau` | `n1`/`n2`/`n3`/`-` | `n2` | `lvl` 0 / 1-2 / 3-4 ; `-` si sans niveau |
| `lvl_jeu` | entier | `2` | valeur de `lvl` utilisée pour l'export du gabarit |
| `etat` | texte | `actif` | `actif`, `chantier1..3`, `ruine`, `semis`, `croissance`, `mur` (mûr), `epuise` |
| `lot` | `L01`..`L20` | `L07` | lot de production (ordre : `ORDRE.md`) |
| `rang` | entier | 133 | ordre global |
| `classe` | `T/S/M/L/P/V` | `M` | taille de génération |
| `emprise` | `[w,h]` | `[2,1]` | emprise en cases (`TYPES[].w/.h`) |
| `sortie_px` | `[w,h]` | `[594,620]` | taille finale après recadrage |
| `gabarit` | objet | voir ci-dessous | forme imposée |
| `ancre` | objet | `{"ref":"centre_emprise","x":297,"y":520}` | point au sol (centre du losange d'emprise) |
| `sujet` | texte (anglais) | `medium factory, two-storey hall, ...` | partie `{sujet}` de la consigne |
| `seed` | entier | 42 | graine de départ ; incrémentée à chaque essai |
| `essais_max` | entier | 3 | comme `config.json` |
| `ombre` | booléen | `true` | produire `ombres/<nom>.png` |
| `statut` | texte | `a_faire` | `a_faire`, `ok`, `rebut` (écrit dans `etat.json`, pas dans le manifeste versionné) |
| `jeu` | objet | `{"fonction":"drawIndustrial","atlas":"fact0"}` | trace code (fonction de dessin, sprite d'atlas remplacé) |

`gabarit` :

```json
{ "type": "atlas | vecteur | aucun",
  "atlas": "fact0",                      // si type = atlas : clé de atlas.json (agrandie x3)
  "export": {"fonction": "drawIndustrial", "args": {"t": "f2", "lvl": 2, "seed": 0.31}},   // si vecteur
  "fichier": "gabarits/usine/f2_a_n2_actif.png" }
```

## Nommage

`famille/nom_niveau_etat`, tout en minuscules, sans accent, séparateur `_`. Familles : `sol`, `gisement`, `route`, `vegetation`, `vehicule`, `port`, `maison`, `immeuble`, `tour`, `sport`, `bureau`, `monument`, `commerce`, `ferme`, `extraction`, `btp`, `usine`, `energie`, `etat`, `vitrine`.

Exemples : `route/masque_05`, `sol/port_a`, `usine/f2_a_n3_actif`, `commerce/s1_b_n1_actif`, `ferme/champ_ble_croissance_a`, `etat/chantier_2x2_phase2`, `vehicule/red_sedan1_se`, `vitrine/accueil_port`.
Sortie : `assets/carte_hd/<nom>.png`, ombre `assets/carte_hd/ombres/<nom>.png`, ancres `assets/carte_hd/ancres.json` (même contrat que `assets/factory_hd/`).

## `planches`

Mêmes règles qu'en phase 1 : un lot = une planche d'aperçu (gabarit à gauche, rendu à droite) dans `assets/carte_hd/_apercus/L01.png`.

## Procédure pour le producteur (Mac)

1. `git pull` (branche `assets/phase2-*`), lire `RETOURS.md`, `CHARTE.md` > « Leçons ».
2. `cd tools/factory_ai && .venv/bin/python batch_carte.py --lot L01` (à écrire : adaptation de `batch.py`, lit `manifest_carte.json`, gabarits dans `gabarits/`).
3. Relire la planche, refaire les rebuts (`--seul <nom> --forcer`), `etat.json` mis à jour.
4. `git add assets/carte_hd tools/factory_ai/JOURNAL.md && git commit && git push` ; ne jamais fusionner dans `master`.
5. Lots suivants sans validation sauf L01 (style) et lots signalés « non codé » (chantiers L04-L05, champs L12-L14, ruines L20).

## Contrôles automatiques à prévoir

Chaque ligne : gabarit présent, `sortie_px` respectée, ancre à 1 px, ombre de même taille, fichier <= 150 Ko (palette 256 couleurs, `png_couleurs`), aucune image du lot 1 de phase 1 écrasée, nombre total de lignes = 400.
