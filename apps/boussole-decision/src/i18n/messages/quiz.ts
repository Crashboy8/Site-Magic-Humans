// Import du résultat du quiz Talent Unique dans la Boussole.
const fr = {
  title: "Ton résultat du quiz",
  eyebrow: "Quiz Talent Unique",
  heading: "Ton résultat devient ta Boussole",
  intro:
    "Voici ce que la Boussole va créer à partir de ton résultat du quiz : un nouveau profil, avec ton Talent Unique, ton Anti-Contexte et tes premiers critères. Tu pourras tout modifier ensuite.",
  loading: "Lecture de ton résultat…",
  invalid:
    "Ce lien ne contient pas de résultat de quiz lisible. Refais le quiz, puis clique à nouveau sur « Utiliser ce résultat dans ma Boussole de décision ».",
  retakeQuiz: "Refaire le quiz",
  profileName: "Nom du profil",
  talent: "Ton Talent Unique",
  anti: "Ton Anti-Contexte",
  success: "🌱 Tes contextes de réussite",
  failure: "⚡ Ton contexte d'échec sous pression",
  criteriaTitle: "Tes premiers critères",
  towards: "Ce que tu recherches (Contexte Déclencheur)",
  away: "À éviter (Anti-Contexte)",
  create: "Créer mon profil avec ce résultat",
  creating: "Création de ton profil…",
  tryWithout: "Commencer sans compte avec ce résultat",
  haveAccount: "J'ai déjà un compte : me connecter",
  afterSignIn: "Après la connexion, ton résultat t'attendra sur ta page d'accueil.",
  signInFirst: "Connecte-toi ou commence sans compte pour créer ton profil.",
  failed: "Le profil n'a pas pu être créé. Réessaie dans un instant.",
  pendingTitle: "Ton résultat du quiz t'attend",
  pendingText: (name: string) =>
    `Ajoute « ${name} » à ta Boussole : ton Talent Unique, ton Anti-Contexte et tes premiers critères seront préremplis.`,
  pendingAdd: "Ajouter à ma Boussole",
  pendingDismiss: "Plus tard",
  added: "Ton résultat du quiz a été ajouté : vérifie ton Talent Unique ci-dessous, puis ouvre ton tableau pour ajouter tes opportunités.",
};

const en: typeof fr = {
  title: "Your quiz result",
  eyebrow: "Unique Talent quiz",
  heading: "Your result becomes your Compass",
  intro:
    "Here is what the Compass will create from your quiz result: a new profile, with your Unique Talent, your Anti-Context and your first criteria. You can change everything afterwards.",
  loading: "Reading your result…",
  invalid:
    "This link doesn't contain a readable quiz result. Take the quiz again, then click “Use this result in my Decision Compass” once more.",
  retakeQuiz: "Take the quiz again",
  profileName: "Profile name",
  talent: "Your Unique Talent",
  anti: "Your Anti-Context",
  success: "🌱 Your contexts of success",
  failure: "⚡ Your context of failure under pressure",
  criteriaTitle: "Your first criteria",
  towards: "What you're looking for (Trigger Context)",
  away: "To avoid (Anti-Context)",
  create: "Create my profile with this result",
  creating: "Creating your profile…",
  tryWithout: "Start without an account with this result",
  haveAccount: "I already have an account: sign in",
  afterSignIn: "After signing in, your result will be waiting for you on your home page.",
  signInFirst: "Sign in or start without an account to create your profile.",
  failed: "The profile couldn't be created. Try again in a moment.",
  pendingTitle: "Your quiz result is waiting",
  pendingText: (name: string) =>
    `Add “${name}” to your Compass: your Unique Talent, your Anti-Context and your first criteria will be pre-filled.`,
  pendingAdd: "Add to my Compass",
  pendingDismiss: "Later",
  added: "Your quiz result has been added: check your Unique Talent below, then open your table to add your opportunities.",
};

export const quiz = { fr, en };
