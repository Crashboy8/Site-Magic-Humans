// Accueil (mes profils), page d'un profil, Talent Unique, partage avec le coach.
const fr = {
  // Accueil
  hello: (name: string) => (name ? `Bonjour ${name},` : "Bonjour,"),
  homeTitle: "Tes boussoles",
  homeIntro:
    "Chaque profil correspond à une période de ta vie professionnelle. À l'intérieur, tu compares tes opportunités à partir de ce qui compte vraiment pour toi.",
  myProfiles: "Mes profils",
  startHere: "Tout commence ici.",
  startHereText:
    "Crée ton premier profil, par exemple « Reconversion 2026 ». Tu y définiras tes critères, puis tu y compareras tes opportunités.",
  exampleTitle: "L'exemple de Camille",
  exampleText: "Chargée de communication, 34 ans, elle compare trois opportunités. Un tableau complet pour voir ce que ça peut donner.",
  seeExample: "👀 Voir l'exemple",

  // Carte d'un profil
  versionsCount: (n: number) => `${n} version${n > 1 ? "s" : ""}`,
  finalizedCount: (n: number) => `${n} finalisée${n > 1 ? "s" : ""}`,
  sharedBadge: "Partagé avec le coach",
  modifiedOn: (date: string) => `· modifié le ${date}`,

  // Création
  newProfileButton: "+ Nouveau profil",
  newProfile: "Nouveau profil",
  newProfileIntro: "Un profil correspond à une période de ta vie professionnelle. Tu pourras y créer plusieurs versions.",
  profileName: "Nom du profil",
  nameSuggestions: "Suggestions de noms",
  suggestions: ["Reconversion 2026", "Retour après congé parental", "Nouveau poste en interne", "Lancement en indépendant"],
  profileDescription: "Quelques mots sur ce moment (facultatif)",
  profileDescriptionPlaceholder: "Ex. : je quitte mon poste actuel en juin et j'hésite entre plusieurs pistes.",
  nameRequired: "Donne un nom à ce profil.",
  createFailed: "Le profil n'a pas pu être créé. Réessaie dans un instant.",
  creating: "Création…",
  create: "Créer le profil",
  cancel: "Annuler",
  /** Nom donné à la première version d'un nouveau profil. */
  firstVersionName: "Brouillon",

  // Page d'un profil
  titleProfile: "Profil",
  eyebrow: "Profil",
  deleteProfile: "Supprimer ce profil",
  deleteConfirm: (name: string) => `Supprimer le profil « ${name} » et toutes ses versions ? Cette action est définitive.`,
  breadcrumbMine: "← Mes profils",
  breadcrumbCoachee: (name: string) => `← Profils de ${name}`,
  breadcrumb: "Fil d'Ariane",
  yourCoachee: "ton coaché",
  openTable: "Ouvrir mon tableau : critères et opportunités →",
  viewTable: "Voir le tableau de décision →",
  nextStepTitle: "Étape suivante : ton tableau de décision",
  nextStepText:
    "Pose tes critères en lignes (ce qui compte pour toi, ce que tu veux éviter), ajoute tes opportunités professionnelles en colonnes, et vois le score se calculer en direct.",
  versionsTitle: "Versions",
  versionsIntro:
    "Ta réflexion évolue : duplique une version pour en créer une nouvelle sans perdre la précédente. Une version finalisée est protégée ; rouvre-la si tu veux la retoucher.",

  // Partage
  shareTitle: "Partager avec mon coach",
  sharedOn: "✓ Ce profil est partagé avec ton coach.",
  sharedOff: "🔒 Ce profil est privé : ton coach ne le voit pas.",
  shareExplainStart: "Si tu l'actives, ton coach pourra",
  shareExplainReadOnly: "consulter en lecture seule",
  shareExplainMiddle:
    ": ton Talent Unique et toutes les versions de ce profil (critères, opportunités, évaluations, résultats et ressenti). Il pourra y laisser des commentaires, mais",
  shareExplainNever: "ne pourra jamais rien modifier",
  shareExplainOthers:
    "Tes autres profils restent privés. Tu peux retirer le partage à tout moment : ton coach n'aura alors plus accès à rien.",
  shareFailed: "Le réglage n'a pas pu être enregistré. Réessaie dans un instant.",

  // Talent Unique
  myTalent: (term: string) => `Mon ${term}`,
  talentGuides: "Il guide le choix de tes critères.",
  placeholderMecanisme: "simplifie et clarifie les idées complexes",
  placeholderContexte: "il y a du chaos ou un manque de vision",
  placeholderBenefice: "remettre du mouvement et de la sérénité dans le groupe",
  myAnti: (term: string) => `Mon ${term}`,
  notFilled: "Non renseigné.",
  placeholderAnti: "Ex. : des réunions sans fin où rien ne se décide, un contrôle permanent de chaque détail…",
  livedTitle: "Mes contextes vécus",
  livedIntro:
    "Des situations concrètes, tirées de ta vie. Elles rendent ton Contexte Déclencheur et ton Anti-Contexte palpables, et reviennent dans tes résultats comme garde-fous.",
  successTitle: "🌱 Mes contextes de réussite",
  successHint: "Quand es-tu à ton meilleur ? Avec qui, où, en train de faire quoi ?",
  successPlaceholder: "Ex. : quand je suis avec des gens, que je crée un espace relationnel, avec un objectif et un cadre communs.",
  failureTitle: "⚡ Mes contextes d'échec",
  failureHint: "Dans quelles situations t'éteins-tu ? Celles où tu peux glisser facilement, sans t'en rendre compte.",
  failurePlaceholder: "Ex. : quand je suis trop isolé, trop dans ma tête, derrière un écran toute la journée à regarder des vidéos.",
};

