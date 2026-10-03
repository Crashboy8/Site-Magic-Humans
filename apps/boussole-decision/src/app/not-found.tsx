import { ButtonLink, CompassMark } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <CompassMark className="h-14 w-14 text-ink" />
      <h1 className="text-4xl italic">Cette page est introuvable</h1>
      <p className="max-w-md text-ink-soft">Elle n&apos;existe pas, ou tu n&apos;as pas accès à son contenu.</p>
      <ButtonLink href="/">Retour à mes profils</ButtonLink>
    </main>
  );
}
