const Dashboard = {
  render(user) {
    const quotas = user.profil_structure.quotas_categories;
    const quetes = user.progression.quetes;
    const aFaire = quetes.filter(q => q.statut === 'a_faire');
    const faites = quetes.filter(q => q.statut === 'complete');

    const parCategorie = {};
    aFaire.forEach(q => {
      (parCategorie[q.categorie_vie] = parCategorie[q.categorie_vie] || []).push(q);
    });

    return `
      ${this._xpBar(user)}
      ${this._badges(user)}
      <div class="section-title">Tes quêtes du jour</div>
      ${Object.keys(parCategorie).length === 0 ? `
        <div class="empty-state">
          <p>Toutes tes quêtes sont faites. Belle journée. 🎉</p>
          <button class="btn-primary" onclick="App.requestFollowUpQuest()">Proposer une nouvelle quête</button>
        </div>
      ` : Object.entries(parCategorie).map(([catId, liste]) => this._worldBlock(catId, liste, quotas)).join('')}

      ${faites.length ? `
        <div class="section-title muted">Déjà accompli aujourd'hui</div>
        <div class="quete-list">
          ${faites.map(q => this._queteCard(q, quotas, true)).join('')}
        </div>
      ` : ''}
    `;
  },

  _xpBar(user) {
    const xp = user.progression.xp_total;
    const seuils = DEFAULT_BADGES_SEUILS.map(b => b.seuil);
    const prochain = seuils.find(s => s > xp) || seuils[seuils.length - 1];
    const precedent = [...seuils].reverse().find(s => s <= xp) || 0;
    const pct = Math.min(100, Math.round(((xp - precedent) / (prochain - precedent || 1)) * 100));
    return `
      <div class="xp-block">
        <div class="xp-label"><span>⚡ ${xp} XP</span><span>Prochain palier : ${prochain} XP</span></div>
        <div class="xp-bar"><div class="xp-bar-fill" style="width:${pct}%"></div></div>
      </div>
    `;
  },

  _badges(user) {
    if (!user.progression.badges.length) return '';
    return `
      <div class="badge-row">
        ${user.progression.badges.map(id => {
          const b = DEFAULT_BADGES_SEUILS.find(x => x.id === id);
          return b ? `<span class="badge" title="${b.label}">${b.emoji} ${b.label}</span>` : '';
        }).join('')}
      </div>
    `;
  },

  _worldBlock(catId, liste, quotas) {
    const cat = quotas[catId] || { label: catId, couleur: '#888' };
    return `
      <div class="world-block" style="--world-color:${cat.couleur}">
        <div class="world-title">${cat.label}</div>
        <div class="quete-list">
          ${liste.map(q => this._queteCard(q, quotas)).join('')}
        </div>
      </div>
    `;
  },

  _queteCard(q, quotas, done) {
    const cat = quotas[q.categorie_vie] || { couleur: '#888' };
    return `
      <div class="quete-card ${done ? 'quete-done' : ''}" style="--cat-color:${cat.couleur}">
        <div class="quete-info">
          <div class="quete-titre">${q.titre}</div>
          ${q.description ? `<div class="quete-desc">${q.description}</div>` : ''}
        </div>
        <div class="quete-action">
          <span class="quete-points">+${q.points} pts</span>
          ${done ? '<span class="quete-check">✓</span>' : `<button class="btn-quete" onclick="App.declareQuest('${q.id}')">Valider</button>`}
        </div>
      </div>
    `;
  }
};
