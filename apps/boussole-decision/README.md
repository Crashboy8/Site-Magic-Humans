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
  les catégories par défaut s'affichent dans la langue choisie. Les emails envoyés par Supabase restent ceux configurés
  dans le tableau de bord Supabase (en français). Le lien du quiz ouvre la Boussole dans la langue où le quiz a été passé.

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

## Mise en production

### 1. Supabase

1. Créer un projet sur supabase.com (région Europe, ex. Paris).
2. **SQL Editor** : exécuter, dans l'ordre, les fichiers de `supabase/migrations/`, puis `supabase/seed.sql`.
3. **Authentication → URL Configuration**
   - Site URL : `https://www.magichumans.com/boussole-decision/`
   - Redirect URLs : `https://www.magichumans.com/boussole-decision/**`
4. **Authentication → Emails → Templates** : coller les modèles de `supabase/templates/` (sujets dans `supabase/config.toml`),
   dont « Change email address » (`email_change.html`) utilisé quand un invité sauvegarde son travail.
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
