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
├── templates/   Emails d'authentification en français
└── tests/       Tests SQL de sécurité (Postgres nu)
```

### Méthode Magic Humans / MO2I

La terminologie officielle est centralisée dans `src/domain/methodology.ts` (Talent Unique, Contexte Déclencheur,
Mécanisme, Super bénéfice, Anti-Contexte) et utilisée telle quelle dans l'interface.

- Chaque profil porte la phrase de **Talent Unique** : « Je [Mécanisme] dans un environnement où
  [Contexte Déclencheur], afin de [Super bénéfice]. », et l'**Anti-Contexte**.
- Catégories de la matrice : Contexte Déclencheur & Flow · Anti-Contexte & Lignes Rouges · Alignement Valeurs & Culture ·
  Conditions de Vie & QVT · Rémunération & Viabilité Financière (+ catégories personnelles).
- Chaque critère : type `DEALBREAKER` (éliminatoire) ou `WEIGHTED` (poids 1 à 5), direction `TOWARDS` (pour aller vers)
  ou `AWAY_FROM` (pour éviter : on évalue la présence du risque).

### Moteur de calcul (`src/domain/scoring.ts`)

- Satisfaction : `TOWARDS` → valeur évaluée ; `AWAY_FROM` → 100 − présence.
- Score d'alignement global (%) = Σ(poids × satisfaction) / Σ(poids × 100), sur les critères pondérés évalués.
- « Je ne sais pas encore » et cases vides : exclus du calcul, listés « à vérifier ».
- `DEALBREAKER` respecté seulement à 100 % ; sinon l'opportunité est « non conforme » et classée après les autres.
  Inconnu → « à vérifier ».
- Alertes Anti-Contexte : critère `AWAY_FROM` présent à 50 % ou plus ; ligne rouge (`AWAY_FROM` éliminatoire) franchie dès 25 %.

### Accès et sécurité

- Deux rôles : `coach` et `coache`. Inscription **uniquement avec un code d'invitation** (à usage unique, désactivable),
  vérifié dans le formulaire et imposé par la base.
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

## Mise en production

### 1. Supabase

1. Créer un projet sur supabase.com (région Europe, ex. Paris).
2. **SQL Editor** : exécuter, dans l'ordre, les fichiers de `supabase/migrations/`, puis `supabase/seed.sql`.
3. **Authentication → URL Configuration**
   - Site URL : `https://www.magichumans.com/boussole-decision/`
   - Redirect URLs : `https://www.magichumans.com/boussole-decision/**`
4. **Authentication → Emails → Templates** : coller les modèles de `supabase/templates/` (sujets dans `supabase/config.toml`).
5. **Authentication → Emails → SMTP** : brancher un service d'envoi (Brevo, Resend…). Sans cela, Supabase n'envoie
   que quelques emails par heure, ce qui bloque vite les inscriptions et les liens magiques.
6. S'inscrire sur l'outil avec le code `BOUSSOLE-TEST-2026`, puis dans le SQL Editor :
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
