// Toute la logique de la route POST /api/ma-cible/ (§10.2), sans dépendance au réseau ni à Next : testable avec des doublures.
// Rien n'est stocké ni journalisé : seuls des codes et des longueurs sont écrits en cas d'échec.
import { createHash, timingSafeEqual } from "node:crypto";
import { ENTETE_SESSION, ENTETE_TEST, emailAutorise, sessionValide } from "@/domain/maCible/acces";
import { validerApprofondir, validerContexteSynthese, validerCorrections, validerEntree, validerNotes, type ErreurChamp } from "@/domain/maCible/entree";
import { couvrirIdees, filtrerVerbatimsCibles, filtrerVerbatimsPortrait, qualitePistes } from "@/domain/maCible/idees";
import { TAILLE_MAX_CORPS } from "@/domain/maCible/limites";
import { type CompteMasques, masquerDonnees } from "@/domain/maCible/masquage";
import { nettoyerTextes } from "@/domain/maCible/nettoyage";
import { messageUtilisateur, promptSysteme } from "@/domain/maCible/prompt";
import { ajouterPhrases, appliquerQualite, phrasesDepartage, qualiteCible, qualitePortrait, questionsManquantes, type ContexteQualite } from "@/domain/maCible/qualite";
import { classerCibles, scoreSur10 } from "@/domain/maCible/scores";
import { SCHEMA_CADRAGE, SCHEMA_PISTE, SCHEMA_PORTRAIT, SCHEMA_RESULTAT, SCHEMA_SYNTHESE } from "@/domain/maCible/schemas";
import { verifierVerbatims } from "@/domain/maCible/terrain";
import type { Cadrage, Cible, Corrections, Demande, DemandeApprofondir, EntreeMaCible, Esquisse, LignePiste, Portrait, ResultatClasse, SyntheseTerrain } from "@/domain/maCible/types";
import { validerCadrage, validerCible, validerPortrait, validerResultat, validerSynthese } from "@/domain/maCible/validation";
import { ErreurFournisseur, type Fournisseur } from "@/lib/ia/fournisseur";
import { jourParis, limitesDepuisEnv, maxGlobal, maxIp, minuitSuivantParis, type Quota } from "./quota";
import { origineAcceptee } from "./origine";
import type { Reprise } from "./reprise";

export interface Dependances {
  fournisseur: Fournisseur | null;
  quota: Quota;
  maintenant: () => Date;
  env: Record<string, string | undefined>;
  /** Email de la session Supabase, résolu par la route. Jamais lu depuis le corps de la requête. */
  emailConnecte?: string | null;
  /** Résultat réussi gardé quelques minutes pour un nouvel essai après une connexion coupée. */
  reprise?: Reprise;
  /**
   * Reprise en mémoire de l'instance seule. Utilisée à la place de `reprise` pour `synthese`,
   * afin qu'aucune phrase de client ne soit écrite dans `ma_cible_reprise`.
   */
  repriseSensible?: Reprise;
}

interface Issue {
  status: number;
  corps: Record<string, unknown>;
  compte: boolean;
}

/** Génération en cours, partagée par un « Réessayer » qui arrive avant la fin du premier appel. */
const generations = new Map<string, Promise<Issue>>();

export function reinitialiserGenerations(): void {
  generations.clear();
}

function secretEgal(attendu: string, recu: string): boolean {
  if (!attendu || !recu) return false;
  const a = createHash("sha256").update(attendu).digest();
  const b = createHash("sha256").update(recu).digest();
  return timingSafeEqual(a, b);
}

function cleRepriseDe(sel: string, session: string, demande: Demande): string {
  return createHash("sha256").update(`${sel}:${session}:${JSON.stringify(demande)}`).digest("hex");
}

function reponseReussie(corps: unknown, etape: Demande["etape"]): corps is Record<string, unknown> {
  if (typeof corps !== "object" || corps === null) return false;
  const o = corps as Record<string, unknown>;
  if (o.ok !== true || o.etape !== etape) return false;
  if (etape === "cadrage") return o.cadrage != null;
  if (etape === "resultat") return o.resultat != null;
  if (etape === "approfondir") return o.portrait != null;
  return "statut" in o;
}

