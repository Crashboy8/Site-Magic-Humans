// Limite d'usage (§10.3) : un compteur anonyme par jour, sans aucun contenu.
import type { SupabaseClient } from "@supabase/supabase-js";

export type EtapeQuota = "cadrage" | "resultat";

export interface Limites {
  /** `null` : pas de plafond personnel. Un entier positif s'applique à l'étape. */
  ipCadrage: number | null;
  ipResultat: number | null;
  globalCadrage: number;
  globalResultat: number;
}

export const LIMITES_DEFAUT: Limites = { ipCadrage: null, ipResultat: null, globalCadrage: 2000, globalResultat: 500 };

/** Entier passé au SQL à la place d'un plafond personnel absent. Tient dans un `integer` PostgreSQL. */
export const MAX_IP_SQL = 2_000_000_000;

export interface DecisionQuota {
  ok: boolean;
  motif?: "ip" | "global";
  restant: number;
}

export interface Quota {
  /** Lit le compteur du jour sans l'incrémenter. */
  autoriser(cle: string, etape: EtapeQuota): Promise<DecisionQuota>;
  /** Incrémente. À n'appeler qu'après une génération réussie. */
  consommer(cle: string, etape: EtapeQuota): Promise<DecisionQuota>;
}

const entierPositif = (v: string | undefined, defaut: number) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : defaut;
};

const MOTS_ILLIMITES = new Set(["", "0", "illimite", "illimité", "unlimited"]);

