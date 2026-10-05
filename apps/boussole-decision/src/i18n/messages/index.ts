// Dictionnaires de l'interface, par langue. Chaque fichier définit le français, puis l'anglais avec la même forme
// (TypeScript signale toute traduction manquante).
import type { Locale } from "../config";
import { auth } from "./auth";
import { coach } from "./coach";
import { example } from "./example";
import { common } from "./common";
import { profile } from "./profile";
import { results } from "./results";
import { table } from "./table";
import { version } from "./version";

const fr = {
  common: common.fr,
  auth: auth.fr,
  profile: profile.fr,
  version: version.fr,
  coach: coach.fr,
  table: table.fr,
  results: results.fr,
  example: example.fr,
};
const en: typeof fr = {
  common: common.en,
  auth: auth.en,
  profile: profile.en,
  version: version.en,
  coach: coach.en,
  table: table.en,
  results: results.en,
  example: example.en,
};

export type Messages = typeof fr;
export const MESSAGES: Record<Locale, Messages> = { fr, en };
