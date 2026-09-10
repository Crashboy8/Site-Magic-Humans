const Ressourcement = {
  render(user) {
    const ressources = user.profil_structure.ressources;
    return `
      <div class="section-title">Tes ressources</div>
      <p class="muted-text">Ce qui te ressource vraiment — pense à t'y accorder au rythme que tu as toi-même défini.</p>
      <div class="ressource-list">
        ${ressources.map(r => this._card(r)).join('') || '<p class="muted-text">Aucune ressource enregistrée pour l\'instant.</p>'}
      </div>
    `;
  },

  _card(r) {
    const icons = { lieu: '📍', personne: '👤', objet: '🎒', 'activité': '✨' };
    return `
      <div class="ressource-card">
        <div class="ressource-icon">${icons[r.type] || '✨'}</div>
        <div class="ressource-info">
          <div class="ressource-nom">${r.nom}</div>
          <div class="ressource-meta">${r.type} · fréquence conseillée : ${r.frequence_suggeree || 'libre'}</div>
        </div>
        <button class="btn-quete" onclick="App.markResourceUsed('${r.id}')">J'y étais</button>
      </div>
    `;
  }
};
