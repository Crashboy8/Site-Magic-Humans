// « Où j'en suis ? » : le moteur. Applique regle_position de parcours.json, sans rien lire ni écrire ailleurs.
// Même moteur pour la page publique et pour Mon espace.
import type { Profil } from "./profil";
import type { ActionType, Branche, ChoixVoie, Critere, EffetNiveau, Etape, Lien, Mutualisable, Niveau, Offre, ParcoursPublic, PointAttention, Reponse, Voie } from "./types";

/** Étape où commence un ancien accompagné (fiche Talent Unique déjà faite) : les étapes d'avant sont franchies d'office. */
export const ETAPE_RACCOURCI = "cap";
/** Critères d'argent nommés par regle_position.module_argent (E3, E5, S1, S5). */
export const CRITERES_ARGENT = ["e_offre.prix", "e_offre.gagner", "e_vendre.rdv", "s_cible.salaire", "s_strategie.negociation"] as const;
/** Étapes où le module Argent passe en priorité (E4, E5, S4, S5). */
export const ETAPES_ARGENT_PRIORITAIRES = ["e_reseau", "e_vendre", "s_supports", "s_strategie"] as const;
/** Voie E : étapes dont les questions sont posées ensemble, sur un seul écran (E2 avec S2, E4 avec S3). */
export const PAIRES_QUESTIONS: readonly (readonly [string, string])[] = [
  ["e_terrain", "s_terrain"],
  ["e_reseau", "s_reseau"],
];
/** L'action du module Argent qui propose la séance avec Pierre (en séance, pas d'outil). */
export const ACTION_SEANCE_ARGENT = "argent.a3";
/** Offres communes à toutes les voies : l'offre de la voie est la suivante dans voies[].offres. */
const OFFRES_COMMUNES = new Set(["appel_decouverte", "diagnostic"]);
const AUCUNE: ReadonlySet<string> = new Set();

// Bilan d'une étape ---------------------------------------------------------------------------

export interface BilanEtape {
  id: string;
  repondues: number;
  total: number;
  /** Tous les critères ont une réponse. */
  complete: boolean;
  points: number;
  max: number;
  /** Points à atteindre pour le seuil (75 % du maximum, arrondi au point supérieur). */
  requis: number;
  essentiels: number;
  essentielsOui: number;
  /** Tous les essentiels à Oui et au moins 75 % des points. */
  atteinte: boolean;
}

export function bilanEtape(data: ParcoursPublic, etape: Etape, reponses: Profil["reponses"]): BilanEtape {
  let repondues = 0;
  let points = 0;
  let essentiels = 0;
  let essentielsOui = 0;
  for (const c of etape.criteres) {
    if (c.essentiel) essentiels += 1;
    const r = reponses[c.id];
    if (!r) continue;
    repondues += 1;
    points += data.points[r];
    if (c.essentiel && r === "oui") essentielsOui += 1;
  }
  const total = etape.criteres.length;
  const max = total * data.points.oui;
  const complete = repondues === total;
  return {
    id: etape.id,
    repondues,
    total,
    complete,
    points,
    max,
    requis: Math.ceil((max * data.seuil) / 100),
    essentiels,
    essentielsOui,
    // En nombres entiers : points / max ≥ seuil %.
    atteinte: complete && essentielsOui === essentiels && points * 100 >= max * data.seuil,
  };
}

// Pistes et position --------------------------------------------------------------------------

export type StatutEtape = "franchie" | "actuelle" | "a_venir";

export interface EtatEtape {
  id: string;
  statut: StatutEtape;
  /** Franchie d'office grâce au raccourci « ancien accompagné ». */
  auto: boolean;
  /** null quand les questions de l'étape ne sont pas posées (étape à venir ou franchie d'office). */
  bilan: BilanEtape | null;
}

export interface Piste {
  etapes: EtatEtape[];
  /** La première étape non atteinte, ou null si toutes sont franchies. */
  actuelle: string | null;
}