/** Jetons de sortie du modèle. L'entrée est bornée par `TAILLE_MAX_CORPS`, pas par ce plafond. */
const MAX_TOKENS = { cadrage: 2_500, resultat: 10_000, synthese: 3_000, approfondir: 6_000 } as const;
export const DELAI_MS = { cadrage: 90_000, resultat: 240_000, synthese: 90_000, approfondir: 150_000 } as const;
/** En dessous de ce délai restant, une relance n'a plus aucune chance d'aboutir. */
const DELAI_MIN_RELANCE_MS = 10_000;

function repondre(corps: unknown, status = 200, entetes: Record<string, string> = {}): Response {
  return Response.json(corps, { status, headers: { "Cache-Control": "no-store", ...entetes } });
}
const invalide = (champs: ErreurChamp[]) => repondre({ ok: false, code: "entree_invalide", champs }, 400);

function adresseIp(h: Headers): string {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "inconnue";
}

/** Empreinte anonyme (IP + sel + jour) : l'IP n'est ni stockée ni journalisée. */
export function cleCompteur(sel: string, jour: string, ip: string): string {
  return createHash("sha256").update(`${sel}:${jour}:${ip}`).digest("hex");
}

/** Retire une clôture de bloc de code et ne garde que le texte entre la première `{` et la dernière `}`. */
export function extraireJson(brut: string): string {
  const debut = brut.indexOf("{");
  const fin = brut.lastIndexOf("}");
  return debut >= 0 && fin > debut ? brut.slice(debut, fin + 1) : brut;
}

function esquisseValide(v: unknown): Esquisse | null {
  const r = validerCadrage({ statut: "esquisse", message: "", questions: [], esquisse: v }, 1);
  return r.ok ? r.valeur.esquisse : null;
}

/** Valide le corps de la requête (§10.2, étape 2). */
function lireDemande(corps: unknown): { ok: true; demande: Demande } | { ok: false; champs: ErreurChamp[] } {
  if (typeof corps !== "object" || corps === null || Array.isArray(corps)) return { ok: false, champs: [{ champ: "corps", code: "invalide" }] };
  const b = corps as Record<string, unknown>;
  const etape = b.etape;
  if (etape !== "cadrage" && etape !== "resultat" && etape !== "synthese" && etape !== "approfondir") return { ok: false, champs: [{ champ: "etape", code: "invalide" }] };
  if (etape === "approfondir") {
    const a = validerApprofondir(b);
    return a.ok ? { ok: true, demande: a.demande } : { ok: false, champs: a.erreurs };
  }
  if (etape === "synthese") {
    const langue = b.langue;
    if (langue !== "fr" && langue !== "en" && langue !== "es") return { ok: false, champs: [{ champ: "langue", code: "invalide" }] };
    const notes = validerNotes(b.notes);
    const contexte = validerContexteSynthese(b.contexte);
    const champs = [...(notes.ok ? [] : notes.erreurs), ...(contexte.ok ? [] : contexte.erreurs)];
    if (!notes.ok || !contexte.ok) return { ok: false, champs };
    return { ok: true, demande: { etape, langue, contexte: contexte.contexte, notes: notes.notes } };
  }
  const tour = b.tour;
  if (etape === "cadrage" && tour !== 1 && tour !== 2 && tour !== 3) return { ok: false, champs: [{ champ: "tour", code: "invalide" }] };

  const champs: ErreurChamp[] = [];
  const e = validerEntree(b.entree);
  if (!e.ok) champs.push(...e.erreurs);

  const besoinEsquisse = etape === "resultat" || tour === 3;
  const cleEsquisse = etape === "resultat" ? "esquisse" : "esquissePrecedente";
  let esquisse: Esquisse | null = null;
  let corrections: Corrections | undefined;
  if (besoinEsquisse) {
    esquisse = esquisseValide(b[cleEsquisse]);
    if (!esquisse) champs.push({ champ: cleEsquisse, code: b[cleEsquisse] === undefined ? "requis" : "invalide" });
    if (b.corrections === undefined) champs.push({ champ: "corrections", code: "requis" });
    else {
      const c = validerCorrections(b.corrections);
      if (c.ok) corrections = c.corrections;
      else champs.push(...c.erreurs);
    }
  }
  if (champs.length || !e.ok) return { ok: false, champs };

  if (etape === "resultat") {
    return { ok: true, demande: { etape, entree: e.entree, esquisse: esquisse!, corrections: corrections! } };
  }
  if (tour === 3) {
    return { ok: true, demande: { etape, tour: 3, entree: e.entree, esquissePrecedente: esquisse!, corrections: corrections! } };
  }
  return { ok: true, demande: { etape, tour: tour as 1 | 2, entree: e.entree } };
}

