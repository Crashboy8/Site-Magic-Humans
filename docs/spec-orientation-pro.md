# Carte du Talent – Cahier des charges Orientation pro v1

Lot « orientation pro » de la Carte du Talent (`carte-du-talent/`). Statique, vanilla JS, FR/EN.
Toutes les fonctionnalités ci-dessous sont validées par Pierre. Ce document suffit pour coder : les données, le modèle, les traductions et les tests sont déjà écrits et testés (fichiers prêts dans `docs/orientation-pro/`). Il reste surtout à câbler les écrans.

## 0. En bref

| | Fonction | Où |
|---|---|---|
| A | « Je l'ai déjà » sous chaque compétence manquante d'une piste : ajout en territoire conquis, % recalculé | Mes pistes |
| B | Terres à découvrir : toute la bibliothèque absente de la carte, en couronne autour d'elle, par domaine. Bibliothèque étendue à 301 compétences | Carte |
| C | Fiche « Comment m'y mettre ? » : temps estimé, facile / accessible / exigeant (calculé sur les compétences voisines), 3 premières actions | Mes pistes, panneau |
| D | Bilan d'acquis : 30 compétences courantes à cocher, en 6 familles | Nouvel écran |
| E | Pistes enrichies : statut possible, revenu indicatif (estimation, France), exemple de profil | Mes pistes |
| F | « Ma prochaine compétence » : celle qui fait avancer le plus de pistes pour le moins d'effort | Mes pistes |
| G | Plan sur 30 jours : 4 semaines × 3 actions à cocher, enregistré, drapeau qui monte sur la carte | Mes pistes, carte |
| H | « Ton talent ici » : lien de chaque piste avec le Talent Unique et un moment de flow | Mes pistes |
| I | Synthèse d'une page imprimable (carte, 3 pistes, prochaine compétence) et « En parler avec Pierre » (Calendly existant) | Nouvel écran |

Hors périmètre (pour plus tard) : le simulateur financier.

Découpage conseillé en 2 PR (détail au §13) :
1. PR 1 « socle orientation » : données, modèle, bibliothèque étendue, traductions, A, C, D, E, H.
2. PR 2 « carte et accompagnement » : B (horizon), F, G (plan + drapeau), I (synthèse + appel).

## 1. Livraison (le moins de tokens possible)