/** On suit la liste dans l'ordre et on s'arrête à la première étape non atteinte : les suivantes ne sont pas posées. */
function parcourir(data: ParcoursPublic, ids: readonly string[], reponses: Profil["reponses"], auto: ReadonlySet<string> = AUCUNE): Piste {
  const etapes: EtatEtape[] = [];
  let actuelle: string | null = null;
  for (const id of ids) {
    if (actuelle !== null) {
      etapes.push({ id, statut: "a_venir", auto: false, bilan: null });
    } else if (auto.has(id)) {
      etapes.push({ id, statut: "franchie", auto: true, bilan: null });
    } else {
      const bilan = bilanEtape(data, data.etapes[id], reponses);
      if (!bilan.atteinte) actuelle = id;
      etapes.push({ id, statut: bilan.atteinte ? "franchie" : "actuelle", auto: false, bilan });
    }
  }
  return { etapes, actuelle };
}

function verrouillee(ids: readonly string[]): Piste {
  return { etapes: ids.map((id) => ({ id, statut: "a_venir", auto: false, bilan: null })), actuelle: null };
}

export interface Position {
  voie: ChoixVoie;
  /** voie_a_choisir : « Je ne sais pas encore » et le tronc commun est franchi, on repose la question de voie. */
  etat: "en_cours" | "voie_a_choisir" | "termine";
  /** La voie, ou le tronc commun pour la voie E et pour « Je ne sais pas encore ». */
  principale: Piste;
  /** Voie E : les deux branches menées en même temps, puis Ton Ikigai. */
  hybride: { entrepreneur: Piste; salarie: Piste; fin: Piste } | null;
  /** Connaissance de soi en parallèle d'une voie pro : une 2e position, calculée à part. */
  parallele: Piste | null;
  /** Étape(s) à travailler maintenant : une, ou deux en voie E. */
  actuelles: string[];
}

/** Étapes franchies d'office par le raccourci : celles du tronc commun avant « cap ». */
export function etapesRaccourci(data: ParcoursPublic, profil: Profil): ReadonlySet<string> {
  if (!profil.raccourci) return AUCUNE;
  const fin = data.tronc.indexOf(ETAPE_RACCOURCI);
  return new Set(fin > 0 ? data.tronc.slice(0, fin) : []);
}

/** Le raccourci ne concerne que les voies qui passent par le tronc commun. */
export function raccourciPossible(data: ParcoursPublic, voie: ChoixVoie | null): boolean {
  if (voie === null) return false;
  const etapes = voie === "inconnue" ? data.tronc : data.voies[voie].etapes;
  return etapes.includes(ETAPE_RACCOURCI);
}

/** Connaissance de soi menée en parallèle : K1 à K4, Ton Ikigai restant l'aboutissement de la voie pro. */
export function etapesSoi(data: ParcoursPublic): string[] {
  return data.voies.K.etapes.filter((id) => data.etapes[id].branche !== "aboutissement");
}

export function calculerPosition(data: ParcoursPublic, profil: Profil): Position | null {
  const { voie, reponses } = profil;
  if (voie === null) return null;
  const auto = etapesRaccourci(data, profil);

  if (voie === "inconnue") {
    // On ne pose que le tronc commun ; une fois « cap » atteinte, on repose la question de voie.
    const principale = parcourir(data, data.tronc, reponses, auto);
    const actuelles = principale.actuelle ? [principale.actuelle] : [];
    return { voie, etat: principale.actuelle ? "en_cours" : "voie_a_choisir", principale, hybride: null, parallele: null, actuelles };
  }

  const v = data.voies[voie];
  const parallele = v.pro && profil.parallele === true ? parcourir(data, etapesSoi(data), reponses) : null;
  const principale = parcourir(data, v.etapes, reponses, auto);

  if (!v.paralleles) {
    const actuelles = principale.actuelle ? [principale.actuelle] : [];
    return { voie, etat: principale.actuelle ? "en_cours" : "termine", principale, hybride: null, parallele, actuelles };
  }

  const { entrepreneur, salarie, fin } = v.paralleles;
  if (principale.actuelle) {
    const hybride = { entrepreneur: verrouillee(entrepreneur), salarie: verrouillee(salarie), fin: verrouillee([fin]) };
    return { voie, etat: "en_cours", principale, hybride, parallele, actuelles: [principale.actuelle] };
  }
  // Après le tronc commun : deux étapes actuelles, une par branche, avec la même règle.
  const e = parcourir(data, entrepreneur, reponses);
  const s = parcourir(data, salarie, reponses);
  const branchesFinies = e.actuelle === null && s.actuelle === null;
  // Quand E6 et S6 sont atteintes, l'étape actuelle devient Ton Ikigai.
  const f = branchesFinies ? parcourir(data, [fin], reponses) : verrouillee([fin]);
  const actuelles = branchesFinies ? (f.actuelle ? [f.actuelle] : []) : [e.actuelle, s.actuelle].filter((x): x is string => x !== null);
  return { voie, etat: actuelles.length > 0 ? "en_cours" : "termine", principale, hybride: { entrepreneur: e, salarie: s, fin: f }, parallele, actuelles };
}

