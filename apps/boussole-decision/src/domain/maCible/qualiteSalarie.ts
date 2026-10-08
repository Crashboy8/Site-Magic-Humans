// Contrôles déterministes du résultat salarié (docs/cibleur-salarie-spec.md, §4), sur le modèle de qualite.ts.
// Réparations légères, ou erreurs qui relancent le modèle une fois.
import {
  ANNEE,
  MOM,
  QUESTIONS_TU,
  QUESTIONS_VOUS,
  alignerSignature,
  mauvaisRegistre,
  recoupe,
  registreAttendu,
  retirerJetons,
  sansAccent,
} from "./qualite";
import type { Adresse, PatronIdeal, ResultatSalarie } from "./types";
import { couperTexte } from "./validation";

export interface ContexteQualiteSalarie {
  adresse: Adresse;
  /** Anti-Contexte du talent. « Ce que tu ne veux plus jamais vivre » va seulement au modèle : trop libre pour un contrôle par mots. */
  aEviter: string;
}

/** Vocabulaire de la voie indépendant, interdit dans les patrons (§4). « client » seul reste permis : le patron a ses clients. */
const VOCABULAIRE_INDEPENDANT =
  /\b(tarifs?|prestations?|devis|tes clients?|ton client|ta clientele|ton offre de service)\b/;
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}]/gu;
/** Une phrase de sortie simple, pour qu'un destinataire puisse refuser facilement (§6). */
const SORTIE =
  /(bon moment|pas pour vous|pas pour toi|ne pas donner suite|dites-le-moi|dis-le-moi|dites le moi|dis le moi)/;
export const PHRASE_SORTIE = {
  vous: "Si ce n'est pas le bon moment, dites-le-moi simplement.",
  tu: "Si ce n'est pas le bon moment, dis-le-moi simplement.",
} as const;
export const MOTS_ORAL = { min: 55, max: 100 } as const;

const compterMots = (t: string) =>
  t.split(/\s+/).filter((m) => /[\p{L}\p{N}]/u.test(m)).length;

function blobPatron(p: PatronIdeal): string {
  // L'identité du patron seulement : le style de management parle souvent de « terrain » et créerait de faux rapprochements.
  return [
    p.nom,
    p.portrait.secteur,
    p.portrait.structure,
    p.portrait.moment,
    p.douleur,
    p.exemple,
  ].join("\n");
}

/** Deux patrons sont trop proches quand secteur, taille et moment de vie se ressemblent tous (règle 1). */
function tropProches(a: PatronIdeal, b: PatronIdeal): boolean {
  const meme = (x: string, y: string) =>
    sansAccent(x).trim() === sansAccent(y).trim() ||
    (recoupe(x, y) && recoupe(y, x));
  return (
    meme(a.portrait.secteur, b.portrait.secteur) &&
    meme(a.portrait.taille, b.portrait.taille) &&
    meme(a.portrait.moment, b.portrait.moment)
  );
}

/** Ajoute la phrase de sortie juste avant la signature, si la place le permet. */
function avecSortie(corps: string, adresse: Adresse): string {
  if (SORTIE.test(sansAccent(corps))) return corps;
  const phrase = adresse === "tu" ? PHRASE_SORTIE.tu : PHRASE_SORTIE.vous;
  const m = corps.match(/\n+(Bien à vous,|À bientôt,)\s*\n+\{\{prenom\}\}\s*$/);
  const suivant =
    m && m.index !== undefined
      ? `${corps.slice(0, m.index).trimEnd()}\n\n${phrase}${corps.slice(m.index)}`
      : `${corps.trimEnd()}\n\n${phrase}`;
  return suivant.length <= 900 ? suivant : corps;
}

