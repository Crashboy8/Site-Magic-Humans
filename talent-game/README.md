# Talent Unique — le jeu

*« Le jeu vidéo qui te fait réussir ta vie dans le plaisir »*

MVP du flux **Import → Onboarding → Génération de config → Dashboard quotidien**, conforme au `cahier-des-charges-talent-unique.md` et au `questionnaire-initial.md` fournis. Application 100 % statique (HTML/CSS/JS, aucun build), qui se joue tout de suite, sans compte : la partie est gardée dans le navigateur.

## Lancer en local

```bash
cd talent-game
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Sur l'écran d'accueil, clique sur **« Essayer avec un profil de test »** pour parcourir tout le flux avec un faux profil Talent Unique réaliste (voir `data/profil-test.md`), sans avoir à coller de texte.

## Ce qui est implémenté (MVP)

- **Import** du profil brut (texte collé) + parseur heuristique (`js/talentParser.js`) qui pré-remplit talent/valeurs/ressources/habitudes/déclencheur à partir des sections du texte
- **Onboarding conversationnel** des 25 questions (`js/onboarding.js`), étape par étape, présentant d'abord ce qui a été déduit du profil pour validation/complément — jamais une question posée à l'aveugle
- **Catégories de vie dynamiques** (`js/quotas.js`) : structure clé/valeur libre, éditable à l'onboarding (Q4) *et* à tout moment dans les Paramètres, pas de schéma figé
- **Détection des modules** CRM/Moodboard (`js/moduleDetector.js`) par heuristique de mots-clés sur les réponses Q22/Q23 — jamais une case à cocher
- **Génération de la configuration de jeu** (`js/questGenerator.js`) : quêtes de départ construites à partir des habitudes, ressources et de la catégorie négligée identifiées pendant l'onboarding
- **Dashboard quotidien** avec quêtes groupées par catégorie (« mondes » colorés), barre d'XP, badges à débloquer, animation de récompense à la validation d'une quête
- **Module Ressourcement**, **Module Habitudes** (structure Atomic Habits complète : identité visée, signal, version minimale, désirabilité, appui environnemental, récompense), **Module CRM léger** (si détecté)
- **Bouton Restart** : remet la progression à zéro (quêtes, points, badges) sans jamais toucher au profil, aux ressources ou aux contacts
- **Un seul jeu relié au compte Magic Humans** : la partie est gardée dans le navigateur (`localStorage`, clé `talent_game_v1`), avec ou sans compte. Quand un compte Magic Humans est ouvert dans ce navigateur (le même que Mon espace, sur www.magichumans.com), les points, les badges et la série de jours partent aussi dans le compte (table `progression` de la Boussole, RLS : chaque personne ne voit et ne modifie que sa ligne), où ils s'ajoutent aux points de « Où j'en suis ? ». Mon espace les montre dans le bloc « Ton aventure ». Le profil, les quêtes, les habitudes et les contacts ne quittent jamais le navigateur. Pas de classement, rien n'est visible par une autre personne.
- **Sans compte, rien n'est envoyé.** À la première connexion, les points gagnés dans le navigateur sont repris par le compte (Mon espace ou le jeu les envoie), sans en perdre. Détails : `js/progression.js` (clé `talent_game_progression_v1`, badges, série, appels à `/boussole-decision/api/progression/`) et `js/compte.js` (affichage et envois, un par un). Test : `node --test talent-game/js/progression.test.mjs`.

## Ce qui est volontairement simplifié pour l'instant

Un arbitrage a été validé avant de coder (voir section 10 du cahier des charges, « points à ne pas trancher seul ») :

**Pré-remplissage par heuristique locale, pas d'appel à l'API Claude.** `js/talentParser.js` (extraction par sections/mots-clés) et `js/moduleDetector.js` (score de mots-clés pour CRM/Moodboard) sont les deux fichiers à remplacer par un vrai appel serveur à l'API Claude quand une clé sera disponible — l'agent doit rester isolé et côté serveur (jamais de clé API exposée côté client), conformément au point de sécurité de la section 6 du cahier des charges. Ça ne change ni la structure des données ni l'UI : c'est un point de bascule isolé.

*(Le compte est celui de Magic Humans, servi par la Boussole : `apps/boussole-decision/`, section « Ton aventure » de son README.)*

## Arborescence

```
talent-game/
├── index.html              # SPA, un seul point d'entrée
├── css/style.css            # identité visuelle arcade/gamifiée
├── js/
│   ├── app.js                # routeur d'état + rendu de toutes les vues
│   ├── progression.js        # ce que le navigateur garde pour le compte, badges, série, appels à la route
│   ├── compte.js             # lien avec le compte Magic Humans (affichage, envois un par un)
│   ├── store.js              # persistance dans le navigateur (localStorage)
│   ├── talentParser.js       # pré-remplissage heuristique (→ IA plus tard)
│   ├── moduleDetector.js     # détection CRM/Moodboard (→ IA plus tard)
│   ├── onboarding.js         # les 25 questions + logique de sauvegarde
│   ├── questGenerator.js     # génère les quêtes de départ et de relance
│   ├── quotas.js             # catégories de vie dynamiques
│   ├── dashboard.js          # vue quêtes du jour / XP / badges
│   ├── ressourcement.js
│   ├── habitudes.js
│   ├── crm.js
│   └── restart.js            # paramètres (quotas, compte, bouton Restart)
└── data/profil-test.md       # faux profil Talent Unique pour QA
```

## Points encore ouverts (hors scope de ce lot)

Comme indiqué dans le cahier des charges (section 9, « hors MVP ») : dimension sociale (classements, défis, partenariats marques), Moodboard visuel riche (la détection existe déjà et s'affiche dans l'app — « Module Moodboard activé, arrive en v2 » — mais l'écran n'est pas construit), cartographie complète des talents, et ajustement comportemental automatique avancé.