/** Les étapes de la voie, dans l'ordre (tronc, branches, aboutissement), sans la piste parallèle. */
export function etatsPrincipaux(position: Position): EtatEtape[] {
  const h = position.hybride;
  return h ? [...position.principale.etapes, ...h.entrepreneur.etapes, ...h.salarie.etapes, ...h.fin.etapes] : position.principale.etapes;
}

/** Toutes les étapes dont les questions sont posées (piste parallèle comprise), dans l'ordre. */
export function etapesPosees(position: Position): string[] {
  return [...etatsPrincipaux(position), ...(position.parallele?.etapes ?? [])].filter((e) => e.bilan !== null).map((e) => e.id);
}

// Questionnaire : les écrans à poser ---------------------------------------------------------

export interface Ecran {
  /** Identifiant stable de l'écran. */
  cle: string;
  etapes: string[];
  piste: "principale" | "parallele";
  /** Voie E : deux étapes posées ensemble (Le terrain, Le réseau). */
  paire: Mutualisable | null;
}

export interface Questionnaire {
  /** Les écrans dans l'ordre, jusqu'au premier qui attend des réponses (compris). */
  ecrans: Ecran[];
  /** Index du premier écran avec des questions sans réponse, ou null : tout est répondu. */
  enAttente: number | null;
}

type Issue = "fini" | "arret" | "attente";

function paireDeQuestions(voie: Voie, e: string, s: string): Mutualisable | null {
  if (!PAIRES_QUESTIONS.some(([a, b]) => a === e && b === s)) return null;
  return voie.mutualisables.find((m) => m.etapes.includes(e) && m.etapes.includes(s)) ?? null;
}

