// Une requête silencieuse de plusieurs minutes est coupée par l'hébergeur ou un proxy (souvent vers 100 s)
// avant que le navigateur n'atteigne son propre délai. Le fetch échoue alors sans JSON : le client affiche
// « Connexion perdue ». Un octet de temps en temps garde la connexion ouverte jusqu'à la réponse.

const encoder = new TextEncoder();

/** Enveloppe la réponse JSON de battements (lignes vides) jusqu'à ce que le travail se termine. */
export function reponseAvecBattements(attente: Promise<Response>, intervalleMs = 8_000): Response {
  const flux = new ReadableStream({
    async start(controller) {
      const envoyer = (texte: string) => {
        try {
          controller.enqueue(encoder.encode(texte));
        } catch {
          // Le navigateur est parti. La génération continue pour remplir la reprise.
        }
      };
      envoyer("\n");
      const timer = setInterval(() => envoyer("\n"), intervalleMs);
      try {
        const reponse = await attente;
        envoyer(await reponse.text());
      } catch {
        envoyer(JSON.stringify({ ok: false, code: "ia_indisponible" }));
      } finally {
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          // Déjà fermé.
        }
      }
    },
  });
  return new Response(flux, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
