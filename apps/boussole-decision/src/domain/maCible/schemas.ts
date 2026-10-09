// JSON Schema envoyés au modèle (§8.2). Les bornes (longueurs, nombres) sont vérifiées par validation.ts.

const S = { type: "string" } as const;
const N = { type: "integer" } as const;
const A = (items: object) => ({ type: "array", items });
const E = (values: readonly string[]) => ({ type: "string", enum: values });
const O = (properties: Record<string, object>) => ({ type: "object", additionalProperties: false, required: Object.keys(properties), properties });
export const CANAUX = ["linkedin","email","instagram","facebook","tiktok","youtube","newsletter","contenu","presentiel","evenements","partenariats","bouche_a_oreille","telephone","autre"] as const;
export const IDS_IDEES = ["i1","i2","i3","i4","i5","i6","i7","i8"] as const;
export const IDS_PISTES = ["p1","p2","p3","p4","p5","p6"] as const;
export const IDS_NOTES = ["n1","n2","n3","n4","n5"] as const;
export const CATEGORIES_LIEU = ["salon","evenement","club","en_ligne","lieu","media"] as const;
const NOTE = O({ note: N, raison: S });

const PISTE_ESQUISSE = O({ id: E(IDS_PISTES), nom: S, marche: E(["b2b","b2c"]), enUneLigne: S, raison: S, depuisIdees: A(E(IDS_IDEES)) });
const NOTES_PRESSENTIES = O({ urgence: N, paiement: N, acces: N, plaisir: N });
const AUTRE_PISTE = O({ id: E(IDS_PISTES), nom: S, marche: E(["b2b","b2c"]), enUneLigne: S, raison: S, depuisIdees: A(E(IDS_IDEES)), notes: NOTES_PRESSENTIES });

/** Item cible, factorisé : c1 à c3 pour le résultat, c4 à c6 pour une piste creusée. */
export const schemaCible = (ids: readonly string[]) => O({
  id: E(ids), nom: S, marche: E(["b2b","b2c"]),
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
  depuisIdees: A(E(IDS_IDEES)),
  verbatims: A(S),
});

export const SCHEMA_CADRAGE = O({
  statut: E(["questions", "esquisse", "hors_sujet"]),
  message: S,
  questions: A(O({ id: E(["q1","q2","q3"]), question: S, pourquoi: S, type: E(["choix","texte"]), options: A(S), exemple: S })),
  esquisse: O({
    offre: S,
    cibles: A(O({ id: E(["c1","c2","c3"]), nom: S, marche: E(["b2b","b2c"]), enUneLigne: S, pourquoi: S, depuisIdees: A(E(IDS_IDEES)) })),
    antiCible: S,
    hypotheses: A(S),
    autresPistes: A(PISTE_ESQUISSE),
  }),
});

export const SCHEMA_RESULTAT = O({
  langue: E(["fr","en","es"]),
  offre: O({ phrase: S, avant: S, apres: S }),
  cibles: A(schemaCible(["c1","c2","c3"])),
  autresPistes: A(AUTRE_PISTE),
  antiCible: O({ portrait: S, signaux: A(S), lienAntiContexte: S, commentDire: S }),
  plan30: A(O({ semaine: N, titre: S, actions: A(O({ texte: S, cible: E(["c1","c2","c3","toutes"]), canal: E(CANAUX), minutes: N })) })),
  hypotheses: A(S),
  motPourToi: S,
});

export const SCHEMA_SYNTHESE = O({
  statut: E(["ok","inutilisable"]), message: S, resume: S, profils: A(S),
  douleurs: A(O({ texte: S, frequence: E(["souvent","parfois","une_fois"]) })),
  verbatims: A(O({ id: S, note: E(IDS_NOTES), citation: S, theme: E(["douleur","declencheur","objection","resultat","autre"]) })),
  declencheurs: A(S), objections: A(S), motsCles: A(S),
});

const PORTRAIT = O({
  prenom: S, age: S, situation: S, journee: S, declencheur: S, pourToi: S,
  dejaEssaye: A(S),
  douleurs: A(O({ titre: S, detail: S, intensite: N, sesMots: S, verbatim: S })),
  objections: A(O({ objection: S, reponse: S })),
  criteresChoix: A(S), sInforme: A(S),
  lieux: A(O({ categorie: E(CATEGORIES_LIEU), type: S, pourquoi: S, recherche: S })),
});
export const SCHEMA_PORTRAIT = O({ portrait: PORTRAIT });
export const SCHEMA_PISTE = O({ cible: schemaCible(["c4","c5","c6"]), portrait: PORTRAIT });

// Voie salarié (docs/cibleur-salarie-spec.md, §3). Le cadrage réutilise SCHEMA_CADRAGE :
// l'offre devient la promesse à un patron, les cibles les patrons idéaux, l'anti-cible le patron à fuir.
export const GENRES_LIEU_SALARIE = ["entreprises","evenement","reseau"] as const;
export const GENRES_APPROCHE = ["conseil","recommandation","spontanee","evenement","contenu"] as const;
const PATRON = O({
  id: E(["c1","c2","c3"]), nom: S,
  portrait: O({ secteur: S, taille: S, structure: S, moment: S }),
  douleur: S, pourquoiToi: S, ancrage: S,
  management: O({ style: S, colle: S, frotte: S }),
  valeurs: O({ probables: A(S), colle: S, frotte: S }),
  questionsEntretien: A(S),
  besoin: O({ urgence: N, rarete: N, paiement: N, acces: N }),
  envie: O({ management: N, valeurs: N, declencheur: N, cadre: N }),
  lieux: A(O({ type: S, pourquoi: S, recherche: S, genre: E(GENRES_LIEU_SALARIE) })),
  approches: A(O({ genre: E(GENRES_APPROCHE), action: S })),
  linkedin: O({ pertinence: E(["forte","moyenne","faible"]), motsCles: S, intitules: A(S), secteurs: A(S), tailles: A(S), zone: S, autres: A(S), astuce: S }),
  pitchs: O({ noteInvitation: S, messageLinkedin: S, emailObjet: S, emailCorps: S, oral30s: S }),
  exemple: S,
  depuisIdees: A(E(IDS_IDEES)),
});
export const SCHEMA_RESULTAT_SALARIE = O({
  voie: E(["salarie"]),
  langue: E(["fr","en","es"]),
  promesse: S,
  regle: A(S),
  patrons: A(PATRON),
  managerIdeal: O({ portrait: S, flow: S, eteint: S }),
  antiPatron: O({ portrait: S, signaux: A(S) }),
  // Toujours un objet (plus sûr d'un fournisseur à l'autre) : vide hors reconversion, `null` après validation.
  reconversion: O({ transferables: A(O({ competence: S, preuve: S })), premiereMarche: S, essais: A(S) }),
  plan30: A(O({ semaine: N, titre: S, actions: A(O({ texte: S, cible: E(["c1","c2","c3","toutes"]), canal: E(CANAUX), minutes: N })) })),
  testTerrain: O({ profils: S, questions: A(S), signauxPositifs: A(S), signauxNegatifs: A(S) }),
  hypotheses: A(S),
  motPourToi: S,
});
