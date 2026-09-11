/**
 * Échappement HTML partagé par toutes les vues qui interpolent du texte
 * saisi par l'utilisateur (contacts, ressources, habitudes, catégories...)
 * dans des templates strings.
 */
const Esc = {
  html(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
  attr(str) {
    return this.html(str).replace(/"/g, '&quot;');
  },
  nl2br(str) {
    return this.html(str).replace(/\n/g, '<br>');
  }
};
