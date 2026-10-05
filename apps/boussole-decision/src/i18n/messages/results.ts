// Page Résultats, ikigai, radar.
type CircleTexts = Record<"aime" | "doue" | "monde" | "paye", { label: string; short: string; missing: string }>;

const fr = {
  titleResults: "Mes résultats",
  headingMine: "Mes résultats",
  heading: "Résultats",
  intro:
    "Ton classement, ce qui allume ton talent et ce qui risque de l'éteindre dans chaque opportunité, puis la place de ton ressenti. Tout se met à jour quand tu modifies ton tableau.",
  finalizedNotice: "Cette version est finalisée : tes réponses sont protégées. Rouvre-la ou crée une nouvelle version pour les modifier.",

  emptyTitle: "Pas encore de résultats",
  emptyText:
    "Ajoute au moins une opportunité et remplis quelques cases de ton tableau : tes résultats apparaîtront ici, avec ton classement, ce qui allume ton talent et ce qui risque de l'éteindre.",
  backToTable: "← Retour à mon tableau",

  verdict: "Verdict",
  onlyOne: (score: string) => ` est la seule opportunité évaluée pour l'instant : ${score} d'alignement.`,
  leads: (score: string) => ` arrive en tête (${score}), devant `,
  leadsEnd: (score: string) => ` (${score}).`,
  and: " et ",
  tie: (a: string, b: string) => ` sont au coude à coude (${a} et ${b}) : c'est ton ressenti qui tranchera.`,
  allFail:
    "Aucune opportunité ne respecte pour l'instant tous tes non-négociables. Est-ce le moment d'en chercher d'autres, ou l'un de ces critères est-il en réalité négociable ?",
  compassNote: "Le score est une boussole, pas un verdict : il éclaire ta décision, il ne la prend pas.",
  notRated: "non évaluée",
  badgeNonNegotiable: "🔒 Non-négociable non respecté",
  badgeRedLine: "Ligne rouge franchie",
  badgeAnti: "Anti-Contexte présent",
  badgeToCheck: (n: number) => `${n} à vérifier`,

  contextsTitle: "Réussite ou échec, opportunité par opportunité",
  contextsIntroStart: "Dans chaque opportunité, serais-tu dans ton",
  contextsSuccess: "contexte de réussite",
  contextsMiddle: "(ton Contexte Déclencheur) ou dans ton",
  contextsFailure: "contexte d'échec",
  contextsEnd: "(ton Anti-Contexte) ?",
  ignitesTitle: "🌱 Ce qui allume ton talent ici",
  triggerPresent: "Ton Contexte Déclencheur est là",
  otherAssets: "Autres atouts",
  nothingGood: "Rien de franchement favorable pour l'instant.",
  extinguishTitle: "⚡ Ce qui risque de t'éteindre",
  failedNonNegotiables: "Non-négociables non respectés",
  antiPresent: "Ton Anti-Contexte est présent",
  missing: "Ce qui te manquerait",
  watch: "À surveiller",
  noFailureSignal: "Aucun signal de contexte d'échec. 👍",

  guardTitle: "Tes garde-fous",
  guardIntroStart: "Même la meilleure opportunité a ses pièges. Si tu choisis",
  guardIntroEnd: ", voici les signaux à surveiller pour ne pas glisser dans ton contexte d'échec.",
  watchOut: "Surveille :",
  inThisOpportunity: (value: string) => `(${value} dans cette opportunité)`,
  noAntiRisk: "Aucun risque d'Anti-Contexte repéré dans ton tableau pour cette opportunité.",
  livedFailures: "Tes contextes d'échec vécus",
  askYourself:
    "Pose-toi la question : dans cette opportunité, qu'est-ce qui pourrait te faire glisser là-dedans ? Et qu'est-ce qui t'en protégera ?",
  describeFailuresStart: "💡 Décris tes contextes d'échec vécus (« quand je suis trop isolé, derrière un écran toute la journée… ») sur",
  yourProfile: "ton profil",
  describeFailuresEnd: ": ils apparaîtront ici comme garde-fous.",

  ikigaiTitle: "L'ikigai de chaque opportunité",
  ikigaiIntro:
    "Quatre cercles qui comptent chacun pour 25 % : ce que j'aime (ma qualité de vie, sans mon Anti-Contexte), ce en quoi je suis doué·e (mon Contexte Déclencheur), ce dont le monde a besoin (mes valeurs, mes choix) et ce pour quoi je peux être payé·e (ma rémunération). Plus les quatre sont réunis, plus le centre devient doré.",
  ikigai: "Ikigai",
  ikigaiAria: (name: string, score: string) => `Ikigai de ${name} : ${score}`,
  ikigaiComplete: "✨ Ikigai complet : les quatre cercles sont réunis.",
  ikigaiWeak: " est faible : ",
  ikigaiIncomplete:
    "Pour calculer ton ikigai, ajoute au moins un critère évalué dans chacune des quatre familles (qualité de vie, talent, valeurs, rémunération).",
  overlaps: { passion: "Passion", mission: "Mission", profession: "Profession", vocation: "Vocation" },
  circles: {
    aime: { label: "Ce que j'aime", short: "J'aime", missing: "confortable, mais avec un sentiment de vide" },
    doue: { label: "Ce en quoi je suis doué·e", short: "Doué·e", missing: "enthousiasmant, mais avec un sentiment d'incertitude" },
    monde: { label: "Ce dont le monde a besoin", short: "Utile au monde", missing: "satisfaisant, mais avec un sentiment d'inutilité" },
    paye: { label: "Ce pour quoi je peux être payé·e", short: "Payé·e", missing: "plaisir et plénitude, mais sans assez gagner sa vie" },
  } as CircleTexts,

  radarTitle: "Le radar de tes opportunités",
  radarIntro:
    "Le score de chaque opportunité, catégorie par catégorie : plus la forme est grande, plus l'opportunité te correspond. Sur l'axe Anti-Contexte, un score élevé veut dire que le risque est évité.",
  legend: "Légende",
  radarAria: "Radar des scores par catégorie",
  radarCaption: "Score de chaque opportunité, catégorie par catégorie",
  category: "Catégorie",
  antiAvoided: "Anti-Contexte évité",

  questionsTitle: "Ce qu'il te reste à vérifier",
  questionsIntro:
    "Les cases « ? À vérifier » ou vides ne comptent pas dans le score. Voici les questions à poser (en entretien, à un futur collègue, à un client…) pour compléter ton tableau.",
  questionTowards: (label: string) => `Est-ce que j'aurai vraiment : « ${label} » ?`,
  questionAway: (label: string) => `Y a-t-il ce risque ici : « ${label} » ?`,
  nonNegotiable: "non négociable",

  stabilityTitle: "Ton classement tient-il ?",
  stabilityIntro: "On a refait le calcul en faisant compter chaque catégorie deux fois plus, puis deux fois moins.",
  solid: "Ton classement est solide.",
  solidText: (name: string) => ` Même si une catégorie comptait deux fois plus ou deux fois moins pour toi, ${name} resterait en tête.`,
  sensitive: "Ton classement est sensible.",
  sensitiveLeader: (name: string) => ` ${name} est en tête, mais :`,
  flip: (category: string, emphasis: "plus" | "moins", name: string) =>
    `si « ${category} » comptait deux fois ${emphasis} pour toi, ${name} passerait devant.`,
  stabilityHint:
    "La vraie question devient : quelle place veux-tu donner à ces catégories ? Tu peux ajuster les niveaux d'importance et ton barème dans",
  yourTable: "ton tableau",

  feelingsTitle: "Et ton ressenti ?",
  feelingsIntro:
    "Les chiffres ne disent pas tout. C'est souvent quand le classement surprend qu'on découvre le critère qui compte vraiment.",
  agreementQuestion: "Ce classement correspond-il à ton ressenti ?",
  agreeYes: "👍 Oui",
  agreeNotReally: "🤔 Pas vraiment",
  agreeNo: "👎 Non",
  missingQuestion: "Qu'est-ce qui manque dans tes critères ? Qu'est-ce que ton intuition sait que le tableau ignore ?",
  noNote: "Aucune note.",
  feedbackPlaceholder: "Ex. : je réalise que l'ambiance d'équipe compte plus que je ne le pensais…",
  addAsCriterionStart: "Si c'est un critère, ajoute-le dans",
  addAsCriterionEnd: ": le classement se mettra à jour.",
  projectionStart: "Imagine : demain, tu as signé pour",
  projectionEnd: ". Que ressens-tu en premier ?",
  projectionLabel: "Ce que tu ressens en premier",
  relief: "😌 Du soulagement",
  mixed: "😐 C'est mitigé",
  disappointment: "😟 De la déception",
  disappointmentHint:
    "Ton intuition te dit peut-être quelque chose que tes critères ne disent pas encore. Vers quelle autre opportunité ton cœur est-il parti ?",
  reliefHint: "Ta tête et ton intuition vont dans le même sens. 🧭",
  whatYouFeel: "Ce que tu ressens",
  projectionPlaceholder: "Note ce qui te vient, sans filtre…",

  nextStepsTitle: "Mes prochains pas",
  nextStepsIntro: "Une décision se construit en avançant. Note trois actions concrètes, petites et datées si possible.",
  forWhich: "Pour quelle opportunité ?",
  action: (n: number) => `Action ${n}`,
  stepPlaceholders: [
    "Ex. : appeler une personne qui fait déjà ce métier",
    "Ex. : demander une journée d'immersion",
    "Ex. : en parler à mon coach lors de la prochaine séance",
  ],
};

