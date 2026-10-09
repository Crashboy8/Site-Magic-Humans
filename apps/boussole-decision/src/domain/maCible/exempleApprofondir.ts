// Exemples d'approfondissement (portrait, pistes) : tests, captures et démonstrations. Aucun nom réel.
import { RESULTAT_EXEMPLE } from "./exemple";
import type { AutrePiste, Cible, Portrait } from "./types";

export const PORTRAIT_EXEMPLE: Portrait = {
  prenom: "Claire",
  age: "45 à 55 ans",
  situation:
    "Directrice d'un site agroalimentaire de 180 personnes près de Rennes. Elle a hérité de deux chefs d'équipe qui ne se parlent plus depuis la dernière réorganisation, et la production commence à en pâtir.",
  journee:
    "Arrivée à 7 h pour le point sécurité, réunion de production à 9 h où personne ne se regarde, appels avec le siège l'après-midi, et le soir elle relit les mails de plaintes qu'elle n'a pas eu le temps de traiter.",
  declencheur:
    "Le jour où un de ses meilleurs techniciens lui annonce qu'il part chez un concurrent, parce que l'ambiance est devenue irrespirable.",
  pourToi:
    "Une équipe sous tension qui a besoin de se reparler : c'est exactement ton terrain. Attention au siège, très hiérarchique, qui voudra tout valider trois fois.",
  dejaEssaye: [
    "Un séminaire de cohésion avec une activité de plein air, oublié au bout de deux semaines",
    "Des entretiens individuels avec chaque chef d'équipe, sans effet sur leur relation",
    "Une formation à la communication proposée par le siège, jugée trop théorique",
  ],
  douleurs: [
    {
      titre: "Deux clans dans l'équipe",
      detail: "Les deux chefs d'équipe ont chacun leurs fidèles. Les informations ne circulent plus entre les postes.",
      intensite: 5,
      sesMots: "J'ai l'impression de diriger deux usines qui se tournent le dos",
      verbatim: "",
    },
    {
      titre: "Des décisions qui traînent",
      detail: "Chaque changement de planning devient une négociation. Elle tranche seule, et on le lui reproche.",
      intensite: 4,
      sesMots: "Je passe mes journées à arbitrer des disputes au lieu de faire tourner le site",
      verbatim: "",
    },
    {
      titre: "La peur de perdre les meilleurs",
      detail: "Deux départs en six mois, et d'autres qui regardent ailleurs. Le recrutement est lent dans la région.",
      intensite: 4,
      sesMots: "Si je perds encore un technicien, je ne tiens plus les délais",
      verbatim: "",
    },
  ],
  objections: [
    {
      objection: "On a déjà fait un séminaire, ça n'a rien changé",
      reponse: "Un séminaire rapproche le temps d'une journée. Ici, on travaille sur la relation entre les deux chefs, au plus près du terrain, sur plusieurs semaines.",
    },
    {
      objection: "Le siège ne validera jamais une dépense de plus",
      reponse: "On peut commencer par une séance de diagnostic courte, avec un résultat concret à montrer au siège avant d'aller plus loin.",
    },
  ],
  criteresChoix: [
    "Quelqu'un qui connaît l'industrie et ne parle pas comme un consultant",
    "Des résultats visibles en quelques semaines",
    "Une intervention sur site, sans arrêter la production",
  ],
  sInforme: [
    "Les newsletters de la presse agroalimentaire régionale",
    "Les groupes LinkedIn de directeurs d'usine",
    "Les rencontres du réseau des industriels de sa région",
  ],
  lieux: [
    {
      categorie: "salon",
      type: "Salons professionnels de l'agroalimentaire dans l'Ouest",
      pourquoi: "Les directeurs de site y vont pour les fournisseurs, et ont du temps entre deux rendez-vous.",
      recherche: "salon agroalimentaire Rennes",
    },
    {
      categorie: "club",
      type: "Clubs de dirigeants industriels de la région",
      pourquoi: "On y parle franchement des difficultés d'équipe, entre pairs.",
      recherche: "club dirigeants industrie Bretagne",
    },
    {
      categorie: "evenement",
      type: "Matinales de la chambre de commerce sur le management",
      pourquoi: "Format court, tôt le matin, compatible avec ses journées.",
      recherche: "matinale management CCI Ille-et-Vilaine",
    },
    {
      categorie: "en_ligne",
      type: "Groupes LinkedIn de directeurs d'usine et de responsables de production",
      pourquoi: "Elle les lit le soir, et y pose parfois des questions.",
      recherche: "groupe LinkedIn directeurs d'usine",
    },
  ],
};

export const PISTES_EXEMPLE: AutrePiste[] = [
  {
    id: "p1",
    nom: "Associés de cabinets en désaccord",
    marche: "b2b",
    enUneLigne: "Cabinets d'avocats ou d'experts-comptables où deux associés ne s'entendent plus",
    raison: "Très bon terrain pour ton talent, mais plus difficile d'accès depuis ton réseau actuel.",
    depuisIdees: [],
    notes: { urgence: 5, paiement: 4, acces: 2, plaisir: 4 },
  },
  {
    id: "p2",
    nom: "Familles qui reprennent l'entreprise",
    marche: "b2b",
    enUneLigne: "PME familiales en pleine transmission, où parents et enfants se heurtent",
    raison: "Le besoin est fort, mais la décision d'acheter prend souvent des mois.",
    depuisIdees: [],
    notes: { urgence: 4, paiement: 4, acces: 3, plaisir: 4 },
  },
  {
    id: "p3",
    nom: "Directions d'écoles en crise",
    marche: "b2b",
    enUneLigne: "Établissements où l'équipe pédagogique est divisée après un changement de direction",
    raison: "Ton talent y serait précieux, mais les budgets sont très serrés.",
    depuisIdees: [],
    notes: { urgence: 4, paiement: 2, acces: 3, plaisir: 3 },
  },
];

const base = RESULTAT_EXEMPLE.cibles[1];
/** Piste p2 creusée : une cible complète, identifiant c4. */
export const CIBLE_PISTE_EXEMPLE: Cible = {
  ...structuredClone(base),
  id: "c4",
  nom: "Familles qui reprennent l'entreprise",
  portrait:
    "Dirigeants de PME familiales de 20 à 80 salariés, en pleine transmission. Le parent fondateur reste présent, l'enfant repreneur veut moderniser, et l'équipe ne sait plus qui décide.",
  promesse: "Je remets parents et enfants autour de la table pour que la transmission se passe sans casser l'entreprise.",
  scores: {
    urgence: { note: 5, raison: "La transmission a une date : chaque mois de conflit coûte des clients et des salariés." },
    paiement: { note: 4, raison: "L'entreprise paie, et l'enjeu se chiffre en centaines de milliers d'euros." },
    acces: { note: 3, raison: "Accessibles par les experts-comptables et les notaires qui accompagnent la cession." },
    plaisir: { note: 5, raison: "Une famille sous tension qui doit se reparler : ton Contexte Déclencheur à l'état pur." },
  },
  depuisIdees: [],
  verbatims: [],
};
