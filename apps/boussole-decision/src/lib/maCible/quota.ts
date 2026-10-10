// Limite d'usage (§10.3) : un compteur anonyme par jour, sans aucun contenu.
import type { SupabaseClient } from "@supabase/supabase-js";

export type EtapeQuota = "cadrage" | "resultat" | "synthese" | "approfondir";

export interface Limites {
  ipCadrage: number;
  ipResultat: number;
  ipSynthese: number;
  ipApprofondir: number;
  globalCadrage: number;
  globalResultat: number;
  globalSynthese: number;
  globalApprofondir: number;
}

export const LIMITES_DEFAUT: Limites = {
  ipCadrage: 30,
  ipResultat: 15,
  ipSynthese: 5,
  ipApprofondir: 20,
  globalCadrage: 2000,
  globalResultat: 500,
  globalSynthese: 100,
  globalApprofondir: 300,
};

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

export function limitesDepuisEnv(env: Record<string, string | undefined>): Limites {
  return {
    ipCadrage: entierPositif(env.MA_CIBLE_MAX_IP_CADRAGE, LIMITES_DEFAUT.ipCadrage),
    ipResultat: entierPositif(env.MA_CIBLE_MAX_IP_RESULTAT, LIMITES_DEFAUT.ipResultat),
    ipSynthese: entierPositif(env.MA_CIBLE_MAX_IP_SYNTHESE, LIMITES_DEFAUT.ipSynthese),
    ipApprofondir: entierPositif(env.MA_CIBLE_MAX_IP_APPROFONDIR, LIMITES_DEFAUT.ipApprofondir),
    globalCadrage: entierPositif(env.MA_CIBLE_MAX_GLOBAL_CADRAGE, LIMITES_DEFAUT.globalCadrage),
    globalResultat: entierPositif(env.MA_CIBLE_MAX_GLOBAL_RESULTAT, LIMITES_DEFAUT.globalResultat),
    globalSynthese: entierPositif(env.MA_CIBLE_MAX_GLOBAL_SYNTHESE, LIMITES_DEFAUT.globalSynthese),
    globalApprofondir: entierPositif(env.MA_CIBLE_MAX_GLOBAL_APPROFONDIR, LIMITES_DEFAUT.globalApprofondir),
  };
}

/** Plafond de sécurité d'un compte VIP, par étape et par jour (MA_CIBLE_MAX_VIP). */
export const PLAFOND_VIP_DEFAUT = 100;

/**
 * Compte VIP (est_vip) : le quota par IP est levé. Il reste un plafond de sécurité haut, compté par personne
 * (jamais plus bas que le quota ordinaire), et le plafond global du site.
 */
export function limitesVip(limites: Limites, env: Record<string, string | undefined>): Limites {
  const plafond = entierPositif(env.MA_CIBLE_MAX_VIP, PLAFOND_VIP_DEFAUT);
  return {
    ...limites,
    ipCadrage: Math.max(limites.ipCadrage, plafond),
    ipResultat: Math.max(limites.ipResultat, plafond),
    ipSynthese: Math.max(limites.ipSynthese, plafond),
    ipApprofondir: Math.max(limites.ipApprofondir, plafond),
  };
}

const CLE_IP: Record<EtapeQuota, keyof Limites> = {
  cadrage: "ipCadrage",
  resultat: "ipResultat",
  synthese: "ipSynthese",
  approfondir: "ipApprofondir",
};
const CLE_GLOBAL: Record<EtapeQuota, keyof Limites> = {
  cadrage: "globalCadrage",
  resultat: "globalResultat",
  synthese: "globalSynthese",
  approfondir: "globalApprofondir",
};
export const maxIp = (l: Limites, etape: EtapeQuota) => l[CLE_IP[etape]];
export const maxGlobal = (l: Limites, etape: EtapeQuota) => l[CLE_GLOBAL[etape]];

function depasse(n: number, plafond: number, dejaCompte: boolean): boolean {
  return dejaCompte ? n > plafond : n >= plafond;
}

