// Limite d'usage (§10.3) : un compteur anonyme par jour, sans aucun contenu.
import type { SupabaseClient } from "@supabase/supabase-js";

export type EtapeQuota = "cadrage" | "resultat";

export interface Limites {
  ipCadrage: number;
  ipResultat: number;
  globalCadrage: number;
  globalResultat: number;
}

export const LIMITES_DEFAUT: Limites = { ipCadrage: 8, ipResultat: 3, globalCadrage: 600, globalResultat: 200 };

export interface Quota {
  consommer(cle: string, etape: EtapeQuota): Promise<{ ok: boolean; motif?: "ip" | "global"; restant: number }>;
}

const entierPositif = (v: string | undefined, defaut: number) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : defaut;
};

export function limitesDepuisEnv(env: Record<string, string | undefined>): Limites {
  return {
    ipCadrage: entierPositif(env.MA_CIBLE_MAX_IP_CADRAGE, LIMITES_DEFAUT.ipCadrage),
    ipResultat: entierPositif(env.MA_CIBLE_MAX_IP_RESULTAT, LIMITES_DEFAUT.ipResultat),
    globalCadrage: entierPositif(env.MA_CIBLE_MAX_GLOBAL_CADRAGE, LIMITES_DEFAUT.globalCadrage),
    globalResultat: entierPositif(env.MA_CIBLE_MAX_GLOBAL_RESULTAT, LIMITES_DEFAUT.globalResultat),
  };
}

export const maxIp = (l: Limites, etape: EtapeQuota) => (etape === "cadrage" ? l.ipCadrage : l.ipResultat);
export const maxGlobal = (l: Limites, etape: EtapeQuota) => (etape === "cadrage" ? l.globalCadrage : l.globalResultat);

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
  const incrementer = (jour: string, etape: string, cle: string) => {
    const k = `${jour}|${etape}|${cle}`;
    const n = (compteurs.get(k) ?? 0) + 1;
    compteurs.set(k, n);
    return n;
  };
  return {
    async consommer(cle, etape) {
      const jour = jourParis(maintenant());
      for (const k of compteurs.keys()) if (!k.startsWith(`${jour}|`)) compteurs.delete(k);
      const nGlobal = incrementer(jour, etape, "global");
      if (nGlobal > maxGlobal(limites, etape)) return { ok: false, motif: "global", restant: 0 };
      const nIp = incrementer(jour, etape, cle);
      const max = maxIp(limites, etape);
      return nIp <= max ? { ok: true, restant: Math.max(0, max - nIp) } : { ok: false, motif: "ip", restant: 0 };
    },
  };
}

/** Compteur partagé (fonction SQL `ma_cible_consommer`) ; en cas d'échec, bascule sur `secours`. */
export function quotaSupabase(client: Pick<SupabaseClient, "rpc">, limites: Limites, secours: Quota): Quota {
  return {
    async consommer(cle, etape) {
      try {
        const { data, error } = await client.rpc("ma_cible_consommer", {
          p_cle: cle,
          p_etape: etape,
          p_max_ip: maxIp(limites, etape),
          p_max_global: maxGlobal(limites, etape),
        });
        const ligne = Array.isArray(data) ? data[0] : data;
        if (error || !ligne || typeof ligne.ok !== "boolean" || ligne.motif === "invalide") throw new Error("quota");
        const restant = Math.max(0, maxIp(limites, etape) - (Number(ligne.n_ip) || 0));
        if (ligne.ok) return { ok: true, restant };
        return { ok: false, motif: ligne.motif === "global" ? "global" : "ip", restant: 0 };
      } catch {
        console.error("[ma-cible]", { code: "quota_secours", etape });
        return secours.consommer(cle, etape);
      }
    },
  };
}
