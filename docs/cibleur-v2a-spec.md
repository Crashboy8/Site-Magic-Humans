# Le Cibleur V2a : navigation, historique, export, honnêteté

Objectif : depuis n'importe où, atteindre en un clic n'importe quelle partie (étapes précédentes, offre, chaque cible et ses blocs, approfondissements, anti-cible, plan, hypothèses, appel), sans jamais perdre de travail.

Pas de nouvel appel à l'IA. Le niveau de réflexion Gemini reste celui par défaut. Le lien Calendly ne transmet pas la cible.

## 4.1 Barre d'étapes cliquable

- `IndicateurEtapes` est un `<nav aria-label="Étapes">` avec une liste ordonnée de 5 boutons : Ton talent, Ton terrain, Précisions, Esquisse, Résultat.
- Étape terminée : bouton actif. Étape en cours : `aria-current="step"`. Étape pas encore atteinte : `disabled`. Étape « Précisions » sautée par l'IA : affichée « sautée », non cliquable.
- Sur mobile (moins de 640 px) : les 5 pastilles restent, le libellé de l'étape courante est en dessous, chaque pastille fait au moins 44 x 44 px.
- Revenir à une étape ne modifie rien. Si un résultat existe, un bandeau s'affiche : « Tu relis une étape précédente. Ton résultat est gardé tant que tu ne changes rien. » avec le bouton « Revenir à mon résultat ».
- Si la personne modifie le talent ou le terrain alors qu'un résultat existe, le bandeau devient : « Tu as changé tes réponses. Ton résultat actuel est rangé dans ton historique, tu le retrouves quand tu veux. » Le résultat actuel est archivé au moment où le nouveau résultat arrive, pas avant.

## 4.2 Page résultat : sommaire collant

- Écran large (à partir de 1024 px) : deux colonnes. À gauche (260 px), un sommaire collant (`position: sticky; top: 16px`), à droite le contenu.
- Mobile et tablette : une barre collante en haut, qui apparaît quand l'en-tête du résultat sort de l'écran, avec le bouton « Aller à » qui ouvre la liste complète (panneau plein écran, fermeture par bouton et touche Échap).
- Entrées, dans l'ordre : Ton offre ; une entrée par cible (« 1. [nom] · 7,4/10 ») avec, pour la cible où l'on se trouve, ses sous-entrées (Qui c'est, Sa douleur probable, Ton offre pour elle, Où la rencontrer, LinkedIn, Messages, Test terrain) ; Anti-cible ; Plan 30 jours ; Ce que l'IA a supposé ; Parler avec Pierre.
- Suivi de lecture : l'entrée de la section visible est mise en avant (`IntersectionObserver`, `aria-current="true"`).
- Bouton flottant « Haut de page » après un écran de défilement.

## 4.3 Ancres et sections repliables

- Ancres stables : `#offre`, `#cible-1`, `#cible-1-douleur`, `#cible-1-lieux`, `#cible-1-messages`, `#cible-1-test` (rang 1 à 3), `#anti-cible`, `#plan`, `#hypotheses`, `#appel`.
- Clic dans le sommaire : défilement doux, l'adresse prend l'ancre (`history.replaceState`), le `<details>` visé s'ouvre.
- Ouvrir la page avec une ancre : la section et ses parents s'ouvrent et défilent à l'écran.
- Chaque carte cible : en-tête toujours visible (rang, nom, B2B/B2C, score, promesse, alerte plaisir), corps repliable. La carte prioritaire est dépliée par défaut, les autres repliées.
- Boutons « Tout déplier » et « Tout replier » en tête du résultat. L'impression déplie tout.

## 4.4 Historique (dans le navigateur)

- Clé `localStorage` `ma_cible_historique_v1` : 10 résultats au plus, du plus récent au plus ancien. Chaque entrée : `{ id, faitLe, entree, resultat, coches }`.
- Quand un nouveau résultat arrive, l'ancien résultat courant entre dans l'historique. Au-delà de 10, le plus ancien sort. Si l'écriture échoue, on retire le plus ancien et on réessaie une fois, sans jamais bloquer l'écran.
- Accueil et en-tête du résultat : lien « Mes résultats précédents (n) ». La liste montre la date, l'offre en une phrase, la cible prioritaire et son score.
- Ouvrir une entrée : lecture seule, même mise en page, bandeau « Résultat du [date] » avec « Reprendre ce résultat » et « Supprimer ».
- « Tout effacer » demande confirmation et efface le travail courant et l'historique. Le texte de confirmation le dit.

## 4.5 Export

- « Copier tout le résultat » : texte brut structuré (titres en majuscules, listes à puces « - »), prénom remplacé (`remplacerPrenom`).
- « Télécharger (.md) » : même contenu en Markdown, nom de fichier `le-cibleur-AAAA-MM-JJ.md`.
- Par carte : « Copier cette cible ».
- « Imprimer ou enregistrer en PDF » : inchangé.

## Libellés honnêtes

- « Sa douleur probable », pastille « Hypothèse de l'IA ».
- « Un cas imaginé pour illustrer ».
- Le prix et les quatre notes portent la pastille « Estimation de l'IA ».
- Texte de la pastille : « Proposé par l'IA à partir de tes réponses. À vérifier sur le terrain. »
- L'avertissement IA s'affiche aussi sous l'en-tête du résultat.

## Appel découverte

Encart juste après la carte prioritaire : « Tu veux qu'on regarde cette cible ensemble ? », « Appel découverte · 1 heure · offert », bouton « En parler avec Pierre ». Entrée « Parler avec Pierre » dans le sommaire. La section « Envie d'en parler ? » passe avant la Boussole. `utm_content` distincts : `resultat-apres-cible`, `resultat-sommaire`, `resultat-fin`. Aucune cible n'est transmise à Calendly.

## Validation tolérante

Un texte trop long est coupé à la dernière fin de phrase avant la limite, sinon au dernier espace, avec « … ». Un tableau trop long est tronqué. Un texte trop court reste une erreur seulement s'il est vide ou sous la moitié du minimum. Seules les erreurs de structure déclenchent une relance. Chaque réparation incrémente un compteur journalisé (`reparations`, sans contenu).
