# Le Cibleur V2b : plus de cibles, portraits, notes de terrain, lien avec la Boussole

Cahier des charges technique, version 1 du 8 octobre 2026. À ranger dans le dépôt sous `docs/cibleur-v2b-spec.md` (PR 1).
Application : `apps/boussole-decision` (dépôt `Crashboy8/Site-Magic-Humans`), en ligne sur https://www.magichumans.com/boussole-decision/ma-cible/.
Base de départ : `main` à `4fd50f6` (V2a en ligne : barre d'étapes cliquable, sommaire collant, ancres, historique de 10 résultats, export, pastilles « Hypothèse de l'IA »).

Ce document est écrit pour qu'un agent de code n'ait presque rien à décider. Quand un point n'est pas couvert, il suit le code existant de V2a et le cahier des charges v1 (`docs/spec-ma-cible.md`), sans inventer de fonctionnalité.

---

## 0. En bref

V2b ajoute cinq choses, sans toucher au parcours en 5 étapes :

1. **Tes idées de cibles** : à l'étape « Ton terrain », la personne peut écrire jusqu'à 8 cibles qu'elle a déjà en tête. L'IA les étudie toutes : chacune devient une des 3 cibles ou une « autre piste », avec la raison.
2. **D'autres pistes** : l'esquisse et le résultat montrent, en plus des 3 cibles, 2 à 6 autres pistes avec un score pressenti. Le bouton « Creuser cette piste » en fait une cible complète (3 au plus par résultat).
3. **Le portrait complet** : sur chaque cible, le bouton « Faire son portrait complet » donne un portrait vivant (prénom fictif, journée type, le jour où elle cherche de l'aide), ses douleurs avec ses mots, ses objections et quoi répondre, ce qui la fait choisir, où elle s'informe, et les salons, événements et lieux où la croiser, chacun avec un bouton « Chercher sur Google ».
4. **Tes notes de terrain** : la personne colle ou importe ses notes d'entretiens (par exemple avec d'anciens clients). Un avertissement de confidentialité simple s'affiche avant. L'IA en tire une synthèse : douleurs, déclencheurs, objections, mots employés, et les phrases exactes des clients (vérifiées mot pour mot par le code). Les cibles et les portraits s'appuient ensuite sur cette synthèse, et le résultat affiche « Ce que disent tes clients ».
5. **Le lien avec la Boussole de décision** : « Comparer mes cibles dans la Boussole » crée, sans compte, une Boussole où les cibles sont les opportunités, le Talent Unique est repris, et les notes du Cibleur sont déjà reportées.

Coût IA : le parcours de base garde le même nombre d'appels (cadrage puis résultat). Les nouveaux appels sont tous à la demande, un seul à la fois : lecture des notes (1 appel) et approfondissement (1 appel par portrait ou par piste creusée). Chaque appel réussi compte dans une limite du jour par personne. Rien d'autre ne change côté fournisseur (Gemini gratuit, même modèle, même réflexion par défaut).

---

## 1. Ce que fait V2a aujourd'hui (lu dans le code, à ne pas casser)

| Sujet | Où | Ce qu'il faut savoir |
|---|---|---|
| Parcours | `src/features/maCible/etat.ts` | Étapes `accueil, talent, terrain, questions, esquisse, resultat`. Réducteur pur. Toute modification du talent ou du terrain invalide le cadrage (`invalider`) et marque le résultat comme périmé (`marquerResultat`). |
| Entrée | `src/domain/maCible/types.ts`, `entree.ts`, `limites.ts` | `EntreeMaCible { v: 1, langue, source, talent, terrain, reponses }`. Textes libres jusqu'à 2 000 caractères. `TAILLE_MAX_CORPS = 120_000` octets. |
| Appels IA | `src/lib/maCible/traitement.ts` | Deux étapes : `cadrage` (tours 1 à 3) et `resultat`. Une relance au plus avec les erreurs de validation. `MAX_TOKENS = { cadrage: 1_500, resultat: 9_000 }` (ignoré par Gemini, qui reçoit toujours `maxOutputTokens: 65_536` car la réflexion y est décomptée). `DELAI_MS = { cadrage: 90_000, resultat: 240_000 }`. Réponse en flux avec battements (`battements.ts`), `maxDuration = 300`. Délai client 270 s (`api.ts`). |
| Fournisseur | `src/lib/ia/fournisseur.ts` | `MA_CIBLE_FOURNISSEUR` (défaut du code : `anthropic` ; en production : `gemini`). Gemini : modèle `gemini-3.8-flash` (ou `MA_CIBLE_MODELE`), secours `gemini-3.5-flash-lite` (ou `MA_CIBLE_MODELE_SECOURS`), 60 % du délai au modèle principal, une relance après 3 s sur 429/500/503/réseau, repli sans schéma sur HTTP 400, puis le modèle de secours. Schéma JSON passé par `responseJsonSchema` (nettoyé par `schemaPourGemini`). |
| Limite du jour | `src/lib/maCible/quota.ts`, migrations `20261010000000`, `20261010120000`, `20261010200000` | Table `ma_cible_quota (cle, jour, etape, n)` avec `check (etape in ('cadrage','resultat'))`. Fonctions `ma_cible_autoriser` (lit) et `ma_cible_consommer` (incrémente, seulement après une génération réussie). Défauts : 30 cadrages et 15 résultats par empreinte IP et par jour, 2 000 et 500 au total. Variables `MA_CIBLE_MAX_IP_*`, `MA_CIBLE_MAX_GLOBAL_*`. Hors limite : `MA_CIBLE_EMAILS_ILLIMITES` (email de la session Supabase) ou `MA_CIBLE_CLE_TEST` (en-tête `x-ma-cible-test`, paramètre `?cle=`). Si la fonction SQL échoue : lecture et écriture directes dans la table, puis compteur en mémoire. |
| Reprise | `src/lib/maCible/reprise.ts`, table `ma_cible_reprise` | Un résultat réussi est gardé 20 minutes au plus pour un « Réessayer » après coupure (clé = empreinte de la session et de la demande). |
| Prompts | `src/domain/maCible/prompt.ts` | `PROMPT_COMMUN` (rôle, méthode Magic Humans, règles de qualité 1 à 13), `GRILLE_TEXTE`, `promptCadrage(tour)`, `PROMPT_RESULTAT`, `messageUtilisateur` (données entre `<donnees>` et `</donnees>`, `<` et `>` remplacés). |
| Validation | `validation.ts`, `qualite.ts`, `nettoyage.ts`, `scores.ts` | Validation tolérante (texte trop long coupé, tableau trop long tronqué, compteur `reparations`). Contrôles de qualité déterministes. Score sur 10 calculé par le code (urgence 30 %, paiement 25 %, accès 20 %, plaisir 25 %), plaisir de 2 ou moins classé en dernier. |
| Stockage | `stockage.ts` (`ma_cible_v1`), `historique.ts` (`ma_cible_historique_v1`, 10 entrées) | Lecture tolérante : un champ manquant prend sa valeur par défaut. Le prénom ne quitte jamais le navigateur. |
| Résultat | `Resultat.tsx`, `CarteCible.tsx`, `SommaireResultat.tsx`, `export.ts` | Ancres `#offre`, `#cible-1`, `#cible-1-douleur`, `#cible-1-lieux`, `#cible-1-messages`, `#cible-1-test`, `#anti-cible`, `#plan`, `#hypotheses`, `#appel`. Encart Boussole qui pointe simplement vers `/boussole-decision/`. |
| Textes | `src/i18n/messages/maCible.ts` | Le français fait foi. `en` et `es` recopient `fr` sauf le nom de l'outil. |

---

## 2. Périmètre

### 2.1 Dans V2b
- Idées de cibles de la personne (8 au plus), couverture garantie par le code.
- Autres pistes dans l'esquisse et le résultat, score pressenti, « Creuser cette piste » (3 au plus).
- Portrait complet à la demande, pour chaque cible (y compris les pistes creusées).
- Notes de terrain : collage ou import `.txt`, `.md`, `.csv`, masquage automatique, avertissement, synthèse, phrases exactes vérifiées.
- Lieux : bouton « Chercher sur Google » partout où un lieu a une recherche (résultat et portrait), sans appel IA.
- Lien « Comparer mes cibles dans la Boussole » avec création automatique.
- Sommaire, ancres, export, historique et impression étendus aux nouveaux blocs.
- Habillage coloré des nouveaux blocs (icônes, couleurs, petites animations), mobile d'abord.

### 2.2 Hors V2b
- Pas de vrais noms de salons ni de dates (voir décision 1 en §20). Pas de recherche Google branchée à l'IA.
- Pas d'import `.docx` ni `.pdf` (on copie-colle le texte).
- Pas de version payante de l'IA (prévue plus tard ; le texte de confidentialité l'annonce).
- Pas de compte obligatoire, pas d'enregistrement des notes ni des résultats sur le serveur.
- Pas de traduction anglaise ou espagnole des nouveaux textes (même règle que V1 : `en` et `es` recopient `fr`).
- Pas de changement du modèle, de la réflexion Gemini, de l'adresse Calendly ni des limites existantes.

---

## 3. Règles à respecter dans les trois PR

1. Textes de l'interface en français naturel, tutoiement, sans anglicisme inutile, **sans tiret cadratin ni demi-cadratin** (ni dans les textes, ni dans les prompts). Les textes de ce document sont à recopier tels quels dans `src/i18n/messages/maCible.ts` (ou `src/content/depuisCibleur.ts` pour la page Boussole).
2. Aucun nouveau paquet npm. Les icônes sont des SVG en ligne (§15.2).
3. Aucune donnée saisie dans les journaux : seulement des codes, des longueurs et des compteurs (même règle que `echec()` dans `traitement.ts`).
4. Les notes de terrain brutes ne sont jamais écrites dans `localStorage`, `sessionStorage`, la base ou la table de reprise. Seule la synthèse est gardée, dans le navigateur. La table `ma_cible_reprise` ne garde jamais une réponse `synthese` (§7.6).
5. Tout ce qui vient de l'IA reste marqué : pastilles « Hypothèse de l'IA », « Estimation de l'IA », et les nouvelles « Imaginé par l'IA » et « Tiré de tes notes ».
6. Les anciennes données du navigateur (résultats V2a, historique) restent lisibles : chaque nouveau champ absent prend sa valeur par défaut (`[]`, `null`, `{}`).
7. Icône et texte toujours sur la même ligne (`flex items-start gap-3`, icône `shrink-0`), jamais une icône seule au-dessus d'un grand blanc. Retour de Pierre sur le Quiz Amour, à appliquer partout ici.
8. `npm test`, `npm run lint` et `npm run typecheck` passent dans `apps/boussole-decision` à chaque PR.

---

## 4. Parcours, écran par écran

Le parcours reste : Accueil, 1. Ton talent, 2. Ton terrain, 3. Précisions (si besoin), 4. Esquisse, 5. Résultat. Les nouveautés sont toutes facultatives : quelqu'un qui ne les utilise pas vit exactement le parcours V2a, avec en plus les « autres pistes » et les boutons de recherche.

### 4.1 Accueil (petite retouche)
- La liste « Comment ça se passe » garde ses 5 points. Le point 2 devient : « Tu décris ton terrain : ce que tu proposes, à qui, comment. Tu peux ajouter tes idées de cibles et tes notes d'entretiens. »
- Le point 5 devient : « Tu reçois ton résultat complet, d'autres pistes à creuser et ton plan sur 30 jours. »
- L'encart de confidentialité gagne un point (§17.1).

### 4.2 Étape 2 « Ton terrain » : deux blocs facultatifs en bas, avant le ton des messages

Ordre final de l'écran : offre, marché, expérience, clients passés, formats, zone, prix, **Tes idées de cibles**, **Tes notes de terrain**, ton des messages, prénom, bouton « Voir ce que l'IA en pense ».

#### Bloc A « Tes idées de cibles » (couleur miel, icône `cible`)
- Titre : « Tu as déjà des cibles en tête ? » + « (facultatif) ».
- Aide : « Écris-les, une par case. L'IA les étudie toutes et te dit lesquelles creuser en premier. »
- 1 zone de texte au départ, bouton « Ajouter une idée » jusqu'à 8. Chaque zone grandit avec le contenu (2 lignes visibles au minimum, le texte n'est jamais coupé). À sa droite, sur la même ligne, un bouton icône × de 44 px (`aria-label="Retirer cette idée"`).
- Placeholder : « Par exemple : les militaires qui quittent l'armée ». Exemple sous le premier champ : « Exemple : les cadres de 35 à 55 ans qui veulent changer de métier. »
- Limites : 8 idées, 120 caractères chacune (compteur affiché à partir de 100). Les champs vides sont ignorés à l'envoi. Doublons (casse ignorée) retirés par `normaliserListe`.
- Une modification d'idée est une modification du terrain (invalide le cadrage, marque le résultat périmé).

#### Bloc B « Tes notes de terrain » (couleur lilas, icône `carnet`)
État fermé (carte) :
- Titre : « Tu as parlé à des clients ? Fais parler tes notes » + « (facultatif) ».
- Texte : « Colle les notes de tes entretiens, par exemple avec d'anciens clients. L'IA en tire ce qui revient, avec leurs mots exacts. Tes cibles seront plus justes. »
- Bouton secondaire : « Ajouter mes notes ».

