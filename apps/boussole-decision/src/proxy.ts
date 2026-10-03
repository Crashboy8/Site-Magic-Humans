import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, isPublicPath, redirectUrl } from "@/lib/config";

// Rafraîchit la session Supabase à chaque requête et réserve l'outil aux personnes connectées.
export async function proxy(request: NextRequest) {
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
  const signedIn = Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname.replace(/\/$/, "") || "/";

  const redirectTo = (target: string) => {
    const res = NextResponse.redirect(redirectUrl(target, request));
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!signedIn && !isPublicPath(path)) return redirectTo("/connexion/");
  if (signedIn && (path === "/connexion" || path === "/inscription")) return redirectTo("/");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)"],
};
