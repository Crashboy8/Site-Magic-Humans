/** Indices d'un texte resté en français : lettres accentuées que l'espagnol n'a pas, et mots français qui n'existent pas en espagnol. */
export const FRANCAIS_ES = new RegExp(
  "[èêàùçœâîôûëï]|(?<![\\p{L}])(est|pour|avec|vous|votre|tes|ton|ta|mon|mes|ma|dans|sur|pas|une|cette|ces|aux|et|ou|où|qui|du|il|elle|je|nous|quand|mais|comme|chez|aussi|tout|tous|ça)(?![\\p{L}])",
  "iu",
);

