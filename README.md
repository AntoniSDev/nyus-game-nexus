# Nyu’s Game Nexus

Un espace gaming personnel pour profiter de ses jeux, avec un jeu principal par genre et plusieurs candidats possibles. Interface française responsive, turquoise Miku × rose Madoka, sans illustrations officielles.

## Installation et développement

Node.js 22.12+ (ou 24) et npm sont nécessaires.

```sh
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite, avec le chemin `/nyus-game-nexus/`.

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

## GitHub Pages

Dans le dépôt GitHub, choisir **Settings → Pages → Source → GitHub Actions**. Le workflow `.github/workflows/deploy.yml` teste, construit et déploie à chaque push sur `main`, ou manuellement. Le chemin Vite est `/nyus-game-nexus/`.

Adresse attendue après activation et déploiement : https://antonisdev.github.io/nyus-game-nexus/.

## Organisation

`src/components/` : cartes, formulaires, dialogues ; `src/sections/` : dashboard ; `src/hooks/` : sauvegarde ; `src/types/` : schéma ; `src/data/` : roster initial ; `src/utils/` : validation et tests ; `src/styles/` : thème centralisé et responsive.

Les tests couvrent le roster, la sauvegarde/relecture, les collections vides, les imports invalides, les candidats par genre, les suppressions et les erreurs de stockage.
