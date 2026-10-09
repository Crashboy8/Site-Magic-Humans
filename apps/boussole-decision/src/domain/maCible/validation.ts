// Validation des réponses du modèle (§8.4). Retourne toutes les erreurs, dans l'ordre du document.
// Chaque erreur est une chaîne « chemin : problème ». Module pur.
import { CANAUX, IDS_IDEES, IDS_NOTES, IDS_PISTES } from "./schemas";
import type { SyntheseBrute } from "./terrain";
import type { AutrePiste, Cadrage, Cible, Frequence, IdNote, Resultat, ThemeVerbatim } from "./types";

export type Validation<T> = { ok: true; valeur: T; reparations: number } | { ok: false; erreurs: string[]; reparations: number };

const FINS_DE_PHRASE = [".", "!", "?", "…"];

/** Coupe à la dernière fin de phrase avant la limite, sinon au dernier espace, et ajoute « … ». */
export function couperTexte(texte: string, max: number): string {
  if (texte.length <= max) return texte;
  const budget = Math.max(0, max - 1);
  const zone = texte.slice(0, budget);
  let coupe = -1;
  for (const fin of FINS_DE_PHRASE) {
    const i = zone.lastIndexOf(fin);
    if (i > coupe) coupe = i;
  }
  const base = (coupe >= 0 ? zone.slice(0, coupe + 1) : zone.slice(0, Math.max(0, zone.lastIndexOf(" ")))).trimEnd();
  const avec = base.endsWith("…") ? base : `${base}…`;
  return avec.length <= max ? avec : `${avec.slice(0, Math.max(0, max - 1))}…`;
}

type Obj = Record<string, unknown>;
const estObjet = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

class Verif {
  erreurs: string[] = [];
  reparations = 0;
  err(chemin: string, probleme: string) {
    this.erreurs.push(`${chemin} : ${probleme}`);
  }
  objet(v: unknown, chemin: string): Obj | null {
    if (estObjet(v)) return v;
    this.err(chemin, "objet attendu");
    return null;
  }
  /** Écrit le texte réparé sur l'objet. Seul un texte vide ou sous la moitié du minimum est une erreur. */
  poser(o: Obj, cle: string, chemin: string, min: number, max: number): string | null {
    const v = this.texte(o[cle], chemin, min, max);
    if (v !== null) o[cle] = v;
    return v;
  }
  texte(v: unknown, chemin: string, min: number, max: number): string | null {
    if (typeof v !== "string") {
      this.err(chemin, "texte attendu");
      return null;
    }
    const t = v.trim();
    const n = t.length;
    if (min > 0 && (n === 0 || n * 2 < min)) {
      this.err(chemin, `trop court (${min} au moins)`);
      return v;
    }
    if (n > max) {
      this.reparations += 1;
      return couperTexte(t, max);
    }
    return v;
  }
  enum<T extends string>(v: unknown, chemin: string, valeurs: readonly T[]): T | null {
    if (typeof v === "string" && (valeurs as readonly string[]).includes(v)) return v as T;
    this.err(chemin, `valeur attendue parmi ${valeurs.join(", ")}`);
    return null;
  }
  entier(v: unknown, chemin: string, min: number, max: number): number | null {
    if (typeof v !== "number" || !Number.isInteger(v)) {
      this.err(chemin, "entier attendu");
      return null;
    }
    if (v < min || v > max) this.err(chemin, `entre ${min} et ${max} attendu`);
    return v;
  }
  tableau(v: unknown, chemin: string, min: number, max: number): unknown[] | null {
    if (!Array.isArray(v)) {
      this.err(chemin, "tableau attendu");
      return null;
    }
    if (v.length > max) {
      v.splice(max);
      this.reparations += 1;
    }
    if (v.length < min) this.err(chemin, min === max ? `exactement ${min} éléments attendus` : `${min} à ${max} éléments attendus`);
    return v;
  }
  /** Liste de textes : nombre d'éléments, puis longueur de chaque élément. Les textes trop longs sont coupés sur place. */
  textes(v: unknown, chemin: string, minItems: number, maxItems: number, min: number, max: number): string[] | null {
    const t = this.tableau(v, chemin, minItems, maxItems);
    if (!t) return null;
    return t.map((item, i) => {
      const s = this.texte(item, `${chemin}[${i}]`, min, max);
      if (s !== null) t[i] = s;
      return s ?? "";
    });
  }
}

