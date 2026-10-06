# Carte du Talent (prototype)

Visualiser son talent comme un territoire en hexagones : un cœur (le talent), des régions (les sous-talents), des territoires conquis, des frontières que l'on repousse, des îles où l'on se ressource et une zone à déléguer. L'application aide à repérer ce qui met dans le flow et à voir ses compétences s'étendre.

Prototype autonome : HTML, CSS et JavaScript vanilla, sans build ni serveur. Il s'ouvre aussi en double-cliquant sur `index.html`. La page est en `noindex` (balise meta et en-tête `X-Robots-Tag` dans `vercel.json`) et absente du sitemap.

## Note de reprise (à jour au 6 octobre 2026)

- **En ligne** : https://www.magichumans.com/carte-du-talent/ (noindex), fusionné via la PR #101. La Boussole y renvoie par le bouton « Explorer ma carte du talent » (PR #103).
- **Chantiers de la nuit** (une PR par chantier, empilées dans cet ordre, aucune fusionnée) :
  1. **Carte créée depuis la Boussole** (branche `claude/zealous-mayer-oibrrc`, PR #104) : fait.
  2. **Version anglaise de la carte, avec sélecteur de langue** (branche `claude/zm-carte-en`, base : chantier 1, PR #105) : fait.
  3. **Lien « Revenir à ma Boussole »** (branche `claude/zm-retour`, base : chantier 2, PR #107) : fait.
  4. **Accessibilité et performance de la Boussole** (branche `claude/zm-a11y`, base : chantier 3, PR #108) : fait. Audit axe-core + focus clavier + poids des pages ; piste restante : le client Supabase (70 Ko compressés) est chargé sur la page d'exemple publique.
  5. **Relecture des textes français de la Boussole** (branche `claude/zm-relecture`, base : chantier 4) : fait, PR ouverte.
- **Prévisualisation Vercel** : `https://<projet>-git-<branche>-magic-humans.vercel.app` (projets `wwwmagichumanscom` pour la carte, `boussole-decision` pour la Boussole, sous `/boussole-decision/`).
- **Pistes pour la suite** (non commencées) : renommer une compétence ou une région depuis la carte ; choisir les régions voisines après la création ; transformer les moments de flow saisis pendant la création en moments datés ; tests sur un vrai téléphone (glisser-déposer au doigt, fluidité des animations).
- **Méthode suivie** : à chaque étape, tests automatiques, vérification dans un navigateur automatisé (ordinateur et téléphone), captures, puis push. Ton bienveillant partout, jamais culpabilisant. Les positions et la logique de placement ne bougent pas sans raison.

## Ce que fait l'application

1. **La carte** : capitale au centre, régions placées selon leurs voisines, jonctions entre deux régions, provinces éloignées par domaine (numérique, langues…), îles séparées par l'eau, zone à déléguer à l'écart. Relief, mer, plages, légende.
2. **La navigation** : zoom (molette, pincement, boutons), déplacement, noms adaptés au zoom. Appui long sur un hexagone pour le déplacer (échange si la case est occupée). Panneau latéral (feuille en bas sur téléphone) avec statut, moments de flow, objectif et changements de statut, de région, de distance au talent. Les positions sont mémorisées ; « Réorganiser » relance le placement en gardant les déplacements manuels.
3. **L'éclat et les animations** : un hexagone s'illumine selon ses moments de flow des 30 derniers jours (4 niveaux). Animations courtes à l'enregistrement d'un moment et à la conquête, sur un calque à part : aucune tuile ne bouge. Brouillard de guerre en option.
4. **La saisie express d'un moment de flow** : bouton toujours visible, recherche sans accents, compétences récentes, trois curseurs (intensité, défi, maîtrise), découpage flow / à déléguer, note et date facultatives.
5. **Progrès et objectifs** : flow par semaine, compétences et régions qui mènent au flow, grille défi / maîtrise, frontières en cours. Au seuil (10 moments par défaut), l'appli propose de passer une frontière en conquise ; la personne confirme (« Pas encore » reporte de 5 moments). Objectifs liés aux frontières (ex. : Vente, 2 sessions par semaine) ; les moments de flow comptent comme sessions.
6. **Bibliothèque et suggestions** : 156 compétences par domaine (14 domaines). Six suggestions en hexagones fantômes, à l'endroit exact où elles se poseraient ; accepter ne bouge rien, refuser est définitif (rétablissable dans les Réglages). Idée libre ou choix dans toute la bibliothèque.
7. **Création guidée** : au premier lancement, accueil puis 6 questions (talent et fil rouge, sous-talents à réordonner avec des flèches, moments de flow, compétences apprises proches ou éloignées, envies, ce qui vide), filtre « Est-ce que ça élargit ton domaine d'action ? », regroupement par glisser-déposer ou « toucher puis Poser ici ». Brouillon enregistré à chaque saisie.

8bis. **Retours de test de la création** : au moins 30 idées par question (sous-talents, flow, appris, envies), par grands domaines avec « Voir plus » ; trois territoires à conquérir par région dès la création (brouillard de guerre, choisis par proximité de domaine) ; regroupement final pré-rangé avec la raison (ce qui ne colle nulle part devient une île) ; import du quiz (`/quiz/` → bouton « Créer ma carte du talent », ancre `#q=`, même encodage que vers la Boussole).

8. **Arrivée depuis la Boussole de décision** : le bouton « Explorer ma carte du talent » porte le Talent Unique du profil dans l'ancre du lien (`#b=…`, JSON en base64url, jamais envoyé au serveur ; les critères ne sont pas transmis). Un écran de choix s'ouvre : « Commencer avec ma Boussole », « Reprendre ma création en cours » s'il y en a une, « Garder ma carte » si une carte existe. Rien n'est remplacé avant la confirmation finale. La création s'ouvre pré-remplie (talent = mécanisme, fil rouge = contexte déclencheur et super bénéfice s'ils tiennent en 160 caractères) ; un encart « Depuis ta Boussole » propose les contextes de réussite (question 3) et d'échec (question 6, avec l'Anti-Contexte en rappel), à ajouter un par un. Rien n'est coupé automatiquement : une phrase trop longue va dans le champ pour être raccourcie.

9. **Français et anglais** : sélecteur FR / EN dans l'en-tête et dans les Réglages. Les textes sont écrits en français dans le code et passent par `T('…')` (`js/i18n.js`) ; les traductions sont dans `js/langues/en.js`, indexées par le texte français. La langue est choisie au chargement : lien de la Boussole (`#lang=en`), sinon choix enregistré, sinon langue du navigateur. En changer recharge la page (la carte et le brouillon sont gardés). La démo et la bibliothèque sont traduites ; le contenu saisi par la personne ne l'est jamais.

10. **Retour vers la Boussole** : le lien de la Boussole porte aussi l'adresse de la page d'où l'on vient (`&retour=…`). La carte affiche alors, dans l'en-tête, un lien discret « Revenir à ma Boussole » (gardé dans ce navigateur). Seules les adresses de la Boussole sont acceptées (site Magic Humans ou preview Vercel du projet, chemin `/boussole-decision/`).

11. **Mes pistes** (orientation pro) : le bouton « Mes pistes » propose 5 à 10 métiers, activités ou offres indépendantes (base locale de 83 pistes, `js/modele/pistes.js`, sans IA ni serveur). Chaque piste affiche un % de correspondance (compétences de la bibliothèque conquises, en conquête ou en île, voisines, thème du talent et des régions, bonus de flow récent), les hexagones qui la justifient et les compétences manquantes. « Viser cette piste » passe les compétences manquantes en territoires en conquête (drapeau, rang de priorité) ; l'ordre se modifie dans « Mes priorités » (flèches) et est enregistré. « Ne plus viser » garde les territoires.

12. **Toutes les compétences** : bouton rond de la carte (aussi dans le panneau du brouillard et dans les Réglages) : toute la bibliothèque, groupée par domaine en nids d'hexagones. N'importe quel hexagone peut être conquis (en conquête, à conquérir, déjà conquis), pas seulement les 3 proposés. Le continent qui grandit laisse désormais leurs deux cases d'eau aux îles et zones déjà posées.

13. **Zone de ressourcement** : nouveau statut `ressource`, posé à l'écart (autre coin que la zone à déléguer). La création (question 6) a un bloc « Ce qui te recharge », pré-rempli avec les idées de recharge du quiz (`ressources` dans l'ancre `#q=`).

14. **Importer mon résultat QCM (PDF)** : accueil de la création et Réglages. Le PDF du quiz est une image (html2pdf) : son texte n'est pas lisible. Le quiz y écrit donc les mêmes données que `#q=` dans le mot-clé du PDF (`CTQ1:…`, métadonnées) ; la carte les relit dans le navigateur (`CT.boussole.lirePdf`, aussi dans un flux compressé) et ouvre la création pré-remplie. Les PDF générés avant ce changement n'ont pas ces données : il faut les télécharger à nouveau.

**Réglages** : affichage (brouillard de guerre), progrès (seuil de conquête), suggestions écartées, sauvegarde (exporter / importer en JSON), repartir d'une autre carte (création guidée ou carte de démonstration, toujours après confirmation).

**Accessibilité** : contrastes du texte au-dessus de 4,5:1 (boutons principaux, petits titres, liens), focus clavier visible partout (contour bleu canard), hexagones accessibles au clavier (Tab, Entrée, Échap, flèches), mouvements réduits si le système le demande.

## Structure

```
carte-du-talent/
├── index.html
├── js/i18n.js          langue (fr / en) et fonction T()
├── js/langues/en.js    traductions anglaises
├── css/
│   ├── carte.css       jetons de couleur, rendu de la carte, effets
│   ├── ui.css          en-tête, légende, panneau, boutons, mobile
│   ├── flow.css        saisie express, réglages
│   ├── progres.css     écran Progrès
│   └── creation.css    création guidée
├── js/
│   ├── geo/hex.js              grille hexagonale (coordonnées axiales)
│   ├── geo/placement.js        placement géographique automatique (fonction pure)
│   ├── modele/schema.js        modèle de données, normalisation, version
│   ├── modele/stockage.js      localStorage, export / import JSON, brouillon de création
│   ├── modele/demo.js          carte de démonstration
│   ├── modele/regles.js        règles métier (statuts, déplacements, flow, objectifs)
│   ├── modele/stats.js         statistiques de progrès (calculs purs)
│   ├── modele/bibliotheque.js  156 compétences (domaine, icône, liens vers les voisines)
│   ├── modele/idees.js         idées par domaine (questions 2 à 5), domaines d'un texte
│   ├── modele/suggestions.js   suggestions de territoires à conquérir
│   ├── modele/creation.js      brouillon de la création guidée et génération de la carte
│   ├── modele/boussole.js      lecture du lien de la Boussole (#b=…) et brouillon pré-rempli
│   ├── vues/                   rendu SVG, navigation, panneau, saisie, progrès, réglages, création, effets
│   └── app.js                  point d'entrée
└── tests/placement.test.js
```

Tous les scripts s'attachent à l'espace de noms global `CarteTalent`. Le modèle, le placement et les statistiques n'utilisent pas le DOM : ils pourront servir de module à une future application de gamification.

## Tests

```bash
node carte-du-talent/tests/placement.test.js && node carte-du-talent/tests/orientation.test.js
```

Ajouter `--carte` à la première commande affiche aussi la carte en texte.

Une quarantaine de tests : placement (régions d'un seul tenant, pas de trou, jonctions, provinces, îles), stabilité des positions, moments de flow, éclat et brouillard, progrès et objectifs, suggestions, création guidée, arrivée depuis la Boussole, traductions complètes.

## Mise en ligne

Le site est déployé par Vercel depuis la branche principale. Une fois la branche fusionnée, la carte est servie à `https://www.magichumans.com/carte-du-talent/`, toujours en `noindex`. Aucune autre page du site n'est modifiée ; seul `vercel.json` reçoit l'en-tête `X-Robots-Tag` pour ce dossier.
