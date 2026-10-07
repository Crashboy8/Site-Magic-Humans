# Boussole de décision

Outil d'aide à la décision professionnelle réservé aux coachés de Magic Humans.
Servi sous **https://www.magichumans.com/boussole-decision/**.

Stack : Next.js 16 (App Router) + TypeScript + Tailwind 4, Supabase (authentification, Postgres, règles de sécurité par utilisateur).

## Organisation du code

```
src/
├── domain/      Modèle métier et règles pures (aucune dépendance) + tests unitaires
├── data/        Accès aux données (Supabase). À remplacer pour une intégration dans « Talent Unique »
├── features/    Écrans par fonctionnalité : auth, profils, versions, coach…
├── components/  Éléments d'interface partagés (boutons, champs, sauvegarde automatique…)
├── lib/         Configuration, clients Supabase
├── app/         Routes Next.js
└── proxy.ts     Rafraîchit la session et protège les pages
supabase/
├── migrations/  Schéma, sécurité (RLS), fonctions
├── seed.sql     Code d'invitation de test : BOUSSOLE-TEST-2026
├── templates/   Emails d'authentification (FR · EN · ES)
└── tests/       Tests SQL de sécurité (Postgres nu)
```

### Méthode Magic Humans / MO2I

La terminologie officielle est centralisée dans `src/domain/methodology.ts` (Talent Unique, Contexte Déclencheur,
Mécanisme, Super bénéfice, Anti-Contexte) et utilisée telle quelle dans l'interface.

- Chaque profil porte la phrase de **Talent Unique** : « Je [Mécanisme] dans un environnement où
  [Contexte Déclencheur], afin de [Super bénéfice]. », et l'**Anti-Contexte**.
- Catégories de la matrice : Contexte Déclencheur & Flow · Anti-Contexte & Lignes Rouges · Alignement Valeurs & Culture ·
  Conditions de Vie & QVT · Rémunération & Viabilité Financière (+ catégories personnelles).
- **Tableau de décision** (une seule page, comme une feuille de calcul) : critères en lignes, regroupés par catégorie,
  opportunités en colonnes, score en bas de chaque colonne. La ligne des opportunités reste figée en haut de l'écran
  quand on descend dans les critères.
