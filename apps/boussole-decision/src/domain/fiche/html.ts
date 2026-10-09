// HTML (collage Notion, export Notion, sortie de mammoth) → texte façon Markdown (cahier D.2).
// Module pur, sans DOMParser : même résultat dans le navigateur et dans les tests.

interface Noeud {
  tag: string;
  enfants: (Noeud | string)[];
}

const VIDES = new Set(["br", "hr", "img", "meta", "link", "input", "col", "area", "base", "wbr", "source"]);
const JETES = new Set(["script", "style", "svg", "img", "head", "title", "noscript", "template"]);
const BLOCS = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "tr", "table", "ul", "ol", "div", "aside", "figure", "blockquote", "summary", "details", "section", "article", "header", "footer", "main", "body", "html", "thead", "tbody", "tfoot", "dl", "dt", "dd", "pre"]);

const ENTITES: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", laquo: "«", raquo: "»", rsquo: "’", lsquo: "‘", hellip: "…", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", ecirc: "ê", ocirc: "ô", ucirc: "û", icirc: "î" };

export function decoderEntites(t: string): string {
  return t.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : "";
    }
    return ENTITES[e.toLowerCase()] ?? m;
  });
}

/** Arbre minimal (tolérant aux balises mal fermées). */
function arbre(html: string): Noeud {
  const racine: Noeud = { tag: "racine", enfants: [] };
  const pile: Noeud[] = [racine];
  const re = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>|[^<]+|</g;
  let jete = 0;
  for (const m of html.matchAll(re)) {
    const brut = m[0];
    if (brut.startsWith("<!--")) continue;
    const tag = m[1]?.toLowerCase();
    if (!tag) {
      if (!jete) pile[pile.length - 1].enfants.push(decoderEntites(brut));
      continue;
    }
    const fermante = brut.startsWith("</");
    if (JETES.has(tag) && !VIDES.has(tag)) {
      if (fermante) jete = Math.max(0, jete - 1);
      else if (!brut.endsWith("/>")) jete++;
      continue;
    }
    if (jete) continue;
    if (fermante) {
      for (let i = pile.length - 1; i > 0; i--) {
        if (pile[i].tag === tag) {
          pile.length = i;
          break;
        }
      }
      continue;
    }
    const noeud: Noeud = { tag, enfants: [] };
    pile[pile.length - 1].enfants.push(noeud);
    if (!VIDES.has(tag) && !brut.endsWith("/>")) pile.push(noeud);
  }
  return racine;
}

function texte(n: Noeud | string, avecBr = false): string {
  if (typeof n === "string") return n;
  if (n.tag === "br") return avecBr ? "<br>" : " ";
  return n.enfants.map((e) => texte(e, avecBr)).join("");
}

const propre = (t: string) => t.replace(/\s+/g, " ").trim();

function texteGras(n: Noeud | string, dansGras = false): string {
  if (typeof n === "string") return dansGras ? n : "";
  const gras = dansGras || n.tag === "strong" || n.tag === "b";
  return n.enfants.map((e) => texteGras(e, gras)).join("");
}

function contientBloc(n: Noeud): boolean {
  return n.enfants.some((e) => typeof e !== "string" && (BLOCS.has(e.tag) || contientBloc(e)));
}

function cellules(tr: Noeud): string[] {
  return tr.enfants
    .filter((e): e is Noeud => typeof e !== "string" && (e.tag === "td" || e.tag === "th"))
    .map((c) => propre(texte(c, true)).replace(/\s*<br>\s*/g, "<br>").replace(/\|/g, "/"));
}

export function htmlVersMarkdown(html: string): string {
  const blocs: string[] = [];

  function bloc(n: Noeud) {
    const t = n.tag;
    if (/^h[1-6]$/.test(t) || t === "summary") {
      const x = propre(texte(n));
      if (x) blocs.push(`# ${x}`);
      return;
    }
    if (t === "li") {
      const enfantsBloc = n.enfants.filter((e): e is Noeud => typeof e !== "string" && (e.tag === "ul" || e.tag === "ol"));
      const propreLi = propre(n.enfants.filter((e) => typeof e === "string" || (e.tag !== "ul" && e.tag !== "ol")).map((e) => texte(e)).join(""));
      if (propreLi) blocs.push(`- ${propreLi}`);
      enfantsBloc.forEach(bloc);
      return;
    }
    if (t === "tr") {
      const c = cellules(n);
      if (c.length) blocs.push(`| ${c.join(" | ")} |`);
      return;
    }
    if (t === "br") return;
    if (contientBloc(n) || t === "racine" || t === "table" || t === "ul" || t === "ol" || t === "thead" || t === "tbody") {
      let enLigne = "";
      const vider = () => {
        const x = propre(enLigne);
        if (x) blocs.push(x);
        enLigne = "";
      };
      for (const e of n.enfants) {
        if (typeof e === "string") enLigne += e;
        else if (BLOCS.has(e.tag) || contientBloc(e)) {
          vider();
          bloc(e);
        } else if (e.tag === "br") vider();
        else enLigne += texte(e);
      }
      vider();
      return;
    }
    // Bloc sans enfant bloc : une ligne (ou plusieurs si <br>).
    const morceaux = texte(n, true).split("<br>").map(propre).filter(Boolean);
    const tout = propre(texte(n));
    const gras = propre(texteGras(n));
    if (morceaux.length === 1 && tout.length <= 90 && gras.replace(/\s/g, "") === tout.replace(/\s/g, "") && tout) {
      blocs.push(`# ${tout}`);
      return;
    }
    blocs.push(...morceaux);
  }

  bloc(arbre(html));
  return blocs.join("\n");
}

/** Vrai si le texte ressemble à du HTML (fiche Word convertie, export Notion). */
export function estHtml(t: string): boolean {
  return /<(p|h[1-6]|ul|ol|table|div|aside|body|html)\b/i.test(t);
}
