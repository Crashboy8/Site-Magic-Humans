# Talent Unique — le jeu

*« Le jeu vidéo qui te fait réussir ta vie dans le plaisir »*

MVP du flux **Import → Onboarding → Génération de config → Dashboard quotidien**, conforme au `cahier-des-charges-talent-unique.md` et au `questionnaire-initial.md` fournis. Application 100 % statique (HTML/CSS/JS, aucun build), pensée pour être testée immédiatement sans compte à créer.

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
- **Compte et sauvegarde cloud (Supabase)** : connexion par email + lien magique (`js/auth.js`), sans mot de passe. Le profil et la progression sont stockés dans une table `players` (une ligne par joueur, RLS activée — chacun ne peut lire/écrire que sa propre ligne), donc accessibles depuis n'importe quel appareil avec le même email. Voir `supabase-schema.sql` pour le schéma à exécuter une fois dans le projet Supabase.

## Ce qui est volontairement simplifié pour l'instant

Un arbitrage a été validé avant de coder (voir section 10 du cahier des charges, « points à ne pas trancher seul ») :

**Pré-remplissage par heuristique locale, pas d'appel à l'API Claude.** `js/talentParser.js` (extraction par sections/mots-clés) et `js/moduleDetector.js` (score de mots-clés pour CRM/Moodboard) sont les deux fichiers à remplacer par un vrai appel serveur à l'API Claude quand une clé sera disponible — l'agent doit rester isolé et côté serveur (jamais de clé API exposée côté client), conformément au point de sécurité de la section 6 du cahier des charges. Ça ne change ni la structure des données ni l'UI : c'est un point de bascule isolé.

*(Le choix Supabase vs Firebase, lui, est tranché : Supabase est branché depuis le `js/store.js` actuel.)*

## Arborescence

```
talent-game/
├── index.html              # SPA, un seul point d'entrée
├── css/style.css            # identité visuelle arcade/gamifiée
├── js/
│   ├── app.js                # routeur d'état + rendu de toutes les vues
│   ├── supabaseClient.js     # init du client Supabase (URL + clé publishable)
│   ├── auth.js                # écran de connexion + flux email/lien magique
│   ├── store.js              # persistance (table Supabase `players`)
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
├── supabase-schema.sql       # à exécuter une fois dans Supabase (SQL Editor)
└── data/profil-test.md       # faux profil Talent Unique pour QA
```

## Points encore ouverts (hors scope de ce lot)

Comme indiqué dans le cahier des charges (section 9, « hors MVP ») : dimension sociale (classements, défis, partenariats marques), Moodboard visuel riche (la détection existe déjà et s'affiche dans l'app — « Module Moodboard activé, arrive en v2 » — mais l'écran n'est pas construit), cartographie complète des talents, et ajustement comportemental automatique avancé.
