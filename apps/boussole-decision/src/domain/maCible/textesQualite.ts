// Textes et motifs des contrôles de qualité, par langue de réponse.
// Les phrases ajoutées ou remplacées dans un résultat doivent être dans la langue de ce résultat :
// jamais une phrase française dans une réponse anglaise.
// Les messages d'erreur renvoyés au modèle (relance) restent en français, comme le prompt.
import type { Adresse, Langue } from "./types";

export interface TextesQualite {
  /** Questions « Mom test » à proscrire (hypothétiques, avis, intention d'achat). */
  mom: readonly RegExp[];
  /** Questions de secours, sur un comportement passé, selon le registre. */
  questions: Record<"tu" | "vous", readonly string[]>;
  /** Signature de l'email, selon le registre. « {{prenom}} » reste seul sur la dernière ligne. */
  signature: Record<"tu" | "vous", string>;
  /** Formules de fin reconnues (pour remplacer une signature par la bonne). */
  formulesFin: readonly string[];
  /** Plusieurs séances : la promesse ne doit pas dire « en une séance ». */
  plusieurs: RegExp;
  uneFois: RegExp;
  surLaDuree: string;
  plaisirPlafonne: string;
  accesPlafonne: string;
  ideeNonReprise: (extrait: string) => string;
  marcheNonTranche: string;
  departage: (devant: string, derriere: string, motif: "plaisir" | "urgence" | "identifiant") => string;
  pisteLigne: string;
  pisteRaison: string;
  ideeNonEtudiee: (idee: string) => string;
  prenomsSecours: readonly string[];
  /** Voie salarié. */
  salarie: {
    phraseSortie: Record<"tu" | "vous", string>;
    sortie: RegExp;
    vocabulaireIndependant: RegExp;
    reprendAEviter: string;
  };
}

