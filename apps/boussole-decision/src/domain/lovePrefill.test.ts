import { describe, expect, it } from "vitest";
import { LOVE_TEMPLATE, LOVE_TEXTS } from "@/content/amour";
import { DEFAULT_WEIGHTS } from "./scoring";
import { applyLovePrefill, decodeLoveHash, LOVE_NOTE_MAX, parseLovePrefill } from "./lovePrefill";

const FIXTURE =
  "eyJ2IjoyLCJpbXAiOnsiZW5lcmdpZSI6InRyZXNfaW1wb3J0YW50IiwiZnJpY3Rpb25zIjoiaW1wb3J0YW50IiwibGFuZ2FnZSI6ImltcG9ydGFudCIsImNvbXBsZW1lbnRhcml0ZSI6Im1veWVuIn0sIm5vdGVzIjp7ImJlc29pbnMiOiJTw6ljdXJpdMOpIGV0IGZpYWJpbGl0w6ksIGFpbcOpwrdlIHZyYWltZW50LiIsImVuZXJnaWUiOiJUdSB0ZSByZWNoYXJnZXMgc2V1bMK3ZS4ifX0";

const weightOf = (rows: { importance: string }[]) => rows.reduce((sum, row) => sum + DEFAULT_WEIGHTS[row.importance as keyof typeof DEFAULT_WEIGHTS], 0);

