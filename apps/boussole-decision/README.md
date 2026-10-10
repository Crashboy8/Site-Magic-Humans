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
  **Espagnol, lot 1** : le Cibleur (`maCibleEs.ts`, exemples `exempleEs.ts`, `exempleApprofondirEs.ts`, `exempleSalarieEs.ts`, l'IA répond en
  espagnol), Mon espace (`espaceEs.ts`), l'accès client (`clientEs.ts`) et la Boussole Relation (`content/amourEs.ts`) sont écrits en espagnol
  (tuteo). `src/i18n/messages/espagnol.test.ts` échoue s'il reste du français dans un dictionnaire ES. Le Quiz Amour, la page /outils/ et les
  libellés restants du site statique sont le lot 2. La Carte du Talent a son dictionnaire dans `carte-du-talent/js/langues/es.js`.

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

### Accès client (code de Pierre)

- Un compte est **client** quand il a été ouvert ou activé avec un code (`app_users.invitation_code`). Badge
  « Accès client · avec Pierre » dans Mon espace. Un code avec un niveau VIP ouvre en plus ce qui est décrit plus bas.
- Pierre crée un code sur la page `/coach/codes/` (« Codes clients », lien depuis l'Espace coach) : pour une personne ou un groupe, avec, en option, un code
  lisible (MH-CAMILLE) et le lien Notion publié de la fiche du client. « Copier le message » donne un texte prêt à envoyer.
- Le client ouvre `magichumans.com/client/CODE` (redirigé par `vercel.json` vers `/boussole-decision/client/?code=CODE`),
  tape son prénom et son email, et reçoit un lien. Le lien passe par `/mon-espace/activer/` (active le code, garde le
  prénom) puis ouvre l'import de la fiche (`/mon-espace/importer/?accueil=client` : lien Notion, PDF, Word ou « Plus tard »).
  Déjà connecté : un bouton « Activer mon accès client ». Lien expiré ou ouvert sur un autre appareil : retour sur la
  page du code pour en redemander un.
- SQL : `supabase/migrations/20261014000000_acces_client.sql` (`activer_code_client`, `mon_acces_client`,
  `invitation_codes.lien_fiche`). Sans ce SQL, un nouveau compte ouvert avec un code est quand même client ; seuls
  l'activation sur un compte existant et le lien de fiche attendent.
- **Lien d'activation** (`/mon-espace/activer/?code=CODE`, bouton « Copier le lien d'activation ») : connecté·e, le code
  s'active tout de suite ; sans session, la personne arrive sur `/client/?code=CODE`, le code déjà rempli.

### Niveaux VIP, fiche préparée et accord

- Page **`/coach/codes/`** (lien depuis l'Espace coach) : Pierre crée un code, choisit un niveau (`pionnier`, `vip12`,
  `membre`, ou aucun) et la durée de l'accès (1 an par défaut pour vip12 et membre, à vie par défaut pour pionnier,
  ou jusqu'à une date). Colonnes `invitation_codes.niveau` et `invitation_codes.acces_jusqu_au` (null = à vie).
- **Fiche préparée** : pour un code à une seule personne, Pierre dépose la fiche (Word, PDF, export Notion ou page
  collée, lue dans son navigateur). Elle est gardée dans `fiches_preparees`, lisible par le coach du code seul (RLS).
- **Accord** : à la première connexion, Mon espace affiche une case jamais cochée d'avance, « J'accepte que ma fiche
  talent soit stockée dans mon espace ». Cochée, la date est gardée (`app_users.consentement_fiche_at`, posée par
  `accepter_stockage_fiche()`) et la fiche préparée est copiée dans `talent_fiches` (source `coach`). Sans accord, rien
  n'est copié ; « Continuer » sans cocher pose un cookie pour ne pas reposer la question, et l'accord reste possible
  depuis la page Tes données. Une fiche déjà présente n'est jamais écrasée, et une fiche supprimée ne revient pas.
- **`est_vip()`** : vrai pour un compte dont le code porte un niveau et dont l'accès court encore. La route
  `api/ma-cible` l'appelle avec la session : le quota par IP est levé, remplacé par un plafond de sécurité haut compté
  sur le compte (`MA_CIBLE_MAX_VIP`, 100 par défaut).
