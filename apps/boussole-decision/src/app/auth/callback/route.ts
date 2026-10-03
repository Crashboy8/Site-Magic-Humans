import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { redirectUrl } from "@/lib/config";
import { supabaseServer } from "@/lib/supabase/server";

// Arrivée depuis un lien reçu par email (confirmation, lien magique, mot de passe oublié).
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = params.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const supabase = await supabaseServer();
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  const target = ok ? (type === "recovery" ? "/compte/mot-de-passe/" : safeNext) : "/connexion/?erreur=lien";
  return NextResponse.redirect(redirectUrl(target, request));
}
