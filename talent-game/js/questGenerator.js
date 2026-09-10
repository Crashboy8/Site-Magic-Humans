/**
 * Étape 3 du cahier des charges : génère la configuration de jeu (quêtes de
 * départ) à partir du profil structuré produit par l'onboarding. Régénère
 * aussi de nouvelles quêtes en cours d'usage quotidien (dashboard) une fois
 * les quêtes du jour complétées, pour rester adaptatif sans repasser par le
 * questionnaire complet.
 */
const QuestGenerator = {
  generateStarterQuests(user) {
    const quetes = [];
    const quotas = user.profil_structure.quotas_categories;

    user.profil_structure.habitudes
      .filter(h => !h.ancree)
      .forEach(h => {
        quetes.push(this._quete({
          titre: h.nom,
          description: `Signal : ${h.signal_declencheur || '—'}`,
          categorie_vie: h.categorie_vie || Object.keys(quotas)[0],
          quotas
        }));
      });

    if (user.profil_structure.ressources.length) {
      const r = user.profil_structure.ressources[0];
      quetes.push(this._quete({
        titre: `Prends un moment avec « ${r.nom} »`,
        description: `Ressourcement — fréquence conseillée : ${r.frequence_suggeree || 'à ton rythme'}`,
        categorie_vie: Quotas.guessCategory(r.nom, quotas, user.categorie_non_negociable),
        quotas
      }));
    }

    if (user.categorie_negligee && quotas[user.categorie_negligee]) {
      quetes.push(this._quete({
        titre: `Offre 10 minutes à « ${quotas[user.categorie_negligee].label} »`,
        description: `Catégorie repérée comme négligée pendant l'onboarding.`,
        categorie_vie: user.categorie_negligee,
        quotas
      }));
    }

    return quetes;
  },

  /** Propose une nouvelle quête légère quand le joueur a tout complété. */
  generateFollowUpQuest(user) {
    const quotas = user.profil_structure.quotas_categories;
    const ids = Object.keys(quotas);
    if (!ids.length) return null;
    const catId = user.categorie_non_negociable && quotas[user.categorie_non_negociable]
      ? user.categorie_non_negociable
      : ids[Math.floor(Math.random() * ids.length)];
    const habit = user.profil_structure.habitudes.find(h => h.categorie_vie === catId);
    return this._quete({
      titre: habit ? habit.nom : `Un petit pas côté « ${quotas[catId].label} »`,
      description: 'Nouvelle quête proposée automatiquement.',
      categorie_vie: catId,
      quotas
    });
  },

  _quete({ titre, description, categorie_vie, quotas }) {
    const quotaCat = quotas[categorie_vie] ? quotas[categorie_vie].quota_points : 10;
    return {
      id: crypto.randomUUID(),
      titre,
      description,
      categorie_vie,
      points: Math.max(5, Math.round(quotaCat / 3)),
      statut: 'a_faire',
      date_creation: new Date().toISOString(),
      date_completion: null
    };
  }
};
