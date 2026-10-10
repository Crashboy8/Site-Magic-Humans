import type { Metadata } from "next";
import { PublicFrame } from "@/components/PublicFrame";
import { TargetMark } from "@/components/ui";
import { getI18n } from "@/i18n/server";
import "@/features/maCible/impression.css";

export async function generateMetadata(): Promise<Metadata> {
  const nom = (await getI18n()).t.maCible.commun.nomOutil;
  return { title: { default: nom, template: `%s · ${nom}` } };
}

// Bandeau propre à l'outil : son nom, sa phrase, une cible. Pas ceux de la Boussole.
export default async function MaCibleLayout({ children }: { children: React.ReactNode }) {
  const { nomOutil, sousTitre } = (await getI18n()).t.maCible.commun;
  return (
    <PublicFrame large brand={nomOutil} tagline={sousTitre} mark={<TargetMark className="h-8 w-8 shrink-0 text-ink sm:h-9 sm:w-9" />}>
      <div className="typo-soignee">{children}</div>
    </PublicFrame>
  );
}
