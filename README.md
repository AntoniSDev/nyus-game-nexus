# Nyu’s Game Nexus

Un espace gaming personnel pour profiter de ses jeux, avec plusieurs jeux possibles par genre. Interface française responsive, turquoise / rose / violet, décors SVG originaux et jaquettes issues du catalogue communautaire SteamGridDB.

L’identité « Nyu’s personal gaming sanctuary » réunit Nyu, une fille chibi magique originale, un portail céleste et huit paysages décoratifs selon le genre. Le visage partagé `public/nyu-mark.svg` sert au logo, à la mascotte et aux favicons SVG/PNG ; `NyuCharacter.tsx` compose la silhouette du hero. Les illustrations sont locales et représentent le gameplay de la catégorie, indépendamment du jeu présent. Les couleurs et effets sont centralisés dans `src/styles/theme.css`. Les animations respectent `prefers-reduced-motion`. Les catégories personnalisées reçoivent un décor déterministe, stable pendant les recherches et filtres. Chaque catégorie est une section avec emblème, accent, ambiance et compteur ; même vide, elle propose l’ajout direct d’une aventure.

`GameCover.tsx` conserve toujours le SVG du genre en fond. Une jaquette automatique ou fournie par URL apparaît en vignette encadrée en bas à droite, dans un cadre identique pour portrait et paysage, sans recadrage (`object-fit: contain`). Le motif et sa légende se décalent ; le badge de statut reste en haut à gauche. Sans image ou en cas d’erreur, le décor reste visible avec une invitation à modifier la jaquette, sans cadre vide. Les anciennes cartes comme DOOM sans URL ne sont pas modifiées automatiquement : ouvrir leur formulaire puis « Trouver une jaquette » permet de choisir une image réelle du catalogue.

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

## Catalogue et secrets

Les Functions `functions/api/catalog/search.ts` et `artwork.ts` exposent uniquement des GET sous `/api/catalog/`. `server/catalog.ts` utilise l’API documentée de [SteamGridDB](https://www.steamgriddb.com/api/v2) pour les noms, identifiants et illustrations ; ce catalogue communautaire ne garantit pas des jaquettes officielles. Les auteurs sont crédités et liés à leur illustration. Les SVG de genre restent toujours visibles.

Configurer `STEAMGRIDDB_API_KEY` comme secret chiffré du projet Pages, dans Settings → Variables and Secrets, environnement Production. Preview nécessite son propre secret pour tester le catalogue sur une branche. Ne jamais utiliser une variable préfixée `VITE_`. La clé est lue uniquement via `context.env`, transmise dans l’en-tête Authorization côté serveur, jamais retournée ni journalisée. [Documentation des secrets Cloudflare](https://developers.cloudflare.com/pages/functions/bindings/#secrets).

La recherche accepte 2–160 caractères et au plus six résultats. Les jaquettes sont limitées à douze images statiques HTTPS du CDN SteamGridDB, avec les filtres du fournisseur. Les appels ont un timeout de huit secondes et leurs réponses réussies sont mises en cache quinze minutes dans le cache Cloudflare. Les erreurs d’authentification, de quota, de réseau et les résultats vides ont un message français et un recours manuel. La limite de trente requêtes par minute et IP est un garde-fou par instance, pas une limite globale distribuée ; un réglage WAF Cloudflare peut renforcer la protection. Aucune base de données.

Développement avec Functions : lancer `npm run build`, puis `npm run dev:api` pour servir `dist` sur le port 8788. Un fichier local `.dev.vars` ignoré par Git peut contenir les deux secrets. Sans secret, la Function concernée répond 503 et l’ajout manuel fonctionne. Pour recharger le frontend en direct, lancer aussi `npm run dev` : Vite relaie `/api` au serveur 8788. `npm run preview` sert uniquement les assets, sans Functions. Compilation serveur : `npx wrangler pages functions build --outdir .wrangler/functions-build`.

Le schéma 1 accepte les champs facultatifs `catalog`, `coverCredit`, `steam` sur les jeux et `steamProfile` sur la collection. Ce sont des extensions compatibles : une sauvegarde ancienne n’est ni migrée ni réécrite au chargement. Import/export valident et conservent ces champs. Les identifiants externes empêchent les doublons ; les champs personnels restent indépendants.

## Steam V5

Le bouton Steam ouvre `SteamLibrary.tsx`. Saisir une URL publique `https://steamcommunity.com/id/…`, `/profiles/…` ou un SteamID64. Charger la bibliothèque enregistre le profil ; aucun jeu n’est ajouté sans sélection explicite. Rechercher puis sélectionner jusqu’à dix jeux, choisir la catégorie des nouveaux jeux et ajouter/associer. Les jeux déjà liés par appId, ou les anciens jeux au nom exactement identique, sont associés sans changement de leurs ID, catégorie, statut, notes, progression, attente, jaquette ou date personnelle. Les nouveaux jeux peuvent recevoir une jaquette SteamGridDB via leur appId.

« Voir les succès » récupère les compteurs publics d’un jeu ; l’ajout/association ou l’actualisation les conserve avec leur propre date. « Actualiser les jeux liés » recharge les heures depuis Steam et applique les succès consultés, uniquement aux jeux déjà associés au même profil, sans ajouter toute la bibliothèque. Pas de synchronisation automatique en arrière-plan, d’authentification Steam, de base de données ou d’accès aux données privées. Les heures absentes restent inconnues ; une bibliothèque privée se distingue d’une bibliothèque publique vide. Les jeux sans succès ou les succès non accessibles affichent un état explicite.

Configurer **`STEAM_WEB_API_KEY`** comme secret chiffré Production, distinct de **`STEAMGRIDDB_API_KEY`**. Aucun autre secret n’est nécessaire pour cette V5. `server/steam.ts` appelle exclusivement `api.steampowered.com` avec la clé dans l’en-tête serveur `x-webapi-key`, jamais dans une URL, une réponse, les logs ou le bundle frontend. Les routes GET `/api/steam/library` et `/api/steam/achievements` valident les profils et appId, normalisent les réponses et les servent sans cache. Les redirections sont refusées, les appels expirent après dix secondes et le garde-fou de quota est partagé avec le catalogue. [Authentification Steam](https://partner.steamgames.com/doc/webapi_overview/auth), [bibliothèque publique](https://partner.steamgames.com/doc/webapi/IPlayerService), [succès](https://partner.steamgames.com/doc/webapi/ISteamUserStats).

## Version et fichiers

Le pied de page affiche la version de `package.json` et l’identifiant court du commit déployé. Cloudflare fournit cet identifiant via `CF_PAGES_COMMIT_SHA` ; en local, Vite utilise le commit Git courant (ou « local » sans Git). Mettre à jour la version du package et du lockfile lors d’une nouvelle version fonctionnelle.

`src/components/` : cartes, catalogue, formulaires, dialogues ; `src/sections/` : dashboard ; `src/hooks/` : sauvegarde ; `src/types/` : schéma ; `src/data/` : catégories initiales et ancien roster conservé pour les tests de compatibilité ; `src/utils/` : validation, client API et tests ; `src/styles/` : thème centralisé et responsive ; `functions/` : routes Cloudflare ; `server/` : intégration du fournisseur et tests.

Les tests couvrent les anciennes sauvegardes, la collection neuve vide, l’import/export, les erreurs de stockage, les doublons, l’association Steam sans altération des champs personnels, les profils privés/vides, les succès, la validation des cibles et la confidentialité des appels serveur. Exécuter `npm test` et `npm run build` avant livraison.
