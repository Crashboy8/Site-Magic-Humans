import type { AppUser } from "@/domain/types";
import { Icone } from "@/features/espace/Icones";
import { getI18n } from "@/i18n/server";
import { supabaseServer } from "@/lib/supabase/server";
import { lireAccesClient } from "./acces";

/** « Accès client · avec Pierre », sur une ligne sous le bonjour de Mon espace. Rien pour les autres comptes. */
export async function BadgeClient({ user }: { user: AppUser }) {
  if (user.isGuest || !user.invitationCode) return null;
  const { t } = await getI18n();
  const acces = await lireAccesClient(await supabaseServer(), user.invitationCode);
  if (!acces) return null;
  const B = t.client.espace;
  return (
    <p className="inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage-soft px-3 py-1 text-[15px] text-sage">
      <Icone nom="coche" className="h-4 w-4 shrink-0" />
      <span className="font-medium">{B.badge}</span>
      <span aria-hidden="true">·</span>
      <span>{B.avec(acces.coachPrenom)}</span>
    </p>
  );
}

/** Message d'arrivée après l'activation du code (?client=bienvenue ou ?client=code). */
export async function NoticeClient({ etat }: { etat: string | string[] | undefined }) {
  if (etat !== "bienvenue" && etat !== "code") return null;
  const B = (await getI18n()).t.client.espace;
  const ok = etat === "bienvenue";
  return (
    <p
      role="status"
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-base text-ink ${ok ? "border-sage/30 bg-sage-soft" : "border-miel/30 bg-miel-soft"}`}
    >
      <Icone nom={ok ? "coche" : "cle"} className={`h-5 w-5 shrink-0 ${ok ? "text-sage" : "text-miel"}`} />
      {ok ? B.bienvenue : B.codeRefuse}
    </p>
  );
}

/** Pour un compte qui n'est pas encore client : une ligne discrète vers la page du code. */
export async function LienCodeClient({ user }: { user: AppUser }) {
  if (user.isGuest || user.invitationCode || user.role === "coach") return null;
  const B = (await getI18n()).t.client.espace;
  return (
    <p className="flex items-center gap-2 text-base text-ink-soft">
      <Icone nom="cle" className="h-5 w-5 shrink-0 text-corail" />
      {B.aUnCode}{" "}
      <a href="/boussole-decision/client/" className="font-medium text-link underline underline-offset-4">
        {B.activer}
      </a>
    </p>
  );
}