const FR: TextesQualite = {
  mom: [
    /si tu pouvais/i,
    /si vous pouviez/i,
    /si tu avais/i,
    /si vous aviez/i,
    /que penses-tu de/i,
    /que pensez-vous de/i,
    /qu'est-ce que tu penses/i,
    /qu'est-ce que vous pensez/i,
    /est-ce que tu ach[eè]terais/i,
    /ach[eè]teriez-vous/i,
    /serais-tu pr[eê]t/i,
    /seriez-vous pr[eê]t/i,
  ],
  questions: {
    vous: [
      "La dernière fois que ce sujet s'est présenté, qu'avez-vous fait ?",
      "Quand cela vous est arrivé récemment, comment l'avez-vous géré ?",
      "Qu'avez-vous déjà essayé, concrètement, la dernière fois ?",
      "Combien cela vous a-t-il coûté la dernière fois ?",
      "À qui en avez-vous parlé, et qu'est-ce qui a suivi ?",
    ],
    tu: [
      "La dernière fois que ce sujet s'est présenté, qu'as-tu fait ?",
      "Quand cela t'est arrivé récemment, comment l'as-tu géré ?",
      "Qu'as-tu déjà essayé, concrètement, la dernière fois ?",
      "Combien cela t'a-t-il coûté la dernière fois ?",
      "À qui en as-tu parlé, et qu'est-ce qui a suivi ?",
    ],
  },
  signature: { tu: "À bientôt,\n\n{{prenom}}", vous: "Bien à vous,\n\n{{prenom}}" },
  formulesFin: ["Bien à vous,", "À bientôt,", "A bientôt,", "Belle journée,", "Cordialement,", "Merci,"],
  plusieurs: /\b(\d{1,2}|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s+(séances|seances|sessions|ateliers|modules|rendez-vous)\b/i,
  uneFois: /\ben une (séance|seance|session|heure)\b/gi,
  surLaDuree: "sur la durée du parcours",
  plaisirPlafonne: "Note plafonnée à 2 : cette cible reprend des traits de l'Anti-Contexte.",
  accesPlafonne: "L'accès vaut 4 : cette cible n'est pas décrite dans le réseau proche (expérience, clients passés).",
  ideeNonReprise: (extrait) => `Ton idée (« ${extrait} ») n'est pas reprise comme cible : elle reste à vérifier sur le terrain.`,
  marcheNonTranche: "Le marché n'était pas tranché : une seule famille de cibles est proposée, à confirmer avec toi.",
  departage: (devant, derriere, motif) =>
    `« ${devant} » et « ${derriere} » avaient le même score. « ${devant} » passe devant : ${
      motif === "plaisir" ? "le plaisir du talent y est plus haut" : motif === "urgence" ? "le problème y est plus urgent" : "à notes égales, l'ordre des identifiants la place devant"
    }.`,
  pisteLigne: "Ton idée, pas encore étudiée en détail par l'IA.",
  pisteRaison: "L'IA ne l'a pas commentée. Creuse-la pour en avoir le cœur net.",
  ideeNonEtudiee: (idee) => `Ton idée « ${idee} » n'a pas pu être étudiée cette fois. Propose-la dans l'esquisse pour la creuser.`,
  prenomsSecours: ["Claire", "Nadia", "Julien", "Sophie", "Karim", "Isabelle", "Thomas", "Élodie"],
  salarie: {
    phraseSortie: {
      vous: "Si ce n'est pas le bon moment, dites-le-moi simplement.",
      tu: "Si ce n'est pas le bon moment, dis-le-moi simplement.",
    },
    sortie: /(bon moment|pas pour vous|pas pour toi|ne pas donner suite|dites-le-moi|dis-le-moi|dites le moi|dis le moi)/,
    vocabulaireIndependant: /\b(tarifs?|prestations?|devis|tes clients?|ton client|ta clientele|ton offre de service)\b/,
    reprendAEviter: "Il reprend des traits de ce que tu veux éviter.",
  },
};

const EN: TextesQualite = {
  mom: [
    /\bif you could\b/i,
    /\bif you had\b/i,
    /\bwhat do you think (of|about)\b/i,
    /\bhow do you feel about\b/i,
    /\bwould you (buy|pay|use|sign up)\b/i,
    /\bwould you be (willing|ready|interested)\b/i,
  ],
  questions: {
    tu: [
      "The last time this came up, what did you do?",
      "When it happened recently, how did you handle it?",
      "What did you actually try the last time?",
      "How much did it cost you the last time?",
      "Who did you talk to about it, and what happened next?",
    ],
    vous: [
      "The last time this came up, what did you do?",
      "When it happened recently, how did you handle it?",
      "What did you actually try the last time?",
      "How much did it cost you the last time?",
      "Who did you talk to about it, and what happened next?",
    ],
  },
  signature: { tu: "Talk soon,\n\n{{prenom}}", vous: "Kind regards,\n\n{{prenom}}" },
  formulesFin: ["Kind regards,", "Best regards,", "Best,", "Talk soon,", "Cheers,", "Thanks,", "Many thanks,", "Warm regards,", "Sincerely,"],
  plusieurs: /\b(\d{1,2}|two|three|four|five|six|seven|eight|nine|ten)\s+(sessions|workshops|modules|meetings)\b/i,
  uneFois: /\bin (?:a single|one) (session|hour)\b/gi,
  surLaDuree: "over the whole programme",
  plaisirPlafonne: "Capped at 2: this target shares traits with your Anti-Context.",
  accesPlafonne: "Access is 4: this target doesn't appear in your close network (experience, past clients).",
  ideeNonReprise: (extrait) => `Your idea ("${extrait}") wasn't kept as a target: it's still worth testing in the field.`,
  marcheNonTranche: "You hadn't picked a market yet: only one kind of target is suggested, to check with you.",
  departage: (devant, derriere, motif) =>
    `"${devant}" and "${derriere}" had the same score. "${devant}" comes first: ${
      motif === "plaisir" ? "you'd enjoy using your talent there more" : motif === "urgence" ? "the problem is more urgent there" : "with equal scores, the order of the IDs puts it first"
    }.`,
  pisteLigne: "Your idea, not yet studied in detail by the AI.",
  pisteRaison: "The AI didn't comment on it. Dig into it to find out.",
  ideeNonEtudiee: (idee) => `Your idea "${idee}" couldn't be studied this time. Add it in the sketch to dig into it.`,
  prenomsSecours: ["Claire", "Nadia", "James", "Sophie", "Omar", "Emma", "Thomas", "Laura"],
  salarie: {
    phraseSortie: {
      vous: "If now isn't a good time, just let me know.",
      tu: "If now isn't a good time, just let me know.",
    },
    sortie: /(good time|not for you|let me know|no worries if not)/,
    vocabulaireIndependant: /\b(rates?|fees?|quotes?|your clients?|your client base|your service offer)\b/,
    reprendAEviter: "It shares traits with what you want to avoid.",
  },
};

const ES: TextesQualite = {
  mom: [/\bsi pudieras\b/i, /\bsi pudiera\b/i, /\bsi tuvieras\b/i, /\bsi tuviera\b/i, /qu[eé] piensas de/i, /qu[eé] opina de/i, /\bcomprar[ií]as?\b/i, /\bestar[ií]as? dispuest/i],
  questions: {
    tu: [
      "La última vez que surgió este tema, ¿qué hiciste?",
      "Cuando te pasó hace poco, ¿cómo lo gestionaste?",
      "¿Qué probaste, en concreto, la última vez?",
      "¿Cuánto te costó la última vez?",
      "¿Con quién lo hablaste y qué pasó después?",
    ],
    vous: [
      "La última vez que surgió este tema, ¿qué hizo?",
      "Cuando le pasó hace poco, ¿cómo lo gestionó?",
      "¿Qué probó, en concreto, la última vez?",
      "¿Cuánto le costó la última vez?",
      "¿Con quién lo habló y qué pasó después?",
    ],
  },
  signature: { tu: "Un abrazo,\n\n{{prenom}}", vous: "Atentamente,\n\n{{prenom}}" },
  formulesFin: ["Atentamente,", "Un saludo,", "Saludos,", "Un abrazo,", "Gracias,", "Cordialmente,"],
  plusieurs: /\b(\d{1,2}|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+(sesiones|talleres|m[oó]dulos|citas)\b/i,
  uneFois: /\ben una (?:sola )?(sesi[oó]n|hora)\b/gi,
  surLaDuree: "a lo largo del programa",
  plaisirPlafonne: "Nota limitada a 2: este cliente tiene rasgos de tu Anti-Contexto.",
  accesPlafonne: "El acceso vale 4: este cliente no aparece en tu red cercana (experiencia, clientes anteriores).",
  ideeNonReprise: (extrait) => `Tu idea («${extrait}») no se ha retomado como objetivo: queda por comprobar sobre el terreno.`,
  marcheNonTranche: "No habías elegido mercado: solo se propone un tipo de cliente, a confirmar contigo.",
  departage: (devant, derriere, motif) =>
    `«${devant}» y «${derriere}» tenían la misma puntuación. «${devant}» va primero: ${
      motif === "plaisir" ? "disfrutarías más usando tu talento ahí" : motif === "urgence" ? "el problema es más urgente ahí" : "a igual puntuación, el orden de los identificadores lo pone delante"
    }.`,
  pisteLigne: "Tu idea, aún no estudiada en detalle por la IA.",
  pisteRaison: "La IA no la ha comentado. Profundiza para salir de dudas.",
  ideeNonEtudiee: (idee) => `Tu idea «${idee}» no se ha podido estudiar esta vez. Propónla en el esbozo para profundizar.`,
  prenomsSecours: ["Lucía", "Nadia", "Javier", "Sofía", "Karim", "Isabel", "Tomás", "Elena"],
  salarie: {
    phraseSortie: {
      vous: "Si no es buen momento, dígamelo sin problema.",
      tu: "Si no es buen momento, dímelo sin problema.",
    },
    sortie: /(buen momento|no es para ti|no es para usted|dimelo|digamelo|hazmelo saber)/,
    vocabulaireIndependant: /\b(tarifas?|honorarios|presupuestos?|tus clientes?|tu cartera de clientes)\b/,
    reprendAEviter: "Tiene rasgos de lo que quieres evitar.",
  },
};

export const TEXTES_QUALITE: Record<Langue, TextesQualite> = { fr: FR, en: EN, es: ES };

export const textesQualite = (langue: Langue | undefined): TextesQualite => TEXTES_QUALITE[langue ?? "fr"] ?? FR;

/** Toutes les formules de fin connues, toutes langues : une signature d'une autre langue est aussi remplacée. */
export const FORMULES_FIN_TOUTES: readonly string[] = [...new Set([...FR.formulesFin, ...EN.formulesFin, ...ES.formulesFin])];

/** Un mot de valeur dans la justification du prix, quelle que soit la langue. */
export const VALEUR_TOUTES = /valeur|cout|coûte|coute|budget|marche|marché|probleme|problème|rapport|perte|econom|économ|value|cost|market|problem|loss|saving|return|roi\b|valor|coste|costo|presupuesto|mercado|problema|p[eé]rdida|ahorr|rentab/i;

export const registre = (adresse: Adresse): "tu" | "vous" => (adresse === "tu" ? "tu" : "vous");