function fini<T>(x: Verif, valeur: T): Validation<T> {
  return x.erreurs.length ? { ok: false, erreurs: x.erreurs, reparations: x.reparations } : { ok: true, valeur, reparations: x.reparations };
}

const IDS_CIBLE = ["c1", "c2", "c3"] as const;
const MARCHES_CIBLE = ["b2b", "b2c"] as const;

/** Champ absent : tableau vide et une réparation. Présent : on ne garde que les identifiants d'idées connus, sans doublon. */
function poserDepuisIdees(x: Verif, o: Obj, chemin: string) {
  if (o.depuisIdees === undefined) {
    o.depuisIdees = [];
    x.reparations += 1;
    return;
  }
  if (!Array.isArray(o.depuisIdees)) {
    x.err(chemin, "tableau attendu");
    return;
  }
  if (o.depuisIdees.length > 8) {
    o.depuisIdees.splice(8);
    x.reparations += 1;
  }
  const gardes: string[] = [];
  for (const id of o.depuisIdees) {
    if (typeof id === "string" && (IDS_IDEES as readonly string[]).includes(id) && !gardes.includes(id)) gardes.push(id);
    else x.reparations += 1;
  }
  o.depuisIdees = gardes;
}

function poserVerbatims(x: Verif, o: Obj, chemin: string) {
  if (o.verbatims === undefined) {
    o.verbatims = [];
    x.reparations += 1;
    return;
  }
  const t = x.tableau(o.verbatims, chemin, 0, 3);
  if (!t) return;
  t.forEach((item, i) => {
    if (typeof item !== "string") x.err(`${chemin}[${i}]`, "texte attendu");
  });
}

function poserNotePressentie(x: Verif, o: Obj, cle: string, chemin: string) {
  const v = o[cle];
  if (typeof v !== "number" || !Number.isInteger(v)) {
    x.err(chemin, "entier attendu");
    return;
  }
  if (v < 1 || v > 5) {
    o[cle] = v < 1 ? 1 : 5;
    x.reparations += 1;
  }
}

function verifierPiste(x: Verif, v: unknown, chemin: string, avecNotes: boolean) {
  const o = x.objet(v, chemin);
  if (!o) return;
  x.enum(o.id, `${chemin}.id`, IDS_PISTES);
  x.poser(o, "nom", `${chemin}.nom`, 5, 80);
  x.enum(o.marche, `${chemin}.marche`, MARCHES_CIBLE);
  x.poser(o, "enUneLigne", `${chemin}.enUneLigne`, 20, 200);
  x.poser(o, "raison", `${chemin}.raison`, 20, 200);
  poserDepuisIdees(x, o, `${chemin}.depuisIdees`);
  if (!avecNotes) return;
  const notes = x.objet(o.notes, `${chemin}.notes`);
  if (!notes) return;
  for (const cle of ["urgence", "paiement", "acces", "plaisir"]) poserNotePressentie(x, notes, cle, `${chemin}.notes.${cle}`);
}

function poserAutresPistes(x: Verif, o: Obj, chemin: string, avecNotes: boolean) {
  if (o.autresPistes === undefined) {
    o.autresPistes = [];
    x.reparations += 1;
    return;
  }
  const t = x.tableau(o.autresPistes, chemin, 0, 6);
  t?.forEach((p, i) => verifierPiste(x, p, `${chemin}[${i}]`, avecNotes));
}

