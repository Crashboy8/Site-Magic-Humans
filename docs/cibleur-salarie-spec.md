# Le Cibleur, voie « salarié » : cahier des charges

Version du 8 octobre 2026. Écrit à partir du code de `main` (d95a415, Cibleur V2b partie 1 en ligne) et de recherches faites le même jour sur ce que LinkedIn autorise (sources au §9). Rien n'a été codé ni envoyé.

## 0. En bref

- **La question centrale change de sens.** Côté indépendant : « qui va me payer, et avec qui je prends du plaisir ? ». Côté salarié : « **quel patron souffre vraiment de ne pas me connaître, a besoin de mon talent, et correspond à mon manager idéal et à mes valeurs ?** ». C'est une **correspondance dans les deux sens** : chaque patron idéal reçoit deux notes, « il a besoin de toi » et « tu as besoin de lui ».
- **On réutilise presque tout** : l'étape Talent, le mécanisme des questions de l'IA, l'esquisse, le résultat, l'historique, l'impression, la limite du jour. On ajoute un choix de voie au début, un Terrain salarié, des prompts et un résultat salarié.
- **La reconversion** est une option de la voie salarié (métier visé, compétences transférables, première marche, immersion).
- **LinkedIn, la réponse honnête** : en 2026, **aucune voie autorisée ne permet à une application tierce d'envoyer un message privé LinkedIn** au nom de quelqu'un (l'interface d'envoi de messages est réservée à des partenaires et le programme est fermé). Ce qui est possible aujourd'hui : se connecter avec LinkedIn, **publier un post** sur son propre fil après validation, et pour les messages, **un brouillon prêt** : texte copié, LinkedIn ouvert sur la bonne personne, la personne colle et envoie. L'**envoi en un clic** est possible **par email**, depuis la boîte de la personne (Gmail ou Outlook connectés).
- Les outils qui « envoient pour toi » sur LinkedIn (Unipile, extensions) passent par le mot de passe ou le cookie de la personne : c'est **interdit par les conditions de LinkedIn** et cela expose **son** compte à une restriction. À ne pas faire.
- La mise en relation avec des offres d'emploi est **hors périmètre** (couche future, §8).
- 5 PR courtes (§12) et 5 décisions pour toi (§13).

## 1. Ce qu'on garde du Cibleur actuel (lu dans le code)

| Brique | Où | Réutilisée telle quelle ? |
|---|---|---|
| Étapes `accueil, talent, terrain, questions, esquisse, resultat` | `features/maCible/etat.ts` (`ETAPES`) | oui, la voie salarié garde les mêmes étapes, seul le contenu de `terrain` et de `resultat` change |
| Talent (mécanisme, Contexte Déclencheur, Super Bénéfice, Anti-Contexte, réussite) et pré-remplissage `#q=`, `#b=`, `#cible=` | `domain/maCible/types.ts` (`Talent`), `ancre.ts` | oui |
| Route `POST /api/ma-cible/`, fournisseur IA, relance, reprise 20 minutes | `lib/maCible/traitement.ts`, `lib/ia/fournisseur.ts`, `lib/maCible/reprise.ts` | oui, avec un champ `voie` |
| Limite du jour (`ma_cible_quota`, `ma_cible_autoriser`, `ma_cible_consommer`) | `lib/maCible/quota.ts`, migrations `20261010*` | oui, mêmes compteurs `cadrage` et `resultat` ; une étape `message` en plus (§10) |
| Stockage navigateur `ma_cible_v1`, historique de 10 résultats | `features/maCible/stockage.ts`, `historique.ts` | oui, champ `voie` en plus, compatible avec les données actuelles |
| Habillage : icônes Lucide sur la ligne du texte, blocs `rounded-2xl border-l-4`, couleurs lilas, corail, framboise, eau, miel, fonds blancs, pas de bleu foncé, mobile d'abord | `Habillage.tsx`, `Icones.tsx`, V2b §15 | oui |
| Copier, imprimer, exporter en texte ou Markdown | `BoutonCopier.tsx`, `export.ts` | oui |
| Lien vers la Boussole (PR 3 du V2b, `/depuis-cibleur/`) | V2b §13 | oui, avec des critères salarié (PR S5) |

## 2. Parcours, écran par écran (mobile 375 px d'abord)

