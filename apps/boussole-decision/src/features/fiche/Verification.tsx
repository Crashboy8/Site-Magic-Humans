"use client";

import { useMemo, useState, useTransition } from "react";
import { useI18n } from "@/i18n/client";
import { LIMITES_FICHE, validerFiche } from "@/domain/fiche/bornes";
import type { ChampTexte, FicheTalent, MethodeFiche, RapportLecture, SourceFiche } from "@/domain/fiche/types";
import { Icone } from "@/features/espace/Icones";
import { enregistrerFicheAction } from "./actions";
import { depuisFormulaire, estObligatoire, GROUPES, rempli, TEXTES_LONGS, versFormulaire, type ChampEcran, type Formulaire } from "./champs";

const ACCENT = "#C8333A";

const BADGES = {
  trouve: "bg-sage-soft text-sage",
  deduit: "bg-miel-soft text-miel",
  manque: "bg-corail-soft text-corail",
} as const;

const ICONES_GROUPES = { essentiel: "etoile", outils: "mallette", reste: "document" } as const;

/** Écran de vérification (E.5) : après une lecture, ou pour « Modifier ». Rien n'est gardé avant « Enregistrer ». */
export function Verification({
  fiche: initiale,
  rapport,
  source,
  methode,
}: {
  fiche: FicheTalent;
  /** null : remplissage à la main ou modification (trouvés = champs non vides). */
  rapport: RapportLecture | null;
  source: SourceFiche;
  methode: MethodeFiche;
}) {
  const V = useI18n().t.espace.verification;
  const [form, setForm] = useState<Formulaire>(() => versFormulaire(initiale));
  const [touches, setTouches] = useState<Set<string>>(() => new Set());
  const [consentement, setConsentement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [attente, start] = useTransition();

  const fiche = useMemo(() => depuisFormulaire(initiale, form), [initiale, form]);
  const validation = validerFiche(fiche);
  const erreurs = new Map(validation.ok ? [] : validation.erreurs.map((e) => [e.champ as string, e.code]));
  const trouves = new Set<string>(rapport?.trouves ?? GROUPES.flatMap((g) => g.champs).filter((c) => rempli(initiale, c)));
  const deduits = new Set<string>(rapport?.deduits ?? []);

  function badge(c: ChampEcran): keyof typeof BADGES | null {
    if (deduits.has(c)) return "deduit";
    if (trouves.has(c) && rempli(fiche, c)) return "trouve";
    if (estObligatoire(c) && !rempli(fiche, c)) return "manque";
    return null;
  }

  function changer(cle: string, valeur: string) {
    setForm((f) => ({ ...f, textes: { ...f.textes, [cle]: valeur } }));
  }

  function enregistrer() {
    setErreur(null);
    start(async () => {
      const r = await enregistrerFicheAction(JSON.stringify(fiche), source, methode, consentement);
      if (r?.error) setErreur(r.error);
    });
  }

  function message(c: ChampEcran): string | null {
    const code = erreurs.get(c);
    if (!code || (!touches.has(c) && !rempli(fiche, c))) return null;
    return code === "requis" ? V.erreurs.requis : V.erreurs.tropCourt;
  }

  function rendreChamp(c: ChampEcran) {
    const b = badge(c);
    const id = `fiche-${c}`;
    const entete = (libelle: string, pour?: string) => (
      <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <label htmlFor={pour} className="text-base font-medium text-ink">
          {libelle}
        </label>
        {b && <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGES[b]}`}>{V.badges[b]}</span>}
      </div>
    );
    const champClasse = "w-full rounded-xl border border-ink/20 bg-paper px-3.5 py-2.5 text-base leading-relaxed text-ink focus:border-[#0E7490] focus:outline-none focus:ring-2 focus:ring-[#0E7490]/25";

    if (c === "avatars") {
      return (
        <fieldset key={c} className="space-y-3">
          <legend className="mb-1 flex w-full flex-wrap items-center justify-between gap-2 text-base font-medium text-ink">
            {V.champs.avatars}
            {b && <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGES[b]}`}>{V.badges[b]}</span>}
          </legend>
          {form.avatars.map((a, i) => (
            <div key={i} className="space-y-2.5 rounded-xl border border-line bg-cream/60 p-3">
              <p className="flex items-center gap-2 text-base font-medium text-ink">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0E7490] text-sm text-white" aria-hidden="true">
                  {i + 1}
                </span>
                {`${V.champs.avatars} ${i + 1}`}
              </p>
              {(["profil", "besoins", "apport"] as const).map((k) => {
                const libelle = V.champs[k === "profil" ? "avatarProfil" : k === "besoins" ? "avatarBesoins" : "avatarApport"];
                return (
                  <div key={k}>
                    <label htmlFor={`${id}-${i}-${k}`} className="mb-1 block text-sm font-medium text-ink-soft">
                      {libelle}
                    </label>
                    <textarea
                      id={`${id}-${i}-${k}`}
                      rows={2}
                      value={a[k]}
                      maxLength={LIMITES_FICHE.avatars.texte}
                      onChange={(e) => setForm((f) => ({ ...f, avatars: f.avatars.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) }))}
                      className={champClasse}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </fieldset>
      );
    }

    if (c === "enneagramme") {
      return (
        <div key={c} className="grid gap-3 sm:grid-cols-2">
          {(["base", "sousType"] as const).map((k) => (
            <div key={k}>
              {entete(k === "base" ? V.champs.enneagrammeBase : V.champs.enneagrammeSousType, `${id}-${k}`)}
              <input
                id={`${id}-${k}`}
                value={form.enneagramme[k]}
                maxLength={LIMITES_FICHE.enneagramme}
                onChange={(e) => setForm((f) => ({ ...f, enneagramme: { ...f.enneagramme, [k]: e.target.value } }))}
                className={champClasse}
              />
            </div>
          ))}
        </div>
      );
    }

    const estListe = Array.isArray(initiale[c]);
    const long = estListe || TEXTES_LONGS.includes(c as ChampTexte);
    const aide = c === "mecanisme" ? V.champs.mecanismeAide : c === "contexte" ? V.champs.contexteAide : estListe ? V.uneParLigne : null;
    const msg = message(c);
    const valeur = form.textes[c] ?? "";
    return (
      <div key={c}>
        {entete(V.champs[c as keyof typeof V.champs] as string, id)}

        {aide && (
          <p id={`${id}-aide`} className="mb-1.5 text-sm text-ink-soft">
            {aide}
          </p>
        )}
        {long ? (
          <textarea
            id={id}
            rows={estListe ? Math.min(8, Math.max(3, valeur.split("\n").length + 1)) : 3}
            value={valeur}
            aria-describedby={aide ? `${id}-aide` : undefined}
            aria-invalid={msg ? true : undefined}
            onChange={(e) => changer(c, e.target.value)}
            onBlur={() => setTouches((t) => new Set(t).add(c))}
            className={champClasse}
          />
        ) : (
          <input
            id={id}
            value={valeur}
            aria-invalid={msg ? true : undefined}
            onChange={(e) => changer(c, e.target.value)}
            onBlur={() => setTouches((t) => new Set(t).add(c))}
            className={champClasse}
          />
        )}
        {msg && (
          <p className="mt-1 text-sm text-danger" role="alert">
            {msg}
          </p>
        )}
      </div>
    );
  }

  const bandeau = rapport ? (rapport.methode === "modele" ? V.luOk : V.luPartiel) : V.intro;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2.5 font-serif text-[26px] italic leading-tight">
          <Icone nom="crayon" className="h-6 w-6 shrink-0" />
          {V.titre}
        </h2>
        <p className={`mt-3 rounded-xl border px-4 py-3 text-base ${rapport?.methode === "mots_cles" ? "border-miel/30 bg-miel-soft text-ink" : "border-sage/30 bg-sage-soft text-ink"}`} role="status">
          {bandeau}
        </p>
      </div>

      {GROUPES.map((g) => (
        <details key={g.cle} open={g.ouvert} className="group rounded-[14px] border border-line bg-white" style={{ borderLeft: `4px solid ${g.cle === "essentiel" ? ACCENT : g.cle === "outils" ? "#0E7490" : "#C4922A"}` }}>
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-2 font-serif text-[22px] italic leading-tight">
              <Icone nom={ICONES_GROUPES[g.cle]} className="h-5 w-5 shrink-0" />
              {V.groupes[g.cle]}
            </span>
            <Icone nom="fleche" className="h-5 w-5 shrink-0 rotate-90 text-ink-soft transition-transform group-open:-rotate-90" />
          </summary>
          <div className="space-y-4 border-t border-line px-4 pb-5 pt-4">{g.champs.map(rendreChamp)}</div>
        </details>
      ))}

      <label className="flex items-start gap-3 rounded-xl border border-line bg-cream px-4 py-3 text-base text-ink">
        <input type="checkbox" checked={consentement} onChange={(e) => setConsentement(e.target.checked)} className="mt-0.5 h-6 w-6 shrink-0" style={{ accentColor: ACCENT }} />
        <span>
          {V.consentement}{" "}
          <a href="https://www.magichumans.com/confidentialite/#mon-espace" target="_blank" rel="noopener" className="font-medium text-link underline underline-offset-4">
            {V.enSavoirPlus}
          </a>
        </span>
      </label>

      {erreur && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-base text-danger">
          {erreur}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <button
          type="button"
          onClick={enregistrer}
          disabled={!validation.ok || !consentement || attente}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          style={{ background: ACCENT }}
        >
          <Icone nom="document" className="h-5 w-5" />
          {V.enregistrer}
        </button>
        <a href="/boussole-decision/mon-espace/" className="inline-flex min-h-11 items-center justify-center text-base font-medium text-link underline underline-offset-4">
          {V.annuler}
        </a>
      </div>
    </div>
  );
}
