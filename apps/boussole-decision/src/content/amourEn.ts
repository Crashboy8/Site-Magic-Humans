// Relationship Compass (love mode) in English. Same shape as content/amour.ts, French remains the reference.
// Only the displayed texts change: keys, weights, directions and the technical marker stay identical.
import { LOVE_PROFILE_MARKER, LOVE_TEMPLATE, type LoveResults, type LoveTable, type LoveTemplate, type LoveTexts } from "./amour";
import { typographier } from "@/i18n/typo";

const CATEGORIES_EN: Record<string, string> = {
  fond: "The core: needs, respect, values",
  direction: "Heading the same way",
  quotidien: "Everyday life: flaws and friction",
  energie: "Energy and love",
};

const CRITERIA_EN: Record<string, { label: string; guide: string; alert: string }> = {
  besoins: {
    label: "My core needs are respected",
    guide: "Think back to your 2 core needs (from your Love Quiz). Are they met most of the time, and not just on the good days?",
    alert:
      "Your core needs aren't respected enough in this relationship. This is what matters most: you can love someone and slowly fade next to them. Before looking for compromises elsewhere, ask yourself whether they can meet this need without having to stop being who they are.",
  },
  respect: {
    label: "I feel respected and emotionally safe",
    guide: "Can you say what you think, or say no, without fear, without being put down, mocked or punished?",
    alert:
      "Respect and emotional safety aren't fully there. This isn't about compatibility: without safety, no other criterion can really count. Take this signal seriously and talk to someone you trust.",
  },
  valeurs: {
    label: "We share the same deep values",
    guide: "On what matters to you (honesty, family, money, spirituality, commitment), do you agree on the essentials, even if you express them differently?",
    alert:
      "Your deep values seem to be drifting apart. Differences in style can be worked out, differences in substance wear you down. Pin down exactly which value is at stake and check, calmly, whether it's a misunderstanding or a real disagreement.",
  },
  direction: {
    label: "We're heading the same way (life plans)",
    guide: "Children, where to live, pace of life, projects: picture yourself in 5 years. Do you see the same life?",
    alert:
      "Your life plans aren't heading the same way. Love doesn't replace a shared direction: one of you risks giving up part of their life. Put the concrete topics on the table (children, place, pace) before committing further.",
  },
  defauts: {
    label: "I can live with their flaws in 10 years",
    guide: "Think of what drains you most about them (your Love Quiz ranked it). Is it rare, or settled in? If it never changes, could you live with it calmly in 10 years?",
    alert:
      "Some of their flaws seem hard to live with in the long run. Remember: you can't change someone. Asking them to change means asking them to stop being themselves. So the real question is: can you accept them as they are?",
  },
  frictions: {
    label: "Our friction stays bearable and gets resolved",
    guide: "Do your disagreements end in a solution or making up, rather than the same argument coming back?",
    alert: "",
  },
  energie: {
    label: "After time together, I have more energy",
    guide: "After an evening or a weekend together, do you feel more alive, or more drained? Think back to what recharges you and what drains you.",
    alert: "",
  },
  langage: {
    label: "Our love languages meet",
    guide: "Do you receive love in your language (words, time, gifts, acts of service, touch), and do you know how to give it in theirs?",
    alert: "",
  },
  attirance: {
    label: "Physical attraction and desire for them",
    guide: "Attraction and desire are there most of the time, not just at the start. You can enter a percentage, from 0 to 100.",
    alert: "",
  },
  sexualite: {
    label: "Sexual compatibility (what we want and how we live our sexuality)",
    guide: "What you each want and the way you live your sexuality suit you both. You can enter a percentage, from 0 to 100.",
    alert: "",
  },
  complementarite: {
    label: "Our differences complete me more than they wear me down",
    guide: "Do your differences (in pace, sociability, the way you live as a couple) enrich you, or tire you out?",
    alert: "",
  },
  incompatibilite: {
    label: "There's a critical incompatibility between us",
    guide:
      "Is there a non-negotiable point for you where they're at the opposite end (children or not, pace of life, freedom versus closeness, a core value)? If there isn't, answer “Absent”.",
    alert:
      "You're flagging a critical incompatibility. A non-negotiable stays non-negotiable, even with a lot of love: if one of you gives in, they risk regretting it and holding it against the other. Name it precisely, and check with them that it's real and lasting.",
  },
};

