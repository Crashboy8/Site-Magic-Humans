// Exemples d'approfondissement en anglais : traduction de exempleApprofondir.ts, sans régénération par l'IA. Aucun nom réel.
import { RESULTAT_EXEMPLE_EN } from "./exempleEn";
import type { AutrePiste, Cible, Portrait } from "./types";

export const PORTRAIT_EXEMPLE_EN: Portrait = {
  prenom: "Claire",
  age: "45 to 55",
  situation:
    "Manager of a 180-person food production site near Rennes. She inherited two team leaders who haven't spoken since the last restructuring, and production is starting to suffer.",
  journee:
    "In at 7 for the safety briefing, a production meeting at 9 where nobody looks at each other, calls with head office in the afternoon, and in the evening she rereads the complaint emails she hasn't had time to deal with.",
  declencheur:
    "The day one of her best technicians tells her he's leaving for a competitor, because the atmosphere has become unbearable.",
  pourToi:
    "A team under strain that needs to start talking again: that's exactly your territory. Watch out for head office, which is very hierarchical and will want to sign everything off three times.",
  dejaEssaye: [
    "A team-building away day with an outdoor activity, forgotten within two weeks",
    "One-to-one meetings with each team leader, with no effect on their relationship",
    "A communication course offered by head office, felt to be too theoretical",
  ],
  douleurs: [
    {
      titre: "Two camps in the team",
      detail: "Each team leader has their own loyal followers. Information no longer flows between shifts.",
      intensite: 5,
      sesMots: "It feels like I'm running two plants that have turned their backs on each other",
      verbatim: "",
    },
    {
      titre: "Decisions that drag on",
      detail: "Every schedule change turns into a negotiation. She makes the call alone, and gets blamed for it.",
      intensite: 4,
      sesMots: "I spend my days refereeing arguments instead of running the site",
      verbatim: "",
    },
    {
      titre: "The fear of losing the best people",
      detail: "Two people gone in six months, and others looking elsewhere. Hiring is slow in the region.",
      intensite: 4,
      sesMots: "If I lose one more technician, I won't meet my deadlines",
      verbatim: "",
    },
  ],
  objections: [
    {
      objection: "We already did an away day, it didn't change a thing",
      reponse: "An away day brings people together for one day. Here, we work on the relationship between the two leaders, close to the shop floor, over several weeks.",
    },
    {
      objection: "Head office will never sign off on another expense",
      reponse: "We can start with a short diagnosis session, with a concrete result to show head office before going any further.",
    },
  ],
  criteresChoix: [
    "Someone who knows the industry and doesn't talk like a consultant",
    "Visible results within a few weeks",
    "On-site work, without stopping production",
  ],
  sInforme: [
    "Newsletters from the regional food industry press",
    "LinkedIn groups for plant managers",
    "Meetings of her region's manufacturers' network",
  ],
  lieux: [
    {
      categorie: "salon",
      type: "Food industry trade shows in western France",
      pourquoi: "Site managers go there to meet suppliers, and have time between appointments.",
      recherche: "food industry trade show Rennes",
    },
    {
      categorie: "club",
      type: "Clubs for industry leaders in the region",
      pourquoi: "People talk frankly there about team problems, among peers.",
      recherche: "industry leaders club Brittany",
    },
    {
      categorie: "evenement",
      type: "Chamber of commerce breakfast talks on management",
      pourquoi: "A short format, early in the morning, that fits around her days.",
      recherche: "management breakfast chamber of commerce Ille-et-Vilaine",
    },
    {
      categorie: "en_ligne",
      type: "LinkedIn groups for plant managers and production managers",
      pourquoi: "She reads them in the evening, and sometimes asks questions there.",
      recherche: "LinkedIn group plant managers",
    },
  ],
};

export const PISTES_EXEMPLE_EN: AutrePiste[] = [
  {
    id: "p1",
    nom: "Partners at odds in professional firms",
    marche: "b2b",
    enUneLigne: "Law or accounting firms where two partners no longer get along",
    raison: "Great territory for your talent, but harder to reach from your current network.",
    depuisIdees: [],
    notes: { urgence: 5, paiement: 4, acces: 2, plaisir: 4 },
  },
  {
    id: "p2",
    nom: "Families taking over the business",
    marche: "b2b",
    enUneLigne: "Family firms in the middle of a handover, where parents and children clash",
    raison: "The need is strong, but the decision to buy often takes months.",
    depuisIdees: [],
    notes: { urgence: 4, paiement: 4, acces: 3, plaisir: 4 },
  },
  {
    id: "p3",
    nom: "School leadership teams in crisis",
    marche: "b2b",
    enUneLigne: "Schools where the teaching staff is divided after a change of head",
    raison: "Your talent would be valuable there, but budgets are very tight.",
    depuisIdees: [],
    notes: { urgence: 4, paiement: 2, acces: 3, plaisir: 3 },
  },
];

const base = RESULTAT_EXEMPLE_EN.cibles[1];
/** Idée p2 explorée : une cible complète, identifiant c4. */
export const CIBLE_PISTE_EXEMPLE_EN: Cible = {
  ...structuredClone(base),
  id: "c4",
  nom: "Families taking over the business",
  portrait:
    "Leaders of family firms with 20 to 80 staff, in the middle of a handover. The founding parent is still around, the child taking over wants to modernise, and the team no longer knows who's in charge.",
  promesse: "I get parents and children back around the table so the handover happens without breaking the business.",
  scores: {
    urgence: { note: 5, raison: "The handover has a date: every month of conflict costs clients and staff." },
    paiement: { note: 4, raison: "The business pays, and hundreds of thousands of euros are at stake." },
    acces: { note: 3, raison: "Reachable through the accountants and notaries who handle the sale." },
    plaisir: { note: 5, raison: "A family under strain that needs to start talking again: your Trigger Context in its purest form." },
  },
  depuisIdees: [],
  verbatims: [],
};
