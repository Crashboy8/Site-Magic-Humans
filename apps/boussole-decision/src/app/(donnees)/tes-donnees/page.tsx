import type { Metadata } from "next";
import type { ReactNode } from "react";
import { formatDate } from "@/components/ui";
import { Icone, type NomIcone } from "@/features/espace/Icones";
import { SupprimerCompte } from "@/features/fiche/SupprimerCompte";
import { CarteAccord } from "@/features/vip/CarteAccord";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.vip.donnees.meta };
}

function Bloc({ icone, titre, id, children }: { icone: NomIcone; titre: string; id: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-[14px] border border-line bg-white p-5 sm:p-6">
      <h2 id={id} className="flex items-center gap-2.5 font-serif text-[24px] italic leading-tight sm:text-[26px]">
        <Icone nom={icone} className="h-6 w-6 shrink-0 text-corail" />
        {titre}
      </h2>
      <div className="mt-3 text-base leading-relaxed text-ink">{children}</div>
    </section>
  );
}

function Liste({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5">
          <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-corail" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Page publique « Tes données » : ce qu'on garde, où, qui y a accès. Connecté·e : l'accord pour la fiche,
 * l'export JSON de toutes ses données et la suppression du compte.
 */
export default async function TesDonneesPage({ searchParams }: PageProps<"/tes-donnees">) {
  const { t, locale } = await getI18n();
  const D = t.vip.donnees;
  const N = t.vip.accord.notices;
  const user = await getCurrentUser();
  const { accord } = await searchParams;
  const notice = accord === "copiee" ? N.copiee : accord === "ok" ? N.ok : accord === "plus_tard" ? N.plusTard : null;
  const connexion = `/boussole-decision/connexion/?suite=${encodeURIComponent("/tes-donnees/")}`;

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-corail">{D.surtitre}</p>
        <h1 className="font-serif text-4xl italic leading-tight">{D.titre}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink-soft">{D.intro}</p>
      </header>

      {notice && (
        <p role="status" className="rounded-xl border border-sage/30 bg-sage-soft px-4 py-3 text-base text-ink">
          {notice}
        </p>
      )}

      <Bloc icone="dossier" titre={D.garde.titre} id="garde">
        <Liste items={D.garde.liste} />
      </Bloc>
      <Bloc icone="cadenas" titre={D.pasGarde.titre} id="pas-garde">
        <Liste items={D.pasGarde.liste} />
      </Bloc>
      <div className="grid gap-6 sm:grid-cols-2">
        <Bloc icone="drapeau" titre={D.ou.titre} id="ou">
          <p className="font-medium">{D.ou.texte}</p>
        </Bloc>
        <Bloc icone="cle" titre={D.qui.titre} id="qui">
          <p className="font-medium">{D.qui.texte}</p>
          <p className="mt-2 text-ink-soft">{D.qui.detail}</p>
        </Bloc>
      </div>

      {user && !user.isGuest && user.consentementFicheAt !== undefined && (
        user.consentementFicheAt ? (
          <Bloc icone="coche" titre={D.accord.titre} id="accord">
            <p>{D.accord.donne(formatDate(user.consentementFicheAt, false, locale))}</p>
          </Bloc>
        ) : (
          <div className="space-y-2">
            <p className="text-base text-ink-soft">{D.accord.pasDonne}</p>
            <CarteAccord retour="donnees" />
          </div>
        )
      )}

      <Bloc icone="document" titre={D.export.titre} id="export">
        {user ? (
          <>
            <p>{D.export.texte}</p>
            <a
              href="/boussole-decision/mon-espace/donnees/export/"
              download
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent-strong px-6 text-base font-medium text-white sm:w-auto"
            >
              <Icone nom="dossier" className="h-5 w-5 shrink-0" />
              {D.export.bouton}
            </a>
          </>
        ) : (
          <>
            <p>{D.connexion.texte}</p>
            <a href={connexion} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent-strong px-6 text-base font-medium text-white sm:w-auto">
              {D.connexion.bouton}
            </a>
          </>
        )}
      </Bloc>

      <section aria-labelledby="suppression" className="rounded-[14px] border border-danger/30 bg-white p-5 sm:p-6">
        <h2 id="suppression" className="flex items-center gap-2.5 font-serif text-[24px] italic leading-tight text-danger sm:text-[26px]">
          <Icone nom="poubelle" className="h-6 w-6 shrink-0" />
          {D.suppression.titre}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink">{D.suppression.texte}</p>
        <div className="mt-4">
          {!user ? (
            <a href={connexion} className="text-base font-medium text-link underline underline-offset-4">
              {D.connexion.bouton}
            </a>
          ) : user.role === "coach" ? (
            <p className="text-base text-ink-soft">{D.suppression.coach}</p>
          ) : (
            <SupprimerCompte sansTitre consigne={D.suppression.consigne(t.espace.compte.mot)} />
          )}
        </div>
      </section>

      {user && (
        <p className="text-center text-[15px]">
          <a href="/boussole-decision/mon-espace/" className="font-medium text-link underline underline-offset-4">
            {D.retour}
          </a>
        </p>
      )}
    </article>
  );
}