/** Une étape par écran, dans l'ordre de la voie ; en voie E, les deux branches avancent ensemble. */
export function questionnaire(data: ParcoursPublic, profil: Profil): Questionnaire {
  const ecrans: Ecran[] = [];
  const { voie, reponses } = profil;
  if (voie === null) return { ecrans, enAttente: null };
  const auto = etapesRaccourci(data, profil);

  const poser = (ids: string[], piste: Ecran["piste"], paire: Mutualisable | null = null) => {
    ecrans.push({ cle: ids.join("+"), etapes: ids, piste, paire });
    const bilans = ids.map((id) => bilanEtape(data, data.etapes[id], reponses));
    return { attente: bilans.some((b) => !b.complete), atteintes: bilans.map((b) => b.atteinte) };
  };

  const lineaire = (ids: readonly string[], piste: Ecran["piste"]): Issue => {
    for (const id of ids) {
      if (auto.has(id)) continue;
      const r = poser([id], piste);
      if (r.attente) return "attente";
      if (!r.atteintes[0]) return "arret";
    }
    return "fini";
  };

  const hybride = (v: Voie, branches: NonNullable<Voie["paralleles"]>): Issue => {
    const E = branches.entrepreneur;
    const S = branches.salarie;
    let iE = 0;
    let iS = 0;
    let actifE = true;
    let actifS = true;
    while ((actifE && iE < E.length) || (actifS && iS < S.length)) {
      const e = actifE && iE < E.length ? E[iE] : null;
      const s = actifS && iS < S.length ? S[iS] : null;
      const paire = e !== null && s !== null ? paireDeQuestions(v, e, s) : null;
      if (e !== null && s !== null && paire) {
        const r = poser([e, s], "principale", paire);
        if (r.attente) return "attente";
        if (r.atteintes[0]) iE += 1;
        else actifE = false;
        if (r.atteintes[1]) iS += 1;
        else actifS = false;
        continue;
      }
      // La branche la moins avancée passe d'abord (à égalité, Entrepreneur) : les paires tombent ainsi sur le même écran.
      const prendreE = e !== null && (s === null || iE <= iS);
      const r = poser([prendreE ? (e as string) : (s as string)], "principale");
      if (r.attente) return "attente";
      if (prendreE) {
        if (r.atteintes[0]) iE += 1;
        else actifE = false;
      } else if (r.atteintes[0]) iS += 1;
      else actifS = false;
    }
    if (iE < E.length || iS < S.length) return "arret";
    return lineaire([branches.fin], "principale");
  };

  const finir = (issue: Issue): Questionnaire => ({ ecrans, enAttente: issue === "attente" ? ecrans.length - 1 : null });

  if (voie === "inconnue") return finir(lineaire(data.tronc, "principale"));
  const v = data.voies[voie];
  let issue = lineaire(v.etapes, "principale");
  if (issue === "attente") return finir(issue);
  if (v.paralleles && issue === "fini") {
    issue = hybride(v, v.paralleles);
    if (issue === "attente") return finir(issue);
  }
  if (v.pro && profil.parallele === true) return finir(lineaire(etapesSoi(data), "parallele"));
  return finir(issue);
}

export interface Question {
  cle: string;
  texte: string;
  /** Les critères qui reçoivent la réponse : deux quand la même question sert aux deux branches (voie E). */
  criteres: { id: string; etape: string }[];
}

/** Les questions d'un écran, dans l'ordre. Sur un écran de deux étapes, une question identique n'est posée qu'une fois. */
export function questionsEcran(data: ParcoursPublic, ecran: Ecran): Question[] {
  const parTexte = new Map<string, Question>();
  const questions: Question[] = [];
  for (const etape of ecran.etapes) {
    for (const c of data.etapes[etape].criteres) {
      const deja = parTexte.get(c.question);
      if (deja) {
        deja.criteres.push({ id: c.id, etape });
        continue;
      }
      const q: Question = { cle: c.id, texte: c.question, criteres: [{ id: c.id, etape }] };
      parTexte.set(c.question, q);
      questions.push(q);
    }
  }
  return questions;
}

// Niveau Réussir dans le Plaisir ---------------------------------------------------------------

export type EtatNiveau = "atteint" | "actuel" | "depart" | "vise" | "a_venir";

export interface InfoNiveau {
  /** Niveau « atteint » de la dernière étape franchie, ou null : point de départ (niveau 0 ou 1). */
  actuel: Niveau | null;
  /** Les deux niveaux du point de départ. */
  depart: Niveau[];
  /** Ce que prépare chaque étape actuelle. */
  prepares: { etape: string; effet: EffetNiveau; niveau: Niveau | null; note: string }[];
  echelle: { niveau: Niveau; etat: EtatNiveau }[];
}

/** 5A et 5B sont deux variantes du niveau 5 : atteindre l'une ne vaut pas l'autre. */
const famille = (code: string) => code.replace(/[A-Z]$/, "");