export const LOVE_TEMPLATE_EN: LoveTemplate = {
  profileName: "Relationship Compass",
  profileDescription: LOVE_PROFILE_MARKER,
  versionName: "My relationship, first reading",
  opportunityName: "My relationship",
  decision: "Is this relationship right for me?",
  categories: LOVE_TEMPLATE.categories.map((c) => ({ ...c, label: CATEGORIES_EN[c.key] })),
  criteria: LOVE_TEMPLATE.criteria.map((c) => ({ ...c, ...CRITERIA_EN[c.key] })),
};

export const LOVE_TEXTS_EN: LoveTexts = typographier({
  readingTitle: "Your Relationship Compass reading",
  readingIntro: "The score sums up your answers, it doesn't decide for you. Read the alerts first: a core point being hit matters more than any total.",
  provisional: "Provisional reading: {n} criteria are still empty or “to check”. Fill them in for a reliable reading.",
  noScore: "Rate at least 1 criterion to get a reading.",
  alignement: (score: number) => `: ${score}% aligned`,
  jaugeAria: (score: number) => `Alignment: ${score}%`,
  scoreLine: "{name}: {score}% aligned",
  alertsTitle: "Alerts, whatever the score",
  alertIntro: "Your score is {score}%, but 1 or more core points are being hit. A good total can hide what matters most: read this first.",
  genericAlert: "The criterion “{label}” is rated low even though you marked it critical. Take the time to ask yourself whether it can really improve, and on what condition.",
  ligneRougeLow:
    "You're seeing the start of a critical incompatibility. It may only be a misunderstanding: talk about it early and openly, before you each settle into hoping the other will change their mind.",
  ligneRougeHigh:
    "The critical incompatibility seems to be really there. A non-negotiable can't be negotiated: if you stay together without clearing it up, one of you risks giving up an essential part of themselves. Facing this can hurt, and it deserves to be cleared up, together or with someone you trust.",
  safety:
    "You rated respect and emotional safety very low. If you're living with fear, humiliation, control or violence, this isn't a compatibility issue and it isn't your fault. In France: 3919 (domestic violence, free and anonymous, 24/7), 17 or 112 in immediate danger, 114 by text. Outside France, call your country's emergency number or a domestic abuse helpline.",
  energyAlert:
    "You noted that this relationship drains your energy. That's not a detail: a relationship that's right for you leaves you more alive, not more exhausted. Look at what drains you (your Love Quiz tells you) and ask yourself whether it's passing or settled in.",
  quizNoteLabel: "From your Love Quiz: ",
  bands: {
    solide: {
      title: "A solid alignment",
      text: "This relationship feeds what matters most: your needs, your values, your direction. There's probably some friction, but it stays on the surface. It's not a guarantee, it's a foundation. Take care of it: keep talking about your needs, recharging together, and coming back to this Compass if something changes.",
      questions: ["What in this relationship does me the most good, and have I told them?", "What small ritual could protect what we have?"],
    },
    base: {
      title: "A real foundation, with things to work on",
      text: "Most of what matters is there, but some criteria pull the score down. Look at which ones: if they're about style (habits, friction), clear agreements can fix them. If they're about substance (needs, values, direction), they deserve a real conversation, without waiting.",
      questions: [
        "What are the 2 lowest criteria, and are they about substance or style?",
        "What could I ask for concretely, without asking them to change who they are?",
      ],
    },
    tension: {
      title: "A relationship under strain",
      text: "Several important points aren't there. You can love this person and, at the same time, not be happy with them: both are true. Before deciding anything, separate what can change through agreements from what would require one of you to stop being yourself.",
      questions: ["If nothing changes in the next 2 years, how do I feel?", "Am I staying for what we live now, or for who I hope they'll become?"],
    },
    desalignement: {
      title: "A deep misalignment",
      text: "Your answers show a big gap between what you need and what you're living. It's not a verdict on their worth or yours: it's a sign that this relationship, as it is, isn't right for you. You don't have to decide alone or right now. An outside view can help you see clearly, calmly.",
      questions: ["What's really keeping me in this relationship?", "What would I need to feel safe, whatever I decide?"],
    },
  },
  questionsTitle: "2 questions to ask yourself",
  cta: {
    title: "Talk it through with Pierre",
    text: "An outside view often helps separate emotion from what really matters. During a free Discovery Call, we go through your Compass together and connect it to your Unique Talent: what brings you Flow State Mastery at work also counts in your life as a couple. No strings attached.",
    button: "Book my free Discovery Call",
    url: "https://calendly.com/pierre-j-sarazin?utm_source=sommet-love-connexion&utm_medium=boussole-relation&utm_campaign=sommet-amour",
  },
  start: {
    eyebrow: "Love & Connection Summit",
    heading: "Relationship Compass: is this relationship right for me?",
    intro:
      "Assess a relationship (a current one, or one that's just starting) with 12 criteria that really matter. You can adjust the weights, add a column to compare, and everything stays private. An alert shows up if a core point is hit, whatever the total score.",
    button: "Start my Relationship Compass",
    creating: "Getting your Compass ready… (about 10 seconds)",
    prefilled:
      "Your Compass will be preset with your Love Quiz results: what feeds you, what drains you, your values and your non-negotiables. Your answer about safety and anything you typed yourself are never sent.",
    note: "No account needed: your work is kept for 30 days. You can save it with your email.",
    backToQuiz: "Back to the Love Quiz",
    failed: "The Relationship Compass couldn't be created. Try again in a moment.",
    resume: "Open my Relationship Compass",
    resumeIntro: "You already have a Relationship Compass: we'll pick it up, nothing is overwritten.",
    loading: "Checking whether you already have a Relationship Compass…",
  },
  quizPick: {
    title: "Choose what you keep from your Love Quiz",
    intro: "Each result becomes a criterion in your Compass. Untick what doesn't speak to you: you can change everything afterwards.",
    profil: (name: string) => `Your love profile: ${name}`,
    groups: {
      profil: "Your profile",
      besoins: "What feeds you",
      valeurs: "Your values",
      eviter: "What you want to avoid",
    },
    nonNegotiable: "Non-negotiable",
    avoid: "Risk to avoid",
    already: "Already in your Compass",
    importance: {
      critique: "Critical",
      tres_important: "Very important",
      important: "Important",
      moyen: "Medium",
      bof: "Minor",
      bonus: "Bonus",
    },
    families: {
      fond: "The core",
      direction: "Direction",
      quotidien: "Everyday life",
      energie: "Energy",
    },
    addButton: (n: number) => (n > 1 ? `Add these ${n} criteria to my Compass` : n === 1 ? "Add this criterion to my Compass" : "Open my Relationship Compass"),
    nothingNew: "All your quiz results are already in your Compass.",
    saveButton: "Save my results",
    saveIntro: "Last step: tick what you keep, then confirm your email address on the next page.",
  },
  repris: {
    title: "From your Love Quiz",
    profil: (name: string) => `Profile “${name}”`,
    added: (n: number) => (n > 1 ? `${n} criteria from your quiz have just been added.` : "1 criterion from your quiz has just been added."),
    backToQuiz: "See my Love Quiz again",
    redoHint: "Taking the quiz again? The new criteria will be offered to you, without overwriting anything.",
  },
  saveFromQuiz:
    "Your Love Quiz results are in your Relationship Compass. Confirm your first name and email address: you'll get a link to find them on all your devices.",
  tableNotice:
    "Love mode: each column is a relationship (rename it with a first name), each row a criterion. Criteria marked “Critical” trigger an alert if they're rated “Halfway” or lower. Results show up in the Results tab.",
  guideTitle: "How to rate each criterion",
});

