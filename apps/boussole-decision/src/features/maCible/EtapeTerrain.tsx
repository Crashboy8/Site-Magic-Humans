"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { Button, Card, Input } from "@/components/ui";
import type { ErreurChamp } from "@/domain/maCible/entree";
import { LIMITES } from "@/domain/maCible/limites";
import type { Adresse, Format, Marche, Style, Terrain } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { AlerteSoumission, BarreBoutons, ChampTexte, GroupePastilles, GroupeRadio, ResumeErreurs } from "./Champs";
import { defilerVersChamp } from "./defilement";
import { idChamp, messageChamp, messagePresBouton } from "./erreurs";
import { RappelConfidentialite } from "./Confidentialite";
import { Icone } from "./Icones";

const entrees = <T extends string>(o: Record<T, string>) => (Object.keys(o) as T[]).map((valeur) => ({ valeur, label: o[valeur] }));

function hauteurZone(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  const bordure = el.offsetHeight - el.clientHeight;
  el.style.height = `${el.scrollHeight + bordure}px`;
}

function ZoneIdee({
  id,
  valeur,
  placeholder,
  label,
  retirerLabel,
  onValeur,
  onRetirer,
}: {
  id?: string;
  valeur: string;
  placeholder: string;
  label: string;
  retirerLabel: string;
  onValeur: (v: string) => void;
  onRetirer: () => void;
}) {
  const zone = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = zone.current;
    if (!el) return;
    hauteurZone(el);
  }, [valeur]);
  return (
    <div className="flex items-start gap-2">
      <textarea
        ref={zone}
        id={id}
        rows={2}
        value={valeur}
        maxLength={LIMITES.ciblesEnTete.max}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => {
          hauteurZone(e.target);
          onValeur(e.target.value);
        }}
        className="min-h-[4.5rem] w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border border-ink/20 bg-paper px-4 py-2.5 text-[16px] leading-relaxed text-ink placeholder:text-ink-soft/70 focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent/25"
      />
      <button
        type="button"
        aria-label={retirerLabel}
        onClick={onRetirer}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-sand hover:text-ink"
      >
        <Icone nom="croix" className="size-5" />
      </button>
    </div>
  );
}