function verifierEsquisse(x: Verif, v: unknown, chemin: string) {
  const e = x.objet(v, chemin);
  if (!e) return;
  x.poser(e, "offre", `${chemin}.offre`, 20, 240);
  const cibles = x.tableau(e.cibles, `${chemin}.cibles`, 3, 3);
  if (cibles) {
    const ids: string[] = [];
    cibles.forEach((c, i) => {
      const p = `${chemin}.cibles[${i}]`;
      const o = x.objet(c, p);
      if (!o) return;
      const id = x.enum(o.id, `${p}.id`, IDS_CIBLE);
      if (id) ids.push(id);
      x.poser(o, "nom", `${p}.nom`, 5, 80);
      x.enum(o.marche, `${p}.marche`, MARCHES_CIBLE);
      x.poser(o, "enUneLigne", `${p}.enUneLigne`, 20, 200);
      x.poser(o, "pourquoi", `${p}.pourquoi`, 20, 240);
      poserDepuisIdees(x, o, `${p}.depuisIdees`);
    });
    if (cibles.length === 3 && new Set(ids).size !== 3) x.err(`${chemin}.cibles`, "les identifiants doivent être c1, c2 et c3, chacun une fois");
  }
  x.poser(e, "antiCible", `${chemin}.antiCible`, 20, 240);
  x.textes(e.hypotheses, `${chemin}.hypotheses`, 0, 4, 1, 200);
  poserAutresPistes(x, e, `${chemin}.autresPistes`, false);
}

function verifierQuestions(x: Verif, v: unknown) {
  const qs = x.tableau(v, "questions", 1, 3);
  if (!qs) return;
  const ids: string[] = [];
  qs.forEach((q, i) => {
    const p = `questions[${i}]`;
    const o = x.objet(q, p);
    if (!o) return;
    const id = x.enum(o.id, `${p}.id`, ["q1", "q2", "q3"] as const);
    if (id) {
      if (ids.includes(id)) x.err(`${p}.id`, "identifiant en double");
      ids.push(id);
    }
    x.poser(o, "question", `${p}.question`, 10, 200);
    x.poser(o, "pourquoi", `${p}.pourquoi`, 10, 200);
    const type = x.enum(o.type, `${p}.type`, ["choix", "texte"] as const);
    if (type === "choix") x.textes(o.options, `${p}.options`, 2, 5, 1, 80);
    else if (type === "texte") x.tableau(o.options, `${p}.options`, 0, 0);
    x.poser(o, "exemple", `${p}.exemple`, 0, 120);
  });
}

export function validerCadrage(v: unknown, tour: 1 | 2 | 3): Validation<Cadrage> {
  const x = new Verif();
  const o = x.objet(v, "cadrage");
  if (!o) return { ok: false, erreurs: x.erreurs, reparations: x.reparations };
  const statut = x.enum(o.statut, "statut", ["questions", "esquisse", "hors_sujet"] as const);
  if (statut === "hors_sujet") x.poser(o, "message", "message", 10, 300);
  else x.poser(o, "message", "message", 0, 300);
  if (statut === "questions") {
    if (tour >= 2) x.err("statut", `questions interdites au tour ${tour}`);
    else verifierQuestions(x, o.questions);
  } else if (!Array.isArray(o.questions)) x.err("questions", "tableau attendu");
  if (statut === "esquisse") verifierEsquisse(x, o.esquisse, "esquisse");
  else if (!estObjet(o.esquisse)) x.err("esquisse", "objet attendu");
  return fini(x, o as unknown as Cadrage);
}

function verifierNote(x: Verif, v: unknown, chemin: string) {
  const o = x.objet(v, chemin);
  if (!o) return;
  x.entier(o.note, `${chemin}.note`, 1, 5);
  x.poser(o, "raison", `${chemin}.raison`, 10, 200);
}

