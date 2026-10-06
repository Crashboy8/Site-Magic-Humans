// Page Résultats, ikigai, radar.
type CircleTexts = Record<"aime" | "doue" | "monde" | "paye", { label: string; short: string; missing: string }>;

const fr = {
  titleResults: "Mes résultats",
  headingMine: "Mes résultats",
  heading: "Résultats",
  intro:
    "Ton classement, ce qui allume ton talent et ce qui risque de l'éteindre dans chaque opportunité, puis la place de ton ressenti. Tout se met à jour quand tu modifies ton tableau.",
  finalizedNotice: "Cette version est finalisée : tes réponses sont protégées. Rouvre-la ou crée une nouvelle version pour les modifier.",

  emptyTitle: "Pas encore de résultats",
  emptyText:
    "Ajoute au moins une opportunité et remplis quelques cases de ton tableau : tes résultats apparaîtront ici, avec ton classement, ce qui allume ton talent et ce qui risque de l'éteindre.",
  backToTable: "← Retour à mon tableau",

  verdict: "Verdict",
  onlyOne: (score: string) => ` est la seule opportunité évaluée pour l'instant : ${score} d'alignement.`,
  leads: (score: string) => ` arrive en tête (${score}), devant `,
  leadsEnd: (score: string) => ` (${score}).`,
  and: " et ",
  tie: (a: string, b: string) => ` sont au coude à coude (${a} et ${b}) : c'est ton ressenti qui tranchera.`,
  allFail:
    "Aucune opportunité ne respecte pour l'instant tous tes non-négociables. Est-ce le moment d'en chercher d'autres, ou l'un de ces critères est-il en réalité négociable ?",
  compassNote: "Le score est une boussole, pas un verdict : il éclaire ta décision, il ne la prend pas.",
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
  contextsEnd: "(ton Anti-Contexte) ?",
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
  watchOut: "Surveille :",
  inThisOpportunity: (value: string) => `(${value} dans cette opportunité)`,
  noAntiRisk: "Aucun risque d'Anti-Contexte repéré dans ton tableau pour cette opportunité.",
  livedFailures: "Tes contextes d'échec vécus",
  askYourself:
    "Pose-toi la question : dans cette opportunité, qu'est-ce qui pourrait te faire glisser là-dedans ? Et qu'est-ce qui t'en protégera ?",
  describeFailuresStart: "💡 Décris tes contextes d'échec vécus (« quand je suis trop isolé, derrière un écran toute la journée… ») sur",
  yourProfile: "ton profil",
  describeFailuresEnd: ": ils apparaîtront ici comme garde-fous.",

  ikigaiTitle: "L'ikigai de chaque opportunité",
  ikigaiIntro:
    "Quatre cercles qui comptent chacun pour 25 % : ce que j'aime (ma qualité de vie, sans mon Anti-Contexte), ce en quoi je suis doué·e (mon Contexte Déclencheur), ce dont le monde a besoin (mes valeurs, mes choix) et ce pour quoi je peux être payé·e (ma rémunération). Plus les quatre sont réunis, plus le centre devient doré.",
  ikigai: "Ikigai",
  ikigaiAria: (name: string, score: string) => `Ikigai de ${name} : ${score}`,
  ikigaiComplete: "✨ Ikigai complet : les quatre cercles sont réunis.",
  ikigaiWeak: " est faible : ",
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
    "Le score de chaque opportunité, catégorie par catégorie : plus la forme est grande, plus l'opportunité te correspond. Sur l'axe Anti-Contexte, un score élevé veut dire que le risque est évité.",
  legend: "Légende",
  radarAria: "Radar des scores par catégorie",
  radarCaption: "Score de chaque opportunité, catégorie par catégorie",
  category: "Catégorie",
  antiAvoided: "Anti-Contexte évité",

  questionsTitle: "Ce qu'il te reste à vérifier",
  questionsIntro:
    "Les cases « ? À vérifier » ou vides ne comptent pas dans le score. Voici les questions à poser (en entretien, à un futur collègue, à un client…) pour compléter ton tableau.",
  questionTowards: (label: string) => `Est-ce que j'aurai vraiment : « ${label} » ?`,
  questionAway: (label: string) => `Y a-t-il ce risque ici : « ${label} » ?`,
  nonNegotiable: "non négociable",

  stabilityTitle: "Ton classement tient-il ?",
  stabilityIntro: "On a refait le calcul en faisant compter chaque catégorie deux fois plus, puis deux fois moins.",
  solid: "Ton classement est solide.",
  solidText: (name: string) => ` Même si une catégorie comptait deux fois plus ou deux fois moins pour toi, ${name} resterait en tête.`,
  sensitive: "Ton classement est sensible.",
  sensitiveLeader: (name: string) => ` ${name} est en tête, mais :`,
  flip: (category: string, emphasis: "plus" | "moins", name: string) =>
    `si « ${category} » comptait deux fois ${emphasis} pour toi, ${name} passerait devant.`,
  stabilityHint:
    "La vraie question devient : quelle place veux-tu donner à ces catégories ? Tu peux ajuster les niveaux d'importance et ton barème dans",
  yourTable: "ton tableau",

  feelingsTitle: "Et ton ressenti ?",
  feelingsIntro:
    "Les chiffres ne disent pas tout. C'est souvent quand le classement surprend qu'on découvre le critère qui compte vraiment.",
  agreementQuestion: "Ce classement correspond-il à ton ressenti ?",
  agreeYes: "👍 Oui",
  agreeNotReally: "🤔 Pas vraiment",
  agreeNo: "👎 Non",
  missingQuestion: "Qu'est-ce qui manque dans tes critères ? Qu'est-ce que ton intuition sait que le tableau ignore ?",
  noNote: "Aucune note.",
  feedbackPlaceholder: "Ex. : je réalise que l'ambiance d'équipe compte plus que je ne le pensais…",
  addAsCriterionStart: "Si c'est un critère, ajoute-le dans",
  addAsCriterionEnd: ": le classement se mettra à jour.",
  projectionStart: "Imagine : demain, tu as signé pour",
  projectionEnd: ". Que ressens-tu en premier ?",
  projectionLabel: "Ce que tu ressens en premier",
  relief: "😌 Du soulagement",
  mixed: "😐 C'est mitigé",
  disappointment: "😟 De la déception",
  disappointmentHint:
    "Ton intuition te dit peut-être quelque chose que tes critères ne disent pas encore. Vers quelle autre opportunité ton cœur est-il parti ?",
  reliefHint: "Ta tête et ton intuition vont dans le même sens. 🧭",
  whatYouFeel: "Ce que tu ressens",
  projectionPlaceholder: "Note ce qui te vient, sans filtre…",

  nextStepsTitle: "Mes prochains pas",
  nextStepsIntro: "Une décision se construit en avançant. Note trois actions concrètes, petites et datées si possible.",
  forWhich: "Pour quelle opportunité ?",
  action: (n: number) => `Action ${n}`,
  stepPlaceholders: [
    "Ex. : appeler une personne qui fait déjà ce métier",
    "Ex. : demander une journée d'immersion",
    "Ex. : en parler à mon coach lors de la prochaine séance",
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

const es: typeof fr = {
  titleResults: "Mis resultados",
  headingMine: "Mis resultados",
  heading: "Resultados",
  intro:
    "Tu clasificación, lo que enciende tu talento y lo que amenaza con apagarlo en cada oportunidad, y después el lugar de tus sensaciones. Todo se actualiza cuando modificas tu tabla.",
  finalizedNotice: "Esta versión está finalizada: tus respuestas están protegidas. Reábrela o crea una nueva versión para modificarlas.",

  emptyTitle: "Todavía no hay resultados",
  emptyText:
    "Añade al menos una oportunidad y rellena algunas casillas de tu tabla: tus resultados aparecerán aquí, con tu clasificación, lo que enciende tu talento y lo que amenaza con apagarlo.",
  backToTable: "← Volver a mi tabla",

  verdict: "Veredicto",
  onlyOne: (score: string) => ` es por ahora la única oportunidad evaluada: ${score} de alineación.`,
  leads: (score: string) => ` va en cabeza (${score}), por delante de `,
  leadsEnd: (score: string) => ` (${score}).`,
  and: " y ",
  tie: (a: string, b: string) => ` están codo con codo (${a} y ${b}): tus sensaciones decidirán.`,
  allFail:
    "Ninguna oportunidad cumple por ahora todos tus innegociables. ¿Es momento de buscar otras, o alguno de estos criterios es en realidad negociable?",
  compassNote: "La puntuación es una brújula, no un veredicto: ilumina tu decisión, no la toma por ti.",
  notRated: "sin evaluar",
  badgeNonNegotiable: "🔒 Innegociable no cumplido",
  badgeRedLine: "Línea roja cruzada",
  badgeAnti: "Anti-Contexto presente",
  badgeToCheck: (n: number) => `${n} por comprobar`,

  contextsTitle: "Éxito o fracaso, oportunidad por oportunidad",
  contextsIntroStart: "En cada oportunidad, ¿estarías en tu",
  contextsSuccess: "contexto de éxito",
  contextsMiddle: "(tu Contexto Desencadenante) o en tu",
  contextsFailure: "contexto de fracaso",
  contextsEnd: "(tu Anti-Contexto)?",
  ignitesTitle: "🌱 Lo que enciende tu talento aquí",
  triggerPresent: "Tu Contexto Desencadenante está presente",
  otherAssets: "Otros puntos fuertes",
  nothingGood: "Todavía nada claramente a su favor.",
  extinguishTitle: "⚡ Lo que amenaza con apagarte",
  failedNonNegotiables: "Innegociables no cumplidos",
  antiPresent: "Tu Anti-Contexto está presente",
  missing: "Lo que te faltaría",
  watch: "A vigilar",
  noFailureSignal: "Ninguna señal de contexto de fracaso. 👍",

  guardTitle: "Tus salvaguardas",
  guardIntroStart: "Incluso la mejor oportunidad tiene sus trampas. Si eliges",
  guardIntroEnd: ", estas son las señales que vigilar para no caer en tu contexto de fracaso.",
  watchOut: "Vigila:",
  inThisOpportunity: (value: string) => `(${value} en esta oportunidad)`,
  noAntiRisk: "No se ha detectado ningún riesgo de Anti-Contexto en tu tabla para esta oportunidad.",
  livedFailures: "Tus contextos de fracaso vividos",
  askYourself: "Pregúntate: en esta oportunidad, ¿qué podría hacerte caer en esto? ¿Y qué te protegerá?",
  describeFailuresStart:
    "💡 Describe tus contextos de fracaso vividos («cuando estoy demasiado aislado, todo el día delante de una pantalla…») en",
  yourProfile: "tu perfil",
  describeFailuresEnd: ": aparecerán aquí como salvaguardas.",

  ikigaiTitle: "El ikigai de cada oportunidad",
  ikigaiIntro:
    "Cuatro círculos que cuentan un 25 % cada uno: lo que amo (mi calidad de vida, sin mi Anti-Contexto), aquello en lo que soy bueno (mi Contexto Desencadenante), lo que el mundo necesita (mis valores, mis elecciones) y aquello por lo que me pueden pagar (mi remuneración). Cuanto más se juntan los cuatro, más dorado se vuelve el centro.",
  ikigai: "Ikigai",
  ikigaiAria: (name: string, score: string) => `Ikigai de ${name}: ${score}`,
  ikigaiComplete: "✨ Ikigai completo: los cuatro círculos se juntan.",
  ikigaiWeak: " es débil: ",
  ikigaiIncomplete:
    "Para calcular tu ikigai, añade al menos un criterio evaluado en cada una de las cuatro familias (calidad de vida, talento, valores, remuneración).",
  overlaps: { passion: "Pasión", mission: "Misión", profession: "Profesión", vocation: "Vocación" },
  circles: {
    aime: { label: "Lo que amo", short: "Lo amo", missing: "cómodo, pero con una sensación de vacío" },
    doue: { label: "Aquello en lo que soy bueno", short: "Soy bueno", missing: "emocionante, pero con una sensación de incertidumbre" },
    monde: {
      label: "Lo que el mundo necesita",
      short: "El mundo lo necesita",
      missing: "satisfactorio, pero con una sensación de inutilidad",
    },
    paye: {
      label: "Aquello por lo que me pueden pagar",
      short: "Me pagan",
      missing: "alegría y plenitud, pero no lo suficiente para vivir",
    },
  },

  radarTitle: "El radar de tus oportunidades",
  radarIntro:
    "La puntuación de cada oportunidad, categoría por categoría: cuanto más grande es la forma, mejor te encaja la oportunidad. En el eje del Anti-Contexto, una puntuación alta significa que el riesgo se evita.",
  legend: "Leyenda",
  radarAria: "Radar de las puntuaciones por categoría",
  radarCaption: "La puntuación de cada oportunidad, categoría por categoría",
  category: "Categoría",
  antiAvoided: "Anti-Contexto evitado",

  questionsTitle: "Lo que todavía tienes que comprobar",
  questionsIntro:
    "Las casillas marcadas «? Por comprobar» o vacías no cuentan en la puntuación. Estas son las preguntas que hacer (en una entrevista, a un futuro compañero, a un cliente…) para completar tu tabla.",
  questionTowards: (label: string) => `¿Tendré de verdad: «${label}»?`,
  questionAway: (label: string) => `¿Está presente este riesgo aquí: «${label}»?`,
  nonNegotiable: "innegociable",

  stabilityTitle: "¿Se sostiene tu clasificación?",
  stabilityIntro: "Hemos recalculado haciendo que cada categoría cuente el doble y luego la mitad.",
  solid: "Tu clasificación es sólida.",
  solidText: (name: string) => ` Aunque una categoría contara el doble o la mitad para ti, ${name} seguiría en primer lugar.`,
  sensitive: "Tu clasificación es sensible.",
  sensitiveLeader: (name: string) => ` ${name} va en cabeza, pero:`,
  flip: (category: string, emphasis: "plus" | "moins", name: string) =>
    `si «${category}» contara ${emphasis === "plus" ? "el doble" : "la mitad"} para ti, ${name} pasaría delante.`,
  stabilityHint:
    "La verdadera pregunta pasa a ser: ¿cuánto peso quieres dar a estas categorías? Puedes ajustar los niveles de importancia y tu baremo en",
  yourTable: "tu tabla",

  feelingsTitle: "¿Y tus sensaciones?",
  feelingsIntro:
    "Las cifras no lo dicen todo. A menudo es cuando la clasificación te sorprende cuando descubres el criterio que de verdad importa.",
  agreementQuestion: "¿Esta clasificación coincide con lo que sientes?",
  agreeYes: "👍 Sí",
  agreeNotReally: "🤔 No del todo",
  agreeNo: "👎 No",
  missingQuestion: "¿Qué falta en tus criterios? ¿Qué sabe tu intuición que la tabla ignora?",
  noNote: "Ninguna nota.",
  feedbackPlaceholder: "Ej.: me doy cuenta de que el ambiente del equipo cuenta más de lo que pensaba…",
  addAsCriterionStart: "Si es un criterio, añádelo a",
  addAsCriterionEnd: ": la clasificación se actualizará.",
  projectionStart: "Imagina: mañana has firmado por",
  projectionEnd: ". ¿Qué sientes primero?",
  projectionLabel: "Lo que sientes primero",
  relief: "😌 Alivio",
  mixed: "😐 Sensaciones encontradas",
  disappointment: "😟 Decepción",
  disappointmentHint:
    "Quizá tu intuición te dice algo que tus criterios todavía no expresan. ¿Hacia qué otra oportunidad se fue tu corazón?",
  reliefHint: "Tu cabeza y tu intuición apuntan en la misma dirección. 🧭",
  whatYouFeel: "Lo que sientes",
  projectionPlaceholder: "Escribe lo que te venga, sin filtro…",

  nextStepsTitle: "Mis próximos pasos",
  nextStepsIntro: "Una decisión se construye avanzando. Escribe tres acciones concretas, pequeñas y con fecha si es posible.",
  forWhich: "¿Para qué oportunidad?",
  action: (n: number) => `Acción ${n}`,
  stepPlaceholders: [
    "Ej.: llamar a alguien que ya hace este trabajo",
    "Ej.: pedir un día de inmersión",
    "Ej.: hablarlo con mi coach en la próxima sesión",
  ],
};

export const results = { fr, en, es };
