const Crm = {
  render(user) {
    const contacts = user.progression.contacts;
    return `
      <div class="section-title">Ton réseau</div>
      <p class="muted-text">Les relations jouent un rôle central dans l'expression de ton talent — garde-les vivantes.</p>
      <form class="crm-form" onsubmit="event.preventDefault(); App.addContact(this)">
        <input name="nom" placeholder="Nom" required>
        <input name="role" placeholder="Rôle dans ta vie (ami, mentor, client...)">
        <select name="frequence">
          <option value="hebdomadaire">Contact souhaité : hebdo</option>
          <option value="mensuel">Contact souhaité : mensuel</option>
          <option value="trimestriel">Contact souhaité : trimestriel</option>
        </select>
        <button type="submit" class="btn-primary">Ajouter</button>
      </form>
      <div class="contact-list">
        ${contacts.map(c => this._card(c)).join('') || '<p class="muted-text">Aucun contact enregistré pour l\'instant.</p>'}
      </div>
    `;
  },

  _card(c) {
    const dernier = c.dernier_contact ? new Date(c.dernier_contact).toLocaleDateString('fr-FR') : 'jamais noté';
    return `
      <div class="contact-card">
        <div class="contact-info">
          <div class="contact-nom">${Esc.html(c.nom)}</div>
          <div class="contact-meta">${Esc.html(c.role || 'contact')} · souhaité : ${c.frequence_souhaitee} · dernier contact : ${dernier}</div>
          ${c.notes ? `<div class="contact-notes">${Esc.html(c.notes)}</div>` : ''}
        </div>
        <button class="btn-quete" onclick="App.markContactSeen('${c.id}')">On s'est parlé</button>
      </div>
    `;
  }
};
