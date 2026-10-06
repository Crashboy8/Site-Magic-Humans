/*
 * Mes pistes : métiers, activités et offres indépendantes qui collent au talent.
 * Base locale (aucune IA, aucun serveur) : chaque piste liste les compétences de la bibliothèque
 * qu'elle demande ; la correspondance se calcule à partir de la carte (territoires conquis,
 * frontières, îles de flow, moments de flow, talent et régions).
 * Aucun accès au DOM.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const TYPES = {
    metier: { nom: T('Métier'), icone: 'briefcase' },
    activite: { nom: T('Activité'), icone: 'sparkles' },
    offre: { nom: T('Offre indépendante'), icone: 'package' }
  };

  const MIN_PISTES = 5;
  const MAX_PISTES = 10;
  const MAX_PAR_TYPE = 5;
  const SEUIL_MANQUANT = 0.5; // en dessous, la compétence est « à acquérir » pour cette piste

  // [id, nom, type, compétences de la bibliothèque] : les deux premières comptent double.
  const BRUT = [
    // Métiers : transmission et accompagnement
    ['formateur', 'Formateur·rice', 'metier', ['preparer-formation', 'prise-parole', 'facilitation', 'conception-cours', 'animer-visio', 'ludopedagogie']],
    ['coach', 'Coach professionnel·le', 'metier', ['coaching', 'ecoute-active', 'accompagnement-individuel', 'feedback', 'cnv', 'intelligence-emotionnelle']],
    ['facilitateur', 'Facilitateur·rice d\'ateliers', 'metier', ['facilitation', 'animer-groupe', 'facilitation-graphique', 'team-building', 'prise-parole']],
    ['mediateur', 'Médiateur·rice', 'metier', ['mediation', 'conflits', 'cnv', 'ecoute-active', 'empathie']],
    ['consultant-rh', 'Consultant·e RH', 'metier', ['recrutement', 'mediation', 'feedback', 'conflits', 'coaching']],
    ['educateur', 'Éducateur·rice spécialisé·e', 'metier', ['empathie', 'accompagnement-individuel', 'mediation', 'ecoute-active', 'travail-equipe', 'animation-enfants']],
    ['enseignant', 'Enseignant·e du primaire', 'metier', ['enseigner-enfants', 'conception-cours', 'ludopedagogie', 'tutorat', 'animation-enfants']],
    ['prof-langues', 'Professeur·e de langues', 'metier', ['anglais', 'conception-cours', 'tutorat', 'ludopedagogie', 'espagnol']],
    ['animateur-enfants', 'Animateur·rice pour enfants', 'metier', ['animation-enfants', 'ludopedagogie', 'creation-jeux', 'enseigner-enfants', 'cirque']],
    ['manager', 'Manager d\'équipe', 'metier', ['leadership', 'coordination-equipe', 'delegation', 'feedback', 'recrutement', 'gestion-temps']],
    // Métiers : gestion et projets
    ['chef-projet', 'Chef·fe de projet', 'metier', ['gestion-projet', 'planification', 'coordination-equipe', 'priorisation', 'travail-equipe', 'budget']],
    ['evenementiel', 'Organisateur·rice d\'événements', 'metier', ['evenements', 'logistique', 'planification', 'budget', 'mise-en-scene-evenements', 'relation-client']],
    ['assistant', 'Assistant·e de direction', 'metier', ['administratif', 'gestion-temps', 'planification', 'logistique', 'priorisation', 'relation-client']],
    ['comptable', 'Comptable', 'metier', ['comptabilite', 'budget', 'administratif', 'excel-avance', 'planification']],
    ['analyste-financier', 'Analyste financier·ère', 'metier', ['analyse-financiere', 'comptabilite', 'budget', 'excel-avance', 'statistiques']],
    ['auditeur', 'Auditeur·rice qualité', 'metier', ['audit', 'processus', 'esprit-critique', 'synthese', 'statistiques']],
    ['consultant-strategie', 'Consultant·e en stratégie', 'metier', ['strategie', 'audit', 'modelisation', 'synthese', 'prise-decision', 'pitch']],
    ['charge-etudes', 'Chargé·e d\'études', 'metier', ['recherche', 'synthese', 'statistiques', 'veille', 'redaction', 'esprit-critique']],
    ['recrutement', 'Chargé·e de recrutement', 'metier', ['recrutement', 'interview', 'networking', 'ecoute-active', 'social-selling']],
    ['accueil', 'Hôte·sse d\'accueil', 'metier', ['hospitalite', 'relation-client', 'empathie', 'anglais', 'evenements']],
    // Métiers : vente et business
    ['commercial-b2b', 'Commercial·e B2B', 'metier', ['vente-b2b', 'prospection', 'rdv-commercial', 'objections', 'closing', 'crm']],
    ['business-dev', 'Business developer', 'metier', ['prospection', 'social-selling', 'networking', 'partenariats', 'vente-b2b', 'pitch']],
    ['relation-client', 'Responsable relation client', 'metier', ['relation-client', 'fidelisation', 'ecoute-active', 'conflits', 'feedback', 'empathie']],
    ['partenariats', 'Responsable des partenariats', 'metier', ['partenariats', 'networking', 'negociation', 'pitch', 'vente-b2b']],
    ['marketing', 'Responsable marketing', 'metier', ['marketing', 'copywriting', 'publicite', 'seo', 'analyse-donnees', 'strategie']],
    ['ecommercant', 'E-commerçant·e', 'metier', ['ecommerce', 'site-web', 'publicite', 'seo', 'relation-client', 'logistique']],
    // Métiers : communication et création
    ['communication', 'Chargé·e de communication', 'metier', ['ecrire-web', 'reseaux', 'newsletter', 'storytelling', 'design-graphique', 'seo']],
    ['community-manager', 'Community manager', 'metier', ['reseaux', 'social-selling', 'ecrire-web', 'design-graphique', 'veille', 'photographie']],
    ['redacteur', 'Rédacteur·rice web', 'metier', ['ecrire-web', 'seo', 'redaction', 'copywriting', 'recherche', 'synthese']],
    ['journaliste', 'Journaliste', 'metier', ['journalisme', 'interview', 'recherche', 'redaction', 'esprit-critique', 'podcast']],
    ['traducteur', 'Traducteur·rice', 'metier', ['traduction', 'redaction', 'anglais', 'espagnol', 'recherche']],
    ['videaste', 'Vidéaste', 'metier', ['montage-video', 'face-camera', 'scenario', 'photographie', 'storytelling']],
    ['graphiste', 'Graphiste', 'metier', ['design-graphique', 'illustration', 'ux-design', 'dessin', 'photographie']],
    ['illustrateur', 'Illustrateur·rice', 'metier', ['illustration', 'dessin', 'peinture', 'design-graphique']],
    ['photographe', 'Photographe', 'metier', ['photographie', 'montage-video', 'dessin', 'evenements']],
    ['ux-designer', 'UX designer', 'metier', ['ux-design', 'design-graphique', 'recherche', 'resolution-problemes', 'dataviz']],
    ['auteur', 'Auteur·rice', 'metier', ['ecriture-creative', 'storytelling', 'scenario', 'poesie', 'recherche', 'redaction']],
    ['scenariste', 'Scénariste', 'metier', ['scenario', 'storytelling', 'ecriture-creative', 'sketchs', 'recherche']],
    // Métiers : numérique
    ['developpeur', 'Développeur·se', 'metier', ['programmation', 'python', 'bases-donnees', 'resolution-problemes', 'site-web']],
    ['nocode', 'Spécialiste no-code', 'metier', ['nocode', 'processus', 'excel-avance', 'prompts', 'gestion-projet']],
    ['data-analyst', 'Analyste de données', 'metier', ['analyse-donnees', 'statistiques', 'python', 'dataviz', 'excel-avance', 'bases-donnees']],
    ['consultant-ia', 'Consultant·e en intelligence artificielle', 'metier', ['ia-generative', 'prompts', 'processus', 'preparer-formation', 'veille']],
    // Métiers : scène, corps, nature, artisanat
    ['comedien', 'Comédien·ne', 'metier', ['theatre', 'improvisation', 'voix', 'clown', 'mise-en-scene-evenements']],
    ['humoriste', 'Humoriste', 'metier', ['stand-up', 'sketchs', 'improvisation', 'voix', 'prise-parole']],
    ['musicien-intervenant', 'Musicien·ne intervenant·e', 'metier', ['guitare', 'chant', 'composition', 'animer-groupe', 'direction-choeur']],
    ['artiste-cirque', 'Artiste de cirque', 'metier', ['cirque', 'acrobatie', 'clown', 'magie', 'mise-en-scene-evenements']],
    ['prof-yoga', 'Professeur·e de yoga', 'metier', ['yoga', 'meditation', 'respiration', 'voix', 'accompagnement-individuel']],
    ['coach-sportif', 'Coach sportif·ve', 'metier', ['coaching-sportif', 'musculation', 'course', 'coaching', 'feedback']],
    ['prof-danse', 'Professeur·e de danse', 'metier', ['danse', 'yoga', 'acrobatie', 'animer-groupe', 'feedback']],
    ['guide-nature', 'Guide nature', 'metier', ['education-nature', 'randonnee', 'ornithologie', 'cueillette', 'animer-groupe', 'vulgarisation']],
    ['permaculteur', 'Permaculteur·rice', 'metier', ['permaculture', 'jardinage', 'ecologie', 'apiculture', 'planification']],
    ['transition-ecologique', 'Chargé·e de transition écologique', 'metier', ['ecologie', 'audit', 'strategie', 'vulgarisation', 'gestion-projet']],
    ['traiteur', 'Cuisinier·ère traiteur', 'metier', ['cuisine', 'patisserie', 'logistique', 'hospitalite', 'budget']],
    ['menuisier', 'Menuisier·ère', 'metier', ['menuiserie', 'bricolage', 'dessin', 'reparation', 'sculpture']],
    ['associatif', 'Chargé·e de projets associatifs', 'metier', ['benevolat', 'evenements', 'ecologie', 'partenariats', 'gestion-projet', 'newsletter']],
    // Activités : ce qu'on peut pratiquer, bénévolement ou à côté
    ['conferencier', 'Conférencier·ère', 'activite', ['prise-parole', 'storytelling', 'vulgarisation', 'pitch', 'discours']],
    ['maitre-ceremonie', 'Maître·sse de cérémonie', 'activite', ['maitre-ceremonie', 'animation-soiree', 'prise-parole', 'quiz-animation', 'improvisation']],
    ['createur-contenu', 'Créateur·rice de contenus', 'activite', ['storytelling', 'reseaux', 'montage-video', 'face-camera', 'ecrire-web']],
    ['podcasteur', 'Créateur·rice de podcast', 'activite', ['podcast', 'interview', 'voix', 'storytelling', 'ecrire-web']],
    ['mentor-benevole', 'Mentor bénévole', 'activite', ['mentorat', 'ecoute-active', 'benevolat', 'feedback', 'coaching']],
    ['meetups', 'Organisateur·rice de rencontres', 'activite', ['evenements', 'networking', 'animer-groupe', 'partenariats', 'reseaux']],
    ['troupe-impro', 'Troupe d\'improvisation', 'activite', ['improvisation', 'theatre', 'clown', 'animer-groupe', 'mise-en-scene-evenements']],
    ['jeux-escape', 'Créateur·rice d\'escape games', 'activite', ['creation-jeux', 'escape-game', 'jeux-societe', 'scenario', 'quiz-animation']],
    ['cours-collectifs', 'Cours collectifs de sport ou de danse', 'activite', ['animer-groupe', 'coaching-sportif', 'danse', 'yoga', 'voix']],
    ['chorale', 'Chorale ou groupe de musique', 'activite', ['chant', 'direction-choeur', 'guitare', 'composition', 'animer-groupe']],
    ['jardin-partage', 'Jardin partagé', 'activite', ['jardinage', 'permaculture', 'benevolat', 'evenements', 'animer-groupe']],
    ['repair-cafe', 'Repair café', 'activite', ['reparation', 'bricolage', 'mecanique', 'electronique', 'benevolat', 'vulgarisation']],
    ['scene-ouverte', 'Scène ouverte et poésie', 'activite', ['slam', 'poesie', 'voix', 'prise-parole', 'ecriture-creative']],
    ['magie-animation', 'Magicien·ne d\'animation', 'activite', ['magie', 'prise-parole', 'improvisation', 'animation-soiree', 'relation-client']],
    // Offres indépendantes : des services à proposer et à vendre
    ['offre-team-building', 'Ateliers de cohésion d\'équipe', 'offre', ['team-building', 'facilitation', 'animer-groupe', 'creation-jeux', 'vente-b2b']],
    ['offre-accompagnement', 'Programme d\'accompagnement individuel', 'offre', ['coaching', 'creation-offre', 'prix', 'ecoute-active', 'vente-conseil-independant', 'personal-branding']],
    ['offre-formation-ligne', 'Formation en ligne', 'offre', ['e-learning', 'conception-cours', 'face-camera', 'montage-video', 'marketing', 'creation-offre']],
    ['offre-retraite', 'Retraite ou séjour thématique', 'offre', ['evenements', 'logistique', 'hospitalite', 'yoga', 'creation-offre', 'budget']],
    ['offre-communaute', 'Communauté en ligne sur abonnement', 'offre', ['reseaux', 'newsletter', 'animer-visio', 'creation-offre', 'fidelisation']],
    ['offre-newsletter', 'Newsletter d\'expert·e', 'offre', ['newsletter', 'ecrire-web', 'copywriting', 'personal-branding', 'creation-offre']],
    ['offre-ateliers-enfants', 'Ateliers pour enfants et familles', 'offre', ['animation-enfants', 'ludopedagogie', 'creation-jeux', 'hospitalite', 'vente-salon']],
    ['offre-conference-entreprise', 'Conférences et ateliers en entreprise', 'offre', ['prise-parole', 'facilitation', 'vente-b2b', 'creation-offre', 'preparer-formation']],
    ['offre-assistance', 'Assistance à distance pour indépendants', 'offre', ['administratif', 'gestion-temps', 'nocode', 'relation-client', 'vente-conseil-independant']],
    ['offre-stages-nature', 'Stages et balades nature', 'offre', ['education-nature', 'randonnee', 'animer-groupe', 'creation-offre', 'logistique']],
    ['offre-boutique', 'Boutique de créations', 'offre', ['illustration', 'ecommerce', 'photographie', 'reseaux', 'vente-salon']],
    ['offre-audit-flash', 'Audit flash pour petites entreprises', 'offre', ['audit', 'strategie', 'processus', 'vente-conseil-independant', 'synthese']],
    ['offre-prise-parole', 'Coaching de prise de parole', 'offre', ['prise-parole', 'coaching', 'feedback', 'voix', 'creation-offre']],
    ['offre-cuisine', 'Ateliers de cuisine', 'offre', ['cuisine', 'patisserie', 'animer-groupe', 'hospitalite', 'creation-offre']]
  ];

  const PISTES = BRUT.map(([id, nom, type, requis]) => ({ id, nom: T(nom), type, requis }));

  function trouver(id) {
    return PISTES.find((p) => p.id === id) || null;
  }

  const N = (s) => CT.regles.normaliserTexte(s);
  const POIDS_STATUT = { natale: 1, conquise: 1, frontiere: 0.6, ile: 0.5, a_conquerir: 0.15, a_deleguer: 0, ressource: 0 };
  const POIDS_VOISINE = { natale: 1, conquise: 1, frontiere: 0.6, ile: 0.5 };

  // La carte (compétence) correspond-elle à cette entrée de la bibliothèque ?
  function memeEntree(c, entree) {
    return c.bibliothequeId === entree.id || [entree.nom].concat(entree.alias).map(N).includes(N(c.nom));
  }

  // Mot entier d'un lien dans le nom (« vente » dans « Vente en ligne ») : voisine plutôt qu'identique.
  function voisine(c, entree) {
    const n = ' ' + N(c.nom) + ' ';
    return entree.liens.some((l) => n.includes(' ' + l + ' '));
  }

  /*
   * Où en est la personne sur une compétence de la bibliothèque : { niveau 0–1, appuis: [hexagones] }.
   * Identique : selon son statut (conquise = 1, frontière = 0,6, île = 0,5, à conquérir = 0,15),
   * plus un petit bonus pour chaque moment de flow récent. Voisine : 0,4 au plus.
   * Même domaine déjà exploré : 0,15.
   */
  function niveauSur(carte, entree, maintenant) {
    let niveau = 0;
    const appuis = [];
    carte.competences.forEach((c) => {
      const flow = Math.min(0.2, 0.05 * CT.regles.momentsRecents(carte, c.id, 30, maintenant).length);
      if (memeEntree(c, entree)) {
        const poids = POIDS_STATUT[c.statut] || 0;
        if (poids > 0) { niveau = Math.max(niveau, Math.min(1, poids + (poids >= 0.5 ? flow : 0))); appuis.push({ c, valeur: poids + flow }); }
      } else if (POIDS_VOISINE[c.statut] && voisine(c, entree)) {
        niveau = Math.max(niveau, Math.min(0.4, 0.4 * POIDS_VOISINE[c.statut] + flow / 2));
        appuis.push({ c, valeur: 0.4 * POIDS_VOISINE[c.statut] + flow / 2 });
      }
    });
    if (!niveau && carte.competences.some((c) => c.domaine === entree.domaine && ['natale', 'conquise', 'frontiere'].includes(c.statut))) niveau = 0.15;
    return { niveau, appuis, flow: appuis.some((a) => a.valeur > 0 && CT.regles.momentsRecents(carte, a.c.id, 30, maintenant).length) };
  }

  // Grands domaines évoqués par le talent, le fil rouge et les noms de régions.
  function themesDe(carte) {
    const idees = CT.idees;
    const themes = new Set();
    if (!idees) return themes;
    [carte.talent.nom, carte.talent.filRouge].concat(carte.regions.map((r) => r.nom)).filter(Boolean)
      .forEach((t) => idees.domainesDe(t).forEach((d) => themes.add(d)));
    return themes;
  }

  /*
   * Évalue une piste : pourcentage de correspondance, hexagones qui la justifient, compétences manquantes.
   * base = 85 % compétences (les deux premières comptent double) + 15 % thème du talent ;
   * le flow récent sur les compétences de la piste la renforce (jusqu'à +20 %).
   */
  function evaluer(carte, piste, themes, maintenant) {
    const lignes = piste.requis.map((id, i) => {
      const entree = CT.bibliotheque.trouver(id);
      return { id, entree, poids: i < 2 ? 2 : 1, ...niveauSur(carte, entree, maintenant) };
    });
    const somme = lignes.reduce((s, l) => s + l.poids, 0);
    const competences = lignes.reduce((s, l) => s + l.poids * l.niveau, 0) / somme;
    const domaines = new Set(lignes.map((l) => CT.idees.DOMAINE_BIBLIOTHEQUE[l.entree.domaine]));
    const theme = [...domaines].some((d) => themes.has(d)) ? 1 : 0;
    const flow = lignes.filter((l) => l.flow).length / lignes.length;
    const base = 0.85 * competences + 0.15 * theme;
    const pourcentage = Math.min(98, Math.round(100 * base * (1 + 0.2 * flow)));
    const vus = new Set();
    const hexagones = [];
    lignes.forEach((l) => l.appuis.sort((a, b) => b.valeur - a.valeur).forEach((a) => {
      if (vus.has(a.c.id)) return;
      vus.add(a.c.id);
      hexagones.push(a);
    }));
    hexagones.sort((a, b) => b.valeur - a.valeur || a.c.nom.localeCompare(b.c.nom, 'fr'));
    return {
      piste,
      pourcentage,
      hexagones: hexagones.slice(0, 6).map((a) => a.c.id),
      manquantes: lignes.filter((l) => l.niveau < SEUIL_MANQUANT).map((l) => l.entree),
      visee: (carte.pistesVisees || []).includes(piste.id)
    };
  }

  // 5 à 10 pistes, les plus proches d'abord, avec de la variété (au plus 5 par type tant que c'est possible).
  function proposer(carte, nombre, maintenant) {
    const themes = themesDe(carte);
    const tout = PISTES.map((p) => evaluer(carte, p, themes, maintenant))
      .sort((a, b) => b.pourcentage - a.pourcentage || a.piste.nom.localeCompare(b.piste.nom, 'fr'));
    const max = Math.min(MAX_PISTES, Math.max(MIN_PISTES, nombre || MAX_PISTES));
    const parType = {};
    const retenues = [];
    tout.forEach((e) => {
      if (retenues.length >= max || e.pourcentage < 10) return;
      parType[e.piste.type] = (parType[e.piste.type] || 0) + 1;
      if (parType[e.piste.type] <= MAX_PAR_TYPE) retenues.push(e);
    });
    tout.forEach((e) => { if (retenues.length < MIN_PISTES && !retenues.includes(e)) retenues.push(e); });
    return retenues.sort((a, b) => b.pourcentage - a.pourcentage || a.piste.nom.localeCompare(b.piste.nom, 'fr'));
  }

  // Une seule piste évaluée (pour l'écran et les tests).
  function evaluerId(carte, id, maintenant) {
    const p = trouver(id);
    return p ? evaluer(carte, p, themesDe(carte), maintenant) : null;
  }

  /*
   * « Viser cette piste » : chaque compétence manquante devient un territoire en conquête
   * (drapeau, classement par priorité). Un territoire à conquérir déjà sur la carte passe en frontière ;
   * sinon la compétence est ajoutée. Ce qui est déjà conquis, en conquête ou délégué n'est pas touché.
   */
  function viser(carte, id, maintenant) {
    const e = evaluerId(carte, id, maintenant);
    if (!e) return null;
    const resultat = { ajoutes: [], convertis: [], lies: [] };
    const marquer = (c) => {
      c.pistes = c.pistes || [];
      if (!c.pistes.includes(id)) c.pistes.push(id);
      resultat.lies.push(c.id);
    };
    e.manquantes.forEach((entree) => {
      const existante = carte.competences.find((c) => memeEntree(c, entree));
      if (existante) {
        if (existante.statut === 'a_conquerir') { CT.regles.changerStatut(carte, existante.id, 'frontiere'); resultat.convertis.push(existante.id); }
        if (existante.statut === 'frontiere') marquer(existante);
        return;
      }
      const c = CT.suggestions.accepter(carte, entree.id, { statut: 'frontiere' });
      if (c) { resultat.ajoutes.push(c.id); marquer(c); }
    });
    resultat.convertis.forEach((cid) => marquer(CT.regles.trouver(carte, cid)));
    carte.pistesVisees = carte.pistesVisees || [];
    if (!carte.pistesVisees.includes(id)) carte.pistesVisees.push(id);
    return resultat;
  }

  // Arrête de viser une piste : les territoires déjà en conquête restent, sans le lien avec la piste.
  function abandonner(carte, id) {
    if (!(carte.pistesVisees || []).includes(id)) return false;
    carte.pistesVisees = carte.pistesVisees.filter((x) => x !== id);
    carte.competences.forEach((c) => { if (c.pistes) c.pistes = c.pistes.filter((x) => x !== id); });
    return true;
  }

  // Pistes visées dont dépend un territoire, par nom.
  function pistesDe(c) {
    return (c.pistes || []).map(trouver).filter(Boolean);
  }

  CT.pistes = { TYPES, PISTES, MIN_PISTES, MAX_PISTES, trouver, proposer, evaluer: evaluerId, viser, abandonner, pistesDe, memeEntree, niveauSur, themesDe };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
