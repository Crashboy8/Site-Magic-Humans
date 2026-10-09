// Export du résultat : texte brut et Markdown. Le prénom est remplacé, jamais laissé en jeton.
// Les libellés viennent du dictionnaire de la langue de l'interface (français par défaut).
import { scorePressenti, scoreSur10 } from "@/domain/maCible/scores";
import { EXTRAS_VIDES, type Cible, type Extras, type Portrait, type ResultatClasse, type SyntheseTerrain } from "@/domain/maCible/types";
import { maCible, type MaCibleMessages } from "@/i18n/messages/maCible";
import { remplacerPrenom } from "./liens";

const FR = maCible.fr;

const puces = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

function titre(texte: string, markdown: boolean, niveau: 1 | 2 | 3): string {
  if (!markdown) return texte.toUpperCase();
  return `${"#".repeat(niveau)} ${texte}`;
}

function bloc(libelle: string, corps: string[], markdown: boolean, niveau: 1 | 2 | 3 = 2): string {
  return [titre(libelle, markdown, niveau), ...corps.filter((l) => l.length > 0)].join("\n");
}

const nombre = (n: number, M: MaCibleMessages) => n.toLocaleString(M.commun.locale, { maximumFractionDigits: 1 });

/** Portrait complet d'une cible (§14). Les phrases de clients sont reprises de la synthèse par leur identifiant. */
export function textePortrait(p: Portrait, synthese: SyntheseTerrain | null, markdown = false, niveau: 2 | 3 = 3, M: MaCibleMessages = FR): string {
  const L = M.export;
  const dp = M.commun.dp;
  const citation = (id: string) => synthese?.verbatims.find((v) => v.id === id)?.citation;
  const sous = (niveau + 1) as 3 | 4;
  const h = (texte: string) => (markdown ? `${"#".repeat(Math.min(sous, 6))} ${texte}` : texte);
  return [
    titre(L.sonPortrait, markdown, niveau),
    L.imagine(p.prenom, p.age),
    h(L.situation),
    p.situation,
    h(L.journee),
    p.journee,
    h(L.declencheur),
    p.declencheur,
    h(L.pourToi),
    p.pourToi,
    h(L.dejaEssaye),
    puces(p.dejaEssaye),
    h(L.douleurs),
    ...p.douleurs.map((d) => {
      const vraie = d.verbatim ? citation(d.verbatim) : undefined;
      return [`- ${d.titre} (${L.intensite(d.intensite)})`, `  ${d.detail}`, `  ${L.sesMots}${dp}${d.sesMots}`, vraie ? `  ${L.vraiClient}${dp}${M.commun.citation(vraie)}` : ""]
        .filter(Boolean)
        .join("\n");
    }),
    h(L.objections),
    ...p.objections.map((o) => `- ${o.objection}\n  ${L.repondre}${dp}${o.reponse}`),
    h(L.criteresChoix),
    puces(p.criteresChoix),
    h(L.sInforme),
    puces(p.sInforme),
    h(L.lieux),
    ...p.lieux.map((l) => `- ${L.categories[l.categorie]}${dp}${l.type}\n  ${l.pourquoi}\n  ${L.aChercher}${dp}${l.recherche}`),
  ].join("\n");
}

function texteClients(cible: Cible, synthese: SyntheseTerrain | null, markdown: boolean, M: MaCibleMessages): string {
  const phrases = (synthese?.verbatims ?? []).filter((v) => cible.verbatims.includes(v.id));
  if (phrases.length === 0) return "";
  return bloc(M.export.clients, phrases.map((v) => `- ${M.commun.citation(v.citation)}`), markdown, 3);
}

function texteSynthese(s: SyntheseTerrain, markdown: boolean, M: MaCibleMessages): string {
  const L = M.export;
  return bloc(
    L.notes,
    [
      s.resume,
      s.profils.length ? `${L.profils}\n${puces(s.profils)}` : "",
      s.douleurs.length ? `${L.leurPese}\n${puces(s.douleurs.map((d) => `${d.texte} (${L.frequences[d.frequence]})`))}` : "",
      s.verbatims.length ? `${L.motsExacts}\n${puces(s.verbatims.map((v) => M.commun.citation(v.citation)))}` : "",
      s.declencheurs.length ? `${L.declencheurs}\n${puces(s.declencheurs)}` : "",
      s.objections.length ? `${L.hesiter}\n${puces(s.objections)}` : "",
      s.motsCles.length ? `${L.motsCles}\n${s.motsCles.join(", ")}` : "",
    ],
    markdown,
    2,
  );
}

