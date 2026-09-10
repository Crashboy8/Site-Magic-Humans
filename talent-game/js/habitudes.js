const Habitudes = {
  render(user) {
    const habitudes = user.profil_structure.habitudes;
    return `
      <div class="section-title">Tes habitudes</div>
      <p class="muted-text">Construites selon la méthode des 4 lois (Atomic Habits) : évidente, attractive, facile, satisfaisante.</p>
      <div class="habitude-list">
        ${habitudes.map(h => this._card(h)).join('') || '<p class="muted-text">Aucune habitude enregistrée pour l\'instant.</p>'}
      </div>
    `;
  },

  _card(h) {
    if (h.ancree) {
      return `
        <div class="habitude-card habitude-ancree">
          <div class="habitude-titre">${h.nom} <span class="tag-ancree">déjà ancrée</span></div>
        </div>
      `;
    }
    return `
      <div class="habitude-card">
        <div class="habitude-titre">${h.nom}</div>
        <div class="habitude-identite">→ Je deviens quelqu'un qui : ${h.identite_visee || '—'}</div>
        <div class="habitude-grid">
          <div><span class="habitude-label">Signal</span>${h.signal_declencheur || '—'}</div>
          <div><span class="habitude-label">Désirable</span>${h.desirabilite || '—'}</div>
          <div><span class="habitude-label">Environnement</span>${h.appui_environnemental || '—'}</div>
          <div><span class="habitude-label">Récompense</span>${h.recompense || '—'}</div>
        </div>
      </div>
    `;
  }
};
