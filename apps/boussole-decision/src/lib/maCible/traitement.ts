// Toute la logique de la route POST /api/ma-cible/ (§10.2), sans dépendance au réseau ni à Next : testable avec des doublures.
// Rien n'est stocké ni journalisé : seuls des codes et des longueurs sont écrits en cas d'échec.
import { createHash, timingSafeEqual } from "node:crypto";
import { ENTETE_SESSION, ENTETE_TEST, emailAutorise, sessionValide } from "@/domain/maCible/acces";
import { validerCorrections, validerEntree, type ErreurChamp } from "@/domain/maCible/entree";
import { TAILLE_MAX_CORPS } from "@/domain/maCible/limites";
import { nettoyerTextes } from "@/domain/maCible/nettoyage";
import { messageUtilisateur, promptSysteme } from "@/domain/maCible/prompt";
import { classerCibles } from "@/domain/maCible/scores";
import { SCHEMA_CADRAGE, SCHEMA_RESULTAT } from "@/domain/maCible/schemas";
import type { Cadrage, Corrections, Demande, Esquisse, ResultatClasse } from "@/domain/maCible/types";
import { validerCadrage, validerResultat } from "@/domain/maCible/validation";
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
  return o.ok === true && o.etape === etape && (etape === "cadrage" ? o.cadrage != null : o.resultat != null);
}

/** Jetons de sortie du modèle. L'entrée est bornée par `TAILLE_MAX_CORPS`, pas par ce plafond. */
const MAX_TOKENS = { cadrage: 1_500, resultat: 9_000 } as const;
export const DELAI_MS = { cadrage: 90_000, resultat: 240_000 } as const;
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
  if (etape !== "cadrage" && etape !== "resultat") return { ok: false, champs: [{ champ: "etape", code: "invalide" }] };
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

type Traite = { ok: true; cadrage: Cadrage } | { ok: true; resultat: ResultatClasse } | { ok: false; erreurs: string[] };

/** JSON.parse, nettoyage, validation (§8.3). */
function traiterTexte(brut: string, demande: Demande): Traite {
  let json: unknown;
  try {
    json = JSON.parse(extraireJson(brut));
  } catch {
    return { ok: false, erreurs: ["JSON illisible : la réponse doit être un objet JSON seul"] };
  }
  json = nettoyerTextes(json);
  if (demande.etape === "cadrage") {
    const v = validerCadrage(json, demande.tour);
    return v.ok ? { ok: true, cadrage: v.valeur } : { ok: false, erreurs: v.erreurs };
  }
  const v = validerResultat(json);
  if (!v.ok) return { ok: false, erreurs: v.erreurs };
  return { ok: true, resultat: { ...v.valeur, classement: classerCibles(v.valeur.cibles) } };
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

  const deja = cleGardee && deps.reprise ? await deps.reprise.lire(cleGardee) : null;
  if (reponseReussie(deja, etape)) return repondre(deja);
  const enCours = cleGardee ? generations.get(cleGardee) : undefined;
  if (enCours) return repondreIssue(await enCours);

  if (!illimite) {
    const autorisation = await deps.quota.autoriser(empreinte, etape);
    if (!autorisation.ok) return refuserQuota(autorisation.motif ?? "ip", etape, limites, maintenant);
  }

  const repriseApresAttente = cleGardee && deps.reprise ? await deps.reprise.lire(cleGardee) : null;
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
      issue.corps.restant = maxIp(limites, etape) ?? maxGlobal(limites, etape);
    }
    if (issue.compte && cleGardee && deps.reprise) {
      try {
        await deps.reprise.garder(cleGardee, issue.corps);
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
      max: motif === "global" ? maxGlobal(limites, etape) : (maxIp(limites, etape) ?? maxGlobal(limites, etape)),
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
async function generer(deps: Dependances, demande: Demande): Promise<Issue> {
  const etape = demande.etape;
  const debut = Date.now();
  const delaiTotal = DELAI_MS[etape];
  let erreurs: string[] | undefined;
  let derniereLongueur = 0;
  for (let essai = 1; essai <= 2; essai++) {
    const reste = etape === "resultat" ? delaiTotal - (Date.now() - debut) : delaiTotal;
    if (essai === 2 && reste < DELAI_MIN_RELANCE_MS) break;
    let brut: string;
    try {
      brut = await deps.fournisseur!.appeler({
        systeme: promptSysteme(etape, demande.etape === "cadrage" ? demande.tour : undefined),
        utilisateur: messageUtilisateur(demande, erreurs),
        schema: etape === "cadrage" ? SCHEMA_CADRAGE : SCHEMA_RESULTAT,
        nomSchema: etape === "cadrage" ? "cadrage" : "resultat",
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
    const traite = traiterTexte(brut, demande);
    if (traite.ok) {
      const corps =
        "cadrage" in traite
          ? { ok: true, etape: "cadrage", cadrage: traite.cadrage, restant: 0 }
          : { ok: true, etape: "resultat", resultat: traite.resultat, restant: 0 };
      return { status: 200, corps, compte: true };
    }
    erreurs = traite.erreurs;
  }
  echec("ia_invalide", demande, { longueurReponse: derniereLongueur, nbErreurs: erreurs?.length ?? 0 });
  return { status: 502, corps: { ok: false, code: "ia_invalide" }, compte: false };
}
