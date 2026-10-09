"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkInvitationCode } from "@/data/repository";
import { codeClient, prenomPropre, suiteActivation } from "@/domain/client";
import { getI18n } from "@/i18n/server";
import { absoluteUrl } from "@/lib/config";
import { rememberGuestTransfer } from "@/lib/guestTransfer";
import { supabaseServer } from "@/lib/supabase/server";
import { activerEtOrienter } from "./acces";

export interface EtatRejoindre {
  envoye?: string;
  erreur?: string;
  champs?: { code?: string; prenom?: string; email?: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texte(fd: FormData, cle: string) {
  return String(fd.get(cle) ?? "").trim();
}

/**
 * Écran unique du lien client : code + prénom + email. On envoie un lien de connexion par mail
 * (compte créé au passage s'il n'existe pas, avec le code : il devient client et Pierre est son coach).
 * Le lien ramène sur /mon-espace/activer/, qui active le code et ouvre l'import de la fiche.
 */
export async function rejoindreAction(_prev: EtatRejoindre, fd: FormData): Promise<EtatRejoindre> {
  const { locale, t } = await getI18n();
  const E = t.client.erreurs;
  const code = codeClient(texte(fd, "code"));
  const prenom = prenomPropre(texte(fd, "prenom"));
  const email = texte(fd, "email").toLowerCase().slice(0, 200);

  const champs: EtatRejoindre["champs"] = {};
  if (!code) champs.code = E.code;
  if (!prenom) champs.prenom = E.prenom;
  if (!EMAIL_RE.test(email)) champs.email = E.email;
  if (Object.keys(champs).length) return { champs };

  const supabase = await supabaseServer();
  // Un code à usage unique ne passe plus la vérification une fois le compte créé (lien renvoyé, ouvert sur un autre
  // appareil…). Dans ce cas on envoie quand même un lien, mais seulement si le compte existe déjà : il est déjà client.
  const codeLibre = await checkInvitationCode(supabase, code).catch(() => false);

  // Essai sans compte en cours : il sera ajouté au compte une fois connecté (même règle que la connexion).
  const { data: claims } = await supabase.auth.getClaims();
  if (claims?.claims?.is_anonymous) {
    const { data: jeton } = await supabase.rpc("create_guest_transfer");
    if (jeton) await rememberGuestTransfer(String(jeton));
  }

  const suite = suiteActivation(code, prenom);
  const origine = (await headers()).get("origin") ?? undefined;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: codeLibre,
      // Lus par handle_new_user à la création du compte ; lang : langue des emails.
      data: codeLibre ? { invitation_code: code, first_name: prenom, lang: locale } : undefined,
      emailRedirectTo: absoluteUrl(`/auth/callback/?next=${encodeURIComponent(suite)}`, origine),
    },
  });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("rate limit") || m.includes("security purposes")) return { erreur: E.tropVite };
    if (m.includes("database error")) return { champs: { code: E.code } };
    if (!codeLibre && (m.includes("signups not allowed") || m.includes("user not found") || m.includes("otp_disabled"))) {
      return { champs: { code: E.code } };
    }
    return { erreur: E.general };
  }
  return { envoye: email };
}

/** Déjà connecté : un bouton active le code sur ce compte, puis ouvre l'import de la fiche (ou Mon espace). */
export async function activerAction(_prev: EtatRejoindre, fd: FormData): Promise<EtatRejoindre> {
  const { t } = await getI18n();
  const code = codeClient(texte(fd, "code"));
  if (!code) return { champs: { code: t.client.erreurs.code } };
  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId || claims?.claims?.is_anonymous) redirect(`/client/?code=${encodeURIComponent(code)}`);
  const suite = await activerEtOrienter(supabase, String(userId), code, "");
  if (suite.startsWith("/mon-espace/?client=code")) return { champs: { code: t.client.erreurs.code } };
  redirect(suite);
}

/** « Ce n'est pas toi ? » : déconnexion, puis retour sur la même page avec le même code. */
export async function changerDeCompteAction(fd: FormData): Promise<void> {
  const code = codeClient(texte(fd, "code"));
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect(code ? `/client/?code=${encodeURIComponent(code)}` : "/client/");
}
