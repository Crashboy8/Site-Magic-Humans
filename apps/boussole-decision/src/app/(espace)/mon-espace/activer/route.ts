import { NextResponse, type NextRequest } from "next/server";
import { codeClient } from "@/domain/client";
import { activerEtOrienter } from "@/features/client/acces";
import { redirectUrl } from "@/lib/config";
import { supabaseServer } from "@/lib/supabase/server";

// Arrivée par le lien reçu après la page /client/, ou par le lien d'activation copié par Pierre (?code=…) :
// active le code sur le compte, puis ouvre l'import de la fiche (ou Mon espace si une fiche préparée attend l'accord).
// Sans session : la page du code, avec le code déjà rempli.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = codeClient(params.get("code"));
  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId || claims?.claims?.is_anonymous) {
    return NextResponse.redirect(redirectUrl(code ? `/client/?code=${encodeURIComponent(code)}` : "/client/", request));
  }
  const suite = await activerEtOrienter(supabase, String(userId), code, params.get("prenom") ?? "");
  return NextResponse.redirect(redirectUrl(suite, request));
}
