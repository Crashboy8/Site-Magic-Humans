import { couleurJauge, espacesFins } from "@/domain/relationApparence";

/** Barre arrondie sous un pourcentage. La couleur reprend le seuil, le chiffre reste lisible à côté. */
export function JaugeScore({ valeur }: { valeur: number }) {
  const n = Math.round(valeur);
  const largeur = Math.min(100, Math.max(0, n));
  return (
    <div
      role="meter"
      aria-valuenow={n}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={espacesFins(`Alignement : ${n} %`)}
      className="mt-2 h-2.5 overflow-hidden rounded-full bg-sand"
    >
      <div className="h-full rounded-full" style={{ width: `${largeur}%`, background: couleurJauge(n) }} />
    </div>
  );
}
