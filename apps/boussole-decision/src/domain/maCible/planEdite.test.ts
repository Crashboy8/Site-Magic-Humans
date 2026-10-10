import { describe, expect, it } from "vitest";
import { RESULTAT_EXEMPLE } from "./exemple";
import {
  BLOCS_MAX,
  TEXTE_ACTION_MAX,
  ajouterAction,
  ajouterTitre,
  analyserMarkdown,
  basculerFait,
  changerTexte,
  cochesDepuisPlan,
  deplacerBloc,
  enTexteBrut,
  lirePlan,
  planDepuisResultat,
  planEnMarkdown,
  planEnTexte,
  supprimerBloc,
  type PlanEdite,
} from "./planEdite";

const T = new Date("2026-10-10T10:00:00Z");
const plan = (coches: boolean[] = []): PlanEdite => planDepuisResultat(RESULTAT_EXEMPLE, coches, { titreSemaine: (n, t) => `Semaine ${n} : ${t}` }, "2026-10-09T08:00:00Z", T);
const ids = (p: PlanEdite) => p.blocs.map((b) => b.id);

describe("plan d'origine", () => {
  it("met à plat 4 titres et 12 actions, avec des identifiants stables", () => {
    const p = plan([true]);
    expect(p.blocs).toHaveLength(16);
    expect(p.blocs[0]).toMatchObject({ id: "s0", type: "titre" });
    expect(p.blocs[1]).toMatchObject({ id: "a0", type: "action", fait: true, origine: 0 });
    expect(p.blocs[2]).toMatchObject({ id: "a1", fait: false, origine: 1 });
    expect(ids(plan())).toEqual(ids(plan()));
  });
  it("retrouve les cases cochées du plan d'origine", () => {
    const p = basculerFait(plan(), "a3", T);
    expect(cochesDepuisPlan(p, 12).map(Number)).toEqual([0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("Markdown léger", () => {
  it("lit le gras et l'italique", () => {
    expect(analyserMarkdown("Écris **vite** et *bien*")).toEqual([
      { type: "texte", texte: "Écris " },
      { type: "gras", enfants: [{ type: "texte", texte: "vite" }] },
      { type: "texte", texte: " et " },
      { type: "italique", enfants: [{ type: "texte", texte: "bien" }] },
    ]);
  });
  it("laisse intact ce qui n'est pas fermé", () => {
    expect(enTexteBrut("2 * 3 = 6 et **ouvert")).toBe("2 * 3 = 6 et **ouvert");
  });
  it("ne transforme jamais une balise HTML : elle reste du texte", () => {
    const html = '<img src=x onerror="alert(1)"> **<script>alert(1)</script>**';
    const noeuds = analyserMarkdown(html);
    expect(JSON.stringify(noeuds)).toContain("<script>");
    expect(enTexteBrut(html)).toBe('<img src=x onerror="alert(1)"> <script>alert(1)</script>');
  });
  it("retire les marques en texte brut", () => {
    expect(enTexteBrut("**Gras** et *italique* 🎯")).toBe("Gras et italique 🎯");
  });
});

describe("modifications", () => {
  it("modifie un texte et le borne", () => {
    const p = changerTexte(plan(), "a0", "x".repeat(TEXTE_ACTION_MAX + 50), T);
    expect(p.blocs[1].texte).toHaveLength(TEXTE_ACTION_MAX);
    expect(p.maj).toBe(T.toISOString());
  });
  it("un titre tient sur une ligne et perd son « # »", () => {
    const p = changerTexte(plan(), "s0", "## Ma\nsemaine", T);
    expect(p.blocs[0].texte).toBe("Ma semaine");
    expect(changerTexte(plan(), "s0", "### Titre\nsuite", T).blocs[0].texte).toBe("Titre suite");
  });
  it("supprime un bloc", () => {
    expect(ids(supprimerBloc(plan(), "a1", T))).not.toContain("a1");
  });
  it("déplace une action d'un cran, y compris dans la section voisine", () => {
    const p = deplacerBloc(plan(), "a1", -1, T);
    expect(ids(p).slice(0, 4)).toEqual(["s0", "a1", "a0", "a2"]);
    const q = deplacerBloc(plan(), "a2", 1, T);
    expect(ids(q).slice(2, 6)).toEqual(["a1", "s1", "a2", "a3"]);
  });
  it("ne déplace pas au-delà des bords", () => {
    const p = plan();
    expect(deplacerBloc(p, "s0", -1, T)).toBe(p);
    expect(deplacerBloc(p, "a11", 1, T)).toBe(p);
  });
  it("déplace une section avec ses actions", () => {
    const p = deplacerBloc(plan(), "s1", -1, T);
    expect(ids(p).slice(0, 8)).toEqual(["s1", "a3", "a4", "a5", "s0", "a0", "a1", "a2"]);
    const q = deplacerBloc(plan(), "s0", 1, T);
    expect(ids(q).slice(0, 8)).toEqual(["s1", "a3", "a4", "a5", "s0", "a0", "a1", "a2"]);
  });
  it("ajoute une action à la fin de sa section, vide, sans détail", () => {
    const r = ajouterAction(plan(), "a0", T);
    expect(r).not.toBeNull();
    expect(ids(r!.plan).slice(0, 6)).toEqual(["s0", "a0", "a1", "a2", r!.id, "s1"]);
    expect(r!.plan.blocs.find((b) => b.id === r!.id)).toMatchObject({ type: "action", texte: "", fait: false, detail: null, origine: null });
  });
  it("ajoute une section à la fin et refuse de dépasser la limite", () => {
    const r = ajouterTitre(plan(), T);
    expect(r!.plan.blocs.at(-1)).toMatchObject({ type: "titre", texte: "" });
    let p = plan();
    while (p.blocs.length < BLOCS_MAX) p = ajouterAction(p, null, T)!.plan;
    expect(ajouterAction(p, null, T)).toBeNull();
    expect(ajouterTitre(p, T)).toBeNull();
  });
});

describe("export", () => {
  it("écrit les titres et les actions en Markdown, en ignorant les lignes vides", () => {
    let p = changerTexte(plan(), "s0", "🎯 **Semaine de départ**", T);
    p = changerTexte(p, "a0", "Appeler *trois* anciens collègues\nPuis noter les réponses", T);
    p = ajouterAction(p, "a0", T)!.plan;
    const lignes = planEnMarkdown(p.blocs);
    expect(lignes.slice(0, 4)).toEqual(["### 🎯 **Semaine de départ**", "- Appeler *trois* anciens collègues", "  Puis noter les réponses", `- ${RESULTAT_EXEMPLE.plan30[0].actions[1].texte}`]);
    expect(lignes.filter((l) => l === "- ")).toHaveLength(0);
  });
  it("écrit le texte brut sans marques", () => {
    const p = changerTexte(changerTexte(plan(), "s0", "**Départ**", T), "a0", "Faire *ça* 🔥", T);
    expect(planEnTexte(p.blocs).slice(0, 2)).toEqual(["DÉPART", "- Faire ça 🔥"]);
  });
});

describe("lecture tolérante", () => {
  it("accepte un plan valide et le nettoie", () => {
    const lu = lirePlan({ v: 1, maj: "2026-10-10T10:00:00Z", resultatLe: "2026-10-09T08:00:00Z", blocs: [{ id: "x1", type: "titre", texte: "## Titre\u0000" }, { id: "x2", type: "action", texte: "Faire", fait: true, detail: { cible: "c1", canal: "email", minutes: 15 }, origine: 2 }] });
    expect(lu?.blocs).toEqual([
      { id: "x1", type: "titre", texte: "Titre" },
      { id: "x2", type: "action", texte: "Faire", fait: true, detail: { cible: "c1", canal: "email", minutes: 15 }, origine: 2 },
    ]);
  });
  it("refuse ce qui n'est pas un plan, ignore les blocs abîmés, borne le nombre de blocs", () => {
    expect(lirePlan(null)).toBeNull();
    expect(lirePlan({ v: 2, blocs: [] })).toBeNull();
    expect(lirePlan({ v: 1, blocs: Array(BLOCS_MAX + 1).fill({ type: "titre", texte: "a" }) })).toBeNull();
    const lu = lirePlan({ v: 1, blocs: [{ type: "autre", texte: "a" }, { type: "action" }, { type: "action", texte: "ok", detail: { cible: "c1", canal: "pirate", minutes: 1 } }] });
    expect(lu?.blocs).toHaveLength(1);
    expect(lu?.blocs[0]).toMatchObject({ texte: "ok", detail: null, fait: false });
  });
  it("garde des identifiants uniques", () => {
    const lu = lirePlan({ v: 1, blocs: [{ id: "a", type: "titre", texte: "1" }, { id: "a", type: "titre", texte: "2" }] });
    expect(new Set(ids(lu!)).size).toBe(2);
  });
});
