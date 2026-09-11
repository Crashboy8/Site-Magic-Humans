const Habitudes = {
  DEFAULT_EMOJI: '🔁',
  EMOJI_CHOICES: [
    { value: '✅', label: '✅ Général' },
    { value: '🏃', label: '🏃 Sport / Corps' },
    { value: '🧘', label: '🧘 Calme / Esprit' },
    { value: '📖', label: '📖 Apprentissage' },
    { value: '💧', label: '💧 Santé' },
    { value: '🎨', label: '🎨 Créativité' },
    { value: '🤝', label: '🤝 Relations' },
    { value: '💼', label: '💼 Travail' },
    { value: '🌙', label: '🌙 Sommeil / Repos' }
  ],

  render(user) {
    const habitudes = user.profil_structure.habitudes;
    const quotas = user.profil_structure.quotas_categories;
    return `
      <div class="section-title">Tes habitudes</div>
      <p class="muted-text">Construites selon la méthode des 4 lois (Atomic Habits) : évidente, attractive, facile, satisfaisante.</p>
      <div class="habitude-list">
        ${habitudes.map(h => this._card(h)).join('') || '<p class="muted-text">Aucune habitude enregistrée pour l\'instant.</p>'}
      </div>

      <div class="section-title" style="margin-top:2rem">Ajouter une habitude</div>
      <form class="habitude-form" onsubmit="event.preventDefault(); App.addCustomHabit(this)">
        <input name="nom" placeholder="Ex : Boire un verre d'eau en me levant" required>
        <select name="emoji">
          ${this.EMOJI_CHOICES.map(e => `<option value="${e.value}">${e.label}</option>`).join('')}
        </select>
        <select name="categorie">
          ${Object.entries(quotas).map(([id, c]) => `<option value="${Esc.attr(id)}">${Esc.html(c.label)}</option>`).join('')}
        </select>
        <button type="submit" class="btn-primary">Ajouter</button>
      </form>
    `;
  },

  _card(h) {
    const emoji = h.emoji || this.DEFAULT_EMOJI;
    if (h.ancree) {
      return `
        <div class="habitude-card habitude-ancree">
          <div class="habitude-titre">${emoji} ${Esc.html(h.nom)} <span class="tag-ancree">déjà ancrée</span></div>
        </div>
      `;
    }
    const streak = h.streak || 0;
    const today = new Date().toISOString().slice(0, 10);
    const doneToday = h.dernier_jour_fait === today;
    return `
      <div class="habitude-card">
        <div class="habitude-top">
          <div class="habitude-titre">${emoji} ${Esc.html(h.nom)}</div>
          <div class="habitude-streak" title="Jours d'affilée">🔥 ${streak}</div>
        </div>
        ${h.identite_visee ? `<div class="habitude-identite">→ Je deviens quelqu'un qui : ${Esc.html(h.identite_visee)}</div>` : ''}
        <div class="habitude-grid">
          <div><span class="habitude-label">Signal</span>${Esc.html(h.signal_declencheur) || '—'}</div>
          <div><span class="habitude-label">Désirable</span>${Esc.html(h.desirabilite) || '—'}</div>
          <div><span class="habitude-label">Environnement</span>${Esc.html(h.appui_environnemental) || '—'}</div>
          <div><span class="habitude-label">Récompense</span>${Esc.html(h.recompense) || '—'}</div>
        </div>
        <button class="btn-quete ${doneToday ? 'btn-quete-done' : ''}" ${doneToday ? 'disabled' : ''} onclick="App.markHabitDone('${h.id}')">
          ${doneToday ? '✓ Fait aujourd\'hui' : 'Fait aujourd\'hui'}
        </button>
      </div>
    `;
  }
};
