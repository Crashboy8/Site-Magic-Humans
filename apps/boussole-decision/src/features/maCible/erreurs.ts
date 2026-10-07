// Messages d'erreur des champs et de l'API. Fonctions pures, textes dans maCible.ts.
import type { ErreurChamp } from "@/domain/maCible/entree";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import type { CodeErreur } from "./api";

/** Identifiant HTML d'un champ : `talent.mecanisme` devient `champ-talent-mecanisme`. */
export const idChamp = (champ: string) => `champ-${champ.replace(/[^a-zA-Z0-9]+/g, "-")}`;

export function messageChamp(e: ErreurChamp, M: MaCibleMessages): string {
  if (e.champ === "terrain.marche") return M.validation.marche;
  if (e.champ === "terrain.offre" && e.code === "requis") return M.validation.offreOuClients;
  if (e.code === "trop_court") return M.validation.tropCourt(e.min ?? 0);
  if (e.code === "trop_long") return M.validation.tropLong(e.max ?? 0);
  return M.validation.requis;
}

/** Phrase courte affichée à côté du bouton quand la validation échoue. */
export function messagePresBouton(e: ErreurChamp, label: string, M: MaCibleMessages): string {
  if (e.champ === "terrain.marche" || e.code === "trop_court" || e.code === "trop_long") return messageChamp(e, M);
  return M.validation.presBouton(label);
}

/** Texte d'erreur d'un appel API. */
export function messageApi(code: CodeErreur, M: MaCibleMessages): string {
  const E = M.erreurs;
  switch (code) {
    case "reseau":
    case "entree_invalide":
    case "trop_long":
    case "origine_refusee":
    case "quota_ip":
    case "quota_global":
    case "ia_invalide":
    case "ia_indisponible":
    case "config_manquante":
      return E[code];
    default:
      return E.inconnue;
  }
}

export const SANS_REESSAI: readonly CodeErreur[] = ["quota_ip", "quota_global"];
