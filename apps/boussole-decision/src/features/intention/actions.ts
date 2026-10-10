"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

/** Bouton « Traitée » de la page coach/intentions (et retour en arrière). La base vérifie le rôle coach. */
export async function marquerTraiteeAction(id: string, traitee: boolean): Promise<{ ok: boolean }> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("marquer_intention_traitee", { p_id: id, p_traitee: traitee });
  if (error || data !== true) return { ok: false };
  revalidatePath("/coach/intentions/");
  return { ok: true };
}
