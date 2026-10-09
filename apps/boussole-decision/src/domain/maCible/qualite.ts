// Contrôles déterministes après la validation de structure. Réparations légères, ou erreurs qui relancent le modèle.
import { couperTexte } from "./validation";
import type { LigneClassement } from "./scores";
import type { Adresse, Cadrage, Cible, Format, IdCible, Marche, Portrait, Resultat } from "./types";

export interface ContexteQualite {
  antiContexte: string;
  reseau: string;
  idee: string;
  marche: Marche | "";
  prixActuel: string;
  adresse: Adresse;
  formats: readonly Format[];
  talent: string;
}

const STOP = new Set(
  "dans avec pour cette comme etre avoir faire plus tout toute tous tres quand alors aussi leur leurs sans sous entre apres avant depuis encore meme chez vers dont quoi quel quelle quelles quels vous votre notre nous elles elle lui trop bien peut sont etait aux des les une qui que pas par sur donc car dont fois doit celles ceux celui celle".split(
    " ",
  ),
);

function sansAccent(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function motsCles(texte: string): string[] {
  const vus = new Set<string>();
  for (const mot of sansAccent(texte).split(/[^a-z0-9]+/)) {
    if (mot.length >= 5 && !STOP.has(mot)) vus.add(mot);
  }
  return [...vus];
}

/** Au moins deux mots, ou un mot d'au moins 10 lettres, présents dans le texte. */
export function recoupe(source: string, texte: string): boolean {
  const mots = motsCles(source);
  if (mots.length === 0) return false;
  const hay = sansAccent(texte);
  const hits = mots.filter((m) => hay.includes(m));
  return hits.length >= 2 || hits.some((m) => m.length >= 10);
}

const VALEUR = /valeur|cout|coûte|coute|budget|marche|marché|probleme|problème|rapport|perte|econom|économ/i;
const PLUSIEURS = /\b(\d{1,2}|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s+(séances|seances|sessions|ateliers|modules|rendez-vous)\b/i;
const UNE_FOIS = /\ben une (séance|seance|session|heure)\b/gi;
const MOM = [
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
];
const QUESTIONS_VOUS = [
  "La dernière fois que ce sujet s'est présenté, qu'avez-vous fait ?",
  "Quand cela vous est arrivé récemment, comment l'avez-vous géré ?",
  "Qu'avez-vous déjà essayé, concrètement, la dernière fois ?",
  "Combien cela vous a-t-il coûté la dernière fois ?",
  "À qui en avez-vous parlé, et qu'est-ce qui a suivi ?",
];
const QUESTIONS_TU = [
  "La dernière fois que ce sujet s'est présenté, qu'as-tu fait ?",
  "Quand cela t'est arrivé récemment, comment l'as-tu géré ?",
  "Qu'as-tu déjà essayé, concrètement, la dernière fois ?",
  "Combien cela t'a-t-il coûté la dernière fois ?",
  "À qui en as-tu parlé, et qu'est-ce qui a suivi ?",
];
const JETON_PRENOM = /\{\{\s*pr[eé]nom\s*\}\}|\{(?!\{)\s*pr[eé]nom\s*\}/gi;
const TUTOIEMENT = /\b(tu|ton|ta|tes|toi)\b/i;
const VOUVOIEMENT = /\b(vous|votre|vos)\b/i;

function nombres(s: string): number[] {
  return [...s.matchAll(/\d[\d\s]{0,6}\d|\d+/g)]
    .map((m) => Number(m[0].replace(/\s/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function blobCible(c: Cible): string {
  return [c.nom, c.portrait, c.douleur, c.promesse, c.pourquoi, c.offre.format, c.offre.nom, c.exemple].join("\n");
}

function retirerJeton(s: string): string {
  return s.replace(JETON_PRENOM, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}

function normaliserJeton(s: string): string {
  return s.replace(JETON_PRENOM, "{{prenom}}");
}

function signatureDe(adresse: Adresse): string {
  return adresse === "tu" ? "À bientôt,\n\n{{prenom}}" : "Bien à vous,\n\n{{prenom}}";
}

function alignerSignature(corps: string, adresse: Adresse): string {
  const signature = signatureDe(adresse);
  const sans = normaliserJeton(corps).replace(/\n*(Bien à vous,|À bientôt,|A bientôt,|Belle journée,|Cordialement,|Merci,)\s*\n+\{\{prenom\}\}\s*$/i, "").trimEnd();
  const suivant = `${sans}\n\n${signature}`;
  return suivant.length <= 1100 ? suivant : corps;
}

function registreAttendu(adresse: Adresse): "tu" | "vous" {
  return adresse === "tu" ? "tu" : "vous";
}

function mauvaisRegistre(texte: string, attendu: "tu" | "vous"): boolean {
  // Sans accents : « êtes » ne doit pas être lu comme « tes ».
  const n = sansAccent(texte);
  if (attendu === "vous") return TUTOIEMENT.test(n);
  return VOUVOIEMENT.test(n);
}

function formatMultiple(c: Cible): boolean {
  return PLUSIEURS.test(`${c.offre.format}\n${c.offre.duree}\n${c.offre.contenu.join("\n")}`);
}

function echoPrix(prixActuel: string, min: number, max: number): boolean {
  const nums = nombres(prixActuel);
  if (!nums.length) return false;
  return min === Math.min(...nums) && max === Math.max(...nums);
}

function ajouterHypothese(liste: string[], phrase: string, reparations: { n: number }) {
  const courte = couperTexte(phrase, 200);
  if (liste.some((h) => sansAccent(h).includes(sansAccent(courte).slice(0, 24)))) return;
  if (liste.length < 4) liste.push(courte);
  else liste[liste.length - 1] = courte;
  reparations.n += 1;
}

/** Retire les jetons {{prenom}} égarés partout, sauf dans le corps de l'email. */
function retirerJetons<T>(racine: T, reparations: { n: number }): T {
  const marcher = (valeur: unknown, cle?: string): unknown => {
    if (typeof valeur === "string") {
      if (cle === "emailCorps") return valeur;
      const suivant = retirerJeton(valeur);
      if (suivant !== valeur) reparations.n += 1;
      return suivant;
    }
    if (Array.isArray(valeur)) return valeur.map((item) => marcher(item));
    if (typeof valeur === "object" && valeur !== null) {
      for (const [k, v] of Object.entries(valeur)) (valeur as Record<string, unknown>)[k] = marcher(v, k);
    }
    return valeur;
  };
  return marcher(racine) as T;
}

/** Contrôles « par cible » (§7.5) : signature, Anti-Contexte, accès, format, prix, registre, questions. */
function controlerCible(c: Cible, original: Cible, ctx: ContexteQualite, p: string, reparations: { n: number }, erreurs: string[]) {
  const attendu = registreAttendu(ctx.adresse);
  const questionsModele = attendu === "tu" ? QUESTIONS_TU : QUESTIONS_VOUS;
  const aligne = alignerSignature(original.messages.emailCorps, ctx.adresse);
  if (aligne !== original.messages.emailCorps) reparations.n += 1;
  c.messages.emailCorps = aligne;

  if (recoupe(ctx.antiContexte, blobCible(c)) && c.scores.plaisir.note > 2) {
    c.scores.plaisir.note = 2;
    c.scores.plaisir.raison = "Note plafonnée à 2 : cette cible reprend des traits de l'Anti-Contexte.";
    reparations.n += 1;
  }

  const zoneReseau = `${c.nom}\n${c.portrait}\n${c.pourquoi}\n${c.scores.acces.raison}`;
  if (c.scores.acces.note === 5 && ctx.reseau.trim() && !recoupe(ctx.reseau, zoneReseau)) {
    c.scores.acces.note = 4;
    c.scores.acces.raison = "L'accès vaut 4 : cette cible n'est pas décrite dans le réseau proche (expérience, clients passés).";
    reparations.n += 1;
  }

  if (formatMultiple(c)) {
    for (const champ of ["promesse", "pitch"] as const) {
      const suivant = c[champ].replace(UNE_FOIS, "sur la durée du parcours");
      UNE_FOIS.lastIndex = 0;
      if (suivant !== c[champ]) {
        c[champ] = suivant;
        reparations.n += 1;
      }
    }
  }

  if (echoPrix(ctx.prixActuel, c.prix.min, c.prix.max) && !VALEUR.test(c.prix.justification)) {
    erreurs.push(`${p}.prix : le prix recopie le prix actuel. Justifie-le par la valeur du problème pour cette cible, et sa capacité à payer.`);
  }

  const textes = [c.messages.linkedin, c.messages.emailCorps, c.pitch, ...c.testTerrain.questions];
  if (textes.some((t) => mauvaisRegistre(t, attendu))) {
    erreurs.push(
      attendu === "vous"
        ? `${p}.messages : vouvoiement attendu (dirigeant contacté à froid, sauf si la personne a demandé le tutoiement).`
        : `${p}.messages : tutoiement attendu, comme demandé.`,
    );
  }

  c.testTerrain.questions = c.testTerrain.questions.map((q, qi) => {
    if (!MOM.some((re) => re.test(q))) return q;
    reparations.n += 1;
    return questionsModele[qi % questionsModele.length];
  });
}

/** Une cible seule (piste creusée) : mêmes contrôles que chaque cible du résultat. */
export function qualiteCible(cible: Cible, ctx: ContexteQualite): { cible: Cible; reparations: number; erreurs: string[] } {
  const reparations = { n: 0 };
  const erreurs: string[] = [];
  const c = retirerJetons(structuredClone(cible), reparations);
  controlerCible(c, cible, ctx, "cible", reparations, erreurs);
  return { cible: c, reparations: reparations.n, erreurs };
}

export function appliquerQualite(resultat: Resultat, ctx: ContexteQualite): { resultat: Resultat; reparations: number; erreurs: string[] } {
  const reparations = { n: 0 };
  const erreurs: string[] = [];
  const r = retirerJetons(structuredClone(resultat), reparations);
  r.cibles.forEach((c, i) => {
    const original = resultat.cibles.find((x) => x.id === c.id) ?? resultat.cibles[i];
    if (!original) return;
    controlerCible(c, original, ctx, `cibles[${i}]`, reparations, erreurs);
  });

  const comptes = { c1: 0, c2: 0, c3: 0, toutes: 0 };
  for (const semaine of r.plan30) for (const action of semaine.actions) comptes[action.cible] += 1;
  if (comptes.c1 < 2 || comptes.c2 < 2 || comptes.c3 < 2 || comptes.toutes < 1) {
    erreurs.push("plan30 : au moins 2 actions pour chaque cible (c1, c2, c3) et au moins une action commune (toutes).");
  }

  const idee = ctx.idee.trim();
  if (idee.length >= 3) {
    const hay = [...r.cibles.map(blobCible), ...r.hypotheses].join("\n");
    if (!recoupe(idee, hay) && !sansAccent(hay).includes(sansAccent(idee).slice(0, 24))) {
      const extrait = idee.length > 80 ? `${idee.slice(0, 77).trimEnd()}…` : idee;
      ajouterHypothese(r.hypotheses, `Ton idée (« ${extrait} ») n'est pas reprise comme cible : elle reste à vérifier sur le terrain.`, reparations);
    }
  }

  if (ctx.marche === "je_ne_sais_pas") {
    const marches = new Set(r.cibles.map((c) => c.marche));
    const mixte = marches.has("b2b") && marches.has("b2c");
    const raison = /b2b|b2c|marche/.test(sansAccent(r.hypotheses.join(" ")));
    if (!mixte && !raison) {
      ajouterHypothese(r.hypotheses, "Le marché n'était pas tranché : une seule famille de cibles est proposée, à confirmer avec toi.", reparations);
    }
  }

  return { resultat: r, reparations: reparations.n, erreurs };
}

export function phrasesDepartage(cibles: readonly { id: IdCible; nom: string }[], lignes: readonly LigneClassement[]): string[] {
  const nom = (id: IdCible) => cibles.find((c) => c.id === id)?.nom ?? id;
  const motif = (m: LigneClassement["departage"]) =>
    m === "plaisir" ? "le plaisir du talent y est plus haut" : m === "urgence" ? "le problème y est plus urgent" : "à notes égales, l'ordre des identifiants la place devant";
  return lignes.flatMap((l, i) => {
    if (!l.departage || i === 0) return [];
    const devant = lignes[i - 1];
    return [couperTexte(`« ${nom(devant.id)} » et « ${nom(l.id)} » avaient le même score. « ${nom(devant.id)} » passe devant : ${motif(l.departage)}.`, 200)];
  });
}

export function ajouterPhrases(hypotheses: string[], phrases: string[]): { hypotheses: string[]; ajoutees: number } {
  const suite = [...hypotheses];
  let ajoutees = 0;
  for (const phrase of phrases) {
    if (suite.includes(phrase)) continue;
    if (suite.length >= 4) break;
    suite.push(phrase);
    ajoutees += 1;
  }
  return { hypotheses: suite, ajoutees };
}

const TALENT_INDIVIDUEL = /\b(individuel|individuelle|tete-a-tete|tete a tete|face a face|en solo)\b/i;
const TALENT_GROUPE = /\b(en groupe|equipe|collectif)\b/i;

/** Vrai quand le format et le talent se contredisent assez clairement pour exiger une question. */
export function contradictionFormatTalent(ctx: Pick<ContexteQualite, "formats" | "talent">): boolean {
  const groupe = ctx.formats.includes("groupe");
  const individuel = ctx.formats.includes("individuel");
  const talent = sansAccent(ctx.talent);
  if (groupe && !individuel && TALENT_INDIVIDUEL.test(talent)) return true;
  if (individuel && !groupe && TALENT_GROUPE.test(talent)) return true;
  return false;
}

/** Au tour 1, une contradiction doit produire des questions, pas une esquisse. */
export function questionsManquantes(cadrage: Cadrage, tour: 1 | 2 | 3, ctx: Pick<ContexteQualite, "formats" | "talent">): string | null {
  if (tour !== 1 || cadrage.statut !== "esquisse") return null;
  if (!contradictionFormatTalent(ctx)) return null;
  return "questions attendues : le format et le talent se contredisent (groupe contre individuel). Pose une question au lieu d'une esquisse.";
}

const PRENOMS_SECOURS = ["Claire", "Nadia", "Julien", "Sophie", "Karim", "Isabelle", "Thomas", "Élodie"];
const GUILLEMETS = /[«»"“”]/g;
const ANNEE = /\b(19|20)\d{2}\b/g;

function contientMot(texte: string, mot: string): boolean {
  const m = sansAccent(mot.trim());
  if (!m) return false;
  const echappe = m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${echappe}([^a-z0-9]|$)`).test(sansAccent(texte));
}

/**
 * Portrait (§9.6) : guillemets retirés de `sesMots`, années retirées de `recherche`,
 * prénom remplacé s'il apparaît dans les données de la personne. Chaque changement compte une réparation.
 */
export function qualitePortrait(portrait: Portrait, donnees: string): { portrait: Portrait; reparations: number } {
  const p = structuredClone(portrait);
  let reparations = 0;
  for (const d of p.douleurs) {
    const suivant = d.sesMots.replace(GUILLEMETS, "").replace(/\s{2,}/g, " ").trim();
    if (suivant !== d.sesMots) {
      d.sesMots = suivant;
      reparations += 1;
    }
  }
  for (const l of p.lieux) {
    const suivant = l.recherche.replace(ANNEE, "").replace(/\s{2,}/g, " ").trim();
    if (suivant !== l.recherche) {
      l.recherche = suivant;
      reparations += 1;
    }
  }
  if (contientMot(donnees, p.prenom)) {
    const libre = PRENOMS_SECOURS.find((x) => !contientMot(donnees, x));
    if (libre) {
      p.prenom = libre;
      reparations += 1;
    }
  }
  return { portrait: p, reparations };
}
