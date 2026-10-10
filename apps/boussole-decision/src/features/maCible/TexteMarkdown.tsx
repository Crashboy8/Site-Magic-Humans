import { Fragment } from "react";
import { analyserMarkdown, type Noeud } from "@/domain/maCible/planEdite";

function rendreNoeuds(noeuds: Noeud[]): React.ReactNode {
  return noeuds.map((n, i) => {
    if (n.type === "texte") return <Fragment key={i}>{n.texte}</Fragment>;
    return n.type === "gras" ? <strong key={i}>{rendreNoeuds(n.enfants)}</strong> : <em key={i}>{rendreNoeuds(n.enfants)}</em>;
  });
}

/** Markdown léger (gras, italique, retours à la ligne) rendu en éléments React. Aucun HTML n'est injecté : le texte reste du texte. */
export function TexteMarkdown({ texte }: { texte: string }) {
  return (
    <>
      {texte.split("\n").map((ligne, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {rendreNoeuds(analyserMarkdown(ligne))}
        </Fragment>
      ))}
    </>
  );
}
