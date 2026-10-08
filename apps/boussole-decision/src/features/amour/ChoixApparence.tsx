import { cx } from "@/components/ui";
import { LOVE_TABLE } from "@/content/amour";
import { COULEUR_RELATION, RELATION_COLORS, RELATION_ICONS, type RelationLook } from "@/domain/relationApparence";
import type { RelationColor, RelationIcon } from "@/domain/types";
import { IconeRelation } from "./IconeRelation";

/** Grille d'icônes et de teintes, sous le nom de la relation. */
export function ChoixApparence({ look, onChange }: { look: RelationLook; onChange: (look: RelationLook) => void }) {
  const T = LOVE_TABLE;
  return (
    <div className="mt-2 space-y-2 rounded-xl bg-cream px-1.5 py-2" data-choix-apparence>
      <div>
        <p className="mb-1 flex items-center justify-center gap-1.5 text-xs font-medium text-ink-soft">
          <IconeRelation icone={look.icon} couleur={look.color} taille={14} />
          <span>{T.iconLegend}</span>
        </p>
        <div role="group" aria-label={T.chooseIcon} className="flex flex-wrap justify-center gap-1">
          {RELATION_ICONS.map((icone) => (
            <ChoixIcone key={icone} icone={icone} look={look} onChange={onChange} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-center text-xs font-medium text-ink-soft">{T.colorLegend}</p>
        <div role="group" aria-label={T.chooseColor} className="flex flex-wrap justify-center gap-1.5">
          {RELATION_COLORS.map((couleur) => (
            <ChoixCouleur key={couleur} couleur={couleur} look={look} onChange={onChange} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChoixIcone({
  icone,
  look,
  onChange,
}: {
  icone: RelationIcon;
  look: RelationLook;
  onChange: (look: RelationLook) => void;
}) {
  const actif = look.icon === icone;
  return (
    <button
      type="button"
      aria-pressed={actif}
      aria-label={LOVE_TABLE.icons[icone]}
      onClick={() => onChange({ ...look, icon: icone })}
      className={cx(
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-paper",
        actif ? "ring-2 ring-ink ring-offset-2" : "hover:bg-sand",
      )}
    >
      <IconeRelation icone={icone} couleur={look.color} taille={18} />
    </button>
  );
}

function ChoixCouleur({
  couleur,
  look,
  onChange,
}: {
  couleur: RelationColor;
  look: RelationLook;
  onChange: (look: RelationLook) => void;
}) {
  const actif = look.color === couleur;
  return (
    <button
      type="button"
      aria-pressed={actif}
      aria-label={LOVE_TABLE.colors[couleur]}
      title={LOVE_TABLE.colors[couleur]}
      onClick={() => onChange({ ...look, color: couleur })}
      className={cx("h-8 w-8 rounded-full", actif && "ring-2 ring-ink ring-offset-2")}
      style={{ background: COULEUR_RELATION[couleur] }}
    />
  );
}