État ouvert (la carte s'agrandit sur place, pas de fenêtre par-dessus) :
1. L'avertissement de confidentialité, toujours visible, au-dessus des champs (texte exact en §17.2), dans un encadré bleu ciel avec l'icône `cadenas`.
2. Jusqu'à 5 notes. Chaque note : champ « Titre (facultatif) » (60 caractères, placeholder « Entretien avec une ancienne cliente ») et zone de texte (placeholder « Colle ici tes notes ou ce que t'a dit la personne… », hauteur 8 lignes, grandit jusqu'à 16). Boutons « Ajouter une autre note » (jusqu'à 5) et « Retirer cette note ».
3. Bouton « Importer un fichier (.txt, .md, .csv) » : `<input type="file" accept=".txt,.md,.csv,text/plain,text/markdown,text/csv" multiple>`. Chaque fichier remplit une nouvelle note (titre = nom du fichier sans extension, 60 caractères). Lecture par `File.text()` dans le navigateur ; rien n'est envoyé avant le clic sur le bouton d'analyse. Un fichier dont le type n'est pas texte, ou qui contient des caractères nuls, est refusé (§16).
4. Compteur global sous les notes : « 12 340 caractères sur 20 000 ». Au-delà de 20 000, le compteur passe en rouge et le bouton d'analyse est désactivé avec le message d'erreur du §16.
5. Masquage automatique (§9.1) appliqué au relâchement d'un champ (`onBlur`) et à l'import. Si quelque chose a été masqué, une ligne s'affiche : « On a masqué 2 adresses mail, 1 numéro de téléphone et 1 lien. » (singulier et pluriel accordés, éléments à zéro omis).
6. Case à cocher obligatoire : « J'ai retiré les noms et tout ce qui permettrait de reconnaître quelqu'un. »
7. Bouton principal : « Faire lire mes notes à l'IA » (icône `etincelles`). Désactivé tant que la case n'est pas cochée ou que les notes font moins de 200 caractères au total. Sous le bouton : « Environ 30 secondes. Compte pour 1 lecture sur les 5 du jour. » (le chiffre est le maximum du jour, `MA_CIBLE_MAX_IP_SYNTHESE` passé par la page, défaut 5).
8. Pendant l'appel : chargeur en ligne dans la carte (§15.4) avec les messages « L'IA lit tes notes… », « Elle repère ce qui revient souvent… », « Elle garde les phrases qui comptent… » (rotation toutes les 6 s). Les champs sont désactivés.
9. Réussite (`statut: "ok"`) : les notes brutes sont vidées de la mémoire de la page, la carte affiche la synthèse et le message : « C'est lu. Tes notes brutes ont été effacées de la page : seule cette synthèse est gardée, dans ton navigateur. »
10. `statut: "inutilisable"` : les notes restent dans les champs, message d'erreur douce : « L'IA n'a pas trouvé de propos de clients dans ces notes. » suivi du `message` de l'IA.

Carte « Ce que disent tes notes » (après réussite, couleur lilas) :
- En-tête : icône `carnet`, titre « Ce que disent tes notes », sous-titre « Lu le 9 octobre 2026 · 3 notes ».
- « En bref » : `resume`.
- « Qui sont ces personnes » : `profils` (liste).
- « Ce qui leur pèse » : `douleurs`, chacune avec une pastille de fréquence : « Revient souvent », « Revient parfois », « Une fois ».
- « Leurs mots exacts » : `verbatims` en citations (guillemets français, italique), pastille « Tiré de tes notes », bouton « Retirer » (icône croix, `aria-label="Retirer cette phrase"`). Retirer une phrase la supprime de la synthèse (modification du terrain).
- « Ce qui les a poussées à chercher de l'aide » : `declencheurs`.
- « Ce qui les fait hésiter » : `objections`.
- « Les mots qu'elles emploient » : `motsCles` en petites pastilles.
- Boutons : « Lire d'autres notes » (rouvre l'état ouvert, vide ; la nouvelle synthèse remplacera l'ancienne ; confirmation au clic sur « Faire lire mes notes à l'IA » : « Ta synthèse actuelle sera remplacée. On continue ? ») et « Effacer cette synthèse » (confirmation : « Effacer la synthèse de tes notes ? Tes cibles ne s'appuieront plus dessus. »).
- Une rubrique vide n'est pas affichée.

### 4.3 Étape 3 « Précisions » : inchangée
Seul le prompt change (§8.3) : l'IA pose moins de questions quand la synthèse répond déjà.

### 4.4 Étape 4 « Ça te ressemble ? »
- Sur chaque cible issue d'une idée (`depuisIdees` non vide) : pastille miel « Ton idée ».
- Nouvelle section après « Qui éviter » et avant « Ce que l'IA a supposé » : « Tes autres pistes » (icône `couches`, couleur miel). Intro : « L'IA les garde sous le coude. Tu pourras les creuser une fois ton résultat prêt. »
- Chaque piste : nom, pastille B2B ou B2C, pastille « Ton idée » si besoin, `enUneLigne`, puis « Pourquoi pas dans tes 3 cibles : » + `raison`. Bouton tertiaire « Je la préfère » : remplit le champ « Une cible à laquelle tu penses et qui manque ? » avec « Je préfère cette piste : [nom]. », fait défiler jusqu'à ce champ et y place le focus. Le reste du mécanisme (verdicts, nouvelle esquisse) ne change pas.
- Section masquée si `autresPistes` est vide.

### 4.5 Écran d'attente du résultat : un message de plus
La liste `attente.resultat` gagne, en avant-dernière position : « Elle garde d'autres pistes sous le coude… ».

### 4.6 Étape 5 « Ton résultat »
Ordre des sections (nouveautés en gras) :
1. En-tête (inchangé) ; la rangée de boutons gagne **« Comparer dans la Boussole »** (icône `boussole`) après « Télécharger (.md) ».
2. Ton offre affinée.
3. Les 3 cartes cibles. Dans chaque carte, ordre des blocs : Qui c'est, Sa douleur probable, **Ce que disent tes clients**, Ce que ton talent lui apporte, Ta promesse, Ton offre pour elle, Ton pitch, Pourquoi cette cible, Un cas imaginé, Où la rencontrer, Ta recherche LinkedIn, Ton premier message, Ton test terrain, **Son portrait complet**.
   - Pastille miel « Ton idée » dans l'en-tête si `depuisIdees` n'est pas vide.
   - **Ce que disent tes clients** (ancre `#cible-1-clients`, icône `bulle`, couleur lilas) : seulement si `verbatims` n'est pas vide. Citations reprises de la synthèse par leur identifiant, pastille « Tiré de tes notes ». Un identifiant qui n'existe plus (phrase retirée depuis) n'est pas affiché.
   - **Où la rencontrer** : chaque lieu a un seul bouton compact « Chercher sur Google » (icône `loupe` sur la même ligne que le texte) qui ouvre `https://www.google.com/search?q=` + `encodeURIComponent(recherche)` dans un nouvel onglet (`target="_blank" rel="noopener noreferrer"`). Les annuaires ne se répètent pas sous chaque lieu : un petit encart en bas de la section, « Pour voir tous les salons à venir : », montre une seule fois « Voir l'annuaire des salons » et « Salons à l'international », côte à côte à partir de 640 px, empilés sur mobile, icône sur la même ligne. Ces liens et le bouton Google sont masqués à l'impression (`data-ecran-seul`). Les deux adresses vivent dans une seule constante, `ANNUAIRES_SALONS` (`src/domain/maCible/annuaires.ts`) : `france` = `https://salonsenfrance.fr/` (recherche par secteur, ville et date ; le site répond 403 aux robots, il s'ouvre dans un navigateur) et `international` = `https://www.eventseye.com/fairs/c1_trade-shows_france.html`. On ne recopie pas ces adresses ailleurs. La note existante « Ce sont des types de lieux… » reste.
   - **Son portrait complet** (ancre `#cible-1-portrait`) : §4.7.
4. **« D'autres pistes »** (ancre `#pistes`, couleur miel, icône `couches`) : §4.8.
5. **« Pistes creusées »** (ancres `#piste-p1`, `#piste-p2`…) : une carte cible complète par piste creusée, même composant `CarteCible`, avec le rang affiché « Piste creusée » au lieu de « Cible prioritaire ». Repliée par défaut, sauf celle qui vient d'arriver. Le portrait y est déjà affiché.
6. Anti-cible, Plan 30 jours, Ce que l'IA a supposé, Envie d'en parler ? (inchangés).
7. **Encart Boussole revu** (couleur sauge, icône `boussole`) : titre « Tu hésites entre tes cibles ? », texte « Compare-les dans la Boussole de décision. Tes cibles y sont déjà, avec leurs notes du Cibleur : tu n'as plus qu'à ajuster, critère par critère. », bouton « Comparer mes cibles dans la Boussole ». Lien construit par `lienBoussoleCibles` (§13.1), même onglet.

Le sommaire (`SommaireResultat`) gagne :
- sous chaque cible : « Ce que disent tes clients » (si présent) et « Son portrait » (si fait) ;
- après la dernière cible : « D'autres pistes » ;
- une entrée par piste creusée : « 4. [nom] · 6,8/10 » (numérotation à la suite des 3 cibles), avec les mêmes sous-entrées que les cibles.

### 4.7 Bloc « Son portrait complet »
Avant l'appel (carte corail clair, icône `personne`) :
- Titre « Son portrait complet ».
- Texte : « Qui elle est vraiment, sa journée, ce qui la décide, ce qui la freine, et où la croiser : salons, événements, groupes. »
- Bouton « Faire son portrait complet » ; dessous : « Environ 30 secondes. Compte pour 1 approfondissement sur les 20 du jour. » (maximum du jour passé par la page, défaut 20).
- Si un autre appel est en cours : bouton désactivé et texte « Un approfondissement est déjà en cours. Attends qu'il soit prêt. »

Pendant l'appel : chargeur en ligne avec « L'IA fait son portrait… », « Elle imagine sa journée… », « Elle prépare quoi répondre à ses objections… », « Elle cherche où la croiser… ».