export function niveauAffiche(data: ParcoursPublic, position: Position): InfoNiveau {
  const rang = (code: string) => data.niveaux.findIndex((n) => n.code === code);
  const parCode = (code: string | undefined) => data.niveaux.find((n) => n.code === code) ?? null;

  let actuel: Niveau | null = null;
  for (const e of etatsPrincipaux(position)) {
    if (e.statut !== "franchie") continue;
    const n = data.etapes[e.id].niveau;
    if (n.effet !== "atteint") continue;
    const candidat = parCode(n.codes[0]);
    if (candidat && (!actuel || rang(candidat.code) > rang(actuel.code))) actuel = candidat;
  }
  const depart = data.niveaux.slice(0, 2);
  const prepares = position.actuelles.map((id) => {
    const n = data.etapes[id].niveau;
    return { etape: id, effet: n.effet, niveau: parCode(n.codes[0]), note: n.note };
  });
  const vises = new Set(prepares.filter((p) => p.effet === "vers" || p.effet === "atteint").map((p) => p.niveau?.code));
  const echelle = data.niveaux.map((niveau) => {
    let etat: EtatNiveau = "a_venir";
    if (actuel && niveau.code === actuel.code) etat = "actuel";
    else if (actuel && rang(niveau.code) < rang(actuel.code) && famille(niveau.code) !== famille(actuel.code)) etat = "atteint";
    else if (vises.has(niveau.code)) etat = "vise";
    else if (!actuel && depart.includes(niveau)) etat = "depart";
    return { niveau, etat };
  });
  return { actuel, depart, prepares, echelle };
}

// Module Argent et valeurs ---------------------------------------------------------------------

export interface InfoArgent {
  propose: boolean;
  prioritaire: boolean;
  /** L'autodiagnostic, de 1 à 5. */
  note: number | null;
  /** Critères d'argent posés et encore à « Pas encore ». */
  criteres: Critere[];
}

const etapeDuCritere = (id: string) => id.slice(0, id.indexOf("."));

function critere(data: ParcoursPublic, id: string): Critere | null {
  return data.etapes[etapeDuCritere(id)]?.criteres.find((c) => c.id === id) ?? null;
}

/** Proposé si l'autodiagnostic vaut 3 ou moins, ou si un critère d'argent est à Pas encore ; prioritaire en E4, E5, S4, S5. */
export function moduleArgent(data: ParcoursPublic, profil: Profil, position: Position): InfoArgent | null {
  if (profil.voie === null || profil.voie === "inconnue" || !data.voies[profil.voie].argent) return null;
  const posees = new Set(etapesPosees(position));
  const criteres = CRITERES_ARGENT.filter((id) => posees.has(etapeDuCritere(id)) && profil.reponses[id] === "pas_encore")
    .map((id) => critere(data, id))
    .filter((c): c is Critere => c !== null);
  const note = profil.argent;
  const propose = (note !== null && note <= data.argent.seuil) || criteres.length > 0;
  const prioritaire = propose && position.actuelles.some((id) => (ETAPES_ARGENT_PRIORITAIRES as readonly string[]).includes(id));
  return { propose, prioritaire, note, criteres };
}

export interface InfoValeurs {
  criteres: { critere: Critere; etape: string; reponse: Reponse }[];
  /** La Boussole de décision, ou la Boussole Relation quand tout se joue côté Connaissance de soi. */
  outil: Lien | null;
}

/** Un critère valeurs à Pas encore ou En partie : on le met en avant et on propose la Boussole. */
export function pointsValeurs(data: ParcoursPublic, profil: Profil, position: Position): InfoValeurs | null {
  const criteres = etapesPosees(position).flatMap((etape) => {
    const e = data.etapes[etape];
    if (!e.valeurs) return [];
    return e.criteres.flatMap((c) => {
      const reponse = profil.reponses[c.id];
      return c.id.endsWith(".valeurs") && (reponse === "pas_encore" || reponse === "en_partie") ? [{ critere: c, etape, reponse }] : [];
    });
  });
  if (criteres.length === 0) return null;
  const toutSoi = criteres.every((c) => data.etapes[c.etape].branche === "soi");
  return { criteres, outil: data.outils[toutSoi ? "boussole_relation" : "boussole"] ?? null };
}

// Les 3 prochaines actions -------------------------------------------------------------------