type SyntheseReponse = Omit<SyntheseTerrain, "faitLe">;

type Traite =
  | { ok: true; cadrage: Cadrage; reparations: number }
  | { ok: true; resultat: ResultatClasse; reparations: number }
  | { ok: true; synthese: SyntheseReponse | null; statut: "ok" | "inutilisable"; message: string; reparations: number }
  | { ok: true; portrait: Portrait; reparations: number }
  | { ok: true; piste: { cible: Cible; ligne: LignePiste; portrait: Portrait }; reparations: number }
  | { ok: false; erreurs: string[]; reparations: number };

function contexteQualite(demande: Exclude<Demande, { etape: "synthese" }>): ContexteQualite {
  const { talent, terrain } = demande.entree;
  const idee = "corrections" in demande && demande.corrections ? demande.corrections.idee : "";
  return {
    antiContexte: talent.antiContexte,
    reseau: [terrain.experience, terrain.clientsPasses, talent.reussite].filter(Boolean).join("\n"),
    idee,
    marche: terrain.marche,
    prixActuel: terrain.prixActuel,
    adresse: terrain.adresse,
    formats: terrain.formats,
    talent: `${talent.mecanisme}\n${talent.contexte}`,
  };
}

/** JSON.parse, nettoyage, validation (§8.3), puis contrôles déterministes. */
function traiterTexte(brut: string, demande: Demande): Traite {
  let json: unknown;
  try {
    json = JSON.parse(extraireJson(brut));
  } catch {
    return { ok: false, erreurs: ["JSON illisible : la réponse doit être un objet JSON seul"], reparations: 0 };
  }
  json = nettoyerTextes(json);
  if (demande.etape === "synthese") {
    const v = validerSynthese(json);
    if (!v.ok) return { ok: false, erreurs: v.erreurs, reparations: v.reparations };
    if (v.valeur.statut === "inutilisable") {
      return { ok: true, synthese: null, statut: "inutilisable", message: v.valeur.message.slice(0, 300), reparations: v.reparations };
    }
    const verifie = verifierVerbatims(v.valeur.corps, demande.notes);
    return {
      ok: true,
      synthese: { ...verifie.synthese, nbNotes: demande.notes.length },
      statut: "ok",
      message: "",
      reparations: v.reparations + verifie.retires,
    };
  }
  if (demande.etape === "approfondir") return traiterApprofondir(json, demande);
  if (demande.etape === "cadrage") {
    const v = validerCadrage(json, demande.tour);
    if (!v.ok) return { ok: false, erreurs: v.erreurs, reparations: v.reparations };
    const manque = questionsManquantes(v.valeur, demande.tour, contexteQualite(demande));
    if (manque) return { ok: false, erreurs: [manque], reparations: v.reparations };
    let reparations = v.reparations;
    if (v.valeur.statut === "esquisse") {
      const idees = demande.entree.terrain.ciblesEnTete;
      const marche = demande.entree.terrain.marche;
      const couvert = couvrirIdees(v.valeur.esquisse, idees, marche, false);
      const pistes = qualitePistes(couvert.sortie, idees, marche, false);
      v.valeur = { ...v.valeur, esquisse: pistes.sortie };
      reparations += couvert.ajoutees + pistes.reparations;
    }
    return { ok: true, cadrage: v.valeur, reparations };
  }
  const v = validerResultat(json);
  if (!v.ok) return { ok: false, erreurs: v.erreurs, reparations: v.reparations };
  const idees = demande.entree.terrain.ciblesEnTete;
  const marche = demande.entree.terrain.marche;
  const couvert = couvrirIdees(v.valeur, idees, marche, true);
  const pistes = qualitePistes(couvert.sortie, idees, marche, true);
  const phrasesCibles = filtrerVerbatimsCibles(pistes.sortie, demande.entree.synthese);
  const q = appliquerQualite(phrasesCibles.sortie, contexteQualite(demande));
  if (q.erreurs.length) return { ok: false, erreurs: q.erreurs, reparations: v.reparations + couvert.ajoutees + pistes.reparations + phrasesCibles.retires + q.reparations };
  const classement = classerCibles(q.resultat.cibles);
  const phrases = ajouterPhrases(q.resultat.hypotheses, phrasesDepartage(q.resultat.cibles, classement));
  return {
    ok: true,
    resultat: { ...q.resultat, hypotheses: phrases.hypotheses, classement },
    reparations: v.reparations + couvert.ajoutees + pistes.reparations + phrasesCibles.retires + q.reparations + phrases.ajoutees,
  };
}