- **Rejoins un groupe M3** : carte de Mon espace réservée aux comptes VIP (groupes de 3 à 4 personnes, en visio,
  chaque semaine pendant 3 mois). Un clic enregistre la demande (`demandes_groupe_m3`) ; Pierre la voit dans
  l'Espace coach (`demandes_groupe_m3_coach()`). Aucun mail n'est envoyé.
- **Tes données** (`/tes-donnees/`, page publique) : ce qu'on garde, où (Supabase, Union européenne, Irlande), qui y
  a accès (la personne et Pierre), l'accord pour la fiche, l'export JSON de toutes ses données
  (`/mon-espace/donnees/export/`, progression comprise) et la suppression du compte (qui efface aussi la fiche préparée pour son code et la progression).
- SQL : `supabase/migrations/20261017000000_vip_consentement.sql`, rejouable. Sans lui, rien ne casse : pas de case
  d'accord, pas de niveau ni de fiche préparée sur la page des codes, pas de carte M3.

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
| Appel au modèle par `fetch` (Anthropic, OpenAI, Gemini ou Mistral, aucun SDK) | `src/lib/ia/fournisseur.ts` |
| Logique de la route (`traiterDemande`), quota, origines acceptées | `src/lib/maCible/` |
| Route | `src/app/api/ma-cible/route.ts` |
| Client Supabase serveur (clé secrète, compteur seulement) | `src/lib/supabase/admin.ts` |
| Compteur anti-abus | `supabase/migrations/20261010000000_ma_cible_quota.sql` |

### Variables d'environnement

À définir dans le projet Vercel `boussole-decision` (serveur uniquement, jamais `NEXT_PUBLIC_`). Le modèle de fichier est dans `.env.example`.

| Variable | Rôle | Défaut |
|---|---|---|
| `MA_CIBLE_FOURNISSEUR` | `anthropic`, `openai`, `gemini` ou `mistral` | `anthropic` |
| `MA_CIBLE_MODELE` | nom exact du modèle (obligatoire avec `openai` ; vide et `gemini` : `gemini-3.8-flash` ; vide et `mistral` : `mistral-small-latest`) | `claude-sonnet-5` |
| `MA_CIBLE_MODELE_SECOURS` | modèle Gemini plus léger si Gemini est en surcharge, en panne réseau ou trop lent | `gemini-3.5-flash-lite` |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` / `MISTRAL_API_KEY` | clé du fournisseur choisi (`GEMINI_API_KEY` sert aussi de secours quand le fournisseur est `mistral`) | |
| `MA_CIBLE_SEL` | sel de l'empreinte du compteur, 32 caractères au moins (`openssl rand -hex 32`) | |
| `SUPABASE_SECRET_KEY` | clé secrète Supabase (Paramètres → API) pour le compteur partagé | |
| `MA_CIBLE_MAX_IP_CADRAGE` | cadrages réussis par personne et par jour | 30 |
| `MA_CIBLE_MAX_IP_RESULTAT` | résultats réussis par personne et par jour | 15 |
| `MA_CIBLE_MAX_GLOBAL_CADRAGE` / `MA_CIBLE_MAX_GLOBAL_RESULTAT` | appels par jour, tous visiteurs | 2000 / 500 |
| `MA_CIBLE_MAX_IP_SYNTHESE` | lectures de notes réussies par personne et par jour | 5 |
| `MA_CIBLE_MAX_IP_APPROFONDIR` | approfondissements réussis par personne et par jour | 20 |
| `MA_CIBLE_MAX_GLOBAL_SYNTHESE` | lectures de notes par jour, tous visiteurs | 100 |
| `MA_CIBLE_MAX_GLOBAL_APPROFONDIR` | approfondissements par jour, tous visiteurs | 300 |
| `MA_CIBLE_MAX_VIP` | plafond de sécurité d'un compte VIP (`est_vip()`), par étape et par jour, compté sur le compte et non sur l'IP ; jamais plus bas que le quota ordinaire. Le plafond global reste le même | 100 |
| `MA_CIBLE_EMAILS_ILLIMITES` | emails des comptes connectés qui ne consomment aucun quota, ni personnel ni global, séparés par des virgules | |
| `MA_CIBLE_CLE_TEST` | secret (`openssl rand -hex 24`). Ouvrir `/ma-cible/?cle=` suivi de ce secret saute les deux plafonds pour l'onglet | |

Si Vercel a encore `MA_CIBLE_MAX_IP_CADRAGE` et `MA_CIBLE_MAX_IP_RESULTAT` (8 et 3, ou 20 et 10), les passer à 30 et 15, ou les retirer pour prendre les défauts. `MA_CIBLE_MAX_PAR_IP` n'est pas lue.

En production, la route répond `503 config_manquante` si la clé du fournisseur choisi (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` ou `MISTRAL_API_KEY`) ou `MA_CIBLE_SEL` manque. Sans `SUPABASE_SECRET_KEY` (développement local), le compteur reste en mémoire de l'instance. Le jour se compte à Paris. Seule une génération réussie incrémente le compteur. Un échec, un délai ou une connexion coupée avant la réponse ne comptent pas. Si le serveur a fini après que le navigateur a lâché, le résultat est gardé 20 minutes (mémoire de l'instance, et table `ma_cible_reprise` si la migration est appliquée) et « Réessayer » le rend sans nouvel appel.

