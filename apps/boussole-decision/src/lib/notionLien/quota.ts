// Quota de lecture par lien Notion : 10 par personne et par jour, 300 par jour pour tout le site (cahier D.6).
// La fonction SQL fait foi ; si elle n'existe pas encore, compteur en mémoire de l'instance avec les mêmes limites.
import type { SupabaseClient } from "@supabase/supabase-js";

export const PAR_PERSONNE = 10;
export const PAR_JOUR = 300;

export interface QuotaNotion {
  /** Consomme une lecture pour cette personne. `true` si elle est autorisée. */
  consommer(userId: string): Promise<boolean>;
}

const jourParis = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(d);

/** Compteur en mémoire (secours si la migration n'est pas encore passée). */
export function quotaMemoire(maintenant: () => Date = () => new Date()): QuotaNotion {
  const compteurs = new Map<string, number>();
  let jour = "";
  return {
    async consommer(userId) {
      const j = jourParis(maintenant());
      if (j !== jour) {
        compteurs.clear();
        jour = j;
      }
      const total = [...compteurs.values()].reduce((a, b) => a + b, 0);
      if (total >= PAR_JOUR) return false;
      const n = compteurs.get(userId) ?? 0;
      if (n >= PAR_PERSONNE) return false;
      compteurs.set(userId, n + 1);
      return true;
    },
  };
}

/** Compteur en base (fonction notion_lien_consommer). Renvoie null si la fonction n'existe pas encore. */
export function quotaSupabase(db: SupabaseClient): QuotaNotion {
  return {
    async consommer() {
      const { data, error } = await db.rpc("notion_lien_consommer");
      if (error) {
        if (error.code === "42883" || error.code === "PGRST202") return null as unknown as boolean;
        throw error;
      }
      return data === true;
    },
  };
}

/** Base d'abord, mémoire si la fonction n'existe pas encore. */
export function quotaEnCascade(base: QuotaNotion, memoire: QuotaNotion): QuotaNotion {
  return {
    async consommer(userId) {
      try {
        const reponse = await base.consommer(userId);
        if (reponse === null) return memoire.consommer(userId);
        return reponse;
      } catch {
        return memoire.consommer(userId);
      }
    },
  };
}