describe("lovePrefill", () => {
  it("décode une ancre du quiz et applique poids et notes", () => {
    const raw = decodeLoveHash("#amour=" + FIXTURE);
    const parsed = parseLovePrefill(raw);
    expect(parsed?.notes.besoins).toBe("Sécurité et fiabilité, aimé·e vraiment.");
    const rows = applyLovePrefill(parsed);
    const byKey = Object.fromEntries(rows.map((row) => [row.key, row]));
    expect(byKey.energie.importance).toBe("tres_important");
    expect(byKey.frictions.importance).toBe("important");
    expect(byKey.langage.importance).toBe("important");
    expect(byKey.complementarite.importance).toBe("moyen");
    expect(byKey.besoins.description.endsWith(LOVE_TEXTS.quizNoteLabel + "Sécurité et fiabilité, aimé·e vraiment.")).toBe(true);
    expect(byKey.energie.description.endsWith(LOVE_TEXTS.quizNoteLabel + "Tu te recharges seul·e.")).toBe(true);
  });

  it("ignore un imp invalide en entier", () => {
    const doubled = parseLovePrefill({
      v: 2,
      imp: { energie: "tres_important", frictions: "tres_important", langage: "important", complementarite: "moyen" },
      notes: { besoins: "une note" },
    });
    expect(doubled?.imp).toEqual({});
    const missing = parseLovePrefill({
      v: 2,
      imp: { energie: "tres_important", frictions: "important", langage: "important" },
      notes: { besoins: "une note" },
    });
    expect(missing?.imp).toEqual({});
    const critique = parseLovePrefill({
      v: 2,
      imp: { energie: "critique", frictions: "important", langage: "important", complementarite: "moyen" },
      notes: { besoins: "une note" },
    });
    expect(critique?.imp).toEqual({});
    for (const parsed of [doubled, missing, critique]) {
      const rows = applyLovePrefill(parsed);
      for (const criterion of LOVE_TEMPLATE.criteria) {
        expect(rows.find((row) => row.key === criterion.key)?.importance).toBe(criterion.importance);
      }
    }
  });

  it("laisse les critères critiques fixes et un total de 42", () => {
    const parsed = parseLovePrefill({
      v: 2,
      imp: { energie: "moyen", frictions: "tres_important", langage: "important", complementarite: "important", besoins: "moyen" },
      notes: { respect: "ne doit pas passer", incompatibilite: "enfants" },
    });
    const rows = applyLovePrefill(parsed);
    for (const criterion of LOVE_TEMPLATE.criteria.filter((item) => item.importance === "critique")) {
      expect(rows.find((row) => row.key === criterion.key)?.importance).toBe("critique");
    }
    expect(weightOf(rows)).toBe(42);
    expect(weightOf(applyLovePrefill(null))).toBe(42);
  });

  it("nettoie les notes", () => {
    const parsed = parseLovePrefill({
      v: 2,
      notes: {
        respect: "secret",
        inconnu: "non",
        besoins: "  bonjour  <script>  ",
        valeurs: 12,
        energie: "x".repeat(LOVE_NOTE_MAX + 40),
        frictions: "   ",
      },
    });
    expect(parsed?.notes.respect).toBeUndefined();
    expect(parsed?.notes.inconnu).toBeUndefined();
    expect(parsed?.notes.valeurs).toBeUndefined();
    expect(parsed?.notes.frictions).toBeUndefined();
    expect(parsed?.notes.besoins).toBe("bonjour script");
    expect(parsed?.notes.energie).toHaveLength(LOVE_NOTE_MAX);
  });

  it("décode une ancre produite par le quiz v1.3", () => {
    const encoded =
      "eyJ2IjoyLCJpbXAiOnsiZW5lcmdpZSI6InRyZXNfaW1wb3J0YW50IiwiZnJpY3Rpb25zIjoiaW1wb3J0YW50IiwibGFuZ2FnZSI6ImltcG9ydGFudCIsImNvbXBsZW1lbnRhcml0ZSI6Im1veWVuIn0sIm5vdGVzIjp7ImJlc29pbnMiOiJDZSBxdWkgdGUgbm91cnJpdCA6IMOqdHJlIMOpY291dMOpwrdlLCByaXJlIGVuc2VtYmxlLCBwb3V2b2lyIGNvbXB0ZXIgc3VyIGwnYXV0cmUuIENlIHF1aSB0ZSB2aWRlIDogZGV2b2lyIHRlIGp1c3RpZmllciBkZSB0b3V0IGV0IGxlcyBjcml0aXF1ZXMgcsOpcMOpdMOpZXMuIiwidmFsZXVycyI6IlRlcyB2YWxldXJzLCBkYW5zIGwnb3JkcmUgOiBsJ2hvbm7DqnRldMOpLCBsYSBmaWTDqWxpdMOpLCBsZSByZXNwZWN0LiIsImRlZmF1dHMiOiJDZSBxdWUgdHUgYXMgZHUgbWFsIMOgIHZpdnJlIGNoZXogbCdhdXRyZSA6IGxlcyBjcml0aXF1ZXMgcsOpcMOpdMOpZXMuIiwiZnJpY3Rpb25zIjoiU291cyBzdHJlc3MgZm9ydCwgdHUgYXMgdGVuZGFuY2Ugw6AgY29udHJlLWF0dGFxdWVyLiBTb3VzIHN0cmVzcyBtb2TDqXLDqSwgdHUgcHJlbmRzIGxlcyBjaG9zZXMgZW4gbWFpbi4gUmVww6hyZSBzaSB2b3MgZGlzcHV0ZXMgZmluaXNzZW50IHBhciB1biB2cmFpIGFjY29yZC4iLCJlbmVyZ2llIjoiVHUgdGUgcmVjaGFyZ2VzIHNldWzCt2UsIGF1IGNhbG1lLiBDZSBxdWkgdGUgdmlkZSA6IGRldm9pciB0ZSBqdXN0aWZpZXIgZGUgdG91dCBldCBsZXMgY3JpdGlxdWVzIHLDqXDDqXTDqWVzLiIsImxhbmdhZ2UiOiJUdSB0ZSBzZW5zIGFpbcOpwrdlIHN1cnRvdXQgcGFyIGxlcyBwYXJvbGVzIHZhbG9yaXNhbnRlcywgcHVpcyBsZXMgbW9tZW50cyBkZSBxdWFsaXTDqS4iLCJjb21wbGVtZW50YXJpdGUiOiJUb24gc291cy10eXBlIGRvbWluYW50IDogY29uc2VydmF0aW9uLiBDb25zZXJ2YXRpb24gZXQgdMOqdGUtw6AtdMOqdGUgOiBsJ3VuIGNoZXJjaGUgbGEgc8OpY3VyaXTDqSwgbCdhdXRyZSBsJ2ludGVuc2l0w6kuIEVuc2VtYmxlLCB2b3VzIHBvdXZleiBhbGxpZXIgc3RhYmlsaXTDqSBldCBwYXNzaW9uLCBzaSBsJ3VuIG5lIHZpdCBwYXMgbCdhdXRyZSBjb21tZSDCqyB0cm9wIGNhbG1lIMK7IG91IMKrIHRyb3AgaW50ZW5zZSDCuy4iLCJpbmNvbXBhdGliaWxpdGUiOiJUZXMgbm9uLW7DqWdvY2lhYmxlcyBkJ2FwcsOocyBsZSBxdWl6IDogbCdob25uw6p0ZXTDqSA7IGxhIGZpZMOpbGl0w6kgOyBsZSByZXNwZWN0LiBDZSBxdWUgdHUgbmUgdmV1eCBwbHVzIHZpdnJlIDogZGV2b2lyIHRlIGp1c3RpZmllciBkZSB0b3V0LiJ9fQ";
    const parsed = parseLovePrefill(decodeLoveHash("#amour=" + encoded));
    expect(parsed?.notes.besoins).toContain("être écouté·e");
    expect(parsed?.notes.valeurs).toContain("l'honnêteté");
    expect(parsed?.notes.incompatibilite).toContain("devoir te justifier de tout");
    const rows = applyLovePrefill(parsed);
    expect(weightOf(rows)).toBe(42);
    expect(rows).toHaveLength(10);
    const byKey = Object.fromEntries(rows.map((row) => [row.key, row]));
    expect(byKey.energie.importance).toBe("tres_important");
    expect(byKey.incompatibilite.description).toContain(LOVE_TEXTS.quizNoteLabel);
    expect(byKey.respect.description).toBe(LOVE_TEMPLATE.criteria.find((c) => c.key === "respect")?.guide);
  });

  it("refuse une ancre absente, illisible ou d'une autre version", () => {
    expect(decodeLoveHash("")).toBeNull();
    expect(decodeLoveHash("#amour=!!!")).toBeNull();
    expect(decodeLoveHash("#amour=" + "A".repeat(4001))).toBeNull();
    expect(parseLovePrefill(decodeLoveHash("#amour=e30"))).toBeNull();
    expect(parseLovePrefill({ v: 1, notes: { besoins: "note" } })).toBeNull();
    const rows = applyLovePrefill(null);
    expect(rows.map((row) => row.label)).toEqual(LOVE_TEMPLATE.criteria.map((criterion) => criterion.label));
    expect(rows.map((row) => row.description)).toEqual(LOVE_TEMPLATE.criteria.map((criterion) => criterion.guide));
    expect(rows.map((row) => row.importance)).toEqual(LOVE_TEMPLATE.criteria.map((criterion) => criterion.importance));
  });
});
