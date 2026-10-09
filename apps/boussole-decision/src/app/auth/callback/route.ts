import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ACCUEIL_CONNECTE, redirectUrl } from "@/lib/config";
import { claimPendingGuestTransfer } from "@/lib/guestTransfer";
import { supabaseServer } from "@/lib/supabase/server";

// Arrivée depuis un lien reçu par email (confirmation, lien magique, mot de passe oublié).
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = params.get("next") ?? ACCUEIL_CONNECTE;
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

  // Connexion par lien depuis un essai : l'essai est ajouté au compte.
  const claimed = ok && type !== "recovery" ? await claimPendingGuestTransfer(supabase) : 0;
  if (claimed > 0) return NextResponse.redirect(redirectUrl("/?essai=ajoute", request));
  const target = ok ? (type === "recovery" ? "/compte/mot-de-passe/" : safeNext) : "/connexion/?erreur=lien";
  return NextResponse.redirect(redirectUrl(target, request));
}
