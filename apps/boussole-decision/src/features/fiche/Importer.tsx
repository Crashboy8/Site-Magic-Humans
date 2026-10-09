"use client";

import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { useI18n } from "@/i18n/client";
import type { Messages } from "@/i18n/messages";
import type { EspaceMessages } from "@/i18n/messages/espace";
import { champsRemplis, ficheVide } from "@/domain/fiche/bornes";
import { lireFiche } from "@/domain/fiche/extraire";
import { CHAMPS_OBLIGATOIRES, type FicheTalent, type MethodeFiche, type RapportLecture, type SourceFiche } from "@/domain/fiche/types";
import { Icone, type NomIcone } from "@/features/espace/Icones";
import { lireCollage, lireFichier, qcmDansTexte } from "./lireDocument";
import { Verification } from "./Verification";

type Tuile = "lien" | "coller" | "fichier" | "main";
type TextesImport = EspaceMessages["importer"];
type CodeLien = keyof TextesImport["lien"]["erreurs"];

const tuiles = (I: TextesImport): { cle: Tuile; icone: NomIcone; couleur: string; titre: string; texte: string }[] => [
  { cle: "lien", icone: "lien", couleur: "#0E7490", titre: I.lien.titre, texte: I.lien.texte },
  { cle: "coller", icone: "pressePapiers", couleur: "#6E4E96", titre: I.coller.titre, texte: I.coller.texte },
  { cle: "fichier", icone: "dossier", couleur: "#1F7A6E", titre: I.fichier.titre, texte: I.fichier.texte },
  { cle: "main", icone: "crayon", couleur: "#C4922A", titre: I.main.titre, texte: I.main.texte },
];

interface Lu {
  fiche: FicheTalent;
  rapport: RapportLecture | null;
  source: SourceFiche;
  methode: MethodeFiche;
}

/** Fiche venue du QCM : tout ce qui est rempli compte comme « trouvé ». */
function depuisQcm(fiche: FicheTalent): Lu {
  const trouves = champsRemplis(fiche);
  return {
    fiche,
    source: "qcm",
    methode: "modele",
    rapport: { trouves, deduits: [], manquants: CHAMPS_OBLIGATOIRES.filter((c) => !fiche[c]), methode: "modele" },
  };
}

function depuisTexte(texte: string, source: SourceFiche): Lu {
  const qcm = qcmDansTexte(texte);
  if (qcm) return depuisQcm(qcm);
  const { fiche, rapport } = lireFiche(texte);
  return { fiche, rapport, source, methode: rapport.methode };
}

/** Accès client : lien Notion, PDF, Word ou « plus tard ». Les autres façons restent à un clic. */
type TuileClient = "notion" | "pdf" | "word" | "plusTard";

const tuilesClient = (T: Messages["client"]["accueilImport"]["tuiles"]): { cle: TuileClient; icone: NomIcone; couleur: string; titre: string; texte: string }[] => [
  { cle: "notion", icone: "lien", couleur: "#0E7490", titre: T.notion.titre, texte: T.notion.texte },
  { cle: "pdf", icone: "pdf", couleur: "#B34716", titre: T.pdf.titre, texte: T.pdf.texte },
  { cle: "word", icone: "word", couleur: "#1F7A6E", titre: T.word.titre, texte: T.word.texte },
  { cle: "plusTard", icone: "horloge", couleur: "#6B5D4E", titre: T.plusTard.titre, texte: T.plusTard.texte },
];

/**
 * Les quatre façons de déposer sa fiche (E.5), puis la vérification sur la même page.
 * variante « client » (arrivée par le lien de Pierre) : 3 tuiles directes (Notion, PDF, Word) et « Plus tard » ;
 * lienInitial : le lien Notion mis par Pierre sur le code, déjà dans le champ.
 */
