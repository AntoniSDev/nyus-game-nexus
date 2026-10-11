# Nyu’s Game Nexus

Un espace gaming personnel pour profiter de ses jeux, avec un jeu principal par genre et plusieurs candidats possibles. Interface française responsive, turquoise Miku × rose Madoka, sans illustrations officielles.

L’identité « Nyu’s personal gaming sanctuary » réunit un familier lunaire original, un portail céleste et huit paysages décoratifs selon le genre. Les illustrations sont des SVG locaux, sans requête externe, et représentent le gameplay de la catégorie, indépendamment du jeu présent. Les couleurs et effets sont centralisés dans `src/styles/theme.css`, les illustrations dans `SanctuaryArt.tsx`, `WorldArtwork.tsx` et `GenreMotif.tsx`. L’animation légère du familier est désactivée avec `prefers-reduced-motion`. Les catégories personnalisées reçoivent un décor déterministe, stable pendant les recherches et filtres.

`GameCover.tsx` conserve toujours le SVG du genre en fond. Une jaquette fournie par URL apparaît en vignette encadrée en bas à droite, avec un format adapté aux images portrait ou paysage, sans recadrage. Le motif et sa légende se décalent pour laisser de la place à cette vignette ; le badge de statut reste en haut à gauche. Sans image ou en cas d’erreur, le SVG seul reste visible, sans cadre vide. Une future intégration de catalogue pourra fournir `coverUrl` sans changer cette présentation. La récupération automatique de jaquettes ne fait pas partie de cette passe UI.

Les motifs sont génériques : survie (refuge, forêt, feu), automatisation (machines, engrenage, convoyeur et flux), builds (cristaux reliés et synergies), exploration/colonie (îlot, village et découverte), FPS (cible, impulsion et mouvement), détente (lune, nuage et jardin), aventure (route et portail), Soulslike (arche, lame et braises).

## Installation et développement

Node.js 22.12+ (ou 24) et npm sont nécessaires.

```sh
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite à la racine `/`.

```sh
npm test
npm run build
npm run preview
```

Le build statique est produit dans `dist/`. React, TypeScript strict, Vite, Tailwind CSS et Lucide sont utilisés ; aucun serveur applicatif, compte ou API externe.

## Fonctionnalités

- Dashboard : statistiques réelles, recherche par nom, filtres combinables par statut et catégorie. Les jeux actifs sont ceux sélectionnés, en cours ou à poursuivre.
- Jeux : ajout, modification, suppression confirmée, huit statuts, progression libre, notes, attente précisée, date de modification et jaquette URL optionnelle avec fallback.
- Catégories : création, renommage, suppression confirmée lorsqu’elles sont vides. Déplacer les jeux avec leur formulaire avant de supprimer une catégorie occupée.
- Le roster exact de huit jeux est chargé seulement si aucune sauvegarde n’existe. Aucune progression ni URL n’est inventée.
- Export JSON et import validé avec aperçu et confirmation avant remplacement.

## Sauvegarde et limites

Les modifications réussies sont sauvegardées dans `localStorage`, sous `nyus-game-nexus.collection`, schéma version 1. L’export JSON contient toutes les catégories et tous les jeux. Les identifiants, statuts, types, dates, liens et références de catégories sont validés à l’import. Un fichier est limité à 10 Mo, 500 catégories et 10 000 jeux.

Une sauvegarde existante, même vide, n’est jamais remplacée par les exemples. Une sauvegarde corrompue ou d’une version inconnue bloque l’édition et reste intacte jusqu’à un import explicitement confirmé. Les erreurs de quota ou de permissions sont affichées ; la modification concernée n’est pas appliquée. Une future évolution du schéma devra prévoir une migration explicite.

Les données appartiennent au navigateur et à l’origine du site : pas de synchronisation entre appareils. Exporter régulièrement avant de vider les données du navigateur. Les jaquettes HTTP(S) sont chargées directement depuis l’URL indiquée ; leur disponibilité dépend de l’hébergeur. HTTPS est recommandé.

## Cloudflare Pages

Le projet Cloudflare Pages est connecté au dépôt GitHub. Les pushes sur la branche de production `main` déclenchent un nouveau déploiement.

- Commande de build : `npm run build`.
- Répertoire de sortie : `dist`.
- Répertoire racine : la racine du dépôt.
- Runtime : Node.js 22.12+ ou 24.

La base Vite est `/` : les CSS et JavaScript générés sont servis sous `/assets/`. Les SVG décoratifs sont intégrés dans les composants React et ne nécessitent aucun chemin de fichier externe. La navigation utilise les ancres de la page courante (`#` et `#collection`). Le workflow GitHub Pages a été supprimé ; le déploiement est géré par Cloudflare Pages.

## Organisation

Le pied de page affiche la version de `package.json` et l’identifiant court du commit déployé. Cloudflare fournit cet identifiant via `CF_PAGES_COMMIT_SHA` ; en local, Vite utilise le commit Git courant (ou « local » sans Git). Mettre à jour la version du package et du lockfile lors d’une nouvelle version fonctionnelle.

`src/components/` : cartes, formulaires, dialogues ; `src/sections/` : dashboard ; `src/hooks/` : sauvegarde ; `src/types/` : schéma ; `src/data/` : roster initial ; `src/utils/` : validation et tests ; `src/styles/` : thème centralisé et responsive.

Les tests couvrent le roster, la sauvegarde/relecture, les collections vides, les imports invalides, les candidats par genre, les suppressions et les erreurs de stockage.
