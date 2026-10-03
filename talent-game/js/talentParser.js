/**
 * Pré-remplissage heuristique à partir du texte Talent Unique collé (export
 * Notion en texte libre). Pas d'appel LLM ici volontairement : ce fichier
 * est le point de bascule unique vers un vrai appel à l'API Claude côté
 * serveur plus tard (agent isolé, cf. section 6 du cahier des charges) —
 * l'interface `parse(rawText) -> seed` peut rester identique.
 */
const TalentParser = {
  SECTION_KEYWORDS: {
    talent: ['talent unique', 'talent'],
    valeurs: ['valeurs'],
    ressources: ['ressources'],
    habitudes: ['bonnes habitudes', 'habitudes'],
    declencheur: ['contexte déclencheur', 'déclencheur', 'contexte'],
    personnalite: ['analyse de personnalité', 'personnalité']
  },

  parse(rawText) {
    const lines = (rawText || '').split(/\r?\n/);
    const sections = { talent: [], valeurs: [], ressources: [], habitudes: [], declencheur: [], personnalite: [] };
    let current = null;

    for (const rawLine of lines) {
      const cleaned = rawLine.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
      if (!cleaned) continue;
      const headerKey = this._matchHeader(cleaned);
      if (headerKey) {
        current = headerKey;
        continue;
      }
      if (current) sections[current].push(this._stripBullet(cleaned));
      else sections.talent.push(this._stripBullet(cleaned));
    }

    return {
      talent_resume: sections.talent.join(' ').trim().slice(0, 500) || null,
      valeurs: sections.valeurs.filter(Boolean),
      ressources: sections.ressources.filter(Boolean),
      habitudes: sections.habitudes.filter(Boolean),
      declencheur_brut: sections.declencheur.join(' ').trim() || null,
      personnalite_brut: sections.personnalite.join(' ').trim() || null
    };
  },

  _matchHeader(line) {
    // Correspondance stricte (le titre de section, rien d'autre) : un simple
    // "startsWith" ferait basculer de section sur n'importe quelle phrase du
    // texte libre qui commence par un des mots-clés (ex. "Ressources humaines
    // : ...").
    const lower = line.toLowerCase().replace(/:$/, '').trim();
    for (const [key, keywords] of Object.entries(this.SECTION_KEYWORDS)) {
      if (keywords.includes(lower)) return key;
    }
    return null;
  },

  _stripBullet(line) {
    return line.replace(/^[-*•]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
  }
};
