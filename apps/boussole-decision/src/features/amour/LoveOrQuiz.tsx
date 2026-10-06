"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LoveStart } from "./LoveStart";

/** Vrai si l'adresse, le clic depuis le Quiz Amour, ou un repli court indique le mode amour.
 *  Un lien du quiz Talent Unique (#q=…) reste prioritaire : le mode normal ne change pas. */
function clientWantsLove(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.get("theme") === "amour") return true;
  if (/^#q=/.test(window.location.hash)) return false;
  try {
    if (sessionStorage.getItem("mh_theme") === "amour") return true;
  } catch {
    /* navigation privée */
  }
  if (document.cookie.split(";").some((part) => part.trim() === "mh_theme=amour")) return true;
  return document.referrer.includes("theme=amour");
}

/**
 * Affiche l'accueil amour si le serveur a vu ?theme=amour, ou si le navigateur le voit encore
 * (réécriture, redirection) alors que le paramètre n'est pas arrivé au serveur.
 */
export function LoveOrQuiz({ serverLove, children }: { serverLove: boolean; children: ReactNode }) {
  const [love, setLove] = useState(serverLove);

  useEffect(() => {
    if (serverLove) return;
    // Après l'hydratation : le paramètre peut être resté dans l'adresse du navigateur
    // (ou dans un cookie posé par le quiz) sans avoir été vu par le serveur.
    const id = window.setTimeout(() => {
      if (clientWantsLove()) setLove(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [serverLove]);

  if (love) return <LoveStart />;
  return children;
}