export function texteCible(
  cible: Cible,
  prenom: string,
  score: string,
  markdown: boolean,
  portrait?: Portrait,
  synthese: SyntheseTerrain | null = null,
  M: MaCibleMessages = FR,
): string {
  const t = (s: string) => remplacerPrenom(s, prenom);
  const L = M.export;
  const dp = M.commun.dp;
  const parties = [
    bloc(L.cible, [cible.nom, `${cible.marche.toUpperCase()} · ${score}`], markdown, 2),
    bloc(L.quiCest, [t(cible.portrait)], markdown, 3),
    bloc(L.douleur, [t(cible.douleur)], markdown, 3),
    bloc(L.ancrage, [t(cible.ancrage)], markdown, 3),
    bloc(L.promesse, [t(cible.promesse)], markdown, 3),
    bloc(L.offreCible, [
      t(cible.offre.nom),
      `${L.format}${dp}${t(cible.offre.format)}`,
      `${L.duree}${dp}${t(cible.offre.duree)}`,
      L.contenu,
      puces(cible.offre.contenu.map(t)),
      L.prix(nombre(cible.prix.min, M), nombre(cible.prix.max, M), cible.prix.base, t(cible.prix.unite)),
      t(cible.prix.justification),
    ], markdown, 3),
    bloc(L.pitch, [t(cible.pitch)], markdown, 3),
    bloc(L.pourquoi, [t(cible.pourquoi)], markdown, 3),
    bloc(L.exemple, [t(cible.exemple)], markdown, 3),
    bloc(L.rencontrer, [
      ...cible.lieux.flatMap((l) => [`- ${t(l.type)}`, `  ${t(l.pourquoi)}`, `  ${L.aChercher}${dp}${t(l.recherche)}`]),
      ...cible.canaux.map((c) => `- ${M.canaux[c.canal] ?? c.canal} (${L.priorite(c.priorite)})${dp}${t(c.action)}`),
    ], markdown, 3),
    bloc(L.linkedin, [
      t(cible.linkedin.motsCles),
      cible.linkedin.intitules.length ? puces(cible.linkedin.intitules.map(t)) : "",
      t(cible.linkedin.astuce),
    ], markdown, 3),
    bloc(L.messages, [
      L.messageLinkedin,
      t(cible.messages.linkedin),
      `${L.objet}${dp}${t(cible.messages.emailObjet)}`,
      t(cible.messages.emailCorps),
    ], markdown, 3),
    bloc(L.testTerrain, [
      t(cible.testTerrain.profils),
      ...cible.testTerrain.questions.map((q, i) => `${i + 1}. ${t(q)}`),
      L.bonSigne,
      puces(cible.testTerrain.signauxPositifs.map(t)),
      L.mauvaisSigne,
      puces(cible.testTerrain.signauxNegatifs.map(t)),
    ], markdown, 3),
    texteClients(cible, synthese, markdown, M),
    portrait ? textePortrait(portrait, synthese, markdown, 3, M) : "",
  ];
  return parties.filter(Boolean).join("\n\n");
}

export function exporterResultat(
  resultat: ResultatClasse,
  prenom: string,
  options: { synthese?: SyntheseTerrain | null; extras?: Extras; M?: MaCibleMessages } = {},
): { texte: string; markdown: string } {
  const M = options.M ?? FR;
  const L = M.export;
  const sur10 = (n: number) => M.resultat.score(n);
  const synthese = options.synthese ?? null;
  const extras = options.extras ?? EXTRAS_VIDES;
  const rendre = (markdown: boolean) => {
    const t = (s: string) => remplacerPrenom(s, prenom);
    const parId = new Map(resultat.classement.map((l) => [l.id, l]));
    const ordre = resultat.classement.map((l) => resultat.cibles.find((c) => c.id === l.id)).filter((c): c is Cible => c !== undefined);
    const cibles = ordre.map((c) => {
      const ligne = parId.get(c.id);
      const score = ligne ? sur10(ligne.score) : "";
      return texteCible(c, prenom, score, markdown, extras.portraits[c.id], synthese, M);
    });
    const creusees = Object.values(extras.pistes)
      .flatMap((p) => (p ? [p.cible] : []))
      .sort((a, b) => scoreSur10(b.scores) - scoreSur10(a.scores))
      .map((c) => texteCible(c, prenom, sur10(scoreSur10(c.scores)), markdown, extras.portraits[c.id], synthese, M));
    const plan = resultat.plan30.flatMap((s) => [
      markdown ? `### ${L.semaine(s.semaine, t(s.titre))}` : L.semaine(s.semaine, t(s.titre)).toUpperCase(),
      ...s.actions.map((a) => `- ${t(a.texte)}`),
    ]);
    return [
      bloc(L.tonOffre, [t(resultat.offre.phrase), "", L.avant, t(resultat.offre.avant), "", L.apres, t(resultat.offre.apres)], markdown, 1),
      synthese ? texteSynthese(synthese, markdown, M) : "",
      ...cibles,
      resultat.autresPistes.length
        ? bloc(
            L.autresPistes,
            resultat.autresPistes.map((p) => {
              return [`${p.nom} (${p.marche.toUpperCase()} · ${sur10(scorePressenti(p.notes))})`, t(p.enUneLigne), t(p.raison)].join("\n");
            }),
            markdown,
            2,
          )
        : "",
      creusees.length ? [titre(L.pistesCreusees, markdown, 2), ...creusees].join("\n\n") : "",
      bloc(L.antiCible, [t(resultat.antiCible.portrait), puces(resultat.antiCible.signaux.map(t)), t(resultat.antiCible.lienAntiContexte), t(resultat.antiCible.commentDire)], markdown, 2),
      bloc(L.plan, plan, markdown, 2),
      resultat.hypotheses.length ? bloc(L.hypotheses, [puces(resultat.hypotheses.map(t))], markdown, 2) : "",
      bloc(L.motPourToi, [t(resultat.motPourToi)], markdown, 2),
    ].filter(Boolean).join("\n\n");
  };
  return { texte: rendre(false), markdown: rendre(true) };
}

/** Nom de fichier `le-cibleur-AAAA-MM-JJ.md` (en anglais `the-targeter-…`), jour de Paris. */
export function nomFichierExport(faitLe: string, M: MaCibleMessages = FR): string {
  const jour = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(faitLe));
  return `${M.export.nomFichier}-${jour}.md`;
}
