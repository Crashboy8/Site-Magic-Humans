/*
 * Arrivée depuis la Boussole de décision : le bouton « Explorer ma carte du talent » porte le
 * Talent Unique du profil dans l'ancre du lien (#b=…, JSON en base64url, UTF-8).
 * L'ancre n'est jamais envoyée au serveur. Aucun accès au DOM.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const LONGUEUR_TALENT = 120;
  const LONGUEUR_FIL = 160;
  const MAX_PHRASES = 12;

  const texte = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

  // Lit et borne les données ; null si elles ne sont pas exploitables.
  function analyser(brut) {
    if (!brut || typeof brut !== 'object' || Array.isArray(brut) || brut.v !== 1) return null;
    const d = {
      mecanisme: texte(brut.mecanisme, 400),
      contexte: texte(brut.contexte, 600),
      benefice: texte(brut.benefice, 400),
      antiContexte: texte(brut.antiContexte, 1000),
      success: typeof brut.success === 'string' ? brut.success.slice(0, 2000) : '',
      failure: typeof brut.failure === 'string' ? brut.failure.slice(0, 2000) : '',
      ressources: Array.isArray(brut.ressources) ? brut.ressources.map((t) => texte(t, 80).replace(/[,;]/g, ' ')).filter(Boolean).slice(0, 8) : [],
      rechargeTitre: texte(brut.rechargeTitre, 120),
      soustalents: Array.isArray(brut.soustalents) ? brut.soustalents.map((t) => texte(t, 40).replace(/[,;]/g, ' ')).filter(Boolean).slice(0, 6) : []
    };
    return d.mecanisme || d.contexte || d.benefice || d.antiContexte || d.success || d.failure ? d : null;
  }

  // « sais aller au fond des choses » → « aller au fond des choses » (le quiz écrit « Je sais… »).
  const sansSais = (t) => t.replace(/^(?:sais|sé|know how to)\s+/i, '');

  // Décode l'ancre « #b=… » (Boussole) ou « #q=… » (quiz, même format) ; null si absente ou invalide.
  function lire(hash) {
    const m = /(?:^|[#&])(b|q)=([A-Za-z0-9_-]+)/.exec(String(hash || ''));
    if (!m) return null;
    const quiz = m[1] === 'q';
    try {
      const b64 = m[2].replace(/-/g, '+').replace(/_/g, '/');
      const binaire = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
      const octets = Uint8Array.from(binaire, (c) => c.charCodeAt(0));
      const d = analyser(JSON.parse(new TextDecoder().decode(octets)));
      if (d && quiz) { d.mecanisme = sansSais(d.mecanisme); d.source = 'quiz'; }
      return d;
    } catch (e) {
      return null;
    }
  }

  /*
   * Résultat du quiz dans un PDF : le PDF du quiz est une image, ses données sont dans ses métadonnées
   * (mot-clé « CTQ1:… », même encodage que #q=). On cherche la marque dans le fichier brut (chaînes
   * ASCII ou UTF-16 des métadonnées), puis dans les flux compressés d'un PDF qui aurait du texte.
   * Rien n'est envoyé : le fichier est lu dans le navigateur.
   */
  const MARQUE_PDF = /CTQ1:([A-Za-z0-9_-]{8,})/;
  const MAX_PDF = 25 * 1024 * 1024;

  function versTexte(octets) {
    let t = '';
    for (let i = 0; i < octets.length; i += 8192) t += String.fromCharCode.apply(null, octets.subarray(i, i + 8192));
    return t;
  }

  function jetonDans(octets) {
    const brut = versTexte(octets);
    // Une chaîne UTF-16 de PDF intercale des zéros : on les retire avant de chercher.
    const m = MARQUE_PDF.exec(brut) || MARQUE_PDF.exec(brut.replace(/\u0000/g, ''));
    return m ? m[1] : null;
  }

  async function inflater(octets) {
    const flux = new Blob([octets]).stream().pipeThrough(new DecompressionStream('deflate'));
    return new Uint8Array(await new Response(flux).arrayBuffer());
  }

  // Lit le résultat du quiz dans un PDF (ArrayBuffer ou Uint8Array) ; null si le PDF n'en contient pas.
  async function lirePdf(contenu) {
    const octets = contenu instanceof Uint8Array ? contenu : new Uint8Array(contenu);
    if (!octets.length || octets.length > MAX_PDF || versTexte(octets.subarray(0, 8)).indexOf('%PDF') !== 0) return null;
    let jeton = jetonDans(octets);
    if (!jeton && typeof DecompressionStream !== 'undefined') {
      const brut = versTexte(octets);
      const flux = /stream\r?\n/g;
      let m;
      let essais = 0;
      while (!jeton && (m = flux.exec(brut)) && essais < 300) {
        const fin = brut.indexOf('endstream', flux.lastIndex);
        if (fin < 0) break;
        essais++;
        let fond = fin;
        while (fond > flux.lastIndex && (octets[fond - 1] === 10 || octets[fond - 1] === 13)) fond--; // retour à la ligne avant « endstream »
        try { jeton = jetonDans(await inflater(octets.subarray(flux.lastIndex, fond))); } catch (e) { /* flux non compressé ou illisible */ }
      }
    }
    return jeton ? lire('#q=' + jeton) : null;
  }

  // Découpe un texte libre en phrases (lignes, puis fins de phrase), sans doublon.
  function phrases(t) {
    const vus = new Set();
    return String(t || '').replace(/([.!?…])\s+/g, '$1\n').split(/\n+/)
      .map((p) => p.replace(/^[-*•\s]+/, '').replace(/\s+/g, ' ').trim().replace(/[.;]+$/, ''))
      .filter((p) => {
        const n = CT.regles ? CT.regles.normaliserTexte(p) : p.toLowerCase();
        if (!n || vus.has(n)) return false;
        vus.add(n);
        return true;
      })
      .slice(0, MAX_PHRASES);
  }

  const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // « dans un environnement où …, afin de … », selon ce qui est rempli.
  function filRouge(d) {
    const parties = [];
    if (d.contexte) parties.push(T('dans un environnement où {texte}', { texte: d.contexte }));
    if (d.benefice) parties.push(T('afin de {texte}', { texte: d.benefice }));
    return majuscule(parties.join(', '));
  }

  /*
   * Brouillon de création pré-rempli. Rien n'est coupé : un texte trop long pour son champ
   * reste vide et s'affiche dans l'encart « Depuis ta Boussole », pour être raccourci à la main.
   */
  function versBrouillon(d) {
    const b = CT.creation.nouveauBrouillon();
    const talent = majuscule(d.mecanisme);
    const fil = filRouge(d);
    b.talent.nom = talent.length <= LONGUEUR_TALENT ? talent : '';
    b.talent.filRouge = fil.length <= LONGUEUR_FIL ? fil : '';
    if (d.soustalents && d.soustalents.length) CT.creation.ajouter(b, 'regions', d.soustalents.join(';'));
    if (d.ressources && d.ressources.length) CT.creation.ajouter(b, 'ressources', d.ressources.join(';'));
    b.boussole = {
      mecanisme: d.mecanisme,
      contexte: d.contexte,
      benefice: d.benefice,
      antiContexte: d.antiContexte,
      reussites: phrases(d.success),
      echecs: phrases(d.failure),
      source: d.source === 'quiz' ? 'quiz' : ''
    };
    return b;
  }

  /*
   * Lien « Revenir à ma Boussole » : la Boussole transmet l'adresse de la page d'où l'on vient
   * (#…&retour=…). Par prudence, seules les adresses de la Boussole sont acceptées (site Magic Humans
   * ou preview Vercel du projet boussole-decision, chemin /boussole-decision/), jamais un autre site.
   */
  function retourValide(adresse) {
    let u;
    try { u = new URL(String(adresse || '')); } catch (e) { return null; }
    const hote = u.hostname.toLowerCase();
    const autorise = u.protocol === 'https:' && (/^(www\.)?magichumans\.com$/.test(hote) || /^boussole-decision(-[a-z0-9-]+)?\.vercel\.app$/.test(hote) ||
      /^wwwmagichumanscom(-[a-z0-9-]+)?\.vercel\.app$/.test(hote));
    if (!autorise || !u.pathname.startsWith('/boussole-decision/') || u.username || u.password) return null;
    return u.origin + u.pathname + u.search;
  }

  function lireRetour(hash) {
    const m = /(?:^#|&)retour=([^&]+)/.exec(String(hash || ''));
    if (!m) return null;
    try { return retourValide(decodeURIComponent(m[1])); } catch (e) { return null; }
  }

  CT.boussole = { lire, lirePdf, analyser, phrases, filRouge, versBrouillon, retourValide, lireRetour };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