/** Données de la personne où un prénom ne doit pas apparaître (§9.6) : notes de la synthèse, talent, terrain. */
function donneesPourPrenom(entree: EntreeMaCible): string {
  const { talent, terrain, synthese } = entree;
  const parties: unknown[] = [talent, terrain, synthese?.verbatims.map((v) => v.citation), synthese?.resume, synthese?.profils];
  return parties.map((p) => (p === undefined || p === null ? "" : JSON.stringify(p))).join("\n");
}

function portraitPropre(brut: unknown, entree: EntreeMaCible, chemin: string): { ok: true; portrait: Portrait; reparations: number } | { ok: false; erreurs: string[]; reparations: number } {
  const v = validerPortrait(brut, chemin);
  if (!v.ok) return v;
  const q = qualitePortrait(v.valeur, donneesPourPrenom(entree));
  const f = filtrerVerbatimsPortrait(q.portrait, entree.synthese);
  return { ok: true, portrait: f.sortie, reparations: v.reparations + q.reparations + f.retires };
}

/** Portrait seul, ou piste creusée (cible + portrait) (§7.5). */
function traiterApprofondir(json: unknown, demande: DemandeApprofondir): Traite {
  const o = typeof json === "object" && json !== null && !Array.isArray(json) ? (json as Record<string, unknown>) : {};
  if (demande.mode === "portrait") {
    const p = portraitPropre(o.portrait, demande.entree, "portrait");
    if (!p.ok) return p;
    return { ok: true, portrait: p.portrait, reparations: p.reparations };
  }
  const c = validerCible(o.cible, ["c4", "c5", "c6"], demande.idCible);
  const p = portraitPropre(o.portrait, demande.entree, "portrait");
  if (!c.ok || !p.ok) {
    return { ok: false, erreurs: [...(c.ok ? [] : c.erreurs), ...(p.ok ? [] : p.erreurs)], reparations: c.reparations + p.reparations };
  }
  const phrases = filtrerVerbatimsCibles({ cibles: [c.valeur] }, demande.entree.synthese);
  const q = qualiteCible(phrases.sortie.cibles[0], contexteQualite(demande));
  const reparations = c.reparations + p.reparations + phrases.retires + q.reparations;
  if (q.erreurs.length) return { ok: false, erreurs: q.erreurs, reparations };
  const cible = q.cible;
  const ligne: LignePiste = { id: cible.id, score: scoreSur10(cible.scores), alertePlaisir: cible.scores.plaisir.note <= 2 };
  return { ok: true, piste: { cible, ligne, portrait: p.portrait }, reparations };
}

function echec(code: string, demande: Demande, extra: Record<string, unknown> = {}) {
  // Jamais de contenu : seulement des codes et des longueurs.
  console.error("[ma-cible]", { code, etape: demande.etape, tour: demande.etape === "cadrage" ? demande.tour : undefined, ...extra });
}