Après (apparition douce, §15.4) :
- En-tête : pastille ronde de 48 px (dégradé corail vers miel) avec l'initiale du prénom en blanc, puis « [Prénom], [âge] » et la pastille « Imaginé par l'IA » (aide : « Un portrait inventé pour t'aider à te la représenter. Ce n'est pas une vraie personne. »).
- « Sa situation » : `situation`.
- « Sa journée » : `journee`.
- « Le jour où elle cherche de l'aide » : `declencheur`.
- « Ce qui allume ton talent chez elle » : `pourToi` (icône `etincelles`, fond sauge clair).
- « Ce qu'elle a déjà essayé » : liste.
- « Ce qui lui pèse » (icône `eclair`, couleur framboise) : par douleur, `titre` en gras, intensité en 5 points (§15.3, `aria-label="Intensité 4 sur 5"`), `detail`, puis « Comme elle le dirait : » + `sesMots` en italique, pastille « Imaginé par l'IA ». Si `verbatim` désigne une phrase de la synthèse, on ajoute dessous « Ce qu'un client t'a vraiment dit : » + la citation, pastille « Tiré de tes notes ».
- « Ce qui la fait hésiter, et quoi répondre » : objection en gras, puis « Tu peux répondre : » + réponse.
- « Ce qui la fera choisir » : liste.
- « Où elle s'informe » : liste.
- « Où la croiser » (icône `epingle`, couleur vert d'eau) : une carte par lieu, icône selon la catégorie (`salon` : `chapiteau` ; `evenement` : `calendrier` ; `club` : `groupe` ; `en_ligne` : `ecran` ; `lieu` : `epingle` ; `media` : `journal`), libellé (« Salon », « Événement », « Club ou réseau », « En ligne », « Lieu », « Média »), `type`, `pourquoi`, « À chercher : « recherche » » et le bouton « Chercher sur Google ». Note sous la liste : « Ce sont des types de lieux. Vérifie les noms, les dates et les prix avec ta recherche. »
- Bouton « Copier ce portrait ».

Le portrait reste attaché au résultat (stockage §14). Pas de bouton « Refaire le portrait » (économie d'appels).

### 4.8 Section « D'autres pistes »
- Titre « D'autres pistes », intro : « Moins prioritaires d'après l'IA, mais à garder en tête. Creuse celles qui t'attirent : l'IA en fait une cible complète, avec son portrait. »
- Une carte par piste, triées par score pressenti décroissant : nom, pastille B2B ou B2C, pastille « Ton idée » si besoin, score pressenti « 6,1/10 » avec la pastille « Estimation de l'IA », `enUneLigne`, « Pourquoi pas dans tes 3 cibles : » + `raison`, mini-barres des 4 notes (§15.3).
- Si plaisir ≤ 2 : « Attention : ton talent risque de s'y user. »
- Bouton « Creuser cette piste » ; dessous : « Environ 1 minute. Compte pour 1 approfondissement. »
- Après 3 pistes creusées, les autres boutons sont désactivés avec : « Tu as creusé 3 pistes, c'est le maximum pour un résultat. »
- Une piste creusée garde sa carte ici, avec le bouton « Voir la piste creusée » (lien vers `#piste-pN`) à la place de « Creuser cette piste ».
- Si le score de la piste creusée dépasse celui de la cible prioritaire : « Cette piste fait mieux que ta cible prioritaire (7,8 contre 7,4). Pense à la tester en premier. »
- Chargeur pendant l'appel : « L'IA creuse cette piste… », « Elle note l'urgence, le budget, l'accès et ton plaisir… », « Elle écrit ton premier message… », « Elle fait son portrait… ».

### 4.9 Historique, reprise, impression
- Un résultat repris de l'historique garde ses portraits et pistes creusées.
- Lecture seule d'un ancien résultat (bandeau « Résultat du … ») : les boutons « Faire son portrait complet » et « Creuser cette piste » sont masqués ; on voit ce qui a déjà été fait. « Comparer dans la Boussole » reste disponible.
- L'impression déplie tout et affiche portraits et pistes creusées ; les boutons « Chercher sur Google » et les boutons d'appel sont masqués (`data-ecran-seul`).

---

## 5. Données

### 5.1 Types ajoutés ou modifiés (`src/domain/maCible/types.ts`)

```ts
export type IdCible = "c1" | "c2" | "c3" | "c4" | "c5" | "c6";   // c4 à c6 : pistes creusées
export type IdCiblePrincipale = "c1" | "c2" | "c3";
export type IdIdee = "i1" | "i2" | "i3" | "i4" | "i5" | "i6" | "i7" | "i8";
export type IdPiste = "p1" | "p2" | "p3" | "p4" | "p5" | "p6";
export type IdNote = "n1" | "n2" | "n3" | "n4" | "n5";

export interface Terrain {
  // champs V2a inchangés…
  ciblesEnTete: string[];          // 0 à 8 idées, 120 caractères au plus ; défaut []
}

export interface NoteTerrain { id: IdNote; titre: string; texte: string }

export type Frequence = "souvent" | "parfois" | "une_fois";
export type ThemeVerbatim = "douleur" | "declencheur" | "objection" | "resultat" | "autre";

export interface SyntheseTerrain {
  resume: string;
  profils: string[];
  douleurs: { texte: string; frequence: Frequence }[];
  verbatims: { id: string; note: IdNote; citation: string; theme: ThemeVerbatim }[];  // id : v1, v2… renumérotés par le serveur
  declencheurs: string[];
  objections: string[];
  motsCles: string[];
  nbNotes: number;                 // posé par le serveur
  faitLe: string;                  // ISO, posé par le navigateur à la réception
}

export interface EntreeMaCible {
  v: 1;                            // inchangé : les nouveaux champs ont une valeur par défaut
  langue: Langue;
  source: Source;
  talent: Talent;
  terrain: Terrain;
  reponses: Reponse[];
  synthese: SyntheseTerrain | null; // défaut null
}

export interface PisteEsquisse { id: IdPiste; nom: string; marche: "b2b" | "b2c"; enUneLigne: string; raison: string; depuisIdees: IdIdee[] }
export interface Esquisse {
  offre: string;
  cibles: { id: IdCiblePrincipale; nom: string; marche: "b2b" | "b2c"; enUneLigne: string; pourquoi: string; depuisIdees: IdIdee[] }[];
  antiCible: string;
  hypotheses: string[];
  autresPistes: PisteEsquisse[];   // défaut []
}

export type Note5 = 1 | 2 | 3 | 4 | 5;
export interface NotesPressenties { urgence: Note5; paiement: Note5; acces: Note5; plaisir: Note5 }
export interface AutrePiste extends PisteEsquisse { notes: NotesPressenties }

export interface Cible {
  // champs V2a inchangés…
  depuisIdees: IdIdee[];           // défaut []
  verbatims: string[];             // identifiants v1… de la synthèse, 0 à 3 ; défaut []
}
export interface Resultat {
  // champs V2a inchangés…
  autresPistes: AutrePiste[];      // défaut []
}

export type CategorieLieu = "salon" | "evenement" | "club" | "en_ligne" | "lieu" | "media";
export interface Portrait {
  prenom: string; age: string; situation: string; journee: string; declencheur: string; pourToi: string;
  dejaEssaye: string[];
  douleurs: { titre: string; detail: string; intensite: Note5; sesMots: string; verbatim: string }[];
  objections: { objection: string; reponse: string }[];
  criteresChoix: string[];
  sInforme: string[];
  lieux: { categorie: CategorieLieu; type: string; pourquoi: string; recherche: string }[];
}

export interface LignePiste { id: IdCible; score: number; alertePlaisir: boolean }
/** Ce qui s'ajoute à un résultat après coup. Gardé dans le navigateur avec le résultat. */
export interface Extras {
  portraits: Partial<Record<IdCible, Portrait>>;
  pistes: Partial<Record<IdPiste, { cible: Cible; ligne: LignePiste }>>;
}
export const EXTRAS_VIDES: Extras = { portraits: {}, pistes: {} };
```

`validation.ts` garde `IDS_CIBLE = ["c1","c2","c3"]` pour le résultat principal et l'esquisse. Seule la cible d'une piste creusée utilise `c4` à `c6`. `plan30[].actions[].cible` reste limité à `c1`, `c2`, `c3`, `toutes`. `LigneClassement.id` accepte le type élargi.

### 5.2 Demandes (corps POST) : union `Demande` élargie

```ts
export type Demande =
  | { etape: "cadrage"; tour: 1 | 2 | 3; entree: EntreeMaCible; esquissePrecedente?: Esquisse; corrections?: Corrections }   // inchangé
  | { etape: "resultat"; entree: EntreeMaCible; esquisse: Esquisse; corrections: Corrections }                              // inchangé
  | { etape: "synthese"; langue: Langue; contexte: ContexteSynthese; notes: NoteTerrain[] }
  | { etape: "approfondir"; mode: "portrait"; entree: EntreeMaCible; offre: string; cible: CibleAApprofondir }
  | { etape: "approfondir"; mode: "piste"; entree: EntreeMaCible; offre: string; piste: AutrePiste; idCible: "c4" | "c5" | "c6"; ciblesExistantes: string[] };

export interface ContexteSynthese { mecanisme: string; contexte: string; benefice: string; offre: string }   // chacun 0 à 2 000, facultatif
export interface CibleAApprofondir {
  id: IdCible; nom: string; marche: "b2b" | "b2c";
  portrait: string; douleur: string; ancrage: string; promesse: string;
  lieux: string[];                 // les `type` des lieux déjà donnés, 0 à 4
}
```

### 5.3 Limites (`src/domain/maCible/limites.ts`, ajouts)

```ts
ciblesEnTete: { items: 8, max: 120 },
notes: { items: 5, titre: 60, texteMin: 50, texte: 8_000, total: 20_000, totalMin: 200 },
synthese: { resume: 400, profils: 4, douleurs: 6, verbatims: 12, citation: 240, declencheurs: 4, objections: 4, motsCles: 10, texte: 200, mot: 40 },
offreApprofondir: { max: 240 },
ciblesExistantes: { items: 6, max: 80 },
pistesCreuseesMax: 3,
```
`TAILLE_MAX_CORPS` reste à 120 000 octets (20 000 caractères de notes font au plus 80 000 octets en UTF-8, et la demande `synthese` ne transporte pas l'entrée complète).

### 5.4 Entrée : validation (`entree.ts`)
- `validerEntree` : lit `terrain.ciblesEnTete` avec `normaliserListe(…, 8, 120)` (absent : `[]`), et `synthese` avec la nouvelle fonction `validerSyntheseEntree` (absent ou `null` : `null` ; invalide : erreur `{ champ: "synthese", code: "invalide" }`). `validerSyntheseEntree` applique les limites du §5.3 en coupant (un texte trop long n'est pas une erreur), vérifie les énumérations et que chaque `verbatims[].id` respecte `^v([1-9]|1[0-2])$`.
- Nouvelle fonction `validerNotes(brut)` : 1 à 5 notes, `id` de `n1` à `n5` attribués par le navigateur dans l'ordre, titre ≤ 60, texte de 50 à 8 000 après `normaliser`, total ≤ 20 000 et ≥ 200. Erreurs : `{ champ: "notes[0].texte", code: "trop_court" | "trop_long" | "requis" }`, `{ champ: "notes", code: "trop_long" | "trop_court" }` pour le total.
- Nouvelle fonction `validerContexteSynthese(brut)` : quatre textes facultatifs, 2 000 caractères au plus.
- Demande `approfondir` : `validerEntree(entree)` doit passer ; `offre` de 1 à 240 ; `cible` : textes non vides coupés aux limites du résultat (`nom` 80, `portrait` 500, `douleur` 300, `ancrage` 300, `promesse` 180, `lieux` 4 × 120) ; `piste` validée comme une `AutrePiste` (§10.3) ; `idCible` dans `c4`, `c5`, `c6` ; `ciblesExistantes` : `normaliserListe(…, 6, 80)`.

---

## 6. État du navigateur (`src/features/maCible/etat.ts`)

### 6.1 `Etat` gagne
```ts
extras: Extras;                    // défaut EXTRAS_VIDES
```
(`entree.synthese` et `entree.terrain.ciblesEnTete` vivent dans `entree`.)

### 6.2 Nouvelles actions du réducteur
```ts
| { type: "synthese"; synthese: SyntheseTerrain | null }     // remplace ou efface ; passe par marquerResultat(invalider(...))
| { type: "retirerVerbatim"; id: string }                      // retire de entree.synthese.verbatims ; idem
| { type: "portrait"; id: IdCible; portrait: Portrait }        // extras.portraits[id] = portrait
| { type: "piste"; pisteId: IdPiste; cible: Cible; ligne: LignePiste; portrait: Portrait }
```
- `piste` : ajoute `extras.pistes[pisteId] = { cible, ligne }` et `extras.portraits[cible.id] = portrait`. Refusé (état inchangé) s'il y a déjà 3 pistes creusées ou si `pisteId` est déjà creusée.
- `ciblesEnTete` passe par l'action `terrain` existante (patch).
- `resultat` (nouveau résultat) : `extras` repart de `EXTRAS_VIDES`. L'ancien résultat archivé dans l'historique garde ses `extras`.
- `reprendre` : reçoit aussi `extras` (défaut `EXTRAS_VIDES`).
- Fonction pure `prochainIdPiste(extras): "c4" | "c5" | "c6" | null` : le premier identifiant libre.

### 6.3 Notes brutes
Les notes brutes vivent dans un `useState` local du composant `NotesTerrain`, jamais dans `Etat`, jamais dans le stockage. Elles sont vidées après une synthèse réussie, et perdues si la page est rechargée (comportement voulu, décision 3).

### 6.4 Un seul appel à la fois
`MaCible.tsx` garde `appelEnCours: null | "synthese" | { mode: "portrait"; id: IdCible } | { mode: "piste"; id: IdPiste }`. Tant qu'il n'est pas `null`, tous les boutons qui déclenchent un appel IA sont désactivés (texte d'explication en §4.7). Raison : la limite gratuite de Gemini est d'environ 10 requêtes par minute pour tout le projet.

---

## 7. Route API `POST /boussole-decision/api/ma-cible/`

### 7.1 Contrat (ajouts)

Synthèse :
```jsonc
// requête
{ "etape": "synthese", "langue": "fr", "contexte": { "mecanisme": "…", "contexte": "…", "benefice": "…", "offre": "…" },
  "notes": [ { "id": "n1", "titre": "Entretien 1", "texte": "…" } ] }
// 200
{ "ok": true, "etape": "synthese", "statut": "ok", "message": "", "synthese": { /* SyntheseTerrain sans faitLe */ },
  "masques": { "mails": 0, "telephones": 1, "liens": 0 }, "restant": 4 }
// 200, notes sans propos de clients (compte quand même : l'IA a travaillé)
{ "ok": true, "etape": "synthese", "statut": "inutilisable", "message": "…", "synthese": null, "masques": { … }, "restant": 3 }
```

Portrait :
```jsonc
{ "etape": "approfondir", "mode": "portrait", "entree": { … }, "offre": "…", "cible": { "id": "c2", "nom": "…", … } }
// 200
{ "ok": true, "etape": "approfondir", "mode": "portrait", "id": "c2", "portrait": { /* Portrait */ }, "restant": 19 }
```

Piste :
```jsonc
{ "etape": "approfondir", "mode": "piste", "entree": { … }, "offre": "…", "piste": { /* AutrePiste */ }, "idCible": "c4", "ciblesExistantes": ["…", "…", "…"] }
// 200
{ "ok": true, "etape": "approfondir", "mode": "piste", "pisteId": "p2", "cible": { /* Cible, id c4 */ },
  "ligne": { "id": "c4", "score": 6.8, "alertePlaisir": false }, "portrait": { /* Portrait */ }, "restant": 18 }
```

Erreurs : mêmes codes et statuts que V2a (`entree_invalide` 400, `trop_long` 413, `origine_refusee` 403, `quota_ip` et `quota_global` 429 avec `etape`, `max`, `reessayerApres` et `Retry-After`, `ia_invalide` 502, `ia_indisponible` 503, `config_manquante` 503). Aucun nouveau code.

### 7.2 `lireDemande` (`traitement.ts`)
- `etape` accepte `cadrage`, `resultat`, `synthese`, `approfondir` ; autre valeur : `{ champ: "etape", code: "invalide" }`.
- `approfondir` : `mode` dans `portrait`, `piste`, sinon `{ champ: "mode", code: "invalide" }`.
- Esquisse renvoyée par le navigateur (`esquisseValide`) : accepte `autresPistes` et `depuisIdees` absents (défaut `[]`).

### 7.3 Masquage côté serveur
Pour `synthese`, le serveur réapplique `masquerDonnees` (§9.1) à chaque `titre` et `texte` avant de construire le prompt, et renvoie dans `masques` ce qu'il a lui-même masqué (le navigateur additionne avec ses propres comptes pour l'affichage).

### 7.4 Étapes, délais et jetons
```ts
const MAX_TOKENS = { cadrage: 2_500, resultat: 10_000, synthese: 3_000, approfondir: 6_000 } as const;  // hors Gemini
export const DELAI_MS = { cadrage: 90_000, resultat: 240_000, synthese: 90_000, approfondir: 150_000 } as const;
```
Dans `generer`, le calcul du délai restant (`reste`) s'applique désormais à toutes les étapes (aujourd'hui seulement à `resultat`). `nomSchema` : `cadrage`, `resultat`, `synthese`, `portrait`, `piste`.

### 7.5 Traitement d'une réponse (`traiterTexte`)
- `synthese` : `validerSynthese` (§10.3), puis `verifierVerbatims` (§9.2), renumérotation `v1…vN`, `nbNotes` posé. `statut` `inutilisable` : `synthese: null` et `message` coupé à 300.
- `approfondir` / `portrait` : `validerPortrait`, puis `qualitePortrait` (§9.6) et le filtre du §9.4.
- `approfondir` / `piste` : `validerCible` (extraite de `validerResultat`, `IDS = ["c4","c5","c6"]`, identifiant attendu égal à `idCible`, sinon erreur de structure), `qualiteCible` (partie « par cible » extraite d'`appliquerQualite`, comportement inchangé pour le résultat), `validerPortrait`, `qualitePortrait`, §9.4, puis `ligne = { id, score: scoreSur10(cible.scores), alertePlaisir: cible.scores.plaisir.note <= 2 }`.
- `cadrage` et `resultat` : en plus de V2a, `couvrirIdees` (§9.3), `qualitePistes` (§9.5) et `filtrerVerbatimsCibles` (§9.4).

### 7.6 Reprise
- `reponseReussie` reconnaît `synthese` (champ `statut` présent) et `approfondir` (champ `portrait` présent).
- **Une réponse `synthese` n'est jamais écrite dans `ma_cible_reprise`** (elle contient des phrases de clients). La route passe une dépendance de plus, `repriseSensible` = la reprise en mémoire de l'instance seule (`reprises`), utilisée à la place de `reprise` quand `etape === "synthese"`.

### 7.7 Client (`src/features/maCible/api.ts`)
`ReponseApi` gagne :
```ts
| { ok: true; synthese: Omit<SyntheseTerrain, "faitLe"> | null; statut: "ok" | "inutilisable"; message: string; masques: { mails: number; telephones: number; liens: number }; restant: number }
| { ok: true; portrait: Portrait; id: IdCible; restant: number }
| { ok: true; portrait: Portrait; cible: Cible; ligne: LignePiste; pisteId: IdPiste; restant: number }
```
`appelerApi` lit `o.etape` et `o.mode` pour choisir la forme. Le délai client reste 270 s. Le `pisteId` n'est pas envoyé au serveur : le navigateur le garde et le recolle à la réponse (le serveur renvoie `pisteId` = `piste.id`).

---

## 8. Prompts (`src/domain/maCible/prompt.ts`)

Tous les textes ci-dessous sont à recopier tels quels.

### 8.1 `PROMPT_COMMUN` : deux retouches
Règle 4, ajouter à la fin : « Seule exception : les phrases de « ce_que_dit_le_terrain.verbatims » sont de vrais propos de clients. Tu ne les recopies jamais : tu les désignes par leur identifiant (v1, v2…) dans les champs prévus. »

Ajouter une règle 14, après la règle 13 :
« 14. Notes de terrain et idées : si « ce_que_dit_le_terrain » est fourni, c'est ta meilleure source. Une cible, une douleur ou un prix qui contredit ces notes doit le dire dans « hypotheses ». Les idées de cibles de la personne (« idees_de_cibles ») sont toutes étudiées, aucune n'est oubliée. »

### 8.2 Découpage pour réutilisation (sans changer le texte)
Extraire de `PROMPT_RESULTAT` le bloc qui va de « - nom (5 à 80) et marche (b2b ou b2c) ; » à « signauxNegatifs (2 ou 3), 200 au plus chacun. » dans une constante `CONSIGNES_CIBLE`, et l'y réinsérer à l'identique. Un test vérifie que `PROMPT_RESULTAT` contient `CONSIGNES_CIBLE`.

### 8.3 `promptCadrage(tour)` : ajouts
Après la règle B, ajouter :
« B bis. Idées de la personne et autres pistes. « idees_de_cibles » contient ses idées (i1 à i8), éventuellement aucune. Étudie chacune. Chaque idée apparaît soit dans une des 3 cibles (son identifiant dans « depuisIdees » de cette cible ; une cible peut regrouper deux idées proches), soit dans « autresPistes ». « autresPistes » : 0 à 6 pistes (p1 à p6) en plus des 3 cibles, chacune avec nom (5 à 80), marche (b2b ou b2c), enUneLigne (20 à 200, qui et dans quelle situation), raison (20 à 200, pourquoi elle n'est pas dans tes 3 cibles) et depuisIdees (identifiants d'idées, ou tableau vide). Mets d'abord les idées de la personne, puis, s'il reste de la place, 2 ou 3 pistes à toi, vraiment différentes. Une idée qui ressemble à l'Anti-Contexte va dans « autresPistes », et sa raison le dit avec tact. »

À la fin de la règle A, ajouter : « Si « ce_que_dit_le_terrain » répond déjà à une question, ne la pose pas. »

À la fin de la règle E, ajouter : « « autresPistes » et chaque « depuisIdees » restent des tableaux vides pour les statuts « questions » et « hors_sujet ». »

### 8.4 `PROMPT_RESULTAT` : ajouts
- Juste après `CONSIGNES_CIBLE` (donc après la ligne « testTerrain »), ajouter :
  « - depuisIdees : les identifiants des idées de la personne reprises dans cette cible (tableau vide sinon) ;
  - verbatims : 0 à 3 identifiants de « ce_que_dit_le_terrain.verbatims » (v1, v2…) qui montrent le mieux la douleur de cette cible ; tableau vide si aucune phrase ne correspond ou s'il n'y a pas de notes. N'invente jamais d'identifiant. »
- Après le point 7, ajouter :
  « 8. autresPistes : 2 à 6 pistes (p1 à p6) en plus des 3 cibles. Reprends celles de l'esquisse validée (tu peux les préciser) et ajoute toute idée de la personne qui n'est ni dans les cibles ni dans l'esquisse. Chacune : nom (5 à 80), marche, enUneLigne (20 à 200), raison (20 à 200, pourquoi elle passe après les trois), depuisIdees, et notes (urgence, paiement, acces, plaisir : entiers de 1 à 5 selon la grille, sans raison). Ne donne pas les mêmes quatre notes à deux pistes. »

### 8.5 `PROMPT_SYNTHESE` (nouveau ; système = `PROMPT_COMMUN` + `PROMPT_SYNTHESE`, sans la grille)
```
# Ta tâche : lire les notes de terrain
La personne te confie des notes prises pendant de vrais échanges avec des clients ou des prospects (« notes_terrain », identifiants n1 à n5). « contexte » rappelle son talent et son offre. Ton travail : faire ressortir ce que vivent ces personnes, avec leurs mots, pour qu'elle choisisse mieux ses cibles. Tu ne proposes encore aucune cible.
1. statut : « ok » si les notes contiennent des propos ou des situations de clients ou de prospects. « inutilisable » sinon (texte sans rapport, notes vides de sens, contenu illégal ou dangereux) ; « message » dit alors en une ou deux phrases quoi coller à la place, et tous les autres champs restent vides. Avec « ok », « message » est vide.
2. resume (40 à 400) : ce qui ressort, en deux ou trois phrases simples.
3. profils (0 à 4, 160 au plus chacun) : qui sont ces personnes (rôle, situation, moment de vie), sans nom ni détail qui permettrait de les reconnaître.
4. douleurs (0 à 6) : texte (10 à 200), le problème tel qu'elles le vivent ; frequence : « souvent » (dans plusieurs notes), « parfois », « une_fois ».
5. verbatims (0 à 12) : des phrases recopiées mot pour mot dans les notes, sans rien changer, ni l'orthographe ni la ponctuation (8 à 240 caractères). Un seul morceau continu par phrase. id : v1, v2… ; note : l'identifiant de la note d'où vient la phrase ; theme : douleur, declencheur (ce qui l'a poussée à chercher de l'aide), objection (ce qui la freine), resultat (ce qu'elle a obtenu ou espère), autre. Choisis les phrases les plus parlantes, pas les plus longues. Écarte toute phrase qui contient un nom, une entreprise ou un détail reconnaissable.
6. declencheurs (0 à 4, 200 au plus) : les moments où ces personnes ont cherché de l'aide.
7. objections (0 à 4, 200 au plus) : ce qui les a fait hésiter ou dire non.
8. motsCles (0 à 10, 40 au plus) : des mots ou de courtes expressions qu'elles emploient vraiment, présents tels quels dans les notes.
N'invente rien : tout vient des notes. Un champ sans matière reste vide. Les crochets comme [téléphone], [adresse mail] ou [lien] sont des données masquées : ne les reprends jamais.
```

### 8.6 `CONSIGNES_PORTRAIT` et `PROMPT_PORTRAIT` (nouveaux ; système = `PROMPT_COMMUN` + `GRILLE_TEXTE` + `PROMPT_PORTRAIT`)
```
CONSIGNES_PORTRAIT =
- prenom (2 à 30) : un prénom fictif courant en France, cohérent avec l'âge. Jamais un prénom présent dans les données.
- age (3 à 30) : une tranche, par exemple « 40 à 50 ans ».
- situation (60 à 400) : son métier ou son rôle, sa situation, ce qui se passe pour elle en ce moment.
- journee (60 à 400) : une journée type, avec des détails concrets (horaires, outils, personnes autour).
- declencheur (30 à 240) : le jour précis où elle se dit qu'il lui faut de l'aide.
- pourToi (30 à 240) : ce qui, chez elle, allume le talent de la personne (son Contexte Déclencheur), et le piège à surveiller (son Anti-Contexte).
- dejaEssaye (1 à 4, 160 au plus chacun) : ce qu'elle a déjà tenté, seule ou avec d'autres.
- douleurs (3 à 5) : titre (5 à 80), detail (20 à 240), intensite (entier de 1 à 5, 5 = elle n'en dort plus), sesMots (10 à 200 : comment elle le dirait, sans guillemets), verbatim (l'identifiant d'une phrase de « ce_que_dit_le_terrain.verbatims » qui dit la même chose, sinon chaîne vide ; n'invente jamais d'identifiant).
- objections (2 ou 3) : objection (10 à 160, ce qu'elle se dit pour ne pas acheter) et reponse (20 à 240, ce que la personne peut répondre, honnêtement, sans forcer la main).
- criteresChoix (2 à 4, 160 au plus) : ce qui la fera choisir quelqu'un plutôt qu'un autre.
- sInforme (2 à 5, 120 au plus) : les types de médias, de comptes, d'émissions ou de groupes qu'elle suit. Jamais de nom réel.
- lieux (3 à 6) : où la croiser, en vrai ou en ligne. categorie (salon, evenement, club, en_ligne, lieu, media), type (5 à 120, par exemple « salons de la création et de la reprise d'entreprise »), pourquoi (10 à 200), recherche (3 à 80 : ce que la personne tapera dans un moteur de recherche, avec la ville ou la région si la zone compte ; jamais d'année, jamais de nom d'événement). Au moins un salon ou un événement si cette cible en fréquente. Ne répète pas « lieux_deja_donnes » : propose d'autres pistes.

PROMPT_PORTRAIT =
# Ta tâche : le portrait complet d'une cible
La personne a déjà son résultat. Elle veut mieux connaître une de ses cibles (« cible_a_approfondir »). Fais-en un portrait vivant et concret, qui l'aide à la reconnaître, à lui parler et à la croiser. Si des notes de terrain existent, appuie-toi d'abord sur elles. Respecte les longueurs (en caractères) :
${CONSIGNES_PORTRAIT}
Réponds avec un objet { "portrait": { … } }.
```

### 8.7 `PROMPT_PISTE` (nouveau ; système = `PROMPT_COMMUN` + `GRILLE_TEXTE` + `PROMPT_PISTE`)
```
# Ta tâche : creuser une piste
La personne a déjà ses cibles (« cibles_existantes ») et son offre affinée (« offre_affinee »). Elle veut creuser une autre piste (« piste_a_creuser »). Fais-en une cible complète, vraiment différente des cibles existantes, puis son portrait. Garde l'esprit de la piste ; tu peux préciser son nom. Les notes suivent la grille, avec une raison concrète chacune ; elles peuvent s'écarter des notes pressenties de la piste si tu le justifies.
1. cible : identifiant « identifiant_cible », puis, en respectant les longueurs (en caractères) :
${CONSIGNES_CIBLE}
- depuisIdees : reprends ceux de la piste.
- verbatims : 0 à 3 identifiants de « ce_que_dit_le_terrain.verbatims », tableau vide sinon.
2. portrait :
${CONSIGNES_PORTRAIT}
Réponds avec un objet { "cible": { … }, "portrait": { … } }.
```

### 8.8 Données envoyées (`donneesModele`)
Toutes les chaînes passent par `assainir`, comme aujourd'hui. Les clés à `undefined` disparaissent du JSON (comportement actuel de `JSON.stringify`).

Cadrage et résultat : ajouter
```ts
idees_de_cibles: entree.terrain.ciblesEnTete.map((t, i) => ({ id: `i${i + 1}`, texte: assainir(t) })),
ce_que_dit_le_terrain: entree.synthese ? syntheseModele(entree.synthese) : undefined,
```
`syntheseModele` envoie `resume`, `profils`, `douleurs`, `verbatims` (`id`, `citation`, `theme`, sans `note`), `declencheurs`, `objections`, `mots_cles`. Ni `nbNotes` ni `faitLe`.

Synthèse :
```ts
{ langue_reponse, etape: "synthese", contexte: { mecanisme, contexte_declencheur, super_benefice, offre }, notes_terrain: [{ id, titre, texte }] }
```

Portrait :
```ts
{ langue_reponse, etape: "approfondir", talent_unique, terrain /* comme aujourd'hui */, idees_de_cibles, ce_que_dit_le_terrain,
  offre_affinee, cible_a_approfondir: { nom, marche, portrait, douleur, ancrage, promesse }, lieux_deja_donnes }
```

Piste :
```ts
{ langue_reponse, etape: "approfondir", talent_unique, terrain, idees_de_cibles, ce_que_dit_le_terrain, offre_affinee,
  piste_a_creuser: { nom, marche, enUneLigne, raison, depuisIdees, notes_pressenties }, cibles_existantes, identifiant_cible }
```
Le prénom n'est jamais envoyé (inchangé).

### 8.9 `promptSysteme(etape, tour?, mode?)`
```ts
cadrage     → [PROMPT_COMMUN, GRILLE_TEXTE, promptCadrage(tour)]
resultat    → [PROMPT_COMMUN, GRILLE_TEXTE, PROMPT_RESULTAT]
synthese    → [PROMPT_COMMUN, PROMPT_SYNTHESE]
approfondir → [PROMPT_COMMUN, GRILLE_TEXTE, mode === "piste" ? PROMPT_PISTE : PROMPT_PORTRAIT]
```
`messageUtilisateur` reste identique (y compris la relance avec les erreurs).

---

## 9. Contrôles déterministes nouveaux (modules purs, testés)

### 9.1 Masquage (`src/domain/maCible/masquage.ts`)
```ts
export function masquerDonnees(texte: string): { texte: string; mails: number; telephones: number; liens: number }
```
Ordre : liens, puis adresses mail, puis téléphones.
- Liens : `/\bhttps?:\/\/[^\s<>"]+|\bwww\.[^\s<>"]+/gi` → `[lien]`
- Adresses mail : `/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi` → `[adresse mail]`
- Téléphones : `/(?<![\d+])(?:(?:\+|00)\d{2,3}[\s.-]?(?:\(0\)[\s.-]?)?[1-9]|0[1-9])(?:[\s.-]?\d{2}){4}(?!\d)/g` → `[téléphone]`

Utilisée par le navigateur (affichage du compteur) et par le serveur (§7.3). Cas de test : « 06 12 34 56 78 », « 0612345678 », « +33 6 12 34 56 78 », « 0033 1 23 45 67 89 », « 01.23.45.67.89 », « +33 (0)6 12 34 56 78 » sont masqués ; « 2026 », « 75011 », « 15 000 € », « 3 x 45 minutes » ne le sont pas. Ces trois expressions ont été vérifiées sur ces cas (Node 22) : les recopier telles quelles.

### 9.2 Phrases exactes (`verifierVerbatims`, `src/domain/maCible/terrain.ts`)
```ts
export function normaliserPourComparer(t: string): string
// minuscules ; NFD sans accents ; ’ ‘ ʼ → ' ; « » “ ” → " ; … → ... ; espaces multiples → un espace ; trim ;
// ponctuation et guillemets retirés en début et en fin
export function verifierVerbatims(s: SyntheseBrute, notes: NoteTerrain[]): { synthese: SyntheseBrute; retires: number }
```
- Une phrase est gardée si `normaliserPourComparer(citation)` est contenue dans `normaliserPourComparer(note.texte)` de la note citée (ou, si elle n'y est pas, dans une autre note : `note` est alors corrigé) et fait au moins 8 caractères après normalisation.
- Une phrase contenant « ... » est découpée sur « ... » : chaque morceau d'au moins 8 caractères doit être présent, dans l'ordre, dans la même note.
- Sinon elle est retirée (`reparations += 1`). Doublons retirés. Toute phrase contenant `[téléphone]`, `[adresse mail]` ou `[lien]` est retirée.
- Renumérotation `v1…vN` dans l'ordre restant.
- `motsCles` absents des notes (même normalisation) sont retirés.
- Aucune relance du modèle pour ce motif.

### 9.3 Couverture des idées (`couvrirIdees`, `src/domain/maCible/idees.ts`)
```ts
export function couvrirIdees<T extends { cibles: { depuisIdees: IdIdee[] }[]; autresPistes: (PisteEsquisse | AutrePiste)[]; hypotheses: string[] }>(
  sortie: T, idees: string[], marche: Marche | "", avecNotes: boolean): { sortie: T; ajoutees: number }
```
1. Retire de chaque `depuisIdees` les identifiants au-delà du nombre d'idées (`i5` alors qu'il n'y a que 4 idées) et les doublons.
2. Pour chaque idée citée nulle part : si `autresPistes` a moins de 6 éléments, ajoute `{ id: premier pN libre, nom: idée coupée à 80, marche: marche === "b2c" ? "b2c" : "b2b", enUneLigne: "Ton idée, pas encore étudiée en détail par l'IA.", raison: "L'IA ne l'a pas commentée. Creuse-la pour en avoir le cœur net.", depuisIdees: [id] }` (plus `notes: { urgence: 3, paiement: 3, acces: 3, plaisir: 3 }` si `avecNotes`). Sinon, remplace la dernière piste sans `depuisIdees`. S'il n'y en a pas, ajoute à `hypotheses` (si elles sont moins de 4) : « Ton idée « [idée] » n'a pas pu être étudiée cette fois. Propose-la dans l'esquisse pour la creuser. »
3. Chaque ajout compte une réparation. Aucune relance du modèle pour ce motif (économie d'appels).

Appliquée à l'esquisse (statut `esquisse` seulement) et au résultat.

### 9.4 Identifiants de phrases (`filtrerVerbatimsCibles`)
Garde dans `cibles[].verbatims` uniquement les identifiants présents dans `entree.synthese.verbatims`, 3 au plus, sans doublon. Sans synthèse : `[]`. Même filtre pour `portrait.douleurs[].verbatim` (sinon `""`). Chaque retrait compte une réparation.

### 9.5 Pistes (`qualitePistes`)
- `autresPistes` : identifiants uniques `p1…p6` (renumérotés dans l'ordre si besoin, réparation), au plus 6 (tronqué), notes entières ramenées entre 1 et 5 (réparation).
- Une piste dont le nom (comparé par `normaliserPourComparer`) est identique à celui d'une des 3 cibles est retirée (réparation), puis `couvrirIdees` repasse.
- Score pressenti : `scorePressenti(notes) = scoreSur10({ urgence: { note: notes.urgence, raison: "" }, paiement: …, acces: …, plaisir: … })`, `alertePlaisir = notes.plaisir <= 2`. Calculé à l'affichage, non stocké.

### 9.6 Portrait (`qualitePortrait`)
- `sesMots` : guillemets (« » " “ ”) retirés.
- `recherche` : années `\b(19|20)\d{2}\b` retirées, espaces resserrés (réparation).
- `prenom` : s'il apparaît (mot entier, casse ignorée) dans les notes de la synthèse, le talent ou le terrain, remplacé par le premier prénom absent des données dans la liste fixe `["Claire", "Nadia", "Julien", "Sophie", "Karim", "Isabelle", "Thomas", "Élodie"]` (réparation).
- Tirets longs : déjà traités par `nettoyerTextes`.
- Nombres d'éléments : `douleurs` 3 à 5, `objections` 2 ou 3, `lieux` 3 à 6, `dejaEssaye` 1 à 4, `criteresChoix` 2 à 4, `sInforme` 2 à 5. Trop d'éléments : tronqué (réparation). Trop peu : erreur de structure (relance), sauf `criteresChoix` et `sInforme` où 1 élément est accepté.

---

## 10. Schémas JSON et validation

### 10.1 Ajouts dans `schemas.ts`
```ts
export const IDS_IDEES = ["i1","i2","i3","i4","i5","i6","i7","i8"] as const;
export const IDS_PISTES = ["p1","p2","p3","p4","p5","p6"] as const;
export const IDS_NOTES = ["n1","n2","n3","n4","n5"] as const;
export const CATEGORIES_LIEU = ["salon","evenement","club","en_ligne","lieu","media"] as const;

const PISTE_ESQUISSE = O({ id: E(IDS_PISTES), nom: S, marche: E(["b2b","b2c"]), enUneLigne: S, raison: S, depuisIdees: A(E(IDS_IDEES)) });
const NOTES_PRESSENTIES = O({ urgence: N, paiement: N, acces: N, plaisir: N });
const AUTRE_PISTE = O({ id: E(IDS_PISTES), nom: S, marche: E(["b2b","b2c"]), enUneLigne: S, raison: S, depuisIdees: A(E(IDS_IDEES)), notes: NOTES_PRESSENTIES });

/** Item cible, factorisé : c1 à c3 pour le résultat, c4 à c6 pour une piste creusée. */
export const schemaCible = (ids: readonly string[]) => O({
  id: E(ids), nom: S, marche: E(["b2b","b2c"]),
  portrait: S, douleur: S, ancrage: S, promesse: S,
  offre: O({ nom: S, format: S, duree: S, contenu: A(S) }),
  prix: O({ min: N, max: N, unite: S, base: E(["HT","TTC"]), justification: S }),
  pitch: S, pourquoi: S, exemple: S,
  scores: O({ urgence: NOTE, paiement: NOTE, acces: NOTE, plaisir: NOTE }),
  lieux: A(O({ type: S, pourquoi: S, recherche: S })),
  canaux: A(O({ canal: E(CANAUX), priorite: N, action: S, pourquoi: S })),
  linkedin: O({ pertinence: E(["forte","moyenne","faible"]), motsCles: S, intitules: A(S), secteurs: A(S), tailles: A(S), zone: S, autres: A(S), astuce: S }),
  messages: O({ linkedin: S, emailObjet: S, emailCorps: S }),
  testTerrain: O({ profils: S, questions: A(S), signauxPositifs: A(S), signauxNegatifs: A(S) }),
  depuisIdees: A(E(IDS_IDEES)),
  verbatims: A(S),
});

const PORTRAIT = O({
  prenom: S, age: S, situation: S, journee: S, declencheur: S, pourToi: S,
  dejaEssaye: A(S),
  douleurs: A(O({ titre: S, detail: S, intensite: N, sesMots: S, verbatim: S })),
  objections: A(O({ objection: S, reponse: S })),
  criteresChoix: A(S), sInforme: A(S),
  lieux: A(O({ categorie: E(CATEGORIES_LIEU), type: S, pourquoi: S, recherche: S })),
});

export const SCHEMA_SYNTHESE = O({
  statut: E(["ok","inutilisable"]), message: S, resume: S, profils: A(S),
  douleurs: A(O({ texte: S, frequence: E(["souvent","parfois","une_fois"]) })),
  verbatims: A(O({ id: S, note: E(IDS_NOTES), citation: S, theme: E(["douleur","declencheur","objection","resultat","autre"]) })),
  declencheurs: A(S), objections: A(S), motsCles: A(S),
});
export const SCHEMA_PORTRAIT = O({ portrait: PORTRAIT });
export const SCHEMA_PISTE = O({ cible: schemaCible(["c4","c5","c6"]), portrait: PORTRAIT });
```

### 10.2 Modifications
- `SCHEMA_CADRAGE.esquisse.cibles` gagne `depuisIdees: A(E(IDS_IDEES))` ; `esquisse` gagne `autresPistes: A(PISTE_ESQUISSE)`.
- `SCHEMA_RESULTAT` : `cibles: A(schemaCible(["c1","c2","c3"]))` ; ajouter `autresPistes: A(AUTRE_PISTE)`.

### 10.3 Validation (`validation.ts`)
- `validerCadrage` : `depuisIdees` et `autresPistes` absents → `[]` (une réparation, seulement si absents d'une réponse du modèle). `autresPistes` : 0 à 6, longueurs du §8.3.
- `validerResultat` : idem, plus `verbatims` (absent → `[]`) et `autresPistes` (absent → `[]` ; le prompt en demande 2 à 6, mais moins n'est pas une erreur). La lecture de l'historique et du stockage V2a reste donc compatible.
- Nouvelles : `validerSynthese(v)`, `validerPortrait(v)`, `validerCible(v, ids, idAttendu?)` (extraite de `validerResultat`, sans changer son comportement pour le résultat), `validerAutrePiste(v)`.
- Longueurs de la synthèse et du portrait : celles des §8.5 et §8.6. Même règle tolérante que V2a : trop long coupé, trop court seulement si vide ou sous la moitié du minimum.

---

## 11. Limite du jour, migration SQL, variables

### 11.1 Code (`quota.ts`)
```ts
export type EtapeQuota = "cadrage" | "resultat" | "synthese" | "approfondir";
export interface Limites {
  ipCadrage: number; ipResultat: number; ipSynthese: number; ipApprofondir: number;
  globalCadrage: number; globalResultat: number; globalSynthese: number; globalApprofondir: number;
}
export const LIMITES_DEFAUT: Limites = {
  ipCadrage: 30, ipResultat: 15, ipSynthese: 5, ipApprofondir: 20,
  globalCadrage: 2000, globalResultat: 500, globalSynthese: 100, globalApprofondir: 300,
};
```
- Variables lues par `limitesDepuisEnv` : `MA_CIBLE_MAX_IP_SYNTHESE`, `MA_CIBLE_MAX_IP_APPROFONDIR`, `MA_CIBLE_MAX_GLOBAL_SYNTHESE`, `MA_CIBLE_MAX_GLOBAL_APPROFONDIR` (aucune obligatoire).
- `maxIp` et `maxGlobal` deviennent des tables de correspondance par étape.
- Un portrait et une piste creusée comptent tous deux dans `approfondir`. Un échec ne compte pas (inchangé).
- `MA_CIBLE_EMAILS_ILLIMITES` et `MA_CIBLE_CLE_TEST` valent aussi pour les nouvelles étapes (déjà le cas par construction).
- `page.tsx` passe à `MaCible` les maximums par personne `maxSynthese` et `maxApprofondir` (lus par `limitesDepuisEnv(process.env)`), pour les phrases « Compte pour 1 lecture sur les 5 du jour » et « … sur les 20 du jour ».

### 11.2 Migration `supabase/migrations/20261012000000_ma_cible_v2b.sql`
Pierre la joue dans l'éditeur SQL de Supabase (projet `lpfivkrypbpcyczmgdds`), **avant ou juste après la fusion de la PR 2**. Elle reprend aussi la correction de `ma_cible_consommer` (`20261010200000`), qui n'a peut-être pas encore été jouée : jouer ce seul fichier suffit. Elle peut être rejouée sans risque.

```sql
-- Le Cibleur V2b : deux nouvelles étapes comptées, « synthese » (lecture des notes) et « approfondir »
-- (portrait complet ou piste creusée). Reprend la correction de ma_cible_consommer (valeur après incrément).
-- Rejouable. Aucun contenu n'est stocké : seulement une empreinte et un nombre.

alter table public.ma_cible_quota drop constraint if exists ma_cible_quota_etape_check;
alter table public.ma_cible_quota add constraint ma_cible_quota_etape_check
  check (etape in ('cadrage', 'resultat', 'synthese', 'approfondir'));

create or replace function public.ma_cible_consommer(p_cle text, p_etape text, p_max_ip integer, p_max_global integer)
returns table (ok boolean, motif text, n_ip integer, n_global integer)
language plpgsql security definer set search_path = public as $$
declare
  v_jour date := (now() at time zone 'Europe/Paris')::date;
  v_g integer; v_n integer;
begin
  if p_etape not in ('cadrage', 'resultat', 'synthese', 'approfondir') or p_cle !~ '^[0-9a-f]{64}$' then
    return query select false, 'invalide'::text, 0, 0; return;
  end if;
  delete from ma_cible_quota where jour < v_jour - 1;
  insert into ma_cible_quota as q (cle, jour, etape, n) values ('global', v_jour, p_etape, 1)
    on conflict (cle, jour, etape) do update set n = q.n + 1 returning n into v_g;
  if v_g > p_max_global then return query select false, 'global'::text, 0, v_g; return; end if;
  insert into ma_cible_quota as q (cle, jour, etape, n) values (p_cle, v_jour, p_etape, 1)
    on conflict (cle, jour, etape) do update set n = q.n + 1 returning n into v_n;
  return query select v_n <= p_max_ip, case when v_n <= p_max_ip then null else 'ip' end, v_n, v_g;
end $$;

create or replace function public.ma_cible_autoriser(p_cle text, p_etape text, p_max_ip integer, p_max_global integer)
returns table (ok boolean, motif text, n_ip integer, n_global integer)
language plpgsql security definer set search_path = public as $$
declare
  v_jour date := (now() at time zone 'Europe/Paris')::date;
  v_g integer; v_n integer;
begin
  if p_etape not in ('cadrage', 'resultat', 'synthese', 'approfondir') or p_cle !~ '^[0-9a-f]{64}$' then
    return query select false, 'invalide'::text, 0, 0; return;
  end if;
  select q.n into v_g from ma_cible_quota q where q.cle = 'global' and q.jour = v_jour and q.etape = p_etape;
  select q.n into v_n from ma_cible_quota q where q.cle = p_cle and q.jour = v_jour and q.etape = p_etape;
  v_g := coalesce(v_g, 0);
  v_n := coalesce(v_n, 0);
  if v_g >= p_max_global then return query select false, 'global'::text, v_n, v_g; return; end if;
  if v_n >= p_max_ip then return query select false, 'ip'::text, v_n, v_g; return; end if;
  return query select true, null::text, v_n, v_g;
end $$;

revoke all on function public.ma_cible_consommer(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.ma_cible_consommer(text, text, integer, integer) to service_role;
revoke all on function public.ma_cible_autoriser(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.ma_cible_autoriser(text, text, integer, integer) to service_role;

notify pgrst, 'reload schema';
```
- Sans cette migration, le code marche quand même : la fonction répond `invalide`, le code bascule sur la table (refusée par la contrainte), puis sur le compteur en mémoire de l'instance (limite moins fiable).
- Le nom `ma_cible_quota_etape_check` est celui que Postgres donne à la contrainte écrite dans `20261010000000_ma_cible_quota.sql` (contrainte de colonne sans nom).
- Ajouter dans `supabase/tests/rls.test.sql` : `ma_cible_consommer(repeat('d', 64), 'synthese', 2, 10)` renvoie `ok = true` deux fois puis `ok = false, motif = 'ip'` ; `'approfondir'` accepté ; `'autre'` renvoie `motif = 'invalide'` ; `anon` et `authenticated` n'ont toujours pas le droit d'exécuter.

### 11.3 Variables Vercel (projet `boussole-decision`)
Aucune nouvelle variable obligatoire. Facultatives : les 4 du §11.1. Les clés restent uniquement dans Vercel. Ajouter les 4 noms (sans valeur) au README de l'app.

---

## 12. Budget de jetons, de temps et limites gratuites de Gemini

Limites de l'offre gratuite (à vérifier dans Google AI Studio, page des limites, car elles varient selon le compte) : pour un modèle Flash, environ 10 requêtes par minute, 250 000 jetons d'entrée par minute et de l'ordre de 1 000 à 1 500 requêtes par jour, par projet (remise à zéro à minuit heure du Pacifique, soit 9 h à Paris). Avec l'offre gratuite, Google peut utiliser les données envoyées pour améliorer ses produits : d'où l'avertissement du §17.

Estimations par appel (français : environ 1 jeton pour 4 caractères ; la réflexion de Gemini s'ajoute à la sortie) :

| Appel | Quand | Entrée (jetons) | Sortie JSON | Durée attendue | Plafond hors Gemini | Délai serveur |
|---|---|---|---|---|---|---|
| synthese | à la demande, 1 fois en général | 3 000 (prompt) + 6 000 au plus (notes) | 1 500 au plus | 20 à 60 s | 3 000 | 90 s |
| cadrage | 1 à 3 par parcours (inchangé) | 4 000 à 6 000 (+ 1 200 avec synthèse et idées) | 1 200 au plus | 15 à 60 s | 2 500 | 90 s |
| resultat | 1 par parcours (inchangé) | 6 000 à 8 000 | 7 000 à 9 500 | 2 à 3 min | 10 000 | 240 s |
| portrait | à la demande | 4 000 à 6 000 | 1 800 au plus | 20 à 45 s | 6 000 | 150 s |
| piste | à la demande, 3 au plus | 5 000 à 7 000 | 3 500 au plus | 40 à 90 s | 6 000 | 150 s |

- Parcours typique sans les nouveautés : 2 appels (inchangé).
- Tout utilisé : 1 synthèse + 2 cadrages + 1 résultat + 3 portraits + 2 pistes = 9 appels, soit 9 à 20 requêtes vers Gemini en comptant les relances, étalées sur 15 à 20 minutes, un seul appel à la fois (§6.4).
- Les plafonds globaux par jour (§11.1) restent sous la limite gratuite tant que l'outil sert quelques dizaines de personnes par jour ; au-delà, il faudra la version payante (prévue plus tard).
- Rien ne change dans `fournisseur.ts` : même modèle, même secours, même réflexion par défaut, même `maxOutputTokens` pour Gemini.

---

## 13. Lien avec la Boussole de décision

### 13.1 Côté Cibleur (`src/domain/boussoleCibles.ts`, module pur partagé)
```ts
export interface LienCibles {
  v: 1;
  talent: { mecanisme: string; contexte: string; benefice: string; antiContexte: string; reussite: string };  // 600 caractères au plus chacun
  offre: string;                                                                                           // 240 au plus
  cibles: { nom: string; resume: string; score: number; notes: { urgence: number; paiement: number; acces: number; plaisir: number } }[]; // 2 à 6
}
export const TAILLE_MAX_LIEN = 8_000;
export function encoderLienCibles(d: LienCibles): string           // JSON → UTF-8 → base64url, sans « = »
export function decoderLienCibles(hash: string): LienCibles | null // accepte « #cibles=… » ou la charge seule ; null si absente, trop longue, illisible ou invalide
export function lienBoussoleCibles(resultat: ResultatClasse, extras: Extras, entree: EntreeMaCible): string
// → "/boussole-decision/depuis-cibleur/#cibles=" + charge
```
- Même technique d'encodage que `decodeLoveHash` (`src/domain/lovePrefill.ts`).
- Cibles transmises : les 3 cibles dans l'ordre du classement, puis les pistes creusées par score décroissant (6 au plus). `resume` = `promesse` (180 au plus). `score` = score affiché. `notes` = les 4 notes (1 à 5).
- Si la charge dépasse 8 000 caractères : vider les `resume` en partant de la dernière cible, puis couper `talent.*` à 300.
- Le prénom n'est jamais transmis. Le lien marche aussi depuis un résultat de l'historique.

### 13.2 Côté Boussole : page `/boussole-decision/depuis-cibleur/`
Fichiers : `src/app/(public)/depuis-cibleur/page.tsx`, `src/features/cibles/CiblesStart.tsx` (client, calqué sur `features/amour/LoveStart.tsx`), `src/features/cibles/actions.ts` (`"use server"`, calqué sur `startLoveCompassAction`), `src/content/depuisCibleur.ts` (textes du §16). Ajouter `"/depuis-cibleur"` à `PUBLIC_PATHS` (`src/lib/config.ts`) et un test dans `config.test.ts`.

`CiblesStart` lit `window.location.hash` une fois, le décode avec `decoderLienCibles`, puis retire l'ancre de l'adresse (`history.replaceState`). Charge valide : encart « On a bien reçu tes [n] cibles et ton Talent Unique. » et la liste des noms. Sinon : message d'erreur (§16) et lien « Retourner au Cibleur » vers `/boussole-decision/ma-cible/`.

Bouton « Créer ma comparaison » → `startCiblesCompassAction(charge)` :
1. Revalide la charge avec `decoderLienCibles` (ou la même validation sur l'objet) côté serveur.
2. Sans session : `signInAnonymously` (même code que `startLoveCompassAction`).
3. `createProfile(supabase, "Mes cibles (Le Cibleur)", "Créé depuis Le Cibleur", "Choisir ma cible prioritaire")`, puis `listVersions` pour l'identifiant de version.
4. `updateTalent(supabase, profileId, { mecanisme, contexteDeclencheur: contexte, superBenefice: benefice, antiContexte, successSituations: reussite })`.
5. On garde les 5 catégories MO2I créées par défaut (`listCategories`, repérées par `key`) et on crée ces critères, dans cet ordre :

| Catégorie (clé) | Critère | Importance | Non négociable | Direction | Description |
|---|---|---|---|---|---|
| `contexte_declencheur` | Cette cible allume mon talent | `critique` | non | `TOWARDS` | « Mon Contexte Déclencheur : » + contexte (280 au plus) |
| `anti_contexte` | Cette cible me plonge dans mon Anti-Contexte | `tres_important` | non | `AWAY_FROM` | « Mon Anti-Contexte : » + antiContexte (280 au plus) |
| `valeurs_culture` | J'aime ce milieu et ses valeurs | `important` | non | `TOWARDS` | « Est-ce que je me sens à ma place avec ces personnes ? » |
| `conditions_vie` | Je peux la joindre facilement | `important` | non | `TOWARDS` | « Est-ce que je la connais déjà, ou est-ce que je sais où la croiser ? » |
| `conditions_vie` | Le rythme et les déplacements me conviennent | `moyen` | non | `TOWARDS` | « Horaires, distance, nombre de rendez-vous : est-ce que ça tient dans ma vie ? » |
| `remuneration` | Son problème est urgent pour elle | `tres_important` | non | `TOWARDS` | « Est-ce qu'elle cherche déjà une solution ? » |
| `remuneration` | Elle peut payer mon prix | `tres_important` | non | `TOWARDS` | « A-t-elle un budget pour ce type d'aide ? » |

6. Une opportunité par cible : `createOpportunity(supabase, versionId, nom, position)` puis `updateOpportunity(supabase, id, { summary: resume, notes: "Score du Cibleur : 7,4/10" })`.
7. Évaluations préremplies avec `setEvaluation`. Correspondance note → valeur : 1 → `non`, 2 → `p25`, 3 → `p50`, 4 → `p75`, 5 → `oui`.
   - « Cette cible allume mon talent » ← plaisir ;
   - « Cette cible me plonge dans mon Anti-Contexte » ← plaisir inversé (1 → `oui`, 2 → `p75`, 3 → `p50`, 4 → `p25`, 5 → `non`) ;
   - « Je peux la joindre facilement » ← accès ;
   - « Son problème est urgent pour elle » ← urgence ;
   - « Elle peut payer mon prix » ← paiement ;
   - les deux autres critères restent sans évaluation.
8. `redirect(`/versions/${versionId}/tableau/`)`. Échec à n'importe quelle étape : `{ error: TEXTES.echec }`.

La correspondance (critères, notes, valeurs) vit dans `src/domain/boussoleCibles.ts` (pur, testé), pas dans l'action. Un encart sous le tableau de la Boussole n'est pas demandé.

---

## 14. Stockage local, historique, export

- `stockage.ts` (`ma_cible_v1`) : lit et écrit `entree.terrain.ciblesEnTete`, `entree.synthese` et `extras`. Lecture tolérante : `validerSyntheseEntree` (invalide → `null`), `lireExtras` (chaque portrait passe `validerPortrait`, chaque piste passe `validerCible` + la présence d'une `ligne` valide ; un élément invalide est ignoré, le reste est gardé).
- `historique.ts` : `EntreeHistorique` gagne `extras?: Extras` (défaut `EXTRAS_VIDES`).
- Écriture impossible faute de place : comportement V2a (on retire le plus ancien de l'historique et on réessaie une fois), jamais de blocage de l'écran.
- `export.ts` (texte brut et Markdown) :
  - en tête, si une synthèse existe : « CE QUE DISENT TES NOTES » (résumé, douleurs, phrases exactes, déclencheurs, objections, mots) ;
  - après chaque cible : « CE QUE DISENT TES CLIENTS » (citations) puis « SON PORTRAIT » (tous les champs, lieux avec leur recherche) ;
  - après les cibles : « D'AUTRES PISTES » (nom, B2B ou B2C, score pressenti, une ligne, raison) puis « PISTES CREUSÉES » (comme une cible, avec portrait) ;
  - les notes brutes ne sont jamais exportées ; `remplacerPrenom` s'applique comme aujourd'hui.
- « Copier cette cible » inclut son portrait s'il existe.
- « Tout effacer » efface aussi la synthèse et les extras (c'est déjà le cas en effaçant `ma_cible_v1` et l'historique) ; texte de confirmation inchangé.

---

## 15. Habillage (mobile d'abord)

### 15.1 Couleurs ajoutées à `globals.css` (`@theme`), contrastes calculés
```css
--color-lilas: #5f3f8f;      --color-lilas-soft: #f1eafa;      /* notes de terrain, phrases de clients : 6,9:1 */
--color-corail: #a8431a;     --color-corail-soft: #fde8dc;     /* portrait : 5,1:1 */
--color-framboise: #a3304f;  --color-framboise-soft: #fce6ec;  /* douleurs : 5,7:1 */
--color-eau: #0e6a60;        --color-eau-soft: #dff4f0;        /* lieux et salons : 5,6:1 */
--color-miel: #7a5200;       --color-miel-soft: #fdf0d2;       /* idées, autres pistes : 6,1:1 */
```
- La sauge existante (`--color-sage`, `--color-sage-soft`) sert à la Boussole et à « Ce qui allume ton talent ».
- Aucun bleu marine ni bleu foncé. Le bleu ciel existant sert seulement de fond aux encarts de confidentialité.
- Texte blanc sur `lilas`, `eau`, `framboise`, `miel` : 6,5:1 à 8,1:1, donc pastilles pleines possibles.
- Modèle de bloc coloré : `rounded-2xl border-l-4 border-{couleur} bg-{couleur}-soft p-5 sm:p-6`. Titre de bloc : `flex items-center gap-3`, pastille ronde de 36 px `bg-white text-{couleur}` contenant l'icône de 20 px, puis le titre (serif italique, comme V2a).

### 15.2 Icônes (`src/features/maCible/Icones.tsx`)
SVG en ligne, 24 × 24, `fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"`, `aria-hidden="true"`, taille par `className`. Tracés repris de Lucide (licence ISC : mettre « Icônes adaptées de Lucide (lucide.dev), licence ISC » en commentaire en tête du fichier). Correspondance nom → icône Lucide :
`cible` → target ; `carnet` → notebook-pen ; `personne` → user-round ; `eclair` → zap ; `bulle` → message-square-quote ; `epingle` → map-pin ; `chapiteau` → tent ; `calendrier` → calendar-days ; `groupe` → users-round ; `ecran` → monitor-smartphone ; `journal` → newspaper ; `loupe` → search ; `cadenas` → lock-keyhole ; `etincelles` → sparkles ; `couches` → layers ; `boussole` → compass ; `croix` → x ; `copier` → copy.
Export : `export type NomIcone = …; export function Icone({ nom, className }: { nom: NomIcone; className?: string })`.

### 15.3 Mise en page mobile (375 px)
- Une colonne, marges 16 px, cartes pleine largeur, boutons pleine largeur sous 640 px, cibles tactiles de 44 px au moins.
- Pistes : une carte par ligne sur mobile, deux colonnes à partir de 768 px, trois à partir de 1 280 px.
- Lieux du portrait : une carte par ligne sur mobile, deux colonnes à partir de 768 px. Bouton « Chercher sur Google » sous le texte sur mobile, à droite sur ordinateur.
- Icône et texte sur la même ligne partout (règle 7 du §3). L'icône est dans le titre, jamais seule sur sa ligne.
- Mini-barres des 4 notes : 4 barres horizontales de 6 px de haut, libellé à gauche, note « 4/5 » à droite ; couleurs : urgence framboise, paiement miel, accès eau, plaisir sauge.
- Points d'intensité des douleurs : 5 ronds de 8 px, pleins en framboise, vides en `framboise-soft` avec bordure framboise.

### 15.4 Animations (toutes coupées si `prefers-reduced-motion: reduce`)
- Apparition d'un portrait, d'une synthèse ou d'une piste creusée : fondu et montée de 8 px en 300 ms (`@keyframes apparaitre` dans `globals.css`, classe `motion-safe:animate-[apparaitre_300ms_ease-out]`), puis défilement doux jusqu'au bloc et focus sur son titre (`tabIndex={-1}`).
- Chargeur en ligne (`ChargeurEnLigne.tsx`) : barre de 4 px en dégradé lilas, corail, miel qui glisse en boucle (1,6 s), message tournant toutes les 6 s, et « Temps écoulé : 0:24 » (même formatage que `attenteTemps.ts`). `aria-live="polite"` sur le message.
- Bouton « Chercher sur Google » : légère montée de 1 px au survol.
- Aucune autre animation en boucle.

---

## 16. Textes d'erreur, états et page Boussole

À ajouter dans `src/i18n/messages/maCible.ts` (clé `v2b` ou dans les sections existantes, au choix de l'agent, textes exacts) :
- Fichier refusé : « Ce fichier n'est pas un texte simple. Utilise un fichier .txt, .md ou .csv. Pour un document Word ou Google Docs, copie-colle son contenu. »
- Fichier trop long : « Ce fichier est trop long : on a gardé le début, jusqu'à la limite de 20 000 caractères. Vérifie qu'il ne manque rien d'important. »
- Plus de 5 notes : « Tu as déjà 5 notes, c'est le maximum. Regroupe-les ou retire-en une. »
- Total trop long : « Tes notes dépassent 20 000 caractères. Garde les passages où le client parle de sa situation et de ce qui le gêne. »
- Total trop court : « Ajoute un peu de matière : au moins 200 caractères au total. »
- Case non cochée (au clic) : « Coche la case pour confirmer que tu as retiré les noms. »
- Notes inutilisables : « L'IA n'a pas trouvé de propos de clients dans ces notes. » suivi du `message` de l'IA.
- Limite du jour, synthèse : « Tu as fait lire tes notes [max] fois aujourd'hui, c'est le maximum. Ta synthèse actuelle est gardée. Reviens demain pour en lire d'autres. »
- Limite du jour, approfondissement : « Tu as utilisé tes [max] approfondissements du jour. Ton résultat reste là : reviens demain pour la suite. »
- `quota_global`, `ia_invalide`, `ia_indisponible`, `reseau`, `config_manquante`, `inconnue`, `entree_invalide`, `trop_long` : textes V2a existants, affichés dans le bloc concerné (jamais en plein écran), avec le bouton « Réessayer » quand il a un sens (pas pour les limites).

Textes de la page Boussole (`src/content/depuisCibleur.ts`) :
- surtitre : « Depuis Le Cibleur »
- titre : « Compare tes cibles »
- intro : « Tes cibles et ton Talent Unique sont prêts. La Boussole les compare critère par critère : ce qui allume ton talent, ce qui l'éteint, l'urgence, le budget, l'accès. Les notes du Cibleur sont déjà reportées : tu n'as plus qu'à les ajuster. »
- reçu : « On a bien reçu tes [n] cibles et ton Talent Unique. »
- bouton : « Créer ma comparaison »
- note : « Pas besoin de compte pour commencer. Tes cibles sont enregistrées dans ton espace de la Boussole, et nulle part ailleurs. »
- lien invalide : « Ce lien est incomplet. Retourne dans Le Cibleur et clique à nouveau sur « Comparer mes cibles dans la Boussole ». »
- échec : « La création n'a pas marché. Réessaie dans un instant. »
- retour : « Retourner au Cibleur »

Libellés nouveaux, récapitulatif (tous déjà cités plus haut) : « Ton idée », « Tes autres pistes », « D'autres pistes », « Pistes creusées », « Piste creusée », « Pourquoi pas dans tes 3 cibles : », « Pour voir tous les salons à venir : », « Je la préfère », « Creuser cette piste », « Voir la piste creusée », « Score pressenti », « Ce que disent tes clients », « Tiré de tes notes », « Imaginé par l'IA », « Son portrait complet », « Faire son portrait complet », « Copier ce portrait », « Chercher sur Google », « Voir l'annuaire des salons », « Salons à l'international », « Comparer dans la Boussole », « Comparer mes cibles dans la Boussole ». Entrées du sommaire : « Ce que disent tes clients », « Son portrait », « D'autres pistes ».

---

## 17. Confidentialité

### 17.1 Encart de l'accueil (`confidentialite.points`) : un point de plus, en 2e position
« Si tu ajoutes des notes d'entretiens, elles sont envoyées une seule fois à l'IA pour en tirer une synthèse, puis effacées de la page. Seule la synthèse reste, dans ton navigateur. »

### 17.2 Avertissement au-dessus des notes (texte exact)
Titre : « Avant de coller tes notes »

Version gratuite (fournisseur `gemini` ou `mistral`) :
1. « Le Cibleur utilise pour l'instant la version gratuite d'une IA ([nom]). Avec cette version, le fournisseur peut garder ce que tu envoies et s'en servir pour améliorer ses produits, et des personnes peuvent le relire. »
2. « Retire donc les noms, les prénoms, les entreprises et tout détail qui permettrait de reconnaître quelqu'un. On masque déjà les adresses mail, les numéros de téléphone et les liens, mais pas les noms. »
3. « N'envoie rien sur la santé, la vie privée, l'argent de quelqu'un ou ce qu'on t'a confié en secret. »
4. « Si tes clients ne savent pas que tu as gardé des notes de vos échanges, demande-leur d'abord leur accord. »
5. « Tes notes ne sont pas enregistrées sur nos serveurs. Une fois lues, elles sont effacées de la page : seule la synthèse reste, dans ton navigateur. »
6. « Une version payante, où tes données ne servent pas à entraîner l'IA, arrivera plus tard. »

[nom] : `gemini` → « Gemini, de Google » ; `mistral` → « Mistral ».
Fournisseur payant (`anthropic`, `openai`) : on retire les points 1 et 6 et on met en premier : « Tes notes sont envoyées à une IA ([nom]) qui ne s'en sert pas pour s'entraîner. » ([nom] : `anthropic` → « Claude, d'Anthropic » ; `openai` → « OpenAI »).

Le nom vient du serveur : `page.tsx` lit `process.env.MA_CIBLE_FOURNISSEUR` (défaut `anthropic`, comme `creerFournisseur`, valeur inconnue → `anthropic`) et passe `fournisseurNotes: "gemini" | "mistral" | "anthropic" | "openai"` à `MaCible`. Aucune clé, seulement ce nom.

### 17.3 Politique de confidentialité du site
Hors code de V2b : la page `/confidentialite/` (tâche déjà prévue) devra mentionner le traitement des notes de terrain.

---

## 18. Tests et acceptation

### 18.1 Tests automatisés (Vitest), par PR

PR 1 :
1. `entree.test.ts` : `ciblesEnTete` absent → `[]` ; 9 idées → 8 ; doublons retirés ; 130 caractères → coupé à 120 ; `synthese` absente → `null`.
2. `idees.test.ts` : 8 idées dont 3 dans les cibles et 3 dans les pistes → 2 pistes ajoutées avec les textes prévus ; 6 pistes sans idée → remplacement de la dernière ; 6 pistes toutes issues d'idées → phrase ajoutée aux hypothèses ; `i9` ou identifiant au-delà du nombre d'idées retiré.
3. `validation.test.ts` : un `RESULTAT_EXEMPLE` V2a (sans `autresPistes`, `depuisIdees`, `verbatims`) reste valide et reçoit `[]` ; 7 pistes → 6 ; note pressentie 0 → 1, 7 → 5.
4. `schemas.test.ts` : `schemaCible(["c1","c2","c3"])` égale l'ancien item de `SCHEMA_RESULTAT` plus `depuisIdees` et `verbatims` ; `schemaPourGemini` passe sur tous les nouveaux schémas sans clé interdite.
5. `prompt.test.ts` : `PROMPT_RESULTAT` contient `CONSIGNES_CIBLE` ; aucun prompt ne contient de tiret cadratin ni demi-cadratin ; `donneesModele` contient `idees_de_cibles` numérotées `i1…` ; la règle 14 est présente.
6. `scores.test.ts` : `scorePressenti` de (4, 4, 3, 5) = 8,0 ; (3, 3, 3, 3) = 6,0 ; (5, 5, 5, 1) → alerte plaisir.
7. `stockage.test.ts` et `historique.test.ts` : un état V2a enregistré se relit sans perte, avec `ciblesEnTete: []`, `synthese: null`, `extras` vides.
8. `export.test.ts` : la section « D'AUTRES PISTES » apparaît avec le score pressenti.

PR 2 :
9. `masquage.test.ts` : les cas du §9.1.
10. `terrain.test.ts` : phrase identique gardée ; apostrophe courbe contre droite gardée ; phrase reformulée retirée ; phrase coupée par « ... » gardée si chaque morceau est présent dans l'ordre ; phrase avec `[téléphone]` retirée ; mots-clés absents retirés ; renumérotation `v1…vN`.
11. `entree.test.ts` : `validerNotes` (6 notes → erreur ; texte de 40 → `trop_court` ; total 20 001 → `trop_long` ; total 150 → `trop_court`).
12. `traitement.test.ts` (fournisseur simulé) : synthèse réussie → 200, `restant` décrémenté, quota `synthese` consommé, **rien écrit dans la reprise Supabase simulée** ; `inutilisable` → 200 et compte ; échec IA → 503 et ne compte pas ; masquage serveur compté dans `masques`.
13. `quota.test.ts` : nouvelles étapes et variables ; défauts 5, 20, 100, 300.
14. `rls.test.sql` : cas du §11.2.
15. `etat.test.ts` : `synthese` invalide le cadrage et marque le résultat périmé ; `retirerVerbatim` idem.

PR 3 :
16. `traitement.test.ts` : portrait réussi → 200 et quota `approfondir` ; piste réussie → `cible.id` égal à `idCible`, `ligne.score` égal à `scoreSur10` ; identifiant de cible différent de `idCible` → relance.
17. `qualite.test.ts` : `qualitePortrait` retire les guillemets de `sesMots` et l'année de `recherche`, remplace un prénom présent dans les données ; `filtrerVerbatimsCibles` retire `v9` inexistant.
18. `etat.test.ts` : action `piste` refusée à la 4e ; `prochainIdPiste` ; `resultat` remet `extras` à vide ; `reprendre` restaure `extras`.
19. `boussoleCibles.test.ts` : aller-retour encodage avec accents ; charge de plus de 8 000 caractères → `null` au décodage ; réduction automatique sous 8 000 à l'encodage ; correspondance des notes (5 → `oui`, plaisir 1 → Anti-Contexte `oui`) ; critères et importances exacts du §13.2.
20. `config.test.ts` : `/depuis-cibleur` est public.
21. `export.test.ts` : portraits et pistes creusées exportés ; notes brutes jamais présentes.

### 18.2 Recette manuelle (prévisualisation Vercel, téléphone 375 px et ordinateur)
Jeu d'essai « Pierre » (aussi en fixture `ENTREE_PIERRE` dans `exemple.ts`, utilisée par les tests de `idees.test.ts`) :
- Talent : mécanisme « je décode le talent unique d'une personne en écoutant son histoire, puis je le traduis en métier concret » ; contexte « quelqu'un de brillant est à un tournant et ne sait plus quoi faire de tout ce qu'il sait faire » ; bénéfice « la personne sait enfin ce qui la rend unique, choisit sa voie et avance avec plaisir » ; anti-contexte « les grosses structures où tout passe par des process et des tableaux de bord, les gens qui veulent une recette toute faite sans se regarder ».
- Terrain : offre « accompagnement Talent Unique en individuel, pour trouver sa voie et réussir dans le plaisir » ; marché « les deux » ; expérience « 20 ans de recrutement et d'accompagnement de cadres et de créateurs d'entreprise » ; zone « Paris et à distance ».
- Idées de cibles (8) : « cadres de 35 à 55 ans en reconversion, multi-potentiels », « futurs entrepreneurs bloqués avant de se lancer », « repreneurs d'entreprise », « anciens fondateurs qui rebondissent après une cession ou un échec », « cadres à haut potentiel intellectuel (HPI) », « seniors concernés par un plan social (PSE) », « militaires en reconversion », « athlètes de haut niveau en reconversion ».
- Notes : 2 notes fictives d'environ 1 500 caractères, rédigées pour le test, avec un numéro « 06 12 34 56 78 » et une adresse « jean.dupont@exemple.fr ». (Pierre pourra ensuite tester avec ses vrais entretiens anonymisés.)

Vérifications :
1. Les 8 idées apparaissent toutes, soit dans les 3 cibles (pastille « Ton idée »), soit dans « Tes autres pistes » (esquisse) et « D'autres pistes » (résultat).
2. Le numéro et l'adresse sont masqués avant l'envoi ; « On a masqué 1 adresse mail et 1 numéro de téléphone. » s'affiche.
3. Après lecture des notes, les champs sont vides, la synthèse s'affiche, chaque phrase de « Leurs mots exacts » se retrouve mot pour mot dans les notes de départ.
4. Le résultat affiche « Ce que disent tes clients » sur au moins une cible.
5. « Faire son portrait complet » sur la cible prioritaire : portrait en moins de 60 s, au moins un lieu de catégorie salon ou événement ; chaque « Chercher sur Google » ouvre la bonne recherche ; aucune année ni nom d'événement.
6. « Creuser cette piste » sur 3 pistes : 3 cartes complètes ; le bouton de la 4e piste est désactivé avec le texte prévu.
7. Recharger la page : synthèse, portraits et pistes creusées sont là ; les notes brutes non.
8. « Comparer mes cibles dans la Boussole » en navigation privée (sans compte) : la Boussole s'ouvre sur le tableau avec 6 opportunités (3 cibles et 3 pistes creusées), 7 critères, des évaluations préremplies et le Talent Unique repris.
9. Limite : avec `MA_CIBLE_MAX_IP_APPROFONDIR=2` sur la prévisualisation, le 3e approfondissement affiche le message de limite dans le bloc, sans casser la page.
10. Un ancien résultat V2a de l'historique s'ouvre sans erreur, sans autres pistes ni boutons d'approfondissement.
11. Impression : portraits et pistes creusées dépliés, aucun bouton.
12. Aucun tiret cadratin ni demi-cadratin dans l'interface (recherche dans le HTML rendu).

### 18.3 Critères d'acceptation (définition de « fini »)
- Toutes les vérifications du §18.2 passent sur mobile et ordinateur.
- `npm test`, `npm run lint`, `npm run typecheck` passent.
- Un parcours sans idées ni notes fait le même nombre d'appels qu'en V2a (2 à 4) et donne un résultat en moins de 4 minutes.
- Aucune note brute dans `localStorage`, `sessionStorage`, la table `ma_cible_reprise` ou les journaux Vercel (vérifier les journaux après la vérification 3).
- Les textes affichés sont exactement ceux de ce document.

---

## 19. Découpage en 3 PR (dans cet ordre, une à la fois)

Attendre que la mise en ligne du correctif PDF du Quiz Amour soit passée (limite de déploiements Vercel). Chaque PR part de `main` à jour, après la fusion de la précédente, et Pierre valide avant chaque fusion.

### PR 1 « Le Cibleur V2b (1/3) : idées de cibles et autres pistes »
Contenu : §5.1 (types `Terrain.ciblesEnTete`, `Esquisse.autresPistes`, `depuisIdees`, `Resultat.autresPistes`, `Cible.depuisIdees`, `Cible.verbatims`, `IdCible` élargi, `EntreeMaCible.synthese` à `null` partout), §5.3 et §5.4 pour les idées, §8.1 (règle 14 seulement), §8.2, §8.3, §8.4, §8.8 (idées seulement ; `ce_que_dit_le_terrain` toujours absent), §7.2 (esquisse tolérante), §7.4 (`MAX_TOKENS.cadrage` et `MAX_TOKENS.resultat` seulement), §7.5 (partie cadrage et résultat), §9.3, §9.4 (cibles : toujours `[]` tant qu'il n'y a pas de synthèse), §9.5, §10 (sauf synthèse et portrait), §4.1, §4.2 bloc A, §4.4, §4.5, §4.6 (pastille « Ton idée », « Chercher sur Google », liens « Voir l'annuaire des salons » et « Salons à l'international » via `ANNUAIRES_SALONS`, section « D'autres pistes » sans bouton « Creuser »), §14 (idées, pistes), §15 (couleurs, icônes, mini-barres), tests 1 à 8. Copier ce cahier des charges dans `docs/cibleur-v2b-spec.md`. Pas de migration, pas de nouvel appel IA.

Prompt pour l'agent :
> Dans `apps/boussole-decision`, réalise la PR 1 du cahier des charges joint `spec-cibleur-v2b.md` (copie-le d'abord dans `docs/cibleur-v2b-spec.md`). Périmètre exact : §19 PR 1. Suis le cahier à la lettre, textes compris, sans tiret cadratin ni demi-cadratin, sans nouveau paquet. Garde la compatibilité des données V2a (§3 règle 6). Lance `npm test`, `npm run lint`, `npm run typecheck`. Ouvre une PR titrée « Le Cibleur V2b (1/3) : idées de cibles et autres pistes » avec des captures à 375 px et 1 280 px de l'étape Terrain, de l'esquisse et de la section « D'autres pistes ». Ne fusionne pas.

### PR 2 « Le Cibleur V2b (2/3) : notes de terrain »
Contenu : §5.1 (`NoteTerrain`, `SyntheseTerrain`), §5.2 (`synthese`), §5.3, §5.4 (notes, synthèse), §6.2 (`synthese`, `retirerVerbatim`), §6.3, §6.4, §7 (synthèse), §8.1 (règle 4), §8.5, §8.8 (`ce_que_dit_le_terrain`), §9.1, §9.2, §10 (synthèse), §11 (toutes les étapes, migration comprise), §4.2 bloc B, §4.6 (« Ce que disent tes clients »), §14 (synthèse), §16, §17, tests 9 à 15. Pierre joue la migration `20261012000000_ma_cible_v2b.sql` dans l'éditeur SQL de Supabase avant ou juste après la fusion.

Prompt pour l'agent :
> Dans `apps/boussole-decision`, réalise la PR 2 de `docs/cibleur-v2b-spec.md` (périmètre exact : §19 PR 2), à partir de `main` qui contient déjà la PR 1. Notes brutes jamais stockées ni journalisées, réponse `synthese` jamais écrite dans la reprise Supabase (§7.6). Ajoute la migration du §11.2 telle quelle et les tests SQL. Lance `npm test`, `npm run lint`, `npm run typecheck`. Ouvre une PR titrée « Le Cibleur V2b (2/3) : notes de terrain » avec des captures à 375 px de l'avertissement, des notes ouvertes et de la synthèse (fournisseur simulé). Ne fusionne pas.

### PR 3 « Le Cibleur V2b (3/3) : portraits, pistes creusées, Boussole »
Contenu : §5.2 (`approfondir`), §6.2 (`portrait`, `piste`), §7 (approfondir), §8.6, §8.7, §8.9, §9.4 (portrait), §9.6, §10 (portrait, piste), §4.6 (bouton « Creuser », pistes creusées, encart Boussole, sommaire), §4.7, §4.8, §4.9, §13, §14 (extras, export), §15.4, tests 16 à 21.

Prompt pour l'agent :
> Dans `apps/boussole-decision`, réalise la PR 3 de `docs/cibleur-v2b-spec.md` (périmètre exact : §19 PR 3), à partir de `main` qui contient les PR 1 et 2. Un seul appel IA à la fois (§6.4), 3 pistes creusées au plus, page publique `/depuis-cibleur` calquée sur `features/amour/LoveStart.tsx` et `startLoveCompassAction`. Lance `npm test`, `npm run lint`, `npm run typecheck`. Ouvre une PR titrée « Le Cibleur V2b (3/3) : portraits, pistes creusées, Boussole » avec des captures à 375 px d'un portrait, de la section « D'autres pistes » avec une piste creusée, et du tableau de la Boussole créé depuis Le Cibleur. Ne fusionne pas.

Recette en ligne après chaque fusion : les points du §18.2 qui concernent la PR, avec `?cle=` ou le compte de Pierre (illimité), jamais avec le quota d'un vrai utilisateur.

---

## 20. Décisions pour Pierre (3, avec recommandation)

Pierre a retenu les trois recommandations ci-dessous (8 octobre 2026) : types de lieux avec le bouton « Chercher sur Google » (et les deux liens d'annuaire du §4.6), portraits à la demande, notes effacées après lecture.

1. **Salons et événements : types de lieux ou vrais noms ?**
   Recommandé : **des types de lieux précis** (par exemple « salons de la reprise d'entreprise à Paris ») avec un bouton « Chercher sur Google » qui donne les vrais noms et les dates du moment. Zéro invention, zéro coût.
   Autre choix : brancher la recherche Google directement dans l'IA pour nommer de vrais salons. Plus impressionnant, mais limité en version gratuite, plus lent, et l'IA peut encore se tromper de date. À garder pour la version payante.

2. **Portraits et pistes : à la demande ou tout d'un coup ?**
   Recommandé : **à la demande**, un bouton par cible (environ 30 secondes) et « Creuser cette piste » (environ 1 minute, 3 au plus). Le résultat reste à 2 ou 3 minutes, et on ne dépense des appels que pour les cibles qui intéressent vraiment la personne.
   Autre choix : les portraits des 3 cibles directement dans le résultat. Le résultat passerait à 4 ou 5 minutes, au-delà du délai actuel, avec plus d'échecs.

3. **Notes d'entretiens : on les garde ou on les efface après lecture ?**
   Recommandé : **effacées dès que l'IA les a lues**. Seule la synthèse reste, dans le navigateur. C'est le plus sûr pour tes clients et le plus simple à expliquer.
   Autre choix : les garder dans le navigateur pour pouvoir relancer la lecture. Pratique, mais des notes sensibles resteraient sur l'ordinateur, y compris un ordinateur partagé.

Limites du jour proposées, réglables sans toucher au code (variables Vercel) : 5 lectures de notes et 20 approfondissements par personne, 100 et 300 au total. Le compte de Pierre reste illimité.
