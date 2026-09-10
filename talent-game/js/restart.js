/**
 * Écran Paramètres : édition libre des catégories de vie/quotas à tout
 * moment (pas seulement à l'onboarding, cf. cahier des charges section 3)
 * et le bouton Restart.
 */
const Restart = {
  render(user) {
    const quotas = user.profil_structure.quotas_categories;
    return `
      <div class="section-title">Ton compte</div>
      <p class="muted-text">Connecté·e en tant que <strong>${Esc.html(user.email || '')}</strong>. Ta progression est sauvegardée automatiquement, accessible depuis n'importe quel appareil avec cet email.</p>
      <button class="btn-ghost" onclick="App.signOut()">Se déconnecter</button>

      <div class="section-title" style="margin-top:2rem">Catégories de vie</div>
      <p class="muted-text">Ajuste les quotas de points, renomme ou retire une catégorie — ce système t'appartient.</p>
      <div class="quota-editor">
        ${Object.entries(quotas).map(([id, c]) => `
          <div class="quota-row" style="--cat-color:${c.couleur}">
            <input value="${Esc.attr(c.label)}" onchange="App.renameCategorySetting('${id}', this.value)">
            <input type="number" min="1" value="${c.quota_points}" onchange="App.updateQuotaSetting('${id}', this.value)">
            <button type="button" class="btn-ghost" onclick="App.removeCategorySetting('${id}')">Retirer</button>
          </div>
        `).join('')}
      </div>
      <form class="add-category-form" onsubmit="event.preventDefault(); App.addCategorySetting(this)">
        <input name="label" placeholder="+ nouvelle catégorie" required>
        <button type="submit" class="btn-primary">Ajouter</button>
      </form>

      <div class="section-title" style="margin-top:2rem">Repartir à zéro</div>
      <p class="muted-text">Remet ta progression (quêtes, points, badges) à zéro, sans jamais toucher à ton profil ni à ce que tu as déjà construit. Utile après une période difficile — le jeu continue, pas la pression.</p>
      <button class="btn-restart" onclick="App.confirmRestart()">Restart</button>
    `;
  }
};