Ce cahier des charges et ses fichiers prêts arrivent dans le dépôt par une PR « docs » (préparée par l'agent, fusionnée par Pierre) :

```
docs/spec-orientation-pro.md                 ← ce document
docs/orientation-pro/bibliotheque-plus.js    → carte-du-talent/js/modele/bibliotheque-plus.js
docs/orientation-pro/orientation-donnees.js  → carte-du-talent/js/modele/orientation-donnees.js
docs/orientation-pro/orientation.js          → carte-du-talent/js/modele/orientation.js
docs/orientation-pro/horizon.js              → carte-du-talent/js/geo/horizon.js
docs/orientation-pro/en-orientation.js       → carte-du-talent/js/langues/en-orientation.js
docs/orientation-pro/orientation.test.js     → carte-du-talent/tests/orientation.test.js
```

Claude Code commence par `git mv` de ces 6 fichiers (aucun token de sortie pour les réécrire), puis applique les modifications des §4 à §8. Ne pas réécrire ni « améliorer » les fichiers prêts : ils sont testés (24 tests verts dans `orientation.test.js`, et `placement.test.js` reste entièrement vert avec les changements du §4.5).

Solution de repli si la PR docs n'est pas possible : Pierre colle ce document dans la session et dépose les 6 fichiers dans `docs/orientation-pro/` à la main (glisser-déposer sur GitHub), puis la suite est identique.

## 2. Règles à respecter

- Textes de l'interface en français, tutoiement, voix naturelle. Jamais de tiret long (cadratin) : virgules, points, parenthèses. Pas de bleu marine foncé (réutiliser les variables de `css/carte.css` : `--encre`, `--encre-douce`, `--accent*`, `--or`, `--papier`, `--focus`).
- Chaque texte visible passe par `T('…')` ou `Tn(n, sing, plur, vars)`, avec le texte français **exact** du §9. Toutes les traductions anglaises existent déjà dans `js/langues/en-orientation.js` : si un texte change d'une virgule, le test des traductions de `placement.test.js` échoue. Ne pas ajouter de texte qui n'est pas dans le §9 ; s'il en faut un, l'ajouter aussi dans `en-orientation.js`.
- Les modules `js/modele/*` et `js/geo/*` n'accèdent jamais au DOM. Les vues produisent du HTML en chaîne (`O.echapper` sur toute donnée), actions par `data-action` / `data-valeur`, icônes Lucide `<i data-lucide="…">` puis `O.rafraichirIcones(racine)`.
- Toute modification du modèle passe par `appliquer()` dans `app.js` (recalculer + enregistrer + rendre), **une seule fois par geste** (le bilan ajoute jusqu'à 35 compétences : un seul `appliquer()` à la fin, voir §7).
- La langue est fixée au chargement : appeler `T()` au chargement d'un module est permis (c'est déjà le cas dans `orientation.js`).
- Icônes utilisées (toutes vérifiées dans lucide@1.52.0) : `check`, `clock`, `gauge`, `footprints`, `rocket`, `shuffle`, `flag`, `target`, `list-checks`, `file-text`, `printer`, `calendar-check`, `briefcase`, `wallet`, `sparkles`, `telescope`, `compass`, `x`.

## 3. Ce que fournissent les fichiers prêts

### 3.1 `js/modele/bibliotheque-plus.js`
117 compétences de plus (301 au total), même format `e(id, nom, icone, domaine, liens, alias)`, ajoutées par `CT.bibliotheque.ENTREES.push(...)`. Ajoute aussi l'alias « preparer un cours » à `conception-cours`. Nouvelles compétences demandées par Pierre, entre autres : « Animer une formation » (`animer-formation`), « Tableur » (alias excel), « Ennéagramme ». Doit être chargé juste après `bibliotheque.js`.

### 3.2 `js/modele/orientation-donnees.js` → `CT.orientationDonnees`
- `DUREES` : `court` (≈ 15 h), `moyen` (≈ 40 h), `long` (≈ 120 h), `tres_long` (300 h et plus), avec `heures`, `libelle`, `penalite` (0 à 3), `effort` (1, 2, 3, 5).
- `DUREE_DOMAINE` (défaut par domaine) et `DUREE` (exceptions par id).
- `ACTIONS_DOMAINE` (3 actions par domaine, `{nom}` remplacé par le nom de la compétence) et `ACTIONS` (3 actions sur mesure pour 28 compétences).
- `PLAN_SEMAINES` : 4 semaines `{ titre, actions }` ; semaine 1 `actions: null` = reprend les 3 premières actions de la fiche.
- `BILAN` : 6 familles × 5 ids = 30 compétences :
  - Transmettre : animer-groupe, prise-parole, animer-formation, conception-cours, vulgarisation
  - Être en relation : ecoute-active, accompagnement-individuel, feedback, conflits, relation-client
  - Communiquer : redaction, ecrire-web, reseaux, storytelling, anglais
  - Vendre et entreprendre : vente, negociation, prospection, creation-offre, networking
  - Organiser : gestion-projet, budget, evenements, planification, coordination-equipe
  - Numérique et analyse : tableur, design-graphique, ia-generative, synthese, resolution-problemes
- `STATUTS_PISTE` : `salarie`, `independant`, `mixte`, `a_cote`.
- `NOTES_REVENU` (par type de piste) et `SOURCE_REVENU` (« Ordre de grandeur indicatif pour la France, estimé par Magic Humans à partir de repères publics (APEC, France Travail, Insee). À vérifier… »).
- `PISTES_INFOS` : pour les 83 pistes, `[statut, min, max, exemple]` (€ net par mois ; `min = null` = bénévole ; pour une piste de type `activite`, revenu en complément).
- `APPEL_DECOUVERTE` : `https://calendly.com/pierre-j-sarazin?utm_source=site&utm_medium=carte-du-talent&utm_campaign=orientation-pro`.

### 3.3 `js/modele/orientation.js` → `CT.orientation`
| Fonction | Rôle |
|---|---|
| `fiche(carte, entreeId)` | `{ entree, duree: {cle, heures, libelle, effort…}, facilite: {cle, libelle, raison, appuis}, actions: [3 textes] }` ou null |
| `facilite(carte, entree)` | points = 2 × min(3, appuis) + min(3, compétences du même domaine acquises) − pénalité de durée. Appui = compétence liée (liens dans les deux sens) déjà acquise (1) ou en conquête (0,5). `facile` ≥ 4, `accessible` 1 à 3, `exigeant` ≤ 0 |
| `pistesPour(carte, entreeId, n)` | pistes qui demandent la compétence : `[{ piste, pourcentage, gain, visee }]`, plus gros gain d'abord |
| `marquerAcquise(carte, entreeId, maintenant)` | A. Absente : ajoutée en `conquise` via `suggestions.accepter`. À conquérir / frontière : passe `conquise` (et finit le plan s'il portait dessus). Déjà acquise : `{deja: true}`. Déléguée / ressourcement : `null` |
| `bilan(carte)` | D. `[{ titre, icone, items: [{ entree, acquis, horsJeu }] }]` |
| `appliquerBilan(carte, ids, libres, maintenant)` | D. Ajoute tout en une fois, libres = 5 textes au plus (60 caractères), renvoie le nombre d'ajouts, écrit `carte.bilan` |
| `reporterBilan(carte, maintenant)`, `doitProposerBilan(carte)` | « Plus tard » ; proposé automatiquement tant que `carte.bilan` est null |
| `prochaine(carte, ecartees, maintenant)` | F. `{ entree, fiche, score, gainTotal, pistes }` ou null. score = Σ gain (× 1,5 sur une piste visée) / (effort × {facile 0,7, accessible 1, exigeant 1,4}). `ecartees` = ids déjà montrés (« Une autre idée ») |
| `demarrerPlan(carte, entreeId, maintenant)` | G. Compétence en frontière, priorité n°1, écrit `carte.plan`. `null` si un plan non fini existe |
| `cocherAction(carte, index 0..11, maintenant)` | G. Coche / décoche. `{ faites, total, vientDeFinir }`. À 12/12 : `plan.fini`, sans conquête automatique |
| `arreterPlan(carte)`, `etatPlan(carte, maintenant)`, `drapeauPlan(carte, competenceId)` | G. État lisible (jours, semaine 1 à 4, `depasse`, `fini`, semaines avec actions et coches) ; drapeau `{faites, total}` |
| `lienTalent(carte, evaluation)` | H. `{ niveau: fort/moyen/faible, libelle, talent, sousTalents (≤ 2), moment, conseil }` |
| `infosPiste(piste)` | E. `{ statut, statutLibelle, revenu, min, max, note, exemple }` (montants au format fr-FR ou en-GB) |
| `urlAppel(contenu)` | I. URL Calendly + `&utm_content=pistes` ou `synthese` |
| `troisPistes(carte)`, `synthese(carte, maintenant)` | I. Pistes visées d'abord, puis meilleures proposées ; `{ talent, filRouge, date, pistes, plan, prochaine, source }` |

### 3.4 `js/geo/horizon.js` → `CT.horizon`
`disposer(carte, placement, { max = 400 })` → `{ tuiles: [{ id: 'hor:<entreeId>', entreeId, domaine, q, r, anneau }], etiquettes: [{ domaine, nom, q, r }], debut }`. Pur et déterministe. Prend `CT.suggestions.disponibles(carte)` (ni sur la carte, ni refusées), commence 3 cases au-delà de la terre la plus éloignée (`ECART = 3`), un secteur contigu par domaine, orienté du côté où ce domaine existe déjà sur la carte, rempli couronne par couronne, les compétences les plus proches du profil au plus près. Démo : 282 tuiles sur 5 couronnes, 2 à 34 ms. Les tuiles de l'horizon ne font **jamais** partie du placement.

### 3.5 `js/langues/en-orientation.js`
Complète `CT.EN` (439 entrées) sans écraser l'existant. Chargé juste après `en.js`.

## 4. Modifications des fichiers existants (exactes)

### 4.1 `js/modele/bibliotheque.js` (dernière ligne)
```js
CT.bibliotheque = { ENTREES, entree: e, trouver: (id) => ENTREES.find((x) => x.id === id) || null };
```

### 4.2 `js/modele/pistes.js` (export)
```js
CT.pistes = { TYPES, PISTES, MIN_PISTES, MAX_PISTES, trouver, proposer, evaluer: evaluerId, viser, abandonner, pistesDe, memeEntree, niveauSur, themesDe };
```

### 4.3 `js/modele/schema.js`
```js
const PREFERENCES_DEFAUT = { brouillardDeGuerre: false, seuilConquete: 10, horizon: true };
```
Dans `creerCarteVide()`, après `pistesVisees: [],` :
```js
      bilan: null,
      plan: null,
```
Après `function liste(v)` :
```js
  // Date ISO valide, ou null.
  function date(v) {
    return typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : null;
  }
```
Dans `normaliser`, remplacer le bloc `carte.preferences = {…}` et ajouter ce qui suit avant `return carte;` :
```js
    carte.preferences = {
      brouillardDeGuerre: Boolean(prefs.brouillardDeGuerre),
      seuilConquete: entre(prefs.seuilConquete, 1, 100, PREFERENCES_DEFAUT.seuilConquete),
      horizon: prefs.horizon !== false
    };

    // Bilan d'acquis : fait (date) ou reporté (date) ; null tant qu'il n'a jamais été proposé.
    const b = src.bilan;
    carte.bilan = b && typeof b === 'object' && (date(b.fait) || date(b.reporte))
      ? { fait: date(b.fait), reporte: date(b.reporte), n: entre(b.n, 0, 999, 0) } : null;

    // Plan sur 30 jours : 12 actions (date ou null), sur une compétence encore présente.
    const p = src.plan;
    carte.plan = p && typeof p === 'object' && idsComp.has(p.competenceId) && p.bibliothequeId && date(p.debut)
      ? {
        id: String(p.id || nouvelId('plan')),
        bibliothequeId: String(p.bibliothequeId),
        competenceId: String(p.competenceId),
        debut: date(p.debut),
        faites: Array.from({ length: 12 }, (x, i) => date(liste(p.faites)[i])),
        fini: date(p.fini)
      } : null;
```
(`idsComp` existe déjà dans `normaliser` : l'ensemble des ids de compétences gardées.)

### 4.4 `index.html`
Scripts, dans cet ordre (nouveaux marqués +) :
```html
  <script src="js/langues/en.js"></script>
+ <script src="js/langues/en-orientation.js"></script>
  <script src="js/i18n.js"></script>
  … (inchangé jusqu'à)
  <script src="js/modele/bibliotheque.js"></script>
+ <script src="js/modele/bibliotheque-plus.js"></script>
  <script src="js/modele/idees.js"></script>
  <script src="js/modele/suggestions.js"></script>
  <script src="js/modele/pistes.js"></script>
  <script src="js/modele/creation.js"></script>
  <script src="js/modele/boussole.js"></script>
+ <script src="js/modele/orientation-donnees.js"></script>
+ <script src="js/modele/orientation.js"></script>
+ <script src="js/geo/horizon.js"></script>
  <script src="js/vues/outils.js"></script>
  … (inchangé jusqu'à)
  <script src="js/vues/pistes.js"></script>
+ <script src="js/vues/bilan.js"></script>          (PR 1)
+ <script src="js/vues/synthese.js"></script>       (PR 2)
  <script src="js/vues/toutes.js"></script>
```
Conteneurs, après `<div class="progres pistes" id="pistes" hidden></div>` :
```html
  <div class="progres bilan" id="bilan" hidden></div>
  <div class="progres synthese" id="synthese" hidden></div>
```
Feuille de style : `<link rel="stylesheet" href="css/orientation.css">` après `css/pistes.css`. Aucun autre texte statique dans `index.html` (sinon il faudrait sa traduction).

### 4.5 `tests/placement.test.js`
- Liste des `require` en tête :
```js
['langues/en.js', 'langues/en-orientation.js', 'i18n.js', 'geo/hex.js', 'modele/schema.js', 'modele/demo.js', 'geo/placement.js', 'modele/regles.js', 'modele/stats.js', 'modele/bibliotheque.js', 'modele/bibliotheque-plus.js', 'modele/idees.js', 'modele/suggestions.js', 'modele/pistes.js', 'modele/creation.js', 'modele/boussole.js', 'modele/orientation-donnees.js', 'modele/orientation.js', 'geo/horizon.js'].forEach((f) => {
```
- Test de la bibliothèque : titre `'la bibliothèque compte environ 300 compétences valides'` et borne `E.length >= 280 && E.length <= 330`.
- Rien d'autre ne change : le test « chaque T('…') a sa traduction » couvre automatiquement les nouvelles vues.

### 4.6 Commande de test
`node carte-du-talent/tests/placement.test.js && node carte-du-talent/tests/orientation.test.js` (mettre à jour le README de `carte-du-talent/` s'il cite la commande).

## 5. Écran « Mes pistes » (`js/vues/pistes.js`)

### 5.1 Ordre de la page
1. En-tête existant + 2 boutons sous le texte d'intro, dans `<div class="pistes-outils">` :
   - `bouton bouton-secondaire bouton-compact`, `data-action="bilan"`, icône `list-checks`, « Mon bilan d'acquis » (PR 1)
   - idem `data-action="synthese"`, icône `file-text`, « Ma synthèse (1 page) » (PR 2)
2. PR 2 : section plan (§5.6) si `CT.orientation.etatPlan(carte, Date.now())` n'est pas null (plan en cours ou fini), sinon carte « Ma prochaine compétence » (§5.5).
3. « Mes priorités » (inchangé).
4. Les cartes de pistes (§5.2 à 5.4).
5. PR 2 : bloc appel découverte (§8.2).
6. Note de bas de page : `<p class="note-source">* ` + `T(D.SOURCE_REVENU)` + `</p>` (PR 1).

### 5.2 Compétences manquantes (A + C), dans `carteDePiste`
Remplacer `<ul class="puces-manquantes">…` par une liste verticale, une ligne par compétence manquante `m` (entrée de bibliothèque), avec `f = CT.orientation.fiche(carte, m.id)` et `sur = CT.orientation.surLaCarte(carte, m)` :
```html
<ul class="liste-manquantes">
  <li class="manquante">
    <div class="manquante-ligne">
      <i data-lucide="{m.icone}"></i>
      <span class="manquante-nom">{m.nom}</span>
      <span class="manquante-meta">T('≈ {h} h · {niveau}', { h: f.duree.heures, niveau: f.facilite.libelle })</span>
      <!-- si sur && sur.statut est a_deleguer ou ressource : -->
      <span class="discret">T('Dans ta zone à déléguer')</span>
      <!-- sinon : -->
      <button type="button" class="bouton-deja" data-action="deja" data-valeur="{m.id}"><i data-lucide="check"></i>T('Je l\'ai déjà')</button>
    </div>
    <details class="fiche">
      <summary>T('Comment m\'y mettre ?')</summary>
      <p><i data-lucide="clock"></i>T('Temps estimé : {duree}', { duree: T(f.duree.libelle) })</p>
      <p><i data-lucide="gauge"></i>T('Pour toi : {niveau}', { niveau: f.facilite.libelle }) <span class="discret">{f.facilite.raison}</span></p>
      <h5>T('Pour commencer')</h5>
      <ol class="premieres-actions"><li>{f.actions[0]}</li><li>…</li><li>…</li></ol>
      <!-- PR 2 seulement : -->
      <button type="button" class="bouton bouton-secondaire bouton-compact" data-action="plan" data-valeur="{m.id}"><i data-lucide="rocket"></i>T('Me lancer sur 30 jours')</button>
    </details>
  </li>
</ul>
```
Note : `f.duree.libelle` est le texte français de `DUREES` ; l'envelopper dans `T()` à l'affichage. `f.facilite.libelle`, `f.facilite.raison` et `f.actions` sont déjà traduits. Garder ouverts les `<details>` ouverts quand l'écran se redessine (même technique que `panneau.js` : mémoriser les `summary` ouverts par `data-valeur` du `li`, ici `li[data-entree="{m.id}"]`).

### 5.3 Infos de la piste (E), juste après la barre `.progression`
Avec `i = CT.orientation.infosPiste(e.piste)` :
```html
<dl class="piste-infos">
  <div><dt><i data-lucide="briefcase"></i>T('Statut possible')</dt><dd>{i.statutLibelle}</dd></div>
  <div><dt><i data-lucide="wallet"></i>T('Revenu indicatif')</dt><dd title="{i.note}">{i.revenu}<sup>*</sup></dd></div>
  <div><dt><i data-lucide="sparkles"></i>T('Exemple')</dt><dd>{i.exemple}</dd></div>
</dl>
```
`i.note` est aussi affichée sous le revenu en `<span class="discret">` (lisible sur mobile, où le `title` ne sert à rien).

### 5.4 « Ton talent ici » (H), avant « Ce qui la justifie »
Avec `l = CT.orientation.lienTalent(carte, e)` :
```html
<div class="piste-bloc piste-talent niveau-{l.niveau}">
  <h4>T('Ton talent ici')</h4>
  <p class="puce-etat puce-alignement"><i data-lucide="target"></i>{l.libelle}</p>
  <p>T('Talent mobilisé : {talent}', { talent: l.talent })</p>                      ← si l.talent
  <p>T('Sous-talents utilisés : {liste}', { liste: l.sousTalents.join(T(', ')) })</p>  ← si l.sousTalents.length
  <p>T('Moment de flow qui s\'y retrouve : « {moment} »', { moment: l.moment })</p>  ← si l.moment
  <p class="discret">{l.conseil}</p>                                                  ← si l.conseil
</div>
```

### 5.5 « Ma prochaine compétence » (F, PR 2)
État de vue (non enregistré) : `let ecartees = []`, remis à `[]` à l'ouverture de l'écran. `p = CT.orientation.prochaine(carte, ecartees)`.
```html
<section class="carte-progres carte-large prochaine">
  <h3><i data-lucide="compass"></i> T('Ma prochaine compétence')</h3>
  <p class="discret">T('La compétence qui fait avancer le plus de pistes, avec le moins d\'effort.')</p>
  <!-- si p : -->
  <p class="prochaine-nom"><i data-lucide="{p.entree.icone}"></i><strong>{p.entree.nom}</strong>
     <span class="manquante-meta">T('≈ {h} h · {niveau}', …)</span></p>
  <p>Tn(p.pistes.length, 'Elle fait avancer {n} piste :', 'Elle fait avancer {n} pistes :')</p>
  <ul class="prochaine-pistes"><li>T('{piste} (+{gain} %)', { piste: x.piste.nom, gain: x.gain })</li> … (4 au plus)</ul>
  <div class="piste-actions">
    <button class="bouton bouton-principal bouton-compact" data-action="plan" data-valeur="{id}"><i data-lucide="rocket"></i>T('Me lancer sur 30 jours')</button>
    <button class="bouton bouton-secondaire bouton-compact" data-action="deja" data-valeur="{id}"><i data-lucide="check"></i>T('Je l\'ai déjà')</button>
    <button class="bouton-lien" data-action="autre-idee" data-valeur="{id}"><i data-lucide="shuffle"></i>T('Une autre idée')</button>
  </div>
  <!-- si null : -->
  <p class="vide">T('Pas d\'autre idée pour l\'instant : tu as déjà de quoi avancer !')</p>
</section>
```
`autre-idee` est géré dans la vue (pas dans app.js) : `ecartees.push(valeur); rendre();`.

### 5.6 « Mon plan sur 30 jours » (G, PR 2)
Avec `s = CT.orientation.etatPlan(carte, Date.now())` :
```html
<section class="carte-progres carte-large plan-30">
  <h3><i data-lucide="flag"></i> T('Mon plan sur 30 jours')</h3>
  <p class="plan-nom">T('Plan : {nom}', { nom: s.competence.nom })</p>
  <p class="discret">T('Jour {j} sur 30 · {n} actions sur 12', { j: Math.min(30, s.jours + 1), n: s.faites })</p>
  <div class="progression"><span style="width:{round(100 × s.progression)}%"></span></div>
  <p class="discret">T('Les 30 jours sont passés, ton plan reste ouvert : avance à ton rythme.')</p>  ← si s.depasse
  <!-- 4 semaines -->
  <div class="plan-semaine{ i+1 === s.semaine ? ' semaine-en-cours' : '' }">
    <h4>{semaine.titre}</h4>
    <label class="action-plan"><input type="checkbox" data-action="cocher" data-valeur="{i*3+k}" {checked}> <span>{texte}</span></label> ×3
  </div>
  <!-- si s.fini : -->
  <p class="plan-fini"><i data-lucide="sparkles"></i>T('Plan terminé, bravo !')</p>
  <div class="piste-actions">
    <button data-action="deja" data-valeur="{s.entree.id}" class="bouton bouton-principal bouton-compact">T('Je l\'ai déjà')</button>  ← si fini et compétence pas encore conquise
    <button data-action="nouveau-plan" class="bouton bouton-secondaire bouton-compact"><i data-lucide="rocket"></i>T('Lancer ma prochaine compétence')</button>  ← si fini
  </div>
  <button class="bouton-lien bouton-lien-discret" data-action="arreter-plan">T('Arrêter ce plan')</button>   ← si pas fini
</section>
```
Les cases à cocher déclenchent le `click` déjà écouté par la vue (`closest('[data-action]')`) ; l'écran se redessine depuis le modèle.

### 5.7 Actions (dans `actionPistes` de `app.js`)
| data-action | Effet | Message (`toast`) |
|---|---|---|
| `deja` | `r = CT.orientation.marquerAcquise(carte, valeur)` ; si `r && !r.deja` : `appliquer()`, effet `CT.vueEffets.conquete` sur `caseDe(r.c.id)` | `T('Bien vu ! « {nom} » rejoint tes territoires conquis. Tes pistes sont recalculées.', { nom: r.c.nom })` |
| `bilan` | `bilan.ouvrir()` | |
| `synthese` | `synthese.ouvrir()` | |
| `plan` | `CT.orientation.demarrerPlan(carte, valeur)` ; si `null` et plan en cours non fini : `confirm(T('Tu as déjà un plan en cours sur « {nom} ». Le remplacer ? Les actions cochées seront perdues.', { nom }))`, puis `arreterPlan` + `demarrerPlan`. Puis `appliquer()` | `T('C\'est parti pour 30 jours sur « {nom} » ! Ton drapeau monte à chaque action cochée.', { nom })` |
| `cocher` | `r = CT.orientation.cocherAction(carte, Number(valeur))` ; `appliquer()` ; « vient d'être cochée » = `carte.plan.faites[valeur]` non nul après l'appel | si `r.vientDeFinir` : `T('Plan terminé, bravo ! « {nom} » peut passer en territoire conquis quand tu le sens.', { nom })` ; sinon si la case vient d'être cochée : `T('Action cochée : {n} sur 12.', { n: r.faites })` |
| `arreter-plan` | `confirm(T('Arrêter ce plan ? Le territoire reste en conquête sur ta carte.'))` puis `arreterPlan` + `appliquer()` | |
| `nouveau-plan` | `arreterPlan` + `appliquer()` (la carte « Ma prochaine compétence » réapparaît) | |

Dans la vue, `deja`, `plan`, `cocher` ne ferment pas l'écran (seul `voir` le ferme, comme aujourd'hui).

## 6. Bilan d'acquis (D, PR 1) : `js/vues/bilan.js` → `CT.vueBilan.creer(racine, rappels)`

Même mécanique que `vues/pistes.js` (`ouvrir`, `fermer`, `rendre`, focus, Échap), dans `#bilan`, page `<div class="progres-page" role="dialog" aria-modal="true" aria-labelledby="bilan-titre">`.

Contenu :
- En-tête : surtitre `<i data-lucide="list-checks"></i> T('Bilan d\'acquis')`, `<h2 id="bilan-titre">T('Ce que tu sais déjà faire')</h2>`, intro `T('Coche tout ce que tu as déjà fait plusieurs fois, au travail, en association ou dans ta vie perso. Pas besoin d\'être expert·e : si tu sais le faire, ça compte.')`, bouton fermer.
- Pour chaque famille de `CT.orientation.bilan(carte)` : `<fieldset class="bilan-famille"><legend><i data-lucide="{icone}"></i>{titre}</legend>` puis une case par item :
  - `acquis` : `<label class="choix-bilan acquis"><input type="checkbox" checked disabled> <i icône></i> {nom} <span class="discret">T('Déjà sur ta carte')</span></label>`
  - `horsJeu` : pas affiché
  - sinon : `<label class="choix-bilan"><input type="checkbox" name="bilan" value="{id}"> <i icône></i> {nom}</label>`
- Champ libre : `<label for="bilan-libre">T('Autre chose que tu sais faire ?')</label><input id="bilan-libre" type="text" maxlength="200" placeholder="T('Ex. : Animer une formation, Préparer un cours')"><p class="aide">T('Sépare par des virgules (5 au plus).')</p>`
- Pied collant : compteur `Tn(n, '{n} compétence cochée', '{n} compétences cochées')` (mis à jour sur `change`, sans redessiner), bouton principal `T('Ajouter à ma carte')` (désactivé si rien n'est coché et le champ est vide), bouton secondaire `T('Plus tard')`.

Rappels vers `app.js` :
- `ajouter(ids, libres)` : `n = CT.orientation.appliquerBilan(etat.carte, ids, libres)` puis **un seul** `appliquer()`, fermer, `toast(Tn(n, '{n} compétence rejoint ta carte. Regarde comme ton territoire s\'agrandit !', '{n} compétences rejoignent ta carte. Regarde comme ton territoire s\'agrandit !'))`. `libres` = `champ.value.split(',')`.
- `plusTard()` : `CT.orientation.reporterBilan(etat.carte)`, `appliquer()`, fermer, `toast(T('C\'est noté. Tu pourras faire ton bilan à tout moment depuis Mes pistes.'))`. Fermer par la croix ou Échap = « Plus tard ».

Ouverture automatique : dans le clic sur `#btn-pistes`, après `pistes.ouvrir()`, `if (CT.orientation.doitProposerBilan(etat.carte)) bilan.ouvrir();` (le bilan passe par-dessus Mes pistes : `#bilan` est après `#pistes` dans le DOM). Il s'ouvre donc une seule fois par carte, puis seulement via « Mon bilan d'acquis ».

## 7. Carte : terres à découvrir et drapeau du plan (PR 2)

### 7.1 Calcul (`app.js`, fin de `calculerFantomes`)
```js
etat.horizon = etat.carte.preferences.horizon ? CT.horizon.disposer(etat.carte, etat.affichage.placement) : null;
etat.parCase = new Map(etat.affichage.placement.cases.map((c) => [c.id, c]));
if (etat.horizon) etat.horizon.tuiles.forEach((t) => etat.parCase.set(t.id, t));
```
Le placement (`etat.placement`) ne reçoit jamais les tuiles de l'horizon : `verifier()` et les positions ne changent pas.

### 7.2 Dessin (`js/vues/carte.js`)
- Signature : `rendre(svg, carte, placement, horizon)` (4e argument facultatif). Retour : `{ cadre, cadreTerres }`.
  - `cadreTerres` = le cadre actuel (terres + marge), inchangé. La rose des vents reste calée sur `cadreTerres`.
  - `cadre` = `cadreTerres` agrandi pour contenir aussi les tuiles et étiquettes de l'horizon (même marge `T * 2.2`). Sans horizon, `cadre === cadreTerres`.
- Calque `<g class="horizon" aria-label="T('Terres à découvrir autour de ta carte')">` dessiné **après** `plages` et **avant** `eclats` (pas de hauts-fonds ni de plage sous l'horizon : ce sont des terres « en mer »). Pour chaque tuile `t` (`e = CT.bibliotheque.trouver(t.entreeId)`, `coul = CT.schema.DOMAINES[t.domaine].couleur`, pixel `H.versPixel(t.q, t.r, T)`) :
```html
<g class="tuile tuile-horizon" data-id="hor:{id}" tabindex="0" role="button" aria-label="T('À découvrir : {nom}', { nom: e.nom })">
  <polygon class="dessus" points="{polygone(x, y, T*0.94)}" fill="#FFFDF5" fill-opacity=".5" stroke="{coul}" stroke-width="1.5" stroke-dasharray="2 5"/>
  {O.iconeSvg(e.icone, x, y - 20, 20, O.nuance(coul, -0.35), 2)}
  {texteTuile(e.nom, x, y - 6, '#5F6B70', 'nom nom-horizon')}
</g>
```
- Étiquettes de domaine : `<text class="etiquette etiquette-horizon" text-anchor="middle" fill="{O.nuance(coul, -0.45)}">{O.echapper(nom)}</text>` au pixel de `(q, r)` de chaque étiquette (`nom` est déjà traduit par `schema.js`).
- Drapeau du plan : dans le bloc `if (c.statut === 'frontiere')`, si `d = CT.orientation.drapeauPlan(carte, c.id)` existe, remplacer le rond-drapeau par :
```html
<g class="drapeau drapeau-plan" aria-hidden="true">
  <line x1="{x+18}" y1="{y-8}" x2="{x+18}" y2="{y-50}" stroke="#7A4A2A" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M{x+19} {hy} l16 5 l-16 5 Z" fill="#C2412D"/>      ← hy = (y - 18) - 28 × d.faites / d.total (monte de y-18 à y-46)
  <text x="{x+38}" y="{y-8}" font-size="10" font-weight="800" fill="#C2412D">{d.faites}/12</text>
</g>
```
  et l'`aria-label` de la tuile devient `T('{nom}, plan sur 30 jours : {n} actions sur 12', { nom: c.nom, n: d.faites })`. Le numéro de priorité n'est plus affiché sur cette tuile (elle est n°1).

### 7.3 Navigation (`app.js` → `js/vues/navigation.js`)
- `app.js` `rendre()` : `const { cadre, cadreTerres } = CT.vueCarte.rendre($('carte'), etat.affichage.carte, etat.affichage.placement, etat.horizon);` puis `navigation.majCadre(cadre, { ajuster: …, marges: marges(), cadreAjuster: cadreTerres });`
- `navigation.majCadre(nouveauCadre, opts)` mémorise `cadreAjuster = (opts && opts.cadreAjuster) || nouveauCadre` ; `ajuster()` cadre sur `cadreAjuster` (la carte reste au centre de l'écran à l'ouverture et avec le bouton « Voir toute la carte »), le défilement et le dézoom maximal restent bornés par `cadre` (on peut aller voir l'horizon).

### 7.4 Interaction et panneau
- `app.js` : `estDeplacable: (id) => id !== 'capitale' && !id.startsWith('sugg:') && !id.startsWith('hor:')`. Le contexte du panneau reçoit `horizon: () => (etat.horizon ? etat.horizon.tuiles : [])`.
- `js/vues/panneau.js`, dans `afficher` : branche `else if (id.startsWith('hor:'))` → tuile introuvable : `this.fermer()` ; sinon `html = contenuHorizon(carte, tuile)` :
```html
{teteSuggestions(e.nom, CT.schema.DOMAINES[e.domaine].nom, T('Terre à découvrir'), e.icone)}
<div class="panneau-corps"><section class="panneau-section">
  <p><i data-lucide="clock"></i>T('Temps estimé : {duree}', …)</p>
  <p><i data-lucide="gauge"></i>T('Pour toi : {niveau}', …) <span class="discret">{raison}</span></p>
  <h3 class="sous-titre">T('Pour commencer')</h3><ol class="premieres-actions">…3…</ol>
  <h3 class="sous-titre">T('Pistes que ça fait avancer')</h3>
  <ul> T('{piste} : {pct} % (+{gain} %)', { piste, pct: pourcentage, gain }) … </ul>   ← CT.orientation.pistesPour(carte, id, 3)
  <p class="discret">T('Aucune piste ne la demande pour l\'instant : c\'est une envie, et c\'est une très bonne raison.')</p>  ← si aucune
  <div class="actions">
    <button class="bouton bouton-principal" data-action="horizon-plan" data-valeur="{id}"><i data-lucide="rocket"></i>T('Me lancer sur 30 jours')</button>
    <button class="bouton bouton-secondaire" data-action="horizon-deja" data-valeur="{id}"><i data-lucide="check"></i>T('Je l\'ai déjà')</button>
    <button class="bouton bouton-secondaire" data-action="horizon-plus-tard" data-valeur="{id}">T('Plus tard (à conquérir)')</button>
    <button class="bouton bouton-secondaire" data-action="refuser" data-valeur="{id}">T('Pas pour moi')</button>
  </div>
</section></div>
```
- `app.js` `surActionPanneau` : avant `if (!id || id === 'capitale') return;`, `if (actionHorizon(action, valeur)) return;` avec :
  - `horizon-deja` → `marquerAcquise` (même message que §5.7) ;
  - `horizon-plan` → même logique que `plan` (§5.7) ;
  - `horizon-plus-tard` → `CT.suggestions.accepter(carte, valeur, { statut: 'a_conquerir' })` **sans** `position` (sinon la compétence resterait au large), message existant `T('{nom} rejoint tes territoires à conquérir.', …)` ;
  - `refuser` existe déjà (la tuile disparaît de l'horizon puisque `disponibles()` exclut les refus).
  - Après chacune : `appliquer()`, fermer le panneau, puis `navigation.rendreVisible(c.id, zoneLibre())` pour suivre la nouvelle tuile sur le continent, avec l'effet `exploration` (ou `conquete` pour « Je l'ai déjà »).

### 7.5 Réglages et légende
- `js/vues/reglages.js`, section « Affichage de la carte », après l'interrupteur du brouillard, même balisage : titre `T('Terres à découvrir')`, aide `T('Afficher autour de ta carte les compétences que tu n\'as pas encore explorées.')`, `<input type="checkbox" role="switch" id="reglage-horizon">`, initialisé depuis `carte.preferences.horizon`, `change` → `rappels.changerPreference('horizon', coche)`.
- `app.js` `changerPreference` : si `cle === 'horizon'`, `toast(valeur ? T('Terres à découvrir affichées autour de ta carte.') : T('Terres à découvrir masquées.'))`.
- `js/vues/legende.js`, dans `reperes` : si `carte.preferences.horizon`, pastille `pastille('#FFFDF5', '#B59A8A', '1.5 2')` + `T('Terre à découvrir')` ; si `carte.plan`, une pastille drapeau (petit `svg` avec mât et triangle `#C2412D`) + `T('Drapeau qui monte : ton plan sur 30 jours')`.

## 8. Synthèse d'une page et appel découverte (I, PR 2)

### 8.1 `js/vues/synthese.js` → `CT.vueSynthese.creer(racine, rappels)`
Même mécanique d'ouverture que les autres écrans, dans `#synthese`. `rappels` : `carte()`, `placement()` (renvoie `etat.placement`, sans fantômes ni horizon). Avec `s = CT.orientation.synthese(carte, Date.now())` :
```html
<div class="progres-page synthese-ecran" role="dialog" aria-modal="true" aria-labelledby="synthese-titre">
  <header class="progres-tete synthese-actions">
    <div><p class="surtitre"><i data-lucide="file-text"></i> T('Ma synthèse')</p></div>
    <button class="bouton bouton-principal bouton-compact" data-action="imprimer"><i data-lucide="printer"></i>T('Imprimer ou enregistrer en PDF')</button>
    <button class="fermer" data-action="fermer" aria-label="T('Fermer')"><i data-lucide="x"></i></button>
  </header>
  <article class="synthese-page">
    <h1 id="synthese-titre">T('Ma Carte du Talent')</h1>
    <p class="synthese-talent"><strong>{s.talent}</strong> · {T('Fil rouge : {texte}', …) si filRouge}</p>
    <p class="discret">T('Fait le {date}', { date: s.date.toLocaleDateString(langue fr ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) })</p>
    <svg class="synthese-carte" xmlns="http://www.w3.org/2000/svg"></svg>
    <h2>T('Mes 3 pistes')</h2>
    <ol class="synthese-pistes"> pour chaque x de s.pistes :
      <li><strong>{x.evaluation.piste.nom}</strong> · T('Correspondance : {n} %', { n }) · {x.lien.libelle}
          <br>{x.infos.statutLibelle} · {x.infos.revenu}*
          <br><span class="discret">T('Compétences manquantes') : 3 premières manquantes, séparées par T(', ')</span></li>
    </ol>
    <h2>T('Ma prochaine compétence')</h2>
    <p>si s.plan : T('Plan en cours : {nom}, {n} actions sur 12', { nom: s.plan.competence.nom, n: s.plan.faites })
       sinon si s.prochaine : <strong>{nom}</strong> · T('≈ {h} h · {niveau}', …) puis <ol> des 3 premières actions </ol></p>
    <aside class="synthese-appel">
      <h2>T('Envie d\'en parler ?')</h2>
      <p><strong>T('Appel découverte · 1 heure · offert')</strong></p>
      <p>T('Tu arrives avec ta carte et tes pistes. On regarde ensemble celle qui te met vraiment dans le flow, et par où commencer.')</p>
      <a class="bouton bouton-principal ecran-seul" href="{CT.orientation.urlAppel('synthese')}" target="_blank" rel="noopener"><i data-lucide="calendar-check"></i>T('En parler avec Pierre')</a>
      <p class="impression-seule">T('Réserve ton appel découverte : {url}', { url: 'calendly.com/pierre-j-sarazin' })</p>
    </aside>
    <p class="note-source">* {s.source}</p>
    <footer>T('Carte du Talent · Magic Humans · magichumans.com')</footer>
  </article>
</div>
```
Carte : après injection du HTML, `const { cadreTerres } = CT.vueCarte.rendre(svg, carte, rappels.placement(), null)` puis `svg.setAttribute('viewBox', [cadreTerres.x, cadreTerres.y, cadreTerres.l, cadreTerres.h].join(' '))` et `preserveAspectRatio="xMidYMid meet"`. Pas d'horizon sur la synthèse. `imprimer` → `window.print()`.

### 8.2 Appel découverte dans « Mes pistes »
En bas de la liste des pistes :
```html
<section class="carte-progres carte-large cta-appel">
  <h3><i data-lucide="calendar-check"></i> T('Envie d\'en parler ?')</h3>
  <p><strong>T('Appel découverte · 1 heure · offert')</strong></p>
  <p>T('Tu arrives avec ta carte et tes pistes. On regarde ensemble celle qui te met vraiment dans le flow, et par où commencer.')</p>
  <a class="bouton bouton-principal" href="{CT.orientation.urlAppel('pistes')}" target="_blank" rel="noopener">T('En parler avec Pierre')</a>
</section>
```
Ne pas créer d'autre URL : toujours `CT.orientation.urlAppel(…)` (une seule source, `APPEL_DECOUVERTE`).

## 9. Textes de l'interface (FR exact → EN)

Toutes ces paires sont déjà dans `js/langues/en-orientation.js`. Les textes des données (noms des 117 compétences, durées, actions, plan, familles du bilan, statuts, revenus, 83 exemples de profils) y sont aussi, et `orientation.test.js` vérifie qu'aucun ne manque. Rappel : `{…}` = variable de `T()` ; les messages au pluriel passent par `Tn()`.

**Modèle (`orientation.js`, déjà codé)**

| Français (exact) | English |
|---|---|
| Facile pour toi | Easy for you |
| Accessible | Within reach |
| Exigeant | Demanding |
| Très alignée avec ton talent | Strongly aligned with your talent |
| En partie alignée avec ton talent | Partly aligned with your talent |
| Peu alignée avec ton talent | Weakly aligned with your talent |
| Tu t'appuies sur {noms}. | You can build on {noms}. |
| Tu connais déjà le domaine {domaine}. | You already know the {domaine} field. |
| Nouveau territoire pour toi : compte un peu plus de temps, c'est normal. | New territory for you: allow a bit more time, that's normal. |
| Elle te demandera surtout des compétences, moins ton plaisir naturel. Vérifie qu'elle te donne envie avant de foncer. | It will call mostly on skills, less on what you naturally enjoy. Check that it excites you before going for it. |

**Mes pistes, prochaine compétence, plan, appel**

| Français (exact) | English |
|---|---|
| Je l'ai déjà | I already have it |
| Comment m'y mettre ? | How do I start? |
| Dans ta zone à déléguer | In your zone to delegate |
| ≈ {h} h · {niveau} | ≈ {h} h · {niveau} |
| Temps estimé : {duree} | Estimated time: {duree} |
| Pour toi : {niveau} | For you: {niveau} |
| Pour commencer | To get started |
| Me lancer sur 30 jours | Start a 30-day plan |
| Statut possible | Possible status |
| Revenu indicatif | Indicative income |
| Exemple | Example |
| Ton talent ici | Your talent here |
| Talent mobilisé : {talent} | Talent at work: {talent} |
| Sous-talents utilisés : {liste} | Sub-talents used: {liste} |
| Moment de flow qui s'y retrouve : « {moment} » | Flow moment you'll find here: “{moment}” |
| Ma prochaine compétence | My next skill |
| La compétence qui fait avancer le plus de pistes, avec le moins d'effort. | The skill that moves the most paths forward, for the least effort. |
| Elle fait avancer {n} piste : | It moves {n} path forward: |
| Elle fait avancer {n} pistes : | It moves {n} paths forward: |
| {piste} (+{gain} %) | {piste} (+{gain}%) |
| Une autre idée | Another idea |
| Pas d'autre idée pour l'instant : tu as déjà de quoi avancer ! | No other idea for now: you already have plenty to work with! |
| Mon plan sur 30 jours | My 30-day plan |
| Plan : {nom} | Plan: {nom} |
| Jour {j} sur 30 · {n} actions sur 12 | Day {j} of 30 · {n} of 12 actions |
| Les 30 jours sont passés, ton plan reste ouvert : avance à ton rythme. | The 30 days are over, your plan stays open: go at your own pace. |
| Plan terminé, bravo ! | Plan complete, well done! |
| Arrêter ce plan | Stop this plan |
| Arrêter ce plan ? Le territoire reste en conquête sur ta carte. | Stop this plan? The territory stays in progress on your map. |
| Tu as déjà un plan en cours sur « {nom} ». Le remplacer ? Les actions cochées seront perdues. | You already have a plan running on “{nom}”. Replace it? Ticked actions will be lost. |
| C'est parti pour 30 jours sur « {nom} » ! Ton drapeau monte à chaque action cochée. | Here we go: 30 days on “{nom}”! Your flag rises with every action you tick. |
| Action cochée : {n} sur 12. | Action ticked: {n} of 12. |
| Plan terminé, bravo ! « {nom} » peut passer en territoire conquis quand tu le sens. | Plan complete, well done! “{nom}” can become a conquered territory whenever you feel ready. |
| Bien vu ! « {nom} » rejoint tes territoires conquis. Tes pistes sont recalculées. | Nice! “{nom}” joins your conquered territories. Your paths have been recalculated. |
| Lancer ma prochaine compétence | Start my next skill |
| Mon bilan d'acquis | My skills inventory |
| Ma synthèse (1 page) | My one-page summary |
| Envie d'en parler ? | Want to talk it over? |
| Appel découverte · 1 heure · offert | Discovery call · 1 hour · free |
| Tu arrives avec ta carte et tes pistes. On regarde ensemble celle qui te met vraiment dans le flow, et par où commencer. | Bring your map and your paths. Together we'll look at the one that truly puts you in flow, and where to start. |
| En parler avec Pierre | Talk it over with Pierre |

**Bilan d'acquis**

| Français (exact) | English |
|---|---|
| Bilan d'acquis | Skills inventory |
| Ce que tu sais déjà faire | What you already know how to do |
| Coche tout ce que tu as déjà fait plusieurs fois, au travail, en association ou dans ta vie perso. Pas besoin d'être expert·e : si tu sais le faire, ça compte. | Tick everything you've already done several times, at work, in a club or in your personal life. No need to be an expert: if you can do it, it counts. |
| Déjà sur ta carte | Already on your map |
| Autre chose que tu sais faire ? | Anything else you know how to do? |
| Ex. : Animer une formation, Préparer un cours | E.g. Running a training session, Preparing a lesson |
| Sépare par des virgules (5 au plus). | Separate with commas (5 max). |
| {n} compétence cochée | {n} skill ticked |
| {n} compétences cochées | {n} skills ticked |
| Ajouter à ma carte | Add to my map |
| Plus tard | Later |
| {n} compétence rejoint ta carte. Regarde comme ton territoire s'agrandit ! | {n} skill joins your map. Look how your territory is growing! |
| {n} compétences rejoignent ta carte. Regarde comme ton territoire s'agrandit ! | {n} skills join your map. Look how your territory is growing! |
| C'est noté. Tu pourras faire ton bilan à tout moment depuis Mes pistes. | Noted. You can do your inventory anytime from My paths. |

**Terres à découvrir, réglages, légende**

| Français (exact) | English |
|---|---|
| Terres à découvrir autour de ta carte | Lands to discover around your map |
| Terre à découvrir | Land to discover |
| À découvrir : {nom} | To discover: {nom} |
| Pistes que ça fait avancer | Paths it moves forward |
| {piste} : {pct} % (+{gain} %) | {piste}: {pct}% (+{gain}%) |
| Aucune piste ne la demande pour l'instant : c'est une envie, et c'est une très bonne raison. | No path needs it right now: it's something you want, and that's a very good reason. |
| Plus tard (à conquérir) | Later (to conquer) |
| Terres à découvrir | Lands to discover |
| Afficher autour de ta carte les compétences que tu n'as pas encore explorées. | Show the skills you haven't explored yet around your map. |
| Terres à découvrir affichées autour de ta carte. | Lands to discover are now shown around your map. |
| Terres à découvrir masquées. | Lands to discover are hidden. |
| Drapeau qui monte : ton plan sur 30 jours | Rising flag: your 30-day plan |
| {nom}, plan sur 30 jours : {n} actions sur 12 | {nom}, 30-day plan: {n} of 12 actions |

**Synthèse d'une page**

| Français (exact) | English |
|---|---|
| Ma synthèse | My summary |
| Imprimer ou enregistrer en PDF | Print or save as PDF |
| Ma Carte du Talent | My Talent Map |
| Mes 3 pistes | My 3 paths |
| Fait le {date} | Made on {date} |
| Plan en cours : {nom}, {n} actions sur 12 | Plan in progress: {nom}, {n} of 12 actions |
| Réserve ton appel découverte : {url} | Book your discovery call: {url} |
| Carte du Talent · Magic Humans · magichumans.com | Talent Map · Magic Humans · magichumans.com |

Textes existants réutilisés tels quels (déjà traduits) : « Fermer », « Mes pistes », « Compétences manquantes », « Correspondance : {n} % », « Fil rouge : {texte} », « Pas pour moi », « {nom} rejoint tes territoires à conquérir. », « , ».

## 10. CSS (`css/orientation.css`, nouveau)

- `.pistes-outils` : flex, wrap, gap 8px, margin-top 12px.
- `.liste-manquantes` : liste verticale sans puces, gap 6px. `.manquante` : bordure `1.5px dashed #D9C79B`, rayon 12px, fond `#FFFBF2`, padding 6px 10px (reprend le style des anciennes pastilles). `.manquante-ligne` : flex, align center, gap 8px, wrap. `.manquante-nom` : flex 1, font-weight 700. `.manquante-meta` : 13px, `var(--encre-douce)`.
- `.bouton-deja` : bouton discret en pilule, bordure `1.5px solid var(--accent-bouton)`, texte `var(--accent-fort)`, fond blanc, 13px, font-weight 800 ; survol fond `#FFF0F4`. Zone tactile ≥ 36px de haut.
- `.fiche summary` : 14px, `var(--accent-fort)`, curseur main. `.premieres-actions` : liste numérotée, 14px, gap 4px.
- `.piste-infos` : grille 3 colonnes (1 colonne sous 640px), `dt` 12px majuscules `var(--encre-douce)`, `dd` margin 0.
- `.piste-talent` : bordure gauche 4px ; `.niveau-fort` `var(--or)`, `.niveau-moyen` `#F2D488`, `.niveau-faible` `#D9D4CC`.
- `.prochaine`, `.plan-30` : fond `linear-gradient(135deg, #FFF8E1, #FFFDF6)`, bordure `#F2D488` (comme `.piste-visee`). `.semaine-en-cours h4` : `var(--accent-fort)`. `.action-plan` : flex, gap 8px, case à cocher 20px, `accent-color: var(--accent-bouton)` ; texte barré léger (`opacity .65`) quand coché (`:has(input:checked)`).
- `.cta-appel` : fond `#FFF0F4`, bordure `#F3C1CF`.
- `.note-source` : 12px, `var(--encre-douce)`, grid-column 1 / -1.
- Bilan : `.bilan-famille` sans bordure par défaut, `legend` 13px majuscules ; `.choix-bilan` grille 2 colonnes (1 sous 640px), cases 20px ; `.acquis` opacité .7 ; pied `.bilan-pied` `position: sticky; bottom: 0` fond `var(--papier)`.
- Carte : `.tuile-horizon { opacity: .78; cursor: pointer; } .tuile-horizon:hover, .tuile-horizon:focus { opacity: 1; }`, `.nom-horizon { font-size: 11px; }`, `.etiquette-horizon { font-size: 15px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; opacity: .7; }`. Le focus clavier suit la règle existante des tuiles.
- Synthèse : `.synthese-page` largeur max 794px (A4 à 96 dpi), fond blanc, padding 32px ; `.synthese-carte` hauteur 9cm, largeur 100 %, rayon 12px ; `.impression-seule { display: none; }`.
- Impression :
```css
@media print {
  @page { size: A4; margin: 12mm; }
  body > *:not(#synthese) { display: none !important; }
  #synthese, #synthese .progres-page { position: static !important; inset: auto; overflow: visible; background: #fff; box-shadow: none; transform: none; }
  .synthese-actions, .ecran-seul { display: none !important; }
  .impression-seule { display: block !important; }
  .synthese-page { padding: 0; max-width: none; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```
Pas de bleu marine : les seuls bleus restent ceux de la mer existante.

## 11. Contraintes de placement (ne rien casser)

1. `CT.placement.placer` n'est pas modifié. Les fonctions nouvelles n'ajoutent des compétences que par les chemins existants (`suggestions.accepter`, `regles.changerStatut`, `regles.ajouterCompetence`), puis un seul `appliquer()`.
2. « Je l'ai déjà » (une compétence) : aucun hexagone existant ne bouge, pas de trou, pas de groupe coupé. (L'alerte « Case isolée » que `verifier()` peut déjà donner sur la démo dans certains enchaînements est un comportement existant, toléré.)
3. Bilan : **une seule passe** (`appliquerBilan` puis un seul `appliquer()`), jamais 30 `appliquer()` successifs. Mesuré sur la démo et sur une carte créée : 0 hexagone déplacé, `verifier()` vide. Ajoutées une par une, la démo finit avec une case isolée.
4. Horizon : jamais dans `etat.placement`, jamais dans `c.position`. Accepter une terre à découvrir ne transmet pas sa case (la compétence se pose sur le continent, comme depuis la bibliothèque).
5. Plan : la compétence du plan est une frontière normale (priorité n°1) ; arrêter le plan ne la retire pas, la finir ne la conquiert pas automatiquement.
6. Les cartes enregistrées avant ce lot se relisent sans perte (`bilan: null`, `plan: null`, `horizon: true`).

## 12. Tests et critères d'acceptation

### 12.1 Automatiques (doivent être verts avant chaque PR)
- `node carte-du-talent/tests/placement.test.js` : toutes les sections existantes vertes (seule la borne de la bibliothèque change, §4.5), y compris « chaque T('…') a sa traduction » sur les nouvelles vues.
- `node carte-du-talent/tests/orientation.test.js` (fourni, 24 tests) : bibliothèque (301, pas de doublon de nom ni d'alias), données cohérentes (ids connus, 83 pistes renseignées, 30 compétences du bilan), traductions EN complètes des données ; fiche (temps, facilité, 3 actions pour les 301 compétences) ; « Je l'ai déjà » (piste qui monte, carte qui ne bouge pas, déléguée inchangée) ; bilan en une passe (0 déplacement, `verifier()` vide, enregistré) ; prochaine compétence (déterministe, « Une autre idée » différente, carte vide sans erreur) ; plan (frontière n°1, 4 × 3 actions, drapeau, fin à 12/12 sans conquête, 30 jours dépassés, arrêt, plan orphelin oublié) ; lien talent ; infos des pistes ; synthèse et URL ; horizon (chaque compétence une fois, cases uniques, ≥ 3 cases de la terre, déterministe, un secteur d'un seul tenant par domaine, accepter pose sur le continent) ; compatibilité des anciennes cartes.
- En PR 1, `horizon.js` est déjà présent (il ne dépend d'aucune vue) : les tests de l'horizon passent dès la PR 1.

### 12.2 Recette manuelle (FR puis EN, ordinateur et mobile 375px)
PR 1 :
- [ ] Première ouverture de « Mes pistes » sur une carte : le bilan s'ouvre ; « Plus tard » le ferme et il ne revient plus seul ; « Mon bilan d'acquis » le rouvre.
- [ ] Cocher 10 compétences + « Animer une conférence, Préparer un cours » : 12 ajouts (ou moins si déjà présentes), un seul message, la carte s'agrandit sans qu'aucun hexagone existant ne bouge.
- [ ] Une piste avec des compétences manquantes : « Je l'ai déjà » sur l'une, le % monte aussitôt, la compétence apparaît en territoire conquis sur la carte.
- [ ] « Comment m'y mettre ? » montre temps, facilité avec sa raison, 3 actions.
- [ ] Chaque piste montre statut, revenu avec astérisque, note, exemple ; la note de source est en bas de page.
- [ ] « Ton talent ici » : niveau, talent, sous-talents, moment de flow ; sur une piste peu alignée, le conseil s'affiche.
- [ ] En anglais : aucun texte français dans ces écrans (hors noms saisis par la personne).

PR 2 :
- [ ] À l'ouverture, la carte est cadrée comme avant (horizon hors champ) ; en dézoomant, une couronne de terres en pointillés entoure la carte, avec le nom des domaines ; aucune tuile ne chevauche la carte.
- [ ] Toucher une terre à découvrir ouvre le panneau (fiche + pistes) ; « Plus tard (à conquérir) » la pose sur le continent et la retire de l'horizon ; « Pas pour moi » la fait disparaître.
- [ ] Réglages : l'interrupteur « Terres à découvrir » masque / affiche l'horizon et s'enregistre.
- [ ] « Ma prochaine compétence » propose une compétence et ses pistes ; « Une autre idée » en propose une autre ; « Me lancer sur 30 jours » crée le plan.
- [ ] Le plan affiche 4 semaines × 3 actions ; cocher fait monter le drapeau sur la carte (n/12) ; recharger la page garde les coches ; à 12/12 « Plan terminé, bravo ! » ; « Arrêter ce plan » demande confirmation.
- [ ] « Ma synthèse (1 page) » : carte, 3 pistes, prochaine compétence ou plan, appel ; « Imprimer ou enregistrer en PDF » donne une seule page A4 lisible, couleurs comprises.
- [ ] « En parler avec Pierre » ouvre Calendly dans un nouvel onglet, avec `utm_content=pistes` ou `synthese`.

### 12.3 Définition de « fini »
Les deux commandes de test sont vertes, la recette de la PR est cochée, aucun tiret cadratin dans les textes ajoutés (`grep -rnP "\x{2014}" carte-du-talent/js/vues/bilan.js carte-du-talent/js/vues/synthese.js carte-du-talent/css/orientation.css` ne renvoie rien), pas de nouvelle dépendance.

## 13. Découpage en 2 PR

**PR 1 « Orientation pro : socle, bilan et pistes enrichies »**
- `git mv` des 6 fichiers prêts (§1).
- §4 en entier (sauf le `<script src="js/vues/synthese.js">`, en PR 2).
- `js/vues/bilan.js` (§6), §5.1 points 1 (bouton bilan) et 6, §5.2 (sans le bouton « Me lancer sur 30 jours »), §5.3, §5.4, action `deja` et `bilan` (§5.7), `css/orientation.css` (parties correspondantes).

**PR 2 « Orientation pro : carte, prochaine compétence, plan et synthèse »** (après fusion de la PR 1)
- §7 (horizon, drapeau, navigation, panneau, réglages, légende).
- §5.5, §5.6, bouton « Me lancer sur 30 jours » du §5.2, actions `plan`, `cocher`, `arreter-plan`, `nouveau-plan`, `synthese`.
- §8 (synthèse, appel), reste du CSS.

Si une seule session suffit, les deux PR peuvent partir de la même branche, dans cet ordre.

## 14. Hors périmètre

- Simulateur financier (revenus, charges, statut) : plus tard.
- Pas de compte, pas de serveur : tout reste dans le navigateur (localStorage + export JSON existant).
- Les revenus restent des ordres de grandeur, toujours affichés avec la mention d'estimation.

## 15. Prompt pour Claude Code

```
Lis docs/spec-orientation-pro.md en entier avant d'écrire du code : c'est le cahier des charges validé du lot « orientation pro » de carte-du-talent/.
Fais la PR 1 décrite au §13, et seulement elle.
1. git mv les 6 fichiers de docs/orientation-pro/ vers leurs destinations (§1). Ne les réécris pas, ne les reformate pas.
2. Applique les modifications exactes du §4, puis code les écrans des §5 et §6 avec les textes FR exacts du §9 (les traductions EN existent déjà).
3. Lance node carte-du-talent/tests/placement.test.js et node carte-du-talent/tests/orientation.test.js jusqu'à ce que tout soit vert.
4. Vérifie la recette PR 1 du §12.2 dans le navigateur, en FR et en EN.
Règles : tutoiement, aucun tiret cadratin, pas de bleu marine, pas de nouvelle dépendance, un seul appliquer() par geste.
Ouvre la PR sur une branche orientation-pro-1 avec un résumé court, sans la fusionner (Pierre fusionne).
Pour la PR 2, même consigne avec « PR 2 » à la place de « PR 1 », une fois la PR 1 fusionnée.
```
