import type { Metadata } from "next";
import { checkInvitationCode } from "@/data/repository";
import { codeClient } from "@/domain/client";
import { ActiverCode, DejaClient, RejoindreForm } from "@/features/client/Rejoindre";
import { getI18n } from "@/i18n/server";
import { getCurrentUser, supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.client.meta.titre };
}

/**
 * Le lien envoyé par Pierre : magichumans.com/client/CODE (ou /boussole-decision/client/?code=CODE).
 * Sans compte : un seul écran (prénom + email), puis le lien reçu par mail.
 * Déjà connecté : un bouton active le code sur ce compte.
 */
export default async function ClientPage({ searchParams }: PageProps<"/client">) {
  const { code: brut, lien } = await searchParams;
  const code = codeClient(typeof brut === "string" ? brut : "");
  const user = await getCurrentUser();

  if (user && !user.isGuest) {
    if (user.invitationCode) return <DejaClient />;
    return <ActiverCode code={code} email={user.email} />;
  }

  // Retour d'un lien expiré : le code a déjà servi à créer le compte, on ne le signale pas comme refusé.
  const lienExpire = lien === "expire";
  const codeOk = code ? lienExpire || (await checkInvitationCode(await supabaseServer(), code).catch(() => false)) : false;
  return <RejoindreForm code={code} codeOk={codeOk} lienExpire={lienExpire} />;
}