export interface ActionProposee {
  action: ActionType;
  /** L'étape de l'action, ou « argent » pour la séance du module. */
  etape: string;
  branche: Branche;
  /** Voie E : l'action sert aux deux branches. */
  commune: boolean;
  /** L'action débloque un critère essentiel encore à « Pas encore ». */
  cle: boolean;
}

/** 0 : débloque un essentiel à Pas encore ; 1 : un essentiel pas encore à Oui ; 2 : un autre critère ; 3 : le reste. */
function rangAction(etape: Etape, action: ActionType, reponses: Profil["reponses"]): number {
  const visees = action.debloque.map((id) => etape.criteres.find((c) => c.id === id)).filter((c): c is Critere => c !== undefined);
  if (visees.some((c) => c.essentiel && reponses[c.id] === "pas_encore")) return 0;
  if (visees.some((c) => c.essentiel && reponses[c.id] !== "oui")) return 1;
  if (visees.some((c) => reponses[c.id] !== "oui")) return 2;
  return 3;
}

function actionsClassees(data: ParcoursPublic, id: string, reponses: Profil["reponses"], commune: boolean): ActionProposee[] {
  const etape = data.etapes[id];
  return etape.actions
    .map((action, i) => ({ action, i, rang: rangAction(etape, action, reponses) }))
    .sort((a, b) => a.rang - b.rang || a.i - b.i)
    .map(({ action, rang }) => ({ action, etape: id, branche: etape.branche, commune, cle: rang === 0 }));
}

/**
 * Les actions types de l'étape actuelle, d'abord celles qui débloquent un critère essentiel à Pas encore.
 * Voie E : les actions qui servent aux deux branches d'abord, puis on alterne les deux branches.
 * Module Argent prioritaire : la séance avec Pierre passe en premier.
 */
export function prochainesActions(data: ParcoursPublic, profil: Profil, position: Position, argent: InfoArgent | null, n = 3): ActionProposee[] {
  const { actuelles } = position;
  const seance = argent?.prioritaire ? data.argent.actions.find((a) => a.id === ACTION_SEANCE_ARGENT) : undefined;
  const enTete: ActionProposee[] = seance ? [{ action: seance, etape: "argent", branche: "module", commune: false, cle: false }] : [];

  if (actuelles.length === 0) {
    // Tout est franchi : les actions de Ton Ikigai gardent le réglage.
    const etats = etatsPrincipaux(position);
    const fin = position.etat === "termine" ? etats[etats.length - 1]?.id : undefined;
    return fin ? actionsClassees(data, fin, profil.reponses, false).slice(0, n) : [];
  }
  if (actuelles.length === 1) return [...enTete, ...actionsClassees(data, actuelles[0], profil.reponses, false)].slice(0, n);

  const v = profil.voie && profil.voie !== "inconnue" ? data.voies[profil.voie] : null;
  const paires = (v?.mutualisables ?? []).filter((m) => m.etapes.length > 1);
  const estCommune = (id: string) => paires.some((m) => m.etapes.includes(id));
  const [a, b] = actuelles.map((id) => actionsClassees(data, id, profil.reponses, estCommune(id)));
  // Celle qui sert aux deux d'abord (à égalité, la branche Entrepreneur), puis on alterne.
  const [x, y] = !a[0]?.commune && b[0]?.commune ? [b, a] : [a, b];
  const melange: ActionProposee[] = [];
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) {
    if (x[i]) melange.push(x[i]);
    if (y[i]) melange.push(y[i]);
  }
  return [...enTete, ...melange].slice(0, n);
}

// Résultat complet ---------------------------------------------------------------------------

export interface Quete {
  etape: Etape;
  bilan: BilanEtape;
  objectifs: { critere: Critere; reponse: Reponse | null }[];
  /** Ce qui manque pour franchir l'étape. */
  manque: { points: number; essentiels: Critere[] };
}

