/**
 * Authentification email + magic link (Supabase Auth). Pas de mot de passe :
 * l'utilisateur reçoit un lien, le clique, et revient sur l'app déjà
 * connecté — conforme à la section 8 du cahier des charges.
 */
const Auth = {
  currentUser: null, // { id, email } une fois connecté, sinon null

  async sendMagicLink(email) {
    const redirectTo = window.location.origin + window.location.pathname;
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });
    return error;
  },

  async signOut() {
    await supabaseClient.auth.signOut();
  },

  renderLogin(state) {
    if (state.magicLinkSent) {
      return `
        <div class="import-shell">
          <h1 class="hero-title">Vérifie ta boîte mail</h1>
          <p class="hero-sub">On vient d'envoyer un lien de connexion à <strong>${Esc.html(state.magicLinkEmail)}</strong>. Clique dessus pour continuer — tu peux garder cet onglet ouvert.</p>
          <div class="import-actions">
            <button class="btn-ghost" onclick="App.backToLoginForm()">Utiliser une autre adresse</button>
          </div>
        </div>
      `;
    }
    return `
      <div class="import-shell">
        <h1 class="hero-title">${TAGLINE}</h1>
        <p class="hero-sub">Connecte-toi avec ton email pour retrouver ta progression, sur n'importe quel appareil.</p>
        <form class="login-form" onsubmit="event.preventDefault(); App.submitMagicLink(this)">
          <input type="email" name="email" id="login-email" placeholder="ton@email.com" required>
          <button type="submit" class="btn-primary">Envoyer le lien magique</button>
        </form>
        ${state.loginError ? `<p class="login-error">${Esc.html(state.loginError)}</p>` : ''}
      </div>
    `;
  }
};