/** `MA_CIBLE_MAX_PAR_IP` vide, nulle ou non numérique : pas de plafond. Les anciennes variables par étape sont ignorées. */
function plafondPersonnel(v: string | undefined): number | null {
  const brut = (v ?? "").trim().toLowerCase();
  if (MOTS_ILLIMITES.has(brut)) return null;
  const n = Number.parseInt(brut, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function limitesDepuisEnv(env: Record<string, string | undefined>): Limites {
  const parIp = plafondPersonnel(env.MA_CIBLE_MAX_PAR_IP);
  return {
    ipCadrage: parIp,
    ipResultat: parIp,
    globalCadrage: entierPositif(env.MA_CIBLE_MAX_GLOBAL_CADRAGE, LIMITES_DEFAUT.globalCadrage),
    globalResultat: entierPositif(env.MA_CIBLE_MAX_GLOBAL_RESULTAT, LIMITES_DEFAUT.globalResultat),
  };
}

export const maxIp = (l: Limites, etape: EtapeQuota) => (etape === "cadrage" ? l.ipCadrage : l.ipResultat);
export const maxGlobal = (l: Limites, etape: EtapeQuota) => (etape === "cadrage" ? l.globalCadrage : l.globalResultat);

export function maxIpPourSql(l: Limites, etape: EtapeQuota): number {
  const ip = maxIp(l, etape);
  if (ip == null || ip > MAX_IP_SQL) return MAX_IP_SQL;
  return ip;
}

/** `n >= null` en JavaScript vaut `n >= 0` : un plafond absent ne doit jamais être comparé tel quel. */
function depasse(n: number, plafond: number | null, dejaCompte: boolean): boolean {
  if (plafond == null) return false;
  return dejaCompte ? n > plafond : n >= plafond;
}

function restantDe(limites: Limites, etape: EtapeQuota, nIp: number, nGlobal: number): number {
  const ip = maxIp(limites, etape);
  const base = ip == null ? maxGlobal(limites, etape) - nGlobal : ip - nIp;
  return Math.max(0, base);
}

const formatParis = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" });

/** Jour civil à Paris, « AAAA-MM-JJ ». */
export function jourParis(d: Date): string {
  return formatParis.format(d);
}

/** Prochain minuit à Paris (instant), par dichotomie sur le changement de jour. */
export function minuitSuivantParis(d: Date): Date {
  const jour = jourParis(d);
  let bas = d.getTime();
  let haut = bas + 26 * 3600_000;
  while (haut - bas > 1) {
    const milieu = Math.floor((bas + haut) / 2);
    if (jourParis(new Date(milieu)) === jour) bas = milieu;
    else haut = milieu;
  }
  return new Date(Math.ceil(haut / 1000) * 1000);
}

/** Compteur en mémoire de l'instance : tests, développement local et secours. */
export function quotaMemoire(limites: Limites, maintenant: () => Date): Quota {
  const compteurs = new Map<string, number>();
  const cleCompteur = (jour: string, etape: string, cle: string) => `${jour}|${etape}|${cle}`;
  const purger = (jour: string) => {
    for (const k of compteurs.keys()) if (!k.startsWith(`${jour}|`)) compteurs.delete(k);
  };
  const lire = (jour: string, etape: string, cle: string) => compteurs.get(cleCompteur(jour, etape, cle)) ?? 0;
  const decider = (nGlobal: number, nIp: number, etape: EtapeQuota, dejaCompte: boolean): DecisionQuota => {
    if (depasse(nGlobal, maxGlobal(limites, etape), dejaCompte)) return { ok: false, motif: "global", restant: 0 };
    if (depasse(nIp, maxIp(limites, etape), dejaCompte)) return { ok: false, motif: "ip", restant: 0 };
    return { ok: true, restant: restantDe(limites, etape, nIp, nGlobal) };
  };
  return {
    async autoriser(cle, etape) {
      const jour = jourParis(maintenant());
      purger(jour);
      return decider(lire(jour, etape, "global"), lire(jour, etape, cle), etape, false);
    },
    async consommer(cle, etape) {
      const jour = jourParis(maintenant());
      purger(jour);
      const nGlobal = lire(jour, etape, "global") + 1;
      compteurs.set(cleCompteur(jour, etape, "global"), nGlobal);
      if (nGlobal > maxGlobal(limites, etape)) return { ok: false, motif: "global", restant: 0 };
      const nIp = lire(jour, etape, cle) + 1;
      compteurs.set(cleCompteur(jour, etape, cle), nIp);
      return decider(nGlobal, nIp, etape, true);
    },
  };
}

/** Lit le compteur déjà en place, sans la fonction `ma_cible_autoriser` (migration pas encore jouée). */
async function autoriserParTable(
  client: Pick<SupabaseClient, "from">,
  limites: Limites,
  cle: string,
  etape: EtapeQuota,
): Promise<DecisionQuota> {
  const jour = jourParis(new Date());
  const { data, error } = await client.from("ma_cible_quota").select("cle, n").eq("jour", jour).eq("etape", etape).in("cle", [cle, "global"]);
  if (error) throw new Error("quota");
  const lignes = (data ?? []) as { cle: string; n: number }[];
  const nGlobal = Number(lignes.find((l) => l.cle === "global")?.n ?? 0);
  const nIp = Number(lignes.find((l) => l.cle === cle)?.n ?? 0);
  if (depasse(nGlobal, maxGlobal(limites, etape), false)) return { ok: false, motif: "global", restant: 0 };
  if (depasse(nIp, maxIp(limites, etape), false)) return { ok: false, motif: "ip", restant: 0 };
  return { ok: true, restant: restantDe(limites, etape, nIp, nGlobal) };
}

/** Compteur partagé (fonctions SQL) ; en cas d'échec, bascule sur `secours`. */
export function quotaSupabase(client: Pick<SupabaseClient, "rpc"> & Partial<Pick<SupabaseClient, "from">>, limites: Limites, secours: Quota): Quota {
  const viaRpc = async (nom: "ma_cible_autoriser" | "ma_cible_consommer", cle: string, etape: EtapeQuota): Promise<DecisionQuota> => {
    const { data, error } = await client.rpc(nom, {
      p_cle: cle,
      p_etape: etape,
      p_max_ip: maxIpPourSql(limites, etape),
      p_max_global: maxGlobal(limites, etape),
    });
    const ligne = Array.isArray(data) ? data[0] : data;
    if (error || !ligne || typeof ligne.ok !== "boolean" || ligne.motif === "invalide") throw new Error("quota");
    const restant = restantDe(limites, etape, Number(ligne.n_ip) || 0, Number(ligne.n_global) || 0);
    if (ligne.ok) return { ok: true, restant };
    return { ok: false, motif: ligne.motif === "global" ? "global" : "ip", restant: 0 };
  };
  const avecSecours = (nom: "ma_cible_autoriser" | "ma_cible_consommer", suite: (cle: string, etape: EtapeQuota) => Promise<DecisionQuota>) => {
    return async (cle: string, etape: EtapeQuota) => {
      try {
        return await viaRpc(nom, cle, etape);
      } catch {
        console.error("[ma-cible]", { code: "quota_secours", etape });
        return suite(cle, etape);
      }
    };
  };
  return {
    autoriser: async (cle, etape) => {
      try {
        return await viaRpc("ma_cible_autoriser", cle, etape);
      } catch {
        if (client.from) {
          try {
            return await autoriserParTable(client as Pick<SupabaseClient, "from">, limites, cle, etape);
          } catch {
            // La table non plus : dernier recours, le compteur mémoire de l'instance.
          }
        }
        console.error("[ma-cible]", { code: "quota_secours", etape });
        return secours.autoriser(cle, etape);
      }
    },
    consommer: avecSecours("ma_cible_consommer", (cle, etape) => secours.consommer(cle, etape)),
  };
}