export function Importer({ variante, lienInitial }: { variante?: "client"; lienInitial?: string | null } = {}) {
  const { t: tout } = useI18n();
  const I = tout.espace.importer;
  const A = tout.client.accueilImport;
  const [complet, setComplet] = useState(variante !== "client");
  const [ouverte, setOuverte] = useState<Tuile | null>(lienInitial ? "lien" : null);
  const [lecture, setLecture] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [pasPublique, setPasPublique] = useState(false);
  const [lien, setLien] = useState(lienInitial ?? "");
  const [survol, setSurvol] = useState(false);
  const [lu, setLu] = useState<Lu | null>(null);
  const collage = useRef<HTMLDivElement>(null);
  const fichier = useRef<HTMLInputElement>(null);
  const panneau = useRef<HTMLDivElement>(null);
  const pdf = useRef<HTMLInputElement>(null);
  const word = useRef<HTMLInputElement>(null);
  const premier = useRef(Boolean(lienInitial));

  // Sur mobile, le panneau ouvert est sous les quatre tuiles : on l'amène à l'écran.
  // Sauf à l'arrivée avec le lien déjà prérempli : on laisse voir l'accueil.
  useEffect(() => {
    if (premier.current) {
      premier.current = false;
      return;
    }
    if (!ouverte || !panneau.current) return;
    panneau.current.scrollIntoView({ behavior: "smooth", block: "start" });
    panneau.current.querySelector<HTMLElement>("input[type=url], [contenteditable]")?.focus({ preventScroll: true });
  }, [ouverte]);

  // La vérification remplace la page : on repart du haut.
  useEffect(() => {
    if (lu) window.scrollTo({ top: 0 });
  }, [lu]);

  if (lu) {
    return <Verification fiche={lu.fiche} rapport={lu.rapport} source={lu.source} methode={lu.methode} />;
  }

  function ouvrir(t: Tuile) {
    setErreur(null);
    setPasPublique(false);
    if (t === "main") {
      setLu({ fiche: ficheVide(), rapport: null, source: "manuel", methode: "manuel" });
      return;
    }
    setOuverte(t);
  }

  function lireCollee() {
    const zone = collage.current;
    if (!zone) return;
    const r = lireCollage(zone.innerHTML, zone.innerText);
    if (!r.ok) return setErreur(I.erreurs[r.code]);
    setLu(depuisTexte(r.texte, "collage"));
  }

  async function lireDepot(f: File | undefined) {
    if (!f) return;
    setErreur(null);
    setLecture(I.lecture);
    const r = await lireFichier(f);
    setLecture(null);
    if (!r.ok) return setErreur(I.erreurs[r.code]);
    setLu(r.ficheQcm ? depuisQcm(r.ficheQcm) : depuisTexte(r.texte, r.source));
  }

  async function lireLien() {
    setErreur(null);
    setPasPublique(false);
    setLecture(I.lien.lecture);
    let code: CodeLien = "indisponible";
    try {
      const reponse = await fetch("/boussole-decision/api/fiche/notion/", {
        method: "POST",
        body: JSON.stringify({ lien }),
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(20_000),
      });
      const corps = (await reponse.json().catch(() => null)) as { ok?: boolean; texte?: string; code?: string } | null;
      if (corps?.ok && typeof corps.texte === "string") {
        setLecture(null);
        setLu(depuisTexte(corps.texte, "lien_notion"));
        return;
      }
      if (corps?.code && corps.code in I.lien.erreurs) code = corps.code as CodeLien;
    } catch (e) {
      code = e instanceof DOMException && e.name === "TimeoutError" ? "delai" : "indisponible";
    }
    setLecture(null);
    if (code === "pas_publique") setPasPublique(true);
    else setErreur(I.lien.erreurs[code]);
  }

  function deposer(e: DragEvent) {
    e.preventDefault();
    setSurvol(false);
    void lireDepot(e.dataTransfer.files[0]);
  }

  function ouvrirClient(t: TuileClient) {
    setErreur(null);
    setPasPublique(false);
    if (t === "notion") return setOuverte("lien");
    setOuverte(null);
    (t === "pdf" ? pdf : word).current?.click();
  }

  return (
    <div className="space-y-5">
      {complet && variante !== "client" && (
        <header className="space-y-2">
          <h1 className="font-serif text-[32px] italic leading-tight sm:text-4xl">{I.titre}</h1>
          <p className="text-base leading-relaxed text-ink-soft">{I.intro}</p>
        </header>
      )}
      {!complet && (
        <>
          <input ref={pdf} type="file" accept=".pdf,application/pdf" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void lireDepot(e.target.files?.[0])} />
          <input ref={word} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void lireDepot(e.target.files?.[0])} />
          <div className="grid grid-cols-2 gap-3">
            {tuilesClient(A.tuiles).map((t) => {
              const active = t.cle === "notion" && ouverte === "lien";
              const contenu = (
                <>
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white" style={{ background: t.couleur }} aria-hidden="true">
                      <Icone nom={t.icone} className="h-[22px] w-[22px]" />
                    </span>
                    <span className="min-w-0 font-serif text-[20px] italic leading-tight text-ink">{t.titre}</span>
                  </span>
                  <span className="mt-2 block text-[15px] leading-snug text-ink-soft">{t.texte}</span>
                </>
              );
              const classe = "flex min-h-[104px] flex-col rounded-[14px] p-3.5 text-left transition-shadow hover:shadow-[0_2px_10px_rgba(58,47,36,0.08)]";
              const style = { border: `1px solid ${active ? t.couleur : "rgb(58 47 36 / 0.14)"}`, borderTop: `4px solid ${t.couleur}`, background: active ? `${t.couleur}0D` : "#fff" };
              return t.cle === "plusTard" ? (
                <a key={t.cle} href="/boussole-decision/mon-espace/" className={classe} style={{ ...style, background: "#FBF7F0" }}>
                  {contenu}
                </a>
              ) : (
                <button key={t.cle} type="button" aria-expanded={t.cle === "notion" ? active : undefined} onClick={() => ouvrirClient(t.cle)} className={classe} style={style}>
                  {contenu}
                </button>
              );
            })}
          </div>
          {lienInitial && ouverte === "lien" && (
            <p className="flex items-center gap-2 rounded-xl border border-sage/30 bg-sage-soft px-4 py-3 text-base text-ink">
              <Icone nom="coche" className="h-5 w-5 shrink-0 text-sage" />
              {A.lienPret}
            </p>
          )}
        </>
      )}
      {complet && (
      <div className="grid gap-3 sm:grid-cols-2">
        {tuiles(I).map((t) => {
          const active = ouverte === t.cle;
          return (
            <button
              key={t.cle}
              type="button"
              aria-expanded={t.cle === "main" ? undefined : active}
              onClick={() => ouvrir(t.cle)}
              className="flex min-h-[92px] items-start gap-3 rounded-[14px] bg-white p-4 text-left transition-shadow hover:shadow-[0_2px_10px_rgba(58,47,36,0.08)]"
              style={{ border: `1px solid ${active ? t.couleur : "rgb(58 47 36 / 0.14)"}`, borderLeft: `4px solid ${t.couleur}`, background: active ? `${t.couleur}0D` : "#fff" }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white" style={{ background: t.couleur }} aria-hidden="true">
                <Icone nom={t.icone} className="h-[22px] w-[22px]" />
              </span>
              <span className="min-w-0">
                <span className="block font-serif text-[20px] italic leading-tight text-ink">{t.titre}</span>
                <span className="mt-1 block text-[15px] leading-snug text-ink-soft">{t.texte}</span>
              </span>
            </button>
          );
        })}
      </div>
      )}

      {lecture && (
        <p role="status" className="flex items-center gap-2.5 rounded-xl border border-sky-line bg-sky-soft px-4 py-3 text-base text-ink">
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#0E7490] border-t-transparent" aria-hidden="true" />
          {lecture}
        </p>
      )}

      <div ref={panneau} className="scroll-mt-4 space-y-5">
      {ouverte === "lien" && !lecture && (
        <Panneau couleur="#0E7490" icone="lien" titre={I.lien.titre}>
          <label htmlFor="lien-notion" className="block text-base font-medium text-ink">
            {I.lien.champ}
          </label>
          <input
            id="lien-notion"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder={I.lien.exemple}
            value={lien}
            onChange={(e) => setLien(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lien.trim() && void lireLien()}
            className="w-full rounded-xl border border-ink/20 bg-paper px-4 py-2.5 text-base text-ink focus:border-[#0E7490] focus:outline-none focus:ring-2 focus:ring-[#0E7490]/25"
          />
          <p className="text-sm text-ink-soft">{I.lien.prive}</p>
          <Bouton couleur="#0E7490" onClick={() => void lireLien()} disabled={!lien.trim()}>
            {I.lien.bouton}
          </Bouton>
          {pasPublique && <AidePasPublique ouvrir={(t) => { setPasPublique(false); setOuverte(t); }} />}
        </Panneau>
      )}

      {ouverte === "coller" && (
        <Panneau couleur="#6E4E96" icone="pressePapiers" titre={I.coller.titre}>
          <div
            ref={collage}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={I.coller.zone}
            data-placeholder={I.coller.zone}
            className="max-h-[50vh] min-h-40 overflow-auto rounded-xl border border-dashed border-[#6E4E96]/50 bg-paper px-4 py-3 text-base text-ink empty:before:text-ink-soft/80 empty:before:content-[attr(data-placeholder)] focus:outline-none focus:ring-2 focus:ring-[#6E4E96]/25"
          />
          <Bouton couleur="#6E4E96" onClick={lireCollee}>
            {I.coller.bouton}
          </Bouton>
        </Panneau>
      )}

      {ouverte === "fichier" && !lecture && (
        <Panneau couleur="#1F7A6E" icone="dossier" titre={I.fichier.titre}>
          <div
            onDragOver={(e) => { e.preventDefault(); setSurvol(true); }}
            onDragLeave={() => setSurvol(false)}
            onDrop={deposer}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-6 text-center ${survol ? "border-[#1F7A6E] bg-[#E5F6F3]" : "border-[#1F7A6E]/40 bg-paper"}`}
          >
            <input ref={fichier} type="file" accept=".docx,.pdf,.md,.txt,.html,.htm,.zip" className="sr-only" id="fichier-fiche" onChange={(e) => void lireDepot(e.target.files?.[0])} />
            <Bouton couleur="#1F7A6E" onClick={() => fichier.current?.click()}>
              <Icone nom="dossier" className="h-5 w-5" />
              {I.fichier.bouton}
            </Bouton>
            <p className="hidden text-base text-ink-soft sm:block">{I.fichier.glisser}</p>
          </div>
        </Panneau>
      )}

      {erreur && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-base text-danger">
          {erreur}
        </p>
      )}
      </div>

      {!complet && (
        <button type="button" onClick={() => { setComplet(true); setOuverte(null); }} className="min-h-11 text-left text-base font-medium text-link underline underline-offset-4">
          {A.autreFacon}
        </button>
      )}

      <details className="rounded-[14px] border border-sky-line bg-sky-soft">
        <summary className="flex min-h-12 cursor-pointer items-center gap-2 px-4 py-3 text-base font-medium text-ciel">
          <Icone nom="document" className="h-5 w-5 shrink-0" />
          {I.aide.titre}
        </summary>
        <ol className="list-decimal space-y-2 px-4 pb-4 pl-9 text-base leading-relaxed text-ink">
          {I.aide.etapes.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}

function Panneau({ couleur, icone, titre, children }: { couleur: string; icone: NomIcone; titre: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-[14px] border border-line bg-white p-4 sm:p-5" style={{ borderTop: `4px solid ${couleur}` }} aria-label={titre}>
      <h2 className="flex items-center gap-2 font-serif text-[22px] italic leading-tight" style={{ color: couleur }}>
        <Icone nom={icone} className="h-5 w-5 shrink-0" />
        {titre}
      </h2>
      {children}
    </section>
  );
}

function Bouton({ couleur, children, ...props }: { couleur: string; children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      style={{ background: couleur }}
    >
      {children}
    </button>
  );
}

function AidePasPublique({ ouvrir }: { ouvrir: (t: "coller" | "fichier") => void }) {
  const P = useI18n().t.espace.importer.lien.pasPublique;
  return (
    <div role="alert" className="space-y-3 rounded-xl border border-miel/30 bg-miel-soft px-4 py-4 text-base text-ink">
      <p className="font-serif text-[20px] italic leading-tight">{P.titre}</p>
      <p>{P.intro}</p>
      <ol className="list-decimal space-y-1.5 pl-5">
        {P.etapes.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ol>
      <p>{P.apres}</p>
      <p>{P.pierre}</p>
      <p className="font-medium">{P.autres}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={() => ouvrir("coller")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#6E4E96]/40 bg-white px-5 font-medium text-[#6E4E96]">
          <Icone nom="pressePapiers" className="h-5 w-5" />
          {P.coller}
        </button>
        <button type="button" onClick={() => ouvrir("fichier")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#1F7A6E]/40 bg-white px-5 font-medium text-[#1F7A6E]">
          <Icone nom="dossier" className="h-5 w-5" />
          {P.exporter}
        </button>
      </div>
    </div>
  );
}
