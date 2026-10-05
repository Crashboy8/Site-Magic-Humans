# Carte du Talent (prototype)

Prototype autonome : visualiser son talent comme un territoire en hexagones. HTML, CSS et JavaScript vanilla, sans build ni serveur (s'ouvre aussi en double-cliquant sur `index.html`). Page en `noindex`, absente du sitemap.

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
├── js/vues/              rendu SVG, légende, outils (icônes Lucide)
├── js/app.js             point d'entrée
└── tests/placement.test.js
```

Tous les scripts s'attachent à l'espace de noms global `CarteTalent`. Le modèle et le placement n'utilisent pas le DOM.

## Tests

```bash
node carte-du-talent/tests/placement.test.js --carte
```

Le test vérifie : régions d'un seul tenant, aucun trou, aucune case isolée, jonctions touchant leurs deux régions, provinces ancrées, îles séparées par l'eau, déterminisme.