### 2.1 Accueil : le choix de la voie
Juste sous l'introduction, deux grandes cartes blanches côte à côte sur ordinateur, l'une sous l'autre sur téléphone, chacune avec son icône sur la ligne du titre :
- icône `briefcase` (corail) : **« Je veux des clients »** · « Tu es indépendant, freelance, consultant, ou tu veux le devenir. »
- icône `building-2` (eau) : **« Je veux un employeur »** · « Tu cherches un poste, un nouveau patron, ou tu changes de métier. »
Sous les cartes, un lien discret : « Je ne sais pas encore » → ouvre un petit encart : « Pas de souci. Commence par la voie qui t'attire le plus : ton talent reste le même, tu pourras faire l'autre ensuite en deux minutes. Et si tu hésites vraiment entre deux projets, la Boussole de décision est faite pour ça. » (lien vers `/boussole-decision/`).
- Choix gardé dans `ma_cible_v1` (`voie: "independant" | "salarie"`). Les données V2a sans `voie` valent `"independant"`.
- Adresse directe possible : `/boussole-decision/ma-cible/?voie=salarie` (pour les liens depuis les pages d'offre « Reconversion cadre » et « Multi-talents en transition »).
- Changer de voie plus tard : lien « Changer de voie » dans la barre d'étapes ; le Talent est gardé, le Terrain de chaque voie aussi.

### 2.2 Étape Talent : inchangée
Seule la phrase d'aide change selon la voie : « Ton talent, c'est ce qu'un patron va acheter quand il t'embauche. »

### 2.3 Étape Terrain salarié (remplace le Terrain indépendant dans cette voie)
Blocs blancs à bord gauche coloré, un bloc par thème, tous les champs sauf trois facultatifs.

**Bloc 1 « Où tu en es »** (icône `map-pin`, lilas)
- Ta situation (obligatoire, une seule réponse) : « En poste, je veux changer » · « Je cherche un poste » · « Je change de métier » · « Je reviens après une pause » · « Je sors des études ».
- Ton poste actuel ou le dernier (obligatoire, 120 caractères) · placeholder « Exemple : responsable logistique dans l'agroalimentaire ».
- Tes années d'expérience (facultatif, liste : moins de 3, 3 à 10, 10 à 20, plus de 20).
- Les secteurs que tu connais déjà (facultatif, 200).

**Bloc 2 « Ce que tu vises »** (icône `target`, corail)
- Le type de poste visé (facultatif, 160) · « Laisse vide si tu veux que l'IA te propose des pistes. »
- Contrat (plusieurs choix) : CDI · CDD ou mission · Temps partiel · Portage ou management de transition · Peu importe.
- Zone et mobilité (obligatoire, 120) · « Exemple : Lyon et 40 km autour, télétravail 2 jours ».
- Salaire visé (facultatif, deux nombres, brut annuel) · aide : « Une fourchette suffit. Elle sert à écarter les patrons qui ne peuvent pas te payer. »
- Taille d'entreprise préférée (facultatif, plusieurs choix) : Très petite (moins de 10) · PME · Grande entreprise · Association ou secteur public · Peu importe.

**Bloc 3 « Ton manager idéal »** (icône `user-check`, eau). Trois questions courtes, réponses libres de 200 caractères, au moins une remplie :
- « Quand tu reçois une mission, tu préfères… » (placeholder « un cap clair et carte blanche sur le comment »)
- « Quand tu te trompes, ton manager idéal… »
- « Ce que tu veux pouvoir décider seul… »

**Bloc 4 « Tes valeurs »** (icône `heart-handshake`, framboise)
- Choisis 3 valeurs qui ne se négocient pas (puces à cocher, 3 au plus) : Autonomie · Sens · Exigence · Bienveillance · Transparence · Apprentissage · Équilibre de vie · Reconnaissance · Esprit d'équipe · Impact sur le terrain · Créativité · Stabilité ; plus « Autre » (40 caractères).
- « Ce que tu ne veux plus jamais vivre au travail » (facultatif, 300) · aide : « C'est ton Anti-Contexte côté entreprise. »

**Bloc 5 « Reconversion »** (icône `sprout`, miel), visible si la situation est « Je change de métier », sinon replié avec le titre « Tu changes de métier ? »
- Le métier ou le domaine visé (160).
- Ce que tu sais déjà faire et qui servira (300) · aide : « Pense aux situations, pas aux diplômes. »
- Ce qui te manque, à ton avis (200).

**Bloc 6 « Des patrons en tête ? »** (icône `lightbulb`, miel), même logique que le bloc « idées de cibles » du V2b (PR 1) : jusqu'à 5 entreprises, types de structures ou personnes que tu as déjà en tête, 80 caractères chacune. L'IA dit pour chacune si elle colle, en partie ou pas, et pourquoi.

**Bloc « Le ton de tes messages »** : repris du Terrain indépendant (tu ou vous, chaleureux, direct, expert, enjoué).

Bouton : « Voir ce que l'IA en pense » (même bouton, même appel `cadrage`).

### 2.4 Étapes Questions et Esquisse
Même mécanique (jusqu'à 3 tours de questions). L'esquisse salarié montre :
- « Ta promesse à un patron, en une phrase » (modifiable) · exemple : « Je remets de l'ordre dans les chaînes logistiques qui débordent, sans casser l'équipe. »
- Les 3 portraits de patrons idéaux en une ligne chacun, à valider, corriger ou remplacer.
- Les verdicts sur les « patrons en tête ».

### 2.5 Résultat salarié
Sommaire en haut (comme le résultat actuel), puis :

1. **Ta promesse** (bloc lilas) : la phrase, et « Ce que tu règles pour un patron » en 3 puces.
2. **Tes 3 patrons idéaux**, une carte blanche par patron, chacune avec :
   - nom de la cible (« Directeur des opérations d'une PME industrielle en croissance ») ;
   - **double note** sur la même ligne, deux mini barres : « Il a besoin de toi » (corail) et « Tu as besoin de lui » (eau), chacune sur 10, et la **correspondance** (la plus basse des deux, arrondie) ; aide au survol et en texte sous les barres : « Une bonne correspondance, c'est les deux à la fois. » ;
   - les 4 sous notes de chaque côté, de 1 à 5 : *Il a besoin de toi* = urgence de son problème, rareté de ton profil pour lui, capacité à embaucher et à payer, facilité à le joindre ; *Tu as besoin de lui* = style de management, valeurs, ton Contexte Déclencheur présent, cadre de vie (zone, contrat, salaire) ;
   - **son portrait** : secteur, taille, type de structure, moment de vie de l'entreprise (croissance, rachat, crise, transformation) ;
   - **le problème qui lui coûte** (sa douleur) et **pourquoi il souffre de ne pas te connaître** ;
   - **ce que ton talent lui apporte** ;
   - **son style de management probable** et **ses valeurs probables**, avec ce qui colle et ce qui frotte avec tes réponses ;
   - **les signaux à vérifier en entretien** : 3 questions à poser pour savoir si c'est vraiment ton manager idéal (« Racontez moi la dernière fois qu'un membre de l'équipe s'est trompé. Qu'est ce qui s'est passé ensuite ? ») ;
   - **où le trouver** (§2.6) ;
   - **tes 3 pitchs** (§2.7) ;
   - « Un cas imaginé pour illustrer » (jamais de vrai nom, même règle que l'actuel).
3. **Ton manager idéal** (bloc eau) : portrait en 5 lignes, ce qui te met dans le flow avec lui, ce qui t'éteint.
4. **Le patron à fuir** (bloc framboise, l'anti cible) : 3 signaux d'alerte repérables avant de signer.
5. **Si tu changes de métier** (bloc miel, seulement dans ce cas) : tes compétences transférables (3 à 5, chacune avec la preuve tirée de tes réponses), la **première marche** (un poste passerelle réaliste), et 3 façons d'essayer avant de sauter : une mission courte, une immersion professionnelle (en France, l'immersion facilitée : `immersion-facile.beta.gouv.fr`), une formation courte. Jamais de promesse de financement.
6. **Ton plan sur 30 jours** (même composant `Plan30`, 4 semaines de 3 actions, rattachées aux patrons c1, c2, c3 ou « toutes »).
7. **Test terrain** : 5 questions pour un « entretien conseil » de 15 minutes avec quelqu'un du métier, signaux positifs et négatifs.
8. **Appel Découverte** (Calendly, `utm_content=resultat-salarie`), puis Boussole (PR 3), historique, impression, export.

### 2.6 « Où le trouver, et comment le rencontrer »
Pour chaque patron idéal, mêmes règles que les salons du V2b (décision §20.1 : **des types précis, jamais de noms inventés**, avec un bouton « Chercher sur Google ») :
- **Types d'entreprises** : 2 à 3 types précis (« PME industrielles de 50 à 250 salariés qui viennent d'ouvrir un deuxième site »), chacun avec un bouton « Trouver des entreprises » qui ouvre l'**Annuaire des Entreprises** de l'État (`annuaire-entreprises.data.gouv.fr`, gratuit, officiel) ou une recherche Google préparée.
- **Événements** : types de salons professionnels du secteur (pas des salons de l'emploi en priorité : c'est là que le patron est disponible et pas assailli), petits déjeuners de clubs d'entreprises, conférences métier. Bouton « Chercher sur Google » et les deux annuaires de salons déjà présents (`ANNUAIRES_SALONS`).
- **Réseaux** : associations professionnelles du métier, réseau des anciens élèves, clubs d'entreprises locaux, CCI, réseaux de dirigeants. Toujours en types, avec recherche Google.
- **LinkedIn** : intitulés de poste du **décideur** (pas seulement des RH : le manager opérationnel qui souffre du problème), mots clés, secteurs, taille, zone (champs déjà prévus dans `Cible.linkedin`), et un bouton « Chercher sur LinkedIn » (§5.3).
- **Comment le rencontrer** : 3 approches classées pour ce patron, parmi : demande de conseil de 15 minutes, recommandation par une connaissance commune (« Qui dans ton réseau connaît ce milieu ? »), candidature spontanée ciblée sur son problème (pas sur un poste), rencontre à un événement, commentaire utile sur ses publications puis message.

### 2.7 Les pitchs (par patron)
- **Message LinkedIn** en deux versions : la **note d'invitation** (200 caractères au plus, parce que les comptes gratuits sont limités à 200 caractères et à quelques notes par mois selon Unipile, §9) et le **message** après connexion (600 caractères au plus).
- **Email** : objet (60 caractères au plus) et corps (900 au plus), centré sur son problème, avec une demande légère (« 15 minutes de votre avis »).
- **Pitch oral de 30 secondes** : 70 à 85 mots, en 3 temps (ce que tu règles, une preuve, ta demande), avec un bouton « Le lire à voix haute » (synthèse vocale du navigateur, `speechSynthesis`, rien n'est envoyé).
- Ton et tutoiement ou vouvoiement selon le bloc « ton ». Le prénom remplacé comme aujourd'hui (`remplacerPrenom`).

## 3. Données (types, sans casser V2a et V2b)

`src/domain/maCible/types.ts` :
```ts
export type Voie = "independant" | "salarie";
export type SituationSalarie = "en_poste" | "recherche" | "reconversion" | "retour" | "etudes";
export type Contrat = "cdi" | "cdd_mission" | "temps_partiel" | "portage_transition" | "peu_importe";
export type TailleEntreprise = "tpe" | "pme" | "grande" | "asso_public" | "peu_importe";
export type Valeur = "autonomie" | "sens" | "exigence" | "bienveillance" | "transparence" | "apprentissage"
  | "equilibre" | "reconnaissance" | "equipe" | "impact" | "creativite" | "stabilite";

export interface TerrainSalarie {
  situation: SituationSalarie | "";
  posteActuel: string;          // ≤ 120, obligatoire
  experience: "" | "moins3" | "3a10" | "10a20" | "plus20";
  secteursConnus: string;       // ≤ 200
  posteVise: string;            // ≤ 160
  contrats: Contrat[];
  zone: string;                 // ≤ 120, obligatoire
  salaireMin: number | null; salaireMax: number | null;   // brut annuel, euros
  tailles: TailleEntreprise[];
  manager: { mission: string; erreur: string; decider: string };  // ≤ 200 chacun, au moins un rempli
  valeurs: Valeur[];            // ≤ 3
  valeurAutre: string;          // ≤ 40
  plusJamais: string;           // ≤ 300
  reconversion: { metierVise: string; transferables: string; manque: string }; // ≤ 160, 300, 200
  patronsEnTete: string[];      // ≤ 5 × 80
  adresse: Adresse; style: Style;
}

export interface NotesBesoin { urgence: number; rarete: number; paiement: number; acces: number }       // 1 à 5
export interface NotesEnvie { management: number; valeurs: number; declencheur: number; cadre: number } // 1 à 5

export interface PatronIdeal {
  id: IdCiblePrincipale; nom: string;
  portrait: { secteur: string; taille: string; structure: string; moment: string };
  douleur: string; pourquoiToi: string; ancrage: string;
  management: { style: string; colle: string; frotte: string };
  valeurs: { probables: string[]; colle: string; frotte: string };
  questionsEntretien: string[];          // 3
  besoin: NotesBesoin; envie: NotesEnvie;
  lieux: { type: string; pourquoi: string; recherche: string; genre: "entreprises" | "evenement" | "reseau" }[]; // 3 à 6
  approches: { genre: "conseil" | "recommandation" | "spontanee" | "evenement" | "contenu"; action: string }[]; // 3
  linkedin: Cible["linkedin"];           // même forme que l'indépendant
  pitchs: { noteInvitation: string; messageLinkedin: string; emailObjet: string; emailCorps: string; oral30s: string };
  exemple: string; depuisIdees: string[];
}

export interface ResultatSalarie {
  voie: "salarie";
  promesse: string; regle: string[];     // 3 puces
  patrons: PatronIdeal[];                // exactement 3
  managerIdeal: { portrait: string; flow: string; eteint: string };
  antiPatron: { portrait: string; signaux: string[] };   // 3 signaux
  reconversion: null | { transferables: { competence: string; preuve: string }[]; premiereMarche: string; essais: string[] };
  plan30: Resultat["plan30"];            // même forme
  testTerrain: Cible["testTerrain"];
}
```
- `EntreeMaCible` gagne `voie: Voie` (défaut `"independant"`) et `terrainSalarie: TerrainSalarie | null`.
- Scores calculés côté code, pas par l'IA (module pur `domain/maCible/scoresSalarie.ts`, comme `scores.ts`) : `besoin10 = moyenne(besoin) × 2`, `envie10 = moyenne(envie) × 2`, `correspondance = min(besoin10, envie10)`, arrondis à 0,1 et affichés avec une virgule.
- Limites dans `limites.ts`, validation dans `entree.ts` et `validation.ts`, schéma JSON dans `schemas.ts` (même méthode que l'existant).

## 4. Prompts (`src/domain/maCible/prompt.ts`)
- `PROMPT_COMMUN` gagne une règle : « Voie salarié : tu parles d'employeurs et de managers, jamais de clients ni de prix de prestation. Tu ne cites jamais une vraie entreprise ou une vraie personne, sauf si la personne l'a écrite elle même dans ses patrons en tête. »
- `promptCadrageSalarie(tour)` et `PROMPT_RESULTAT_SALARIE`, construits avec la même grille que l'existant (règles de langue identiques, règle 11 sur les termes anglais et espagnols reprise telle quelle).
- Règles propres au résultat salarié :
  1. Les 3 patrons sont différents par le secteur **ou** la taille **ou** le moment de vie de l'entreprise.
  2. Chaque note d'envie s'appuie sur une réponse précise des blocs 3 et 4 ; si la personne n'a rien dit, note 3 et le dire dans `frotte`.
  3. `pourquoiToi` relie la douleur du patron au Contexte Déclencheur et au Super Bénéfice, avec les mots de la personne.
  4. Pas de promesse d'embauche, de salaire ni de financement.
  5. Pitchs : longueurs du §2.7, pas d'émoji dans l'email, une seule demande par message.
- Contrôles déterministes (module `qualiteSalarie.ts`, comme `qualite.ts`) : longueurs, 3 patrons distincts, notes entières de 1 à 5, au moins 2 actions du plan par patron, aucun terme de la voie indépendante (« client », « tarif », « prestation ») dans les patrons.

## 5. LinkedIn intégré (les deux voies)

### 5.1 Ce que LinkedIn permet vraiment en octobre 2026 (sources au §9)
| Besoin de Pierre | Possible ? | Par quoi | Conditions |
|---|---|---|---|
| Se connecter avec **son propre** compte LinkedIn | **Oui, tout de suite** | « Sign In with LinkedIn using OpenID Connect », droits `openid profile email` | produit libre d'accès (« Open Permissions »), activé dans le portail développeur. Donne nom, photo, email. Ne vérifie pas l'identité. |
| Publier un **post** sur son fil | **Oui, tout de suite** | « Share on LinkedIn », droit `w_member_social` (API Posts) | produit libre d'accès. Permet aussi commenter et aimer au nom de la personne. |
| Envoyer un **message privé** à quelqu'un | **Non** | « Messages API » | « réservée aux partenaires approuvés », seulement vers des relations directes, rattachée au programme Compliance, **fermé** (« Access is closed and may not be requested »). Même pour un partenaire : brouillon modifiable et geste d'envoi obligatoires, jamais d'envoi automatique ou programmé. |
| Envoyer une **invitation** avec note | **Non** | Invitations | même programme fermé |
| **Chercher des profils** (intitulé, entreprise, zone) | **Non** | pas d'API publique ; Sales Navigator (SNAP) | « We are not currently accepting new partners » |
| Lire les posts d'une cible pour personnaliser | **Non** | `r_member_social` | permission restreinte |
| Lien de partage officiel | Oui | `linkedin.com/sharing/share-offsite/?url=` | adresse seulement, pas de texte |
| Lien qui ouvre un post pré rempli | Instable | `linkedin.com/feed/?shareActive=true&text=` | **non documenté**, signalé comme ne marchant plus par plusieurs utilisateurs (article marqué « deprecated as of March 2026 ») |
| Lien qui ouvre la messagerie sur une personne | Instable | `linkedin.com/messaging/compose/?recipient=<identifiant du profil>` | **non documenté**, ouvre la fenêtre adressée, **sans texte** pré rempli (aucun paramètre de texte connu) |
| Outils « qui envoient pour toi » (Unipile, extensions) | **Risqué** | mot de passe ou cookie `li_at` de la personne, proxys | contraire aux conditions d'utilisation (§5.2) |

### 5.2 Les conditions d'utilisation (version en vigueur depuis le 3 novembre 2025)
Article 8.2 « Don'ts », ce que **le membre** s'engage à ne pas faire :
- utiliser le compte d'un autre « such as sharing log-in credentials or copying cookies » : c'est exactement ce que demandent Unipile (connexion par mot de passe ou par le cookie `li_at`, documentation Unipile) et les services du même type ;
- utiliser des robots ou des extensions pour copier les profils et les données ;
- « Use bots or other unauthorized automated methods to access the Services, add or download contacts, send or redirect messages, create, comment on, like, share, or re-share posts » ;
- « Deep-link to our Services for any purpose other than to promote your profile or a Group on our Services, without LinkedIn's consent » : les liens profonds vers la messagerie ou la recherche sont donc une **zone grise**.
La page d'aide « Prohibited software and extensions » dit que les membres qui utilisent ces outils « risk having their accounts restricted or shut down ». En 2025, LinkedIn a fait fermer Proxycurl (décision de justice, juillet 2025) et a retiré un temps les pages d'Apollo.io et Seamless.ai (mars 2025). Unipile lui même écrit que les invitations sont « the one that gets accounts restricted fastest » et que la connexion par identifiants peut déclencher un avertissement LinkedIn.
**Conclusion : le risque d'un outil d'envoi non officiel retombe sur le compte de l'utilisateur, et sur Magic Humans qui garderait ses identifiants ou cookies. Non.**

### 5.3 L'architecture conforme la plus proche de ton souhait
Trois niveaux, toujours **une validation humaine avant chaque envoi**, avec **repli automatique** vers le niveau du dessous.

**Repérer la cible (sans chercher à la place de la personne).** L'outil ne peut pas fouiller LinkedIn. Il prépare la recherche, la personne la fait elle même :
- bouton « Chercher sur LinkedIn » : ouvre la recherche de personnes LinkedIn avec les mots clés et l'intitulé du décideur (lien `linkedin.com/search/results/people/?keywords=…`, zone grise « deep link » mais simple lien ouvert par la personne dans son navigateur, aucun automatisme) ;
- bouton « Chercher via Google » : `site:linkedin.com/in` + intitulé + zone (pas de lien profond vers LinkedIn) ;
- quand la personne a trouvé quelqu'un, elle **colle l'adresse du profil** (`linkedin.com/in/…`) et répond à 2 questions courtes, **avec ses mots** : « Qu'est ce qui t'a fait penser à cette personne ? » et « Un point commun ou un détail récent ? » (120 caractères chacune). On ne lui demande **pas** de copier le texte du profil (conditions 8.2 et RGPD, §6).
- L'IA (étape `message`, petit appel) adapte alors la note d'invitation, le message et l'email à cette personne précise.

**Niveau 1 : envoi en un clic, après validation.**
- **Post LinkedIn** (connexion `w_member_social`) : un post de visibilité proposé par l'IA (« Ce que j'apprends en accompagnant… »), modifiable, bouton « Publier sur mon LinkedIn ». Rien n'est publié sans ce clic. Prudence dans la voie salarié : un post « je cherche » peut être vu par l'employeur actuel, d'où un avertissement si la situation est « En poste ».
- **Email** depuis la boîte de la personne : connexion Google (droit `gmail.send`, classé « sensible » : vérification de l'application par Google nécessaire, sans audit de sécurité) ou Microsoft (`Mail.Send`). La personne saisit l'adresse du destinataire, relit, modifie, clique « Envoyer depuis ma boîte ». Le message part de **son** adresse.
- **Message privé LinkedIn : pas de niveau 1 possible aujourd'hui.** Si LinkedIn rouvre un jour l'accès aux messages, l'écran est déjà conforme à ses exigences (brouillon modifiable, geste d'envoi).

**Niveau 2 : brouillon prêt (par défaut pour les messages LinkedIn).**
- Bouton « Préparer mon message » : le texte est **copié** dans le presse papiers et LinkedIn s'ouvre dans un nouvel onglet **sur le profil collé** (`linkedin.com/in/…`, un lien ordinaire). Un encart reste affiché : « Ton message est copié. Sur LinkedIn, clique sur Message (ou Se connecter, puis Ajouter une note), colle, relis, envoie. » Option à trancher : ouvrir directement `messaging/compose/?recipient=…` (§13, décision 4).
- Email sans connexion : lien `mailto:` avec objet et corps pré remplis (norme des liens email), qui ouvre l'application de messagerie de la personne.
- Post sans connexion : texte copié + lien de partage officiel `share-offsite` vers une page publique si besoin, ou ouverture de LinkedIn avec l'encart « colle ton post ».

**Niveau 3 : copie manuelle (toujours visible).** Les boutons « Copier » actuels (`BoutonCopier.tsx`) restent sous chaque texte.

**Repli automatique.** Pas connecté, jeton expiré, refus de LinkedIn ou de Google, erreur réseau : on affiche le niveau 2, avec une phrase « La publication directe n'a pas marché, ton texte est copié : colle le sur LinkedIn. ». Presse papiers refusé par le navigateur : le niveau 3 se déplie et le texte est sélectionné.

**Mobile.** Sur téléphone, les liens `linkedin.com/in/…` ouvrent en général l'application LinkedIn ; la copie fonctionne ; les liens profonds de messagerie ne sont pas fiables dans l'application (à vérifier en recette).

### 5.4 Technique de la connexion
- Route `GET /api/linkedin/connexion` (redirige vers LinkedIn avec `state` aléatoire), `GET /api/linkedin/retour` (échange du code côté serveur), `POST /api/linkedin/publier` (publie un post validé), `POST /api/linkedin/deconnexion`.
- Clés `LINKEDIN_CLIENT_ID` et `LINKEDIN_CLIENT_SECRET` **seulement dans les variables Vercel** du projet `boussole-decision`.
- Le jeton d'accès LinkedIn est gardé **chiffré dans un cookie `httpOnly`, `secure`, `sameSite=lax`**, jamais en base, jamais côté navigateur lisible, effacé à la déconnexion. Durée : celle indiquée par LinkedIn (`expires_in`), sans renouvellement automatique.
- Même méthode pour Google ou Microsoft (PR S4b, seulement si tu dis oui, décision 3).

## 6. RGPD : ce qui est stocké
| Donnée | Où | Durée |
|---|---|---|
| Réponses Talent et Terrain salarié (dont salaire, situation, valeurs) | navigateur (`ma_cible_v1`) | jusqu'à « Tout effacer » |
| Résultats | navigateur (historique, 10 au plus) | idem |
| Contenu envoyé à l'IA | serveur, le temps de l'appel ; fournisseur IA (Gemini en production) | non gardé par Magic Humans ; reprise 20 minutes (`ma_cible_reprise`) comme aujourd'hui |
| Compteur de la limite du jour | Supabase `ma_cible_quota` : empreinte IP salée + nombre | 2 jours |
| Adresse du profil LinkedIn d'un tiers et les 2 réponses sur lui | navigateur seulement, envoyées à l'IA pour l'étape `message` | effacées avec le résultat ; **jamais** gardées côté serveur ni journalisées |
| Jeton LinkedIn, Google ou Microsoft | cookie chiffré `httpOnly` | durée du jeton, effacé à la déconnexion |
| Nom, photo, email LinkedIn | affichés, pas stockés | |
- Données sensibles : la situation « je cherche un poste » ou « en poste, je veux changer » est confidentielle vis à vis de l'employeur ; rappel dans l'encart de confidentialité : « Rien n'est envoyé à ton employeur ni publié sans ton clic. »
- Tiers (le patron ciblé) : base « intérêt légitime » de la personne qui prospecte, minimisation (pas de copie de profil), rien de gardé par Magic Humans. Un message de prospection doit permettre au destinataire de refuser facilement : le prompt ajoute une phrase de sortie simple dans l'email (« Si ce n'est pas le bon moment, dites le moi simplement. »).
- Politique de confidentialité du site (`/confidentialite/`) : un paragraphe « Le Cibleur, voie salarié et connexion LinkedIn » (texte dans la PR S3).

## 7. Habillage
Même grammaire que le Cibleur actuel : icône sur la ligne du texte, blocs blancs à bord gauche coloré, couleurs variées (lilas pour la promesse, corail pour « il a besoin de toi », eau pour « tu as besoin de lui » et le manager, framboise pour le patron à fuir, miel pour la reconversion et les idées), **pas de bleu foncé**, contrastes déjà calculés au V2b §15.1. Mobile d'abord : à 375 px, les deux barres de la double note sont l'une sous l'autre ; les boutons de niveau 1 et 2 prennent toute la largeur ; les pitchs sont repliables (`details`). Animations coupées si `prefers-reduced-motion`.

## 8. Hors périmètre, pour plus tard
- **Mise en relation avec des offres d'emploi** (couche future) : il faudrait une source d'offres autorisée (par exemple l'API Offres d'emploi de France Travail, ou un partenaire), un rapprochement entre le portrait du patron idéal et les offres, et des alertes. Rien de cela dans ces PR.
- Suivi des contacts (qui a répondu, relances) : à penser avec le plan unique sur 30 jours (chantier 3).
- Commenter les posts d'une cible via l'API : la permission `w_member_social` le couvre en théorie, mais il faut l'identifiant du post et la lecture des posts est restreinte. À tester avant d'en parler.

## 9. Sources (consultées le 8 octobre 2026)
- Accès aux API LinkedIn, permissions libres et programmes fermés : https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
- Sign In with LinkedIn using OpenID Connect : https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
- Flux OAuth 2.0 à 3 parties : https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow
- Share on LinkedIn (`w_member_social`) : https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
- API Posts (version 2026-09) : https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-09
- Messages API (partenaires, exigences de brouillon et de geste d'envoi) : https://learn.microsoft.com/en-us/linkedin/shared/integrations/communications/messages
- Sales Navigator (SNAP), nouveaux partenaires refusés : https://learn.microsoft.com/en-us/linkedin/sales/
- Conditions d'utilisation, article 8.2 (en vigueur au 3 novembre 2025) : https://www.linkedin.com/legal/user-agreement
- Logiciels et extensions interdits : https://www.linkedin.com/help/linkedin/answer/a1341387
- Activité automatisée : https://www.linkedin.com/help/linkedin/answer/a1340567
- Unipile, connexion par identifiants ou cookie `li_at`, proxys : https://developer.unipile.com/docs/linkedin
- Unipile, limites et restrictions de comptes : https://www.unipile.com/linkedin-api-rate-limits/
- Proxycurl, décision de juillet 2025 : https://www.socialmediatoday.com/news/linkedin-wins-legal-case-data-scrapers-proxycurl/756101/
- Apollo.io et Seamless.ai retirés de LinkedIn (mars 2025) : https://martech.org/a-pair-of-lead-gen-providers-have-disappeared-from-linkedin/
- Lien de messagerie `?recipient=` (non documenté) : https://mhdigitalgroup.com/misc/linkedin-trick/
- Lien de post pré rempli, devenu instable : https://www.linkedin.com/pulse/how2-create-link-auto-generates-linkedin-post-ryan-harris-jgkfc
- Droits Gmail (`gmail.send` sensible) : https://developers.google.com/workspace/gmail/api/auth/scopes
- Droits Microsoft Graph (`Mail.Send`) : https://learn.microsoft.com/en-us/graph/permissions-reference
- Annuaire des Entreprises : https://annuaire-entreprises.data.gouv.fr/
- Immersion facilitée : https://immersion-facile.beta.gouv.fr/

## 10. Coût IA et limite du jour (même logique que `ma_cible_quota`)
- La voie salarié **utilise les mêmes compteurs** `cadrage` et `resultat` que la voie indépendant : changer de voie ne double pas la limite. Budget de jetons identique (`MAX_TOKENS.cadrage` 2 500, `MAX_TOKENS.resultat` 10 000, délais 90 s et 240 s), donc **même coût par résultat** que l'indépendant.
- Nouvelle étape comptée `message` (personnaliser les pitchs pour une personne précise) : petit appel, `MAX_TOKENS.message = 1 200`, délai 45 s. Limites proposées : **20 par personne et par jour, 600 au total**, variables `MA_CIBLE_MAX_IP_MESSAGE` et `MA_CIBLE_MAX_GLOBAL_MESSAGE`. Compte de Pierre (`MA_CIBLE_EMAILS_ILLIMITES`) et `MA_CIBLE_CLE_TEST` hors limite comme aujourd'hui.
- Migration `supabase/migrations/20261020000000_ma_cible_message.sql` : élargir le `check` de `ma_cible_quota.etape` et la liste de `ma_cible_consommer` et `ma_cible_autoriser` à `('cadrage','resultat','synthese','approfondir','message')`, rejouable, sur le modèle exact de la migration V2b §11.2.
- Publication LinkedIn et envoi d'email : **aucun appel IA**, aucun coût, pas de compteur (le texte est déjà généré).
- Pour les limites gratuites de Gemini, voir le V2b §12 : l'étape `message` ajoute des requêtes courtes, à surveiller dans la console du fournisseur.

## 11. Tests et recette
- Vitest : types et compatibilité (`voie` absente = indépendant), validation du Terrain salarié, `scoresSalarie` (min, arrondi), `qualiteSalarie`, prompts (présence des règles, langue), traitement de l'étape `message`, quota `message`, construction des liens (`mailto:`, profil LinkedIn validé : seulement `https://www.linkedin.com/in/…`), repli automatique (jeton absent → niveau 2).
- Recette 375 px et 1 280 px, avec `?cle=` ou le compte de Pierre, **jamais** le quota d'un vrai utilisateur. Publication LinkedIn testée sur le compte de Pierre, avec un post en visibilité « relations ».

## 12. Découpage en PR courtes (chaque PR = 2 mises en ligne)
À commencer **après la fusion des PR 2 et 3 du Cibleur V2b**, une PR à la fois, ta validation avant chaque fusion. Copier ce cahier dans `docs/cibleur-salarie-spec.md` dans la PR S1.

### PR S1 « Le Cibleur salarié (1/5) : données, prompts et API »
Types §3, limites, validation, schémas, prompts §4, `qualiteSalarie`, `scoresSalarie`, champ `voie` dans la route, tests. Aucun écran visible (la voie n'est pas proposée à l'accueil).
> Dans `apps/boussole-decision`, réalise la PR S1 de `docs/cibleur-salarie-spec.md` (copie d'abord `/workspace/cibleur-salarie/spec-cibleur-salarie.md` à cet endroit) : §3, §4 et la partie route du §1, rien d'autre. Compatibilité totale avec les données V2a et V2b (`voie` absente = `"independant"`). Aucun nouveau paquet, aucun tiret cadratin ni demi-cadratin. Lance `npm test`, `npm run lint`, `npm run typecheck`. Ouvre la PR « Le Cibleur salarié (1/5) : données, prompts et API », avec un exemple de résultat salarié produit par le fournisseur simulé. Ne fusionne pas.

### PR S2 « Le Cibleur salarié (2/5) : choix de la voie, Terrain et résultat »
§2.1 à §2.7 sauf la connexion LinkedIn, §7, textes dans `i18n/messages/maCible.ts`, `?voie=salarie`, export et impression du résultat salarié.
> Dans `apps/boussole-decision`, réalise la PR S2 de `docs/cibleur-salarie-spec.md` : §2 (sans §5) et §7, textes exacts du cahier, à partir de `main` qui contient S1. Réutilise `Habillage`, `Icones`, `Plan30`, `BoutonCopier`, `LiensLieu`. Pas de bleu foncé, icônes sur la ligne du texte, mobile d'abord. Lance `npm test`, `npm run lint`, `npm run typecheck`. Captures à 375 px : accueil avec les deux voies, Terrain salarié, une carte de patron idéal avec la double note, bloc reconversion. Ne fusionne pas.

### PR S3 « Le Cibleur (3/5) : messages prêts à envoyer, niveaux 2 et 3 »
Les deux voies. Repérage (§5.3 : recherche LinkedIn et Google, profil collé, 2 questions), étape IA `message` + migration §10, bouton « Préparer mon message » (copie + ouverture du profil), `mailto:`, repli vers la copie, paragraphe de la politique de confidentialité, encart RGPD.
> Dans `apps/boussole-decision`, réalise la PR S3 de `docs/cibleur-salarie-spec.md` : §5.3 niveaux 2 et 3 seulement (aucune connexion à LinkedIn, Google ou Microsoft), §6, §10 (étape `message`, migration `20261020000000_ma_cible_message.sql` rejouable). N'accepte que des adresses `https://www.linkedin.com/in/…`. Rien d'envoyé ou publié sans clic. Ajoute le paragraphe dans `confidentialite/index.html`. Lance les tests, le lint et le typecheck. Captures à 375 px du repérage et de l'encart « Ton message est copié ». Ne fusionne pas. Pierre joue la migration dans Supabase.

### PR S4 « Le Cibleur (4/5) : connexion LinkedIn et publication » (si décision 2 = oui)
§5.4 : OpenID Connect, `w_member_social`, publier un post validé, déconnexion, repli automatique. (S4b, email depuis Gmail ou Outlook, seulement si décision 3 = oui, en PR séparée.)
> Dans `apps/boussole-decision`, réalise la PR S4 de `docs/cibleur-salarie-spec.md` : §5.3 niveau 1 « Post LinkedIn » et §5.4. Droits `openid profile email w_member_social` seulement. Jeton chiffré dans un cookie `httpOnly`, jamais en base ni dans les journaux. Clés lues dans `LINKEDIN_CLIENT_ID` et `LINKEDIN_CLIENT_SECRET` (variables Vercel, ne jamais les écrire dans le code ni les demander). Avertissement si la situation est « En poste ». Repli vers le niveau 2 sur toute erreur. Tests du repli et de la validation obligatoire. Ne fusionne pas.

### PR S5 « Le Cibleur salarié (5/5) : vers la Boussole »
Variante salarié de `/depuis-cibleur/` (PR 3 du V2b) : profil « Mes patrons idéaux (Le Cibleur) », critères « Ce manager me laisse décider », « Ses valeurs sont les miennes », « Mon talent y est attendu », « Le salaire et le contrat me vont », « Le trajet et le rythme me vont », notes préremplies depuis `besoin` et `envie`.
> Dans `apps/boussole-decision`, réalise la PR S5 de `docs/cibleur-salarie-spec.md` : étends `src/domain/boussoleCibles.ts` et `startCiblesCompassAction` (PR 3 du V2b) avec `voie: "salarie"`, sans changer le comportement de la voie indépendant. Tests de correspondance des notes. Capture du tableau créé. Ne fusionne pas.

## 13. Décisions pour toi
1. **Voie salarié dans le même outil ou un outil à part ?** Recommandé : **le même Cibleur, avec le choix à l'accueil**. Le talent, les questions et le résultat sont les mêmes briques ; une seule limite du jour ; une seule adresse à faire connaître. Autre choix : un outil séparé « Le Cibleur Emploi », plus clair en communication mais tout à maintenir en double.
2. **Connexion LinkedIn (niveau 1, publication de posts) : maintenant ou après ?** Recommandé : **après**, une fois les messages prêts (S3) en ligne et utilisés. La connexion apporte surtout la publication de posts, pas l'envoi de messages, et demande une application LinkedIn à créer à ton nom et à garder à jour.
3. **Envoi d'email en un clic depuis Gmail ou Outlook ?** Recommandé : **pas tout de suite**. Le `mailto:` fait presque aussi bien sans vérification Google ni stockage de jeton. À reprendre si les utilisateurs envoient beaucoup d'emails depuis l'outil.
4. **Ouvrir directement la messagerie LinkedIn (`messaging/compose/?recipient=`) ?** Recommandé : **non par défaut**, ouvrir le profil collé. Le lien de messagerie n'est pas documenté, peut casser sans prévenir, et les conditions de LinkedIn visent les liens profonds. Le gain est d'un seul clic.
5. **Outils non officiels (Unipile, extensions) pour un vrai envoi automatique ?** Recommandé : **non, jamais**. Le risque de restriction retombe sur le compte de tes utilisateurs, et Magic Humans devrait garder leurs mots de passe ou cookies. C'est contraire à ce que tu défends (la confiance).
