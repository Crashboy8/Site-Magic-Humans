// JSON Schema envoyés au modèle (§8.2). Les bornes (longueurs, nombres) sont vérifiées par validation.ts.

const S = { type: "string" } as const;
const N = { type: "integer" } as const;
const A = (items: object) => ({ type: "array", items });
const E = (values: readonly string[]) => ({ type: "string", enum: values });
const O = (properties: Record<string, object>) => ({ type: "object", additionalProperties: false, required: Object.keys(properties), properties });
export const CANAUX = ["linkedin","email","instagram","facebook","tiktok","youtube","newsletter","contenu","presentiel","evenements","partenariats","bouche_a_oreille","telephone","autre"] as const;
const NOTE = O({ note: N, raison: S });

export const SCHEMA_CADRAGE = O({
  statut: E(["questions", "esquisse", "hors_sujet"]),
  message: S,
  questions: A(O({ id: E(["q1","q2","q3"]), question: S, pourquoi: S, type: E(["choix","texte"]), options: A(S), exemple: S })),
  esquisse: O({
    offre: S,
    cibles: A(O({ id: E(["c1","c2","c3"]), nom: S, marche: E(["b2b","b2c"]), enUneLigne: S, pourquoi: S })),
    antiCible: S,
    hypotheses: A(S),
  }),
});

export const SCHEMA_RESULTAT = O({
  langue: E(["fr","en","es"]),
  offre: O({ phrase: S, avant: S, apres: S }),
  cibles: A(O({
    id: E(["c1","c2","c3"]), nom: S, marche: E(["b2b","b2c"]),
    portrait: S, douleur: S, ancrage: S, promesse: S,
    offre: O({ nom: S, format: S, duree: S, contenu: A(S) }),
    prix: O({ min: N, max: N, unite: S, base: E(["HT","TTC"]), justification: S }),
    pitch: S, pourquoi: S, exemple: S,
    scores: O({ urgence: NOTE, paiement: NOTE, acces: NOTE, plaisir: NOTE }),
    lieux: A(O({ type: S, pourquoi: S, recherche: S })),
    canaux: A(O({ canal: E(CANAUX), priorite: N, action: S, pourquoi: S })),
    linkedin: O({ pertinence: E(["forte","moyenne","faible"]), motsCles: S, intitules: A(S), secteurs: A(S), tailles: A(S), zone: S, autres: A(S), astuce: S }),
    messages: O({ linkedin: S, emailObjet: S, emailCorps: S }),
    testTerrain: O({ profils: S, questions: A(S), signauxPositifs: A(S), signauxNegatifs: A(S) }),
  })),
  antiCible: O({ portrait: S, signaux: A(S), lienAntiContexte: S, commentDire: S }),
  plan30: A(O({ semaine: N, titre: S, actions: A(O({ texte: S, cible: E(["c1","c2","c3","toutes"]), canal: E(CANAUX), minutes: N })) })),
  hypotheses: A(S),
  motPourToi: S,
});
