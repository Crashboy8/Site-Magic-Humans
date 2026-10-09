// « Où j'en suis ? » : petites briques visuelles partagées par les écrans (client).
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/components/ui";
import { Icone, Traces, type NomIcone } from "@/features/espace/Icones";
import { COULEURS_FETE, TEINTES } from "./theme";

const TAILLES = {
  sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
  md: "h-11 w-11 [&_svg]:h-6 [&_svg]:w-6",
  lg: "h-16 w-16 [&_svg]:h-8 [&_svg]:w-8",
} as const;

/** Une icône dans un rond, aux couleurs de la teinte posée plus haut (variables --oj-*). */
export function Pastille({ nom, taille = "md", plein = false, className, style }: { nom: NomIcone; taille?: keyof typeof TAILLES; plein?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        plein ? "bg-(--oj-forte) text-white shadow-[0_6px_16px_-6px_var(--oj-forte)]" : "bg-(--oj-fond) text-(--oj-texte)",
        TAILLES[taille],
        className,
      )}
      style={style}
    >
      <Icone nom={nom} />
    </span>
  );
}

/** Barre de progression : se remplit en douceur. */
export function Barre({ pourcent, label, className, couleur = "var(--oj-forte)" }: { pourcent: number; label: string; className?: string; couleur?: string }) {
  const p = Math.max(0, Math.min(100, Math.round(pourcent)));
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p} aria-label={label} className={cx("h-2.5 overflow-hidden rounded-full bg-sand", className)}>
      <span className="oj-barre block h-full rounded-full" style={{ width: `${p}%`, background: couleur }} />
    </div>
  );
}

/** Un nombre qui défile jusqu'à sa valeur. Si la personne préfère moins de mouvement : tout de suite. */
export function useCompteur(cible: number, depart = cible, duree = 900): number {
  const [valeur, setValeur] = useState(depart);
  const affiche = useRef(depart);
  useEffect(() => {
    const debut = affiche.current;
    if (debut === cible) return;
    const reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const t0 = performance.now();
    let id = 0;
    const pas = (t: number) => {
      const k = reduit ? 1 : Math.min(1, (t - t0) / duree);
      const v = Math.round(debut + (cible - debut) * (1 - (1 - k) ** 3));
      affiche.current = v;
      setValeur(v);
      if (k < 1) id = requestAnimationFrame(pas);
    };
    id = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(id);
  }, [cible, duree]);
  return valeur;
}

export function Compteur({ valeur, depart = 0 }: { valeur: number; depart?: number }) {
  const v = useCompteur(valeur, depart);
  return (
    <>
      <span aria-hidden="true" className="tabular-nums">
        {v}
      </span>
      <span className="sr-only">{valeur}</span>
    </>
  );
}

/** Une pluie de confettis aux couleurs des branches. Positions calculées : identiques au serveur et au navigateur. */
export function Confettis({ nombre = 30 }: { nombre?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: nombre }, (_, i) => {
        const angle = (i / nombre) * Math.PI * 2 + (i % 3) * 0.4;
        const portee = 120 + ((i * 37) % 110);
        const style = {
          "--c": COULEURS_FETE[i % COULEURS_FETE.length],
          "--dx": `${Math.round(Math.cos(angle) * portee)}px`,
          "--dy": `${Math.round(Math.sin(angle) * portee * 0.8 + 70)}px`,
          "--rot": `${(i * 53) % 540}deg`,
          "--d": `${(i % 6) * 45}ms`,
        } as CSSProperties;
        return <span key={i} className="oj-confetti" style={style} />;
      })}
    </div>
  );
}

/** Une étiquette arrondie, sur la même ligne que son icône. */
export function Puce({ icone, children, className }: { icone?: NomIcone; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold leading-none", className)}>
      {icone && <Icone nom={icone} className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </span>
  );
}

/** Rayons du soleil de l'Ikigai et des médailles. */
export function Rayons({ className, couleur = "#F5E1AE" }: { className?: string; couleur?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d="M50 2 L54 20 L46 20 Z" style={{ fill: couleur }} transform={`rotate(${i * 30} 50 50)`} />
      ))}
    </svg>
  );
}

/** Le chemin, du tronc commun à l'Ikigai : une étape par couleur de branche. SVG, pas d'image. */
export function DecorParcours({ className }: { className?: string }) {
  const etapes = [
    { x: 30, y: 96, c: TEINTES.tronc.forte, icone: "ampoule" },
    { x: 118, y: 54, c: TEINTES.tronc.forte, icone: "boussole" },
    { x: 210, y: 82, c: TEINTES.passerelle.forte, icone: "pont" },
    { x: 302, y: 102, c: TEINTES.entrepreneur.forte, icone: "cibleur" },
    { x: 394, y: 64, c: TEINTES.salarie.forte, icone: "mallette" },
    { x: 482, y: 44, c: TEINTES.soi.forte, icone: "coeur" },
  ] as const;
  return (
    <svg viewBox="0 0 600 140" className={className} aria-hidden="true">
      <path
        d="M30 96 C 62 64, 88 50, 118 54 S 176 84, 210 82 S 268 104, 302 102 S 362 66, 394 64 S 452 40, 482 44 S 540 56, 562 60"
        fill="none"
        stroke="#E3D5BF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="1 12"
      />
      {etapes.map((e, i) => (
        <g key={e.x} className="oj-pop" style={{ "--d": `${i * 110}ms`, transformBox: "fill-box", transformOrigin: "center" } as CSSProperties}>
          <circle cx={e.x} cy={e.y} r="17" fill="#FFFFFF" />
          <circle cx={e.x} cy={e.y} r="13" fill={e.c} />
          <svg x={e.x - 8} y={e.y - 8} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Traces nom={e.icone} />
          </svg>
        </g>
      ))}
      <g className="oj-pop" style={{ "--d": "720ms", transformBox: "fill-box", transformOrigin: "center" } as CSSProperties}>
        <circle cx="562" cy="60" r="27" fill="#FFF5D9" />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d="M562 30 L565 40 L559 40 Z" fill="#E0A526" transform={`rotate(${i * 36} 562 60)`} />
        ))}
        <circle cx="562" cy="60" r="15" fill="#E0A526" />
        <circle cx="557" cy="55" r="5" fill="#FFE9A8" />
      </g>
    </svg>
  );
}
