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

### Accès et sécurité

- Inscription **uniquement avec un code d'invitation** valide : vérifié dans le formulaire, et imposé par la base
  (un déclencheur refuse toute création de compte sans code valide, même en appelant Supabase directement).
- Chaque table porte `user_id` ; les règles RLS limitent chaque personne à ses propres données.
- Le **coach** (rôle `coach`) lit, sans pouvoir les modifier, les données des coachés inscrits avec l'un de ses codes.
  Les coachés en sont informés à l'inscription.
- Une version **finalisée** est verrouillée par la base ; on peut la rouvrir ou la dupliquer.

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
2. **SQL Editor** : exécuter `supabase/migrations/20261003000000_schema.sql`, puis `supabase/seed.sql`.
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

Dans le `vercel.json` à la racine du dépôt, ajouter la réécriture vers l'adresse du projet :

```json
"rewrites": [
  { "source": "/boussole-decision", "destination": "https://<projet>.vercel.app/boussole-decision/" },
  { "source": "/boussole-decision/:path*", "destination": "https://<projet>.vercel.app/boussole-decision/:path*" }
]
```

Le site statique ne publie pas le dossier `apps/` (voir `.vercelignore` à la racine).
