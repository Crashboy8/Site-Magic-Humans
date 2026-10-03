"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { markCommentsRead } from "@/data/repository";

/** Marque comme lus les commentaires d'une version quand le coaché l'ouvre (les badges « Nouveau » restent visibles jusqu'au prochain chargement). */
export function MarkCommentsRead({ versionId, unread }: { versionId: string; unread: number }) {
  const router = useRouter();
  useEffect(() => {
    if (unread === 0) return;
    markCommentsRead(supabaseBrowser(), versionId)
      .then(() => router.refresh())
      .catch(() => {});
  }, [versionId, unread, router]);
  return null;
}