const en: typeof fr = {
  hello: (name: string) => (name ? `Hello ${name},` : "Hello,"),
  homeTitle: "Your compasses",
  homeIntro:
    "Each profile matches a period of your working life. Inside it, you compare your opportunities based on what truly matters to you.",
  myProfiles: "My profiles",
  startHere: "It all starts here.",
  startHereText:
    "Create your first profile, for example “Career change 2026”. You'll set your criteria in it, then compare your opportunities.",
  exampleTitle: "Camille's example",
  exampleText: "A 34-year-old communications officer comparing three opportunities. A complete table to see what it can look like.",
  seeExample: "👀 See the example",

  versionsCount: (n: number) => `${n} version${n !== 1 ? "s" : ""}`,
  finalizedCount: (n: number) => `${n} finalised`,
  sharedBadge: "Shared with coach",
  modifiedOn: (date: string) => `· updated ${date}`,

  newProfileButton: "+ New profile",
  newProfile: "New profile",
  newProfileIntro: "A profile matches a period of your working life. You can create several versions in it.",
  profileName: "Profile name",
  nameSuggestions: "Name suggestions",
  suggestions: ["Career change 2026", "Back from parental leave", "New internal role", "Going freelance"],
  profileDescription: "A few words about this moment (optional)",
  profileDescriptionPlaceholder: "E.g. I'm leaving my current job in June and hesitating between several paths.",
  nameRequired: "Give this profile a name.",
  createFailed: "The profile couldn't be created. Try again in a moment.",
  creating: "Creating…",
  create: "Create profile",
  cancel: "Cancel",
  firstVersionName: "Draft",

  titleProfile: "Profile",
  eyebrow: "Profile",
  deleteProfile: "Delete this profile",
  deleteConfirm: (name: string) => `Delete the profile “${name}” and all its versions? This cannot be undone.`,
  breadcrumbMine: "← My profiles",
  breadcrumbCoachee: (name: string) => `← ${name}'s profiles`,
  breadcrumb: "Breadcrumb",
  yourCoachee: "your coachee",
  openTable: "Open my table: criteria and opportunities →",
  viewTable: "View the decision table →",
  nextStepTitle: "Next step: your decision table",
  nextStepText:
    "Set your criteria as rows (what matters to you, what you want to avoid), add your career opportunities as columns, and watch the score update live.",
  versionsTitle: "Versions",
  versionsIntro:
    "Your thinking evolves: duplicate a version to create a new one without losing the previous one. A finalised version is protected; reopen it if you want to change it.",

  shareTitle: "Share with my coach",
  sharedOn: "✓ This profile is shared with your coach.",
  sharedOff: "🔒 This profile is private: your coach can't see it.",
  shareExplainStart: "If you turn it on, your coach will be able to",
  shareExplainReadOnly: "view it read-only",
  shareExplainMiddle:
    ": your Unique Talent and every version of this profile (criteria, opportunities, ratings, results and feelings). They can leave comments, but",
  shareExplainNever: "will never be able to change anything",
  shareExplainOthers: "Your other profiles stay private. You can stop sharing at any time: your coach will then have no access at all.",
  shareFailed: "The setting couldn't be saved. Try again in a moment.",

  myTalent: (term: string) => `My ${term}`,
  talentGuides: "It guides your choice of criteria.",
  placeholderMecanisme: "simplify and clarify complex ideas",
  placeholderContexte: "there is chaos or a lack of vision",
  placeholderBenefice: "bring movement and calm back to the group",
  myAnti: (term: string) => `My ${term}`,
  notFilled: "Not filled in.",
  placeholderAnti: "E.g. endless meetings where nothing gets decided, constant control over every detail…",
  livedTitle: "My lived contexts",
  livedIntro:
    "Concrete situations from your life. They make your Trigger Context and Anti-Context tangible, and come back in your results as guardrails.",
  successTitle: "🌱 My contexts of success",
  successHint: "When are you at your best? With whom, where, doing what?",
  successPlaceholder: "E.g. when I'm with people, creating a space for connection, with a shared goal and framework.",
  failureTitle: "⚡ My contexts of failure",
  failureHint: "In which situations do you switch off? The ones you can easily slip into without noticing.",
  failurePlaceholder: "E.g. when I'm too isolated, too much in my head, behind a screen all day watching videos.",
};

export const profile = { fr, en };
