import { CompassMark } from "@/components/ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-10 sm:py-16">
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        <CompassMark className="h-12 w-12 text-ink" />
        <p className="font-serif text-3xl italic">Boussole de décision</p>
        <p className="text-sm uppercase tracking-[0.14em] text-ink-soft">Magic Humans · Talent Unique</p>
      </header>
      <main className="w-full max-w-md">{children}</main>
      <footer className="mt-auto pt-10 text-center text-sm text-ink-soft">
        <a className="underline-offset-4 hover:underline" href="https://www.magichumans.com/">
          ← Retour au site Magic Humans
        </a>
      </footer>
    </div>
  );
}
