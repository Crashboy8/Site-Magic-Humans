import { quotaEnCascade, quotaMemoire, quotaSupabase, type QuotaNotion } from "@/lib/notionLien/quota";
import { recupererPageNotion } from "@/lib/notionLien/recuperer";
import { traiterLienNotion } from "@/lib/notionLien/traitement";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Secours en mémoire si la fonction SQL notion_lien_consommer n'existe pas encore.
let memoire: QuotaNotion | undefined;

export async function POST(request: Request): Promise<Response> {
  memoire ??= quotaMemoire();
  const supabase = await supabaseServer();
  return traiterLienNotion(request, {
    env: process.env,
    async utilisateur() {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
    quota: quotaEnCascade(quotaSupabase(supabase), memoire),
    recuperer: (pageId) => recupererPageNotion(pageId, { fetch }),
    // Ni le lien ni le texte : seulement le code, la durée et le nombre de blocs.
    journal: (evenement, donnees) => console.info(evenement, donnees),
  });
}