function verifierCible(x: Verif, v: unknown, p: string, ids: string[], idsAutorises: readonly string[]) {
  const c = x.objet(v, p);
  if (!c) return;
  const id = x.enum(c.id, `${p}.id`, idsAutorises);
  if (id) ids.push(id);
  x.poser(c, "nom", `${p}.nom`, 5, 80);
  const marche = x.enum(c.marche, `${p}.marche`, MARCHES_CIBLE);
  x.poser(c, "portrait", `${p}.portrait`, 60, 500);
  x.poser(c, "douleur", `${p}.douleur`, 30, 300);
  x.poser(c, "ancrage", `${p}.ancrage`, 30, 300);
  x.poser(c, "promesse", `${p}.promesse`, 20, 180);

  const offre = x.objet(c.offre, `${p}.offre`);
  if (offre) {
    x.poser(offre, "nom", `${p}.offre.nom`, 3, 80);
    x.poser(offre, "format", `${p}.offre.format`, 3, 120);
    x.poser(offre, "duree", `${p}.offre.duree`, 2, 80);
    x.textes(offre.contenu, `${p}.offre.contenu`, 3, 5, 5, 140);
  }

  const prix = x.objet(c.prix, `${p}.prix`);
  if (prix) {
    const min = x.entier(prix.min, `${p}.prix.min`, 1, 100000);
    const max = x.entier(prix.max, `${p}.prix.max`, 1, 100000);
    if (min !== null && max !== null && max < min) x.err(`${p}.prix.max`, "doit être supérieur ou égal au minimum");
    x.poser(prix, "unite", `${p}.prix.unite`, 3, 40);
    const base = x.enum(prix.base, `${p}.prix.base`, ["HT", "TTC"] as const);
    if (base && marche && base !== (marche === "b2b" ? "HT" : "TTC")) x.err(`${p}.prix.base`, `${marche === "b2b" ? "HT" : "TTC"} attendu pour le marché ${marche}`);
    x.poser(prix, "justification", `${p}.prix.justification`, 20, 300);
  }

  x.poser(c, "pitch", `${p}.pitch`, 120, 600);
  x.poser(c, "pourquoi", `${p}.pourquoi`, 40, 400);
  x.poser(c, "exemple", `${p}.exemple`, 60, 500);

  const scores = x.objet(c.scores, `${p}.scores`);
  if (scores) for (const k of ["urgence", "paiement", "acces", "plaisir"]) verifierNote(x, scores[k], `${p}.scores.${k}`);

  const lieux = x.tableau(c.lieux, `${p}.lieux`, 2, 4);
  lieux?.forEach((l, i) => {
    const q = `${p}.lieux[${i}]`;
    const o = x.objet(l, q);
    if (!o) return;
    x.poser(o, "type", `${q}.type`, 5, 120);
    x.poser(o, "pourquoi", `${q}.pourquoi`, 10, 200);
    x.poser(o, "recherche", `${q}.recherche`, 3, 80);
  });

  const canaux = x.tableau(c.canaux, `${p}.canaux`, 2, 4);
  if (canaux) {
    let prioriteUn = false;
    canaux.forEach((cn, i) => {
      const q = `${p}.canaux[${i}]`;
      const o = x.objet(cn, q);
      if (!o) return;
      x.enum(o.canal, `${q}.canal`, CANAUX);
      if (x.entier(o.priorite, `${q}.priorite`, 1, 3) === 1) prioriteUn = true;
      x.poser(o, "action", `${q}.action`, 10, 200);
      x.poser(o, "pourquoi", `${q}.pourquoi`, 10, 200);
    });
    if (!prioriteUn) x.err(`${p}.canaux`, "au moins un canal de priorité 1 attendu");
  }

  const li = x.objet(c.linkedin, `${p}.linkedin`);
  if (li) {
    x.enum(li.pertinence, `${p}.linkedin.pertinence`, ["forte", "moyenne", "faible"] as const);
    x.poser(li, "motsCles", `${p}.linkedin.motsCles`, 3, 200);
    x.textes(li.intitules, `${p}.linkedin.intitules`, 0, 6, 1, 60);
    x.textes(li.secteurs, `${p}.linkedin.secteurs`, 0, 6, 1, 80);
    x.textes(li.tailles, `${p}.linkedin.tailles`, 0, 4, 1, 60);
    x.poser(li, "zone", `${p}.linkedin.zone`, 0, 80);
    x.textes(li.autres, `${p}.linkedin.autres`, 0, 5, 1, 200);
    x.poser(li, "astuce", `${p}.linkedin.astuce`, 10, 240);
  }

  const m = x.objet(c.messages, `${p}.messages`);
  if (m) {
    const lk = x.poser(m, "linkedin", `${p}.messages.linkedin`, 40, 280);
    if (lk !== null && lk.includes("http")) x.err(`${p}.messages.linkedin`, "aucun lien attendu");
    x.poser(m, "emailObjet", `${p}.messages.emailObjet`, 6, 60);
    const corps = x.poser(m, "emailCorps", `${p}.messages.emailCorps`, 200, 1100);
    if (corps !== null && !corps.includes("{{prenom}}")) x.err(`${p}.messages.emailCorps`, "doit contenir {{prenom}}");
  }

  const t = x.objet(c.testTerrain, `${p}.testTerrain`);
  if (t) {
    x.poser(t, "profils", `${p}.testTerrain.profils`, 20, 300);
    const qs = x.textes(t.questions, `${p}.testTerrain.questions`, 5, 5, 10, 200);
    qs?.forEach((q, i) => {
      if (q && !q.trim().endsWith("?")) x.err(`${p}.testTerrain.questions[${i}]`, "doit se terminer par ?");
    });
    x.textes(t.signauxPositifs, `${p}.testTerrain.signauxPositifs`, 2, 3, 1, 200);
    x.textes(t.signauxNegatifs, `${p}.testTerrain.signauxNegatifs`, 2, 3, 1, 200);
  }
  poserDepuisIdees(x, c, `${p}.depuisIdees`);
  poserVerbatims(x, c, `${p}.verbatims`);
}