function restantDe(limites: Limites, etape: EtapeQuota, nIp: number): number {
  return Math.max(0, maxIp(limites, etape) - nIp);
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
    return { ok: true, restant: restantDe(limites, etape, nIp) };
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

type ClientQuota = Pick<SupabaseClient, "rpc"> & Partial<Pick<SupabaseClient, "from">>;
type NombresQuota = { nIp: number; nGlobal: number };

function decision(limites: Limites, etape: EtapeQuota, nGlobal: number, nIp: number, dejaCompte: boolean): DecisionQuota {
  if (depasse(nGlobal, maxGlobal(limites, etape), dejaCompte)) return { ok: false, motif: "global", restant: 0 };
  if (depasse(nIp, maxIp(limites, etape), dejaCompte)) return { ok: false, motif: "ip", restant: 0 };
  return { ok: true, restant: restantDe(limites, etape, nIp) };
}

function motifErreur(e: unknown): string {
  const brut = e instanceof Error ? e.message : typeof e === "object" && e !== null && "message" in e ? String((e as { message: unknown }).message) : "inconnu";
  return brut.replace(/\s+/g, " ").slice(0, 160);
}

function avertirQuota(code: "quota_memoire" | "quota_ecart" | "quota_table", etape: EtapeQuota, motif?: string) {
  console.warn("[ma-cible]", motif ? { code, etape, motif } : { code, etape });
}

/** Lit le compteur du jour. `null` si la table ne répond pas. */
async function lireCompteurs(client: Pick<SupabaseClient, "from">, cle: string, etape: EtapeQuota): Promise<NombresQuota> {
  const jour = jourParis(new Date());
  const { data, error } = await client.from("ma_cible_quota").select("cle, n").eq("jour", jour).eq("etape", etape).in("cle", [cle, "global"]);
  if (error) throw new Error(motifErreur(error));
  const lignes = (data ?? []) as { cle: string; n: number }[];
  return {
    nGlobal: Number(lignes.find((l) => l.cle === "global")?.n ?? 0),
    nIp: Number(lignes.find((l) => l.cle === cle)?.n ?? 0),
  };
}

/** Incrément de secours si la fonction SQL manque : pas atomique, mais partagé entre les instances. */
async function incrementerParTable(client: Pick<SupabaseClient, "from">, limites: Limites, cle: string, etape: EtapeQuota): Promise<DecisionQuota> {
  const avant = await lireCompteurs(client, cle, etape);
  const nGlobal = avant.nGlobal + 1;
  const nIp = avant.nIp + 1;
  const jour = jourParis(new Date());
  const { error } = await client.from("ma_cible_quota").upsert(
    [
      { cle: "global", jour, etape, n: nGlobal },
      { cle, jour, etape, n: nIp },
    ],
    { onConflict: "cle,jour,etape" },
  );
  if (error) throw new Error(motifErreur(error));
  return decision(limites, etape, nGlobal, nIp, true);
}

/** Compteur partagé (fonctions SQL). Si l'appel échoue : table, puis mémoire de l'instance. */
export function quotaSupabase(client: ClientQuota, limites: Limites, secours: Quota): Quota {
  const viaRpc = async (nom: "ma_cible_autoriser" | "ma_cible_consommer", cle: string, etape: EtapeQuota): Promise<DecisionQuota & NombresQuota> => {
    let data: unknown;
    let error: { message?: string } | null = null;
    try {
      const r = await client.rpc(nom, {
        p_cle: cle,
        p_etape: etape,
        p_max_ip: maxIp(limites, etape),
        p_max_global: maxGlobal(limites, etape),
      });
      data = r.data;
      error = r.error;
    } catch (e) {
      throw new Error(motifErreur(e));
    }
    const ligne = (Array.isArray(data) ? data[0] : data) as { ok?: unknown; motif?: unknown; n_ip?: unknown; n_global?: unknown } | null;
    if (error || !ligne || typeof ligne.ok !== "boolean" || ligne.motif === "invalide") throw new Error(error ? motifErreur(error) : "reponse_quota");
    const nIp = Number(ligne.n_ip) || 0;
    const nGlobal = Number(ligne.n_global) || 0;
    const base = ligne.ok ? { ok: true as const, restant: restantDe(limites, etape, nIp) } : { ok: false as const, motif: ligne.motif === "global" ? ("global" as const) : ("ip" as const), restant: 0 };
    return { ...base, nIp, nGlobal };
  };

  const memoire = (etape: EtapeQuota, motif: string, suite: () => Promise<DecisionQuota>) => {
    avertirQuota("quota_memoire", etape, motif);
    return suite();
  };

  return {
    autoriser: async (cle, etape) => {
      try {
        const lu = await viaRpc("ma_cible_autoriser", cle, etape);
        return { ok: lu.ok, motif: lu.motif, restant: lu.restant };
      } catch (e) {
        if (client.from) {
          try {
            const n = await lireCompteurs(client as Pick<SupabaseClient, "from">, cle, etape);
            return decision(limites, etape, n.nGlobal, n.nIp, false);
          } catch {
            // La table non plus : dernier recours, le compteur mémoire de l'instance.
          }
        }
        return memoire(etape, motifErreur(e), () => secours.autoriser(cle, etape));
      }
    },
    consommer: async (cle, etape) => {
      try {
        const lu = await viaRpc("ma_cible_consommer", cle, etape);
        if (client.from) {
          try {
            const n = await lireCompteurs(client as Pick<SupabaseClient, "from">, cle, etape);
            if ((n.nIp > 0 || n.nGlobal > 0) && (n.nIp !== lu.nIp || n.nGlobal !== lu.nGlobal)) {
              avertirQuota("quota_ecart", etape);
              return decision(limites, etape, n.nGlobal, n.nIp, true);
            }
          } catch {
            // On garde la réponse de la fonction.
          }
        }
        return { ok: lu.ok, motif: lu.motif, restant: lu.restant };
      } catch (e) {
        const motif = motifErreur(e);
        if (client.from) {
          try {
            avertirQuota("quota_table", etape, motif);
            return await incrementerParTable(client as Pick<SupabaseClient, "from">, limites, cle, etape);
          } catch {
            // Écriture impossible : mémoire.
          }
        }
        return memoire(etape, motif, () => secours.consommer(cle, etape));
      }
    },
  };
}