export async function traiterDemande(deps: Dependances, request: Request): Promise<Response> {
  const { env } = deps;

  // 1. Origine, taille, JSON.
  if (!origineAcceptee(request.headers.get("origin"), env)) return repondre({ ok: false, code: "origine_refusee" }, 403);
  const declaree = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaree) && declaree > TAILLE_MAX_CORPS) return repondre({ ok: false, code: "trop_long" }, 413);
  const texteCorps = await request.text();
  if (new TextEncoder().encode(texteCorps).length > TAILLE_MAX_CORPS) return repondre({ ok: false, code: "trop_long" }, 413);
  let corps: unknown;
  try {
    corps = JSON.parse(texteCorps);
  } catch {
    return invalide([{ champ: "corps", code: "invalide" }]);
  }

  // 2. Validation.
  const lu = lireDemande(corps);
  if (!lu.ok) return invalide(lu.champs);
  const demande = lu.demande;
  const etape = demande.etape;

  // 3. Configuration.
  const enProduction = env.VERCEL_ENV === "production";
  const sel = env.MA_CIBLE_SEL?.trim() || (enProduction ? "" : "sel-de-developpement");
  if (!deps.fournisseur || !sel) {
    echec("config_manquante", demande);
    return repondre({ ok: false, code: "config_manquante" }, 503);
  }

  // 4. Reprise, puis droit d'appel. Le quota n'est compté qu'après une génération réussie.
  const maintenant = deps.maintenant();
  const limites = limitesDepuisEnv(env);
  const empreinte = cleCompteur(sel, jourParis(maintenant), adresseIp(request.headers));
  const session = sessionValide(request.headers.get(ENTETE_SESSION));
  const cleGardee = session ? cleRepriseDe(sel, session, demande) : null;
  const illimite =
    secretEgal(env.MA_CIBLE_CLE_TEST?.trim() ?? "", request.headers.get(ENTETE_TEST)?.trim() ?? "") ||
    emailAutorise(env.MA_CIBLE_EMAILS_ILLIMITES, deps.emailConnecte);

  const garde = etape === "synthese" ? deps.repriseSensible : deps.reprise;
  const deja = cleGardee && garde ? await garde.lire(cleGardee) : null;
  if (reponseReussie(deja, etape)) return repondre(deja);
  const enCours = cleGardee ? generations.get(cleGardee) : undefined;
  if (enCours) return repondreIssue(await enCours);

  if (!illimite) {
    const autorisation = await deps.quota.autoriser(empreinte, etape);
    if (!autorisation.ok) return refuserQuota(autorisation.motif ?? "ip", etape, limites, maintenant);
  }

  const repriseApresAttente = cleGardee && garde ? await garde.lire(cleGardee) : null;
  if (reponseReussie(repriseApresAttente, etape)) return repondre(repriseApresAttente);
  const demarree = cleGardee ? generations.get(cleGardee) : undefined;
  if (demarree) return repondreIssue(await demarree);

  const travail = generer(deps, demande);
  if (cleGardee) generations.set(cleGardee, travail);
  try {
    const issue = await travail;
    if (issue.compte && !illimite) {
      const compte = await deps.quota.consommer(empreinte, etape);
      issue.corps.restant = compte.ok ? compte.restant : 0;
    } else if (issue.compte) {
      issue.corps.restant = maxIp(limites, etape);
    }
    if (issue.compte && cleGardee && garde) {
      try {
        await garde.garder(cleGardee, issue.corps);
      } catch {
        console.error("[ma-cible]", { code: "reprise_secours" });
      }
    }
    return repondreIssue(issue);
  } finally {
    if (cleGardee) generations.delete(cleGardee);
  }
}

function refuserQuota(motif: "ip" | "global", etape: Demande["etape"], limites: ReturnType<typeof limitesDepuisEnv>, maintenant: Date): Response {
  const apres = minuitSuivantParis(maintenant);
  const secondes = Math.max(1, Math.ceil((apres.getTime() - maintenant.getTime()) / 1000));
  return repondre(
    {
      ok: false,
      code: motif === "global" ? "quota_global" : "quota_ip",
      etape,
      max: motif === "global" ? maxGlobal(limites, etape) : maxIp(limites, etape),
      reessayerApres: apres.toISOString(),
    },
    429,
    { "Retry-After": String(secondes) },
  );
}

function repondreIssue(issue: Issue): Response {
  return repondre(issue.corps, issue.status);
}

/** Appel au modèle, avec une seule relance. N'incrémente pas le quota. */
/** Masque une copie des notes. La demande d'origine, utilisée pour l'empreinte de reprise, n'est pas modifiée. */
function demandePourModele(demande: Demande): { demande: Demande; masques: CompteMasques } {
  if (demande.etape !== "synthese") return { demande, masques: { mails: 0, telephones: 0, liens: 0 } };
  const masques: CompteMasques = { mails: 0, telephones: 0, liens: 0 };
  const notes = demande.notes.map((n) => {
    const titre = masquerDonnees(n.titre);
    const texte = masquerDonnees(n.texte);
    masques.mails += titre.mails + texte.mails;
    masques.telephones += titre.telephones + texte.telephones;
    masques.liens += titre.liens + texte.liens;
    return { ...n, titre: titre.texte, texte: texte.texte };
  });
  return { demande: { ...demande, notes }, masques };
}

