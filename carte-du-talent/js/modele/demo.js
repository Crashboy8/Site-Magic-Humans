/*
 * Carte de démonstration : la carte de Pierre. Réinitialisable depuis les réglages.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  // Raccourci de déclaration : [id, nom, icône, statut, domaine, options]
  function c(id, nom, icone, statut, domaine, opts) {
    return Object.assign({ id, nom, icone, statut, domaine, distance: 'proche', voisines: [] }, opts || {});
  }

  function creer() {
    const brut = {
      talent: {
        nom: T('Créer des dynamiques humaines positives'),
        filRouge: T('La mise en scène des échanges humains')
      },
      regions: [
        { id: 'accueil', nom: T('Accueil et ouverture'), couleur: '#F2A65A', icone: 'heart-handshake', voisines: ['reveler', 'energie'] },
        { id: 'reveler', nom: T('Révéler les gens'), couleur: '#5DB88A', icone: 'sprout', voisines: ['accueil', 'transmission'] },
        { id: 'transmission', nom: T('Transmission'), couleur: '#9A8CDB', icone: 'graduation-cap', voisines: ['reveler', 'scene'] },
        { id: 'scene', nom: T('Scène et mise en scène'), couleur: '#E5738E', icone: 'drama', voisines: ['transmission', 'energie'] },
        { id: 'energie', nom: T('Énergie et humour'), couleur: '#F2C53D', icone: 'zap', voisines: ['scene', 'accueil'] }
      ],
      iles: [{ id: 'corps-rythme', nom: T('Corps et rythme') }],
      competences: [
        // Territoire natal
        c('accueillir', T('Accueillir'), 'hand-heart', 'natale', 'relation', { regionId: 'accueil' }),
        c('ouvert', T('Être très ouvert'), 'door-open', 'natale', 'relation', { regionId: 'accueil' }),
        c('sourire', T('Sourire'), 'smile', 'natale', 'relation', { regionId: 'accueil' }),
        c('positif', T('Être positif'), 'sun', 'natale', 'relation', { regionId: 'accueil' }),

        c('dynamiser', T('Dynamiser'), 'zap', 'natale', 'animation', { regionId: 'energie' }),
        c('animer', T('Animer'), 'party-popper', 'natale', 'animation', { regionId: 'energie' }),
        c('dynamique', T('Être dynamique'), 'activity', 'natale', 'animation', { regionId: 'energie' }),
        c('faire-rire', T('Faire rire'), 'laugh', 'natale', 'animation', { regionId: 'energie' }),

        c('mise-en-scene', T('Mise en scène'), 'clapperboard', 'natale', 'scene', { regionId: 'scene' }),
        c('improviser', T('Improviser'), 'sparkles', 'natale', 'scene', { regionId: 'scene' }),

        c('pedagogie', T('Pédagogie'), 'graduation-cap', 'natale', 'pedagogie', { regionId: 'transmission' }),
        c('message', T('Construire un message impactant'), 'megaphone', 'natale', 'communication', { regionId: 'transmission' }),

        c('ecouter', T('Écouter pour aider'), 'ear', 'natale', 'relation', { regionId: 'reveler' }),
        c('coacher', T('Coacher'), 'compass', 'natale', 'relation', { regionId: 'reveler' }),
        c('modeliser', T('Modéliser le talent de quelqu\'un'), 'gem', 'natale', 'relation', { regionId: 'reveler' }),
        c('discussions', T('Discussions passionnantes'), 'messages-square', 'natale', 'relation', { regionId: 'reveler' }),

        // Territoires conquis, proches du talent
        c('theatre-impro', T('Théâtre d\'improvisation'), 'drama', 'conquise', 'scene', { regionId: 'scene', voisines: ['improviser'] }),
        c('chanter', T('Chanter'), 'mic-vocal', 'conquise', 'scene', { regionId: 'scene' }),
        c('rimer', T('Rimer'), 'feather', 'conquise', 'creation', { regionId: 'scene', voisines: ['chanter'] }),
        c('musical-impro', T('Musical improvisé'), 'music', 'conquise', 'scene', { regionId: 'scene', voisines: ['theatre-impro', 'chanter'] }),
        c('troupe', T('Créer une troupe'), 'users', 'conquise', 'scene', { regionId: 'scene', regionJonctionId: 'energie', voisines: ['theatre-impro'] }),
        c('communaute', T('Créer une communauté'), 'users-round', 'conquise', 'relation', { regionId: 'accueil', regionJonctionId: 'energie' }),
        c('preparer-formation', T('Préparer une formation'), 'clipboard-list', 'conquise', 'pedagogie', { regionId: 'transmission' }),
        c('prepa-pedago', T('Préparation pédagogique'), 'notebook-pen', 'conquise', 'pedagogie', { regionId: 'transmission', voisines: ['preparer-formation'] }),
        c('noter', T('Noter des élèves'), 'clipboard-check', 'conquise', 'pedagogie', { regionId: 'transmission' }),

        // Territoires conquis, éloignés du talent (provinces)
        c('anglais', T('Anglais'), 'languages', 'conquise', 'langues', { regionId: 'accueil', distance: 'eloignee' }),
        c('espagnol', T('Espagnol'), 'globe', 'conquise', 'langues', { regionId: 'accueil', distance: 'eloignee' }),
        c('excel', T('Excel'), 'sheet', 'conquise', 'numerique', { regionId: 'transmission', distance: 'eloignee' }),
        c('powerpoint', T('PowerPoint'), 'presentation', 'conquise', 'numerique', { regionId: 'transmission', distance: 'eloignee' }),
        c('ia-llm', T('IA (LLM)'), 'bot', 'conquise', 'numerique', { regionId: 'transmission', distance: 'eloignee' }),
        c('ia-agentique', T('IA agentique'), 'workflow', 'conquise', 'numerique', { regionId: 'transmission', distance: 'eloignee', voisines: ['ia-llm'] }),

        // Frontières
        c('vente', T('Vente'), 'handshake', 'frontiere', 'business', { regionId: 'reveler', regionJonctionId: 'accueil', priorite: 1 }),
        c('reseaux', T('Réseaux sociaux / communauté en ligne'), 'share-2', 'frontiere', 'communication', { regionId: 'energie', regionJonctionId: 'accueil', voisines: ['communaute'] }),
        c('calisthenie', T('Calisthénie'), 'dumbbell', 'frontiere', 'corps', { regionId: 'energie', voisines: ['arts-martiaux'] }),
        c('arts-martiaux', T('Arts martiaux'), 'swords', 'frontiere', 'corps', { regionId: 'energie', voisines: ['calisthenie'] }),

        // Territoires à conquérir (exemples, modifiables)
        c('facilitation', T('Facilitation d\'ateliers'), 'lightbulb', 'a_conquerir', 'pedagogie', { regionId: 'transmission', regionJonctionId: 'reveler' }),
        c('storytelling', T('Storytelling'), 'book-open', 'a_conquerir', 'creation', { regionId: 'scene', regionJonctionId: 'transmission' }),
        c('nocode', T('Automatisation no-code'), 'cog', 'a_conquerir', 'numerique', { regionId: 'transmission', distance: 'eloignee', voisines: ['ia-agentique'] }),
        c('negociation', T('Négociation'), 'scale', 'a_conquerir', 'business', { regionId: 'reveler', voisines: ['vente'] }),
        c('podcast', T('Podcast'), 'podcast', 'a_conquerir', 'communication', { regionId: 'energie', voisines: ['reseaux'] }),

        // Île de flow
        c('jonglage', T('Jonglage (bolas)'), 'orbit', 'ile', 'corps', { ileId: 'corps-rythme' }),
        c('danse', T('Danse'), 'footprints', 'ile', 'corps', { ileId: 'corps-rythme' }),

        // Zone à déléguer
        c('edition-video', T('Édition vidéo'), 'video', 'a_deleguer', 'numerique'),
        c('comptabilite', T('Comptabilité'), 'calculator', 'a_deleguer', 'organisation'),
        c('administratif', T('Administratif'), 'folder-open', 'a_deleguer', 'organisation'),
        c('redaction', T('Rédaction'), 'pen-line', 'a_deleguer', 'communication')
      ],
      momentsDeFlow: [],
      objectifs: [
        { id: 'obj-vente', competenceId: 'vente', description: T('Vente : 2 sessions par semaine'), frequence: { fois: 2, periode: 'semaine' }, progression: [] }
      ],
      preferences: { brouillardDeGuerre: false, seuilConquete: 10 }
    };
    return CT.schema.normaliser(brut);
  }

  CT.demo = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
