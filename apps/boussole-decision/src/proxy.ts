import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { codeClient } from "@/domain/client";
import { LOCALE_COOKIE, isLocale } from "@/i18n/config";
import { SUPABASE_KEY, SUPABASE_URL, isPublicPath, redirectUrl, suiteSure } from "@/lib/config";

// Rafraîchit la session Supabase à chaque requête et réserve l'outil aux personnes connectées.
export async function proxy(request: NextRequest) {
  // ?lang=fr|en|es (lien du Quiz Amour ou du site) : la langue choisie dans le quiz devient celle de la Boussole.
  // Elle est posée sur la requête (la page la lit tout de suite) et gardée dans le cookie habituel.
  const langue = request.nextUrl.searchParams.get("lang");
  const nouvelleLangue = isLocale(langue) && request.cookies.get(LOCALE_COOKIE)?.value !== langue ? langue : null;
  if (nouvelleLangue) request.cookies.set(LOCALE_COOKIE, nouvelleLangue);
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  if (nouvelleLangue) response.cookies.set(LOCALE_COOKIE, nouvelleLangue, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const signedIn = Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname.replace(/\/$/, "") || "/";

  const redirectTo = (target: string) => {
    const res = NextResponse.redirect(redirectUrl(target, request));
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  // Sans session : l'accueil propose les deux portes d'entrée ; les autres pages demandent de se connecter.
  if (!signedIn && path === "/") return redirectTo("/bienvenue/");
  // Lien d'activation (/mon-espace/activer/?code=…) sans session : la page du code, avec le code déjà rempli.
  if (!signedIn && path === "/mon-espace/activer") {
    const code = codeClient(request.nextUrl.searchParams.get("code"));
    return redirectTo(code ? `/client/?code=${encodeURIComponent(code)}` : "/client/");
  }
  if (!signedIn && path.startsWith("/mon-espace")) {
    return redirectTo(`/connexion/?suite=${encodeURIComponent(request.nextUrl.pathname)}`);
  }
  if (!signedIn && !isPublicPath(path)) return redirectTo("/connexion/");
  if (signedIn && (path === "/connexion" || path === "/inscription" || path === "/bienvenue")) {
    return redirectTo(suiteSure(request.nextUrl.searchParams.get("suite")) ?? "/");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)"],
};
