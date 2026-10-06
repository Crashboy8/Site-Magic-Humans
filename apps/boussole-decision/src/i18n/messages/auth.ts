// Connexion, inscription, essai sans compte, compte.
const fr = {
  // Titres de page
  titleWelcome: "Bienvenue",
  titleSignIn: "Connexion",
  titleSignUp: "Inscription",
  titleForgot: "Mot de passe oublié",
  titleSave: "Sauvegarder mon travail",
  titleAccount: "Mon compte",
  titleAccountCreated: "Compte créé",
  titleNewPassword: "Nouveau mot de passe",

  // Accueil
  welcomeHeading: "Choisir avec le cœur et la tête",
  welcomeText:
    "Compare tes opportunités professionnelles à partir de ce qui compte vraiment pour toi : ton Talent Unique, tes valeurs, tes conditions de vie.",
  tryNowTitle: "Essayer tout de suite",
  tryNowText:
    "Sans email, sans mot de passe : tu entres directement dans ton tableau de décision. Ton travail est gardé sur cet appareil, et tu pourras le sauvegarder ensuite avec ton email.",
  tryNowButton: "Essayer tout de suite",
  tryNowPending: "Préparation de ton espace…",
  seeExample: "👀 Voir d'abord un exemple",
  accountTitle: "J'ai déjà un compte, ou je veux en créer un",
  accountText: "Tout est sauvegardé avec ton email, et accessible depuis n'importe quel appareil.",
  signIn: "Me connecter",
  createAccount: "Créer mon compte",
  firstTrialProfile: "Mon premier essai",

  // Connexion
  welcomeBack: "Te revoilà",
  signInIntro: "Connecte-toi pour retrouver tes boussoles.",
  linkInvalid: "Ce lien n'est plus valable (il a peut-être déjà servi). Demande-en un nouveau.",
  signInMode: "Mode de connexion",
  modePassword: "Mot de passe",
  modeMagic: "Lien par email",
  email: "Email",
  password: "Mot de passe",
  signingIn: "Connexion…",
  forgotPassword: "Mot de passe oublié ?",
  magicHint: "Tu recevras un lien qui te connecte en un clic, sans mot de passe.",
  sending: "Envoi…",
  sendMagicLink: "Recevoir mon lien de connexion",
  noAccountYet: "Pas encore de compte ?",

  // Inscription
  signUpDone: "Bienvenue !",
  checkSpam: "Pense à regarder dans tes courriers indésirables si tu ne le vois pas.",
  signUpTitle: "Créer mon espace",
  signUpIntro:
    "Ton compte garde tout ton travail, sur tous tes appareils. Si Pierre t'a donné un code d'invitation, indique-le : il sera ton coach dans l'outil.",
  inviteCode: "Code d'invitation (facultatif)",
  firstName: "Prénom",
  passwordHint: "8 caractères minimum.",
  privacyNote:
    "🔒 Tes boussoles sont privées. Rien n'est visible par ton coach tant que tu ne choisis pas, profil par profil, de les partager avec lui. Tu peux retirer ce partage à tout moment.",
  creating: "Création…",
  alreadyRegistered: "Déjà inscrit·e ?",

  // Mot de passe oublié / nouveau
  forgotIntro: "Indique ton email : tu recevras un lien pour en choisir un nouveau.",
  sendLink: "Envoyer le lien",
  backToSignIn: "Retour à la connexion",
  newPassword: "Nouveau mot de passe",
  savingPassword: "Enregistrement…",
  savePassword: "Enregistrer le mot de passe",
  chooseNewPassword: "Choisis un nouveau mot de passe",

  // Sauvegarde d'un essai
  trialEyebrow: "Mode essai",
  saveIntro:
    "Ajoute ton email : tout ce que tu as rempli est conservé et rattaché à ton compte. Tu pourras le retrouver depuis n'importe quel appareil et, si tu le souhaites, le partager avec ton coach.",
  saveEmailHint: "Tu recevras un lien pour confirmer : ouvre-le sur cet appareil.",
  saveButton: "Sauvegarder mon travail",
  haveAccountQuestion: "Tu as déjà un compte ? Connecte-toi : ton essai y sera ajouté.",
  signInToAccount: "Me connecter à mon compte",
  existingAccount: "Tu as déjà un compte avec",
  existingAccountEnd: ". Connecte-toi : ton essai y sera ajouté, tu ne perds rien.",
  signInToAdd: "Connecte-toi à ton compte : ton essai y sera ajouté, tu ne perds rien.",
  noPasswordHint: "Pas de mot de passe, ou tu l'as oublié ? Reçois un lien qui te connecte en un clic.",
  openOnThisDevice: "Ouvre-le sur cet appareil pour que ton essai soit ajouté.",
  receiveLoginLink: "Recevoir un lien de connexion",
  noAccountYetLink: "Je n'ai pas encore de compte",
  trialAdded: "Te voilà connecté·e : ton essai a bien été ajouté à ton compte, il apparaît dans tes profils.",

  // Compte
  myInfo: "Mes informations",
  registered: "Inscription",
  coacheePrivacy:
    "Tes boussoles sont privées. Ton coach ne voit que les profils que tu choisis de partager avec lui, en lecture seule, et tu peux retirer ce partage à tout moment.",
  changePassword: "Changer de mot de passe",
  backToProfiles: "← Retour à mes profils",
  thanks: (name: string) => (name ? `Merci, ${name} !` : "Merci !"),
  workSaved: "Ton travail est sauvegardé",
  accountCreatedWith: (email: string) =>
    `Ton compte est créé avec l'adresse ${email || "indiquée"}. Tout ce que tu avais rempli pendant l'essai est conservé.`,
  confirmationPending: "La confirmation est en cours : recharge la page dans quelques secondes.",
  choosePasswordOptional: "Choisir un mot de passe (facultatif)",
  orMagicLink: "Sinon, tu pourras toujours te connecter avec un lien reçu par email.",
  findMyCompasses: "Retrouver mes boussoles →",

  // Messages des actions serveur
  errors: {
    invalidCredentials: "Email ou mot de passe incorrect.",
    emailNotConfirmed: "Ton adresse email n'est pas encore confirmée : clique sur le lien reçu par email.",
    alreadyRegistered: "Un compte existe déjà avec cet email. Connecte-toi ou utilise « Mot de passe oublié ».",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
    rateLimit: "Trop de tentatives en peu de temps. Patiente une minute puis réessaie.",
    noAccount: "Aucun compte n'est associé à cet email. Crée ton compte, ou essaie l'outil directement.",
    badInviteCode: "Ce code d'invitation n'est pas (ou plus) valable.",
    trialDisabled: "L'essai sans compte n'est pas encore activé. Crée ton compte pour commencer.",
    emailInUse: "Cette adresse est déjà utilisée par un compte. Connecte-toi plutôt avec elle.",
    generic: "Une erreur est survenue. Réessaie dans un instant.",
    firstNameRequired: "Indique ton prénom.",
    emailInvalid: "Cette adresse email ne semble pas valide.",
    min8: "Au moins 8 caractères.",
    inviteCodeCheck: "Ce code d'invitation n'est pas (ou plus) valable. Vérifie-le auprès de Pierre.",
    emailAndPassword: "Indique ton email et ton mot de passe.",
    trialExpired: "Ta session d'essai a expiré. Recommence un essai ou crée ton compte.",
  },
  messages: {
    accountCreated: (email: string) =>
      `Ton compte est créé. Un email de confirmation vient de partir vers ${email} : clique sur le lien qu'il contient pour commencer.`,
    magicLinkSent: (email: string) => `C'est parti ! Un lien de connexion vient d'être envoyé à ${email}. Il est valable une heure.`,
    resetSent: "Si un compte existe pour cette adresse, un email pour choisir un nouveau mot de passe vient de partir.",
    passwordSaved: "Ton mot de passe est enregistré.",
    almostDone: (email: string) =>
      `Presque fini ! Un email vient de partir vers ${email}. Ouvre-le sur cet appareil et clique sur le lien : ton travail sera alors sauvegardé sur ton compte.`,
  },
};

