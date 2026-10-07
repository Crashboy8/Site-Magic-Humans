import type { Metadata } from "next";
import { PublicFrame } from "@/components/PublicFrame";
import { TargetMark } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const nom = (await getI18n()).t.maCible.commun.nomOutil;
  return { title: { default: nom, template: `%s · ${nom}` } };
}

// Ma Cible a son propre bandeau : le nom de l'outil et une cible, pas ceux de la Boussole.
export default async function MaCibleLayout({ children }: { children: React.ReactNode }) {
  const nom = (await getI18n()).t.maCible.commun.nomOutil;
  return (
    <PublicFrame brand={nom} mark={<TargetMark className="h-8 w-8 text-ink sm:h-9 sm:w-9" />}>
      {children}
    </PublicFrame>
  );
}