export function qualiteSalarie(
  resultat: ResultatSalarie,
  ctx: ContexteQualiteSalarie,
): { resultat: ResultatSalarie; reparations: number; erreurs: string[] } {
  const reparations = { n: 0 };
  const erreurs: string[] = [];
  const r = retirerJetons(structuredClone(resultat), reparations);
  const attendu = registreAttendu(ctx.adresse);

  r.patrons.forEach((c, i) => {
    const p = `patrons[${i}]`;
    const original = resultat.patrons[i];
    // Signature et phrase de sortie de l'email.
    const sansEmoji = original.pitchs.emailCorps.replace(EMOJI, "");
    const objet = c.pitchs.emailObjet.replace(EMOJI, "").trim();
    if (
      sansEmoji !== original.pitchs.emailCorps ||
      objet !== c.pitchs.emailObjet
    )
      reparations.n += 1;
    c.pitchs.emailObjet = objet;
    const signe = alignerSignature(sansEmoji, ctx.adresse, 900);
    const sortie = avecSortie(signe, ctx.adresse);
    if (sortie !== original.pitchs.emailCorps) reparations.n += 1;
    c.pitchs.emailCorps = sortie;

    // Un patron qui ressemble à ce que la personne veut éviter : « ton Contexte Déclencheur présent » plafonné à 2.
    if (
      ctx.aEviter.trim() &&
      recoupe(ctx.aEviter, blobPatron(c)) &&
      c.envie.declencheur > 2
    ) {
      c.envie.declencheur = 2;
      c.valeurs.frotte = couperTexte(
        `${c.valeurs.frotte ? `${c.valeurs.frotte} ` : ""}Il reprend des traits de ce que tu veux éviter.`.trim(),
        240,
      );
      reparations.n += 1;
    }

    for (const l of c.lieux) {
      const suivant = l.recherche
        .replace(ANNEE, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      if (suivant !== l.recherche) {
        l.recherche = suivant;
        reparations.n += 1;
      }
    }

    const mots = compterMots(c.pitchs.oral30s);
    if (mots < MOTS_ORAL.min || mots > MOTS_ORAL.max)
      erreurs.push(
        `${p}.pitchs.oral30s : 70 à 85 mots attendus (${mots} trouvés).`,
      );

    const textes = [
      c.pitchs.noteInvitation,
      c.pitchs.messageLinkedin,
      c.pitchs.emailCorps,
    ];
    if (textes.some((t) => mauvaisRegistre(t, attendu))) {
      erreurs.push(
        attendu === "vous"
          ? `${p}.pitchs : vouvoiement attendu dans les messages.`
          : `${p}.pitchs : tutoiement attendu dans les messages, comme demandé.`,
      );
    }

    const zone = sansAccent(
      [
        c.nom,
        c.douleur,
        c.pourquoiToi,
        c.ancrage,
        c.exemple,
        ...Object.values(c.pitchs),
        ...c.approches.map((a) => a.action),
      ].join("\n"),
    );
    const mot = zone.match(VOCABULAIRE_INDEPENDANT);
    if (mot)
      erreurs.push(
        `${p} : « ${mot[0]} » appartient à la voie indépendant. Parle d'employeur, de poste et de manager.`,
      );
  });

  for (let i = 0; i < r.patrons.length; i++) {
    for (let j = i + 1; j < r.patrons.length; j++) {
      if (tropProches(r.patrons[i], r.patrons[j])) {
        erreurs.push(
          `patrons : ${r.patrons[i].id} et ${r.patrons[j].id} se ressemblent trop. Change le secteur, la taille ou le moment de vie de l'entreprise.`,
        );
      }
    }
  }

  const questionsModele = attendu === "tu" ? QUESTIONS_TU : QUESTIONS_VOUS;
  r.testTerrain.questions = r.testTerrain.questions.map((q, qi) => {
    if (!MOM.some((re) => re.test(q))) return q;
    reparations.n += 1;
    return questionsModele[qi % questionsModele.length];
  });

  const comptes = { c1: 0, c2: 0, c3: 0, toutes: 0 };
  for (const semaine of r.plan30)
    for (const action of semaine.actions) comptes[action.cible] += 1;
  if (
    comptes.c1 < 2 ||
    comptes.c2 < 2 ||
    comptes.c3 < 2 ||
    comptes.toutes < 1
  ) {
    erreurs.push(
      "plan30 : au moins 2 actions pour chaque patron (c1, c2, c3) et au moins une action commune (toutes).",
    );
  }

  return { resultat: r, reparations: reparations.n, erreurs };
}
