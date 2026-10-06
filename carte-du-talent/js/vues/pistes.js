/*
 * Écran « Mes pistes » : des métiers, activités et offres indépendantes qui collent au talent,
 * avec le pourcentage de correspondance, les hexagones qui la justifient et ce qui manque.
 * « Viser cette piste » transforme les compétences manquantes en territoires en conquête, classés par priorité.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const O = CT.outils;
  const P = CT.pistes;
  const OR = CT.orientation;

  function nomCarte(c) {
    return CT.bibliotheque.nomAffiche(c);
  }

  function lienHexagone(c) {
    return '<button type="button" class="lien-carte puce-hex" data-action="voir" data-valeur="' + O.echapper(c.id) + '">' +
      '<i data-lucide="' + O.echapper(c.icone) + '"></i>' + O.echapper(nomCarte(c)) + '</button>';
  }

  function manquante(carte, m) {
    const f = OR.fiche(carte, m.id);
    const sur = OR.surLaCarte(carte, m);
    const niveau = O.echapper(f.facilite.libelle);
    const deleguee = sur && (sur.statut === 'a_deleguer' || sur.statut === 'ressource');
    return '<li class="manquante" data-entree="' + O.echapper(m.id) + '"><div class="manquante-ligne">' +
      '<i data-lucide="' + O.echapper(m.icone) + '"></i><span class="manquante-nom">' + O.echapper(m.nom) + '</span>' +
      '<span class="manquante-meta">' + O.echapper(T('≈ {h} h · {niveau}', { h: f.duree.heures, niveau: f.facilite.libelle })) + '</span>' +
      (deleguee ? '<span class="discret">' + T('Dans ta zone à déléguer') + '</span>'
        : '<button type="button" class="bouton-deja" data-action="deja" data-valeur="' + O.echapper(m.id) + '"><i data-lucide="check"></i>' + T('Je l\'ai déjà') + '</button>') +
      '</div><details class="fiche"><summary>' + T('Comment m\'y mettre ?') + '</summary>' +
      '<p><i data-lucide="clock"></i>' + O.echapper(T('Temps estimé : {duree}', { duree: T(f.duree.libelle) })) + '</p>' +
      '<p><i data-lucide="gauge"></i>' + O.echapper(T('Pour toi : {niveau}', { niveau: f.facilite.libelle })) + ' <span class="discret">' + O.echapper(f.facilite.raison) + '</span></p>' +
      '<h5>' + T('Pour commencer') + '</h5><ol class="premieres-actions">' + f.actions.map((a) => '<li>' + O.echapper(a) + '</li>').join('') + '</ol>' +
      '<button type="button" class="bouton bouton-secondaire bouton-compact" data-action="plan" data-valeur="' + O.echapper(m.id) + '"><i data-lucide="rocket"></i>' + T('Me lancer sur 30 jours') + '</button>' +
      '</details></li>';
  }

  function infos(e) {
    const i = OR.infosPiste(e.piste);
    if (!i) return '';
    return '<dl class="piste-infos">' +
      '<div><dt><i data-lucide="briefcase"></i>' + T('Statut possible') + '</dt><dd>' + O.echapper(i.statutLibelle) + '</dd></div>' +
      '<div><dt><i data-lucide="wallet"></i>' + T('Revenu indicatif') + '</dt><dd title="' + O.echapper(i.note) + '">' + O.echapper(i.revenu) + '<sup>*</sup>' +
      '<span class="discret note-revenu">' + O.echapper(i.note) + '</span></dd></div>' +
      '<div><dt><i data-lucide="sparkles"></i>' + T('Exemple') + '</dt><dd>' + O.echapper(i.exemple) + '</dd></div></dl>';
  }

  function talentIci(carte, e) {
    const l = OR.lienTalent(carte, e);
    return '<div class="piste-bloc piste-talent niveau-' + l.niveau + '"><h4>' + T('Ton talent ici') + '</h4>' +
      '<p class="puce-etat puce-alignement"><i data-lucide="target"></i>' + O.echapper(l.libelle) + '</p>' +
      (l.talent ? '<p>' + O.echapper(T('Talent mobilisé : {talent}', { talent: l.talent })) + '</p>' : '') +
      (l.sousTalents.length ? '<p>' + O.echapper(T('Sous-talents utilisés : {liste}', { liste: l.sousTalents.join(T(', ')) })) + '</p>' : '') +
      (l.moment ? '<p>' + O.echapper(T('Moment de flow qui s\'y retrouve : « {moment} »', { moment: l.moment })) + '</p>' : '') +
      (l.conseil ? '<p class="discret">' + O.echapper(l.conseil) + '</p>' : '') + '</div>';
  }

  function carteDePiste(carte, e) {
    const type = P.TYPES[e.piste.type];
    const justifient = e.hexagones.map((id) => CT.regles.trouver(carte, id)).filter(Boolean);
    const manquantes = e.manquantes;
    const nom = O.echapper(e.piste.nom);
    return '<article class="carte-progres piste' + (e.visee ? ' piste-visee' : '') + '" data-piste="' + O.echapper(e.piste.id) + '">' +
      '<header class="piste-tete"><div><span class="puce-etat"><i data-lucide="' + type.icone + '"></i>' + type.nom + '</span>' +
      '<h3>' + nom + '</h3></div>' +
      '<div class="piste-score" role="img" aria-label="' + O.echapper(T('Correspondance : {n} %', { n: e.pourcentage })) + '"><strong>' + e.pourcentage + '</strong><span>%</span></div></header>' +
      '<div class="progression" aria-hidden="true"><span style="width:' + e.pourcentage + '%"></span></div>' +
      infos(e) + talentIci(carte, e) +
      '<div class="piste-bloc"><h4>' + T('Ce qui la justifie') + '</h4>' +
      (justifient.length ? '<p class="puces-hex">' + justifient.map(lienHexagone).join('') + '</p>'
        : '<p class="vide">' + T('Pas encore d\'hexagone sur ta carte : c\'est une piste à explorer.') + '</p>') + '</div>' +
      '<div class="piste-bloc"><h4>' + T('Compétences manquantes') + '</h4>' +
      (manquantes.length ? '<ul class="liste-manquantes">' + manquantes.map((m) => manquante(carte, m)).join('') + '</ul>'
        : '<p class="discret">' + T('Rien ne manque : tu as déjà tout ce qu\'il faut pour cette piste.') + '</p>') + '</div>' +
      (e.visee
        ? '<div class="piste-actions"><span class="puce-etat puce-prete"><i data-lucide="flag"></i>' + T('Piste visée') + '</span>' +
          '<button type="button" class="bouton-lien bouton-lien-discret" data-action="abandonner" data-valeur="' + O.echapper(e.piste.id) + '">' + T('Ne plus viser') + '</button></div>'
        : (manquantes.length
          ? '<div class="piste-actions"><button type="button" class="bouton bouton-principal bouton-compact" data-action="viser" data-valeur="' + O.echapper(e.piste.id) + '">' +
            '<i data-lucide="flag"></i>' + T('Viser cette piste') + '</button></div>'
          : '')) +
      '</article>';
  }

  function meta(f) {
    return O.echapper(T('≈ {h} h · {niveau}', { h: f.duree.heures, niveau: f.facilite.libelle }));
  }

  // F. La compétence qui fait avancer le plus de pistes pour le moins d'effort.
  function sectionProchaine(carte, ecartees) {
    const p = OR.prochaine(carte, ecartees);
    let html = '<section class="carte-progres carte-large prochaine"><h3><i data-lucide="compass"></i> ' + T('Ma prochaine compétence') + '</h3>' +
      '<p class="discret">' + T('La compétence qui fait avancer le plus de pistes, avec le moins d\'effort.') + '</p>';
    if (!p) return html + '<p class="vide">' + T('Pas d\'autre idée pour l\'instant : tu as déjà de quoi avancer !') + '</p></section>';
    const id = O.echapper(p.entree.id);
    const vues = p.pistes.slice(0, 4);
    html += '<p class="prochaine-nom"><i data-lucide="' + O.echapper(p.entree.icone) + '"></i><strong>' + O.echapper(p.entree.nom) + '</strong> ' +
      '<span class="manquante-meta">' + meta(p.fiche) + '</span></p>' +
      '<p>' + O.echapper(CT.i18n.Tn(p.pistes.length, 'Elle fait avancer {n} piste :', 'Elle fait avancer {n} pistes :')) + '</p>' +
      '<ul class="prochaine-pistes">' + vues.map((x) => '<li>' + O.echapper(T('{piste} (+{gain} %)', { piste: x.piste.nom, gain: x.gain })) + '</li>').join('') + '</ul>' +
      '<div class="piste-actions">' +
      '<button type="button" class="bouton bouton-principal bouton-compact" data-action="plan" data-valeur="' + id + '"><i data-lucide="rocket"></i>' + T('Me lancer sur 30 jours') + '</button>' +
      '<button type="button" class="bouton bouton-secondaire bouton-compact" data-action="deja" data-valeur="' + id + '"><i data-lucide="check"></i>' + T('Je l\'ai déjà') + '</button>' +
      '<button type="button" class="bouton-lien" data-action="autre-idee" data-valeur="' + id + '"><i data-lucide="shuffle"></i>' + T('Une autre idée') + '</button></div></section>';
    return html;
  }

  // G. Plan sur 30 jours : 4 semaines de 3 actions à cocher.
  function sectionPlan(carte, s) {
    const semaines = s.semaines.map((sem, i) => '<div class="plan-semaine' + (i + 1 === s.semaine && !s.fini ? ' semaine-en-cours' : '') + '"><h4>' + O.echapper(sem.titre) + '</h4>' +
      sem.actions.map((texte, k) => '<label class="action-plan"><input type="checkbox" data-action="cocher" data-valeur="' + (i * 3 + k) + '"' + (sem.faites[k] ? ' checked' : '') + '> <span>' + O.echapper(texte) + '</span></label>').join('') + '</div>').join('');
    const conquise = s.competence.statut === 'conquise' || s.competence.statut === 'natale';
    return '<section class="carte-progres carte-large plan-30"><h3><i data-lucide="flag"></i> ' + T('Mon plan sur 30 jours') + '</h3>' +
      '<p class="plan-nom">' + O.echapper(T('Plan : {nom}', { nom: nomCarte(s.competence) })) + '</p>' +
      '<p class="discret">' + O.echapper(T('Jour {j} sur 30 · {n} actions sur 12', { j: Math.min(30, s.jours + 1), n: s.faites })) + '</p>' +
      '<div class="progression" aria-hidden="true"><span style="width:' + Math.round(100 * s.progression) + '%"></span></div>' +
      (s.depasse ? '<p class="discret">' + T('Les 30 jours sont passés, ton plan reste ouvert : avance à ton rythme.') + '</p>' : '') +
      semaines +
      (s.fini ? '<p class="plan-fini"><i data-lucide="sparkles"></i>' + T('Plan terminé, bravo !') + '</p><div class="piste-actions">' +
        (conquise ? '' : '<button type="button" class="bouton bouton-principal bouton-compact" data-action="deja" data-valeur="' + O.echapper(s.entree.id) + '">' + T('Je l\'ai déjà') + '</button>') +
        '<button type="button" class="bouton bouton-secondaire bouton-compact" data-action="nouveau-plan"><i data-lucide="rocket"></i>' + T('Lancer ma prochaine compétence') + '</button></div>'
        : '<button type="button" class="bouton-lien bouton-lien-discret" data-action="arreter-plan">' + T('Arrêter ce plan') + '</button>') +
      '</section>';
  }

  function appel() {
    return '<section class="carte-progres carte-large cta-appel"><h3><i data-lucide="calendar-check"></i> ' + T('Envie d\'en parler ?') + '</h3>' +
      '<p><strong>' + T('Appel découverte · 1 heure · offert') + '</strong></p>' +
      '<p>' + T('Tu arrives avec ta carte et tes pistes. On regarde ensemble celle qui te met vraiment dans le flow, et par où commencer.') + '</p>' +
      '<a class="bouton bouton-principal" href="' + O.echapper(OR.urlAppel('pistes')) + '" target="_blank" rel="noopener">' + T('En parler avec Pierre') + '</a></section>';
  }

  // Territoires en conquête, dans l'ordre de priorité, avec les flèches pour changer l'ordre.
  function sectionPriorites(carte) {
    const liste = CT.regles.frontieres(carte);
    if (!liste.length) return '';
    return '<section class="carte-progres carte-large"><h3><i data-lucide="flag"></i> ' + T('Mes priorités') + '</h3>' +
      '<p class="discret">' + T('Le n°1 est le territoire que tu attaques d\'abord. Change l\'ordre avec les flèches : il est enregistré.') + '</p>' +
      '<ol class="priorites">' + liste.map((c, i) => {
        const pour = P.pistesDe(c).map((p) => p.nom);
        return '<li><span class="rang">' + (i + 1) + '</span>' + lienHexagone(c) +
          (pour.length ? '<span class="discret pour-piste">' + O.echapper(T('pour : {pistes}', { pistes: pour.join(T(', ')) })) + '</span>' : '') +
          '<span class="fleches">' +
          '<button type="button" class="fleche" data-action="priorite" data-valeur="' + O.echapper(c.id) + '|-1"' + (i === 0 ? ' disabled' : '') +
          ' aria-label="' + O.echapper(T('Monter {nom}', { nom: nomCarte(c) })) + '"><i data-lucide="arrow-up"></i></button>' +
          '<button type="button" class="fleche" data-action="priorite" data-valeur="' + O.echapper(c.id) + '|1"' + (i === liste.length - 1 ? ' disabled' : '') +
          ' aria-label="' + O.echapper(T('Descendre {nom}', { nom: nomCarte(c) })) + '"><i data-lucide="arrow-down"></i></button></span></li>';
      }).join('') + '</ol></section>';
  }

  function contenu(carte, ecartees) {
    const entetes = '<header class="progres-tete"><div><p class="surtitre"><i data-lucide="compass"></i> ' + T('Mes pistes') + '</p>' +
      '<h2 id="pistes-titre">' + T('Des pistes qui collent à ton talent') + '</h2>' +
      '<p class="discret">' + T('Calculé sur ta carte : tes territoires, tes régions et tes moments de flow. Une piste est une idée à explorer, pas un verdict.') + '</p>' +
      '<div class="pistes-outils"><button type="button" class="bouton bouton-secondaire bouton-compact" data-action="bilan"><i data-lucide="list-checks"></i>' + T('Mon bilan d\'acquis') + '</button>' +
      '<button type="button" class="bouton bouton-secondaire bouton-compact" data-action="synthese"><i data-lucide="file-text"></i>' + T('Ma synthèse (1 page)') + '</button></div></div>' +
      '<button type="button" class="fermer" data-action="fermer" aria-label="' + O.echapper(T('Fermer')) + '"><i data-lucide="x"></i></button></header>';
    const pistes = P.proposer(carte);
    const plan = OR.etatPlan(carte, Date.now());
    return entetes + '<div class="progres-corps">' + (plan ? sectionPlan(carte, plan) : sectionProchaine(carte, ecartees)) +
      sectionPriorites(carte) + pistes.map((e) => carteDePiste(carte, e)).join('') + appel() +
      '<p class="note-source">* ' + O.echapper(T(CT.orientationDonnees.SOURCE_REVENU)) + '</p></div>';
  }

  function creer(racine, rappels) {
    let ouvert = false;
    let dernierFocus = null;
    let ecartees = [];

    function rendre() {
      if (!ouvert) return;
      const page = racine.querySelector('.progres-page');
      const defilement = page ? page.scrollTop : 0;
      const ouverts = [...racine.querySelectorAll('li[data-entree] details[open]')].map((d) => d.closest('li').getAttribute('data-entree'));
      racine.innerHTML = '<div class="progres-page" role="dialog" aria-modal="true" aria-labelledby="pistes-titre">' + contenu(rappels.carte(), ecartees) + '</div>';
      racine.querySelector('.progres-page').scrollTop = defilement;
      racine.querySelectorAll('li[data-entree]').forEach((li) => {
        if (ouverts.includes(li.getAttribute('data-entree'))) li.querySelector('details').open = true;
      });
      O.rafraichirIcones(racine);
    }

    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-action]');
      if (!b || b.disabled) return;
      const action = b.getAttribute('data-action');
      const valeur = b.getAttribute('data-valeur');
      if (action === 'fermer') { fermer(); return; }
      if (action === 'voir') fermer();
      if (action === 'autre-idee') { ecartees.push(valeur); rendre(); return; }
      rappels.action(action, valeur);
    });

    racine.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); fermer(); } });
    // Échap ferme aussi quand le focus n'est pas dans le panneau (un dialogue au-dessus passe avant).
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !ouvert) return;
      const dessus = ['bilan', 'synthese'].some((id) => { const el = document.getElementById(id); return el && !el.hidden; });
      if (dessus) return;
      e.preventDefault();
      e.stopPropagation();
      fermer();
    }, true);

    function ouvrir() {
      dernierFocus = document.activeElement;
      ouvert = true;
      ecartees = [];
      racine.hidden = false;
      rendre();
      requestAnimationFrame(() => racine.classList.add('visible'));
      const f = racine.querySelector('.fermer');
      if (f) f.focus({ preventScroll: true });
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

  CT.vuePistes = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
