// Boussole Relation (mode amour, ?theme=amour) : modèle de décision et textes, en français uniquement.
// Données pures, lues par src/features/amour/ et src/domain/loveReading.ts.
import type { CriterionDirection, Importance } from "@/domain/types";

/** Repère posé dans la description du profil : c'est lui qui active l'affichage « mode amour ». */
export const LOVE_PROFILE_MARKER = "Boussole Relation (mode amour)";

/** Vrai si le profil a été créé par la Boussole Relation. */
export const isLoveProfile = (profile: { description: string }) => profile.description === LOVE_PROFILE_MARKER;

export interface LoveCriterionTemplate {
  key: string;
  category: string;
  label: string;
  /** Question d'évaluation affichée dans le guide, au-dessus du tableau. */
  guide: string;
  importance: Importance;
  nonNegotiable: boolean;
  direction: CriterionDirection;
  /** Critère critique : un score bas déclenche une alerte, quel que soit le total. */
  critical: boolean;
  /** Texte de l'alerte si ce critère est bas (satisfaction de 50 % ou moins). */
  alert: string;
}

export const LOVE_TEMPLATE = {
  profileName: "Boussole Relation",
  profileDescription: LOVE_PROFILE_MARKER,
  versionName: "Ma relation, première lecture",
  opportunityName: "Ma relation",
  decision: "Cette relation me correspond-elle ?",
  categories: [
    { key: "fond", label: "Le fond : besoins, respect, valeurs" },
    { key: "direction", label: "La direction commune" },
    { key: "quotidien", label: "Le quotidien : défauts et frictions" },
    { key: "energie", label: "L'énergie et l'amour" },
  ],
  criteria: [
    {
      key: "besoins", category: "fond", label: "Mes besoins essentiels sont respectés",
      guide: "Repense à tes deux besoins essentiels (résultat du Quiz Amour). Sont-ils nourris la plupart du temps, et pas seulement dans les bons jours ?",
      importance: "critique", nonNegotiable: false, direction: "TOWARDS", critical: true,
      alert: "Tes besoins essentiels ne sont pas assez respectés dans cette relation. C'est le point qui compte le plus : on peut aimer quelqu'un et s'éteindre à ses côtés. Avant de chercher des compromis ailleurs, demande-toi si l'autre peut nourrir ce besoin sans cesser d'être lui-même.",
    },
    {
      key: "respect", category: "fond", label: "Je me sens respecté·e et en sécurité émotionnelle",
      guide: "Peux-tu dire ce que tu penses, ou dire non, sans peur, sans être rabaissé·e, moqué·e ou puni·e ?",
      importance: "critique", nonNegotiable: false, direction: "TOWARDS", critical: true,
      alert: "Le respect et la sécurité émotionnelle ne sont pas pleinement là. Ce n'est pas une affaire de compatibilité : sans sécurité, aucun autre critère ne peut vraiment compter. Prends ce signal au sérieux et parles-en à quelqu'un de confiance.",
    },
    {
      key: "valeurs", category: "fond", label: "Nous partageons les mêmes valeurs de fond",
      guide: "Sur ce qui est important pour toi (honnêteté, famille, argent, spiritualité, engagement), es-tu d'accord sur l'essentiel, même si tu l'exprimes différemment ?",
      importance: "critique", nonNegotiable: false, direction: "TOWARDS", critical: true,
      alert: "Tes valeurs de fond semblent s'éloigner. Les différences de forme se négocient, les différences de fond usent. Identifie précisément la valeur en jeu et vérifie, calmement, si c'est un malentendu ou un vrai désaccord.",
    },
    {
      key: "direction", category: "direction", label: "Nous allons dans la même direction (projet de vie)",
      guide: "Enfants, lieu de vie, rythme, projets : imagine-toi dans cinq ans. Vois-tu la même vie ?",
      importance: "critique", nonNegotiable: false, direction: "TOWARDS", critical: true,
      alert: "Tes projets de vie ne vont pas dans la même direction. L'amour ne remplace pas une direction commune : l'un des deux risque de renoncer à une part de sa vie. Mets les sujets concrets sur la table (enfants, lieu, rythme) avant de t'engager davantage.",
    },
    {
      key: "defauts", category: "quotidien", label: "Ses défauts, je peux vivre avec dans 10 ans",
      guide: "Pense à ce qui te vide le plus chez l'autre (ton Quiz Amour l'a classé). Est-ce rare, ou installé ? Si ça ne change jamais, peux-tu vivre avec dans dix ans, sereinement ?",
      importance: "critique", nonNegotiable: false, direction: "TOWARDS", critical: true,
      alert: "Certains de ses défauts te semblent difficiles à vivre sur le long terme. Rappelle-toi : on ne change pas quelqu'un. Lui demander de changer, c'est lui demander d'arrêter d'être lui-même. La vraie question est donc : peux-tu l'accepter tel·le qu'il ou elle est ?",
    },
    {
      key: "frictions", category: "quotidien", label: "Nos frictions restent acceptables et se règlent",
      guide: "Tes désaccords se terminent-ils par une solution ou une réconciliation, plutôt que par la même dispute qui revient ?",
      importance: "important", nonNegotiable: false, direction: "TOWARDS", critical: false,
      alert: "",
    },
    {
      key: "energie", category: "energie", label: "Après un moment ensemble, j'ai plus d'énergie",
      guide: "Après une soirée ou un week-end ensemble, te sens-tu plus vivant·e, ou plus vidé·e ? Repense à ce qui te recharge et à ce qui te vide.",
      importance: "tres_important", nonNegotiable: false, direction: "TOWARDS", critical: false,
      alert: "",
    },
    {
      key: "langage", category: "energie", label: "Nos langages de l'amour se rencontrent",
      guide: "Reçois-tu l'amour dans ton langage (paroles, moments, cadeaux, services, toucher), et sais-tu le donner dans le sien ?",
      importance: "important", nonNegotiable: false, direction: "TOWARDS", critical: false,
      alert: "",
    },
    {
      key: "complementarite", category: "quotidien", label: "Nos différences me complètent plus qu'elles ne m'usent",
      guide: "Vos différences (de rythme, de sociabilité, de façon de vivre le couple) t'enrichissent-elles, ou te fatiguent-elles ?",
      importance: "moyen", nonNegotiable: false, direction: "TOWARDS", critical: false,
      alert: "",
    },
    {
      key: "incompatibilite", category: "direction", label: "Une incompatibilité critique existe entre nous",
      guide: "Y a-t-il un point non négociable pour toi sur lequel l'autre est à l'opposé (enfants oui ou non, rythme de vie, liberté face à fusion, valeur fondamentale) ? Si c'est absent, réponds « Absent ».",
      importance: "critique", nonNegotiable: true, direction: "AWAY_FROM", critical: true,
      alert: "Tu signales une incompatibilité critique. Un non-négociable reste non négociable, même avec beaucoup d'amour : si l'un des deux plie, il risque de le regretter et de le reprocher. Nomme-la précisément, et vérifie avec l'autre qu'elle est bien réelle et durable.",
    },
  ] satisfies LoveCriterionTemplate[],
} as const;

