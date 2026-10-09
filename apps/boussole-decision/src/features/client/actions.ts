"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkInvitationCode } from "@/data/repository";
import { codeClient, prenomPropre, suiteActivation } from "@/domain/client";
import { getI18n } from "@/i18n/server";
import { absoluteUrl } from "@/lib/config";
import { claimPendingGuestTransfer, rememberGuestTransfer } from "@/lib/guestTransfer";
import { supabaseServer } from "@/lib/supabase/server";
import { activerEtOrienter } from "./acces";

export interface EtatRejoindre {
  envoye?: string;
  erreur?: string;
  champs?: { code?: string; prenom?: string; email?: string; motDePasse?: string };
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
  // Facultatif : « Je préfère un mot de passe ». Vide = lien par mail.
  const motDePasse = String(fd.get("mot_de_passe") ?? "");

  const champs: EtatRejoindre["champs"] = {};
  if (!code) champs.code = E.code;
  if (!prenom) champs.prenom = E.prenom;
  if (!EMAIL_RE.test(email)) champs.email = E.email;
  if (motDePasse && motDePasse.length < 8) champs.motDePasse = E.motDePasseCourt;
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
  const lienRetour = absoluteUrl(`/auth/callback/?next=${encodeURIComponent(suite)}`, origine);

  if (motDePasse) return inscriptionAvecMotDePasse(supabase, { code, prenom, email, motDePasse, codeLibre, locale, suite, lienRetour, E });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: codeLibre,
      // Lus par handle_new_user à la création du compte ; lang : langue des emails.
      // sans_mot_de_passe : Mon espace propose ensuite d'en créer un (facultatif).
      data: codeLibre ? { invitation_code: code, first_name: prenom, lang: locale, sans_mot_de_passe: true } : undefined,
      emailRedirectTo: lienRetour,
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

type Supabase = Awaited<ReturnType<typeof supabaseServer>>;

/**
 * Variante « Je préfère un mot de passe » : inscription classique (email à confirmer, même lien de retour).
 * Compte déjà existant (ou code déjà servi) : connexion avec ce mot de passe, puis activation du code.
 */
async function inscriptionAvecMotDePasse(
  supabase: Supabase,
  v: {
    code: string;
    prenom: string;
    email: string;
    motDePasse: string;
    codeLibre: boolean;
    locale: string;
    suite: string;
    lienRetour: string;
    E: Awaited<ReturnType<typeof getI18n>>["t"]["client"]["erreurs"];
  },
): Promise<EtatRejoindre> {
  const { E } = v;
  const seConnecter = async (): Promise<EtatRejoindre> => {
    const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.motDePasse });
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("email not confirmed")) return { envoye: v.email };
      if (m.includes("rate limit")) return { erreur: E.tropVite };
      return v.codeLibre ? { champs: { motDePasse: E.motDePasseFaux } } : { champs: { code: E.code } };
    }
    await claimPendingGuestTransfer(supabase);
    redirect(v.suite);
  };

  if (!v.codeLibre) return seConnecter();

  const { data, error } = await supabase.auth.signUp({
    email: v.email,
    password: v.motDePasse,
    options: {
      data: { invitation_code: v.code, first_name: v.prenom, lang: v.locale },
      emailRedirectTo: v.lienRetour,
    },
  });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("already registered") || m.includes("already been registered")) return seConnecter();
    if (m.includes("password")) return { champs: { motDePasse: E.motDePasseCourt } };
    if (m.includes("rate limit") || m.includes("security purposes")) return { erreur: E.tropVite };
    if (m.includes("database error")) return { champs: { code: E.code } };
    return { erreur: E.general };
  }
  // Adresse déjà utilisée : Supabase répond sans erreur mais sans identité. On tente la connexion.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) return seConnecter();
  if (data.session) {
    await claimPendingGuestTransfer(supabase);
    redirect(v.suite);
  }
  return { envoye: v.email };
}

/** Mon espace : « Créer un mot de passe (facultatif) » pour un compte ouvert avec un lien par mail. */
export async function creerMotDePasseAction(_prev: { ok?: boolean; erreur?: string }, fd: FormData): Promise<{ ok?: boolean; erreur?: string }> {
  const { t } = await getI18n();
  const motDePasse = String(fd.get("mot_de_passe") ?? "");
  if (motDePasse.length < 8) return { erreur: t.client.erreurs.motDePasseCourt };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({ password: motDePasse, data: { sans_mot_de_passe: false } });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("password should") || m.includes("weak")) return { erreur: t.client.erreurs.motDePasseCourt };
    if (m.includes("different from the old")) return { ok: true };
    return { erreur: t.client.motDePasse.erreur };
  }
  return { ok: true };
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
