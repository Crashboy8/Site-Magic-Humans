/*
 * Écran « Progrès » : observer ce qui met dans le flow, sans juger.
 * Flow par semaine, tops, grille défi / maîtrise, frontières, propositions de conquête, objectifs.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const O = CT.outils;
  const S = CT.stats;

  const locale = CT.i18n.langue === 'en' ? 'en-GB' : 'fr-FR';
  const jourMois = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const moisAnnee = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' });

  function pluriel(n, un, plusieurs) {
    return n + ' ' + T(n > 1 ? plusieurs : un);
  }

  function libellePeriode(p, periode) {
    if (periode === 'mois') return p.enCours ? T('Ce mois-ci') : moisAnnee.format(p.debut);
    return p.enCours ? T('Cette semaine') : T('Sem. du {date}', { date: jourMois.format(p.debut) });
  }

  // ---------- Graphiques ----------

  // Barres verticales : nombre de moments par semaine (une seule série, une seule couleur).
  function graphiqueSemaines(semaines) {
    const L = 560;
    const Ht = 190;
    const bas = 150;
    const haut = 24;
    const max = Math.max(4, ...semaines.map((s) => s.nombre));
    const pas = L / semaines.length;
    const largeur = Math.min(40, pas * 0.56);
    const barres = semaines.map((s, i) => {
      const x = i * pas + (pas - largeur) / 2;
      const h = s.nombre ? Math.max(6, (bas - haut) * s.nombre / max) : 0;
      const y = bas - h;
      const r = Math.min(4, h / 2);
      const forme = h ? '<path class="barre' + (s.enCours ? ' barre-en-cours' : '') + '" d="M' + x.toFixed(1) + ' ' + bas + 'V' + (y + r).toFixed(1) +
        'q0 -' + r + ' ' + r + ' -' + r + 'H' + (x + largeur - r).toFixed(1) + 'q' + r + ' 0 ' + r + ' ' + r + 'V' + bas + 'Z"/>' : '';
      const etiquette = s.enCours ? T('En cours') : jourMois.format(s.debut);
      return '<g class="colonne"><title>' + O.echapper(libellePeriode(s, 'semaine') + T(' : ') + pluriel(s.nombre, 'moment de flow', 'moments de flow')) + '</title>' +
        '<rect x="' + (i * pas).toFixed(1) + '" y="0" width="' + pas.toFixed(1) + '" height="' + Ht + '" fill="transparent"/>' + forme +
        (s.nombre ? '<text class="valeur-barre" x="' + (x + largeur / 2).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '">' + s.nombre + '</text>' : '') +
        '<text class="axe-x' + (s.enCours ? ' axe-en-cours' : '') + '" x="' + (x + largeur / 2).toFixed(1) + '" y="' + (bas + 20) + '">' + O.echapper(etiquette) + '</text></g>';
    }).join('');
    return '<svg class="graphique graphique-semaines" viewBox="0 0 ' + L + ' ' + Ht + '" role="img" aria-label="' + O.echapper(T('Moments de flow par semaine, sur 8 semaines')) + '">' +
      '<line class="ligne-base" x1="0" x2="' + L + '" y1="' + bas + '" y2="' + bas + '"/>' + barres + '</svg>';
  }

  // Grille défi (vertical) × maîtrise (horizontal), intensité d'une seule teinte.
  function graphiqueDefiMaitrise(grille) {
    const c = 50;
    const g = 46; // marge gauche (axe défi)
    const h0 = 26; // marge haute (étiquette zone de flow)
    const max = Math.max(1, ...grille.flat());
    let cases = '';
    for (let defi = 5; defi >= 1; defi--) {
      for (let maitrise = 1; maitrise <= 5; maitrise++) {
        const n = grille[defi - 1][maitrise - 1];
        const x = g + (maitrise - 1) * c;
        const y = h0 + (5 - defi) * c;
        const ratio = n / max;
        const fond = n ? O.nuance('#C94B6D', 0.86 - 0.8 * ratio) : null;
        cases += '<g><title>' + T('Défi {defi}, maîtrise {maitrise} : {moments}', { defi, maitrise, moments: pluriel(n, 'moment', 'moments') }) + '</title>' +
          '<rect class="case' + (n ? '' : ' case-vide') + '" x="' + (x + 1) + '" y="' + (y + 1) + '" width="' + (c - 2) + '" height="' + (c - 2) + '" rx="6"' +
          (fond ? ' style="fill:' + fond + '"' : '') + '/>' +
          (n ? '<text class="valeur-case' + (ratio > 0.55 ? ' valeur-claire' : '') + '" x="' + (x + c / 2) + '" y="' + (y + c / 2 + 5) + '">' + n + '</text>' : '') + '</g>';
      }
    }
    const zx = g + 3 * c;
    const zy = h0;
    const axes = [1, 2, 3, 4, 5].map((v) =>
      '<text class="axe-x" x="' + (g + (v - 0.5) * c) + '" y="' + (h0 + 5 * c + 18) + '">' + v + '</text>' +
      '<text class="axe-y" x="' + (g - 10) + '" y="' + (h0 + (5 - v + 0.5) * c + 4) + '">' + v + '</text>').join('');
    const L = g + 5 * c + 8;
    const Ht = h0 + 5 * c + 46;
    return '<svg class="graphique graphique-grille" viewBox="0 0 ' + L + ' ' + Ht + '" role="img" aria-label="' + O.echapper(T('Moments de flow selon le défi et la maîtrise')) + '">' +
      cases +
      '<rect class="zone-flow" x="' + zx + '" y="' + zy + '" width="' + (2 * c) + '" height="' + (2 * c) + '" rx="8"/>' +
      '<text class="etiquette-zone" x="' + (zx + c) + '" y="' + (zy - 8) + '">' + T('Zone de flow') + '</text>' +
      axes +
      '<text class="titre-axe" x="' + (g + 2.5 * c) + '" y="' + (Ht - 4) + '">' + T('Maîtrise →') + '</text>' +
      '<text class="titre-axe" transform="translate(12 ' + (h0 + 2.5 * c) + ') rotate(-90)">' + T('Défi →') + '</text>' +
      '</svg>';
  }

  // Barres horizontales en HTML : nom, barre, valeur.
  function listeBarres(lignes, avecLien) {
    if (!lignes.length) return '<p class="vide">' + T('Rien pour cette période.') + '</p>';
    const max = Math.max(...lignes.map((l) => l.nombre));
    return '<ul class="barres">' + lignes.map((l) =>
      '<li><span class="barres-nom">' + (l.icone ? '<i data-lucide="' + O.echapper(l.icone) + '"></i>' : '<span class="puce" style="background:' + l.couleur + '"></span>') +
      (avecLien && l.id ? '<button type="button" class="lien-carte" data-action="voir" data-valeur="' + O.echapper(l.id) + '">' + O.echapper(l.nom) + '</button>' : '<span>' + O.echapper(l.nom) + '</span>') +
      '</span><span class="barres-piste"><span style="width:' + Math.max(4, l.nombre / max * 100).toFixed(1) + '%;background:' + l.couleur + '"></span></span>' +
      '<span class="barres-valeur">' + l.nombre + '</span></li>').join('') + '</ul>';
  }

  // ---------- Sections ----------

  function sectionPropositions(carte) {
    const props = S.propositionsConquete(carte);
    if (!props.length) return '';
    return props.map((f) => '<section class="carte-progres proposition" aria-live="polite">' +
      '<div class="proposition-icone"><i data-lucide="trophy"></i></div><div class="proposition-texte">' +
      '<h3>' + T('« {nom} » compte {moments} de flow', { nom: O.echapper(f.c.nom), moments: pluriel(f.nombre, 'moment', 'moments') }) + '</h3>' +
      '<p>' + T('Ce territoire te semble-t-il conquis ? C\'est toi qui décides.') + '</p>' +
      '<div class="proposition-actions"><button type="button" class="bouton bouton-principal" data-action="conquerir" data-valeur="' + O.echapper(f.c.id) + '">' +
      '<i data-lucide="trophy"></i>' + T('Oui, je l\'ai conquis') + '</button>' +
      '<button type="button" class="bouton bouton-secondaire" data-action="pas-encore" data-valeur="' + O.echapper(f.c.id) + '">' + T('Pas encore') + '</button></div>' +
      '</div></section>').join('');
  }

  function resume(carte, jours) {
    const moments = S.momentsPeriode(carte, jours);
    if (!moments.length) {
      return '<p class="resume">' + (jours ? T('Pas de moment de flow noté ces 30 derniers jours. Le prochain sera le bienvenu.') : '') + '</p>';
    }
    const comps = new Set();
    moments.forEach((m) => m.competenceIds.forEach((id) => comps.add(id)));
    const region = S.topRegions(carte, { jours, n: 1 })[0];
    return '<p class="resume">' + T(jours ? '<strong>{moments} de flow</strong> ces 30 derniers jours, sur <strong>{competences}</strong>.' : '<strong>{moments} de flow</strong> depuis le début, sur <strong>{competences}</strong>.',
      { moments: pluriel(moments.length, 'moment', 'moments'), competences: pluriel(comps.size, 'compétence', 'compétences') }) +
      (region ? ' ' + T('C\'est dans <strong>{nom}</strong> que le flow revient le plus souvent.', { nom: O.echapper(region.nom) }) : '') + '</p>';
  }

  function pastilles(fait, cible) {
    const n = Math.max(fait, cible);
    return '<span class="pastilles" aria-hidden="true">' + Array.from({ length: n }, (_, i) =>
      '<span class="pastille-session' + (i < fait ? ' faite' : '') + (i >= cible ? ' bonus' : '') + '"></span>').join('') + '</span>';
  }

  function sectionObjectifs(carte, etat) {
    const frontiereSansObjectif = carte.competences.filter((c) => c.statut === 'frontiere' && !CT.regles.objectifDe(carte, c.id));
    let html = '<section class="carte-progres" id="progres-objectifs"><h3><i data-lucide="target"></i> ' + T('Objectifs') + '</h3>';
    if (!carte.objectifs.length) html += '<p class="vide">' + T('Aucun objectif pour l\'instant. Tu peux en associer un à une frontière.') + '</p>';
    carte.objectifs.forEach((o) => {
      const c = CT.regles.trouver(carte, o.competenceId);
      if (!c) return;
      const suivi = S.suiviObjectif(carte, o);
      const a = suivi.actuelle;
      const periode = o.frequence.periode;
      const maintenant = periode === 'mois' ? T('ce mois-ci') : T('cette semaine');
      if (etat.edition === o.id) { html += formulaireObjectif(carte, o, c); return; }
      html += '<article class="objectif-suivi"><div class="objectif-tete"><div><p class="objectif-nom">' + O.echapper(c.nom) + '</p>' +
        '<p class="discret">' + O.echapper(o.description) + '</p></div>' +
        '<button type="button" class="bouton-lien" data-action="modifier-objectif" data-valeur="' + O.echapper(o.id) + '">' + T('Modifier') + '</button></div>' +
        '<div class="objectif-maintenant">' + pastilles(a.fait, a.cible) + '<span>' + (a.fait >= a.cible
          ? '<i data-lucide="check"></i>' + T('Objectif atteint {quand} ({sessions})', { quand: maintenant, sessions: pluriel(a.fait, 'session', 'sessions') })
          : T('{fait} sur {cible} {quand}', { fait: pluriel(a.fait, 'session', 'sessions'), cible: a.cible, quand: maintenant })) + '</span></div>' +
        '<div class="objectif-actions"><button type="button" class="bouton bouton-secondaire bouton-compact" data-action="session" data-valeur="' + O.echapper(o.id) + '">' +
        '<i data-lucide="plus"></i>' + T('J\'ai fait une session') + '</button>' +
        (a.manuelles ? '<button type="button" class="bouton-lien" data-action="retirer-session" data-valeur="' + O.echapper(o.id) + '">' + T('Retirer la dernière') + '</button>' : '') + '</div>' +
        '<ul class="historique">' + suivi.periodes.slice(0, -1).map((p) => '<li><span>' + libellePeriode(p, periode) + '</span>' + pastilles(p.fait, p.cible) + '</li>').join('') + '</ul>' +
        '<p class="discret">' + T('Les moments de flow notés sur « {nom} » comptent aussi comme des sessions.', { nom: O.echapper(c.nom) }) + '</p></article>';
    });
    if (etat.edition === 'nouveau') html += formulaireObjectif(carte, null, null, etat.preselection);
    else if (frontiereSansObjectif.length) {
      html += '<button type="button" class="bouton bouton-secondaire bouton-large" data-action="nouvel-objectif"><i data-lucide="plus"></i>' + T('Associer un objectif à une frontière') + '</button>';
    }
    return html + '</section>';
  }

  function formulaireObjectif(carte, o, c, preselection) {
    const choix = carte.competences.filter((x) => x.statut === 'frontiere' && !CT.regles.objectifDe(carte, x.id));
    const fois = o ? o.frequence.fois : 2;
    const periode = o ? o.frequence.periode : 'semaine';
    return '<form class="objectif-formulaire" data-objectif="' + (o ? O.echapper(o.id) : '') + '">' +
      (o ? '<p class="objectif-nom">' + O.echapper(c.nom) + '</p><input type="hidden" name="competence" value="' + O.echapper(c.id) + '">'
        : '<label class="champ"><span>' + T('Frontière') + '</span><select name="competence" id="objectif-competence">' + choix.map((x) =>
          '<option value="' + O.echapper(x.id) + '"' + (x.id === preselection ? ' selected' : '') + '>' + O.echapper(x.nom) + '</option>').join('') + '</select></label>') +
      '<div class="objectif-rythme"><label class="champ"><span>' + T('Combien de fois') + '</span><input type="number" name="fois" id="objectif-fois" min="1" max="99" value="' + fois + '" inputmode="numeric"></label>' +
      '<label class="champ"><span>' + T('Par') + '</span><select name="periode" id="objectif-periode"><option value="semaine"' + (periode === 'semaine' ? ' selected' : '') + '>' + T('semaine') + '</option>' +
      '<option value="mois"' + (periode === 'mois' ? ' selected' : '') + '>' + T('mois') + '</option></select></label></div>' +
      '<label class="champ"><span>' + T('En quelques mots (facultatif)') + '</span><input type="text" name="description" id="objectif-description" maxlength="120" value="' + (o ? O.echapper(o.description) : '') + '" placeholder="' + O.echapper(T('Ex. : 2 sessions de prospection')) + '"></label>' +
      '<div class="objectif-actions"><button type="submit" class="bouton bouton-principal bouton-compact">' + T('Enregistrer') + '</button>' +
      '<button type="button" class="bouton-lien" data-action="annuler-objectif">' + T('Annuler') + '</button>' +
      (o ? '<button type="button" class="bouton-lien bouton-lien-discret" data-action="supprimer-objectif" data-valeur="' + O.echapper(o.id) + '">' + T('Supprimer l\'objectif') + '</button>' : '') +
      '</div></form>';
  }

  function sectionFrontieres(carte) {
    const fr = S.frontieres(carte);
    let html = '<section class="carte-progres"><h3><i data-lucide="mountain"></i> ' + T('Frontières en cours') + '</h3>' +
      '<p class="discret">' + T('Après {moments} de flow, l\'appli te propose de passer la frontière en territoire conquis (seuil réglable dans les Réglages).', { moments: pluriel(carte.preferences.seuilConquete, 'moment', 'moments') }) + '</p>';
    if (!fr.length) return html + '<p class="vide">' + T('Pas de frontière en ce moment.') + '</p></section>';
    html += '<ul class="frontieres">' + fr.map((f) => {
      const o = CT.regles.objectifDe(carte, f.c.id);
      return '<li><div class="frontiere-tete"><button type="button" class="lien-carte" data-action="voir" data-valeur="' + O.echapper(f.c.id) + '">' +
        '<i data-lucide="' + O.echapper(f.c.icone) + '"></i>' + O.echapper(f.c.nom) + '</button>' +
        (f.c.priorite ? '<span class="puce-etat">' + T('priorité n°{rang}', { rang: f.c.priorite }) + '</span>' : '') +
        (f.pret ? '<span class="puce-etat puce-prete"><i data-lucide="trophy"></i>' + T('prête') + '</span>' : '') + '</div>' +
        '<div class="progression" role="progressbar" aria-valuemin="0" aria-valuemax="' + f.seuil + '" aria-valuenow="' + Math.min(f.nombre, f.seuil) + '" aria-label="' + O.echapper(f.c.nom) + '">' +
        '<span style="width:' + (f.ratio * 100).toFixed(1) + '%"></span></div>' +
        '<p class="discret">' + T('{n} / {seuil} moments', { n: f.nombre, seuil: f.seuil }) + (o ? ' · ' + T('objectif : {texte}', { texte: O.echapper(o.description) }) : '') + '</p></li>';
    }).join('') + '</ul>';
    return html + '</section>';
  }

  function contenu(carte, etat) {
    const jours = etat.periode === '30' ? 30 : null;
    const tete = '<header class="progres-tete"><div><p class="surtitre"><i data-lucide="chart-column"></i> ' + T('Progrès') + '</p>' +
      '<h2 id="progres-titre">' + T('Ce qui te met dans le flow') + '</h2><p class="discret">' + T('Un regard pour observer, pas pour juger.') + '</p></div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="' + O.echapper(T('Fermer')) + '"><i data-lucide="x"></i></button></header>';

    if (!carte.momentsDeFlow.length) {
      return tete + '<div class="progres-corps"><section class="carte-progres vide-grand"><i data-lucide="waves"></i>' +
        '<h3>' + T('Ta carte attend ses premiers moments de flow') + '</h3><p>' + T('Note un moment quand tu te sens pleinement engagé : les graphiques se rempliront au fil des semaines.') + '</p>' +
        '<button type="button" class="bouton bouton-principal" data-action="flow"><i data-lucide="waves"></i>' + T('J\'étais dans le flow') + '</button></section>' +
        sectionObjectifs(carte, etat) + sectionFrontieres(carte) + '</div>';
    }

    const comps = S.topCompetences(carte, { jours, n: 5 }).map((x) => ({
      id: x.c.id, nom: x.c.nom, icone: x.c.icone, nombre: x.nombre, couleur: CT.vueCarte.couleurDe(x.c, carte)
    }));
    const zones = S.topRegions(carte, { jours, n: 6 });

    return tete +
      '<div class="progres-outils" role="group" aria-label="' + O.echapper(T('Période')) + '"><div class="segments">' +
      [['30', T('30 derniers jours')], ['tout', T('Depuis le début')]].map(([v, l]) =>
        '<button type="button" data-action="periode" data-valeur="' + v + '" aria-pressed="' + (etat.periode === v) + '">' + l + '</button>').join('') +
      '</div></div>' +
      '<div class="progres-corps">' +
      sectionPropositions(carte) +
      '<section class="carte-progres carte-large">' + resume(carte, jours) + '</section>' +
      '<section class="carte-progres"><h3><i data-lucide="calendar-days"></i> ' + T('Flow par semaine') + '</h3>' + graphiqueSemaines(S.fluxParSemaine(carte, 8)) +
      '<p class="discret">' + T('Les 8 dernières semaines, toutes périodes confondues.') + '</p></section>' +
      sectionObjectifs(carte, etat) +
      '<section class="carte-progres"><h3><i data-lucide="sparkles"></i> ' + T('Compétences qui mènent au flow') + '</h3>' + listeBarres(comps, true) + '</section>' +
      '<section class="carte-progres"><h3><i data-lucide="map"></i> ' + T('Régions qui mènent au flow') + '</h3>' + listeBarres(zones, false) +
      '<p class="discret">' + T('Un moment compte une fois par région, même s\'il touche plusieurs compétences.') + '</p></section>' +
      '<section class="carte-progres"><h3><i data-lucide="grid-3x3"></i> ' + T('Défi et maîtrise') + '</h3>' + graphiqueDefiMaitrise(S.grilleDefiMaitrise(carte, { jours })) +
      '<p class="discret">' + T('En haut à droite, défi et maîtrise élevés : la zone de flow. En haut à gauche, un terrain où tu grandis. En bas à droite, des moments fluides et reposants.') + '</p></section>' +
      sectionFrontieres(carte) +
      '</div>';
  }

  function creer(racine, rappels) {
    const etat = { periode: '30', edition: null, preselection: null };
    let ouvert = false;
    let dernierFocus = null;

    function rendre() {
      if (!ouvert) return;
      const defilement = racine.querySelector('.progres-page') ? racine.querySelector('.progres-page').scrollTop : 0;
      racine.innerHTML = '<div class="progres-page" role="dialog" aria-modal="true" aria-labelledby="progres-titre">' + contenu(rappels.carte(), etat) + '</div>';
      racine.querySelector('.progres-page').scrollTop = defilement;
      O.rafraichirIcones(racine);
    }

    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (!b) return;
      const action = b.getAttribute('data-action');
      const valeur = b.getAttribute('data-valeur');
      if (action === 'fermer') { fermer(); return; }
      if (action === 'periode') { etat.periode = valeur; rendre(); return; }
      if (action === 'nouvel-objectif') { etat.edition = 'nouveau'; rendre(); return; }
      if (action === 'modifier-objectif') { etat.edition = valeur; rendre(); return; }
      if (action === 'annuler-objectif') { etat.edition = null; rendre(); return; }
      if (action === 'voir' || action === 'conquerir' || action === 'flow') fermer();
      if (action === 'supprimer-objectif') etat.edition = null;
      rappels.action(action, valeur);
    });

    racine.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      rappels.action('enregistrer-objectif', {
        competenceId: f.elements.competence.value,
        fois: f.elements.fois.value,
        periode: f.elements.periode.value,
        description: f.elements.description.value
      });
      etat.edition = null;
      rendre();
    });

    racine.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); fermer(); } });

    function ouvrir(options) {
      etat.edition = options && options.nouvelObjectif ? 'nouveau' : null;
      etat.preselection = options && options.nouvelObjectif ? options.nouvelObjectif : null;
      dernierFocus = document.activeElement;
      ouvert = true;
      racine.hidden = false;
      rendre();
      requestAnimationFrame(() => racine.classList.add('visible'));
      const cible = options && options.nouvelObjectif ? racine.querySelector('#progres-objectifs') : null;
      if (cible) cible.scrollIntoView({ block: 'start' });
      const fermerBtn = racine.querySelector('.fermer');
      if (fermerBtn) fermerBtn.focus({ preventScroll: true });
    }

    function fermer() {
      if (!ouvert) return;
      ouvert = false;
      racine.classList.remove('visible');
      setTimeout(() => { if (!ouvert) racine.hidden = true; }, 250);
      if (dernierFocus && dernierFocus.focus) dernierFocus.focus({ preventScroll: true });
    }

    return { ouvrir, fermer, rendre, get ouvert() { return ouvert; } };
  }

  CT.vueProgres = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
