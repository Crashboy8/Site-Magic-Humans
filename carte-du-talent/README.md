# Carte du Talent (prototype)

Prototype autonome : visualiser son talent comme un territoire en hexagones. HTML, CSS et JavaScript vanilla, sans build ni serveur (s'ouvre aussi en double-cliquant sur `index.html`). Page en `noindex`, absente du sitemap.

## Note de reprise (à jour au 6 octobre 2026)

- **Branche de travail** : `claude/zealous-mayer-oibrrc` (dépôt `Crashboy8/Site-Magic-Humans`). Aucune PR ouverte.
- **Prévisualisation** : https://wwwmagichumanscom-git-claude-zealous-mayer-oibrrc-magic-humans.vercel.app/carte-du-talent/
- **Fait et validé** :
  1. Socle : modèle versionné, localStorage, export / import JSON, carte de démonstration, placement géographique, rendu SVG en relief.
  2. Navigation : zoom, pincement, déplacement, appui long pour déplacer un hexagone, panneau latéral, changements de statut. Positions mémorisées (rien ne bouge sans raison).
  2b. Éclat selon le flow des 30 derniers jours, animations de flow et de conquête, brouillard de guerre (Réglages).
  3. Saisie express d'un moment de flow (téléphone d'abord), découpage flow / à déléguer.
  4. Progrès et objectifs : flow par semaine, tops, défi / maîtrise, frontières, proposition de conquête confirmée par la personne, objectif Vente (les moments de flow comptent comme sessions).
  5. Bibliothèque (59 compétences) et suggestions en hexagones fantômes ; un refus est définitif ; accepter ne bouge rien.
  - Ajustement : sur téléphone, Exporter et Importer sont dans les Réglages.
- **Reste à faire** :
  6. Création guidée au premier lancement : 6 écrans, saisie en vrac, écran de regroupement par glisser-déposer, filtre « Est-ce que ça élargit ton domaine d'action ? ». La démo reste accessible depuis les Réglages.
  7. Finitions : passe responsive générale, relecture, documentation.
- **Méthode** : à chaque étape, tests (`node carte-du-talent/tests/placement.test.js`), captures ordinateur + téléphone, puis push sur la branche. Ton bienveillant partout, jamais culpabilisant.

## Structure

```
carte-du-talent/
├── index.html
├── css/carte.css         thème, rendu de la carte
├── css/ui.css            en-tête, légende, boutons, mobile
├── js/geo/hex.js         grille hexagonale (coordonnées axiales)
├── js/geo/placement.js   placement géographique automatique (fonction pure)
├── js/modele/schema.js   modèle de données, normalisation, version
├── js/modele/stockage.js localStorage + export / import JSON
├── js/modele/demo.js     carte de démonstration
├── js/modele/regles.js   règles métier (statuts, déplacements, flow, objectifs)
├── js/modele/stats.js    statistiques de progrès (calculs purs)
├── js/modele/bibliotheque.js  59 compétences par domaine (icône, liens vers les voisines)
├── js/modele/suggestions.js   suggestions de territoires à conquérir
├── js/vues/              rendu SVG, navigation (zoom, glisser-déposer), panneau, légende, outils
├── js/app.js             point d'entrée
└── tests/placement.test.js
```

Tous les scripts s'attachent à l'espace de noms global `CarteTalent`. Le modèle et le placement n'utilisent pas le DOM.

## Tests

```bash
node carte-du-talent/tests/placement.test.js --carte
```

Le test vérifie : régions d'un seul tenant, aucun trou, aucune case isolée, jonctions touchant leurs deux régions, provinces ancrées, îles séparées par l'eau, déterminisme.

## Navigation

- Molette, pincement ou boutons + / − pour zoomer ; glisser pour se déplacer.
- Clic ou toucher sur un hexagone : panneau de détail et changement de statut.
- Appui long sur un hexagone puis glisser : le déplacer (sur une case occupée, les deux s'échangent).
- Les positions sont mémorisées : changer un statut ne bouleverse pas la carte. Un hexagone qui change de zone (province, île, zone à déléguer) est reposé automatiquement. Le bouton « Réorganiser » relance le placement complet en gardant les déplacements manuels.

## Éclat, animations et brouillard

- Éclat : chaque hexagone s'illumine selon ses moments de flow des 30 derniers jours (pondérés par l'intensité), de « une lueur » à « rayonnant ».
- Animations courtes à l'enregistrement d'un moment et à la conquête d'un territoire, sur un calque séparé : les tuiles ne bougent jamais. Les mouvements sont réduits si le système le demande.
- Brouillard de guerre (Réglages, désactivé par défaut) : les territoires à conquérir non explorés apparaissent sous des nuages ; on les découvre en les explorant.

## Progrès et objectifs

- Écran « Progrès » : flow par semaine (8 semaines), compétences et régions qui mènent au flow, grille défi / maîtrise avec la zone de flow, frontières en cours. Période au choix : 30 derniers jours ou depuis le début.
- Au seuil de conquête (10 moments par défaut, réglable), l'appli propose de passer une frontière en territoire conquis. Rien n'est automatique : « Oui, je l'ai conquis » ou « Pas encore » (la question revient après 5 moments de plus).
- Objectifs liés aux frontières (ex. : Vente, 2 sessions par semaine) : sessions notées à la main, les moments de flow sur la compétence comptent aussi, historique des 3 périodes précédentes.

## Bibliothèque et suggestions

- Bouton ampoule sur la carte : six suggestions apparaissent en hexagones fantômes (pointillés dorés), à l'endroit exact où elles se poseraient. Elles s'appuient sur les compétences voisines déjà présentes, un peu plus sur celles qui mènent au flow, et varient les domaines (deux au plus par domaine).
- Accepter une suggestion la pose à la place de son fantôme ; aucune autre position ne bouge. « Pas pour moi » l'écarte définitivement (rétablissable dans les Réglages).
- On peut aussi ajouter sa propre idée ou piocher dans toute la bibliothèque.
