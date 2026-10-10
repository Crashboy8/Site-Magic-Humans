/**
 * Le lien avec le compte Magic Humans (le même que Mon espace et « Où j'en suis ? »).
 * Sans compte, ou si le compte ne répond pas, le jeu marche comme avant : tout reste dans ce navigateur.
 * Avec un compte, les points, les badges et la série de jours partent dans le compte, où ils s'ajoutent
 * à ceux de « Où j'en suis ? ». Les envois passent un par un : des points ne partent jamais deux fois.
 */
const Compte = {
  // La progression du compte ({ xp, niveau, badges, serieJours, misAJour, prochain }), ou null sans compte.
  progression: null,
  _file: null,

  async demarrer(onChange) {
    const p = await MHProgression.lireCompte();
    if (!p) return;
    this.progression = p;
    const e = MHProgression.lire();
    const neuf = e.aEnvoyer > 0
      || e.badges.some(b => p.badges.indexOf(b) === -1)
      || (e.maj && (!p.misAJour || Date.parse(e.maj) > Date.parse(p.misAJour)));
    if (!neuf) {
      // Rien de neuf ici : la série du navigateur repart de celle du compte.
      MHProgression.ecrire(MHProgression.apresEnvoi(e, 0, p));
      onChange();
      return;
    }
    // Ce que le navigateur a gagné avant la première connexion (ou hors connexion) part tout de suite.
    await this.envoyer(onChange);
  },

  envoyer(onChange, options) {
    const suite = (this._file || Promise.resolve()).then(() => this._envoyerMaintenant(onChange, options));
    this._file = suite.catch(() => null);
    return suite;
  },

  async _envoyerMaintenant(onChange, options) {
    const e = MHProgression.lire();
    const p = await MHProgression.envoyer(e, options);
    if (!p) {
      onChange();
      return null;
    }
    // Relu au retour : des points gagnés pendant l'envoi restent à envoyer.
    MHProgression.ecrire(MHProgression.apresEnvoi(MHProgression.lire(), e.aEnvoyer, p));
    this.progression = p;
    onChange();
    return p;
  },

  /** Une quête validée : la série et les points sont gardés dans le navigateur, puis envoyés si un compte est relié. */
  gagner(points, badgesLocaux, onChange) {
    MHProgression.ecrire(MHProgression.gagner(MHProgression.lire(), points, badgesLocaux, new Date()));
    return this.progression ? this.envoyer(onChange) : Promise.resolve(null);
  },

  /** « Repartir à zéro » : le compte ne garde que les points de « Où j'en suis ? ». */
  repartir(onChange) {
    MHProgression.ecrire(MHProgression.repartir(MHProgression.lire()));
    return this.progression ? this.envoyer(onChange, { repartir: true }) : Promise.resolve(null);
  },

  /** Ce qu'affiche le tableau de bord : le compte s'il est relié, sinon la partie de ce navigateur. */
  affichage(user) {
    if (this.progression) {
      return { xp: this.progression.xp, badges: this.progression.badges, serie: this.progression.serieJours, compte: true };
    }
    return {
      xp: user.progression.xp_total,
      badges: user.progression.badges,
      serie: MHProgression.serieEnCours(MHProgression.lire(), new Date()),
      compte: false
    };
  },

  render() {
    if (this.progression) {
      return `
        <div class="section-title">Ton compte Magic Humans</div>
        <p class="muted-text">Ton jeu est relié à ton compte. Tes points, tes badges et ta série de jours y sont gardés, avec ceux de « Où j'en suis ? », et tu les retrouves dans Mon espace. Ton profil, tes quêtes, tes habitudes et tes contacts restent dans ce navigateur.</p>
        <div class="import-actions compte-actions">
          <a class="btn-primary" href="${MHProgression.ESPACE}">Ouvrir Mon espace</a>
        </div>
      `;
    }
    return `
      <div class="section-title">Garde tes points dans ton compte</div>
      <p class="muted-text">Ta partie est gardée dans ce navigateur. Avec un compte Magic Humans, tes points, tes badges et ta série de jours s'ajoutent à ceux de « Où j'en suis ? », et tu les retrouves dans Mon espace. Les points gagnés dans ce navigateur sont repris à ta première connexion.</p>
      <div class="import-actions compte-actions">
        <a class="btn-primary" href="${MHProgression.INSCRIPTION}">Créer mon compte</a>
        <a class="btn-ghost" href="${MHProgression.CONNEXION}">Me connecter</a>
      </div>
    `;
  }
};
