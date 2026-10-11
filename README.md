# Nyu’s Game Nexus

Un espace gaming personnel pour profiter de ses jeux, avec un jeu principal par genre et plusieurs candidats possibles. Interface française responsive, turquoise Miku × rose Madoka, décors SVG originaux et jaquettes issues du catalogue communautaire SteamGridDB.

L’identité « Nyu’s personal gaming sanctuary » réunit un familier lunaire original, un portail céleste et huit paysages décoratifs selon le genre. Les illustrations sont des SVG locaux, sans requête externe, et représentent le gameplay de la catégorie, indépendamment du jeu présent. Les couleurs et effets sont centralisés dans `src/styles/theme.css`, les illustrations dans `SanctuaryArt.tsx`, `WorldArtwork.tsx` et `GenreMotif.tsx`. L’animation légère du familier est désactivée avec `prefers-reduced-motion`. Les catégories personnalisées reçoivent un décor déterministe, stable pendant les recherches et filtres.

`GameCover.tsx` conserve toujours le SVG du genre en fond. Une jaquette automatique ou fournie par URL apparaît en vignette encadrée en bas à droite, avec un format adapté aux images portrait ou paysage, sans recadrage. Le motif et sa légende se décalent pour laisser de la place à cette vignette ; le badge de statut reste en haut à gauche. Sans image ou en cas d’erreur, le SVG seul reste visible, sans cadre vide.

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

Le build frontend est produit dans `dist/`. React, TypeScript strict, Vite, Tailwind CSS et Lucide sont utilisés ; les appels au catalogue externe passent par Cloudflare Pages Functions. Aucun compte utilisateur ou base de données.

## Fonctionnalités

- Dashboard : statistiques réelles, recherche par nom, filtres combinables par statut et catégorie. Les jeux actifs sont ceux sélectionnés, en cours ou à poursuivre.
- Jeux : ajout, modification, suppression confirmée, huit statuts, progression libre, notes, attente précisée, date de modification et jaquette URL optionnelle avec fallback.
- Catégories : création, renommage, suppression confirmée lorsqu’elles sont vides. Déplacer les jeux avec leur formulaire avant de supprimer une catégorie occupée.
- Les nouveaux utilisateurs commencent avec zéro jeu et les huit catégories de genre. Les collections existantes sont conservées sans réinitialisation. Aucune progression ni URL n’est inventée.
- Ajout via le catalogue SteamGridDB : recherche différée, navigation au clavier, aperçus, jaquette automatique et choix parmi les illustrations disponibles. L’ajout manuel et l’URL personnelle restent disponibles.
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

## Catalogue V4 et secrets

Les Functions `functions/api/catalog/search.ts` et `artwork.ts` exposent uniquement des GET sous `/api/catalog/`. `server/catalog.ts` utilise l’API documentée de [SteamGridDB](https://www.steamgriddb.com/api/v2) pour les noms, identifiants et illustrations ; ce catalogue communautaire ne garantit pas des jaquettes officielles. Les auteurs sont crédités et liés à leur illustration. Les SVG de genre restent toujours visibles.

Configurer `STEAMGRIDDB_API_KEY` comme secret chiffré du projet Pages, dans Settings → Variables and Secrets, environnement Production. Preview nécessite son propre secret pour tester le catalogue sur une branche. Ne jamais utiliser une variable préfixée `VITE_`. La clé est lue uniquement via `context.env`, transmise dans l’en-tête Authorization côté serveur, jamais retournée ni journalisée. [Documentation des secrets Cloudflare](https://developers.cloudflare.com/pages/functions/bindings/#secrets).

La recherche accepte 2–160 caractères et au plus six résultats. Les jaquettes sont limitées à douze images statiques HTTPS du CDN SteamGridDB, avec les filtres du fournisseur. Les appels ont un timeout de huit secondes et leurs réponses réussies sont mises en cache quinze minutes dans le cache Cloudflare. Les erreurs d’authentification, de quota, de réseau et les résultats vides ont un message français et un recours manuel. La limite de trente requêtes par minute et IP est un garde-fou par instance, pas une limite globale distribuée ; un réglage WAF Cloudflare peut renforcer la protection. Aucune base de données.

Développement avec Functions : lancer `npm run build`, puis `npm run dev:api` pour servir `dist` sur le port 8788. Un fichier local `.dev.vars` ignoré par Git peut contenir `STEAMGRIDDB_API_KEY="…"`. Sans ce fichier, les Functions répondent 503 et l’ajout manuel fonctionne. Pour recharger le frontend en direct, lancer aussi `npm run dev` : Vite relaie `/api/catalog` au serveur 8788. `npm run preview` sert uniquement les assets, sans Functions. Compilation serveur : `npx wrangler pages functions build --outdir .wrangler/functions-build`.

Le schéma 1 accepte des champs facultatifs `catalog` (identité externe), `coverCredit` (identifiant d’image et auteur) et `steam` (appId, temps en minutes, compteurs de succès, date de synchronisation). Ce sont des extensions compatibles : une sauvegarde V3 n’est ni migrée ni réécrite au chargement. Import/export valident et conservent ces champs. L’identité externe empêche une nouvelle addition du même jeu ; les champs personnels restent indépendants. Le type `SteamProfileMetadata` prépare SteamID64 pour une future synchronisation, qui n’est pas encore implémentée.

## Version et fichiers

Le pied de page affiche la version de `package.json` et l’identifiant court du commit déployé. Cloudflare fournit cet identifiant via `CF_PAGES_COMMIT_SHA` ; en local, Vite utilise le commit Git courant (ou « local » sans Git). Mettre à jour la version du package et du lockfile lors d’une nouvelle version fonctionnelle.

`src/components/` : cartes, catalogue, formulaires, dialogues ; `src/sections/` : dashboard ; `src/hooks/` : sauvegarde ; `src/types/` : schéma ; `src/data/` : catégories initiales et ancien roster conservé pour les tests de compatibilité ; `src/utils/` : validation, client API et tests ; `src/styles/` : thème centralisé et responsive ; `functions/` : routes Cloudflare ; `server/` : intégration du fournisseur et tests.

Les tests couvrent le roster, la sauvegarde/relecture, les collections vides, les imports invalides, les candidats par genre, les suppressions et les erreurs de stockage.