/** Une cible seule. `idAttendu`, s'il est donné, doit être celui de la cible. */
export function validerCible(v: unknown, ids: readonly string[], idAttendu?: string): Validation<Cible> {
  const x = new Verif();
  const trouves: string[] = [];
  verifierCible(x, v, "cible", trouves, ids);
  if (idAttendu && trouves[0] !== idAttendu) x.err("cible.id", `${idAttendu} attendu`);
  return fini(x, v as Cible);
}

export function validerAutrePiste(v: unknown): Validation<AutrePiste> {
  const x = new Verif();
  verifierPiste(x, v, "piste", true);
  return fini(x, v as AutrePiste);
}

export function validerResultat(v: unknown): Validation<Resultat> {
  const x = new Verif();
  const o = x.objet(v, "resultat");
  if (!o) return { ok: false, erreurs: x.erreurs, reparations: x.reparations };
  x.enum(o.langue, "langue", ["fr", "en", "es"] as const);

  const offre = x.objet(o.offre, "offre");
  if (offre) {
    x.poser(offre, "phrase", "offre.phrase", 20, 240);
    x.poser(offre, "avant", "offre.avant", 20, 300);
    x.poser(offre, "apres", "offre.apres", 20, 300);
  }

  const cibles = x.tableau(o.cibles, "cibles", 3, 3);
  if (cibles) {
    const ids: string[] = [];
    cibles.forEach((c, i) => verifierCible(x, c, `cibles[${i}]`, ids, IDS_CIBLE));
    if (cibles.length === 3 && new Set(ids).size !== 3) x.err("cibles", "les identifiants doivent être c1, c2 et c3, chacun une fois");
  }
  poserAutresPistes(x, o, "autresPistes", true);

  const anti = x.objet(o.antiCible, "antiCible");
  if (anti) {
    x.poser(anti, "portrait", "antiCible.portrait", 30, 400);
    x.textes(anti.signaux, "antiCible.signaux", 3, 4, 1, 160);
    x.poser(anti, "lienAntiContexte", "antiCible.lienAntiContexte", 20, 300);
    x.poser(anti, "commentDire", "antiCible.commentDire", 20, 400);
  }

  const plan = x.tableau(o.plan30, "plan30", 4, 4);
  plan?.forEach((s, i) => {
    const p = `plan30[${i}]`;
    const so = x.objet(s, p);
    if (!so) return;
    if (so.semaine !== i + 1) x.err(`${p}.semaine`, `semaine ${i + 1} attendue, dans l'ordre`);
    x.poser(so, "titre", `${p}.titre`, 3, 80);
    const actions = x.tableau(so.actions, `${p}.actions`, 3, 3);
    actions?.forEach((a, j) => {
      const q = `${p}.actions[${j}]`;
      const ao = x.objet(a, q);
      if (!ao) return;
      x.poser(ao, "texte", `${q}.texte`, 10, 200);
      x.enum(ao.cible, `${q}.cible`, ["c1", "c2", "c3", "toutes"] as const);
      x.enum(ao.canal, `${q}.canal`, CANAUX);
      x.entier(ao.minutes, `${q}.minutes`, 10, 180);
    });
  });

  x.textes(o.hypotheses, "hypotheses", 0, 4, 1, 200);
  x.poser(o, "motPourToi", "motPourToi", 20, 300);
  return fini(x, o as unknown as Resultat);
}

