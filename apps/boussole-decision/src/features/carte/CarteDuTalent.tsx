"use client";

import { useRef, useState } from "react";
import { Button, Notice } from "@/components/ui";
import { CarteInvalide, exportCarte, parseCarte, scoreLieu } from "@/domain/carte";
import { CarteSvg } from "./CarteSvg";
import { enregistrerCarte, rechargerDemo, useCarte } from "./stockage";
import { TEXTES } from "./textes";

/** Étape 1 : la carte statique, son stockage dans le navigateur et l'export/import. */
export function CarteDuTalent() {
  const carte = useCarte();
  const fichier = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ton: "success" | "error"; texte: string } | null>(null);

  function exporter() {
    const blob = new Blob([exportCarte(carte)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      carte.nom
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "carte"
    }.carte-du-talent.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importer(file: File) {
    try {
      const nouvelle = parseCarte(JSON.parse(await file.text()));
      enregistrerCarte(nouvelle);
      setMessage({ ton: "success", texte: TEXTES.importReussi });
    } catch (e) {
      setMessage({ ton: "error", texte: e instanceof CarteInvalide ? e.message : TEXTES.importEchoue });
    }
  }

  const tries = [...carte.lieux]
    .map((l) => ({ lieu: l, score: scoreLieu(l, carte.criteres) }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={exporter}>
          {TEXTES.exporter}
        </Button>
        <Button type="button" variant="secondary" onClick={() => fichier.current?.click()}>
          {TEXTES.importer}
        </Button>
        <input
          ref={fichier}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importer(f);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (confirm(TEXTES.confirmerDemo)) {
              rechargerDemo();
              setMessage(null);
            }
          }}
        >
          {TEXTES.rechargerDemo}
        </Button>
      </div>
      {message && <Notice tone={message.ton}>{message.texte}</Notice>}

      <div className="overflow-hidden rounded-2xl border border-line shadow-sm">
        <CarteSvg carte={carte} />
      </div>
      <p className="text-sm text-ink-soft">{TEXTES.stockage}</p>

      <section aria-labelledby="lieux" className="space-y-3">
        <h2 id="lieux" className="text-2xl italic">
          {TEXTES.tableauTitre}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-paper">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sand/60 text-left">
                <th scope="col" className="px-3 py-2 font-medium">
                  {TEXTES.colonneLieu}
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  {TEXTES.colonneStatut}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  {TEXTES.colonneScore}
                </th>
                {carte.criteres.map((c) => (
                  <th key={c.id} scope="col" className="min-w-[110px] px-3 py-2 text-right font-normal text-ink-soft">
                    {c.label} <span className="whitespace-nowrap">×{c.poids}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tries.map(({ lieu, score }) => (
                <tr key={lieu.id} className="border-t border-line">
                  <th scope="row" className="px-3 py-2 text-left font-semibold">
                    {lieu.nom}
                  </th>
                  <td className="whitespace-nowrap px-3 py-2">{TEXTES.statuts[lieu.statut]}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {score === null ? TEXTES.nonEvalue : `${Math.round(score)} %`}
                  </td>
                  {carte.criteres.map((c) => (
                    <td key={c.id} className="px-3 py-2 text-right tabular-nums">
                      {lieu.scores[c.id] ?? TEXTES.nonEvalue}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
