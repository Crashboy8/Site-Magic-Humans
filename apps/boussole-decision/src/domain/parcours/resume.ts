// Ce que « Où j'en suis ? » apporte à la progression du compte : ses points et le code du niveau Réussir dans le Plaisir.
import type { ResumeParcours } from "@/domain/progression";
import { calculerPosition, niveauAffiche, pointsGagnes } from "./position";
import type { Profil } from "./profil";
import type { ParcoursPublic } from "./types";

/** 0 point et pas de niveau (point de départ) sans position, ou tant que rien n'est répondu. */
export function resumeParcours(data: ParcoursPublic, profil: Profil | null): ResumeParcours {
  const position = profil ? calculerPosition(data, profil) : null;
  if (!position) return { points: 0, niveau: null };
  return { points: pointsGagnes(position), niveau: niveauAffiche(data, position).actuel?.code ?? null };
}
