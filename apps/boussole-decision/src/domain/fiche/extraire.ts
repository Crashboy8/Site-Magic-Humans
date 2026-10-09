// Étapes 4 et 5 du lecteur (cahier D.3, D.5) : lignes → fiche Talent Unique. Module pur.
import { parseQuizResult, type QuizResult } from "@/domain/quizImport";
import { bornerFiche, ficheVide } from "./bornes";
import { completerFiche } from "./completer";
import { cle, estTexteAide, morceaux, versLignes, type Ligne } from "./lignes";
import { sectionDe, type Section } from "./sections";
import { CHAMPS_OBLIGATOIRES, type ChampListe, type FicheTalent, type RapportLecture } from "./types";

export { completerFiche } from "./completer";

type CibleTexte = "contexte" | "talonAchille" | "sousPression" | "phraseAntiValeurs";
/** Ce qui reçoit les lignes suivantes, choisi par un sous-titre. */
type Cible = { liste: ChampListe } | { texte: CibleTexte; actif: boolean } | { ignorer: true } | null;

const PRENOM = /^[\p{L}][\p{L}'-]{0,30}$/u;

/** Valeur d'origine après le premier « : ». */
function apresDeuxPoints(t: string): string {
  const i = t.indexOf(":");
  return i < 0 ? "" : t.slice(i + 1).trim();
}

function decouperVirgules(t: string): string[] {
  return t
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Retire les guillemets autour d'une citation. */
function sansGuillemets(t: string): string {
  return t
    .replace(/^[«"“]\s*/, "")
    .replace(/\s*[»"”]\s*\.?$/, "")
    .trim();
}

function citation(t: string): string | null {
  const m = /[«"“]\s*([^«»"“”]{12,})\s*[»"”]/.exec(t);
  return m ? m[1].trim() : null;
}

type Etiquette =
  | { champ: "titre" | "mecanisme" | "contexte" | "paradoxe" | "prenom" | "base" | "sousType" | "resume" | "image" }
  | { champ: "qualites" | "defauts" }
  | { champ: "pourquoi" }
  | { champ: "ignorer" };

/** Étiquettes en ligne (valables dans toutes les sections). */
function etiquette(c: string): (Etiquette & { prenomTrouve?: string }) | null {
  if (/^pourquoi \?/.test(c)) return { champ: "pourquoi" };
  if (/^exemples de besoins/.test(c)) return { champ: "ignorer" };
  if (/^(date|interviewer|methode|session filmee|lien video|lien de la conversation|recommande par)/.test(c) && c.includes(" : ")) return { champ: "ignorer" };
  if (!c.includes(" : ") && !/ :$/.test(c)) return null;
  if (/^titre du talent :/.test(c)) return { champ: "titre" };
  if (/^le talent unique (de |d')([^:]{1,40}) :/.test(c)) return { champ: "mecanisme" };
  if (/^(son |mon )?contexte declencheur( commun)? :/.test(c)) return { champ: "contexte" };
  if (/^cote face( \(qualites\))? :/.test(c)) return { champ: "qualites" };
  if (/^cote pile( \(defauts\))? :/.test(c)) return { champ: "defauts" };
  if (/^mon plus grand talent = mon plus grand defaut :/.test(c)) return { champ: "paradoxe" };
  if (/^prenom et nom :/.test(c)) return { champ: "prenom" };
  if (/^(base|type) :/.test(c) || /^son enneagramme/.test(c)) return { champ: "base" };
  if (/^sous-type :/.test(c) || /^son sous-type/.test(c)) return { champ: "sousType" };
  if (/^resume :/.test(c)) return { champ: "resume" };
  if (/^(son|mon) image :/.test(c)) return { champ: "image" };
  return null;
}

/** Sous-titres de liste propres à une section (étape 4, point 2 et 4 bis). */
function sousTitre(section: Section | null, c: string, vusResume: number): Cible | "classees" | "resumePhrase" | undefined {
  if (c.length > 120 || !section) return undefined;
  switch (section) {
    case "contextes":
    case "paradoxe":
      if (/contexte declencheur commun/.test(c) || /^(son |mon )?contexte declencheur$/.test(c)) return { texte: "contexte", actif: false };
      if (/contexte negatif|contexte piege|ne fonctionne pas|devient un defaut/.test(c) || (section === "contextes" && /ce qui (l'|le |la )?eteint/.test(c) && !/vibrer|allume/.test(c))) return { liste: "echec" };
      if (/contexte positif|contexte ideal|ou (ce|mon) talent (est une force|fonctionne)/.test(c) || (section === "contextes" && /ce qui (l'|le |la )?(allume|fait vibrer)/.test(c))) return { liste: "reussite" };
      if (/qualites associees|^qualites|cote face/.test(c)) return { liste: "qualites" };
      if (/defauts associes|^defauts|cote pile/.test(c)) return { liste: "defauts" };
      return undefined;
    case "valeurs":
      if (/classees par importance/.test(c)) return "classees";
      if (/^anti-?valeurs/.test(c)) return { liste: "antiValeurs" };
      if (/^valeurs/.test(c)) return { liste: "valeurs" };
      if (/^resume en une phrase/.test(c)) return vusResume === 0 ? "resumePhrase" : { texte: "phraseAntiValeurs", actif: false };
      return undefined;
    case "ecologie":
      if (/^j'?aime quand/.test(c)) return { liste: "aimeQuand" };
      if (/^mon manag(er|eur)/.test(c)) return { liste: "managerIdeal" };
      if (/^autres contraintes/.test(c)) return { liste: "contraintes" };
      return undefined;
    case "details":
      if (/^talon d'?achille/.test(c)) return { texte: "talonAchille", actif: false };
      if (/^fonctionnement quand on m'?empeche/.test(c)) return { texte: "sousPression", actif: false };
      if (/^points de vigilance/.test(c)) return { liste: "vigilance" };
      if (/^axes d'?amelioration/.test(c) || /^pistes a explorer/.test(c)) return { liste: "axes" };
      return undefined;
    case "metiers":
      if (/complementaires/.test(c)) return { ignorer: true };
      if (/parfaitement compatibles/.test(c)) return { liste: "metiersParfaits" };
      if (/tres compatibles/.test(c)) return { liste: "metiersTres" };
      if (/a condition de developper/.test(c)) return { liste: "metiersCondition" };
      if (/^secteurs d'?activite/.test(c)) return { liste: "secteurs" };
      return undefined;
    default:
      return undefined;
  }
}

class Lecteur {
  f: FicheTalent = ficheVide();
  section: Section | null = null;
  cible: Cible = null;
  colonnes: Cible[] | null = null;
  vusResume = 0;
  resumeBloque = false;
  formulation: string[] = [];
  avatarsPuces: string[] = [];
  avatarsTableau = false;
  enAttente: Etiquette | null = null;

  ajouterListe(champ: ChampListe, valeur: string) {
    const v = valeur.trim();
    if (!v || estTexteAide(v)) return;
    (this.f[champ] as string[]).push(v);
  }

  ajouterTexte(cible: { texte: CibleTexte; actif: boolean }, valeur: string) {
    if (!cible.actif || !valeur || estTexteAide(valeur)) return;
    this.f[cible.texte] = this.f[cible.texte] ? `${this.f[cible.texte]} ${valeur}` : valeur;
  }

  /** Active un sous-titre ; `reste` = texte après « : » sur la même ligne. */
  choisir(st: Exclude<ReturnType<typeof sousTitre>, undefined>, reste: string) {
    if (st === "classees") {
      this.f.valeurs = [];
      this.cible = { liste: "valeurs" };
    } else if (st === "resumePhrase") {
      this.vusResume++;
      this.cible = { ignorer: true };
      return;
    } else if (st && "texte" in st) {
      if (st.texte === "phraseAntiValeurs") this.vusResume++;
      this.cible = { texte: st.texte, actif: !this.f[st.texte] };
    } else {
      this.cible = st;
    }
    if (reste) this.verser(reste);
  }

  /** Verse une ligne dans la cible courante. */
  verser(valeur: string) {
    const c = this.cible;
    if (!c || "ignorer" in c) return;
    if ("liste" in c) this.ajouterListe(c.liste, valeur);
    else this.ajouterTexte(c, valeur);
  }

  finSection() {
    if (this.section === "formulation" && !this.f.mecanisme) {
      const cite = this.formulation.map(citation).find(Boolean);
      const sinon = this.formulation.find((l) => l.length >= 30 && !/^le talent unique/.test(cle(l)));
      this.f.mecanisme = sansGuillemets(cite ?? sinon ?? "");
    }
    this.formulation = [];
  }

  ouvrir(section: Section) {
    this.finSection();
    this.section = section;
    this.cible = null;
    this.colonnes = null;
    if (section === "resume") this.resumeBloque = Boolean(this.f.resume);
    if (section === "neutre") this.section = null;
  }

  appliquerEtiquette(e: Etiquette, texte: string, valeur: string) {
    switch (e.champ) {
      case "ignorer":
        return;
      case "titre":
        if (!this.f.titre) this.f.titre = valeur;
        return;
      case "image":
        if (!this.f.titre) this.f.titre = valeur;
        return;
      case "resume":
        if (!this.f.resume) this.f.resume = valeur;
        return;
      case "mecanisme": {
        if (!this.f.mecanisme) this.f.mecanisme = sansGuillemets(valeur);
        const m = /^\s*le talent unique (?:de |d['’])\s*([^:]{1,40}?)\s*:/i.exec(texte);
        const p = m?.[1].trim() ?? "";
        if (!this.f.prenom && PRENOM.test(p)) this.f.prenom = p;
        return;
      }
      case "contexte":
        if (!this.f.contexte) this.f.contexte = valeur;
        return;
      case "qualites":
        decouperVirgules(valeur).forEach((v) => this.ajouterListe("qualites", v));
        return;
      case "defauts":
        decouperVirgules(valeur).forEach((v) => this.ajouterListe("defauts", v));
        return;
      case "paradoxe":
        if (!this.f.paradoxe) this.f.paradoxe = valeur;
        return;
      case "prenom": {
        const p = valeur.split(/\s+/)[0] ?? "";
        if (!this.f.prenom && PRENOM.test(p)) this.f.prenom = p;
        return;
      }
      case "base":
        if (!this.f.enneagramme.base) this.f.enneagramme.base = valeur;
        return;
      case "sousType":
        if (!this.f.enneagramme.sousType) this.f.enneagramme.sousType = valeur;
        return;
      case "pourquoi": {
        const v = valeur || texte.replace(/^\s*pourquoi\s*\?\s*:?\s*/i, "").trim();
        const n = this.f.secteurs.length;
        if (n && v && !this.f.secteurs[n - 1].includes(" : ")) this.f.secteurs[n - 1] = `${this.f.secteurs[n - 1]} : ${v}`;
        return;
      }
    }
  }

  /** Une ligne de texte (pas une ligne de tableau à plusieurs cellules). */
  ligne(l: Ligne) {
    const c = cle(l.texte);
    // Valeur d'une étiquette restée vide sur la ligne précédente.
    if (this.enAttente) {
      const e = this.enAttente;
      this.enAttente = null;
      if (!l.titre && !etiquette(c) && !sectionDe(c, l.titre)) {
        this.appliquerEtiquette(e, l.texte, l.texte);
        return;
      }
    }
    // 1. Étiquettes en ligne.
    const e = etiquette(c);
    if (e) {
      const valeur = e.champ === "pourquoi" ? apresDeuxPoints(l.texte) || l.texte.replace(/^\s*pourquoi\s*\?\s*/i, "").trim() : apresDeuxPoints(l.texte);
      if (valeur && estTexteAide(valeur)) return;
      if (!valeur && e.champ !== "ignorer" && e.champ !== "pourquoi") {
        this.enAttente = e;
        return;
      }
      this.appliquerEtiquette(e, l.texte, valeur);
      return;
    }
    // Ouverture de section (et test comme sous-titre de cette section).
    const s = sectionDe(c, l.titre);
    if (s) {
      this.ouvrir(s);
      const st = sousTitre(this.section, c, this.vusResume);
      if (st !== undefined) this.choisir(st, "");
      return;
    }
    // 2. Sous-titres de liste.
    const st = sousTitre(this.section, c, this.vusResume);
    if (st !== undefined) {
      const reste = apresDeuxPoints(l.texte);
      const resteEstSousTitre = reste && sousTitre(this.section, cle(reste), this.vusResume) !== undefined;
      this.choisir(st, l.titre || resteEstSousTitre ? "" : reste);
      return;
    }
    if (l.titre) {
      // Sous-titre inconnu : la section ne change pas, la liste en cours s'arrête.
      this.cible = null;
      return;
    }
    this.contenu(l);
  }

  /** 3. Contenu par section. */
  contenu(l: Ligne) {
    const sec = this.section;
    if (!sec || sec === "ignorer") return;
    if (this.cible) {
      const c = this.cible;
      if ("liste" in c && c.liste === "secteurs") {
        if (l.numeroBarre) this.ajouterListe("secteurs", l.texte);
        return;
      }
      this.verser(l.texte);
      return;
    }
    switch (sec) {
      case "titre":
        if (!this.f.titre) this.f.titre = l.texte;
        return;
      case "autresTitres":
        this.ajouterListe("autresTitres", l.texte);
        return;
      case "resume":
        if (!this.resumeBloque) this.f.resume = this.f.resume ? `${this.f.resume} ${l.texte}` : l.texte;
        return;
      case "formulation":
        this.formulation.push(l.texte);
        return;
      case "valeur":
        this.f.benefice = this.f.benefice ? `${this.f.benefice} ${l.texte}` : l.texte;
        return;
      case "conseils":
      case "questions":
      case "offres":
        if (l.puce) this.ajouterListe(sec, l.texte);
        return;
      case "actions":
        if (l.puce) this.ajouterListe("prochainesEtapes", l.texte);
        return;
      case "etapes":
        if (l.puce) this.ajouterListe("etapes", apresDeuxPoints(l.texte) || l.texte);
        return;
      case "avatars":
        if (l.puce) this.avatarsPuces.push(l.texte);
        return;
      default:
        return;
    }
  }

  /** Ligne de tableau à plusieurs cellules. */
  tableau(l: Ligne) {
    const cellules = l.cellules ?? [];
    if (cellules.length === 1) {
      this.colonnes = null;
      for (const m of morceaux(cellules[0])) {
        const sous = versLignes(m)[0];
        if (sous) this.ligne(sous);
      }
      return;
    }
    const textes = cellules.map((x) => morceaux(x).join(" "));
    if (cellules.length === 2) {
      const ligne2 = `${textes[0]} : ${textes[1]}`;
      const e = etiquette(cle(ligne2));
      const e0 = e ?? etiquette(cle(`${textes[0]} :`));
      if (e0 && textes[0]) {
        const valeur = textes[1];
        if (valeur && !estTexteAide(valeur)) this.appliquerEtiquette(e0, ligne2, valeur);
        return;
      }
    }
    const sec = this.section;
    if (sec === "avatars") {
      const c0 = cle(textes[0] ?? "");
      if (cle(textes[1] ?? "").startsWith("profil")) return;
      if (c0.includes("avatar")) {
        this.avatarsTableau = true;
        const profil = textes[1] ?? "";
        if (profil) this.f.avatars.push({ profil, besoins: textes[2] ?? "", apport: textes[3] ?? "" });
      }
      return;
    }
    if (sec === "enneagramme") {
      const c0 = cle(textes[0] ?? "");
      if (/^(base|sous-type)/.test(c0)) {
        const valeur = (textes[2] || textes[1] || "").trim();
        if (!valeur || estTexteAide(valeur)) return;
        if (c0.startsWith("base") && !this.f.enneagramme.base) this.f.enneagramme.base = valeur;
        if (c0.startsWith("sous-type") && !this.f.enneagramme.sousType) this.f.enneagramme.sousType = valeur;
      }
      return;
    }
    // Tableau en colonnes de listes.
    const titres = cellules.map((x) => {
      const premier = morceaux(x)[0] ?? "";
      const c = cle(premier);
      if (!c) return undefined;
      const st = sousTitre(sec, c, this.vusResume);
      return st === "classees" || st === "resumePhrase" ? undefined : st;
    });
    if (titres.some((t) => t !== undefined)) {
      this.colonnes = titres.map((t) => {
        if (!t) return null;
        if ("texte" in t) return { texte: t.texte, actif: !this.f[t.texte] };
        return t;
      });
      return;
    }
    if (this.colonnes) {
      cellules.forEach((x, i) => {
        const col = this.colonnes?.[i];
        if (!col || "ignorer" in col) return;
        for (const m of morceaux(x)) {
          if ("liste" in col) this.ajouterListe(col.liste, m);
          else this.ajouterTexte(col, m);
        }
      });
    }
  }

  lire(md: string): FicheTalent {
    for (const l of versLignes(md)) {
      if (l.cellules) this.tableau(l);
      else {
        this.colonnes = null;
        this.ligne(l);
      }
    }
    this.finSection();
    if (!this.avatarsTableau && this.avatarsPuces.length) this.f.avatars.push({ profil: this.avatarsPuces.join(" ; "), besoins: "", apport: "" });
    return this.f;
  }
}

const CHAMPS_METHODE: (keyof FicheTalent)[] = ["titre", "mecanisme", "contexte", "benefice", "reussite", "echec", "valeurs"];

function remplis(f: FicheTalent): (keyof FicheTalent)[] {
  return (Object.keys(f) as (keyof FicheTalent)[]).filter((k) => {
    if (k === "v") return false;
    const v = f[k];
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object" && v) return Boolean(v.base || v.sousType);
    return Boolean(v);
  });
}

/** Lecture complète : lignes → sections et champs → bornes → déductions. */
export function lireFiche(md: string): { fiche: FicheTalent; rapport: RapportLecture } {
  const lue = bornerFiche(new Lecteur().lire(md));
  const trouves = remplis(lue);
  const { fiche, deduits } = completerFiche(lue);
  const methode = CHAMPS_METHODE.filter((c) => trouves.includes(c)).length >= 4 ? "modele" : "mots_cles";
  const manquants = CHAMPS_OBLIGATOIRES.filter((c) => !fiche[c]);
  return { fiche, rapport: { trouves, deduits, manquants, methode } };
}

const PREFIXES_TITRE = [/^mon talent unique\s*:\s*/i, /^my unique talent\s*:\s*/i, /^mi talento [úu]nico\s*:\s*/i];

/** Fiche depuis un résultat du QCM (#q= ou PDF CTQ1:). */
export function ficheDepuisQuiz(q: QuizResult): FicheTalent {
  let titre = q.name.trim();
  for (const p of PREFIXES_TITRE) titre = titre.replace(p, "");
  const mecanisme = q.mecanisme.replace(/^sais\s+/i, "");
  return bornerFiche({
    titre,
    mecanisme,
    contexte: q.contexte,
    benefice: q.benefice,
    antiContexte: q.antiContexte,
    reussite: [q.success, ...q.fertile],
    echec: [q.failure, ...q.toxic],
    archetypes: q.archetypes,
  });
}

/** Lit un objet brut du QCM (JSON décodé) et renvoie la fiche, ou null. */
export function ficheDepuisQuizBrut(brut: unknown): FicheTalent | null {
  const q = parseQuizResult(brut);
  return q ? ficheDepuisQuiz(q) : null;
}
