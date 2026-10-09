// Dictionnaires de l'interface, par langue. Chaque fichier définit le français, puis l'anglais et l'espagnol avec la même forme
// (TypeScript signale toute traduction manquante).
import type { Locale } from "../config";
import { auth } from "./auth";
import { client } from "./client";
import { coach } from "./coach";
import { example } from "./example";
import { common } from "./common";
import { espace } from "./espace";
import { maCible } from "./maCible";
import { profile } from "./profile";
import { quiz } from "./quiz";
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
  quiz: quiz.fr,
  maCible: maCible.fr,
  espace: espace.fr,
  client: client.fr,
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
  quiz: quiz.en,
  maCible: maCible.en,
  espace: espace.en,
  client: client.en,
};

const es: typeof fr = {
  common: common.es,
  auth: auth.es,
  profile: profile.es,
  version: version.es,
  coach: coach.es,
  table: table.es,
  results: results.es,
  example: example.es,
  quiz: quiz.es,
  maCible: maCible.es,
  espace: espace.es,
  client: client.es,
};

export type Messages = typeof fr;
export const MESSAGES: Record<Locale, Messages> = { fr, en, es };