### Clé Gemini (offre gratuite)

1. Ouvrir [Google AI Studio](https://aistudio.google.com/apikey) et créer une clé API (« Create API key »).
2. La coller dans `GEMINI_API_KEY`, avec `MA_CIBLE_FOURNISSEUR=gemini`.
3. Laisser `MA_CIBLE_MODELE` vide pour `gemini-3.8-flash` (modèle Flash stable de l'offre gratuite). En cas de surcharge (503, 429, 500), de panne réseau ou de délai, le même modèle est relancé une fois, puis `gemini-3.5-flash-lite` (ou `MA_CIBLE_MODELE_SECOURS`).

Avec l'offre gratuite, Google peut utiliser les textes envoyés (talent, terrain, réponses) pour améliorer ses produits. Ne pas y mettre de données sensibles. L'offre payante ne sert pas à cet entraînement : fixer alors un plafond de dépense dans la console Google.

### Mistral en principal, Gemini en secours

1. Créer une clé API dans le [Studio Mistral](https://console.mistral.ai/) (mode gratuit : pas de carte, limites de débit).
2. La coller dans `MISTRAL_API_KEY`, avec `MA_CIBLE_FOURNISSEUR=mistral`.
3. Laisser `MA_CIBLE_MODELE` vide pour `mistral-small-latest` (modèle du quickstart du mode gratuit, sortie JSON par `response_format` de type `json_schema`).
4. Renseigner aussi `GEMINI_API_KEY`. Si Mistral répond 429, un code 5xx ou dépasse son délai, l'appel continue sur Gemini (`gemini-3.8-flash`, puis `gemini-3.5-flash-lite` ou `MA_CIBLE_MODELE_SECOURS`).

### Ce qui est stocké

Le compteur anonyme : une empreinte `sha256(sel + jour + IP)`, une date, l'étape et un nombre, effacés au bout de 2 jours. Les réponses ne sont pas stockées. Un résultat réussi dont le navigateur n'a pas reçu la réponse peut rester 20 minutes dans `ma_cible_reprise` (empreinte de session, pas l'IP en clair), puis il est effacé. L'adresse IP n'est ni stockée ni journalisée. `console.error` n'écrit que des codes, des longueurs, le nom du modèle et le message d'erreur du fournisseur.

### Mise en place

1. Dans le SQL Editor de Supabase, exécuter `supabase/migrations/20261010000000_ma_cible_quota.sql`, puis `supabase/migrations/20261010120000_ma_cible_reprise.sql`.
2. Créer la clé API chez le fournisseur et **fixer un plafond de dépense mensuel dans sa console** (les plafonds par jour bornent déjà la dépense, mais le plafond mensuel protège contre une erreur de réglage).
3. Renseigner les variables ci-dessus dans Vercel, puis redéployer.
4. Avant la première mise en ligne, vérifier dans la documentation du fournisseur le nom exact du modèle et la forme du schéma de sortie (`output_config` chez Anthropic, `responseMimeType` et `responseJsonSchema` chez Gemini, `response_format.json_schema` chez Mistral : l'API évolue), puis suivre la recette PR 1 du cahier des charges (§17).

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

## Où j'en suis ?

Outil : il situe chaque personne sur le parcours accompagné (version 3.3) et lui donne son étape, son niveau Réussir dans le Plaisir, ses points et ses trois prochaines actions. Le parcours se joue comme un jeu : une quête par étape, des points à chaque réponse (Oui 2, En partie 1, Pas encore 0), une médaille à chaque étape franchie, l'échelle des niveaux de 0 à 7.

- **Page publique** : `https://www.magichumans.com/boussole-decision/ou-j-en-suis/`, sans compte, réponses gardées dans le navigateur (clé `ou_j_en_suis_v1`). Lien court `/ou-j-en-suis/` (redirection dans le `vercel.json` du site), carte en haut de `/outils/`.
- **Deux projets en parallèle** : à la question « Quelle est ta situation, ton projet ? », on peut cocher deux cases, une voie entrepreneur (A, C) et une voie salarié (B, D), par exemple des missions de freelance en attendant de décrocher un poste. Cela donne la voie E (hybride), qui existe déjà dans `parcours.json` : les deux branches en même temps. Seule la voie E est enregistrée. Règles dans `src/domain/parcours/choix.ts`.
  - **Freelance qui cherche un poste** (« entrepreneur » et « entrepreneur qui veut redevenir salarié » cochés ensemble) : le point d'attention « Ton contrat de travail » devient « Tes missions en cours : garde du temps pour ta recherche » (clé `point_attention_freelance` de la voie E dans `parcours.json`). La marque est la colonne `freelance` de `parcours_positions` (migration `20261016000000_parcours_positions_freelance.sql`, à coller après la première) ; sans elle, l'outil marche comme avant, sans erreur.
- **Mon espace** : deux colonnes sur ordinateur (les outils à gauche, « Ta voie, tu es ici » à droite), une colonne sur téléphone (le parcours d'abord). Même moteur que la page publique.

### Où est le code

| Quoi | Où |
|---|---|
| Le parcours (sans `exemples_internes`, `trous_connus`, `sources` ni `statut`) | `src/domain/parcours/parcours.json` |
| Types, projection publique (seuls les champs affichés partent vers le navigateur) | `src/domain/parcours/types.ts`, `contenu.ts` |
| Moteur pur et testé : bilan d'une étape, position, voie hybride, niveau, module Argent, valeurs, 3 actions | `src/domain/parcours/position.ts` |
| Déroulé des écrans (voie, argent, parallèle, étapes, résultat) | `src/domain/parcours/flux.ts` |
| Lien entre chaque action type et les critères qu'elle aide à passer à Oui (absent du JSON, à relire) | `src/domain/parcours/actionsCriteres.ts` |
| Écrans (client), thème, animations | `src/features/parcours/` |
| Position gardée dans le compte, repli silencieux sur le navigateur si la table n'existe pas | `src/data/parcours.ts`, `src/features/parcours/actions.ts` |
| Table `parcours_positions` (RLS propriétaire), puis sa colonne `freelance` | `supabase/migrations/20261015000000_parcours_positions.sql`, `20261016000000_parcours_positions_freelance.sql` |
| Textes de l'interface (français ; anglais et espagnol à venir, même forme) | `src/i18n/messages/parcours.ts` |
| Barre « Mon parcours · Mes outils » dans l'application (Cibleur, Boussole, pages publiques) | `src/features/espace/BarreParcours.tsx`, `barre.ts` ; textes dans `espace.barre` (FR, EN, ES) |
| Barre « Mon parcours · Mes outils » du site statique (Quiz Talent Unique, Quiz Amour, Carte du Talent) | `js/parcours-barre.js` à la racine du dépôt, testée par `js/parcours-barre.test.mjs` |
| Instantané lu par la barre du site statique (étape, points, jamais les réponses) | `src/features/parcours/instantane.ts` |
| Appel à garder son travail dans le parcours (écran « Quête accomplie », résultat) | `src/features/parcours/Compte.tsx` |

### Passer d'un outil à l'autre

Chaque outil a en haut une barre à deux boutons : **Mon parcours** (en un geste, avec l'étape et les points si la personne a fait le point) et **Mes outils** (les six outils, celui qui est ouvert est marqué « Tu es ici », et de quoi créer son compte). Sans compte, « Mon parcours » mène à `/boussole-decision/ou-j-en-suis/` ; avec un compte ou un essai, à Mon espace. Créer le compte ramène ensuite à Mon espace (`?suite=/mon-espace/`).

- **Le site statique** et l'application sont servis sous la même adresse (`www.magichumans.com`) : le script `js/parcours-barre.js` relit dans le navigateur l'instantané `ou_j_en_suis_resume_v1` que l'application écrit avec le profil (étape, points, date), et regarde seulement si le cookie de session `sb-…-auth-token` est là. Rien n'est envoyé nulle part.
- **Ajouter un outil** : le déclarer à trois endroits, `src/features/espace/outils.ts`, `js/parcours-barre.js` (liste `OUTILS`) et `outils/index.html`. Les tests (`npm test`, `node --test js/parcours-barre.test.mjs outils/outils.test.mjs`) vérifient que les adresses, l'ordre, les noms et les couleurs sont les mêmes.
- **Carte du Talent** : ses fenêtres plein écran (création, progrès, saisie) commencent sous la barre grâce à la variable CSS `--mhp-h` que le script pose sur la page (`carte-du-talent/css/ui.css`).
- **Règle d'interface** : seuls les boutons ont un fond plein, un contour net et un relief. Une information (étape, points, « Tu es ici », « Clé ») est du texte avec son icône, sans capsule ni rond (composant `Info`, `src/features/parcours/Habillage.tsx`) : sur téléphone, tout ce qui est arrondi et coloré se touche.

### Mettre à jour le parcours

Remplacer `parcours.json` par la nouvelle version, en retirant `exemples_internes`, `trous_connus`, `sources` et `statut`, puis lancer `npm test` : un test échoue si ces clés reviennent, et un autre si une note de travail (nom d'accompagné, « Proposition », « à valider », source interne) se glisse dans un texte affiché. Le moteur lit les identifiants des étapes et des critères : si un identifiant change, mettre à jour `actionsCriteres.ts` (le test le signale).

## Ton aventure (progression)

Un seul jeu relié au compte : le jeu `talent-game/` (site statique) et les points de « Où j'en suis ? » remplissent la même progression, une ligne par compte dans la table `progression` (`user_id`, `xp`, `niveau`, `badges`, `serie_jours`, `mis_a_jour`). RLS : chaque personne ne voit et ne modifie que la sienne. Pas de classement, rien n'est montré à une autre personne, pas même au coach.

- **XP** : points du jeu + points de « Où j'en suis ? ». Une quête validée ajoute ses points ; un enregistrement de « Où j'en suis ? » ajoute (ou retire) l'écart de points avec la position d'avant. « Repartir à zéro » dans le jeu ne garde que les points de « Où j'en suis ? ».
- **Niveau** : le code du niveau Réussir dans le Plaisir de la position (0 à 7, avec 5A et 5B ; vide au point de départ).
- **Badges** : ceux du jeu, à 1, 50, 150 et 300 XP. Un badge gagné reste gagné (sauf « Repartir à zéro »).
- **Série de jours** : jours d'affilée où la personne a gagné des points ou répondu, comptés à l'heure de Paris. Elle tient tant qu'elle a joué aujourd'hui ou hier.
- **Sans compte**, ou en essai sans compte : tout reste dans le navigateur, rien n'est envoyé. **À la première connexion**, Mon espace (ou le jeu) reprend les points gardés dans le navigateur (clé `talent_game_progression_v1`) : ils s'ajoutent à ceux du compte, aucun n'est perdu. « Où j'en suis ? » reprend déjà la position du navigateur quand elle est plus récente.
- **Mon espace** : bloc « Ton aventure » (niveau, XP, prochain badge, série de jours, badges gagnés, bouton vers le jeu), mis à jour après chaque enregistrement de « Où j'en suis ? ».
- **Tes données** : la progression est dans l'export JSON (`progression`) et part avec la suppression du compte.
- SQL : `supabase/migrations/20261018000000_progression.sql`, rejouable. Sans lui, rien ne casse : le jeu et « Où j'en suis ? » gardent tout dans le navigateur, et Mon espace n'affiche pas le bloc.

| Quoi | Où |
|---|---|
| Règles pures : badges, série, fusion avec le jeu, écart de points, lecture de ce que le jeu envoie | `src/domain/progression.ts` |
| Points et niveau d'une position de « Où j'en suis ? » | `src/domain/parcours/resume.ts` |
| Lecture et écriture de la table | `src/data/progression.ts`, `src/features/progression/serveur.ts` |
| Route du jeu (GET lit, POST envoie ; origine contrôlée, `Cache-Control: no-store`) | `src/app/api/progression/route.ts`, `src/lib/progression/traitement.ts` |
| Bloc « Ton aventure », reprise du navigateur, actions | `src/features/progression/` ; textes dans `espace.aventure` (FR, EN, ES) |
| Le jeu : clé du navigateur, mêmes badges, envois un par un | `talent-game/js/progression.js`, `talent-game/js/compte.js` (test : `node --test talent-game/js/progression.test.mjs`) |

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
