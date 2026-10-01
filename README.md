# Magic Humans

Site de Pierre Sarazin / Magic Humans, coaching du Talent Unique pour cadres, dirigeants et entrepreneurs en transition. Site 100 % statique (HTML, CSS, JavaScript vanilla), sans build ni dépendance. Objectif principal : faire réserver un appel de diagnostic via Calendly (`https://calendly.com/pierre-j-sarazin`).

## Structure du projet

```
.
├── index.html                              # Home
├── alternative-bilan-de-competences/
│   └── index.html                          # Landing : alternative au bilan de compétences
├── reconversion-cadre-sens/
│   └── index.html                          # Landing : reconversion de cadre
├── multi-talents-transition/
│   └── index.html                          # Landing : multi-talents en transition
├── coaching-independant-positionnement/
│   └── index.html                          # Landing : rebond stratégique
├── reprise-entreprise/
│   └── index.html                          # Landing : reprise d'entreprise
├── 404.html                                # Page introuvable
├── css/
│   └── style.css                           # Toute la direction artistique
├── js/
│   ├── i18n.js                             # Bascule FR / EN (attribut data-en)
│   ├── nav.js                              # Menu mobile
│   └── lightbox.js                         # Agrandissement de l'image Ikigaï
├── assets/
│   ├── fonts/                              # Polices auto-hébergées (woff2, subset latin)
│   ├── img/                                # Photos, logos, illustrations
│   └── video/                              # Témoignages vidéo
├── sitemap.xml
├── robots.txt
└── vercel.json                             # Configuration de déploiement
```

Chaque page a sa propre balise `<html lang="fr">`, ses métadonnées (title, description, Open Graph, Twitter Card, JSON-LD) et son bloc `<nav>` / `<footer>` identiques, reliant toutes les pages entre elles.

## Internationalisation

Les éléments traduisibles portent un attribut `data-en="..."`. Le script `js/i18n.js` bascule l'affichage entre le français (par défaut) et l'anglais au clic sur le sélecteur FR / EN, sans rechargement de page, et mémorise le choix dans le stockage local du navigateur.

## Aperçu en local

Aucune dépendance, aucun build.

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

ou simplement ouvrir `index.html` directement dans un navigateur.

## Déploiement

Le site est déployé sur Vercel : chaque push sur la branche `main` déclenche automatiquement un nouveau déploiement, sans configuration de build (site statique, racine du dépôt).

`vercel.json` force les URL avec slash final (`trailingSlash: true`) pour rester cohérent avec la structure en dossiers du projet.

Le suivi d'audience utilise Vercel Web Analytics (script chargé sur chaque page, sans cookies ni bandeau de consentement).

## Suivi des campagnes

Les liens Calendly du site portent des paramètres UTM normalisés (`utm_source=site`, `utm_medium=cta`, `utm_campaign=<page>`, `utm_content=<position du bouton>`) pour distinguer l'origine des demandes de rendez-vous selon la page et l'emplacement du bouton cliqué.

## Quiz Talent Unique (`/quiz/`)

Page autonome `quiz/index.html` : QCM en 6 questions, capture du prénom et de l'e-mail, rapport en 7 sections, PDF téléchargeable et lien personnel (`/quiz/#r=...`). L'envoi automatique du rapport par e-mail passe par un script Google Apps Script relié à un Google Sheet ; son URL se colle dans `CONFIG.endpoint` en haut du script de la page. Les sources et le guide d'installation sont dans le kit « magic-humans-quiz ».

### Règles à respecter quand on modifie le quiz

Le script Google Apps Script qui envoie le rapport PDF par e-mail lit le moteur du quiz **directement sur la page en ligne** (`/quiz/`), à chaque envoi (avec un cache de 10 minutes). Il n'y a donc rien à mettre à jour côté Google quand on change les textes, les questions, le rapport ou l'e-mail, à condition de respecter ces règles :

- Garder tout le moteur (données, textes, calcul, `reportDocHTML`, `emailHTML`) dans le premier `<script>` en ligne de `quiz/index.html`, **avant** le commentaire qui contient `INTERFACE DU QUIZ`. Tout ce qui est après ce commentaire est réservé au navigateur.
- Ne jamais utiliser `document`, `window` ou `localStorage` dans la partie moteur : elle est aussi exécutée sur les serveurs de Google.
- Conserver ces noms, que le script utilise : `decodeState`, `computeScores`, `buildProfile`, `personalLink`, `reportDocHTML`, `emailHTML`, `alloyName`, `L`, `A_FR`, `cleanName`, `esc`, `CONFIG`, ainsi que `L(lang).X.T.mail` pour les textes de l'e-mail.
- Si l'une de ces règles doit changer, il faut aussi mettre à jour le script dans Apps Script (Déployer → Gérer les déploiements → Nouvelle version).
