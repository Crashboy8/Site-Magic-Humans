// Conversion de chaque format vers du texte façon Markdown (cahier D.2). Tout dans le navigateur :
// le fichier ne part jamais au serveur. mammoth, pdf.js et fflate sont chargés à la demande.
import { ficheDepuisQuizBrut } from "@/domain/fiche/extraire";
import { htmlVersMarkdown } from "@/domain/fiche/html";

export { htmlVersMarkdown };
import type { FicheTalent, SourceFiche } from "@/domain/fiche/types";

export const FICHIER_MAX = 10 * 1024 * 1024;
export const TEXTE_MAX = 200_000;
const TEXTE_MIN = 80;

export type CodeLecture = "formatInconnu" | "tropGros" | "vide" | "lecture";
export type ResultatLecture =
  | { ok: true; texte: string; source: SourceFiche; ficheQcm?: FicheTalent }
  | { ok: false; code: CodeLecture };

const EXTENSIONS: Record<string, SourceFiche> = {
  docx: "word",
  pdf: "pdf",
  md: "notion",
  txt: "collage",
  html: "notion",
  htm: "notion",
  zip: "notion",
};

function extension(nom: string): string {
  return nom.split(".").pop()?.toLowerCase() ?? "";
}

/** Décode la partie CTQ1: des métadonnées d'un PDF du QCM (base64url, JSON). */
export function lireCtq(keywords: string | undefined): FicheTalent | null {
  const m = /CTQ1:([A-Za-z0-9_-]+)/.exec(keywords ?? "");
  if (!m) return null;
  try {
    const json = atob(m[1].replace(/-/g, "+").replace(/_/g, "/"));
    return ficheDepuisQuizBrut(JSON.parse(json));
  } catch {
    return null;
  }
}

async function lirePdf(buffer: ArrayBuffer): Promise<{ texte: string; ficheQcm: FicheTalent | null }> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const meta = await doc.getMetadata();
  const info = meta.info as { Keywords?: string } | undefined;
  const ficheQcm = lireCtq(info?.Keywords);
  const lignes: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const contenu = await page.getTextContent();
    for (const item of contenu.items) {
      if (!("str" in item)) continue;
      lignes.push(item.str);
      if (item.hasEOL) lignes.push("\n");
    }
  }
  return { texte: lignes.join("").replace(/\n{2,}/g, "\n"), ficheQcm };
}

async function lireZip(buffer: ArrayBuffer): Promise<{ texte: string; source: SourceFiche }> {
  const { unzipSync, strFromU8 } = await import("fflate");
  const fichiers = unzipSync(new Uint8Array(buffer));
  const candidats = Object.keys(fichiers)
    .filter((n) => /\.(md|html|htm)$/i.test(n))
    .sort((a, b) => fichiers[b].length - fichiers[a].length);
  const nom = candidats[0];
  if (!nom) throw new Error("vide");
  const brut = strFromU8(fichiers[nom]);
  const html = /\.html?$/i.test(nom);
  return { texte: html ? htmlVersMarkdown(brut) : brut, source: "notion" };
}

/** Lit un fichier déposé (≤ 10 Mo) et renvoie le texte façon Markdown. */
export async function lireFichier(fichier: File): Promise<ResultatLecture> {
  if (fichier.size > FICHIER_MAX) return { ok: false, code: "tropGros" };
  const ext = extension(fichier.name);
  const source = EXTENSIONS[ext];
  if (!source) return { ok: false, code: "formatInconnu" };
  try {
    if (ext === "txt" || ext === "md") return borner(await fichier.text(), source);
    if (ext === "html" || ext === "htm") return borner(htmlVersMarkdown(await fichier.text()), "notion");
    const buffer = await fichier.arrayBuffer();
    if (ext === "docx") {
      const mammoth = await import("mammoth");
      const { value } = await mammoth.convertToHtml({ arrayBuffer: buffer });
      return borner(htmlVersMarkdown(value), "word");
    }
    if (ext === "pdf") {
      const { texte, ficheQcm } = await lirePdf(buffer);
      if (ficheQcm) return { ok: true, texte: "", source: "qcm", ficheQcm };
      return borner(texte, "pdf");
    }
    const zip = await lireZip(buffer);
    return borner(zip.texte, zip.source);
  } catch {
    return { ok: false, code: "lecture" };
  }
}

function borner(texte: string, source: SourceFiche): ResultatLecture {
  const t = texte.slice(0, TEXTE_MAX);
  if (t.trim().length < TEXTE_MIN) return { ok: false, code: "vide" };
  return { ok: true, texte: t, source };
}

/** Collage : le HTML du presse-papiers s'il existe, sinon le texte brut. */
export function lireCollage(html: string, plain: string): ResultatLecture {
  const texte = html.trim() ? htmlVersMarkdown(html) : plain;
  return borner(texte, "collage");
}

/** Un lien #q= collé dans le texte renvoie directement la fiche du QCM. */
export function qcmDansTexte(texte: string): FicheTalent | null {
  const m = /#q=([A-Za-z0-9_-]+)/.exec(texte);
  if (!m) return null;
  try {
    const json = atob(m[1].replace(/-/g, "+").replace(/_/g, "/"));
    return ficheDepuisQuizBrut(JSON.parse(json));
  } catch {
    return null;
  }
}