export type LoveBandKey = "solide" | "base" | "tension" | "desalignement";

export const LOVE_TEXTS = {
  readingTitle: "Lecture de ta Boussole Relation",
  readingIntro: "Le score résume tes réponses, il ne décide pas à ta place. Lis d'abord les alertes : un point essentiel touché compte plus que n'importe quel total.",
  provisional: "Lecture provisoire : {n} critère(s) sont encore vides ou « à vérifier ». Complète-les pour une lecture fiable.",
  noScore: "Évalue au moins un critère pour obtenir une lecture.",
  scoreLine: "{name} : {score} % d'alignement",
  alertsTitle: "Alertes, quel que soit le score",
  alertIntro: "Ton score est de {score} %, mais un ou plusieurs points essentiels sont touchés. Un bon total peut cacher l'essentiel : lis ceci en premier.",
  genericAlert: "Le critère « {label} » est noté bas alors que tu l'as classé critique. Prends le temps de te demander s'il peut vraiment s'améliorer, et à quelle condition.",
  ligneRougeLow: "Tu vois un début d'incompatibilité critique. Ce n'est peut-être qu'un malentendu : parles-en tôt, franchement, avant que chacun ne s'installe dans l'espoir que l'autre changera d'avis.",
  ligneRougeHigh: "L'incompatibilité critique semble bien présente. Un non-négociable ne se négocie pas : si vous restez ensemble sans le clarifier, l'un de vous deux risque de renoncer à une part essentielle de lui-même. Ce constat peut être douloureux, et il mérite d'être éclairci, à deux ou avec quelqu'un de confiance.",
  safety: "Tu as noté le respect et la sécurité émotionnelle très bas. Si tu vis de la peur, des humiliations, du contrôle ou de la violence, ce n'est pas une question de compatibilité et ce n'est pas de ta faute. En France : 3919 (violences conjugales, gratuit et anonyme, 24h/24), 17 ou 112 en cas de danger immédiat, 114 par SMS. Hors de France, contacte les services d'urgence de ton pays.",
  energyAlert: "Tu as noté que cette relation te vide de ton énergie. Ce n'est pas un détail : une relation qui te correspond te laisse plus vivant·e, pas plus épuisé·e. Regarde ce qui te vide (ton Quiz Amour te le dit) et demande-toi si c'est passager ou installé.",
  quizNoteLabel: "D'après ton Quiz Amour : ",
  bands: {
    solide: {
      title: "Un alignement solide",
      text: "Cette relation nourrit l'essentiel : tes besoins, tes valeurs, ta direction. Les frictions existent sans doute, mais elles restent de forme. Ce n'est pas une garantie, c'est une base. Prends-en soin : continue à parler de tes besoins, à te ressourcer à deux, et à revenir vers cette Boussole si quelque chose change.",
      questions: [
        "Qu'est-ce qui, dans cette relation, me fait le plus de bien, et l'ai-je dit à l'autre ?",
        "Quel petit rituel pourrait protéger ce que nous avons ?",
      ],
    },
    base: {
      title: "Une base réelle, des points à travailler",
      text: "L'essentiel est en grande partie là, mais certains critères tirent le score vers le bas. Regarde lesquels : s'ils touchent la forme (habitudes, frictions), ils se travaillent avec des accords clairs. S'ils touchent le fond (besoins, valeurs, direction), ils méritent une vraie conversation, sans attendre.",
      questions: [
        "Quels sont les deux critères les plus bas, et sont-ils de fond ou de forme ?",
        "Qu'est-ce que je pourrais demander concrètement, sans demander à l'autre de changer qui il ou elle est ?",
      ],
    },
    tension: {
      title: "Une relation sous tension",
      text: "Plusieurs points importants ne sont pas au rendez-vous. Tu peux aimer cette personne et, en même temps, ne pas être heureux·se avec elle : les deux sont vrais. Avant de décider quoi que ce soit, distingue ce qui peut évoluer avec des accords de ce qui demanderait à l'un de vous deux de cesser d'être lui-même.",
      questions: [
        "Si rien ne change dans les deux ans, comment est-ce que je me sens ?",
        "Est-ce que je reste pour ce que nous vivons, ou pour ce que j'espère qu'il ou elle deviendra ?",
      ],
    },
    desalignement: {
      title: "Un désalignement profond",
      text: "Tes réponses montrent un écart important entre ce dont tu as besoin et ce que tu vis. Ce n'est pas un verdict sur la valeur de l'autre ni sur la tienne : c'est le signe que cette relation, telle qu'elle est, ne te correspond pas. Tu n'as pas à décider seul·e ni tout de suite. Un regard extérieur peut t'aider à y voir clair, calmement.",
      questions: [
        "Qu'est-ce qui me retient vraiment dans cette relation ?",
        "De quoi aurais-je besoin pour me sentir en sécurité, quelle que soit ma décision ?",
      ],
    },
  } satisfies Record<LoveBandKey, { title: string; text: string; questions: string[] }>,
  questionsTitle: "Deux questions à te poser",
  cta: {
    title: "En parler avec Pierre",
    text: "Un regard extérieur aide souvent à séparer l'émotion de ce qui compte vraiment. Pendant un Appel Découverte offert, on relit ensemble ta Boussole et on la relie à ton Talent Unique : ce qui te fait réussir dans le plaisir au travail compte aussi dans ta vie à deux. Sans engagement.",
    button: "Réserver mon Appel Découverte offert",
    url: "https://calendly.com/pierre-j-sarazin?utm_source=sommet-love-connexion&utm_medium=boussole-relation&utm_campaign=sommet-amour",
  },
  start: {
    eyebrow: "Sommet Love & Connexion",
    heading: "Boussole Relation : cette relation me correspond-elle ?",
    intro: "Évalue une relation (actuelle, ou qui commence) avec dix critères qui comptent vraiment. Tu peux ajuster les poids, ajouter une colonne pour comparer, et tout reste privé. Une alerte s'affiche si un point essentiel est touché, quel que soit le score total.",
    button: "Commencer ma Boussole Relation",
    creating: "Je prépare ta Boussole… (une dizaine de secondes)",
    prefilled: "Ta Boussole sera préréglée avec les résultats de ton Quiz Amour : ce qui te nourrit, ce qui te vide, tes valeurs et tes non-négociables. Ta réponse sur la sécurité et tes textes libres ne sont jamais transmis.",
    note: "Sans compte : ton travail est gardé 30 jours. Tu pourras le sauvegarder avec ton email.",
    backToQuiz: "Revenir au Quiz Amour",
    failed: "La Boussole Relation n'a pas pu être créée. Réessaye dans un instant.",
  },
  tableNotice: "Mode amour : chaque colonne est une relation (renomme-la avec un prénom), chaque ligne un critère. Les critères marqués « Critique » déclenchent une alerte s'ils sont notés « À moitié » ou moins. Les résultats s'affichent dans l'onglet Résultats.",
  guideTitle: "Comment évaluer chaque critère",
} as const;

