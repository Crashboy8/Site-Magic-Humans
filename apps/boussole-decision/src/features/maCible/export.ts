// Export du résultat : texte brut et Markdown. Le prénom est remplacé, jamais laissé en jeton.
import { scorePressenti, scoreSur10 } from "@/domain/maCible/scores";
import { EXTRAS_VIDES, type Cible, type Extras, type Portrait, type ResultatClasse, type SyntheseTerrain } from "@/domain/maCible/types";
import { remplacerPrenom } from "./liens";

const puces = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

function titre(texte: string, markdown: boolean, niveau: 1 | 2 | 3): string {
  if (!markdown) return texte.toUpperCase();
  return `${"#".repeat(niveau)} ${texte}`;
}

function bloc(libelle: string, corps: string[], markdown: boolean, niveau: 1 | 2 | 3 = 2): string {
  return [titre(libelle, markdown, niveau), ...corps.filter((l) => l.length > 0)].join("\n");
}

const CATEGORIES: Record<Portrait["lieux"][number]["categorie"], string> = {
  salon: "Salon",
  evenement: "Événement",
  club: "Club ou réseau",
  en_ligne: "En ligne",
  lieu: "Lieu",
  media: "Média",
};
const FREQUENCES: Record<SyntheseTerrain["douleurs"][number]["frequence"], string> = { souvent: "souvent", parfois: "parfois", une_fois: "une fois" };

const virgule = (n: number) => String(n).replace(".", ",");

/** Portrait complet d'une cible (§14). Les phrases de clients sont reprises de la synthèse par leur identifiant. */
export function textePortrait(p: Portrait, synthese: SyntheseTerrain | null, markdown = false, niveau: 2 | 3 = 3): string {
  const citation = (id: string) => synthese?.verbatims.find((v) => v.id === id)?.citation;
  const sous = (niveau + 1) as 3 | 4;
  const h = (texte: string) => (markdown ? `${"#".repeat(Math.min(sous, 6))} ${texte}` : texte);
  return [
    titre("Son portrait", markdown, niveau),
    `${p.prenom}, ${p.age} (imaginé par l'IA)`,
    h("Sa situation"),
    p.situation,
    h("Sa journée"),
    p.journee,
    h("Le jour où elle cherche de l'aide"),
    p.declencheur,
    h("Ce qui allume ton talent chez elle"),
    p.pourToi,
    h("Ce qu'elle a déjà essayé"),
    puces(p.dejaEssaye),
    h("Ce qui lui pèse"),
    ...p.douleurs.map((d) => {
      const vraie = d.verbatim ? citation(d.verbatim) : undefined;
      return [`- ${d.titre} (intensité ${d.intensite} sur 5)`, `  ${d.detail}`, `  Comme elle le dirait : ${d.sesMots}`, vraie ? `  Ce qu'un client t'a vraiment dit : « ${vraie} »` : ""]
        .filter(Boolean)
        .join("\n");
    }),
    h("Ce qui la fait hésiter, et quoi répondre"),
    ...p.objections.map((o) => `- ${o.objection}\n  Tu peux répondre : ${o.reponse}`),
    h("Ce qui la fera choisir"),
    puces(p.criteresChoix),
    h("Où elle s'informe"),
    puces(p.sInforme),
    h("Où la croiser"),
    ...p.lieux.map((l) => `- ${CATEGORIES[l.categorie]} : ${l.type}\n  ${l.pourquoi}\n  À chercher : ${l.recherche}`),
  ].join("\n");
}

function texteClients(cible: Cible, synthese: SyntheseTerrain | null, markdown: boolean): string {
  const phrases = (synthese?.verbatims ?? []).filter((v) => cible.verbatims.includes(v.id));
  if (phrases.length === 0) return "";
  return bloc("Ce que disent tes clients", phrases.map((v) => `- « ${v.citation} »`), markdown, 3);
}

function texteSynthese(s: SyntheseTerrain, markdown: boolean): string {
  return bloc(
    "Ce que disent tes notes",
    [
      s.resume,
      s.profils.length ? `Qui sont ces personnes\n${puces(s.profils)}` : "",
      s.douleurs.length ? `Ce qui leur pèse\n${puces(s.douleurs.map((d) => `${d.texte} (${FREQUENCES[d.frequence]})`))}` : "",
      s.verbatims.length ? `Leurs mots exacts\n${puces(s.verbatims.map((v) => `« ${v.citation} »`))}` : "",
      s.declencheurs.length ? `Ce qui les a poussées à chercher de l'aide\n${puces(s.declencheurs)}` : "",
      s.objections.length ? `Ce qui les fait hésiter\n${puces(s.objections)}` : "",
      s.motsCles.length ? `Les mots qu'elles emploient\n${s.motsCles.join(", ")}` : "",
    ],
    markdown,
    2,
  );
}

export function texteCible(cible: Cible, prenom: string, score: string, markdown: boolean, portrait?: Portrait, synthese: SyntheseTerrain | null = null): string {
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
    texteClients(cible, synthese, markdown),
    portrait ? textePortrait(portrait, synthese, markdown, 3) : "",
  ];
  return parties.filter(Boolean).join("\n\n");
}

export function exporterResultat(
  resultat: ResultatClasse,
  prenom: string,
  options: { synthese?: SyntheseTerrain | null; extras?: Extras } = {},
): { texte: string; markdown: string } {
  const synthese = options.synthese ?? null;
  const extras = options.extras ?? EXTRAS_VIDES;
  const rendre = (markdown: boolean) => {
    const t = (s: string) => remplacerPrenom(s, prenom);
    const parId = new Map(resultat.classement.map((l) => [l.id, l]));
    const ordre = resultat.classement.map((l) => resultat.cibles.find((c) => c.id === l.id)).filter((c): c is Cible => c !== undefined);
    const cibles = ordre.map((c) => {
      const ligne = parId.get(c.id);
      const score = ligne ? `${virgule(ligne.score)}/10` : "";
      return texteCible(c, prenom, score, markdown, extras.portraits[c.id], synthese);
    });
    const creusees = Object.values(extras.pistes)
      .flatMap((p) => (p ? [p.cible] : []))
      .sort((a, b) => scoreSur10(b.scores) - scoreSur10(a.scores))
      .map((c) => texteCible(c, prenom, `${virgule(scoreSur10(c.scores))}/10`, markdown, extras.portraits[c.id], synthese));
    const plan = resultat.plan30.flatMap((s) => [
      markdown ? `### Semaine ${s.semaine} : ${t(s.titre)}` : `SEMAINE ${s.semaine} : ${t(s.titre).toUpperCase()}`,
      ...s.actions.map((a) => `- ${t(a.texte)}`),
    ]);
    return [
      bloc("Ton offre", [t(resultat.offre.phrase), "", "Avant toi", t(resultat.offre.avant), "", "Après toi", t(resultat.offre.apres)], markdown, 1),
      synthese ? texteSynthese(synthese, markdown) : "",
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
      creusees.length ? [titre("Pistes creusées", markdown, 2), ...creusees].join("\n\n") : "",
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