const en: typeof fr = {
  titleResults: "My results",
  headingMine: "My results",
  heading: "Results",
  intro:
    "Your ranking, what switches your talent on and what risks switching it off in each opportunity, then the place of your gut feeling. Everything updates when you change your table.",
  finalizedNotice: "This version is finalised: your answers are protected. Reopen it or create a new version to change them.",

  emptyTitle: "No results yet",
  emptyText:
    "Add at least one opportunity and fill in a few cells of your table: your results will appear here, with your ranking, what switches your talent on and what risks switching it off.",
  backToTable: "← Back to my table",

  verdict: "Verdict",
  onlyOne: (score: string) => ` is the only opportunity rated so far: ${score} alignment.`,
  leads: (score: string) => ` comes first (${score}), ahead of `,
  leadsEnd: (score: string) => ` (${score}).`,
  and: " and ",
  tie: (a: string, b: string) => ` are neck and neck (${a} and ${b}): your gut feeling will decide.`,
  allFail:
    "No opportunity currently meets all your non-negotiables. Is it time to look for others, or is one of these criteria actually negotiable?",
  compassNote: "The score is a compass, not a verdict: it sheds light on your decision, it doesn't make it for you.",
  notRated: "not rated",
  badgeNonNegotiable: "🔒 Non-negotiable not met",
  badgeRedLine: "Red line crossed",
  badgeAnti: "Anti-Context present",
  badgeToCheck: (n: number) => `${n} to check`,

  contextsTitle: "Success or failure, opportunity by opportunity",
  contextsIntroStart: "In each opportunity, would you be in your",
  contextsSuccess: "context of success",
  contextsMiddle: "(your Trigger Context) or in your",
  contextsFailure: "context of failure",
  contextsEnd: "(your Anti-Context)?",
  ignitesTitle: "🌱 What switches your talent on here",
  triggerPresent: "Your Trigger Context is there",
  otherAssets: "Other strengths",
  nothingGood: "Nothing clearly in its favour yet.",
  extinguishTitle: "⚡ What risks switching you off",
  failedNonNegotiables: "Non-negotiables not met",
  antiPresent: "Your Anti-Context is present",
  missing: "What you would miss",
  watch: "To watch",
  noFailureSignal: "No sign of a context of failure. 👍",

  guardTitle: "Your guardrails",
  guardIntroStart: "Even the best opportunity has its traps. If you choose",
  guardIntroEnd: ", here are the signals to watch so you don't slip into your context of failure.",
  watchOut: "Watch:",
  inThisOpportunity: (value: string) => `(${value} in this opportunity)`,
  noAntiRisk: "No Anti-Context risk spotted in your table for this opportunity.",
  livedFailures: "Your lived contexts of failure",
  askYourself: "Ask yourself: in this opportunity, what could make you slip into this? And what will protect you from it?",
  describeFailuresStart: "💡 Describe your lived contexts of failure (“when I'm too isolated, behind a screen all day…”) on",
  yourProfile: "your profile",
  describeFailuresEnd: ": they will show up here as guardrails.",

  ikigaiTitle: "The ikigai of each opportunity",
  ikigaiIntro:
    "Four circles that each count for 25%: what I love (my quality of life, without my Anti-Context), what I'm good at (my Trigger Context), what the world needs (my values, my choices) and what I can be paid for (my pay). The more the four come together, the more golden the centre becomes.",
  ikigai: "Ikigai",
  ikigaiAria: (name: string, score: string) => `Ikigai of ${name}: ${score}`,
  ikigaiComplete: "✨ Complete ikigai: all four circles come together.",
  ikigaiWeak: " is weak: ",
  ikigaiIncomplete:
    "To calculate your ikigai, add at least one rated criterion in each of the four families (quality of life, talent, values, pay).",
  overlaps: { passion: "Passion", mission: "Mission", profession: "Profession", vocation: "Vocation" },
  circles: {
    aime: { label: "What I love", short: "I love it", missing: "comfortable, but with a feeling of emptiness" },
    doue: { label: "What I'm good at", short: "Good at it", missing: "exciting, but with a feeling of uncertainty" },
    monde: { label: "What the world needs", short: "World needs it", missing: "satisfying, but with a feeling of uselessness" },
    paye: { label: "What I can be paid for", short: "Paid for it", missing: "delight and fullness, but not enough to make a living" },
  },

  radarTitle: "The radar of your opportunities",
  radarIntro:
    "Each opportunity's score, category by category: the bigger the shape, the better the opportunity fits you. On the Anti-Context axis, a high score means the risk is avoided.",
  legend: "Legend",
  radarAria: "Radar of scores by category",
  radarCaption: "Each opportunity's score, category by category",
  category: "Category",
  antiAvoided: "Anti-Context avoided",

  questionsTitle: "What you still need to check",
  questionsIntro:
    "Cells marked “? To check” or left empty don't count in the score. Here are the questions to ask (in an interview, a future colleague, a client…) to complete your table.",
  questionTowards: (label: string) => `Will I really have: “${label}”?`,
  questionAway: (label: string) => `Is this risk present here: “${label}”?`,
  nonNegotiable: "non-negotiable",

  stabilityTitle: "Does your ranking hold?",
  stabilityIntro: "We recalculated with each category counting twice as much, then half as much.",
  solid: "Your ranking is solid.",
  solidText: (name: string) => ` Even if a category counted twice as much or half as much for you, ${name} would stay first.`,
  sensitive: "Your ranking is sensitive.",
  sensitiveLeader: (name: string) => ` ${name} is first, but:`,
  flip: (category: string, emphasis: "plus" | "moins", name: string) =>
    `if “${category}” counted ${emphasis === "plus" ? "twice as much" : "half as much"} for you, ${name} would move ahead.`,
  stabilityHint:
    "The real question becomes: how much weight do you want to give these categories? You can adjust importance levels and your weights in",
  yourTable: "your table",

  feelingsTitle: "And your gut feeling?",
  feelingsIntro:
    "Numbers don't tell the whole story. It's often when the ranking surprises you that you discover the criterion that really matters.",
  agreementQuestion: "Does this ranking match your gut feeling?",
  agreeYes: "👍 Yes",
  agreeNotReally: "🤔 Not really",
  agreeNo: "👎 No",
  missingQuestion: "What's missing from your criteria? What does your intuition know that the table ignores?",
  noNote: "No note.",
  feedbackPlaceholder: "E.g. I realise the team atmosphere matters more than I thought…",
  addAsCriterionStart: "If it's a criterion, add it to",
  addAsCriterionEnd: ": the ranking will update.",
  projectionStart: "Imagine: tomorrow, you've signed for",
  projectionEnd: ". What do you feel first?",
  projectionLabel: "What you feel first",
  relief: "😌 Relief",
  mixed: "😐 Mixed feelings",
  disappointment: "😟 Disappointment",
  disappointmentHint:
    "Your intuition may be telling you something your criteria don't say yet. Which other opportunity did your heart go to?",
  reliefHint: "Your head and your intuition point the same way. 🧭",
  whatYouFeel: "What you feel",
  projectionPlaceholder: "Write down what comes to you, unfiltered…",

  nextStepsTitle: "My next steps",
  nextStepsIntro: "A decision takes shape as you move. Write down three concrete actions, small and dated if possible.",
  forWhich: "For which opportunity?",
  action: (n: number) => `Action ${n}`,
  stepPlaceholders: [
    "E.g. call someone who already does this job",
    "E.g. ask for a day of job shadowing",
    "E.g. talk about it with my coach at the next session",
  ],
};

export const results = { fr, en };