/**
 * Surcharge française du tableau, uniquement en mode amour.
 * Les libellés pro (« opportunité ») restent dans l'i18n globale.
 */
export const LOVE_TABLE = {
  introCols: "tes relations en colonnes",
  newOpportunityName: (n: number) => `Relation ${n}`,
  deleteOpportunityConfirm: (name: string) => `Supprimer la relation « ${name} » et toutes ses cases ?`,
  opportunitiesCount: (n: number) => `relation${n > 1 ? "s" : ""}`,
  shownOpportunity: "Relation affichée",
  addOpportunity: "+ Relation",
  firstOpportunityStart: "Ajoute une première relation avec le bouton",
  firstOpportunityButton: "« + Relation »",
  firstOpportunityEnd: "en haut à droite du tableau (par exemple : « Camille », « La relation qui commence »).",
  opportunityName: "Nom de la relation",
  deleteOpportunity: (name: string) => `Supprimer la relation « ${name} »`,
  failsNonNegotiables: "À regarder : un non-négociable n'est pas pleinement respecté",
  redLine: "Signal d'incompatibilité à clarifier",
  legendNonNegotiableText: " : s'il n'est pas pleinement respecté, la relation est signalée et classée après les autres",
} as const;

/**
 * Surcharge française des Résultats, uniquement en mode amour.
 * Les libellés pro (« opportunité ») restent dans l'i18n globale.
 */
export const LOVE_RESULTS = {
  intro:
    "Ta lecture, tes alertes et ton score d'alignement pour chaque relation. Tout se met à jour quand tu modifies ton tableau.",
  radarTitle: "Le radar de tes relations",
  radarIntro:
    "Le score de chaque relation, famille de critères par famille : plus la forme est grande, plus la relation te correspond.",
  radarCaption: "Score de chaque relation, famille de critères par famille",
  projectionStart: "Imagine : demain, tu choisis vraiment",
  disappointmentHint:
    "Ton intuition te dit peut-être quelque chose que tes critères ne disent pas encore. Vers quelle autre relation ton cœur est-il parti ?",
  forWhich: "Pour quelle relation ?",
} as const;
