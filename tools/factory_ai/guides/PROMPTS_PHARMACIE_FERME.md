# Comment prompter : pharmacie en croix et ferme européenne

## Pourquoi le générateur échoue
Un modèle d'image ne « comprend » pas un plan en croix vu d'en haut : il dessine un bâtiment ordinaire et lui colle une croix sur le toit. Il faut **lui donner la forme** au lieu de la décrire.

## Méthode recommandée (ordre de fiabilité)
1. **Image de référence géométrique (img2img / ControlNet / « image guide »)** : utiliser `gabarit_pharmacie_croix.png` (dans ce dossier) comme image d'entrée avec une force de débruitage moyenne (0,55–0,70) : le volume en croix est conservé, le modèle ajoute matières, éclairage, détails. C'est la solution qui marche le mieux.
2. **Référence Gemini** (Rémy) : générer UNE image de référence « vue de dessus » puis « vue isométrique 2:1 », la fournir comme référence de forme à Cowork (image-to-image), pas comme prompt textuel.
3. **Assemblage 2 passes** : (a) générer 5 volumes séparés (noyau + 4 bras) ; (b) les assembler en 3D simple (Blender/three.js) pour avoir le plan exact ; (c) habiller par img2img.
4. **Retouche finale à la main** : si la croix est lisible mais les bras sont trop courts, étirer légèrement les bras (le gabarit est paramétrable : a = largeur des bras, L = longueur).

## Prompt pharmacie (à utiliser avec le gabarit en entrée)
Positif : « isometric 2:1 game building, single plot on a light grey 2:1 diamond slab with small lawn and three small round trees. A cross-shaped pharmacy (Greek cross, equal four short arms around a slightly taller central cube), clean modern architecture: cream-white walls, large glass shopfront on the two visible faces of each arm with shelves and customers visible inside, FLAT GREEN roofs of a single calm pharmacy green (#2f9e5b) forming a perfect green cross seen from above, thin white parapet, a small green glowing plus symbol sculpture on the central cube, ambulance-free, two parked cars and a bench on the courtyard between the arms. Soft warm sunlight from top-left, soft shadows to bottom-right, 3D render, high quality, game asset, transparent background. »
Négatif : « text, letters, logo, signage lettering, drive-through, conveyor, pipes, machine, factory, hospital H shape, extra floors, red, saturated colours, fisheye, perspective distortion, cropped. »
Contraintes : losange de parcelle exact 2:1 (256×128 px pour 1 case), bâtiment centré, aucun élément hors de la dalle.

## Hôpital en H (même méthode)
Gabarit à produire : deux ailes parallèles reliées par un corps central (plan en H), toit blanc cassé, croix médicale verte ou rouge SOBRE incrustée au sol du toit du corps central, parvis avec ambulances, héliport optionnel. Pas de texte.

## Ferme de blé : régression à corriger (fwheat_test.png / fwheat.png)
Problème vu : grange rouge et silo « à l'américaine » + champ à rangs jaune plat. En **Europe**, une exploitation céréalière est plus industrielle et sobre :
- **bâtiments** : grand hangar agricole en tôle ou bardage gris/vert (portique métallique), toit à deux pans de faible pente, grands portails ; **cellules de stockage de grain** : plusieurs silos galvanisés cylindriques alignés avec élévateur/tour de séchage et tuyauterie ; hangar à matériel ; **dalle béton** avec tracteur, moissonneuse-batteuse et remorque ; murets, haies, pas de clôture en bois blanche ni de grange rouge ;
- **champ** : blé doré **dense** couvrant presque toute la parcelle, avec « traces de jalonnage » (tramlines) régulières, bord de parcelle avec talus/herbe ; épis visibles, relief léger, ombres de vent ; garder le rendu « Gladiator » du premier très beau champ ;
- palette sobre : or du blé, gris acier, vert de haie, pas de rouge vif.
Prompt : « isometric 2:1 farm, a 2x2 plot: three quarters of the plot is a dense golden wheat field with straight tramlines and visible ears, one corner holds a modern European grain farm: a large grey corrugated-steel machinery shed with sliding doors, a row of four galvanised grain storage silos with a bucket elevator and drying tower, a concrete yard with a green tractor and a combine harvester, hedges around, no red barn, no wooden fence, no text. Soft sun from top-left, high quality 3D render, game asset, transparent background. »
Négatif : « red barn, American farm silo, white wooden fence, text, logo, cartoon, flat colours. »
Même logique pour colza (jaune en fleurs), maïs (rangs de hautes tiges), vigne (rangs palissés) : parcelle presque pleine + petit bloc de bâtiments européens sobre.
