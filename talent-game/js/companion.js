/**
 * Le compagnon-héros : tout au début de l'onboarding, avant la première
 * question, on demande le héros de fiction d'enfance de la personne. On en
 * déduit une icône (pas de génération d'image IA pour ce lot — voir
 * README), et ce compagnon reste visible pendant tout l'onboarding et dans
 * le jeu, comme présence qui accompagne le processus et la réussite.
 */
const Companion = {
  DEFAULT_EMOJI: '🦸',

  EMOJI_MAP: [
    { keywords: ['araignée', 'spider'], emoji: '🕷️' },
    { keywords: ['batman', 'chevalier noir', 'gotham'], emoji: '🦇' },
    { keywords: ['superman', 'super-héros', 'super hero'], emoji: '🦸' },
    { keywords: ['princesse', 'princess', 'elsa', 'belle', 'blanche neige', 'cendrillon'], emoji: '👸' },
    { keywords: ['pirate', 'jack sparrow', 'corsaire'], emoji: '🏴‍☠️' },
    { keywords: ['magicien', 'sorcier', 'sorcière', 'wizard', 'harry potter', 'gandalf', 'merlin'], emoji: '🧙' },
    { keywords: ['ninja', 'naruto', 'samouraï'], emoji: '🥷' },
    { keywords: ['chevalier', 'knight', 'roi arthur', 'excalibur'], emoji: '⚔️' },
    { keywords: ['robot', 'iron man', 'ironman', 'transformer', 'wall-e'], emoji: '🤖' },
    { keywords: ['fée', 'fairy', 'clochette', 'tinkerbell'], emoji: '🧚' },
    { keywords: ['astronaute', 'espace', 'buzz', 'space'], emoji: '🧑‍🚀' },
    { keywords: ['loup', 'wolf', 'garou'], emoji: '🐺' },
    { keywords: ['lion', 'simba', 'roi lion'], emoji: '🦁' },
    { keywords: ['dragon'], emoji: '🐉' },
    { keywords: ['sirène', 'ariel', 'mermaid'], emoji: '🧜' },
    { keywords: ['renard', 'fox'], emoji: '🦊' },
    { keywords: ['sportif', 'footballeur', 'basketteur', 'champion'], emoji: '🏆' },
    { keywords: ['détective', 'sherlock', 'enquêteur'], emoji: '🕵️' },
    { keywords: ['pilote', 'aviateur'], emoji: '🛩️' },
    { keywords: ['fantôme', 'ghost'], emoji: '👻' }
  ],

  guessEmoji(nom) {
    const lower = (nom || '').toLowerCase();
    const match = this.EMOJI_MAP.find(entry => entry.keywords.some(k => lower.includes(k)));
    return match ? match.emoji : this.DEFAULT_EMOJI;
  },

  renderSelectScreen(state) {
    return `
      <div class="import-shell">
        <h1 class="hero-title">Choisis ton compagnon</h1>
        <p class="hero-sub">Avant de commencer, pense à un héros de fiction de ton enfance — celui qui t'accompagnera pendant tout ce parcours.</p>
        <form class="login-form" onsubmit="event.preventDefault(); App.confirmCompanion(this)">
          <input type="text" name="nom" id="companion-name" placeholder="Ex : Batman, Merlin, Ariel..." required>
          <button type="submit" class="btn-primary">C'est lui/elle !</button>
        </form>
      </div>
    `;
  },

  renderBadge(compagnon) {
    if (!compagnon || !compagnon.nom) return '';
    return `<div class="companion-badge">${compagnon.emoji} <span>${Esc.html(compagnon.nom)} t'accompagne</span></div>`;
  }
};