export const LOVE_TABLE_EN: LoveTable = typographier({
  introCols: "your relationships as columns",
  newOpportunityName: (n: number) => `Relationship ${n}`,
  deleteOpportunityConfirm: (name: string) => `Delete the relationship “${name}” and all its cells?`,
  opportunitiesCount: (n: number) => `relationship${n > 1 ? "s" : ""}`,
  shownOpportunity: "Relationship shown",
  addOpportunity: "+ Relationship",
  firstOpportunityStart: "Add a first relationship with the",
  firstOpportunityButton: "“+ Relationship”",
  firstOpportunityEnd: "button at the top right of the table (for example: “Camille”, “The relationship that's starting”).",
  opportunityName: "Relationship name",
  deleteOpportunity: (name: string) => `Delete the relationship “${name}”`,
  failsNonNegotiables: "Worth a look: a non-negotiable isn't fully respected",
  redLine: "Incompatibility signal to clear up",
  legendNonNegotiableText: ": if it isn't fully respected, the relationship is flagged and ranked after the others",
  nonNegotiableHint: "Non-negotiable: if it isn't fully the case, the relationship is flagged and ranked after the others.",
  chooseIcon: "Choose an icon",
  chooseColor: "Choose a colour",
  iconLegend: "Icon",
  colorLegend: "Colour",
  changeLook: (name: string) => `Icon and colour for ${name}`,
  closeLook: "Close",
  icons: {
    coeur: "Heart",
    etoile: "Star",
    soleil: "Sun",
    lune: "Moon",
    montagne: "Mountain",
    vague: "Wave",
    fleur: "Flower",
    feuille: "Leaf",
    flamme: "Flame",
    maison: "House",
  },
  colors: {
    corail: "Coral",
    framboise: "Raspberry",
    miel: "Honey",
    abricot: "Apricot",
    eau: "Aqua green",
    sauge: "Sage",
    lilas: "Lilac",
    ciel: "Sky blue",
  },
  percentOption: "Enter a percentage",
  percentLegend: "Percentage",
  percentValidate: "Confirm",
});

