// Annuaires de salons affichés à côté de « Chercher sur Google ». Une seule constante : ne pas recopier ces adresses.
export const ANNUAIRES_SALONS = {
  france: "https://salonsenfrance.fr/",
  international: "https://www.eventseye.com/fairs/c1_trade-shows_france.html",
} as const;

export function urlRechercheGoogle(recherche: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(recherche)}`;
}
