/*
 * Carte de démonstration : la carte de Pierre. Réinitialisable depuis les réglages.
 */
(function (CT) {
  'use strict';

  // Raccourci de déclaration : [id, nom, icône, statut, domaine, options]
  function c(id, nom, icone, statut, domaine, opts) {
    return Object.assign({ id, nom, icone, statut, domaine, distance: 'proche', voisines: [] }, opts || {});
  }

  function creer() {
    const brut = {
      talent: {
        nom: 'Créer des dynamiques humaines positives',
        filRouge: 'La mise en scène des échanges humains'
      },
      regions: [
        { id: 'accueil', nom: 'Accueil et ouverture', couleur: '#F2A65A', icone: 'heart-handshake', voisines: ['reveler', 'energie'] },
        { id: 'reveler', nom: 'Révéler les gens', couleur: '#5DB88A', icone: 'sprout', voisines: ['accueil', 'transmission'] },
        { id: 'transmission', nom: 'Transmission', couleur: '#9A8CDB', icone: 'graduation-cap', voisines: ['reveler', 'scene'] },
        { id: 'scene', nom: 'Scène et mise en scène', couleur: '#E5738E', icone: 'drama', voisines: ['transmission', 'energie'] },
        { id: 'energie', nom: 'Énergie et humour', couleur: '#F2C53D', icone: 'zap', voisines: ['scene', 'accueil'] }
      ],
      iles: [{ id: 'corps-rythme', nom: 'Corps et rythme' }],
      competences: [
        // Territoire natal
        c('accueillir', 'Accueillir', 'hand-heart', 'natale', 'relation', { regionId: 'accueil' }),
        c('ouvert', 'Être très ouvert', 'door-open', 'natale', 'relation', { regionId: 'accueil' }),
        c('sourire', 'Sourire', 'smile', 'natale', 'relation', { regionId: 'accueil' }),
        c('positif', 'Être positif', 'sun', 'natale', 'relation', { regionId: 'accueil' }),

        c('dynamiser', 'Dynamiser', 'zap', 'natale', 'animation', { regionId: 'energie' }),
        c('animer', 'Animer', 'party-popper', 'natale', 'animation', { regionId: 'energie' }),
        c('dynamique', 'Être dynamique', 'activity', 'natale', 'animation', { regionId: 'energie' }),
        c('faire-rire', 'Faire rire', 'laugh', 'natale', 'animation', { regionId: 'energie' }),

        c('mise-en-scene', 'Mise en scène', 'clapperboard', 'natale', 'scene', { regionId: 'scene' }),
        c('improviser', 'Improviser', 'sparkles', 'natale', 'scene', { regionId: 'scene' }),

        c('pedagogie', 'Pédagogie', 'graduation-cap', 'natale', 'pedagogie', { regionId: 'transmission' }),
        c('message', 'Construire un message impactant', 'megaphone', 'natale', 'communication', { regionId: 'transmission' }),

        c('ecouter', 'Écouter pour aider', 'ear', 'natale', 'relation', { regionId: 'reveler' }),
        c('coacher', 'Coacher', 'compass', 'natale', 'relation', { regionId: 'reveler' }),
        c('modeliser', 'Modéliser le talent de quelqu\'un', 'gem', 'natale', 'relation', { regionId: 'reveler' }),
        c('discussions', 'Discussions passionnantes', 'messages-square', 'natale', 'relation', { regionId: 'reveler' }),

        // Territoires conquis, proches du talent
        c('theatre-impro', 'Théâtre d\'improvisation', 'drama', 'conquise', 'scene', { regionId: 'scene', voisines: ['improviser'] }),
        c('chanter', 'Chanter', 'mic-vocal', 'conquise', 'scene', { regionId: 'scene' }),
        c('rimer', 'Rimer', 'feather', 'conquise', 'creation', { regionId: 'scene', voisines: ['chanter'] }),
        c('musical-impro', 'Musical improvisé', 'music', 'conquise', 'scene', { regionId: 'scene', voisines: ['theatre-impro', 'chanter'] }),
        c('troupe', 'Créer une troupe', 'users', 'conquise', 'scene', { regionId: 'scene', regionJonctionId: 'energie', voisines: ['theatre-impro'] }),
        c('communaute', 'Créer une communauté', 'users-round', 'conquise', 'relation', { regionId: 'accueil', regionJonctionId: 'energie' }),
        c('preparer-formation', 'Préparer une formation', 'clipboard-list', 'conquise', 'pedagogie', { regionId: 'transmission' }),
        c('prepa-pedago', 'Préparation pédagogique', 'notebook-pen', 'conquise', 'pedagogie', { regionId: 'transmission', voisines: ['preparer-formation'] }),
        c('noter', 'Noter des élèves', 'clipboard-check', 'conquise', 'pedagogie', { regionId: 'transmission' }),

        // Territoires conquis, éloignés du talent (provinces)
        c('anglais', 'Anglais', 'languages', 'conquise', 'langues', { regionId: 'accueil', distance: 'eloignee' }),
        c('espagnol', 'Espagnol', 'globe', 'conquise', 'langues', { regionId: 'accueil', distance: 'eloignee' }),
        c('excel', 'Excel', 'sheet', 'conquise', 'numerique', { regionId: 'transmission', distance: 'eloignee' }),
        c('powerpoint', 'PowerPoint', 'presentation', 'conquise', 'numerique', { regionId: 'transmission', distance: 'eloignee' }),
        c('ia-llm', 'IA (LLM)', 'bot', 'conquise', 'numerique', { regionId: 'transmission', distance: 'eloignee' }),
        c('ia-agentique', 'IA agentique', 'workflow', 'conquise', 'numerique', { regionId: 'transmission', distance: 'eloignee', voisines: ['ia-llm'] }),

        // Frontières
        c('vente', 'Vente', 'handshake', 'frontiere', 'business', { regionId: 'reveler', regionJonctionId: 'accueil', priorite: 1 }),
        c('reseaux', 'Réseaux sociaux / communauté en ligne', 'share-2', 'frontiere', 'communication', { regionId: 'energie', regionJonctionId: 'accueil', voisines: ['communaute'] }),
        c('calisthenie', 'Calisthénie', 'dumbbell', 'frontiere', 'corps', { regionId: 'energie', voisines: ['arts-martiaux'] }),
        c('arts-martiaux', 'Arts martiaux', 'swords', 'frontiere', 'corps', { regionId: 'energie', voisines: ['calisthenie'] }),

        // Territoires à conquérir (exemples, modifiables)
        c('facilitation', 'Facilitation d\'ateliers', 'lightbulb', 'a_conquerir', 'pedagogie', { regionId: 'transmission', regionJonctionId: 'reveler' }),
        c('storytelling', 'Storytelling', 'book-open', 'a_conquerir', 'creation', { regionId: 'scene', regionJonctionId: 'transmission' }),
        c('nocode', 'Automatisation no-code', 'cog', 'a_conquerir', 'numerique', { regionId: 'transmission', distance: 'eloignee', voisines: ['ia-agentique'] }),
        c('negociation', 'Négociation', 'scale', 'a_conquerir', 'business', { regionId: 'reveler', voisines: ['vente'] }),
        c('podcast', 'Podcast', 'podcast', 'a_conquerir', 'communication', { regionId: 'energie', voisines: ['reseaux'] }),

        // Île de flow
        c('jonglage', 'Jonglage (bolas)', 'orbit', 'ile', 'corps', { ileId: 'corps-rythme' }),
        c('danse', 'Danse', 'footprints', 'ile', 'corps', { ileId: 'corps-rythme' }),

        // Zone à déléguer
        c('edition-video', 'Édition vidéo', 'video', 'a_deleguer', 'numerique'),
        c('comptabilite', 'Comptabilité', 'calculator', 'a_deleguer', 'organisation'),
        c('administratif', 'Administratif', 'folder-open', 'a_deleguer', 'organisation'),
        c('redaction', 'Rédaction', 'pen-line', 'a_deleguer', 'communication')
      ],
      momentsDeFlow: [],
      objectifs: [
        { id: 'obj-vente', competenceId: 'vente', description: 'Vente : 2 sessions par semaine', frequence: { fois: 2, periode: 'semaine' }, progression: [] }
      ],
      preferences: { brouillardDeGuerre: false, seuilConquete: 10 }
    };
    return CT.schema.normaliser(brut);
  }

  CT.demo = { creer };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
