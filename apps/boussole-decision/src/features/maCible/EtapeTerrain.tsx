"use client";

import { Button, Card, Input } from "@/components/ui";
import type { ErreurChamp } from "@/domain/maCible/entree";
import type { Adresse, Format, Marche, Style, Terrain } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { BarreBoutons, ChampTexte, GroupePastilles, GroupeRadio, ResumeErreurs } from "./Champs";
import { idChamp, messageChamp } from "./erreurs";
import { RappelConfidentialite } from "./Confidentialite";

const entrees = <T extends string>(o: Record<T, string>) => (Object.keys(o) as T[]).map((valeur) => ({ valeur, label: o[valeur] }));

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
          M={M}
        />
        <GroupeRadio<Marche>
          nom="marche"
          legende={T.marche.label}
          options={entrees(T.marche.options)}
          valeur={terrain.marche}
          onChange={(v) => onChange({ marche: v })}
          erreur={erreurMarche ? messageChamp(erreurMarche, M) : undefined}
          idErreur={idChamp("terrain.marche")}
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
          M={M}
        />
      </Card>

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
        <Button type="submit">{T.continuer}</Button>
      </BarreBoutons>
    </form>
  );
}
