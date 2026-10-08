// Export du résultat : texte brut et Markdown. Le prénom est remplacé, jamais laissé en jeton.
import { scorePressenti } from "@/domain/maCible/scores";
import type { Cible, ResultatClasse } from "@/domain/maCible/types";
import { remplacerPrenom } from "./liens";

const puces = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

function titre(texte: string, markdown: boolean, niveau: 1 | 2 | 3): string {
  if (!markdown) return texte.toUpperCase();
  return `${"#".repeat(niveau)} ${texte}`;
}

function bloc(libelle: string, corps: string[], markdown: boolean, niveau: 1 | 2 | 3 = 2): string {
  return [titre(libelle, markdown, niveau), ...corps.filter((l) => l.length > 0)].join("\n");
}

export function texteCible(cible: Cible, prenom: string, score: string, markdown: boolean): string {
  const t = (s: string) => remplacerPrenom(s, prenom);
  const parties = [
    bloc("Cible", [cible.nom, `${cible.marche.toUpperCase()} · ${score}`], markdown, 2),
    bloc("Qui c'est", [t(cible.portrait)], markdown, 3),
    bloc("Sa douleur probable", [t(cible.douleur)], markdown, 3),
    bloc("Ce que ton talent lui apporte", [t(cible.ancrage)], markdown, 3),
    bloc("Ta promesse", [t(cible.promesse)], markdown, 3),
    bloc("Ton offre pour elle", [
      t(cible.offre.nom),
      `Format : ${t(cible.offre.format)}`,
      `Durée : ${t(cible.offre.duree)}`,
      "Ce qu'il y a dedans",
      puces(cible.offre.contenu.map(t)),
      `Prix indicatif : ${cible.prix.min} à ${cible.prix.max} € ${cible.prix.base}, ${t(cible.prix.unite)}`,
      t(cible.prix.justification),
    ], markdown, 3),
    bloc("Ton pitch", [t(cible.pitch)], markdown, 3),
    bloc("Pourquoi cette cible", [t(cible.pourquoi)], markdown, 3),
    bloc("Un cas imaginé pour illustrer", [t(cible.exemple)], markdown, 3),
    bloc("Où la rencontrer", [
      ...cible.lieux.flatMap((l) => [`- ${t(l.type)}`, `  ${t(l.pourquoi)}`, `  À chercher : ${t(l.recherche)}`]),
      ...cible.canaux.map((c) => `- ${c.canal} (priorité ${c.priorite}) : ${t(c.action)}`),
    ], markdown, 3),
    bloc("LinkedIn", [
      t(cible.linkedin.motsCles),
      cible.linkedin.intitules.length ? puces(cible.linkedin.intitules.map(t)) : "",
      t(cible.linkedin.astuce),
    ], markdown, 3),
    bloc("Messages", [
      "Message LinkedIn",
      t(cible.messages.linkedin),
      `Objet : ${t(cible.messages.emailObjet)}`,
      t(cible.messages.emailCorps),
    ], markdown, 3),
    bloc("Test terrain", [
      t(cible.testTerrain.profils),
      ...cible.testTerrain.questions.map((q, i) => `${i + 1}. ${t(q)}`),
      "Bon signe si",
      puces(cible.testTerrain.signauxPositifs.map(t)),
      "Mauvais signe si",
      puces(cible.testTerrain.signauxNegatifs.map(t)),
    ], markdown, 3),
  ];
  return parties.join("\n\n");
}

export function exporterResultat(resultat: ResultatClasse, prenom: string): { texte: string; markdown: string } {
  const rendre = (markdown: boolean) => {
    const t = (s: string) => remplacerPrenom(s, prenom);
    const parId = new Map(resultat.classement.map((l) => [l.id, l]));
    const ordre = resultat.classement.map((l) => resultat.cibles.find((c) => c.id === l.id)).filter((c): c is Cible => c !== undefined);
    const cibles = ordre.map((c) => {
      const ligne = parId.get(c.id);
      const score = ligne ? `${String(ligne.score).replace(".", ",")}/10` : "";
      return texteCible(c, prenom, score, markdown);
    });
    const plan = resultat.plan30.flatMap((s) => [
      markdown ? `### Semaine ${s.semaine} : ${t(s.titre)}` : `SEMAINE ${s.semaine} : ${t(s.titre).toUpperCase()}`,
      ...s.actions.map((a) => `- ${t(a.texte)}`),
    ]);
    return [
      bloc("Ton offre", [t(resultat.offre.phrase), "", "Avant toi", t(resultat.offre.avant), "", "Après toi", t(resultat.offre.apres)], markdown, 1),
      ...cibles,
      resultat.autresPistes.length
        ? bloc(
            "D'autres pistes",
            resultat.autresPistes.map((p) => {
              const score = String(scorePressenti(p.notes)).replace(".", ",");
              return [`${p.nom} (${p.marche.toUpperCase()} · ${score}/10)`, t(p.enUneLigne), t(p.raison)].join("\n");
            }),
            markdown,
            2,
          )
        : "",
      bloc("Anti-cible", [t(resultat.antiCible.portrait), puces(resultat.antiCible.signaux.map(t)), t(resultat.antiCible.lienAntiContexte), t(resultat.antiCible.commentDire)], markdown, 2),
      bloc("Plan 30 jours", plan, markdown, 2),
      resultat.hypotheses.length ? bloc("Ce que l'IA a supposé", [puces(resultat.hypotheses.map(t))], markdown, 2) : "",
      bloc("Un mot pour toi", [t(resultat.motPourToi)], markdown, 2),
    ].filter(Boolean).join("\n\n");
  };
  return { texte: rendre(false), markdown: rendre(true) };
}

/** Nom de fichier `le-cibleur-AAAA-MM-JJ.md`, jour de Paris. */
export function nomFichierExport(faitLe: string): string {
  const jour = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(faitLe));
  return `le-cibleur-${jour}.md`;
}
