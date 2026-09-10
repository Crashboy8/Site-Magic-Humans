# Magic Humans — Landing page

Landing page de Pierre Sarazin / Magic Humans, coaching de "Talent Unique". Le but de la page est unique : faire réserver un appel de diagnostic via Calendly (`https://calendly.com/pierre-j-sarazin`).

## Structure du projet

```
.
├── index.html              # Contenu de la page (HTML uniquement)
├── css/
│   └── style.css            # Toute la direction artistique (couleurs, typographies, mise en page)
├── assets/
│   └── img/
│       ├── hero.webp          # Photo pleine largeur du hero
│       ├── authority.webp     # Portrait de la section "Qui suis-je"
│       ├── illustrations/     # Pictos SVG (dont l'illustration de la section "Problème")
│       └── logos/            # Les 14 logos clients du bandeau défilant
└── .github/workflows/deploy.yml   # Déploiement automatique sur GitHub Pages
```

Le fichier original (maquette validée) était un unique `index.html` de 1,3 Mo contenant tout le CSS et toutes les images encodées en base64. Il a été découpé en fichiers séparés (HTML / CSS / images) pour être un vrai projet maintenable, sans aucun changement de contenu ni de design.

## Aperçu en local

Aucune dépendance, aucun build : c'est un site 100% statique.

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

ou simplement ouvrir `index.html` directement dans un navigateur.

## Déploiement — GitHub Pages

GitHub Pages a été retenu comme option de déploiement : gratuit, aucun compte tiers à créer, et directement intégré à ce dépôt GitHub.

Le workflow `.github/workflows/deploy.yml` déploie automatiquement le site à chaque push sur la branche `main`.

**Étape unique à faire une fois, manuellement, dans les réglages GitHub** (accès non disponible depuis cette session) :

1. Aller dans **Settings → Pages** du dépôt.
2. Sous "Build and deployment", choisir **Source : GitHub Actions**.
3. Une fois cette branche fusionnée dans `main`, le site sera automatiquement publié à l'URL `https://<votre-compte>.github.io/Site-Magic-Humans/`.

### Alternative : Vercel ou Netlify

Si une URL de prévisualisation par branche (avant fusion dans `main`) est préférable, Vercel ou Netlify conviennent aussi très bien pour un site statique comme celui-ci — il suffit de connecter le dépôt GitHub depuis leur interface (aucune configuration de build nécessaire, "root directory" = racine du dépôt). Cela demande cependant de créer un compte sur leur plateforme, ce que je ne peux pas faire à votre place.

## Prochaines étapes (itération)

- **Photos** : remplacer `assets/img/hero.webp`, `authority.webp` par de nouvelles photos si besoin (même nom de fichier ou mettre à jour la référence dans `index.html`).
- **Illustration section "Problème"** : la photo couleur a été retirée (remplacée par le picto `wandering-mind.svg` en niveaux de gris) — à remplacer par une vraie photo dès que vous en fournissez une.
- **Logos manquants** : Deloitte, Le Selman Marrakech, Fairmont Monaco, Chabé Paris ne sont pas encore dans `assets/img/logos/` — à ajouter dès que les fichiers sont disponibles (voir balises `<img>` dans la section "CLIENTS" de `index.html`).
- **Prix des offres** : les 4 formules affichent désormais un prix fixe (980 € / 2 000 € / 3 000 € / 5 000 €).
- **Témoignages vidéo** : à intégrer quand disponibles.
- **Formulaire / nom de domaine** : à voir ensemble selon vos besoins (formulaire de contact, domaine personnalisé sur GitHub Pages).