function schemaPour(demande: Demande) {
  if (demande.etape === "cadrage") return SCHEMA_CADRAGE;
  if (demande.etape === "resultat") return SCHEMA_RESULTAT;
  if (demande.etape === "synthese") return SCHEMA_SYNTHESE;
  return demande.mode === "piste" ? SCHEMA_PISTE : SCHEMA_PORTRAIT;
}

async function generer(deps: Dependances, demande: Demande): Promise<Issue> {
  const etape = demande.etape;
  const pourModele = demandePourModele(demande);
  const demandeModele = pourModele.demande;
  const masques = pourModele.masques;
  const debut = Date.now();
  const delaiTotal = DELAI_MS[etape];
  let erreurs: string[] | undefined;
  let derniereLongueur = 0;
  for (let essai = 1; essai <= 2; essai++) {
    const reste = delaiTotal - (Date.now() - debut);
    if (essai === 2 && reste < DELAI_MIN_RELANCE_MS) break;
    let brut: string;
    try {
      brut = await deps.fournisseur!.appeler({
        systeme: promptSysteme(
          etape,
          demandeModele.etape === "cadrage" ? demandeModele.tour : undefined,
          demandeModele.etape === "approfondir" ? demandeModele.mode : undefined,
        ),
        utilisateur: messageUtilisateur(demandeModele, erreurs),
        schema: schemaPour(demandeModele),
        nomSchema: demandeModele.etape === "approfondir" ? demandeModele.mode : etape,
        maxTokens: MAX_TOKENS[etape],
        delaiMs: Math.min(delaiTotal, reste),
      });
    } catch (e) {
      if (e instanceof ErreurFournisseur && e.code === "vide") {
        brut = "";
      } else {
        const f = e instanceof ErreurFournisseur ? e : null;
        const messageFournisseur = f?.messageFournisseur?.slice(0, 300);
        echec("ia_indisponible", demande, {
          motif: f?.code ?? "inconnu",
          statutFournisseur: f?.statut,
          ...(messageFournisseur ? { messageFournisseur } : {}),
        });
        return { status: 503, corps: { ok: false, code: "ia_indisponible" }, compte: false };
      }
    }
    derniereLongueur = brut.length;
    const traite = traiterTexte(brut, demandeModele);
    if (traite.ok) {
      if (traite.reparations > 0) echec("reparations", demande, { reparations: traite.reparations });
      const corps =
        "cadrage" in traite
          ? { ok: true, etape: "cadrage" as const, cadrage: traite.cadrage, restant: 0 }
          : "resultat" in traite
            ? { ok: true, etape: "resultat" as const, resultat: traite.resultat, restant: 0 }
            : "portrait" in traite && demande.etape === "approfondir" && demande.mode === "portrait"
              ? { ok: true, etape: "approfondir" as const, mode: "portrait" as const, id: demande.cible.id, portrait: traite.portrait, restant: 0 }
              : "piste" in traite && demande.etape === "approfondir" && demande.mode === "piste"
                ? { ok: true, etape: "approfondir" as const, mode: "piste" as const, pisteId: demande.piste.id, ...traite.piste, restant: 0 }
                : "synthese" in traite ? { ok: true, etape: "synthese" as const, statut: traite.statut, message: traite.message, synthese: traite.synthese, masques, restant: 0 }
                : null;
      if (!corps) {
        echec("ia_invalide", demande, { longueurReponse: derniereLongueur });
        return { status: 502, corps: { ok: false, code: "ia_invalide" }, compte: false };
      }
      return { status: 200, corps, compte: true };
    }
    erreurs = traite.erreurs;
  }
  echec("ia_invalide", demande, { longueurReponse: derniereLongueur, nbErreurs: erreurs?.length ?? 0 });
  return { status: 502, corps: { ok: false, code: "ia_invalide" }, compte: false };
}
