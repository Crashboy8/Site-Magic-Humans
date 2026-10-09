// Blocs Notion → texte façon Markdown (cahier D.6). Module pur, testé sur des réponses simulées.

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Bloc = Record<string, any>;
export type Blocs = Record<string, unknown>;

const IGNORES = new Set([
  "image", "video", "audio", "file", "pdf", "bookmark", "embed", "code", "equation", "external_object_instance",
  "breadcrumb", "table_of_contents", "alias", "button", "collection_view", "collection_view_page", "page",
  "link_to_page", "drive", "figma", "tweet",
]);
const CONTENEURS = new Set(["column_list", "column", "transclusion_container"]);
const PREFIXES: Record<string, string> = {
  header: "# ",
  sub_header: "## ",
  sub_sub_header: "### ",
  toggle: "# ",
  bulleted_list: "- ",
  numbered_list: "1. ",
  to_do: "- [ ] ",
  quote: "> ",
  text: "",
  callout: "",
};
const MENTIONS = new Set(["p", "u", "d", "m", "lm", "eoi", "s"]);
const PROFONDEUR_MAX = 12;
export const TEXTE_MAX = 200_000;

/** Valeur d'un bloc : Notion renvoie aujourd'hui value.value, l'ancienne forme n'a qu'une enveloppe. */
export function valeurBloc(entree: unknown): Bloc {
  const v = (entree as Bloc | null)?.value;
  if (!v || typeof v !== "object") return {};
  return v.value && typeof v.value === "object" ? v.value : v;
}

/** Texte riche Notion : segments concaténés, mentions (pages, personnes, dates) jetées, adresses des liens jamais gardées. */
export function texteRiche(prop: unknown): string {
  if (!Array.isArray(prop)) return "";
  let sortie = "";
  for (const seg of prop) {
    if (!Array.isArray(seg)) continue;
    const t = typeof seg[0] === "string" ? seg[0] : "";
    const decos = Array.isArray(seg[1]) ? seg[1] : [];
    if (t === "\u2023" && decos.some((d: unknown) => Array.isArray(d) && MENTIONS.has(d[0]))) continue;
    sortie += t;
  }
  return sortie;
}

function pointeur(b: Bloc): string | undefined {
  const id = b.format?.transclusion_reference_pointer?.id;
  return typeof id === "string" ? id : undefined;
}

/** Ids à aller chercher : parcours depuis la racine, sans entrer dans les sous-pages. */
export function idsManquants(blocs: Blocs, racine: string): string[] {
  const vus = new Set<string>();
  const manque: string[] = [];
  const pile = [racine];
  while (pile.length) {
    const id = pile.pop() as string;
    if (vus.has(id)) continue;
    vus.add(id);
    if (!(id in blocs)) {
      manque.push(id);
      continue;
    }
    const b = valeurBloc(blocs[id]);
    if (id !== racine && IGNORES.has(b.type)) continue;
    if (Array.isArray(b.content)) pile.push(...b.content.filter((x: unknown): x is string => typeof x === "string"));
    const ptr = pointeur(b);
    if (ptr) pile.push(ptr);
  }
  return manque;
}

function lignesBloc(b: Bloc, blocs: Blocs, racine: string, profondeur: number): string[] {
  if (profondeur > PROFONDEUR_MAX || b.alive === false) return [];
  const t = b.type as string;
  const props = (b.properties ?? {}) as Bloc;
  const enfants: string[] = Array.isArray(b.content) ? b.content : [];
  let sortie: string[];
  if (b.id === racine) {
    sortie = [`# ${texteRiche(props.title).trim()}`];
  } else if (IGNORES.has(t)) {
    return [];
  } else if (t === "divider") {
    return ["---"];
  } else if (t === "table") {
    const ordre: string[] = Array.isArray(b.format?.table_block_column_order) ? b.format.table_block_column_order : [];
    const lignes: string[] = [];
    for (const rid of enfants) {
      if (!(rid in blocs)) continue;
      const r = valeurBloc(blocs[rid]);
      if (r.type !== "table_row" || r.alive === false) continue;
      const rp = (r.properties ?? {}) as Bloc;
      const cellules = ordre.map((c) => texteRiche(rp[c]).trim().replace(/\n/g, "<br>"));
      lignes.push(`| ${cellules.join(" | ")} |`);
    }
    return lignes;
  } else if (t === "transclusion_reference") {
    const ptr = pointeur(b);
    return ptr && ptr in blocs ? lignesBloc(valeurBloc(blocs[ptr]), blocs, racine, profondeur + 1) : [];
  } else if (CONTENEURS.has(t)) {
    sortie = [];
  } else {
    const txt = texteRiche(props.title).trim();
    sortie = [];
    if (txt) {
      const parts = txt
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);
      sortie.push((PREFIXES[t] ?? "") + parts[0], ...parts.slice(1));
    }
  }
  for (const cid of enfants) {
    if (cid in blocs) sortie.push(...lignesBloc(valeurBloc(blocs[cid]), blocs, racine, profondeur + 1));
  }
  return sortie;
}

/** Texte de la page (lignes jointes par \n, sans saut de ligne final), tronqué à 200 000 caractères. */
export function blocsVersTexte(blocs: Blocs, racine: string): string {
  if (!(racine in blocs)) return "";
  return lignesBloc(valeurBloc(blocs[racine]), blocs, racine, 0).join("\n").slice(0, TEXTE_MAX);
}
