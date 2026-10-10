// Ce que l'on garde d'une personne : sa voie, son autodiagnostic argent, ses deux options et ses réponses.
// Lu depuis le navigateur ou la base : on ne fait confiance à rien, tout est revalidé ici.
import { REPONSES, VOIES, type ChoixVoie, type ParcoursPublic, type Reponse } from "./types";

export interface Profil {
  /** null tant que la question de voie n'a pas de réponse. */
  voie: ChoixVoie | null;
  /** Autodiagnostic argent, de 1 à 5 (voies A à E). */
  argent: number | null;
  /** Connaissance de soi en parallèle d'une voie pro : null tant que la question n'est pas posée. */
  parallele: boolean | null;
  /** Ancien accompagné (fiche Talent Unique déjà faite) : il commence à l'étape 3. */
  raccourci: boolean;
  /** Voie E seulement : la personne est freelance et cherche un poste (« entrepreneur » et « redevenir salarié » cochés ensemble). */
  freelance: boolean;
  /** Réponse de chaque critère, par identifiant (« connaitre.quiz »). */
  reponses: Readonly<Record<string, Reponse>>;
}

export const PROFIL_VIDE: Profil = { voie: null, argent: null, parallele: null, raccourci: false, freelance: false, reponses: {} };

const IDS = new WeakMap<ParcoursPublic, ReadonlySet<string>>();

/** Identifiants de tous les critères du parcours. */
export function idsCriteres(data: ParcoursPublic): ReadonlySet<string> {
  const deja = IDS.get(data);
  if (deja) return deja;
  const ids = new Set(Object.values(data.etapes).flatMap((e) => e.criteres.map((c) => c.id)));
  IDS.set(data, ids);
  return ids;
}

export function estChoixVoie(v: unknown): v is ChoixVoie {
  return v === "inconnue" || (typeof v === "string" && (VOIES as readonly string[]).includes(v));
}

export function estReponse(v: unknown): v is Reponse {
  return typeof v === "string" && (REPONSES as readonly string[]).includes(v);
}

/** Un profil propre, ou null si la valeur n'en est pas un. Les critères inconnus et les réponses invalides sont ignorés. */
export function lireProfil(brut: unknown, data: ParcoursPublic): Profil | null {
  if (typeof brut !== "object" || brut === null || Array.isArray(brut)) return null;
  const o = brut as Record<string, unknown>;
  const voie = o.voie === null || o.voie === undefined ? null : estChoixVoie(o.voie) ? o.voie : undefined;
  if (voie === undefined) return null;
  const argent =
    typeof o.argent === "number" && Number.isInteger(o.argent) && o.argent >= data.argent.min && o.argent <= data.argent.max ? o.argent : null;
  const parallele = typeof o.parallele === "boolean" ? o.parallele : null;
  const ids = idsCriteres(data);
  const reponses: Record<string, Reponse> = {};
  if (typeof o.reponses === "object" && o.reponses !== null && !Array.isArray(o.reponses)) {
    for (const [id, r] of Object.entries(o.reponses as Record<string, unknown>)) {
      if (ids.has(id) && estReponse(r)) reponses[id] = r;
    }
  }
  return { voie, argent, parallele, raccourci: o.raccourci === true, freelance: o.freelance === true && voie === "E", reponses };
}

/** Le profil a-t-il commencé (une voie choisie ou au moins une réponse) ? */
export function profilCommence(p: Profil): boolean {
  return p.voie !== null || Object.keys(p.reponses).length > 0;
}