const en: typeof fr = {
  titleWelcome: "Welcome",
  titleSignIn: "Sign in",
  titleSignUp: "Sign up",
  titleForgot: "Forgotten password",
  titleSave: "Save my work",
  titleAccount: "My account",
  titleAccountCreated: "Account created",
  titleNewPassword: "New password",

  welcomeHeading: "Choose with your heart and your head",
  welcomeText:
    "Compare your career opportunities based on what truly matters to you: your Unique Talent, your values, your living conditions.",
  tryNowTitle: "Try it right now",
  tryNowText:
    "No email, no password: you go straight into your decision table. Your work is kept on this device, and you can save it later with your email.",
  tryNowButton: "Try it right now",
  tryNowPending: "Getting your space ready…",
  seeExample: "👀 See an example first",
  accountTitle: "I already have an account, or I want to create one",
  accountText: "Everything is saved with your email and available from any device.",
  signIn: "Sign in",
  createAccount: "Create my account",
  firstTrialProfile: "My first try",

  welcomeBack: "Welcome back",
  signInIntro: "Sign in to find your compasses.",
  linkInvalid: "This link is no longer valid (it may have been used already). Request a new one.",
  signInMode: "Sign-in method",
  modePassword: "Password",
  modeMagic: "Email link",
  email: "Email",
  password: "Password",
  signingIn: "Signing in…",
  forgotPassword: "Forgotten your password?",
  magicHint: "You'll receive a link that signs you in with one click, no password needed.",
  sending: "Sending…",
  sendMagicLink: "Send me a sign-in link",
  noAccountYet: "No account yet?",

  signUpDone: "Welcome!",
  checkSpam: "Remember to check your spam folder if you can't see it.",
  signUpTitle: "Create my space",
  signUpIntro:
    "Your account keeps all your work, on all your devices. If Pierre gave you an invitation code, enter it: he'll be your coach in the tool.",
  inviteCode: "Invitation code (optional)",
  firstName: "First name",
  passwordHint: "At least 8 characters.",
  privacyNote:
    "🔒 Your compasses are private. Your coach sees nothing until you choose, profile by profile, to share them. You can stop sharing at any time.",
  creating: "Creating…",
  alreadyRegistered: "Already registered?",

  forgotIntro: "Enter your email: you'll receive a link to choose a new one.",
  sendLink: "Send the link",
  backToSignIn: "Back to sign in",
  newPassword: "New password",
  savingPassword: "Saving…",
  savePassword: "Save password",
  chooseNewPassword: "Choose a new password",

  trialEyebrow: "Trial mode",
  saveIntro:
    "Add your email: everything you've filled in is kept and linked to your account. You'll be able to find it from any device and, if you wish, share it with your coach.",
  saveEmailHint: "You'll receive a confirmation link: open it on this device.",
  saveButton: "Save my work",
  haveAccountQuestion: "Already have an account? Sign in: your trial will be added to it.",
  signInToAccount: "Sign in to my account",
  existingAccount: "You already have an account with",
  existingAccountEnd: ". Sign in: your trial will be added to it, you lose nothing.",
  signInToAdd: "Sign in to your account: your trial will be added to it, you lose nothing.",
  noPasswordHint: "No password, or forgotten it? Get a link that signs you in with one click.",
  openOnThisDevice: "Open it on this device so your trial gets added.",
  receiveLoginLink: "Send me a sign-in link",
  noAccountYetLink: "I don't have an account yet",
  trialAdded: "You're signed in: your trial has been added to your account and appears in your profiles.",

  myInfo: "My details",
  registered: "Joined",
  coacheePrivacy:
    "Your compasses are private. Your coach only sees the profiles you choose to share, read-only, and you can stop sharing at any time.",
  changePassword: "Change password",
  backToProfiles: "← Back to my profiles",
  thanks: (name: string) => (name ? `Thank you ${name}!` : "Thank you!"),
  workSaved: "Your work is saved",
  accountCreatedWith: (email: string) =>
    `Your account has been created with ${email || "the address you gave"}. Everything you filled in during the trial is kept.`,
  confirmationPending: "Confirmation in progress: reload the page in a few seconds.",
  choosePasswordOptional: "Choose a password (optional)",
  orMagicLink: "Otherwise, you can always sign in with a link sent by email.",
  findMyCompasses: "Go to my compasses →",

  errors: {
    invalidCredentials: "Incorrect email or password.",
    emailNotConfirmed: "Your email address isn't confirmed yet: click the link you received by email.",
    alreadyRegistered: "An account already exists with this email. Sign in or use “Forgotten password”.",
    passwordTooShort: "Your password must be at least 8 characters long.",
    rateLimit: "Too many attempts in a short time. Wait a minute and try again.",
    noAccount: "No account is linked to this email. Create your account, or try the tool right away.",
    badInviteCode: "This invitation code isn't valid (any more).",
    trialDisabled: "Trying without an account isn't enabled yet. Create your account to start.",
    emailInUse: "This address is already used by an account. Sign in with it instead.",
    generic: "Something went wrong. Try again in a moment.",
    firstNameRequired: "Enter your first name.",
    emailInvalid: "This email address doesn't look valid.",
    min8: "At least 8 characters.",
    inviteCodeCheck: "This invitation code isn't valid (any more). Check it with Pierre.",
    emailAndPassword: "Enter your email and password.",
    trialExpired: "Your trial session has expired. Start a new trial or create your account.",
  },
  messages: {
    accountCreated: (email: string) =>
      `Your account has been created. A confirmation email has just been sent to ${email}: click the link inside to get started.`,
    magicLinkSent: (email: string) => `Done! A sign-in link has just been sent to ${email}. It's valid for one hour.`,
    resetSent: "If an account exists for this address, an email to choose a new password has just been sent.",
    passwordSaved: "Your password has been saved.",
    almostDone: (email: string) =>
      `Almost done! An email has just been sent to ${email}. Open it on this device and click the link: your work will then be saved to your account.`,
  },
};

export const auth = { fr, en };