export interface Resultat {
  position: Position;
  voie: Voie | null;
  points: { gagnes: number; max: number };
  franchies: { nombre: number; total: number };
  /** Étapes avant Ton Ikigai (l'aboutissement de toutes les voies). */
  restantes: { total: number; entrepreneur: number | null; salarie: number | null };
  quetes: Quete[];
  queteParallele: Quete | null;
  /** Les deux premières actions de l'étape actuelle de la piste parallèle. */
  actionsParallele: ActionProposee[];
  niveau: InfoNiveau;
  argent: InfoArgent | null;
  valeurs: InfoValeurs | null;
  actions: ActionProposee[];
  /** Voie E : ce qui se fait une seule fois pour les deux branches. */
  communes: Mutualisable[];
  attention: PointAttention[];
  offres: { appel: Offre; voie: Offre | null };
}

function quete(data: ParcoursPublic, id: string, profil: Profil): Quete {
  const etape = data.etapes[id];
  const bilan = bilanEtape(data, etape, profil.reponses);
  return {
    etape,
    bilan,
    objectifs: etape.criteres.map((c) => ({ critere: c, reponse: profil.reponses[c.id] ?? null })),
    manque: {
      points: Math.max(0, bilan.requis - bilan.points),
      essentiels: etape.criteres.filter((c) => c.essentiel && profil.reponses[c.id] !== "oui"),
    },
  };
}

/** L'Appel Découverte, et l'offre propre à la voie s'il y en a une (rien pour une voie sans offre définie). */
export function offresDeLaVoie(data: ParcoursPublic, voie: ChoixVoie | null): { appel: Offre; voie: Offre | null } {
  const appel = data.offres.appel_decouverte;
  if (voie === null || voie === "inconnue") return { appel, voie: null };
  const id = data.voies[voie].offres.find((o) => !OFFRES_COMMUNES.has(o) && data.offres[o]);
  return { appel, voie: id ? data.offres[id] : null };
}

const restantesDe = (data: ParcoursPublic, etats: EtatEtape[]) =>
  etats.filter((e) => e.statut !== "franchie" && data.etapes[e.id].branche !== "aboutissement").length;

export function pointsGagnes(position: Position): number {
  return [...etatsPrincipaux(position), ...(position.parallele?.etapes ?? [])].reduce((total, e) => total + (e.bilan?.points ?? 0), 0);
}

export function construireResultat(data: ParcoursPublic, profil: Profil): Resultat | null {
  const position = calculerPosition(data, profil);
  if (!position) return null;
  const voie = position.voie === "inconnue" ? null : data.voies[position.voie];
  const principaux = etatsPrincipaux(position);
  const tousLesEtats = [...principaux, ...(position.parallele?.etapes ?? [])];
  const h = position.hybride;
  const argent = moduleArgent(data, profil, position);
  const paires = (voie?.mutualisables ?? []).filter((m) => (m.etapes.length > 1 ? position.actuelles.length > 1 && m.etapes.some((id) => position.actuelles.includes(id)) : argent?.propose));
  return {
    position,
    voie,
    points: {
      gagnes: pointsGagnes(position),
      max: tousLesEtats.filter((e) => !e.auto).reduce((t, e) => t + data.etapes[e.id].criteres.length * data.points.oui, 0),
    },
    franchies: { nombre: principaux.filter((e) => e.statut === "franchie").length, total: principaux.length },
    restantes: {
      total: restantesDe(data, principaux),
      entrepreneur: h ? restantesDe(data, h.entrepreneur.etapes) : null,
      salarie: h ? restantesDe(data, h.salarie.etapes) : null,
    },
    quetes: position.actuelles.map((id) => quete(data, id, profil)),
    queteParallele: position.parallele?.actuelle ? quete(data, position.parallele.actuelle, profil) : null,
    actionsParallele: position.parallele?.actuelle ? actionsClassees(data, position.parallele.actuelle, profil.reponses, false).slice(0, 2) : [],
    niveau: niveauAffiche(data, position),
    argent,
    valeurs: pointsValeurs(data, profil, position),
    actions: prochainesActions(data, profil, position, argent),
    communes: paires,
    attention: voie?.pointsAttention ?? [],
    offres: offresDeLaVoie(data, position.voie),
  };
}