export const LOVE_RESULTS_EN: LoveResults = typographier({
  intro: "Your reading, your alerts and your alignment score for each relationship. Everything updates when you change your table.",
  badgeNonNegotiable: "🔒 A core need to look at",
  radarTitle: "Your relationships at a glance",
  radarIntro: "Your score for each relationship, family by family.",
  radarCaption: "Score of each relationship, family by family",
  viewRadars: "Radars",
  viewFiches: "Cards",
  globalWord: "Overall",
  projectionStart: "Imagine: tomorrow, you really choose",
  disappointmentHint: "Maybe your gut is telling you something your criteria don't say yet. Which other relationship did your heart go to?",
  forWhich: "For which relationship?",
  onlyOne: (score: string) => ` is the only relationship rated so far: ${score} aligned.`,
  allFail:
    "No relationship meets all your core needs for now. Take the time to look at which ones really matter to you, and whether one of them could bend a little.",
  needsTitle: "Your core needs",
  needNourri: (nom: string, critere: string) => `With ${nom}, your need “${critere}” is well met.`,
  needPartiel: (nom: string, critere: string) => `With ${nom}, your need “${critere}” is partly met, it's worth a real conversation.`,
  needAbsent: (nom: string, critere: string) => `With ${nom}, your need “${critere}” isn't met for now. Look at what it costs you.`,
  riskAbsent: (nom: string, critere: string) => `With ${nom}, the risk “${critere}” doesn't show up.`,
  riskPartiel: (nom: string, critere: string) => `With ${nom}, the risk “${critere}” shows up a little, it's worth talking about.`,
  riskPresent: (nom: string, critere: string) => `With ${nom}, the risk “${critere}” is really there. Take the time to look at what it costs you.`,
  downloadPdf: "Download my Compass as a PDF",
  printFooter: "Magic Humans · www.magichumans.com",
  discoveryCta: "Want to see more clearly what you're really looking for in love? Let's talk for an hour, it's free.",
  discoveryUrl: "https://calendly.com/pierre-j-sarazin?utm_source=boussole-relation",
});
