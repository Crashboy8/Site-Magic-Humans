import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dangerGhost";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 min-h-11";
const buttonVariants: Record<Variant, string> = {
  primary: "bg-accent-strong text-white hover:bg-accent-deep",
  secondary: "border border-ink/25 bg-paper text-ink hover:border-ink/50 hover:bg-sand",
  ghost: "text-ink-soft hover:bg-sand hover:text-ink",
  danger: "border border-danger/30 bg-paper text-danger hover:bg-danger-soft",
  dangerGhost: "text-danger hover:bg-danger-soft",
};

/** Classes d'un bouton, pour un lien externe (<a>) qui doit ressembler à un bouton. */
export function buttonClass(variant: Variant = "primary", className?: string) {
  return cx(buttonBase, buttonVariants[variant], className);
}

export function Button({ variant = "primary", className, ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={cx(buttonBase, buttonVariants[variant], className)} {...props} />;
}

export function ButtonLink({ variant = "primary", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cx(buttonBase, buttonVariants[variant], className)} {...props} />;
}

const fieldClass =
  "w-full rounded-xl border border-ink/20 bg-paper px-4 py-2.5 text-[16px] text-ink placeholder:text-ink-soft/70 focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent/25";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cx(fieldClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cx(fieldClass, "min-h-28 leading-relaxed", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[15px] font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-sm text-ink-soft">{hint}</p>}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("rounded-2xl border border-line bg-paper p-6 shadow-[0_1px_2px_rgba(58,47,36,0.04)]", className)} {...props} />;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "success" | "error"; children: ReactNode }) {
  const tones = {
    info: "border-accent/30 bg-blush text-ink",
    success: "border-sage/30 bg-sage-soft text-ink",
    error: "border-danger/30 bg-danger-soft text-danger",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("rounded-xl border px-4 py-3 text-[15px]", tones[tone])}>
      {children}
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "sage" | "accent"; children: ReactNode }) {
  const tones = {
    neutral: "bg-sand text-ink-soft",
    sage: "bg-sage-soft text-sage",
    accent: "bg-blush text-accent-deep",
  };
  return <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}

/** Petite boussole, emblème de l'outil. */
export function CompassMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      <path d="M20 6 L24 20 L20 34 L16 20 Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <path d="M20 6 L24 20 L16 20 Z" fill="#e2683a" />
      <circle cx="20" cy="20" r="2" fill="currentColor" />
    </svg>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-8 space-y-2">
      {eyebrow && <p className="font-script text-2xl text-accent-strong">{eyebrow}</p>}
      <h1 className="text-4xl italic sm:text-5xl">{title}</h1>
      {children && <div className="max-w-2xl text-[17px] leading-relaxed text-ink-soft">{children}</div>}
    </header>
  );
}

export function formatDate(iso: string | null, withTime = false, locale: "fr" | "en" = "fr"): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}