- Chaque critère : importance **Critique ×5, Très important ×4, Important ×3, Moyennement important ×2, Bof ×1, Bonus**
  (ajoute des points, n'en retire jamais) ; case **🔒 non négociable** indépendante (`DEALBREAKER`) ;
  direction `TOWARDS` (pour aller vers) ou `AWAY_FROM` (« à éviter » : on évalue la présence du risque).
- **Barème personnalisable** (encart « Mon barème », dans la marge de gauche sur grand écran, replié au-dessus du tableau sinon) : la personne règle le poids de chaque niveau
  (0 à 10) ; il est propre à chaque version (`versions.importance_weights`), recopié lors d'une duplication et
  verrouillé une fois la version finalisée.

- **Résultats** (`/versions/{id}/resultats/`, lecture : `src/domain/results.ts`) :
  verdict en une phrase (en tête, au coude à coude sous 5 points) et podium ; pour chaque opportunité,
  « ce qui allume ton talent » (Contexte Déclencheur présent, autres atouts) et « ce qui risque de t'éteindre »
  (non-négociables non respectés, Anti-Contexte présent, ce qui manquerait, à surveiller) ; garde-fous pour
  l'opportunité choisie, avec les contextes d'échec vécus du profil ; **ikigai** de chaque opportunité (quatre
  cercles à 25 % : ce que j'aime = qualité de vie + Anti-Contexte évité, ce en quoi je suis doué·e = Contexte
  Déclencheur, ce dont le monde a besoin = valeurs, ce pour quoi je peux être payé·e = rémunération ; centre doré
  à 100 %) ; radar par catégorie avec tableau des chiffres ; questions à poser pour les cases « à vérifier » ;
  solidité du classement (chaque catégorie comptée ×2 puis ×0,5) ; ressenti (« Ce classement correspond-il à
  ton ressenti ? », projection « tu as signé demain ») et trois prochains pas.
- **Profil** : en plus du Talent Unique et de l'Anti-Contexte, « Mes contextes vécus » (situations de réussite
  et d'échec), rappelés dans les garde-fous.

- **Français / anglais / espagnol** : sélecteur FR · EN · ES dans l'en-tête ; la langue est gardée dans le cookie `boussole_lang`
  (par défaut : celle du navigateur, sinon le français) et les adresses ne changent pas. Textes de l'interface dans
  `src/i18n/messages/` (un fichier par zone, l'anglais et l'espagnol typés sur le français : une traduction manquante ne compile pas),
  terminologie MO2I dans les trois langues dans `src/domain/methodology.ts` (`getMethodology(locale)`). Côté serveur :
  `getI18n()` ; côté client : `useI18n()`. Les contenus saisis (critères, opportunités, notes) ne sont pas traduits ;
  les catégories par défaut s'affichent dans la langue choisie. Les emails d'authentification suivent la langue du
  compte (`user_metadata.lang`, enregistrée à l'inscription, à l'essai, à la connexion et au changement de langue) ;
  les comptes plus anciens, sans langue enregistrée, les reçoivent en français. Le lien du quiz ouvre la Boussole dans la langue où le quiz a été passé.

### Moteur de calcul (`src/domain/scoring.ts`)

- Satisfaction : `TOWARDS` → valeur évaluée ; `AWAY_FROM` → 100 − présence.
- Score d'alignement global (%) = (Σ poids × satisfaction + bonus) / Σ (poids × 100), sur les critères évalués ;
  poids = barème de la version (un niveau à 0 ne compte pas) ; un Bonus satisfait ajoute jusqu'à son poids
  (1 par défaut) ; score plafonné à 100.
- « Je ne sais pas encore » et cases vides : exclus du calcul, listés « à vérifier ».
- Non négociable respecté seulement à 100 % ; sinon l'opportunité est « non conforme » et classée après les autres.
  Inconnu → « à vérifier ».
- Alertes Anti-Contexte : critère « à éviter » présent à 50 % ou plus ; ligne rouge (« à éviter » non négociable) franchie dès 25 %.

### Accès et sécurité

- Deux portes d'entrée (page `/bienvenue/`) :
  - **« Essayer tout de suite »** : session invitée (connexion anonyme Supabase), sans email ; le travail est enregistré
    en base et gardé 30 jours. « Sauvegarder mon travail » ajoute l'email : le compte devient permanent sans perte de données.
    Si l'email a déjà un compte (ou via « Me connecter à mon compte »), la personne s'y connecte depuis la même page
    (mot de passe ou lien) : son essai est ajouté au compte (`create_guest_transfer` / `claim_guest_transfer`), puis le
    compte invité est supprimé.
  - **« Me connecter / Créer mon compte »** : email + mot de passe ou lien magique. Le code d'invitation est **facultatif**
    (à usage unique, désactivable) ; sans code, la personne est rattachée au coach principal (premier compte coach).
- **Depuis le quiz Talent Unique** (`/quiz/`) : le bouton « Utiliser ce résultat dans ma Boussole » ouvre
  `/importer-quiz/#q=…` (résultat en JSON base64url dans l'ancre, jamais envoyé au serveur avant le clic). La page
  montre un aperçu, puis crée un profil prérempli : Talent Unique, contextes vécus, conditions fertiles en critères
  « à rechercher » et environnements toxiques en critères « à éviter » (`src/features/quiz/`, `src/domain/quizImport.ts`).
  Sans compte : essai invité ; avec un compte : après connexion, un bandeau sur l'accueil propose l'ajout.
- Deux rôles : `coach` et `coache`. Les essais non sauvegardés n'apparaissent jamais au coach.
- Les essais jamais sauvegardés sont supprimés après 30 jours (`purge_stale_guests`, planifiée chaque nuit via pg_cron).
- Chaque table porte `user_id` ; les règles RLS limitent chaque personne à ses propres données.
- Le **coach ne voit rien** tant que le coaché n'a pas activé « Partager avec mon coach » sur un profil.
  Le partage est révocable ; il ne donne qu'un accès en lecture, plus la possibilité de commenter
  (version, critère, opportunité). Le coaché est notifié des nouveaux commentaires.
- Une version **finalisée** est verrouillée par la base ; on peut la rouvrir ou la dupliquer.
- Toutes ces règles sont testées dans `supabase/tests/rls.test.sql` (`npm run test:db`).

## Développement local

Prérequis : Node 20+, Docker (pour Supabase en local).

```bash
cd apps/boussole-decision
npm install
npx supabase start          # base + authentification + boîte mail de test (http://127.0.0.1:54324)
cp .env.example .env.local  # puis y coller l'URL et la clé « publishable » affichées par supabase start
npm run dev                 # http://localhost:3000/boussole-decision/
```

Pour devenir coach en local : s'inscrire avec `BOUSSOLE-TEST-2026`, puis
`psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "select public.promote_to_coach('ton@email.fr')"`.

### Vérifications

```bash
npm run lint
npm run typecheck
npm test          # tests unitaires (Vitest)
npm run test:db   # tests de sécurité SQL, sur un Postgres local (psql/createdb)
```

## Ma Cible

Outil gratuit de Magic Humans : à partir du Talent Unique d'une personne qui connaît son talent (entrepreneur ou indépendant), une IA experte en marketing l'aide à affiner son offre et à choisir ses trois cibles. Cahier des charges : `docs/spec-ma-cible.md`.

Cette partie de l'app ne contient pour l'instant que le moteur et la route API (PR 1) : les écrans arrivent avec la PR 2.

- **Adresse de l'outil** (PR 2) : `https://www.magichumans.com/boussole-decision/ma-cible/`, avec une redirection `/ma-cible/`.
- **Route API** : `POST https://www.magichumans.com/boussole-decision/api/ma-cible/` (slash final obligatoire). Deux étapes : `cadrage` (questions ou esquisse) et `resultat`. Corps limité à 16 000 octets, origine contrôlée, réponses en `Cache-Control: no-store`.

### Où est le code

| Quoi | Où |
|---|---|
| Domaine pur : types, limites, validation de l'entrée, ancres `#cible=` / `#q=` / `#b=`, schémas JSON, validation des réponses, nettoyage, grille et scores, **prompts** | `src/domain/maCible/` |
| Appel au modèle par `fetch` (Anthropic, OpenAI ou Gemini, aucun SDK) | `src/lib/ia/fournisseur.ts` |
| Logique de la route (`traiterDemande`), quota, origines acceptées | `src/lib/maCible/` |
| Route | `src/app/api/ma-cible/route.ts` |
| Client Supabase serveur (clé secrète, compteur seulement) | `src/lib/supabase/admin.ts` |
| Compteur anti-abus | `supabase/migrations/20261010000000_ma_cible_quota.sql` |

### Variables d'environnement

À définir dans le projet Vercel `boussole-decision` (serveur uniquement, jamais `NEXT_PUBLIC_`). Le modèle de fichier est dans `.env.example`.

| Variable | Rôle | Défaut |
|---|---|---|
| `MA_CIBLE_FOURNISSEUR` | `anthropic`, `openai` ou `gemini` | `anthropic` |
| `MA_CIBLE_MODELE` | nom exact du modèle chez le fournisseur (obligatoire avec `openai` ; vide avec `gemini` : `gemini-3.8-flash`) | `claude-sonnet-5` |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` | clé du fournisseur choisi | |
| `MA_CIBLE_SEL` | sel de l'empreinte du compteur, 32 caractères au moins (`openssl rand -hex 32`) | |
| `SUPABASE_SECRET_KEY` | clé secrète Supabase (Paramètres → API) pour le compteur partagé | |
| `MA_CIBLE_MAX_IP_CADRAGE` / `MA_CIBLE_MAX_IP_RESULTAT` | appels par IP et par jour | 8 / 3 |
| `MA_CIBLE_MAX_GLOBAL_CADRAGE` / `MA_CIBLE_MAX_GLOBAL_RESULTAT` | appels par jour, tous visiteurs | 600 / 200 |

En production, la route répond `503 config_manquante` si la clé du fournisseur choisi (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY` ou `GEMINI_API_KEY`) ou `MA_CIBLE_SEL` manque. Sans `SUPABASE_SECRET_KEY` (développement local), le compteur reste en mémoire de l'instance. Le jour se compte à Paris.

### Clé Gemini (offre gratuite)

1. Ouvrir [Google AI Studio](https://aistudio.google.com/apikey) et créer une clé API (« Create API key »).
2. La coller dans `GEMINI_API_KEY`, avec `MA_CIBLE_FOURNISSEUR=gemini`.
3. Laisser `MA_CIBLE_MODELE` vide pour `gemini-3.8-flash` (modèle gratuit stable recommandé pour un nouveau projet : entrée et sortie offertes). `gemini-2.5-flash` est aussi gratuit, mais Google en limite l'accès aux projets qui l'utilisaient déjà.

Avec l'offre gratuite, Google peut utiliser les textes envoyés (talent, terrain, réponses) pour améliorer ses produits. Ne pas y mettre de données sensibles. L'offre payante ne sert pas à cet entraînement : fixer alors un plafond de dépense dans la console Google.

### Ce qui est stocké

Rien, à part un compteur anonyme : une empreinte `sha256(sel + jour + IP)`, une date, l'étape et un nombre, effacés au bout de 2 jours. Ni les réponses de la personne, ni le résultat, ni l'adresse IP ne sont stockés ou journalisés. En cas d'échec, `console.error` n'écrit que des codes et des longueurs.

### Mise en place

1. Dans le SQL Editor de Supabase, exécuter `supabase/migrations/20261010000000_ma_cible_quota.sql`.
2. Créer la clé API chez le fournisseur et **fixer un plafond de dépense mensuel dans sa console** (les plafonds par jour bornent déjà la dépense, mais le plafond mensuel protège contre une erreur de réglage).
3. Renseigner les variables ci-dessus dans Vercel, puis redéployer.
4. Avant la première mise en ligne, vérifier dans la documentation du fournisseur le nom exact du modèle et la forme du schéma de sortie (`output_config` chez Anthropic, `responseFormat` chez Gemini : l'API évolue), puis suivre la recette PR 1 du cahier des charges (§17).

### Tester

```bash
npm test                      # tout, dont les tests de Ma Cible (aucun appel réel à l'IA)
npx vitest run src/domain/maCible src/lib/ia src/lib/maCible
npm run test:db               # y compris le compteur : anon ne peut ni lire la table ni appeler la fonction
```

Essai à la main, avec l'app lancée en local (`npm run dev`) et une clé dans `.env.local` :

```bash
curl -X POST http://localhost:3000/boussole-decision/api/ma-cible/ \
  -H 'Content-Type: application/json' -H 'Origin: http://localhost:3000' \
  -d '{"etape":"cadrage","tour":1,"entree":{ ... }}'   # entree : voir ENTREE_EXEMPLE dans src/domain/maCible/exemple.ts
```

## Mise en production

### 1. Supabase

1. Créer un projet sur supabase.com (région Europe, ex. Paris).
2. **SQL Editor** : exécuter, dans l'ordre, les fichiers de `supabase/migrations/`, puis `supabase/seed.sql`.
3. **Authentication → URL Configuration**
   - Site URL : `https://www.magichumans.com/boussole-decision/`
   - Redirect URLs : `https://www.magichumans.com/boussole-decision/**`
4. **Authentication → Emails → Templates** : coller les modèles de `supabase/templates/` (sujets dans `supabase/config.toml`,
   sans les barres obliques inverses devant les guillemets), dont « Change email address » (`email_change.html`) utilisé
   quand un invité sauvegarde son travail. Chaque modèle et chaque sujet contient les trois langues.
5. **Authentication → Sign In / Providers** : activer **Allow anonymous sign-ins** (« Essayer tout de suite »).
6. **Authentication → Emails → SMTP** : brancher un service d'envoi (Brevo, Resend…). Sans cela, Supabase n'envoie
   que quelques emails par heure, ce qui bloque vite les inscriptions et les liens magiques.
7. S'inscrire sur l'outil (le code `BOUSSOLE-TEST-2026` est facultatif), puis dans le SQL Editor :
   `select public.promote_to_coach('ton@email.fr');`
   Le compte devient coach : l'« Espace coach » permet ensuite de créer un code par coaché.

### 2. Vercel (projet séparé du site statique)

1. **Add New → Project**, importer ce dépôt, **Root Directory** : `apps/boussole-decision`.
2. Variables d'environnement : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `NEXT_PUBLIC_SITE_URL=https://www.magichumans.com`.
3. Déployer, puis noter l'adresse du projet (ex. `boussole-decision-xxx.vercel.app`).

### 3. Relais depuis le site principal

Le `vercel.json` à la racine du dépôt relaie le chemin vers le projet (adresse : boussole-decision.vercel.app) :

```json
"rewrites": [
  { "source": "/boussole-decision", "destination": "https://boussole-decision.vercel.app/boussole-decision/" },
  { "source": "/boussole-decision/(.*)", "destination": "https://boussole-decision.vercel.app/boussole-decision/$1" }
]
```

Avec `trailingSlash: true`, une source `/:path*` ne capture pas le slash final : on utilise donc `(.*)`.

Le site statique redirige `/apps/` vers son accueil (voir `vercel.json` à la racine), pour ne pas exposer ce code. Pas de `.vercelignore` à la racine : Vercel l'appliquerait aussi à ce projet et supprimerait son code avant la construction.
