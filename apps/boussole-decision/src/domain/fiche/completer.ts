// Règles de déduction quand la fiche ne dit pas tout (cahier C.4). Module pur.
import { bornerFiche, couper } from "./bornes";
import type { FicheTalent } from "./types";

/** Première phrase d'un texte (jusqu'au premier . ! ? suivi d'une espace). */
export function premierePhrase(t: string): string {
  const m = /^(.+?[.!?])(\s|$)/.exec(t.trim());
  return (m ? m[1] : t).trim();
}

/** Complète les champs vides déductibles. Renvoie la fiche bornée et la liste des champs déduits. */
export function completerFiche(entree: FicheTalent): { fiche: FicheTalent; deduits: (keyof FicheTalent)[] } {
  const f: FicheTalent = { ...entree };
  const deduits: (keyof FicheTalent)[] = [];
  if (!f.contexte && f.reussite.length) {
    f.contexte = f.reussite.slice(0, 2).join(" ; ");
    deduits.push("contexte");
  }
  if (!f.benefice && f.resume) {
    f.benefice = premierePhrase(f.resume);
    deduits.push("benefice");
  }
  if (!f.antiContexte) {
    const depuisEchec = [...f.echec.slice(0, 3), f.phraseAntiValeurs].filter(Boolean).join(" ; ");
    const valeur = depuisEchec || f.antiValeurs.slice(0, 3).join(" ; ");
    if (valeur) {
      f.antiContexte = valeur;
      deduits.push("antiContexte");
    }
  }
  if (!f.resume && f.mecanisme) {
    f.resume = couper(f.mecanisme, 220);
    deduits.push("resume");
  }
  return { fiche: bornerFiche(f), deduits };
}
