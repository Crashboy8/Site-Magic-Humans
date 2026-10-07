// Reprise d'une génération réussie : quelques minutes, pour qu'un « Réessayer » après une connexion coupée
// retrouve le résultat sans nouvel appel au modèle ni nouveau quota.
import type { SupabaseClient } from "@supabase/supabase-js";

/** Durée de garde d'un résultat réussi dont le navigateur n'a pas reçu la réponse. */
export const DUREE_REPRISE_MS = 20 * 60_000;

export interface Reprise {
  lire(cle: string): Promise<unknown | null>;
  garder(cle: string, corps: unknown): Promise<void>;
}

export function repriseMemoire(maintenant: () => Date, dureeMs = DUREE_REPRISE_MS): Reprise {
  const gardes = new Map<string, { corps: unknown; expire: number }>();
  return {
    async lire(cle) {
      const garde = gardes.get(cle);
      if (!garde || garde.expire <= maintenant().getTime()) {
        gardes.delete(cle);
        return null;
      }
      return garde.corps;
    },
    async garder(cle, corps) {
      gardes.set(cle, { corps, expire: maintenant().getTime() + dureeMs });
    },
  };
}

/** Mémoire de l'instance d'abord (réponse immédiate), puis la base si elle répond. */
export function repriseEnCascade(memoire: Reprise, distante: Reprise): Reprise {
  return {
    async lire(cle) {
      const local = await memoire.lire(cle);
      if (local) return local;
      try {
        const loin = await distante.lire(cle);
        if (loin) await memoire.garder(cle, loin);
        return loin;
      } catch {
        console.error("[ma-cible]", { code: "reprise_secours" });
        return null;
      }
    },
    async garder(cle, corps) {
      await memoire.garder(cle, corps);
      try {
        await distante.garder(cle, corps);
      } catch {
        console.error("[ma-cible]", { code: "reprise_secours" });
      }
    },
  };
}

type LigneReprise = { corps: unknown; expire: string };

/** Table `ma_cible_reprise`, lue avec la clé secrète. Invisible pour les rôles anon et authenticated. */
export function repriseSupabase(client: Pick<SupabaseClient, "from">, maintenant: () => Date = () => new Date()): Reprise {
  return {
    async lire(cle) {
      const { data, error } = await client.from("ma_cible_reprise").select("corps, expire").eq("cle", cle).maybeSingle();
      if (error) throw new Error("reprise");
      const ligne = data as LigneReprise | null;
      if (!ligne || new Date(ligne.expire).getTime() <= maintenant().getTime()) return null;
      return ligne.corps;
    },
    async garder(cle, corps) {
      const expire = new Date(maintenant().getTime() + DUREE_REPRISE_MS).toISOString();
      const { error } = await client.from("ma_cible_reprise").upsert({ cle, corps, expire });
      if (error) throw new Error("reprise");
      await client.from("ma_cible_reprise").delete().lt("expire", maintenant().toISOString());
    },
  };
}