export function EtapeTerrain({
  terrain,
  prenom,
  erreurs,
  horsSujet,
  fournisseur,
  M,
  onChange,
  onPrenom,
  onRetour,
  onContinuer,
}: {
  terrain: Terrain;
  prenom: string;
  erreurs: ErreurChamp[];
  horsSujet: string | null;
  fournisseur: string;
  M: MaCibleMessages;
  onChange: (patch: Partial<Terrain>) => void;
  onPrenom: (v: string) => void;
  onRetour: () => void;
  onContinuer: () => void;
}) {
  const T = M.terrain;
  const erreurDe = (c: string) => erreurs.find((e) => e.champ === `terrain.${c}`);
  const libelles: Record<string, string> = {
    "terrain.offre": T.offre.label,
    "terrain.marche": T.marche.label,
    "terrain.experience": T.experience.label,
    "terrain.clientsPasses": T.clientsPasses.label,
    "terrain.zone": T.zone.label,
    "terrain.formats": T.formats.label,
    "terrain.prixActuel": T.prix.label,
  };
  const erreurMarche = erreurDe("marche");
  const premiere = erreurs[0];
  const messageBouton = premiere ? messagePresBouton(premiere, libelles[premiere.champ] ?? premiere.champ, M) : null;
  const idMarche = idChamp("terrain.marche");
  useEffect(() => {
    if (erreurs.length === 0) return;
    defilerVersChamp(idChamp(erreurs[0].champ));
  }, [erreurs]);

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onContinuer();
      }}
    >
      {horsSujet && (
        <div role="alert" className="rounded-xl border border-accent/30 bg-blush px-4 py-3 text-[15px] text-ink">
          <p>{M.erreurs.horsSujet}</p>
          {horsSujet && <p className="mt-1 text-ink-soft">{horsSujet}</p>}
        </div>
      )}
      <ResumeErreurs erreurs={erreurs} M={M} libelles={libelles} />
      <Card className="space-y-6 rounded-2xl p-6 sm:p-8">
        <ChampTexte
          champ="terrain.offre"
          label={T.offre.label}
          aide={T.offre.aide}
          exemple={T.offre.exemple}
          placeholder={T.offre.placeholder}
          value={terrain.offre}
          onChange={(v) => onChange({ offre: v })}
          erreur={erreurDe("offre")}
          flou="offre"
          maxLength={LIMITES.offre.max}
          M={M}
        />
        <GroupeRadio<Marche>
          nom="marche"
          legende={T.marche.label}
          options={entrees(T.marche.options)}
          valeur={terrain.marche}
          onChange={(v) => onChange({ marche: v })}
          erreur={erreurMarche ? messageChamp(erreurMarche, M) : undefined}
          id={idMarche}
          idErreur={`${idMarche}-erreur`}
        />
        <ChampTexte
          champ="terrain.experience"
          label={T.experience.label}
          aide={T.experience.aide}
          exemple={T.experience.exemple}
          placeholder={T.experience.placeholder}
          value={terrain.experience}
          onChange={(v) => onChange({ experience: v })}
          erreur={erreurDe("experience")}
          maxLength={LIMITES.experience.max}
          M={M}
        />
        <ChampTexte
          champ="terrain.clientsPasses"
          label={T.clientsPasses.label}
          aide={T.clientsPasses.aide}
          exemple={T.clientsPasses.exemple}
          placeholder={T.clientsPasses.placeholder}
          value={terrain.clientsPasses}
          onChange={(v) => onChange({ clientsPasses: v })}
          erreur={erreurDe("clientsPasses")}
          flou="clientsPasses"
          maxLength={LIMITES.clientsPasses.max}
          M={M}
        />
        <GroupePastilles<Format> legende={T.formats.label} aide={T.formats.aide} options={entrees(T.formats.options)} valeurs={terrain.formats} onChange={(v) => onChange({ formats: v })} />
        <ChampTexte
          champ="terrain.zone"
          label={T.zone.label}
          aide={T.zone.aide}
          exemple={T.zone.exemple}
          placeholder={T.zone.placeholder}
          value={terrain.zone}
          onChange={(v) => onChange({ zone: v })}
          erreur={erreurDe("zone")}
          multiligne={false}
          maxLength={LIMITES.zone.max}
          M={M}
        />
        <ChampTexte
          champ="terrain.prixActuel"
          label={T.prix.label}
          aide={T.prix.aide}
          exemple={T.prix.exemple}
          placeholder={T.prix.placeholder}
          value={terrain.prixActuel}
          onChange={(v) => onChange({ prixActuel: v })}
          erreur={erreurDe("prixActuel")}
          facultatif
          multiligne={false}
          maxLength={LIMITES.prixActuel.max}
          M={M}
        />
      </Card>

      <section className="space-y-4 rounded-2xl border-l-4 border-miel bg-miel-soft p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-miel">
            <Icone nom="cible" className="size-5" />
          </span>
          <h2 className="font-serif text-[22px] italic">
            {T.idees.titre} <span className="font-sans text-[15px] font-normal not-italic text-ink-soft">{M.commun.facultatif}</span>
          </h2>
        </div>
        <p className="text-[16px] text-ink-soft">{T.idees.aide}</p>
        <ul className="space-y-3">
          {(terrain.ciblesEnTete.length === 0 ? [""] : terrain.ciblesEnTete).map((valeur, i) => (
            <li key={i} className="space-y-1">
              <ZoneIdee
                id={i === 0 ? idChamp("terrain.ciblesEnTete") : undefined}
                valeur={valeur}
                placeholder={T.idees.placeholder}
                label={`${T.idees.titre} ${i + 1}`}
                retirerLabel={T.idees.retirerAide}
                onValeur={(v) => {
                  const base = terrain.ciblesEnTete.length === 0 ? [""] : [...terrain.ciblesEnTete];
                  base[i] = v;
                  onChange({ ciblesEnTete: base });
                }}
                onRetirer={() => {
                  const base = terrain.ciblesEnTete.length === 0 ? [""] : terrain.ciblesEnTete;
                  onChange({ ciblesEnTete: base.filter((_, j) => j !== i) });
                }}
              />
              {i === 0 && (
                <p className="text-sm text-ink-soft">
                  {M.commun.exemplePrefix}
                  {T.idees.exemple}
                </p>
              )}
              {valeur.length >= 100 && (
                <p className={`text-right text-sm tabular-nums ${valeur.length >= LIMITES.ciblesEnTete.max ? "font-medium text-danger" : "text-ink-soft"}`}>
                  {M.commun.compteur(valeur.length, LIMITES.ciblesEnTete.max)}
                </p>
              )}
            </li>
          ))}
        </ul>
        {terrain.ciblesEnTete.length < LIMITES.ciblesEnTete.items && (
          <Button
            type="button"
            variant="secondary"
            className="max-sm:w-full"
            onClick={() => onChange({ ciblesEnTete: [...(terrain.ciblesEnTete.length === 0 ? [""] : terrain.ciblesEnTete), ""] })}
          >
            {T.idees.ajouter}
          </Button>
        )}
      </section>

      <Card className="space-y-5 rounded-2xl p-6 sm:p-8">
        <h2 className="text-[22px] italic">{T.tonTitre}</h2>
        <GroupeRadio<Adresse> nom="adresse" legende={T.adresse.label} options={entrees(T.adresse.options)} valeur={terrain.adresse} onChange={(v) => onChange({ adresse: v })} />
        <GroupeRadio<Style> nom="style" legende={T.style.label} options={entrees(T.style.options)} valeur={terrain.style} onChange={(v) => onChange({ style: v })} />
        <div className="space-y-1.5">
          <label htmlFor="champ-prenom" className="block text-[15px] font-medium text-ink">
            {T.prenom.label} <span className="font-normal text-ink-soft">{M.commun.facultatif}</span>
          </label>
          <p id="champ-prenom-aide" className="text-sm text-ink-soft">
            {T.prenom.aide}
          </p>
          <Input id="champ-prenom" type="text" autoComplete="given-name" maxLength={40} value={prenom} onChange={(e) => onPrenom(e.target.value)} aria-describedby="champ-prenom-aide" />
        </div>
      </Card>

      <RappelConfidentialite M={M} fournisseur={fournisseur} />
      <BarreBoutons>
        <Button type="button" variant="secondary" onClick={onRetour}>
          {M.commun.retour}
        </Button>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <AlerteSoumission message={messageBouton} />
          <Button type="submit" className="max-sm:w-full">
            {T.continuer}
          </Button>
        </div>
      </BarreBoutons>
    </form>
  );
}
