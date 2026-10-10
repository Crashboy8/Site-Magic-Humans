import { NextResponse, type NextRequest } from "next/server";
import { exporterMesDonnees, nomFichierExport } from "@/features/vip/export";
import { redirectUrl } from "@/lib/config";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// « Télécharger mes données (JSON) » depuis la page Tes données : tout ce qui est gardé pour le compte connecté.
export async function GET(request: NextRequest) {
  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (typeof userId !== "string" || !userId) {
    return NextResponse.redirect(redirectUrl(`/connexion/?suite=${encodeURIComponent("/tes-donnees/")}`, request));
  }
  const maintenant = new Date();
  const contenu = await exporterMesDonnees(supabase, userId, maintenant);
  return new NextResponse(JSON.stringify(contenu, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomFichierExport(maintenant)}"`,
      "Cache-Control": "no-store",
    },
  });
}