export interface SyntheseValidee {
  statut: "ok" | "inutilisable";
  message: string;
  corps: SyntheseBrute;
}

/** Réponse du modèle pour la lecture des notes. Trop long : coupé. Trop court : seulement si vide ou sous la moitié du minimum. */
export function validerSynthese(v: unknown): Validation<SyntheseValidee> {
  const x = new Verif();
  const o = x.objet(v, "synthese");
  if (!o) return { ok: false, erreurs: x.erreurs, reparations: x.reparations };
  const statut = x.enum(o.statut, "statut", ["ok", "inutilisable"] as const);
  x.poser(o, "message", "message", 0, 300);
  const souple = statut !== "ok";
  const minTexte = souple ? 0 : 1;
  x.poser(o, "resume", "resume", souple ? 0 : 40, 400);
  x.textes(o.profils, "profils", 0, 4, minTexte, 160);
  const douleurs = x.tableau(o.douleurs, "douleurs", 0, 6);
  douleurs?.forEach((d, i) => {
    const p = `douleurs[${i}]`;
    const item = x.objet(d, p);
    if (!item) return;
    x.poser(item, "texte", `${p}.texte`, souple ? 0 : 10, 200);
    x.enum(item.frequence, `${p}.frequence`, ["souvent", "parfois", "une_fois"] as const);
  });
  const verbatims = x.tableau(o.verbatims, "verbatims", 0, 12);
  verbatims?.forEach((item, i) => {
    const p = `verbatims[${i}]`;
    const vb = x.objet(item, p);
    if (!vb) return;
    if (typeof vb.id !== "string" || !vb.id.trim()) x.err(`${p}.id`, "texte attendu");
    x.enum(vb.note, `${p}.note`, IDS_NOTES);
    x.poser(vb, "citation", `${p}.citation`, souple ? 0 : 8, 240);
    x.enum(vb.theme, `${p}.theme`, ["douleur", "declencheur", "objection", "resultat", "autre"] as const);
  });
  x.textes(o.declencheurs, "declencheurs", 0, 4, minTexte, 200);
  x.textes(o.objections, "objections", 0, 4, minTexte, 200);
  x.textes(o.motsCles, "motsCles", 0, 10, minTexte, 40);
  if (x.erreurs.length || !statut) return { ok: false, erreurs: x.erreurs, reparations: x.reparations };
  const corps: SyntheseBrute = {
    resume: String(o.resume ?? ""),
    profils: (o.profils as string[]) ?? [],
    douleurs: ((o.douleurs as { texte: string; frequence: Frequence }[]) ?? []).map((d) => ({ texte: d.texte, frequence: d.frequence })),
    verbatims: ((o.verbatims as { id: string; note: IdNote; citation: string; theme: ThemeVerbatim }[]) ?? []).map((item) => ({
      id: item.id,
      note: item.note,
      citation: item.citation,
      theme: item.theme,
    })),
    declencheurs: (o.declencheurs as string[]) ?? [],
    objections: (o.objections as string[]) ?? [],
    motsCles: (o.motsCles as string[]) ?? [],
  };
  return { ok: true, valeur: { statut, message: String(o.message ?? ""), corps }, reparations: x.reparations };
}
